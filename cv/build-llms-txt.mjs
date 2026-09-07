#!/usr/bin/env node
// Build agent-readable plain-text CV summary sibling.
// Usage: node build-llms-txt.mjs data/profile --out public/cv-llms.txt
//        node build-llms-txt.mjs data/profile > public/cv-llms.txt   (stdout fallback)
//        (accepts either the data/profile shard directory or a single .yaml file)
//
// Mirrors the llms.txt convention: a deterministic, parseable summary
// for AI sourcer agents that don't (yet) handle JSON-LD.
//
// --------------------------------------------------------------------------
// WHAT IS GENERATED AND WHAT IS HARDCODED — read before editing
// --------------------------------------------------------------------------
// public/cv-llms.txt is a PUBLISHED, sitemap-indexed URL. Everything factual
// in it — roles, dates, project stats, awards, credential IDs, the reference
// quote — is derived from data/profile/*.yaml so it cannot drift away from the
// shards. Until 2026-09 roughly 120 of this file's lines hardcoded CV prose,
// and nothing gated it; it had drifted into publishing claims the shards
// contradicted (a role that had ended shown as "Present", a star count from a
// third-party catalog, a "zero downtime" migration the shard records as
// "~30 min downtime", a credential ID attached to the wrong certificate).
//
// The small hardcoded remainder below is deliberate and is marked HARDCODED
// with the reason. It is the repo's own engineering vocabulary — the Claude
// Code 5-layer stack, the architect-grade patterns, the anti-patterns — which
// has no shard home by design (see cv/README.md § "Source of truth" and
// § "Architect-grade vocabulary"). It is also the only thing that makes this
// file non-redundant with the root llms.txt. Do not add new facts here; add
// them to the shards and render them.

import { readFileSync, statSync, writeFileSync } from "node:fs";
import yaml from "js-yaml";

const args = process.argv.slice(2);
let outPath = null;
const positional = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--out") {
    outPath = args[i + 1];
    i += 1;
    continue;
  }
  positional.push(args[i]);
}
if (positional.length < 1 || (outPath !== null && !outPath)) {
  console.error(
    "usage: build-llms-txt.mjs <data/profile dir | profile.yaml> [--out <path>]",
  );
  process.exit(2);
}

const profile = statSync(positional[0]).isDirectory()
  ? (await import("../scripts/lib/load-profile.mjs")).loadProfile()
  : yaml.load(readFileSync(positional[0], "utf8"));
const b = profile.basics ?? {};
const xb = profile.meta?.x_brand ?? {};

// --------------------------------------------------------------------------
// Rendering helpers
// --------------------------------------------------------------------------

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// YAML prose uses `|` literal blocks with markdown inside. This file is plain
// text on one line per fact, so collapse the wrapping and drop the emphasis
// markers — never the words.
// The `**…**` PAIR is matched, not the bare `**`: metric values carry glob
// patterns (`app/api/**/route.ts`, `components/**/*.tsx`) that a blanket strip
// silently mangles into `app/api//route.ts`.
const flat = (s) =>
  String(s ?? "")
    .replace(/\*\*(?!\s)([^*]+?)\*\*/g, "$1")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();

// "2025-03" / "2025-03-14" → "Mar 2025". Anything else passes through.
const mon = (d) => {
  const m = /^(\d{4})-(\d{2})/.exec(String(d ?? ""));
  if (!m) return String(d ?? "").trim();
  return `${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
};

const dateRange = (start, end) =>
  `${mon(start)} — ${end ? mon(end) : "Present"}`;

// Truncation in a published CV must never cut a claim in half — a caveat lives
// at the end of its sentence ("…— Chan presented remotely, by video link."),
// so a mid-sentence clip is exactly how a true statement becomes a false one.
// Take whole sentences while under budget; always emit at least the first.
const clipSentences = (s, budget) => {
  const text = flat(s);
  if (text.length <= budget) return text;
  const parts = text.split(/(?<=[.!?])\s+/);
  let acc = parts[0] ?? text;
  for (const part of parts.slice(1)) {
    if (acc.length + 1 + part.length > budget) break;
    acc += ` ${part}`;
  }
  return acc;
};

const out = [];
const W = (s) => out.push(s);
const sect = (title) => {
  W("");
  W(`# ${title}`);
  W("");
};

