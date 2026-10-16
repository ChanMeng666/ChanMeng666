#!/usr/bin/env node
// Emit dist/llms-twin.txt, the knowledge text of the chanmeng.org digital twin.
//
// Built from the loaded profile (scripts/lib/load-profile.mjs), dist/films.json
// and docs/stories/*.md; it replaces llms-full.txt as the twin's source. The
// twin Worker (2d-portfolio/workers/twin) splits it into ~1,500-character
// chunks that carry their heading path, so every section is "## <Entity>" /
// "### <sub-entity>" and each role, project, award, publication, event,
// reference and story has its own heading. Selection rules, all from
// docs/STATE.md (twin display rule, 2026-10-17):
//
//   - an entry with show.site false or show.llms false is absent, and so is
//     every sentence, bullet or row that names one (scripts/lib/twin-guards.mjs
//     derives the names from the data); archive-tier entries are left out
//   - no contact address but hello@chanmeng.org, stated once in "Who I am"
//   - no commit counts and no solo or authorship shares; no LLM-consumer tone
//     guideline, FAQ, badges or machine metadata
//   - GAVIGO figures keep the boundary note in the same paragraph
//   - CORDE: no placement or coursework wording; its story file is left out
//   - stories: "In one breath", "The problem", "What I built", every S<n>
//     story and "In hindsight"; never "Numbers I can say", "Evidence", "Open
//     questions" or the front matter
//
// Text is not rewritten into first person: sources already in the first person
// stay so, the rest stays as written (the Worker's rules make replies first
// person). The output has no timestamp, so it changes only when a source does.
// scripts/check-llms-twin.mjs re-checks the result.
//
//   node scripts/build-llms-twin.mjs [--check]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import { loadProfile } from "./lib/load-profile.mjs";
import { hiddenEntries, hiddenIds, forbiddenHit, GAVIGO_FIGURE, GAVIGO_NOTE, GAVIGO_BOUNDARY, GAVIGO_ALLOWED, NUMBER_WITH_UNIT } from "./lib/twin-guards.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(repoRoot, "dist", "llms-twin.txt");
const FILMS = path.join(repoRoot, "dist", "films.json");
const STORIES = path.join(repoRoot, "docs", "stories");
const CHECK = process.argv.includes("--check");

const profile = loadProfile();
const hidden = hiddenEntries(profile);
const hiddenBy = hiddenIds(profile);
const isHidden = (list, id) => hiddenBy[list]?.has(id) ?? false;
const xb = profile.meta?.x_brand ?? {};
const byId = (list) => new Map((profile[list] ?? []).filter((e) => e?.id).map((e) => [e.id, e]));
const projects = byId("projects");
const orgs = byId("organizations");
const notArchive = (e) => e && e.tier !== "archive";

