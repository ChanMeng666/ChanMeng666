#!/usr/bin/env node
// PostToolUse hook: after Edit/Write/MultiEdit on data/profile/**, data/brand.yaml
// or schema/**, run `npm run validate` (120 s cap). On failure the output goes back
// to Claude as a PostToolUse `decision: "block"` reason, next to the tool result.
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const WATCH = [/^data\/profile\//, /^data\/brand\.yaml$/, /^schema\//];
const MAX = 6000; // characters of validate output returned to Claude

function relPath(p) {
  if (!p || typeof p !== "string") return null;
  let s = p.replace(/\\/g, "/");
  const m = /^\/([a-zA-Z])\/(.*)$/.exec(s);
  if (m) s = `${m[1]}:/${m[2]}`;
  const abs = path.isAbsolute(s) ? s : path.join(ROOT, s);
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  return rel.startsWith("..") || path.isAbsolute(rel) ? null : rel;
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let input;
  try { input = JSON.parse(raw || "{}"); } catch { process.exit(0); }
  if (!["Edit", "Write", "MultiEdit"].includes(input.tool_name)) process.exit(0);
  const ti = input.tool_input || {};
  const rel = relPath(ti.file_path || input.tool_response?.filePath);
  if (!rel) process.exit(0);
  const flags = process.platform === "win32" ? "i" : "";
  if (!WATCH.some((re) => new RegExp(re.source, flags).test(rel))) process.exit(0);

  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const r = spawnSync(npm, ["run", "--silent", "validate"], {
    cwd: ROOT, encoding: "utf8", timeout: 120_000, shell: process.platform === "win32",
  });
  const out = `${r.stdout || ""}${r.stderr || ""}`.trim();
  if (r.status === 0) {
    process.stdout.write(JSON.stringify({ systemMessage: `validate OK after editing ${rel}` }) + "\n");
    process.exit(0);
  }
  const why = r.error?.code === "ETIMEDOUT" || r.signal ? "timed out after 120 s" : `exited ${r.status}`;
  const tail = out.length > MAX ? "...\n" + out.slice(-MAX) : out;
  const reason = `npm run validate ${why} after the edit to ${rel}. Fix the shard before continuing:\n${tail}`;
  process.stdout.write(JSON.stringify({
    decision: "block",
    reason,
  }) + "\n");
  process.exit(0);
});
