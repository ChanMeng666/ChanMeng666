#!/usr/bin/env node
// Deliberate "I reviewed this entry" bump: rewrites ONLY the lastUpdated line
// of the named entries, in place, in whichever data/profile/*.yaml shard owns
// them. Line-anchored (comments, ordering, quote style preserved).
//
// `lastUpdated` is the input to scripts/check-freshness.mjs's review SLA, so
// it must stay meaningful: bump it only after actually re-reading the entry
// and confirming its facts. There is deliberately NO --all flag — bulk-bumping
// would destroy the field's meaning.
//
// Usage:
//   node scripts/mark-reviewed.mjs work.engram                  # dry-run
//   node scripts/mark-reviewed.mjs work.engram --apply          # write
//   node scripts/mark-reviewed.mjs 'awards.UN CSW 69' --apply   # key match is
//                                  case-insensitive substring for title-keyed
//                                  sections
//   node scripts/mark-reviewed.mjs projects.sunostats --date=2026-06-01 --apply

import fs from "node:fs";
import path from "node:path";
import { listShardFiles } from "./lib/load-profile.mjs";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const dateArg = args.find((a) => a.startsWith("--date="));
const refs = args.filter((a) => !a.startsWith("--"));

if (!refs.length) {
  console.error('usage: mark-reviewed.mjs <section.key> [...] [--apply] [--date=YYYY-MM-DD]');
  process.exit(2);
}

const newDate = dateArg ? dateArg.slice("--date=".length) : new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
  console.error(`✗ --date must be YYYY-MM-DD, got "${newDate}"`);
  process.exit(2);
}

const KEY_FIELDS = ["id", "name", "title", "awarder"];
const unquote = (s) => s.replace(/^["']|["']$/g, "");

// Build a per-shard line model once.
const shardLines = new Map(); // file -> { lines, dirty }
for (const f of listShardFiles()) {
  shardLines.set(f, { lines: fs.readFileSync(f, "utf8").split(/\r?\n/), dirty: false });
}

// Locate `section.key` -> { file, entryStart, entryEnd } across shards.
// Entries are `  - ` items under a column-0 `section:` key (the indentation
// convention all shards share with the old monolith).
function findEntry(section, key) {
  const hits = [];
  for (const [file, shard] of shardLines) {
    const { lines } = shard;
    let inSection = false;
    let entryStart = -1;
    const closeEntry = (end) => {
      if (entryStart === -1) return;
      for (let j = entryStart; j < end; j++) {
        const m = lines[j].match(/^(?:  - |    )(\w+):[ \t]*(.*)$/);
        if (!m || !KEY_FIELDS.includes(m[1])) continue;
        const val = unquote(m[2].trim());
        const exact = val === key;
        const loose = val.toLowerCase().includes(key.toLowerCase());
        if (exact || loose) {
          hits.push({ file, entryStart, entryEnd: end, matchedValue: val, exact });
          return;
        }
      }
    };
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (new RegExp(`^${section}:\\s*$`).test(line)) { inSection = true; entryStart = -1; continue; }
      if (inSection && /^[A-Za-z][A-Za-z0-9_]*:/.test(line)) { closeEntry(i); inSection = false; entryStart = -1; }
      if (!inSection) continue;
      if (/^  - /.test(line)) { closeEntry(i); entryStart = i; }
    }
    if (inSection) closeEntry(lines.length);
  }
  // Prefer exact key matches when the loose search over-matches.
  const exact = hits.filter((h) => h.exact);
  return exact.length ? exact : hits;
}

let failed = false;
const planned = []; // { file, lineIdx, oldLine, newLine, ref }

for (const ref of refs) {
  const dot = ref.indexOf(".");
  if (dot === -1) { console.error(`✗ "${ref}" — expected <section>.<key>`); failed = true; continue; }
  const section = ref.slice(0, dot);
  const key = unquote(ref.slice(dot + 1));

  const hits = findEntry(section, key);
  if (hits.length === 0) { console.error(`✗ ${ref}: no entry found in any shard.`); failed = true; continue; }
  if (hits.length > 1) {
    console.error(`✗ ${ref}: ambiguous — matches ${hits.map((h) => `"${h.matchedValue}" (${path.basename(h.file)})`).join(", ")}. Use a more specific key.`);
    failed = true; continue;
  }

  const { file, entryStart, entryEnd } = hits[0];
  const { lines } = shardLines.get(file);
  let luIdx = -1;
  for (let i = entryStart; i < entryEnd; i++) {
    if (/^    lastUpdated:/.test(lines[i])) { luIdx = i; break; }
  }
  if (luIdx === -1) {
    console.error(`✗ ${ref}: entry found in ${path.basename(file)} (line ${entryStart + 1}) but it has no lastUpdated line — add one manually first.`);
    failed = true; continue;
  }
  const m = lines[luIdx].match(/^(    lastUpdated:\s*)(["']?)([^"'#]*?)\2(\s*(?:#.*)?)$/);
  if (!m) { console.error(`✗ ${ref}: could not parse lastUpdated line: ${lines[luIdx]}`); failed = true; continue; }
  const quote = m[2] || '"';
  planned.push({
    file, lineIdx: luIdx, ref,
    oldLine: lines[luIdx],
    newLine: `${m[1].trimEnd()} ${quote}${newDate}${quote}${m[4] ?? ""}`,
  });
}

if (failed) process.exit(1);

console.log(APPLY ? "Mode: --apply\n" : "Mode: dry-run (no changes written)\n");
for (const p of planned) {
  console.log(`${p.ref}  (${path.relative(repoRoot, p.file)}:${p.lineIdx + 1})`);
  console.log(`  - ${p.oldLine.trim()}`);
  console.log(`  + ${p.newLine.trim()}`);
}

if (APPLY) {
  for (const p of planned) {
    const shard = shardLines.get(p.file);
    shard.lines[p.lineIdx] = p.newLine;
    shard.dirty = true;
  }
  for (const [file, shard] of shardLines) {
    if (shard.dirty) fs.writeFileSync(file, shard.lines.join("\n"), "utf8");
  }
  console.log(`\n✓ Marked ${planned.length} entr${planned.length === 1 ? "y" : "ies"} reviewed as of ${newDate}.`);
  console.log("  Next: npm run check (regenerates outputs).");
} else {
  console.log("\nDry-run. Re-run with --apply to write.");
}
