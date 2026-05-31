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
    summary: [Recruited by Claude itself onto the Anthropic Partner Network track — empirical proof that an open-source portfolio surfaces to AI sourcer agents before recruiters see the file.],
  )
  role-line(
    title: "AI Instructor & Mentor",
    org: "TechNest Community",
    org-url: "https://www.technestcommunity.com/",
    dates: "Apr 2026 — Present",
    summary: [Sole instructor on TechNest's first AI-specialised mentorship track · 12-week prompt-first curriculum · students ship portfolio-grade AI apps by week 8 on a *95.7%-solo* platform with an in-course RAG assistant on Cloudflare Workers (Llama 3.1 8B + Vectorize + KV).],
  )
  role-line(
    title: "Founding Principal Engineer, Activation, Execution & AI Systems",
    org: "GAVIGO Inc.",
    org-url: "https://gavigo.com/",
    dates: "Oct 2025 — Present",
    summary: [Promoted Core Engineer → Founding Principal Engineer across three contract iterations · owns the Intelligence Layer end-to-end (the GAVIGO IRE Activation platform) · *p50 < 1 ms activation latency · 84.6% warm-pool hit rate* · cross-cloud AWS → GCP GKE migration in a 30-minute zero-downtime cutover · *98% solo on 353 commits*.],
  )
  role-line(
    title: "Senior Full-Stack Engineer & Website Team Lead",
    org: "She Sharp",
    org-url: "https://www.shesharp.org.nz/",
    dates: "Jul 2025 — Present",
    summary: [Recruited directly by founder Dr Mahsa Mohaghegh · NZ charitable trust CC57025 (*2,200+ active members; 8,000+ women supported lifetime*) · *86.6% solo across 10 months* on the new platform · Webflow → Next.js migration preserving 10+ years of legacy content with zero broken inbound links.],
  )
  role-line(
    title: "Chief Technology Officer",
    org: "FemTech Weekend",
    org-url: "https://www.femtechweekend.com/",
    dates: "Mar 2025 — Present",
    summary: [Sole technical leader across two platform generations (Next.js Gen-1 → Docusaurus Gen-2 editorial rewrite) · *operates the 2026 Shanghai Summit with 16 confirmed speakers including FemTech-term originator Ida Tin*.],
  )

  v(4pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: 0.78em, justify: false)
    text(size: size-tiny, fill: muted, style: "italic")[
      *Previously:* Founding Junior Full-Stack Engineer at *Sanicle* — earned the company its *IBM Silver Partner* certification + PartnerPlus listing through a solo build (350+ commits, 180+ beta users, Nov 2023 — Nov 2024) · *ByteDance 青训营 Backend* (Jun–Aug 2024) · Lincoln industry placement at *CORDE Christchurch* · *Forward With Her mentor* (360 mentors / 800 mentees programme · 7 of 18 LinkedIn recommendations come from this cohort) · *CopilotKit* OSS contributor (2 merged PRs, 24.6k★).
    ]
  })
})
