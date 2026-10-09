// Tam-AI-Ti card. A te reo Māori AI coach for financial wellbeing; the stage
// shows five parts of the product at work, each as components of its own
// interface redrawn in vectors: the day's whakataukī and the morning check-in,
// the maramataka with one night opened, a goal's action plan and its savings,
// the hauora journal filled in by voice beside the Te Whare Tapa Whā house,
// and the permissions a supporter is given.
//
// It is drawn in the product's own design system (read from the product's
// checkout, which is not public): white cards on its mint ground, the
// "Pounamu Green" primary and the Tailwind families its screens use, Inter and
// nothing else, the product's own lockup file (crescent mark over the
// wordmark), its lucide icons and its moon-phase drawings.
//
// What is on it, and where it comes from:
//   - every interface string is read at build time, never retyped: the
//     product's i18n tables, lunar table, moon drawings, proverb and example
//     journal text as baked into Chan's Tam-AI-Ti product film
//     (tamaiti-promo-studio, replica/data/product.generated.json), the strings
//     the product hard-codes (the film's replica/strings.ts, which its own
//     gate checks against the product), and the house and its five fields from
//     the product's manual journal page;
//   - the person, the goal, the amounts and the supporters are the film's
//     fictional demo persona (replica/demo.ts); the card says so once, in the
//     film's disclosure line, shortened by the three words that name the film;
//   - the scene labels are the film's cleared eyebrows, the headline is the
//     product's own description of itself, and the eyebrow and the two
//     language chips are the career database's (projects[tam-ai-ti]).
// It keeps the film's constraints (its docs/decisions.md): no real user's
// data; no outcome, speed or advice claim; te reo Māori only as the product
// spells it, macrons included (where the product leaves one out, so does the
// card); no motif beyond the product's own mark; no AI output the product does
// not script. Emoji cannot be outlined, so the five mood faces are drawn and
// the other emoji are left out.
//
// The film's sources and the product's files are NOT in this repo
// (TAM_AI_TI_INPUTS); where one is absent the card is not rebuilt and the
// committed SVG stands.
import { readFileSync } from "node:fs";

import { wrap } from "../lib/svg-card/film.mjs";
import { CARD, card, pct } from "../lib/svg-card/shell.mjs";

// Three of the product's four weights: its medium (500) is set in the semibold,
// which reads the same at this size and saves a face's worth of outlines.
export const TAM_AI_TI_FONTS = {
  ui: "scripts/cards/fonts/tam-ai-ti/Inter-400.ttf",
  uiSemi: "scripts/cards/fonts/tam-ai-ti/Inter-600.ttf",
  uiBold: "scripts/cards/fonts/tam-ai-ti/Inter-700.ttf",
};
export const TAM_AI_TI_INPUTS = {
  copy: "../tamaiti-promo-studio/src/copy.ts",
  strings: "../tamaiti-promo-studio/src/replica/strings.ts",
  demo: "../tamaiti-promo-studio/src/replica/demo.ts",
  product: "../tamaiti-promo-studio/src/replica/data/product.generated.json",
  replicaUi: "../tamaiti-promo-studio/src/replica/ui.tsx",
  replicaCalendar: "../tamaiti-promo-studio/src/replica/screens/Maramataka.tsx",
  lockup: "../tam-ai-ti-web/public/tam-ai-ti-logo-with-brand.svg",
  house: "../tam-ai-ti-web/app/journal/manual/components/TeWhareHouse.tsx",
  houseFields: "../tam-ai-ti-web/app/journal/manual/config/field-definitions.ts",
};

