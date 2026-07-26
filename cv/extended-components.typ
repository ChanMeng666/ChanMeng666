// Reusable magazine primitives for the 16-page extended CV.
// Styled after cv/components.typ (deterministic block gaps, breakable:false for
// callouts). Consumes the *-x tokens from theme-extended.typ.
#import "theme-extended.typ": *

// ─── Icon (color-baked SVG from cv/assets/icons) ─────────────────────────────
// SVGs carry a concrete brand-token hex (accent #FC5000) baked in — Typst's
// image() does NOT inherit the surrounding text fill (TYPST_PITFALLS §6). The
// baseline nudge seats the glyph on the text baseline rather than the descender.
// Defined first so later primitives (product-tile) can reference it.
#let icon(name, size: 12pt, baseline: 0.16em) = box(baseline: baseline, height: size,
  image("/cv/assets/icons/" + name + ".svg", height: size, fit: "contain"))

// ─── Inline URL with a small leading link icon (product tiles etc.) ──────────
#let icon-link(name, url, label, size: size-tiny-x, color: primary) = {
  icon(name, size: size * 1.05)
  h(4pt)
  text(size: size, fill: color)[#link(url, label)]
}

// ─── Back-cover link grid — orange icons + ink labels, aligned columns ───────
// items: array of (icon-name, url, label). One grid so all icons share a column
// edge and all labels share theirs; centered as a block on the page.
#let backcover-links(items) = align(center, box(grid(
  columns: (20pt, auto), column-gutter: 12pt, row-gutter: 17pt,
  align: (center + horizon, left + horizon),
  ..items.map(it => (
    icon(it.at(0), size: 16pt, baseline: 0.30em),
    text(size: 11.5pt, fill: ink)[#link(it.at(1), it.at(2))],
  )).flatten(),
)))

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

// ─── Fixed-height photo band (cover-crop, full width) ────────────────────────
// A controlled banner: fills the column width at a fixed height (cover crop), so
// a landscape frame anchors a page bottom without the natural-aspect height
// blowing the page. Optional caption below.
#let photo-band(path, caption: none, h: 210pt, w: 100%) = block(above: 0pt, below: 0pt, breakable: false,
  box(width: w, {
    box(width: 100%, height: h, radius: radius-photo-x, clip: true,
      stroke: frame-photo-x + rule.lighten(25%), image(path, width: 100%, height: 100%, fit: "cover"))
    if caption != none {
      v(5pt)
      text(size: size-tiny-x, fill: muted, style: "italic", caption)
    }
  }))

// ─── Photo grid — items: array of (path, caption|none) ───────────────────────
#let photo-grid(items, cols: 2, gutter: gap-photo-x) = grid(
  columns: (1fr,) * cols,
  column-gutter: gutter,
  row-gutter: gutter,
  ..items.map(it => photo(it.at(0), caption: it.at(1))),
)

// ─── Fixed-height photo row — items: array of (path, caption) ────────────────
// Unlike photo-grid (natural aspect, width-scaled) this gives every frame the
// SAME box height and fits with "contain", so a row can mix portrait and
// landscape sources without cropping anything and without one tall portrait
// blowing the page. Letterbox gutters fill with cream (pill-bg), never white —
// so captions stay truthful to the whole visible frame. Used wherever a page
// pairs frames of mismatched orientation (pp4, 12).
//
// `cols:` overrides the default equal split. Passing each frame an fr weight
// EQUAL TO ITS ASPECT RATIO makes every box exactly its image's shape, so a
// mixed landscape/portrait row fills edge to edge with zero cream letterbox —
// provided `h` is set to (content-width − gutters) ÷ (sum of the ratios). p12
// runs this way; p4 keeps the equal split, where the letterbox is wanted.
#let photo-row(items, h: 300pt, gutter: gap-photo-x, cols: none) = grid(
  columns: if cols != none { cols } else { (1fr,) * items.len() },
  column-gutter: gutter,
  ..items.map(it => block(above: 0pt, below: 0pt, breakable: false, {
    box(width: 100%, height: h, radius: radius-photo-x, clip: true, fill: pill-bg,
      stroke: frame-photo-x + rule.lighten(25%),
      image(it.at(0), width: 100%, height: 100%, fit: "contain"))
    v(6pt)
    text(size: size-tiny-x, fill: muted, style: "italic", it.at(1))
  })),
)

