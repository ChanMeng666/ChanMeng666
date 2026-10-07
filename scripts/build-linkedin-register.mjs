// Build the LinkedIn post registers — every post and repost on each LinkedIn
// page Chan runs — from the last capture of the live page. REGISTERS below
// lists them: her profile in linkedin/, and each company page in
// linkedin/company/<name>/ with the same files. For the profile:
//
//   linkedin/capture/latest.json          what LinkedIn showed (from capture/snippet.js)
//   linkedin/capture/latest.private.json  impression counts; gitignored, optional
//   linkedin/curation.yaml                hand-edited tags, keyed by post id; optional
//   linkedin/account.yaml                 hand-maintained account record, checked here
//
//   linkedin/posts.yaml                   GENERATED: summary + one line per post
//   linkedin/posts/<year>.yaml            GENERATED: every post in full, by year
//   linkedin/posts.private.yaml           GENERATED, gitignored: impressions
//
// WHY A CAPTURE FILE AND NOT AN API CALL:
//
// Reading the account needs Chan's signed-in browser session; there is no key
// in this repo and there should not be one. So the read happens in the browser
// and lands in a file, and this script is a pure function of files. It can run
// anywhere, including CI, and never talks to LinkedIn.
//
// WHY AN INDEX AND YEAR FILES:
//
// The posts run to about 200,000 characters. A reader who wants to know how the
// account is run needs the summary and one line per post; a reader who wants a
// post's words opens that year. Splitting them keeps the first read short.
//
// WHAT SURVIVES A REBUILD:
//
// Every generated file is rewritten from the capture. Tags a person adds live in
// linkedin/curation.yaml, never in a generated file. Counts follow the repo's
// standing rule: a number that measures reach is kept at its historical maximum,
// so a metric never goes down on a rebuild. A post that was in the register and
// is missing from a COMPLETE capture is kept, marked `deletedSeen`.
//
// WHAT IS PRIVATE:
//
// Reactions, comments and reposts are on the public page. Impressions are shown
// to the author only, so they go to the gitignored posts.private.yaml and never
// into a tracked file. `--check` does not look at the private files.
//
//   node scripts/build-linkedin-register.mjs [--check]
//
// --check      write nothing; exit 1 if a tracked output would change or
//              account.yaml disagrees with the capture

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import { loadProfile } from "./lib/load-profile.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// One folder per LinkedIn page Chan runs: her profile, then each company page.
const REGISTERS = ["linkedin", "linkedin/company/archcanvas"];

const CURATED = ["topic", "projectIds", "flags", "note"];
// Why a post exists. One per post; the definitions are in linkedin/README.md.
const TOPICS = ["launch", "build-log", "client-work", "event", "career", "community", "writing", "boost", "reflection", "other"];
const METRICS = ["reactions", "comments", "reposts"];
// Project names that are also an organisation, a common phrase or a word in
// ordinary use: a post naming them is usually not about the project. Such a
// project is matched by its links only.
// chanmeng.org is the venue, never presented as a project (docs/STATE.md), so a
// link to it does not make a post about one.
const NOT_MATCHED = new Set(["portfolio-v2"]);
const NAME_TOO_AMBIGUOUS = new Set([
  "she-sharp",
  "customer-insight",
  "design-pages",
  "job-valuation",
  "memory-rush",
  "who-i-am",
]);

const check = process.argv.includes("--check");
const rel = (file) => path.relative(repoRoot, file).replaceAll("\\", "/");
const exit = (msg) => {
  console.error(`build-linkedin-register: ${msg}`);
  process.exit(1);
};
const readYaml = (file) => (fs.existsSync(file) ? yaml.load(fs.readFileSync(file, "utf8")) : null);

