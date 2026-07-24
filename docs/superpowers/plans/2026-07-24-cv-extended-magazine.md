# CV Extended — «Subtraction / Addition» Magazine Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `public/chan-meng-cv-extended.pdf` from a conventional long-form CV into a 16-page, image-led English "personal-brand magazine" whose spine is *minimalist × independent developer*, landing on Chan's product taste and engineering credibility.

**Architecture:** Keep the existing Typst pipeline. Add one reusable-components file (`cv/extended-components.typ`) for the magazine's photo/quote/placeholder/card/avatar-wall/chapter-opener primitives; fully rewrite the content file (`cv/extended.typ`) and the entry file body (`cv/chan-meng-cv-extended.typ`) into the 16-page flow; add a curated image set under `cv/assets/extended/` (external photos copied + compressed; in-repo `public/` images referenced by relative path). `pwsh cv/build.ps1` stays the one-shot build. Missing screenshots render as **branded placeholder blocks** (cream + light halftone + `IMG-XX · description`) enumerated in a shot list, so the draft is itself a finished-looking artifact.

**Tech Stack:** Typst 0.14+ (on PATH as `typst`), Caldera design tokens via `cv/theme-extended.typ` → `cv/theme.typ` → `cv/tokens.typ` (generated from `data/brand.yaml`), PowerShell build script, Node 22+ for the one-off image-compression script (`sharp`, installed locally in scratch — see Global Constraints), Handlebars README templates for the outward entry point.

## Global Constraints

Every task's requirements implicitly include this section. Values copied verbatim from `docs/superpowers/specs/2026-07-24-cv-extended-redesign-design.md`.

- **All English, first person, short sentences.** Zero unexplained jargon — this surface does not serve ATS; technical credibility is carried by product stories + live links, not term-density.
- **Every claim carries a live link** (blog / live demo / video / podcast). No pricing or cost framings anywhere in prose.
- **Do not hardcode drift-prone follower/subscriber counts in body prose.** (Article read/reshare counts named in the spec — e.g. "100k+ reads / 3,864 reshares" — are historical facts and *are* allowed; follower/subscriber tallies are not.) Facts are sourced from `data/profile/*.yaml`; dates anchor to `data/profile/10-career.yaml`.
- **All 24 recommenders appear** on the Voices spread — a quote may be trimmed, but no person is dropped (includes the historical-archive recommender Daryll Hall). Confirmed count: `data/profile/50-references.yaml` holds **24** reference entries; `public/recommendations/` holds **24** avatar images.
- **RED LINES — C-grade content is forbidden in this public document** (sourced from the private `chan-meng-novel` grading; carry verbatim): family-of-origin trauma detail; middle-school bullying; all sexual content; radical expressions (6b4t / knives / threatening language); estrangement detail; specific political-trauma narrative; negative observations about any ethnic group. **All third-party real names** (parents/relatives/王东妮/李舒茜/李俊/邓伟/孙可森/黄宇云子/马楠/表姨/cleo, etc.) — de-name all related material. B-grade material may be alluded to without detail: the subtraction of appearance, workplace-dignity events, the reason for leaving China (phrase it only as *"to rebuild life somewhere I could breathe freely"*). **The legal name-change story is sourced ONLY from the blog** — never claim it comes from the autobiography.
- **PDF ≤ 10 MB.** Single compressed image ≤ 400 KB.
- **Images are the subject; each page's text budget is ~40–100 English words** (Voices / My Story chapters may run richer).
- **Brand tokens must not decouple from `data/brand.yaml`.** Use the `*-x` tokens in `theme-extended.typ` and the Caldera palette it re-exports (`primary`/`accent`/`ink`/`muted`/`sans`/`sans-display`/`pill-bg`/`rule`/`quote-bg`/`halftone`). Never introduce raw hex; never a full-black block.
- **Before editing any `.typ` file, read `cv/TYPST_PITFALLS.md`.** The load-bearing rules: (1) block margins are MAX not SUM — one side owns the gap, other = `0pt`; (2) `v(N, weak:true)` after `linebreak()` renders as zero — use `block(below:)`; (3) list `spacing` ≥ 1.7× within-item leading; (4) callouts `breakable:false`; (5) **verify page count after every spacing change**; (6) SVG `currentColor` not inherited; (9) a bare `~` in markup is a non-breaking space — escape as `\~`.
- **Word blacklist (from `cv/README.md`)** — never introduce: `delve`, `realm`, `intricate`, `showcasing`, `pivotal`, `leveraged X to drive Y`, `results-driven`, `passionate`, `dynamic professional`, `prompt engineer` (as a title).
- **This is executed in a git worktree/branch by an implementer subagent.** Fable orchestrates and reviews only.

### Repeated verification commands (used across tasks)

