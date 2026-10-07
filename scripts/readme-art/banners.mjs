// The README's banners, drawn in the Caldera system: flat colour blocks, Anton
// display type, one orange accent, and the dither field as the moving part.
//
//   nameplate  the hero and the footer: a line of display type, a dither field
//              whose tone rises and falls, and one pixel that leaves the field
//              and comes to rest as the full stop
//   strip      a section header: a title and a small motif for what follows
import { C, ditherField, n, pct, prng, sheet } from "./kit.mjs";

const W = 1300;
const MARGIN = 56;

export function nameplate({ glyphs, text, title, h, size, plate, ink, field, dot, loop = 12 }) {
  const baseline = Math.round(h / 2 + size * 0.36);
  const tw = glyphs.measure(text, { font: "display", size });
  const dotSize = Math.round(size * 0.14);
  const dotX = Math.round(MARGIN + tw + size * 0.05);

  // The field starts where the line of type ends and thickens to the right.
  const cell = 10;
  const px = 7;
  const fx = Math.ceil((dotX + dotSize + 20) / cell) * cell;
  const cols = Math.ceil((W - fx) / cell);
  const rows = Math.ceil(h / cell);
  const f = ditherField({
    x: fx, y: 0, cols, rows, cell, px, fill: field, loop,
    value: (c, r) => Math.min(0.94, Math.max(0, ((c + 1) / cols) ** 1.25 * 1.05 - Math.abs(r - rows / 2) / rows * 0.18)),
  });

  // The pixel: lit in the field, walks left along its row, drops and grows into
  // the full stop, rests there for the remainder of the loop.
  const col = cols - 9;
  const row = Math.round(rows * 0.3);
  const off = (cell - px) / 2;
  const dx = fx + col * cell + off - dotX;
  const dy = row * cell + off + px - baseline;
  const k = px / dotSize;
  const steps = Math.round(dx / cell);
  const at = (t) => pct(t, loop);
  const css =
    `@keyframes dot{0%{transform:translate(${n(dx)}px,${n(dy)}px) scale(${n(k, 3)});opacity:0}` +
    `${at(0.4)}{transform:translate(${n(dx)}px,${n(dy)}px) scale(${n(k, 3)});opacity:1}` +
    `${at(1.4)}{transform:translate(${n(dx)}px,${n(dy)}px) scale(${n(k, 3)});opacity:1;animation-timing-function:steps(${steps},end)}` +
    `${at(4.6)}{transform:translate(0,${n(dy)}px) scale(${n(k, 3)});animation-timing-function:steps(6,end)}` +
    `${at(5.3)},${at(loop - 0.5)}{transform:none;opacity:1}${at(loop - 0.3)},100%{transform:none;opacity:0}}` +
    ".dot{transform-box:fill-box;transform-origin:0 100%;animation:dot " + loop + "s step-end infinite}";

  const body =
    `<rect width="${W}" height="${h}" fill="${plate}"/>` +
    f.svg +
    glyphs.text(text, { font: "display", size, x: MARGIN, y: baseline, fill: ink }) +
    `<rect class="dot" x="${dotX}" y="${baseline - dotSize}" width="${dotSize}" height="${dotSize}" fill="${dot}"/>`;
  return sheet({ w: W, h, title, css: f.css + css, defs: glyphs.defs(), body, radius: 20 });
}

// ── Section strips ──────────────────────────────────────────────────────────
const STRIP_H = 110;

