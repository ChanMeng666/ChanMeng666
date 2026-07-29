# Typst Layout Pitfalls — CV

A reference for the typesetting bugs Claude Code introduced (or nearly introduced) while iterating on this CV. Read this before editing any file under `cv/`. Every pitfall here was caught only after the user flagged a visually broken layout — not by the compiler — so source review will not catch them. The fixes are mandatory.

---

## 1. `block` margins are MAX, not SUM

Between two consecutive blocks `A` then `B`, the rendered gap is `max(A.below, B.above)` — **not** `A.below + B.above`.

```typst
// BAD — author expected 10pt gap between entries, gets 5pt.
#let entry = block(above: 5pt, below: 5pt, ...)
entry; entry
```

**Fix:** decide which side owns the gap, set the other to `0pt`, and use a named token so the intent is auditable:

```typst
#let gap-inter-entry = 12pt        // in theme.typ
#let entry = block(above: 0pt, below: gap-inter-entry, ...)
```

The CV's `role-line` and `project-card` both follow this pattern. Do not regress.

---

## 2. `v(N, weak: true)` after `linebreak()` silently renders as zero

This is the single highest-impact bug the user caught. `v(weak: true)` collapses against surrounding **paragraph** margins. A `linebreak()` does NOT create a paragraph boundary — both lines remain inside the same paragraph. The weak v() therefore has no paragraph margin to collapse against, and disappears.

```typst
// BAD — the 2pt is silently dropped; title and meta line look glued.
text(weight: "bold", title)
linebreak()
v(2pt, weak: true)
text(style: "italic", org)
```

**Symptom the user reports:** `"AI Agent Architect"` and `"Engram · May 2026 — Present"` look stuck together; `"Tam-AI-Ti"` and its italic Māori-cultural context line look stuck together; spacing changes you made appear to have done nothing.

**Fix:** convert each visual line to its own block. `block.below` is rendered deterministically regardless of `weak:` semantics:

```typst
// GOOD — each line is a real block, gap is real.
block(above: 0pt, below: 5pt, breakable: false, {
  text(weight: "bold", size: 9.5pt, fill: ink, title)
})
block(above: 0pt, below: 0pt, breakable: false, {
  text(style: "italic", size: size-meta, fill: primary, org)
})
```

**Rule of thumb:** if you find yourself writing `linebreak() + v(...)`, you almost certainly want `block(below: ...)` instead. Applied in `cv/components.typ::role-line` and `cv/components.typ::compact-entry`.

---

## 3. List `spacing` must be ≥ 1.7× of the within-item leading

`set list(spacing: X)` controls the between-bullet gap. `set par(leading: Y)` controls within-bullet wrapped-line spacing. If the ratio `X / (Y × font-size)` is below ~1.7, adjacent bullets visually merge into one block and the reader loses paragraph boundaries.

```typst
// BAD — 8pt text × 0.78em = 6.24pt within; 8pt between = 1.28× ratio.
//        Bullets read as one continuous paragraph.
set par(leading: 0.78em)
set list(spacing: 8pt)
```

**Fix:** tighten within-leading AND widen between-spacing so the ratio is ≥ 1.7:

```typst
set par(leading: 0.7em)      // 8pt text → 5.6pt within
set list(spacing: 13pt)       // 13 / 5.6 = 2.32× — clear bullet boundaries
```

### Calibrated values currently shipped

| Element | within-leading | between-spacing | ratio |
|---|---|---|---|
| `what-i-bring()` (8pt) | `0.7em` → 5.6pt | `13pt` | **2.32×** |
| `recognition-and-reference()` (7pt) | `0.65em` → 4.55pt | `9pt` | **1.98×** |
| `cert-group()` (7pt) | `0.65em` → 4.55pt | `9pt` | **1.98×** |
| `project-card` bullets (9pt) | `0.7em` → 6.3pt | `11pt` | **1.75×** |

Do not lower `spacing` to "save vertical space" without also lowering `leading` proportionally. The ratio is the contract.

---

## 4. `quote-block`-style callouts must be `breakable: false`

