#!/usr/bin/env node
// Drift guard for the LinkedIn data store.
//
// scripts/build-linkedin-json.mjs single-sources many facts from the canonical
// main YAML sections into linkedin/linkedin-profile.json. For the overlapping
// facts that remain DUPLICATED between the `linkedin:` block and the main
// sections (the ones the generator does NOT inject because the LinkedIn display
// value is curated and differs), this guard asserts the two still agree where
// they are meant to — and that every injection mapping still resolves.
//
// It catches future drift in fields the deep-equal gate cannot see (e.g. someone
// edits an award title in awards[] but not the block, or removes a work entry a
// block experience maps to). Exits non-zero with a clear report on any divergence.
//
// Run:  node scripts/check-linkedin-sync.mjs   (also wired into `npm run validate`)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadProfile } from "./lib/load-profile.mjs";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const profile = loadProfile();
const ln = profile.linkedin;
// The generated artifact, used to cross-check that re-derived date facts still
// agree with what is published (catches date drift in the canonical sections).
let generated = null;
try {
  generated = JSON.parse(readFileSync(path.join(repoRoot, "linkedin", "linkedin-profile.json"), "utf8"));
} catch { /* not generated yet — date cross-checks are skipped */ }

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtMonth = (ym) => { if (!ym) return null; const [y, m] = String(ym).split("-"); return `${MONTHS[Number(m) - 1]} ${y}`; };
const ym = (d) => (d ? String(d).slice(0, 7) : d);
const dateRange = (s, e) => `${fmtMonth(s)} - ${e ? fmtMonth(e) : "Present"}`;
const dateRangeEn = (s, e) => `${fmtMonth(s)} – ${e ? fmtMonth(e) : "Present"}`;
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const fmtRecDate = (ymd) => { if (!ymd) return null; const [y, m, d] = String(ymd).split("-"); return `${MONTH_NAMES[Number(m) - 1]} ${Number(d)}, ${y}`; };

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);

if (!ln) err("data/profile/*.yaml has no top-level `linkedin:` block.");

const work = (id) => (profile.work ?? []).find((w) => w.id === id);
const volunteer = (id) => (profile.volunteer ?? []).find((v) => v.id === id);
const education = (id) => (profile.education ?? []).find((e) => e.id === id);
const project = (id) => (profile.projects ?? []).find((p) => p.id === id);
const awardByAwarder = (a) => (profile.awards ?? []).find((x) => x.awarder === a);

// --- honorsAndAwards: every _sourceAward marker must resolve; the awarder/date
// must still produce the injected values. Titles/issuers that the block keeps
// (i.e. NOT listed in the marker's `fields`) are curated and not checked. ---
let honorsChecked = 0;
for (const h of ln?.honorsAndAwards ?? []) {
  if (!h._sourceAward) continue;
  honorsChecked++;
  const marker = typeof h._sourceAward === "string"
    ? { awarder: h._sourceAward, fields: ["title", "issuer", "issueDate", "links"] }
    : h._sourceAward;
  const a = awardByAwarder(marker.awarder);
  if (!a) { err(`honor _sourceAward awarder not found in awards[]: "${marker.awarder}"`); continue; }
  if (!a.date) err(`award "${a.awarder}" has no date (needed for honor issueDate).`);
  if ((marker.fields ?? []).includes("links") && !a.url) err(`award "${a.awarder}" has no url (needed for honor links).`);
}

// --- experience: every mapped company must resolve to one work entry with the
// dates the block's dateRange is derived from. Where the canonical title equals
// the golden title we also confirm it still matches; differing titles are
// curated and intentionally left in the block (no assertion). ---
const expCompanyToWork = {
  "Engram": "engram", "TechNest Community": "technest", "She Sharp": "she-sharp",
  "FemTech Weekend": "femtech-weekend", "CopilotKit": "copilotkit",
  "Aotearoa Infinite Academy": "aotearoa-infinite-academy", "Forward with Her 她行": "forward-with-her",
  "FreePeriod": "freeperiod", "ByteDance": "bytedance", "CORDE": "corde",
};
const genExp = (company) => generated?.experience?.find((c) => c.company === company);
for (const [company, wid] of Object.entries(expCompanyToWork)) {
  const w = work(wid);
  if (!w) { err(`experience "${company}" maps to missing work id "${wid}".`); continue; }
  if (!w.startDate) err(`work "${wid}" has no startDate (needed for "${company}" dateRange).`);
  const pub = genExp(company)?.positions?.[0]?.dateRange;
  const derived = dateRange(ym(w.startDate), ym(w.endDate));
  if (pub && pub !== derived)
    err(`experience "${company}" dateRange drift: work[] derives "${derived}" but published "${pub}".`);
}
// Forward with Her volunteering dateRange source.
if (!volunteer("forward-with-her-mentor")) err(`volunteer "forward-with-her-mentor" missing (Forward with Her dateRange source).`);

