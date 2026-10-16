---
paths:
  - "data/profile/30-recognition.yaml"
  - "data/profile/70-linkedin.yaml"
  - "data/profile/80-events.yaml"
---

# Rules for awards, publications, LinkedIn copy and events

Sources are `file:line` as of 2026-10-16. If a line has drifted, grep the quoted phrase.

## Awards
- Every award has a required `id`, title + year (`outstanding-mentor-award-2026`), unique within `awards[]`. It is the join key: `events[].relatedAwardId`, the LinkedIn honours' `_sourceAward`, `scripts/check-linkedin-sync.mjs` and `scripts/check-freshness.mjs` all use it, and `scripts/lint-kb.mjs` resolves every one. A title can change without breaking a join, but a title change is still a copy change (`career-copy` skill).
- Never change an id once set: stories, events and the LinkedIn block cite it.
- The "(2026)" in "Outstanding Mentor Award (2026)" is not part of the award's official name (the prose gives that). It stays because the title is rendered on several surfaces; dropping it is a copy change (`30-recognition.yaml`, comment above the first award).
- Certificates have ids too (issuer + name + year). The LinkedIn certificate join still uses `credentialId` or `url`.
- Read the evidence comment above an award before citing it. Example: the 2026 award is self-attested (`30-recognition.yaml:15-25`).
- The UN CSW 69 entry: she presented remotely. Add no travel or attendance wording (`30-recognition.yaml:83-86`).

## Publications
- The research papers' repo is private: never link it (`30-recognition.yaml:986`).
- Papers under review are never added here (`30-recognition.yaml:987-989`). The venue rule is in `CLAUDE.md`.

## LinkedIn copy (`linkedin:` in 70-linkedin.yaml)
- `linkedin/linkedin-profile.json` and `linkedin/*.md` are generated from this block (`70-linkedin.yaml:12-14`).
- Facts that drift are injected from the main sections and must not be typed here: languages, banner name/headline/pronouns, honours title/issuer/date/links, single-position experience title and dates, education dates/credential/grade, certificate issued/credentialUrl, and three derivable project date ranges (`70-linkedin.yaml:15-21`).
- `_sourceAward` marks which award an honour entry takes its facts from: `{ id: <awards[].id>, fields: [...] }`, or a bare award id meaning title, issuer, issueDate and links (`70-linkedin.yaml` header). `scripts/build-linkedin-json.mjs` injects the listed fields; an unknown id fails the build and `check-linkedin-sync`.
- A LinkedIn title that differs from `work[].position` on purpose needs `_titleCurated: true`, with a comment saying why (`70-linkedin.yaml:424-430`).
- `scripts/check-linkedin-sync.mjs` (part of `npm run validate`) asserts the remaining duplicated facts agree with the main sections (`70-linkedin.yaml:21-22`).
- "What's Shipping in AI" at chanmeng.org is a different publication from the retired LinkedIn Newsletter; never merge the two (`70-linkedin.yaml:33`).
- Titles and narrative here are hand-written, so this file is one of the places a fact lives: see the facts rule in `CLAUDE.md`.

## Events
- Events cross-refer `awards[]`, `work[]`, `volunteer[]` and `projects[]` by id through `relatedAwardId`, `relatedWorkId`, `relatedVolunteerId` and `relatedProjectId` instead of copying their prose (`80-events.yaml` header). `scripts/lint-kb.mjs` resolves each in the list its name says: a volunteer role goes in `relatedVolunteerId`, never `relatedWorkId`.
- Field template: `80-events.yaml:17-22`.
- Photos live in `/public/photos/events/` as `YYYY-MM-DD-<event-slug>-<what>.jpg`. `scripts/audit-assets.mjs` fails when a referenced file is missing, so place the file first (`80-events.yaml:24-29`).
- She Sharp dates, venues, rosters and attendance come from the she-sharp repo's event data (`80-events.yaml:31-44`). Every `url` slug must exist there, or it 404s.
