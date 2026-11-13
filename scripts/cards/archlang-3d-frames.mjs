// The ArchLang card's 3D frames, rendered by @chanmeng666/archlang-3d's own replay
// viewer (three.js in headless Chromium on SwiftShader, as the package renders its
// own posters and films), never redrawn here. Run by hand when the gallery plan or
// the package changes; the card reads the frames from assets/ and refuses frames
// rendered from another source.
//
//   node scripts/cards/archlang-3d-frames.mjs [--chrome=<chrome.exe>]
//
// Two passes on one page, both on the light theme the playground uses:
//   rise   the replay itself, __seek(t): the plan drawn top-down, the camera tilting
//          to its end view while the walls and then the furniture rise
//   turn   from that end view, one press of the viewer's own zoom out (its "-" key),
//          then its own turn (the arrow key, 5° a press), a frame every 10°, one full
//          circle back home
//
// Frames are written as WebP (ffmpeg): at this size a third of the JPEG's weight.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const arch = path.resolve(root, "../archlang");
export const FRAMES_DIR = path.join(root, "scripts/cards/assets/archlang-3d");
export const PLAN = path.join(arch, "docs/gallery/studio.arch");

// The sheet's drawing area on the card is 500 × 328; frames are drawn at 1×, which
// the card's size budget allows for a 5° turn.
export const VIEW = { w: 500, h: 328, scale: 1 };
// Replay times for the rise (timeline.ts PHASE): the issued sheet is gone by 0.62,
// the tilt ends at 0.78, the walls are up by 0.84 and everything by 0.96.
const RISE = [0.63, 0.66, 0.7, 0.74, 0.78, 0.82, 0.86, 0.9, 0.94, 0.97, 1];
const arg = (name, fallback) => Number(process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? fallback);
const TURN_DEG = arg("deg", 5); // degrees between turn frames, a multiple of KEY_DEG
const KEY_DEG = 5; // mount.ts KEY_TURN_DEG
// libwebp quality, low as the GAVIGO card's footage is: 72 turn frames fit the card's
// size budget only so, and the rise's frames dissolve into each other in a few seconds
const QUALITY = { turn: arg("quality", 40), rise: arg("rise-quality", 30) };
const KEEP = process.argv.includes("--keep-png");

export const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

