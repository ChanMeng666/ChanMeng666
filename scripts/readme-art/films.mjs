// The film wall (public/readme/films.svg): every film as a poster tile, in
// columns that drift past each other. It stands where the README used to embed
// the films themselves, and its job is to send the reader to the page that
// plays them. Drawn in the Caldera system.
//
// The films and their lengths come from data/profile/46-films.yaml (see
// build-readme-art.mjs for which rows). Each poster is a committed thumbnail in
// scripts/readme-art/assets/films/<film id>.jpg, cut from that film's own
// poster.
import fs from "node:fs";
import path from "node:path";

import { C, furniture, n, sheet } from "./kit.mjs";

const W = 1300;
const H = 360;
const PANEL = 452;
const TILE = { w: 196, h: 110, gap: 12 };
const COLS = 4;
const SECONDS_PER_TILE = 7;

export function films({ glyphs, root, eyebrow, headline, link, counts, list, title }) {
  const mono = (s, x, y, o = {}) => glyphs.text(String(s).toUpperCase(), { font: "mono", size: 12.5, x, y, fill: C.ash, tracking: 0.16, ...o });

  // ── The wall ──────────────────────────────────────────────────────────────
  const defs = [];
  const columns = Array.from({ length: COLS }, () => []);
  list.forEach((film, i) => {
    const file = path.join(root, "scripts/readme-art/assets/films", `${film.id}.jpg`);
    if (!fs.existsSync(file)) throw new Error(`readme-art: no poster thumbnail for film "${film.id}" (${file})`);
    const tw = glyphs.measure(film.duration, { font: "mono", size: 11 }) + 16;
    defs.push(
      `<g id="f${i}"><image href="data:image/jpeg;base64,${fs.readFileSync(file).toString("base64")}" width="${TILE.w}" height="${TILE.h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#tile)"/>` +
      `<rect x="8" y="${TILE.h - 28}" width="${n(tw)}" height="20" rx="4" fill="${C.ink}"/>` +
      glyphs.text(film.duration, { font: "mono", size: 11, x: 16, y: TILE.h - 13.5, fill: C.ash }) +
      `<rect x=".75" y=".75" width="${TILE.w - 1.5}" height="${TILE.h - 1.5}" rx="9.25" fill="none" stroke="${C.ash}" stroke-opacity=".28" stroke-width="1.5"/></g>`);
    columns[i % COLS].push(i);
  });

  const x0 = PANEL + 24;
  const pitch = TILE.h + TILE.gap;
  const css = [];
  const wall = columns.map((ids, c) => {
    // A column is drawn twice, one copy above the other, and travels exactly one
    // copy's height, so the loop has no seam. Neighbours travel opposite ways.
    const span = ids.length * pitch;
    const copies = Math.ceil((H + span) / span) + 1;
    let tiles = "";
    for (let k = 0; k < copies * ids.length; k++) tiles += `<use href="#f${ids[k % ids.length]}" y="${k * pitch}"/>`;
    const up = c % 2 === 0;
    const from = up ? 0 : -span;
    const to = up ? -span : 0;
    css.push(`@keyframes w${c}{from{transform:translateY(${from}px)}to{transform:translateY(${to}px)}}.w${c}{animation:w${c} ${ids.length * SECONDS_PER_TILE}s linear infinite}`);
    // the still frame starts each column part-way, so no two rows line up
    return `<g transform="translate(${x0 + c * (TILE.w + TILE.gap)} ${-((c * 37) % pitch)})"><g class="w${c}" transform="translate(0 ${from})">${tiles}</g></g>`;
  }).join("");

  // ── The panel ─────────────────────────────────────────────────────────────
  const size = 62;
  const lines = headline.split(" / ");
  const widest = Math.max(...lines.map((l) => glyphs.measure(l, { font: "display", size })));
  if (widest > PANEL - 56 - 24) throw new Error(`readme-art: the film wall's headline does not fit its panel`);
  const figure = (value, label, x) =>
    glyphs.text(String(value), { font: "display", size: 36, x, y: 252, fill: C.ash }) + mono(label, x, 272, { size: 10.5, tracking: 0.1 });
  const linkW = glyphs.measure(link.toUpperCase(), { font: "mono", size: 11.5, tracking: 0.12 }) + 58;
  const lx = 56;
  const panel =
    `<rect width="${PANEL}" height="${H}" fill="${C.ink}"/>` +
    `<rect x="56" y="50" width="10" height="10" fill="${C.orange}"/>` + mono(eyebrow, 76, 60) +
    lines.map((l, k) => glyphs.text(l, { font: "display", size, x: 56, y: 126 + k * 64, fill: C.ash })).join("") +
    counts.map(([value, label], k) => figure(value, label, 56 + k * 112)).join("") +
    // where the card leads: a play mark that pulses, and the address
    `<rect x="${n(lx)}" y="294" width="${n(linkW)}" height="34" rx="17" fill="${C.orange}"/>` +
    `<path class="play" d="M${n(lx + 17)} 303.5l11 7.5l-11 7.5z" fill="${C.ink}"/>` +
    mono(link, lx + 38, 315.5, { fill: C.ink, size: 11.5, tracking: 0.12 });
  css.push("@keyframes play{0%,70%,100%{transform:none}80%{transform:scale(1.35)}90%{transform:none}}.play{transform-box:fill-box;transform-origin:center;animation:play 3.2s cubic-bezier(.3,0,.2,1) infinite}");

  const body =
    `<rect width="${W}" height="${H}" fill="${C.ink}"/>` +
    wall +
    // the wall fades into the plate at its top and bottom edges
    `<rect x="${PANEL}" width="${W - PANEL}" height="46" fill="url(#top)"/><rect x="${PANEL}" y="${H - 46}" width="${W - PANEL}" height="46" fill="url(#bottom)"/>` +
    panel +
    furniture({ w: W, h: H, ink: C.ash, grid: 0 });
  const grad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.ink}" stop-opacity="${a}"/><stop offset="1" stop-color="${C.ink}" stop-opacity="${b}"/></linearGradient>`;
  return sheet({
    w: W, h: H, title, css: css.join(""), body, radius: 20,
    defs: `<clipPath id="tile"><rect width="${TILE.w}" height="${TILE.h}" rx="10"/></clipPath>` + grad("top", 0.85, 0) + grad("bottom", 0, 0.85) + defs.join("") + glyphs.defs(),
  });
}
