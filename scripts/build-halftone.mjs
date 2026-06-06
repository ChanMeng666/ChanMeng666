#!/usr/bin/env node
// Halftone-panel generator — the Caldera signature decorative art.
//
// Emits risograph-style halftone-dot gradient SVGs into public/brand/:
//   ├─→ public/brand/halftone-hero.svg    wide hero panel (~16:9-ish)
//   └─→ public/brand/halftone-thumb.svg   16:9 card thumbnail
//
// Look: a smooth two-stop diagonal gradient (Digital Orange → Cyber Violet),
// DARKENED for the ground, with a regular grid of BRIGHT, full-color dots on
// top — bright printed dots on a dark ground, clipped to a 40px-rounded panel.
// Bleeds into the canvas with no border. Colors are pulled from the brand
// source (dist/brand/tokens.json) so the art stays token-driven.
//
// Run:  npm run build:halftone   (also invoked by the brand build)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ─── Resolve brand colors ────────────────────────────────────────────────────
// Prefer the generated tokens.json (canonical). Fall back to the known Caldera
// values so this script never hard-fails before the first brand build.
function brandColors() {
  const fallback = { orange: "#FC5000", violet: "#524AE9", canvas: "#E2E2DF" };
  try {
    const tokens = JSON.parse(fs.readFileSync(path.join(repoRoot, "dist", "brand", "tokens.json"), "utf8"));
    const raw = tokens.color?.raw ?? {};
    return {
      orange: raw.digitalOrange ?? fallback.orange,
      violet: raw.cyberViolet ?? fallback.violet,
      canvas: raw.basaltCanvas ?? fallback.canvas,
    };
  } catch {
    return fallback;
  }
}

// ─── Color math ──────────────────────────────────────────────────────────────
const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const rgbToHex = (rgb) =>
  "#" + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const lerp = (a, b, t) => a + (b - a) * t;
const lerpRgb = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const mixHex = (h1, h2, t) => rgbToHex(lerpRgb(hexToRgb(h1), hexToRgb(h2), t));

// ─── Halftone SVG builder ────────────────────────────────────────────────────
// width/height: viewBox dimensions. cell: grid pitch in px. radius: corner clip.
function halftoneSvg({ width, height, cell, radius, orange, violet }) {
  const BLACK = "#000000";
  // Slightly darkened gradient stops for the ground, so the bright full-color
  // dots read as printed highlights against it without muting the palette.
  const groundOrange = mixHex(orange, BLACK, 0.34);
  const groundViolet = mixHex(violet, BLACK, 0.34);

  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  // Diagonal axis: orange at bottom-left (t=0) → violet at top-right (t=1).
  const tAt = (nx, ny) => Math.max(0, Math.min(1, (nx + (1 - ny)) / 2));

  const dots = [];
  const oRgb = hexToRgb(orange);
  const vRgb = hexToRgb(violet);
  const baseR = (cell / 2) * 0.92; // near-touching dots → dense printed field
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * cell + cell / 2;
      const cy = r * cell + cell / 2;
      const nx = cx / width;
      const ny = cy / height;
      const t = tAt(nx, ny);
      const fill = rgbToHex(lerpRgb(oRgb, vRgb, t));
      // Gentle tonal modulation so it reads as a halftone, not a flat dot grid:
      // dots ease slightly smaller through the mid-blend, fuller at each pole.
      const dotR = (baseR * (0.82 + 0.18 * Math.abs(Math.cos(t * Math.PI)))).toFixed(2);
      dots.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${dotR}" fill="${fill}"/>`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Halftone gradient panel (Digital Orange to Cyber Violet)">
  <defs>
    <linearGradient id="ground" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="${groundOrange}"/>
      <stop offset="1" stop-color="${groundViolet}"/>
    </linearGradient>
    <clipPath id="rounded"><rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}"/></clipPath>
  </defs>
  <g clip-path="url(#rounded)">
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#ground)"/>
    <g>
${dots.map((d) => "      " + d).join("\n")}
    </g>
  </g>
</svg>
`;
}

// ─── Emit ────────────────────────────────────────────────────────────────────
const { orange, violet } = brandColors();
const outDir = path.join(repoRoot, "public", "brand");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const assets = [
  { name: "halftone-hero.svg", width: 1200, height: 620, cell: 17, radius: 40 },
  { name: "halftone-thumb.svg", width: 800, height: 450, cell: 14, radius: 40 },
];

for (const a of assets) {
  const svg = halftoneSvg({ ...a, orange, violet });
  fs.writeFileSync(path.join(outDir, a.name), svg);
  console.log(`✓ Wrote public/brand/${a.name} (${svg.length} bytes, ${a.width}×${a.height})`);
}

console.log(`\nHalftone build OK · ${orange} → ${violet}`);
