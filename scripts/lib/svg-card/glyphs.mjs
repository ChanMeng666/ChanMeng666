// Text for SVGs that GitHub renders as <img>: no external font can load there,
// so every glyph is outlined. Each glyph is stored ONCE in <defs> (font units,
// y-up) and placed with <use x="advance">; the run's wrapper flips and scales it
// to pixels. A card with hundreds of characters costs a few dozen paths.
import { readFileSync } from "node:fs";
import opentype from "opentype.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const n = (v, d = 2) => Number(v.toFixed(d)).toString();

export class GlyphSet {
  constructor(fonts) {
    // fonts: { key: "path/to/font.ttf" }
    this.fonts = {};
    for (const [key, file] of Object.entries(fonts)) {
      const buf = readFileSync(file);
      this.fonts[key] = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    }
    this.used = new Map(); // id -> path d
  }

  font(key) {
    const f = this.fonts[key];
    if (!f) throw new Error(`svg-card: unknown font "${key}"`);
    return f;
  }

  #glyphId(key, glyph) {
    // short ids: a card places thousands of glyphs, and each <use> repeats the id
    const id = `_${Object.keys(this.fonts).indexOf(key).toString(36)}${glyph.index.toString(36).padStart(3, "0")}`;
    if (!this.used.has(id)) {
      let d = "";
      for (const c of glyph.path.commands) {
        const r = Math.round;
        if (c.type === "M") d += `M${r(c.x)} ${r(c.y)}`;
        else if (c.type === "L") d += `L${r(c.x)} ${r(c.y)}`;
        else if (c.type === "Q") d += `Q${r(c.x1)} ${r(c.y1)} ${r(c.x)} ${r(c.y)}`;
        else if (c.type === "C") d += `C${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)} ${r(c.x)} ${r(c.y)}`;
        else if (c.type === "Z") d += "Z";
      }
      this.used.set(id, d);
    }
    return id;
  }

  // Lay a string out in font units. tracking is in em.
  // A character the font lacks is taken from `fallback` (same units-per-em only).
  #layout(str, key, tracking, fallback) {
    const font = this.font(key);
    const glyphs = font.stringToGlyphs(str);
    const items = [];
    let x = 0;
    glyphs.forEach((g, i) => {
      let from = key;
      if (g.index === 0 && str[i] !== " ") {
        const alt = fallback && this.font(fallback);
        if (!alt || alt.unitsPerEm !== font.unitsPerEm || alt.charToGlyph(str[i]).index === 0) {
          throw new Error(`svg-card: font "${key}" has no glyph for "${str[i]}"`);
        }
        g = alt.charToGlyph(str[i]);
        glyphs[i] = g;
        from = fallback;
      }
      if (g.path.commands.length) items.push({ g, x, from });
      x += g.advanceWidth + tracking * font.unitsPerEm;
      if (glyphs[i + 1]) x += font.getKerningValue(g, glyphs[i + 1]);
    });
    return { items, width: x - (glyphs.length ? tracking * font.unitsPerEm : 0), upm: font.unitsPerEm };
  }

  measure(str, { font, size, tracking = 0 }) {
    const { width, upm } = this.#layout(str, font, tracking);
    return (width * size) / upm;
  }

  // One run of text with its baseline at (x, y). Returns an SVG string.
  text(str, { font, size, x = 0, y = 0, fill, anchor = "start", tracking = 0, attrs = "", fallback }) {
    const { items, width, upm } = this.#layout(str, font, tracking, fallback);
    const k = size / upm;
    const w = width * k;
    const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
    const uses = items.map(({ g, x: gx, from }) => `<use href="#${this.#glyphId(from, g)}"${gx ? ` x="${Math.round(gx)}"` : ""}/>`).join("");
    return `<g${fill ? ` fill="${esc(fill)}"` : ""}${attrs ? ` ${attrs}` : ""} transform="translate(${n(x0)} ${n(y)}) scale(${n(k, 5)} ${n(-k, 5)})">${uses}</g>`;
  }

  // The <defs> payload; call after every text() has run.
  defs() {
    return [...this.used].sort(([a], [b]) => (a < b ? -1 : 1)).map(([id, d]) => `<path id="${id}" d="${d}"/>`).join("");
  }
}

// Replace the <text> elements of a foreign SVG fragment (e.g. compiler output)
// with outlined runs. Handles the attributes ArchLang emits: x, y, font-size,
// fill, text-anchor, font-weight, dominant-baseline="central", transform.
export function outlineTextElements(svg, glyphs, { regular, bold, fallback }) {
  return svg.replace(/<text\b([^>]*)>([^<]*)<\/text>/g, (_, attrs, content) => {
    const a = Object.fromEntries([...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
    const size = Number(a["font-size"]);
    const key = Number(a["font-weight"] || 400) >= 600 ? bold : regular;
    const font = glyphs.font(key);
    // "central" sits the em-box middle on y; cap-height centring reads the same
    // for the digits and capitalised labels a plan carries.
    const dy = a["dominant-baseline"] === "central" ? ((font.tables.os2.sCapHeight / font.unitsPerEm) * size) / 2 : 0;
    const text = content.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
    const run = glyphs.text(text, { font: key, size, x: Number(a.x), y: Number(a.y) + dy, fill: a.fill, anchor: a["text-anchor"] || "start", fallback });
    return a.transform ? `<g transform="${a.transform}">${run}</g>` : run;
  });
}
