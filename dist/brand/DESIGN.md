# Chan Meng — Style Reference
> Caldera clone — risograph zine on warm concrete

**Theme:** light

Chan Meng's personal brand is a faithful clone of the Caldera system: a warm basalt-grey concrete canvas is the backdrop for risograph halftone-dot gradient forms (Digital Orange → Cyber Violet) and a heavy, mixed-case, tightly tracked compact-grotesque display face (Anton). Cards and buttons use generous rounded corners for a friendly, almost toy-like solidity. The atmosphere is editorial yet bold — color is rationed for impact, hierarchy comes from solid color blocks and type weight, and the system stays flat (no shadows, no elevation gradients).

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Basalt Canvas | `#e2e2df` | `--color-basalt-canvas` | Page backgrounds, subtle surfaces |
| Ash White | `#f7f6f2` | `--color-ash-white` | Primary card surfaces, button backgrounds |
| Pure White | `#ffffff` | `--color-pure-white` | Text/icon fills on dark or orange |
| Abyssal Ink | `#070607` | `--color-abyssal-ink` | Heading + body text, strong borders |
| Pure Black | `#000000` | `--color-pure-black` | Icon strokes, densest border work |
| Digital Orange | `#fc5000` | `--color-digital-orange` | Primary buttons, feature cards, brand accent |
| Cyber Violet | `#524ae9` | `--color-cyber-violet` | Decorative background shapes only |
| Pixel Glare | `#f5f28e` | `--color-pixel-glare` | Highlight overlays, graphic accents |

## Tokens — Typography

### Anton — `--font-display`
- **Weights:** 400
- **Role:** Display, headings, and stat numbers — heavy MIXED-CASE compact grotesque, tight. The magazine-cover voice.
- **Note:** Anton is OFL (Google Fonts) and the closest free match to the commercial PP Neue Corp Compact Ultrabold — heavy, condensed, mixed-case. Oswald 700 / Bebas Neue are deeper fallbacks. Single weight (400) renders intrinsically ultra-bold; never faux-bold.

### DM Sans — `--font-body-sans`
- **Weights:** 400, 500, 700
- **Role:** Body, navigation, labels — DM Sans 500, the workhorse.

### Type Scale

| Role | Size | Line Height | Letter Spacing | Token |
|------|------|-------------|----------------|-------|
| display-xl | 189px | 0.94 | 0.02em | `--text-display-xl` |
| display-lg | 64px | 0.95 | 0.02em | `--text-display-lg` |
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
| badge | 16px |
| tag | 20px |
| cardSm | 24px |
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

### Button System
One flat pill system — hierarchy by **fill, not size**. Every variant shares the `--radius-pill` (800px) shape, a DM Sans label, and a 1.5px (transparent-by-default) border so heights line up. Flat: a state is a colour shift + a 1px press, never a shadow.

