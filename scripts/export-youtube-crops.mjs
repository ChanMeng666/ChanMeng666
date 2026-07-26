// Render the three device crops of the exported YouTube banner PNG so you can
// see what each surface actually shows. These are review aids derived from
// `youtube/banner/youtube-banner.png` — regenerate after any re-render of that
// PNG (i.e. after `node scripts/export-youtube-banner.mjs`).
//
// Usage:  node scripts/export-youtube-crops.mjs
//         → writes youtube/banner/crops/crop-desktop.png (2560×424),
//           crop-tablet.png (1855×424), crop-mobile.png (1546×424)
//
// Tooling: uses the playwright-core that ships with the globally-installed
// `@playwright/cli` (CLI > MCP), matching export-youtube-banner.mjs.

import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "D:/npm-global/node_modules/@playwright/cli/node_modules/playwright-core",
);

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const pngPath = path.join(repoRoot, "youtube", "banner", "youtube-banner.png");
const pngUrl = "file:///" + pngPath.replace(/\\/g, "/");
const outDir = path.join(repoRoot, "youtube", "banner", "crops");
fs.mkdirSync(outDir, { recursive: true });

// Device-pixel crop origins from the 2560×1440 rendered PNG (see
// youtube/README.md "YouTube crop zones").
const CROPS = [
  { name: "crop-desktop.png", x: 0, y: 508, w: 2560, h: 424 },
  { name: "crop-tablet.png", x: 353, y: 508, w: 1855, h: 424 },
  { name: "crop-mobile.png", x: 507, y: 508, w: 1546, h: 424 },
];

// Browsers live under PLAYWRIGHT_BROWSERS_PATH (falls back to the default
// %LOCALAPPDATA%/ms-playwright). Pick the newest installed chromium-* build,
// same as the sibling render scripts.
const browsersRoot =
  process.env.PLAYWRIGHT_BROWSERS_PATH ||
  path.join(process.env.LOCALAPPDATA || "", "ms-playwright");
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

for (const crop of CROPS) {
  const html = `<!DOCTYPE html><html><head><style>
    html,body{margin:0;padding:0;}
    .crop{
      position:absolute; left:0; top:0;
      width:${crop.w}px; height:${crop.h}px;
      background-image:url('${pngUrl}');
      background-position:-${crop.x}px -${crop.y}px;
      background-repeat:no-repeat;
    }
  </style></head><body><div class="crop"></div></body></html>`;
  const htmlPath = path.join(outDir, `_tmp-${crop.name}.html`);
  fs.writeFileSync(htmlPath, html);

  const context = await browser.newContext({
    viewport: { width: crop.w, height: crop.h },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto("file:///" + htmlPath.replace(/\\/g, "/"));
  await page.waitForTimeout(150);
  const outPath = path.join(outDir, crop.name);
  await page.screenshot({ path: outPath });
  console.log("  ✓", outPath);
  await context.close();
  fs.unlinkSync(htmlPath);
}

await browser.close();
console.log("done");
