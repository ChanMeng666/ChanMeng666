#import "../theme.typ": *
#import "../components.typ": *

// ─── EXPERIENCE ──────────────────────────────────────────────────────────────
// Each role line carries one verifiable business-outcome metric pulled from
// data/profile.yaml::work[].impactHeadline. Products built at these employers
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
    summary: [Recruited onto *Anthropic's Partner Network architect track* — the founder used his own Claude agent to surface candidates, Chan's open-source portfolio was the recommendation (publicly confirmed). 45-day Architect Cohort: *Claude Certified Architect — Foundations* curriculum.],
  )
  role-line(
    title: "AI Instructor & Mentor",
    org: "TechNest Community",
    org-url: "https://www.technestcommunity.com/",
    dates: "Apr 2026 — Present",
    location: [St John's, Newfoundland, Canada · *Remote*],
    summary: [Built and sole-teaches TechNest's first AI-specialised mentorship track — *12-week prompt-first curriculum, students ship portfolio-grade AI apps by week 8*. Also built the bilingual teaching platform 95.7% solo, including an in-course RAG assistant on Cloudflare Workers (Llama 3.1 8B + Vectorize + KV).],
  )
  role-line(
    title: "Founding Principal Engineer, Activation, Execution & AI Systems",
    org: "GAVIGO Inc.",
    org-url: "https://gavigo.com/",
    dates: "Oct 2025 — Present",
    location: [Wilmington, Delaware, United States · *Remote*],
    summary: [Promoted *Core Engineer → Founding Principal Engineer across three contract iterations* — owns the Intelligence Layer of GAVIGO's sub-millisecond app activation platform (lets users open straight into a game without an app-store install). *p50 < 1 ms activation latency · 84.6% warm-pool hit rate* · cross-cloud DigitalOcean → GCP GKE migration in a *30-minute zero-downtime cutover* · *98% solo on 353 commits*.],
  )
  role-line(
    title: "Senior Full-Stack Engineer & Website Team Lead",
    org: "She Sharp",
    org-url: "https://www.shesharp.org.nz/",
    dates: "Jul 2025 — Present",
    location: [Auckland, New Zealand · *Hybrid*],
    summary: [Recruited by founder Dr Mahsa Mohaghegh to rebuild *New Zealand's leading women-in-STEM platform* (*2,200+ registered members, 8,000+ women supported lifetime*) · Webflow → Next.js cutover *86.6% solo across 10 months*, 10+ years of legacy content preserved with *zero broken inbound links*, AI mentor-matching engine (GPT-4o-mini, 5-dimensional scoring) shipped on top.],
  )
  role-line(
    title: "Chief Technology Officer",
    org: "FemTech Weekend",
    org-url: "https://www.femtechweekend.com/",
    dates: "Mar 2025 — Present",
    location: [Chengdu, Sichuan, China · *Remote*],
    summary: [Sole technical lead for *China's first FemTech organisation* since its inaugural conference — built and rebuilt the entire web platform twice (Next.js Gen-1 → Docusaurus Gen-2 editorial rewrite). Currently operating the *2026 Shanghai Summit, 16 confirmed speakers including FemTech-term originator Ida Tin*.],
  )

  v(4pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: 0.7em, justify: false)
    text(size: size-tiny, fill: muted, style: "italic")[
      *Previously:* *CTO at #link("https://www.ibm.com/partnerplus/directory/company/9542")[Sanicle]* (prev. Senior AI/ML Infrastructure Engineer; Tulsa, Oklahoma, US · remote) — earned the company its *IBM Silver Partner* certification through a solo build (350+ commits) · *#link("https://www.bytedance.com/en/")[ByteDance] Full-Stack Engineer* on the Douyin Mall capstone (Beijing, China · remote; Spring Boot 3 + solo Vue 3, #2 of 8 contributors) · *React Native full-stack mobile dev at #link("https://corde.nz/")[CORDE Christchurch]* (Canterbury, NZ · hybrid) · *#link("https://www.linkedin.com/company/taxing-mentorship/")[Forward With Her] mentor* (China · remote; 7 of 18 LinkedIn recs from this cohort).
    ]
  })
})