// Story files the twin must not read: an excluded project, and CORDE, whose
// story is told with placement wording (docs/STATE.md, 2026-10-17).
const EXCLUDED_STORIES = new Set(["corde-mobile-application"]);

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const month = (d) => {
  const m = /^(\d{4})(?:-(\d{2}))?/.exec(String(d ?? ""));
  if (!m) return String(d ?? "");
  return m[2] ? `${MONTHS[+m[2] - 1]} ${m[1]}` : m[1];
};
const period = (a, b) => `${month(a)} – ${b ? month(b) : "present"}`;
const flat = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const short = (name) => String(name ?? "").split(/\s+[—–]\s+/)[0].trim();
// A venue keeps its name, suburb and city; the street line, floor and room go.
const STREET_PART = /\d{1,5}[A-Za-z]?\s+(?:[A-Z][\w'’-]*\s+){1,3}(?:Road|Rd|Street|St|Avenue|Ave|Drive|Dr|Place|Pl|Lane|Ln|Terrace|Crescent|Way|Boulevard|Highway|Quay|Parade)\b|^Level\s+\d|^Building\s|\bP\.?\s?O\.?\s?Box\b|Room$/;
const place = (loc) => String(loc ?? "").split(/,\s*/)
  .map((part) => part.replace(/\s+[—–-]\s+[^,]*\bRoom$/, ""))
  .filter((part) => !STREET_PART.test(part.trim()))
  .join(", ");
const DROP = "\u0000DROP\u0000"; // marks a sentence that links to an excluded story

// The CORDE entries carry their old placement framing; inside them every
// sentence that mentions the course, the university or students is dropped.
const CORDE_EXTRA = /placement|capstone|internship|coursework|COMP\s?693|\bstudents?\b|Lincoln University|行业实习/i;

function badSentence(s, ctx = {}) {
  if (s.includes(DROP)) return true;
  if (forbiddenHit(s, hidden)) return true;
  if (ctx.corde && CORDE_EXTRA.test(s)) return true;
  return false;
}

const splitSentences = (t) => t.split(/(?<=[.!?][)"”’*_]*)\s+(?=[A-Z0-9"“‘(\[*_`~])/);

// Inside anything about GAVIGO, a sentence with a percentage or a timing that
// is not one of the three approved figures goes ("no internal timings",
// docs/STATE.md).
const unapprovedFigure = (s) => [...s.matchAll(NUMBER_WITH_UNIT)].some((m) => !GAVIGO_ALLOWED.some((re) => re.test(m[0].trim())));

// One paragraph or list item's text, minus forbidden sentences, with the
// GAVIGO boundary note attached when a figure is there without it.
// A sentence that only comments on the one before it ("It is money taken
// from…") goes when that one went.
const FOLLOW_ON = /^(?:It|That|This|These|Those)\s+(?:is|are|was|were)\b/;

function scrubText(text, ctx = {}) {
  const gav = ctx.gavigo || /gavigo/i.test(text);
  let kept = [];
  let dropped = false;
  for (const s of splitSentences(flat(text))) {
    if (!s) continue;
    const bad = badSentence(s, ctx) || (gav && unapprovedFigure(s)) || (dropped && FOLLOW_ON.test(s));
    if (!bad) kept.push(s);
    dropped = bad;
  }
  let out = kept.join(" ").trim();
  if (out && GAVIGO_FIGURE.test(out) && !GAVIGO_NOTE(out)) out += /controlled/i.test(out) ? " Not a production SLA." : ` (${GAVIGO_BOUNDARY})`;
  return out;
}

// Markdown block → scrubbed markdown. Paragraphs and list items become single
// lines; table rows are kept or dropped whole; fenced code is kept or dropped
// whole; headings are passed to `heading` (default: dropped below level 4).
function scrubMarkdown(md, ctx = {}) {
  const lines = String(md ?? "").replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let para = [];
  let item = null; // { indent, marker, text: [] }
  const flushPara = () => {
    if (para.length) {
      const t = scrubText(para.join(" "), ctx);
      if (t) out.push(t, "");
    }
    para = [];
  };
  const flushItem = () => {
    if (item) {
      const t = scrubText(item.text.join(" "), ctx);
      if (t) out.push(`${item.indent}${item.marker} ${t}`);
    }
    item = null;
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      flushPara(); flushItem();
      const block = [line];
      while (++i < lines.length && !/^\s*```/.test(lines[i])) block.push(lines[i]);
      block.push(lines[i] ?? "```");
      const text = block.join("\n");
      if (!badSentence(text, ctx)) out.push(text, "");
      continue;
    }
    const li = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(line);
    if (li) { flushPara(); flushItem(); item = { indent: li[1], marker: li[2], text: [li[3]] }; continue; }
    if (/^\s*\|/.test(line)) {
      flushPara(); flushItem();
      const row = ctx.row ? ctx.row(line) : line;
      if (row && !badSentence(row, ctx)) out.push(row);
      continue;
    }
    if (/^#{1,6}\s/.test(line)) {
      flushPara(); flushItem();
      const h = ctx.heading ? ctx.heading(line) : null;
      if (h) out.push("", h, "");
      continue;
    }
    if (!line.trim()) {
      flushItem(); flushPara();
      if (out.length && out[out.length - 1] !== "") out.push("");
      continue;
    }
    if (item && /^\s+\S/.test(line)) { item.text.push(line.trim()); continue; }
    flushItem();
    para.push(line.trim());
  }
  flushPara(); flushItem();
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// ---------------------------------------------------------------------------
// Output assembly
// ---------------------------------------------------------------------------
const out = [];
const h2 = (t) => out.push("", `## ${t}`, "");
const h3 = (t) => out.push("", `### ${t}`, "");
const para = (t, ctx) => { const s = scrubText(t, ctx); if (s) out.push(s, ""); };
const md = (t, ctx) => { const s = scrubMarkdown(t, ctx); if (s) out.push(s, ""); };
const bullet = (label, value, ctx) => {
  if (value == null || value === "") return;
  const s = scrubText(`${label}: ${value}`, ctx);
  if (s) out.push(`- ${s}`);
};
const labelled = (label, text, ctx) => {
  if (!text) return;
  const body = scrubMarkdown(text, ctx);
  if (body) out.push(`**${label}.** ${body}`, "");
};

// ---------------------------------------------------------------------------
// ## Who I am — first-person prose; decided wording from VOICE-SPEC (2026-10-17)
// ---------------------------------------------------------------------------
const basics = profile.basics;
const current = (profile.work ?? []).filter((w) => !w.endDate && !isHidden("work", w.id));
const pastFlagship = (profile.work ?? []).filter((w) => w.endDate && w.tier === "flagship" && !isHidden("work", w.id));
const lead = profile.linkedin?.about?.lead ?? "";
const teaching = xb.teachingImpact ?? {};
const native = (profile.languages ?? []).filter((l) => /native/i.test(l.fluency)).map((l) => l.language.replace(/^Chinese \((\w+)\)$/, "$1"));
const other = (profile.languages ?? []).filter((l) => !/native/i.test(l.fluency)).map((l) => `${l.language} (${l.fluency.toLowerCase()})`);
const langLine = `${native.join(" and ")} natively${other.length ? `, and ${other.join(" and ")}` : ""}`;
const profileLinks = (basics.profiles ?? [])
  .filter((p) => ["Portfolio", "LinkedIn", "GitHub", "X", "YouTube", "Newsletter"].includes(p.network))
  .map((p) => `${p.network === "X" ? "X" : p.network}: ${p.url}`);

h2("Who I am");
para(`I'm ${basics.name} (${String(basics.pronouns ?? "she/her").toLowerCase()}), an AI agent architect and full-stack engineer based in ${basics.location?.region ?? "Auckland, New Zealand"}. ${xb.valueProposition?.tagline ?? ""}`);
for (const p of lead.split(/\n\s*\n/)) para(p);
para(
  `Right now I am ${current.map((w) => `${w.position} at ${w.name} (since ${month(w.startDate)})`).join(", and ")}. ` +
    `ArchCanvas is an AI architectural designer: you describe a building in plain English and it produces a dimensioned floor plan that you refine by talking to it, live at archcanvas.uk. ` +
    `Underneath it is ArchLang, the open-source declarative floor-plan language I wrote, which compiles source into dimensioned drawings so every plan can be checked and edited exactly.`
);
para(`Before that I was ${pastFlagship.map((w) => `${short(w.position.replace(/\s*\(prev\.[^)]*\)/, ""))} at ${w.name} (${period(w.startDate, w.endDate)})`).join("; ")}.`);
out.push("What I take on:", "");
for (const r of xb.engagementRoles ?? []) out.push(`- ${scrubText(`${r.title}: ${r.scope}`)}`);
out.push("");
para(
  "I'm open to founding-team, staff IC, AI-architecture and AI-engineering-instruction work, and to selected contract builds for founders. " +
    "I'm based in Auckland and work remotely or in person, including with teams in other time zones. " +
    "Pricing depends on scope: write to me with what you need and I'll come back with a scope and a quote. " +
    "The fastest way in is email, or a 30-minute call at https://cal.com/chan-meng/30min."
);
para(
  "I taught maths at tutoring schools in China for about seven years before software. " +
    "In 2022 I decided to rebuild my life somewhere I could breathe freely, and in 2023 I moved to New Zealand for the Master of Applied Computing at Lincoln University, which was awarded with Distinction. " +
    "I built with AI from the first semester; it wasn't easy. " +
    "The teaching years are why I now teach engineers to build with AI and document everything I build."
);
if (teaching.cohortCount) {
  para(`I have taught ${teaching.cohortCount} AI-programming cohorts since 2024 (${teaching.learnerReachClaim}), and received the ${teaching.flagshipAwardClaim}. The course material is public at https://programming.chanmeng.org.`);
}
para(`I speak ${langLine}. I have practised minimalism since 2018: "${basics.taglines?.secondary?.replace(/^A minimalist\.\s*/, "") ?? "Subtraction for life, addition for thought."}"`);
out.push(`Contact: hello@chanmeng.org`, "");
out.push(`Elsewhere: ${profileLinks.join(" · ")}`, "");

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------
const NARRATIVE_ROLE = [
  ["impactHeadline", "Impact"], ["companyContext", "Company context"], ["mission", "Mission"],
  ["myMandate", "My mandate"], ["impactDelivered", "Impact delivered"], ["technicalHighlights", "Technical highlights"],
];
const cleanPosition = (w) => w.id === "corde" ? w.position.replace(/\s*\([^)]*(?:placement|COMP)[^)]*\)/i, "") : w.position;

