// Build x/posts.yaml — the register of every post on @chanmeng666 — from the
// last capture of the live account.
//
//   x/capture/latest.json   what X showed (written from x/capture/snippet.js)
//   x/posts.yaml            the register: generated, EXCEPT the curated keys
//   x/account.yaml          hand-maintained profile record, checked here
//
// WHY A CAPTURE FILE AND NOT AN API CALL:
//
// Reading the account needs Chan's signed-in browser session; there is no key
// in this repo and there should not be one. So the read happens in the browser
// and lands in a file, and this script is a pure function of files. It can run
// anywhere, including CI, and never talks to X.
//
// WHAT SURVIVES A REBUILD:
//
// Everything X reports (text, links, media, counts) is rewritten from the
// capture. The curated keys — CURATED_THREAD on a thread, CURATED_POST on a
// post — are read back from the existing posts.yaml and kept, so tagging a
// thread with its project is a one-time edit. A thread nobody has tagged yet
// is listed at the end of the run.
//
// Counts follow the repo's standing rule: a number that measures reach is kept
// at its historical maximum, so a metric never goes down on a rebuild.
//
// A post that was in the register and is missing from a COMPLETE capture is
// kept, marked `deletedSeen`. An incomplete capture (fewer posts than the
// profile's own count) fails instead: it must not be read as deletions.
//
//   node scripts/build-x-register.mjs [--check] [--apply-account] [--changes]
//                                     [--curation <file.yaml>]
//
// --check          write nothing; exit 1 if posts.yaml would change
// --apply-account  first copy the plain counts and the capture date from the
//                  capture into x/account.yaml (followers is only ever raised).
//                  Name, bio, location, website and pinned post are NOT copied:
//                  a change there is news, and a person should look at it
// --changes        after building, print what differs from the committed
//                  register (git HEAD): the report a sync ends with
// --curation       merge curated keys from a file ({ "<root id>": {…} }) on top of
//                  the ones already in posts.yaml

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import { loadProfile } from "./lib/load-profile.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CAPTURE = path.join(repoRoot, "x", "capture", "latest.json");
const REGISTER = path.join(repoRoot, "x", "posts.yaml");
const ACCOUNT = path.join(repoRoot, "x", "account.yaml");

const CURATED_THREAD = ["topic", "projectIds", "showcaseId", "pillar", "summary", "flags", "note"];
const CURATED_POST = ["note"];
const METRICS = ["views", "likes", "replies", "reposts", "quotes", "bookmarks"];
// P1–P4 are the content pillars of x/x-strategy.md §2; `none` is a post that
// serves no pillar (a reply, a personal note, the intro).
const PILLARS = ["P1", "P2", "P3", "P4", "none"];
// Why the thread exists, one per thread. Described in x/README.md.
const TOPICS = [
  "intro", "launch", "product", "product-film", "technical-deep-dive",
  "investigation", "brand", "community", "bug-report", "personal",
];
// Media posted from this date on is expected to carry alt text (rule adopted
// 2026-10-07). X cannot add it after posting, so a miss is reported, not failed.
const ALT_TEXT_FROM = "2026-10-08";

const args = process.argv.slice(2);
const check = args.includes("--check");
const applyAccount = args.includes("--apply-account");
const showChanges = args.includes("--changes");
const curationArg = args.includes("--curation") ? args[args.indexOf("--curation") + 1] : null;

const fail = (msg) => {
  console.error(`build-x-register: ${msg}`);
  process.exit(1);
};

if (!fs.existsSync(CAPTURE)) fail(`no capture at ${path.relative(repoRoot, CAPTURE)}`);
const capture = JSON.parse(fs.readFileSync(CAPTURE, "utf8"));
const { user } = capture;
const handle = user.handle;
const statusUrl = (id, who = handle) => `https://x.com/${who}/status/${id}`;