A breakable multi-line block can split its body across pages and orphan the source line alone on the next page. The orphan looks like visual noise (`— Saba Gecgil · Founder & CEO, GAVIGO Inc.` floating at the top of a fresh page with no context).

```typst
// GOOD
#let quote-block(body, source: "") = block(
  fill: quote-bg,
  inset: (x: 7pt, y: 5pt),
  breakable: false,    // ← critical
  ...
)
```

If the quote no longer fits where placed, the whole block moves to the next page intact. That is the desired behaviour. Do not work around it by making the block breakable to "save space" — fix the upstream pressure (drop a bullet, shorten the body) or relocate the quote.

---

## 5. Verify page count after every spacing change

Every leading / spacing bump eats vertical budget. Even a 2pt increase repeated across 5 role entries + 5 bullets + 4 cards is enough to push the trailing block onto a third page silently. The compiler does not warn. You must check.

After any edit to `cv/theme.typ`, `cv/components.typ`, or `cv/sections/*.typ`:

```powershell
pwsh cv/build.ps1
$bytes = [System.IO.File]::ReadAllBytes("public/chan-meng-cv.pdf")
$text  = [System.Text.Encoding]::ASCII.GetString($bytes)
([regex]::Matches($text, '/Type\s*/Page[^s]')).Count
```

Target: `2`. If it returns `3`:

1. Render PNGs at ≥150 ppi to see what is on page 3:
   ```powershell
   typst compile --root . --format png --ppi 150 --pages 3 cv/chan-meng-cv.typ scratch-{p}.png
   ```
2. Decide:
   - **Drop low-value content** (testimonial quote, redundant footer line, intro paragraph that duplicates an experience entry). The Saba Gecgil testimonial has been dropped twice now to make room for spacing the user explicitly requested — its full text lives in `data/profile/50-references.yaml` for reference-check stages.
   - **Dial back only spacing the user did not specifically request** (section padding, divider thickness, skill-category padding). NEVER undo the inter-entry / intra-entry / list-ratio fixes — those are visual contract.
   - **Do not shrink text size** to fit. Type sizes are calibrated for screen + print legibility.

---

## 6. SVG `currentColor` is not inherited by Typst `image()`

Typst's `image()` renders the SVG verbatim. SVGs that rely on `stroke="currentColor"` (Lucide) or have no `fill` attribute (simple-icons) will render in black or the SVG's own default — they will NOT pick up the surrounding `text(fill: ...)` colour.

**When adding new icons to `cv/icons/`:**

- Lucide SVGs: replace `stroke="currentColor"` with the literal accent hex `#2E86AB` (whatever `accent` evaluates to in `cv/theme.typ`).
- Filled brand SVGs without a fill attribute: insert `fill="#2E86AB"` on the root `<svg>` element.

PowerShell one-shot:

