#!/usr/bin/env node
// Knowledge-base lint: the one place that knows every cross-reference field and
// every per-surface display declaration. Two parts.
//
// 1. DISPLAY (`show:` on an entry, schema $defs.showFlags). For each entry with
//    `show.<surface>: false`, the entry's id and its display name must not
//    appear in that surface's generated text; with `show.<surface>: true`, at
//    least one of them must. Surfaces and the text read for each:
//      readme   README.md (HTML comments stripped); films also by the film-wall
//               selection rule of scripts/build-readme-art.mjs (the SVG has no text)
//      llms     llms.txt + public/cv-llms.txt (the narrative files). llms-full.txt
//               and dist/profile.json are the database dump and may carry a
//               hidden entry: `llms: false` means "not in the narrative".
//      cv       cv/*.typ + cv/sections/*.typ, Typst comments stripped
//      linkedin the `linkedin:` copy in 70-linkedin.yaml (keys starting "_" are
//               markers, skipped) + linkedin/linkedin-*.md
//      site     films: dist/films.json. Everything else: the sibling repo
//               ../2d-portfolio (src/, comments stripped, its films.json copy
//               excluded). Its blog posts (content/*.mdx) are not scanned:
//               a published post is a dated record (docs/STATE.md, Blog posts
//               on chanmeng.org); one info line gives the count of mentions.
//    Plus structural cross-checks: a `show.readme: false` project is in no
//    90-meta bucket; a `show.llms: false` project is not in
//    llmsOnlyOpenSourceIds; `show.llms: true` with `show.readme: false` needs
//    llmsOnlyOpenSourceIds (else the narrative drops, see build.mjs
//    _openSourcePrimary); tier flagship is auto-selected into cv-llms.txt, so a
//    flagship entry cannot be llms- or cv-hidden; `collaborators.publicListing`
//    and `films.onFilmsPage` must agree with `show` where both are set.
//
// 2. REFERENCES. REF_FIELDS lists every cross-reference field and its target
//    list; each value must resolve there (ids are unique per list, not across
//    lists). Any `*Id` / `*Ids` key that is not in REF_FIELDS, EXTERNAL_FIELDS
//    or NOT_REFERENCES is reported as an "unregistered reference field"
//    warning: register a new field here when you add it. The fatal checks in
//    scripts/build.mjs and scripts/check-ecosystem.mjs stay; this is the list.
//
// 3. ORG CONTEXT (decision d9). organizations[].meta.x_brand.context: "auto"
//    is generated from the related work/volunteer/education entry
//    (scripts/lib/org-context.mjs). A hand-written context on an org whose
//    related entry has a position and startDate must not carry a title + date
//    string ("(Mon YYYY", "(Mon — Mon YYYY") unless it equals the generated
//    one; "auto" must have something to generate from; contextTitle is only
//    read with "auto".
//
// 4. METRIC PROVENANCE (decision d3). Every { label, value } metric
//    (projects[].metrics, basics.reach.metrics, projects[].meta.x_brand.reach.usage)
//    should carry `source` and `asOf` (schema $defs.metricSource, metricAsOf).
//    Visitor-facing = selected into public/cv-llms.txt by the rule of
//    cv/build-llms-txt.mjs (copied here), or its number found, next to a word of
//    its label and near the project's name, in README.md, the CVs (cv/*.typ,
//    cv/sections/*.typ), the linkedin: copy or the chanmeng.org source. A
//    visitor-facing miss is listed as file:line and is a warning, an error under
//    --strict-provenance; the rest are one summary warning.
//
// Usage: node scripts/lint-kb.mjs [--warn-only] [--terms] [--strict-provenance]
//   --warn-only          report errors but exit 0
//   --terms              print the identifiers matched for every hidden entry
//   --strict-provenance  a visitor-facing metric without source or asOf is an error
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { loadProfile } from "./lib/load-profile.mjs";
import { generatedOrgContext, orgRelatedEntry } from "./lib/org-context.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteRoot = path.resolve(repoRoot, "..", "2d-portfolio");
const WARN_ONLY = process.argv.includes("--warn-only");
const SHOW_TERMS = process.argv.includes("--terms");
const STRICT_PROVENANCE = process.argv.includes("--strict-provenance");