// ─── Branded placeholder block (plain cream + IMG-XX label) ──────────────────
#let img-placeholder(id, desc, ratio: "landscape") = {
  let h = if ratio == "portrait" { ph-h-portrait }
    else if ratio == "square" { ph-h-square }
    else if ratio == "wide" { ph-h-wide }
    else { ph-h-landscape }
  block(above: 0pt, below: 0pt, breakable: false,
    box(width: 100%, height: h, radius: radius-photo-x, clip: true, fill: pill-bg,
      stroke: frame-photo-x + rule.lighten(25%), {
        // plain cream card — the IMG-XX label reads clean against it
        place(center + horizon, box(inset: 6pt, {
          text(size: 9pt, weight: "bold", fill: accent)[#id]
          text(size: 9pt, fill: muted)[ · ]
          text(size: 9pt, fill: muted, style: "italic")[#desc]
        }))
      })
  )
}

// ─── Media-article card ──────────────────────────────────────────────────────
// CURRENTLY UNUSED (p6 moved to article-row 2026-07-26); kept for potential
// card-grid reuse. Nothing in extended.typ calls it — edits here change nothing
// in the PDF, and its `img-placeholder` fallback branch is likewise dormant.
#let article-card(cover, title, stats, url) = block(above: 0pt, below: gap-inter-entry-x, breakable: false, {
  // Fixed cover height + fit:"contain" so covers of differing aspect ratios
  // (outlet brand-marks vs. landscape photos) all render the same height —
  // keeping the card tops and the title/link rows aligned across a grid row.
  // Letterbox/pillarbox gutters are filled with cream (pill-bg), never white.
  // The horizontal inset holds wide marks off the frame edge: a full-bleed
  // wordmark touching both sides reads as a cropping mistake rather than a
  // deliberate letterbox. x-only, so the fixed card height is unchanged.
  let cover-h-x = 150pt
  if cover != none {
    box(width: 100%, height: cover-h-x, fill: pill-bg, radius: radius-photo-x, clip: true,
      stroke: frame-photo-x + rule.lighten(25%), inset: (x: 9pt),
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

// ─── Media-article ROW — full-width card, outlet mark left, copy right ───────
// The landscape counterpart to article-card, sharing product-tile's geometry.
// Three of these stack down a page where a 3-across grid of article-cards would
// squeeze each column to ~153pt — at that width the titles wrap to two lines,
// the long WeChat URLs break mid-string, and the stat lines stop aligning across
// the row because the one-line and two-line titles push them to different
// heights. Full width gives every title and URL a single line and lets the
// outlet marks run large. Same content, same links — only the shape changes.
#let article-row(cover, title, stats, url, cover-h: 152pt, cover-w: 172pt) = block(above: 0pt, below: 0pt, breakable: false,
  box(width: 100%, fill: pill-bg, radius: radius-photo-x, stroke: frame-photo-x + rule.lighten(25%), inset: 20pt, {
    grid(columns: (cover-w, 1fr), column-gutter: 26pt, align: (center + horizon, left + horizon),
      box(width: 100%, height: cover-h, image(cover, width: 100%, height: 100%, fit: "contain")),
      {
        block(above: 0pt, below: 9pt, breakable: false,
          text(weight: "bold", size: 15pt, fill: ink, title))
        block(above: 0pt, below: 10pt, breakable: false,
          text(size: size-meta-x, fill: muted, style: "italic", stats))
        block(above: 0pt, below: 0pt, breakable: false,
          icon-link("link", url, url.replace("https://", "")))
      })
  }))

// ─── Product tile — UNIFORM full-width product CARD (big logo + copy) ─────────
// Every product on pp8–11 gets the identical treatment: a full-width cream card
// (so the page reads as filled, not tiny marks floating in a void) holding a
// large logo panel beside a name / one human line / one plain-technical line /
// a live link. `logo-h` scales the logo panel: ~190pt for the 2-per-page pages,
// larger for the single flagship feature on p8 / the closer on p11. Cards are
// vertically distributed with v(1fr) spacers so each page fills top to bottom.
#let product-tile(logo, name, human, tech, url, linktext, logo-h: 210pt, logo-w: 200pt) = block(above: 0pt, below: 0pt, breakable: false,
  box(width: 100%, fill: pill-bg, radius: radius-photo-x, stroke: frame-photo-x + rule.lighten(25%), inset: 22pt, {
    grid(columns: (logo-w, 1fr), column-gutter: 26pt, align: (center + horizon, left + horizon),
      box(width: 100%, height: logo-h, image(logo, width: 100%, height: 100%, fit: "contain")),
      {
        block(above: 0pt, below: 9pt, breakable: false,
          text(weight: "bold", size: 15pt, fill: ink, name))
        block(above: 0pt, below: 8pt, breakable: false, {
          set par(leading: leading-lead-x, justify: false)
          text(size: size-body-x, fill: ink, human)
        })
        block(above: 0pt, below: 10pt, breakable: false, {
          set par(leading: leading-body-x, justify: false)
          text(size: size-meta-x, fill: muted, tech)
        })
        block(above: 0pt, below: 0pt, breakable: false,
          icon-link("link", url, linktext))
      })
  }))

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
#let avatar-wall(people, cols: 8, size: avatar-size-x, row-gutter: 10pt, col-gutter: 8pt, cap-size: size-avatar-cap-x) = grid(
  columns: (1fr,) * cols,
  column-gutter: col-gutter,
  row-gutter: row-gutter,
  ..people.map(p => box(width: 100%, {
    align(center, box(radius: 50%, clip: true, width: size, height: size,
      stroke: 1pt + accent, image(p.at(0), width: 100%, height: 100%, fit: "cover")))
    v(4pt)
    align(center, text(size: cap-size, fill: muted, p.at(1)))
  }))
)

