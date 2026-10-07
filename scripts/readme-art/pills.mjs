// The README's link pills. One flat capsule each: a pixel that blinks, the
// label, and an arrow that nudges. `index` staggers the nudge so a row of pills
// does not move in unison.
import { C, n, sheet } from "./kit.mjs";

const H = 40;
const PAD = 17;
const PIXEL = 8;
const GAP = 10;
const ARROW = 12;
const LOOP = 7;

// plate, label, pixel, and the hairline that keeps the capsule visible on the
// GitHub canvas nearest its own colour
const VARIANTS = {
  ink: { plate: C.ink, label: C.ash, pixel: C.orange, edge: "rgba(247,246,242,.3)" },
  ash: { plate: C.ash, label: C.ink, pixel: C.orange, edge: C.ink },
  orange: { plate: C.orange, label: C.ink, pixel: C.ink, edge: "rgba(7,6,7,.2)" },
  violet: { plate: C.violet, label: C.white, pixel: C.glare, edge: "rgba(247,246,242,.25)" },
};

export function pill({ glyphs, label, variant, index = 0 }) {
  const v = VARIANTS[variant];
  if (!v) throw new Error(`readme-art: unknown pill variant "${variant}" for "${label}"`);
  const font = { font: "sansBold", size: 14.5 };
  const tw = glyphs.measure(label, font);
  const w = Math.ceil(PAD + PIXEL + GAP + tw + GAP + ARROW + PAD);
  const tx = PAD + PIXEL + GAP;
  const ax = tx + tw + GAP;
  const delay = `animation-delay:${n(-index * 0.9)}s`;
  const css =
    "@keyframes b{0%,46%{opacity:1}50%,96%{opacity:.25}}" +
    "@keyframes a{0%,78%,100%{transform:none}84%{transform:translateX(4px)}90%{transform:none}95%{transform:translateX(2.5px)}}" +
    `.b{animation:b 1.8s step-end infinite}.a{animation:a ${LOOP}s cubic-bezier(.3,0,.2,1) infinite}`;
  const body =
    `<rect width="${w}" height="${H}" fill="${v.plate}"/>` +
    `<rect class="b" style="${delay}" x="${PAD}" y="${(H - PIXEL) / 2}" width="${PIXEL}" height="${PIXEL}" fill="${v.pixel}"/>` +
    glyphs.text(label, { ...font, x: tx, y: 25.2, fill: v.label }) +
    `<path class="a" style="${delay}" d="M${n(ax)} 20h${ARROW - 1}m-4.5 -4.5l4.5 4.5l-4.5 4.5" fill="none" stroke="${v.label}" stroke-width="1.9" stroke-linecap="square"/>`;
  return sheet({ w, h: H, title: label, css, defs: glyphs.defs(), body, radius: H / 2, edge: v.edge });
}
