// The frame every README project card shares: 1300×360, a 500px identity panel
// on the left and an 800px stage on the right where the product itself performs.
// The card carries its own plate, so it holds on both GitHub canvases.
export const CARD = { w: 1300, h: 360, panel: 500, radius: 20 };

// Caldera tokens the frame uses (data/brand.yaml › color.raw).
export const BRAND = {
  ink: "#070607",
  ash: "#F7F6F2",
  orange: "#FC5000",
  muted: "#A9A8A3",
  soft: "#D5D4CF",
};

export const FONTS = {
  display: "cv/fonts/Anton-Regular.ttf",
  sans: "cv/fonts/DMSans-Regular.ttf",
  sansMedium: "cv/fonts/DMSans-Medium.ttf",
  sansBold: "cv/fonts/DMSans-Bold.ttf",
  mono: "cv/fonts/JetBrainsMono-Regular.ttf",
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Seconds on a loop of `total` seconds → a keyframe percentage.
export const pct = (t, total, digits = 2) => `${Math.max(0, Math.min(100, (t / total) * 100)).toFixed(digits)}%`;

// The identity panel. `mark` is an SVG fragment drawn in a 58px box at (40, 84).
export function panel(glyphs, { eyebrow, name, headline, underline, sub, chips, mark }) {
  const out = [`<rect width="${CARD.panel}" height="${CARD.h}" fill="${BRAND.ink}"/>`];
  out.push(glyphs.text(eyebrow, { font: "mono", size: 12.5, x: 40, y: 52, fill: BRAND.muted, tracking: 0.16 }));
  out.push(`<g transform="translate(40 84)">${mark}</g>`);
  out.push(glyphs.text(name, { font: "display", size: 56, x: 114, y: 137, fill: BRAND.ash }));

  // The one orange accent: a rule that draws itself under part of the headline.
  const hl = { font: "sansBold", size: 25 };
  if (underline) {
    const at = headline.indexOf(underline);
    if (at < 0) throw new Error(`svg-card: underline "${underline}" is not in the headline`);
    const x = 40 + glyphs.measure(headline.slice(0, at), hl);
    const w = glyphs.measure(underline, hl);
    out.push(`<rect class="hl" x="${x.toFixed(1)}" y="198" width="${w.toFixed(1)}" height="5" rx="2.5" fill="${BRAND.orange}"/>`);
  }
  out.push(glyphs.text(headline, { ...hl, x: 40, y: 192, fill: BRAND.ash }));
  out.push(glyphs.text(sub, { font: "sans", size: 17.5, x: 40, y: 234, fill: BRAND.soft }));

  let cx = 40;
  for (const chip of chips) {
    const tw = glyphs.measure(chip, { font: "mono", size: 12, tracking: 0.1 });
    const w = tw + 26;
    out.push(`<rect x="${cx.toFixed(1)}" y="295.5" width="${w.toFixed(1)}" height="30" rx="15" fill="none" stroke="${BRAND.ash}" stroke-opacity=".38" stroke-width="1.2"/>`);
    out.push(glyphs.text(chip, { font: "mono", size: 12, x: cx + 13, y: 315, fill: BRAND.ash, tracking: 0.1 }));
    cx += w + 10;
  }
  return out.join("");
}

export const PANEL_CSS =
  "@keyframes hl{0%,6%{transform:scaleX(0)}18%,90%{transform:scaleX(1)}100%{transform:scaleX(0)}}" +
  ".hl{transform-box:fill-box;transform-origin:left center;animation:hl 14s cubic-bezier(.6,0,.2,1) infinite}";

// Assemble the file. Base states are authored as the FINISHED frame, so the
// reduced-motion rule (animations off) leaves a complete still image.
// A card in the Caldera frame passes `panelSvg` + `stageSvg`; a card drawn in its
// product's own design system passes one `body` and its own `radius`.
export function card({ title, css, defs, panelSvg, stageSvg, body, radius = CARD.radius }) {
  const { w, h } = CARD;
  const r = radius;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t">` +
    `<title id="t">${esc(title)}</title>` +
    `<style>${body ? "" : PANEL_CSS}${css}@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style>` +
    `<defs>${defs}<clipPath id="card"><rect width="${w}" height="${h}" rx="${r}"/></clipPath></defs>` +
    `<g clip-path="url(#card)">${body || stageSvg + panelSvg}</g>` +
    `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${r - 0.5}" fill="none" stroke="rgba(128,128,128,.35)"/>` +
    "</svg>\n"
  );
}
