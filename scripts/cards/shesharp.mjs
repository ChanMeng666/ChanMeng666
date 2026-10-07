// She Sharp card. Chan led the digital and AI transformation of a New Zealand
// charity for 13.3 months, so the card is about scope and authorship: what was
// built around the platform, the ten strands of work inside it, and whose
// repository history it is.
//
// It is drawn in She Sharp's own design system, "She Sharp Editorial"
// (NZ-SheSharp/she-sharp: styles/tokens/colors.css, lib/fonts.ts): navy,
// brand purple, periwinkle and mint on the #f9f5f8 canvas; Bricolage Grotesque
// for headings, Instrument Sans for body and UI, Carattere as the script
// accent; pill controls; the wordmark recoloured through currentColor only.
//
// Every word and figure is already cleared somewhere:
//   - the ten strand captions, chips and basis lines, and the authorship
//     figures with their caveat, are the copy of the portfolio film
//     "Chan Meng: work for She Sharp" (she-sharp-promo-studio, copy.ts);
//   - the headline is the one-line summary of the transformation record's
//     RESUME.md, and the six pieces around the platform are repos in the
//     She Sharp family of docs/ecosystem/lineage.yaml;
//   - figures are pinned to the end of the tenure (1 Sep 2026).
// It keeps the film's rules: no charity-scale figure, no third party named, no
// hours-saved claim, and the authorship totals are labelled as repository
// totals with the other developer acknowledged on the same frame.
//
// The windows are stills of the film's coded replica of the product, cut at
// build time with ffmpeg. The film master is NOT in this repo
// (SHESHARP_INPUTS); where it is absent the card is not rebuilt and the
// committed SVG stands.
import { readFileSync } from "node:fs";

import { filmStills, wrap } from "../lib/svg-card/film.mjs";
import { CARD, card, pct } from "../lib/svg-card/shell.mjs";

export const SHESHARP_FONTS = {
  heading: "scripts/cards/fonts/shesharp/BricolageGrotesque-800.ttf",
  headingBold: "scripts/cards/fonts/shesharp/BricolageGrotesque-700.ttf",
  sans: "scripts/cards/fonts/shesharp/InstrumentSans-400.ttf",
  sansMid: "scripts/cards/fonts/shesharp/InstrumentSans-500.ttf",
  sansBold: "scripts/cards/fonts/shesharp/InstrumentSans-600.ttf",
  script: "scripts/cards/fonts/shesharp/Carattere-400.ttf",
};
export const SHESHARP_INPUTS = { film: "../she-sharp-promo-studio/out/masters/chan-meng_she-sharp_60s_landscape_1920x1080.mp4" };

// She Sharp Editorial tokens.
const SS = { canvas: "#f9f5f8", white: "#ffffff", navy: "#1f1e44", ink600: "#5a5880", ink300: "#c5c4d9", ink200: "#e7e6f2", brand: "#9b2e83", brandHover: "#c846ab", surfacePurple: "#f7e5f3", periwinkle: "#8982ff", periwinkleSoft: "#c4c1ff", mint: "#b1f6e9" };
// Where a product window sits in the film's 1920×1080 frame, and the size kept.
const WINDOW = { crop: "1070:910:776:84", w: 500, h: 425 };

