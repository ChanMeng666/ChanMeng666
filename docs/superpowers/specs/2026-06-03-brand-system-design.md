# Personal Visual Design System — Design Spec

**Date:** 2026-06-03
**Status:** Implemented (v1.0.0)
**Living artifacts:** `data/brand.yaml`, `docs/brand/DESIGN.md`, `public/brand-system.html`

---

## Context

This repo is Chan Meng's personal data hub. Before this work, visual styling lived in three disconnected places: hardcoded hex values in `cv/theme.typ`, hardcoded gradient-svg-generator URLs in `templates/partials/*.hbs`, and an ad-hoc `decorations:` block in `data/profile.yaml`. There was no shared design vocabulary, no documented voice principles, and no machine-readable token output that downstream surfaces (chanmeng.org, social cards, newsletter templates, LinkedIn banner) could consume.

This work adds a **second source of truth** — `data/brand.yaml` — that captures the visual and verbal identity as queryable tokens, then builds a pipeline that emits CSS variables, Typst tokens, JSON, an auto-injected `DESIGN.md`, and a live preview page. The brand system becomes the canonical reference for every derived surface.

**Direction (confirmed with user in plan-mode brainstorm):**
- Tone: **Editorial-Academic Minimal** — extends existing CV academic restraint, enacts the "Subtraction for life, addition for thought" philosophy.
- Typography: **Editorial Sans + Display Serif** — Inter (body/UI) + Fraunces (display headlines) + JetBrains Mono (data signatures).
- Color: **Keep navy primary, evolve canvas to warm paper, add academic gold** as second voltage.
- Scope: **Full YAML-driven system** — single brand.yaml drives every emitter.

---

## Architecture

```
data/brand.yaml                                  [single source of truth]
   ↓ schema/brand.schema.json + cross-ref check (validate-brand.mjs)
   ↓ scripts/build-brand.mjs
   ├─→ dist/brand/tokens.css                     CSS variables (raw + semantic)
   ├─→ dist/brand/tokens.json                    Machine-readable canonical
   ├─→ cv/tokens.typ                             Typst tokens (CV imports)
   ├─→ docs/brand/DESIGN.md                      Auto-injected token tables
   └─→ public/brand-system.html                  Live preview page

scripts/build.mjs (modified)
   ↓ loads dist/brand/tokens.json
   ↓ data.brand = tokens
   ↓ data.decorations = adapter from brand.signatures
   └─→ README.md / llms.txt / dist/profile.json  (templates unchanged)

cv/theme.typ (modified)
   ↓ #import "tokens.typ"
   ↓ re-exports under back-compat aliases (primary, accent, ink, ...)
   └─→ public/chan-meng-cv.pdf  (sections unchanged)
```

**Architectural rule:** brand build runs first. Profile build refuses to run without `dist/brand/tokens.json` present (clear error pointing to `npm run build:brand`).

---

## Information architecture

`data/brand.yaml` top-level structure:

| Section | Purpose |
|---|---|
| `version` | Semver; bump on every breaking schema change |
| `identity` | Name, tagline, philosophy, audiences |
| `color.raw` | Paint inventory — named hex swatches |
| `color.semantic` | Role-based tokens that POINT to raw (`canvasPage` → `paper50`) |
| `typography.families` | Display serif, body sans, mono — each with stack, weights, role |
| `typography.scale` | 9-stop named scale; each has sizeWeb, sizePrint, line-height, tracking, weight, family |
| `typography.principles` | 5 rules |
| `spacing` | 8px base + named partial scale + rhythm tokens |
| `radius` | 6 stops |
| `shadow` | ONE rule (ambient) + focus ring |
| `motion` | duration + easing tokens (no animation library) |
| `layout` | golden-ratio split + container max + breakpoints |
| `logo` | primary + monogram + clearspace + do-not |
| `voice` | 6 principles + prefer/avoid vocabulary + do/don't examples |
| `signatures` | 5 micro-signatures + `adoptedInReadme` gate flag + banner/button registries |
| `imagery` | direction + approved + forbidden |
| `surfaces` | per-surface inheritance + overrides |

**Two source-of-truth files, not one merged.** Separation enforces "content authors don't touch tokens; designers don't touch project narratives".

---

## Token proposals (v1.0.0 — preserved from CV palette + warm-paper / gold evolution)

### Color

