---
paths:
  - "cv/**"
---

# Rules for the CVs and cover letters

Read `cv/README.md` (build, word blacklist, ATS rules) and `cv/TYPST_PITFALLS.md` before editing a `.typ` file. This file adds only what those two do not say.

## Where a career fact is copied
`CLAUDE.md` names the four places a title, date, metric or award lives. The CV-side copies:
- `cv/sections/*.typ`: hand-written prose for the two-page CV. Dates are checked against `10-career.yaml` by `npm run check:cv` (error); titles and org URLs only warn (`scripts/check-cv-sync.mjs:1-16`).
- `cv/chan-meng-cv-ats.typ`: its own copy on purpose. Also parsed by `scripts/lib/parse-ats-resume.mjs` into `cv/exports/*.{docx,txt}`, so keep each `role-line(...)` call one argument per line (`check-cv-sync.mjs:17-25`).

These also carry titles and dates; **no gate covers them yet** (audit 2026-10-16). Grep them whenever a title or date changes:
- `cv/extended.typ` (the 22-page extended CV)
- `cv/cover-letter/EVIDENCE.md`
- `data/profile/60-network.yaml`, the `organizations[].meta.x_brand.context` strings ("Founding Principal Engineer (Oct 2025 — Sep 2026)" style)
- `docs/ecosystem/lineage.yaml`, the `chanRole` column
- `docs/stories/*.md`, the `role:` front matter

## Typst traps
- `check:cv` is not comment-aware. Never write `role-line` followed by `(` inside a comment in a CV `.typ` file: it is parsed as an entry.
- A bare `~` in markup is a non-breaking space, so `~85%` loses its tilde. Write `\~85%`. Audit with `rg '~\d' cv/**/*.typ` (`cv/TYPST_PITFALLS.md:78-83`).

## Build and site sync
- `pwsh cv/build.ps1` (needs typst) builds the two-page CV, the extended CV and the ATS resume. It is not part of `npm run build`.
- The ATS PDF in `cv/exports/` is the default upload, the `.docx` the fallback, the `.txt` for paste-in fields. `cv/exports/` is never web-served and nothing in it is copied to the site.
- **A rebuild is not finished until the site is synced** (`cv/README.md:11-26`):
  1. Copy only `public/chan-meng-cv.pdf` and `public/chan-meng-cv-extended.pdf` to `D:/github_repository/2d-portfolio/public/`.
  2. In the same commit, bump `PREVIEW_V` in that repo's `src/app/cv/page.tsx`. Without the bump Cloudflare serves the old CV for hours and it looks fine.
  3. Push: push is the deploy. Verify by `sha256sum`, not size.
- Do not rename `public/chan-meng-cv.pdf`: the README "Resume" pill links to it.
