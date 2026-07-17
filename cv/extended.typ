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

// ─── Logo strip — a row of shipped-product marks, fixed height ───────────────
#let logo-strip(paths, ht: 19pt, g: 18pt) = block(above: 0pt, below: 0pt, {
  set par(leading: 1.7em, justify: false)
  for (i, p) in paths.enumerate() {
    box(baseline: 0.3 * ht, image(p, height: ht))
    if i < paths.len() - 1 { h(g) }
  }
})

// ─── Captioned photo figure (centered, rounded, hairline frame) ──────────────
#let photo-figure(path, caption, w: 58%) = block(above: 0pt, below: 0pt, breakable: false,
  align(center, box(width: w, {
    box(width: 100%, radius: 8pt, clip: true, stroke: 0.8pt + rule.lighten(25%), image(path, width: 100%))
    v(5pt)
    align(center, text(size: size-tiny-x, fill: muted, style: "italic", caption))
  }))
)

// ─── Halftone brand band — Chan's signature risograph texture (16:9 source,
//     clipped to a slim full-width strip as a brand accent). ─────────────────
#let halftone-band() = block(above: 0pt, below: 16pt,
  box(width: 100%, height: 34pt, clip: true, radius: 4pt,
    image("/public/brand/halftone-thumb.svg", width: 100%))
)

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
    spill[#snum[480+] GitHub stars · #snum[210] followers]
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
    Builds the AI software companies run every day — products with paying customers, private data, and regulated work behind them, not demos. Focus areas: *women's health, cultural technology, and early-stage startup infrastructure*. Works AI-native by default — directing coding agents (Claude Code, Codex) and building on the *Claude Agent SDK, MCP, and agent skills*, while keeping the call on what actually ships a human one — and publishing the work as open-source examples other teams build on.
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

// ─── Capability band (single column): accent eyebrow + concise lead +
//     tight receipt list. Generous gap below so bands breathe vertically. ────
#let cap(eyebrow, lead, items) = block(above: 0pt, below: 22pt, {
  block(above: 0pt, below: 7pt, breakable: false, {
    text(weight: "bold", size: size-meta-x, font: sans, fill: accent, tracking: 0.07em, upper(eyebrow))
  })
  if lead != none {
    block(above: 0pt, below: 9pt, {
      set par(leading: leading-body-x, justify: false)
      text(size: size-body-x, fill: muted, lead)
    })
  }
  block(above: 0pt, below: 0pt, {
    set text(size: size-body-x, fill: ink)
    set par(leading: leading-body-x, justify: false)
    set list(marker: text(fill: accent, size: 6pt)[•], indent: 0pt, body-indent: 8pt, spacing: 9pt)
    for it in items { list.item(it) }
  })
})

// ─── Evidence figure tile (real image clipped, or a dashed placeholder). ─────
#let fig(img, caption) = block(breakable: false, {
  if img == none {
    box(width: 100%, height: 150pt, radius: 7pt, fill: pill-bg,
      stroke: (paint: accent, thickness: 0.9pt, dash: "dashed"),
      align(center + horizon, text(size: 9pt, fill: muted, style: "italic")[screenshot to add]))
  } else {
    box(width: 100%, height: 150pt, radius: 7pt, clip: true, stroke: 0.8pt + rule.lighten(30%),
      image(img, width: 100%))
  }
  v(5pt)
  text(size: size-tiny-x, fill: muted, style: "italic", caption)
})

// ─── Two-up figure grid — large, airy tiles (deliberately NOT a dense grid). ─
#let fig-grid(items) = grid(
  columns: (1fr, 1fr),
  column-gutter: 18pt,
  row-gutter: 18pt,
  ..items.map(it => fig(it.at(0), it.at(1))),
)

