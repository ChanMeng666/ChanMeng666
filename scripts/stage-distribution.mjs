// Copy the video files the schedule needs into distribution/_staging/ (local,
// gitignored), from the film repos beside this one. The map is `assets` in
// distribution/plan.yaml: staged path -> path under the lineage localRoot.
// A file already staged with the same size is left alone; a staged file the
// map no longer names is removed. Nothing here is ever committed or uploaded.
//
//   node scripts/stage-distribution.mjs [--dry-run]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dry = process.argv.includes("--dry-run");
const plan = yaml.load(fs.readFileSync(path.join(repoRoot, "distribution", "plan.yaml"), "utf8"));
const lineage = yaml.load(fs.readFileSync(path.join(repoRoot, "docs", "ecosystem", "lineage.yaml"), "utf8"));
const localRoot = lineage.localRoot;
const staging = path.join(repoRoot, "distribution", "_staging");

let copied = 0, kept = 0, missing = 0, bytes = 0;
const wanted = new Set();
for (const [dest, src] of Object.entries(plan.assets ?? {})) {
  const from = path.join(localRoot, src);
  const to = path.join(staging, dest);
  wanted.add(path.normalize(to));
  if (!fs.existsSync(from)) { console.warn(`  ! source missing: ${src}`); missing++; continue; }
  const size = fs.statSync(from).size;
  bytes += size;
  if (fs.existsSync(to) && fs.statSync(to).size === size) { kept++; continue; }
  if (!dry) { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); }
  copied++;
}
let removed = 0;
const walk = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); if (!dry && fs.readdirSync(p).length === 0) fs.rmdirSync(p); }
    else if (!wanted.has(path.normalize(p))) { if (!dry) fs.rmSync(p); removed++; }
  }
};
walk(staging);
console.log(`stage-distribution${dry ? " (dry run)" : ""}: ${copied} copied, ${kept} already there, ${removed} removed, ${missing} missing; ${(bytes / 1048576).toFixed(0)} MB staged`);
if (missing) process.exit(1);