All commands run from the **worktree root** (`$WT` = the worktree path from Task 1). Scratch dir (per user convention): `D:\.claude-scratch\2026-07-24\cv-extended-magazine\` (`$SCRATCH`).

**Compile the extended PDF only (fast inner loop):**
```powershell
typst compile --root . --font-path cv/fonts cv/chan-meng-cv-extended.typ public/chan-meng-cv-extended.pdf
```

**Assert page count (target 16):**
```powershell
$bytes = [System.IO.File]::ReadAllBytes("public/chan-meng-cv-extended.pdf")
$text  = [System.Text.Encoding]::ASCII.GetString($bytes)
([regex]::Matches($text, '/Type\s*/Page[^s]')).Count
```

**Render every page to PNG for eyeball review:**
```powershell
typst compile --root . --font-path cv/fonts --format png --ppi 150 cv/chan-meng-cv-extended.typ "$env:SCRATCH\ext-{p}.png"
```

**Assert PDF size ≤ 10 MB:**
```powershell
$mb = (Get-Item public/chan-meng-cv-extended.pdf).Length / 1MB
"{0:N2} MB" -f $mb
```

There are **no unit tests in this repo**; the verification loop is: `typst compile` succeeds → page-count assertion → per-page PNG visual inspection.

---

### Task 0 (context) — File map after this plan

| File | Status | Responsibility |
|---|---|---|
| `cv/chan-meng-cv-extended.typ` | **Rewrite body** | Entry point: PDF metadata, per-page geometry (full-bleed cover/back, footer on inner pages), calls the 8 chapter functions in order. |
| `cv/theme-extended.typ` | Modify (add tokens) | Existing `*-x` tokens + new magazine tokens (photo radius, placeholder height ratios, avatar size, pull-quote size). Re-exports Caldera palette. |
| `cv/extended-components.typ` | **Create** | Reusable magazine primitives: `photo`, `photo-grid`, `img-placeholder`, `article-card`, `pull-quote`, `avatar-wall`, `chapter-opener`. |
| `cv/extended.typ` | **Rewrite** | The 8 chapter functions holding all page content + copy. Imports theme-extended + extended-components. |
| `cv/assets/extended/` | **Create** | Curated + compressed external photos, `MANIFEST.md`, `SHOT-LIST.md`. |
| `cv/README.md` | Modify | File-map update: extended trio + assets dir. |
| `data/brand.yaml` | Modify | `decorations.buttons.badgeExtended` (Task 10). |
| `scripts/build.mjs` | Modify | `readmeOrder` array gains `"Extended CV"` (Task 10). |
| `data/profile/90-meta.yaml` | Modify | `meta.x_brand.footerLinks` gains the Extended CV entry (Task 10). |
| `templates/partials/footer.hbs` | Modify | Pill conditional for label `"Extended CV"` (Task 10). |

**Existing assets confirmed on disk (reference directly, do NOT copy):**
- Portrait/life-in-repo: `public/photos/chanmeng-portrait-2026.jpg`, `public/photos/chan-by-the-sea.jpg`, `public/photos/chan-keynote-ai-hackathon-2025.jpg`, `public/photos/chan-panel-shesharp.jpg`, `public/photos/chan-panel-shesharp-gesturing.jpg`, `public/photos/chan-celebrate.jpg`.
- Recognition: `public/articles/un-women-csw69.jpeg`, `public/articles/girl-on-mattress.jpg`, `public/articles/creating-a-minimalist-living-space.png`, `public/articles/a-genderless-girl.jpg` (name-change essay art).
- Halftone: `public/brand/halftone-thumb.svg`, `public/brand/halftone-hero.svg`.
- Avatars (24): `public/recommendations/<Name>.{jpg,jpeg,png}` — see Task 8 table.
- Logos/marks: `public/brands/*.svg` incl. `tam-ai-ti-mark.svg`, `she-sharp-mark.svg`, `femtracker.svg`, `her-waka.jpg`, `gradient-svg-generator-logo.svg`, `eatropolis-mark.svg`, `chinese-redefine-v2.svg`, `english-redefine.svg`, `tower-defense-logo.svg`, `free-period-logo.svg`, `chan-meng-monkey-black-transparent.svg`, `seismophone-logo.svg`, `archcanvas-logo.svg`, `vitex.svg`.
- Existing extended thumbs (real screenshots, reusable): `cv/assets/thumbs/tam-ai-ti.jpg`, `cv/assets/thumbs/vitex.jpg`, `cv/assets/thumbs/eatropolis.jpg`.

**External source dirs (copy + compress into `cv/assets/extended/` in Task 2):**
- Minimalist life: `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\01–43.png`
- Name-change essay: `D:\github_repository\2d-portfolio\public\blog\threw-away-my-old-name\01–18.{png,jpg}`
- Banana-piano workshop: `D:\github_repository\ai-programming-teaching-project\static\img\peyvand-academy\peyvand-academy-13-june-2026-photo-1..11.webp`
- Capstone screenshots: `D:\github_repository\ai-programming-teaching-project\static\img\capstone\{joborg-ai,icare,credithero,linguapath}.webp`

---

### Task 1: Worktree + branch init, commit spec & plan

**Files:**
- Create (git): worktree at `../ChanMeng666-cv-extended-magazine`, branch `cv-extended-magazine-2026-07`
- Commit (already on disk, untracked in `main`): `docs/superpowers/specs/2026-07-24-cv-extended-redesign-design.md`, `docs/superpowers/plans/2026-07-24-cv-extended-magazine.md`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `$WT` = absolute worktree path; all later tasks run inside `$WT`. Branch `cv-extended-magazine-2026-07` holds the spec + plan as its first commit.

> REQUIRED SUB-SKILL context: follows `superpowers:using-git-worktrees`. Native `git worktree` is the fallback used here.

- [ ] **Step 1: Confirm the two docs are untracked in main**

Run (from `D:\github_repository\ChanMeng666`):
```powershell
git status --short docs/superpowers/
```
Expected: two `??` lines for the spec and plan `.md` files. (They are untracked, so a fresh worktree will NOT carry them — Step 3 copies them in.)

- [ ] **Step 2: Create the worktree + branch from main**

```powershell
git worktree add -b cv-extended-magazine-2026-07 ../ChanMeng666-cv-extended-magazine main
```
Expected: `Preparing worktree (new branch 'cv-extended-magazine-2026-07')` … `HEAD is now at 1857d6d …`. Set `$WT = (Resolve-Path ../ChanMeng666-cv-extended-magazine).Path`.

- [ ] **Step 3: Copy the untracked spec + plan into the worktree**

```powershell
New-Item -ItemType Directory -Force "$WT\docs\superpowers\specs" | Out-Null
New-Item -ItemType Directory -Force "$WT\docs\superpowers\plans" | Out-Null
Copy-Item docs/superpowers/specs/2026-07-24-cv-extended-redesign-design.md "$WT\docs\superpowers\specs\"
Copy-Item docs/superpowers/plans/2026-07-24-cv-extended-magazine.md "$WT\docs\superpowers\plans\"
```
Expected: no output (success).

- [ ] **Step 4: Commit them on the branch**

```powershell
git -C "$WT" add docs/superpowers/specs/2026-07-24-cv-extended-redesign-design.md docs/superpowers/plans/2026-07-24-cv-extended-magazine.md
git -C "$WT" commit -m "docs(cv-extended): add magazine redesign spec + implementation plan"
```
Expected: `2 files changed`. All subsequent tasks operate with cwd = `$WT`.

---

### Task 2: Asset curation — copy, compress, manifest

**Files:**
- Create: `cv/assets/extended/*.jpg` (compressed selects), `cv/assets/extended/MANIFEST.md`
- Create (scratch, not committed): `$SCRATCH\package.json`, `$SCRATCH\compress.mjs`

**Interfaces:**
- Consumes: external source dirs (Task 0 list).
- Produces: named image files under `cv/assets/extended/` that Tasks 5–7 reference by relative path `/cv/assets/extended/<name>.jpg`. Naming contract (referenced verbatim later):
  - Minimalist selects (6): `min-empty-room.jpg`, `min-foam-mat.jpg`, `min-one-bag.jpg`, `min-suitcase.jpg`, `min-city-livingroom.jpg`, `min-desk.jpg`
  - Name-change (1): `namechange-hero.jpg`
  - Banana piano (2): `teach-banana-1.jpg`, `teach-banana-2.jpg`
  - Capstone (3): `cap-joborg.jpg`, `cap-icare.jpg`, `cap-credithero.jpg`
- `MANIFEST.md` records, per file: output name / source absolute path / which page it serves.

> **Why a local `sharp` install:** verified 2026-07-24 — `sharp` is NOT installed at repo root or in `og-covers/`, and there is no ImageMagick on PATH. `og-covers/render.mjs` uses `playwright-core` (screenshotting), which is wrong for still-image recompression. Install `sharp` locally in `$SCRATCH` (prebuilt Windows x64 binary, no build tools needed) and drive a one-off script. Nothing enters the repo except the compressed outputs.

- [ ] **Step 1: Eyeball the source dirs and pick the strongest frames**

Open the source dirs and choose the 6 strongest minimalist frames (empty room / foam sleeping mat / one-backpack-one-suitcase framing), the single strongest name-change hero, 2 banana-piano workshop frames, 3 capstone screenshots. Record chosen source filenames in a scratch note. (Manual selection — the exact `NN.png` picks are the implementer's visual call; the *output names* are fixed by the interface above.)

Run to preview quickly (opens the folder):
```powershell
ii "D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey"
```

- [ ] **Step 2: Init the scratch compressor**

```powershell
$SCRATCH = "D:\.claude-scratch\2026-07-24\cv-extended-magazine"
New-Item -ItemType Directory -Force $SCRATCH | Out-Null
Push-Location $SCRATCH
npm init -y
npm i sharp
Pop-Location
```
Expected: `added N packages`. Verify: `node -e "require('$($SCRATCH -replace '\\','/')/node_modules/sharp'); console.log('ok')"` prints `ok`.

- [ ] **Step 3: Write the one-off compression script**

Create `$SCRATCH\compress.mjs`. Edit the `SRC` values to the frames chosen in Step 1. It resizes to max 1400px on the long edge, encodes progressive mozjpeg q80, and asserts each output ≤ 400 KB (auto-retries at q68 if over).

```javascript
import sharp from "sharp";
import { statSync } from "node:fs";
import { mkdirSync } from "node:fs";

const OUT = "D:/github_repository/ChanMeng666-cv-extended-magazine/cv/assets/extended";
mkdirSync(OUT, { recursive: true });

// EDIT the `src` paths to the frames chosen in Step 1.
const jobs = [
  { src: "D:/github_repository/2d-portfolio/public/blog/minimalist-lifestyle-journey/NN.png", out: "min-empty-room.jpg" },
  { src: "D:/github_repository/2d-portfolio/public/blog/minimalist-lifestyle-journey/NN.png", out: "min-foam-mat.jpg" },
  { src: "D:/github_repository/2d-portfolio/public/blog/minimalist-lifestyle-journey/NN.png", out: "min-one-bag.jpg" },
  { src: "D:/github_repository/2d-portfolio/public/blog/minimalist-lifestyle-journey/NN.png", out: "min-suitcase.jpg" },
  { src: "D:/github_repository/2d-portfolio/public/blog/minimalist-lifestyle-journey/NN.png", out: "min-city-livingroom.jpg" },
  { src: "D:/github_repository/2d-portfolio/public/blog/minimalist-lifestyle-journey/NN.png", out: "min-desk.jpg" },
  { src: "D:/github_repository/2d-portfolio/public/blog/threw-away-my-old-name/NN.jpg", out: "namechange-hero.jpg" },
  { src: "D:/github_repository/ai-programming-teaching-project/static/img/peyvand-academy/peyvand-academy-13-june-2026-photo-1.webp", out: "teach-banana-1.jpg" },
  { src: "D:/github_repository/ai-programming-teaching-project/static/img/peyvand-academy/peyvand-academy-13-june-2026-photo-2.webp", out: "teach-banana-2.jpg" },
  { src: "D:/github_repository/ai-programming-teaching-project/static/img/capstone/joborg-ai.webp", out: "cap-joborg.jpg" },
  { src: "D:/github_repository/ai-programming-teaching-project/static/img/capstone/icare.webp", out: "cap-icare.jpg" },
  { src: "D:/github_repository/ai-programming-teaching-project/static/img/capstone/credithero.webp", out: "cap-credithero.jpg" },
];

const LIMIT = 400 * 1024;
for (const j of jobs) {
  const dest = `${OUT}/${j.out}`;
  const enc = (q) => sharp(j.src)
    .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: q, mozjpeg: true, progressive: true })
    .toFile(dest);
  await enc(80);
  let size = statSync(dest).size;
  if (size > LIMIT) { await enc(68); size = statSync(dest).size; }
  const kb = (size / 1024).toFixed(0);
  console.log(`${size <= LIMIT ? "OK " : "OVER"} ${j.out}  ${kb} KB`);
  if (size > LIMIT) throw new Error(`${j.out} still over 400 KB (${kb} KB) — pick a simpler frame or drop resolution`);
}
console.log("done");
```

- [ ] **Step 4: Run the compressor**

```powershell
node "$SCRATCH\compress.mjs"
```
Expected: 12 `OK …  <NNN> KB` lines then `done`, every line ≤ 400 KB, no `OVER`/throw.

- [ ] **Step 5: Confirm outputs landed in the repo**

```powershell
Get-ChildItem "$WT\cv\assets\extended\*.jpg" | Select-Object Name, @{n="KB";e={[int]($_.Length/1KB)}}
```
Expected: 12 files, all KB ≤ 400.

- [ ] **Step 6: Write the MANIFEST**

Create `cv/assets/extended/MANIFEST.md` with a table: `| Output file | Source (absolute) | Serves page |`, one row per compressed file, mapping to the page from the Task 4–8 layout (e.g. `min-empty-room.jpg` → pp5–7 "A Minimalist"; `teach-banana-1.jpg` → p12 Teaching; `cap-joborg.jpg` → p12 capstone strip).

- [ ] **Step 7: Commit**

```powershell
git -C "$WT" add cv/assets/extended
git -C "$WT" commit -m "assets(cv-extended): curate + compress magazine photo set (≤400KB each) + MANIFEST"
```
Expected: 13 files changed (12 jpg + MANIFEST).

---

### Task 3: Magazine layout components

**Files:**
- Modify: `cv/theme-extended.typ` (append magazine tokens)
- Create: `cv/extended-components.typ`
- Create then delete (scratch verification): `cv/test-components.typ`

**Interfaces:**
- Consumes: Caldera tokens from `cv/theme-extended.typ` (`primary`, `accent`, `ink`, `muted`, `sans`, `sans-display`, `pill-bg`, `rule`, `quote-bg`, `size-*-x`, `leading-*-x`).
- Produces (exact signatures — Tasks 4–8 call these verbatim):
  - `photo(path, caption: none, w: 100%)` — rounded, hairline-framed image; optional italic caption under it.
  - `photo-grid(items, cols: 2, gutter: 14pt)` — `items` = array of `(path, caption)` pairs (caption may be `none`); lays them into `cols` columns.
  - `img-placeholder(id, desc, ratio: "landscape")` — cream box + light halftone + centered `IMG-XX · desc`; `ratio ∈ {"landscape","portrait","square","wide"}`.
  - `article-card(cover, title, stats, url)` — media-article card: cover image (path or `none`→placeholder), bold title, muted stats line, linked URL.
  - `pull-quote(body, attribution: none)` — large italic display quote with an orange lead rule.
  - `avatar-wall(people, cols: 8)` — `people` = array of `(img, name)`; circular avatars in a `cols`-wide grid with tiny name captions.
  - `chapter-opener(number, title, kicker: none)` — chapter title block: big Anton title, optional muted kicker, light halftone accent strip.

- [ ] **Step 1: Read the pitfalls file (mandatory)**

Run: `Get-Content cv/TYPST_PITFALLS.md`. Confirm you will apply rules 1, 2, 3, 4, 6, 9. (Rule 6: any Lucide/simple-icons SVG needs the literal accent hex — but the magazine uses only existing pre-tinted SVGs and brand marks, so no new icon tinting is required here.)

- [ ] **Step 2: Append magazine tokens to `theme-extended.typ`**

Append to `cv/theme-extended.typ` (after the pill-radius block):
```typst
// ─── Magazine tokens (16-page image-led extended CV) ─────────────────────────
#let radius-photo-x   = 10pt    // rounded photo frame
#let frame-photo-x    = 0.8pt   // hairline photo stroke (uses rule.lighten(25%))
#let size-pull-x      = 20pt    // pull-quote display size
#let size-chapter-x   = 40pt    // chapter-opener title (Anton)
#let size-kicker-x    = 10pt    // chapter kicker eyebrow
#let avatar-size-x    = 46pt    // Voices avatar diameter
#let size-avatar-cap-x = 7pt    // avatar name caption
#let gap-photo-x      = 14pt    // gutter between gridded photos
#let ph-h-landscape   = 150pt   // img-placeholder heights by ratio
#let ph-h-portrait    = 220pt
#let ph-h-square      = 170pt
#let ph-h-wide        = 120pt
```

- [ ] **Step 3: Create `cv/extended-components.typ`**

```typst
// Reusable magazine primitives for the 16-page extended CV.
// Styled after cv/components.typ (deterministic block gaps, breakable:false for
// callouts). Consumes the *-x tokens from theme-extended.typ.
#import "theme-extended.typ": *

// ─── Rounded, hairline-framed photo (optional caption) ───────────────────────
#let photo(path, caption: none, w: 100%) = block(above: 0pt, below: 0pt, breakable: false,
  box(width: w, {
    box(width: 100%, radius: radius-photo-x, clip: true,
      stroke: frame-photo-x + rule.lighten(25%), image(path, width: 100%))
    if caption != none {
      v(5pt)
      text(size: size-tiny-x, fill: muted, style: "italic", caption)
    }
  })
)

// ─── Photo grid — items: array of (path, caption|none) ───────────────────────
#let photo-grid(items, cols: 2, gutter: gap-photo-x) = grid(
  columns: (1fr,) * cols,
  column-gutter: gutter,
  row-gutter: gutter,
  ..items.map(it => photo(it.at(0), caption: it.at(1))),
)

// ─── Branded placeholder block (cream + light halftone + IMG-XX label) ───────
#let img-placeholder(id, desc, ratio: "landscape") = {
  let h = if ratio == "portrait" { ph-h-portrait }
    else if ratio == "square" { ph-h-square }
    else if ratio == "wide" { ph-h-wide }
    else { ph-h-landscape }
  block(above: 0pt, below: 0pt, breakable: false,
    box(width: 100%, height: h, radius: radius-photo-x, clip: true, fill: pill-bg,
      stroke: frame-photo-x + rule.lighten(25%), {
        // light halftone wash behind the label
        place(top + left, box(width: 100%, height: h, clip: true,
          image("/public/brand/halftone-thumb.svg", width: 100%)))
        place(center + horizon, box(inset: 6pt, {
          text(size: 9pt, weight: "bold", fill: accent)[#id]
          text(size: 9pt, fill: muted)[ · ]
          text(size: 9pt, fill: muted, style: "italic")[#desc]
        }))
      })
  )
}

// ─── Media-article card ──────────────────────────────────────────────────────
#let article-card(cover, title, stats, url) = block(above: 0pt, below: gap-inter-entry-x, breakable: false, {
  if cover != none {
    box(width: 100%, radius: radius-photo-x, clip: true,
      stroke: frame-photo-x + rule.lighten(25%), image(cover, width: 100%))
  } else {
    img-placeholder("IMG-??", "article cover", ratio: "wide")
  }
  v(7pt)
  block(above: 0pt, below: 3pt, breakable: false,
    text(weight: "bold", size: size-h3-x, fill: ink, title))
  block(above: 0pt, below: 3pt, breakable: false,
    text(size: size-meta-x, fill: muted, style: "italic", stats))
  block(above: 0pt, below: 0pt, breakable: false,
    text(size: size-tiny-x, fill: primary)[#link(url, url.replace("https://", ""))])
})

// ─── Pull-quote (large italic, orange lead rule) ─────────────────────────────
#let pull-quote(body, attribution: none) = block(above: 6pt, below: 12pt, breakable: false, {
  grid(columns: (4pt, 1fr), column-gutter: 12pt,
    rect(width: 4pt, height: 100%, fill: accent, radius: 2pt, stroke: none),
    {
      set par(leading: leading-lead-x, justify: false)
      text(size: size-pull-x, style: "italic", fill: primary)[#body]
      if attribution != none {
        v(6pt)
        text(size: size-meta-x, fill: muted)[— #attribution]
      }
    })
})

// ─── Avatar wall — people: array of (img, name) ──────────────────────────────
#let avatar-wall(people, cols: 8) = grid(
  columns: (1fr,) * cols,
  column-gutter: 8pt,
  row-gutter: 10pt,
  ..people.map(p => box(width: 100%, {
    align(center, box(radius: 50%, clip: true, width: avatar-size-x, height: avatar-size-x,
      stroke: 1pt + accent, image(p.at(0), width: 100%, height: 100%, fit: "cover")))
    v(3pt)
    align(center, text(size: size-avatar-cap-x, fill: muted, p.at(1)))
  }))
)

// ─── Chapter opener (big title + optional kicker + halftone strip) ───────────
#let chapter-opener(number, title, kicker: none) = block(above: 0pt, below: 16pt, breakable: false, {
  text(size: size-kicker-x, weight: "bold", fill: accent, tracking: 0.14em)[#upper("Chapter " + number)]
  v(6pt)
  text(font: sans-display, weight: "regular", size: size-chapter-x, fill: primary, tracking: 0.02em, title)
  v(8pt)
  box(width: 100%, height: 18pt, clip: true, radius: 4pt,
    image("/public/brand/halftone-hero.svg", width: 100%))
  if kicker != none {
    v(10pt)
    block(above: 0pt, below: 0pt, {
      set par(leading: leading-lead-x, justify: false)
      text(size: size-body-x, fill: muted, style: "italic", kicker)
    })
  }
})
```

- [ ] **Step 4: Write a throwaway component harness**

Create `cv/test-components.typ`:
```typst
#import "theme-extended.typ": *
#import "extended-components.typ": *
#set page(paper: "a4", margin: 2cm)
#set text(font: sans, size: size-body-x, fill: ink)
#chapter-opener("1", "Test Chapter", kicker: "A kicker line for the opener.")
#photo("/public/photos/chan-by-the-sea.jpg", caption: "A real photo.")
#v(10pt)
#photo-grid((("/public/photos/chan-panel-shesharp.jpg", [Left]), (none, none)).filter(it => it.at(0) != none))
#img-placeholder("IMG-01", "empty room, one foam mat", ratio: "portrait")
#article-card(none, "Girl on Mattress", "100k+ reads · 3,864 reshares", "https://chanmeng.org/blog")
#pull-quote("Living alone, I finally learned to confirm my own existence through my own eyes.", attribution: "Chan Meng")
#avatar-wall(((("/public/recommendations/Lesley-Gao.jpg", "Lesley"), ("/public/recommendations/Amy-Li.jpg", "Amy"))), cols: 8)
```

- [ ] **Step 5: Compile the harness (must succeed)**

```powershell
typst compile --root . --font-path cv/fonts cv/test-components.typ "$env:SCRATCH\test-components.pdf"
```
Expected: exit 0, no errors. Open `$SCRATCH\test-components.pdf` and confirm every primitive renders (rounded photo, cream placeholder with halftone + `IMG-01 · …`, article card, orange-ruled pull-quote, circular avatars).

- [ ] **Step 6: Delete the harness**

```powershell
Remove-Item cv/test-components.typ
```

- [ ] **Step 7: Commit**

```powershell
git -C "$WT" add cv/theme-extended.typ cv/extended-components.typ
git -C "$WT" commit -m "feat(cv-extended): add magazine layout components + tokens"
```

---

### Task 4: Chapter 1 — Cover + Opening note (pp1–2), skeleton the whole book

**Files:**
- Modify (rewrite body): `cv/chan-meng-cv-extended.typ`
- Modify (rewrite): `cv/extended.typ`

**Interfaces:**
- Consumes: Task 3 components (`chapter-opener`, `photo`, `pull-quote`, `img-placeholder`); Task 2 asset names.
- Produces:
  - Entry-file contract: `chan-meng-cv-extended.typ` imports `extended.typ` and calls, in order, `x-cover()`, `x-opening()`, `x-story()`, `x-minimalist()`, `x-build()`, `x-teaching()`, `x-voices()`, `x-recognition()`, `x-backcover()`.
  - This task defines `x-cover()`, `x-opening()`, and **stubs** the other 6 as `chapter-opener` + one `img-placeholder` so the whole book compiles to ~16 pages from the start (Tasks 5–8 fill the stubs).

> This task deliberately establishes the full skeleton so every later task keeps the book compiling and page-countable.

- [ ] **Step 1: Rewrite the entry file `cv/chan-meng-cv-extended.typ`**

Replace the whole file with:
```typst
// Chan Meng — EXTENDED CV, «Subtraction / Addition» 16-page magazine.
// Image-led personal-brand magazine: minimalist × independent developer.
// Build: pwsh cv/build.ps1 → public/chan-meng-cv-extended.pdf.
#import "theme-extended.typ": *
#import "extended.typ": *

#set document(
  title: "Chan Meng — Subtraction / Addition (Extended)",
  author: "Chan Meng",
  description: "A 16-page image-led personal-brand magazine: minimalist and independent developer. Companion to the 2-page CV. Canonical: https://chanmeng.org/cv",
  keywords: ("minimalist", "independent developer", "AI-native", "Claude Code", "product design", "Auckland New Zealand"),
)

// Inner-page geometry: calm margins + a slim footer with an orange page dot.
#set page(
  paper: "a4",
  margin: (top: 1.8cm, bottom: 1.5cm, left: 1.9cm, right: 1.9cm),
  footer: context [
    #set text(size: 7pt, fill: muted)
    #grid(columns: (1fr, auto, 1fr),
      align: (left + horizon, center + horizon, right + horizon),
      [Chan Meng — Subtraction / Addition],
      text(fill: accent)[#counter(page).display()],
      [chanmeng.org])
  ],
)
#set text(font: sans, size: size-body-x, fill: ink, lang: "en")
#set par(leading: leading-body-x, justify: false, first-line-indent: 0pt)
#show link: it => underline(stroke: 0.3pt + accent, offset: 1.5pt, it)

#x-cover()
#x-opening()
#x-story()
#x-minimalist()
#x-build()
#x-teaching()
#x-voices()
#x-recognition()
#x-backcover()
```

- [ ] **Step 2: Start the rewrite of `cv/extended.typ` — header + cover + opening**

Replace the whole file. Begin with the imports and the two implemented chapters:
```typst
// Chan Meng — EXTENDED CV content: the 16-page «Subtraction / Addition» magazine.
// Each x-*() renders one chapter. Facts mirror data/profile/*.yaml; dates anchor
// to data/profile/10-career.yaml. All English, first person. See the plan +
// spec under docs/superpowers/ for page architecture and red lines.
#import "theme-extended.typ": *
#import "extended-components.typ": *

// ── p1: full-bleed cover ─────────────────────────────────────────────────────
#let x-cover() = {
  set page(margin: 0pt, footer: none,
    background: image("/public/photos/chan-by-the-sea.jpg", width: 100%, height: 100%, fit: "cover"))
  place(bottom + left, dx: 2cm, dy: -2.2cm, block(width: 16cm, {
    text(font: sans-display, weight: "regular", size: 60pt, fill: on-accent, tracking: 0.01em)[Chan Meng]
    v(6pt)
    text(size: 15pt, fill: on-accent)[A minimalist. #text(fill: accent, weight: "bold")[Subtraction for life, addition for thought.]]
  }))
  pagebreak()
}

// ── p2: opening note ─────────────────────────────────────────────────────────
#let x-opening() = {
  v(2.4cm)
  block(width: 100%, {
    set par(leading: leading-lead-x, justify: false)
    text(size: 14pt, fill: ink)[
      This isn't a résumé. It's a short field guide to how I think and what I make — written for anyone curious about my products and the way I work.
    ]
    v(12pt)
    text(size: 14pt, fill: ink)[
      If you're here to hire, my two-page CV is one click away: #link("https://chanmeng.org/cv")[chanmeng.org/cv].
    ]
  })
  v(18pt)
  photo("/public/photos/chan-celebrate.jpg", caption: [Auckland — where I rebuilt everything.], w: 78%)
  pagebreak()
}
```

- [ ] **Step 3: Append the 6 stub chapters (filled in Tasks 5–8)**

Append to `cv/extended.typ`:
```typst
#let x-story() = { chapter-opener("1", "My Story", kicker: none); img-placeholder("IMG-STUB", "story", ratio: "landscape"); pagebreak() }
#let x-minimalist() = { chapter-opener("2", "A Minimalist", kicker: none); img-placeholder("IMG-STUB", "minimalist", ratio: "landscape"); pagebreak() }
#let x-build() = { chapter-opener("3", "What I Build, and Who For", kicker: none); img-placeholder("IMG-STUB", "build", ratio: "landscape"); pagebreak() }
#let x-teaching() = { chapter-opener("4", "Teaching", kicker: none); img-placeholder("IMG-STUB", "teaching", ratio: "landscape"); pagebreak() }
#let x-voices() = { chapter-opener("5", "Voices", kicker: none); img-placeholder("IMG-STUB", "voices", ratio: "landscape"); pagebreak() }
#let x-recognition() = { chapter-opener("6", "Recognition", kicker: none); img-placeholder("IMG-STUB", "recognition", ratio: "landscape"); pagebreak() }
#let x-backcover() = {
  set page(footer: none)
  v(1fr)
  align(center, image("/public/brands/chan-meng-monkey-black-transparent.svg", width: 90pt))
  v(20pt)
  align(center, block(width: 12cm, {
    set par(leading: leading-lead-x, justify: false)
    text(size: 11pt, fill: ink, weight: "bold")[Where to find me]
    v(8pt)
    text(size: 10pt, fill: ink)[chanmeng.org · chanmeng.org/blog · Newsletter · linkedin.com/in/chanmeng666 · github.com/ChanMeng666 · youtube.com/@ChanMeng666 · cal.com/chan-meng/30min]
  }))
  v(1fr)
}
```

- [ ] **Step 4: Compile the whole book**

Run the compile command (Global Constraints). Expected: exit 0.

- [ ] **Step 5: Assert it compiles to ~16 pages**

Run the page-count snippet. Expected: a number in the 13–18 range (exact 16 is dialed in Task 11 once real content lands; the stub book proves the skeleton flows).

- [ ] **Step 6: Render + eyeball pp1–2**

Run the PNG render. Open `$SCRATCH\ext-1.png` and `ext-2.png`. Confirm: cover has the sea photo full-bleed with white "Chan Meng" + orange tagline fragment bottom-left, no footer; p2 opening note reads cleanly with the celebrate photo, footer visible with an orange page number.

- [ ] **Step 7: Commit**

```powershell
git -C "$WT" add cv/chan-meng-cv-extended.typ cv/extended.typ
git -C "$WT" commit -m "feat(cv-extended): cover + opening + 16-page skeleton"
```

---

### Task 5: Chapter — My Story (pp3–4)

**Files:**
- Modify: `cv/extended.typ` (replace the `x-story()` stub)

**Interfaces:**
- Consumes: `chapter-opener`, `photo`, `photo-grid`, `pull-quote`, `img-placeholder`.
- Produces: `x-story()` renders across ~2 pages.

- [ ] **Step 1: Look up the two career-change podcast URLs**

The story arc ends on "two career-transition podcasts." These URLs were NOT among the files verified while planning. Find them:
```powershell
Select-String -Path data/profile/80-events.yaml, data/profile/00-basics.yaml -Pattern "podcast|spotify|episode|apple.com/.*podcast" -SimpleMatch:$false
```
Use the two career-change episodes. If only Chan's own shows exist (`Decoding the Future`, `Future Turing`, `Praxis and Pages` in `00-basics.yaml`), use the two most relevant show URLs and phrase the sentence as "I've talked about changing careers on these shows" rather than "two interviews." Do not invent an episode URL.

- [ ] **Step 2: Replace `x-story()`**

Replace the `x-story()` stub with (fill the two `PODCAST_URL_*` with Step 1's real URLs; if using Chan's own shows, keep the phrasing note):
```typst
#let x-story() = {
  chapter-opener("1", "My Story",
    kicker: [I started with maps, taught maths, watched an industry vanish, and at thirty crossed the world to begin again.])
  block(above: 0pt, below: 14pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-body-x, fill: ink)[
      My degree was in geography; my first real job was teaching maths to teenagers in China. Then, almost overnight, the private-tutoring industry I worked in was regulated out of existence. At thirty — the age everyone says is too late — I moved to a place where I could breathe freely and rebuild, and read for a Master of Applied Computing at #link("https://www.lincoln.ac.nz/")[Lincoln University], finishing with *Distinction*.
    ]
    v(12pt)
    text(size: size-body-x, fill: ink)[
      I never learned to code the old way. From my first assignment I built alongside AI, pairing with a model the way other students paired with a lab partner. That wasn't a shortcut — it's the origin of how I work now: someone who *directs* coding agents rather than typing every line.
    ]
    v(12pt)
    text(size: size-body-x, fill: ink)[
      The proof came from an unexpected place. An early-stage founder asked his own Claude agent to find him an engineer. It read the open web and recommended me — which the founder, #link("https://engram.media/")[Engram]'s Luka Madzarac, later confirmed in public. I hadn't applied. The work had. Auckland, for its part, met me with more kindness than I expected.
    ]
  })
  pagebreak()
  // p4 — timeline visual + supporting photos + podcasts
  photo-grid((
    ("/public/photos/chanmeng-portrait-2026.jpg", [Auckland, 2026.]),
    ("/cv/assets/extended/namechange-hero.jpg", [Starting over at thirty.]),
  ))
  v(14pt)
  pull-quote(
    [When execution gets cheap, the work that matters is choosing what to build — and having the taste to keep only what's worth keeping.])
  v(12pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-body-x, fill: ink)[
      I've talked about changing careers in public — #link("PODCAST_URL_1")[here] and #link("PODCAST_URL_2")[here].
    ]
  })
  pagebreak()
}
```

- [ ] **Step 3: Compile + page-count**

Run compile, then the page-count snippet. Expected: exit 0; count unchanged ±1 from Task 4.

- [ ] **Step 4: Render + eyeball pp3–4**

Render PNGs; open `ext-3.png`, `ext-4.png`. Confirm: chapter opener with halftone strip; three short paragraphs (each ≤ ~60 words); two-photo grid; pull-quote with orange rule; podcast links resolve to real URLs (no `PODCAST_URL_*` literal left). **Red-line check:** no third-party names beyond the publicly-confirmed founder (Luka Madzarac) and no political-trauma framing — "regulated out of existence" + "a place where I could breathe freely" only.

- [ ] **Step 5: Commit**

```powershell
git -C "$WT" add cv/extended.typ
git -C "$WT" commit -m "feat(cv-extended): My Story chapter (pp3-4)"
```

---

### Task 6: Chapter — A Minimalist (pp5–7)

**Files:**
- Modify: `cv/extended.typ` (replace the `x-minimalist()` stub)

**Interfaces:**
- Consumes: `chapter-opener`, `photo`, `photo-grid`, `article-card`, `pull-quote`.
- Produces: `x-minimalist()` renders across ~3 pages (life → media cards → bridge-to-craft + pull-quote).

- [ ] **Step 1: Pull the three articles' REAL external URLs + covers (do NOT use a generic `/blog` link)**

The three cards are external media features — the global constraint requires each claim carry a *precise* live link, so a generic `https://chanmeng.org/blog` is not allowed. The canonical per-article `url` + `image` live in `data/profile/30-recognition.yaml` (publications block); cross-check the read/reshare stats in the `verifiedClaims` block of `data/profile/90-meta.yaml` (L566–573 — note the block key is `verifiedClaims`, there is no `mediaFeatures` key).
```powershell
Select-String -Path data/profile/30-recognition.yaml -Pattern "Girl on Mattress|A Glimpse of My Minimalist Home|I Threw Away My Old Name" -Context 0,7
Select-String -Path data/profile/90-meta.yaml -Pattern "Girl on Mattress|Glimpse of My Minimalist|Threw Away My Old Name"
```
Verified values (use these; re-confirm nothing drifted):
- **Girl on Mattress** — cover `/public/articles/girl-on-mattress.jpg`, url `https://mp.weixin.qq.com/s/hRh8rTF9gjdpI8KEixuSFQ` (The Most People 最人物).
- **A Glimpse of My Minimalist Home** — url `https://mp.weixin.qq.com/s/eZx_Mo5F6BRfVNVceQCS8Q` (Douban Daily Feature). This publication entry has **no `image` field**, so use the Douban minimalist-home feature photo `/public/articles/p658073376.webp` (or `/public/articles/p658085706.webp`). **Do NOT use `creating-a-minimalist-living-space.png`** — that is the cover of a *different* article ("Creating a Minimalist Living Space", a chanmeng.org blog post, `90-meta.yaml` `minimalistArticles`). Typst 0.14+ supports WebP, so the `.webp` cover renders fine. If neither `p658…webp` visually reads as a minimalist home on render, fall back to one of Task 2's compressed life photos (e.g. `/cv/assets/extended/min-empty-room.jpg`).
- **I Threw Away My Old Name** — cover `/public/articles/kan-kein-sight.jpg` (NetEase Kan Ke inSight 网易看客), url `https://chanmeng.org/blog/threw-away-my-old-name` (slug confirmed present in `2d-portfolio/content/`).

If any cover reads poorly, pass `none` to `article-card` to fall back to a branded placeholder — but keep the precise `url`.

- [ ] **Step 2: Replace `x-minimalist()`**

Replace the stub with (page 5 = life; page 6 = three article cards; page 7 = bridge to craft + pull-quote):
```typst
#let x-minimalist() = {
  chapter-opener("2", "A Minimalist",
    kicker: [Subtraction as a daily practice — and, it turns out, as an engineering philosophy.])
  block(above: 0pt, below: 14pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-body-x, fill: ink)[
      It began with a broken charging cable and a bent hairpin. I threw them out, felt lighter, and kept going. Today everything I own fits into one backpack and one suitcase. I don't keep a living room — I borrow the city's.
    ]
  })
  photo-grid((
    ("/cv/assets/extended/min-empty-room.jpg", [One room, almost empty.]),
    ("/cv/assets/extended/min-foam-mat.jpg", [A foam mat instead of a bed.]),
  ))
  v(gap-photo-x)
  photo-grid((
    ("/cv/assets/extended/min-one-bag.jpg", [Everything I own — one backpack, one suitcase.]),
    ("/cv/assets/extended/min-city-livingroom.jpg", [The city is my living room.]),
  ))
  pagebreak()
  // p6 — three media cards
  block(above: 0pt, below: 12pt, text(size: size-body-x, fill: muted, style: "italic")[
    People read along. A few pieces travelled far:])
  grid(columns: (1fr, 1fr, 1fr), column-gutter: 14pt,
    article-card("/public/articles/girl-on-mattress.jpg", "Girl on Mattress",
      "100k+ reads · 3,864 reshares", "https://mp.weixin.qq.com/s/hRh8rTF9gjdpI8KEixuSFQ"),
    article-card("/public/articles/p658073376.webp", "A Glimpse of My Minimalist Home",
      "100k+ reads · 14k reshares", "https://mp.weixin.qq.com/s/eZx_Mo5F6BRfVNVceQCS8Q"),
    article-card("/public/articles/kan-kein-sight.jpg", "I Threw Away My Old Name",
      "29k+ reads", "https://chanmeng.org/blog/threw-away-my-old-name"),
  )
  v(10pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-tiny-x, fill: muted, style: "italic")[
      At thirty I legally changed my name and remade who I am. I wrote about it #link("https://chanmeng.org/blog/threw-away-my-old-name")[on the blog].
    ]
  })
  pagebreak()
  // p7 — bridge to craft + pull-quote
  block(above: 0pt, below: 14pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: size-body-x, fill: ink)[
      It's the same instinct in my software: *stripping away what isn't needed so the essential works better* — whether that's a living space or a system. It shows up as calm dashboards, as anti-bloat discipline (my #link("https://github.com/CopilotKit/CopilotKit")[CopilotKit] contribution cut a flow from eight paths down to three), and as #link("https://github.com/ChanMeng666/chan-meng-cli")[npx chan-meng] — a whole introduction in one command.
    ]
  })
  photo("/cv/assets/extended/min-desk.jpg", caption: [One desk, one machine, everything version-controlled.], w: 70%)
  v(16pt)
  pull-quote(
    [Living alone, I finally learned to confirm my own existence through my own eyes — my own perspective, my own taste.])
  pagebreak()
}
```

- [ ] **Step 3: Compile + page-count.** Run compile + snippet. Expected: exit 0.

- [ ] **Step 4: Render + eyeball pp5–7.** Open `ext-5..7.png`. Confirm: life photos frame cleanly; three article cards align in a row; bridge paragraph links resolve; pull-quote reads as the chapter's closing beat. **Red-line check:** name-change framed only as self-remaking, sourced to the blog; no trauma detail; no cost/pricing framing.

- [ ] **Step 5: Commit**

```powershell
git -C "$WT" add cv/extended.typ
git -C "$WT" commit -m "feat(cv-extended): A Minimalist chapter (pp5-7)"
```

---

### Task 7: Chapter — What I Build (pp8–11) + Teaching (p12)

**Files:**
- Modify: `cv/extended.typ` (replace `x-build()` and `x-teaching()` stubs)

**Interfaces:**
- Consumes: `chapter-opener`, `photo`, `photo-grid`, `img-placeholder`.
- Produces: `x-build()` (~4 pages, three groups), `x-teaching()` (~1 page).

- [ ] **Step 1: Confirm live URLs + screenshots/marks per product**

Verified live URLs (from `cv/extended.typ` current source, re-check they still resolve): Tam-AI-Ti `https://tamaiti.whiri-ai.com/`, FemTracker `https://github.com/ChanMeng666/femtracker-agent`, She Sharp `https://www.shesharp.org.nz/`, gradient-svg-generator `https://gradient-svg-generator.vercel.app/`, Chow Luck Club `https://eatropolis.co.nz/`.
For products whose URL was NOT in the read files (FreePeriod, Her Waka, chinese/english-redefine, the Māori-myth tower defence), grep the project shards for the real link:
```powershell
Select-String -Path data/profile/2*-projects*.yaml -Pattern "id: (free-period|her-waka|chinese-redefine|english-redefine|tower-defense|journey-of-reincarnation)" -Context 0,12
```
Use `liveUrl`/`repoUrl` from those entries. For the Tam-AI-Ti YouTube demo, grep the same shard for a `youtube.com`/`youtu.be` URL on the `tam-ai-ti` entry.
Real screenshots available: `cv/assets/thumbs/tam-ai-ti.jpg`, `cv/assets/thumbs/vitex.jpg`, `cv/assets/thumbs/eatropolis.jpg`. Where no screenshot exists, use the product's brand mark from `public/brands/` on a photo tile, or an `img-placeholder` if neither exists.

- [ ] **Step 2: Replace `x-build()`**

Three groups, one product = one human sentence + image + live link + one plain tech line. Replace the stub:
```typst
#let x-build() = {
  chapter-opener("3", "What I Build, and Who For",
    kicker: [The largest chapter — because the work is the argument. Every name is a link you can open.])
  // Group A — For the community
  block(above: 0pt, below: 8pt, text(size: size-meta-x, weight: "bold", fill: accent, tracking: 0.08em)[FOR THE COMMUNITY])
  photo-grid((
    ("/cv/assets/thumbs/tam-ai-ti.jpg", none),
    ("/public/brands/femtracker.svg", none),
  ))
  v(8pt)
  block(above: 0pt, below: 12pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-body-x, fill: ink)[
      *#link("https://tamaiti.whiri-ai.com/")[Tam-AI-Ti]* is a te-ao-Māori financial-wellness coach that speaks with you in two languages — built for a 19-person, four-month research cohort. #link("https://github.com/ChanMeng666/femtracker-agent")[*FemTracker*] takes on period poverty; its 8-node agent was good enough to merge into #link("https://github.com/CopilotKit/CopilotKit")[CopilotKit]'s official demos. #link("https://www.shesharp.org.nz/")[*She Sharp & Her Waka*] carry the platform for New Zealand's leading women-in-STEM charity — 8,000+ women supported.
    ]
  })
  pagebreak()
  // Group B — Work with taste (design systems / brand)
  block(above: 0pt, below: 8pt, text(size: size-meta-x, weight: "bold", fill: accent, tracking: 0.08em)[WORK WITH TASTE])
  photo-grid((
    ("/cv/assets/thumbs/eatropolis.jpg", none),
    ("/public/brands/gradient-svg-generator-logo.svg", none),
  ))
  v(8pt)
  block(above: 0pt, below: 12pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-body-x, fill: ink)[
      *Caldera* is the design system behind this very document — tokens, type, motion, and a signature risograph texture. #link("https://eatropolis.co.nz/")[*Chow Luck Club*] is an event brand and site I built for a paying client (Tātaki Auckland Unlimited). #link("https://gradient-svg-generator.vercel.app/")[*gradient-svg-generator*] turns a phrase into an animated SVG banner — 355 templates, used across my own READMEs.
    ]
  })
  pagebreak()
  // Group C — The fun side
  block(above: 0pt, below: 8pt, text(size: size-meta-x, weight: "bold", fill: accent, tracking: 0.08em)[THE FUN SIDE])
  photo-grid((
    ("/public/brands/chinese-redefine-v2.svg", none),
    ("/public/brands/tower-defense-logo.svg", none),
  ))
  v(8pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-body-x, fill: ink)[
      Not everything has to be serious. My *#link("REDEFINE_URL")[Chinese & English Redefine]* card decks reframe everyday words into something funnier and truer. And a *#link("TOWERDEF_URL")[Māori-myth CSS tower defence]* is exactly what it sounds like — a game I built to see how far pure CSS could go.
    ]
  })
  pagebreak()
}
```
Fill `REDEFINE_URL` and `TOWERDEF_URL` with the real URLs from Step 1.

- [ ] **Step 3: Replace `x-teaching()`**

```typst
#let x-teaching() = {
  chapter-opener("4", "Teaching",
    kicker: [Three years, five cohorts. My whole method in one line.])
  block(above: 0pt, below: 14pt, {
    set par(leading: leading-lead-x, justify: false)
    text(size: 16pt, style: "italic", fill: primary)["Natural language is the source code."]
  })
  block(above: 0pt, below: 12pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-body-x, fill: ink)[
      Students arrive knowing only browser ChatGPT. Twelve weeks later they've shipped a live, multi-user AI product by directing coding agents — the same way I work. I've run this five times since 2024, most recently for #link("https://www.technestcommunity.com/")[TechNest] and at a #link("https://programming.chanmeng.org/")[hands-on workshop] where a banana piano taught kids that code can be playful.
    ]
  })
  photo-grid((
    ("/cv/assets/extended/teach-banana-1.jpg", [Banana-piano workshop.]),
    ("/cv/assets/extended/teach-banana-2.jpg", [Type-along, hands-on.]),
  ))
  v(gap-photo-x)
  photo-grid((
    ("/cv/assets/extended/cap-joborg.jpg", [Student capstone — JobOrg.]),
    ("/cv/assets/extended/cap-icare.jpg", [Student capstone — iCare.]),
    ("/cv/assets/extended/cap-credithero.jpg", [Student capstone — CreditHero.]),
  ), cols: 3)
  v(12pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-tiny-x, fill: muted, style: "italic")[
      "She made the whole team feel more capable because she was in the room." — a student, on the cohort.
    ]
  })
  pagebreak()
}
```
The student quote must be a verbatim ≤1-sentence excerpt from a real capstone-student reference — pull Amy Li's or Jessie Wan's line from `data/profile/50-references.yaml` and replace the placeholder text above with it (attributing to the correct name). Do not ship an invented quote.

- [ ] **Step 4: Compile + page-count.** Run compile + snippet. Expected: exit 0, count near 16.

- [ ] **Step 5: Render + eyeball pp8–12.** Open `ext-8..12.png`. Confirm: three build groups each read as one image row + ≤ ~70-word paragraph; all product links resolve (no `*_URL` literal); no unexplained jargon (each product has a plain-language line); teaching page shows the manifesto line big, banana photos, capstone strip, and a real attributed student quote.

- [ ] **Step 6: Commit**

```powershell
git -C "$WT" add cv/extended.typ
git -C "$WT" commit -m "feat(cv-extended): What I Build (pp8-11) + Teaching (p12)"
```

---

### Task 8: Chapter — Voices (pp13–14) + Recognition (p15) + Back cover (p16)

**Files:**
- Modify: `cv/extended.typ` (replace `x-voices()`, `x-recognition()`; finalize `x-backcover()`)

**Interfaces:**
- Consumes: `chapter-opener`, `avatar-wall`, `pull-quote`, `photo`, `photo-grid`.
- Produces: `x-voices()` (~2 pages, all 24 avatars + 2 featured quotes), `x-recognition()` (~1 page), `x-backcover()` (final, already drafted in Task 4 — verify).

- [ ] **Step 1: Build the 24-person avatar list**

All 24 references + avatar files (verified present). Use this exact array in `avatar-wall` (order = `50-references.yaml` order):
```typst
#let voices-people = (
  ("/public/recommendations/Ikenna-Anasieze.png", "Ikenna"),
  ("/public/recommendations/Swayam-Dhir.jpg", "Swayam"),
  ("/public/recommendations/Mahdieh-Najmi.jpg", "Mahdieh"),
  ("/public/recommendations/Shivani-Dhandabani.jpg", "Shivani"),
  ("/public/recommendations/Prasanth-Pavithran.jpg", "Prasanth"),
  ("/public/recommendations/Lesley-Gao.jpg", "Lesley"),
  ("/public/recommendations/Saba-Gecgil.png", "Saba"),
  ("/public/recommendations/Nirmala-Chinnappan.jpg", "Nirmala"),
  ("/public/recommendations/Yesha-Kaniyawala.jpg", "Yesha"),
  ("/public/recommendations/Siyu-Xing.jpg", "Siyu"),
  ("/public/recommendations/Cecilia-Yin.jpg", "Cecilia"),
  ("/public/recommendations/Amy-Li.jpg", "Amy"),
  ("/public/recommendations/Omopeju-Afanu.jpg", "Paige"),
  ("/public/recommendations/Gabby-Hurst.jpg", "Gabby"),
  ("/public/recommendations/Chaste-Christopher-Inegbedion.jpg", "Chaste"),
  ("/public/recommendations/Mi-Su.jpg", "Mi Su"),
  ("/public/recommendations/Shushu-Qin.jpg", "Shushu"),
  ("/public/recommendations/Patricia-Anthony.jpg", "Patricia"),
  ("/public/recommendations/Robin-Lee.jpeg", "Robin"),
  ("/public/recommendations/Shiyu-Fang.jpeg", "Shiyu"),
  ("/public/recommendations/Jixuan-Jessie-Wan.jpeg", "Jessie"),
  ("/public/recommendations/Di-Peng.jpeg", "Di"),
  ("/public/recommendations/Qiao-Jun.jpeg", "Qiao Jun"),
  ("/public/recommendations/Daryll-Hall.jpeg", "Daryll"),
)
```
(24 entries — confirm `voices-people.len()` is 24.)

- [ ] **Step 2: Replace `x-voices()`**

The two featured pull-quotes use verbatim text from `50-references.yaml` (Lesley Gao and Shivani Dhandabani, confirmed while planning). Replace the stub:
```typst
#let x-voices() = {
  chapter-opener("5", "Voices",
    kicker: [Twenty-four people who've worked with me — every one of them, in their own words.])
  avatar-wall(voices-people, cols: 8)
  pagebreak()
  // p14 — two featured quotes
  pull-quote(
    [She often goes out of her way to build things that genuinely help others learn… To me, that is what true empowerment looks like.],
    attribution: [Lesley Gao · She Sharp website team])
  pull-quote(
    [What I witnessed doesn't show up on a resume: her instinct to mentor. She's the kind of person who genuinely raises the bar for everyone around her.],
    attribution: [Shivani Dhandabani · AI hackathon])
  v(10pt)
  block(above: 0pt, below: 0pt, {
    set par(leading: leading-body-x, justify: false)
    text(size: size-tiny-x, fill: muted, style: "italic")[
      All 24 recommendations in full: #link("https://www.linkedin.com/in/chanmeng666/")[linkedin.com/in/chanmeng666].
    ]
  })
  pagebreak()
}
```

- [ ] **Step 3: Replace `x-recognition()`**

```typst
#let x-recognition() = {
  chapter-opener("6", "Recognition",
    kicker: [Where the work has been seen.])
  photo("/public/articles/un-women-csw69.jpeg", caption: [Speaking at UN CSW69, UN HQ New York — March 2025.], w: 82%)
  v(16pt)
  block(above: 0pt, below: 0pt, {
    set text(size: size-body-x, fill: ink)
    set par(leading: leading-body-x, justify: false)
    set list(marker: text(fill: accent, size: 6pt)[•], indent: 0pt, body-indent: 8pt, spacing: 11pt)
    list.item[*UN CSW69 Speaker* — UN HQ, New York, March 2025 · drew IBM pilot interest and an endorsement from Sierra Leone's Minister of Gender and Children's Affairs.]
    list.item[*Outstanding Mentor Award* — AI Hackathon Festival 2025 · 1 of 14 expert mentors, guiding 11 teams / 80+ participants.]
    list.item[*UN Women FemTech Hackathon — Outstanding Performer* — FemTech Weekend, Beijing, March 2025.]
    list.item[*Excellence Award* — FemTech China, Women's Health Technology Challenge, December 2024.]
    list.item[Guest on three podcasts — #link("https://open.spotify.com/show/0PDYYnZhKwV7PdWHeK7nbj")[Decoding the Future], #link("https://open.spotify.com/show/201m2sZ5VNAEGKRBzf2ZZ4")[Future Turing], and #link("https://open.spotify.com/show/03tRh6SNm92ut5zpMmR0LL")[Praxis and Pages].]
  })
  pagebreak()
}
```
(Award dates/titles must match `data/profile/30-recognition.yaml` — grep to confirm before finalizing; correct any drift.)

- [ ] **Step 4: Verify `x-backcover()` (from Task 4) still reads well** — no change expected, but confirm the monkey mark + link line render on a footer-less final page.

- [ ] **Step 5: Compile + page-count.** Run compile + snippet. Expected: exit 0.

- [ ] **Step 6: Render + eyeball pp13–16.** Open `ext-13..16.png`. Confirm: **all 24 avatars present** on p13 (count them); two featured quotes on p14; UN photo + award list on p15; back cover clean on p16. **Red-line check:** award list carries no cost/pricing framing and no third-party private names.

- [ ] **Step 7: Commit**

```powershell
git -C "$WT" add cv/extended.typ
git -C "$WT" commit -m "feat(cv-extended): Voices (pp13-14) + Recognition (p15) + back cover (p16)"
```

---

### Task 9: Shot list + cv/README file-map update

**Files:**
- Create: `cv/assets/extended/SHOT-LIST.md`
- Modify: `cv/README.md`

**Interfaces:**
- Consumes: the final set of `img-placeholder("IMG-XX", …)` calls left in `cv/extended.typ`.
- Produces: `SHOT-LIST.md` enumerating every `IMG-XX` for Chan to shoot/replace; updated `cv/README.md` file map.

- [ ] **Step 1: Enumerate the placeholders actually in the book**

```powershell
Select-String -Path cv/extended.typ -Pattern 'img-placeholder\("([^"]+)"'
```
Record each `IMG-XX` id + its description arg. (If any `IMG-STUB` remains, that's a bug — every stub must have been replaced by Tasks 5–8; go fix it before writing the shot list.)

- [ ] **Step 2: Renumber placeholders sequentially IMG-01…**

Edit `cv/extended.typ` so remaining placeholder ids run `IMG-01`, `IMG-02`, … in page order. Recompile to confirm exit 0.

- [ ] **Step 3: Write `SHOT-LIST.md`**

Create `cv/assets/extended/SHOT-LIST.md` with a table: `| IMG id | Page | What to shoot | Suggested source | Orientation |`, one row per `IMG-XX`, plus a short intro: "Replace a placeholder by dropping a compressed (≤400 KB) JPG at the path named in `cv/extended.typ` and rebuilding — the layout is unchanged." Include product-screenshot rows for any live-app screens still unshot (e.g. FemTracker, She Sharp, gradient-svg-generator, redefine decks, tower defence) with orientation guidance (landscape 16:10 for app screens).

- [ ] **Step 4: Update `cv/README.md` file map**

In `cv/README.md`, extend the `## File map` code block to list the extended trio and assets dir:
```
├── chan-meng-cv-extended.typ  # entry point — 16-page «Subtraction / Addition» magazine
├── extended.typ               # magazine chapter content (x-cover … x-backcover)
├── extended-components.typ    # magazine primitives: photo, article-card, avatar-wall, …
├── theme-extended.typ         # spacious *-x tokens + magazine tokens
├── assets/
│   ├── extended/              # curated+compressed magazine photos + MANIFEST + SHOT-LIST
│   └── thumbs/                # legacy small screenshots
```
Also add one sentence under the build table noting `public/chan-meng-cv-extended.pdf` is the 16-page magazine companion built by the same `pwsh cv/build.ps1`.

- [ ] **Step 5: Commit**

```powershell
git -C "$WT" add cv/assets/extended/SHOT-LIST.md cv/README.md cv/extended.typ
git -C "$WT" commit -m "docs(cv-extended): shot list + cv/README file-map update"
```

---

### Task 10: Outward entry point (footer pill) + npm run check

**Files:**
- Modify: `data/profile/90-meta.yaml` (`meta.x_brand.footerLinks`)
- Modify: `scripts/build.mjs` (`readmeOrder`)
- Modify: `templates/partials/footer.hbs` (pill conditional)
- Modify: `data/brand.yaml` (`decorations.buttons.badgeExtended`)
- Regenerated (committed): `README.md`, `llms-full.txt`, `dist/profile.json`, etc.

> **IMPORTANT — deviation from the task brief.** The README footer does **NOT** iterate a generic `links` list. It renders `data._footerLinksReadme`, a **hardcoded 3-label subset** (`["Newsletter","Resume","Buy Me a Coffee"]`) computed in `scripts/build.mjs` (~line 713) from `meta.x_brand.footerLinks`, and each pill's gradient template is chosen by an **exact `{{#if (eq label "…")}}` match** in `footer.hbs` against a `decorations.buttons.badgeXxx` entry in `data/brand.yaml`. So surfacing an "Extended CV" pill requires four coordinated edits, not one YAML line. (There is also an unrelated `basics.profiles[].network: Resume` HackerRank link — leave it alone.)

- [ ] **Step 1: Add the footerLinks entry**

In `data/profile/90-meta.yaml`, under `meta.x_brand.footerLinks:`, add after the existing `Resume` line:
```yaml
      - { label: Extended CV,        url: "https://github.com/ChanMeng666/ChanMeng666/raw/main/public/chan-meng-cv-extended.pdf", description: "A 16-page image-led magazine — who I am and what I make" }
```

- [ ] **Step 2: Add the badge styling in brand.yaml — with a REAL template name**

The gradient-svg-generator API returns HTTP 200 + a fallback pill for an *unknown* template name, so a typo'd template silently renders a wrong-looking pill and a HEAD check won't catch it (known lesson). The new badge's `template` value must be one already in use in `decorations.buttons`. Confirm the allowed set first:
```powershell
Select-String -Path data/brand.yaml -Pattern 'template:\s*"(brand-pill-[a-z]+)"' -AllMatches |
  ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
```
Expected output: `brand-pill-ink`, `brand-pill-mixed`, `brand-pill-orange`, `brand-pill-violet` (verified 2026-07-24 — these four are the only pill templates in use; `badgeResume` uses `brand-pill-ink`, `badgeNewsletter` uses `brand-pill-violet`). If unsure a name maps to a real registered template rather than the 200-fallback, verify it against `D:\github_repository\gradient-svg-generator\src\features\*\templates.js`.

Then, in `data/brand.yaml` under `decorations.buttons:` (near `badgeResume`), add — using `brand-pill-violet`, which is confirmed in-use (by `badgeNewsletter`):
```yaml
      badgeExtended:   { template: "brand-pill-violet",  height: 40, duration: "8s" }
```
(Violet distinguishes it from the ink `badgeResume`; still a Caldera template, no raw hex.)

- [ ] **Step 3: Include the label in the README subset order**

In `scripts/build.mjs`, change the `readmeOrder` array (~line 713) from:
```javascript
  const readmeOrder = ["Newsletter", "Resume", "Buy Me a Coffee"];
```
to:
```javascript
  const readmeOrder = ["Newsletter", "Resume", "Extended CV", "Buy Me a Coffee"];
```

- [ ] **Step 4: Add the pill conditional in footer.hbs**

In `templates/partials/footer.hbs` line 14, inside the `{{#each _footerLinksReadme}}` `src=` URL, add an `Extended CV` branch to each of the two conditional groups (template selector and pillParams), mirroring the `Resume` branches. Add, alongside the existing `{{#if (eq label "Resume")}}…badgeResume.template…{{/if}}`:
```handlebars
{{#if (eq label "Extended CV")}}{{@root.decorations.buttons.badgeExtended.template}}{{/if}}
```
and alongside the `Resume` pillParams branch:
```handlebars
{{#if (eq label "Extended CV")}}{{pillParams @root.decorations.buttons.badgeExtended}}{{/if}}
```

- [ ] **Step 5: Run the full check (validate + build + audit)**

```powershell
npm run check
```
Expected: validate passes (schema + linkedin-sync), freshness/cv gates pass, build regenerates `README.md`/`llms*.txt`/`dist/profile.json`, asset audit passes, exit 0. If `check:freshness --strict` fails on an *unrelated* overdue flagship/active entry, report it to the reviewer (do not bulk-bump `lastUpdated`).

- [ ] **Step 6: Confirm the pill rendered into README**

```powershell
Select-String -Path README.md -Pattern "Extended CV"
```
Expected: at least one match (the footer pill `alt="Extended CV"` / gradient URL). Eyeball that the footer now shows four pills.

- [ ] **Step 7: Verify the new pill's render URL is structurally identical to a sibling pill**

A wrong/typo'd template would still produce a valid-looking `<a><img></a>` in README, so a text match is not enough — compare the generated gradient URL structure against a known-good pill (`Resume`). Extract both pills' `src` and confirm the new one carries a real `&template=brand-pill-violet` (not an empty `&template=`) and a non-empty `pillParams`:
```powershell
Select-String -Path README.md -Pattern 'alt="(Resume|Extended CV)"' -Context 0,0
(Select-String -Path README.md -Pattern 'api/svg\?[^"]*alt="Extended CV"').Line
```
Expected: the Extended CV `src` contains `template=brand-pill-violet` and the same `&height=40&duration=8s` tail and non-empty color/text params as the Resume pill — i.e. same URL shape, only the label text + template color differ. If `&template=` is empty or the pill visually renders as a bare fallback gradient, the template name is wrong — return to Step 2.

- [ ] **Step 8: Commit the source edits + regenerated outputs together**

```powershell
git -C "$WT" add data/profile/90-meta.yaml data/brand.yaml scripts/build.mjs templates/partials/footer.hbs README.md llms.txt llms-full.txt dist/profile.json cv/tokens.typ
git -C "$WT" commit -m "feat(readme): add Extended CV footer pill + regenerate surfaces"
```
(Run `git -C "$WT" status` first and stage exactly the files `npm run check` regenerated — the set above is the expected superset; drop any that didn't change.)

---

### Task 11: Final build, 16-page assertion, size + acceptance sweep

**Files:**
- Modify (only if fixing overflow/orphans): `cv/extended.typ`, `cv/theme-extended.typ`
- Regenerated: `public/chan-meng-cv-extended.pdf` (+ the other `build.ps1` outputs)

**Interfaces:**
- Consumes: everything above.
- Produces: a committed 16-page PDF ≤ 10 MB that passes the spec §7 acceptance list.

- [ ] **Step 1: Full one-shot build**

```powershell
pwsh cv/build.ps1
```
Expected: `✓ Build complete` with byte sizes for `public/chan-meng-cv.pdf` (unchanged 2-page CV — must still build) and `public/chan-meng-cv-extended.pdf`.

- [ ] **Step 2: Assert exactly 16 pages**

Run the page-count snippet against `public/chan-meng-cv-extended.pdf`. Expected: **16**. If not 16:
```powershell
typst compile --root . --font-path cv/fonts --format png --ppi 150 cv/chan-meng-cv-extended.typ "$env:SCRATCH\ext-{p}.png"
```
Inspect the boundary pages; adjust `pagebreak()` placement or trim copy (never shrink text size; never undo TYPST_PITFALLS spacing contracts). A too-long chapter usually means one paragraph exceeds the 40–100-word budget — cut it, don't reflow globally.

- [ ] **Step 3: Assert PDF ≤ 10 MB**

Run the size snippet. Expected: `< 10.00 MB`. If over, re-run Task 2's compressor at q68 on the heaviest images (identify with `Get-ChildItem cv/assets/extended/*.jpg | Sort Length -Desc`).

- [ ] **Step 4: Full per-page visual review against spec §7**

Render all pages (PNG snippet). Walk `ext-1.png … ext-16.png` against the spec §2 page table and §7 acceptance list:
  - 16 pages, images (incl. placeholders) are the dominant mass, each page's text within budget.
  - No "unfinished" feel — every gap is a branded `IMG-XX` placeholder with a shot-list row.
  - Every link clickable + correct (spot-check 5: chanmeng.org/cv, Tam-AI-Ti, CopilotKit, a podcast, LinkedIn).
  - **All 24 recommenders on p13.**
  - **Zero red-line content** (re-scan every page's prose against the red-line list).
  - No word-blacklist terms: `Select-String -Path cv/extended.typ -Pattern "delve|realm|intricate|showcasing|pivotal|results-driven|passionate|dynamic professional"` → expect no matches.
  - No stray non-breaking-space tildes: `Select-String -Path cv/extended.typ -Pattern '~\d'` → expect no matches (escape any as `\~`).

- [ ] **Step 5: Fix any overflow / orphan / broken-frame issues found**

Apply minimal fixes (trim copy, move a `pagebreak`, adjust a token). Recompile + re-assert page count = 16 after each change (TYPST_PITFALLS §5). Repeat until clean.

- [ ] **Step 6: Final commit**

```powershell
git -C "$WT" add public/chan-meng-cv-extended.pdf public/chan-meng-cv.pdf public/cv.jsonld public/cv-llms.txt cv/extended.typ cv/theme-extended.typ
git -C "$WT" commit -m "build(cv-extended): final 16-page magazine PDF (≤10MB) + acceptance sweep"
```
(Stage only what actually changed — the `.typ` files only if Step 5 edited them.)

- [ ] **Step 7: Hand back to reviewer**

Report to the orchestrator: page count, PDF size, the shot-list path (`cv/assets/extended/SHOT-LIST.md`) for Chan, and any spec item that needed a judgment call. Per `superpowers:finishing-a-development-branch`, present merge/PR options — do **not** merge without review; the deliverable goes to Chan for eyeball first.

---

## Self-Review

Ran the writing-plans self-review checklist against the spec with fresh eyes.

**1. Spec coverage** — every spec section maps to a task:
- §1 positioning / §2 16-page architecture → Tasks 4–8 (each page's img+text requirements transcribed into the chapter drafts).
- §3 visual system (Caldera tokens, placeholder system) → Task 3 (`img-placeholder`, halftone use) + Global Constraints (no raw hex, no black block).
- §4 copy rules → Global Constraints + per-task red-line/word-blacklist checks.
- §5 red lines → Global Constraints (verbatim) + explicit red-line checks in Tasks 5, 6, 8, 11.
- §6 tech route → Task 2 (assets), Task 3+4 (Typst rewrite), Task 9 (cv/README), Task 10 (meta/footer entry).
- §7 acceptance → Task 11 (16-page assertion, ≤10 MB, 24 recommenders, links, red lines, one-shot build).

**Issues found and fixed while writing:**
1. **Footer is not a generic `links` loop** (task brief assumed `90-meta.yaml links` + a footer that iterates). Reality: `_footerLinksReadme` is a hardcoded 3-label subset in `scripts/build.mjs`, sourced from `meta.x_brand.footerLinks`, with per-label gradient templates in `footer.hbs`→`data/brand.yaml`. Rewrote Task 10 into four coordinated edits (footerLinks entry, `badgeExtended` in brand.yaml, `readmeOrder` in build.mjs, `footer.hbs` conditional) instead of a one-line YAML add.
2. **`sharp` is not installed** anywhere (not root, not og-covers), and there's no ImageMagick; og-covers uses playwright-core (screenshotting, wrong tool for still recompression). Rewrote Task 2 to install `sharp` locally in scratch and drive a deterministic one-off node script with a ≤400 KB assertion + auto-retry — nothing enters the repo but the outputs.
3. **Recommender count is 24, not 23.** `50-references.yaml` has 24 entries and `public/recommendations/` has 24 avatars; the "23" in the current header pill is the *LinkedIn recommendations* count (Daryll Hall is a 24th historical-archive reference). Global Constraints + Task 8 pin the number to 24 with the full verified name→file table.
4. **The current `extended.typ` / `chan-meng-cv-extended.typ` are a conventional CV, not a magazine** — the rewrite replaces both, and the entry-file page geometry needs per-page overrides (full-bleed cover/back via scoped `set page(margin:0pt, footer:none)`, footer on inner pages). Folded into Task 4 with a full skeleton so the book stays compilable/countable from the first content commit.
5. **Two career-change podcast URLs were not in the files I read** — rather than invent them, Task 5 Step 1 is an explicit data lookup with an honest fallback phrasing if only Chan's own shows exist. Flagged to the orchestrator.
6. **Placeholder → shot-list numbering** could drift if authored ad hoc — added Task 9 Step 2 (sequential renumber) so `IMG-XX` ids are stable and every one has a shot-list row (spec §7 "no unfinished feel").

**2. Placeholder scan** — no `TBD`/`implement later`/"add error handling"/"similar to Task N" left. The only intentional literal tokens (`NN.png`, `PODCAST_URL_*`, `REDEFINE_URL`, `TOWERDEF_URL`) are each paired with an explicit lookup step that must resolve them before compile, and each chapter task's eyeball step asserts no such literal survives in the render. Component and copy code blocks are complete, not sketched.

**3. Type/signature consistency** — the seven component signatures defined in Task 3 (`photo(path, caption:, w:)`, `photo-grid(items, cols:, gutter:)`, `img-placeholder(id, desc, ratio:)`, `article-card(cover, title, stats, url)`, `pull-quote(body, attribution:)`, `avatar-wall(people, cols:)`, `chapter-opener(number, title, kicker:)`) are called with exactly those argument names/arities in Tasks 4–8. The entry-file chapter-function names (`x-cover`, `x-opening`, `x-story`, `x-minimalist`, `x-build`, `x-teaching`, `x-voices`, `x-recognition`, `x-backcover`) are defined in `extended.typ` and called in the same order from `chan-meng-cv-extended.typ`. Token names appended in Task 3 (`radius-photo-x`, `size-pull-x`, `avatar-size-x`, `ph-h-*`, `gap-photo-x`) match their use in the component bodies.
