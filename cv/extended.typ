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
#let x-minimalist() = x-stub("2", "A Minimalist", "minimalist", 3)     // pp5–7
#let x-build() = x-stub("3", "What I Build, and Who For", "build", 4)  // pp8–11
#let x-teaching() = x-stub("4", "Teaching", "teaching", 1)             // p12
#let x-voices() = x-stub("5", "Voices", "voices", 2)                   // pp13–14
#let x-recognition() = x-stub("6", "Recognition", "recognition", 1)    // p15

// ── p16: full-bleed back cover ───────────────────────────────────────────────
#let x-backcover() = {
  set page(footer: none)
  v(1fr)
  align(center, image("/public/brands/chan-meng-monkey-black-transparent.svg", width: 90pt))
  v(20pt)
  align(center, block(width: 12cm, {
    set par(leading: leading-lead-x, justify: false)
    text(size: 11pt, fill: ink, weight: "bold")[Where to find me]
    v(8pt)
    text(size: 10pt, fill: ink)[chanmeng.org · chanmeng.org/blog · Newsletter · linkedin.com/in/chanmeng666 · github.com/ChanMeng666 · youtube.com/\@ChanMeng666 · cal.com/chan-meng/30min]
  }))
  v(1fr)
}
