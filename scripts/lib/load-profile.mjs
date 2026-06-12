// Shared loader for the sharded profile data source.
//
// data/profile/*.yaml are merged into one profile object, equivalent to the
// old monolithic data/profile.yaml. Rules:
//   - Shards are read in filename order (numeric prefixes define the order).
//   - Each shard declares one or more top-level keys at column 0, with the
//     same indentation the monolith used — so line-anchored edit scripts
//     (e.g. refresh-github-metrics.mjs) keep working on individual shards.
//   - If the same top-level key appears in multiple shards and both values
//     are arrays, they are concatenated in shard order (this is how the
//     `projects` list spans 20-/21-/22-projects-*.yaml). Any other collision
//     is an error: shards must not silently overwrite each other.
//
// Provenance is tracked per top-level key (and per array segment) so that
// validators can point at the shard file an error lives in, not just an
// abstract JSON path.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

export const PROFILE_DIR = path.join(repoRoot, "data", "profile");

export function listShardFiles() {
  if (!fs.existsSync(PROFILE_DIR)) {
    throw new Error(
      `Profile shard directory missing: ${PROFILE_DIR}\n` +
        `Expected data/profile/*.yaml (see CLAUDE.md "Data map").`
    );
  }
  return fs
    .readdirSync(PROFILE_DIR)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .sort()
    .map((f) => path.join(PROFILE_DIR, f));
}

// Returns { data, provenance }.
//   provenance[key] = [{ file, start, end }]   for array keys (item index ranges, end exclusive)
//   provenance[key] = [{ file }]               for non-array keys
export function loadProfileWithProvenance() {
  const data = {};
  const provenance = {};

  for (const file of listShardFiles()) {
    const rel = path.relative(repoRoot, file).replace(/\\/g, "/");
    let doc;
    try {
      doc = yaml.load(fs.readFileSync(file, "utf8"));
    } catch (e) {
      throw new Error(`Failed to parse ${rel}: ${e.message}`);
    }
    if (doc == null) continue;
    if (typeof doc !== "object" || Array.isArray(doc)) {
      throw new Error(`${rel} must be a YAML mapping of top-level profile keys.`);
    }

    for (const [key, value] of Object.entries(doc)) {
      if (!(key in data)) {
        data[key] = value;
        provenance[key] = Array.isArray(value)
          ? [{ file: rel, start: 0, end: value.length }]
          : [{ file: rel }];
        continue;
      }
      if (Array.isArray(data[key]) && Array.isArray(value)) {
        const start = data[key].length;
        data[key] = data[key].concat(value);
        provenance[key].push({ file: rel, start, end: start + value.length });
        continue;
      }
      const prev = provenance[key]?.[0]?.file ?? "(unknown shard)";
      throw new Error(
        `Top-level key "${key}" appears in both ${prev} and ${rel} ` +
          `but is not an array in both — shards must not overwrite each other.`
      );
    }
  }

  if (Object.keys(data).length === 0) {
    throw new Error(`No profile data found in ${PROFILE_DIR}.`);
  }
  return { data, provenance };
}

export function loadProfile() {
  return loadProfileWithProvenance().data;
}

// Maps an AJV instancePath like "/projects/45/metrics/0/value" to the shard
// file that owns it, e.g. "data/profile/21-projects-oss-primary.yaml".
// Returns null when the path can't be attributed.
export function shardForInstancePath(provenance, instancePath) {
  const parts = String(instancePath ?? "")
    .split("/")
    .filter(Boolean);
  if (parts.length === 0) return null;
  const segments = provenance[parts[0]];
  if (!segments) return null;
  if (segments.length === 1 && segments[0].start === undefined) {
    return segments[0].file;
  }
  const idx = Number(parts[1]);
  if (!Number.isInteger(idx)) return segments[0].file;
  for (const seg of segments) {
    if (idx >= seg.start && idx < seg.end) return seg.file;
  }
  return segments[0].file;
}
