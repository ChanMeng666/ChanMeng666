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
  // Opening note: the copy sits in the upper third and an enlarged full-width
  // photo band anchors the rest, so the page reads composed rather than empty
  // (the old version left big symmetric margins around a short landscape photo).
  // Copy is verbatim.
  v(0.7fr)
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
  v(34pt)
  // Caption corrected 2026-07-26: this frame is Chan on a boat at sea (the same
  // Cebu trip as the p1 cover), not Auckland — the old "Auckland — where I
  // rebuilt everything" line described a place the photo does not show. Captions
  // describe what is actually visible (MANIFEST.md caption-truth rule).
  //
  // Shows the WHOLE frame (Chan's ruling, wave 4). This used to run
  // public/photos/chan-celebrate.jpg through a 322pt cover-crop band — but that
  // shared file is itself a 1920×560 media-kit letterbox (media-kit/README.md
  // calls it "a kit-only crop"), so the book only ever showed Chan from the
  // fingertips to the chest. Switching the Typst fit alone could not have
  // recovered the rest; the frame had to be rebuilt from the 6000×4000 original.
  // open-cebu-boat.jpg is that full 3∶2 frame — she is sitting cross-legged on
  // the outrigger — drawn at natural aspect (no crop, no letterbox) by photo().
  // At 487.56pt of content width it stands 325pt tall, within 3pt of the band it
  // replaces, so the page balance carries over unchanged. The media kit keeps
  // its own crop untouched.
  photo("/cv/assets/extended/open-cebu-boat.jpg",
    caption: [Arms up, out on the water — the spirit I'd like this read in.])
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
  // Anchor p3's foot with a real Auckland photo (fills what was a dead lower
  // half) — a She Sharp panel, tying the "Auckland met me with kindness" close to
  // the community that took me in. Location pin on the caption (D3).
  v(1fr)
  photo-band("/public/photos/chan-panel-shesharp-gesturing.jpg", h: 232pt,
    caption: [#icon("map-pin", size: 8pt) #h(1pt) On a She Sharp panel in Auckland — the community that took me in.])
  pagebreak()
  // p4 — the arrival spread, rebuilt 2026-07-26 into a real timeline from Chan's
  // own photo library. It previously ran on chanmeng-portrait-2026.jpg, which is
  // a tight crop of the SAME boat frame the p2 band uses (chan-celebrate.jpg) —
  // one photo appearing twice — under the caption "Auckland, 2026", a place that
  // frame does not show. Both problems are gone: the Lincoln campus shot carries
  // the page, and a before/after row grounds the crossing. Anchor facts, all
  // from data/profile/10-career.yaml: the Lincoln Master of Applied Computing
  // starts 2023-11 (the photo's own burned-in date stamp reads 2023/11/16);
  // CORDE is the Lincoln COMP693 industry placement, Canterbury, 2024-06→2024-11;
  // Nanning is where Chan went to school (education: nanning-no2, Guangxi).
  v(0.3fr)
  photo-band("/cv/assets/extended/story-lincoln.jpg", h: 245pt,
    caption: [Lincoln University, Canterbury — November 2023, my first weeks in the programme.])
  v(0.45fr)
  photo-row((
    ("/cv/assets/extended/story-nanning.jpg", [Before: a night street in Nanning, Guangxi — the Chinese city I went to school in.]),
    ("/cv/assets/extended/story-corde.jpg", [After: on site at CORDE in Canterbury — the infrastructure firm my Lincoln industry placement shipped into, 2024.]),
  ), h: 215pt)
  v(0.6fr)
  pull-quote(
    [When execution gets cheap, the work that matters is choosing what to build — and having the taste to keep only what's worth keeping.])
  v(0.5fr)
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
// detail; no radical-expression references; no pricing. As of 2026-07-26 all
// three p6 covers are the outlets' own brand-marks — 最人物 / Douban / NetEase
// 看客 — used as recognizable media-feature marks.
#let x-minimalist() = {
  chapter-opener("2", "A Minimalist",
    kicker: [Subtraction as a daily practice — and, it turns out, as an engineering philosophy.])
  block(above: 0pt, below: 14pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-body-x, fill: ink)[
      It began with a broken charging cable and a bent hairpin. I threw them out, felt lighter, and kept going. Today everything I own fits into one backpack and one suitcase. I don't keep a living room — I borrow the city's.
    ]
  })
  // Top-right is Chan's own wide frame of the flat, supplied 2026-07-26 and
  // placed at her explicit direction: she picked it to show the room "corner to
  // corner, no dead angles" — front door, bathroom, bare walls and floor in one
  // shot. It is the establishing frame the three detail frames around it belong
  // to. It replaces min-foam-mat, which was retired in the same pass as the
  // book's tightest near-twin (same room, same window wall, same balcony door as
  // min-empty-room beside it). Cropped to 1.3375 so the row-mate's 1.3383 lines
  // up exactly — see MANIFEST.md for the crop and the watermark ruling.
  photo-grid((
    ("/cv/assets/extended/min-empty-room.jpg", [One room, almost empty.]),
    ("/cv/assets/extended/min-room-panorama.jpg", [The whole room in one frame — front door, bathroom, bare walls.]),
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
  // The three features run as full-width rows rather than a 3-across grid
  // (2026-07-26). Two changes drove it. Chan retired min-suitcase.jpg — the frame
  // that used to anchor this page's foot showed a room with a full double bed, a
  // transitional state, not the fully-realised minimalism the chapter claims —
  // which freed ~330pt. And at 3-across each column was only ~153pt wide, where
  // two of the three titles wrapped to two lines, both WeChat URLs broke
  // mid-string, and the stat lines fell out of alignment across the row because
  // the one- and two-line titles pushed them to different heights. Stacking the
  // same three cards full-width fixes the typography and fills the page, with no
  // new prose and no decorative filler. Content and links are unchanged.
  v(0.3fr)
  article-row("/public/articles/girl-on-mattress.jpg", "Girl on Mattress",
    "100k+ reads · 3,864 reshares", "https://mp.weixin.qq.com/s/hRh8rTF9gjdpI8KEixuSFQ")
  v(0.34fr)
  article-row("/cv/assets/extended/douban-logo.svg", "A Glimpse of My Minimalist Home",
    "100k+ reads · 14k reshares", "https://mp.weixin.qq.com/s/eZx_Mo5F6BRfVNVceQCS8Q")
  v(0.34fr)
  article-row("/public/articles/kan-kein-sight.jpg", "I Threw Away My Old Name",
    "29k+ reads", "https://chanmeng.org/blog/threw-away-my-old-name")
  v(0.4fr)
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-tiny-x, fill: muted, style: "italic")[
      At thirty I legally changed my name and remade who I am. I wrote about it #link("https://chanmeng.org/blog/threw-away-my-old-name")[on the blog].
    ]
  })
  v(0.25fr)
  pagebreak()
  // p7 — bridge to craft: text, an enlarged full-width desk photo, and the
  // closing pull-quote distributed low so the page fills top to bottom.
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-body-x, fill: ink)[
      It's the same instinct in my software: *stripping away what isn't needed so the essential works better* — whether that's a living space or a system. It shows up as calm dashboards, as anti-bloat discipline (my #link("https://github.com/CopilotKit/CopilotKit")[CopilotKit] contribution cut a flow from eight paths down to three), and as #link("https://github.com/ChanMeng666/chan-meng-cli")[npx chan-meng] — a whole introduction in one command.
    ]
  })
  v(0.5fr)
  photo-band("/cv/assets/extended/min-desk.jpg", h: 300pt,
    caption: [Nothing on the floor that doesn't earn its place — the same rule I bring to a codebase.])
  v(0.65fr)
  pull-quote(
    [Living alone, I finally learned to confirm my own existence through my own eyes — my own perspective, my own taste.])
  v(0.4fr)
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
  // Page map (deterministic, 4 pagebreaks → pp8–11), rebalanced 2026-07-24 so no
  // page is airy: opener MERGES onto p8 above the flagship, then 1/2/2/1+quote —
  // p8 opener + ArchCanvas (feature), p9 ArchLang + Vitex, p10 echook + Google
  // News MCP, p11 gradient-svg-generator (feature) + a closing pull-quote. Six
  // products, same order; product cards are full-width and large so each page
  // fills top to bottom.
  chapter-opener("3", "What I Build",
    kicker: [The largest chapter — because the work is the argument. Six products I designed and shipped; every name is a link you can open.])
  block(above: 0pt, below: 30pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-body-x, fill: ink)[
      These are the products I keep coming back to — the ones that show what I care about when I build: precise artifacts over pretty pictures, tools you operate in plain language, and systems small enough to hold in your head. Each one below I designed and shipped end to end.
    ]
  })
  product-tile("/public/brands/archcanvas-logo.svg", [ArchCanvas],
    [An AI design agent for architects and self-builders: describe a building and it draws a dimensioned floor plan you can actually build from, plus a realistic rendering.],
    [Refine it by talking, on an infinite zoomable canvas; every plan is real ArchLang underneath, exportable as a full git history.],
    "https://archcanvas.uk/", "archcanvas.uk", logo-h: 315pt)
  v(1fr)
  pagebreak()
  // p9 — ArchLang (the engine under ArchCanvas) + Vitex
  v(1fr)
  product-tile("/public/brands/archlang-logo.svg", [ArchLang],
    [A small language for floor plans: write walls and rooms in plain text, get back a precise dimensioned drawing, change one number and exactly one thing moves.],
    [A zero-dependency TypeScript compiler exporting SVG, DXF, PDF, and PNG — and it checks whether a plan is actually livable. The engine behind ArchCanvas.],
    "https://playground.archlang.uk", "playground.archlang.uk")
  v(1fr)
  product-tile("/public/brands/vitex.svg", [Vitex — AI Career Agent],
    [Paste a job ad and describe your background, and Vitex writes a resume and cover letter tailored to that job as an ATS-ready PDF in about thirty seconds.],
    [Reachable over the web, a public API, a command-line tool, and an MCP server — so an AI assistant can drive the whole product without a browser.],
    "https://www.vitex.org.nz/", "vitex.org.nz")
  v(1fr)
  pagebreak()
  // p10 — echook (dev-tooling plugin) + Google News MCP (ecosystem server)
  v(1fr)
  product-tile("/public/brands/echook-logo.svg", [echook],
    [An audio-and-status plugin for Claude Code, Cursor, and Codex — you never learn it; you just tell your AI agent "install echook" or "snooze for 30 minutes."],
    [Pure Python standard library, 37 hook events and a context-window status bar, tested on Windows, macOS, and Linux. Open source under MIT.],
    "https://github.com/ChanMeng666/echook", "github.com/ChanMeng666/echook")
  v(1fr)
  product-tile("/public/brands/server-google-news.svg", [Google News MCP Server],
    [One of the earliest servers for the Model Context Protocol — the open standard Anthropic launched in late 2024 — and this one shipped just five weeks later.],
    [It lets Claude, Cursor, and Cline search live Google News by topic in ten languages; published on npm and carried across 15+ MCP catalogs, a PulseMCP "Top Pick."],
    "https://github.com/ChanMeng666/server-google-news", "github.com/ChanMeng666/server-google-news")
  v(1fr)
  pagebreak()
  // p11 — gradient-svg-generator (feature) + the chapter's closing pull-quote
  v(0.5fr)
  product-tile("/public/brands/gradient-svg-generator-logo.svg", [gradient-svg-generator],
    [Paste a URL into any Markdown file and your README grows an animated gradient banner that renders live in the browser — no image files, no build step.],
    [355 parametric templates streamed as live SVG XML from a serverless function, using SMIL animation, CSS keyframes, and SVG filters.],
    "https://gradient-svg-generator.vercel.app/", "gradient-svg-generator.vercel.app", logo-h: 300pt)
  v(0.85fr)
  pull-quote(
    [Precise artifacts over pretty pictures. Every one of these you can open, run, and read the source of — that's the whole argument.])
  v(0.5fr)
  pagebreak()
}

// ── p12: Chapter 4 — Teaching ────────────────────────────────────────────────
// EXACTLY one page (single trailing pagebreak). Manifesto line big, a short
// method paragraph, the enlarged banana-workshop photo pair, and a REAL
// attributed student quote (verbatim from data/profile/50-references.yaml,
// Jessie Wan). The three student-capstone screenshots were removed 2026-07-24 —
// student projects read as less professional and could be mistaken for Chan's
// own work; the two workshop photos were enlarged to rebalance the page.
// CAPTION TRUTH RULE: no frame on this page shows a banana piano — the
// banana-piano stays prose-only, and each caption names only the event it
// actually depicts. The mentee-range sentence is bounded by the data: the
// Peyvand workshop is logged for 12–18-year-olds (80-events.yaml
// peyvand-academy-makey-makey-2026), the hackathon's named school cohort is
// Westlake Girls High (30-recognition.yaml), and the adult end is TechNest /
// Her Waka. NOTHING in the data supports "primary schoolers" or "university
// students" — do not reach for either.
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
      Students arrive knowing only browser ChatGPT. Weeks later they have shipped a live, multi-user AI product by directing coding agents — the same way I work. I have run this five times since 2024, most recently for #link("https://www.technestcommunity.com/")[TechNest] and at a #link("https://programming.chanmeng.org/")[hands-on workshop] where a banana piano taught younger students that code can be playful. They range from twelve-year-olds at that workshop, through high-school students I mentored at an AI hackathon, to adults retraining for a new career — the method holds; only the pace changes.
    ]
  })
  // Fixed-height, fit:"contain" row (cream gutters) rather than photo-grid: a
  // width-scaled portrait blew the page past p12, and contain (not cover) shows
  // each frame whole — no crop — so the captions stay truthful to what is
  // actually visible (CAPTION TRUTH RULE, MANIFEST.md).
  //
  // Both frames show Chan at work with students, and together they carry the
  // page's range claim: teenagers at the She Sharp × Peyvand workshop on the
  // right, high-school students at the AI Hackathon Festival on the left.
  //
  // The left frame is Chan's own, supplied 2026-07-26 and placed at her explicit
  // direction (MANIFEST.md records the minors ruling). It replaces
  // teach-banana-1, the stage-lineup frame, in which Chan stood in a row of
  // presenters doing nothing the chapter is about; this one shows her doing the
  // work — at the laptop beside the screen, Gemini CLI up, students around the
  // table. teach-banana-2 went in the previous wave for a false caption.
  //
  // The row mixes a 1.3308 landscape with a 0.75 portrait, so the columns carry
  // fr weights EQUAL to those ratios and h is set to the height at which both
  // boxes are exactly their image's shape: (487.56 − 14) ÷ (1.3308 + 0.75) =
  // 227.6pt. Every edge meets the frame; no cream letterbox anywhere.
  v(0.55fr)
  photo-row((
    ("/cv/assets/extended/teach-westlake-hackathon.jpg", [AI Hackathon Festival 2025 at AUT — walking Westlake Girls High School students through AI coding tools.]),
    ("/cv/assets/extended/teach-kids-laptop.jpg", [A She Sharp workshop for teens — a browser game on the laptop, the room crowded in.]),
  ), h: 227.5pt, cols: (1.3308fr, 0.75fr))
  v(0.75fr)
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
  // Enlarged 6-across wall (24 = 6×4), centered below the opener so it fills the
  // page rather than sitting as a small band at the top.
  v(1fr)
  avatar-wall(voices-people, cols: 6, size: 66pt, row-gutter: 26pt, col-gutter: 12pt, cap-size: 9pt)
  v(1fr)
  pagebreak()
  // p14 — two featured quotes, each with the speaker's avatar in the byline and
  // distributed down the page. Both are exact verbatim substrings of the
  // corresponding entries in data/profile/50-references.yaml, joined by ellipses
  // where interior sentences are omitted; the source casing ("she"/"what") is
  // preserved and a leading ellipsis marks the pulled-from-mid-paragraph excerpt
  // (controller ruling: quotes must be VERBATIM substrings).
  v(1fr)
  voice-feature("/public/recommendations/Lesley-Gao.jpg",
    [… she often goes out of her way to build things that genuinely help others learn … To me, that is what true empowerment looks like.],
    [Lesley Gao · She Sharp website team])
  v(1fr)
  voice-feature("/public/recommendations/Shivani-Dhandabani.jpg",
    [… what I witnessed at the hackathon was something that doesn't show up on a resume: her instinct to mentor … she's the kind of person who genuinely raises the bar for everyone around her.],
    [Shivani Dhandabani · AI hackathon])
  v(1fr)
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-tiny-x, fill: muted, style: "italic")[
      All 24 recommendations in full: #link("https://www.linkedin.com/in/chanmeng666/")[linkedin.com/in/chanmeng666].
    ]
  })
  v(0.4fr)
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
  // Two-up recognition band (was one photo + a blank lower third): the UN CSW69
  // frame beside the AI Hackathon Festival stage — the latter illustrates the
  // Outstanding Mentor Award bullet below. Fixed-height cover crops align.
  v(0.5fr)
  grid(columns: (1fr, 1fr), column-gutter: gap-photo-x,
    photo-band("/public/articles/un-women-csw69.jpeg", h: 190pt,
      caption: [Speaking at UN CSW69, UN HQ New York — March 2025.]),
    photo-band("/public/photos/chan-keynote-ai-hackathon-2025.jpg", h: 190pt,
      caption: [Presenting at the AI Hackathon Festival 2025, Auckland.]),
  )
  v(0.5fr)
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
  v(0.5fr)
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