// The product's tokens: its globals.css theme and the Tailwind families its
// utility classes resolve to (as listed in the film's replica/tokens.ts).
const C = {
  bg: "#ffffff", fg: "#0a0a0a", primary: "#10b981", primaryFg: "#fafafa", muted: "#f5f5f5", mutedFg: "#737373", border: "#e5e5e5",
  emerald50: "#ecfdf5", emerald200: "#a7f3d0", emerald600: "#059669", switchOff: "#d4d4d4",
  green: { 50: "#f0fdf4", 200: "#bbf7d0", 400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d", 800: "#166534" },
  blue: { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb" },
  yellow: { 50: "#fefce8", 200: "#fef08a", 500: "#eab308", 600: "#ca8a04" },
  gray: { 50: "#f9fafb", 200: "#e5e7eb", 300: "#d1d5db", 400: "#9ca3af", 500: "#6b7280", 600: "#4b5563", 700: "#374151", 800: "#1f2937" },
  amber: { 50: "#fffbeb", 200: "#fde68a", 300: "#fcd34d", 500: "#f59e0b", 900: "#78350f" },
  purple: { 500: "#a855f7" },
  red: { 500: "#ef4444", 600: "#dc2626" },
  indigo: { 50: "#eef2ff", 600: "#4f46e5" },
};

// The product's icons: lucide-react 0.544 (ISC), 24 px grid, stroked.
const ICON = {
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
  sparkles: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  brain: '<path d="M12 18V5"/><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"/><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"/><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.464"/><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.464"/><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77"/>',
  treePine: '<path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"/><path d="M12 22v-3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  mic: '<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  trendingUp: '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
  heart: '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>',
  award: '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
  messageSquare: '<path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/>',
  messageCircle: '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>',
  save: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
  circleCheck: '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  languages: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
};

// The scenes, in the film's order, each under the film's own eyebrow for it.
const SCENES = [
  { id: "dashboard", eyebrow: "Whakataukī", dur: 5.4 },
  { id: "maramataka", eyebrow: "Maramataka", dur: 5.4 },
  { id: "goals", eyebrow: "Whāinga", dur: 5.6 },
  { id: "journal", eyebrow: "Hauora", dur: 6.0 },
  { id: "whanau", eyebrow: "Whānau", dur: 5.2 },
];
// The frame a reader with motion off sees: the calendar with its night opened.
const STILL = 1;

// The product's own line about itself, broken as the film's hook breaks it.
const HOOK = ["Financial wellness", "that weaves Māori", "wisdom with AI."];

const read = (root, key) => readFileSync(`${root}/${TAM_AI_TI_INPUTS[key]}`, "utf8");
const fail = (what) => {
  throw new Error(`tam-ai-ti card: ${what}`);
};

function filmCopy(root) {
  const src = read(root, "copy");
  for (const c of SCENES) {
    const m = src.match(new RegExp(`${c.id}: line\\("${c.id}", "([^"]+)"`));
    if (!m) fail(`the film's copy.ts no longer has a "${c.id}" line in the expected shape`);
    // the eyebrow is te reo: it must be exactly the word this card was reviewed with
    if (m[1] !== c.eyebrow) fail(`the film's "${c.id}" eyebrow is now "${m[1]}", not "${c.eyebrow}"; review before rebuilding`);
  }
  const hook = src.match(/hook: line\("hook", undefined,\s*\[([^\]]+)\]/);
  if (!hook || [...hook[1].matchAll(/"([^"]+)"/g)].map((s) => s[1]).join("|") !== HOOK.join("|")) fail("the film's hook line changed");
  const disclosure = src.match(/landscape: \["(Interface recreated in code) for this film(\. Demo account and figures are illustrative\.)"\]/);
  if (!disclosure) fail("the film's disclosure line was not found in copy.ts in the expected words");
  const url = src.match(/url: "([^"]+)"/);
  if (!url) fail("the film's end-card URL was not found in copy.ts");
  return { disclosure: disclosure[1] + disclosure[2], url: url[1] };
}

// What the replica reads: the baked product data, the product's hard-coded
// strings, and the demo persona (a plain object literal once its casts go).
function replica(root) {
  const product = JSON.parse(read(root, "product"));
  const hard = Object.fromEntries([...read(root, "strings").matchAll(/^\s+(\w+): s\("((?:[^"\\]|\\.)*)",/gm)].map((m) => [m[1], JSON.parse(`"${m[2]}"`)]));
  const demoSrc = read(root, "demo").match(/export const DEMO = (\{[\s\S]*\}) as const;/);
  if (!demoSrc) fail("the film's demo.ts no longer exports DEMO as one object literal");
  const demo = new Function(`return (${demoSrc[1].replace(/ as const/g, "")})`)();
  const tr = (key, lang) => {
    const leaf = key.split(".").reduce((n, k) => n?.[k], product.i18n);
    if (typeof leaf?.[lang] !== "string") fail(`the product's i18n has no "${key}" (${lang})`);
    return leaf[lang];
  };
  const h = (key) => hard[key] ?? fail(`the film's strings.ts has no "${key}"`);
  if (!/lang === "mi" \? "MI" : "EN"/.test(read(root, "replicaUi"))) fail("the replica's language toggle no longer reads MI / EN");
  const weekdays = read(root, "replicaCalendar").match(/const WEEKDAYS = \[([^\]]+)\]/);
  if (!weekdays) fail("the replica's calendar no longer lists its weekdays");
  return { product, demo, tr, h, weekdays: [...weekdays[1].matchAll(/"(\w+)"/g)].map((m) => m[1]) };
}

// The Te Whare Tapa Whā house of the product's manual journal page: its line
// drawing, its words, and the five fields with the place each takes on it.
function whare(root) {
  const src = read(root, "house");
  const lines = [...src.matchAll(/<line x1="(\d+)" y1="(\d+)" x2="(\d+)" y2="(\d+)"/g)].map((m) => m.slice(1).map(Number));
  const door = src.match(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)"/);
  const title = src.match(/<h3[^>]*>\s*([^<]+?)\s*<\/h3>/);
  const name = src.match(/<div className="font-medium">([^<]+)<\/div>\s*<div className="text-xs">([^<]+)<\/div>/);
  if (lines.length !== 5 || !door || !title || !name || !/viewBox="0 0 400 400"/.test(src)) fail("the product's TeWhareHouse.tsx is not the drawing this card was laid out for");
  const defs = read(root, "houseFields");
  const fields = [...defs.matchAll(/key: '(\w+)',\s*title: '[^']*',\s*subtitle: '([^']*)',\s*maoriLabel: '([^']*)',[\s\S]*?position: '([\w-]+)',[\s\S]*?icon: '(\w+)'/g)]
    .map((m) => ({ key: m[1], subtitle: m[2], label: m[3], position: m[4], icon: m[5] }))
    .filter((f) => f.position !== "standalone");
  if (fields.map((f) => f.position).sort().join() !== "floor,left-roof,left-wall,right-roof,right-wall") fail("the product's hauora fields no longer take the five places of the house");
  return { lines, door: door.slice(1).map(Number), title: title[1], name: name[1], gloss: name[2], fields };
}

export function buildTamAiTiCard({ glyphs, root, project }) {
  const { disclosure, url } = filmCopy(root);
  const { product, demo, tr, h, weekdays } = replica(root);
  const house = whare(root);

  // ── Timeline ───────────────────────────────────────────────────────────────
  const starts = SCENES.map((_, i) => SCENES.slice(0, i).reduce((s, c) => s + c.dur, 0));
  const T = starts.at(-1) + SCENES.at(-1).dur;
  const p = (t) => pct(t, T, 3);
  const f = (v) => Number(v.toFixed(2));
  const EASE = "animation-timing-function:cubic-bezier(.3,.7,.2,1)";

  // One class per distinct set of keyframes; every element is authored in its
  // finished state and the keyframes hold it back earlier in the loop.
  const frames = new Map();
  const cls = (body) => {
    if (!frames.has(body)) frames.set(body, `k${frames.size.toString(36)}`);
    return ` class="${frames.get(body)}"`;
  };
  const on = (t, d = 0.25, from = "") => cls(`0%,${p(t)}{opacity:0${from ? `;transform:${from};${EASE}` : ""}}${p(t + d)},100%{opacity:1${from ? ";transform:none" : ""}}`);
  const off = (t, d = 0.2) => ` opacity="0"${cls(`0%,${p(t)}{opacity:1}${p(t + d)},100%{opacity:0}`)}`;
  const span = (a, b, d = 0.2) => ` opacity="0"${cls(`0%,${p(a)}{opacity:0}${p(a + d)},${p(b)}{opacity:1}${p(b + d)},100%{opacity:0}`)}`;
  const slide = (t, d, from) => cls(`0%,${p(t)}{transform:${from};${EASE}}${p(t + d)},100%{transform:none}`);
  // the same keyframes, later in the loop
  const later = (dt) => ` style="animation-delay:${(dt - T).toFixed(2)}s"`;

  // ── Drawing ────────────────────────────────────────────────────────────────
  const defs = [];
  const tx = (str, font, size, x, y, fill, more = {}) => glyphs.text(str, { font, size, x: f(x), y: f(y), fill, ...more });
  const width = (str, font, size) => glyphs.measure(str, { font, size });
  const rect = (x, y, w, hh, r, fill, stroke, more = "") =>
    `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(hh)}"${r ? ` rx="${r}"` : ""} fill="${fill}"${stroke ? ` stroke="${stroke}"` : ""}${more}/>`;
  // the product's Card: white, hairline border, a soft shadow
  const box = ({ x, y, w, h: hh }, r = 12) => rect(x, y + 1.5, w, hh, r, "#000", "", ' fill-opacity=".05"') + rect(x + 0.5, y + 0.5, w - 1, hh - 1, r, C.bg, C.border);
  // where a card will appear
  const ghost = ({ x, y, w, h: hh }) => rect(x + 0.5, y + 0.5, w - 1, hh - 1, 12, "none", C.emerald200, ' stroke-dasharray="4 4"');
  const icon = (name, x, y, size, colour, sw = 2) =>
    `<g transform="translate(${f(x)} ${f(y)}) scale(${f(size / 24)})" fill="none" stroke="${colour}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</g>`;
  // a pill sized to its text; `at` is its left edge, or its centre / right edge
  const pill = (str, at, y, { bg = C.muted, fg = C.fg, line = "", size = 9.5, hh = 16, pad = 7, font = "uiSemi", r = 5, anchor = "start" } = {}) => {
    const w = width(str, font, size) + 2 * pad;
    const x = anchor === "middle" ? at - w / 2 : anchor === "end" ? at - w : at;
    return { w, x, svg: rect(x + (line ? 0.5 : 0), y + (line ? 0.5 : 0), w - (line ? 1 : 0), hh - (line ? 1 : 0), r, bg, line) + tx(str, font, size, x + pad, y + hh / 2 + size * 0.36, fg) };
  };
  // a moon phase, from the product's own markup for that lunar day
  const moon = (day, x, y, size) => {
    const markup = product.maramataka.moons[String(day)] ?? fail(`the product has no moon drawing for lunar day ${day}`);
    // a hairline rim, so the full moon's pale disc holds on a white card
    return `<svg x="${f(x)}" y="${f(y)}" width="${size}" height="${size}" viewBox="0 0 50 50">${markup.replace(/><\/(circle|path)>/g, "/>")}<circle cx="25" cy="25" r="${f(25 - 20 / size)}" fill="none" stroke="${C.gray[400]}" stroke-width="${f(40 / size)}"/></svg>`;
  };
  const energy = (level) => {
    const fam = /text-(\w+)-600/.exec(product.maramataka.energyClass[level] ?? "")?.[1];
    if (!C[fam]?.[600]) fail(`the product's energy level "${level}" has no colour family this card knows`);
    return { fg: C[fam][600], bg: C[fam][50], line: C[fam][200] };
  };

  // Text that types itself: a cover the colour of the surface steps off it, one
  // character at a time, inside a clip the width of the line.
  const typed = (str, font, size, x, y, fill, bg, a, b, { italic = false } = {}) => {
    const w = f(width(str, font, size) + 3);
    const id = `c${defs.length.toString(36)}`;
    const top = f(y - size);
    defs.push(`<clipPath id="${id}"><rect x="${f(x - 1)}" y="${top}" width="${w + 1}" height="${f(size * 1.4)}"/></clipPath>`);
    const text = tx(str, font, size, x, y, fill);
    return (
      (italic ? `<g transform="translate(${f(x)} ${f(y)}) skewX(-9) translate(${f(-x)} ${f(-y)})">${text}</g>` : text) +
      `<g clip-path="url(#${id})"><g${cls(`0%,${p(a)}{transform:translateX(${-w - 1}px);animation-timing-function:steps(${[...str].length},end)}${p(b)},100%{transform:none}`)}>` +
      rect(x + w, top, w + 1, size * 1.4, 0, bg) +
      `<rect${span(a, b - 0.05, 0.02)} x="${f(x + w - 1.5)}" y="${f(top + 1)}" width="1.5" height="${f(size * 1.2)}" fill="${C.fg}"/>` +
      `</g></g>`
    );
  };
  // several lines typed one after another, each for its share of the time
  const typedLines = (lines, font, size, x, y, lh, fill, bg, a, b) => {
    const total = lines.join("").length;
    let t = a;
    return lines
      .map((l, n) => {
        const t1 = t + ((b - a) * l.length) / total;
        const out = typed(l, font, size, x, y + n * lh, fill, bg, t, t1);
        t = t1;
        return out;
      })
      .join("");
  };

  // The pointer (the replica's arrow) through [t, x, y] points, and a click.
  const pointer = (pts) => {
    const at = ([, x, y]) => `transform:translate(${f(x)}px,${f(y)}px)`;
    const body = `0%{${at(pts[0])}}${pts.map((q) => `${p(q[0])}{${at(q)};animation-timing-function:cubic-bezier(.4,0,.2,1)}`).join("")}100%{${at(pts.at(-1))}}`;
    return `<g${span(pts[0][0], pts.at(-1)[0], 0.2)}><g${cls(body)}><path transform="translate(-2.4 -1.6) scale(.8)" d="M3 2 L3 20 L8 15.5 L11.4 23.2 L14.4 21.9 L11 14.4 L18 14.2 Z" fill="#111" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></g></g>`;
  };
  const click = (t, x, y) =>
    `<circle opacity="0"${cls(`0%,${p(t)}{opacity:0;transform:scale(.3)}${p(t + 0.03)}{opacity:.9}${p(t + 0.45)},100%{opacity:0;transform:scale(1)}`)} style="transform-origin:${f(x)}px ${f(y)}px" cx="${f(x)}" cy="${f(y)}" r="15" fill="none" stroke="${C.primary}" stroke-width="1.5"/>`;

  // the product's Switch, drawn where it ends up; `flip` is when it gets there
  const toggle = (x, y, isOn, flip) => {
    const thumbX = x + (isOn ? 13 : 1);
    const thumb = `<circle${flip === undefined ? "" : slide(flip, 0.18, `translateX(${isOn ? -12 : 12}px)`)} cx="${f(thumbX + 7)}" cy="${f(y + 8)}" r="7" fill="#fff"/>`;
    const lit = flip === undefined ? (isOn ? "" : ' opacity="0"') : isOn ? on(flip, 0.18) : off(flip, 0.18);
    return rect(x, y, 28, 16, 8, C.switchOff) + `<rect${lit} x="${f(x)}" y="${f(y)}" width="28" height="16" rx="8" fill="${C.primary}"/>` + thumb;
  };

  // ── The stage's furniture ──────────────────────────────────────────────────
  const X = CARD.panel;
  const SX = X + 24;
  const SW = CARD.w - X - 48;
  const CY = 48;
  const CH = 272;
  const kicker = (word) => rect(SX, 24.5, 18, 2, 1, C.primary) + tx(word.toUpperCase(), "uiSemi", 10.5, SX + 26, 29.5, C.green[700], { tracking: 0.16 });
  const scene = (i, inner) => {
    const s = starts[i];
    const e = s + SCENES[i].dur;
    const shown = cls(`0%,${p(s)}{opacity:0}${p(s + 0.3)},${p(e - 0.3)}{opacity:1}${p(e)},100%{opacity:0}`);
    const tick = `<rect${i === STILL ? "" : ' opacity="0"'}${shown} x="${SX + SW - (SCENES.length - i) * 22 + 4}" y="24" width="18" height="3" rx="1.5" fill="${C.primary}"/>`;
    return `<g${i === STILL ? "" : ' opacity="0"'}${shown}>${kicker(SCENES[i].eyebrow)}${inner}</g>${tick}`;
  };

  // ── 1. The dashboard: the day's whakataukī, and the morning check-in ───────
  const dashboard = (t0) => {
    const o = [];
    const A = { x: SX, y: CY, w: 306, h: CH };
    const B = { x: SX + 320, y: CY, w: SW - 320, h: CH };
    const today = product.maramataka.days.find((d) => d.date === demo.today.iso) ?? fail("the demo's day is not in the product's lunar table");
    const quote = product.whakatauki.seed;
    o.push(box(A), box(B));

    // the app opens in te reo Māori, its default language
    o.push(tx(tr("dashboard.header.greeting", "mi"), "uiSemi", 20, A.x + 18, A.y + 37, C.fg), tx(tr("dashboard.header.tagline", "mi"), "ui", 11, A.x + 18, A.y + 54, C.mutedFg));
    o.push(rect(A.x + A.w - 18 - 46 + 0.5, A.y + 18.5, 45, 23, 6, C.bg, C.border), icon("languages", A.x + A.w - 18 - 39, A.y + 24, 12, C.fg), tx("MI", "uiSemi", 10, A.x + A.w - 18 - 22, A.y + 33.5, C.fg));
    const said = `“${quote.textMi}”`;
    if (width(said, "uiSemi", 14) > A.w - 36) fail("the whakataukī no longer fits one line of the dashboard card");
    o.push(typed(said, "uiSemi", 14, A.x + 18, A.y + 86, C.fg, C.bg, t0 + 0.5, t0 + 1.7, { italic: true }));
    const meaning = wrap(glyphs, quote.meaning, { font: "ui", size: 10 }, A.w - 36);
    if (meaning.length > 2) fail("the whakataukī's meaning no longer fits two lines");
    o.push(`<g${on(t0 + 1.7, 0.4)}>${tx(quote.textEn, "ui", 10.5, A.x + 18, A.y + 103, C.gray[600])}${meaning.map((l, n) => tx(l, "ui", 10, A.x + 18, A.y + 119 + n * 13, C.mutedFg)).join("")}</g>`);

    // the dashboard's "Today's Maramataka" card
    const M = { x: A.x + 14, y: A.y + 148, w: A.w - 28, h: 110 };
    const e = energy(today.energyLevel);
    o.push(rect(M.x + 0.5, M.y + 0.5, M.w - 1, M.h - 1, 9, "#fafafa", C.border));
    o.push(icon("moon", M.x + 12, M.y + 10, 12, C.green[600]), tx(h("todaysMaramataka"), "uiSemi", 11, M.x + 29, M.y + 20, C.fg));
    o.push(moon(today.cycleDay, M.x + 12, M.y + 31, 34), tx(today.name, "uiSemi", 13.5, M.x + 56, M.y + 44, C.green[600]));
    o.push(pill(today.energyLevel, M.x + 56, M.y + 50, { bg: e.bg, fg: e.fg, line: e.line, hh: 15, r: 7.5 }).svg);
    const full = pill(h("fullMoon"), M.x + 12, M.y + 73);
    o.push(full.svg, pill(h("highProductivity"), M.x + 12 + full.w + 5, M.y + 73, { bg: C.green[600], fg: "#fff" }).svg);
    o.push(tx(`${h("maramatakaDay")} ${today.cycleDay}/30`, "ui", 9.5, M.x + 12, M.y + 102, C.mutedFg), tx(`${today.cycleDaysRemaining} ${h("daysToNewCycle")}`, "ui", 9.5, M.x + M.w - 12, M.y + 102, C.mutedFg, { anchor: "end" }));

    // the check-in
    const L = B.x + 18;
    const W = B.w - 36;
    o.push(tx(`${h("howAreYou")} (${h("periodAta")})`, "uiSemi", 14, L, B.y + 32, C.fg));
    o.push(tx(`${h("morningEmoji").replace(/^[^A-Za-z]+/, "")}${h("checkIn")}`, "ui", 10, L, B.y + 47, C.mutedFg));
    o.push(tx(h("piropiro"), "uiSemi", 11, L, B.y + 68, C.fg));
    const MOODS = [["moodHoha", "moodVeryLow"], ["moodTakeo", "moodLow"], ["moodTapatahi", "moodNeutral"], ["moodPai", "moodGood"], ["moodWehi", "moodGreat"]];
    const tw = (W - 4 * 8) / 5;
    const tileY = B.y + 76;
    const tileX = (i) => L + i * (tw + 8);
    // the five faces the product shows as emoji, drawn: eyes, and a mouth per mood
    const mouths = ["M-4.5 5.5Q0 1.5 4.5 5.5", "M-4 5Q0 2.8 4 5", "M-3.8 4.2H3.8", "M-4.2 3Q0 6.8 4.2 3", "M-4.8 2.4Q0 8.6 4.8 2.4Z"];
    MOODS.forEach(([label, sub], i) => {
      const cx = tileX(i) + tw / 2;
      const lines = [...wrap(glyphs, h(label), { font: "uiSemi", size: 9.5 }, tw - 6).map((l) => [l, "uiSemi", 9.5, C.fg]), [h(sub), "ui", 9, C.mutedFg]];
      o.push(rect(tileX(i) + 0.5, tileY + 0.5, tw - 1, 77, 8, C.bg, C.border));
      o.push(
        `<g transform="translate(${f(cx)} ${tileY + 20})"><circle r="10.5" fill="${C.amber[300]}" stroke="${C.amber[500]}"/><circle cx="-3.6" cy="-2.6" r="1.3" fill="${C.amber[900]}"/><circle cx="3.6" cy="-2.6" r="1.3" fill="${C.amber[900]}"/>` +
          `<path d="${mouths[i]}" fill="${i === 4 ? C.amber[900] : "none"}" stroke="${C.amber[900]}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></g>`,
      );
      lines.forEach(([l, font, size, fill], n) => o.push(tx(l, font, size, cx, tileY + (lines.length > 2 ? 44 : 48) + n * 11.5, fill, { anchor: "middle" })));
    });
    const pick = demo.mood.pickIndex;
    const pickAt = t0 + 2.4;
    o.push(`<rect${on(pickAt, 0.15)} x="${f(tileX(pick) + 1)}" y="${tileY + 1}" width="${f(tw - 2)}" height="76" rx="7.5" fill="${C.primary}" fill-opacity=".1" stroke="${C.primary}" stroke-width="2"/>`);

    // the energy slider, dragged one step
    const slY = B.y + 187;
    const v0 = (demo.mood.energyFrom - 1) / 4;
    const v1 = (demo.mood.energyTo - 1) / 4;
    const dragA = t0 + 3.15;
    const dragB = t0 + 3.65;
    o.push(tx(h("energyLevel"), "uiSemi", 11, L, B.y + 175, C.fg));
    o.push(rect(L, slY - 2.5, W, 5, 2.5, C.muted));
    o.push(`<rect${cls(`0%,${p(dragA)}{transform:scaleX(${f(v0 / v1)});animation-timing-function:cubic-bezier(.4,0,.2,1)}${p(dragB)},100%{transform:none}`)} style="transform-origin:${f(L)}px 0" x="${f(L)}" y="${slY - 2.5}" width="${f(W * v1)}" height="5" rx="2.5" fill="${C.primary}"/>`);
    o.push(`<g${cls(`0%,${p(dragA)}{transform:translateX(${f(-W * (v1 - v0))}px);animation-timing-function:cubic-bezier(.4,0,.2,1)}${p(dragB)},100%{transform:none}`)}><circle cx="${f(L + W * v1)}" cy="${slY}" r="7" fill="${C.bg}" stroke="${C.primary}"/></g>`);
    [h("energyNgoikore"), h("moodLow"), h("energyOkay"), h("moodGood"), h("energyPakahukahu")].forEach((l, i) =>
      o.push(tx(l, "ui", 9.5, L + (W * i) / 4, B.y + 210, C.mutedFg, { anchor: i === 0 ? "start" : i === 4 ? "end" : "middle" })),
    );

    // Save, and the product's confirmation
    const saveAt = t0 + 4.3;
    const btnY = B.y + 224;
    const save = `${h("saveWord")}${h("morning")}${h("checkIn")}`;
    o.push(`<g${off(saveAt + 0.1)}>${rect(L + W / 2 - 110, btnY, 220, 30, 8, C.primary)}${tx(save, "uiSemi", 11.5, L + W / 2, btnY + 19, C.primaryFg, { anchor: "middle" })}</g>`);
    o.push(
      `<g${on(saveAt + 0.15, 0.3, "translateY(5px)")}>${rect(L + 0.5, btnY + 0.5, W - 1, 29, 8, C.green[50], C.green[200])}${icon("check", L + 11, btnY + 9, 12, C.green[600], 2.6)}` +
        `${tx(`${h("morning")} ${h("checkInSaved")}`, "ui", 11, L + 30, btnY + 19, C.green[800])}</g>`,
    );

    const mx = tileX(pick) + tw / 2;
    const my = tileY + 46;
    const sy = slY + 3;
    o.push(click(pickAt, mx, tileY + 38), click(saveAt, L + W / 2, btnY + 15));
    o.push(pointer([[t0 + 1.8, L + W - 30, B.y + 250], [t0 + 2.3, mx, my], [t0 + 2.6, mx, my], [t0 + 3.05, L + W * v0, sy], [dragA, L + W * v0, sy], [dragB, L + W * v1, sy], [t0 + 3.8, L + W * v1, sy], [t0 + 4.2, L + W / 2 + 30, btnY + 17], [t0 + 4.7, L + W / 2 + 30, btnY + 17]]));
    return o.join("");
  };

  // ── 2. The maramataka: a real month, and one night opened ──────────────────
  const maramataka = (t0) => {
    const o = [];
    const A = { x: SX, y: CY, w: 372, h: CH };
    const B = { x: SX + 386, y: CY, w: SW - 386, h: CH };
    const { days, month } = product.maramataka;
    const picked = days.find((d) => d.date === demo.today.iso);
    // the opened night is the full moon: the badge and the title state it
    if (!picked?.isFullMoon || !h("fullMoonBadge").endsWith(picked.name)) fail("the demo's day is no longer the full moon the day card names");
    const lead = days[0].weekday;
    const rows = Math.ceil((lead + days.length) / 7);
    if (rows > 5) fail("the product's month no longer fits five calendar rows");
    o.push(box(A));

    o.push(rect(A.x + 12.5, A.y + 12.5, 21, 21, 6, C.bg, C.border), icon("chevronLeft", A.x + 17, A.y + 17, 12, C.fg));
    o.push(tx(month.label, "uiSemi", 13, A.x + 42, A.y + 27.5, C.fg));
    const nextX = A.x + 42 + width(month.label, "uiSemi", 13) + 8;
    o.push(rect(nextX + 0.5, A.y + 12.5, 21, 21, 6, C.bg, C.border), icon("chevronRight", nextX + 5, A.y + 17, 12, C.fg));
    o.push(pill(tr("maramataka.calendar.badge", "en"), A.x + A.w - 12, A.y + 15, { anchor: "end" }).svg);

    const gap = 4;
    const cw = (A.w - 24 - 6 * gap) / 7;
    const gridY = A.y + 59;
    const ch = (A.h - 59 - 12 - (rows - 1) * gap) / rows;
    const cellX = (k) => A.x + 12 + (k % 7) * (cw + gap);
    const cellY = (k) => gridY + Math.floor(k / 7) * (ch + gap);
    weekdays.forEach((w, i) => o.push(tx(w, "ui", 9.5, cellX(i) + cw / 2, A.y + 51, C.mutedFg, { anchor: "middle" })));
    // each night settles in, in calendar order
    const settle = on(t0 + 0.25, 0.25, "translateY(4px)");
    days.forEach((d, i) => {
      const k = i + lead;
      const e = energy(d.energyLevel);
      const x = cellX(k);
      const y = cellY(k);
      const second = d.isDoubleDay && d.doubleDayCycleDays ? d.doubleDayCycleDays[1] : null;
      const mark = d.isNewMoon ? C.gray[800] : d.isFullMoon ? C.yellow[500] : d.isDoubleDay ? C.blue[500] : null;
      o.push(
        `<g${settle}${later(i * 0.03)}>${rect(x + 0.5, y + 0.5, cw - 1, ch - 1, 6, e.bg, e.line)}${tx(String(d.dayOfMonth), "uiSemi", 9.5, x + 5, y + 12.5, e.fg)}` +
          (mark ? `<circle cx="${f(x + cw - 7.5)}" cy="${f(y + 8.5)}" r="2.3" fill="${mark}"/>` : "") +
          (second ? moon(d.cycleDay, x + cw / 2 - 13, y + ch - 18, 12) + moon(second, x + cw / 2 + 1, y + ch - 18, 12) : moon(d.cycleDay, x + cw / 2 - 7.5, y + ch - 20, 15)) +
          `</g>`,
      );
    });
    const k = days.indexOf(picked) + lead;
    const px = cellX(k) + cw / 2;
    const py = cellY(k) + ch / 2;
    const clickAt = t0 + 2.1;
    o.push(`<rect${on(clickAt - 0.15, 0.15)} x="${f(cellX(k) - 1)}" y="${f(cellY(k) - 1)}" width="${f(cw + 2)}" height="${f(ch + 2)}" rx="7" fill="none" stroke="${C.green[500]}" stroke-width="2"/>`);

    // the day's card
    const d = [box(B)];
    const e = energy(picked.energyLevel);
    d.push(icon("moon", B.x + 14, B.y + 13, 13, C.green[600]), tx(h("dayDetails"), "uiSemi", 12.5, B.x + 33, B.y + 24, C.fg));
    const LX = B.x + 14 + 68;
    d.push(moon(picked.cycleDay, LX - 28, B.y + 42, 56));
    d.push(pill(demo.today.label, LX, B.y + 108, { bg: C.bg, line: C.border, anchor: "middle", pad: 6 }).svg);
    d.push(tx(picked.name, "uiBold", 16, LX, B.y + 147, C.green[600], { anchor: "middle" }));
    d.push(pill(picked.energyLevel, LX, B.y + 156, { bg: e.bg, fg: e.fg, line: e.line, hh: 19, size: 10, pad: 10, r: 7, anchor: "middle" }).svg);
    d.push(pill(h("fullMoonBadge"), LX, B.y + 184, { bg: C.yellow[600], fg: "#fff", anchor: "middle" }).svg);
    d.push(pill(h("highProductivity"), LX, B.y + 205, { bg: C.green[600], fg: "#fff", anchor: "middle" }).svg);

    const RX = B.x + 160;
    const RW = B.w - 160 - 14;
    const guidance = wrap(glyphs, picked.description, { font: "ui", size: 9.5 }, RW - 22);
    if (guidance.length > 5) fail("the day's guidance no longer fits its card");
    const ACTIVITY = { "Hi ika": "blue", "Mahi māra": "green" };
    const part = (at, y, hh, title, inner) => `<g${on(at, 0.3, "translateY(6px)")}>${rect(RX + 0.5, y + 0.5, RW - 1, hh - 1, 9, C.bg, C.border)}${tx(title, "uiSemi", 10.5, RX + 11, y + 18, C.fg)}${inner}</g>`;
    const gH = 28 + guidance.length * 12.5 + 6;
    let y = B.y + 40;
    d.push(part(clickAt + 0.3, y, gH, h("dailyGuidance"), guidance.map((l, n) => tx(l, "ui", 9.5, RX + 11, y + 32 + n * 12.5, C.mutedFg)).join("")));
    y += gH + 7;
    let ax = RX + 11;
    const chips = picked.activities.map((a) => {
      const fam = C[ACTIVITY[a]] ?? fail(`the day's activity "${a}" has no colour this card knows`);
      const c = pill(a, ax, y + 26, { bg: fam[50], fg: fam[600], line: fam[200], r: 8 });
      ax += c.w + 5;
      return c.svg;
    });
    d.push(part(clickAt + 0.42, y, 51, h("traditionalActivities"), chips.join("")));
    y += 58;
    const half = RW / 2;
    d.push(
      part(
        clickAt + 0.54,
        y,
        B.y + B.h - 14 - y,
        h("lunarCyclePosition"),
        tx(`${picked.cycleDay}/30`, "uiBold", 15, RX + half / 2 + 4, y + 39, C.green[600], { anchor: "middle" }) +
          tx(h("dayOfCycle"), "ui", 9, RX + half / 2 + 4, y + 52, C.mutedFg, { anchor: "middle" }) +
          tx(String(picked.cycleDaysRemaining), "uiBold", 15, RX + half * 1.5 - 4, y + 39, C.blue[600], { anchor: "middle" }) +
          tx(h("daysToNew"), "ui", 9, RX + half * 1.5 - 4, y + 52, C.mutedFg, { anchor: "middle" }),
      ),
    );
    o.push(`<g${off(clickAt)}>${ghost(B)}</g>`, `<g${on(clickAt + 0.05, 0.3, "translateY(8px)")}>${d.join("")}</g>`);
    o.push(click(clickAt, px, py), pointer([[t0 + 1.4, A.x + A.w - 70, A.y + A.h - 30], [t0 + 2.0, px, py + 3], [t0 + 2.5, px, py + 3]]));
    return o.join("");
  };

  // ── 3. Goals: the wizard's action plan, then the goal it makes ─────────────
  const goals = (t0) => {
    const o = [];
    const A = { x: SX, y: CY, w: 392, h: CH };
    const B = { x: SX + 406, y: CY, w: SW - 406, h: CH };
    const g = demo.goal;
    const goalType = product.goalTypes.find((x) => x.code === g.typeCode) ?? fail("the demo's goal type is not one of the product's");
    const L = A.x + 16;
    const W = A.w - 32;
    o.push(box(A));
    o.push(tx(`${h("stepWord")}4${h("ofWord")}5`, "uiSemi", 12, L, A.y + 27, C.fg), tx(`80${h("completeWord")}`, "ui", 10, L + W, A.y + 27, C.mutedFg, { anchor: "end" }));
    o.push(rect(L, A.y + 35, W, 6, 3, C.gray[200]));
    o.push(`<rect${cls(`0%,${p(t0 + 0.3)}{transform:scaleX(.25);${EASE}}${p(t0 + 1.1)},100%{transform:none}`)} style="transform-origin:${f(L)}px 0" x="${f(L)}" y="${A.y + 35}" width="${f(W * 0.8)}" height="6" rx="3" fill="${C.primary}"/>`);
    // the five steps: three done, the fourth open
    for (let i = 0; i < 5; i++) {
      const cx = L + 8 + (i * (W - 16)) / 4;
      const cy = A.y + 57;
      o.push(`<circle cx="${f(cx)}" cy="${cy}" r="7.5" fill="${C.bg}" stroke="${i <= 3 ? C.primary : C.gray[300]}" stroke-width="1.5"/>`, tx(String(i + 1), "uiSemi", 9, cx, cy + 3.2, i <= 3 ? C.primary : C.gray[400], { anchor: "middle" }));
      if (i < 3) o.push(`<g${on(t0 + 0.35 + i * 0.22, 0.15)}><circle cx="${f(cx)}" cy="${cy}" r="8.25" fill="${C.primary}"/>${icon("check", cx - 4.5, cy - 4.5, 9, "#fff", 3)}</g>`);
    }
    o.push(tx(h("actionPlanSelection"), "uiSemi", 12.5, L, A.y + 87, C.fg), tx(h("chooseOne"), "ui", 10, L, A.y + 101, C.mutedFg));
    const OPTIONS = ["optA", "optB", "optC", "optD", "optE", "optF", "optG"];
    const pickIndex = "abcdefg".indexOf(g.plan);
    const rowY = (i) => A.y + 109 + i * 22;
    const row = on(t0 + 0.6, 0.3, "translateX(10px)");
    OPTIONS.forEach((key, i) =>
      o.push(
        `<g${row}${later(i * 0.08)}>${rect(L + 0.5, rowY(i) + 0.5, W - 1, 18, 6, C.bg, C.border)}<circle cx="${f(L + 12)}" cy="${rowY(i) + 9.5}" r="4.5" fill="${C.bg}" stroke="${C.gray[400]}"/>${tx(h(key), "uiSemi", 10, L + 24, rowY(i) + 13, C.fg)}</g>`,
      ),
    );
    const pickAt = t0 + 2.1;
    const py = rowY(pickIndex) + 9.5;
    o.push(
      `<g${on(pickAt, 0.15)}>${rect(L + 0.5, rowY(pickIndex) + 0.5, W - 1, 18, 6, "#f3fbf8", C.primary)}<circle cx="${f(L + 12)}" cy="${py}" r="4.5" fill="${C.bg}" stroke="${C.primary}"/><circle cx="${f(L + 12)}" cy="${py}" r="2.2" fill="${C.primary}"/>` +
        `${tx(h(OPTIONS[pickIndex]), "uiSemi", 10, L + 24, rowY(pickIndex) + 13, C.fg)}</g>`,
    );

    // the savings goal: four figures and the growth chart
    const d = [box(B)];
    const BL = B.x + 16;
    const BW = B.w - 32;
    const cutAt = t0 + 2.5;
    const recordAt = t0 + 4.3;
    d.push(tx(g.objective, "uiBold", 13.5, BL, B.y + 29, C.fg), tx(`${goalType.nameEn} • ${goalType.nameMi}`, "ui", 10, BL, B.y + 44, C.mutedFg));
    const tw = (BW - 8) / 2;
    const after = g.current + g.deposit;
    if (after > g.target) fail("the demo deposit overshoots the goal's target");
    const TILES = [
      ["currentSavings", "blue", g.current, after], ["target", "gray", g.target, g.target],
      ["amountSaved", "green", g.current - g.baseline, after - g.baseline], ["stillToSave", "amber", g.target - g.current, g.target - after],
    ];
    TILES.forEach(([key, fam, before, then], i) => {
      const x = BL + (i % 2) * (tw + 8);
      const y = B.y + 54 + Math.floor(i / 2) * 50;
      const value = (v, how) => `<g${how}>${tx(`$${v}`, "uiBold", 16, x + 10, y + 34, C[fam][500])}</g>`;
      d.push(rect(x + 0.75, y + 0.75, tw - 1.5, 40.5, 8, C[fam][50], C[fam][200], ' stroke-width="1.5"'), tx(h(key), "uiSemi", 9.5, x + 10, y + 16, C.mutedFg));
      d.push(before === then ? value(then, "") : value(before, off(recordAt, 0.15)) + value(then, on(recordAt + 0.1, 0.2)));
    });
    const chartY = B.y + 178;
    const chartH = B.y + B.h - 14 - chartY;
    d.push(tx(h("growthTitle"), "uiSemi", 11, BL, B.y + 170, C.fg));
    const pts = [...g.history, after];
    const px = (i) => BL + 4 + (i / (pts.length - 1)) * (BW - 8);
    const pyOf = (v) => chartY + chartH - 6 - ((v - g.baseline) / (g.target - g.baseline)) * (chartH - 18);
    const xy = pts.map((v, i) => [f(px(i)), f(pyOf(v))]);
    const len = (a) => a.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - a[i][0], q[1] - a[i][1]), 0);
    const path = (a) => a.map((q, i) => `${i ? "L" : "M"}${q[0]} ${q[1]}`).join("");
    const draw = (a, from, to) => {
      const l = f(len(a) + 1);
      return `<path${cls(`0%,${p(from)}{stroke-dasharray:${l};stroke-dashoffset:${l};animation-timing-function:cubic-bezier(.4,0,.2,1)}${p(to)},100%{stroke-dasharray:${l};stroke-dashoffset:0}`)} d="${path(a)}" fill="none" stroke="${C.blue[500]}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    };
    const base = f(chartY + chartH - 6);
    for (let i = 0; i < 4; i++) d.push(`<path d="M${f(BL + 4)} ${f(chartY + 12 + (i * (chartH - 18)) / 3)}H${f(BL + BW - 4)}" stroke="${i ? C.gray[200] : C.green[500]}" stroke-dasharray="${i ? "3 3" : "5 4"}"/>`);
    d.push(tx(h("target"), "ui", 9.5, BL + BW - 6, chartY + 24, C.green[600], { anchor: "end" }));
    const history = xy.slice(0, -1);
    const drawA = cutAt + 0.5;
    d.push(`<path${on(drawA + 0.9, 0.3)} d="${path(history)}V${base}H${history[0][0]}Z" fill="${C.blue[500]}" fill-opacity=".08"/>`);
    d.push(`<path${on(recordAt + 0.4, 0.3)} d="${path(xy.slice(-2))}V${base}H${xy.at(-2)[0]}Z" fill="${C.blue[500]}" fill-opacity=".08"/>`);
    d.push(draw(history, drawA, drawA + 0.9), draw(xy.slice(-2), recordAt, recordAt + 0.45));
    history.forEach((q, i) => d.push(`<circle${on(drawA + (0.9 * i) / (history.length - 1), 0.12)} cx="${q[0]}" cy="${q[1]}" r="2.6" fill="#fff" stroke="${C.blue[500]}" stroke-width="1.6"/>`));
    d.push(`<circle${on(recordAt + 0.4, 0.15)} cx="${xy.at(-1)[0]}" cy="${xy.at(-1)[1]}" r="3.6" fill="${C.blue[500]}"/>`);

    o.push(`<g${off(cutAt)}>${ghost(B)}</g>`, `<g${on(cutAt + 0.05, 0.3, "translateY(8px)")}>${d.join("")}</g>`);
    o.push(click(pickAt, L + 150, py), click(recordAt + 0.35, xy.at(-1)[0], xy.at(-1)[1]));
    o.push(pointer([[t0 + 1.5, L + W - 60, A.y + A.h - 26], [t0 + 2.0, L + 150, py + 3], [t0 + 2.6, L + 150, py + 3]]));
    return o.join("");
  };

  // ── 4. The journal, filled by voice, and the house its fields complete ─────
  const journal = (t0) => {
    const o = [];
    const A = { x: SX, y: CY, w: 352, h: CH };
    const B = { x: SX + 366, y: CY, w: SW - 366, h: CH };
    // the journal's fields in the replica's order; each completes its place on the house
    const FIELDS = ["wairua", "tinana", "whanau", "hinengaro"];
    const fillA = (i) => t0 + 2.3 + i * 0.75;
    const fillB = (i) => fillA(i) + 0.75;
    const exampleKey = (id) => `intentions${id[0].toUpperCase()}${id.slice(1)}`;

    // the house: the product's blue panel, its line drawing, its five fields
    defs.push(`<linearGradient id="whare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.blue[50]}"/><stop offset="1" stop-color="${C.indigo[50]}"/></linearGradient>`);
    o.push(rect(A.x + 1, A.y + 1, A.w - 2, A.h - 2, 13, "url(#whare)", C.blue[200], ' stroke-width="2"'));
    o.push(tx(house.title, "uiSemi", 11.5, A.x + A.w / 2, A.y + 25, C.fg, { anchor: "middle" }));
    const colW = (A.w - 24 - 16) / 3;
    const PLACE = { "left-roof": [0, 0], "right-roof": [2, 0], "left-wall": [0, 1], "right-wall": [2, 1], floor: [1, 2] };
    const ICONS = { Sparkles: "sparkles", Activity: "activity", Users: "users", Brain: "brain", TreePine: "treePine" };
    const k = 62 / 400;
    const hx = A.x + A.w / 2 - 31;
    const hy = A.y + 34;
    o.push(
      `<g transform="translate(${f(hx)} ${f(hy)}) scale(${k})" fill="none" stroke="${C.gray[700]}" stroke-opacity=".3" stroke-width="${f(1.4 / k)}" stroke-linecap="round">` +
        `<path d="${house.lines.map(([x1, y1, x2, y2]) => `M${x1} ${y1}L${x2} ${y2}`).join("")}"/><rect x="${house.door[0]}" y="${house.door[1]}" width="${house.door[2]}" height="${house.door[3]}"/></g>`,
    );
    o.push(tx(house.name, "uiSemi", 10.5, A.x + A.w / 2, A.y + 112, C.mutedFg, { anchor: "middle" }), tx(house.gloss, "ui", 9.5, A.x + A.w / 2, A.y + 125, C.mutedFg, { anchor: "middle" }));
    house.fields.forEach((fd) => {
      const [col, rowN] = PLACE[fd.position];
      const x = A.x + 12 + col * (colW + 8);
      const y = A.y + 38 + rowN * 76;
      const cx = x + colW / 2;
      const name = ICONS[fd.icon] ?? fail(`the house field "${fd.key}" uses an icon this card does not carry`);
      const sub = wrap(glyphs, fd.subtitle, { font: "ui", size: 9 }, colW - 10);
      const words = tx(fd.label, "uiSemi", 9.5, cx, y + 42, C.fg, { anchor: "middle" }) + sub.map((l, n) => tx(l, "ui", 9, cx, y + 53 + n * 10.5, C.mutedFg, { anchor: "middle" })).join("");
      const tile = (fill, line, disc, ink) => rect(x + 1, y + 1, colW - 2, 68, 8, fill, line, ' stroke-width="1.5"') + `<circle cx="${f(cx)}" cy="${y + 19}" r="11" fill="${disc}"/>` + icon(name, cx - 6, y + 13, 12, ink);
      o.push(tile(C.bg, C.gray[300], C.blue[100], C.blue[600]));
      // completed, as the product marks it, once the journal has that field
      const done = FIELDS.findIndex((id) => exampleKey(id) === fd.key);
      if (done >= 0) o.push(`<g${on(fillB(done), 0.25)}>${tile(C.green[50], C.green[400], C.green[200], C.green[700])}<circle cx="${f(x + colW - 9)}" cy="${y + 9}" r="6" fill="${C.green[500]}"/>${icon("check", x + colW - 12.5, y + 5.5, 7, "#fff", 3.2)}</g>`);
      o.push(words);
    });

    // the morning reflection
    const L = B.x + 16;
    const W = B.w - 32;
    o.push(box(B));
    o.push(tx(tr("journal.types.morning", "en"), "uiSemi", 13, L, B.y + 27, C.fg), tx(tr("journal.types.morningTitle", "en"), "ui", 10, L, B.y + 41, C.mutedFg));
    // the microphone: indigo at rest, red with a running timer while it records
    const mx = L + W - 14;
    const my = B.y + 29;
    const recA = t0 + 0.5;
    const recB = t0 + 2.0;
    o.push(`<circle cx="${f(mx)}" cy="${my}" r="13" fill="#fff" stroke="${C.indigo[600]}" stroke-width="1.5"/>`, icon("mic", mx - 6.5, my - 6.5, 13, C.indigo[600]));
    const ticks = Array.from({ length: demo.journal.recordSec + 1 }, (_, s) => `0:${String(s).padStart(2, "0")}`);
    const tw = width("0:00", "uiSemi", 11) + 14;
    const tX = mx - 20 - tw;
    defs.push(`<clipPath id="rec"><rect x="${f(tX)}" y="${my - 9}" width="${f(tw)}" height="18"/></clipPath>`);
    o.push(
      `<g${span(recA, recB, 0.12)}>` +
        `<circle${cls(`0%,100%{transform:scale(1);opacity:.22}50%{transform:scale(1.25);opacity:.08}`)} style="transform-origin:${f(mx)}px ${my}px;animation-duration:.7s" cx="${f(mx)}" cy="${my}" r="17" fill="${C.red[600]}"/>` +
        `<circle cx="${f(mx)}" cy="${my}" r="13.75" fill="${C.red[600]}"/><rect x="${f(mx - 4.5)}" y="${my - 4.5}" width="9" height="9" rx="1.5" fill="#fff"/>` +
        rect(tX + 0.5, my - 8.5, tw - 1, 17, 6, "#fff", C.border) +
        `<g clip-path="url(#rec)"><g${cls(`0%,${p(recA)}{transform:none;animation-timing-function:steps(${ticks.length - 1},end)}${p(recB)},100%{transform:translateY(${-(ticks.length - 1) * 18}px)}`)}>` +
        ticks.map((s, n) => tx(s, "uiSemi", 11, tX + 7, my + 4 + n * 18, C.red[600])).join("") +
        `</g></g></g>`,
    );
    o.push(`<g${on(recB + 0.15, 0.3, "translateX(6px)")}>${icon("check", mx - 22 - width(h("voiceTranscribed"), "uiSemi", 10.5) - 15, my - 5.5, 11, C.emerald600, 2.6)}${tx(h("voiceTranscribed"), "uiSemi", 10.5, mx - 22, my + 3.8, C.emerald600, { anchor: "end" })}</g>`);

    FIELDS.forEach((id, i) => {
      const y = B.y + 53 + i * 52;
      const label = tr(`journal.morning.${id}.label`, "en");
      const text = product.journalExamples[exampleKey(id)] ?? fail(`the product has no example text for the journal's ${id} field`);
      const lines = wrap(glyphs, text, { font: "ui", size: 9.5 }, W - 18);
      if (lines.length > 2) fail(`the journal's ${id} example no longer fits two lines`);
      o.push(tx(label, "uiSemi", 10.5, L, y + 10, C.fg), tx(`(${tr(`journal.morning.${id}.subtitle`, "en")})`, "ui", 9.5, L + width(label, "uiSemi", 10.5) + 5, y + 10, C.mutedFg));
      o.push(rect(L + 0.5, y + 15.5, W - 1, 31, 6, C.bg, C.border));
      o.push(`<rect${span(fillA(i), fillB(i), 0.12)} x="${f(L - 1)}" y="${y + 14}" width="${f(W + 2)}" height="34" rx="7.5" fill="none" stroke="${C.blue[400]}" stroke-opacity=".6" stroke-width="3"/>`);
      o.push(typedLines(lines, "ui", 9.5, L + 9, y + 28, 12, C.fg, C.bg, fillA(i), fillB(i)));
    });
    o.push(click(recA, mx, my), click(recB, mx, my));
    o.push(pointer([[t0 + 0.1, mx - 90, my + 70], [t0 + 0.45, mx + 2, my + 4], [recB + 0.3, mx + 2, my + 4]]));
    return o.join("");
  };

  // ── 5. Whānau support: the hub, and what one supporter may see ─────────────
  const whanau = (t0) => {
    const o = [];
    const A = { x: SX, y: CY, w: 300, h: CH };
    const B = { x: SX + 314, y: CY, w: SW - 314, h: CH };
    const s = demo.support;
    const who = demo.supporters[0];
    const L = A.x + 16;
    const W = A.w - 32;
    o.push(box(A), box(B));
    o.push(tx(tr("support.main.title", "en"), "uiBold", 14, L, A.y + 30, C.fg));
    const STATS = [["users", C.blue[500], s.stats.network, "supportNetwork"], ["messageCircle", C.green[500], s.stats.newMessages, "newMessages"], ["heart", C.red[500], s.stats.encouragements, "encouragements"], ["trendingUp", C.purple[500], s.stats.thisWeek, "thisWeek"]];
    const tw = (W - 8) / 2;
    STATS.forEach(([name, colour, n, key], i) => {
      const x = L + (i % 2) * (tw + 8);
      const y = A.y + 42 + Math.floor(i / 2) * 52;
      o.push(rect(x + 0.5, y + 0.5, tw - 1, 43, 9, C.bg, C.border), icon(name, x + 10, y + 13, 18, colour), tx(String(n), "uiBold", 15, x + 36, y + 20, C.fg), tx(tr(`support.main.stats.${key}`, "en"), "ui", 9.5, x + 36, y + 34, C.mutedFg));
    });
    o.push(tx(tr("support.main.recentActivity.title", "en"), "uiSemi", 11.5, L, A.y + 164, C.fg));
    s.activity.forEach((a, i) => {
      const y = A.y + 173 + i * 43;
      const badge = a.isNew ? pill(tr("support.main.recentActivity.newBadge", "en"), L + W - 8, y + 12, { anchor: "end", hh: 14, size: 9, pad: 6, bg: C.gray[200] }).svg : "";
      o.push(
        `<g${on(t0 + 0.5 + i * 0.35, 0.3, "translateX(10px)")}>${rect(L, y, W, 38, 8, "#fafafa")}${icon(a.kind === "heart" ? "heart" : "target", L + 10, y + 8, 11, a.kind === "heart" ? C.red[500] : C.purple[500])}` +
          `${tx(`${a.who} ${a.what}`, "uiSemi", 10, L + 28, y + 16.5, C.fg)}${tx(a.ago, "ui", 9, L + 28, y + 29.5, C.mutedFg)}${badge}</g>`,
      );
    });

    // one supporter's permissions
    const BL = B.x + 16;
    const BW = B.w - 32;
    const onAt = t0 + 2.2;
    const offAt = t0 + 3.0;
    const saveAt = t0 + 3.9;
    o.push(`<circle cx="${BL + 15}" cy="${B.y + 31}" r="15" fill="${C.primary}" fill-opacity=".1"/>`, tx(who.initials, "uiSemi", 10.5, BL + 15, B.y + 34.8, C.primary, { anchor: "middle" }));
    o.push(tx(who.name, "uiSemi", 12.5, BL + 39, B.y + 28, C.fg), tx(who.email, "ui", 9.5, BL + 39, B.y + 41, C.mutedFg));
    o.push(pill(tr("support.main.roles.whanau", "en"), BL + 39 + width(who.name, "uiSemi", 12.5) + 9, B.y + 16.5, { bg: C.bg, line: C.border }).svg);
    const saveText = tr("support.network.privacy.saveButton", "en");
    const savedText = tr("support.network.privacy.saved", "en");
    const sw = width(saveText, "uiSemi", 10.5) + 37;
    const dw = width(savedText, "uiSemi", 10.5) + 37;
    const R = BL + BW;
    o.push(`<g${off(saveAt + 0.1, 0.15)}>${rect(R - sw + 0.5, B.y + 18.5, sw - 1, 25, 7, C.bg, C.border)}${icon("save", R - sw + 10, B.y + 25, 12, C.fg)}${tx(saveText, "uiSemi", 10.5, R - sw + 27, B.y + 35, C.fg)}</g>`);
    o.push(`<g${on(saveAt + 0.15, 0.2)}>${rect(R - dw, B.y + 18, dw, 26, 7, C.primary)}${icon("circleCheck", R - dw + 10, B.y + 25, 12, C.primaryFg)}${tx(savedText, "uiSemi", 10.5, R - dw + 27, B.y + 35, C.primaryFg)}</g>`);
    // the five switches: one is turned on, one is turned off, then it is saved
    const PERMS = [["target", "viewGoals", true], ["trendingUp", "viewProgress", true, onAt], ["heart", "viewMood", false, offAt], ["award", "viewAchievements", true], ["messageSquare", "sendMessages", true]];
    const rowY = (i) => B.y + 56 + i * 37;
    PERMS.forEach(([name, key, isOn, flip], i) => {
      const y = rowY(i);
      if (flip !== undefined) o.push(`<rect${span(flip - 0.3, flip + 0.7, 0.15)} x="${f(BL - 6)}" y="${y + 2}" width="${f(BW + 12)}" height="33" rx="7" fill="${C.primary}" fill-opacity=".07"/>`);
      if (i) o.push(`<path d="M${BL} ${y + 0.5}H${R}" stroke="${C.border}"/>`);
      o.push(`<circle cx="${BL + 12}" cy="${y + 18.5}" r="12" fill="${C.muted}"/>`, icon(name, BL + 6, y + 12.5, 12, C.fg));
      o.push(tx(tr(`support.network.privacy.permissions.${key}.label`, "en"), "uiSemi", 10.5, BL + 33, y + 16, C.fg), tx(tr(`support.network.privacy.permissions.${key}.description`, "en"), "ui", 9.5, BL + 33, y + 29, C.mutedFg));
      o.push(toggle(R - 28, y + 10.5, isOn, flip));
    });
    o.push(tx(`${tr("support.network.privacy.lastUpdated", "en")} ${s.lastUpdated}`, "ui", 9.5, BL, B.y + 258, C.mutedFg));
    const sx = R - 14;
    o.push(click(onAt, sx, rowY(1) + 18.5), click(offAt, sx, rowY(2) + 18.5), click(saveAt, R - sw / 2, B.y + 31));
    o.push(pointer([[t0 + 1.5, R - 150, B.y + 250], [t0 + 2.05, sx, rowY(1) + 21], [t0 + 2.45, sx, rowY(1) + 21], [t0 + 2.9, sx, rowY(2) + 21], [t0 + 3.3, sx, rowY(2) + 21], [t0 + 3.8, R - sw / 2 + 8, B.y + 34], [t0 + 4.3, R - sw / 2 + 8, B.y + 34]]));
    return o.join("");
  };

  // ── Identity: what it is, the product's lockup, its own line, where it is ──
  if (!/AI Financial Wellness Coach/.test(project.tagline || "")) fail("the shard's tagline no longer calls the product an AI Financial Wellness Coach");
  if (!/in both te reo Māori and English/.test((project.publicSummary || "").replace(/\s+/g, " "))) fail("the shard's publicSummary no longer says the product works in both te reo Māori and English");
  const lockup = read(root, "lockup").match(/<svg[^>]*viewBox="0 0 367 435"[^>]*>([\s\S]*)<\/svg>/);
  if (!lockup) fail("the product's lockup file is not the 367 × 435 drawing this card was laid out for");
  const LOCK = 156;
  const identity = [
    `<rect width="${X}" height="${CARD.h}" fill="${C.bg}"/>`,
    tx("AI FINANCIAL WELLNESS COACH", "uiSemi", 11, 40, 51, C.green[700], { tracking: 0.14 }),
    // the lockup's own outlines, to a tenth of its unit (a thirtieth of a pixel here)
    `<svg x="40" y="84" width="${f((LOCK * 367) / 435)}" height="${LOCK}" viewBox="0 0 367 435">${lockup[1].replace(/\d+\.\d{2,}/g, (v) => String(Number(Number(v).toFixed(1)))).replace(/\s*\n\s*/g, "")}</svg>`,
    ...HOOK.map((l, n) => tx(l, "uiBold", 28, 200, 136 + n * 35, C.fg, { tracking: -0.018 })),
  ];
  let chipX = 40;
  [[url, { bg: C.emerald50, fg: C.green[700], line: C.emerald200, font: "uiSemi" }], ["Te reo Māori", { bg: C.bg, line: C.border }], ["English", { bg: C.bg, line: C.border }]].forEach(([text, look]) => {
    const chip = pill(text, chipX, 290, { ...look, size: 12.5, hh: 30, pad: 14, r: 15 });
    identity.push(chip.svg);
    chipX += chip.w + 8;
  });

  const draw = [dashboard, maramataka, goals, journal, whanau];
  const stage =
    `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${C.emerald50}"/>` +
    SCENES.map((_, i) => rect(SX + SW - (SCENES.length - i) * 22 + 4, 24, 18, 3, 1.5, C.emerald200)).join("") +
    SCENES.map((_, i) => scene(i, draw[i](starts[i]))).join("") +
    tx(disclosure, "ui", 10, X + (CARD.w - X) / 2, 344, C.mutedFg, { anchor: "middle" });

  const names = [...frames.values()];
  const css = `${names.map((n) => `.${n}`).join(",")}{animation-duration:${f(T)}s;animation-timing-function:linear;animation-iteration-count:infinite}` + [...frames].map(([body, n]) => `@keyframes ${n}{${body}}.${n}{animation-name:${n}}`).join("");

  return {
    svg: card({
      title:
        "Tam-AI-Ti, a te reo Māori AI coach for financial wellbeing, built on the Māori holistic-health model Te Whare Tapa Whā. " +
        "Five parts of the product at work: a daily whakataukī and check-in, the maramataka calendar, a goal's action plan, a hauora journal filled in by voice, and whānau support with permissions the user sets; the interface is recreated in code, and the demo account and figures are illustrative.",
      css,
      defs: `${glyphs.defs()}${defs.join("")}`,
      body: stage + identity.join("") + `<rect x="${X - 0.5}" width="1" height="${CARD.h}" fill="${C.border}"/>`,
      radius: 14,
    }),
    facts: { scenes: SCENES.length, nights: product.maramataka.days.length, loop: `${T.toFixed(1)}s` },
  };
}
