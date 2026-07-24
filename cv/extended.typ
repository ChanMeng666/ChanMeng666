// Chan Meng — EXTENDED CV content: the 16-page «Subtraction / Addition» magazine.
// Each x-*() renders one chapter. Facts mirror data/profile/*.yaml; dates anchor
// to data/profile/10-career.yaml. All English, first person. See the plan +
// spec under docs/superpowers/ for page architecture and red lines.
#import "theme-extended.typ": *
#import "extended-components.typ": *

// ── p1: full-bleed cover ─────────────────────────────────────────────────────
#let x-cover() = {
  set page(margin: 0pt, footer: none,
    background: image("/public/photos/chan-by-the-tree.jpg", width: 100%, height: 100%, fit: "cover"))
  place(bottom + left, dx: 2cm, dy: -2.2cm, block(width: 16cm, {
    text(font: sans-display, weight: "regular", size: 60pt, fill: on-accent, tracking: 0.01em)[Chan Meng]
    v(6pt)
    text(size: 15pt, fill: on-accent)[A minimalist. #text(fill: accent, weight: "bold")[Subtraction for life, addition for thought.]]
  }))
  pagebreak()
}

// ── p2: opening note ─────────────────────────────────────────────────────────
#let x-opening() = {
  v(2.4cm)
  block(width: 100%, {
    set par(leading: leading-lead-x, justify: false)
    text(size: 14pt, fill: ink)[
      This isn't a résumé. It's a short field guide to how I think and what I make — written for anyone curious about my products and the way I work.
    ]
    v(12pt)
    text(size: 14pt, fill: ink)[
      If you're here to hire, my two-page CV is one click away: #link("https://chanmeng.org/cv")[chanmeng.org/cv].
    ]
  })
  v(18pt)
  photo("/public/photos/chan-celebrate.jpg", caption: [Auckland — where I rebuilt everything.], w: 78%)
  pagebreak()
}