const byId = (list, id) => (list ?? []).find((x) => x.id === id);

// --------------------------------------------------------------------------
// Header — identity, contact, summary
// --------------------------------------------------------------------------

// Identity string comes from basics.label so this file cannot invent a fourth
// variant of Chan's title. (basics.label, meta.x_brand.valueProposition.identity
// and the CV header currently differ; that divergence is a data decision, not
// one for a generator to make.)
W(`# ${b.name} — ${b.label}`);
W("");
// HARDCODED: pointers to the CV artifacts this file is a sibling of. These are
// build outputs and repo paths, not profile facts, so they have no shard home.
W(`> Two-page CV — for AI sourcers, recruiter LLMs, and Anthropic Partner Network agents.`);
W(`> Canonical PDF: https://github.com/ChanMeng666/ChanMeng666/raw/main/public/chan-meng-cv.pdf`);
W(`> JSON-LD: https://chanmeng.org/cv.jsonld`);
W(`> Source: https://github.com/ChanMeng666/ChanMeng666/tree/main/cv`);
W("");
W(`Location: ${b.location?.region ?? "Auckland, New Zealand"}`);
W(`Email: ${b.email ?? ""}`);
W(`URL: ${b.url ?? "https://chanmeng.org/"}`);
W("");
W(`## Summary`);
W("");
W(flat(b.summary));

// --------------------------------------------------------------------------
// Positioning
// --------------------------------------------------------------------------

sect("Positioning");
W(`- ${b.label}`);
// HARDCODED: production-posture and working-method claims. These describe how
// Chan works rather than what she has shipped, and have no shard analogue.
W("- Ships MCP servers, sub-agents, and agent skills to production — behind paying customers, private health data, and regulated work, not demos.");
W("- Works AI-native by default — directs coding agents (Claude Code, Codex) and builds on the Claude Agent SDK, shipping these as open-source reference implementations, while keeping the call on what actually ships a human one.");
if (profile.domains?.length) {
  const focus = profile.domains
    .filter((d) => d.tier === "flagship" || d.tier === "primary")
    .map((d) => d.name);
  if (focus.length) W(`- Focus areas: ${focus.join(" · ")}.`);
}
// HARDCODED: the Partner Network architect track and the practice-exam pass are
// recorded in work[engram]'s narrative prose but exist as no structured field.
W("- Came through the Anthropic Partner Network architect track via Engram (May–Jul 2026) — Claude Certified Architect (Foundations): curriculum completed, practice exam passed.");
W("- Senior AI programming mentor · orchestrator of agents.");

// Verified reach metrics with per-stat source URLs — the "statistics with
// citations" GEO tactic (highest-impact signal per docs/GEO-STRATEGY.md).
// Rendered from data/profile/00-basics.yaml::basics.reach so it never drifts.
if (b.reach?.metrics?.length) {
  sect(`Reach & social proof (verified ${b.reach.asOf ?? ""})`.trim());
  for (const m of b.reach.metrics) {
    const note = m.note ? ` — ${m.note}` : "";
    const src = m.source ? ` · ${m.source}` : "";
    W(`- ${m.value} ${m.label}${note}${src}`);
  }
}

// --------------------------------------------------------------------------
// HARDCODED BLOCK — the repo's own engineering vocabulary.
//
// Three sections, ~26 bullets. Kept hardcoded on purpose: they are claims about
// how this repo and Chan's agent work are engineered, not entries in a career
// database, and cv/README.md § "Architect-grade vocabulary" documents that they
// exist so recruiter LLMs reading the Anthropic Partner Network JD hit the same
// phrase patterns. They are also what makes cv-llms.txt worth publishing next
// to the root llms.txt. Add facts to the shards, not here.
// --------------------------------------------------------------------------

