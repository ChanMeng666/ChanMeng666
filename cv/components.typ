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

// ─── Skill / tooling category (bold label + wrapped pills) ───────────────────
#let skill-category(category, items) = {
  text(
    weight: "bold",
    size: size-meta,
    font: sans,          // DM Sans — Bebas is too cramped at 8pt; keep labels legible
    fill: primary,
    tracking: 0.06em,
    upper(category),
  )
  v(3pt)
  for (i, it) in items.enumerate() {
    pill(it)
    if i < items.len() - 1 { h(space-pill-row) }
  }
  v(5pt)
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
#let section(title, body) = {
  v(space-section)
  text(
    font: sans-display,    // Bebas Neue — compact ultrabold section headers
    weight: "regular",     // Bebas is intrinsically bold; avoid faux-bold
    size: size-h2,
    fill: primary,
    tracking: 0.08em,
    upper(title),
  )
  v(3pt)
  line(stroke: 1.5pt + accent, length: 100%)   // Digital Orange accent rule
  v(space-after-rule)
  body
}

// ─── Accent divider between entries ──────────────────────────────────────────
#let cv-divider() = {
  v(8pt)
  line(stroke: 0.4pt + accent.lighten(60%), length: 100%)
  v(8pt)
}

// ─── Tight divider (for experience list — many entries) ─────────────────────
#let cv-divider-tight() = {
  v(6pt)
  line(stroke: 0.4pt + accent.lighten(60%), length: 100%)
  v(6pt)
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
    text(weight: "bold", size: size-h3, fill: ink, title)
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
      columns: (44pt, 1fr),
      column-gutter: 0.7em,
      align: (center + top, left + top),
      // ─ Logo cell ────────────────────────────────────────────────────────
      if logo != none {
        box(image(logo, height: 36pt))
      } else { [] },
      // ─ Text cell ────────────────────────────────────────────────────────
      {
        // Name line
        text(weight: "bold", size: size-h3, fill: ink, name)
        if url != "" {
          h(6pt)
          text(size: size-tiny, fill: muted)[#link(url, url.replace("https://", ""))]
        }
        if context-line != none {
          v(gap-card-meta)
          block(above: 0pt, below: 0pt, {
            set par(leading: 0.7em)
            text(style: "italic", size: size-meta, fill: primary, context-line)
          })
          v(gap-card-body)
        }
        // Bullets — solid dot. Within-bullet leading 0.7em (6.3pt at 9pt
        // text); between-bullets 11pt (~1.75×) so each bullet reads as a
        // distinct paragraph, not a continuation of the line above.
        set text(size: size-body, fill: ink)
        set par(leading: 0.7em)
        set list(
          marker: text(fill: accent)[•],
          spacing: 11pt,
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
  summary: none,
) = block(
  above: 0pt,
  below: gap-inter-entry,
  breakable: false,
  {
    // ── Line 1: Title (own block so `below` is real — linebreak + v(weak)
    //           was being collapsed inside a single paragraph) ─────────────
    block(above: 0pt, below: 5pt, breakable: false, {
      text(weight: "bold", size: 9.5pt, fill: ink, title)
    })

    // ── Line 2: Org · Dates (italic + muted, sits below the title block) ─
    block(above: 0pt, below: 0pt, breakable: false, {
      set text(size: size-meta, style: "italic", fill: primary)
      if org-url != "" { link(org-url, org) } else { org }
      text(fill: muted, style: "italic")[ · ]
      text(size: size-tiny, fill: muted, dates)
    })

    if summary != none {
      v(gap-intra-entry)
      block(above: 0pt, below: 0pt, {
        set par(leading: leading-summary, justify: false)
        text(size: 7.4pt, fill: ink, summary)
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
  // Title — own block so `below` actually renders
  block(above: 0pt, below: 4pt, breakable: false, {
    text(weight: "bold", size: 9.5pt, fill: ink, title)
  })
  // Org · Location — italic
  block(above: 0pt, below: 2pt, breakable: false, {
    set text(style: "italic", size: size-meta, fill: primary)
    if org-url != "" { link(org-url, org) } else { org }
    if location != "" {
      text(fill: muted)[ — ]
      text(weight: "regular", fill: muted, location)
    }
  })
  // Dates — muted
  block(above: 0pt, below: 3pt, breakable: false, {
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
  v(3pt)
  set text(size: size-tiny, fill: ink)
  // Within-item leading 0.65em (4.55pt at 7pt text); between-items 9pt (~2×).
  set par(leading: 0.65em)
  set list(
    marker: text(fill: accent, size: 5.5pt)[•],
    spacing: 9pt,
    indent: 0pt,
    body-indent: 5pt,
  )
  for it in items {
    list.item(it)
  }
  v(8pt)
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
