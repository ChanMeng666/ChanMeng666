#import "../theme.typ": *
#import "../components.typ": *

// ─── Inline icon helper ──────────────────────────────────────────────────────
// Lucide / simple-icons SVGs (cv/icons/*.svg) are pre-tinted to accent so they
// inherit the document accent without any font dependency.
#let contact-icon(name) = box(
  baseline: 1.5pt,
  image("/cv/icons/" + name + ".svg", height: 8pt),
)

// One contact item: icon · clickable label · separator
#let contact-item(icon, label, target: none) = {
  contact-icon(icon)
  h(3pt)
  if target != none {
    link(target, label)
  } else {
    label
  }
}

#let header() = {
  // ─── Row 1: portrait + name + role + tagline ─────────────────────────────
  grid(
    columns: (auto, 1fr),
    column-gutter: 1.2em,
    align: (horizon, horizon + left),

    box(
      radius: 50%,
      clip: true,
      width: 60pt,
      height: 60pt,
      stroke: 1.5pt + accent,
      image("/public/photos/chanmeng-portrait-2026.jpg"),
    ),

    {
      text(
        font: sans-display,
        size: size-h1,
        weight: "bold",
        fill: primary,
        tracking: -0.2pt,
      )[Chan Meng]
      linebreak()
      v(1pt)
      text(
        size: size-role,
        fill: accent,
        weight: "medium",
      )[AI Agent Architect · Full-stack Engineer · AI-Tooling Expert]
      linebreak()
      text(
        size: size-meta,
        fill: muted,
        style: "italic",
      )[« Subtraction for life, addition for thought. »]
    },
  )

  // ─── Row 2: contact items, left-aligned with icons ───────────────────────
  v(6pt)
  {
    set text(size: size-tiny, fill: ink)
    let sep = text(fill: rule)[ \u{2003}|\u{2003} ]
    contact-item("mail", "chanmeng.dev\u{0040}gmail.com",
      target: "mailto:chanmeng.dev@gmail.com")
    sep
    contact-item("phone", "+64 028 8510 9245",
      target: "tel:+6402885109245")
    sep
    contact-item("map-pin", "Auckland, New Zealand")
    linebreak()
    v(3pt)
    contact-item("globe", "chanmeng.org",
      target: "https://chanmeng.org/")
    sep
    contact-item("linkedin", "linkedin.com/in/chanmeng666",
      target: "https://www.linkedin.com/in/chanmeng666/")
    sep
    contact-item("github", "github.com/ChanMeng666",
      target: "https://github.com/ChanMeng666")
    sep
    contact-item("calendar", "cal.com/chan-meng/30min",
      target: "https://cal.com/chan-meng/30min")
  }

  v(6pt)
  line(stroke: 1.8pt + accent, length: 100%)
  v(6pt)
}
