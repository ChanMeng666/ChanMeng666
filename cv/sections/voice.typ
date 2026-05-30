#import "../theme.typ": *
#import "../components.typ": *

// ─── VOICE & WRITING ─────────────────────────────────────────────────────────
// Differentiated personal-brand surface: podcasts, press, minimalism writing,
// and the Suno music creator handle. Closes the left column as a deliberate
// brand beat — recruiters/HR/founders leave with a multi-dimensional picture,
// not the last technical bullet.
#let voice-and-writing() = section("Voice & Writing", {
  set text(size: size-tiny, fill: ink)
  set par(leading: 0.6em, justify: false)
  set list(
    marker: text(fill: accent)[•],
    spacing: 4pt,
    indent: 0pt,
    body-indent: 6pt,
  )

  list.item[
    *Host of 4 Spotify podcasts* — #emph[Decoding the Future] (English · landmark AI papers · LinkedIn newsletter 800+ subs) · #emph[Future Turing 未来图灵] (Chinese counterpart) · #emph[Praxis and Pages 知行书话] (humanities, NotebookLM-assisted) · #emph[Beyond Thirty 不止三十] (women 30s–40s in long-form conversation).
  ]
  list.item[
    *Guest + press:* #emph[码农姐妹] on Xiaoyuzhou FM (maths-teacher → full-stack engineer transition) · #emph[FemTech At Work — Greater China Ep 21] on Spotify · #link("https://www.thisdaylive.com/2025/05/28/meet-the-femtech-founders-redefining-womens-health-at-work/")[THISDAYLIVE] (May 2025) · #link("https://www.pulsemcp.com/posts/newsletter-remote-mcp-images-screen-recording")[PulseMCP newsletter] · WeChat UN CSW 69 coverage.
  ]
  list.item[
    *Minimalism writing:* Douban feature #emph["A Glimpse of My Minimalist Home"] — *100,000+ reads · 14,000+ shares · 6,520 likes · 795 bookmarks* (Aug 2024) · two LinkedIn essays on minimalism as daily and digital practice.
  ]
  list.item[
    *Music creator:* #link("https://suno.com/@chanmeng666", "\u{0040}chanmeng666 on Suno") — the data engine behind own SunoStats project.
  ]
})
