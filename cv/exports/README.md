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
| `chan-meng-cv-ats.docx` | The same resume as a real Word document — `Heading1` styles, `w:numPr` bullets, black underlined hyperlinks, Arial, no tables/images/text boxes. **Generated**, parsed straight out of `cv/chan-meng-cv-ats.typ`; its token stream is identical to `pdftotext` on the PDF. | `pwsh cv/build.ps1` |
| `chan-meng-cv-ats.txt` | Plain UTF-8 for "paste your resume" textareas. LF endings, no hard wrapping (one logical unit per line, so a line-oriented parser can't read one bullet as three), macrons and em dashes kept. **Generated** from the same `.typ`. | `pwsh cv/build.ps1` |

**Upload the `.docx` by default; the PDF is the fallback.** On 2026-08-03 Lever
rejected the PDF with "Couldn't auto-read resume" even though that file is
provably clean (single-column, tagged, image-free, 7,185 chars extracting in
correct order under both poppler and pypdf) — the failure was in the PDF
container, not the layout. Word format is Lever's own first recommended fix and
is the most reliably parsed format across Greenhouse, Workday and Taleo. Send
the PDF when a portal demands PDF or when a human will read it; paste the `.txt`
into plain-text fields. This is decided — don't re-litigate it at 11pm before a
deadline.

**The `.docx` and `.txt` are generated; never hand-edit them.** There is
deliberately no second copy of the resume text: both are parsed out of
`cv/chan-meng-cv-ats.typ` by `cv/build-ats-exports.mjs`. Fix the `.typ`, rerun
the build, commit all three artifacts together. A hand-edit is silently
destroyed by the next build and makes the Word file disagree with the PDF.

The public-facing CVs stay where they were: `public/chan-meng-cv.pdf` (canonical
two-column design) and `public/chan-meng-cv-extended.pdf`.

**Filename at upload time:** some portals surface the uploaded filename to
recruiters. Rename to something like `Chan-Meng-Resume.docx` (or
`Chan-Meng-Resume.pdf` when uploading the fallback); keep the in-repo names
as-is so the build paths stay stable.
