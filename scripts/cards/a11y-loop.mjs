// a11y-loop card. a11y-loop is Chan's own open-source tool: an Agent Skill plus
// a CLI that make a coding agent write accessible UI, audit what rendered in a
// real browser, and say what the audit could not judge. The stage follows one
// turn of that loop on the product's own demo page (write, audit, fix,
// re-audit) and ends on the limits the work is read with.
//
// It is drawn in the product's own design system (a11y-loop: website/
// .vitepress/theme/custom.css): the cool-neutral canvas, hairline borders as
// structure, one cobalt accent, a pill for the lit step, Inter Tight at weight
// 400/500 for display, Inter for prose and JetBrains Mono for what the tool
// printed. The terminal is the site's own dark surface. The two signal colours
// (fail, pass) are the promo film's tokens, since the site defines none.
//
// What is said, and where it comes from:
//   - the generation rules are the bold rule titles of SKILL.md §1, and the
//     failure list is that section's own closing sentence;
//   - the three terminals replay verbatim CLI output: the runs the promo film
//     captured against demo/before and demo/after (a11y-loop-promo-video,
//     src/data/cli-*.json, "verbatim, untrimmed"). Lines are selected, and a
//     line too long for the window ends in an ellipsis; nothing is reworded;
//   - the five browser windows are stills of the film's own five-pass frame,
//     which shows the real screenshots of demo/before in each pass;
//   - the source lines of the fix are cut from demo/before and demo/after;
//   - headlines are the film's lines (its script.json and scene files);
//   - the closing figures are the README's, evals/benchmark-results.md's and
//     SKILL.md §3's, each matched by pattern here with its basis beside it.
// The build fails when any of those patterns stops matching, and when any
// colour pair on the card falls under WCAG AA as measured by the product's own
// contrast-math.js.
//
// Claim rules that bind this card (the product's §3 and the guard comment above
// the shard entry): a clean run is never called accessible, compliant or
// conformant; the benchmark figure never appears without its n; no organisation
// is named as a user of the tool.
//
// The product checkout and the film are NOT in this repo (A11Y_LOOP_INPUTS);
// where either is absent the card is not rebuilt and the committed SVG stands.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { filmStills, wrap } from "../lib/svg-card/film.mjs";
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
  benchmark: "../a11y-loop/evals/benchmark-results.md",
  before: "../a11y-loop/demo/before/index.html",
  after: "../a11y-loop/demo/after/index.html",
  contrast: "../a11y-loop/src/lib/contrast-math.js",
  culori: "../a11y-loop/node_modules/culori/package.json",
  auditBefore: "../a11y-loop-promo-video/src/data/cli-audit-before.json",
  auditAfter: "../a11y-loop-promo-video/src/data/cli-audit-after.json",
  diff: "../a11y-loop-promo-video/src/data/cli-diff.json",
  film: "../a11y-loop-promo-video/out/a11y-loop-promo.mp4",
};

// The site's tokens (custom.css, :root and .dark).
const SITE = { canvas: "#f7f8fa", elv: "#ffffff", border: "#c9ced9", divider: "#e3e6ec", text1: "#10141c", text2: "#4b5565", brand: "#1d4ed8", code: "#f7f7f9" };
const DARK = { bg: "#0b0d12", border: "#333a4d", text1: "#eef1f6", text2: "#a6afbe", brand: "#7da2ff" };
// The film's signal tokens (its constants.ts).
const SIGNAL = { fail: "#A8202A", pass: "#0C6B42", failOnInk: "#FF9A90", passOnInk: "#6FD79B" };

// The film's lines (script.json cues and the Loop, Honesty, Benchmark and Cta scenes).
const COPY = {
  write: "A skill sets the rules while the agent writes.",
  audit: "A CLI opens a real browser and checks.",
  fix: "Findings go back to the agent. It fixes them and audits again.",
  report: ["A clean report means no detectable failures.", "Never that it’s accessible."],
  limits: "READ IT WITH ITS LIMITS",
  close: ["Accessibility stops being the audit at the end.", "It becomes the default at the start."],
};
const STEPS = ["write", "audit", "fix", "re-audit"]; // the README's "write → audit → fix → re-audit cycle"

