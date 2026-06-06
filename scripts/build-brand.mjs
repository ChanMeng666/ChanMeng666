#!/usr/bin/env node
// Build pipeline for the personal brand design system.
//
//   data/brand.yaml
//     ↓ ajv schema/brand.schema.json (via lib/load-brand.mjs)
//     ├─→ dist/brand/tokens.css          CSS variables for web surfaces
//     ├─→ dist/brand/tokens.json         Canonical machine-readable tokens
//     └─→ cv/tokens.typ                  Typst tokens (CV imports this)
//
// docs/brand/DESIGN.md auto-inject + brand-system.html rendering are added
// in subsequent PRs (this script is the scaffolding for all of them).

import fs from "node:fs";
import path from "node:path";
import Handlebars from "handlebars";
import { loadBrand, resolveSemanticColors, kebab, repoRoot, contrastRatio } from "./lib/load-brand.mjs";

const brand = loadBrand();
const semanticResolved = resolveSemanticColors(brand);

// ---------------------------------------------------------------------------
// WCAG / palette-policy gate. Runs BEFORE any artifact is written so a
// regression (orange-as-text, violet leaking into a text role, ink/canvas
// contrast loss) fails the build loudly instead of shipping silently.
//
//   - Text-on-surface pairs must clear AA (4.5:1).
//   - Large/bold block fills (white-on-orange) are allowed below 4.5:1 but
//     warned — Caldera uses white-on-orange only at large bold sizes.
//   - Policy hard-fails: any text role resolving to the decorative violet, or
//     the orange accent, would put unreadable color where copy goes.
// ---------------------------------------------------------------------------
function runContrastGate() {
  const R = semanticResolved;
  const hex = (tok) => R[tok];
  const VIOLET = brand.color.raw.cyberViolet;
  const ORANGE = brand.color.raw.digitalOrange;

  const TEXT_ROLES = ["inkPrimary", "inkStrong", "inkMuted", "inkSubtle"];
  // bg/fg pairs that carry real body or heading copy → must clear AA.
  const AA_PAIRS = [
    ["canvasPage", "inkPrimary"], ["canvasPage", "inkStrong"],
    ["canvasSurface", "inkPrimary"], ["canvasSurface", "inkStrong"],
    ["surfacePill", "inkPrimary"], ["surfaceQuote", "inkPrimary"],
    ["surfaceGlare", "inkPrimary"],
  ];
  // Large/bold block fills — informational, warn below threshold.
  const LARGE_PAIRS = [["surfaceAccent", "onAccent"], ["surfaceAccent", "inkPrimary"]];

  const errors = [];
  const warnings = [];

  for (const [bg, fg] of AA_PAIRS) {
    const ratio = contrastRatio(hex(bg), hex(fg));
    if (ratio < 4.5) errors.push(`${fg} on ${bg} = ${ratio.toFixed(2)}:1 (needs ≥4.5:1 for body text)`);
  }
  for (const [bg, fg] of LARGE_PAIRS) {
    const ratio = contrastRatio(hex(bg), hex(fg));
    if (ratio < 3.0) warnings.push(`${fg} on ${bg} = ${ratio.toFixed(2)}:1 — large/bold block fill ONLY (below 3:1 normal-text AA)`);
  }
  // Policy: decorative violet and the orange accent must never BE a text color.
  for (const role of TEXT_ROLES) {
    if (String(hex(role)).toUpperCase() === String(VIOLET).toUpperCase())
      errors.push(`text role ${role} resolves to cyberViolet — violet is decorative-only, never text`);
    if (String(hex(role)).toUpperCase() === String(ORANGE).toUpperCase())
      errors.push(`text role ${role} resolves to digitalOrange — orange is a block/rule, never small text`);
  }

  for (const w of warnings) console.warn(`  ⚠ contrast: ${w}`);
  if (errors.length) {
    console.error("✗ brand contrast gate failed:");
    for (const e of errors) console.error(`    ${e}`);
    process.exit(1);
  }
  console.log(`✓ contrast gate passed (${AA_PAIRS.length} AA pairs, ${warnings.length} large-fill warnings)`);
}
runContrastGate();

const AUTO_HEADER = `/* GENERATED FROM data/brand.yaml — DO NOT EDIT.
 * Regenerate with: npm run build:brand
 * Source of truth: data/brand.yaml v${brand.version}
 * Last updated:    ${brand.lastUpdated ?? "(none)"}
 */`;

// ---------------------------------------------------------------------------
// dist/brand/tokens.css
// ---------------------------------------------------------------------------