// ---------------------------------------------------------------------------
// What the last build knew
// ---------------------------------------------------------------------------
const previous = fs.existsSync(REGISTER) ? yaml.load(fs.readFileSync(REGISTER, "utf8")) : null;
const curatedThread = new Map();
const curatedPost = new Map();
const previousPost = new Map();
for (const thread of previous?.threads ?? []) {
  curatedThread.set(thread.id, pick(thread, CURATED_THREAD));
  for (const post of thread.posts ?? []) {
    curatedPost.set(post.id, pick(post, CURATED_POST));
    previousPost.set(post.id, { ...post, _thread: thread.id });
  }
}
if (curationArg) {
  const extra = yaml.load(fs.readFileSync(curationArg, "utf8")) ?? {};
  for (const [id, fields] of Object.entries(extra)) {
    // Re-picked so the keys come out in CURATED_THREAD order whatever their source.
    curatedThread.set(String(id), pick({ ...curatedThread.get(String(id)), ...fields }, CURATED_THREAD));
  }
}

function pick(obj, keys) {
  return Object.fromEntries(keys.filter((k) => obj?.[k] != null).map((k) => [k, obj[k]]));
}

// ---------------------------------------------------------------------------
// Completeness: the profile's own post count is the check
// ---------------------------------------------------------------------------
if (capture.posts.length !== user.posts) {
  fail(
    `capture holds ${capture.posts.length} posts but the profile counts ${user.posts}. ` +
      "Scroll the Posts and Replies tabs to the end and capture again.",
  );
}

// ---------------------------------------------------------------------------
// Posts → register rows
// ---------------------------------------------------------------------------
const nzDate = (iso) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date(iso));

function toRow(p) {
  const before = previousPost.get(p.id)?.metrics ?? {};
  const metrics = Object.fromEntries(METRICS.map((k) => [k, Math.max(p.m?.[k] ?? 0, before[k] ?? 0)]));
  const row = { id: p.id, at: p.at, text: p.text };
  if (p.urls?.length) row.links = [...new Set(p.urls)];
  if (p.mentions?.length) row.mentions = [...new Set(p.mentions)];
  if (p.hashtags?.length) row.hashtags = p.hashtags;
  if (p.media?.length) {
    row.media = p.media.map((m) => {
      const out = { type: m.type, size: `${m.w}x${m.h}` };
      if (m.dur) out.seconds = Math.round(m.dur / 1000);
      out.alt = m.alt ?? null;
      out.src = m.url;
      return out;
    });
  }
  if (p.quoted) row.quotes = statusUrl(p.quoted, p.quotedUser || "i/web");
  if (p.repostOf) row.repostOf = statusUrl(p.repostOf, p.repostOfUser || "i/web");
  row.metrics = metrics;
  Object.assign(row, curatedPost.get(p.id));
  return row;
}

const captured = new Map(capture.posts.map((p) => [p.id, p]));
const previousThread = new Map((previous?.threads ?? []).map((t) => [t.id, t]));
const groups = new Map();
for (const p of capture.posts) {
  // A conversation Chan started is one thread, however much later she added
  // to it, and it stays one thread after she deletes its first post (the
  // register remembers the conversation). A post inside someone else's
  // conversation stands alone.
  const own = captured.has(p.conv) || (previousThread.has(p.conv) && previousThread.get(p.conv).kind !== "reply");
  const key = own ? p.conv : p.id;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(p);
}
// A thread whose posts are all gone from X is carried over whole.
for (const [id, old] of previousPost) {
  if (!captured.has(id) && !groups.has(old._thread)) groups.set(old._thread, []);
}

