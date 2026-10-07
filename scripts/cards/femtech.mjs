// FemTech Weekend card. Chan is the community's CTO and built both generations
// of its platform; the card shows what the site does and then what stands
// behind it.
//
// It is drawn in the site's own design system (femtech-weekend-website:
// src/css/custom.css, tailwind.config): the bronze primary on black and white,
// its own wordmark, a rule-and-caps kicker above a serif heading, squared
// controls, and the type the site itself asks for: the reader's system serif
// and sans. On the machine that builds this those are Georgia and Segoe UI;
// they are system fonts, read from the operating system at build time and not
// copied into this repo (FEMTECH_INPUTS). Where they are absent the card is not
// rebuilt and the committed SVG stands.
//
// There is no film of this site, so the windows are captures of the public
// site itself (femtechweekend.com, taken 2026-10-07), kept in
// scripts/cards/assets/femtech/. Views with a person's face, a partner-logo
// wall or a price were deliberately not used. Every figure is the career
// database's (projects[femtech-weekend-website].metrics), with its basis in
// the line.
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

// The site's colours.
const C = { bronze: "#AA7C52", bronzeLight: "#DBBB9A", night: "#060911", paper: "#FBF9F6", ink: "#1B1A19", soft: "#6B665F", onNight: "#F4EFE8", onNightSoft: "#B9B1A6", line: "#E7E1D8" };

const CHAPTERS = [
  { kicker: "Bilingual", title: ["Two languages,", "one site"], sub: ["English and Simplified Chinese on", "every page, from the first day."], views: ["home-en", "home-zh"] },
  { kicker: "Shanghai Summit 2026", title: ["The summit’s", "front door"], sub: ["Agenda, programme and speakers", "for 22–25 June 2026."], views: ["summit", "home-2"] },
  { kicker: "Applications", title: ["Sign-up, in", "one system"], sub: ["Four application forms feed", "one reviewed pipeline."], views: ["programme-0", "pitch-1800"] },
];
// projects[femtech-weekend-website].metrics
const BEHIND = [
  ["2", "PLATFORM GENERATIONS", ["Designed and built both,", "as the community’s CTO."]],
  ["538 / 570", "COMMITS, TO 30 JUL 2026", ["The other 32 are the", "founder’s content edits."]],
  ["16", "SERVER ENDPOINTS", ["Behind the forms, uploads,", "emails and admin review."]],
];

