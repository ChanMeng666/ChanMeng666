# Extended-CV magazine — icon set

Icons used by `chan-meng-cv-extended.pdf` (back-cover link grid + inline
scanning aids). Sourced from two popular open libraries and **color-baked** to
brand tokens, because Typst's `image()` does NOT inherit `currentColor` — the
SVG must carry a concrete hex (see `cv/TYPST_PITFALLS.md` §6).

Baked color: **Digital Orange `#FC5000`** = brand token `accent`
(`accent-primary` in `cv/tokens.typ`). Ink `#070607` = token `ink` is the other
brand value available if an icon ever needs it; none currently do.

- **Lucide** (line icons) ship `stroke="currentColor" fill="none"`; baked by
  rewriting `stroke` → `#FC5000`.
- **Simple Icons** (brand marks) ship a single `<path>` with no fill (defaults
  to black); baked by adding `fill="#FC5000"` on the root `<svg>`.

Generated in scratch (`D:\.claude-scratch\2026-07-24\cv-rev2\`, `npm i
lucide-static simple-icons`); only the baked outputs below live in the repo.

| File | Library | Version | License | Original glyph | Baked color |
|---|---|---|---|---|---|
| `globe.svg` | Lucide | lucide-static 1.26.0 | ISC | `globe` | stroke `#FC5000` |
| `feather.svg` | Lucide | lucide-static 1.26.0 | ISC | `feather` | stroke `#FC5000` |
| `mail.svg` | Lucide | lucide-static 1.26.0 | ISC | `mail` | stroke `#FC5000` |
| `calendar.svg` | Lucide | lucide-static 1.26.0 | ISC | `calendar` | stroke `#FC5000` |
| `link.svg` | Lucide | lucide-static 1.26.0 | ISC | `link` | stroke `#FC5000` |
| `map-pin.svg` | Lucide | lucide-static 1.26.0 | ISC | `map-pin` | stroke `#FC5000` |
| `github.svg` | Simple Icons | simple-icons 16.27.0 | CC0-1.0 | `github` | fill `#FC5000` |
| `youtube.svg` | Simple Icons | simple-icons 16.27.0 | CC0-1.0 | `youtube` | fill `#FC5000` |
| `linkedin.svg` | Simple Icons | (historical) | CC0-1.0 | `linkedin` (standard mark) | fill `#FC5000` |

## Notes

- **LinkedIn** is no longer shipped by `simple-icons` (removed for brand-policy
  reasons in recent versions). This is the standard LinkedIn glyph path,
  identical to the copy already in `cv/icons/linkedin.svg` used by the 2-page CV,
  recolored to `#FC5000`.
- Back-cover link grid (p16) uses: `globe` → chanmeng.org, `feather` → blog,
  `mail` → newsletter, `linkedin`, `github`, `youtube`, `calendar` → Cal.com.
- Inline scanning aids: `link` before each product-tile URL (pp8–11), `map-pin`
  on the Story timeline location line (p3).
- These are separate from `cv/icons/` (the 2-page CV's own contact-icon set) so
  the two documents can evolve independently.
