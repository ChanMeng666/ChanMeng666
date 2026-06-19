#import "../theme.typ": *
#import "../components.typ": *

// ─── Education (moved to LEFT column end — kept here as compact helper) ─────
#let education() = section("Education", {
  compact-entry(
    title: "Master of Applied Computing",
    org: "Lincoln University",
    dates: "Nov 2023 — Dec 2024",
    location: "New Zealand",
    note: "Distinction (80%+) · Dean's List, Top 5%",
  )
})

// ─── 1. What I bring to a team (plain-English value statements) ─────────────
// This is the recruiter/HR/founder-facing distillation of the architect-grade
// patterns the technical sections demonstrate. Each line is one capability +
// one concrete signal.
#let what-i-bring() = section("What I Bring to a Team", {
  set text(size: size-meta, fill: ink)
  // Within-bullet leading is tight; between-bullet spacing ~2× wider so the eye
  // binds each bullet as a single unit and the list still breathes.
  set par(leading: 0.72em)
  set list(
    marker: text(fill: accent)[•],
    spacing: 9pt,
    indent: 0pt,
    body-indent: 7pt,
  )
  list.item[
    *Ship production AI agents that don't fall over.* Multi-agent systems with hard guardrails enforced in code — not just prompts — for compliance and financial steps.
  ]
  list.item[
    *Keep AI fast and affordable to run.* Prompt caching, model-tier routing, and evaluation harnesses with documented failure modes — not hype.
  ]
  list.item[
    *Keep every customer's data separate and safe.* Per-customer isolation (multi-tenant), durable error handling, observability.
  ]
  list.item[
    *Senior judgement on the big technical calls.* Discovery-first planning before coding · structured CI output · deterministic code-level guardrails over prompt instructions.
  ]
  list.item[
    *Make the whole team faster.* Internal CLIs, IDE hooks, and MCP servers that compound across the engineering org.
  ]
})

// ─── 2. AI engineering & tooling (merged) ────────────────────────────────────
// Single unified block covering BOTH "tools Chan uses to build AI systems"
// and "AI agents Chan operates daily" — the previous CLAUDE CODE & CODEX
// and AI DEVELOPMENT TOOLING sections were thematically the same surface
// (AI tools / AI frameworks / using AI for dev + productivity).
//
// Subcategory ordering: coding-agent mastery first (Claude Code → Codex CLI
// → cross-IDE dev work), then engineering substrate (SDKs/protocols),
// finally production discipline (quality + observability — populated from
// the tools that actually appear in data/profile/*.yaml; the previous
// Braintrust/Langfuse/Inspect AI list was inaccurate).
#let ai-engineering-toolkit() = section("AI Engineering & Tooling", {
  // Each surface listed below appears in EXACTLY ONE row. MCP lives only in
  // Agent protocols; Hooks lives only in Claude Code; LangGraph/LangChain/
  // CopilotKit/Vercel AI SDK live only in Agent SDKs & frameworks (removed
  // from Stack to dedup).
  // Each Claude Code pill is backed by production work — echook ships
  // CLAUDE.md/hooks/status-line/plugins; typst-claude-skill packages a
  // reusable Skill on the awesome-skills lists; subagents drive Chan's
  // multi-agent demos. No built-in-feature filler ("Slash commands",
  // etc.) — quality over quantity.
  skill-category("Claude Code — every extension surface shipped", (
    "CLAUDE.md",
    "Skills",
    "Subagents",
    "Hooks",
    "Status line",
    "Plugins",
  ))
  // Codex CLI row deliberately short — only architectural / automation
  // capabilities. Built-in conveniences (Goal mode, /review, Session
  // resume) removed; AGENTS.md + sandbox/approval architecture + headless
  // mode are the surfaces a senior agent engineer actually configures.
  skill-category("Codex CLI — daily-driver fluency", (
    "AGENTS.md",
    "Sandbox + approvals",
    "Headless mode",
  ))
  skill-category("Beyond pure coding — AI-leveraged dev work", (
    "Typst PDFs",
    "CI/CD pipelines",
    "Slack apps",
    "Agent teams",
    "Code review",
    "Internal CLIs",
  ))
  skill-category("Agent SDKs & frameworks", (
    "Claude Agent SDK",
    "OpenAI Agents SDK",
    "LangGraph",
    "LangChain",
    "CopilotKit",
    "Vercel AI SDK",
  ))
  skill-category("How agents connect to tools & data", (
    "MCP (Model Context Protocol)",
  ))
  // Real tools from profile.yaml: Vitest (multiple projects), Cypress
  // (Douyin Mall Vue 3 supplement), mcp-evals 2.0.0 (early adopter, line
  // 4148), Lighthouse (95+ scores cited in 4 projects), OpenTelemetry
  // (via @opentelemetry/api, line 7407), web-vitals 5.0 (production
  // perf telemetry, line 4508).
  skill-category("Quality & observability", (
    "Vitest",
    "Cypress",
    "mcp-evals",
    "Lighthouse",
    "OpenTelemetry",
    "web-vitals",
  ))
})

