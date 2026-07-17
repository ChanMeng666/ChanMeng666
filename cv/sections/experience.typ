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
    dates: "May 2026 — Present",
    location: [Albuquerque, New Mexico, United States · *Remote*],
    summary: [Recruited onto *Anthropic's Partner Network architect track* — Engram's founder asked his own Claude agent to surface candidates, and Chan's open-source portfolio was the pick (publicly confirmed by founder Luka Madzarac). Now in the 45-day Architect Cohort on the *Claude Certified Architect — Foundations* curriculum.],
  )
  role-line(
    title: "AI Instructor & Mentor",
    org: "TechNest Community",
    org-url: "https://www.technestcommunity.com/",
    dates: "Apr 2026 — Present",
    location: [St John's, Newfoundland, Canada · *Remote*],
    summary: [Sole instructor of TechNest's first AI-specialised mentorship track — her *fifth teaching cohort since 2024*. Students arrive knowing only browser ChatGPT and, over 12 weeks, learn to build by directing coding agents, shipping a live multi-user AI product by the end. Also built the bilingual teaching platform that hosts it, including an in-course RAG assistant on Cloudflare Workers.],
  )
  role-line(
    title: "Founding Principal Engineer, Activation, Execution & AI Systems",
    org: "GAVIGO Inc.",
    org-url: "https://gavigo.com/",
    dates: "Oct 2025 — Present",
    location: [Wilmington, Delaware, United States · *Remote*],
    summary: [Owns the intelligence layer of GAVIGO's app-activation platform — tap a game in a feed and it plays instantly, no app-store install. Built the AI scheduler that keeps content pre-warmed on Kubernetes (GKE) so a tapped game resumes in *under a millisecond*, and moved the platform across clouds (DigitalOcean → GCP) with zero downtime. Promoted *Core Engineer → Founding Principal Engineer* across three renewals, building nearly the whole system solo.],
  )
  role-line(
    title: "Senior Full-Stack Engineer & Website Team Lead",
    org: "She Sharp",
    org-url: "https://www.shesharp.org.nz/",
    dates: "Jul 2025 — Present",
    location: [Auckland, New Zealand · *Hybrid*],
    summary: [Recruited by founder Dr Mahsa Mohaghegh to rebuild the member platform for *New Zealand's leading women-in-STEM charity* (*2,200+ registered members, 8,000+ women supported lifetime*). Moved the community off a drag-and-drop website onto one system for sign-ups, events, and mentor matching — 10+ years of content carried over with *zero broken inbound links*, \~85% solo over a year. Mentors and mentees are paired by AI scoring (GPT-4o-mini) with human review.],
  )
  role-line(
    title: "Chief Technology Officer",
    org: "FemTech Weekend",
    org-url: "https://www.femtechweekend.com/",
    dates: "Mar 2025 — Present",
    location: [Chengdu, Sichuan, China · *Remote*],
    summary: [Sole engineer behind *China's first women's-health-technology organisation* — built, then rebuilt its entire web platform twice as the mission grew, from a marketing site on Next.js to an editorial and research platform on Docusaurus. Ran the digital infrastructure for the *2026 Shanghai Summit* (June 22–25), a four-day event with *20 confirmed speakers* headlined by Ida Tin, who coined the term "FemTech".],
  )
  role-line(
    title: "Chief Technology Officer",
    org: "Sanicle",
    org-url: "https://www.linkedin.com/company/sanicleofficial/",
    dates: "Mar 2025 — Feb 2026",
    location: [Tulsa, Oklahoma, United States · *Remote*],
    summary: [Joined as Senior AI/ML Infrastructure Engineer, promoted to CTO. Took Sanicle from a no-code prototype to the production B2B FemTech SaaS employers buy for their staff — menstrual and menopause workplace wellness. Personally integrated *IBM watsonx* into the product, the work that earned Sanicle its *#link("https://www.ibm.com/partnerplus/directory/solution/0638")[IBM Silver Partner]* certification.],
  )

  v(4pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: 0.7em, justify: false)
    text(size: size-tiny, fill: muted, style: "italic")[
      *Previously:* *#link("https://www.bytedance.com/en/")[ByteDance] full-stack engineer* on the Douyin Mall capstone (Beijing · remote; Spring Boot 3 backend + solo Vue 3 frontend) · *React Native mobile developer at #link("https://corde.nz/")[CORDE]* (Christchurch, NZ · hybrid) · *#link("https://www.linkedin.com/company/taxing-mentorship/")[Forward With Her] mentor* (China · remote; 7 of 23 LinkedIn recommendations come from this cohort).
    ]
  })
})
