// echook card. echook is Chan's own open-source product: per-event sounds,
// desktop toasts, webhooks and a status line for AI coding agents (Claude Code,
// Cursor, Codex), set up by asking the agent. The card plays one terminal
// session in which the product does those four things, then says what stands
// behind it.
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
//   - the session around them (repo, files, the agent's reply) is the film's
//     demo session (demo.ts), and the captions are the film's cleared copy
//     (copy.ts, docs/copy-clearance.md), including its honesty caption.
// The film's constraints bind the card: `stop` is never said to mean the task is
// done (C2), editors are plain words with no logos (C5), no speed or outcome
// claim (C4), green stays an accent (C8).
//
// The closing figures are read from the product repo at build time (AGENTS.md,
// its CI workflow, README) and from projects[echook].metrics, and the build
// throws when a pattern stops matching or the film's bake and the product's
// README disagree on a count.
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
  agents: "../claude-code-audio-hooks/AGENTS.md",
  ci: "../claude-code-audio-hooks/.github/workflows/smoke.yml",
  licence: "../claude-code-audio-hooks/LICENSE",
};

const need = (v, what) => {
  if (v === undefined || v === null || v === false) throw new Error(`echook card: ${what}`);
  return v;
};
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function buildEchookCard({ glyphs, root, project }) {
  const read = (key) => readFileSync(`${root}/${ECHOOK_INPUTS[key]}`, "utf8");
  const baked = JSON.parse(read("baked"));
  const readme = read("readme");
  const agents = read("agents");

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
  const ntfy = need(baked.channels.webhooks.find((w) => w.event === "notification_idle_prompt" && w.format === "ntfy"), "no ntfy webhook");
  const schema = need(baked.channels.webhooks.find((w) => w.format === "raw"), "no raw webhook").payload.schema;
  const talk = need(baked.talk.steps.find((s) => s.command === "audio-hooks snooze 1h"), "no snooze step");
  const talkJson = JSON.stringify(Object.fromEntries(Object.entries(talk.parsed).filter(([k]) => !talk.volatileFields.includes(k))));

  // What a user can say, as the product's README lists it; the first is the one played.
  const asks = need(readme.match(/\*"(mute audio for an hour)"\*, \*"(switch to chimes)"\*, \*"(watch my `\.env` file)"\*, \*"(put a context-usage bar in my status line)"\*/), "the product README no longer lists its example sentences").slice(1).map((s) => s.replace(/`/g, ""));
  need(asks[0] === talk.said, "the README's first example is not the sentence the bake ran");
  // The README's context table: band, share of the window, what to do.
  const bands = ["Green", "Yellow", "Red"].map((name) => {
    const m = need(readme.match(new RegExp(`\\| \\S+ ${name} \\| ([^|]+) \\| [^|]+ \\| ([^|]+) \\|`)), `the product README has no ${name} context row`);
    return { used: m[1].trim(), action: m[2].trim().replace(/`/g, "") };
  });
  const intro = need(readme.match(/\*\*(Audio and out-of-band notifications for Claude Code, Cursor IDE, and Codex CLI\.)\*\*<br\/>\s*(You configure it by talking to your agent) — (every setting is one sentence, not a JSON edit\.)/), "the product README's opening lines changed");

  // ── What stands behind it ──────────────────────────────────────────────────
  need(/^MIT License/.test(read("licence").trim()), "the product is no longer MIT licensed");
  need(/owns a distinct sound \(\d+ slots/.test(agents) && agents.includes("in both themes"), "AGENTS.md no longer states the one-sound-per-event rule");
  const tests = need(agents.match(/\((\d+) tests;/), "AGENTS.md no longer states its test count")[1];
  const ci = read("ci");
  const osList = need(ci.match(/os: \[([^\]]+)\]/), "the CI workflow has no os matrix")[1].split(",").map((s) => s.trim().replace(/-latest$/, ""));
  const pyList = [...need(ci.match(/python-version: \[([^\]]+)\]/), "the CI workflow has no python matrix")[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  const OS = { ubuntu: "Ubuntu", windows: "Windows", macos: "macOS" };
  const list = (a) => `${a.slice(0, -1).join(", ")} and ${a.at(-1)}`;
  const metric = (name) => need(project.metrics.find((m) => m.label === name), `projects[echook] has no "${name}" metric`).value;
  const stars = need(metric("GitHub stars").match(/^(\d+) \(measured (\d{4}-\d{2}-\d{2})/), "the stars metric changed shape");
  const runtime = need(metric("Runtime").match(/^(Python [\d.]+\+) standard library only \(no third-party runtime deps\)/), "the runtime metric changed shape");
  need(/Creator & Lead Developer/.test(readme), "the product README no longer names its creator");
  const BEHIND = [
    [String(counts.events), "HOOK EVENTS", [`${counts.variants} matcher variants beneath them.`, "Each owns a sound in both themes."]],
    [`${osList.length} × ${pyList.length}`, "CI MATRIX", [`${list(osList.map((o) => need(OS[o], `unknown CI os ${o}`)))} on`, `Python ${list(pyList)}; ${tests} tests.`]],
    ["0", "RUNTIME DEPENDENCIES", [`${runtime[1]} standard library only;`, "no third-party runtime packages."]],
  ];

  // ── Timeline ───────────────────────────────────────────────────────────────
  const D = [8.6, 6.6, 7.6, 7.6];
  const OUTRO = 7.0;
  const at = D.map((_, i) => D.slice(0, i).reduce((a, b) => a + b, 0));
  const outroAt = at[3] + D[3];
  const T = outroAt + OUTRO;
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
  const on = (t, f = 0.25) => kf(`0%,${p(t)}{opacity:0}${p(t + f)},100%{opacity:1}`);
  const span = (a, b, f = 0.25) => `${kf(`0%,${p(a)}{opacity:0}${p(a + f)},${p(b - f)}{opacity:1}${p(b)},100%{opacity:0}`)} opacity="0"`;
  // hard cut: shown exactly from a to b
  const cut = (a, b) => `${kf(`0%{opacity:0}${p(a)}{opacity:1}${p(b)},100%{opacity:0}`, ";animation-timing-function:step-end")} opacity="0"`;
  // one shared rule for every waveform bar: lit from its own moment (a negative delay) for LIT seconds
  const LIT = 8;
  css.push(`@keyframes wb{0%{opacity:1}${p(LIT)},100%{opacity:0}}.wb{animation:wb ${T}s step-end infinite}`);

  // ── Type ───────────────────────────────────────────────────────────────────
  const F = 13, CW = F * 0.6, LH = 18, BASE = 13.3;
  const mono = (s, x, y, fill, o = {}) => glyphs.text(s, { font: o.bold ? "monoBold" : "mono", size: o.size || F, x, y, fill, tracking: o.tracking || 0 });
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
          parts.push(`<rect x="${(x + col * CW).toFixed(1)}" y="${top + 3.5}" width="${(CW + 0.4).toFixed(1)}" height="12" fill="${fill}"${g === "░" ? ' opacity=".55"' : ""}/>`);
          col += 1;
          runCol = col;
        } else if (isWide(g)) {
          flush();
          const ch = g.replace(/️/g, "");
          const style = { font: "emoji", size: 11.4 };
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
  const CAP = { x: X + 26, w: 254 };
  const TERM = { x: X + 296, y: 12, w: 490, h: 336 };
  const PAD = (TERM.w - COLS * CW) / 2;
  const TX = TERM.x + PAD;
  const SES = { top: TERM.y + 28, rows: 5 };
  const PROMPT = { y: SES.top + SES.rows * LH + 5, h: 24 };
  const STATUS = { top: PROMPT.y + PROMPT.h + 7 };
  const defs = [
    `<clipPath id="ses"><rect x="${TERM.x}" y="${SES.top}" width="${TERM.w}" height="${SES.rows * LH}"/></clipPath>`,
    `<clipPath id="pr"><rect x="${TX}" y="${PROMPT.y + 1}" width="${TERM.w - 2 * PAD}" height="${PROMPT.h - 2}"/></clipPath>`,
  ];
  const dot = (y, color, hollow) => `<circle cx="${TX + 4}" cy="${y - 4.4}" r="${hollow ? 2.4 : 3}" ${hollow ? `fill="none" stroke="${color}" stroke-width="1.3"` : `fill="${color}"`}/>`;
  const IND = 15;
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
  // the whole session, top to bottom; scenes show a five-row window of it
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
  // Rows [first, first+5) are up when the scene opens; `arrivals` are the times later rows come in.
  const session = (t0, first, arrivals, hush = false) => {
    const rows = [];
    for (let i = first; i < first + SES.rows + arrivals.length; i++) {
      const y = SES.top + (i - first) * LH + BASE;
      const k = i - first - SES.rows;
      rows.push(k < 0 ? SESSION[i](y) : `<g ${on(t0 + arrivals[k], 0.18)}>${SESSION[i](y)}</g>`);
    }
    const steps = arrivals.map((a, k) => `${p(t0 + a)}{transform:translateY(${-k * LH}px)}${p(t0 + a + 0.16)}{transform:translateY(${-(k + 1) * LH}px)}`).join("");
    const scroll = arrivals.length ? ` ${kf(`0%{transform:none}${steps}100%{transform:translateY(${-arrivals.length * LH}px)}`)}` : "";
    return `<g clip-path="url(#ses)"${hush ? ' opacity=".28"' : ""}><g${scroll}>${rows.join("")}</g></g>`;
  };
  // The status line: `states` are [state, from, to] in loop seconds. A row that is the same in
  // consecutive states is drawn once.
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
          out.push(a === 0 && b === states.length - 1 ? body : `<g ${cut(states[a][1], states[b][2])}>${body}</g>`);
        }
        a = b + 1;
      }
    }
    return out.join("");
  };
  const terminal = ({ body, prompt = "" }) =>
    `<rect x="${TERM.x}" y="${TERM.y}" width="${TERM.w}" height="${TERM.h}" rx="9" fill="${C.bg}"/>` +
    `<path d="M${TERM.x} ${TERM.y + 22}V${TERM.y + 9}a9 9 0 0 1 9-9H${TERM.x + TERM.w - 9}a9 9 0 0 1 9 9V${TERM.y + 22}Z" fill="${C.bar}"/>` +
    `<path d="M${TERM.x} ${TERM.y + 22.5}H${TERM.x + TERM.w}" stroke="${C.line}"/>` +
    [0, 1, 2].map((i) => `<circle cx="${TERM.x + 16 + i * 12}" cy="${TERM.y + 11.5}" r="3.2" fill="${C.faint}"/>`).join("") +
    glyphs.text(demo("title"), { font: "mono", size: 10.5, x: TERM.x + TERM.w / 2, y: TERM.y + 15.5, fill: C.dim, anchor: "middle" }) +
    body +
    `<rect x="${TX - 7.5}" y="${PROMPT.y + 0.5}" width="${TERM.w - 2 * PAD + 15}" height="${PROMPT.h - 1}" rx="5" fill="none" stroke="${C.line}"/>` +
    mono("›", TX, PROMPT.y + 16.8, C.green, { bold: true }) + prompt +
    `<rect x="${TERM.x + 0.5}" y="${TERM.y + 0.5}" width="${TERM.w - 1}" height="${TERM.h - 1}" rx="8.5" fill="none" stroke="${C.line}"/>`;
  const caret = (extra = "") => `<rect x="${TX + 2 * CW}" y="${PROMPT.y + 5.5}" width="7" height="13.5" fill="${C.user}" opacity=".9"${extra}/>`;

  // ── Film furniture: the sound chip, the toast, the phone ───────────────────
  const waveform = (peaks, n, x, y, w, h, fireAt, playSec) => {
    const bars = Array.from({ length: n }, (_, i) => Math.max(0.06, ...peaks.slice(Math.floor((i * peaks.length) / n), Math.floor(((i + 1) * peaks.length) / n))));
    const step = w / n;
    const bar = (v, i, extra) => `<rect x="${(x + i * step).toFixed(1)}" y="${(y + (h * (1 - v)) / 2).toFixed(1)}" width="${(step * 0.66).toFixed(1)}" height="${Math.max(1.5, h * v).toFixed(1)}"${extra}/>`;
    return `<g fill="#3a4252">${bars.map((v, i) => bar(v, i, "")).join("")}</g>` +
      `<g fill="${C.green}">${bars.map((v, i) => bar(v, i, ` class="wb" opacity="0" style="animation-delay:${(fireAt + (i / n) * playSec - T).toFixed(2)}s"`)).join("")}</g>`;
  };
  const speaker = (cx, cy, r) => {
    const u = (2 * r) / 44, ox = cx - r, oy = cy - r;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.green}"/>` +
      `<rect x="${ox + 13 * u}" y="${oy + 15 * u}" width="${8 * u}" height="${14 * u}" rx="${1.5 * u}" fill="${C.chip}"/>` +
      `<path d="M${ox + 17 * u} ${oy + 18.7 * u}L${ox + 31 * u} ${oy + 11 * u}V${oy + 33 * u}L${ox + 17 * u} ${oy + 25.3 * u}Z" fill="${C.chip}"/>`;
  };
  const bell = (x, y, s, color, ink) =>
    `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.26}" fill="${color}"/>` +
    `<path d="M${x + s * 0.3} ${y + s * 0.64}V${y + s * 0.44}a${s * 0.2} ${s * 0.2} 0 0 1 ${s * 0.4} 0V${y + s * 0.64}Z" fill="${ink}"/>` +
    `<rect x="${x + s * 0.22}" y="${y + s * 0.62}" width="${s * 0.56}" height="${s * 0.08}" rx="${s * 0.04}" fill="${ink}"/>` +
    `<rect x="${x + s * 0.44}" y="${y + s * 0.73}" width="${s * 0.12}" height="${s * 0.08}" rx="${s * 0.04}" fill="${ink}"/>`;
  const quoted = (s) => `“${s}”`;
  const fileLine = (s) => `${s.file} · ${s.durationSec.toFixed(1)} s`;
  // the caption-column chip: event, what the voice file says, the file's own waveform, the file
  const chip = (name, y, fireAt, until) => {
    const s = soundOf(name), x = CAP.x, w = CAP.w, h = 104;
    const play = Math.min(s.durationSec, until - fireAt - 0.3);
    return `<g ${span(fireAt, until, 0.2)}>` +
      `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="10" fill="${C.chip}" stroke="${C.chipLine}"/>` +
      `<rect ${span(fireAt, fireAt + play + 0.3, 0.15)} x="${x + 0.75}" y="${y + 0.75}" width="${w - 1.5}" height="${h - 1.5}" rx="10" fill="none" stroke="${C.greenLine}" stroke-width="1.5"/>` +
      speaker(x + 22, y + 21, 9) + mono(name, x + 38, y + 25.5, C.green, { size: 12 }) +
      voice(quoted(s.e.voiceText), x + 14, y + 52, C.white, 17.5) +
      waveform(s.peaks, 30, x + 14, y + 61, w - 28, 20, fireAt, play) +
      mono(fileLine(s), x + 14, y + 96, "#8791a3", { size: 10.5 }) + "</g>";
  };

  // ── Captions ───────────────────────────────────────────────────────────────
  const total = D.length + 1;
  const counter = (i, fill = C.dim) => mono(`0${i + 1} / 0${total}`, CAP.x, 40, fill, { size: 9.5, tracking: 0.12 });
  const TITLE = { size: 24, lh: 28, y: 76 };
  const title = (text) => {
    const lines = wrap(glyphs, text, { font: "voiceBold", size: TITLE.size }, CAP.w);
    return { svg: lines.map((l, n) => voice(l, CAP.x, TITLE.y + n * TITLE.lh, C.white, TITLE.size)).join(""), end: TITLE.y + (lines.length - 1) * TITLE.lh };
  };
  const honestyLines = [`${honesty[0]} ·`, `${honesty[1]} · ${honesty[2]}`];
  const honestySvg = honestyLines.map((l, n) => {
    need(glyphs.measure(l, { font: "mono", size: 9.5 }) <= CAP.w, "the honesty caption does not fit its column");
    return mono(l, CAP.x, 325 + n * 14, C.dim, { size: 9.5 });
  }).join("");
  const scene = (i, parts) => {
    const a = at[i], b = a + D[i];
    const cls = kf(`0%,${p(a)}{opacity:0}${p(a + 0.35)},${p(b - 0.35)}{opacity:1}${p(b)},100%{opacity:0}`);
    return `<g ${cls} opacity="0">${counter(i)}${parts.join("")}${honestySvg}</g>`;
  };

  // 1 ── Every event has its own sound ────────────────────────────────────────
  const s1 = (() => {
    const t0 = at[0];
    const fire = { ask: 0.9, wait: 3.7, ok: 4.9, reply: 5.2, stop: 6.3 };
    const t = title(copy("events"));
    const chipY = t.end + 20;
    const countLine = [`${counts.events} ${words.events}`, `${counts.variants} ${words.variants}`, `${counts.defaultOnEvents} ${words.onByDefault}`].join(" · ");
    const countStyle = { font: "voice", size: 13 };
    need(glyphs.measure(countLine, countStyle) <= CAP.w, "the count line does not fit its column");
    return scene(0, [
      t.svg,
      chip("permission_request", chipY, t0 + fire.ask, t0 + fire.wait - 0.1),
      chip("notification_idle_prompt", chipY, t0 + fire.wait, t0 + fire.stop - 0.1),
      chip("stop", chipY, t0 + fire.stop, t0 + D[0]),
      voice(countLine, CAP.x, chipY + 104 + 26, C.fg, 13, { bold: false }),
      terminal({
        body: session(t0, 0, [fire.ask, fire.wait, fire.ok, fire.reply, fire.reply + 0.12]) + status([["green", t0, t0 + D[0]]]),
        prompt: caret(),
      }),
    ]);
  })();

  // 2 ── At your desk. In another window. On your phone. ──────────────────────
  const s2 = (() => {
    const t0 = at[1];
    const PX = TERM.x, PW = TERM.w, PH = 98, GAP = 12, PY = 21;
    const arrive = [0.5, 2.2, 3.9];
    const caps = [copy("channelDesk"), copy("channelWindow"), copy("channelPhone")];
    const rowY = (n) => PY + n * (PH + GAP);
    const out = caps.map((c, n) =>
      `<g opacity=".34">${voice(c, CAP.x, rowY(n) + PH / 2 + 2, C.white, 23)}</g>` +
      `<g ${on(t0 + arrive[n], 0.3)}>${voice(c, CAP.x, rowY(n) + PH / 2 + 2, C.white, 23)}<rect x="${CAP.x}" y="${rowY(n) + PH / 2 + 13}" width="30" height="3" fill="${C.green}"/></g>`);
    const slide = (n) => kf(`0%,${p(t0 + arrive[n])}{opacity:0;transform:translateX(14px)}${p(t0 + arrive[n] + 0.32)},100%{opacity:1;transform:none}`);
    // the sound, at the desk
    const s = soundOf("permission_request");
    const y0 = rowY(0);
    out.push(`<g ${slide(0)}>` +
      `<rect x="${PX + 0.5}" y="${y0 + 0.5}" width="${PW - 1}" height="${PH - 1}" rx="12" fill="${C.chip}" stroke="${C.greenLine}" stroke-width="1.2"/>` +
      speaker(PX + 40, y0 + PH / 2, 20) +
      mono(s.e.name, PX + 76, y0 + 30, C.green, { size: 12.5 }) + voice(quoted(s.e.voiceText), PX + 76, y0 + 56, C.white, 20) + mono(fileLine(s), PX + 76, y0 + 78, "#8791a3", { size: 11 }) +
      waveform(s.peaks, 30, PX + PW - 152, y0 + 24, 132, 50, t0 + arrive[0] + 0.3, Math.min(s.durationSec, 3)) + "</g>");
    // the toast, in another window
    const y1 = rowY(1);
    out.push(`<g ${slide(1)}>` +
      `<rect x="${PX + 0.5}" y="${y1 + 0.5}" width="${PW - 1}" height="${PH - 1}" rx="12" fill="#20242d" stroke="#3a4150"/>` +
      bell(PX + 20, y1 + PH / 2 - 21, 42, C.green, C.bg) +
      voice(perm.title, PX + 78, y1 + 43, C.white, 18) + voice(perm.body, PX + 78, y1 + 67, "#c3c9d4", 15, { bold: false }) + "</g>");
    // the webhook, on a phone
    const y2 = rowY(2);
    defs.push(`<linearGradient id="ph" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2a5c"/><stop offset=".5" stop-color="#4b3a6e"/><stop offset="1" stop-color="#b0694a"/></linearGradient>`);
    out.push(`<g ${slide(2)}>` +
      `<rect x="${PX + 0.5}" y="${y2 + 0.5}" width="${PW - 1}" height="${PH - 1}" rx="12" fill="url(#ph)" stroke="#2c313c"/>` +
      voice(demo("phoneClock"), PX + 62, y2 + 62, C.white, 36, { anchor: "middle" }) +
      `<rect x="${PX + 126}" y="${y2 + 12}" width="${PW - 140}" height="${PH - 24}" rx="10" fill="#f6f4ee" fill-opacity=".95"/>` +
      bell(PX + 138, y2 + 21, 17, "#11141a", C.green) +
      voice(ntfy.headers.Title, PX + 162, y2 + 34.5, "#15171c", 14.5) + voice(String(ntfy.payload), PX + 138, y2 + 56, "#2a2d35", 14, { bold: false }) +
      mono(schema, PX + 138, y2 + 75, "#6c7280", { size: 10 }) + "</g>");
    const a = at[1], b = a + D[1];
    return `<g ${kf(`0%,${p(a)}{opacity:0}${p(a + 0.35)},${p(b - 0.35)}{opacity:1}${p(b)},100%{opacity:0}`)} opacity="0">${counter(1)}${out.join("")}${honestySvg}</g>`;
  })();

  // 3 ── Set it up by asking your agent ───────────────────────────────────────
  const s3 = (() => {
    const t0 = at[2];
    const type = [0.7, 2.1], send = 2.4, ran = 3.0, json = 3.6, muted = 4.2, said = 4.8;
    const t = title(copy("talk"));
    const askStyle = { font: "voice", size: 14 };
    let y = t.end + 36;
    const list = asks.map((a, n) => {
      const lines = wrap(glyphs, quoted(a), askStyle, CAP.w - 16);
      const svg = lines.map((l, k) => voice(l, CAP.x + 16, y + k * 19, n ? C.dim : C.white, 14, { bold: false })).join("") +
        `<rect x="${CAP.x}" y="${y - 10}" width="3" height="${lines.length * 19 - 5}" fill="${n ? C.faint : C.green}"/>`;
      y += lines.length * 19 + 9;
      return svg;
    });
    need(y < 312, "the example sentences run into the honesty caption");
    const tw = talk.said.length * CW;
    const typing = `<g clip-path="url(#pr)"><g ${span(t0 + type[0] - 0.4, t0 + send, 0.05)}>${mono(talk.said, TX + 2 * CW, PROMPT.y + 16.8, C.user)}` +
      `<g ${kf(`0%,${p(t0 + type[0])}{transform:none;animation-timing-function:steps(${talk.said.length},end)}${p(t0 + type[1])},100%{transform:translateX(${tw.toFixed(1)}px)}`)}>` +
      `<rect x="${TX + 2 * CW}" y="${PROMPT.y + 2}" width="${tw + 12}" height="${PROMPT.h - 4}" fill="${C.bg}"/>${caret()}</g></g></g>` +
      `<g ${cut(t0, t0 + type[0] - 0.35)}>${caret()}</g><g ${on(t0 + send, 0.05)}>${caret()}</g>`;
    // the row the mute lands on is marked for a moment
    const mutedRow = render("snooze").rows.findIndex((r) => r.some((s) => s.text.includes("MUTED")));
    need(mutedRow >= 0, "the snooze render has no MUTED segment");
    const flash = `<rect ${span(t0 + muted, t0 + muted + 1.6, 0.2)} x="${TX - 5}" y="${STATUS.top + mutedRow * LH + 0.5}" width="${11 * CW + 10}" height="${LH - 1}" rx="3" fill="none" stroke="${WARN}"/>`;
    return scene(2, [
      t.svg, ...list,
      terminal({
        body: session(t0, 5, [send, ran, json, said]) + status([["green", t0, t0 + muted], ["snooze", t0 + muted, t0 + D[2]]]) + flash,
        prompt: typing,
      }),
    ]);
  })();

  // 4 ── A status line that keeps context and quota in view ───────────────────
  const s4 = (() => {
    const t0 = at[3];
    const turn = [0, 2.5, 5.0, D[3]];
    const states = ["green", "yellow", "red"];
    const t = title(copy("statusline"));
    // the colour of each band is the colour the script gave the context bar in that render
    const ctxRow = (s) => need(render(s).rows.find((r) => r.some((x) => x.text.includes("Context:"))), `no context row in ${s}`);
    let y = t.end + 34;
    const head = mono("CONTEXT USED", CAP.x, y, C.dim, { size: 9.5, tracking: 0.14 });
    const table = states.map((s, n) => {
      y += 27;
      const row = `<rect x="${CAP.x}" y="${y - 11}" width="12" height="12" fill="${ctxRow(s)[0].fg}"/>` + voice(bands[n].used, CAP.x + 22, y, C.white, 14.5) + voice(bands[n].action, CAP.x + 92, y, C.fg, 13.5, { bold: false });
      need(92 + glyphs.measure(bands[n].action, { font: "voice", size: 13.5 }) <= CAP.w, `"${bands[n].action}" does not fit its column`);
      return `<g opacity=".3">${row}</g><g ${cut(t0 + turn[n], t0 + turn[n + 1])}>${row}</g>`;
    });
    need(y < 308, "the context table runs into the honesty caption");
    // the quota and context rows are framed; the frame follows the context row down when the line reflows
    const frames = states.map((s, n) => {
      const rows = render(s).rows;
      const a = rows.findIndex((r) => r.some((x) => x.text.includes("API Quota:")));
      const b = rows.findIndex((r) => r.some((x) => x.text.includes("Context:")));
      need(a >= 0 && b >= a, `the ${s} render lost its quota or context row`);
      return `<rect ${cut(t0 + turn[n], t0 + turn[n + 1])} x="${TX - 6}" y="${STATUS.top + a * LH - 1.5}" width="${TERM.w - 2 * PAD + 12}" height="${(b - a + 1) * LH + 3}" rx="4" fill="${ctxRow(s)[0].fg}" fill-opacity=".07" stroke="${ctxRow(s)[0].fg}" stroke-opacity=".7"/>`;
    });
    return scene(3, [
      t.svg, head, ...table,
      terminal({
        body: session(t0, 9, [], true) + frames.join("") + status(states.map((s, n) => [s, t0 + turn[n], t0 + turn[n + 1]])),
        prompt: caret(),
      }),
    ]);
  })();

  // 5 ── What stands behind it (the still frame) ──────────────────────────────
  const outro = (() => {
    const x0 = CAP.x + 4, right = CARD.w - 30;
    const out = [
      counter(D.length),
      `<rect x="${x0}" y="62" width="34" height="3" fill="${C.green}"/>`,
      mono("WHAT STANDS BEHIND IT", x0 + 46, 67.5, C.green, { size: 10.5, tracking: 0.14 }),
      voice("One canonical source for three editors.", x0, 102, C.white, 21),
      voice("Created by Chan Meng, its lead developer.", x0, 128, C.dim, 16.5, { bold: false }),
      `<path d="M${x0} 146.5H${right}" stroke="${C.line}"/>`,
    ];
    const colW = (right - x0) / 3;
    BEHIND.forEach(([value, lab, lines], n) => {
      const x = x0 + n * colW + (n ? 18 : 0);
      const body = lines.map((l, k) => {
        need(glyphs.measure(l, { font: "voice", size: 13 }) <= colW - 22, `"${l}" does not fit its column`);
        return voice(l, x, 256 + k * 18, C.fg, 13, { bold: false });
      }).join("");
      out.push(`<g ${kf(`0%,${p(outroAt + 0.5 + n * 0.3)}{opacity:0;transform:translateY(6px)}${p(outroAt + 0.85 + n * 0.3)},100%{opacity:1;transform:none}`)}>` +
        voice(value, x, 206, C.green, 50) + mono(lab, x, 231, C.white, { size: 10.5, tracking: 0.14 }) + body + "</g>");
      if (n) out.push(`<path d="M${x - 18.5} 162V282" stroke="${C.line}"/>`);
    });
    const works = label("worksIn");
    const worksW = glyphs.measure(works, { font: "voice", size: 13.5 });
    const tail = `${label("licence")} · ${stars[1]} GitHub stars (measured ${stars[2]})`;
    out.push(
      `<path d="M${x0} 298.5H${right}" stroke="${C.line}"/>`,
      voice(works, x0, 326, C.dim, 13.5, { bold: false }),
      voice(editors.join(" · "), x0 + worksW + 10, 326, C.white, 14.5),
      glyphs.text(tail, { font: "mono", size: 11.5, x: right, y: 325.5, fill: C.fg, anchor: "end" }),
    );
    return `<g ${kf(`0%,${p(outroAt)}{opacity:0}${p(outroAt + 0.35)},${p(T - 0.35)}{opacity:1}100%{opacity:0}`)}>${out.join("")}</g>`;
  })();

  // ── Identity: the film's end card, on the terminal's own ground ────────────
  const logoSvg = read("logo");
  const logoBox = need(logoSvg.match(/viewBox="0 0 (\d+) (\d+)"/), "the logo has no viewBox");
  const logoInner = need(logoSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>/), "the logo is not an svg")[1];
  defs.push('<clipPath id="lg"><circle cx="72" cy="104" r="32"/></clipPath>');
  const url = need(project.repoUrl, "projects[echook] has no repoUrl").replace(/^https:\/\//, "");
  const urlW = glyphs.measure(url, { font: "monoBold", size: 13.5 });
  const sub = wrap(glyphs, `${intro[1]} ${intro[2]}: ${intro[3]}`, { font: "voice", size: 14.5 }, CARD.panel - 62);
  need(sub.length <= 3, "the README's opening lines no longer fit the panel");
  const identity =
    `<rect width="${X}" height="${CARD.h}" fill="${C.bg}"/>` +
    mono(`${label("licence").toUpperCase()} · ${editors.join(" · ").toUpperCase()}`, 40, 46, C.dim, { size: 10.5, tracking: 0.12 }) +
    `<g clip-path="url(#lg)"><svg x="40" y="72" width="64" height="64" viewBox="0 0 ${logoBox[1]} ${logoBox[2]}">${logoInner}</svg></g>` +
    voice(project.name, 120, 122, C.white, 50) +
    voice(copy("end"), 40, 180, C.white, 24) +
    sub.map((l, n) => voice(l, 40, 209 + n * 21, C.fg, 14.5, { bold: false })).join("") +
    `<rect x="40.75" y="300.75" width="${(urlW + 26).toFixed(1)}" height="31" rx="7" fill="${C.green}" fill-opacity=".07" stroke="${C.green}" stroke-width="1.5"/>` +
    glyphs.text(url, { font: "monoBold", size: 13.5, x: 54, y: 321, fill: C.green });

  const stage = `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${C.bg}"/>` + s1 + s2 + s3 + s4 + outro;

  return {
    svg: card({
      title:
        `echook, an open-source notification system for AI coding agents, created by Chan Meng, shown working in a terminal session recreated in code from the product's own output: ` +
        `each hook event plays its own sound (${counts.events} events, ${counts.variants} matcher variants, ${counts.defaultOnEvents} on by default); the same alert can reach you as a sound at your desk, a desktop toast or a phone notification; ` +
        `settings are changed by asking the agent, here “${talk.said}”; and a status line keeps context and quota in view. ` +
        `Works in ${list(editors)}. MIT licensed, ${runtime[1]} standard library only, with a ${tests}-test suite run on ${list(osList.map((o) => OS[o]))}.`,
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body: stage + identity + `<rect x="${X - 0.5}" width="1" height="${CARD.h}" fill="${C.line}"/>`,
      radius: 14,
    }),
    facts: { scenes: total, events: counts.events, variants: counts.variants, tests: Number(tests), statusColumns: COLS, bakedVersion: baked.source.version, loop: `${T.toFixed(1)}s` },
  };
}
