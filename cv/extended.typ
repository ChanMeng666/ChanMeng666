// ─────────────────────────────────────────────────────────────────────────────
// Chan Meng — EXTENDED CV content + spacious single-column renderers.
//
// Self-contained on purpose: the renderers here read the spacious *-x tokens
// from theme-extended.typ. (cv/components.typ binds to theme.typ's tight 2-page
// tokens by value, so it can't be reused at this density — these bespoke
// renderers are small and keep the spacious layout deterministic.)
//
// Facts are hand-curated and kept identical to cv/sections/*.typ (same model the
// repo already uses for the 2-page CV). Anchor dates/titles match
// data/profile/10-career.yaml so nothing drifts.
// ─────────────────────────────────────────────────────────────────────────────

#import "theme-extended.typ": *

// ─── Inline contact icon (reuses the pre-tinted SVGs in cv/icons) ────────────
#let xicon(name) = box(baseline: 1.6pt, image("/cv/icons/" + name + ".svg", height: 9pt))
#let xcontact(icon, label, target: none) = {
  xicon(icon); h(4pt)
  if target != none { link(target, label) } else { label }
}

// ─── Spacious skill pill ─────────────────────────────────────────────────────
#let pill-x(label) = box(
  fill: pill-bg,
  stroke: 0.6pt + pill-edge,
  radius: cv-radius-pill-x,
  inset: (x: 7pt, y: 3pt),
  outset: (y: 0.5pt),
  text(size: size-pill-x, fill: ink, label),
)

// ─── Spacious section header (full-width two-tone Caldera rule) ───────────────
#let xsection(title, body) = {
  v(space-section-x)
  text(font: sans-display, weight: "regular", size: size-h2-x, fill: primary, tracking: 0.03em, title)
  v(5pt)
  grid(
    columns: (48pt, 1fr),
    column-gutter: 7pt,
    align: (left + horizon, left + horizon),
    line(stroke: 2.8pt + accent, length: 100%),
    line(stroke: 0.6pt + rule.lighten(20%), length: 100%),
  )
  v(space-after-rule-x)
  body
}

// ─── Manifesto principle: bold lead + airy paragraph ─────────────────────────
#let principle(lead, body) = block(above: 0pt, below: gap-inter-entry-x, breakable: false, {
  block(above: 0pt, below: 6pt, breakable: false, {
    text(weight: "bold", size: size-lead-x, fill: ink, lead)
  })
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-body-x, fill: ink, body)
  })
})

// ─── "What I build" line: bold label — em-dash — description ─────────────────
#let build-line(label, body) = block(above: 0pt, below: 12pt, breakable: false, {
  set par(leading: leading-body-x, justify: false)
  text(weight: "bold", size: size-body-x, fill: ink, label)
  text(size: size-body-x, fill: muted)[ — ]
  text(size: size-body-x, fill: ink, body)
})

// ─── Experience entry (single-column, spacious) ──────────────────────────────
#let xrole(title: "", org: "", org-url: "", dates: "", location: none, summary: none) = block(
  above: 0pt, below: gap-inter-entry-x, breakable: false,
  {
    block(above: 0pt, below: 5pt, breakable: false, {
      text(weight: "bold", size: size-h3-x, fill: ink, title)
    })
    block(above: 0pt, below: 0pt, breakable: false, {
      set text(size: size-meta-x, style: "italic", fill: primary)
      if org-url != "" { link(org-url, org) } else { org }
      text(fill: muted, style: "italic")[ · ]
      text(fill: muted, style: "italic", dates)
    })
    if location != none {
      v(3pt)
      block(above: 0pt, below: 0pt, breakable: false, {
        set text(size: size-meta-x, style: "italic", fill: muted)
        location
      })
    }
    if summary != none {
      v(gap-intra-entry-x)
      block(above: 0pt, below: 0pt, {
        set par(leading: leading-body-x, justify: false)
        text(size: size-body-x, fill: ink, summary)
      })
    }
  },
)

