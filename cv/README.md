# cv/ — Chan Meng's Typst-sourced CV

Two-page CV positioned for **AI Agent Architect / agentic-engineer / Anthropic Partner Network** roles. Rendered by [Typst](https://typst.app/) from this folder; emits the canonical PDF, two GEO sibling artifacts (JSON-LD and an agent-readable plain-text summary), and a plain single-column ATS resume for job-portal uploads.

The README's "Resume" pill in [`templates/partials/footer.hbs`](../templates/partials/footer.hbs) links to `public/chan-meng-cv.pdf`. This folder regenerates that file in place — the URL never changes.

## Build

```powershell
pwsh cv/build.ps1
```

This compiles three PDFs and emits the GEO siblings. Everything lands in `public/` **except** the ATS resume, which is tracked but deliberately kept off the web-served path. Outputs:

| File | Purpose |
| --- | --- |
| `public/chan-meng-cv.pdf` | Canonical 2-page CV (linked from the README) |
| `public/chan-meng-cv-extended.pdf` | 16-page «Subtraction / Addition» magazine companion |
| `cv/exports/chan-meng-cv-ats.pdf` | 2-page single-column ATS resume — photo-free, black text only, clickable links. **Not** web-served, not linked anywhere; manual upload only. See [`exports/README.md`](./exports/README.md) |
| `public/cv.jsonld` | schema.org Person + WorkExperience JSON-LD — recruiter LLMs (LinkedIn AI Search, Greenhouse AI ranking, Jobright) parse this directly |
| `public/cv-llms.txt` | Plain-text agent-readable summary mirroring the [llms.txt](https://llmstxt.org/) convention |

`public/chan-meng-cv-extended.pdf` is the 16-page image-led magazine companion to the 2-page CV, built by the same `pwsh cv/build.ps1`; its unshot/upgradeable photos are tracked in [`assets/extended/SHOT-LIST.md`](./assets/extended/SHOT-LIST.md).

Requires [Typst 0.14+](https://typst.app/) and Node.js 22+ on PATH.

## File map

```
cv/
├── chan-meng-cv.typ           # entry point — 2-page CV: geometry, PDF metadata, layout
├── theme.typ                  # design tokens (colors, fonts, spacing)
├── components.typ             # reusable: project-card, pill, section-header, ...
├── sections/                  # 2-page CV body sections
│   ├── header.typ
│   ├── sidebar.typ
│   ├── projects.typ
│   ├── experience.typ
│   ├── recognition.typ
│   └── footer.typ
├── chan-meng-cv-extended.typ  # entry point — 16-page «Subtraction / Addition» magazine
├── extended.typ               # magazine chapter content (x-cover … x-backcover)
├── extended-components.typ    # magazine primitives: photo, article-card, avatar-wall, …
├── theme-extended.typ         # spacious *-x tokens + magazine tokens
├── chan-meng-cv-ats.typ       # entry point — plain single-column ATS resume (content lives here)
├── ats-components.typ         # style-free renderers: role-line, skills-line, project-entry
├── exports/                   # TRACKED manual-upload deliverables (NOT web-served)
│   └── chan-meng-cv-ats.pdf
├── assets/
│   ├── extended/              # curated+compressed magazine photos + MANIFEST + SHOT-LIST
│   └── thumbs/                # legacy small screenshots
├── build.ps1                  # one-shot build (all three PDFs + JSON-LD + llms.txt)
├── build-jsonld.mjs           # data/profile/*.yaml → schema.org JSON-LD
├── build-llms-txt.mjs         # data/profile/*.yaml → agent-readable summary
└── README.md
```

## Source of truth

Where possible, content is sourced from [`../data/profile/`](../data/profile/) — the same single-source-of-truth that builds the GitHub profile README. The Typst sections currently hardcode hero project narratives (so they can include architect-grade vocabulary like "PostToolUse hook" and "hub-and-spoke coordinator" that doesn't belong in profile.yaml), but the JSON-LD and `cv-llms.txt` generators pull directly from YAML.

## Word blacklist (strip before compile)

These phrases trip AI-resume detectors and trigger up to 49% auto-dismissal. Do **not** introduce them into any section file:

- `delve`, `realm`, `intricate`, `showcasing`, `pivotal`
- `leveraged X to drive Y`, `leveraged ... synergies`
- `results-driven`, `passionate`, `dynamic professional`
- `prompt engineer` as a job title (use `agentic engineer` / `context engineer`)

## Architect-grade vocabulary (deliberately present)

The CV mirrors the Claude Certified Architect — Foundations curriculum vocabulary so that recruiter LLMs reading the Anthropic Partner Network JD recognise the same phrase patterns. Keep these terms in the source:

- *Claude Agent SDK · AgentDefinition · Task tool · hub-and-spoke · PostToolUse hook · PreToolUse hook · stop_reason · tool_use · JSON Schema · MCP server · MCP gateway · A2A · AGNTCY · agentic engineer · orchestrator of agents · case-facts block · scratchpad files · structured error propagation · errorCategory · isRetryable · claim-source provenance · scoped subagent tools · context: fork · plan mode · `-p` + `--output-format json`*.

The Anthropic Forward Deployed Engineer JD phrase `shipped MCP servers, sub-agents, and agent skills to production` appears verbatim in the summary so LLM-based screeners get an exact phrase-match.

## Anti-patterns deliberately absent

- No invisible prompt-injection text. Greenhouse-class screeners detect this and auto-reject. (The ATS resume goes further and carries no `/Keywords` metadata at all — a 70-term hidden list is plainly legible in `pdfinfo` and reads as keyword stuffing.)
- The 2-page CV **is** a two-column design, and its raw extraction order does interleave — measurable with `pdftotext -raw public/chan-meng-cv.pdf -`, where the sidebar heading "What I Bring to a Team" lands right after "Introduction" and its bullets appear ~1,200 words later. That is an accepted trade for a human-facing document. Machine parsing is served by a dedicated single-column variant instead: `cv/exports/chan-meng-cv-ats.pdf`.

## ATS variant — hard rules

`cv/chan-meng-cv-ats.typ` + `cv/ats-components.typ` exist to be read by machines. Every rule below was chosen against measured extractor behaviour; do not relax one for looks.

- **Single column, no grids, no tables.** Grids are the most common cause of scrambled reading order. Dates are stacked under the org line, never right-aligned.
- **No images, no icons, no boxes, no colour.** `pdfimages -list` on the output must return zero rows. Full-width hairline rules under section headings ARE allowed — a rule spanning the whole measure cannot be read as a column boundary the way a vertical or short inline rule can.
- **No italics** — `cv/fonts` has no DM Sans Italic, so italic here is a synthesized oblique.
- **Links are real, but their visible text never becomes decorative.** Every `link()` shows the bare URL, the company name, or the project name; the annotation sits on top of unchanged text, so an extractor loses nothing while a human never has to retype a URL. Links are underlined in black — the affordance must be visible without introducing colour. Never hide a URL behind words like "here" or "portfolio".
- **No page header or footer.** Legacy parsers either drop those runs or splice them into the body stream between pages.
- **`hyphenate: false` is NOT enough on its own.** It only disables *automatic* hyphenation; Typst still breaks lines at an *explicit* hyphen, and `pdftotext` then deletes a hyphen sitting at a line end. Measured: `AI-native` → `AInative` (designed CV), `web-vitals` → `webvitals`, `multi-user` → `multiuser`, `gpt-5.4-mini` → `gpt-5.4mini` (first build of the ATS file). The fix in place is `#show regex("[\w.]+(-[\w.]+)+"): it => box(it)`, which removes the break opportunity inside every hyphenated compound. Also avoid a bare ` - ` mid-sentence — `Architect - Foundations` extracted as `Architect Foundations`. Use a colon or parentheses.
- **Commas, never spaces, between list items.** The designed CV's skill pills extract as `Status line Plugins` — two skills indistinguishable from one.
- **ASCII throughout where meaning allows**: `-` bullet markers, `-` date ranges, `|` separators, straight quotes (`smartquote` disabled). Māori macrons stay — they carry meaning and extract byte-exact.
- **3-letter months** (`Mar 2025 - Feb 2026`). `scripts/check-cv-sync.mjs` derives the expected range with 3-letter months; `March` fails the gate.
- **One contact item per line.** The designed CV's stacked contact column extracts as one undelimited run of five fields.
- **Only section names a parser's lexicon knows**: `PROFESSIONAL SUMMARY`, `TECHNICAL SKILLS`, `PROFESSIONAL EXPERIENCE`, `PROJECTS`, `EDUCATION`, `CERTIFICATIONS`, `AWARDS AND RECOGNITION`. Anything else gets absorbed into the neighbouring section.
- **Native `= HEADING`; a transforming show rule must RE-EMIT `it`.** Typst tags PDFs by default, so `=` emits a real `/H1`. The rule that attaches the hairline wraps `it` in a block rather than rebuilding the heading from `it.body`, which keeps the tag. Re-verify the `/H1` count with pypdf after touching that rule.
- **Escape `\@` in emails and `\~` before numbers** (see [`TYPST_PITFALLS.md`](./TYPST_PITFALLS.md) §9, §10).

**Two pages is the budget**, and the content is shaped to it rather than the other way round:

- The five *current* roles carry one bullet each. Sanicle (ended Feb 2026, but CTO plus the IBM Silver Partner result) carries one. The three older roles — Forward with Her, ByteDance, CORDE — are single-line entries under an "Earlier experience" sub-label: title, org, location and dates are all still present and delimited, so a parser extracts them as employment identically; only the prose is gone. That compression is what took the document from 4 pages to 2.
- Job title and dates share two lines, not three (dates ride the org line behind a `|`). Contact items share two delimited lines, not seven — safe only *because* the separator is an explicit `|`; the failure measured in the designed CV was items running together with nothing but whitespace between them.
- One sentence per bullet. If a role seems to need two, cut the second — never the metric.
- Before adding anything, decide what comes out, then re-check the page count.

**Spacing** is driven by one scale at the top of `ats-components.typ` (`gap-section` / `gap-rule` / `gap-entry` / `gap-intra` / `gap-line` / `gap-compact`). Change the scale, not individual call sites, so the rhythm stays proportional: a section break must read as clearly larger than an entry break, which must read as clearly larger than a line break inside an entry. Entry headers are `sticky: true` so a job title never orphans at the foot of a page with its bullets stranded overleaf.

Definition of done for this file: **2 pages** · `pdfinfo` reports `Tagged: yes` · pypdf finds 7 `/H1` elements · every `pdffonts` row shows `uni=yes` · `pdfimages -list` empty · poppler, xpdf, and pypdf all recover the 7 section headings in order · the hyphenated-keyword grep is clean · `node scripts/check-cv-sync.mjs --strict` passes.

## Regenerating

Whenever `data/profile/*.yaml` changes (work entries, recommendations, project metrics), rerun `pwsh cv/build.ps1` to refresh `public/chan-meng-cv.pdf` + the JSON-LD and llms.txt siblings.

## Before editing any `.typ` file — read [`TYPST_PITFALLS.md`](./TYPST_PITFALLS.md)

That file documents eight non-obvious Typst layout bugs that have already been fixed in this CV and **must not be reintroduced**. Notable: `v(N, weak: true)` after `linebreak()` silently renders as zero (use `block(below: ...)` instead); `block` margins are max-not-sum; list `spacing` must be ≥ 1.7× of within-item leading or bullets blur into one paragraph. Every entry / project / bullet in the CV depends on these rules.
