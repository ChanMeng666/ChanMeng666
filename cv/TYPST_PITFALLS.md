# Typst Layout Pitfalls — CV

Read before editing any `.typ` under `cv/`. The compiler warns about none of
these; each was caught on a render or an extraction. Section numbers are cited
from other files: do not renumber.

## 1. `block` margins are MAX, not SUM

The gap between blocks `A` and `B` is `max(A.below, B.above)`.
Symptom: `above: 5pt, below: 5pt` gives 5pt between entries, not 10pt.
Fix: one side owns the gap through a named token, the other is `0pt`
(`block(above: 0pt, below: gap-inter-entry)`).

## 2. `v(N, weak: true)` after `linebreak()` renders as zero

A `linebreak()` stays inside one paragraph, so the weak `v()` has no paragraph
margin to collapse against and vanishes.
Symptom: a bold title and its org/dates line look glued; spacing edits appear
to do nothing.
Fix: make each visual line its own `block(above: 0pt, below: …, breakable: false)`.

## 3. List `spacing` must be ≥ 1.7× the within-item leading

Ratio = `list.spacing / (par.leading × font size)`. Below about 1.7, adjacent
bullets read as one paragraph. Never lower `spacing` to save height without
lowering `leading` in proportion.

Shipped values (read from the source, 2026-10-09):

| Element | size | leading | spacing | ratio |
|---|---|---|---|---|
| `what-i-bring()` | 8pt | `0.72em` → 5.76pt | `9pt` | 1.56× (below the floor) |
| `recognition-and-reference()` | 7pt | `0.7em` → 4.9pt | `9pt` | 1.84× |
| `cert-group()` | 7pt | `0.7em` → 4.9pt | `15pt` | 3.06× |
| `project-card` bullets | 8.4pt | `0.5em` → 4.2pt | `8pt` | 1.90× |

## 4. Quote and callout blocks must be `breakable: false`

Symptom: the source line (`— Name · Title`) orphans alone at the top of the
next page.
Fix: `breakable: false`, so the whole block moves. If it no longer fits, cut
content upstream or move the quote; do not make it breakable.

## 5. Check the page count after every spacing change

Symptom: a 2pt bump repeated across entries pushes the last block onto a third
page, silently.
After any edit to `theme.typ`, `components.typ` or `sections/*.typ`, rebuild
and confirm 2 pages (`pdfinfo`, or render page 3 with
`typst compile --root . --font-path cv/fonts --format png --ppi 150 --pages 3 …`).
If it is 3: drop low-value content first (the Saba Gecgil quote has been
dropped twice for this; its text is in `data/profile/50-references.yaml`), then
dial back spacing nobody asked for (section padding, dividers). Never undo the
§1–§3 gaps and never shrink type sizes to fit.

## 6. SVG `currentColor` is not inherited by `image()`

Symptom: Lucide icons (`stroke="currentColor"`) and brand icons with no `fill`
render black, ignoring the surrounding `text(fill: …)`.
Fix: bake the literal accent hex into the file, `#FC5000` today (`accent-primary`
in `cv/tokens.typ`): replace `stroke="currentColor"`, or add `fill=` on the root
`<svg>`. Render through `contact-icon` in `sections/header.typ`, which sets the
icon on the text baseline.

## 7. `linebreak()` vs `parbreak()` vs nested `block`

`linebreak()` spacing follows `par.leading`, `parbreak()` follows `par.spacing`,
a nested `block(above:, below:)` follows its own margins. Only the block gap is
guaranteed to render as written: use it for every CV entry.

## 8. Grid `align:` aligns content inside a cell, not the column on the page

Symptom: asked for "left-aligned contacts in the top-right area", the header
gets restructured.
Fix: the column sits right because it is last in `columns: (auto, 1fr, auto)`;
change only that cell's `align` to `horizon + left`.

## 9. A bare `~` in markup is a non-breaking space

Symptom: `~85% solo` renders as ` 85% solo`: the tilde is gone and a stray
space is left. Shipped for weeks; caught on a PNG render on 2026-07-17.
Fix: `\~85%`. Markup only: `~` is literal in code comments, strings, JS and
YAML. Audit with `rg '~\d' cv/**/*.typ`.

## 10. Extraction pitfalls: what survives `pdftotext`

Found by extracting the shipped PDFs. They apply to every `.typ` here.

**(a) A bare `@` in markup is a label reference.** Symptom: the email address
is lost. Fix: `chanmeng.career\@gmail.com` in markup, or `\u{0040}` inside a
string (as `sections/header.typ` does).

**(b) `pdftotext` deletes a hyphen at a line end, and `hyphenate: false` does
not prevent it.** That setting stops automatic hyphenation only; Typst still
breaks at an explicit hyphen. Measured:

| Source | Extracted as |
|---|---|
| `AI-native` (public/chan-meng-cv.pdf, still live) | `AInative` |
| `web-vitals` (first ATS build) | `webvitals` |
| `multi-user` (first ATS build) | `multiuser` |
| `gpt-5.4-mini` (first ATS build) | `gpt-5.4mini` |
| `Architect - Foundations` | `Architect Foundations` |

Fix: `hyphenate: false`, plus `#show regex("[\w.]+(-[\w.]+)+"): it => box(it)`,
and no bare ` - ` as punctuation (a colon, parentheses or an em dash survive).
Verify on the extraction, not the source:
`pdftotext -enc UTF-8 <pdf> - | Select-String 'AI-native|Full-stack|multi-tenant|open-source|CI/CD'`.

**(c) Space-separated inline lists extract as one run.** Symptom: skill pills
give `Status line Plugins`; the icon-stacked contact column gives one line of
five fields. Fix: commas between items, an explicit delimiter between contact
items.

Not the problem here: Typst 0.15 emits tagged PDFs with correct ToUnicode
CMaps, and `· — ’ “” → ā «»` all round-trip byte-exact.

## The ATS variant

`chan-meng-cv-ats.typ` + `ats-components.typ` are exempt from §1, §2, §4 and §6
(no icons, no callouts, one spacing scale of their own). §3, §9 and §10 apply.
Their done-check is `cv/README.md` § "ATS variant — hard rules" plus a PNG
render, since hairlines and underlined links only show misplaced on a render.

## Done, for a layout edit to the designed CV

`pwsh cv/build.ps1` exits 0 · 2 pages · a 180 ppi PNG shows a visible gap
between each title line and its org/context line, bullet gaps clearly larger
than wrapped-line gaps, and no orphaned quote source or single line ·
`npm run check:copy` clean of banned words.
