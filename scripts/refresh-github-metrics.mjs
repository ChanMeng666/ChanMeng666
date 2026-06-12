#!/usr/bin/env node
// Refreshes machine-derivable GitHub metrics for projects in the
// data/profile/2*-projects-*.yaml shards.
//
// Why this is line-anchored (not a YAML round-trip):
//   the project shards are heavily-commented hand-curated content. A
//   js-yaml dump strips comments and reorders keys. So we do targeted
//   in-place edits: only lines matching `- { label: "<TRACKED>", value: "..." }`
//   inside a project's `metrics:` block get their value replaced — each shard
//   file is read, edited, and written back independently.
//
// Tracked labels — must match exactly (case-sensitive):
//   "Stars"
//   "Forks"
//   "GitHub stars"
//   "GitHub forks"
//   "Latest commit"
//   "Last commit"
//
// If a project doesn't already have one of these labels, the script reports
// the live value but does NOT add it (manual opt-in keeps the curated tone).
//
// Usage:
//   node scripts/refresh-github-metrics.mjs            # dry-run report
//   node scripts/refresh-github-metrics.mjs --apply    # write changes in place
//
// Requires: gh CLI authenticated (`gh auth status`).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { loadProfile, listShardFiles } from "./lib/load-profile.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const projectShardPaths = listShardFiles().filter((f) =>
  /^\d+-projects-/.test(path.basename(f))
);

const APPLY = process.argv.includes("--apply");

const TRACKED_LABELS = new Set([
  "Stars",
  "Forks",
  "GitHub stars",
  "GitHub forks",
  "Latest commit",
  "Last commit",
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseRepoSlug(url) {
  const m = String(url ?? "").match(/^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)/);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, "") };
}

function findGithubSlug(project) {
  for (const candidate of [project.repoUrl, project.url, ...(project.extraLinks ?? []).map((l) => l.url)]) {
    const slug = parseRepoSlug(candidate);
    if (slug) return slug;
  }
  return null;
}

