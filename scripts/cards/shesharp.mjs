// She Sharp card. The platform a New Zealand women-in-STEM charity now runs on,
// shown at work: five of its features as mock components, one scene each.
//
// It is drawn in She Sharp's own design system, "She Sharp Editorial"
// (NZ-SheSharp/she-sharp: styles/tokens/colors.css, lib/fonts.ts): navy,
// brand purple, periwinkle and mint on the #f9f5f8 canvas; Bricolage Grotesque
// for headings, Instrument Sans for body and UI, Carattere as the script
// accent; hairlines instead of shadows; the wordmark recoloured through
// currentColor only. The identity panel is the site's hero: navy, two
// translucent discs, a headline that ends on a mint full stop.
//
// Every word and figure is already cleared somewhere, and the build reads the
// source to prove it (SHESHARP_INPUTS):
//   - interface strings, tool names, table names, the scorer's weights and the
//     skill directory names are the film replica's strings.ts, where each one
//     is asserted against She Sharp's own source;
//   - the headline, the scene labels, the three panel figures and the
//     first-send count are the film's cleared copy (copy.ts).
// It keeps the film's rules: no member name or face (people are plain discs
// and placeholder bars), no invented model reply (the assistant answers with
// the event record its tool returns), no invented Slack figure (value
// positions are bars), no charity-scale figure, no hours-saved claim, and the
// send counter is a count, not a clock.
//
// Nothing is raster and nothing is cut from the film, so the card needs no
// ffmpeg. Where the film studio checkout is absent the card is not rebuilt and
// the committed SVG stands.
import { readFileSync } from "node:fs";

import { wrap } from "../lib/svg-card/film.mjs";
import { CARD, card, pct } from "../lib/svg-card/shell.mjs";

export const SHESHARP_FONTS = {
  heading: "scripts/cards/fonts/shesharp/BricolageGrotesque-800.ttf",
  headingBold: "scripts/cards/fonts/shesharp/BricolageGrotesque-700.ttf",
  sans: "scripts/cards/fonts/shesharp/InstrumentSans-400.ttf",
  sansMid: "scripts/cards/fonts/shesharp/InstrumentSans-500.ttf",
  sansBold: "scripts/cards/fonts/shesharp/InstrumentSans-600.ttf",
  script: "scripts/cards/fonts/shesharp/Carattere-400.ttf",
  // code panes and the terminal only; the film replica sets them in the same face
  mono: "cv/fonts/JetBrainsMono-Regular.ttf",
};
export const SHESHARP_INPUTS = {
  strings: "../she-sharp-promo-studio/src/core/strings.ts",
  copy: "../she-sharp-promo-studio/src/core/copy.ts",
};

// She Sharp Editorial tokens, and the code-pane ground the film replica uses.
const SS = { canvas: "#f9f5f8", white: "#ffffff", navy: "#1f1e44", ink700: "#4a4970", ink600: "#5a5880", ink500: "#706e8d", ink300: "#c5c4d9", ink200: "#e7e6f2", ink100: "#f4f4fa", brand: "#9b2e83", brandHover: "#c846ab", surfacePurple: "#f7e5f3", periwinkle: "#8982ff", periwinkleSoft: "#c4c1ff", mint: "#b1f6e9", code: "#14132b" };
// Slack's own surface colours, for the Slack message (stylised chrome).
const SLACK = { ink: "#1d1c1d", muted: "#616061", rule: "#dddddd", green: "#007a5a", red: "#e01e5a" };

const EYEBROW = "WOMEN-IN-STEM CHARITY PLATFORM";

