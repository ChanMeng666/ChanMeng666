// GAVIGO IRE card. IRE keeps the next game in a feed warm and activates it as
// the viewer arrives, so the stage shows both halves at once and lets them
// react to each other: a phone whose feed scrolls video → game → video → game
// and back, and the orchestrator's log, whose lifecycle dots light as the feed
// moves. The dots are the main moving thing.
//
// It is drawn in the product's own look (the mobile feed, the dark dashboard
// and the film's ground): Space Grotesk for the film's voice, Inter for product
// UI, JetBrains Mono for the disclosure.
//
// This card restates Chan's GAVIGO IRE product film (private repo
// gavigo-promo-film) and inherits its constraints, docs/constraints.md there:
//   - the only figures stated are the three cleared ones, each under its
//     cleared label and with the boundary note on the same card (C-01, C-02);
//   - the log draws STATES, never timings, and the mock carries no other
//     number: no feed positions, no like counts, no game score (C-03);
//   - no speed word in the card's own voice; the hook is GAVIGO's cleared
//     positioning line, verbatim (C-04);
//   - every product string is the product's own (C-08);
//   - the disclosure line is on screen whenever the recreated UI is (C-09).
//
// The phone's body and the product UI on it are vector. What plays on its
// screen is the film's own source footage, cut into stepped JPEG frames at build
// time with ffmpeg: the two feed videos, and each game's captured run.
//   - A feed video that shows a person is not used (the card carries no
//     person), so the two videos are the film's architecture and city plates.
//   - Each game is cropped below its own HUD (score, lives, ammo), and DEAD
//     AGAIN is cut from after its "Level 1" label has faded, so no number in
//     the footage reaches the card (C-03).
//   - Clumsy Bird plays only the flight between its title screen and the next
//     game-over, as the film does (G1_PLATE in src/replica/screenplay.ts), at
//     half speed so the one flight spans both visits: the return resumes on
//     the frame the game was parked on.
// The log follows the replica's rules (src/replica/at.ts in the film repo):
// AI, Loading and Standby light at page load; Interest when the game becomes
// the next thing in the feed; Active, Running and Ready as the viewer arrives;
// the current game sorts first; a return swaps the pipeline for the reuse line.
// The film's copy, strings and data files are read to assert every string, and
// its footage is read for the frames (GAVIGO_INPUTS); where they are absent the card is not rebuilt and the
// committed SVG stands.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { card, pct } from "../lib/svg-card/shell.mjs";

export const GAVIGO_FONTS = {
  voice: "scripts/cards/fonts/gavigo/SpaceGrotesk-600.ttf",
  voiceBold: "scripts/cards/fonts/archcanvas/SpaceGrotesk-700.ttf",
  ui: "scripts/cards/fonts/gavigo/Inter-400.ttf",
  uiMid: "scripts/cards/fonts/gavigo/Inter-500.ttf",
  uiBold: "scripts/cards/fonts/gavigo/Inter-600.ttf",
  mono: "cv/fonts/JetBrainsMono-Regular.ttf",
};
export const GAVIGO_INPUTS = {
  copy: "../gavigo-promo-film/src/copy.ts",
  strings: "../gavigo-promo-film/src/replica/strings.ts",
  catalog: "../gavigo-promo-film/src/data/catalog.json",
  videos: "../gavigo-promo-film/src/data/videos.json",
  gameplay: "../gavigo-promo-film/src/data/gameplay.json",
  videoA: "../gavigo-promo-film/public/videos/16646786.mp4",
  videoB: "../gavigo-promo-film/public/videos/18131601.mp4",
  clumsyBird: "../gavigo-promo-film/public/gameplay/clumsy-bird.mp4",
  deadAgain: "../gavigo-promo-film/public/gameplay/dead-again.mp4",
};
// The phone's content area, and how each kind of footage is fitted to it.
const FRAME = { w: 154, h: 268 };
const FIT = { video: "scale=154:274,crop=154:268", clumsyBird: "crop=408:710:14:130,scale=154:268", deadAgain: "crop=379:660:28:180,scale=154:268" };

// Film ground (F), dashboard (D) and mobile (M) tokens, from the film's replica/tokens.ts.
const F = { ground: "#070a1f", deep: "#03051a", ink: "#eef1f8", body: "#c4ccdf", muted: "#9aa6c4", accent: "#0082fb" };
const D = { surface: "#080b11", overlay: "#252c37", fg: "#fafafa", mutedFg: "#a1a1a1", primary: "#0da2e7", success: "#10b77f", hot: "#ef4343", warm: "#f59f0a", emerald500: "#10b981", gray600: "#4b5563", gray700: "#374151", gray800: "#1f2937", gray900: "#111827" };
const M = { base: "#0e0e18", surface: "#161625", border: "#2a2a40", borderSubtle: "#1e1e30", accent: "#7c3aed", text: "#f0f0f5", textSecondary: "#8e8ea0", textTertiary: "#555568" };
const AVATAR_COLORS = ["#7c3aed", "#3b82f6", "#06b6d4", "#ec4899", "#f59e0b", "#10b981"];
// [label, dot, lit label]
const STAGES = [
  ["Interest", "#64748b", "#94a3b8"], ["AI", "#3b82f6", "#60a5fa"], ["Loading", "#f59e0b", "#fbbf24"], ["Standby", "#22c55e", "#4ade80"],
  ["Active", "#f97316", "#fb923c"], ["Running", "#ef4444", "#f87171"], ["Ready", "#10b981", "#34d399"],
];

