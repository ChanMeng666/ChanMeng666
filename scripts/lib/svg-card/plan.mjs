// Helpers for putting ArchLang compiler output on a card.

// Split a compiled SVG into its top-level layer groups. Every id is prefixed so
// several drawings (or frames of one) can share a file: "poche" exists in every
// plan, in each plan's own colours.
export function splitLayers(svg, prefix) {
  const scoped = svg.replace(/\bid="([^"]+)"/g, `id="${prefix}-$1"`).replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`);
  const defs = scoped.match(/<defs>([\s\S]*?)<\/defs>/)[1].trim();
  const layers = [...scoped.matchAll(/<g\b([^>]*)>([\s\S]*?)<\/g>/g)].map(([, attrs, body]) => {
    if (body.includes("<g")) throw new Error("svg-card: nested group in compiler output; the layer splitter needs updating");
    return {
      id: (attrs.match(new RegExp(`\\bid="${prefix}-([^"]+)"`)) || [])[1] || null,
      body,
      elements: [...body.matchAll(/<(\w+)\b[^>]*?(?:\/>|>[^<]*<\/\1>)/g)].map((m) => m[0]),
    };
  });
  return { defs, layers };
}

// Extent of a drawing in its own units, from the straight geometry of `layers`.
export function extentOf(layers) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const grow = (x, y) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); };
  for (const l of layers) {
    for (const [, pts] of l.body.matchAll(/\bpoints="([^"]+)"/g)) for (const pt of pts.trim().split(/\s+/)) grow(...pt.split(",").map(Number));
    for (const [, d] of l.body.matchAll(/\bd="([^"]+)"/g)) for (const [, x, y] of d.matchAll(/[ML]\s*(-?[\d.]+)[ ,](-?[\d.]+)/g)) grow(Number(x), Number(y));
    for (const [, a, b, c, e] of l.body.matchAll(/<line x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)"/g)) { grow(Number(a), Number(b)); grow(Number(c), Number(e)); }
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
