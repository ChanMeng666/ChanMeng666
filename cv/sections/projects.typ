#import "../theme.typ": *
#import "../components.typ": *

// ─── INTRODUCTION ────────────────────────────────────────────────────────────
// Voice + philosophy. No company or project names — those live in Experience
// and Selected Projects respectively.
#let introduction() = section("Introduction", {
  set text(size: size-body, fill: ink)
  set par(leading: 0.82em, justify: true)
  [
    Builds the AI software companies run every day — products with paying customers, private data, and regulated work behind them, not demos. Focus areas: *women's health, cultural technology, and early-stage startup infrastructure*. Works AI-native by default — directing coding agents (Claude Code, Codex) and building on the *Claude Agent SDK, MCP, and agent skills*, while keeping the call on what actually ships a human one.
  ]
})

// ─── SELECTED OPEN-SOURCE PROJECTS ───────────────────────────────────────────
// Three independent OSS / commissioned-solo projects. NOT products built at
// employers — those live in Experience. The italic closer line absorbs all
// other tools so they each appear exactly once across the CV.
#let projects() = section("Selected Open-Source Projects", {
  let cards = (
    (
      logo: "/public/brands/tam-ai-ti-logo-with-brand.svg",
      name: "Tam-AI-Ti",
      url: "https://tamaiti.whiri-ai.com/",
      context-line: [An AI financial-wellness app for Māori communities, built around te ao Māori · an independent research commission from Riria (Missy) Te Kanawa personally (former KPMG NZ National Māori Sector lead; now Māori Executive Lead at ASB Bank, her employer).],
      bullets: (
        [Built solo end to end — a bilingual (te reo Māori / English) product with voice coaching, journaling, and daily check-ins, composing three OpenAI models (one a realtime voice coach).],
        [*Culture lives in the data model, not the translation layer* — Maramataka lunar phases and Te Whare Tapa Whā wellness domains are first-class Drizzle types, so they can't decay into English-only labels.],
        [A *19-user research cohort over 4 months* produced 181 bilingual journal entries and 74 daily check-ins — strong engagement for a pre-commercial pilot with no marketing.],
      ),
    ),
    (
      logo: "/public/brands/echook-logo.svg",
      name: "echook — claude-code-audio-hooks",
      url: "https://github.com/ChanMeng666/echook",
      context-line: [A noise-control system for AI coding assistants — quiets their constant audio chatter during deep work, alerts only on what matters.],
      bullets: (
        [Lets developers run long agent sessions unattended — alerts fire only when something needs a human. A *reference implementation of the Claude Agent SDK hooks lifecycle*, with triple-platform CI.],
        [One hook system, three IDE surfaces — Claude Code, Cursor, and OpenAI Codex; now adopted across all three.],
      ),
    ),
    (
      logo: "/public/brands/vitex.svg",
      name: "Vitex — AI Career Agent",
      url: "https://www.vitex.org.nz/",
      context-line: [Paste a job description, get a tailored resume and cover letter scored against the job's keywords in under 30 seconds · sole-authored over \~18 months · Vercel AI SDK + gpt-5.5 / gpt-5.4-mini + Typst.],
      bullets: (
        [The user watches their resume assemble live instead of a spinner — each stage streams over SSE (Vercel AI SDK), validated by Zod.],
        [*Typst compiles the PDFs locally in under 100 ms* across 7 templates — no hosted Chromium or external doc API.],
        [Kept it running through *three production migrations* (Railway → Cloudflare Workers → DigitalOcean) and a LaTeX → Typst engine swap, zero downtime · Docker + Traefik.],
      ),
    ),
    (
      logo: "/public/brands/server-google-news.svg",
      name: "Google News MCP Server",
      url: "https://glama.ai/mcp/servers/ChanMeng666/server-google-news",
      context-line: [Earliest-ecosystem MCP server — gives AI assistants live Google News access. Shipped 35 days after Anthropic's Nov 2024 MCP launch.],
      bullets: (
        [*Listed across 15+ MCP catalogs* — a PulseMCP "Top Pick", a Glama A-rating, 122 stars, featured in Skywork AI's engineer deep-dive.],
        [*Shipped before MCP had a registry*, so it built its own discovery path — a first-mover index advantage that compounded as catalogs came online.],
      ),
    ),
  )

  for (i, c) in cards.enumerate() {
    project-card(
      logo: c.logo,
      name: c.name,
      url: c.url,
      context-line: c.context-line,
      bullets: c.bullets,
    )
    if i < cards.len() - 1 { cv-divider() }
  }

  // ── Italic closer line — absorbs all other open-source tools so each ────
  //    project appears exactly once across the entire CV. A clear gap (≈ the
  //    inter-card rhythm) separates it from the last project card above so it
  //    doesn't read as part of the Google News MCP entry.
  v(12pt)
  block(
    {
      set text(size: size-tiny, fill: muted, style: "italic")
      set par(leading: 0.68em, justify: true)
      [
        *Also built:* #link("https://eatropolis.co.nz/")[eatropolis.co.nz] — Auckland's one-day food festival platform (Chow Luck Club × Tātaki Auckland Unlimited / Auckland Council; solo, 9 days) · #link("https://gradient-svg-generator.vercel.app/")[gradient-svg-generator] (355 animated-SVG templates for READMEs) · #link("https://github.com/ChanMeng666/typst-claude-skill")[typst-claude-skill] (official Typst skill for Claude Code — typesets this CV) · #link("https://seismophone.chanmeng.org/")[Seismophone] (an observatory for AI music) · #link("https://github.com/ChanMeng666/archlang")[ArchLang] (a floor-plan language I invented; on npm) · #link("https://archcanvas.uk/")[ArchCanvas] (an AI design agent built on ArchLang).
      ]
    },
  )
})
