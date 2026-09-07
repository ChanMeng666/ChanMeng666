// Prose extraction for the career-copy linter (scripts/check-copy.mjs).
//
// Every derivative career surface — the designed CV, the ATS resume, the
// extended magazine, the cover-letter kit, the LinkedIn shard, the narrative
// fields in the profile shards — carries hand-written prose that no existing
// gate reads. check-copy.mjs lints that prose. This module's only job is to
// hand it CLEAN PROSE WITH EXACT OFFSETS, so a finding can say file:line.
//
// The technique throughout is MASKING, not extraction: every mask preserves the
// source's length and its newlines, so an offset into the masked text is still a
// valid offset into the original file. Three character classes come out:
//
//   kept char   the prose itself, verbatim
//   SOFT (\u01) something inside a prose run that is not prose — a `*` emphasis
//               marker, the `#link("…")` wrapper around a linked phrase, the
//               indent of a YAML block scalar. Reads as a space and does NOT
//               end a sentence.
//   HARD (\u00) a structural boundary — top-level Typst code, a YAML key line, a
//               markdown fence. Reads as a space and DOES end a sentence, so two
//               adjacent bullets never merge into one 60-word run-on.
//
// Typst comments are stripped (via lib/typst-ast.mjs) before anything else. That
// is not an optimisation: the comments in cv/sections/*.typ and
// cv/chan-meng-cv-ats.typ deliberately quote banned words, dead copy and old
// metrics while explaining why they were removed. Linting them would report the
// documentation of a fix as the bug.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { stripComments, scanBalanced, consumeStatement } from "./typst-ast.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(__dirname, "..", "..");

export const HARD = "\u0000";
export const SOFT = "\u0001";

// ---------------------------------------------------------------------------
// The surface list — the one place to extend when a new career surface appears.
// ---------------------------------------------------------------------------
//
//   kind        typst | markdown | yaml
//   scope       display — budgeted, reader-facing copy: the CV, the ATS resume,
//                         the extended magazine, the cover-letter kit, and the
//                         LinkedIn fields that are literally pasted into the
//                         live profile. Every rule applies, register rules
//                         (duty-verb lead, run-on) included.
//               source  — the canonical narrative fields in data/profile/*.yaml.
//                         These are the SOURCE every display surface selects
//                         DOWN from: a `publicSummary` is deliberately long,
//                         complete and over-specified, and a 99-word one is
//                         correct by design. They are held to the TRUTH rules
//                         only. Linting them for sentence economy would be
//                         linting the format, not a fault.
//   numbers     true  → rule R8 checks every claim number against the profile
//                       shards. Only DERIVATIVE surfaces qualify: a number in a
//                       canonical shard IS the shard.
//   pathRe      yaml only — which field PATHS hold prose (see scanYamlFields).
//               Path-shaped, not key-shaped, because `description` means one
//               thing under `experience[].positions[]` (display copy pasted into
//               LinkedIn) and another under `honorsAndAwards[]` (mirror data).
//   quotesAreForeign
//               markdown only — text inside "straight double quotes" is either
//               somebody else's verbatim words or an illustrative anti-example,
//               so it is not Chan's prose and is not linted. See the note on
//               EVIDENCE.md's `pivotal` testimonial in check-copy.mjs.
export const SURFACES = [
  { glob: "cv/sections/*.typ", kind: "typst", scope: "display", numbers: true },
  { path: "cv/chan-meng-cv-ats.typ", kind: "typst", scope: "display", numbers: true },
  { path: "cv/extended.typ", kind: "typst", scope: "display", numbers: true },
  { path: "cv/cover-letter/EVIDENCE.md", kind: "markdown", scope: "display", numbers: true, quotesAreForeign: true },
  { path: "cv/cover-letter/TEMPLATE.md", kind: "markdown", scope: "display", numbers: true, quotesAreForeign: true },
  {
    // The LinkedIn DISPLAY copy only — the five field families that are pasted
    // into the live profile. The rest of 70-linkedin.yaml mirrors the canonical
    // sections by name (see CLAUDE.md) and is checked by check-linkedin-sync.mjs,
    // not here.
    path: "data/profile/70-linkedin.yaml",
    kind: "yaml",
    scope: "display",
    numbers: true,
    pathRe:
      /^linkedin\.about\.lead$|^linkedin\.about\.sections\[\d+\]\.body$|^linkedin\.services\.overview$|^linkedin\.experience\[\d+\]\.positions\[\d+\]\.description$|^linkedin\.projects\[\d+\]\.description$/,
  },
  {
    glob: "data/profile/*.yaml",
    kind: "yaml",
    scope: "source",
    numbers: false,
    exclude: ["data/profile/70-linkedin.yaml"],
    pathRe: /(?:^|\.)(?:tagline|publicSummary|impactHeadline)$/,
  },
];

