#!/usr/bin/env node
// Link-liveness checker for every URL in the data/profile/*.yaml shards.
//
// Part of the truth-maintenance layer: a claim whose evidence URL is dead has
// silently lost its verifiability. URLs are extracted from the RAW shard text
// (so markdown links inside narrative prose are caught too), deduplicated, and
// probed with HEAD (falling back to GET on 405/403).
//
// Classification:
//   dead    — 404 / 410 / DNS failure          (the actionable list)
//   blocked — 401 / 403 / 429 / 999            (bot walls; warn only)
//   error   — 5xx / timeout after one retry    (warn only)
// Hosts in SKIP_HOSTS are never probed (LinkedIn, WeChat, X, Instagram,
// Facebook always bot-wall; probing them is pure noise).
//
// This check NEVER runs in the PR gate — remote-server flakiness must not
// block data edits. It runs in the monthly review-queue workflow.
//
// With --repos, GitHub repo `homepage` deployment links are also folded in.
// These are NOT in the shards, but a repo whose homepage 404s advertises a
// dead deployment at the top of its GitHub page — the shard scan can't see it.
//
// Usage:
//   node scripts/check-links.mjs                       # full report
//   node scripts/check-links.mjs --max=30              # sample (local iteration)
//   node scripts/check-links.mjs --host=github.com     # filter by host substring
//   node scripts/check-links.mjs --repos               # + scan repo homepages (needs gh)
//   node scripts/check-links.mjs --fail-on-dead        # exit 1 if any dead
//   node scripts/check-links.mjs --format=md           # markdown for the issue

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { listShardFiles } from "./lib/load-profile.mjs";

const args = process.argv.slice(2);
const FAIL_ON_DEAD = args.includes("--fail-on-dead");
const MD = args.includes("--format=md");
const HOST_FILTER = (args.find((a) => a.startsWith("--host=")) ?? "").slice("--host=".length);
const MAX = Number((args.find((a) => a.startsWith("--max=")) ?? "").slice("--max=".length)) || Infinity;

const SKIP_HOSTS = [
  "linkedin.com", "mp.weixin.qq.com", "x.com", "twitter.com",
  "instagram.com", "facebook.com",
  // digital.govt.nz serves 404 to GitHub-runner IPs (bot filtering) while
  // resolving fine from residential connections — verified 2026-06-12.
  "digital.govt.nz",
];

const CONCURRENCY = 8;
const TIMEOUT_MS = 10_000;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

// ---------------------------------------------------------------------------
// Extract URLs from raw shard text
// ---------------------------------------------------------------------------

const URL_RE = /https?:\/\/[^\s"'`<>\\)\]},|*]+/g;
const occurrences = new Map(); // url -> [{ file, line }]

for (const file of listShardFiles()) {
  const rel = path.basename(file);
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const m of line.matchAll(URL_RE)) {
      let url = m[0].replace(/[.,;:!?]+$/, ""); // strip trailing punctuation
      if (!occurrences.has(url)) occurrences.set(url, []);
      occurrences.get(url).push({ file: rel, line: i + 1 });
    }
  });
}

// ---------------------------------------------------------------------------
// Optionally fold in GitHub repo `homepage` deployment links (--repos).
// Owners = Chan's account plus the orgs she leads (forks excluded). Requires
// `gh` authenticated; an owner is skipped with a warning if the call fails.
// ---------------------------------------------------------------------------

const SCAN_REPOS = args.includes("--repos");
const REPO_OWNERS = [
  "ChanMeng666", "Whiri-AI", "gavigo-inc", "Sanicleai",
  "NZ-SheSharp", "SheSharp-NZ", "Chow-Luck-Club",
];

if (SCAN_REPOS) {
  for (const owner of REPO_OWNERS) {
    let json;
    try {
      json = execSync(
        `gh repo list ${owner} --limit 1000 --json name,isFork,homepageUrl`,
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 32 * 1024 * 1024 },
      );
    } catch {
      console.error(`(skipped repo homepage scan for ${owner}: gh unavailable or not authenticated)`);
      continue;
    }
    for (const r of JSON.parse(json)) {
      if (r.isFork || !r.homepageUrl) continue;
      const url = r.homepageUrl.replace(/[.,;:!?]+$/, "");
      if (!occurrences.has(url)) occurrences.set(url, []);
      occurrences.get(url).push({ file: `gh:${owner}/${r.name}`, line: "homepage" });
    }
  }
}

const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

