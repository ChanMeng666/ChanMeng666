// Design tokens for the CV — thin adapter over cv/tokens.typ (generated from
// data/brand.yaml). Colors and font stacks come from the brand system so the
// CV stays in sync with README, llms, and the future webpage.
//
// CV PRINT is "tuned-for-print": it adopts the Caldera palette + the heavy
// compact-grotesque display face (Anton) for the NAME and section headers, and
// uses Digital Orange as an accent RULE / eyebrow only — never as orange-filled
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
#let glare     = raw-pixel-glare    // Hazard-Yellow — restrained highlight (ink-on-yellow only)

// ─── Typography (back-compat aliases) ───────────────────────────────────────
#let sans-display = font-display    // Anton — NAME + section headers
#let sans         = font-body-sans  // DM Sans — body, meta, labels
#let mono         = font-mono       // JetBrains Mono — datestamp only

// ─── Type sizes — print-tuned, CV-specific (NOT in brand.yaml web scale) ────
// Anton is a heavy compact-grotesque face and reads SMALLER than a normal sans
// at the same point size, so the display sizes are pushed up vs the old serif.
// v2.2 TYPOGRAPHIC SYSTEM: 10 ad-hoc sizes collapsed to 7 clear ROLES so the
// page reads as one system. size-entry is the single token for EVERY entry
// title (role-lines, project-card names, compact-entry titles); size-body is
// THE single reading size (experience summaries + project bullets + intro all
// share it — no more per-surface 7.4 / 9 splits).
#let size-h1      = 28pt        // NAME — Anton, mixed-case (heavier/wider than Bebas)
#let size-h2      = 11pt        // section header — Anton, uppercased (Anton's heavier
                                //   cut needs a hair less size than Bebas to hold 2 pages)
#let size-entry   = 9.5pt       // ALL entry titles — role-line / project-card / compact
#let size-h3      = size-entry  // deprecated alias — kept so old imports still resolve
#let size-role    = 10.5pt      // header role line under name (header-local, untouched)
#let size-body    = 8.4pt       // THE single reading size — summaries, bullets, intro
#let size-meta    = 8pt         // org lines, dates pairs, context-lines, sidebar bullets
#let size-pill    = 7.6pt
#let size-tiny    = 7pt          // dates, Previously/Also-built closers, footnotes

// ─── Geometry (golden-ratio aliases from brand.yaml) ────────────────────────
#let col-main = golden-main
#let col-side = golden-side
#let col-gutter = golden-gutter

// ─── Print radii — friendly but restrained. Do NOT inherit the 800px web pill;
//     bumped a touch in the v2.1 polish so pills/cards read as the brand's
//     rounded geometry without ballooning on a dense page. ───
#let cv-radius-pill = 6pt      // skill pills — gently rounded
#let cv-radius-card = 9pt      // quote / callout cards

// ─── Spacing scale (print-tuned, CV-specific) ───────────────────────────────
// v2.1.2 readability pass: the scale is built on a clear THREE-TIER rhythm so a
// human reader's eye instantly parses structure —
//   section gap (12pt)  ≫  inter-entry gap (12pt)  >  intra-entry gap (5pt)  >  line leading
// Density is bought back from the intra-entry gaps (tight, so a title binds to
// its own body) and spent on the section / inter-entry gaps (generous, so the
// blocks separate cleanly). Net height is ~neutral but the hierarchy reads far
// more clearly than the old flat, evenly-packed rhythm.
// v2.2 rhythm: one 4pt-modular scale, ratio ≈1.5 line-height on the single body
// size. leading-body drives intro / experience summaries / project bullets;
// leading-meta drives the wrapping meta/context lines a notch tighter.
#let space-section    = 16pt   // above each section-header — top structural cue
                               //   (LEFT column only — right sidebar sections pass
                               //    explicit per-section top-gaps via `sec`/`section`)
#let space-after-rule = 6pt    // between section accent rule and first content — a little air
#let space-entry      = 11pt   // between entries within a section
#let space-pill-row   = 3pt    // horizontal pill gap
#let leading-body     = 0.5em  // THE reading leading — 8.4pt → 12.6pt lines, ratio 1.5
#let leading-meta     = 0.45em // wrapping meta / project-card context lines
#let leading-summary  = leading-body // deprecated alias (summaries now use leading-body)
#let leading-tight    = 0.68em // for compact lists (sidebar pills, certs)

// ─── Inter / intra entry gaps (named so designers can find them) ────────────
// Three-tier rhythm INSIDE Experience so a job reads as one airy unit and jobs
// separate cleanly: title→org (≈4pt, see role-line) < org→summary (intra 7pt) ≪
// between-jobs (inter 16pt). The intra gap is deliberately NON-tiny — the three
// lines of one job are distinct paragraphs and need to breathe — while inter is
// well over 2× intra so the eye never binds a title to the job above.
#let gap-inter-entry  = 14pt   // between consecutive role-lines / experience entries (≈2.8× intra)
#let gap-intra-entry  = 5pt    // between meta line (org/dates) and summary inside one entry
#let gap-card-meta    = 6pt    // project-card: between title row and italic context line
#let gap-card-body    = 6pt    // project-card: between italic context line and bullets