```powershell
$accent = "#2E86AB"
$svg = Get-Content -Raw cv/icons/<name>.svg
$svg = $svg -replace 'stroke="currentColor"', "stroke=`"$accent`""
[System.IO.File]::WriteAllText("cv/icons/<name>.svg", $svg, [System.Text.UTF8Encoding]::new($false))
```

Use the existing `cv/sections/header.typ::contact-icon` helper to render them — it handles baseline alignment so icons sit on the text baseline, not the descender line.

---

## 7. `linebreak()` vs `parbreak()` vs nested `block(...)`

| Construct | Boundary type | Affected by | Use when |
|---|---|---|---|
| `linebreak()` | Within-paragraph line break | `par.leading` | You want hyphenation / justify / soft-wrap rules to carry across lines. Rare in this CV. |
| `parbreak()` | Paragraph boundary | `par.spacing` | You want paragraph-level vertical spacing between two text spans. |
| nested `block(above:, below:)` | Block boundary | `block.above` / `block.below` | You need deterministic vertical gaps. **Default choice for CV entries.** |

If unsure, use a nested block. It is the only construct whose gap is guaranteed to render as written.

---

## 8. `grid` column `align:` controls inner cell alignment, NOT column position on the page

The 3rd column of `header()` sits at the right of the page because it is the last child of `columns: (auto, 1fr, auto)`. The `align: (...)` tuple controls how content inside each cell aligns within that cell's own bounds:

```typst
grid(
  columns: (auto, 1fr, auto),
  align: (horizon, horizon + left, horizon + left),
  //                                ^^^^^^^^^^^^^^
  //                          "left-justify inside the right-side cell"
  //                          NOT "move the cell to the page's left edge"
  ...
)
```

When the user asks for "left-aligned contacts in the top-right area," they want `align(left)` inside the right-side cell — **not** a header rewrite. This caught me out once; do not restructure when a single align change is the answer.

---

## 9. A bare `~` in markup is a non-breaking space, not a literal tilde

In Typst markup content, `~` is syntax for a non-breaking space. So an "approximately" tilde written before a number silently vanishes and leaves a stray space in its place: `~85% solo` renders as ` 85% solo` (nbsp + text, which reads as an accidental double space), and `~18 months` renders as ` 18 months`. The compiler does not warn — the source looks correct.

```typst
// BAD — the tilde disappears; "85% solo" gains a ghost leading space.
Shipped ~85% of the code solo across ~18 months.
```

**Symptom the user reports:** a stray double space before a number ("85% solo across  12 months"), with the intended `~` nowhere on the page. The pre-rewrite CV shipped this way for weeks; it was only caught during the 2026-07-17 plain-language rewrite when a PNG render was inspected closely (PR #11, commit e45174f). Fixed occurrences lived in `cv/sections/experience.typ`, `cv/sections/projects.typ`, and `cv/extended.typ`.

**Fix:** escape the tilde so it renders literally:

```typst
// GOOD — the tilde renders as a literal "approximately" mark.
Shipped \~85% of the code solo across \~18 months.
```

**Scope:** this applies ONLY to `.typ` markup content. A `~` is literal in the JS/YAML surfaces (`cv/build-llms-txt.mjs`, `data/profile/*.yaml`), and it is also literal inside Typst code comments — leave those alone. Audit `.typ` content for offenders:

```powershell
rg '~\d' cv/**/*.typ
```

---

## 10. Extraction pitfalls — what survives `pdftotext`, and what does not

These three were found by extracting the *shipping* PDFs, not by reading source. They are content-level bugs, so they apply to every `.typ` file here, not just the ATS variant.

**(a) A bare `@` in markup is a label reference, not an at-sign.** Companion to §9's `~`. `chanmeng.career@gmail.com` written in markup silently loses the address. `cv/sections/header.typ:80` dodges it by putting the address in a *string* with `\u{0040}`; in markup, escape it:

```typst
// BAD  — "@gmail" parses as a label reference
chanmeng.career@gmail.com
// GOOD
chanmeng.career\@gmail.com
```

**(b) `pdftotext` de-hyphenation eats a hyphen sitting at a line break — and `hyphenate: false` does NOT prevent it.** That setting only disables *automatic* hyphenation. Typst still treats an *explicit* hyphen as a line-break opportunity, and poppler then reads a trailing hyphen as a soft hyphen and deletes it. Measured on real output:

| Source text | Where it broke | Extracted as |
|---|---|---|
| `AI-native` (public/chan-meng-cv.pdf) | after `AI-` | `AInative` |
| `web-vitals` (first ATS build) | after `web-` | `webvitals` |
| `multi-user` (first ATS build) | after `multi-` | `multiuser` |
| `gpt-5.4-mini` (first ATS build) | after `5.4-` | `gpt-5.4mini` |
| `Architect - Foundations` | after `-` | `Architect Foundations` |

The first is a live keyword loss in the shipping CV. Three defences: set `hyphenate: false`; box every hyphenated compound so it cannot break internally; and do not use a bare ` - ` as sentence punctuation — a colon, parentheses, or an em dash all survive.

```typst
// Removes the break opportunity inside every hyphenated compound.
#show regex("[\w.]+(-[\w.]+)+"): it => box(it)
```

Verify with a grep of the extraction, not by reading the source:

```powershell
& "D:\tools\poppler\poppler-26.02.0\Library\bin\pdftotext.exe" -enc UTF-8 <pdf> - |
  Select-String 'AI-native|Full-stack|multi-tenant|open-source|CI/CD'