async function main() {
  const chromeArg = process.argv.find((a) => a.startsWith("--chrome="))?.slice(9) ?? process.env.CHROME_PATH;
  const { compile } = await import(pathToFileURL(path.join(arch, "dist/index.js")).href);
  const { adaptPlan, buildMesh } = await import(pathToFileURL(path.join(arch, "packages/archlang-3d/dist/index.js")).href);
  const { replayHtml } = await import(pathToFileURL(path.join(arch, "packages/archlang-3d/dist/node.js")).href);
  const core = JSON.parse(readFileSync(path.join(arch, "package.json"), "utf8")).version;
  const pkg = JSON.parse(readFileSync(path.join(arch, "packages/archlang-3d/package.json"), "utf8")).version;

  const source = readFileSync(PLAN, "utf8");
  const drawn = compile(source);
  if (drawn.errors.length) throw new Error(`studio.arch does not compile: ${JSON.stringify(drawn.errors[0])}`);
  const adapted = adaptPlan(source, { coreVersion: core });
  if (!adapted.ok) throw new Error(`archlang-3d refused studio.arch: ${adapted.refusal.message}`);
  const W = Math.round(VIEW.w * VIEW.scale);
  const H = Math.round(VIEW.h * VIEW.scale);
  let html = await replayHtml(buildMesh(adapted.scene), { title: "studio", svg: drawn.svg, width: W, height: H, theme: "light" });
  // The package's own offline settings (video.ts seekOnly + withSupersample): no autoplay,
  // each pixel the mean of 3 × 3 renders, as its posters are made.
  const OPEN = '<script type="application/json" id="archlang-replay-payload">';
  const at = html.indexOf(OPEN);
  const end = html.indexOf("</script>", at);
  const payload = { ...JSON.parse(html.slice(at + OPEN.length, end)), supersample: 3 };
  html = `${html.slice(0, at)}<style>html,body{overflow:hidden}</style><script>window.__replayAutoplay=false</script>\n${OPEN}${JSON.stringify(payload).replace(/</g, "\\u003c")}${html.slice(end)}`;

  const dir = path.join(tmpdir(), "archlang-card-3d");
  mkdirSync(dir, { recursive: true });
  const page0 = path.join(dir, "replay.html");
  writeFileSync(page0, html);

  const browser = await chromium.launch({
    ...(chromeArg ? { executablePath: chromeArg } : {}),
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
  });
  rmSync(FRAMES_DIR, { recursive: true, force: true });
  mkdirSync(FRAMES_DIR, { recursive: true });
  const frames = [];
  try {
    const page = await browser.newPage({ viewport: { width: W + 40, height: H + 200 }, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(page0).href);
    await page.evaluate(() => window.__ready);
    const canvas = page.locator("#archlang-replay");
    const shot = async (name, meta) => {
      const png = path.join(dir, `${name}.png`);
      const file = `${name}.webp`;
      await canvas.screenshot({ path: png });
      // Where the building is on the frame, and the paper beyond the viewer's ground plane:
      // the turn's pivot is not the building's centre, so the card steadies each frame by
      // this box. Only the building's outlines and shaded faces are far enough from the
      // paper to count; the ground plane is not.
      meta.box = await page.evaluate(() => {
        const c = document.getElementById("archlang-replay");
        const { data, width, height } = c.getContext("2d").getImageData(0, 0, c.width, c.height);
        const bg = [data[0], data[1], data[2]];
        let x0 = width, y0 = height, x1 = -1, y1 = -1;
        for (let y = 0; y < height; y++)
          for (let x = 0; x < width; x++) {
            const o = (y * width + x) * 4;
            if (Math.abs(data[o] - bg[0]) + Math.abs(data[o + 1] - bg[1]) + Math.abs(data[o + 2] - bg[2]) < 90) continue;
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, ground: `#${bg.map((v) => v.toString(16).padStart(2, "0")).join("")}` };
      });
      execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", png, "-c:v", "libwebp", "-quality", String(QUALITY[meta.pass]), "-compression_level", "6", path.join(FRAMES_DIR, file)]);
      if (!KEEP) unlinkSync(png);
      frames.push({ file, ...meta });
    };
    for (const [i, t] of RISE.entries()) {
      await page.evaluate((x) => window.__seek(x), t);
      await shot(`rise-${String(i).padStart(2, "0")}`, { pass: "rise", t });
    }
    // The turn starts from the end view (t = 1, drawn last above); the orbit's damping
    // eases each press out over a few animation frames, so each shot waits for it.
    const settle = () => page.waitForTimeout(1600);
    await canvas.focus();
    await page.keyboard.press("-");
    await settle();
    await shot("turn-00", { pass: "turn", degrees: 0 });
    for (let i = 1; i <= 360 / TURN_DEG; i++) {
      for (let k = 0; k < TURN_DEG / KEY_DEG; k++) await page.keyboard.press("ArrowLeft");
      await settle();
      await shot(`turn-${String(i).padStart(2, "0")}`, { pass: "turn", degrees: i * TURN_DEG });
    }
  } finally {
    await browser.close();
  }
  const manifest = { plan: "docs/gallery/studio.arch", planSha: sha(source), core, archlang3d: pkg, size: [W, H], frames };
  writeFileSync(path.join(FRAMES_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  const kb = readdirSync(FRAMES_DIR).filter((f) => f.endsWith(".webp")).reduce((a, f) => a + readFileSync(path.join(FRAMES_DIR, f)).length, 0) / 1024;
  console.log(`archlang-3d frames: ${frames.length} at ${W}×${H}, ${kb.toFixed(0)} KB (core ${core}, archlang-3d ${pkg})`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
