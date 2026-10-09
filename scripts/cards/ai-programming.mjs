// AI Programming card. The stage is the site at work: one docs page, recreated
// in vectors, that a cursor drives through four things the site does.
//   1. the navbar's version dropdown opens on the real version labels, one is
//      picked, and the sidebar and the lesson change with it;
//   2. a week is opened and the lesson's own code block types itself;
//   3. the AI tutor: the chat widget opens, the film's question is typed, the
//      answer streams, and the two lessons it cited arrive as chips while the
//      same two lessons light up in the sidebar (the still frame);
//   4. the capstone showcase: the public project cards pop in.
//
// It is drawn in the site's own design system (ai-programming-teaching-project:
// DESIGN.md "MindMarket", src/css/tokens.css, navbar.css, docs.css, pages.css,
// ChatWidget/styles.module.css): cream paper with white surfaces and one
// hairline, ink type, Inter at 400 and 500, the floating white navbar pill,
// white dropdown cards, the sidebar's white active row with its green rule,
// 10px chips with a decorative dot, the sandstone user bubble, the coral send
// button, the sunshine footer band, and the site's own logo file. The system
// is light only, has no shadow and no gradient, and never uses green as text
// or as a large fill, so neither does the card.
//
// What is said, and where it comes from:
//   - navbar labels, version labels, sidebar rows, lesson headings, the code
//     block, chat strings and showcase strings are the site's own, read from
//     the product repo at build time; the build throws when one is no longer
//     there;
//   - the question, the answer and its two references are the answer the film
//     baked from the live tutor (ai-programming-teaching-promo,
//     src/data/chat-answer.json); the project names and tracks are the film's
//     bake of the public showcase API (src/data/capstones.json);
//   - the two figures are the site's: the length of versions.json, and the
//     lesson count the home page states, checked against the files.
// Kept off the card on purpose: any price or fee word, student names and
// portraits (the showcase cards carry the project and its track only), the
// tutor's avatar (a head silhouette), vote counts and award ranks, a logo wall.
//
// The product checkout and the film's data files are NOT in this repo
// (AI_PROGRAMMING_INPUTS); where they are absent the card is not rebuilt and
// the committed SVG stands.
import { readdirSync, readFileSync } from "node:fs";

import { wrap } from "../lib/svg-card/film.mjs";
import { CARD, card, pct } from "../lib/svg-card/shell.mjs";

export const AI_PROGRAMMING_FONTS = {
  body: "scripts/cards/fonts/gavigo/Inter-400.ttf",
  medium: "scripts/cards/fonts/gavigo/Inter-500.ttf",
  mono: "cv/fonts/JetBrainsMono-Regular.ttf",
};
const SITE = "../ai-programming-teaching-project";
const PROMO = "../ai-programming-teaching-promo";
export const AI_PROGRAMMING_INPUTS = {
  answer: `${PROMO}/src/data/chat-answer.json`,
  capstones: `${PROMO}/src/data/capstones.json`,
  logo: `${SITE}/static/img/brand/logo.svg`,
  versions: `${SITE}/versions.json`,
  config: `${SITE}/docusaurus.config.js`,
  sidebars: `${SITE}/versioned_sidebars`,
  docs: `${SITE}/versioned_docs`,
  hero: `${SITE}/src/components/Home/Hero/index.js`,
  instructor: `${SITE}/src/components/Home/Instructor/index.js`,
  chat: `${SITE}/src/components/ChatWidget/ChatBox.js`,
  chatInput: `${SITE}/src/components/ChatWidget/ChatInput.js`,
  showcase: `${SITE}/src/pages/capstone-showcase.js`,
};

// The site's tokens (src/css/tokens.css); `code` is its Prism theme's ground.
const C = { cream: "#f5f1e4", white: "#ffffff", sand: "#e0dbce", ink: "#2c2e2a", muted: "#5d5f5b", stone: "#80827f", mist: "#d5d5d4", grass: "#8ed462", coral: "#ff705d", sun: "#f5e211", code: "#f6f8fa", comment: "#8a8a7c" };

