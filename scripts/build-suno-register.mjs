// Build the Suno register — every public song and playlist on Chan's two Suno
// accounts — from the last capture of Suno's public API.
//
//   suno/capture/latest.json          what Suno showed (scripts/capture-suno.mjs)
//   suno/capture/words.json           lyrics, song captions, playlist descriptions
//   suno/curation.yaml                hand-edited tags, keyed by Suno id
//   suno/accounts.yaml                hand-maintained account record, checked here
//
//   suno/songs.yaml                   GENERATED: accounts, summary, playlists, every song
//   suno/words.yaml                   GENERATED: the caption and lyrics of each song
//
// WHY A CAPTURE FILE:
//
// The network read is one script (capture-suno.mjs) and this one is a pure
// function of files, like the X and LinkedIn registers. It runs anywhere,
// including CI, and never contacts Suno.
//
// WHAT SURVIVES A REBUILD:
//
// songs.yaml is rewritten from the capture. Tags a person adds live in
// suno/curation.yaml. Counts follow the repo's standing rule: a number that
// measures reach (plays, likes, comments, followers) is kept at its historical
// maximum, so it never goes down on a rebuild. A song that was in the register
// and is missing from a COMPLETE capture is kept, marked `removedSeen`: it was
// unpublished or deleted on Suno.
//
// WHY TWO OUTPUT FILES:
//
// The lyrics run to several thousand lines. A reader who wants to know what
// Chan has made and how it is doing needs songs.yaml; a reader who wants a
// song's words opens words.yaml. Both are public on suno.com and both are
// tracked (Chan, 2026-10-09).
//
//   node scripts/build-suno-register.mjs [--check]
//
// --check      write nothing; exit 1 if songs.yaml or words.yaml would change or
//              accounts.yaml disagrees with the capture

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import { loadProfile } from "./lib/load-profile.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(repoRoot, "suno");
const CAPTURE = path.join(DIR, "capture", "latest.json");
const CAPTURE_WORDS = path.join(DIR, "capture", "words.json");
const CURATION = path.join(DIR, "curation.yaml");
const ACCOUNTS = path.join(DIR, "accounts.yaml");
const REGISTER = path.join(DIR, "songs.yaml");
const WORDS = path.join(DIR, "words.yaml");

const METRICS = ["plays", "likes", "comments"];
const TOP = 10;

const check = process.argv.includes("--check");
const fail = (msg) => {
  console.error(`build-suno-register: ${msg}`);
  process.exit(1);
};
const readYaml = (file) => (fs.existsSync(file) ? yaml.load(fs.readFileSync(file, "utf8")) : null);

if (!fs.existsSync(CAPTURE)) fail("no capture at suno/capture/latest.json: run `npm run capture:suno`");
const capture = JSON.parse(fs.readFileSync(CAPTURE, "utf8"));

const nzDate = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date(iso));
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86_400_000);
const at = (handle) => `@${handle}`;
const asOf = nzDate(capture.capturedAt);
const sum = (items, f) => items.reduce((n, item) => n + (f(item) ?? 0), 0);
const sortEntries = (object, compare) => Object.fromEntries(Object.entries(object).sort(compare));
const keysDesc = ([a], [b]) => (a < b ? 1 : -1);
const bySongsDesc = ([, a], [, b]) => b.songs - a.songs;

// -----------------------------------------------------------------------------
// What the last build knew, what a person tagged, what the profile data holds
// -----------------------------------------------------------------------------
const previous = readYaml(REGISTER) ?? {};
const previousSong = new Map((previous.songs ?? []).map((s) => [s.id, s]));
const previousPlaylist = new Map((previous.playlists ?? []).map((p) => [p.id, p]));
const previousAccount = new Map((previous.accounts ?? []).map((a) => [a.handle, a]));
const curation = readYaml(CURATION) ?? {};
const curatedPlaylists = curation.playlists ?? {};
const curatedSongs = curation.songs ?? {};