// Film-voice copy and the three cleared figures (the film's copy.ts). A label
// is set on two lines; the break is the only thing added to it.
const COPY = {
  name: "GAVIGO IRE",
  line: "Activation and Execution Layer for Interactive Software",
  hook: ["Discovery is instant.", "Interaction is not."],
  kicker: "Measured in the current proof stage",
  proof: [["78%", ["Application-Level", "Reduction"]], ["4.45s → 1.00s", ["Controlled Startup", "Path Comparison"]], ["~140ms", ["Preserved AI", "State Restore"]]],
  boundary: ["Real, controlled application-level measurements — not a production SLA", "or a complete end-to-end activation time."],
  disclosure: "Product UI recreated in code  ·  sequence shortened",
};
// The replica's words (the film's replica/strings.ts, each byte-faithful to the product).
const STR = {
  logTitle: "Container Orchestration Log", logSub: "(self-hosted, real K8s scaling)", now: "NOW", k8s: "K8s",
  reattached: "Iframe reattached — nothing rebuilt", initial: "Initial page load", lookahead: "Preparing nearby content",
  other: "Other containers", prepared: "Prepared Activation", liveReturn: "Live Session Return", loadingGame: "Loading game...",
};

// The feed the phone scrolls, shortened: a video, a game, a video, a game.
// `cuts` are [from second, frames a second, frames] of the source file, in order. `q` is the
// JPEG quality: the videos sit under the feed card's scrim and carry most of the weight.
const FEED = [
  { kind: "video", by: "Abhishek  Shekhawat", input: "videoA", fit: FIT.video, q: 13, cuts: [[0, 4, 16]] },
  // the title screen, then the flight at half speed (8 a second, stepped at 4)
  { kind: "game", id: "game-clumsy-bird", input: "clumsyBird", fit: FIT.clumsyBird, q: 9, cuts: [[3.1, 4, 1], [3.5, 8, 22]] },
  { kind: "video", by: "Ray .", input: "videoB", fit: FIT.video, q: 13, cuts: [[2, 2, 7]] },
  { kind: "game", id: "game-dead-again", input: "deadAgain", fit: FIT.deadAgain, q: 9, cuts: [[3.75, 4, 14]] },
];
// Seconds between two frames of a strip as it plays.
const STEP = 0.25;
// Seconds. The feed comes to rest SWIPE after a swipe starts; the last two swipes scroll back.
const SWIPE = 0.55;
const SWIPES = [{ at: 4, to: 1 }, { at: 8.6, to: 2 }, { at: 11.6, to: 3 }, { at: 15.55, to: 2 }, { at: 16.1, to: 1 }];
const PLAY = 20.4;
const T = PLAY + 0.6;
// The still frame (animations off) is the first activation, complete.
const STILL = 7;

