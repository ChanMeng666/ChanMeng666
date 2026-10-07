// GAVIGO IRE card. IRE keeps the next game in a feed warm and activates it as
// the viewer arrives, so the stage shows both halves at once: the phone
// scrolling video → game → video → game, and the orchestrator's log reacting.
//
// It is drawn in the product's own look (the dark dashboard and the film's
// ground): Space Grotesk for the film's voice, Inter for product UI, JetBrains
// Mono for the disclosure.
//
// This card restates Chan's GAVIGO IRE product film (private repo
// gavigo-promo-film) and inherits its constraints, docs/constraints.md there:
//   - the only figures stated are the three cleared ones, each under its
//     cleared label and with the boundary note on the same card (C-01, C-02);
//   - the log draws STATES, never timings (C-03);
//   - every product string is the product's own (C-08);
//   - the disclosure line is on screen whenever the recreated UI is (C-09).
//
// The phone's picture is a nine-second stretch of that film, cut into frames at
// build time with ffmpeg. The log is redrawn as vectors from the same stretch,
// state for state. The film master is NOT in this repo (GAVIGO_INPUTS); where
// it is absent the card is not rebuilt and the committed SVG stands.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { card, pct } from "../lib/svg-card/shell.mjs";

export const GAVIGO_FONTS = {
  voice: "scripts/cards/fonts/gavigo/SpaceGrotesk-600.ttf",
  voiceBold: "scripts/cards/fonts/archcanvas/SpaceGrotesk-700.ttf",
  voiceMid: "scripts/cards/fonts/archcanvas/SpaceGrotesk-500.ttf",
  ui: "scripts/cards/fonts/gavigo/Inter-400.ttf",
  uiMid: "scripts/cards/fonts/gavigo/Inter-500.ttf",
  uiBold: "scripts/cards/fonts/gavigo/Inter-600.ttf",
  mono: "cv/fonts/JetBrainsMono-Regular.ttf",
};
export const GAVIGO_INPUTS = { film: "../gavigo-promo-film/out/masters/gavigo-ire-30s-landscape.mp4" };

// The stretch of the film the phone plays, and where the phone's screen sits in
// its 1920×1080 frame.
const CUT = { from: 12.05, seconds: 9, fps: 4, crop: "380:800:138:160", w: 150, h: 316 };

// Film ground (F) and dashboard (D) tokens, from the film's replica/tokens.ts.
const F = { ground: "#070a1f", deep: "#03051a", ink: "#eef1f8", body: "#c4ccdf", muted: "#9aa6c4", line: "#1e264a", accent: "#0082fb" };
const D = { surface: "#080b11", elevated: "#0f151f", overlay: "#252c37", fg: "#fafafa", mutedFg: "#a1a1a1", border: "#262626", primary: "#0da2e7", success: "#10b77f", hot: "#ef4343", warm: "#f59f0a", gray600: "#4b5563", gray700: "#374151" };
const STAGES = [
  ["Interest", "#64748b"], ["AI", "#3b82f6"], ["Loading", "#f59e0b"], ["Standby", "#22c55e"],
  ["Active", "#f97316"], ["Running", "#ef4444"], ["Ready", "#10b981"],
];

// Film-voice copy and the three cleared figures (the film's copy.ts).
const COPY = {
  name: "GAVIGO IRE",
  line: "Activation and Execution Layer for Interactive Software",
  hook: ["Discovery is instant.", "Interaction is not."],
  standby: ["It keeps the next game on standby,", "then activates it as you arrive."],
  back: ["Scroll back, and the session is reattached.", "Nothing is rebuilt."],
  kicker: "MEASURED IN THE CURRENT PROOF STAGE",
  proof: [["78%", "Application-Level Reduction"], ["4.45s → 1.00s", "Controlled Startup Path Comparison"], ["~140ms", "Preserved AI State Restore"]],
  boundary: ["Real, controlled application-level measurements — not a production SLA", "or a complete end-to-end activation time."],
  disclosure: "Product UI recreated in code  ·  sequence shortened",
};

