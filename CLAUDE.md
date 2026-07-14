# CLAUDE.md — how to work on this repo

This repo is Chan Meng's **career database**. The data source is the shard set
`data/profile/*.yaml` (merged by `scripts/lib/load-profile.mjs`); everything
else — README.md, llms.txt, llms-full.txt, dist/profile.json,
linkedin/linkedin-profile.json + linkedin/*.md — is **generated**. Never edit
generated files by hand; edit the shard, then build.

## Edit workflow

```bash
# 1. edit the right shard (see data map below)
npm run check        # validate (schema + linkedin sync) + build + asset audit
# 2. commit the shard AND the regenerated outputs together
```

- `npm run validate` — schema + cross-surface gates only (fast)
- `npm run build` — regenerate all outputs
- `npm run refresh-metrics` — dry-run GitHub stars/forks/commit-date refresh
  (`--apply` to write); only touches `- { label: "Stars", value: ... }`-style
  lines in the project shards. Also reports repo health (404s, renames,
  archived-but-active, activity gaps) for every GitHub-linked project.
- CV PDF: `pwsh cv/build.ps1` (manual; needs typst)

## Truth maintenance

Schema validation proves well-formed, not true. The freshness SLA keeps
hand-typed facts on a review cadence:

- Every entry's `lastUpdated` must be within its tier budget: flagship 3mo,
  primary 6mo, secondary 12mo, archive exempt; `recency: active` caps at 3mo.
  `npm run check:freshness` reports; the PR gate runs it `--strict` (an
  overdue flagship/active entry FAILS the PR — review it while you're in the
  data anyway).
- After actually re-reading an entry and confirming its facts:
  `npm run reviewed -- "work.engram" --apply` (NEVER bulk-bump `lastUpdated`
  by hand-editing — that destroys the field's meaning).
- `npm run check:cv` — CV role-line anchor facts (date ranges error, titles
  warn) vs 10-career.yaml. PR gate runs it `--strict`.
- `npm run check:links` — link liveness across all shards (monthly workflow
  only; never blocks PRs).
- A LinkedIn display title that deliberately differs from `work[].position`
  needs `_titleCurated: true` on that position in 70-linkedin.yaml, or
  check-linkedin-sync fails.
- The `review-queue.yml` workflow runs all of this monthly and upserts one
  GitHub issue labelled `review-queue`.

## Data map — which shard to edit

| Shard | Top-level keys | Entries | Entry key |
|---|---|---|---|
| `00-basics.yaml` | basics, builderTools | identity, 3 tools | — |
| `10-career.yaml` | work, volunteer, education | 12 + 3 + 2 | `id` |
| `20-projects-flagship.yaml` | projects (flagship band) | 4 | `id` |
| `21-projects-oss-primary.yaml` | projects (OSS primary band) | 7 | `id` |
| `22-projects-oss-webapps.yaml` | projects (collapsible: web apps) | 10 | `id` |
| `23-projects-oss-more.yaml` | projects (AI/creative/ML/branding/games + commissioned) | 51 | `id` |
| `25-contributions.yaml` | openSourceContributions | 23 | `id` |
| `30-recognition.yaml` | awards, certificates, publications | 6 + 53 + 55 | `title`+`awarder` / `name` |
| `40-skills.yaml` | skills, domains, languages, interests | — | `name` |
| `50-references.yaml` | references | 20 | `id` |
| `60-network.yaml` | organizations, collaborators | 30 + 10 | `id` |
| `70-linkedin.yaml` | linkedin | curated live-page snapshot | — |
| `80-events.yaml` | events (offline talks/hackathons/workshops/appearances) | 5 | `id` |
| `90-meta.yaml` | meta (incl. `meta.x_brand` display config) | — | — |

The `projects:` list spans shards 20→23 and is concatenated in filename order
by the loader. To find an entry: `grep -rn "id: <slug>" data/profile/`.

## Cross-reference rules (not enforced by the schema — keep them true)

- `projects[].relatedWorkId` → must exist as `work[].id` (10-career)
- `projects[].relatedProjectId` → must exist as `projects[].id`
- `collaborators[].currentOrgId` → must exist as `organizations[].id`
  (build fails if broken)
- `collaborators[].worksTogether[].contextId` → work/volunteer/project id,
  depending on `contextType`
- `meta.x_brand.flagshipProjectIds` (and similar id lists in 90-meta, incl.
  `spotlightProjectIds`) → `projects[].id`; update when promoting/demoting a
  project. `spotlightProjectIds` is validated by the build (typo'd id fails).
- **Hiding a project from the README can silently delete it from the LLM
  surfaces.** `_openSourcePrimary` — the "Notable Open Source Projects" block in
  llms.txt and the full narrative block in llms-full.txt — is *derived* in
  build.mjs from the README display buckets (flagship + aiAgent + craft, minus
  `provenance: client`, minus anything with no public `repoUrl`). So removing an
  id from `aiAgentProjectIds` / `openSourceCraftProjectIds` drops its narrative
  from both files; the project falls back to a one-line entry in llms-full.txt's
  long tail. If a project should stay in the LLM narrative while being off the
  human shopfront, add it to `meta.x_brand.llmsOnlyOpenSourceIds` (build fails on
  a typo'd id there). Check this whenever you de-list a project.
- `events[].relatedWorkId` → `work[].id`/`volunteer[].id`;
  `events[].relatedProjectId` → `projects[].id`; `events[].relatedAwardTitle` →
  an `awards[].title` (all soft cross-refs — keep them true)
- `linkedin:` block (70-linkedin) mirrors work/projects/awards/references **by
  name**, with `_sourceAward` markers into `awards[]`.
  `scripts/check-linkedin-sync.mjs` (part of `npm run validate`) fails on
  broken mappings. If you rename a company/award in a canonical section,
  reconcile the linkedin shard too.

## Facts live in THREE places — fix all of them

1. `data/profile/*.yaml` — canonical
2. `cv/sections/*.typ` — CV prose is **hand-curated Typst**, not generated;
   `cv/build-llms-txt.mjs` also hardcodes some copy
3. `70-linkedin.yaml` — LinkedIn display copy is curated (dates/banner facts
   are auto-injected by the generator, titles/narrative are not)

Changing a role title, date, or award in one place ≠ done. Check the other two.

## Field conventions

- `tier`: flagship | primary | secondary | archive (LLM-consumer ranking;
  archive = skip by default)
- `recency`: active | recent | historical | deprecated; `endDate: null` = current role
- `provenance` (projects only): client | personal | coursework | bootcamp |
  hackathon — the project's *kind/origin*, orthogonal to tier (ranking),
  recency/status (lifecycle), and category (domain). client = real employer /
  paid commission / affiliated-org work; coursework = university assignment or
  group-project origin; bootcamp = training-camp capstone (青训营 etc.).
  Classify by evidence (`entity`/`relatedWorkId`/narrative), not by the meta
  editorial buckets. A shuttered/关停 project is expressed via `status: archived`
  + `recency: deprecated`, NOT a provenance value.
- `lastUpdated`: bump (YYYY-MM-DD) whenever you meaningfully review/edit an entry
- Dates are `"YYYY-MM"` or `"YYYY-MM-DD"` strings, quoted
- Long prose uses YAML `|` literal blocks; markdown allowed inside
- No pricing/cost framings in project narratives; README visuals only from
  Chan's own tools (gradient-svg-generator, github-visitor-counter,
  github-readme-suno-cards)

## Bulk edits

Multi-entry waves requiring per-entry review are staged as
`data/_intake/{topic}-wave-{N}-{YYYY-MM}.md` first, then merged into the
shards. See existing files in `data/_intake/` for the format.

## Other sources in data/

- `data/brand.yaml` — design tokens (FORM); validated by its own schema;
  feeds `dist/brand/tokens.json`. Profile shards hold CONTENT only.

## Per-section field templates

See `docs/CONTRIBUTING-DATA.md` for add-a-work-entry / add-a-project /
add-a-certificate templates, and `docs/ARCHITECTURE.md` for the build
pipeline.
