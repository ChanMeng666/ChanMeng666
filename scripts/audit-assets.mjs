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
import { loadProfile } from "./lib/load-profile.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const data = loadProfile();
const brandPath = path.join(repoRoot, "data", "brand.yaml");
const brand = fs.existsSync(brandPath)
  ? yaml.load(fs.readFileSync(brandPath, "utf8"))
  : null;

// Files that are intentionally used outside the README pipeline. Add a path
// here only for assets referenced OUTSIDE the rendered README — e.g. a GitHub
// repo Settings → Social Preview image consumed via the GitHub UI. (The animated
// hero public/github-cover.svg is embedded in the README, so the rendered-README
// scan below already covers it.)
const EXTERNAL_REFERENCES = new Set([]);

const referenced = new Set(EXTERNAL_REFERENCES);

// Look-like-a-real-path filter: starts with /public/, no spaces, no parens.
// Avoids tracking documentation strings (e.g. brand.yaml imagery.approved
// entries that read "/public/brands/ (curated logos...)" as if they were
// referenced assets).
const PATH_RE = /^\/public\/[^\s()]+$/;
function walk(node) {
  if (node == null) return;
  if (typeof node === "string") {
    if (PATH_RE.test(node)) referenced.add(node);
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
if (brand) walk(brand);

// In addition to YAML, scan the rendered build outputs for /public/ paths.
// Rendered outputs are ground truth: they cover template-hardcoded assets
// (e.g. hero logo) and dynamically-composed paths (e.g. cert-issuer logos
// keyed by category) without needing the audit to understand template logic.
// This requires `npm run build` to have run first; `npm run check` does that.
const renderedOutputs = ["README.md", "llms.txt", "llms-full.txt", "dist/profile.json"];
for (const rel of renderedOutputs) {
  const abs = path.join(repoRoot, rel);
  if (!fs.existsSync(abs)) continue;
  const txt = fs.readFileSync(abs, "utf8");
  for (const m of txt.matchAll(/\/public\/[^"'<>\s)}{,\\]+/g)) {
    referenced.add(m[0]);
  }
}

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
