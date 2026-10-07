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
import { A11Y_LOOP_FONTS, A11Y_LOOP_INPUTS, buildA11yLoopCard } from "./cards/a11y-loop.mjs";
import { AI_PROGRAMMING_FONTS, AI_PROGRAMMING_INPUTS, buildAiProgrammingCard } from "./cards/ai-programming.mjs";
import { ARCHCANVAS_FONTS, ARCHCANVAS_INPUTS, buildArchcanvasCard } from "./cards/archcanvas.mjs";
import { ARCHLANG_FONTS, buildArchlangCard } from "./cards/archlang.mjs";
import { CORDE_FONTS, CORDE_INPUTS, buildCordeCard } from "./cards/corde.mjs";
import { EATROPOLIS_FONTS, EATROPOLIS_INPUTS, buildEatropolisCard } from "./cards/eatropolis.mjs";
import { ECHOOK_FONTS, ECHOOK_INPUTS, buildEchookCard } from "./cards/echook.mjs";
import { FEMTECH_FONTS, FEMTECH_INPUTS, buildFemtechCard } from "./cards/femtech.mjs";
import { GAVIGO_FONTS, GAVIGO_INPUTS, buildGavigoCard } from "./cards/gavigo.mjs";
import { GOOGLE_NEWS_FONTS, GOOGLE_NEWS_INPUTS, buildGoogleNewsCard } from "./cards/google-news-mcp.mjs";
import { SHESHARP_FONTS, SHESHARP_INPUTS, buildShesharpCard } from "./cards/shesharp.mjs";
import { TAM_AI_TI_FONTS, TAM_AI_TI_INPUTS, buildTamAiTiCard } from "./cards/tam-ai-ti.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..").replace(/\\/g, "/");
const outDir = path.join(root, "public", "cards");

// project id → builder, the fonts it outlines (default: the Caldera frame's) and
// any inputs it reads from OUTSIDE this repo. A card whose outside inputs are
// missing is skipped, and its committed SVG is left as it is.
// The id must be a projects[].id in data/profile.
const CARDS = {
  archlang: { build: buildArchlangCard, fonts: ARCHLANG_FONTS },
  archcanvas: { build: buildArchcanvasCard, fonts: ARCHCANVAS_FONTS, inputs: Object.values(ARCHCANVAS_INPUTS) },
  "gavigo-ire": { build: buildGavigoCard, fonts: GAVIGO_FONTS, inputs: Object.values(GAVIGO_INPUTS) },
  "she-sharp": { build: buildShesharpCard, fonts: SHESHARP_FONTS, inputs: Object.values(SHESHARP_INPUTS) },
  "eatropolis-website": { build: buildEatropolisCard, fonts: EATROPOLIS_FONTS, inputs: Object.values(EATROPOLIS_INPUTS) },
  "femtech-weekend-website": { build: buildFemtechCard, fonts: FEMTECH_FONTS, inputs: Object.values(FEMTECH_INPUTS) },
  echook: { build: buildEchookCard, fonts: ECHOOK_FONTS, inputs: Object.values(ECHOOK_INPUTS) },
  "google-news-mcp": { build: buildGoogleNewsCard, fonts: GOOGLE_NEWS_FONTS, inputs: Object.values(GOOGLE_NEWS_INPUTS) },
  "ai-programming-teaching-project": { build: buildAiProgrammingCard, fonts: AI_PROGRAMMING_FONTS, inputs: Object.values(AI_PROGRAMMING_INPUTS) },
  "a11y-loop": { build: buildA11yLoopCard, fonts: A11Y_LOOP_FONTS, inputs: Object.values(A11Y_LOOP_INPUTS) },
  "tam-ai-ti": { build: buildTamAiTiCard, fonts: TAM_AI_TI_FONTS, inputs: Object.values(TAM_AI_TI_INPUTS) },
  "corde-mobile-application": { build: buildCordeCard, fonts: CORDE_FONTS, inputs: Object.values(CORDE_INPUTS) },
};

const profile = loadProfile();
const wanted = process.argv.slice(2);
const ids = wanted.length ? wanted : Object.keys(CARDS);

fs.mkdirSync(outDir, { recursive: true });
for (const id of ids) {
  const { build, fonts = FONTS, inputs = [] } = CARDS[id] || {};
  if (!build) throw new Error(`build-readme-cards: no card builder for "${id}"`);
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