const profile = loadProfile();
const errors = [];
const warnings = [];
const notes = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const rel = (p) => path.relative(repoRoot, p).replace(/\\/g, "/");
const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null);
const listFiles = (dir, re, { recursive = false, skip = [] } = {}) => {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (skip.includes(d.name)) continue;
    if (d.isDirectory()) { if (recursive) out.push(...listFiles(p, re, { recursive, skip })); }
    else if (re.test(d.name)) out.push(p);
  }
  return out.sort();
};

// Comment strippers. `//` counts as a comment only at line start or after
// whitespace, so "https://" survives.
const stripSlashComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/(^|[ \t])\/\/[^\n]*/gm, "$1");
const stripHtmlComments = (t) => t.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " "));

// Collect every string value under the linkedin copy, skipping "_" marker keys.
const copyStrings = (v, out = []) => {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => copyStrings(x, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (!k.startsWith("_")) copyStrings(x, out);
  return out;
};

// ---------------------------------------------------------------------------
// Surfaces: each is a list of { file, text } documents
// ---------------------------------------------------------------------------
const doc = (p, transform = (t) => t) => { const t = read(p); return t == null ? null : { file: rel(p), text: transform(t) }; };
const SURFACES = {
  readme: [doc(path.join(repoRoot, "README.md"), stripHtmlComments)],
  llms: [doc(path.join(repoRoot, "llms.txt")), doc(path.join(repoRoot, "public", "cv-llms.txt"))],
  cv: [
    ...listFiles(path.join(repoRoot, "cv"), /\.typ$/),
    ...listFiles(path.join(repoRoot, "cv", "sections"), /\.typ$/),
  ].map((p) => doc(p, stripSlashComments)),
  linkedin: [
    { file: "data/profile/70-linkedin.yaml", text: copyStrings(profile.linkedin ?? {}).join("\n"), raw: read(path.join(repoRoot, "data", "profile", "70-linkedin.yaml")) },
    ...listFiles(path.join(repoRoot, "linkedin"), /^linkedin-.*\.md$/).map((p) => doc(p)),
  ],
  site: fs.existsSync(siteRoot)
    ? listFiles(path.join(siteRoot, "src"), /\.(tsx?|jsx?|mdx?|json)$/, { recursive: true })
        .filter((p) => !/[\\/]src[\\/]data[\\/]films\.json$/.test(p))
        .map((p) => doc(p, stripSlashComments))
    : [],
  filmsJson: [doc(path.join(repoRoot, "dist", "films.json"))],
  blog: fs.existsSync(siteRoot) ? listFiles(path.join(siteRoot, "content"), /\.mdx?$/).map((p) => doc(p)) : [],
};
for (const [k, docs] of Object.entries(SURFACES)) SURFACES[k] = docs.filter(Boolean);
if (!fs.existsSync(siteRoot)) notes.push(`site: ${siteRoot} not found, chanmeng.org page text not checked (films still checked through dist/films.json)`);
for (const k of ["readme", "llms", "filmsJson"]) if (!SURFACES[k].length) warn(`${k}: generated file missing, run npm run build first`);

// ---------------------------------------------------------------------------
// Identifiers for an entry: its id (when distinctive) and its display name,
// with the head before " — " and a version without CJK, longest first.
// ---------------------------------------------------------------------------
const CJK = /[　-〿㐀-鿿＀-￯]+/g;
function termsFor(e) {
  const out = [];
  const add = (s, kind) => {
    s = String(s ?? "").replace(/\s+/g, " ").trim().replace(/[\s,;:·—–-]+$/, "");
    if (s.length >= 5 && !out.some((t) => t.term.toLowerCase() === s.toLowerCase())) out.push({ term: s, kind });
  };
  if (e.id && (e.id.includes("-") || e.id.length >= 6)) add(e.id, "id");
  for (const n of [e.name, e.title, ...(e.aliases ?? [])].filter(Boolean)) {
    add(n, "name");
    const head = String(n).split(/\s+[—–·|]\s+|:\s|\s\(/)[0];
    add(head, "name");
    add(String(n).replace(/\s*\([^)]*[\u3400-\u9fff][^)]*\)/g, "").replace(CJK, " "), "name");
    add(head.replace(CJK, " "), "name");
  }
  return out.sort((a, b) => b.term.length - a.term.length);
}
// Entries whose display name is shared with another entry that may be shown:
// their identifiers are narrowed to what names only them. Each says why.
const NARROW_TERMS = {
  // The retired LinkedIn newsletter is also called "Decoding the Future" and is
  // not hidden; match the podcast only by its id, the word "podcast" and its
  // Spotify show id.
  "publications/decoding-the-future-podcast": [
    { term: "[Podcast — host] Decoding the Future", kind: "name" },
    { term: "decoding-the-future-podcast", kind: "id" },
    { term: "Decoding the Future podcast", kind: "name" },
    { term: "0PDYYnZhKwV7PdWHeK7nbj", kind: "name" },
  ],
};
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function termRe({ term, kind }) {
  const w = kind === "id" ? "A-Za-z0-9-" : "A-Za-z0-9";
  const pre = /^[A-Za-z0-9]/.test(term) ? `(?<![${w}])` : "";
  const post = /[A-Za-z0-9]$/.test(term) ? `(?![${w}])` : "";
  return new RegExp(pre + escapeRe(term).replace(/\\? /g, "\\s+") + post, "gi");
}
// One hit per file:line, with the longest identifier that matched there.
function findHits(terms, docs) {
  const hits = new Map();
  for (const d of docs) for (const t of terms) {
    for (const m of d.text.matchAll(termRe(t))) {
      let line = d.text.slice(0, m.index).split("\n").length;
      if (d.raw) { // text was assembled from parsed values: find the line in the file itself
        const content = d.text.split("\n")[line - 1].trim();
        const at = d.raw.split("\n").findIndex((l) => l.includes(content.slice(0, 60)));
        line = at >= 0 ? at + 1 : 0;
      }
      const k = `${d.file}:${line}`;
      if (!hits.has(k)) hits.set(k, { file: d.file, line, term: t.term, kind: t.kind });
    }
  }
  return [...hits.values()];
}

