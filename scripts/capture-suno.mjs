// Capture Chan's two Suno accounts as Suno's public API shows them, into
//
//   suno/capture/latest.json          every public song and playlist: titles,
//                                     style prompts, models, lengths, counts
//   suno/capture/words.json           the words: lyrics, song captions and
//                                     playlist descriptions
//
// `npm run build:suno` then turns the capture into the register. This is the
// only script in the Suno pipeline that touches the network.
//
// HOW IT READS:
//
// The method is the one proven by Chan's Suno probe (the local checkout
// D:github_repositorygithub-readme-suno-cards, docs/suno-api-reference.md
// §5.7 and §5.8): anonymous GET requests to
// studio-api-prod.suno.com, the same requests suno.com makes for a visitor who
// is not signed in. No key, no cookie, no sign-in, nothing written to Suno.
// So it sees exactly what a stranger sees: PUBLIC songs and PUBLIC playlists.
// Unpublished generations, drafts and the Library are not in it.
//
// The requests name themselves in the User-Agent. Suno serves a reduced body
// to a User-Agent that begins with "suno" (probe round 27), so the name must
// not start with that word.
//
// The probe's parser is not used here on purpose: its schema drops fields it
// does not model, and this repo should not depend on a sibling checkout.
//
//   node scripts/capture-suno.mjs [--dry-run]
//
// --dry-run    fetch and report; write nothing

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(repoRoot, "suno");
const API = "https://studio-api-prod.suno.com";
const USER_AGENT = "ChanMeng666-profile-register/1.0 (+https://github.com/ChanMeng666/ChanMeng666/tree/main/suno)";
const PAUSE_MS = 800;
const MAX_PAGES = 50;

const dryRun = process.argv.includes("--dry-run");
const exit = (msg) => {
  console.error(`capture-suno: ${msg}`);
  process.exit(1);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The accounts to read are the ones accounts.yaml lists.
const handles = (yaml.load(fs.readFileSync(path.join(DIR, "accounts.yaml"), "utf8")).accounts ?? []).map((a) =>
  a.handle.replace(/^@/, ""),
);
if (!handles.length) exit("suno/accounts.yaml lists no account");

let requests = 0;
async function get(url) {
  if (requests++) await sleep(PAUSE_MS);
  const res = await fetch(url, { headers: { "user-agent": USER_AGENT, accept: "application/json" } });
  if (!res.ok) exit(`${res.status} from ${url}`);
  return res.json();
}

// What the lyrics are, without the lyrics: enough for the tracked register to
// say how long a song's text is and what language it is sung in.
function describeLyrics(text, style) {
  const body = (text || "").trim();
  if (!body) return null;
  // Section tags and stage directions are instructions to the model, not words sung.
  const sung = body.replace(/\[[^\]]*\]/g, "").replace(/[(（][^)）]*[)）]/g, "");
  const lines = sung.split("\n").filter((l) => l.trim()).length;
  const count = (re) => (sung.match(re) ?? []).length;
  const han = count(/\p{Script=Han}/gu);
  const kana = count(/[\p{Script=Hiragana}\p{Script=Katakana}]/gu);
  const latin = count(/\p{Script=Latin}/gu);
  let language = "en";
  if (kana >= 10) language = "ja";
  else if (han * 4 >= latin) language = /canto/i.test(style || "") ? "yue" : "zh";
  return { lines, chars: [...sung.replace(/\s/g, "")].length, language };
}

const accounts = [];
const words = { songs: {}, playlists: {} };
let complete = true;

