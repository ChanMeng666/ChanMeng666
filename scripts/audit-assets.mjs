#!/usr/bin/env node
// Audits /public assets referenced from data/profile.yaml.
// Warns on:
//   - referenced files that don't exist on disk
//   - files in /public that aren't referenced anywhere (orphans)
// Exits non-zero on missing files. Orphans only warn (some assets are legacy
// content the user may decide to keep or remove in Phase 4).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const data = yaml.load(fs.readFileSync(path.join(repoRoot, "data", "profile.yaml"), "utf8"));

const referenced = new Set();

function walk(node) {
  if (node == null) return;
  if (typeof node === "string") {
    if (node.startsWith("/public/")) referenced.add(node);
    return;
  }
  if (Array.isArray(node)) {
    for (const x of node) walk(x);
    return;
  }
  if (typeof node === "object") {
    for (const v of Object.values(node)) walk(v);
  }
}
walk(data);

// Walk the actual /public directory
const publicDir = path.join(repoRoot, "public");
const filesOnDisk = new Set();
function walkDir(dir, rel = "/public") {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const cur = `${rel}/${entry.name}`;
    if (entry.isDirectory()) walkDir(abs, cur);
    else filesOnDisk.add(cur.replace(/\\/g, "/"));
  }
}
walkDir(publicDir);

const missing = [...referenced].filter((p) => !filesOnDisk.has(p));
const orphans = [...filesOnDisk].filter((p) => !referenced.has(p));

if (missing.length) {
  console.error(`✗ ${missing.length} referenced assets are missing on disk:`);
  for (const p of missing) console.error(`    ${p}`);
}

if (orphans.length) {
  console.warn(`\n⚠ ${orphans.length} files in /public are not referenced from profile.yaml:`);
  for (const p of orphans.slice(0, 50)) console.warn(`    ${p}`);
  if (orphans.length > 50) console.warn(`    ... and ${orphans.length - 50} more`);
}

if (missing.length) process.exit(1);

console.log(`\n✓ ${referenced.size} referenced assets all present on disk.`);
console.log(`  (${orphans.length} orphans in /public to review in Phase 4.)`);
