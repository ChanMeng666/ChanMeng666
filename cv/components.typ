// Reusable components, styled after my-cv reference.

#import "theme.typ": *

// ─── Skill pill (ash fill, ink border) ───────────────────────────────────────
#let pill(label, fill: pill-bg, stroke-color: pill-edge) = box(
  fill: fill,
  stroke: 0.5pt + stroke-color,
  radius: cv-radius-pill,
  inset: (x: 5pt, y: 2pt),
  outset: (y: 0.4pt),
  text(size: size-pill, fill: ink, label),
)

// ─── Social-proof stat pill (accent number + muted label) ────────────────────
// Eye-catching but ATS-safe: real text (not an image), ash fill + thin accent
// border, and the NUMBER in Digital Orange so reach metrics pop without using a
// solid orange block. Used in the header social-proof row.
#let stat-pill(value, label) = box(
  fill: pill-bg,
  stroke: 0.6pt + accent,
  radius: cv-radius-pill,
  inset: (x: 5.5pt, y: 2pt),
  outset: (y: 0.4pt),
  {
    text(size: size-pill, weight: "bold", fill: accent)[#value]
    text(size: size-pill, fill: muted)[ #label]
  },
)

// ─── Highlight stat pill (Hazard-Yellow fill, ink text) ──────────────────────
// One restrained use of the brand's Pixel-Glare yellow as a "highlighter" on the
// single most important metric. Ink-on-yellow is high-contrast (AA-safe); yellow
// is a decorative FILL here, never a text color.
#let stat-pill-hl(value, label) = box(
  fill: glare,
  stroke: 0.6pt + ink,
  radius: cv-radius-pill,
  inset: (x: 5.5pt, y: 2pt),
  outset: (y: 0.4pt),
  {
    text(size: size-pill, weight: "bold", fill: ink)[#value]
    text(size: size-pill, fill: ink)[ #label]
  },
)

// ─── Grouped stat pill (several metrics from ONE source in a single pill) ─────
// Lets the header read as a few SOURCE-grouped tags (LinkedIn · Newsletter ·
// GitHub · CopilotKit) instead of many single-metric tags — fewer, more refined
// pills with the same information. `snum()` marks each number bold-accent inside
// the otherwise-muted body; separate metrics with " · ".
#let snum(value) = text(weight: "bold", fill: accent)[#value]
#let stat-pill-multi(body) = box(
  fill: pill-bg,
  stroke: 0.6pt + accent,
  radius: cv-radius-pill,
  inset: (x: 5.5pt, y: 2pt),
  outset: (y: 0.4pt),
  text(size: size-pill, fill: muted, body),
)

// ─── Skill / tooling category (bold label + wrapped pills) ───────────────────
#let skill-category(category, items) = {
  // The label is a sticky (keep-with-next) block so it never strands at a page
  // bottom with its pills pushed over — but we deliberately avoid wrapping
  // label+pills in a single `breakable: false` block: inside a two-column grid
  // cell, a non-breakable block that doesn't fit leaves a large dead gap and can
  // force a spurious page. sticky keeps them together without that side effect.
  block(above: 0pt, below: 4pt, sticky: true, {
    text(
      weight: "bold",
      size: size-meta,
      font: sans,          // DM Sans — Anton is too cramped at 8pt; keep labels legible
      fill: primary,
      tracking: 0.06em,
      upper(category),
    )
  })
  // Tags WITHIN a category cluster tightly (small wrapped-row leading + small
  // horizontal gap) so the group reads as one unit; the big gap is RESERVED for
  // BETWEEN categories (v(10pt) below) — that contrast is the section's rhythm.
  block(above: 0pt, below: 0pt, {
    set par(leading: 0.8em, justify: false)
    for (i, it) in items.enumerate() {
      pill(it)
      if i < items.len() - 1 { h(space-pill-row) }
    }
  })
  v(11pt)   // clear gap to the next category label — the in-section rhythm cue
}

// ─── Inline italic label (e.g. for the architect-grade paragraph header) ────
#let inline-label(label) = text(
  weight: "bold",
  size: size-meta,
  font: sans,          // DM Sans — keep small labels legible
  fill: primary,
  tracking: 0.06em,
  upper(label),
)

