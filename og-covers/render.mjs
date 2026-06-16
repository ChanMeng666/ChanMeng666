// Render per-project OG/social covers to PNG.
//
// For each manifest entry it embeds the project's own logo + the "by Chan Meng"
// monkey mark (chosen for contrast), writes <repoDir>/og/og-cover.html (a
// committed, re-renderable source), then screenshots the [data-out] element to
// <repoDir>/<publicDir>/og-cover.png at 2× (→ 2400×1260).
//
// Usage:
//   node og-covers/render.mjs                       # all manifest entries
//   node og-covers/render.mjs --only fanfic-lab,library-os
//
// Tooling mirrors scripts/export-linkedin-cards.mjs: the playwright-core that
// ships with the global @playwright/cli, pointed at the on-disk full Chromium to
// dodge the version-mismatch download prompt.

import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderHtml, isDark } from "./template.mjs";
import { projects } from "./projects.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "D:/npm-global/node_modules/@playwright/cli/node_modules/playwright-core",
);

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const brandsDir = path.join(repoRoot, "public", "brands");

const MIME = { ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };
async function dataUri(absPath) {
  const buf = await fs.readFile(absPath);
  const mime = MIME[path.extname(absPath).toLowerCase()] || "application/octet-stream";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

// --only id,id filter
const onlyArg = process.argv.indexOf("--only");
const only = onlyArg !== -1 ? new Set(process.argv[onlyArg + 1].split(",")) : null;
const selected = only ? projects.filter((p) => only.has(p.id)) : projects;
if (!selected.length) {
  console.error("No projects matched.", only ? [...only] : "");
  process.exit(1);
}

// 1. Generate the HTML source files into each repo's og/ folder.
const monkeyBlack = await dataUri(path.join(brandsDir, "chan-meng-monkey-black-transparent.svg"));
const monkeyWhite = await dataUri(path.join(brandsDir, "chan-meng-monkey-white-transparent.svg"));

const jobs = [];
for (const p of selected) {
  const logoUri = await dataUri(path.join(p.repoDir, p.logo));
  const markUri = isDark(p.bg) ? monkeyWhite : monkeyBlack;
  const html = renderHtml({ ...p, logoDataUri: logoUri, markDataUri: markUri });
  const ogDir = path.join(p.repoDir, "og");
  await fs.mkdir(ogDir, { recursive: true });
  const htmlPath = path.join(ogDir, "og-cover.html");
  await fs.writeFile(htmlPath, html, "utf8");
  const outPath = path.join(p.repoDir, p.publicDir, "og-cover.png");
  jobs.push({ id: p.id, htmlPath, outPath });
}

// 2. Screenshot each surface.
const CHROME = path.join(
  process.env.LOCALAPPDATA || "",
  "ms-playwright/chromium-1223/chrome-win64/chrome.exe",
);
const browser = await chromium.launch({ executablePath: CHROME });
const context = await browser.newContext({ deviceScaleFactor: 2 });
const page = await context.newPage();

let total = 0;
for (const job of jobs) {
  const url = "file:///" + job.htmlPath.replace(/\\/g, "/");
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
  const el = await page.$("[data-out]");
  await el.screenshot({ path: job.outPath });
  console.log("  ✓", job.id, "→", job.outPath);
  total += 1;
}

await context.close();
await browser.close();
console.log(`\nRendered ${total} cover(s).`);