// Decided mentions: a hidden entry that a surface names on purpose, per a rule
// in docs/STATE.md. Each one is printed, never silently dropped.
const DECIDED_MENTIONS = [
  {
    entry: "projects/github-readme-suno-cards", surface: "readme", term: "github-readme-suno-cards",
    why: 'docs/STATE.md "Google Jobs MCP Server, GitHub README Suno Cards": the "Sound I make" cards and their credit line are its showing',
  },
];

// ---------------------------------------------------------------------------
// Part 1: display declarations
// ---------------------------------------------------------------------------
const SHOW_LISTS = ["projects", "organizations", "collaborators", "films", "work", "volunteer", "awards", "publications", "showcase"];
const SURF = ["readme", "site", "cv", "linkedin", "llms"];
const xb = profile.meta?.x_brand ?? {};
const bucketKeys = Object.keys(xb).filter((k) => /ProjectIds$/.test(k) && Array.isArray(xb[k]));
const llmsOnly = new Set(xb.llmsOnlyOpenSourceIds ?? []);
const onFilmWall = (f) => (f.kind === "product-film" && f.primary) || f.kind === "brand-film" || f.kind === "event-promo" || f.kind === "music-video";

let declared = 0;
let blogMentions = 0; // chanmeng.org blog posts: a dated record, counted, not checked
const termReport = [];
for (const list of SHOW_LISTS) {
  for (const e of profile[list] ?? []) {
    if (!e?.show) continue;
    declared++;
    const key = `${list}/${e.id ?? e.title ?? e.name}`;
    const terms = NARROW_TERMS[key] ?? termsFor(e);
    termReport.push(`  ${key}: ${terms.map((t) => JSON.stringify(t.term)).join(", ")}`);

    for (const s of SURF) {
      if (!(s in e.show)) continue;
      let docs = SURFACES[s];
      if (s === "site" && list === "films") docs = SURFACES.filmsJson;
      if (s === "site" && list !== "films" && !docs.length) continue; // sibling repo absent (noted above)
      const hits = findHits(terms, docs);
      if (e.show[s] === false) {
        for (const h of hits) {
          const ex = DECIDED_MENTIONS.find((x) => x.entry === key && x.surface === s && x.term.toLowerCase() === h.term.toLowerCase());
          if (ex) notes.push(`decided mention: ${key} on ${s} at ${h.file}:${h.line} ("${h.term}"): ${ex.why}`);
          else err(`${key}: show.${s} is false but ${h.file}:${h.line} names it ("${h.term}", ${h.kind})`);
        }
        if (s === "site" && list !== "films") blogMentions += findHits(terms, SURFACES.blog).length;
        if (s === "readme" && list === "films" && onFilmWall(e))
          err(`${key}: show.readme is false but the README film wall selects it (kind ${e.kind}${e.primary ? ", primary" : ""}; rule in scripts/build-readme-art.mjs)`);
      } else if (e.show[s] === true && docs.length && !hits.length) {
        err(`${key}: show.${s} is true but no ${s} file names it (looked for ${terms.map((t) => `"${t.term}"`).join(", ")})`);
      }
    }

    // structural cross-checks
    if (list === "projects") {
      if (e.show.readme === false) for (const b of bucketKeys)
        if (b !== "llmsOnlyOpenSourceIds" && xb[b].includes(e.id)) err(`${key}: show.readme is false but the id is in meta.x_brand.${b} (fix the bucket)`);
      if (e.show.llms === false && llmsOnly.has(e.id)) err(`${key}: show.llms is false but the id is in meta.x_brand.llmsOnlyOpenSourceIds`);
      if (e.show.llms === true && e.show.readme === false) {
        if (!llmsOnly.has(e.id)) err(`${key}: off the README with show.llms true needs meta.x_brand.llmsOnlyOpenSourceIds, or its llms narrative drops`);
        if (!e.repoUrl || e.provenance === "client") err(`${key}: show.llms true but _openSourcePrimary (build.mjs) skips entries without a public repoUrl or with provenance client`);
      }
      if (e.tier === "flagship" && (e.show.llms === false || e.show.cv === false))
        err(`${key}: tier flagship is auto-selected into public/cv-llms.txt (cv/build-llms-txt.mjs), so it cannot be llms- or cv-hidden`);
    }
    if (list === "collaborators" && "readme" in e.show) {
      const listed = e.publicListing !== false;
      if (listed !== e.show.readme) err(`${key}: publicListing ${e.publicListing ?? "(default true)"} disagrees with show.readme ${e.show.readme}`);
    }
    if (list === "films" && "site" in e.show && e.onFilmsPage !== e.show.site)
      err(`${key}: onFilmsPage ${e.onFilmsPage} disagrees with show.site ${e.show.site}`);
  }
}

