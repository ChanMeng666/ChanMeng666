// FemTech Weekend card. The site is bilingual, carried the Shanghai Summit and
// takes the community's applications, so the stage shows those three things.
//
// It is drawn in the site's own design: its bronze primary on near-black and
// white, and the type the site itself asks for, which is the reader's system
// serif and sans (Georgia and Segoe UI on the machine that builds this). Those
// two are system fonts: they are read from the operating system at build time
// and are not copied into this repo (FEMTECH_INPUTS). Where they are absent the
// card is not rebuilt and the committed SVG stands.
//
// There is no film of this site, so the windows are captures of the public
// site itself (femtechweekend.com, taken 2026-10-07), kept in
// scripts/cards/assets/femtech/. Views with a person's face, a partner-logo
// wall or a price were deliberately not used.
import { readFileSync } from "node:fs";

import { CARD, card, pct } from "../lib/svg-card/shell.mjs";

const SYSTEM = "C:/Windows/Fonts";
export const FEMTECH_FONTS = {
  display: `${SYSTEM}/georgia.ttf`,
  body: `${SYSTEM}/segoeui.ttf`,
  bodyBold: `${SYSTEM}/seguisb.ttf`,
  mono: "cv/fonts/JetBrainsMono-Regular.ttf",
};
export const FEMTECH_INPUTS = { serif: FEMTECH_FONTS.display, sans: FEMTECH_FONTS.body, sansBold: FEMTECH_FONTS.bodyBold };

// The site's colours (femtech-weekend-website src/css/custom.css).
const C = { bronze: "#AA7C52", bronzeLight: "#DBBB9A", night: "#060911", paper: "#FBF9F6", ink: "#1B1A19", soft: "#6B665F", onNight: "#F4EFE8", onNightSoft: "#B9B1A6", line: "#E7E1D8" };

// Each chapter: what the site does, and two views of it. Figures are the
// career database's (projects[femtech-weekend-website]).
const CHAPTERS = [
  { kicker: "Bilingual", title: ["Two languages,", "one site"], sub: ["English and Simplified Chinese,", "page for page."], views: ["home-en", "home-zh"] },
  { kicker: "Shanghai Summit 2026", title: ["The summit’s", "front door"], sub: ["Agenda, programme and speakers", "for 22–25 June 2026."], views: ["summit", "home-2"] },
  { kicker: "Applications", title: ["Sign-up, in", "one system"], sub: ["Four application forms feed", "one reviewed pipeline."], views: ["programme-0", "pitch-1800"] },
];

export function buildFemtechCard({ glyphs, root }) {
  const view = (name) => readFileSync(`${root}/scripts/cards/assets/femtech/${name}.jpg`).toString("base64");

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

  // ── Identity, on the site's night ground ───────────────────────────────────
  const X = CARD.panel;
  const mark = readFileSync(`${root}/public/brands/femtech-weekend-mark.svg`, "utf8").match(/<svg[^>]*>([\s\S]*)<\/svg>\s*$/)[1];
  let cx = 40;
  const chips = ["BILINGUAL", "SHANGHAI SUMMIT 2026"].map((label) => {
    const w = glyphs.measure(label, { font: "mono", size: 10.5, tracking: 0.12 }) + 24;
    const svg = `<rect x="${cx}" y="296.5" width="${w.toFixed(1)}" height="27" rx="2" fill="none" stroke="${C.bronzeLight}" stroke-opacity=".6" stroke-width="1.1"/>` + glyphs.text(label, { font: "mono", size: 10.5, x: cx + 12, y: 314, fill: C.onNight, tracking: 0.12 });
    cx += w + 8;
    return svg;
  });
  const identity =
    `<rect width="${X}" height="${CARD.h}" fill="${C.night}"/>` +
    glyphs.text("WOMEN’S-HEALTH TECHNOLOGY COMMUNITY · CHINA", { font: "mono", size: 10.5, x: 40, y: 50, fill: C.onNightSoft, tracking: 0.12 }) +
    `<svg x="40" y="76" width="58" height="58" viewBox="0 0 100 100">${mark}</svg>` +
    glyphs.text("FemTech Weekend", { font: "display", size: 38, x: 112, y: 118, fill: C.onNight }) +
    `<rect x="40" y="160" width="46" height="2" fill="${C.bronze}"/>` +
    glyphs.text("The bilingual website and sign-up system", { font: "display", size: 21, x: 40, y: 198, fill: C.onNight }) +
    glyphs.text("that carried Shanghai Summit 2026.", { font: "display", size: 21, x: 40, y: 226, fill: C.onNight }) +
    glyphs.text("Built and run as the community’s CTO, since March 2025.", { font: "body", size: 14, x: 40, y: 256, fill: C.onNightSoft }) +
    chips.join("");

  // ── Stage ──────────────────────────────────────────────────────────────────
  const CAP = { x: X + 30 };
  const WIN = { x: X + 300, y: 14, w: 475, h: 332 };
  const defs = [`<clipPath id="win"><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="6"/></clipPath>`];
  const scenes = CHAPTERS.map((c, i) => {
    const out = [`<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${C.paper}"/>`];
    out.push(`<rect class="ln" style="${delay(i)}" x="${CAP.x}" y="78" width="34" height="2" fill="${C.bronze}"/>`);
    out.push(glyphs.text(c.kicker.toUpperCase(), { font: "mono", size: 9.5, x: CAP.x + 44, y: 82, fill: C.bronze, tracking: 0.14 }));
    c.title.forEach((l, n) => out.push(glyphs.text(l, { font: "display", size: 33, x: CAP.x, y: 138 + n * 39, fill: C.ink })));
    c.sub.forEach((l, n) => out.push(glyphs.text(l, { font: "body", size: 14, x: CAP.x, y: 138 + c.title.length * 39 - 4 + n * 20, fill: C.soft })));
    out.push(glyphs.text(`0${i + 1} / 0${CHAPTERS.length}`, { font: "mono", size: 9.5, x: CAP.x, y: 44, fill: C.soft, tracking: 0.12 }));
    const img = (name, cls) => `<image${cls} x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${view(name)}"/>`;
    out.push(`<g clip-path="url(#win)">${img(c.views[0], "")}${img(c.views[1], ` class="sb" style="${delay(i)}"`)}</g>`);
    out.push(`<rect x="${WIN.x + 0.5}" y="${WIN.y + 0.5}" width="${WIN.w - 1}" height="${WIN.h - 1}" rx="5.5" fill="none" stroke="${C.line}"/>`);
    return `<g class="ch" style="${delay(i)}"${i === 0 ? "" : ' opacity="0"'}>${out.join("")}</g>`;
  });

  return {
    svg: card({
      title: "FemTech Weekend: the bilingual website and sign-up system that carried Shanghai Summit 2026. English and Simplified Chinese page for page, the summit’s agenda and programme, and four application forms feeding one reviewed pipeline.",
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body: `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${C.paper}"/>${scenes.join("")}${identity}`,
      radius: 8,
    }),
    facts: { chapters: CHAPTERS.length, views: CHAPTERS.flatMap((c) => c.views).length, loop: `${T.toFixed(1)}s` },
  };
}
