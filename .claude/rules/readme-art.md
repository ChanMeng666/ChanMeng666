---
paths:
  - "scripts/cards/**"
  - "scripts/readme-art/**"
  - "scripts/build-readme-cards.mjs"
  - "scripts/build-readme-art.mjs"
  - "public/cards/**"
  - "public/readme/**"
  - "templates/**"
---

# Rules for README cards, banners, pills and templates

Sources are `file:line` as of 2026-10-16.

## Project cards (`public/cards/<id>.svg` from `scripts/cards/<file>.mjs`)
- Read `docs/animated-svg-cards.md` before making or changing a card.
- A card is drawn in the product's own design system. Nothing on it is drawn by hand: compile it, quote it, or cut it from the film or the live site. Its copy comes from an already-cleared source.
- Register every card by hand in the `CARDS` map of `scripts/build-readme-cards.mjs:25-39`: project id → module file, export prefix, builder name. The id must be a `projects[].id` (`:19-24`). Without the entry the card never builds.
- A module's `*_INPUTS` export lists what it reads from outside this repo. When one is missing the card is skipped and its committed SVG stands (`:21-23`).
- Build one card: `node scripts/build-readme-cards.mjs <id>`; all: `npm run build:cards`. Neither is part of `npm run build`.
- `docs/animated-svg-cards.md` is also a published blog post: edit the file first, then republish.
- Card rules about what shows beside a card on the README: `.claude/rules/projects.md`.

## Banners and pills (`public/readme/`, from `scripts/readme-art/`)
- Each one is listed in `data/brand.yaml › signatures.readmeArt` and drawn in this profile's Caldera system (`scripts/readme-art/kit.mjs:1-4`).
- A pill's label must be the exact text the README shows. `scripts/build.mjs` fails when a pill it needs has no file: add the label to `readmeArt.pills` and run `npm run build:art` (`data/brand.yaml:521-523`).

## Both GitHub canvases
- The only real failure is ink on transparency. An asset with its own background plate is fine. Render it on both light and dark before calling anything broken (`docs/github-theme-aware-assets.md`).

## Own visuals only
- README visuals: the rule is in `CLAUDE.md`. Chan's own live tools are github-visitor-counter and github-readme-suno-cards.
- gradient-svg-generator is not embedded anywhere. Do not bring it back.

## Templates (`templates/**/*.hbs`)
- Keep the blank line between a bare `<img>` and the `###` heading after it. Without it CommonMark's type-7 HTML block swallows the heading (`templates/partials/project-cards.hbs:37-38`).
- Never put a Handlebars comment between the impact headline and the sub-projects conditional: its newline survives as a stray blank line inside the card (`project-cards.hbs:39-41`).
- Never nest a Handlebars comment inside a block comment: the inner close-marker ends the outer one early and the rest of the file stops parsing (`project-cards.hbs:41-43`).
- Templates render generated files (README.md, llms). Edit the template or the shard, never the output.
