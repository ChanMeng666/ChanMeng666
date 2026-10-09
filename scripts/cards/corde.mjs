// CORDE Mobile card. A React Native field app that a Lincoln University
// industry-placement team built for CORDE in 2024. The card shows what the app
// is for: a crew keeps logging with no signal, and the phone syncs when it is
// back online. That connectivity state is the through-line of the stage.
//
// It is drawn in the app's own look, as the product film's coded replica
// records it (corde-promo-studio, src/replica/): the #282828 header, the
// #FF620A orange, the six dashboard tile colours, the NativeBase shades, the
// app's MaterialCommunityIcons glyphs, Roboto (the app asks for the platform
// face, which is Roboto on Android) and a monospace for dashboard labels (Noto
// Sans Mono in the film). The identity panel sets the name and line in the
// film's caption face (Archivo).
//
// The stage is two phones redrawn in vectors from the replica's screens
// (src/replica/screens/*.tsx; laid out again at card size, so the type is
// larger against the screen than in the app and long screens are cut short):
// the dashboard and Sync Log on the left, Create New Log and Map Marker on the
// right, with a four-step connectivity rail beside them.
//
// What is said, and where it comes from, all read at build time:
//   - every word inside a phone is the app's own string
//     (src/replica/strings.gen.json, route names in screens.gen.json) and
//     every icon the app's own glyph (glyphs.gen.json);
//   - the sample records are the film's fixtures (src/replica/fixtures.ts),
//     which are fictional by the film's constraint C1;
//   - the rail's labels are the film's cleared captions cut to their first
//     two words (src/data/captions.json) and two app strings;
//   - the product name and its line are the film's cleared cards
//     (docs/copy-clearance.md); the chips are the career database's
//     (projects[corde-mobile-application]).
// It keeps the film's rules: no speed claim (C9), nothing that reads as CORDE
// endorsing the piece, and the company wordmark is not used as the card's own
// mark (C6); it appears only where the app shows it, on the dashboard. The
// map is an abstract drawing, not a map tile. The "📅" that prefixes the
// app's "Date Range" string is drawn as the app's calendar glyph, and the
// marker card leaves out its address row (the fixture's town name has a
// macron this Roboto subset lacks).
//
// The film is NOT in this repo (CORDE_INPUTS); where it is absent the card is
// not rebuilt and the committed SVG stands.
import { readFileSync } from "node:fs";

import opentype from "opentype.js";

import { wrap } from "../lib/svg-card/film.mjs";
import { CARD, card, pct } from "../lib/svg-card/shell.mjs";

export const CORDE_FONTS = {
  display: "scripts/cards/fonts/corde/Archivo-800.ttf",
  caption: "scripts/cards/fonts/archlang/Archivo-700.ttf",
  ui: "scripts/cards/fonts/corde/Roboto-400.ttf",
  uiMid: "scripts/cards/fonts/corde/Roboto-500.ttf",
  mono: "scripts/cards/fonts/corde/NotoSansMono-500.ttf",
};
export const CORDE_INPUTS = {
  captions: "../corde-promo-studio/src/data/captions.json",
  strings: "../corde-promo-studio/src/replica/strings.gen.json",
  screens: "../corde-promo-studio/src/replica/screens.gen.json",
  fixtures: "../corde-promo-studio/src/replica/fixtures.ts",
  tokens: "../corde-promo-studio/src/replica/tokens.ts",
  iconMap: "../corde-promo-studio/src/replica/glyphs.gen.json",
  icons: "../corde-promo-studio/public/fonts/MaterialCommunityIcons.ttf",
  logotype: "../corde-promo-studio/public/brand/CORDE_Logotype_Black.png",
  clearance: "../corde-promo-studio/docs/copy-clearance.md",
};

// The NativeBase shades the app uses and the colours its screens hard-code
// (tokens.ts and the replica's painters). The app's own header, orange, tile
// and photo-button colours are read from tokens.ts at build time.
const A = {
  white: "#ffffff",
  ink: "#171717",
  gray50: "#fafafa",
  gray100: "#f4f4f4",
  gray200: "#e4e4e7",
  gray300: "#d4d4d8",
  gray400: "#a1a1aa",
  gray500: "#737373",
  gray600: "#525252",
  gray700: "#3f3f46",
  gray800: "#27272a",
  green500: "#22c55e",
  cyan600: "#0891b2",
  orange500: "#f97316",
  orange600: "#ea580c",
  error600: "#dc2626",
  success200: "#bbf7d0",
  success700: "#15803d",
  calendar: "#ffa500", // the calendar and tab indicator ask for CSS "orange"
  calInk: "#2d4150",
  calMute: "#b6c1cd",
  tabIdle: "#a9a9a9",
  create: "#FF6206",
  window: "#f0f0f0",
  land: "#e3ebdf",
  landLine: "#d5ddd2",
  pin: "#ea4335",
  pinEdge: "#b3261e",
  pinEye: "#7a1d18",
  locate: "#d6eefa",
  locateInk: "#1a73e8",
  dot: "#4285f4",
  sysBar: "#1E1E1E",
  sysPill: "#3a3a3a",
  chassis: "#101216",
};

const NAME = "CORDE Mobile";
const LINE = "Offline-first field logs for maintenance crews";

// The six dashboard tiles, in the app's own order: string id, tile token, glyph.
const TOOLS = [
  ["log-list", "list", "clipboard-list"],
  ["new-log", "newLog", "clipboard-plus"],
  ["sync-log", "sync", "cloud-sync"],
  ["log-group", "group", "clipboard-check-multiple"],
  ["map-marker", "map", "map-marker"],
  ["settings", "settings", "cog"],
];

const n = (v, d = 2) => Number(v.toFixed(d)).toString();

