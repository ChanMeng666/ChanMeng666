#!/usr/bin/env node
// CV anchor-fact drift guard.
//
// The CV's prose (cv/sections/*.typ) is deliberately hand-curated — it is NOT
// generated from the profile data, and its summaries may tighten or reword.
// But its ANCHOR FACTS must stay true to data/profile/10-career.yaml:
//   - date ranges        → ERROR on mismatch (dates are objective; --strict exits 1)
//   - role titles        → WARNING (CV titles are intentionally tightened;
//                          normalized/subset comparison keeps noise down)
//   - org URLs           → WARNING
//   - unmapped role-line → WARNING (extend CV_ORG_TO_WORK below)
//
// Scope: the role-line(...) calls in TWO hand-curated Typst surfaces —
//   1. cv/sections/experience.typ  (the designed 2-page CV)
//   2. cv/chan-meng-cv-ats.typ     (the plain ATS resume; see CLAUDE.md
//      "Facts live in FOUR places")
// The ATS resume's local role-line() helper (cv/ats-components.typ)
// deliberately keeps the SAME named parameters and the same one-argument-per-
// line call formatting, so one regex pair parses both files unchanged. The
// helper is DEFINED in ats-components.typ, not in the entry point, so the
// `#let role-line(` definition is never parsed here as a phantom entry.
//
// SECOND CONSUMER (added 2026-08-03): scripts/lib/parse-ats-resume.mjs also
// parses cv/chan-meng-cv-ats.typ — it generates the .docx and .txt in
// cv/exports/ from the same role-line(...) calls. Two parsers now depend on that
// file's call shape, so the formatting rule above is doubly load-bearing. The
// two differ in one way on purpose: this file is NOT comment-aware (hence the
// "never write role-line + ( inside a comment" rule), while the ATS parser
// strips comments first. Both assert an exact role count, so a divergence fails
// loudly on whichever side sees it rather than silently disagreeing.
//
// The italic "Previously:" footer block in experience.typ is freeform prose and
// intentionally NOT parsed — the three roles it mentions (ByteDance, CORDE,
// Forward with Her) ARE parsed from the ATS resume, where they are real
// dated entries. projects.typ / recognition.typ are a future increment.
//
// Usage:
//   node scripts/check-cv-sync.mjs            # report; always exit 0
//   node scripts/check-cv-sync.mjs --strict   # exit 1 on date-range errors

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadProfile } from "./lib/load-profile.mjs";

const STRICT = process.argv.includes("--strict");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const CV_FILES = [
  path.join(repoRoot, "cv", "sections", "experience.typ"),
  path.join(repoRoot, "cv", "chan-meng-cv-ats.typ"),
];

// CV display-org -> work[].id. Extend when a new role-line is added to either
// CV surface. A role with no work[] entry must use extra-role(...) in the ATS
// resume so it is not parsed here at all.
const CV_ORG_TO_WORK = {
  "Engram": "engram",
  "TechNest Community": "technest",
  "GAVIGO Inc.": "gavigo",
  "She Sharp": "she-sharp",
  "FemTech Weekend": "femtech-weekend",
  "Sanicle": "sanicle",
  // ATS resume only — promoted out of the designed CV's italic "Previously:" line.
  "Forward with Her": "forward-with-her",
  "ByteDance": "bytedance",
  "CORDE": "corde",
};

const profile = loadProfile();
const workById = Object.fromEntries((profile.work ?? []).map((w) => [w.id, w]));

// ---------------------------------------------------------------------------
// Parse role-line(...) calls
// ---------------------------------------------------------------------------

function parseRoleLines(file) {
  const src = fs.readFileSync(file, "utf8");
  const rel = path.relative(repoRoot, file).replace(/\\/g, "/");
  const out = [];
  for (const m of src.matchAll(/role-line\(([\s\S]*?)\n\s*\)/g)) {
    const body = m[1];
    const field = (name) => {
      const f = body.match(new RegExp(`${name}:\\s*"([^"]*)"`));
      return f ? f[1] : null;
    };
    out.push({
      file: rel,
      title: field("title"),
      org: field("org"),
      orgUrl: field("org-url"),
      dates: field("dates"),
    });
  }
  return out;
}

