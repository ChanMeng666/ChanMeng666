# Chan Meng — Style Reference
> Pixelated Cyber-Playground (Caldera clone)

**Theme:** light

Chan Meng's personal brand embraces a high-contrast digital-arcade aesthetic: a muted basalt-grey canvas is a stark backdrop for vivid, pixelated orange/violet gradient forms and ultra-bold, tightly tracked display type. Cards and buttons use generous rounded corners for a friendly, almost toy-like solidity. The atmosphere is playful yet authoritative — color is used sparingly for impact, hierarchy comes from solid color blocks, and the system stays flat (no shadows, no elevation gradients).

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Basalt Canvas | `#e2e2df` | `--color-basalt-canvas` | Page backgrounds, subtle surfaces |
| Ash White | `#f7f6f2` | `--color-ash-white` | Primary card surfaces, button backgrounds |
| Pure White | `#ffffff` | `--color-pure-white` | Text/icon fills on dark or orange |
| Abyssal Ink | `#070607` | `--color-abyssal-ink` | Heading + body text, strong borders |
| Digital Orange | `#fc5000` | `--color-digital-orange` | Primary buttons, feature cards, brand accent |
| Cyber Violet | `#524ae9` | `--color-cyber-violet` | Decorative background shapes only |
| Pixel Glare | `#f5f28e` | `--color-pixel-glare` | Highlight overlays, graphic accents |

## Tokens — Typography

### Bebas Neue — `--font-display`
- **Weights:** 400
- **Role:** Display, headings, and stat numbers — ultra-bold compact, tight.
- **Note:** Bebas Neue & Anton are OFL (Google Fonts). Substitute for the commercial PP Neue Corp Compact Ultrabold.

### DM Sans — `--font-body-sans`
- **Weights:** 400, 500, 700
- **Role:** Body, navigation, labels — DM Sans 500, the workhorse.

### Type Scale

| Role | Size | Line Height | Letter Spacing | Token |
|------|------|-------------|----------------|-------|
| display | 96px | 0.94 | 0.02em | `--text-display` |
| h-1 | 56px | 0.94 | 0.02em | `--text-h-1` |
| h-2 | 32px | 0.95 | 0.02em | `--text-h-2` |
| h-3 | 30px | 1.11 | — | `--text-h-3` |
| body | 16px | 1.55 | — | `--text-body` |
| body-lead | 18px | 1.5 | — | `--text-body-lead` |
| meta | 14px | 1.25 | — | `--text-meta` |
| eyebrow | 14px | 1.2 | 0.08em | `--text-eyebrow` |
| mono | 13px | 1.5 | — | `--text-mono` |

## Tokens — Spacing & Shapes

**Density:** comfortable

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 0 | 0px | `--spacing-0` |
| 1 | 8px | `--spacing-1` |
| 2 | 16px | `--spacing-2` |
| 3 | 24px | `--spacing-3` |
| 4 | 32px | `--spacing-4` |
| 5 | 40px | `--spacing-5` |
| 6 | 48px | `--spacing-6` |
| 7 | 56px | `--spacing-7` |
| 8 | 64px | `--spacing-8` |
| 10 | 80px | `--spacing-10` |
| 0.5 | 4px | `--spacing-0-5` |
| 1.25 | 10px | `--spacing-1-25` |
| 1.5 | 12px | `--spacing-1-5` |
| 2.5 | 20px | `--spacing-2-5` |

### Border Radius

| Element | Value |
|---------|-------|
| none | 0px |
| sm | 8px |
| card | 40px |
| default | 40px |
| input | 100px |
| pill | 800px |

### Layout

- **Page max-width:** 1200px
- **Section gap:** 40px
- **Card padding:** 40px
- **Element gap:** 10px

## Components

### Primary Action Button
Filled button: `Digital Orange (#fc5000)` background, `Pure White (#ffffff)` text (DM Sans 500), `800px` border-radius for a full pill, compact 12px/24px padding.

### Ghost Button
Transparent background, `Abyssal Ink (#070607)` border and text (DM Sans 500), `800px` border-radius — a minimal pill outline.

### Feature / Stats Card — Accent
`Digital Orange (#fc5000)` background, `40px` radius, 40px padding. Numbers in `Pure White` using the display face; labels in DM Sans.

### Content Card — Ash
`Ash White (#f7f6f2)` background, `40px` radius, 40px padding, ink text. No shadow.

## Do's and Don'ts

### Do
- Use `Digital Orange (#fc5000)` as the exclusive fill for primary CTAs and key feature cards.
- Apply the display face (Bebas Neue) to the name, all headings, and stat numbers, with 0.02em tracking.
- Use `Basalt Canvas (#e2e2df)` as the page background so accent colors pop.
- Keep pill buttons at `800px` and cards at `40px` for consistent friendly geometry.
- Render text in `Abyssal Ink (#070607)` on ash / basalt surfaces.

### Don't
- Don't use pure white as a page background — reserve it for text on dark/orange fills.
- Don't use `Cyber Violet (#524ae9)` as a text or UI color — it is decorative-only.
- Don't put `Digital Orange` as small body or link text on light — it fails contrast; links are ink.
- Don't introduce shadows or elevation gradients — the system is flat.
- Don't use generic sans for headlines — the compact ultrabold face is the brand signature.

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 1 | Basalt Canvas | `#e2e2df` | Base page background |
| 2 | Ash White | `#f7f6f2` | Card backgrounds, containers |
| 3 | Digital Orange | `#fc5000` | Feature cards, primary button fills |

## Imagery

