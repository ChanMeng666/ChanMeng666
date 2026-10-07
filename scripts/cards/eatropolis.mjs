// Eatropolis card. Chan built the festival's website alone, under a commercial
// contract, in a nine-day build; the card shows what a visitor gets from it and
// then what the delivery was held to.
//
// It is drawn in the festival's own design system (Chow-Luck-Club/
// eatropolis-website): the product's colour tokens (parchment, ink, chilli),
// its typefaces (Big Shoulders Display, Archivo Narrow), its own white
// wordmark and stamp, and for the delivery frame the layout of the site's own
// "how pricing works" strip: a big chilli figure, a spaced caps label, a line
// of body.
//
// What is said, and where it comes from:
//   - the three chapter captions are the copy of Chan's Eatropolis website
//     film (eatropolis-promo-film, copy.ts), and the windows are stills of
//     that film's coded replica of the site;
//   - the delivery figures are the career database's
//     (projects[eatropolis-website].metrics): the build span, the
//     accessibility run and the load test, each with its basis in the line.
// It keeps the film's constraints: no price is stated and no still shows one
// (C2, and this repo's own no-pricing rule); no attendance figure (C8); the
// concierge is never called "AI" (C7). The card also says nothing that goes
// stale after the event of 10 Oct 2026.
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

// The product's tokens (its variables.css, as synced into the film's tokens.json).
const P = { chilli: "#ee2529", chilliOnInk: "#f74a4e", ink: "#101010", charcoal: "#2a2724", smoke: "#5b564e", stone: "#c9c2b5", parchment: "#f2ede2", cream: "#f8f4ea", bone: "#ffffff" };
const WINDOW = { crop: "1360:950:516:66", w: 572, h: 400 };

