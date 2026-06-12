#!/usr/bin/env node
// Build agent-readable plain-text CV summary sibling.
// Usage: node build-llms-txt.mjs ../data/profile > ../public/cv-llms.txt
//        (accepts either the data/profile shard directory or a single .yaml file)
//
// Mirrors the llms.txt convention: a deterministic, parseable summary
// for AI sourcer agents that don't (yet) handle JSON-LD.

import { readFileSync, statSync } from "node:fs";
import yaml from "js-yaml";

const argv = process.argv.slice(2);
if (argv.length < 1) {
  console.error("usage: build-llms-txt.mjs <data/profile dir | profile.yaml>");
  process.exit(2);
}

const profile = statSync(argv[0]).isDirectory()
  ? (await import("../scripts/lib/load-profile.mjs")).loadProfile()
  : yaml.load(readFileSync(argv[0], "utf8"));
const b = profile.basics ?? {};

const out = [];
const W = (s) => out.push(s);
const sect = (title) => {
  W("");
  W(`# ${title}`);
  W("");
};

W(`# ${b.name} — ${b.label}`);
W("");
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
W(
  (b.summary ?? "")
    .replace(/\s+/g, " ")
    .trim(),
);

sect("Positioning");
W("- AI Agent Architect · Full-stack Engineer · AI-Tooling Expert");
W("- Builds production AI systems used by real teams every day — paying customers, sensitive data, regulated workflows (not demos).");
W("- Daily-driver of the same Claude Agent SDK, MCP, and agent-skills stack used inside Anthropic's Partner Network — shipping these as open-source reference implementations.");
W("- Domains of focus: women's health, cultural technology, early-stage startup infrastructure.");
W("- On Anthropic Partner Network architect track via Engram — Claude Certified Architect — Foundations curriculum.");
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

