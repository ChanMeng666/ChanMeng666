#import "../theme.typ": *
#import "../components.typ": *

#let header() = {
  grid(
    columns: (auto, 1fr, auto),
    column-gutter: 1.2em,
    align: (horizon, horizon + left, horizon + right),

    // ── Portrait ───────────────────────────────────────────────────────────
    box(
      radius: 50%,
      clip: true,
      width: 62pt,
      height: 62pt,
      stroke: 1.5pt + accent,
      image("/public/photos/chanmeng-portrait.jpg"),
    ),

    // ── Name + role + minimalism tagline ───────────────────────────────────
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

    // ── Contact items (stacked, right-aligned) ─────────────────────────────
    {
      set text(size: size-tiny, fill: muted)
      set align(right)
      set par(leading: 0.65em)
      link("mailto:chanmeng.dev@gmail.com", "chanmeng.dev\u{0040}gmail.com")
      linebreak()
      link("tel:+6402885109245", "+64 028 8510 9245")
      linebreak()
      [Auckland, New Zealand]
      linebreak()
      link("https://chanmeng.org/", "chanmeng.org")
      linebreak()
      link("https://www.linkedin.com/in/chanmeng666/", "linkedin.com/in/chanmeng666")
      linebreak()
      link("https://github.com/ChanMeng666", "github.com/ChanMeng666")
      linebreak()
      link("https://cal.com/chan-meng/30min", "cal.com/chan-meng/30min")
    },
  )

  v(8pt)
  line(stroke: 1.8pt + accent, length: 100%)
  v(8pt)
}
