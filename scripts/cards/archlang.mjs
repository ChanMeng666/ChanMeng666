// ArchLang card, drawn in ArchLang's own design system ("The Compile Boundary",
// archlang/brand/README.md): ONE LIGHT WORLD split by a solid plum seam. Left of
// it is the cool SOURCE world (identity + the code), right of it the warm SHEET
// world (drafting paper + the compiled drawing). No dark surface, no pills, and
// redline is not used because nothing here asks for attention.
//
// The stage walks through the capability sheets of archlang.uk (A-101 … A-108,
// then A-201 "Reads its own plans"), with the site's own tags and titles.
//
// Nothing on the sheet is drawn by hand. Each scene is an example plan shipped
// inside the npm package (@chanmeng666/archlang/examples), compiled by the real
// compiler at build time; the build fails if one reports an error. The code
// beside a drawing is an excerpt of that same file, and the facts on A-201 are
// what describe() and lint() return for it.
import { readFileSync } from "node:fs";
import { compile, describe, lint } from "@chanmeng666/archlang";

import { outlineTextElements } from "../lib/svg-card/glyphs.mjs";
import { card, pct } from "../lib/svg-card/shell.mjs";

export const ARCHLANG_FONTS = {
  display: "scripts/cards/fonts/archlang/Archivo-700.ttf",
  displayMid: "scripts/cards/fonts/archlang/Archivo-600.ttf",
  displayReg: "scripts/cards/fonts/archlang/Archivo-400.ttf",
  body: "scripts/cards/fonts/archlang/PublicSans-400.ttf",
  bodyBold: "scripts/cards/fonts/archlang/PublicSans-600.ttf",
  mono: "scripts/cards/fonts/archlang/IBMPlexMono-400.ttf",
  symbols: "cv/fonts/JetBrainsMono-Regular.ttf", // only for a glyph Archivo lacks (φ on a diameter)
};

