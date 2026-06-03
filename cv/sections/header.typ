#import "../theme.typ": *
#import "../components.typ": *

// ─── Inline icon helper ──────────────────────────────────────────────────────
// Lucide / simple-icons SVGs (cv/icons/*.svg) are pre-tinted to accent so they
// inherit the document accent without any font dependency.
#let contact-icon(name) = box(
  baseline: 1.4pt,
  image("/cv/icons/" + name + ".svg", height: 7.5pt),
)

// One stacked contact line: icon + clickable label
#let contact-line(icon, label, target: none) = {
  contact-icon(icon)
  h(4pt)
  if target != none {
    link(target, label)
  } else {
    label
  }
}

#let header() = {
  grid(
    columns: (auto, 1fr, auto),
    column-gutter: 1.2em,
    align: (horizon, horizon + left, horizon + left),

    // ── Portrait ───────────────────────────────────────────────────────────
    box(
      radius: 50%,
      clip: true,
      width: 64pt,
      height: 64pt,
      stroke: 1.5pt + accent,
      image("/public/photos/chanmeng-portrait-2026.jpg"),
    ),

    // ── Name + role + tagline ──────────────────────────────────────────────
    {
      text(
        font: sans-display,
        size: size-h1,
        weight: "regular",   // Bebas Neue is intrinsically ultra-bold; avoid faux-bold
        fill: primary,
        tracking: 0.02em,    // Caldera display tracking
      )[Chan Meng]
      linebreak()
      v(2pt)
      text(
        size: size-role,
        fill: primary,       // ink — role line is key copy, must stay readable
        weight: "medium",
      )[AI Agent Architect · Full-stack Engineer · AI-Tooling Expert]
      linebreak()
      v(1pt)
      text(
        size: size-meta,
        fill: muted,
        style: "italic",
      )[« Subtraction for life, addition for thought. »]
    },

    // ── Contact items (stacked, LEFT-aligned within the right slot) ────────
    {
      set text(size: size-tiny, fill: ink)
      set par(leading: 0.85em)
      contact-line("mail", "chanmeng.dev\u{0040}gmail.com",
        target: "mailto:chanmeng.dev@gmail.com")
      linebreak()
      contact-line("phone", "+64 028 8510 9245",
        target: "tel:+6402885109245")
      linebreak()
      contact-line("map-pin", "Auckland, New Zealand")
      linebreak()
      contact-line("globe", "chanmeng.org",
        target: "https://chanmeng.org/")
      linebreak()
      contact-line("linkedin", "linkedin.com/in/chanmeng666",
        target: "https://www.linkedin.com/in/chanmeng666/")
      linebreak()
      contact-line("github", "github.com/ChanMeng666",
        target: "https://github.com/ChanMeng666")
      linebreak()
      contact-line("calendar", "cal.com/chan-meng/30min",
        target: "https://cal.com/chan-meng/30min")
    },
  )

  v(10pt)
  line(stroke: 1.8pt + accent, length: 100%)
  v(8pt)
}