const ROLE = "SENIOR FULL STACK ENGINEER & WEBSITE TEAM LEAD";
const TENURE = "JUL 2025 – SEP 2026";
// What was built around the platform (the She Sharp family in lineage.yaml).
const AROUND = ["HER WAKA programme site", "Half-year funder report", "Event promo film", "Hackathon Q&A assistant", "Event slide decks", "Transformation record"];
// The film's captions; `at` is the second of the 60 s cut each window is taken from.
const STRANDS = [
  { kicker: "Platform", title: ["From Webflow to a", "Next.js platform"], sub: "The public site, member dashboards and admin tools, in one codebase the charity holds.", chips: ["63 pages", "84 API routes", "198 components"], basis: "Repository at 1 Sep 2026", at: 5.5 },
  { kicker: "Design system", title: ["One design system,", "in code"], sub: "Colour tokens, three typefaces and shared components are defined once and reused across the site.", at: 12.8 },
  { kicker: "Data model", title: ["The data model"], sub: "Postgres with Drizzle: users and roles, mentorship, events, payments and email consent.", chips: ["39 tables", "33 enums", "32 migrations"], basis: "Schema at 1 Sep 2026", at: 17.0 },
  { kicker: "AI assistant", title: ["An assistant that", "reads live data"], sub: "The visitor chatbot calls typed tools over the site's events, mentors and team data.", chips: ["4 typed tools"], at: 23.0 },
  { kicker: "Mentor matching", title: ["AI mentor matching"], sub: "A rule pre-filter, then a model scores each pair on five factors. An admin approves each match.", at: 27.2 },
  { kicker: "Event decks", title: ["Slide decks", "as typed data"], sub: "Each deck is one TypeScript file, linted before it ships. One ran a two-day hackathon.", chips: ["91 slides", "2 days"], basis: "Aotearoa AI Hackathon Festival, Aug 2026", at: 31.2 },
  { kicker: "Slack", title: ["Slack, wired in"], sub: "A weekly mentorship digest, a card for each feedback response, and an event sync that opens a pull request.", at: 36.5 },
  { kicker: "Agent skills", title: ["Agent skills a", "non-engineer can run"], sub: "Recurring work, written down precisely enough for an agent to execute.", chips: ["11 agent skills"], at: 43.2 },
  { kicker: "Mailing list", title: ["The mailing list,", "moved in-house"], sub: "Double opt-in and consent records now sit in the charity's own database.", chips: ["1,549 recipients", "0 failures"], basis: "First send from the new system, 31 Aug 2026", at: 47.3 },
  { kicker: "Records", title: ["The record,", "recovered"], sub: "History held in Slack, Mailchimp, Humanitix and Webflow was pulled into storage the charity controls.", chips: ["1.15 GB", "4 platforms", "179 past newsletters"], basis: "Archive at 1 Sep 2026", at: 51.2 },
];
const AUTHORSHIP = {
  kicker: "13.3 MONTHS, ONE REPOSITORY",
  stats: [["1,381", "commits in the repository"], ["251", "merged pull requests"], ["94.5%", "of all lines added were Chan’s"]],
  caveat: ["Whole-repository history, 22 Jul 2025 to 1 Sep 2026.", "One other developer contributed alongside."],
};