// no/tag/title  the sheet as archlang.uk names it (docs-site/.vitepress/theme/SheetGrid.vue)
// excerpt       [first-line pattern, statement lines to take], from the plan's own source
// view          "x" | "y": the drawing travels across the sheet · "fit": it sits whole ·
//               "sheet": the whole issued sheet (title block, schedule, axes, dimensions)
// dims          keep the dimension layer on a plan view
const SCENES = [
  {
    no: "A-101", tag: "Showpiece", title: "The whole language on one sheet",
    file: "hillside-villa", view: "x",
    excerpt: [[/^\s*paper A2/, 1], [/site \{ street/, 1], [/furniture rug /, 2], [/furniture piano/, 1], [/furniture car /, 2]],
  },
  {
    no: "A-103", tag: "The sheet", title: "It issues a sheet, not a picture",
    file: "aquarium", view: "sheet",
    excerpt: [[/^\s*paper A2/, 2], [/^\s*dims auto all/, 2], [/^\s*axes \{/, 3]],
  },
  {
    no: "A-104", tag: "Geometry", title: "Not only rectangles",
    file: "hexagon-pavilion", view: "fit", dims: true,
    excerpt: [[/wall id=drum/, 5], [/room id=rotunda circle/, 2]],
  },
  {
    no: "A-105", tag: "Site", title: "Everything outside the wall line",
    file: "garden-house", view: "y",
    excerpt: [[/outdoor id=g_patio/, 4], [/furniture outdoor_table/, 3]],
  },
  {
    no: "A-106", tag: "Fixtures", title: "Symbols, not labelled boxes",
    file: "furnished-flat", view: "y",
    excerpt: [[/furniture sofa_l/, 3], [/furniture piano/, 2], [/furniture counter/, 2]],
  },
  {
    no: "A-107", tag: "Composition", title: "Write the unit, place the row",
    file: "terrace-row", view: "fit",
    excerpt: [[/^\s*component unit\(/, 1], [/^\s*place unit\(W1/, 4], [/^\s*theme blueprint/, 1]],
  },
  {
    no: "A-108", tag: "Materials", title: "Poché is the specification",
    file: "materials", view: "x",
    excerpt: [[/wall id=w_north/, 4], [/wall id=p_wc_w/, 1], [/^\s*legend/, 1]],
  },
  {
    no: "A-201", tag: "describe() & lint", title: "Reads its own plans",
    file: "garden-loft", view: "fit", facts: true,
  },
];

// On a plan view: the compiler layers kept, and the beat each arrives on. The
// schedule, legend, grid, title block, north arrow and scale bar belong to the
// issued sheet, which is what the "sheet" view is for.
const BEAT = {
  "A-FLOR": 0, "L-SITE": 0, "C-PROP": 0,
  "A-WALL": 1, "A-FLOR-STRS": 1, "A-FLOR-EVTR": 1, "A-GRID": 1,
  "A-DOOR": 2, "A-GLAZ": 2,
  "L-PLNT": 3, "A-FURN": 3,
  "A-ANNO-TEXT": 4, "A-ANNO-DIMS": 4, "A-ANNO": 4,
};
const SHEET_ONLY = new Set(["A-ANNO", "A-GRID"]);
const EXTENT = new Set(["A-FLOR", "L-SITE", "C-PROP", "A-WALL", "A-ANNO-DIMS"]);

// The Compile Boundary tokens (archlang/playground/src/styles/tokens.css).
const SRC = { bg: "#eceef2", surface: "#fbfbfc", fg: "#1a1d23", muted: "#5a616e", border: "rgba(0,0,0,.12)", rule: "#7f858f" };
const SHEET_T = { paper: "#f5f2ea", panel: "#fbfaf5", ink: "#1c2430", muted: "#5b6470", hairline: "#cfc9bb", grid: "rgba(28,36,48,.07)" };
const PLUM = "#8052ff"; // graphics only
const PLUM_DEEP = "#6b3ae0"; // plum as text
const PLUM_LIGHT_SURFACE = "#6a3df0"; // the mark on a light ground
const OK = "#2e7d32";
const SYN = { keyword: "#6b3ae0", property: "#14602a", atom: "#0b57d0", number: "#0f6f7a", string: "#8a5a00", comment: "#5a616e", operator: "#464d59", name: SRC.fg };
const PROPERTIES = new Set(["at", "size", "label", "width", "thickness", "offset", "close", "x", "in", "rotate", "radius", "against", "as", "mirror", "uses", "circle", "arc", "material", "scale", "angle", "street", "hemisphere"]);
const ATOMS = new Set(["exterior", "partition", "north", "south", "east", "west", "landscape", "portrait", "auto", "all", "rooms", "blueprint", "concrete", "brick", "insulation", "tile", "none", "A2", "A3"]);

function tokenize(line, js) {
  const out = [];
  let col = 0;
  let first = true;
  const re = js ? /\s+|\/\/.*$|"[^"]*"|\d+(?:\.\d+)?|[A-Za-z_]\w*|=>|./g : /\s+|"[^"]*"|\d+(?:\.\d+)?|[A-Za-z_]\w*|./g;
  for (const [text] of line.matchAll(re)) {
    if (text.trim()) {
      let kind = "operator";
      if (text.startsWith("//")) kind = "comment";
      else if (text[0] === '"') kind = "string";
      else if (/^\d/.test(text)) kind = "number";
      else if (/^[A-Za-z_]/.test(text)) {
        if (js) kind = text === "const" ? "keyword" : text === "describe" || text === "lint" ? "atom" : "name";
        else kind = first ? "keyword" : PROPERTIES.has(text) ? "property" : ATOMS.has(text) ? "atom" : "name";
      }
      out.push({ text, col, kind });
      first = false;
    }
    col += text.length;
  }
  return out;
}

// Statement lines of the source starting at the first match of each pattern,
// with comments and blank lines skipped and the common indent removed.
function excerptOf(source, parts, file) {
  const all = source.split("\n");
  const out = [];
  for (const [pattern, count] of parts) {
    const at = all.findIndex((l) => pattern.test(l));
    if (at < 0) throw new Error(`archlang card: ${file}.arch no longer has a line matching ${pattern}`);
    const taken = [];
    for (let i = at; i < all.length && taken.length < count; i++) {
      const code = all[i].replace(/\s+#.*$/, "").replace(/\s+$/, "");
      if (code.trim() && !code.trim().startsWith("#")) taken.push(code);
    }
    const indent = Math.min(...taken.map((l) => l.match(/^\s*/)[0].length));
    out.push(...taken.map((l) => l.slice(indent).replace(/ {2,}/g, " ")));
  }
  return out;
}

// What the plan says about itself, as the calls an agent would make.
function factsOf(source, file) {
  const d = describe(source);
  const warnings = lint(source);
  if (!d.ok || !Array.isArray(warnings)) throw new Error(`archlang card: describe()/lint() changed shape for ${file}.arch`);
  return [
    "const facts = describe(source)",
    `facts.totals.floor_area_m2 // ${d.totals.floor_area_m2}`,
    "facts.rooms.map(r => r.area_m2)",
    `// [${d.rooms.map((r) => r.area_m2).join(", ")}]`,
    "facts.doors[0].between",
    `// [${d.doors[0].between.map((b) => `"${b}"`).join(", ")}]`,
    `lint(source).length // ${warnings.length}`,
  ];
}

function compileScene(scene, index, examples) {
  const source = readFileSync(`${examples}/${scene.file}.arch`, "utf8");
  const res = compile(source);
  if (res.errors.length) throw new Error(`archlang card: ${scene.file}.arch does not compile: ${JSON.stringify(res.errors[0])}`);
  const facts = describe(source);
  // ids are per-file ("poche" exists in every plan, in each plan's own colours)
  const svg = res.svg.replace(/\bid="([^"]+)"/g, `id="s${index}-$1"`).replace(/url\(#([^)]+)\)/g, `url(#s${index}-$1)`);

  const defs = svg.match(/<defs>([\s\S]*?)<\/defs>/)[1].trim();
  const ground = svg.match(/<\/defs>\s*<rect\b[^>]*\bfill="([^"]+)"/);
  const themed = ground && ground[1].toLowerCase() !== "#ffffff";
  const layers = [...svg.matchAll(/<g\b([^>]*)>([\s\S]*?)<\/g>/g)].map(([, attrs, body]) => {
    if (body.includes("<g")) throw new Error("archlang card: nested group in compiler output; the layer splitter needs updating");
    return { id: ((attrs.match(/\bid="s\d+-([^"]+)"/) || [])[1]) || null, body };
  });

  let kept;
  let box;
  if (scene.view === "sheet") {
    kept = layers; // everything the compiler issued
    const [x, y, w, h] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    box = { x, y, w, h };
  } else {
    kept = layers.filter((l) => l.id in BEAT && !SHEET_ONLY.has(l.id) && (l.id !== "A-ANNO-DIMS" || scene.dims));
    // extent of the drawing, from the straight geometry of the layers that bound it
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const grow = (x, y) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); };
    for (const l of kept.filter((k) => EXTENT.has(k.id))) {
      for (const [, pts] of l.body.matchAll(/\bpoints="([^"]+)"/g)) for (const pt of pts.trim().split(/\s+/)) grow(...pt.split(",").map(Number));
      for (const [, d] of l.body.matchAll(/\bd="([^"]+)"/g)) for (const [, x, y] of d.matchAll(/[ML]\s*(-?[\d.]+)[ ,](-?[\d.]+)/g)) grow(Number(x), Number(y));
      for (const [, a, b, c, e] of l.body.matchAll(/<line x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)"/g)) { grow(Number(a), Number(b)); grow(Number(c), Number(e)); }
    }
    box = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  return {
    ...scene,
    defs,
    ground: themed ? ground[1] : null, // a themed plan brings its own ground
    kept,
    box,
    code: scene.facts ? factsOf(source, scene.file) : excerptOf(source, scene.excerpt, scene.file),
    caption: `${facts.plan.toUpperCase()} · ${scene.no}${facts.scale ? ` · SCALE ${facts.scale}` : ""}`,
  };
}

export function buildArchlangCard({ glyphs, root }) {
  const examples = `${root}/node_modules/@chanmeng666/archlang/examples`;
  const scenes = SCENES.map((s, i) => compileScene(s, i, examples));

  // ── Timeline ───────────────────────────────────────────────────────────────
  // Every keyframe is written relative to the start of ONE scene; scene i runs
  // the same animations shifted by a negative delay, so the CSS is shared.
  const D = 5.6; // seconds a scene holds the sheet
  const T = D * scenes.length;
  const p = (t) => pct(t, T, 3);
  const delay = (i) => `animation-delay:${(i * D - T).toFixed(2)}s`;
  const IN = 0.35;
  const OUT = D - 0.45;
  const BEAT_AT = (b) => 0.25 + b * 0.28;
  const LINE_AT = (i) => 0.3 + i * 0.17;
  const css = [];

  css.push(`@keyframes sc{0%{opacity:0}${p(IN)},${p(OUT)}{opacity:1}${p(D)},100%{opacity:0}}.sc{animation:sc ${T}s linear infinite}`);
  for (let b = 0; b <= 4; b++) {
    css.push(`@keyframes b${b}{0%,${p(BEAT_AT(b))}{opacity:0}${p(BEAT_AT(b) + 0.4)},100%{opacity:1}}.b${b}{animation:b${b} ${T}s linear infinite}`);
  }

  // ── Layout ─────────────────────────────────────────────────────────────────
  const SEAM = 808;
  const E = { x: 488, y: 28, w: 302, h: 304, head: 30 };
  const SHEET = { x: SEAM, y: 0, w: 1300 - SEAM, h: 360, foot: 32, margin: 20 };
  const footY = SHEET.h - SHEET.foot;
  const SIZE = 9.6;
  const ADV = (glyphs.font("mono").charToGlyph("0").advanceWidth / glyphs.font("mono").unitsPerEm) * SIZE;
  const LH = 18.5;
  const codeX = E.x + 34;
  const codeTop = E.y + E.head + 80;
  const maxLines = Math.max(...scenes.map((s) => s.code.length));

  // a cover the colour of the page slides off each row; shared by every scene
  for (let i = 0; i < maxLines; i++) {
    const a = LINE_AT(i);
    css.push(
      `@keyframes c${i}{0%,${p(a)}{transform:translateX(0);animation-timing-function:steps(24,end)}` +
        `${p(a + 0.42)},${p(D - 0.01)}{transform:translateX(${E.w}px)}${p(D)},100%{transform:translateX(0)}}` +
        `.c${i}{transform:translateX(${E.w}px);animation:c${i} ${T}s linear infinite}`,
    );
  }

  // the fine drafting grid of the sheet world
  let grid = "";
  for (let x = SHEET.x + 24; x < 1300; x += 24) grid += `M${x} 0V${footY}`;
  for (let y = 24; y < footY; y += 24) grid += `M${SHEET.x} ${y}H1300`;

  const defs = [
    `<clipPath id="ed"><rect x="${E.x + 1}" y="${E.y + E.head + 1}" width="${E.w - 2}" height="${E.h - E.head - 2}"/></clipPath>`,
    `<clipPath id="sheet"><rect x="${SHEET.x}" y="${SHEET.y}" width="${SHEET.w}" height="${footY}"/></clipPath>`,
    `<path id="grid" d="${grid}" stroke="${SHEET_T.grid}" fill="none"/>`,
    // long statements run off the pane; they fade out rather than stop dead
    `<linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="${SRC.surface}" stop-opacity="0"/><stop offset="1" stop-color="${SRC.surface}"/></linearGradient>`,
  ];

  const sheets = [];
  const panes = [];
  scenes.forEach((s, i) => {
    const hidden = i === 0 ? "" : ' opacity="0"'; // the still frame is scene one
    defs.push(s.defs);

    // ── the drawing ──────────────────────────────────────────────────────────
    const m = SHEET.margin;
    const availW = SHEET.w - m * 2;
    const availH = footY - m * 2;
    let k, tx, ty, dx = 0, dy = 0;
    if (s.view === "x") {
      k = availH / s.box.h;
      const overflow = Math.max(0, s.box.w * k - availW);
      tx = SHEET.x + m + (overflow ? 0 : (availW - s.box.w * k) / 2);
      ty = SHEET.y + m;
      dx = -overflow;
    } else if (s.view === "y") {
      k = availW / s.box.w;
      const overflow = Math.max(0, s.box.h * k - availH);
      tx = SHEET.x + m;
      ty = SHEET.y + m - overflow; // open on the far end, then travel back up the plan
      dy = overflow;
    } else {
      k = Math.min(availW / s.box.w, availH / s.box.h);
      tx = SHEET.x + m + (availW - s.box.w * k) / 2;
      ty = SHEET.y + m + (availH - s.box.h * k) / 2;
    }
    let move = "";
    if (dx || dy) {
      css.push(
        `@keyframes m${i}{0%,${p(1.3)}{transform:translate(0,0);animation-timing-function:cubic-bezier(.45,0,.3,1)}` +
          `${p(OUT - 0.1)},100%{transform:translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)}}.m${i}{animation:m${i} ${T}s linear infinite}`,
      );
      move = ` class="m${i}" style="${delay(i)}"`;
    }
    const layers = s.kept
      .map((l) => `<g class="b${l.id in BEAT ? BEAT[l.id] : 4}" style="${delay(i)}">${outlineTextElements(l.body, glyphs, { regular: "displayReg", bold: "displayMid", fallback: "symbols" })}</g>`)
      .join("");
    // the issued sheet is a piece of paper lying on the drafting table
    const leaf = s.view === "sheet"
      ? `<rect x="${s.box.x}" y="${s.box.y}" width="${s.box.w}" height="${s.box.h}" fill="${SHEET_T.panel}" stroke="${SHEET_T.hairline}" stroke-width="${(1 / k).toFixed(1)}"/>`
      : "";
    const ground = s.ground
      ? `<rect x="${SHEET.x}" y="${SHEET.y}" width="${SHEET.w}" height="${footY}" fill="${s.ground}"/>`
      : `<rect x="${SHEET.x}" y="${SHEET.y}" width="${SHEET.w}" height="${footY}" fill="${SHEET_T.paper}"/><use href="#grid"/>`;
    const capW = glyphs.measure("0 errors", { font: "mono", size: 10 });
    sheets.push(
      `<g class="sc" style="${delay(i)}"${hidden}>${ground}` +
        `<g clip-path="url(#sheet)"><g${move}><g transform="translate(${(tx - s.box.x * k).toFixed(2)} ${(ty - s.box.y * k).toFixed(2)}) scale(${k.toFixed(5)})">${leaf}${layers}</g></g></g>` +
        // the caption strip of the sheet, as the site titles its figures
        glyphs.text(s.caption, { font: "mono", size: 10, x: SHEET.x + 18, y: footY + 20, fill: SHEET_T.ink, tracking: 0.06 }) +
        `<rect x="${(1300 - 18 - capW - 12).toFixed(1)}" y="${footY + 13}" width="6" height="6" fill="${OK}"/>` +
        glyphs.text("0 errors", { font: "mono", size: 10, x: 1300 - 18, y: footY + 20, fill: SHEET_T.muted, anchor: "end" }) +
        "</g>",
    );

    // ── its source ───────────────────────────────────────────────────────────
    const pane = [
      glyphs.text(s.facts ? `${s.file}.arch · facts` : `${s.file}.arch`, { font: "mono", size: 10.5, x: E.x + 16, y: E.y + 19.5, fill: SRC.muted }),
      glyphs.text(`${s.no} · ${s.tag.toUpperCase()}`, { font: "mono", size: 10, x: E.x + 16, y: E.y + E.head + 26, fill: PLUM_DEEP, tracking: 0.1 }),
      glyphs.text(s.title, { font: "displayMid", size: 16.5, x: E.x + 16, y: E.y + E.head + 50, fill: SRC.fg }),
    ];
    const code = [];
    const covers = [];
    s.code.forEach((line, n) => {
      const y = codeTop + n * LH;
      code.push(glyphs.text(String(n + 1), { font: "mono", size: SIZE, x: E.x + 24, y, fill: "#9aa1ad", anchor: "end" }));
      for (const tok of tokenize(line, s.facts)) {
        if (codeX + tok.col * ADV > E.x + E.w) continue; // past the pane's edge
        code.push(glyphs.text(tok.text, { font: "mono", size: SIZE, x: codeX + tok.col * ADV, y, fill: SYN[tok.kind] }));
      }
      covers.push(`<rect class="c${n}" style="${delay(i)}" x="${(codeX - 1).toFixed(1)}" y="${(y - 13).toFixed(1)}" width="${E.w}" height="${LH}" fill="${SRC.surface}"/>`);
    });
    pane.push(`<g clip-path="url(#ed)">${code.join("")}${covers.join("")}<rect x="${E.x + E.w - 40}" y="${codeTop - 14}" width="39" height="${maxLines * LH + 4}" fill="url(#fade)"/></g>`);
    // which sheet of the set is up
    const tickX = E.x + E.w - 16 - (scenes.length - i) * 12;
    pane.push(`<rect x="${tickX}" y="${E.y + 14}" width="9" height="3" fill="${PLUM}"/>`);
    panes.push(`<g class="sc" style="${delay(i)}"${hidden}>${pane.join("")}</g>`);
  });

  const ticks = scenes.map((_, i) => `<rect x="${E.x + E.w - 16 - (scenes.length - i) * 12}" y="${E.y + 14}" width="9" height="3" fill="${SRC.rule}" opacity=".35"/>`).join("");

  // ── Identity, on the source world's own ground ─────────────────────────────
  // The wordmark is the brand lockup, recoloured only (the mark's geometry law).
  const lockup = readFileSync(`${root}/public/brands/archlang-wordmark-black.svg`, "utf8");
  const inner = lockup.match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1];
  const markEnd = inner.indexOf("</g></g>") + 8;
  if (markEnd < 8) throw new Error("archlang card: the wordmark lockup changed shape");
  const mark = inner.slice(0, markEnd).replace('fill="#111111"', `fill="${PLUM_LIGHT_SURFACE}"`);
  const word = inner.slice(markEnd).replace(/#111111/g, SHEET_T.ink);
  const WM = 0.2; // 1420×198 → 284×39.6
  const identity = [
    glyphs.text("OPEN-SOURCE LANGUAGE", { font: "mono", size: 10.5, x: 40, y: 50, fill: SRC.muted, tracking: 0.16 }),
    `<g transform="translate(38 76) scale(${WM})">${mark}${word}</g>`,
    glyphs.text("Floor plans as code.", { font: "display", size: 34, x: 40, y: 184, fill: SHEET_T.ink }),
    `<rect x="40" y="204" width="56" height="1.5" fill="${SRC.rule}"/>`,
    glyphs.text("Text in, a precise architectural drawing out.", { font: "body", size: 15, x: 40, y: 234, fill: SRC.muted }),
    glyphs.text("Compiled, linted and measured from one source.", { font: "body", size: 15, x: 40, y: 256, fill: SRC.muted }),
  ];
  // a drawing's title block, the way the site signs its pages
  const cells = [["LICENSE", "MIT", 96], ["OUTPUT", "SVG · DXF · PDF", 170], ["DOCS", "archlang.uk", 142]];
  let cx = 40;
  const TB = { y: 290, h: 42 };
  identity.push(`<rect x="40" y="${TB.y}" width="${cells.reduce((a, c) => a + c[2], 0)}" height="${TB.h}" fill="none" stroke="${SRC.rule}" stroke-opacity=".55"/>`);
  cells.forEach(([label, value, w], n) => {
    if (n) identity.push(`<path d="M${cx} ${TB.y}v${TB.h}" stroke="${SRC.rule}" stroke-opacity=".55"/>`);
    identity.push(glyphs.text(label, { font: "mono", size: 8.5, x: cx + 11, y: TB.y + 15, fill: SRC.muted, tracking: 0.14 }));
    identity.push(glyphs.text(value, { font: "bodyBold", size: 12.5, x: cx + 11, y: TB.y + 32, fill: label === "DOCS" ? PLUM_DEEP : SHEET_T.ink }));
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
    sheets.join("") +
    `<path d="M${SHEET.x} ${footY + 0.5}h${SHEET.w}" stroke="${SHEET_T.hairline}"/>` +
    // the compile seam: a solid plum rule, never a glow
    `<rect x="${SEAM - 1}" width="2" height="360" fill="${PLUM}"/>`;

  return {
    svg: card({
      title: "ArchLang: floor plans as code. Text in, a precise architectural drawing out; compiled, linted and measured from one source.",
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body,
      radius: 10,
    }),
    facts: { scenes: scenes.map((s) => `${s.no} ${s.file}`).join(", "), loop: `${T.toFixed(1)}s` },
  };
}
