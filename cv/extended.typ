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
#let x-story() = x-stub("1", "My Story", "story", 2)                    // pp3–4
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