const profile = loadProfile();
const projectIds = new Set(profile.projects.map((p) => p.id));
const musicVideos = profile.films.filter((f) => f.kind === "music-video" && f.titleZh);

const notes = [];
const drift = [];

// -----------------------------------------------------------------------------
// accounts.yaml must agree with the capture
// -----------------------------------------------------------------------------
const kept = readYaml(ACCOUNTS)?.accounts ?? [];
for (const account of capture.accounts) {
  const mine = kept.find((a) => a.handle === at(account.handle));
  if (!mine) {
    drift.push(`${at(account.handle)} is in the capture and not in accounts.yaml`);
    continue;
  }
  for (const [key, value] of [["userId", account.userId], ["displayName", account.displayName], ["bio", account.bio]]) {
    if ((mine[key] ?? "") !== value) drift.push(`${at(account.handle)} ${key}: accounts.yaml has ${JSON.stringify(mine[key])}, Suno shows ${JSON.stringify(value)}`);
  }
}
for (const mine of kept) {
  if (!capture.accounts.some((a) => at(a.handle) === mine.handle)) drift.push(`${mine.handle} is in accounts.yaml and not in the capture: capture again`);
}

// -----------------------------------------------------------------------------
// Curation must point at things that exist
// -----------------------------------------------------------------------------
const capturedSongIds = new Set(capture.accounts.flatMap((a) => a.songs.map((s) => s.id)));
const capturedPlaylistIds = new Set(capture.accounts.flatMap((a) => a.playlists.map((p) => p.id)));
for (const id of Object.keys(curatedPlaylists)) {
  if (!capturedPlaylistIds.has(id) && !previousPlaylist.has(id)) fail(`curation.yaml tags playlist ${id}, which the register has never held`);
}
for (const id of Object.keys(curatedSongs)) {
  if (!capturedSongIds.has(id) && !previousSong.has(id)) fail(`curation.yaml tags song ${id}, which the register has never held`);
}
for (const [id, tags] of [...Object.entries(curatedPlaylists), ...Object.entries(curatedSongs)]) {
  for (const projectId of tags?.projectIds ?? []) {
    if (!projectIds.has(projectId)) fail(`curation.yaml ${id}: no project "${projectId}" in data/profile/`);
  }
}

// -----------------------------------------------------------------------------
// Playlists
// -----------------------------------------------------------------------------
const max = (now, before) => Math.max(now ?? 0, before ?? 0);
const playlistsOfSong = new Map();
const playlists = capture.accounts.flatMap((account) =>
  account.playlists.map((p) => {
    const before = previousPlaylist.get(p.id);
    const tags = curatedPlaylists[p.id] ?? {};
    for (const song of p.songs) {
      if (!playlistsOfSong.has(song.id)) playlistsOfSong.set(song.id, []);
      playlistsOfSong.get(song.id).push({ name: p.name, projectIds: tags.projectIds ?? [] });
    }
    const fromOther = p.songs.filter((s) => s.handle !== account.handle);
    return {
      id: p.id,
      account: at(account.handle),
      name: p.name,
      url: `https://suno.com/playlist/${p.id}`,
      songCount: p.songs.length,
      ...(p.seconds && { minutes: Math.round(p.seconds / 60) }),
      ...(fromOther.length && { fromOtherAccount: fromOther.length }),
      ...(tags.projectIds?.length && { projectIds: tags.projectIds }),
      ...(tags.note && { note: tags.note }),
      plays: max(p.plays, before?.plays),
      likes: max(p.likes, before?.likes),
      songs: p.songs.map((s) => ({ id: s.id, account: at(s.handle), title: s.title })),
    };
  }),
);

// -----------------------------------------------------------------------------
// Songs
// -----------------------------------------------------------------------------
const titleCount = new Map();
for (const account of capture.accounts) for (const s of account.songs) titleCount.set(s.title, (titleCount.get(s.title) ?? 0) + 1);