// ─── 4. Stack ────────────────────────────────────────────────────────────────
// Engineering substrate: the LLMs, the app frameworks, the production
// infra, the languages. The previous "AI frameworks" row (LangGraph,
// CopilotKit, Vercel AI SDK) moved to AI Engineering & Tooling's "Agent
// SDKs & frameworks" row — each surface appears exactly once.
#let stack() = section("Stack", {
  skill-category("Models", (
    "Anthropic Opus / Sonnet / Haiku",
    "OpenAI GPT-4o + realtime",
    "Gemini 2.x",
    "Llama 3.x",
  ))
  skill-category("App frameworks", (
    "Next.js 16",
    "React",
    "Vue 3",
    "Spring Boot 3",
    "FastAPI",
    "TailwindCSS",
    "Drizzle ORM",
    "Zod",
  ))
  // Vercel + Stripe removed (brand names, not engineering depth). Docker
  // + Traefik comes from the Vitex production VPS stack (Railway →
  // Cloudflare Workers → DigitalOcean migration); Redis comes from
  // multiple production projects (GAVIGO activation pool, Sanicle, She
  // Sharp mentor cache, ByteDance backend) — both backed by profile.yaml.
  skill-category("Infra & data", (
    "Kubernetes GKE",
    "Cloudflare Workers + Vectorize",
    "Neon Postgres + pgvector",
    "Supabase",
    "Docker + Traefik",
    "Redis",
    "Stripe",
    "NextAuth",
  ))
  skill-category("Languages", (
    "TypeScript",
    "Python",
    "Go",
    "Java",
    "SQL",
    "Typst",
  ))
})

// ─── 5. Certifications & training ────────────────────────────────────────────
#let certifications() = section("Certifications & Training", {
  cert-group("Anthropic (6)", (
    [*Building with the Claude API · Intro to MCP · Intro to Agent Skills · Claude Code in Action* (all May 2026; *Claude Code in Action* originally Aug 2025) · *AI Fluency: Framework & Foundations* (Aug 2025)],
    [*Claude Certified Architect — Foundations* curriculum completed (on Anthropic Partner Network track via Engram)],
  ))
  cert-group("Other AI / Cloud", (
    [*Google AI Essentials · Microsoft Azure AI Essentials · Generative AI Career Skills · Wolfram Machine Learning Foundations · GitHub Professional · Docker Professional · Microsoft Software Development* (Dec 2024 — Aug 2025)],
  ))
  // Engineering breadth — verified skill certifications (50+ total across issuers,
  // mostly Dec 2024). Surfaces the depth behind the headline AI/Cloud credentials.
  cert-group("Engineering & platforms (50+ total)", (
    [*HackerRank Software Engineer* + 22 skill certifications — *SQL (Advanced)* · Problem Solving · Go · Node.js · React · Angular],
    [*Microsoft* (Azure · System Administration · Project Management) · *C++ Institute* · *Anaconda Python* · *Atlassian Agile* · *Mozilla*],
  ))
})

// ─── 6. Recognition + reference quotes ───────────────────────────────────────
#let recognition-and-reference() = section("Recognition", {
  set text(size: size-tiny, fill: ink)
  // Tight within-bullet leading; ~2.5× wider between bullets so each recognition
  // reads as its own airy line.
  set par(leading: 0.7em)
  set list(
    marker: text(fill: accent, size: 5.5pt)[•],
    spacing: 9pt,
    indent: 0pt,
    body-indent: 6pt,
  )
  list.item[*UN CSW 69 Speaker* — UN HQ NYC, Mar 2025 · attracted *IBM pilot interest* and an endorsement from Sierra Leone's Minister of Gender and Children's Affairs.]
  list.item[*Outstanding Mentor Award* — AI Hackathon Festival 2025 · 1 of 14 expert mentors · guided 11 teams / 80+ participants.]
  // FemTech China and FemTech Weekend are TWO DISTINCT organisations — separate
  // events, separate awards. Never combine them. (See data/profile/30-recognition.yaml awards[].)
  list.item[*Excellence Award* — FemTech China (Women's Health Technology Challenge, Dec 2024).]
  list.item[*UN Women FemTech Hackathon — Outstanding Performer* — FemTech Weekend, Beijing (Mar 2025).]
})

// ─── 7. Endorsements — removed ──────────────────────────────────────────────
// Testimonial quote dropped in this iteration to make room for the wider
// inter-bullet / inter-entry spacing the user requested. Most professional
// CVs do not carry testimonials; full quote remains available in
// data/profile/50-references.yaml for reference-check stages.
#let endorsements() = []

// ─── Assemble entire right column ────────────────────────────────────────────
// Order: value statements (HR-facing) → core toolset → stack → credentials →
// recognition + quote. Education is composed by the entry point at the bottom
// of the LEFT column (sidebar-no-education) to balance vertical fill.
#let sidebar-no-education() = {
  what-i-bring()
  ai-engineering-toolkit()
  stack()
  certifications()
  recognition-and-reference()
}

#let sidebar() = {
  sidebar-no-education()
  education()
}
