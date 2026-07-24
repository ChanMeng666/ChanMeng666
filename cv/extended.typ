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
  // Vertically centred composition: 1fr spacers top and bottom balance the page
  // so there is no dead bottom, and the photo runs full column width (was 78%,
  // which left the lower ~60% of the page blank). Copy is verbatim.
  v(1fr)
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
  v(30pt)
  photo("/public/photos/chan-celebrate.jpg", caption: [Auckland — where I rebuilt everything.], w: 100%)
  v(1fr)
  pagebreak()
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
  // Balance the space freed when the podcast line was removed (2026-07-24):
  // centre the closing pull-quote in the area below the photos rather than
  // leaving a large dead band at the page foot.
  v(1fr)
  pull-quote(
    [When execution gets cheap, the work that matters is choosing what to build — and having the taste to keep only what's worth keeping.])
  v(1fr)
  pagebreak()
}
// ── pp5–7: Chapter 2 — A Minimalist ──────────────────────────────────────────
// Subtraction as daily practice → engineering philosophy. p5 life photos, p6
// three external media features (verbatim URLs) + name-change caption, p7
// bridge-to-craft + min-desk + pull-quote. 2026-07-24: min-* room photos
// reselected to show ONLY the fully-realized minimalist state (near-empty rooms
// from the LATE end of the chronological blog set); min-one-bag/-city-livingroom/
// -desk swapped off transitional frames (captions updated to match). Red lines:
// name-change framed ONLY
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
    ("/cv/assets/extended/min-one-bag.jpg", [Everything I own, packed — one backpack and one bundle.]),
    ("/cv/assets/extended/min-city-livingroom.jpg", [A mattress on the floor, the city out the window.]),
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
  photo("/cv/assets/extended/min-desk.jpg", caption: [Nothing on the floor that doesn't earn its place — the same rule I bring to a codebase.], w: 70%)
  v(16pt)
  pull-quote(
    [Living alone, I finally learned to confirm my own existence through my own eyes — my own perspective, my own taste.])
  pagebreak()
}
// ── pp8–11: Chapter 3 — What I Build ─────────────────────────────────────────
// The book's largest chapter, rebuilt 2026-07-24 around Chan's OWN flagship set
// (data/profile/90-meta.yaml flagshipProjectIds: google-news-mcp · echook ·
// archlang · archcanvas · vitex, plus spotlight member gradient-svg-generator).
// Client/community work (Tam-AI-Ti, FemTracker, She Sharp, Eatropolis, redefine,
// tower defence) moved OUT — the chapter is now her products and product taste.
// Page map DETERMINISTIC (4 pagebreaks → exactly pp8–11): p8 opener + framing,
// then 2 products per page pp9–11 via the uniform product-tile (fixed logo box +
// one human line + one plain-technical line + a live link). Copy anchors + URLs
// verified against data/profile/20–23-projects*.yaml (name / publicSummary /
// tagline / url|repoUrl). Red lines held: no pricing; no commit-count/solo-%
// dev-stat bragging in prose (product feature counts like "355 templates" fine).
#let x-build() = {
  chapter-opener("3", "What I Build",
    kicker: [The largest chapter — because the work is the argument. Six products I designed and shipped; every name is a link you can open.])
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-body-x, fill: ink)[
      These are the products I keep coming back to — the ones that show what I care about when I build: precise artifacts over pretty pictures, tools you operate in plain language, and systems small enough to hold in your head. Each one below I designed and shipped end to end.
    ]
  })
  pagebreak()
  // p9 — the architecture pair: the agent + the engine underneath it
  v(1fr)
  product-tile("/public/brands/archcanvas-logo.svg", [ArchCanvas],
    [An AI design agent for architects and self-builders: describe a building and it draws a dimensioned floor plan you can actually build from, plus a realistic rendering.],
    [Refine it by talking, on an infinite zoomable canvas; every plan is real ArchLang underneath, exportable as a full git history.],
    "https://archcanvas.uk/", "archcanvas.uk")
  v(1fr)
  product-tile("/public/brands/archlang-logo.svg", [ArchLang],
    [A small language for floor plans: write walls and rooms in plain text, get back a precise dimensioned drawing, change one number and exactly one thing moves.],
    [A zero-dependency TypeScript compiler exporting SVG, DXF, PDF, and PNG — and it checks whether a plan is actually livable. The engine behind ArchCanvas.],
    "https://playground.archlang.uk", "playground.archlang.uk")
  v(1fr)
  pagebreak()
  // p10 — two agent-ready products: a career agent + a dev-tooling plugin
  v(1fr)
  product-tile("/public/brands/vitex.svg", [Vitex — AI Career Agent],
    [Paste a job ad and describe your background, and Vitex writes a resume and cover letter tailored to that job as an ATS-ready PDF in about thirty seconds.],
    [Reachable over the web, a public API, a command-line tool, and an MCP server — so an AI assistant can drive the whole product without a browser.],
    "https://www.vitex.org.nz/", "vitex.org.nz")
  v(1fr)
  product-tile("/public/brands/echook-logo.svg", [echook],
    [An audio-and-status plugin for Claude Code, Cursor, and Codex — you never learn it; you just tell your AI agent "install echook" or "snooze for 30 minutes."],
    [Pure Python standard library, 37 hook events and a context-window status bar, tested on Windows, macOS, and Linux. Open source under MIT.],
    "https://github.com/ChanMeng666/echook", "github.com/ChanMeng666/echook")
  v(1fr)
  pagebreak()
  // p11 — two open-source ecosystem tools
  v(1fr)
  product-tile("/public/brands/server-google-news.svg", [Google News MCP Server],
    [One of the earliest servers for the Model Context Protocol — the open standard Anthropic launched in late 2024 — and this one shipped just five weeks later.],
    [It lets Claude, Cursor, and Cline search live Google News by topic in ten languages; published on npm and carried across 15+ MCP catalogs, a PulseMCP "Top Pick."],
    "https://github.com/ChanMeng666/server-google-news", "github.com/ChanMeng666/server-google-news")
  v(1fr)
  product-tile("/public/brands/gradient-svg-generator-logo.svg", [gradient-svg-generator],
    [Paste a URL into any Markdown file and your README grows an animated gradient banner that renders live in the browser — no image files, no build step.],
    [355 parametric templates streamed as live SVG XML from a serverless function, using SMIL animation, CSS keyframes, and SVG filters.],
    "https://gradient-svg-generator.vercel.app/", "gradient-svg-generator.vercel.app")
  v(1fr)
  pagebreak()
}

