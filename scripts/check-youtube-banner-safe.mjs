// Assert the YouTube banner keeps every visible element inside the
// all-device safe area. YouTube crops one uploaded banner differently per
// surface (TV / desktop / tablet / mobile); the only region every crop has
// in common is the mobile/all-device safe area — 773×211.5 CSS px of the
// full 1280×720 surface. Anything outside that rect is cropped away on some
// device, so this check gates every edit to banner.html before re-render.
//
// Usage:  node scripts/check-youtube-banner-safe.mjs
//         → exits 0 if all six elements sit inside the safe area AND the
//           text→composition gutter stays above 60px; exits 1 otherwise.
//
// Tooling: uses the playwright-core that ships with the globally-installed
// `@playwright/cli` (CLI > MCP), matching export-youtube-banner.mjs.

import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "D:/npm-global/node_modules/@playwright/cli/node_modules/playwright-core",
);

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const dir = path.join(repoRoot, "youtube", "banner");

// Browsers live under PLAYWRIGHT_BROWSERS_PATH (falls back to the default
// %LOCALAPPDATA%/ms-playwright). Pick the newest installed chromium-* build,
// same as the sibling render script.
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

const abs = path.join(dir, "banner.html");
const url = "file:///" + abs.replace(/\\/g, "/");
await page.goto(url, { waitUntil: "networkidle" });
// Wait for web fonts (Anton / DM Sans) to load before measuring.
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(350);

// Safe-area edges in CSS px (see youtube/README.md "YouTube crop zones").
const SAFE = { l: 253.5, t: 254.25, r: 1026.5, b: 465.75 };
const GUTTER_MIN = 60;

const report = await page.evaluate(
  (S) =>
    [".eyebrow", ".name", ".tagline", ".b-ink", ".b-orange", ".logo"].map(
      (sel) => {
        const b = document.querySelector(sel).getBoundingClientRect();
        return {
          sel,
          l: +b.left.toFixed(2),
          t: +b.top.toFixed(2),
          r: +b.right.toFixed(2),
          b: +b.bottom.toFixed(2),
          ok: b.left >= S.l && b.top >= S.t && b.right <= S.r && b.bottom <= S.b,
        };
      },
    ),
  SAFE,
);

console.table(report);

const gutter = await page.evaluate(() => {
  const widths = [".eyebrow", ".tagline", ".name"].map(
    (sel) => document.querySelector(sel).getBoundingClientRect().right,
  );
  const widest = Math.max(...widths);
  const orangeLeft = document
    .querySelector(".b-orange")
    .getBoundingClientRect().left;
  return {
    widest: +widest.toFixed(2),
    orangeLeft: +orangeLeft.toFixed(2),
    gutter: +(orangeLeft - widest).toFixed(2),
  };
});
console.log("Gutter:", gutter);

await context.close();
await browser.close();

const allSafe = report.every((row) => row.ok);
const gutterOk = gutter.gutter > GUTTER_MIN;

if (allSafe && gutterOk) {
  console.log(
    `\nPASS — all six elements inside the safe area, gutter ${gutter.gutter}px > ${GUTTER_MIN}px.`,
  );
} else {
  if (!allSafe) {
    console.log(
      "\nFAIL — one or more elements fall outside the safe area (see `ok` column above).",
    );
  }
  if (!gutterOk) {
    console.log(
      `\nFAIL — text→composition gutter ${gutter.gutter}px is at or below the ${GUTTER_MIN}px minimum.`,
    );
  }
  process.exitCode = 1;
}