function emitCss() {
  const lines = [AUTO_HEADER, "", ":root {"];

  // Raw colors — kebab-cased.
  lines.push("  /* Color — raw palette (paint inventory) */");
  for (const [name, hex] of Object.entries(brand.color.raw)) {
    lines.push(`  --color-raw-${kebab(name)}: ${hex};`);
  }
  lines.push("");

  // Semantic colors — reference raw via var(), so the cascade is preserved.
  lines.push("  /* Color — semantic tokens (templates use these) */");
  for (const [name, ref] of Object.entries(brand.color.semantic)) {
    if (typeof ref === "string" && brand.color.raw[ref] != null) {
      lines.push(`  --color-${kebab(name)}: var(--color-raw-${kebab(ref)});`);
    } else {
      lines.push(`  --color-${kebab(name)}: ${ref};`);
    }
  }
  lines.push("");

  // Typography — font stacks.
  lines.push("  /* Typography — font stacks */");
  for (const [name, fam] of Object.entries(brand.typography.families)) {
    const stack = fam.stack.map((f) => /[ ]/.test(f) ? `"${f}"` : f).join(", ");
    lines.push(`  --font-${kebab(name)}: ${stack};`);
  }
  lines.push("");

  // Typography — scale.
  lines.push("  /* Typography — scale */");
  for (const [name, style] of Object.entries(brand.typography.scale)) {
    const k = kebab(name);
    lines.push(`  --text-${k}-size: ${style.sizeWeb};`);
    lines.push(`  --text-${k}-line-height: ${style.lineHeight};`);
    lines.push(`  --text-${k}-tracking: ${style.tracking};`);
    lines.push(`  --text-${k}-weight: ${style.weight};`);
    lines.push(`  --text-${k}-family: var(--font-${kebab(style.family)});`);
    if (style.transform) {
      lines.push(`  --text-${k}-transform: ${style.transform};`);
    }
  }
  lines.push("");

  // Spacing.
  lines.push("  /* Spacing */");
  for (const [name, value] of Object.entries(brand.spacing.scale)) {
    const safeName = String(name).replace(/\./g, "-");
    lines.push(`  --space-${safeName}: ${value}px;`);
  }
  if (brand.spacing.rhythm) {
    for (const [name, value] of Object.entries(brand.spacing.rhythm)) {
      lines.push(`  --rhythm-${kebab(name)}: ${value}px;`);
    }
  }
  lines.push("");

  // Radius.
  lines.push("  /* Radius */");
  for (const [name, value] of Object.entries(brand.radius)) {
    const unit = name === "pill" ? "px" : "px";
    lines.push(`  --radius-${kebab(name)}: ${value}${unit};`);
  }
  lines.push("");

  // Shadow.
  lines.push("  /* Shadow */");
  for (const [name, value] of Object.entries(brand.shadow)) {
    lines.push(`  --shadow-${kebab(name)}: ${value};`);
  }
  lines.push("");

  // Motion.
  lines.push("  /* Motion */");
  for (const [name, value] of Object.entries(brand.motion.duration)) {
    lines.push(`  --duration-${kebab(name)}: ${value}ms;`);
  }
  for (const [name, value] of Object.entries(brand.motion.easing)) {
    lines.push(`  --easing-${kebab(name)}: ${value};`);
  }
  lines.push("");

  // Layout.
  if (brand.layout) {
    lines.push("  /* Layout */");
    if (brand.layout.golden) {
      lines.push(`  --layout-golden-main: ${brand.layout.golden.main};`);
      lines.push(`  --layout-golden-side: ${brand.layout.golden.side};`);
      lines.push(`  --layout-golden-gutter: ${brand.layout.golden.gutter};`);
    }
    if (brand.layout.container) {
      lines.push(`  --container-max: ${brand.layout.container.max}px;`);
      lines.push(`  --container-padding-mobile: ${brand.layout.container.paddingMobile}px;`);
      lines.push(`  --container-padding-desktop: ${brand.layout.container.paddingDesktop}px;`);
    }
  }
  lines.push("}");
  lines.push("");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// dist/brand/tokens.json — canonical machine-readable tokens.
// Includes both raw (paint inventory) and resolved semantic (hex values, no
// indirection) so external consumers don't need to do the lookup.
// ---------------------------------------------------------------------------

function emitJson() {
  return JSON.stringify({
    _meta: {
      generatedBy: "scripts/build-brand.mjs",
      sourceOfTruth: "data/brand.yaml",
      version: brand.version,
      lastUpdated: brand.lastUpdated ?? null,
    },
    identity: brand.identity,
    color: {
      raw: brand.color.raw,
      semantic: brand.color.semantic,
      semanticResolved,
    },
    typography: brand.typography,
    spacing: brand.spacing,
    radius: brand.radius,
    shadow: brand.shadow,
    motion: brand.motion,
    layout: brand.layout ?? null,
    logo: brand.logo,
    voice: brand.voice,
    signatures: brand.signatures,
    imagery: brand.imagery ?? null,
    surfaces: brand.surfaces ?? null,
  }, null, 2) + "\n";
}

// ---------------------------------------------------------------------------
// cv/tokens.typ — Typst module imported by cv/theme.typ.
// Uses #let bindings; names match the semantic + raw layers in brand.yaml.
// PR-3: this emitter is wired up; cv/theme.typ migrates to consume it in PR-4.
// ---------------------------------------------------------------------------

function emitTypst() {
  const lines = [
    `// GENERATED FROM data/brand.yaml — DO NOT EDIT.`,
    `// Regenerate with: npm run build:brand`,
    `// Source of truth: data/brand.yaml v${brand.version}`,
    `// Last updated:    ${brand.lastUpdated ?? "(none)"}`,
    "",
    "// ─── Raw palette ─────────────────────────────────────────────────────────",
  ];
  for (const [name, hex] of Object.entries(brand.color.raw)) {
    lines.push(`#let raw-${kebab(name)} = rgb("${hex}")`);
  }
  lines.push("");
  lines.push("// ─── Semantic tokens (templates consume these) ───────────────────────────");
  for (const [name, ref] of Object.entries(brand.color.semantic)) {
    const resolved = semanticResolved[name];
    lines.push(`#let ${kebab(name)} = rgb("${resolved}")`);
  }
  lines.push("");
  lines.push("// ─── Typography ──────────────────────────────────────────────────────────");
  // CSS generic families (system-ui, sans-serif, serif, monospace) are not real
  // font names — Typst emits "unknown font family" warnings for them. Strip them
  // from the Typst stack; they remain in the CSS output where they are valid.
  const CSS_GENERICS = new Set(["system-ui", "sans-serif", "serif", "monospace", "ui-monospace", "ui-sans-serif", "ui-serif", "cursive", "fantasy"]);
  for (const [name, fam] of Object.entries(brand.typography.families)) {
    const realFonts = fam.stack.filter((f) => !CSS_GENERICS.has(f));
    const arr = realFonts.map((f) => `"${f}"`).join(", ");
    lines.push(`#let font-${kebab(name)} = (${arr})`);
  }
  lines.push("");
  lines.push("// ─── Type scale (print sizes in pt) ──────────────────────────────────────");
  for (const [name, style] of Object.entries(brand.typography.scale)) {
    const k = kebab(name);
    lines.push(`#let text-${k}-size = ${style.sizePrint}`);
    lines.push(`#let text-${k}-leading = ${style.lineHeight}em`);
    lines.push(`#let text-${k}-tracking = ${style.tracking === "0" ? "0pt" : style.tracking}`);
  }
  lines.push("");
  lines.push("// ─── Spacing (pt) ────────────────────────────────────────────────────────");
  for (const [name, value] of Object.entries(brand.spacing.scale)) {
    const safeName = String(name).replace(/\./g, "-");
    lines.push(`#let space-${safeName} = ${value}pt`);
  }
  if (brand.spacing.rhythm) {
    for (const [name, value] of Object.entries(brand.spacing.rhythm)) {
      lines.push(`#let rhythm-${kebab(name)} = ${value}pt`);
    }
  }
  lines.push("");
  lines.push("// ─── Layout (golden ratio) ───────────────────────────────────────────────");
  if (brand.layout?.golden) {
    lines.push(`#let golden-main = ${brand.layout.golden.main}`);
    lines.push(`#let golden-side = ${brand.layout.golden.side}`);
    lines.push(`#let golden-gutter = ${brand.layout.golden.gutter}`);
  }
  lines.push("");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Caldera-format artifacts — DTCG tokens, Tailwind @theme, plain :root vars,
// and a DESIGN.md spec, all shaped to match the reference design system.
// These sit ALONGSIDE the canonical tokens.css / tokens.json (which the README
// build consumes) — they are the AI-native, standard-format surface.
// ---------------------------------------------------------------------------

const lc = (hex) => String(hex).toLowerCase();
const fontVar = (name) => `--font-${kebab(name)}`;
const fontStackCss = (fam) => fam.stack.map((f) => (/[ ]/.test(f) ? `'${f}'` : f)).join(", ");

// 1) DTCG / W3C design-tokens.json — { $value, $type, $description } leaves.
function emitDtcgJson() {
  const out = { color: {}, font: {}, typography: {}, spacing: {}, radius: {}, surface: {} };

  for (const [name, hex] of Object.entries(brand.color.raw)) {
    out.color[kebab(name)] = { $value: lc(hex), $type: "color", $description: ROLE_TEXT(kebab(name)) };
  }
  for (const [name, fam] of Object.entries(brand.typography.families)) {
    out.font[kebab(name)] = { $value: fam.stack[0], $type: "fontFamily", $description: fam.role };
  }
  for (const [name, s] of Object.entries(brand.typography.scale)) {
    const fam = brand.typography.families[s.family];
    out.typography[kebab(name)] = {
      $value: {
        fontFamily: fam?.stack?.[0] ?? s.family,
        fontSize: s.sizeWeb,
        fontWeight: s.weight,
        lineHeight: s.lineHeight,
        ...(s.tracking && s.tracking !== "0" ? { letterSpacing: s.tracking } : {}),
      },
      $type: "typography",
      $description: s.note ?? `Typography step ${kebab(name)}`,
    };
  }
  for (const [name, v] of Object.entries(brand.spacing.scale)) {
    out.spacing[String(name).replace(/\./g, "-")] = { $value: `${v}px`, $type: "dimension", $description: `Spacing ${v}px` };
  }
  for (const [name, v] of Object.entries(brand.radius)) {
    out.radius[kebab(name)] = { $value: `${v}px`, $type: "dimension", $description: `Border radius ${kebab(name)}` };
  }
  const SURFACES = [
    ["basalt-canvas", semanticResolved.canvasPage, "Surface level 1: page background, subtle dividers"],
    ["ash-white", semanticResolved.canvasSurface, "Surface level 2: card backgrounds, containers"],
    ["digital-orange-accent", semanticResolved.surfaceAccent, "Surface level 3: feature cards, primary button fills"],
  ];
  for (const [k, hex, desc] of SURFACES) {
    out.surface[k] = { $value: lc(hex), $type: "color", $description: desc };
  }
  out.$extensions = {
    "org.chanmeng.brand": {
      source: "data/brand.yaml",
      reference: "Caldera — Pixelated Cyber-Playground",
      version: brand.version,
      generatedAt: brand.lastUpdated ?? null,
    },
  };
  return JSON.stringify(out, null, 2) + "\n";

  function ROLE_TEXT(k) {
    const m = {
      "basalt-canvas": "Basalt Canvas — page backgrounds, subtle surfaces",
      "ash-white": "Ash White — primary card surfaces, button backgrounds",
      "pure-white": "Pure White — text/icon fills on dark or orange",
      "abyssal-ink": "Abyssal Ink — heading + body text, strong borders",
      "pure-black": "Pure Black — icon strokes, densest border work",
      "digital-orange": "Digital Orange — primary buttons, feature cards, brand accent",
      "cyber-violet": "Cyber Violet — decorative background shapes only",
      "pixel-glare": "Pixel Glare — highlight overlays, graphic accents",
    };
    return m[k] ?? k;
  }
}

// 2) Tailwind v4 @theme block.
function emitThemeCss() {
  const L = [AUTO_HEADER, "", "@theme {", "  /* Colors */"];
  for (const [name, hex] of Object.entries(brand.color.raw)) L.push(`  --color-${kebab(name)}: ${lc(hex)};`);
  L.push("", "  /* Typography — families */");
  for (const [name, fam] of Object.entries(brand.typography.families)) L.push(`  ${fontVar(name)}: ${fontStackCss(fam)};`);
  L.push("", "  /* Typography — scale */");
  for (const [name, s] of Object.entries(brand.typography.scale)) {
    const k = kebab(name);
    L.push(`  --text-${k}: ${s.sizeWeb};`);
    L.push(`  --leading-${k}: ${s.lineHeight};`);
    if (s.tracking && s.tracking !== "0") L.push(`  --tracking-${k}: ${s.tracking};`);
  }
  L.push("", "  /* Spacing */");
  for (const [name, v] of Object.entries(brand.spacing.scale)) L.push(`  --spacing-${String(name).replace(/\./g, "-")}: ${v}px;`);
  L.push("", "  /* Border Radius */");
  for (const [name, v] of Object.entries(brand.radius)) L.push(`  --radius-${kebab(name)}: ${v}px;`);
  L.push("}", "");
  return L.join("\n");
}

// 3) Plain :root custom properties + Caldera layout extras.
function emitVariablesCss() {
  const L = [AUTO_HEADER, "", ":root {", "  /* Colors */"];
  for (const [name, hex] of Object.entries(brand.color.raw)) L.push(`  --color-${kebab(name)}: ${lc(hex)};`);
  L.push("", "  /* Typography — families */");
  for (const [name, fam] of Object.entries(brand.typography.families)) L.push(`  ${fontVar(name)}: ${fontStackCss(fam)};`);
  L.push("", "  /* Typography — scale */");
  for (const [name, s] of Object.entries(brand.typography.scale)) {
    const k = kebab(name);
    L.push(`  --text-${k}: ${s.sizeWeb};`);
    L.push(`  --leading-${k}: ${s.lineHeight};`);
    if (s.tracking && s.tracking !== "0") L.push(`  --tracking-${k}: ${s.tracking};`);
  }
  const weights = [...new Set(Object.values(brand.typography.families).flatMap((f) => f.weights))].sort((a, b) => a - b);
  L.push("", "  /* Typography — weights */");
  for (const w of weights) L.push(`  --font-weight-${w}: ${w};`);
  L.push("", "  /* Spacing */");
  for (const [name, v] of Object.entries(brand.spacing.scale)) L.push(`  --spacing-${String(name).replace(/\./g, "-")}: ${v}px;`);
  L.push("", "  /* Layout */");
  L.push(`  --page-max-width: ${brand.layout.container.max}px;`);
  L.push(`  --section-gap: ${brand.spacing.rhythm.section}px;`);
  L.push(`  --card-padding: ${brand.spacing.rhythm.cardPadding}px;`);
  L.push(`  --element-gap: ${brand.spacing.rhythm.elementGap}px;`);
  L.push("", "  /* Border Radius */");
  for (const [name, v] of Object.entries(brand.radius)) L.push(`  --radius-${kebab(name)}: ${v}px;`);
  L.push(`  --radius-cards: ${brand.radius.card}px;`);
  L.push(`  --radius-inputs: ${brand.radius.input}px;`);
  L.push(`  --radius-buttons: ${brand.radius.pill}px;`);
  L.push("", "  /* Surfaces */");
  L.push(`  --surface-canvas: ${lc(semanticResolved.canvasPage)};`);
  L.push(`  --surface-card: ${lc(semanticResolved.canvasSurface)};`);
  L.push(`  --surface-accent: ${lc(semanticResolved.surfaceAccent)};`);
  L.push("}", "");
  return L.join("\n");
}

// 4) Caldera-shaped DESIGN.md — prose + token tables + quick-start.
function emitCalderaDesignMd(variablesCss, themeCss) {
  const R = semanticResolved;
  const colorRows = Object.entries(brand.color.raw)
    .map(([n, hex]) => `| ${titleCase(n)} | \`${lc(hex)}\` | \`--color-${kebab(n)}\` | ${roleOf(kebab(n))} |`).join("\n");
  const typeScaleRows = Object.entries(brand.typography.scale)
    .map(([n, s]) => `| ${kebab(n)} | ${s.sizeWeb} | ${s.lineHeight} | ${s.tracking === "0" ? "—" : s.tracking} | \`--text-${kebab(n)}\` |`).join("\n");
  const spacingRows = Object.entries(brand.spacing.scale)
    .map(([n, v]) => `| ${n} | ${v}px | \`--spacing-${String(n).replace(/\./g, "-")}\` |`).join("\n");
  const radiusRows = Object.entries(brand.radius)
    .map(([n, v]) => `| ${n} | ${v}px |`).join("\n");

  const displayFont = brand.typography.families.display.stack[0];
  return `# ${brand.identity.name} — Style Reference
> Caldera clone — risograph zine on warm concrete

**Theme:** light

${brand.identity.name}'s personal brand is a faithful clone of the Caldera system: a warm basalt-grey concrete canvas is the backdrop for risograph halftone-dot gradient forms (Digital Orange → Cyber Violet) and a heavy, mixed-case, tightly tracked compact-grotesque display face (${displayFont}). Cards and buttons use generous rounded corners for a friendly, almost toy-like solidity. The atmosphere is editorial yet bold — color is rationed for impact, hierarchy comes from solid color blocks and type weight, and the system stays flat (no shadows, no elevation gradients).

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
${colorRows}

## Tokens — Typography

### ${brand.typography.families.display.stack[0]} — \`--font-display\`
- **Weights:** ${brand.typography.families.display.weights.join(", ")}
- **Role:** ${brand.typography.families.display.role}
- **Note:** ${brand.typography.families.display.licenseNote}

### ${brand.typography.families.bodySans.stack[0]} — \`--font-body-sans\`
- **Weights:** ${brand.typography.families.bodySans.weights.join(", ")}
- **Role:** ${brand.typography.families.bodySans.role}

### Type Scale

| Role | Size | Line Height | Letter Spacing | Token |
|------|------|-------------|----------------|-------|
${typeScaleRows}

## Tokens — Spacing & Shapes

**Density:** comfortable

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
${spacingRows}

### Border Radius

| Element | Value |
|---------|-------|
${radiusRows}

### Layout

- **Page max-width:** ${brand.layout.container.max}px
- **Section gap:** ${brand.spacing.rhythm.section}px
- **Card padding:** ${brand.spacing.rhythm.cardPadding}px
- **Element gap:** ${brand.spacing.rhythm.elementGap}px

## Components

### Primary Action Button
Filled button: \`Digital Orange (${lc(R.surfaceAccent)})\` background, \`Pure White (${lc(R.onAccent)})\` text (DM Sans 500), \`${brand.radius.pill}px\` border-radius for a full pill, compact 12px/24px padding.

### Ghost Button
Transparent background, \`Abyssal Ink (${lc(R.inkPrimary)})\` border and text (DM Sans 500), \`${brand.radius.pill}px\` border-radius — a minimal pill outline.

### Feature / Stats Card — Accent
\`Digital Orange (${lc(R.surfaceAccent)})\` background, \`${brand.radius.card}px\` radius, ${brand.spacing.rhythm.cardPadding}px padding. Numbers in \`Pure White\` using the display face; labels in DM Sans.

### Content Card — Ash
\`Ash White (${lc(R.canvasSurface)})\` background, \`${brand.radius.card}px\` radius, ${brand.spacing.rhythm.cardPadding}px padding, ink text. No shadow.

### Button System
One flat pill system — hierarchy by **fill, not size**. Every variant shares the \`--radius-pill\` (${brand.radius.pill}px) shape, a DM Sans label, and a 1.5px (transparent-by-default) border so heights line up. Flat: a state is a colour shift + a 1px press, never a shadow.

- **Primary** — solid \`Digital Orange\` fill, **ink** label (weight 700). The orange fill ALWAYS carries an \`Abyssal Ink\` label (#070607 → 6:1 AA). Caldera's own button uses a cream label (~3.2:1, which fails AA) — a deliberate, documented deviation for accessibility.
- **Secondary** — transparent with a solid \`Abyssal Ink\` hairline (1.5px).
- **Tertiary** — a **2px DOTTED** ink edge (signatures.dottedEdge); also used for collapsed accordion rows + carousel controls.
- **Quiet** — \`Ash White\` fill, no visible edge; low-emphasis (e.g. nav).
- **Icon** — a circle (44px; \`sm\` 36 / \`lg\` 56). Ash by default; \`--accent\` is orange with an ink glyph.

Sizes: \`sm\` (8×16, 14px) · md (12×24, 16px — default) · \`lg\` (16×34, 18px). Disabled: 40% opacity, non-interactive. Any button may carry a leading/trailing inline SVG that inherits the label colour.

### Connected Stat Cards
A row of **CREAM** (\`${brand.radius.card}px\`) metric cards — a black-\`Abyssal Ink\` number plus an orange CIRCULAR icon badge top-left — JOINED into one unit by a **cream "dog-bone" connector** (identical fill to the cards) that flares to full width at each card edge and pinches to a thin waist where the grey \`Basalt Canvas\` halftone bites through (two smooth radius-8 concave fillets; SVG \`<path>\` copied verbatim from caldera.xyz — use the path alone, NO centre \`<rect>\`, which would protrude as a square sliver). Never fill these cards orange — orange lives only in the badge. The bones PERSIST at every breakpoint (verified on the live site): row + vertical bones → 2×2 **centre cross-junction** (vertical bones link the top + bottom pairs, horizontal bones link the left + right pairs) → single column with a horizontal bone between every stacked pair. The interlocking-metric motif — reserve for a tight row of closely-related stats.

### Dot-Grid Background
A grey halftone dot field under most sections: a CSS radial-gradient tile of \`Abyssal Ink\` dots (~2px, ~13% opacity, ~20px spacing) over the \`Basalt Canvas\`, matching the live caldera.xyz ground. The printed paper that cards float on — never run it at full strength behind body text.

### Circular Icon Badge
\`Digital Orange\` **circle** (50% radius, ~64px) with a white glyph centred — Caldera's stat / channel mark, anchored top-left of a card. (Caldera uses a full circle, not a squircle.)

### Nested Thumbnail Card
A \`${brand.radius.card}px\` ash card with ${brand.spacing.rhythm.cardPadding}px padding holding an inset image at the smaller \`--radius-card-sm\` (${brand.radius.cardSm ?? 24}px) — the rounded-image-inside-rounded-card nesting. Thumbnails carry the orange halftone treatment. Cards stay cream; the active/inactive split is a solid cream card vs. dotted-outline ghost rows (an accordion), **not** an orange fill.

### Pill Input + Arrow
\`Paper White\` (or transparent on a colored panel) field, 1px ink border, \`--radius-input\` (${brand.radius.input}px) full pill, with a circular submit button (▸) seated at the right end. No focus glow — the border thickens to 2px on focus.

## Interaction & States

Flat-consistent: every state change is a **color shift or a tiny translate — never a shadow**. Transitions use the motion tokens (\`--duration-base\` ${brand.motion.duration.base}ms / \`--easing-standard\` for color & border; \`--duration-fast\` ${brand.motion.duration.fast}ms for transform).

| Element | Hover | Active / Selected | Focus (keyboard) |
|---|---|---|---|
| Primary · accent-icon · CTA | darken orange ~12% toward ink | \`translateY(1px)\` press | orange focus ring |
| Secondary (ink hairline) | invert to a solid ink fill, label → canvas | \`translateY(1px)\` | orange focus ring |
| Tertiary (dotted) | edge solidifies to an orange fill + ink label | \`translateY(1px)\` | orange focus ring |
| Quiet (ash) | ash deepens toward ink | \`translateY(1px)\` | orange focus ring |
| Ash icon button | fills orange, glyph inverts to ink | \`translateY(1px)\` | orange focus ring |
| Nav / footer link | label → ink + orange underline | — | orange focus ring |
| Content card | lift 3px (\`translateY\`) | — | — |
| Connected stat card | no lift (would tear it off its cream bone) | — | — |
| Accordion item | ghost row firms to a cream fill + ink border | selected = solid cream card, description expands | — |
| Carousel arrow | button fills orange, ink arrow inverts to white | — | orange focus ring |
| Pill input | — | — | border thickens to 2px (no glow) |

The focus ring is \`--shadow-focus-ring\` (\`${brand.shadow.focusRing}\`). All motion is disabled under \`prefers-reduced-motion: reduce\`.

## Accessibility — ${brand.accessibility?.standard ?? "WCAG 2.2 Level AA"}

${(brand.accessibility?.rules ?? []).map((r) => `- ${r}`).join("\n")}

## Do's and Don'ts

### Do
- Use \`Digital Orange (${lc(R.surfaceAccent)})\` as the exclusive fill for primary CTAs and key feature cards.
- Apply the display face (${displayFont}) to the name, all headings, and stat numbers in MIXED case, with 0.02em tracking.
- Use \`Basalt Canvas (${lc(R.canvasPage)})\` as the page background so accent colors pop.
- Keep pill buttons at \`${brand.radius.pill}px\` and cards at \`${brand.radius.card}px\` for consistent friendly geometry.
- Render text in \`Abyssal Ink (${lc(R.inkPrimary)})\` on ash / basalt surfaces.

### Don't
- Don't use pure white as a page background — reserve it for text on dark/orange fills.
- Don't use \`Cyber Violet (${lc(R.surfaceDecor)})\` as a text or UI color — it is decorative-only.
- Don't put \`Digital Orange\` as small body or link text on light — it fails contrast; links are ink.
- Don't introduce shadows or elevation gradients — the system is flat.
- Don't use generic sans for headlines — the compact ultrabold face is the brand signature.

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 1 | Basalt Canvas | \`${lc(R.canvasPage)}\` | Base page background |
| 2 | Ash White | \`${lc(R.canvasSurface)}\` | Card backgrounds, containers |
| 3 | Digital Orange | \`${lc(R.surfaceAccent)}\` | Feature cards, primary button fills |

## Imagery

${brand.imagery.direction}

## Quick Start

### CSS Custom Properties

\`\`\`css
${variablesCss.trim()}
\`\`\`

### Tailwind v4

\`\`\`css
${themeCss.trim()}
\`\`\`

<!-- Generated from data/brand.yaml v${brand.version} (${brand.lastUpdated}). Do not edit by hand. -->
`;

  function titleCase(s) {
    return kebab(s).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  function roleOf(k) {
    const m = {
      "basalt-canvas": "Page backgrounds, subtle surfaces",
      "ash-white": "Primary card surfaces, button backgrounds",
      "pure-white": "Text/icon fills on dark or orange",
      "abyssal-ink": "Heading + body text, strong borders",
      "pure-black": "Icon strokes, densest border work",
      "digital-orange": "Primary buttons, feature cards, brand accent",
      "cyber-violet": "Decorative background shapes only",
      "pixel-glare": "Highlight overlays, graphic accents",
    };
    return m[k] ?? "";
  }
}

// ---------------------------------------------------------------------------
// Write outputs
// ---------------------------------------------------------------------------

const distBrandDir = path.join(repoRoot, "dist", "brand");
if (!fs.existsSync(distBrandDir)) fs.mkdirSync(distBrandDir, { recursive: true });

const cssPath = path.join(distBrandDir, "tokens.css");
const css = emitCss();
fs.writeFileSync(cssPath, css);
console.log(`✓ Wrote dist/brand/tokens.css   (${css.length} bytes)`);

const jsonPath = path.join(distBrandDir, "tokens.json");
const json = emitJson();
fs.writeFileSync(jsonPath, json);
console.log(`✓ Wrote dist/brand/tokens.json  (${json.length} bytes)`);

const typstPath = path.join(repoRoot, "cv", "tokens.typ");
const typst = emitTypst();
fs.writeFileSync(typstPath, typst);
console.log(`✓ Wrote cv/tokens.typ           (${typst.length} bytes)`);

// Caldera-format artifacts (DTCG tokens, Tailwind @theme, :root vars, DESIGN.md).
const dtcg = emitDtcgJson();
fs.writeFileSync(path.join(distBrandDir, "design-tokens.json"), dtcg);
console.log(`✓ Wrote dist/brand/design-tokens.json (${dtcg.length} bytes)`);

const themeCss = emitThemeCss();
fs.writeFileSync(path.join(distBrandDir, "theme.css"), themeCss);
console.log(`✓ Wrote dist/brand/theme.css    (${themeCss.length} bytes)`);

const variablesCss = emitVariablesCss();
fs.writeFileSync(path.join(distBrandDir, "variables.css"), variablesCss);
console.log(`✓ Wrote dist/brand/variables.css (${variablesCss.length} bytes)`);

const calderaDesignMd = emitCalderaDesignMd(variablesCss, themeCss);
fs.writeFileSync(path.join(distBrandDir, "DESIGN.md"), calderaDesignMd);
console.log(`✓ Wrote dist/brand/DESIGN.md    (${calderaDesignMd.length} bytes)`);

// ---------------------------------------------------------------------------
// docs/brand/DESIGN.md — auto-inject token tables between <!-- AUTO:* --> fences.
// Only inject when the doc exists; absence means PR-6 hasn't landed yet.
// ---------------------------------------------------------------------------

const docPath = path.join(repoRoot, "docs", "brand", "DESIGN.md");
if (fs.existsSync(docPath)) {
  const ROLE_FROM_RAW = (rawName) => {
    const inferences = {
      "basalt-canvas": "Page background — the muted base",
      "ash-white": "Card / button surface",
      "pure-white": "Text/icon on dark or orange fills",
      "abyssal-ink": "Text, headings, strong borders",
      "pure-black": "Icon strokes, densest border work",
      "digital-orange": "Primary accent — buttons, feature cards, rules",
      "cyber-violet": "Decorative background shapes ONLY",
      "pixel-glare": "Highlight overlay / graphic accent",
    };
    return inferences[rawName] ?? "";
  };

  const SEMANTIC_USE = (name) => {
    const inferences = {
      "canvas-page": "Default canvas — never pure white",
      "canvas-surface": "Cards, buttons, lifted blocks",
      "surface-accent": "Feature / stat cards, button fill",
      "surface-decor": "Decorative graphic blocks ONLY",
      "surface-glare": "Highlight overlay / graphic accent",
      "surface-tag": "Category-tag / chip background (Hazard Yellow)",
      "ink-primary": "Body text",
      "ink-strong": "Name, section headers",
      "ink-muted": "Secondary text, meta",
      "ink-subtle": "Captions, low emphasis",
      "on-accent": "Text on orange / dark fills (large+bold)",
      "accent-primary": "Primary action, accent rules",
      "accent-editorial": "Eyebrow rules, section marks",
      "surface-pill": "Skill pill background",
      "surface-quote": "Pull-quote background",
      "edge-pill": "Pill / ghost-button border",
      "rule-hairline": "Divider rules, strong borders",
    };
    return inferences[name] ?? "";
  };

  const colorRawRows = Object.entries(brand.color.raw)
    .map(([name, hex]) => `| \`${kebab(name)}\` | \`${hex}\` | ${ROLE_FROM_RAW(kebab(name))} |`)
    .join("\n");

  const colorSemanticRows = Object.entries(brand.color.semantic)
    .map(([name, ref]) => {
      const hex = semanticResolved[name];
      return `| \`--color-${kebab(name)}\` | \`${kebab(ref)}\` | \`${hex}\` | ${SEMANTIC_USE(kebab(name))} |`;
    })
    .join("\n");

  const typeFamilyRows = Object.entries(brand.typography.families)
    .map(([name, fam]) => {
      const stack = fam.stack.join(", ");
      const weights = fam.weights.join(", ");
      return `| \`--font-${kebab(name)}\` | ${stack} | ${weights} | ${fam.role} |`;
    })
    .join("\n");

  const typeScaleRows = Object.entries(brand.typography.scale)
    .map(([name, style]) => {
      const k = kebab(name);
      return `| \`--text-${k}-*\` | ${style.sizeWeb} | ${style.sizePrint} | ${style.lineHeight} | ${style.tracking} | ${style.weight} | ${kebab(style.family)} |`;
    })
    .join("\n");

  const spacingRows = [
    ...Object.entries(brand.spacing.scale).map(([n, v]) => `| \`--space-${String(n).replace(/\./g, "-")}\` | ${v}px |`),
    ...(brand.spacing.rhythm
      ? Object.entries(brand.spacing.rhythm).map(([n, v]) => `| \`--rhythm-${kebab(n)}\` | ${v}px |`)
      : []),
  ].join("\n");

  const shadowRows = Object.entries(brand.shadow)
    .map(([n, v]) => `| \`--shadow-${kebab(n)}\` | \`${v}\` |`)
    .join("\n");

  const radiusRows = Object.entries(brand.radius)
    .map(([n, v]) => `| \`--radius-${kebab(n)}\` | ${v} |`)
    .join("\n");

  const motionRows = [
    ...Object.entries(brand.motion.duration).map(([n, v]) => `| \`--duration-${kebab(n)}\` | ${v}ms |`),
    ...Object.entries(brand.motion.easing).map(([n, v]) => `| \`--easing-${kebab(n)}\` | \`${v}\` |`),
  ].join("\n");

  const fenceBlocks = {
    "color-raw": `| Raw token | Hex | Role |\n|---|---|---|\n${colorRawRows}`,
    "color-semantic": `| Semantic token | → Raw | Hex | Use |\n|---|---|---|---|\n${colorSemanticRows}`,
    "typography-families": `| Family | Stack | Weights | Role |\n|---|---|---|---|\n${typeFamilyRows}`,
    "typography-scale": `| Token | Web | Print | LH | Tracking | Weight | Family |\n|---|---|---|---|---|---|---|\n${typeScaleRows}`,
    "spacing": `| Token | Value |\n|---|---|\n${spacingRows}`,
    "shadow": `| Token | Value |\n|---|---|\n${shadowRows}`,
    "radius": `| Token | Px |\n|---|---|\n${radiusRows}`,
    "motion": `| Token | Value |\n|---|---|\n${motionRows}`,
  };

  let docSrc = fs.readFileSync(docPath, "utf8");
  for (const [name, body] of Object.entries(fenceBlocks)) {
    const re = new RegExp(`<!-- AUTO:${name} -->[\\s\\S]*?<!-- /AUTO:${name} -->`, "g");
    const replacement = `<!-- AUTO:${name} -->\n${body}\n<!-- /AUTO:${name} -->`;
    docSrc = docSrc.replace(re, replacement);
  }
  fs.writeFileSync(docPath, docSrc);
  console.log(`✓ Updated docs/brand/DESIGN.md  (auto-injected ${Object.keys(fenceBlocks).length} token tables)`);
}

// ---------------------------------------------------------------------------
// public/brand-system.html — static preview page rendered from
// templates/brand-system.html.hbs using the live tokens.
// ---------------------------------------------------------------------------

const previewTemplatePath = path.join(repoRoot, "templates", "brand-system.html.hbs");
if (fs.existsSync(previewTemplatePath)) {
  const SEMANTIC_USE = {
    "canvas-page": "Default canvas — never pure white",
    "canvas-surface": "Cards, buttons, lifted blocks",
    "surface-accent": "Feature / stat cards, button fill",
    "surface-decor": "Decorative graphic blocks ONLY",
    "surface-glare": "Highlight overlay / graphic accent",
    "surface-tag": "Category-tag / chip background",
    "ink-primary": "Body text",
    "ink-strong": "Name, section headers",
    "ink-muted": "Secondary text, meta",
    "ink-subtle": "Captions, low emphasis",
    "on-accent": "Text on orange / dark fills",
    "accent-primary": "Primary action, accent rules",
    "accent-editorial": "Eyebrow rules, section marks",
    "surface-pill": "Skill pill background",
    "surface-quote": "Pull-quote background",
    "edge-pill": "Pill / ghost-button border",
    "rule-hairline": "Divider rules, strong borders",
  };
  const RAW_ROLE = {
    "basalt-canvas": "Page background",
    "ash-white": "Card / button surface",
    "pure-white": "On dark / orange fills",
    "abyssal-ink": "Text, headings, borders",
    "pure-black": "Icon strokes, dense borders",
    "digital-orange": "Primary accent",
    "cyber-violet": "Decorative only",
    "pixel-glare": "Highlight accent",
  };

  const colorRawList = Object.entries(brand.color.raw).map(([name, hex]) => ({
    name: kebab(name),
    hex,
    role: RAW_ROLE[kebab(name)] ?? "",
  }));

  const colorSemanticList = Object.entries(brand.color.semantic).map(([name, ref]) => ({
    name: kebab(name),
    ref: kebab(ref),
    hex: semanticResolved[name],
    use: SEMANTIC_USE[kebab(name)] ?? "",
  }));

  const spacingList = [
    ...Object.entries(brand.spacing.scale).map(([n, v]) => ({ name: String(n).replace(/\./g, "-"), value: v })),
  ];

  const pillRotationCount = Object.keys(brand.signatures?.pillRotation?.templates ?? {}).length;

  const context = {
    identity: brand.identity,
    version: brand.version,
    lastUpdated: brand.lastUpdated,
    colorRawList,
    colorSemanticList,
    spacingList,
    signatures: brand.signatures,
    voice: brand.voice,
    pillRotationCount,
  };

  const src = fs.readFileSync(previewTemplatePath, "utf8");
  const tpl = Handlebars.compile(src, { noEscape: false });
  const html = tpl(context);
  const previewOutPath = path.join(repoRoot, "public", "brand-system.html");
  fs.writeFileSync(previewOutPath, html);
  console.log(`✓ Wrote public/brand-system.html (${html.length} bytes)`);
}

console.log(`\nBrand build OK · v${brand.version} · ${brand.lastUpdated ?? "(no date)"}`);
