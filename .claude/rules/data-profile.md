---
paths:
  - "data/profile/**"
---

# Rules for the profile shards

Sources are `file:line` as of 2026-10-16. If a line has drifted, grep the quoted phrase.

## Ids
- Ids are kebab-case slugs, unique within their list. They are NOT unique across lists: one slug names one real thing wherever it appears (`she-sharp` is a work, a project and an organisation id; 23 slugs are shared, checked 2026-10-16). So a reference means "this id in the list the field names", never "any entry with this id".
- Existing practice: the same thing keeps the same slug in every list it appears in.
- `awards`, `certificates` and `productFilms` have a required `id` since 2026-10-16. Awards: title + year (`outstanding-mentor-award-2026`); certificates: issuer + name + year (`anthropic-claude-code-in-action-2026`); a `productFilms` row takes the id of the `films[]` row it names (same film, same slug). Joins use the id: see `.claude/rules/recognition-linkedin.md`. The LinkedIn certificate join still uses `credentialId` or `url`, the keys LinkedIn itself shows (`scripts/check-linkedin-sync.mjs`).
- Still without an `id`: `skills`, `languages`, `interests`.
- `scripts/validate.mjs` fails on a duplicate id within any list that has ids.
- Find an entry: `grep -rn "id: <slug>" data/profile/`.

## Cross-reference fields and what they point to
The one list is `REF_FIELDS` in `scripts/lint-kb.mjs`; every value must resolve in the target list, and a new `*Id`/`*Ids` key that is not registered there is reported as an "unregistered reference field" warning. The older fatal checks in `scripts/build.mjs` and `scripts/check-ecosystem.mjs` stay. A field's name says its target list: never point `relatedWorkId` at an education or volunteer id (the lint says "wrong field name?").

| On | Field | Target |
|---|---|---|
| `projects[]` | `clientOrgId` | organizations |
| | `relatedWorkId` | work |
| | `relatedProjectIds`, `supersedes`, `supersededBy` | projects |
| | `meta.x_brand.relatedShowcase[].id` | showcase |
| `openSourceContributions[]` | `relatedProjectId` | projects |
| `domains[]` | `evidenceProjectIds` / `evidenceWorkIds` | projects / work |
| `showcase[]` | `capability` / `relatedWorkId` / `relatedProjectId` | showcaseCapabilities / work / projects |
| `productFilms[]` | `projectId` / `showcaseId` | projects / showcase |
| `filmCollections[]` | `projectId` | projects |
| `films[]` | `projectId` / `collection` / `showcaseId` | projects / filmCollections / showcase |
| `organizations[].meta.x_brand` | `relatedWorkId` / `relatedVolunteerId` / `relatedEducationId` / `relatedProjectId` | work / volunteer / education / projects |
| `organizations[].meta.x_structure` | `parentOrgId`, `units[].orgId` / `founderCollaboratorId` | organizations / collaborators |
| `collaborators[]` | `currentOrgId` | organizations |
| | `worksTogether[].contextId` | the list `contextType` names (`work`, `project`) |
| `events[]` | `relatedAwardId` / `relatedWorkId` / `relatedVolunteerId` / `relatedProjectId` | awards / work / volunteer / projects |
| `meta.x_brand` | every `*ProjectIds` bucket, `llmsOnlyOpenSourceIds` | projects |
| | `readmePullQuoteId` | references |
| | `engagementRoles[].proofProjectId` / `proofWorkId` | projects / work |
| | `teachingCohorts[].partnerOrgIds` / `relatedWorkId` / `relatedVolunteerId` / `relatedProjectId` | organizations / work / volunteer / projects |
| `linkedin` | `honorsAndAwards[]._sourceAward` (`id`) | awards |
| | `recommendations.received[].ref` | references |
| `x/posts.yaml` | `threads[].projectIds` / `showcaseId` | projects / showcase |

Not profile lists, checked elsewhere: `meta.x_brand.featuredArticleIds` (blog slugs in the 2d-portfolio repo, `scripts/build.mjs`); `films[].repo`, `filmCollections[].repo` (`docs/ecosystem/lineage.yaml`, `scripts/check-ecosystem.mjs`); `distribution/plan.yaml` and `lineage.yaml` `catalogId` (their own builders). Not references: `credentialId`, `youtubeId`, `shortYoutubeId`.

The two polymorphic references found on 2026-10-16 are fixed: `organizations[lincoln-university]` uses `relatedEducationId: lincoln` and `events[forward-with-her-mentorship-2024-2025]` uses `relatedVolunteerId: forward-with-her-mentor`.