// The log, state by state, as the film shows it across the cut (seconds from
// the cut's start). `reached` is how many lifecycle stages are lit.
const PREP = "Preparing nearby content";
const LOG = [
  { until: 3.35, rows: [{ name: "DEAD AGAIN", badge: "WARM", reached: 4, foot: [PREP] }, { name: "Clumsy Bird", badge: "HOT", reached: 7, foot: ["Prepared Activation", PREP] }] },
  { until: 5.3, arrive: true, other: true, rows: [{ name: "DEAD AGAIN", now: true, badge: "HOT", reached: 7, foot: ["Prepared Activation", PREP] }, { name: "Clumsy Bird", badge: "HOT", reached: 7, foot: ["Prepared Activation", PREP] }] },
  { until: 5.95, rows: [{ name: "DEAD AGAIN", badge: "HOT", reached: 7, foot: ["Prepared Activation", PREP] }, { name: "Clumsy Bird", badge: "HOT", reached: 7, foot: ["Prepared Activation", PREP] }] },
  { until: 6.95, rows: [{ name: "Clumsy Bird", badge: "HOT", reached: 7, foot: ["Prepared Activation", PREP] }, { name: "DEAD AGAIN", badge: "HOT", reached: 7, foot: ["Prepared Activation", PREP] }] },
  { until: 7.4, other: true, rows: [{ name: "Clumsy Bird", now: true, badge: "HOT", reached: 7, foot: ["Prepared Activation", PREP] }, { name: "DEAD AGAIN", badge: "HOT", reached: 7, foot: ["Prepared Activation", PREP] }] },
  { until: 9, other: true, rows: [{ name: "Clumsy Bird", now: true, badge: "HOT", reattached: true, foot: ["Live Session Return", PREP] }, { name: "DEAD AGAIN", badge: "HOT", reached: 7, foot: ["Prepared Activation", PREP] }] },
];

