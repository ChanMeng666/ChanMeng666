// Tam-AI-Ti card. A te reo Māori AI coach for financial wellbeing, built solo
// by Chan as a development commission; the card shows six parts of the product
// at work, then what was built and how a research cohort used it.
//
// It is drawn in the product's own design system (read from the product's
// checkout, which is not public): white ground, the "Pounamu Green" primary and
// the Tailwind families its screens use, Inter and nothing else, the 10 px
// radius, the product's own lockup file (crescent mark over the wordmark), and
// for the closing frame the tinted figure tiles of its goals overview: a small
// label, a large figure in the tile's colour.
//
// What is said, and where it comes from:
//   - the six captions and their eyebrows, and the disclosure line, are the
//     copy of Chan's Tam-AI-Ti product film (tamaiti-promo-studio, copy.ts),
//     read at build time; the windows are stills of that film's coded replica
//     of the product, in the film's own order;
//   - the headline is the product's own description of itself; the paragraph
//     under it and the commission line are the career database's
//     (projects[tam-ai-ti] impactHeadline, publicSummary, entity);
//   - the closing figures are projects[tam-ai-ti].metrics, matched by pattern
//     at build time, each with its basis on the tile; the closing heading is
//     the shard's own sentence about the cohort, and the kicker is one of its
//     keywords, shortened. The shard gives the cohort's span both as "four
//     months" and as Oct 2025 – Mar 2026, so the card states only the first.
// It keeps the film's constraints (its docs/decisions.md): no real user's data
// (the account on screen is the film's fictional demo persona, and the card
// says so wherever a window is up); no outcome, speed or advice claim; te reo
// Māori only as the product, the film or the database spell it, macrons
// included; no motif beyond the product's own mark. It names the person who
// commissioned the work and not her employer.
//
// The film master, its copy file and the lockup are NOT in this repo
// (TAM_AI_TI_INPUTS); where one is absent the card is not rebuilt and the
// committed SVG stands.
import { readFileSync } from "node:fs";

import { filmStills, wrap } from "../lib/svg-card/film.mjs";
import { CARD, card, pct } from "../lib/svg-card/shell.mjs";

export const TAM_AI_TI_FONTS = {
  ui: "scripts/cards/fonts/tam-ai-ti/Inter-400.ttf",
  uiMid: "scripts/cards/fonts/tam-ai-ti/Inter-500.ttf",
  uiSemi: "scripts/cards/fonts/tam-ai-ti/Inter-600.ttf",
  uiBold: "scripts/cards/fonts/tam-ai-ti/Inter-700.ttf",
};
export const TAM_AI_TI_INPUTS = {
  film: "../tamaiti-promo-studio/out/masters/tam-ai-ti_60s_landscape_1920x1080.mp4",
  copy: "../tamaiti-promo-studio/src/copy.ts",
  lockup: "../tam-ai-ti-web/public/tam-ai-ti-logo-with-brand.svg",
};

// The product's tokens: its globals.css theme and the Tailwind families its
// utility classes resolve to (as listed in the film's replica/tokens.ts).
const C = {
  bg: "#ffffff", fg: "#0a0a0a", primary: "#10b981", mutedFg: "#737373", border: "#e5e5e5",
  emerald50: "#ecfdf5", emerald200: "#a7f3d0", green700: "#15803d", gray600: "#4b5563",
  tiles: [
    { fg: "#2563eb", bg: "#eff6ff", line: "#bfdbfe" }, // blue 600 / 50 / 200
    { fg: "#16a34a", bg: "#f0fdf4", line: "#bbf7d0" }, // green
    { fg: "#ca8a04", bg: "#fefce8", line: "#fef08a" }, // yellow
    { fg: "#4b5563", bg: "#f9fafb", line: "#e5e7eb" }, // gray
  ],
};

// The film's chapters, in its order. `stills` are seconds of the 60 s cut and
// the top edge of the band of the product window each still keeps. Two stills
// of one unscrolled screen keep the same band, so the cross-fade adds to the
// picture instead of doubling it.
const WINDOW = { x: 270, w: 1380, h: 454, outW: 760, outH: 250 };
const CHAPTERS = [
  { id: "dashboard", eyebrow: "Whakataukī", stills: [[7.6, 176], [13.5, 300]] },
  { id: "maramataka", eyebrow: "Maramataka", stills: [[17.6, 176], [21.0, 212]] },
  { id: "goals", eyebrow: "Whāinga", stills: [[28.8, 200], [33.5, 350]] },
  { id: "journal", eyebrow: "Hauora", stills: [[37.0, 176], [39.6, 250]] },
  { id: "coach", eyebrow: "Kōrero", stills: [[41.6, 290], [44.6, 290]] },
  { id: "whanau", eyebrow: "Whānau", stills: [[47.5, 176], [52.5, 330]] },
];

