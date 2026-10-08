# Fonts the project cards outline

`npm run build:cards` turns text into glyph outlines, so each product's own typefaces are kept
here, one folder per card, static instances only. All are under the SIL Open Font License 1.1.

Cards read faces from each other's folders, so removing a folder can break another card:

| Folder | Also read by |
|---|---|
| `archcanvas/` (Space Grotesk) | `gavigo`, `echook` |
| `gavigo/` (Inter) | `ai-programming` (which has no folder of its own), `a11y-loop` |
| `archlang/` (Archivo 700) | `corde` |

- The Caldera faces (Anton, DM Sans, JetBrains Mono) are read from `cv/fonts/`.
- `tam-ai-ti/` is Inter 4.1 subset with the macron vowels; do not swap in `gavigo/`'s Inter.
- The FemTech Weekend card uses the site's own system faces (Georgia, Segoe UI), read from the
  operating system at build time and not kept in this repo.
