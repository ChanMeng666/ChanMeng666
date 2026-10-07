// Eatropolis card. The site's job was to let a festival-goer see every dish and
// every kitchen and get a straight answer to a question, so the stage shows
// those three things.
//
// It is drawn in the festival's own design: the product's colour tokens
// (parchment, ink, chilli as decoration only) and its typefaces (Big Shoulders
// Display, Archivo Narrow), around stills of the site itself.
//
// This card restates Chan's Eatropolis website film (private repo
// eatropolis-promo-film) and inherits its constraints registry:
//   - nothing in a window is invented: the stills are the film's own replica
//     of the product (C1);
//   - the card states no price, and no still shows one (C2 and this repo's own
//     no-pricing rule), which is why the pricing chapter is not here;
//   - no speed claim, no attendance figure (C3, C8);
//   - the concierge is never called "AI" (C7);
//   - hierarchy is black / red / white, and chilli is decorative (C5).
// Unlike the film, the card makes no statement that goes stale after the event
// of 10 Oct 2026: it says what the site does, not that tickets are on sale.
//
// The film master is NOT in this repo (EATROPOLIS_INPUTS); where it is absent
// the card is not rebuilt and the committed SVG stands.
import { readFileSync } from "node:fs";

import { filmStills } from "../lib/svg-card/film.mjs";
import { CARD, card, pct } from "../lib/svg-card/shell.mjs";

export const EATROPOLIS_FONTS = {
  display: "scripts/cards/fonts/eatropolis/BigShouldersDisplay-800.ttf",
  body: "scripts/cards/fonts/eatropolis/ArchivoNarrow-400.ttf",
  bodyBold: "scripts/cards/fonts/eatropolis/ArchivoNarrow-600.ttf",
  mono: "cv/fonts/JetBrainsMono-Regular.ttf",
};
export const EATROPOLIS_INPUTS = {
  film: "../eatropolis-promo-film/out/masters/A-synth-market-day/Eatropolis-60-Landscape-16x9.mp4",
  dishes: "../eatropolis-promo-film/src/product/dishes.json",
};

// The product's tokens (the film's src/product/tokens.json).
const P = { chilli: "#ee2529", chilliOnInk: "#f74a4e", ink: "#101010", charcoal: "#2a2724", smoke: "#5b564e", stone: "#c9c2b5", parchment: "#f2ede2", cream: "#f8f4ea", bone: "#ffffff" };
const WINDOW = { crop: "1360:950:516:66", w: 572, h: 400 };

