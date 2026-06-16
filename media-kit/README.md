# Speaker & Media Kit

A landscape, magazine-grade **Speaker & Media Kit** for Chan Meng — built for
event organizers (booking talks) and journalists (writing about her). It is a
derived brand product: every fact comes from `data/profile/*.yaml`, and the
visual system is brand-locked to the CV via `../cv/theme.typ` (which is
generated from `data/brand.yaml`).

The layout is **image-forward**: each spread leads with a full-bleed or
half-page photograph, with generous white space, loose leading, and concise
copy.

**Output:** `public/chan-meng-media-kit.pdf` (7 pages, A4 landscape).

## Rebuild

```powershell
pwsh media-kit/build.ps1
```

or directly (from the repo root):

```powershell
typst compile --root . --font-path cv/fonts --font-path media-kit/fonts `
  media-kit/chan-meng-media-kit.typ public/chan-meng-media-kit.pdf
```

`--root .` resolves the `/public/...` image paths. The two `--font-path`s vendor
the brand fonts (`cv/fonts`: Anton / DM Sans / JetBrains Mono) and the icon font
(`media-kit/fonts`: Font Awesome 6 Free Solid) so the PDF renders identically on
any machine / CI with **no system font install required**.

## Files

| File | Purpose |
|---|---|
| `chan-meng-media-kit.typ` | Main document — the 7 pages |
| `theme.typ` | Landscape geometry + marketing type scale; re-exports brand aliases from `../cv/theme.typ` |
| `components.typ` | Editorial components (topic / proof / testimonial / metric cards, chips, image + placeholder panels) |
| `fonts/fa-solid-900.ttf` | Vendored Font Awesome 6 Free Solid (OFL) for the icons |
| `build.ps1` | Build script |

## Pages

1. **Cover** — half-page portrait + editorial panel (name, positioning, contacts).
2. **Bio & Reach** — three copy-paste bios (one-liner / short / long) for editors,
   reach metrics, half-page portrait.
3. **Signature Topics** — five speaking topics + speaking-history proof bar.
4. **On Stage** — speaking-photo gallery (keynote hero + two panel frames) with captions.
5. **Proof & Recognition** — full-width: flagship work, awards, backing.
6. **Press & Praise** — "as featured in" + three testimonials.
7. **Booking** — celebratory photo band + bold dark call-to-action.

## Brand logo

The mark is the transparent-background monkey logo, copied from the
`chan-meng-logo` repo into this repo:

- `public/brands/chan-meng-monkey-black-transparent.svg` (light panels)
- `public/brands/chan-meng-monkey-white-transparent.svg` (the dark closing panel)

## Imagery — what's used and how to swap

Images use absolute repo paths so they work under `--root .`. All references are
in the **Shared asset paths** block at the top of `chan-meng-media-kit.typ`.

| Page | Slot | Asset |
|---|---|---|
| 1 Cover | left portrait | `/public/photos/chanmeng-portrait-2026.jpg` |
| 2 Bio | right portrait | `/public/photos/chan-by-the-tree.jpg` |
| 4 On Stage | keynote hero | `/public/photos/chan-keynote-ai-hackathon-2025.jpg` |
| 4 On Stage | panel ×2 | `/public/photos/chan-panel-shesharp-gesturing.jpg`, `chan-panel-shesharp.jpg` |
| 6 Booking | top band | `/public/photos/chan-celebrate.jpg` |

- The page-4 event photos are real stage shots (AI Hackathon Festival 2025 and
  the She Sharp × Her Waka panel), copied from `Downloads/` and orientation-baked
  (EXIF transpose) so they never render sideways. Swap any by replacing the path
  in the **Shared asset paths** block and rebuilding.
- `public/photos/chan-celebrate.jpg` is a kit-only crop of
  `chan-by-the-sea.jpg` with the "OPEN TO WORK" banner cropped out (the original
  is untouched). Regenerate it by cropping the top ~560px if the source changes.
- Any photo slot can take a different image — swap the path and rebuild.

## Truth maintenance

This is a **point-in-time snapshot** (footer datestamp). Reach metrics mirror
`data/profile/00-basics.yaml › basics.reach` (as of 2026-06). When the profile
data changes, rebuild and re-check the numbers/quotes on pages 2, 4 and 5
against the shards.
