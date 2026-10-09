// Build the README's own artwork (public/readme/*.svg): the hero, the section
// strips, the footer and the link pills. They replace the banners and pills the
// README used to fetch from an outside service; these are files in this repo,
// drawn in the Caldera system and listed in data/brand.yaml › signatures.readmeArt.
//
// Same sandbox and method as the project cards (docs/animated-svg-cards.md):
// outlined glyphs, CSS keyframes, nothing external, the finished frame as the
// base state. Not part of `npm run build`; the SVGs are committed.
//
//   node scripts/build-readme-art.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import { loadProfile } from "./lib/load-profile.mjs";
import { GlyphSet } from "./lib/svg-card/glyphs.mjs";
import { cover, nameplate, strip } from "./readme-art/banners.mjs";
import { films } from "./readme-art/films.mjs";
import { C, FONTS, slug } from "./readme-art/kit.mjs";
import { pill } from "./readme-art/pills.mjs";
import { story } from "./readme-art/story.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..").replace(/\\/g, "/");
const art = yaml.load(fs.readFileSync(path.join(root, "data", "brand.yaml"), "utf8")).signatures.readmeArt;
const outDir = path.join(root, art.dir);

// A fresh glyph set per file: each SVG carries only the outlines it uses.
const glyphs = () => new GlyphSet(Object.fromEntries(Object.entries(FONTS).map(([k, f]) => [k, path.join(root, f)])));

const NAMEPLATES = {
  hero: { h: 300, size: 196, plate: C.ink, ink: C.ash, field: C.ash, dot: C.orange },
  footer: { h: 240, size: 124, plate: C.orange, ink: C.ink, field: C.ink, dot: C.ash },
};

// The logo's artwork, recoloured for the ink plate: the cover's signature.
function mark() {
  const src = fs.readFileSync(path.join(root, art.cover.mark.replace(/^\//, "")), "utf8");
  const [, w, h] = src.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const inner = src.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<!--[\s\S]*?-->/g, "").replace(/>\s+</g, "><").trim();
  return { w: Number(w), h: Number(h), svg: inner.replace(/#fff(?:fff)?\b/gi, C.ash) };
}

const files = [];
for (const [id, b] of Object.entries(art.banners)) {
  const svg = b.art === "cover"
    ? cover({ glyphs: glyphs(), lines: b.text.split(" / "), signature: art.cover.signature, mark: mark(), title: b.text.replace(" / ", " ") })
    : NAMEPLATES[b.art]
    ? nameplate({ glyphs: glyphs(), text: b.text, title: b.text, ...NAMEPLATES[b.art] })
    : strip({ glyphs: glyphs(), text: b.text, motif: b.art });
  files.push([`${id}.svg`, svg]);
}
if (art.films) {
  // One tile per film: each product's primary film, the brand and event films
  // and the music videos (on the wall since 2026-10-10, Chan's call). Earlier
  // and alternative versions and demos are left out. Kinds are dealt out in
  // turn, so neighbouring tiles are not all one kind.
  const all = loadProfile().films ?? [];
  const product = all.filter((f) => f.kind === "product-film" && f.primary);
  const brand = all.filter((f) => f.kind === "brand-film" || f.kind === "event-promo");
  const music = all.filter((f) => f.kind === "music-video");
  const list = [];
  for (let i = 0; i < Math.max(product.length, brand.length, music.length); i++) for (const kind of [product, music, brand]) if (kind[i]) list.push(kind[i]);
  const clock = (s) => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, "0")}`;
  const counts = [[list.length, "films"], [product.length, "products"], [music.length, "music videos"]];
  const title = `${art.films.headline.replace(" / ", " ")} ${list.length} films: ${product.length} product films, ${brand.length} brand and event films and ${music.length} music videos. Watch them at ${art.films.link}.`;
  files.push(["films.svg", films({ glyphs: glyphs(), root, ...art.films, counts, list: list.map((f) => ({ id: f.id, duration: clock(f.seconds) })), title })]);
}
if (art.story) {
  // the image's alt text: the whole story, as sentences
  const title = art.story.chapters.map((c) => `${c.headline} ${c.line}`).join(" ");
  files.push(["story.svg", story({ glyphs: glyphs(), root, eyebrow: art.story.eyebrow, chapters: art.story.chapters, title })]);
}
Object.entries(art.pills).forEach(([label, variant], index) => {
  files.push([`pill-${slug(label)}.svg`, pill({ glyphs: glyphs(), label, variant, index })]);
});

fs.mkdirSync(outDir, { recursive: true });
for (const [name, svg] of files) {
  fs.writeFileSync(path.join(outDir, name), svg);
  console.log(`✓ /${art.dir}/${name}  ${(svg.length / 1024).toFixed(1)} KB`);
}
// A file no entry asks for any more is stale: remove it, so the folder is the list.
for (const f of fs.readdirSync(outDir)) {
  if (f.endsWith(".svg") && !files.some(([name]) => name === f)) {
    fs.unlinkSync(path.join(outDir, f));
    console.log(`– /${art.dir}/${f}  removed (not in brand.yaml)`);
  }
}
