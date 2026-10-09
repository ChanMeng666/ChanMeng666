// Build the animated project cards for the README (public/cards/*.svg).
//
// Each card is a self-contained SVG that GitHub can render as an <img>: outlined
// glyphs instead of fonts, CSS keyframes instead of script, nothing external.
// The stage of a card shows the product doing its job; see scripts/cards/.
//
//   node scripts/build-readme-cards.mjs [id ...]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadProfile } from "./lib/load-profile.mjs";
import { GlyphSet } from "./lib/svg-card/glyphs.mjs";
import { FONTS } from "./lib/svg-card/shell.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..").replace(/\\/g, "/");
const outDir = path.join(root, "public", "cards");

// project id → the module that draws it, the prefix of its `*_FONTS` and
// `*_INPUTS` exports, and its builder. A module is imported only when its card
// is built, so one card's file cannot break the build of another.
// `*_INPUTS` lists what the card reads from OUTSIDE this repo: a card whose
// outside inputs are missing is skipped, and its committed SVG is left as it is.
// The id must be a projects[].id in data/profile.
const CARDS = {
  archlang: { file: "archlang", prefix: "ARCHLANG", build: "buildArchlangCard" },
  archcanvas: { file: "archcanvas", prefix: "ARCHCANVAS", build: "buildArchcanvasCard" },
  "gavigo-ire": { file: "gavigo", prefix: "GAVIGO", build: "buildGavigoCard" },
  "she-sharp": { file: "shesharp", prefix: "SHESHARP", build: "buildShesharpCard" },
  "eatropolis-website": { file: "eatropolis", prefix: "EATROPOLIS", build: "buildEatropolisCard" },
  "femtech-weekend-website": { file: "femtech", prefix: "FEMTECH", build: "buildFemtechCard" },
  echook: { file: "echook", prefix: "ECHOOK", build: "buildEchookCard" },
  "google-news-mcp": { file: "google-news-mcp", prefix: "GOOGLE_NEWS", build: "buildGoogleNewsCard" },
  "ai-programming-teaching-project": { file: "ai-programming", prefix: "AI_PROGRAMMING", build: "buildAiProgrammingCard" },
  "a11y-loop": { file: "a11y-loop", prefix: "A11Y_LOOP", build: "buildA11yLoopCard" },
  "tam-ai-ti": { file: "tam-ai-ti", prefix: "TAM_AI_TI", build: "buildTamAiTiCard" },
  "corde-mobile-application": { file: "corde", prefix: "CORDE", build: "buildCordeCard" },
};

const profile = loadProfile();
const wanted = process.argv.slice(2);
const ids = wanted.length ? wanted : Object.keys(CARDS);

fs.mkdirSync(outDir, { recursive: true });
for (const id of ids) {
  const entry = CARDS[id];
  if (!entry) throw new Error(`build-readme-cards: no card builder for "${id}"`);
  const mod = await import(`./cards/${entry.file}.mjs`);
  const build = mod[entry.build];
  const fonts = mod[`${entry.prefix}_FONTS`] ?? FONTS;
  const inputs = Object.values(mod[`${entry.prefix}_INPUTS`] ?? {});
  // an input or font is either inside this repo or an absolute path outside it
  const at = (f) => (path.isAbsolute(f) ? f : path.join(root, f));
  const missing = inputs.filter((f) => !fs.existsSync(at(f)));
  if (missing.length) {
    console.log(`– public/cards/${id}.svg  kept as committed (not found: ${missing.join(", ")})`);
    continue;
  }
  const project = profile.projects.find((p) => p.id === id);
  if (!project) throw new Error(`build-readme-cards: "${id}" is not a projects[].id in data/profile`);

  const glyphs = new GlyphSet(Object.fromEntries(Object.entries(fonts).map(([k, f]) => [k, at(f)])));
  const { svg, facts } = build({ glyphs, root, project });
  const file = path.join(outDir, `${id}.svg`);
  fs.writeFileSync(file, svg);
  console.log(`✓ public/cards/${id}.svg  ${(svg.length / 1024).toFixed(1)} KB  ${JSON.stringify(facts)}`);
}
