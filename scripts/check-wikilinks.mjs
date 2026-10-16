#!/usr/bin/env node
// Check every [[wikilink]] in the tracked markdown under docs/ (stories and answers included,
// `_private/` never read) and warn about orphan story files.
//
// A link resolves when it is either
//   [[<list>/<id>]]   an entry of that list in the merged shards (ids are unique per list, not
//                     across lists, so a bare [[<id>]] is not accepted), or
//   [[<path>]]        a markdown file relative to docs/, with or without ".md"
//                     (e.g. [[STATE]], [[stories/echook]], [[answers/README]]).
// "[[target|label]]" and "[[target#heading]]" are allowed; only the target is checked. Links inside
// fenced code blocks and inline code are examples, not links, and are skipped.
//
// Orphan story: a docs/stories/<x>.md whose stem is no projects, work or organizations id
// (README.md and narrative.md are not entity stories). Reported as a warning.
//
// Files come from `git ls-files -co --exclude-standard docs`, so new untracked files are checked
// and gitignored ones (docs/*.private.md, any `_private/`) are never opened.
//
// Usage: node scripts/check-wikilinks.mjs [--warn-only]
// Exit 1 on an unresolved link, unless --warn-only.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadProfile } from "./lib/load-profile.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const DOCS = path.join(repoRoot, "docs");
const WARN_ONLY = process.argv.includes("--warn-only");
const NON_ENTITY_STORIES = new Set(["README", "narrative"]);

const data = loadProfile();
const ids = {};
for (const [k, v] of Object.entries(data)) {
  if (!Array.isArray(v)) continue;
  const s = new Set(v.filter((e) => e && typeof e === "object" && typeof e.id === "string").map((e) => e.id));
  if (s.size) ids[k] = s;
}

const files = execFileSync("git", ["ls-files", "-co", "--exclude-standard", "--", "docs"], {
  cwd: repoRoot,
  encoding: "utf8",
})
  .split(/\r?\n/)
  .filter((f) => f.endsWith(".md") && !f.split("/").includes("_private") && !/\.private\./.test(f))
  .filter((f) => fs.existsSync(path.join(repoRoot, f)))
  .sort();

function resolves(target) {
  const t = target.trim();
  const slash = t.indexOf("/");
  if (slash > 0) {
    const list = t.slice(0, slash);
    const id = t.slice(slash + 1);
    if (ids[list]) return ids[list].has(id) ? true : `no ${list} entry with id "${id}"`;
  }
  if (t.split("/").includes("_private") || /\.private\./.test(t)) return "links into a private path";
  const p = path.join(DOCS, t.endsWith(".md") ? t : `${t}.md`);
  if (p.startsWith(DOCS) && fs.existsSync(p)) return true;
  if (slash < 0 && Object.values(ids).some((s) => s.has(t))) return `bare id; write [[<list>/${t}]]`;
  return "neither <list>/<id> in the shards nor a docs/ markdown file";
}

const errors = [];
let linkCount = 0;
for (const rel of files) {
  const lines = fs.readFileSync(path.join(repoRoot, rel), "utf8").split(/\r?\n/);
  let fence = null;
  lines.forEach((line, i) => {
    const f = /^\s*(`{3,}|~{3,})/.exec(line);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
      return;
    }
    if (fence) return;
    const stripped = line.replace(/(`+)[^`]*?\1/g, (m) => " ".repeat(m.length));
    for (const m of stripped.matchAll(/\[\[([^\]\n]+?)\]\]/g)) {
      linkCount++;
      const target = m[1].split("|")[0].split("#")[0];
      const r = resolves(target);
      if (r !== true) errors.push(`${rel}:${i + 1}: [[${m[1]}]]: ${r}`);
    }
  });
}

const storyIds = new Set([...(ids.projects ?? []), ...(ids.work ?? []), ...(ids.organizations ?? [])]);
const orphans = files
  .filter((f) => /^docs\/stories\/[^/]+\.md$/.test(f))
  .map((f) => path.basename(f, ".md"))
  .filter((stem) => !NON_ENTITY_STORIES.has(stem) && !storyIds.has(stem));

for (const e of errors) console.error(`  ERROR ${e}`);
for (const o of orphans) console.warn(`  WARN  docs/stories/${o}.md: no projects, work or organizations id "${o}" (orphan story)`);
console.log(
  `check-wikilinks: ${files.length} files, ${linkCount} links, ${errors.length} unresolved, ${orphans.length} orphan stories`
);
if (errors.length && !WARN_ONLY) process.exit(1);
