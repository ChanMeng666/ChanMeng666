// FemTech Weekend card. The stage is the site at work, redrawn in vectors: the
// home page switching from English to Simplified Chinese, the Shanghai Summit
// 2026 agenda filling in day by day, and a pitch application being filled,
// submitted and reviewed.
//
// It is drawn in the site's own design system (femtech-weekend-website:
// src/css/custom.css, tailwind.config, the ShanghaiSummit components): the
// bronze primary on its night ground, its own wordmark, a rule-and-caps kicker,
// squared controls, the paper tickets of the agenda page, and the type the
// site itself asks for: the reader's system serif, sans and mono. On the
// machine that builds this those are Georgia, Segoe UI and Courier New; they
// are read from the operating system at build time and not copied into this
// repo. The Chinese is set in Noto Sans SC (OFL): two static instances cut
// from the variable font and subset to the characters this card uses, in
// scripts/cards/fonts/femtech/. A new Chinese character needs a new subset
// (fontTools: instancer at wght 400 and 700, then subset to the text).
//
// Every string on the stage is the site's own. The copy is written out below
// and checked against the site's sources at build time (FEMTECH_INPUTS), so
// the build fails when the site stops saying it. Where the checkout is absent
// the card is not rebuilt and the committed SVG stands. The form shows no
// person or company: its values are options the form itself offers. No face,
// no partner logo, no price.
import { readFileSync, readdirSync } from "node:fs";

import { CARD, card, pct } from "../lib/svg-card/shell.mjs";

const SYSTEM = "C:/Windows/Fonts";
const SITE = "../femtech-weekend-website";
export const FEMTECH_FONTS = {
  display: `${SYSTEM}/georgia.ttf`,
  body: `${SYSTEM}/segoeui.ttf`,
  bodySemi: `${SYSTEM}/seguisb.ttf`,
  bodyBold: `${SYSTEM}/segoeuib.ttf`,
  mono: `${SYSTEM}/courbd.ttf`,
  zh: "scripts/cards/fonts/femtech/NotoSansSC-Regular-subset.ttf",
  zhBold: "scripts/cards/fonts/femtech/NotoSansSC-Bold-subset.ttf",
};
export const FEMTECH_INPUTS = {
  serif: FEMTECH_FONTS.display,
  sans: FEMTECH_FONTS.body,
  sansSemi: FEMTECH_FONTS.bodySemi,
  sansBold: FEMTECH_FONTS.bodyBold,
  mono: FEMTECH_FONTS.mono,
  config: `${SITE}/docusaurus.config.ts`,
  en: `${SITE}/i18n/en/code.json`,
  zh: `${SITE}/i18n/zh-Hans/code.json`,
  navEn: `${SITE}/i18n/en/docusaurus-theme-classic/navbar.json`,
  navZh: `${SITE}/i18n/zh-Hans/docusaurus-theme-classic/navbar.json`,
  announcement: `${SITE}/src/theme/AnnouncementBar/Content/index.tsx`,
  summit: `${SITE}/src/data/shanghai-summit.ts`,
  dayIndex: `${SITE}/src/components/ShanghaiSummit/DayIndex.tsx`,
  agendaDay: `${SITE}/src/components/ShanghaiSummit/DetailedAgendaDay.tsx`,
  pitch: `${SITE}/src/pages/shanghai-summit/pitch.tsx`,
  success: `${SITE}/src/components/ShanghaiSummit/FormSuccess.tsx`,
  review: `${SITE}/src/pages/admin/applications.tsx`,
  functions: `${SITE}/functions/api`,
};

// The site's colours (custom.css tokens; the agenda page's paper-ticket palette).
const C = {
  bronze: "#AA7C52", bronzeLight: "#DBBB9A", night: "#060911", onNight: "#F4EFE8", onNightSoft: "#B9B1A6",
  ink: "#09090B", soft: "#71717A", line: "#E4E4E7", muted: "#F4F4F5", white: "#FFFFFF", bar: "#0A0A0A",
  paper: "#FBF8F3", paperDeep: "#F4EDE0", paperMuted: "#F5F1EB", strip: "#EDE6D6", ticketInk: "#7E5836",
  green: "#15803D", greenSoft: "#DCFCE7", amber: "#FFFBEB",
};

// ── Copy, as the site has it ─────────────────────────────────────────────────
const PAGE = {
  en: {
    url: "femtechweekend.com",
    bar: ["Shanghai Summit 2026", " — Cross-Border Capital & Partnerships in Women's Health | June 22-25, Shanghai"],
    title: "Femtech Weekend", items: ["About Us", "Insights", "Stories", "Opinions"], locale: "English", search: "Search",
    word: "Rooted In China", sub: "WE PIONEER WOMEN'S HEALTH INNOVATION IN CHINA TO DRIVE WORLDWIDE IMPACT", cta: "Explore Insights",
  },
  zh: {
    url: "femtechweekend.com/zh-Hans/",
    bar: ["2026上海峰会", " — 女性健康跨境资本与合作 | 6月22-25日，上海"],
    title: "FemTech Weekend 女性健康科技周末", items: ["关于我们", "洞察", "人物故事", "观点"], locale: "简体中文", search: "搜索",
    word: "植根中国", sub: "我们在中国开创女性健康创新，推动全球影响", cta: "快速开始",
  },
};
// DayIndex.tsx: the three tickets of the agenda page
const TICKETS = [
  { number: "01", label: "DAY 1", date: "Jun 22", title: "Flagship Conference", note: "4 tracks · 16 sessions" },
  { number: "02", label: "DAY 2", date: "Jun 23", title: "Pitch & Investor 1:1", note: "12 pitches · closed-door" },
  { number: "03–04", label: "DAY 3 & 4", date: "Jun 24–25", title: "Park & Enterprise Visits", note: "Government-guided" },
];
const ADMIT = "ADMIT ONE";
// shanghai-summit.ts › DETAILED_AGENDA_DAYS: four sessions of each day
const DAYS = [
  {
    day: 1, date: "June 22, 2026", title: "The Flagship Conference",
    sessions: [
      ["08:00", "08:30", "registration", "Registration & Networking"],
      ["08:30", "08:40", "opening", "Opening Remarks"],
      ["09:20", "09:40", "keynote", "Keynote: Investing in Women's Health — Why the Market is Now"],
      ["11:30", "12:10", "panel", "Panel: Patient-Centred Innovation in Women's Health"],
    ],
  },
  {
    day: 2, date: "June 23, 2026", title: "Pitch Day & Investor 1:1",
    sessions: [
      ["08:00", "09:00", "registration", "Registration & Networking"],
      ["09:30", "11:00", "pitch", "Pitch Session 1 — Clinical / Digital Health · 6 × 15 min"],
      ["14:00", "16:00", "matchmaking", "Founders meet at least 5 investors"],
      ["16:00", "16:30", "discussion", "Group Discussion"],
    ],
  },
];
// DetailedAgendaDay.tsx: a session type's label and the way its pill is drawn
const TYPES = {
  registration: ["Registration", "muted"], opening: ["Opening", "solid"], keynote: ["Keynote", "solid"], panel: ["Panel", "outline"],
  pitch: ["Pitch", "solid"], matchmaking: ["1:1 Matching", "outline"], discussion: ["Discussion", "outline"],
};
// pitch.tsx: the second step of the pitch application
const FORM = {
  url: "femtechweekend.com/shanghai-summit/pitch",
  steps: ["Contact Information", "Company Profile"],
  select: "Select...",
  fields: [
    ["Company Type", "Digital health / care delivery"],
    ["Primary Women's Health Focus", "Perimenopause / Menopause"],
    ["Business Model", "B2B2C (clinics to patients)"],
    ["Annual Revenue", "Pre-Revenue"],
  ],
  areasLabel: "Do you work in any of the following areas (select all that apply)",
  areas: ["Female Infertility", "Male Infertility", "Endometriosis", "PCOS", "Menopause", "Not listed"],
  ticked: ["Endometriosis", "Menopause"],
  back: "Back", submit: "Submit Application", submitting: "Submitting...",
  done: "Application Submitted", next: "What Happens Next",
  nextSteps: ["Application Review", "Invitation to Pitch", "Participation Confirmation"],
};
// admin/applications.tsx: the review table's tab, filters and statuses
const REVIEW = { tab: "Pitch Applications", filters: ["All", "Submitted", "Approved", "Rejected"], from: "submitted", to: "approved" };
const LABELS = ["Language switch", "Summit agenda", "Pitch application"];

