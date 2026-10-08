# cv/ — Chan Meng's Typst-sourced CV

`pwsh cv/build.ps1` builds everything; read the script for inputs and outputs.
It does not check its own prerequisites: Typst 0.14+ and Node.js 22+ on PATH,
and `npm ci` done. `cv/verify-ats-exports.py` also needs poppler on PATH
(here: `D:\tools\poppler\poppler-26.02.0\Library\bin`) and `pypdf`.

Before editing any `.typ`, read [`TYPST_PITFALLS.md`](./TYPST_PITFALLS.md).
Do not rename `public/chan-meng-cv.pdf`: the README "Resume" pill links to it.

## After every rebuild: sync the site (REQUIRED)

chanmeng.org/cv serves the two public PDFs from a separate repo, and nothing
syncs them.

1. Copy exactly `public/chan-meng-cv.pdf` and `public/chan-meng-cv-extended.pdf`
   to `D:/github_repository/2d-portfolio/public/`. Never copy anything from
   `cv/exports/`.
2. In the same commit, bump `PREVIEW_V` in that repo's `src/app/cv/page.tsx`.
   The page embeds `<file>?v=${PREVIEW_V}` and each Cloudflare colo caches 4 h
   on its own, so new bytes at an unchanged URL show the old CV with no error.
3. `git push origin main`. Push is the deploy (Cloudflare Pages git
   integration); local `wrangler deploy` is broken on purpose.
4. Verify by `sha256sum`, not size: the extended PDF changes bytes on every
   build while keeping its size.

## Source of truth

`data/profile/`. The `.typ` prose is hand-curated; `public/cv.jsonld` and
`public/cv-llms.txt` are generated (`npm run build:cv-geo`) and CI-gated, never
hand-edited. The only hardcoded lines in `build-llms-txt.mjs` are marked
`HARDCODED:` with their reason; add no facts there.

## Word blacklist (strip before compile)

These phrases trip AI-resume detectors and trigger up to 49% auto-dismissal. Do **not** introduce them into any section file:

- `delve`, `realm`, `intricate`, `showcasing`, `pivotal`
- `leveraged X to drive Y`, `leveraged ... synergies`
- `results-driven`, `passionate`, `dynamic professional`
- `prompt engineer` as a job title (use `agentic engineer` / `context engineer`)

## Architect-grade vocabulary (deliberately present)

The Claude Certified Architect (Foundations) terms in the CV sections and in the
hardcoded block of `build-llms-txt.mjs` (hub-and-spoke, PostToolUse hook,
`stop_reason`, case-facts block and the rest) are there so recruiter LLMs
reading an Anthropic Partner Network job description match the same phrases. Do
not simplify them away. The summary keeps the Anthropic Forward Deployed
Engineer phrase `shipped MCP servers, sub-agents, and agent skills to
production` verbatim for the same reason.

## ATS variant — hard rules

`cv/chan-meng-cv-ats.typ` + `cv/ats-components.typ` exist to be read by machines. Every rule below was chosen against measured extractor behaviour; do not relax one for looks.

- **Single column, no grids, no tables**: grids scramble reading order. Dates
  sit on the org line behind a `|`, never right-aligned.
- **No images, icons, boxes or colour**: `pdfimages -list` must be empty.
  Full-width hairlines under section headings are allowed; a rule spanning the
  measure cannot be read as a column boundary.
- **No italics**: `cv/fonts` has no DM Sans Italic, so italic is a synthesized
  oblique.
- **DM Sans 10pt, pure black**: below about 9.5pt OCR-fallback parsers degrade.
- **Margin 1.6cm, never below 1.5cm**: it clears the "within 0.5in of the edge
  is header/footer, discard" heuristic of legacy parsers.
- **No page header or footer**: legacy parsers drop those runs or splice them
  into the body between pages.
- **No `/Keywords` metadata and no invisible text**: a hidden term list is
  legible in `pdfinfo` and reads as keyword stuffing; Greenhouse-class
  screeners auto-reject injected text.
- **Links show the bare URL, the company name or the project name**, underlined
  in black. Never "here" or "portfolio": the extractor must lose nothing.
- **Box every hyphenated compound**; `hyphenate: false` is not enough. Typst
  still breaks at an explicit hyphen and `pdftotext` deletes a hyphen at a line
  end (measured: `AI-native` → `AInative`, `gpt-5.4-mini` → `gpt-5.4mini`). The
  fix in place is `#show regex("[\w.]+(-[\w.]+)+"): it => box(it)`. No bare
  ` - ` mid-sentence either (`Architect - Foundations` → `Architect
  Foundations`); use a colon or parentheses.
- **Commas between list items, never spaces**: the designed CV's pills extract
  as `Status line Plugins`.