function roleBlock(w, { volunteer = false } = {}) {
  const ctx = { corde: w.id === "corde", gavigo: /gavigo/i.test(w.name) };
  h3(`${cleanPosition(w)} at ${w.name}`);
  bullet("Period", period(w.startDate, w.endDate), ctx);
  bullet("Location", place(w.location), ctx);
  bullet("URL", w.url, ctx);
  if (w.keywords?.length) bullet("Keywords", w.keywords.join(", "), ctx);
  out.push("");
  if (w.publicSummary) para(w.publicSummary, ctx);
  if (volunteer && w.summary) md(w.summary, ctx);
  for (const [k, label] of NARRATIVE_ROLE) labelled(label, w.narrative?.[k], ctx);
}

h2("Current roles");
for (const w of current) roleBlock(w);

h2("Past roles");
for (const w of (profile.work ?? []).filter((w) => w.endDate && notArchive(w) && !isHidden("work", w.id))) roleBlock(w);
for (const w of (profile.volunteer ?? []).filter((w) => notArchive(w) && !isHidden("volunteer", w.id))) roleBlock(w, { volunteer: true });

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
const NARRATIVE_PROJECT = [
  ["impactHeadline", "Impact"], ["problem", "Problem"], ["audience", "Audience"], ["productLogic", "Product logic"],
  ["businessLogic", "Business logic"], ["technicalApproach", "Technical approach"], ["outcomes", "Outcomes"], ["myRole", "My role"],
];
const METRIC_SKIP = /commit|authorship|solo|share|contributor/i;
const shown = new Set();
const usedHeadings = new Set();

