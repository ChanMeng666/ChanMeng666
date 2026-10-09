// a11y-loop card. a11y-loop is Chan's own open-source tool: an Agent Skill plus
// a CLI that make a coding agent write accessible UI, audit what rendered in a
// real browser, and say what the audit could not judge. The stage follows one
// turn of that loop on the product's own demo page as four mock components
// (write, audit, fix, re-audit) and rests on the clean run with its list of
// manual checks beside it. The panel's step row is lit in time with the stage.
//
// It is drawn in the product's own design system (a11y-loop: website/
// .vitepress/theme/custom.css): the cool-neutral canvas, hairline borders as
// structure, one cobalt accent, a pill for the lit step, Inter Tight at weight
// 400/500 for display, Inter for prose and JetBrains Mono for what the tool
// printed. The editor and terminal are the site's own dark surface. The two
// signal colours (fail, pass) are the promo film's tokens, since the site
// defines none. The audited page inside the browser is the demo's own
// stylesheet, low contrast included: it is the subject, not the card's type.
//
// What is shown, and where it comes from:
//   - write: lines cut from demo/after/index.html, typed beside the bold rule
//     titles of SKILL.md §1;
//   - audit: demo/before redrawn in vectors from its own markup and stylesheet,
//     restyled for each pass the CLI's provenance line lists; the count is the
//     captured run's VIOLATIONS header and its exit code (a11y-loop-promo-video,
//     src/data/cli-*.json, "verbatim, untrimmed");
//   - fix: the finding as the CLI printed it, and the source lines cut from
//     demo/before and demo/after;
//   - re-audit: the captured diff verdict, the clean run's headers, and the
//     first manual checks in the order the CLI listed them. A line too long for
//     its row ends in an ellipsis; nothing is reworded.
// The build fails when any of those patterns stops matching, and when any
// colour pair the card itself sets falls under WCAG AA as measured by the
// product's own contrast-math.js.
//
// Claim rules that bind this card (the product's §3 and the guard comment above
// the shard entry): a clean run is never called accessible, compliant or
// conformant, so the zero always sits beside the needs-review count and the
// manual checks; the benchmark is not shown, since it cannot appear without
// its n and its limits; no organisation is named as a user of the tool. The
// demo page's ticket price is not drawn.
//
// The product checkout and the film's captures are NOT in this repo
// (A11Y_LOOP_INPUTS); where either is absent the card is not rebuilt and the
// committed SVG stands.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { CARD, card, pct } from "../lib/svg-card/shell.mjs";

export const A11Y_LOOP_FONTS = {
  display: "scripts/cards/fonts/a11y-loop/InterTight-500.ttf",
  displayReg: "scripts/cards/fonts/a11y-loop/InterTight-400.ttf",
  sans: "scripts/cards/fonts/gavigo/Inter-400.ttf",
  sansMid: "scripts/cards/fonts/gavigo/Inter-500.ttf",
  mono: "cv/fonts/JetBrainsMono-Regular.ttf",
  monoMid: "scripts/cards/fonts/a11y-loop/JetBrainsMono-500.ttf",
};

// Read at build time from the sibling checkouts; never copied into this repo.
export const A11Y_LOOP_INPUTS = {
  skill: "../a11y-loop/skill/a11y-loop/SKILL.md",
  readme: "../a11y-loop/README.md",
  before: "../a11y-loop/demo/before/index.html",
  beforeCss: "../a11y-loop/demo/before/style.css",
  after: "../a11y-loop/demo/after/index.html",
  afterCss: "../a11y-loop/demo/after/style.css",
  contrast: "../a11y-loop/src/lib/contrast-math.js",
  culori: "../a11y-loop/node_modules/culori/package.json",
  auditBefore: "../a11y-loop-promo-video/src/data/cli-audit-before.json",
  auditAfter: "../a11y-loop-promo-video/src/data/cli-audit-after.json",
  diff: "../a11y-loop-promo-video/src/data/cli-diff.json",
};

// The site's tokens (custom.css, :root and .dark).
const SITE = { canvas: "#f7f8fa", elv: "#ffffff", border: "#c9ced9", divider: "#e3e6ec", text1: "#10141c", text2: "#4b5565", brand: "#1d4ed8", code: "#f7f7f9" };
const DARK = { bg: "#0b0d12", border: "#333a4d", text1: "#eef1f6", text2: "#a6afbe", brand: "#7da2ff" };
// The film's signal tokens (its constants.ts).
const SIGNAL = { fail: "#A8202A", pass: "#0C6B42", failOnInk: "#FF9A90", passOnInk: "#6FD79B" };

// demo/before/style.css as each pass renders it. Light and dark are the
// stylesheet's own values; forced colours are the system pairs the browser
// substitutes (Canvas, CanvasText, LinkText), which also drop the gradient.
const MINT = "#5fbfb2";
const PAGE = {
  light: { page: "#ffffff", hair: "#ededed", surface: "#fafbfb", nav: "#8fa0ab", icon: "#b7c1c7", hero: "url(#hg)", heroInk: "#ffffff", cta: MINT, ghost: "rgba(255,255,255,.28)", ghostInk: "#ffffff", faint: "#b0b0b0", heading: "#4c5a63", th: "#adb7bd", td: "#999999", rowHair: "#f6f7f7" },
  dark: { page: "#1a1a1a", hair: "#2a2a2a", surface: "#202020", nav: "#8fa0ab", icon: "#b7c1c7", hero: "url(#hg)", heroInk: "#ffffff", cta: MINT, ghost: "rgba(255,255,255,.28)", ghostInk: "#ffffff", faint: "#444444", heading: "#585858", th: "#4e4e4e", td: "#5a5a5a", rowHair: "#242424" },
  forced: { page: "#000000", hair: "#ffffff", surface: "#000000", nav: "#ffff00", icon: "#ffffff", hero: "#000000", heroInk: "#ffffff", cta: "#000000", ghost: "#000000", ghostInk: "#ffff00", faint: "#ffffff", heading: "#ffffff", th: "#ffffff", td: "#ffffff", rowHair: "#ffffff" },
};
// demo/after/style.css: the fixed menu button and its focus ring.
const FIXED = { ink: "#1f2a33", border: "#5d6d78", focus: "#0a5cc7" };

const STEPS = ["write", "audit", "fix", "re-audit"]; // the README's "write → audit → fix → re-audit cycle"
// Each typed line of the write scene, and the §1 rule it answers.
const WRITTEN = [
  [/^<html lang="[^"]+">$/, "Structure."],
  [/^<button type="button" class="btn btn-primary" id="registerTrigger">$/, "Semantic HTML first."],
  [/^<label for="reg-name">Full name /, "Names and labels."],
];
// The rows of the schedule and the supporters the mock page draws, as
// demo/before lists them (the ones the card's Inter subset can set).
const SESSIONS = [
  ["08:30", "Registration & coffee", "—", "Foyer"],
  ["09:45", "The web we keep rebuilding", "Aroha Kingi", "Soundings"],
  ["11:30", "Edge rendering without the edge cases", "Marika Sørensen", "Soundings"],
];
const SUPPORTERS = ["Mahi Labs", "Southerly Systems", "Pipiwharauroa Design", "Fernbird Hosting"];