const byId = (x, y) => (BigInt(x.id) < BigInt(y.id) ? -1 : 1);
const threads = [];
for (const [rootId, members] of groups) {
  const was = previousThread.get(rootId);
  const posts = members.map(toRow);
  // Posts the register had that X no longer shows.
  for (const [id, old] of previousPost) {
    if (old._thread !== rootId || captured.has(id)) continue;
    const { _thread, ...row } = old;
    row.deletedSeen ??= capture.capturedAt;
    posts.push(row);
  }
  posts.sort(byId);
  const livePosts = posts.filter((p) => !p.deletedSeen);

  const root = captured.get(rootId);
  let kind = was?.kind;
  if (root) {
    kind = root.repostOf
      ? "repost"
      : root.id !== root.conv
        ? "reply"
        : posts.length > 1
          ? "thread"
          : root.quoted
            ? "quote"
            : "post";
  }
  const thread = { id: rootId, url: statusUrl(rootId), kind, posted: nzDate(posts[0].at) };
  const lastDay = nzDate(posts.at(-1).at);
  if (lastDay !== thread.posted) thread.continued = lastDay;
  if (user.pinned?.includes(rootId)) thread.pinned = true;
  if (kind === "reply") {
    thread.inReplyTo = root
      ? { user: root.replyToUser, url: statusUrl(root.replyTo, root.replyToUser) }
      : was?.inReplyTo;
  }
  Object.assign(thread, curatedThread.get(rootId));
  // Totals count what is still on X; rootViews is the first post still there.
  thread.totals = {
    posts: livePosts.length,
    rootViews: livePosts[0]?.metrics.views ?? 0,
    ...Object.fromEntries(METRICS.map((k) => [k, livePosts.reduce((n, r) => n + r.metrics[k], 0)])),
  };
  thread.posts = posts;
  threads.push(thread);
}

threads.sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? 1 : -1)); // newest first

// ---------------------------------------------------------------------------
// Cross-references into the profile
// ---------------------------------------------------------------------------
const profile = loadProfile();
const projectIds = new Set(profile.projects.map((p) => p.id));
const showcaseIds = new Set((profile.showcase ?? []).map((s) => s.id));
for (const t of threads) {
  for (const id of t.projectIds ?? []) {
    if (!projectIds.has(id)) fail(`thread ${t.id}: projectIds names "${id}", which is not a projects[].id`);
  }
  if (t.topic && !TOPICS.includes(t.topic)) {
    fail(`thread ${t.id}: topic "${t.topic}" is not one of ${TOPICS.join(", ")}`);
  }
  if (t.pillar && !PILLARS.includes(t.pillar)) {
    fail(`thread ${t.id}: pillar "${t.pillar}" is not one of ${PILLARS.join(", ")}`);
  }
  if (t.showcaseId && !showcaseIds.has(t.showcaseId)) {
    fail(`thread ${t.id}: showcaseId "${t.showcaseId}" is not a showcase[].id`);
  }
}

// ---------------------------------------------------------------------------
// The hand-maintained account record must agree with what X showed
// ---------------------------------------------------------------------------
const drift = [];
if (applyAccount && !check) {
  // Line edits, so the comments and layout of the hand-kept file survive.
  let text = fs.readFileSync(ACCOUNT, "utf8");
  const recorded = yaml.load(text).account;
  const set = (key, value) => {
    const line = new RegExp(`^(\\s+${key}: )("?)[^"\\s#]+("?)`, "m");
    if (!line.test(text)) fail(`x/account.yaml has no "${key}:" line to update`);
    text = text.replace(line, `$1$2${value}$3`);
  };
  set("asOf", capture.capturedAt);
  set("followers", Math.max(user.followers, recorded.counts?.followers ?? 0));
  set("following", user.following);
  set("posts", user.posts);
  set("mediaPosts", user.media);
  set("likesGiven", user.likesGiven);
  fs.writeFileSync(ACCOUNT, text);
}
if (fs.existsSync(ACCOUNT)) {
  const account = yaml.load(fs.readFileSync(ACCOUNT, "utf8")).account;
  const same = { displayName: user.name, bio: user.bio, location: user.location, website: user.website };
  for (const [key, live] of Object.entries(same)) {
    if (String(account[key] ?? "").trim() !== String(live ?? "").trim()) {
      drift.push(`account.${key} is "${account[key]}" but X shows "${live}"`);
    }
  }
  if (String(account.pinned ?? "") !== String(user.pinned?.[0] ?? "")) {
    drift.push(`account.pinned is ${account.pinned} but X shows ${user.pinned?.[0] ?? "none"}`);
  }
  // Reach counts are recorded at their maximum: only a HIGHER live number is drift.
  for (const [key, live] of Object.entries({ followers: user.followers })) {
    if (live > (account.counts?.[key] ?? 0)) {
      drift.push(`account.counts.${key} is ${account.counts?.[key]} but X shows ${live}: raise it`);
    }
  }
  for (const [key, live] of Object.entries({ following: user.following, posts: user.posts })) {
    if (account.counts?.[key] !== live) drift.push(`account.counts.${key} is ${account.counts?.[key]} but X shows ${live}`);
  }
  if (account.asOf !== capture.capturedAt) {
    drift.push(`account.asOf is ${account.asOf} but the capture is from ${capture.capturedAt}`);
  }
}

