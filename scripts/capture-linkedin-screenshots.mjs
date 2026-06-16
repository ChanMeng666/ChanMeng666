// Capture production screenshots of Chan's live projects for manual upload to
// the matching LinkedIn project sections. Public pages only — no auth, no gated
// dashboards. Saves one folder per project under linkedin/screenshots/<slug>/.
//
// Usage:
//   node scripts/capture-linkedin-screenshots.mjs            # all projects
//   node scripts/capture-linkedin-screenshots.mjs eatropolis sunostats   # subset
//
// Tooling: reuses the playwright-core that ships with the globally-installed
// @playwright/cli, pointed at the on-disk Chromium build (see export-linkedin-
// cards.mjs for the version-pin rationale).

import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "D:/npm-global/node_modules/@playwright/cli/node_modules/playwright-core",
);

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const outRoot = path.join(repoRoot, "linkedin", "screenshots");

const CHROME = path.join(
  process.env.LOCALAPPDATA || "",
  "ms-playwright/chromium-1223/chrome-win64/chrome.exe",
);

// Each target: homepage auto-section shots + a full-page reference, plus any
// extra named routes (verified per-load; skipped on HTTP >= 400).
const TARGETS = [
  {
    slug: "eatropolis",
    url: "https://eatropolis.co.nz/",
    name: "Eatropolis — Auckland Culinary Festival",
    routes: [],
  },
  {
    slug: "sunostats",
    url: "https://sunostats.chanmeng.org/",
    name: "SunoStats — Suno Music-Lineage Explorer",
    routes: ["/trending", "/explore"],
  },
  {
    slug: "vitex",
    url: "https://www.vitex.org.nz/",
    name: "Vitex — AI Career Agent",
    routes: ["/pricing"],
  },
  {
    slug: "fanfic-lab",
    url: "https://fanfic-lab.tech/",
    name: "FanFic Lab — LangGraph Co-Creation",
    routes: ["/feed", "/about"], // /create, /profile are login-gated
  },
  {
    slug: "she-sharp",
    url: "https://www.shesharp.org.nz/",
    name: "She Sharp — women in tech",
    routes: ["/events", "/about"],
    extraSites: [
      { url: "https://she-sharp-zeta.vercel.app/", prefix: "app-login" },
    ],
  },
  {
    slug: "femtech-weekend",
    url: "https://www.femtechweekend.com/",
    name: "FemTech Weekend Gen-2",
    routes: ["/shanghai-summit", "/insights", "/stories"],
  },
  {
    slug: "programming-chanmeng",
    url: "https://programming.chanmeng.org/",
    name: "programming.chanmeng.org teaching platform",
    routes: ["/docs/curriculum-outline/", "/capstone-showcase/", "/message-board/"],
  },
  {
    slug: "tam-ai-ti",
    url: "https://tamaiti.whiri-ai.com/",
    name: "Tam-AI-Ti — financial-wellness coach",
    routes: [],
  },
  {
    slug: "pa-tiaki",
    url: "https://towerdefense.chanmeng.org/",
    name: "Pa Tiaki — CSS 3D tower defense",
    // Actual gameplay is gated behind a login wall ("LOGIN REQUIRED"), so the
    // public-facing artifact is the branded main menu (captured on the home pass).
    routes: [],
  },
  {
    slug: "free-period",
    url: "https://free-period-website.pages.dev/",
    name: "FreePeriod — period-poverty platform",
    routes: ["/products", "/impact"],
  },
];

const VIEWPORT = { width: 1440, height: 900 };
const MAX_SECTIONS = 5; // homepage viewport shots, top → bottom
const STEP = 760; // scroll step (px) — slight overlap with 900px viewport

// Cookie / consent banners that overlay content. Best-effort dismiss.
const CONSENT_SELECTORS = [
  "button:has-text('Accept')",
  "button:has-text('Accept all')",
  "button:has-text('I agree')",
  "button:has-text('Got it')",
  "button:has-text('OK')",
  "[aria-label='Accept cookies']",
  "#onetrust-accept-btn-handler",
];

const pad = (n) => String(n).padStart(2, "0");

async function settle(page) {
  try {
    await page.evaluate(() => document.fonts && document.fonts.ready);
  } catch {}
  await page.waitForTimeout(1200); // let hero animations / lazy media settle
}

