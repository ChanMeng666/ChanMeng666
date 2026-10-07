// AI Programming card. Chan wrote the curriculum, built the teaching platform
// and taught on it; the card shows what the site does for a class and then
// what stands behind it.
//
// It is drawn in the site's own design system (ai-programming-teaching-project:
// DESIGN.md "MindMarket", src/css/tokens.css, src/css/pages.css): cream paper
// with white surfaces and one hairline, ink type, Inter only at 400 and 500,
// headings at 500 with tight tracking, the white pill eyebrow, the 10px chip,
// decorative dots, the sunshine footer band, and the site's own logo file. The
// system is light only, has no shadow and no gradient, and never uses green as
// text or as a large fill, so neither does the card.
//
// What is said, and where it comes from:
//   - the windows are stills of Chan's film of the site
//     (ai-programming-teaching-promo), whose picture is a coded replica of it;
//   - eyebrows, headings and version labels are the site's own strings, read
//     from the product repo at build time, and the build throws when one is no
//     longer there;
//   - two chapter titles are the film's cleared captions (its src/copy.ts), and
//     the question and the two references are the answer the film baked from
//     the live tutor (its src/data/chat-answer.json);
//   - the figures are the career database's (projects[…].narrative.outcomes,
//     work[technest]), each with its basis in the same tile.
// Kept off the card on purpose: any price or fee word (the film's programme
// caption carries one, so that window is cropped above it), student names and
// portraits (the showcase window stops above the team lines), a logo wall.
//
// The film master and the product checkout are NOT in this repo
// (AI_PROGRAMMING_INPUTS); where they are absent the card is not rebuilt and
// the committed SVG stands.
import { readFileSync } from "node:fs";

import { loadProfile } from "../lib/load-profile.mjs";
import { filmStills, wrap } from "../lib/svg-card/film.mjs";
import { CARD, card, pct } from "../lib/svg-card/shell.mjs";

export const AI_PROGRAMMING_FONTS = {
  body: "scripts/cards/fonts/gavigo/Inter-400.ttf",
  medium: "scripts/cards/fonts/gavigo/Inter-500.ttf",
};
const SITE = "../ai-programming-teaching-project";
const PROMO = "../ai-programming-teaching-promo";
export const AI_PROGRAMMING_INPUTS = {
  film: `${PROMO}/out/masters/Film-60-landscape.mp4`,
  copy: `${PROMO}/src/copy.ts`,
  answer: `${PROMO}/src/data/chat-answer.json`,
  logo: `${SITE}/static/img/brand/logo.svg`,
  versions: `${SITE}/versions.json`,
  config: `${SITE}/docusaurus.config.js`,
  hero: `${SITE}/src/components/Home/Hero/index.js`,
  programs: `${SITE}/src/components/Home/Programs/index.js`,
  instructor: `${SITE}/src/components/Home/Instructor/index.js`,
  chat: `${SITE}/src/components/ChatWidget/ChatBox.js`,
  showcase: `${SITE}/src/pages/capstone-showcase.js`,
};

// The site's tokens (src/css/tokens.css).
const C = { cream: "#f5f1e4", white: "#ffffff", sand: "#e0dbce", ink: "#2c2e2a", muted: "#5d5f5b", mist: "#d5d5d4", grass: "#8ed462", coral: "#ff705d", sun: "#f5e211", sky: "#2ba0ff" };