// projects[tam-ai-ti].metrics: the label to find, the shape its value must
// still have, and what the tile says. A metric rewritten in the shard fails
// the build here instead of leaving a stale figure on the card.
const FIGURES = [
  { metric: "Research cohort", shape: /^(\d+) users \(Oct 2025 – Mar 2026\)$/, label: "Research cohort", basis: "People in the research cohort." },
  { metric: "Journal entries", shape: /^(\d+) bilingual \(EN \+ te reo Māori\)$/, label: "Journal entries", basis: "Bilingual: English and te reo Māori." },
  { metric: "Voice sessions", shape: /^(\d+) \(gpt-4o-realtime, text transcripts only — audio deliberately not stored\)$/, label: "Voice coaching sessions", basis: "Text transcripts only. Audio was deliberately not stored." },
  { metric: "DB schema scale", shape: /^(\d+) tables · /, label: "Database tables", basis: "Te Whare Tapa Whā is typed data in the schema." },
];
const COMMITS = { metric: "Commits (solo)", shape: /^(\d+) \(2025-09-19 → 2026-03-29\)$/ };

// The product's own line about itself, broken as the film's hook breaks it.
const HOOK = ["Financial wellness", "that weaves Māori", "wisdom with AI."];
const ABOUT =
  "A te reo Māori AI coach for financial wellbeing, built on the Māori holistic-health model Te Whare Tapa Whā. " +
  "Voice coaching and journaling in both te reo Māori and English.";
const COMMISSION = "A development commission from Riria (Missy) Te Kanawa.";

