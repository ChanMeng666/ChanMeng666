// ─────────────────────────────────────────────────────────────────────────────
// Chan Meng — AI Agent Architect & Full-stack Engineer
// Two-page Typst CV with balanced two-column layout
// (narrative LEFT 61.8%, structured RIGHT 38.2%, full-width header).
// Source of truth: ../data/profile.yaml.
// Build: pwsh ./build.ps1 → ../public/chan-meng-cv.pdf.
// ─────────────────────────────────────────────────────────────────────────────

#import "theme.typ": *
#import "components.typ": *
#import "sections/header.typ": header
#import "sections/projects.typ": introduction, projects
#import "sections/experience.typ": experience
#import "sections/sidebar.typ": sidebar, sidebar-no-education, education, endorsements
#import "sections/footer.typ": footer

// ── PDF metadata (GEO surface) ────────────────────────────────────────────────
#set document(
  title: "Chan Meng — AI Agent Architect & Full-stack Engineer",
  author: "Chan Meng",
  description: "Two-page CV for Chan Meng — agentic engineer, Claude Code stack expert, senior AI programming mentor based in Auckland, New Zealand. On Anthropic Partner Network track via Engram. Canonical: https://chanmeng.org/cv · JSON-LD: https://chanmeng.org/cv.jsonld · agent summary: https://chanmeng.org/cv-llms.txt",
  keywords: (
    "AI Agent Architect", "agentic engineer", "orchestrator of agents",
    "senior AI programming mentor", "AI-tooling expert",
    "Claude Agent SDK", "AgentDefinition", "Task tool", "hub-and-spoke",
    "PostToolUse hook", "PreToolUse hook", "Claude Code", "Claude Code subagents",
    "Claude Code skills", "Claude Code hooks", "agent skills",
    "MCP server", "MCP gateway", "tool_use", "JSON Schema",
    "Anthropic SDK", "Anthropic Partner Network", "Claude Certified Architect",
    "agentic workflows", "multi-agent orchestration", "A2A", "AGNTCY",
    "LLMOps", "evaluations", "Braintrust", "Langfuse", "Inspect AI",
    "prompt caching", "model routing", "tail latency", "multi-tenant isolation",
    "LangGraph", "CopilotKit", "Vercel AI SDK", "Next.js", "Drizzle",
    "pgvector", "Neon Postgres", "Cloudflare Workers", "OpenNext",
    "Kubernetes", "GKE", "GCP", "TypeScript", "Python", "Go", "Typst",
    "production AI", "RAG", "cultural technology", "women's health technology",
    "te reo Māori", "Auckland New Zealand",
  ),
)

// ── Page geometry ─────────────────────────────────────────────────────────────
#set page(
  paper: "a4",
  margin: (top: 1.1cm, bottom: 0.9cm, left: 1.25cm, right: 1.25cm),
  footer-descent: 0.4cm,
  footer: context [
    #set text(size: 6.6pt, fill: muted)
    #grid(
      columns: (1fr, auto, 1fr),
      align: (left + horizon, center + horizon, right + horizon),
      [Chan Meng — AI Agent Architect & Full-stack Engineer],
      [#counter(page).display("1 / 1", both: true)],
      [Last built #datetime.today().display()],
    )
  ],
)

// ── Base typography ──────────────────────────────────────────────────────────
#set text(font: sans, size: size-body, fill: ink, lang: "en")
#set par(leading: leading-body, justify: false, first-line-indent: 0pt)
#set list(
  marker: text(fill: accent)[•],
  spacing: 5pt,
  indent: 0pt,
  body-indent: 6pt,
)
#show link: it => underline(stroke: 0.3pt + accent, offset: 1.5pt, it)
#show raw: it => text(font: mono, size: 0.92em, fill: ink, it)

// ─────────────────────────────────────────────────────────────────────────────
// HEADER (full width, page 1 only)
// ─────────────────────────────────────────────────────────────────────────────

#header()

// ─────────────────────────────────────────────────────────────────────────────
// BODY — two columns: narrative LEFT (61.8%) · structured RIGHT (38.2%)
// ─────────────────────────────────────────────────────────────────────────────

#grid(
  columns: (col-main, col-side),
  column-gutter: col-gutter,
  align: (left + top, left + top),

  // ─ LEFT COLUMN — narrative
  //   Order: introduction → experience → projects → endorsements.
  //   Education moved to RIGHT column (after the L1 plain-English layer was
  //   added to projects/experience, LEFT became heavier than RIGHT; rebalanced
  //   by putting Education at the foot of the sidebar instead).
  {
    introduction()
    experience()
    projects()
    endorsements()
  },

  // ─ RIGHT COLUMN — value statements + stack + credentials + recognition + education
  sidebar(),
)

// PDF carries an invisible-to-humans GEO surface via metadata only — see
// #set document(...) at the top. Visible page intentionally has no AI-targeted
// footer (human-readers-first principle).