// ── p3–15: chapter stubs (filled in Tasks 5–8) ───────────────────────────────
// Each stub reserves its slice of the page map so the whole book compiles at the
// full 16 pages from Task 4 onward: opener + placeholder, then blank reserved
// pages via `pages` strong pagebreaks (Tasks 5–8 replace the blanks with copy).
#let x-stub(number, title, desc, pages) = {
  chapter-opener(number, title, kicker: none)
  img-placeholder("IMG-STUB", desc, ratio: "landscape")
  for _ in range(pages) { pagebreak() }
}
// ── pp3–4: Chapter 1 — My Story ──────────────────────────────────────────────
// Fixed factual arc (do not alter): geography degree → maths teacher at private
// tutoring institutions → the 双减 regulation ended that industry → moved to NZ
// at 30, Master of Applied Computing at Lincoln (Distinction) → built alongside
// AI throughout the degree (origin of today's agent-directing practice) →
// Engram's founder asked Claude to surface an engineer and it recommended Chan
// (publicly confirmed by Luka Madzarac). Red lines: no family-of-origin content,
// no third-party names beyond the publicly-confirmed founder, leaving-China
// framed only as "a place where I could breathe freely." Name-change story lives
// in the Minimalist chapter, not here.
#let x-story() = {
  chapter-opener("1", "My Story",
    kicker: [I started with maps, taught maths, watched an industry vanish, and at thirty crossed the world to begin again.])
  block(above: 0pt, below: 14pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-body-x, fill: ink)[
      My degree was in geography; my first real job was teaching maths to teenagers in China. Then, almost overnight, the private-tutoring industry I worked in was regulated out of existence. At thirty — the age everyone says is too late — I moved to a place where I could breathe freely and rebuild, and read for a Master of Applied Computing at #link("https://www.lincoln.ac.nz/")[Lincoln University], finishing with *Distinction*.
    ]
    v(gap-para-x)
    text(size: size-body-x, fill: ink)[
      I never learned to code the old way. From my first assignment I built alongside AI, pairing with a model the way other students paired with a lab partner. That wasn't a shortcut — it's the origin of how I work now: someone who *directs* coding agents rather than typing every line.
    ]
    v(gap-para-x)
    text(size: size-body-x, fill: ink)[
      The proof came from an unexpected place. An early-stage founder asked his own Claude agent to find him an engineer. It read the open web and recommended me — which the founder, #link("https://engram.media/")[Engram]'s Luka Madzarac, later confirmed in public. I hadn't applied. The work had. Auckland, for its part, met me with more kindness than I expected.
    ]
  })
  pagebreak()
  // p4 — supporting photos + pull-quote + the shows where I've discussed the change.
  // NOTE: the brief's draft placed cv/assets/extended/namechange-hero.jpg in the
  // right cell, but that image reads "I THREW AWAY MY OLD NAME" — the legal
  // name-change story, which the red lines assign to the Minimalist chapter (and
  // MANIFEST.md reserves that file as the pp5–7 chapter hero). Using an
  // img-placeholder here keeps the two-up visual, honours the red line, and
  // leaves the Minimalist hero for its own chapter. IMG-01 → shot list.
  grid(
    columns: (1fr, 1fr),
    column-gutter: gap-photo-x,
    photo("/public/photos/chanmeng-portrait-2026.jpg", caption: [Auckland, 2026.]),
    img-placeholder("IMG-01", "Arriving in Auckland at thirty — beginning again", ratio: "portrait"),
  )
  v(14pt)
  pull-quote(
    [When execution gets cheap, the work that matters is choosing what to build — and having the taste to keep only what's worth keeping.])
  v(gap-para-x)
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-body-x, fill: ink)[
      I've talked about changing careers on the two shows I host — #link("https://open.spotify.com/show/0PDYYnZhKwV7PdWHeK7nbj")[Decoding the Future] and #link("https://open.spotify.com/show/201m2sZ5VNAEGKRBzf2ZZ4")[Future Turing].
    ]
  })
  pagebreak()
}
// ── pp5–7: Chapter 2 — A Minimalist ──────────────────────────────────────────
// Subtraction as daily practice → engineering philosophy. p5 life photos, p6
// three external media features (verbatim URLs) + name-change caption, p7
// bridge-to-craft + min-desk + pull-quote. Red lines: name-change framed ONLY
// as forward-looking self-remaking, sourced to the blog; NO family-of-origin
// detail; no radical-expression references; no pricing. The girl-on-mattress
// and kan-kein-sight covers are the outlets' own brand-marks (最人物 / NetEase
// 看客), used as recognizable media-feature marks; p658073376.webp is a real
// minimalist-home photo (verified on render).
#let x-minimalist() = {
  chapter-opener("2", "A Minimalist",
    kicker: [Subtraction as a daily practice — and, it turns out, as an engineering philosophy.])
  block(above: 0pt, below: 14pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-body-x, fill: ink)[
      It began with a broken charging cable and a bent hairpin. I threw them out, felt lighter, and kept going. Today everything I own fits into one backpack and one suitcase. I don't keep a living room — I borrow the city's.
    ]
  })
  photo-grid((
    ("/cv/assets/extended/min-empty-room.jpg", [One room, almost empty.]),
    ("/cv/assets/extended/min-foam-mat.jpg", [A foam mat instead of a bed.]),
  ))
  v(gap-photo-x)
  photo-grid((
    ("/cv/assets/extended/min-one-bag.jpg", [Everything I own — one backpack, one suitcase.]),
    ("/cv/assets/extended/min-city-livingroom.jpg", [The city is my living room.]),
  ))
  pagebreak()
  // p6 — three media cards
  block(above: 0pt, below: 12pt, text(size: size-body-x, fill: muted, style: "italic")[
    People read along. A few pieces travelled far:])
  grid(columns: (1fr, 1fr, 1fr), column-gutter: 14pt,
    article-card("/public/articles/girl-on-mattress.jpg", "Girl on Mattress",
      "100k+ reads · 3,864 reshares", "https://mp.weixin.qq.com/s/hRh8rTF9gjdpI8KEixuSFQ"),
    article-card("/public/articles/p658073376.webp", "A Glimpse of My Minimalist Home",
      "100k+ reads · 14k reshares", "https://mp.weixin.qq.com/s/eZx_Mo5F6BRfVNVceQCS8Q"),
    article-card("/public/articles/kan-kein-sight.jpg", "I Threw Away My Old Name",
      "29k+ reads", "https://chanmeng.org/blog/threw-away-my-old-name"),
  )
  v(10pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-tiny-x, fill: muted, style: "italic")[
      At thirty I legally changed my name and remade who I am. I wrote about it #link("https://chanmeng.org/blog/threw-away-my-old-name")[on the blog].
    ]
  })
  pagebreak()
  // p7 — bridge to craft + pull-quote
  block(above: 0pt, below: 14pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-body-x, fill: ink)[
      It's the same instinct in my software: *stripping away what isn't needed so the essential works better* — whether that's a living space or a system. It shows up as calm dashboards, as anti-bloat discipline (my #link("https://github.com/CopilotKit/CopilotKit")[CopilotKit] contribution cut a flow from eight paths down to three), and as #link("https://github.com/ChanMeng666/chan-meng-cli")[npx chan-meng] — a whole introduction in one command.
    ]
  })
  photo("/cv/assets/extended/min-desk.jpg", caption: [One desk, one machine, everything version-controlled.], w: 70%)
  v(16pt)
  pull-quote(
    [Living alone, I finally learned to confirm my own existence through my own eyes — my own perspective, my own taste.])
  pagebreak()
}
// ── pp8–11: Chapter 3 — What I Build, and Who For ────────────────────────────
// The book's largest chapter: one product per line = one human-stakes sentence
// + one plain-language technical line + a live link you can open. Page map is
// DETERMINISTIC (4 explicit pagebreaks → exactly pp8–11): p8 opener + framing,
// p9 "for the community", p10 "work with taste", p11 "the fun side". URLs are
// all verified against data/profile/2*-projects*.yaml (see task-7-report.md).
// Red lines held: no pricing/cost framings; no commit-count/solo-% dev-stat
// bragging in prose (product feature counts like "355 templates" are fine).
#let x-build() = {
  chapter-opener("3", "What I Build, and Who For",
    kicker: [The largest chapter — because the work is the argument. Every name below is a link you can open.])
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-body-x, fill: ink)[
      I build in three registers: for communities that need the tool, for the plain pleasure of craft, and for the fun of chasing an idea past the point of sense. Here is one line from each — a person or a place it was built for, and how it works underneath.
    ]
  })
  pagebreak()
  // p9 — Group A: for the community
  block(above: 0pt, below: 8pt, text(size: size-meta-x, weight: "bold", fill: accent, tracking: 0.08em)[FOR THE COMMUNITY])
  photo-grid((
    ("/cv/assets/thumbs/tam-ai-ti.jpg", none),
    ("/public/brands/femtracker.svg", none),
  ))
  v(10pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-body-x, fill: ink)[
      *#link("https://tamaiti.whiri-ai.com/")[Tam-AI-Ti]* is a te-ao-Māori financial-wellness coach that talks with you in two languages, built for a 19-person, four-month research cohort — a retrieval-augmented agent grounded in Māori values. #link("https://github.com/ChanMeng666/femtracker-agent")[*FemTracker*] takes on period poverty; its eight-node reasoning agent was solid enough to merge into #link("https://github.com/CopilotKit/CopilotKit")[CopilotKit]'s official demos. #link("https://www.shesharp.org.nz/")[*She Sharp*] and #link("https://herwaka.shesharp.org.nz/")[*Her Waka*] carry the site and workshop platform for New Zealand's leading women-in-STEM charity.
    ]
  })
  pagebreak()
  // p10 — Group B: work with taste (design systems / brand / craft)
  block(above: 0pt, below: 8pt, text(size: size-meta-x, weight: "bold", fill: accent, tracking: 0.08em)[WORK WITH TASTE])
  photo-grid((
    ("/cv/assets/thumbs/eatropolis.jpg", none),
    ("/public/brands/gradient-svg-generator-logo.svg", none),
  ))
  v(10pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-body-x, fill: ink)[
      *Caldera* is the design system behind this very document — its tokens, type, motion, and the risograph halftone you see on every chapter mark. #link("https://eatropolis.co.nz/")[*Eatropolis*] is the festival site I built on commission for Chow Luck Club Ltd, with Tātaki Auckland Unlimited (Auckland Council) as event partner. #link("https://gradient-svg-generator.vercel.app/")[*gradient-svg-generator*] turns a phrase into an animated SVG banner — 355 templates rendered as live XML, used across my own READMEs.
    ]
  })
  pagebreak()
  // p11 — Group C: the fun side
  block(above: 0pt, below: 8pt, text(size: size-meta-x, weight: "bold", fill: accent, tracking: 0.08em)[THE FUN SIDE])
  photo-grid((
    ("/public/brands/chinese-redefine-v2.svg", none),
    ("/public/brands/tower-defense-logo.svg", none),
  ))
  v(10pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-body-x, fill: ink)[
      Not everything has to be serious. My *#link("https://chinese-redefine.chanmeng-dev.workers.dev/")[Chinese & English Redefine]* apps reframe everyday words into something funnier and truer, then export the take as a shareable card. And *#link("https://towerdefense.chanmeng.org/")[Te Pā Tiaki]*, a Māori-myth tower defence, is exactly what it sounds like — a 3D game rendered in pure CSS transforms, no game engine at all, just to see how far that could go.
    ]
  })
  pagebreak()
}

