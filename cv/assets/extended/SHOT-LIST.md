# Extended-CV magazine — shot list

What Chan can supply to finish and upgrade the 16-page
`chan-meng-cv-extended.pdf`. Two kinds of task:

1. **In-PDF placeholders (`IMG-XX`)** — currently render as a cream halftone
   block stamped with the id. The book compiles at 16 pages either way, but each
   one should be replaced with a real photo before the magazine is called done.
2. **Swap-in upgrades** — the layout already shows a real image (a logo, an
   existing screenshot, or a watermarked press picture). Supplying a better
   original improves the page but is optional.

## How to supply a photo

- **Prep:** resize to max **1400 px** on the long edge, export progressive
  mozjpeg **q80** (drop to q68 if a frame lands over budget), and confirm the
  file is **≤ 400 KB** — same recipe as the rest of `MANIFEST.md`.
- **Fill a placeholder (`IMG-XX`):** drop the JPG in
  `cv/assets/extended/`, then in `cv/extended.typ` replace the matching
  `img-placeholder("IMG-XX", …)` call with
  `photo("/cv/assets/extended/<your-file>.jpg", caption: […])` (keep the same
  `ratio`/orientation). Rebuild.
- **Do a swap-in upgrade:** overwrite the file already named in
  `cv/extended.typ` at the same path/filename — no code change needed. (For a
  logo → screenshot upgrade you also change that one path in the `photo-grid`
  tuple.)
- **Rebuild + verify:** `pwsh cv/build.ps1`, then confirm the PDF is still
  16 pages and ≤ 10 MB.

---

## 1. In-PDF placeholders (fill these)

| IMG id | Page | What to shoot | Suggested source | Orientation |
|---|---|---|---|---|
| `IMG-01` | p4 · "My Story" | Chan **arriving in Auckland at thirty — beginning again**. Sits in a two-up grid beside the 2026 Auckland portrait, so it wants the same quiet, personal register (airport, first apartment, or on foot in the city near arrival). | A real arrival-era photo of Chan in Auckland. | **Portrait 3:4** |

---

## 2. Swap-in upgrades (optional)

### 2a. Replace watermarked / press images with clean originals

| Target | Page | Currently shows | Replace with | Orientation |
|---|---|---|---|---|
| `cv/assets/extended/namechange-hero.jpg` | (not currently placed) | Curated but **unused** — Task 6 told the name-change story via the p6 article card + caption, so this file is a spare. The version on disk is the essay's clean title-card illustration (the only frame in that source folder without a "看客 INSIGHT" / NetEase watermark). | Chan's **un-watermarked original of the stone-alley / red-backpack photo** (the watermarked press version is `2d-portfolio/…/threw-away-my-old-name/16.png`). With a clean original in hand this could become the Minimalist chapter's hero image. | Portrait or square |
| `public/articles/kan-kein-sight.jpg` | p6 · "A Minimalist" (3rd article card, *I Threw Away My Old Name*) | The NetEase 看客 outlet **brand-mark**, used as a recognizable media-feature cover. | A **real photo** would read warmer than a brand-mark. `fit:"contain"` letterboxes onto a cream card, so any aspect ratio is safe. | Any (landscape reads best) |

> The other two p6 covers are fine as-is: `girl-on-mattress.jpg` (最人物) and
> `p658073376.webp` (*A Glimpse of My Minimalist Home*) are real photos, not
> brand-marks — no swap needed.

### 2b. Product logos → live app screenshots

The p9–p11 "What I Build" grids currently pair each product with its **brand
logo** (SVG) or an existing thumbnail. A real, in-context **screenshot of the
running app** would make the work more tangible. Optional; supply any subset.
For all app screens: **landscape 16:10**, drop the JPG in `cv/assets/extended/`,
and update the one path in the corresponding `photo-grid` tuple in
`cv/extended.typ`.

| Product | Page · slot | Currently shows | Suggested shot | Orientation |
|---|---|---|---|---|
| **FemTracker** | p9 · For the community | `femtracker.svg` (logo) | The period-tracking agent's live UI / reasoning view | Landscape 16:10 |
| **She Sharp / Her Waka** | p9 · For the community (prose only — no image slot yet) | *no image* | A frame of the She Sharp site or Her Waka workshop platform, if we decide to add a slot | Landscape 16:10 |
| **gradient-svg-generator** | p10 · Work with taste | `gradient-svg-generator-logo.svg` (logo) | The generator UI with a rendered animated banner | Landscape 16:10 |
| **Chinese & English Redefine** | p11 · The fun side | `chinese-redefine-v2.svg` (logo) | A deck screen showing a reframed word + its shareable export card | Landscape 16:10 |
| **Te Pā Tiaki (tower defence)** | p11 · The fun side | `tower-defense-logo.svg` (logo) | An in-game frame of the pure-CSS 3D Māori-myth tower defence | Landscape 16:10 |

> Already real screenshots (no action needed): `tam-ai-ti.jpg` (p9) and
> `eatropolis.jpg` (p10).
