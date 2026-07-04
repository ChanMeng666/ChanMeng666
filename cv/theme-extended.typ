// Spacious design tokens for the EXTENDED (multi-page, single-column) CV.
//
// Re-exports the canonical Caldera palette + font stacks from theme.typ (so the
// extended CV stays perfectly on-brand) and adds a parallel set of *-x size /
// spacing tokens tuned for a roomy, single-column, narrative document.
//
// Design intent (user-requested): MORE breathing room than the 2-page CV —
// larger body type, larger within-paragraph line spacing (leading), and larger
// between-paragraph / between-entry / between-section gaps. This version is NOT
// page-budget-constrained; it is allowed to run several pages.

#import "theme.typ": *   // palette, fonts, radii, pill tokens (primary, accent, ink, muted, sans, sans-display, pill-bg, pill-edge, rule, quote-bg, cv-radius-pill, cv-radius-card, glare …)

// ─── Type sizes — single-column has room, so everything steps up ─────────────
#let size-h1-x      = 34pt    // NAME — Anton
#let size-h2-x      = 15pt    // section header — Anton, mixed-case
#let size-h3-x      = 12pt    // entry title — DM Sans bold
#let size-role-x    = 12.5pt  // role line under name
#let size-lead-x    = 12pt    // manifesto principle lead / emphasis
#let size-body-x    = 10.5pt  // body prose — comfortable single-column reading
#let size-meta-x    = 9.5pt   // org · dates · location · category labels
#let size-pill-x    = 9pt     // skill pills
#let size-tiny-x    = 9pt     // fine print (also-built, footer)

// ─── Leading (within-paragraph line spacing) — airy ──────────────────────────
// Typst par.leading is the GAP between lines (default 0.65em). 0.95em gives a
// clearly open, relaxed measure for long-form reading without feeling sparse.
#let leading-body-x = 1.04em  // within-paragraph line spacing — open, easy to read
#let leading-lead-x = 1.16em  // manifesto / lead paragraphs — the roomiest text

// ─── Structural spacing (between blocks) — generous ──────────────────────────
#let space-section-x    = 26pt   // above each section header — strong breath
#let space-after-rule-x = 11pt   // section rule → first content
#let gap-inter-entry-x  = 20pt   // between experience / project entries
#let gap-intra-entry-x  = 7pt    // meta line → summary inside one entry
#let gap-para-x         = 12pt   // between paragraphs within a block
#let gap-pill-row-x     = 5pt    // horizontal gap between pills
#let gap-pill-line-x    = 0.9em  // wrapped-pill-row leading

// ─── Larger pill radius to match the bigger type ─────────────────────────────
#let cv-radius-pill-x = 7pt