function projectBlock(p, { full = true } = {}) {
  if (!p || shown.has(p.id) || isHidden("projects", p.id)) return;
  shown.add(p.id);
  const ctx = { corde: p.id === "corde-mobile-application", gavigo: /gavigo/i.test(p.name) };
  const name = usedHeadings.has(short(p.name).toLowerCase()) || short(p.name).length < 12 && /^chan meng$/i.test(short(p.name)) ? flat(p.name) : short(p.name);
  usedHeadings.add(name.toLowerCase());
  h3(name);
  if (p.tagline) para(p.tagline, ctx);
  bullet("URL", p.url, ctx);
  if (p.repoUrl && p.repoUrl !== p.url) bullet("Repository", p.repoUrl, ctx);
  bullet("Demo", p.demoUrl, ctx);
  if (p.startDate) bullet("Started", month(p.startDate), ctx);
  bullet("Status", p.status, ctx);
  const org = p.clientOrgId && !isHidden("organizations", p.clientOrgId) ? orgs.get(p.clientOrgId) : null;
  if (org) bullet("For", org.name, ctx);
  if (p.techStack?.length) bullet("Tech stack", p.techStack.slice(0, 24).join(", "), ctx);
  if (full) for (const m of p.metrics ?? []) if (!METRIC_SKIP.test(m.label)) bullet(m.label, m.value, ctx);
  const related = (p.relatedProjectIds ?? []).filter((id) => !isHidden("projects", id)).map((id) => projects.get(id)?.name).filter(Boolean).map(short);
  if (related.length) bullet("Related projects", related.join(", "), ctx);
  out.push("");
  if (p.publicSummary) para(p.publicSummary, ctx);
  if (full) for (const [k, label] of NARRATIVE_PROJECT) labelled(label, p.narrative?.[k], ctx);
  else if (p.narrative?.impactHeadline) labelled("Impact", p.narrative.impactHeadline, ctx);
}

