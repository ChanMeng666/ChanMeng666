// ArchLang card, drawn in ArchLang's own design system ("The Compile Boundary",
// archlang/brand/README.md): ONE LIGHT WORLD split by a solid plum seam. Left of
// it is the cool SOURCE world (identity + the editor), right of it the warm SHEET
// world (drafting paper + the compiled drawing). No dark surface, no pills.
// Amber is the playground's advisory colour and appears only on a lint finding;
// redline is not used because nothing here is an error.
//
// The stage is the playground at work: source is typed in the editor and the
// sheet answers. Five sheets, each a different thing the language does:
//   A-101, A-104  a line is typed and the layer that kind of statement draws arrives
//   A-106         each furniture line drops its own symbol onto the plan
//   one number    a constant is scrubbed and every frame is its own compile
//   lint          a finding is raised, one line is typed, the finding clears
//
// Nothing on the sheet is drawn by hand. Each plan is an example shipped inside
// the npm package (@chanmeng666/archlang/examples), compiled by the real compiler
// at build time; the build fails if one reports an error. The code is cut from
// that same file and keeps its line numbers. A symbol is tied to its line by
// compiling the plan without that line and taking the difference. The figures
// under the sheet are describe()'s totals and the finding is lint()'s own output.
import { readFileSync } from "node:fs";
import { compile, describe, lint } from "@chanmeng666/archlang";

import { outlineTextElements } from "../lib/svg-card/glyphs.mjs";
import { extentOf, splitLayers } from "../lib/svg-card/plan.mjs";
import { card, pct } from "../lib/svg-card/shell.mjs";

export const ARCHLANG_FONTS = {
  displayMid: "scripts/cards/fonts/archlang/Archivo-600.ttf",
  displayReg: "scripts/cards/fonts/archlang/Archivo-400.ttf",
  mono: "scripts/cards/fonts/archlang/IBMPlexMono-400.ttf",
  symbols: "cv/fonts/JetBrainsMono-Regular.ttf", // only for a glyph the others lack (φ on a diameter, the lint tick)
};

// no/tag   the sheet as archlang.uk names it (docs-site/.vitepress/theme/SheetGrid.vue);
//          the last two are not numbered sheets on the site and carry a tag only
// view     "fit": the drawing sits whole on the sheet · "y": it is as wide as the sheet and travels down it
// dims     keep the dimension layer
// steps    [first-line pattern, statement lines to take, compiler layers those lines draw]
// pieces   blocks of furniture lines; each line reveals the symbol it places
// scrub    one constant stepped through a range, a compile per value
// fix      the line held back, so that lint() has something to say until it is typed
const SCENES = [
  {
    no: "A-101", tag: "Showpiece", file: "hillside-villa", view: "fit",
    steps: [
      [/wall id=w_util partition/, 1, ["A-WALL"]],
      [/room id=r_office polygon/, 3, ["A-FLOR", "A-ANNO-TEXT"]],
      [/door id=d_garage garage/, 1, ["A-DOOR"]],
      [/window on shell at 11800/, 1, ["A-GLAZ"]],
      [/stair id=stair/, 1, ["A-FLOR-STRS"]],
      [/furniture piano/, 1, []],
      [/furniture car /, 1, ["A-FURN"]],
    ],
  },
  {
    no: "A-104", tag: "Geometry", file: "hexagon-pavilion", view: "fit", dims: true,
    steps: [
      [/wall id=drum/, 5, ["A-WALL"]],
      [/room id=rotunda circle/, 1, ["A-FLOR", "A-ANNO-TEXT"]],
      [/door id=d_main/, 1, ["A-DOOR"]],
      [/window id=win_n /, 1, ["A-GLAZ"]],
      [/furniture id=f_tea/, 1, ["A-FURN"]],
      [/dim diameter rotunda/, 1, ["A-ANNO-DIMS"]],
    ],
  },
  {
    no: "A-106", tag: "Fixtures", file: "furnished-flat", view: "y",
    pieces: [
      [/furniture sofa_l/, /furniture piano/, /furniture dining_table/, /furniture island/],
      [/furniture shower/, /furniture basin/, /furniture wc /, /furniture bathtub/],
    ],
  },
  {
    tag: "Change one number", file: "parametric", view: "fit", dims: true,
    scrub: { param: "H", from: 5000, to: 6000, step: 200 },
    excerpt: [[/^\s*let WALL/, 3], [/^\s*for i in/, 4]],
  },
  {
    tag: "Lint · soundness check", file: "laneway-house", view: "fit",
    fix: /window on w_garden at 5850/,
    excerpt: [[/^\s*strip down/, 4], [/window on w_west/, 2]],
  },
];

// Compiler layers a card draws. The schedule, legend, axis grid, title block,
// north arrow and scale bar belong to the issued sheet and cannot be read here.
const DRAWN = new Set(["A-FLOR", "L-SITE", "C-PROP", "A-FURN", "A-FLOR-STRS", "A-FLOR-EVTR", "A-WALL", "A-DOOR", "A-GLAZ", "L-PLNT", "A-ANNO-TEXT", "A-ANNO-DIMS"]);
const EXTENT = new Set(["A-FLOR", "L-SITE", "C-PROP", "A-WALL", "A-ANNO-DIMS"]);

