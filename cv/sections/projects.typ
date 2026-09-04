#import "../theme.typ": *
#import "../components.typ": *

// ─── INTRODUCTION ────────────────────────────────────────────────────────────
// Voice + philosophy. No company or project names — those live in Experience
// and Selected Projects respectively.
#let introduction() = section("Introduction", {
  set text(size: size-body, fill: ink)
  set par(leading: leading-body, justify: false)
  [
    Ships MCP servers, sub-agents, and agent skills to production — behind paying customers, private health data, and regulated work, not demos. Focus areas: *women's health, cultural technology, and early-stage startup infrastructure*. Works AI-native by default — directing coding agents (Claude Code, Codex) and building on the Claude Agent SDK, while keeping the call on what actually ships a human one.
  ]
})

// ─── SELECTED PROJECTS & PRODUCTS ────────────────────────────────────────────
// Four independent projects Chan owns end to end (open-source engines,
// commissioned-solo research, and shipped products — hence "Projects &
// Products", since Tam-AI-Ti is a live product, not a public repo). NOT
// products built at an employer or at her own company — those live in
// Experience, and no card here may duplicate one. ArchCanvas × ArchLang used to
// lead this section; it moved to Experience when ArchCanvas became a role
// (Founder & Sole Engineer) rather than a side build, and duplicating it here
// would have cost the two-page budget a card it already pays for above. The
// italic closer line absorbs all other tools so each appears exactly once
// across the CV.
#let projects() = section("Selected Projects & Products", {
  let cards = (
    (
      logo: "/public/brands/tam-ai-ti-mark.svg",
      name: "Tam-AI-Ti",
      url: "https://tamaiti.whiri-ai.com/",
      context-line: [An AI financial-wellness app for Māori communities, built around te ao Māori · an independent research commission from Riria (Missy) Te Kanawa personally (former KPMG NZ National Māori Sector lead; now Māori Executive Lead at ASB Bank, which was not a party to this commission).],
      bullets: (
        [*A research question, not a spec:* can technology built natively on Māori culture engage a population that culturally-decorated technology does not? Built solo — a bilingual voice-and-journaling app where the culture is typed data in the database (Maramataka phases, Te Whare Tapa Whā domains), not labels bolted on.],
        [The evidence: a *19-user cohort over 4 months* produced 181 bilingual journal entries and 74 daily check-ins — sustained engagement for a pilot with no marketing.],
      ),
    ),
    (
      logo: "/public/brands/vitex.svg",
      name: "Vitex — AI Career Agent",
      url: "https://www.vitex.org.nz/",
      context-line: [Paste a job description, get a tailored resume and cover letter scored against the job's keywords in under 30 seconds · sole-authored over \~18 months · Vercel AI SDK + gpt-5.5 / gpt-5.4-mini + Typst.],
      bullets: (
        [The resume assembles live instead of behind a spinner, and *Typst compiles the finished PDF locally in under 100 ms* across 7 templates — no hosted Chromium or outside doc service.],
        [*Metered around the product, not the clock* — a run counts only after a PDF compiles, so a failed retry is a non-event. Built for the NZ / AU / APAC market Chan needed; three migrations, zero downtime.],
      ),
    ),
    (
      logo: "/public/brands/server-google-news-mark.svg",
      name: "Google News MCP Server",
      url: "https://glama.ai/mcp/servers/ChanMeng666/server-google-news",
      context-line: [Earliest-ecosystem MCP server — gives AI assistants live Google News access. Shipped 35 days after Anthropic's Nov 2024 MCP launch.],
      bullets: (
        [*Shipped before MCP had a registry* — 35 days after the standard launched — so it was listed by hand across 15+ catalogs. The first-mover position compounded: a PulseMCP "Top Pick", a Glama A-rating, and 126 GitHub stars.],
      ),
    ),
    (
      logo: "/public/brands/echook-mark.svg",
      name: "echook",
      url: "https://github.com/ChanMeng666/echook",
      context-line: [An AI-operated hooks plugin for *Claude Code, Cursor IDE and Codex CLI* — installed, configured and driven entirely in natural language.],
      bullets: (
        [Started as audio notifications, now a *context-window status line* and session telemetry — the production work behind having shipped *every* Claude Code extension surface: CLAUDE.md, hooks, status line, plugins.],
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
  //    doesn't read as part of the echook entry.
  v(10pt)
  block(
    {
      set text(size: size-tiny, fill: muted, style: "italic")
      set par(leading: 0.68em, justify: false)
      [
        *Also built:* #link("https://eatropolis.co.nz/")[eatropolis.co.nz] (Auckland's official culinary festival, commissioned by Chow Luck Club Ltd with council agency Tātaki Auckland Unlimited as event partner) · #link("https://github.com/ChanMeng666/a11y-loop")[a11y-loop] (accessibility CLI adopted by a disability-led NZ organisation) · #link("https://seismophone.chanmeng.org/")[Seismophone] (first public Suno remix-lineage explorer) · #link("https://gradient-svg-generator.vercel.app/")[gradient-svg-generator] (355 SVG templates).
      ]
    },
  )
})
