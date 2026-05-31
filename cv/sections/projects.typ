#import "../theme.typ": *
#import "../components.typ": *

// ─── INTRODUCTION ────────────────────────────────────────────────────────────
// Voice + philosophy. No company or project names — those live in Experience
// and Selected Projects respectively.
#let introduction() = section("Introduction", {
  set text(size: size-body, fill: ink)
  set par(leading: 0.78em, justify: true)
  [
    Agentic engineer and orchestrator of agents — ships *MCP servers, sub-agents, and agent skills* to production. Building at the intersection of *AI, cultural technology, and women's health*, with a minimalist's bias for removing friction so the work that remains can compound.
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
      context-line: [Māori-cultural AI financial-wellness pilot · commissioned solo by Riria (Missy) Te Kanawa],
      bullets: (
        [351 commits solo · 48 tables / 494 columns / 22 migrations · 3-model OpenAI composition (`gpt-4o-mini` coach turns + `gpt-4o` synthesis + `gpt-4o-realtime-preview` voice).],
        [*Schema-first te reo Māori* — Maramataka lunar phases and Te Whare Tapa Whā wellness domains live as first-class Drizzle enum types, not UI labels. Prevents the "i18n drift" failure mode where cultural concepts decay into English-only columns.],
        [*19-user research cohort sustained 4 months* · 181 bilingual journal entries · 35 voice sessions · 146 AI coach messages · 74 daily check-ins — pre-commercial product, real engagement.],
      ),
    ),
    (
      logo: "/public/brands/echook-logo.svg",
      name: "echook — claude-code-audio-hooks",
      url: "https://github.com/ChanMeng666/echook",
      context-line: [The "dev productivity tool I built for my team that became popular OSS"],
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
      context-line: [Production AI agent · ~95% solo · 168 commits over 3 months · Vercel AI SDK + GPT-4o + Typst],
      bullets: (
        [*7-step AI pipeline streaming over SSE* (JD parsing → background parsing → match analysis → resume tailoring → ATS scoring → cover letter → Typst doc generation) · every stage is Zod-validated structured output · disables OpenAI strict-JSON mode on `.optional()` Zod schemas (real-prod fix captured in commit log).],
        [*Typst compiles PDFs locally in under 100 ms* across 14 AI-auto-selected templates — no hosted Chromium, no third-party doc-gen API · this very CV's resume-pipeline dogfood.],
        [*Three production migrations* (Railway → Cloudflare Workers → DigitalOcean VPS) + a LaTeX → Typst engine swap shipped without service outage · Docker + Traefik + GitHub Actions continuous deploy · Stripe credits ledger + share-token public URLs.],
      ),
    ),
    (
      logo: "/public/brands/server-google-news.svg",
      name: "Google News MCP Server",
      url: "https://github.com/ChanMeng666/server-google-news",
      context-line: [Earliest-ecosystem MCP server — shipped 35 days after Anthropic's Nov 2024 MCP launch],
      bullets: (
        [*Skywork AI featured it as "one of the most elegant, production-ready solutions"* — listed across *15+ MCP catalogs* · PulseMCP "Top Pick" · Glama A-rating · 122 stars · `@chanmeng666/google-news-server` on npm.],
        [*Shipped before MCP had a registry* — built own discovery story (PulseMCP submission, Glama submission, npm) which compounded into first-mover index advantage as catalogs came online.],
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
  //    project appears exactly once across the entire CV.
  v(8pt)
  block(
    {
      set text(size: size-tiny, fill: muted, style: "italic")
      set par(leading: leading-body, justify: true)
      [
        *Also open-sourced:* #link("https://gradient-svg-generator.vercel.app/")[gradient-svg-generator] (340+ animated-SVG templates · 273 solo commits · powers every badge in the source README) · #link("https://github.com/ChanMeng666/typst-claude-skill")[typst-claude-skill] (official Typst skill for Claude Code · the engine that typesets this CV) · #link("https://sunostats.chanmeng.org/")[SunoStats] (industry-first Suno lineage explorer) · #link("https://github.com/ChanMeng666/fanfic-lab")[FanFic Lab] (7-node LangGraph adaptive agent with self-revising quality loop) · plus chan-meng-cli, readme-profile-generator, github-readme-suno-cards, github-visitor-counter.
      ]
    },
  )
})