if (SURFACES.blog.length) notes.push(`site: blog posts are a dated record; ${blogMentions} mention(s) of hidden entries, not checked (docs/STATE.md, Blog posts on chanmeng.org)`);

// ---------------------------------------------------------------------------
// Part 2: typed references
// ---------------------------------------------------------------------------
// root: a top-level key (list or object); path: dotted, "[]" walks an array.
// to: the target list. `poly` maps a sibling type field to the target list.
const REF_FIELDS = [
  { root: "projects", path: "clientOrgId", to: "organizations" },
  { root: "projects", path: "relatedWorkId", to: "work" },
  { root: "projects", path: "relatedProjectIds", to: "projects" },
  { root: "projects", path: "supersedes", to: "projects" },
  { root: "projects", path: "supersededBy", to: "projects" },
  { root: "projects", path: "meta.x_brand.relatedShowcase[].id", to: "showcase" },
  { root: "openSourceContributions", path: "relatedProjectId", to: "projects" },
  { root: "domains", path: "evidenceProjectIds", to: "projects" },
  { root: "domains", path: "evidenceWorkIds", to: "work" },
  { root: "showcase", path: "capability", to: "showcaseCapabilities" },
  { root: "showcase", path: "relatedWorkId", to: "work" },
  { root: "showcase", path: "relatedProjectId", to: "projects" },
  { root: "productFilms", path: "projectId", to: "projects" },
  { root: "productFilms", path: "showcaseId", to: "showcase" },
  { root: "agentSkills", path: "projectId", to: "projects" },
  { root: "filmCollections", path: "projectId", to: "projects" },
  { root: "films", path: "projectId", to: "projects" },
  { root: "films", path: "collection", to: "filmCollections" },
  { root: "films", path: "showcaseId", to: "showcase" },
  { root: "organizations", path: "meta.x_brand.relatedWorkId", to: "work" },
  { root: "organizations", path: "meta.x_brand.relatedVolunteerId", to: "volunteer" },
  { root: "organizations", path: "meta.x_brand.relatedEducationId", to: "education" },
  { root: "organizations", path: "meta.x_brand.relatedProjectId", to: "projects" },
  { root: "organizations", path: "meta.x_structure.parentOrgId", to: "organizations" },
  { root: "organizations", path: "meta.x_structure.units[].orgId", to: "organizations" },
  { root: "organizations", path: "meta.x_structure.founderCollaboratorId", to: "collaborators" },
  { root: "collaborators", path: "currentOrgId", to: "organizations" },
  { root: "collaborators", path: "worksTogether[].contextId", poly: { field: "contextType", map: { work: "work", project: "projects", volunteer: "volunteer", organization: "organizations", education: "education" } } },
  { root: "events", path: "relatedAwardId", to: "awards" },
  { root: "events", path: "relatedWorkId", to: "work" },
  { root: "events", path: "relatedVolunteerId", to: "volunteer" },
  { root: "events", path: "relatedProjectId", to: "projects" },
  { root: "meta", path: "x_brand.readmePullQuoteId", to: "references" },
  { root: "meta", path: "x_brand.engagementRoles[].proofProjectId", to: "projects" },
  { root: "meta", path: "x_brand.engagementRoles[].proofWorkId", to: "work" },
  { root: "meta", path: "x_brand.teachingCohorts[].partnerOrgIds", to: "organizations" },
  { root: "meta", path: "x_brand.teachingCohorts[].relatedWorkId", to: "work" },
  { root: "meta", path: "x_brand.teachingCohorts[].relatedVolunteerId", to: "volunteer" },
  { root: "meta", path: "x_brand.teachingCohorts[].relatedProjectId", to: "projects" },
  ...bucketKeys.map((k) => ({ root: "meta", path: `x_brand.${k}`, to: "projects" })),
  { root: "meta", path: "x_brand.llmsOnlyOpenSourceIds", to: "projects" },
  { root: "linkedin", path: "honorsAndAwards[]._sourceAward", to: "awards", idOf: (v) => (typeof v === "string" ? v : v?.id) },
  { root: "linkedin", path: "recommendations.received[].ref", to: "references" },
];
// References into something that is not a profile list, checked elsewhere.
const EXTERNAL_FIELDS = [
  { root: "meta", path: "x_brand.featuredArticleIds", note: "blog slugs in the 2d-portfolio repo (scripts/build.mjs)" },
  { root: "films", path: "repo", note: "a repo in docs/ecosystem/lineage.yaml (scripts/check-ecosystem.mjs)" },
  { root: "filmCollections", path: "repo", note: "a repo in docs/ecosystem/lineage.yaml (scripts/check-ecosystem.mjs)" },
];
// Keys that end in Id/Ids but are not references.
const NOT_REFERENCES = new Set(["credentialId", "youtubeId", "shortYoutubeId"]);

