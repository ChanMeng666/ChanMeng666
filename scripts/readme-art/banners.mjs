// The README's banners, drawn in the Caldera system: flat colour blocks, Anton
// display type, one orange accent, and the dither field as the moving part.
// Every plate carries the same furniture (kit.mjs › furniture), so the set
// reads as one series.
//
//   nameplate  the hero and the footer: a line of display type, a dither field
//              whose tone rises and falls, and one pixel that leaves the field
//              and comes to rest as the full stop
//   cover      the closing plate: the motto on two lines, a field that empties
//              beside the first and one that fills beside the second, the same
//              pixel as the full stop, and the mark as a signature
//   strip      a section header: a title and a small motif for what follows
import { C, ditherField, furniture, n, pct, prng, sheet } from "./kit.mjs";

const W = 1300;
const MARGIN = 56;
const CELL = 10;
const PX = 7;

// One pixel of a field at (fromX, fromY): it lights, walks left along its row to
// the end of the line of type, then drops and grows into the full stop, where
// it rests for the remainder of the loop.
function fullStop({ fromX, fromY, dotX, baseline, dotSize, fill, loop }) {
  const dx = fromX - dotX;
  const dy = fromY + PX - baseline;
  const k = n(PX / dotSize, 3);
  const at = (t) => pct(t, loop);
  const start = `transform:translate(${n(dx)}px,${n(dy)}px) scale(${k})`;
  const css =
    `@keyframes dot{0%{${start};opacity:0}` +
    `${at(0.4)}{${start};opacity:1}` +
    `${at(1.4)}{${start};opacity:1;animation-timing-function:steps(${Math.round(dx / CELL)},end)}` +
    `${at(4.6)}{transform:translate(0,${n(dy)}px) scale(${k});animation-timing-function:steps(6,end)}` +
    `${at(5.3)},${at(loop - 0.5)}{transform:none;opacity:1}${at(loop - 0.3)},100%{transform:none;opacity:0}}` +
    `.dot{transform-box:fill-box;transform-origin:0 100%;animation:dot ${loop}s step-end infinite}`;
  return { css, svg: `<rect class="dot" x="${dotX}" y="${baseline - dotSize}" width="${dotSize}" height="${dotSize}" fill="${fill}"/>` };
}

export function nameplate({ glyphs, text, title, h, size, plate, ink, field, dot, loop = 12 }) {
  const baseline = Math.round(h / 2 + size * 0.36);
  const tw = glyphs.measure(text, { font: "display", size });
  const dotSize = Math.round(size * 0.14);
  const dotX = Math.round(MARGIN + tw + size * 0.05);

  // The field starts where the line of type ends and thickens to the right.
  const fx = Math.ceil((dotX + dotSize + 20) / CELL) * CELL;
  const cols = Math.ceil((W - fx) / CELL);
  const rows = Math.ceil(h / CELL);
  const f = ditherField({
    x: fx, y: 0, cols, rows, cell: CELL, px: PX, fill: field, loop,
    value: (c, r) => Math.min(0.94, Math.max(0, ((c + 1) / cols) ** 1.25 * 1.05 - Math.abs(r - rows / 2) / rows * 0.18)),
  });

  const off = (CELL - PX) / 2;
  const stop = fullStop({
    fromX: fx + (cols - 9) * CELL + off, fromY: Math.round(rows * 0.3) * CELL + off,
    dotX, baseline, dotSize, fill: dot, loop,
  });

  const body =
    `<rect width="${W}" height="${h}" fill="${plate}"/>` +
    furniture({ w: W, h, ink }) +
    f.svg +
    glyphs.text(text, { font: "display", size, x: MARGIN, y: baseline, fill: ink }) +
    stop.svg;
  return sheet({ w: W, h, title, css: f.css + stop.css, defs: glyphs.defs(), body, radius: 20 });
}