## Display: the `show:` field
- An entry kept off a surface declares it: `show: { readme, site, cv, linkedin, llms }`, each optional boolean (schema `$defs.showFlags`). Allowed on projects, organizations, collaborators, films, work, volunteer, awards, publications and showcase. An absent key means the default below. `false` = must not appear there; `true` = must (used where a rule names the surface, e.g. `llms: true` for a project that left the README but keeps its narrative).
- Values come from `docs/STATE.md` § Display rules. Where STATE.md is silent for a surface, the key stays absent. Only Chan changes a value, and STATE.md changes with it.
- Generators do not read `show`: each surface keeps its own mechanism (table). `show` is the declaration and `npm run lint:kb` (`scripts/lint-kb.mjs`) the cross-check. When the lint finds a hidden entry in an output, fix the mechanism (the bucket, the tier, the hand-written copy), never add a silent filter.
- `llms: false` means absent from the narrative files (`llms.txt`, `public/cv-llms.txt`). The database dumps `llms-full.txt` and `dist/profile.json` carry every entry, hidden ones included.
- The lint matches the id and the display name (and the name's head before " — "); `--terms` prints what it matched per entry. A mention that a STATE.md rule allows on purpose is listed in `DECIDED_MENTIONS` in the lint, with the rule quoted, and printed on every run.

| Surface | Default (key absent) | Where it is decided |
|---|---|---|
| `readme` | Projects: shown when in a `90-meta.yaml` display bucket, or as a sub-project link through a shown parent's `relatedProjectIds`. Organisations: in the band when the `logo` file exists. Collaborators: when `publicListing` is not false. Films: the film wall takes every primary product film, brand and event film and music video. Publications: the hero shows the first five press, interview and podcast-episode entries | `90-meta.yaml` buckets, `scripts/build.mjs`, `scripts/build-readme-art.mjs` |
| `site` | Not shown unless the 2d-portfolio repo's own source names it (hand-written pages). Films: shown on /films when `onFilmsPage: true` | `2d-portfolio/src/data/*`; `dist/films.json` (`scripts/build-films-data.mjs`) |
| `cv` | Not shown unless written into the hand-curated CV sources | `cv/sections/*.typ`, `cv/extended.typ`, `cv/chan-meng-cv-ats.typ` |
| `linkedin` | Not shown unless written into the `linkedin:` copy | `70-linkedin.yaml` → `linkedin/linkedin-*.md` |
| `llms` | `llms.txt`: projects in the flagship, aiAgent or craft bucket or `llmsOnlyOpenSourceIds` (minus `provenance: client` and minus no public `repoUrl`), every organisation by tier, current roles, top-tier awards, `statisticsClaims`. `public/cv-llms.txt`: every `tier: flagship` project plus `SELECTED_EXTRA_PROJECT_IDS` | `scripts/build.mjs` `_openSourcePrimary`, `templates/llms.txt.hbs`, `cv/build-llms-txt.mjs` |

## Metric provenance: `source` and `asOf`
- Every `{ label, value }` metric (`projects[].metrics`, `basics.reach.metrics`, `projects[].meta.x_brand.reach.usage`) takes `source` (where the number comes from) and `asOf` (`YYYY-MM-DD`, or `YYYY-MM` when only the month is known). Schema: `$defs.metricSource`, `metricAsOf`. A block-level `reach.asOf` / `measuredOn` is not inherited.
- `source` forms: a URL, a repo path, an evidence or story file, a platform register path (`register: linkedin/account.yaml`), `self-attested`, or `private: <what> (not linked)`. Never a link to a private repo.
- Rule (d3, 2026-10-16): required on visitor-facing metrics, meaning those picked into `public/cv-llms.txt` or found on README, the CVs, the `linkedin:` copy or chanmeng.org. `node scripts/lint-kb.mjs` lists each miss as `file:line`. It is a warning until the 2026-10 backfill lands, then `--strict-provenance` makes it an error. Metrics on no visitor page stay a one-line warning.
- The backfill is staged for Chan's review in `data/_intake/metrics-provenance-wave-1-2026-10.md`. Do not write `source`/`asOf` values before she has marked a row.

## Guard comments
- A guard is the comment directly above an entry or field that says what must not happen ("do not re-add", "never link", "not shown"). A display guard is one line naming the rule, Chan's date and "See show:"; the `show:` field below it is the structured form. Other guards (private repo, copy and claim limits) stay as prose.
- Read the guard before touching that entry, a display list, a CV or LinkedIn copy. Do not remove it and do not act against it; only Chan lifts one, and then `docs/STATE.md` and the entry's `show:` change too.
- A field omitted on purpose says so in its guard. Example `20-projects-flagship.yaml:35`: "repoUrl omitted — private client repository … do not re-add."

## Editing
- Comments may be edited freely. A copy change (title, date, metric, award, narrative) goes through the `career-copy` skill, which also updates the other copies.
- `lastUpdated` and reach counts: rules in `CLAUDE.md`. Never bulk-bump `lastUpdated` (`80-events.yaml:38-43`).
- `provenance` is the project's origin: `client`, `personal`, `coursework`, `bootcamp` or `hackathon`, judged from evidence. A shut-down project is `status: archived` + `recency: deprecated`, never a provenance.
- `dist/video-data.json`: each fact is a regex over a metric's prose and the build fails when it stops matching. Fix the rule or the claim; never loosen the regex. `\b` is ASCII-only, so it never matches after te reo or 中文.
- No HTML in `entity`: `build.mjs` splits it on " — " (`20-projects-flagship.yaml:41-43`).
- After an edit: `npm run validate` for the schema and id uniqueness, `npm run lint:kb` for references and display declarations, `npm run check` before commit.
