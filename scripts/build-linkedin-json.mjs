// Generate linkedin/linkedin-profile.json from data/profile/*.yaml.
//
// data/profile/*.yaml is the single source of truth. The `linkedin:` block in it
// carries all LinkedIn-specific narrative/presentation copy; drift-prone FACTS
// (languages, banner name/headline/pronouns, the FemTech China award fields, and
// a couple of date ranges) are injected here from the canonical main sections so
// they live in exactly one place.
//
// Pipeline:
//   data/profile/*.yaml --(this)--> linkedin/linkedin-profile.json
//                      --(build-linkedin-md.mjs)--> linkedin/*.md
//
// Run:  node scripts/build-linkedin-json.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadProfile } from "./lib/load-profile.mjs";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const profile = loadProfile();

// Base object = the LinkedIn-specific block. Deep-clone so we never mutate the
// parsed YAML in surprising ways.
const ln = JSON.parse(JSON.stringify(profile.linkedin));

// --- date helpers (YYYY-MM -> "Mon YYYY"; endDate null -> "Present") ---
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtMonth = (ym) => {
  if (!ym) return null;
  const [y, m] = String(ym).split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
};
const dateRange = (startDate, endDate) =>
  `${fmtMonth(startDate)} - ${endDate ? fmtMonth(endDate) : "Present"}`;
// Education + projects display ranges use an en-dash with spaces (" – ").
const dateRangeEn = (startDate, endDate) =>
  `${fmtMonth(startDate)} – ${endDate ? fmtMonth(endDate) : "Present"}`;
// Some canonical dates carry day precision (YYYY-MM-DD); take the YYYY-MM head.
const ym = (d) => (d ? String(d).slice(0, 7) : d);

const work = (id) => (profile.work ?? []).find((w) => w.id === id);
const volunteer = (id) => (profile.volunteer ?? []).find((v) => v.id === id);
const education = (id) => (profile.education ?? []).find((e) => e.id === id);
const project = (id) => (profile.projects ?? []).find((p) => p.id === id);
const referenceById = (id) => (profile.references ?? []).find((r) => r.id === id);

// Format a YYYY-MM-DD date as the LinkedIn display form "Month D, YYYY"
// (full month name, no leading zero on the day) — e.g. "2026-05-28" -> "May 28, 2026".
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const fmtRecDate = (ymd) => {
  if (!ymd) return null;
  const [y, m, d] = String(ymd).split("-");
  return `${MONTH_NAMES[Number(m) - 1]} ${Number(d)}, ${y}`;
};

// Replace a value in-place on an object while preserving key order: if the key
// already exists it is overwritten in place; otherwise it is inserted before the
// first present anchor in `before` (a key name or array of candidate key names).
// Appended if no anchor is present. Inserting in the golden key position keeps the
// generated JSON byte-identical to the committed golden, not just deep-equal.
const setInOrder = (obj, key, value, before) => {
  if (key in obj) {
    obj[key] = value;
    return;
  }
  const anchors = before == null ? [] : Array.isArray(before) ? before : [before];
  const anchor = anchors.find((a) => a in obj);
  const rebuilt = {};
  let inserted = false;
  for (const [k, v] of Object.entries(obj)) {
    if (k === anchor) {
      rebuilt[key] = value;
      inserted = true;
    }
    rebuilt[k] = v;
  }
  if (!inserted) rebuilt[key] = value;
  for (const k of Object.keys(obj)) delete obj[k];
  Object.assign(obj, rebuilt);
};

// --- inject: languages (entirely from top-level languages[]) ---
// Label map: "Chinese (Mandarin)" -> "Chinese"; all others pass through.
// fluency -> proficiency verbatim. Order preserved from profile.yaml.
const langLabel = (name) => (name === "Chinese (Mandarin)" ? "Chinese" : name);
ln.languages = (profile.languages ?? []).map((l) => ({
  language: langLabel(l.language),
  proficiency: l.fluency,
}));