const live = capture.accounts
  .flatMap((account) =>
    account.songs.map((s) => {
      const before = previousSong.get(s.id);
      const tags = curatedSongs[s.id] ?? {};
      const inPlaylists = playlistsOfSong.get(s.id) ?? [];
      // A music video is matched by the song's exact title, and only when one song carries it.
      const film = titleCount.get(s.title) === 1 ? musicVideos.find((f) => f.titleZh === s.title) : null;
      const projects = [...new Set([...(film ? [film.projectId] : []), ...inPlaylists.flatMap((p) => p.projectIds), ...(tags.projectIds ?? [])])];
      const language = s.instrumental ? null : (tags.language ?? s.lyrics?.language ?? null);
      return {
        id: s.id,
        account: at(account.handle),
        title: s.title,
        ...(film && { titleEn: film.title }),
        url: `https://suno.com/song/${s.id}`,
        created: nzDate(s.createdAt),
        at: s.createdAt,
        model: s.model,
        seconds: Math.round(s.seconds ?? 0),
        ...(s.instrumental ? { instrumental: true } : { language, lyrics: s.lyrics ? { lines: s.lyrics.lines, chars: s.lyrics.chars } : null }),
        ...(s.explicit && { explicit: true }),
        ...(s.remix && { remix: true }),
        ...(s.pinned && { pinned: true }),
        ...(s.hasCaption && { hasCaption: true }),
        style: s.style,
        ...(s.displayTags && { displayTags: s.displayTags }),
        ...(inPlaylists.length && { playlists: inPlaylists.map((p) => p.name) }),
        ...(projects.length && { projectIds: projects }),
        ...(film && { filmId: film.id }),
        ...(tags.note && { note: tags.note }),
        metrics: Object.fromEntries(METRICS.map((k) => [k, max(s[k], before?.metrics?.[k])])),
        cover: s.imageUrl,
      };
    }),
  )
  .sort((a, b) => (a.at < b.at ? 1 : -1));

// A song the register held and a complete capture no longer lists.
const liveIds = new Set(live.map((s) => s.id));
const gone = [...previousSong.values()].filter((s) => !liveIds.has(s.id));
if (gone.length && !capture.complete) fail("the capture is incomplete, and songs are missing from it. Capture again.");
const removed = gone.map((s) => ({ ...s, removedSeen: s.removedSeen ?? asOf }));
const songs = [...live, ...removed].sort((a, b) => (a.at < b.at ? 1 : -1));

for (const film of musicVideos) {
  if (!live.some((s) => s.filmId === film.id)) notes.push(`music video "${film.id}" (${film.titleZh}) matches no public song`);
}

// -----------------------------------------------------------------------------
// Accounts and summary
// -----------------------------------------------------------------------------
const accounts = capture.accounts.map((account) => {
  const before = previousAccount.get(at(account.handle));
  const own = live.filter((s) => s.account === at(account.handle));
  return {
    handle: at(account.handle),
    url: `https://suno.com/@${account.handle}`,
    displayName: account.displayName,
    verified: account.verified,
    followers: max(account.stats.followers, before?.followers),
    following: account.stats.following,
    songs: own.length,
    playlists: account.playlists.length,
    plays: max(account.stats.plays, before?.plays),
    likes: max(account.stats.likes, before?.likes),
    firstSong: own.at(-1)?.created ?? null,
    lastSong: own[0]?.created ?? null,
  };
});

const group = (items, keysOf) => {
  const out = {};
  for (const s of items) {
    for (const key of [keysOf(s)].flat()) {
      out[key] ??= { songs: 0, plays: 0, likes: 0 };
      out[key].songs += 1;
      out[key].plays += s.metrics.plays;
      out[key].likes += s.metrics.likes;
    }
  }
  return out;
};
const top = (key) =>
  [...live]
    .sort((a, b) => b.metrics[key] - a.metrics[key] || (a.at < b.at ? 1 : -1))
    .slice(0, TOP)
    .map((s) => ({ id: s.id, account: s.account, created: s.created, plays: s.metrics.plays, likes: s.metrics.likes, title: s.title }));