sect("Claude Code stack (canonical 5-layer vocabulary)");
W("- CLAUDE.md");
W("- MCP servers");
W("- Skills (.claude/skills/, SKILL.md frontmatter — context: fork, allowed-tools, argument-hint)");
W("- Subagents (AgentDefinition + Task tool, hub-and-spoke coordinator)");
W("- Hooks (PreToolUse, PostToolUse — echook is the reference implementation)");
W("- Status line + context-window quota");

sect("Architect-grade patterns demonstrated");
W("- Hub-and-spoke coordinator with scoped subagent tools");
W("- AgentDefinition + Task tool spawning (parallel subagent dispatch)");
W("- PostToolUse hooks normalising heterogeneous tool outputs to ISO 8601");
W("- PreToolUse hooks for deterministic financial guardrails (instead of prompt-only enforcement)");
W("- stop_reason-driven agentic loops (not iteration caps)");
W("- tool_use + JSON Schema with nullable fields (anti-fabrication)");
W("- Retry-with-error-feedback validation loops");
W("- .claude/rules/ with glob frontmatter for path-specific conventions");
W("- context: fork skill isolation for verbose discovery");
W("- -p + --output-format json for CI/CD pipelines");
W("- plan mode for architectural decisions, direct execution for clear-scope fixes");
W("- case-facts block + scratchpad files for context preservation across summarisation");
W("- structured error propagation (errorCategory, isRetryable, partial results)");
W("- claim-source provenance through multi-agent synthesis");

sect("Anti-patterns rejected");
W("- Iteration-cap loop control (use stop_reason instead)");
W("- Prompt-only enforcement for financial / security-critical guardrails (use hooks)");
W("- Subagents inheriting coordinator memory (subagent context is isolated by design)");
W("- Arbitrary retry of valid empty results (distinguish from access failures)");
W("- Sentiment-based escalation (use explicit criteria + few-shot)");
W("- Self-rated confidence as primary escalation signal");

// --------------------------------------------------------------------------
// Selected work — from projects[]
// --------------------------------------------------------------------------

// SELECTION (not facts) lives here, the same way the README's shopfront buckets
// live as id lists in 90-meta.yaml. Every flagship project, plus two primary-tier
// open-source entries the CV has always carried because they are the MCP- and
// hooks-ecosystem credentials a sourcer LLM searches for by name. A typo fails
// the build rather than silently dropping a project.
const SELECTED_EXTRA_PROJECT_IDS = ["echook", "google-news-mcp"];

const selectedProjects = [
  ...(profile.projects ?? []).filter((p) => p.tier === "flagship"),
  ...SELECTED_EXTRA_PROJECT_IDS.map((id) => {
    const p = byId(profile.projects, id);
    if (!p) {
      throw new Error(
        `SELECTED_EXTRA_PROJECT_IDS names "${id}", which is not a projects[].id ` +
          `in data/profile/. Fix the id or drop it from cv/build-llms-txt.mjs.`,
      );
    }
    return p;
  }),
];

// Several shard names carry a full positioning line after an em-dash
// ("Eatropolis Website — Production-grade Next.js 16 + OpenNext-on-…").
// A heading wants the name; the positioning is already in publicSummary.
const headingName = (name) => {
  const n = flat(name);
  if (n.length <= 60) return n;
  const cut = n.split(" — ")[0];
  return cut.length ? cut : n;
};

// The stats tail is drawn from metrics[] in shard order. Long metric values are
// paragraphs of methodology, not stats — they belong in llms-full.txt, not in a
// file whose whole point is fitting in one prompt alongside a job description.
// 150 is not cosmetic: google-news-mcp's `Stars` value ("126 GitHub (measured
// 2026-08-26) · 20 forks · listed on …") is 137 chars, and excluding it left the
// shorter `Glama quality: A (license) · 122 stars` as the only star figure in the
// file — which is how a third-party catalog's count came to be published as the
// repo's own.
const STAT_MAX_VALUE = 150;
const STAT_MAX_COUNT = 7;
// Guard rail against a future runaway publicSummary. No current one is clipped.
const PROJECT_SUMMARY_BUDGET = 900;
const statsTail = (metrics) =>
  (metrics ?? [])
    .filter((m) => m?.value != null && flat(m.value).length <= STAT_MAX_VALUE)
    .slice(0, STAT_MAX_COUNT)
    .map((m) => `${flat(m.label)}: ${flat(m.value)}`)
    .join(" · ");

