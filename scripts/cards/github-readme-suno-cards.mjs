// Github README Suno Cards card ("Suno Cards" is what the product calls itself).
// The product turns a Suno song into an animated SVG card for a GitHub README,
// styled by a few URL parameters. The stage is the product's own builder page
// at work: the Layout, Preset and Theme controls are clicked, an accent colour
// is typed, and after each choice the preview shows the card the renderer
// really produces for it while the embed URL follows.
//
// It is drawn in the product site's own design system (apps/web): the
// monochrome tokens of globals.css (read and converted from oklch at build
// time), Fraunces, Plus Jakarta Sans and JetBrains Mono as layout.tsx loads
// them, the glass pill, the segmented control, the colour row, the tab pills
// and the code block as the components draw them, and the navbar's own lockup
// (LogoMark.tsx, "Suno Cards", "README") as the wordmark.
//
// Nothing on the stage is drawn from imagination:
//   - every song card is the output of the product's own renderer, RUN at
//     build time (packages/render, renderSingleSongSvg) on the product's own
//     test fixture of its demo song, parsed by its own parser (mapClipToSong).
//     The output is then made safe for <img>: shapes are kept as they are, the
//     stylesheet's classes are resolved to the colours that output declares,
//     and the HTML text inside <foreignObject> is laid out again as outlined
//     glyphs from the rules of the same stylesheet. Anything in the output the
//     converter does not recognise fails the build;
//   - the six cards are six entries of the gallery (galleryPresets.ts), by
//     title, rendered through the service's own query reader (query.ts); the
//     label over the preview is that entry's title;
//   - the embed URL is the builder's own (cardParams.ts, buildCardUrl);
//   - the control labels and options are read from builder/page.tsx;
//   - the equalizer plays the renderer's own keyframes, durations and delays,
//     as a scale instead of an HTML height;
//   - the cover is the demo song's own cover, as Suno serves it (assets/).
// The card's text face is the one the renderer asks for, the reader's system
// sans: on the machine that builds this that is Segoe UI, with Microsoft YaHei
// for the Chinese title and Segoe UI Symbol for the play mark. They are read
// from the operating system and not copied into this repo.
//
// The play and like counts are the fixture's, raised to the historical maximum
// kept in suno/songs.yaml, and "… ago" is counted to that register's asOf date,
// so a rebuild does not change the picture. The register is used for those
// two numbers and that date only; the song is on the card because it is the
// product's own public demo.
//
// The panel's words are the site's hero pill and headline and the product
// README's own tagline; its three figures are counted from the builder's
// controls and checked against data/profile's "Card combinations" metric.
//
// The still frame is the first card (Classic + Default, dark), the densest.
//
// Fraunces and Plus Jakarta Sans (OFL) are static instances cut from the
// variable fonts in github.com/google/fonts (fontTools instancer: Fraunces at
// opsz 14, SOFT 0, WONK 0, wght 400, which is what Google Fonts serves the
// site; Plus Jakarta Sans at wght 400 and 500), subset to Latin.
//
// The product checkout is NOT part of this repo (SUNO_CARDS_INPUTS): it is the
// PUBLIC repository, ../github-readme-suno-cards-public, with its dependencies
// installed. Where it or a system font is absent the card is not rebuilt and
// the committed SVG stands. The build makes no network call.
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import opentype from "opentype.js";

import { CARD, card, pct } from "../lib/svg-card/shell.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..").replace(/\\/g, "/");
const PRODUCT = "../github-readme-suno-cards-public";
const ASSETS = "scripts/cards/assets/github-readme-suno-cards";
const SYSTEM = "C:/Windows/Fonts";

export const SUNO_CARDS_FONTS = {
  display: `${ASSETS}/Fraunces-400.ttf`,
  displayItalic: `${ASSETS}/Fraunces-400-Italic.ttf`,
  sans: `${ASSETS}/PlusJakartaSans-400.ttf`,
  sansMedium: `${ASSETS}/PlusJakartaSans-500.ttf`,
  mono: "cv/fonts/JetBrainsMono-Regular.ttf",
  // the song card's own face: the system sans its stylesheet asks for
  ui: `${SYSTEM}/segoeui.ttf`,
  ui600: `${SYSTEM}/seguisb.ttf`,
  ui700: `${SYSTEM}/segoeuib.ttf`,
  ui900: `${SYSTEM}/seguibl.ttf`,
  symbol: `${SYSTEM}/seguisym.ttf`,
};
export const SUNO_CARDS_INPUTS = {
  ui: SUNO_CARDS_FONTS.ui,
  ui600: SUNO_CARDS_FONTS.ui600,
  ui700: SUNO_CARDS_FONTS.ui700,
  ui900: SUNO_CARDS_FONTS.ui900,
  symbol: SUNO_CARDS_FONTS.symbol,
  cjk: `${SYSTEM}/msyhbd.ttc`,
  render: `${PRODUCT}/packages/render/src/index.ts`,
  mapping: `${PRODUCT}/packages/parser/src/mapping.ts`,
  schema: `${PRODUCT}/packages/parser/src/schema.ts`,
  valibot: `${PRODUCT}/packages/parser/node_modules/valibot/dist/index.js`,
  fixture: `${PRODUCT}/packages/parser/test/fixtures/clip-complete.json`,
  gallery: `${PRODUCT}/apps/web/lib/galleryPresets.ts`,
  params: `${PRODUCT}/apps/web/lib/cardParams.ts`,
  constants: `${PRODUCT}/apps/web/lib/constants.ts`,
  query: `${PRODUCT}/apps/web/lib/query.ts`,
  tokens: `${PRODUCT}/apps/web/app/globals.css`,
  layout: `${PRODUCT}/apps/web/app/layout.tsx`,
  home: `${PRODUCT}/apps/web/app/page.tsx`,
  builder: `${PRODUCT}/apps/web/app/builder/page.tsx`,
  navbar: `${PRODUCT}/apps/web/components/Navbar.tsx`,
  mark: `${PRODUCT}/apps/web/components/LogoMark.tsx`,
  copyIcon: `${PRODUCT}/apps/web/components/CodeBlock.tsx`,
  colorPicker: `${PRODUCT}/apps/web/components/ColorPicker.tsx`,
  readme: `${PRODUCT}/README.md`,
};

const fail = (what) => { throw new Error(`github-readme-suno-cards card: ${what}`); };
const must = (text, pattern, what) => text.match(pattern) || fail(`${what} no longer matches ${pattern}`);
const at = (f) => (path.isAbsolute(f) ? f : `${ROOT}/${f}`);
const read = (key) => readFileSync(at(SUNO_CARDS_INPUTS[key]), "utf8").replace(/\r\n/g, "\n");

// ── The product's own code, loaded from its checkout ─────────────────────────
// Its sources are TypeScript that import each other as "./x.js"; Node strips
// the types and this hook points those specifiers at the .ts files. Loaded only
// where every outside input exists, so an absent checkout skips the card.
const productCode = Object.values(SUNO_CARDS_INPUTS).every((f) => existsSync(at(f))) ? await (async () => {
  const home = `/${path.basename(PRODUCT)}/`;
  registerHooks({
    resolve(specifier, context, next) {
      if (context.parentURL?.includes(home) && /^\.{1,2}\/.*\.js$/.test(specifier)) {
        const ts = new URL(specifier.replace(/\.js$/, ".ts"), context.parentURL);
        if (existsSync(fileURLToPath(ts))) return { url: ts.href, shortCircuit: true };
      }
      return next(specifier, context);
    },
  });
  const load = (key) => import(pathToFileURL(at(SUNO_CARDS_INPUTS[key])).href);
  const [render, mapping, schema, valibot, gallery, params, constants, query] =
    await Promise.all(["render", "mapping", "schema", "valibot", "gallery", "params", "constants", "query"].map(load));
  return { render, mapping, schema, valibot, gallery, params, constants, query };
})() : null;