function ghApi(endpoint) {
  return JSON.parse(execSync(`gh api ${endpoint}`, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
}

function formatValueForLabel(label, info) {
  switch (label) {
    case "Stars":
    case "GitHub stars":
      return String(info.stargazers_count);
    case "Forks":
    case "GitHub forks":
      return String(info.forks_count);
    case "Latest commit":
    case "Last commit":
      return (info.pushed_at ?? "").slice(0, 10);
    default:
      return null;
  }
}

// A value is "machine-pure" if it contains no hand-curated narrative —
// only the raw number or date. Narrative values like
//   "122 (Glama) / 121+ (dynamic badge)"
//   "2026-04-21 (2f894c9, still iterating ~1 month in)"
// must not be overwritten by --apply; they're reported as drift but the
// human decides whether to re-narrate.
function isMachinePure(label, value) {
  switch (label) {
    case "Stars":
    case "GitHub stars":
    case "Forks":
    case "GitHub forks":
      return /^\d+$/.test(value);
    case "Latest commit":
    case "Last commit":
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// Load data + locate project metric blocks (per shard file)
// ---------------------------------------------------------------------------

const data = loadProfile();

// shards: shardPath -> { lines, dirty }
const shards = new Map();
const projectBlocks = [];   // { id, shardPath, metricsStart, metricsEnd }

for (const shardPath of projectShardPaths) {
  const lines = fs.readFileSync(shardPath, "utf8").split(/\r?\n/);
  shards.set(shardPath, { lines, dirty: false });

  let currentProject = null;
  let inMetrics = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const idMatch = line.match(/^  - id: (\S+)/);
    if (idMatch) {
      if (currentProject) projectBlocks.push(currentProject);
      currentProject = { id: idMatch[1], shardPath, startLine: i, metricsStart: null, metricsEnd: null };
      inMetrics = false;
      continue;
    }
    if (!currentProject) continue;
    if (line === "    metrics:") {
      currentProject.metricsStart = i;
      inMetrics = true;
      continue;
    }
    if (inMetrics) {
      // Metrics block ends when we hit another top-level project key (indent <= 4
      // chars) that isn't a continuation. Conservative end: a line that is a
      // sibling key like `    status:` / `    startDate:` / `    publicSummary:`.
      if (/^    [a-zA-Z_]/.test(line) && line !== "    metrics:") {
        currentProject.metricsEnd = i;
        inMetrics = false;
      }
    }
  }
  if (currentProject) {
    if (inMetrics) currentProject.metricsEnd = lines.length;
    projectBlocks.push(currentProject);
  }
}

// Cross-reference with parsed data so we get the canonical project objects
const projectsById = Object.fromEntries((data.projects ?? []).map((p) => [p.id, p]));

// ---------------------------------------------------------------------------
// Fetch + diff
// ---------------------------------------------------------------------------

console.log(APPLY ? "Mode: --apply (will write changes)\n" : "Mode: dry-run (no changes written)\n");

const updates = [];                       // [{ shardPath, lineIdx, oldLine, newLine, projectId, label }]
const reportRows = [];                    // [{ projectId, slug, label, current, live, status }]
const skippedNoMetrics = [];              // project ids with GH URL but no metrics block

for (const block of projectBlocks) {
  const project = projectsById[block.id];
  if (!project) continue;
  const slug = findGithubSlug(project);
  if (!slug) continue;
  if (block.metricsStart == null) {
    skippedNoMetrics.push(project.id);
    continue;
  }

  let info;
  try {
    info = ghApi(`repos/${slug.owner}/${slug.repo}`);
  } catch (e) {
    console.log(`  ⚠ ${project.id} (${slug.owner}/${slug.repo}): ${e.message.split("\n")[0]}`);
    continue;
  }

  const { lines } = shards.get(block.shardPath);
  for (let i = block.metricsStart + 1; i < block.metricsEnd; i++) {
    const line = lines[i];
    // Match: `      - { label: "<L>", value: "<V>" }` (also handles single quotes,
    // extra spaces). Capture the label and the value-with-quotes-and-spacing
    // so we can rebuild the line.
    const m = line.match(/^(\s*-\s*\{\s*label:\s*)(["'])([^"']+)\2(\s*,\s*value:\s*)(["'])([^"']*)\5(\s*\})\s*$/);
    if (!m) continue;
    const label = m[3];
    const currentValue = m[6];
    if (!TRACKED_LABELS.has(label)) continue;
    const liveValue = formatValueForLabel(label, info);
    if (liveValue == null) continue;

    let status;
    if (currentValue === liveValue) status = "unchanged";
    else if (!isMachinePure(label, currentValue)) status = "narrative";
    else status = "drift";

    reportRows.push({ projectId: project.id, slug: `${slug.owner}/${slug.repo}`, label, current: currentValue, live: liveValue, status });

    if (status === "drift") {
      const newLine = `${m[1]}${m[2]}${label}${m[2]}${m[4]}${m[5]}${liveValue}${m[5]}${m[7]}`;
      updates.push({ shardPath: block.shardPath, lineIdx: i, oldLine: line, newLine, projectId: project.id, label });
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const driftRows = reportRows.filter((r) => r.status === "drift");
const narrativeRows = reportRows.filter((r) => r.status === "narrative");
const unchanged = reportRows.filter((r) => r.status === "unchanged").length;

console.log(`\nScanned ${projectBlocks.length} projects, ${reportRows.length} tracked metrics: ${driftRows.length} drift, ${narrativeRows.length} narrative (manual), ${unchanged} unchanged.`);
if (skippedNoMetrics.length) {
  console.log(`  (${skippedNoMetrics.length} GH-linked projects have no metrics: block — opt-in by adding \`- { label: "Stars", value: "0" }\` etc.)`);
}
console.log("");

const pad = (s, n) => String(s).padEnd(n);

if (driftRows.length) {
  console.log("Drift (machine-pure values — safe to --apply):");
  console.log(`  ${pad("Project", 28)} ${pad("Label", 16)} ${pad("Current", 14)} → Live`);
  for (const r of driftRows) {
    console.log(`  ${pad(r.projectId, 28)} ${pad(r.label, 16)} ${pad(r.current, 14)} → ${r.live}`);
  }
}

if (narrativeRows.length) {
  console.log(`\nNarrative drift (current value contains prose — NOT overwritten, human re-narrate):`);
  console.log(`  ${pad("Project", 28)} ${pad("Label", 16)} live=${pad("Live", 10)} current="..."`);
  for (const r of narrativeRows) {
    console.log(`  ${pad(r.projectId, 28)} ${pad(r.label, 16)} live=${pad(r.live, 10)} current="${r.current}"`);
  }
}

if (APPLY && updates.length) {
  for (const u of updates) {
    const shard = shards.get(u.shardPath);
    shard.lines[u.lineIdx] = u.newLine;
    shard.dirty = true;
  }
  for (const [shardPath, shard] of shards) {
    if (!shard.dirty) continue;
    fs.writeFileSync(shardPath, shard.lines.join("\n"), "utf8");
    console.log(`\n✓ Wrote ${path.relative(repoRoot, shardPath)}.`);
  }
  console.log(`✓ Applied ${updates.length} updates.`);
  console.log(`  Next: run \`npm run build\` to regenerate README + outputs.`);
} else if (!APPLY && driftRows.length) {
  console.log(`\nRun with --apply to write these changes.`);
} else if (!driftRows.length) {
  console.log(`\n✓ All tracked metrics in sync — nothing to do.`);
}