- **Every contact item delimited by a literal ` | `**: the designed CV's
  stacked contact column extracts as one run of five fields.
- **ASCII where meaning allows**: `-` bullets and date ranges, `|` separators,
  straight quotes (`smartquote` off). Māori macrons stay; they extract
  byte-exact.
- **3-letter months** (`Mar 2025 - Feb 2026`): `scripts/check-cv-sync.mjs`
  derives that shape, so `March` fails the gate.
- **Document date present and pinned** (`date: datetime(...)`, never `auto` or
  `none`): a PDF with no `/CreationDate` or `/ModDate` trips legacy parsers and
  was the clearest anomaly in the file Lever refused on 2026-08-03; pinning
  keeps the committed PDF byte-reproducible. Bump it by hand when the content
  changes.
- **Only the seven section names a parser's lexicon knows** (listed in
  `EXPECT.headings`, `scripts/lib/parse-ats-resume.mjs`); anything else is
  absorbed into the neighbouring section.
- **Native `= HEADING`, and a transforming show rule must re-emit `it`**, not
  rebuild from `it.body`, or the `/H1` tag is lost. Re-check the `/H1` count
  with pypdf after touching that rule.
- **Escape `\@` and `\~`** ([`TYPST_PITFALLS.md`](./TYPST_PITFALLS.md) §9, §10).

**Two pages is the budget.** One sentence per bullet; if a bullet grows, split
it or cut the second sentence, never the metric (`EXPECTED_BULLETS` in the
verifier records the count). The three oldest roles are single-line entries
under "Earlier experience", still with title, org, location and dates, so they
parse as employment; that took the file from 4 pages to 2. Before adding
anything, decide what comes out.

**Spacing** comes from the one scale at the top of `ats-components.typ`. Change
the scale, not call sites.

**Definition of done for the PDF:** 2 pages · `Tagged: yes` · `CreationDate` +
`ModDate` present · 7 `/H1` · every `pdffonts` row `uni=yes` · `pdfimages -list`
empty · poppler, xpdf and pypdf recover the 7 headings in order ·
hyphenated-keyword grep clean · `node scripts/check-cv-sync.mjs --strict`
passes. `python cv/verify-ats-exports.py` runs all of it but is not in CI: the
PDF drifted to 3 pages unnoticed between 2026-08-03 and 2026-08-26, so run it
after every content edit.

## ATS variant — the .docx and .txt exports

The **PDF is the default upload** (Chan's call, 2026-08-26). Lever refused it on
2026-08-03 ("Couldn't auto-read resume") although it passed every check above:
the container was the problem, not the layout. Word is Lever's own first
recommended fix and the most reliably parsed format across Greenhouse, Workday
and Taleo, so the `.docx` is the fallback; the `.txt` is for paste-in fields.
Both are generated from `chan-meng-cv-ats.typ` (`npm run build:ats-exports`,
not part of `npm run build`); `npm run check:ats` is the PR gate.

- **Arial, not DM Sans**: DM Sans is not on a recruiter's machine, so naming it
  means silent substitution, and embedding it inflates the file, is ignored by
  Google Docs and makes some ATS pipelines choke on `word/fonts/`. Arial over
  Calibri because Calibri is missing on macOS and Linux.
- **Real Word structure**: `Heading1` styles, `w:numPr` bullets, `w:hyperlink`
  relationships; headings and links restyled black, as in the PDF.
- **The name is a bold 16pt paragraph, not a Heading1**: a parser would open a
  section called "Chan Meng" and file everything under it.
- **No `cp:keywords`**; `dcterms:created` / `modified` are set from the `.typ`
  date.
- **Page count is not a criterion for the .docx**: Word repaginates per
  machine. Do not add a page check.
- **Byte-reproducible**: the build freezes `Date` and `Math.random` around the
  pack, because `cv/exports/` is tracked.
- **The `.txt` keeps macrons and em dashes, uses LF, and does not hard-wrap**
  (one logical unit per line, so a bullet is not read as three). The "Also
  built" links get ` (url)` appended, as their visible text carries no address.

**Definition of done for the .docx / .txt:** valid OOXML · docx token stream
identical to `pdftotext` on the PDF · `.txt` identical apart from the appended
URLs · 7 `Heading1` in order · real numbered bullets, zero typed `- ` · no
dangling hyperlink relationships · no tables, drawings, text boxes, `framePr`,
columns, header/footer or media parts · Arial only · core properties without
keywords · byte-identical across three builds. `python
cv/verify-ats-exports.py` checks all of it and holds the exact counts.

Two checks need a person: open the `.docx` in Google Docs or Word Online to see
that it looks right, and attach it to a real Lever or Greenhouse form to see
that name, email and experience auto-fill (do not submit).