sect("Selected work");
const projects = [
  {
    name: "Tam-AI-Ti",
    url: "https://tamaiti.whiri-ai.com/",
    role: "Solo full-stack — commissioned by Riria (Missy) Te Kanawa (ASB Bank · former KPMG NZ National Māori Sector lead)",
    summary:
      "AI financial-wellness app built around te ao Māori — the user's culture lives in the data model (Maramataka lunar phases and Te Whare Tapa Whā wellness domains as first-class Drizzle enum types), not just the translation layer. 351 commits solo · 48 tables / 494 columns / 22 migrations · 3-model OpenAI composition (gpt-4o-mini coach turns + gpt-4o synthesis + gpt-4o-realtime-preview voice). 19-user research cohort sustained 4 months · 181 bilingual journal entries · 35 voice sessions · 146 AI coach messages · 74 daily check-ins.",
  },
  {
    name: "GAVIGO IRE (Instant Reality Exchange)",
    url: "https://ire.gavigo.com/",
    role: "Founding Principal Engineer, Activation/Execution/AI Systems",
    summary:
      "Sub-millisecond app activation platform — lets users open straight into a game without an app-store install. Tail-latency-aware: p50 < 1 ms · 84.6% warm-pool hit rate. Structured error propagation with errorCategory + isRetryable. Cross-cloud DigitalOcean → GCP GKE migration in ~30 min zero-downtime cutover. Promoted Core Engineer → Founding Principal Engineer across three contract iterations · 98% solo on 353 commits.",
  },
  {
    name: "She Sharp Platform",
    url: "https://she-sharp-zeta.vercel.app/",
    role: "Senior Full-Stack Engineer & Website Team Lead — recruited by founder Dr Mahsa Mohaghegh",
    summary:
      "Rebuilt New Zealand's leading women-in-STEM platform (2,200+ registered members, 8,000+ women supported lifetime). 86.6% solo across 10 months · Webflow → Next.js cutover via custom crawler preserving 10+ years of legacy content with zero broken inbound links. AI mentor-matching engine (GPT-4o-mini, 5-dimensional scoring) shipped on top. 1,392-line schema · 34 pgTables · multi-tenant isolation. PostToolUse normalisation hook for heterogeneous Stripe / Slack / Webflow webhook timestamps.",
  },
  {
    name: "Vitex — AI Career Agent",
    url: "https://www.vitex.org.nz/",
    role: "Solo author & maintainer (~95% solo · 168 commits)",
    summary:
      "Paste a job description, get a tailored resume + cover letter scored against the JD's keywords in under 30 seconds. 7-step AI pipeline streaming over SSE (JD parsing → background → match analysis → resume tailoring → ATS scoring → cover letter → Typst doc generation) · every stage Zod-validated structured output · disables OpenAI strict-JSON mode on .optional() Zod schemas. Vercel AI SDK + GPT-4o + Typst (PDFs compile locally in under 100 ms across 14 AI-auto-selected templates — no hosted Chromium, no third-party doc-gen API). Three production migrations (Railway → Cloudflare Workers → DigitalOcean VPS) + LaTeX → Typst engine swap, zero downtime · Docker + Traefik + GitHub Actions CD · Stripe credits ledger + share-token URLs.",
  },
  {
    name: "echook — claude-code-audio-hooks",
    url: "https://github.com/ChanMeng666/echook",
    role: "Solo author & maintainer (MIT)",
    summary:
      "Noise-control system for AI coding assistants — turns down their constant audio chatter during deep work, alerts only on the things that matter. Reference implementation of the Claude Agent SDK hooks lifecycle — PreToolUse · PostToolUse · status line · context-window quota. 26 hook events · 42 releases · 139 tests on triple-platform CI (Linux/macOS/Windows). Cross-tool by design — single hook system, three IDE surfaces: Claude Code, Cursor, OpenAI Codex. Started as an internal noise-fix for long-running background agents; open-sourced after teammates asked for it; now community-adopted across all three IDEs.",
  },
  {
    name: "Google News MCP Server",
    url: "https://glama.ai/mcp/servers/ChanMeng666/server-google-news",
    role: "Solo author & maintainer (MIT)",
    summary:
      "Earliest-ecosystem MCP server — gives AI assistants live Google News access. Shipped 35 days after Anthropic's Nov 2024 MCP launch. Featured in Skywork AI's AI-engineer deep-dive guide · listed across 15+ MCP catalogs · PulseMCP 'Top Pick' · Glama A-rating · 122 stars · @chanmeng666/google-news-server on npm.",
  },
];
for (const p of projects) {
  W(`### ${p.name}`);
  W(`- URL: ${p.url}`);
  W(`- Role: ${p.role}`);
  W(`- ${p.summary}`);
  W("");
}

sect("Developer-leverage tooling (builds for self and team)");
W("- echook (Claude Code / Cursor / Codex audio hooks — above)");
W("- gradient-svg-generator (https://gradient-svg-generator.vercel.app/) — 340+ animated-SVG templates · 273 solo commits");
W("- typst-claude-skill — official Typst skill for Claude Code (typesets this CV)");
W("- SunoStats (https://sunostats.chanmeng.org/) — industry's first Suno music lineage explorer · trilingual English / Simplified Chinese / Japanese · Docker + Traefik VPS");
W("- FanFic Lab (https://fanfic-lab.tech/) — 7-node LangGraph agent");

