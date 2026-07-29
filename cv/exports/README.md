# cv/exports/ — manual-upload deliverables

**Tracked in git on purpose.** Everything here is a finished artifact Chan uploads
by hand; nothing here is a web asset.

This directory deliberately sits **outside `public/`** so its contents are never
served from `chanmeng.org`, never resolvable via `raw.githubusercontent.com` as a
"current CV" URL, and never picked up by crawlers or recruiter LLMs as a second,
competing version of the resume. `scripts/audit-assets.mjs` only tracks
`/public/...` references, so files here need no allowlist entry.

Do not add a link to anything in this directory from `README.md`,
`data/profile/90-meta.yaml`, `llms.txt`, or the CV itself.

| File | What it is | Rebuild |
|---|---|---|
| `chan-meng-cv-ats.pdf` | 2-page single-column, photo-free, black-text-only resume built for applicant-tracking systems and machine parsing — hairline section rules and clickable links (email, phone, profiles, every employer, school and project). All nine employers are machine-extractable; the three oldest are single-line entries. Source: `cv/chan-meng-cv-ats.typ` + `cv/ats-components.typ`. | `pwsh cv/build.ps1` |

The public-facing CVs stay where they were: `public/chan-meng-cv.pdf` (canonical
two-column design) and `public/chan-meng-cv-extended.pdf`.

**Filename at upload time:** some portals surface the uploaded filename to
recruiters. Rename to something like `Chan-Meng-Resume.pdf` when uploading; keep
the in-repo name as-is so the build path stays stable.