h2("Flagship projects");
for (const id of [...(xb.flagshipProjectIds ?? []), ...(xb.commissionedProjectIds ?? []), ...(xb.clientCardProjectIds ?? [])]) projectBlock(projects.get(id));

h2("Open source");
const ossIds = [...(xb.spotlightProjectIds ?? []), ...(xb.aiAgentProjectIds ?? []), ...(xb.llmsOnlyOpenSourceIds ?? [])];
for (const id of ossIds) {
  const p = projects.get(id);
  if (p?.repoUrl && p.provenance !== "client") projectBlock(p);
}
for (const p of profile.projects ?? []) {
  if (notArchive(p) && p.repoUrl && p.provenance !== "client" && p.tier !== "secondary") projectBlock(p);
}
for (const p of profile.projects ?? []) {
  if (notArchive(p) && p.repoUrl && p.provenance !== "client") projectBlock(p, { full: false });
}
const contribs = (profile.openSourceContributions ?? []).filter(notArchive);
if (contribs.length) {
  h3("Contributions to other open-source projects");
  for (const c of contribs) {
    const s = scrubText(`${c.repo} #${c.number}, "${c.title}" (${c.state}, ${month(c.date)}): ${flat(c.summary)}`);
    if (s) out.push(`- ${s} ${c.url ?? ""}`.trim());
  }
  out.push("");
}

h2("More projects");
for (const p of profile.projects ?? []) if (notArchive(p)) projectBlock(p, { full: p.tier !== "secondary" });
for (const s of (profile.showcase ?? []).filter((s) => notArchive(s) && !isHidden("showcase", s.id))) {
  const sctx = { gavigo: /gavigo/i.test(s.title) };
  h3(s.title);
  bullet("Kind", s.capability);
  bullet("For", s.org);
  bullet("Date", month(s.date));
  bullet("Link", s.liveUrl ?? s.watchUrl);
  out.push("");
  para(s.summary, sctx);
  for (const f of s.facts ?? []) { const t = scrubText(f, sctx); if (t) out.push(`- ${t}`); }
  out.push("");
}

// ---------------------------------------------------------------------------
// Recognition, writing, events, education, skills
// ---------------------------------------------------------------------------
h2("Awards and recognition");
for (const a of (profile.awards ?? []).filter((a) => !isHidden("awards", a.id))) {
  h3(a.title);
  bullet("Awarded by", a.awarder);
  bullet("Date", a.date);
  bullet("URL", a.url);
  out.push("");
  md(a.summary);
}

