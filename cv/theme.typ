// Design tokens for the CV — thin adapter over cv/tokens.typ (generated from
// data/brand.yaml). Colors and font stacks come from the brand system so the
// CV stays in sync with README, llms, and the future webpage.
//
// CV PRINT is "tuned-for-print": it adopts the Caldera palette + the ultra-bold
// compact display face (Bebas Neue) for the NAME and section headers, and uses
// Digital Orange as an accent RULE / eyebrow only — never as orange-filled
// blocks or 800px pills, which would hurt recruiter / ATS readability. Print
// sizes, the desaturated meta-grey, and the small pill radius stay LOCAL to
// this file because they are print-only and not part of the cross-surface scale.
//
// Regenerate brand tokens via:   npm run build:brand

#import "tokens.typ": *

// ─── Palette (back-compat aliases — section files import these names) ────────
#let primary   = ink-strong         // abyssal ink — name, section headers
#let accent    = accent-primary     // digital orange — accent RULE / eyebrow ONLY
#let ink       = ink-primary        // body text
#let muted     = rgb("#5B5B59")     // CV-LOCAL desaturated ink — dates, captions
                                    //   (Caldera has no grey ink; pure ink is too
                                    //    heavy on a dense PDF. ≈4.7:1 on basalt → AA.)
#let rule      = rule-hairline      // abyssal ink — strong borders / rules
#let pill-bg   = surface-pill       // ash white — skill pill background
#let pill-edge = edge-pill          // abyssal ink — skill pill / ghost border
#let quote-bg  = surface-quote      // ash white — pull-quote background
#let on-accent = on-accent          // pure white — text on a single orange chip

// ─── Typography (back-compat aliases) ───────────────────────────────────────
#let sans-display = font-display    // Bebas Neue — NAME + section headers
#let sans         = font-body-sans  // DM Sans — body, meta, labels
#let mono         = font-mono       // JetBrains Mono — datestamp only

// ─── Type sizes — print-tuned, CV-specific (NOT in brand.yaml web scale) ────
// Bebas Neue is a compact condensed face and reads SMALLER than a normal sans
// at the same point size, so the display sizes are pushed up vs the old serif.
#let size-h1      = 30pt        // NAME — Bebas Neue, all-caps by design
#let size-h2      = 12pt        // section header — Bebas Neue, uppercased
#let size-h3      = 10pt        // entry title — DM Sans bold
#let size-role    = 10.5pt      // role line under name — DM Sans
#let size-body    = 9pt
#let size-meta    = 8pt
#let size-pill    = 7.6pt
#let size-tiny    = 7pt

// ─── Geometry (golden-ratio aliases from brand.yaml) ────────────────────────
#let col-main = golden-main
#let col-side = golden-side
#let col-gutter = golden-gutter

// ─── Print radii — deliberately small. Do NOT inherit the 800px web pill. ───
#let cv-radius-pill = 4pt      // skill pills stay subtle on the page
#let cv-radius-card = 6pt

// ─── Spacing scale (print-tuned, CV-specific) ───────────────────────────────
// Tightened in the v2 Caldera pass so the whole CV settles into TWO pages while
// keeping airy human-readable leading inside paragraphs (density comes out of
// the inter-section / inter-entry gaps, not the line-height).
#let space-section    = 10pt   // above each section-header
#let space-after-rule = 5pt    // between section accent rule and first content
#let space-entry      = 10pt   // between entries within a section
#let space-pill-row   = 3pt    // horizontal pill gap
#let leading-body     = 0.78em // base paragraph leading — airy for human readers
#let leading-summary  = 0.85em // summary blocks inside role/project entries
#let leading-tight    = 0.65em // for compact lists (sidebar pills, certs)

// ─── Inter / intra entry gaps (named so designers can find them) ────────────
#let gap-inter-entry  = 9pt    // between consecutive role-lines / experience entries
#let gap-intra-entry  = 7pt    // between meta line (org/dates) and summary inside one entry
#let gap-card-meta    = 6pt    // project-card: between title row and italic context line
#let gap-card-body    = 5pt    // project-card: between italic context line and bullets
