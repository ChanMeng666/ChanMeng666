// Draw link pills for a product repository's README, in the same capsule the
// profile README uses (scripts/readme-art/pills.mjs). The files are written
// into that repository, so its README fetches nothing from outside.
//
//   node scripts/build-product-pills.mjs <outDir> "Docs:ink" "Playground:orange" ...
//
// A pill's label must be the exact text the README shows as its alt text.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { GlyphSet } from "./lib/svg-card/glyphs.mjs";
import { FONTS, slug } from "./readme-art/kit.mjs";
import { pill } from "./readme-art/pills.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..").replace(/\\/g, "/");
const [outDir, ...specs] = process.argv.slice(2);
if (!outDir || !specs.length) {
  console.error('usage: node scripts/build-product-pills.mjs <outDir> "Label:variant" ...');
  process.exit(3);
}

fs.mkdirSync(outDir, { recursive: true });
specs.forEach((spec, index) => {
  const cut = spec.lastIndexOf(":");
  const label = spec.slice(0, cut);
  const variant = spec.slice(cut + 1);
  const glyphs = new GlyphSet(Object.fromEntries(Object.entries(FONTS).map(([k, f]) => [k, path.join(root, f)])));
  const name = `pill-${slug(label)}.svg`;
  fs.writeFileSync(path.join(outDir, name), pill({ glyphs, label, variant, index }));
  console.log(`✓ ${name}`);
});
