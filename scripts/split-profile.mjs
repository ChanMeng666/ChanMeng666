#!/usr/bin/env node
// One-time migration: split the monolithic data/profile.yaml into the
// data/profile/*.yaml shards consumed by scripts/lib/load-profile.mjs.
//
// Why raw-text slicing (not parse + dump): the monolith is ~1MB of
// heavily-commented hand-curated YAML. js-yaml dump would strip every comment
// and reorder keys. So sections are sliced verbatim at their banner-comment
// boundaries; nothing inside a section changes by even one byte.
//
// Shard layout (filename prefix = merge order; the resulting top-level key
// order exactly matches the monolith so downstream serialization is stable):
//   00-basics.yaml              basics, builderTools
//   10-career.yaml              work, volunteer, education
//   20-projects-flagship.yaml   projects (flagship band)
//   21-projects-oss-primary.yaml  projects (open source — primary band)
//   22-projects-oss-webapps.yaml  projects (collapsible: web applications)
//   23-projects-oss-more.yaml     projects (collapsible: AI/creative/ML/branding/games + commissioned tail)
//   25-contributions.yaml       openSourceContributions
//   30-recognition.yaml         awards, certificates, publications
//   40-skills.yaml              skills, domains, languages, interests
//   50-references.yaml          references
//   60-network.yaml             organizations, collaborators
//   70-linkedin.yaml            linkedin
//   90-meta.yaml                meta
//
// Usage:
//   node scripts/split-profile.mjs            # dry-run: print planned shards
//   node scripts/split-profile.mjs --apply    # write shards, verify deep-equal
//                                             # against the monolith, then
//                                             # delete data/profile.yaml

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const monolithPath = path.join(repoRoot, "data", "profile.yaml");
const shardDir = path.join(repoRoot, "data", "profile");

const APPLY = process.argv.includes("--apply");

// Markers inside the projects section where the list is cut into shards.
// Exact full-line matches against the monolith.
const PROJECT_CUTS = [
  { at: "  # ------- OPEN SOURCE — PRIMARY (visible in the table by default) -------", shard: "21-projects-oss-primary.yaml" },
  { at: "  # ------- OPEN SOURCE — COLLAPSIBLE BY CATEGORY -------", shard: "22-projects-oss-webapps.yaml" },
  { at: "  # AI Applications & Agents", shard: "23-projects-oss-more.yaml" },
];

const SHARDS = [
  { file: "00-basics.yaml", sections: ["basics", "builderTools"], title: "BASICS — identity, summary, social profiles, builder tools" },
  { file: "10-career.yaml", sections: ["work", "volunteer", "education"], title: "CAREER — work roles, volunteer roles, education" },
  { file: "20-projects-flagship.yaml", sections: ["projects"], title: "PROJECTS 1/4 — flagship band", projectsPart: 0 },
  { file: "21-projects-oss-primary.yaml", sections: ["projects"], title: "PROJECTS 2/4 — open source, primary band (visible in README table)", projectsPart: 1 },
  { file: "22-projects-oss-webapps.yaml", sections: ["projects"], title: "PROJECTS 3/4 — open source, collapsible: web applications", projectsPart: 2 },
  { file: "23-projects-oss-more.yaml", sections: ["projects"], title: "PROJECTS 4/4 — open source, collapsible: AI / creative / ML / branding / games + commissioned tail", projectsPart: 3 },
  { file: "25-contributions.yaml", sections: ["openSourceContributions"], title: "OPEN SOURCE CONTRIBUTIONS — PRs, issues, upstream work" },
  { file: "30-recognition.yaml", sections: ["awards", "certificates", "publications"], title: "RECOGNITION — awards, certificates, publications & media" },
  { file: "40-skills.yaml", sections: ["skills", "domains", "languages", "interests"], title: "SKILLS — technical stack, problem domains, languages, interests" },
  { file: "50-references.yaml", sections: ["references"], title: "REFERENCES — testimonials & recommendations" },
  { file: "60-network.yaml", sections: ["organizations", "collaborators"], title: "NETWORK — organizations roster, collaborator graph" },
  { file: "70-linkedin.yaml", sections: ["linkedin"], title: "LINKEDIN — curated snapshot of the live LinkedIn profile" },
  { file: "90-meta.yaml", sections: ["meta"], title: "META — build metadata, x_brand display configuration" },
];

function shardHeader(title, keys, extra = []) {
  return [
    "# =============================================================================",
    `# ${title}`,
    "# =============================================================================",
    `# Shard of Chan Meng's profile data. Top-level keys: ${keys.join(", ")}.`,
    "# All data/profile/*.yaml shards are merged (in filename order) by",
    "# scripts/lib/load-profile.mjs and validated against schema/profile.schema.json.",
    "# After editing: npm run check. Data map + cross-reference rules: CLAUDE.md.",
    ...extra,
    "# =============================================================================",
    "",
  ];
}

// ---------------------------------------------------------------------------
// Slice the monolith
// ---------------------------------------------------------------------------

const sourceText = fs.readFileSync(monolithPath, "utf8");
const lines = sourceText.split(/\r?\n/);

// Locate top-level section keys (column-0 `name:`).
const sectionKeys = []; // { name, keyLine }
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^([A-Za-z][A-Za-z0-9_]*):\s*$/);
  if (m) sectionKeys.push({ name: m[1], keyLine: i });
}