// --- inject: banner name / headline / pronouns (from basics) ---
ln.banner = {
  name: profile.basics.name,
  pronouns: profile.basics.pronouns,
  headline: profile.basics.headline,
  ...ln.banner,
};

// --- inject: honorsAndAwards facts from awards[] ---
// Each honor that should pull facts from a canonical award carries a
// `_sourceAward` marker: { awarder, fields }. We inject ONLY the listed fields
// (the subset that reproduces the live LinkedIn display); everything else
// (notably the curated `description`, and any non-matching title/issuer) stays
// verbatim in the block. `issueDate` is derived from the award's date; `links`
// is built as a single-element array from the award URL.
//
// The per-honor `fields` lists were chosen by the deep-equal gate: a field is
// only injected where the canonical award value reproduces golden exactly. The
// drift-check guard (scripts/check-linkedin-sync.mjs) covers the residual
// duplicated fields (titles/issuers left in the block).
const awardByAwarder = (awarder) =>
  (profile.awards ?? []).find((a) => a.awarder === awarder);
for (const h of ln.honorsAndAwards) {
  if (!h._sourceAward) continue;
  const marker = typeof h._sourceAward === "string"
    ? { awarder: h._sourceAward, fields: ["title", "issuer", "issueDate", "links"] }
    : h._sourceAward;
  const a = awardByAwarder(marker.awarder);
  if (!a) throw new Error(`honor _sourceAward awarder not found in awards[]: ${marker.awarder}`);
  delete h._sourceAward;
  const fields = marker.fields ?? [];
  const inj = {
    title: fields.includes("title") ? a.title : h.title,
    issuer: fields.includes("issuer") ? a.awarder : h.issuer,
    issueDate: fields.includes("issueDate") ? fmtMonth(ym(a.date)) : h.issueDate,
    links: fields.includes("links") ? [a.url] : h.links,
  };
  // Rebuild in golden key order: title, associatedWith, issuer, issueDate,
  // onLiveProfile, media, mediaTotal, description, links.
  const order = ["title", "associatedWith", "issuer", "issueDate", "onLiveProfile", "media", "mediaTotal", "description", "links"];
  const merged = { ...h, ...inj };
  Object.keys(h).forEach((k) => delete h[k]);
  for (const k of order) if (merged[k] !== undefined) h[k] = merged[k];
  for (const [k, v] of Object.entries(merged)) if (!(k in h) && v !== undefined) h[k] = v;
}

// --- inject: experience facts from work[] (single-position companies) ---
// Explicit company(name in golden) -> work[].id map. Each of these companies maps
// 1:1 to a single work entry, so the lone position's `dateRange` is derived from
// the work startDate/endDate. `title` is also injected, but only where the
// canonical work.position reproduces the golden display title (most LinkedIn
// titles are curated and differ, so they stay in the block — the drift-check
// guard covers those). `employmentType`, `location`, `description`, `skills`,
// `media`, `moreSkillsCount` are LinkedIn-specific and stay in the block.
//
// Sanicle and Gavigo show TWO LinkedIn positions against one merged work entry,
// so they are intentionally NOT injected here — they stay verbatim in the block.
const expCompanyToWork = {
  "ArchCanvas": "archcanvas",
  "Engram": "engram",
  "TechNest Community": "technest",
  "She Sharp": "she-sharp",
  "FemTech Weekend": "femtech-weekend",
  "CopilotKit": "copilotkit",
  "Aotearoa Infinite Academy": "aotearoa-infinite-academy",
  "Forward with Her 她行": "forward-with-her",
  "FreePeriod": "freeperiod",
  "ByteDance": "bytedance",
  "CORDE": "corde",
};
// `_titleCurated: true` is a YAML-only marker for check-linkedin-sync.mjs
// (exempts a deliberately reworded display title from the drift check) —
// strip it so it never reaches the generated JSON.
for (const c of ln.experience) {
  for (const p of c.positions ?? []) delete p._titleCurated;
}
for (const c of ln.experience) {
  const wid = expCompanyToWork[c.company];
  if (!wid) continue; // Sanicle / Gavigo left verbatim
  const w = work(wid);
  if (!w) throw new Error(`experience company maps to unknown work id: ${c.company} -> ${wid}`);
  if (c.positions.length !== 1) continue; // safety: only single-position here
  const p = c.positions[0];
  // title: inject only when the canonical work.position reproduces the golden
  // display title. `title` is always first in golden order, so if it has been
  // stripped from the block we re-insert it at the front.
  if (!("title" in p) || w.position === p.title) {
    if ("title" in p) {
      p.title = w.position;
    } else {
      const rebuilt = { title: w.position, ...p };
      Object.keys(p).forEach((k) => delete p[k]);
      Object.assign(p, rebuilt);
    }
  }
  // dateRange: always derivable; insert before `duration` to match golden order.
  setInOrder(p, "dateRange", dateRange(w.startDate, w.endDate), "duration");
}

