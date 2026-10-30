// Emit distribution/status.yaml and distribution/calendar.md — where every
// finished film is published, where it is not yet, and what is scheduled.
//
// Inputs, none of which this script changes:
//   data/profile/46-films.yaml       the filmography (YouTube ids, site flag)
//   distribution/plan.yaml           policy, posts already made, the schedule
//   youtube/videos.yaml              upload dates and views
//   x/posts.yaml                     X posts
//   linkedin/posts/<year>.yaml       LinkedIn posts (personal profile)
//   linkedin/company/archcanvas/posts/<year>.yaml   the ArchCanvas page
//
// The outputs carry no timestamp, so they change only when an input does.
// Draft text (the private chanmeng-marketing repo, drafts/) and staged video files
// (distribution/_staging/, gitignored) are checked when present and never
// required: CI and other machines do not have them.
//
//   node scripts/build-distribution.mjs [--check]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import { loadProfile } from "./lib/load-profile.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(repoRoot, "distribution");
const check = process.argv.includes("--check");
const readYaml = (rel) => yaml.load(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const plan = readYaml("distribution/plan.yaml");
const profile = loadProfile();
const films = profile.films ?? [];
const filmById = new Map(films.map((f) => [f.id, f]));
const platformIds = Object.keys(plan.platforms ?? {});
const SOCIAL = ["linkedin", "x", "linkedin-page"];
const STATUSES = ["draft", "approved", "posted", "skipped"];

// ---- registers --------------------------------------------------------------
const yt = readYaml("youtube/videos.yaml");
const ytById = new Map((yt.videos ?? []).map((v) => [v.id, v]));

const xReg = readYaml("x/posts.yaml");
const xById = new Map();
for (const t of xReg.threads ?? [])
  for (const p of t.posts ?? [])
    xById.set(String(p.id), {
      date: t.posted,
      url: `https://x.com/chanmeng666/status/${p.id}`,
      counts: { views: p.metrics?.views ?? 0, likes: p.metrics?.likes ?? 0, replies: p.metrics?.replies ?? 0 },
    });

function linkedinPosts(relDir) {
  const out = new Map();
  const abs = path.join(repoRoot, relDir);
  for (const f of fs.readdirSync(abs).filter((n) => /^\d{4}\.yaml$/.test(n))) {
    const d = yaml.load(fs.readFileSync(path.join(abs, f), "utf8"));
    for (const p of d.posts ?? d ?? [])
      out.set(String(p.id), {
        date: p.posted,
        url: p.url ?? `https://www.linkedin.com/feed/update/urn:li:activity:${p.id}/`,
        counts: { reactions: p.metrics?.reactions ?? 0, comments: p.metrics?.comments ?? 0, reposts: p.metrics?.reposts ?? 0 },
      });
  }
  return out;
}
const liReg = readYaml("linkedin/posts.yaml");
const pageReg = readYaml("linkedin/company/archcanvas/posts.yaml");
const registerPosts = {
  x: xById,
  linkedin: linkedinPosts("linkedin/posts"),
  "linkedin-page": linkedinPosts("linkedin/company/archcanvas/posts"),
};
const registersAsOf = { youtube: yt.asOf, x: xReg.asOf, linkedin: liReg.asOf, "linkedin-page": pageReg.asOf };

// ---- policy -----------------------------------------------------------------
function policyFor(film) {
  const facts = { kind: film.kind, primary: !!film.primary, notShown: !film.onFilmsPage };
  for (const rule of plan.policy ?? []) {
    if (Object.entries(rule.match ?? {}).every(([k, v]) => facts[k] === v)) return rule;
  }
  err(`no policy rule matches film "${film.id}" (kind ${film.kind})`);
  return { id: "none", targets: [] };
}
for (const rule of plan.policy ?? [])
  for (const t of rule.targets ?? []) if (!platformIds.includes(t)) err(`policy ${rule.id}: unknown platform "${t}"`);

const overridesByFilm = new Map();
for (const o of plan.overrides ?? []) {
  if (!filmById.has(o.film)) { err(`overrides: unknown film "${o.film}"`); continue; }
  for (const t of [...(o.add ?? []), ...(o.remove ?? [])]) if (!platformIds.includes(t)) err(`overrides ${o.film}: unknown platform "${t}"`);
  if (!overridesByFilm.has(o.film)) overridesByFilm.set(o.film, []);
  overridesByFilm.get(o.film).push(o);
}

// ---- posts already made and posts scheduled ---------------------------------
const postedBy = new Map(); // "film|platform" -> rows
for (const p of plan.posted ?? []) {
  if (!filmById.has(p.film)) { err(`posted: unknown film "${p.film}"`); continue; }
  if (!SOCIAL.includes(p.platform)) { err(`posted ${p.film}: platform must be one of ${SOCIAL.join(", ")}, got "${p.platform}"`); continue; }
  const reg = registerPosts[p.platform].get(String(p.post));
  if (!reg) err(`posted ${p.film} on ${p.platform}: post ${p.post} is not in the register (sync the register first, or fix the id)`);
  const key = `${p.film}|${p.platform}`;
  if (!postedBy.has(key)) postedBy.set(key, []);
  postedBy.get(key).push({ post: String(p.post), via: p.via, cut: p.cut, ...(reg ?? {}), ...(p.note ? { note: p.note } : {}) });
}
const scheduledBy = new Map();
const scheduleDates = new Map(); // "date|platform" -> film
for (const s of plan.schedule ?? []) {
  const where = `schedule ${s.date} ${s.film} ${s.platform}`;
  if (!filmById.has(s.film)) { err(`${where}: unknown film`); continue; }
  if (!SOCIAL.includes(s.platform)) err(`${where}: platform must be one of ${SOCIAL.join(", ")}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date ?? "")) err(`${where}: date must be YYYY-MM-DD`);
  if (!STATUSES.includes(s.status)) err(`${where}: status must be one of ${STATUSES.join(", ")}`);
  const key = `${s.film}|${s.platform}`;
  if (scheduledBy.has(key)) err(`${where}: this film is scheduled twice on this platform`);
  scheduledBy.set(key, s);
  const slot = `${s.date}|${s.platform}`;
  if (scheduleDates.has(slot) && s.status !== "skipped") err(`${where}: ${scheduleDates.get(slot)} is already scheduled on this platform that day`);
  scheduleDates.set(slot, s.film);
  if (postedBy.has(key) && s.status !== "skipped") warn(`${where}: this film already has a post on this platform (${postedBy.get(key)[0].date})`);
}

// ---- drafts and staged files (local only; checked when present) -------------
const draftsDir = path.resolve(DIR, "..", "..", "chanmeng-marketing", "drafts");
const stagingDir = path.join(DIR, "_staging");
const haveDrafts = fs.existsSync(draftsDir);
const haveStaging = fs.existsSync(stagingDir);
const xLimit = plan.constraints?.x?.maxChars ?? 280;
const urlChars = plan.constraints?.x?.urlChars ?? 23;
const xLength = (text) => [...text.trim().replace(/https?:\/\/\S+/g, "x".repeat(urlChars))].length;
for (const s of plan.schedule ?? []) {
  if (s.status === "skipped" || s.status === "posted") continue;
  const where = `schedule ${s.date} ${s.film} ${s.platform}`;
  if (haveDrafts && s.draft) {
    const [file, key] = String(s.draft).split("#");
    const abs = path.join(draftsDir, file);
    if (!fs.existsSync(abs)) warn(`${where}: draft file drafts/${file} is missing`);
    else {
      const d = yaml.load(fs.readFileSync(abs, "utf8"));
      const block = d?.[key];
      if (!block?.text) warn(`${where}: drafts/${file} has no "${key}.text"`);
      else {
        if (s.platform === "x") {
          for (const [name, text] of [["text", block.text], ["reply", block.reply]]) {
            if (text && xLength(text) > xLimit) err(`${where}: drafts/${file} ${key}.${name} is ${xLength(text)} characters, X allows ${xLimit}`);
          }
        }
        if (s.status === "approved" && /\[YOURS/.test(JSON.stringify(block))) err(`${where}: marked approved but the draft still has a [YOURS] placeholder`);
        if (block.status && block.status !== s.status) warn(`${where}: plan says ${s.status}, drafts/${file} says ${block.status}`);
      }
    }
  }
  if (haveStaging && s.asset && !fs.existsSync(path.join(stagingDir, s.asset))) warn(`${where}: staged file _staging/${s.asset} is missing (npm run stage:distribution)`);
}

// ---- the matrix -------------------------------------------------------------
const rows = films.map((film) => {
  const rule = policyFor(film);
  const ov = overridesByFilm.get(film.id) ?? [];
  const targets = new Set(rule.targets ?? []);
  for (const o of ov) { for (const t of o.add ?? []) targets.add(t); for (const t of o.remove ?? []) targets.delete(t); }
  const owner = ov.find((o) => o.owner)?.owner ?? null;
  const platforms = {};
  for (const pid of platformIds) {
    const targeted = targets.has(pid);
    let cell = null;
    if (pid === "youtube" || pid === "youtube-short") {
      const id = pid === "youtube" ? film.youtubeId : film.shortYoutubeId;
      if (id) {
        const v = ytById.get(id);
        if (!v) warn(`${film.id}: ${pid} id ${id} is not in youtube/videos.yaml (run npm run capture:youtube)`);
        cell = { state: "published", id, url: pid === "youtube" ? `https://youtu.be/${id}` : `https://youtube.com/shorts/${id}`, ...(v ? { date: v.uploadedUtc, counts: { views: v.views ?? 0 } } : {}) };
      }
    } else if (pid === "site") {
      if (film.onFilmsPage) cell = { state: "published", url: "https://chanmeng.org/films" };
    } else {
      const key = `${film.id}|${pid}`;
      const done = postedBy.get(key);
      const sched = scheduledBy.get(key);
      if (done) cell = { state: "published", posts: done };
      else if (sched && sched.status === "skipped") cell = { state: "skipped", ...(sched.note ? { note: sched.note } : {}) };
      else if (sched) cell = { state: "planned", date: sched.date, status: sched.status, cut: sched.cut, ...(sched.note ? { note: sched.note } : {}) };
    }
    if (!cell) {
      if (!targeted) cell = { state: "not-planned" };
      else if (owner && SOCIAL.includes(pid)) cell = { state: "gap", scheduledIn: owner };
      else cell = { state: "gap" };
    }
    if (cell.state === "published" && !targeted) cell.outsidePolicy = true;
    platforms[pid] = cell;
  }
  const row = { film: film.id, title: film.title, kind: film.kind, for: film.for ?? null, policy: rule.id, platforms };
  if (rule.reason) row.reason = rule.reason;
  if (owner) row.scheduledIn = owner;
  const gaps = platformIds.filter((p) => platforms[p].state === "gap");
  row.complete = gaps.length === 0 && !platformIds.some((p) => platforms[p].state === "planned");
  return row;
});

