// ArchLang card, drawn in ArchLang's own design system ("The Compile Boundary",
// archlang/brand/README.md): ONE LIGHT WORLD split by a solid plum seam. Left of
// it is the cool SOURCE world (identity + the editor), right of it the warm SHEET
// world (drafting paper + the compiled drawing). No dark surface, no pills.
// Amber is the playground's advisory colour and appears only on a lint finding;
// redline is not used because nothing here is an error.
//
// The stage tells one story, brief → plan → change → check → 3D (archlang
// docs/plans/public-surfaces, PS-D8, plus the playground's Plan | 3D switch),
// in seven scenes on one 37 s loop:
//   brief     a real brief from the agent gallery arrives in a chat bubble
//   plan      the agent's ArchLang streams in and the sheet draws as it does
//   figure    the rooms and their areas, as describe() computes them
//   change    a constant is scrubbed and every frame is its own compile
//   check     a lint finding is raised, one line is typed, the finding clears
//   model     the stage switches to 3D: the same plan rises in @chanmeng666/archlang-3d's
//             own viewer and turns a full circle, while the pane builds the GLB with
//             the package's CLI and its four checks pass
//   outputs   the formats; the 3D end view stays. This is the still frame
//
// The 3D picture is the only raster on the card, because a rendered building is a
// picture by nature: frames the package's viewer drew (archlang-3d-frames.mjs). The
// rise dissolves frame into frame; the turn, a frame every 5°, is a filmstrip cut from
// frame to frame under one slow eased push-in. They are moved and scaled, never redrawn: the viewer's
// orbit pivots off the building's centre, so each turn frame is shifted to hold it
// still, and the rise is scaled to the turn's first frame (one press of the viewer's
// zoom out) so the one runs into the other. Each frame's edges fade into the paper.
//
// Nothing on the sheet is drawn by hand. The brief and the plan are a pair from
// the ArchLang repo's agent gallery (docs/gallery/: the brief as given, the plan as
// the agent delivered it), read from the sibling checkout; the other two plans are
// examples shipped inside the npm package. All are compiled by the real compiler at
// build time, and the build fails if one reports an error. Every line in the editor
// is cut from the file it names and keeps its line number. While the plan streams,
// each element of the drawing appears with the line whose prefix of the file first
// compiles to it (and keeps it), the way the docs home's hero paints the sheet from
// each prefix that compiles. The figures are describe()'s and the finding is lint()'s.
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { compile, describe, lint } from "@chanmeng666/archlang";

import { outlineTextElements } from "../lib/svg-card/glyphs.mjs";
import { extentOf, splitLayers } from "../lib/svg-card/plan.mjs";
import { card, pct } from "../lib/svg-card/shell.mjs";
import { FRAMES_DIR, sha, VIEW } from "./archlang-3d-frames.mjs";

export const ARCHLANG_FONTS = {
  displayMid: "scripts/cards/fonts/archlang/Archivo-600.ttf",
  displayReg: "scripts/cards/fonts/archlang/Archivo-400.ttf",
  mono: "scripts/cards/fonts/archlang/IBMPlexMono-400.ttf",
  symbols: "cv/fonts/JetBrainsMono-Regular.ttf", // only for a glyph the others lack (→, the lint tick)
};

// The gallery pair, from the ArchLang checkout beside this repo. `studio` is the
// docs home's hero pair too: three rooms read at card size, and its brief is one
// short paragraph.
const PAIR = "studio";
const GALLERY = "../archlang/docs/gallery";
export const ARCHLANG_INPUTS = {
  brief: `${GALLERY}/${PAIR}.brief.txt`,
  plan: `${GALLERY}/${PAIR}.arch`,
  list: `${GALLERY}/gallery.json`,
  cli3d: "../archlang/packages/archlang-3d/dist/cli.js",
  pkg3d: "../archlang/packages/archlang-3d/package.json",
};

// Lines of the plan typed at reading speed; every other statement line streams in whole.
const KEY_LINES = [/room id=r_main /, /wall id=w_north /, /door id=d_front /, /furniture bed /];
const SCRUB = { file: "parametric", param: "H", from: 5000, to: 6000, step: 250, excerpt: [[/^\s*let WALL/, 3], [/^\s*for i in/, 4]] };
const CHECK = { file: "laneway-house", dims: false, fix: /window on w_garden at 5850/, excerpt: [[/^\s*strip down/, 4], [/window on w_west/, 2]] };

// Scene windows, in seconds of the loop.
const T = 37;
const SC = { brief: [0, 3], plan: [3, 10], figure: [10, 12.5], change: [12.5, 16.5], check: [16.5, 21], model: [21, 33], outputs: [33, 37] };
const ORDER = ["brief", "plan", "figure", "change", "check", "model", "outputs"];
// Inside `model`: the rise plays to here, one press of the viewer's zoom out, then the turn.
const RISEN = 24.3;
const TURN_FROM = 24.75;

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
const PROPERTIES = new Set(["at", "size", "label", "width", "thickness", "offset", "close", "x", "in", "on", "rotate", "radius", "against", "as", "mirror", "uses", "circle", "polygon", "arc", "material", "scale", "angle", "street", "hemisphere", "dir", "wall", "hinge", "swing", "slide", "gap", "into", "diameter", "anchor", "inset", "flush", "sill"]);
const ATOMS = new Set(["exterior", "partition", "north", "south", "east", "west", "landscape", "portrait", "auto", "all", "rooms", "concrete", "brick", "insulation", "tile", "none", "up", "down", "left", "right", "garage", "sliding", "pocket", "bath", "bedroom", "office", "hall", "living", "kitchen", "entry", "mm", "overall", "near", "start", "end", "bottom-left", "bottom-right"]);

// Interface strings, each from an ArchLang surface that already says it.
const COPY = {
  identity: "Floor plans as code.", // the identity line (PS-D1)
  briefFrom: (model) => `The brief, as given to ${model}`, // docs home hero (CompileSeam.vue)
  writtenBy: (file, model) => `${file} · written by ${model}`, // docs home hero
  reading: "reading the brief", // docs home hero, sheet status
  compiling: "compiling", // docs home hero, sheet status
  figure: "Computed, not estimated", // PS-D1 "Exact" card
  change: "Change one number",
  check: "It checks itself", // PS-D1 card title
  output: "SVG · PDF · DXF · PNG · GLB", // the film: "Export to SVG, DXF, PDF or PNG, and GLB for the 3D preview."
  caption: "You get a dimensioned drawing, and the same text gives the same file every time.", // docs home "How it works", step 3
  rise: "3D preview", // @chanmeng666/archlang-3d, the package description's own words
  riseFoot: "Same source, plan and 3D preview.", // packages/archlang-3d/README.md
  views: ["Plan", "3D"], // playground index.html, the stage's Plan | 3D switch
  // What each check holds the GLB to (archlang-3d replay/payload.ts and the playground's GLB note).
  checks: {
    "V-SCH-01": () => "every element from the plan",
    "V-GEO-02": (f) => `${f.shells} shells, every one closed`,
    "V-GLTF-01": (f) => `Khronos validator, ${f.errors} errors`,
    "V-GLTF-02": (f) => `${f.nodes} nodes, named kind:id`,
  },
  clean: "No soundness warnings — every room is reachable, bedrooms have windows, the building has an entrance.", // playground lint-panel.ts
};

