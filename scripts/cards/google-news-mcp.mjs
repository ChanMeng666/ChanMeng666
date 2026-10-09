// Google News MCP Server card. The product is a Model Context Protocol server
// with one tool: an assistant calls google_news_search, the server asks Google
// News and answers with the results sorted into topics. The stage is one chat:
// a question is typed, the assistant calls the tool, the answer arrives as
// article cards in the server's five topic groups, then the country and the
// language codes change and the cards regroup.
//
// The product has no site and no stated design system, so the card's system is
// DERIVED from its only brand asset, the logo file in its repo
// (server-google-news/public/server-google-news.svg): white paper, a thick
// black outline, flat sky blue with orange, teal and red pages behind the
// paper. Those fills are read from that file at build time. The name is the
// logo's own lettering, cut from the same file; the text face (Outfit) is the
// open geometric sans closest to that lettering, and the mono is for protocol
// and code content.
//
// Nothing on the stage is drawn from imagination:
//   - the question and the call are the README's own example ("Quick AI Usage
//     Guide"); the chat is the client the README installs into, and the
//     server's name is the key of the README's claude_desktop_config.json;
//   - the tool name and its properties are read from the ListTools handler in
//     src/index.ts, the second country code from the gl property's own example;
//   - the topic groups are the classifier in formatNewsResults(), in the order
//     the code tests them;
//   - an article card shows the fields of the template formatResponseText()
//     writes, each ${article.field} as {field}: no headline or publisher is
//     made up, and which card sits in which group is an illustration;
//   - the language codes are manifest.json › ai_metadata.capabilities, and the
//     last one answers like the first because the handler sends it as that.
// Each is matched by pattern, and the build throws when a pattern stops
// matching. The panel's headline is data/profile's impact headline.
//
// The product repo is NOT part of this repo (GOOGLE_NEWS_INPUTS); where it is
// absent the card is not rebuilt and the committed SVG stands. The build makes
// no network call and never starts the server.
import { readFileSync } from "node:fs";

import { CARD, card, pct } from "../lib/svg-card/shell.mjs";

export const GOOGLE_NEWS_FONTS = {
  display: "scripts/cards/fonts/google-news-mcp/Outfit-700.ttf",
  body: "scripts/cards/fonts/google-news-mcp/Outfit-400.ttf",
  mono: "cv/fonts/JetBrainsMono-Regular.ttf",
};
export const GOOGLE_NEWS_INPUTS = {
  source: "../server-google-news/src/index.ts",
  manifest: "../server-google-news/manifest.json",
  readme: "../server-google-news/README.md",
  logo: "../server-google-news/public/server-google-news.svg",
};

// The fills of the product's logo file; the build checks each is still there.
const P = { ink: "#000000", paper: "#ffffff", blue: "#44ACF1", orange: "#FA8F3E", teal: "#177F6F", red: "#EA4841" };
const SOFT = "#3d3d3d"; // ink, lightened for secondary text on paper (derived)

const fail = (what) => { throw new Error(`google-news-mcp card: ${what}`); };
const must = (text, pattern, what) => text.match(pattern) || fail(`${what} no longer matches ${pattern}`);

