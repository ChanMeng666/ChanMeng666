---
paths:
  - "data/profile/30-recognition.yaml"
  - "data/profile/70-linkedin.yaml"
  - "data/profile/80-events.yaml"
---

# Rules for awards, publications, LinkedIn copy and events

Sources are `file:line` as of 2026-10-16. If a line has drifted, grep the quoted phrase.

## Awards
- Awards have no `id`. Their identity is the `title` string (`30-recognition.yaml:26-32`).
- Three guards join on it: `events[].relatedAwardTitle` (by title), `scripts/check-linkedin-sync.mjs` (by awarder string) and `scripts/check-freshness.mjs` (by title). Renaming an award title breaks all three; change them together.
- A year in brackets, as in "Outstanding Mentor Award (2026)", is a disambiguator, not part of the award's name. Keep it in the key only; the prose gives the official name (`30-recognition.yaml:26-32`).
- Read the evidence comment above an award before citing it. Example: the 2026 award is self-attested (`30-recognition.yaml:15-25`).
- The UN CSW 69 entry: she presented remotely. Add no travel or attendance wording (`30-recognition.yaml:83-86`).

## Publications
- The research papers' repo is private: never link it (`30-recognition.yaml:986`).
- Papers under review are never added here (`30-recognition.yaml:987-989`). The venue rule is in `CLAUDE.md`.

## LinkedIn copy (`linkedin:` in 70-linkedin.yaml)
- `linkedin/linkedin-profile.json` and `linkedin/*.md` are generated from this block (`70-linkedin.yaml:12-14`).
- Facts that drift are injected from the main sections and must not be typed here: languages, banner name/headline/pronouns, honours title/issuer/date/links, single-position experience title and dates, education dates/credential/grade, certificate issued/credentialUrl, and three derivable project date ranges (`70-linkedin.yaml:15-21`).
- `_sourceAward` (with `awarder:` and `fields:`) marks which award an honour entry takes its facts from (`70-linkedin.yaml:18`, example at `:1577`).
- A LinkedIn title that differs from `work[].position` on purpose needs `_titleCurated: true`, with a comment saying why (`70-linkedin.yaml:424-430`).
- `scripts/check-linkedin-sync.mjs` (part of `npm run validate`) asserts the remaining duplicated facts agree with the main sections (`70-linkedin.yaml:21-22`).
- "What's Shipping in AI" at chanmeng.org is a different publication from the retired LinkedIn Newsletter; never merge the two (`70-linkedin.yaml:33`).
- Titles and narrative here are hand-written, so this file is one of the places a fact lives: see the facts rule in `CLAUDE.md`.

## Events
- Events cross-refer `awards[]`, `work[]` and `projects[]` through `relatedAwardTitle`, `relatedWorkId`, `relatedProjectId` instead of copying their prose (`80-events.yaml:13-15`). None of the three is checked by a script yet.
- Field template: `80-events.yaml:17-22`.
- Photos live in `/public/photos/events/` as `YYYY-MM-DD-<event-slug>-<what>.jpg`. `scripts/audit-assets.mjs` fails when a referenced file is missing, so place the file first (`80-events.yaml:24-29`).
- She Sharp dates, venues, rosters and attendance come from the she-sharp repo's event data (`80-events.yaml:31-44`). Every `url` slug must exist there, or it 404s.
