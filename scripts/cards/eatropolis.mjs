// Eatropolis card: the festival's website at work, in three scenes. A visitor
// filters the dish browser by cuisine, the kitchen lineup fills in, and the
// concierge answers a question and offers to read the reply aloud.
//
// It is drawn in the festival's own design system (Chow-Luck-Club/
// eatropolis-website): the product's colour tokens (parchment, ink, chilli),
// its typefaces (Big Shoulders Display, Archivo Narrow, Italiana, JetBrains
// Mono), its own white wordmark and stamp, and its own components redrawn in
// vectors: the cuisine pills and dish cards of /dishes, the lineup section and
// marquee of the home page, the concierge panel.
//
// What is shown, and where it comes from (all read at build time from the
// product data that eatropolis-promo-film syncs from the site, EATROPOLIS_INPUTS):
//   - dishes, their kitchens and cuisine tags: dishes.json; the pill and diet
//     lists: explorer.json; the counts come out of the site's own filter;
//   - the lineup: partners.json, each kitchen with its first dish;
//   - the concierge exchange: concierge.json, a reply of the site's canned
//     router; greeting and suggestions: chat.json;
//   - strings that live inside the site's .tsx files (INLINE) are checked
//     against the synced source snapshots, and the build fails on a miss;
//   - the panel's two delivery figures are the career database's
//     (projects[eatropolis-website].metrics), asserted below.
// It keeps the film's constraints: no price is stated or shown, so the
// concierge question is the venue one and not the ticket one (C2, and this
// repo's own no-pricing rule); no attendance figure (C8); the concierge is
// never called "AI" (C7). Nothing on it goes stale after the event of
// 10 Oct 2026: no announcement bar, no ticket button.
//
// The dish photographs are the only rasters: thirteen 252×86 crops of the
// site's own dish images, committed in scripts/cards/assets/eatropolis/ and
// named by dish slug.
import { readFileSync } from "node:fs";

import { wrap } from "../lib/svg-card/film.mjs";
import { CARD, card, pct } from "../lib/svg-card/shell.mjs";

export const EATROPOLIS_FONTS = {
  display: "scripts/cards/fonts/eatropolis/BigShouldersDisplay-800.ttf",
  body: "scripts/cards/fonts/eatropolis/ArchivoNarrow-400.ttf",
  bodyBold: "scripts/cards/fonts/eatropolis/ArchivoNarrow-600.ttf",
  serif: "scripts/cards/fonts/eatropolis/Italiana-400.ttf",
  mono: "cv/fonts/JetBrainsMono-Regular.ttf",
};
const PRODUCT = "../eatropolis-promo-film/src/product";
export const EATROPOLIS_INPUTS = {
  tokens: `${PRODUCT}/tokens.json`,
  dishes: `${PRODUCT}/dishes.json`,
  explorer: `${PRODUCT}/explorer.json`,
  partners: `${PRODUCT}/partners.json`,
  concierge: `${PRODUCT}/concierge.json`,
  chat: `${PRODUCT}/content/chat.json`,
  home: `${PRODUCT}/content/page-home.json`,
  facts: `${PRODUCT}/content/event-facts.json`,
  srcExplorer: `${PRODUCT}/source/components__dishes__DishesExplorer.tsx.txt`,
  srcAssistant: `${PRODUCT}/source/components__chat__AIAssistant.tsx.txt`,
  srcActions: `${PRODUCT}/source/components__chat__MessageActions.tsx.txt`,
  srcMarquee: `${PRODUCT}/source/components__motion__MarqueeTicker.tsx.txt`,
  srcHome: `${PRODUCT}/source/app__marketing__page.tsx.txt`,
};

// Strings that live inside the product's components, by the source snapshot
// that must contain each one.
const INLINE = {
  srcExplorer: { showing: "Showing {filtered.length} of {dishes.length}", dietLabel: "Diet" },
  srcAssistant: { title: "Eatropolis concierge", subtitle: "Ask me anything", readAloud: "Read aloud", placeholder: "Ask about a dish, a chef, an experience zone…", footer: "Conversations stay on this device." },
  srcActions: { listen: "Listen", stop: "Stop" },
  srcMarquee: { phrases: ["AWARD-WINNING DISHES", "10.10.2026", "SHED-10 QUEENS WHARF", "30+ CULINARY PARTNERS"] },
  srcHome: { lineupLink: "Meet every partner" },
};

// The scene the visitor plays: the cuisine clicked in the dish browser, and
// the question asked of the concierge (the film's second question; its first
// is about ticket prices).
const CUISINE = "malaysian";
const QUESTION = "Where is it?";

// projects[eatropolis-website].metrics → the panel's figure pairs. Each label
// keeps the basis of its figure: the tests are accessibility tests, the
// visitors were load-tested ones.
const DELIVERY = [
  { value: "39/39", label: "ACCESSIBILITY TESTS", metric: "Accessibility verification", proof: /39\/39 axe-core/ },
  { value: "1,000", label: "LOAD-TESTED VISITORS", metric: "Load testing", proof: /1,000 concurrent VUs.*0\.00% error rate/ },
];