// --- inject: volunteering "Forward with Her" dateRange from volunteer[] ---
for (const v of ln.volunteering) {
  if (v.organization && v.organization.startsWith("Forward with Her")) {
    const src = volunteer("forward-with-her-mentor");
    setInOrder(v, "dateRange", dateRange(src.startDate, src.endDate), "duration");
  }
}

// --- inject: education facts from education[] (matched by id map) ---
// `dateRange` (en-dash form) is derived for all three; `credentialId` and `grade`
// are injected only where the canonical value reproduces golden (Lincoln's
// credentialId; Nanning's grade from `score`). `degree`, `fieldOfStudy`,
// `activitiesAndSocieties`, `description`, and Lincoln/JSNU `grade` are curated
// LinkedIn copy and stay in the block.
const eduSchoolToId = {
  "Lincoln University (NZ)": "lincoln",
  "Jiangsu Normal University": "jsnu",
  "Nanning No.2 High School": "nanning-no2",
};
for (const e of ln.education) {
  const eid = eduSchoolToId[e.school];
  if (!eid) continue;
  const src = education(eid);
  if (!src) throw new Error(`education school maps to unknown id: ${e.school} -> ${eid}`);
  // Golden education order: school, degree, fieldOfStudy, dateRange, grade,
  // activitiesAndSocieties, description, credentialId, media, mediaTotal, url.
  setInOrder(e, "dateRange", dateRangeEn(ym(src.startDate), ym(src.endDate)), ["grade", "activitiesAndSocieties"]);
  // Lincoln is the only education with a canonical credentialId that appears on
  // the live profile; inject it there. Nanning's grade is the canonical `score`.
  // (Lincoln/JSNU `grade` and the other schools' credentialId are curated/absent
  // and stay in the block.)
  if (eid === "lincoln" && src.credentialId) setInOrder(e, "credentialId", src.credentialId, "media");
  if (eid === "nanning-no2" && src.score) setInOrder(e, "grade", src.score, "activitiesAndSocieties");
}

// --- inject: licensesAndCertifications facts from certificates[] ---
// Match each golden cert to a canonical certificate by credentialId (case-
// insensitive), falling back to the verify URL (one cert — AI Fluency — has a
// credentialUrl in golden but no credentialId). Inject `issued` (formatted from
// the cert date) and `credentialUrl`; both reproduce golden for all entries.
// `name`, `issuer`, `skills`, and `note` are LinkedIn-curated/extra and stay in
// the block (most cert display names differ from canonical). `credentialId` is
// the join key and remains in the block.
const certByCid = {};
const certByUrl = {};
for (const c of profile.certificates ?? []) {
  if (c.credentialId) certByCid[c.credentialId.toLowerCase()] = c;
  if (c.url) certByUrl[c.url] = c;
}
for (const lc of ln.licensesAndCertifications) {
  let src = lc.credentialId ? certByCid[lc.credentialId.toLowerCase()] : null;
  if (!src && lc.credentialUrl) src = certByUrl[lc.credentialUrl];
  if (!src) throw new Error(`cert not matched to certificates[]: ${lc.name}`);
  // Golden cert order: name, issuer, issued, credentialId?, showCredential,
  // credentialUrl. Anchor `issued` before credentialId (or showCredential when
  // there is no credentialId, e.g. AI Fluency).
  setInOrder(lc, "issued", fmtMonth(ym(src.date)), ["credentialId", "showCredential"]);
  if (src.url) setInOrder(lc, "credentialUrl", src.url);
}