// ─── Section header ──────────────────────────────────────────────────────────
// Caldera motif: the accent (Digital Orange) is a color BLOCK; the ink is the
// structural RULE. So the section underline is two-tone — a short solid orange
// lead-block, then a thin ink hairline filling the rest of the width. Reads more
// intentional than a flat full-width orange line and ties the CV to the brand.
// `tight` (right column only) sets an explicit, per-section header top-gap so
// the denser sidebar can be tuned page-by-page: the PAGE-1 sidebar sections
// (What I Bring, AI Engineering, Stack) stay small so the sticky keep-with-next
// chain keeps the Stack header + Models category on page 1, while the PAGE-2
// sections (Certifications, Recognition, Education) get more air to fill page 2.
// `tight: false` = the roomy default (space-section) used by the LEFT narrative
// column, so this never reflows the left column. Otherwise pass a length.
#let section(title, body, tight: false, sticky: true) = {
  v(if tight == false { space-section } else { tight })
  // sticky:true = keep-with-next — the header + rule never strand alone at a
  // page bottom; if the first content block flows to the next page, the header
  // moves with it (avoids the orphaned "Stack / MODELS" header at page 1 foot).
  // The TERMINAL section (Education) passes sticky:false — it has nothing after
  // it to orphan against, and a sticky terminal header gets needlessly bumped to
  // the next page even when it fits.
  block(breakable: false, sticky: sticky, {
    text(
      font: sans-display,    // Anton — heavy compact-grotesque section headers
      weight: "regular",     // Anton is intrinsically bold; avoid faux-bold
      size: size-h2,
      fill: primary,
      tracking: 0.03em,      // MIXED-case (brand voice) — relaxed tracking, not all-caps
      title,
    )
    v(3.5pt)
    grid(
      columns: (34pt, 1fr),
      align: (left + horizon, left + horizon),
      line(stroke: 2.2pt + accent, length: 100%),         // orange lead block
      line(stroke: 0.5pt + rule.lighten(20%), length: 100%), // ink structural hairline
    )
    v(if tight == false { space-after-rule } else { 4pt })
  })
  body
}

// ─── Accent divider between entries ──────────────────────────────────────────
// A short, left-aligned DOTTED orange tab — the Caldera dotted-edge motif, sized
// down for the page. Lighter footprint than a full-width rule and ties the CV to
// the brand's dotted secondary affordance.
#let cv-divider() = {
  v(11pt)
  line(stroke: (paint: accent, thickness: 2pt, dash: "dotted"), length: 30pt)
  v(11pt)
}

// ─── Tight divider (for experience list — many entries) ─────────────────────
#let cv-divider-tight() = {
  v(11pt)
  line(stroke: (paint: accent, thickness: 2pt, dash: "dotted"), length: 30pt)
  v(11pt)
}

// ─── Work / experience entry ─────────────────────────────────────────────────
//   title           ← bold, ink
//   org · location  ← italic, primary
//   dates           ← muted, small
//   summary         ← optional one-line lead (may be `none`)
//   bullets         ← optional content body (already formatted as list)
#let cv-event(
  title: "",
  org: "",
  org-url: "",
  dates: "",
  location: "",
  summary: none,
  bullets: none,
) = block(
  above: 0pt,
  below: 0pt,
  {
    text(weight: "bold", size: size-entry, fill: ink, title)
    linebreak()
    {
      set text(style: "italic", size: size-meta, fill: primary)
      if org-url != "" { link(org-url, org) } else { org }
      if location != "" {
        text(fill: muted)[ — ]
        text(weight: "regular", fill: muted, location)
      }
    }
    linebreak()
    text(weight: "regular", size: size-tiny, fill: muted, dates)
    if summary != none {
      v(3pt)
      text(size: size-body, fill: ink, summary)
    }
    if bullets != none {
      v(2pt)
      bullets
    }
  },
)

// ─── Project card (logo + name + url + impact + bullets) ────────────────────
#let project-card(
  logo: none,
  name: "",
  url: "",
  context-line: none,
  bullets: (),
) = block(
  above: 0pt,
  below: 0pt,
  {
    grid(
      columns: (38pt, 1fr),
      column-gutter: 0.7em,
      align: (center + top, left + top),
      // ─ Logo cell ─ uniform 30pt square slot so every mark carries the same
      //   optical mass regardless of the source SVG's aspect ratio / padding. ─
      if logo != none {
        box(width: 30pt, height: 30pt, image(logo, width: 100%, height: 100%, fit: "contain"))
      } else { [] },
      // ─ Text cell ────────────────────────────────────────────────────────
      {
        // Name line
        text(weight: "bold", size: size-entry, fill: ink, name)
        if url != "" {
          h(6pt)
          text(size: size-tiny, fill: muted)[#link(url, url.replace("https://", ""))]
        }
        if context-line != none {
          v(gap-card-meta)
          block(above: 0pt, below: 0pt, {
            set par(leading: leading-meta, justify: false)
            // muted (grey) — a distinct "meta layer" so the plain-language intro
            // reads as its own tier against the ink bullets below, not a wall of
            // same-weight text.
            text(style: "italic", size: size-meta, fill: muted, context-line)
          })
          v(gap-card-body)
        }
        // Bullets — solid orange dot, ink at the single reading size. Reading
        // leading (leading-body, ratio 1.5) within a bullet; 8pt between bullets
        // (> the 6pt gap-card-body context→bullets seam) so each bullet reads as
        // a distinct unit and the layers are clearly separated.
        set text(size: size-body, fill: ink)
        set par(leading: leading-body, justify: false)
        set list(
          marker: text(fill: accent)[•],
          spacing: 8pt,
          indent: 0pt,
          body-indent: 6pt,
        )
        for b in bullets {
          list.item(b)
        }
      },
    )
  },
)

// ─── Compact 3-line role entry (experience list) ───────────────────────────
//   Line 1:  Title              ← bold, ink (visual anchor)
//   Line 2:  Org · Dates        ← italic primary + muted dates (subline, bound to title)
//   Line 2b: Location · Mode    ← optional muted italic line (city/state/country +
//                                 *bolded* remote/hybrid) — international + remote signal
//   v(2.5pt)
//   Line 3+: Summary (wraps)    ← size-tiny ink
//   below: 9pt                  ← clear inter-entry gap (≫ intra-entry gap)
//
// Visual hierarchy: inter-entry gap (9pt) >> intra-entry gap (~3pt), so the
// reader's eye binds each title to its own summary, not to the previous one.
#let role-line(
  title: "",
  org: "",
  org-url: "",
  dates: "",
  location: none,
  summary: none,
) = block(
  above: 0pt,
  below: gap-inter-entry,
  breakable: false,
  {
    // ── Line 1: Title (own block so `below` is real — linebreak + v(weak)
    //           was being collapsed inside a single paragraph). A small gap to
    //           its org·dates subtitle — distinct lines, not crammed. ───────
    block(above: 0pt, below: 4pt, breakable: false, {
      text(weight: "bold", size: size-entry, fill: ink, title)
    })

    // ── Line 2: Org · Dates (italic + muted, sits below the title block) ─
    block(above: 0pt, below: 0pt, breakable: false, {
      set text(size: size-meta, style: "italic", fill: primary)
      if org-url != "" { link(org-url, org) } else { org }
      text(fill: muted, style: "italic")[ · ]
      text(size: size-tiny, fill: muted, dates)
    })

    // ── Line 2b: Location · arrangement (optional, tight to the org line) ─
    //   The arrangement word is *bolded* by the caller — the remote/hybrid +
    //   international footprint is the signal recruiters scan for.
    if location != none {
      v(2.5pt)
      block(above: 0pt, below: 0pt, breakable: false, {
        set text(size: size-tiny, style: "italic", fill: muted)
        location
      })
    }

    if summary != none {
      v(gap-intra-entry)
      block(above: 0pt, below: 0pt, {
        set par(leading: leading-body, justify: false)
        text(size: size-body, fill: ink, summary)
      })
    }
  },
)

