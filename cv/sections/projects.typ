#import "../theme.typ": *
#import "../components.typ": *

// ─── INTRODUCTION ────────────────────────────────────────────────────────────
// Voice + philosophy. No company or project names — those live in Experience
// and Selected Projects respectively.
#let introduction() = section("Introduction", {
  set text(size: size-body, fill: ink)
  set par(leading: leading-body, justify: false)
  [
    Builds the AI software companies run every day — products with paying customers, private data, and regulated work behind them, not demos. Focus areas: *women's health, cultural technology, and early-stage startup infrastructure*. Works AI-native by default — directing coding agents (Claude Code, Codex) and building on the Claude Agent SDK, MCP, and agent skills, while keeping the call on what actually ships a human one.
  ]
})

// ─── SELECTED PROJECTS & PRODUCTS ────────────────────────────────────────────
// Four independent projects Chan owns end to end (open-source engines,
// commissioned-solo research, and shipped products — hence "Projects &
// Products", since ArchCanvas and Tam-AI-Ti are live products, not public
// repos). NOT products built at employers — those live in Experience, and no
// card here may duplicate one. The lead card tells the invention→product story
// (an open-source language and the commercial product built on it). The italic
// closer line absorbs all other tools so each appears exactly once across the CV.
#let projects() = section("Selected Projects & Products", {
  let cards = (
    (
      logo: "/public/brands/archcanvas-logo.svg",
      name: "ArchCanvas × ArchLang",
      url: "https://archcanvas.uk/",
      context-line: [An AI design agent for architects and self-builders — describe a building in plain words and get a dimensioned, buildable floor plan plus a realistic rendering, then refine it by talking on a zoomable canvas.],
      bullets: (
        [*A free open-source engine, then a paid product on top.* Chan invented #link("https://github.com/ChanMeng666/archlang")[ArchLang] — a language that turns a floor plan into a precise program (34 npm releases, full editor tooling) — then built the commercial product it powers, ArchCanvas.],
        [Because the plan is a *program, not a picture*, ArchCanvas can edit it exactly, show what changed, and replay its history — things an image generator structurally cannot, and a benchmark measures that gap rather than asserting it.],
      ),
    ),
    (
      logo: "/public/brands/tam-ai-ti-mark.svg",
      name: "Tam-AI-Ti",
      url: "https://tamaiti.whiri-ai.com/",
      context-line: [An AI financial-wellness app for Māori communities, built around te ao Māori · an independent research commission from Riria (Missy) Te Kanawa personally (former KPMG NZ National Māori Sector lead; now Māori Executive Lead at ASB Bank, her employer).],
      bullets: (
        [*A research question, not a spec:* can technology built natively on Māori culture engage a population that culturally-decorated technology does not? Built solo — a bilingual (te reo Māori / English) voice-and-journaling app where the culture is typed data in the database (Maramataka phases, Te Whare Tapa Whā domains), not labels bolted on.],
        [The evidence: a *19-user cohort over 4 months* produced 181 bilingual journal entries and 74 daily check-ins — sustained engagement for a pre-commercial pilot with no marketing.],
      ),
    ),
    (
      logo: "/public/brands/vitex.svg",
      name: "Vitex — AI Career Agent",
      url: "https://www.vitex.org.nz/",
      context-line: [Paste a job description, get a tailored resume and cover letter scored against the job's keywords in under 30 seconds · sole-authored over \~18 months · Vercel AI SDK + gpt-5.5 / gpt-5.4-mini + Typst.],
      bullets: (
        [The resume assembles live instead of behind a spinner, and *Typst compiles the finished PDF locally in under 100 ms* across 7 templates — no hosted Chromium or outside doc service.],
        [*Capacity is metered around the product, not the clock* — a run counts only after a PDF compiles, so a failed retry is a non-event, and share links double as live demos. Built for the NZ / AU / APAC market Chan needed; three migrations, zero downtime.],
      ),
    ),
    (
      logo: "/public/brands/server-google-news-mark.svg",
      name: "Google News MCP Server",
      url: "https://glama.ai/mcp/servers/ChanMeng666/server-google-news",
      context-line: [Earliest-ecosystem MCP server — gives AI assistants live Google News access. Shipped 35 days after Anthropic's Nov 2024 MCP launch.],
      bullets: (
        [*Shipped before MCP had a registry* — 35 days after the standard launched — so it was listed by hand across 15+ catalogs, the way developers actually find MCP servers. The first-mover position compounded: a PulseMCP "Top Pick", a Glama A-rating, \~125 GitHub stars, and a Skywork AI deep-dive.],
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
  v(20pt)
  block(
    {
      set text(size: size-tiny, fill: muted, style: "italic")
      set par(leading: 0.68em, justify: false)
      [
        *Also built:* #link("https://github.com/ChanMeng666/echook")[echook] — plain-English-configured notifications for AI coding assistants (Claude Code / Cursor / Codex) · #link("https://eatropolis.co.nz/")[eatropolis.co.nz] — Auckland food-festival platform (Chow Luck Club × Tātaki Auckland Unlimited; solo, 9 days) · #link("https://gradient-svg-generator.vercel.app/")[gradient-svg-generator] (355 animated-SVG README templates) · #link("https://github.com/ChanMeng666/typst-claude-skill")[typst-claude-skill] (typesets this CV) · #link("https://seismophone.chanmeng.org/")[Seismophone] (AI-music observatory).
      ]
    },
  )
})