// ---------------------------------------------------------------------------
// Platform character caps (rule R9)
// ---------------------------------------------------------------------------
//
// LinkedIn TRUNCATES SILENTLY past these caps — the copy still looks right in
// the YAML and in the generated companion markdown, and is simply cut off on
// the live profile. Source: LinkedIn's published field limits, verified
// 2026-09-07. Change a number here and every check follows.
export const PLATFORM_LIMITS = {
  headline: 220,
  about: 2600,
  experienceDescription: 2000,
  projectDescription: 2000,
  post: 3000,
  comment: 1250,
  connectionNote: 300,
};

// Report a field as a near-miss once it is within this fraction of its cap.
export const HEADROOM_WARN = 0.1;

// Count what LinkedIn counts: CODE POINTS, not UTF-16 units. Every emoji in the
// About sections is a surrogate pair, so `.length` over-counts the About block
// by one per section — the difference between 2,446 and the true 2,441.
export const charCount = (s) => [...String(s)].length;

/**
 * The fields that have a platform cap, measured the way the platform sees them.
 * Returns `{ label, path, line, chars, cap }` per field.
 *
 * The About block is a COMPOSITE: LinkedIn has one About field, and what gets
 * pasted into it is the lead followed by each section as "<emoji> <heading>"
 * then its body, separated by blank lines — the same order and content
 * scripts/build-linkedin-md.mjs emits into linkedin/linkedin-about.md, minus
 * that file's `##` markdown headings (LinkedIn's About renders no markdown).
 */
export function platformFields(rel, source) {
  const lineOf = new Map(scanYamlFields(source).map((f) => [f.path, f.line]));
  const doc = yaml.load(source) ?? {};
  const out = [];
  const add = (label, p, value, cap) => {
    if (typeof value !== "string" || !value.trim()) return;
    out.push({ label, path: p, line: lineOf.get(p) ?? 1, chars: charCount(value), cap });
  };

  if (rel.endsWith("00-basics.yaml")) {
    add("LinkedIn headline", "basics.headline", doc.basics?.headline, PLATFORM_LIMITS.headline);
  }

  if (rel.endsWith("70-linkedin.yaml")) {
    const lk = doc.linkedin ?? {};
    const a = lk.about;
    if (a?.lead) {
      const about = [a.lead, ...(a.sections ?? []).map((s) => `${s.emoji} ${s.heading}\n${s.body}`)].join("\n\n");
      add("LinkedIn About (lead + all sections)", "linkedin.about.lead", about, PLATFORM_LIMITS.about);
    }
    (lk.experience ?? []).forEach((e, i) => {
      (e.positions ?? []).forEach((p, j) => {
        const who = `${e.company ?? e.org ?? "?"} — ${p.title ?? p.position ?? "position"}`;
        add(`LinkedIn experience: ${who}`, `linkedin.experience[${i}].positions[${j}].description`, p.description, PLATFORM_LIMITS.experienceDescription);
      });
    });
    (lk.projects ?? []).forEach((p, i) => {
      add(`LinkedIn project: ${p.name ?? "?"}`, `linkedin.projects[${i}].description`, p.description, PLATFORM_LIMITS.projectDescription);
    });
  }
  return out;
}

// Shards whose raw text is the number haystack for R8. 70-linkedin.yaml is
// excluded on purpose: it is a derivative surface itself (see CLAUDE.md — the
// LinkedIn block mirrors the canonical sections), so letting it vouch for its
// own numbers would make the rule circular.
export const HAYSTACK_GLOB = "data/profile/*.yaml";
export const HAYSTACK_EXCLUDE = ["data/profile/70-linkedin.yaml"];

