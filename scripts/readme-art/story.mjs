// The story card (public/readme/story.svg): who Chan is, in a few short
// chapters. A photograph on the left changes with the chapter; on the right a
// headline, one line, and a small moving picture that says the same thing
// without words. Drawn in the Caldera system with the same furniture as the
// other plates. Copy and photographs: data/brand.yaml › signatures.readmeArt.story.
//
// One loop for everything: each chapter's keyframes are written relative to the
// chapter's own start and shifted into place with a negative delay
// (docs/animated-svg-cards.md §6.3). The still frame is the last chapter.
import fs from "node:fs";
import path from "node:path";

import { C, furniture, n, prng, sheet } from "./kit.mjs";

const W = 1300;
const H = 540;
const PHOTO = { x: 40, y: 40, w: 400, h: 460, r: 14 };
const COL = { x: 492, r: 1244 };
const PIC = { x: COL.x, y: 292, w: COL.r - COL.x, h: 200 };
const SLOT = 5.6;
const FADE = 0.4;

export function story({ glyphs, root, eyebrow, chapters, title }) {
  const T = chapters.length * SLOT;
  const css = [];
  let uid = 0;
  const p = (t) => `${n(Math.max(0, Math.min(100, (t / T) * 100)), 3)}%`;

  // An animation whose keyframes are in seconds from the start of chapter `i`.
  // Returns the attributes to put on the element.
  const anim = (i, frames, { ease = "linear", hidden = false, origin } = {}) => {
    const name = `k${(uid++).toString(36)}`;
    css.push(`@keyframes ${name}{${frames.map(([t, d]) => `${p(t)}{${d}}`).join("")}}` +
      `.${name}{animation:${name} ${n(T)}s ${ease} infinite${origin ? `;transform-box:fill-box;transform-origin:${origin}` : ""}}`);
    return `class="${name}" style="animation-delay:${n(i * SLOT - T)}s"${hidden ? ' opacity="0"' : ""}`;
  };
  // Shown from `t` to the end of its chapter. Chapters before the last are not
  // in the still frame, so everything in them carries opacity="0".
  const last = chapters.length - 1;
  const on = (i, t, { rise = 0 } = {}) =>
    anim(i, [[0, `opacity:0${rise ? `;transform:translateY(${rise}px)` : ""}`], [t, `opacity:0${rise ? `;transform:translateY(${rise}px)` : ""}`], [t + 0.35, "opacity:1;transform:none"], [T, "opacity:1;transform:none"]],
      { ease: "cubic-bezier(.2,.7,.2,1)", hidden: i !== last });
  const pop = (i, t) =>
    anim(i, [[0, "opacity:0;transform:scale(.6)"], [t, "opacity:0;transform:scale(.6)"], [t + 0.3, "opacity:1;transform:none"], [T, "opacity:1;transform:none"]],
      { ease: "cubic-bezier(.2,.7,.2,1)", hidden: i !== last, origin: "center" });
  const window_ = (i, a, b, hidden) =>
    anim(i, [[0, "opacity:0"], [a, "opacity:0"], [a + FADE, "opacity:1"], [b - FADE, "opacity:1"], [b, "opacity:0"], [T, "opacity:0"]], { hidden });

  const mono = (s, x, y, o = {}) => glyphs.text(String(s).toUpperCase(), { font: "mono", size: 12.5, x, y, fill: C.ink, tracking: 0.16, ...o });
  const tile = (x, y, w, h, fill = C.white) => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="12" fill="${fill}" stroke="${C.ink}" stroke-width="1.5"/>`;
  // the largest size, up to the one asked for, at which a run fits a width
  const fit = (s, o, width) => {
    let size = o.size;
    while (glyphs.measure(s, { ...o, size }) > width) size -= 0.5;
    return size;
  };
  const wrap = (s, font, size, width) => {
    const lines = [""];
    for (const word of s.split(" ")) {
      const next = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${word}` : word;
      if (glyphs.measure(next, { font, size }) > width && lines[lines.length - 1]) lines.push(word);
      else lines[lines.length - 1] = next;
    }
    return lines;
  };

  // ── The moving pictures ───────────────────────────────────────────────────
  const { x: PX, y: PY, w: PW, h: PH } = PIC;
  const PICTURES = {
    // Contour rings draw themselves; a triangle and its squares follow.
    maps(i, [a, b]) {
      const half = (PW - 20) / 2;
      const cx = PX + half / 2;
      const cy = PY + PH / 2 + 6;
      const rings = [78, 60, 43, 27, 12].map((r, k) => {
        const d = `M${n(cx - r * 1.5)} ${n(cy)}c0 ${n(-r * 0.75)} ${n(r * 0.9)} ${n(-r * 0.95)} ${n(r * 1.6)} ${n(-r * 0.8)}s${n(r * 1.5)} ${n(r * 0.5)} ${n(r * 1.4)} ${n(r * 0.9)}s${n(-r * 0.9)} ${n(r * 0.85)} ${n(-r * 1.7)} ${n(r * 0.7)}s${n(-r * 1.3)} ${n(-r * 0.2)} ${n(-r * 1.3)} ${n(-r * 0.8)}z`;
        const len = Math.round(r * 9.5);
        return `<path d="${d}" fill="none" stroke="${k === 4 ? C.orange : C.ink}" stroke-width="${k === 4 ? 3 : 1.6}" stroke-dasharray="${len}" ${anim(i, [[0, `stroke-dashoffset:${len}`], [0.3 + k * 0.22, `stroke-dashoffset:${len}`], [1.1 + k * 0.22, "stroke-dashoffset:0"], [T, "stroke-dashoffset:0"]], { ease: "ease-out" })}/>`;
      }).join("");
      const tx = PX + half + 20;
      const ox = tx + 118;
      const oy = PY + 150;
      const sq = (x, y, s, fill, t) => `<rect x="${n(x)}" y="${n(y)}" width="${s}" height="${s}" fill="${fill}" ${pop(i, t)}/>`;
      const maths =
        `<path d="M${ox} ${oy}h96L${ox} ${oy - 72}z" fill="none" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round" ${on(i, 2.0)}/>` +
        `<path d="M${ox} ${oy - 12}h12v12" fill="none" stroke="${C.ink}" stroke-width="1.6" ${on(i, 2.0)}/>` +
        sq(ox - 76, oy - 72, 72, C.soft, 2.5) + sq(ox, oy + 4, 30, C.soft, 2.8) +
        `<g ${pop(i, 3.2)}><rect x="${ox + 112}" y="${oy - 92}" width="88" height="88" fill="${C.orange}"/></g>`;
      return (
        tile(PX, PY, half, PH) + rings + `<g ${on(i, 0.2)}>${mono(a, PX + 16, PY + 26)}</g>` +
        `<g ${on(i, 1.8)}>${tile(tx, PY, half, PH)}${mono(b, tx + 16, PY + 26)}</g>` + maths
      );
    },
    // A full field of pixels empties, band by band, until one is left.
    vanish(i, [a]) {
      const cell = 12;
      const px = 8;
      const cols = Math.floor(PW / cell);
      const rows = Math.floor((PH - 44) / cell);
      const rand = prng(2021);
      const bands = Array.from({ length: 10 }, () => []);
      let keep = "";
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const d = `M${PX + c * cell + 2} ${PY + 36 + r * cell + 2}h${px}v${px}h-${px}z`;
        if (r === rows - 1 && c === 0) keep = d;
        else bands[Math.min(9, Math.floor((rand() * 0.55 + (c / cols) * 0.45) * 10))].push(d);
      }
      return (
        `<g ${on(i, 0.2)}>${mono(a, PX, PY + 20)}</g>` +
        bands.map((cells, k) => `<path d="${cells.join("")}" fill="${C.ink}" ${anim(i, [[0, "opacity:0"], [0.25, "opacity:1"], [1.5 + (9 - k) * 0.28, "opacity:1"], [1.5 + (9 - k) * 0.28 + 0.01, "opacity:0"], [T, "opacity:0"]], { hidden: true })}/>`).join("") +
        `<path d="${keep}" fill="${C.orange}" ${on(i, 0.25)}/>`
      );
    },
    // One pixel crosses from the old place to the new one; the degree lands.
    crossing(i, [from, to, degree, grade]) {
      const ax = PX + 14;
      const bx = PX + PW - 350;
      const y0 = PY + 150;
      const peak = PY + 26;
      const at = (u) => [ax + (bx - ax) * u, y0 + (peak - y0) * 4 * u * (1 - u)];
      const steps = 16;
      const pts = Array.from({ length: steps + 1 }, (_, k) => at(k / steps));
      const dots = Array.from({ length: 41 }, (_, k) => at(k / 40)).map(([x, y]) => `M${n(x - 1.5)} ${n(y - 1.5)}h3v3h-3z`).join("");
      const walk = pts.map(([x, y], k) => [0.5 + (k / steps) * 2.3, `transform:translate(${n(x - bx)}px,${n(y - y0)}px)`]);
      const tx = bx + 34;
      return (
        `<path d="${dots}" fill="${C.ink}" fill-opacity=".4" ${on(i, 0.2)}/>` +
        `<rect x="${ax - 6}" y="${y0 - 6}" width="12" height="12" fill="${C.ink}" ${on(i, 0.2)}/>` +
        `<g ${on(i, 0.2)}>${mono(from, ax - 6, y0 + 30)}</g>` +
        `<rect x="${bx - 8}" y="${y0 - 8}" width="16" height="16" fill="${C.orange}" ${anim(i, [[0, walk[0][1] + ";opacity:0"], [0.4, walk[0][1] + ";opacity:1"], ...walk, [T, "transform:none;opacity:1"]], { hidden: true })}/>` +
        `<g ${on(i, 2.9)}>${mono(to, bx - 8, y0 + 30)}</g>` +
        `<g ${on(i, 3.3, { rise: 10 })}>${tile(tx, PY + 40, PW - (tx - PX), 96, C.ink)}` +
        glyphs.text(degree, { font: "sansBold", size: 17, x: tx + 20, y: PY + 80, fill: C.ash }) +
        `<rect x="${tx + 20}" y="${PY + 100}" width="10" height="10" fill="${C.orange}"/>` +
        mono(grade, tx + 40, PY + 110, { fill: C.ash }) + "</g>"
      );
    },
    // One short instruction; the agent writes the lines and checks each.
    agent(i, [me, agent]) {
      const rows = [300, 420, 360, 470, 250];
      const lx = PX + 20;
      const out = [tile(PX, PY, PW, PH)];
      out.push(`<g ${on(i, 0.2)}>${mono(me, lx, PY + 30)}</g>`);
      out.push(`<rect x="${lx}" y="${PY + 44}" width="210" height="12" rx="2" fill="${C.orange}" ${anim(i, [[0, "transform:scaleX(0)"], [0.4, "transform:scaleX(0)"], [1.2, "transform:none"], [T, "transform:none"]], { ease: "steps(14,end)", origin: "0 50%" })}/>`);
      out.push(`<g ${on(i, 1.4)}>${mono(agent, lx, PY + 90)}</g>`);
      rows.forEach((w, k) => {
        const y = PY + 104 + k * 18;
        const t = 1.7 + k * 0.5;
        out.push(`<rect x="${lx}" y="${y}" width="${w}" height="10" rx="2" fill="${C.ink}" ${anim(i, [[0, "transform:scaleX(0)"], [t, "transform:scaleX(0)"], [t + 0.42, "transform:none"], [T, "transform:none"]], { ease: "steps(18,end)", origin: "0 50%" })}/>`);
        out.push(`<path d="M${lx + w + 14} ${y + 5}l4 4l8 -9" fill="none" stroke="${C.orange}" stroke-width="2.4" ${on(i, t + 0.45)}/>`);
      });
      return out.join("");
    },
    // Everything she owns, taken away until two things are left.
    subtract(i, [bag, case_]) {
      const cell = 22;
      const px = 14;
      const cols = Math.floor((PW - 8) / cell);
      const rows = 6;
      const rand = prng(30);
      const order = Array.from({ length: cols * rows }, (_, k) => k).sort(() => rand() - 0.5);
      const keepA = 2 * cols + 6;
      const keepB = 2 * cols + 11;
      const big = 4.6;
      const groups = Array.from({ length: 12 }, () => []);
      let g = 0;
      for (const k of order) {
        if (k === keepA || k === keepB) continue;
        groups[g++ % 12].push(`M${PX + (k % cols) * cell + 4} ${PY + 6 + Math.floor(k / cols) * cell + 4}h${px}v${px}h-${px}z`);
      }
      const kx = PX + 6 * cell + 4;
      const ky = PY + 6 + 2 * cell + 4;
      const lab = ky + px * big + 26;
      const grow = (t) => anim(i, [[0, "opacity:0;transform:none"], [0.25, "opacity:1;transform:none"], [t, "transform:none"], [t + 0.5, `transform:scale(${big})`], [T, `opacity:1;transform:scale(${big})`]],
        { ease: "cubic-bezier(.2,.7,.2,1)", hidden: i !== last, origin: "0 0" });
      return (
        groups.map((cells, k) => `<path d="${cells.join("")}" fill="${C.ink}" ${anim(i, [[0, "opacity:0"], [0.25, "opacity:1"], [1.0 + k * 0.24, "opacity:1"], [1.0 + k * 0.24 + 0.01, "opacity:0"], [T, "opacity:0"]], { hidden: true })}/>`).join("") +
        `<rect x="${kx}" y="${ky}" width="${px}" height="${px}" fill="${C.ink}" ${grow(4.0)}/>` +
        `<rect x="${kx + 5 * cell}" y="${ky}" width="${px}" height="${px}" fill="${C.orange}" ${grow(4.15)}/>` +
        `<g ${on(i, 4.5)}>${mono(bag, kx, lab)}${mono(case_, kx + 5 * cell, lab)}</g>`
      );
    },
    // A list of results; one row turns out to be her. Then the founder's words.
    surfaced(i, [name, quote, who]) {
      const lw = 270;
      const rows = [0, 1, 2, 3].map((k) => {
        const y = PY + 26 + k * 40;
        if (k !== 1) return `<rect x="${PX + 44}" y="${y + 6}" width="${[150, 0, 180, 120][k]}" height="10" rx="2" fill="${C.soft}" ${on(i, 0.3 + k * 0.15)}/><rect x="${PX + 20}" y="${y + 4}" width="14" height="14" fill="${C.soft}" ${on(i, 0.3 + k * 0.15)}/>`;
        return (
          `<rect x="${PX + 10}" y="${y - 8}" width="${lw - 20}" height="38" rx="8" fill="${C.ink}" ${on(i, 1.3)}/>` +
          `<rect x="${PX + 20}" y="${y + 4}" width="14" height="14" fill="${C.orange}" ${pop(i, 1.5)}/>` +
          `<g ${on(i, 1.5)}>${glyphs.text(name, { font: "sansBold", size: 17, x: PX + 44, y: y + 17, fill: C.ash })}</g>`
        );
      }).join("");
      const qx = PX + lw + 28;
      const lines = wrap(`“${quote}”`, "sansBold", 19, PW - lw - 36);
      return (
        tile(PX, PY, lw, PH) + rows +
        `<g ${on(i, 2.4, { rise: 10 })}>` +
        lines.map((l, k) => glyphs.text(l, { font: "sansBold", size: 19, x: qx, y: PY + 34 + k * 27, fill: C.ink })).join("") +
        `<rect x="${qx}" y="${PY + 34 + lines.length * 27 - 2}" width="10" height="10" fill="${C.orange}"/>` +
        mono(who, qx + 20, PY + 34 + lines.length * 27 + 8) + "</g>"
      );
    },
    // Three things to know now.
    today(i, labels) {
      const gap = 16;
      const w = (PW - gap * 2) / 3;
      return [0, 1, 2].map((k) => {
        const x = PX + k * (w + gap);
        const dark = k === 0;
        return (
          `<g ${on(i, 0.5 + k * 0.35, { rise: 12 })}>${tile(x, PY + 10, w, 150, dark ? C.ink : C.white)}` +
          glyphs.text(labels[k * 2], { font: "display", size: fit(labels[k * 2], { font: "display", size: 54 }, w - 44), x: x + 22, y: PY + 88, fill: dark ? C.ash : C.ink }) +
          `<rect x="${x + 22}" y="${PY + 112}" width="10" height="10" fill="${C.orange}"/>` +
          mono(labels[k * 2 + 1], x + 42, PY + 122, { fill: dark ? C.ash : C.ink, tracking: 0.08, size: fit(labels[k * 2 + 1].toUpperCase(), { font: "mono", size: 11.5, tracking: 0.08 }, w - 64) }) + "</g>"
        );
      }).join("");
    },
  };

  // ── Photographs ───────────────────────────────────────────────────────────
  // Consecutive chapters that share a photograph share one image.
  const runs = [];
  chapters.forEach((c, i) => {
    const prev = runs[runs.length - 1];
    if (prev && prev.photo === c.photo && prev.caption === c.caption) prev.to = i;
    else runs.push({ photo: c.photo, caption: c.caption, from: i, to: i });
  });
  const photos = runs.map((r) => {
    const file = path.join(root, "scripts/readme-art/assets/story", `${r.photo}.jpg`);
    const data = fs.readFileSync(file).toString("base64");
    const isLast = r.to === last;
    // each photograph stays up while the next fades in over it
    const a = 0;
    const b = (r.to - r.from + 1) * SLOT + FADE;
    const zoom = anim(r.from, [[0, "transform:scale(1)"], [b, "transform:scale(1.05)"], [T, "transform:scale(1.05)"]], { origin: "center" });
    let tab = "";
    if (r.caption) {
      const tw = glyphs.measure(r.caption.toUpperCase(), { font: "mono", size: 11.5, tracking: 0.14 });
      tab = `<rect x="${PHOTO.x + 14}" y="${PHOTO.y + PHOTO.h - 44}" width="${n(tw + 34)}" height="30" rx="6" fill="${C.ink}"/>` +
        `<rect x="${PHOTO.x + 24}" y="${PHOTO.y + PHOTO.h - 33}" width="8" height="8" fill="${C.orange}"/>` +
        mono(r.caption, PHOTO.x + 40, PHOTO.y + PHOTO.h - 24.5, { fill: C.ash, size: 11.5, tracking: 0.14 });
    }
    return `<g ${window_(r.from, a, b, !isLast)}><image ${zoom} href="data:image/jpeg;base64,${data}" x="${PHOTO.x}" y="${PHOTO.y}" width="${PHOTO.w}" height="${PHOTO.h}" preserveAspectRatio="xMidYMid slice"/>${tab}</g>`;
  });

  // ── Chapters ──────────────────────────────────────────────────────────────
  const tickW = 26;
  const tickGap = 6;
  const ticksX = COL.r - chapters.length * tickW - (chapters.length - 1) * tickGap;
  const body = [`<rect width="${W}" height="${H}" fill="${C.ash}"/>`, furniture({ w: W, h: H, ink: C.ink })];
  body.push(`<rect x="${PHOTO.x}" y="${PHOTO.y}" width="${PHOTO.w}" height="${PHOTO.h}" rx="${PHOTO.r}" fill="${C.soft}"/>`);
  body.push(`<g clip-path="url(#ph)">${photos.join("")}</g>`);
  body.push(`<rect x="${PHOTO.x}" y="${PHOTO.y}" width="${PHOTO.w}" height="${PHOTO.h}" rx="${PHOTO.r}" fill="none" stroke="${C.ink}" stroke-width="1.5"/>`);
  body.push(`<rect x="${COL.x}" y="62" width="10" height="10" fill="${C.orange}"/>` + mono(eyebrow, COL.x + 20, 72));
  chapters.forEach((_, i) => body.push(`<rect x="${ticksX + i * (tickW + tickGap)}" y="65" width="${tickW}" height="4" fill="${C.soft}"/>`));

  chapters.forEach((c, i) => {
    const make = PICTURES[c.picture];
    if (!make) throw new Error(`readme-art: unknown story picture "${c.picture}"`);
    const size = fit(c.headline, { font: "display", size: 70 }, COL.r - COL.x);
    const lines = wrap(c.line, "sans", 21, COL.r - COL.x);
    if (lines.length > 2) throw new Error(`readme-art: story line too long for two lines: "${c.line}"`);
    const scene =
      `<rect x="${ticksX + i * (tickW + tickGap)}" y="65" width="${tickW}" height="4" fill="${C.ink}"/>` +
      `<g ${on(i, 0.05, { rise: 14 })}>${glyphs.text(c.headline, { font: "display", size, x: COL.x, y: 162, fill: C.ink })}</g>` +
      `<g ${on(i, 0.3, { rise: 10 })}>${lines.map((l, k) => glyphs.text(l, { font: "sans", size: 21, x: COL.x, y: 208 + k * 30, fill: C.ink })).join("")}</g>` +
      make(i, c.labels || []);
    body.push(`<g ${window_(i, 0, SLOT, i !== last)}>${scene}</g>`);
  });

  const defs = `<clipPath id="ph"><rect x="${PHOTO.x}" y="${PHOTO.y}" width="${PHOTO.w}" height="${PHOTO.h}" rx="${PHOTO.r}"/></clipPath>` + glyphs.defs();
  return sheet({ w: W, h: H, title, css: css.join(""), defs, body: body.join(""), radius: 20 });
}