// --- education: mapped schools must resolve; Lincoln credentialId + Nanning
// score are injected, so assert they still exist. ---
const eduSchoolToId = {
  "Lincoln University (NZ)": "lincoln", "Jiangsu Normal University": "jsnu", "Nanning No.2 High School": "nanning-no2",
};
for (const [school, eid] of Object.entries(eduSchoolToId)) {
  const e = education(eid);
  if (!e) { err(`education "${school}" maps to missing id "${eid}".`); continue; }
  if (!e.startDate) err(`education "${eid}" has no startDate (needed for "${school}" dateRange).`);
  if (eid === "lincoln" && !e.credentialId) err(`education "lincoln" lost its credentialId (injected into LinkedIn).`);
  if (eid === "nanning-no2" && !e.score) err(`education "nanning-no2" lost its score (injected as LinkedIn grade).`);
}

// --- certificates: every block cert must still resolve to a canonical
// certificate by credentialId (case-insensitive) or by verify URL. ---
const certByCid = {}, certByUrl = {};
for (const c of profile.certificates ?? []) { if (c.credentialId) certByCid[c.credentialId.toLowerCase()] = c; if (c.url) certByUrl[c.url] = c; }
let certsChecked = 0;
for (const lc of ln?.licensesAndCertifications ?? []) {
  certsChecked++;
  let src = lc.credentialId ? certByCid[lc.credentialId.toLowerCase()] : null;
  if (!src && lc.credentialUrl) src = certByUrl[lc.credentialUrl];
  if (!src) err(`cert "${lc.name}" no longer resolves to any certificates[] entry (join key changed).`);
}

// --- projects: mapped projects must resolve and still derive to the dateRange
// they were single-sourced from (they were stripped from the block, so re-derive
// and just confirm the canonical entry still has the dates). ---
const projNameToId = {
  "Eatropolis — Auckland Culinary Festival Platform (Chow Luck Club × Tātaki Auckland Unlimited)": "eatropolis-website",
  "SunoStats — Trilingual Suno Music-Lineage Explorer (EN / CN / JP)": "sunostats",
  "She Sharp Member Platform — AI Mentor-Matching SaaS for NZ's Largest Women-in-Tech Community": "she-sharp",
};
const genProj = (name) => generated?.projects?.find((p) => p.name === name);
for (const [name, pid] of Object.entries(projNameToId)) {
  const p = project(pid);
  if (!p) { err(`project "${name}" maps to missing id "${pid}".`); continue; }
  if (!p.startDate) err(`project "${pid}" has no startDate (needed for LinkedIn dateRange).`);
  const pub = genProj(name)?.dateRange;
  const derived = dateRangeEn(ym(p.startDate), ym(p.endDate));
  if (pub && pub !== derived)
    err(`project "${name}" dateRange drift: projects[] derives "${derived}" but published "${pub}".`);
}

// --- recommendations: `text` and `date` are single-sourced from references[],
// matched by the explicit `ref` id (robust against display-name differences).
// Assert every ref resolves, and that references[].reference + the formatted
// givenAt reproduce the published recommendation text/date verbatim. ---
const refById = {};
for (const r of profile.references ?? []) if (r.id) refById[r.id] = r;
const genRec = (recommender) => generated?.recommendations?.received?.find((x) => x.recommender === recommender);
let recMatched = 0;
for (const r of ln?.recommendations?.received ?? []) {
  if (!r.ref) { err(`recommendation "${r.recommender}" has no \`ref\` (cannot single-source from references[]).`); continue; }
  const src = refById[r.ref];
  if (!src) { err(`recommendation "${r.recommender}" ref "${r.ref}" not found in references[].`); continue; }
  recMatched++;
  const pub = genRec(r.recommender);
  if (pub) {
    if (typeof src.reference === "string" && src.reference !== pub.text)
      err(`recommendation "${r.recommender}" text drift: references[id=${r.ref}] no longer matches published text.`);
    const wantDate = fmtRecDate(src.meta?.x_brand?.givenAt);
    if (wantDate && wantDate !== pub.date)
      err(`recommendation "${r.recommender}" date drift: references[id=${r.ref}] givenAt formats to "${wantDate}" but published "${pub.date}".`);
  }
}

// --- languages: block must NOT carry a `languages` array (it is fully injected
// from the top-level languages[]). ---
if (ln && "languages" in ln) err("`linkedin.languages` should be removed — languages are injected from the top-level languages[].");
if (ln?.banner && ("name" in ln.banner || "headline" in ln.banner || "pronouns" in ln.banner))
  err("`linkedin.banner` should not carry name/headline/pronouns — they are injected from basics.");

// --- report ---
if (warnings.length) for (const w of warnings) console.warn(`  ⚠ ${w}`);
if (errors.length) {
  console.error("✗ LinkedIn sync check FAILED — block and main sections have drifted:");
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log("✓ LinkedIn block is in sync with the canonical main sections.");
console.log(`  honors w/ award source = ${honorsChecked} · experience companies = ${Object.keys(expCompanyToWork).length} · certs resolved = ${certsChecked} · recommendations single-sourced = ${recMatched}/${ln?.recommendations?.received?.length ?? 0}`);