const count = (state) => rows.reduce((n, r) => n + platformIds.filter((p) => r.platforms[p].state === state).length, 0);
const gaps = [];
for (const r of rows)
  for (const p of platformIds)
    if (r.platforms[p].state === "gap") gaps.push({ film: r.film, platform: p, ...(r.platforms[p].scheduledIn ? { scheduledIn: r.platforms[p].scheduledIn } : {}) });

const status = {
  source: "GENERATED by npm run build:distribution from distribution/plan.yaml, data/profile/46-films.yaml and the platform registers. Do not edit.",
  planAsOf: plan.asOf,
  registersAsOf,
  summary: {
    films: rows.length,
    complete: rows.filter((r) => r.complete).length,
    cells: { published: count("published"), planned: count("planned"), gap: count("gap"), skipped: count("skipped"), "not-planned": count("not-planned") },
    byPlatform: Object.fromEntries(platformIds.map((p) => [p, {
      published: rows.filter((r) => r.platforms[p].state === "published").length,
      planned: rows.filter((r) => r.platforms[p].state === "planned").length,
      gap: rows.filter((r) => r.platforms[p].state === "gap").length,
    }])),
  },
  gaps,
  films: rows,
};

// ---- calendar.md ------------------------------------------------------------
const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayOf = (d) => DAY[new Date(`${d}T00:00:00Z`).getUTCDay()];
const weekStart = (d) => { const t = new Date(`${d}T00:00:00Z`); const back = (t.getUTCDay() + 6) % 7; t.setUTCDate(t.getUTCDate() - back); return t.toISOString().slice(0, 10); };
const MARK = { draft: "draft", approved: "approved", posted: "posted", skipped: "skipped" };
const pname = (p) => plan.platforms[p]?.name ?? p;
const sched = [...(plan.schedule ?? [])].sort((a, b) => (a.date + a.platform).localeCompare(b.date + b.platform));
const weeks = new Map();
for (const s of sched) { const w = weekStart(s.date); if (!weeks.has(w)) weeks.set(w, []); weeks.get(w).push(s); }

