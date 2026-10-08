# Theme-aware visual assets — this repo's status

The technique and the verification scripts live in
[readme-theme-assets-skill](https://github.com/ChanMeng666/readme-theme-assets-skill).
This file records only what applies here.

## Status

- **README hero mark** (`templates/partials/hero.hbs`): a `<picture>` swap. Light
  readers get `chan-monkey-live.svg`, dark readers `chan-monkey-live-on-white.svg`.
  Both are vendored from `chan-meng-personal-brand-logo`, which owns the artwork
  and the derivation. Do not edit or regenerate them here.
- **Nothing outstanding.** The hero mark was the only genuine failure.

## The false positive (commit `bb3223d`)

An earlier revision listed three more "offenders". All three are fine in both
themes and were deliberately not changed, verified by rendering on `#ffffff` and
`#0d1117`:

- `public/github-cover.svg`: its first paint op is a full-bleed `#E2E2DF` rect.
  The `#070607` is ink on that plate, never on transparency.
- The visitor flag map (`theme=github_dark`) and the Suno cards (`theme=dark`):
  self-contained dark assets carrying their own background. A dark card on a
  white page is a style choice, not a legibility failure.

**Ink on transparency fails. Ink on its own plate does not.** The wrong claim came
from counting colour declarations (9× `#070607` against 1× `#E2E2DF`) and treating
frequency as area; the single declaration was the background. A palette grep
finds candidates and never reaches a verdict: check for a full-bleed background
rect, then render on both canvases, then report.