function tokenize(line) {
  const out = [];
  let col = 0;
  let first = true;
  for (const [text] of line.matchAll(/\s+|"[^"]*"|#.*$|\d+(?:\.\d+)?%?|[A-Za-z_][\w-]*|./g)) {
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

const statement = (l) => l.trim() && !l.trim().startsWith("#");

// Statement lines of the source starting at the first match of `pattern`, each
// with its line number in the file. Blank and comment-only lines are skipped.
function linesAt(all, pattern, count, file) {
  const at = all.findIndex((l) => statement(l) && pattern.test(l.replace(/ {2,}/g, " "))); // the files align their columns
  if (at < 0) throw new Error(`archlang card: ${file} no longer has a line matching ${pattern}`);
  const out = [];
  for (let i = at; i < all.length && out.length < count; i++) if (statement(all[i])) out.push({ no: i + 1, raw: all[i] });
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

// The playground's facts line (playground/src/room-facts.ts `factsLine`, `areaText`, `sourceLines`).
function factsLine(source, totals) {
  const n = source === "" ? 0 : source.split(/\r\n|\r|\n/).length - (/[\r\n]$/.test(source) ? 1 : 0);
  const area = totals.net_floor_area_m2 !== undefined ? `${totals.net_floor_area_m2} m² (net)` : `${totals.floor_area_m2} m² (centreline)`;
  return `${n} line${n === 1 ? "" : "s"} of ArchLang → ${totals.rooms} room${totals.rooms === 1 ? "" : "s"} · ${area}`;
}

// A drawing at card size: one model unit is a twentieth of a pixel or less, so the
// compiler's decimals are dropped from geometry (a text's size is kept).
const GEOM = /\b(points|d|x|y|x1|y1|x2|y2|cx|cy|r|rx|ry|width|height|stroke-width|transform)="([^"]*)"/g;
const whole = (s) => s.replace(/-?\d*\.\d+/g, (v) => String(Math.round(Number(v)) || 0));
function coarse(el) {
  if (el.startsWith("<text")) return el.replace(/^<text\b[^>]*>/, (open) => open.replace(/ (x|y)="([^"]*)"/g, (_, k, v) => ` ${k}="${whole(v)}"`));
  return el.replace(GEOM, (_, k, v) => `${k}="${whole(v)}"`);
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
  body = body.replace(/ d="([^"]+)"/g, (_, d) => ` d="${d.replace(/\s*([A-Za-z])\s*/g, "$1").replace(/ ?, ?/g, ",")}"`);
  return `<g${attrs ? ` ${attrs}` : ""}${own}>${body}</g>`;
}

// Glyph outlines rewritten with relative commands: the same points, about a third
// fewer bytes. GlyphSet writes absolute integer M/L/Q/C/Z in font units.
function relativeGlyphs(defs) {
  const num = (v) => String(v);
  const join = (vs) => vs.map(num).reduce((s, v, i) => s + (i && !v.startsWith("-") ? " " : "") + v, "");
  return defs.replace(/ d="([^"]*)"/g, (_, d) => {
    let x = 0, y = 0, sx = 0, sy = 0, out = "", last = "";
    for (const [, cmd, args] of d.matchAll(/([MLQCZ])([^MLQCZ]*)/g)) {
      const v = args.trim() ? args.trim().split(/[\s,]+/).map(Number) : [];
      let op, vals;
      if (cmd === "Z") {
        op = "z"; vals = []; x = sx; y = sy;
      } else if (cmd === "M") {
        op = "m"; vals = [v[0] - x, v[1] - y]; x = sx = v[0]; y = sy = v[1];
      } else if (cmd === "L") {
        if (v[1] === y) { op = "h"; vals = [v[0] - x]; }
        else if (v[0] === x) { op = "v"; vals = [v[1] - y]; }
        else { op = "l"; vals = [v[0] - x, v[1] - y]; }
        x = v[0]; y = v[1];
      } else {
        op = cmd.toLowerCase();
        vals = v.map((n, i) => n - (i % 2 ? y : x));
        x = v[v.length - 2]; y = v[v.length - 1];
      }
      const body = join(vals);
      // a repeated command letter may be left out (never after z, never for m)
      if (op === last && op !== "z" && op !== "m") out += (body.startsWith("-") ? "" : " ") + body;
      else out += op + body;
      last = op;
    }
    return ` d="${out}"`;
  });
}

