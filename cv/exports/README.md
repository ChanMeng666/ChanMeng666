# cv/exports/ — manual-upload deliverables

Tracked on purpose, and outside `public/` on purpose: nothing here may be
web-served, resolvable as a "current CV" URL, or found by a crawler or
recruiter LLM as a second, competing resume. Never link to this directory from
`README.md`, `data/profile/90-meta.yaml`, `llms.txt` or a CV, and never copy
its files to the site.

All three files are the ATS resume, built by `pwsh cv/build.ps1` from
`cv/chan-meng-cv-ats.typ`. The `.docx` and `.txt` are generated: never
hand-edit them; fix the `.typ`, rebuild, commit all three together.

**Which to upload** (Chan's call, 2026-08-26):

1. `chan-meng-cv-ats.pdf` by default.
2. `chan-meng-cv-ats.docx` as soon as a portal says it cannot read the resume
   or fails to auto-fill name, email or experience. Lever refused the PDF on
   2026-08-03 ("Couldn't auto-read resume") although it is single-column,
   tagged, image-free and extracts in order: the container failed, not the
   layout, so rewriting content does not help.
3. `chan-meng-cv-ats.txt` pasted into plain-text fields.

When a person asks for a CV by email, send `public/chan-meng-cv.pdf` instead.

Some portals show the uploaded filename to recruiters: rename the copy you
upload to `Chan-Meng-Resume.pdf` / `.docx`; keep the in-repo names.
