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
| `shesharp/` | Bricolage Grotesque 700/800, Instrument Sans 400/500/600, Carattere 400 | `scripts/cards/shesharp.mjs` |
| `eatropolis/` | Big Shoulders Display 800, Archivo Narrow 400/600 | `scripts/cards/eatropolis.mjs` |
| `echook/` | JetBrains Mono 700, Noto Emoji 400 (the status line's emoji); Space Grotesk 500/700 are read from `archcanvas/` | `scripts/cards/echook.mjs` |
| `google-news-mcp/` | Outfit 400/700 | `scripts/cards/google-news-mcp.mjs` |
| (none) | Inter 400/500, read from `gavigo/` | `scripts/cards/ai-programming.mjs` |
| `a11y-loop/` | Inter Tight 400/500, JetBrains Mono 500; Inter 400/500 are read from `gavigo/` | `scripts/cards/a11y-loop.mjs` |
| `tam-ai-ti/` | Inter 400/500/600/700 (Inter 4.1, subset with the macron vowels) | `scripts/cards/tam-ai-ti.mjs` |
| `corde/` | Archivo 800, Roboto 400/500, Noto Sans Mono 500; Archivo 700 is read from `archlang/` | `scripts/cards/corde.mjs` |

The Caldera faces (Anton, DM Sans, JetBrains Mono) are read from `cv/fonts/`.
The FemTech Weekend card uses the site's own system faces (Georgia, Segoe UI), which are
read from the operating system at build time and are not kept in this repo.
