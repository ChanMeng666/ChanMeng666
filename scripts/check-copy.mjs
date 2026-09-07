#!/usr/bin/env node
// Career-copy linter — the prose gate.
//
// The repo already gates STRUCTURE: check-cv-sync.mjs pins the CV's anchor facts
// to 10-career.yaml, parse-ats-resume.mjs asserts the ATS resume's exact shape,
// check-linkedin-sync.mjs maps the LinkedIn block back to the canonical
// sections, check-freshness.mjs keeps hand-typed facts on a review cadence.
// Nothing reads the PROSE. This does.
//
// It lints only what a human wrote to be read: bullets, summaries, context
// lines, narrative fields. Typst comments are stripped first (they document
// removed copy and would otherwise be a false-positive factory), string
// literals holding skill pills and URLs are not prose, and third-party quotes
// are somebody else's words.
//
// Eight rules, two severities. Two are ERROR class and are meant to gate a PR:
//
//   R1 banned-word        — the blacklist is parsed OUT of cv/README.md at
//                           runtime, so the list has exactly one home.
//   R8 number-not-in-shard — every claim-shaped number on a derivative surface
//                           must also exist in data/profile/*.yaml. This catches
//                           an invented number AND a number left stale on the CV
//                           after the shard moved on.
//
// The six WARN rules encode the repo's own editorial discipline, most of it
// written down in cv/cover-letter/EVIDENCE.md and cv/sections/*.typ comments:
// no superlative you cannot enumerate, no strength word without a scope, no
// metric without a basis, no team result claimed as personal, outcomes not
// duties, and one idea per sentence.
//
// Usage:
//   node scripts/check-copy.mjs              # report; exit 0 unless --strict
//   node scripts/check-copy.mjs --strict     # exit 1 on any error-class finding
//   node scripts/check-copy.mjs --rule R8    # one rule
//   node scripts/check-copy.mjs --surface cv # surfaces whose path contains "cv"
//
// Suppression: a `copy-lint-ok:<ruleId>` marker in a Typst `//` comment or an
// HTML comment silences that rule for the NEXT line (or its own line). The
// summary always reports how many are active and names any that no longer
// match anything, so they cannot pile up unseen.

import {
  SURFACES,
  HAYSTACK_GLOB,
  HAYSTACK_EXCLUDE,
  expandSurfaces,
  globRel,
  readUtf8,
  maskFor,
  splitSentences,
  lineIndex,
} from "./lib/copy-surfaces.mjs";
import { loadProfile } from "./lib/load-profile.mjs";

const argv = process.argv.slice(2);
const STRICT = argv.includes("--strict");
const ONLY_RULE = argValue("--rule");
const ONLY_SURFACE = argValue("--surface");

function argValue(flag) {
  const i = argv.indexOf(flag);
  if (i === -1) return null;
  const v = argv[i + 1];
  return v && !v.startsWith("--") ? v : null;
}

// ---------------------------------------------------------------------------
// R1 — the blacklist, parsed out of cv/README.md
// ---------------------------------------------------------------------------

const BLACKLIST_HEADING = "## Word blacklist (strip before compile)";

