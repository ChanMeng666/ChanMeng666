// Emit dist/video-data.json — the curated slice the promo film renders from.
//
// WHY THIS LIVES HERE and not in the video repo:
//
// Choosing that the film says "304 commits" and not "297 non-merge" is a claim
// about the record, so it belongs next to the record, under this repo's truth
// maintenance. The video repo commits the *output* and gates on staleness, the
// same way README.md is a generated view of these shards.
//
// WHY IT IS AN EXTRACTION AND NOT A PROJECTION:
//
// `metrics[].value` is prose, on purpose — "304 (297 by Chan + 7 automated
// bumps) (2026-06-25 → 2026-07-15, ~3 weeks intensive); sole author" carries
// caveats a bare integer would lose. A film cannot render that. So each fact
// declares a rule that pulls the number out AND asserts the prose still has the
// shape it had when the claim was written.
//
// When a rule stops matching, this FAILS THE BUILD. That is precisely the case
// where someone rewrites a metric's caveat and a number on screen silently
// becomes wrong. Fix the rule or fix the claim — never loosen the regex.
//
//   node scripts/build-video-data.mjs [--check]

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { loadProfile } from "./lib/load-profile.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const OUT = path.join(repoRoot, "dist", "video-data.json");
const CHECK = process.argv.includes("--check");

const profile = loadProfile();
const errors = [];

/* ── fact rules ─────────────────────────────────────────────────────────────
 *
 * Each entry names where the fact lives and how to read it. `display` is what
 * appears on screen; `n` / `s` is the machine value.
 *
 * Only facts the FILM actually shows are here. This is a ~5KB slice of a 956KB
 * record, and keeping it that small is the point: every entry is a claim
 * somebody has to stand behind on camera.
 */
