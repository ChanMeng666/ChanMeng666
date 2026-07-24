// Reusable magazine primitives for the 16-page extended CV.
// Styled after cv/components.typ (deterministic block gaps, breakable:false for
// callouts). Consumes the *-x tokens from theme-extended.typ.
#import "theme-extended.typ": *

// ─── Rounded, hairline-framed photo (optional caption) ───────────────────────
#let photo(path, caption: none, w: 100%) = block(above: 0pt, below: 0pt, breakable: false,
  box(width: w, {
    box(width: 100%, radius: radius-photo-x, clip: true,
      stroke: frame-photo-x + rule.lighten(25%), image(path, width: 100%))
    if caption != none {
      v(5pt)
      text(size: size-tiny-x, fill: muted, style: "italic", caption)
    }
  })
)

// ─── Photo grid — items: array of (path, caption|none) ───────────────────────
#let photo-grid(items, cols: 2, gutter: gap-photo-x) = grid(
  columns: (1fr,) * cols,
  column-gutter: gutter,
  row-gutter: gutter,
  ..items.map(it => photo(it.at(0), caption: it.at(1))),
)

// ─── Branded placeholder block (cream + light halftone + IMG-XX label) ───────
#let img-placeholder(id, desc, ratio: "landscape") = {
  let h = if ratio == "portrait" { ph-h-portrait }
    else if ratio == "square" { ph-h-square }
    else if ratio == "wide" { ph-h-wide }
    else { ph-h-landscape }
  block(above: 0pt, below: 0pt, breakable: false,
    box(width: 100%, height: h, radius: radius-photo-x, clip: true, fill: pill-bg,
      stroke: frame-photo-x + rule.lighten(25%), {
        // halftone texture, then a translucent cream veil that mutes the vivid
        // brand gradient into a LIGHT wash so the IMG-XX label stays legible
        place(top + left, box(width: 100%, height: h, clip: true,
          image("/public/brand/halftone-thumb.svg", width: 100%)))
        place(top + left, box(width: 100%, height: h, fill: pill-bg.transparentize(28%)))
        place(center + horizon, box(inset: 6pt, {
          text(size: 9pt, weight: "bold", fill: accent)[#id]
          text(size: 9pt, fill: muted)[ · ]
          text(size: 9pt, fill: muted, style: "italic")[#desc]
        }))
      })
  )
}

// ─── Media-article card ──────────────────────────────────────────────────────
#let article-card(cover, title, stats, url) = block(above: 0pt, below: gap-inter-entry-x, breakable: false, {
  // Fixed cover height + fit:"contain" so covers of differing aspect ratios
  // (outlet brand-marks vs. landscape photos) all render the same height —
  // keeping the card tops and the title/link rows aligned across a grid row.
  // Letterbox/pillarbox gutters are filled with cream (pill-bg), never white.
  let cover-h-x = 112pt
  if cover != none {
    box(width: 100%, height: cover-h-x, fill: pill-bg, radius: radius-photo-x, clip: true,
      stroke: frame-photo-x + rule.lighten(25%),
      image(cover, width: 100%, height: 100%, fit: "contain"))
  } else {
    img-placeholder("IMG-??", "article cover", ratio: "wide")
  }
  v(7pt)
  block(above: 0pt, below: 3pt, breakable: false,
    text(weight: "bold", size: size-h3-x, fill: ink, title))
  block(above: 0pt, below: 3pt, breakable: false,
    text(size: size-meta-x, fill: muted, style: "italic", stats))
  block(above: 0pt, below: 0pt, breakable: false,
    text(size: size-tiny-x, fill: primary)[#link(url, url.replace("https://", ""))])
})

// ─── Product tile — UNIFORM product row (fixed logo box + copy) ──────────────
// Every product on pp9–11 gets the identical treatment: a fixed-size logo box
// (contain + cream fill, so brand marks of any aspect ratio letterbox to the
// same footprint) beside a name / one human line / one plain-technical line /
// a live link. Two tiles per page, vertically distributed with v(1fr) spacers.
#let product-tile(logo, name, human, tech, url, linktext) = block(above: 0pt, below: 0pt, breakable: false, {
  grid(columns: (180pt, 1fr), column-gutter: 18pt, align: (horizon, horizon),
    box(width: 100%, height: 120pt, fill: pill-bg, radius: radius-photo-x, clip: true,
      inset: 12pt, stroke: frame-photo-x + rule.lighten(25%),
      image(logo, width: 100%, height: 100%, fit: "contain")),
    {
      block(above: 0pt, below: 6pt, breakable: false,
        text(weight: "bold", size: size-h3-x, fill: ink, name))
      block(above: 0pt, below: 6pt, breakable: false, {
        set par(leading: leading-body-x, justify: false)
        text(size: size-body-x, fill: ink, human)
      })
      block(above: 0pt, below: 7pt, breakable: false, {
        set par(leading: leading-body-x, justify: false)
        text(size: size-meta-x, fill: muted, tech)
      })
      block(above: 0pt, below: 0pt, breakable: false,
        text(size: size-tiny-x, fill: primary)[#link(url, linktext)])
    })
})

// ─── Pull-quote (large italic, orange lead rule) ─────────────────────────────
// The lead rule is a block LEFT stroke, not a rect(height: 100%): a rect's 100%
// resolves against the page region (in an auto-height grid row it ran to the
// page foot), whereas a block border hugs the block's own content height. The
// left inset holds the text off the bar. Same pattern as components.typ::quote-block.
#let pull-quote(body, attribution: none) = block(above: 6pt, below: 12pt, breakable: false,
  block(inset: (left: 14pt), stroke: (left: 4pt + accent), {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-pull-x, style: "italic", fill: primary)[#body]
    if attribution != none {
      v(6pt)
      text(size: size-meta-x, fill: muted)[— #attribution]
    }
  })
)

// ─── Avatar wall — people: array of (img, name) ──────────────────────────────
#let avatar-wall(people, cols: 8) = grid(
  columns: (1fr,) * cols,
  column-gutter: 8pt,
  row-gutter: 10pt,
  ..people.map(p => box(width: 100%, {
    align(center, box(radius: 50%, clip: true, width: avatar-size-x, height: avatar-size-x,
      stroke: 1pt + accent, image(p.at(0), width: 100%, height: 100%, fit: "cover")))
    v(3pt)
    align(center, text(size: size-avatar-cap-x, fill: muted, p.at(1)))
  }))
)

// ─── Chapter opener (big title + optional kicker + halftone strip) ───────────
#let chapter-opener(number, title, kicker: none) = block(above: 0pt, below: 16pt, breakable: false, {
  text(size: size-kicker-x, weight: "bold", fill: accent, tracking: 0.14em)[#upper("Chapter " + number)]
  v(6pt)
  text(font: sans-display, weight: "regular", size: size-chapter-x, fill: primary, tracking: 0.02em, title)
  v(8pt)
  box(width: 100%, height: 18pt, clip: true, radius: 4pt,
    image("/public/brand/halftone-hero.svg", width: 100%))
  if kicker != none {
    v(10pt)
    block(above: 0pt, below: 0pt, {
      set par(leading: leading-lead-x, justify: false)
      text(size: size-body-x, fill: muted, style: "italic", kicker)
    })
  }
})
