// echook card. echook is Chan's own open-source product: per-event sounds,
// desktop toasts, webhooks and a status line for AI coding agents (Claude Code,
// Cursor, Codex), set up by asking the agent. The card plays one terminal
// session, and beside it the notifications that session sets off: an event line
// arrives in the terminal, its sound plays, a desktop toast and a phone
// notification slide in; then a setting is changed by typing a sentence, and
// the status line's quota and context bars fill through the product's bands.
//
// It is drawn in the product's own look, as its promo film (echook-promo-studio)
// fixed it: a near-black terminal in JetBrains Mono, the brand green of the
// product's logo as the only accent, Space Grotesk for the film's voice, and the
// product's logo file unmodified. Every colour is read from the film's tokens.ts.
//
// Nothing in the terminal is typed here:
//   - the status line is the real status-line script's output for a demo
//     payload, span by span with its ANSI colours, as baked by the film
//     (product.generated.json › statusline.renders, the 58-column reflow);
//   - event names, what each voice file says, file names, durations and
//     waveform peaks are the baked product data (events, audio);
//   - the toast and the phone notification carry the title and body the
//     product's runner builds (channels.toasts, channels.webhooks);
//   - the command and its JSON result are the real CLI's (talk.steps);
//   - the meters beside the status line repeat the figures and colours of the
//     baked renders, and their two marks are the bands of the product README;
//   - the session around them (repo, files, the agent's reply) is the film's
//     demo session (demo.ts), and the panel's words are the film's cleared copy
//     (copy.ts, docs/copy-clearance.md), including its honesty caption, which
//     stays on the card once, under the terminal.
// The film's constraints bind the card: `stop` is never said to mean the task is
// done (C2), editors are plain words with no logos (C5), no speed or outcome
// claim (C4), green stays an accent (C8).
//
// The panel's three figures are the film's bake, and the build throws when the
// bake and the product's README disagree on a count.
//
// The still frame is the first scene with all three channels up; everything
// later in the loop carries opacity="0" and is shown only by its animation.
//
// The product and film checkouts are NOT in this repo (ECHOOK_INPUTS); where
// either is absent the card is not rebuilt and the committed SVG stands.
import { readFileSync } from "node:fs";

import { wrap } from "../lib/svg-card/film.mjs";
import { CARD, card, pct } from "../lib/svg-card/shell.mjs";

export const ECHOOK_FONTS = {
  mono: "cv/fonts/JetBrainsMono-Regular.ttf",
  monoBold: "scripts/cards/fonts/echook/JetBrainsMono-700.ttf",
  voice: "scripts/cards/fonts/archcanvas/SpaceGrotesk-500.ttf",
  voiceBold: "scripts/cards/fonts/archcanvas/SpaceGrotesk-700.ttf",
  // the status line's emoji; a terminal takes them from a fallback font too
  emoji: "scripts/cards/fonts/echook/NotoEmoji-400.ttf",
};
export const ECHOOK_INPUTS = {
  baked: "../echook-promo-studio/src/replica/data/product.generated.json",
  tokens: "../echook-promo-studio/src/replica/tokens.ts",
  copy: "../echook-promo-studio/src/copy.ts",
  demo: "../echook-promo-studio/src/replica/demo.ts",
  logo: "../claude-code-audio-hooks/public/echook-logo.svg",
  readme: "../claude-code-audio-hooks/README.md",
  licence: "../claude-code-audio-hooks/LICENSE",
};

const need = (v, what) => {
  if (v === undefined || v === null || v === false) throw new Error(`echook card: ${what}`);
  return v;
};

