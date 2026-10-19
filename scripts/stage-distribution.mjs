// Copy the video files the schedule needs into distribution/_staging/ (local,
// gitignored). The map is `assets` in distribution/plan.yaml: staged path ->
// <repo>/<path in the repo>. A film repo checked out beside this one is used
// when the file is there; otherwise the master is downloaded from GitHub, from
// where docs/film-masters.md says it lives (a release asset or a tracked file;
// needs `gh` signed in). A file already staged is left alone; a staged file
// the map no longer names is removed. Nothing here is ever committed or uploaded.
//
//   node scripts/stage-distribution.mjs [--dry-run]

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dry = process.argv.includes("--dry-run");
const plan = yaml.load(fs.readFileSync(path.join(repoRoot, "distribution", "plan.yaml"), "utf8"));
const lineage = yaml.load(fs.readFileSync(path.join(repoRoot, "docs", "ecosystem", "lineage.yaml"), "utf8"));
const localRoot = lineage.localRoot;
const staging = path.join(repoRoot, "distribution", "_staging");

// docs/film-masters.md: "## <owner>/<repo> (...)" headings, then rows
// "| `<path>` | <MB> | release `<tag>` › `<file>` |" or "| ... | tracked in the repo |".
const masters = new Map();
{
  let owner, repo;
  for (const line of fs.readFileSync(path.join(repoRoot, "docs", "film-masters.md"), "utf8").split(/\r?\n/)) {
    const h = line.match(/^## ([^/\s]+)\/(\S+) \(/);
    if (h) { [, owner, repo] = h; continue; }
    const row = line.match(/^\| `([^`]+)` \| \d+ \| (.+) \|$/);
    if (!row || !repo) continue;
    const rel = row[2].match(/^release `([^`]+)` › `([^`]+)`/);
    if (rel) masters.set(`${repo}/${row[1]}`, { owner, repo, tag: rel[1], file: rel[2] });
    else if (row[2].startsWith("tracked in the repo")) masters.set(`${repo}/${row[1]}`, { owner, repo, tracked: row[1] });
  }
}

const download = (src, to) => {
  const m = masters.get(src);
  if (!m) return false;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (m.tag) {
    execFileSync("gh", ["release", "download", m.tag, "-R", `${m.owner}/${m.repo}`, "-p", m.file, "-O", to, "--clobber"], { stdio: "inherit" });
  } else {
    const buf = execFileSync("gh", ["api", "-H", "Accept: application/vnd.github.raw", `repos/${m.owner}/${m.repo}/contents/${m.tracked}`], { maxBuffer: 1 << 30 });
    fs.writeFileSync(to, buf);
  }
  return true;
};

let copied = 0, downloaded = 0, kept = 0, missing = 0, bytes = 0;
const wanted = new Set();
for (const [dest, src] of Object.entries(plan.assets ?? {})) {
  const from = path.join(localRoot, src);
  const to = path.join(staging, dest);
  wanted.add(path.normalize(to));
  if (fs.existsSync(from)) {
    const size = fs.statSync(from).size;
    bytes += size;
    if (fs.existsSync(to) && fs.statSync(to).size === size) { kept++; continue; }
    if (!dry) { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); }
    copied++;
    continue;
  }
  if (fs.existsSync(to)) { bytes += fs.statSync(to).size; kept++; continue; }
  if (!masters.has(src)) { console.warn(`  ! not local and not in docs/film-masters.md: ${src}`); missing++; continue; }
  if (!dry) { download(src, to); bytes += fs.statSync(to).size; }
  downloaded++;
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
console.log(`stage-distribution${dry ? " (dry run)" : ""}: ${copied} copied, ${downloaded} downloaded, ${kept} already there, ${removed} removed, ${missing} missing; ${(bytes / 1048576).toFixed(0)} MB staged`);
if (missing) process.exit(1);