function buildRegister(base) {
  const DIR = path.join(repoRoot, base);
  const CAPTURE = path.join(DIR, "capture", "latest.json");
  const CAPTURE_PRIVATE = path.join(DIR, "capture", "latest.private.json");
  const CURATION = path.join(DIR, "curation.yaml");
  const ACCOUNT = path.join(DIR, "account.yaml");
  const INDEX = path.join(DIR, "posts.yaml");
  const YEARS_DIR = path.join(DIR, "posts");
  const PRIVATE = path.join(DIR, "posts.private.yaml");
  // In comments and messages `@/` stands for this register's folder.
  const at = (text) => text.replaceAll("@/", `${base}/`);
  const fail = (msg) => exit(at(msg));

  if (!fs.existsSync(CAPTURE)) fail(`no capture at ${rel(CAPTURE)}`);
  const capture = JSON.parse(fs.readFileSync(CAPTURE, "utf8"));
  const { user } = capture;
  const isMember = (user.kind ?? "member") === "member";
  const pageAddress = `linkedin.com/${isMember ? "in" : "company"}/${user.handle}`;
  // An incomplete capture must not be read as deletions.
  if (!capture.complete) fail("the capture did not reach the end of the feed. Capture again.");

  const nzDate = (iso) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date(iso));
  const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86_400_000);
  const median = (numbers) => {
    if (!numbers.length) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = sorted.length >> 1;
    return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  };
  const firstLine = (text, max = 110) => {
    const line = (text || "").trim().split("\n")[0].trim();
    return line.length > max ? `${line.slice(0, max - 1)}…` : line;
  };
  const byIdDesc = (a, b) => (BigInt(a.id) < BigInt(b.id) ? 1 : -1);
  const activityUrl = (id) => `https://www.linkedin.com/feed/update/urn:li:activity:${id}/`;

  // ---------------------------------------------------------------------------
  // What the last build knew
  // ---------------------------------------------------------------------------
  const previousPost = new Map();
  if (fs.existsSync(YEARS_DIR)) {
    for (const file of fs.readdirSync(YEARS_DIR).filter((f) => /^\d{4}\.yaml$/.test(f))) {
      for (const post of readYaml(path.join(YEARS_DIR, file))?.posts ?? []) previousPost.set(post.id, post);
    }
  }
  const previousRepost = new Map((readYaml(INDEX)?.reposts ?? []).map((r) => [r.id, r]));

  // ---------------------------------------------------------------------------
  // Projects a post names or links (a fact about its text, not a judgement)
  // ---------------------------------------------------------------------------
  const profile = loadProfile();
  const projectIds = new Set(profile.projects.map((p) => p.id));
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const urlKey = (url) => {
    try {
      const u = new URL(url);
      const host = u.host.toLowerCase().replace(/^www\./, "");
      const pathname = u.pathname.replace(/\/+$/, "").toLowerCase();
      // A bare shared host says nothing about which project is meant.
      if (!pathname && /(^|\.)(github\.com|youtube\.com|linkedin\.com|vercel\.app|npmjs\.com)$/.test(host)) return null;
      return host + pathname;
    } catch {
      return null;
    }
  };
  const shortName = (p) => p.name.split(/ — | \(| - /)[0].trim();
  // A short name two projects share ("Sanicle AI", "FemTracker") cannot say which
  // one a post means, so neither is matched by name.
  const nameUses = {};
  for (const p of profile.projects) nameUses[shortName(p)] = (nameUses[shortName(p)] ?? 0) + 1;
  const matchers = profile.projects.filter((p) => !NOT_MATCHED.has(p.id)).map((p) => {
    const name = shortName(p);
    const keys = [p.url, p.repoUrl, p.demoUrl].map((u) => u && urlKey(u)).filter(Boolean);
    return {
      id: p.id,
      name:
        name.length >= 5 && nameUses[name] === 1 && !NAME_TOO_AMBIGUOUS.has(p.id)
          ? new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(name)}(?![\\p{L}\\p{N}])`, "u")
          : null,
      // The address itself: not a page under it, not a subdomain of it.
      links: keys.map((k) => new RegExp(`(?<![\\w.-])${escapeRe(k)}(?![\\w-]|\\.\\w|/\\w)`)),
    };
  });
  function projectsNamed(p) {
    const text = p.text || "";
    const haystack = [text, ...(p.media ?? []).flatMap((m) => [m.url, m.title])].filter(Boolean).join("\n").toLowerCase();
    return matchers.filter((m) => m.name?.test(text) || m.links.some((re) => re.test(haystack))).map((m) => m.id);
  }

  const curation = readYaml(CURATION) ?? {};
  for (const [id, fields] of Object.entries(curation)) {
    for (const key of Object.keys(fields ?? {})) {
      if (!CURATED.includes(key)) fail(`${rel(CURATION)}: post ${id} has "${key}"; the curated keys are ${CURATED.join(", ")}`);
    }
    if (fields?.topic && !TOPICS.includes(fields.topic)) {
      fail(`@/curation.yaml: post ${id} has topic "${fields.topic}"; the topics are ${TOPICS.join(", ")}`);
    }
    for (const pid of fields?.projectIds ?? []) {
      if (!projectIds.has(pid)) fail(`${rel(CURATION)}: post ${id} names "${pid}", which is not a projects[].id`);
    }
  }

  // ---------------------------------------------------------------------------
  // Capture → register rows
  // ---------------------------------------------------------------------------
  const cleanText = (text) =>
    (text || "")
      .split("\n")
      .map((line) => line.replace(/[ \t ]+$/, ""))
      .join("\n")
      .trim();

  function formatOf(media) {
    const type = media?.[0]?.type;
    return type ?? "text";
  }

  function toRow(p) {
    const before = previousPost.get(p.id)?.metrics ?? {};
    const text = cleanText(p.text);
    const row = { id: p.id, url: p.url, at: p.at, posted: nzDate(p.at), kind: p.kind, format: formatOf(p.media) };
    if (p.edited) row.edited = true;
    if (p.lang) row.lang = p.lang;
    const curated = curation[p.id] ?? {};
    // A post someone has tagged keeps exactly the projects they gave it, even none.
    const named = curation[p.id] ? (curated.projectIds ?? []) : projectsNamed({ ...p, text });
    if (curated.topic) row.topic = curated.topic;
    if (named.length) row.projectIds = named;
    if (curated.flags) row.flags = curated.flags;
    if (curated.note) row.note = curated.note;
    row.metrics = Object.fromEntries(METRICS.map((k) => [k, Math.max(p.m?.[k] ?? 0, before[k] ?? 0)]));
    if (Object.keys(p.m?.types ?? {}).length) row.reactionTypes = p.m.types;
    if (p.original) row.original = originalRef(p.original);
    if (p.media?.length) {
      row.media = p.media.map((m) => {
        if (m.type === "image") return { type: "image", size: `${m.w}x${m.h}`, alt: m.alt ?? null };
        if (m.type === "video") return { type: "video", seconds: Math.round((m.ms ?? 0) / 1000) };
        const { type, ...rest } = m;
        return { type, ...rest };
      });
    }
    if (p.mentions?.length) row.mentions = p.mentions;
    if (p.hashtags?.length) row.hashtags = p.hashtags;
    if (p.links?.length) row.links = p.links;
    row.chars = text.length;
    row.text = text;
    return row;
  }

  function originalRef(o) {
    return { author: o.author, posted: nzDate(o.at), url: o.url, opens: o.opens ?? "" };
  }

  const own = capture.posts.filter((p) => p.kind !== "repost");
  const posts = own.map(toRow);
  const capturedIds = new Set(own.map((p) => p.id));
  for (const [id, old] of previousPost) {
    if (!capturedIds.has(id)) posts.push({ ...old, deletedSeen: old.deletedSeen ?? capture.capturedAt });
  }
  posts.sort(byIdDesc);

  // A plain repost carries the original author's id, time and counts, and
  // LinkedIn does not say when Chan reposted it. Its place in the feed gives a
  // window: no earlier than the original or the next older post of hers, no
  // later than the next newer one.
  const reposts = [];
  capture.posts.forEach((p, i) => {
    if (p.kind !== "repost") return;
    const newer = capture.posts.slice(0, i).findLast((q) => q.at);
    const older = capture.posts.slice(i + 1).find((q) => q.at);
    const after = [p.original.at, older?.at].filter(Boolean).sort().at(-1);
    reposts.push({
      id: p.original.id,
      ...(capture.newestFirst === false
        ? {}
        : { repostedBetween: [nzDate(after), newer ? nzDate(newer.at) : capture.capturedAt] }),
      ...originalRef(p.original),
    });
  });
  const repostIds = new Set(reposts.map((r) => r.id));
  for (const [id, old] of previousRepost) {
    if (!repostIds.has(id)) reposts.push({ ...old, deletedSeen: old.deletedSeen ?? capture.capturedAt });
  }

  // ---------------------------------------------------------------------------
  // The hand-maintained account record must agree with what LinkedIn showed
  // ---------------------------------------------------------------------------
  const drift = [];
  const notes = [];
  const account = readYaml(ACCOUNT)?.account;
  if (account) {
    for (const [key, live] of Object.entries({ displayName: user.name, headline: user.headline })) {
      if (String(account[key] ?? "").trim() !== String(live ?? "").trim()) {
        drift.push(`account.${key} is "${account[key]}" but LinkedIn shows "${live}"`);
      }
    }
    // Reach is recorded at its maximum: only a HIGHER live number is drift.
    if (user.followers > (account.counts?.followers ?? 0)) {
      drift.push(`account.counts.followers is ${account.counts?.followers} but LinkedIn shows ${user.followers}: raise it`);
    }
    if (account.asOf !== capture.capturedAt) {
      drift.push(`account.asOf is ${account.asOf} but the capture is from ${capture.capturedAt}`);
    }
  }
  if (isMember && user.headline !== profile.basics.headline) {
    notes.push("the live headline differs from basics.headline in data/profile/00-basics.yaml");
  }
  const recorded = (profile.basics.reach?.metrics ?? []).find(
    (m) => m.label === "LinkedIn followers",
  );
  const recordedFollowers = recorded ? Number(String(recorded.value).replace(/\D/g, "")) : null;
  if (isMember && recordedFollowers != null && user.followers > recordedFollowers) {
    notes.push(
      `LinkedIn shows ${user.followers} followers; data/profile/00-basics.yaml records ${recorded.value}. ` +
        "The standing rule is to raise it (career-copy skill for the surfaces that quote it)",
    );
  }

  // ---------------------------------------------------------------------------
  // Summary: the two-minute read
  // ---------------------------------------------------------------------------
  const live = posts.filter((p) => !p.deletedSeen);
  const liveReposts = reposts.filter((r) => !r.deletedSeen);
  const sum = (rows, k) => rows.reduce((n, r) => n + r.metrics[k], 0);
  const countBy = (rows, keysOf) => {
    const out = {};
    for (const row of rows) for (const key of [keysOf(row)].flat()) out[key] = (out[key] ?? 0) + 1;
    return out;
  };
  const topCounts = (counts, n) => Object.fromEntries(Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, n));
  const groupStats = (rows, keysOf, extra = () => ({})) => {
    const groups = {};
    for (const row of rows) for (const key of [keysOf(row)].flat()) (groups[key] ??= []).push(row);
    return Object.fromEntries(
      Object.entries(groups).map(([key, members]) => [
        key,
        { posts: members.length, reactions: sum(members, "reactions"), comments: sum(members, "comments"), ...extra(members) },
      ]),
    );
  };
  const sortKeysDesc = (obj) => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => (a < b ? 1 : -1)));
  const sortByPosts = (obj) => Object.fromEntries(Object.entries(obj).sort(([, a], [, b]) => b.posts - a.posts || b.reactions - a.reactions));
  const within = (days) => live.filter((p) => daysBetween(p.posted, capture.capturedAt) <= days).length;
  const lastPost = live[0];

  const summary = {
    posts: live.length,
    reposts: liveReposts.length,
    byKind: countBy(live, (p) => p.kind),
    firstPost: live.at(-1).posted,
    lastPost: lastPost.posted,
    daysSinceLastPost: daysBetween(lastPost.posted, capture.capturedAt),
    cadence: { last30Days: within(30), last90Days: within(90), last365Days: within(365) },
    engagement: {
      ...Object.fromEntries(METRICS.map((k) => [k, sum(live, k)])),
      medianReactions: median(live.map((p) => p.metrics.reactions)),
      postsWithComments: live.filter((p) => p.metrics.comments).length,
    },
    length: { medianChars: median(live.map((p) => p.chars)), longestChars: Math.max(...live.map((p) => p.chars)) },
    byFormat: sortByPosts(groupStats(live, (p) => p.format, (m) => ({ medianReactions: median(m.map((p) => p.metrics.reactions)) }))),
    byYear: sortKeysDesc(groupStats(live, (p) => p.posted.slice(0, 4), (m) => ({ medianReactions: median(m.map((p) => p.metrics.reactions)) }))),
    byMonth: sortKeysDesc(groupStats(live, (p) => p.posted.slice(0, 7))),
    byTopic: sortByPosts(groupStats(live, (p) => p.topic ?? "(untagged)", (m) => ({ medianReactions: median(m.map((p) => p.metrics.reactions)) }))),
    byProject: sortByPosts(groupStats(live, (p) => (p.projectIds?.length ? p.projectIds : ["(none)"]))),
    topHashtags: topCounts(countBy(live, (p) => p.hashtags ?? []), 25),
    topMentions: topCounts(countBy(live, (p) => p.mentions ?? []), 20),
    resharedAuthors: topCounts(countBy(live.filter((p) => p.original), (p) => p.original.author), 20),
    repostedAuthors: topCounts(countBy(liveReposts, (r) => r.author), 20),
    topByReactions: [...live]
      .sort((a, b) => b.metrics.reactions - a.metrics.reactions)
      .slice(0, 10)
      .map((p) => ({ id: p.id, posted: p.posted, format: p.format, ...p.metrics, opens: firstLine(p.text, 90) })),
    flagged: live.filter((p) => p.flags?.length).map((p) => ({ id: p.id, posted: p.posted, flags: p.flags })),
  };

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  const dump = (data) => yaml.dump(data, { lineWidth: -1, noRefs: true, quotingType: '"' });
  const flow = (data) => yaml.dump(data, { lineWidth: -1, noRefs: true, quotingType: '"', flowLevel: 0 }).trimEnd();
  // A mapping of nothing but numbers reads better on one line; the YAML means the same.
  function compact(body) {
    const out = body.replace(
      /^( *)(- )?([^\s:-][^:\n]*|"[^"\n]*"):\n((?: +(?:[^\s:"-][^:\n"]*|"[^"\n]*"): \d+\n)+)/gm,
      (whole, indent, dash = "", key, block, offset, text) => {
        const lines = block.trimEnd().split("\n");
        const childIndent = indent.length + dash.length + 2;
        const depth = (l) => l.length - l.trimStart().length;
        if (!lines.every((l) => depth(l) === childIndent)) return whole;
        const after = text.slice(offset + whole.length).split("\n", 1)[0];
        if (after.trim() && depth(after) >= childIndent) return whole;
        const oneLine = `{ ${lines.map((l) => l.trim()).join(", ")} }`;
        // A key holding a comma or a brace (a person's name can) reads differently in flow style.
        try {
          if (JSON.stringify(yaml.load(oneLine)) !== JSON.stringify(yaml.load(lines.map((l) => l.trim()).join("\n")))) return whole;
        } catch {
          return whole;
        }
        return `${indent}${dash}${key}: ${oneLine}\n`;
      },
    );
    if (JSON.stringify(yaml.load(out)) !== JSON.stringify(yaml.load(body))) {
      fail("the compacted YAML no longer parses to the same data");
    }
    return out;
  }

  const banner = (title, lines) =>
    `# ${"=".repeat(77)}\n# ${title}\n# ${"=".repeat(77)}\n${lines.map((l) => (l ? `# ${at(l)}` : "#")).join("\n")}\n# ${"=".repeat(77)}\n\n`;

  const head = { account: pageAddress, asOf: capture.capturedAt, source: capture.source };

  // One row per line: a list a reader scans, and that grep answers.
  const flowList = (key, rows, indent = 0) => {
    const pad = " ".repeat(indent);
    if (!rows.length) return `${pad}${key}: []\n`;
    return `${pad}${key}:\n${rows.map((row) => `${pad}  - ${flow(row)}\n`).join("")}`;
  };
  const { topByReactions, flagged, ...summaryMaps } = summary;

  const indexRow = (p) => {
    const row = { id: p.id, posted: p.posted, kind: p.kind, format: p.format };
    if (p.format === "image" && p.media.length > 1) row.images = p.media.length;
    Object.assign(row, p.metrics, { chars: p.chars });
    if (p.projectIds) row.projectIds = p.projectIds;
    if (p.topic) row.topic = p.topic;
    if (p.flags) row.flags = p.flags;
    if (p.deletedSeen) row.deletedSeen = p.deletedSeen;
    row.opens = firstLine(p.text) || (p.media?.[0]?.title ?? "");
    return row;
  };

  const indexText =
    banner(`LinkedIn post register — ${pageAddress}`, [
      "Every post and repost the account shows, newest first, as captured from",
      "linkedin.com on the `asOf` date. GENERATED by `npm run build:linkedin-register`",
      "from @/capture/latest.json: do not edit this file. How to capture and",
      "rebuild: linkedin/README.md § The account register.",
      "",
      "This file is the short read: `summary`, then one line per post. A post's full",
      "text, links, media and mentions are in @/posts/<year>.yaml under the",
      "same `id`. Its page is https://www.linkedin.com/feed/update/urn:li:activity:<id>/",
      "",
      "`kind`: post, or reshare (the account's words above someone else's post). `reposts`",
      "at the end are plain reposts: someone else's post passed on without comment.",
      "`format` is what the post carries: text, image, video, article (a link card),",
      "document, celebration, entity. `posted` is the Auckland date.",
      "",
      "`reactions`, `comments` and `reposts` are LinkedIn's public counts, kept at",
      "their historical maximum: a rebuild never lowers one. Impressions are shown",
      "to the author only and are not in any tracked file; when the local-only",
      "@/posts.private.yaml is present, read it for reach.",
      "",
      "`topic` is why the post exists, one of: " + TOPICS.slice(0, 5).join(", ") + ",",
      TOPICS.slice(5).join(", ") + ". `projectIds` → projects[].id in data/profile/:",
      "the projects the post is about. Both come from @/curation.yaml, where the",
      "tags are Claude's, made at Chan's request on 2026-10-08, and she may overrule",
      "any of them. A post with no entry there gets no `topic`, and its `projectIds`",
      "are found by rule (a project's name, site or repo in the text or link card).",
      "`flags` and `note` come only from @/curation.yaml. `flags` records",
      "where a live post disagrees with a rule or a fact decided since",
      "(docs/STATE.md); it is a note for Chan, not an instruction to delete.",
      "",
      "This repo is public and so is every post here. Nothing private belongs in a",
      "tracked file: no messages, no drafts, no analytics, no connection list.",
    ]) +
    compact(dump({ ...head, summary: summaryMaps })) +
    flowList("topByReactions", topByReactions, 2) +
    flowList("flagged", flagged, 2) +
    flowList("posts", posts.map(indexRow)) +
    flowList("reposts", reposts);

  const years = [...new Set(posts.map((p) => p.posted.slice(0, 4)))].sort().reverse();
  const outputs = new Map([[INDEX, indexText]]);
  for (const year of years) {
    const rows = posts.filter((p) => p.posted.startsWith(year));
    outputs.set(
      path.join(YEARS_DIR, `${year}.yaml`),
      banner(`LinkedIn posts in full — ${year}`, [
        `The ${rows.length} posts dated ${year} (Auckland dates), newest first. GENERATED by`,
        "`npm run build:linkedin-register`: do not edit. The summary and the one-line",
        "index are in @/posts.yaml; the field notes are in its header.",
        "",
        "`at` is UTC. `text` is what a reader sees, with trailing spaces removed.",
        "A link LinkedIn shortened stays as its lnkd.in address. `alt` on an image",
        "is whatever LinkedIn holds, which is its own machine description when Chan",
        "wrote none. `original` on a reshare is the post she shared: its author,",
        "date, address and opening line, not its text.",
      ]) + compact(dump({ ...head, year, posts: rows })),
    );
  }

  // The private half: impressions, kept at their maximum like every reach count.
  let privateText = null;
  if (fs.existsSync(CAPTURE_PRIVATE)) {
    const now = JSON.parse(fs.readFileSync(CAPTURE_PRIVATE, "utf8")).impressions ?? {};
    const before = readYaml(PRIVATE)?.impressions ?? {};
    const impressions = {};
    for (const p of posts) {
      const n = Math.max(now[p.id] ?? 0, before[p.id] ?? 0);
      if (n) impressions[p.id] = n;
    }
    const seen = live.filter((p) => impressions[p.id]);
    const imp = (rows) => rows.reduce((n, p) => n + impressions[p.id], 0);
    const stats = (keysOf) => {
      const groups = {};
      for (const p of seen) for (const key of [keysOf(p)].flat()) (groups[key] ??= []).push(p);
      return Object.fromEntries(
        Object.entries(groups).map(([key, m]) => [
          key,
          { posts: m.length, impressions: imp(m), medianImpressions: median(m.map((p) => impressions[p.id])) },
        ]),
      );
    };
    const interactions = seen.reduce((n, p) => n + p.metrics.reactions + p.metrics.comments + p.metrics.reposts, 0);
    const privateSummary = {
      postsWithImpressions: seen.length,
      impressions: imp(seen),
      medianImpressions: median(seen.map((p) => impressions[p.id])),
      interactionsPer1000Impressions: Math.round((interactions / imp(seen)) * 10000) / 10,
      byYear: sortKeysDesc(stats((p) => p.posted.slice(0, 4))),
      byMonth: sortKeysDesc(stats((p) => p.posted.slice(0, 7))),
      byFormat: Object.fromEntries(Object.entries(stats((p) => p.format)).sort(([, a], [, b]) => b.posts - a.posts)),
      byKind: stats((p) => p.kind),
      byTopic: Object.fromEntries(Object.entries(stats((p) => p.topic ?? "(untagged)")).sort(([, a], [, b]) => b.posts - a.posts)),
      byProject: Object.fromEntries(
        Object.entries(stats((p) => (p.projectIds?.length ? p.projectIds : ["(none)"]))).sort(([, a], [, b]) => b.posts - a.posts),
      ),
      topByImpressions: [...seen]
        .sort((a, b) => impressions[b.id] - impressions[a.id])
        .slice(0, 20)
        .map((p) => ({ id: p.id, posted: p.posted, format: p.format, impressions: impressions[p.id], ...p.metrics, opens: firstLine(p.text, 90) })),
    };
    const { topByImpressions, ...privateMaps } = privateSummary;
    privateText =
      banner("LinkedIn impressions — LOCAL ONLY, gitignored", [
        "Impressions are shown to the author only, so this file is never committed",
        "and nothing in it is copied into a tracked file, a commit message or",
        "generated output. GENERATED by `npm run build:linkedin-register` from",
        "@/capture/latest.private.json. Each count is the maximum seen.",
        "`impressions` at the end maps a post id (@/posts.yaml) to its count.",
      ]) +
      compact(dump({ ...head, summary: privateMaps })) +
      flowList("topByImpressions", topByImpressions, 2) +
      "impressions:\n" +
      posts
        .filter((p) => impressions[p.id])
        .map((p) => `  "${p.id}": ${impressions[p.id]}\n`)
        .join("");
  }

  // ---------------------------------------------------------------------------
  // Write
  // ---------------------------------------------------------------------------
  const report = () => {
    console.log(
      `${base}/posts.yaml: ${summary.posts} posts and ${summary.reposts} reposts, ` +
        `${summary.firstPost} → ${summary.lastPost} (capture ${capture.capturedAt})`,
    );
    for (const n of notes) console.log(at(`  note: ${n}`));
    for (const d of drift) console.error(`  DRIFT: ${d}`);
  };

  const stale = [...outputs].filter(([file, text]) => !fs.existsSync(file) || fs.readFileSync(file, "utf8") !== text);
  const strayYears = fs.existsSync(YEARS_DIR)
    ? fs.readdirSync(YEARS_DIR).filter((f) => /^\d{4}\.yaml$/.test(f) && !years.includes(f.slice(0, 4)))
    : [];

  if (check) {
    report();
    if (stale.length || strayYears.length) {
      fail(`${[...stale.map(([f]) => rel(f)), ...strayYears].join(", ")} stale: run \`npm run build:linkedin-register\``);
    }
    if (drift.length) fail("@/account.yaml disagrees with the capture");
    return;
  }

  fs.mkdirSync(YEARS_DIR, { recursive: true });
  for (const [file, text] of outputs) fs.writeFileSync(file, text);
  for (const file of strayYears) fs.rmSync(path.join(YEARS_DIR, file));
  if (privateText) fs.writeFileSync(PRIVATE, privateText);
  report();
  if (drift.length) fail("@/account.yaml disagrees with the capture: update it, then rebuild");
}

for (const base of REGISTERS) buildRegister(base);
