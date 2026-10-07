// CORDE Mobile card. Chan was Full Stack Developer and Lead Documenter on a
// Lincoln University industry-placement team that built a React Native field
// app for CORDE in 2024; a teammate took the project over that year. So the
// card shows the app doing a crew's job, tool by tool, and closes on Chan's
// part in the build with the team stated on the same frame.
//
// It is drawn in the app's own look, as the product film's coded replica
// records it (corde-promo-studio, src/replica/tokens.ts and src/fonts.ts): the
// #282828 header, the #FF620A orange, the six dashboard tile colours, Roboto
// (the app asks for the platform face, which is Roboto on Android), a
// monospace for dashboard labels (Noto Sans Mono in the film), and the film's
// own caption voice (Archivo on its paper and ink).
//
// What is said, and where it comes from:
//   - the eight captions are the film's (src/data/captions.json), read at
//     build time; the six tool names are the app's own strings
//     (src/replica/strings.gen.json) and their colours the app's tile tokens;
//   - the product name and its line are the film's cleared cards
//     (docs/copy-clearance.md);
//   - the pictures are stills of the film's replica, cut at build time with
//     ffmpeg. Every record in them is fictional (the film's constraint C1);
//   - the closing figures are the career database's (projects[
//     corde-mobile-application] and work[corde]), checked at build time.
// It keeps the film's rules: no speed claim (C9), nothing that reads as CORDE
// endorsing the piece, and the company wordmark is not used as the card's own
// mark (C6); it appears only where the app shows it. Nothing here says the app
// is Chan's to maintain or to offer.
//
// The film is NOT in this repo (CORDE_INPUTS); where it is absent the card is
// not rebuilt and the committed SVG stands.
import { readFileSync } from "node:fs";

import { filmStills, wrap } from "../lib/svg-card/film.mjs";
import { CARD, card, pct } from "../lib/svg-card/shell.mjs";

export const CORDE_FONTS = {
  display: "scripts/cards/fonts/corde/Archivo-800.ttf",
  caption: "scripts/cards/fonts/archlang/Archivo-700.ttf",
  ui: "scripts/cards/fonts/corde/Roboto-400.ttf",
  uiMid: "scripts/cards/fonts/corde/Roboto-500.ttf",
  mono: "scripts/cards/fonts/corde/NotoSansMono-500.ttf",
};
export const CORDE_INPUTS = {
  film: "../corde-promo-studio/out/masters/corde-mobile_60s_landscape_1920x1080.mp4",
  filmVertical: "../corde-promo-studio/out/masters/corde-mobile_60s_vertical_1080x1920.mp4",
  captions: "../corde-promo-studio/src/data/captions.json",
  strings: "../corde-promo-studio/src/replica/strings.gen.json",
  tokens: "../corde-promo-studio/src/replica/tokens.ts",
  clearance: "../corde-promo-studio/docs/copy-clearance.md",
};

// The app's hard-coded colours and the NativeBase shades it uses (tokens.ts),
// and the film's paper and ink (its Overlays.tsx).
const A = { header: "#282828", orange: "#FF620A", orange50: "#fff7ed", orange600: "#ea580c", white: "#ffffff", gray300: "#d4d4d8", gray400: "#a1a1aa", gray600: "#52525b", gray800: "#27272a" };
const FILM = { paper: "#faf6ec", ink: "#16222f" };

const NAME = "CORDE Mobile";
const LINE = "Offline-first field logs for maintenance crews";
const ROLE = "Full Stack Developer & Lead Documenter";

// The six dashboard tiles, in the app's own order: string id, tile token.
const TOOLS = [["log-list", "list"], ["new-log", "newLog"], ["sync-log", "sync"], ["log-group", "group"], ["map-marker", "map"], ["settings", "settings"]];

// The film's beats: caption key, the tools each one uses, and the stills.
// A still is [second, crop in the master's pixels, "v" for the vertical cut].
const WIDE = (y) => `804:738:1116:${y}`;
const SCENES = [
  { caption: "login-dashboard", tools: [0, 1, 2, 3, 4, 5], stills: [[7.5, "1080:992:0:500", "v"]] },
  { caption: "log-list", tools: [0], stills: [[11.6, WIDE(100)]] },
  { caption: "complete-log", tools: [0], stills: [[17.6, WIDE(60)]] },
  { caption: "offline", tools: [1], stills: [[22.4, WIDE(110)], [25.2, "740:680:1125:30"]] },
  { caption: "sync-build", tools: [2], stills: [[27.4, WIDE(90)]] },
  { caption: "sync-drop", tools: [2], stills: [[33.6, "1013:930:907:50"]] },
  { caption: "map", tools: [4], stills: [[46.6, "861:790:1059:150"]] },
  { caption: "group", tools: [3], stills: [[52.9, "923:848:997:100"]] },
];