// Documentation placeholders are not links — e.g. the Suno-cards usage example
// `https://suno.com/song/YOUR_SONG_ID`. Skip anything with an obvious
// ALL_CAPS placeholder token or an <angle-bracket> template segment, and
// internal/non-public hostnames quoted in technical narratives (no dot, e.g.
// Docker Compose service names like `http://agent:8123`, or localhost).
const isPlaceholder = (u) => /YOUR_[A-Z_]+|<[A-Za-z_-]+>|\.\.\./.test(u);
const isInternal = (u) => {
  const h = hostOf(u);
  return !h.includes(".") || h === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(h);
};

let urls = [...occurrences.keys()].filter((u) => !isPlaceholder(u) && !isInternal(u));
const skipped = urls.filter((u) => SKIP_HOSTS.some((h) => hostOf(u) === h || hostOf(u).endsWith("." + h)));
urls = urls.filter((u) => !skipped.includes(u));
if (HOST_FILTER) urls = urls.filter((u) => hostOf(u).includes(HOST_FILTER));
urls = urls.slice(0, MAX);

// ---------------------------------------------------------------------------
// Probe
// ---------------------------------------------------------------------------

async function probe(url, method = "HEAD", retried = false) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method, redirect: "follow", signal: ctrl.signal,
      headers: { "User-Agent": UA, "Accept": "*/*" },
    });
    if (method === "HEAD" && (res.status === 405 || res.status === 403 || res.status === 404)) {
      return probe(url, "GET", retried); // some servers reject HEAD; re-verify with GET
    }
    const s = res.status;
    if (s === 404 || s === 410) return { url, status: s, verdict: "dead" };
    if (s === 401 || s === 403 || s === 429 || s === 999) return { url, status: s, verdict: "blocked" };
    if (s >= 500) {
      if (!retried) return probe(url, method, true);
      return { url, status: s, verdict: "error" };
    }
    return { url, status: s, verdict: "ok" };
  } catch (e) {
    const dns = /ENOTFOUND|EAI_AGAIN/.test(String(e.cause?.code ?? e.message));
    if (dns) return { url, status: "DNS", verdict: "dead" };
    if (!retried) return probe(url, method, true);
    return { url, status: e.name === "AbortError" ? "timeout" : (e.cause?.code ?? e.name), verdict: "error" };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
let cursor = 0;
async function worker() {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    results.push(await probe(url));
  }
}
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, worker));

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const by = (v) => results.filter((r) => r.verdict === v);
const dead = by("dead"), blocked = by("blocked"), errored = by("error");
const where = (u) => occurrences.get(u).slice(0, 2).map((o) => `${o.file}:${o.line}`).join(", ");

if (MD) {
  console.log("### Link liveness\n");
  console.log(`Probed ${results.length} unique URLs (${skipped.length} skipped as bot-hostile): **${dead.length} dead**, ${blocked.length} blocked, ${errored.length} errored, ${by("ok").length} ok.\n`);
  if (dead.length) {
    console.log("| Dead URL | Status | Referenced at |");
    console.log("|---|---|---|");
    for (const r of dead) console.log(`| ${r.url} | ${r.status} | ${where(r.url)} |`);
    console.log("");
  }
  if (errored.length) {
    console.log("<details><summary>Errored (timeout/5xx — recheck next month)</summary>\n");
    for (const r of errored) console.log(`- ${r.url} (${r.status}) — ${where(r.url)}`);
    console.log("\n</details>");
  }
} else {
  console.log(`Probed ${results.length} unique URLs (${skipped.length} skipped as bot-hostile).`);
  console.log(`  ok: ${by("ok").length}   dead: ${dead.length}   blocked: ${blocked.length}   error: ${errored.length}\n`);
  if (dead.length) {
    console.log("Dead links (fix or remove the reference):");
    for (const r of dead) console.log(`  ✗ ${r.status}  ${r.url}\n        at ${where(r.url)}`);
  }
  if (blocked.length) {
    console.log("\nBlocked by bot walls (verify manually if load-bearing):");
    for (const r of blocked) console.log(`  ⚠ ${r.status}  ${r.url}`);
  }
  if (errored.length) {
    console.log("\nErrored (timeout/5xx — likely transient):");
    for (const r of errored) console.log(`  ⚠ ${r.status}  ${r.url}`);
  }
  if (!dead.length && !blocked.length && !errored.length) console.log("✓ Every probed link is alive.");
}

if (FAIL_ON_DEAD && dead.length) process.exit(1);