| Semantic | → Raw | Hex | Notes |
|---|---|---|---|
| `canvasPage` | `paper50` | `#FAF7F2` | Never pure white |
| `canvasSurface` | `paper100` | `#F3EEE5` | Cards |
| `inkPrimary` | `ink700` | `#2A2F36` | Preserves CV `ink` |
| `inkStrong` | `navy700` | `#1A3C5E` | Preserves CV `primary` |
| `inkMuted` | `ink500` | `#5B6470` | Slight evolution from CV `#6B7280` |
| `accentPrimary` | `navy500` | `#2E86AB` | Preserves CV `accent` |
| `accentEditorial` | `gold500` | `#B8843E` | NEW — second voltage |
| `surfacePill` | `navy100` | `#EAF2F7` | Preserves CV `pill-bg` |
| `edgePill` | — | `#B7D2DE` | Preserves CV `pill-edge` |
| `ruleHairline` | — | `#D6DCE2` | Preserves CV `rule` |

Six-stop partial scales (50/100/300/500/700/900), not the full ten — enough for editorial use without enabling drift.

### Typography

3 families × 9 named scale stops × 3 size dimensions (web px, print pt, OpenType weight).

- **Display serif:** Fraunces · weights 400, 600 · used at most once per page
- **Body sans:** Inter · weights 400, 500, 600 · the workhorse
- **Mono:** JetBrains Mono · weights 400, 500 · data signatures only

Scale: `display, h1, h2, h3, body, bodyLead, meta, eyebrow, mono`. Eyebrow is the only uppercased element. Negative tracking on display only.

### Decorative signatures (5)

1. **`heroBand`** — `hologram-interface` gradient, h=200, dur=8s; once per page top
2. **`goldEyebrow`** — eyebrow + accent.editorial + em-dash before display heading
3. **`monoDatestamp`** — mono 13px in ink.muted; format `last updated · YYYY-MM-DD · build N`
4. **`monogramDivider`** — chan-monkey-logo @ 24px between dotted hairlines; replaces bare `---`
5. **`pillRotation`** — existing pills-rainbow/blue/dark/purple vocabulary, centrally tunable

### Voice principles (6)

Architecture-grade vocabulary · Evidence-first · Subtraction for life, addition for thought · Cross-cultural fluency without translation · Pace by white space · Never apologise for restraint.

---

## Implementation (8 PR-sized steps, all green)

| # | Step | Risk | Verification |
|---|---|---|---|
| 1 | `data/brand.yaml` + `schema/brand.schema.json` + `scripts/validate-brand.mjs` | None | `npm run validate` passes |
| 2 | `scripts/build-brand.mjs` emits `dist/brand/tokens.{css,json}` | None | Inspect files |
| 3 | Extend emitter → `cv/tokens.typ` | None | Hex values match CV palette |
| 4 | `cv/theme.typ` becomes thin adapter (`#import "tokens.typ"`) | Low | CV PDF regenerates; visual byte-identical |
| 5 | Move `decorations:` from profile.yaml → brand.yaml; adapter in `build.mjs` | Medium | README byte-identical modulo timestamps |
| 6 | `docs/brand/DESIGN.md` with `<!-- AUTO:tokens -->` fences + snapshots/ | None | DESIGN.md auto-injection works |
| 7 | `templates/brand-system.html.hbs` → `public/brand-system.html` | None | Preview renders correctly; README footer linked |
| 8 | Gated `monogram-divider.hbs` + `gold-eyebrow.hbs` partials | None (flag-gated) | flag=true vs false toggles correctly |

Plus: `docs/ARCHITECTURE.md` updated with brand pipeline; `scripts/audit-assets.mjs` walks brand.yaml with path-filter to skip documentation strings.

---

## Migration details

**cv/theme.typ → thin adapter.** Existing back-compat aliases (`#let primary = ink-strong`, `#let accent = accent-primary`, etc.) preserve byte-equality for every existing import. CV-specific print-tuned size constants (`size-h1=24pt`, `size-h2=9.8pt`, `size-pill=7.6pt`, ...) stay LOCAL because they are print-only and not part of the cross-surface scale.

**Decorations adapter in `scripts/build.mjs`.** One adapter line synthesizes the legacy `data.decorations` shape from `data.brand.signatures` so every existing template partial (`banner.hbs`, `featured-work.hbs`, `footer.hbs`, etc.) keeps working without edits.