// A level meter: columns of blocks, each uncovered to a height that changes in
// steps. The covers are the colour of the plate and shrink from the top of
// their column, so they never leave the plate; the blocks never move.
function meter({ right, name }) {
  const colsN = 34;
  const block = 9;
  const pitch = 13;
  const levels = 6;
  const top = (STRIP_H - levels * pitch + (pitch - block)) / 2;
  const stepsN = 8;
  const loop = 3.2;
  const rand = prng(20261007);
  const css = [];
  const out = [];
  let blocks = "";
  for (let i = 0; i < colsN; i++) {
    const x = right - (colsN - i) * pitch;
    for (let l = 0; l < levels; l++) blocks += `M${x} ${n(top + l * pitch, 1)}h${block}v${block}h-${block}z`;
    const seq = Array.from({ length: stepsN }, (_, s) =>
      Math.max(1, Math.min(levels, Math.round(3.4 + 2.2 * Math.sin(i * 0.55 + s * 0.9) + (rand() - 0.5) * 2.4))));
    const cover = (lv) => `transform:scaleY(${n((levels - lv) / levels, 4)})`;
    const frames = seq.map((lv, s) => `${pct(s, stepsN)}{${cover(lv)}}`).join("");
    css.push(`@keyframes ${name}${i}{${frames}}.${name}${i}{${cover(seq[0])};animation:${name}${i} ${loop}s step-end infinite}`);
    out.push(`<rect class="${name}${i}" x="${x - 2}" y="${n(top - 2, 1)}" width="${pitch}" height="${levels * pitch}" fill="${C.ash}"/>`);
  }
  css.push(`[class^="${name}"]{transform-box:fill-box;transform-origin:50% 0}`);
  return { svg: `<path fill="${C.violet}" d="${blocks}"/>` + out.join(""), css: css.join("") };
}

// A grid of pixels with arrivals lighting up across it, one after another.
function arrivals({ right, name }) {
  const colsN = 38;
  const rowsN = 5;
  const px = 8;
  const pitch = 14;
  const top = (STRIP_H - rowsN * pitch + (pitch - px)) / 2;
  const left = right - colsN * pitch;
  const loop = 10;
  const rand = prng(8641);
  let grid = "";
  for (let r = 0; r < rowsN; r++) for (let c = 0; c < colsN; c++) grid += `M${left + c * pitch} ${n(top + r * pitch, 1)}h${px}v${px}h-${px}z`;
  const count = 12;
  const taken = new Set();
  const pings = [];
  while (pings.length < count) {
    const c = Math.floor(rand() * colsN);
    const r = Math.floor(rand() * rowsN);
    if (taken.has(`${c},${r}`)) continue;
    taken.add(`${c},${r}`);
    const i = pings.length;
    // every third arrival is part of the still frame
    pings.push(`<rect class="${name}" style="animation-delay:${n((i * loop) / count - loop)}s" x="${left + c * pitch}" y="${n(top + r * pitch, 1)}" width="${px}" height="${px}" fill="${C.orange}"${i % 3 ? ' opacity="0"' : ""}/>`);
  }
  const css =
    `@keyframes ${name}{0%{opacity:0;transform:scale(1)}1%{opacity:1;transform:scale(2.4)}7%{opacity:1;transform:scale(1)}42%{opacity:1}50%,100%{opacity:0}}` +
    `.${name}{transform-box:fill-box;transform-origin:center;animation:${name} ${loop}s cubic-bezier(.2,.7,.2,1) infinite}`;
  return { svg: `<path fill="${C.soft}" d="${grid}"/>` + pings.join(""), css };
}

const MOTIFS = { meter, arrivals };

export function strip({ glyphs, text, motif }) {
  const make = MOTIFS[motif];
  if (!make) throw new Error(`readme-art: unknown strip motif "${motif}"`);
  const m = make({ right: W - MARGIN, name: "m" });
  const size = 46;
  const baseline = Math.round(STRIP_H / 2 + size * 0.36);
  const mark = 14;
  const body =
    `<rect width="${W}" height="${STRIP_H}" fill="${C.ash}"/>` +
    m.svg +
    `<rect x="${MARGIN}" y="${(STRIP_H - mark) / 2}" width="${mark}" height="${mark}" fill="${C.orange}"/>` +
    glyphs.text(text, { font: "display", size, x: MARGIN + mark + 18, y: baseline, fill: C.ink });
  return sheet({ w: W, h: STRIP_H, title: text, css: m.css, defs: glyphs.defs(), body, radius: 20 });
}