// The Compile Boundary tokens (archlang/playground/src/styles/tokens.css).
const SRC = { bg: "#eceef2", surface: "#fbfbfc", fg: "#1a1d23", muted: "#5a616e", border: "rgba(0,0,0,.12)", rule: "#7f858f" };
const SHEET_T = { paper: "#f5f2ea", panel: "#fbfaf5", ink: "#1c2430", muted: "#5b6470", hairline: "#cfc9bb", grid: "rgba(28,36,48,.07)" };
const PLUM = "#8052ff"; // graphics only
const PLUM_DEEP = "#6b3ae0"; // plum as text
const PLUM_LIGHT_SURFACE = "#6a3df0"; // the mark on a light ground
const OK = "#2e7d32";
const WARN = "#7a6000"; // advisory amber: the playground's lint row
const SYN = { keyword: "#6b3ae0", property: "#14602a", atom: "#0b57d0", number: "#0f6f7a", string: "#8a5a00", comment: "#5a616e", operator: "#464d59", name: SRC.fg };
const PROPERTIES = new Set(["at", "size", "label", "width", "thickness", "offset", "close", "x", "in", "on", "rotate", "radius", "against", "as", "mirror", "uses", "circle", "polygon", "arc", "material", "scale", "angle", "street", "hemisphere", "dir", "wall", "hinge", "swing", "slide", "gap", "into", "diameter"]);
const ATOMS = new Set(["exterior", "partition", "north", "south", "east", "west", "landscape", "portrait", "auto", "all", "rooms", "concrete", "brick", "insulation", "tile", "none", "up", "down", "left", "right", "garage", "sliding", "pocket", "bath", "bedroom", "office", "hall"]);

function tokenize(line) {
  const out = [];
  let col = 0;
  let first = true;
  for (const [text] of line.matchAll(/\s+|"[^"]*"|#.*$|\d+(?:\.\d+)?%?|[A-Za-z_]\w*|./g)) {
    if (text.trim()) {
      let kind = "operator";
      if (text[0] === "#") kind = "comment";
      else if (text[0] === '"') kind = "string";
      else if (/^\d/.test(text)) kind = "number";
      else if (/^[A-Za-z_]/.test(text)) kind = first ? "keyword" : PROPERTIES.has(text) ? "property" : ATOMS.has(text) ? "atom" : "name";
      out.push({ text, col, kind });
      first = false;
    }
    col += text.length;
  }
  return out;
}

// Statement lines of the source starting at the first match of `pattern`, each
// with its line number in the file. Blank and comment-only lines are skipped.
function linesAt(all, pattern, count, file) {
  const at = all.findIndex((l) => !l.trim().startsWith("#") && pattern.test(l.replace(/ {2,}/g, " "))); // the files align their columns
  if (at < 0) throw new Error(`archlang card: ${file}.arch no longer has a line matching ${pattern}`);
  const out = [];
  for (let i = at; i < all.length && out.length < count; i++) {
    if (all[i].trim() && !all[i].trim().startsWith("#")) out.push({ no: i + 1, raw: all[i] });
  }
  return out;
}

// The lines as the editor shows them: the excerpt's common indent removed, runs
// of alignment spaces closed up, and (unless kept) trailing comments dropped.
function display(lines, keepComments) {
  const code = lines.map((l) => (keepComments ? l.raw : l.raw.replace(/\s+#.*$/, "")).replace(/\s+$/, ""));
  const indent = Math.min(...code.map((l) => l.match(/^\s*/)[0].length));
  return lines.map((l, i) => {
    const own = code[i].slice(indent);
    const lead = own.match(/^\s*/)[0];
    return { ...l, text: lead + own.slice(lead.length).replace(/ {2,}/g, " ") };
  });
}

const without = (all, no) => all.filter((_, i) => i + 1 !== no).join("\n");

function compiled(source, what) {
  const res = compile(source);
  if (res.errors.length) throw new Error(`archlang card: ${what} does not compile: ${JSON.stringify(res.errors[0])}`);
  return res.svg;
}

// Elements of `full` that `part` does not have, as a multiset difference.
function added(full, part) {
  const left = new Map();
  for (const el of part) left.set(el, (left.get(el) || 0) + 1);
  return full.filter((el) => {
    const n = left.get(el) || 0;
    if (n) left.set(el, n - 1);
    return !n;
  });
}

// A group of compiler elements, re-encoded without touching the geometry: a
// paint attribute every element carries is written once on the group with its
// commonest value, neighbours painted alike share a wrapper, a run of bare
// <line>s becomes one path, and path data loses its optional spaces.
const PAINT = / (?:fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|stroke-dasharray|fill-opacity|stroke-opacity|opacity)="[^"]*"/g;
const LINE = /^<line x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)"\/>$/;
function group(attrs, elements) {
  let own = "";
  let els = elements;
  for (const name of ["fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin"]) {
    const re = new RegExp(` ${name}="([^"]*)"`);
    const values = els.map((el) => (el.match(re) || [])[1]);
    if (!els.length || values.includes(undefined)) continue;
    const tally = new Map();
    for (const v of values) tally.set(v, (tally.get(v) || 0) + 1);
    const [top] = [...tally].sort((a, b) => b[1] - a[1])[0];
    own += ` ${name}="${top}"`;
    els = els.map((el, n) => (values[n] === top ? el.replace(re, "") : el));
  }
  const paint = (el) => (el.match(PAINT) || []).join("");
  let body = "";
  for (let i = 0, j; i < els.length; i = j) {
    const sig = paint(els[i]);
    for (j = i + 1; j < els.length && paint(els[j]) === sig; j++);
    const shared = sig && j - i > 1;
    const run = shared ? els.slice(i, j).map((el) => el.replace(PAINT, "")) : els.slice(i, j);
    let out = "";
    for (let a = 0, b; a < run.length; a = b) {
      for (b = a; b < run.length && LINE.test(run[b]); b++);
      if (b - a < 2) {
        b = a + 1;
        out += run[a];
        continue;
      }
      const d = run.slice(a, b).map((el) => el.match(LINE)).map(([, x1, y1, x2, y2]) => `M${x1} ${y1}${y1 === y2 ? `H${x2}` : x1 === x2 ? `V${y2}` : `L${x2} ${y2}`}`);
      out += `<path fill="none" d="${d.join("")}"/>`;
    }
    body += shared ? `<g${sig}>${out}</g>` : out;
  }
  body = body.replace(/ d="([^"]+)"/g, (_, d) => ` d="${d.replace(/\s*([A-Za-z])\s*/g, "$1")}"`);
  return `<g${attrs ? ` ${attrs}` : ""}${own}>${body}</g>`;
}

