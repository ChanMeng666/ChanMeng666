// Parse cv/chan-meng-cv-ats.typ into a plain data model, so the .docx and .txt
// exports can be GENERATED from the same file that compiles to the ATS PDF.
//
// WHY A PARSER AND NOT A SECOND COPY
// The ATS resume's copy deliberately differs from both the designed CV and the
// profile shards (CLAUDE.md, "Facts live in FOUR places" — this file is place
// #4). Hand-maintaining a second copy for Word would make it place #5 and it
// would drift within a month. So the .typ stays the single source and everything
// else is derived. cv/exports/chan-meng-cv-ats.{docx,txt} are OUTPUTS.
//
// WHY AN ORDERED SCANNER AND NOT A SET OF REGEXES
// The scanner walks the comment-stripped source left to right, trying an ordered
// list of recognisers at each position. Two properties fall out of that, and
// they are the entire reason for the design:
//
//   1. Document order is preserved for free — including the "Earlier experience"
//      sub-label that sits between role 6 and role 7. A per-construct matchAll()
//      would lose it.
//   2. Coverage is PROVABLE. If no recogniser matches at a position holding
//      non-whitespace, the parser THROWS with a line number and an excerpt. A
//      construct added to the .typ can therefore never be silently dropped from
//      the Word file while still appearing in the PDF — which is the one failure
//      mode that would be invisible until a recruiter noticed a missing job.
//
// The same reasoning drives the EXPECT counts below: a guard that silently
// parses zero entries is worse than no guard (see the identical note in
// scripts/check-cv-sync.mjs).
//
// RELATIONSHIP TO scripts/check-cv-sync.mjs
// That file parses the SAME role-line(...) calls out of the SAME source with a
// regex pair, to check dates against 10-career.yaml. It is deliberately NOT
// comment-aware; this parser is. They agree today, and EXPECT.roles below makes
// a divergence loud on this side. Do not "unify" them in a change that also
// ships new behaviour — check-cv-sync gates PRs.

import fs from "node:fs";
import {
  stripComments, scanBalanced, callBodies, stringArg, stringLiterals,
  nextContentBlock, contentBlocks, consumeStatement, lineOf,
} from "./typst-ast.mjs";

// ---------------------------------------------------------------------------
// Expected shape. Every number here is a fact about cv/chan-meng-cv-ats.typ as
// it stands. Changing the resume's structure means editing this list ON PURPOSE
// — that is the point, not an inconvenience.
// ---------------------------------------------------------------------------

export const EXPECT = {
  // Asserted in order and by exact string. This automates cv/README.md's
  // "only section names a parser's lexicon knows" rule, which until now was
  // prose nobody could run.
  headings: [
    "PROFESSIONAL SUMMARY",
    "TECHNICAL SKILLS",
    "PROFESSIONAL EXPERIENCE",
    "PROJECTS",
    "EDUCATION",
    "CERTIFICATIONS",
    "AWARDS AND RECOGNITION",
  ],
  roles: 10,
  rolesWithBullets: 7,
  rolesCompact: 3,
  skillsLines: { "TECHNICAL SKILLS": 5, CERTIFICATIONS: 2 },
  // 4 since Sep 2026: echook was promoted out of the "Also built" line into a
  // full entry, mirroring the designed CV's fourth project card — so the link
  // count below went down by one as this one went up.
  projects: 4,
  alsoBuiltLinks: 4,
  education: 2,
  awards: 3,
  contactLines: 2,
  // 6800 sits just under the 7,185 chars pdftotext recovers from the committed
  // PDF; maxChars catches a delimiter-scanner bug that swallows the rest of the
  // file into one fragment.
  minChars: 6800,
  maxChars: 9000,
};