// Ids per list, plus contextType aliases.
const idsOf = (list) => new Set((profile[list] ?? []).map((e) => e?.id).filter(Boolean));
const ID_SETS = {};
const idSet = (list) => (ID_SETS[list] ??= idsOf(list));

// Walk a path; returns [{ value, holder, where }].
function walkPath(rootVal, segs, where, holder) {
  if (!segs.length) return [{ value: rootVal, holder, where }];
  const [seg, ...rest] = segs;
  const arr = seg.endsWith("[]");
  const k = arr ? seg.slice(0, -2) : seg;
  const v = rootVal?.[k];
  if (v == null) return [];
  if (arr) return (Array.isArray(v) ? v : []).flatMap((x, i) => walkPath(x, rest, `${where}.${k}[${i}]`, x));
  return walkPath(v, rest, `${where}.${k}`, rootVal);
}
function itemsOf(root) {
  const v = profile[root];
  if (Array.isArray(v)) return v.map((e, i) => ({ e, where: `${root}[${e?.id ?? i}]` }));
  return v ? [{ e: v, where: root }] : [];
}

let refsChecked = 0;
for (const f of REF_FIELDS) {
  const segs = f.path.split(".");
  for (const { e, where } of itemsOf(f.root)) {
    for (const { value, holder, where: w } of walkPath(e, segs, where, e)) {
      const vals = (Array.isArray(value) ? value : [value]).map((x) => (f.idOf ? f.idOf(x) : x)).filter((x) => x != null && x !== "");
      for (const id of vals) {
        refsChecked++;
        let to = f.to;
        if (f.poly) {
          to = f.poly.map[holder?.[f.poly.field]];
          if (!to) { err(`${w}: ${f.poly.field} "${holder?.[f.poly.field]}" names no known list`); continue; }
        }
        if (typeof id !== "string") { err(`${w}: expected an id string, got ${JSON.stringify(id)}`); continue; }
        if (!idSet(to).has(id)) {
          const elsewhere = Object.keys(profile).filter((l) => Array.isArray(profile[l]) && l !== to && idSet(l).has(id));
          err(`${w} = "${id}": not an id in ${to}[]${elsewhere.length ? ` (it is an id in ${elsewhere.join(", ")}[]: wrong field name?)` : ""}`);
        }
      }
    }
  }
}