// The style prompt is a comma-separated list; its first term is the genre Chan led with.
const styleTerms = {};
for (const s of live) {
  for (const term of new Set(s.style.split(/[,;\n]/).map((t) => t.trim().toLowerCase()).filter((t) => t && t.length <= 30))) {
    styleTerms[term] = (styleTerms[term] ?? 0) + 1;
  }
}

const seconds = sum(live, (s) => s.seconds);
const summary = {
  songs: live.length,
  ...(removed.length && { removed: removed.length }),
  playlists: playlists.length,
  firstSong: live.at(-1)?.created ?? null,
  lastSong: live[0]?.created ?? null,
  daysSinceLastSong: live.length ? daysBetween(live[0].created, asOf) : null,
  hours: Math.round(seconds / 360) / 10,
  medianSeconds: [...live].map((s) => s.seconds).sort((a, b) => a - b)[live.length >> 1] ?? 0,
  // Per-song counts added up. An account's own totals (accounts[]) are Suno's and can differ.
  engagement: Object.fromEntries(METRICS.map((k) => [k, sum(live, (s) => s.metrics[k])])),
  followers: sum(accounts, (a) => a.followers),
  kinds: {
    withLyrics: live.filter((s) => !s.instrumental).length,
    instrumental: live.filter((s) => s.instrumental).length,
    explicit: live.filter((s) => s.explicit).length,
    remix: live.filter((s) => s.remix).length,
    withMusicVideo: live.filter((s) => s.filmId).length,
    inNoPlaylist: live.filter((s) => !s.playlists).length,
  },
  byAccount: group(live, (s) => s.account),
  byMonth: sortEntries(group(live, (s) => s.created.slice(0, 7)), keysDesc),
  byModel: sortEntries(group(live, (s) => s.model), bySongsDesc),
  byLanguage: sortEntries(group(live, (s) => (s.instrumental ? "(instrumental)" : (s.language ?? "(unknown)"))), bySongsDesc),
  byPlaylist: sortEntries(group(live, (s) => s.playlists ?? ["(none)"]), bySongsDesc),
  byProject: sortEntries(group(live, (s) => s.projectIds ?? ["(none)"]), bySongsDesc),
  topStyleTerms: Object.fromEntries(
    Object.entries(styleTerms)
      .filter(([, n]) => n >= 3)
      .sort(([a, x], [b, y]) => y - x || a.localeCompare(b))
      .slice(0, 25),
  ),
  topByPlays: top("plays"),
  topByLikes: top("likes"),
};

// -----------------------------------------------------------------------------
// Render
// -----------------------------------------------------------------------------
const banner = (title, lines) => {
  const rule = `# ${"=".repeat(77)}\n`;
  return `${rule}# ${title}\n${rule}${lines.map((l) => (l ? `# ${l}` : "#")).join("\n")}\n${rule}\n`;
};
// From `flowLevel` down everything is written inline: at 3 a song's metrics,
// a month and a top-ten row each take one line; at 4 so does each song of a
// playlist.
const dump = (value, flowLevel = 3) => yaml.dump(value, { lineWidth: -1, flowLevel, quotingType: '"', noRefs: true });

const registerText =
  banner("Suno song register — @chanmeng666 and @chanmeng", [
    "Every public song and playlist on Chan's two Suno accounts, newest song",
    "first, as Suno's public API showed them on the `asOf` date. GENERATED by",
    "`npm run build:suno` from suno/capture/latest.json: do not hand-edit. Tags",
    "(projectIds, language, note) are edited in suno/curation.yaml. How to",
    "capture and rebuild: suno/README.md.",
    "",
    "Read `summary` first. Albums are playlists, and a playlist can hold songs",
    "from both accounts, so `byPlaylist` says more than `byAccount`.",
    "",
    "`created` is an Auckland date; `at` is UTC. `style` is the style prompt Chan",
    "wrote; `displayTags` is Suno's own short label. `language` is detected from",
    "the script of the lyrics (curation.yaml can correct it). `filmId` → films[].id",
    "and `projectIds` → projects[].id in data/profile/. Plays, likes, comments",
    "and followers are kept at their historical maximum: a rebuild never lowers",
    "one. `removedSeen` marks a song that has since left the public profile.",
    "",
    "Public data only: what a visitor who is not signed in sees. Unpublished",
    "songs are not here. Lyrics, captions and playlist descriptions are in",
    "suno/words.yaml.",
  ]) +
  dump({ asOf, source: `${capture.source}; read by scripts/capture-suno.mjs`, accounts, summary }) +
  dump({ playlists }, 4) +
  dump({ songs });

