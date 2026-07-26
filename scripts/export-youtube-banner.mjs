// Render the YouTube channel banner to PNG. The source HTML carries a
// `data-out` attribute naming its output file; this script screenshots that
// element at 2× so text stays crisp when YouTube scales the 1280×720 surface.
//
// Usage:  node scripts/export-youtube-banner.mjs
//         → writes youtube/banner/youtube-banner.png (2× = 2560×1440 from a
//           1280×720 CSS surface — YouTube's recommended upload size)
//
// Tooling: uses the playwright-core that ships with the globally-installed
// `@playwright/cli` (CLI > MCP). Auto-discovery is NOT relied on — the browser
// path is resolved explicitly below from PLAYWRIGHT_BROWSERS_PATH (this machine:
// D:\playwright-browsers), because the CLI's pinned build differs from what is
// installed on disk. Fonts load from Google Fonts, so this needs network.

import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "D:/npm-global/node_modules/@playwright/cli/node_modules/playwright-core",
);

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const dir = path.join(repoRoot, "youtube", "banner");

const SOURCES = ["banner.html"];

// The CLI's playwright-core pins a browser build that may differ from what's
// installed on disk; point at an on-disk full Chromium to avoid a
// version-mismatch download prompt. Browsers live under PLAYWRIGHT_BROWSERS_PATH
// (falls back to the default %LOCALAPPDATA%/ms-playwright). Pick the newest
// installed chromium-* build so this keeps working as builds roll forward.
const browsersRoot =
  process.env.PLAYWRIGHT_BROWSERS_PATH ||
  path.join(process.env.LOCALAPPDATA || "", "ms-playwright");
const fs = require("node:fs");
const newestChromium = fs
  .readdirSync(browsersRoot)
  .filter((d) => /^chromium-\d+$/.test(d))
  .sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1]))
  .pop();
if (!newestChromium) {
  throw new Error(`No chromium-* build found under ${browsersRoot}`);
}
const CHROME = path.join(
  browsersRoot,
  newestChromium,
  "chrome-win64",
  "chrome.exe",
);
const browser = await chromium.launch({ executablePath: CHROME });
const context = await browser.newContext({ deviceScaleFactor: 2 });
const page = await context.newPage();

let total = 0;
for (const file of SOURCES) {
  const abs = path.join(dir, file);
  const url = "file:///" + abs.replace(/\\/g, "/");
  await page.goto(url, { waitUntil: "networkidle" });
  // Wait for web fonts (Anton / DM Sans) to load before capture.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);

  const cards = await page.$$("[data-out]");
  for (const card of cards) {
    const out = await card.getAttribute("data-out");
    await card.screenshot({ path: path.join(dir, out) });
    console.log("  ✓", out);
    total += 1;
  }
}

await context.close();
await browser.close();
console.log(`\nExported ${total} image(s) to youtube/banner/`);