// ── p12: Chapter 4 — Teaching ────────────────────────────────────────────────
// EXACTLY one page (single trailing pagebreak). Manifesto line big, a short
// method paragraph, the banana-workshop photo pair, the capstone strip, and a
// REAL attributed student quote (verbatim from data/profile/50-references.yaml,
// Jessie Wan). CAPTION TRUTH RULE: teach-banana-*.jpg show the "AI & Electronics
// Workshop" (presenters on stage / audience from behind), NOT a banana piano —
// captions describe the workshop scene; the banana-piano is prose-only.
#let x-teaching() = {
  chapter-opener("4", "Teaching",
    kicker: [Three years, five cohorts. My whole method in one line.])
  block(above: 0pt, below: 12pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: 16pt, style: "italic", fill: primary)["Natural language is the source code."]
  })
  block(above: 0pt, below: 12pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-body-x, fill: ink)[
      Students arrive knowing only browser ChatGPT. Weeks later they have shipped a live, multi-user AI product by directing coding agents — the same way I work. I have run this five times since 2024, most recently for #link("https://www.technestcommunity.com/")[TechNest] and at a #link("https://programming.chanmeng.org/")[hands-on workshop] where a banana piano taught younger students that code can be playful.
    ]
  })
  // Fixed-height, fit:"contain" pair (cream gutters) rather than photo-grid: the
  // two workshop frames have mismatched aspect ratios (one portrait, one
  // landscape) and a width-scaled portrait blew the page past p12. contain (not
  // cover) shows each frame whole — no crop — so the captions stay truthful to
  // what is actually visible (CAPTION TRUTH RULE, MANIFEST.md L47–57).
  grid(columns: (1fr, 1fr), column-gutter: gap-photo-x,
    ..(
      ("/cv/assets/extended/teach-banana-1.jpg", [AI & Electronics Workshop — the lineup on stage.]),
      ("/cv/assets/extended/teach-banana-2.jpg", [Presenting from the front of the room.]),
    ).map(it => block(above: 0pt, below: 0pt, breakable: false, {
      box(width: 100%, height: 150pt, radius: radius-photo-x, clip: true, fill: pill-bg,
        stroke: frame-photo-x + rule.lighten(25%),
        image(it.at(0), width: 100%, height: 100%, fit: "contain"))
      v(5pt)
      text(size: size-tiny-x, fill: muted, style: "italic", it.at(1))
    }))
  )
  v(gap-photo-x)
  photo-grid((
    ("/cv/assets/extended/cap-joborg.jpg", [Student capstone — JobOrg.]),
    ("/cv/assets/extended/cap-icare.jpg", [Student capstone — iCare.]),
    ("/cv/assets/extended/cap-credithero.jpg", [Student capstone — CreditHero.]),
  ), cols: 3)
  v(12pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-tiny-x, fill: muted, style: "italic")[
      "Chan's teaching style is meticulous and thorough, with patient and in-depth explanations for the use of each tool." — Jessie Wan, course student.
    ]
  })
  pagebreak()
}
// ── pp13–14: Chapter 5 — Voices ──────────────────────────────────────────────
// ALL 24 recommenders appear (avatar wall = exactly 24, incl. historical-archive
// Daryll Hall — controller ruling). Extensions are the ON-DISK truth, not the
// brief draft: Gabby/Mi Su/Shushu/Patricia are .jpeg (not .jpg), and Amy-Li's
// avatar is the repo-local rec-amy-li.png — public/recommendations/Amy-Li.jpg is
// PNG bytes behind a .jpg name, which Typst decodes by extension and FAILS on;
// the shared asset is left untouched, a correctly-named copy lives beside this
// book (cv/assets/extended/rec-amy-li.png). Order mirrors 50-references.yaml.
#let voices-people = (
  ("/public/recommendations/Ikenna-Anasieze.png", "Ikenna"),
  ("/public/recommendations/Swayam-Dhir.jpg", "Swayam"),
  ("/public/recommendations/Mahdieh-Najmi.jpg", "Mahdieh"),
  ("/public/recommendations/Shivani-Dhandabani.jpg", "Shivani"),
  ("/public/recommendations/Prasanth-Pavithran.jpg", "Prasanth"),
  ("/public/recommendations/Lesley-Gao.jpg", "Lesley"),
  ("/public/recommendations/Saba-Gecgil.png", "Saba"),
  ("/public/recommendations/Nirmala-Chinnappan.jpg", "Nirmala"),
  ("/public/recommendations/Yesha-Kaniyawala.jpg", "Yesha"),
  ("/public/recommendations/Siyu-Xing.jpg", "Siyu"),
  ("/public/recommendations/Cecilia-Yin.jpg", "Cecilia"),
  ("/cv/assets/extended/rec-amy-li.png", "Amy"),
  ("/public/recommendations/Omopeju-Afanu.jpg", "Paige"),
  ("/public/recommendations/Gabby-Hurst.jpeg", "Gabby"),
  ("/public/recommendations/Chaste-Christopher-Inegbedion.jpg", "Chaste"),
  ("/public/recommendations/Mi-Su.jpeg", "Mi Su"),
  ("/public/recommendations/Shushu-Qin.jpeg", "Shushu"),
  ("/public/recommendations/Patricia-Anthony.jpeg", "Patricia"),
  ("/public/recommendations/Robin-Lee.jpeg", "Robin"),
  ("/public/recommendations/Shiyu-Fang.jpeg", "Shiyu"),
  ("/public/recommendations/Jixuan-Jessie-Wan.jpeg", "Jessie"),
  ("/public/recommendations/Di-Peng.jpeg", "Di"),
  ("/public/recommendations/Qiao-Jun.jpeg", "Qiao Jun"),
  ("/public/recommendations/Daryll-Hall.jpeg", "Daryll"),
)
#let x-voices() = {
  chapter-opener("5", "Voices",
    kicker: [Twenty-four people who've worked with me — every one of them, in their own words.])
  avatar-wall(voices-people, cols: 8)
  pagebreak()
  // p14 — two featured quotes. Both are exact verbatim substrings of the
  // corresponding entries in data/profile/50-references.yaml, joined by ellipses
  // where interior sentences are omitted; the source casing ("she"/"what") is
  // preserved and a leading ellipsis marks the pulled-from-mid-paragraph excerpt
  // (controller ruling: quotes must be VERBATIM substrings).
  pull-quote(
    [… she often goes out of her way to build things that genuinely help others learn … To me, that is what true empowerment looks like.],
    attribution: [Lesley Gao · She Sharp website team])
  pull-quote(
    [… what I witnessed at the hackathon was something that doesn't show up on a resume: her instinct to mentor … she's the kind of person who genuinely raises the bar for everyone around her.],
    attribution: [Shivani Dhandabani · AI hackathon])
  v(10pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-tiny-x, fill: muted, style: "italic")[
      All 24 recommendations in full: #link("https://www.linkedin.com/in/chanmeng666/")[linkedin.com/in/chanmeng666].
    ]
  })
  pagebreak()
}