const ICON = {
  cursor: "M0 0V15.2L4.1 11.5L6.7 17.4L9.1 16.3L6.5 10.6H11.7Z",
  chevron: "M2 4l4 4 4-4",
  speakerOff: "M3 6h2.5L9 3v10L5.5 10H3zM11 6l3 3M14 6l-3 3",
  close: "M3 3l10 10M13 3L3 13",
  mic: "M8 2a2 2 0 0 1 2 2v4a2 2 0 0 1-4 0V4a2 2 0 0 1 2-2zM3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2",
  send: "M2 8l12-6-4 12-2.5-5.5z",
  copy: "M6.5 5h6A1.5 1.5 0 0 1 14 6.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 5 12.5v-6A1.5 1.5 0 0 1 6.5 5zM11 5V3.5A1.5 1.5 0 0 0 9.500 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5",
  regen: "M2.5 8a5.5 5.5 0 1 0 1.7-3.95M2.5 2.5V5h2.5",
  thumb: "M5 13V8M2.5 8h2.5L7 3.5c.6 0 1.1.5 1.1 1.1V7h3.6c.7 0 1.3.6 1.2 1.3l-.6 4c-.1.6-.6 1-1.2 1H5",
  play: "M4 3l9 5-9 5z",
};

export function buildEatropolisCard({ glyphs, root, project }) {
  const read = (key) => readFileSync(`${root}/${EATROPOLIS_INPUTS[key]}`, "utf8");
  const json = (key) => JSON.parse(read(key));
  const fail = (msg) => {
    throw new Error(`eatropolis card: ${msg}`);
  };

  // ── Sources, and the assertions that keep the card honest ──────────────────
  const tokens = json("tokens");
  const P = { chilli: tokens.chilli, chilliDeep: tokens["chilli-deep"], chilliOnInk: tokens["chilli-on-ink"], ink: tokens.ink, charcoal: tokens.charcoal, smoke: tokens.smoke, ash: tokens.ash, stone: tokens.stone, parchment: tokens.parchment, cream: tokens.cream, bone: tokens.bone };
  for (const [k, v] of Object.entries(P)) if (!/^#[0-9a-f]{6}$/i.test(v || "")) fail(`tokens.json has no colour for "${k}"`);

  for (const [key, strings] of Object.entries(INLINE)) {
    const src = read(key);
    for (const s of Object.values(strings).flat()) if (!src.includes(s)) fail(`"${s}" is no longer in ${EATROPOLIS_INPUTS[key]}`);
  }
  for (const d of DELIVERY) {
    const m = project.metrics.find((x) => x.label === d.metric);
    if (!m || !d.proof.test(m.value)) fail(`metric "${d.metric}" no longer supports "${d.value} ${d.label}"`);
  }

  const dishes = json("dishes");
  const explorer = json("explorer");
  const partners = json("partners");
  const chat = json("chat");
  const home = json("home");
  const facts = json("facts");
  const lineup = home.sections.find((s) => s.id === "partners") || fail("page-home.json has no partners section");
  const exchange = json("concierge").find((c) => c.question === QUESTION) || fail(`concierge.json has no reply to "${QUESTION}"`);
  if (/\$\s?\d/.test(exchange.answer)) fail("the concierge reply states a price");
  const pill = explorer.cuisines.find((c) => c.value === CUISINE) || fail(`explorer.json has no cuisine "${CUISINE}"`);
  const dietAll = explorer.dietaryOptions.find((o) => o.value === "all") || fail("explorer.json has no all-diets option");
  // DishesExplorer's filter; a dish with no photograph cannot be drawn as a card.
  const filtered = dishes.filter((d) => d.tags.includes(CUISINE));
  const gridAll = dishes.slice(0, 8);
  const gridCuisine = filtered.slice(0, 8);
  if (filtered.length < 4 || filtered.length > 8) fail(`"${CUISINE}" now matches ${filtered.length} dishes; the grid holds 4 to 8`);
  const showing = (n) => INLINE.srcExplorer.showing.replace("{filtered.length}", n).replace("{dishes.length}", dishes.length).toUpperCase();
  const photos = new Map();
  for (const d of [...gridAll, ...gridCuisine]) {
    if (!d.hero) fail(`"${d.title}" has no photograph`);
    const slug = d.hero.match(/([^/]+)\.jpg$/)[1];
    try {
      photos.set(d.title, { id: `ph${photos.has(d.title) ? [...photos.keys()].indexOf(d.title) : photos.size}`, b64: readFileSync(`${root}/scripts/cards/assets/eatropolis/${slug}.jpg`).toString("base64") });
    } catch {
      fail(`scripts/cards/assets/eatropolis/${slug}.jpg is missing (crop it from the site's ${d.hero})`);
    }
  }
  const kitchens = partners.map((k) => ({ name: k.name, dish: (dishes.find((d) => d.partner === k.name) || fail(`${k.name} has no dish in dishes.json`)).title }));

  // ── Timeline: three scenes on one loop ─────────────────────────────────────
  const S = [0, 6.6, 12.4];
  const T = 21;
  const FADE = 0.35;
  const p = (t) => pct(t, T, 3);
  const css = [];
  const EASE = "cubic-bezier(.4,0,.2,1)";
  const rule = (name, body, timing = "linear") => css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${T}s ${timing} infinite}`);
  // shown from t onward (part of the finished frame); shown only between a and
  // b (the element carries opacity="0"); shown until t (likewise).
  const on = (name, t, f = 0.25) => rule(name, `0%,${p(t)}{opacity:0}${p(t + f)},100%{opacity:1}`);
  const span = (name, a, b, f = 0.2) => rule(name, `0%,${p(a)}{opacity:0}${p(a + f)},${p(b)}{opacity:1}${p(b + f)},100%{opacity:0}`);
  const until = (name, t, f = 0.2) => rule(name, `0%,${p(t)}{opacity:1}${p(t + f)},100%{opacity:0}`);
  const delay = (t) => `animation-delay:${(t - T).toFixed(2)}s`;
  S.forEach((s, i) => {
    const end = S[i + 1] ?? T;
    rule(`sc${i}`, `0%,${p(s)}{opacity:0}${p(s + FADE)},${p(end - FADE)}{opacity:1}${p(end)},100%{opacity:0}`);
  });
  // An entrance written once, at time zero, and placed with a negative delay:
  // it rises in, holds for eight seconds (longer than any scene) and goes.
  rule("in", `0%{opacity:0;transform:translateY(7px)}${p(0.32)},${p(8)}{opacity:1;transform:none}${p(8.01)},100%{opacity:0}`, EASE);
  css.push("@keyframes dot{0%,60%,100%{opacity:.25;transform:none}30%{opacity:1;transform:translateY(-2px)}}.dot{animation:dot 1.2s linear infinite}");
  css.push(".box{transform-box:fill-box;transform-origin:right center}");

  // ── Shared pieces ──────────────────────────────────────────────────────────
  const X = CARD.panel;
  const L = X + 28;
  const R = CARD.w - 28;
  const W = R - L;
  const inner = (file) => readFileSync(`${root}/${file}`, "utf8").match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1];
  const seal = readFileSync(`${root}/public/brands/eatropolis-mark.svg`, "utf8").match(/<svg x="17"[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/);
  if (!seal) fail("could not find the stamp inside public/brands/eatropolis-mark.svg");
  const defs = [`<symbol id="seal" viewBox="${seal[1]}">${seal[2]}</symbol>`];
  const stamp = (x, y, size) => `<use href="#seal" x="${x}" y="${y}" width="${size}" height="${size}" transform="rotate(-8 ${x + size / 2} ${y + size / 2})"/>`;
  // components/motion/AsteriskDivider.tsx: the eight-pointed brand asterisk.
  defs.push('<g id="ast"><path d="M12 0L13 12L12 24L11 12ZM0 12L12 13L24 12L12 11Z"/><path transform="rotate(45 12 12)" d="M12 0L13 12L12 24L11 12ZM0 12L12 13L24 12L12 11Z"/></g>');
  const asterisk = (x, y, size, fill) => `<use href="#ast" fill="${fill}" transform="translate(${x} ${y}) scale(${(size / 24).toFixed(3)}) rotate(-8 12 12)"/>`;
  const icon = (d, x, y, size, stroke, sw = 1.5) => `<path d="${d}" transform="translate(${x} ${y}) scale(${(size / 16).toFixed(3)})" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const t = (str, o) => glyphs.text(str, o);
  const w = (str, o) => glyphs.measure(str, o);
  // Italiana has no italic; the site asks for one and the browser slants it.
  const italic = (str, o) => `<g transform="translate(${o.x} ${o.y}) skewX(-11) translate(${-o.x} ${-o.y})">${t(str, { ...o, font: "serif" })}</g>`;
  const cursor = (cls, x, y) => `<path class="${cls}" transform="translate(${x} ${y})" d="${ICON.cursor}" fill="${P.ink}" stroke="${P.bone}" stroke-width="1.2" stroke-linejoin="round"/>`;
  const ring = (cls, x, y, stroke) => `<circle class="${cls}" opacity="0" cx="${x}" cy="${y}" r="10" fill="none" stroke="${stroke}" stroke-width="1.5"/>`;
  const move = (x, y) => `transform:translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;

  // The stage's top row: the site's section eyebrow, and one tick per scene.
  const header = (i, label, dark) => {
    const out = [asterisk(L, 19, 13, dark ? P.chilliOnInk : P.chilli), t(label, { font: "mono", size: 10.5, x: L + 21, y: 30, fill: dark ? P.chilliOnInk : P.chilliDeep, tracking: 0.16 })];
    S.forEach((_, n) => out.push(`<rect x="${R - (S.length - n) * 27 + 5}" y="24.5" width="22" height="3" fill="${n === i ? (dark ? P.chilliOnInk : P.chilli) : dark ? P.smoke : P.stone}"/>`));
    return out.join("");
  };
  const scene = (i, ground, body) => `<g class="sc${i}"${i ? ' opacity="0"' : ""}><rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${ground}"/>${body}</g>`;

  // ── Identity, on the festival's ink, under its own wordmark ────────────────
  const identity = [
    `<rect width="${X}" height="${CARD.h}" fill="${P.ink}"/>`,
    t("FESTIVAL WEBSITE", { font: "mono", size: 11, x: 40, y: 50, fill: P.stone, tracking: 0.16 }),
    `<svg x="40" y="74" width="278" height="64" viewBox="0 0 400 92">${inner("public/brands/eatropolis-wordmark-white.svg")}</svg>`,
    `<use href="#seal" x="390" y="71" width="70" height="70"/>`,
    `<rect x="40" y="166" width="46" height="3" fill="${P.chilli}"/>`,
    // the home page's hero title, set as the site sets it: a bold lead, an italic close
    t(home.hero.title.leading, { font: "bodyBold", size: 30, x: 40, y: 207, fill: P.cream }),
    italic(home.hero.title.italic, { size: 31, x: 40, y: 243, fill: P.cream, tracking: 0.01 }),
  ];
  const figure = { font: "display", size: 34 };
  const caps = { font: "bodyBold", size: 10.5, tracking: 0.1 };
  let fx = 40;
  for (const pair of [...DELIVERY, { value: facts.event.dateNumeric, label: INLINE.srcMarquee.phrases[2] }]) {
    identity.push(t(pair.value, { ...figure, x: fx, y: 308, fill: P.chilliOnInk }), t(pair.label, { ...caps, x: fx, y: 327, fill: P.stone }));
    fx += Math.max(w(pair.value, figure), w(pair.label, caps)) + 26;
  }
  if (fx - 26 > X - 30) fail("the panel's figure row no longer fits");

  // ── Scene 1: the dish browser ──────────────────────────────────────────────
  const s1 = [header(0, "AWARD-WINNING DISHES")];
  const pillType = { font: "bodyBold", size: 10, tracking: 0.1 };
  const pillAt = {};
  let px = L;
  let py = 44;
  for (const c of explorer.cuisines) {
    const label = c.label.toUpperCase();
    const pw = w(label, pillType) + 22;
    if (px + pw > R) {
      px = L;
      py += 28;
    }
    const draw = (active) =>
      `<rect x="${px.toFixed(1)}" y="${py + 0.5}" width="${pw.toFixed(1)}" height="21" rx="10.5" fill="${active ? P.ink : P.cream}" stroke="${active ? P.ink : P.stone}"/>` +
      t(label, { ...pillType, x: px + 11, y: py + 14.6, fill: active ? P.bone : P.smoke });
    pillAt[c.value] = { x: px + pw / 2, y: py + 11 };
    // the two pills that change hands on the click carry both states
    if (c.value === "all") s1.push(draw(false), `<g class="a1" opacity="0">${draw(true)}</g>`);
    else if (c.value === CUISINE) s1.push(draw(true), `<g class="a1" opacity="0">${draw(false)}</g>`);
    else s1.push(draw(false));
    px += pw + 6;
  }
  const rowY = py + 28;
  const CLICK = 1.4;
  until("a1", CLICK, 0.12);
  on("b1", CLICK, 0.12);
  s1.push(`<g class="a1" opacity="0">${t(showing(dishes.length), { font: "mono", size: 9.5, x: L, y: rowY + 14.5, fill: P.smoke, tracking: 0.16 })}</g>`);
  s1.push(`<g class="b1">${t(showing(filtered.length), { font: "mono", size: 9.5, x: L, y: rowY + 14.5, fill: P.smoke, tracking: 0.16 })}</g>`);
  const dietKey = { font: "bodyBold", size: 9.5, tracking: 0.16 };
  const dietVal = { font: "bodyBold", size: 10.5, tracking: 0.08 };
  const dw = 12 + w(INLINE.srcExplorer.dietLabel.toUpperCase(), dietKey) + 9 + w(dietAll.label.toUpperCase(), dietVal) + 8 + 9 + 11;
  s1.push(
    `<rect x="${(R - dw).toFixed(1)}" y="${rowY + 0.5}" width="${dw.toFixed(1)}" height="21" rx="10.5" fill="${P.cream}" stroke="${P.stone}"/>`,
    t(INLINE.srcExplorer.dietLabel.toUpperCase(), { ...dietKey, x: R - dw + 12, y: rowY + 14.5, fill: P.smoke }),
    t(dietAll.label.toUpperCase(), { ...dietVal, x: R - dw + 12 + w(INLINE.srcExplorer.dietLabel.toUpperCase(), dietKey) + 9, y: rowY + 14.7, fill: P.ink }),
    `<path d="${ICON.chevron}" transform="translate(${(R - 21).toFixed(1)} ${rowY + 6.5}) scale(.75)" fill="none" stroke="${P.ink}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  );

  const GRID = { y: rowY + 31, cols: 4, gap: 10, photo: 60 };
  GRID.w = (W - GRID.gap * (GRID.cols - 1)) / GRID.cols;
  GRID.h = (CARD.h - 22 - GRID.y - GRID.gap) / 2;
  for (const { id, b64 } of photos.values()) defs.push(`<image id="${id}" width="${GRID.w}" height="${GRID.photo}" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${b64}"/>`);
  const cell = (n) => ({ x: L + (n % GRID.cols) * (GRID.w + GRID.gap), y: GRID.y + Math.floor(n / GRID.cols) * (GRID.h + GRID.gap) });
  // cards/DishCard.tsx: photograph, the dish in the display face, the kitchen in italic
  const dishCard = (d, n) => {
    const { x, y } = cell(n);
    return (
      `<rect x="${x}" y="${y}" width="${GRID.w}" height="${GRID.h}" fill="${P.cream}"/>` +
      `<use href="#${photos.get(d.title).id}" x="${x}" y="${y}"/>` +
      `<rect x="${x + 0.5}" y="${y + 0.5}" width="${GRID.w - 1}" height="${GRID.h - 1}" fill="none" stroke="${P.ink}" stroke-opacity=".1"/>` +
      t(d.title, { font: "display", size: 15, x: x + 10, y: y + GRID.photo + 19, fill: P.ink, tracking: -0.005 }) +
      italic(d.partner, { size: 11, x: x + 10, y: y + GRID.photo + 33, fill: P.smoke, tracking: 0.02 })
    );
  };
  s1.push(`<g class="a1" opacity="0">${gridAll.map(dishCard).join("")}</g>`);
  const HOVER = { n: 2, at: 3.5 };
  rule("lift", `0%,${p(HOVER.at)}{transform:none}${p(HOVER.at + 0.25)},100%{transform:translateY(-4px)}`, EASE);
  gridCuisine.forEach((d, n) => {
    const body = `<g class="in" style="${delay(CLICK + 0.14 + n * 0.07)}">${dishCard(d, n)}</g>`;
    s1.push(n === HOVER.n ? `<g class="lift" transform="translate(0 -4)">${body}</g>` : body);
  });
  const target = pillAt[CUISINE];
  const over = { x: cell(HOVER.n).x + GRID.w * 0.56, y: cell(HOVER.n).y + GRID.photo * 0.62 };
  rule("c1", `0%,${p(0.45)}{${move(L + W * 0.55, 236)}}${p(1.2)},${p(2.5)}{${move(target.x + 4, target.y + 3)}}${p(3.3)},100%{${move(over.x, over.y)}}`, EASE);
  span("r1", CLICK - 0.1, CLICK + 0.2, 0.1);
  s1.push(ring("r1", target.x + 4, target.y + 3, P.chilli), cursor("c1", over.x.toFixed(1), over.y.toFixed(1)));

  // ── Scene 2: the kitchen lineup fills in ───────────────────────────────────
  const s2 = [header(1, lineup.eyebrow.toUpperCase())];
  s2.push(t(lineup.headline, { font: "display", size: 30, x: L, y: 73, fill: P.chilli, tracking: -0.02 }));
  const linkType = { font: "bodyBold", size: 10.5, tracking: 0.08 };
  const link = INLINE.srcHome.lineupLink.toUpperCase();
  const lw = w(link, linkType);
  s2.push(
    t(link, { ...linkType, x: R - 16 - lw, y: 71, fill: P.ink }),
    `<path d="M${R - 12} 67.5h10m-4-3.5l4 3.500-4 3.500" fill="none" stroke="${P.ink}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<rect x="${(R - 16 - lw).toFixed(1)}" y="75" width="${(lw + 16).toFixed(1)}" height="1" fill="${P.ink}"/>`,
  );
  const LIST = { y: 92, cols: 3, gap: 24, rows: Math.ceil(kitchens.length / 3) };
  LIST.w = (W - LIST.gap * (LIST.cols - 1)) / LIST.cols;
  LIST.h = (CARD.h - 24 - LIST.y) / LIST.rows;
  if (LIST.h < 28) fail(`the lineup has ${kitchens.length} kitchens; its rows no longer fit`);
  kitchens.forEach((k, n) => {
    const x = L + Math.floor(n / LIST.rows) * (LIST.w + LIST.gap);
    const y = LIST.y + (n % LIST.rows) * LIST.h;
    s2.push(
      `<g class="in" style="${delay(S[1] + 0.5 + n * 0.11)}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${LIST.w.toFixed(1)}" height="1" fill="${P.stone}"/>` +
        t(k.name, { font: "display", size: 16.5, x, y: y + 18.5, fill: P.ink, tracking: -0.005 }) +
        italic(k.dish, { size: 11, x, y: y + 31, fill: P.smoke, tracking: 0.02 }) +
        "</g>",
    );
  });

  // ── Scene 3: the concierge ─────────────────────────────────────────────────
  const s3 = [header(2, INLINE.srcAssistant.title.toUpperCase(), true)];
  const PANEL = { x: R - 440, y: 44, w: 440, h: 304 };
  // motion/MarqueeTicker.tsx, running across the page behind the panel
  const band = { y: 196, size: 31 };
  let mx = 0;
  const track = [];
  for (let n = 0; n < 2; n++) {
    for (const phrase of INLINE.srcMarquee.phrases) {
      track.push(t(phrase, { font: "display", size: band.size, x: mx + 22, y: band.y + 11, fill: P.cream }));
      mx += w(phrase, { font: "display", size: band.size }) + 44;
      track.push(asterisk(mx, band.y - 9, 18, P.chilli));
      mx += 18;
    }
  }
  rule("mq", `0%{transform:translateX(${L - 40}px)}100%{transform:translateX(${L - 40 - T * 22}px)}`);
  s3.push(
    `<path d="M${X} ${band.y - 40.5}H${CARD.w}M${X} ${band.y + 40.5}H${CARD.w}" stroke="${P.charcoal}"/>`,
    `<g class="mq" transform="translate(${L - 40 - S[2] * 22} 0)">${track.join("")}</g>`,
  );

  // components/chat/AIAssistant.tsx: header, conversation, composer, footer
  const C = { x: PANEL.x, y: PANEL.y, r: PANEL.x + PANEL.w, pad: 16, head: 40, form: PANEL.y + PANEL.h - 64 };
  const body = { font: "body", size: 11.5 };
  const tiny = { font: "mono", size: 9, tracking: 0.08 };
  const readAloud = INLINE.srcAssistant.readAloud.toUpperCase();
  const raw = 9 + 12 + 5 + w(readAloud, tiny) + 9;
  const rax = C.r - 16 - 22 - raw;
  s3.push(
    `<rect x="${C.x + 0.5}" y="${C.y + 3.5}" width="${PANEL.w - 1}" height="${PANEL.h - 1}" rx="10" fill="#000" opacity=".5"/>`,
    `<rect x="${C.x + 0.5}" y="${C.y + 0.5}" width="${PANEL.w - 1}" height="${PANEL.h - 1}" rx="10" fill="${P.cream}" stroke="${P.stone}"/>`,
    stamp(C.x + 14, C.y + 8, 25),
    t(INLINE.srcAssistant.title, { font: "display", size: 14.5, x: C.x + 48, y: C.y + 19, fill: P.ink }),
    t(INLINE.srcAssistant.subtitle.toUpperCase(), { font: "mono", size: 9, x: C.x + 48, y: C.y + 31.5, fill: P.smoke, tracking: 0.16 }),
    `<rect x="${rax.toFixed(1)}" y="${C.y + 9.5}" width="${raw.toFixed(1)}" height="22" rx="11" fill="none" stroke="${P.stone}"/>`,
    icon(ICON.speakerOff, rax + 9, C.y + 14.5, 12, P.ink),
    t(readAloud, { ...tiny, x: rax + 26, y: C.y + 23.7, fill: P.ink }),
    icon(ICON.close, C.r - 30, C.y + 14, 13, P.ink),
    `<path d="M${C.x + 1} ${C.y + C.head + 0.5}H${C.r - 1}M${C.x + 1} ${C.form + 0.5}H${C.r - 1}" stroke="${P.stone}"/>`,
  );

  // the composer: mic, input, send
  const INPUT = { x: C.x + 54, y: C.form + 9, w: PANEL.w - 108, h: 30 };
  const TYPE = { at: S[2] + 0.7, dur: 1.1 };
  const SEND = TYPE.at + TYPE.dur + 0.35;
  const typed = w(QUESTION, body) + 3;
  defs.push(`<clipPath id="inp"><rect x="${INPUT.x + 1}" y="${INPUT.y + 1}" width="${INPUT.w - 2}" height="${INPUT.h - 2}"/></clipPath>`);
  rule("ph", `0%,${p(TYPE.at)}{opacity:1}${p(TYPE.at + 0.01)},${p(SEND + 0.1)}{opacity:0}${p(SEND + 0.25)},100%{opacity:1}`);
  rule("ty", `0%,${p(TYPE.at)}{opacity:0}${p(TYPE.at + 0.01)},${p(SEND)}{opacity:1}${p(SEND + 0.1)},100%{opacity:0}`);
  rule("tc", `0%,${p(TYPE.at)}{transform:translateX(0);animation-timing-function:steps(${QUESTION.length},end)}${p(TYPE.at + TYPE.dur)},100%{transform:translateX(${typed.toFixed(1)}px)}`);
  rule("sd", `0%,${p(TYPE.at)}{opacity:.4}${p(TYPE.at + 0.2)},${p(SEND)}{opacity:1}${p(SEND + 0.15)},100%{opacity:.4}`);
  s3.push(
    `<circle cx="${C.x + 31}" cy="${INPUT.y + 15}" r="14.5" fill="${P.bone}" stroke="${P.stone}"/>`,
    icon(ICON.mic, C.x + 24, INPUT.y + 8, 14, P.chilliDeep, 1.6),
    `<rect x="${INPUT.x + 0.5}" y="${INPUT.y + 0.5}" width="${INPUT.w - 1}" height="${INPUT.h - 1}" rx="6" fill="${P.cream}" stroke="${P.stone}"/>`,
    `<g class="ph">${t(INLINE.srcAssistant.placeholder, { ...body, x: INPUT.x + 10, y: INPUT.y + 19, fill: P.ash })}</g>`,
    `<g class="ty" opacity="0" clip-path="url(#inp)">${t(QUESTION, { ...body, x: INPUT.x + 10, y: INPUT.y + 19, fill: P.ink })}` +
      `<g class="tc"><rect x="${INPUT.x + 9}" y="${INPUT.y + 6}" width="${(typed + 4).toFixed(1)}" height="18" fill="${P.cream}"/><rect x="${INPUT.x + 9.500}" y="${INPUT.y + 8}" width="1.2" height="14" fill="${P.ink}"/></g></g>`,
    `<g class="sd" opacity=".4"><circle cx="${C.r - 31}" cy="${INPUT.y + 15}" r="15" fill="${P.chilliDeep}"/>${icon(ICON.send, C.r - 38.5, INPUT.y + 8, 14, P.bone, 1.6)}</g>`,
    t(INLINE.srcAssistant.footer.toUpperCase(), { font: "mono", size: 9, x: C.x + C.pad, y: C.y + PANEL.h - 10, fill: P.smoke, tracking: 0.12 }),
  );

  // before the question: the greeting and the product's suggestions
  const TOP = C.y + C.head + 12;
  const hello = [];
  wrap(glyphs, chat.greeting, { font: "body", size: 12 }, PANEL.w - 2 * C.pad).forEach((line, n) => hello.push(t(line, { font: "body", size: 12, x: C.x + C.pad, y: TOP + 11 + n * 17, fill: P.ink })));
  chat.suggestions.forEach((s, n) => {
    const y = TOP + 44 + n * 29;
    hello.push(`<rect x="${C.x + C.pad + 0.5}" y="${y + 0.5}" width="${PANEL.w - 2 * C.pad - 1}" height="23" rx="6" fill="${P.bone}" stroke="${P.stone}"/>`, t(s, { ...body, x: C.x + C.pad + 11, y: y + 16, fill: P.ink }));
  });
  if (TOP + 44 + chat.suggestions.length * 29 > C.form) fail("the concierge's suggestions no longer fit its panel");
  until("g3", SEND, 0.15);
  s3.push(`<g class="g3" opacity="0">${hello.join("")}</g>`);

  // the question, then the reply of the site's canned router, streamed by line
  const qw = w(QUESTION, body) + 26;
  on("q3", SEND + 0.05, 0.2);
  s3.push(`<g class="q3"><path d="M${C.r - C.pad - qw + 10} ${TOP}h${qw - 14}a4 4 0 0 1 4 4v12a10 10 0 0 1-10 10h${-(qw - 20)}a10 10 0 0 1-10-10v-6a10 10 0 0 1 10-10z" fill="${P.chilliDeep}"/>${t(QUESTION, { ...body, x: C.r - C.pad - qw + 13, y: TOP + 17, fill: P.bone })}</g>`);

  // MarkdownMessage's inline grammar, as far as the reply uses it: **bold** and [label](href)
  const words = [];
  for (const m of exchange.answer.matchAll(/\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)|([^*[]+)/g)) {
    const style = m[1] !== undefined ? { font: "bodyBold", fill: P.ink } : m[2] !== undefined ? { font: "bodyBold", fill: P.chilliDeep } : { font: "body", fill: P.ink };
    for (const word of (m[1] ?? m[2] ?? m[4]).split(" ").filter(Boolean)) words.push({ word, ...style });
  }
  const BUBBLE = { x: C.x + C.pad, y: TOP + 36, w: Math.round((PANEL.w - 2 * C.pad) * 0.85), lh: 16 };
  const space = w("n n", body) - w("nn", body);
  const lines = [[]];
  let lx = 0;
  for (const item of words) {
    const ww = w(item.word, { font: item.font, size: body.size });
    // punctuation that follows a styled run stays attached to it
    const glue = /^[.,;:]/.test(item.word) ? 0 : space;
    if (lx && lx + glue + ww > BUBBLE.w - 26) {
      lines.push([]);
      lx = 0;
    }
    const at = lx ? lx + glue : 0;
    lines.at(-1).push({ ...item, x: at });
    lx = at + ww;
  }
  BUBBLE.h = lines.length * BUBBLE.lh + 15;
  const ANSWER = SEND + 0.95;
  const STREAM = 0.55;
  const DONE = ANSWER + lines.length * STREAM;
  span("d3", SEND + 0.3, ANSWER - 0.2, 0.15);
  on("a3", ANSWER - 0.05, 0.15);
  const bubble = (h, wd) => `<path d="M${BUBBLE.x + 4.5} ${BUBBLE.y + 0.5}h${wd - 14}a10 10 0 0 1 10 10v${h - 20}a10 10 0 0 1-10 10h${-(wd - 20)}a10 10 0 0 1-10-10v${-(h - 14)}a4 4 0 0 1 4-4z" fill="${P.bone}" stroke="${P.stone}"/>`;
  s3.push(
    `<g class="d3" opacity="0">${bubble(30, 54)}${[0, 1, 2].map((n) => `<circle class="dot" style="animation-delay:${(n * 0.15 - 1.2).toFixed(2)}s" cx="${BUBBLE.x + 18.5 + n * 9}" cy="${BUBBLE.y + 15.5}" r="2.6" fill="${P.smoke}"/>`).join("")}</g>`,
  );
  const reply = [bubble(BUBBLE.h, BUBBLE.w)];
  lines.forEach((line, n) => {
    const y = BUBBLE.y + 19 + n * BUBBLE.lh;
    for (const item of line) reply.push(t(item.word, { font: item.font, size: body.size, x: BUBBLE.x + 13 + item.x, y, fill: item.fill }));
    rule(`l${n}`, `0%,${p(ANSWER + n * STREAM)}{transform:scaleX(1)}${p(ANSWER + (n + 1) * STREAM)},100%{transform:scaleX(0)}`);
    reply.push(`<rect class="box l${n}" transform="scale(0 1)" x="${BUBBLE.x + 11}" y="${y - 11.5}" width="${BUBBLE.w - 20}" height="${BUBBLE.lh}" fill="${P.bone}"/>`);
  });
  s3.push(`<g class="a3">${reply.join("")}</g>`);

  // MessageActions.tsx: copy, Listen, regenerate, the two thumbs
  const AY = BUBBLE.y + BUBBLE.h + 6;
  const LISTEN = DONE + 1.05;
  const listenW = (label) => 10 + 10 + 5 + w(label, tiny) + 11;
  const lw0 = listenW(INLINE.srcActions.listen.toUpperCase());
  const lxp = BUBBLE.x + 26;
  const listen = (label, glyph) =>
    `<rect x="${lxp + 0.5}" y="${AY + 0.5}" width="${(listenW(label) - 1).toFixed(1)}" height="21" rx="10.5" fill="${P.cream}" stroke="${P.chilliDeep}"/>${glyph}` + t(label, { ...tiny, x: lxp + 25, y: AY + 14.2, fill: P.chilliDeep });
  on("x3", DONE + 0.1, 0.2);
  until("p3", LISTEN, 0.1);
  on("s3", LISTEN, 0.1);
  const after = lxp + lw0 + 8;
  s3.push(
    `<g class="x3">${icon(ICON.copy, BUBBLE.x + 4, AY + 4.5, 13, P.smoke)}` +
      `<g class="s3">${listen(INLINE.srcActions.stop.toUpperCase(), `<rect x="${lxp + 10.5}" y="${AY + 7}" width="8" height="8" rx="1.5" fill="${P.chilliDeep}"/>`)}</g>` +
      `<g class="p3" opacity="0">${listen(INLINE.srcActions.listen.toUpperCase(), icon(ICON.play, lxp + 9, AY + 5.5, 11, P.chilliDeep))}</g>` +
      icon(ICON.regen, after, AY + 4.5, 13, P.smoke) +
      `<rect x="${after + 21}" y="${AY + 5}" width="1" height="12" fill="${P.stone}"/>` +
      icon(ICON.thumb, after + 29, AY + 4.5, 13, P.smoke) +
      `<path d="${ICON.thumb}" transform="translate(${after + 50} ${AY + 17.5}) scale(.8125 -.8125)" fill="none" stroke="${P.smoke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
  );
  // FollowUpChips.tsx: what the product offers to answer next
  const chips = [];
  let cx = BUBBLE.x;
  let cy = AY + 29;
  for (const f of exchange.followUps) {
    const cw = w(f.toUpperCase(), tiny) + 20;
    if (cx > BUBBLE.x && cx + cw > C.r - C.pad) {
      cx = BUBBLE.x;
      cy += 25;
    }
    chips.push(`<rect x="${(cx + 0.5).toFixed(1)}" y="${cy + 0.5}" width="${(cw - 1).toFixed(1)}" height="20" rx="10" fill="none" stroke="${P.stone}"/>`, t(f.toUpperCase(), { ...tiny, x: cx + 10, y: cy + 13.7, fill: P.smoke }));
    cx += cw + 6;
  }
  if (cy + 21 > C.form - 5) fail("the concierge reply and its follow-ups no longer fit the panel");
  on("f3", DONE + 0.3, 0.25);
  s3.push(`<g class="f3">${chips.join("")}</g>`);

  const sendAt = { x: C.r - 29, y: INPUT.y + 17 };
  const listenAt = { x: lxp + lw0 * 0.6, y: AY + 13 };
  on("k3", TYPE.at + 0.4, 0.2);
  rule("c3", `0%,${p(TYPE.at + 0.6)}{${move(C.x + 250, C.y + 170)}}${p(SEND - 0.25)},${p(DONE + 0.3)}{${move(sendAt.x, sendAt.y)}}${p(LISTEN - 0.2)},100%{${move(listenAt.x, listenAt.y)}}`, EASE);
  span("r3", SEND - 0.12, SEND + 0.15, 0.1);
  span("r4", LISTEN - 0.12, LISTEN + 0.15, 0.1);
  s3.push(ring("r3", sendAt.x, sendAt.y, P.bone), ring("r4", listenAt.x, listenAt.y, P.chilli), `<g class="k3">${cursor("c3", listenAt.x.toFixed(1), listenAt.y.toFixed(1))}</g>`);
  if (LISTEN + 1.2 > T - FADE) fail("the concierge scene runs past the loop");

  // The dish browser, filtered, is the still frame.
  const stage = `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${P.parchment}"/>` + scene(1, P.cream, s2.join("")) + scene(2, P.ink, s3.join("")) + scene(0, P.parchment, s1.join(""));

  return {
    svg: card({
      title: `Eatropolis, the website for Auckland’s one-day culinary festival at Shed 10 on 10 October 2026. The card shows its dish browser filtering ${dishes.length} signature dishes by cuisine, its lineup of ${kitchens.length} kitchens filling in, and its concierge answering a visitor’s question about the venue.`,
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body: stage + identity.join("") + `<rect x="${X - 0.5}" width="1" height="${CARD.h}" fill="#3a3632"/>`,
      radius: 14,
    }),
    facts: { scenes: S.length, dishes: dishes.length, shown: filtered.length, kitchens: kitchens.length, photos: photos.size, loop: `${T.toFixed(1)}s` },
  };
}
