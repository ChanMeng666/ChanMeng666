# Surfaces: register, budget, rules

Hand-written (and linted by `check:copy`): `cv/sections/*.typ`,
`cv/chan-meng-cv-ats.typ`, `cv/extended.typ`, `data/profile/70-linkedin.yaml`,
`cv/cover-letter/*.md`. Everything else is generated.

## Shards

Neutral, complete, over-specified; the surfaces select from them.
`narrative.impactHeadline` leads on business outcome (the CV and GEO surfaces
draw their one-line claim from it). `publicSummary` is the lay-reader version,
`tagline` the dense engineer-facing one.

## Designed two-page CV (`cv/sections/*.typ`)

Narrative, outcome-first, for a human reader. Two pages with no slack:
5 detailed roles (the rest compress into the italic "Previously:" line),
5 project cards of 1–2 bullets, 5 "What I Bring" bullets, 4 recognition bullets.

- No summary opens with a duty verb; each carries one verifiable outcome metric.
- No commit counts or solo percentages; say ownership in words ("sole engineer").
- A product built at an employer is named in Experience and not re-described in
  Projects. Every tool and project appears once in the document.
- A "What I Bring" bullet leads on what the reader gets, then one technical
  signal that actually supports it.

## ATS resume (`cv/chan-meng-cv-ats.typ`)

Action-verb bullets, expanded acronyms. The default upload. It is not
symmetrical with the designed CV on purpose: employers the designed CV mentions
in an aside are full dated entries here, because a parser cannot extract
employment from prose. Do not reconcile the two.

- Its exact shape (headings, role, bullet, project, award counts, character
  band, two pages) is asserted by `EXPECT` in `scripts/lib/parse-ats-resume.mjs`.
  Changing a count is a deliberate edit to `EXPECT`, never a workaround.
- One sentence per bullet; trim words, never the metric. Three-letter months.
  Commas between list items. No bare ` - ` mid-sentence (it extracts as a
  space). No italics.
- After a content edit, bump `date: datetime(...)` by hand (it is the revision
  date) and run `python cv/verify-ats-exports.py`: it is not in CI, and the
  document once sat at three pages unnoticed for three weeks.

## Extended CV (`cv/extended.typ`)

First person, present tense, magazine; the brand document, not the hiring one.

- A caption describes only what is visible in that frame.
- Life detail stays only where it bridges to product taste or engineering.
- Every recommender appears; trim quotes, never drop people.
- What may never appear: the local-only `docs/STATE.private.md`.

## LinkedIn (`70-linkedin.yaml`)

LinkedIn truncates silently past its caps; `check:copy` R9 enforces them and
warns at 90%.

| Section | Cap | Leads with |
|---|---|---|
| Headline | 220 | The value clause, then searchable keywords |
| About | 2,600 | How she helps, before what she achieved; the hook clears the ~300-character fold (~200 on mobile) |
| Experience, per position | 2,000 | The career narrative: who hired her, the mandate, what changed |
| Projects | 2,000 | The artefact: what it is and what it does |

- Career-narrative facts live only in Experience, product facts only in
  Projects. Both serve a recruiter and a technical reviewer in the same words:
  human stakes first, jargon glossed only where load-bearing, named people as
  proof.
- The About ends on "Work With Me — and Who to Send My Way"; keep that section.
- When a headline or About changes, leave the rejected alternates in the shard
  comment above it.
- Dates, titles and award metadata are injected from the canonical sections:
  do not duplicate them in the `linkedin:` block.
- chanmeng.org/blog is the only publishing surface since 2026-07-20. Post on
  LinkedIn and link to the blog; never restart Articles or the Newsletter.

## Cover letters (`cv/cover-letter/`)

A kit: `TEMPLATE.md` (five moves) and `EVIDENCE.md` (sourced sentences in seven
themes, opening with the six red lines). 220–320 words; two evidence moves from
two different themes; every factual sentence traces to a shard.

## GEO sidecars (`public/cv-llms.txt`, `public/cv.jsonld`)

Generated. Keep `cv-llms.txt` under about 200 lines so it fits beside a job
description in one prompt. `cv/build-llms-txt.mjs` hardcodes about 25 lines of
Claude Code architect vocabulary (marked `HARDCODED`); add no facts there.
