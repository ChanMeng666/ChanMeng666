// She Sharp card. The work was moving a charity onto infrastructure it owns, so
// the stage walks four pieces of that: the platform, the assistant, the agent
// skills and the mailing-list cut-over.
//
// This card restates Chan's portfolio film "Chan Meng: work for She Sharp"
// (private repo she-sharp-promo-studio) and is drawn the way that film is: the
// Caldera frame (Anton, DM Sans, basalt, one orange accent) around windows in
// She Sharp's own shipped design. It inherits the film's constraints registry:
//   - every caption, chip and basis line is the film's cleared copy, and every
//     figure is pinned to the end of the tenure (TRUTH-1, TRUTH-4, COPY-1);
//   - no charity-scale figure, no person named, no superlative (COPY-5,
//     PEOPLE-1, COPY-6);
//   - the role is in the past: the dates are on the card (COPY-3).
// Commit and line counts are left off on purpose: the README leads with what
// was built, and a repository total needs its authorship caveat beside it.
//
// The windows are stills cut from the film at build time with ffmpeg. The film
// master is NOT in this repo (SHESHARP_INPUTS); where it is absent the card is
// not rebuilt and the committed SVG stands.
import { readFileSync } from "node:fs";

import { filmStills, wrap } from "../lib/svg-card/film.mjs";
import { BRAND, CARD, FONTS, card, panel, pct } from "../lib/svg-card/shell.mjs";

export const SHESHARP_FONTS = FONTS;
export const SHESHARP_INPUTS = { film: "../she-sharp-promo-studio/out/masters/chan-meng_she-sharp_30s_landscape_1920x1080.mp4" };

// Where a product window sits in the film's 1920×1080 frame, and the size kept.
const WINDOW = { crop: "1070:910:776:84", w: 560, h: 476 };
const BASALT = "#E2E2DF";

// The film's own captions (its copy.ts), and the two moments of each window shown.
const HOOK = {
  eyebrow: "SHE SHARP · JUL 2025 – SEP 2026",
  title: "A charity, on infrastructure it owns.",
  role: "Senior Full Stack Engineer & Website Team Lead",
  strands: ["Website", "Database", "AI assistant", "Slack", "Agent skills", "Mailing list"],
};
const CHAPTERS = [
  { kicker: "Platform", title: ["From Webflow", "to a Next.js", "platform"], sub: "The public site, member dashboards and admin tools, in one codebase the charity holds.", chips: ["63 pages", "84 API routes", "198 components"], basis: "Repository at 1 Sep 2026", stills: [5.5, 7.6] },
  { kicker: "AI assistant", title: ["An assistant", "that reads", "live data"], sub: "The visitor chatbot calls typed tools over the site's events, mentors and team data.", chips: ["4 typed tools"], stills: [9.6, 11.6] },
  { kicker: "Agent skills", title: ["Agent skills", "a non-engineer", "can run"], sub: "Recurring work, written down precisely enough for an agent to execute.", chips: ["11 agent skills"], stills: [13.6, 15.3], dark: true },
  { kicker: "Mailing list", title: ["The mailing", "list, moved", "in-house"], sub: "Double opt-in and consent records now sit in the charity's own database.", chips: ["1,549 recipients", "0 failures"], basis: "First send from the new system, 31 Aug 2026", stills: [17.0, 19.4] },
];