// ── The closing plate ───────────────────────────────────────────────────────
// `lines` is the motto split in two; the second ends in a full stop, which is
// drawn as the pixel. `mark` is the logo's artwork and its viewBox size.
export function cover({ glyphs, lines, signature, mark, title, loop = 14 }) {
  const h = 360;
  const size = 92;
  const lead = 104;
  const base1 = 136;
  const base2 = base1 + lead;
  const last = lines[1].replace(/\.$/, "");
  if (last === lines[1]) throw new Error("readme-art: the cover's second line must end in a full stop");

  const font = { font: "display", size };
  const tw = Math.max(glyphs.measure(lines[0], font), glyphs.measure(last, font));
  const dotSize = Math.round(size * 0.14);
  const dotX = Math.round(MARGIN + glyphs.measure(last, font) + size * 0.05);

  // Two fields, one beside each line. The upper one loses its pixels while the
  // lower one gains them: the motto, acted out.
  const fx = Math.ceil((MARGIN + tw + dotSize + 40) / CELL) * CELL;
  const cols = Math.ceil((W - fx) / CELL);
  const rows = h / 2 / CELL;
  // nothing is lit at the left edge even when a field is full, so neither has an outline
  const swing = 0.28;
  const tone = (c) => Math.min(0.92, ((c + 1) / cols) ** 1.15 * 1.3 - swing);
  const top = ditherField({ x: fx, y: 0, cols, rows, cell: CELL, px: PX, fill: C.ash, loop, value: tone, swing, mode: "drain", name: "s" });
  const bottom = ditherField({ x: fx, y: h / 2, cols, rows, cell: CELL, px: PX, fill: C.ash, loop, value: tone, swing, mode: "fill", name: "a" });

  // The pixel is taken from the upper field and added to the lower line.
  const off = (CELL - PX) / 2;
  const stop = fullStop({
    fromX: fx + (cols - 12) * CELL + off, fromY: (rows - 5) * CELL + off,
    dotX, baseline: base2, dotSize, fill: C.orange, loop,
  });

  const markH = 38;
  const k = markH / mark.h;
  const sigY = 290;
  const body =
    `<rect width="${W}" height="${h}" fill="${C.ink}"/>` +
    furniture({ w: W, h, ink: C.ash }) +
    top.svg + bottom.svg +
    `<rect x="${fx}" y="${h / 2 - 0.75}" width="${W - fx}" height="1.5" fill="${C.ink}"/>` +
    glyphs.text(lines[0], { ...font, x: MARGIN, y: base1, fill: C.ash }) +
    glyphs.text(last, { ...font, x: MARGIN, y: base2, fill: C.ash }) +
    stop.svg +
    `<g transform="translate(${MARGIN} ${sigY}) scale(${n(k, 4)})">${mark.svg}</g>` +
    glyphs.text(signature.toUpperCase(), { font: "mono", size: 14, x: MARGIN + mark.w * k + 14, y: sigY + markH / 2 + 5, fill: C.ash, tracking: 0.22 });
  return sheet({ w: W, h, title, css: top.css + bottom.css + stop.css, defs: glyphs.defs(), body, radius: 20 });
}

// ── Section strips ──────────────────────────────────────────────────────────
const STRIP_H = 110;

// A level meter: columns of blocks, each uncovered to a height that changes in
// steps, with an orange cap riding the top block. The covers are the colour of
// the plate and shrink from the top of their column, so they never leave the
// plate; the blocks never move.
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
    const cap = (lv) => `transform:translateY(${(levels - lv) * pitch}px)`;
    const frames = (at) => seq.map((lv, s) => `${pct(s, stepsN)}{${at(lv)}}`).join("");
    css.push(
      `@keyframes ${name}${i}{${frames(cover)}}.${name}${i}{${cover(seq[0])};animation:${name}${i} ${loop}s step-end infinite}` +
      `@keyframes ${name}c${i}{${frames(cap)}}.${name}c${i}{${cap(seq[0])};animation:${name}c${i} ${loop}s step-end infinite}`);
    out.push(
      `<rect class="${name}${i} ${name}" x="${x - 2}" y="${n(top - 2, 1)}" width="${pitch}" height="${levels * pitch}" fill="${C.ash}"/>` +
      `<rect class="${name}c${i}" x="${x}" y="${n(top, 1)}" width="${block}" height="${block}" fill="${C.orange}"/>`);
  }
  css.push(`.${name}{transform-box:fill-box;transform-origin:50% 0}`);
  return { svg: `<path fill="${C.ink}" d="${blocks}"/>` + out.join(""), css: css.join("") };
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
    furniture({ w: W, h: STRIP_H, ink: C.ink, grid: 0 }) +
    m.svg +
    `<rect x="${MARGIN}" y="${(STRIP_H - mark) / 2}" width="${mark}" height="${mark}" fill="${C.orange}"/>` +
    glyphs.text(text, { font: "display", size, x: MARGIN + mark + 18, y: baseline, fill: C.ink });
  return sheet({ w: W, h: STRIP_H, title: text, css: m.css, defs: glyphs.defs(), body, radius: 20 });
}