// ── What the product says about itself ───────────────────────────────────────
function readProduct(root) {
  const read = (key) => readFileSync(`${root}/${GOOGLE_NEWS_INPUTS[key]}`, "utf8").replace(/\r\n/g, "\n");
  const source = read("source");
  const readme = read("readme");
  const manifest = JSON.parse(read("manifest"));

  // the one tool, as the ListTools handler declares it
  const tools = must(source, /tools: \[\s*\{([\s\S]*?)\n {6}\],/, "the ListTools handler")[1];
  const tool = must(tools, /name: '(\w+)'/, "the tool name")[1];
  const props = [...tools.matchAll(/(\w+): \{\s*type: 'string',\s*description: '([^']+)',(?:\s*default: '([^']+)',?)?\s*\}/g)]
    .map(([, name, description, dflt]) => ({ name, description, default: dflt }));
  const declared = Object.keys(manifest.mcp.capabilities.tools[tool]?.parameters || {});
  if (props.length !== 7 || props.map((p) => p.name).join() !== declared.join()) fail(`the tool's properties (${props.map((p) => p.name)}) no longer match manifest.json (${declared})`);

  // the README's own example call
  const example = must(readme, /### Quick AI Usage Guide\s+```json\n([\s\S]*?)\n```/, "the README's example call")[1];
  const call = JSON.parse(example);
  if (call.tool !== tool || Object.keys(call.parameters).join() !== "q,gl,hl") fail("the README's example call no longer uses the tool with q, gl and hl");
  const dflt = (name) => props.find((p) => p.name === name)?.default || fail(`the ${name} property no longer has a default`);
  if (call.parameters.gl !== dflt("gl") || call.parameters.hl !== dflt("hl")) fail("the README's example call no longer uses the default country and language");
  // the other country code the gl property itself names
  const countries = must(props.find((p) => p.name === "gl").description, /^Country code \(e\.g\., (\w\w), (\w\w)\)$/, "the gl property's examples").slice(1, 3);
  if (countries[0] !== call.parameters.gl) fail("the gl property's first example is no longer the example call's country");

  // the classifier: a default, then keyword tests in order
  const fallback = must(source, /let category = '([^']+)';/, "the default category")[1];
  const rules = [...source.matchAll(/if \(titleAndSnippet\.match\(\/([^/]+)\/\)\) \{\s*category = '([^']+)';/g)].map(([, keywords, name]) => ({ name, keywords }));
  const categories = [...rules.map((r) => r.name), fallback];
  must(readme, new RegExp(`\\*\\*Categories\\*\\*: ${categories.join(", ").replace(/[&]/g, "\\&")}`), "the README's category list");
  if (rules.length !== 4) fail(`expected four keyword rules, found ${rules.length}`);

  // the response text: formatResponseText()'s own template literals
  const formatter = must(source, /private formatResponseText\([\s\S]*?\n {2}\}\n/, "formatResponseText()")[0];
  const field = (t) => t.replace(/\\n$/, "").replace(/\$\{article\.(\w+)[^}]*\}/g, "{$1}");
  const lines = [...formatter.matchAll(/text \+?= `([^`]*)`;/g)].map((m) => field(m[1]));
  if (lines.length !== 6 || lines[0] !== "- {title}" || lines[1] !== "  Source: {source}") fail(`the article template changed: ${JSON.stringify(lines)}`);
  must(source, /content: \[\{\s*type: 'text',\s*text: resultText\s*\}\]/, "the tool result");

  // languages; the handler sends the last of them as the first
  const languages = manifest.ai_metadata.capabilities.languages_supported;
  if (!Array.isArray(languages) || languages.length !== 10 || languages[0] !== call.parameters.hl) fail("manifest.json no longer lists ten languages, the example's first");
  const sentAs = must(source, /hl: args\.hl === '(\w\w)' \? '(\w\w)' :/, "the language the handler replaces");
  if (sentAs[1] !== languages[9] || sentAs[2] !== languages[0]) fail("the handler no longer sends the last listed language as the first");

  return {
    tool, call, countries, categories, languages,
    fields: { title: lines[0].slice(2), source: lines[1].split(": ")[1] },
    client: must(readme, /To install Google News for (Claude Desktop) automatically/, "the README's client")[1],
    server: must(readme, /`claude_desktop_config\.json`[\s\S]*?```json\n\s*"([\w-]+)": \{/, "the README's server entry")[1],
    npm: must(readme, /^(npm i @chanmeng666\/google-news-server)$/m, "the README's npm install line")[1],
  };
}

