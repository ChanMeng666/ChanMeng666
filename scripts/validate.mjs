#!/usr/bin/env node
// Validates data/profile.yaml against schema/profile.schema.json.
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

const yamlPath = path.join(repoRoot, "data", "profile.yaml");
const schemaPath = path.join(repoRoot, "schema", "profile.schema.json");

const data = yaml.load(fs.readFileSync(yamlPath, "utf8"));
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile(schema);
const ok = validate(data);

if (!ok) {
  console.error("✗ data/profile.yaml failed schema validation:");
  for (const err of validate.errors ?? []) {
    console.error(`  ${err.instancePath || "(root)"}  ${err.message}`);
    if (err.params) {
      console.error(`    params: ${JSON.stringify(err.params)}`);
    }
  }
  process.exit(1);
}

console.log(`✓ data/profile.yaml is valid against schema/profile.schema.json`);
console.log(`  basics.name        = ${data.basics.name}`);
console.log(`  work entries       = ${(data.work ?? []).length}`);
console.log(`  education entries  = ${(data.education ?? []).length}`);
console.log(`  projects entries   = ${(data.projects ?? []).length}`);
console.log(`  certificates       = ${(data.certificates ?? []).length}`);
console.log(`  publications       = ${(data.publications ?? []).length}`);
console.log(`  references         = ${(data.references ?? []).length}`);