// A section's chunk starts at its banner: walk back over contiguous column-0
// comment lines. The blank line above the banner stays with the previous chunk.
// Chunk ends right before the next section's banner (or EOF).
const chunks = {}; // name -> { start, end } (0-based, end exclusive)
for (let s = 0; s < sectionKeys.length; s++) {
  const { name, keyLine } = sectionKeys[s];
  let start = keyLine;
  while (start > 0 && /^#/.test(lines[start - 1])) start--;
  let end;
  if (s + 1 < sectionKeys.length) {
    let nextStart = sectionKeys[s + 1].keyLine;
    while (nextStart > 0 && /^#/.test(lines[nextStart - 1])) nextStart--;
    end = nextStart;
  } else {
    end = lines.length;
  }
  chunks[name] = { start, end };
}

const expected = new Set(SHARDS.flatMap((s) => s.sections));
for (const name of Object.keys(chunks)) {
  if (!expected.has(name)) {
    console.error(`✗ Monolith has top-level section "${name}" not covered by the shard layout — aborting.`);
    process.exit(1);
  }
}
for (const name of expected) {
  if (!chunks[name]) {
    console.error(`✗ Shard layout expects section "${name}" but the monolith doesn't have it — aborting.`);
    process.exit(1);
  }
}

// Split the projects chunk into 4 parts at the cut markers.
const proj = chunks.projects;
const cutLines = PROJECT_CUTS.map(({ at }) => {
  const idx = lines.findIndex((l, i) => i > proj.start && i < proj.end && l === at);
  if (idx === -1) {
    console.error(`✗ Projects cut marker not found: ${JSON.stringify(at)} — aborting.`);
    process.exit(1);
  }
  return idx;
});
if (!(cutLines[0] < cutLines[1] && cutLines[1] < cutLines[2])) {
  console.error("✗ Projects cut markers out of order — aborting.");
  process.exit(1);
}
const projectsParts = [
  { start: proj.start, end: cutLines[0], hasKey: true },
  { start: cutLines[0], end: cutLines[1], hasKey: false },
  { start: cutLines[1], end: cutLines[2], hasKey: false },
  { start: cutLines[2], end: proj.end, hasKey: false },
];

// ---------------------------------------------------------------------------
// Assemble shard contents
// ---------------------------------------------------------------------------

function chunkText(start, end) {
  // Trim trailing blank lines; each shard re-adds a single trailing newline.
  let e = end;
  while (e > start && lines[e - 1].trim() === "") e--;
  return lines.slice(start, e);
}

const outputs = []; // { file, text, lineCount, sections }
for (const shard of SHARDS) {
  let body = [];
  if (shard.projectsPart !== undefined) {
    const part = projectsParts[shard.projectsPart];
    const extra = part.hasKey
      ? ["# NOTE: the projects list continues across shards 20→23 (concatenated in"]
      : [`# NOTE: continuation of the \`projects:\` list started in 20-projects-flagship.yaml`];
    if (part.hasKey) extra.push("# filename order by the loader).");
    body.push(...shardHeader(shard.title, ["projects"], extra));
    if (!part.hasKey) body.push("projects:");
    body.push(...chunkText(part.start, part.end));
  } else {
    body.push(...shardHeader(shard.title, shard.sections));
    for (const name of shard.sections) {
      const { start, end } = chunks[name];
      body.push(...chunkText(start, end));
      body.push("");
    }
    while (body.length && body[body.length - 1] === "") body.pop();
  }
  const text = body.join("\n") + "\n";
  outputs.push({ file: shard.file, text, lineCount: body.length, sections: shard.sections });
}

// ---------------------------------------------------------------------------
// Report / apply
// ---------------------------------------------------------------------------

console.log(APPLY ? "Mode: --apply\n" : "Mode: dry-run (no files written)\n");
const pad = (s, n) => String(s).padEnd(n);
console.log(`${pad("Shard", 32)} ${pad("Lines", 7)} Sections`);
for (const o of outputs) {
  console.log(`${pad(o.file, 32)} ${pad(o.lineCount, 7)} ${o.sections.join(", ")}`);
}
console.log(`${pad("(monolith)", 32)} ${lines.length}`);

if (!APPLY) {
  console.log("\nDry-run only. Re-run with --apply to write data/profile/ and remove the monolith.");
  process.exit(0);
}

fs.mkdirSync(shardDir, { recursive: true });
for (const o of outputs) {
  fs.writeFileSync(path.join(shardDir, o.file), o.text, "utf8");
}

// Verify: merged shards must deep-equal the monolith parse (including array
// order and — by construction — top-level key order).
const { loadProfileWithProvenance } = await import("./lib/load-profile.mjs");
const monolithData = yaml.load(sourceText);
const merged = loadProfileWithProvenance().data;
const a = JSON.stringify(monolithData);
const b = JSON.stringify(merged);
if (a !== b) {
  console.error("\n✗ Deep-equal verification FAILED — merged shards differ from the monolith.");
  console.error("  Shards left in place for inspection; data/profile.yaml NOT deleted.");
  const keysA = Object.keys(monolithData), keysB = Object.keys(merged);
  if (keysA.join() !== keysB.join()) {
    console.error(`  key order monolith: ${keysA.join(", ")}`);
    console.error(`  key order merged:   ${keysB.join(", ")}`);
  } else {
    for (const k of keysA) {
      if (JSON.stringify(monolithData[k]) !== JSON.stringify(merged[k])) {
        console.error(`  first differing top-level key: ${k}`);
        break;
      }
    }
  }
  process.exit(1);
}

fs.rmSync(monolithPath);
console.log(`\n✓ Wrote ${outputs.length} shards to data/profile/ — merged parse deep-equals the monolith.`);
console.log("✓ Removed data/profile.yaml (recoverable from git history).");
console.log("  Next: switch consumer scripts to scripts/lib/load-profile.mjs and run `npm run check`.");
