# Extended-CV magazine — shot list

What Chan can supply to finish and upgrade the 16-page
`chan-meng-cv-extended.pdf`. Two kinds of task:

1. **In-PDF placeholders (`IMG-XX`)** — currently render as a plain cream
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

Chapter 3 ("What I Build", pp9–11) was rebuilt 2026-07-24 around Chan's own
flagship set. Each product now sits in a **uniform `product-tile`** whose fixed
logo box shows the product's **brand logo** (SVG). A real, in-context
**screenshot of the running app** would make each more tangible — but the tile is
deliberately uniform, so any swap-in should be a **1200×630-style branded cover**
or a clean landscape frame that letterboxes cleanly onto the cream box (`contain`
fit). Optional; supply any subset. Drop the JPG in `cv/assets/extended/` and
update the one `product-tile(...)` logo path in `cv/extended.typ`.

| Product | Page | Currently shows | Suggested shot | Orientation |
|---|---|---|---|---|
| **ArchCanvas** | p9 | `archcanvas-logo.svg` | The zoomable canvas with a dimensioned plan + its grounded rendering | Landscape 16:10 |
| **ArchLang** | p9 | `archlang-logo.svg` | The playground: `.arch` source on the left, compiled dimensioned SVG on the right | Landscape 16:10 |
| **Vitex** | p10 | `vitex.svg` | The generated ATS-ready resume PDF preview (a real screenshot already exists at `cv/assets/thumbs/vitex.jpg`) | Landscape 16:10 |
| **echook** | p10 | `echook-logo.svg` | The context-window status bar / a webhook alert in Slack | Landscape 16:10 |
| **Google News MCP Server** | p11 | `server-google-news.svg` | A PulseMCP "Top Pick" listing, or Claude calling the tool | Landscape 16:10 |
| **gradient-svg-generator** | p11 | `gradient-svg-generator-logo.svg` | The generator UI with a rendered animated banner | Landscape 16:10 |

> If Chan ever generates branded 1200×630 OG covers for these flagship repos
> (the `og-covers/` generator writes `og-cover.png` into each project's own
> repo), those are the ideal swap-in — same aspect for every tile by design.
