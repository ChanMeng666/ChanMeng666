---
name: career-copy
description: >-
  Use when a career fact changes and copy must change with it (new role,
  project, metric, title, date, award, recommendation), to strengthen or audit
  CV, ATS resume, LinkedIn profile or cover-letter copy, or to judge whether a
  claim is safe to make. Not for visuals or the code that renders surfaces.
---

# Career copy

One fact is written on up to eight surfaces, and a reader may check any two
against each other. Land the fact in its shard, then write it on only the
surfaces that earn it, each in that surface's register.

## Steps

1. **Get the truth from the artefact** (the repo, the API, the live page), not
   from memory or the old copy.
2. **Land it in the shard.** A number goes in `metrics[]`: `check:copy` R8 fails
   any claim-shaped number on a CV, LinkedIn or cover-letter surface that is in
   no shard. "Make this sound stronger" lands nothing; if the rewrite needs a
   new fact, get the fact first.
3. **Find every surface that carries the old fact.** This is the step that gets
   skipped: `grep -rn "<old number or phrase>" data/profile/ cv/ linkedin/`.
   On 2026-09-07 one stale shard entry had become five wrong surfaces while
   every gate passed.
4. **Write it once per surface** (`references/surfaces.md` for budgets and
   rules). Decide what comes out before what goes in: the two-page CV and the
   ATS resume have no slack. Never copy a sentence between surfaces.
5. **Gates:** `npm run check:copy -- --strict`, then `npm run check`. If a CV
   `.typ` changed: `pwsh cv/build.ps1`, `python cv/verify-ats-exports.py` (not
   in CI), then the site sync in `CLAUDE.md` § CVs.
6. `npm run reviewed -- "<section.id>" --apply` for each entry actually re-read.

| Fact | Shard | Surfaces that may earn it |
|---|---|---|
| Role, title or date | `10-career` | designed CV Experience, ATS experience, LinkedIn Experience |
| Project | `20`–`23` | README buckets in `90-meta`, CV projects, ATS projects, extended CV Ch. 3, LinkedIn Projects |
| Metric | the entry's `metrics[]` | only where that number already appears |
| Award | `30-recognition` | CV Recognition, ATS awards, LinkedIn honors (`_sourceAward`) |
| Recommendation | `50-references` | LinkedIn recommendations, extended CV Ch. 5 |
| Event | `80-events` | usually nothing else |

## Claim strength

The claim made is the strongest reading a stranger can take from the sentence.
Start from the smallest thing Chan owned end to end and scope every ownership
word to it.

- **Ownership matches the record, one step and no more**: built alone → "sole
  engineer of <module>"; led with others → "led <named workstream>";
  contributed → "merged N PRs into X", never "maintainer". A title is not a
  scope.
- **`0 → 1` only when nothing existed.** Otherwise name both ends:
  "no-code prototype → multi-tenant B2B SaaS".
- **Every number carries its basis in the same sentence**: denominator
  ("471 of 488 commits"), window ("measured 2026-09-07"), measurement basis
  ("p50 over 20 iterations on live Kubernetes"). Percentage points are not
  percent.
- **A superlative is enumerated or attributed**: "four Claude Code extension
  surfaces: hooks, skills, status line and plugin packaging"; "self-described as
  China's first".
- **A company's result is not hers.** "The integration behind Sanicle's IBM
  Silver Partner certification", not "the work that earned". Another project's
  stars are a property of that project: "2 merged PRs into CopilotKit
  (37.5k-star project)".
- **Refuse**: a role with no stated size, weak items bundled under a strong
  brand, a logo or programme beside her name with no stated contribution,
  adjacent work relabelled as the fashionable thing.
- **Outcomes before duties**, one idea per sentence, no self-diminishers.
- **Reach counts at their historical maximum** (`CLAUDE.md`).
- Three tests a script cannot run: would she say it to a hiring manager's face;
  does it back up what a referrer just said about her; after the intro, does the
  reader know who to send her way.

## Kept elsewhere, on purpose

- The six red lines (what may never be claimed): `cv/cover-letter/EVIDENCE.md`.
  Read them before writing anything public.
- The banned-word list: `cv/README.md` § "Word blacklist"; `check-copy.mjs`
  parses it from there.
- ATS hard rules: `cv/README.md` § "ATS variant — hard rules".
- Rule ids and suppression (`copy-lint-ok:R8` on the preceding line):
  `scripts/check-copy.mjs`.
