#!/usr/bin/env node
// PreToolUse hook: refuse Edit/Write/MultiEdit/NotebookEdit on a generated file
// and say which source to edit and which npm script rebuilds it.
// Bypass deliberately with KB_ALLOW_GENERATED=1 in the environment.
// Bash-tool writes (sed, heredoc, redirection) are not seen by this hook.
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// [pattern over repo-relative POSIX path, source to edit, command that rebuilds]
const RULES = [
  [/^README\.md$/, "data/profile/*.yaml (buckets in 90-meta.yaml) or templates/", "npm run build"],
  [/^llms(-full)?\.txt$/, "data/profile/*.yaml or templates/", "npm run build"],
  [/^dist\//, "data/profile/*.yaml, data/brand.yaml (dist/brand/)", "npm run build (dist/brand: npm run build:brand)"],
  [/^linkedin\/linkedin-[^/]+\.md$/, "data/profile/70-linkedin.yaml (facts in the other shards)", "npm run build:linkedin"],
  [/^linkedin\/linkedin-profile\.json$/, "data/profile/70-linkedin.yaml (facts in the other shards)", "npm run build:linkedin"],
  [/^public\/cv-llms\.txt$/, "data/profile/*.yaml or cv/build-llms-txt.mjs", "npm run build:cv-geo"],
  [/^public\/cv\.jsonld$/, "data/profile/*.yaml or cv/build-jsonld.mjs", "npm run build:cv-geo"],
  [/^cv\/tokens\.typ$/, "data/brand.yaml", "npm run build:brand"],
  [/^cv\/exports\/[^/]+\.(docx|txt|pdf)$/, "cv/chan-meng-cv-ats.typ", "pwsh cv/build.ps1 (docx/txt alone: npm run build:ats-exports)"],
  [/^docs\/INDEX\.md$/, "shard headers, doc headings and package.json", "npm run build:index"],
  [/^scripts\/README\.md$/, "each script's header comment and package.json", "npm run build:index"],
  [/^wiki\//, "data/profile/*.yaml and docs/stories/*.md", "the wiki build script (see docs/INDEX.md)"],
  [/^linkedin\/posts\.yaml$/, "linkedin/capture/latest.json (re-capture with the linkedin-sync skill)", "npm run build:linkedin-register"],
  [/^linkedin\/posts\/[^/]+\.yaml$/, "linkedin/capture/latest.json (re-capture with the linkedin-sync skill)", "npm run build:linkedin-register"],
  [/^linkedin\/company\/[^/]+\/posts(\.yaml|\/[^/]+\.yaml)$/, "linkedin/company/<page>/capture/ (linkedin-sync skill)", "npm run build:linkedin-register"],
  [/^suno\/(songs|words)\.yaml$/, "suno/capture/*.json; tags in suno/curation.yaml", "npm run build:suno"],
  [/^distribution\/(status\.yaml|calendar\.md)$/, "distribution/plan.yaml", "npm run build:distribution (or npm run calendar)"],
];

function relPath(p) {
  if (!p || typeof p !== "string") return null;
  let s = p.replace(/\\/g, "/");
  // Git Bash style /d/foo -> d:/foo
  const m = /^\/([a-zA-Z])\/(.*)$/.exec(s);
  if (m) s = `${m[1]}:/${m[2]}`;
  const abs = path.isAbsolute(s) ? s : path.join(ROOT, s);
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null; // outside repo
  return rel;
}

function matchRule(rel) {
  // Windows paths are case-insensitive: compare lower-cased on win32.
  const flags = process.platform === "win32" ? "i" : "";
  return RULES.find(([re]) => new RegExp(re.source, flags).test(rel));
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let input;
  try { input = JSON.parse(raw || "{}"); } catch { process.exit(0); } // never block on bad input
  const tool = input.tool_name;
  if (!["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) process.exit(0);
  const ti = input.tool_input || {};
  const rel = relPath(ti.file_path || ti.notebook_path);
  if (!rel) process.exit(0);
  const rule = matchRule(rel);
  if (!rule) process.exit(0);
  if (process.env.KB_ALLOW_GENERATED === "1") {
    process.stdout.write(`guard-generated: ${rel} is generated; edit allowed because KB_ALLOW_GENERATED=1.\n`);
    process.exit(0);
  }
  const [, source, cmd] = rule;
  process.stderr.write(
    `Blocked: ${rel} is a generated file and the next build overwrites it.\n` +
    `Edit the source instead: ${source}\n` +
    `Then regenerate with: ${cmd}\n` +
    `Deliberate exception: set KB_ALLOW_GENERATED=1 in the session environment (see .claude/hooks/README.md).\n`
  );
  process.exit(2);
});