Functional and abstract. Large, bold, two-tone pixelated graphics in Digital Orange and Cyber Violet as hero / module backgrounds. Product screenshots and logos render as monochrome ink outlines or white fills inside ash-white cards — let the UI be protagonist. Real assets over stock.

## Quick Start

### CSS Custom Properties

```css
/* GENERATED FROM data/brand.yaml — DO NOT EDIT.
 * Regenerate with: npm run build:brand
 * Source of truth: data/brand.yaml v2.0.0
 * Last updated:    2026-06-03
 */

:root {
  /* Colors */
  --color-basalt-canvas: #e2e2df;
  --color-ash-white: #f7f6f2;
  --color-pure-white: #ffffff;
  --color-abyssal-ink: #070607;
  --color-digital-orange: #fc5000;
  --color-cyber-violet: #524ae9;
  --color-pixel-glare: #f5f28e;

  /* Typography — families */
  --font-display: 'Bebas Neue', Anton, Oswald, Impact, sans-serif;
  --font-body-sans: 'DM Sans', Inter, 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', Consolas, ui-monospace, monospace;

  /* Typography — scale */
  --text-display: 96px;
  --leading-display: 0.94;
  --tracking-display: 0.02em;
  --text-h-1: 56px;
  --leading-h-1: 0.94;
  --tracking-h-1: 0.02em;
  --text-h-2: 32px;
  --leading-h-2: 0.95;
  --tracking-h-2: 0.02em;
  --text-h-3: 30px;
  --leading-h-3: 1.11;
  --text-body: 16px;
  --leading-body: 1.55;
  --text-body-lead: 18px;
  --leading-body-lead: 1.5;
  --text-meta: 14px;
  --leading-meta: 1.25;
  --text-eyebrow: 14px;
  --leading-eyebrow: 1.2;
  --tracking-eyebrow: 0.08em;
  --text-mono: 13px;
  --leading-mono: 1.5;

  /* Typography — weights */
  --font-weight-400: 400;
  --font-weight-500: 500;
  --font-weight-700: 700;

  /* Spacing */
  --spacing-0: 0px;
  --spacing-1: 8px;
  --spacing-2: 16px;
  --spacing-3: 24px;
  --spacing-4: 32px;
  --spacing-5: 40px;
  --spacing-6: 48px;
  --spacing-7: 56px;
  --spacing-8: 64px;
  --spacing-10: 80px;
  --spacing-0-5: 4px;
  --spacing-1-25: 10px;
  --spacing-1-5: 12px;
  --spacing-2-5: 20px;

  /* Layout */
  --page-max-width: 1200px;
  --section-gap: 40px;
  --card-padding: 40px;
  --element-gap: 10px;

  /* Border Radius */
  --radius-none: 0px;
  --radius-sm: 8px;
  --radius-card: 40px;
  --radius-default: 40px;
  --radius-input: 100px;
  --radius-pill: 800px;
  --radius-cards: 40px;
  --radius-inputs: 100px;
  --radius-buttons: 800px;

  /* Surfaces */
  --surface-canvas: #e2e2df;
  --surface-card: #f7f6f2;
  --surface-accent: #fc5000;
}
```

### Tailwind v4

```css
/* GENERATED FROM data/brand.yaml — DO NOT EDIT.
 * Regenerate with: npm run build:brand
 * Source of truth: data/brand.yaml v2.0.0
 * Last updated:    2026-06-03
 */

@theme {
  /* Colors */
  --color-basalt-canvas: #e2e2df;
  --color-ash-white: #f7f6f2;
  --color-pure-white: #ffffff;
  --color-abyssal-ink: #070607;
  --color-digital-orange: #fc5000;
  --color-cyber-violet: #524ae9;
  --color-pixel-glare: #f5f28e;

  /* Typography — families */
  --font-display: 'Bebas Neue', Anton, Oswald, Impact, sans-serif;
  --font-body-sans: 'DM Sans', Inter, 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', Consolas, ui-monospace, monospace;

  /* Typography — scale */
  --text-display: 96px;
  --leading-display: 0.94;
  --tracking-display: 0.02em;
  --text-h-1: 56px;
  --leading-h-1: 0.94;
  --tracking-h-1: 0.02em;
  --text-h-2: 32px;
  --leading-h-2: 0.95;
  --tracking-h-2: 0.02em;
  --text-h-3: 30px;
  --leading-h-3: 1.11;
  --text-body: 16px;
  --leading-body: 1.55;
  --text-body-lead: 18px;
  --leading-body-lead: 1.5;
  --text-meta: 14px;
  --leading-meta: 1.25;
  --text-eyebrow: 14px;
  --leading-eyebrow: 1.2;
  --tracking-eyebrow: 0.08em;
  --text-mono: 13px;
  --leading-mono: 1.5;

  /* Spacing */
  --spacing-0: 0px;
  --spacing-1: 8px;
  --spacing-2: 16px;
  --spacing-3: 24px;
  --spacing-4: 32px;
  --spacing-5: 40px;
  --spacing-6: 48px;
  --spacing-7: 56px;
  --spacing-8: 64px;
  --spacing-10: 80px;
  --spacing-0-5: 4px;
  --spacing-1-25: 10px;
  --spacing-1-5: 12px;
  --spacing-2-5: 20px;

  /* Border Radius */
  --radius-none: 0px;
  --radius-sm: 8px;
  --radius-card: 40px;
  --radius-default: 40px;
  --radius-input: 100px;
  --radius-pill: 800px;
}
```

<!-- Generated from data/brand.yaml v2.0.0 (2026-06-03). Do not edit by hand. -->
