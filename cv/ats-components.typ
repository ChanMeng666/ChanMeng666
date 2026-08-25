// ─────────────────────────────────────────────────────────────────────────────
// Plain renderers for the ATS resume (cv/chan-meng-cv-ats.typ).
//
// Still no images, no grids, no tables, no colour, no italics, no boxes.
// Bold, thin black horizontal rules, and underlined links are the ONLY
// decoration permitted — each is a plain text run or a full-width horizontal
// line, neither of which confuses a layout analyser in a single-column
// document. A full-width rule cannot be mistaken for a column boundary the way
// a vertical rule or a short inline rule can.
//
// LINKS: every link's VISIBLE TEXT is still the thing a parser needs (the bare
// URL, the company name, the project name). The link() only adds a /Annots
// /Link annotation on top — the text stream is unchanged, so nothing is lost to
// an extractor while a human gets a clickable target instead of a URL to
// retype.
//
// `role-line` deliberately keeps the SAME named parameters and the same
// one-argument-per-line call formatting as cv/components.typ::role-line,
// because scripts/check-cv-sync.mjs parses BOTH cv/sections/experience.typ and
// cv/chan-meng-cv-ats.typ with one regex pair:
//     /role-line\(([\s\S]*?)\n\s*\)/g   and   /<field>:\s*"([^"]*)"/
// Renaming a parameter, or collapsing a call onto fewer lines, breaks that
// guard. The helper lives in THIS file rather than the entry point so the
// `#let role-line(` definition itself is never seen by the guard — it would
// otherwise match as a phantom entry with org: "" and warn.
//
// Deliberately exempt from cv/TYPST_PITFALLS.md §1–§4 and §6. §9 (escape `\~`)
// and §10 (escape `\@`, no hyphen at a line end, commas not spaces between
// list items) DO apply — those are content-level, not layout-level.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Spacing scale ───────────────────────────────────────────────────────────
// One place to dial the whole document's breathing room. Every gap below is
// expressed as one of these so the rhythm stays proportional: a section break
// reads as clearly larger than an entry break, which reads as clearly larger
// than a line break inside an entry.
// The ladder, smallest to largest, each step clearly bigger than the last:
//   6.8pt  within a wrapped line   (par.leading 0.68em at 10pt, set in the entry point)
//   8.5pt  between bullets         (list.spacing, set in the entry point)
//   12pt   between entries         (gap-entry)
//   17pt   between sections        (gap-section)
// If you change one, walk the whole ladder — the hierarchy is the point.
//
// These are the TWO-PAGE settings. The document was drafted at a roomier scale
// (0.72em / 13 / 19 / 28 at 10.5pt) and ran to 4 pages; getting to 2 cost both
// content and air. If the page budget is ever relaxed, scale all five back up
// together rather than reaching for one of them.
#let gap-section = 14pt   // above a section heading
#let gap-rule = 6pt       // below the heading's rule, before the first content
#let gap-entry = 10pt     // between two employment / project / education entries
#let gap-intra = 4pt    // identity lines → bullets inside one entry
#let gap-line = 5pt     // between the one-line skill / certification rows
#let gap-compact = 3.5pt    // between single-line earlier-experience entries

// ─── Horizontal rule ─────────────────────────────────────────────────────────
// Full width, hairline, pure black. Used under section headings only — enough
// structure to separate sections at a glance without becoming a box.
#let hrule() = line(length: 100%, stroke: 0.5pt + black)

// ─── Section heading ─────────────────────────────────────────────────────────
// Not a helper: the entry point uses native `= HEADING` so Typst emits a real
// /H1 structure element into the PDF tag tree. The rule underneath is attached
// by a show rule there that RE-EMITS `it` rather than rebuilding the heading,
// which keeps the /H1 tag. Verified with pypdf after every change.

