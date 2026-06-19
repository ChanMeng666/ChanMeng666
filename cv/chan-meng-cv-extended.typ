// ─────────────────────────────────────────────────────────────────────────────
// Chan Meng — EXTENDED CV (multi-page, single-column, spacious)
// A personalized, AI-native companion to the tight 2-page chan-meng-cv.typ.
// Same facts (hand-curated, mirroring data/profile/*.yaml); roomier layout +
// a "How I Work" manifesto and a "What I Build With AI" showcase.
// Build: pwsh ./build.ps1 → ../public/chan-meng-cv-extended.pdf.
// ─────────────────────────────────────────────────────────────────────────────

#import "theme-extended.typ": *
#import "extended.typ": *

// ── PDF metadata (GEO surface) ────────────────────────────────────────────────
#set document(
  title: "Chan Meng — AI Agent Architect & Full-stack Engineer (Extended CV)",
  author: "Chan Meng",
  description: "Extended CV for Chan Meng — AI-native agentic engineer, Claude Code stack expert, senior AI programming mentor based in Auckland, New Zealand. Single-column, long-form companion to the 2-page CV, including how she works and what she builds with AI. Canonical: https://chanmeng.org/cv",
  keywords: (
    "AI Agent Architect", "AI-native engineer", "agentic engineer", "Claude Code",
    "Codex", "Claude Agent SDK", "MCP server", "agent skills", "design systems",
    "documents as code", "Typst", "full-stack", "Auckland New Zealand",
  ),
)

// ── Page geometry — wide, calm margins ───────────────────────────────────────
#set page(
  paper: "a4",
  margin: (top: 1.9cm, bottom: 1.6cm, left: 2cm, right: 2cm),
  footer-descent: 0.5cm,
  footer: context [
    #set text(size: 7.5pt, fill: muted)
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
#set text(font: sans, size: size-body-x, fill: ink, lang: "en")
#set par(leading: leading-body-x, justify: false, first-line-indent: 0pt)
#show link: it => underline(stroke: 0.3pt + accent, offset: 1.5pt, it)
#show raw: it => text(font: mono, size: 0.92em, fill: ink, it)

// ── Document body — single column, top to bottom ─────────────────────────────
#extended-header()
#x-introduction()
#x-how-i-work()
#x-what-i-build()
#x-experience()
#x-projects()
#x-toolkit()
#x-recognition()
#x-certifications()
#x-education()