// References outside the shards: the X register.
const xPosts = read(path.join(repoRoot, "x", "posts.yaml"));
if (xPosts) {
  const reg = yaml.load(xPosts);
  for (const t of reg?.threads ?? []) {
    for (const id of t.projectIds ?? []) { refsChecked++; if (!idSet("projects").has(id)) err(`x/posts.yaml thread ${t.id}: projectIds "${id}" not in projects[]`); }
    if (t.showcaseId) { refsChecked++; if (!idSet("showcase").has(t.showcaseId)) err(`x/posts.yaml thread ${t.id}: showcaseId "${t.showcaseId}" not in showcase[]`); }
  }
}

// Unregistered reference fields.
const norm = (root, p) => `${root}.${p}`.replace(/\[\]/g, "");
const registered = new Set([...REF_FIELDS, ...EXTERNAL_FIELDS].map((f) => norm(f.root, f.path)));
const seenUnregistered = new Set();
function scan(v, p) {
  if (Array.isArray(v)) return v.forEach((x) => scan(x, p));
  if (!v || typeof v !== "object") return;
  for (const [k, x] of Object.entries(v)) {
    const kp = `${p}.${k}`;
    if (/(Id|Ids)$/.test(k) && !NOT_REFERENCES.has(k) && !registered.has(kp) && !seenUnregistered.has(kp)) {
      seenUnregistered.add(kp);
      warn(`unregistered reference field: ${kp} (add it to REF_FIELDS, EXTERNAL_FIELDS or NOT_REFERENCES in scripts/lint-kb.mjs)`);
    }
    scan(x, kp);
  }
}
for (const [root, v] of Object.entries(profile)) scan(v, root);

// ---------------------------------------------------------------------------
// Part 3: generated org context
// ---------------------------------------------------------------------------
const MON = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)";
const DATED_CONTEXT = new RegExp(String.raw`\(\w{3} \d{4}|\([^()]*\b${MON}\b[^()]*\d{4}[^()]*\)`);
let contextsChecked = 0;
for (const o of profile.organizations ?? []) {
  const x = o?.meta?.x_brand;
  if (!x) continue;
  const key = `organizations[${o.id}].meta.x_brand`;
  const gen = generatedOrgContext(o, profile);
  if (x.context === "auto") {
    contextsChecked++;
    if (!gen) err(`${key}.context is "auto" but no related work/volunteer/education entry has a startDate and a title`);
    continue;
  }
  if (x.contextTitle != null) err(`${key}.contextTitle is set but context is not "auto", so nothing reads it`);
  if (typeof x.context !== "string") continue;
  const e = orgRelatedEntry(o, profile)?.entry;
  if (!(e?.position || e?.studyType) || !e?.startDate) continue;
  contextsChecked++;
  if (DATED_CONTEXT.test(x.context) && x.context !== gen)
    err(`${key}.context is a hand-written title + date string (${JSON.stringify(x.context)}); set context: auto (and contextTitle for a short title) so the dates come from the related entry, which generates ${JSON.stringify(gen)}`);
}