export function expandSurfaces(surfaces = SURFACES) {
  const out = [];
  const seen = new Set();
  for (const s of surfaces) {
    const rels = s.path ? [s.path] : globRel(s.glob);
    for (const rel of rels) {
      if (s.exclude?.includes(rel)) continue;
      if (seen.has(rel)) continue;
      if (!fs.existsSync(path.join(repoRoot, rel))) continue;
      seen.add(rel);
      out.push({ ...s, path: rel });
    }
  }
  return out;
}

// Only the one shape the surface list needs: "dir/*.ext".
export function globRel(pattern) {
  const dir = path.posix.dirname(pattern);
  const base = path.posix.basename(pattern);
  const ext = base.startsWith("*") ? base.slice(1) : base;
  const abs = path.join(repoRoot, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(ext))
    .sort()
    .map((f) => `${dir}/${f}`);
}

export function readUtf8(rel) {
  return fs.readFileSync(path.join(repoRoot, rel), "utf8");
}

// ---------------------------------------------------------------------------
// Masking core
// ---------------------------------------------------------------------------

class Mask {
  constructor(src) {
    this.src = src;
    this.keep = new Uint8Array(src.length);
    this.prose = new Uint8Array(src.length); // inside a prose run → SOFT, else HARD
  }
  markProse(a, b) {
    for (let i = a; i < b; i++) this.prose[i] = 1;
  }
  render() {
    const out = new Array(this.src.length);
    for (let i = 0; i < this.src.length; i++) {
      const c = this.src[i];
      if (c === "\n") out[i] = "\n";
      else if (this.keep[i]) out[i] = c;
      else out[i] = this.prose[i] ? SOFT : HARD;
    }
    return out.join("");
  }
}

// ---------------------------------------------------------------------------
// Typst
// ---------------------------------------------------------------------------

const TYPST_KEYWORDS = new Set([
  "let", "set", "show", "import", "include", "if", "else", "for", "while",
  "return", "context", "break", "continue",
]);

export function maskTypst(source) {
  const src = stripComments(source);
  const m = new Mask(src);
  markMarkup(m, 0, src.length);
  return m.render();
}

// Markup mode: prose by default; `#…` hands off to code mode.
function markMarkup(m, a, b) {
  const s = m.src;
  m.markProse(a, b);
  let i = a;
  let lineStart = true;
  while (i < b) {
    const c = s[i];
    if (c === "\n") {
      m.keep[i] = 1;
      i++;
      lineStart = true;
      continue;
    }
    if (lineStart && (c === " " || c === "\t")) { i++; continue; }
    if (lineStart && (c === "=" || c === "+")) {
      // A heading (`= PROFESSIONAL SUMMARY`) is a section name, not copy;
      // a `+` opens an enumeration item. Both are structure.
      if (c === "=") { while (i < b && s[i] !== "\n") { m.prose[i] = 0; i++; } continue; }
      m.prose[i] = 0; i++; lineStart = false; continue;
    }
    if (lineStart && c === "-" && /[\s]/.test(s[i + 1] ?? " ")) {
      m.prose[i] = 0; // list marker ends the previous bullet's sentence
      i++;
      lineStart = false;
      continue;
    }
    lineStart = false;
    if (c === "\\") { i++; if (i < b) { m.keep[i] = 1; i++; } continue; }
    if (c === "#") { i = markCodeExpr(m, i, b); continue; }
    if (c === "*" || c === "_" || c === "`") { i++; continue; }
    if (c === "[") {
      const e = balanced(s, i, b);
      if (e < 0) { m.keep[i] = 1; i++; continue; }
      markMarkup(m, i + 1, e - 1);
      i = e;
      continue;
    }
    if (c === "]") { i++; continue; }
    m.keep[i] = 1;
    i++;
  }
}

