// Google News MCP Server card. The product is a Model Context Protocol server
// with one tool: an assistant calls google_news_search, the server asks Google
// News and answers with the results sorted into topics. The stage follows one
// call through the server, then says what stands behind the project.
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
// Nothing on the stage is drawn from imagination, and no headline is invented:
//   - the call is the README's own example ("Quick AI Usage Guide");
//   - the tool name and its seven properties are read from the ListTools
//     handler in src/index.ts;
//   - the categories and the keywords that select each are the classifier in
//     formatNewsResults(), in the order the code tests them;
//   - the response is the template formatResponseText() writes, with each
//     ${article.field} shown as {field} where a result would be;
//   - the language codes are manifest.json › ai_metadata.capabilities.
// Each is matched by pattern, and the build throws when a pattern stops
// matching. The captions are the README's own feature headings and sentences.
// The closing figures are data/profile's (projects[google-news-mcp].metrics),
// each with its basis on the same frame.
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
  llms: "../server-google-news/llms.txt",
  logo: "../server-google-news/public/server-google-news.svg",
};

// The fills of the product's logo file; the build checks each is still there.
const P = { ink: "#000000", paper: "#ffffff", blue: "#44ACF1", orange: "#FA8F3E", teal: "#177F6F", red: "#EA4841" };
const SOFT = "#3d3d3d"; // ink, lightened for secondary text on paper (derived)
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fail = (what) => { throw new Error(`google-news-mcp card: ${what}`); };
const must = (text, pattern, what) => text.match(pattern) || fail(`${what} no longer matches ${pattern}`);

// ── What the product says about itself ───────────────────────────────────────
function readProduct(root) {
  const read = (key) => readFileSync(`${root}/${GOOGLE_NEWS_INPUTS[key]}`, "utf8").replace(/\r\n/g, "\n");
  const source = read("source");
  const readme = read("readme");
  const llms = read("llms");
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
  if (call.tool !== tool || Object.keys(call.parameters).some((k) => !declared.includes(k))) fail("the README's example call no longer uses the tool as declared");

  // the classifier: a default, then keyword tests in order
  const fallback = must(source, /let category = '([^']+)';/, "the default category")[1];
  const rules = [...source.matchAll(/if \(titleAndSnippet\.match\(\/([^/]+)\/\)\) \{\s*category = '([^']+)';/g)].map(([, keywords, name]) => ({ name, keywords }));
  must(source, /\(result\.title \+ ' ' \+ \(result\.snippet \|\| ''\)\)\.toLowerCase\(\)/, "what the classifier reads");
  const categories = [...rules.map((r) => r.name), fallback];
  must(readme, new RegExp(`\\*\\*Categories\\*\\*: ${categories.join(", ").replace(/[&]/g, "\\&")}`), "the README's category list");
  if (rules.length !== 4) fail(`expected four keyword rules, found ${rules.length}`);

  // the response text: formatResponseText()'s own template literals
  const formatter = must(source, /private formatResponseText\([\s\S]*?\n {2}\}\n/, "formatResponseText()")[0];
  const field = (t) => t.replace(/\\n$/, "").replace(/\$\{article\.(\w+)[^}]*\}/g, "{$1}");
  const lines = [...formatter.matchAll(/text \+?= `([^`]*)`;/g)].map((m) => field(m[1]));
  const head = must(formatter, /return `(\$\{category\.name\}) \(\$\{category\.articles\.length\} (articles\):)\\n/, "the category heading template");
  const rule = must(formatter, /'(=)'\.repeat\((\d+)\)/, "the separator between categories");
  if (lines.length !== 6 || !lines[0].startsWith("- {title}")) fail(`the article template changed: ${JSON.stringify(lines)}`);
  must(source, /content: \[\{\s*type: 'text',\s*text: resultText\s*\}\]/, "the tool result");

  // languages and regions
  const languages = manifest.ai_metadata.capabilities.languages_supported;
  const regions = manifest.ai_metadata.capabilities.regions_supported;
  if (!Array.isArray(languages) || languages.length !== 10 || typeof regions !== "string") fail("manifest.json no longer lists ten languages and a regions value");

  // captions: the README's feature headings, each with its own sentence
  const feature = (name) => must(readme, new RegExp(`### \\S+ ${name}\\s*\\n(.+)`), `the README feature "${name}"`)[1].trim();
  const bullet = (name) => must(readme, new RegExp(`- \\*\\*${name}\\*\\*: (.+)`), `the README line "${name}"`)[1].trim();

  return {
    tool, props, example: example.split("\n"), call,
    rules, fallback,
    heading: (name) => `${name} ({n} ${head[2]}`,
    article: lines,
    separator: rule[1].repeat(Number(rule[2])),
    languages, regions,
    fallbackLine: must(llms, /^- (Automatic fallback to English for unsupported languages)$/m, "the llms.txt fallback line")[1],
    purpose: manifest.ai_metadata.purpose,
    install: must(readme, /^(npx -y @smithery\/cli install @chanmeng666\/google-news-server --client claude)$/m, "the README's Smithery install command")[1],
    npm: must(readme, /^(npm i @chanmeng666\/google-news-server)$/m, "the README's npm install line")[1],
    license: manifest.license,
    topPick: Boolean(must(readme, /pulsemcp\.com\/badge\/top-pick\/chanmeng666-google-news/, "the README's PulseMCP badge")),
    captions: [
      { title: ["Flexible Search", "Options"], sub: feature("Flexible Search Options") },
      { title: ["Smart", "Categorization"], sub: feature("Smart Categorization") },
      { title: ["Structured", "Output"], sub: `${bullet("Structured Output")}.` },
      { title: ["Global", "Coverage"], sub: feature("Global Coverage") },
    ],
  };
}

