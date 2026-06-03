// GENERATED FROM data/brand.yaml — DO NOT EDIT.
// Regenerate with: npm run build:brand
// Source of truth: data/brand.yaml v2.0.0
// Last updated:    2026-06-03

// ─── Raw palette ─────────────────────────────────────────────────────────
#let raw-basalt-canvas = rgb("#E2E2DF")
#let raw-ash-white = rgb("#F7F6F2")
#let raw-pure-white = rgb("#FFFFFF")
#let raw-abyssal-ink = rgb("#070607")
#let raw-digital-orange = rgb("#FC5000")
#let raw-cyber-violet = rgb("#524AE9")
#let raw-pixel-glare = rgb("#F5F28E")

// ─── Semantic tokens (templates consume these) ───────────────────────────
#let canvas-page = rgb("#E2E2DF")
#let canvas-surface = rgb("#F7F6F2")
#let surface-accent = rgb("#FC5000")
#let surface-decor = rgb("#524AE9")
#let surface-glare = rgb("#F5F28E")
#let ink-primary = rgb("#070607")
#let ink-strong = rgb("#070607")
#let ink-muted = rgb("#070607")
#let ink-subtle = rgb("#070607")
#let on-accent = rgb("#FFFFFF")
#let accent-primary = rgb("#FC5000")
#let accent-editorial = rgb("#FC5000")
#let surface-pill = rgb("#F7F6F2")
#let surface-quote = rgb("#F7F6F2")
#let edge-pill = rgb("#070607")
#let rule-hairline = rgb("#070607")

// ─── Typography ──────────────────────────────────────────────────────────
#let font-display = ("Bebas Neue", "Anton", "Oswald", "Impact")
#let font-body-sans = ("DM Sans", "Inter", "Segoe UI")
#let font-mono = ("JetBrains Mono", "Consolas")

// ─── Type scale (print sizes in pt) ──────────────────────────────────────
#let text-display-size = 32pt
#let text-display-leading = 0.94em
#let text-display-tracking = 0.02em
#let text-h-1-size = 22pt
#let text-h-1-leading = 0.94em
#let text-h-1-tracking = 0.02em
#let text-h-2-size = 12pt
#let text-h-2-leading = 0.95em
#let text-h-2-tracking = 0.02em
#let text-h-3-size = 10pt
#let text-h-3-leading = 1.11em
#let text-h-3-tracking = 0pt
#let text-body-size = 9pt
#let text-body-leading = 1.55em
#let text-body-tracking = 0pt
#let text-body-lead-size = 10pt
#let text-body-lead-leading = 1.5em
#let text-body-lead-tracking = 0pt
#let text-meta-size = 8pt
#let text-meta-leading = 1.25em
#let text-meta-tracking = 0pt
#let text-eyebrow-size = 8pt
#let text-eyebrow-leading = 1.2em
#let text-eyebrow-tracking = 0.08em
#let text-mono-size = 8pt
#let text-mono-leading = 1.5em
#let text-mono-tracking = 0pt

// ─── Spacing (pt) ────────────────────────────────────────────────────────
#let space-0 = 0pt
#let space-1 = 8pt
#let space-2 = 16pt
#let space-3 = 24pt
#let space-4 = 32pt
#let space-5 = 40pt
#let space-6 = 48pt
#let space-7 = 56pt
#let space-8 = 64pt
#let space-10 = 80pt
#let space-0-5 = 4pt
#let space-1-25 = 10pt
#let space-1-5 = 12pt
#let space-2-5 = 20pt
#let rhythm-section = 40pt
#let rhythm-section-tight = 24pt
#let rhythm-section-large = 80pt
#let rhythm-card-padding = 40pt
#let rhythm-element-gap = 10pt
#let rhythm-paragraph = 16pt
#let rhythm-column-gutter = 24pt
#let rhythm-column-gutter-mobile = 16pt

// ─── Layout (golden ratio) ───────────────────────────────────────────────
#let golden-main = 61.8%
#let golden-side = 38.2%
#let golden-gutter = 1.4em