// ---------------------------------------------------------------------------
// Summary: the two-minute read
// ---------------------------------------------------------------------------
// A thread whose posts are all gone from X stays in the register but is not counted.
const liveThreads = threads.filter((t) => t.posts.some((p) => !p.deletedSeen));
const live = liveThreads.flatMap((t) => t.posts.filter((p) => !p.deletedSeen).map((p) => ({ ...p, _t: t })));
const sum = (rows, k) => rows.reduce((n, r) => n + r.metrics[k], 0);
const tally = (keyOf) => {
  const out = {};
  for (const t of liveThreads) {
    for (const key of [keyOf(t)].flat()) {
      out[key] ??= { threads: 0, posts: 0, views: 0 };
      out[key].threads += 1;
      out[key].posts += t.totals.posts;
      out[key].views += t.totals.views;
    }
  }
  return out;
};
const mediaItems = live.flatMap((p) => p.media ?? []);
const lastPost = live.reduce((a, b) => (a.at > b.at ? a : b));
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86_400_000);

const summary = {
  posts: live.length,
  threads: liveThreads.length,
  byKind: Object.fromEntries(
    ["thread", "post", "quote", "reply", "repost"]
      .map((k) => [k, liveThreads.filter((t) => t.kind === k).length])
      .filter(([, n]) => n),
  ),
  firstPost: nzDate(live.reduce((a, b) => (a.at < b.at ? a : b)).at),
  lastPost: nzDate(lastPost.at),
  daysSinceLastPost: daysBetween(nzDate(lastPost.at), capture.capturedAt),
  engagement: {
    ...Object.fromEntries(METRICS.map((k) => [k, sum(live, k)])),
    // X counts Chan's own thread continuations as replies; this is the rest.
    repliesFromOthers: sum(live, "replies") - capture.posts.filter((p) => captured.get(p.replyTo)?.id).length,
  },
  media: {
    postsWithMedia: live.filter((p) => p.media?.length).length,
    photos: mediaItems.filter((m) => m.type === "photo").length,
    videos: mediaItems.filter((m) => m.type !== "photo").length,
    withAltText: mediaItems.filter((m) => m.alt).length,
  },
  byMonth: Object.fromEntries(
    Object.entries(
      live.reduce((acc, p) => {
        const month = nzDate(p.at).slice(0, 7);
        acc[month] ??= { posts: 0, threadsStarted: 0, views: 0 };
        acc[month].posts += 1;
        acc[month].views += p.metrics.views;
        if (p.id === p._t.id) acc[month].threadsStarted += 1;
        return acc;
      }, {}),
    ).sort(([a], [b]) => (a < b ? 1 : -1)),
  ),
  byProject: Object.fromEntries(
    Object.entries(tally((t) => (t.projectIds?.length ? t.projectIds : ["(none)"]))).sort(
      ([, a], [, b]) => b.threads - a.threads || b.views - a.views,
    ),
  ),
  byPillar: Object.fromEntries(
    [...PILLARS, "(untagged)"]
      .map((k) => [k, tally((t) => t.pillar ?? "(untagged)")[k]])
      .filter(([, v]) => v),
  ),
  topByRootViews: [...liveThreads]
    .sort((a, b) => b.totals.rootViews - a.totals.rootViews)
    .slice(0, 5)
    .map((t) => ({ id: t.id, posted: t.posted, kind: t.kind, rootViews: t.totals.rootViews, opens: firstLine(t.posts.find((p) => !p.deletedSeen).text) })),
  flagged: liveThreads.filter((t) => t.flags?.length).map((t) => ({ id: t.id, flags: t.flags })),
};