export function buildAiProgrammingCard({ glyphs, root, project }) {
  const read = (key) => readFileSync(`${root}/${AI_PROGRAMMING_INPUTS[key]}`, "utf8");
  // A string the card shows must still be in the file it is quoted from.
  const quote = (key, text) => {
    if (!read(key).replace(/\s+/g, " ").includes(text)) throw new Error(`ai-programming card: "${text}" is no longer in ${AI_PROGRAMMING_INPUTS[key]}`);
    return text;
  };
  const match = (text, re, what) => {
    const m = text.match(re);
    if (!m) throw new Error(`ai-programming card: ${what} no longer matches ${re}`);
    return m;
  };

  // ── The site's own words ───────────────────────────────────────────────────
  const SITE_TITLE = match(read("config"), /^\s*title: '(AI Programming)',/m, "the site title")[1];
  const versions = JSON.parse(read("versions"));
  const years = versions.map((v) => Number(match(v, /^(\d{4})-/, `version id "${v}"`)[1]));
  const latest = Math.max(...years);
  const running = years.filter((y) => y === latest).length;
  if (versions.length !== 5 || running !== 3) throw new Error(`ai-programming card: expected five versions, three in ${latest}; found ${versions.length} and ${running}`);
  const cohort = quote("config", "TECHNEST 2026");
  match(read("config"), /lastVersion: '2026-technest'/, "the default version");

  // ── The film's cleared captions and its baked answer ───────────────────────
  const caption = (id) => match(read("copy"), new RegExp(`\\b${id}: '([^']+)'`), `the film caption "${id}"`)[1];
  const stackLabel = caption("stackLabel");
  const stack = match(read("copy"), /stack: \[([^\]]+)\]/, "the film's stack chips")[1].split(",").map((s) => s.trim().replace(/^'|'$/g, ""));
  const baked = JSON.parse(read("answer"));
  const refs = [...baked.answer.matchAll(/— Reference: (.+?) \(versioned_docs/g)].map((m) => m[1]);
  if (refs.length !== 2 || baked.contextNamespace !== versions[0]) throw new Error("ai-programming card: the baked tutor answer no longer cites two lessons of the default class");

  // ── The career database's figures ──────────────────────────────────────────
  const outcomes = project.narrative.outcomes;
  const [, mine, all] = match(outcomes, /(\d+) of (\d+) non-merge commits/, "the commit share");
  match(outcomes, /the remainder is AI auto-review \+ Dependabot/, "the commit remainder");
  match(project.narrative.impactHeadline, /five course versions, three running in 2026/, "the version count");
  const technest = loadProfile().work.find((w) => w.id === "technest");
  const [, graduates, products] = match(technest.publicSummary, /graduated (\d+) students, who shipped (\d+) deployed\s+multi-user AI products/, "the TechNest outcome");
  match(technest.publicSummary, /Designed and delivered\s+the 2026 AI Track/, "the TechNest role");
  match(technest.narrative.impactHeadline, /sole instructor/, "the TechNest role");

  const CHAPTERS = [
    {
      layout: "band",
      eyebrow: quote("programs", "Curriculum"),
      title: quote("programs", "Pick your programme."),
      sub: ["Five course versions kept side by side,", `three of them running in ${latest}.`],
      // the flagship card first, then the page scrolled to the other four
      stills: [12.8, 15.0],
      crops: ["1600:506:160:112", "1600:506:160:437"],
    },
    {
      layout: "side",
      eyebrow: cohort,
      title: caption("docs"),
      sub: "Each version has its own video lessons, lab guides and PDF notes.",
      stills: [16.6, 23.0],
      crop: "1340:936:0:8",
      win: { w: 475, h: 332 },
    },
    {
      layout: "side",
      eyebrow: quote("chat", "AI Assistant"),
      title: caption("tutor"),
      stills: [27.4, 29.6, 33.5],
      crop: "744:968:1040:56",
      win: { w: 255, h: 332 },
      tutor: true,
    },
    {
      layout: "band",
      eyebrow: match(read("showcase"), /Live showcase/i, "the showcase eyebrow")[0],
      title: quote("showcase", "TECHNEST 2026 Capstone Showcase"),
      sub: ["Each team’s finished project on a", "public page, open to guest votes."],
      // the film's own caption for this scene, set as card text; the window is
      // cropped below the pill the film lays over the page, and above the team lines
      note: caption("showcase"),
      stills: [37.0, 38.6],
      crop: "1372:352:274:114",
      band: { y: 150, h: 193 },
    },
  ];
  const film = `${root}/${AI_PROGRAMMING_INPUTS.film}`;
  const BAND = { x: CARD.panel + 24, y: 106, w: 752, h: 238 };
  const PX = 1.5; // stills are stored at 1.5× the size they are shown
  const shots = CHAPTERS.map((c) => {
    const { w, h } = c.layout === "band" ? { ...BAND, ...c.band } : c.win;
    return c.stills.flatMap((t, n) => filmStills(film, [t], { crop: c.crops ? c.crops[n] : c.crop, w: Math.round(w * PX), h: Math.round(h * PX), quality: 8 }));
  });

  // ── Timeline: four chapters, then what stands behind the site ──────────────
  const D = 6.0;
  const OUTRO = 7.0;
  const outroAt = D * CHAPTERS.length;
  const T = outroAt + OUTRO;
  const p = (t) => pct(t, T, 3);
  const css = [];
  const rule = (name, body) => css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${T}s linear infinite}`);
  const delay = (t) => `animation-delay:${(t - T).toFixed(2)}s`;
  const from = (name, t) => rule(name, `0%,${p(t)}{opacity:0}${p(t + 0.45)},100%{opacity:1}`);
  rule("ch", `0%{opacity:0}${p(0.35)},${p(D - 0.35)}{opacity:1}${p(D)},100%{opacity:0}`);
  from("sb", 2.7);
  from("s1", 1.7);
  from("s2", 3.6);
  rule("out", `0%,${p(outroAt)}{opacity:0}${p(outroAt + 0.35)},${p(T - 0.35)}{opacity:1}100%{opacity:0}`);
  [0, 1, 2].forEach((n) => rule(`bh${n}`, `0%,${p(outroAt + 0.5 + n * 0.3)}{opacity:0;transform:translateY(6px)}${p(outroAt + 0.85 + n * 0.3)},100%{opacity:1;transform:none}`));

  // ── The site's patterns ────────────────────────────────────────────────────
  const hair = (x, y, w, h, r, fill = C.white) => `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${r}" fill="${fill}" stroke="${C.mist}"/>`;
  // .mm-eyebrow: a white pill, hairline, muted spaced capitals
  const eyebrow = (label, x, y) => {
    const style = { font: "medium", size: 10.5, tracking: 0.08 };
    const w = glyphs.measure(label.toUpperCase(), style) + 26;
    return hair(x, y, w, 24, 11.5) + glyphs.text(label.toUpperCase(), { ...style, x: x + 13, y: y + 15.8, fill: C.muted });
  };
  // .mm-chip: 10px radius, hairline, ink text, an optional decorative dot
  const chip = (label, x, y, dot) => {
    const style = { font: "body", size: 13 };
    const pad = dot ? 25 : 11;
    const w = glyphs.measure(label, style) + pad + 11;
    return { w, svg: hair(x, y, w, 26, 8) + (dot ? `<circle cx="${x + 14}" cy="${y + 13}" r="3" fill="${dot}"/>` : "") + glyphs.text(label, { ...style, x: x + pad, y: y + 17.6, fill: C.ink }) };
  };
  const label = (text, x, y) => glyphs.text(text.toUpperCase(), { font: "medium", size: 10.5, x, y, fill: C.muted, tracking: 0.08 });
  const heading = (text, size, x, y) => glyphs.text(text, { font: "medium", size, x, y, fill: C.ink, tracking: -0.04 });
  const total = CHAPTERS.length + 1;
  const ticks = (lit) => Array.from({ length: total }, (_, n) => `<circle cx="${CARD.w - 28 - (total - 1 - n) * 13}" cy="32" r="3.5" fill="${n === lit ? C.ink : C.sand}"/>`).join("");

  // ── Identity, on the site's cream, above its sunshine footer band ──────────
  const X = CARD.panel;
  const logo = match(read("logo"), /<svg[^>]*viewBox="0 0 64 64"[^>]*>([\s\S]*)<\/svg>/, "the logo file")[1];
  const identity =
    `<rect width="${X}" height="${CARD.h}" fill="${C.cream}"/>` +
    `<svg x="40" y="30" width="38" height="38" viewBox="0 0 64 64" fill="none">${logo}</svg>` +
    glyphs.text(SITE_TITLE, { font: "medium", size: 19, x: 90, y: 55.5, fill: C.ink, tracking: -0.02 }) +
    eyebrow(quote("hero", "AI Programming Education"), 40, 92) +
    glyphs.text("Learn to build", { font: "medium", size: 60, x: 37, y: 174, fill: C.ink, tracking: -0.06 }) +
    glyphs.text("with AI.", { font: "medium", size: 60, x: 37, y: 231, fill: C.ink, tracking: -0.06 }) +
    glyphs.text("A public site that teaches beginners to build software", { font: "body", size: 15, x: 40, y: 264, fill: C.muted }) +
    glyphs.text("with AI. Built and run by its instructor, Chan Meng.", { font: "body", size: 15, x: 40, y: 285, fill: C.muted }) +
    `<rect y="316" width="${X}" height="44" fill="${C.sun}"/>` +
    glyphs.text(caption("endUrl"), { font: "medium", size: 13.5, x: 40, y: 342.5, fill: C.ink }) +
    glyphs.text(caption("endBy"), { font: "body", size: 13.5, x: X - 40, y: 342.5, fill: C.ink, anchor: "end" });
  quote("hero", "Learn to build with AI.");

  // ── Chapters ───────────────────────────────────────────────────────────────
  const CAP = { x: X + 24 };
  const defs = [];
  const img = (b64, r, cls = "") => `<image${cls} x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${b64}"/>`;
  const scenes = CHAPTERS.map((c, i) => {
    const t0 = i * D;
    const win = c.layout === "band" ? { ...BAND, ...c.band } : { x: CARD.w - 24 - c.win.w, y: 14, ...c.win };
    const out = [`<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${C.cream}"/>`, ticks(i), eyebrow(c.eyebrow, CAP.x, 20)];
    if (c.layout === "band") {
      out.push(heading(c.title, 29, CAP.x - 1, 82));
      const left = CAP.x + glyphs.measure(c.title, { font: "medium", size: 29, tracking: -0.04 });
      if (c.note) out.push(`<circle cx="${CAP.x + 4}" cy="117" r="3.5" fill="${C.coral}"/>` + glyphs.text(c.note, { font: "medium", size: 14.5, x: CAP.x + 15, y: 122, fill: C.ink }));
      c.sub.forEach((l, n) => {
        if (CARD.w - 24 - glyphs.measure(l, { font: "body", size: 14.5 }) < left + 20) throw new Error(`ai-programming card: "${l}" runs into the title`);
        out.push(glyphs.text(l, { font: "body", size: 14.5, x: CARD.w - 24, y: 64 + n * 20, fill: C.muted, anchor: "end" }));
      });
    } else {
      const width = win.x - CAP.x - 22;
      const lines = wrap(glyphs, c.title, { font: "medium", size: 25, tracking: -0.04 }, width);
      lines.forEach((l, n) => out.push(heading(l, 25, CAP.x - 1, 84 + n * 30)));
      let y = 84 + lines.length * 30;
      if (c.sub) wrap(glyphs, c.sub, { font: "body", size: 14.5 }, width).forEach((l, n) => out.push(glyphs.text(l, { font: "body", size: 14.5, x: CAP.x, y: y + 2 + n * 20, fill: C.muted })));
      if (c.tutor) {
        // the question asked and the lessons the answer cited, from the film's bake
        out.push(label("Asked", CAP.x, y + 4));
        out.push(chip(baked.question, CAP.x, y + 12).svg);
        out.push(label("Cited", CAP.x, y + 60));
        refs.forEach((r, n) => {
          const c1 = chip(r, CAP.x, y + 68 + n * 30, C.grass);
          if (CAP.x + c1.w > win.x - 14) throw new Error(`ai-programming card: the reference chip "${r}" does not fit`);
          out.push(c1.svg);
        });
        out.push(label(stackLabel, CAP.x, y + 146));
        let cx = CAP.x;
        stack.forEach((s, n) => {
          const c1 = chip(s, cx, y + 154, [C.coral, C.sky, C.grass][n % 3]);
          out.push(c1.svg);
          cx += c1.w + 8;
        });
        if (y + 180 > CARD.h - 12 || cx > win.x - 6) throw new Error("ai-programming card: the tutor caption no longer fits its column");
      }
    }
    defs.push(`<clipPath id="w${i}"><rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" rx="20"/></clipPath>`);
    const extra = c.tutor ? ["s1", "s2"] : ["sb"];
    const layers = shots[i].map((b64, n) => img(b64, win, n ? ` class="${extra[n - 1]}" style="${delay(t0)}"` : ""));
    out.push(`<g clip-path="url(#w${i})">${layers.join("")}</g>`);
    out.push(`<rect x="${win.x + 0.5}" y="${win.y + 0.5}" width="${win.w - 1}" height="${win.h - 1}" rx="19.5" fill="none" stroke="${C.mist}"/>`);
    return `<g class="ch" style="${delay(t0)}" opacity="0">${out.join("")}</g>`;
  });

  // ── What stands behind the site, in the site's own instructor section ──────
  const BEHIND = [
    [String(versions.length), `Course versions, ${Math.min(...years)}–${latest}`, `Kept online side by side. Three of them ran in ${latest}.`, C.sky],
    [`${mine} / ${all}`, "Non-merge commits", "By Chan Meng. The rest are AI auto-review and Dependabot.", C.grass],
    [graduates, "Graduates, TechNest 2026", `Taught as sole instructor. They shipped ${products} deployed AI products.`, C.coral],
  ];
  const outro = [
    ticks(total - 1),
    eyebrow(quote("instructor", "Your instructor"), CAP.x, 20),
    heading(quote("instructor", "Taught by someone who still ships."), 29, CAP.x - 1, 82),
    glyphs.text("Chan Meng designed and delivered the TechNest 2026 AI Track, and built the platform that hosts it.", { font: "body", size: 14.5, x: CAP.x, y: 108, fill: C.muted }),
  ];
  BEHIND.forEach(([value, name, body, dot], n) => {
    const x = CAP.x + n * 256;
    const lines = wrap(glyphs, body, { font: "body", size: 14.5 }, 204);
    if (lines.length > 3) throw new Error(`ai-programming card: "${body}" needs more than three lines`);
    outro.push(
      `<g class="bh${n}">${hair(x, 128, 240, 216, 20)}` +
        glyphs.text(value, { font: "medium", size: 56, x: x + 17, y: 200, fill: C.ink, tracking: -0.06 }) +
        `<circle cx="${x + 23}" cy="229" r="3.5" fill="${dot}"/>` +
        label(name, x + 34, 233) +
        lines.map((l, k) => glyphs.text(l, { font: "body", size: 14.5, x: x + 20, y: 264 + k * 21, fill: C.muted })).join("") +
        "</g>",
    );
  });

  return {
    svg: card({
      title: `AI Programming, the public website at programming.chanmeng.org where beginners learn to build software with AI, built and run by its instructor, Chan Meng: five course versions kept side by side from ${Math.min(...years)} to ${latest}, lesson pages for an eight-week programme with a four-week capstone, an AI tutor that answers from the lessons and cites them, and a public showcase of the TechNest 2026 capstone projects. ${mine} of ${all} non-merge commits are Chan’s, the rest AI auto-review and Dependabot; the TechNest 2026 AI Track, taught by Chan as its sole instructor, graduated ${graduates} students who shipped ${products} deployed AI products.`,
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      // the instructor frame is the still frame
      body: `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${C.cream}"/>${scenes.join("")}<g class="out">${outro.join("")}</g>${identity}<rect x="${X - 0.5}" width="1" height="${CARD.h}" fill="${C.mist}"/>`,
      radius: 20,
    }),
    facts: { chapters: CHAPTERS.length, stills: shots.flat().length, versions: versions.length, commits: `${mine}/${all}`, graduates, products, loop: `${T.toFixed(1)}s` },
  };
}