export function buildCordeCard({ glyphs, root, project }) {
  const read = (key) => readFileSync(`${root}/${CORDE_INPUTS[key]}`, "utf8");
  const fail = (what) => {
    throw new Error(`corde card: ${what}`);
  };

  // ── Cleared copy, read where it lives ──────────────────────────────────────
  const captions = JSON.parse(read("captions"));
  const strings = JSON.parse(read("strings"));
  const tileBlock = read("tokens").match(/tile:\s*\{([^}]+)\}/) || fail("no tile colours in the film's tokens.ts");
  const tiles = Object.fromEntries([...tileBlock[1].matchAll(/(\w+):\s*"(#[0-9a-fA-F]{6})"/g)].map((m) => [m[1], m[2]]));
  const tools = TOOLS.map(([id, tile]) => {
    if (!strings[id]?.text || !tiles[tile]) fail(`tool "${id}" is no longer in the film's strings or tile tokens`);
    return { label: strings[id].text, colour: tiles[tile] };
  });
  const clearance = read("clearance");
  for (const s of [NAME, LINE]) if (!clearance.includes(`\`${s}\``)) fail(`"${s}" is not a cleared row in the film's copy-clearance.md`);

  // ── Career facts, checked against the database ─────────────────────────────
  const metric = (label) => (project.metrics || []).find((m) => m.label === label)?.value || fail(`projects[corde-mobile-application].metrics has no "${label}"`);
  const work = readFileSync(`${root}/data/profile/10-career.yaml`, "utf8").split(/\n {2}- id: corde\n/)[1]?.split(/\n {2}- id: /)[0].replace(/\*\*/g, "").replace(/\s+/g, " ") || fail("work[corde] not found in 10-career.yaml");
  const need = (text, re, what) => re.test(text) || fail(`the database no longer says ${what}`);
  need(metric("Commits"), /^236 of 413 in the original repository \(57%\), the largest share of three contributors$/, "236 of 413 commits in the original repository (57%)");
  need(metric("Documentation"), /^140 of 143 commits in the team['’]s documentation repository \(97\.9%\)$/, "140 of 143 documentation commits (97.9%)");
  need(project.roles.join(" & "), new RegExp(`^${ROLE}$`), "the two roles");
  need(work, /startDate: "2024-06" endDate: "2024-11"/, "Jun 2024 to Nov 2024");
  need(work, /Lincoln University COMP693 Industry Placement/, "the COMP693 industry placement");
  need(work, /413 commits across three contributors/, "413 commits across three contributors");
  need(work, /my 236 commits/, "236 commits");
  need(work, /57% of that commit history/, "57% of the commit history");
  need(work, /143 commits; my 140 \(97\.9%\)/, "140 of 143 documentation commits");
  need(work, /weekly on-site meetings/, "weekly on-site meetings");
  need(work, /later forked the repository .{0,60}to take the project over/, "that a teammate took the project over");
  const BUILT = [
    ["Commits", "57%", "236 of 413 commits in the original repository, the largest share of three contributors."],
    ["Documentation", "97.9%", "140 of 143 commits in the team’s documentation repository."],
    ["Placement", "5 months", "June to November 2024, with weekly on-site meetings at CORDE."],
  ];
  const TEAM = "A university team project for CORDE. A teammate took it over in 2024.";

  const shots = SCENES.map((s) =>
    s.stills.map(([at, crop, cut]) => filmStills(`${root}/${cut ? CORDE_INPUTS.filmVertical : CORDE_INPUTS.film}`, [at], { crop, w: 392, h: 360, quality: 4 })[0]),
  );

  // ── Timeline: eight beats, then the closing frame ──────────────────────────
  const D = 4.4;
  const OUTRO = 6.4;
  const outroAt = D * SCENES.length;
  const T = outroAt + OUTRO;
  const p = (t) => pct(t, T, 3);
  const css = [];
  const rule = (name, body) => css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${T}s linear infinite}`);
  const delay = (t) => `animation-delay:${(t - T).toFixed(2)}s`;
  rule("ch", `0%{opacity:0}${p(0.3)},${p(D - 0.3)}{opacity:1}${p(D)},100%{opacity:0}`);
  rule("sb", `0%,${p(2.0)}{opacity:0}${p(2.4)},100%{opacity:1}`);
  rule("zm", `0%{transform:scale(1)}${p(D)},100%{transform:scale(1.04)}`);
  rule("ln", `0%,${p(0.25)}{transform:scaleX(0)}${p(0.75)},100%{transform:scaleX(1)}`);
  css.push(".zm{transform-box:fill-box;transform-origin:center}.ln{transform-box:fill-box;transform-origin:left center}");
  rule("tk", `0%,${p(outroAt - 0.3)}{opacity:1}${p(outroAt)},${p(T - 0.3)}{opacity:0}100%{opacity:1}`);
  rule("out", `0%,${p(outroAt)}{opacity:0}${p(outroAt + 0.35)},${p(T - 0.35)}{opacity:1}100%{opacity:0}`);
  BUILT.forEach((_, n) => rule(`bf${n}`, `0%,${p(outroAt + 0.5 + n * 0.3)}{opacity:0;transform:translateY(6px)}${p(outroAt + 0.85 + n * 0.3)},100%{opacity:1;transform:none}`));

  // ── Identity, on the app's header colour ───────────────────────────────────
  const X = CARD.panel;
  const body14 = { font: "ui", size: 14.5 };
  const about = wrap(glyphs, "Crews capture text, photos and GPS in the field. The app holds each log on the phone and syncs to CORDE’s Workbench platform when connectivity returns.", body14, 410);
  if (glyphs.measure(LINE, { font: "caption", size: 18.5 }) > X - 64) fail("the product line no longer fits the panel");
  const roleW = glyphs.measure(ROLE, { font: "uiMid", size: 13.5 }) + 28;
  const identity =
    `<rect width="${X}" height="${CARD.h}" fill="${A.header}"/>` +
    glyphs.text("REACT NATIVE FIELD APP · INDUSTRY PLACEMENT, 2024", { font: "mono", size: 10.5, x: 40, y: 54, fill: A.gray400, tracking: 0.1 }) +
    glyphs.text(NAME, { font: "display", size: 46, x: 40, y: 116, fill: A.white }) +
    `<rect x="40" y="136" width="40" height="3" fill="${A.orange}"/>` +
    glyphs.text(LINE, { font: "caption", size: 18.5, x: 40, y: 174, fill: A.white }) +
    about.map((l, n) => glyphs.text(l, { ...body14, x: 40, y: 208 + n * 21, fill: A.gray300 })).join("") +
    // the app's own flat orange button
    `<rect x="40" y="288" width="${roleW.toFixed(1)}" height="34" rx="4" fill="${A.orange}"/>` +
    glyphs.text(ROLE, { font: "uiMid", size: 13.5, x: 54, y: 310, fill: A.white }) +
    glyphs.text("Jun – Nov 2024", { font: "uiMid", size: 13.5, x: 40 + roleW + 16, y: 310, fill: A.gray300 });

  // ── The beats: the film's caption, the tool in use, the film's picture ─────
  const CAP = { x: X + 32, w: 348 };
  const PIC = { x: 908, w: 392, h: CARD.h };
  const defs = [`<clipPath id="pic"><rect x="${PIC.x}" width="${PIC.w}" height="${PIC.h}"/></clipPath>`];
  const capStyle = { font: "caption", size: 26 };
  // the dashboard's own two-column grid of tiles
  const tool = (n, lit) => {
    const x = CAP.x + (n % 2) * 180;
    const y = 222 + Math.floor(n / 2) * 38;
    return (
      `<rect x="${x}" y="${y}" width="22" height="22" rx="5" fill="${tools[n].colour}"${lit ? "" : ' fill-opacity=".22"'}/>` +
      glyphs.text(tools[n].label, { font: "mono", size: 13.5, x: x + 32, y: y + 16, fill: lit ? FILM.ink : A.gray400, tracking: 0.04 })
    );
  };
  const tickX = (i) => CAP.x + i * 20;
  const scenes = SCENES.map((s, i) => {
    const t0 = i * D;
    const text = captions[s.caption] || fail(`caption "${s.caption}" is no longer in the film's captions.json`);
    const lines = wrap(glyphs, text, capStyle, CAP.w);
    if (lines.length > 2) fail(`caption "${text}" no longer fits two lines`);
    const out = [
      `<rect x="${tickX(i)}" y="40" width="14" height="3" fill="${A.orange}"/>`,
      `<rect class="ln" style="${delay(t0)}" x="${CAP.x}" y="84" width="34" height="3" fill="${A.orange}"/>`,
      ...lines.map((l, n) => glyphs.text(l, { ...capStyle, x: CAP.x, y: 126 + n * 33, fill: FILM.ink })),
      // lit tiles sit over the dim grid
      ...s.tools.map((n) => `<rect x="${CAP.x + (n % 2) * 180 - 4}" y="${222 + Math.floor(n / 2) * 38 - 4}" width="176" height="30" fill="${FILM.paper}"/>${tool(n, true)}`),
    ];
    const img = (b64, cls) => `<image${cls} x="${PIC.x}" width="${PIC.w}" height="${PIC.h}" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${b64}"/>`;
    out.push(`<g clip-path="url(#pic)"><g class="zm" style="${delay(t0)}">${img(shots[i][0], "")}${shots[i][1] ? img(shots[i][1], ` class="sb" style="${delay(t0)}"`) : ""}</g></g>`);
    return `<g class="ch" style="${delay(t0)}" opacity="0">${out.join("")}</g>`;
  });
  const grid = `<g class="tk" opacity="0">${SCENES.map((_, i) => `<rect x="${tickX(i)}" y="40" width="14" height="3" fill="${FILM.ink}" fill-opacity=".16"/>`).join("")}${tools.map((_, n) => tool(n, false)).join("")}</g>`;

  // ── The closing frame, laid out like the app's own log detail ──────────────
  const SW = CARD.w - X;
  const basis = { font: "ui", size: 13.5 };
  const outro = [
    `<rect x="${X}" width="${SW}" height="48" fill="${A.header}"/>`,
    glyphs.text("Lincoln University COMP693 industry placement", { font: "uiMid", size: 16.5, x: X + SW / 2, y: 30, fill: A.white, anchor: "middle" }),
    `<rect x="${X}" y="48" width="${SW}" height="40" fill="${A.orange}"/>`,
    glyphs.text("Chan Meng’s part in the build", { font: "uiMid", size: 15, x: CAP.x, y: 73, fill: A.white }),
    glyphs.text("Jun – Nov 2024", { font: "uiMid", size: 15, x: CARD.w - 32, y: 73, fill: A.white, anchor: "end" }),
    `<rect x="${X}" y="88" width="${SW}" height="200" fill="${A.orange50}"/>`,
    `<path d="M${X} 288.5H${CARD.w}" stroke="${A.gray300}"/>`,
    glyphs.text(TEAM, { font: "ui", size: 14.5, x: CAP.x, y: 328, fill: A.gray800 }),
  ];
  BUILT.forEach(([label, value, text], n) => {
    const x = CAP.x + n * 252;
    outro.push(
      `<g class="bf${n}">${glyphs.text(label, { font: "ui", size: 13.5, x, y: 120, fill: A.orange600 })}` +
        glyphs.text(value, { font: "display", size: 46, x, y: 172, fill: FILM.ink }) +
        wrap(glyphs, text, basis, 222).map((l, k) => glyphs.text(l, { ...basis, x, y: 204 + k * 19, fill: A.gray800 })).join("") +
        `</g>`,
    );
  });

  const stage =
    `<rect x="${X}" width="${SW}" height="${CARD.h}" fill="${FILM.paper}"/>` +
    grid +
    scenes.join("") +
    // the closing frame is the still frame
    `<g class="out">${outro.join("")}</g>`;

  return {
    svg: card({
      title: "CORDE Mobile, an offline-first React Native field-log app for CORDE’s maintenance crews, built in 2024 by a Lincoln University industry-placement team with Chan Meng as Full Stack Developer and Lead Documenter. Eight stills from the product film’s coded replica of the app: sign in to six tools, search and open a job, submit a finished job, save a new log with no signal, background sync, sync a date range, jobs as map pins, and group completion. Chan’s part, June to November 2024: 236 of 413 commits in the original app repository (57%, the largest share of three contributors) and 140 of 143 commits in the documentation repository (97.9%). A teammate took the project over in 2024.",
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body: stage + identity + `<rect x="${X - 0.5}" width="1" height="${CARD.h}" fill="#3f3f46"/>`,
      radius: 14,
    }),
    facts: { beats: SCENES.length, stills: shots.flat().length, tools: tools.length, loop: `${T.toFixed(1)}s` },
  };
}