export function buildAiProgrammingCard({ glyphs, root, project }) {
  const read = (key, rel = "") => readFileSync(`${root}/${AI_PROGRAMMING_INPUTS[key]}${rel}`, "utf8").replace(/\r\n/g, "\n");
  // A string the card shows must still be in the file it is quoted from.
  const quote = (key, text, rel) => {
    if (!read(key, rel).replace(/\s+/g, " ").includes(text)) throw new Error(`ai-programming card: "${text}" is no longer in ${AI_PROGRAMMING_INPUTS[key]}${rel || ""}`);
    return text;
  };
  const match = (text, re, what) => {
    const m = text.match(re);
    if (!m) throw new Error(`ai-programming card: ${what} no longer matches ${re}`);
    return m;
  };

  // ── The site's own words ───────────────────────────────────────────────────
  const config = read("config");
  const SITE_TITLE = match(config, /^\s*title: '(AI Programming)',/m, "the site title")[1];
  const SITE_URL = match(config, /^\s*url: 'https:\/\/([^']+)',/m, "the site URL")[1];
  const versions = JSON.parse(read("versions"));
  if (versions.length !== 5) throw new Error(`ai-programming card: expected five course versions, found ${versions.length}`);
  match(project.narrative.impactHeadline, /five course versions/, "the version count");
  const HOME = match(config, /lastVersion: '([^']+)'/, "the default version")[1];
  const FROM = "2025-summer"; // the version the page is on before the switch
  if (versions[0] !== HOME || !versions.includes(FROM)) throw new Error("ai-programming card: the version list no longer starts at the default class");
  const versionLabel = Object.fromEntries(versions.map((v) => [v, match(config, new RegExp(`'${v}': \\{\\s*label: '([^']+)'`), `the label of version ${v}`)[1]]));
  const nav = ["Tutorials", "Blog", "Message Board", "Capstone 2026"].map((l) => match(config, new RegExp(`label: '(${l})',`), `the navbar item "${l}"`)[1]);
  const locale = match(config, /en: \{\s*label: '(English)'/, "the locale label")[1];
  match(config, /autoCollapseCategories: true/, "the sidebar's auto-collapse");

  // The lesson count the home page states is the number of lesson files.
  const lessons = match(read("instructor"), /(\d+) lessons &times; 2 languages/, "the lesson count")[1];
  const count = (dir) => readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(`${dir}/${e.name}`) : /\.mdx?$/.test(e.name) ? 1 : 0), 0);
  const files = count(`${root}/${AI_PROGRAMMING_INPUTS.docs}`);
  if (files !== Number(lessons)) throw new Error(`ai-programming card: the site says ${lessons} lessons, versioned_docs holds ${files}`);

  // A version's sidebar as flat rows; a bare doc id takes its label from the doc.
  const doc = (v, id) => read("docs", `/version-${v}/${id}.mdx`);
  const front = (v, id, key) => (doc(v, id).match(new RegExp(`^${key}: "?(.+?)"?\\s*$`, "m")) || [])[1];
  const rows = (v, collapsed = []) => {
    const out = [];
    const walk = (items, depth, parent) => {
      for (const it of items) {
        if (typeof it === "string") out.push({ id: it, label: front(v, it, "sidebar_label") || front(v, it, "title"), depth, parent });
        else if (it.type === "doc") out.push({ id: it.id, label: it.label, depth, parent });
        else {
          const open = !collapsed.includes(it.label);
          out.push({ label: it.label, depth, caret: open ? "down" : "right" });
          if (open) walk(it.items, depth + 1, it.label);
        }
      }
    };
    walk(JSON.parse(read("sidebars", `/version-${v}-sidebars.json`)).tutorialSidebar, 0);
    return out;
  };
  const homeRows = rows(HOME, ["Programme"]);
  const fromRows = rows(FROM);
  const row = (list, id) => list.find((r) => r.id === id) || (() => { throw new Error(`ai-programming card: the sidebar no longer lists ${id}`); })();

  // The three lesson pages the stage opens.
  const P_FROM = "website/index";
  const P_OUTLINE = "curriculum-outline";
  const P_WEEK = "weeks/week-08-typst-cv";
  const h1 = (v, id) => match(doc(v, id), /^# (.+)$/m, `the heading of ${id}`)[1];
  const leads = (text, what) => { const l = [...text.matchAll(/^- \*\*(.+?)\*\*/gm)].map((m) => m[1]); if (l.length < 3) throw new Error(`ai-programming card: ${what} no longer lists its points`); return l; };
  const fromDoc = doc(FROM, P_FROM);
  const [, fromH2, fromLead, fromList] = match(fromDoc, /^## (Learning Objectives)\s+(After completing this course, you will be able to:)\s+((?:- .+\n)+)/m, "the 2025 lesson's objectives");
  const outlineDoc = doc(HOME, P_OUTLINE);
  const [, trackKey, trackValue] = match(outlineDoc, /^> \*\*(Track:)\*\* (.+)$/m, "the outline's track line");
  const [, outlineH2, outlineLead, outlineList] = match(outlineDoc, /^## (Track Goal)\s+(By the end of this 12-week track, .+ will be able to:)\s+((?:- .+\n)+)/m, "the outline's goal");
  const [, stepTitle, stepLead, stepCode] = match(doc(HOME, P_WEEK), /^#### (Step 2a — Install the Typst CLI)\s+(.+)\s+```bash\n([\s\S]*?)```/m, "the week 8 install step");
  const code = stepCode.trimEnd().split("\n");
  if (code.length !== 8) throw new Error("ai-programming card: the week 8 code block is no longer eight lines");

  // ── The film's bakes: the tutor's answer, the public showcase ──────────────
  const baked = JSON.parse(read("answer"));
  const [said, ...tail] = baked.answer.split("\n\n");
  const refs = [...tail.join("\n").matchAll(/— Reference: (.+?) \(versioned_docs\\version-([\w-]+)\\(.+?)\.mdx\)/g)].map((m) => ({ title: m[1], version: m[2], row: row(homeRows, m[3].replace(/\\/g, "/")) }));
  if (refs.length !== 2 || baked.contextNamespace !== HOME || refs.some((r) => r.version !== HOME)) throw new Error("ai-programming card: the baked tutor answer no longer cites two lessons of the default class");
  const showcaseSrc = read("showcase");
  const tracks = match(showcaseSrc, /const TRACKS = \[([^\]]+)\]/, "the showcase tracks")[1].split(",").map((s) => s.trim().replace(/^'|'$/g, ""));
  const capstones = JSON.parse(read("capstones")).projects.map(({ title, track }) => ({ title, track }));
  if (capstones.length !== 6 || capstones.some((c) => !tracks.includes(c.track))) throw new Error("ai-programming card: the showcase bake is no longer six projects on the site's tracks");

  // ── Timeline ───────────────────────────────────────────────────────────────
  const S = { pick: 0, lesson: 5.6, tutor: 10.6, showcase: 22.8 };
  const T = 27.6;
  const STILL = 21.5; // the tutor's finished answer is the still frame
  const AT = {
    menu: 1.05, hover: 2.3, picked: 2.9,
    open: 6.45, type: 7.0,
    chat: 11.35, ask: 11.95, sent: 13.6, think: 13.8, stream: 14.6, cite: 19.3, close: 22.3,
    gallery: 23.45, end: T - 0.05,
  };
  const p = (t) => pct(t, T, 3);
  const css = [];
  const named = new Map();
  const anim = (frames, ease = "linear") => {
    const key = `${frames}|${ease}`;
    if (!named.has(key)) {
      const name = `a${named.size.toString(36)}`;
      named.set(key, name);
      css.push(`@keyframes ${name}{${frames}}.${name}{animation:${name} ${T}s ${ease} infinite}`);
    }
    return named.get(key);
  };
  // Attributes for an element shown from a to b: the animation while it runs,
  // opacity="0" when the element is not part of the still frame.
  const still = (a, b) => (a <= STILL && STILL < b ? "" : ' opacity="0"');
  const vis = (a, b = T, fade = 0.2, dy = 0) => {
    const off = `opacity:0${dy ? `;transform:translateY(${dy}px)` : ""}`;
    const on = `opacity:1${dy ? ";transform:none" : ""}`;
    const head = a > 0 ? `0%,${p(a)}{${off}}${p(a + fade)}` : "0%";
    const body = b < T ? `,${p(b)}{${on}}${p(b + Math.min(fade, 0.2))},100%{${off}}` : `,100%{${on}}`;
    return ` class="${anim(head + body)}"${still(a, b)}`;
  };
  // The opposite: part of the picture except between a and b.
  const except = (a, b) => ` class="${anim(`0%,${p(a)}{opacity:1}${p(a + 0.15)},${p(b)}{opacity:0}${p(b + 0.15)},100%{opacity:1}`)}"`;
  // A row that types itself: a cover the colour of its ground steps off it.
  let clips = 0;
  const defs = [];
  const typed = (svg, { x, y, w, h, fill, at, dur, steps, until = T }) => {
    const id = `c${clips++}`;
    defs.push(`<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>`);
    const reset = until < T ? `${p(until)}{opacity:1;transform:translateX(${w + 3}px)}${p(until + 0.01)},100%{opacity:1;transform:translateX(0)}` : `100%{opacity:1;transform:translateX(${w + 3}px)}`;
    const cls = anim(`0%,${p(at)}{opacity:1;transform:translateX(0);animation-timing-function:steps(${steps},end)}${p(at + dur)},${reset}`);
    return `<g clip-path="url(#${id})">${svg}<g class="${cls}" opacity="0"><rect x="${x}" y="${y}" width="${w + 3}" height="${h}" fill="${fill}"/><rect x="${x}" y="${y + 2}" width="1.5" height="${h - 4}" fill="${C.ink}"/></g></g>`;
  };

  // ── The site's patterns ────────────────────────────────────────────────────
  const hair = (x, y, w, h, r, fill = C.white, stroke = C.mist) => `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
  const text = (s, font, size, x, y, fill = C.ink, more = {}) => glyphs.text(s, { font, size, x, y, fill, ...more });
  const width = (s, font, size, tracking = 0) => glyphs.measure(s, { font, size, tracking });
  // .mm-eyebrow: a white pill, hairline, muted spaced capitals
  const eyebrow = (label, x, y) => {
    const w = width(label.toUpperCase(), "medium", 10.5, 0.08) + 26;
    return hair(x, y, w, 24, 11.5) + text(label.toUpperCase(), "medium", 10.5, x + 13, y + 15.8, C.muted, { tracking: 0.08 });
  };
  // .mm-chip: 10px radius, hairline, ink text, an optional decorative dot
  const chip = (label, x, y, { dot, size = 10, h = 20, fill = "none" } = {}) => {
    const pad = dot ? 19 : 9;
    const w = width(label, "body", size) + pad + 9;
    return { w, svg: hair(x, y, w, h, 7, fill) + (dot ? `<circle cx="${x + 10.5}" cy="${y + h / 2}" r="2.6" fill="${dot}"/>` : "") + text(label, "body", size, x + pad, y + h / 2 + size * 0.36) };
  };
  // the site's icons are 24-unit stroked outlines
  const icon = (inner, x, y, size, stroke = C.ink, sw = 2) => `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const I = {
    chat: `<path d="${match(read("chat"), /<path d="(M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z)"/, "the chat icon")[1]}"/>`,
    close: '<path d="M18 6L6 18M6 6l12 12"/>',
    send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
    home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',
  };
  const chevron = (x, y, dir = "down", stroke = C.ink) => `<path d="${dir === "down" ? `M${x - 3} ${y - 1.5}l3 3 3-3` : `M${x - 1.5} ${y - 3}l3 3-3 3`}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  // a message bubble: one corner is tight, as the widget draws it
  const bubble = (x, y, w, h, tight, fill, stroke) => {
    const r = 12, s = 3;
    const br = tight === "br" ? s : r, bl = tight === "bl" ? s : r;
    return `<path d="M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - r - br}a${br} ${br} 0 0 1 ${-br} ${br}h${-(w - br - bl)}a${bl} ${bl} 0 0 1 ${-bl} ${-bl}v${-(h - r - bl)}a${r} ${r} 0 0 1 ${r} ${-r}z" fill="${fill}"${stroke ? ` stroke="${stroke}"` : ""}/>`;
  };

  // ── Identity, on the site's cream, above a slip of its sunshine footer ─────
  const X = CARD.panel;
  const logoFile = match(read("logo"), /<svg[^>]*viewBox="0 0 64 64"[^>]*>([\s\S]*)<\/svg>/, "the logo file")[1];
  const logo = (x, y, size) => `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none">${logoFile}</svg>`;
  quote("hero", "Learn to build with AI.");
  const figure = (value, name, x) => text(value, "medium", 30, x - 1, 304, C.ink, { tracking: -0.04 }) + text(name, "body", 12.5, x, 323, C.muted);
  const url = { w: width(SITE_URL, "medium", 12.5) + 26 };
  const identity =
    `<rect width="${X}" height="${CARD.h}" fill="${C.cream}"/>` +
    eyebrow(quote("hero", "AI Programming Education"), 40, 28) +
    logo(40, 70, 46) +
    text(SITE_TITLE, "medium", 27, 99, 102.5, C.ink, { tracking: -0.03 }) +
    text("Learn to build", "medium", 60, 37, 188, C.ink, { tracking: -0.06 }) +
    text("with AI.", "medium", 60, 37, 245, C.ink, { tracking: -0.06 }) +
    figure(String(versions.length), "course versions", 40) +
    figure(lessons, "lessons", 168) +
    hair(X - 40 - url.w, 296, url.w, 30, 15) +
    text(SITE_URL, "medium", 12.5, X - 40 - url.w + 13, 315.5) +
    `<rect y="348" width="${X}" height="12" fill="${C.sun}"/>`;

  // ── The page frame: navbar pill, sidebar column, lesson column ─────────────
  const L = X + 20;
  const R = CARD.w - 20;
  const NAV = { y: 14, h: 38 };
  const SB = { x: L, r: L + 240, y: 64, row: 18.6 };
  const PG = { x: SB.r + 20, y: 62 };
  const mid = NAV.y + NAV.h / 2;

  let nx = L + 42;
  const navbar = [hair(L, NAV.y, R - L, NAV.h, NAV.h / 2), logo(L + 11, mid - 11, 22), text(SITE_TITLE, "medium", 12.5, nx, mid + 4.4, C.ink, { tracking: -0.01 })];
  nx += width(SITE_TITLE, "medium", 12.5) + 16;
  const navAt = {};
  for (const l of nav) {
    navAt[l] = { x: nx, w: width(l, "medium", 11) };
    navbar.push(text(l, "medium", 11, nx, mid + 4, C.ink));
    nx += navAt[l].w + 14;
  }
  // .navbar__link--active: a 1.5px rule under the section the page is in
  const under = (l) => `<rect x="${navAt[l].x}" y="${mid + 9}" width="${navAt[l].w}" height="1.5" fill="${C.ink}"/>`;
  navbar.push(`<g${except(AT.gallery, AT.end)}>${under(nav[0])}</g>`, `<g${vis(AT.gallery, AT.end, 0.15)}>${under(nav[3])}</g>`);
  const VER = { x: nx };
  const trigger = (v) => text(versionLabel[v], "medium", 11, VER.x, mid + 4, C.ink) + chevron(VER.x + width(versionLabel[v], "medium", 11) + 9, mid + 0.5);
  const fromW = width(versionLabel[FROM], "medium", 11) + 18;
  navbar.push(trigger(HOME), `<g${vis(0, AT.picked, 0.12)}><rect x="${VER.x - 2}" y="${NAV.y + 4}" width="${fromW + 4}" height="${NAV.h - 8}" fill="${C.white}"/>${trigger(FROM)}</g>`);
  navbar.push(text(locale, "medium", 11, R - 30, mid + 4, C.ink, { anchor: "end" }) + chevron(R - 21, mid + 0.5));
  if (VER.x + fromW > R - 30 - width(locale, "medium", 11) - 12) throw new Error("ai-programming card: the navbar no longer fits its pill");

  // .dropdown__menu: a white card of 10px rows; the current version is sandstone
  const MENU = { x: VER.x - 12, y: NAV.y + NAV.h + 4, row: 23 };
  MENU.w = Math.max(...versions.map((v) => width(versionLabel[v], "body", 11))) + 38;
  MENU.h = versions.length * MENU.row + 12;
  const menuRow = (n, fill) => `<rect x="${MENU.x + 6}" y="${MENU.y + 6 + n * MENU.row}" width="${MENU.w - 12}" height="${MENU.row}" rx="8" fill="${fill}"/>`;
  const menu =
    `<g${vis(AT.menu, AT.picked, 0.2, -5)}>` +
    hair(MENU.x, MENU.y, MENU.w, MENU.h, 14) +
    menuRow(versions.indexOf(FROM), C.sand) +
    `<g${vis(AT.hover, AT.picked, 0.12)}>${menuRow(0, C.sand)}</g>` +
    versions.map((v, n) => text(versionLabel[v], "body", 11, MENU.x + 18, MENU.y + 6 + n * MENU.row + 15.3)).join("") +
    "</g>";

  // .menu__link: 12px-radius rows; the active one is white with a green rule
  const rowY = (n) => SB.y + n * SB.row;
  const rowX = (r) => SB.x + 10 + r.depth * 12;
  const rowText = (r, n, font) => {
    const room = SB.r - 12 - (r.caret ? 14 : 0) - rowX(r);
    const size = Math.min(10.5, (10.5 * room) / width(r.label, font, 10.5));
    if (size < 9.4) throw new Error(`ai-programming card: the sidebar row "${r.label}" does not fit`);
    return text(r.label, font, size, rowX(r), rowY(n) + 12.6);
  };
  const MAX_ROWS = 14;
  const sidebar = (list) => {
    if (list.length > MAX_ROWS) list = list.slice(0, MAX_ROWS);
    return list.map((r, n) => rowText(r, n, "body") + (r.caret ? chevron(SB.r - 16, rowY(n) + 9, r.caret, C.muted) : "")).join("");
  };
  const active = (list, r) => {
    const n = list.indexOf(r);
    if (n < 0 || n >= MAX_ROWS) throw new Error(`ai-programming card: "${r.label}" is not among the sidebar rows shown`);
    const x = rowX(r) - 9;
    return `<rect x="${x}" y="${rowY(n)}" width="${SB.r - 8 - x}" height="${SB.row - 1}" rx="7" fill="${C.white}"/><rect x="${x}" y="${rowY(n)}" width="3" height="${SB.row - 1}" rx="1.5" fill="${C.grass}"/>${rowText(r, n, "medium")}`;
  };
  if (homeRows.length > MAX_ROWS) throw new Error("ai-programming card: the default class's sidebar no longer fits");
  const cover = (x, w) => `<rect x="${x}" y="${NAV.y + NAV.h + 4}" width="${w}" height="${CARD.h}" fill="${C.cream}"/>`;
  // a lesson the tutor cited: its row gains the chip's green dot
  const cited = refs.map((r, n) => `<circle${vis(AT.cite + 0.1 + n * 0.3, AT.close + 0.2)} cx="${SB.r - 17}" cy="${rowY(homeRows.indexOf(r.row)) + 9}" r="3.4" fill="${C.grass}" stroke="${C.ink}" stroke-width="1"/>`).join("");

  // A lesson page: breadcrumb chips, the heading, then whatever the lesson has.
  const PW = R - PG.x;
  const crumbs = (trail) => {
    let x = PG.x + 22;
    const out = [icon(I.home, PG.x, PG.y + 2.5, 13, C.muted)];
    trail.forEach((label, n) => {
      const last = n === trail.length - 1;
      const w = width(label, "body", 10) + 14;
      out.push(chevron(x - 5, PG.y + 9, "right", C.stone));
      if (last) out.push(`<rect x="${x + 3}" y="${PG.y}" width="${w}" height="18" rx="6" fill="${C.sand}"/>`);
      out.push(text(label, "body", 10, x + 10, PG.y + 12.6, last ? C.ink : C.muted));
      x += w + 12;
    });
    return out.join("");
  };
  const heading = (s, y) => {
    const size = Math.min(23, (23 * PW) / width(s, "medium", 23, -0.02));
    return text(s, "medium", size, PG.x - 1, y, C.ink, { tracking: -0.02 });
  };
  // .markdown h2: a hairline above it
  const h2 = (s, y) => `<rect x="${PG.x}" y="${y - 25}" width="${PW}" height="1" fill="${C.mist}"/>` + text(s, "medium", 15.5, PG.x, y, C.ink, { tracking: -0.01 });
  const bullets = (items, y, limit) => {
    const out = [];
    for (const item of items) {
      const lines = wrap(glyphs, item, { font: "medium", size: 11 }, PW - 16);
      if (y + (lines.length - 1) * 16 > limit) break;
      out.push(`<circle cx="${PG.x + 4}" cy="${y - 3.8}" r="1.8" fill="${C.ink}"/>`);
      lines.forEach((l, k) => out.push(text(l, "medium", 11, PG.x + 14, y + k * 16)));
      y += lines.length * 16 + 3;
    }
    return out.join("");
  };

  const fromPage =
    crumbs([row(fromRows, P_FROM).parent, row(fromRows, P_FROM).label]) +
    heading(h1(FROM, P_FROM), 112) +
    h2(fromH2, 163) +
    text(fromLead, "body", 11, PG.x, 186) +
    bullets(leads(fromList, "the 2025 lesson"), 208, 336);
  const outlineLines = wrap(glyphs, outlineLead, { font: "body", size: 11 }, PW);
  const outlinePage =
    crumbs([row(homeRows, P_OUTLINE).label]) +
    heading(h1(HOME, P_OUTLINE), 112) +
    // .markdown blockquote: a 3px green rule
    `<rect x="${PG.x}" y="124" width="3" height="18" rx="1.5" fill="${C.grass}"/>` +
    text(trackKey, "medium", 11, PG.x + 13, 137, C.muted) +
    text(trackValue, "body", 11, PG.x + 17 + width(trackKey, "medium", 11), 137, C.muted) +
    h2(outlineH2, 181) +
    outlineLines.map((l, k) => text(l, "body", 11, PG.x, 203 + k * 16)).join("") +
    bullets(leads(outlineList, "the outline's goal"), 209 + outlineLines.length * 16, 336);

  // The week's install step: comments stand, the three commands type in.
  const CODE = { y: 176, lh: 15.4, pad: 14 };
  CODE.h = code.length * CODE.lh + 20;
  let typing = AT.type;
  const codeLines = code.map((line, n) => {
    const y = CODE.y + 23 + n * CODE.lh;
    if (!line) return "";
    if (line.startsWith("#")) return text(line, "mono", 10.5, PG.x + CODE.pad, y, C.comment);
    const w = width(line, "mono", 10.5);
    const dur = line.length * 0.028;
    const out = typed(text(line, "mono", 10.5, PG.x + CODE.pad, y, C.ink), { x: PG.x + CODE.pad - 1, y: y - 11, w: w + 4, h: 15, fill: C.code, at: typing, dur, steps: line.length });
    typing += dur + 0.3;
    return out;
  });
  const week = row(homeRows, P_WEEK);
  const weekPage =
    crumbs([week.parent, week.label]) +
    heading(h1(HOME, P_WEEK), 112) +
    text(stepTitle, "medium", 14, PG.x, 142, C.ink, { tracking: -0.01 }) +
    text(stepLead, "body", 11, PG.x, 162) +
    hair(PG.x, CODE.y, PW, CODE.h, 12, C.code) +
    codeLines.join("");
  if (CODE.y + CODE.h > 340 || typing > S.tutor) throw new Error("ai-programming card: the week 8 code block no longer fits its scene");

  // ── The AI tutor: the chat widget, open over the page ──────────────────────
  const CHAT = { x: R - 356, y: NAV.y, w: 356, h: CARD.h - 2 * NAV.y, head: 32, foot: 38 };
  const MSG = { x: CHAT.x + 12, r: CHAT.x + CHAT.w - 12, y: CHAT.y + CHAT.head, b: CHAT.y + CHAT.h - CHAT.foot };
  const INPUT = { x: CHAT.x + 12, y: MSG.b + 6, w: CHAT.w - 24 - 34, h: 26 };
  const SEND = { cx: CHAT.x + CHAT.w - 12 - 13, cy: INPUT.y + 13 };
  const question = baked.question;
  const qW = width(question, "body", 10.5);
  const asked = { w: qW + 24, h: 26, y: MSG.y + 10 };
  const BUB = { x: MSG.x, y: asked.y + asked.h + 8, pad: 12, lh: 15.6, size: 11.2 };
  BUB.w = MSG.r - MSG.x - 12;
  const answer = wrap(glyphs, said, { font: "body", size: BUB.size }, BUB.w - 2 * BUB.pad);
  const bubH = (n) => n * BUB.lh + 15;
  const lineT = (n) => AT.stream + n * ((AT.cite - 0.5 - AT.stream) / answer.length);
  const lineDur = lineT(1) - lineT(0);
  defs.push(`<clipPath id="say"><rect x="${BUB.x + 1}" y="${BUB.y + 1}" width="${BUB.w - 2}" height="${bubH(answer.length) - 2}"/></clipPath>`);
  // the bubble grows a line at a time; each line is uncovered as it arrives
  const grown = answer.map((_, n) => `<g${vis(lineT(n), n === answer.length - 1 ? T : lineT(n + 1), 0.01)}>${bubble(BUB.x + 0.5, BUB.y + 0.5, BUB.w - 1, bubH(n + 1) - 1, "bl", C.white, C.mist)}</g>`).join("");
  const lines = answer
    .map((l, n) => {
      const y = BUB.y + 19 + n * BUB.lh;
      const w = BUB.w - 2 * BUB.pad;
      const slide = anim(`0%,${p(lineT(n) - 0.01)}{opacity:0;transform:translateX(0)}${p(lineT(n))}{opacity:1;transform:translateX(0);animation-timing-function:steps(14,end)}${p(lineT(n) + lineDur * 0.85)},100%{opacity:1;transform:translateX(${w + 14}px)}`);
      return `<g${vis(lineT(n), T, 0.01)}>${text(l, "body", BUB.size, BUB.x + BUB.pad, y)}</g><rect class="${slide}" opacity="0" x="${BUB.x + BUB.pad - 1}" y="${y - 11.5}" width="${w + 2}" height="${BUB.lh}" fill="${C.white}"/>`;
    })
    .join("");
  const said1 = `${grown}<g clip-path="url(#say)">${lines}</g>`;
  let chipY = BUB.y + bubH(answer.length) + 6;
  const cites = refs.map((r, n) => {
    const c = chip(r.title, BUB.x, chipY, { dot: C.grass, fill: C.white, size: 10.5, h: 21 });
    if (BUB.x + c.w > MSG.r) throw new Error(`ai-programming card: the reference chip "${r.title}" does not fit`);
    const out = `<g${vis(AT.cite + n * 0.3, T, 0.3, 5)}>${c.svg}</g>`;
    chipY += 25;
    return out;
  });
  if (chipY - 4 > MSG.b - 5) throw new Error(`ai-programming card: the tutor's answer (${answer.length} lines) no longer fits the chat`);
  const placeholder = quote("chatInput", "Type your question...");
  const welcome = { cy: (MSG.y + MSG.b) / 2 };
  const chat =
    `<g class="${anim(`0%,${p(AT.chat)}{opacity:0;transform:translateY(16px)}${p(AT.chat + 0.3)},${p(AT.close)}{opacity:1;transform:none}${p(AT.close + 0.25)},100%{opacity:0;transform:translateY(16px)}`, "ease-out")}">` +
    `<clipPath id="box"><rect x="${CHAT.x}" y="${CHAT.y}" width="${CHAT.w}" height="${CHAT.h}" rx="18"/></clipPath>` +
    `<g clip-path="url(#box)"><rect x="${CHAT.x}" y="${CHAT.y}" width="${CHAT.w}" height="${CHAT.h}" fill="${C.white}"/><rect x="${CHAT.x}" y="${MSG.y}" width="${CHAT.w}" height="${MSG.b - MSG.y}" fill="${C.cream}"/>` +
    `<rect x="${CHAT.x}" y="${MSG.y - 0.5}" width="${CHAT.w}" height="1" fill="${C.mist}"/><rect x="${CHAT.x}" y="${MSG.b - 0.5}" width="${CHAT.w}" height="1" fill="${C.mist}"/></g>` +
    `<rect x="${CHAT.x + 0.5}" y="${CHAT.y + 0.5}" width="${CHAT.w - 1}" height="${CHAT.h - 1}" rx="17.5" fill="none" stroke="${C.mist}"/>` +
    icon(I.chat, CHAT.x + 14, CHAT.y + 9.5, 13) +
    text(quote("chat", "AI Assistant"), "medium", 12, CHAT.x + 33, CHAT.y + 20.5) +
    `<circle cx="${CHAT.x + 40 + width("AI Assistant", "medium", 12)}" cy="${CHAT.y + 16.5}" r="3" fill="${C.grass}"/>` +
    icon(I.close, CHAT.x + CHAT.w - 27, CHAT.y + 9.5, 13, C.muted) +
    // the empty thread's greeting, until the question is sent
    `<g${vis(AT.chat, AT.sent, 0.15)}>${icon(I.smile, CHAT.x + CHAT.w / 2 - 15, welcome.cy - 46, 30, C.grass, 1.5)}${text(quote("chat", "Hi! I'm your AI Assistant"), "medium", 13, CHAT.x + CHAT.w / 2, welcome.cy + 6, C.ink, { anchor: "middle" })}${text(quote("chat", "Feel free to ask me anything about AI programming!"), "body", 10.5, CHAT.x + CHAT.w / 2, welcome.cy + 24, C.muted, { anchor: "middle" })}</g>` +
    `<g${vis(AT.sent, T, 0.2, 5)}>${bubble(MSG.r - asked.w, asked.y, asked.w, asked.h, "br", C.sand)}${text(question, "body", 10.5, MSG.r - asked.w + 12, asked.y + 17)}</g>` +
    // .typingIndicator: two green dots while the answer is on its way
    `<g${vis(AT.think, AT.stream, 0.12)}>${bubble(BUB.x + 0.5, BUB.y + 0.5, 43, 25, "bl", C.white, C.mist)}<circle cx="${BUB.x + 17}" cy="${BUB.y + 13}" r="3" fill="${C.grass}"/><circle cx="${BUB.x + 27}" cy="${BUB.y + 13}" r="3" fill="${C.grass}"/></g>` +
    said1 +
    cites.join("") +
    // .input: a sandstone pill with a green ring while it has focus
    hair(INPUT.x, INPUT.y, INPUT.w, INPUT.h, 13, C.sand) +
    `<g${except(AT.ask, AT.sent)}>${text(placeholder, "body", 10.5, INPUT.x + 12, INPUT.y + 17, C.muted)}</g>` +
    `<g${vis(AT.ask - 0.05, AT.sent, 0.1)}><rect x="${INPUT.x + 1}" y="${INPUT.y + 1}" width="${INPUT.w - 2}" height="${INPUT.h - 2}" rx="12" fill="${C.sand}" stroke="${C.grass}" stroke-width="2"/>` +
    typed(text(question, "body", 10.5, INPUT.x + 12, INPUT.y + 17), { x: INPUT.x + 11, y: INPUT.y + 5, w: qW + 4, h: 16, fill: C.sand, at: AT.ask + 0.1, dur: 1.1, steps: question.length, until: AT.sent }) +
    "</g>" +
    // .sendButton: sandstone while there is nothing to send, coral when there is
    `<circle cx="${SEND.cx}" cy="${SEND.cy}" r="13" fill="${C.sand}"/>${icon(I.send, SEND.cx - 7, SEND.cy - 6.5, 13, C.muted)}` +
    `<g${vis(AT.ask + 0.2, AT.sent, 0.12)}><circle cx="${SEND.cx}" cy="${SEND.cy}" r="13" fill="${C.coral}"/>${icon(I.send, SEND.cx - 7, SEND.cy - 6.5, 13, C.ink)}</g>` +
    "</g>";
  // .toggleButton: the green circle the widget opens from
  const TOGGLE = { cx: R - 19, cy: CARD.h - 14 - 19 };
  const toggle = `<g${except(AT.gallery - 0.1, AT.end)}><circle cx="${TOGGLE.cx}" cy="${TOGGLE.cy}" r="18.5" fill="${C.grass}" stroke="${C.mist}"/>${icon(I.chat, TOGGLE.cx - 8, TOGGLE.cy - 7.5, 16)}</g>`;

  // ── The capstone showcase: its hero, then the project cards ────────────────
  const GRID = { y: 136, gap: 12, h: 86 };
  GRID.w = (R - L - 2 * GRID.gap) / 3;
  const visit = quote("showcase", "Visit site");
  const showcase =
    `<g${vis(AT.gallery, AT.end, 0.18)}>` +
    cover(X + 1, CARD.w - X) +
    eyebrow(match(showcaseSrc, /message: '(Live Showcase)'/, "the showcase eyebrow")[1], L, 62) +
    text(quote("showcase", "TECHNEST 2026 Capstone Showcase"), "medium", 27, L - 1, 120, C.ink, { tracking: -0.05 }) +
    capstones
      .map((c, n) => {
        const x = L + (n % 3) * (GRID.w + GRID.gap);
        const y = GRID.y + Math.floor(n / 3) * (GRID.h + GRID.gap);
        const pill = width(visit, "medium", 10) + 20;
        return (
          `<g${vis(AT.gallery + 0.3 + n * 0.16, AT.end, 0.3, 7)}>` +
          hair(x, y, GRID.w, GRID.h, 16) +
          text(c.title, "medium", 16.5, x + 16, y + 32, C.ink, { tracking: -0.01 }) +
          // .trackPill: an mm-chip with one grey dot
          chip(c.track, x + 16, y + 50, { dot: C.stone }).svg +
          hair(x + GRID.w - 16 - pill, y + 50, pill, 20, 10) +
          text(visit, "medium", 10, x + GRID.w - 16 - pill / 2, y + 63.6, C.ink, { anchor: "middle" }) +
          "</g>"
        );
      })
      .join("") +
    "</g>";

  // ── The cursor, the scene ticks, the dip that hides the loop's seam ────────
  const at = {
    rest: [PG.x + 250, 236],
    version: [VER.x + fromW / 2, mid + 3],
    option: [MENU.x + 74, MENU.y + 6 + MENU.row / 2 + 2],
    week: [SB.x + 132, rowY(homeRows.indexOf(week)) + 10],
    toggle: [TOGGLE.cx, TOGGLE.cy + 2],
    input: [INPUT.x + 96, INPUT.y + 15],
    send: [SEND.cx, SEND.cy + 2],
    capstone: [navAt[nav[3]].x + navAt[nav[3]].w / 2, mid + 3],
  };
  // [time, place, shown]; a click is a ring at the place the cursor rests on
  const path = [
    [0, "rest", 1], [0.3, "rest", 1], [0.9, "version", 1], [1.6, "version", 1], [AT.hover, "option", 1], [5.3, "option", 1],
    [6.2, "week", 1], [S.tutor, "week", 1], [11.15, "toggle", 1], [11.4, "toggle", 1], [11.85, "input", 1], [13.15, "input", 1], [13.4, "send", 1],
    [13.9, "send", 1], [14.2, "send", 0], [AT.close, "send", 0], [AT.close + 0.3, "send", 1], [23.2, "capstone", 1], [26.4, "capstone", 1], [T - 0.4, "rest", 1], [T, "rest", 1],
  ];
  const clicks = [[1.0, "version"], [2.75, "option"], [AT.open - 0.08, "week"], [11.28, "toggle"], [AT.ask - 0.07, "input"], [AT.sent - 0.07, "send"], [23.35, "capstone"]];
  const cursor =
    clicks.map(([t, where]) => `<circle${vis(t, t + 0.22, 0.08)} cx="${at[where][0]}" cy="${at[where][1]}" r="9" fill="${C.ink}" fill-opacity=".1" stroke="${C.ink}" stroke-opacity=".4"/>`).join("") +
    `<path class="${anim(path.map(([t, where, o]) => `${p(t)}{opacity:${o};transform:translate(${at[where][0].toFixed(1)}px,${at[where][1].toFixed(1)}px);animation-timing-function:cubic-bezier(.4,0,.2,1)}`).join(""))}" opacity="0" d="M0 0v15.5l4.2-3.6 2.7 6.2 2.6-1.1-2.7-6.1h5.6z" fill="${C.ink}" stroke="${C.white}" stroke-width="1.2" stroke-linejoin="round"/>`;
  const scenes = Object.values(S);
  const ticks = scenes
    .map((a, n) => {
      const cx = L + 5 + n * 13;
      return `<circle cx="${cx}" cy="${CARD.h - 19}" r="3.5" fill="${C.sand}"/><circle${vis(a, scenes[n + 1] ?? T, 0.2)} cx="${cx}" cy="${CARD.h - 19}" r="3.5" fill="${C.ink}"/>`;
    })
    .join("");
  const dip = `<rect class="${anim(`0%{opacity:1}${p(0.3)},${p(T - 0.4)}{opacity:0}${p(T - 0.08)},100%{opacity:1}`)}" opacity="0" x="${X + 1}" y="${NAV.y + NAV.h + 4}" width="${CARD.w - X}" height="${CARD.h}" fill="${C.cream}"/>`;

  const stage =
    `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${C.cream}"/>` +
    `<rect x="${SB.r - 0.5}" y="${NAV.y + NAV.h + 6}" width="1" height="${CARD.h}" fill="${C.mist}"/>` +
    // the default class: its sidebar, and the week 8 lesson under the others
    sidebar(homeRows) +
    `<g${vis(0, AT.open, 0.12)}>${active(homeRows, row(homeRows, P_OUTLINE))}</g>` +
    `<g${vis(AT.open, T, 0.12)}>${active(homeRows, week)}</g>` +
    cited +
    weekPage +
    `<g${vis(0, AT.open + 0.05, 0.15)}>${cover(PG.x - 8, CARD.w)}${outlinePage}</g>` +
    // the 2025 class the page starts on, until the version is picked
    `<g${vis(0, AT.picked + 0.05, 0.15)}>${cover(X + 1, SB.r - X - 2)}${cover(PG.x - 8, CARD.w)}${sidebar(fromRows)}${active(fromRows, row(fromRows, P_FROM))}${fromPage}</g>` +
    showcase +
    ticks +
    navbar.join("") +
    toggle +
    chat +
    menu +
    dip +
    cursor;

  return {
    svg: card({
      title: `AI Programming, the public website at ${SITE_URL} where beginners learn to build software with AI. The card plays its docs site: switching between ${versions.length} course versions, opening a lesson whose code types itself, the AI tutor answering “${question}” and citing the two lessons it drew on, and the capstone showcase of student projects.`,
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body: `${stage}${identity}<rect x="${X - 0.5}" width="1" height="${CARD.h}" fill="${C.mist}"/>`,
      radius: 20,
    }),
    facts: { scenes: scenes.length, versions: versions.length, lessons: Number(lessons), answerLines: answer.length, projects: capstones.length, loop: `${T.toFixed(1)}s` },
  };
}