// ---------------------------------------------------------------------------
// Part 4: metric provenance (decision d3)
// ---------------------------------------------------------------------------
// Every { label, value } metric: projects[].metrics, basics.reach.metrics,
// projects[].meta.x_brand.reach.usage. A block-level date (reach.asOf,
// reach.measuredOn) is not inherited: rows in one block were read on
// different days.
const SHARDS = listFiles(path.join(repoRoot, "data", "profile"), /\.ya?ml$/).map((p) => ({ file: rel(p), lines: read(p).split("\n") }));
// file:line of a metric: the first line after its owner's anchor that holds the label.
// fileRe scopes the search: ids repeat across lists (she-sharp is also a work id).
function metricLine(anchorRe, label, fileRe) {
  for (const s of SHARDS.filter((x) => !fileRe || fileRe.test(x.file))) {
    const at = s.lines.findIndex((l) => anchorRe.test(l));
    if (at < 0) continue;
    const i = s.lines.findIndex((l, j) => j > at && l.includes("label:") && l.includes(label));
    return i >= 0 ? `${s.file}:${i + 1}` : `${s.file}:${at + 1}`;
  }
  return "data/profile:?";
}
const METRICS = [];
for (const m of profile.basics?.reach?.metrics ?? []) METRICS.push({ m, owner: null, at: () => metricLine(/^  reach:/, m.label, /00-basics\.yaml$/) });
for (const p of profile.projects ?? []) {
  const anchor = new RegExp(`^  - id: ["']?${escapeRe(p.id)}["']?\\s*$`);
  for (const m of [...(p.metrics ?? []), ...(p.meta?.x_brand?.reach?.usage ?? [])]) METRICS.push({ m, owner: p, at: () => metricLine(anchor, m.label, /2[0-3]-projects-[^/]*\.yaml$/) });
}

// (a) public/cv-llms.txt: the selection rule of cv/build-llms-txt.mjs, copied.
// Keep in step with SELECTED_EXTRA_PROJECT_IDS, STAT_MAX_VALUE, STAT_MAX_COUNT,
// the reach block and the Developer-leverage "Template count" line there.
const llmsFlat = (s) => String(s ?? "").replace(/\*\*(?!\s)([^*]+?)\*\*/g, "$1").replace(/`/g, "").replace(/\s+/g, " ").trim();
const CV_LLMS = new Set(profile.basics?.reach?.metrics ?? []);
const byProjectId = (id) => (profile.projects ?? []).find((p) => p.id === id);
const cvLlmsProjects = [...(profile.projects ?? []).filter((p) => p.tier === "flagship"), ...["echook", "google-news-mcp"].map(byProjectId).filter(Boolean)];
for (const p of cvLlmsProjects)
  (p.metrics ?? []).filter((m) => m?.value != null && llmsFlat(m.value).length <= 150).slice(0, 7).forEach((m) => CV_LLMS.add(m));
const templateCount = byProjectId("gradient-svg-generator")?.metrics?.find((m) => llmsFlat(m.label) === "Template count");
if (templateCount) CV_LLMS.add(templateCount);

// (b) text match on the pages people read. A number from the value (dates,
// years and bare single digits dropped, thousands commas ignored) counts when
// a word of the label, or the word after the number in the value, is within
// 60 characters of it and, for a project metric, the project (or its client
// organisation or role, by clientOrgId and relatedWorkId) is named within
// 1,500 characters. A number right after a letter or hyphen (hex ids, CSS
// classes like z-50) does not count.
const PROVENANCE_SURFACES = {
  readme: SURFACES.readme,
  cv: SURFACES.cv,
  linkedin: SURFACES.linkedin.slice(0, 1), // the copy in 70-linkedin.yaml; linkedin/*.md is generated from it
  site: SURFACES.site.filter((d) => !/\.generated\./.test(d.file)), // generated data (geometry, ids) is not copy
};
const decomma = (t) => t.replace(/(\d),(?=\d{3}(?!\d))/g, "$1");
const PROV_TEXT = Object.fromEntries(Object.entries(PROVENANCE_SURFACES).map(([k, docs]) => [k, docs.map((d) => decomma(d.text))]));
const STOP = new Set(["with", "from", "that", "this", "than", "into", "over", "under", "across", "between", "only", "total", "count", "number", "measured", "github", "about", "each", "every", "their", "after", "before", "since", "public"]);
const wordsOf = (s) => (String(s).toLowerCase().match(/[a-z][a-z-]{2,}/g) ?? []).filter((w) => w.length >= 4 && !STOP.has(w));
function numberTokens(value) {
  const v = decomma(String(value))
    .replace(/\d{4}-\d{2}(-\d{2})?|\d{4}[–-]\d{4}/g, " ")
    .replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? \d{4}/g, " ");
  const out = [];
  for (const [, n, pct, next] of v.matchAll(/(\d+(?:\.\d+)?)(\s?%)?\+?\s*([A-Za-z][A-Za-z-]{2,})?/g)) {
    if (!pct && /^(19|20)\d{2}$/.test(n)) continue; // a year
    if (!pct && !n.includes(".") && Number(n) < 10) continue; // too common to mean anything alone
    out.push({ n, pct: !!pct, next: next && !STOP.has(next.toLowerCase()) ? next.toLowerCase() : null });
  }
  return out;
}
const near = (text, idx, re, span) => { re.lastIndex = 0; return re.test(text.slice(Math.max(0, idx - span), idx + span)); };
function textSurfaces({ m, owner }) {
  const toks = numberTokens(m.value);
  if (!toks.length) return [];
  const label = wordsOf(m.label);
  const ownerNames = owner ? [owner, (profile.organizations ?? []).find((o) => o.id === owner.clientOrgId), (profile.work ?? []).find((w) => w.id === owner.relatedWorkId)].filter(Boolean) : [];
  const ownerRes = owner ? ownerNames.flatMap(termsFor).map(termRe) : null;
  const matches = (t) => toks.some((tok) => {
    const pair = [...label, ...(tok.next ? [tok.next] : [])].map((w) => w.slice(0, 6));
    if (!pair.length) return false;
    // The paired word sits in the number's own clause: no quote, comma, semicolon,
    // middle dot, bar or line break between them ("3 migrations", "11 skills" is two facts).
    const words = pair.map(escapeRe).join("|");
    const numRe = new RegExp(`(?<![\\w.-])${escapeRe(tok.n)}${tok.pct ? "\\s?%" : "(?!\\d|\\.\\d)"}`, "g");
    for (const x of t.matchAll(numRe)) {
      const before = t.slice(Math.max(0, x.index - 60), x.index);
      const after = t.slice(x.index + x[0].length, x.index + x[0].length + 60);
      const paired = new RegExp(`(?<![a-z])(?:${words})[^"',;·|\\n]*$`, "i").test(before) || new RegExp(`^[^"',;·|\\n]*?(?<![a-z])(?:${words})`, "i").test(after);
      if (paired && (!ownerRes || ownerRes.some((re) => near(t, x.index, re, 1500)))) return true;
    }
    return false;
  });
  return Object.entries(PROV_TEXT).filter(([, texts]) => texts.some(matches)).map(([s]) => s);
}