// ─── Project entry (single-column, spacious) ─────────────────────────────────
#let xproject(logo: none, name: "", url: "", context-line: none, bullets: ()) = block(
  above: 0pt, below: gap-inter-entry-x, breakable: false,
  {
    grid(
      columns: (if logo != none { 40pt } else { 0pt }, 1fr),
      column-gutter: if logo != none { 12pt } else { 0pt },
      align: (center + top, left + top),
      if logo != none { box(image(logo, height: 34pt)) } else { [] },
      {
        block(above: 0pt, below: 5pt, breakable: false, {
          text(weight: "bold", size: size-h3-x, fill: ink, name)
          if url != "" {
            h(7pt)
            text(size: size-tiny-x, fill: muted)[#link(url, url.replace("https://", ""))]
          }
        })
        if context-line != none {
          block(above: 0pt, below: 8pt, {
            set par(leading: leading-body-x, justify: false)
            text(style: "italic", size: size-meta-x, fill: primary, context-line)
          })
        }
        set text(size: size-body-x, fill: ink)
        set par(leading: leading-body-x, justify: false)
        set list(marker: text(fill: accent)[•], indent: 0pt, body-indent: 7pt, spacing: 10pt)
        for b in bullets { list.item(b) }
      },
    )
  },
)

// ─── Spacious skill-pill category ────────────────────────────────────────────
#let xskill-category(category, items) = {
  text(weight: "bold", size: size-meta-x, font: sans, fill: primary, tracking: 0.06em, upper(category))
  v(6pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: gap-pill-line-x, justify: false)
    for (i, it) in items.enumerate() {
      pill-x(it)
      if i < items.len() - 1 { h(gap-pill-row-x) }
    }
  })
  v(16pt)
}

// ─── Cert / award group ──────────────────────────────────────────────────────
#let xcert-group(group, items) = block(above: 0pt, below: 14pt, breakable: false, {
  block(above: 0pt, below: 6pt, breakable: false, {
    text(weight: "bold", size: size-meta-x, fill: primary, group)
  })
  set text(size: size-body-x, fill: ink)
  set par(leading: leading-body-x)
  set list(marker: text(fill: accent, size: 6pt)[•], indent: 0pt, body-indent: 7pt, spacing: 11pt)
  for it in items { list.item(it) }
})