async function dismissConsent(page) {
  for (const sel of CONSENT_SELECTORS) {
    try {
      const el = await page.$(sel);
      if (el && (await el.isVisible())) {
        await el.click({ timeout: 1500 });
        await page.waitForTimeout(400);
        return;
      }
    } catch {}
  }
}

// Scroll the page top→bottom, capturing up to MAX_SECTIONS viewport shots.
async function captureSections(page, dir, prefix, log) {
  const pageHeight = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  const vh = VIEWPORT.height;
  let idx = 0;
  for (let y = 0; idx < MAX_SECTIONS; y += STEP) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(600); // scroll-triggered animations
    const file = `${pad(idx + 1)}-${prefix}.png`;
    await page.screenshot({ path: path.join(dir, file) });
    log.push(file);
    idx += 1;
    if (y + vh >= pageHeight - 40) break; // reached bottom
  }
  // Full-page reference shot.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const full = "99-fullpage.png";
  await page.screenshot({ path: path.join(dir, full), fullPage: true });
  log.push(full);
}

async function captureTarget(context, target) {
  const dir = path.join(outRoot, target.slug);
  fs.mkdirSync(dir, { recursive: true });
  const page = await context.newPage();
  const saved = [];
  const skipped = [];

  console.log(`\n▶ ${target.slug}  (${target.url})`);
  try {
    const resp = await page.goto(target.url, {
      waitUntil: "load",
      timeout: 45000,
    });
    if (resp && resp.status() >= 400) {
      console.log(`  ✗ homepage HTTP ${resp.status()} — skipping project`);
      await page.close();
      return { slug: target.slug, saved, skipped: [target.url] };
    }
    await dismissConsent(page);
    await settle(page);
    await captureSections(page, dir, "home", saved);

    // Project-specific interaction (e.g. driving into a game).
    if (target.interact) {
      try {
        await target.interact(page, dir, saved);
      } catch (e) {
        skipped.push(`interact (${e.message.split("\n")[0]})`);
      }
    }

    // Extra named routes (same origin).
    let routeIdx = 0;
    for (const route of target.routes || []) {
      routeIdx += 1;
      const rUrl = new URL(route, target.url).href;
      try {
        const r = await page.goto(rUrl, {
          waitUntil: "load",
          timeout: 30000,
        });
        if (r && r.status() >= 400) {
          skipped.push(`${route} (HTTP ${r.status()})`);
          continue;
        }
        await dismissConsent(page);
        await settle(page);
        const slug = route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
        const file = `${pad(routeIdx)}-route-${slug || "page"}.png`;
        await page.screenshot({ path: path.join(dir, file) });
        saved.push(file);
      } catch (e) {
        skipped.push(`${route} (${e.message.split("\n")[0]})`);
      }
    }

    // Extra standalone sites (e.g. the She Sharp member-app login page).
    for (const site of target.extraSites || []) {
      try {
        const r = await page.goto(site.url, {
          waitUntil: "load",
          timeout: 30000,
        });
        if (r && r.status() >= 400) {
          skipped.push(`${site.url} (HTTP ${r.status()})`);
          continue;
        }
        await dismissConsent(page);
        await settle(page);
        const file = `90-${site.prefix}.png`;
        await page.screenshot({ path: path.join(dir, file) });
        saved.push(file);
      } catch (e) {
        skipped.push(`${site.url} (${e.message.split("\n")[0]})`);
      }
    }
  } catch (e) {
    console.log(`  ✗ failed to load: ${e.message.split("\n")[0]}`);
    skipped.push(`${target.url} (load error)`);
  }
  await page.close();
  for (const f of saved) console.log(`  ✓ ${f}`);
  for (const s of skipped) console.log(`  – skipped ${s}`);
  return { slug: target.slug, saved, skipped };
}

const filter = process.argv.slice(2);
const targets = filter.length
  ? TARGETS.filter((t) => filter.includes(t.slug))
  : TARGETS;

const browser = await chromium.launch({ executablePath: CHROME });
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
  locale: "en-US", // bilingual sites: prefer the English default
  extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
});

const results = [];
for (const target of targets) {
  results.push(await captureTarget(context, target));
}

await context.close();
await browser.close();

console.log("\n──────── summary ────────");
for (const r of results) {
  console.log(
    `${r.slug.padEnd(22)} ${r.saved.length} shot(s)` +
      (r.skipped.length ? `, ${r.skipped.length} skipped` : ""),
  );
}
console.log(`\nSaved under linkedin/screenshots/`);
