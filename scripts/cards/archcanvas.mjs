// ArchCanvas card. ArchCanvas is an AI architectural designer — an agent — so
// the stage shows the agent at work, not a drawing: it drafts in passes, checks
// its own plan, takes an edit in plain words, and ships with a written list of
// what it could not get right. Nothing on this card shows source code; to the
// person using ArchCanvas the language underneath is invisible.
//
// It is drawn in the product's own design system (the app tokens of its
// globals.css): warm ivory page, dot-lattice canvas, hairline cards, violet as a
// spot colour only, Space Grotesk for what a person wrote and Geist Mono for
// what the software computed.
//
// The session is the product's own studio demo, the one archcanvas.uk plays:
// same brief, same two plans, same edit command, same parameter, same strings
// (Brief → Draw → Edit → Tweak → Review → Render → Export). Every frame is
// compiled here by the ArchLang compiler, the three findings are what lint()
// returns for the final plan, and the build fails if a frame stops compiling or
// the findings change.
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
  brief: "A narrow two-storey townhouse: hall, living and kitchen downstairs, two double bedrooms and a bathroom upstairs.",
  typology: "Residential",
  cta: "Design my plan",
  editCommand: "Widen the kitchen and move its door to the hall side.",
  param: "HALL",
  from: 2400,
  to: 3000,
  step: 100,
  lintProfile: "residential-basic",
};
const DRAFTING = [
  ["Designing your plan…", "pass 1/4"],
  ["Working through the layout…", "pass 1/4"],
  ["Checking every route, door and clearance across 2 floors…", "pass 1/4"],
  ["Fixing 3 issues across 2 floors — pass 2 of 4…", "pass 2/4"],
  ["Reviewing the drawing against your brief across 2 floors — pass 3 of 4…", "pass 3/4"],
  ["Saving your plan…", "pass 3/4"],
];
const HONESTY = "Sequence shortened — a design really takes two to three minutes.";
const STEPS = [
  ["Brief", "Plain English in."],
  ["Draw", "Designing, checking and reviewing your plan."],
  ["Edit", "Select a room, say the change, watch the plan recompile."],
  ["Tweak", "Tweak a number."],
  ["Review", "Every room reachable. Every area exact."],
  ["Render", "Renderings grounded in the plan."],
  ["Export", "Export the DXF."],
];

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
  const baseSrc = readFileSync(`${root}/${ARCHCANVAS_INPUTS.base}`, "utf8");
  const editSrc = readFileSync(`${root}/${ARCHCANVAS_INPUTS.edit}`, "utf8");
  const LET = `let ${DEMO.param} = ${DEMO.from}`;
  if (!editSrc.includes(LET)) throw new Error(`archcanvas card: the demo plan no longer declares "${LET}"`);

  // ── Compile every frame: as drawn, as edited, then the parameter dragged ───
  const variants = [{ id: "base", src: baseSrc }, { id: "edit", src: editSrc, value: DEMO.from }];
  for (let v = DEMO.from + DEMO.step; v <= DEMO.to; v += DEMO.step) variants.push({ id: `t${v}`, src: editSrc.replace(LET, `let ${DEMO.param} = ${v}`), value: v });
  const frames = variants.map((v) => {
    const res = compile(v.src);
    if (res.errors.length) throw new Error(`archcanvas card: variant ${v.id} does not compile: ${JSON.stringify(res.errors[0])}`);
    const page = res.pages.find((pg) => pg.level === 0); // the ground floor
    return { ...v, viewBox: page.svg.match(/viewBox="([^"]+)"/)[1], ...splitLayers(page.svg, "p") };
  });
  const base = frames[0];
  const last = frames.length - 1;
  for (const f of frames) {
    if (f.viewBox !== base.viewBox || f.defs !== base.defs || f.layers.length !== base.layers.length) {
      throw new Error(`archcanvas card: variant ${f.id} changed the sheet extents or layer list`);
    }
  }
  const finalSrc = frames[last].src;
  const compiled = compile(finalSrc);
  const findings = [...compiled.warnings, ...lint(finalSrc, { profile: DEMO.lintProfile })];
  if (findings.length !== 3) throw new Error(`archcanvas card: expected the demo's 3 findings, lint() returned ${findings.length}`);
  const lead = findings.find((f) => f.code === "W_PATH_TOO_NARROW");
  if (!lead) throw new Error("archcanvas card: the route finding is gone; pick the Review beat's lead finding again");
  const others = findings.filter((f) => f !== lead);
  const ground = (src) => describe(src).levels[0].rooms;
  const kitchen = ground(baseSrc).find((r) => r.id === "r_kitchen").bbox;
  const powder = ground(finalSrc).find((r) => r.id === "r_wc").bbox;
  const title = describe(baseSrc).plan;

  // ── Timeline (seconds, one continuous session) ─────────────────────────────
  const AT = { brief: 0, draw: 5.0, edit: 12.6, tweak: 18.6, review: 23.4, render: 28.8, exp: 32.8, out: 37.8, gone: 38.3 };
  const T = 38.8;
  const EDIT_AT = AT.edit + 4.4; // the edited plan lands
  const DRAG_AT = AT.tweak + 1.2; // the slider starts moving
  const DRAG_STEP = 0.22;
  const SAVED_AT = AT.tweak + 3.3;
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

  // ── Identity ───────────────────────────────────────────────────────────────
  const lockup = readFileSync(`${root}/public/brands/archcanvas-wordmark-onlight.svg`, "utf8").match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1];
  const identity = [
    glyphs.text("AI ARCHITECTURAL DESIGNER", { font: "monoMid", size: 10.5, x: 40, y: 46, fill: APP.inkMuted, tracking: 0.14 }),
    `<g transform="translate(27 58) scale(.215)">${lockup}</g>`,
    glyphs.text("Describe your home.", { font: "sansBold", size: 28, x: 40, y: 146, fill: APP.ink }),
    glyphs.text("Get a dimensioned floor plan", { font: "sansBold", size: 28, x: 40, y: 180, fill: APP.ink }),
    // the second half of the product's own line, set apart: the written list
    `<rect x="40" y="196" width="2.5" height="40" fill="${SPOT.plum}"/>`,
    glyphs.text("and a written list of everything", { font: "sansMid", size: 16.5, x: 54, y: 211, fill: APP.ink }),
    glyphs.text("we couldn’t get right.", { font: "sansMid", size: 16.5, x: 54, y: 232, fill: APP.ink }),
  ];
  // the session's steps; the lit one follows the stage
  const starts = [AT.brief, AT.draw, AT.edit, AT.tweak, AT.review, AT.render, AT.exp];
  let px = 40;
  STEPS.forEach(([step, line], i) => {
    const a = starts[i];
    const lastStep = i === STEPS.length - 1;
    const w = glyphs.measure(step, { font: "sansMid", size: 12 }) + 20;
    const vis = lastStep ? on(`s${i}`, a, 0.2) : span(`s${i}`, a, starts[i + 1] - 0.2, 0.2);
    identity.push(`<rect x="${px.toFixed(1)}" y="296.5" width="${w.toFixed(1)}" height="26" rx="13" fill="none" stroke="${APP.hairline}" stroke-width="1.2"/>`);
    identity.push(
      `<g ${vis}><rect x="${px.toFixed(1)}" y="296.5" width="${w.toFixed(1)}" height="26" rx="13" fill="${BAND.periwinkle}" fill-opacity=".34" stroke="${BAND.periwinkle}" stroke-width="1.2"/>` +
        `${glyphs.text(line, { font: "sans", size: 13.5, x: 40, y: 278, fill: APP.inkMuted })}</g>`,
    );
    identity.push(glyphs.text(step, { font: "sansMid", size: 12, x: px + 10, y: 314, fill: APP.ink }));
    px += w + 6;
  });

  // ── The studio window ──────────────────────────────────────────────────────
  const W = { x: 492, y: 24, w: 784, h: 312, bar: 30 };
  const cy = W.y + W.bar;
  const defs = [
    `<pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r=".8" fill="${APP.dot}"/></pattern>`,
    `<clipPath id="win"><rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="12"/></clipPath>`,
    base.defs,
  ];
  const chrome = [
    `<rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="12" fill="${APP.canvas}"/>`,
    `<rect x="${W.x}" y="${cy}" width="${W.w}" height="${W.h - W.bar}" fill="url(#dots)"/>`,
    `<rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.bar}" fill="${APP.card}"/>`,
    `<path d="M${W.x} ${cy}h${W.w}" stroke="${APP.hairline}"/>`,
    glyphs.text("Dashboard  /", { font: "sans", size: 11, x: W.x + 16, y: W.y + 19.5, fill: APP.inkMuted }),
    `<g ${on("ttl", AT.draw + 0.5)}>${glyphs.text(title, { font: "sansMid", size: 11, x: W.x + 16 + glyphs.measure("Dashboard  /  ", { font: "sans", size: 11 }), y: W.y + 19.5, fill: APP.ink })}</g>`,
  ];
  let bx = W.x + W.w - 14;
  for (const label of ["Share", "Transcript"]) {
    const w = glyphs.measure(label, { font: "sans", size: 10 }) + 20;
    bx -= w;
    chrome.push(`<rect x="${bx.toFixed(1)}" y="${W.y + 6}" width="${w.toFixed(1)}" height="18" rx="9" fill="none" stroke="${APP.hairline}" stroke-width="1.1"/>`);
    chrome.push(glyphs.text(label, { font: "sans", size: 10, x: bx + w / 2, y: W.y + 18.5, fill: APP.ink, anchor: "middle" }));
    bx -= 6;
  }
  const R = { x: 786, w: 472 }; // the canvas to the right of the artboard

  // ── Brief: the composer, before there is a plan ────────────────────────────
  const BC = { x: 644, y: 104, w: 480, h: 132 };
  const briefStyle = { font: "sans", size: 13, fill: APP.ink };
  const briefLines = wrap(glyphs, DEMO.brief, briefStyle, BC.w - 40);
  const ctaW = glyphs.measure(DEMO.cta, { font: "sansMid", size: 11.5 }) + 28;
  const typW = glyphs.measure(DEMO.typology, { font: "sans", size: 10.5 }) + 22;
  const briefDone = 0.7 + typedSeconds(briefLines, 34);
  const composer =
    `<g ${span("bc", 0, AT.draw - 0.1)}>` +
    `<rect x="${BC.x}" y="${BC.y}" width="${BC.w}" height="${BC.h}" rx="10" fill="${APP.card}" stroke="${APP.inputBorder}"/>` +
    `<clipPath id="bcc"><rect x="${BC.x + 2}" y="${BC.y + 2}" width="${BC.w - 4}" height="${BC.h - 4}"/></clipPath>` +
    `<g clip-path="url(#bcc)">${typed("tb", briefLines, briefStyle, BC.x + 20, BC.y + 32, 20, 0.7, 34, APP.card)}</g>` +
    `<rect x="${BC.x + 20}" y="${BC.y + BC.h - 40}" width="${typW.toFixed(1)}" height="24" rx="12" fill="none" stroke="${APP.hairline}" stroke-width="1.2"/>` +
    glyphs.text(DEMO.typology, { font: "sans", size: 10.5, x: BC.x + 31, y: BC.y + BC.h - 24, fill: APP.ink }) +
    `<rect x="${(BC.x + BC.w - 20 - ctaW).toFixed(1)}" y="${BC.y + BC.h - 42}" width="${ctaW.toFixed(1)}" height="28" rx="14" fill="${SPOT.action}"/>` +
    glyphs.text(DEMO.cta, { font: "sansMid", size: 11.5, x: BC.x + BC.w - 20 - ctaW / 2, y: BC.y + BC.h - 23.5, fill: "#FFFFFF", anchor: "middle" }) +
    `<circle ${span("bcp", briefDone + 0.3, briefDone + 0.75, 0.1)} cx="${(BC.x + BC.w - 20 - ctaW / 2).toFixed(1)}" cy="${BC.y + BC.h - 28}" r="22" fill="none" stroke="${SPOT.plum}" stroke-width="1.5"/>` +
    "</g>";

  // ── The artboard: the plan, drawn in beats, replanned, then tweaked ────────
  const AB = { x: 524, y: 84, w: 236, h: 242 };
  const kept = base.layers.filter((l) => l.id in BEAT);
  const box = extentOf(kept.filter((l) => ["A-FLOR", "A-WALL", "A-ANNO-DIMS"].includes(l.id)));
  const pad = 8;
  const k = Math.min((AB.w - pad * 2) / box.w, (AB.h - pad * 2) / box.h);
  const tx = AB.x + (AB.w - box.w * k) / 2 - box.x * k;
  const ty = AB.y + (AB.h - box.h * k) / 2 - box.y * k;
  const at = (x, y) => [tx + x * k, ty + y * k]; // plan mm → card px

  // when each compiled frame is on the sheet
  const shows = frames.map((_, n) => (n === 0 ? [0, EDIT_AT] : n === 1 ? [EDIT_AT, DRAG_AT + DRAG_STEP] : [DRAG_AT + (n - 1) * DRAG_STEP, n === last ? T : DRAG_AT + n * DRAG_STEP]));
  frames.forEach((_, n) => {
    const [s, e] = shows[n];
    if (n === 0) rule("f0", `0%,${p(e)}{opacity:1}${p(e + 0.4)},100%{opacity:0}`); // the replan cross-fades
    else if (n === 1) rule("f1", `0%,${p(s)}{opacity:0}${p(s + 0.4)},${p(e - 0.004)}{opacity:1}${p(e)},100%{opacity:0}`);
    else rule(`f${n}`, `0%,${p(s - 0.004)}{opacity:0}${p(s)},${n === last ? "100%" : p(e - 0.004)}{opacity:1}${n === last ? "" : `${p(e)},100%{opacity:0}`}`);
  });
  const frameAttr = (n) => `class="f${n}"${n === last ? "" : ' opacity="0"'}`;
  const DRAW0 = AT.draw + 2.6;
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
    return `<g ${on(`b${BEAT[layer.id]}`, DRAW0 + BEAT[layer.id] * 0.72, 0.4)}>${outlineTextElements(fixed + moving, glyphs, { regular: "mono", bold: "monoMid" })}</g>`;
  });

  // the room the Edit beat selects, and the pin the Review beat drops
  const [kx, ky] = at(kitchen.x, kitchen.y);
  const select = `<rect ${span("sel", AT.edit + 0.5, EDIT_AT - 0.2)} x="${kx.toFixed(1)}" y="${ky.toFixed(1)}" width="${(kitchen.w * k).toFixed(1)}" height="${(kitchen.h * k).toFixed(1)}" fill="${SPOT.plum}" fill-opacity=".1" stroke="${SPOT.plum}" stroke-width="1.5"/>`;
  const [pinX, pinY] = at(powder.x + powder.w / 2, powder.y + powder.h / 2);

  // artboard toolbar: findings badge · storeys · version · Export
  const tb = AB.y - 22;
  const chip = (x, w, label, active) =>
    `<rect x="${x}" y="${tb}" width="${w}" height="17" rx="8.5" fill="${active ? BAND.periwinkle : APP.card}" fill-opacity="${active ? 0.38 : 1}" stroke="${active ? BAND.periwinkle : APP.hairline}" stroke-width="1.1"/>` +
    glyphs.text(label, { font: "mono", size: 8.5, x: x + w / 2, y: tb + 11.8, fill: APP.ink, anchor: "middle" });
  const flag = (x, y, s, colour) => `<path d="M${x} ${y + 9 * s}V${y}h${6.5 * s}l-1.6 ${2.4 * s} 1.6 ${2.4 * s}H${x}" fill="none" stroke="${colour}" stroke-width="${1.2 * s}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const ver = (n, a, b) => `<g ${b ? span(`v${n}`, a, b, 0.05) : on(`v${n}`, a, 0.05)}>${glyphs.text(`v${n}`, { font: n === 1 ? "mono" : "monoMid", size: 9, x: AB.x + 96, y: tb + 12, fill: n === 1 ? APP.inkMuted : SPOT.action })}</g>`;
  const toolbar =
    `<g ${on("bdg", AT.review + 0.3)}>` +
    `<rect x="${AB.x}" y="${tb}" width="34" height="17" rx="8.5" fill="${BAND.periwinkle}" fill-opacity=".38" stroke="${BAND.periwinkle}" stroke-width="1.1"/>` +
    flag(AB.x + 8, tb + 4, 1, SPOT.action) +
    glyphs.text(String(findings.length), { font: "monoMid", size: 9, x: AB.x + 24, y: tb + 12, fill: SPOT.action, anchor: "middle" }) +
    "</g>" +
    chip(AB.x + 40, 24, "L0", true) +
    chip(AB.x + 66, 24, "L1", false) +
    ver(1, 0, EDIT_AT) +
    ver(2, EDIT_AT + 0.05, SAVED_AT) +
    ver(3, SAVED_AT + 0.05) +
    `<rect x="${AB.x + AB.w - 54}" y="${tb}" width="54" height="17" rx="8.5" fill="${APP.card}" stroke="${APP.hairline}" stroke-width="1.1"/>` +
    glyphs.text("Export", { font: "sans", size: 9.5, x: AB.x + AB.w - 27, y: tb + 12, fill: APP.ink, anchor: "middle" });

  const artboard =
    `<g ${on("ab", AT.draw + 0.2)}>` +
    `<rect x="${AB.x}" y="${AB.y}" width="${AB.w}" height="${AB.h}" fill="#FFFFFF" stroke="${APP.hairline}"/>` +
    toolbar +
    `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${k.toFixed(5)})">${plan.join("")}</g>` +
    select +
    `<g ${on("pin", AT.review + 0.5)}><circle cx="${pinX.toFixed(1)}" cy="${pinY.toFixed(1)}" r="8" fill="${BAND.periwinkle}" fill-opacity=".55" stroke="${SPOT.plum}" stroke-width="1.2"/>${flag(pinX - 2.8, pinY - 4.2, 0.9, SPOT.action)}</g>` +
    "</g>";

  // ── Draw: the agent's passes, in the product's own words ───────────────────
  const DL = { x: R.x, y: 84, w: R.w, h: 158 };
  const lineAt = (i) => AT.draw + 0.5 + i * 1.02;
  const log = DRAFTING.map(([line], i) => {
    const y = DL.y + 50 + i * 19;
    const done = i < DRAFTING.length - 1 ? lineAt(i + 1) : lineAt(i) + 0.9;
    return (
      `<g ${on(`dl${i}`, lineAt(i), 0.2)}>` +
      `<circle cx="${DL.x + 22}" cy="${y - 3.6}" r="5" fill="none" stroke="${APP.inputBorder}" stroke-width="1.1"/>` +
      `<g ${on(`dk${i}`, done, 0.15)}><circle cx="${DL.x + 22}" cy="${y - 3.6}" r="5.6" fill="${BAND.mint}"/>` +
      `<path d="M${DL.x + 19.3} ${y - 3.6}l1.9 1.9 3.5-3.8" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></g>` +
      glyphs.text(line, { font: "sans", size: 10.8, x: DL.x + 36, y, fill: APP.ink }) +
      "</g>"
    );
  });
  const passes = [...new Set(DRAFTING.map(([, pass]) => pass))].map((pass) => {
    const first = DRAFTING.findIndex(([, q]) => q === pass);
    const next = DRAFTING.findIndex(([, q], i) => i > first && q !== pass);
    const a = first === 0 ? AT.draw : lineAt(first);
    const b = next < 0 ? AT.edit : lineAt(next);
    return `<g ${span(`ps${first}`, a, b - 0.05, 0.05)}>${glyphs.text(pass, { font: "mono", size: 9.5, x: DL.x + DL.w - 16, y: DL.y + 24, fill: SPOT.action, anchor: "end" })}</g>`;
  });
  const drafting =
    `<g ${span("dr", AT.draw + 0.2, AT.edit - 0.35)}>` +
    `<rect x="${DL.x}" y="${DL.y}" width="${DL.w}" height="${DL.h}" rx="8" fill="${APP.card}" stroke="${APP.hairline}"/>` +
    glyphs.text("Drafting…", { font: "sansMid", size: 12.5, x: DL.x + 16, y: DL.y + 24.5, fill: APP.ink }) +
    passes.join("") +
    `<path d="M${DL.x} ${DL.y + 36.5}h${DL.w}" stroke="${APP.hairline}"/>` +
    log.join("") +
    glyphs.text(HONESTY, { font: "mono", size: 8.5, x: DL.x + 2, y: DL.y + DL.h + 17, fill: APP.inkMuted }) +
    "</g>";

  // ── The command bar: where the change is said ──────────────────────────────
  const IN = { x: R.x, y: 298, w: R.w, h: 28 };
  const cmdStyle = { font: "sans", size: 11.5, fill: APP.ink };
  const sayAt = AT.edit + 1.5;
  const cmdEnd = EDIT_AT + 0.5;
  rule("ph", `0%,${p(AT.edit + 0.7)}{opacity:1}${p(AT.edit + 0.8)},${p(cmdEnd)}{opacity:0}${p(cmdEnd + 0.3)},100%{opacity:1}`);
  const command =
    `<g ${on("cmd", AT.draw + 0.2)}>` +
    `<rect x="${IN.x}" y="${IN.y}" width="${IN.w}" height="${IN.h}" rx="5" fill="${APP.card}" stroke="${APP.inputBorder}"/>` +
    `<g class="ph">${glyphs.text("Describe changes to your latest design…", { ...cmdStyle, fill: APP.inkMuted, x: IN.x + 12, y: IN.y + 18 })}</g>` +
    `<g ${span("ph2", AT.edit + 0.8, sayAt - 0.1, 0.05)}>${glyphs.text("Tell me what to do with Kitchen…", { ...cmdStyle, fill: APP.inkMuted, x: IN.x + 12, y: IN.y + 18 })}</g>` +
    `<clipPath id="cmc"><rect x="${IN.x + 2}" y="${IN.y + 2}" width="${IN.w - 32}" height="${IN.h - 4}"/></clipPath>` +
    `<g clip-path="url(#cmc)" ${span("say", sayAt - 0.05, cmdEnd, 0.1)}>${typed("tc", [DEMO.editCommand], cmdStyle, IN.x + 12, IN.y + 18, 0, sayAt, 24, APP.card)}</g>` +
    `<circle cx="${IN.x + IN.w - 15}" cy="${IN.y + 14}" r="9" fill="${APP.muted}"/>` +
    `<path d="M${IN.x + IN.w - 19} ${IN.y + 14}h8m-3.2-3.4 3.4 3.4-3.4 3.4" fill="none" stroke="${APP.ink}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>` +
    "</g>";

  // ── Tweak: one parameter, dragged ──────────────────────────────────────────
  const TW = { x: R.x, y: 84, w: 236, h: 112 };
  const track = { x: TW.x + 16, y: TW.y + 66, w: TW.w - 32 };
  const knob = (v) => track.x + ((v - 2000) / 1400) * track.w; // the slider runs 2000–3400 mm
  rule("kn", `0%,${p(DRAG_AT)}{transform:translateX(0)}${p(DRAG_AT + (last - 1) * DRAG_STEP)},100%{transform:translateX(${(knob(DEMO.to) - knob(DEMO.from)).toFixed(1)}px)}`);
  const values = frames.slice(1).map((f, i) => `<g ${frameAttr(i + 1)}>${glyphs.text(`${f.value} mm`, { font: "monoMid", size: 10.5, x: TW.x + TW.w - 16, y: TW.y + 52, fill: APP.ink, anchor: "end" })}</g>`);
  const tweaks =
    `<g ${span("tw", AT.tweak + 0.2, AT.review - 0.35)}>` +
    `<rect x="${TW.x}" y="${TW.y}" width="${TW.w}" height="${TW.h}" rx="8" fill="${APP.card}" stroke="${APP.hairline}"/>` +
    glyphs.text("Tweak parameters", { font: "sansMid", size: 12.5, x: TW.x + 16, y: TW.y + 24.5, fill: APP.ink }) +
    `<path d="M${TW.x} ${TW.y + 36.5}h${TW.w}" stroke="${APP.hairline}"/>` +
    glyphs.text(DEMO.param, { font: "mono", size: 10.5, x: TW.x + 16, y: TW.y + 52, fill: APP.inkMuted }) +
    values.join("") +
    `<rect x="${track.x}" y="${track.y - 1.5}" width="${track.w}" height="3" rx="1.5" fill="${APP.hairline}"/>` +
    `<g class="kn"><circle cx="${knob(DEMO.from).toFixed(1)}" cy="${track.y}" r="6.5" fill="${APP.card}" stroke="${SPOT.plum}" stroke-width="2"/></g>` +
    `<rect x="${TW.x + TW.w - 116}" y="${TW.y + 82}" width="46" height="20" rx="10" fill="none" stroke="${APP.hairline}" stroke-width="1.1"/>` +
    glyphs.text("Reset", { font: "sans", size: 10, x: TW.x + TW.w - 93, y: TW.y + 95.5, fill: APP.ink, anchor: "middle" }) +
    `<rect x="${TW.x + TW.w - 62}" y="${TW.y + 82}" width="46" height="20" rx="10" fill="${APP.primary}"/>` +
    glyphs.text("Save", { font: "sansMid", size: 10, x: TW.x + TW.w - 39, y: TW.y + 95.5, fill: "#FFFFFF", anchor: "middle" }) +
    `<g ${on("tst", SAVED_AT, 0.2)}><rect x="${TW.x}" y="${TW.y + TW.h + 12}" width="${TW.w}" height="28" rx="6" fill="${APP.primary}"/>` +
    `<circle cx="${TW.x + 16}" cy="${TW.y + TW.h + 26}" r="3.5" fill="${BAND.mint}"/>` +
    glyphs.text("Tweak saved — now the latest version", { font: "sans", size: 10.5, x: TW.x + 28, y: TW.y + TW.h + 30, fill: "#FFFFFF" }) +
    "</g></g>";

  // ── Review: the written list of what it could not get right ────────────────
  const RV = { x: R.x, y: 84, w: 330 };
  const msgStyle = { font: "sans", size: 12, fill: APP.ink };
  const msgLines = wrap(glyphs, lead.message, msgStyle, RV.w - 32);
  const leadH = 34 + msgLines.length * 16.5 + 38;
  const fixW = glyphs.measure("Have AI fix", { font: "sansMid", size: 10 }) + 20;
  const disW = glyphs.measure("Dismiss", { font: "sans", size: 10 }) + 20;
  const rowStyle = { font: "sans", size: 10.5, fill: APP.ink };
  const rows = others.map((f, i) => {
    const y = RV.y + leadH + 8 + i * 30;
    return (
      `<g ${on(`rv${i + 1}`, AT.review + 1.0 + i * 0.35, 0.25)}>` +
      `<rect x="${RV.x}" y="${y}" width="${RV.w}" height="24" rx="6" fill="${APP.card}" stroke="${APP.hairline}"/>` +
      flag(RV.x + 12, y + 7.5, 0.9, APP.inkMuted) +
      glyphs.text(clip(glyphs, f.message, rowStyle, RV.w - 44), { ...rowStyle, x: RV.x + 30, y: y + 15.8 }) +
      "</g>"
    );
  });
  const review =
    `<g ${span("rv", AT.review + 0.3, AT.render - 0.35)}>` +
    `<path d="M${(pinX + 8).toFixed(1)} ${pinY.toFixed(1)}L${RV.x} ${RV.y + leadH - 20}" fill="none" stroke="${SPOT.plum}" stroke-width="1.1" stroke-dasharray="4 3"/>` +
    `<rect x="${RV.x}" y="${RV.y}" width="${RV.w}" height="${leadH}" rx="6" fill="${APP.card}" stroke="${SPOT.plum}"/>` +
    glyphs.text("ADVISORY", { font: "mono", size: 8.5, x: RV.x + 16, y: RV.y + 21, fill: APP.inkMuted, tracking: 0.14 }) +
    glyphs.text(`1 of ${findings.length}`, { font: "mono", size: 8.5, x: RV.x + RV.w - 16, y: RV.y + 21, fill: APP.inkMuted, anchor: "end" }) +
    msgLines.map((l, i) => glyphs.text(l, { ...msgStyle, x: RV.x + 16, y: RV.y + 43 + i * 16.5 })).join("") +
    `<rect x="${RV.x + 16}" y="${RV.y + leadH - 32}" width="${fixW.toFixed(1)}" height="20" rx="10" fill="${BAND.periwinkle}" fill-opacity=".38"/>` +
    glyphs.text("Have AI fix", { font: "sansMid", size: 10, x: RV.x + 16 + fixW / 2, y: RV.y + leadH - 18.5, fill: SPOT.action, anchor: "middle" }) +
    `<rect x="${(RV.x + 22 + fixW).toFixed(1)}" y="${RV.y + leadH - 32}" width="${disW.toFixed(1)}" height="20" rx="10" fill="none" stroke="${APP.hairline}" stroke-width="1.1"/>` +
    glyphs.text("Dismiss", { font: "sans", size: 10, x: RV.x + 22 + fixW + disW / 2, y: RV.y + leadH - 18.5, fill: APP.ink, anchor: "middle" }) +
    rows.join("") +
    "</g>";

  // ── Render: the demo plan's own rendering ──────────────────────────────────
  const RD = { x: 934, y: 84, w: 252, h: 168 };
  defs.push(`<clipPath id="rd"><rect x="${RD.x}" y="${RD.y}" width="${RD.w}" height="${RD.h}" rx="8"/></clipPath>`);
  rule("rd", `0%,${p(AT.render + 0.2)}{opacity:0;transform:translateY(8px)}${p(AT.render + 0.7)},100%{opacity:1;transform:none}`);
  const pillW = glyphs.measure("AI-generated", { font: "mono", size: 8 }) + 14;
  const render =
    `<g class="rd"><image clip-path="url(#rd)" x="${RD.x}" y="${RD.y}" width="${RD.w}" height="${RD.h}" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${readFileSync(`${dir}/townhouse-exterior.jpg`).toString("base64")}"/>` +
    `<rect x="${RD.x + 0.5}" y="${RD.y + 0.5}" width="${RD.w - 1}" height="${RD.h - 1}" rx="7.5" fill="none" stroke="${APP.hairline}"/>` +
    `<rect x="${RD.x + 10}" y="${RD.y + RD.h - 26}" width="${pillW.toFixed(1)}" height="16" rx="8" fill="${APP.card}" fill-opacity=".92"/>` +
    `${glyphs.text("AI-generated", { font: "mono", size: 8, x: RD.x + 17, y: RD.y + RD.h - 14.8, fill: APP.ink })}</g>`;

  // ── Export: the menu under the artboard's Export button ────────────────────
  const MN = { x: AB.x + AB.w - 54, y: AB.y - 1, w: 176, h: 128 };
  const groups = [["IMAGE", [["PNG", "Raster bitmap"], ["SVG", "Scalable vector"]]], ["CAD", [["DXF", "CAD layers + linetypes"], ["PDF", "Vector print"]]]];
  let my = MN.y + 17;
  let dxfY = 0;
  const items = [];
  for (const [group, list] of groups) {
    items.push(glyphs.text(group, { font: "mono", size: 7.5, x: MN.x + 12, y: my, fill: APP.inkMuted, tracking: 0.12 }));
    my += 18;
    for (const [name, note] of list) {
      if (name === "DXF") dxfY = my;
      items.push(
        `<rect x="${MN.x + 12}" y="${my - 9}" width="8" height="10" rx="1.5" fill="none" stroke="${APP.inkMuted}"/>` +
          glyphs.text(name, { font: "sansMid", size: 10, x: MN.x + 28, y: my, fill: APP.ink }) +
          glyphs.text(note, { font: "sans", size: 8.5, x: MN.x + 56, y: my, fill: APP.inkMuted }),
      );
      my += 21;
    }
    my += 1;
  }
  const CUR = AT.exp + 1.6;
  rule("cur", `0%,${p(AT.exp + 0.5)}{opacity:0;transform:translate(60px,-70px)}${p(AT.exp + 0.7)}{opacity:1;transform:translate(60px,-70px);animation-timing-function:cubic-bezier(.4,0,.2,1)}${p(CUR)},100%{opacity:1;transform:none}`);
  const menu =
    `<g ${on("mn", AT.exp + 0.3, 0.2)}>` +
    `<rect x="${MN.x}" y="${MN.y}" width="${MN.w}" height="${MN.h}" rx="6" fill="${APP.card}" stroke="${APP.hairline}"/>` +
    `<g ${on("hi", CUR, 0.15)}><rect x="${MN.x + 5}" y="${dxfY - 14}" width="${MN.w - 10}" height="20" rx="4" fill="${APP.muted}"/></g>` +
    items.join("") +
    `<path class="cur" d="M${MN.x + 132} ${dxfY - 5}l0 13 3.4-3.2 2.4 5 2-1-2.4-4.9 4.6-.4z" fill="${APP.ink}" stroke="#fff" stroke-width=".8"/>` +
    "</g>";

  const body =
    `<rect width="1300" height="360" fill="${APP.page}"/>` +
    identity.join("") +
    `<g clip-path="url(#win)">${chrome.join("")}<g class="all">${composer}${artboard}${drafting}${command}${tweaks}${review}${render}${menu}</g></g>` +
    `<rect x="${W.x + 0.5}" y="${W.y + 0.5}" width="${W.w - 1}" height="${W.h - 1}" rx="11.5" fill="none" stroke="${APP.hairline}"/>`;

  return {
    svg: card({
      title: "ArchCanvas, an AI architectural designer: describe your home, get a dimensioned floor plan and a written list of everything it couldn’t get right. The studio drafts in passes, takes an edit in plain words, reviews its own plan, renders it and exports DXF.",
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body,
      radius: 16,
    }),
    facts: { plan: title, frames: frames.length, findings: findings.map((f) => f.code || "scale").join(","), loop: `${T}s` },
  };
}