const FACTS = [
  // — beat 03, ArchLang —
  { key: "archlang.commits", project: "archlang", metric: "Commits (solo)",
    rule: /^(\d[\d,]*)/, cast: "int" },
  { key: "archlang.version", project: "archlang", metric: "npm package",
    rule: /(v\d+\.\d+\.\d+)/, cast: "string" },
  { key: "archlang.releases", project: "archlang", metric: "npm package",
    rule: /\((\d+) tagged releases/, cast: "int" },
  { key: "archlang.diagnostics", project: "archlang", metric: "Diagnostics",
    rule: /^(\d+)/, cast: "int" },
  { key: "archlang.exportFormats", project: "archlang", metric: "Export formats",
    rule: /^(\d+)/, cast: "int" },

  // — beat 04, ArchCanvas —
  { key: "archcanvas.commits", project: "archcanvas", metric: "Commits (solo)",
    rule: /~?(\d[\d,]*)/, cast: "int" },
  { key: "archcanvas.agentTools", project: "archcanvas", metric: "Agent tools",
    rule: /^(\d+)/, cast: "int" },

  // — beat 05, range —
  { key: "gavigo.restoreP50", project: "gavigo-ire", metric: "Restore path p50",
    rule: /^(<?\s*\d+\s*ms)/, cast: "string" },
  { key: "gavigo.soloPct", project: "gavigo-ire", metric: "Chan's commits",
    rule: /~(\d+)%/, cast: "int" },
  { key: "shesharp.members", project: "she-sharp", metric: "Members",
    rule: /^([\d,]+\+)/, cast: "string" },
  { key: "shesharp.soloPct", project: "she-sharp", metric: "Solo commits",
    rule: /\((\d+)%\)/, cast: "int" },
  { key: "shesharp.eventsSince", project: "she-sharp", metric: "Events since 2014",
    rule: /^(\d+\+)/, cast: "string" },
  { key: "tamaiti.commits", project: "tam-ai-ti", metric: "Commits (solo)",
    rule: /^(\d+)/, cast: "int" },
  { key: "tamaiti.journalEntries", project: "tam-ai-ti", metric: "Journal entries",
    rule: /^(\d+)/, cast: "int" },
  // The film's super for this beat is "Te Whare Tapa Whā — in the schema, not
  // the UI". The rule asserts BOTH halves of that claim are still in the
  // record, because the second half is the whole point and the easiest thing
  // for a later edit to soften into decoration.
  { key: "tamaiti.healthModel", project: "tam-ai-ti", field: "narrative.impactHeadline",
    // No \b after "Whā": JS word boundaries are ASCII-only, so a macron is a
    // non-word character and "ā" followed by a space yields no boundary at all.
    // Any te reo or 中文 term in a rule has the same trap.
    rule: /(Te Whare Tapa Whā)/, cast: "string" },
  { key: "tamaiti.modelIsSchema", project: "tam-ai-ti", field: "narrative.impactHeadline",
    rule: /(encoded in the database, not added as decoration)/, cast: "string" },

  // — beat 07, teaching —
  // Prose fields, not metric rows. The regex asserts the sentence still says
  // what the film says out loud.
  { key: "teaching.graduates", work: "technest", field: "publicSummary",
    rule: /graduated (\d+) students/, cast: "int" },
  { key: "teaching.products", work: "technest", field: "publicSummary",
    rule: /shipped (\d+) deployed\s+multi-user AI products/, cast: "int" },
  { key: "teaching.cohorts", metaPath: "x_brand.teachingImpact.cohortCount",
    cast: "int" },

  // — beat 09 and end card —
  { key: "reach.githubStars", reach: "GitHub stars", rule: /^([\d,]+\+?)/, cast: "string" },
  { key: "reach.linkedinFollowers", reach: "LinkedIn followers", rule: /^([\d,]+)/, cast: "string" },
  { key: "reach.newsletter", reach: "newsletter subscribers", rule: /^([\d,]+)/, cast: "string" },

  // — computed —
  { key: "projects.total", compute: () => profile.projects.length, cast: "int" },
  { key: "projects.flagship",
    compute: () => profile.projects.filter((p) => p.tier === "flagship").length, cast: "int" },
  { key: "work.companies", compute: () => profile.work.length, cast: "int" },
];

/* ── resolve ─────────────────────────────────────────────────────────────── */

const facts = {};

for (const spec of FACTS) {
  try {
    facts[spec.key] = resolve(spec);
  } catch (e) {
    errors.push(`${spec.key}: ${e.message}`);
  }
}

function resolve(spec) {
  if (spec.compute) {
    const v = spec.compute();
    return { n: v, display: format(v), path: "computed", rule: "compute" };
  }

  if (spec.metaPath) {
    const v = spec.metaPath.split(".").reduce((o, k) => o?.[k], profile.meta);
    if (v === undefined) {
      throw new Error(`meta.${spec.metaPath} does not exist`);
    }
    return { n: v, display: format(v), path: `meta.${spec.metaPath}`, rule: "direct" };
  }

  let raw;
  let where;

  if (spec.project) {
    const p = profile.projects.find((x) => x.id === spec.project);
    if (!p) throw new Error(`no project with id "${spec.project}"`);

    if (spec.field) {
      const v = spec.field.split(".").reduce((o, k) => o?.[k], p);
      if (v === undefined) {
        throw new Error(`projects[${spec.project}].${spec.field} does not exist`);
      }
      raw = String(v);
      where = `projects[${spec.project}].${spec.field}`;
      return finish(spec, raw, where);
    }

    const m = (p.metrics ?? []).find((x) => x.label === spec.metric);
    if (!m) {
      throw new Error(
        `project "${spec.project}" has no metric labelled "${spec.metric}".\n` +
          `      Available: ${(p.metrics ?? []).map((x) => x.label).join(" | ") || "(none)"}`
      );
    }
    raw = String(m.value);
    where = `projects[${spec.project}].metrics[${spec.metric}]`;
  } else if (spec.work) {
    const w = profile.work.find((x) => x.id === spec.work);
    if (!w) throw new Error(`no work entry with id "${spec.work}"`);
    const v = spec.field.split(".").reduce((o, k) => o?.[k], w);
    if (v === undefined) throw new Error(`work[${spec.work}].${spec.field} does not exist`);
    raw = String(v);
    where = `work[${spec.work}].${spec.field}`;
  } else if (spec.reach) {
    const m = (profile.basics.reach?.metrics ?? []).find((x) => x.label === spec.reach);
    if (!m) {
      throw new Error(
        `basics.reach has no metric labelled "${spec.reach}".\n` +
          `      Available: ${(profile.basics.reach?.metrics ?? []).map((x) => x.label).join(" | ")}`
      );
    }
    raw = String(m.value);
    where = `basics.reach.metrics[${spec.reach}]`;
  } else {
    throw new Error("fact spec names no source");
  }

  return finish(spec, raw, where);
}

function finish(spec, raw, where) {
  const hit = spec.rule.exec(raw);
  if (!hit) {
    throw new Error(
      `rule ${spec.rule} did not match.\n` +
        `      value: ${raw.slice(0, 160)}${raw.length > 160 ? "…" : ""}\n` +
        `      The prose changed shape. Fix the rule or fix the claim — do not loosen the regex.`
    );
  }

  const captured = hit[1];
  const value =
    spec.cast === "int" ? Number(String(captured).replace(/,/g, "")) : String(captured).trim();

  const out = {
    display: spec.cast === "int" ? format(value) : String(captured).trim(),
    path: where,
    rule: String(spec.rule),
    // The full prose, kept so a reviewer can see the caveat the film had to
    // drop. This is the difference between a curated slice and a lossy one.
    raw: raw.length > 240 ? `${raw.slice(0, 240)}…` : raw,
  };
  if (spec.cast === "int") out.n = value;
  else out.s = value;
  return out;
}

function format(v) {
  return typeof v === "number" ? v.toLocaleString("en-NZ") : String(v);
}

/* ── report ─────────────────────────────────────────────────────────────── */

if (errors.length) {
  console.error("\n  ✗ video-data extraction failed:\n");
  for (const e of errors) console.error(`    · ${e}`);
  console.error(
    "\n  Every fact above is something the promo film says on screen. A rule that\n" +
      "  stopped matching means the underlying claim moved — reconcile it rather\n" +
      "  than letting the film assert a number nobody can trace.\n"
  );
  process.exit(1);
}

// Every identity field is required. A null here would render as an empty end
// card in a 97-second film, which is exactly the kind of thing nobody notices
// until it is published — so a missing path fails the build like a bad rule.
const identity = required({
  name: profile.basics.name,
  label: profile.basics.label,
  location: profile.basics.location?.region,
  url: profile.basics.url,
  // The stored phrase is "A minimalist. Subtraction for life, addition for
  // thought." The film says only the aphorism — the self-description in front
  // of it is a bio line, not a title card.
  signaturePhrase: (profile.basics.taglines?.secondary ?? "").replace(/^A minimalist\.\s*/, ""),
  tagline: profile.meta?.x_brand?.valueProposition?.tagline,
  availability: profile.meta?.x_brand?.engagementAvailability?.current,
  bookingUrl: profile.meta?.x_brand?.engagementAvailability?.cta?.primary?.url,
  // The CTA's wording is curated copy, so it comes from the record like the
  // rest. It also keeps the film's anti-typing gate honest: "Book a 30-min
  // intro" typed into a scene trips the digit check as an untraced claim, and
  // the fix for that is to bind it, not to annotate around it.
  bookingLabel: profile.meta?.x_brand?.engagementAvailability?.cta?.primary?.label,
});

function required(obj) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") {
      errors.push(
        `identity.${k} resolved to ${JSON.stringify(v)} — the path moved in the shards.`
      );
    }
  }
  return obj;
}