// The logo file, split into the mark and the lettering under it. Both are used
// as they are; only the precision of the coordinates is reduced.
function readLogo(root) {
  const file = readFileSync(`${root}/${GOOGLE_NEWS_INPUTS.logo}`, "utf8");
  must(file, /viewBox="0 0 474 579"/, "the logo's viewBox");
  for (const fill of Object.values(P).filter((f) => f !== P.paper && f !== P.ink)) if (!file.includes(`fill="${fill}"`)) fail(`the logo no longer uses ${fill}`);
  const mark = [];
  const lettering = [];
  for (const [path, d] of file.matchAll(/<path d="([^"]+)"[^>]*\/>/g)) {
    const y = Number(must(d, /^M\s*-?[\d.]+[ ,](-?[\d.]+)/, "a logo path")[1]);
    const word = y > 455;
    // the letterforms keep a decimal; the mark and the trace's edge slivers do not need one at this size
    const digits = word && path.includes('fill="black"') ? 10 : 1;
    (word ? lettering : mark).push(path.replace(/-?\d+\.\d+/g, (v) => String(Math.round(Number(v) * digits) / digits)).replace(' fill-opacity="0.996"', ""));
  }
  if (mark.length < 80 || lettering.length < 80) fail("the logo no longer splits into a mark and its lettering");
  return { mark: mark.join(""), lettering: lettering.join("") };
}