export function buildFemtechCard({ glyphs, root }) {
  const view = (name) => readFileSync(`${root}/scripts/cards/assets/femtech/${name}.jpg`).toString("base64");

  // ── Timeline: three chapters, then what stands behind the site ─────────────
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
  BEHIND.forEach((_, n) => rule(`bh${n}`, `0%,${p(outroAt + 0.5 + n * 0.3)}{opacity:0;transform:translateY(6px)}${p(outroAt + 0.85 + n * 0.3)},100%{opacity:1;transform:none}`));

  // the site's kicker: a short rule, then spaced caps
  const kicker = (label, x, y, colour, extra = "") => `<rect${extra} x="${x}" y="${y - 4}" width="34" height="1.5" fill="${colour}"/>` + glyphs.text(label.toUpperCase(), { font: "mono", size: 9.5, x: x + 44, y, fill: colour, tracking: 0.14 });

  // ── Identity, on the site's black, under its own wordmark ──────────────────
  const X = CARD.panel;
  const logo = readFileSync(`${root}/public/organizations/femtech-weekend-logo-dark.svg`, "utf8").match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1];
  const identity =
    `<rect width="${X}" height="${CARD.h}" fill="${C.night}"/>` +
    `<svg x="36" y="30" width="180" height="73" viewBox="0 0 959 389">${logo}</svg>` +
    kicker("Chief Technology Officer · since Mar 2025", 40, 138, C.bronzeLight) +
    glyphs.text("The bilingual website and sign-up", { font: "display", size: 24, x: 40, y: 178, fill: C.onNight }) +
    glyphs.text("system that carried Shanghai", { font: "display", size: 24, x: 40, y: 208, fill: C.onNight }) +
    glyphs.text("Summit 2026.", { font: "display", size: 24, x: 40, y: 238, fill: C.onNight }) +
    glyphs.text("Sole architect of both generations of the platform.", { font: "body", size: 14, x: 40, y: 270, fill: C.onNightSoft }) +
    `<rect x="40" y="296.5" width="${(glyphs.measure("femtechweekend.com", { font: "bodyBold", size: 11.5 }) + 30).toFixed(1)}" height="28" fill="${C.bronze}"/>` +
    glyphs.text("femtechweekend.com", { font: "bodyBold", size: 11.5, x: 55, y: 314.5, fill: "#FFFFFF" });

  // ── Chapters ───────────────────────────────────────────────────────────────
  const CAP = { x: X + 30 };
  const WIN = { x: X + 300, y: 14, w: 475, h: 332 };
  const defs = [`<clipPath id="win"><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="4"/></clipPath>`];
  const total = CHAPTERS.length + 1;
  const scenes = CHAPTERS.map((c, i) => {
    const t0 = i * D;
    const out = [`<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${C.paper}"/>`];
    out.push(kicker(c.kicker, CAP.x, 82, C.bronze, ` class="ln" style="${delay(t0)}"`));
    c.title.forEach((l, n) => out.push(glyphs.text(l, { font: "display", size: 33, x: CAP.x, y: 138 + n * 39, fill: C.ink })));
    c.sub.forEach((l, n) => out.push(glyphs.text(l, { font: "body", size: 14, x: CAP.x, y: 138 + c.title.length * 39 - 4 + n * 20, fill: C.soft })));
    out.push(glyphs.text(`0${i + 1} / 0${total}`, { font: "mono", size: 9.5, x: CAP.x, y: 44, fill: C.soft, tracking: 0.12 }));
    const img = (name, cls) => `<image${cls} x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${view(name)}"/>`;
    out.push(`<g clip-path="url(#win)">${img(c.views[0], "")}${img(c.views[1], ` class="sb" style="${delay(t0)}"`)}</g>`);
    out.push(`<rect x="${WIN.x + 0.5}" y="${WIN.y + 0.5}" width="${WIN.w - 1}" height="${WIN.h - 1}" rx="3.5" fill="none" stroke="${C.line}"/>`);
    return `<g class="ch" style="${delay(t0)}" opacity="0">${out.join("")}</g>`;
  });

  // ── What stands behind the site ────────────────────────────────────────────
  const outro = [
    glyphs.text(`0${total} / 0${total}`, { font: "mono", size: 9.5, x: CAP.x, y: 44, fill: C.soft, tracking: 0.12 }),
    kicker("Behind the site", CAP.x, 82, C.bronze),
    glyphs.text("One engineer, across two generations of the platform.", { font: "display", size: 25, x: CAP.x, y: 122, fill: C.ink }),
    `<path d="M${CAP.x} 144.5H${CARD.w - 30}" stroke="${C.line}"/>`,
  ];
  BEHIND.forEach(([value, label, lines], n) => {
    const x = CAP.x + n * 250;
    const body = lines.map((l, k) => glyphs.text(l, { font: "body", size: 13.5, x, y: 262 + k * 19, fill: C.soft })).join("");
    outro.push(
      `<g class="bh${n}">${glyphs.text(value, { font: "display", size: 44, x, y: 204, fill: C.bronze })}` +
        `${glyphs.text(label, { font: "mono", size: 9.5, x, y: 234, fill: C.ink, tracking: 0.14 })}${body}</g>`,
    );
    if (n) outro.push(`<path d="M${x - 22.5} 162V304" stroke="${C.line}"/>`);
  });

  return {
    svg: card({
      title: "FemTech Weekend, built by Chan Meng as the community’s Chief Technology Officer and sole architect of both generations of its platform: the bilingual website and sign-up system that carried Shanghai Summit 2026. English and Simplified Chinese on every page, the summit’s agenda and programme, four application forms feeding one reviewed pipeline; 538 of 570 commits to 30 July 2026 and 16 server endpoints.",
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      // the "behind the site" frame is the still frame
      body: `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${C.paper}"/>${scenes.join("")}<g class="out">${outro.join("")}</g>${identity}`,
      radius: 8,
    }),
    facts: { chapters: CHAPTERS.length, views: CHAPTERS.flatMap((c) => c.views).length, loop: `${T.toFixed(1)}s` },
  };
}
