#import "../theme.typ": *
#import "../components.typ": *

// ─── INTRODUCTION ────────────────────────────────────────────────────────────
// Voice + philosophy. No company or project names — those live in Experience
// and Selected Projects respectively.
#let introduction() = section("Introduction", {
  set text(size: size-body, fill: ink)
  set par(leading: 0.82em, justify: true)
  [
    Builds the AI software that real companies run every day — handling paying customers, private data, and regulated work, not demos. Focus areas: *women's health, cultural technology, and early-stage startup infrastructure*. Works AI-native by default — directing coding agents (Claude Code, Codex) and the *Claude Agent SDK, MCP, and agent-skills* stack Anthropic's partners use, and owning the judgment of what actually ships.
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
      context-line: [An AI financial-wellness app built around te ao Māori — the user's culture lives in the data model, not just the translation layer · an independent research commission from Riria (Missy) Te Kanawa personally (ASB Bank · former KPMG NZ National Māori Sector lead).],
      bullets: (
        [351 commits solo · 48 tables / 494 columns / 22 migrations · 3-model OpenAI composition (`gpt-4o-mini` coach turns + `gpt-4o` synthesis + `gpt-4o-realtime-preview` voice).],
        [*Schema-first te reo Māori* — Maramataka lunar phases and Te Whare Tapa Whā wellness domains live as first-class Drizzle enum types, not UI labels (prevents the "i18n drift" where cultural concepts decay into English-only columns).],
        [*19-user research cohort sustained 4 months* · 181 bilingual journal entries · 35 voice sessions · 146 AI coach messages · 74 daily check-ins.],
      ),
    ),
    (
      logo: "/public/brands/echook-logo.svg",
      name: "echook — claude-code-audio-hooks",
      url: "https://github.com/ChanMeng666/echook",
      context-line: [A noise-control system for AI coding assistants — turns down their constant audio chatter during deep work, alerts only on the things that matter.],
      bullets: (
        [*Reference implementation of the Claude Agent SDK hooks lifecycle* — PreToolUse · PostToolUse · status line · context-window quota. 26 hook events · 42 releases · 139 tests on triple-platform CI (Linux / macOS / Windows).],
        [*Cross-tool by design* — single hook system, three IDE surfaces: Claude Code, Cursor, OpenAI Codex.],
        [Started as an internal noise-fix for long-running background agents; open-sourced after teammates asked for it; now community-adopted across all three IDEs.],
      ),
    ),
    (
      logo: "/public/brands/vitex.svg",
      name: "Vitex — AI Career Agent",
      url: "https://www.vitex.org.nz/",
      context-line: [Paste a job description, get a tailored resume + cover letter scored against the JD's keywords in under 30 seconds · ~95% solo · 168 commits · Vercel AI SDK + GPT-4o + Typst.],
      bullets: (
        [*7-step AI pipeline streaming over SSE* (JD parsing → background → match analysis → resume tailoring → ATS scoring → cover letter → Typst doc generation) · every stage Zod-validated structured output · disables OpenAI strict-JSON mode on `.optional()` Zod schemas.],
        [*Typst compiles PDFs locally in under 100 ms* across 14 AI-auto-selected templates — no hosted Chromium, no third-party doc-gen API.],
        [*Three production migrations* (Railway → Cloudflare Workers → DigitalOcean VPS) + LaTeX → Typst engine swap, zero downtime · Docker + Traefik + GitHub Actions CD · Stripe credits ledger + share-token URLs.],
      ),
    ),
    (
      logo: "/public/brands/server-google-news.svg",
      name: "Google News MCP Server",
      url: "https://glama.ai/mcp/servers/ChanMeng666/server-google-news",
      context-line: [Earliest-ecosystem MCP server — gives AI assistants live Google News access. Shipped 35 days after Anthropic's Nov 2024 MCP launch.],
      bullets: (
        [*Featured in Skywork AI's AI-engineer deep-dive guide* — listed across *15+ MCP catalogs* · PulseMCP "Top Pick" · Glama A-rating · 122 stars · `@chanmeng666/google-news-server` on npm.],
        [*Shipped before MCP had a registry* — built own discovery story (PulseMCP + Glama + npm submissions), compounding into first-mover index advantage as catalogs came online.],
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
        *Also built:* #link("https://eatropolis.co.nz/")[eatropolis.co.nz] (solo 9-day commercial event platform for Chow Luck Club × Tātaki Auckland Unlimited / Auckland Council) · #link("https://gradient-svg-generator.vercel.app/")[gradient-svg-generator] (340+ animated-SVG templates, 273 solo commits) · #link("https://github.com/ChanMeng666/typst-claude-skill")[typst-claude-skill] (official Typst skill for Claude Code — typesets this CV) · #link("https://sunostats.chanmeng.org/")[SunoStats] (industry's first Suno music lineage explorer · trilingual English / Simplified Chinese / Japanese) · #link("https://github.com/ChanMeng666/archlang")[ArchLang] (a floor-plan programming language I invented — compiles to professional SVG plans; published to npm) · #link("https://archcanvas.chanmeng.org/")[ArchCanvas] (AI design agent for architects that productizes ArchLang).
      ]
    },
  )
})