// techStack[] entries are prose ("Next.js 15.5 (App Router + Turbopack build +
// Edge Runtime AI endpoints)"), and rendering them whole would add 2 KB to a
// single card. Keep the name, drop the parenthetical and the em-dash gloss:
// this line exists so a sourcer LLM matching a job description's stack finds
// the words, which is exactly what the hand-typed cards used to supply.
const STACK_BUDGET = 320;
const stackLine = (techStack) => {
  if (!Array.isArray(techStack)) return "";
  const items = [];
  let len = 0;
  for (const raw of techStack) {
    const item = flat(raw)
      .replace(/\s*\([^)]*\)/g, "")
      .split(/\s+—\s+/)[0]
      .replace(/[,;:]+$/, "")
      .trim();
    if (!item) continue;
    const add = items.length ? item.length + 3 : item.length;
    if (len + add > STACK_BUDGET) break;
    items.push(item);
    len += add;
  }
  return items.join(" · ");
};

sect("Selected work");
for (const p of selectedProjects) {
  W(`### ${headingName(p.name)}`);
  const url = p.url ?? p.repoUrl;
  if (url) W(`- URL: ${url}`);
  // roles[] where the shard has it; entity (the commissioning party) otherwise.
  // Projects carrying neither get no Role line — better a missing line than an
  // invented one.
  const role = p.roles?.length ? p.roles.map(flat).join(" · ") : flat(p.entity);
  if (role) W(`- Role: ${role}`);
  const stats = statsTail(p.metrics);
  const body = clipSentences(p.publicSummary, PROJECT_SUMMARY_BUDGET);
  W(`- ${body}${stats ? ` ${stats}.` : ""}`);
  const stack = stackLine(p.techStack);
  if (stack) W(`- Stack: ${stack}`);
  W("");
}

// --------------------------------------------------------------------------
// Developer-leverage tooling.
//
// HARDCODED framing ("builds for self and team", "listed here as the reference
// example of…") over projects that are already in projects[]. The framing is
// the point and has no shard home; the URLs and the one number are read from
// the shards, because those are what drift. A wrong id fails the build.
// --------------------------------------------------------------------------

const proj = (id) => {
  const p = byId(profile.projects, id);
  if (!p) {
    throw new Error(
      `cv/build-llms-txt.mjs references projects[].id "${id}", which is not in ` +
        `data/profile/. Fix the id or drop the line that uses it.`,
    );
  }
  return p;
};
const metric = (p, label) =>
  flat((p.metrics ?? []).find((m) => flat(m.label) === label)?.value ?? "");

const gradientSvg = proj("gradient-svg-generator");
const seismophone = proj("sunostats");
const archlangP = proj("archlang");
const archcanvasP = proj("archcanvas");

sect("Developer-leverage tooling (builds for self and team)");
W("- echook (Claude Code / Cursor / Codex audio hooks — above)");
W(
  `- gradient-svg-generator (${gradientSvg.url}) — animated-SVG templates for ` +
    `READMEs · ${metric(gradientSvg, "Template count").split(" (")[0]}`,
);
W(`- typst-claude-skill (${proj("typst-claude-skill").repoUrl}) — a Typst skill for Claude Code (typesets this CV)`);
W(`- Seismophone (${seismophone.url}) — an independent observatory for AI music`);
W(`- ArchLang (${archlangP.repoUrl}) — the floor-plan language above, packaged as a standalone dev tool: .arch source in, dimensioned SVG/DXF/PDF out; agent-native CLI + LSP + VS Code extension (details under Selected work)`);
W(`- ArchCanvas (${archcanvasP.url}) — listed here as the reference example of building a commercial product directly on a self-authored open-source engine (full write-up under Selected work)`);

