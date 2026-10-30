// echook feature strip: one thing, large. A subagent is opened and the status
// line follows it. It sits beside the matching line in the product's own README,
// where the full card would take too long to reach this moment.
//
// Built by scripts/build-echook-strip.mjs into the PRODUCT's repo, not public/cards:
// no profile page shows it. It reads the same baked renders as the echook card, so
// every status character is the real script's output (stripMain, stripAgent) and
// the agent's name and the demo session are the film's.
//
// The still frame is the agent's view: the one moment worth keeping if it cannot move.
import { readFileSync } from "node:fs";

import { pct } from "../lib/svg-card/shell.mjs";
import { ECHOOK_INPUTS, statusRowDrawer } from "./echook.mjs";

const W = 1300, H = 124, T = 9;
const TIMES = { select: 1.2, open: 1.9, follow: 2.9, pick: 6.0, back: 6.5, returned: 7.5 };

export function buildEchookStrip({ glyphs, root }) {
  const read = (key) => readFileSync(`${root}/${ECHOOK_INPUTS[key]}`, "utf8");
  const baked = JSON.parse(read("baked"));
  const tokens = Object.fromEntries([...read("tokens").matchAll(/^\s+(\w+): "([^"]+)",/gm)].map((m) => [m[1], m[2]]));
  const C = { bg: tokens.termBg, line: tokens.termLine, fg: tokens.termFg, dim: tokens.termDim, green: tokens.green, user: tokens.termUser };
  const render = (state) => {
    const r = baked.statusline.renders.find((x) => x.state === state && x.width === "narrow");
    if (!r) throw new Error(`echook strip: no ${state} render; re-bake the film data`);
    return r;
  };
  const agentName = baked.statusline.viewedAgent.type;
  const task = read("demo").match(/agentTask: "([^"]+)"/)[1];
  const caption = read("copy").match(/HONESTY_PARTS = \[([^\]]+)\]/)[1].match(/"([^"]+)"/)[1];

  const css = [];
  const made = new Map();
  const p = (t) => pct(t, T, 3);
  const kf = (body) => {
    if (!made.has(body)) {
      const name = `s${made.size.toString(36)}`;
      css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${T}s step-end infinite}`);
      made.set(body, name);
    }
    return `class="${made.get(body)}"`;
  };
  // Agent frames are the base; main frames carry opacity="0" and appear only when animated.
  const agentWhen = kf(`0%{opacity:0}${p(TIMES.follow)}{opacity:1}${p(TIMES.returned)},100%{opacity:0}`);
  const mainWhen = kf(`0%{opacity:1}${p(TIMES.follow)}{opacity:0}${p(TIMES.returned)},100%{opacity:1}`);

  const F = 19, LH = 30;
  const row = statusRowDrawer({ glyphs, size: F, lineHeight: LH, baseline: 21, defaultFill: C.fg });
  const SX = 470, STOP = 20;
  const statusOf = (state) => render(state).rows.map((r, i) => row(r, SX, STOP + i * LH).svg).join("");

  const LX = 44, LY = 46, LLH = 34, LF = 17;
  const mono = (t, x, y, fill, bold) => glyphs.text(t, { font: bold ? "monoBold" : "mono", size: LF, x, y, fill });
  const listRow = (name, note, i, isView, isPicked) => {
    const y = LY + i * LLH;
    const color = isView ? C.green : C.dim;
    return (isPicked ? mono("›", LX, y, C.green, true) : "") +
      `<circle cx="${LX + 26}" cy="${y - 6}" r="4.5" ${isView ? `fill="${color}"` : `fill="none" stroke="${color}" stroke-width="1.6"`}/>` +
      mono(name, LX + 42, y, isView ? C.fg : C.dim, isView) + (note ? mono(note, LX + 42 + (name.length + 2) * LF * 0.6, y, C.dim) : "");
  };
  // main, then selected, then viewed (the still frame), then main selected, then main
  const lists = [
    [0, TIMES.select, 0, null], [TIMES.select, TIMES.open, 0, 1], [TIMES.pick, TIMES.back, 1, 0], [TIMES.back, T, 0, null],
  ].map(([a, b, view, picked]) => `<g ${kf(`0%{opacity:${a ? 0 : 1}}${a ? `${p(a)}{opacity:1}` : ""}${p(b)},100%{opacity:0}`)} opacity="0">${listRow("main", "", 0, view === 0, picked === 0)}${listRow(agentName, "", 1, view === 1, picked === 1)}</g>`).join("");
  const viewedList = `<g ${kf(`0%{opacity:0}${p(TIMES.open)}{opacity:1}${p(TIMES.pick)},100%{opacity:0}`)}>${listRow("main", "", 0, false, false)}${listRow(agentName, "", 1, true, true)}</g>`;

  const body =
    `<rect width="${W}" height="${H}" fill="${C.bg}"/>` + lists + viewedList +
    `<g ${agentWhen}>${statusOf("stripAgent")}</g><g ${mainWhen} opacity="0">${statusOf("stripMain")}</g>` +
    `<path d="M${SX - 32} 18V${H - 18}" stroke="${C.line}"/>` +
    glyphs.text(caption, { font: "mono", size: 10, x: W - 22, y: H - 13, fill: C.dim, anchor: "end" });

  const title = `The echook status line follows the agent in view: opening the ${agentName} subagent changes the line from ${render("stripMain").rows[0].map((s) => s.text).join("").split(" |")[0]} to ${render("stripAgent").rows[0].map((s) => s.text).join("").split(" |")[0]}, with that agent's own effort and context. Task shown: ${task}.`;
  const r = 12;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t">` +
    `<title id="t">${title.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</title>` +
    `<style>${css.join("")}@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style>` +
    `<defs>${glyphs.defs()}<clipPath id="c"><rect width="${W}" height="${H}" rx="${r}"/></clipPath></defs>` +
    `<g clip-path="url(#c)">${body}</g>` +
    `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="${r - 0.5}" fill="none" stroke="rgba(128,128,128,.35)"/>` +
    "</svg>\n";
  return { svg, title };
}
