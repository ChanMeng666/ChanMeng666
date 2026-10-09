// ArchCanvas card. ArchCanvas is an AI architectural designer — an agent — so
// the stage shows the agent at work, not a drawing: it drafts in passes, takes an
// edit in plain words, reviews its own plan in writing, renders it and exports
// it. Nothing on this card shows source code; to the person using ArchCanvas the
// language underneath is invisible.
//
// It is drawn in the product's own design system (the app tokens of its
// globals.css): warm ivory page, dot-lattice canvas, hairline cards, violet as a
// spot colour only, Space Grotesk for what a person wrote and Geist Mono for
// what the software computed.
//
// The panel says what the product is in one headline; everything else is the
// studio window. The session is the product's own studio demo, the one
// archcanvas.uk plays, cut to the beats that read at card size (the parameter
// slider is left out): same brief, same two plans, same edit command, same
// strings. Both plan frames are compiled here by the ArchLang compiler, the three
// findings are what lint() returns for the plan on the sheet, and the build
// fails if a frame stops compiling or the findings change.
//
// The demo's two plan sources are NOT in this repo. They are read from the
// product's own checkout beside it (ARCHCANVAS_INPUTS); where that checkout is
// absent the card is not rebuilt and the committed public/cards/archcanvas.svg
// stands. Only the rendering, which the product publishes, is kept here.
import { readFileSync } from "node:fs";
import { compile, describe, lint } from "@chanmeng666/archlang";

import { outlineTextElements } from "../lib/svg-card/glyphs.mjs";
import { extentOf, splitLayers } from "../lib/svg-card/plan.mjs";
import { card, pct } from "../lib/svg-card/shell.mjs";

export const ARCHCANVAS_FONTS = {
  sans: "scripts/cards/fonts/archcanvas/SpaceGrotesk-400.ttf",
  sansMid: "scripts/cards/fonts/archcanvas/SpaceGrotesk-500.ttf",
  sansBold: "scripts/cards/fonts/archcanvas/SpaceGrotesk-700.ttf",
  mono: "scripts/cards/fonts/archcanvas/GeistMono-400.ttf",
  monoMid: "scripts/cards/fonts/archcanvas/GeistMono-500.ttf",
};

// Read at build time from the sibling checkout; never copied into this repo.
export const ARCHCANVAS_INPUTS = {
  base: "../archcanvas/scripts/studio-demo/base.arch",
  edit: "../archcanvas/scripts/studio-demo/edit-after.arch",
};

// The studio's own colours.
const APP = { page: "#FBF8F2", ink: "#13110F", inkMuted: "#69645D", card: "#FFFDFA", hairline: "#E2DED5", muted: "#F3F0E9", primary: "#1C1A18", canvas: "#FAFAFA", dot: "#CECECE", inputBorder: "#8D8980" };
const SPOT = { plum: "#8052FF", action: "#6A3DF0" };
const BAND = { periwinkle: "#AB9FF2", mint: "#2EC08B" };

// ── The product's own demo script and strings ────────────────────────────────
// (archcanvas: scripts/generate-studio-demo.mjs and the studio replica's strings.ts)
const DEMO = {
  heading: "Your Projects",
  brief: "A narrow two-storey townhouse: hall, living and kitchen downstairs, two double bedrooms and a bathroom upstairs.",
  typology: "Residential",
  cta: "Design my plan",
  editCommand: "Widen the kitchen and move its door to the hall side.",
  lintProfile: "residential-basic",
};
// the drafting sheet's lines; the pass counter shows from pass 2 on
const DRAFTING = [
  ["Designing your plan…", null],
  ["Working through the layout…", null],
  ["Checking every route, door and clearance across 2 floors…", null],
  ["Fixing 3 issues across 2 floors — pass 2 of 4…", "pass 2/4"],
  ["Reviewing the drawing against your brief across 2 floors — pass 3 of 4…", "pass 3/4"],
  ["Saving your plan…", "pass 3/4"],
];
const HONESTY = "Sequence shortened — a design really takes two to three minutes.";
const HOST = "archcanvas.uk";

// compiler layers of the ground-floor page, and the beat each is drawn on
const BEAT = { "A-FLOR": 0, "A-WALL": 1, "A-FLOR-STRS": 1, "A-DOOR": 2, "A-GLAZ": 2, "A-FURN": 3, "A-ANNO-TEXT": 4, "A-ANNO-DIMS": 5 };