// ── What the career database records about it ────────────────────────────────
function readRecord(project) {
  const metric = (label) => (project.metrics || []).find((m) => m.label === label)?.value || fail(`data/profile has no "${label}" metric for ${project.id}`);
  const day = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
  const first = must(metric("First commit"), /^(\d{4}-\d\d-\d\d) — (\d+) days after MCP's (\w{3}) (\d+) (\d{4}) public launch/, "the First commit metric");
  const listings = must(metric("Registry listings"), /^(\d+\+) MCP catalogs \(Smithery, mcp\.so, Glama, PulseMCP,/, "the Registry listings metric");
  const stars = must(metric("Stars"), /^(\d+) GitHub \(measured (\d{4}-\d\d-\d\d)\) · (\d+) forks/, "the Stars metric");
  must(metric("PulseMCP badge"), /^Top Pick/, "the PulseMCP badge metric");
  must(project.narrative.impactHeadline, /^Lets AI assistants like Claude search live Google News — sorted into topics, in 10 languages\./, "the impact headline");
  return {
    days: first[2], firstCommit: day(first[1]), launch: `${first[4]} ${first[3]} ${first[5]}`,
    listings: listings[1],
    stars: stars[1], measured: day(stars[2]), forks: stars[3],
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
  const record = readRecord(project);
  const logo = readLogo(root);
  if (product.languages.length !== 10) fail("the language count on the panel is no longer ten");

  const text = (str, o) => glyphs.text(str, o);
  const wrap = (str, o, width) => {
    const out = [];
    let line = "";
    for (const word of str.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (line && glyphs.measure(next, o) > width) { out.push(line); line = word; } else line = next;
    }
    return [...out, line];
  };
  const MONO = { font: "mono", size: 13 };
  const ADV = glyphs.measure("0", MONO);

  // ── Timeline: four scenes on one set of keyframes, then the closing frame ──
  const D = 6.4;
  const OUTRO = 7.6;
  const outroAt = D * 4;
  const T = outroAt + OUTRO;
  const p = (t) => pct(t, T, 3);
  const css = [];
  const rule = (name, body, extra = "") => css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${T}s linear infinite${extra}}`);
  const delay = (i) => `animation-delay:${(i * D - T).toFixed(2)}s`;
  rule("sc", `0%{opacity:0}${p(0.35)},${p(D - 0.4)}{opacity:1}${p(D)},100%{opacity:0}`);
  rule("out", `0%,${p(outroAt)}{opacity:0}${p(outroAt + 0.35)},${p(T - 0.4)}{opacity:1}100%{opacity:0}`);
  rule("ln", `0%,${p(0.3)}{transform:scaleX(0)}${p(0.85)},100%{transform:scaleX(1)}`, ";transform-box:fill-box;transform-origin:left center");
  // an element that arrives t seconds into its scene (or, with `at`, into the loop)
  const seen = new Set();
  const arrive = (t, at = 0) => {
    const name = `${at ? "o" : "r"}${Math.round(t * 100)}`;
    if (!seen.has(name)) {
      seen.add(name);
      rule(name, `0%,${p(at + t)}{opacity:0;transform:translateY(5px)}${p(at + t + 0.3)},100%{opacity:1;transform:none}`);
    }
    return name;
  };

  // ── Layout ─────────────────────────────────────────────────────────────────
  const X = CARD.panel;
  const CAP = { x: X + 26, w: 226 };
  const WIN = { x: X + 276, y: 20, w: 492, h: 312, head: 34, pad: 18 };
  const inner = { x: WIN.x + WIN.pad, w: WIN.w - WIN.pad * 2 };
  const top = WIN.y + WIN.head;
  const LH = 18;
  const defs = [`<clipPath id="win"><rect x="${WIN.x + 2}" y="${top}" width="${WIN.w - 4}" height="${WIN.h - WIN.head - 2}"/></clipPath>`];

  // a line of text types itself: a cover the colour of the paper slides off it
  const TYPE_AT = (n) => 0.55 + n * 0.19;
  for (let n = 0; n < 13; n++) {
    rule(`c${n}`, `0%,${p(TYPE_AT(n))}{transform:translateX(0);animation-timing-function:steps(26,end)}${p(TYPE_AT(n) + 0.4)},100%{transform:translateX(${WIN.w}px)}`);
  }
  const cover = (n, i, y) => `<rect class="c${n}" style="${delay(i)}" x="${inner.x - 12}" y="${y - 13}" width="${WIN.w}" height="${LH}" fill="${P.paper}"/>`;

  // a sheet of paper with a coloured page behind it, as the mark stacks them
  const sheet = (page, kicker, right) =>
    `<rect x="${WIN.x + 8}" y="${WIN.y + 8}" width="${WIN.w}" height="${WIN.h}" rx="12" fill="${page}" stroke="${P.ink}" stroke-width="3"/>` +
    `<rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="12" fill="${P.paper}" stroke="${P.ink}" stroke-width="3"/>` +
    `<path d="M${WIN.x} ${top}h${WIN.w}" stroke="${P.ink}" stroke-width="3"/>` +
    text(kicker, { font: "mono", size: 11, x: inner.x, y: WIN.y + 22, fill: P.ink, tracking: 0.14 }) +
    text(right, { font: "mono", size: 12, x: inner.x + inner.w, y: WIN.y + 22, fill: SOFT, anchor: "end" });
  const chip = (label, x, y, fill = P.paper) => {
    const w = glyphs.measure(label, MONO) + 20;
    return { w, svg: `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="26" rx="7" fill="${fill}" stroke="${P.ink}" stroke-width="2"/>${text(label, { ...MONO, x: x + 10, y: y + 17.5, fill: P.ink })}` };
  };

  // ── 1 · the call ───────────────────────────────────────────────────────────
  const scene1 = () => {
    const out = [];
    const y0 = top + 26;
    product.example.forEach((line, n) => {
      const y = y0 + n * LH;
      let col = 0;
      for (const [tok] of line.matchAll(/\s+|"[^"]*"(?=\s*:)|"[^"]*"|./g)) {
        const key = tok[0] === '"' && line[col + tok.length] === ":";
        if (tok.trim()) out.push(text(tok, { ...MONO, x: inner.x + col * ADV, y, fill: tok[0] !== '"' ? SOFT : key ? P.ink : P.teal }));
        col += tok.length;
      }
      if (col * ADV > inner.w) fail(`the README example line "${line}" no longer fits the window`);
    });
    const typed = product.example.map((_, n) => cover(n, 0, y0 + n * LH)).join("");
    const after = TYPE_AT(product.example.length) + 0.3;
    const yb = y0 + product.example.length * LH + 2;
    const used = Object.keys(product.call.parameters);
    const chips = [];
    const schema = `<path d="M${inner.x} ${yb}h${inner.w}" stroke="${P.ink}" stroke-width="2"/>` +
      text(`INPUT SCHEMA · ${product.props.length} PROPERTIES`, { font: "mono", size: 11, x: inner.x, y: yb + 22, fill: P.ink, tracking: 0.14 });
    let cx = inner.x;
    let cy = yb + 34;
    product.props.forEach((prop, n) => {
      const probe = chip(prop.name, 0, 0).w;
      if (cx + probe > inner.x + inner.w) { cx = inner.x; cy += 34; }
      const c = chip(prop.name, cx, cy, used.includes(prop.name) ? P.blue : P.paper);
      chips.push(`<g class="${arrive(after + 0.2 + n * 0.1)}" style="${delay(0)}">${c.svg}</g>`);
      cx += c.w + 8;
    });
    if (cy + 26 > WIN.y + WIN.h - 8) fail("the property chips no longer fit the window");
    return sheet(P.orange, "TOOL CALL", product.tool) +
      `<g clip-path="url(#win)">${out.join("")}${typed}</g>` +
      `<g class="${arrive(after)}" style="${delay(0)}">${schema}</g>${chips.join("")}`;
  };

  // ── 2 · the sort ───────────────────────────────────────────────────────────
  const scene2 = () => {
    const tabs = [P.blue, P.orange, P.teal, P.red, P.ink];
    const rows = [...product.rules, { name: product.fallback, keywords: null }];
    const pitch = 50;
    const out = rows.map((r, n) => {
      const y = top + 14 + n * pitch;
      const line = r.keywords || "no keyword matched";
      if (glyphs.measure(line, MONO) > inner.w) fail(`the keywords of "${r.name}" no longer fit the window`);
      return `<g class="${arrive(0.5 + n * 0.42)}" style="${delay(1)}">` +
        `<rect x="${inner.x - 13}" y="${y}" width="7" height="38" rx="2" fill="${tabs[n]}" stroke="${P.ink}" stroke-width="1.5"/>` +
        text(r.name, { font: "display", size: 17, x: inner.x, y: y + 15, fill: P.ink }) +
        text(line, { ...MONO, x: inner.x, y: y + 34, fill: r.keywords ? SOFT : P.ink }) +
        "</g>";
    });
    return sheet(P.red, "CATEGORIES", "title + snippet, lower case") + out.join("");
  };

  // ── 3 · the answer ─────────────────────────────────────────────────────────
  const scene3 = () => {
    const second = product.rules[1].name;
    const lines = [
      product.heading(product.rules[0].name), ...product.article, "",
      product.separator.slice(0, Math.floor(inner.w / ADV)), // 80 in the source; the sheet shows what fits
      product.heading(second), ...product.article.slice(0, 2),
    ];
    const y0 = top + 24;
    const out = [];
    lines.forEach((line, n) => {
      const y = y0 + n * LH;
      let col = 0;
      const heading = line.endsWith("articles):");
      for (const tok of line.split(/(\{\w+\})/)) {
        if (tok.trim()) out.push(text(tok, { ...MONO, x: inner.x + col * ADV, y, fill: tok[0] === "{" ? P.teal : product.separator.startsWith(line) ? "#9a9a9a" : heading ? P.ink : SOFT }));
        col += tok.length;
      }
      if (heading) out.push(`<rect x="${inner.x - 10}" y="${y - 12}" width="4" height="16" fill="${line.startsWith(second) ? P.orange : P.blue}"/>`);
    });
    if (y0 + (lines.length - 1) * LH > WIN.y + WIN.h - 10) fail("the response template no longer fits the window");
    const typed = lines.map((l, n) => (l ? cover(n, 2, y0 + n * LH) : "")).join("");
    return sheet(P.teal, "RESPONSE TEXT", "content: type 'text'") + `<g clip-path="url(#win)">${out.join("")}${typed}</g>`;
  };

  // ── 4 · the reach ──────────────────────────────────────────────────────────
  const scene4 = () => {
    const out = [];
    ["gl", "hl"].forEach((name, n) => {
      const prop = product.props.find((q) => q.name === name);
      if (!prop?.default) fail(`the ${name} property no longer has a default`);
      const y = top + 16 + n * 38;
      const c = chip(name, inner.x, y, P.blue);
      out.push(`<g class="${arrive(0.5 + n * 0.3)}" style="${delay(3)}">${c.svg}` +
        text(prop.description, { font: "body", size: 15.5, x: inner.x + c.w + 12, y: y + 18, fill: P.ink }) +
        text(`default '${prop.default}'`, { ...MONO, x: inner.x + inner.w, y: y + 17.5, fill: SOFT, anchor: "end" }) + "</g>");
    });
    const yl = top + 104;
    out.push(`<g class="${arrive(1.2)}" style="${delay(3)}"><path d="M${inner.x} ${yl - 10}h${inner.w}" stroke="${P.ink}" stroke-width="2"/>` +
      text(`LANGUAGES SUPPORTED · ${product.languages.length}`, { font: "mono", size: 11, x: inner.x, y: yl + 12, fill: P.ink, tracking: 0.14 }) +
      text("manifest.json", { font: "mono", size: 12, x: inner.x + inner.w, y: yl + 12, fill: SOFT, anchor: "end" }) + "</g>");
    const gap = 6;
    const tw = (inner.w - gap * 9) / 10;
    const ty = yl + 26;
    // one tile is lit at a time, in the order the manifest lists them
    rule("lit", `0%,${p(2.0)}{transform:translateX(0);animation-timing-function:steps(9,end)}${p(4.9)},${p(5.5)}{transform:translateX(${((tw + gap) * 9).toFixed(1)}px);animation-timing-function:step-end}${p(5.6)},100%{transform:translateX(0)}`);
    out.push(`<g class="${arrive(1.4)}" style="${delay(3)}"><rect class="lit" style="${delay(3)}" x="${inner.x}" y="${ty}" width="${tw.toFixed(1)}" height="38" rx="7" fill="${P.blue}"/>` +
      product.languages.map((code, n) => {
        const x = inner.x + n * (tw + gap);
        return `<rect x="${x.toFixed(1)}" y="${ty}" width="${tw.toFixed(1)}" height="38" rx="7" fill="none" stroke="${P.ink}" stroke-width="2"/>` +
          text(code, { font: "mono", size: 15, x: x + tw / 2, y: ty + 24, fill: P.ink, anchor: "middle" });
      }).join("") + "</g>");
    out.push(`<g class="${arrive(1.8)}" style="${delay(3)}">` +
      text(`regions_supported: "${product.regions}"`, { ...MONO, x: inner.x, y: ty + 68, fill: SOFT }) +
      `<rect x="${inner.x}" y="${ty + 84}" width="8" height="24" rx="2" fill="${P.orange}" stroke="${P.ink}" stroke-width="1.5"/>` +
      text(`${product.fallbackLine}.`, { font: "body", size: 15.5, x: inner.x + 20, y: ty + 102, fill: P.ink }) + "</g>");
    return sheet(P.orange, "LANGUAGE AND COUNTRY", product.tool) + out.join("");
  };

  const windows = [scene1(), scene2(), scene3(), scene4()];
  const total = windows.length + 1;
  const counter = (n) => text(`0${n} / 0${total}`, { font: "mono", size: 11, x: CAP.x, y: 44, fill: P.ink, tracking: 0.14 });
  const scenes = windows.map((win, i) => {
    const c = product.captions[i];
    const cap = [counter(i + 1), `<rect class="ln" style="${delay(i)}" x="${CAP.x}" y="88" width="40" height="5" fill="${P.ink}"/>`];
    c.title.forEach((l, n) => {
      if (glyphs.measure(l, { font: "display", size: 30 }) > CAP.w) fail(`the caption "${l}" no longer fits its column`);
      cap.push(text(l, { font: "display", size: 30, x: CAP.x, y: 134 + n * 34, fill: P.ink }));
    });
    wrap(c.sub, { font: "body", size: 15.5 }, CAP.w).forEach((l, n) => cap.push(text(l, { font: "body", size: 15.5, x: CAP.x, y: 134 + c.title.length * 34 - 4 + n * 20.5, fill: P.ink })));
    return `<g class="sc" style="${delay(i)}" opacity="0">${cap.join("")}${win}</g>`;
  });

  // ── The closing frame: what stands behind it ───────────────────────────────
  const S = { x: X + 24, y: 20, w: 744, h: 312, pad: 24 };
  const sx = S.x + S.pad;
  const colW = (S.w - S.pad * 2) / 3;
  const BEHIND = [
    [`${record.days} DAYS`, "AFTER MCP LAUNCHED", `First commit ${record.firstCommit}. MCP launched ${record.launch}.`, P.blue],
    [record.listings, "MCP DIRECTORIES LIST IT", `Among them Smithery, Glama and PulseMCP${product.topPick ? " (Top Pick)" : ""}.`, P.orange],
    [record.stars, "GITHUB STARS", `Measured ${record.measured}, with ${record.forks} forks.`, P.red],
  ];
  const outro = [
    `<rect x="${S.x + 8}" y="${S.y + 8}" width="${S.w}" height="${S.h}" rx="12" fill="${P.red}" stroke="${P.ink}" stroke-width="3"/>`,
    `<rect x="${S.x}" y="${S.y}" width="${S.w}" height="${S.h}" rx="12" fill="${P.paper}" stroke="${P.ink}" stroke-width="3"/>`,
    text("WHAT STANDS BEHIND IT", { font: "mono", size: 11, x: sx, y: S.y + 30, fill: P.ink, tracking: 0.14 }),
    text(`0${total} / 0${total}`, { font: "mono", size: 11, x: S.x + S.w - S.pad, y: S.y + 30, fill: SOFT, anchor: "end", tracking: 0.14 }),
    text(`Written and maintained by Chan Meng. Open source, ${product.license}.`, { font: "display", size: 21, x: sx, y: S.y + 62, fill: P.ink }),
    `<path d="M${sx} ${S.y + 78}h${S.w - S.pad * 2}" stroke="${P.ink}" stroke-width="3"/>`,
  ];
  BEHIND.forEach(([value, label, body, bar], n) => {
    const x = sx + n * colW;
    const lines = wrap(body, { font: "body", size: 15 }, colW - 26);
    if (lines.length > 2) fail(`the closing line "${body}" no longer fits two lines`);
    outro.push(
      `<g class="${arrive(0.5 + n * 0.3, outroAt)}">` +
        `<rect x="${x}" y="${S.y + 96}" width="40" height="7" fill="${bar}" stroke="${P.ink}" stroke-width="1.5"/>` +
        text(value, { font: "display", size: 50, x: x - 2, y: S.y + 156, fill: P.ink }) +
        text(label, { font: "mono", size: 11, x, y: S.y + 180, fill: P.ink, tracking: 0.12 }) +
        lines.map((l, k) => text(l, { font: "body", size: 15, x, y: S.y + 204 + k * 19, fill: SOFT })).join("") +
        "</g>",
    );
    if (n) outro.push(`<path d="M${x - 14} ${S.y + 94}v${150}" stroke="${P.ink}" stroke-width="1.5"/>`);
  });
  const cmd = `$ ${product.install}`;
  if (glyphs.measure(cmd, MONO) > S.w - S.pad * 2 - 28) fail("the install command no longer fits the closing frame");
  outro.push(
    `<g class="${arrive(1.5, outroAt)}"><rect x="${sx}" y="${S.y + 258}" width="${S.w - S.pad * 2}" height="36" rx="8" fill="${P.ink}"/>` +
      text("$", { ...MONO, x: sx + 14, y: S.y + 281, fill: P.blue }) +
      text(product.install, { ...MONO, x: sx + 14 + ADV * 2, y: S.y + 281, fill: P.paper }) + "</g>",
  );

  // ── Identity, on the logo's own white paper ────────────────────────────────
  const headline = ["Lets AI assistants like Claude", "search live Google News."];
  const identity = [
    `<rect width="${X}" height="${CARD.h}" fill="${P.paper}"/>`,
    text(`OPEN SOURCE · ${product.license} · MODEL CONTEXT PROTOCOL SERVER`, { font: "mono", size: 11, x: 40, y: 44, fill: SOFT, tracking: 0.12 }),
    // the mark, then its lettering beside it instead of under it
    `<svg x="40" y="64" width="99" height="92" viewBox="0 0 474 440">${logo.mark}</svg>`,
    `<svg x="160" y="77" width="262" height="66.4" viewBox="36 469 434 110">${logo.lettering}</svg>`,
    `<rect x="40" y="176" width="420" height="4" fill="${P.ink}"/>`,
    ...headline.map((l, n) => text(l, { font: "display", size: 24, x: 40, y: 216 + n * 29, fill: P.ink })),
    text(`Sorted into topics, in ${product.languages.length} languages.`, { font: "body", size: 16.5, x: 40, y: 275, fill: SOFT }),
  ];
  const pill = glyphs.measure(product.npm, MONO) + 28;
  identity.push(
    `<rect x="41" y="297" width="${pill.toFixed(1)}" height="32" rx="8" fill="${P.paper}" stroke="${P.ink}" stroke-width="2"/>`,
    text(product.npm, { ...MONO, x: 55, y: 317.5, fill: P.ink }),
  );

  const body =
    `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${P.blue}"/>` +
    scenes.join("") +
    // the closing frame is the still frame
    `<g class="out">${outro.join("")}</g>` +
    identity.join("") +
    `<rect x="${X - 1.5}" width="3" height="${CARD.h}" fill="${P.ink}"/>`;

  // Every character on the card is a <use> that repeats its glyph's id, so the
  // ids are shortened here, the most used first ("t", "win" and "card" are taken).
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
        `Google News MCP Server, an open-source (${product.license}) Model Context Protocol server written and maintained by Chan Meng. ` +
        `It gives AI assistants such as Claude one tool, ${product.tool}, that searches live Google News and returns the results sorted into topics ` +
        `(${[...product.rules.map((r) => r.name), product.fallback].join(", ")}), with language and country codes and ${product.languages.length} languages listed. ` +
        `First commit ${record.firstCommit}, ${record.days} days after the Model Context Protocol was published on ${record.launch}; ` +
        `listed in ${record.listings} MCP directories; ${record.stars} GitHub stars, measured ${record.measured}.`,
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body,
      radius: 14,
    })),
    facts: {
      tool: product.tool, properties: product.props.length, categories: product.rules.length + 1,
      languages: product.languages.length, loop: `${T.toFixed(1)}s`,
    },
  };
}
