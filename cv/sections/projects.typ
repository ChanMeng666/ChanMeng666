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
// Four independent projects Chan owns end to end, re-chosen with her on
// 2026-09-24: Google News MCP, echook, the AI Programming Education Platform and
// a11y-loop — the agent-tooling and teaching work a hiring reader asks about
// first. Tam-AI-Ti and Vitex moved down into the italic "Also built:" closer
// (the space paid for the "Built:" lines added to Experience), and a11y-loop
// left the closer for its own card, so each project still appears exactly once.
// NOT products built at an employer or at her own company — those live in
// Experience, and no card here may duplicate one. The AI Programming Education
// Platform is hers, not TechNest's: two separate organisations teach from it,
// and the TechNest role line in experience.typ was trimmed back to the teaching
// outcome when this card was added (Sep 2026) so the platform is described
// exactly once.
//
// a11y-loop is "being adopted", never "adopted": nothing is deployed at My Life
// My Voice yet (23-projects-oss-more.yaml, a11y-loop comments). Keep the verb.
//
// NO COMMIT COUNTS OR SOLO PERCENTAGES anywhere on this CV — a ratio of commits
// does not answer "what problem can I solve?". Where ownership is load-bearing
// it is said in words instead ("built solo", "built and maintained solo").
// Outcome metrics stay: 129 stars (measured 2026-09-24), the ~4,800 RAG chunks.
#let projects() = section("Selected Projects & Products", {
  let cards = (
    (
      logo: "/public/brands/google-news-mcp-mark.svg",
      name: "Google News MCP Server",
      url: "https://github.com/ChanMeng666/server-google-news",
      context-line: [One of the earliest MCP servers — live Google News for AI assistants, shipped 35 days after Anthropic's Nov 2024 MCP launch.],
      bullets: (
        [*Shipped before MCP had a registry*, so listed by hand across 15+ catalogs — a first-mover position that compounded into a PulseMCP "Top Pick", a Glama A-rating and *129 GitHub stars*.],
      ),
    ),
    (
      logo: "/public/brands/echook-mark.svg",
      name: "echook",
      url: "https://github.com/ChanMeng666/echook",
      context-line: [An AI-operated hooks plugin for *Claude Code, Cursor IDE and Codex CLI*, installed and driven entirely in natural language.],
      bullets: (
        [Audio notifications grew into a *context-window status line* and session telemetry — the production work behind shipping *four* Claude Code extension surfaces: hooks, skills, status line and plugin packaging.],
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
    (
      logo: "/public/brands/a11y-loop-mark.svg",
      name: "a11y-loop",
      url: "https://github.com/ChanMeng666/a11y-loop",
      context-line: [A Claude Code skill plus CLI that makes AI coding agents write accessible UI by default, then checks it in a real browser · Playwright + axe-core against WCAG 2.2 AA · on npm, MIT.],
      bullets: (
        [*Honest by design:* it audits the interaction states the agent built, not one static snapshot, and lists what automation could *not* check — so a green run never claims WCAG coverage it has no standing to claim.],
        [*Being adopted by My Life My Voice*, the disability-led NZ organisation that set the accessible-UI challenge at the Aotearoa AI Hackathon 2026, after a live walkthrough with its CTO.],
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
        *Also built:* #link("https://eatropolis.co.nz/")[eatropolis.co.nz] (Auckland's official culinary festival, for Chow Luck Club Ltd with council agency Tātaki Auckland Unlimited) · #link("https://www.vitex.org.nz/")[Vitex] (AI career agent: a tailored resume and cover letter in under 30 seconds) · #link("https://seismophone.chanmeng.org/")[Seismophone] (first public Suno remix-lineage explorer) · #link("https://tamaiti.whiri-ai.com/")[Tam-AI-Ti] (AI financial-wellness app built around te ao Māori; a 19-user cohort over 4 months) · #link("https://gradient-svg-generator.vercel.app/")[gradient-svg-generator] (355 SVG templates).
      ]
    },
  )
})