// projects[eatropolis-website].metrics, in the layout of the site's pricing strip.
const DELIVERY = [
  ["9 DAYS", "THE BUILD", ["One developer, 115 commits,", "under a signed contract."]],
  ["39/39", "ACCESSIBILITY TESTS", ["axe-core runs pass, against", "WCAG 2.2 AA."]],
  ["1,000", "CONCURRENT VISITORS", ["Load-tested for five minutes", "with a 0.00% error rate."]],
];

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

  // ── Timeline: three chapters, then the delivery frame ──────────────────────
  const D = 5.2;
  const OUTRO = 6.0;
  const outroAt = D * CHAPTERS.length;
  const T = outroAt + OUTRO;
  const p = (t) => pct(t, T, 3);
  const css = [];
  const rule = (name, body) => css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${T}s linear infinite}`);
  const delay = (t) => `animation-delay:${(t - T).toFixed(2)}s`;
  rule("ch", `0%{opacity:0}${p(0.35)},${p(D - 0.35)}{opacity:1}${p(D)},100%{opacity:0}`);
  rule("sb", `0%,${p(2.5)}{opacity:0}${p(2.95)},100%{opacity:1}`);
  rule("ln", `0%,${p(0.3)}{transform:scaleX(0)}${p(0.9)},100%{transform:scaleX(1)}`);
  css.push(".ln{transform-box:fill-box;transform-origin:left center}");
  rule("out", `0%,${p(outroAt)}{opacity:0}${p(outroAt + 0.35)},${p(T - 0.35)}{opacity:1}100%{opacity:0}`);
  DELIVERY.forEach((_, n) => rule(`dv${n}`, `0%,${p(outroAt + 0.5 + n * 0.3)}{opacity:0;transform:translateY(6px)}${p(outroAt + 0.85 + n * 0.3)},100%{opacity:1;transform:none}`));

  // ── Identity, on the festival's ink, under its own wordmark ────────────────
  const X = CARD.panel;
  const inner = (file) => readFileSync(`${root}/${file}`, "utf8").match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1];
  const seal = readFileSync(`${root}/public/brands/eatropolis-mark.svg`, "utf8").match(/<svg x="17"[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/);
  if (!seal) throw new Error("eatropolis card: could not find the stamp inside public/brands/eatropolis-mark.svg");
  const identity =
    `<rect width="${X}" height="${CARD.h}" fill="${P.ink}"/>` +
    glyphs.text("FESTIVAL WEBSITE · SOLO BUILD · AUCKLAND 2026", { font: "mono", size: 10.5, x: 40, y: 50, fill: P.stone, tracking: 0.12 }) +
    `<svg x="40" y="78" width="252" height="58" viewBox="0 0 400 92">${inner("public/brands/eatropolis-wordmark-white.svg")}</svg>` +
    `<svg x="392" y="72" width="68" height="68" viewBox="${seal[1]}">${seal[2]}</svg>` +
    `<rect x="40" y="166" width="46" height="3" fill="${P.chilli}"/>` +
    glyphs.text("Award winning food, Auckland roots", { font: "bodyBold", size: 25, x: 40, y: 204, fill: P.cream }) +
    glyphs.text("The site for Auckland’s one-day culinary festival, built alone", { font: "body", size: 15.5, x: 40, y: 236, fill: P.stone }) +
    glyphs.text("for Chow Luck Club: every dish, every kitchen, and a concierge", { font: "body", size: 15.5, x: 40, y: 256, fill: P.stone }) +
    glyphs.text("that answers out loud.", { font: "body", size: 15.5, x: 40, y: 276, fill: P.stone }) +
    glyphs.text("SHED 10, QUEENS WHARF · 10 OCT 2026", { font: "mono", size: 10.5, x: 40, y: 318, fill: P.cream, tracking: 0.12 });

  // ── Chapters ───────────────────────────────────────────────────────────────
  const CAP = { x: X + 30 };
  const WIN = { x: X + 300, y: 14, w: 475, h: 332 };
  const defs = [`<clipPath id="win"><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="8"/></clipPath>`];
  const total = CHAPTERS.length + 1;
  const scenes = CHAPTERS.map((c, i) => {
    const ink = c.dark ? P.bone : P.ink;
    const soft = c.dark ? P.stone : P.smoke;
    const t0 = i * D;
    const out = [`<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${c.dark ? P.ink : P.parchment}"/>`];
    out.push(`<rect class="ln" style="${delay(t0)}" x="${CAP.x}" y="92" width="34" height="3" fill="${c.dark ? P.chilliOnInk : P.chilli}"/>`);
    c.title.forEach((l, n) => out.push(glyphs.text(l, { font: "display", size: 46, x: CAP.x, y: 150 + n * 46, fill: ink, tracking: 0.01 })));
    c.sub.forEach((l, n) => out.push(glyphs.text(l, { font: "body", size: 15.5, x: CAP.x, y: 150 + c.title.length * 46 - 8 + n * 20, fill: soft })));
    out.push(glyphs.text(`0${i + 1} / 0${total}`, { font: "mono", size: 9.5, x: CAP.x, y: 44, fill: soft, tracking: 0.12 }));
    const img = (b64, cls) => `<image${cls} x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${b64}"/>`;
    out.push(`<g clip-path="url(#win)">${img(shots[i][0], "")}${img(shots[i][1], ` class="sb" style="${delay(t0)}"`)}</g>`);
    out.push(`<rect x="${WIN.x + 0.5}" y="${WIN.y + 0.5}" width="${WIN.w - 1}" height="${WIN.h - 1}" rx="7.5" fill="none" stroke="${c.dark ? "#3a3632" : P.stone}"/>`);
    return `<g class="ch" style="${delay(t0)}" opacity="0">${out.join("")}</g>`;
  });

  // ── The delivery frame, laid out like the site's own pricing strip ─────────
  const outro = [
    glyphs.text(`0${total} / 0${total}`, { font: "mono", size: 9.5, x: CAP.x, y: 44, fill: P.smoke, tracking: 0.12 }),
    `<rect x="${CAP.x}" y="66" width="34" height="3" fill="${P.chilli}"/>`,
    glyphs.text("HOW IT WAS DELIVERED", { font: "mono", size: 9.5, x: CAP.x + 46, y: 71, fill: P.chilli, tracking: 0.14 }),
    glyphs.text("Built alone, to a contract. Reviewed by the council’s development agency.", { font: "bodyBold", size: 21, x: CAP.x, y: 112, fill: P.ink }),
    `<path d="M${CAP.x} 134.5H${CARD.w - 30}" stroke="${P.stone}"/>`,
  ];
  DELIVERY.forEach(([value, label, lines], n) => {
    const x = CAP.x + n * 250;
    const body = lines.map((l, k) => glyphs.text(l, { font: "body", size: 14, x, y: 262 + k * 18, fill: P.smoke })).join("");
    outro.push(
      `<g class="dv${n}">${glyphs.text(value, { font: "display", size: 62, x, y: 204, fill: P.chilli })}` +
        `${glyphs.text(label, { font: "mono", size: 9.5, x, y: 234, fill: P.ink, tracking: 0.16 })}${body}</g>`,
    );
    if (n) outro.push(`<path d="M${x - 22.5} 152V304" stroke="${P.stone}"/>`);
  });

  const stage =
    `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${P.parchment}"/>` +
    scenes.join("") +
    // the delivery frame is the still frame
    `<g class="out">${outro.join("")}</g>`;

  return {
    svg: card({
      title: "Eatropolis, the website for Auckland’s one-day culinary festival at Shed 10 on 10 October 2026, built alone by Chan Meng under contract to Chow Luck Club: every signature dish on one page, every confirmed kitchen in one lineup, a concierge that answers from the festival’s own facts. Delivered in a nine-day build; 39 of 39 accessibility tests pass against WCAG 2.2 AA; load-tested at 1,000 concurrent visitors with a 0.00% error rate.",
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body: stage + identity + `<rect x="${X - 0.5}" width="1" height="${CARD.h}" fill="#3a3632"/>`,
      radius: 14,
    }),
    facts: { chapters: CHAPTERS.length, stills: shots.flat().length, dishes: dishCount, loop: `${T.toFixed(1)}s` },
  };
}