const CJK = /[\u2E80-\u9FFF\uFF00-\uFFEF]/;
const rx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function buildFemtechCard({ glyphs, root }) {
  // ── The site's sources, and what the card takes from them ─────────────────
  const src = Object.fromEntries(
    ["config", "announcement", "summit", "dayIndex", "agendaDay", "pitch", "success", "review"].map((k) => [k, readFileSync(`${root}/${FEMTECH_INPUTS[k]}`, "utf8").replace(/\\'/g, "'")]),
  );
  const json = (k) => JSON.parse(readFileSync(`${root}/${FEMTECH_INPUTS[k]}`, "utf8"));
  const must = (ok, what) => {
    if (!ok) throw new Error(`femtech card: the site no longer has ${what}`);
  };
  const has = (k, s) => must(src[k].includes(s), `"${s}" in ${FEMTECH_INPUTS[k]}`);
  // a whole string literal, whichever quotes the source wrote it in
  const said = (k, s) => must(new RegExp(`(['"])${rx(s)}\\1`).test(src[k]), `"${s}" in ${FEMTECH_INPUTS[k]}`);

  for (const [l, code, nav] of [["en", json("en"), json("navEn")], ["zh", json("zh"), json("navZh")]]) {
    const P = PAGE[l];
    must(code["homepage.hero.rotating.word1"].message === P.word, `the ${l} hero word`);
    must(code["homepage.hero.subtitle"].message === P.sub, `the ${l} hero subtitle`);
    must(code["homepage.hero.cta.start"].message === P.cta, `the ${l} hero button`);
    must(code["theme.SearchBar.label"].message === P.search, `the ${l} search label`);
    must(nav.title.message === P.title, `the ${l} navbar title`);
    P.items.forEach((item, n) => must(nav[`item.label.${PAGE.en.items[n]}`].message === item, `the ${l} navbar item "${item}"`));
    has(l === "en" ? "config" : "announcement", `${P.bar[0]}</a></b>${P.bar[1]}`);
  }
  const locales = src.config.match(/locales: \[([^\]]*)\]/)[1].split(",").length;
  const forms = readdirSync(`${root}/${FEMTECH_INPUTS.functions}`).filter((f) => /^submit-(programme|speaker|pitch|ecosystem)\.js$/.test(f)).length;
  must(locales === 2 && forms === 4, "two locales and four application forms");

  for (const t of TICKETS) for (const s of [`number: '${t.number}'`, `en: '${t.label}'`, `en: '${t.date}'`, `en: '${t.title}'`, `en: '${t.note}'`]) has("dayIndex", s);
  has("dayIndex", `en: '${ADMIT}'`);
  for (const d of DAYS) {
    must(new RegExp(`day: ${d.day},\\s*date: \\{ en: '${rx(d.date)}'[^}]*\\},\\s*title: \\{\\s*en: '${rx(d.title)}'`).test(src.summit), `day ${d.day} as "${d.title}"`);
    for (const [a, b, type, title] of d.sessions) {
      must(new RegExp(`startTime: '${a}', endTime: '${b}', type: '${type}',\\s*title: \\{\\s*en: '${rx(title)}'`).test(src.summit), `the session "${title}" at ${a}`);
    }
  }
  for (const [type, [label, variant]] of Object.entries(TYPES)) {
    has("agendaDay", `${type}: { en: '${label}'`);
    has("agendaDay", `${type}: '${variant}'`);
  }
  has("pitch", `steps: ['${FORM.steps.join("', '")}']`);
  for (const [label, value] of FORM.fields) {
    said("pitch", label);
    said("summit", value);
  }
  for (const s of [FORM.select, FORM.areasLabel, FORM.back, FORM.submit, FORM.submitting, FORM.done, ...FORM.nextSteps]) said("pitch", s);
  for (const s of FORM.areas) said("summit", s);
  said("success", FORM.next);
  said("review", REVIEW.tab);
  has("review", `['${REVIEW.filters.map((f) => f.toLowerCase()).join("', '")}']`);

  // ── Text: Latin in the site's system faces, Chinese in Noto Sans SC ───────
  const ZH = { body: "zh", display: "zh", mono: "zh", bodySemi: "zhBold", bodyBold: "zhBold" };
  const runs = (str, font) => {
    const out = [];
    for (const ch of str) {
      const f = CJK.test(ch) ? ZH[font] : font;
      if (out.length && out.at(-1).font === f) out.at(-1).s += ch;
      else out.push({ s: ch, font: f });
    }
    return out;
  };
  const mw = (str, { font, size, tracking = 0 }) => runs(str, font).reduce((w, r, n) => w + glyphs.measure(r.s, { font: r.font, size, tracking }) + (n ? tracking * size : 0), 0);
  const tx = (str, { font, size, x, y, fill, anchor = "start", tracking = 0, attrs }) => {
    let at = anchor === "middle" ? x - mw(str, { font, size, tracking }) / 2 : anchor === "end" ? x - mw(str, { font, size, tracking }) : x;
    return runs(str, font)
      .map((r) => {
        const out = glyphs.text(r.s, { font: r.font, size, x: at, y, fill, tracking, attrs });
        at += glyphs.measure(r.s, { font: r.font, size, tracking }) + tracking * size;
        return out;
      })
      .join("");
  };
  const caps = (str, o) => tx(str.toUpperCase(), { font: "bodySemi", tracking: 0.15, ...o });
  const capsW = (str, o) => mw(str.toUpperCase(), { font: "bodySemi", tracking: 0.15, ...o });

  // ── Timeline: three scenes on one loop ─────────────────────────────────────
  const LEN = [6.0, 6.8, 8.6];
  const AT = LEN.map((_, i) => LEN.slice(0, i).reduce((a, b) => a + b, 0));
  const T = LEN.reduce((a, b) => a + b, 0);
  const STILL = 1; // the agenda is the frame a reader with motion off sees
  const p = (t) => pct(t, T, 3);
  const css = [];
  let serial = 0;
  const anim = (frames, extra = "") => {
    const name = `f${(serial++).toString(36)}`;
    css.push(`@keyframes ${name}{${frames}}.${name}{animation:${name} ${T}s linear infinite${extra}}`);
    return name;
  };
  const rise = (dy) => (dy ? `;transform:translateY(${dy}px)` : "");
  // shown from t onward (part of the finished frame); until t; only between a and b
  const on = (t, inner, { d = 0.25, dy = 0 } = {}) => `<g class="${anim(`0%,${p(t)}{opacity:0${rise(dy)}}${p(t + d)},100%{opacity:1${dy ? ";transform:none" : ""}}`)}">${inner}</g>`;
  const until = (t, inner, d = 0.2) => `<g class="${anim(`0%,${p(t)}{opacity:1}${p(t + d)},100%{opacity:0}`)}" opacity="0">${inner}</g>`;
  const span = (a, b, inner, { d = 0.25, dy = 0, still = false } = {}) =>
    `<g class="${anim(`0%,${p(a)}{opacity:0${rise(dy)}}${p(a + d)},${p(b - d)}{opacity:1${dy ? ";transform:none" : ""}}${p(b)},100%{opacity:0}`)}"${still ? "" : ' opacity="0"'}>${inner}</g>`;
  // a pointer that travels between [t, x, y] stops, and the ring of a click
  const POINTER = `<path d="M0 0v13.2l3.3-3 2.3 5.2 2.2-1-2.3-5.1h4.6z" fill="#fff" stroke="#111" stroke-width="1" stroke-linejoin="round"/>`;
  const pointer = (stops, a, b) => {
    const frames = stops.map(([t, x, y]) => `${p(t)}{transform:translate(${x.toFixed(1)}px,${y.toFixed(1)}px);animation-timing-function:cubic-bezier(.4,0,.2,1)}`).join("");
    const [, x0, y0] = stops[0];
    const [, x1, y1] = stops.at(-1);
    return span(a, b, `<g class="${anim(`0%{transform:translate(${x0.toFixed(1)}px,${y0.toFixed(1)}px)}${frames}100%{transform:translate(${x1.toFixed(1)}px,${y1.toFixed(1)}px)}`)}">${POINTER}</g>`);
  };
  const click = (t, x, y) =>
    `<circle class="${anim(`0%,${p(t)}{opacity:0;transform:scale(.3)}${p(t + 0.06)}{opacity:.75}${p(t + 0.4)},100%{opacity:0;transform:scale(1)}`, ";transform-box:fill-box;transform-origin:center")}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="none" stroke="${C.bronze}" stroke-width="1.6" opacity="0"/>`;

  const defs = [
    `<pattern id="grain" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="${C.bronzeLight}" opacity=".13"/></pattern>`,
    `<pattern id="dots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#6B4F37" opacity=".16"/></pattern>`,
    `<linearGradient id="hero" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2B2F3A"/><stop offset=".55" stop-color="#151922"/><stop offset="1" stop-color="#0A0D14"/></linearGradient>`,
    `<radialGradient id="glow" cx=".78" cy=".9" r=".7"><stop offset="0" stop-color="${C.bronze}" stop-opacity=".42"/><stop offset="1" stop-color="${C.bronze}" stop-opacity="0"/></radialGradient>`,
    `<linearGradient id="ticket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.paper}"/><stop offset="1" stop-color="${C.paperDeep}"/></linearGradient>`,
    `<symbol id="mark" viewBox="0 0 1188 1116">${readFileSync(`${root}/public/brands/femtech-weekend-mark.svg`, "utf8").match(/<svg[^>]*viewBox="0 0 1188 1116"[^>]*>([\s\S]*?)<\/svg>/)[1]}</symbol>`,
  ];

  // ── Shared pieces: a browser window, the site's navbar ─────────────────────
  const X = CARD.panel;
  const WIN = { x: X + 28, y: 16, w: 744, h: 310, bar: 24 };
  let clips = 0;
  const windowOf = ({ x = WIN.x, w = WIN.w, urls, inner }) => {
    const id = `w${clips++}`;
    defs.push(`<clipPath id="${id}"><rect x="${x}" y="${WIN.y}" width="${w}" height="${WIN.h}" rx="7"/></clipPath>`);
    const pill = Math.min(300, w - 150);
    return (
      `<g clip-path="url(#${id})"><rect x="${x}" y="${WIN.y}" width="${w}" height="${WIN.h}" fill="${C.white}"/>${inner}` +
      `<rect x="${x}" y="${WIN.y}" width="${w}" height="${WIN.bar}" fill="#1C1F29"/>` +
      [0, 1, 2].map((n) => `<circle cx="${x + 14 + n * 11}" cy="${WIN.y + 12}" r="3" fill="#454A58"/>`).join("") +
      `<rect x="${x + w / 2 - pill / 2}" y="${WIN.y + 4.5}" width="${pill}" height="15" rx="7.5" fill="#0D1017"/>${urls(x + w / 2, WIN.y + 15.5)}</g>` +
      `<rect x="${x + 0.5}" y="${WIN.y + 0.5}" width="${w - 1}" height="${WIN.h - 1}" rx="6.5" fill="none" stroke="#fff" stroke-opacity=".16"/>`
    );
  };
  const url = (s) => (cx, y) => tx(s, { font: "body", size: 9.5, x: cx, y, fill: C.onNightSoft, anchor: "middle" });

  const NAV = { h: 30 };
  // where the language control sits; the English page decides it, so the menu opens under the same spot
  const localeAt = (x, w, L) => {
    const searchX = x + w - 12 - 92;
    const caretX = searchX - 44;
    const textEnd = caretX - 5;
    return { searchX, toggleX: searchX - 20, caretX, textEnd, iconX: textEnd - mw(PAGE[L].locale, { font: "body", size: 10 }) - 15 };
  };
  const navbar = (x, y, w, L) => {
    const P = PAGE[L];
    const g = localeAt(x, w, L);
    const mid = y + NAV.h / 2;
    const out = [`<rect x="${x}" y="${y}" width="${w}" height="${NAV.h}" fill="${C.white}"/><path d="M${x} ${y + NAV.h - 0.5}h${w}" stroke="${C.line}"/>`, `<use href="#mark" x="${x + 14}" y="${mid - 9}" width="18" height="18"/>`];
    out.push(tx(P.title, { font: "bodyBold", size: 10.5, x: x + 38, y: mid + 3.6, fill: C.ink }));
    let at = x + 38 + mw(P.title, { font: "bodyBold", size: 10.5 }) + 18;
    for (const item of P.items) {
      out.push(tx(item, { font: "body", size: 10, x: at, y: mid + 3.5, fill: "#1C1E21" }));
      at += mw(item, { font: "body", size: 10 }) + 15;
    }
    // language, colour mode, search
    out.push(`<g fill="none" stroke="#1C1E21" stroke-width=".9"><circle cx="${g.iconX + 5}" cy="${mid}" r="4.6"/><path d="M${g.iconX + 0.4} ${mid}h9.2M${g.iconX + 5} ${mid - 4.6}c-2.6 2.6-2.6 6.6 0 9.2c2.6-2.6 2.6-6.6 0-9.2"/></g>`);
    out.push(tx(P.locale, { font: "body", size: 10, x: g.textEnd, y: mid + 3.5, fill: "#1C1E21", anchor: "end" }));
    out.push(`<path d="M${g.caretX} ${mid - 1.5}l3 3.2 3-3.2z" fill="#1C1E21"/>`);
    out.push(`<circle cx="${g.toggleX}" cy="${mid}" r="5" fill="none" stroke="#1C1E21"/><path d="M${g.toggleX} ${mid - 5}a5 5 0 0 1 0 10z" fill="#1C1E21"/>`);
    out.push(`<rect x="${g.searchX}" y="${mid - 9.5}" width="92" height="19" rx="9.5" fill="#EBEDF0"/><g fill="none" stroke="${C.soft}" stroke-width="1.1"><circle cx="${g.searchX + 12}" cy="${mid - 0.5}" r="3.2"/><path d="M${g.searchX + 14.4} ${mid + 2}l2.6 2.6"/></g>`);
    out.push(tx(P.search, { font: "body", size: 9.5, x: g.searchX + 23, y: mid + 3.3, fill: C.soft }));
    return out.join("");
  };
  const arrow = (x, y, colour, down = false) => `<path transform="translate(${x} ${y})${down ? " rotate(90)" : ""}" d="M-4.5 0h9M1.5-3.2l3.2 3.2-3.2 3.2" fill="none" stroke="${colour}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`;

  // ── 1 · the home page, English then Simplified Chinese ─────────────────────
  const home = (t0) => {
    const { x, y, w, h, bar } = WIN;
    const top = y + bar;
    const cx = x + w / 2;
    const swap = t0 + 3.1;
    const page = (L) => {
      const P = PAGE[L];
      const zh = L === "zh";
      const out = [];
      // announcement bar: a linked title, then the line
      const linkW = mw(P.bar[0], { font: "bodyBold", size: 9 });
      const bx = cx - (linkW + mw(P.bar[1], { font: "body", size: 9 })) / 2;
      out.push(`<rect x="${x}" y="${top}" width="${w}" height="18" fill="${C.bar}"/>`);
      out.push(tx(P.bar[0], { font: "bodyBold", size: 9, x: bx, y: top + 12.3, fill: C.white }) + `<rect x="${bx.toFixed(1)}" y="${top + 13.8}" width="${linkW.toFixed(1)}" height=".7" fill="${C.white}"/>`);
      out.push(tx(P.bar[1], { font: "body", size: 9, x: bx + linkW, y: top + 12.3, fill: C.white }));
      out.push(`<path d="M${x + w - 16} ${top + 6}l6 6m0-6l-6 6" stroke="${C.white}" stroke-opacity=".7"/>`);
      out.push(navbar(x, top + 18, w, L));
      // hero copy
      const wordY = top + 48 + 104;
      out.push(tx(zh ? P.word : P.word.toUpperCase(), { font: "bodyBold", size: zh ? 46 : 44, x: cx, y: wordY, fill: C.white, anchor: "middle", tracking: 0.05 }));
      out.push(tx(P.sub, { font: "body", size: zh ? 10.5 : 9.5, x: cx, y: wordY + 30, fill: C.white, anchor: "middle", tracking: 0.2, attrs: 'opacity=".9"' }));
      const cw = mw(P.cta, { font: "bodySemi", size: 10.5 }) + 46;
      out.push(`<rect x="${(cx - cw / 2).toFixed(1)}" y="${wordY + 50}" width="${cw.toFixed(1)}" height="27" fill="${C.white}"/>`);
      out.push(tx(P.cta, { font: "bodySemi", size: 10.5, x: cx - cw / 2 + 15, y: wordY + 67.3, fill: "#000" }) + arrow(cx + cw / 2 - 17, wordY + 63.5, "#000"));
      return out.join("");
    };
    // the language menu, opened under the English control
    const g = localeAt(x, w, "en");
    const menu = { x: g.iconX - 10, y: top + 18 + NAV.h - 3, w: 100, row: 24 };
    const stopA = [g.iconX + 22, top + 18 + NAV.h / 2 + 1];
    const stopB = [menu.x + 34, menu.y + 5 + menu.row * 1.5];
    const dropdown =
      `<rect x="${menu.x + 1}" y="${menu.y + 2}" width="${menu.w}" height="${menu.row * 2 + 10}" rx="6" fill="#000" opacity=".16"/>` +
      `<rect x="${menu.x}" y="${menu.y}" width="${menu.w}" height="${menu.row * 2 + 10}" rx="6" fill="${C.white}" stroke="${C.line}"/>` +
      `<rect x="${menu.x + 5}" y="${menu.y + 5}" width="${menu.w - 10}" height="${menu.row}" rx="4" fill="${C.muted}"/>` +
      tx(PAGE.en.locale, { font: "body", size: 10.5, x: menu.x + 13, y: menu.y + 21, fill: C.bronze }) +
      span(t0 + 2.6, t0 + 3.3, `<rect x="${menu.x + 5}" y="${menu.y + 5 + menu.row}" width="${menu.w - 10}" height="${menu.row}" rx="4" fill="${C.muted}"/>`, { d: 0.12 }) +
      tx(PAGE.zh.locale, { font: "body", size: 10.5, x: menu.x + 13, y: menu.y + 21 + menu.row, fill: "#1C1E21" });
    const ground =
      `<rect x="${x}" y="${top + 48}" width="${w}" height="${h - bar - 48}" fill="url(#hero)"/><rect x="${x}" y="${top + 48}" width="${w}" height="${h - bar - 48}" fill="url(#glow)"/>` +
      // the chat button the site keeps in the corner
      `<circle cx="${x + w - 24}" cy="${y + h - 24}" r="11" fill="${C.bronze}"/><path d="M${x + w - 29} ${y + h - 27.5}h10v6.4h-5.6l-2.6 2.2v-2.2h-1.8z" fill="none" stroke="#fff" stroke-linejoin="round"/>`;
    return (
      windowOf({ urls: (ux, uy) => until(swap, url(PAGE.en.url)(ux, uy)) + on(swap, url(PAGE.zh.url)(ux, uy)), inner: ground + until(swap, page("en"), 0.25) + on(swap, page("zh")) + span(t0 + 1.9, t0 + 3.15, dropdown, { d: 0.14 }) }) +
      click(t0 + 1.8, ...stopA) +
      click(t0 + 2.95, ...stopB) +
      pointer([[t0 + 0.9, cx + 70, top + 236], [t0 + 1.7, ...stopA], [t0 + 2.2, ...stopA], [t0 + 2.75, ...stopB], [t0 + 3.4, ...stopB], [t0 + 4.3, cx + 150, top + 250]], t0 + 0.7, t0 + LEN[0])
    );
  };

  // ── 2 · the summit agenda: three tickets, and the day one of them opens ───
  const agenda = (t0) => {
    const { x, y, w, h, bar } = WIN;
    const top = y + bar;
    const turn = t0 + 3.5;
    const out = [navbar(x, top, w, "en")];
    // the ticket strip
    const strip = { y: top + NAV.h, h: 86 };
    const tk = { x: x + 16, y: strip.y + 10, w: (w - 32) / 3, h: 66 };
    out.push(`<rect x="${x}" y="${strip.y}" width="${w}" height="${strip.h}" fill="${C.strip}"/><rect x="${x}" y="${strip.y}" width="${w}" height="${strip.h}" fill="url(#dots)"/>`);
    const admitW = mw(ADMIT, { font: "mono", size: 9, tracking: 0.2 }) + 10;
    TICKETS.forEach((t, n) => {
      const tx0 = tk.x + n * tk.w;
      const numW = mw(t.number, { font: "display", size: 22 });
      const dateW = mw(t.date, { font: "bodySemi", size: 9.5 });
      const edge = (cls) => `<rect${cls} x="${(tx0 + 0.75).toFixed(1)}" y="${tk.y + 0.75}" width="${(tk.w - 1.5).toFixed(1)}" height="${tk.h - 1.5}" fill="none" stroke="${C.bronze}" stroke-width="1.5"/><rect${cls} x="${tx0.toFixed(1)}" y="${tk.y + tk.h - 3}" width="${tk.w.toFixed(1)}" height="3" fill="${C.bronze}"/>`;
      out.push(
        on(
          t0 + 0.25 + n * 0.15,
          `<rect x="${tx0.toFixed(1)}" y="${tk.y}" width="${tk.w.toFixed(1)}" height="${tk.h}" fill="url(#ticket)"/>` +
            tx(t.number, { font: "display", size: 22, x: tx0 + 14, y: tk.y + 27, fill: C.bronze }) +
            caps(t.label, { size: 9, x: tx0 + 14 + numW + 8, y: tk.y + 27, fill: C.soft, tracking: 0.2 }) +
            `<rect x="${(tx0 + tk.w - 14 - admitW).toFixed(1)}" y="${tk.y + 14.5}" width="${admitW.toFixed(1)}" height="16" fill="none" stroke="${C.bronze}" stroke-opacity=".5"/>` +
            tx(ADMIT, { font: "mono", size: 9, x: tx0 + tk.w - 14 - admitW + 5.5, y: tk.y + 25.7, fill: C.bronze, tracking: 0.2 }) +
            tx(t.title, { font: "display", size: 13.5, x: tx0 + 14, y: tk.y + 45.5, fill: C.ink }) +
            tx(t.date, { font: "bodySemi", size: 9.5, x: tx0 + 14, y: tk.y + 59, fill: "#3F3F46" }) +
            `<rect x="${(tx0 + 14 + dateW + 6).toFixed(1)}" y="${tk.y + 55.5}" width="10" height="1" fill="${C.bronze}" opacity=".5"/>` +
            tx(t.note, { font: "body", size: 9.5, x: tx0 + 14 + dateW + 22, y: tk.y + 59, fill: C.soft }) +
            // the perforation between two tickets, with its notches
            (n ? `<path d="M${tx0.toFixed(1)} ${tk.y + 6}V${tk.y + tk.h - 6}" stroke="${C.bronze}" stroke-opacity=".4" stroke-width="1.2" stroke-dasharray="3 3"/><circle cx="${tx0.toFixed(1)}" cy="${tk.y}" r="5" fill="${C.strip}"/><circle cx="${tx0.toFixed(1)}" cy="${tk.y + tk.h}" r="5" fill="${C.strip}"/>` : ""),
          { dy: 6 },
        ),
      );
      // the ticket whose day is open
      if (n === 0) out.push(span(t0 + 0.8, turn + 0.1, edge(""), { d: 0.15 }));
      if (n === 1) out.push(on(turn, edge(""), { d: 0.15 }));
    });
    // the day below
    const sec = { y: strip.y + strip.h, h: h - bar - NAV.h - strip.h };
    const row = { y: sec.y + 48, h: 29, time: x + 20, pill: x + 108, title: x + 212 };
    const day = (d, at) => {
      const o = [`<rect x="${x}" y="${sec.y}" width="${w}" height="${sec.h}" fill="${d.day === 1 ? C.paper : C.paperMuted}"/>`];
      const num = `0${d.day}`;
      o.push(tx(num, { font: "display", size: 150, x: x + w - 8, y: sec.y + sec.h + 14, fill: C.bronze, anchor: "end", tracking: -0.05, attrs: 'opacity=".06"' }));
      o.push(tx(num, { font: "display", size: 32, x: x + 20, y: sec.y + 35, fill: C.bronze, tracking: -0.04 }));
      const nx = x + 20 + mw(num, { font: "display", size: 32, tracking: -0.04 }) + 10;
      o.push(caps(`Day ${d.day}`, { size: 9, x: nx, y: sec.y + 21, fill: C.soft, tracking: 0.22 }) + tx(d.date, { font: "body", size: 10.5, x: nx, y: sec.y + 35, fill: "#27272A", tracking: 0.03 }));
      o.push(tx(d.title, { font: "display", size: 19, x: x + w - 20, y: sec.y + 33, fill: C.ink, anchor: "end" }));
      o.push(`<rect x="${x + 20}" y="${sec.y + 46}" width="${w - 40}" height="1" fill="${C.bronze}" opacity=".35"/>`);
      d.sessions.forEach(([a, b, type, title], n) => {
        const ry = row.y + n * row.h;
        const [label, variant] = TYPES[type];
        const lw = capsW(label, { size: 9, tracking: 0.16 });
        const dashX = row.time + mw(a, { font: "bodySemi", size: 10 }) + 5;
        o.push(
          on(
            at + 0.2 + n * 0.2,
            (n ? `<rect x="${x + 20}" y="${ry}" width="${w - 40}" height="1" fill="${C.line}" opacity=".7"/>` : "") +
              tx(a, { font: "bodySemi", size: 10, x: row.time, y: ry + 18.5, fill: C.bronze, tracking: 0.03 }) +
              `<rect x="${dashX.toFixed(1)}" y="${ry + 14.5}" width="7" height="1" fill="${C.soft}" opacity=".6"/>` +
              tx(b, { font: "bodySemi", size: 10, x: dashX + 12, y: ry + 18.5, fill: C.bronze, tracking: 0.03 }) +
              `<rect x="${row.pill}" y="${ry + 7.5}" width="${(lw + 12).toFixed(1)}" height="15" fill="${variant === "solid" ? C.bronze : "none"}"${variant === "solid" ? "" : ` stroke="${variant === "outline" ? C.bronze : "#D4D4D8"}" stroke-opacity="${variant === "outline" ? ".65" : "1"}"`}/>` +
              caps(label, { size: 9, x: row.pill + 6, y: ry + 18.2, fill: variant === "solid" ? C.white : variant === "outline" ? C.bronze : C.soft, tracking: 0.16 }) +
              tx(title, { font: "bodySemi", size: 11, x: row.title, y: ry + 18.7, fill: C.ink }),
            { dy: 5 },
          ),
        );
      });
      return o.join("");
    };
    out.push(until(turn, day(DAYS[0], t0 + 0.8), 0.25) + on(turn, day(DAYS[1], turn)));
    const stop = [tk.x + tk.w * 1.5 + 30, tk.y + 44];
    return (
      windowOf({ urls: url("femtechweekend.com/shanghai-summit/agenda"), inner: out.join("") }) +
      click(turn - 0.15, ...stop) +
      pointer([[t0 + 2.3, x + w / 2 + 40, sec.y + 96], [turn - 0.3, ...stop], [turn + 0.5, ...stop], [turn + 1.4, stop[0] + 60, stop[1] + 150]], t0 + 2.1, t0 + LEN[1])
    );
  };

  // ── 3 · a pitch application: filled, submitted, reviewed ───────────────────
  const application = (t0) => {
    const { y, h, bar } = WIN;
    const fx = WIN.x;
    const fw = 452;
    const top = y + bar;
    const out = [];
    const stops = [[t0 + 0.2, fx + 200, top + 250]];
    const rings = [];
    // step indicator: the first step done, the second open
    const stepW = FORM.steps.map((s) => mw(s, { font: "bodySemi", size: 10 }) + 40);
    let sx = fx + fw / 2 - (stepW[0] + stepW[1] + 40) / 2;
    FORM.steps.forEach((s, n) => {
      const open = n === 1;
      out.push(`<rect x="${sx.toFixed(1)}" y="${top + 12}" width="${stepW[n].toFixed(1)}" height="22" fill="${open ? C.bronze : "#F6F2EE"}"/><circle cx="${(sx + 16).toFixed(1)}" cy="${top + 23}" r="7" fill="${open ? "#fff" : C.bronze}" fill-opacity=".2"/>`);
      out.push(tx(String(n + 1), { font: "bodySemi", size: 9, x: sx + 16, y: top + 26.2, fill: open ? C.white : C.bronze, anchor: "middle" }) + tx(s, { font: "bodySemi", size: 10, x: sx + 28, y: top + 26.5, fill: open ? C.white : C.bronze }));
      sx += stepW[n];
      if (!n) out.push(`<rect x="${(sx + 8).toFixed(1)}" y="${top + 22.5}" width="24" height="1" fill="${C.line}"/>`);
      sx += 40;
    });
    // the form card
    const cardBox = { x: fx + 16, y: top + 44, w: fw - 32, h: 230 };
    const ix = cardBox.x + 16;
    const iw = cardBox.w - 32;
    const col = (iw - 14) / 2;
    out.push(`<rect x="${cardBox.x + 0.5}" y="${cardBox.y + 0.5}" width="${cardBox.w - 1}" height="${cardBox.h - 1}" fill="${C.white}" stroke="${C.line}"/><rect x="${cardBox.x}" y="${cardBox.y}" width="${cardBox.w}" height="2" fill="${C.bronze}" opacity=".3"/>`);
    const label = (s, lx, ly) => tx(s, { font: "bodySemi", size: 9.5, x: lx, y: ly, fill: C.ink });
    const field = (n, lx, ly, t) => {
      const [name, value] = FORM.fields[n];
      stops.push([t - 0.15, lx + col - 26, ly + 21], [t + 0.2, lx + col - 26, ly + 21]);
      rings.push(click(t, lx + col - 26, ly + 21));
      return (
        label(`${name} *`, lx, ly) +
        `<rect x="${(lx + 0.5).toFixed(1)}" y="${ly + 7.5}" width="${(col - 1).toFixed(1)}" height="25" fill="${C.white}" stroke="${C.line}"/>` +
        `<path d="M${(lx + col - 16).toFixed(1)} ${ly + 18.5}l3.2 3.2 3.2-3.2" fill="none" stroke="${C.soft}" stroke-width="1.1"/>` +
        until(t + 0.05, tx(FORM.select, { font: "body", size: 10, x: lx + 9, y: ly + 23.6, fill: C.soft }), 0.1) +
        on(t + 0.1, tx(value, { font: "body", size: 10, x: lx + 9, y: ly + 23.6, fill: C.ink }), { d: 0.15 }) +
        span(t - 0.05, t + 0.5, `<rect x="${(lx + 0.5).toFixed(1)}" y="${ly + 7.5}" width="${(col - 1).toFixed(1)}" height="25" fill="none" stroke="${C.bronze}" stroke-width="1.5"/>`, { d: 0.1 })
      );
    };
    const rowA = cardBox.y + 24;
    out.push(field(0, ix, rowA, t0 + 0.7) + field(1, ix + col + 14, rowA, t0 + 1.2));
    // the checkbox grid
    const rowB = rowA + 58;
    out.push(label(`${FORM.areasLabel} *`, ix, rowB));
    FORM.areas.forEach((a, n) => {
      const bx = ix + (n % 3) * (iw / 3);
      const by = rowB + 10 + Math.floor(n / 3) * 18;
      const k = FORM.ticked.indexOf(a);
      out.push(`<rect x="${(bx + 0.5).toFixed(1)}" y="${by + 0.5}" width="10" height="10" rx="2" fill="${C.white}" stroke="#A1A1AA"/>` + tx(a, { font: "body", size: 10, x: bx + 17, y: by + 9.3, fill: C.ink }));
      if (k < 0) return;
      const t = t0 + 1.75 + k * 0.45;
      stops.push([t - 0.12, bx + 5, by + 5], [t + 0.12, bx + 5, by + 5]);
      out.push(on(t, `<rect x="${bx.toFixed(1)}" y="${by}" width="11" height="11" rx="2" fill="${C.bronze}"/><path d="M${(bx + 2.6).toFixed(1)} ${by + 5.7}l2.2 2.2 3.8-4.2" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`, { d: 0.1 }));
    });
    const rowC = rowB + 61;
    out.push(field(2, ix, rowC, t0 + 2.75) + field(3, ix + col + 14, rowC, t0 + 3.25));
    // back and submit
    const send = t0 + 3.95;
    const landed = send + 0.6;
    const by = rowC + 46;
    const backW = mw(FORM.back, { font: "bodySemi", size: 10.5 }) + 36;
    const subW = mw(FORM.submit, { font: "bodySemi", size: 10.5 }) + 40;
    const subX = ix + iw - subW;
    out.push(`<rect x="${ix + 0.5}" y="${by + 0.5}" width="${(backW - 1).toFixed(1)}" height="27" fill="${C.white}" stroke="${C.line}"/>` + tx(FORM.back, { font: "bodySemi", size: 10.5, x: ix + backW / 2, y: by + 18, fill: C.ink, anchor: "middle" }));
    out.push(`<rect x="${subX.toFixed(1)}" y="${by}" width="${subW.toFixed(1)}" height="28" fill="${C.bronze}"/>` + tx(FORM.submit, { font: "bodySemi", size: 10.5, x: subX + subW / 2, y: by + 18, fill: C.white, anchor: "middle" }));
    out.push(span(send, landed + 0.1, `<rect x="${subX.toFixed(1)}" y="${by}" width="${subW.toFixed(1)}" height="28" fill="#C4A283"/>` + tx(FORM.submitting, { font: "bodySemi", size: 10.5, x: subX + subW / 2, y: by + 18, fill: C.white, anchor: "middle" }), { d: 0.1 }));
    stops.push([send - 0.25, subX + subW / 2 + 8, by + 16], [send + 0.3, subX + subW / 2 + 8, by + 16]);
    rings.push(click(send - 0.1, subX + subW / 2 + 8, by + 16));

    // what the applicant sees next (FormSuccess), then the review table's row
    const rx0 = fx + fw + 16;
    const rw = WIN.x + WIN.w - rx0;
    const A = { y, h: 162 };
    const B = { y: y + 174, h: h - 174 };
    const slot = (b) => `<rect x="${rx0 + 0.75}" y="${b.y + 0.75}" width="${rw - 1.5}" height="${b.h - 1.5}" rx="7" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="1.2" stroke-dasharray="5 5"/>`;
    const ring = 2 * Math.PI * 14;
    const draw = (a, b, len) => anim(`0%,${p(a)}{stroke-dashoffset:${len.toFixed(1)}}${p(b)},100%{stroke-dashoffset:0}`);
    const done =
      `<rect x="${rx0}" y="${A.y}" width="${rw}" height="${A.h}" rx="7" fill="${C.white}"/>` +
      `<path d="M${rx0 + rw - 30} ${A.y + 12.5}h18v18" fill="none" stroke="${C.bronze}" stroke-opacity=".35"/>` +
      `<circle class="${draw(landed + 0.1, landed + 0.7, ring)}" cx="${rx0 + 34}" cy="${A.y + 36}" r="14" fill="none" stroke="${C.bronze}" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="${ring.toFixed(1)}" transform="rotate(-90 ${rx0 + 34} ${A.y + 36})"/>` +
      `<path class="${draw(landed + 0.55, landed + 0.9, 20)}" d="M${rx0 + 27.8} ${A.y + 36.6}l4.7 4.4 8.4-8.7" fill="none" stroke="${C.bronze}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="20"/>` +
      tx(FORM.done, { font: "display", size: 18.5, x: rx0 + 58, y: A.y + 42.5, fill: C.ink }) +
      `<rect x="${rx0 + 20}" y="${A.y + 64}" width="${rw - 40}" height="1" fill="${C.line}"/>` +
      caps(FORM.next, { size: 9, x: rx0 + 20, y: A.y + 85, fill: C.bronze }) +
      FORM.nextSteps.map((s, n) => on(landed + 0.7 + n * 0.15, tx(`0${n + 1}`, { font: "mono", size: 9.5, x: rx0 + 20, y: A.y + 107 + n * 20, fill: C.bronze, attrs: 'opacity=".7"' }) + tx(s, { font: "bodySemi", size: 11, x: rx0 + 44, y: A.y + 107 + n * 20, fill: C.ink }), { d: 0.2 })).join("");
    const listed = landed + 1.2;
    const tick = listed + 1.25;
    const decided = tick + 0.45;
    const rowY = B.y + 66;
    let px = rx0 + 16;
    const filters = REVIEW.filters
      .map((f, n) => {
        const pw = mw(f, { font: "bodySemi", size: 9.5 }) + 18;
        const s = `<rect x="${(px + 0.5).toFixed(1)}" y="${B.y + 37.5}" width="${(pw - 1).toFixed(1)}" height="18" rx="9" fill="${n ? C.white : C.bronze}" stroke="${n ? C.line : C.bronze}"/>` + tx(f, { font: "bodySemi", size: 9.5, x: px + pw / 2, y: B.y + 49.8, fill: n ? C.soft : C.white, anchor: "middle" });
        px += pw + 6;
        return s;
      })
      .join("");
    const badge = (s, fill, ink) => {
      const bw = mw(s, { font: "bodySemi", size: 10 }) + 18;
      return `<rect x="${(rx0 + rw - 16 - bw).toFixed(1)}" y="${rowY + 13}" width="${bw.toFixed(1)}" height="18" rx="9" fill="${fill}"/>` + tx(s, { font: "bodySemi", size: 10, x: rx0 + rw - 16 - bw / 2, y: rowY + 25.4, fill: ink, anchor: "middle" });
    };
    const review =
      `<rect x="${rx0}" y="${B.y}" width="${rw}" height="${B.h}" rx="7" fill="${C.white}"/>` +
      tx(REVIEW.tab, { font: "bodySemi", size: 11.5, x: rx0 + 16, y: B.y + 24.5, fill: C.ink }) +
      filters +
      `<rect x="${rx0}" y="${rowY}" width="${rw}" height="1" fill="${C.line}"/>` +
      `<rect x="${rx0}" y="${rowY + 44}" width="${rw}" height="1" fill="${C.line}"/>` +
      on(
        listed + 0.3,
        on(tick, `<rect x="${rx0}" y="${rowY + 1}" width="${rw}" height="43" fill="${C.amber}"/>`, { d: 0.15 }) +
          `<rect x="${rx0 + 16.5}" y="${rowY + 16.5}" width="10" height="10" rx="2" fill="${C.white}" stroke="#A1A1AA"/>` +
          on(tick, `<rect x="${rx0 + 16}" y="${rowY + 16}" width="11" height="11" rx="2" fill="${C.bronze}"/><path d="M${rx0 + 18.6} ${rowY + 21.7}l2.2 2.2 3.8-4.2" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`, { d: 0.1 }) +
          tx(FORM.fields[0][1], { font: "bodySemi", size: 10.5, x: rx0 + 36, y: rowY + 19.5, fill: C.ink }) +
          tx(FORM.fields[1][1], { font: "body", size: 9.5, x: rx0 + 36, y: rowY + 33.5, fill: C.soft }) +
          until(decided, badge(REVIEW.from, C.muted, "#27272A"), 0.15) +
          on(decided, badge(REVIEW.to, C.greenSoft, C.green), { d: 0.2 }),
        { dy: 6 },
      );
    stops.push([landed + 0.5, subX + subW / 2 + 8, by + 16], [tick - 0.15, rx0 + 24, rowY + 24], [tick + 0.6, rx0 + 24, rowY + 24], [tick + 1.5, rx0 + 110, rowY + 50]);
    rings.push(click(tick - 0.03, rx0 + 21.5, rowY + 21.5));
    return (
      windowOf({ x: fx, w: fw, urls: url(FORM.url), inner: out.join("") }) +
      until(landed, slot(A)) + until(listed, slot(B)) +
      on(landed, done, { dy: 8, d: 0.3 }) +
      on(listed, review, { dy: 8, d: 0.3 }) +
      rings.join("") +
      pointer(stops, t0 + 0.1, t0 + LEN[2])
    );
  };

  // ── Stage: the scenes, a tick for each, and its label ─────────────────────
  const draw = [home, agenda, application];
  const stage = [`<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${C.night}"/><rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="url(#grain)"/>`];
  LEN.forEach((len, i) => {
    const still = i === STILL;
    const a = AT[i];
    stage.push(span(a, a + len, draw[i](a), { d: 0.3, still }));
    const tickX = WIN.x + i * 32;
    stage.push(`<rect x="${tickX}" y="341" width="26" height="2.5" rx="1.25" fill="#fff" opacity=".2"/>` + span(a, a + len, `<rect x="${tickX}" y="341" width="26" height="2.5" rx="1.25" fill="${C.bronzeLight}"/>`, { d: 0.3, still }));
    stage.push(span(a, a + len, caps(LABELS[i], { size: 9.5, x: WIN.x + WIN.w, y: 346, fill: C.onNightSoft, anchor: "end", tracking: 0.16 }), { d: 0.3, still }));
  });

  // ── Identity, on the site's night ground, under its own wordmark ──────────
  const logo = readFileSync(`${root}/public/organizations/femtech-weekend-logo-dark.svg`, "utf8").match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1];
  const site = "femtechweekend.com";
  const siteW = mw(site, { font: "bodySemi", size: 12 }) + 32;
  const figure = (value, label, fx) => tx(value, { font: "display", size: 30, x: fx, y: 309, fill: C.bronzeLight }) + tx(label, { font: "body", size: 11.5, x: fx, y: 328, fill: C.onNightSoft });
  const identity =
    `<rect width="${X}" height="${CARD.h}" fill="${C.night}"/><rect x="${X - 1}" width="1" height="${CARD.h}" fill="#fff" opacity=".09"/>` +
    `<rect x="40" y="44" width="34" height="1.5" fill="${C.bronzeLight}"/>` +
    caps("Community & summit website", { size: 10.5, x: 84, y: 48.5, fill: C.bronzeLight }) +
    `<svg x="36" y="74" width="232" height="94" viewBox="0 0 959 389">${logo}</svg>` +
    tx("The bilingual website that", { font: "display", size: 27, x: 40, y: 219, fill: C.onNight }) +
    tx("carried Shanghai Summit 2026.", { font: "display", size: 27, x: 40, y: 252, fill: C.onNight }) +
    figure(String(locales), "languages", 40) +
    figure(String(forms), "application forms", 134) +
    `<rect x="${(460 - siteW).toFixed(1)}" y="297" width="${siteW.toFixed(1)}" height="32" fill="${C.bronze}"/>` +
    tx(site, { font: "bodySemi", size: 12, x: 460 - siteW / 2, y: 317.2, fill: C.white, anchor: "middle" });

  return {
    svg: card({
      title: "FemTech Weekend, the bilingual website and sign-up system that carried Shanghai Summit 2026. The stage shows its home page switching from English to Simplified Chinese, the summit agenda opening day by day, and a pitch application being filled, submitted and reviewed.",
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body: `${stage.join("")}${identity}`,
      radius: 8,
    }),
    facts: { scenes: LEN.length, languages: locales, forms, loop: `${T.toFixed(1)}s` },
  };
}