// ─────────────────────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────────────────────
#let extended-header() = {
  grid(
    columns: (auto, 1fr),
    column-gutter: 16pt,
    align: (horizon, horizon + left),
    box(
      radius: 50%, clip: true, width: 78pt, height: 78pt,
      stroke: 1.8pt + accent,
      image("/public/photos/chanmeng-portrait-2026.jpg"),
    ),
    {
      text(font: sans-display, size: size-h1-x, weight: "regular", fill: primary, tracking: 0.02em)[Chan Meng]
      linebreak(); v(3pt)
      text(size: size-role-x, fill: primary, weight: "medium")[AI Agent Architect · Full-stack Engineer · AI-Tooling Expert]
      linebreak(); v(2pt)
      text(size: size-meta-x, fill: muted, style: "italic")[« Subtraction for life, addition for thought. »]
    },
  )

  v(12pt)
  // Contact — single wrapped line, dot-separated.
  block(above: 0pt, below: 10pt, {
    set text(size: size-tiny-x, fill: ink)
    set par(leading: 1.1em, justify: false)
    xcontact("mail", "chanmeng.career\u{0040}gmail.com", target: "mailto:chanmeng.career@gmail.com")
    text(fill: muted)[   ·   ]
    xcontact("phone", "+64 028 8510 9245", target: "tel:+6402885109245")
    text(fill: muted)[   ·   ]
    xcontact("map-pin", "Auckland, New Zealand")
    text(fill: muted)[   ·   ]
    xcontact("globe", "chanmeng.org", target: "https://chanmeng.org/")
    linebreak()
    xcontact("linkedin", "linkedin.com/in/chanmeng666", target: "https://www.linkedin.com/in/chanmeng666/")
    text(fill: muted)[   ·   ]
    xcontact("github", "github.com/ChanMeng666", target: "https://github.com/ChanMeng666")
    text(fill: muted)[   ·   ]
    xcontact("calendar", "cal.com/chan-meng/30min", target: "https://cal.com/chan-meng/30min")
  })

  // Social-proof pills row.
  block(above: 0pt, below: 0pt, {
    set par(leading: 1.0em, justify: false)
    let snum(v) = text(weight: "bold", fill: accent)[#v]
    let spill(body) = box(fill: pill-bg, stroke: 0.6pt + accent, radius: cv-radius-pill-x,
      inset: (x: 7pt, y: 3pt), outset: (y: 0.5pt), text(size: size-pill-x, fill: muted, body))
    spill[#snum[5,594] LinkedIn followers · #snum[18] recommendations]
    h(gap-pill-row-x)
    spill[#snum[1,103] newsletter subscribers]
    h(gap-pill-row-x)
    spill[#snum[451] GitHub stars · #snum[210] followers]
    h(gap-pill-row-x)
    spill[CopilotKit contributor · #snum[2] merged PRs · #snum[24.6k] stars]
  })

  v(14pt)
  grid(
    columns: (60pt, 1fr),
    column-gutter: 7pt,
    align: (left + horizon, left + horizon),
    line(stroke: 3pt + accent, length: 100%),
    line(stroke: 0.7pt + rule.lighten(15%), length: 100%),
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Introduction
// ─────────────────────────────────────────────────────────────────────────────
#let x-introduction() = xsection("Introduction", {
  set par(leading: leading-lead-x, justify: false)
  text(size: size-body-x, fill: ink)[
    Builds the AI software that real companies run every day — the kind that handles paying customers, private data, and regulated work, not demos. Focus areas: *women's health, cultural technology, and early-stage startup infrastructure*. Works AI-native by default: directs coding agents (Claude Code, Codex) and the same *Claude Agent SDK, MCP, and agent skills* stack Anthropic's own partners use, and owns the judgment calls that decide what actually ships — publishing the work as open-source examples other teams build on.
  ]
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: How I Work  (the personal manifesto — confident, professional)
// ─────────────────────────────────────────────────────────────────────────────
#let x-how-i-work() = xsection("How I Work", {
  block(above: 0pt, below: 18pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-body-x, fill: muted, style: "italic")[Hiring is a two-way match — so here's my half of it: how I work, and the teams I do my strongest work with.]
  })
  principle(
    [I build with agents as the default layer, not an occasional assist.],
    [My day is spent directing coding agents (Claude Code, Codex) and reviewing what they produce — I've moved from writing most code by hand to orchestrating it and owning the judgment calls. That shift is the whole point: when execution gets cheap, the work that matters is choosing what to build, framing the problem well, and having the taste to keep only what's worth keeping.],
  )
  principle(
    [Professional AI tooling is infrastructure — and I treat it as a baseline.],
    [A Claude Code or Codex subscription is foundational to how I work, the way a laptop and cloud access are. I read its honest cost the way Anthropic's own team does: not against a monthly SaaS line item, but against the engineer-hours it replaces. A team that equips its builders with first-class AI tooling has usually thought seriously about velocity; one that withholds it usually hasn't — so it's among the first things I look for.],
  )
  principle(
    [I'm a builder who owns problems end to end, not a single lane on an org chart.],
    [The clean split between "pure frontend", "pure backend", and "pure UI/UX" is a holdover from when one person couldn't reasonably hold all three. With agents, I can — and I'd rather own a problem from data model to interface to the assets that launch it than fill one box and hand off at every seam. I do my strongest work where authority follows the work, not the title.],
  )
  principle(
    [I look for organisations that are AI-native by design, not by adoption.],
    [Using AI tools and being AI-native aren't the same thing. The teams I do my best work with have rebuilt how the work actually flows — agents carry the routine execution, people show up for the judgment — instead of bolting AI onto a process designed for a pre-agent world. If that's the direction you're building in, we'll move fast together.],
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: What I Build With AI  (full-spectrum showcase)
// ─────────────────────────────────────────────────────────────────────────────
#let x-what-i-build() = xsection("What I Build With AI", {
  block(above: 0pt, below: 16pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-body-x, fill: ink)[
      "Engineer" undersells it. With AI as the multiplier, I build across the whole product surface — the agent, the system around it, the brand it ships under, and the documents and marketing that carry it:
    ]
  })
  build-line([AI agents & multi-agent systems], [guardrails enforced in code, built to run in production with paying customers — not demos.])
  build-line([MCP servers], [shipped one of the earliest in the ecosystem (Google News MCP, 35 days after Anthropic's launch) — now listed across 15+ catalogs.])
  build-line([Agent skills], [including the official Typst skill for Claude Code — it typesets this very CV.])
  build-line([Visual brand & design systems], [a full Caldera-grade brand system (tokens, type, motion) and gradient-svg-generator with 340+ animated-SVG templates.])
  build-line([Workflows & internal tooling], [CI/CD pipelines, internal CLIs, multi-agent "teams", code-review automation, and IDE hooks that compound across an engineering org.])
  build-line([Documents as code], [agendas, contracts, receipts, papers, Speaker & Media Kits, this CV — all typeset programmatically in Typst: version-controlled, reproducible, no templates and no hosted doc-gen service.])
  build-line([Marketing assets], [branded social & OG cover images, promotional graphics, and short-form video — produced through code, on-brand, at speed.])
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Experience
// ─────────────────────────────────────────────────────────────────────────────
#let x-experience() = xsection("Experience", {
  xrole(
    title: "AI Agent Architect", org: "Engram", org-url: "https://engram.media/",
    dates: "May 2026 — Present",
    location: [Albuquerque, New Mexico, United States · *Remote*],
    summary: [Recruited onto *Anthropic's Partner Network architect track* — the founder used his own Claude agent to surface candidates, and Chan's open-source portfolio was the recommendation (publicly confirmed). 45-day Architect Cohort: *Claude Certified Architect — Foundations* curriculum.],
  )
  xrole(
    title: "AI Instructor & Mentor", org: "TechNest Community", org-url: "https://www.technestcommunity.com/",
    dates: "Apr 2026 — Present",
    location: [St John's, Newfoundland, Canada · *Remote*],
    summary: [Built and sole-teaches TechNest's first AI-specialised mentorship track — a *12-week prompt-first curriculum where students ship portfolio-grade AI apps by week 8*. Also built the bilingual teaching platform 95.7% solo, including an in-course RAG assistant on Cloudflare Workers (Llama 3.1 8B + Vectorize + KV).],
  )
  xrole(
    title: "Founding Principal Engineer, Activation, Execution & AI Systems", org: "GAVIGO Inc.", org-url: "https://gavigo.com/",
    dates: "Oct 2025 — Present",
    location: [Wilmington, Delaware, United States · *Remote*],
    summary: [Promoted *Core Engineer → Founding Principal Engineer across three contract iterations* — owns the Intelligence Layer of GAVIGO's sub-millisecond app activation platform (lets users open straight into a game without an app-store install). *p50 < 1 ms activation latency · 84.6% warm-pool hit rate* · cross-cloud DigitalOcean → GCP GKE migration in a *30-minute zero-downtime cutover* · *98% solo on 353 commits*.],
  )
  xrole(
    title: "Senior Full-Stack Engineer & Website Team Lead", org: "She Sharp", org-url: "https://www.shesharp.org.nz/",
    dates: "Jul 2025 — Present",
    location: [Auckland, New Zealand · *Hybrid*],
    summary: [Recruited by founder Dr Mahsa Mohaghegh to rebuild *New Zealand's leading women-in-STEM platform* (*2,200+ registered members, 8,000+ women supported lifetime*). Webflow → Next.js cutover *86.6% solo across 10 months*, 10+ years of legacy content preserved with *zero broken inbound links*, AI mentor-matching engine (GPT-4o-mini, 5-dimensional scoring) shipped on top.],
  )
  xrole(
    title: "Chief Technology Officer", org: "FemTech Weekend", org-url: "https://www.femtechweekend.com/",
    dates: "Mar 2025 — Present",
    location: [Chengdu, Sichuan, China · *Remote*],
    summary: [Sole technical lead for *China's first FemTech organisation* since its inaugural conference — built and rebuilt the entire web platform twice (Next.js Gen-1 → Docusaurus Gen-2 editorial rewrite). Currently operating the *2026 Shanghai Summit — 16 confirmed speakers, including FemTech-term originator Ida Tin*.],
  )

  block(above: 4pt, below: 0pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-meta-x, fill: muted, style: "italic")[
      *Previously:* *CTO at #link("https://www.ibm.com/partnerplus/directory/company/9542")[Sanicle]* (prev. Senior AI/ML Infrastructure Engineer; Tulsa, Oklahoma, US · remote) — earned the company its *IBM Silver Partner* certification through a solo build (350+ commits) · *#link("https://www.bytedance.com/en/")[ByteDance] Full-Stack Engineer* on the Douyin Mall capstone (Beijing, China · remote; Spring Boot 3 + solo Vue 3, #2 of 8 contributors) · *React Native full-stack mobile dev at #link("https://corde.nz/")[CORDE Christchurch]* (Canterbury, NZ · hybrid) · *#link("https://www.linkedin.com/company/taxing-mentorship/")[Forward With Her] mentor* (China · remote; 7 of 18 LinkedIn recs from this cohort).
    ]
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Selected Open-Source Projects
// ─────────────────────────────────────────────────────────────────────────────
#let x-projects() = xsection("Selected Open-Source Projects", {
  xproject(
    logo: "/public/brands/tam-ai-ti-logo-with-brand.svg",
    name: "Tam-AI-Ti", url: "https://tamaiti.whiri-ai.com/",
    context-line: [An AI financial-wellness app built around te ao Māori — the user's culture lives in the data model, not just the translation layer · commissioned solo by Riria (Missy) Te Kanawa (ASB Bank · former KPMG NZ National Māori Sector lead).],
    bullets: (
      [351 commits solo · 48 tables / 494 columns / 22 migrations · 3-model OpenAI composition (`gpt-4o-mini` coach turns + `gpt-4o` synthesis + `gpt-4o-realtime-preview` voice).],
      [*Schema-first te reo Māori* — Maramataka lunar phases and Te Whare Tapa Whā wellness domains live as first-class Drizzle enum types, not UI labels (prevents the "i18n drift" where cultural concepts decay into English-only columns).],
      [*19-user research cohort sustained 4 months* · 181 bilingual journal entries · 35 voice sessions · 146 AI coach messages · 74 daily check-ins.],
    ),
  )
  xproject(
    logo: "/public/brands/echook-logo.svg",
    name: "echook — claude-code-audio-hooks", url: "https://github.com/ChanMeng666/echook",
    context-line: [A noise-control system for AI coding assistants — turns down their constant audio chatter during deep work, and alerts only on the things that matter.],
    bullets: (
      [*Reference implementation of the Claude Agent SDK hooks lifecycle* — PreToolUse · PostToolUse · status line · context-window quota. 26 hook events · 42 releases · 139 tests on triple-platform CI (Linux / macOS / Windows).],
      [*Cross-tool by design* — one hook system, three IDE surfaces: Claude Code, Cursor, OpenAI Codex.],
      [Started as an internal noise-fix for long-running background agents; open-sourced after teammates asked for it; now community-adopted across all three IDEs.],
    ),
  )
  xproject(
    logo: "/public/brands/vitex.svg",
    name: "Vitex — AI Career Agent", url: "https://www.vitex.org.nz/",
    context-line: [Paste a job description, get a tailored resume + cover letter scored against the JD's keywords in under 30 seconds · ~95% solo · 168 commits · Vercel AI SDK + GPT-4o + Typst.],
    bullets: (
      [*7-step AI pipeline streaming over SSE* (JD parsing → background → match analysis → resume tailoring → ATS scoring → cover letter → Typst doc generation) · every stage Zod-validated structured output.],
      [*Typst compiles PDFs locally in under 100 ms* across 14 AI-auto-selected templates — no hosted Chromium, no third-party doc-gen API.],
      [*Three production migrations* (Railway → Cloudflare Workers → DigitalOcean VPS) + LaTeX → Typst engine swap, zero downtime · Docker + Traefik + GitHub Actions CD · Stripe credits ledger + share-token URLs.],
    ),
  )
  xproject(
    logo: "/public/brands/server-google-news.svg",
    name: "Google News MCP Server", url: "https://glama.ai/mcp/servers/ChanMeng666/server-google-news",
    context-line: [Earliest-ecosystem MCP server — gives AI assistants live Google News access. Shipped 35 days after Anthropic's Nov 2024 MCP launch.],
    bullets: (
      [*Featured in Skywork AI's AI-engineer deep-dive guide* — listed across *15+ MCP catalogs* · PulseMCP "Top Pick" · Glama A-rating · 122 stars · `@chanmeng666/google-news-server` on npm.],
      [*Shipped before MCP had a registry* — built its own discovery story (PulseMCP + Glama + npm submissions), compounding into a first-mover index advantage as catalogs came online.],
    ),
  )

  block(above: 4pt, below: 0pt, {
    set text(size: size-tiny-x, fill: muted, style: "italic")
    set par(leading: leading-body-x, justify: false)
    [
      *Also built:* #link("https://eatropolis.co.nz/")[eatropolis.co.nz] (solo 9-day commercial event platform for Chow Luck Club × Tātaki Auckland Unlimited / Auckland Council) · #link("https://gradient-svg-generator.vercel.app/")[gradient-svg-generator] (340+ animated-SVG templates, 273 solo commits) · #link("https://github.com/ChanMeng666/typst-claude-skill")[typst-claude-skill] (official Typst skill for Claude Code — typesets this CV) · #link("https://sunostats.chanmeng.org/")[SunoStats] (industry's first Suno music lineage explorer · trilingual English / Simplified Chinese / Japanese) · #link("https://fanfic-lab.tech/")[FanFic Lab] (7-node LangGraph agent).
    ]
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Toolkit & Stack
// ─────────────────────────────────────────────────────────────────────────────
#let x-toolkit() = xsection("Toolkit & Stack", {
  xskill-category("Claude Code — every extension surface shipped", ("CLAUDE.md", "Skills", "Subagents", "Hooks", "Status line", "Plugins"))
  xskill-category("Codex CLI — daily-driver fluency", ("AGENTS.md", "Sandbox + approvals", "Headless mode"))
  xskill-category("Beyond pure coding — AI-leveraged work", ("Typst PDFs", "CI/CD pipelines", "Slack apps", "Agent teams", "Code review", "Internal CLIs"))
  xskill-category("Agent SDKs & frameworks", ("Claude Agent SDK", "OpenAI Agents SDK", "LangGraph", "LangChain", "CopilotKit", "Vercel AI SDK"))
  xskill-category("How agents connect to tools & data", ("MCP (Model Context Protocol)",))
  xskill-category("Quality & observability", ("Vitest", "Cypress", "mcp-evals", "Lighthouse", "OpenTelemetry", "web-vitals"))
  xskill-category("Models", ("Anthropic Opus / Sonnet / Haiku", "OpenAI GPT-4o + realtime", "Gemini 2.x", "Llama 3.x"))
  xskill-category("App frameworks", ("Next.js 16", "React", "Vue 3", "Spring Boot 3", "FastAPI", "TailwindCSS", "Drizzle ORM", "Zod"))
  xskill-category("Infra & data", ("Kubernetes GKE", "Cloudflare Workers + Vectorize", "Neon Postgres + pgvector", "Supabase", "Docker + Traefik", "Redis", "Stripe", "NextAuth"))
  xskill-category("Languages", ("TypeScript", "Python", "Go", "Java", "SQL", "Typst"))
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Recognition
// ─────────────────────────────────────────────────────────────────────────────
#let x-recognition() = xsection("Recognition", {
  set text(size: size-body-x, fill: ink)
  set par(leading: leading-body-x)
  set list(marker: text(fill: accent, size: 6pt)[•], indent: 0pt, body-indent: 7pt, spacing: 12pt)
  list.item[*UN CSW 69 Speaker* — UN HQ NYC, Mar 2025 · attracted *IBM pilot interest* and an endorsement from Sierra Leone's Minister of Gender and Children's Affairs.]
  list.item[*Outstanding Mentor Award* — AI Hackathon Festival 2025 · 1 of 14 expert mentors · guided 11 teams / 80+ participants.]
  list.item[*Excellence Award* — FemTech China (Women's Health Technology Challenge, Dec 2024).]
  list.item[*UN Women FemTech Hackathon — Outstanding Performer* — FemTech Weekend, Beijing (Mar 2025).]
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Certifications & Training
// ─────────────────────────────────────────────────────────────────────────────
#let x-certifications() = xsection("Certifications & Training", {
  xcert-group("Anthropic (6)", (
    [*Building with the Claude API · Intro to MCP · Intro to Agent Skills · Claude Code in Action* (all May 2026; *Claude Code in Action* originally Aug 2025) · *AI Fluency: Framework & Foundations* (Aug 2025)],
    [*Claude Certified Architect — Foundations* curriculum completed (on the Anthropic Partner Network track via Engram)],
  ))
  xcert-group("Other AI / Cloud", (
    [*Google AI Essentials · Microsoft Azure AI Essentials · Generative AI Career Skills · Wolfram Machine Learning Foundations · GitHub Professional · Docker Professional · Microsoft Software Development* (Dec 2024 — Aug 2025)],
  ))
  xcert-group("Engineering & platforms (50+ total)", (
    [*HackerRank Software Engineer* + 22 skill certifications — *SQL (Advanced)* · Problem Solving · Go · Node.js · React · Angular],
    [*Microsoft* (Azure · System Administration · Project Management) · *C++ Institute* · *Anaconda Python* · *Atlassian Agile* · *Mozilla*],
  ))
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Education
// ─────────────────────────────────────────────────────────────────────────────
#let x-education() = xsection("Education", {
  block(above: 0pt, below: 5pt, breakable: false, {
    text(weight: "bold", size: size-h3-x, fill: ink)[Master of Applied Computing]
  })
  block(above: 0pt, below: 3pt, breakable: false, {
    set text(size: size-meta-x, style: "italic", fill: primary)
    [Lincoln University]
    text(fill: muted)[ — New Zealand]
  })
  block(above: 0pt, below: 4pt, breakable: false, {
    text(size: size-tiny-x, fill: muted)[Nov 2023 — Dec 2024]
  })
  text(size: size-body-x, fill: ink)[Distinction (80%+) · Dean's List, Top 5%]
})
