#import "../theme.typ": *
#import "../components.typ": *

// ─── INTRODUCTION ────────────────────────────────────────────────────────────
// Voice + philosophy. No company or project names — those live in Experience
// and Selected Projects respectively.
//
// SERVICE-LED ORDER (do not invert): who she helps and what they get comes
// FIRST, the list of what she ships second. A reader should finish this
// paragraph knowing exactly who to send her way. The clause "MCP servers,
// sub-agents, and agent skills to production" is kept verbatim on purpose — it
// phrase-matches the Anthropic Forward Deployed Engineer JD for LLM screeners
// (see cv/README.md). The closing line — the judgement call on what actually
// ships stays human — is the differentiator in an AI-saturated market; keep it
// last, where it lands.
#let introduction() = section("Introduction", {
  set text(size: size-body, fill: ink)
  set par(leading: leading-body, justify: false)
  [
    Helps founders and mission-led teams get an AI product past the demo and into the hands of people who depend on it — work that has to hold up behind paying customers, private health data, and regulated processes. Ships MCP servers, sub-agents, and agent skills to production, most often in *women's health, cultural technology, and early-stage startup infrastructure*. Works AI-native by default — directing coding agents and building on the Claude Agent SDK — while keeping the call on what actually ships a human one.
  ]
})

// ─── SELECTED PROJECTS & PRODUCTS ────────────────────────────────────────────
// Five independent projects Chan owns end to end (open-source engines,
// commissioned-solo research, and shipped products — hence "Projects &
// Products", since Tam-AI-Ti is a live product, not a public repo). NOT
// products built at an employer or at her own company — those live in
// Experience, and no card here may duplicate one. The AI Programming Education
// Platform is hers, not TechNest's: two separate organisations teach from it,
// and the TechNest role line in experience.typ was trimmed back to the teaching
// outcome when this card was added (Sep 2026) so the platform is described
// exactly once. ArchCanvas × ArchLang used to
// lead this section; it moved to Experience when ArchCanvas became a role
// (Founder & Sole Engineer) rather than a side build, and duplicating it here
// would have cost the two-page budget a card it already pays for above. The
// italic closer line absorbs all other tools so each appears exactly once
// across the CV.
//
// Tam-AI-Ti and Vitex carry TWO bullets each again (restored Sep 2026 with the
// space freed by moving Engram down into the Experience "Previously:" line).
// They had been merged into one dense bullet apiece to pay for the fifth card,
// which buried each project's second idea. Keep them split.
//
// NO COMMIT COUNTS OR SOLO PERCENTAGES anywhere on this CV — a ratio of commits
// does not answer "what problem can I solve?". Where ownership is load-bearing
// it is said in words instead ("built solo", "built and maintained solo").
// Outcome metrics stay: the 19-user cohort, 126 stars, the ~4,800 RAG chunks.
#let projects() = section("Selected Projects & Products", {
  let cards = (
    (
      logo: "/public/brands/tam-ai-ti-mark.svg",
      name: "Tam-AI-Ti",
      url: "https://tamaiti.whiri-ai.com/",
      context-line: [An AI financial-wellness app for Māori communities, built around te ao Māori · an independent research commission from Riria (Missy) Te Kanawa personally (former KPMG NZ National Māori Sector lead, now Māori Executive Lead at ASB Bank; ASB was not a party to it).],
      bullets: (
        [*A research question, not a spec:* can technology built natively on Māori culture engage people that culturally-decorated tech does not? Built solo — bilingual voice and journaling, with culture as typed data (Maramataka phases, Te Whare Tapa Whā domains), not labels.],
        [*Answered with users, not opinion:* a *19-user cohort over 4 months*, 181 journal entries, 74 check-ins, no marketing.],
      ),
    ),
    (
      logo: "/public/brands/vitex-mark.svg",
      name: "Vitex — AI Career Agent",
      url: "https://www.vitex.org.nz/",
      context-line: [Paste a job description, get a tailored resume and cover letter scored against the job's keywords in under 30 seconds · sole-authored over \~18 months · Vercel AI SDK + gpt-5.5 / gpt-5.4-mini + Typst.],
      bullets: (
        [*Typst compiles the finished PDF locally in under 100 ms* across 7 templates — no hosted Chromium — so the resume assembles in front of the job seeker instead of behind a spinner.],
        [*Metered on the product, not the clock:* a run counts only after a PDF compiles. Three migrations, zero downtime.],
      ),
    ),
    (
      logo: "/public/brands/google-news-mcp-mark.svg",
      name: "Google News MCP Server",
      url: "https://github.com/ChanMeng666/server-google-news",
      context-line: [Earliest-ecosystem MCP server — live Google News for AI assistants, shipped 35 days after Anthropic's Nov 2024 MCP launch.],
      bullets: (
        [*Shipped before MCP had a registry*, so listed by hand across 15+ catalogs — a first-mover position that compounded into a PulseMCP "Top Pick", a Glama A-rating and *126 GitHub stars*.],
      ),
    ),
    (
      logo: "/public/brands/echook-mark.svg",
      name: "echook",
      url: "https://github.com/ChanMeng666/echook",
      context-line: [An AI-operated hooks plugin for *Claude Code, Cursor IDE and Codex CLI*, installed and driven entirely in natural language.],
      bullets: (
        [Audio notifications grew into a *context-window status line* and telemetry — the production work behind shipping *every* Claude Code extension surface: CLAUDE.md, hooks, status line, plugins.],
      ),
    ),
    (
      logo: "/public/brands/ai-programming-mark.svg",
      name: "AI Programming Education Platform",
      url: "https://programming.chanmeng.org/",
      context-line: [Bilingual platform holding *three years of cohorts as five versions side by side, three concurrent in 2026* — taught from by *TechNest's 2026 AI Track* and *academyEX's Her Waka*, and built and maintained solo.],
      bullets: (
        [*In-course RAG assistant on Cloudflare Workers* (Llama 3.1 8B + Vectorize + KV) over *\~4,800 chunks, version-aware*, so each student is answered from their own cohort's material; a deprecated model was swapped out the same day.],
        [*Mentorship at scale:* Demo Day ends in a *public Capstone Showcase* of student products (CreditHero, iCare, JobOrg-AI), with guest voting.],
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
  v(8pt)
  block(
    {
      set text(size: size-tiny, fill: muted, style: "italic")
      set par(leading: 0.68em, justify: false)
      [
        *Also built:* #link("https://eatropolis.co.nz/")[eatropolis.co.nz] (Auckland's official culinary festival, for Chow Luck Club Ltd with council agency Tātaki Auckland Unlimited) · #link("https://github.com/ChanMeng666/a11y-loop")[a11y-loop] (accessibility CLI for coding agents, validated by the disability-led NZ organisation that set the problem) · #link("https://seismophone.chanmeng.org/")[Seismophone] (first public Suno remix-lineage explorer) · #link("https://gradient-svg-generator.vercel.app/")[gradient-svg-generator] (355 SVG templates).
      ]
    },
  )
})