sect("Experience (most recent)");
const roles = [
  ["AI Agent Architect", "Engram", "May 2026 — Present", "Recruited onto Anthropic's Partner Network architect track — Engram's founder used his own Claude agent to surface candidates, publicly confirmed Chan's open-source portfolio as the recommendation. 45-day Architect Cohort: Claude Certified Architect — Foundations curriculum."],
  ["AI Instructor & Mentor", "TechNest Community", "Apr 2026 — Present", "Built and sole-teaches TechNest's first AI-specialised mentorship track — 12-week prompt-first curriculum, students ship portfolio-grade AI apps by week 8. Bilingual teaching platform built 95.7% solo, including an in-course RAG assistant on Cloudflare Workers (Llama 3.1 8B + Vectorize + KV)."],
  ["Founding Principal Engineer (Activation, Execution & AI Systems)", "Gavigo", "Oct 2025 — Present", "Promoted Core Engineer → Founding Principal Engineer across three contract iterations · owns the Intelligence Layer of GAVIGO's sub-millisecond app activation platform (lets users open straight into a game without an app-store install) · p50 < 1 ms · 84.6% warm-pool hit rate · cross-cloud DigitalOcean → GCP GKE migration in 30-minute zero-downtime cutover · 98% solo on 353 commits."],
  ["Senior Full-Stack Engineer & Website Team Lead", "She Sharp", "Jul 2025 — Present", "Recruited by founder Dr Mahsa Mohaghegh to rebuild NZ's leading women-in-STEM platform (2,200+ registered members, 8,000+ women supported lifetime) · Webflow → Next.js cutover 86.6% solo across 10 months with zero broken inbound links · AI mentor-matching engine (GPT-4o-mini, 5-dimensional scoring) shipped on top."],
  ["Chief Technology Officer", "FemTech Weekend", "Mar 2025 — Present", "Sole technical lead for China's first FemTech organisation since its inaugural conference — Next.js Gen-1 → Docusaurus Gen-2 editorial rewrite · operates the 2026 Shanghai Summit (16 confirmed speakers including FemTech-term originator Ida Tin)."],
  ["Open Source Contributor", "CopilotKit (24.6k stars)", "Jun 2025 — Present", "2 merged PRs · 8-agent FemTracker demo + Claude Code MCP setup guide"],
  ["CTO (prev. Senior AI/ML Infrastructure Engineer)", "Sanicle", "Mar 2025 — Feb 2026", "earned the company its IBM Silver Partner certification through a solo build (350+ commits) · OpenAI + pgvector"],
  ["Full-Stack Engineer (Douyin Mall capstone)", "ByteDance", "—", "Spring Boot 3 + solo Vue 3 build · #2 of 8 contributors"],
];
for (const [role, org, dates, detail] of roles) {
  W(`- ${role} · ${org} · ${dates} — ${detail}`);
}

sect("Education");
W("- Master of Applied Computing, Distinction — Lincoln University, New Zealand (Nov 2023 — Dec 2024) · Dean's List Top 5%");
W("- Bachelor of Geography Science, Distinction — Jiangsu Normal University, China (Sep 2012 — Jun 2016)");

sect("Recognition & training");
W("- UN CSW 69 Speaker (Beyond Beijing 30) — UN HQ NYC, Mar 14 2025 · attracted IBM pilot interest and an endorsement from Sierra Leone's Minister of Gender and Children's Affairs");
W("- Outstanding Mentor Award — AI Hackathon Festival 2025 (1 of 14 expert mentors · guided 11 teams / 80+ participants)");
W("- FemTech Excellence Award — FemTech China (Dec 2024)");
W("- UN Women FemTech Hackathon Outstanding Performer — FemTech Weekend (Beijing, Mar 2025)");
W("- Claude Certified Architect — Foundations curriculum completed (Agent SDK · MCP · Claude Code · Claude API · on Anthropic Partner Network track via Engram)");
W("- Anthropic certificates (6): Building with the Claude API · Intro to MCP · Intro to Agent Skills · Claude Code in Action (all May 2026; Claude Code in Action originally Aug 2025) · AI Fluency: Framework & Foundations (Aug 2025, JHIY9NPYTR2D)");
W("- Featured in THISDAYLIVE · PulseMCP · 小宇宙FM (Xiaoyuzhou) · WeChat (FemTech Weekend)");

sect("Reference quote");
W('"Not only his technical ability, but the way he turns ambiguous founder-level direction into working systems, measurable proof, and reliable product surfaces."');
W("— Saba Gecgil · Founder & CEO, GAVIGO Inc.");

sect("For agents / sourcer LLMs");
W("- Two-page Typst-sourced CV regenerated from data/profile/*.yaml.");
W("- Source under cv/ in the GitHub profile repo (https://github.com/ChanMeng666/ChanMeng666).");
W("- Open to founding-team / staff-IC / AI architecture engagements starting Q3 2026.");
W("- Booking: https://cal.com/chan-meng/30min");
W("");

process.stdout.write(out.join("\n") + "\n");