function loadBannedTerms() {
  const src = readUtf8("cv/README.md");
  const at = src.indexOf(BLACKLIST_HEADING);
  if (at === -1) {
    fail(
      `cv/README.md no longer contains the heading "${BLACKLIST_HEADING}" — ` +
        `the banned-word list has moved and R1 would silently check nothing.`
    );
  }
  const rest = src.slice(at + BLACKLIST_HEADING.length);
  const end = rest.search(/\n## /);
  const section = end === -1 ? rest : rest.slice(0, end);

  const terms = [];
  for (const line of section.split("\n")) {
    if (!/^\s*[-*]\s/.test(line)) continue;
    // "(use `agentic engineer` / `context engineer`)" names the REPLACEMENTS,
    // not more banned words — drop it before harvesting backticked terms.
    const body = line.replace(/\((?:use|prefer)\b[^)]*\)/gi, " ");
    for (const m of body.matchAll(/`([^`]+)`/g)) {
      const term = m[1].trim();
      if (term) terms.push(term);
    }
  }
  if (terms.length < 5) {
    fail(`Parsed only ${terms.length} banned term(s) from cv/README.md — the list format changed.`);
  }
  return terms.map((term) => ({ term, re: bannedRegex(term) }));
}

// `leveraged X to drive Y` and `leveraged ... synergies` are PATTERNS: the
// placeholders and the ellipsis are not literal, the surrounding words are.
// Everything else is a literal phrase match on word boundaries.
function bannedRegex(term) {
  const words = term
    .split(/\s+/)
    .filter((w) => w !== "..." && w !== "…" && !/^[A-Z]$/.test(w));
  const isPattern = /\.\.\.|…|\b[A-Z]\b/.test(term);
  if (isPattern) {
    const parts = words.map((w) => `\\b${escapeRe(w)}\\b`);
    return new RegExp(parts.join("[\\s\\S]{0,60}?"), "i");
  }
  return new RegExp(`\\b${escapeRe(term).replace(/\\?[-\s]+/g, "[-\\s]+")}\\b`, "i");
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ---------------------------------------------------------------------------
// Claim-shaped numbers (shared by R4 and R8)
// ---------------------------------------------------------------------------

// R4 asks "does this number need a basis?", and the honest answer depends on
// what kind of number it is.
//
// A COMPLETE COUNT of an artifact you shipped — 34 npm releases, 83 diagnostic
// codes, 39 hook events, 355 templates — needs no denominator: it IS the total,
// and there is nothing to divide it by. Demanding one produced 24 findings that
// a human would wave through, which is how a gate teaches people to ignore it.
//
// A number needs a basis when it is one of two things:
//   1. a PROPORTION (any %, or an "N of M") — meaningless without its base; or
//   2. a POPULATION COUNT THAT GOES STALE — stars, followers, subscribers,
//      members, users, recommendations, commits. These are true on a date and
//      drift afterwards, so the sentence has to say when it was measured.
// R8 already guarantees every number traces to a shard; R4's remaining job is
// whether the READER can tell what the number means.
const R4_UNITS = [
  "stars", "followers", "subscribers", "members", "users", "recommendations",
  "commits", "students", "clients",
];
const R8_UNITS = [
  ...R4_UNITS,
  "npm releases", "diagnostic", "hook events", "segments", "subcommands",
  "tables", "templates",
];

const unitAlternation = (units) =>
  units
    .map((u) => escapeRe(u).replace(/s$/, "s?"))
    .sort((a, b) => b.length - a.length)
    .join("|");

// A unit is claim-shaped only when it is the HEAD NOUN of the number.
//   "126 GitHub stars" → stars, up to two words after the number
//   "19-user cohort"   → user, but only as the immediate compound head
// That second alternative is what stops "45-day Architect Cohort" reading as
// forty-five cohorts, and "6 multi-user AI products" as six users.
const unitRegex = (units) => {
  const alt = unitAlternation(units);
  return new RegExp(
    `^(?:[-‑–](?:${alt})\\b|\\s*%?\\s*(?:[A-Za-z][\\w'’.]*\\s+){0,2}(?:${alt})\\b)`,
    "i"
  );
};
const R4_UNIT_RE = unitRegex(R4_UNITS);
const R8_UNIT_RE = unitRegex(R8_UNITS);

// A number token, not a version string and not part of an identifier
// ("gpt-5.4-mini", "Next.js 16" → the 16 counts, the 5.4 does not).
const NUMBER_RE = /(?<![\w.\-/])([~≈]?)(\d[\d,]*(?:\.\d+)?)(\+?)/g;

// "week 8", "top 5%", "PR #2529", "chapter 3" — the number is an INDEX, not a
// count of the noun that follows it. Without this veto "By week 8 every student
// owned a live site" reads as a claim about eight students.
const INDEX_PREFIX_RE =
  /(?:\b(?:week|weeks|month|day|year|page|chapter|version|round|phase|step|level|top|tier|grade|pr|no\.?)|#)\s*$/i;

function claimNumbers(text, unitRe, { percentIsClaim }) {
  const out = [];
  for (const m of text.matchAll(NUMBER_RE)) {
    const whole = m[0];
    if (INDEX_PREFIX_RE.test(text.slice(Math.max(0, m.index - 12), m.index))) continue;
    const tail = text.slice(m.index + whole.length, m.index + whole.length + 48);
    const isPercent = /^\s*%/.test(tail);
    const claimed = isPercent ? percentIsClaim || unitRe.test(tail) : unitRe.test(tail);
    if (!claimed) continue;
    out.push({
      raw: whole + (isPercent ? "%" : ""),
      bare: m[2].replace(/,/g, ""),
      index: m.index,
      isPercent,
    });
  }
  return out;
}

function buildNumberHaystack() {
  const files = globRel(HAYSTACK_GLOB).filter((f) => !HAYSTACK_EXCLUDE.includes(f));
  const set = new Set();
  for (const rel of files) {
    for (const m of readUtf8(rel).matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
      set.add(m[0].replace(/,/g, ""));
    }
  }
  return { set, files };
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

// Superlatives that make a CLAIM, not the ordinary adverbs that share their
// spelling. "China's first women's-health-technology organisation" ranks
// something; "my first real job", "Discovery-first planning", "a run counts
// only after a PDF compiles" and "learn first, then ship" do not. The
// distinguishing shape is a superlative sitting in front of the noun it ranks.
// "the first time", "my first assignment", "first steps" — ordinary temporal
// ordinals, not rankings. Excluded so the rule reports claims, not chronology.
const ORDINAL_NOUNS =
  "time|times|place|step|steps|year|years|month|months|week|weeks|day|days|" +
  "job|jobs|assignment|sentence|thing|things|impression|draft|pass|attempt|" +
  "principles|language|contact|round";

// Deliberately NOT case-insensitive. The distinction between a ranking and a
// name is carried by capitalisation: "China's first women's-health-technology
// organisation" ranks, "First Prize" and "a first AI hire" name things. An /i
// flag would make `[a-z]` match `P` and `A` and destroy exactly that signal.
const SUPERLATIVE_RE = new RegExp(
  [
    `(?<!\\b(?:my|your|his|her|our)\\s)(?<![\\w-])[Ff]irst(?=\\s+(?!(?:of|${ORDINAL_NOUNS})\\b)[a-z])`,
    "\\b[Tt]he only\\b",
    "(?<![\\w-])(?:[Ee]arliest|[Ll]argest|[Bb]iggest|[Ll]eading|#1)(?![\\w-])",
    "\\b[Tt]he (?:best|most)\\b",
    "\\b[Ww]orld'?s\\b",
  ].join("|")
);
const ATTRIBUTION_RE =
  /(describes? itself|self-described|its own|according to|\brated\b|\bper\s|published|\bsays\b|\bnamed by\b|\bcalls? it\b|\bpraised\b|\bdescribed\b|\bhailed\b)/i;

// An enumeration marker: a count you could actually list. A bare 4-digit year
// is a date, not a comparison set, so it does not count.
function hasEnumeration(text) {
  if (/\b(two|three|four|five|six|seven|eight|nine|ten)\b/i.test(text)) return true;
  for (const m of text.matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
    const t = m[0];
    if (/^(19|20)\d{2}$/.test(t)) continue;
    return true;
  }
  return false;
}

const STRENGTH_RE =
  /\b(owned|led|sole|solely|principal|architected|core author|maintainer|founded)\b/gi;

function hasScope(text, at, after) {
  const ahead = text.slice(after, after + 110).split(/\s+/).slice(0, 10).join(" ");
  // "Sole instructor OF TechNest's first AI track", "Led product development
  // THROUGH intensive workshops" — a preposition names what was owned.
  if (/\b(of|for|across|on|at|behind|through|over)\s+[\wÀ-ɏ]/i.test(ahead)) return true;
  // "owned 5 production codebases", "Owned the Intelligence Layer" — a
  // determiner or a count introduces the object, which is the scope.
  if (/^\s*(?:the|a|an|its|their|his|her|my|our|this|these|\d[\d,.]*)\b/i.test(ahead)) return true;
  // A named thing on either side of the verb scopes it: "an AI architect I
  // founded" and "FreePeriod's sole technical leader" both say what.
  if (/(?:^|\s)[A-Z][A-Za-zÀ-ɏ][\w'’-]*/.test(ahead)) return true;
  const behind = text.slice(Math.max(0, at - 80), at).split(/\s+/).slice(-7).join(" ");
  if (/\s[A-Z][A-Za-zÀ-ɏ][\w'’-]*/.test(behind)) return true;
  return false;
}

const COUNT_WORDS =
  "one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve";

const METRIC_BASIS_RE = new RegExp(
  [
    "\\bof\\s+(?:the\\s+)?\\d",
    "\\bout of\\b",
    "\\d+\\s+of\\s+(?:the\\s+)?\\d+",
    "\\bmeasured\\b",
    `\\b(?:over|across)\\s+(?:[~≈]?\\d|${COUNT_WORDS})`,
    "\\bper\\s",
    "\\bp50\\b|\\bp9\\d\\b",
    "\\bload test|\\bunder load\\b",
    // A duration anywhere in the sentence is the window: "13.3 months: 1,381
    // commits", "46 solo commits across one month", "in 12 weeks".
    `\\b(?:[~≈]?[\\d,.]+|${COUNT_WORDS})\\s+(?:weeks?|months?|days?|years?|hours?|minutes?)\\b`,
    "\\bsince\\b",
    "\\bthrough\\b",
    "\\b(?:19|20)\\d{2}\\b",
    "\\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s+\\d{4}\\b",
  ].join("|"),
  "i"
);

const COMPANY_RESULT_RE = /\b(earned|won|secured|raised|closed|landed)\b/gi;
const COMPANY_OBJECT_RE = /\b(certification|funding|partner|partnership|round|award|contract|grant)\b/i;

const DUTY_LEAD_RE =
  /^(?:Responsible for|Worked on|Helped|Assisted|Participated in|Involved in|Tasked with)\b/i;

// ---------------------------------------------------------------------------
// R9 — platform field caps
// ---------------------------------------------------------------------------
// LinkedIn truncates past these SILENTLY: no warning, no ellipsis, no marker in
// the editor. The only way to notice is to count. Verified 2026-09-07 against
// authoredup.com/blog/linkedin-character-limit and
// lettercounter.org/blog/linkedin-character-limit-guide. If LinkedIn changes a
// limit this is the one line to edit.
const PLATFORM_CAPS = {
  headline: 220,
  about: 2600,
  experienceDescription: 2000,
  projectDescription: 2000,
};
// Report headroom as a warning once a field is this close to its cap, so a
// near-miss is visible BEFORE the next edit pushes it over.
const CAP_WARN_AT = 0.9;

// The About section is pasted as one field. Join the parts the way
// scripts/build-linkedin-md.mjs renders them so the count matches what actually
// goes into LinkedIn, not what the YAML happens to look like.
function renderAbout(about) {
  const parts = [about.lead ?? ""];
  for (const s of about.sections ?? []) {
    parts.push(`${s.emoji ? `${s.emoji} ` : ""}${s.heading ?? ""}
${s.body ?? ""}`);
  }
  return parts.filter(Boolean).join("\n\n");
}

// Locate the line a long value starts on, by its first distinctive words. Good
// enough to make a finding clickable; falls back to the field's own key.
function locate(src, value, keyHint) {
  const probe = String(value).trim().slice(0, 40);
  const at = probe ? src.indexOf(probe) : -1;
  if (at !== -1) return src.slice(0, at).split("\n").length;
  const k = src.indexOf(keyHint);
  return k === -1 ? 1 : src.slice(0, k).split("\n").length;
}

function checkCaps(push) {
  const basicsSrc = readUtf8("data/profile/00-basics.yaml");
  const liSrc = readUtf8("data/profile/70-linkedin.yaml");
  const profile = loadProfile();
  const li = profile.linkedin ?? {};

  const headline = profile.basics?.headline;
  if (headline) {
    push("data/profile/00-basics.yaml", locate(basicsSrc, headline, "headline:"),
      "basics.headline", headline.length, PLATFORM_CAPS.headline);
  }
  if (li.about) {
    const rendered = renderAbout(li.about);
    push("data/profile/70-linkedin.yaml", locate(liSrc, li.about.lead, "about:"),
      "linkedin.about (lead + sections)", rendered.length, PLATFORM_CAPS.about);
  }
  for (const e of li.experience ?? []) {
    for (const pos of e.positions ?? []) {
      if (!pos.description) continue;
      push("data/profile/70-linkedin.yaml", locate(liSrc, pos.description, "description:"),
        `linkedin.experience[${e.company}] ${pos.title ?? ""}`.trim(),
        pos.description.length, PLATFORM_CAPS.experienceDescription);
    }
  }
  for (const pr of li.projects ?? []) {
    if (!pr.description) continue;
    push("data/profile/70-linkedin.yaml", locate(liSrc, pr.description, "description:"),
      `linkedin.projects[${pr.name}]`, pr.description.length,
      PLATFORM_CAPS.projectDescription);
  }
}

const RULES = [
  {
    id: "R1",
    name: "banned-word",
    severity: "error",
    why: "Trips AI-resume detectors; cv/README.md lists these as strip-before-compile.",
    check(ctx, push) {
      for (const s of ctx.sentences) {
        for (const { term, re } of ctx.banned) {
          const m = re.exec(s.text);
          if (m) push(s, `"${m[0]}" (blacklisted as \`${term}\`)`);
        }
      }
    },
  },
  {
    id: "R2",
    name: "unattributed-superlative",
    severity: "warn",
    why: "EVIDENCE.md: never use a superlative you cannot enumerate the comparison set for.",
    check(ctx, push) {
      for (const s of ctx.sentences) {
        const m = SUPERLATIVE_RE.exec(s.text);
        if (!m) continue;
        if (ATTRIBUTION_RE.test(s.text)) continue;
        if (hasEnumeration(s.text)) continue;
        push(s, `"${m[0]}" with no attribution or comparison set`);
      }
    },
  },
  {
    id: "R3",
    name: "strength-word-without-scope",
    severity: "warn",
    why: "An ownership word with no scope reads as a bigger claim than the work supports.",
    check(ctx, push) {
      for (const s of ctx.sentences) {
        STRENGTH_RE.lastIndex = 0;
        let m;
        while ((m = STRENGTH_RE.exec(s.text)) !== null) {
          const after = m.index + m[0].length;
          if (hasScope(s.text, m.index, after)) continue;
          push(s, `"${m[0]}" with no scope ("of/for/across …" or a named thing) after it`);
        }
      }
    },
  },
  {
    id: "R4",
    name: "metric-without-basis",
    severity: "warn",
    scopes: ["display"],
    why: "TEMPLATE.md: every number carries its denominator, window, or measurement basis in the same sentence.",
    check(ctx, push) {
      for (const s of ctx.sentences) {
        if (METRIC_BASIS_RE.test(s.text)) continue;
        // A stat cell ("480+ GitHub stars") is a label, not a sentence claiming
        // anything about how the number was measured. This rule is about prose.
        if (s.text.split(/\s+/).filter(Boolean).length < 8) continue;
        const nums = claimNumbers(s.text, R4_UNIT_RE, { percentIsClaim: true });
        if (!nums.length) continue;
        push(s, `${nums.map((n) => `"${n.raw}"`).join(", ")} with no denominator, window or basis`);
      }
    },
  },
  {
    id: "R5",
    name: "company-result-as-personal",
    severity: "warn",
    why: "EVIDENCE.md: never present a team's or company's result as personal.",
    check(ctx, push) {
      for (const s of ctx.sentences) {
        COMPANY_RESULT_RE.lastIndex = 0;
        let m;
        while ((m = COMPANY_RESULT_RE.exec(s.text)) !== null) {
          const after = s.text.slice(m.index + m[0].length, m.index + m[0].length + 70);
          const words = after.split(/\s+/).slice(0, 7).join(" ");
          if (!COMPANY_OBJECT_RE.test(words)) continue;
          const before = s.text.slice(Math.max(0, m.index - 60), m.index);
          // If an organisation is already the subject, the sentence is doing
          // the attribution work itself.
          if (/\b(its|their|the (?:company|team|org|organisation|charity))\b/i.test(before)) continue;
          push(s, `"${m[0]} …${words.trim()}" reads as a personal claim on an org-level result`);
        }
      }
    },
  },
  {
    id: "R6",
    name: "duty-verb-lead",
    severity: "warn",
    scopes: ["display"],
    why: "experience.typ's own rule: outcomes, not duties — no summary opens with a duty verb.",
    check(ctx, push) {
      for (const s of ctx.sentences) {
        const m = DUTY_LEAD_RE.exec(s.text);
        if (m) push(s, `opens with the duty verb "${m[0]}"`);
      }
    },
  },
  {
    id: "R7",
    name: "run-on",
    severity: "warn",
    scopes: ["display"],
    why: "One idea per sentence; a bullet a reader has to re-parse gets skipped.",
    check(ctx, push) {
      for (const s of ctx.sentences) {
        const words = s.text.split(/\s+/).filter(Boolean).length;
        // "1:1 mentorship" is a ratio, not a clause boundary.
        const colons = (s.text.replace(/\d:\d/g, "").match(/:/g) ?? []).length;
        const semis = (s.text.match(/;/g) ?? []).length;
        const reasons = [];
        if (words > 45) reasons.push(`${words} words`);
        if (colons > 1) reasons.push(`${colons} colons`);
        if (semis > 2) reasons.push(`${semis} semicolons`);
        if (reasons.length) push(s, reasons.join(", "));
      }
    },
  },
  {
    id: "R8",
    name: "number-not-in-shard",
    severity: "error",
    why: "Every claim number on a derivative surface must exist in data/profile/*.yaml — invented or stale otherwise.",
    check(ctx, push) {
      if (!ctx.surface.numbers) return;
      for (const s of ctx.sentences) {
        const misses = claimNumbers(s.text, R8_UNIT_RE, { percentIsClaim: true }).filter(
          (n) => !ctx.haystack.set.has(n.bare)
        );
        if (!misses.length) continue;
        push(s, `${misses.map((n) => `"${n.raw}"`).join(", ")} not found in any profile shard`);
      }
    },
  },
  {
    id: "R9",
    name: "over-platform-limit",
    severity: "error",
    global: true,
    why: "LinkedIn truncates a field past its cap silently — no warning, no marker. The only way to know is to count.",
  },
];

// ---------------------------------------------------------------------------
// Suppressions
// ---------------------------------------------------------------------------

const SUPPRESS_RE = /copy-lint-ok:\s*(R\d+|all)/gi;

function collectSuppressions(src) {
  const out = []; // { rule, line, used }
  const lines = src.split("\n");
  lines.forEach((line, idx) => {
    const isComment = /(^|\s)\/\/|<!--|^\s*#\s/.test(line);
    if (!isComment) return;
    SUPPRESS_RE.lastIndex = 0;
    let m;
    while ((m = SUPPRESS_RE.exec(line)) !== null) {
      out.push({ rule: m[1].toUpperCase(), line: idx + 1, used: 0 });
    }
  });
  return out;
}

function suppressionFor(list, ruleId, line) {
  return list.find(
    (s) => (s.rule === ruleId || s.rule === "ALL") && (s.line === line || s.line === line - 1)
  );
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

const banned = loadBannedTerms();
const haystack = buildNumberHaystack();
const rules = RULES.filter((r) => !ONLY_RULE || r.id.toUpperCase() === ONLY_RULE.toUpperCase());
if (!rules.length) fail(`No rule matches --rule ${ONLY_RULE}. Known: ${RULES.map((r) => r.id).join(", ")}.`);

const surfaces = expandSurfaces(SURFACES).filter(
  (s) => !ONLY_SURFACE || s.path.includes(ONLY_SURFACE)
);
if (!surfaces.length) fail(`No surface matches --surface ${ONLY_SURFACE}.`);

const findings = [];
const suppressions = [];
let sentenceCount = 0;

for (const surface of surfaces) {
  const src = readUtf8(surface.path);
  const masked = maskFor(surface, src);
  const lineAt = lineIndex(src);
  const sentences = splitSentences(masked);
  sentenceCount += sentences.length;
  const local = collectSuppressions(src).map((s) => ({ ...s, path: surface.path }));
  suppressions.push(...local);
  const ctx = { surface, sentences, banned, haystack, src };

  for (const rule of rules) {
    if (rule.global) continue; // field-level, not sentence-level — run once, after the loop
    if (rule.scopes && !rule.scopes.includes(surface.scope)) continue;
    rule.check(ctx, (sentence, detail) => {
      const line = lineAt(sentence.start);
      const hit = suppressionFor(local, rule.id, line);
      if (hit) {
        hit.used++;
        return;
      }
      findings.push({
        rule,
        path: surface.path,
        line,
        detail,
        sentence: trim(sentence.text, 120),
      });
    });
  }
}

// Field-level rules run once over the whole profile rather than per sentence:
// a character cap is a property of a field, not of a sentence inside it.
for (const rule of rules.filter((r) => r.global)) {
  checkCaps((path, line, field, len, cap) => {
    const over = len - cap;
    if (over > 0) {
      findings.push({
        rule, path, line,
        detail: `${field} is ${len} chars, ${over} OVER the ${cap} cap`,
        sentence: "LinkedIn truncates this silently — the tail is not published.",
      });
    } else if (len >= cap * CAP_WARN_AT) {
      findings.push({
        rule: { ...rule, severity: "warn" }, path, line,
        detail: `${field} is ${len} chars — only ${cap - len} of headroom under the ${cap} cap`,
        sentence: "Close enough that the next edit can push it over.",
      });
    }
  });
}

function trim(s, n) {
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const errors = findings.filter((f) => f.rule.severity === "error");
const warnings = findings.filter((f) => f.rule.severity === "warn");

for (const rule of rules) {
  const hits = findings.filter((f) => f.rule.id === rule.id);
  if (!hits.length) continue;
  const mark = rule.severity === "error" ? "✗" : "⚠";
  const log = rule.severity === "error" ? console.error : console.warn;
  log(`${mark} ${rule.id} ${rule.name} — ${hits.length} finding(s)`);
  log(`    why: ${rule.why}`);
  for (const f of hits) {
    log(`    ${f.path}:${f.line} — ${f.detail}`);
    log(`        ${f.sentence}`);
  }
  log("");
}

// Only a suppression whose rule actually RAN can be judged unused — under
// `--rule R8` every other marker is dormant, not dead.
const ranRule = (id) => id === "ALL" || rules.some((r) => r.id === id);
const unused = suppressions.filter((s) => !s.used && ranRule(s.rule));
if (unused.length) {
  console.warn(
    `⚠ ${unused.length} suppression(s) match nothing any more — delete them: ` +
      unused.map((s) => `${s.path}:${s.line} (${s.rule})`).join(", ")
  );
}

const scope =
  `${surfaces.length} surfaces (${sentenceCount} sentences, ${rules.length} rules, ` +
  `${suppressions.length} suppressions, ${haystack.set.size} shard numbers)`;

if (!findings.length) {
  console.log(`✓ copy clean across ${scope}`);
} else {
  const parts = [];
  if (warnings.length) parts.push(`⚠ ${warnings.length} warning(s)`);
  if (errors.length) parts.push(`✗ ${errors.length} error(s)`);
  console.log(`${parts.join(", ")} across ${scope}`);
}

if (STRICT && errors.length) process.exit(1);
