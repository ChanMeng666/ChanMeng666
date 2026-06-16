// =============================================================================
// MEDIA-KIT COMPONENTS — editorial marketing cards for the landscape kit.
// =============================================================================
#import "theme.typ": *
#import "../cv/components.typ": pill, stat-pill
#import "@preview/fontawesome:0.5.0": fa-icon

// The fontawesome package matches the family "Font Awesome 6 Free", but the
// webfont we vendor in media-kit/fonts reports "Font Awesome 6 Free Solid".
// fa-icon forwards extra args to text(), so we override the family here. This
// keeps the kit self-contained (no system font install needed).
#let fa(name) = fa-icon(name, font: "Font Awesome 6 Free Solid")

// ─── Eyebrow (mono micro-label with an orange tick) ──────────────────────────
#let mk-eyebrow(label, fill: accent) = box({
  box(fill: fill, width: 16pt, height: 3pt, outset: (bottom: 1.5pt))
  h(8pt)
  text(font: mono, size: mk-meta, weight: "bold", fill: fill, tracking: 0.24em, upper(label))
})

// ─── Interior-page section header (eyebrow + Anton title + thin rule) ────────
#let mk-section(eyebrow, title) = {
  mk-eyebrow(eyebrow)
  v(9pt)
  text(font: sans-display, weight: "regular", size: mk-h1, fill: primary, tracking: 0.02em, title)
  v(10pt)
  grid(
    columns: (46pt, 1fr),
    align: (left + horizon, left + horizon),
    line(stroke: 2.6pt + accent, length: 100%),
    line(stroke: 0.5pt + ink.lighten(20%), length: 100%),
  )
  v(mk-gap)
}

// ─── Full page-height image panel (for half-page bleed splits) ───────────────
#let bleed-image(path, w) = box(
  width: w, height: mk-page-h, clip: true,
  image(path, width: w, height: mk-page-h, fit: "cover"),
)

// ─── Full page-height labelled placeholder (swap a real photo in later) ──────
#let bleed-placeholder(label, w, sublabel: none) = box(
  width: w, height: mk-page-h, fill: primary,
  align(center + horizon, {
    text(size: 30pt, fill: accent, fa("camera-retro"))
    v(12pt)
    text(font: mono, size: mk-meta, fill: white, tracking: 0.18em, upper(label))
    if sublabel != none {
      v(6pt)
      text(font: mono, size: mk-tiny, fill: muted.lighten(20%), tracking: 0.12em, upper(sublabel))
    }
  }),
)

// ─── Real photo in a rounded frame (in-flow imagery) ─────────────────────────
#let photo-frame(path, width: 100%, height: 120pt) = box(
  width: width, height: height, radius: mk-radius, clip: true,
  stroke: mk-hair,
  image(path, width: width, height: height, fit: "cover"),
)

// ─── Small caption under a photo ─────────────────────────────────────────────
#let mk-caption(body) = block(above: 0pt, below: 0pt, {
  set par(leading: 0.5em)
  text(font: mono, size: mk-tiny, fill: muted, tracking: 0.03em, body)
})

// ─── Labelled placeholder frame (in-flow, rounded) ───────────────────────────
#let placeholder-frame(label, width: 100%, height: 120pt) = box(
  width: width, height: height,
  fill: canvas-surface, radius: mk-radius,
  stroke: (paint: accent, thickness: 1.2pt, dash: "dashed"),
  align(center + horizon, {
    text(size: 18pt, fill: accent, fa("camera-retro"))
    v(6pt)
    text(font: mono, size: mk-meta, fill: muted, tracking: 0.12em, upper(label))
  }),
)

// ─── Soft dark scrim for legible text over a full-bleed photo ────────────────
// A left-to-right gradient: dense ink on the content side, clearing toward the
// image so the photo still reads.
#let scrim-left = box(width: 100%, height: mk-page-h, fill: gradient.linear(
  primary.transparentize(8%), primary.transparentize(35%), primary.transparentize(78%),
  angle: 0deg,
))

// ─── Icon chip (orange square with a white glyph) ────────────────────────────
#let icon-chip(icon, size: 14pt) = box(
  fill: accent, radius: 8pt, inset: (x: 7pt, y: 6pt),
  text(fill: on-accent, size: size, fa(icon)),
)

// ─── Slim speaking-topic row (icon · title · one-line · format) ──────────────
// Editorial, airy — one line of description, generous vertical padding.
#let topic-row(icon, title, desc, fmt) = block(
  width: 100%, breakable: false, above: 0pt, below: 13pt,
  grid(
    columns: (auto, 1fr, auto), column-gutter: 15pt,
    align: (left + top, left + top, right + top),
    icon-chip(icon),
    {
      text(font: sans, weight: "bold", size: mk-h3, fill: primary, title)
      v(4pt)
      block(above: 0pt, below: 0pt, { set par(leading: mk-lead-tight); text(size: mk-small, fill: ink, desc) })
    },
    box(inset: (top: 3pt), text(font: mono, size: mk-tiny, weight: "bold", fill: accent, tracking: 0.1em, upper(fmt))),
  ),
)