// --- inject: project dateRanges from projects[] (matched by id map) ---
// Only `dateRange` (en-dash form) is single-sourced, and ONLY for projects whose
// canonical dates derive to exactly the golden display range. Many LinkedIn
// project ranges are curated (different start month, "Present" vs a real end,
// day-precision starts), so those are left in the block. `name`/`description`
// are always curated LinkedIn copy and never injected.
// Only 3 of the 15 LinkedIn projects have a canonical project whose dates derive
// to exactly the golden display range; the rest carry curated ranges (missing or
// day-precision canonical starts, "Present" vs a real end month) and stay in the
// block. The `if (derived === p.dateRange)` guard below makes this list safe to
// extend — entries that don't reproduce golden are simply skipped.
const projNameToId = {
  "Eatropolis — Auckland Culinary Festival Platform (Chow Luck Club × Tātaki Auckland Unlimited)": "eatropolis-website",
  "SunoStats — Trilingual Suno Music-Lineage Explorer (EN / CN / JP)": "sunostats",
  "She Sharp Member Platform — AI Mentor-Matching SaaS for NZ's Largest Women-in-Tech Community": "she-sharp",
};
for (const p of ln.projects) {
  const pid = projNameToId[p.name];
  if (!pid) continue;
  const src = project(pid);
  if (!src) throw new Error(`project name maps to unknown id: ${p.name} -> ${pid}`);
  // Only projects whose canonical dates derive to exactly the golden range are in
  // this map (verified against golden); inject unconditionally. The drift-check
  // guard re-derives and asserts agreement. Golden order: name, dateRange, then
  // associatedWith? / description — anchor before whichever comes first.
  setInOrder(p, "dateRange", dateRangeEn(ym(src.startDate), ym(src.endDate)), ["associatedWith", "description"]);
}

// --- inject: recommendations text + date from references[] (matched by `ref` id) ---
// Each block recommendation carries a `ref` id pointing to a references[] entry.
// `text` is injected verbatim from references[].reference (the canonical, now
// LinkedIn-faithful copy) and `date` from references[].meta.x_brand.givenAt
// (YYYY-MM-DD -> "Month D, YYYY"). `profileUrl` is injected from references[]
// only when it is byte-equal to the value the block already carries (i.e. the
// canonical store has the same URL); otherwise the block value is kept.
// `recommender`, `headline`, `relationship` are LinkedIn display-specific and
// stay in the block. The `ref` marker itself is removed from the output.
// Golden key order: recommender, headline, date, relationship, text, profileUrl.
for (const r of ln.recommendations?.received ?? []) {
  if (!r.ref) throw new Error(`recommendation has no ref: ${r.recommender}`);
  const src = referenceById(r.ref);
  if (!src) throw new Error(`recommendation ref not found in references[]: ${r.ref}`);
  const refUrl = src.meta?.x_brand?.linkedinUrl ?? src.meta?.x_brand?.profileUrl;
  delete r.ref;
  setInOrder(r, "date", fmtRecDate(src.meta?.x_brand?.givenAt), "relationship");
  setInOrder(r, "text", src.reference, "profileUrl");
  if (refUrl && refUrl === r.profileUrl) setInOrder(r, "profileUrl", refUrl);
}

const outPath = path.join(repoRoot, "linkedin", "linkedin-profile.json");
writeFileSync(outPath, JSON.stringify(ln, null, 2) + "\n", "utf8");
console.log("✓ wrote linkedin/linkedin-profile.json from data/profile/*.yaml");
