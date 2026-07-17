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
W("- Builds the AI software companies run every day — products with paying customers, private data, and regulated work behind them, not demos.");
W("- Works AI-native by default — directs coding agents (Claude Code, Codex) and builds on the Claude Agent SDK, MCP, and agent skills, shipping these as open-source reference implementations, while keeping the call on what actually ships a human one.");
W("- Focus areas: women's health, cultural technology, and early-stage startup infrastructure.");
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
    role: "Solo full-stack — independent research commission from Riria (Missy) Te Kanawa personally (former KPMG NZ National Māori Sector lead; now Māori Executive Lead at ASB Bank, her employer — ASB did not commission this work)",
    summary:
      "AI financial-wellness app built around te ao Māori — a bilingual (te reo Māori / English) product with voice coaching, journaling, and daily check-ins, composing three OpenAI models (one a realtime voice coach). Culture lives in the data model, not the translation layer — Maramataka lunar phases and Te Whare Tapa Whā wellness domains are first-class Drizzle types, so they can't decay into English-only labels. A 19-user research cohort over 4 months produced 181 bilingual journal entries and 74 daily check-ins — strong engagement for a pre-commercial pilot with no marketing. 351 commits solo · 48 tables / 494 columns / 22 migrations · 3-model OpenAI composition (gpt-4o-mini coach turns + gpt-4o synthesis + gpt-4o-realtime-preview voice) · 35 voice sessions · 146 AI coach messages.",
  },
  {
    name: "GAVIGO IRE (Instant Reality Exchange)",
    url: "https://ire.gavigo.com/",
    role: "Founding Principal Engineer, Activation/Execution/AI Systems",
    summary:
      "Tap a game in a feed and it plays instantly — no app-store install. An AI scheduler keeps content pre-warmed on Kubernetes (GKE) so a tapped game resumes in under a millisecond, and the platform moved across clouds (DigitalOcean → GCP) with zero downtime. Tail-latency-aware: p50 < 1 ms restore · 84.6% warm-pool hit rate · structured error propagation with errorCategory + isRetryable · cross-cloud DigitalOcean → GCP GKE migration in ~30 min zero-downtime cutover · promoted Core Engineer → Founding Principal Engineer across three contract iterations · ~97% solo on 426 of 439 non-merge commits.",
  },
  {
    name: "She Sharp Platform",
    url: "https://she-sharp-zeta.vercel.app/",
    role: "Senior Full-Stack Engineer & Website Team Lead — recruited by founder Dr Mahsa Mohaghegh",
    summary:
      "Rebuilt New Zealand's leading women-in-STEM platform (2,200+ registered members, 8,000+ women supported lifetime) — moved the community off a drag-and-drop website onto one system for sign-ups, events, and mentor matching, with 10+ years of legacy content carried over via a custom crawler and zero broken inbound links. Mentors and mentees are paired by an AI mentor-matching engine (GPT-4o-mini, 5-dimensional scoring) with human review. ~85% solo across ~12 months · 793 of 936 commits · Webflow → Next.js cutover · 1,411-line schema · 35 pgTables · multi-tenant isolation · PostToolUse normalisation hook for heterogeneous Stripe / Slack / Webflow webhook timestamps.",
  },
  {
    name: "Vitex — AI Career Agent",
    url: "https://www.vitex.org.nz/",
    role: "Solo author & maintainer (essentially sole-authored · 379 commits over ~18 months)",
    summary:
      "Paste a job description, get a tailored resume and cover letter scored against the job's keywords in under 30 seconds. The user watches their resume assemble live instead of a spinner — each stage streams over SSE (Vercel AI SDK), validated by Zod. Typst compiles the PDFs locally in under 100 ms across 7 auto-selected templates — no hosted Chromium or external doc API. Kept running through three production migrations (Railway → Cloudflare Workers → DigitalOcean) and a LaTeX → Typst engine swap, zero downtime. 8-step AI pipeline (JD parsing → background parsing → match analysis → resume tailoring → ATS scoring → cover letter → template render → PDF compile) · gpt-5.5 (reasoning) / gpt-5.4-mini (extract) · Docker + Traefik + GitHub Actions CD · Stripe credits ledger + share-token URLs.",
  },
  {
    name: "echook — claude-code-audio-hooks",
    url: "https://github.com/ChanMeng666/echook",
    role: "Solo author & maintainer (MIT)",
    summary:
      "Noise-control system for AI coding assistants — quiets their constant audio chatter during deep work, alerts only on what matters, so developers can run long agent sessions unattended. A reference implementation of the Claude Agent SDK hooks lifecycle — PreToolUse · PostToolUse · status line · context-window quota. One hook system, three IDE surfaces — Claude Code, Cursor, and OpenAI Codex; now adopted across all three. 37 hook events · 42 releases · 248 tests on triple-platform CI (Linux/macOS/Windows). Started as an internal noise-fix for long-running background agents; open-sourced after teammates asked for it.",
  },
  {
    name: "Google News MCP Server",
    url: "https://glama.ai/mcp/servers/ChanMeng666/server-google-news",
    role: "Solo author & maintainer (MIT)",
    summary:
      "Earliest-ecosystem MCP server — gives AI assistants live Google News access. Shipped 35 days after Anthropic's Nov 2024 MCP launch, before MCP had a registry, so it built its own discovery path — a first-mover index advantage that compounded as catalogs came online. Listed across 15+ MCP catalogs · PulseMCP 'Top Pick' · Glama A-rating · 122 stars · featured in Skywork AI's AI-engineer deep-dive guide · @chanmeng666/google-news-server on npm.",
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
W("- gradient-svg-generator (https://gradient-svg-generator.vercel.app/) — 355 animated-SVG templates for READMEs across 19 categories");
W("- typst-claude-skill — official Typst skill for Claude Code (typesets this CV)");
W("- Seismophone (https://seismophone.chanmeng.org/) — an independent observatory for AI music · trilingual English / Simplified Chinese / Japanese · Docker + Traefik VPS");
W("- ArchLang (https://github.com/ChanMeng666/archlang) — a floor-plan programming language I invented: compiles to professional SVG plans (Typst/LaTeX for architecture) · zero-dependency isomorphic TypeScript · published to npm as @chanmeng666/archlang");
W("- ArchCanvas (https://archcanvas.uk/) — AI design agent for architects that productizes ArchLang · gpt-5.5 orchestration + GPT Image 2 renderings grounded on the compiled plan, on a zoomable canvas · edits morph the plan in place instead of regenerating it");

sect("Experience (most recent)");
const roles = [
  ["AI Agent Architect", "Engram", "May 2026 — Present", "Recruited onto Anthropic's Partner Network architect track — Engram's founder asked his own Claude agent to surface candidates, and Chan's open-source portfolio was the pick (publicly confirmed by founder Luka Madzarac). Now in the 45-day Architect Cohort on the Claude Certified Architect — Foundations curriculum."],
  ["AI Instructor & Mentor", "TechNest Community", "Apr 2026 — Present", "Sole instructor of TechNest's first AI-specialised mentorship track — her fifth teaching cohort since 2024. Students arrive knowing only browser ChatGPT and, over 12 weeks, learn to build by directing coding agents, shipping a live multi-user AI product by the end. Also built the bilingual teaching platform that hosts it, ~96% solo, including an in-course RAG assistant on Cloudflare Workers (Llama 3.1 8B + Vectorize + KV)."],
  ["Founding Principal Engineer (Activation, Execution & AI Systems)", "Gavigo", "Oct 2025 — Present", "Owns the intelligence layer of GAVIGO's app-activation platform — tap a game in a feed and it plays instantly, no app-store install. Built the AI scheduler that keeps content pre-warmed on Kubernetes (GKE) so a tapped game resumes in under a millisecond, and moved the platform across clouds (DigitalOcean → GCP) with zero downtime. Promoted Core Engineer → Founding Principal Engineer across three contract iterations, building nearly the whole system solo · p50 < 1 ms · 84.6% warm-pool hit rate · ~97% solo on 426 of 439 non-merge commits."],
  ["Senior Full-Stack Engineer & Website Team Lead", "She Sharp", "Jul 2025 — Present", "Recruited by founder Dr Mahsa Mohaghegh to rebuild the member platform for New Zealand's leading women-in-STEM charity (2,200+ registered members, 8,000+ women supported lifetime). Moved the community off a drag-and-drop website onto one system for sign-ups, events, and mentor matching — 10+ years of content carried over with zero broken inbound links, ~85% solo over a year. Mentors and mentees are paired by AI scoring (GPT-4o-mini, 5-dimensional scoring) with human review · 793 of 936 commits · Webflow → Next.js."],
  ["Chief Technology Officer", "FemTech Weekend", "Mar 2025 — Present", "Sole engineer behind China's first women's-health-technology organisation — built, then rebuilt its entire web platform twice as the mission grew, from a marketing site on Next.js to an editorial and research platform on Docusaurus. Ran the digital infrastructure for the 2026 Shanghai Summit (June 22–25), a four-day event with 20 confirmed speakers headlined by Ida Tin, who coined the term \"FemTech\"."],
  ["Open Source Contributor", "CopilotKit (24.6k stars)", "Jun 2025 — Present", "2 merged PRs · 8-agent FemTracker demo + Claude Code MCP setup guide"],
  ["CTO (prev. Senior AI/ML Infrastructure Engineer)", "Sanicle", "Mar 2025 — Feb 2026", "Joined as Senior AI/ML Infrastructure Engineer, promoted to CTO. Took Sanicle from a no-code prototype to the production B2B FemTech SaaS employers buy for their staff — menstrual and menopause workplace wellness. Personally integrated IBM watsonx into the product, the work that earned Sanicle its IBM Silver Partner certification · solo build, 350+ commits · OpenAI + pgvector."],
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
