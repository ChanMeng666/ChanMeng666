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
import { ARCHCANVAS_FONTS, ARCHCANVAS_INPUTS, buildArchcanvasCard } from "./cards/archcanvas.mjs";
import { ARCHLANG_FONTS, buildArchlangCard } from "./cards/archlang.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..").replace(/\\/g, "/");
const outDir = path.join(root, "public", "cards");

// project id → builder, the fonts it outlines (default: the Caldera frame's) and
// any inputs it reads from OUTSIDE this repo. A card whose outside inputs are
// missing is skipped, and its committed SVG is left as it is.
// The id must be a projects[].id in data/profile.
const CARDS = {
  archlang: { build: buildArchlangCard, fonts: ARCHLANG_FONTS },
  archcanvas: { build: buildArchcanvasCard, fonts: ARCHCANVAS_FONTS, inputs: Object.values(ARCHCANVAS_INPUTS) },
};

const profile = loadProfile();
const wanted = process.argv.slice(2);
const ids = wanted.length ? wanted : Object.keys(CARDS);

fs.mkdirSync(outDir, { recursive: true });
for (const id of ids) {
  const { build, fonts = FONTS, inputs = [] } = CARDS[id] || {};
  if (!build) throw new Error(`build-readme-cards: no card builder for "${id}"`);
  const missing = inputs.filter((f) => !fs.existsSync(path.join(root, f)));
  if (missing.length) {
    console.log(`– public/cards/${id}.svg  kept as committed (not found: ${missing.join(", ")})`);
    continue;
  }
  const project = profile.projects.find((p) => p.id === id);
  if (!project) throw new Error(`build-readme-cards: "${id}" is not a projects[].id in data/profile`);

  const glyphs = new GlyphSet(Object.fromEntries(Object.entries(fonts).map(([k, f]) => [k, path.join(root, f)])));
  const { svg, facts } = build({ glyphs, root, project });
  const file = path.join(outDir, `${id}.svg`);
  fs.writeFileSync(file, svg);
  console.log(`✓ public/cards/${id}.svg  ${(svg.length / 1024).toFixed(1)} KB  ${JSON.stringify(facts)}`);
}