// ── p12: Chapter 4 — Teaching ────────────────────────────────────────────────
// EXACTLY one page (single trailing pagebreak). Manifesto line big, a short
// method paragraph, the enlarged banana-workshop photo pair, and a REAL
// attributed student quote (verbatim from data/profile/50-references.yaml,
// Jessie Wan). The three student-capstone screenshots were removed 2026-07-24 —
// student projects read as less professional and could be mistaken for Chan's
// own work; the two workshop photos were enlarged to rebalance the page.
// CAPTION TRUTH RULE:
// teach-banana-*.jpg show the "AI & Electronics Workshop" (presenters on stage /
// audience from behind), NOT a banana piano — captions describe the workshop
// scene; the banana-piano is prose-only.
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
  // what is actually visible (CAPTION TRUTH RULE, MANIFEST.md). Enlarged to fill
  // the space freed when the student-capstone strip was removed (2026-07-24).
  v(1fr)
  grid(columns: (1fr, 1fr), column-gutter: gap-photo-x,
    ..(
      ("/cv/assets/extended/teach-banana-1.jpg", [AI & Electronics Workshop — the lineup on stage.]),
      ("/cv/assets/extended/teach-banana-2.jpg", [Presenting from the front of the room.]),
    ).map(it => block(above: 0pt, below: 0pt, breakable: false, {
      box(width: 100%, height: 260pt, radius: radius-photo-x, clip: true, fill: pill-bg,
        stroke: frame-photo-x + rule.lighten(25%),
        image(it.at(0), width: 100%, height: 100%, fit: "contain"))
      v(6pt)
      text(size: size-tiny-x, fill: muted, style: "italic", it.at(1))
    }))
  )
  v(1fr)
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
// One page. UN CSW69 photo + awards. Award titles/dates verified against
// data/profile/30-recognition.yaml. No pricing framing; the only named third
// parties are a company (IBM) and a government minister by title — both from the
// canonical UN CSW69 award summary, no private individuals. (The discontinued
// audio-show row was removed 2026-07-24; awards now fill the page.)
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
    )
  })
  pagebreak()
}

// ── p16: back cover (centered, non-bleed — keeps Task 4 geometry) ────────────
#let x-backcover() = {
  set page(footer: none)
  v(1fr)
  align(center, image("/public/brands/chan-meng-monkey-black-transparent.svg", width: 82pt))
  v(28pt)
  align(center, text(font: sans-display, weight: "regular", size: 24pt, fill: primary, tracking: 0.02em)[Where to find me])
  v(10pt)
  // brand two-tone rule, centered under the heading
  align(center, box(width: 120pt, grid(columns: (40pt, 1fr), align: (center + horizon, center + horizon),
    line(stroke: 3pt + accent, length: 100%),
    line(stroke: 0.6pt + rule.lighten(20%), length: 100%))))
  v(30pt)
  backcover-links((
    ("globe",    "https://chanmeng.org/",                 "chanmeng.org"),
    ("feather",  "https://chanmeng.org/blog",             "chanmeng.org/blog"),
    ("mail",     "https://chanmeng.org/#newsletter",      "Newsletter"),
    ("linkedin", "https://www.linkedin.com/in/chanmeng666/", "linkedin.com/in/chanmeng666"),
    ("github",   "https://github.com/ChanMeng666",        "github.com/ChanMeng666"),
    ("youtube",  "https://www.youtube.com/@ChanMeng666",  "youtube.com/@ChanMeng666"),
    ("calendar", "https://cal.com/chan-meng/30min",       "cal.com/chan-meng/30min"),
  ))
  v(1fr)
}
