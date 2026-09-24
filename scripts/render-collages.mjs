#!/usr/bin/env node
// Renders evidence/collages/<capability>.html → public/evidence/collages/<capability>.jpg
// for every showcaseCapabilities[] entry in data/profile/45-showcase.yaml.
//
// Uses playwright-core driving the locally installed Chrome (no browser
// download). Output is JPEG, not PNG: the collages are mostly photographs and
// screenshots, and PNG put each one at several MB on a README that loads them
// all at once. Each plate paints its own background, so the result is the same
// on GitHub's light and dark canvases.
//
//   npm run build:collages              # all
//   npm run build:collages -- promo-film # one

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";
import { loadProfile } from "./lib/load-profile.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const srcDir = path.join(repoRoot, "evidence", "collages");
const outDir = path.join(repoRoot, "public", "evidence", "collages");

const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const caps = (loadProfile().showcaseCapabilities ?? []).filter((c) => !only.length || only.includes(c.id));
if (!caps.length) {
  console.error(`✗ no showcaseCapabilities matched ${only.join(", ") || "(none defined)"}`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ channel: process.env.COLLAGE_CHROME_CHANNEL ?? "chrome" });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
let failed = 0;

for (const c of caps) {
  const html = path.join(srcDir, `${c.id}.html`);
  if (!fs.existsSync(html)) {
    console.error(`✗ ${c.id}: missing ${path.relative(repoRoot, html)}`);
    failed++;
    continue;
  }
  const broken = [];
  page.removeAllListeners("requestfailed");
  page.on("requestfailed", (r) => broken.push(r.url()));
  await page.goto(pathToFileURL(html).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const missingImgs = await page.evaluate(() =>
    [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute("src")),
  );
  if (broken.length || missingImgs.length) {
    console.error(`✗ ${c.id}: failed to load ${[...broken, ...missingImgs].join(", ")}`);
    failed++;
    continue;
  }
  const out = path.join(repoRoot, c.collage.replace(/^\//, ""));
  await page.screenshot({ path: out, fullPage: true, type: "jpeg", quality: 86 });
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`✓ ${path.relative(repoRoot, out).replace(/\\/g, "/")}  (${kb} KB)`);
}

await browser.close();
if (failed) process.exit(1);