// Anything matching these in the FLATTENED OUTPUT TEXT means markup leaked
// through the evaluator. Note `/` alone is NOT banned — "AI/ML" and "CI/CD" are
// legitimate content.
const LEAKS = [
  [/[#[\]\\]/, "unprocessed Typst markup"],
  [/\/\//, "leaked comment or protocol-relative URL"],
  [/\b(strong|link|text|box|linebreak|underline)\s*\(/, "leaked Typst function call"],
  [/ /, "non-breaking space (use a plain space)"],
  [/\bgap-(section|rule|entry|intra|line|compact)\b/, "leaked spacing token"],
];

const DATE_RANGE = /^[A-Z][a-z]{2} \d{4} - (?:[A-Z][a-z]{2} \d{4}|Present)$/;

class AtsParseError extends Error {}

// ---------------------------------------------------------------------------
// Inline markup → Fragment[]
//
//   Fragment = { text, bold?: true, href?: string }
//   plus an internal { break: true } marker, resolved into lines by the caller.
//
// The grammar is CLOSED: anything not listed throws. That is deliberate — a new
// inline construct in the .typ must be taught to this evaluator rather than
// silently rendering as nothing.
// ---------------------------------------------------------------------------

function unescapeString(s) {
  return s.replace(/\\(.)/g, "$1");
}

function makeFragment(text, ctx) {
  const f = { text };
  if (ctx.bold) f.bold = true;
  if (ctx.href) f.href = ctx.href;
  return f;
}

// Applied to MARKUP text only — never to string-literal contents, where a
// backslash is already literal and a dash is part of a URL.
function normaliseText(s) {
  return s
    .replace(/---/g, "—")
    .replace(/--/g, "–")
    .replace(/\s+/g, " ");
}

/**
 * Evaluate ONE call expression at `i` (which points at the identifier, not at a
 * leading `#`). Returns {frags, end}.
 */
function evalCall(src, i, ctx, where) {
  const m = /^([A-Za-z][\w-]*)\s*([([])/.exec(src.slice(i));
  if (!m) throw new AtsParseError(`${where}: expected a call at offset ${i}, found ${JSON.stringify(src.slice(i, i + 40))}`);
  const name = m[1];
  const openAt = i + m[0].length - 1;

  // `#strong[...]` form: content block directly, no parens.
  if (m[2] === "[") {
    const end = scanBalanced(src, openAt);
    const inner = src.slice(openAt + 1, end - 1);
    if (name !== "strong" && name !== "emph") {
      throw new AtsParseError(`${where}: unhandled bracket-form call ${name}[…]`);
    }
    return { frags: evalMarkup(inner, { ...ctx, bold: true }, where), end };
  }

  const end = scanBalanced(src, openAt);
  const args = src.slice(openAt + 1, end - 1);
  let cursor = end;

  switch (name) {
    case "text": {
      const bold = /weight\s*:\s*"(bold|semibold|black)"/.test(args);
      const blk = nextContentBlock(src, cursor);
      if (!blk) throw new AtsParseError(`${where}: text(…) with no [content] block`);
      return { frags: evalMarkup(blk.inner, { ...ctx, bold: ctx.bold || bold }, where), end: blk.end };
    }
    case "strong": {
      const lits = stringLiterals(args);
      if (/^\s*"/.test(args) && lits.length === 1) {
        return { frags: [makeFragment(normaliseText(unescapeString(lits[0])), { ...ctx, bold: true })], end };
      }
      return { frags: evalCode(args, { ...ctx, bold: true }, where), end };
    }
    case "link": {
      const lits = stringLiterals(args);
      if (lits.length === 0) throw new AtsParseError(`${where}: link(…) with no target string`);
      const href = lits[0];
      const blk = nextContentBlock(src, cursor);
      if (blk) {
        return { frags: evalMarkup(blk.inner, { ...ctx, href }, where), end: blk.end };
      }
      if (lits.length > 1) {
        return { frags: [makeFragment(normaliseText(unescapeString(lits[1])), { ...ctx, href })], end };
      }
      // link("https://x") with no label renders the URL itself.
      return { frags: [makeFragment(href, { ...ctx, href })], end };
    }
    case "linebreak":
      return { frags: [{ break: true }], end };
    case "v":
    case "h":
    case "hrule":
      return { frags: [], end }; // pure spacing / decoration, contributes no text
    default:
      throw new AtsParseError(`${where}: unhandled Typst call ${name}(…) at offset ${i}`);
  }
}

/** Evaluate a `{ … }` code body: a sequence of call expressions and [markup]. */
function evalCode(code, ctx, where) {
  const out = [];
  let i = 0;
  while (i < code.length) {
    const c = code[i];
    if (/\s/.test(c) || c === ";" || c === ",") { i++; continue; }
    if (c === "[") {
      const end = scanBalanced(code, i);
      out.push(...evalMarkup(code.slice(i + 1, end - 1), ctx, where));
      i = end;
      continue;
    }
    // A bare string in a code body would render as text in Typst but carries no
    // markup, so it is almost certainly a mistake. Refuse rather than guess.
    if (c === '"') {
      throw new AtsParseError(`${where}: bare string literal in a code body at offset ${i} — wrap it in a call or [markup] block.`);
    }
    const { frags, end } = evalCall(code, i, ctx, where);
    out.push(...frags);
    i = end;
  }
  return out;
}

/** Evaluate a `[ … ]` markup body. */
function evalMarkup(markup, ctx, where) {
  const out = [];
  let buf = "";
  let i = 0;
  const flush = () => {
    if (buf) { out.push(makeFragment(normaliseText(buf), ctx)); buf = ""; }
  };
  while (i < markup.length) {
    const c = markup[i];
    // Escapes first, so `\~` stays a literal tilde while a bare `~` becomes a
    // space (a Typst non-breaking space; U+00A0 in a paste box is hostile).
    if (c === "\\") { buf += markup[i + 1] ?? ""; i += 2; continue; }
    if (c === "~") { buf += " "; i++; continue; }
    if (c === "#") {
      flush();
      const { frags, end } = evalCall(markup, i + 1, ctx, where);
      out.push(...frags);
      i = end;
      continue;
    }
    buf += c;
    i++;
  }
  flush();
  return out;
}

/** Split a fragment run on {break:true} markers into lines. */
function splitLines(frags) {
  const lines = [[]];
  for (const f of frags) {
    if (f.break) { lines.push([]); continue; }
    lines[lines.length - 1].push(f);
  }
  return lines.map(trimRun).filter((l) => l.length > 0);
}

/** Trim leading/trailing whitespace across a fragment run. */
function trimRun(frags) {
  const out = frags.map((f) => ({ ...f }));
  if (out.length) out[0].text = out[0].text.replace(/^\s+/, "");
  if (out.length) out[out.length - 1].text = out[out.length - 1].text.replace(/\s+$/, "");
  return out.filter((f) => f.text !== "");
}

export function fragsToText(frags) {
  return frags.map((f) => (f.break ? "\n" : f.text)).join("");
}

// ---------------------------------------------------------------------------
// The scanner
// ---------------------------------------------------------------------------

export function parseAtsResume(rawSrc, { file = "cv/chan-meng-cv-ats.typ" } = {}) {
  const src = stripComments(rawSrc);
  const at = (off) => `${file}:${lineOf(rawSrc, off)}`;

  const model = {
    docTitle: null,
    docAuthor: null,
    documentDate: null,
    identity: { name: null, tagline: null, contactLines: [] },
    sections: [],
  };
  let section = null;

  const push = (block, off) => {
    if (!section) {
      throw new AtsParseError(`${at(off)}: content block before the first "= HEADING" — the identity block is the only thing allowed there.`);
    }
    section.blocks.push(block);
  };

  let i = 0;
  while (i < src.length) {
    if (/\s/.test(src[i])) { i++; continue; }

    // ── = SECTION HEADING ───────────────────────────────────────────────────
    if (src[i] === "=" && (i === 0 || src[i - 1] === "\n") && src[i + 1] === " ") {
      const nl = src.indexOf("\n", i);
      const stop = nl === -1 ? src.length : nl;
      section = { heading: src.slice(i + 2, stop).trim(), blocks: [] };
      model.sections.push(section);
      i = stop + 1;
      continue;
    }

    // ── #call(...) ──────────────────────────────────────────────────────────
    if (src[i] === "#") {
      const m = /^#([A-Za-z][\w-]*)/.exec(src.slice(i));
      if (!m) throw new AtsParseError(`${at(i)}: a "#" that starts no identifier: ${JSON.stringify(src.slice(i, i + 60))}`);
      const name = m[1];
      const nameEnd = i + m[0].length;

      // Preamble statements contribute no content — but #set document(...) is
      // where the title, author and PINNED DATE live, and the date is reused
      // verbatim for the .docx core properties so it stays one fact in one file.
      if (name === "import" || name === "set" || name === "show") {
        if (name === "set" && /^#set\s+document\s*\(/.test(src.slice(i))) {
          const openAt = src.indexOf("(", i);
          const end = scanBalanced(src, openAt);
          const body = src.slice(openAt + 1, end - 1);
          model.docTitle = stringArg(body, "title");
          model.docAuthor = stringArg(body, "author");
          const d = /datetime\s*\(\s*year:\s*(\d{4})\s*,\s*month:\s*(\d{1,2})\s*,\s*day:\s*(\d{1,2})\s*\)/.exec(body);
          if (d) {
            model.documentDate = `${d[1]}-${String(d[2]).padStart(2, "0")}-${String(d[3]).padStart(2, "0")}`;
          }
        }
        i = consumeStatement(src, i);
        continue;
      }

      if (name === "hrule") { i = scanBalanced(src, nameEnd); continue; }

      // ── #block(...) — four known sites, each recognised explicitly ─────────
      if (name === "block") {
        const end = scanBalanced(src, nameEnd);
        const args = src.slice(nameEnd + 1, end - 1);
        const braceAt = findTopLevel(args, "{");
        if (braceAt === -1) throw new AtsParseError(`${at(i)}: #block(...) with no { code body }`);
        const codeEnd = scanBalanced(args, braceAt);
        const code = args.slice(braceAt + 1, codeEnd - 1);
        const where = at(i);

        if (/text\s*\(\s*size:\s*17pt/.test(code)) {
          const lines = splitLines(evalCode(code, {}, where));
          if (lines.length !== 2) throw new AtsParseError(`${where}: identity block produced ${lines.length} lines, expected 2 (name, tagline)`);
          model.identity.name = fragsToText(lines[0]);
          model.identity.tagline = fragsToText(lines[1]);
        } else if (/link\s*\(\s*"mailto:/.test(code)) {
          model.identity.contactLines = splitLines(evalCode(code, {}, where));
        } else if (/^\s*strong\s*\(\s*"(?:[^"\\]|\\.)*"\s*\)\s*$/.test(code)) {
          push({ type: "subhead", text: fragsToText(evalCode(code, {}, where)) }, i);
        } else if (/strong\s*\(\s*"Also built/.test(code)) {
          push({ type: "para", frags: trimRun(evalCode(code, {}, where)) }, i);
        } else {
          throw new AtsParseError(`${where}: unrecognised #block(...) site. Add a recogniser in scripts/lib/parse-ats-resume.mjs — do NOT let it fall through, or its text vanishes from the .docx while staying in the PDF.`);
        }
        i = end;
        continue;
      }

      // ── #skills-line("label", (items…)) ───────────────────────────────────
      if (name === "skills-line") {
        const end = scanBalanced(src, nameEnd);
        const lits = stringLiterals(src.slice(nameEnd + 1, end - 1)).map(unescapeString);
        if (lits.length < 2) throw new AtsParseError(`${at(i)}: skills-line with ${lits.length} strings, expected a label plus items`);
        push({ type: "labelled", label: lits[0], items: lits.slice(1) }, i);
        i = end;
        continue;
      }

      // ── #role-line(...) / #extra-role(...) ────────────────────────────────
      // BOTH names. extra-role is exported by ats-components.typ and renders
      // identically; a parser that only knew role-line would silently drop the
      // first job that used it.
      if (name === "role-line" || name === "extra-role") {
        const end = scanBalanced(src, nameEnd);
        const body = src.slice(nameEnd + 1, end - 1);
        const where = at(i);
        let bullets = [];
        const bm = /bullets\s*:\s*\(/.exec(body);
        if (bm) {
          const openAt = bm.index + bm[0].length - 1;
          const inner = body.slice(openAt + 1, scanBalanced(body, openAt) - 1);
          bullets = contentBlocks(inner).map((b) => trimRun(evalMarkup(b, {}, where)));
        }
        push({
          type: "role",
          title: unescapeString(stringArg(body, "title") ?? ""),
          org: unescapeString(stringArg(body, "org") ?? ""),
          orgUrl: stringArg(body, "org-url") ?? "",
          dates: unescapeString(stringArg(body, "dates") ?? ""),
          location: unescapeString(stringArg(body, "location") ?? ""),
          arrangement: unescapeString(stringArg(body, "arrangement") ?? ""),
          compact: /compact\s*:\s*true/.test(body),
          bullets,
        }, i);
        i = end;
        continue;
      }

      // ── #project-entry(name:, url:, target:)[body] ────────────────────────
      if (name === "project-entry") {
        const end = scanBalanced(src, nameEnd);
        const body = src.slice(nameEnd + 1, end - 1);
        const blk = nextContentBlock(src, end);
        if (!blk) throw new AtsParseError(`${at(i)}: project-entry(...) with no [body] block`);
        push({
          type: "project",
          name: unescapeString(stringArg(body, "name") ?? ""),
          url: unescapeString(stringArg(body, "url") ?? ""),
          target: stringArg(body, "target") ?? "",
          body: trimRun(evalMarkup(blk.inner, {}, at(i))),
        }, i);
        i = blk.end;
        continue;
      }

      // ── #education-entry(...) ─────────────────────────────────────────────
      if (name === "education-entry") {
        const end = scanBalanced(src, nameEnd);
        const body = src.slice(nameEnd + 1, end - 1);
        push({
          type: "education",
          degree: unescapeString(stringArg(body, "degree") ?? ""),
          school: unescapeString(stringArg(body, "school") ?? ""),
          schoolUrl: stringArg(body, "school-url") ?? "",
          dates: unescapeString(stringArg(body, "dates") ?? ""),
          note: unescapeString(stringArg(body, "note") ?? ""),
        }, i);
        i = end;
        continue;
      }

      throw new AtsParseError(`${at(i)}: unrecognised top-level call #${name}(...). Teach it to scripts/lib/parse-ats-resume.mjs, or its content will be missing from the .docx and .txt while still appearing in the PDF.`);
    }

    // ── "- " list ───────────────────────────────────────────────────────────
    if (src[i] === "-" && src[i + 1] === " " && (i === 0 || src[i - 1] === "\n")) {
      const items = [];
      while (i < src.length && src[i] === "-" && src[i + 1] === " ") {
        let j = i + 2;
        // An item runs to the next line that starts a new item or is blank.
        for (;;) {
          const nl = src.indexOf("\n", j);
          if (nl === -1) { j = src.length; break; }
          const nextLine = src.slice(nl + 1, src.indexOf("\n", nl + 1) === -1 ? src.length : src.indexOf("\n", nl + 1));
          if (nextLine.trim() === "" || /^-\s/.test(nextLine.trim()) || /^[=#]/.test(nextLine.trim())) { j = nl; break; }
          j = nl + 1;
        }
        items.push(trimRun(evalMarkup(src.slice(i + 2, j), {}, at(i))));
        while (j < src.length && /\s/.test(src[j])) j++;
        i = j;
      }
      push({ type: "list", items }, i);
      continue;
    }

    // ── free paragraph ──────────────────────────────────────────────────────
    const blank = src.indexOf("\n\n", i);
    const stop = blank === -1 ? src.length : blank;
    const text = src.slice(i, stop);
    if (text.trim() === "") { i = stop + 1; continue; }
    push({ type: "para", frags: trimRun(evalMarkup(text, {}, at(i))) }, i);
    i = stop + 1;
  }

  assertModel(model, file);
  return model;
}

/** Index of the first `ch` at delimiter depth 0 in `s`, or -1. */
function findTopLevel(s, ch) {
  let i = 0;
  let inString = false;
  let depth = 0;
  while (i < s.length) {
    const c = s[i];
    if (inString) {
      if (c === "\\") { i += 2; continue; }
      if (c === '"') inString = false;
      i++;
      continue;
    }
    if (c === '"') { inString = true; i++; continue; }
    if (c === ch && depth === 0) return i;
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") depth--;
    i++;
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Guards. Every one throws — none warn. A .docx that is quietly missing a job
// is worse than a build that fails.
// ---------------------------------------------------------------------------

function assertModel(model, file) {
  const fail = (msg) => { throw new AtsParseError(`${file}: ${msg}`); };

  if (!model.docTitle) fail('#set document(title: "…") not found');
  if (!model.docAuthor) fail('#set document(author: "…") not found');
  if (!model.documentDate) {
    fail('#set document(date: datetime(year:, month:, day:)) not found. The date must be PINNED, not `auto` and not `none` — a dateless PDF trips legacy resume parsers, and the .docx core properties reuse this value.');
  }

  const headings = model.sections.map((s) => s.heading);
  if (headings.length !== EXPECT.headings.length || headings.some((h, n) => h !== EXPECT.headings[n])) {
    fail(`section headings changed.\n  expected: ${EXPECT.headings.join(" / ")}\n  found:    ${headings.join(" / ")}\nOnly section names an ATS lexicon knows belong here (cv/README.md, "ATS variant — hard rules").`);
  }

  if (!model.identity.name) fail("identity block produced no name");
  if (!model.identity.tagline) fail("identity block produced no tagline");
  if (model.identity.contactLines.length !== EXPECT.contactLines) {
    fail(`${model.identity.contactLines.length} contact line(s), expected ${EXPECT.contactLines}`);
  }
  const contactHrefs = model.identity.contactLines.flat().map((f) => f.href).filter(Boolean);
  const count = (re) => contactHrefs.filter((h) => re.test(h)).length;
  if (count(/^mailto:/) !== 1) fail(`${count(/^mailto:/)} mailto: link(s) in the contact block, expected 1`);
  if (count(/^tel:/) !== 1) fail(`${count(/^tel:/)} tel: link(s) in the contact block, expected 1`);
  if (count(/^https:\/\//) !== 3) fail(`${count(/^https:\/\//)} https link(s) in the contact block, expected 3`);

  const blocks = model.sections.flatMap((s) => s.blocks.map((b) => ({ ...b, section: s.heading })));
  const roles = blocks.filter((b) => b.type === "role");
  const projects = blocks.filter((b) => b.type === "project");
  const education = blocks.filter((b) => b.type === "education");
  const lists = blocks.filter((b) => b.type === "list");

  if (roles.length !== EXPECT.roles) fail(`${roles.length} role(s), expected ${EXPECT.roles}`);
  const withBullets = roles.filter((r) => r.bullets.length > 0).length;
  const compact = roles.filter((r) => r.compact).length;
  if (withBullets !== EXPECT.rolesWithBullets) fail(`${withBullets} role(s) with bullets, expected ${EXPECT.rolesWithBullets}`);
  if (compact !== EXPECT.rolesCompact) fail(`${compact} compact role(s), expected ${EXPECT.rolesCompact}`);
  for (const r of roles) {
    if (!r.title || !r.org || !r.dates) fail(`role "${r.title || r.org || "?"}" is missing title, org or dates`);
    if (!DATE_RANGE.test(r.dates)) {
      fail(`role "${r.title}" has dates "${r.dates}" — must be 3-letter months, e.g. "Mar 2025 - Feb 2026" or "May 2026 - Present" (cv/README.md hard rule; scripts/check-cv-sync.mjs derives the same shape).`);
    }
  }

  for (const [heading, n] of Object.entries(EXPECT.skillsLines)) {
    const got = blocks.filter((b) => b.type === "labelled" && b.section === heading).length;
    if (got !== n) fail(`${got} skills-line(s) under ${heading}, expected ${n}`);
  }

  if (projects.length !== EXPECT.projects) fail(`${projects.length} project(s), expected ${EXPECT.projects}`);
  for (const p of projects) if (!p.name) fail("a project-entry has no name");

  const alsoBuilt = blocks.find((b) => b.type === "para" && b.frags.some((f) => /^Also built/.test(f.text)));
  if (!alsoBuilt) fail('the "Also built:" block was not found');
  const alsoLinks = alsoBuilt.frags.filter((f) => f.href).length;
  if (alsoLinks !== EXPECT.alsoBuiltLinks) fail(`${alsoLinks} link(s) in the "Also built" block, expected ${EXPECT.alsoBuiltLinks}`);

  if (education.length !== EXPECT.education) fail(`${education.length} education entry/entries, expected ${EXPECT.education}`);
  for (const e of education) if (!e.degree || !e.school) fail("an education-entry is missing degree or school");

  const awards = lists.find((b) => b.section === "AWARDS AND RECOGNITION");
  if (!awards || awards.items.length !== EXPECT.awards) {
    fail(`${awards ? awards.items.length : 0} award bullet(s), expected ${EXPECT.awards}`);
  }

  // Output-text hygiene, over everything that will reach the reader.
  const flat = flattenAll(model);
  for (const [re, why] of LEAKS) {
    const m = re.exec(flat);
    if (m) {
      const from = Math.max(0, m.index - 30);
      fail(`${why} in the extracted text near …${flat.slice(from, m.index + 30)}…`);
    }
  }
  if (flat.length < EXPECT.minChars) fail(`extracted text is ${flat.length} chars, expected at least ${EXPECT.minChars} — something was dropped.`);
  if (flat.length > EXPECT.maxChars) fail(`extracted text is ${flat.length} chars, expected at most ${EXPECT.maxChars} — something was duplicated.`);
}

/** Every piece of reader-visible text in the model, newline-joined. */
export function flattenAll(model) {
  const out = [model.identity.name, model.identity.tagline];
  for (const l of model.identity.contactLines) out.push(fragsToText(l));
  for (const s of model.sections) {
    out.push(s.heading);
    for (const b of s.blocks) {
      switch (b.type) {
        case "para": out.push(fragsToText(b.frags)); break;
        case "subhead": out.push(b.text); break;
        case "labelled": out.push(`${b.label}: ${b.items.join(", ")}`); break;
        case "role":
          out.push(b.title, [b.org, b.location, b.arrangement, b.dates].filter(Boolean).join(" | "));
          for (const bu of b.bullets) out.push(fragsToText(bu));
          break;
        case "project":
          out.push([b.name, b.url].filter(Boolean).join(" | "), fragsToText(b.body));
          break;
        case "education":
          out.push([`${b.degree}, ${b.school}`, b.dates, b.note].filter(Boolean).join(" | "));
          break;
        case "list": for (const it of b.items) out.push(fragsToText(it)); break;
        default: throw new AtsParseError(`flattenAll: unhandled block type ${b.type}`);
      }
    }
  }
  return out.filter(Boolean).join("\n");
}

export function parseAtsResumeFile(path) {
  return parseAtsResume(fs.readFileSync(path, "utf8"), { file: path.replace(/\\/g, "/") });
}