// `#name(args)[content].field[…]` — args are code, content blocks are markup.
function markCodeExpr(m, at, b) {
  const s = m.src;
  const ident = /^[A-Za-z_][A-Za-z0-9_-]*/.exec(s.slice(at + 1, at + 1 + 64));
  if (!ident) return at + 1;
  let j = at + 1 + ident[0].length;
  if (TYPST_KEYWORDS.has(ident[0])) {
    const end = Math.min(consumeStatement(s, at), b);
    markCode(m, at, end);
    return end;
  }
  for (;;) {
    const dot = /^\.[A-Za-z_][A-Za-z0-9_-]*/.exec(s.slice(j, j + 64));
    if (dot) { j += dot[0].length; continue; }
    if (s[j] === "(") {
      const e = balanced(s, j, b);
      if (e < 0) break;
      markCode(m, j + 1, e - 1);
      j = e;
      continue;
    }
    if (s[j] === "[") {
      const e = balanced(s, j, b);
      if (e < 0) break;
      markMarkup(m, j + 1, e - 1);
      j = e;
      continue;
    }
    break;
  }
  return Math.min(j, b);
}

// Code mode: nothing is prose except the content blocks it contains.
function markCode(m, a, b) {
  const s = m.src;
  let i = a;
  let inString = false;
  while (i < b) {
    const c = s[i];
    if (inString) {
      if (c === "\\") { i += 2; continue; }
      if (c === '"') inString = false;
      i++;
      continue;
    }
    if (c === '"') { inString = true; i++; continue; }
    if (c === "\\") { i += 2; continue; }
    if (c === "[") {
      const e = balanced(s, i, b);
      if (e < 0) { i++; continue; }
      markMarkup(m, i + 1, e - 1);
      i = e;
      continue;
    }
    i++;
  }
}

function balanced(s, i, b) {
  try {
    const e = scanBalanced(s, i);
    return e <= b ? e : -1;
  } catch {
    return -1;
  }
}

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

export function maskMarkdown(source, { quotesAreForeign = false } = {}) {
  const m = new Mask(source);
  const s = source;
  const foreign = quotesAreForeign ? foreignQuoteRanges(s) : [];
  const lines = lineRanges(s);
  let inFence = false;
  for (const { start, end } of lines) {
    const line = s.slice(start, end);
    const fence = /^\s*(```|~~~)/.test(line);
    if (fence) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (/^\s*$/.test(line)) continue;
    // A marker (list bullet, heading, quote) is a structural boundary and must
    // end the previous sentence. A pure-indent continuation line is not — it is
    // the middle of a paragraph, and hard-breaking there would chop every
    // wrapped sentence in the file into fragments.
    const lead = /^(\s*(?:[-*+]\s+|\d+\.\s+|>\s*|#{1,6}\s+)?(?:\[[ xX]\]\s*)?)/.exec(line)[1];
    if (/^\s*$/.test(lead)) m.markProse(start, start + lead.length);
    markMarkdownProse(m, start + lead.length, end, foreign);
  }
  return m.render();
}

// Spans of "straight double quoted" text across the whole file. Used only where
// the surface declares quotesAreForeign: in the cover-letter kit a quoted run is
// either a verbatim third-party testimonial or an illustrative anti-example
// ("As a passionate and results-driven engineer…"), never Chan's own copy.
// This is what keeps EVIDENCE.md's `pivotal` testimonial off the banned-word
// report while the word stays banned in every sentence Chan writes herself.
function foreignQuoteRanges(s) {
  const out = [];
  const re = /"[^"\n]*(?:\n[ \t]*[^"\n]*)*?"/g;
  let m;
  while ((m = re.exec(s)) !== null) out.push([m.index, m.index + m[0].length]);
  return out;
}

function markMarkdownProse(m, a, b, foreign) {
  const s = m.src;
  m.markProse(a, b);
  let i = a;
  while (i < b) {
    const c = s[i];
    const quoted = foreign.find(([qa, qb]) => i >= qa && i < qb);
    if (quoted) { i = Math.min(quoted[1], b); continue; }
    if (c === "\n") { m.keep[i] = 1; i++; continue; }
    if (c === "`") {
      // Inline code — a term being NAMED, not used. `pivotal` in a sentence
      // explaining that `pivotal` is banned must not trip the banned-word rule.
      const close = s.indexOf("`", i + 1);
      const stop = close === -1 || close >= b ? b : close + 1;
      i = stop;
      continue;
    }
    if (c === "<" && s.startsWith("<!--", i)) {
      const close = s.indexOf("-->", i);
      i = close === -1 || close >= b ? b : close + 3;
      continue;
    }
    if (c === "«") {
      // A template slot is instruction, not copy.
      const close = s.indexOf("»", i);
      i = close === -1 || close >= b ? b : close + 1;
      continue;
    }
    if (c === "]" && s[i + 1] === "(") {
      // Link target: `[text](url)` keeps text, drops url.
      const e = balanced(s, i + 1, b);
      i = e < 0 ? i + 1 : e;
      continue;
    }
    if (c === "[" || c === "]" || c === "*" || c === "_") { i++; continue; }
    if (c === "\\") { i++; if (i < b) { m.keep[i] = 1; i++; } continue; }
    m.keep[i] = 1;
    i++;
  }
}

