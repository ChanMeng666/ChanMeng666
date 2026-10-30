// Build the feature strip the echook README shows. It writes into the product's
// checkout, beside the card it complements; see scripts/cards/echook-strip.mjs.
//
//   node scripts/build-echook-strip.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ECHOOK_FONTS, ECHOOK_INPUTS } from "./cards/echook.mjs";
import { buildEchookStrip } from "./cards/echook-strip.mjs";
import { GlyphSet } from "./lib/svg-card/glyphs.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..").replace(/\\/g, "/");
const out = path.join(root, "..", "claude-code-audio-hooks", ".github", "readme", "feature-viewed-agent.svg");

const missing = Object.values(ECHOOK_INPUTS).filter((f) => !fs.existsSync(path.join(root, f)));
if (missing.length) throw new Error(`build-echook-strip: not found: ${missing.join(", ")}`);

const glyphs = new GlyphSet(Object.fromEntries(Object.entries(ECHOOK_FONTS).map(([k, f]) => [k, path.join(root, f)])));
const { svg } = buildEchookStrip({ glyphs, root });
fs.writeFileSync(out, svg);
console.log(`✓ ${out}  ${(svg.length / 1024).toFixed(1)} KB`);