const must = (value, what) => {
  if (value === null || value === undefined || value === false) throw new Error(`a11y-loop card: ${what}`);
  return value;
};

// `fg` at opacity `a` over `bg`, as the solid colour it paints.
const blend = (fg, bg, a) => {
  const ch = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2].map((i) => Math.round(ch(fg, i) * a + ch(bg, i) * (1 - a)).toString(16).padStart(2, "0")).join("")}`;
};

// Every colour pair the card sets, measured by the product's own contrast math.
function measure(root, pairs) {
  const mod = pathToFileURL(path.resolve(root, A11Y_LOOP_INPUTS.contrast)).href;
  const script =
    `import { checkContrast } from ${JSON.stringify(mod)};` +
    `const out = ${JSON.stringify(pairs)}.map(([fg, bg, kind]) => { const r = checkContrast(fg, bg, { ui: kind === "ui" }); return [fg, bg, kind, r.ratioDisplay, r.passes.AA]; });` +
    "console.log(JSON.stringify(out));";
  const out = JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-"], { input: script, encoding: "utf8" }));
  const bad = out.filter((r) => !r[4]);
  if (bad.length) throw new Error(`a11y-loop card: colour pairs under WCAG AA: ${bad.map((r) => `${r[0]} on ${r[1]} = ${r[3]}:1`).join("; ")}`);
  return out;
}

export function buildA11yLoopCard({ glyphs, root }) {
  const read = (key) => readFileSync(`${root}/${A11Y_LOOP_INPUTS[key]}`, "utf8");
  const capture = (key) => JSON.parse(read(key));

  const TINT = { fail: blend(SIGNAL.fail, SITE.code, 0.08), pass: blend(SIGNAL.pass, SITE.code, 0.08) };
  const contrast = measure(root, [
    [SITE.text1, SITE.elv, "text"],
    [SITE.text2, SITE.elv, "text"],
    [SITE.brand, SITE.elv, "text"],
    [SITE.elv, SITE.brand, "text"],
    [SIGNAL.fail, SITE.elv, "text"],
    [SIGNAL.pass, SITE.elv, "text"],
    [SITE.text2, SITE.code, "text"],
    [SIGNAL.fail, TINT.fail, "text"],
    [SIGNAL.pass, TINT.pass, "text"],
    [SITE.text2, TINT.fail, "text"],
    [SITE.text2, TINT.pass, "text"],
    [DARK.text1, DARK.bg, "text"],
    [DARK.text2, DARK.bg, "text"],
    [DARK.brand, DARK.bg, "text"],
    [SIGNAL.passOnInk, DARK.bg, "text"],
    [SITE.elv, SIGNAL.fail, "text"],
    [SITE.elv, SIGNAL.pass, "ui"],
    [SITE.brand, SITE.elv, "ui"],
    [FIXED.ink, SITE.elv, "text"],
    [FIXED.border, SITE.elv, "ui"],
    [FIXED.focus, SITE.elv, "ui"],
  ]);

  // ── SKILL.md §1: the rule titles ───────────────────────────────────────────
  const skill = read("skill");
  const s1 = must(skill.split("## §1 Generation rules")[1], "SKILL.md has no §1 Generation rules").split("## §2")[0];
  const rules = [...s1.matchAll(/^\*\*([^*\n]+\.)\*\*/gm)].map((m) => m[1]);
  if (rules.length !== 10) throw new Error(`a11y-loop card: expected the 10 rule titles of SKILL.md §1, found ${rules.length}`);

  // ── The demo's two source files ────────────────────────────────────────────
  const src = (key, re) => {
    const lines = read(key).split("\n");
    const i = lines.findIndex((l) => re.test(l.trim()));
    if (i < 0) throw new Error(`a11y-loop card: demo/${key} has no line matching ${re}`);
    return { n: i + 1, text: lines[i].trim(), lines };
  };
  const written = WRITTEN.map(([re, title]) => {
    must(rules.includes(title), `SKILL.md §1 has no rule titled "${title}"`);
    return { ...src("after", re), rule: rules.indexOf(title) };
  });
  const wasButton = src("before", /^<button class="icon-btn hamburger" onclick="toggleNav\(\)">$/);
  const nowButton = src("after", /^<button type="button" class="nav-toggle" id="navToggle" aria-expanded="false"/);
  const nameAt = nowButton.lines.findIndex((l, i) => i >= nowButton.n && l.trim() === "Menu");
  must(nameAt > 0 && nameAt < nowButton.n + 6, "the fixed button no longer carries its visible name");

  // the mock page draws these strings and colours of demo/before
  const beforeHtml = wasButton.lines.join("\n");
  const beforeCss = read("beforeCss");
  const NAV = ["Programme", "Speakers", "Venue", "Sponsors"];
  const KICKER = "12–13 November 2026 · Te Papa, Wellington";
  for (const s of ['<span class="logo-word">AWS26</span>', ...NAV.map((n) => `">${n}</a></li>`), `<p class="kicker">${KICKER}</p>`, "<h1>Aotearoa Web&nbsp;Summit 2026</h1>", ">See the programme</a>", '<h3 class="section-title">Programme</h3>', ...SUPPORTERS.map((n) => `<span>${n}</span>`), ...SESSIONS.flat().map((c) => `<td>${c.replace("&", "&amp;")}</td>`)]) {
    must(beforeHtml.includes(s), `demo/before/index.html no longer contains ${s}`);
  }
  for (const th of ["Time", "Session", "Speaker", "Room"]) must(beforeHtml.includes(`<th scope="col">${th}</th>`), `demo/before has no ${th} column`);
  for (const hex of [...Object.values(PAGE.light), ...Object.values(PAGE.dark), "#7ed0c4", "#a9e4da"]) {
    if (hex.startsWith("#")) must(beforeCss.toLowerCase().includes(hex) || hex === "#ffffff", `demo/before/style.css no longer uses ${hex}`);
  }
  must(/rgba\(255, 255, 255, 0\.28\)/.test(beforeCss), "demo/before/style.css changed its ghost button");
  const afterCss = read("afterCss");
  for (const [name, hex] of [["ink", FIXED.ink], ["border", FIXED.border], ["focus", FIXED.focus]]) must(new RegExp(`--${name}: ${hex};`).test(afterCss), `demo/after/style.css no longer sets --${name} to ${hex}`);

  // ── The captured runs ──────────────────────────────────────────────────────
  const runBefore = capture("auditBefore");
  const runAfter = capture("auditAfter");
  const runDiff = capture("diff");
  const linesOf = (run) => run.stdout.replace(/\s+$/, "").split("\n");
  const find = (lines, re, what) => {
    const i = lines.findIndex((l) => re.test(l));
    if (i < 0) throw new Error(`a11y-loop card: the captured output has no line matching ${re} (${what})`);
    return i;
  };
  const b = linesOf(runBefore);
  const violations = Number(must(b[find(b, /^VIOLATIONS \(\d+\)$/, "violations header")].match(/\d+/), "violation count")[0]);
  const bn = find(b, /axe: button-name$/, "the button-name finding");
  must(/^\s+· html > body > header/.test(b[bn + 1]), "the button-name finding is no longer the header's menu button");
  const finding = [b[bn].trim(), b[bn + 1].trim().replace(/^· /, "")];
  must(runBefore.exitCode === 1 && runAfter.exitCode === 0 && runDiff.exitCode === 0, "the captured runs no longer exit 1, 0 and 0");
  const seeded = Number(must(read("readme").match(/seeded with\s+\*\*(\d+) detectable failures\*\*/), "README no longer states the demo's seeded failures")[1]);
  if (seeded !== violations) throw new Error("a11y-loop card: the README and the captured audit disagree on the demo's failures");

  const d = linesOf(runDiff);
  const verdict = d[find(d, /^Converged: all \d+ violations fixed, none introduced$/, "diff verdict")];
  if (Number(verdict.match(/\d+/)[0]) !== violations) throw new Error("a11y-loop card: the diff verdict and the audit disagree on the violation count");
  const fixedRow = must(d[find(d, /^FIXED\s+SC 4\.1\.2\s+button-name\s/, "button-name fixed")].match(/^(FIXED)\s+(SC 4\.1\.2)\s+(button-name)\s/), "button-name row");
  // the pins of the audit scene stand on elements the diff lists as fixed
  for (const re of [/^FIXED\s+SC 1\.4\.3\s+color-contrast\s+html > body > header.* > span:nth-child\(2\)$/, /^FIXED\s+SC 1\.4\.3\s+color-contrast\s+html > body > header.*li:nth-child\(2\) > a$/, /^FIXED\s+SC 2\.2\.2\s+reduced-motion-ignored\s+.*div\.ticker-track$/, /^FIXED\s+SC 1\.4\.10\s+reflow-horizontal-scroll\s/]) find(d, re, "a pinned finding");

  const a = linesOf(runAfter);
  const manualAt = find(a, /^MANUAL CHECKS \(\d+\) — automation cannot judge these$/, "manual checks header");
  const manual = [];
  for (let i = manualAt + 1; a[i] && /^\s{2,}/.test(a[i]); i++) if (/^  · /.test(a[i])) manual.push(a[i].replace(/^  · /, ""));
  const manualCount = Number(a[manualAt].match(/\d+/)[0]);
  if (manual.length !== manualCount) throw new Error(`a11y-loop card: MANUAL CHECKS says ${manualCount}, the run lists ${manual.length}`);
  const review = Number(a[find(a, /^NEEDS REVIEW \(\d+\)/, "needs-review header")].match(/\d+/)[0]);
  must(a.some((l) => new RegExp(`^The ${review} needs-review finding\\(s\\) are not passes`).test(l)), "the clean run no longer says its needs-review findings are not passes");
  const clean = a[find(a, /^No automatically detectable failures across \d+ rendering passes\.$/, "clean verdict")];
  find(a, /This is not an audit or conformance claim\.$/, "coverage statement");
  const passes = must(a[find(a, /^Provenance:/, "provenance")].match(/passes: ([a-z0-9, -]+?) ·/), "provenance lists no passes")[1].split(", ");
  if (passes.join() !== "default,dark,forced-colors,reduced-motion,reflow" || Number(clean.match(/\d+/)[0]) !== 5) throw new Error("a11y-loop card: the audit no longer runs the five passes the stage draws");

  // ── Timeline ───────────────────────────────────────────────────────────────
  const AT = { write: 0, audit: 6, fix: 12.6, report: 18.6 };
  const T = 27.4;
  const ENDS = [AT.audit, AT.fix, AT.report, T];
  const p = (t) => pct(t, T, 3);
  const css = [];
  const made = new Set();
  const rule = (name, frames, extra = "") => {
    if (!made.has(name)) css.push(`@keyframes ${name}{${frames}}.${name}{animation:${name} ${T}s linear infinite${extra}}`);
    made.add(name);
  };
  // shown from `t` on
  const on = (name, t, fade = 0.25) => {
    rule(name, `0%,${p(t)}{opacity:0}${p(t + fade)},100%{opacity:1}`);
    return `class="${name}"`;
  };
  // shown only between `s` and `e`; absent from the still frame
  const span = (name, s, e, fade = 0.3) => {
    rule(name, s <= 0 ? `0%,${p(e - fade)}{opacity:1}${p(e)},100%{opacity:0}` : `0%,${p(s)}{opacity:0}${p(s + fade)},${p(e - fade)}{opacity:1}${p(e)},100%{opacity:0}`);
    return `class="${name}" opacity="0"`;
  };
  // shown from `t` until the loop ends; present in the still frame
  const last = (name, t, fade = 0.3) => {
    rule(name, `0%,${p(t)}{opacity:0}${p(t + fade)},${p(T - fade)}{opacity:1}100%{opacity:0}`);
    return `class="${name}"`;
  };
  // pops in at `t`
  const pop = (name, t) => {
    rule(name, `0%,${p(t)}{opacity:0;transform:scale(.3)}${p(t + 0.22)},100%{opacity:1;transform:none}`, ";transform-box:fill-box;transform-origin:center");
    return `class="${name}"`;
  };
  // A run that types itself: a cover in the ground's colour steps off it. The
  // cover rests clear of the text, so the still frame shows the finished line.
  const typed = (id, inner, { x, y, w, size, bg, t, dur, n }) => {
    const dx = (w + 6).toFixed(1);
    rule(id, `0%,${p(t)}{transform:translateX(0);animation-timing-function:steps(${n},end)}${p(t + dur)},100%{transform:translateX(${dx}px)}`);
    return (
      `<clipPath id="${id}k"><rect x="${(x - 1).toFixed(1)}" y="${(y - size * 1.05).toFixed(1)}" width="${dx}" height="${(size * 1.55).toFixed(1)}"/></clipPath>` +
      `<g clip-path="url(#${id}k)">${inner}<rect class="${id}" transform="translate(${dx} 0)" x="${(x - 1).toFixed(1)}" y="${(y - size * 1.05).toFixed(1)}" width="${dx}" height="${(size * 1.55).toFixed(1)}" fill="${bg}"/></g>`
    );
  };
  // A number that steps through `values` between `s` and `e` and rests on the last.
  const counter = (id, values, s, e, draw) =>
    values
      .map((v, i) => {
        const at = s + ((e - s) * i) / (values.length - 1);
        const next = s + ((e - s) * (i + 1)) / (values.length - 1);
        if (i === values.length - 1) return `<g ${on(`${id}${i}`, at, 0.01)}>${draw(v, true)}</g>`;
        rule(`${id}${i}`, i === 0 ? `0%,${p(next)}{opacity:1}${p(next + 0.01)},100%{opacity:0}` : `0%,${p(at)}{opacity:0}${p(at + 0.01)},${p(next)}{opacity:1}${p(next + 0.01)},100%{opacity:0}`);
        return `<g class="${id}${i}" opacity="0">${draw(v, false)}</g>`;
      })
      .join("");

  const X = CARD.panel;
  const L = X + 24; // the stage's left edge
  const W = CARD.w - X - 48; // and its measure
  const TOP = 24;
  const BOT = CARD.h - 24;
  const t = (text, style) => glyphs.text(text, style);
  const fits = (text, style, max) => {
    const w = glyphs.measure(text, style);
    if (w > max) throw new Error(`a11y-loop card: "${text}" is ${w.toFixed(0)}px wide, the measure is ${max}`);
    return w;
  };
  // a line too long for its row ends in an ellipsis
  const cut = (text, style, max) => {
    if (glyphs.measure(text, style) <= max) return text;
    let s = text;
    while (s && glyphs.measure(`${s.trimEnd()}…`, style) > max) s = s.slice(0, s.lastIndexOf(" "));
    return `${s.trimEnd().replace(/[,:;(]$/, "")}…`;
  };
  const sheet = (x, y, w, h, { fill = SITE.elv, stroke = SITE.border, rx = 12 } = {}) => `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
  const tick = (cx, cy, r, fill) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/><path d="M${cx - r * 0.42} ${cy + r * 0.04}l${r * 0.3} ${r * 0.32} ${r * 0.56}-${r * 0.66}" fill="none" stroke="${SITE.elv}" stroke-width="${(r * 0.24).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const pin = (cx, cy, r = 7) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${SIGNAL.fail}" stroke="${SITE.elv}" stroke-width="1.5"/>` +
    `<rect x="${cx - 0.9}" y="${cy - r * 0.55}" width="1.8" height="${(r * 0.62).toFixed(2)}" rx=".9" fill="${SITE.elv}"/><circle cx="${cx}" cy="${(cy + r * 0.45).toFixed(2)}" r="1.1" fill="${SITE.elv}"/>`;
  const burger = (x, y, s, stroke, sw) => `<path d="M${x} ${y + s * 0.22}h${s}M${x} ${y + s * 0.5}h${s}M${x} ${y + s * 0.78}h${s}" stroke="${stroke}" stroke-width="${sw}" fill="none"/>`;
  const MONO_W = glyphs.measure("0", { font: "mono", size: 1 });
  // one line of markup: attribute values in the accent, the rest in ink
  const code = (text, { x, y, size, ink, accent }) =>
    text
      .split(/("[^"]*")/)
      .reduce(
        (acc, part) => {
          if (part) acc.out.push(t(part, { font: "mono", size, x: x + acc.at * MONO_W * size, y, fill: part.startsWith('"') ? accent : ink }));
          acc.at += part.length;
          return acc;
        },
        { out: [], at: 0 },
      )
      .out.join("");

  // ── Identity: the site's own hero, and the loop ────────────────────────────
  const mark = must(readFileSync(`${root}/public/brands/a11y-loop-mark.svg`, "utf8").match(/<svg x="17"[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/), "could not find the mark inside public/brands/a11y-loop-mark.svg");
  const HERO = { font: "displayReg", size: 31, tracking: -0.02 };
  fits("Write accessible UI by default.", HERO, X - 76);
  const identity = [
    `<rect width="${X}" height="${CARD.h}" fill="${SITE.elv}"/>`,
    t("AGENT SKILL + CLI", { font: "monoMid", size: 12.5, x: 40, y: 54, fill: SITE.text2, tracking: 0.14 }),
    `<svg x="30" y="82" width="76" height="76" viewBox="${mark[1]}">${mark[2].replace(/<title>[^<]*<\/title>/, "")}</svg>`,
    t("a11y-loop", { font: "display", size: 56, x: 114, y: 140, fill: SITE.brand, tracking: -0.02 }),
    // the site's hero text
    t("Write accessible UI by default.", { ...HERO, x: 40, y: 214, fill: SITE.text1 }),
  ];
  // the loop's steps; the lit one follows the stage
  let sx = 40;
  STEPS.forEach((step, i) => {
    const style = { font: "monoMid", size: 15.5 };
    const w = glyphs.measure(step, style) + 32;
    const label = (fill) => t(step, { ...style, x: sx + w / 2, y: 312.5, fill, anchor: "middle" });
    const pill = (fill, stroke) => `<rect x="${sx.toFixed(1)}" y="290.5" width="${w.toFixed(1)}" height="34" rx="17" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`;
    identity.push(`${pill(SITE.elv, SITE.border)}${label(SITE.text1)}`);
    // the last step is lit in the still frame, with the scene it names
    identity.push(`<g ${i === STEPS.length - 1 ? last(`st${i}`, ENDS[i - 1], 0.25) : span(`st${i}`, i ? ENDS[i - 1] : 0, ENDS[i], 0.25)}>${pill(SITE.brand, SITE.brand)}${label(SITE.elv)}</g>`);
    sx += w;
    if (i < STEPS.length - 1) {
      identity.push(`<path d="M${(sx + 7).toFixed(1)} 307.5h14m-5-4.5 5 4.5-5 4.5" fill="none" stroke="${SITE.text2}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`);
      sx += 28;
    }
  });
  if (sx > X - 30) throw new Error("a11y-loop card: the loop's steps do not fit the panel");

  const defs = [`<linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7ed0c4"/><stop offset="1" stop-color="#a9e4da"/></linearGradient>`];

  // ── 01 Write: the agent's editor, and the rule each line answers ───────────
  const ED = { y: TOP, h: 160, size: 14, lh: 21 };
  const edX = L + 62;
  const write = [
    `<rect x="${L}" y="${ED.y}" width="${W}" height="${ED.h}" rx="10" fill="${DARK.bg}"/>`,
    t("demo/after/index.html", { font: "mono", size: 12, x: L + 18, y: ED.y + 24, fill: DARK.text2 }),
    `<path d="M${L} ${ED.y + 37.5}h${W}" stroke="${DARK.border}"/>`,
  ];
  const writeAt = (i) => 0.6 + i * 1.7;
  const TYPE = 1.05;
  written.forEach((line, i) => {
    const y = ED.y + 64 + i * ED.lh * 2;
    const w = fits(line.text, { font: "mono", size: ED.size }, W - 62 - 18);
    write.push(
      t(String(line.n), { font: "mono", size: ED.size, x: edX - 16, y, fill: DARK.text2, anchor: "end" }),
      typed(`w${i}`, code(line.text, { x: edX, y, size: ED.size, ink: DARK.text1, accent: DARK.brand }), { x: edX, y, w, size: ED.size, bg: DARK.bg, t: writeAt(i), dur: TYPE, n: line.text.length }),
      `<rect ${on(`wb${i}`, writeAt(i) + TYPE, 0.2)} x="${L + 6}" y="${y - 15}" width="3" height="21" rx="1.5" fill="${DARK.brand}"/>`,
    );
    // the lines between are folded away
    if (i < written.length - 1) write.push([0, 6, 12].map((dx) => `<circle cx="${edX - 34 + dx}" cy="${y + ED.lh - 4}" r="1.3" fill="${DARK.text2}"/>`).join(""));
  });
  const RU = { y: ED.y + ED.h + 12, h: BOT - ED.y - ED.h - 12 };
  const CHIP = { font: "sansMid", size: 12.5 };
  write.push(
    sheet(L, RU.y, W, RU.h),
    t("§1 Generation rules", { font: "display", size: 16, x: L + 18, y: RU.y + 27, fill: SITE.text1, tracking: -0.01 }),
    t("skill/a11y-loop/SKILL.md", { font: "mono", size: 11.5, x: L + W - 18, y: RU.y + 26, fill: SITE.text2, anchor: "end" }),
  );
  let cx = L + 18;
  let cy = RU.y + 38;
  rules.forEach((title, i) => {
    const w = glyphs.measure(title, CHIP) + 24;
    if (cx + w > L + W - 18) {
      cx = L + 18;
      cy += 32;
    }
    const label = (fill) => t(title, { ...CHIP, x: cx + 12, y: cy + 18, fill });
    const chip = (fill, stroke) => `<rect x="${cx.toFixed(1)}" y="${cy + 0.5}" width="${w.toFixed(1)}" height="27" rx="13.5" fill="${fill}" stroke="${stroke}"/>`;
    write.push(chip(SITE.elv, SITE.border) + label(SITE.text1));
    const k = written.findIndex((line) => line.rule === i);
    if (k >= 0) write.push(`<g ${on(`wr${k}`, writeAt(k) + 0.3, 0.25)}>${chip(SITE.brand, SITE.brand)}${label(SITE.elv)}</g>`);
    cx += w + 8;
  });
  if (cy + 28 > RU.y + RU.h - 10) throw new Error("a11y-loop card: the rule titles of SKILL.md §1 overflow their pane");

  // ── 02 Audit: demo/before in a browser, one pass after another ─────────────
  const BR = { x: L, y: TOP, w: 460, h: BOT - TOP, bar: 34 };
  const VW = BR.w - 2;
  const VH = BR.h - BR.bar - 1;
  const P0 = AT.audit + 0.6;
  const PD = 1.0;
  const PASS_END = P0 + passes.length * PD;
  const H1 = { font: "sansMid", size: 27, tracking: -0.02 };
  const WORD = { font: "sansMid", size: 10.5, tracking: 0.06 };
  const LINK = { font: "sans", size: 9.5 };
  const CELL = { font: "sans", size: 9.5 };
  const COLS = [16, 70, 282, 388];
  const navX = [];
  NAV.reduceRight((right, n) => {
    navX.unshift(right - glyphs.measure(n, LINK));
    return navX[0] - 15;
  }, VW - 46);
  // the page of demo/before in a 458px viewport, in one pass's colours
  const page = (c) => {
    const out = [`<rect width="${VW}" height="${VH}" fill="${c.page}"/>`];
    // header
    out.push(`<rect x="16" y="9" width="17" height="17" rx="3.6" fill="${MINT}"/><path d="M20.2 20.5l2.5-6.7 1.8 4.9 1.8-4.9 2.5 6.7" stroke="#fff" stroke-width="1.3" fill="none"/>`);
    out.push(t("AWS26", { ...WORD, x: 39, y: 21.5, fill: c.nav }));
    NAV.forEach((n, i) => out.push(t(n, { ...LINK, x: navX[i], y: 21, fill: c.nav })));
    out.push(burger(VW - 30, 11, 13, c.icon, 1.5), `<rect y="34" width="${VW}" height="1" fill="${c.hair}"/>`);
    // hero
    out.push(`<rect y="35" width="${VW}" height="118" fill="${c.hero}"/>`);
    out.push(t(KICKER.toUpperCase(), { font: "sans", size: 9, x: 16, y: 60, fill: c.heroInk, tracking: 0.12, attrs: 'opacity=".85"' }));
    out.push(t("Aotearoa Web Summit 2026", { ...H1, x: 16, y: 91, fill: c.heroInk }));
    out.push(`<rect x="16" y="102" width="252" height="4" rx="2" fill="${c.heroInk}"/><rect x="16" y="111" width="196" height="4" rx="2" fill="${c.heroInk}"/>`);
    const ghost = glyphs.measure("See the programme", { font: "sansMid", size: 9.5 }) + 22;
    out.push(`<rect x="16" y="124" width="92" height="20" rx="4" fill="${c.cta}"/><rect x="30" y="132" width="64" height="4" rx="2" fill="${c.heroInk}"/>`);
    out.push(`<rect x="116" y="124" width="${ghost.toFixed(1)}" height="20" rx="4" fill="${c.ghost}"/>` + t("See the programme", { font: "sansMid", size: 9.5, x: 127, y: 137.5, fill: c.ghostInk }));
    out.push(`<rect y="153" width="${VW}" height="22" fill="${c.surface}"/><rect y="175" width="${VW}" height="1" fill="${c.hair}"/>`);
    // programme
    out.push(t("Programme", { font: "sansMid", size: 12.5, x: 16, y: 197, fill: c.heading }));
    ["Time", "Session", "Speaker", "Room"].forEach((h, i) => out.push(t(h.toUpperCase(), { font: "sansMid", size: 9, x: COLS[i], y: 216, fill: c.th, tracking: 0.1 })));
    out.push(`<rect x="16" y="222" width="${VW - 32}" height="1" fill="${c.hair}"/>`);
    SESSIONS.forEach((row, r) => {
      const y = 237 + r * 18;
      row.forEach((cell, i) => out.push(t(cell, { ...CELL, x: COLS[i], y, fill: i ? c.td : c.th })));
      out.push(`<rect x="16" y="${y + 6}" width="${VW - 32}" height="1" fill="${c.rowHair}"/>`);
    });
    return out.join("");
  };
  // the supporters' ticker, which never stops
  const ticker = (c) => {
    let tx = 16;
    const names = [...SUPPORTERS, ...SUPPORTERS].map((n) => {
      const s = t(n, { font: "sans", size: 9, x: tx, y: 167.5, fill: c.faint });
      tx += glyphs.measure(n, { font: "sans", size: 9 }) + 26;
      return s;
    });
    return `<g class="tk">${names.join("")}</g>`;
  };
  rule("tk", "0%{transform:translateX(0)}100%{transform:translateX(-300px)}");
  // three passes render the light page: it is drawn once
  defs.push(`<g id="pl">${page(PAGE.light)}</g>`);
  const pageIn = (c) => (c === PAGE.light ? '<use href="#pl"/>' : page(c)) + ticker(c);
  // where the audit pins a finding, and the pass that first reports it
  const PINS = [
    [VW - 11, 9, 0], // the menu button with no name
    [39 + glyphs.measure("AWS26", WORD) + 10, 17.5, 0], // the wordmark's contrast
    [navX[1] + glyphs.measure(NAV[1], LINK) + 3, 10, 0], // a navigation link's contrast
    [16 + glyphs.measure("Aotearoa Web Summit 2026", H1) + 14, 81, 0], // white on the pale gradient
    [16 + glyphs.measure("Programme", { font: "sansMid", size: 12.5 }) + 12, 192.5, 1], // the heading in dark mode
    [70 + glyphs.measure(SESSIONS[0][1], CELL) + 12, 233.5, 1], // a table cell in dark mode
    [VW - 60, 164, 3], // the ticker under reduced motion
    [VW / 1.55 + 15, VH - 9, 4], // the page scrolls sideways at 320px
  ];
  const audit = [
    sheet(BR.x, BR.y, BR.w, BR.h, { rx: 10 }),
    `<clipPath id="vp"><path d="M${BR.x + 1} ${BR.y + BR.bar}h${VW}v${VH - 9}a9 9 0 0 1-9 9h-${VW - 18}a9 9 0 0 1-9-9z"/></clipPath>`,
    [0, 1, 2].map((i) => `<circle cx="${BR.x + 18 + i * 13}" cy="${BR.y + 17}" r="4" fill="none" stroke="${SITE.border}" stroke-width="1.2"/>`).join(""),
    `<rect x="${BR.x + 62.5}" y="${BR.y + 6.5}" width="232" height="21" rx="10.5" fill="${SITE.canvas}" stroke="${SITE.divider}"/>`,
    t("demo/before/index.html", { font: "mono", size: 11, x: BR.x + 76, y: BR.y + 21, fill: SITE.text2 }),
    `<path d="M${BR.x + 1} ${BR.y + BR.bar - 0.5}h${VW}" stroke="${SITE.border}"/>`,
  ];
  const views = passes.map((pass, i) => {
    const s = P0 + i * PD;
    const colours = pass === "dark" ? PAGE.dark : pass === "forced-colors" ? PAGE.forced : PAGE.light;
    const pins = (from, to) =>
      PINS.filter(([, , at]) => at >= from && at <= to)
        .map(([px, py, at]) => (at === i ? `<g ${pop(`pn${PINS.findIndex((q) => q[0] === px && q[1] === py)}`, s + 0.3 + 0.14 * PINS.filter((q) => q[2] === at).findIndex((q) => q[0] === px && q[1] === py))}>${pin(px, py)}</g>` : pin(px, py)))
        .join("");
    // reflow: the fixed-width page at 320px, cut off and scrolling sideways
    const body =
      pass === "reflow"
        ? `<g transform="scale(1.55)">${pageIn(colours)}${pins(0, 3)}</g><rect y="${VH - 10}" width="${VW}" height="10" fill="#f1f1f1"/><rect x="3" y="${VH - 8}" width="${(VW / 1.55).toFixed(0)}" height="6" rx="3" fill="#a8a8a8"/>${pins(4, 4)}`
        : pageIn(colours) + pins(0, i);
    const vis = i === passes.length - 1 ? on(`pg${i}`, s, 0.2) : span(`pg${i}`, i ? s : AT.audit, s + PD + 0.2, 0.2);
    const chipW = glyphs.measure(pass, { font: "monoMid", size: 11 }) + 20;
    return (
      `<g ${vis}><g clip-path="url(#vp)"><g transform="translate(${BR.x + 1} ${BR.y + BR.bar})">${body}</g></g>` +
      // the pass the browser is emulating
      `<rect x="${(BR.x + BR.w - 12 - chipW).toFixed(1)}" y="${BR.y + 6.5}" width="${chipW.toFixed(1)}" height="21" rx="10.5" fill="${SITE.brand}"/>` +
      t(pass, { font: "monoMid", size: 11, x: BR.x + BR.w - 12 - chipW / 2, y: BR.y + 21, fill: SITE.elv, anchor: "middle" }) +
      "</g>"
    );
  });
  audit.push(views.join(""));
  // the report beside it: the count, and the passes as they run
  const RP = { x: BR.x + BR.w + 14, w: W - BR.w - 14 };
  const COUNT = { font: "display", size: 66, tracking: -0.03 };
  const up = Array.from({ length: 24 }, (_, i) => Math.round((violations * i) / 23));
  audit.push(
    sheet(RP.x, TOP, RP.w, BOT - TOP),
    t("VIOLATIONS", { font: "monoMid", size: 12, x: RP.x + 22, y: TOP + 34, fill: SIGNAL.fail, tracking: 0.12 }),
    counter("cu", up, P0 + 0.2, PASS_END - 0.1, (v) => t(String(v), { ...COUNT, x: RP.x + 20, y: TOP + 96, fill: SIGNAL.fail })),
    `<path d="M${RP.x + 22} ${TOP + 118.5}h${RP.w - 44}" stroke="${SITE.divider}"/>`,
  );
  passes.forEach((pass, i) => {
    const y = TOP + 147 + i * 29;
    const s = P0 + i * PD;
    audit.push(
      `<circle cx="${RP.x + 30}" cy="${y - 4.5}" r="7.5" fill="none" stroke="${SITE.border}" stroke-width="1.3"/>`,
      `<circle ${span(`pa${i}`, s, s + PD, 0.12)} cx="${RP.x + 30}" cy="${y - 4.5}" r="7.5" fill="none" stroke="${SITE.brand}" stroke-width="2.6"/>`,
      `<g ${on(`pd${i}`, s + PD - 0.12, 0.12)}>${tick(RP.x + 30, y - 4.5, 8.2, SITE.brand)}</g>`,
      t(pass, { font: "mono", size: 13.5, x: RP.x + 50, y, fill: SITE.text1 }),
    );
  });
  audit.push(
    `<g ${on("ex", PASS_END + 0.2)}><path d="M${RP.x + 22} ${BOT - 39.5}h${RP.w - 44}" stroke="${SITE.divider}"/>` +
      t("exit", { font: "mono", size: 13, x: RP.x + 22, y: BOT - 16, fill: SITE.text2 }) +
      t(String(runBefore.exitCode), { font: "monoMid", size: 13, x: RP.x + 22 + MONO_W * 13 * 5, y: BOT - 16, fill: SIGNAL.fail }) +
      "</g>",
  );

  // ── 03 Fix: one finding, the line that caused it, the line that replaced it ─
  const FX = AT.fix;
  const DF = { y: TOP + 70, h: 132, size: 12, lh: 23 };
  const dfX = L + 68;
  const dfMax = Math.floor((W - 68 - 14) / (MONO_W * DF.size));
  // the long line folds once, at a space, as an editor folds it
  const foldAt = nowButton.text.lastIndexOf(" ", dfMax);
  const added = nowButton.text.length > dfMax ? [nowButton.text.slice(0, foldAt), `    ${nowButton.text.slice(foldAt + 1)}`] : [nowButton.text];
  if (added.some((l) => l.length > dfMax) || wasButton.text.length > dfMax) throw new Error("a11y-loop card: a line of the fix no longer fits the diff");
  const MONO12 = { font: "mono", size: 12 };
  const fix = [
    sheet(L, TOP, W, 58),
    pin(L + 26, TOP + 29, 9),
    t(cut(finding[0], MONO12, W - 64), { font: "monoMid", size: 12, x: L + 48, y: TOP + 25, fill: SITE.text1, fallback: "mono" }),
    t(cut(finding[1], { font: "mono", size: 11.5 }, W - 64), { font: "mono", size: 11.5, x: L + 48, y: TOP + 44, fill: SITE.text2 }),
    sheet(L, DF.y, W, DF.h, { fill: SITE.code, rx: 10 }),
  ];
  const diffRows = [
    { sign: "−", n: wasButton.n, text: wasButton.text, kind: "fail" },
    ...added.map((text, i) => ({ sign: i ? "" : "+", n: i ? "" : nowButton.n, text, kind: "pass", t: FX + 1.6 + i * 1.0, dur: 0.9 })),
    { sign: "+", n: nameAt + 1, text: "  Menu", kind: "pass", t: FX + 3.55, dur: 0.2 },
  ];
  diffRows.forEach((row, i) => {
    const y = DF.y + 37 + i * DF.lh;
    const ink = SIGNAL[row.kind];
    const w = row.text.length * MONO_W * DF.size;
    const line = t(row.text, { ...MONO12, x: dfX, y, fill: ink });
    const gutter =
      `<rect x="${L + 1}" y="${y - 15.5}" width="${W - 2}" height="${DF.lh}" fill="${TINT[row.kind]}"/><rect x="${L + 1}" y="${y - 15.5}" width="3" height="${DF.lh}" fill="${ink}"/>` +
      t(String(row.n), { ...MONO12, x: L + 40, y, fill: SITE.text2, anchor: "end" }) +
      (row.sign ? t(row.sign, { font: "monoMid", size: 12, x: L + 50, y, fill: ink, fallback: "mono" }) : "");
    if (row.kind === "fail") {
      // the old line is struck out
      rule("sk", `0%,${p(FX + 0.9)}{transform:scaleX(0)}${p(FX + 1.35)},100%{transform:none}`, ";transform-box:fill-box;transform-origin:left center");
      fix.push(gutter + line + `<rect class="sk" x="${dfX - 2}" y="${y - 4.6}" width="${(w + 4).toFixed(1)}" height="1.4" fill="${ink}"/>`);
    } else {
      fix.push(`<g ${on(`dg${i}`, row.t - 0.2, 0.15)}>${gutter}${typed(`dt${i}`, line, { x: dfX, y, w, size: DF.size, bg: TINT.pass, t: row.t, dur: row.dur, n: row.text.trim().length })}</g>`);
    }
  });
  // the control itself, before and after, in each page's own styling
  const PV = { y: DF.y + DF.h + 12, h: BOT - DF.y - DF.h - 12 };
  const mid = PV.y + PV.h / 2;
  const strip = (x, label, control) =>
    t(label, { font: "mono", size: 11.5, x, y: mid + 4, fill: SITE.text2 }) +
    `<rect x="${x + 88.5}" y="${mid - 27.5}" width="160" height="55" rx="6" fill="${SITE.elv}" stroke="${SITE.divider}"/>` +
    `<rect x="${x + 102}" y="${mid - 9}" width="18" height="18" rx="3.8" fill="${MINT}"/><path d="M${x + 106.5} ${mid + 3.2}l2.6-7.1 1.9 5.2 1.9-5.2 2.6 7.1" stroke="#fff" stroke-width="1.4" fill="none"/>` +
    control(x + 88 + 160);
  const afterAt = FX + 4.0;
  const FIXED_LABEL = `${fixedRow[1]}  ${fixedRow[3]}`;
  const done = glyphs.measure(FIXED_LABEL, { font: "monoMid", size: 12 });
  fix.push(
    sheet(L, PV.y, W, PV.h),
    strip(L + 20, "demo/before", (r) => burger(r - 34, mid - 9, 18, PAGE.light.icon, 2) + pin(r - 13, mid - 12, 7)),
    `<path d="M${L + 281} ${mid}h20m-7-6 7 6-7 6" fill="none" stroke="${SITE.text2}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<g ${on("af", afterAt, 0.3)}>` +
      strip(
        L + 314,
        "demo/after",
        (r) =>
          `<rect x="${r - 88}" y="${mid - 15}" width="76" height="30" rx="7" fill="${SITE.elv}" stroke="${FIXED.border}" stroke-width="1.8"/>` +
          burger(r - 78, mid - 7, 14, FIXED.ink, 1.8) +
          t("Menu", { font: "sansMid", size: 12.5, x: r - 56, y: mid + 4.5, fill: FIXED.ink }) +
          // its focus ring, which the first page removed
          `<rect ${on("fr", afterAt + 0.5, 0.25)} x="${r - 92.5}" y="${mid - 19.5}" width="85" height="39" rx="10" fill="none" stroke="${FIXED.focus}" stroke-width="2.4"/>`,
      ) +
      "</g>",
    `<g ${on("fd", afterAt + 0.9, 0.3)}>${tick(L + W - 20 - done - 18, mid, 8, SIGNAL.pass)}` +
      t(FIXED_LABEL, { font: "monoMid", size: 12, x: L + W - 20, y: mid + 4, fill: SIGNAL.pass, anchor: "end" }) +
      "</g>",
  );
  must(L + 314 + 88 + 160 < L + W - 20 - done - 34, "the fix preview no longer fits beside its FIXED row");

  // ── 04 Re-audit: the count falls, and what no tool could judge (still frame) ─
  const RA = AT.report;
  const TM = { y: TOP, h: 66, size: 12.5 };
  const cmdW = fits(runDiff.command, { font: "mono", size: TM.size }, W - 60);
  const FALL = [RA + 1.7, RA + 2.9];
  const report = [
    `<rect x="${L}" y="${TM.y}" width="${W}" height="${TM.h}" rx="10" fill="${DARK.bg}"/>`,
    t("$", { font: "monoMid", size: TM.size, x: L + 18, y: TM.y + 27, fill: DARK.brand }),
    typed("rc", t(runDiff.command, { font: "mono", size: TM.size, x: L + 34, y: TM.y + 27, fill: DARK.text1 }), { x: L + 34, y: TM.y + 27, w: cmdW, size: TM.size, bg: DARK.bg, t: RA + 0.4, dur: 1.1, n: runDiff.command.length }),
    `<g ${on("rv", FALL[1] + 0.15)}>` +
      t(verdict, { font: "monoMid", size: TM.size, x: L + 18, y: TM.y + 50, fill: SIGNAL.passOnInk }) +
      t("exit", { font: "mono", size: TM.size, x: L + W - 18 - MONO_W * TM.size * 2, y: TM.y + 50, fill: DARK.text2, anchor: "end" }) +
      t(String(runDiff.exitCode), { font: "monoMid", size: TM.size, x: L + W - 18, y: TM.y + 50, fill: SIGNAL.passOnInk, anchor: "end" }) +
      "</g>",
  ];
  const CT = { x: L, y: TM.y + TM.h + 12, w: 226 };
  CT.h = BOT - CT.y;
  const down = Array.from({ length: 18 }, (_, i) => Math.round(violations * (1 - i / 17)));
  const acrossPasses = must(clean.match(/across \d+ rendering passes/), "the clean verdict no longer counts its passes")[0];
  report.push(
    sheet(CT.x, CT.y, CT.w, CT.h),
    t("VIOLATIONS", { font: "monoMid", size: 12, x: CT.x + 22, y: CT.y + 32, fill: SITE.text2, tracking: 0.12 }),
    counter("cd", down, FALL[0], FALL[1], (v, end) => t(String(v), { ...COUNT, x: CT.x + 20, y: CT.y + 93, fill: end ? SIGNAL.pass : SIGNAL.fail })),
    t(acrossPasses, { font: "mono", size: 11.5, x: CT.x + 22, y: CT.y + 116, fill: SITE.text2 }),
    `<path d="M${CT.x + 22} ${CT.y + 134.5}h${CT.w - 44}" stroke="${SITE.divider}"/>`,
    // a clean run is read with what it left for review
    `<g ${on("nr", FALL[1] + 0.5)}>` +
      t(String(review), { font: "display", size: 36, x: CT.x + 21, y: CT.y + 177, fill: SITE.text1, tracking: -0.02 }) +
      t("NEEDS REVIEW", { font: "monoMid", size: 12, x: CT.x + 22, y: CT.y + 201, fill: SITE.text2, tracking: 0.12 }) +
      "</g>",
  );
  // the manual checks, in the order the run lists them
  const MC = { x: CT.x + CT.w + 14, y: CT.y, h: CT.h };
  MC.w = L + W - MC.x;
  const SHOWN = 5;
  const [mcHead, mcTail] = a[manualAt].split(" — ");
  const ROW = { font: "sans", size: 12.5 };
  const person = (cx, cy) =>
    `<circle cx="${cx}" cy="${cy}" r="9.5" fill="${SITE.canvas}" stroke="${SITE.border}" stroke-width="1.2"/><circle cx="${cx}" cy="${cy - 2.6}" r="2.6" fill="none" stroke="${SITE.brand}" stroke-width="1.4"/>` +
    `<path d="M${cx - 4.6} ${cy + 5.4}a4.6 4.4 0 0 1 9.2 0" fill="none" stroke="${SITE.brand}" stroke-width="1.4" stroke-linecap="round"/>`;
  const headW = glyphs.measure(mcHead, { font: "monoMid", size: 12.5, tracking: 0.06 });
  report.push(
    sheet(MC.x, MC.y, MC.w, MC.h),
    t(mcHead, { font: "monoMid", size: 12.5, x: MC.x + 20, y: MC.y + 30, fill: SITE.text1, tracking: 0.06 }),
    t(mcTail, { font: "sans", size: 12.5, x: MC.x + 20 + headW + 12, y: MC.y + 30, fill: SITE.text2 }),
    `<path d="M${MC.x + 1} ${MC.y + 44.5}h${MC.w - 2}" stroke="${SITE.divider}"/>`,
  );
  const rowAt = (i) => FALL[1] + 1.1 + i * 0.42;
  manual.slice(0, SHOWN).forEach((item, i) => {
    const y = MC.y + 69 + i * 31;
    const [, sc, text] = item.match(/^(SC [\d.]+): (.*)$/) || [null, null, item];
    const tx = MC.x + 52;
    const scW = sc ? glyphs.measure(sc, { font: "monoMid", size: 11.5 }) + 12 : 0;
    report.push(
      `<g ${on(`mc${i}`, rowAt(i))}>` +
        person(MC.x + 30, y - 4.5) +
        (sc ? t(sc, { font: "monoMid", size: 11.5, x: tx, y: y - 0.3, fill: SITE.brand }) : "") +
        t(cut(text, ROW, MC.x + MC.w - 20 - tx - scW), { ...ROW, x: tx + scW, y, fill: SITE.text1 }) +
        (i < SHOWN - 1 ? `<path d="M${MC.x + 52} ${y + 11.5}h${MC.w - 72}" stroke="${SITE.divider}"/>` : "") +
        "</g>",
    );
  });
  report.push(`<g ${on("mm", rowAt(SHOWN))}>${t(`+ ${manualCount - SHOWN} more`, { font: "mono", size: 11.5, x: MC.x + MC.w - 20, y: MC.y + MC.h - 13, fill: SITE.text2, anchor: "end" })}</g>`);
  if (rowAt(SHOWN) > T - 1.6) throw new Error("a11y-loop card: the manual checks finish too close to the end of the loop");

  rule("out", `0%,${p(AT.report)}{opacity:0}${p(AT.report + 0.35)},${p(T - 0.35)}{opacity:1}100%{opacity:0}`);
  const scene = (name, s, e, parts) => `<g ${span(name, s, e, 0.35)}>${parts.join("")}</g>`;
  const stage =
    `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${SITE.canvas}"/>` +
    scene("sa", 0, AT.audit, write) +
    scene("sb", AT.audit, AT.fix, audit) +
    scene("sc", AT.fix, AT.report, fix) +
    // the re-audit is the still frame
    `<g class="out">${report.join("")}</g>`;

  return {
    svg: card({
      title:
        "a11y-loop, an open-source Agent Skill and command-line tool that has a coding agent write accessible UI, audit the rendered page in a real browser, fix what was found and audit again. " +
        `The card follows one turn of that loop on the demo page: ${violations} detectable failures across five rendering passes fall to 0, beside the ${review} findings left for review and the ${manualCount} manual checks automation cannot judge.`,
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body: stage + identity.join("") + `<rect x="${X - 0.5}" width="1" height="${CARD.h}" fill="${SITE.border}"/>`,
      radius: 14,
    }),
    facts: {
      rules: rules.length,
      passes: passes.join(","),
      violations,
      needsReview: review,
      manualChecks: manualCount,
      lowestContrast: contrast.map((r) => Number(r[3])).sort((x, y) => x - y)[0],
      loop: `${T.toFixed(1)}s`,
    },
  };
}