// ─── Compact entry (Education, certs, etc.) ─────────────────────────────────
#let compact-entry(
  title: "",
  org: "",
  org-url: "",
  dates: "",
  location: "",
  note: "",
) = block(above: 0pt, below: 0pt, {
  // Title — own block so `below` actually renders. Stacked lines breathe so
  // title / org·location / dates / note each read as a distinct line.
  block(above: 0pt, below: 5pt, breakable: false, {
    text(weight: "bold", size: size-entry, fill: ink, title)
  })
  // Org · Location — italic
  block(above: 0pt, below: 3pt, breakable: false, {
    set text(style: "italic", size: size-meta, fill: primary)
    if org-url != "" { link(org-url, org) } else { org }
    if location != "" {
      text(fill: muted)[ — ]
      text(weight: "regular", fill: muted, location)
    }
  })
  // Dates — muted
  block(above: 0pt, below: 4pt, breakable: false, {
    text(size: size-tiny, fill: muted, dates)
  })
  if note != "" {
    block(above: 0pt, below: 0pt, breakable: false, {
      text(size: size-tiny, fill: ink, note)
    })
  }
})

// ─── Cert / award group ──────────────────────────────────────────────────────
#let cert-group(group, items) = {
  text(weight: "bold", size: size-meta, fill: primary, group)
  v(3.5pt)
  set text(size: size-tiny, fill: ink)
  // Within-item leading 0.7em; between-items 10pt so each grouped item reads as
  // a distinct, airy unit.
  set par(leading: 0.7em)
  set list(
    marker: text(fill: accent, size: 5.5pt)[•],
    spacing: 15pt,
    indent: 0pt,
    body-indent: 6pt,
  )
  for it in items {
    list.item(it)
  }
  v(6pt)
}

// ─── Bullet list inside an entry (consistent style) ─────────────────────────
#let cv-bullets(items) = {
  set text(size: size-body, fill: ink)
  set par(leading: 0.55em)
  set list(
    marker: text(fill: accent, weight: "bold")[›],
    spacing: 3pt,
    indent: 0pt,
    body-indent: 5pt,
  )
  for it in items {
    list.item(it)
  }
}

// ─── Anti-pattern footnote-style line ────────────────────────────────────────
#let anti-pattern-line(items) = {
  set text(size: size-tiny, fill: muted, style: "italic")
  text(weight: "bold")[Avoided: ] + items.join([ · ])
}

// ─── Quote callout ──────────────────────────────────────────────────────────
#let quote-block(body, source: "") = block(
  fill: quote-bg,
  inset: (x: 7pt, y: 5pt),
  radius: cv-radius-card,
  width: 100%,
  above: 4pt,
  below: 0pt,
  stroke: (left: 2.5pt + accent),
  breakable: false,
  {
    set par(leading: 0.55em)
    text(style: "italic", size: size-tiny, fill: ink)[« #body »]
    if source != "" {
      v(2pt)
      text(size: size-tiny, fill: muted)[— #source]
    }
  },
)
