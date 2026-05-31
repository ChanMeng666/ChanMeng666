// Design tokens — restrained-academic, paced like my-cv reference.

// ─── Palette ─────────────────────────────────────────────────────────────────
#let primary   = rgb("#1A3C5E")  // deep navy — name, section headers
#let accent    = rgb("#2E86AB")  // medium blue — underlines, pill borders, links
#let ink       = rgb("#2A2F36")  // body text
#let muted     = rgb("#6B7280")  // dates, captions
#let rule      = rgb("#D6DCE2")  // hairline rules
#let pill-bg   = rgb("#EAF2F7")  // skill pill background (accent.lighten 85%)
#let pill-edge = rgb("#B7D2DE")  // skill pill border (accent.lighten 50%)
#let quote-bg  = rgb("#F4F7FA")

// ─── Typography ──────────────────────────────────────────────────────────────
// System-available Windows fonts (the user's machine ships these; Typst auto-finds them).
// Segoe UI on Windows provides Semibold via weight; one family covers display + body.
#let sans-display = ("Segoe UI", "Arial")
#let sans         = ("Segoe UI", "Arial")
#let mono         = ("Consolas", "Courier New")

#let size-h1      = 24pt
#let size-h2      = 9.8pt       // section header
#let size-h3      = 10pt        // entry title
#let size-role    = 11pt        // role line under name
#let size-body    = 9pt
#let size-meta    = 8pt
#let size-pill    = 7.6pt
#let size-tiny    = 7pt

// ─── Geometry ────────────────────────────────────────────────────────────────
// Reference uses 60/40 with narrative on LEFT. We use the inverse golden ratio
// (0.618 / 0.382) and put narrative on LEFT, structured lists on RIGHT.
#let col-main = 61.8%
#let col-side = 38.2%
#let col-gutter = 1.4em

// ─── Spacing scale (generous — breathing room is the priority) ──────────────
#let space-section    = 12pt   // above each section-header
#let space-after-rule = 7pt    // between section accent rule and first content
#let space-entry      = 12pt   // between entries within a section
#let space-pill-row   = 3pt    // horizontal pill gap
#let leading-body     = 0.78em // base paragraph leading — airy for human readers
#let leading-summary  = 0.85em // summary blocks inside role/project entries
#let leading-tight    = 0.65em // for compact lists (sidebar pills, certs)

// ─── Inter / intra entry gaps (named so designers can find them) ────────────
#let gap-inter-entry  = 12pt   // between consecutive role-lines / experience entries
#let gap-intra-entry  = 7pt    // between meta line (org/dates) and summary inside one entry
#let gap-card-meta    = 6pt    // project-card: between title row and italic context line
#let gap-card-body    = 5pt    // project-card: between italic context line and bullets
