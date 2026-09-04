#import "../theme.typ": *
#import "../components.typ": *

// ─── EXPERIENCE ──────────────────────────────────────────────────────────────
// ORDER: roles Chan is STILL DOING come first, ranked by importance, then the
// ended ones in the same ranked spirit. ArchCanvas (her own company) leads;
// GAVIGO ended Sep 2026 and TechNest and Engram sit behind it.
//
// SIX detailed roles is the budget. Sanicle (CTO, ended Feb 2026) moved down
// into the italic "Previously:" run-on in Sep 2026 so "Selected Projects &
// Products" could carry a FOURTH card — it keeps its two strongest facts there
// (the promotion, and the IBM watsonx work behind the IBM Silver Partner
// certification). The ATS resume is deliberately NOT symmetrical: it keeps
// Sanicle as a full dated entry with a bullet, because a parser cannot extract
// employment from prose. Do not "reconcile" the two.
//
// Each role line carries one verifiable business-outcome metric pulled from
// data/profile/10-career.yaml::work[].impactHeadline. Products built at these employers
// (GAVIGO IRE, She Sharp Platform) are referenced by name but NOT re-described
// — the deep narrative lives in Selected Projects for independent OSS work,
// and the metric here is what matters to HR / hiring managers / founders.
#let experience() = section("Experience", {
  role-line(
    title: "Founder & Sole Engineer",
    org: "ArchCanvas",
    org-url: "https://archcanvas.uk/",
    dates: "Apr 2026 — Present",
    location: [Auckland, New Zealand · *Remote*],
    summary: [Builds an AI design agent for architects and self-builders — describe a building in plain words, get a dimensioned, buildable floor plan. Invented *#link("https://github.com/ChanMeng666/archlang")[ArchLang]*, the open-source language that compiles a floor plan into a precise drawing (*34 npm releases*, *83 diagnostic codes*), then built the commercial product on top — so an edit is exact and replayable, not regenerated.],
  )
  role-line(
    title: "Senior Full-Stack Engineer & Website Team Lead",
    org: "She Sharp",
    org-url: "https://www.shesharp.org.nz/",
    dates: "Jul 2025 — Present",
    location: [Auckland, New Zealand · *Hybrid*],
    summary: [Recruited by founder Dr Mahsa Mohaghegh to move a volunteer-run NZ women-in-STEM charity (*96+ events since 2014*) off rented software onto infrastructure it owns: one system for sign-ups, memberships, events, and mentor matching scored by GPT-4o-mini across five weighted dimensions. *1,381 commits, 251 merged pull requests and 94.5% of all lines added across 13.3 months.* Then rewrote its recurring work as *11 agent skills — 25,643 lines of written-down procedure*, version-controlled and type-checked in CI, so non-engineers run work that used to need an engineer.],
  )
  role-line(
    title: "Chief Technology Officer",
    org: "FemTech Weekend",
    org-url: "https://www.femtechweekend.com/",
    dates: "Mar 2025 — Present",
    location: [Chengdu, Sichuan, China · *Remote*],
    summary: [Sole engineer behind China's first women's-health-technology organisation — rebuilt its web platform twice as the mission grew, Next.js marketing site to Docusaurus editorial and research platform. Ran the digital infrastructure for the 2026 Shanghai Summit: four days, *20 confirmed speakers*, headlined by Ida Tin, who coined "FemTech".],
  )
  role-line(
    title: "Founding Principal Engineer, Activation, Execution & AI Systems",
    org: "GAVIGO Inc.",
    org-url: "https://gavigo.com/",
    dates: "Oct 2025 — Sep 2026",
    location: [Wilmington, Delaware, United States · *Remote*],
    summary: [Owned the Intelligence Layer of GAVIGO's app-activation platform — tap a game in a feed, it plays instantly, no app-store install. Built the Go orchestrator: a seven-trigger AI rules engine, a warm-pool manager and five-state activation spine in Redis, on live Kubernetes (GKE): *sub-millisecond p50 restore*, an *84.6% warm-pool hit rate* and *zero errors at 100 concurrent WebSocket clients*, moved DigitalOcean → GCP in a *30-minute cutover*. Promoted Core Engineer → Founding Principal across three contracts, *471 of 488 commits* solo.],
  )
  role-line(
    title: "AI Instructor & Mentor",
    org: "TechNest Community",
    org-url: "https://www.technestcommunity.com/",
    dates: "Apr 2026 — Aug 2026",
    location: [St John's, Newfoundland, Canada · *Remote*],
    // TEACHING OUTCOME ONLY. The platform Chan built to host the cohorts used to
    // ride here as a trailing clause; in Sep 2026 it became a full card in
    // Selected Projects (it is her own product, taught from by TWO
    // organisations, not a thing she built for this employer). Do not re-add the
    // platform clause — the section rule is that no card duplicates a role.
    summary: [Sole instructor of TechNest's first AI-specialised track, her *fifth teaching cohort since 2024*: students arrived knowing only browser ChatGPT and, over 12 weeks, learned to build by directing coding agents — *30 graduated* and shipped *6 deployed multi-user AI products*.],
  )
  role-line(
    title: "AI Agent Architect",
    org: "Engram",
    org-url: "https://engram.media/",
    dates: "May 2026 — Jul 2026",
    location: [Albuquerque, New Mexico, United States · *Remote*],
    summary: [Recruited onto *Anthropic's Partner Network architect track* — founder Luka Madzarac's own Claude agent surfaced candidates and picked Chan's open-source portfolio (publicly confirmed by him). Spent the 45-day Architect Cohort on its agent, skill and MCP-integration conventions.],
  )
  v(4pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: 0.7em, justify: false)
    text(size: size-tiny, fill: muted, style: "italic")[
      *Previously:* *CTO at #link("https://www.linkedin.com/company/sanicleofficial/")[Sanicle]* (Tulsa, OK; promoted from Senior AI/ML Infrastructure Engineer; the IBM watsonx integration behind Sanicle's #link("https://www.ibm.com/partnerplus/directory/solution/0638")[IBM Silver Partner] certification) · *#link("https://www.bytedance.com/en/")[ByteDance] backend developer* (Douyin Mall capstone, Youth Training Camp; Spring Boot 3) · *full-stack developer & lead documenter at #link("https://corde.nz/")[CORDE]* (Canterbury, NZ; offline-first React Native field app, \#1 contributor) · *#link("https://www.linkedin.com/company/taxing-mentorship/")[Forward With Her] mentor* (China · remote; 7 of 26 LinkedIn recommendations).
    ]
  })
})
