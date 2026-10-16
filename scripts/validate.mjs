#!/usr/bin/env node
// Validates the merged data/profile/*.yaml shards against
// schema/profile.schema.json, then checks that ids are unique within every
// top-level list that has them (ids are NOT unique across lists: one slug names
// one real thing wherever it appears). Exits non-zero on any error so CI can
// gate on this. Each error is attributed to the shard file that owns it.
// Cross-references between lists are resolved by scripts/lint-kb.mjs.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { loadProfileWithProvenance, shardForInstancePath } from "./lib/load-profile.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const schemaPath = path.join(repoRoot, "schema", "profile.schema.json");

const { data, provenance } = loadProfileWithProvenance();
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile(schema);
const ok = validate(data);

if (!ok) {
  console.error("✗ data/profile/ failed schema validation:");
  for (const err of validate.errors ?? []) {
    const shard = shardForInstancePath(provenance, err.instancePath);
    const where = shard ? `[${shard}] ` : "";
    console.error(`  ${where}${err.instancePath || "(root)"}  ${err.message}`);
    if (err.params) {
      console.error(`    params: ${JSON.stringify(err.params)}`);
    }
  }
  process.exit(1);
}

// Id uniqueness within each list.
const dupErrors = [];
let listsWithIds = 0;
for (const [key, list] of Object.entries(data)) {
  if (!Array.isArray(list) || !list.some((e) => e && typeof e === "object" && "id" in e)) continue;
  listsWithIds++;
  const seen = new Map();
  list.forEach((e, i) => {
    if (!e || e.id == null) return;
    if (seen.has(e.id)) {
      const shard = shardForInstancePath(provenance, `/${key}/${i}`);
      dupErrors.push(`  ${shard ? `[${shard}] ` : ""}${key}: id "${e.id}" is used by items ${seen.get(e.id)} and ${i}`);
    } else seen.set(e.id, i);
  });
}
if (dupErrors.length) {
  console.error("✗ duplicate ids within a list:");
  for (const m of dupErrors) console.error(m);
  process.exit(1);
}

console.log(`✓ data/profile/*.yaml is valid against schema/profile.schema.json`);
console.log(`  ids unique within  = ${listsWithIds} lists`);
console.log(`  basics.name        = ${data.basics.name}`);
console.log(`  work entries       = ${(data.work ?? []).length}`);
console.log(`  education entries  = ${(data.education ?? []).length}`);
console.log(`  projects entries   = ${(data.projects ?? []).length}`);
console.log(`  certificates       = ${(data.certificates ?? []).length}`);
console.log(`  publications       = ${(data.publications ?? []).length}`);
console.log(`  references         = ${(data.references ?? []).length}`);