export function buildShesharpCard({ glyphs, root }) {
  const shots = CHAPTERS.map((c) => filmStills(`${root}/${SHESHARP_INPUTS.film}`, c.stills, WINDOW));

  // ── Timeline: each chapter holds the stage for D seconds ───────────────────
  const D = 5.2;
  const T = D * CHAPTERS.length;
  const p = (t) => pct(t, T, 3);
  const css = [];
  const rule = (name, body) => css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${T}s linear infinite}`);
  const delay = (i) => `animation-delay:${(i * D - T).toFixed(2)}s`;
  // written once, relative to a chapter's start; chapter i runs them shifted
  rule("ch", `0%{opacity:0}${p(0.35)},${p(D - 0.35)}{opacity:1}${p(D)},100%{opacity:0}`);
  rule("sb", `0%,${p(2.5)}{opacity:0}${p(2.95)},100%{opacity:1}`); // the window's second moment
  for (let n = 0; n < 3; n++) rule(`cp${n}`, `0%,${p(0.7 + n * 0.22)}{opacity:0;transform:translateY(5px)}${p(1.0 + n * 0.22)},100%{opacity:1;transform:none}`);

  // ── Stage ──────────────────────────────────────────────────────────────────
  const X = CARD.panel;
  const CAP = { x: X + 28, w: 318 };
  const WIN = { x: X + 372, y: 12, w: 400, h: 340 };
  const defs = [`<clipPath id="win"><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="10"/></clipPath>`];
  const scenes = CHAPTERS.map((c, i) => {
    const ink = c.dark ? BRAND.ash : BRAND.ink;
    const soft = c.dark ? "#B9B8B3" : "#4A4946";
    const out = [`<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${c.dark ? BRAND.ink : BASALT}"/>`];
    // caption block
    out.push(`<rect x="${CAP.x}" y="55" width="18" height="2.5" fill="${BRAND.orange}"/>`);
    out.push(glyphs.text(`0${i + 1} · ${c.kicker}`, { font: "mono", size: 10.5, x: CAP.x + 26, y: 60, fill: soft, tracking: 0.06 }));
    c.title.forEach((l, n) => out.push(glyphs.text(l, { font: "display", size: 36, x: CAP.x, y: 106 + n * 38, fill: ink })));
    const subStyle = { font: "sans", size: 12.5 };
    const sub = wrap(glyphs, c.sub, subStyle, CAP.w);
    sub.forEach((l, n) => out.push(glyphs.text(l, { ...subStyle, x: CAP.x, y: 214 + n * 17, fill: soft })));
    let cx = CAP.x;
    const chipY = 214 + sub.length * 17 + 6;
    c.chips.forEach((chip, n) => {
      const w = glyphs.measure(chip, { font: "sansBold", size: 10.5 }) + 20;
      out.push(
        `<g class="cp${n}" style="${delay(i)}"><rect x="${cx.toFixed(1)}" y="${chipY}" width="${w.toFixed(1)}" height="22" rx="11" fill="${c.dark ? BRAND.ash : BRAND.ink}"/>` +
          `${glyphs.text(chip, { font: "sansBold", size: 10.5, x: cx + 10, y: chipY + 15, fill: c.dark ? BRAND.ink : BRAND.ash })}</g>`,
      );
      cx += w + 6;
    });
    if (c.basis) out.push(glyphs.text(c.basis, { font: "mono", size: 8.5, x: CAP.x, y: chipY + 40, fill: soft }));
    out.push(glyphs.text("Chan Meng · work for She Sharp", { font: "mono", size: 8.5, x: CAP.x, y: 28, fill: soft }));
    // the window: one moment, then the next
    const img = (b64, cls) => `<image${cls} x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${b64}"/>`;
    out.push(`<g clip-path="url(#win)">${img(shots[i][0], "")}${img(shots[i][1], ` class="sb" style="${delay(i)}"`)}</g>`);
    return `<g class="ch" style="${delay(i)}"${i === 0 ? "" : ' opacity="0"'}>${out.join("")}</g>`;
  });
  const stageSvg = `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${BASALT}"/>${scenes.join("")}<rect x="${X - 0.5}" width="1" height="${CARD.h}" fill="#2c2b29"/>`;

  // ── Identity panel (the Caldera frame) ─────────────────────────────────────
  const markFile = readFileSync(`${root}/public/brands/she-sharp-mark.svg`, "utf8").match(/<svg[^>]*>([\s\S]*)<\/svg>\s*$/)[1];
  const chips = [];
  let used = 0;
  for (const s of HOOK.strands) {
    const w = glyphs.measure(s.toUpperCase(), { font: "mono", size: 12, tracking: 0.1 }) + 36;
    if (used + w > CARD.panel - 64) break;
    chips.push(s.toUpperCase());
    used += w;
  }
  const panelSvg = panel(glyphs, {
    eyebrow: HOOK.eyebrow,
    name: "She Sharp",
    headline: HOOK.title,
    underline: "it owns",
    sub: HOOK.role,
    chips,
    mark: `<svg width="58" height="58" viewBox="0 0 100 100">${markFile}</svg>`,
    headlineSize: 22.5,
  });

  return {
    svg: card({
      title: "Chan Meng's work for She Sharp, Jul 2025 to Sep 2026: a charity moved onto infrastructure it owns. A Next.js platform, an assistant that reads live data, agent skills a non-engineer can run, and the mailing list moved in-house.",
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      panelSvg,
      stageSvg,
    }),
    facts: { chapters: CHAPTERS.length, stills: shots.flat().length, loop: `${T.toFixed(1)}s` },
  };
}