export async function buildArchlangCard({ glyphs, root }) {
  const examples = `${root}/node_modules/@chanmeng666/archlang/examples`;
  const at = (f) => (path.isAbsolute(f) ? f : path.join(root, f));
  const model = JSON.parse(readFileSync(at(ARCHLANG_INPUTS.list), "utf8")).find((e) => e.id === PAIR)?.model;
  if (!model) throw new Error(`archlang card: gallery.json has no "${PAIR}" entry`);
  const brief = readFileSync(at(ARCHLANG_INPUTS.brief), "utf8").trim();

  // ── Timeline ───────────────────────────────────────────────────────────────
  const p = (t) => pct(t, T, 2);
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
  const cut = (a, b) => `class="${rule(`0%{opacity:0;animation-timing-function:step-end}${p(a)}{opacity:1;animation-timing-function:step-end}${p(b)},100%{opacity:0}`)}"${b >= T ? "" : ' opacity="0"'}`;
  // shown in each window [a, b], fading in after a and out before b; a window
  // that runs to the end of the loop is part of the still frame
  const shown = (wins, f = 0.3) => {
    const pts = [];
    if (wins[0][0] > 0) pts.push([0, 0]);
    for (const [a, b] of wins) {
      pts.push(...(a > 0 ? [[a, 0], [a + f, 1]] : [[0, 1]]));
      pts.push(...(b < T ? [[b - f, 1], [b, 0]] : [[T, 1]]));
    }
    if (pts[pts.length - 1][0] < T) pts.push([T, 0]);
    const still = wins[wins.length - 1][1] >= T;
    return `class="${rule(pts.map(([t, o]) => `${p(t)}{opacity:${o}}`).join(""))}"${still ? "" : ' opacity="0"'}`;
  };

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
  const labelY = E.y + E.head + 24;
  const codeTop = labelY + 26;
  const codeW = E.x + E.w - codeX;
  const FIT = Math.floor((codeW - 8) / ADV); // characters a row shows before the pane's edge
  // Code is most of the card's text. GlyphSet places a glyph in font units; the
  // face is monospaced, so each glyph is aliased once at one-column scale and a
  // character costs `<use href="#m4" x="12"/>`.
  const alias = new Map();
  const uses = (text, from = 0) => {
    let out = "";
    [...text].forEach((ch, col) => {
      if (ch === " ") return;
      if (!alias.has(ch)) alias.set(ch, { id: `m${alias.size.toString(36)}`, glyph: glyphs.text(ch, { font: "mono", size: SIZE }).match(/href="#([^"]+)"/)[1] });
      out += `<use href="#${alias.get(ch).id}"${col + from ? ` x="${col + from}"` : ""}/>`;
    });
    return out;
  };
  const at1 = (x, y) => `transform="translate(${Number(x.toFixed(2))} ${y}) scale(${ADV})"`;
  const mono = (text, x, y, fill) => `<g fill="${fill}" ${at1(x, y)}>${uses(text)}</g>`;
  const outline = (body) => outlineTextElements(body, glyphs, { regular: "displayReg", bold: "displayMid", fallback: "symbols" });
  const wrap = (text, width, style) => {
    const lines = [];
    for (const word of text.split(/\s+/)) {
      const next = lines.length && `${lines[lines.length - 1]} ${word}`;
      if (next && glyphs.measure(next, style) <= width) lines[lines.length - 1] = next;
      else lines.push(word);
    }
    return lines;
  };

  // One row of the editor at baseline y. `typed` = { at, dur }: a cover the
  // colour of the pane steps off the row a character at a time; `shownAt` alone:
  // the row arrives whole, as a streamed line does.
  const row = (line, y, { typed, shownAt, swap } = {}) => {
    const out = [];
    // one run per colour, all in one column grid: the face is monospaced, so a blank holds a column
    const no = String(line.no);
    const runs = new Map([["#9aa1ad", uses(no, -12 / ADV - no.length)]]);
    for (const tok of tokenize(line.text)) {
      if (tok.col > FIT) continue; // past the pane's edge
      if (swap && tok.col === swap.col) out.push(swap.svg(codeX + tok.col * ADV, y));
      else runs.set(SYN[tok.kind], (runs.get(SYN[tok.kind]) || "") + uses(tok.text.slice(0, FIT + 1 - tok.col), tok.col));
    }
    out.unshift(`<g ${at1(codeX, y)}>${[...runs].map(([fill, u]) => `<g fill="${fill}">${u}</g>`).join("")}</g>`);
    if (typed) {
      const chars = Math.min(line.text.length, FIT + 1);
      const w = (chars * ADV).toFixed(1);
      const name = rule(`0%,${p(typed.at)}{transform:translateX(0);animation-timing-function:steps(${chars},end)}${p(typed.at + typed.dur)},100%{transform:translateX(${w}px)}`, `transform:translateX(${w}px);`);
      out.push(`<rect class="${name}" x="${(codeX - 1).toFixed(1)}" y="${y - 13}" width="${codeW}" height="${LH}" fill="${SRC.surface}"/>`);
    }
    return typed ? `<g ${on(typed.at, 0.1)}>${out.join("")}</g>` : out.join("");
  };

  // Where a drawing sits on the sheet.
  const place = (box) => {
    const m = SHEET.margin;
    const availW = SHEET.w - m * 2;
    const availH = footY - m * 2;
    const k = Math.min(availW / box.w, availH / box.h);
    const tx = SHEET.x + m + (availW - box.w * k) / 2;
    const ty = SHEET.y + m + (availH - box.h * k) / 2;
    return { k, transform: `translate(${(tx - box.x * k).toFixed(1)} ${(ty - box.y * k).toFixed(1)}) scale(${k.toFixed(5)})` };
  };
  const sheetGroup = (attrs, box, inner) => `<g ${attrs}><g clip-path="url(#sheet)"><g transform="${place(box).transform}">${inner(place(box).k)}</g></g></g>`;
  const footText = (text, fill = SHEET_T.ink) => glyphs.text(text, { font: "mono", size: 10.5, x: SHEET.x + 18, y: footY + 20, fill, fallback: "symbols" });

  const defs = [
    `<clipPath id="ed"><rect x="${E.x + 1}" y="${E.y + E.head + 1}" width="${E.w - 2}" height="${E.h - E.head - 2}"/></clipPath>`,
    // the streaming pane scrolls: a row leaving the top is cut at the line above the newest rows
    `<clipPath id="edp"><rect x="${E.x + 1}" y="${E.y + E.head + 10}" width="${E.w - 2}" height="${E.h - E.head - 11}"/></clipPath>`,
    `<clipPath id="sheet"><rect x="${SHEET.x}" y="${SHEET.y}" width="${SHEET.w}" height="${footY}"/></clipPath>`,
    // long statements run off the pane; they fade out rather than stop dead
    `<linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="${SRC.surface}" stop-opacity="0"/><stop offset="1" stop-color="${SRC.surface}"/></linearGradient>`,
  ];
  // `dims`: false drops the dimension layer (a plan whose dimensions would crowd the sheet at card size)
  const kept = (svg, prefix, dims = true) => {
    const split = splitLayers(svg, prefix);
    return { defs: split.defs, layers: split.layers.filter((l) => DRAWN.has(l.id) && (dims || l.id !== "A-ANNO-DIMS")).map((l) => ({ id: l.id, elements: l.elements.map(coarse) })) };
  };
  const boxOf = (layers) => extentOf(layers.filter((l) => EXTENT.has(l.id)).map((l) => ({ body: l.elements.join("") })));

  const sheets = [];
  const panes = [];
  const foots = [];
  const header = (text, attrs) => `<g ${attrs}>${glyphs.text(text, { font: "mono", size: 10.5, x: E.x + 16, y: E.y + 19.5, fill: SRC.muted })}</g>`;
  const label = (text) => glyphs.text(text.toUpperCase(), { font: "mono", size: 10.5, x: E.x + 16, y: labelY, fill: PLUM_DEEP, tracking: 0.1 });

  // ══ The gallery pair: brief → plan → figure, and the still frame ══════════
  const planFile = `${PAIR}.arch`;
  const planSrc = readFileSync(at(ARCHLANG_INPUTS.plan), "utf8");
  const all = planSrc.split("\n");
  const studio = kept(compiled(planSrc, planFile), "s0");
  defs.push(studio.defs);
  const studioFacts = describe(planSrc);
  const studioBox = boxOf(studio.layers);
  const studioWins = [[SC.brief[0], SC.figure[1]]];

  // ── 1 · the brief, typed into a chat bubble ─────────────────────────────────
  const BUB = { x: E.x + 14, y: labelY + 10, w: E.w - 28, pad: 12, lh: 16.5 };
  const BODY = { font: "displayReg", size: 12 };
  const briefLines = wrap(brief, BUB.w - BUB.pad * 2, BODY);
  BUB.h = BUB.pad * 2 + briefLines.length * BUB.lh - 4;
  if (BUB.y + BUB.h > E.y + E.h - 92) throw new Error(`archlang card: the ${PAIR} brief no longer fits the bubble (${briefLines.length} lines)`);
  defs.push(`<clipPath id="bub"><rect x="${BUB.x}" y="${BUB.y}" width="${BUB.w}" height="${BUB.h}"/></clipPath>`);
  const r = 12;
  const bubble = `M${BUB.x + r} ${BUB.y}H${BUB.x + BUB.w - r}a${r} ${r} 0 0 1 ${r} ${r}V${BUB.y + BUB.h - 4}a4 4 0 0 1-4 4H${BUB.x + r}a${r} ${r} 0 0 1-${r}-${r}V${BUB.y + r}a${r} ${r} 0 0 1 ${r}-${r}Z`;
  const TYPE = [SC.brief[0] + 0.35, SC.brief[1] - 0.45];
  const perChar = (TYPE[1] - TYPE[0]) / briefLines.reduce((a, l) => a + l.length, 0);
  let tb = TYPE[0];
  const briefCovers = briefLines.map((l, n) => {
    const y = BUB.y + BUB.pad + 9 + n * BUB.lh;
    const w = (glyphs.measure(l, BODY) + 2).toFixed(1);
    const name = rule(`0%,${p(tb)}{transform:translateX(0);animation-timing-function:steps(${l.length},end)}${p(tb + l.length * perChar)},100%{transform:translateX(${w}px)}`, `transform:translateX(${w}px);`);
    tb += l.length * perChar;
    return `<rect class="${name}" x="${BUB.x + BUB.pad - 1}" y="${y - 12}" width="${BUB.w - BUB.pad}" height="${BUB.lh}" fill="${SHEET_T.panel}"/>`;
  });
  panes.push(
    `<g ${shown([SC.brief, SC.outputs])}>` +
      glyphs.text(COPY.briefFrom(model).toUpperCase(), { font: "displayMid", size: 9.5, x: E.x + E.w - 14, y: labelY - 2, fill: SRC.muted, tracking: 0.12, anchor: "end" }) +
      `<path d="${bubble}" fill="${SHEET_T.panel}" stroke="${SHEET_T.hairline}"/>` +
      briefLines.map((l, n) => glyphs.text(l, { ...BODY, x: BUB.x + BUB.pad, y: BUB.y + BUB.pad + 9 + n * BUB.lh, fill: SHEET_T.ink })).join("") +
      `<g clip-path="url(#bub)">${briefCovers.join("")}</g>` +
      "</g>",
  );
  panes.push(header(`${PAIR}.brief.txt`, shown([SC.brief])));
  foots.push(`<g ${shown([[SC.brief[0], SC.brief[1]]])}>${footText(COPY.reading, SHEET_T.muted)}</g>`);

  // ── 2 · the plan streams in; the sheet draws from each prefix that compiles ──
  const start = all.findIndex((l) => /^plan\b/.test(l));
  const stop = all.findIndex((l, i) => i > start && /^\s*title\b/.test(l));
  if (start < 0 || stop < 0) throw new Error(`archlang card: ${planFile} no longer has a plan block with a title`);
  const planRows = display(all.slice(start, stop).map((raw, i) => ({ no: start + i + 1, raw })).filter((l) => statement(l.raw)));
  if (!KEY_LINES.every((re) => planRows.some((l) => re.test(l.text)))) throw new Error(`archlang card: a key line is missing from ${planFile}`);
  // a key line takes reading time; a streamed one a tenth of a second
  const KEY = 0.9;
  const FAST = 0.1;
  const weights = planRows.map((l) => (KEY_LINES.some((re) => re.test(l.text)) ? KEY : FAST));
  const PLAN = [SC.plan[0] + 0.35, SC.plan[1] - 0.6];
  const unit = (PLAN[1] - PLAN[0]) / weights.reduce((a, w) => a + w, 0);
  let tp = PLAN[0];
  const slots = weights.map((w) => {
    const slot = w === KEY ? { at: tp, dur: (KEY - 0.2) * unit, key: true } : { at: tp, dur: 0 };
    tp += w * unit;
    return slot;
  });
  const done = (n) => slots[n].at + slots[n].dur;
  const planDone = done(planRows.length - 1);

  // the drawing after each row: the file up to that line, its plan block closed
  const counts = planRows.map((l) => {
    const res = compile(`${all.slice(0, l.no).join("\n")}\n}\n`);
    if (res.errors.length) return null; // a prefix that does not compile paints nothing new
    const tally = new Map();
    for (const layer of kept(res.svg, "s0").layers) for (const el of layer.elements) tally.set(`${layer.id}|${el}`, (tally.get(`${layer.id}|${el}`) || 0) + 1);
    return tally;
  });
  const lastClean = counts.findLastIndex(Boolean);
  // each copy of an element arrives with the first row from which every later clean prefix has it
  const drawing = studio.layers.map((layer) => {
    const seen = new Map();
    const arrivals = layer.elements.map((el) => {
      const key = `${layer.id}|${el}`;
      const copy = seen.get(key) || 0;
      seen.set(key, copy + 1);
      let from = -1;
      for (let n = lastClean; n >= 0; n--) {
        if (!counts[n]) continue;
        if ((counts[n].get(key) || 0) > copy) from = n;
        else break;
      }
      if (from < 0) throw new Error(`archlang card: ${planFile} draws ${layer.id} and no streamed line accounts for it`);
      return done(from);
    });
    // runs of elements that arrive together, in the compiler's order
    let out = "";
    for (let i = 0, j; i < layer.elements.length; i = j) {
      for (j = i + 1; j < layer.elements.length && arrivals[j] === arrivals[i]; j++);
      out += outline(group(on(arrivals[i], 0.25), layer.elements.slice(i, j)));
    }
    return out;
  });

  // the editor: rows stream in and the pane scrolls to keep the newest in view
  const planTop = labelY;
  const VIS = Math.floor((E.y + E.h - 8 - planTop) / LH) + 1;
  const stops = [];
  planRows.forEach((_, n) => {
    if (n >= VIS) stops.push(`${p(slots[n].at)}{transform:translateY(${-(n - VIS + 1) * LH}px);animation-timing-function:step-end}`);
  });
  const scroll = rule(`0%{transform:translateY(0);animation-timing-function:step-end}${stops.join("")}`);
  // a cover the colour of the pane sits below the newest row and steps down as each arrives
  const veil = rule(`0%{transform:translateY(0);animation-timing-function:step-end}${planRows.map((_, n) => `${p(slots[n].at)}{transform:translateY(${(n + 1) * LH}px);animation-timing-function:step-end}`).join("")}100%{transform:translateY(${planRows.length * LH}px)}`, `transform:translateY(${planRows.length * LH}px);`);
  panes.push(
    `<g ${shown([SC.plan])}>` +
      `<g clip-path="url(#edp)"><g class="${scroll}">` +
      planRows.map((l, n) => row(l, planTop + n * LH, slots[n].key ? { typed: slots[n] } : {})).join("") +
      `<rect class="${veil}" x="${E.x + 1}" y="${planTop - 14}" width="${E.w - 2}" height="${planRows.length * LH + 20}" fill="${SRC.surface}"/>` +
      `</g><rect x="${E.x + E.w - 34}" y="${E.y + E.head + 1}" width="33" height="${E.h - E.head - 2}" fill="url(#fade)"/></g>` +
      "</g>",
  );
  panes.push(header(COPY.writtenBy(planFile, model), shown([[SC.plan[0], SC.figure[1]]])));
  foots.push(`<g ${shown([[SC.plan[0], planDone + 0.3]])}>${footText(COPY.compiling, SHEET_T.muted)}</g>`);
  foots.push(`<g ${shown([[planDone + 0.3, SC.figure[1]]])}>${footText(factsLine(planSrc, studioFacts.totals))}</g>`);

  // ── 3 · the figure: describe()'s rooms, centreline and net ──────────────────
  const rooms = studioFacts.rooms;
  const t3 = SC.figure[0];
  const nameW = Math.max(...rooms.map((rm) => rm.label.length)) + 2;
  const fig = [["ROOM".padEnd(nameW) + "CENTRELINE".padStart(12) + "NET".padStart(12), SRC.muted, t3 + 0.1]];
  rooms.forEach((rm, n) => fig.push([rm.label.padEnd(nameW) + `${rm.area_m2} m²`.padStart(12) + `${rm.net_area_m2} m²`.padStart(12), SRC.fg, t3 + 0.35 + n * 0.3]));
  const tot = studioFacts.totals;
  fig.push([`${tot.rooms} rooms`.padEnd(nameW) + `${tot.floor_area_m2} m²`.padStart(12) + `${tot.net_floor_area_m2} m²`.padStart(12), PLUM_DEEP, t3 + 0.45 + rooms.length * 0.3]);
  if (fig.some(([text]) => text.length > FIT + 6)) throw new Error("archlang card: the room table no longer fits the pane");
  const figX = E.x + 18;
  const figY = (n) => codeTop + 6 + n * LH + (n === fig.length - 1 ? 8 : 0);
  panes.push(
    `<g ${shown([SC.figure])}>` +
      label(COPY.figure) +
      fig.map(([text, fill, t], n) => `<g ${on(t, 0.2)}>${mono(text, figX, figY(n), fill)}</g>`).join("") +
      `<path ${on(fig[fig.length - 1][2], 0.2)} d="M${figX} ${figY(fig.length - 1) - 16}h${(nameW + 24) * ADV}" stroke="${SRC.rule}" stroke-opacity=".5"/>` +
      "</g>",
  );

  sheets.push(
    sheetGroup(shown(studioWins), studioBox, (k) =>
      drawing.join("") +
      // each room outlined as its row of the table arrives
      rooms
        .map((rm, n) => `<rect ${span(t3 + 0.35 + n * 0.3, SC.figure[1] - 0.35, 0.2, 0.25)} x="${rm.bbox.x}" y="${rm.bbox.y}" width="${rm.bbox.w}" height="${rm.bbox.h}" fill="${PLUM}" fill-opacity=".1" stroke="${PLUM}" stroke-width="${Math.round(1.6 / k)}"/>`)
        .join(""),
    ),
  );

  // ── 6 · outputs (the still frame): the brief above, the formats, a caption ──
  const OUT = { y: BUB.y + BUB.h + 34 };
  panes.push(
    `<g ${shown([SC.outputs])}>` +
      glyphs.text("OUTPUT", { font: "mono", size: 9, x: E.x + 16, y: OUT.y, fill: SRC.muted, tracking: 0.14 }) +
      glyphs.text(COPY.output, { font: "displayMid", size: 17, x: E.x + 16, y: OUT.y + 24, fill: SHEET_T.ink }) +
      wrap(COPY.caption, E.w - 32, { font: "displayReg", size: 11.5 })
        .map((l, n) => glyphs.text(l, { font: "displayReg", size: 11.5, x: E.x + 16, y: OUT.y + 50 + n * 16, fill: SRC.muted }))
        .join("") +
      "</g>",
  );

  // ══ 4 · change one number, 5 · it checks itself: frames of real compiles ══
  for (const [i, scene] of [SCRUB, CHECK].entries()) {
    const [S, END] = scene === SCRUB ? SC.change : SC.check;
    const what = `${scene.file}.arch`;
    const lines = readFileSync(`${examples}/${what}`, "utf8").split("\n");
    const source = lines.join("\n");
    const prefix = `s${i + 1}`;
    const final = kept(compiled(source, what), prefix, scene.dims !== false);
    defs.push(final.defs);
    const totals = describe(source).totals;
    const excerpt = display(scene.excerpt.flatMap(([pattern, count]) => linesAt(lines, pattern, count, what)), scene === SCRUB);
    let rows = excerpt.map((line, n) => ({ line, n: n + (n >= scene.excerpt[0][1] ? 1 : 0) }));
    let frames; // [{ layers, from, to, facts }]
    let swap = null;
    let pane = "";
    let room = null;

    if (scene === SCRUB) {
      const { param, from, to, step } = scene;
      const LET = new RegExp(`^(\\s*let ${param}\\s*= )${from}\\b`, "m");
      if (!LET.test(source)) throw new Error(`archlang card: ${what} no longer declares "let ${param} = ${from}"`);
      const START = S + 1.0;
      const STEP = 0.5;
      frames = [];
      for (let v = from; v <= to; v += step) {
        const src = source.replace(LET, `$1${v}`);
        const n = frames.length;
        frames.push({ value: v, layers: kept(compiled(src, `${what} at ${param} = ${v}`), prefix, scene.dims !== false).layers, facts: factsLine(src, describe(src).totals), from: n ? START + n * STEP : S, to: v === to ? END : START + (n + 1) * STEP });
      }
      // the number in the editor is the number that was compiled
      const target = rows.find((rw) => new RegExp(`^let ${param} = ${from}\\b`).test(rw.line.text));
      const col = target.line.text.indexOf(String(from));
      const w = String(from).length * ADV;
      swap = { no: target.line.no, col, svg: (x, y) => `<rect ${on(S + 0.6, 0.2)} x="${(x - 2).toFixed(1)}" y="${y - 12}" width="${(w + 4).toFixed(1)}" height="16" fill="${PLUM}" fill-opacity=".26"/>` + frames.map((f) => `<g ${cut(f.from, f.to)}>${mono(String(f.value), x, y, SYN.number)}</g>`).join("") };
      rows = rows.map((rw) => (rw.line.no === swap.no ? { ...rw, swap } : rw));
    } else {
      // the plan as first written, one line short, and what lint() says about it
      const held = linesAt(lines, scene.fix, 1, what)[0];
      const draft = without(lines, held.no);
      const findings = lint(draft);
      if (lint(source).length !== 0 || findings.length !== 1) throw new Error(`archlang card: ${what} should lint clean, and raise one finding without line ${held.no}`);
      const [finding] = findings;
      const LINT_AT = S + 0.6;
      const TYPE_AT = S + 1.9;
      const FIX_AT = S + 2.55;
      frames = [
        { layers: kept(compiled(draft, `${what} without line ${held.no}`), prefix, scene.dims !== false).layers, facts: factsLine(draft, describe(draft).totals), from: S, to: FIX_AT },
        { layers: final.layers, facts: factsLine(source, totals), from: FIX_AT, to: END },
      ];
      const typedRow = { line: display([...excerpt, held]).pop(), n: rows[rows.length - 1].n + 1, typed: { at: TYPE_AT, dur: FIX_AT - TYPE_AT - 0.1 } };
      rows.push(typedRow);

      // the statement the finding points at, underlined in the editor and outlined on the sheet
      const flagged = draft.slice(0, finding.span.start).split("\n").length;
      const hit = rows.find((rw) => rw.line.no === flagged);
      const rm = describe(draft).rooms.find((x) => x.id === (draft.slice(finding.span.start, finding.span.end).match(/\bid=(\w+)/) || [])[1]);
      if (!hit || !rm) throw new Error(`archlang card: the ${finding.code} finding no longer points at a room the excerpt shows`);
      const uy = codeTop + hit.n * LH + 4.5;
      const lead = hit.line.text.match(/^\s*/)[0].length;
      pane += `<path ${span(LINT_AT, FIX_AT, 0.25, 0.2)} d="M${(codeX + lead * ADV).toFixed(1)} ${uy}H${(codeX + Math.min(hit.line.text.length, FIT) * ADV).toFixed(1)}" stroke="${WARN}" stroke-width="1.5" stroke-dasharray="3 2"/>`;
      room = (k) => `<rect ${span(LINT_AT, FIX_AT, 0.25, 0.2)} x="${rm.bbox.x}" y="${rm.bbox.y}" width="${rm.bbox.w}" height="${rm.bbox.h}" fill="${WARN}" fill-opacity=".1" stroke="${WARN}" stroke-width="${(1.6 / k).toFixed(0)}" stroke-dasharray="${(5 / k).toFixed(0)} ${(3 / k).toFixed(0)}"/>`;

      // the playground's lint row (lint-panel.ts): code, message, first hint; then its clean verdict
      const R = { x: E.x + 14, y: codeTop + (typedRow.n + 1) * LH + 2, w: E.w - 28, h: 52 };
      const hint = finding.hints[0];
      const wrapped = wrap(COPY.clean, R.w - 30, { font: "displayReg", size: 11 });
      if (glyphs.measure(finding.message, { font: "displayReg", size: 11 }) > R.w - 26 || glyphs.measure(hint, { font: "displayReg", size: 10.5 }) > R.w - 26) throw new Error(`archlang card: the ${finding.code} row no longer fits the pane`);
      pane +=
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
    const body = first
      .map((_, li) => {
        const sets = frames.map((f) => new Set(f.layers[li].elements));
        const shared = first[li].elements.filter((el) => sets.every((s) => s.has(el)));
        const each = frames.map((f) => {
          const own = f.layers[li].elements.filter((el) => !shared.includes(el));
          return own.length ? outline(group(cut(f.from, f.to), own)) : "";
        });
        return outline(group("", shared)) + each.join("");
      })
      .join("");
    // the sheet is sized for the largest frame, so nothing re-fits while the number moves
    const boxes = frames.map((f) => boxOf(f.layers));
    const x0 = Math.min(...boxes.map((b) => b.x)), y0 = Math.min(...boxes.map((b) => b.y));
    const box = { x: x0, y: y0, w: Math.max(...boxes.map((b) => b.x + b.w)) - x0, h: Math.max(...boxes.map((b) => b.y + b.h)) - y0 };
    sheets.push(sheetGroup(shown([[S, END]]), box, (k) => body + (room ? room(k) : "")));
    const factsSvg = frames.every((f) => f.facts === frames[0].facts) ? footText(frames[0].facts) : frames.map((f) => `<g ${cut(f.from, f.to)}>${footText(f.facts)}</g>`).join("");
    foots.push(`<g ${shown([[S, END]])}>${factsSvg}</g>`);

    const gaps = rows.filter((rw, n) => n && rw.n - rows[n - 1].n > 1).map((rw) => glyphs.text("…", { font: "mono", size: SIZE, x: codeX - 12, y: codeTop + (rw.n - 1) * LH, fill: "#9aa1ad", anchor: "end" }));
    panes.push(header(what, shown([[S, END]])));
    panes.push(
      `<g ${shown([[S, END]])}>` +
        label(scene === SCRUB ? COPY.change : COPY.check) +
        `<g clip-path="url(#ed)">${rows.map((rw) => row(rw.line, codeTop + rw.n * LH, { typed: rw.typed, swap: rw.swap })).join("")}${gaps.join("")}` +
        `<rect x="${E.x + E.w - 34}" y="${codeTop - 14}" width="33" height="${10 * LH}" fill="url(#fade)"/></g>` +
        pane +
        "</g>",
    );
  }

  // ══ 6 · model: the same plan in archlang-3d's own viewer, and its GLB ═══════
  const [MS, ME] = SC.model;
  const manifest = JSON.parse(readFileSync(path.join(FRAMES_DIR, "manifest.json"), "utf8"));
  const pkg3d = JSON.parse(readFileSync(at(ARCHLANG_INPUTS.pkg3d), "utf8")).version;
  if (manifest.planSha !== sha(planSrc) || manifest.archlang3d !== pkg3d)
    throw new Error("archlang card: the 3D frames were rendered from another studio.arch or archlang-3d; run node scripts/cards/archlang-3d-frames.mjs");
  const rise = manifest.frames.filter((f) => f.pass === "rise");
  const turn = manifest.frames.filter((f) => f.pass === "turn");
  const near = (a, b) => ["x", "y", "w", "h"].every((k) => Math.abs(a[k] - b[k]) <= 3);
  if (!rise.length || turn.length < 3 || !near(turn[0].box, turn[turn.length - 1].box))
    throw new Error("archlang card: the 3D turn no longer closes its circle");
  const frames3d = [...rise, ...turn];
  // When each rise frame starts to dissolve in, and when the turn cuts to each of its
  // frames: from rest and back to rest (half linear, half smoothstep) by the end of the scene.
  const ease = (u) => 0.5 * u + 0.5 * u * u * (3 - 2 * u);
  const steps = turn.length - 1;
  const TURN_TO = ME - 0.6;
  const riseAt = rise.map((_, i) => MS + (i * (RISEN - MS)) / rise.length);
  const turnAt = turn.map((_, i) => (i ? TURN_FROM + ease((i - 1) / (steps - 1)) * (TURN_TO - TURN_FROM) : RISEN));
  const mid = (b) => [b.x + b.w / 2, b.y + b.h / 2];
  const [hx, hy] = mid(turn[0].box);
  // the rise's last frame and the turn's first are one view a zoom step apart
  const zoom = turn[0].box.w / rise[rise.length - 1].box.w;
  const [rx, ry] = mid(rise[rise.length - 1].box);
  const at3d = (f) => {
    const s = f.pass === "rise" ? zoom : 1;
    const [ax, ay] = f.pass === "rise" ? [rx, ry] : mid(f.box);
    // frame pixels → card: the anchor lands where turn-00's building centre is
    const x = SHEET.x + (hx - ax * s) / VIEW.scale;
    const y = (hy - ay * s) / VIEW.scale;
    return { x, y, w: (VIEW.w * s), h: (VIEW.h * s) };
  };
  const image = (f, g, attrs = "") =>
    `<image${attrs} mask="url(#soft3d)" x="${g.x.toFixed(1)}" y="${g.y.toFixed(1)}" width="${g.w.toFixed(1)}" height="${g.h.toFixed(1)}" preserveAspectRatio="none" href="data:image/webp;base64,${readFileSync(path.join(FRAMES_DIR, f.file)).toString("base64")}"/>`;
  // The rise keeps one camera, so its frames dissolve one into the next; each is dropped
  // once the next covers it, the last as the turn's first frame (the same view) cuts in.
  const riseSvg = rise
    .map((f, i) => {
      const a = riseAt[i];
      const next = riseAt[i + 1] ?? RISEN;
      const fade = Math.min(0.28, (next - a) * 0.85);
      const drop = i === rise.length - 1 ? next + 0.05 : next + fade + 0.02;
      return image(f, at3d(f), ` class="${rule(`0%,${p(a)}{opacity:0}${p(a + fade)},${p(drop - 0.01)}{opacity:1}${p(drop)},100%{opacity:0}`)}" opacity="0"`);
    })
    .join("");
  // The turn is a filmstrip: every frame in one column, PITCH apart so no neighbour shows
  // through the sheet, the column cut from frame to frame (no dissolve, so no double image).
  const PITCH = VIEW.h + 80;
  const lift = (i) => `transform:translateY(${-i * PITCH}px)`;
  const stripBody =
    turnAt.map((t, i) => `${i ? p(t) : "0%"}{${lift(i)};animation-timing-function:step-end}`).join("") + `100%{${lift(steps)}}`;
  const turnSvg =
    `<g ${cut(RISEN, T)}><g class="${rule(stripBody, `${lift(steps)};`)}">` +
    turn.map((f, i) => {
      const g = at3d(f);
      return image(f, { ...g, y: g.y + i * PITCH });
    }).join("") +
    "</g></g>";
  // Over the stepped turn, one continuous eased move, as the feed's swipes run over the
  // footage on the GAVIGO card: the camera closes in on the building while it turns.
  const PUSH = 1.06;
  const [ox, oy] = [SHEET.x + hx / VIEW.scale, hy / VIEW.scale];
  const push = rule(
    `0%,${p(TURN_FROM - 0.2)}{transform:scale(1);animation-timing-function:cubic-bezier(.45,0,.4,1)}${p(TURN_TO + 0.3)},100%{transform:scale(${PUSH})}`,
    `transform-box:view-box;transform-origin:${ox.toFixed(1)}px ${oy.toFixed(1)}px;transform:scale(${PUSH});`,
  );
  const images = [`<g class="${push}">${riseSvg}${turnSvg}</g>`];
  // A frame's edges fade into the paper, so a shifted or scaled frame never shows its border.
  const EDGE = 0.07;
  defs.push(
    `<linearGradient id="soft3dx"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${EDGE}" stop-color="#fff"/><stop offset="${1 - EDGE}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
    `<linearGradient id="soft3dy" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${EDGE * 1.4}" stop-color="#fff"/><stop offset="${1 - EDGE * 1.4}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
    `<mask id="soft3dv" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#soft3dy)"/></mask>`,
    `<mask id="soft3d" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#soft3dx)" mask="url(#soft3dv)"/></mask>`,
  );
  // The playground's Plan | 3D switch over the stage (chrome.css .stage-switch), pressed to 3D.
  const SW_FONT = { font: "displayMid", size: 11, tracking: 0.07 };
  const btnW = COPY.views.map((v) => Math.max(44, Math.ceil(glyphs.measure(v.toUpperCase(), SW_FONT)) + 20));
  const SW = { x: SHEET.x + 10, y: 10, pad: 3, gap: 2, h: 26 };
  const swW = SW.pad * 2 + btnW.reduce((a, w) => a + w, 0) + SW.gap;
  const PRESS = MS + 0.3;
  let bx = SW.x + SW.pad;
  const switchSvg =
    `<rect x="${SW.x}" y="${SW.y + 1}" width="${swW}" height="${SW.h + SW.pad * 2}" rx="3" fill="#1c2430" fill-opacity=".06"/>` +
    `<rect x="${SW.x + 0.5}" y="${SW.y + 0.5}" width="${swW - 1}" height="${SW.h + SW.pad * 2 - 1}" rx="3" fill="${SHEET_T.panel}" fill-opacity=".92" stroke="${SHEET_T.hairline}"/>` +
    COPY.views
      .map((v, n) => {
        const w = btnW[n];
        const tx = bx + (w - glyphs.measure(v.toUpperCase(), SW_FONT)) / 2;
        const ty = SW.y + SW.pad + 17.5;
        const pressed = n === 0 ? `class="${rule(`0%,${p(PRESS)}{opacity:1}${p(PRESS + 0.15)},100%{opacity:0}`)}" opacity="0"` : on(PRESS, 0.15);
        const out =
          glyphs.text(v.toUpperCase(), { ...SW_FONT, x: tx, y: ty, fill: SHEET_T.ink }) +
          `<g ${pressed}><rect x="${bx}" y="${SW.y + SW.pad}" width="${w}" height="${SW.h}" rx="2" fill="${SHEET_T.ink}"/>` +
          glyphs.text(v.toUpperCase(), { ...SW_FONT, x: tx, y: ty, fill: "#f5f2ea" }) +
          "</g>";
        bx += w + SW.gap;
        return out;
      })
      .join("");
  sheets.push(
    `<g ${shown([[MS, T]])} clip-path="url(#sheet)"><rect x="${SHEET.x}" y="0" width="${SHEET.w}" height="${footY}" fill="${frames3d[0].box.ground}"/>${images.join("")}</g>` +
      `<g ${shown([[MS, T]], 0.2)}>${switchSvg}</g>`,
  );
  foots.push(`<g ${shown([[MS, T]])}>${footText(COPY.riseFoot)}</g>`);

  // The pane: the package's CLI writes the GLB of the same file and checks it.
  const glbName = `${PAIR}.glb`;
  const cliArgs = [at(ARCHLANG_INPUTS.cli3d), "build", at(ARCHLANG_INPUTS.plan), "-o", glbName];
  const ran = spawnSync(process.execPath, cliArgs, { cwd: tmpdir(), encoding: "utf8" });
  const said = `${ran.stdout}${ran.stderr}`.trim();
  const report = JSON.parse(execFileSync(process.execPath, [...cliArgs, "--json"], { cwd: tmpdir(), encoding: "utf8" }));
  const wrote = said.match(new RegExp(`^(archlang3d: wrote ${glbName.replace(".", "\\.")}) (\\(\\d+ bytes, (\\d+) checks passed\\))$`));
  if (!wrote || !report.ok || report.verify.failed !== 0 || Number(wrote[3]) !== report.verify.passed)
    throw new Error(`archlang card: archlang3d build no longer reports what the pane quotes: ${said}`);
  const results = report.verify.results;
  if (results.some((r) => !r.ok || !COPY.checks[r.id])) throw new Error("archlang card: archlang3d build reports a check the pane has no words for");
  const command = [["$ ", SRC.muted], ["archlang3d", PLUM_DEEP], [" build", SYN.property], [` ${planFile} -o ${glbName}`, SRC.fg]];
  const cmdText = command.map(([s]) => s).join("");
  const CX = E.x + 16;
  const TYPE3 = [MS + 0.35, MS + 1.35];
  const cmdW = (cmdText.length * ADV + 4).toFixed(1);
  const cmdCover = rule(
    `0%,${p(TYPE3[0])}{transform:translateX(0);animation-timing-function:steps(${cmdText.length},end)}${p(TYPE3[1])},100%{transform:translateX(${cmdW}px)}`,
    `transform:translateX(${cmdW}px);`,
  );
  let cmdX = CX;
  const cmdSvg = command
    .map(([s, fill]) => {
      const out = mono(s, cmdX, codeTop, fill);
      cmdX += s.length * ADV;
      return out;
    })
    .join("");
  const OUT_AT = TYPE3[1] + 0.3;
  const CHECK_AT = OUT_AT + 0.45;
  const checkY = (n) => codeTop + 3 * LH + 14 + n * (LH + 3);
  const idW = Math.max(...results.map((r) => r.id.length)) + 2;
  panes.push(header(planFile, shown([SC.model])));
  panes.push(
    `<g ${shown([SC.model])}>` +
      label(COPY.rise) +
      `<g clip-path="url(#ed)">${cmdSvg}<rect class="${cmdCover}" x="${CX - 1}" y="${codeTop - 13}" width="${E.w - 20}" height="${LH}" fill="${SRC.surface}"/></g>` +
      `<g ${on(OUT_AT, 0.2)}>${mono(wrote[1], CX, codeTop + LH + 4, SRC.muted)}${mono(wrote[2], CX, codeTop + 2 * LH + 4, SRC.muted)}</g>` +
      `<path ${on(CHECK_AT - 0.1, 0.2)} d="M${CX} ${checkY(0) - 17}h${E.w - 32}" stroke="${SRC.rule}" stroke-opacity=".35"/>` +
      results
        .map(
          (r, n) =>
            `<g ${on(CHECK_AT + n * 0.3, 0.2)}>` +
            glyphs.text("✓", { font: "symbols", size: 11, x: CX, y: checkY(n), fill: OK }) +
            mono(r.id, CX + 16, checkY(n), SRC.fg) +
            glyphs.text(COPY.checks[r.id](r.facts ?? {}), { font: "displayReg", size: 11.5, x: CX + 16 + idW * ADV, y: checkY(n), fill: SRC.muted }) +
            "</g>",
        )
        .join("") +
      "</g>",
  );
  if (CX + 16 + idW * ADV + Math.max(...results.map((r) => glyphs.measure(COPY.checks[r.id](r.facts ?? {}), { font: "displayReg", size: 11.5 }))) > E.x + E.w - 10)
    throw new Error("archlang card: a check row no longer fits the pane");

  // which scene is up: a row of ticks in the pane's header
  const tickX = (i) => E.x + E.w - 16 - (ORDER.length - i) * 13;
  const ticks =
    ORDER.map((_, i) => `<rect x="${tickX(i)}" y="${E.y + 14}" width="10" height="3" fill="${SRC.rule}" opacity=".35"/>`).join("") +
    ORDER.map((s, i) => `<rect ${shown([SC[s]], 0.15)} x="${tickX(i)}" y="${E.y + 14}" width="10" height="3" fill="${PLUM}"/>`).join("");

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
  if (40 + glyphs.measure(COPY.identity, HEAD) > E.x - 24) throw new Error("archlang card: the headline no longer fits the identity panel");
  const identity = [
    glyphs.text("OPEN-SOURCE LANGUAGE", { font: "mono", size: 11.5, x: 40, y: 56, fill: SRC.muted, tracking: 0.16 }),
    `<g transform="translate(38 86) scale(${WM})">${mark}${word}</g>`,
    glyphs.text(COPY.identity, { ...HEAD, x: 40, y: 206, fill: SHEET_T.ink }),
  ];
  // a drawing's title block, the way the site signs its pages
  const CELL = { font: "displayMid", size: 13.5 };
  const cells = [["LICENSE", "MIT"], ["DOCS", "archlang.uk"], ["PLAYGROUND", "playground.archlang.uk"]].map(([l, v]) => [l, v, Math.ceil(Math.max(glyphs.measure(v, CELL), glyphs.measure(l, { font: "mono", size: 9, tracking: 0.14 }))) + 26]);
  const TB = { y: 284, h: 48 };
  const tbW = cells.reduce((a, c) => a + c[2], 0);
  if (40 + tbW > E.x - 12) throw new Error("archlang card: the title block no longer fits the identity panel");
  let cx = 40;
  identity.push(`<rect x="40" y="${TB.y}" width="${tbW}" height="${TB.h}" fill="none" stroke="${SRC.rule}" stroke-opacity=".55"/>`);
  cells.forEach(([lab, value, w], n) => {
    if (n) identity.push(`<path d="M${cx} ${TB.y}v${TB.h}" stroke="${SRC.rule}" stroke-opacity=".55"/>`);
    identity.push(glyphs.text(lab, { font: "mono", size: 9, x: cx + 12, y: TB.y + 18, fill: SRC.muted, tracking: 0.14 }));
    identity.push(glyphs.text(value, { ...CELL, x: cx + 12, y: TB.y + 37, fill: lab === "LICENSE" ? SHEET_T.ink : PLUM_DEEP }));
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
    foots.join("") +
    // the compile seam: a solid plum rule, never a glow
    `<rect x="${SEAM - 1}" width="2" height="360" fill="${PLUM}"/>`;

  const css = `[class]{animation:${T}s linear infinite}` + [...rules.values()].map((x) => `@keyframes ${x.name}{${x.frames}}.${x.name}{${x.base}animation-name:${x.name}}`).join("");

  return {
    svg: card({
      title: `ArchLang is an open-source language that compiles plain-text source into floor plans. The card shows a brief given to ${model} and the ArchLang it wrote compiling into a dimensioned plan: ${tot.rooms} rooms${tot.net_floor_area_m2 !== undefined ? `, ${tot.net_floor_area_m2} m² net` : tot.floor_area_m2 !== undefined ? `, ${tot.floor_area_m2} m²` : ""}. Then one number is changed and the plan redraws, and a lint finding is raised and cleared. Last, the stage switches to 3D: the same source rises in the archlang-3d viewer and turns a full circle so every room can be seen from inside, while its command line writes the GLB and passes ${report.verify.passed} checks. Output: SVG, PDF, DXF, PNG, GLB.`,
      css,
      defs: `${relativeGlyphs(glyphs.defs())}${[...alias.values()].map((a) => `<use id="${a.id}" href="#${a.glyph}" transform="scale(${COL} ${-COL})"/>`).join("")}${defs.join("")}`,
      body,
      radius: 10,
    }),
    facts: { pair: `${PAIR} (${model})`, rows: planRows.length, frames3d: `${rise.length} rise + ${turn.length} turn (archlang-3d ${pkg3d})`, scenes: ORDER.map((s) => `${s} ${SC[s][0]}–${SC[s][1]}s`).join(", "), loop: `${T}s` },
  };
}