if (errors.length) {
  console.error("\n  ✗ video-data identity failed:\n");
  for (const e of errors) console.error(`    · ${e}`);
  process.exit(1);
}

const projects = ["archlang", "archcanvas", "vitex", "gavigo-ire", "she-sharp", "tam-ai-ti"]
  .map((id) => {
    const p = profile.projects.find((x) => x.id === id);
    if (!p) {
      console.error(`  ✗ project "${id}" is referenced by the film but not in the record`);
      process.exit(1);
    }
    return {
      id: p.id,
      name: p.name,
      url: p.url ?? null,
      mark: p.logo ? p.logo.replace(/^\/public\//, "") : null,
      tier: p.tier,
      lastUpdated: p.lastUpdated ?? null,
    };
  });

const payload = {
  $comment:
    "Generated by scripts/build-video-data.mjs. The curated slice chan-meng-promo-video renders from. Do not hand-edit — change the shards and rebuild.",
  generatedBy: "scripts/build-video-data.mjs",
  sourceOfTruth: "data/profile/*.yaml",
  generatedAt: new Date().toISOString(),
  identity,
  datestamp: {
    lastUpdated: new Date().toISOString().slice(0, 10),
    build: profile.meta?.version ?? "0",
  },
  facts,
  projects,
  people: {
    // The narrative red line, encoded as data so the film's verify:copy gate
    // can enforce it mechanically rather than by review.
    nameAllowlist: ["Luka Madzarac"],
    organizationAllowlist: (profile.organizations ?? []).map((o) => o.name).filter(Boolean),
  },
};

const json = `${JSON.stringify(payload, null, 2)}\n`;

if (CHECK) {
  if (!fs.existsSync(OUT)) {
    console.error(`  ✗ ${path.relative(repoRoot, OUT)} is missing. Run: npm run build:video-data`);
    process.exit(1);
  }
  // generatedAt always differs; compare everything else.
  const strip = (o) => {
    const c = JSON.parse(typeof o === "string" ? o : JSON.stringify(o));
    delete c.generatedAt;
    delete c.datestamp;
    return JSON.stringify(c);
  };
  if (strip(fs.readFileSync(OUT, "utf8")) !== strip(payload)) {
    console.error(
      `  ✗ ${path.relative(repoRoot, OUT)} is stale. Run: npm run build:video-data`
    );
    process.exit(1);
  }
  console.log(`  ✓ dist/video-data.json is current (${Object.keys(facts).length} facts)`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, json, "utf8");

const sha = crypto.createHash("sha256").update(json).digest("hex").slice(0, 12);
console.log(
  `  ✓ dist/video-data.json — ${Object.keys(facts).length} facts, ` +
    `${projects.length} projects, ${(json.length / 1024).toFixed(1)} KB, sha ${sha}`
);
for (const [k, v] of Object.entries(facts)) {
  console.log(`    ${k.padEnd(28)} ${String(v.display).padEnd(10)} ← ${v.path}`);
}
