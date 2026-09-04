#import "../theme.typ": *
#import "../components.typ": *

// ─── EXPERIENCE ──────────────────────────────────────────────────────────────
// ORDER: roles Chan is STILL DOING come first, ranked by importance, then the
// ended ones in the same ranked spirit. ArchCanvas (her own company) leads;
// GAVIGO ended Sep 2026 and TechNest sits behind it.
//
// FIVE detailed roles is the budget. Two roles have moved down into the italic
// "Previously:" run-on rather than being cut: Sanicle (CTO, ended Feb 2026,
// moved Sep 2026 so "Selected Projects & Products" could carry a FOURTH card —
// it keeps its promotion and the IBM watsonx work behind the IBM Silver Partner
// certification) and Engram (AI Agent Architect, a 45-day cohort that ended
// Jul 2026 — it keeps the fact that matters, the Anthropic Partner Network
// architect-track recruitment and how it happened). The ATS resume is
// deliberately NOT symmetrical: it keeps both as full dated entries with
// bullets, because a parser cannot extract employment from prose. Do not
// "reconcile" the two.
//
// Every summary is written to the outcomes-not-duties rule: what changed, and
// for whom, before the stack that made it happen. No summary opens with a duty
// verb ("Owned", "Responsible for"). Each carries at least one verifiable
// business-outcome metric pulled from
// data/profile/10-career.yaml::work[].impactHeadline. Commit counts and
// solo-percentage ratios are deliberately ABSENT from this CV — they measure
// typing, not the problem solved; where ownership is load-bearing it is stated
// in words ("sole engineer", "built it solo", "still operate it"). Do not
// re-add them. Products built at these employers (GAVIGO IRE, She Sharp
// Platform) are referenced by name but NOT re-described — the deep narrative
// lives in Selected Projects for independent OSS work.
#let experience() = section("Experience", {
  role-line(
    title: "Founder & Sole Engineer",
    org: "ArchCanvas",
    org-url: "https://archcanvas.uk/",
    dates: "Apr 2026 — Present",
    location: [Auckland, New Zealand · *Remote*],
    summary: [Architects and self-builders describe a building in plain words and get back a dimensioned, buildable floor plan. Made that work by first inventing *#link("https://github.com/ChanMeng666/archlang")[ArchLang]*, the open-source language that compiles a floor plan into a precise drawing (*34 npm releases*, *83 diagnostic codes*), then building the commercial product on top — so an edit is exact and replayable, not regenerated.],
  )
  role-line(
    title: "Senior Full-Stack Engineer & Website Team Lead",
    org: "She Sharp",
    org-url: "https://www.shesharp.org.nz/",
    dates: "Jul 2025 — Present",
    location: [Auckland, New Zealand · *Hybrid*],
    summary: [A volunteer-run NZ women-in-STEM charity (*96+ events since 2014*) now owns the software it runs on instead of renting it: one system for sign-ups, memberships, events, and mentor matching scored by GPT-4o-mini across five weighted dimensions. Recruited by founder Dr Mahsa Mohaghegh, built it as sole engineer across *13.3 months* and still operate it. Then rewrote the charity's recurring work — event setup, newsletters, posters, video, mailing list — as *11 agent skills*, version-controlled and type-checked in CI, so non-engineers now run work that used to need an engineer.],
  )
  role-line(
    title: "Chief Technology Officer",
    org: "FemTech Weekend",
    org-url: "https://www.femtechweekend.com/",
    dates: "Mar 2025 — Present",
    location: [Chengdu, Sichuan, China · *Remote*],
    summary: [China's first women's-health-technology organisation outgrew its web platform twice as the mission grew; rebuilt it both times as sole engineer, Next.js marketing site to Docusaurus editorial and research platform. Ran the digital infrastructure behind the 2026 Shanghai Summit: four days, *20 confirmed speakers*, headlined by Ida Tin, who coined "FemTech".],
  )
  role-line(
    title: "Founding Principal Engineer, Activation, Execution & AI Systems",
    org: "GAVIGO Inc.",
    org-url: "https://gavigo.com/",
    dates: "Oct 2025 — Sep 2026",
    location: [Wilmington, Delaware, United States · *Remote*],
    summary: [Tap a game in a feed and it plays instantly, with no app-store install — built the Intelligence Layer that makes GAVIGO's activation platform hold that promise under load. Go orchestrator: a seven-trigger AI rules engine, a warm-pool manager and a five-state activation spine in Redis, on live Kubernetes (GKE) — *sub-millisecond p50 restore*, an *84.6% warm-pool hit rate*, *zero errors at 100 concurrent WebSocket clients*, and a DigitalOcean → GCP move in a *30-minute cutover*. Built it solo; promoted Core Engineer → Founding Principal across three contracts.],
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
    summary: [*30 students graduated and shipped 6 deployed multi-user AI products* in 12 weeks: they arrived knowing only browser ChatGPT and left able to build by directing coding agents. Sole instructor of TechNest's first AI-specialised track, and a *fifth teaching cohort since 2024*.],
  )
  v(4pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: 0.7em, justify: false)
    text(size: size-tiny, fill: muted, style: "italic")[
      *Previously:* *AI Agent Architect at #link("https://engram.media/")[Engram]* (Albuquerque, NM · remote; recruited onto *Anthropic's Partner Network architect track* after founder Luka Madzarac's own Claude agent surfaced Chan's open-source portfolio — publicly confirmed by him; 45-day Architect Cohort on agent, skill and MCP-integration conventions) · *CTO at #link("https://www.linkedin.com/company/sanicleofficial/")[Sanicle]* (Tulsa, OK; promoted from Senior AI/ML Infrastructure Engineer; the IBM watsonx integration behind Sanicle's #link("https://www.ibm.com/partnerplus/directory/solution/0638")[IBM Silver Partner] certification) · *#link("https://www.bytedance.com/en/")[ByteDance] backend developer* (Douyin Mall capstone, Youth Training Camp; Spring Boot 3) · *full-stack developer & lead documenter at #link("https://corde.nz/")[CORDE]* (Canterbury, NZ; offline-first React Native field app, \#1 contributor) · *#link("https://www.linkedin.com/company/taxing-mentorship/")[Forward With Her] mentor* (China · remote; 7 of 26 LinkedIn recommendations).
    ]
  })
})