function filmFrames(root) {
  const dir = mkdtempSync(path.join(tmpdir(), "gavigo-card-"));
  try {
    execFileSync("ffmpeg", [
      "-loglevel", "error", "-y", "-ss", String(CUT.from), "-t", String(CUT.seconds), "-i", path.join(root, GAVIGO_INPUTS.film),
      "-vf", `fps=${CUT.fps},crop=${CUT.crop},scale=${CUT.w}:${CUT.h}`, "-q:v", "9", path.join(dir, "f%03d.jpg"),
    ]);
    return readdirSync(dir).sort().map((f) => readFileSync(path.join(dir, f)).toString("base64"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function buildGavigoCard({ glyphs, root }) {
  const frames = filmFrames(root);
  if (frames.length !== CUT.seconds * CUT.fps) throw new Error(`gavigo card: expected ${CUT.seconds * CUT.fps} film frames, ffmpeg wrote ${frames.length}`);

  // ── Timeline: the cut, a short hold, a dip, and round again ────────────────
  const PLAY = CUT.seconds;
  const T = PLAY + 0.8;
  const p = (t) => pct(t, T, 3);
  const css = [];
  const rule = (name, body, timing = "linear") => css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${T}s ${timing} infinite}`);
  const span = (name, a, b, fade = 0.12) => {
    rule(name, a <= 0 ? `0%,${p(b)}{opacity:1}${p(b + fade)},100%{opacity:0}` : `0%,${p(a)}{opacity:0}${p(a + fade)},${p(b)}{opacity:1}${p(b + fade)},100%{opacity:0}`);
    return `class="${name}" opacity="0"`;
  };
  const on = (name, t, fade = 0.12) => {
    rule(name, `0%,${p(t)}{opacity:0}${p(t + fade)},100%{opacity:1}`);
    return `class="${name}"`;
  };
  // the stage dips to the ground between loops, so the film's cut-back is not a jump
  rule("dip", `0%{opacity:0}${p(0.3)},${p(PLAY)}{opacity:1}${p(PLAY + 0.35)},100%{opacity:0}`);

  const defs = [
    `<radialGradient id="glow" cx=".62" cy=".42" r=".7"><stop offset="0" stop-color="#0b2a6b" stop-opacity=".75"/><stop offset=".55" stop-color="#0a1a4a" stop-opacity=".3"/><stop offset="1" stop-color="${F.deep}" stop-opacity="0"/></radialGradient>`,
  ];
  let grid = "";
  for (let x = 26; x < 1300; x += 26) grid += `M${x} 0V360`;
  for (let y = 26; y < 360; y += 26) grid += `M0 ${y}H1300`;

  // ── Identity ───────────────────────────────────────────────────────────────
  const mark = readFileSync(`${root}/public/brands/gavigo-mark.svg`, "utf8").match(/<svg x="17"[^>]*>([\s\S]*?)<\/svg>/);
  if (!mark) throw new Error("gavigo card: could not find the artwork inside public/brands/gavigo-mark.svg");
  const identity = [
    `<svg x="40" y="30" width="46" height="36.5" viewBox="0 0 980 778">${mark[1]}</svg>`,
    glyphs.text(COPY.name, { font: "voiceBold", size: 25, x: 98, y: 57, fill: F.ink }),
    glyphs.text(COPY.line, { font: "ui", size: 12, x: 40, y: 88, fill: F.muted }),
    glyphs.text(COPY.hook[0], { font: "voice", size: 28, x: 40, y: 134, fill: F.ink }),
    glyphs.text(COPY.hook[1], { font: "voice", size: 28, x: 40, y: 168, fill: F.ink }),
    `<rect x="40" y="181" width="54" height="3" rx="1.5" fill="${F.accent}"/>`,
  ];
  const caption = (lines) => lines.map((l, i) => glyphs.text(l, { font: "voiceMid", size: 14.5, x: 40, y: 211 + i * 19, fill: F.body })).join("");
  const BACK_AT = LOG[2].until;
  identity.push(`<g ${span("cA", 0, BACK_AT - 0.15, 0.15)}>${caption(COPY.standby)}</g>`);
  identity.push(`<g ${on("cB", BACK_AT, 0.15)}>${caption(COPY.back)}</g>`);
  // the three cleared figures, their labels, and the boundary note with them
  identity.push(glyphs.text(COPY.kicker, { font: "mono", size: 8, x: 40, y: 262, fill: F.accent, tracking: 0.16 }));
  const cols = [40, 150, 330];
  COPY.proof.forEach(([value, label], i) => {
    identity.push(glyphs.text(value, { font: "voice", size: 20, x: cols[i], y: 288, fill: F.ink, fallback: "mono" }));
    identity.push(glyphs.text(label, { font: "ui", size: 7.6, x: cols[i], y: 302, fill: F.muted }));
  });
  COPY.boundary.forEach((l, i) => identity.push(glyphs.text(l, { font: "ui", size: 7.6, x: 40, y: 323 + i * 11, fill: F.muted, attrs: 'opacity=".8"' })));

  // ── The phone: the film's own picture, frame by frame ──────────────────────
  const PH = { x: 512, y: 16, w: 166, h: 328, r: 24 };
  const SC = { x: PH.x + 8, y: PH.y + 6, w: CUT.w, h: CUT.h };
  defs.push(`<clipPath id="scr"><rect x="${SC.x}" y="${SC.y}" width="${SC.w}" height="${SC.h}" rx="17"/></clipPath>`);
  // the strip stops on its last frame, so the hold after the cut shows a picture
  rule("film", `0%{transform:translateY(0);animation-timing-function:steps(${frames.length - 1},end)}${p(PLAY)},100%{transform:translateY(-${(frames.length - 1) * SC.h}px)}`);
  css.push(`.film{transform:translateY(-${(frames.length - 1) * SC.h}px)}`); // the still frame rests on the last picture, like the log
  const phone =
    `<rect x="${PH.x}" y="${PH.y}" width="${PH.w}" height="${PH.h}" rx="${PH.r}" fill="#05070f" stroke="#2a3350" stroke-width="2"/>` +
    `<g clip-path="url(#scr)"><g transform="translate(${SC.x} ${SC.y})"><g class="film">` +
    frames.map((b64, i) => `<image y="${i * SC.h}" width="${SC.w}" height="${SC.h}" href="data:image/jpeg;base64,${b64}"/>`).join("") +
    `</g></g></g>` +
    `<rect x="${PH.x + PH.w / 2 - 22}" y="${PH.y + 10}" width="44" height="9" rx="4.5" fill="#05070f"/>`;

  // ── The orchestration log, redrawn state for state ─────────────────────────
  const LG = { x: 704, y: 40, w: 572, h: 284 };
  const rowBox = (slot) => ({ x: LG.x + 18, y: LG.y + 64 + slot * 106, w: LG.w - 36, h: 92 });
  const dotX = (r, i) => r.x + 30 + (i * (r.w - 60)) / (STAGES.length - 1);
  const badge = (r, kind) => {
    const colour = kind === "HOT" ? D.hot : D.warm;
    const w = kind === "HOT" ? 44 : 54;
    return (
      `<rect x="${r.x + r.w - w - 12}" y="${r.y + 10}" width="${w}" height="18" rx="5" fill="${colour}" fill-opacity=".12" stroke="${colour}" stroke-opacity=".6"/>` +
      glyphs.text(kind, { font: "uiBold", size: 9, x: r.x + r.w - 12 - w / 2, y: r.y + 22.5, fill: colour, anchor: "middle", tracking: 0.04 })
    );
  };
  const row = (r, spec, arrive, at) => {
    const out = [
      `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="9" fill="${spec.now ? "#0b1830" : D.elevated}" fill-opacity="${spec.now ? 0.9 : 0.55}" stroke="${spec.now ? D.primary : D.success}" stroke-opacity="${spec.now ? 0.45 : 0.22}"/>`,
    ];
    let nx = r.x + 14;
    if (spec.now) {
      out.push(`<path d="M${nx} ${r.y + 13.5}l7 4.5-7 4.5z" fill="${D.primary}"/>`);
      nx += 14;
    }
    out.push(glyphs.text(spec.name, { font: "uiBold", size: 12.5, x: nx, y: r.y + 23, fill: spec.now ? D.primary : D.fg }));
    nx += glyphs.measure(spec.name, { font: "uiBold", size: 12.5 }) + 8;
    for (const [chip, colour] of [...(spec.now ? [["NOW", D.primary]] : []), ["K8s", D.success]]) {
      const w = glyphs.measure(chip, { font: "uiBold", size: 7.5 }) + 10;
      out.push(`<rect x="${nx.toFixed(1)}" y="${r.y + 12}" width="${w.toFixed(1)}" height="14" rx="7" fill="${colour}" fill-opacity=".14" stroke="${colour}" stroke-opacity=".5"/>`);
      out.push(glyphs.text(chip, { font: "uiBold", size: 7.5, x: nx + w / 2, y: r.y + 21.8, fill: colour, anchor: "middle" }));
      nx += w + 6;
    }
    out.push(badge(r, spec.badge));
    const cy = r.y + 48;
    if (spec.reattached) {
      out.push(`<circle cx="${r.x + 20}" cy="${cy - 1}" r="5" fill="none" stroke="${D.success}" stroke-width="1.3"/><path d="M${r.x + 17.6} ${cy - 1}l1.7 1.7 3.2-3.4" fill="none" stroke="${D.success}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`);
      out.push(glyphs.text("Iframe reattached — nothing rebuilt", { font: "uiMid", size: 11.5, x: r.x + 32, y: cy + 3, fill: D.success }));
    } else {
      STAGES.forEach(([label, colour], i) => {
        const x = dotX(r, i);
        const lit = i < spec.reached;
        // stages that light as the viewer arrives: Active, Running, Ready, one after another
        const late = arrive && i >= 4;
        const wrap = (s) => (late ? `<g ${on(`ar${i}`, at + (i - 4) * 0.17, 0.1)}>${s}</g>` : s);
        if (i) {
          out.push(`<path d="M${(dotX(r, i - 1) + 9).toFixed(1)} ${cy}H${(x - 9).toFixed(1)}" stroke="${D.gray700}" stroke-width="1.4"/>`);
          if (lit) out.push(wrap(`<path d="M${(dotX(r, i - 1) + 9).toFixed(1)} ${cy}H${(x - 9).toFixed(1)}" stroke="${colour}" stroke-width="1.4" stroke-opacity=".8"/>`));
        }
        const dot = (fill) => `<circle cx="${x.toFixed(1)}" cy="${cy}" r="6.5" fill="${fill}"/>`;
        const name = (font, fill) => glyphs.text(label, { font, size: 8.5, x, y: cy + 19, fill, anchor: "middle" });
        // an unlit stage is drawn only where it will be seen: never lit, or lit late
        if (!lit) out.push(dot(D.gray700) + name("ui", D.gray600));
        else if (late) out.push(`<g ${span(`un${i}`, 0, at + (i - 4) * 0.17, 0.1)}>${dot(D.gray700)}${name("ui", D.gray600)}</g>`);
        if (lit) out.push(wrap(dot(colour) + `<circle cx="${x.toFixed(1)}" cy="${cy}" r="2" fill="#fff" fill-opacity=".9"/>` + name("uiMid", colour)));
      });
    }
    let fx = r.x + 14;
    spec.foot.forEach((text, i) => {
      if (i) {
        out.push(`<path d="M${(fx + 2).toFixed(1)} ${r.y + r.h - 17}v9" stroke="${D.gray600}"/>`);
        fx += 10;
      }
      out.push(glyphs.text(text, { font: "ui", size: 8.5, x: fx, y: r.y + r.h - 9.5, fill: D.mutedFg, attrs: 'opacity=".75"' }));
      fx += glyphs.measure(text, { font: "ui", size: 8.5 }) + 8;
    });
    return out.join("");
  };
  const states = LOG.map((state, n) => {
    const from = n ? LOG[n - 1].until : 0;
    const lastState = n === LOG.length - 1;
    const body = state.rows
      .map((spec, slot) => {
        const r = rowBox(slot);
        if (slot && state.other) r.y += 14;
        return row(r, spec, state.arrive && slot === 0, from + 0.1);
      })
      .join("");
    const other = state.other ? glyphs.text("OTHER CONTAINERS (1)", { font: "uiBold", size: 7.5, x: LG.x + 18, y: LG.y + 64 + 92 + 16, fill: D.mutedFg, tracking: 0.08 }) : "";
    return `<g ${lastState ? on(`st${n}`, from) : span(`st${n}`, from, state.until - 0.12)}>${body}${other}</g>`;
  });
  const gamesW = glyphs.measure("2 games", { font: "uiBold", size: 10.5 }) + 18;
  const log =
    `<rect x="${LG.x}" y="${LG.y}" width="${LG.w}" height="${LG.h}" rx="14" fill="${D.surface}" fill-opacity=".86" stroke="#1c2233"/>` +
    `<path d="M${LG.x + 20} ${LG.y + 17}h8l3 3v10h-11z" fill="none" stroke="${D.mutedFg}" stroke-width="1.2" stroke-linejoin="round"/>` +
    glyphs.text("Container Orchestration Log", { font: "uiBold", size: 14, x: LG.x + 40, y: LG.y + 29, fill: D.fg }) +
    `<rect x="${LG.x + LG.w - 18 - gamesW}" y="${LG.y + 15}" width="${gamesW.toFixed(1)}" height="20" rx="6" fill="${D.overlay}"/>` +
    glyphs.text("2 games", { font: "uiBold", size: 10.5, x: LG.x + LG.w - 18 - gamesW / 2, y: LG.y + 29, fill: D.fg, anchor: "middle" }) +
    glyphs.text("2 controlled", { font: "uiMid", size: 9.5, x: LG.x + 20, y: LG.y + 52, fill: D.success }) +
    glyphs.text("(self-hosted, real K8s scaling)", { font: "ui", size: 9.5, x: LG.x + 24 + glyphs.measure("2 controlled", { font: "uiMid", size: 9.5 }), y: LG.y + 52, fill: D.mutedFg }) +
    states.join("");

  const body =
    `<rect width="1300" height="360" fill="${F.ground}"/><rect width="1300" height="360" fill="url(#glow)"/>` +
    `<path d="${grid}" stroke="#ffffff" stroke-opacity=".028" fill="none"/>` +
    identity.join("") +
    glyphs.text(COPY.disclosure, { font: "mono", size: 8.5, x: 1276, y: 26, fill: F.muted, anchor: "end" }) +
    `<g class="dip">${phone}${log}</g>`;

  return {
    svg: card({
      title: "GAVIGO IRE, the activation and execution layer for interactive software: it keeps the next game in a feed on standby and activates it as the viewer arrives. Product UI recreated in code; sequence shortened.",
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body,
      radius: 16,
    }),
    facts: { frames: frames.length, states: LOG.length, loop: `${T.toFixed(1)}s` },
  };
}