// The six gallery entries the stage visits, and the control each step uses.
const TOUR = [
  { title: "Classic + Default (Dark)" },
  { title: "Classic + Default (Light)", click: ["Theme", "light"] },
  { title: "Player + Default (Light)", click: ["Layout", "player"] },
  { title: "Player + Suno (Light)", click: ["Preset", "suno"] },
  { title: "Player + Suno (Dark)", click: ["Theme", "dark"] },
  { title: "Custom Red Accent", type: "Accent" },
];

// ── Small parsers ────────────────────────────────────────────────────────────
const attrs = (s) => Object.fromEntries([...s.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const unescape = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const px = (v, what) => Number(must(String(v ?? ""), /^(-?[\d.]+)(?:px)?$/, what)[1]);
const n1 = (v) => Number(v.toFixed(1));
const n2 = (v) => Number(v.toFixed(2));

// Top-level rules of a stylesheet (selector → declarations) and its at-rules.
function parseCss(source) {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = new Map();
  const atRules = [];
  for (let i = 0; i < css.length; ) {
    const open = css.indexOf("{", i);
    if (open < 0) break;
    const selector = css.slice(i, open).trim();
    let depth = 1;
    let j = open + 1;
    for (; depth && j < css.length; j++) depth += css[j] === "{" ? 1 : css[j] === "}" ? -1 : 0;
    const body = css.slice(open + 1, j - 1);
    if (selector.startsWith("@")) atRules.push([selector, body]);
    else for (const s of selector.split(",").map((x) => x.trim())) {
      const decl = rules.get(s) || {};
      for (const m of body.matchAll(/([\w-]+)\s*:\s*([^;]+);?/g)) decl[m[1]] = m[2].trim();
      rules.set(s, decl);
    }
    i = j;
  }
  return { rules, atRules };
}

// An oklch() grey, or a color-mix of one with transparent → a colour an SVG attribute takes.
function siteTokens(css) {
  const block = (sel) => Object.fromEntries([...must(css, new RegExp(`${sel} \\{([\\s\\S]*?)\\n  \\}`), `globals.css ${sel}`)[1].matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].replace(/\s+/g, " ")]));
  const raw = block(":root");
  const grey = (L) => {
    const lin = L ** 3; // chroma 0: the three cone responses are equal
    return Math.round(255 * (lin <= 0.0031308 ? 12.92 * lin : 1.055 * lin ** (1 / 2.4) - 0.055));
  };
  const resolve = (value, seen = 0) => {
    if (seen > 4) fail(`globals.css token loop at ${value}`);
    const ref = value.match(/^var\((--[\w-]+)\)$/);
    if (ref) return resolve(raw[ref[1]] ?? fail(`globals.css has no ${ref[1]}`), seen + 1);
    const ok = value.match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/);
    if (ok) {
      if (Number(ok[2]) !== 0) fail(`globals.css: ${value} is not a grey`);
      return { v: grey(Number(ok[1])), a: ok[4] === undefined ? 1 : Number(ok[4]) };
    }
    const mix = value.match(/^color-mix\(in oklch, (.+?) ([\d.]+)%, transparent\)$/);
    if (mix) {
      const c = resolve(mix[1], seen + 1);
      return { v: c.v, a: (c.a * Number(mix[2])) / 100 };
    }
    return fail(`globals.css: cannot read ${value}`);
  };
  return (name, alpha = 1) => {
    const c = resolve(raw[`--${name}`] ?? fail(`globals.css has no --${name}`));
    const a = c.a * alpha;
    return a === 1 ? `#${c.v.toString(16).padStart(2, "0").repeat(3)}` : `rgba(${c.v},${c.v},${c.v},${n2(a)})`;
  };
}

// One face of a TrueType collection, as a font opentype.js can read: the
// face's own table directory is moved to the start of the file.
function collectionFace(file, index) {
  const b = readFileSync(file);
  if (b.toString("latin1", 0, 4) !== "ttcf" || index >= b.readUInt32BE(8)) fail(`${file} is not a font collection with face ${index}`);
  const offset = b.readUInt32BE(12 + 4 * index);
  const size = 12 + 16 * b.readUInt16BE(offset + 4);
  const out = Buffer.from(b);
  b.copy(out, 0, offset, offset + size);
  return opentype.parse(out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength));
}

