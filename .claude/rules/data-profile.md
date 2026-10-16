---
paths:
  - "data/profile/**"
---

# Rules for the profile shards

Sources are `file:line` as of 2026-10-16. If a line has drifted, grep the quoted phrase.

## Ids
- Ids are kebab-case slugs, unique within their list. They are NOT unique across lists: one slug names one real thing wherever it appears (`she-sharp` is a work, a project and an organisation id; 23 slugs are shared, checked 2026-10-16). So a reference means "this id in the list the field names", never "any entry with this id".
- Existing practice: the same thing keeps the same slug in every list it appears in.
- These lists have no `id`: `awards`, `certificates`, `productFilms`, `skills`, `languages`, `interests`. Awards join by `title`; certificates by `credentialId` or `url` (`scripts/check-linkedin-sync.mjs:130-139`); `productFilms` by `projectId`. Awards: see `.claude/rules/recognition-linkedin.md`.
- Find an entry: `grep -rn "id: <slug>" data/profile/`.

## Cross-reference fields and what they point to
Every one must name an existing id. Checked by `scripts/build.mjs` (fatal, except collaborators: warning) or `scripts/check-ecosystem.mjs` (films) unless marked "unchecked".
- `projects[]`: `clientOrgId` → organizations; `relatedWorkId` → work; `relatedProjectIds`, `supersedes`, `supersededBy` → projects; `meta.x_brand.relatedShowcase` → showcase.
- `openSourceContributions[].relatedProjectId` → projects.
- `domains[]`: `evidenceProjectIds` → projects, `evidenceWorkIds` → work (unchecked).
- `showcase[]`: `capability` → showcaseCapabilities; `relatedWorkId` → work; `relatedProjectId` → projects (`45-showcase.yaml:13-15`).
- `productFilms[]`: `projectId` → projects, `showcaseId` → showcase.
- `filmCollections[].projectId` → projects. `films[]`: `projectId` → projects, `collection` → filmCollections, `showcaseId` → showcase, `repo` → a repo in `docs/ecosystem/lineage.yaml` (`46-films.yaml:18-21`).
- `organizations[]`: `meta.x_brand.relatedWorkId` → work (unchecked), `relatedProjectId` → projects, `relatedVolunteerId` → volunteer; `x_structure.parentOrgId`, `units[].orgId` → organizations; `x_structure.founderCollaboratorId` → collaborators.
- `collaborators[]`: `currentOrgId` → organizations; `worksTogether[].contextType` + `contextId` → the list that `contextType` names.
- `events[]`: `relatedAwardTitle` → `awards[].title` (unchecked); `relatedWorkId` → work (unchecked); `relatedProjectId` → projects (`80-events.yaml:13-15`).
- `meta.x_brand`: every `*ProjectIds` bucket → projects; `readmePullQuoteId` → references; `engagementRoles[].proofProjectId/proofWorkId`, `teachingCohorts[].partnerOrgIds/relatedVolunteerId/relatedProjectId/relatedWorkId` (unchecked); `featuredArticleIds` → blog slugs in the 2d-portfolio repo, not `publications[]`.
- Outside the shards: `x/posts.yaml` `projectIds`/`showcaseId`, `distribution/plan.yaml`, `lineage.yaml` `catalogId`.

**Known polymorphic references** (the field names the wrong list; no check catches it; leave them for Wave 2, do not copy the pattern):
- `60-network.yaml:340` organisation `lincoln-university` has `relatedWorkId: lincoln`, which is an `education[]` id.
- `80-events.yaml:612` event `forward-with-her-mentorship-2024-2025` has `relatedWorkId: forward-with-her-mentor`, which is a `volunteer[]` id.

## Guard comments
- A guard is the comment directly above an entry or field that says what must not happen ("do not re-add", "never link", "not shown"). About 30 sites, listed in the audit of 2026-10-16.
- Read the guard before touching that entry, a display list, a CV or LinkedIn copy. Do not remove it and do not act against it; only Chan lifts one, and then `docs/STATE.md` changes too.
- A field omitted on purpose says so in its guard. Example `20-projects-flagship.yaml:35`: "repoUrl omitted — private client repository … do not re-add."

## Editing
- Comments may be edited freely. A copy change (title, date, metric, award, narrative) goes through the `career-copy` skill, which also updates the other copies.
- `lastUpdated` and reach counts: rules in `CLAUDE.md`. Never bulk-bump `lastUpdated` (`80-events.yaml:38-43`).
- `provenance` is the project's origin: `client`, `personal`, `coursework`, `bootcamp` or `hackathon`, judged from evidence. A shut-down project is `status: archived` + `recency: deprecated`, never a provenance.
- `dist/video-data.json`: each fact is a regex over a metric's prose and the build fails when it stops matching. Fix the rule or the claim; never loosen the regex. `\b` is ASCII-only, so it never matches after te reo or 中文.
- No HTML in `entity`: `build.mjs` splits it on " — " (`20-projects-flagship.yaml:41-43`).
- After an edit: `npm run validate` for a quick schema and reference pass, `npm run check` before commit.
