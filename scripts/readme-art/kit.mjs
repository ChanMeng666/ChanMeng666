// Shared pieces of the README's own artwork (public/readme/*.svg): the Caldera
// palette, the file wrapper, and the ordered-dither field that is this brand's
// motif. Everything here obeys the <img> sandbox described in
// docs/animated-svg-cards.md: outlined glyphs, CSS keyframes, nothing external.

// data/brand.yaml › color.raw
export const C = {
  ink: "#070607",
  ash: "#F7F6F2",
  basalt: "#E2E2DF",
  soft: "#D5D4CF",
  orange: "#FC5000",
  violet: "#524AE9",
  glare: "#F5F28E",
  white: "#FFFFFF",
};

export const FONTS = {
  display: "cv/fonts/Anton-Regular.ttf",
  sansBold: "cv/fonts/DMSans-Bold.ttf",
  mono: "cv/fonts/JetBrainsMono-Regular.ttf",
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
export const n = (v, d = 2) => Number(v.toFixed(d)).toString();
export const pct = (t, total) => `${n(Math.max(0, Math.min(100, (t / total) * 100)), 3)}%`;
export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Deterministic randomness: the same build always writes the same bytes.
export function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One file. Base states are authored as the FINISHED frame, so switching the
// animations off (reduced motion) leaves a complete picture. `edge` is the
// hairline that keeps a plate visible on the canvas closest to its own colour.
export function sheet({ w, h, title, css = "", defs = "", body, radius, edge = "rgba(128,128,128,.35)" }) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t">` +
    `<title id="t">${esc(title)}</title>` +
    `<style>${css}@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style>` +
    `<defs>${defs}<clipPath id="p"><rect width="${w}" height="${h}" rx="${radius}"/></clipPath></defs>` +
    `<g clip-path="url(#p)">${body}</g>` +
    `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${radius - 0.5}" fill="none" stroke="${edge}"/>` +
    "</svg>\n"
  );
}

// The furniture every plate shares, so the set reads as one printed series: a
// faint ruled grid under the artwork, and a crop mark in each corner.
// `ink` is the colour of the type on that plate; `grid: 0` leaves the grid out.
export function furniture({ w, h, ink, grid = 20, inset = 16, arm = 9 }) {
  const lines = [];
  for (let x = grid; grid && x < w; x += grid) lines.push(`M${x} 0v${h}`);
  for (let y = grid; grid && y < h; y += grid) lines.push(`M0 ${y}h${w}`);
  const r = w - inset;
  const b = h - inset;
  const marks =
    `M${inset} ${inset + arm}v-${arm}h${arm}M${r - arm} ${inset}h${arm}v${arm}` +
    `M${r} ${b - arm}v${arm}h-${arm}M${inset + arm} ${b}h-${arm}v-${arm}`;
  return (
    (grid ? `<path d="${lines.join("")}" fill="none" stroke="${ink}" stroke-opacity=".055"/>` : "") +
    `<path d="${marks}" fill="none" stroke="${ink}" stroke-opacity=".5" stroke-width="1.5"/>`
  );
}

// 8×8 Bayer matrix: the threshold map of an ordered dither.
const BAYER = (() => {
  let m = [[0]];
  for (let s = 1; s < 8; s *= 2) {
    const next = Array.from({ length: s * 2 }, () => Array(s * 2).fill(0));
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const v = m[y][x] * 4;
        next[y][x] = v;
        next[y][x + s] = v + 2;
        next[y + s][x] = v + 3;
        next[y + s][x + s] = v + 1;
      }
    }
    m = next;
  }
  return m;
})();

// A field of square pixels, dithered from `value(col, row)` (0…1), whose tone
// rises and falls by `swing` over `loop` seconds. A pixel is lit while the tone
// at its cell exceeds its Bayer threshold, so the tide moves through the field
// the way a dithered gradient brightens: pixel by pixel, with hard cuts.
// Pixels that never change are one path; the rest are grouped into `bands` by
// how far the tide must rise to light them. The still frame is mid-tide.
// `mode` changes what the bands do with the loop: "tide" rises and falls,
// "drain" starts full and loses its bands one by one, "fill" starts at its
// sparsest and gains them. Both hold at each end and reset together.
export function ditherField({ x, y, cols, rows, cell, px, value, fill, loop, swing = 0.2, bands = 8, name = "f", mode = "tide" }) {
  const off = (cell - px) / 2;
  const fixed = [];
  const banded = Array.from({ length: bands }, () => []);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const margin = value(c, r) - (BAYER[r % 8][c % 8] + 0.5) / 64;
      if (margin <= -swing) continue;
      const d = `M${n(x + c * cell + off, 1)} ${n(y + r * cell + off, 1)}h${px}v${px}h-${px}z`;
      if (margin >= swing) fixed.push(d);
      else banded[Math.min(bands - 1, Math.floor(((margin + swing) / (2 * swing)) * bands))].push(d);
    }
  }
  const css = [];
  const out = [`<path fill="${fill}" d="${fixed.join("")}"/>`];
  banded.forEach((cells, k) => {
    if (!cells.length) return;
    // band centre, as the tide level (−swing…swing) at which it lights
    const u = (k + 0.5) / bands;
    const level = swing - u * 2 * swing;
    // band 0 needs the highest tide: the last to light, the first to go
    const a = pct(mode === "tide" ? (1 - u) * (loop / 2) : mode === "fill" ? loop * (0.12 + (1 - u) * 0.66) : 0, loop);
    const b = pct(mode === "tide" ? loop - (1 - u) * (loop / 2) : mode === "drain" ? loop * (0.12 + u * 0.66) : loop, loop);
    css.push(`@keyframes ${name}${k}{0%,${a}{opacity:0}${a},${b}{opacity:1}${b},100%{opacity:0}}.${name}${k}{animation:${name}${k} ${loop}s step-end infinite}`);
    out.push(`<path class="${name}${k}" fill="${fill}"${level > 0 ? ' opacity="0"' : ""} d="${cells.join("")}"/>`);
  });
  return { svg: out.join(""), css: css.join("") };
}
