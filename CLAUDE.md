# CLAUDE.md — how to work on this repo

This repo is Chan Meng's **career database**. The data source is the shard set
`data/profile/*.yaml` (merged by `scripts/lib/load-profile.mjs`); everything
else — README.md, llms.txt, llms-full.txt, dist/profile.json,
dist/video-data.json, linkedin/linkedin-profile.json + linkedin/*.md — is
**generated**. Never edit generated files by hand; edit the shard, then build.

**Read `docs/STATE.md` first.** It is the dated summary of what is true right now
and what Chan has already decided: her current priorities, which projects must not
be shown where (GenLAB, Seismophone, Te Pā Tiaki), the one-film-per-product rule,
and the open items. Keep it current whenever she changes a priority, a project's
fate or a display rule. Its candid half — her priorities in her own words, the
reasons behind the rules, what her private market research concluded — is the
**local-only, gitignored** `docs/STATE.private.md`: read it when present, never
copy it into tracked files, commit messages or generated output. This repo is
public, so tracked wording states decisions and rules, not motives.

ArchLang ↔ ArchCanvas sibling-repo map (local paths, private vs public, subprojects):
`docs/ecosystem/archlang-archcanvas.md`. Career narrative stays in the profile shards.

## Project lineage (repo genealogy)

How all of Chan's repos relate (which were built for the same company or brand,
what replaced what, backups, forks, promo films, growth workspaces):
`docs/ecosystem/README.md` (entry point, relation vocabulary, per-entity diagrams)
and the machine catalog `docs/ecosystem/lineage.yaml`. Sensitive repos live only in
the **local-only, gitignored** overlay `docs/ecosystem/lineage.private.yaml` (read it
when present; never copy its contents or repo names into tracked files). Topology
only: career facts stay in `data/profile/`. Each repo row may also carry Chan's own
judgement: `positioning` (what it is for), `stage` (building | maintained | paused |
done | handed-over) and `showcase` (flagship | featured | listed | hidden); read them
before deciding how prominently to present a project, and never fill them in for her. Validate with
`npm run check:ecosystem [-- --live]` (offline mode runs inside `npm run validate`;
`--live` compares with GitHub and needs the overlay to be present locally).

**Rule:** when you create, archive, rename, transfer or delete a repo, update
`lineage.yaml` (or the private overlay if its name is sensitive), then run
`npm run check:ecosystem -- --live` and fix any drift it reports.

## Repo & hosting operations

Everything about the lifecycle of repos and deployments (archive, make private,
delete, retire a deployment, npm publishing, hosting map, standing policies, dated
pending list) is in `docs/operations/README.md`. Sensitive specifics (droplet,
account scopes, token names, backup locations) live only in the local-only,
gitignored `docs/operations/hosting.private.md`; read it when present, never copy
it into tracked files. Key rules:

- **Chan decides.** Bulk repo decisions go through the interactive triage page
  (`node scripts/build-triage-page.mjs`, default / `--mode repos` /
  `--mode visibility`; details in the runbook). Nothing is preselected; hints are
  advisory. Delete a repo only after a second confirmation.
- **No links to private repos** in any shard, CV, LinkedIn copy or on chanmeng.org.
  Archiving or privatising a repo means stripping its links from all four fact
  places plus 2d-portfolio, then updating lineage and running
  `npm run check:ecosystem -- --live`.
- Archive checklist: disable workflows, delete secrets, unpublish Pages/hosting
  first (archived repos are read-only; settings need unarchive, change, re-archive).
- Never delete the Coolify deploy SSH key; keep the Eatropolis deploy token; take
  no action on client-org billing (Eatropolis, She Sharp are handed over).
- Listing forks (the five `awesome-*` forks) are deleted once their PR closes, or
  all on 2026-11-14. Never name the venue of the paper under review.
- npm publishing needs Chan's browser auth: prepare the package, she runs
  `npm publish`.

## Animated project cards (the SVGs at the top of the README)

The big project cards in `README.md` are generated SVGs in `public/cards/<id>.svg`,
built by `npm run build:cards [-- id …]` (not part of `npm run build`) from
`scripts/cards/<id>.mjs`. **Read `docs/animated-svg-cards.md` before making or
changing one**: it is the method (the `<img>` sandbox, glyph-subset text, build-time
evidence, shared keyframes, verification) and the mistakes already made. Rules that
bite:

- A card is drawn in **the product's own design system** (its tokens, typefaces,
  wordmark file and brand rules, read from the product's repo), never in this
  profile's Caldera frame by default.
- **Nothing on a stage is drawn by hand**: compile it, quote it, or cut it from the
  film or the live site, and let the build fail when it stops agreeing.
- Copy and figures come from an already-cleared source (the film's copy file, the
  product's strings, `data/profile/`), each claim with its caveat on the same frame.
- A card whose outside inputs (a private checkout, a film master, a system font) are
  missing is skipped and its committed SVG stands; never copy those inputs in.
- `build.mjs` sets `projects[]._card` when the file exists and
  `project-cards.hbs` renders it under the H3; the `alt` is the SVG's `<title>`.
- Verify by screenshots at timestamps on both canvases, the reduced-motion still
  (load the SVG as a document; emulation does not reach `<img>`), then on GitHub.

The same guide is published at chanmeng.org/blog/animated-svg-project-cards; the
file in `docs/` is the source, so edit it first and republish.

## The README's own banners and pills

The hero, the two section strips, the footer band and every link pill are
committed SVGs in `public/readme/`, built by `npm run build:art` (not part of
`npm run build`) from `scripts/build-readme-art.mjs` + `scripts/readme-art/`.
The list is `data/brand.yaml › signatures.readmeArt`: a banner id with its text
and drawing, and each pill's label with its variant. They follow the same
`<img>` sandbox rules as the cards (`docs/animated-svg-cards.md`) but are drawn
in this profile's own Caldera system, since they are the profile's, not a
product's.

- A pill's label must be the exact text the README shows. `scripts/build.mjs`
  fails when a banner or pill it needs has no file: add the label to
  `readmeArt.pills`, run `npm run build:art`, commit the SVG.
- The build deletes any `public/readme/*.svg` that `readmeArt` no longer lists.
- Verify on both GitHub canvases before pushing; plates near the canvas colour
  (ink on dark, ash on light) rely on the hairline edge each file carries.

## Changing career COPY? Use the `career-copy` skill

`.claude/skills/career-copy/` is this repo's own skill for the case that comes up
most: a fact changed and the copy has to change with it — a new role or project,
a metric that moved, a title correction, or "make this entry sound stronger".

It carries the propagation map (which surfaces a fact earns, and which gate
checks each one), the per-surface register and budget table, the claim-strength
rules, and the LinkedIn profile doctrine. Read it before writing any bullet that
contains a number or an ownership word.

The gate it adds is `npm run check:copy` (`--strict` in PR mode), which lints the
prose the structural gates never read. Its most important rule: **every
claim-shaped number on a CV, LinkedIn or cover-letter surface must also appear in
`data/profile/`** — the check that catches a number going stale on four surfaces
at once.

## Edit workflow

```bash
# 1. edit the right shard (see data map below)
npm run check        # validate (schema + linkedin sync) + build + asset audit
# 2. commit the shard AND the regenerated outputs together
```

- `npm run validate` — schema + cross-surface gates only (fast)
- `npm run build` — regenerate all outputs
- `npm run build:video-data` — emit `dist/video-data.json`, the ~25-fact slice
  the promo film (`../chan-meng-promo-video`) renders from. Part of `build`.
  Each fact declares a regex over a metric's *prose* and **fails the build when
  the rule stops matching** — that is the case where a rewritten caveat would
  silently make a number on screen wrong. Fix the rule or fix the claim; never
  loosen the regex. Watch for `\b` in a rule touching te reo or 中文: JS word
  boundaries are ASCII-only, so `Whā\b` never matches.
- `npm run refresh-metrics` — dry-run GitHub stars/forks/commit-date refresh
  (`--apply` to write); only touches `- { label: "Stars", value: ... }`-style
  lines in the project shards. Also reports repo health (404s, renames,
  archived-but-active, activity gaps) for every GitHub-linked project.
- CV PDFs: `pwsh cv/build.ps1` (manual; needs typst). Emits three:
  `public/chan-meng-cv.pdf` (canonical 2-page), `public/chan-meng-cv-extended.pdf`
  (22-page magazine), and `cv/exports/chan-meng-cv-ats.pdf` (plain single-column
  ATS resume — tracked but deliberately OUTSIDE `public/`, never web-served or
  linked; see `cv/exports/README.md`). The same run also writes
  `cv/exports/chan-meng-cv-ats.docx` and `cv/exports/chan-meng-cv-ats.txt`, both
  parsed out of `cv/chan-meng-cv-ats.typ` by `cv/build-ats-exports.mjs`. The
  **ATS PDF is the default upload**; the `.docx` is the fallback for portals
  that refuse it (Lever did, 2026-08-03) and the `.txt` is for paste-in fields
- **A CV rebuild is not finished until the site is synced.** `public/chan-meng-cv.pdf`
  and `public/chan-meng-cv-extended.pdf` are ALSO served from chanmeng.org/cv out
  of a separate repo, `D:/github_repository/2d-portfolio/public/`, and nothing
  syncs them automatically. After every `pwsh cv/build.ps1`: copy those two files
  across, **bump `PREVIEW_V` in that repo's `src/app/cv/page.tsx` in the same
  commit** (each Cloudflare colo caches 4h independently — new bytes at an
  unchanged URL render the OLD CV, looking fine and being wrong), then
  `git push origin main` — push IS the deploy (Cloudflare Pages git integration;
  local `wrangler deploy` is broken on purpose). Copy **only** those two; never
  anything from `cv/exports/`. Full procedure and the reasoning: `cv/README.md`
  § "After every rebuild: sync the site".

## Display the historical maximum (Chan's standing rule, 2026-09-24)

Every count that measures reach or recognition — LinkedIn recommendations,
followers, newsletter subscribers, GitHub stars and followers, an upstream
project's stars, and the like — is shown at its **historical maximum** on every
surface: the shards, README, llms*.txt, the CVs (all three), the extended CV,
LinkedIn copy, cover letters and chanmeng.org.

- **Never lower a displayed number because the live platform number dropped.**
  A recommendation that LinkedIn hides or the recommender withdraws still
  counts (27 received, although LinkedIn shows 26); a dip in followers or stars
  is not a correction.
- **Raise it whenever the live number beats the recorded one.** Refresh with
  the measurement date in the metric's `note:` (and `asOf`).
- Word the claim so the maximum is true: "27 LinkedIn recommendations" or
  "received", never "27 *public*" or "currently shown". If the live figure is
  lower, record it in the `note:`, not on the surface.
- `refresh-metrics` output that is LOWER than the shard value is not applied.

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
  warn) vs 10-career.yaml, across BOTH `cv/sections/experience.typ` and
  `cv/chan-meng-cv-ats.typ`. PR gate runs it `--strict`. Its regex is not
  comment-aware: never write the literal `role-line` + `(` inside a comment in
  either file, or it parses as a phantom entry.
- `npm run check:ats` — parses `cv/chan-meng-cv-ats.typ` the way the Word/plain-text
  exports do and asserts its exact shape (7 headings in order, 9 roles, 4 projects,
  …); writes nothing, needs no typst. Part of `npm run check` and the PR gate. It
  fails loudly rather than letting a construct drop silently out of the `.docx`
  while still appearing in the PDF.
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
| `10-career.yaml` | work, volunteer, education | 13 + 4 + 3 | `id` |
| `20-projects-flagship.yaml` | projects (flagship band) | 4 | `id` |
| `21-projects-oss-primary.yaml` | projects (OSS primary band) | 7 | `id` |
| `22-projects-oss-webapps.yaml` | projects (collapsible: web apps) | 14 | `id` |
| `23-projects-oss-more.yaml` | projects (AI/creative/ML/branding/games + commissioned) | 84 | `id` |
| `25-contributions.yaml` | openSourceContributions | 23 | `id` |
| `30-recognition.yaml` | awards, certificates, publications | 7 + 53 + 75 | `title`+`awarder` / `name` |
| `40-skills.yaml` | skills, domains, languages, interests | 6 + 5 + 4 + 3 | `name` |
| `45-showcase.yaml` | showcaseCapabilities, showcase (craft evidence: reports, films, decks, slides, newsletters, GEO), productFilms (register: which product shows which promo film; one per product; must match chanmeng.org) | 7 + 11 + 13 | `id` / `projectId` |
| `50-references.yaml` | references | 27 | `id` |
| `60-network.yaml` | organizations, collaborators | 34 + 13 | `id` |
| `70-linkedin.yaml` | linkedin | curated live-page snapshot | — |
| `80-events.yaml` | events (offline talks/hackathons/workshops/appearances) | 23 | `id` |
| `90-meta.yaml` | meta (incl. `meta.x_brand` display config) | — | — |

Counts verified 2026-10-06 (`projects:` totals 109: 4 + 7 + 14 + 84; by tier
7 flagship / 8 primary / 27 secondary / 67 archive). One of them,
`genlab-career-academy`, is database-only, and `sunostats` (Seismophone) is pending
archive and off every visitor-facing surface: read the guard comment above each
before touching any display list, CV or LinkedIn copy. Recount with `loadProfile()`
rather than trusting this table after a wave of edits.

The `projects:` list spans shards 20→23 and is concatenated in filename order
by the loader. To find an entry: `grep -rn "id: <slug>" data/profile/`.

## Cross-reference rules (not enforced by the schema — keep them true)

- `projects[].relatedWorkId` → must exist as `work[].id` (10-career)
- `projects[].relatedProjectId` → must exist as `projects[].id`
- `collaborators[].currentOrgId` → must exist as `organizations[].id`
  (build fails if broken)
- **The partner-logo line on a project card comes from the ORG, not the
  project.** `organizations[].meta.x_brand.relatedProjectId` → `projects[].id`
  is what renders `For <logo> Org Name — <org context>` in project-cards.hbs.
  `projects[].clientOrgId` does NOT drive it (that only feeds the "↳ Part of"
  text link in the open-source tables). Two more gates: the org's `logo:` file
  must exist on disk (otherwise the card silently falls back to the project's
  `entity` prose — that is why Tam-AI-Ti has no logo), and the org's
  `context:` string becomes the descriptor after the em-dash, so keep it short
  and client-facing — it also renders in the llms.txt organisation roster.
  Several orgs may point at the SAME project (eatropolis-website is named by
  both `chow-luck-club` and `tataki-auckland-unlimited`); they render in
  `organizations[]` file order, so ordering in 60-network.yaml is load-bearing.
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

## Facts live in FOUR places — fix all of them

1. `data/profile/*.yaml` — canonical
2. `cv/sections/*.typ` — CV prose is **hand-curated Typst**, not generated.
   (`cv/build-llms-txt.mjs` used to be a fifth place hiding here. Since
   2026-09-07 every fact in `public/cv-llms.txt` is rendered from the shards and
   the file is gated by CI like README.md; only ~25 lines of Claude-Code
   architect vocabulary remain hardcoded, marked `HARDCODED` in the script with
   the reason. Do not add new facts there.)
3. `70-linkedin.yaml` — LinkedIn display copy is curated (dates/banner facts
   are auto-injected by the generator, titles/narrative are not)
4. `cv/chan-meng-cv-ats.typ` — the ATS resume carries its own copy on purpose:
   ATS wants action-verb bullets and expanded acronyms where the designed CV
   wants narrative prose. Unlike #3, its anchor facts (dates, titles, org URLs)
   ARE machine-guarded by `npm run check:cv`. It also carries three employers
   the designed CV mentions only in an italic aside (ByteDance, CORDE, Forward
   with Her) as full dated entries. `cv/exports/chan-meng-cv-ats.docx` and
   `.txt` are not a fifth place — they are generated views of this file, emitted
   by `cv/build-ats-exports.mjs`, exactly as README.md is a generated view of
   `data/profile/*.yaml`; never hand-edit them.

Changing a role title, date, or award in one place ≠ done. Check the other three.

## Field conventions

- `tier`: flagship | primary | secondary | archive (LLM-consumer ranking;
  archive = skip by default)
- `recency`: active | recent | historical | deprecated; `endDate: null` = current role
- `provenance` (projects only): client | personal | coursework | bootcamp |
  hackathon — the project's *kind/origin*, orthogonal to tier (ranking),
  recency/status (lifecycle), and category (domain). client = real employer /
  paid commission / affiliated-org work; coursework = university assignment or
  group-project origin; bootcamp = training-camp capstone (ByteDance Youth
  Training Camp etc.).
  Classify by evidence (`entity`/`relatedWorkId`/narrative), not by the meta
  editorial buckets. A shuttered/关停 project is expressed via `status: archived`
  + `recency: deprecated`, NOT a provenance value.
- `lastUpdated`: bump (YYYY-MM-DD) whenever you meaningfully review/edit an entry
- Dates are `"YYYY-MM"` or `"YYYY-MM-DD"` strings, quoted
- Long prose uses YAML `|` literal blocks; markdown allowed inside
- No pricing/cost framings in project narratives; README visuals are either
  files in this repo (the project cards, and since 2026-10-07 the hero, section
  strips, footer and pills in `public/readme/`) or Chan's own live tools
  (github-visitor-counter, github-readme-suno-cards). The README no longer
  embeds gradient-svg-generator: do not bring it back
- Any README visual must work on BOTH GitHub canvases (`#ffffff` and `#0d1117`).
  The failure mode is narrow: **ink on transparency** (the hero mark, now fixed
  with a `<picture>` swap). An asset carrying its own background plate — the
  cover, the Suno cards, the flag map — is fine in both themes, and a palette
  grep cannot tell the two apart. **Render before reporting anything as
  broken.** Technique + verification scripts:
  [readme-theme-assets-skill](https://github.com/ChanMeng666/readme-theme-assets-skill);
  this repo's status and the false-positive post-mortem are in
  `docs/github-theme-aware-assets.md`

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