export function buildShesharpCard({ glyphs, root }) {
  const shots = filmStills(`${root}/${SHESHARP_INPUTS.film}`, STRANDS.map((s) => s.at), WINDOW);

  // ── Timeline: the map, ten strands, then the authorship frame ──────────────
  const INTRO = 5.6;
  const D = 4.0;
  const OUTRO = 5.6;
  const T = INTRO + D * STRANDS.length + OUTRO;
  const p = (t) => pct(t, T, 3);
  const css = [];
  const rule = (name, body) => css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${T}s linear infinite}`);
  const startOf = (i) => INTRO + i * D;
  const delay = (t) => `animation-delay:${(t - T).toFixed(2)}s`;
  // strand rules are written once, relative to a strand's start
  rule("st", `0%{opacity:0}${p(0.3)},${p(D - 0.3)}{opacity:1}${p(D)},100%{opacity:0}`);
  rule("zm", `0%{transform:scale(1)}${p(D)},100%{transform:scale(1.045)}`);
  for (let n = 0; n < 3; n++) rule(`cp${n}`, `0%,${p(0.55 + n * 0.18)}{opacity:0;transform:translateY(5px)}${p(0.8 + n * 0.18)},100%{opacity:1;transform:none}`);
  css.push(".zm{transform-box:fill-box;transform-origin:center}");
  rule("in", `0%{opacity:0}${p(0.3)},${p(INTRO - 0.3)}{opacity:1}${p(INTRO)},100%{opacity:0}`);
  const outroAt = INTRO + D * STRANDS.length;
  rule("out", `0%,${p(outroAt)}{opacity:0}${p(outroAt + 0.3)},${p(T - 0.3)}{opacity:1}100%{opacity:0}`);

  const X = CARD.panel;
  const defs = [
    `<clipPath id="idp"><rect width="${X}" height="${CARD.h}"/></clipPath>`,
    `<clipPath id="win"><rect x="${X + 392}" y="18" width="384" height="324" rx="14"/></clipPath>`,
  ];
  const pill = (label, x, y, { fill, text, stroke, size = 10.5, h = 22, font = "sansBold" }) => {
    const w = glyphs.measure(label, { font, size }) + h;
    return [`<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}" rx="${h / 2}" fill="${fill}"${stroke ? ` stroke="${stroke}"` : ""}/>` + glyphs.text(label, { font, size, x: x + h / 2, y: y + h / 2 + size * 0.36, fill: text }), w];
  };

  // ── Identity: the site's own hero, navy with its two discs ─────────────────
  const wordmark = readFileSync(`${root}/public/brands/she-sharp-wordmark.svg`, "utf8").match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1];
  const h1 = { font: "heading", size: 33 };
  const lastLine = "AI transformation";
  const identity = [
    `<g clip-path="url(#idp)"><rect width="${X}" height="${CARD.h}" fill="${SS.navy}"/>` +
      `<circle cx="430" cy="60" r="170" fill="${SS.periwinkle}" fill-opacity=".2"/><circle cx="470" cy="330" r="120" fill="${SS.brand}" fill-opacity=".55"/></g>`,
    `<svg x="40" y="34" width="96" height="36" viewBox="0 0 136 51" color="${SS.white}">${wordmark}</svg>`,
    glyphs.text("work by Chan Meng", { font: "script", size: 25, x: 152, y: 62, fill: SS.mint }),
    glyphs.text(ROLE, { font: "sansBold", size: 9.5, x: 40, y: 108, fill: SS.periwinkleSoft, tracking: 0.1 }),
    glyphs.text("Led a charity’s digital and", { ...h1, x: 40, y: 152, fill: SS.white }),
    glyphs.text(lastLine, { ...h1, x: 40, y: 190, fill: SS.white }),
    // the site ends its hero line on a mint full stop
    `<circle cx="${(40 + glyphs.measure(lastLine, h1) + 8).toFixed(1)}" cy="184" r="5" fill="${SS.mint}"/>`,
    glyphs.text("Three platform migrations, a data-sovereignty programme", { font: "sans", size: 14, x: 40, y: 224, fill: SS.ink300 }),
    glyphs.text("and a governance audit, over 13.3 months.", { font: "sans", size: 14, x: 40, y: 244, fill: SS.ink300 }),
  ];
  const [leadPill, leadW] = pill("Lead developer", 40, 290, { fill: SS.brand, text: SS.white, size: 12, h: 30 });
  identity.push(leadPill, glyphs.text(TENURE, { font: "sansBold", size: 10, x: 40 + leadW + 16, y: 309, fill: SS.white, tracking: 0.14 }));

  // ── Intro: the platform and what was built around it ───────────────────────
  const CX = X + 400;
  const CY = 196;
  const spots = [[X + 150, 110], [X + 150, 196], [X + 150, 282], [X + 650, 110], [X + 650, 196], [X + 650, 282]];
  const intro = [
    glyphs.text("ONE PLATFORM, AND WHAT WAS BUILT AROUND IT", { font: "sansBold", size: 10, x: X + 32, y: 44, fill: SS.brand, tracking: 0.12 }),
  ];
  AROUND.forEach((label, n) => {
    const [x, y] = spots[n];
    const w = glyphs.measure(label, { font: "sansMid", size: 12.5 }) + 34;
    const t = 0.7 + n * 0.28;
    rule(`ar${n}`, `0%,${p(t)}{opacity:0}${p(t + 0.3)},100%{opacity:1}`);
    intro.push(
      `<g class="ar${n}"><path d="M${CX} ${CY}L${x} ${y}" stroke="${SS.periwinkle}" stroke-width="1.4" stroke-opacity=".7"/>` +
        `<rect x="${(x - w / 2).toFixed(1)}" y="${y - 19}" width="${w.toFixed(1)}" height="38" rx="19" fill="${SS.white}" stroke="${SS.ink200}"/>` +
        `<circle cx="${(x - w / 2 + 17).toFixed(1)}" cy="${y}" r="4" fill="${n % 2 ? SS.periwinkle : SS.brand}"/>` +
        `${glyphs.text(label, { font: "sansMid", size: 12.5, x: x - w / 2 + 28, y: y + 4.4, fill: SS.navy })}</g>`,
    );
  });
  intro.push(
    `<circle cx="${CX}" cy="${CY}" r="74" fill="${SS.navy}"/><circle cx="${CX + 34}" cy="${CY - 30}" r="44" fill="${SS.periwinkle}" fill-opacity=".28"/>` +
      `<svg x="${CX - 44}" y="${CY - 30}" width="88" height="33" viewBox="0 0 136 51" color="${SS.white}">${wordmark}</svg>` +
      glyphs.text("platform", { font: "script", size: 22, x: CX, y: CY + 30, fill: SS.mint, anchor: "middle" }),
  );

  // ── The ten strands ────────────────────────────────────────────────────────
  const CAP = { x: X + 32, w: 330 };
  const strands = STRANDS.map((s, i) => {
    const t0 = startOf(i);
    const out = [];
    out.push(glyphs.text(`${String(i + 1).padStart(2, "0")} · ${s.kicker.toUpperCase()}`, { font: "sansBold", size: 10, x: CAP.x, y: 60, fill: SS.brand, tracking: 0.12 }));
    s.title.forEach((l, n) => out.push(glyphs.text(l, { font: "heading", size: 31, x: CAP.x, y: 104 + n * 35, fill: SS.navy })));
    const subY = 104 + s.title.length * 35 - 4;
    const subStyle = { font: "sans", size: 13.5 };
    const sub = wrap(glyphs, s.sub, subStyle, CAP.w);
    sub.forEach((l, n) => out.push(glyphs.text(l, { ...subStyle, x: CAP.x, y: subY + n * 19, fill: SS.ink600 })));
    let cx = CAP.x;
    const chipY = subY + sub.length * 19 - 2;
    (s.chips || []).forEach((chip, n) => {
      const [svg, w] = pill(chip, cx, chipY, { fill: SS.surfacePurple, text: SS.brand });
      out.push(`<g class="cp${n}" style="${delay(t0)}">${svg}</g>`);
      cx += w + 6;
    });
    if (s.basis) out.push(glyphs.text(s.basis, { font: "sans", size: 10, x: CAP.x, y: chipY + 40, fill: SS.ink600 }));
    out.push(`<g clip-path="url(#win)"><image class="zm" style="${delay(t0)}" x="${X + 392}" y="18" width="384" height="324" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${shots[i]}"/></g>`);
    return `<g class="st" style="${delay(t0)}" opacity="0">${out.join("")}</g>`;
  });
  // which strand is up: ten ticks along the foot of the caption column
  const ticks = STRANDS.map((_, i) => {
    const x = CAP.x + i * 17;
    return `<rect x="${x}" y="322" width="12" height="3" rx="1.5" fill="${SS.ink300}"/><rect class="st" style="${delay(startOf(i))}" opacity="0" x="${x}" y="322" width="12" height="3" rx="1.5" fill="${SS.brand}"/>`;
  });
  rule("tk", `0%,${p(INTRO - 0.2)}{opacity:0}${p(INTRO)},${p(outroAt - 0.3)}{opacity:1}${p(outroAt)},100%{opacity:0}`);

  // ── Outro: whose repository history it is ──────────────────────────────────
  const outro = [glyphs.text(AUTHORSHIP.kicker, { font: "sansBold", size: 10, x: X + 32, y: 60, fill: SS.brand, tracking: 0.12 })];
  AUTHORSHIP.stats.forEach(([value, label], n) => {
    const x = X + 32 + n * 250;
    const lead = n === 2;
    outro.push(
      `<rect x="${x}" y="92" width="236" height="136" rx="16" fill="${lead ? SS.navy : SS.white}" stroke="${lead ? SS.navy : SS.ink200}"/>` +
        glyphs.text(value, { font: "heading", size: 58, x: x + 22, y: 166, fill: lead ? SS.white : SS.navy }) +
        glyphs.text(label, { font: "sansMid", size: 13, x: x + 22, y: 200, fill: lead ? SS.mint : SS.ink600 }),
    );
  });
  AUTHORSHIP.caveat.forEach((l, n) => outro.push(glyphs.text(l, { font: "sans", size: 12.5, x: X + 32, y: 268 + n * 19, fill: SS.ink600 })));

  const stage =
    `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${SS.canvas}"/>` +
    `<g class="in" opacity="0">${intro.join("")}</g>` +
    strands.join("") +
    `<g class="tk" opacity="0">${ticks.join("")}</g>` +
    // the authorship frame is the still frame: it is the card's point
    `<g class="out">${outro.join("")}</g>`;

  return {
    svg: card({
      title: "She Sharp, work by Chan Meng as Senior Full Stack Engineer and Website Team Lead, Jul 2025 to Sep 2026: led a charity’s digital and AI transformation. Ten strands of the platform, six pieces built around it, and the repository history: 1,381 commits, 251 merged pull requests, 94.5% of all lines added, with one other developer contributing alongside.",
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body: stage + identity.join(""),
      radius: 16,
    }),
    facts: { strands: STRANDS.length, around: AROUND.length, loop: `${T.toFixed(1)}s` },
  };
}
