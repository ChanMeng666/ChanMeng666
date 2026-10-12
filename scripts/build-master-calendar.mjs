// Write distribution/master-calendar.md — every posting calendar Chan runs,
// merged into one view by date: the film schedule (distribution/plan.yaml)
// and the calendars named under `otherCalendars` there (today: the ArchCanvas
// and ArchLang content calendar in the private archcanvas-growth repository).
//
// It is a VIEW. Nothing is decided here and nothing is copied back: a film row
// is changed in distribution/plan.yaml, an ArchCanvas item in its own
// calendar file, which stays the authority on its dates and its checkboxes.
// The output is local and gitignored, because it quotes a private repository
// and because it depends on today's date. Rebuild it whenever it is read.
//
//   node scripts/build-master-calendar.mjs [--today YYYY-MM-DD]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import { loadProfile } from "./lib/load-profile.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(repoRoot, "distribution");
const plan = yaml.load(fs.readFileSync(path.join(DIR, "plan.yaml"), "utf8"));
const lineage = yaml.load(fs.readFileSync(path.join(repoRoot, "docs", "ecosystem", "lineage.yaml"), "utf8"));
const filmById = new Map((loadProfile().films ?? []).map((f) => [f.id, f]));

const argToday = process.argv.indexOf("--today");
const today = argToday > -1
  ? process.argv[argToday + 1]
  : new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date());
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayOf = (d) => DAY[new Date(`${d}T00:00:00Z`).getUTCDay()];
const MONTH = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
const pname = (p) => plan.platforms?.[p]?.name ?? p;