let provenanceVisitor = 0;
let provenanceHidden = 0;
const provenanceMisses = [];
for (const x of METRICS) {
  const surfaces = [...textSurfaces(x), ...(CV_LLMS.has(x.m) ? ["cv-llms"] : [])];
  const missing = ["source", "asOf"].filter((k) => x.m[k] == null || x.m[k] === "");
  if (surfaces.length) provenanceVisitor++;
  if (!missing.length) continue;
  if (surfaces.length) provenanceMisses.push(`${x.at()} ${x.owner ? x.owner.id : "basics.reach"} · ${x.m.label} (no ${missing.join(", no ")}; on ${surfaces.join(", ")})`);
  else provenanceHidden++;
}
if (provenanceMisses.length) {
  const say = STRICT_PROVENANCE ? err : warn;
  say(`metric-provenance: ${provenanceMisses.length} visitor-facing metric(s) lack source or asOf, listed below (backfill staged in data/_intake/metrics-provenance-wave-1-2026-10.md)${STRICT_PROVENANCE ? "" : "; an error under --strict-provenance"}`);
  for (const l of provenanceMisses) say(`metric-provenance: ${l}`);
}
if (provenanceHidden) warn(`metric-provenance: ${provenanceHidden} metric(s) on no visitor-facing page lack source or asOf (always a warning)`);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
if (SHOW_TERMS) { console.log("Identifiers matched per entry with show:"); for (const l of termReport) console.log(l); }
for (const n of notes) console.log(`  · ${n}`);
for (const w of warnings) console.warn(`  ⚠ ${w}`);
if (errors.length) {
  console.error(`✗ lint-kb: ${errors.length} error(s)`);
  for (const e of errors) console.error(`  ${e}`);
}
console.log(`${errors.length ? "✗" : "✓"} lint-kb: ${declared} entries with show:, ${refsChecked} references over ${REF_FIELDS.length} registered fields, ${contextsChecked} org contexts, ${METRICS.length} metrics (${provenanceVisitor} visitor-facing) · errors ${errors.length} · warnings ${warnings.length}`);
if (errors.length && !WARN_ONLY) process.exit(1);
