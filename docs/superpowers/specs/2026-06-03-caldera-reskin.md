# Caldera Re-skin — Personal Brand Visual System v2.0.0

**Date:** 2026-06-03
**Status:** Implemented
**Supersedes the visual layer of:** `2026-06-03-brand-system-design.md` (v1.0.0 editorial-academic)

## Context

The v1.0.0 brand was an "editorial-academic minimal" identity (warm paper canvas, navy + gold,
Fraunces serif, golden-ratio layout). Chan was unhappy with the *aesthetic outcome* — not the
pipeline — and chose a bolder "expressive color-block" direction, supplying a liked reference to
clone: **Caldera "Pixelated Cyber-Playground"** (`DESIGN.md` + DTCG `tokens.json` + Tailwind
`theme.css` + `variables.css`, extracted from caldera.xyz via Refero).

This re-skin clones Caldera's high-contrast digital-arcade look while **keeping the existing
`data/brand.yaml` → CSS/JSON/Typst/HTML pipeline intact**, and additionally emits Caldera-format
artifacts so the brand is also expressed in the standard design.md shape.

## Decisions (locked with the user)

- **Palette:** clone Caldera exactly — basalt `#E2E2DF` canvas, ash `#F7F6F2` cards, abyssal ink
  `#070607`, Digital Orange `#FC5000` accent, Cyber Violet `#524AE9` + Pixel Glare `#F5F28E`
  decorative-only.
- **Type:** Bebas Neue (display, free OFL sub for PP Neue Corp Compact Ultrabold) + DM Sans (body)
  + JetBrains Mono (datestamp house-extension).
- **Shapes:** cards 40px, inputs 100px, buttons 800px; flat — no shadows/elevation gradients.
- **CV print:** "tuned-for-print" — Bebas name/headers + orange accent rules, but small print radii
  and recruiter/ATS-safe density on a white page (no 800px pills, no orange-filled blocks).
- **Logo:** keep `chan-monkey-logo-black.svg` as-is.
- **Format:** hybrid — `brand.yaml` stays the build source; ADD `dist/brand/{design-tokens.json,
  theme.css, variables.css, DESIGN.md}` + a WCAG AA contrast gate.

## What changed

### Source of truth — `data/brand.yaml` (v1.0.0 → v2.0.0)
- `color.raw`: 16 navy/gold/paper swatches → 7 Caldera swatches.
- `color.semantic`: repointed every key (kept names for back-compat) + added `surfaceAccent`,
  `surfaceDecor`, `surfaceGlare`, `onAccent`. All text roles resolve to ink (Caldera hierarchy is
  by weight/size); edges/rules are ink.
- `typography.families`: `displaySerif` → `display` (Bebas Neue), DM Sans body, added `features` key.
- `typography.scale`: Caldera 6-role mapping; 0.02em tracking on display only.
- `spacing`/`radius`/`layout`: 10px element gap, 40px rhythm, 40/100/800 radii, 1200px container.
- `shadow.ambient: none`. Banners/pills retemed to `pixel-art-retro` + `gradientType=pixelArt` with
  custom Caldera `colors`.

### Schema — `schema/brand.schema.json`
- Added `fontFamily.features` (array). Added `bannerSpec.gradientType` + `bannerSpec.colors`
  (hex-without-`#`) so banners/pills can carry the Caldera palette.

### Build pipeline — `scripts/build-brand.mjs` (+ `scripts/lib/load-brand.mjs`)
- Added exported `contrastRatio(hexA, hexB)` (WCAG relative-luminance).
- Added a **contrast gate** that runs before any write: AA pairs for text-on-surface, warn-only for
  large white-on-orange block fills, and hard-fails if a text role resolves to violet or orange.
- Added 4 emitters → `dist/brand/`: `design-tokens.json` (DTCG/W3C), `theme.css` (Tailwind v4
  `@theme`), `variables.css` (plain `:root` + Caldera layout extras), `DESIGN.md` (Caldera-shape
  prose + tables + quick-start). The canonical `tokens.json` (consumed by the README build) is
  untouched — the DTCG file is a **new** filename to avoid the collision.
- Rekeyed the docs-injector and showcase inference maps to Caldera names.

### CV print — `cv/theme.typ`, `cv/sections/header.typ`, `cv/components.typ`, `cv/build.ps1`
- Aliases repointed: `primary`→ink, `accent`→orange (rule/eyebrow only), `sans-display`→Bebas.
  CV-local `muted = #5B5B59` (desaturated ink, AA on basalt) and small print radii (4–6 pt).
- Name + section headers in Bebas Neue (regular weight — Bebas is intrinsically bold); small labels
  stay DM Sans for legibility; orange section rules, portrait ring, bullet markers, link underlines.
- **Fonts vendored** at `cv/fonts/` (Bebas Neue, DM Sans Regular/Medium/Bold, JetBrains Mono — all
  OFL) and `--font-path cv/fonts` added to `cv/build.ps1` for deterministic PDFs.

### Web + README — `templates/brand-system.html.hbs`, `templates/partials/{banner,hero,footer,gold-eyebrow}.hbs`, `scripts/build.mjs`
- Showcase rewritten to the Caldera look: basalt canvas, Bebas headings, orange 800px pills + ink
  ghost pills, flat 40px cards (orange/ash/violet blocks), 4-up grid, ink links, pixelated hero.
- `banner.hbs` + a new `pillParams` helper thread `gradientType` + `colors` into every
  `gradient-svg-generator` URL, so README banners and badge pills render in the Caldera palette.
  Verified the API honours `gradientType=pixelArt` + custom `colorN` (returns recoloured SVG).

## Verification

- `npm run validate` — schema + cross-refs pass (v2.0.0).
- `npm run build:brand` — contrast gate passes; all 7 artifacts emit.
- `npm run build` — README / llms / profile.json regenerate; banner + pill URLs carry Caldera colors.
- `pwsh cv/build.ps1` — CV PDF compiles with vendored fonts; page 1 shows Bebas name + orange rules,
  DM Sans body, recruiter-safe density.
- `public/brand-system.html` reviewed in-browser: Caldera palette, flat 40px cards, pill buttons,
  violet used only as a decorative block.

## Risks accepted

- **Bebas Neue** has a single weight and no ss06/ss10 — used at the name + section-header sizes only;
  small labels stay DM Sans. The `features` token degrades gracefully.
- **White-on-orange** is ~3.35:1 — allowed for large/bold block fills only; ink-on-orange (~5.95:1)
  is preferred for smaller text. Gate warns, doesn't fail.
- **README arcade ceiling** — GitHub strips CSS; the full UI lives in `public/brand-system.html`.
