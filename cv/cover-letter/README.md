# cv/cover-letter/ — the cover-letter kit

**This is not a generator. It is a quarry.** Two files, both hand-used:

| File | What it is |
| --- | --- |
| [`TEMPLATE.md`](./TEMPLATE.md) | A five-move skeleton with slot markers and a length budget per move. Copy it, fill the slots, delete the guidance. |
| [`EVIDENCE.md`](./EVIDENCE.md) | The evidence bank — pre-written, source-attributed sentences grouped by theme, plus the red lines that must never be crossed. Pick two, one from a different theme than the other. |

Nothing here is built, compiled, or committed as an artifact. There is no
`cover-letter.pdf`, deliberately: a cover letter is written per application and
sent as pasted text or a plain attachment, so a branded PDF pipeline would be
maintenance with no reader. `cv/build.ps1` has no slot for this directory and
should not grow one.

## What to send with it

The CV artifacts are decided elsewhere and this file does not re-litigate them
(see [`../exports/README.md`](../exports/README.md)):

- **`cv/exports/chan-meng-cv-ats.pdf`** — the default upload.
- `cv/exports/chan-meng-cv-ats.docx` — the fallback, when a portal says it
  cannot read the PDF or fails to auto-fill from it.
- `cv/exports/chan-meng-cv-ats.txt` — for "paste your resume" textareas.
- `public/chan-meng-cv.pdf` — when a human asked for a CV by email, not a portal.

Paste the letter into the portal's text field when there is one. Only attach it
as a file when the portal has no field.

## The one rule that makes this worth doing

Every factual sentence in a letter must be traceable to
[`../../data/profile/`](../../data/profile/). `EVIDENCE.md` carries the source id
on every line for exactly this reason. If a sentence you want to write is not in
the bank and not in the data, it does not go in the letter — find the real fact
instead, and add it to the bank so the next letter has it.

## Keeping the bank true

The bank is a copy of facts that live canonically in the profile shards, so it
drifts the same way any second copy drifts. When a number in `data/profile/`
changes, grep this directory for it. The red-line block at the top of
`EVIDENCE.md` is the part that matters most: those six constraints come from
`CV COMPLIANCE` comments in the shards themselves, and breaking one is a
misstatement a reference check would surface.