export function buildSunoCardsCard({ glyphs, root, project }) {
  const code = productCode || fail("the product checkout is not loaded");
  const { render, params, constants } = code;
  const T_ = siteTokens(read("tokens"));
  const S = {
    bg: T_("background"), fg: T_("foreground"), muted: T_("muted"), mutedStrong: T_("muted-strong"), placeholder: T_("muted", 0.6),
    border: T_("border"), borderStrong: T_("border-strong"), hairline: T_("hairline"),
    pill1: T_("pill-bg-1"), pill2: T_("pill-bg-2"), pillBorder: T_("pill-border"),
    wash1: T_("foreground", 0.12), wash2: T_("foreground", 0.04),
  };

  // ── The typefaces the site loads ───────────────────────────────────────────
  const layout = read("layout");
  must(layout, /import \{ Fraunces, JetBrains_Mono, Plus_Jakarta_Sans \} from 'next\/font\/google'/, "the site's font loader");
  must(read("tokens"), /\.font-display \{[^}]*font-style: italic;/, "the italic display utility");

  const text = (str, o) => glyphs.text(str, o);
  const measure = (str, o) => glyphs.measure(str, o);
  const caps = (str, x, y, o = {}) => text(str.toUpperCase(), { font: "mono", size: o.size || 10, x, y, fill: o.fill || S.muted, tracking: o.tracking ?? 0.22, anchor: o.anchor });
  const capsWidth = (str, o = {}) => measure(str.toUpperCase(), { font: "mono", size: o.size || 10, tracking: o.tracking ?? 0.22 });

  // ── Chinese, from the system collection ────────────────────────────────────
  const cjkFont = collectionFace(SUNO_CARDS_INPUTS.cjk, 0);
  if (cjkFont.unitsPerEm !== glyphs.font("ui700").unitsPerEm) fail("the Chinese face and the system sans no longer share units per em");
  const cjkUsed = new Map();
  const cjkRun = (str, { size, x, y, fill }) => {
    const k = size / cjkFont.unitsPerEm;
    let ax = 0;
    const uses = [...str].map((ch) => {
      const g = cjkFont.charToGlyph(ch);
      if (g.index === 0) fail(`the Chinese face has no glyph for "${ch}"`);
      const id = `z${g.index.toString(36)}`;
      if (!cjkUsed.has(id)) {
        cjkUsed.set(id, g.path.commands.map((c) => {
          const r = Math.round;
          return c.type === "M" ? `M${r(c.x)} ${r(c.y)}` : c.type === "L" ? `L${r(c.x)} ${r(c.y)}` : c.type === "Q" ? `Q${r(c.x1)} ${r(c.y1)} ${r(c.x)} ${r(c.y)}` : c.type === "C" ? `C${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)} ${r(c.x)} ${r(c.y)}` : "Z";
        }).join(""));
      }
      const use = `<use href="#${id}"${ax ? ` x="${ax}"` : ""}/>`;
      ax += g.advanceWidth;
      return use;
    }).join("");
    return { svg: `<g fill="${fill}" transform="translate(${n2(x)} ${n2(y)}) scale(${Number(k.toFixed(5))} ${Number((-k).toFixed(5))})">${uses}</g>`, width: ax * k };
  };
  // Card text: each character from the first face of the stack that has it.
  const faceOf = (ch, font) => (ch === " " || glyphs.font(font).charToGlyph(ch).index ? font : glyphs.font("symbol").charToGlyph(ch).index ? "symbol" : "cjk");
  const rich = (str, { font, size, x, y, fill, anchor = "start", tracking = 0 }) => {
    const runs = [];
    for (const ch of str) {
      const face = faceOf(ch, font);
      if (runs.length && runs.at(-1).face === face) runs.at(-1).str += ch;
      else runs.push({ face, str: ch });
    }
    const widthOf = (r) => (r.face === "cjk" ? cjkRun(r.str, { size, x: 0, y: 0, fill }).width : measure(r.str, { font: r.face, size, tracking }));
    const width = runs.reduce((w, r) => w + widthOf(r), 0);
    let cx = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
    const svg = runs.map((r) => {
      const out = r.face === "cjk" ? cjkRun(r.str, { size, x: cx, y, fill }).svg : r.str.trim() ? text(r.str, { font: r.face, size, x: cx, y, fill, tracking }) : "";
      cx += widthOf(r);
      return out;
    }).join("");
    return { svg, width };
  };
  // The baseline of a line box that starts at `top`, as a browser sets it.
  const baseline = (top, lineHeight, size, font) => {
    const f = glyphs.font(font);
    const asc = (f.ascender / f.unitsPerEm) * size;
    const desc = (-f.descender / f.unitsPerEm) * size;
    return top + (lineHeight - (asc + desc)) / 2 + asc;
  };
  // the system sans has no 500 or 800: the browser that renders the real card takes the next face up
  const WEIGHT = { 400: "ui", 500: "ui600", 600: "ui600", 700: "ui700", 800: "ui900" };
  const face = (weight) => WEIGHT[weight] || fail(`no system face for font-weight ${weight}`);

  // ── The song, and the six gallery entries ──────────────────────────────────
  const fixture = JSON.parse(read("fixture"));
  if (fixture.id !== constants.DEMO_UUID) fail("the parser fixture is no longer the site's demo song");
  must(read("readme"), new RegExp(`/api/card\\?id=${constants.DEMO_UUID}`), "the demo song in the product README");
  const song = code.mapping.mapClipToSong(code.valibot.parse(code.schema.ClipSchema, fixture));
  // counts at their historical maximum, and the date they were read
  const register = readFileSync(`${root}/suno/songs.yaml`, "utf8").replace(/\r\n/g, "\n");
  const asOf = must(register, /^asOf: "(\d{4}-\d\d-\d\d)"$/m, "the Suno register's asOf")[1];
  const row = must(register, new RegExp(`\\n  - id: ${song.id}\\n(?:    .*\\n)*?    metrics: \\{plays: (\\d+), likes: (\\d+)`), "the demo song in the Suno register");
  song.playCount = Math.max(song.playCount, Number(row[1]));
  song.likeCount = Math.max(song.likeCount, Number(row[2]));
  const coverUri = `data:image/jpeg;base64,${readFileSync(`${root}/${ASSETS}/cover.jpg`).toString("base64")}`;

  const renderReal = (config) => {
    const q = code.query.readCardQuery(new URLSearchParams(params.buildCardQueryString(config)));
    const show = Object.fromEntries(Object.entries(q).filter(([k]) => k.startsWith("show")));
    const now = Date.now;
    Date.now = () => Date.parse(`${asOf}T12:00:00Z`);
    try {
      return render.renderSingleSongSvg(song, { ...show, coverDataUri: coverUri, theme: q.theme ?? "auto", lang: q.lang ?? "en", layout: q.layout, preset: q.preset, width: q.width, colorOverrides: q.colors, maxTags: q.maxTags });
    } finally {
      Date.now = now;
    }
  };

  // ── The renderer's output → a fragment <img> can show ──────────────────────
  const defs = [];
  const css = [];
  const sharedDefs = new Map(); // content → id
  const share = (content, prefix) => {
    if (!sharedDefs.has(content)) sharedDefs.set(content, `${prefix}${sharedDefs.size}`);
    return sharedDefs.get(content);
  };
  const tidy = (s) => s.replace(/\s+/g, " ").replace(/> </g, "><").replace(/ \/>/g, "/>").trim();
  let eqCss = false;
  const convert = (svg, n) => {
    const rootTag = attrs(must(svg, /^<svg ([^>]*)>/, "the card's root")[1]);
    const mode = must(rootTag.class, /^card-root theme-(dark|light)$/, "a pinned theme on the card's root")[1];
    const W = Number(rootTag.width);
    const H = Number(rootTag.height);
    const { rules, atRules } = parseCss(must(svg, /<style>([\s\S]*?)<\/style>/, "the card's stylesheet")[1]);
    const vars = rules.get(":root") || fail("the card's stylesheet has no :root tokens");
    const rule = (sel) => rules.get(sel) || fail(`the card's stylesheet has no ${sel}`);
    const val = (sel, prop) => (rule(sel)[prop] ?? fail(`${sel} has no ${prop}`)).replace(/var\((--[\w-]+)\)/g, (_, name) => vars[name] ?? fail(`the card has no ${name}`));
    const gradient = (id) => tidy(must(svg, new RegExp(`<linearGradient id="${id}"[\\s\\S]*?</linearGradient>`), `the ${id} gradient`)[0]);
    const def = (id, prefix) => {
      const content = gradient(id).replace(`id="${id}"`, "");
      const short = share(content, prefix);
      return `url(#${short})`;
    };
    // fill, stroke and opacity of a class, as presentation attributes
    const paint = (cls) => ["fill", "stroke", "stroke-width", "opacity"].filter((p) => rule(`.${cls}`)[p] !== undefined)
      .map((p) => { const v = val(`.${cls}`, p); return `${p}="${p === "fill" && v.startsWith("url(#") ? def(must(v, /^url\(#([\w-]+)\)$/, `${cls} fill`)[1], "g") : v}"`; }).join(" ");
    const keep = (a, names) => names.filter((k) => a[k] !== undefined).map((k) => `${k}="${a[k]}"`).join(" ");
    const typo = (sel) => ({ size: px(val(sel, "font-size"), `${sel} font-size`), font: face(rule(sel)["font-weight"] || 400) });

    let rest = must(svg, /<g class="song-card" transform="translate\(0, 0\)">([\s\S]*)<\/g>\s*<\/svg>\s*$/, "the song card group")[1];
    const take = (re, what, optional = false) => {
      const m = rest.match(re);
      if (!m) return optional ? null : fail(`the renderer's output has no ${what}`);
      rest = rest.replace(m[0], "");
      return m;
    };
    const out = [];

    const clip = take(/<clipPath id="[^"]+">(<rect[^>]*\/>)<\/clipPath>/, "cover clip");
    defs.push(`<clipPath id="cc${n}">${tidy(clip[1])}</clipPath>`);
    const bg = attrs(take(/<rect class="card-bg"([^>]*)\/>/, "card background")[1]);
    out.push(`<rect ${keep(bg, ["x", "y", "width", "height", "rx"])} ${paint("card-bg")}/>`);

    // the cover: stored once, placed where each card puts it. (The player card also names a
    // drop shadow on it, which its own clip then cuts away; it is left out.)
    const image = attrs(take(/<image ([^>]*)\/>/, "cover image")[1]);
    if (image.href !== coverUri || image.width !== image.height || image.preserveAspectRatio !== "xMidYMid slice") fail("the cover is no longer placed as a square slice of the image passed in");
    out.push(`<g clip-path="url(#cc${n})"><use href="#cv" transform="translate(${image.x} ${image.y}) scale(${image.width})"/></g>`);
    const overlay = attrs(take(/<rect class="cover-overlay"([^>]*)\/>/, "cover overlay")[1]);
    out.push(`<rect ${keep(overlay, ["x", "y", "width", "height", "rx"])} ${paint("cover-overlay")}/>`);

    const duration = take(/<g class="duration-badge"><rect class="duration-pill"([^>]*)\/><text class="duration-text"([^>]*)>([^<]*)<\/text><\/g>/, "duration", true);
    if (duration) {
      const t = attrs(duration[2]);
      if (t["text-anchor"] !== "middle") fail("the duration is no longer centred");
      out.push(`<rect ${keep(attrs(duration[1]), ["x", "y", "width", "height", "rx"])} ${paint("duration-pill")}/>` +
        text(duration[3], { ...typo(".duration-text"), x: Number(t.x), y: Number(t.y), fill: val(".duration-text", "fill"), anchor: "middle" }));
    }

    // the equalizer: the same box, bars and keyframes, scaled instead of resized
    const eq = take(/<foreignObject class="equalizer"([^>]*)>\s*<div[^>]*class="eq-wrap">((?:<span class="eq-bar eq-bar-\d"><\/span>)+)<\/div>\s*<\/foreignObject>/, "equalizer", true);
    if (eq) {
      const box = attrs(eq[1]);
      const bars = eq[2].match(/eq-bar-\d/g).length;
      const pad = px(val(".eq-wrap", "padding"), "the equalizer padding");
      const gap = px(val(".eq-wrap", "gap"), "the equalizer gap");
      const inner = { w: Number(box.width) - 2 * pad, h: Number(box.height) - 2 * pad };
      // flex items shrink together when they and their gaps are wider than the box
      const bw = Math.min(px(val(".eq-bar", "width"), "the bar width"), (inner.w - gap * (bars - 1)) / bars);
      const x0 = Number(box.x) + pad + (inner.w - (bw * bars + gap * (bars - 1))) / 2;
      const frames = [...(atRules.find(([sel]) => sel === "@keyframes bar-bounce") || fail("the bar-bounce keyframes"))[1].matchAll(/([\d%,\s]+)\{\s*height:\s*([\d.]+)%;\s*\}/g)].map((m) => [m[1].replace(/\s+/g, ""), Number(m[2]) / 100]);
      if (frames.length < 5 || !/^bar-bounce ease-in-out infinite$/.test(rule(".eq-bar").animation)) fail("the equalizer animation changed shape");
      if (!eqCss) {
        eqCss = true;
        css.push(`@keyframes eq{${frames.map(([at_, v]) => `${at_}{transform:scaleY(${v})}`).join("")}}.eq{transform-box:fill-box;transform-origin:50% 100%}` +
          Array.from({ length: bars }, (_, i) => { const r = rule(`.eq-bar-${i + 1}`); return `.e${i + 1}{animation:eq ${r["animation-duration"]} ease-in-out ${r["animation-delay"]} infinite}`; }).join(""));
      }
      out.push(`<rect ${keep(box, ["x", "y", "width", "height"])} rx="${px(val(".eq-wrap", "border-radius"), "the equalizer radius")}" fill="${val(".eq-wrap", "background")}"/>` +
        `<g fill="${val(".eq-bar", "background")}">${Array.from({ length: bars }, (_, i) =>
          // the still frame holds bar i at the keyframe after its first
          `<rect class="eq e${i + 1}" style="transform:scaleY(${frames[(i + 1) % frames.length][1]})" x="${n2(x0 + i * (bw + gap))}" y="${Number(box.y) + pad}" width="${n2(bw)}" height="${inner.h}" rx="${px(val(".eq-bar", "border-radius"), "the bar radius")}"/>`).join("")}</g>`);
    }
    if (/class="new-badge"/.test(rest)) fail("the demo song now carries the NEW ribbon, which this card does not draw");

    // the classic layout's text panel: HTML in the output, laid out again here
    const panel = take(/<foreignObject([^>]*)>\s*<div[^>]*class="text-panel">([\s\S]*)<\/div>\s*<\/foreignObject>/, "text panel", true);
    if (panel) {
      const box = attrs(panel[1]);
      const X0 = Number(box.x);
      const maxW = Number(box.width);
      let html = panel[2];
      const part = (re) => { const m = html.match(re); if (m) html = html.replace(m[0], ""); return m; };
      let y = Number(box.y);
      const title = part(/<p class="song-title">([^<]*)<\/p>/) || fail("the text panel has no title");
      {
        const t = typo(".song-title");
        const lh = t.size * Number(val(".song-title", "line-height"));
        const r = rich(unescape(title[1]), { ...t, x: X0, y: baseline(y, lh, t.size, t.font), fill: val(".song-title", "color") });
        if (r.width > maxW) fail("the demo title no longer fits one line of the classic card");
        out.push(r.svg);
        y += lh;
      }
      const by = part(/<p class="song-by">([^<]*)<\/p>/);
      if (by) {
        const t = typo(".song-by");
        const lh = t.size * Number(val(".song-by", "line-height"));
        y += px(val(".song-by", "margin").split(" ")[0], "the by-line margin");
        out.push(rich(unescape(by[1]), { ...t, x: X0, y: baseline(y, lh, t.size, t.font), fill: val(".song-by", "color") }).svg);
        y += lh;
      }
      const chips = part(/<div class="chips">((?:<span class="chip">[^<]*<\/span>)+)<\/div>/);
      if (chips) {
        const t = typo(".chip");
        const [padY, padX] = val(".chip", "padding").split(" ").map((v) => px(v, "the chip padding"));
        const lh = t.size * Number(val(".chip", "line-height"));
        const border = px(must(val(".chip", "border"), /^(\S+) solid/, "the chip border")[1], "the chip border");
        const h = lh + 2 * padY + 2 * border;
        y += px(val(".chips", "margin-top"), "the chips margin");
        let x = X0;
        for (const [, label] of chips[1].matchAll(/<span class="chip">([^<]*)<\/span>/g)) {
          const w = measure(unescape(label), t) + 2 * padX + 2 * border;
          if (x + w > X0 + maxW) break; // a chip that wraps is clipped away whole
          out.push(`<rect x="${n2(x + border / 2)}" y="${n2(y + border / 2)}" width="${n2(w - border)}" height="${n2(h - border)}" rx="${n2(Math.min(px(val(".chip", "border-radius"), "the chip radius"), h / 2) - border / 2)}" fill="${val(".chip", "background")}" stroke="${must(val(".chip", "border"), /solid (.+)$/, "the chip border colour")[1]}" stroke-width="${border}"/>` +
            text(unescape(label), { ...t, x: x + border + padX, y: baseline(y + border + padY, lh, t.size, t.font), fill: val(".chip", "color") }));
          x += w + px(val(".chips", "gap"), "the chips gap");
        }
        y += Math.min(h, px(val(".chips", "max-height"), "the chips height"));
      }
      const stats = part(/<div class="stats-row">([\s\S]*?)<\/div>/);
      if (stats) {
        const t = typo(".stats-row");
        const lh = t.size * Number(val(".stats-row", "line-height"));
        const fill = val(".stats-row", "color");
        y += px(val(".stats-row", "margin-top"), "the stats margin");
        const sep = must(rule(".stat + .stat::before").content, /^" (.) "$/, "the stat separator")[1];
        const sepMargin = px(must(rule(".stat + .stat::before").margin, /^0 (\S+)$/, "the separator margin")[1], "the separator margin");
        const sepOpacity = Number(rule(".stat + .stat::before").opacity);
        const b = typo(".badge-model");
        const [bPadY, bPadX] = val(".badge-model", "padding").split(" ").map((v) => px(v, "the badge padding"));
        const bH = b.size * Number(val(".badge-model", "line-height")) + 2 * bPadY + 2;
        const rowH = Math.max(lh, bH);
        let x = X0;
        let first = true;
        for (const [, cls, style, label] of stats[1].matchAll(/<span class="([^"]+)"(?: style="([^"]*)")?>([^<]*)<\/span>/g)) {
          const str = unescape(label);
          if (cls === "stat") {
            const yb = baseline(y + (rowH - lh) / 2, lh, t.size, t.font);
            if (!first) {
              // the separator is the start of the next stat: its leading space collapses
              x += sepMargin;
              out.push(`<g opacity="${sepOpacity}">${text(sep, { ...t, x, y: yb, fill })}</g>`);
              x += measure(`${sep} `, t) + sepMargin;
            }
            const r = rich(str, { ...t, x, y: yb, fill });
            out.push(r.svg);
            x += r.width;
          } else if (/^badge-model badge-model-suno$/.test(cls)) {
            const own = Object.fromEntries(unescape(style || "").split(";").map((d) => d.split(/:(.*)/s).slice(0, 2)));
            if (own[`--badge-bg-${mode}`] !== "transparent" || own[`--badge-border-${mode}`] !== "transparent") fail("the model badge now has a background, which this card does not draw");
            x += first ? 0 : px(rule(".stats-row > * + .badge-model")["margin-left"], "the badge margin");
            out.push(text(str, { ...b, x: x + 1 + bPadX, y: baseline(y + (rowH - bH) / 2 + 1 + bPadY, b.size * Number(val(".badge-model", "line-height")), b.size, b.font), fill: own[`--badge-text-${mode}`] || fail("the model badge has no text colour") }));
            x += measure(str, b) + 2 * bPadX + 2;
          } else fail(`the stats row has an unknown item (${cls})`);
          first = false;
        }
        if (x > X0 + maxW) fail("the stats row no longer fits the classic card");
      }
      if (html.trim()) fail(`the text panel has content this card does not draw: ${html.trim().slice(0, 80)}`);
    }

    // the player layout: title, progress row, logo, link icon
    const ptitle = take(/<foreignObject([^>]*)>\s*<p[^>]*class="player-title">([^<]*)<\/p>\s*<\/foreignObject>/, "player title", true);
    if (ptitle) {
      const box = attrs(ptitle[1]);
      const t = typo(".player-title");
      const lh = t.size * Number(val(".player-title", "line-height"));
      const r = rich(unescape(ptitle[2]), { ...t, x: Number(box.x), y: baseline(Number(box.y), lh, t.size, t.font), fill: val(".player-title", "color") });
      if (r.width > Number(box.width)) fail("the demo title no longer fits the player card");
      out.push(r.svg);
    }
    const progress = take(/<g class="progress-bar">([\s\S]*?)<\/g>/, "progress bar", true);
    if (progress) {
      let seen = 0;
      const body = progress[1].replace(/<(circle|polygon|rect|text) class="([\w-]+)"([^>]*?)(?:\/>|>([^<]*)<\/text>)/g, (_, tag, cls, a, label) => {
        seen++;
        const o = attrs(a);
        if (tag === "text") out.push(text(label, { ...typo(`.${cls}`), x: Number(o.x), y: Number(o.y), fill: val(`.${cls}`, "fill"), anchor: o["text-anchor"] }));
        else out.push(`<${tag} ${keep(o, ["cx", "cy", "r", "x", "y", "width", "height", "rx", "points"]).replace(/(\d+\.\d{3,})/g, (v) => String(n2(Number(v))))} ${paint(cls)}/>`);
        return "";
      });
      if (seen !== 7 || body.trim()) fail("the progress bar changed shape");
    }
    const logo = take(/<text class="suno-logo"([^>]*)>([^<]*)<\/text>/, "logo", true);
    if (logo) {
      const o = attrs(logo[1]);
      const t = typo(".suno-logo");
      const spacing = px(val(".suno-logo", "letter-spacing"), "the logo letter-spacing");
      if (o["text-anchor"] !== "end") fail("the logo is no longer right-aligned");
      // letter-spacing follows every letter, the last one too
      out.push(`<g opacity="${val(".suno-logo", "opacity")}">${text(logo[2], { ...t, x: Number(o.x) - spacing, y: Number(o.y), fill: val(".suno-logo", "fill"), anchor: "end", tracking: spacing / t.size })}</g>`);
    }
    const link = take(/<svg ([^>]*class="link-icon"[^>]*)>([\s\S]*?)<\/svg>/, "link icon", true);
    if (link) out.push(`<svg ${keep(attrs(link[1]), ["x", "y", "width", "height", "viewBox", "stroke-linecap", "stroke-linejoin"])} ${paint("link-icon")}>${tidy(link[2])}</svg>`);

    if (rest.trim()) fail(`the renderer's output has an element this card does not draw: ${rest.trim().slice(0, 100)}`);
    return { w: W, h: H, svg: out.join(""), mode, accent: vars["--c-accent"] };
  };

  // ── The builder's controls, as its page declares them ──────────────────────
  const builder = read("builder");
  const controls = Object.fromEntries(["Layout", "Preset", "Theme"].map((label) => {
    const block = must(builder, new RegExp(`<SegmentedControl\\s+label="${label}"\\s+options=\\{\\[([\\s\\S]*?)\\]\\}`), `the builder's ${label} control`)[1];
    return [label, [...block.matchAll(/\{ value: '(\w+)', label: '([^']+)' \}/g)].map((m) => ({ value: m[1], label: m[2] }))];
  }));
  const counts = Object.fromEntries(Object.entries(controls).map(([k, v]) => [k, v.length]));
  const accentRow = must(builder, /<ColorPicker\s+label="(Accent)"[\s\S]*?defaultColor="(#[0-9a-f]{6})"/, "the builder's Accent row");
  must(readFileSync(at(`${PRODUCT}/apps/web/components/ColorPicker.tsx`), "utf8"), /placeholder="(auto)"/, "the colour field's placeholder");
  const tabs = [...must(builder, /const tabs: \{ value: Tab; label: string \}\[\] = \[([\s\S]*?)\];/, "the builder's tabs")[1].matchAll(/label: '([^']+)'/g)].map((m) => m[1]);
  const embedLabel = must(builder, /tracking-\[0\.22em\] text-muted">\s*(Embed code)\s*<\/span>/, "the builder's embed label")[1];
  if (!tabs.includes("URL")) fail("the builder no longer has a URL tab");
  const metric = project.metrics.find((m) => m.label === "Card combinations")?.value || "";
  if (!metric.startsWith(`${counts.Layout * counts.Preset * counts.Theme} base (${counts.Layout} layouts x ${counts.Preset} presets x ${counts.Theme} themes)`)) fail(`the builder's controls (${JSON.stringify(counts)}) no longer agree with data/profile's "Card combinations" metric`);

  // ── The tour: six gallery entries, each one step from the last ─────────────
  const tour = TOUR.map((step, i) => {
    const entry = code.gallery.GALLERY_PRESETS.find((g) => g.title === step.title) || fail(`the gallery has no "${step.title}"`);
    return { ...step, config: entry.config, card: convert(renderReal(entry.config), i), url: params.buildCardUrl(entry.config, constants.ORIGIN_HINT) };
  });
  tour.forEach((s, i) => {
    if (!i) return;
    const a = tour[i - 1].config;
    const b = s.config;
    const changed = ["layout", "preset", "theme", "accentColor"].filter((k) => a[k] !== b[k]);
    const want = s.click ? [s.click[0].toLowerCase()] : ["accentColor"];
    if (changed.join() !== want.join() || (s.click && b[want[0]] !== s.click[1])) fail(`"${s.title}" is no longer one step from "${tour[i - 1].title}" (${changed})`);
  });
  const accent = tour.at(-1).config.accentColor;
  if (!/^[0-9a-f]{6}$/.test(accent) || tour.at(-1).card.accent !== `#${accent}`) fail("the last gallery entry no longer sets an accent the card uses");

  // ── Timeline ───────────────────────────────────────────────────────────────
  const TYPE = 0.8; // the accent is typed
  const AT = [0, 3.6, 7.0, 9.2, 11.6, 15.0]; // when each step is acted on
  const START = AT.map((t, i) => (tour[i].type ? t + 0.15 + TYPE + 0.1 : t)); // when its card shows
  const T = 20.4;
  const p = (t) => pct(t, T, 3);
  const made = new Map();
  const kf = (body, extra = "") => {
    const key = body + extra;
    if (!made.has(key)) {
      const name = `k${made.size.toString(36)}`;
      css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${T}s linear infinite${extra}}`);
      made.set(key, name);
    }
    return `class="${made.get(key)}"`;
  };
  const STEP = ";animation-timing-function:step-end";
  // shown during [a, b) intervals with hard edges; in the still frame when shown at 0
  const when = (intervals) => {
    const merged = [];
    for (const [a, b] of [...intervals].sort((x, y) => x[0] - y[0])) {
      if (merged.length && merged.at(-1)[1] >= a) merged.at(-1)[1] = Math.max(merged.at(-1)[1], b);
      else merged.push([a, b]);
    }
    const on0 = merged.some(([a]) => a <= 0);
    const points = merged.flatMap(([a, b]) => [...(a > 0 ? [[a, 1]] : []), ...(b < T ? [[b, 0]] : [])]);
    const last = points.length ? points.at(-1)[1] : on0 ? 1 : 0;
    return `${kf(`0%{opacity:${on0 ? 1 : 0}}${points.map(([t, o]) => `${p(t)}{opacity:${o}}`).join("")}100%{opacity:${last}}`, STEP)}${on0 ? "" : ' opacity="0"'}`;
  };
  const during = (i) => [START[i], i + 1 < tour.length ? START[i + 1] : T];
  // the times a config field holds a value
  const spans = (test) => tour.map((s, i) => (test(s.config) ? [i ? AT[i] + (s.type ? 0.15 + TYPE : 0) : 0, i + 1 < tour.length ? AT[i + 1] + (tour[i + 1].type ? 0.15 + TYPE : 0) : T] : null)).filter(Boolean);
  // a card fades in over the one before it
  const FADE = 0.25;
  const shown = (i) => {
    const [a, b] = during(i);
    const head = a > 0 ? `0%,${p(a)}{opacity:0}${p(a + FADE)}` : "0%";
    const tail = b < T ? `,${p(b)}{opacity:1}${p(b + FADE)},100%{opacity:0}` : ",100%{opacity:1}";
    return `${kf(head + tail)}${a > 0 ? ' opacity="0"' : ""}`;
  };
  // the page starts again
  const loop = kf(`0%{opacity:0}${p(0.3)},${p(T - 0.3)}{opacity:1}100%{opacity:0}`);

  // ── Layout ─────────────────────────────────────────────────────────────────
  const X = CARD.panel;
  const PANEL = { x: X + 16, y: 20, w: 250, h: 320, pad: 18 };
  const RIGHT = { x: PANEL.x + PANEL.w + 16, w: CARD.w - 20 - (PANEL.x + PANEL.w + 16) };
  const TILE = { x: RIGHT.x, y: 20, w: RIGHT.w, h: 178 };
  const CODE = { x: RIGHT.x, y: 244, w: RIGHT.w, h: 90.5 };
  defs.push(
    `<linearGradient id="gp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${S.pill1}"/><stop offset="1" stop-color="${S.pill2}"/></linearGradient>`,
    `<radialGradient id="wash"><stop offset="0" stop-color="${S.wash1}"/><stop offset=".55" stop-color="${S.wash2}"/><stop offset="1" stop-color="${S.wash2}" stop-opacity="0"/></radialGradient>`,
    `<image id="cv" width="1" height="1" preserveAspectRatio="xMidYMid slice" href="${coverUri}"/>`,
  );
  const glass = (b, r) => `<rect x="${b.x + 0.5}" y="${b.y + 0.5}" width="${b.w - 1}" height="${b.h - 1}" rx="${r}" fill="url(#gp)" stroke="${S.pillBorder}"/>`;
  const quiet = (x, y, w, h) => `<rect x="${n1(x + 0.5)}" y="${n1(y + 0.5)}" width="${n1(w - 1)}" height="${n1(h - 1)}" rx="${n1((h - 1) / 2)}" fill="none" stroke="${S.border}"/>`;
  const BTN = { font: "sansMedium", size: 12, tracking: -0.025 };
  const targets = {}; // where the cursor goes for each control value

  // a segmented control: label, then a quiet pill of equal options, the chosen one filled
  const segmented = (label, y) => {
    const x = PANEL.x + PANEL.pad;
    const w = PANEL.w - 2 * PANEL.pad;
    const key = label.toLowerCase();
    const options = controls[label];
    const ow = (w - 8 - 4 * (options.length - 1)) / options.length;
    const out = [caps(label, x, y + 11), quiet(x, y + 23, w, 36)];
    options.forEach((o, k) => {
      const ox = x + 4 + k * (ow + 4);
      const cx = ox + ow / 2;
      targets[`${label}:${o.value}`] = [cx + 16, y + 23 + 25];
      const chosen = spans((c) => c[key] === o.value);
      out.push(text(o.label, { ...BTN, x: cx, y: y + 23 + 22.5, fill: S.muted, anchor: "middle" }));
      if (chosen.length) out.push(`<g ${when(chosen)}><rect x="${n1(ox)}" y="${y + 27}" width="${n1(ow)}" height="28" rx="14" fill="${S.fg}"/>${text(o.label, { ...BTN, x: cx, y: y + 23 + 22.5, fill: S.bg, anchor: "middle" })}</g>`);
    });
    return out.join("");
  };
  // the accent row: label, swatch, hex field
  const accentControl = (y) => {
    const x = PANEL.x + PANEL.pad;
    const w = PANEL.w - 2 * PANEL.pad;
    const fx = x + 80 + 12 + 32 + 12;
    const fw = x + w - fx;
    const hex = `#${accent}`;
    const HEX = { font: "mono", size: 12 };
    const hw = measure(hex, HEX);
    if (hw + 24 > fw) fail("the accent no longer fits its field");
    const tA = AT.at(-1) + 0.15;
    targets.Accent = [fx + fw - 11, y + 21];
    defs.push(`<clipPath id="hx"><rect x="${fx + 4}" y="${y + 2}" width="${fw - 8}" height="28"/></clipPath>`);
    return caps(accentRow[1], x, y + 19.5, { tracking: 0.18 }) +
      `<circle cx="${x + 80 + 12 + 16}" cy="${y + 16}" r="15.5" fill="${accentRow[2]}" stroke="${S.borderStrong}"/>` +
      `<circle ${when([[tA + TYPE, T]])} cx="${x + 80 + 12 + 16}" cy="${y + 16}" r="15.5" fill="${hex}" stroke="${S.borderStrong}"/>` +
      quiet(fx, y, fw, 32) +
      `<g ${when([[0, tA]])}>${text("auto", { ...HEX, x: fx + 12, y: y + 20.5, fill: S.placeholder })}</g>` +
      `<g clip-path="url(#hx)"><g ${when([[tA, T]])}>${text(hex, { ...HEX, x: fx + 12, y: y + 20.5, fill: S.fg })}` +
      // typed: a cover the colour of the page slides off it, a step a character
      `<g ${kf(`0%,${p(tA)}{transform:none;animation-timing-function:steps(${hex.length},end)}${p(tA + TYPE)},100%{transform:translateX(${n1(hw + 6)}px)}`)}><rect x="${fx + 12}" y="${y + 4}" width="${n1(hw + 6)}" height="24" fill="${S.bg}"/><rect x="${fx + 12}" y="${y + 8}" width="1.5" height="16" fill="${S.fg}"/></g></g></g>`;
  };
  const ROWS = { Layout: PANEL.y + 24, Preset: PANEL.y + 101, Theme: PANEL.y + 178, Accent: PANEL.y + 271 };
  const panelSvg = glass(PANEL, 18) +
    `<g ${loop}>` + ["Layout", "Preset", "Theme"].map((l) => segmented(l, ROWS[l])).join("") +
    `<rect x="${PANEL.x + PANEL.pad}" y="${PANEL.y + 255}" width="${PANEL.w - 2 * PANEL.pad}" height="1" fill="${S.hairline}"/>` +
    accentControl(ROWS.Accent) + "</g>";

  // the preview: the gallery entry's title, then its card, scaled to the width the page gives it
  const AREA = { x: TILE.x + 9, y: TILE.y + 26, w: TILE.w - 18, h: TILE.h - 26 - 12 };
  const preview = glass(TILE, 18) +
    `<ellipse cx="${TILE.x + TILE.w / 2}" cy="${AREA.y + AREA.h / 2}" rx="${AREA.w * 0.46}" ry="${AREA.h * 0.6}" fill="url(#wash)" opacity=".6"/>` +
    `<g ${loop}>` + tour.map((s, i) => {
      const k = Math.min(1, AREA.w / s.card.w);
      const w = s.card.w * k;
      const h = s.card.h * k;
      if (h > AREA.h) fail(`"${s.title}" no longer fits the preview`);
      const tx = n2(AREA.x + (AREA.w - w) / 2);
      const ty = n2(AREA.y + (AREA.h - h) / 2);
      return `<g ${when([during(i)])}>${caps(s.title, TILE.x + 16, TILE.y + 19)}</g>` +
        `<g ${shown(i)}><g transform="translate(${tx} ${ty})${k < 1 ? ` scale(${Number(k.toFixed(4))})` : ""}">${s.card.svg}</g></g>`;
    }).join("") + "</g>";

  // the embed: label, tab pills with URL chosen, the code block and its copy button
  const TAB = { font: "sansMedium", size: 11, tracking: -0.025 };
  const tabW = tabs.map((t) => measure(t, TAB) + 24);
  const tabsW = tabW.reduce((a, b) => a + b, 0) + 4 * (tabs.length - 1) + 8;
  let tabX = RIGHT.x + RIGHT.w - tabsW + 4;
  const embedHead = caps(embedLabel, RIGHT.x + 2, 226) + quiet(RIGHT.x + RIGHT.w - tabsW, 206, tabsW, 30) + tabs.map((t, k) => {
    const x = tabX;
    tabX += tabW[k] + 4;
    const on = t === "URL";
    return (on ? `<rect x="${n1(x)}" y="210" width="${n1(tabW[k])}" height="22" rx="11" fill="${S.fg}"/>` : "") + text(t, { ...TAB, x: x + tabW[k] / 2, y: 225, fill: on ? S.bg : S.muted, anchor: "middle" });
  }).join("");
  const MONO = { font: "mono", size: 12 };
  const cols = Math.floor((CODE.w - 16 - 56) / measure("0", MONO));
  const linesOf = (url) => Array.from({ length: Math.ceil(url.length / cols) }, (_, k) => url.slice(k * cols, (k + 1) * cols)); // break-all
  const urlLines = tour.map((s) => linesOf(s.url));
  if (Math.max(...urlLines.map((l) => l.length)) > 3) fail("an embed URL no longer fits three lines of the code block");
  const codeText = [];
  for (let k = 0; k < 3; k++) {
    for (let a = 0; a < tour.length; ) {
      let b = a;
      while (b + 1 < tour.length && urlLines[b + 1][k] === urlLines[a][k]) b++;
      if (urlLines[a][k]) {
        const line = text(urlLines[a][k], { ...MONO, x: CODE.x + 16, y: CODE.y + 29 + k * 19.5, fill: S.mutedStrong });
        codeText.push(a === 0 && b === tour.length - 1 ? line : `<g ${when([[START[a], b + 1 < tour.length ? START[b + 1] : T]])}>${line}</g>`);
      }
      a = b + 1;
    }
  }
  const copy = must(read("copyIcon"), /<title>Copy<\/title>\s*<rect x="9" y="9" width="13" height="13" rx="2" \/>\s*<path d="([^"]+)" \/>/, "the code block's copy icon")[1];
  const embed = embedHead + glass(CODE, 12) +
    quiet(CODE.x + CODE.w - 12 - 32, CODE.y + 12, 32, 32) +
    `<svg x="${CODE.x + CODE.w - 12 - 23}" y="${CODE.y + 21}" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${S.muted}" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="${copy}"/></svg>` +
    `<g ${loop}>${codeText.join("")}</g>`;

  // the pointer: to each control just before its step
  const REST = [CODE.x + CODE.w - 96, CODE.y + CODE.h - 30]; // the code block's last line is never this long
  const stops = tour.slice(1).map((s, i) => ({ t: AT[i + 1], to: targets[s.click ? `${s.click[0]}:${s.click[1]}` : s.type] || fail(`no control for "${s.title}"`) }));
  let from = REST;
  const path_ = [`0%{transform:translate(${REST[0]}px,${REST[1]}px)}`];
  for (const { t, to } of stops) {
    path_.push(`${p(t - 0.85)}{transform:translate(${n1(from[0])}px,${n1(from[1])}px);animation-timing-function:cubic-bezier(.4,0,.2,1)}${p(t - 0.12)}{transform:translate(${n1(to[0])}px,${n1(to[1])}px)}`);
    from = to;
  }
  path_.push(`100%{transform:translate(${n1(from[0])}px,${n1(from[1])}px)}`);
  const pointer = `<g ${loop}>` +
    stops.map(({ t, to }) => `<circle ${kf(`0%,${p(t)}{opacity:0}${p(t + 0.02)}{opacity:.7}${p(t + 0.4)},100%{opacity:0}`)} opacity="0" cx="${n1(to[0])}" cy="${n1(to[1])}" r="9" fill="none" stroke="${S.fg}" stroke-width="1.5"/>`).join("") +
    `<g ${kf(path_.join(""))} transform="translate(${REST[0]} ${REST[1]})"><path d="M0 0v15.5l4.1-3.6 2.9 6.6 2.6-1.1-2.9-6.5h5.6Z" fill="#fff" stroke="#000" stroke-width="1.1" stroke-linejoin="round"/></g></g>`;

  // ── Identity: the hero pill, the navbar's lockup, the hero headline ────────
  const home = read("home");
  const navbar = read("navbar");
  const readme = read("readme");
  const eyebrow = must(home, /tracking-\[0\.28em\] text-muted">\s*(GitHub README · Suno AI)\s*<\/span>/, "the hero pill")[1];
  const hero = must(home, /<span className="italic">([^<]+)<\/span>\s*<br \/>\s*<span className="not-italic">([^<]+)<\/span>/, "the hero headline");
  const name = must(navbar, /<span className="font-display text-base leading-none tracking-tight">([^<]+)<\/span>/, "the navbar's name")[1];
  const suffix = must(navbar, /tracking-\[0\.22em\] text-muted sm:inline">\s*(\w+)\s*<\/span>/, "the navbar's suffix")[1];
  const tagline = must(readme, /^### (Your Suno songs, as cards in your GitHub README\.)$/m, "the product README's tagline")[1];
  const markSrc = read("mark");
  const mark = { rect: attrs(must(markSrc, /<rect ([^>]*)\/>/, "the mark's frame")[1]), circle: attrs(must(markSrc, /<circle ([^>]*?)fill=/, "the mark's cover")[1]), d: must(markSrc, /<path d="([^"]+)" \/>/, "the mark's lines")[1] };
  must(markSrc, /viewBox="0 0 100 100"[\s\S]*strokeWidth=\{5\}\s+strokeLinecap="round"/, "the mark's box and stroke");

  const NAME = { font: "displayItalic", size: 42, tracking: -0.025 };
  const HEAD = { size: 39, tracking: -0.025 };
  const SUB = { font: "sans", size: 14.5 };
  const nameW = measure(name, NAME);
  const eyebrowW = capsWidth(eyebrow, { size: 10.5, tracking: 0.28 });
  if (104 + nameW + 14 + 16 + capsWidth(suffix, { size: 11 }) > X - 30) fail("the wordmark no longer fits the panel");
  if (Math.max(measure(hero[1], { ...HEAD, font: "displayItalic" }), measure(hero[2], { ...HEAD, font: "display" }), measure(tagline, SUB)) > X - 70) fail("the headline no longer fits the panel");
  const figures = [[counts.Layout, "layouts"], [counts.Preset, "presets"], [counts.Theme, "themes"]].map(([value, label], k) => {
    const x = 40 + k * 118;
    return text(String(value), { font: "display", size: 32, x, y: 325, fill: S.fg }) + caps(label, x + measure(String(value), { font: "display", size: 32 }) + 9, 324, { size: 10.5 });
  });
  const identity =
    quiet(40, 30, eyebrowW + 32, 28) + caps(eyebrow, 56, 48, { size: 10.5, tracking: 0.28 }) +
    `<svg x="40" y="80" width="54" height="54" viewBox="0 0 100 100" fill="none" stroke="${S.fg}" stroke-width="5" stroke-linecap="round">` +
    `<rect ${Object.entries(mark.rect).map(([k, v]) => `${k}="${v}"`).join(" ")}/><circle ${Object.entries(mark.circle).map(([k, v]) => `${k}="${v}"`).join(" ")} fill="${S.fg}" stroke="none"/><path d="${mark.d}"/></svg>` +
    text(name, { ...NAME, x: 104, y: 121, fill: S.fg }) +
    text("·", { font: "sans", size: 16, x: 104 + nameW + 14, y: 119, fill: S.muted, anchor: "middle" }) +
    caps(suffix, 104 + nameW + 26, 119, { size: 11 }) +
    text(hero[1], { ...HEAD, font: "displayItalic", x: 40, y: 190, fill: S.fg }) +
    text(hero[2], { ...HEAD, font: "display", x: 40, y: 231, fill: S.fg }) +
    text(tagline, { ...SUB, x: 40, y: 262, fill: S.muted }) +
    `<rect x="40" y="284" width="${X - 80}" height="1" fill="${S.hairline}"/>` +
    figures.join("");

  const body =
    `<rect width="${CARD.w}" height="${CARD.h}" fill="${S.bg}"/>` +
    identity +
    `<rect x="${X - 0.5}" width="1" height="${CARD.h}" fill="${S.hairline}"/>` +
    panelSvg + preview + embed + pointer;

  const allDefs = glyphs.defs() +
    [...cjkUsed].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join("") +
    [...sharedDefs].map(([content, id]) => content.replace("<linearGradient", `<linearGradient id="${id}"`)).join("") +
    defs.join("");
  const optionNames = (label) => controls[label].map((o) => o.label);

  return {
    svg: card({
      title:
        `${project.name} turns a Suno creator's songs into animated cards for a GitHub README, each one a single image URL. ` +
        `The card shows the product's own builder restyling one song's card: the ${optionNames("Layout").join(" and ")} layouts, the ${optionNames("Preset").join(" and ")} presets, ` +
        `dark and light themes and a custom accent colour, with the equalizer playing on the cover and the embed URL following each choice.`,
      css: css.join(""),
      defs: allDefs,
      body,
      radius: 14,
    }),
    facts: { cards: tour.length, layouts: counts.Layout, presets: counts.Preset, themes: counts.Theme, song: song.id.slice(0, 8), plays: song.playCount, likes: song.likeCount, asOf, loop: `${T.toFixed(1)}s` },
  };
}