// ---------------------------------------------------------------------------
// YAML — line-oriented, so block scalars keep their exact line numbers, and
// PATH-aware, so a rule can distinguish the LinkedIn description a recruiter
// reads from the one that merely mirrors an award.
// ---------------------------------------------------------------------------

/**
 * Every scalar field in a profile shard, as
 * `{ path, key, line, valueStart, valueEnd }`.
 *
 * `path` is dotted with bracketed sequence indices, matching the shape a
 * js-yaml consumer would walk: `linkedin.about.sections[3].body`,
 * `projects[17].narrative.impactHeadline`.
 *
 * Block-scalar bodies are consumed as a unit rather than re-scanned line by
 * line. That is not an optimisation either: a body line like
 * "Production-rigorous: load tests, zero-downtime migrations" parses as a
 * mapping key under any line-at-a-time reader, and would corrupt the path
 * stack for everything below it.
 */
export function scanYamlFields(source) {
  const s = source;
  const lines = lineRanges(s);
  const stack = []; // { indent, seg, seqIndex }
  const out = [];

  const pathOf = () =>
    stack.reduce((acc, f) => (f.seg.startsWith("[") ? acc + f.seg : acc ? `${acc}.${f.seg}` : f.seg), "");

  for (let li = 0; li < lines.length; li++) {
    const { start, end } = lines[li];
    const raw = s.slice(start, end).replace(/\r$/, "");
    if (/^\s*(?:#|$)/.test(raw)) continue;

    let col = /^ */.exec(raw)[0].length;
    let rest = raw.slice(col);

    // One or more sequence dashes may open the line: "- id: x", "- - nested".
    while (/^-(?:\s|$)/.test(rest)) {
      while (stack.length && stack[stack.length - 1].indent >= col) stack.pop();
      const parent = stack[stack.length - 1];
      const idx = parent ? (parent.seqIndex = (parent.seqIndex ?? -1) + 1) : 0;
      stack.push({ indent: col, seg: `[${idx}]` });
      const adv = /^-\s*/.exec(rest)[0].length;
      col += adv;
      rest = rest.slice(adv);
      if (!rest) break;
    }
    if (!rest) continue;

    const km = /^([A-Za-z_][A-Za-z0-9_-]*)\s*:(?:\s|$)/.exec(rest);
    if (!km) continue;
    while (stack.length && stack[stack.length - 1].indent >= col) stack.pop();
    stack.push({ indent: col, seg: km[1] });

    const afterColon = col + rest.indexOf(":") + 1;
    const value = raw.slice(afterColon);
    const lead = /^\s*/.exec(value)[0].length;
    const trimmed = value.trim();

    if (/^[|>][-+0-9]*$/.test(trimmed)) {
      let j = li + 1;
      const bodyStart = lines[j]?.start ?? end;
      let bodyEnd = bodyStart;
      for (; j < lines.length; j++) {
        const l = s.slice(lines[j].start, lines[j].end);
        if (/^\s*$/.test(l)) { bodyEnd = lines[j].end; continue; }
        if (/^\s*/.exec(l)[0].length <= col) break;
        bodyEnd = lines[j].end;
      }
      out.push({ path: pathOf(), key: km[1], line: li + 2, valueStart: bodyStart, valueEnd: bodyEnd });
      li = j - 1;
      stack.pop(); // a block scalar has no children
      continue;
    }
    if (trimmed === "" || trimmed.startsWith("#")) continue; // nested mapping follows

    out.push({
      path: pathOf(),
      key: km[1],
      line: li + 1,
      valueStart: start + afterColon + lead,
      valueEnd: end,
    });
    stack.pop(); // an inline scalar has no children
  }
  return out;
}

export function maskYaml(source, pathRe) {
  const m = new Mask(source);
  for (const f of scanYamlFields(source)) {
    if (!pathRe.test(f.path)) continue;
    markYamlProse(m, f.valueStart, f.valueEnd);
  }
  return m.render();
}

function markYamlProse(m, a, b) {
  const s = m.src;
  m.markProse(a, b);
  let i = a;
  let lineStart = true;
  while (i < b) {
    const c = s[i];
    if (c === "\n") { m.keep[i] = 1; i++; lineStart = true; continue; }
    if (lineStart && (c === " " || c === "\t")) { i++; continue; } // indent → SOFT
    if (lineStart && (c === "-" || c === "*") && /\s/.test(s[i + 1] ?? " ")) {
      m.prose[i] = 0; i++; lineStart = false; continue;
    }
    lineStart = false;
    if (c === "\r") { i++; continue; }
    if (c === "`" || c === "*" || c === "_") { i++; continue; }
    if (c === '"' || c === "'") {
      // Quoted scalar delimiters at the very edges of the value.
      const isEdge = i === a || i === b - 1 || i === b - 2;
      if (isEdge) { i++; continue; }
      m.keep[i] = 1; i++; continue;
    }
    if (c === "]" && s[i + 1] === "(") {
      const e = balanced(s, i + 1, b);
      i = e < 0 ? i + 1 : e;
      continue;
    }
    if (c === "[" || c === "]") { i++; continue; }
    m.keep[i] = 1;
    i++;
  }
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export function lineRanges(s) {
  const out = [];
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\n") { out.push({ start, end: i }); start = i + 1; }
  }
  out.push({ start, end: s.length });
  return out;
}

export function lineIndex(s) {
  // offset → 1-indexed line, via prefix scan built once per file.
  const starts = [0];
  for (let i = 0; i < s.length; i++) if (s[i] === "\n") starts.push(i + 1);
  return (offset) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

export function maskFor(surface, source) {
  if (surface.kind === "typst") return maskTypst(source);
  if (surface.kind === "markdown") return maskMarkdown(source, surface);
  if (surface.kind === "yaml") return maskYaml(source, surface.pathRe);
  throw new Error(`Unknown surface kind: ${surface.kind}`);
}

// Characters these surfaces use to start a new item inside one typographic
// run: the CV's interpunct and pipe, and the bullet the LinkedIn copy uses
// because LinkedIn strips real list markup. Each one ends a sentence. Without
// them the "Also built:" closer and a six-bullet LinkedIn description each read
// as a single 90-word sentence, and the run-on rule would be reporting a layout
// convention rather than a fault.
const SEPARATORS = new Set(["·", "|", "•"]);

/**
 * Split masked text into sentences carrying their source offset.
 *
 * Boundaries: `.`/`!`/`?` before whitespace, a HARD mask run, a blank line, and
 * any SEPARATORS character.
 */
export function splitSentences(masked) {
  const out = [];
  const n = masked.length;
  let i = 0;
  const isSep = (c) => c === HARD || c === SOFT || /\s/.test(c) || SEPARATORS.has(c);
  while (i < n) {
    while (i < n && isSep(masked[i])) i++;
    if (i >= n) break;
    const start = i;
    let end = n;
    let j = i;
    while (j < n) {
      const c = masked[j];
      if (c === HARD || SEPARATORS.has(c)) { end = j; break; }
      if (c === "\n") {
        let k = j;
        let nl = 0;
        while (k < n && (masked[k] === SOFT || /\s/.test(masked[k]))) {
          if (masked[k] === "\n") nl++;
          k++;
        }
        if (nl >= 2) { end = j; break; }
        j = k;
        continue;
      }
      if (c === "." || c === "!" || c === "?") {
        let k = j + 1;
        while (k < n && (masked[k] === SOFT || masked[k] === '"' || masked[k] === ")")) k++;
        if (k >= n || /\s/.test(masked[k]) || masked[k] === HARD) { end = k; break; }
      }
      j++;
    }
    const text = flatten(masked.slice(start, end));
    if (text) out.push({ start, end, text });
    i = end === start ? start + 1 : end;
  }
  return out;
}

export function flatten(chunk) {
  return chunk
    .replace(/[\u0000\u0001]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
