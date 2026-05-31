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
  // Within-bullet leading is tight; between-bullet spacing is ~2.2× wider so
  // the eye binds each bullet as a single unit.
  set par(leading: 0.7em)
  set list(
    marker: text(fill: accent)[•],
    spacing: 13pt,
    indent: 0pt,
    body-indent: 6pt,
  )
  list.item[
    *Ship production AI agents that don't fall over.* Multi-agent systems with hard guardrails enforced in code — not just prompts — for compliance and financial steps.
  ]
  list.item[
    *Keep AI cost and latency predictable.* Prompt caching, model-tier routing, evaluation harnesses with documented failure modes — not hype.
  ]
  list.item[
    *Multi-tenant SaaS without context bleed.* Scoped sessions per customer, durable error handling, observability.
  ]
  list.item[
    *Senior judgement on architectural calls.* Discovery-first planning before coding · structured CI output · deterministic code-level guardrails over prompt instructions.
  ]
  list.item[
    *Multiply team velocity.* Internal CLIs, IDE hooks, and MCP servers that compound across the engineering org.
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
// the tools that actually appear in data/profile.yaml; the previous
// Braintrust/Langfuse/Inspect AI list was inaccurate).
#let ai-engineering-toolkit() = section("AI Engineering & Tooling", {
  skill-category("Claude Code — every extension surface shipped", (
    "CLAUDE.md",
    "MCP servers",
    "Skills",
    "Subagents",
    "Hooks",
    "Status line",
  ))
  skill-category("Codex CLI — daily-driver fluency", (
    "AGENTS.md",
    "Goal mode",
    "Sandbox modes",
    "Hooks API",
    "MCP",
    "Resume",
  ))
  skill-category("Beyond pure coding — AI-leveraged dev work", (
    "Typst PDFs",
    "CI/CD pipelines",
    "Slack apps",
    "Agent teams",
    "Code review",
    "Internal CLIs",
  ))
  skill-category("Agent SDKs & protocols", (
    "Claude Agent SDK",
    "OpenAI Agents SDK",
    "MCP",
    "A2A",
    "AGNTCY",
    "ACP",
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
// Engineering substrate: the LLMs, the composition frameworks, the app
// frameworks, the production infra, the languages. Base provider SDKs
// (Anthropic SDK / OpenAI SDK) intentionally omitted — they are subsumed
// by the Claude Agent SDK / OpenAI Agents SDK in the AI Tooling section,
// and listing both creates a duplicated-skills illusion.
#let stack() = section("Stack", {
  skill-category("Models", (
    "Anthropic Opus / Sonnet / Haiku",
    "OpenAI GPT-4o + realtime",
    "Gemini 2.x",
    "Llama 3.x",
  ))
  skill-category("AI frameworks", (
    "LangGraph",
    "CopilotKit",
    "Vercel AI SDK",
  ))
  skill-category("App frameworks", (
    "Next.js 16",
    "Vue 3",
    "Spring Boot 3",
    "FastAPI",
    "Drizzle ORM",
  ))
  skill-category("Infra & data", (
    "Kubernetes GKE",
    "Cloudflare Workers + Vectorize",
    "Neon Postgres + pgvector",
    "Vercel",
    "Stripe",
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
    [*Building with the Claude API* · *Intro to MCP* · *Intro to Agent Skills* · *Claude Code in Action* (all May 2026; *Claude Code in Action* also Aug 2025) · *AI Fluency: Framework & Foundations* (Aug 2025)],
    [*Claude Certified Architect — Foundations* curriculum completed (on Anthropic Partner Network track via Engram)],
  ))
  cert-group("Other AI / Cloud", (
    [*Google AI Essentials* (Coursera, Aug 2025) · *Microsoft Azure AI Essentials* (Feb 2025) · *Generative AI Career Skills* (Dec 2024) · *Wolfram Machine Learning Foundations* (Feb 2025)],
    [*GitHub Professional* (Dec 2024) · *Docker Professional* (Feb 2025) · *Microsoft Software Development* (Dec 2024)],
  ))
  cert-group("HackerRank", (
    [*Software Engineer* · *Frontend Developer (React)* · *SQL Advanced* · *Problem Solving Intermediate* · *REST API Intermediate* · *Node.js* · *JavaScript* · *Go* · *Angular* (all Intermediate)],
  ))
})

// ─── 6. Recognition + reference quotes ───────────────────────────────────────
#let recognition-and-reference() = section("Recognition", {
  set text(size: size-tiny, fill: ink)
  // Tight within-bullet (4.55pt baseline gap); ~2× wider between bullets.
  set par(leading: 0.65em)
  set list(
    marker: text(fill: accent, size: 5.5pt)[•],
    spacing: 9pt,
    indent: 0pt,
    body-indent: 5pt,
  )
  list.item[*UN CSW 69 Speaker* — UN HQ NYC, Mar 2025 · attracted *IBM pilot interest* and an endorsement from Sierra Leone's Minister of Gender and Children's Affairs.]
  list.item[*Outstanding Mentor Award* — AI Hackathon Festival 2025 · 1 of 14 expert mentors · guided 11 teams / 80+ participants.]
  list.item[*FemTech Excellence Award* — FemTech China (inaugural FemTech Weekend) · *UN Women FemTech Hackathon Outstanding Performer* (Beijing, Mar 2025).]
})

// ─── 7. Endorsements — removed ──────────────────────────────────────────────
// Testimonial quote dropped in this iteration to make room for the wider
// inter-bullet / inter-entry spacing the user requested. Most professional
// CVs do not carry testimonials; full quote remains available in
// data/profile.yaml::references for reference-check stages.
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