```

**(c) Space-separated inline lists extract as one undelimited run.** The CV's skill pills are visually separated by whitespace, so `Status line` and `Plugins` come out as `Status line Plugins` — a keyword matcher cannot tell where one skill ends. Same for the icon-stacked contact column, which extracts as a single line containing all five contact fields. **Commas between items; one contact item per line.**

Not a pitfall but worth knowing: Typst 0.15 emits `Tagged: yes` PDFs with correct ToUnicode CMaps by default, and `· — ’ “” → ā «»` all round-trip byte-exact. Encoding is not the problem in this repo; layout is.

### The ATS variant's contract is different

`cv/chan-meng-cv-ats.typ` + `cv/ats-components.typ` are deliberately exempt from §1, §2, §4 and §6 — they have no icons and no callouts, and every vertical gap comes from one spacing scale at the top of `ats-components.typ` rather than from `theme.typ` tokens. §3 (the ≥1.7× list ratio) IS honoured there. Their definition of done is the extraction check in §10 **plus** a PNG render, since they now carry hairline rules and underlined links that only a render will show misplaced. §9 and §10 always apply.

---

## File responsibilities (where to find each rule applied)

| File | Owns | Pitfalls relevant |
|---|---|---|
| `cv/theme.typ` | Named spacing tokens (`gap-inter-entry`, `gap-intra-entry`, `leading-summary`), type sizes, palette | 1, 3, 5 |
| `cv/components.typ` | `role-line`, `project-card`, `compact-entry`, `quote-block`, `cert-group`, `skill-category`, `cv-divider` | 1, 2, 3, 4 |
| `cv/sections/header.typ` | 3-column grid (portrait \| name \| contacts), icon helpers | 6, 8 |
| `cv/sections/sidebar.typ` | `what-i-bring`, `recognition-and-reference`, `certifications` | 3 |
| `cv/sections/experience.typ` | Role entries via `role-line()` | 2 (rendered) |
| `cv/sections/projects.typ` | Intro + project cards | 2 (rendered) |
| `cv/chan-meng-cv.typ` | Body grid (left column = narrative; right column = structured + recognition) | 5 |
| `cv/chan-meng-cv-ats.typ` | ATS resume content — single column, plain | 9, 10 (exempt from 1–4, 6) |
| `cv/ats-components.typ` | ATS renderers: `role-line`, `skills-line`, `project-entry`, `education-entry` | 9, 10 (exempt from 1–4, 6) |

---

## Definition of "done" for any CV layout edit

1. `pwsh cv/build.ps1` exits 0.
2. Page count = 2 (use the PowerShell snippet in §5).
3. PNG render at 180 ppi inspected for:
   - Each `role-line` has a clearly visible gap between the title bold line and the italic org/dates subline (≥ 4pt extra over leading).
   - Each `project-card` has a clearly visible gap between the bold name+URL line and the italic context line.
   - Bullet lists everywhere show clearly larger gaps between bullets than within wrapped lines (target ratio ≥ 1.7×).
   - No orphaned quote source line; no orphaned single line on a page.
4. Word blacklist still clean (`delve`, `realm`, `intricate`, `showcasing`, `pivotal`, `leveraged X to drive Y`, `results-driven`, `passionate`, `dynamic professional` — see `cv/README.md`).
5. README "Resume" pill still resolves to `public/chan-meng-cv.pdf` (do not rename the file).
6. If `cv/chan-meng-cv-ats.typ` or `cv/ats-components.typ` changed: 3 pages, `pdfinfo` says `Tagged: yes`, every `pdffonts` row says `uni=yes`, `pdfimages -list` is empty, `pdftotext` and `pdftotext -raw` agree on reading order, and `node scripts/check-cv-sync.mjs` is clean.