// ─── Proof card (signature work — name + one-liner + one bold metric) ────────
#let proof-card(name, oneliner, metric, metric-label) = block(
  width: 100%, fill: canvas-surface, radius: mk-radius,
  inset: (x: 15pt, y: 14pt), stroke: mk-hair,
  breakable: false,
  {
    text(font: sans, weight: "bold", size: mk-h3, fill: primary, name)
    v(6pt)
    block(above: 0pt, below: 0pt, {
      set par(leading: mk-lead-tight)
      text(size: mk-small, fill: ink, oneliner)
    })
    v(10pt)
    box(
      fill: pill-bg, radius: mk-radius-tile, inset: (x: 8pt, y: 4pt),
      stroke: 0.6pt + accent,
      {
        text(font: sans-display, size: 13pt, fill: accent, metric)
        text(size: mk-tiny, fill: muted)[ #upper(metric-label)]
      },
    )
  },
)

// ─── Big metric tile (reach numbers) ─────────────────────────────────────────
#let metric-tile(value, label) = box(
  width: 100%, height: 58pt,
  fill: canvas-surface, radius: mk-radius-tile, stroke: 0.7pt + accent,
  inset: (x: 3.5pt, y: 7pt),
  align(center + horizon, {
    text(font: sans-display, size: 21pt, fill: accent, value)
    v(3pt)
    block(above: 0pt, below: 0pt, {
      set par(leading: 0.55em, justify: false)
      set text(hyphenate: true)
      text(size: 6.5pt, fill: muted, tracking: 0.01em, upper(label))
    })
  }),
)

// ─── "Fast fact" row ─────────────────────────────────────────────────────────
#let fast-fact(icon, body) = block(above: 0pt, below: 11pt, breakable: false,
  grid(
    columns: (17pt, 1fr), column-gutter: 9pt, align: (left + top, left + top),
    text(size: 11pt, fill: accent, fa(icon)),
    block(above: 0pt, below: 0pt, { set par(leading: mk-lead-tight); text(size: mk-small, fill: ink, body) }),
  ),
)

// ─── Press / "as featured in" pill ───────────────────────────────────────────
#let press-pill(outlet, note) = box(
  fill: pill-bg, radius: mk-radius-tile, inset: (x: 11pt, y: 7pt), stroke: mk-hair,
  {
    text(weight: "bold", size: mk-small, fill: primary, outlet)
    if note != none { text(size: mk-tiny, fill: muted)[  #note] }
  },
)

// ─── Testimonial card ────────────────────────────────────────────────────────
#let testimonial-card(quote, name, role) = block(
  width: 100%, fill: canvas-surface, radius: mk-radius,
  inset: (x: 15pt, y: 14pt), stroke: mk-hair, breakable: false,
  {
    text(font: sans-display, size: 26pt, fill: accent)[\u{201C}]
    v(-11pt)
    block(above: 0pt, below: 0pt, {
      set par(leading: mk-lead-loose)
      text(style: "italic", size: mk-small, fill: ink, quote)
    })
    v(10pt)
    text(weight: "bold", size: mk-small, fill: primary, name)
    linebreak()
    text(size: mk-tiny, fill: muted, role)
  },
)

// ─── Contact chip (FA icon + linked label) ───────────────────────────────────
#let contact-chip(icon, label, url, fill: pill-bg, ink-color: primary) = box(
  fill: fill, radius: 999pt, inset: (x: 11pt, y: 6pt), stroke: 0.6pt + ink.lighten(20%),
  link(url, {
    text(size: mk-small, fill: accent, fa(icon))
    h(6pt)
    text(size: mk-small, fill: ink-color, weight: "medium", label)
  }),
)

// ─── Contact chip backed by a pre-tinted SVG icon (cv/icons/*.svg) ───────────
// More robust than FA brand glyphs for the contact strip — the SVGs are already
// orange-tinted and ship in the repo. `ink` recolors the label for dark panels.
#let svg-chip(icon-path, label, url, fill: pill-bg, ink: primary, stroke-color: none) = box(
  fill: fill, radius: 999pt, inset: (x: 11pt, y: 6pt),
  stroke: 0.6pt + (if stroke-color == none { ink.lighten(20%) } else { stroke-color }),
  baseline: 0pt,
  link(url, {
    box(baseline: 2pt, image(icon-path, height: 9.5pt))
    h(6pt)
    text(size: mk-small, fill: ink, weight: "medium", label)
  }),
)
