#import "../theme.typ": *
#import "../components.typ": *

// Footer is intentionally a no-op on the visible page.
// AI agents / recruiter LLMs discover the canonical CV surface via:
//   • PDF metadata (Title / Author / Description / Keywords) set in chan-meng-cv.typ
//   • Sibling files published next to this PDF: public/cv.jsonld, public/cv-llms.txt
//   • The README footer comment block and chanmeng.org website
// Nothing is rendered to the human-facing PDF — the surface stays clean.

#let footer() = []