// ---- 1. the film schedule ---------------------------------------------------
// One item per film per day; its steps are the posts (one per platform).
const items = [];
const draftsDir = path.join(DIR, "drafts");
const stagingDir = path.join(DIR, "_staging");
const filmDays = new Map();
for (const s of plan.schedule ?? []) {
  if (s.status === "skipped") continue;
  const key = `${s.date}|${s.film}`;
  if (!filmDays.has(key)) filmDays.set(key, []);
  filmDays.get(key).push(s);
}
for (const [key, rows] of filmDays) {
  const [date, filmId] = key.split("|");
  const film = filmById.get(filmId);
  const steps = [];
  const blockers = [];
  for (const s of rows) {
    const done = s.status === "posted";
    let draftNote = "";
    if (!done && s.draft) {
      const [file, k] = String(s.draft).split("#");
      const abs = path.join(draftsDir, file);
      if (!fs.existsSync(abs)) blockers.push(`draft drafts/${file} is missing`);
      else {
        const block = yaml.load(fs.readFileSync(abs, "utf8"))?.[k];
        if (/\[YOURS/.test(JSON.stringify(block ?? ""))) blockers.push(`${pname(s.platform)}: a [YOURS] line is still open in drafts/${file}`);
      }
      draftNote = ` · draft \`drafts/${s.draft}\``;
    }
    if (!done && s.status === "draft") blockers.push(`${pname(s.platform)}: text not approved yet`);
    if (!done && s.asset && !fs.existsSync(path.join(stagingDir, s.asset))) blockers.push(`staged file _staging/${s.asset} is missing (npm run stage:distribution)`);
    steps.push({
      done,
      owner: "both",
      text: `${pname(s.platform)}: ${s.cut}${s.asset ? ` · upload \`_staging/${s.asset}\`` : " · link post, nothing to upload"}${draftNote} · ${s.status}${s.url ? ` · ${s.url}` : ""}${s.note ? ` · ${s.note}` : ""}`,
    });
  }
  items.push({ date, source: "films", title: `Film: ${film?.title ?? filmId}`, detail: [], steps, blockers: [...new Set(blockers)] });
}

// ---- 2. other calendars (markdown runbooks with dated ### sections) ---------
const notes = [];
for (const cal of plan.otherCalendars ?? []) {
  const abs = path.join(lineage.localRoot, cal.path);
  if (!fs.existsSync(abs)) { notes.push(`${cal.id}: ${cal.path} is not on this machine, so its items are missing below.`); continue; }
  const lines = fs.readFileSync(abs, "utf8").split(/\r?\n/);
  // Every section whose heading starts "## The schedule" is read (a calendar may
  // keep one schedule per account); a section ends at the next "## " heading.
  const inSchedule = [];
  let on = false;
  for (const l of lines) {
    if (/^## /.test(l)) on = /^## The schedule\b/.test(l);
    inSchedule.push(on && !/^## /.test(l));
  }
  if (!inSchedule.some(Boolean)) { notes.push(`${cal.id}: no "## The schedule" section found in ${cal.path}.`); continue; }
  let cur = null;
  const flush = () => { if (cur) items.push(cur); cur = null; };
  for (let i = 0; i < lines.length; i++) {
    if (!inSchedule[i]) continue;
    const line = lines[i];
    const h = line.match(/^### (.+)$/);
    if (h) {
      flush();
      const m = h[1].match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2})\s+([A-Z][a-z]{2})\s+(\d{4})/);
      if (!m || !MONTH[m[3]]) { notes.push(`${cal.id}: could not read a date from the heading "${h[1]}".`); continue; }
      const date = `${m[4]}-${String(MONTH[m[3]]).padStart(2, "0")}-${String(m[2]).padStart(2, "0")}`;
      const prepare = /^Prepare by/i.test(h[1]);
      const title = h[1].replace(m[0], "").replace(/^Prepare by\s*/i, "").replace(/^\s*[—-]\s*/, "").trim();
      cur = { date, source: cal.id, title: prepare ? `${cal.label}: prepare${title ? ` (${title})` : ""}` : `${cal.label}: ${title}`, prepare, detail: [], steps: [], blockers: [] };
      continue;
    }
    if (!cur || /^---\s*$/.test(line)) continue;
    const box = line.match(/^- \[( |x)\] (?:\((you|Claude|both)\) )?(.*)$/);
    if (box) { cur.steps.push({ done: box[1] === "x", owner: box[2] ?? "", text: box[3] }); continue; }
    if (/^\s{2,}\S/.test(line) && cur.steps.length && !line.trim().startsWith("- [")) { cur.steps.at(-1).text += ` ${line.trim()}`; continue; }
    if (line.trim()) cur.detail.push(line.trim());
  }
  flush();
  for (const it of items.filter((x) => x.source === cal.id))
    for (const s of it.steps) if (!s.done && s.owner === "you" && !/^(Posted|X thread posted|Community post|Week's best post|Final text approved|Images attached|Video attached)/i.test(s.text)) it.blockers.push(`waits on you: ${s.text.replace(/\*\*/g, "").slice(0, 110)}${s.text.length > 110 ? "…" : ""}`);
}

// ---- 3. render --------------------------------------------------------------
items.sort((a, b) => a.date.localeCompare(b.date) || a.source.localeCompare(b.source));
const open = (it) => it.steps.some((s) => !s.done);
const overdue = items.filter((it) => it.date < today && open(it));
const dueToday = items.filter((it) => it.date === today && open(it));
const upcoming = items.filter((it) => it.date > today && open(it));
const finished = items.filter((it) => !open(it));

const render = (it) => {
  let out = `### ${dayOf(it.date)} ${it.date} — ${it.title}\n\n`;
  if (it.detail.length) out += `${it.detail.join("\n")}\n\n`;
  for (const s of it.steps) out += `- [${s.done ? "x" : " "}] ${s.owner ? `(${s.owner}) ` : ""}${s.text}\n`;
  if (open(it) && it.blockers.length) out += `\n**Before this can go out:**\n${it.blockers.map((b) => `- ${b}`).join("\n")}\n`;
  return `${out}\n`;
};
const line = (it) => `- **${dayOf(it.date)} ${it.date}** · ${it.title}${it.blockers.length ? ` · ${it.blockers.length} thing(s) to settle first` : ""}`;

let md = `# Master posting calendar

<!-- GENERATED, local only (gitignored) by \`npm run calendar\`. Do not edit and do not commit.
     Film rows: distribution/plan.yaml. Other items: the calendar file named beside each. -->

Built for **${dayOf(today)} ${today}** (Pacific/Auckland). How Claude runs this with Chan, including
posting through her Chrome: [README.md](./README.md) § "Running the calendar".

`;
if (notes.length) md += `${notes.map((n) => `> ${n}`).join("\n")}\n\n`;
md += `## Now\n\n`;
md += `**Overdue (${overdue.length})**\n\n${overdue.length ? overdue.map(line).join("\n") : "Nothing."}\n\n`;
md += `**Due today (${dueToday.length})**\n\n${dueToday.length ? dueToday.map(line).join("\n") : "Nothing."}\n\n`;
md += `**Next (${Math.min(upcoming.length, 4)} of ${upcoming.length})**\n\n${upcoming.length ? upcoming.slice(0, 4).map(line).join("\n") : "Nothing scheduled."}\n\n`;
md += `Sources: ${["films → `distribution/plan.yaml`", ...(plan.otherCalendars ?? []).map((c) => `${c.label} → \`${c.path}\` (its own file is the authority on its dates and boxes)`)].join("; ")}.\n\n`;
if (overdue.length) md += `## Overdue\n\n${overdue.map(render).join("")}`;
if (dueToday.length) md += `## Today\n\n${dueToday.map(render).join("")}`;
md += `## Coming up\n\n${upcoming.length ? upcoming.map(render).join("") : "Nothing scheduled.\n\n"}`;
if (finished.length) md += `## Done\n\n${finished.map(line).join("\n")}\n`;

fs.writeFileSync(path.join(DIR, "master-calendar.md"), md);
console.log(`master calendar for ${today}: ${overdue.length} overdue, ${dueToday.length} due today, ${upcoming.length} coming up${notes.length ? `; ${notes.length} note(s)` : ""}`);
for (const n of notes) console.warn(`  ! ${n}`);