// JPEG frames (base64) of one feed item, cut from its source file with ffmpeg.
function footage(root, item) {
  const dir = mkdtempSync(path.join(tmpdir(), "gavigo-card-"));
  try {
    return item.cuts.flatMap(([from, fps, count], n) => {
      execFileSync("ffmpeg", [
        "-loglevel", "error", "-y", "-ss", String(from), "-t", String((count + 1) / fps), "-i", path.join(root, GAVIGO_INPUTS[item.input]),
        "-vf", `fps=${fps},${item.fit}`, "-frames:v", String(count), "-q:v", String(item.q), path.join(dir, `c${n}-%03d.jpg`),
      ]);
      const files = readdirSync(dir).filter((f) => f.startsWith(`c${n}-`)).sort();
      if (files.length !== count) throw new Error(`gavigo card: expected ${count} frames of ${item.input}, ffmpeg wrote ${files.length}`);
      return files.map((f) => readFileSync(path.join(dir, f)).toString("base64"));
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function sources(root) {
  const read = (key) => readFileSync(path.join(root, GAVIGO_INPUTS[key]), "utf8");
  const copy = read("copy");
  const strings = read("strings");
  const catalog = JSON.parse(read("catalog"));
  const videos = JSON.parse(read("videos"));
  const gameplay = JSON.parse(read("gameplay"));
  const need = (ok, what) => {
    if (!ok) throw new Error(`gavigo card: ${what} is no longer in the film's source`);
  };
  for (const s of [COPY.name, COPY.line, ...COPY.hook, COPY.kicker, ...COPY.boundary, COPY.disclosure]) need(copy.includes(`"${s}"`), `copy "${s}"`);
  for (const [value, label] of COPY.proof) need(copy.includes(`{ value: "${value}", label: "${label.join(" ")}" }`), `figure "${value}"`);
  for (const s of Object.values(STR)) need(strings.includes(`s("${s}"`), `product string "${s}"`);
  for (const [s] of STAGES) need(strings.includes(`s("${s}"`), `stage "${s}"`);
  const games = catalog.studios.flatMap((s) => s.games);
  return FEED.map((item) => {
    if (item.kind === "game") {
      const g = games.find((x) => x.id === item.id);
      need(g, `game ${item.id}`);
      const plate = gameplay.find((x) => `game-${x.slug}` === item.id);
      need(plate && GAVIGO_INPUTS[item.input].endsWith(`/${plate.file}`), `captured gameplay of ${item.id}`);
      return { ...item, title: g.title, theme: g.theme, frames: footage(root, item) };
    }
    const v = videos.find((x) => x.photographer === item.by);
    need(v && GAVIGO_INPUTS[item.input].endsWith(`/${v.file}`), `video by ${item.by}`);
    return { ...item, title: v.title, theme: v.theme, frames: footage(root, item) };
  });
}

export function buildGavigoCard({ glyphs, root }) {
  const feed = sources(root);

  // ── Timeline helpers ───────────────────────────────────────────────────────
  const p = (t) => pct(t, T, 2);
  const css = [];
  const rules = new Map();
  const rule = (body, rest = "") => {
    const key = body + rest;
    if (!rules.has(key)) {
      const name = `k${rules.size.toString(36)}`;
      rules.set(key, name);
      css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${T}s linear infinite${rest}}`);
    }
    return rules.get(key);
  };
  const EASE = "cubic-bezier(.3,0,.2,1)";
  const atStill = (windows) => windows.some(([a, b]) => a <= STILL && STILL < b);
  // shown inside the windows [from, to); in the still frame only if one of them holds STILL
  const show = (windows, fade = 0.12) => {
    if (windows.length === 1 && windows[0][0] <= 0 && windows[0][1] >= T) return "";
    let body = `0%{opacity:${windows[0][0] <= 0 ? 1 : 0}}`;
    for (const [a, b] of windows) {
      if (a > 0) body += `${p(a)}{opacity:0}${p(a + fade)}{opacity:1}`;
      if (b < T) body += `${p(b)}{opacity:1}${p(b + fade)}{opacity:0}`;
    }
    body += `100%{opacity:${windows.at(-1)[1] >= T ? 1 : 0}}`;
    return ` class="${rule(body)}"${atStill(windows) ? "" : ' opacity="0"'}`;
  };
  const from = (t) => [[t, T]];
  const not = (windows) => {
    const out = [];
    let t = 0;
    for (const [a, b] of windows) {
      if (a > t) out.push([t, a]);
      t = b;
    }
    if (t < T) out.push([t, T]);
    return out;
  };
  // steps [[t, y], …]: rests at y, and glides to the next y over `dur` from its t
  const slide = (steps, dur) => {
    const tf = (v) => `transform:translateY(${v}px)`;
    let body = `0%{${tf(steps[0][1])}}`;
    for (let i = 1; i < steps.length; i += 1) body += `${p(steps[i][0])}{${tf(steps[i - 1][1])};animation-timing-function:${EASE}}${p(steps[i][0] + dur)}{${tf(steps[i][1])}}`;
    body += `100%{${tf(steps.at(-1)[1])}}`;
    return rule(body, `;${tf(steps.filter(([t]) => t <= STILL).at(-1)[1])}`);
  };
  // a column of frames stepped through in place. plays [[t, first frame, last frame], …]: one
  // frame every STEP from t, holding between plays and on the last frame after them
  const strip = (frames, plays) => {
    const tf = (i) => `transform:translateY(${-i * FRAME.h}px)`;
    let body = `0%{${tf(plays[0][1])}}`;
    let still = plays[0][1];
    for (const [t, a, b] of plays) {
      body += `${p(t)}{${tf(a)};animation-timing-function:steps(${b - a},end)}${p(t + (b - a) * STEP)}{${tf(b)}}`;
      if (STILL > t) still = Math.min(b, a + Math.floor((STILL - t) / STEP));
    }
    body += `100%{${tf(plays.at(-1)[2])}}`;
    const images = frames.map((b64, i) => `<image y="${i * FRAME.h}" width="${FRAME.w}" height="${FRAME.h}" href="data:image/jpeg;base64,${b64}"/>`).join("");
    return `<g clip-path="url(#fc)"><g class="${rule(body, `;${tf(still)}`)}">${images}</g></g>`;
  };
  // a ring that leaves a dot as it lights
  const pulse = (t) => rule(`0%,${p(t)}{opacity:0;transform:scale(1)}${p(t + 0.04)}{opacity:.9;transform:scale(1)}${p(t + 0.7)},100%{opacity:0;transform:scale(2.3)}`, ";transform-box:fill-box;transform-origin:center");
  // the stage dips to the ground between loops, so the return to page load is not a jump
  const dip = rule(`0%{opacity:0}${p(0.3)},${p(PLAY)}{opacity:1}${p(PLAY + 0.35)},100%{opacity:0}`);

  const arrive = (index, nth = 0) => SWIPES.filter((s) => s.to === index)[nth].at + SWIPE;
  const leave = (index, nth = 0) => SWIPES.filter((_, i) => (i ? SWIPES[i - 1].to : 0) === index)[nth].at + SWIPE / 2;
  const RETURN = arrive(1, 1);

  const defs = [
    `<radialGradient id="glow" cx=".62" cy=".42" r=".7"><stop offset="0" stop-color="#0b2a6b" stop-opacity=".75"/><stop offset=".55" stop-color="#0a1a4a" stop-opacity=".3"/><stop offset="1" stop-color="${F.deep}" stop-opacity="0"/></radialGradient>`,
    `<linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-opacity="0"/><stop offset=".45" stop-opacity=".3"/><stop offset="1" stop-opacity=".92"/></linearGradient>`,
    `<linearGradient id="bezel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${D.gray800}"/><stop offset="1" stop-color="${D.gray900}"/></linearGradient>`,
  ];
  let grid = "";
  for (let x = 26; x < 1300; x += 26) grid += `M${x} 0V360`;
  for (let y = 26; y < 360; y += 26) grid += `M0 ${y}H1300`;

  // ── Identity: the cleared line, the mark, the hook, the three figures ──────
  const mark = readFileSync(`${root}/public/brands/gavigo-mark.svg`, "utf8").match(/<svg x="17"[^>]*>([\s\S]*?)<\/svg>/);
  if (!mark) throw new Error("gavigo card: could not find the artwork inside public/brands/gavigo-mark.svg");
  const identity = [
    glyphs.text(COPY.line, { font: "uiMid", size: 12.5, x: 40, y: 44, fill: F.muted, tracking: 0.01 }),
    `<svg x="40" y="60" width="58" height="46" viewBox="0 0 980 778">${mark[1]}</svg>`,
    glyphs.text(COPY.name, { font: "voiceBold", size: 36, x: 112, y: 97, fill: F.ink }),
    glyphs.text(COPY.hook[0], { font: "voice", size: 33, x: 40, y: 151, fill: F.ink }),
    glyphs.text(COPY.hook[1], { font: "voice", size: 33, x: 40, y: 190, fill: F.ink }),
    `<rect x="40" y="205" width="54" height="3" rx="1.5" fill="${F.accent}"/>`,
    glyphs.text(COPY.kicker.toUpperCase(), { font: "mono", size: 9.5, x: 40, y: 236, fill: F.accent, tracking: 0.14 }),
  ];
  // the three cleared figures over their labels, and the boundary note with them
  let fx = 40;
  for (const [value, label] of COPY.proof) {
    identity.push(glyphs.text(value, { font: "voice", size: 26, x: fx, y: 267, fill: F.ink, fallback: "mono" }));
    label.forEach((l, i) => identity.push(glyphs.text(l, { font: "ui", size: 10.5, x: fx, y: 284 + i * 13.5, fill: F.body })));
    fx += Math.max(glyphs.measure(value.replace("→", "–"), { font: "voice", size: 26 }) + 8, ...label.map((l) => glyphs.measure(l, { font: "ui", size: 10.5 }))) + 26;
  }
  if (fx - 26 > 500) throw new Error("gavigo card: the three figures no longer fit the panel");
  COPY.boundary.forEach((l, i) => identity.push(glyphs.text(l, { font: "ui", size: 10, x: 40, y: 322 + i * 13.5, fill: F.muted })));

  // ── Small product icons, each in a 24 box ──────────────────────────────────
  const icon = (d, x, y, size, stroke, extra = "") => `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${extra}>${d}</svg>`;
  const IC = {
    pad: `<rect x="2" y="6" width="20" height="12" rx="6"/><path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"/>`,
    heart: `<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.500c0 2.300 1.500 4 3 5.500l7 7z"/>`,
    chat: `<path d="M7.900 20A9 9 0 1 0 4 16.100L2 22z"/>`,
    share: `<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.600 13.500l6.800 4M15.400 6.500l-6.800 4"/>`,
    home: `<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="${M.accent}"/>`,
    compass: `<circle cx="12" cy="12" r="9"/><path d="M15.500 8.500l-2 5-5 2 2-5z"/>`,
    sparkle: `<path d="M12 3l1.900 5.600L19.500 10.500l-5.600 1.900L12 18l-1.900-5.600L4.500 10.500l5.600-1.900z"/>`,
    person: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.500 18.500a6.500 6.500 0 0 1 11 0"/>`,
    file: `<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 15l2 2 4-4"/>`,
    back: `<path d="M3 12a9 9 0 1 0 9-9 9.750 9.750 0 0 0-6.740 2.740L3 8M3 3v5h5"/>`,
  };

  // ── The phone: the mobile feed, as vectors ─────────────────────────────────
  const PH = { x: 532, y: 14, w: 174, h: 332, r: 28 };
  const SC = { x: PH.x + 10, y: PH.y + 26, w: 154, h: 292 };
  const TAB = 24;
  const CH = SC.h - TAB;
  if (SC.w !== FRAME.w || CH !== FRAME.h) throw new Error("gavigo card: the footage frame no longer matches the phone's content area");
  defs.push(`<clipPath id="scr"><rect x="${SC.x}" y="${SC.y}" width="${SC.w}" height="${SC.h}" rx="14"/></clipPath>`);
  defs.push(`<clipPath id="fc"><rect width="${FRAME.w}" height="${FRAME.h}"/></clipPath>`);
  const avatar = (name, cx, cy) => {
    let h = 0;
    for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) | 0;
    return `<circle cx="${cx}" cy="${cy}" r="9" fill="${AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]}"/>` + glyphs.text(name.charAt(0).toUpperCase(), { font: "uiBold", size: 9.5, x: cx, y: cy + 3.4, fill: "#fff", anchor: "middle" });
  };
  const tags = (labels, y) => {
    let x = 10;
    return labels
      .map((label) => {
        const w = glyphs.measure(label, { font: "uiMid", size: 9 }) + 12;
        const s = `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="15" rx="7.5" fill="${M.surface}" stroke="${M.border}"/>` + glyphs.text(label, { font: "uiMid", size: 9, x: x + 6, y: y + 10.8, fill: M.textSecondary });
        x += w + 4;
        return s;
      })
      .join("");
  };
  const rail = (bottom) => ["heart", "chat", "share"].map((k, i) => `<circle cx="${SC.w - 18}" cy="${bottom - 62 + i * 29}" r="11" fill="#fff" fill-opacity=".1"/>` + icon(IC[k], SC.w - 24.5, bottom - 68.5 + i * 29, 13, "#fff")).join("");
  // break a title where the product's own card would wrap it
  const wrap = (text, opts, max) => {
    const lines = [""];
    for (const word of text.split(/\s+/)) {
      const next = lines.at(-1) ? `${lines.at(-1)} ${word}` : word;
      if (lines.at(-1) && glyphs.measure(next, opts) > max) lines.push(word);
      else lines[lines.length - 1] = next;
    }
    return lines;
  };
  const cards = feed.map((item, n) => {
    const out = [];
    if (item.kind === "video") {
      // the video plays from just before its card comes to rest
      out.push(strip(item.frames, [[n ? arrive(n) - 0.25 : 0.1, 0, item.frames.length - 1]]));
      out.push(`<rect y="${CH - 150}" width="${SC.w}" height="150" fill="url(#scrim)"/>`);
      const title = wrap(item.title, { font: "uiBold", size: 9.5 }, SC.w - 48);
      const top = CH - 36 - title.length * 12.5;
      out.push(avatar(item.by, 19, top - 14));
      out.push(glyphs.text(`@${item.by.toLowerCase().replace(/ /g, "_")}`, { font: "uiBold", size: 9.5, x: 33, y: top - 10.6, fill: M.text }));
      title.forEach((l, i) => out.push(glyphs.text(l, { font: "uiBold", size: 9.5, x: 10, y: top + 10 + i * 12.5, fill: M.text })));
      out.push(tags([`#${item.theme}`, "#video"], CH - 26));
      out.push(rail(top - 34));
      // the video's own progress line runs while its card is on screen
      const [since, until] = n ? [arrive(n), leave(n)] : [0, leave(0)];
      const run = rule(`0%,${p(since)}{transform:scaleX(0)}${p(until)},100%{transform:scaleX(1)}`, ";transform-box:fill-box;transform-origin:left center");
      out.push(`<rect y="${CH - 2}" width="${SC.w}" height="2" fill="#fff" fill-opacity=".15"/><rect class="${run}" y="${CH - 2}" width="${SC.w * 0.62}" height="2" fill="#fff"/>`);
    } else {
      const live = arrive(n) + 0.3;
      // the game runs once it is live, is parked when the viewer leaves, and on a return
      // carries on from the frame it was parked on
      const last = item.frames.length - 1;
      const parked = Math.min(last, Math.floor((leave(n) - live - 0.3) / STEP));
      const back = n === 1 && parked < last ? [[RETURN + 0.25, parked, last]] : [];
      out.push(strip(item.frames, [[live + 0.3, 0, parked], ...back]));
      // on standby the feed card is the dimmed preview and the product's loading line
      out.push(
        `<g${show([[0, live]], 0.2)}><rect width="${SC.w}" height="${CH}" fill="${M.base}" fill-opacity=".78"/>` +
          icon(IC.pad, SC.w / 2 - 13, 88, 26, M.textSecondary) +
          glyphs.text(STR.loadingGame, { font: "ui", size: 10.5, x: SC.w / 2, y: 132, fill: M.textSecondary, anchor: "middle" }) +
          `</g>`,
      );
      out.push(`<rect y="${CH - 150}" width="${SC.w}" height="150" fill="url(#scrim)"/>`);
      out.push(avatar(item.theme, 19, CH - 66));
      out.push(glyphs.text(`@gavigo_${item.theme}`, { font: "uiBold", size: 9.5, x: 33, y: CH - 62.6, fill: M.text }));
      out.push(glyphs.text(item.title, { font: "uiBold", size: 13, x: 10, y: CH - 37, fill: M.text }));
      out.push(tags([`#${item.theme}`, "#game"], CH - 26));
      out.push(rail(CH - 84));
    }
    return `<g transform="translate(0 ${n * CH})">${out.join("")}</g>`;
  });
  const scroll = slide([[0, 0], ...SWIPES.map((s) => [s.at, -s.to * CH])], SWIPE);
  // the touch that makes each swipe: up to move on, down to scroll back
  let touchBody = "0%{opacity:0;transform:translateY(0)}";
  SWIPES.forEach((s, i) => {
    const dy = s.to > (i ? SWIPES[i - 1].to : 0) ? -88 : 88;
    const y0 = dy < 0 ? 0 : -88;
    touchBody += `${p(s.at - 0.14)}{opacity:0;transform:translateY(${y0}px)}${p(s.at)}{opacity:1;transform:translateY(${y0}px);animation-timing-function:${EASE}}${p(s.at + 0.34)}{opacity:1;transform:translateY(${y0 + dy}px)}${p(s.at + 0.46)}{opacity:0;transform:translateY(${y0 + dy}px)}`;
  });
  const touch = rule(`${touchBody}100%{opacity:0;transform:translateY(0)}`);
  const tabs = ["home", "compass", "sparkle", "person"].map((k, i) => icon(IC[k], SC.x + (SC.w / 4) * (i + 0.5) - 6.5, SC.y + CH + 5.5, 13, k === "home" ? M.accent : M.textTertiary)).join("");
  const phone =
    `<rect x="${PH.x}" y="${PH.y}" width="${PH.w}" height="${PH.h}" rx="${PH.r}" fill="url(#bezel)" stroke="${D.gray700}" stroke-width="2"/>` +
    `<rect x="${PH.x + 4}" y="${PH.y + 4}" width="${PH.w - 8}" height="${PH.h - 8}" rx="${PH.r - 4}" fill="#000"/>` +
    `<rect x="${PH.x + PH.w / 2 - 25}" y="${PH.y + 9}" width="50" height="13" rx="6.5" fill="#000" stroke="${D.gray800}"/>` +
    `<circle cx="${PH.x + PH.w / 2 - 12}" cy="${PH.y + 15.5}" r="2.5" fill="${D.gray800}"/><rect x="${PH.x + PH.w / 2 - 4}" y="${PH.y + 14.5}" width="17" height="2" rx="1" fill="${D.gray800}"/>` +
    `<g clip-path="url(#scr)"><rect x="${SC.x}" y="${SC.y}" width="${SC.w}" height="${SC.h}" fill="${M.base}"/>` +
    `<g transform="translate(${SC.x} ${SC.y})"><g class="${scroll}">${cards.join("")}</g>` +
    `<circle class="${touch}" opacity="0" cx="${SC.w / 2 + 14}" cy="${CH - 76}" r="9" fill="#fff" fill-opacity=".28" stroke="#fff" stroke-opacity=".85" stroke-width="1.2"/></g>` +
    `<rect x="${SC.x}" y="${SC.y + CH}" width="${SC.w}" height="${TAB}" fill="${M.base}"/><path d="M${SC.x} ${SC.y + CH + 0.5}h${SC.w}" stroke="${M.borderSubtle}"/>${tabs}</g>` +
    `<rect x="${PH.x + PH.w / 2 - 28}" y="${PH.y + PH.h - 9}" width="56" height="2.5" rx="1.25" fill="#fff" fill-opacity=".3"/>`;

  // ── The orchestration log: one row per game, its dots lit by the feed ──────
  const LG = { x: 726, y: 38, w: 550, h: 294 };
  const ROW = { x: LG.x + 16, w: LG.w - 32, h: 100 };
  // where a row rests: first; second; second under the "other containers" label
  const P0 = LG.y + 62;
  const P1 = P0 + ROW.h + 8;
  const P1L = P1 + 16;
  const pill = (label, x, y, colour, size, { h = 15, fill = 0.14, stroke = 0.5 } = {}) => {
    const w = glyphs.measure(label, { font: "uiBold", size }) + 12;
    return { w, svg: `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}" rx="${h / 2}" fill="${colour}" fill-opacity="${fill}" stroke="${colour}" stroke-opacity="${stroke}"/>` + glyphs.text(label, { font: "uiBold", size, x: x + w / 2, y: y + h / 2 + size * 0.36, fill: colour, anchor: "middle" }) };
  };
  const badge = (kind) => {
    const colour = kind === "HOT" ? D.hot : D.warm;
    const w = glyphs.measure(kind, { font: "uiBold", size: 10, tracking: 0.04 }) + 16;
    return `<rect x="${ROW.w - 12 - w}" y="11" width="${w.toFixed(1)}" height="20" rx="6" fill="${colour}" fill-opacity=".16" stroke="${colour}" stroke-opacity=".5"/>` + glyphs.text(kind, { font: "uiBold", size: 10, x: ROW.w - 12 - w / 2, y: 24.6, fill: colour, anchor: "middle", tracking: 0.04 });
  };
  const head = (title, now) => {
    const out = [`<rect width="${ROW.w}" height="${ROW.h}" rx="9" fill="${now ? "#0a1a2e" : "#0b1418"}" stroke="${now ? D.primary : D.success}" stroke-opacity="${now ? 0.5 : 0.24}"/>`];
    out.push(now ? `<path d="M14 15.500l8 5-8 5z" fill="${D.primary}"/>` : icon(IC.pad, 13, 13.5, 14, D.mutedFg));
    let x = now ? 30 : 34;
    out.push(glyphs.text(title, { font: "uiMid", size: 14, x, y: 25.5, fill: now ? D.primary : D.fg }));
    x += glyphs.measure(title, { font: "uiMid", size: 14 }) + 9;
    for (const [label, colour] of [...(now ? [[STR.now, D.primary]] : []), [STR.k8s, D.success]]) {
      const chip = pill(label, x, 13.5, colour, 9);
      out.push(chip.svg);
      x += chip.w + 6;
    }
    return out.join("");
  };
  const foot = (parts) => {
    let x = 14;
    return parts
      .map((text, i) => {
        const bar = i ? `<path d="M${(x + 1).toFixed(1)} 82.500v9" stroke="${D.gray600}"/>` : "";
        if (i) x += 9;
        const s = bar + glyphs.text(text, { font: "ui", size: 9.5, x, y: 91, fill: D.mutedFg, attrs: 'opacity=".8"' });
        x += glyphs.measure(text, { font: "ui", size: 9.5 }) + 8;
        return s;
      })
      .join("");
  };
  const dotX = (i) => 34 + (i * (ROW.w - 68)) / (STAGES.length - 1);
  const CY = 52;
  // one row. `g`: title, when page load starts lighting it, when it becomes next, when the
  // viewer arrives, the windows it is the current card in, and (first game) when it is returned to
  const row = (g) => {
    const lit = [g.next, g.load, g.load + 0.4, g.load + 0.8, g.arrive, g.arrive + 0.25, g.arrive + 0.5];
    const end = g.back ?? T;
    const out = [`<g${show(not(g.now))}>${head(g.title, false)}</g><g${show(g.now)}>${head(g.title, true)}</g>`];
    out.push(`<g${show([[lit[3], lit[5]]])}>${badge("WARM")}</g><g${show(from(lit[5]))}>${badge("HOT")}</g>`);
    const pipe = [];
    STAGES.forEach(([label, colour, ink], i) => {
      const x = dotX(i);
      const seg = i ? `M${(dotX(i - 1) + 11).toFixed(1)} ${CY}H${(x - 11).toFixed(1)}` : "";
      if (i) pipe.push(`<path d="${seg}" stroke="${D.gray700}" stroke-width="2"/><path${show(from(Math.max(lit[i], lit[i - 1])), 0.1)} d="${seg}" stroke="${colour}" stroke-opacity=".75" stroke-width="2"/>`);
      pipe.push(`<circle cx="${x.toFixed(1)}" cy="${CY}" r="8" fill="${D.gray700}"/>` + glyphs.text(label, { font: "uiMid", size: 10.5, x, y: CY + 22, fill: D.gray600, anchor: "middle" }));
      pipe.push(`<circle class="${pulse(lit[i])}" opacity="0" cx="${x.toFixed(1)}" cy="${CY}" r="8" fill="none" stroke="${colour}" stroke-width="2"/>`);
      pipe.push(`<g${show(from(lit[i]), 0.1)}><circle cx="${x.toFixed(1)}" cy="${CY}" r="8" fill="${colour}"/><circle cx="${x.toFixed(1)}" cy="${CY}" r="2.600" fill="#fff" fill-opacity=".92"/>` + glyphs.text(label, { font: "uiMid", size: 10.5, x, y: CY + 22, fill: ink, anchor: "middle" }) + `</g>`);
    });
    out.push(`<g${show([[0, end]])}>${pipe.join("")}</g>`);
    out.push(`<g${show([[0, g.next]])}>${foot([STR.initial])}</g><g${show([[g.next, g.arrive]])}>${foot([STR.lookahead])}</g><g${show([[g.arrive, end]])}>${foot([STR.prepared, STR.lookahead])}</g>`);
    if (g.back) {
      out.push(`<g${show(from(g.back))}>${icon(IC.back, 16, CY - 7, 15, D.emerald500)}${glyphs.text(STR.reattached, { font: "uiMid", size: 13, x: 39, y: CY + 5, fill: D.emerald500 })}</g>`);
      out.push(`<g${show(from(g.back))}>${foot([STR.liveReturn, STR.lookahead])}</g>`);
    }
    return `<g transform="translate(${ROW.x} 0)"><g class="${slide(g.rest, 0.35)}">${out.join("")}</g></g>`;
  };
  const [first, second] = feed.filter((f) => f.kind === "game");
  const A1 = arrive(1);
  const A3 = arrive(3);
  const rows = [
    // the first game is next from the start; the second once the feed rests on the video before it
    row({ title: first.title, load: 0.5, next: 2.4, arrive: A1, now: [[A1, leave(1)], [RETURN, T]], back: RETURN, rest: [[0, P0], [A3, P1L], [leave(3), P0]] }),
    row({ title: second.title, load: 0.6, next: arrive(2), arrive: A3, now: [[A3, leave(3)]], rest: [[0, P1], [A1, P1L], [leave(1), P1], [A3, P0], [leave(3), P1], [RETURN, P1L]] }),
  ];
  const other = [[A1, leave(1)], [A3, leave(3)], [RETURN, T]];
  const count = `${rows.length} games`;
  const gamesW = glyphs.measure(count, { font: "uiBold", size: 11 }) + 18;
  const controlled = `${rows.length} controlled`;
  const log =
    `<rect x="${LG.x}" y="${LG.y}" width="${LG.w}" height="${LG.h}" rx="14" fill="${D.surface}" fill-opacity=".9" stroke="#1c2233"/>` +
    icon(IC.file, LG.x + 16, LG.y + 13, 17, D.mutedFg) +
    glyphs.text(STR.logTitle, { font: "uiBold", size: 15, x: LG.x + 40, y: LG.y + 27, fill: D.fg }) +
    `<rect x="${LG.x + LG.w - 16 - gamesW}" y="${LG.y + 12}" width="${gamesW.toFixed(1)}" height="21" rx="6" fill="${D.overlay}"/>` +
    glyphs.text(count, { font: "uiBold", size: 11, x: LG.x + LG.w - 16 - gamesW / 2, y: LG.y + 26.5, fill: D.fg, anchor: "middle" }) +
    glyphs.text(controlled, { font: "uiMid", size: 10.5, x: LG.x + 18, y: LG.y + 49, fill: D.success }) +
    glyphs.text(STR.logSub, { font: "ui", size: 10.5, x: LG.x + 22 + glyphs.measure(controlled, { font: "uiMid", size: 10.5 }), y: LG.y + 49, fill: D.mutedFg }) +
    `<g${show(other)}>${glyphs.text(`${STR.other.toUpperCase()} (${rows.length - 1})`, { font: "uiBold", size: 9, x: ROW.x + 2, y: P1L - 6.5, fill: D.mutedFg, tracking: 0.06 })}</g>` +
    rows.join("");

  // ── One tick per scene: page load, arrive, look ahead, arrive, return ──────
  const SCENES = [0, SWIPES[0].at, SWIPES[1].at, SWIPES[2].at, SWIPES[3].at, T];
  const ticks = SCENES.slice(0, -1)
    .map((s, i) => `<rect x="${LG.x + i * 30}" y="20" width="24" height="3" rx="1.5" fill="${F.ink}" fill-opacity=".16"/><rect${show([[s, SCENES[i + 1]]])} x="${LG.x + i * 30}" y="20" width="24" height="3" rx="1.5" fill="${F.accent}"/>`)
    .join("");

  const body =
    `<rect width="1300" height="360" fill="${F.ground}"/><rect width="1300" height="360" fill="url(#glow)"/>` +
    `<path d="${grid}" stroke="#ffffff" stroke-opacity=".028" fill="none"/>` +
    identity.join("") +
    glyphs.text(COPY.disclosure, { font: "mono", size: 9, x: LG.x + LG.w, y: 25, fill: F.muted, anchor: "end" }) +
    `<g class="${dip}">${ticks}${phone}${log}</g>`;

  return {
    svg: card({
      title: "GAVIGO IRE is the activation and execution layer for interactive software. A phone scrolls a feed of videos and games while the orchestration log beside it takes each game from standby to active, running and ready as the viewer arrives. Product UI recreated in code; sequence shortened.",
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body,
      radius: 16,
    }),
    facts: { scenes: SCENES.length - 1, frames: feed.reduce((sum, f) => sum + f.frames.length, 0), loop: `${T.toFixed(1)}s` },
  };
}
