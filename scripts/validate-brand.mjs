#!/usr/bin/env node
// Validates data/brand.yaml against schema/brand.schema.json.
// Also checks that every color.semantic.* value points to an existing color.raw.* key.
// Exits non-zero on validation errors so CI can gate on this.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const yamlPath = path.join(repoRoot, "data", "brand.yaml");
const schemaPath = path.join(repoRoot, "schema", "brand.schema.json");

const brand = yaml.load(fs.readFileSync(yamlPath, "utf8"));
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile(schema);
const ok = validate(brand);

if (!ok) {
  console.error("✗ data/brand.yaml failed schema validation:");
  for (const err of validate.errors ?? []) {
    console.error(`  ${err.instancePath || "(root)"}  ${err.message}`);
    if (err.params) {
      console.error(`    params: ${JSON.stringify(err.params)}`);
    }
  }
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Cross-reference: every color.semantic.* must point to an existing raw key,
// OR point to another already-defined raw key by direct hex (forbidden — flag).
// ---------------------------------------------------------------------------
const rawKeys = new Set(Object.keys(brand.color?.raw ?? {}));
const semanticErrors = [];
for (const [name, value] of Object.entries(brand.color?.semantic ?? {})) {
  if (typeof value !== "string") {
    semanticErrors.push(`semantic.${name}: must be a string reference to a raw color key`);
    continue;
  }
  if (value.startsWith("#")) {
    semanticErrors.push(`semantic.${name}: '${value}' is a hex literal — must reference a raw color key instead`);
    continue;
  }
  if (!rawKeys.has(value)) {
    semanticErrors.push(`semantic.${name}: references '${value}' which is not in color.raw.*`);
  }
}

if (semanticErrors.length) {
  console.error("\n✗ color.semantic.* cross-reference errors:");
  for (const e of semanticErrors) console.error(`  ${e}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Sanity: every typography.scale.*.family must reference an existing family
// ---------------------------------------------------------------------------
const familyKeys = new Set(Object.keys(brand.typography?.families ?? {}));
const familyErrors = [];
for (const [name, style] of Object.entries(brand.typography?.scale ?? {})) {
  if (!familyKeys.has(style.family)) {
    familyErrors.push(`typography.scale.${name}.family='${style.family}' is not in typography.families.*`);
  }
}
if (familyErrors.length) {
  console.error("\n✗ typography family cross-reference errors:");
  for (const e of familyErrors) console.error(`  ${e}`);
  process.exit(1);
}

console.log(`✓ data/brand.yaml is valid against schema/brand.schema.json`);
console.log(`  version            = ${brand.version}`);
console.log(`  color.raw          = ${Object.keys(brand.color?.raw ?? {}).length} tokens`);
console.log(`  color.semantic     = ${Object.keys(brand.color?.semantic ?? {}).length} tokens`);
console.log(`  typography.scale   = ${Object.keys(brand.typography?.scale ?? {}).length} styles`);
console.log(`  voice.principles   = ${(brand.voice?.principles ?? []).length} rules`);
console.log(`  signatures         = ${Object.keys(brand.signatures ?? {}).filter((k) => k !== "adoptedInReadme").length} defined`);