// ── p15: Chapter 6 — Recognition ─────────────────────────────────────────────
// One page. UN CSW69 photo + awards/podcasts. Award titles/dates verified
// against data/profile/30-recognition.yaml; podcast + spotify URLs against
// data/profile/00-basics.yaml. No pricing framing; the only named third parties
// are a company (IBM) and a government minister by title — both from the
// canonical UN CSW69 award summary, no private individuals.
#let x-recognition() = {
  chapter-opener("6", "Recognition",
    kicker: [Where the work has been seen.])
  photo("/public/articles/un-women-csw69.jpeg", caption: [Speaking at UN CSW69, UN HQ New York — March 2025.], w: 82%)
  v(16pt)
  block(above: 0pt, below: 0pt, {
    set text(size: size-body-x, fill: ink)
    set par(leading: leading-body-x, justify: false)
    set list(marker: text(fill: accent, size: 6pt)[•], indent: 0pt, body-indent: 8pt, spacing: 11pt)
    list(
      [*UN CSW69 Speaker* — UN HQ, New York, March 2025 · drew IBM pilot interest and an endorsement from Sierra Leone's Minister of Gender and Children's Affairs.],
      [*Outstanding Mentor Award* — AI Hackathon Festival 2025 · 1 of 14 expert mentors, guiding 11 teams / 80+ participants.],
      [*UN Women FemTech Hackathon — Outstanding Performer* — FemTech Weekend, Beijing, March 2025.],
      [*Excellence Award* — FemTech China, Women's Health Technology Challenge, December 2024.],
      [Guest on three podcasts — #link("https://open.spotify.com/show/0PDYYnZhKwV7PdWHeK7nbj")[Decoding the Future], #link("https://open.spotify.com/show/201m2sZ5VNAEGKRBzf2ZZ4")[Future Turing], and #link("https://open.spotify.com/show/03tRh6SNm92ut5zpMmR0LL")[Praxis and Pages].],
    )
  })
  pagebreak()
}

// ── p16: back cover (centered, non-bleed — keeps Task 4 geometry) ────────────
#let x-backcover() = {
  set page(footer: none)
  v(1fr)
  align(center, image("/public/brands/chan-meng-monkey-black-transparent.svg", width: 90pt))
  v(20pt)
  align(center, block(width: 13cm, {
    set par(leading: leading-lead-x, justify: false)
    text(size: 11pt, fill: ink, weight: "bold")[Where to find me]
    v(8pt)
    text(size: 10pt, fill: ink)[
      #link("https://chanmeng.org/")[chanmeng.org] · #link("https://chanmeng.org/blog")[chanmeng.org/blog] · #link("https://chanmeng.org/#newsletter")[Newsletter] · #link("https://www.linkedin.com/in/chanmeng666/")[linkedin.com/in/chanmeng666] · #link("https://github.com/ChanMeng666")[github.com/ChanMeng666] · #link("https://www.youtube.com/@ChanMeng666")[youtube.com/\@ChanMeng666] · #link("https://cal.com/chan-meng/30min")[cal.com/chan-meng/30min]
    ]
  }))
  v(1fr)
}