export function buildGoogleNewsCard({ glyphs, root, project }) {
  const product = readProduct(root);
  const logo = readLogo(root);
  const headline = ["Lets AI assistants like Claude", "search live Google News."];
  if (!project.narrative.impactHeadline.startsWith(`${headline.join(" ").slice(0, -1)} — sorted into topics, in ${product.languages.length} languages.`)) fail("the impact headline no longer opens with the panel's headline and its figures");

  const text = (str, o) => glyphs.text(str, o);
  const MONO = { font: "mono", size: 12 };
  const n1 = (v) => Number(v.toFixed(1));

  // ── Timeline: one chat, four beats ─────────────────────────────────────────
  const ASK = 0.5; // the question is typed
  const CALL = 2.5; // the tool call, its parameters one by one
  const DONE = 4.5; // the call returns and the results window arrives
  const COUNTRY = 9.4; // gl changes and changes back
  const HOME = 11.2;
  const LANG = 12.8; // hl steps through the listed languages
  const STEP = 0.8;
  const T = LANG + STEP * (product.languages.length - 1) + 1.0;
  const p = (t) => pct(t, T, 3);
  const css = [];
  const rule = (name, body, extra = "") => css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${T.toFixed(1)}s linear infinite${extra}}`);
  // the chat empties and starts again
  rule("lp", `0%{opacity:0}${p(0.35)},${p(T - 0.4)}{opacity:1}100%{opacity:0}`);
  // an element that arrives t seconds into the loop
  const seen = new Set();
  const arrive = (t) => {
    const name = `r${Math.round(t * 100)}`;
    if (!seen.has(name)) {
      seen.add(name);
      rule(name, `0%,${p(t)}{opacity:0;transform:translateY(6px)}${p(t + 0.3)},100%{opacity:1;transform:none}`);
    }
    return name;
  };
  // an element shown only from a to b; one that is not in the still frame carries opacity="0"
  const span = (name, a, b) => rule(name, `0%{opacity:0;animation-timing-function:step-end}${p(a)}{opacity:1;animation-timing-function:step-end}${p(b)},100%{opacity:0}`);
  const except = (name, a, b) => rule(name, `0%{opacity:1;animation-timing-function:step-end}${p(a)}{opacity:0;animation-timing-function:step-end}${p(b)},100%{opacity:${b < T ? 1 : 0}}`);
  except("g0", COUNTRY, HOME);
  span("g1", COUNTRY, HOME);
  except("h0", LANG, T);
  product.languages.slice(1).forEach((_, k) => span(`h${k + 1}`, LANG + k * STEP, k === product.languages.length - 2 ? T : LANG + (k + 1) * STEP));
  // one of several values in the same place: the first is the still frame's
  const flip = (values, cls, o) => values.map((v, k) => `<g class="${cls}${k}"${k ? ' opacity="0"' : ""}>${text(v, o)}</g>`).join("");
  const quoted = (v) => `"${v}"`;

  // ── Layout ─────────────────────────────────────────────────────────────────
  const X = CARD.panel;
  const CHAT = { x: X + 20, y: 20, w: 276, h: 312, head: 34, pad: 16 };
  const RES = { x: X + 320, y: 20, w: 452, h: 312, head: 34, pad: 16 };
  const defs = [];

  // a sheet of paper with a coloured page behind it, as the mark stacks them
  const sheet = (W, page) =>
    `<rect x="${W.x + 8}" y="${W.y + 8}" width="${W.w}" height="${W.h}" rx="12" fill="${page}" stroke="${P.ink}" stroke-width="3"/>` +
    `<rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="12" fill="${P.paper}" stroke="${P.ink}" stroke-width="3"/>` +
    `<path d="M${W.x} ${W.y + W.head}h${W.w}" stroke="${P.ink}" stroke-width="3"/>`;
  // a parameter's name, as a blue tab
  const key = (name, x, y, w = 28) =>
    `<rect x="${x}" y="${y}" width="${w}" height="20" rx="5" fill="${P.blue}" stroke="${P.ink}" stroke-width="1.5"/>` +
    text(name, { ...MONO, x: x + w / 2, y: y + 14.5, fill: P.ink, anchor: "middle" });
  const tick = (cx, cy) =>
    `<circle cx="${cx}" cy="${cy}" r="7.5" fill="${P.teal}" stroke="${P.ink}" stroke-width="1.5"/>` +
    `<path d="M${cx - 3.6} ${cy + 0.2}l2.6 2.6l4.6-5.2" fill="none" stroke="${P.paper}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;

  // ── The chat ───────────────────────────────────────────────────────────────
  const chat = () => {
    const ix = CHAT.x + CHAT.pad;
    const iw = CHAT.w - CHAT.pad * 2;
    const top = CHAT.y + CHAT.head;
    const frame = sheet(CHAT, P.orange) +
      text(product.client, { font: "display", size: 14, x: ix, y: CHAT.y + 22.5, fill: P.ink }) +
      `<circle cx="${ix + iw - glyphs.measure(product.server, { font: "mono", size: 11 }) - 10}" cy="${CHAT.y + 18}" r="4" fill="${P.teal}" stroke="${P.ink}" stroke-width="1.2"/>` +
      text(product.server, { font: "mono", size: 11, x: ix + iw, y: CHAT.y + 22, fill: SOFT, anchor: "end" }) +
      // the message box
      `<rect x="${ix}" y="${CHAT.y + CHAT.h - 46}" width="${iw}" height="32" rx="9" fill="${P.paper}" stroke="${P.ink}" stroke-width="2"/>` +
      `<circle cx="${ix + iw - 16}" cy="${CHAT.y + CHAT.h - 30}" r="9" fill="${P.blue}" stroke="${P.ink}" stroke-width="1.5"/>` +
      `<path d="M${ix + iw - 16} ${CHAT.y + CHAT.h - 25.5}v-9m-3.6 3.6l3.6-3.6l3.6 3.6" fill="none" stroke="${P.ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;

    // the question, on two lines: it is also the call's q
    const words = product.call.parameters.q.split(" ");
    const ask = [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
    const Q = { font: "body", size: 14.5 };
    const bw = Math.max(...ask.map((l) => glyphs.measure(l, Q))) + 26;
    const bubble = { x: ix + iw - bw, y: top + 12, w: bw, h: 54 };
    if (bw > iw) fail("the README's example query no longer fits the chat on two lines");
    defs.push(`<clipPath id="ask"><rect x="${n1(bubble.x + 2)}" y="${bubble.y + 2}" width="${n1(bw - 4)}" height="${bubble.h - 4}" rx="9"/></clipPath>`);
    // a line types itself: a cover the colour of the bubble slides off it
    ask.forEach((l, n) => rule(`c${n}`, `0%,${p(ASK + n * 0.75)}{transform:translateX(0);animation-timing-function:steps(${l.length},end)}${p(ASK + n * 0.75 + 0.7)},100%{transform:translateX(${n1(bw)}px)}`));
    const question = `<g class="${arrive(0.3)}">` +
      `<rect x="${n1(bubble.x)}" y="${bubble.y}" width="${n1(bw)}" height="${bubble.h}" rx="11" fill="${P.blue}" stroke="${P.ink}" stroke-width="2"/>` +
      ask.map((l, n) => text(l, { ...Q, x: bubble.x + 13, y: bubble.y + 23 + n * 19, fill: P.ink })).join("") +
      `<g clip-path="url(#ask)">${ask.map((_, n) => `<rect class="c${n}" transform="translate(${n1(bw)} 0)" x="${n1(bubble.x + 10)}" y="${bubble.y + 9 + n * 19}" width="${n1(bw)}" height="19" fill="${P.blue}"/>`).join("")}</g></g>`;

    // the tool call: its name, then each parameter of the README's example
    const box = { x: ix, y: bubble.y + bubble.h + 14, w: iw, h: 136 };
    const V = { font: "mono", size: 11, fill: P.teal };
    const vx = box.x + 48;
    const q = [`"${ask[0]}`, `${ask[1]}"`];
    if (Math.max(...q.map((l) => glyphs.measure(l, V))) > box.w - 58) fail("the example query no longer fits the tool call");
    rule("sp", "to{transform:rotate(360deg)}");
    css.push(".sp{animation-duration:.9s;transform-box:fill-box;transform-origin:center}");
    span("busy", 0, DONE);
    const rows = [
      [0.4, key("q", box.x + 10, box.y + 40) + q.map((l, n) => text(l, { ...V, x: vx, y: box.y + 54 + n * 15 })).join("")],
      [0.8, key("gl", box.x + 10, box.y + 78) + flip(product.countries.map(quoted), "g", { ...V, x: vx, y: box.y + 92.5 })],
      [1.2, key("hl", box.x + 10, box.y + 104) + flip(product.languages.map(quoted), "h", { ...V, x: vx, y: box.y + 118.5 })],
    ];
    if (box.y + box.h > CHAT.y + CHAT.h - 56) fail("the tool call no longer fits above the message box");
    const called = `<g class="${arrive(CALL)}">` +
      `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="9" fill="${P.paper}" stroke="${P.ink}" stroke-width="2"/>` +
      `<path d="M${box.x} ${box.y + 30}h${box.w}" stroke="${P.ink}" stroke-width="1.5"/>` +
      text(product.tool, { ...MONO, x: box.x + 34, y: box.y + 19.5, fill: P.ink }) +
      `<g class="busy" opacity="0"><circle class="sp" cx="${box.x + 18}" cy="${box.y + 15}" r="6" fill="none" stroke="${P.ink}" stroke-width="2" stroke-dasharray="24 14"/></g>` +
      `<g class="${arrive(DONE)}">${tick(box.x + 18, box.y + 15)}</g></g>` +
      rows.map(([t, row]) => `<g class="${arrive(CALL + t)}">${row}</g>`).join("");
    return `${frame}<g class="lp">${question}${called}</g>`;
  };

  // ── The answer ─────────────────────────────────────────────────────────────
  const results = () => {
    const ix = RES.x + RES.pad;
    const iw = RES.w - RES.pad * 2;
    const top = RES.y + RES.head;
    const out = [sheet(RES, P.red), text("CATEGORIES", { font: "mono", size: 11, x: ix, y: RES.y + 22, fill: P.ink, tracking: 0.14 })];
    // the two codes this answer was asked with
    const V = { font: "mono", size: 11.5, fill: P.ink };
    let cx = ix + iw;
    for (const [name, values, cls] of [["hl", product.languages, "h"], ["gl", product.countries, "g"]]) {
      cx -= 62;
      out.push(`<rect x="${cx}" y="${RES.y + 7}" width="56" height="20" rx="5" fill="${P.paper}" stroke="${P.ink}" stroke-width="1.5"/>` +
        key(name, cx, RES.y + 7) + flip(values, cls, { ...V, x: cx + 42, y: RES.y + 21.5, anchor: "middle" }));
    }

    // five topic groups, each a row of article cards
    const BAR = [P.blue, P.orange, P.teal, P.red, P.ink];
    const NAME = { font: "display", size: 14 };
    const pitch = 43;
    const y0 = top + 11;
    const gap = 8;
    const cardsX = ix + 14 + Math.ceil(Math.max(...product.categories.map((c) => glyphs.measure(c, NAME)))) + 12;
    const cw = (ix + iw - cardsX - gap * 2) / 3;
    if (cw < 80) fail("a category name leaves no room for three article cards");
    product.categories.forEach((name, r) => {
      const y = y0 + r * pitch;
      out.push(`<rect x="${ix}" y="${y}" width="7" height="34" rx="2" fill="${BAR[r]}" stroke="${P.ink}" stroke-width="1.5"/>` +
        text(name, { ...NAME, x: ix + 14, y: y + 22, fill: P.ink }));
      if (r) out.push(`<path d="M${ix} ${y - 4.5}h${iw}" stroke="${P.ink}" stroke-opacity=".14" stroke-width="1.5"/>`);
    });

    // Which group each of the nine cards is in, per arrangement. `home` is the
    // still frame's, and what the example's own codes show.
    const LAYOUT = {
      home: [0, 0, 0, 1, 1, 2, 2, 3, 4],
      b: [0, 0, 1, 1, 1, 2, 3, 3, 4],
      c: [0, 1, 1, 2, 2, 2, 3, 4, 4],
      d: [0, 0, 1, 2, 3, 3, 4, 4, 4],
    };
    const place = (rows) => rows.map((r, i) => {
      const slot = rows.slice(0, i).filter((v) => v === r).length;
      if (slot > 2) fail("an arrangement puts four cards in one group");
      return [slot * (cw + gap), r * pitch];
    });
    const at = Object.fromEntries(Object.entries(LAYOUT).map(([k, rows]) => [k, place(rows)]));
    // gl changes and changes back, then one arrangement per language; the last
    // language is sent as the first, so it shows the first's arrangement
    const turn = ["b", "c", "d"];
    const moves = [[COUNTRY, "b"], [HOME, "home"], ...product.languages.slice(1).map((_, k, all) => [LANG + k * STEP, k === all.length - 1 ? "home" : turn[k % 3]])];
    const fields = [product.fields.title, product.fields.source];
    if (glyphs.measure(fields[1], { font: "mono", size: 9.5 }) > cw - 14) fail("the article fields no longer fit a card");
    LAYOUT.home.forEach((_, i) => {
      const [hx, hy] = at.home[i];
      let last = "translate(0,0)";
      const stops = [`0%{transform:${last}}`];
      for (const [t, k] of moves) {
        const next = `translate(${n1(at[k][i][0] - hx)}px,${n1(at[k][i][1] - hy)}px)`;
        if (next !== last) stops.push(`${p(t)}{transform:${last};animation-timing-function:cubic-bezier(.4,0,.2,1)}${p(t + 0.32)}{transform:${next}}`);
        last = next;
      }
      stops.push(`100%{transform:${last}}`);
      rule(`m${i}`, stops.join(""));
      const x = cardsX + hx;
      const y = y0 + hy;
      out.push(`<g class="${arrive(DONE + 0.7 + i * 0.22)}"><g class="m${i}">` +
        `<rect x="${n1(x)}" y="${y}" width="${n1(cw)}" height="34" rx="6" fill="${P.paper}" stroke="${P.ink}" stroke-width="1.5"/>` +
        text(fields[0], { font: "mono", size: 10.5, x: x + 8, y: y + 14.5, fill: P.teal }) +
        text(fields[1], { font: "mono", size: 9.5, x: x + 8, y: y + 27, fill: SOFT }) +
        "</g></g>");
    });

    // the listed languages, the one in use lit
    const ty = RES.y + RES.h - 40;
    const tg = 6;
    const tw = (iw - tg * (product.languages.length - 1)) / product.languages.length;
    if (y0 + 4 * pitch + 34 > ty - 14) fail("the five groups no longer fit above the language row");
    out.push(`<path d="M${ix} ${ty - 11}h${iw}" stroke="${P.ink}" stroke-width="2"/>`);
    product.languages.forEach((code, n) => {
      const x = n1(ix + n * (tw + tg));
      out.push(`<rect class="h${n}"${n ? ' opacity="0"' : ""} x="${x}" y="${ty}" width="${n1(tw)}" height="26" rx="6" fill="${P.blue}"/>` +
        `<rect x="${x}" y="${ty}" width="${n1(tw)}" height="26" rx="6" fill="none" stroke="${P.ink}" stroke-width="1.5"/>` +
        text(code, { ...MONO, x: x + tw / 2, y: ty + 17.5, fill: P.ink, anchor: "middle" }));
    });
    // until the call returns, the place the answer will take
    const waiting = `<rect x="${RES.x}" y="${RES.y}" width="${RES.w}" height="${RES.h}" rx="12" fill="${P.paper}" fill-opacity=".16" stroke="${P.ink}" stroke-opacity=".45" stroke-width="2" stroke-dasharray="7 7"/>`;
    return `${waiting}<g class="lp"><g class="${arrive(DONE + 0.2)}">${out.join("")}</g></g>`;
  };

  // ── Identity, on the logo's own white paper ────────────────────────────────
  const H = { font: "display", size: 28 };
  if (Math.max(...headline.map((l) => glyphs.measure(l, H))) > 420) fail("the headline no longer fits the panel");
  const identity = [
    `<rect width="${X}" height="${CARD.h}" fill="${P.paper}"/>`,
    text("OPEN-SOURCE MCP SERVER", { font: "mono", size: 12, x: 40, y: 46, fill: SOFT, tracking: 0.16 }),
    // the mark, then its lettering beside it instead of under it
    `<svg x="40" y="64" width="108" height="100.3" viewBox="0 0 474 440">${logo.mark}</svg>`,
    `<svg x="168" y="77" width="292" height="74" viewBox="36 469 434 110">${logo.lettering}</svg>`,
    `<rect x="40" y="184" width="420" height="4" fill="${P.ink}"/>`,
    ...headline.map((l, n) => text(l, { ...H, x: 40, y: 227 + n * 34, fill: P.ink })),
  ];
  // the install line as a chip, then two figures of the product's own
  const pill = glyphs.measure(product.npm, MONO) + 24;
  identity.push(
    `<rect x="41" y="298" width="${n1(pill)}" height="32" rx="8" fill="${P.paper}" stroke="${P.ink}" stroke-width="2"/>`,
    text(product.npm, { ...MONO, x: 53, y: 318.5, fill: P.ink }),
  );
  let fx = 41 + pill + 22;
  for (const [value, label] of [[product.languages.length, "languages"], [product.categories.length, "topics"]]) {
    identity.push(text(String(value), { font: "display", size: 25, x: fx, y: 315, fill: P.ink }), text(label, { font: "body", size: 12.5, x: fx, y: 331, fill: SOFT }));
    fx += glyphs.measure(label, { font: "body", size: 12.5 }) + 20;
  }
  if (fx - 20 > X - 24) fail("the panel's bottom row no longer fits");

  const body =
    `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${P.blue}"/>` +
    chat() + results() +
    identity.join("") +
    `<rect x="${X - 1.5}" width="3" height="${CARD.h}" fill="${P.ink}"/>`;

  // Every character on the card is a <use> that repeats its glyph's id, so the
  // ids are shortened here, the most used first ("t", "ask" and "card" are taken).
  const shorten = (svg) => {
    const count = new Map();
    for (const [, id] of svg.matchAll(/href="#(_\w{4})"/g)) count.set(id, (count.get(id) || 0) + 1);
    const A = "abcdefghijklmnopqrsuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const names = [...A, ...[...A].flatMap((a) => [..."0123456789"].map((b) => a + b))];
    const short = new Map([...count].sort((a, b) => b[1] - a[1]).map(([id], n) => [id, names[n] || fail("more glyphs than short ids")]));
    return svg.replace(/(href="#|id=")(_\w{4})"/g, (all, head, id) => (short.has(id) ? `${head}${short.get(id)}"` : all));
  };

  return {
    svg: shorten(card({
      title:
        `Google News MCP Server, an open-source Model Context Protocol server that lets AI assistants such as Claude search live Google News. ` +
        `The card shows a chat calling its one tool, ${product.tool}, and the answer arriving as article cards sorted into ${product.categories.length} topics ` +
        `(${product.categories.join(", ")}), which regroup as the country and language codes change across ${product.languages.length} languages.`,
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body,
      radius: 14,
    })),
    facts: {
      tool: product.tool, categories: product.categories.length,
      languages: product.languages.length, loop: `${T.toFixed(1)}s`,
    },
  };
}