let md = `# Film posting calendar

<!-- GENERATED by \`npm run build:distribution\` from distribution/plan.yaml. Do not edit: change the plan, then rebuild. -->

What to post, where, on which day. Chan posts by hand; nothing here is posted for her.
How to run it with Claude Code, and what each column means: [README.md](./README.md).
Where every film stands on every platform: [status.yaml](./status.yaml).

Plan as of ${plan.asOf}. Registers read: YouTube ${registersAsOf.youtube}, X ${registersAsOf.x}, LinkedIn ${registersAsOf.linkedin}, ArchCanvas page ${registersAsOf["linkedin-page"]}.
A post made after those dates is not known here until its register is synced.

## The schedule

`;
for (const [w, items] of weeks) {
  md += `### Week of ${w}\n\n| Date | Day | Film | Platform | Cut | File to upload | Draft | Status |\n|---|---|---|---|---|---|---|---|\n`;
  for (const s of items) {
    const f = filmById.get(s.film);
    md += `| ${s.date} | ${dayOf(s.date)} | ${f?.title ?? s.film} | ${pname(s.platform)} | ${s.cut ?? ""} | ${s.asset ? `\`_staging/${s.asset}\`` : "none (link post)"} | ${s.draft ? `\`drafts/${s.draft}\`` : ""} | ${MARK[s.status] ?? s.status} |\n`;
  }
  const notes = items.filter((s) => s.note);
  if (notes.length) md += `\n${[...new Set(notes.map((s) => `- ${filmById.get(s.film)?.title ?? s.film}: ${s.note}`))].join("\n")}\n`;
  md += "\n";
}
const elsewhere = gaps.filter((g) => g.scheduledIn);
const open = gaps.filter((g) => !g.scheduledIn);
md += `## Not yet published and not scheduled here\n\n`;
if (!gaps.length) md += "Nothing: every film is published or scheduled on every platform it is meant for.\n\n";
if (open.length) md += `${open.map((g) => `- ${filmById.get(g.film).title}: ${pname(g.platform)}`).join("\n")}\n\n`;
if (elsewhere.length) md += `Scheduled in another calendar:\n\n${elsewhere.map((g) => `- ${filmById.get(g.film).title}: ${pname(g.platform)} (${g.scheduledIn})`).join("\n")}\n\n`;

md += `## Where each film stands\n\n| Film | ${platformIds.map(pname).join(" | ")} |\n|---|${platformIds.map(() => "---").join("|")}|\n`;
const cellText = (c) => {
  if (c.state === "published") return c.posts ? `published ${c.posts.map((p) => p.date).filter(Boolean).sort()[0] ?? ""}`.trim() : `published${c.date ? ` ${c.date}` : ""}`;
  if (c.state === "planned") return `planned ${c.date}`;
  if (c.state === "gap") return c.scheduledIn ? "to do (other calendar)" : "**to do**";
  if (c.state === "skipped") return "skipped";
  return "—";
};
for (const r of rows) md += `| ${r.title} | ${platformIds.map((p) => cellText(r.platforms[p])).join(" | ")} |\n`;
md += `\n"—" means the film is not meant for that platform; the reason is the film's \`reason\` in status.yaml.\n`;

// ---- write or compare -------------------------------------------------------
const statusText = yaml.dump(status, { lineWidth: 200, noRefs: true });
const outputs = [["status.yaml", `# GENERATED by npm run build:distribution. Do not edit: change distribution/plan.yaml or sync a register, then rebuild.\n${statusText}`], ["calendar.md", md]];

for (const w of warnings) console.warn(`  ! ${w}`);
if (errors.length) {
  console.error(`build-distribution: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
let stale = false;
for (const [name, text] of outputs) {
  const file = path.join(DIR, name);
  if (check) {
    if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== text) { console.error(`distribution/${name} is stale: run npm run build:distribution`); stale = true; }
  } else fs.writeFileSync(file, text);
}
if (stale) process.exit(1);
const s = status.summary;
console.log(`distribution${check ? " OK" : ""}: ${s.films} films, ${s.complete} fully out; cells: ${s.cells.published} published, ${s.cells.planned} planned, ${s.cells.gap} to do`);