const roleLines = [];
const perFile = [];
for (const file of CV_FILES) {
  const rel = path.relative(repoRoot, file).replace(/\\/g, "/");
  const parsed = parseRoleLines(file);
  // Hard-fail PER FILE: a silently-zero parse means the file structure drifted
  // away from what this regex understands, which would turn the guard into a
  // no-op without anyone noticing.
  if (!parsed.length) {
    console.error(`✗ No role-line(...) calls parsed from ${rel} — parser or file structure changed.`);
    process.exit(1);
  }
  perFile.push(`${rel} (${parsed.length})`);
  roleLines.push(...parsed);
}

// ---------------------------------------------------------------------------
// Comparisons
// ---------------------------------------------------------------------------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtMonth = (ym) => {
  if (!ym) return null;
  const [y, mo] = String(ym).split("-");
  return mo ? `${MONTHS[Number(mo) - 1]} ${y}` : y;
};
const derivedRange = (w) =>
  `${fmtMonth(String(w.startDate).slice(0, 7))} — ${w.endDate == null || w.endDate === "" || w.endDate === "present" ? "Present" : fmtMonth(String(w.endDate).slice(0, 7))}`;
// CV dates may use em/en-dash/hyphen with flexible spacing — normalize before compare.
const normDates = (s) => String(s ?? "").replace(/\s*[—–-]\s*/g, " — ").trim();

const normTitle = (s) => String(s).toLowerCase()
  .replace(/\([^)]*\)/g, " ")
  .replace(/[—–\-&/·,]/g, " ")
  .replace(/\s+/g, " ").trim();
const titleTokens = (s) => new Set(normTitle(s).split(" ").filter(Boolean));
const titleAgrees = (a, b) => {
  if (normTitle(a) === normTitle(b)) return true;
  const ta = titleTokens(a), tb = titleTokens(b);
  return [...ta].every((t) => tb.has(t));
};
const normUrl = (u) => String(u ?? "").replace(/\/+$/, "").toLowerCase();

const errors = [];
const warnings = [];

for (const r of roleLines) {
  const at = `${r.file}: `;
  const wid = CV_ORG_TO_WORK[r.org];
  if (!wid) {
    warnings.push(`${at}role-line org "${r.org}" is not in CV_ORG_TO_WORK — add the mapping so its facts are checked.`);
    continue;
  }
  const w = workById[wid];
  if (!w) {
    errors.push(`${at}role-line "${r.org}" maps to work id "${wid}" which no longer exists in 10-career.yaml.`);
    continue;
  }
  const want = derivedRange(w);
  if (normDates(r.dates) !== normDates(want)) {
    errors.push(`${at}"${r.org}" dates drift: CV shows "${r.dates}" but work[${wid}] derives "${want}".`);
  }
  if (r.title && !titleAgrees(r.title, w.position)) {
    warnings.push(`${at}"${r.org}" title differs: CV "${r.title}" vs work[${wid}].position "${w.position}" (fine if intentionally tightened).`);
  }
  if (r.orgUrl && w.url && normUrl(r.orgUrl) !== normUrl(w.url)) {
    warnings.push(`${at}"${r.org}" org-url differs: CV "${r.orgUrl}" vs work[${wid}].url "${w.url}".`);
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (errors.length) {
  console.error(`✗ ${errors.length} CV anchor-fact error(s):`);
  for (const e of errors) console.error(`    ${e}`);
}
if (warnings.length) {
  console.warn(`⚠ ${warnings.length} CV warning(s):`);
  for (const w of warnings) console.warn(`    ${w}`);
}
const scope = `${roleLines.length} role-lines across ${perFile.join(", ")}`;
if (!errors.length && !warnings.length) {
  console.log(`✓ CV anchor facts (${scope}) agree with 10-career.yaml.`);
} else if (!errors.length) {
  console.log(`✓ CV date ranges all agree with 10-career.yaml (${scope} checked).`);
}

if (STRICT && errors.length) process.exit(1);
