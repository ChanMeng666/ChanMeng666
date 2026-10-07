# Fonts the project cards outline

`npm run build:cards` turns text into glyph outlines, because an SVG shown as an
`<img>` on GitHub cannot load a font. Each card uses its product's own typefaces,
so they are kept here, static instances only. All are under the SIL Open Font
License 1.1.

| Folder | Faces | Used by |
|---|---|---|
| `archlang/` | Archivo 400/600/700, Public Sans 400/600, IBM Plex Mono 400 | `scripts/cards/archlang.mjs` |
| `archcanvas/` | Space Grotesk 400/500/700, Geist Mono 400/500 | `scripts/cards/archcanvas.mjs` |
| `gavigo/` | Inter 400/500/600, Space Grotesk 600 (the other Space Grotesk weights are read from `archcanvas/`) | `scripts/cards/gavigo.mjs` |
| `eatropolis/` | Big Shoulders Display 800, Archivo Narrow 400/600 | `scripts/cards/eatropolis.mjs` |

The Caldera faces (Anton, DM Sans, JetBrains Mono) are read from `cv/fonts/`. The She Sharp card uses them.
The FemTech Weekend card uses the site's own system faces (Georgia, Segoe UI), which are
read from the operating system at build time and are not kept in this repo.