h2("Publications and media");
// Podcast shows and podcast episodes are left out: the hosted shows are
// discontinued (docs/STATE.md, Podcasts) and the twin carries no podcast link.
const isPodcast = (p) => /^podcast/i.test(p.meta?.x_brand?.type ?? "") || /open\.spotify\.com|podcasts\.apple\.com|xiaoyuzhou/i.test(p.url ?? "");
for (const p of (profile.publications ?? []).filter((p) => notArchive(p) && !isHidden("publications", p.id) && !isPodcast(p))) {
  if (forbiddenHit(p.name, hidden)) continue;
  h3(p.name);
  bullet("Publisher", p.publisher);
  bullet("Date", p.releaseDate);
  bullet("URL", p.url);
  out.push("");
  if (p.summary) md(p.summary);
}

h2("Talks and events");
for (const e of (profile.events ?? []).filter(notArchive)) {
  if (forbiddenHit(e.name, hidden)) continue;
  h3(`${e.name}${e.role ? ` — ${e.role}` : ""}`);
  bullet("Type", e.type);
  bullet("Date", e.endDate ? `${e.date} to ${e.endDate}` : e.date);
  bullet("Location", place(e.location));
  bullet("Organiser", e.organizer);
  bullet("URL", e.url);
  out.push("");
  md(e.summary);
}

h2("Education");
for (const e of (profile.education ?? []).filter(notArchive)) {
  h3(`${e.studyType}, ${e.institution}`);
  bullet("Period", period(e.startDate, e.endDate));
  bullet("URL", e.url);
  if (e.highlights?.length) bullet("Highlights", e.highlights.join("; "));
  if (e.courses?.length) bullet("Courses", e.courses.join(", "));
  out.push("");
}

h2("Skills");
for (const s of profile.skills ?? []) {
  h3(s.name);
  if (s.keywords?.length) out.push(`- Keywords: ${s.keywords.join(", ")}`);
  for (const x of s.expertise ?? []) {
    const parts = [`${x.tool}${x.since ? ` (since ${x.since})` : ""}`];
    if (x.frameworks?.length) parts.push(`with ${x.frameworks.join(", ")}`);
    const t = scrubText(`${parts.join(", ")}.${x.notes ? ` ${x.notes}` : ""}`);
    if (t) out.push(`- ${t}`);
  }
  out.push("");
}
for (const d of (profile.domains ?? []).filter(notArchive)) {
  h3(`Domain: ${d.name}`);
  bullet("Since", d.since);
  out.push("");
  md(d.summary);
}
h3("Spoken languages");
for (const l of profile.languages ?? []) out.push(`- ${l.language}: ${l.fluency}`);
out.push("");
h3("Interests");
for (const i of profile.interests ?? []) out.push(`- ${i.name}: ${(i.keywords ?? []).join(", ")}`);
out.push("");
const certs = (profile.certificates ?? []).filter(notArchive);
if (certs.length) {
  h3("Certificates");
  for (const c of certs) { const t = scrubText(`${c.name}, ${c.issuer} (${month(c.date)})`); if (t) out.push(`- ${t}`); }
  out.push("");
}