for (const handle of handles) {
  const pages = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const body = await get(
      `${API}/api/profiles/${encodeURIComponent(handle)}?page=${page}&clips_sort_by=created_at&playlists_sort_by=created_at`,
    );
    if (!body.clips?.length) break;
    pages.push(body);
  }
  if (!pages.length) exit(`@${handle} returned no songs: refusing to read that as an empty account`);
  const first = pages[0];
  const clips = pages.flatMap((p) => p.clips);
  // Suno's own count includes songs it does not list publicly, so fewer is not
  // an error, but it is worth knowing.
  if (clips.length < first.num_total_clips) {
    console.log(`  note: @${handle} lists ${clips.length} songs; its profile counts ${first.num_total_clips}`);
  }

  const songs = clips.map((c) => {
    const m = c.metadata ?? {};
    if (m.prompt?.trim() || c.caption) {
      words.songs[c.id] = { title: c.title, ...(c.caption && { caption: c.caption }), ...(m.prompt?.trim() && { lyrics: m.prompt.trim() }) };
    }
    return {
      id: c.id,
      title: c.title,
      createdAt: c.created_at,
      model: c.major_model_version,
      modelName: c.model_name,
      type: m.type ?? null,
      seconds: m.duration ?? null,
      style: m.tags ?? "",
      displayTags: c.display_tags ?? "",
      instrumental: Boolean(m.make_instrumental),
      explicit: Boolean(c.explicit),
      remix: Boolean(m.is_remix),
      pinned: Boolean(c.is_pinned),
      isPublic: c.is_public,
      hasCaption: Boolean(c.caption),
      lyrics: describeLyrics(m.prompt, m.tags),
      plays: c.play_count ?? 0,
      likes: c.upvote_count ?? 0,
      comments: c.comment_count ?? 0,
      imageUrl: c.image_large_url ?? c.image_url ?? null,
    };
  });

  const playlists = [];
  for (const listed of first.playlists ?? []) {
    const entries = [];
    let total = listed.num_total_results ?? 0;
    let seconds = null;
    for (let page = 1; page <= MAX_PAGES; page++) {
      const body = await get(`${API}/api/playlist/${listed.id}?page=${page}`);
      total = body.num_total_results ?? total;
      seconds ??= body.total_duration ?? null;
      if (!body.playlist_clips?.length) break;
      entries.push(...body.playlist_clips);
      if (entries.length >= total) break;
    }
    if (entries.length < total) {
      complete = false;
      console.log(`  note: playlist "${listed.name}" returned ${entries.length} of ${total} songs`);
    }
    if (listed.description) words.playlists[listed.id] = { name: listed.name, description: listed.description };
    playlists.push({
      id: listed.id,
      name: listed.name,
      isPublic: listed.is_public,
      hasDescription: Boolean(listed.description),
      // The playlist's own page reports 0 plays; the profile's list carries the count.
      plays: listed.play_count ?? 0,
      likes: listed.upvote_count ?? 0,
      seconds,
      imageUrl: listed.image_url ?? null,
      songs: entries
        .sort((a, b) => a.relative_index - b.relative_index)
        .map((e) => ({ id: e.clip.id, handle: e.clip.handle, title: e.clip.title, addedAt: e.created_at ?? null })),
    });
  }

  accounts.push({
    handle,
    userId: first.user_id,
    displayName: first.display_name ?? "",
    bio: first.profile_description ?? "",
    verified: Boolean(first.is_verified),
    avatarUrl: first.avatar_image_url ?? null,
    stats: {
      followers: first.stats?.followers_count ?? 0,
      following: first.stats?.following_count ?? 0,
      plays: first.stats?.play_count__sum ?? 0,
      likes: first.stats?.upvote_count__sum ?? 0,
      songsCounted: first.num_total_clips ?? songs.length,
    },
    songs,
    playlists,
  });
  console.log(`@${handle}: ${songs.length} songs, ${playlists.length} playlists`);
}

const capturedAt = new Date().toISOString();
const head = {
  capturedAt,
  source: `${API} (anonymous GET, public data only)`,
  userAgent: USER_AGENT,
  complete,
};

if (dryRun) {
  console.log(`dry run: ${requests} requests, nothing written`);
} else {
  const out = path.join(DIR, "capture");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "latest.json"), `${JSON.stringify({ ...head, accounts }, null, 1)}\n`);
  fs.writeFileSync(path.join(out, "words.json"), `${JSON.stringify({ capturedAt, ...words }, null, 1)}\n`);
  console.log(`wrote suno/capture/latest.json and words.json (${requests} requests). Next: npm run build:suno`);
}