export function buildEchookCard({ glyphs, root, project }) {
  const read = (key) => readFileSync(`${root}/${ECHOOK_INPUTS[key]}`, "utf8");
  const baked = JSON.parse(read("baked"));
  const readme = read("readme");

  // ── The film's tokens, copy and demo session, quoted from its sources ──────
  const tokens = Object.fromEntries([...read("tokens").matchAll(/^\s+(\w+): "([^"]+)",/gm)].map((m) => [m[1], m[2]]));
  const tk = (k) => need(tokens[k], `tokens.ts has no ${k}`);
  const C = {
    green: tk("green"), greenLine: tk("greenLine"), greenDim: tk("greenDim"),
    bg: tk("termBg"), bar: tk("termBar"), line: tk("termLine"), fg: tk("termFg"), dim: tk("termDim"), faint: tk("termFaint"), user: tk("termUser"),
    amber: tk("amber"), chip: tk("card"), chipLine: tk("cardLine"), white: tk("white"),
  };
  const PALETTE = baked.statusline.palette;
  const ADD = PALETTE["32"], DEL = PALETTE["31"], WARN = PALETTE["33"], RUN = PALETTE["36"];

  const copySrc = read("copy");
  const copy = (id) => {
    const m = need(copySrc.match(new RegExp(`\\b${id}: line\\("${id}", \\[([^\\]]+)\\]`)), `copy.ts has no line "${id}"`);
    return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]).join(" ");
  };
  const label = (k) => need(copySrc.match(new RegExp(`\\b${k}: "([^"]+)"`)), `copy.ts has no label ${k}`)[1];
  const editors = [...need(copySrc.match(/editors: \[([^\]]+)\]/), "copy.ts has no editors")[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  const honesty = [...need(copySrc.match(/HONESTY_PARTS = \[([^\]]+)\]/), "copy.ts has no honesty caption")[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  need(honesty.length === 3, "the honesty caption no longer has three parts");
  const words = Object.fromEntries(["events", "variants", "onByDefault"].map((k) => [k, need(copySrc.match(new RegExp(`\\b${k}: "([^"]+)"`)), `copy.ts has no count word ${k}`)[1]]));

  const demoSrc = read("demo");
  const demo = (k) => need([...demoSrc.matchAll(new RegExp(`^  ${k}: "([^"]+)"`, "gm"))].pop(), `demo.ts has no ${k}`)[1];
  const demoTools = [...demoSrc.matchAll(/\{ verb: "(\w+)", target: "([^"]+)"(?:, added: (\d+))?(?:, removed: (\d+))? \}/g)].map((m) => ({ verb: m[1], target: m[2], added: m[3], removed: m[4] }));
  const edits = demoTools.filter((t) => t.added);
  need(edits.length === 3, "demo.ts no longer has three edited files");

  // ── The product's data, as the film baked it ───────────────────────────────
  const counts = baked.counts;
  const said = need(readme.match(/(\d+) hook events and (\d+) matcher variants/), "the product README no longer states its event counts");
  need(Number(said[1]) === counts.events && Number(said[2]) === counts.variants, `the film's bake (${counts.events}/${counts.variants}) and the product README (${said[1]}/${said[2]}) disagree; re-bake the film data`);
  need(editors.length === counts.editors, "editor count differs from the bake");
  const eventOf = (name) => need(baked.events.find((e) => e.name === name), `no event ${name}`);
  const soundOf = (name) => {
    const e = eventOf(name);
    return { e, file: e.audioFile.default, ...need(baked.audio[`default/${e.audioFile.default}`], `no audio for ${name}`) };
  };
  const toastOf = (name) => need(baked.channels.toasts.find((t) => t.event === name), `no toast ${name}`);
  const render = (state) => need(baked.statusline.renders.find((r) => r.state === state && r.width === "narrow"), `no ${state} status render`);
  const COLS = render("green").columns;
  const perm = toastOf("permission_request");
  const idle = toastOf("notification_idle_prompt");
  const ntfyOf = (name) => need(baked.channels.webhooks.find((w) => w.event === name && w.format === "ntfy"), `no ntfy webhook for ${name}`);
  const talk = need(baked.talk.steps.find((s) => s.command === "audio-hooks snooze 1h"), "no snooze step");
  const talkJson = JSON.stringify(Object.fromEntries(Object.entries(talk.parsed).filter(([k]) => !talk.volatileFields.includes(k))));

  // The sentence typed in the terminal is the first example in the product's README.
  const asked = need(readme.match(/in plain English: \*"([^"]+)"\*/),"the product README no longer lists its example sentences")[1];
  need(asked === talk.said, "the README's first example is not the sentence the bake ran");
  // The README's context table: band, share of the window, what to do.
  const bands = ["Green", "Yellow", "Red"].map((name) => {
    const m = need(readme.match(new RegExp(`\\| \\S+ ${name} \\| ([^|]+) \\| [^|]+ \\| ([^|]+) \\|`)), `the product README has no ${name} context row`);
    return { used: m[1].trim(), action: m[2].trim().replace(/`/g, "") };
  });

  need(/^MIT License/.test(read("licence").trim()), "the product is no longer MIT licensed");
  const list = (a) => `${a.slice(0, -1).join(", ")} and ${a.at(-1)}`;

  // ── Timeline: four scenes on one terminal ──────────────────────────────────
  // 1 a permission request on three channels · 2 the next event, its own sound ·
  // 3 a setting changed by asking · 4 the status line through its bands
  const A = { run: 0.6, ask: 1.0, sound: 1.1, toast: 1.7, phone: 2.4, wait: 4.4, sound2: 4.5, toast2: 4.9, phone2: 5.3, ok: 6.8 };
  const tB = 8.4;
  const B = { type: [0.7, 2.1], send: 2.4, ran: 2.9, json: 3.4, muted: 3.9, said: 4.5 };
  const tC = 14.6;
  const TURN = [0, 2.0, 4.2, 6.4];
  const T = tC + TURN[3];
  const SCENES = [[0, A.wait], [A.wait, tB], [tB, tC], [tC, T]];
  const p = (t) => pct(t, T, 3);
  const css = [];
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
  const fade = (a, b, f) => `0%${a > 0 ? `,${p(a)}` : ""}{opacity:0}${p(a + f)},${p(b - f)}{opacity:1}${p(b)},100%{opacity:0}`;
  const hard = (a, b) => `0%{opacity:${a > 0 ? 0 : 1}}${a > 0 ? `${p(a)}{opacity:1}` : ""}${p(b)},100%{opacity:0}`;
  // Part of the still frame: on(t) from t onward, held(a, b) between a and b, cutHeld the same with hard edges.
  const on = (t, f = 0.25) => kf(`0%,${p(t)}{opacity:0}${p(t + f)},100%{opacity:1}`);
  const held = (a, b, f = 0.25) => kf(fade(a, b, f));
  const cutHeld = (a, b) => kf(hard(a, b), STEP);
  // Absent from the still frame: the attribute hides what the animation shows.
  const span = (a, b, f = 0.25) => `${kf(fade(a, b, f))} opacity="0"`;
  const cut = (a, b) => `${kf(hard(a, b), STEP)} opacity="0"`;
  // slides in from the right at a, leaves at b
  const slide = (a, b) => kf(`0%,${p(a)}{opacity:0;transform:translateX(14px)}${p(a + 0.32)},${p(b - 0.3)}{opacity:1;transform:none}${p(b)},100%{opacity:0;transform:none}`);
  // one shared rule for every waveform bar: lit from its own moment (a negative delay) for LIT seconds
  const LIT = 8;
  css.push(`@keyframes wb{0%{opacity:1}${p(LIT)},100%{opacity:0}}.wb{animation:wb ${T}s step-end infinite}`);

  // ── Type ───────────────────────────────────────────────────────────────────
  const F = 14, CW = F * 0.6, LH = 18.5, BASE = 13.7;
  const mono = (s, x, y, fill, o = {}) => glyphs.text(s, { font: o.bold ? "monoBold" : "mono", size: o.size || F, x, y, fill, tracking: o.tracking || 0, anchor: o.anchor });
  const voice = (s, x, y, fill, size, o = {}) => glyphs.text(s, { font: o.bold === false ? "voice" : "voiceBold", size, x, y, fill, anchor: o.anchor });
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  const isWide = (g) => g.codePointAt(0) >= 0x1f000 || g.codePointAt(0) === 0x26a1 || g.includes("️");
  // One baked status-line row, cell by cell: blocks as cells, emoji two cells wide, the rest in the mono face.
  const statusRow = (row, x, top) => {
    let col = 0;
    const out = [];
    for (const s of row) {
      const fill = s.fg || C.fg;
      const parts = [];
      let run = "", runCol = col;
      const flush = () => {
        if (run.trim()) parts.push(mono(run, x + runCol * CW, top + BASE, fill, { bold: s.bold }));
        run = "";
      };
      for (const { segment: g } of segmenter.segment(s.text)) {
        if (g === "█" || g === "░") {
          flush();
          parts.push(`<rect x="${(x + col * CW).toFixed(1)}" y="${top + 3.5}" width="${(CW + 0.4).toFixed(1)}" height="13" fill="${fill}"${g === "░" ? ' opacity=".55"' : ""}/>`);
          col += 1;
          runCol = col;
        } else if (isWide(g)) {
          flush();
          const ch = g.replace(/️/g, "");
          const style = { font: "emoji", size: 12.2 };
          parts.push(glyphs.text(ch, { ...style, x: x + col * CW + (2 * CW - glyphs.measure(ch, style)) / 2, y: top + BASE - 0.6, fill }));
          col += 2;
          runCol = col;
        } else {
          if (!run) runCol = col;
          run += g;
          col += 1;
        }
      }
      flush();
      if (parts.length) out.push(s.dim ? `<g opacity=".5">${parts.join("")}</g>` : parts.join(""));
    }
    need(col <= COLS, `a status row is ${col} cells, wider than the ${COLS}-column render`);
    return out.join("");
  };

  // ── The terminal ───────────────────────────────────────────────────────────
  const X = CARD.panel;
  const TERM = { x: X + 14, y: 10, w: 516, h: 324 };
  const SIDE = { x: TERM.x + TERM.w + 14, y: TERM.y, w: CARD.w - 14 - (TERM.x + TERM.w + 14), h: TERM.h };
  const PAD = (TERM.w - COLS * CW) / 2;
  const TX = TERM.x + PAD;
  const SES = { top: TERM.y + 27, rows: 4 };
  const PROMPT = { y: SES.top + SES.rows * LH + 4, h: 24 };
  const STATUS = { top: PROMPT.y + PROMPT.h + 6 };
  const defs = [
    `<clipPath id="ses"><rect x="${TERM.x}" y="${SES.top}" width="${TERM.w}" height="${SES.rows * LH}"/></clipPath>`,
    `<clipPath id="pr"><rect x="${TX}" y="${PROMPT.y + 1}" width="${TERM.w - 2 * PAD}" height="${PROMPT.h - 2}"/></clipPath>`,
  ];
  const dot = (y, color, hollow) => `<circle cx="${TX + 4}" cy="${y - 4.8}" r="${hollow ? 2.6 : 3.2}" ${hollow ? `fill="none" stroke="${color}" stroke-width="1.3"` : `fill="${color}"`}/>`;
  const IND = 16;
  const VERB = { read: C.dim, edit: WARN, write: ADD, run: RUN };
  const line = {
    user: (t) => (y) => mono("›", TX, y, C.green, { bold: true }) + mono(t, TX + 2 * CW, y, C.user, { bold: true }),
    tool: (tl) => (y) => {
      const tail = (tl.added ? [[`+${tl.added}`, ADD]] : []).concat(tl.removed ? [[`-${tl.removed}`, DEL]] : []);
      let x = TX + IND + (6 + tl.target.length + 2) * CW;
      return dot(y, VERB[tl.verb]) + mono(tl.verb, TX + IND, y, C.dim) + mono(tl.target, TX + IND + 6 * CW, y, tl.verb === "run" ? C.user : C.fg, { bold: tl.verb === "run" }) +
        tail.map(([s, c]) => { const r = mono(s, x, y, c); x += (s.length + 1) * CW; return r; }).join("");
    },
    note: (t, tone) => (y) => { const c = tone === "ask" ? WARN : tone === "wait" ? C.amber : ADD; return dot(y, c, tone !== "ok") + mono(t, TX + IND, y, c, { bold: tone !== "ok" }); },
    json: (t) => (y) => mono(t, TX + IND, y, ADD),
    agent: (t) => (y) => mono(t, TX, y, C.fg),
  };
  const fits = (s, indent = 0) => need(s.length * CW + indent <= TERM.w - 2 * PAD + 0.01, `"${s}" does not fit the ${COLS}-column terminal`) && s;
  const reply = toastOf("stop").stdin.last_assistant_message;
  const replyAt = reply.lastIndexOf(" ", COLS);
  const cmd = talk.command;
  // the whole session, top to bottom; scenes show a four-row window of it
  const SESSION = [
    line.user(fits(demo("request"), 2 * CW)),
    ...edits.map((t) => line.tool(t)),
    line.tool({ verb: "run", target: perm.stdin.tool_input.command }),
    line.note(fits(perm.body, IND), "ask"),
    line.note(fits(idle.stdin.message, IND), "wait"),
    line.note(demo("approved"), "ok"),
    line.agent(fits(reply.slice(0, replyAt))),
    line.agent(fits(reply.slice(replyAt + 1))),
    line.user(fits(talk.said, 2 * CW)),
    line.tool({ verb: "run", target: fits(cmd, IND + 6 * CW) }),
    line.json(fits(talkJson, IND)),
    line.agent(demo("mutedReply")),
  ];
  // Rows [first, first+4) are up when the stretch opens; `arrivals` are the loop times later rows
  // come in. `rest` is how many arrivals the still frame has taken.
  const session = (first, arrivals, rest = arrivals.length) => {
    const rows = [];
    for (let i = first; i < first + SES.rows + arrivals.length; i++) {
      const y = SES.top + (i - first) * LH + BASE;
      const k = i - first - SES.rows;
      rows.push(k < 0 ? SESSION[i](y) : `<g ${on(arrivals[k], 0.18)}${k >= rest ? ' opacity="0"' : ""}>${SESSION[i](y)}</g>`);
    }
    const steps = arrivals.map((a, k) => `${p(a)}{transform:translateY(${-k * LH}px)}${p(a + 0.16)}{transform:translateY(${-(k + 1) * LH}px)}`).join("");
    const scroll = arrivals.length ? ` ${kf(`0%{transform:none}${steps}100%{transform:translateY(${-arrivals.length * LH}px)}`)}` : "";
    return `<g clip-path="url(#ses)"><g${scroll}${rest ? ` transform="translate(0 ${-rest * LH})"` : ""}>${rows.join("")}</g></g>`;
  };
  // The status line: `states` are [state, from, to] in loop seconds, the first of them the still
  // frame's. A row that is the same in consecutive states is drawn once.
  const status = (states) => {
    const out = [];
    const rowsOf = states.map(([s]) => render(s).rows);
    const n = Math.max(...rowsOf.map((r) => r.length));
    for (let i = 0; i < n; i++) {
      for (let a = 0; a < states.length; ) {
        let b = a;
        const key = JSON.stringify(rowsOf[a][i] || null);
        while (b + 1 < states.length && JSON.stringify(rowsOf[b + 1][i] || null) === key) b++;
        if (rowsOf[a][i]) {
          const body = statusRow(rowsOf[a][i], TX, STATUS.top + i * LH);
          out.push(a === 0 && b === states.length - 1 ? body : `<g ${a === 0 ? cutHeld(states[a][1], states[b][2]) : cut(states[a][1], states[b][2])}>${body}</g>`);
        }
        a = b + 1;
      }
    }
    return out.join("");
  };
  const caret = `<rect x="${TX + 2 * CW}" y="${PROMPT.y + 5}" width="7.5" height="14.5" fill="${C.user}" opacity=".9"/>`;

  // 1, 2 ── an event line arrives; 3 ── a sentence is typed and run; 4 ── the session rests
  const sessions =
    `<g ${held(0, tB, 0.3)}>${session(0, [A.run, A.ask, A.wait, A.ok], 2)}</g>` +
    `<g ${span(tB, tC, 0.3)}>${session(6, [B.send, B.ran, B.json, B.said].map((t) => tB + t))}</g>` +
    `<g ${span(tC, T, 0.3)}><g opacity=".28">${session(10, [])}</g></g>`;
  const tw = talk.said.length * CW;
  const typed = [tB + B.type[0] - 0.4, tB + B.send];
  const prompt =
    `<g clip-path="url(#pr)"><g ${span(typed[0], typed[1], 0.05)}>${mono(talk.said, TX + 2 * CW, PROMPT.y + 17, C.user)}` +
    `<g ${kf(`0%,${p(tB + B.type[0])}{transform:none;animation-timing-function:steps(${talk.said.length},end)}${p(tB + B.type[1])},100%{transform:translateX(${tw.toFixed(1)}px)}`)}>` +
    `<rect x="${TX + 2 * CW}" y="${PROMPT.y + 2}" width="${tw + 12}" height="${PROMPT.h - 4}" fill="${C.bg}"/>${caret}</g></g></g>` +
    `<g ${kf(`0%{opacity:1}${p(typed[0])}{opacity:0}${p(typed[1])},100%{opacity:1}`, STEP)}>${caret}</g>`;
  // the row the mute lands on is marked for a moment
  const mutedRow = render("snooze").rows.findIndex((r) => r.some((s) => s.text.includes("MUTED")));
  const mutedTag = need(render("snooze").rows[mutedRow]?.find((s) => s.text.includes("MUTED")), "the snooze render has no MUTED segment");
  const tMute = tB + B.muted;
  const flash = `<rect ${span(tMute, tMute + 1.6, 0.2)} x="${TX - 5}" y="${STATUS.top + mutedRow * LH + 1}" width="${mutedTag.text.length * CW + 10}" height="${LH - 1}" rx="3" fill="none" stroke="${mutedTag.fg}"/>`;
  // the quota and context rows are framed; the frame follows the context row down when the line reflows
  const BANDS = ["green", "yellow", "red"];
  const rowWith = (s, what) => need(render(s).rows.find((r) => r.some((x) => x.text.includes(what))), `the ${s} render has no "${what}" row`);
  const frames = BANDS.map((s, n) => {
    const rows = render(s).rows;
    const a = rows.indexOf(rowWith(s, "API Quota:")), b = rows.indexOf(rowWith(s, "Context:"));
    need(b >= a, `the ${s} render lost the order of its quota and context rows`);
    const c = rowWith(s, "Context:")[0].fg;
    return `<rect ${cut(tC + TURN[n], tC + TURN[n + 1])} x="${TX - 6}" y="${STATUS.top + a * LH - 1}" width="${TERM.w - 2 * PAD + 12}" height="${(b - a + 1) * LH + 3}" rx="4" fill="${c}" fill-opacity=".07" stroke="${c}" stroke-opacity=".7"/>`;
  });
  const statusLine = status([
    ["green", 0, tMute], ["snooze", tMute, tC],
    ...BANDS.map((s, n) => [s, tC + TURN[n], tC + TURN[n + 1]]),
  ]);
  const terminal =
    `<rect x="${TERM.x}" y="${TERM.y}" width="${TERM.w}" height="${TERM.h}" rx="9" fill="${C.bg}"/>` +
    `<path d="M${TERM.x} ${TERM.y + 22}V${TERM.y + 9}a9 9 0 0 1 9-9H${TERM.x + TERM.w - 9}a9 9 0 0 1 9 9V${TERM.y + 22}Z" fill="${C.bar}"/>` +
    `<path d="M${TERM.x} ${TERM.y + 22.5}H${TERM.x + TERM.w}" stroke="${C.line}"/>` +
    [0, 1, 2].map((i) => `<circle cx="${TERM.x + 16 + i * 12}" cy="${TERM.y + 11.5}" r="3.2" fill="${C.faint}"/>`).join("") +
    glyphs.text(demo("title"), { font: "mono", size: 11, x: TERM.x + TERM.w / 2, y: TERM.y + 15.5, fill: C.dim, anchor: "middle" }) +
    sessions + frames.join("") + statusLine + flash +
    `<rect x="${TX - 7.5}" y="${PROMPT.y + 0.5}" width="${TERM.w - 2 * PAD + 15}" height="${PROMPT.h - 1}" rx="5" fill="none" stroke="${C.line}"/>` +
    mono("›", TX, PROMPT.y + 17, C.green, { bold: true }) + prompt +
    `<rect x="${TERM.x + 0.5}" y="${TERM.y + 0.5}" width="${TERM.w - 1}" height="${TERM.h - 1}" rx="8.5" fill="none" stroke="${C.line}"/>`;

  // ── Beside it: the sound, the toast, the phone ─────────────────────────────
  const SX = SIDE.x, SW = SIDE.w;
  const CHIP = { y: SIDE.y, h: 100 }, TOAST = { y: SIDE.y + 112, h: 86 }, PHONE = { y: SIDE.y + 210, h: SIDE.h - 210 };
  const waveform = (peaks, n, x, y, w, h, fireAt, playSec, lit = 0) => {
    const bars = Array.from({ length: n }, (_, i) => Math.max(0.06, ...peaks.slice(Math.floor((i * peaks.length) / n), Math.floor(((i + 1) * peaks.length) / n))));
    const step = w / n;
    const bar = (v, i, extra) => `<rect x="${(x + i * step).toFixed(1)}" y="${(y + (h * (1 - v)) / 2).toFixed(1)}" width="${(step * 0.66).toFixed(1)}" height="${Math.max(1.5, h * v).toFixed(1)}"${extra}/>`;
    return `<g fill="#3a4252">${bars.map((v, i) => bar(v, i, "")).join("")}</g>` +
      (fireAt === null ? "" : `<g fill="${C.green}">${bars.map((v, i) => bar(v, i, ` class="wb"${i < lit * n ? "" : ' opacity="0"'} style="animation-delay:${(fireAt + (i / n) * playSec - T).toFixed(2)}s"`)).join("")}</g>`);
  };
  const speaker = (cx, cy, r, color = C.green) => {
    const u = (2 * r) / 44, ox = cx - r, oy = cy - r;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>` +
      `<rect x="${ox + 13 * u}" y="${oy + 15 * u}" width="${8 * u}" height="${14 * u}" rx="${1.5 * u}" fill="${C.chip}"/>` +
      `<path d="M${ox + 17 * u} ${oy + 18.7 * u}L${ox + 31 * u} ${oy + 11 * u}V${oy + 33 * u}L${ox + 17 * u} ${oy + 25.3 * u}Z" fill="${C.chip}"/>`;
  };
  const bell = (x, y, s, color, ink) =>
    `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.26}" fill="${color}"/>` +
    `<path d="M${x + s * 0.3} ${y + s * 0.64}V${y + s * 0.44}a${s * 0.2} ${s * 0.2} 0 0 1 ${s * 0.4} 0V${y + s * 0.64}Z" fill="${ink}"/>` +
    `<rect x="${x + s * 0.22}" y="${y + s * 0.62}" width="${s * 0.56}" height="${s * 0.08}" rx="${s * 0.04}" fill="${ink}"/>` +
    `<rect x="${x + s * 0.44}" y="${y + s * 0.73}" width="${s * 0.12}" height="${s * 0.08}" rx="${s * 0.04}" fill="${ink}"/>`;
  const quoted = (s) => `“${s}”`;
  const slot = (y, h) => `<rect x="${SX + 0.75}" y="${y + 0.75}" width="${SW - 1.5}" height="${h - 1.5}" rx="10" fill="none" stroke="${C.faint}" stroke-opacity=".7" stroke-width="1.2" stroke-dasharray="4 5"/>`;
  const chipPlate = (stroke) => `<rect x="${SX + 0.5}" y="${CHIP.y + 0.5}" width="${SW - 1}" height="${CHIP.h - 1}" rx="10" fill="${C.chip}" stroke="${stroke}"/>`;
  // the sound: event, what the voice file says, the file's own waveform, the file
  const chip = (name, fireAt, playFor, lit) => {
    const s = soundOf(name), y = CHIP.y;
    const play = Math.min(s.durationSec, playFor);
    return chipPlate(C.chipLine) +
      `<rect ${span(fireAt, fireAt + play + 0.4, 0.15)} x="${SX + 0.75}" y="${y + 0.75}" width="${SW - 1.5}" height="${CHIP.h - 1.5}" rx="10" fill="none" stroke="${C.greenLine}" stroke-width="1.5"/>` +
      speaker(SX + 23, y + 22, 9.5) + mono(name, SX + 40, y + 26.5, C.green, { size: 11.5 }) +
      voice(quoted(s.e.voiceText), SX + 14, y + 54, C.white, 17.5) +
      waveform(s.peaks, 30, SX + 14, y + 62, SW - 28, 18, fireAt, play, lit) +
      mono(`${s.file} · ${s.durationSec.toFixed(1)} s`, SX + 14, y + 92, "#8791a3", { size: 10 });
  };
  // the same chip once the snooze has landed: the status line's own tag, the command, its result
  const mutedChip = (() => {
    const y = CHIP.y, tone = mutedTag.fg;
    need(talk.parsed.active === true && Number.isInteger(talk.parsed.remaining_seconds), "the snooze result changed shape");
    return chipPlate(tone) + speaker(SX + 23, y + 22, 9.5, tone) +
      `<path d="M${SX + 15.5} ${y + 29.5}L${SX + 30.5} ${y + 14.5}" stroke="${C.chip}" stroke-width="4.2"/><path d="M${SX + 15.5} ${y + 29.5}L${SX + 30.5} ${y + 14.5}" stroke="${tone}" stroke-width="1.8" stroke-linecap="round"/>` +
      mono(mutedTag.text, SX + 40, y + 26.5, tone, { size: 12, bold: true }) +
      mono(cmd, SX + 14, y + 53, C.white, { size: 13.5, bold: true }) +
      waveform([0], 30, SX + 14, y + 62, SW - 28, 18, null) +
      mono(`remaining_seconds: ${talk.parsed.remaining_seconds}`, SX + 14, y + 92, "#8791a3", { size: 10 });
  })();
  const bodyLines = (text, style, width, what) => {
    const lines = wrap(glyphs, text, style, width);
    need(lines.length <= 2, `${what} "${text}" no longer fits two lines`);
    return lines;
  };
  // the desktop toast: the title and body the product's runner builds
  const toastText = (t) =>
    voice(t.title, SX + 58, TOAST.y + 31, C.white, 14.5) +
    bodyLines(t.body, { font: "voice", size: 12 }, SW - 58 - 12, "the toast body").map((l, n) => voice(l, SX + 58, TOAST.y + 51 + n * 16, "#c3c9d4", 12, { bold: false })).join("");
  // the phone: a lock screen with the ntfy webhook's title and message
  const NOTE = { x: SX + 8, y: PHONE.y + 40, w: SW - 16, h: PHONE.h - 48 };
  const noteText = (w) =>
    voice(w.headers.Title, NOTE.x + 34, NOTE.y + 20, "#15171c", 13) +
    bodyLines(String(w.payload), { font: "voice", size: 11.5 }, NOTE.w - 24, "the phone message").map((l, n) => voice(l, NOTE.x + 12, NOTE.y + 39 + n * 15, "#2a2d35", 11.5, { bold: false })).join("");
  defs.push(`<linearGradient id="ph" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2a5c"/><stop offset=".5" stop-color="#4b3a6e"/><stop offset="1" stop-color="#b0694a"/></linearGradient>`);
  const leave = tB + 0.4;
  const swap = (t, first, second) => `<g ${kf(`0%,${p(t)}{opacity:1}${p(t + 0.2)},100%{opacity:0}`)}>${first}</g><g ${span(t, leave + 0.1, 0.2)}>${second}</g>`;
  const channels =
    slot(CHIP.y, CHIP.h) + slot(TOAST.y, TOAST.h) +
    `<g ${slide(A.sound, A.sound2 + 0.1)}>${chip("permission_request", A.sound, 2.8, 0.6)}</g>` +
    `<g ${span(A.sound2, tMute + 0.1, 0.15)}>${chip("notification_idle_prompt", A.sound2, 2)}</g>` +
    `<g ${span(tMute, tC + 0.3, 0.15)}>${mutedChip}</g>` +
    `<g ${slide(A.toast, leave)}>` +
    `<rect x="${SX + 0.5}" y="${TOAST.y + 0.5}" width="${SW - 1}" height="${TOAST.h - 1}" rx="10" fill="#20242d" stroke="#3a4150"/>` +
    bell(SX + 14, TOAST.y + 16, 32, C.green, C.bg) + swap(A.toast2, toastText(perm), toastText(idle)) + "</g>" +
    `<rect x="${SX + 1}" y="${PHONE.y + 1}" width="${SW - 2}" height="${PHONE.h - 2}" rx="15" fill="url(#ph)" stroke="#2c313c" stroke-width="2"/>` +
    voice(demo("phoneClock"), SX + 16, PHONE.y + 29, C.white, 22) +
    `<g opacity=".82">${voice(demo("phoneDay"), SX + SW - 16, PHONE.y + 27, C.white, 11, { bold: false, anchor: "end" })}</g>` +
    `<g ${slide(A.phone, leave)}>` +
    `<rect x="${NOTE.x}" y="${NOTE.y}" width="${NOTE.w}" height="${NOTE.h}" rx="10" fill="#f6f4ee" fill-opacity=".96"/>` +
    bell(NOTE.x + 12, NOTE.y + 8, 16, "#11141a", C.green) + swap(A.phone2, noteText(ntfyOf("permission_request")), noteText(ntfyOf("notification_idle_prompt"))) + "</g>";

  // ── Beside it in the last scene: the status line's three meters, enlarged ──
  // Figures and colours are those of the baked renders; the two marks are the README's bands.
  const edges = need(bands[1].used.match(/^(\d+)–(\d+)%$/), "the README's yellow band is no longer a range").slice(1).map(Number);
  need(bands[0].used === `< ${edges[0]}%` && bands[2].used === `> ${edges[1]}%`, "the README's context bands no longer meet at the same two values");
  const METERS = ["API Quota", "Weekly", "Context"].map((lab) => ({
    lab,
    states: BANDS.map((s) => {
      const row = rowWith(s, `${lab}:`), text = row.map((x) => x.text).join("");
      const value = Number(need(text.match(new RegExp(`${lab}: (\\d+)%`)), `the ${s} render has no ${lab} figure`)[1]);
      const detail = need(text.match(/· (resets [\w ]*\w)/) || text.match(/\((\w+\/\w+)\)/), `the ${s} render has no ${lab} detail`)[1];
      return { value, detail, color: need(row[0].fg, `the ${s} ${lab} bar has no colour`) };
    }),
  }));
  METERS[2].states.forEach((m, n) => need(n === 0 ? m.value < edges[0] : n === 1 ? m.value >= edges[0] && m.value <= edges[1] : m.value > edges[1], `the ${BANDS[n]} render's context figure is outside the README's ${BANDS[n]} band`));
  const meters = (() => {
    const out = [`<rect x="${SX + 0.5}" y="${SIDE.y + 0.5}" width="${SW - 1}" height="${SIDE.h - 1}" rx="10" fill="${C.chip}" stroke="${C.chipLine}"/>`];
    const bx = SX + 16, bw = SW - 32;
    const win = (n) => [tC + TURN[n], n === 2 ? T : tC + TURN[n + 1]];
    METERS.forEach(({ lab, states }, i) => {
      const top = SIDE.y + 16 + i * 88;
      const grow = states.map((m, n) => `${p(tC + TURN[n] + (n ? 0 : 0.2))}{transform:scaleX(${n ? states[n - 1].value / 100 : 0})}${p(tC + TURN[n] + 0.7)}{transform:scaleX(${m.value / 100})}`).join("");
      out.push(
        mono(lab.toUpperCase(), bx, top + 11, C.dim, { size: 10.5, tracking: 0.14 }),
        ...states.map((m, n) => `<g ${cut(...win(n))}>${voice(`${m.value}%`, bx, top + 44, m.color, 30)}</g>`),
        ...states.map((m, n) => (n && states[n - 1].detail === m.detail ? "" : `<g ${cut(win(n)[0], win(states.findLastIndex((o) => o.detail === m.detail))[1])}>${mono(m.detail, bx + bw, top + 43, C.fg, { size: 11, anchor: "end" })}</g>`)),
        `<rect x="${bx}" y="${top + 54}" width="${bw}" height="9" fill="${C.line}"/>`,
        `<g ${kf(`0%{transform:scaleX(0)}${grow}100%{transform:scaleX(${states[2].value / 100})}`, ";transform-box:fill-box;transform-origin:0 50%")}>` +
          states.map((m, n) => `<rect ${cut(...win(n))} x="${bx}" y="${top + 54}" width="${bw}" height="9" fill="${m.color}"/>`).join("") + "</g>",
      );
      if (lab !== "Context") return;
      edges.forEach((e) => {
        const x = bx + (bw * e) / 100;
        out.push(`<path d="M${x} ${top + 50}V${top + 67}" stroke="${C.white}" stroke-width="1.2"/>`, mono(`${e}%`, x, top + 80, C.dim, { size: 10, anchor: "middle" }));
      });
      states.forEach((m, n) => {
        need(26 + glyphs.measure(bands[n].action, { font: "voiceBold", size: 13.5 }) <= bw, `"${bands[n].action}" does not fit the meter`);
        out.push(`<g ${cut(...win(n))}><rect x="${bx}" y="${top + 95}" width="11" height="11" fill="${m.color}"/>${voice(bands[n].action, bx + 19, top + 105, C.white, 13.5)}</g>`);
      });
    });
    return `<g ${span(tC, T, 0.3)}>${out.join("")}</g>`;
  })();

  // ── Under the stage: the honesty caption, once, and one tick per scene ─────
  const caption = honesty.join(" · ");
  need(glyphs.measure(caption, { font: "mono", size: 10 }) <= TERM.w - 4, "the honesty caption does not fit under the terminal");
  const TICK = { w: 22, gap: 6, y: 344.5 };
  const ticks = SCENES.map(([a, b], i) => {
    const x = SX + SW - (SCENES.length - i) * (TICK.w + TICK.gap) + TICK.gap;
    return `<rect x="${x}" y="${TICK.y}" width="${TICK.w}" height="3" rx="1.5" fill="${C.faint}"/><rect ${i ? cut(a, b) : cutHeld(a, b)} x="${x}" y="${TICK.y}" width="${TICK.w}" height="3" rx="1.5" fill="${C.green}"/>`;
  }).join("");
  const foot = mono(caption, TERM.x + 2, 350, C.dim, { size: 10 }) + ticks;

  // ── Identity: the film's end card, on the terminal's own ground ────────────
  const logoSvg = read("logo");
  const logoBox = need(logoSvg.match(/viewBox="0 0 (\d+) (\d+)"/), "the logo has no viewBox");
  const logoInner = need(logoSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>/), "the logo is not an svg")[1];
  defs.push('<clipPath id="lg"><circle cx="74" cy="112" r="34"/></clipPath>');
  const works = label("worksIn");
  const worksW = glyphs.measure(works, { font: "voice", size: 16 });
  need(40 + worksW + 9 + glyphs.measure(editors.join(" · "), { font: "voiceBold", size: 16 }) <= X - 30, "the editors line no longer fits the panel");
  let fx = 40;
  const figures = [[counts.events, words.events], [counts.variants, words.variants], [counts.defaultOnEvents, words.onByDefault]].map(([value, word]) => {
    const svg = voice(String(value), fx, 310, C.green, 34) + voice(word, fx, 331, C.fg, 13.5, { bold: false });
    fx += Math.max(glyphs.measure(String(value), { font: "voiceBold", size: 34 }), glyphs.measure(word, { font: "voice", size: 13.5 })) + 38;
    return svg;
  });
  const identity =
    `<rect width="${X}" height="${CARD.h}" fill="${C.bg}"/>` +
    mono(label("licence").toUpperCase(), 40, 48, C.dim, { size: 11.5, tracking: 0.16 }) +
    `<g clip-path="url(#lg)"><svg x="40" y="78" width="68" height="68" viewBox="0 0 ${logoBox[1]} ${logoBox[2]}">${logoInner}</svg></g>` +
    voice(project.name, 124, 132, C.white, 56) +
    voice(copy("end"), 40, 200, C.white, 34) +
    voice(works, 40, 232, C.dim, 16, { bold: false }) + voice(editors.join(" · "), 40 + worksW + 9, 232, C.white, 16) +
    figures.join("");

  const stage = `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${C.bg}"/>` + terminal +
    `<g ${kf(`0%{opacity:0}${p(0.3)},${p(tC)}{opacity:1}${p(tC + 0.3)},100%{opacity:0}`)}>${channels}</g>` + meters + foot;

  return {
    svg: card({
      title:
        `echook is an open-source notification system for the AI coding agents ${list(editors)}. ` +
        `The card shows a terminal session recreated in code from the product's own output: a permission request reaches you as a sound, a desktop toast and a phone notification, ` +
        `a setting is changed by asking the agent (“${talk.said}”), and the status line's quota and context bars change colour as they fill.`,
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body: stage + identity + `<rect x="${X - 0.5}" width="1" height="${CARD.h}" fill="${C.line}"/>`,
      radius: 14,
    }),
    facts: { scenes: SCENES.length, events: counts.events, variants: counts.variants, statusColumns: COLS, bakedVersion: baked.source.version, loop: `${T.toFixed(1)}s` },
  };
}
