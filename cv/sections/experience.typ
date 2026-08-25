#import "../theme.typ": *
#import "../components.typ": *

// ─── EXPERIENCE ──────────────────────────────────────────────────────────────
// Each role line carries one verifiable business-outcome metric pulled from
// data/profile/10-career.yaml::work[].impactHeadline. Products built at these employers
// (GAVIGO IRE, She Sharp Platform) are referenced by name but NOT re-described
// — the deep narrative lives in Selected Projects for independent OSS work,
// and the metric here is what matters to HR / hiring managers / founders.
#let experience() = section("Experience", {
  role-line(
    title: "AI Agent Architect",
    org: "Engram",
    org-url: "https://engram.media/",
    dates: "May 2026 — Jul 2026",
    location: [Albuquerque, New Mexico, United States · *Remote*],
    summary: [Recruited onto *Anthropic's Partner Network architect track* — Engram's founder asked his own Claude agent to surface candidates, and Chan's open-source portfolio was the pick (publicly confirmed by founder Luka Madzarac). Spent the 45-day Architect Cohort on its agent, skill and MCP-integration conventions.],
  )
  role-line(
    title: "AI Instructor & Mentor",
    org: "TechNest Community",
    org-url: "https://www.technestcommunity.com/",
    dates: "Apr 2026 — Aug 2026",
    location: [St John's, Newfoundland, Canada · *Remote*],
    summary: [Sole instructor of TechNest's first AI-specialised track — her *fifth teaching cohort since 2024*. Students arrived knowing only browser ChatGPT and, over 12 weeks, learned to build by directing coding agents; *30 graduated* and shipped *6 deployed multi-user AI products*. Also built the bilingual platform that hosts it (*211 of 220 commits*), with an in-course RAG assistant on Cloudflare Workers.],
  )
  role-line(
    title: "Founding Principal Engineer, Activation, Execution & AI Systems",
    org: "GAVIGO Inc.",
    org-url: "https://gavigo.com/",
    dates: "Oct 2025 — Present",
    location: [Wilmington, Delaware, United States · *Remote*],
    summary: [Owns the Intelligence Layer of GAVIGO's app-activation platform — tap a game in a feed and it plays instantly, no app-store install. Built the Go orchestrator behind it: a seven-trigger AI rules engine, a warm-pool manager and a five-state activation spine in Redis, measured on live Kubernetes (GKE) at *sub-millisecond p50 restore*, an *84.6% warm-pool hit rate* and *zero errors at 100 concurrent WebSocket clients*, then moved DigitalOcean → GCP in a *30-minute cutover*. Promoted Core Engineer → Founding Principal Engineer across three contract iterations, *426 of 439 commits* solo.],
  )
  role-line(
    title: "Senior Full-Stack Engineer & Website Team Lead",
    org: "She Sharp",
    org-url: "https://www.shesharp.org.nz/",
    dates: "Jul 2025 — Present",
    location: [Auckland, New Zealand · *Hybrid*],
    summary: [Recruited by founder Dr Mahsa Mohaghegh to rebuild the member platform for a New Zealand women-in-STEM charity that has run *96+ events since 2014*. Moved the community off a drag-and-drop website onto one system for sign-ups, memberships, events, and mentor matching — 10+ years of content carried over with zero broken inbound links, *793 of 936 commits* over a year. Mentors and mentees are paired by GPT-4o-mini scoring across five weighted dimensions, with a rule-based fallback and human review.],
  )
  role-line(
    title: "Chief Technology Officer",
    org: "FemTech Weekend",
    org-url: "https://www.femtechweekend.com/",
    dates: "Mar 2025 — Present",
    location: [Chengdu, Sichuan, China · *Remote*],
    summary: [Sole engineer behind China's first women's-health-technology organisation — rebuilt its entire web platform twice as the mission grew, from a Next.js marketing site to a Docusaurus editorial and research platform. Ran the digital infrastructure for the 2026 Shanghai Summit, a four-day event with *20 confirmed speakers* headlined by Ida Tin, who coined the term "FemTech".],
  )
  role-line(
    title: "Chief Technology Officer",
    org: "Sanicle",
    org-url: "https://www.linkedin.com/company/sanicleofficial/",
    dates: "Mar 2025 — Feb 2026",
    location: [Tulsa, Oklahoma, United States · *Remote*],
    summary: [Joined as Senior AI/ML Infrastructure Engineer, promoted to CTO. Took Sanicle from a no-code prototype to the production B2B FemTech SaaS employers buy for their staff — menstrual and menopause workplace wellness. Personally integrated IBM watsonx into the product behind a Gemini fallback — its 28-second baseline did not fit a 10-second serverless timeout — the work that earned Sanicle its *#link("https://www.ibm.com/partnerplus/directory/solution/0638")[IBM Silver Partner]* certification.],
  )

  v(4pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: 0.7em, justify: false)
    text(size: size-tiny, fill: muted, style: "italic")[
      *Previously:* *#link("https://www.bytedance.com/en/")[ByteDance] backend developer* on the Douyin Mall capstone (Youth Training Camp; Spring Boot 3) · *full-stack developer & lead documenter at #link("https://corde.nz/")[CORDE]* (Canterbury, NZ · hybrid; offline-first React Native field app, \#1 contributor) · *#link("https://www.linkedin.com/company/taxing-mentorship/")[Forward With Her] mentor* (China · remote; 7 of 26 LinkedIn recommendations come from this cohort).
    ]
  })
})