export function buildShesharpCard({ glyphs, root, project }) {
  // ── Sources: a string is drawn only if the film's reviewed files say it ────
  const strings = readFileSync(`${root}/${SHESHARP_INPUTS.strings}`, "utf8");
  const copy = readFileSync(`${root}/${SHESHARP_INPUTS.copy}`, "utf8");
  const from = (src, name) => (text) => {
    if (!src.includes(text)) throw new Error(`shesharp card: "${text}" is no longer in ${name}`);
    return text;
  };
  const ui = from(strings, SHESHARP_INPUTS.strings);
  const film = from(copy, SHESHARP_INPUTS.copy);
  if (!/women-in-STEM charity/.test(project.tagline)) throw new Error("shesharp card: the eyebrow no longer matches projects[she-sharp].tagline");

  const HEADLINE = [film("A charity, on"), `${film("infrastructure")} ${film("it owns.").slice(0, -1)}`];
  const FIGURES = [film("63 pages"), film("39 tables"), film("11 agent skills")].map((f) => [f.split(" ")[0], f.slice(f.indexOf(" ") + 1)]);
  const SKILLS = strings.match(/skills: \[([^\]]+)\]/)[1].match(/[a-z][a-z-]+/g);
  if (String(SKILLS.length) !== FIGURES[2][0]) throw new Error(`shesharp card: ${SKILLS.length} skill directories, but the film says ${FIGURES[2].join(" ")}`);
  const FACTORS = [["MBTI", "mbtiScore"], ["Skills", "skillScore"], ["Goals", "goalScore"], ["Industry", "industryScore"], ["Logistics", "logisticsScore"]].map(([label, key]) => {
    const weight = strings.match(new RegExp(`${key} \\* (0\\.\\d+)`));
    if (!weight) throw new Error(`shesharp card: no weight for ${key} in ${SHESHARP_INPUTS.strings}`);
    return { label: ui(`"${label}"`).slice(1, -1), weight: weight[1] };
  });
  const RECIPIENTS = Number(copy.match(/CUTOVER_RECIPIENTS = (\d+)/)[1]);
  const EVENT = { title: ui("Beyond the Code: Women Leading the Future of Cybersecurity and AI"), date: ui("October 8, 2026"), time: ui("5:00pm – 8:00pm NZDT") };

  // ── Timeline: five scenes of equal length ──────────────────────────────────
  const SCENES = [film("Slack, wired in"), film("AI assistant"), film("Mentor matching"), film("Mailing list"), film("Agent skills")];
  const STILL = 2; // mentor matching, finished: what a reader with motion off sees
  const D = 5.4;
  const T = D * SCENES.length;
  const p = (t) => pct(t, T, 3);
  const css = [
    ".fb{transform-box:fill-box}",
    `@keyframes st{0%{opacity:0}${p(0.3)},${p(D - 0.3)}{opacity:1}${p(D)},100%{opacity:0}}.st{animation:st ${T}s linear infinite}`,
  ];
  let serial = 0;
  const anim = (body, extra = "") => {
    const name = `k${(serial++).toString(36)}`;
    css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${T}s linear infinite${extra}}`);
    return name;
  };
  // base states are the finished frame: `on` and `rise` end visible, `span` and `until` end hidden
  const on = (inner, t, f = 0.25) => `<g class="${anim(`0%,${p(t)}{opacity:0}${p(t + f)},100%{opacity:1}`)}">${inner}</g>`;
  const rise = (inner, t, dy = 8) => `<g class="${anim(`0%,${p(t)}{opacity:0;transform:translateY(${dy}px)}${p(t + 0.35)},100%{opacity:1;transform:none}`)}">${inner}</g>`;
  const span = (inner, a, b, f = 0.2) => `<g class="${anim(`0%,${p(a)}{opacity:0}${p(a + f)},${p(b)}{opacity:1}${p(b + f)},100%{opacity:0}`)}" opacity="0">${inner}</g>`;
  const until = (inner, t, f = 0.2) => `<g class="${anim(`0%,${p(t)}{opacity:1}${p(t + f)},100%{opacity:0}`)}" opacity="0">${inner}</g>`;
  // text that types itself: a cover the colour of its ground shrinks off it, one step a character
  const typed = (inner, { x, y, w, h, fill, chars, a, b }) =>
    `${inner}<rect class="fb ${anim(`0%,${p(a)}{transform:scaleX(1);animation-timing-function:steps(${chars},end)}${p(b)},100%{transform:scaleX(0)}`, ";transform-origin:100% 50%")}" x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" transform="scale(0 1)"/>`;
  // a bar that grows from its left end
  const grow = (rect, a, b) => rect.replace("<rect", `<rect class="fb ${anim(`0%,${p(a)}{transform:scaleX(0);animation-timing-function:cubic-bezier(.2,.7,.2,1)}${p(b)},100%{transform:scaleX(1)}`, ";transform-origin:0 50%")}"`);
  // a pointer that travels between [t, x, y] stops and is gone once it has clicked
  const cursor = (stops) => {
    const frames = stops.map(([t, x, y], n) => `${n ? "" : "0%,"}${p(t)}${n === stops.length - 1 ? ",100%" : ""}{transform:translate(${x}px,${y}px);animation-timing-function:cubic-bezier(.4,0,.2,1)}`).join("");
    const arrow = `<g class="${anim(frames)}"><path d="M0 0V15L4.2 11.2L6.9 17L9.3 15.9L6.7 10.2H12Z" fill="${SS.navy}" stroke="${SS.white}" stroke-width="1.2" stroke-linejoin="round"/></g>`;
    return span(arrow, stops[0][0] - 0.2, stops[stops.length - 1][0] + 0.45);
  };
  const click = (x, y, t) => span(`<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="${SS.brandHover}" stroke-width="2"/>`, t, t + 0.2, 0.12);

  // ── Drawing helpers ────────────────────────────────────────────────────────
  const tx = (str, font, size, x, y, fill, o = {}) => glyphs.text(str, { font, size, x, y, fill, ...o });
  const tw = (str, font, size, tracking = 0) => glyphs.measure(str, { font, size, tracking });
  const box = (x, y, w, h, r, fill, stroke, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}"` : ""}${extra}/>`;
  const skel = (x, y, w, h = 7, fill = SS.ink200) => box(x, y, Number(w.toFixed(1)), h, h / 2, fill);
  const tick = (x, y, s, stroke) => `<path d="M${x - 4 * s} ${y}L${x - 1.2 * s} ${y + 3 * s}L${x + 4.2 * s} ${y - 3.2 * s}" fill="none" stroke="${stroke}" stroke-width="${1.8 * s}" stroke-linecap="round" stroke-linejoin="round"/>`;
  // a button: its label centred in a rounded rectangle
  const button = (label, x, y, w, h, { fill, text, stroke, r = 12, size = 12, font = "sansMid" }) =>
    box(x, y, w, h, r, fill, stroke) + tx(label, font, size, x + w / 2, y + h / 2 + size * 0.35, text, { anchor: "middle" });
  const wordmark = readFileSync(`${root}/public/brands/she-sharp-wordmark.svg`, "utf8").match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1];
  const defs = [`<clipPath id="idp"><rect width="${CARD.panel}" height="${CARD.h}"/></clipPath>`, `<symbol id="wm" viewBox="0 0 136 51">${wordmark}</symbol>`];
  const mark = (x, y, w, color) => `<svg x="${x}" y="${y}" width="${w}" height="${((w * 51) / 136).toFixed(1)}" color="${color}"><use href="#wm"/></svg>`;
  // the round She# badge the product uses as its app avatar
  const badge = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${SS.brand}"/>${mark(cx - r * 0.72, cy - r * 0.27, r * 1.44, SS.white)}`;

  // ── Identity: the site's own hero, navy with its two discs ─────────────────
  const X = CARD.panel;
  const h1 = { font: "heading", size: 35 };
  if (40 + glyphs.measure(HEADLINE[1], h1) + 16 > X - 24) throw new Error("shesharp card: the headline no longer fits the panel");
  const identity = [
    `<g clip-path="url(#idp)"><rect width="${X}" height="${CARD.h}" fill="${SS.navy}"/>` +
      `<circle cx="440" cy="50" r="170" fill="${SS.periwinkle}" fill-opacity=".2"/><circle cx="486" cy="352" r="124" fill="${SS.brand}" fill-opacity=".5"/></g>`,
    tx(EYEBROW, "sansBold", 11, 40, 50, SS.periwinkleSoft, { tracking: 0.16 }),
    mark(38, 74, 168, SS.white),
    tx(HEADLINE[0], h1.font, h1.size, 40, 196, SS.white),
    tx(HEADLINE[1], h1.font, h1.size, 40, 240, SS.white),
    // the site ends its hero line on a mint full stop
    `<circle cx="${(40 + glyphs.measure(HEADLINE[1], h1) + 9).toFixed(1)}" cy="234" r="5.5" fill="${SS.mint}"/>`,
  ];
  let fx = 40;
  FIGURES.forEach(([value, label]) => {
    identity.push(tx(value, "heading", 27, fx, 306, SS.white), tx(label, "sansMid", 12, fx, 326, SS.periwinkleSoft));
    fx += Math.max(tw(value, "heading", 27), tw(label, "sansMid", 12)) + 34;
  });

  // ── Stage frame: every mock sits in the same 744 × 284 field ───────────────
  const L = X + 28;
  const R = CARD.w - 28;
  const TOP = 54;
  const H = 284;
  const scenes = SCENES.map(() => []);
  const start = (i) => i * D;

  // 1 · Slack, wired in: a sync preview in Slack is confirmed, and the event is on the site
  {
    const s = scenes[0];
    const at = (o) => start(0) + o;
    const mx = L + 48; // the message column, right of the avatar
    const MY = TOP + 24;
    s.push(box(L, TOP, 372, H, 14, SS.white, SS.ink200), badge(L + 26, MY + 34, 13));
    const app = "She Sharp";
    s.push(tx(app, "sansBold", 12.5, mx, MY + 32, SLACK.ink), box(mx + tw(app, "sansBold", 12.5) + 7, MY + 22, 27, 13, 3, "#e8e8e8"), tx("APP", "sansBold", 9, mx + tw(app, "sansBold", 12.5) + 20.5, MY + 32, SLACK.muted, { anchor: "middle" }));
    const preview = ui("Preview:");
    s.push(on(tx(preview, "sansBold", 11.5, mx, MY + 58, SLACK.ink) + skel(mx + tw(preview, "sansBold", 11.5) + 8, MY + 51, 176, 7, "#d9d9de"), at(0.5)));
    const [lead, file, tail] = ui("Changes to `events-custom.json`:").split("`");
    const leadW = tw(lead, "sansBold", 11.5);
    const fileW = tw(file, "mono", 10.5);
    s.push(on(tx(lead, "sansBold", 11.5, mx, MY + 82, SLACK.ink) + box(mx + leadW, MY + 70, fileW + 10, 17, 4, "#f6f6f6", SLACK.rule) + tx(file, "mono", 10.5, mx + leadW + 5, MY + 82, SLACK.red) + tx(tail, "sansBold", 11.5, mx + leadW + fileW + 12, MY + 82, SLACK.ink), at(0.8)));
    s.push(on(box(mx, MY + 96, 306, 92, 6, "#f8f8f8", SLACK.rule), at(0.8)));
    [["+", 0.62], ["+", 0.44], ["-", 0.3], ["+", 0.52]].forEach(([sign, len], n) => {
      const y = MY + 118 + n * 19;
      const add = sign === "+";
      s.push(on(tx(sign, "mono", 11.5, mx + 12, y, add ? SLACK.green : SLACK.red) + skel(mx + 28, y - 8, 262 * len, 8, add ? "#bfe5d6" : "#f3c2cf"), at(1.15 + n * 0.25), 0.15));
    });
    const confirm = ui("Confirm & Open PR");
    const cw = tw(confirm, "sansBold", 11.5) + 26;
    const pressAt = at(3.0);
    s.push(span(button(confirm, mx, MY + 206, cw, 30, { fill: SLACK.green, text: SS.white, r: 6, size: 11.5, font: "sansBold" }) + button(ui('"Cancel"').slice(1, -1), mx + cw + 8, MY + 206, 64, 30, { fill: SS.white, text: SLACK.red, stroke: SLACK.red, r: 6, size: 11.5, font: "sansBold" }), at(2.1), pressAt + 0.1));
    s.push(on(box(mx, MY + 211, 20, 20, 5, SLACK.green) + tick(mx + 10, MY + 221, 1.1, SS.white) + tx(ui("PR opened:"), "sansBold", 12.5, mx + 29, MY + 225.5, SLACK.ink) + skel(mx + 29 + tw("PR opened:", "sansBold", 12.5) + 8, MY + 217, 44, 8, "#b9d4f0"), pressAt + 0.3));
    s.push(cursor([[at(2.3), mx + 190, MY + 150], [at(2.9), mx + 54, MY + 222]]), click(mx + 54, MY + 222, pressAt));

    // the public events page, where the record lands
    const bx = L + 388;
    const bw = R - bx;
    s.push(box(bx, TOP, bw, H, 14, SS.white, SS.ink200), box(bx + 14, TOP + 8, 190, 16, 8, SS.canvas), tx(film("shesharp.org.nz/events"), "sans", 9.5, bx + 24, TOP + 19.5, SS.ink600), `<path d="M${bx} ${TOP + 32}h${bw}" stroke="${SS.ink200}"/>`);
    const ex = bx + 16;
    const ey = TOP + 46;
    const ew = bw - 32;
    const eh = H - 60;
    s.push(until(box(ex, ey, ew, eh, 20, "none", SS.ink300, ' stroke-dasharray="4 4"'), pressAt + 0.6));
    defs.push(`<clipPath id="evc"><rect x="${ex}" y="${ey}" width="${ew}" height="${eh}" rx="20"/></clipPath>`);
    const titleStyle = { font: "headingBold", size: 14.5 };
    const title = wrap(glyphs, EVENT.title, titleStyle, ew - 36);
    const eventCard = [
      `<g clip-path="url(#evc)"><rect x="${ex}" y="${ey}" width="${ew}" height="${eh}" fill="${SS.white}"/><rect x="${ex}" y="${ey}" width="${ew}" height="88" fill="${SS.brand}"/><circle cx="${ex + ew - 40}" cy="${ey + 6}" r="74" fill="${SS.white}" fill-opacity=".16"/></g>`,
      box(ex, ey, ew, eh, 20, "none", SS.ink200),
      ...title.map((l, n) => tx(l, titleStyle.font, titleStyle.size, ex + 18, ey + 114 + n * 18.5, SS.navy)),
      tx(`${EVENT.date} · ${EVENT.time}`, "sans", 11, ex + 18, ey + 120 + title.length * 18.5, SS.ink600),
      button(ui("View details"), ex + 18, ey + eh - 44, 104, 28, { fill: SS.white, text: SS.navy, stroke: SS.ink300, r: 14, size: 11.5 }),
    ];
    s.push(rise(eventCard.join(""), pressAt + 0.7, 14));
  }

  // 2 · AI assistant: a visitor asks, the agent calls a typed tool, the record comes back
  {
    const s = scenes[1];
    const at = (o) => start(1) + o;
    const sendAt = at(1.9);
    const toolAt = at(2.4);
    const answerAt = at(3.6);
    // the tool-call pane
    const pw = 330;
    s.push(box(L, TOP, pw, H, 14, SS.code), tx(ui("lib/chatbot/tools.ts"), "mono", 10, L + 18, TOP + 25, SS.mint));
    const tools = ["findEvents", "getEventDetails", "getMentors", "getTeamMembers"].map(ui);
    tools.forEach((name, n) => {
      const y = TOP + 38 + n * 27;
      s.push(box(L + 18, y, pw - 36, 22, 7, "#ffffff", "#ffffff", ' fill-opacity=".05" stroke-opacity=".08"') + `<circle cx="${L + 32}" cy="${y + 11}" r="3" fill="#ffffff" fill-opacity=".3"/>` + tx(name, "mono", 10.5, L + 44, y + 14.8, "#ffffff", { attrs: 'fill-opacity=".78"' }));
      if (n === 0) s.push(on(box(L + 18, y, pw - 36, 22, 7, "#273a4a", SS.mint) + `<circle cx="${L + 32}" cy="${y + 11}" r="3" fill="${SS.mint}"/>` + tx(name, "mono", 10.5, L + 44, y + 14.8, SS.mint), toolAt));
    });
    const call = [[tools[0], SS.mint], ["({ ", "#ffffff"], [`${ui("timeframe")}: `, "#ffffff"], [`"${ui("upcoming")}"`, SS.periwinkleSoft], [" })", "#ffffff"]];
    let cx = L + 18;
    const callLine = call.map(([part, fill]) => {
      const run = tx(part, "mono", 10.5, cx, TOP + 180, fill);
      cx += tw(part, "mono", 10.5);
      return run;
    });
    s.push(rise(tx(film('"call"').slice(1, -1), "mono", 9.5, L + 18, TOP + 163, "#ffffff", { attrs: 'fill-opacity=".55"' }) + callLine.join(""), toolAt + 0.25, 6));
    s.push(rise(tx(`${film('"result"').slice(1, -1)} · ${ui("lib/data/json/events-custom.json")}`, "mono", 9.5, L + 18, TOP + 206, "#ffffff", { attrs: 'fill-opacity=".55"' }) + box(L + 18, TOP + 215, pw - 36, 50, 8, "#ffffff", null, ' fill-opacity=".06"') + tx(EVENT.date, "mono", 10.5, L + 30, TOP + 235, SS.periwinkleSoft) + tx(EVENT.time, "mono", 10.5, L + 30, TOP + 252, "#ffffff"), toolAt + 0.7, 6));

    // the chat panel
    const px = L + pw + 16;
    const cw = R - px;
    s.push(box(px, TOP, cw, H, 14, SS.white, SS.ink200), `<path d="M${px} ${TOP + 38}V${TOP + 14}a14 14 0 0 1 14 -14H${R - 14}a14 14 0 0 1 14 14V${TOP + 38}Z" fill="${SS.navy}"/>`);
    s.push(box(px + 16, TOP + 12, 17, 14, 4, "none", SS.white, ' stroke-width="1.5"'), tx(ui("She Sharp Assistant"), "sansBold", 12.5, px + 42, TOP + 23.5, SS.white), `<path d="M${R - 24} ${TOP + 14}l10 10m0 -10l-10 10" stroke="${SS.white}" stroke-opacity=".8" stroke-width="1.4"/>`);
    const question = ui("When is the next event?");
    const qw = tw(question, "sans", 11.5);
    s.push(rise(box(R - 16 - qw - 24, TOP + 50, qw + 24, 28, 12, SS.ink100) + tx(question, "sans", 11.5, R - 28 - qw, TOP + 68, SS.navy), sendAt + 0.1, 6));
    const ax = px + 44;
    const dots = [0, 1, 2].map((n) => `<circle cx="${ax + 16 + n * 9}" cy="${TOP + 104}" r="3" fill="${SS.brand}" fill-opacity="${n === 1 ? 1 : 0.4}"/>`).join("");
    s.push(span(badge(px + 26, TOP + 106, 10) + box(ax, TOP + 91, 50, 26, 12, SS.surfacePurple) + dots, sendAt + 0.4, answerAt - 0.15, 0.15));
    const answerStyle = { font: "headingBold", size: 12.5 };
    const answer = wrap(glyphs, EVENT.title, answerStyle, cw - 96);
    const ah = 26 + answer.length * 16 + 38;
    s.push(rise(badge(px + 26, TOP + 91 + ah - 12, 10) + box(ax, TOP + 91, cw - 68, ah, 14, SS.surfacePurple) + answer.map((l, n) => tx(l, answerStyle.font, answerStyle.size, ax + 14, TOP + 112 + n * 16, SS.navy)).join("") + tx(EVENT.date, "sansBold", 11, ax + 14, TOP + 116 + answer.length * 16, SS.brand) + tx(EVENT.time, "sans", 11, ax + 14, TOP + 132 + answer.length * 16, SS.ink700), answerAt));
    // the input: the question is typed, sent, and the placeholder returns
    const iy = TOP + H - 44;
    const iw = cw - 32 - 38;
    s.push(`<path d="M${px} ${iy - 10}h${cw}" stroke="${SS.ink200}"/>`, box(px + 16, iy, iw, 30, 10, SS.white, SS.brand));
    const placeholder = tx(ui("Type your message..."), "sans", 11.5, px + 28, iy + 19, SS.ink500);
    s.push(`<g class="${anim(`0%,${p(at(0.45))}{opacity:1}${p(at(0.5))},${p(sendAt)}{opacity:0}${p(sendAt + 0.15)},100%{opacity:1}`)}">${placeholder}</g>`);
    s.push(span(typed(tx(question, "sans", 11.5, px + 28, iy + 19, SS.navy), { x: px + 27, y: iy + 4, w: Math.ceil(qw) + 3, h: 22, fill: SS.white, chars: question.length, a: at(0.5), b: at(1.5) }), at(0.5), sendAt - 0.05, 0.05));
    const bx = R - 16 - 30;
    s.push(box(bx, iy, 30, 30, 10, SS.brand), `<path d="M${bx + 21} ${iy + 9}L${bx + 14} ${iy + 16}M${bx + 21} ${iy + 9}L${bx + 16.5} ${iy + 21.5}L${bx + 14} ${iy + 16}L${bx + 8.5} ${iy + 13.5}Z" fill="none" stroke="${SS.white}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`);
    s.push(cursor([[at(1.1), px + 200, TOP + 190], [at(1.75), bx + 13, iy + 14]]), click(bx + 15, iy + 15, sendAt - 0.05));
  }

  // 3 · Mentor matching: the model scores a pair on five weighted factors, an admin approves
  {
    const s = scenes[2];
    const at = (o) => start(2) + o;
    const runAt = at(1.1);
    const approveAt = at(4.1);
    s.push(box(L, TOP, R - L, H, 14, SS.white, SS.ink200), badge(L + 30, TOP + 26, 13), tx(ui("AI Matching Management"), "headingBold", 17, L + 52, TOP + 32, SS.navy));
    const run = ui("Run AI Matching");
    const rw = tw(run, "sansMid", 12) + 30;
    s.push(button(run, R - 18 - rw, TOP + 11, rw, 30, { fill: SS.navy, text: SS.white }), `<path d="M${L} ${TOP + 52}h${R - L}" stroke="${SS.ink200}"/>`);
    // the pair: plain discs and bars, never a person
    [[ui('"Mentor"').slice(1, -1), SS.surfacePurple, SS.brand], [ui('"Mentee"').slice(1, -1), SS.ink200, SS.periwinkle]].forEach(([role, tint, ink], n) => {
      const y = TOP + 66 + n * 72;
      const w = tw(role, "sansBold", 10.5) + 18;
      s.push(box(L + 18, y, 232, 62, 16, SS.canvas, SS.ink200), `<circle cx="${L + 49}" cy="${y + 31}" r="18" fill="${tint}"/><circle cx="${L + 49}" cy="${y + 31}" r="6" fill="${ink}" fill-opacity=".55"/>`, box(L + 78, y + 11, w, 18, 9, tint), tx(role, "sansBold", 10.5, L + 87, y + 23.8, ink), skel(L + 78, y + 37, 136, 6), skel(L + 78, y + 48, 92, 5));
    });
    const approve = ui("Approve Match");
    const ay = TOP + H - 54;
    s.push(until(button(approve, L + 18, ay, 232, 36, { fill: SS.brand, text: SS.white, font: "sansBold", size: 12.5 }), approveAt));
    const aw = tw(approve, "sansBold", 12.5);
    s.push(box(L + 18, ay, 232, 36, 12, SS.mint).replace("<rect", `<rect class="${anim(`0%,${p(approveAt)}{opacity:0}${p(approveAt + 0.2)},100%{opacity:1}`)}"`), on(tick(L + 134 - aw / 2 - 8, ay + 18, 1.1, SS.navy) + tx(approve, "sansBold", 12.5, L + 134 - aw / 2 + 6, ay + 22.4, SS.navy), approveAt));
    // the score breakdown: bar length is the factor's weight in the scorer, on one scale
    const cx = L + 268;
    const cw = R - 18 - cx;
    s.push(box(cx, TOP + 66, cw, H - 84, 20, SS.canvas, SS.ink200), tx(ui("Score Breakdown"), "sansBold", 13.5, cx + 22, TOP + 94, SS.navy));
    const conf = ui("High Confidence");
    const confW = tw(conf, "sansBold", 10.5) + 22;
    s.push(rise(box(cx + cw - 20 - confW, TOP + 79, confW, 22, 11, SS.navy) + tx(conf, "sansBold", 10.5, cx + cw - 9 - confW, TOP + 93.8, SS.canvas), at(3.1), 5));
    const track = cw - 22 - 78 - 86;
    const widest = Math.max(...FACTORS.map((f) => Number(f.weight)));
    FACTORS.forEach((f, n) => {
      const y = TOP + 122 + n * 25;
      const t = runAt + 0.3 + n * 0.3;
      s.push(tx(f.label, "sansMid", 12, cx + 22, y + 4, SS.navy), box(cx + 100, y - 5, track, 10, 5, SS.ink200));
      s.push(grow(box(cx + 100, y - 5, Number(((Number(f.weight) / widest) * track).toFixed(1)), 10, 5, n % 2 ? SS.periwinkle : SS.brand), t, t + 0.55));
      s.push(on(tx(`× ${f.weight}`, "mono", 10.5, cx + 112 + track, y + 3.8, SS.ink600), t + 0.3));
    });
    s.push(cursor([[at(0.5), cx + 150, TOP + 170], [at(1.0), R - 18 - rw / 2, TOP + 26], [at(3.3), R - 18 - rw / 2, TOP + 26], [at(4.0), L + 150, ay + 18]]), click(R - 18 - rw / 2 + 2, TOP + 28, runAt), click(L + 152, ay + 20, approveAt));
  }

  // 4 · Mailing list: sign-up, double opt-in in the charity's own table, the first send
  {
    const s = scenes[3];
    const at = (o) => start(3) + o;
    const subAt = at(1.7);
    const confirmAt = at(2.9);
    const lw = 292;
    s.push(box(L, TOP, lw, H, 20, SS.white, SS.ink200));
    s.push(until(tx(ui("Sign up"), "headingBold", 24, L + 24, TOP + 52, SS.navy), subAt), on(tx(ui("Check your inbox"), "headingBold", 24, L + 24, TOP + 52, SS.navy), subAt + 0.15));
    s.push(tx(ui("Email address"), "sansMid", 11.5, L + 24, TOP + 86, SS.navy), box(L + 24, TOP + 96, lw - 48, 36, 12, SS.white, SS.brand));
    const email = ui("you@example.com");
    s.push(typed(tx(email, "sans", 13, L + 38, TOP + 118.5, SS.navy), { x: L + 37, y: TOP + 102, w: Math.ceil(tw(email, "sans", 13)) + 3, h: 24, fill: SS.white, chars: email.length, a: at(0.4), b: at(1.3) }));
    const subscribe = ui('"Subscribe"').slice(1, -1);
    s.push(until(button(subscribe, L + 24, TOP + 146, 118, 36, { fill: SS.brand, text: SS.white, size: 12.5 }), subAt), on(button(subscribe, L + 24, TOP + 146, 118, 36, { fill: SS.ink200, text: SS.ink600, size: 12.5 }), subAt + 0.1));
    s.push(skel(L + 24, TOP + 214, 214, 7), skel(L + 24, TOP + 230, 150, 7));

    // the consent record
    const rx = L + lw + 16;
    const rw = R - rx;
    const table = ui("newsletter_subscribers");
    s.push(box(rx, TOP, rw, 116, 16, SS.code), tx(table, "mono", 10.5, rx + 22, TOP + 28, SS.mint), tx(ui("status"), "mono", 12, rx + 22, TOP + 60, "#ffffff", { attrs: 'fill-opacity=".6"' }));
    const sx = rx + 22 + tw("status", "mono", 12) + 12;
    const state = (label, fill, text, o = "") => box(sx, TOP + 45, tw(label, "mono", 11.5) + 24, 22, 11, fill, null, o) + tx(label, "mono", 11.5, sx + 12, TOP + 60, text);
    s.push(until(state(film('"…"').slice(1, -1), "#ffffff", "#ffffff", ' fill-opacity=".14"'), subAt + 0.2, 0.1));
    s.push(span(state(ui('"pending"').slice(1, -1), "#ffffff", "#ffffff", ' fill-opacity=".14"'), subAt + 0.3, confirmAt, 0.1), on(state(ui('"subscribed"').slice(1, -1), SS.mint, SS.navy), confirmAt + 0.1));
    const confirm = ui("Confirm my subscription");
    const cw = tw(confirm, "sansMid", 12) + 30;
    s.push(span(button(confirm, rx + 22, TOP + 76, cw, 28, { fill: SS.brand, text: SS.white, r: 10 }), subAt + 0.3, confirmAt), on(button(confirm, rx + 22, TOP + 76, cw, 28, { fill: "#2c2b45", text: "#a9a8be", r: 10 }), confirmAt + 0.1));

    // the first send from the new system: a count, not a clock
    const sy = TOP + 130;
    const sendA = confirmAt + 0.4;
    const sendB = sendA + 1.3;
    const fmt = (v) => v.toLocaleString("en-NZ");
    s.push(box(rx, sy, rw, H - 130, 20, SS.white, SS.ink200), tx(film("First send from the new system").toUpperCase(), "sansBold", 9.5, rx + 22, sy + 27, SS.ink600, { tracking: 0.16 }));
    const big = { font: "heading", size: 40 };
    const STEPS = 9;
    for (let n = 0; n <= STEPS; n++) {
      const e = n / STEPS;
      const value = tx(fmt(Math.round(RECIPIENTS * (e < 0.5 ? 4 * e ** 3 : 1 - (-2 * e + 2) ** 3 / 2))), big.font, big.size, rx + 22, sy + 72, SS.navy);
      const a = sendA + (n * (sendB - sendA)) / STEPS;
      s.push(n === STEPS ? on(value, a, 0.01) : span(value, n ? a : start(3), a + (sendB - sendA) / STEPS, 0.01));
    }
    s.push(tx(`/ ${fmt(RECIPIENTS)}`, "sans", 14, rx + 30 + glyphs.measure(fmt(RECIPIENTS), big), sy + 72, SS.ink600));
    s.push(box(rx + 22, sy + 88, rw - 44, 9, 4.5, SS.ink100), box(rx + 22, sy + 88, rw - 44, 9, 4.5, SS.brand).replace("<rect", `<rect class="fb ${anim(`0%,${p(sendA)}{transform:scaleX(0);animation-timing-function:cubic-bezier(.65,0,.35,1)}${p(sendB)},100%{transform:scaleX(1)}`, ";transform-origin:0 50%")}"`));
    s.push(rise(`<circle cx="${rx + 32}" cy="${sy + 124}" r="10" fill="${SS.mint}"/>` + tick(rx + 32, sy + 124, 1, SS.brand) + tx(film("0 failures"), "sansBold", 13, rx + 50, sy + 128.6, SS.navy), sendB + 0.15, 5));
    s.push(cursor([[at(1.0), L + 210, TOP + 226], [at(1.55), L + 84, TOP + 164], [at(2.1), L + 84, TOP + 164], [at(2.75), rx + 22 + cw / 2, TOP + 90]]), click(L + 86, TOP + 166, subAt), click(rx + 24 + cw / 2, TOP + 92, confirmAt));
  }

  // 5 · Agent skills: the directory an operator's agent runs the charity's recurring work from
  {
    const s = scenes[4];
    const at = (o) => start(4) + o;
    const cmd = film("ls .claude/skills/");
    s.push(box(L, TOP, R - L, H, 14, SS.code), tx("$", "mono", 13, L + 22, TOP + 31, SS.mint));
    s.push(typed(tx(cmd, "mono", 13, L + 40, TOP + 31, "#ffffff"), { x: L + 39, y: TOP + 16, w: Math.ceil(tw(cmd, "mono", 13)) + 3, h: 22, fill: SS.code, chars: cmd.length, a: at(0.4), b: at(1.2) }));
    const COLS = 3;
    const gap = 10;
    const cw = (R - L - 44 - gap * (COLS - 1)) / COLS;
    const ch = 48;
    const cell = (n) => [L + 22 + (n % COLS) * (cw + gap), TOP + 48 + Math.floor(n / COLS) * (ch + gap)];
    const skillFile = ui('"SKILL.md"').slice(1, -1);
    SKILLS.forEach((name, n) => {
      const [x, y] = cell(n);
      const t = at(1.4 + n * 0.2);
      const row = box(x, y, cw, ch, 12, "#ffffff", "#ffffff", ' fill-opacity=".05" stroke-opacity=".12"') + tx(String(n + 1).padStart(2, "0"), "mono", 10, x + 14, y + 21, "#ffffff", { attrs: 'fill-opacity=".5"' }) + tx(name, "mono", 11.5, x + 38, y + 21, "#ffffff") + tx(skillFile, "mono", 9.5, x + 38, y + 37, SS.mint, { attrs: 'fill-opacity=".9"' });
      s.push(rise(row, t, 0), span(box(x, y, cw, ch, 12, SS.mint, SS.mint, ' fill-opacity=".14"'), t, t + 0.2, 0.12));
    });
    const [dx, dy] = cell(SKILLS.length);
    s.push(rise(box(dx, dy, cw, ch, 12, SS.mint) + tx(String(SKILLS.length), "heading", 26, dx + 16, dy + 33, SS.navy) + tx(film('"directories"').slice(1, -1), "mono", 11.5, dx + 26 + tw(String(SKILLS.length), "heading", 26), dy + 29, SS.navy), at(1.4 + SKILLS.length * 0.2 + 0.2), 6));
  }

  // ── Assemble: each scene under its label, with a tick per scene ────────────
  const delay = (t) => `animation-delay:${(t - T).toFixed(2)}s`;
  const stage = [`<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${SS.canvas}"/>`];
  SCENES.forEach((label, i) => {
    const tk = R - (SCENES.length - i) * 22 + 6;
    stage.push(`<rect x="${tk}" y="29" width="16" height="3" rx="1.5" fill="${SS.ink300}"/>`);
    // the label is set as the site sets a hero eyebrow: in the script face
    const inner = tx(label, "script", 25, L, 40, SS.brand) + `<rect x="${tk}" y="29" width="16" height="3" rx="1.5" fill="${SS.brand}"/>` + scenes[i].join("");
    stage.push(`<g class="st" style="${delay(start(i))}"${i === STILL ? "" : ' opacity="0"'}>${inner}</g>`);
  });

  return {
    svg: card({
      title: "She Sharp: the platform a New Zealand women-in-STEM charity runs on, a charity on infrastructure it owns. The stage shows five of its features at work: an event synced from Slack to the website, the visitor assistant calling a typed tool, AI mentor matching scored on five factors and approved by an admin, the mailing list’s double opt-in and first send, and the agent skills that run recurring work.",
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body: stage.join("") + identity.join(""),
      radius: 16,
    }),
    facts: { scenes: SCENES.length, skills: SKILLS.length, loop: `${T.toFixed(1)}s` },
  };
}