export function buildEatropolisCard({ glyphs, root }) {
  const dishCount = JSON.parse(readFileSync(`${root}/${EATROPOLIS_INPUTS.dishes}`, "utf8")).length;
  // The film's own captions (its copy.ts); the two moments of each window shown.
  const CHAPTERS = [
    { title: ["EVERY PLATE.", "ONE PAGE."], sub: [`Browse ${dishCount} signature dishes.`, "Filter by cuisine or diet."], stills: [10.0, 14.5] },
    { title: ["WHO’S", "COOKING."], sub: ["Every confirmed kitchen,", "in one lineup."], stills: [24.6, 28.0] },
    { title: ["ASK", "ANYTHING."], sub: ["The concierge answers from", "the festival’s own facts."], stills: [40.5, 45.0], dark: true },
  ];
  const film = `${root}/${EATROPOLIS_INPUTS.film}`;
  const shots = CHAPTERS.map((c) => filmStills(film, c.stills, WINDOW));

  // ── Timeline ───────────────────────────────────────────────────────────────
  const D = 5.4;
  const T = D * CHAPTERS.length;
  const p = (t) => pct(t, T, 3);
  const css = [];
  const rule = (name, body) => css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${T}s linear infinite}`);
  const delay = (i) => `animation-delay:${(i * D - T).toFixed(2)}s`;
  rule("ch", `0%{opacity:0}${p(0.35)},${p(D - 0.35)}{opacity:1}${p(D)},100%{opacity:0}`);
  rule("sb", `0%,${p(2.6)}{opacity:0}${p(3.05)},100%{opacity:1}`);
  rule("ln", `0%,${p(0.3)}{transform:scaleX(0)}${p(0.9)},100%{transform:scaleX(1)}`);
  css.push(".ln{transform-box:fill-box;transform-origin:left center}");

  // ── Identity, on the festival's ink ────────────────────────────────────────
  const X = CARD.panel;
  const seal = readFileSync(`${root}/public/brands/eatropolis-mark.svg`, "utf8").match(/<svg x="17"[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/);
  if (!seal) throw new Error("eatropolis card: could not find the seal inside public/brands/eatropolis-mark.svg");
  const chip = (label, x) => {
    const w = glyphs.measure(label, { font: "mono", size: 10.5, tracking: 0.12 }) + 24;
    return [`<rect x="${x}" y="296.5" width="${w.toFixed(1)}" height="27" rx="13.5" fill="none" stroke="${P.stone}" stroke-opacity=".55" stroke-width="1.1"/>` + glyphs.text(label, { font: "mono", size: 10.5, x: x + 12, y: 314, fill: P.cream, tracking: 0.12 }), w];
  };
  let cx = 40;
  const chips = ["WCAG 2.2 AA", "VOICE CONCIERGE"].map((c) => {
    const [svg, w] = chip(c, cx);
    cx += w + 8;
    return svg;
  });
  const identity =
    `<rect width="${X}" height="${CARD.h}" fill="${P.ink}"/>` +
    glyphs.text("FESTIVAL WEBSITE · SHED 10, AUCKLAND · 10 OCT 2026", { font: "mono", size: 10.5, x: 40, y: 50, fill: P.stone, tracking: 0.12 }) +
    `<svg x="40" y="74" width="62" height="62" viewBox="${seal[1]}">${seal[2]}</svg>` +
    glyphs.text("EATROPOLIS", { font: "display", size: 58, x: 116, y: 128, fill: P.bone, tracking: 0.02 }) +
    `<rect x="40" y="160" width="46" height="3" fill="${P.chilli}"/>` +
    glyphs.text("Award winning food, Auckland roots", { font: "bodyBold", size: 25, x: 40, y: 198, fill: P.cream }) +
    glyphs.text("The site for Auckland’s one-day culinary festival: every dish,", { font: "body", size: 15.5, x: 40, y: 230, fill: P.stone }) +
    glyphs.text("every kitchen, and a concierge that answers out loud.", { font: "body", size: 15.5, x: 40, y: 250, fill: P.stone }) +
    chips.join("");

  // ── Stage ──────────────────────────────────────────────────────────────────
  const CAP = { x: X + 30 };
  const WIN = { x: X + 300, y: 14, w: 475, h: 332 };
  const defs = [`<clipPath id="win"><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="8"/></clipPath>`];
  const scenes = CHAPTERS.map((c, i) => {
    const ink = c.dark ? P.bone : P.ink;
    const soft = c.dark ? P.stone : P.smoke;
    const out = [`<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${c.dark ? P.ink : P.parchment}"/>`];
    out.push(`<rect class="ln" style="${delay(i)}" x="${CAP.x}" y="92" width="34" height="3" fill="${c.dark ? P.chilliOnInk : P.chilli}"/>`);
    c.title.forEach((l, n) => out.push(glyphs.text(l, { font: "display", size: 46, x: CAP.x, y: 150 + n * 46, fill: ink, tracking: 0.01 })));
    c.sub.forEach((l, n) => out.push(glyphs.text(l, { font: "body", size: 15.5, x: CAP.x, y: 150 + c.title.length * 46 - 8 + n * 20, fill: soft })));
    out.push(glyphs.text(`0${i + 1} / 0${CHAPTERS.length}`, { font: "mono", size: 9.5, x: CAP.x, y: 44, fill: soft, tracking: 0.12 }));
    const img = (b64, cls) => `<image${cls} x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${b64}"/>`;
    out.push(`<g clip-path="url(#win)">${img(shots[i][0], "")}${img(shots[i][1], ` class="sb" style="${delay(i)}"`)}</g>`);
    out.push(`<rect x="${WIN.x + 0.5}" y="${WIN.y + 0.5}" width="${WIN.w - 1}" height="${WIN.h - 1}" rx="7.5" fill="none" stroke="${c.dark ? "#3a3632" : P.stone}"/>`);
    return `<g class="ch" style="${delay(i)}"${i === 0 ? "" : ' opacity="0"'}>${out.join("")}</g>`;
  });
  const stage = `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${P.parchment}"/>${scenes.join("")}`;

  return {
    svg: card({
      title: "Eatropolis, the website for Auckland’s one-day culinary festival at Shed 10 on 10 October 2026: every signature dish on one page, every confirmed kitchen in one lineup, and a concierge that answers from the festival’s own facts.",
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body: stage + identity + `<rect x="${X - 0.5}" width="1" height="${CARD.h}" fill="#3a3632"/>`,
      radius: 14,
    }),
    facts: { chapters: CHAPTERS.length, stills: shots.flat().length, dishes: dishCount, loop: `${T.toFixed(1)}s` },
  };
}