// ─── Employment entry ────────────────────────────────────────────────────────
// Renders as three stacked lines, never a grid:
//     Chief Technology Officer
//     Sanicle | Tulsa, Oklahoma, United States | Remote
//     Mar 2025 - Feb 2026
//     - bullet
// Dates are stacked, NOT right-aligned: right-alignment requires a grid, which
// is the single most common way a resume's reading order gets scrambled.
#let role-line(
  title: "",
  org: "",
  org-url: "",      // also the drift guard's anchor — keep it a quoted literal
  dates: "",
  location: "",
  arrangement: "",
  bullets: (),
  compact: false,   // true → the whole role on ONE line, no bullets
) = block(above: 0pt, below: if compact { gap-compact } else { gap-entry }, {
  // The company name is the link target — its visible text is unchanged, so an
  // extractor still reads "Sanicle", not a URL.
  let org-text = if org-url != "" { link(org-url, org) } else { org }
  let meta = (location, arrangement, dates).filter(s => s != none and s != "")

  if compact {
    // Earlier roles: "Title, Org | Location | Dates" on one line. Every field a
    // parser needs is still present and delimited — only the bullets are gone.
    block(above: 0pt, below: 0pt, {
      strong(title + ", ")
      org-text
      if meta.len() > 0 { [ | ] + meta.join(" | ") }
    })
  } else {
    // Two identity lines, not three: dates ride the org line behind a "|"
    // delimiter. Unbreakable so a page break can never split a title from its
    // dates, and sticky so the header cannot orphan at the foot of a page with
    // its bullets stranded overleaf. Dates are NOT right-aligned — grids are
    // the single most common way a resume's reading order gets scrambled.
    block(
      above: 0pt,
      below: if bullets.len() > 0 { gap-intra } else { 0pt },
      breakable: false,
      sticky: true,
      {
      strong(title)
      linebreak()
      org-text
      if meta.len() > 0 { [ | ] + meta.join(" | ") }
      },
    )
    for b in bullets { list.item(b) }
  }
})

// ─── Employment entry with no work[] counterpart ─────────────────────────────
// Same rendering, deliberately a DIFFERENT name so scripts/check-cv-sync.mjs
// neither parses nor warns about a role that has no id in 10-career.yaml.
#let extra-role(
  title: "",
  org: "",
  org-url: "",
  dates: "",
  location: "",
  arrangement: "",
  bullets: (),
  compact: false,
) = role-line(
  title: title, org: org, org-url: org-url, dates: dates,
  location: location, arrangement: arrangement, bullets: bullets, compact: compact,
)

// ─── "Label: a, b, c" on one wrapping paragraph ──────────────────────────────
// MEASURED: the designed CV's skill pills extract space-separated
// ("Status line Plugins"), so two skills become indistinguishable from one.
// Commas restore the token boundary for keyword matchers.
#let skills-line(label, items) = block(above: 0pt, below: gap-line, {
  strong(label + ": ")
  items.join(", ")
})

// ─── Project entry ───────────────────────────────────────────────────────────
// Name and URL share one line, both clickable. The URL stays VISIBLE rather
// than being hidden behind the name: it survives printing and text-only
// extraction, and the annotation on top means nobody has to retype it.
#let project-entry(name: "", url: "", target: "", body) = block(
  above: 0pt, below: gap-entry,
  {
    block(above: 0pt, below: gap-intra, breakable: false, {
      let dest = if target != "" { target } else { url }
      if dest != "" { strong(link(dest, name)) } else { strong(name) }
      if url != "" {
        [ | ]
        if dest != "" { link(dest, url) } else { url }
      }
    })
    body
  },
)

// ─── Education entry ─────────────────────────────────────────────────────────
// One wrapping line: "Degree, School | Dates | Note".
#let education-entry(degree: "", school: "", school-url: "", dates: "", note: "") = block(
  above: 0pt, below: gap-compact, breakable: false,
  {
    strong(degree + ", ")
    if school-url != "" { link(school-url, school) } else { school }
    let rest = (dates, note).filter(s => s != none and s != "")
    if rest.len() > 0 { [ | ] + rest.join(" | ") }
  },
)
