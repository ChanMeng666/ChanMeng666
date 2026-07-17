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
        weight: "regular",   // Anton is intrinsically ultra-bold; avoid faux-bold
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
      linebreak()
      v(4pt)
      // ── Social-proof stat row — the six metrics merged into FOUR source-
      //    grouped pills (LinkedIn · Newsletter · GitHub · CopilotKit) so the
      //    header reads concise; every number is preserved + bold-accented. ──
      stat-pill-multi[#snum[5,856] LinkedIn followers · #snum[23] recommendations]
      h(space-pill-row)
      stat-pill("1,103", "newsletter subscribers")
      h(space-pill-row)
      stat-pill-multi[#snum[480+] GitHub stars · #snum[218] followers]
      h(space-pill-row)
      stat-pill-multi[CopilotKit contributor · #snum[2] merged PRs · #snum[36.1k] stars]
    },

    // ── Contact items (stacked, LEFT-aligned within the right slot) ────────
    {
      set text(size: size-tiny, fill: ink)
      set par(leading: 0.85em)
      contact-line("mail", "chanmeng.career\u{0040}gmail.com",
        target: "mailto:chanmeng.career@gmail.com")
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
  // Header rule mirrors the section motif: a short orange color-block lead + an
  // ink structural hairline (the accent is a BLOCK, the ink is the RULE).
  grid(
    columns: (46pt, 1fr),
    column-gutter: 7pt,
    align: (left + horizon, left + horizon),
    line(stroke: 2.6pt + accent, length: 100%),            // orange lead block
    line(stroke: 0.7pt + rule.lighten(15%), length: 100%), // ink structural hairline
  )
  v(8pt)
}