// ─── Voice feature — a pull-quote with the speaker's avatar in the byline ─────
#let voice-feature(avatar, body, attribution) = block(above: 0pt, below: 0pt, breakable: false,
  block(inset: (left: 16pt), stroke: (left: 4pt + accent), {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-pull-x, style: "italic", fill: primary)[#body]
    v(11pt)
    grid(columns: (34pt, auto), column-gutter: 11pt, align: (center + horizon, left + horizon),
      box(radius: 50%, clip: true, width: 32pt, height: 32pt, stroke: 1pt + accent,
        image(avatar, width: 100%, height: 100%, fit: "cover")),
      text(size: size-meta-x, fill: muted)[— #attribution])
  }))

// ─── Chapter opener (big title + optional kicker + clean Caldera rule) ───────
// The rule is the brand's two-tone section motif (components.typ::section): a
// short solid-orange lead block, then a thin ink hairline to the page edge —
// scaled up for the magazine's big chapter titles. Replaces the old dot-strip
// (that decorative motif was removed brand-wide 2026-07-24).
#let chapter-opener(number, title, kicker: none) = block(above: 0pt, below: 16pt, breakable: false, {
  text(size: size-kicker-x, weight: "bold", fill: accent, tracking: 0.14em)[#upper("Chapter " + number)]
  v(6pt)
  text(font: sans-display, weight: "regular", size: size-chapter-x, fill: primary, tracking: 0.02em, title)
  v(11pt)
  grid(
    columns: (54pt, 1fr),
    align: (left + horizon, left + horizon),
    line(stroke: 3pt + accent, length: 100%),
    line(stroke: 0.6pt + rule.lighten(20%), length: 100%),
  )
  if kicker != none {
    v(10pt)
    block(above: 0pt, below: 0pt, {
      set par(leading: leading-lead-x, justify: false)
      text(size: size-body-x, fill: muted, style: "italic", kicker)
    })
  }
})