// --------------------------------------------------------------------------
// Experience — from work[]
// --------------------------------------------------------------------------

sect("Experience (most recent)");
const roleRank = (w) => (w.endDate ? 1 : 0);
const roles = (profile.work ?? [])
  .filter((w) => w.tier === "flagship" || w.tier === "primary")
  .slice()
  .sort((a, x) => {
    // Current roles first (endDate: null), then most-recently-ended first.
    if (roleRank(a) !== roleRank(x)) return roleRank(a) - roleRank(x);
    if (a.endDate && x.endDate && a.endDate !== x.endDate) {
      return a.endDate < x.endDate ? 1 : -1;
    }
    if (a.startDate !== x.startDate) return a.startDate < x.startDate ? 1 : -1;
    return a.id < x.id ? -1 : 1;
  });
for (const w of roles) {
  const detail = flat(w.narrative?.impactHeadline ?? w.summary ?? "");
  W(
    `- ${flat(w.position)} · ${flat(w.name)} · ` +
      `${dateRange(w.startDate, w.endDate)}${detail ? ` — ${detail}` : ""}`,
  );
}

// --------------------------------------------------------------------------
// Education — from education[]
// --------------------------------------------------------------------------

sect("Education");
for (const e of (profile.education ?? []).filter((x) => x.tier !== "archive")) {
  // studyType already carries "(Distinction, Dean's List)"; only append a
  // highlight that adds a number the studyType doesn't have.
  const extra = (e.highlights ?? [])
    .map(flat)
    .filter((h) => /\d/.test(h) && !flat(e.studyType).includes(h));
  W(
    `- ${flat(e.studyType)} — ${flat(e.institution)} ` +
      `(${dateRange(e.startDate, e.endDate)})` +
      (extra.length ? ` · ${extra.join(" · ")}` : ""),
  );
}

// --------------------------------------------------------------------------
// Recognition & training — from awards[], certificates[], publications[]
// --------------------------------------------------------------------------

sect("Recognition & training");

// Academic honours (Distinction, Dean's List) are awards[] entries awarded by
// an institution already listed under Education — don't print them twice in a
// file this size. Matched on the institution name, so a new school needs no
// code change.
const eduAwarders = (profile.education ?? []).map((e) =>
  flat(e.institution).split(",")[0].trim(),
);
// Generous on purpose. The proof points a sourcer actually cares about sit in
// an award summary's THIRD sentence ("…IBM representatives who expressed
// interest in pilot collaboration, and … the Minister of Gender and Children's
// Affairs from Sierra Leone…"), and the UN CSW 69 entry's load-bearing caveat —
// Chan presented remotely, by video link — is the tail of its first, which is
// 312 characters on its own. Five award lines, so the budget is bounded.
const AWARD_PROSE_BUDGET = 900;
const awards = (profile.awards ?? [])
  .filter((a) => a.tier === "flagship" || a.tier === "primary")
  .filter((a) => !eduAwarders.some((inst) => inst && flat(a.awarder).startsWith(inst)))
  .slice()
  .sort((a, x) => (a.date < x.date ? 1 : a.date > x.date ? -1 : 0));
for (const a of awards) {
  const prose = clipSentences(a.summary, AWARD_PROSE_BUDGET);
  W(
    `- ${flat(a.title)} — ${flat(a.awarder)} · ${mon(a.date)}` +
      (prose ? ` — ${prose}` : ""),
  );
}

// HARDCODED: the Foundations curriculum + practice exam. Recorded in
// work[engram]'s narrative prose; there is no certificates[] entry to render
// because Anthropic issued no certificate for it.
W("- Claude Certified Architect — Foundations curriculum completed (Agent SDK · MCP · Claude Code · Claude API · on Anthropic Partner Network track via Engram)");

// Name and credentialId are emitted as one unit so they cannot be mismatched.
// (Until 2026-09 this file published JHIY9NPYTR2D against "AI Fluency"; that ID
// belongs to the Aug 2025 "Claude Code in Action".)
const anthropicCerts = (profile.certificates ?? [])
  .filter((c) => flat(c.issuer) === "Anthropic")
  .slice()
  .sort((a, x) =>
    a.date !== x.date
      ? a.date < x.date
        ? 1
        : -1
      : flat(a.name) < flat(x.name)
        ? -1
        : 1,
  );