if (!fs.existsSync(CAPTURE_WORDS)) fail("no suno/capture/words.json: run `npm run capture:suno`");
let wordsText;
{
  const words = JSON.parse(fs.readFileSync(CAPTURE_WORDS, "utf8"));
  const account = new Map(live.map((s) => [s.id, s.account]));
  wordsText =
    banner("Suno words — captions, lyrics and playlist descriptions", [
      "The words Chan wrote for each public song: its caption and its lyrics",
      "prompt (section tags and stage directions included), and each playlist's",
      "description, as suno.com shows them. GENERATED by `npm run build:suno`",
      "from suno/capture/words.json: do not hand-edit. Ids are those of",
      "suno/songs.yaml; songs are newest first.",
      "",
      "Tracked at Chan's word (2026-10-09). A record, not copy: quoting a lyric",
      "on another surface is a separate decision, and the music videos' rule",
      "(docs/STATE.md) still governs what their copy says.",
    ]) +
    yaml.dump(
      {
        asOf,
        playlists: Object.entries(words.playlists ?? {}).map(([id, p]) => ({ id, name: p.name, description: p.description })),
        songs: live
          .filter((s) => words.songs?.[s.id])
          .map((s) => ({ id: s.id, account: account.get(s.id), title: s.title, created: s.created, ...(words.songs[s.id].caption && { caption: words.songs[s.id].caption }), ...(words.songs[s.id].lyrics && { lyrics: words.songs[s.id].lyrics }) })),
      },
      { lineWidth: -1, quotingType: '"', noRefs: true },
    );
}

// -----------------------------------------------------------------------------
// Write
// -----------------------------------------------------------------------------
const report = () => {
  console.log(
    `suno/songs.yaml: ${summary.songs} songs in ${summary.playlists} playlists on ${accounts.length} accounts, ` +
      `${summary.firstSong} → ${summary.lastSong} (capture ${capture.capturedAt})`,
  );
  for (const n of notes) console.log(`  note: ${n}`);
  for (const d of drift) console.error(`  DRIFT: ${d}`);
};
// What moved since the committed register: printed on a real build only.
const changes = () => {
  if (!previousSong.size) return;
  for (const s of live.filter((s) => !previousSong.has(s.id))) console.log(`  new: ${s.account} "${s.title}" (${s.created})`);
  for (const s of removed.filter((s) => !previousSong.get(s.id)?.removedSeen)) console.log(`  removed: ${s.account} "${s.title}"`);
  for (const k of METRICS) {
    const gained = sum(live, (s) => s.metrics[k] - (previousSong.get(s.id)?.metrics?.[k] ?? 0));
    if (gained) console.log(`  ${k}: +${gained}`);
  }
  for (const a of accounts) {
    const gained = a.followers - (previousAccount.get(a.handle)?.followers ?? a.followers);
    if (gained) console.log(`  followers ${a.handle}: +${gained}`);
  }
};

const stale = [[REGISTER, registerText], [WORDS, wordsText]].some(([file, text]) => !fs.existsSync(file) || fs.readFileSync(file, "utf8") !== text);

if (check) {
  report();
  if (stale) fail("suno/songs.yaml or suno/words.yaml stale: run `npm run build:suno`");
  if (drift.length) fail("suno/accounts.yaml disagrees with the capture");
} else {
  changes();
  fs.writeFileSync(REGISTER, registerText);
  fs.writeFileSync(WORDS, wordsText);
  report();
  if (drift.length) fail("suno/accounts.yaml disagrees with the capture: update it, then rebuild");
}