export function buildCordeCard({ glyphs, root, project }) {
  const read = (key) => readFileSync(`${root}/${CORDE_INPUTS[key]}`, "utf8");
  const fail = (what) => {
    throw new Error(`corde card: ${what}`);
  };

  // ── Cleared copy, read where it lives ──────────────────────────────────────
  const captions = JSON.parse(read("captions"));
  const strings = JSON.parse(read("strings"));
  const str = (id) => strings[id]?.text || fail(`"${id}" is no longer in the film's strings.gen.json`);
  const routes = JSON.parse(read("screens"));
  const route = (name) => (routes.some((r) => r.name === name) ? name : fail(`"${name}" is no longer a route in the film's screens.gen.json`));
  const tokens = read("tokens");
  const token = (key) => tokens.match(new RegExp(`\\b${key}:\\s*"(#[0-9a-fA-F]{6})"`))?.[1] || fail(`no "${key}" colour in the film's tokens.ts`);
  const APP = { header: token("headerBg"), orange: token("orange"), takePhoto: token("takePhoto"), choosePhoto: token("choosePhoto") };
  const tileBlock = tokens.match(/tile:\s*\{([^}]+)\}/) || fail("no tile colours in the film's tokens.ts");
  const tiles = Object.fromEntries([...tileBlock[1].matchAll(/(\w+):\s*"(#[0-9a-fA-F]{6})"/g)].map((m) => [m[1], m[2]]));
  const tools = TOOLS.map(([id, tile, glyph]) => ({ label: str(id), colour: tiles[tile] || fail(`tile "${tile}" is no longer in the film's tokens.ts`), glyph }));
  const clearance = read("clearance");
  for (const s of [NAME, LINE]) if (!clearance.includes(`\`${s}\``)) fail(`"${s}" is not a cleared row in the film's copy-clearance.md`);

  // The rail: two captions cut to their opening words, two app strings.
  const opening = (key, words) => (captions[key]?.startsWith(words) ? words : fail(`caption "${key}" no longer opens with "${words}"`));
  const RAIL = [
    ["wifi-off", opening("offline", "No signal")],
    ["wifi", opening("sync-build", "Back online")],
    ["cloud-sync", str("syncing")],
    ["check-circle", str("sync-completed")],
  ];

  // The film's fictional records (fixtures.ts), quoted by pattern.
  const fixtures = read("fixtures");
  const fx = (re, what) => fixtures.match(re)?.[1] || fail(`the film's fixtures.ts no longer has ${what}`);
  const FX = {
    agreement: fx(/agreement: "([^"]+)"/, "the typed service agreement"),
    orderNo: fx(/orderNo: "([^"]+)"/, "the typed order number"),
    asset: fx(/\basset: "(MB-3390[^"]+)"/, "the chosen asset"),
    staff: fx(/staff: "([^"]+)"/, "the allocated staff member"),
    description: fx(/newLogDescription: "([^"]+)"/, "the new log's description"),
    month: fx(/month: "([^"]+)"/, "the calendar month"),
    firstWeekday: Number(fx(/firstWeekday: (\d)/, "the month's first weekday")),
    days: Number(fx(/days: (\d+)/, "the month's length")),
    weekdays: JSON.parse(fx(/weekdays: (\[[^\]]+\])/, "the weekday names")),
    start: Number(fx(/startDay: (\d+)/, "the range's first day")),
    end: Number(fx(/endDay: (\d+)/, "the range's last day")),
    from: fx(/from: "([^"]+)"/, "the range's From date"),
    to: fx(/to: "([^"]+)"/, "the range's To date"),
    lastSync: fx(/lastSyncNew: "([^"]+)"/, "the Last Sync timestamp"),
    taskCount: Number(fx(/taskCountFinal: (\d+)/, "the final Task Count")),
    pinLog: fx(/id: "p1",[^}]*logs: \["(\d+)"\]/, "the first map pin"),
  };
  const pinRow = fixtures.match(new RegExp(`\\{ id: "${FX.pinLog}",[^}]*description: "([^"]+)"[^}]*schd: "(\\d{4})-(\\d\\d)-(\\d\\d)"`)) || fail(`the film's fixtures.ts no longer has log ${FX.pinLog}`);
  const PIN = { id: FX.pinLog, description: pinRow[1], scheduled: `${pinRow[4]}/${pinRow[3]}/${pinRow[2]}` };
  // status-bar clocks from the film's story clock: where it starts, and the Last Sync minute
  const clockStart = Number(fx(/STORY_CLOCK[^;]*?\[0, ([\d.]+)\]/, "the story clock"));
  const CLOCK = [`${9 + Math.floor(clockStart / 3600)}:${String(Math.floor((clockStart % 3600) / 60)).padStart(2, "0")}`, FX.lastSync.slice(11, 16).replace(/^0/, "")];

  // ── The chips, checked against the database ────────────────────────────────
  const told = project.narrative?.impactHeadline || fail("projects[corde-mobile-application] has no impactHeadline");
  const need = (re, what) => re.test(told) || fail(`the database no longer says ${what}`);
  need(/text, photos and GPS with no signal/, "text, photos and GPS with no signal");
  need(/then sync when coverage returns/, "sync when coverage returns");
  const CHIPS = [`${tools.length} TOOLS`, "TEXT · PHOTOS · GPS", "SYNCS WHEN ONLINE"];

  // ── The app's glyphs, outlined once each ───────────────────────────────────
  const iconBuf = readFileSync(`${root}/${CORDE_INPUTS.icons}`);
  const mdi = opentype.parse(iconBuf.buffer.slice(iconBuf.byteOffset, iconBuf.byteOffset + iconBuf.byteLength));
  const codepoints = JSON.parse(read("iconMap"));
  const iconDefs = new Map();
  // an icon of `size` px centred on (cx, cy)
  const icon = (name, size, cx, cy, fill) => {
    if (!iconDefs.has(name)) {
      const g = codepoints[name] ? mdi.charToGlyph(String.fromCodePoint(codepoints[name])) : null;
      if (!g?.index) fail(`glyph "${name}" is no longer in the film's glyphs.gen.json or its icon font`);
      const r = Math.round;
      const d = g.path.commands.map((c) => (c.type === "Z" ? "Z" : c.type === "Q" ? `Q${r(c.x1)} ${r(c.y1)} ${r(c.x)} ${r(c.y)}` : c.type === "C" ? `C${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)} ${r(c.x)} ${r(c.y)}` : `${c.type}${r(c.x)} ${r(c.y)}`)).join("");
      iconDefs.set(name, `<path id="i${iconDefs.size.toString(36)}" d="${d}"/>`);
    }
    const k = size / mdi.unitsPerEm;
    const id = iconDefs.get(name).match(/id="(\w+)"/)[1];
    return `<use href="#${id}" fill="${fill}" transform="translate(${n(cx - size / 2)} ${n(cy + size / 2 + mdi.descender * k)}) scale(${n(k, 5)} ${n(-k, 5)})"/>`;
  };

  // ── Timeline ───────────────────────────────────────────────────────────────
  // One crew's morning on a 26.5 s loop. Seconds:
  const AT = {
    syncOut: 0.2, // Sync Log pops back to the dashboard
    offline: 1.8, // the dashboard's switch goes off
    tapNew: 4.3,
    newIn: 5.0, // Create New Log, right phone
    agreement: 5.8,
    order: [6.3, 7.0],
    asset: 7.2,
    staff: 7.6,
    desc: [7.9, 9.1],
    tapCreate: 9.4,
    toast: 9.6,
    toastOut: 10.9,
    online: 11.6, // the switch goes back on
    tapSync: 12.2,
    syncIn: 12.5, // Sync Log, left phone
    day1: 13.5,
    day2: 14.2,
    tapRange: 15.0,
    syncing: 15.1,
    count: [15.3, 18.6],
    synced: 18.9,
    mapIn: 21.0, // Map Marker, right phone
    from: 21.7,
    to: 22.1,
    pins: [22.7, 23.1, 23.5],
    tapPin: 24.3,
    marker: 24.5,
  };
  const T = 26.5;
  const p = (t) => pct(t, T, 3);
  const css = [];
  const seen = new Map();
  // [[second, declarations], …] → a class; identical tracks share one rule
  const kf = (points) => {
    const body = points.map(([t, d]) => `${p(t)}{${d}}`).join("");
    if (!seen.has(body)) {
      const name = `k${seen.size.toString(36)}`;
      seen.set(body, name);
      css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${T}s linear infinite}`);
    }
    return seen.get(body);
  };
  const HID = "opacity:0";
  const VIS = "opacity:1";
  const EASE = ";animation-timing-function:cubic-bezier(.2,.7,.2,1)";
  // `hold`: the finished state stays up this far into the next loop, until the
  // screen it sits on has been covered or has slid away.
  const on = (t, { f = 0.25, hold = 0, from = HID, to = VIS } = {}) =>
    hold ? kf([[0, to], [hold, to], [hold + 0.02, from], [t, from + EASE], [t + f, to], [T, to]]) : kf([[0, from], [t, from + EASE], [t + f, to], [T, to]]);
  const off = (t, { f = 0.2, hold = 0 } = {}) => (hold ? kf([[0, HID], [hold, HID], [hold + 0.02, VIS], [t, VIS], [t + f, HID], [T, HID]]) : kf([[0, VIS], [t, VIS], [t + f, HID], [T, HID]]));
  const between = (a, b, { f = 0.2, from = HID, to = VIS } = {}) => kf([[0, from], [a, from + EASE], [a + f, to], [b, to], [b + f, from], [T, from]]);
  const except = (a, b, { f = 0.2 } = {}) => kf([[0, VIS], [a, VIS], [a + f, HID], [b, HID], [b + f, VIS], [T, VIS]]);
  // `gone`: absent from the still frame
  const g = (cls, inner, gone) => `<g class="${cls}"${gone ? ' opacity="0"' : ""}>${inner}</g>`;
  const tx = (s, x, y, size, fill, o = {}) => glyphs.text(s, { font: o.font || "ui", size, x, y, fill, anchor: o.anchor, tracking: o.tracking });

  const defs = [];
  const clipBox = (x, y, w, h) => {
    const id = `c${defs.length.toString(36)}`;
    defs.push(`<clipPath id="${id}"><rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}"/></clipPath>`);
    return id;
  };
  // Text that types itself: a cover the colour of the field steps off it, one
  // step per character, with the caret on its leading edge.
  const typed = (s, x, y, size, [t0, t1], box, bg) => {
    const w = glyphs.measure(s, { font: "ui", size });
    const cover = kf([[0, `transform:translateX(${n(-w - 3)}px)`], [t0, `transform:translateX(${n(-w - 3)}px);animation-timing-function:steps(${s.length},end)`], [t1, "transform:translateX(0)"], [T, "transform:translateX(0)"]]);
    return (
      `<g clip-path="url(#${clipBox(...box)})">${tx(s, x, y, size, "#000")}` +
      `<g class="${cover}"><rect x="${n(x + w + 1.5)}" y="${n(y - size)}" width="${n(w + 6)}" height="${n(size * 1.5)}" fill="${bg}"/>` +
      `<rect class="${between(t0 - 0.3, t1 + 0.7)}" opacity="0" x="${n(x + w + 1.5)}" y="${n(y - size * 0.86)}" width="1" height="${n(size * 1.12)}" fill="${A.ink}"/></g></g>`
    );
  };

  // Connectivity, as every screen's status bar and the dashboard's pill show it.
  const online = except(AT.offline, AT.online);
  const offline = between(AT.offline, AT.online);

  // ── The phone's own chrome (parts/chrome.tsx), at 250 px wide ──────────────
  const SW = 250;
  const TOP = 52; // status bar 20 + stack header 32
  const status = (ink, clock) => {
    const fan = `<path d="M12 21.5L1 7.2A15 15 0 0 1 23 7.2Z" transform="translate(197 4.6) scale(.44)"/>`;
    const wedge = `<path d="M2 22L22 2V22Z" transform="translate(208.5 4.6) scale(.44)"/>`;
    return (
      tx(clock, 16, 13.6, 9.5, ink, { font: "uiMid" }) +
      icon("map-marker-outline", 10.5, 189, 10, ink) +
      `<g class="${online}" fill="${ink}">${fan}${wedge}</g>` +
      // offline: both faint, the fan struck through and the wedge crossed
      `<g class="${offline}" opacity="0"><g fill="${ink}" fill-opacity=".3">${fan}${wedge}</g>` +
      `<path d="M198.5 6l8 8M213.6 9.6l4.2 4.2M217.8 9.6l-4.2 4.2" fill="none" stroke="${ink}" stroke-width="1.1" stroke-linecap="round"/></g>` +
      `<g fill="${ink}" transform="translate(220.5 4.2) scale(.44)"><rect x="8" y="3.5" width="8" height="2" rx=".6"/><rect x="6.5" y="5" width="11" height="17" rx="1.6"/></g>`
    );
  };
  const header = (title, clock) =>
    `<rect width="${SW}" height="${TOP}" fill="${APP.header}"/>` + status(A.white, clock) + icon("arrow-left", 14, 18, 36, A.white) + tx(title, SW / 2, 40.2, 12, A.white, { font: "uiMid", anchor: "middle" });
  // NativeBase's left-accent success alert
  const toast = (title, lines) => {
    const h = 31 + lines.length * 12.5;
    return (
      `<rect x="8" y="26" width="${SW - 16}" height="${h}" rx="2" fill="#000" fill-opacity=".2"/>` +
      `<rect x="8" y="24" width="${SW - 16}" height="${h}" rx="2" fill="${A.success200}"/><rect x="8" y="24" width="3" height="${h}" fill="${A.success700}"/>` +
      icon("check-circle", 13, 24, 38.5, A.success700) +
      tx(title, 36, 42.5, 11, A.ink, { font: "uiMid" }) +
      icon("close", 10.5, SW - 21, 38.5, A.gray600) +
      lines.map((l, i) => tx(l, 36, 57 + i * 12.5, 9.8, A.ink)).join("")
    );
  };
  const slideDown = { from: `${HID};transform:translateY(-10px)`, to: `${VIS};transform:translateY(0)`, f: 0.3 };

  // ── Main Dashboard (DashboardScreen.tsx) ───────────────────────────────────
  const tileAt = (i) => ({ x: i % 2 ? 185 : 65, y: 140 + Math.floor(i / 2) * 72 });
  const press = (t) => kf([[0, VIS], [t, VIS], [t + 0.08, "opacity:.45"], [t + 0.32, "opacity:.45"], [t + 0.42, VIS], [T, VIS]]);
  const pressed = { 1: press(AT.tapNew), 2: press(AT.tapSync) };
  const SWITCH = { x: 219, y: 90 };
  const thumb = kf([[0, "transform:translateX(0)"], [AT.offline, `transform:translateX(0)${EASE}`], [AT.offline + 0.2, "transform:translateX(-9px)"], [AT.online, `transform:translateX(-9px)${EASE}`], [AT.online + 0.2, "transform:translateX(0)"], [T, "transform:translateX(0)"]]);
  const dashboard =
    `<rect width="${SW}" height="340" fill="${A.white}"/>` +
    status(A.sysBar, CLOCK[0]) +
    `<image x="50" y="34" width="150" height="29.2" href="data:image/png;base64,${readFileSync(`${root}/${CORDE_INPUTS.logotype}`).toString("base64")}"/>` +
    // the online / offline pill: wifi glyph and switch
    `<rect x="176" y="77.5" width="62" height="28" rx="14" fill="#000" fill-opacity=".13"/><rect x="176" y="76" width="62" height="28" rx="14" fill="${A.white}" stroke="${A.gray200}" stroke-width=".6"/>` +
    g(online, icon("wifi", 14.5, 193, 90, A.green500)) +
    g(offline, icon("wifi-off", 14.5, 193, 90, A.gray400), true) +
    `<rect x="${SWITCH.x - 9}" y="${SWITCH.y - 4.5}" width="18" height="9" rx="4.5" fill="${A.gray300}"/>` +
    `<rect class="${online}" x="${SWITCH.x - 9}" y="${SWITCH.y - 4.5}" width="18" height="9" rx="4.5" fill="${A.cyan600}"/>` +
    `<g class="${thumb}"><circle cx="${SWITCH.x + 4.5}" cy="${SWITCH.y + 1}" r="5.8" fill="#000" fill-opacity=".25"/><circle cx="${SWITCH.x + 4.5}" cy="${SWITCH.y}" r="5.6" fill="${A.gray50}" stroke="${A.gray300}" stroke-width=".4"/></g>` +
    tools
      .map((tool, i) => {
        const { x, y } = tileAt(i);
        const tile = icon(tool.glyph, 31, x, y, tool.colour) + tx(tool.label, x, y + 33, 9.6, "#000", { font: "mono", anchor: "middle" });
        return pressed[i] ? g(pressed[i], tile) : tile;
      })
      .join("");

  // ── Create New Log (NewLogScreen.tsx) ──────────────────────────────────────
  const F = { x: 12, w: SW - 24, y: 60, step: 37 };
  const label = (id, y, required) => {
    const s = str(id);
    return tx(s, F.x, y, 9.2, A.gray600, { font: "uiMid" }) + (required ? tx("*", F.x + glyphs.measure(s, { font: "uiMid", size: 9.2 }) + 0.5, y, 9.2, A.error600, { font: "uiMid" }) : "");
  };
  const select = (i, id, required, placeholder, value, t) => {
    const y = F.y + i * F.step;
    return (
      label(id, y + 9, required) +
      `<rect x="${F.x}" y="${y + 13.5}" width="${F.w}" height="19" rx="2.5" fill="${A.gray100}" stroke="${A.gray300}" stroke-width=".6"/>` +
      g(off(t), tx(str(placeholder), F.x + 8, y + 26.3, 9, A.gray400), true) +
      g(on(t), tx(value, F.x + 8, y + 26.3, 9, "#000")) +
      icon("menu-down", 13, F.x + F.w - 9, y + 23, "#000")
    );
  };
  const button = (x, y, w, colour, glyph, id, ink = A.white) => {
    const s = str(id);
    const tw = glyphs.measure(s, { font: "ui", size: 9.5 });
    const x0 = x + (w - tw - 13) / 2;
    return `<rect x="${n(x)}" y="${y}" width="${n(w)}" height="20" rx="1.5" fill="${colour}"${colour === A.white ? ` stroke="${A.create}"` : ""}/>` + icon(glyph, 10.5, x0 + 5, y + 10, ink) + tx(s, x0 + 13, y + 13.4, 9.5, ink);
  };
  const HALF = (F.w - 6) / 2;
  const orderY = F.y + F.step;
  const descY = F.y + 4 * F.step;
  const newLog =
    `<rect width="${SW}" height="340" fill="${A.window}"/><rect width="${SW}" height="319" fill="${A.white}"/>` +
    select(0, "service-agreement", true, "select-or-search-for-service-agreement", FX.agreement, AT.agreement) +
    label("order-no", orderY + 9, true) +
    `<rect x="${F.x}" y="${orderY + 13.5}" width="${F.w}" height="19" rx="2.5" fill="${A.gray100}"/>` +
    typed(FX.orderNo, F.x + 8, orderY + 26.3, 9, AT.order, [F.x, orderY + 13.5, F.w, 19], A.gray100) +
    select(2, "asset", false, "select-or-search-for-asset", FX.asset, AT.asset) +
    select(3, "allocate-to", true, "select-or-search-for-staff", FX.staff, AT.staff) +
    label("description", descY + 9, true) +
    `<rect x="${F.x}" y="${descY + 13.5}" width="${F.w}" height="33" rx="2.5" fill="${A.white}" stroke="#cccccc" stroke-width=".7"/>` +
    typed(FX.description, F.x + 8, descY + 26.8, 9, AT.desc, [F.x + 1, descY + 14.5, F.w - 2, 31], A.white) +
    button(F.x, 263, HALF, APP.takePhoto, "camera", "take-photo") +
    button(F.x + HALF + 6, 263, HALF, APP.choosePhoto, "image", "choose-photo") +
    button(F.x, 291, HALF, A.gray500, "cancel", "cancel") +
    button(F.x + HALF + 6, 291, HALF, A.create, "plus", "create") +
    // pressed: the app's outline state
    g(between(AT.tapCreate, AT.tapCreate + 0.22, { f: 0.06 }), button(F.x + HALF + 6, 291, HALF, A.white, "plus", "create", "#000"), true) +
    header(route("Create New Log"), CLOCK[0]) +
    g(between(AT.toast, AT.toastOut, slideDown), toast(str("success"), [str("new-log-created-successfully")]), true);

  // ── Sync Log, Selected Date tab (SyncScreen.tsx) ───────────────────────────
  const HOLD_L = 0.7; // Sync Log has slid off the left phone by then
  const CELL = SW / 7;
  const day = (d) => {
    const i = FX.firstWeekday + d - 1;
    return { x: CELL * (i % 7) + CELL / 2, y: 127 + Math.floor(i / 7) * 18, col: i % 7 };
  };
  const dayText = (d, fill) => tx(String(d), day(d).x, day(d).y + 3.4, 9.6, fill, { anchor: "middle" });
  const band = (a, b) => {
    const A0 = day(a);
    const B0 = day(b);
    const rows = [];
    for (let y = A0.y; y <= B0.y; y += 18) {
      const x0 = y === A0.y ? A0.x - CELL / 2 + 2 : 0;
      const x1 = y === B0.y ? B0.x + CELL / 2 - 2 : SW;
      // flat at a week's edge, rounded at the first and last marked day
      rows.push(`<rect x="${n(x0)}" y="${y - 8}" width="${n(x1 - x0)}" height="16" rx="8" fill="${A.calendar}"/>`);
      if (y !== A0.y) rows.push(`<rect x="0" y="${y - 8}" width="10" height="16" fill="${A.calendar}"/>`);
      if (y !== B0.y) rows.push(`<rect x="${SW - 10}" y="${y - 8}" width="10" height="16" fill="${A.calendar}"/>`);
    }
    return rows.join("");
  };
  const tabs = ["selected-date", "basic-data", "background-monitor"].map((id, i) => {
    const lines = wrap(glyphs, str(id), { font: "uiMid", size: 9.2 }, CELL * 7 / 3 - 10);
    return lines.map((l, k) => tx(l, (SW / 3) * (i + 0.5), 69.4 + (k - (lines.length - 1) / 2) * 10.4, 9.2, i ? A.tabIdle : "#000", { font: "uiMid", anchor: "middle" })).join("");
  });
  const cell = (x, y, glyph, id, value) => icon(glyph, 11.5, x + 5.5, y + 6.5, A.gray500) + tx(str(id), x + 15, y + 10, 9.8, A.gray500, { font: "uiMid" }) + value;
  const BTN = { x: 10, y: 213, w: SW - 20, h: 26 };
  const btnLabel = (glyph, s) => {
    const tw = glyphs.measure(s, { font: "uiMid", size: 10 });
    const x0 = BTN.x + (BTN.w - tw - 19) / 2;
    return [x0, tx(s, x0 + 19, BTN.y + 16.6, 10, A.white, { font: "uiMid" }), glyph ? icon(glyph, 14, x0 + 7, BTN.y + 13, A.white) : ""];
  };
  const idle = btnLabel("calendar-sync", str("sync-selected-date-range"));
  const busy = btnLabel(null, str("syncing"));
  const spin = kf([[0, "transform:rotate(0deg)"], [T, `transform:rotate(${Math.round(T * 2) * 360}deg)`]]);
  css.push(`.${spin}{transform-box:fill-box;transform-origin:center}`);
  const running = between(AT.syncing, AT.synced);
  const done = { hold: HOLD_L };
  const COUNT = { x: 130, y: 305, lh: 13 };
  const counter = kf([
    [0, "transform:translateY(0)"],
    [HOLD_L, "transform:translateY(0)"],
    [HOLD_L + 0.02, `transform:translateY(${FX.taskCount * COUNT.lh}px)`],
    [AT.count[0], `transform:translateY(${FX.taskCount * COUNT.lh}px);animation-timing-function:steps(${FX.taskCount},end)`],
    [AT.count[1], "transform:translateY(0)"],
    [T, "transform:translateY(0)"],
  ]);
  const completed = wrap(glyphs, str("sync-completed-successfully"), { font: "ui", size: 9.8 }, 108);
  const range = [];
  for (let d = FX.start; d <= FX.end; d++) range.push(d);
  const sync =
    `<rect width="${SW}" height="340" fill="${A.white}"/>` +
    // the calendar (react-native-calendars, period marking)
    tx(FX.month, SW / 2, 97, 10.8, A.calInk, { font: "uiMid", anchor: "middle" }) +
    icon("chevron-left", 14, 16, 93.4, A.calendar) +
    icon("chevron-right", 14, SW - 16, 93.4, A.calendar) +
    FX.weekdays.map((w, i) => tx(w, CELL * (i + 0.5), 112.5, 9, A.calMute, { anchor: "middle" })).join("") +
    Array.from({ length: FX.days }, (_, i) => dayText(i + 1, i + 1 === FX.start ? A.calendar : A.calInk)).join("") +
    g(on(AT.day1, { ...done, f: 0.15 }), band(FX.start, FX.start) + dayText(FX.start, A.white)) +
    g(on(AT.day2, { ...done, f: 0.3 }), band(FX.start, FX.end) + range.map((d) => dayText(d, A.white)).join("")) +
    // Sync Selected Date Range: dimmed with a spinner while it runs
    `<g class="${kf([[0, VIS], [AT.syncing, VIS], [AT.syncing + 0.15, "opacity:.4"], [AT.synced, "opacity:.4"], [AT.synced + 0.15, VIS], [T, VIS]])}">` +
    `<rect x="${BTN.x}" y="${BTN.y}" width="${BTN.w}" height="${BTN.h}" rx="2.5" fill="${APP.header}" stroke="#000" stroke-width=".6"/>` +
    g(except(AT.syncing, AT.synced), idle[1] + idle[2]) +
    g(running, `${busy[1]}<g class="${spin}"><circle cx="${n(busy[0] + 7)}" cy="${BTN.y + 13}" r="5" fill="none" stroke="${A.white}" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="15 17"/></g>`, true) +
    `</g>` +
    cell(10, 246, "clock-outline", "last-sync", g(off(AT.synced, done), tx(str("never"), 10, 269, 9.8, "#000"), true) + g(on(AT.synced, done), tx(FX.lastSync, 10, 269, 9.8, "#000"))) +
    cell(
      130,
      246,
      "information-outline",
      "status",
      g(off(AT.syncing, done), tx(str("not-started"), 130, 269, 9.8, "#000"), true) + g(running, tx(str("syncing"), 130, 269, 9.8, "#000"), true) + g(on(AT.synced, done), tx(str("success"), 130, 269, 9.8, "#000")),
    ) +
    `<rect x="10" y="277" width="${SW - 20}" height=".8" fill="${A.gray300}"/>` +
    cell(10, 282, "format-quote-open", "details", g(on(AT.synced, done), completed.map((l, i) => tx(l, 10, COUNT.y + i * 11.6, 9.8, "#000")).join(""))) +
    cell(
      130,
      282,
      "math-norm-box",
      "task-count",
      `<g clip-path="url(#${clipBox(126, COUNT.y - 10, 60, 13)})"><g class="${counter}">${Array.from({ length: FX.taskCount + 1 }, (_, k) => tx(String(k), COUNT.x, COUNT.y - (FX.taskCount - k) * COUNT.lh, 9.8, "#000")).join("")}</g></g>`,
    ) +
    // material top tabs, with the app's indicator under Selected Date
    `<rect y="${TOP}" width="${SW}" height="29.5" fill="#000" fill-opacity=".1"/><rect y="${TOP}" width="${SW}" height="28" fill="${A.white}"/>` +
    tabs.join("") +
    `<rect y="${TOP + 25.5}" width="${n(SW / 3)}" height="2.5" fill="${A.calendar}"/>` +
    header(route("Sync Log"), CLOCK[1]) +
    g(on(AT.synced + 0.1, { ...done, ...slideDown }), toast(str("sync-completed"), wrap(glyphs, str("selected-date-range-has-been-successfully-synchronized"), { font: "ui", size: 9.8 }, SW - 62)));

  // ── Map Marker (MapScreen.tsx) over an abstract street grid ────────────────
  const HOLD_R = 5.5; // Create New Log covers the right phone by then
  const kept = { hold: HOLD_R };
  // The grid's frame: origin on the first pin, u along its street.
  const O = { x: 75, y: 201, deg: -23.75 };
  const rad = (O.deg * Math.PI) / 180;
  const at = (u, v) => ({ x: O.x + u * Math.cos(rad) - v * Math.sin(rad), y: O.y + u * Math.sin(rad) + v * Math.cos(rad) });
  const STREETS = [-110, -55, 0, 53, 108, 162];
  const AVENUES = [-160, -95, -30, 95, 160, 225];
  const lots = [];
  for (const v of STREETS) for (let u = -210; u < 260; u += 15) if (!AVENUES.some((a) => Math.abs(u + 4.5 - a) < 9)) lots.push(`<rect x="${u}" y="${v + 6}" width="9" height="${7 + ((u * 7 + v) % 3)}"/>`, `<rect x="${u}" y="${v - 13 - ((u + v * 3) % 4)}" width="9" height="${7 + ((u + v * 3) % 4)}"/>`);
  const world =
    `<rect y="${TOP}" width="${SW}" height="300" fill="${A.land}"/>` +
    `<g transform="translate(${O.x} ${O.y}) rotate(${O.deg})">` +
    `<rect x="-24" y="59" width="113" height="43" rx="3" fill="#d3e3c9"/>` +
    `<g fill="${A.landLine}">${lots.filter((l) => !/y="(6\d|7\d|8\d|9\d)"/.test(l) || !/x="(-1\d|-\d|\d|[1-7]\d)"/.test(l)).join("")}</g>` +
    `<g stroke="${A.white}" fill="none">` +
    STREETS.map((v) => `<path d="M-260 ${v}H300" stroke-width="${v === 0 || v === 53 ? 6 : 3.5}"/>`).join("") +
    AVENUES.map((u) => `<path d="M${u} -200V260" stroke-width="${u === -30 || u === 95 ? 5 : 3.5}"/>`).join("") +
    `</g></g>`;
  const pinAt = [at(0, 0), at(64, 53), at(54.6, 0)];
  const here = at(95, 26);
  const pin = ({ x, y }, t) =>
    `<g class="${on(t, { ...kept, f: 0.3, from: `${HID};transform:translateY(-18px)`, to: `${VIS};transform:translateY(0)` })}">` +
    `<ellipse cx="${n(x)}" cy="${n(y + 0.5)}" rx="4.5" ry="1.6" fill="#000" fill-opacity=".25"/>` +
    `<g transform="translate(${n(x)} ${n(y)}) scale(.48) translate(-17 -47)"><path d="M17 47C17 47 2 28 2 16A15 15 0 0 1 32 16C32 28 17 47 17 47Z" fill="${A.pin}" stroke="${A.pinEdge}" stroke-width="1.5"/><circle cx="17" cy="16" r="5.6" fill="${A.pinEye}"/></g></g>`;
  const dateField = (id, y, value, t) =>
    tx(str(id), 13, y, 9, A.gray600, { font: "uiMid" }) +
    `<rect x="13" y="${y + 4}" width="138" height="18" rx="2.5" fill="${A.gray50}" stroke="${A.gray300}" stroke-width=".6"/>` +
    g(on(t, kept), tx(value, 20, y + 16.4, 9.2, A.gray800)) +
    icon("calendar", 10.5, 141, y + 13, A.orange500);
  const MK = { x: 8, y: 252, w: SW - 16 };
  const map =
    world +
    `<circle cx="${n(here.x)}" cy="${n(here.y)}" r="11" fill="${A.dot}" fill-opacity=".18"/><circle cx="${n(here.x)}" cy="${n(here.y)}" r="3.8" fill="${A.dot}" stroke="${A.white}" stroke-width="1.2"/>` +
    pinAt.map((q, i) => pin(q, AT.pins[i])).join("") +
    // the date-range card
    `<rect x="6" y="59" width="152" height="96" rx="5" fill="#000" fill-opacity=".16"/><rect x="6" y="57.5" width="152" height="96" rx="5" fill="${A.white}" stroke="${A.gray200}" stroke-width=".6"/>` +
    icon("calendar", 11, 18, 68.5, A.orange500) +
    tx(str("date-range").replace(/^\P{L}+/u, ""), 26, 72, 9.6, A.gray800, { font: "uiMid" }) +
    `<rect x="93" y="64" width="9" height="9" rx="1.6" fill="${A.gray50}" stroke="${A.gray400}" stroke-width="1"/>` +
    tx(str("today"), 106, 72, 9, "#000") +
    icon("chevron-left", 11, 148, 68.5, A.gray600) +
    dateField("from", 87, FX.from, AT.from) +
    dateField("to", 122, FX.to, AT.to) +
    `<rect x="217" y="59" width="25" height="25" rx="2" fill="#000" fill-opacity=".16"/><rect x="217" y="57.5" width="25" height="25" rx="2" fill="${A.locate}"/>` +
    icon("crosshairs-gps", 15, 229.5, 70, A.locateInk) +
    // the marker card for the tapped pin
    `<g class="${on(AT.marker, { ...kept, f: 0.3, from: `${HID};transform:translateY(14px)`, to: `${VIS};transform:translateY(0)` })}">` +
    `<rect x="${MK.x}" y="${MK.y + 2}" width="${MK.w}" height="90" rx="3.5" fill="#000" fill-opacity=".2"/><rect x="${MK.x}" y="${MK.y}" width="${MK.w}" height="90" rx="3.5" fill="${A.white}"/>` +
    tx(str("log-currentmarker-log-header-id").replace(/\{[^}]*\}/, PIN.id), MK.x + 10, MK.y + 16, 10.8, A.orange500, { font: "uiMid" }) +
    tx(str("description-2"), MK.x + 10, MK.y + 32, 9.6, "#000", { font: "uiMid" }) +
    icon("arrow-right-circle", 16, MK.x + MK.w - 17, MK.y + 28, A.orange600) +
    tx(PIN.description, MK.x + 10, MK.y + 44, 9.6, "#000") +
    tx(str("scheduled-date-2"), MK.x + 10, MK.y + 58, 9.6, "#000", { font: "uiMid" }) +
    tx(PIN.scheduled, MK.x + 10, MK.y + 70, 9.6, "#000") +
    `</g>` +
    header(route("Map Marker"), CLOCK[1]);

  // ── Two phones on the app's system-bar black ───────────────────────────────
  const X = CARD.panel;
  const PH = { y: 22, w: SW + 12, left: X + 212, right: X + 500 };
  const screenX = { L: PH.left + 6, R: PH.right + 6 };
  const SY = PH.y + 6;
  const phone = (side, layers) => {
    const x = side === "L" ? PH.left : PH.right;
    defs.push(`<clipPath id="s${side}"><rect x="${x + 6}" y="${SY}" width="${SW}" height="360" rx="23"/></clipPath>`);
    return (
      `<rect x="${x + PH.w - 1}" y="${PH.y + 84}" width="3" height="42" rx="1.5" fill="#2b2e34"/><rect x="${x + PH.w - 1}" y="${PH.y + 140}" width="3" height="22" rx="1.5" fill="#2b2e34"/>` +
      `<rect x="${x}" y="${PH.y}" width="${PH.w}" height="380" rx="29" fill="${A.chassis}" stroke="#4a4d55" stroke-width="1.2"/>` +
      `<g clip-path="url(#s${side})"><g transform="translate(${x + 6} ${SY})">${layers}</g></g>` +
      `<circle cx="${x + PH.w / 2}" cy="${SY + 10}" r="3.3" fill="#06070a"/>`
    );
  };
  // Sync Log is pushed over the dashboard and popped off it as the loop turns;
  // Create New Log is pushed over the map and dissolves back to it.
  const AWAY = `transform:translateX(${SW}px)`;
  const syncLayer = kf([[0, "transform:translateX(0)"], [AT.syncOut, `transform:translateX(0)${EASE}`], [AT.syncOut + 0.4, AWAY], [AT.syncIn, AWAY + EASE], [AT.syncIn + 0.4, "transform:translateX(0)"], [T, "transform:translateX(0)"]]);
  const newLayer = kf([[0, `${HID};${AWAY}`], [AT.newIn - 0.02, `${HID};${AWAY}`], [AT.newIn, `${VIS};${AWAY}${EASE}`], [AT.newIn + 0.4, `${VIS};transform:translateX(0)`], [AT.mapIn, `${VIS};transform:translateX(0)`], [AT.mapIn + 0.15, `${HID};transform:translateX(0)`], [AT.mapIn + 0.17, `${HID};${AWAY}`], [T, `${HID};${AWAY}`]]);
  const edge = `<rect x="-6" width="6" height="340" fill="#000" fill-opacity=".14"/>`;

  // The phone that is not in use steps back.
  const STAGE = A.sysBar;
  const DIM = "opacity:.5";
  const dim = (side, points) => `<rect class="${kf(points)}" opacity="0" x="${(side === "L" ? PH.left : PH.right) - 2}" y="${PH.y - 2}" width="${PH.w + 6}" height="360" rx="30" fill="${STAGE}"/>`;
  const dims =
    dim("L", [[0, DIM], [0.4, HID], [AT.newIn + 0.2, HID], [AT.newIn + 0.6, DIM], [AT.online - 0.6, DIM], [AT.online - 0.2, HID], [AT.mapIn, HID], [AT.mapIn + 0.4, DIM], [T, DIM]]) +
    dim("R", [[0, HID], [0.4, DIM], [AT.newIn - 0.2, DIM], [AT.newIn + 0.2, HID], [AT.online - 0.4, HID], [AT.online, DIM], [AT.mapIn - 0.2, DIM], [AT.mapIn + 0.2, HID], [T, HID]]);

  // The finger: a press dot and a ring that spreads (parts/chrome.tsx).
  const delay = (t) => `animation-delay:${(t - T).toFixed(2)}s`;
  css.push(
    `@keyframes tp{0%{opacity:0}${p(0.1)},${p(0.34)}{opacity:1}${p(0.6)},100%{opacity:0}}.tp{animation:tp ${T}s linear infinite}` +
      `@keyframes tr{0%{opacity:0;transform:scale(.5)}${p(0.1)}{opacity:.9;transform:scale(.6)}${p(0.6)},100%{opacity:0;transform:scale(1.7)}}.tr{animation:tr ${T}s linear infinite;transform-box:fill-box;transform-origin:center}`,
  );
  const tap = (t, side, x, y) => {
    const cx = n(screenX[side] + x);
    const cy = n(SY + y);
    return (
      `<circle class="tr" style="${delay(t - 0.1)}" opacity="0" cx="${cx}" cy="${cy}" r="11" fill="#464646" fill-opacity=".2" stroke="${A.white}" stroke-width="1.6"/>` +
      `<circle class="tp" style="${delay(t - 0.1)}" opacity="0" cx="${cx}" cy="${cy}" r="6.5" fill="#3c3c3c" fill-opacity=".6" stroke="${A.white}" stroke-width="1.5"/>`
    );
  };
  const taps =
    tap(AT.offline - 0.1, "L", SWITCH.x, SWITCH.y) +
    tap(AT.tapNew, "L", tileAt(1).x, tileAt(1).y) +
    tap(AT.tapCreate, "R", F.x + HALF + 6 + HALF / 2, 301) +
    tap(AT.online - 0.1, "L", SWITCH.x, SWITCH.y) +
    tap(AT.tapSync, "L", tileAt(2).x, tileAt(2).y) +
    tap(AT.day1 - 0.05, "L", day(FX.start).x, day(FX.start).y) +
    tap(AT.day2 - 0.05, "L", day(FX.end).x, day(FX.end).y) +
    tap(AT.tapRange, "L", SW / 2, BTN.y + BTN.h / 2) +
    tap(AT.tapPin, "R", pinAt[0].x, pinAt[0].y - 14);

  // ── The connectivity rail: the story in four states ────────────────────────
  const RX = X + 62;
  const RY = (i) => 78 + i * 68;
  const stepAt = [AT.offline, AT.online, AT.syncing, AT.synced];
  // lit steps stay lit until the loop has turned, then the rail clears
  const lit = (t) => kf([[0, VIS], [0.3, VIS], [0.7, HID], [t, HID], [t + 0.3, VIS], [T, VIS]]);
  css.push(".gy{transform-box:fill-box;transform-origin:center top}");
  const rail = RAIL.map(([glyph, text], i) => {
    const y = RY(i);
    const until = stepAt[i + 1];
    const halo = until ? between(stepAt[i], until, { f: 0.3 }) : lit(stepAt[i]);
    const grow = until && kf([[0, "transform:scaleY(1)"], [0.3, "transform:scaleY(1)"], [0.7, "transform:scaleY(0)"], [until - 0.5, `transform:scaleY(0)${EASE}`], [until, "transform:scaleY(1)"], [T, "transform:scaleY(1)"]]);
    return (
      (until ? `<rect x="${RX - 1}" y="${y + 20}" width="2" height="28" rx="1" fill="${A.gray700}"/><rect class="${grow} gy" x="${RX - 1}" y="${y + 20}" width="2" height="28" rx="1" fill="${APP.orange}"/>` : "") +
      `<circle cx="${RX}" cy="${y}" r="15" fill="none" stroke="${A.gray600}" stroke-width="1.2"/>` +
      icon(glyph, 16, RX, y, A.gray500) +
      tx(text, RX + 28, y + 4.8, 13.5, A.gray500, { font: "uiMid" }) +
      `<circle class="${halo}"${until ? ' opacity="0"' : ""} cx="${RX}" cy="${y}" r="19.5" fill="none" stroke="${APP.orange}" stroke-opacity=".45" stroke-width="1.5"/>` +
      g(lit(stepAt[i]), `<circle cx="${RX}" cy="${y}" r="15.6" fill="${APP.orange}"/>` + icon(glyph, 16, RX, y, A.white) + `<rect x="${RX + 24}" y="${y - 10}" width="130" height="20" fill="${STAGE}"/>` + tx(text, RX + 28, y + 4.8, 13.5, A.white, { font: "uiMid" }))
    );
  });

  const stage =
    `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${STAGE}"/>` +
    rail.join("") +
    phone("L", dashboard + `<g class="${syncLayer}">${edge}${sync}</g>`) +
    phone("R", map + `<g class="${newLayer}" opacity="0">${edge}${newLog}</g>`) +
    dims +
    taps;

  // ── Identity, on the app's header colour ───────────────────────────────────
  const nameStyle = { font: "display", size: 56 };
  if (glyphs.measure(NAME, nameStyle) > X - 70) fail("the product name no longer fits the panel");
  const lineStyle = { font: "caption", size: 27 };
  const lines = wrap(glyphs, LINE, lineStyle, X - 80);
  if (lines.length > 2) fail("the product line no longer fits two lines");
  const chipStyle = { font: "mono", size: 11, tracking: 0.08 };
  let cx = 40;
  const chips = CHIPS.map((c, i) => {
    const w = glyphs.measure(c, chipStyle) + 24;
    // the app's own flat button, then its outline state
    const out = `<rect x="${n(cx)}" y="287.5" width="${n(w)}" height="31" rx="4" fill="${i ? "none" : APP.orange}"${i ? ` stroke="${A.gray600}"` : ""}/>` + glyphs.text(c, { ...chipStyle, x: cx + 12, y: 307, fill: i ? A.gray300 : A.white });
    cx += w + 10;
    return out;
  });
  if (cx - 10 > X - 36) fail("the chips no longer fit the panel");
  const identity =
    `<rect width="${X}" height="${CARD.h}" fill="${APP.header}"/>` +
    glyphs.text("REACT NATIVE FIELD APP", { font: "mono", size: 11.5, x: 40, y: 60, fill: A.gray400, tracking: 0.14 }) +
    glyphs.text(NAME, { ...nameStyle, x: 38, y: 130, fill: A.white }) +
    `<rect x="40" y="152" width="48" height="4" fill="${APP.orange}"/>` +
    lines.map((l, i) => glyphs.text(l, { ...lineStyle, x: 40, y: 200 + i * 34, fill: A.white })).join("") +
    chips.join("");

  return {
    svg: card({
      title: "CORDE Mobile, an offline-first React Native field-log app for maintenance crews. Two phones redrawn from the app show a crew’s morning: the six-tool dashboard goes offline, a new log saves with no signal, then, back online, a date-range sync brings in the jobs and they drop onto a map as pins.",
      css: css.join(""),
      defs: `${glyphs.defs()}${[...iconDefs.values()].join("")}${defs.join("")}`,
      body: stage + identity + `<rect x="${X - 0.5}" width="1" height="${CARD.h}" fill="${A.gray700}"/>`,
      radius: 14,
    }),
    facts: { screens: 4, tools: tools.length, icons: iconDefs.size, rail: RAIL.length, loop: `${T.toFixed(1)}s` },
  };
}