- **Primary** — solid `Digital Orange` fill, **ink** label (weight 700). The orange fill ALWAYS carries an `Abyssal Ink` label (#070607 → 6:1 AA). Caldera's own button uses a cream label (~3.2:1, which fails AA) — a deliberate, documented deviation for accessibility.
- **Secondary** — transparent with a solid `Abyssal Ink` hairline (1.5px).
- **Tertiary** — a **2px DOTTED** ink edge (signatures.dottedEdge); also used for collapsed accordion rows + carousel controls.
- **Quiet** — `Ash White` fill, no visible edge; low-emphasis (e.g. nav).
- **Icon** — a circle (44px; `sm` 36 / `lg` 56). Ash by default; `--accent` is orange with an ink glyph.

Sizes: `sm` (8×16, 14px) · md (12×24, 16px — default) · `lg` (16×34, 18px). Disabled: 40% opacity, non-interactive. Any button may carry a leading/trailing inline SVG that inherits the label colour.

### Connected Stat Cards
A row of **CREAM** (`40px`) metric cards — a black-`Abyssal Ink` number plus an orange CIRCULAR icon badge top-left — JOINED into one unit by a **cream "dog-bone" connector** (identical fill to the cards) that flares to full width at each card edge and pinches to a thin waist where the grey `Basalt Canvas` halftone bites through (two smooth radius-8 concave fillets; SVG `<path>` copied verbatim from caldera.xyz — use the path alone, NO centre `<rect>`, which would protrude as a square sliver). Never fill these cards orange — orange lives only in the badge. The bones PERSIST at every breakpoint (verified on the live site): row + vertical bones → 2×2 **centre cross-junction** (vertical bones link the top + bottom pairs, horizontal bones link the left + right pairs) → single column with a horizontal bone between every stacked pair. The interlocking-metric motif — reserve for a tight row of closely-related stats.

### Dot-Grid Background
A grey halftone dot field under most sections: a CSS radial-gradient tile of `Abyssal Ink` dots (~2px, ~13% opacity, ~20px spacing) over the `Basalt Canvas`, matching the live caldera.xyz ground. The printed paper that cards float on — never run it at full strength behind body text.

### Circular Icon Badge
`Digital Orange` **circle** (50% radius, ~64px) with a white glyph centred — Caldera's stat / channel mark, anchored top-left of a card. (Caldera uses a full circle, not a squircle.)

### Nested Thumbnail Card
A `40px` ash card with 40px padding holding an inset image at the smaller `--radius-card-sm` (24px) — the rounded-image-inside-rounded-card nesting. Thumbnails carry the orange halftone treatment. Cards stay cream; the active/inactive split is a solid cream card vs. dotted-outline ghost rows (an accordion), **not** an orange fill.

### Pill Input + Arrow
`Paper White` (or transparent on a colored panel) field, 1px ink border, `--radius-input` (100px) full pill, with a circular submit button (▸) seated at the right end. No focus glow — the border thickens to 2px on focus.

## Interaction & States

Flat-consistent: every state change is a **color shift or a tiny translate — never a shadow**. Transitions use the motion tokens (`--duration-base` 200ms / `--easing-standard` for color & border; `--duration-fast` 120ms for transform).

| Element | Hover | Active / Selected | Focus (keyboard) |
|---|---|---|---|
| Primary · accent-icon · CTA | darken orange ~12% toward ink | `translateY(1px)` press | orange focus ring |
| Secondary (ink hairline) | invert to a solid ink fill, label → canvas | `translateY(1px)` | orange focus ring |
| Tertiary (dotted) | edge solidifies to an orange fill + ink label | `translateY(1px)` | orange focus ring |
| Quiet (ash) | ash deepens toward ink | `translateY(1px)` | orange focus ring |
| Ash icon button | fills orange, glyph inverts to ink | `translateY(1px)` | orange focus ring |
| Nav / footer link | label → ink + orange underline | — | orange focus ring |
| Content card | lift 3px (`translateY`) | — | — |
| Connected stat card | no lift (would tear it off its cream bone) | — | — |
| Accordion item | ghost row firms to a cream fill + ink border | selected = solid cream card, description expands | — |
| Carousel arrow | button fills orange, ink arrow inverts to white | — | orange focus ring |
| Pill input | — | — | border thickens to 2px (no glow) |

The focus ring is `--shadow-focus-ring` (`0 0 0 3px rgba(252, 80, 0, 0.40)`). All motion is disabled under `prefers-reduced-motion: reduce`.

## Accessibility — WCAG 2.2 Level AA

- Body / small text must clear 4.5:1; large text (≥24px, or ≥18.66px bold) and UI/graphics must clear 3:1.
- Small text on the Digital Orange fill is Abyssal Ink (#070607 on #FC5000 = 6.06:1). Pure White on orange is 3.34:1 — use it ONLY for large/bold stat numbers.
- Small text on the Cyber Violet fill is Pure White (#FFFFFF on #524AE9 = 5.97:1); never ink (ink on violet is only 3.4:1).
- Digital Orange is NEVER a text colour on a light surface (≤2.7:1) — only a block fill, a rule, or an underline/border accent.
- Keyboard focus is always visible via the orange focus ring (shadow.focusRing); state is never conveyed by colour alone (border-style, fill, and underline carry it too).
- Honour prefers-reduced-motion: reduce — disable transitions and animation.

## Do's and Don'ts

### Do
- Use `Digital Orange (#fc5000)` as the exclusive fill for primary CTAs and key feature cards.
- Apply the display face (Anton) to the name, all headings, and stat numbers in MIXED case, with 0.02em tracking.
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

Functional and abstract, with a risograph print feel. The signature treatment is a HALFTONE DOT GRADIENT — a two-stop ramp from Digital Orange (#FC5000) to Cyber Violet (#524AE9) rendered as a field of dots whose radius scales across the gradient, clipped to a 40px-rounded panel. Used for hero panels and card thumbnails (see public/brand/halftone-*.svg). Product screenshots and logos render as monochrome ink outlines or white fills inside ash-white cards — let the UI be protagonist. Flat and printed, never glossy; depth comes from surface color shifts, not shadows. Real assets over stock.

## Quick Start

### CSS Custom Properties

```css
/* GENERATED FROM data/brand.yaml — DO NOT EDIT.
 * Regenerate with: npm run build:brand
 * Source of truth: data/brand.yaml v2.1.1
 * Last updated:    2026-06-07
 */

:root {
  /* Colors */
  --color-basalt-canvas: #e2e2df;
  --color-ash-white: #f7f6f2;
  --color-pure-white: #ffffff;
  --color-abyssal-ink: #070607;
  --color-pure-black: #000000;
  --color-digital-orange: #fc5000;
  --color-cyber-violet: #524ae9;
  --color-pixel-glare: #f5f28e;

  /* Typography — families */
  --font-display: Anton, Oswald, 'Bebas Neue', Impact, sans-serif;
  --font-body-sans: 'DM Sans', Inter, 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', Consolas, ui-monospace, monospace;

  /* Typography — scale */
  --text-display-xl: 189px;
  --leading-display-xl: 0.94;
  --tracking-display-xl: 0.02em;
  --text-display-lg: 64px;
  --leading-display-lg: 0.95;
  --tracking-display-lg: 0.02em;
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
  --radius-badge: 16px;
  --radius-tag: 20px;
  --radius-card-sm: 24px;
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
 * Source of truth: data/brand.yaml v2.1.1
 * Last updated:    2026-06-07
 */

@theme {
  /* Colors */
  --color-basalt-canvas: #e2e2df;
  --color-ash-white: #f7f6f2;
  --color-pure-white: #ffffff;
  --color-abyssal-ink: #070607;
  --color-pure-black: #000000;
  --color-digital-orange: #fc5000;
  --color-cyber-violet: #524ae9;
  --color-pixel-glare: #f5f28e;

  /* Typography — families */
  --font-display: Anton, Oswald, 'Bebas Neue', Impact, sans-serif;
  --font-body-sans: 'DM Sans', Inter, 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', Consolas, ui-monospace, monospace;

  /* Typography — scale */
  --text-display-xl: 189px;
  --leading-display-xl: 0.94;
  --tracking-display-xl: 0.02em;
  --text-display-lg: 64px;
  --leading-display-lg: 0.95;
  --tracking-display-lg: 0.02em;
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
  --radius-badge: 16px;
  --radius-tag: 20px;
  --radius-card-sm: 24px;
  --radius-card: 40px;
  --radius-default: 40px;
  --radius-input: 100px;
  --radius-pill: 800px;
}
```

<!-- Generated from data/brand.yaml v2.1.1 (2026-06-07). Do not edit by hand. -->