// ---------------------------------------------------------------------------
// ## What people say — all references, each with the person
// ---------------------------------------------------------------------------
// "Role (detail); how they know Chan" → heading "Name, Role", line "Context: …".
// Split at "; " only outside parentheses.
const splitTop = (s) => {
  const parts = [];
  let depth = 0, start = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") depth = Math.max(0, depth - 1);
    else if (s[i] === ";" && depth === 0) { parts.push(s.slice(start, i).trim()); start = i + 1; }
  }
  parts.push(s.slice(start).trim());
  return parts.filter(Boolean);
};
const roleOf = (r) => {
  const [first = "", ...rest] = splitTop(flat(r.meta?.x_brand?.relationship ?? ""));
  let role = first.replace(/\s*\([^)]*\)/g, "").trim();
  if (role.length > 120) role = role.slice(0, 120).replace(/\s+\S*$/, "") + " …";
  return { role, context: rest.join("; ").replace(/\s*\(see [^)]*\)/g, "").replace(/\s*\b\w+\[id=[^\]]*\]/g, "") };
};
const shorten = (text, max = 900) => {
  const t = String(text ?? "").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("。"), cut.lastIndexOf(".\n"));
  return (end > max / 2 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, "")) + " […]";
};
h2("What people say");
for (const r of profile.references ?? []) {
  const { role, context } = roleOf(r);
  h3(role ? `${r.name}, ${role}` : r.name);
  if (context) { const c = scrubText(`Context: ${context}`); if (c) out.push(c, ""); }
  const quote = scrubMarkdown(shorten(r.reference));
  if (quote) out.push(...quote.split("\n").map((l) => (l ? `> ${l}` : ">")), "");
}

