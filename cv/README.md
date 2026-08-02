# cv/ — Chan Meng's Typst-sourced CV

Two-page CV positioned for **AI Agent Architect / agentic-engineer / Anthropic Partner Network** roles. Rendered by [Typst](https://typst.app/) from this folder; emits the canonical PDF, two GEO sibling artifacts (JSON-LD and an agent-readable plain-text summary), and a plain single-column ATS resume for job-portal uploads — the last of which also ships as a Word document and a plain-text file.

The README's "Resume" pill in [`templates/partials/footer.hbs`](../templates/partials/footer.hbs) links to `public/chan-meng-cv.pdf`. This folder regenerates that file in place — the URL never changes.

## Build

```powershell
pwsh cv/build.ps1
```

This compiles three PDFs, emits the GEO siblings, and writes the ATS resume's Word and plain-text exports. Everything lands in `public/` **except** the ATS artifacts, which are tracked but deliberately kept off the web-served path. Outputs:

| File | Purpose |
| --- | --- |
| `public/chan-meng-cv.pdf` | Canonical 2-page CV (linked from the README) |
| `public/chan-meng-cv-extended.pdf` | 16-page «Subtraction / Addition» magazine companion |
| `cv/exports/chan-meng-cv-ats.pdf` | 2-page single-column ATS resume — photo-free, black text only, clickable links. **Not** web-served, not linked anywhere; manual upload only. See [`exports/README.md`](./exports/README.md) |
| `cv/exports/chan-meng-cv-ats.docx` | The **default upload artifact** — same resume as a real Word document, parsed out of `chan-meng-cv-ats.typ`, not hand-maintained |
| `cv/exports/chan-meng-cv-ats.txt` | Plain UTF-8 of the same content for "paste your resume" fields |
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
├── ats-txt.mjs                # renderer: parsed ATS model → plain UTF-8
├── ats-docx.mjs               # renderer: parsed ATS model → OOXML (Heading1, w:numPr, w:hyperlink)
├── build-ats-exports.mjs      # CLI: .typ → exports/*.docx + *.txt; owns writing + the determinism freeze
├── exports/                   # TRACKED manual-upload deliverables (NOT web-served)
│   ├── chan-meng-cv-ats.pdf
│   ├── chan-meng-cv-ats.docx  # GENERATED — never hand-edit
│   └── chan-meng-cv-ats.txt   # GENERATED — never hand-edit
├── assets/
│   ├── extended/              # curated+compressed magazine photos + MANIFEST + SHOT-LIST
│   └── thumbs/                # legacy small screenshots
├── build.ps1                  # one-shot build (all three PDFs + JSON-LD + llms.txt)
├── build-jsonld.mjs           # data/profile/*.yaml → schema.org JSON-LD
├── build-llms-txt.mjs         # data/profile/*.yaml → agent-readable summary
└── README.md
```

Two of the ATS export's parts live under `scripts/lib/` because they are
scanning machinery, not CV content:

```
scripts/lib/
├── typst-ast.mjs              # comment/string-aware Typst scanning primitives
│                              # (stripComments, scanBalanced, callBodies, stringArg, …) —
│                              # hardened generalisations of the regexes check-cv-sync.mjs
│                              # already runs over the same file
└── parse-ats-resume.mjs       # ordered left-to-right scan of chan-meng-cv-ats.typ → data model;
                               # throws with a line number on any unrecognised construct
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
- **Every contact item explicitly delimited** — a literal ` | ` between items, never a plain space or a bare line break. Items may then share a line (they do; see the page budget below). The designed CV's stacked contact column has no delimiter and extracts as one undelimited run of five fields.
- **A document date must be PRESENT, and pinned.** `cv/chan-meng-cv-ats.typ` sets `date: datetime(year: …, month: …, day: …)`, never `auto` and never `none`. A PDF with no `/CreationDate` and no `/ModDate` is a known trip-hazard for legacy resume parsers and was the clearest structural anomaly in the file Lever refused on 2026-08-03. Pinning keeps what `date: none` was protecting — this PDF is committed, so identical input must produce identical bytes (verified: two builds, identical SHA-256). Bump it by hand when the resume's *content* changes; it is the document's revision date, not the build's wall clock.
- **Only section names a parser's lexicon knows**: `PROFESSIONAL SUMMARY`, `TECHNICAL SKILLS`, `PROFESSIONAL EXPERIENCE`, `PROJECTS`, `EDUCATION`, `CERTIFICATIONS`, `AWARDS AND RECOGNITION`. Anything else gets absorbed into the neighbouring section.
- **Native `= HEADING`; a transforming show rule must RE-EMIT `it`.** Typst tags PDFs by default, so `=` emits a real `/H1`. The rule that attaches the hairline wraps `it` in a block rather than rebuilding the heading from `it.body`, which keeps the tag. Re-verify the `/H1` count with pypdf after touching that rule.
- **Escape `\@` in emails and `\~` before numbers** (see [`TYPST_PITFALLS.md`](./TYPST_PITFALLS.md) §9, §10).

**Two pages is the budget**, and the content is shaped to it rather than the other way round:

- The five *current* roles carry one bullet each. Sanicle (ended Feb 2026, but CTO plus the IBM Silver Partner result) carries one. The three older roles — Forward with Her, ByteDance, CORDE — are single-line entries under an "Earlier experience" sub-label: title, org, location and dates are all still present and delimited, so a parser extracts them as employment identically; only the prose is gone. That compression is what took the document from 4 pages to 2.
- Job title and dates share two lines, not three (dates ride the org line behind a `|`). Contact items share two delimited lines, not seven — safe only *because* the separator is an explicit `|`; the failure measured in the designed CV was items running together with nothing but whitespace between them.
- One sentence per bullet. If a role seems to need two, cut the second — never the metric.
- Before adding anything, decide what comes out, then re-check the page count.

**Spacing** is driven by one scale at the top of `ats-components.typ` (`gap-section` / `gap-rule` / `gap-entry` / `gap-intra` / `gap-line` / `gap-compact`). Change the scale, not individual call sites, so the rhythm stays proportional: a section break must read as clearly larger than an entry break, which must read as clearly larger than a line break inside an entry. Entry headers are `sticky: true` so a job title never orphans at the foot of a page with its bullets stranded overleaf.

Definition of done for the PDF: **2 pages** · `pdfinfo` reports `Tagged: yes` · `pdfinfo` shows `CreationDate` + `ModDate` · pypdf finds 7 `/H1` elements · every `pdffonts` row shows `uni=yes` · `pdfimages -list` empty · poppler, xpdf, and pypdf all recover the 7 section headings in order · the hyphenated-keyword grep is clean · `node scripts/check-cv-sync.mjs --strict` passes.

## ATS variant — the .docx and .txt exports

`cv/exports/chan-meng-cv-ats.docx` is now the **default upload**; the PDF is the
fallback. Lever refused the PDF on 2026-08-03 with "Couldn't auto-read resume"
despite it passing every check above, so the container — not the layout — was
the problem. Word is Lever's own first recommended fix and the most reliably
parsed format across Greenhouse, Workday and Taleo. `.txt` exists for
"paste your resume" textareas.

Both are **parsed out of `cv/chan-meng-cv-ats.typ`** by
`cv/build-ats-exports.mjs` — deliberately no second hand-maintained copy of the
resume text, because two copies drift and only one of them gets proofread.
`scripts/lib/parse-ats-resume.mjs` scans the file left to right and **throws
with a line number** on any construct it doesn't recognise, so nothing can be
silently dropped from the Word file while still appearing in the PDF. Its
`EXPECT` table asserts exact counts — 7 headings in order and by exact string,
9 roles (6 with bullets, 3 compact), 4 projects, 5 "Also built" links,
2 education, 3 awards, 2 contact lines, 6,800–9,000 chars. Every guard throws;
none warn. A guard that silently parses zero entries is worse than no guard.

- **Arial, not DM Sans.** DM Sans is vendored under `cv/fonts` for Typst's `--font-path` and is not installed on a recruiter's machine, so *naming* it in the .docx means silent substitution and *embedding* it is worse: it inflates the file, Google Docs ignores embedded fonts anyway, and some ATS pipelines choke on a `word/fonts/` part. Arial over Calibri because Calibri ships with Office but not with macOS or Linux; Arial is native on Windows and macOS, native in Google Docs, and metric-substituted by Liberation Sans on Linux.
- **Real Word structure, not typed-out lookalikes.** `Heading1` paragraph styles are the .docx analogue of the PDF's `/H1` tags; bullets are real `w:numPr` numbering, never a literal `-` typed into a run; links are real `w:hyperlink` relationships. Word's stock Heading1 (blue Calibri Light) is overridden to black Arial bold, and hyperlinks are styled black + underline rather than Word's blue — same rule as the PDF: the affordance stays visible without introducing colour.
- **The name is a plain bold 16pt paragraph, not a Heading1.** A Heading1 reading "Chan Meng" invites a parser to open a section called "Chan Meng" and file everything under it.
- **No `cp:keywords`** — same anti-keyword-stuffing rule the PDF follows. But `dcterms:created` / `dcterms:modified` **are** set, pinned to the .typ's document date.
- **Page count is explicitly NOT an acceptance criterion for the .docx.** Word repaginates against whatever fonts and page size the reader's machine has; the two-page budget is a PDF constraint. Do not add a page check here.
- **Determinism is engineered, not assumed.** `docx`'s packer and its bundled `nanoid/non-secure` (which is `Math.random()`) both introduce churn, so `cv/build-ats-exports.mjs` freezes `Date` **and** `Math.random` around the pack and restores both in a `finally`. Verified byte-identical across three builds. This matters because `cv/exports/` is tracked in git — non-determinism would put a diff in every rebuild.
- **The `.txt` keeps meaning over ASCII purity.** Māori macrons and em dashes stay (no folding), endings are LF, and it does **not** hard-wrap: one logical unit per line, so a line-oriented parser can't read one bullet as three. Its only divergence from the PDF's token stream is that the five "Also built:" prose links get ` (url)` appended — their visible text is a bare word, so in plain text they would otherwise carry no address at all.

`npm run check:ats` parses the file and runs every guard without writing
anything and without needing typst; it is wired into `npm run check` and the PR
gate. `npm run build:ats-exports` writes the two files — deliberately **not**
part of `npm run build`, because CV artifacts stay manual.

Definition of done for the .docx / .txt: valid OOXML package · docx token stream
**identical** to `pdftotext` on the PDF (1,013 tokens) · `.txt` identical modulo
the 5 appended URLs · 7 `Heading1` paragraphs in order · 9 real numbered bullets
and zero literal `- ` runs · 29 hyperlinks with zero dangling relationships ·
zero tables, drawings, text boxes, `framePr` or columns, and no header/footer/media
parts · Arial only, `DM Sans` appears nowhere in the package · core properties
present with no keywords · byte-identical across three consecutive builds.

## Regenerating

Whenever `data/profile/*.yaml` changes (work entries, recommendations, project metrics), rerun `pwsh cv/build.ps1` to refresh `public/chan-meng-cv.pdf` + the JSON-LD and llms.txt siblings.

## Before editing any `.typ` file — read [`TYPST_PITFALLS.md`](./TYPST_PITFALLS.md)

That file documents eight non-obvious Typst layout bugs that have already been fixed in this CV and **must not be reintroduced**. Notable: `v(N, weak: true)` after `linebreak()` silently renders as zero (use `block(below: ...)` instead); `block` margins are max-not-sum; list `spacing` must be ≥ 1.7× of within-item leading or bullets blur into one paragraph. Every entry / project / bullet in the CV depends on these rules.
