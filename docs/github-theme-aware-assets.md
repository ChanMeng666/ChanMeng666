# Theme-aware visual assets — this repo's status

The **technique** lives in its own skill repo, not here, so there is one copy of it:

> **[readme-theme-assets-skill](https://github.com/ChanMeng666/readme-theme-assets-skill)**
> — the four techniques (`<picture>` swap · bake a background in · parameterise a generator
> URL · redesign so no swap is needed), what GitHub's Markdown sanitiser does to your
> markup, the pitfalls of deriving a second SVG variant, and three runnable verification
> scripts.

This file tracks only what is outstanding **in this repository**.

## Done

- **README hero mark** (`templates/partials/hero.hbs`) — `<picture>`: light readers get the
  transparent `chan-monkey-live.svg`, dark readers get `chan-monkey-live-on-white.svg`.
  Both SVGs are vendored from `chan-meng-personal-brand-logo`, which owns the artwork and
  the derivation (`npm run build:on-white`). Do not edit or regenerate them here.

## Outstanding

Both found by grepping rather than by looking, which is the point — see the skill's
failure #5, "the half-fixed README".

1. **`public/github-cover.svg`** — the full-width animated cover at the bottom of the
   README. Its palette is 9× `#070607` against 1× `#F7F6F2`: near-black ink on
   transparency, the same failure the hero mark had, still live on dark.
   *Fix:* technique B (an on-white derivation — `chan-meng-personal-brand-logo/src/build-on-white.js`
   is the pattern) wrapped in technique A. The cover is built by `svg-animation-studio`, so
   check whether the generator can emit the card directly before deriving one.

2. **Hardcoded dark themes on generated images.** Light-theme readers get dark slabs:
   - `github-visitor-counter` requested with `theme=github_dark`
   - `github-readme-suno-cards` requested with `theme=dark`

   *Fix:* technique C + A — two URLs per image. `github-readme-suno-cards` already models a
   theme as `{ name, dark, light }` (`packages/render/src/themes.ts`), so the light
   rendering exists in the model; confirm the API surface exposes it before writing the URL.

3. **Worth auditing:** several `gradient-svg-generator` pills use `brand-pill-ink`, a
   near-black pill, which will be low-contrast on `#0d1117`.

## Re-running the audit

```bash
# near-black / near-white fills in a local SVG
grep -oE '#[0-9a-fA-F]{6}' public/github-cover.svg | sort | uniq -c | sort -rn

# hardcoded generator themes anywhere in the README
grep -oE 'https://[^"]*theme=[^"&]*' README.md | sort -u
```
