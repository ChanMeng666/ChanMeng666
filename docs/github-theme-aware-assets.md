# Theme-aware visual assets — this repo's status

The **technique** lives in its own skill repo, not here, so there is one copy of it:

> **[readme-theme-assets-skill](https://github.com/ChanMeng666/readme-theme-assets-skill)**
> — the four techniques (`<picture>` swap · bake a background in · parameterise a generator
> URL · redesign so no swap is needed), what GitHub's Markdown sanitiser does to your
> markup, the pitfalls of deriving a second SVG variant, and three runnable verification
> scripts.

This file tracks only what applies **in this repository**.

## Done

- **README hero mark** (`templates/partials/hero.hbs`) — `<picture>`: light readers get the
  transparent `chan-monkey-live.svg`, dark readers get `chan-monkey-live-on-white.svg`.
  Both SVGs are vendored from `chan-meng-personal-brand-logo`, which owns the artwork and
  the derivation (`npm run build:on-white`). Do not edit or regenerate them here.

## Outstanding

**Nothing.** The hero mark was the only genuine failure in this README.

## Checked and deliberately NOT changed

An earlier revision of this file (and commit `bb3223d`) listed three "offenders" here. That
was **wrong**, and the record is corrected rather than quietly deleted because the mistake
is instructive — see the lesson below.

| Asset | Verdict |
|---|---|
| `public/github-cover.svg` | **Fine in both themes.** Its first paint op is `<rect width="1280" height="640" fill="#E2E2DF"/>` — a full-bleed cream plate. The `#070607` is ink *on that plate*, never on transparency. |
| Visitor flag map (`theme=github_dark`) | **Fine in both themes.** NASA satellite imagery: inherently dark, self-contained, and reads as a photograph rather than a themed card. |
| Suno cards (`theme=dark`) | **Fine in both themes.** Self-contained dark cards carrying their own background. A dark card on a white page is a style choice, not a legibility failure. |
| `brand-pill-ink` pills | Cosmetic at most. White label text is legible on `#0d1117`; only the pill's own edge is low-contrast. Left as-is deliberately. |

Verified by rendering all four on `#ffffff` and `#0d1117`, not by reading their source.

## The lesson

**Ink on transparency fails. Ink on its own plate does not.** That is the whole distinction,
and it is invisible to a palette grep.

The earlier claim came from counting colour *declarations* — `github-cover.svg` has 9×
`#070607` against 1× `#E2E2DF` — and treating frequency as area. The single declaration was
the background covering 100% of the canvas. **A palette grep is a way to find candidates,
never a way to reach a verdict.** Check for a full-bleed background rect, then render, then
report.

## Re-running the audit

```bash
# STEP 1 — find candidates (does NOT prove anything)
grep -oE '#[0-9a-fA-F]{6}' public/some-asset.svg | sort | uniq -c | sort -rn

# STEP 2 — is there a full-bleed plate? If yes, the asset is almost certainly fine.
grep -oE '<rect[^>]*width="(100%|[0-9]{3,})"[^>]*fill="[^"]*"' public/some-asset.svg | head -3

# STEP 3 — render on both canvases before concluding
node <skill>/scripts/check-theme-swap.mjs page.html --shots out/
```