function filmCopy(root) {
  const src = readFileSync(`${root}/${TAM_AI_TI_INPUTS.copy}`, "utf8");
  const chapters = CHAPTERS.map((c) => {
    const m = src.match(new RegExp(`${c.id}: line\\("${c.id}", "([^"]+)",\\s*\\[([^\\]]+)\\]`));
    if (!m) throw new Error(`tam-ai-ti card: the film's copy.ts no longer has a "${c.id}" line in the expected shape`);
    // the eyebrow is te reo: it must be exactly the word this card was reviewed with
    if (m[1] !== c.eyebrow) throw new Error(`tam-ai-ti card: the film's "${c.id}" eyebrow is now "${m[1]}", not "${c.eyebrow}"; review before rebuilding`);
    return { ...c, line: [...m[2].matchAll(/"([^"]+)"/g)].map((s) => s[1]).join(" ") };
  });
  const hook = src.match(/hook: line\("hook", undefined,\s*\[([^\]]+)\]/);
  if (!hook || [...hook[1].matchAll(/"([^"]+)"/g)].map((s) => s[1]).join("|") !== HOOK.join("|")) throw new Error("tam-ai-ti card: the film's hook line changed");
  const disclosure = src.match(/landscape: \["(Interface recreated in code[^"]+)"\]/);
  if (!disclosure) throw new Error("tam-ai-ti card: the film's disclosure line was not found in copy.ts");
  const url = src.match(/url: "([^"]+)"/);
  if (!url) throw new Error("tam-ai-ti card: the film's end-card URL was not found in copy.ts");
  return { chapters, disclosure: disclosure[1], url: url[1] };
}

function figure(project, { metric, shape }) {
  const row = (project.metrics || []).find((m) => m.label === metric);
  const hit = row && String(row.value).match(shape);
  if (!hit) throw new Error(`tam-ai-ti card: projects[tam-ai-ti].metrics "${metric}" is missing or no longer reads as expected (${row ? row.value : "absent"})`);
  return hit[1];
}

export function buildTamAiTiCard({ glyphs, root, project }) {
  const { chapters, disclosure, url } = filmCopy(root);
  const film = `${root}/${TAM_AI_TI_INPUTS.film}`;
  const shots = chapters.map((c) =>
    c.stills.map(([t, y]) => filmStills(film, [t], { crop: `${WINDOW.w}:${WINDOW.h}:${WINDOW.x}:${y}`, w: WINDOW.outW, h: WINDOW.outH })[0]),
  );
  const figures = FIGURES.map((f) => ({ ...f, value: figure(project, f) }));
  const commits = figure(project, COMMITS);
  // the sentences below state these two; they must still be what the shard says
  if (figures[0].value !== "19") throw new Error("tam-ai-ti card: the cohort size changed; the closing headline and the title state 19");
  if (!/19-person research cohort used it over four months/.test(project.narrative?.impactHeadline || "")) throw new Error("tam-ai-ti card: the shard's impactHeadline no longer states the cohort and its four months");

  // ── Timeline: six chapters, then the closing frame ─────────────────────────
  const D = 4.8;
  const OUTRO = 6.6;
  const outroAt = D * chapters.length;
  const T = outroAt + OUTRO;
  const p = (t) => pct(t, T, 3);
  const css = [];
  const rule = (name, body) => css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${T}s linear infinite}`);
  const delay = (t) => `animation-delay:${(t - T).toFixed(2)}s`;
  rule("ch", `0%{opacity:0}${p(0.35)},${p(D - 0.35)}{opacity:1}${p(D)},100%{opacity:0}`);
  rule("sb", `0%,${p(2.2)}{opacity:0}${p(2.65)},100%{opacity:1}`);
  rule("ln", `0%,${p(0.2)}{transform:scaleX(.3)}${p(0.7)},100%{transform:scaleX(1)}`);
  css.push(".ln{transform-box:fill-box;transform-origin:center}");
  rule("out", `0%,${p(outroAt)}{opacity:0}${p(outroAt + 0.35)},${p(T - 0.35)}{opacity:1}100%{opacity:0}`);
  figures.forEach((_, n) => rule(`fg${n}`, `0%,${p(outroAt + 0.45 + n * 0.22)}{opacity:0;transform:translateY(6px)}${p(outroAt + 0.8 + n * 0.22)},100%{opacity:1;transform:none}`));

  // ── Identity: the product's lockup, its own line, and whose work it is ─────
  const X = CARD.panel;
  const lockup = readFileSync(`${root}/${TAM_AI_TI_INPUTS.lockup}`, "utf8").match(/<svg[^>]*viewBox="0 0 367 435"[^>]*>([\s\S]*)<\/svg>/);
  if (!lockup) throw new Error("tam-ai-ti card: the product's lockup file is not the 367 × 435 drawing this card was laid out for");
  const aboutStyle = { font: "ui", size: 14.5 };
  const about = wrap(glyphs, ABOUT, aboutStyle, 420);
  if (about.length > 4) throw new Error("tam-ai-ti card: the paragraph no longer fits the identity panel");
  const identity = [
    `<rect width="${X}" height="${CARD.h}" fill="${C.bg}"/>`,
    `<svg x="40" y="32" width="${((126 * 367) / 435).toFixed(1)}" height="126" viewBox="0 0 367 435">${lockup[1]}</svg>`,
    glyphs.text("DEVELOPMENT COMMISSION · BUILT SOLO", { font: "uiSemi", size: 10, x: 178, y: 52, fill: C.green700, tracking: 0.12 }),
    ...HOOK.map((l, n) => glyphs.text(l, { font: "uiBold", size: 25, x: 178, y: 88 + n * 30, fill: C.fg, tracking: -0.015 })),
    ...about.map((l, n) => glyphs.text(l, { ...aboutStyle, x: 40, y: 198 + n * 20.5, fill: C.gray600 })),
    `<path d="M40 286.5H${X - 40}" stroke="${C.border}"/>`,
    glyphs.text(COMMISSION, { font: "uiMid", size: 13, x: 40, y: 311, fill: C.fg }),
    glyphs.text("Developer: Chan Meng", { font: "ui", size: 13, x: 40, y: 332, fill: C.gray600 }),
    glyphs.text(url, { font: "uiSemi", size: 13, x: X - 40, y: 332, fill: C.green700, anchor: "end" }),
  ];

  // ── Chapters: the product window above, the film's caption beneath ─────────
  const WIN = { x: X + 20, y: 14, w: WINDOW.outW, h: WINDOW.outH };
  const MID = X + (CARD.w - X) / 2;
  const defs = [`<clipPath id="win"><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="10"/></clipPath>`];
  const total = chapters.length + 1;
  const count = (i) => `0${i + 1} / 0${total}`;
  const eyebrowRow = (text, at, y) => {
    const style = { font: "uiSemi", size: 10.5, tracking: 0.16 };
    const half = glyphs.measure(text, style) / 2 + 12;
    const bar = (x) => `<rect${at === null ? "" : ` class="ln" style="${delay(at)}"`} x="${x.toFixed(1)}" y="${y - 5}" width="26" height="2" rx="1" fill="${C.primary}"/>`;
    return bar(MID - half - 26) + glyphs.text(text, { ...style, x: MID, y, fill: C.green700, anchor: "middle" }) + bar(MID + half);
  };
  const scenes = chapters.map((c, i) => {
    const t0 = i * D;
    const img = (b64, cls) => `<image${cls} x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${b64}"/>`;
    return (
      `<g class="ch" style="${delay(t0)}" opacity="0">` +
      `<g clip-path="url(#win)">${img(shots[i][0], "")}${img(shots[i][1], ` class="sb" style="${delay(t0)}"`)}</g>` +
      eyebrowRow(c.eyebrow.toUpperCase(), t0, 292) +
      glyphs.text(c.line, { font: "uiSemi", size: 19.5, x: MID, y: 320, fill: C.fg, anchor: "middle", tracking: -0.01 }) +
      glyphs.text(count(i), { font: "uiMid", size: 10, x: WIN.x, y: 292, fill: C.mutedFg, tracking: 0.1 }) +
      `</g>`
    );
  });
  // what stays up while any window is: its frame, and the film's disclosure
  rule("fr", `0%{opacity:0}${p(0.35)},${p(outroAt - 0.35)}{opacity:1}${p(outroAt)},100%{opacity:0}`);
  const frame =
    `<g class="fr" opacity="0">` +
    `<rect x="${WIN.x}" y="${WIN.y + 3}" width="${WIN.w}" height="${WIN.h}" rx="10" fill="#000" fill-opacity=".05"/>` +
    `<rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="10" fill="${C.bg}"/>` +
    glyphs.text(disclosure, { font: "ui", size: 10.5, x: MID, y: 344, fill: C.mutedFg, anchor: "middle" }) +
    `</g>`;
  const edge = `<rect class="fr" opacity="0" x="${WIN.x + 0.5}" y="${WIN.y + 0.5}" width="${WIN.w - 1}" height="${WIN.h - 1}" rx="9.5" fill="none" stroke="${C.emerald200}"/>`;

  // ── The closing frame, in the product's own tinted figure tiles ────────────
  const L = X + 30;
  const TILE = { w: 176, h: 166, gap: 12, y: 104 };
  const outro = [
    glyphs.text(count(chapters.length), { font: "uiMid", size: 10, x: CARD.w - 30, y: 44, fill: C.mutedFg, tracking: 0.1, anchor: "end" }),
    `<rect x="${L}" y="39" width="26" height="2" rx="1" fill="${C.primary}"/>`,
    glyphs.text("SOLO FULL-STACK BUILD FOR A RESEARCH COMMISSION", { font: "uiSemi", size: 10.5, x: L + 36, y: 44, fill: C.green700, tracking: 0.16 }),
    glyphs.text(`A ${figures[0].value}-person research cohort used it over four months.`, { font: "uiBold", size: 21, x: L, y: 82, fill: C.fg, tracking: -0.012 }),
  ];
  figures.forEach((f, n) => {
    const x = L + n * (TILE.w + TILE.gap);
    const tint = C.tiles[n];
    const basisStyle = { font: "ui", size: 12.5 };
    const basis = wrap(glyphs, f.basis, basisStyle, TILE.w - 32);
    outro.push(
      `<g class="fg${n}"><rect x="${x + 0.5}" y="${TILE.y + 0.5}" width="${TILE.w - 1}" height="${TILE.h - 1}" rx="10" fill="${tint.bg}" stroke="${tint.line}"/>` +
        glyphs.text(f.label, { font: "uiMid", size: 11.5, x: x + 16, y: TILE.y + 30, fill: C.gray600 }) +
        glyphs.text(f.value, { font: "uiBold", size: 44, x: x + 15, y: TILE.y + 80, fill: tint.fg, tracking: -0.02 }) +
        basis.map((l, k) => glyphs.text(l, { ...basisStyle, x: x + 16, y: TILE.y + 106 + k * 17, fill: C.gray600 })).join("") +
        `</g>`,
    );
  });
  outro.push(
    glyphs.text("Counts of the cohort’s use of the product; they are not a measure of outcomes.", { font: "ui", size: 12.5, x: L, y: 300, fill: C.gray600 }),
    glyphs.text(`${commits} commits by one developer, 19 Sep 2025 to 29 Mar 2026.`, { font: "ui", size: 12.5, x: L, y: 320, fill: C.gray600 }),
  );

  const stage =
    `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${C.emerald50}"/>` +
    frame +
    scenes.join("") +
    edge +
    // the closing frame is the still frame
    `<g class="out">${outro.join("")}</g>`;

  return {
    svg: card({
      title:
        "Tam-AI-Ti, a te reo Māori AI coach for financial wellbeing built on the Māori holistic-health model Te Whare Tapa Whā, developed solo by Chan Meng as a development commission from Riria (Missy) Te Kanawa. " +
        "Six parts of the product in turn: a daily whakataukī and check-in, the maramataka calendar, goals with action plans, a hauora journal filled in by voice, a voice coach, and whānau support with permissions the user sets. " +
        `A ${figures[0].value}-person research cohort used it over four months: ${figures[1].value} bilingual journal entries and ${figures[2].value} voice coaching sessions. ` +
        "The interface shown is recreated in code; the demo account and figures are illustrative.",
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body: stage + identity.join("") + `<rect x="${X - 0.5}" width="1" height="${CARD.h}" fill="${C.border}"/>`,
      radius: 14,
    }),
    facts: { chapters: chapters.length, stills: shots.flat().length, figures: figures.map((f) => f.value).join("/"), commits, loop: `${T.toFixed(1)}s` },
  };
}