export function buildArchlangCard({ glyphs, root }) {
  const examples = `${root}/node_modules/@chanmeng666/archlang/examples`;

  // ── Timeline ───────────────────────────────────────────────────────────────
  const D = 6; // seconds a scene holds the stage
  const T = D * SCENES.length;
  const p = (t) => pct(t, T, 3);
  const IN = 0.35;
  const OUT = D - 0.45;
  // one rule per distinct animation, however many elements share it
  const rules = new Map();
  const rule = (frames, base = "") => {
    const key = `${base}|${frames}`;
    if (!rules.has(key)) rules.set(key, { name: `k${rules.size.toString(36)}`, frames, base });
    return rules.get(key).name;
  };
  // shown from t onward
  const on = (t, fade = 0.3) => `class="${rule(`0%,${p(t)}{opacity:0}${p(t + fade)},100%{opacity:1}`)}"`;
  // shown only between a and b
  const span = (a, b, fadeIn = 0.3, fadeOut = 0.3) => `class="${rule(`0%,${p(a)}{opacity:0}${p(a + fadeIn)},${p(b)}{opacity:1}${p(b + fadeOut)},100%{opacity:0}`)}" opacity="0"`;
  // shown only between a and b, cut hard: a frame of a compile, not a fade
  const cut = (a, b) => `class="${rule(`0%{opacity:0;animation-timing-function:step-end}${p(a)}{opacity:1;animation-timing-function:step-end}${p(b)},100%{opacity:0}`)}"`;

  // ── Layout ─────────────────────────────────────────────────────────────────
  const SEAM = 800;
  const E = { x: 436, y: 24, w: 352, h: 312, head: 30 };
  const SHEET = { x: SEAM, y: 0, w: 1300 - SEAM, h: 360, foot: 32, margin: 16 };
  const footY = SHEET.h - SHEET.foot;
  const SIZE = 10;
  const ADV = (glyphs.font("mono").charToGlyph("0").advanceWidth / glyphs.font("mono").unitsPerEm) * SIZE;
  const COL = Number((SIZE / (glyphs.font("mono").unitsPerEm * ADV)).toFixed(7)); // font units → columns
  const LH = 19;
  const codeX = E.x + 42;
  const codeTop = E.y + E.head + 50;
  const codeW = E.x + E.w - codeX;
  const FIT = Math.floor((codeW - 8) / ADV); // characters a row shows before the pane's edge
  // Code is most of the card's text. GlyphSet places a glyph in font units; the
  // face is monospaced, so each glyph is aliased once at one-column scale and a
  // character costs `<use href="#m4" x="12"/>`.
  const alias = new Map();
  const mono = (text, x, y, fill) => {
    let uses = "";
    [...text].forEach((ch, col) => {
      if (ch === " ") return;
      if (!alias.has(ch)) alias.set(ch, { id: `m${alias.size.toString(36)}`, glyph: glyphs.text(ch, { font: "mono", size: SIZE }).match(/href="#([^"]+)"/)[1] });
      uses += `<use href="#${alias.get(ch).id}"${col ? ` x="${col}"` : ""}/>`;
    });
    return `<g fill="${fill}" transform="translate(${Number(x.toFixed(2))} ${y}) scale(${ADV})">${uses}</g>`;
  };
  const outline = (body) => outlineTextElements(body, glyphs, { regular: "displayReg", bold: "displayMid", fallback: "symbols" });

  // Lines typed one after another between `from` and `to`, each for a time in
  // proportion to its length. → [{ at, dur }]
  const schedule = (lines, from, to) => {
    const PAUSE = 10; // the breath between lines, in characters
    const total = lines.reduce((a, l) => a + l.text.length + PAUSE, 0);
    let t = from;
    return lines.map((l) => {
      const slot = { at: t, dur: ((to - from) * l.text.length) / total };
      t += ((to - from) * (l.text.length + PAUSE)) / total;
      return slot;
    });
  };

  // One row of the editor. `typed` = { at, dur }: a cover the colour of the page
  // steps off the row a character at a time.
  const row = (line, n, typed, swap) => {
    const y = codeTop + n * LH;
    const out = [];
    const number = mono(String(line.no), codeX - 12 - String(line.no).length * ADV, y, "#9aa1ad");
    out.push(typed ? `<g ${on(typed.at, 0.1)}>${number}</g>` : number);
    // one run per colour: the face is monospaced, so a blank holds a column
    const runs = new Map();
    for (const tok of tokenize(line.text)) {
      if (tok.col > FIT) continue; // past the pane's edge
      if (swap && tok.col === swap.col) out.push(swap.svg(codeX + tok.col * ADV, y));
      else runs.set(tok.kind, (runs.get(tok.kind) || "").padEnd(tok.col) + tok.text);
    }
    for (const [kind, text] of runs) out.push(mono(text, codeX, y, SYN[kind]));
    if (typed) {
      const chars = Math.min(line.text.length, FIT + 2);
      const w = (chars * ADV).toFixed(1);
      const name = rule(`0%,${p(typed.at)}{transform:translateX(0);animation-timing-function:steps(${chars},end)}${p(typed.at + typed.dur)},100%{transform:translateX(${w}px)}`, `transform:translateX(${w}px);`);
      out.push(`<rect class="${name}" x="${(codeX - 1).toFixed(1)}" y="${y - 13}" width="${codeW}" height="${LH}" fill="${SRC.surface}"/>`);
    }
    return out.join("");
  };

  // The caret: one bar that steps along each typed row in turn.
  const caret = (rows) => {
    const typed = rows.filter((r) => r.typed);
    if (!typed.length) return "";
    const stops = typed.map(({ n, line, typed: t }) => {
      const chars = Math.min(line.text.length, FIT + 2);
      const y = n * LH;
      return `${p(t.at)}{transform:translate(0,${y}px);animation-timing-function:steps(${chars},end)}${p(t.at + t.dur)}{transform:translate(${(chars * ADV).toFixed(1)}px,${y}px);animation-timing-function:step-end}`;
    });
    const last = typed[typed.length - 1];
    const name = rule(`0%{transform:translate(0,0);animation-timing-function:step-end}${stops.join("")}100%{transform:translate(0,${last.n * LH}px)}`);
    return `<g ${cut(typed[0].typed.at, last.typed.at + last.typed.dur + 0.5)} opacity="0"><rect class="${name}" x="${codeX}" y="${codeTop - 11}" width="1.5" height="14" fill="${SRC.fg}"/></g>`;
  };

  // Where a drawing sits on the sheet, and how far it travels.
  const place = (view, box) => {
    const m = SHEET.margin;
    const availW = SHEET.w - m * 2;
    const availH = footY - m * 2;
    let k, tx, ty, dy = 0;
    if (view === "y") {
      k = availW / box.w;
      tx = SHEET.x + m;
      ty = SHEET.y + m;
      dy = -Math.max(0, box.h * k - availH);
    } else {
      k = Math.min(availW / box.w, availH / box.h);
      tx = SHEET.x + m + (availW - box.w * k) / 2;
      ty = SHEET.y + m + (availH - box.h * k) / 2;
    }
    return { k, dy, transform: `translate(${(tx - box.x * k).toFixed(2)} ${(ty - box.y * k).toFixed(2)}) scale(${k.toFixed(5)})` };
  };

  // The playground's plan-facts strip (playground/src/facts-strip.ts): describe()'s totals.
  const FACTS = [["Rooms", "rooms", 84], ["Doors", "doors", 84], ["Windows", "windows", 98], ["Floor area", "floor_area_m2", 0]];
  const factsStrip = (values) => {
    const out = [];
    let x = SHEET.x + 18;
    FACTS.forEach(([label, key, w], n) => {
      if (n) out.push(`<path d="M${x - 12} ${footY + 9}v15" stroke="${SHEET_T.hairline}"/>`);
      out.push(glyphs.text(label.toUpperCase(), { font: "displayMid", size: 9, x, y: footY + 20, fill: SHEET_T.muted, tracking: 0.08 }));
      const vx = x + glyphs.measure(label.toUpperCase(), { font: "displayMid", size: 9, tracking: 0.08 }) + 7;
      out.push(values(key, (v) => glyphs.text(key === "floor_area_m2" ? `${v} m²` : String(v), { font: "mono", size: 10.5, x: vx, y: footY + 20, fill: SHEET_T.ink })));
      x += w;
    });
    return out.join("");
  };

  const defs = [
    `<clipPath id="ed"><rect x="${E.x + 1}" y="${E.y + E.head + 1}" width="${E.w - 2}" height="${E.h - E.head - 2}"/></clipPath>`,
    `<clipPath id="sheet"><rect x="${SHEET.x}" y="${SHEET.y}" width="${SHEET.w}" height="${footY}"/></clipPath>`,
    // long statements run off the pane; they fade out rather than stop dead
    `<linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="${SRC.surface}" stop-opacity="0"/><stop offset="1" stop-color="${SRC.surface}"/></linearGradient>`,
  ];

  const sheets = [];
  const panes = [];
  const summary = [];
  SCENES.forEach((scene, i) => {
    const S = i * D; // every time below is on the loop's own clock
    const all = readFileSync(`${examples}/${scene.file}.arch`, "utf8").split("\n");
    const source = all.join("\n");
    const what = `${scene.file}.arch`;
    const kept = (svg) => splitLayers(svg, `s${i}`).layers.filter((l) => DRAWN.has(l.id) && (l.id !== "A-ANNO-DIMS" || scene.dims));
    const whole = compiled(source, what);
    const final = kept(whole);
    const totals = describe(source).totals;
    defs.push(splitLayers(whole, `s${i}`).defs);

    let rows; // [{ line, n, typed }]
    let drawing; // the layers, in the compiler's order
    let box = extentOf(final.filter((l) => EXTENT.has(l.id)));
    let facts = (key, draw) => `<g ${on(S + 3.9)}>${draw(totals[key])}</g>`;
    let move = null; // [start, end] of the drawing's travel down the sheet
    const extra = { pane: "", room: null };

    if (scene.steps) {
      // ── a statement is typed; the layer that kind of statement draws arrives ──
      const groups = scene.steps.map(([pattern, count, layers]) => ({ lines: linesAt(all, pattern, count, scene.file), layers }));
      const lines = display(groups.flatMap((g) => g.lines));
      const slots = schedule(lines, S + 0.45, S + 3.75);
      rows = lines.map((line, n) => ({ line, n, typed: slots[n] }));
      const arrives = new Map();
      let n = 0;
      for (const g of groups) {
        n += g.lines.length;
        for (const id of g.layers) arrives.set(id, slots[n - 1].at + slots[n - 1].dur);
      }
      const unclaimed = final.filter((l) => !arrives.has(l.id)).map((l) => l.id);
      if (unclaimed.length) throw new Error(`archlang card: ${what} draws ${unclaimed.join(", ")} and no typed line accounts for it`);
      drawing = final.map((l) => outline(group(on(arrives.get(l.id), 0.35), l.elements))).join("");
    } else if (scene.pieces) {
      // ── each furniture line drops the symbol it places ──────────────────────
      const blocks = scene.pieces.map((block) => display(block.map((pattern) => linesAt(all, pattern, 1, scene.file)[0])));
      const slots = [...schedule(blocks[0], S + 0.45, S + 2.05), ...schedule(blocks[1], S + 3.0, S + 4.6)];
      rows = blocks.flat().map((line, n) => ({ line, n: n + (n >= blocks[0].length ? 1 : 0), typed: slots[n] }));
      const furn = final.find((l) => l.id === "A-FURN");
      const symbols = rows.map(({ line, typed }) => {
        const part = kept(compiled(without(all, line.no), `${what} without line ${line.no}`));
        // only the symbol is taken: a room label may also shift to clear a piece, and stays where the full plan puts it
        const els = added(furn.elements, part.find((l) => l.id === "A-FURN").elements);
        if (!els.length) throw new Error(`archlang card: line ${line.no} of ${what} no longer places a symbol`);
        return { els, at: typed.at + typed.dur };
      });
      const placed = new Set(symbols.flatMap((s) => s.els));
      drawing = final
        .map((l) => outline(l.id === "A-FURN" ? group("", l.elements.filter((el) => !placed.has(el))) + symbols.map((s) => group(on(s.at, 0.25), s.els)).join("") : group("", l.elements)))
        .join("");
      move = [S + 2.1, S + 3.0];
      facts = (key, draw) => draw(totals[key]);
    } else {
      // ── frames: every state of the drawing is its own compile ───────────────
      const lines = display(scene.excerpt.flatMap(([pattern, count]) => linesAt(all, pattern, count, scene.file)), Boolean(scene.scrub));
      let frames; // [{ layers, from, to, totals }]
      let swap = null;
      rows = lines.map((line, n) => ({ line, n: n + (n >= scene.excerpt[0][1] ? 1 : 0) }));

      if (scene.scrub) {
        const { param, from, to, step } = scene.scrub;
        const LET = new RegExp(`^(\\s*let ${param}\\s*= )${from}\\b`, "m");
        if (!LET.test(source)) throw new Error(`archlang card: ${what} no longer declares "let ${param} = ${from}"`);
        const START = S + 1.7;
        const STEP = 0.32;
        frames = [];
        for (let v = from; v <= to; v += step) {
          const src = source.replace(LET, `$1${v}`);
          const n = frames.length;
          frames.push({ value: v, layers: kept(compiled(src, `${what} at ${param} = ${v}`)), totals: describe(src).totals, from: n ? START + n * STEP : S, to: v === to ? S + D : START + (n + 1) * STEP });
        }
        // the number in the editor is the number that was compiled
        const target = rows.find((r) => new RegExp(`^let ${param} = ${from}\\b`).test(r.line.text));
        const col = target.line.text.indexOf(String(from));
        const w = String(from).length * ADV;
        swap = { no: target.line.no, col, svg: (x, y) => `<rect ${on(S + 1.0, 0.2)} x="${(x - 2).toFixed(1)}" y="${y - 12}" width="${(w + 4).toFixed(1)}" height="16" fill="${PLUM}" fill-opacity=".26"/>` + frames.map((f) => `<g ${cut(f.from, f.to)}>${mono(String(f.value), x, y, SYN.number)}</g>`).join("") };
        facts = (key, draw) => (frames.every((f) => f.totals[key] === totals[key]) ? draw(totals[key]) : frames.map((f) => `<g ${cut(f.from, f.to)}>${draw(f.totals[key])}</g>`).join(""));
      } else {
        // the plan as first written, one line short, and what lint() says about it
        const held = linesAt(all, scene.fix, 1, scene.file)[0];
        const draft = without(all, held.no);
        const findings = lint(draft);
        if (lint(source).length !== 0 || findings.length !== 1) throw new Error(`archlang card: ${what} should lint clean, and raise one finding without line ${held.no}`);
        const [finding] = findings;
        const LINT_AT = S + 0.9;
        const TYPE_AT = S + 2.7;
        const FIX_AT = S + 3.35;
        frames = [
          { layers: kept(compiled(draft, `${what} without line ${held.no}`)), totals: describe(draft).totals, from: S, to: FIX_AT },
          { layers: final, totals, from: FIX_AT, to: S + D },
        ];
        facts = (key, draw) => (frames[0].totals[key] === totals[key] ? draw(totals[key]) : frames.map((f) => `<g ${cut(f.from, f.to)}>${draw(f.totals[key])}</g>`).join(""));
        const typedRow = { line: display([...lines, held]).pop(), n: rows[rows.length - 1].n + 1, typed: { at: TYPE_AT, dur: FIX_AT - TYPE_AT - 0.1 } };
        rows.push(typedRow);

        // the statement the finding points at, underlined in the editor and outlined on the sheet
        const flagged = draft.slice(0, finding.span.start).split("\n").length;
        const at = rows.find((r) => r.line.no === flagged);
        const room = describe(draft).rooms.find((r) => r.id === (draft.slice(finding.span.start, finding.span.end).match(/\bid=(\w+)/) || [])[1]);
        if (!at || !room) throw new Error(`archlang card: the ${finding.code} finding no longer points at a room the excerpt shows`);
        const uy = codeTop + at.n * LH + 4.5;
        const lead = at.line.text.match(/^\s*/)[0].length;
        extra.pane += `<path ${span(LINT_AT, FIX_AT, 0.25, 0.2)} d="M${(codeX + lead * ADV).toFixed(1)} ${uy}H${(codeX + Math.min(at.line.text.length, FIT) * ADV).toFixed(1)}" stroke="${WARN}" stroke-width="1.5" stroke-dasharray="3 2"/>`;
        extra.room = (k) => `<rect ${span(LINT_AT, FIX_AT, 0.25, 0.2)} x="${room.bbox.x}" y="${room.bbox.y}" width="${room.bbox.w}" height="${room.bbox.h}" fill="${WARN}" fill-opacity=".1" stroke="${WARN}" stroke-width="${(1.6 / k).toFixed(1)}" stroke-dasharray="${(5 / k).toFixed(0)} ${(3 / k).toFixed(0)}"/>`;

        // the playground's lint row (lint-panel.ts): code, message, first hint; then its clean verdict
        const R = { x: E.x + 14, y: codeTop + (typedRow.n + 1) * LH + 2, w: E.w - 28, h: 52 };
        const hint = finding.hints[0];
        const CLEAN = "No soundness warnings — every room is reachable, bedrooms have windows, the building has an entrance.";
        const wrapped = [];
        for (const word of CLEAN.split(" ")) {
          const next = wrapped.length && `${wrapped[wrapped.length - 1]} ${word}`;
          if (next && glyphs.measure(next, { font: "displayReg", size: 11 }) <= R.w - 30) wrapped[wrapped.length - 1] = next;
          else wrapped.push(word);
        }
        if (glyphs.measure(finding.message, { font: "displayReg", size: 11 }) > R.w - 26 || glyphs.measure(hint, { font: "displayReg", size: 10.5 }) > R.w - 26) throw new Error(`archlang card: the ${finding.code} row no longer fits the pane`);
        extra.pane +=
          `<g ${span(LINT_AT, FIX_AT + 0.15, 0.25, 0.2)}>` +
          // 6% amber on the sheet's panel colour, as the playground mixes it
          `<rect x="${R.x}" y="${R.y}" width="${R.w}" height="${R.h + 16}" rx="3" fill="#f3f1e6" stroke="${SHEET_T.hairline}"/>` +
          `<rect x="${R.x}" y="${R.y}" width="3" height="${R.h + 16}" fill="${WARN}"/>` +
          glyphs.text(finding.code, { font: "mono", size: 10, x: R.x + 14, y: R.y + 19, fill: WARN }) +
          glyphs.text(finding.message, { font: "displayReg", size: 11, x: R.x + 14, y: R.y + 37, fill: SHEET_T.ink }) +
          glyphs.text(hint, { font: "displayReg", size: 10.5, x: R.x + 14, y: R.y + 55, fill: SHEET_T.muted }) +
          "</g>" +
          `<g ${on(FIX_AT + 0.35)}>` +
          glyphs.text("✓", { font: "symbols", size: 11, x: R.x + 2, y: R.y + 19, fill: OK }) +
          wrapped.map((l, n) => glyphs.text(l, { font: "displayReg", size: 11, x: R.x + 18, y: R.y + 19 + n * 16, fill: OK })).join("") +
          "</g>";
      }

      // an element every frame has is stored once; the rest go in one group per frame
      const first = frames[0].layers;
      if (frames.some((f) => f.layers.map((l) => l.id).join() !== first.map((l) => l.id).join())) throw new Error(`archlang card: a frame of ${what} changed the layer list`);
      drawing = first
        .map((_, li) => {
          const sets = frames.map((f) => new Set(f.layers[li].elements));
          const shared = first[li].elements.filter((el) => sets.every((s) => s.has(el)));
          const each = frames.map((f, n) => {
            const own = f.layers[li].elements.filter((el) => !shared.includes(el));
            return own.length ? outline(group(`${cut(f.from, f.to)}${n === frames.length - 1 ? "" : ' opacity="0"'}`, own)) : "";
          });
          return outline(group("", shared)) + each.join("");
        })
        .join("");
      // the sheet is sized for the largest frame, so nothing re-fits while the number moves
      const boxes = frames.map((f) => extentOf(f.layers.filter((l) => EXTENT.has(l.id))));
      const x0 = Math.min(...boxes.map((b) => b.x)), y0 = Math.min(...boxes.map((b) => b.y));
      box = { x: x0, y: y0, w: Math.max(...boxes.map((b) => b.x + b.w)) - x0, h: Math.max(...boxes.map((b) => b.y + b.h)) - y0 };
      if (swap) rows = rows.map((r) => (r.line.no === swap.no ? { ...r, swap } : r));
    }

    // ── the sheet ────────────────────────────────────────────────────────────
    const at = place(scene.view, box);
    let moving = "";
    if (at.dy) {
      const name = rule(`0%,${p(move[0])}{transform:translateY(0);animation-timing-function:cubic-bezier(.45,0,.3,1)}${p(move[1])},100%{transform:translateY(${at.dy.toFixed(1)}px)}`);
      moving = ` class="${name}"`;
    }
    const scn = `class="${rule(`0%,${p(S)}{opacity:0}${p(S + IN)},${p(S + OUT)}{opacity:1}${p(S + D)},100%{opacity:0}`)}"${i === 0 ? "" : ' opacity="0"'}`; // the still frame is scene one
    sheets.push(
      `<g ${scn}>` +
        `<g clip-path="url(#sheet)"><g${moving}><g transform="${at.transform}">${drawing}${extra.room ? extra.room(at.k) : ""}</g></g></g>` +
        factsStrip(facts) +
        "</g>",
    );

    // ── its source ───────────────────────────────────────────────────────────
    const label = scene.no ? `${scene.no} · ${scene.tag.toUpperCase()}` : scene.tag.toUpperCase();
    const gaps = rows.filter((r, n) => n && r.n - rows[n - 1].n > 1).map((r) => `<g ${r.typed ? on(r.typed.at - 0.2, 0.15) : ""}>` + glyphs.text("…", { font: "mono", size: SIZE, x: codeX - 12, y: codeTop + (r.n - 1) * LH, fill: "#9aa1ad", anchor: "end" }) + "</g>");
    panes.push(
      `<g ${scn}>` +
        glyphs.text(`${scene.file}.arch`, { font: "mono", size: 10.5, x: E.x + 16, y: E.y + 19.5, fill: SRC.muted }) +
        glyphs.text(label, { font: "mono", size: 10.5, x: E.x + 16, y: E.y + E.head + 24, fill: PLUM_DEEP, tracking: 0.1 }) +
        `<g clip-path="url(#ed)">${rows.map((r) => row(r.line, r.n, r.typed, r.swap)).join("")}${gaps.join("")}` +
        `<rect x="${E.x + E.w - 34}" y="${codeTop - 14}" width="33" height="${10 * LH}" fill="url(#fade)"/>${caret(rows)}</g>` +
        extra.pane +
        // which sheet of the set is up
        `<rect x="${E.x + E.w - 16 - (SCENES.length - i) * 13}" y="${E.y + 14}" width="10" height="3" fill="${PLUM}"/>` +
        "</g>",
    );
    summary.push(`${scene.no || scene.tag} ${scene.file}`);
  });

  const ticks = SCENES.map((_, i) => `<rect x="${E.x + E.w - 16 - (SCENES.length - i) * 13}" y="${E.y + 14}" width="10" height="3" fill="${SRC.rule}" opacity=".35"/>`).join("");

  // the fine drafting grid of the sheet world
  let grid = "";
  for (let x = SHEET.x + 24; x < 1300; x += 24) grid += `M${x} 0V${footY}`;
  for (let y = 24; y < footY; y += 24) grid += `M${SHEET.x} ${y}H1300`;

  // ── Identity, on the source world's own ground ─────────────────────────────
  // The wordmark is the brand lockup, recoloured only (the mark's geometry law).
  const lockup = readFileSync(`${root}/public/brands/archlang-wordmark-black.svg`, "utf8");
  const inner = lockup.match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1];
  const markEnd = inner.indexOf("</g></g>") + 8;
  if (markEnd < 8) throw new Error("archlang card: the wordmark lockup changed shape");
  const mark = inner.slice(0, markEnd).replace('fill="#111111"', `fill="${PLUM_LIGHT_SURFACE}"`);
  const word = inner.slice(markEnd).replace(/#111111/g, SHEET_T.ink);
  const WM = 0.25; // 1420×198 → 355×49.5
  const HEAD = { font: "displayMid", size: 38 };
  if (40 + glyphs.measure("Floor plans as code.", HEAD) > E.x - 24) throw new Error("archlang card: the headline no longer fits the identity panel");
  const identity = [
    glyphs.text("OPEN-SOURCE LANGUAGE", { font: "mono", size: 11.5, x: 40, y: 56, fill: SRC.muted, tracking: 0.16 }),
    `<g transform="translate(38 86) scale(${WM})">${mark}${word}</g>`,
    glyphs.text("Floor plans as code.", { ...HEAD, x: 40, y: 206, fill: SHEET_T.ink }),
  ];
  // a drawing's title block, the way the site signs its pages
  const cells = [["LICENSE", "MIT", 84], ["OUTPUT", "SVG · DXF · PDF", 156], ["DOCS", "archlang.uk", 124]];
  let cx = 40;
  const TB = { y: 284, h: 48 };
  identity.push(`<rect x="40" y="${TB.y}" width="${cells.reduce((a, c) => a + c[2], 0)}" height="${TB.h}" fill="none" stroke="${SRC.rule}" stroke-opacity=".55"/>`);
  cells.forEach(([label, value, w], n) => {
    if (n) identity.push(`<path d="M${cx} ${TB.y}v${TB.h}" stroke="${SRC.rule}" stroke-opacity=".55"/>`);
    identity.push(glyphs.text(label, { font: "mono", size: 9, x: cx + 12, y: TB.y + 18, fill: SRC.muted, tracking: 0.14 }));
    identity.push(glyphs.text(value, { font: "displayMid", size: 13.5, x: cx + 12, y: TB.y + 37, fill: label === "DOCS" ? PLUM_DEEP : SHEET_T.ink }));
    cx += w;
  });

  const body =
    `<rect width="${SEAM}" height="360" fill="${SRC.bg}"/>` +
    identity.join("") +
    `<rect x="${E.x}" y="${E.y}" width="${E.w}" height="${E.h}" rx="4" fill="${SRC.surface}" stroke="${SRC.border}"/>` +
    `<path d="M${E.x} ${E.y + E.head}h${E.w}" stroke="${SRC.border}"/>` +
    ticks +
    panes.join("") +
    `<rect x="${SHEET.x}" y="0" width="${SHEET.w}" height="360" fill="${SHEET_T.panel}"/>` +
    `<rect x="${SHEET.x}" y="0" width="${SHEET.w}" height="${footY}" fill="${SHEET_T.paper}"/><path d="${grid}" stroke="${SHEET_T.grid}" fill="none"/>` +
    sheets.join("") +
    `<path d="M${SHEET.x} ${footY + 0.5}h${SHEET.w}" stroke="${SHEET_T.hairline}"/>` +
    // the compile seam: a solid plum rule, never a glow
    `<rect x="${SEAM - 1}" width="2" height="360" fill="${PLUM}"/>`;

  const css = `[class]{animation:${T}s linear infinite}` + [...rules.values()].map((r) => `@keyframes ${r.name}{${r.frames}}.${r.name}{${r.base}animation-name:${r.name}}`).join("");

  return {
    svg: card({
      title: "ArchLang is an open-source language that compiles plain-text source into floor plans. The card shows source being typed and the drawing compiling beside it: five example plans, one constant changed, and a lint finding raised and cleared.",
      css,
      defs: `${glyphs.defs()}${[...alias.values()].map((a) => `<use id="${a.id}" href="#${a.glyph}" transform="scale(${COL} ${-COL})"/>`).join("")}${defs.join("")}`,
      body,
      radius: 10,
    }),
    facts: { scenes: summary.join(", "), loop: `${T.toFixed(1)}s` },
  };
}