function wrap(glyphs, text, style, maxWidth) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && glyphs.measure(next, style) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
function clip(glyphs, text, style, maxWidth) {
  if (glyphs.measure(text, style) <= maxWidth) return text;
  let t = text;
  while (t.length && glyphs.measure(`${t}…`, style) > maxWidth) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

export function buildArchcanvasCard({ glyphs, root }) {
  const dir = `${root}/scripts/cards/assets/archcanvas`;
  const variants = [
    { id: "base", src: readFileSync(`${root}/${ARCHCANVAS_INPUTS.base}`, "utf8") },
    { id: "edit", src: readFileSync(`${root}/${ARCHCANVAS_INPUTS.edit}`, "utf8") },
  ];

  // ── Compile both frames: as drawn, then as edited ──────────────────────────
  const frames = variants.map((v) => {
    const res = compile(v.src);
    if (res.errors.length) throw new Error(`archcanvas card: variant ${v.id} does not compile: ${JSON.stringify(res.errors[0])}`);
    const page = res.pages.find((pg) => pg.level === 0); // the ground floor
    return { ...v, warnings: res.warnings, viewBox: page.svg.match(/viewBox="([^"]+)"/)[1], ...splitLayers(page.svg, "p") };
  });
  const [base, edited] = frames;
  if (edited.viewBox !== base.viewBox || edited.defs !== base.defs || edited.layers.length !== base.layers.length) {
    throw new Error("archcanvas card: the edit changed the sheet extents or layer list");
  }
  const findings = [...edited.warnings, ...lint(edited.src, { profile: DEMO.lintProfile })];
  if (findings.length !== 3) throw new Error(`archcanvas card: expected the demo's 3 findings, lint() returned ${findings.length}`);
  const lead = findings.find((f) => f.code === "W_PATH_TOO_NARROW");
  if (!lead) throw new Error("archcanvas card: the route finding is gone; pick the Review beat's lead finding again");
  const others = findings.filter((f) => f !== lead);
  const ground = (src) => describe(src).levels[0].rooms;
  const kitchenRoom = ground(base.src).find((r) => r.id === "r_kitchen");
  const kitchen = kitchenRoom.bbox;
  const powder = ground(edited.src).find((r) => r.id === "r_wc").bbox;
  const title = describe(base.src).plan;

  // ── Timeline (seconds, one continuous session) ─────────────────────────────
  const AT = { brief: 0, draw: 5.0, edit: 11.4, review: 16.6, render: 22.0, exp: 23.8, out: 28.2, gone: 28.7 };
  const T = 29.2;
  const EDIT_AT = AT.edit + 3.7; // the edited plan lands
  const p = (t) => pct(t, T, 3);
  const css = [];
  const made = new Set();
  const rule = (name, frames_) => {
    if (!made.has(name)) css.push(`@keyframes ${name}{${frames_}}.${name}{animation:${name} ${T}s linear infinite}`);
    made.add(name);
  };
  // shown from `t` on; part of the still frame
  const on = (name, t, fade = 0.3) => {
    rule(name, `0%,${p(t)}{opacity:0}${p(t + fade)},100%{opacity:1}`);
    return `class="${name}"`;
  };
  // shown only between `a` and `b`; absent from the still frame
  const span = (name, a, b, fade = 0.25) => {
    rule(name, a <= 0 ? `0%,${p(b)}{opacity:1}${p(b + fade)},100%{opacity:0}` : `0%,${p(a)}{opacity:0}${p(a + fade)},${p(b)}{opacity:1}${p(b + fade)},100%{opacity:0}`);
    return `class="${name}" opacity="0"`;
  };
  rule("all", `0%,${p(AT.out)}{opacity:1}${p(AT.gone)},100%{opacity:0}`);

  // Text that types itself: one cover per line slides off, a caret leading it.
  const typed = (name, lines, style, x, y, lh, t0, cps, bg) => {
    let t = t0;
    return lines
      .map((line, i) => {
        const w = glyphs.measure(line, style);
        const dur = line.length / cps;
        rule(`${name}${i}`, `0%,${p(t)}{transform:translateX(0);animation-timing-function:steps(${line.length},end)}${p(t + dur)},100%{transform:translateX(${(w + 6).toFixed(1)}px)}`);
        const out =
          glyphs.text(line, { ...style, x, y: y + i * lh }) +
          `<g class="${name}${i}"><rect x="${x - 1}" y="${y + i * lh - style.size}" width="${(w + 8).toFixed(1)}" height="${(style.size * 1.45).toFixed(1)}" fill="${bg}"/>` +
          `<rect ${span(`${name}k${i}`, t - 0.05, t + dur + (i === lines.length - 1 ? 0.5 : 0), 0.02)} x="${x}" y="${y + i * lh - style.size + 1.5}" width="1.5" height="${(style.size * 1.15).toFixed(1)}" fill="${SPOT.plum}"/></g>`;
        t += dur;
        return out;
      })
      .join("");
  };
  const typedSeconds = (lines, cps) => lines.reduce((n, l) => n + l.length / cps, 0);
  // a click: one ring that opens and goes
  const click = (name, t, x, y) => {
    rule(name, `0%,${p(t)}{opacity:0;transform:scale(.4)}${p(t + 0.02)}{opacity:.9;transform:scale(.4)}${p(t + 0.4)},100%{opacity:0;transform:scale(1)}`);
    return `<circle class="${name}" opacity="0" style="transform-box:fill-box;transform-origin:center" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15" fill="none" stroke="${SPOT.plum}" stroke-width="1.6"/>`;
  };

  // ── Identity: eyebrow, wordmark, one headline, where it lives ──────────────
  const lockup = readFileSync(`${root}/public/brands/archcanvas-wordmark-onlight.svg`, "utf8").match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1];
  const head = { font: "sansBold", size: 28, fill: APP.ink };
  const hostStyle = { font: "monoMid", size: 12.5 };
  const hostW = glyphs.measure(HOST, hostStyle) + 30;
  const identity = [
    glyphs.text("AI ARCHITECTURAL DESIGNER", { font: "monoMid", size: 11.5, x: 40, y: 52, fill: APP.inkMuted, tracking: 0.14 }),
    `<g transform="translate(24.4 72) scale(.31)">${lockup}</g>`,
    glyphs.text("Describe your home.", { ...head, x: 40, y: 190 }),
    glyphs.text("Get a dimensioned floor plan.", { ...head, x: 40, y: 226 }),
    `<rect x="40" y="290.5" width="${hostW.toFixed(1)}" height="32" rx="16" fill="none" stroke="${APP.inputBorder}" stroke-width="1.2"/>`,
    glyphs.text(HOST, { ...hostStyle, x: 55, y: 311, fill: APP.ink }),
  ];

  // ── The studio window ──────────────────────────────────────────────────────
  const W = { x: 468, y: 14, w: 816, h: 312, bar: 30 };
  if (40 + glyphs.measure("Get a dimensioned floor plan.", head) > W.x - 20) throw new Error("archcanvas card: the headline runs into the studio window");
  const cy = W.y + W.bar;
  const defs = [
    `<pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r=".8" fill="${APP.dot}"/></pattern>`,
    `<clipPath id="win"><rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="12"/></clipPath>`,
    base.defs,
  ];
  const crumb = { font: "sans", size: 12.5 };
  const chrome = [
    `<rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="12" fill="${APP.canvas}"/>`,
    `<rect x="${W.x}" y="${cy}" width="${W.w}" height="${W.h - W.bar}" fill="url(#dots)"/>`,
    `<rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.bar}" fill="${APP.card}"/>`,
    `<path d="M${W.x} ${cy}h${W.w}" stroke="${APP.hairline}"/>`,
    glyphs.text("Dashboard  /", { ...crumb, x: W.x + 18, y: W.y + 19.5, fill: APP.inkMuted }),
    `<g ${on("ttl", AT.draw + 0.5)}>${glyphs.text(title, { font: "sansMid", size: 12.5, x: W.x + 18 + glyphs.measure("Dashboard  /  ", crumb), y: W.y + 19.5, fill: APP.ink })}</g>`,
  ];
  let bx = W.x + W.w - 16;
  for (const label of ["Share", "Transcript"]) {
    const w = glyphs.measure(label, { font: "sans", size: 11 }) + 22;
    bx -= w;
    chrome.push(`<rect x="${bx.toFixed(1)}" y="${W.y + 5.5}" width="${w.toFixed(1)}" height="20" rx="10" fill="none" stroke="${APP.hairline}" stroke-width="1.1"/>`);
    chrome.push(glyphs.text(label, { font: "sans", size: 11, x: bx + w / 2, y: W.y + 19.3, fill: APP.ink, anchor: "middle" }));
    bx -= 6;
  }
  const R = { x: 756, y: 54, w: 510 }; // the canvas to the right of the artboard

  // ── Brief: the composer, before there is a plan ────────────────────────────
  const BC = { x: 596, y: 110, w: 560, h: 150 };
  const briefStyle = { font: "sans", size: 15, fill: APP.ink };
  const briefLines = wrap(glyphs, DEMO.brief, briefStyle, BC.w - 48);
  const ctaW = glyphs.measure(DEMO.cta, { font: "sansMid", size: 13 }) + 34;
  const typW = glyphs.measure(DEMO.typology, { font: "sans", size: 12 }) + 26;
  const briefDone = 0.6 + typedSeconds(briefLines, 36);
  const CTA = [BC.x + BC.w - 22 - ctaW / 2, BC.y + BC.h - 34];
  const composer =
    `<g ${span("bc", 0, AT.draw - 0.15)}>` +
    glyphs.text(DEMO.heading, { font: "sansBold", size: 19, x: BC.x, y: BC.y - 18, fill: APP.ink }) +
    `<rect x="${BC.x}" y="${BC.y}" width="${BC.w}" height="${BC.h}" rx="12" fill="${APP.card}" stroke="${APP.inputBorder}"/>` +
    `<clipPath id="bcc"><rect x="${BC.x + 2}" y="${BC.y + 2}" width="${BC.w - 4}" height="${BC.h - 4}"/></clipPath>` +
    `<g clip-path="url(#bcc)">${typed("tb", briefLines, briefStyle, BC.x + 24, BC.y + 38, 23, 0.6, 36, APP.card)}</g>` +
    `<rect x="${BC.x + 22}" y="${BC.y + BC.h - 48}" width="${typW.toFixed(1)}" height="28" rx="14" fill="none" stroke="${APP.hairline}" stroke-width="1.2"/>` +
    glyphs.text(DEMO.typology, { font: "sans", size: 12, x: BC.x + 35, y: BC.y + BC.h - 29.8, fill: APP.ink }) +
    `<rect x="${(BC.x + BC.w - 22 - ctaW).toFixed(1)}" y="${BC.y + BC.h - 50}" width="${ctaW.toFixed(1)}" height="32" rx="16" fill="${SPOT.action}"/>` +
    glyphs.text(DEMO.cta, { font: "sansMid", size: 13, x: CTA[0], y: BC.y + BC.h - 29.5, fill: "#FFFFFF", anchor: "middle" }) +
    "</g>";

  // ── The artboard: the plan, drawn in beats, then replanned ─────────────────
  const AB = { x: 488, y: 80, w: 252, h: 234 };
  const kept = base.layers.filter((l) => l.id in BEAT);
  const box = extentOf(kept.filter((l) => ["A-FLOR", "A-WALL", "A-ANNO-DIMS"].includes(l.id)));
  const pad = 7;
  const k = Math.min((AB.w - pad * 2) / box.w, (AB.h - pad * 2) / box.h);
  const tx = AB.x + (AB.w - box.w * k) / 2 - box.x * k;
  const ty = AB.y + (AB.h - box.h * k) / 2 - box.y * k;
  const at = (x, y) => [tx + x * k, ty + y * k]; // plan mm → card px

  // the replan cross-fades
  rule("f0", `0%,${p(EDIT_AT)}{opacity:1}${p(EDIT_AT + 0.4)},100%{opacity:0}`);
  rule("f1", `0%,${p(EDIT_AT)}{opacity:0}${p(EDIT_AT + 0.4)},100%{opacity:1}`);
  const frameAttr = (n) => `class="f${n}"${n === frames.length - 1 ? "" : ' opacity="0"'}`;
  const DRAW0 = AT.draw + 2.4;
  const plan = kept.map((layer) => {
    const li = base.layers.indexOf(layer);
    const sets = frames.map((f) => new Set(f.layers[li].elements));
    const shared = (el) => sets.every((set) => set.has(el));
    const fixed = layer.elements.filter(shared).join("");
    const moving = frames
      .map((f, n) => {
        const own = f.layers[li].elements.filter((el) => !shared(el)).join("");
        return own ? `<g ${frameAttr(n)}>${own}</g>` : "";
      })
      .join("");
    // the drawing's own labels are the machine voice
    return `<g ${on(`b${BEAT[layer.id]}`, DRAW0 + BEAT[layer.id] * 0.55, 0.4)}>${outlineTextElements(fixed + moving, glyphs, { regular: "mono", bold: "monoMid" })}</g>`;
  });

  // the room the Edit beat selects, and the pin the Review beat drops
  const [kx, ky] = at(kitchen.x, kitchen.y);
  const KIT = [kx + (kitchen.w * k) / 2, ky + (kitchen.h * k) / 2];
  const SEL_AT = AT.edit + 0.65;
  const select = `<rect ${span("sel", SEL_AT, EDIT_AT - 0.1)} x="${kx.toFixed(1)}" y="${ky.toFixed(1)}" width="${(kitchen.w * k).toFixed(1)}" height="${(kitchen.h * k).toFixed(1)}" fill="${SPOT.plum}" fill-opacity=".1" stroke="${SPOT.plum}" stroke-width="1.5"/>`;
  const [pinX, pinY] = at(powder.x + powder.w / 2, powder.y + powder.h / 2);

  // artboard toolbar: findings badge · storeys · version · Export
  const tb = AB.y - 26;
  const chip = (x, w, label, active) =>
    `<rect x="${x}" y="${tb}" width="${w}" height="20" rx="10" fill="${active ? BAND.periwinkle : APP.card}" fill-opacity="${active ? 0.38 : 1}" stroke="${active ? BAND.periwinkle : APP.hairline}" stroke-width="1.1"/>` +
    glyphs.text(label, { font: "mono", size: 10, x: x + w / 2, y: tb + 13.6, fill: APP.ink, anchor: "middle" });
  const flag = (x, y, s, colour) => `<path d="M${x} ${y + 9 * s}V${y}h${6.5 * s}l-1.6 ${2.4 * s} 1.6 ${2.4 * s}H${x}" fill="none" stroke="${colour}" stroke-width="${1.2 * s}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const ver = (n, a, b) => `<g ${b ? span(`v${n}`, a, b, 0.05) : on(`v${n}`, a, 0.05)}>${glyphs.text(`v${n}`, { font: n === 1 ? "mono" : "monoMid", size: 10.5, x: AB.x + 112, y: tb + 13.8, fill: n === 1 ? APP.inkMuted : SPOT.action })}</g>`;
  const EXP = { x: AB.x + AB.w - 62, w: 62 };
  const toolbar =
    `<g ${on("bdg", AT.review + 0.3)}>` +
    `<rect x="${AB.x}" y="${tb}" width="40" height="20" rx="10" fill="${BAND.periwinkle}" fill-opacity=".38" stroke="${BAND.periwinkle}" stroke-width="1.1"/>` +
    flag(AB.x + 10, tb + 5, 1.1, SPOT.action) +
    glyphs.text(String(findings.length), { font: "monoMid", size: 10.5, x: AB.x + 28, y: tb + 13.8, fill: SPOT.action, anchor: "middle" }) +
    "</g>" +
    chip(AB.x + 46, 28, "L0", true) +
    chip(AB.x + 77, 28, "L1", false) +
    ver(1, 0, EDIT_AT) +
    ver(2, EDIT_AT + 0.05) +
    `<rect x="${EXP.x}" y="${tb}" width="${EXP.w}" height="20" rx="10" fill="${APP.card}" stroke="${APP.hairline}" stroke-width="1.1"/>` +
    glyphs.text("Export", { font: "sans", size: 11, x: EXP.x + EXP.w / 2, y: tb + 13.8, fill: APP.ink, anchor: "middle" });

  const artboard =
    `<g ${on("ab", AT.draw + 0.2)}>` +
    `<rect x="${AB.x}" y="${AB.y}" width="${AB.w}" height="${AB.h}" fill="#FFFFFF" stroke="${APP.hairline}"/>` +
    toolbar +
    `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${k.toFixed(5)})">${plan.join("")}</g>` +
    select +
    `<g ${on("pin", AT.review + 0.5)}><circle cx="${pinX.toFixed(1)}" cy="${pinY.toFixed(1)}" r="9" fill="${BAND.periwinkle}" fill-opacity=".55" stroke="${SPOT.plum}" stroke-width="1.2"/>${flag(pinX - 3.1, pinY - 4.6, 1, SPOT.action)}</g>` +
    "</g>";

  // ── Draw: the agent's passes, in the product's own words ───────────────────
  const lineStyle = { font: "sans", size: 12.5, fill: APP.ink };
  const DL = { x: R.x, y: R.y, w: R.w, h: 38 + DRAFTING.length * 24 + 12 };
  const lineAt = (i) => AT.draw + 0.5 + i * 0.78;
  const log = DRAFTING.map(([line], i) => {
    if (glyphs.measure(line, lineStyle) > DL.w - 56) throw new Error(`archcanvas card: the drafting line "${line}" no longer fits its sheet`);
    const y = DL.y + 61 + i * 24;
    const done = i < DRAFTING.length - 1 ? lineAt(i + 1) : lineAt(i) + 0.8;
    return (
      `<g ${on(`dl${i}`, lineAt(i), 0.2)}>` +
      `<circle cx="${DL.x + 24}" cy="${y - 4.2}" r="6" fill="none" stroke="${APP.inputBorder}" stroke-width="1.1"/>` +
      `<g ${on(`dk${i}`, done, 0.15)}><circle cx="${DL.x + 24}" cy="${y - 4.2}" r="6.6" fill="${BAND.mint}"/>` +
      `<path d="M${DL.x + 20.8} ${y - 4.2}l2.3 2.3 4.1-4.5" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>` +
      glyphs.text(line, { ...lineStyle, x: DL.x + 42, y }) +
      "</g>"
    );
  });
  const passes = [...new Set(DRAFTING.map(([, pass]) => pass))].filter(Boolean).map((pass) => {
    const first = DRAFTING.findIndex(([, q]) => q === pass);
    const next = DRAFTING.findIndex(([, q], i) => i > first && q !== pass);
    const b = next < 0 ? AT.edit : lineAt(next);
    return `<g ${span(`ps${first}`, lineAt(first), b - 0.05, 0.05)}>${glyphs.text(pass, { font: "mono", size: 11, x: DL.x + DL.w - 18, y: DL.y + 24.5, fill: SPOT.action, anchor: "end" })}</g>`;
  });
  const drafting =
    `<g ${span("dr", AT.draw + 0.2, AT.edit - 0.35)}>` +
    `<rect x="${DL.x}" y="${DL.y}" width="${DL.w}" height="${DL.h}" rx="10" fill="${APP.card}" stroke="${APP.hairline}"/>` +
    glyphs.text("Drafting…", { font: "sansMid", size: 14, x: DL.x + 18, y: DL.y + 25, fill: APP.ink }) +
    passes.join("") +
    `<path d="M${DL.x} ${DL.y + 38.5}h${DL.w}" stroke="${APP.hairline}"/>` +
    log.join("") +
    glyphs.text(HONESTY, { font: "mono", size: 10, x: DL.x + 2, y: DL.y + DL.h + 19, fill: APP.inkMuted }) +
    "</g>";

  // ── The command bar: where the change is said ──────────────────────────────
  const IN = { x: R.x, y: 282, w: R.w, h: 32 };
  const cmdStyle = { font: "sans", size: 13, fill: APP.ink };
  const sayAt = AT.edit + 1.4;
  const CPS = 30;
  const said = sayAt + DEMO.editCommand.length / CPS;
  const cmdEnd = EDIT_AT + 0.4;
  const SEND = [IN.x + IN.w - 17, IN.y + 16];
  rule("ph", `0%,${p(SEL_AT + 0.1)}{opacity:1}${p(SEL_AT + 0.2)},${p(cmdEnd)}{opacity:0}${p(cmdEnd + 0.3)},100%{opacity:1}`);
  const command =
    `<g ${on("cmd", AT.draw + 0.2)}>` +
    `<rect x="${IN.x}" y="${IN.y}" width="${IN.w}" height="${IN.h}" rx="6" fill="${APP.card}" stroke="${APP.inputBorder}"/>` +
    `<g class="ph">${glyphs.text("Describe changes to your latest design…", { ...cmdStyle, fill: APP.inkMuted, x: IN.x + 14, y: IN.y + 20.5 })}</g>` +
    `<g ${span("ph2", SEL_AT + 0.2, sayAt - 0.1, 0.05)}>${glyphs.text(`Tell me what to do with ${kitchenRoom.label}…`, { ...cmdStyle, fill: APP.inkMuted, x: IN.x + 14, y: IN.y + 20.5 })}</g>` +
    `<clipPath id="cmc"><rect x="${IN.x + 2}" y="${IN.y + 2}" width="${IN.w - 36}" height="${IN.h - 4}"/></clipPath>` +
    `<g clip-path="url(#cmc)" ${span("say", sayAt - 0.05, cmdEnd, 0.1)}>${typed("tc", [DEMO.editCommand], cmdStyle, IN.x + 14, IN.y + 20.5, 0, sayAt, CPS, APP.card)}</g>` +
    `<circle cx="${SEND[0]}" cy="${SEND[1]}" r="10.5" fill="${APP.muted}"/>` +
    `<path d="M${SEND[0] - 4.5} ${SEND[1]}h9m-3.6-3.8 3.8 3.8-3.8 3.8" fill="none" stroke="${APP.ink}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>` +
    "</g>";

  // ── Review: the written list of what it could not get right ────────────────
  const RV = { x: R.x, y: R.y, w: 304 };
  const msgStyle = { font: "sans", size: 13, fill: APP.ink };
  const msgLines = wrap(glyphs, lead.message, msgStyle, RV.w - 36);
  const leadH = 36 + msgLines.length * 18 + 44;
  const fixW = glyphs.measure("Have AI fix", { font: "sansMid", size: 11.5 }) + 24;
  const disW = glyphs.measure("Dismiss", { font: "sans", size: 11.5 }) + 24;
  const rowStyle = { font: "sans", size: 11.5, fill: APP.ink };
  const rows = others.map((f, i) => {
    const y = RV.y + leadH + 8 + i * 34;
    return (
      `<g ${on(`rv${i + 1}`, AT.review + 1.0 + i * 0.35, 0.25)}>` +
      `<rect x="${RV.x}" y="${y}" width="${RV.w}" height="28" rx="7" fill="${APP.card}" stroke="${APP.hairline}"/>` +
      flag(RV.x + 14, y + 9, 1, APP.inkMuted) +
      glyphs.text(clip(glyphs, f.message, rowStyle, RV.w - 48), { ...rowStyle, x: RV.x + 34, y: y + 18.2 }) +
      "</g>"
    );
  });
  if (RV.y + leadH + 8 + others.length * 34 > IN.y) throw new Error("archcanvas card: the findings list runs into the command bar");
  const review =
    `<g ${on("rv", AT.review + 0.3)}>` +
    `<path d="M${(pinX + 9).toFixed(1)} ${pinY.toFixed(1)}L${RV.x} ${RV.y + leadH - 22}" fill="none" stroke="${SPOT.plum}" stroke-width="1.1" stroke-dasharray="4 3"/>` +
    `<rect x="${RV.x}" y="${RV.y}" width="${RV.w}" height="${leadH}" rx="8" fill="${APP.card}" stroke="${SPOT.plum}"/>` +
    glyphs.text("ADVISORY", { font: "mono", size: 10, x: RV.x + 18, y: RV.y + 23, fill: APP.inkMuted, tracking: 0.14 }) +
    glyphs.text(`1 of ${findings.length}`, { font: "mono", size: 10, x: RV.x + RV.w - 18, y: RV.y + 23, fill: APP.inkMuted, anchor: "end" }) +
    msgLines.map((l, i) => glyphs.text(l, { ...msgStyle, x: RV.x + 18, y: RV.y + 46 + i * 18 })).join("") +
    `<rect x="${RV.x + 18}" y="${RV.y + leadH - 36}" width="${fixW.toFixed(1)}" height="24" rx="12" fill="${BAND.periwinkle}" fill-opacity=".38"/>` +
    glyphs.text("Have AI fix", { font: "sansMid", size: 11.5, x: RV.x + 18 + fixW / 2, y: RV.y + leadH - 19.8, fill: SPOT.action, anchor: "middle" }) +
    `<rect x="${(RV.x + 25 + fixW).toFixed(1)}" y="${RV.y + leadH - 36}" width="${disW.toFixed(1)}" height="24" rx="12" fill="none" stroke="${APP.hairline}" stroke-width="1.1"/>` +
    glyphs.text("Dismiss", { font: "sans", size: 11.5, x: RV.x + 25 + fixW + disW / 2, y: RV.y + leadH - 19.8, fill: APP.ink, anchor: "middle" }) +
    rows.join("") +
    "</g>";

  // ── Render: the demo plan's own rendering, beside the list ─────────────────
  const RD = { x: RV.x + RV.w + 14, y: R.y, w: R.w - RV.w - 14 };
  RD.h = Math.round((RD.w * 2) / 3); // the rendering is 3:2
  defs.push(`<clipPath id="rd"><rect x="${RD.x}" y="${RD.y}" width="${RD.w}" height="${RD.h}" rx="8"/></clipPath>`);
  rule("rd", `0%,${p(AT.render + 0.2)}{opacity:0;transform:translateY(8px)}${p(AT.render + 0.65)},100%{opacity:1;transform:none}`);
  const pillW = glyphs.measure("AI-generated", { font: "mono", size: 9.5 }) + 16;
  const render =
    `<g class="rd"><image clip-path="url(#rd)" x="${RD.x}" y="${RD.y}" width="${RD.w}" height="${RD.h}" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${readFileSync(`${dir}/townhouse-exterior.jpg`).toString("base64")}"/>` +
    `<rect x="${RD.x + 0.5}" y="${RD.y + 0.5}" width="${RD.w - 1}" height="${RD.h - 1}" rx="7.5" fill="none" stroke="${APP.hairline}"/>` +
    `<rect x="${RD.x + 8}" y="${RD.y + RD.h - 27}" width="${pillW.toFixed(1)}" height="19" rx="9.5" fill="${APP.card}" fill-opacity=".92"/>` +
    `${glyphs.text("AI-generated", { font: "mono", size: 9.5, x: RD.x + 16, y: RD.y + RD.h - 14, fill: APP.ink })}</g>`;

  // ── Export: the menu under the artboard's Export button. It closes with the
  // session, so the still frame keeps the whole plan in view ─────────────────
  const groups = [["IMAGE", [["PNG", "Raster bitmap"], ["SVG", "Scalable vector"]]], ["CAD", [["DXF", "CAD layers + linetypes"], ["PDF", "Vector print"]]]];
  const MN = { w: 196, y: AB.y - 2 };
  MN.x = AB.x + AB.w - MN.w;
  let my = MN.y + 20;
  let dxfY = 0;
  const items = [];
  for (const [group, list] of groups) {
    items.push(glyphs.text(group, { font: "mono", size: 9.5, x: MN.x + 14, y: my, fill: APP.inkMuted, tracking: 0.12 }));
    my += 21;
    for (const [name, note] of list) {
      if (name === "DXF") dxfY = my;
      items.push(
        `<rect x="${MN.x + 14}" y="${my - 10}" width="9" height="11.5" rx="1.5" fill="none" stroke="${APP.inkMuted}"/>` +
          glyphs.text(name, { font: "sansMid", size: 11.5, x: MN.x + 32, y: my, fill: APP.ink }) +
          glyphs.text(note, { font: "sans", size: 10, x: MN.x + 64, y: my, fill: APP.inkMuted }),
      );
      my += 23;
    }
    my += 2;
  }
  MN.h = my - MN.y - 12;
  const OPEN = AT.exp + 0.5; // the click that opens the menu
  const PICK = AT.exp + 1.9; // the pointer reaches DXF
  const menu =
    `<g ${span("mn", OPEN, AT.out, 0.2)}>` +
    `<rect x="${MN.x + 1}" y="${MN.y + 3}" width="${MN.w}" height="${MN.h}" rx="8" fill="${APP.ink}" fill-opacity=".07"/>` +
    `<rect x="${MN.x}" y="${MN.y}" width="${MN.w}" height="${MN.h}" rx="8" fill="${APP.card}" stroke="${APP.hairline}"/>` +
    `<g ${on("hi", PICK, 0.15)}><rect x="${MN.x + 6}" y="${dxfY - 15.5}" width="${MN.w - 12}" height="23" rx="5" fill="${APP.muted}"/></g>` +
    items.join("") +
    "</g>";

  // ── The pointer: one path, walked through the session, ending on DXF ───────
  const DXF = [MN.x + 174, dxfY - 3];
  const EXPB = [EXP.x + EXP.w / 2 + 6, tb + 12];
  const CMD = [IN.x + 150, IN.y + 20];
  const from = ([x, y], dx, dy) => [x + dx, y + dy];
  const walk = [
    [0, from(CTA, -70, -46), 0],
    [briefDone, from(CTA, -70, -46), 0],
    [briefDone + 0.15, from(CTA, -70, -46), 1],
    [briefDone + 0.55, from(CTA, 4, 6), 1],
    [AT.draw - 0.35, from(CTA, 4, 6), 1],
    [AT.draw - 0.15, from(CTA, 4, 6), 0],
    [AT.edit + 0.05, from(KIT, 60, -50), 0],
    [AT.edit + 0.2, from(KIT, 60, -50), 1],
    [SEL_AT - 0.05, KIT, 1],
    [SEL_AT + 0.25, KIT, 1],
    [SEL_AT + 0.7, CMD, 1],
    [said + 0.05, CMD, 1],
    [said + 0.35, from(SEND, 2, 4), 1],
    [EDIT_AT + 0.6, from(SEND, 2, 4), 1],
    [EDIT_AT + 0.8, from(SEND, 2, 4), 0],
    [AT.exp, from(EXPB, 70, 60), 0],
    [AT.exp + 0.15, from(EXPB, 70, 60), 1],
    [OPEN - 0.05, EXPB, 1],
    [OPEN + 0.6, EXPB, 1],
    [PICK, DXF, 1],
    [T, DXF, 1],
  ];
  rule(
    "cur",
    walk
      .map(([t, [x, y], o]) => `${p(t)}{opacity:${o};transform:translate(${(x - DXF[0]).toFixed(1)}px,${(y - DXF[1]).toFixed(1)}px);animation-timing-function:cubic-bezier(.4,0,.2,1)}`)
      .join(""),
  );
  const pointer =
    click("k0", briefDone + 0.6, CTA[0] + 4, CTA[1] + 6) +
    click("k1", SEL_AT, KIT[0], KIT[1]) +
    click("k2", said + 0.4, SEND[0], SEND[1]) +
    click("k3", OPEN, EXPB[0], EXPB[1]) +
    `<g class="cur" opacity="0"><path transform="translate(${DXF[0].toFixed(1)} ${DXF[1].toFixed(1)})" d="M0 0v16.2l4.2-4 3 6.2 2.5-1.2-3-6.1 5.7-.5z" fill="${APP.ink}" stroke="#fff" stroke-width="1"/></g>`;

  // ── Progress: the session's chapters, each lit as the stage reaches it ─────
  const steps = [["Brief", AT.brief], ["Draw", AT.draw], ["Edit", AT.edit], ["Review", AT.review], ["Render", AT.render], ["Export", AT.exp]];
  const stepStyle = { font: "mono", size: 10.5 };
  let sx = W.x + 4;
  const progress = steps.map(([step, t], i) => {
    const x = sx;
    const draw = (bar, ink) => `<rect x="${x.toFixed(1)}" y="340.5" width="16" height="3" rx="1.5" fill="${bar}"/>${glyphs.text(step, { ...stepStyle, x: x + 22, y: 345.8, fill: ink })}`;
    sx += 22 + glyphs.measure(step, stepStyle) + 22;
    return draw(APP.hairline, APP.inkMuted) + (t > 0 ? `<g ${on(`st${i}`, t, 0.2)}>${draw(SPOT.plum, APP.ink)}</g>` : draw(SPOT.plum, APP.ink));
  });

  const body =
    `<rect width="1300" height="360" fill="${APP.page}"/>` +
    identity.join("") +
    `<g clip-path="url(#win)">${chrome.join("")}<g class="all">${composer}${artboard}${drafting}${command}${review}${render}${menu}${pointer}</g></g>` +
    `<rect x="${W.x + 0.5}" y="${W.y + 0.5}" width="${W.w - 1}" height="${W.h - 1}" rx="11.5" fill="none" stroke="${APP.hairline}"/>` +
    progress.join("");

  return {
    svg: card({
      title: "ArchCanvas, an AI architectural designer: describe your home and get a dimensioned floor plan. The studio takes a brief, drafts the plan in passes, moves a wall from an edit in plain words, lists what it could not get right, then renders and exports it.",
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body,
      radius: 16,
    }),
    facts: { plan: title, frames: frames.length, findings: findings.map((f) => f.code || "scale").join(","), loop: `${T}s` },
  };
}