// ---------------------------------------------------------------------------
// ## Films — overview only; the Worker indexes dist/films.json itself
// ---------------------------------------------------------------------------
h2("Films");
if (fs.existsSync(FILMS)) {
  const f = JSON.parse(fs.readFileSync(FILMS, "utf8"));
  const mvCollections = (f.musicVideos ?? []).length;
  para(
    `Every finished film I've made is on https://chanmeng.org/films: ${f.counts.films} films, about ${f.counts.minutes} minutes in all. ` +
      `${f.counts.productFilms} are product films, ${f.brandAndEvent.length} are brand and event films, and ${f.counts.musicVideos} are music videos in ${mvCollections} collections. ` +
      "They are made in code: the product films in Remotion or HyperFrames, the brand films in p5.js, and the music videos for my own songs drawn frame by frame in code rather than with a video generation model."
  );
  h3("Product films");
  for (const x of f.productFilms ?? []) { const t = scrubText(`${x.title} (${x.for}, ${x.duration})${x.madeWith ? `, made with ${x.madeWith}` : ""}.`); if (t) out.push(`- ${t}`); }
  const other = [...(f.otherVersions?.films ?? []).map((x) => x.title), ...(f.otherVersions?.series ?? []).map((s) => `${s.title} (${s.films.length} shorts)`)];
  if (other.length) { const t = scrubText(`Earlier and alternative versions: ${other.join("; ")}.`); if (t) out.push(`- ${t}`); }
  out.push("");
  h3("Brand and event films");
  for (const x of f.brandAndEvent ?? []) { const t = scrubText(`${x.title} (${x.duration}): ${x.summary ?? ""}`); if (t) out.push(`- ${t}`); }
  out.push("");
} else {
  console.error("dist/films.json is missing: run `npm run build:films-data` first");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// ## Engineering stories
// ---------------------------------------------------------------------------
const storyFiles = fs.readdirSync(STORIES).filter((f) => f.endsWith(".md") && f !== "README.md" && f !== "narrative.md").sort();
const stories = new Map();
for (const file of storyFiles) {
  const text = fs.readFileSync(path.join(STORIES, file), "utf8").replace(/\r\n/g, "\n");
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  const front = m ? yaml.load(m[1]) ?? {} : {};
  const id = front.id ?? file.replace(/\.md$/, "");
  const body = m ? text.slice(m[0].length) : text;
  const sTitles = new Map();
  for (const h of body.matchAll(/^###\s+(S\d+)\.\s+(.*)$/gm)) sTitles.set(h[1].toLowerCase(), h[2].trim());
  const excluded = EXCLUDED_STORIES.has(id) || isHidden("projects", id);
  stories.set(file, { id, front, body, sTitles, excluded, title: front.title ?? id });
}

// [archcanvas S1](archcanvas.md#s1-...) → ArchCanvas S1 ("A floor plan you …");
// a link to an excluded story marks the sentence, bullet or cell for dropping.
function resolveLinks(text) {
  return String(text)
    .replace(/\[([^\]]+)\]\(([\w-]+\.md)(?:#([\w-]+))?\)/g, (all, label, file, anchor) => {
      const st = stories.get(file);
      if (!st) return label;
      if (st.excluded) return DROP;
      const s = /^(s\d+)-/.exec(anchor ?? "")?.[1];
      return s && st.sTitles.has(s) ? `${st.title} ${s.toUpperCase()} ("${st.sTitles.get(s)}")` : `${st.title} story`;
    })
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (all, target, label) => {
      const [list, id] = target.split("/");
      if (id && isHidden(list, id)) return DROP;
      if (label) return label;
      return byId(list).get(id)?.name ?? byId(list).get(id)?.title ?? id ?? target;
    });
}
// In the narrative's tables a cell may list several stories: drop only the
// part that points at an excluded one, then the row if a cell ends up empty.
function tableRow(line) {
  const cells = line.split("|");
  const kept = cells.map((c, i) => {
    if (i === 0 || i === cells.length - 1 || /^\s*:?-+:?\s*$/.test(c)) return c;
    const parts = c.split(/;\s/).map((p) => p.trim()).filter((p) => p && !p.includes(DROP));
    return parts.length ? ` ${parts.join("; ")} ` : "";
  });
  if (kept.slice(1, -1).some((c) => !c.trim())) return null;
  return kept.join("|");
}

h2("Engineering stories");
{
  const text = fs.readFileSync(path.join(STORIES, "narrative.md"), "utf8").replace(/\r\n/g, "\n");
  const body = text.replace(/^---\n[\s\S]*?\n---\n?/, "");
  const resolved = resolveLinks(body);
  out.push("", "### The threads through my engineering work", "");
  // The title and the paragraph that introduces the folder are about files, not about me.
  md(resolved.replace(/^#\s+.*$/m, "").replace(/^The cross-project version[\s\S]*?\n\n/m, ""), {
    row: tableRow,
    heading: (l) => {
      const m = /^(#{2,3})\s+(.*)$/.exec(l);
      if (!m) return null;
      const t = m[2].replace(/^(\d+)\.\s+/, "Thread $1. ");
      return `#### ${t}`;
    },
  });
}
const KEEP = new Set(["In one breath", "The problem", "What I built", "Stories", "In hindsight"]);
for (const [, st] of stories) {
  if (st.excluded) continue;
  out.push("", `### ${st.title} — story`, "");
  const meta = [st.front.role && `Role: ${st.front.role}`, st.front.period && `Period: ${st.front.period}`].filter(Boolean).join(" · ");
  if (meta) out.push(scrubText(meta), "");
  const sections = st.body.split(/^(?=##\s)/m);
  for (const sec of sections) {
    const hm = /^##\s+(.*)$/m.exec(sec);
    if (!hm || !KEEP.has(hm[1].trim())) continue;
    const name = hm[1].trim();
    const content = resolveLinks(sec.replace(/^##\s+.*$/m, ""));
    if (name !== "Stories") out.push("", `#### ${name}`, "");
    md(content, {
      gavigo: /gavigo/i.test(st.title),
      row: tableRow,
      heading: (l) => {
        const m = /^###\s+(S\d+\..*)$/.exec(l);
        return m ? `#### ${m[1].trim()}` : null;
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------
const text = out.join("\n").replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim() + "\n";
if (CHECK) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8").replace(/\r\n/g, "\n") : "";
  if (current !== text) {
    console.error("dist/llms-twin.txt is stale: run `npm run build:twin`");
    process.exit(1);
  }
  console.log("dist/llms-twin.txt is current");
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, text);
  const h2n = (text.match(/^## /gm) ?? []).length;
  const h3n = (text.match(/^### /gm) ?? []).length;
  const h4n = (text.match(/^#### /gm) ?? []).length;
  console.log(`dist/llms-twin.txt: ${Math.round(text.length / 1024)} KB, ${h2n} sections, ${h3n} entities, ${h4n} sub-sections`);
}
