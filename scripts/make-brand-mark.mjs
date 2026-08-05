#!/usr/bin/env node
// make-brand-mark.mjs — wrap a brand logo in the standard README "mark" card.
//
// README project logos come from wildly different sources: a 64x64 icon, a
// 1024x1024 illustration, a wide wordmark. Rendered at a fixed pixel height
// they look nothing like each other — one fills its row, the next is a speck.
// The mark card fixes that by giving every logo the SAME 100x100 canvas and
// fitting the artwork into an inset 66x66 box, so what varies is the artwork,
// not its apparent size.
//
// The card itself (white fill, 20px radius, 1.5px #e6e4df hairline) is not
// invented here — it matches the five marks that already existed
// (femtech-weekend, eatropolis, gavigo, she-sharp, tam-ai-ti), and those set
// the house style. Do not restyle one mark in isolation; change the constants
// below and regenerate all of them, or the band stops looking like a set.
//
// Usage:
//   node scripts/make-brand-mark.mjs <source.svg> [<out.svg>]
//   node scripts/make-brand-mark.mjs --all        # regenerate the manifest below
//
// The SOURCE files are left untouched on purpose: cv/extended.typ,
// og-covers/projects.mjs and public/brand-system.html render the unframed
// artwork and must keep doing so. Only projects[].logo points at the mark.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BRANDS = path.join(repoRoot, "public", "brands");

// Card geometry — shared by every mark. See the note above before editing.
const CANVAS = 100;
const INSET = 17; // artwork box is CANVAS - 2*INSET square, centred
const RADIUS = 20;
const CARD_FILL = "#ffffff";
const CARD_STROKE = "#e6e4df";
const CARD_STROKE_W = 1.5;

// source basename -> output basename (both inside public/brands/)
// `server-google-news-mark.svg` is NOT available as an output name: it already
// exists as an UNFRAMED asset that cv/sections/projects.typ renders. Hence the
// project-id name for that one.
const MANIFEST = [
  ["archlang-logo.svg", "archlang-mark.svg"],
  ["archcanvas-logo.svg", "archcanvas-mark.svg"],
  ["vitex.svg", "vitex-mark.svg"],
  ["free-period-logo.svg", "free-period-mark.svg"],
  ["echook-logo.svg", "echook-mark.svg"],
  ["server-google-news.svg", "google-news-mcp-mark.svg"],
  ["server-google-jobs.svg", "google-jobs-mcp-mark.svg"],
  ["ai-programming-logo.svg", "ai-programming-mark.svg"],
  ["a11y-loop-logo.svg", "a11y-loop-mark.svg"],
  ["gradient-svg-generator-logo.svg", "chromaflow-mark.svg"],
  ["github-readme-suno-cards-logo.svg", "github-readme-suno-cards-mark.svg"],
  ["seismophone-logo.svg", "seismophone-mark.svg"],
  ["tower-defense-logo.svg", "tower-defense-mark.svg"],
];

const ART = CANVAS - INSET * 2;

function parseRootTag(svg) {
  const m = svg.match(/<svg\b[^>]*>/i);
  if (!m) throw new Error("no <svg> root element");
  const tag = m[0];
  const attr = (name) => {
    const a = tag.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, "i"));
    return a ? a[1] : null;
  };
  let viewBox = attr("viewBox");
  if (!viewBox) {
    // No viewBox: synthesise one from width/height, else the nested <svg>
    // would inherit the parent's coordinate system and render at the wrong
    // scale instead of being fitted into the artwork box.
    const w = parseFloat(attr("width"));
    const h = parseFloat(attr("height"));
    if (!Number.isFinite(w) || !Number.isFinite(h)) {
      throw new Error("no viewBox and no numeric width/height — cannot fit artwork");
    }
    viewBox = `0 0 ${w} ${h}`;
  }
  return { tag, viewBox, body: svg.slice(m.index + tag.length).replace(/<\/svg>\s*$/i, "") };
}

function wrap(srcPath) {
  const svg = fs.readFileSync(srcPath, "utf8");
  const { tag, viewBox, body } = parseRootTag(svg);

  // Carry through presentation attributes that the artwork relies on, but drop
  // width/height/viewBox/x/y — the wrapper owns placement now.
  const carried = [...tag.matchAll(/\b([a-zA-Z-]+(?::[a-zA-Z-]+)?)\s*=\s*"([^"]*)"/g)]
    .filter(([, k]) => !/^(width|height|viewBox|x|y|preserveAspectRatio)$/i.test(k))
    .filter(([, k]) => k.toLowerCase() !== "xmlns")
    .map(([, k, v]) => `${k}="${v}"`)
    .join(" ");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}" width="${CANVAS}" height="${CANVAS}">\n` +
    `<rect x="1" y="1" width="${CANVAS - 2}" height="${CANVAS - 2}" rx="${RADIUS}" ` +
    `fill="${CARD_FILL}" stroke="${CARD_STROKE}" stroke-width="${CARD_STROKE_W}"/>\n` +
    `<svg x="${INSET}" y="${INSET}" width="${ART}" height="${ART}" ` +
    `preserveAspectRatio="xMidYMid meet" viewBox="${viewBox}"` +
    `${carried ? " " + carried : ""} xmlns="http://www.w3.org/2000/svg">` +
    `${body}</svg>\n</svg>\n`
  );
}

const argv = process.argv.slice(2);
const jobs =
  argv[0] === "--all"
    ? MANIFEST
    : [[path.basename(argv[0] ?? ""), path.basename(argv[1] ?? (argv[0] ?? "").replace(/\.svg$/, "-mark.svg"))]];

if (!jobs[0]?.[0]) {
  console.error("usage: make-brand-mark.mjs <source.svg> [out.svg]   |   --all");
  process.exit(2);
}

let n = 0;
for (const [src, out] of jobs) {
  const srcPath = path.join(BRANDS, src);
  const outPath = path.join(BRANDS, out);
  if (!fs.existsSync(srcPath)) {
    console.error(`  MISSING  ${src}`);
    process.exitCode = 1;
    continue;
  }
  fs.writeFileSync(outPath, wrap(srcPath));
  console.log(`  ${src}  →  ${out}`);
  n++;
}
console.log(`${n} mark(s) written to public/brands/`);
