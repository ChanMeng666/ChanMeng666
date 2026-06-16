// =============================================================================
// MEDIA-KIT THEME — landscape, editorial, image-forward over the Caldera brand.
// =============================================================================
// Re-exports the brand color + font aliases from the CV (which are generated
// from data/brand.yaml via cv/tokens.typ) so the kit stays palette-locked to
// the rest of the brand. Overrides ONLY the geometry + type scale.
//
// Design intent (2026-06 redesign): a magazine-grade speaker kit — large
// full-bleed / half-page imagery, generous white space, loose leading, and
// concise copy. Pages alternate between framed "content" pages and edge-to-edge
// "bleed" pages (cover, image splits, the closing spread).
//
// Build (from repo root):
//   typst compile --root . --font-path cv/fonts \
//     media-kit/chan-meng-media-kit.typ public/chan-meng-media-kit.pdf
// =============================================================================

#import "../cv/theme.typ": *
// Available via the re-export above: primary, accent, ink, muted, pill-bg,
// quote-bg, on-accent, glare, sans-display, sans, mono, canvas-page (#E2E2DF),
// canvas-surface (#F7F6F2), surface-decor / raw-cyber-violet (#524AE9),
// raw-pixel-glare (#F5F28E).

// ─── Marketing type scale ────────────────────────────────────────────────────
#let mk-display = 58pt   // cover NAME — Anton
#let mk-title   = 34pt   // big page / closing titles
#let mk-h1      = 24pt   // section heads
#let mk-h2      = 16pt   // card titles / band titles
#let mk-h3      = 12.5pt // sub-card titles
#let mk-lead    = 13pt   // lead paragraphs / taglines
#let mk-body    = 10.5pt // body copy
#let mk-small   = 9.5pt  // dense body
#let mk-meta    = 8.5pt  // captions / labels
#let mk-tiny    = 7.5pt  // micro labels

// ─── Page geometry (A4 landscape) ────────────────────────────────────────────
#let mk-page-w = 297mm
#let mk-page-h = 210mm
#let mk-margin = (top: 1.55cm, bottom: 1.35cm, left: 1.7cm, right: 1.7cm)
#let mk-pad    = 1.7cm   // interior padding used on edge-to-edge (bleed) pages

// ─── Component geometry ──────────────────────────────────────────────────────
#let mk-radius      = 13pt   // cards
#let mk-radius-tile = 9pt    // small tiles / chips
#let mk-gap         = 20pt   // inter-block rhythm (was 14pt — more air)

// A soft hairline for cards on the basalt canvas.
#let mk-hair = 0.6pt + ink.lighten(12%)

// ─── Default leading (loose, for breathing room) ─────────────────────────────
#let mk-lead-loose = 0.92em   // body paragraphs
#let mk-lead-tight = 0.78em   // dense card copy

// ─── Page wrapper — A4 landscape on basalt canvas ────────────────────────────
// Sets only document + text + heading defaults. Each page sets its own `page`
// config (framed via mk-margin, or edge-to-edge via margin: 0) so the kit can
// freely mix bleed imagery with framed content.
#let mk-doc(body) = {
  set document(title: "Chan Meng — Speaker & Media Kit", author: "Chan Meng")
  set page(
    paper: "a4",
    flipped: true,
    margin: mk-margin,
    fill: canvas-page,
  )
  set text(font: sans, size: mk-body, fill: ink, lang: "en")
  set par(leading: mk-lead-loose, spacing: 1.5em, justify: false)
  // Anton is intrinsically heavy — never faux-bold it.
  show heading: set text(font: sans-display, weight: "regular", fill: primary)
  body
}
