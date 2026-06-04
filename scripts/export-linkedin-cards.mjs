// Render the LinkedIn brand surfaces (testimonial cards, profile cover, Featured
// CTA cards) to PNG. Each card element in the source HTML carries a `data-out`
// attribute naming its output file; this script screenshots each one at 2× for
// crisp text on LinkedIn.
//
// Usage:  node scripts/export-linkedin-cards.mjs
//
// Tooling: uses the playwright-core that ships with the globally-installed
// `@playwright/cli` (CLI > MCP). Browsers were installed via `playwright install`
// under %LOCALAPPDATA%/ms-playwright, which playwright-core discovers itself.

import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "D:/npm-global/node_modules/@playwright/cli/node_modules/playwright-core",
);

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const dir = path.join(repoRoot, "linkedin", "linkedin-services");

const SOURCES = ["cards.html", "cover.html", "featured.html"];

// The CLI's playwright-core pins a browser build that may differ from what's
// installed via `playwright install`; point at the on-disk full Chromium to
// avoid a version-mismatch download prompt.
const CHROME = path.join(
  process.env.LOCALAPPDATA || "",
  "ms-playwright/chromium-1223/chrome-win64/chrome.exe",
);
const browser = await chromium.launch({ executablePath: CHROME });
const context = await browser.newContext({ deviceScaleFactor: 2 });
const page = await context.newPage();

let total = 0;
for (const file of SOURCES) {
  const abs = path.join(dir, file);
  const url = "file:///" + abs.replace(/\\/g, "/");
  await page.goto(url, { waitUntil: "networkidle" });
  // Wait for web fonts (Bebas Neue / DM Sans) to load before capture.
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
console.log(`\nExported ${total} image(s) to linkedin/linkedin-services/`);