const must = (value, what) => {
  if (value === null || value === undefined || value === false) throw new Error(`a11y-loop card: ${what}`);
  return value;
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

export function buildA11yLoopCard({ glyphs, root, project }) {
  const read = (key) => readFileSync(`${root}/${A11Y_LOOP_INPUTS[key]}`, "utf8");
  const capture = (key) => JSON.parse(read(key));

  const contrast = measure(root, [
    [SITE.text1, SITE.elv, "text"],
    [SITE.text2, SITE.elv, "text"],
    [SITE.brand, SITE.elv, "text"],
    [SITE.text1, SITE.canvas, "text"],
    [SITE.text2, SITE.canvas, "text"],
    [SITE.brand, SITE.canvas, "text"],
    [SITE.elv, SITE.brand, "text"],
    [SITE.text2, SITE.code, "text"],
    [SIGNAL.fail, SITE.code, "text"],
    [SIGNAL.pass, SITE.code, "text"],
    [DARK.text1, DARK.bg, "text"],
    [DARK.text2, DARK.bg, "text"],
    [DARK.brand, DARK.bg, "text"],
    [SIGNAL.failOnInk, DARK.bg, "text"],
    [SIGNAL.passOnInk, DARK.bg, "text"],
    [SITE.brand, SITE.canvas, "ui"],
  ]);

  // ── SKILL.md §1: the rule titles and the failure list ──────────────────────
  const skill = read("skill");
  const s1 = must(skill.split("## §1 Generation rules")[1], "SKILL.md has no §1 Generation rules").split("## §2")[0];
  const S1_LEAD = "Apply while writing, not afterwards.";
  must(s1.includes(S1_LEAD), "SKILL.md §1 no longer opens with its lead line");
  const rules = [...s1.matchAll(/^\*\*([^*\n]+\.)\*\*/gm)].map((m) => m[1]);
  if (rules.length !== 10) throw new Error(`a11y-loop card: expected the 10 rule titles of SKILL.md §1, found ${rules.length}`);
  const blacklist = must(s1.match(/the\s+blacklist of failures generated code reproduces most: ([\s\S]*?)\.\s*$/m), "SKILL.md §1 no longer ends on its failure list")[1]
    .replace(/`/g, "")
    .replace(/\s+/g, " ");

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
  const beforeRows = [b[find(b, /^Target standard:/, "target")], `VIOLATIONS (${violations})`, b[bn], b[bn + 1], b[bn + 2]];
  must(/^\s+· html > body > header/.test(b[bn + 1]), "the button-name finding is no longer the header's menu button");

  const d = linesOf(runDiff);
  const verdict = d[find(d, /^Converged: all \d+ violations fixed, none introduced$/, "diff verdict")];
  if (Number(verdict.match(/\d+/)[0]) !== violations) throw new Error("a11y-loop card: the diff verdict and the audit disagree on the violation count");
  const diffRows = [
    d[find(d, /^FIXED\s+SC 4\.1\.2\s+button-name\s/, "button-name fixed")],
    d[find(d, /^FIXED\s+SC 3\.1\.1\s+html-has-lang\s/, "html-has-lang fixed")],
    d[find(d, /^FIXED\s+SC 2\.4\.7\s+focus-not-visible\s+#speakers/, "focus-not-visible fixed")],
    d[find(d, /^\d+ new needs-review finding\(s\)/, "new needs-review note")],
    verdict,
  ];

  const a = linesOf(runAfter);
  const manualAt = find(a, /^MANUAL CHECKS \(\d+\)/, "manual checks header");
  const manual = [];
  for (let i = manualAt + 1; a[i] && /^\s{2,}/.test(a[i]); i++) if (/^  · /.test(a[i])) manual.push(a[i]);
  const manualCount = Number(a[manualAt].match(/\d+/)[0]);
  if (manual.length !== manualCount) throw new Error(`a11y-loop card: MANUAL CHECKS says ${manualCount}, the run lists ${manual.length}`);
  const pick = (re) => must(manual.find((l) => re.test(l)), `no manual check matching ${re}`);
  const clean = a[find(a, /^No automatically detectable failures across \d+ rendering passes\.$/, "clean verdict")];
  const coverage = a[find(a, /^Automated checks cover a subset of WCAG .*This is not an audit or conformance claim\.$/, "coverage statement")];
  const afterRows = [
    a[find(a, /^NEEDS REVIEW \(\d+\)/, "needs-review header")],
    a[manualAt],
    pick(/real screen reader/),
    pick(/SC 2\.4\.3:/),
    pick(/SC 2\.1\.1:/),
    pick(/SC 1\.1\.1:/),
    pick(/SC 1\.4\.1:/),
    clean,
    a[find(a, /^The \d+ needs-review finding\(s\) are not passes/, "needs-review reminder")],
  ];
  const passes = must(a[find(a, /^Provenance:/, "provenance")].match(/passes: ([a-z0-9, -]+?) ·/), "provenance lists no passes")[1].split(", ");
  if (passes.length !== 5 || Number(clean.match(/\d+/)[0]) !== 5) throw new Error("a11y-loop card: the audit no longer runs five passes");

  // ── The fix, cut from the demo's two source files ──────────────────────────
  const src = (key, re) => {
    const lines = read(key).split("\n");
    const i = lines.findIndex((l) => re.test(l));
    if (i < 0) throw new Error(`a11y-loop card: demo/${key} has no line matching ${re}`);
    return { n: i + 1, text: lines[i].trim(), lines };
  };
  const wasButton = src("before", /<button class="icon-btn hamburger" onclick="toggleNav\(\)">/);
  const nowButton = src("after", /<button type="button" class="nav-toggle" id="navToggle" aria-expanded="false"/);
  const nameAt = nowButton.lines.findIndex((l, i) => i >= nowButton.n && l.trim() === "Menu");
  must(nameAt > 0 && nameAt < nowButton.n + 6, "the fixed button no longer carries its visible name");

  // ── The closing figures ────────────────────────────────────────────────────
  const readme = read("readme");
  const seeded = Number(must(readme.match(/seeded with\s+\*\*(\d+) detectable failures\*\*/), "README no longer states the demo's seeded failures")[1]);
  if (seeded !== violations) throw new Error("a11y-loop card: the README and the captured audit disagree on the demo's failures");
  const bench = read("benchmark");
  const total = must(bench.match(/^\| \*\*Total\*\* \| \*\*(\d+)\*\* \| \*\*\d+\*\* \| \*\*(\d+)\*\* \| \*\*\d+\*\* \| \*\*(\d+)\*\* \|/m), "benchmark-results.md has no totals row");
  const n = must(bench.match(/N=(\d+) components, a single run per condition, one\s+model family, and the audits are produced by a11y-loop's own engine/), "benchmark-results.md no longer states its n and its limits")[1];
  const reach = must(skill.match(/\*\*(\d+) of the (\d+)\*\* WCAG 2\.2 A\/AA criteria as having any ACT-approved automated\s+rule/), "SKILL.md §3 no longer states its coverage denominator");
  const origin = must(project.narrative.impactHeadline.match(/Built for the accessible-UI challenge set at the Aotearoa AI Hackathon 2026/), "the shard no longer states the project's origin")[0];
  const licence = must(project.metrics.find((m) => m.label === "License"), "the shard has no licence metric").value;
  const FIGURES = [
    [[String(seeded), "→", "0"], "DEMO PAGE", `A page seeded with ${seeded} detectable failures. The loop fixed all of them; diff reports none introduced.`],
    [[total[1], "→", total[2], "→", total[3]], `BENCHMARK, N = ${n}`, `Violations across ${n} components: no guidance, with the skill, after the loop. One run each, self-audited: an illustration, not a study.`],
    [[reach[1], "of", reach[2]], "WHAT AUTOMATION REACHES", "WCAG 2.2 A/AA criteria have any automated rule. A clean report is not a conformance claim."],
  ];

  // ── The five passes, cut from the film's own five-pass frame ───────────────
  const film = `${root}/${A11Y_LOOP_INPUTS.film}`;
  const TH = { w: 140, h: 84 };
  const shots = passes.map((_, i) => filmStills(film, [68.5], { crop: `273:164:${160 + 332 * i}:178`, w: TH.w * 2, h: TH.h * 2, quality: 5 })[0]);

  // ── Timeline ───────────────────────────────────────────────────────────────
  const AT = { write: 0, audit: 6.2, fix: 15.2, report: 24.2, close: 33.8 };
  const T = 41.4;
  const ENDS = [AT.audit, AT.fix, AT.report, AT.close];
  const p = (t) => pct(t, T, 3);
  const css = [];
  const made = new Set();
  const rule = (name, frames) => {
    if (!made.has(name)) css.push(`@keyframes ${name}{${frames}}.${name}{animation:${name} ${T}s linear infinite}`);
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

  const X = CARD.panel;
  const L = X + 22; // the stage's left edge
  const W = CARD.w - X - 44; // and its measure
  const fits = (text, style, max) => {
    const w = glyphs.measure(text, style);
    if (w > max) throw new Error(`a11y-loop card: "${text}" is ${w.toFixed(0)}px wide, the measure is ${max}`);
    return w;
  };
  const DISPLAY = { font: "display", size: 22, tracking: -0.02 };
  const kicker = (i, label) => glyphs.text(`0${i} / 05  ·  ${label}`, { font: "monoMid", size: 12, x: L, y: 36, fill: SITE.text2, tracking: 0.1 });
  const headline = (text, y = 64) => {
    fits(text, DISPLAY, W);
    return glyphs.text(text, { ...DISPLAY, x: L, y, fill: SITE.text1 });
  };

  // ── The terminal: a captured run, replayed ─────────────────────────────────
  const MONO = 13;
  const LH = 19.5;
  const CHAR = glyphs.measure("0", { font: "mono", size: MONO });
  // the film's own rules for colouring a line by what the CLI is saying
  const tint = (line) => {
    if (/^VIOLATIONS \(/.test(line)) return [SIGNAL.failOnInk, "monoMid"];
    if (/^NEEDS REVIEW|^MANUAL/.test(line)) return [DARK.text1, "monoMid"];
    if (/^Converged:|^No automatically detectable/.test(line)) return [SIGNAL.passOnInk, "monoMid"];
    if (/^\s*FIXED\b/.test(line)) return [SIGNAL.passOnInk, "mono"];
    if (/^\s*SC \d/.test(line)) return [DARK.brand, "mono"];
    if (/^(Target standard:|Automated checks cover|have any|The \d+ needs-review)/.test(line) || /^\s{4,}/.test(line)) return [DARK.text2, "mono"];
    return [DARK.text1, "mono"];
  };
  const terminal = (id, { y, h, command, rows, exit, t0, every = 0.42, bar }) => {
    const pad = 14;
    const max = Math.floor((W - pad * 2) / CHAR);
    const cut = (line) => (line.length > max ? `${line.slice(0, max - 1).trimEnd()}…` : line);
    const out = [`<rect x="${L}" y="${y}" width="${W}" height="${h}" rx="8" fill="${DARK.bg}"/>`];
    const y0 = y + pad + 11;
    // the command types itself: a cover slides off it in steps
    const typeAt = t0 + 0.5;
    const typed = command.length / 34;
    const cw = command.length * CHAR;
    rule(`${id}c`, `0%,${p(typeAt)}{transform:translateX(0);animation-timing-function:steps(${command.length},end)}${p(typeAt + typed)},100%{transform:translateX(${(cw + 4).toFixed(1)}px)}`);
    out.push(
      glyphs.text("$", { font: "monoMid", size: MONO, x: L + pad, y: y0, fill: DARK.brand }) +
        `<clipPath id="${id}k"><rect x="${L + pad + CHAR * 2 - 1}" y="${y + 4}" width="${(cw + 6).toFixed(1)}" height="${LH + 6}"/></clipPath>` +
        `<g clip-path="url(#${id}k)">${glyphs.text(command, { font: "mono", size: MONO, x: L + pad + CHAR * 2, y: y0, fill: DARK.text1 })}` +
        `<rect class="${id}c" x="${L + pad + CHAR * 2 - 1}" y="${y0 - MONO}" width="${(cw + 6).toFixed(1)}" height="${MONO * 1.5}" fill="${DARK.bg}"/></g>`,
    );
    out.push(glyphs.text("selected lines, verbatim", { font: "mono", size: 12, x: L + W - pad, y: y0, fill: DARK.text2, anchor: "end" }));
    const first = typeAt + typed + 0.45;
    if (bar) {
      const [from, to] = bar;
      out.push(`<rect ${on(`${id}b`, first + to * every, 0.3)} x="${L + pad - 7}" y="${(y0 + (from + 1) * LH - MONO + 1).toFixed(1)}" width="3" height="${((to - from + 1) * LH - 3).toFixed(1)}" fill="${DARK.brand}"/>`);
    }
    const all = exit === undefined ? rows : [...rows, null];
    all.forEach((row, i) => {
      const ty = y0 + (i + 1) * LH;
      if (ty > y + h - 6) throw new Error(`a11y-loop card: terminal "${id}" has more lines than its window holds`);
      let line;
      if (row === null) {
        // the film's exit line: the run's real exit code
        line = glyphs.text("exit", { font: "mono", size: MONO, x: L + pad, y: ty, fill: DARK.text2 }) + glyphs.text(String(exit), { font: "monoMid", size: MONO, x: L + pad + CHAR * 5, y: ty, fill: exit === 0 ? SIGNAL.passOnInk : SIGNAL.failOnInk });
      } else {
        const [fill, font] = tint(row);
        line = glyphs.text(cut(row), { font, size: MONO, x: L + pad, y: ty, fill, fallback: "mono" });
      }
      out.push(`<g ${on(`${id}${i}`, first + i * every, 0.12)}>${line}</g>`);
    });
    return { svg: out.join(""), done: first + all.length * every };
  };
  // word wrap for a run of mono text
  const fold = (text, max) => {
    const lines = [""];
    for (const word of text.split(" ")) {
      const last = lines[lines.length - 1];
      if (last && last.length + 1 + word.length > max) lines.push(word);
      else lines[lines.length - 1] = last ? `${last} ${word}` : word;
    }
    return lines;
  };

  // ── Identity: the site's own hero ──────────────────────────────────────────
  const mark = must(readFileSync(`${root}/public/brands/a11y-loop-mark.svg`, "utf8").match(/<svg x="17"[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/), "could not find the mark inside public/brands/a11y-loop-mark.svg");
  const HERO = { font: "displayReg", size: 30, tracking: -0.02 };
  fits("Write accessible UI by default.", HERO, X - 70);
  const identity = [
    `<rect width="${X}" height="${CARD.h}" fill="${SITE.elv}"/>`,
    glyphs.text("AGENT SKILL + CLI  ·  OPEN SOURCE", { font: "monoMid", size: 12, x: 40, y: 44, fill: SITE.text2, tracking: 0.1 }),
    `<svg x="32" y="62" width="64" height="64" viewBox="${mark[1]}">${mark[2].replace(/<title>[^<]*<\/title>/, "")}</svg>`,
    glyphs.text("a11y-loop", { font: "display", size: 46, x: 104, y: 110, fill: SITE.brand, tracking: -0.02 }),
    // the site's hero text and tagline
    glyphs.text("Write accessible UI by default.", { ...HERO, x: 40, y: 170, fill: SITE.text1 }),
    glyphs.text("Verify it in a real browser.", { font: "sans", size: 17, x: 40, y: 201, fill: SITE.text2 }),
    glyphs.text("Say exactly what you couldn’t check.", { font: "sans", size: 17, x: 40, y: 225, fill: SITE.text2 }),
    glyphs.text("THE LOOP RUNS UNTIL THE REPORT CONVERGES", { font: "monoMid", size: 11.5, x: 40, y: 276, fill: SITE.text2, tracking: 0.08 }),
  ];
  // the loop's steps; the lit one follows the stage
  let sx = 40;
  STEPS.forEach((step, i) => {
    const style = { font: "monoMid", size: 14.5 };
    const w = glyphs.measure(step, style) + 30;
    const label = (fill) => glyphs.text(step, { ...style, x: sx + w / 2, y: 312.5, fill, anchor: "middle" });
    identity.push(`<rect x="${sx.toFixed(1)}" y="292.5" width="${w.toFixed(1)}" height="31" rx="15.5" fill="${SITE.elv}" stroke="${SITE.border}" stroke-width="1.2"/>${label(SITE.text1)}`);
    identity.push(`<g ${span(`st${i}`, i ? ENDS[i - 1] : 0, ENDS[i], 0.25)}><rect x="${sx.toFixed(1)}" y="292.5" width="${w.toFixed(1)}" height="31" rx="15.5" fill="${SITE.brand}" stroke="${SITE.brand}" stroke-width="1.2"/>${label(SITE.elv)}</g>`);
    sx += w;
    if (i < STEPS.length - 1) {
      identity.push(`<path d="M${(sx + 6).toFixed(1)} 308h14m-5-4.5 5 4.5-5 4.5" fill="none" stroke="${SITE.text2}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`);
      sx += 26;
    }
  });
  if (sx > X - 30) throw new Error("a11y-loop card: the loop's steps do not fit the panel");

  // ── 01 Write: SKILL.md §1 ──────────────────────────────────────────────────
  const DOC = { y: 80, h: 264 };
  const RULE = { font: "sansMid", size: 14.5 };
  const write = [
    kicker(1, "WRITE"),
    headline(COPY.write),
    `<rect x="${L + 0.5}" y="${DOC.y + 0.5}" width="${W - 1}" height="${DOC.h - 1}" rx="12" fill="${SITE.elv}" stroke="${SITE.border}"/>`,
    glyphs.text("skill/a11y-loop/SKILL.md", { font: "mono", size: 12.5, x: L + 20, y: DOC.y + 25, fill: SITE.text2 }),
    `<path d="M${L + 1} ${DOC.y + 38.5}h${W - 2}" stroke="${SITE.divider}"/>`,
    glyphs.text("§1 Generation rules", { font: "display", size: 20, x: L + 20, y: DOC.y + 68, fill: SITE.text1, tracking: -0.01 }),
    glyphs.text(S1_LEAD, { font: "sans", size: 14.5, x: L + 20 + glyphs.measure("§1 Generation rules", { font: "display", size: 20, tracking: -0.01 }) + 16, y: DOC.y + 68, fill: SITE.text2 }),
  ];
  let rx = L + 20;
  let ry = DOC.y + 98;
  rules.forEach((title, i) => {
    const w = glyphs.measure(title, RULE) + 16;
    if (rx + w > L + W - 20) {
      rx = L + 20;
      ry += 26;
    }
    write.push(`<g ${on(`r${i}`, 0.9 + i * 0.3)}><rect x="${rx}" y="${ry - 9.5}" width="7" height="7" rx="1.5" fill="${SITE.brand}"/>${glyphs.text(title, { ...RULE, x: rx + 16, y: ry, fill: SITE.text1 })}</g>`);
    rx += w + 24;
  });
  const listAt = ry + 18;
  const listStyle = { font: "sans", size: 13.5 };
  const failures = wrap(glyphs, `${blacklist}.`, listStyle, W - 40);
  if (failures.length > 4) throw new Error(`a11y-loop card: the failure list of SKILL.md runs to ${failures.length} lines`);
  write.push(
    `<g ${on("bl", 4.1, 0.35)}><path d="M${L + 20} ${listAt + 0.5}h${W - 40}" stroke="${SITE.divider}"/>` +
      glyphs.text("Re-read before saving: the failures generated code reproduces most", { font: "sansMid", size: 13.5, x: L + 20, y: listAt + 22, fill: SITE.text1 }) +
      failures.map((l, i) => glyphs.text(l, { ...listStyle, x: L + 20, y: listAt + 42 + i * 19, fill: SITE.text2 })).join("") +
      "</g>",
  );
  if (listAt + 42 + (failures.length - 1) * 19 > DOC.y + DOC.h - 10) throw new Error(`a11y-loop card: the SKILL.md pane overflows (${failures.length} list lines from y=${listAt})`);

  // ── 02 Audit: five passes in a real browser, then the report ───────────────
  const defs = [];
  const gap = (W - TH.w * passes.length) / (passes.length - 1);
  const auditTerm = terminal("ta", { y: 190, h: 156, command: runBefore.command, rows: beforeRows, exit: runBefore.exitCode, t0: AT.audit + 2.2, every: 0.4 });
  const audit = [kicker(2, "AUDIT"), headline(COPY.audit)];
  passes.forEach((pass, i) => {
    const x = L + i * (TH.w + gap);
    defs.push(`<clipPath id="th${i}"><rect x="${x.toFixed(1)}" y="78" width="${TH.w}" height="${TH.h}" rx="5"/></clipPath>`);
    audit.push(
      `<image clip-path="url(#th${i})" x="${x.toFixed(1)}" y="78" width="${TH.w}" height="${TH.h}" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${shots[i]}"/>` +
        `<rect x="${(x + 0.5).toFixed(1)}" y="78.5" width="${TH.w - 1}" height="${TH.h - 1}" rx="4.5" fill="none" stroke="${SITE.border}"/>` +
        // each pass is ringed as it runs
        `<rect ${span(`ps${i}`, AT.audit + 0.5 + i * 0.42, AT.audit + 1.05 + i * 0.42, 0.12)} x="${(x - 2).toFixed(1)}" y="76" width="${TH.w + 4}" height="${TH.h + 4}" rx="7" fill="none" stroke="${SITE.brand}" stroke-width="3"/>` +
        glyphs.text(pass, { font: "mono", size: 12.5, x: x + TH.w / 2, y: 179, fill: SITE.text1, anchor: "middle" }),
    );
  });
  audit.push(auditTerm.svg);

  // ── 03 Fix: the source line, then the diff ─────────────────────────────────
  const CODE = { y: 80, h: 100 };
  const codeMax = Math.floor((W - 28 - CHAR * 6) / CHAR);
  const codeCut = (s) => (s.length > codeMax ? `${s.slice(0, codeMax - 1)}…` : s);
  const codeRow = (i, sign, n, text, fill) => {
    const y = CODE.y + 54 + i * 19.5;
    return (
      glyphs.text(String(n).padStart(3, " "), { font: "mono", size: MONO, x: L + 14, y, fill: SITE.text2 }) +
      glyphs.text(sign, { font: "monoMid", size: MONO, x: L + 14 + CHAR * 4, y, fill, fallback: "mono" }) +
      glyphs.text(codeCut(text), { font: "mono", size: MONO, x: L + 14 + CHAR * 6, y, fill })
    );
  };
  const fixTerm = terminal("tf", { y: 190, h: 156, command: runDiff.command, rows: diffRows, exit: runDiff.exitCode, t0: AT.fix + 2.0, every: 0.4 });
  const fix = [
    kicker(3, "FIX"),
    headline(COPY.fix),
    `<rect x="${L + 0.5}" y="${CODE.y + 0.5}" width="${W - 1}" height="${CODE.h - 1}" rx="8" fill="${SITE.code}" stroke="${SITE.border}"/>`,
    glyphs.text("demo/before/index.html", { font: "mono", size: 12.5, x: L + 14, y: CODE.y + 24, fill: SITE.text2 }),
    glyphs.text("demo/after/index.html", { font: "mono", size: 12.5, x: L + W - 14, y: CODE.y + 24, fill: SITE.text2, anchor: "end" }),
    codeRow(0, "−", wasButton.n, wasButton.text, SIGNAL.fail),
    `<g ${on("fx", AT.fix + 1.1, 0.3)}>${codeRow(1, "+", nowButton.n, nowButton.text, SIGNAL.pass)}${codeRow(2, "+", nameAt + 1, "  Menu", SIGNAL.pass)}</g>`,
    fixTerm.svg,
  ];

  // ── 04 Re-audit: the clean run, and what it could not judge ────────────────
  const REPORT = { font: "display", size: 21.5, tracking: -0.02 };
  const lead = fits(`${COPY.report[0]} `, REPORT, W);
  fits(COPY.report.join(" "), REPORT, W);
  const pad = 14;
  const maxChars = Math.floor((W - pad * 2) / CHAR);
  const reportRows = [...afterRows, ...fold(coverage, maxChars)];
  const reportTerm = terminal("tr", { y: 80, h: 266, command: runAfter.command, rows: reportRows, t0: AT.report + 0.2, every: 0.36, bar: [1, 6] });
  const report = [
    kicker(4, "RE-AUDIT"),
    glyphs.text(COPY.report[0], { ...REPORT, x: L, y: 64, fill: SITE.text1 }),
    glyphs.text(COPY.report[1], { ...REPORT, x: L + lead, y: 64, fill: SITE.brand }),
    reportTerm.svg,
  ];
  for (const [name, done, end] of [["audit", auditTerm.done, AT.fix], ["fix", fixTerm.done, AT.report], ["report", reportTerm.done, AT.close]]) {
    if (done > end - 1.5) throw new Error(`a11y-loop card: the ${name} terminal finishes ${(end - done).toFixed(1)}s before its scene ends; give it more time`);
  }

  // ── 05 What the work is read with (the still frame) ────────────────────────
  const COL = { w: (W - 36) / 3, y: 112, h: 172 };
  const FIG = { font: "display", size: 36, tracking: -0.02 };
  const figure = (parts, x, y) => {
    let cx = x;
    return parts
      .map((part) => {
        if (part === "→") {
          const s = `<path d="M${(cx + 7).toFixed(1)} ${y - 12.5}h22m-8-7 8 7-8 7" fill="none" stroke="${SITE.brand}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
          cx += 37;
          return s;
        }
        const word = part === "of";
        const style = word ? { font: "displayReg", size: 24, tracking: -0.01 } : FIG;
        if (word) cx += 8;
        const s = glyphs.text(part, { ...style, x: cx, y, fill: word ? SITE.text2 : SITE.brand });
        cx += glyphs.measure(part, style) + (word ? 8 : 0);
        return s;
      })
      .join("");
  };
  const bodyStyle = { font: "sans", size: 13.5 };
  const close = [
    glyphs.text(`05 / 05  ·  ${COPY.limits}`, { font: "monoMid", size: 12, x: L, y: 36, fill: SITE.text2, tracking: 0.1 }),
    glyphs.text(COPY.close[0], { ...DISPLAY, x: L, y: 64, fill: SITE.text1 }),
    glyphs.text(COPY.close[1], { ...DISPLAY, x: L, y: 92, fill: SITE.brand }),
  ];
  fits(COPY.close[0], DISPLAY, W);
  FIGURES.forEach(([parts, label, body], i) => {
    const x = L + i * (COL.w + 18);
    const lines = wrap(glyphs, body, bodyStyle, COL.w - 32);
    if (lines.length > 5) throw new Error(`a11y-loop card: the "${label}" note runs to ${lines.length} lines`);
    rule(`fg${i}`, `0%,${p(AT.close + 0.5 + i * 0.3)}{opacity:0;transform:translateY(6px)}${p(AT.close + 0.85 + i * 0.3)},100%{opacity:1;transform:none}`);
    close.push(
      `<g class="fg${i}"><rect x="${(x + 0.5).toFixed(1)}" y="${COL.y + 0.5}" width="${(COL.w - 1).toFixed(1)}" height="${COL.h - 1}" rx="12" fill="${SITE.elv}" stroke="${SITE.border}"/>` +
        figure(parts, x + 16, COL.y + 46) +
        glyphs.text(label, { font: "monoMid", size: 11.5, x: x + 16, y: COL.y + 70, fill: SITE.text1, tracking: 0.1 }) +
        lines.map((l, k) => glyphs.text(l, { ...bodyStyle, x: x + 16, y: COL.y + 92 + k * 17.5, fill: SITE.text2 })).join("") +
        "</g>",
    );
  });
  const credit = `${licence} licence  ·  npm: a11y-loop  ·  open Agent Skills standard  ·  author: Chan Meng`;
  close.push(
    glyphs.text(`${origin}.`, { font: "sansMid", size: 14.5, x: L, y: 310, fill: SITE.text1 }),
    glyphs.text(credit, { font: "mono", size: 12.5, x: L, y: 334, fill: SITE.text2 }),
  );
  fits(credit, { font: "mono", size: 12.5 }, W);
  rule("out", `0%,${p(AT.close)}{opacity:0}${p(AT.close + 0.35)},${p(T - 0.35)}{opacity:1}100%{opacity:0}`);

  const scene = (name, s, e, parts) => `<g ${span(name, s, e, 0.35)}>${parts.join("")}</g>`;
  const stage =
    `<rect x="${X}" width="${CARD.w - X}" height="${CARD.h}" fill="${SITE.canvas}"/>` +
    scene("sa", 0, AT.audit, write) +
    scene("sb", AT.audit, AT.fix, audit) +
    scene("sc", AT.fix, AT.report, fix) +
    scene("sd", AT.report, AT.close, report) +
    // the closing frame is the still frame
    `<g class="out">${close.join("")}</g>`;

  return {
    svg: card({
      title:
        `a11y-loop, an open-source Agent Skill and command-line tool by Chan Meng. The skill gives a coding agent its accessibility rules while it writes UI. The CLI then audits the rendered page in a real browser across five passes (${passes.join(", ")}), the agent fixes what was found, and the audit runs again until the report converges. ` +
        `On the demo page, ${seeded} seeded failures went to 0 and diff reported none introduced. The clean run still listed ${manualCount} manual checks automation cannot judge, such as testing with a real screen reader. ` +
        `In a small benchmark of ${n} components, one run each and self-audited, violations went from ${total[1]} with no guidance to ${total[2]} with the skill and ${total[3]} after the loop: an illustration, not a study. ` +
        `Only ${reach[1]} of the ${reach[2]} WCAG 2.2 A and AA criteria have any automated rule, so a clean report is not a conformance claim. ${origin}. ${licence} licence.`,
      css: css.join(""),
      defs: `${glyphs.defs()}${defs.join("")}`,
      body: stage + identity.join("") + `<rect x="${X - 0.5}" width="1" height="${CARD.h}" fill="${SITE.border}"/>`,
      radius: 14,
    }),
    facts: {
      rules: rules.length,
      passes: passes.join(","),
      violations,
      manualChecks: manualCount,
      benchmark: `${total[1]}→${total[2]}→${total[3]} (n=${n})`,
      reach: `${reach[1]}/${reach[2]}`,
      lowestContrast: contrast.map((r) => Number(r[3])).sort((x, y) => x - y)[0],
      loop: `${T.toFixed(1)}s`,
    },
  };
}