**Canonical JSON Resume export now strips `brand` and `decorations`.** These are design tokens, not JSON Resume content. The export at `dist/profile.json` is now cleaner (no decoration sprawl).

---

## Verification (all green as of 2026-06-03)

```pwsh
npm run validate     # ✓ profile.yaml + brand.yaml schemas pass
npm run build:brand  # ✓ emits tokens.{css,json}, cv/tokens.typ, DESIGN.md tables, brand-system.html
npm run build        # ✓ chains build:brand && build.mjs; README/llms/json regenerate
npm run audit        # ✓ only pre-existing missing asset flagged (Prasanth-Pavithran.jpg)
pwsh cv/build.ps1    # ✓ CV PDF compiles (360,293 bytes); font cascade falls back to Segoe UI / Consolas on this machine

start public/brand-system.html
# Verifies: color chips show correct hex; type specimen renders;
# gradient banners load from gradient-svg-generator.vercel.app; monogram shows.
```

---

## Out of scope for v1 (recorded in `docs/brand/DESIGN.md` §12)

- Dark mode (light-only; `color.semantic.dark.*` reserved for v2)
- Motion library (tokens only — no `@keyframes` primitives)
- Component library (no React Button/Card/Pill — chanmeng.org consumer hosts its own)
- Icon system (asset management, not brand)
- Multi-brand support (sub-brands fork tokens.json)
- Font self-hosting (Google Fonts CDN initially)
- A11y contrast validator baked into pipeline (manual for now)

---

## Files created or modified (final list)

**Created:**
- `data/brand.yaml`
- `schema/brand.schema.json`
- `scripts/build-brand.mjs`
- `scripts/validate-brand.mjs`
- `scripts/lib/load-brand.mjs`
- `templates/brand-system.html.hbs`
- `templates/partials/monogram-divider.hbs`
- `templates/partials/gold-eyebrow.hbs`
- `docs/brand/DESIGN.md`
- `docs/brand/snapshots/2026-06-03.json`
- `docs/superpowers/specs/2026-06-03-brand-system-design.md` (this file)

**Generated (do not edit):**
- `dist/brand/tokens.css`
- `dist/brand/tokens.json`
- `cv/tokens.typ`
- `public/brand-system.html`

**Modified:**
- `cv/theme.typ` (thin adapter)
- `scripts/build.mjs` (brand loader + decorations adapter + canonical strip)
- `scripts/audit-assets.mjs` (walks brand.yaml; path-filter regex)
- `data/profile.yaml` (decorations block removed; placeholder comment)
- `templates/README.md.hbs` (3 monogram-divider partials added between major sections; all gated off by default)
- `templates/partials/footer.hbs` (one-line link to brand-system.html)
- `package.json` (build:brand chained before build; validate covers both)
- `docs/ARCHITECTURE.md` (file map + build-pipeline diagram updated for brand pipeline)

---

## Activation guide

The brand system is live but **visually invisible on the README** by default. To turn on the signature monogram dividers and gold eyebrows in the rendered README:

```yaml
# data/brand.yaml
signatures:
  adoptedInReadme: true   # flip from false
```

Then `npm run build`. The change is fully reversible — flip the flag back to `false` and rebuild. The preview at `public/brand-system.html` is unaffected (it always shows the full styled system).

---

## Key design decisions (recorded rationale)

- **Two YAML files, not one merged.** Separates "what" (content) from "how it looks" (form).
- **Semantic + raw color split.** Templates consume semantic; raw is the paint inventory.
- **Six-stop scales, not ten.** Just enough; ten enables drift.
- **Voice principles in YAML, not just markdown.** LLM agents can read tokens.json and align copy.
- **Em-dash codified.** Chan's CV/README already use em-dash consistently — make it a rule.
- **`cv/tokens.typ` co-located, not in `dist/`.** Typst module resolution is file-relative.
- **Static HTML preview, not Next.js.** Preserves repo's zero-frontend-toolchain invariant.
- **Brand build fails loudly if missing.** No silent fallback to defaults.
- **All decorations from own products.** No shields.io, no trophies, no streak/wakatime. Confirmed by user feedback memory.

---

*Implemented end-to-end in one session via the brainstorming → plan → execute pipeline. Plan file: `C:\Users\0\.claude\plans\cv-github-readme-github-readme-md-seo-g-atomic-map.md`.*
