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
  v(6pt)
  compact-entry(
    title: "Bachelor of Geography Science",
    org: "Jiangsu Normal University",
    dates: "Sep 2012 — Jun 2016",
    location: "China",
    note: "Distinction",
  )
})

// ─── 1. What I bring to a team (plain-English value statements) ─────────────
// This is the recruiter/HR/founder-facing distillation of the architect-grade
// patterns the technical sections demonstrate. Each line is one capability +
// one concrete signal.
#let what-i-bring() = section("What I Bring to a Team", {
  set text(size: size-meta, fill: ink)
  set par(leading: leading-body)
  set list(
    marker: text(fill: accent)[•],
    spacing: 6pt,
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

// ─── 2. Claude Code stack (no echook footnote — dedup) ──────────────────────
#let claude-code-stack() = section("Claude Code Stack", {
  skill-category("Layers shipped to production", (
    "CLAUDE.md",
    "MCP servers",
    "Skills",
    "Subagents",
    "Hooks",
    "Status line",
  ))
})

// ─── 3. AI development tooling ───────────────────────────────────────────────
#let ai-tooling() = section("AI Development Tooling", {
  skill-category("Daily drivers", (
    "Claude Code",
    "Codex CLI",
    "Cursor",
    "Claude Design",
    "GitHub Copilot",
  ))
  skill-category("Eval & observability", (
    "Braintrust",
    "Langfuse",
    "Inspect AI",
    "OpenTelemetry",
  ))
  skill-category("Inter-agent protocols", (
    "MCP (tools)",
    "A2A (inter-agent)",
    "AGNTCY",
    "ACP",
  ))
})

// ─── 4. Stack ────────────────────────────────────────────────────────────────
#let stack() = section("Stack", {
  skill-category("Models", (
    "Anthropic Opus / Sonnet / Haiku",
    "OpenAI GPT-4o + realtime",
    "Gemini 2.x",
    "Llama 3.x",
  ))
  skill-category("Frameworks", (
    "LangGraph",
    "CopilotKit",
    "Vercel AI SDK",
    "Drizzle ORM",
    "Next.js 16",
  ))
  skill-category("Infra", (
    "Kubernetes GKE",
    "Cloudflare Workers + OpenNext",
    "Neon Postgres + pgvector",
    "Vercel",
    "Stripe",
  ))
  skill-category("Languages", (
    "TypeScript",
    "Python",
    "Go",
    "SQL",
    "Typst",
  ))
})

// ─── 5. Certifications & training ────────────────────────────────────────────
#let certifications() = section("Certifications & Training", {
  cert-group("Anthropic", (
    "AI Fluency: Framework & Foundations (Aug 2025, JHIY9NPYTR2D)",
    "Claude Code in Action (Aug 2025)",
    "Claude Certified Architect — Foundations curriculum completed (on Partner Network track via Engram)",
  ))
  cert-group("HackerRank", (
    "Software Engineer · Frontend Developer (React) · SQL (Advanced) · Problem Solving (Intermediate)",
  ))
})

// ─── 6. Recognition + reference quotes ───────────────────────────────────────
#let recognition-and-reference() = section("Recognition", {
  set text(size: size-tiny, fill: ink)
  set par(leading: leading-tight)
  set list(
    marker: text(fill: accent, size: 5.5pt)[•],
    spacing: 4pt,
    indent: 0pt,
    body-indent: 5pt,
  )
  list.item[*UN CSW 69 Speaker* — Beyond Beijing 30 Conference, UN HQ NYC (Mar 2025). Attracted *IBM pilot interest* and a public endorsement from Sierra Leone's Minister of Gender and Children's Affairs.]
  list.item[*Outstanding Mentor Award* — AI Hackathon Festival 2025 · 1 of 14 expert mentors · guided 11 teams / 80+ participants.]
  list.item[*FemTech Excellence Award* — FemTech China (inaugural FemTech Weekend).]
  list.item[*UN Women FemTech Hackathon — Outstanding Performer* (Beijing, Mar 2025) · independent-developer recognition for cross-org collaboration with Sanicle and the NGO CSW Forum.]
  list.item[*Dean's List Honoree (Top 5%)* — Lincoln University, NZ.]

  v(8pt)
  quote-block(
    [Not only his technical ability, but the way he turns ambiguous founder-level direction into working systems, measurable proof, and reliable product surfaces.],
    source: [Saba Gecgil · Founder & CEO, GAVIGO Inc.],
  )

  v(6pt)
  quote-block(
    [Chan is someone you feel genuinely confident working with — she naturally becomes the technical backbone of the team.],
    source: [Lesley Gao · She Sharp design team (May 2026)],
  )
})

// ─── Assemble entire right column ────────────────────────────────────────────
// Order: value statements (HR-facing) → core toolset → stack → credentials →
// recognition + quote → education at the very end as a non-headline closer.
#let sidebar() = {
  what-i-bring()
  claude-code-stack()
  ai-tooling()
  stack()
  certifications()
  recognition-and-reference()
  education()
}