function firstLine(text) {
  const line = text.split("\n")[0];
  return line.length > 90 ? `${line.slice(0, 89)}…` : line;
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------
const header = `# =============================================================================
# X post register — @${handle}
# =============================================================================
# Every post the account shows, newest thread first, as captured from x.com on
# the \`asOf\` date. GENERATED by \`npm run build:x\` from x/capture/latest.json:
# do not hand-edit anything X reports (text, links, media, metrics, totals,
# summary). How to capture and rebuild: x/README.md.
#
# The curated keys ARE hand-edited here and survive a rebuild:
#   on a thread: ${CURATED_THREAD.join(", ")}
#   on a post:   ${CURATED_POST.join(", ")}
# \`projectIds\` → projects[].id and \`showcaseId\` → showcase[].id in
# data/profile/ (the build fails on an id that does not exist). \`pillar\` is
# P1–P4 from x-strategy.md §2, or \`none\` for a post that serves no pillar; the
# tags are Claude's, made at Chan's request on 2026-10-07, and she may overrule
# any of them. \`flags\` records where a
# post that is still live disagrees with a rule or a fact decided since
# (docs/STATE.md); it is a note for Chan, not an instruction to delete.
#
# A thread is one conversation Chan started, including anything she added to it
# later (\`continued\`). \`posted\` and \`continued\` are Auckland dates; \`at\` is
# UTC. Text is what a reader sees: t.co links are expanded and the leading
# @mentions of a reply are left out (they are in \`mentions\`).
# Metrics are X's public counts kept at their historical maximum: a rebuild
# never lowers one. \`rootViews\` (views of the first post) is the reach figure;
# \`views\` on a thread is the sum over its posts.
#
# This repo is public and so is every post here. Nothing private belongs in
# this folder: no DMs, no drafts, no analytics export, no following list.
# =============================================================================
`;

const body = yaml.dump(
  { account: `@${handle}`, asOf: capture.capturedAt, source: capture.source, summary, threads },
  { lineWidth: -1, noRefs: true, quotingType: '"' },
);
// A mapping of nothing but numbers (metrics, totals, the summary tallies) reads
// better on one line; the YAML means the same.
const compact = body.replace(
  /^( *)(- )?([^\s:#-][^:\n]*):\n((?: +[\w-]+: \d+\n)+)/gm,
  (whole, indent, dash = "", key, block, offset, text) => {
    const lines = block.trimEnd().split("\n");
    const childIndent = indent.length + dash.length + 2;
    const depth = (l) => l.length - l.trimStart().length;
    if (!lines.every((l) => depth(l) === childIndent)) return whole;
    // The mapping must END here: a further, non-numeric child means it is mixed.
    const after = text.slice(offset + whole.length).split("\n", 1)[0];
    if (after.trim() && depth(after) >= childIndent) return whole;
    return `${indent}${dash}${key}: { ${lines.map((l) => l.trim()).join(", ")} }\n`;
  },
);
const next = `${header}\n${compact}`;
if (JSON.stringify(yaml.load(next)) !== JSON.stringify(yaml.load(body))) {
  fail("the compacted YAML no longer parses to the same data");
}
const current = fs.existsSync(REGISTER) ? fs.readFileSync(REGISTER, "utf8") : "";

const untagged = liveThreads.filter((t) => !t.topic || !t.pillar || !t.summary);
const missingAlt = live.filter((p) => nzDate(p.at) >= ALT_TEXT_FROM && p.media?.some((m) => !m.alt));
const report = () => {
  console.log(
    `x/posts.yaml: ${summary.posts} posts in ${summary.threads} threads, ` +
      `${summary.firstPost} → ${summary.lastPost} (capture ${capture.capturedAt})`,
  );
  for (const t of untagged) {
    const missing = ["topic", "pillar", "summary"].filter((k) => !t[k]).join(", ");
    console.log(`  untagged (${missing}): ${t.id} (${t.posted}) ${firstLine(t.posts[0].text)}`);
  }
  for (const p of missingAlt) console.log(`  no alt text: ${p.id} (${nzDate(p.at)}) ${firstLine(p.text)}`);
  for (const d of drift) console.error(`  DRIFT: ${d}`);
};

if (check) {
  report();
  if (next !== current) fail("x/posts.yaml is stale: run `npm run build:x`");
  if (drift.length) fail("x/account.yaml disagrees with the capture");
  process.exit(0);
}

fs.writeFileSync(REGISTER, next);
report();
if (showChanges) printChanges();
if (drift.length) fail("x/account.yaml disagrees with the capture: update it, then rebuild");

// ---------------------------------------------------------------------------
// --changes: this register against the committed one
// ---------------------------------------------------------------------------
function printChanges() {
  const committed = (file) => {
    try {
      return yaml.load(execFileSync("git", ["show", `HEAD:${file}`], { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
    } catch {
      return null;
    }
  };
  const before = committed("x/posts.yaml");
  if (!before) return console.log("changes: no committed register to compare with");
  const was = new Map(before.threads.flatMap((t) => t.posts.map((p) => [p.id, { ...p, _t: t }])));
  const now = threads.flatMap((t) => t.posts.map((p) => ({ ...p, _t: t })));
  const out = [`changes since the committed register (${before.asOf} → ${capture.capturedAt}):`];

  const fresh = threads.filter((t) => t.posts.some((p) => !was.has(p.id)));
  for (const t of fresh) {
    const added = t.posts.filter((p) => !was.has(p.id));
    const label = was.has(t.id) ? `${added.length} added to thread` : `new ${t.kind}${t.posts.length > 1 ? ` of ${t.posts.length}` : ""}`;
    out.push(`  + ${label} ${t.id} (${t.posted}), ${t.totals.rootViews} views on the first post: ${firstLine(t.posts[0].text)}`);
  }
  for (const p of now.filter((p) => p.deletedSeen && !was.get(p.id)?.deletedSeen)) {
    out.push(`  - deleted ${p.id}: ${firstLine(p.text)}`);
  }
  for (const p of now.filter((p) => was.has(p.id) && was.get(p.id).text !== p.text)) {
    out.push(`  ~ text changed ${p.id}: ${firstLine(p.text)}`);
  }
  const moved = now
    .filter((p) => was.has(p.id) && !p.deletedSeen)
    .map((p) => ({ p, delta: Object.fromEntries(METRICS.map((k) => [k, p.metrics[k] - (was.get(p.id).metrics?.[k] ?? 0)]).filter(([, d]) => d > 0)) }))
    .filter(({ delta }) => Object.keys(delta).length)
    .sort((a, b) => (b.delta.views ?? 0) - (a.delta.views ?? 0));
  for (const { p, delta } of moved.slice(0, 12)) {
    const parts = Object.entries(delta).map(([k, d]) => `+${d} ${k}`).join(", ");
    out.push(`  ↑ ${parts} (now ${p.metrics.views} views) ${p.id}: ${firstLine(p.text)}`);
  }
  if (moved.length > 12) out.push(`  … and ${moved.length - 12} more posts gained views`);

  const pinnedWas = before.threads.find((t) => t.pinned)?.id;
  const pinnedNow = threads.find((t) => t.pinned)?.id;
  if (pinnedWas !== pinnedNow) out.push(`  pinned: ${pinnedWas ?? "none"} → ${pinnedNow ?? "none"}`);
  const accountWas = committed("x/account.yaml")?.account?.counts ?? {};
  for (const [key, live] of Object.entries({ followers: user.followers, following: user.following })) {
    if (accountWas[key] != null && accountWas[key] !== live) out.push(`  ${key}: ${accountWas[key]} → ${live}`);
  }
  const total = (register, k) => register.summary?.engagement?.[k] ?? 0;
  out.push(`  totals: ${before.summary.posts} → ${summary.posts} posts, ${total(before, "views")} → ${summary.engagement.views} views, ${total(before, "likes")} → ${summary.engagement.likes} likes, ${total(before, "repliesFromOthers")} → ${summary.engagement.repliesFromOthers} replies from others`);
  if (out.length === 2 && before.summary.posts === summary.posts && total(before, "views") === summary.engagement.views) {
    out.splice(1, 1, "  nothing changed");
  }
  console.log(out.join("\n"));
}