if (anthropicCerts.length) {
  W(
    `- Anthropic certificates (${anthropicCerts.length}): ` +
      anthropicCerts
        .map((c) => {
          const name = flat(c.name);
          // "Claude Code in Action (Aug 2025)" already carries its own date.
          const when = name.includes(mon(c.date)) ? "" : `${mon(c.date)}, `;
          return `${name} (${when}${flat(c.credentialId)})`;
        })
        .join(" · "),
  );
}

// Third-party coverage: press pieces and podcast appearances, deduplicated by
// publisher. Archive-tier entries are the older minimalist-lifestyle features
// and are out of scope for a CV.
const featuredIn = [];
for (const pub of profile.publications ?? []) {
  const type = pub.meta?.x_brand?.type;
  if (type !== "press" && type !== "podcastEpisode") continue;
  if (pub.tier === "archive") continue;
  const publisher = flat(pub.publisher);
  if (publisher && !featuredIn.includes(publisher)) featuredIn.push(publisher);
}
if (featuredIn.length) W(`- Featured in ${featuredIn.join(" · ")}`);

// --------------------------------------------------------------------------
// Reference quote — from references[], selected by meta.x_brand.readmePullQuoteId
// --------------------------------------------------------------------------

const pullQuoteRef = byId(profile.references, xb.readmePullQuoteId);
if (pullQuoteRef) {
  // A pull quote must be a VERBATIM span of the recommendation. references[]
  // carries no field marking which span to pull, so take the LEADING paragraphs
  // while they fit the budget: contiguous source text, in source order, never
  // re-punctuated, re-capitalised, or stitched together out of order. (The
  // hand-typed excerpt this replaced dropped a five-word lead-in and
  // recapitalised what was left, so it was not a substring of the shard at all.)
  const paragraphs = String(pullQuoteRef.reference ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const QUOTE_BUDGET = 320;
  let quote = paragraphs[0] ?? "";
  for (const para of paragraphs.slice(1)) {
    if (quote.length + 1 + para.length > QUOTE_BUDGET) break;
    quote += ` ${para}`;
  }
  if (quote) {
    // relationship reads "Founder & CEO at GAVIGO Inc. (Activation & …); managed
    // Chan directly" — the title is everything before the first paren/semicolon.
    const relationship = flat(pullQuoteRef.meta?.x_brand?.relationship ?? "")
      .split(/[(;]/)[0]
      .trim()
      .replace(/[,\s]+$/, "");
    sect("Reference quote");
    W(`"${quote}"`);
    W(`— ${flat(pullQuoteRef.name)}${relationship ? ` · ${relationship}` : ""}`);
  }
}

// --------------------------------------------------------------------------
// For agents / sourcer LLMs
// --------------------------------------------------------------------------

sect("For agents / sourcer LLMs");
// The CV's own prose is hand-curated Typst (cv/sections/*.typ) — only THIS
// summary is generated. Saying otherwise was itself a published false claim.
W("- Two-page CV typeset in Typst; this summary is generated from data/profile/*.yaml.");
W("- Source under cv/ in the GitHub profile repo (https://github.com/ChanMeng666/ChanMeng666).");
if (xb.engagementAvailability?.current) W(`- ${flat(xb.engagementAvailability.current)}`);
const bookingUrl = xb.engagementAvailability?.cta?.primary?.url;
if (bookingUrl) W(`- Booking: ${bookingUrl}`);
W("");

// Node-side write, never a shell redirect: `node … | Out-File` on Windows once
// truncated this file to zero bytes while the build still reported success, and
// Out-File rejoins stdout with CRLF, which fights .gitattributes (`* text=auto
// eol=lf`). writeFileSync gives LF, UTF-8, no BOM, on every platform.
const text = out.join("\n") + "\n";
if (outPath) writeFileSync(outPath, text, "utf8");
else process.stdout.write(text);
