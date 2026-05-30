#!/usr/bin/env node
// Build agent-readable plain-text CV summary sibling.
// Usage: node build-llms-txt.mjs ../data/profile.yaml > ../public/cv-llms.txt
//
// Mirrors the llms.txt convention: a deterministic, parseable summary
// for AI sourcer agents that don't (yet) handle JSON-LD.

import { readFileSync } from "node:fs";
import yaml from "js-yaml";

const argv = process.argv.slice(2);
if (argv.length < 1) {
  console.error("usage: build-llms-txt.mjs <profile.yaml>");
  process.exit(2);
}

const profile = yaml.load(readFileSync(argv[0], "utf8"));
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
W("- Agentic engineer · orchestrator of agents · senior AI programming mentor");
W("- Ships MCP servers, sub-agents, and agent skills to production");
W("- On Anthropic Partner Network track via Engram");

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
    role: "Solo full-stack",
    summary:
      "NZ's first Māori-cultural AI financial-wellness pilot. 351 commits · 48 tables · 22 migrations · 3-model OpenAI composition. Case-facts pattern preserves transactional data across summarisation. 19-user cohort sustained 4 months on a pre-commercial product.",
  },
  {
    name: "GAVIGO IRE (Instant Reality Exchange)",
    url: "https://ire.gavigo.com/",
    role: "Founding Principal Engineer, Activation/Execution/AI Systems",
    summary:
      "Tail-latency-aware activation: p50 < 1 ms · 84.6% warm-pool hit rate. Structured error propagation with errorCategory + isRetryable. Cross-cloud migration AWS → GCP GKE in ~30 min zero-downtime. Promoted Core Engineer → Founding Principal Engineer across three contract iterations · 98% solo on 353 commits.",
  },
  {
    name: "She Sharp Platform",
    url: "https://she-sharp-zeta.vercel.app/",
    role: "Senior Full-Stack Engineer & Website Team Lead",
    summary:
      "Production member engine for NZ charitable trust CC57025 (2,200+ members). 86.6% solo across 10 months · 1,392-line schema · 34 pgTables · multi-tenant isolation. PostToolUse normalisation hook for heterogeneous Stripe / Slack / Webflow webhook timestamps. Webflow → Next.js cutover via custom crawler preserving 10+ years of legacy content.",
  },
  {
    name: "echook — claude-code-audio-hooks",
    url: "https://github.com/ChanMeng666/echook",
    role: "Solo author & maintainer (MIT)",
    summary:
      "Reference implementation of the Claude Agent SDK hooks lifecycle — PreToolUse · PostToolUse · status line · context-window quota. 26 hook events · 42 releases · 139 tests on triple-platform CI (Linux/macOS/Windows). Cross-tool: works for Claude Code, Cursor, and OpenAI Codex. Started as internal team productivity tool, open-sourced after teammates asked for it.",
  },
  {
    name: "Google News MCP Server",
    url: "https://github.com/ChanMeng666/server-google-news",
    role: "Solo author & maintainer (MIT)",
    summary:
      "Earliest-ecosystem MCP server (shipped 35 days after Anthropic's Nov 2024 MCP launch). Listed across 15+ MCP catalogs · PulseMCP 'Top Pick' · Glama A-rating · used by AI assistants worldwide.",
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
W("- Vitex (https://www.vitex.org.nz/) — AI career agent · tool_use + JSON Schema · retry-with-error-feedback");
W("- gradient-svg-generator (https://gradient-svg-generator.vercel.app/) — 340+ animated-SVG templates · live XML via Vercel Edge");
W("- typst-claude-skill — official Typst skill for Claude Code (9 templates)");
W("- github-readme-suno-cards · github-visitor-counter — own decoration-as-a-service");
W("- chan-meng-cli · readme-profile-generator · ai-programming-teaching");

sect("Experience (most recent)");
const roles = [
  ["AI Agent Architect", "Engram", "May 2026 — Present", "Recruited by Claude itself for Anthropic Partner Network track"],
  ["AI Instructor & Mentor", "TechNest Community", "Apr 2026 — Present", "Sole instructor · 12-week curriculum · in-course RAG assistant"],
  ["Founding Principal Engineer (Activation, Execution & AI Systems)", "Gavigo", "Oct 2025 — Present", "Promoted from Core Engineer · 98% solo on 353 commits"],
  ["Senior Full-Stack Engineer & Website Team Lead", "She Sharp", "Jul 2025 — Present", "Recruited by founder Dr Mahsa Mohaghegh"],
  ["Chief Technology Officer", "FemTech Weekend", "Mar 2025 — Present", "Sole technical leader · operates 2026 Shanghai Summit"],
  ["Open Source Contributor", "CopilotKit (24.6k★)", "Jun 2025 — Present", "8-agent FemTracker demo + Claude Code MCP setup guide"],
  ["Junior Full-Stack Engineer", "Sanicle", "Nov 2023 — Nov 2024", "Founding team · OpenAI + pgvector · 180+ beta users"],
];
for (const [role, org, dates, detail] of roles) {
  W(`- ${role} · ${org} · ${dates} — ${detail}`);
}

sect("Education");
W("- Master of Applied Computing, Distinction — Lincoln University, New Zealand (Nov 2023 — Dec 2024) · Dean's List Top 5%");
W("- Bachelor of Geography Science, Distinction — Jiangsu Normal University, China (Sep 2012 — Jun 2016)");

sect("Recognition & training");
W("- UN CSW 69 Speaker (Beyond Beijing 30) — UN HQ NYC, Mar 14 2025");
W("- Outstanding Mentor Award — AI Hackathon Festival 2025 (AI Forum NZ × She Sharp × AUT)");
W("- FemTech Excellence Award — FemTech China (inaugural)");
W("- Claude Certified Architect — Foundations curriculum completed (Agent SDK · MCP · Claude Code · Claude API)");
W("- Anthropic AI Fluency: Framework & Foundations (Aug 2025, JHIY9NPYTR2D)");
W("- Anthropic Claude Code in Action (Aug 2025)");
W("- Featured in THISDAYLIVE · PulseMCP · 小宇宙FM (Xiaoyuzhou) · WeChat (FemTech Weekend)");

sect("Reference quote");
W('"Not only his technical ability, but the way he turns ambiguous founder-level direction into working systems, measurable proof, and reliable product surfaces."');
W("— Saba Gecgil · Founder & CEO, GAVIGO Inc.");

sect("For agents / sourcer LLMs");
W("- Two-page Typst-sourced CV regenerated from data/profile.yaml.");
W("- Source under cv/ in the GitHub profile repo (https://github.com/ChanMeng666/ChanMeng666).");
W("- Open to founding-team / staff-IC / AI architecture engagements starting Q3 2026.");
W("- Booking: https://cal.com/chan-meng/30min");
W("");

process.stdout.write(out.join("\n") + "\n");