// ─── Speaking / event photo strip (real photos + "to add" placeholders) ──────
#let photo-strip(items) = block(breakable: false, {
  grid(
    columns: (1fr,) * items.len(),
    column-gutter: 10pt,
    ..items.map(it => {
      if it.img == none {
        box(width: 100%, height: 84pt, radius: 6pt, fill: pill-bg,
          stroke: (paint: accent, thickness: 0.8pt, dash: "dashed"),
          align(center + horizon, text(size: 7.5pt, fill: muted, style: "italic")[photo to add]))
      } else {
        box(width: 100%, height: 84pt, radius: 6pt, clip: true, stroke: 0.8pt + rule.lighten(30%),
          image(it.img, width: 100%))
      }
    }),
  )
  v(5pt)
  grid(
    columns: (1fr,) * items.len(),
    column-gutter: 10pt,
    ..items.map(it => text(size: size-tiny-x, fill: muted, style: "italic", it.cap)),
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Selected Work — the single, de-duplicated evidence showcase.
// Every artifact appears exactly ONCE, grouped by capability, each name a link.
// (Replaces the old "What I Build" + "Open-Sourced" + "Selected Projects".)
// ─────────────────────────────────────────────────────────────────────────────
#let x-selected-work() = xsection("Selected Work — Proof of an AI-Native Builder", {
  block(above: 0pt, below: 22pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-body-x, fill: ink)[
      As an independent developer working directly with real clients, I own the whole delivery end to end — the app and the agent, the brand system, the documents, and the launch media — all as version-controlled code, with Claude Code as the multiplier. Every name below is a link you can open; a few of these are shown in the gallery that follows.
    ]
  })

  cap("AI agents & production apps",
    [Multi-agent systems that run in production — paying customers, sensitive data, guardrails enforced in code, not just prompts. The agent ships as the product, never a demo.],
    (
      [#link("https://tamaiti.whiri-ai.com/")[Tam-AI-Ti] — te-ao-Māori financial-wellness coach · bilingual voice coaching · 19-user, 4-month research cohort],
      [#link("https://github.com/ChanMeng666/femtracker-agent")[FemTracker] — 8-node LangGraph agent, merged into CopilotKit's official demos],
      [#link("https://www.vitex.org.nz/")[Vitex] — AI career agent: a job description → tailored résumé + cover letter in under 30s],
      [#link("https://archcanvas.uk/")[ArchCanvas] — AI design agent for architects · productizes ArchLang · gpt-5.5 orchestration + GPT Image 2 renderings grounded on the compiled plan · edits morph the plan in place],
      [#link("https://seismophone.chanmeng.org/")[Seismophone] — an independent observatory for AI music · trilingual],
    ),
  )
  cap("Skills, MCP servers & developer tools",
    [I package the workflows I rely on into reusable Claude Code skills, plugins and MCP servers — then open-source them for everyone.],
    (
      [#link("https://github.com/ChanMeng666/archlang")[ArchLang] — a floor-plan programming language I invented · compiles to professional SVG (Typst/LaTeX for architecture) · zero-dependency TypeScript · on npm],
      [#link("https://github.com/ChanMeng666/academic-paper-review-skill")[academic-paper-review-skill] — dual-lens peer review → Markdown / Typst / PDF],
      [#link("https://github.com/ChanMeng666/app-promo-studio")[app-promo-studio] — screenshots → cross-platform store & social images],
      [#link("https://github.com/ChanMeng666/logo-as-code-skill")[logo-as-code-skill] — hand-drawn logo → editable SVG + favicons],
      [#link("https://github.com/ChanMeng666/typst-claude-skill")[typst-claude-skill] — Typst PDF generation; it typesets this CV],
      [#link("https://github.com/ChanMeng666/echook")[echook] — audio-hooks framework · voice + sound alerts across three IDEs · triple-OS CI],
      [#link("https://glama.ai/mcp/servers/ChanMeng666/server-google-news")[Google News] & #link("https://github.com/ChanMeng666/server-google-jobs")[Google Jobs] MCP — among the earliest · 15+ catalogs],
    ),
  )
  cap("Design systems & brand",
    [Whole design systems, not themes — tokens, type, motion, and a signature risograph texture — for my own brand and for paying clients.],
    (
      [*Caldera* — the design system behind this CV: tokens, type, motion],
      [#link("https://eatropolis.co.nz/")[Chow Luck Club] — event brand + site for a paying client (Tātaki Auckland Unlimited / Auckland Council)],
      [#link("https://gradient-svg-generator.vercel.app/")[gradient-svg-generator] — 355 animated-SVG templates for READMEs],
    ),
  )
  cap("Documents as code",
    [As an independent developer with real clients, I write the paperwork too — all typeset as version-controlled Typst, reproducible, with no hosted doc-gen service.],
    (
      [*Client contracts & staged receipts* — delivery paperwork generated and tracked as code],
      [*Conference agenda* — FemTech Weekend's 2026 Shanghai Summit programme],
      [Speaker & #link("https://github.com/ChanMeng666/ChanMeng666/tree/main/media-kit")[Media Kit] — a press one-sheet for speaking],
      [*Peer-review reports & this CV* — my own Typst pipeline],
    ),
  )
  cap("Marketing media — images & video",
    [Launch media, also as code — promo graphics generated from the design system as HTML, and code-driven video in Remotion with AI voice and music. Zero Premiere, zero voice actors.],
    (
      [#link("https://github.com/ChanMeng666/echook-promo-video")[echook promo film] — 88-sec product film · Remotion + Claude Code + ElevenLabs + Suno],
      [*Promo graphics & OG covers* — HTML → branded images across every deployed project],
    ),
  )
  cap("Team automation",
    [I automate team operations end to end — a Slack ecosystem that retired volunteer chores.],
    (
      [#link("https://github.com/NZ-SheSharp/she-sharp")[She Sharp Slack ecosystem] — event bot, weekly digests, NZ-funding crawler + a sync-event-from-slack skill],
    ),
  )

  // ── Evidence gallery — large two-up tiles, real screenshots + placeholders.
  block(above: 6pt, below: 9pt, breakable: false, {
    text(size: size-meta-x, fill: muted, style: "italic")[Selected work, in the wild — real screenshots, with placeholders where more are coming.]
  })
  fig-grid((
    ("/cv/assets/thumbs/tam-ai-ti.jpg", [Tam-AI-Ti — production app]),
    ("/cv/assets/thumbs/vitex.jpg", [Vitex — AI career agent]),
    ("/cv/assets/thumbs/eatropolis.jpg", [Chow Luck Club — client site]),
    (none, [Client contract & receipts — Typst]),
    (none, [echook promo film — Remotion]),
  ))
})

// (The old "Open-Sourced for the Community" and "Selected Open-Source Projects"
//  sections were merged into x-selected-work() above — each artifact appears
//  exactly once now, so nothing is duplicated.)

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Experience
// ─────────────────────────────────────────────────────────────────────────────
#let x-experience() = xsection("Experience", {
  xrole(
    title: "AI Agent Architect", org: "Engram", org-url: "https://engram.media/",
    dates: "May 2026 — Present",
    location: [Albuquerque, New Mexico, United States · *Remote*],
    summary: [Recruited onto *Anthropic's Partner Network architect track* — Engram's founder asked his own Claude agent to surface candidates, and Chan's open-source portfolio was the pick (publicly confirmed by founder Luka Madzarac). Now in the 45-day Architect Cohort on the *Claude Certified Architect — Foundations* curriculum.],
  )
  xrole(
    title: "AI Instructor & Mentor", org: "TechNest Community", org-url: "https://www.technestcommunity.com/",
    dates: "Apr 2026 — Present",
    location: [St John's, Newfoundland, Canada · *Remote*],
    summary: [Sole instructor of TechNest's first AI-specialised mentorship track — her *fifth teaching cohort since 2024*. Students arrive knowing only browser ChatGPT and, over 12 weeks, learn to build by directing coding agents, shipping a live multi-user AI product by the end. Also built the bilingual teaching platform that hosts it, including an in-course RAG assistant on Cloudflare Workers (Llama 3.1 8B + Vectorize + KV).],
  )
  xrole(
    title: "Founding Principal Engineer, Activation, Execution & AI Systems", org: "GAVIGO Inc.", org-url: "https://gavigo.com/",
    dates: "Oct 2025 — Present",
    location: [Wilmington, Delaware, United States · *Remote*],
    summary: [Owns the intelligence layer of GAVIGO's app-activation platform — tap a game in a feed and it plays instantly, no app-store install. Built the AI scheduler that keeps content pre-warmed on Kubernetes (GKE) so a tapped game resumes in *under a millisecond* — already warm 84.6% of the time — and moved the platform across clouds (DigitalOcean → GCP) with zero downtime. Promoted *Core Engineer → Founding Principal Engineer* across three renewals, building nearly the whole system solo.],
  )
  xrole(
    title: "Senior Full-Stack Engineer & Website Team Lead", org: "She Sharp", org-url: "https://www.shesharp.org.nz/",
    dates: "Jul 2025 — Present",
    location: [Auckland, New Zealand · *Hybrid*],
    summary: [Recruited by founder Dr Mahsa Mohaghegh to rebuild the member platform for *New Zealand's leading women-in-STEM charity* (*2,200+ registered members, 8,000+ women supported lifetime*). Moved the community off a drag-and-drop website onto one system for sign-ups, events, and mentor matching — 10+ years of content carried over with *zero broken inbound links*, \~85% solo over a year. Mentors and mentees are paired by AI scoring (GPT-4o-mini, 5-dimensional) with human review.],
  )
  xrole(
    title: "Chief Technology Officer", org: "FemTech Weekend", org-url: "https://www.femtechweekend.com/",
    dates: "Mar 2025 — Present",
    location: [Chengdu, Sichuan, China · *Remote*],
    summary: [Sole engineer behind *China's first women's-health-technology organisation* — built, then rebuilt its entire web platform twice as the mission grew, from a marketing site on Next.js to an editorial and research platform on Docusaurus. Ran the digital infrastructure for the *2026 Shanghai Summit* (June 22–25), a four-day event with *20 confirmed speakers* headlined by Ida Tin, who coined the term "FemTech".],
  )
  xrole(
    title: "Chief Technology Officer", org: "Sanicle", org-url: "https://www.linkedin.com/company/sanicleofficial/",
    dates: "Mar 2025 — Feb 2026",
    location: [Tulsa, Oklahoma, United States · *Remote*],
    summary: [Joined as Senior AI/ML Infrastructure Engineer, promoted to CTO. Took Sanicle from a no-code prototype to the production B2B FemTech SaaS employers buy for their staff — menstrual and menopause workplace wellness. Personally integrated *IBM watsonx* into the product, the work that earned Sanicle its *#link("https://www.ibm.com/partnerplus/directory/solution/0638")[IBM Silver Partner]* certification.],
  )

  block(above: 4pt, below: 0pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-meta-x, fill: muted, style: "italic")[
      *Previously:* *#link("https://www.bytedance.com/en/")[ByteDance] Full-Stack Engineer* on the Douyin Mall capstone (Beijing, China · remote; Spring Boot 3 + solo Vue 3, #2 of 8 contributors) · *React Native full-stack mobile dev at #link("https://corde.nz/")[CORDE Christchurch]* (Canterbury, NZ · hybrid) · *#link("https://www.linkedin.com/company/taxing-mentorship/")[Forward With Her] mentor* (China · remote; 7 of 18 LinkedIn recs from this cohort).
    ]
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Toolkit & Stack
// ─────────────────────────────────────────────────────────────────────────────
#let x-toolkit() = xsection("Toolkit & Stack", {
  xskill-category("Claude Code — every extension surface shipped", ("CLAUDE.md", "Skills", "Subagents", "Hooks", "Status line", "Plugins"))
  xskill-category("Codex CLI — daily-driver fluency", ("AGENTS.md", "Sandbox + approvals", "Headless mode"))
  xskill-category("Agent SDKs & frameworks", ("Claude Agent SDK", "OpenAI Agents SDK", "LangGraph", "LangChain", "CopilotKit", "Vercel AI SDK"))
  xskill-category("How agents connect to tools & data", ("MCP (Model Context Protocol)",))
  xskill-category("Quality & observability", ("Vitest", "Cypress", "mcp-evals", "Lighthouse", "OpenTelemetry", "web-vitals"))
  xskill-category("Models", ("Anthropic Opus / Sonnet / Haiku", "OpenAI gpt-5.5 / GPT-4o + realtime", "Gemini 2.x", "Llama 3.x"))
  xskill-category("App frameworks", ("Next.js 16", "React", "Vue 3", "Spring Boot 3", "FastAPI", "TailwindCSS", "Drizzle ORM", "Zod"))
  xskill-category("Infra & data", ("Kubernetes GKE", "Cloudflare Workers + Vectorize", "Neon Postgres + pgvector", "Supabase", "Docker + Traefik", "Redis", "Stripe", "Stack Auth", "NextAuth 5"))
  xskill-category("Languages", ("TypeScript", "Python", "Go", "Java", "SQL", "Typst"))
})

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Recognition
// ─────────────────────────────────────────────────────────────────────────────
#let x-recognition() = xsection("Speaking & Recognition", {
  block(above: 0pt, below: 12pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-body-x, fill: ink)[I speak and mentor in public — at the UN, at hackathons, and across the tech community. A few moments (more to come):]
  })
  photo-strip((
    (img: "/cv/assets/thumbs/speak-keynote.jpg", cap: [Keynote — AI Hackathon Festival 2025]),
    (img: "/cv/assets/thumbs/speak-panel1.jpg", cap: [Panel — She Sharp]),
    (img: "/cv/assets/thumbs/speak-panel2.jpg", cap: [Speaking — She Sharp]),
    (img: none, cap: [more to add]),
  ))
  v(16pt)
  block(above: 0pt, below: 0pt, {
    set text(size: size-body-x, fill: ink)
    set par(leading: leading-body-x)
    set list(marker: text(fill: accent, size: 6pt)[•], indent: 0pt, body-indent: 7pt, spacing: 12pt)
    list.item[*UN CSW 69 Speaker* — UN HQ NYC, Mar 2025 · attracted *IBM pilot interest* and an endorsement from Sierra Leone's Minister of Gender and Children's Affairs.]
    list.item[*Outstanding Mentor Award* — AI Hackathon Festival 2025 · 1 of 14 expert mentors · guided 11 teams / 80+ participants.]
    list.item[*Excellence Award* — FemTech China (Women's Health Technology Challenge, Dec 2024).]
    list.item[*UN Women FemTech Hackathon — Outstanding Performer* — FemTech Weekend, Beijing (Mar 2025).]
  })
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
