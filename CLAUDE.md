# CLAUDE.md

Chan Meng's **career database**. The source is `data/profile/*.yaml` (shards,
merged in filename order by `scripts/lib/load-profile.mjs`) plus
`data/brand.yaml` (design tokens). README.md, llms.txt, llms-full.txt, `dist/`,
`linkedin/linkedin-*.md`, `linkedin/linkedin-profile.json`, `public/cv-llms.txt`,
`public/cv.jsonld`, `cv/tokens.typ`, `cv/exports/*.{docx,txt}` and the platform
registers (`*/posts.yaml`, `suno/songs.yaml`, `suno/words.yaml`) are
**generated**: edit the source, then build. Scripts and what they do:
`package.json`.

**Read `docs/STATE.md` first**: what Chan has decided and which projects must
not be shown where. Its candid half is the gitignored `docs/STATE.private.md`.
This repo is public: nothing from a `*.private.*` file goes into a tracked file,
a commit message or generated output, and tracked wording states decisions, not
motives.

## Workflow

Edit the shard, run `npm run check`, commit the shard and the regenerated
outputs together. Find an entry with `grep -rn "id: <slug>" data/profile/`.

Not part of `npm run build`, run by hand when their inputs change:
`npm run build:cards`, `npm run build:art`, `pwsh cv/build.ps1`, the platform
syncs.

| Shard | Top-level keys |
|---|---|
| `00-basics` | basics, builderTools |
| `10-career` | work, volunteer, education |
| `20`…`23-projects-*` | projects (one list across four files; `23` also holds commissioned work) |
| `25-contributions` | openSourceContributions |
| `30-recognition` | awards, certificates, publications |
| `40-skills` | skills, domains, languages, interests |
| `45-showcase` | showcaseCapabilities, showcase, productFilms |
| `46-films` | filmCollections, films (source of chanmeng.org/films; read its header first) |
| `50-references` | references |
| `60-network` | organizations, collaborators |
| `70-linkedin` | linkedin (curated profile copy) |
| `80-events` | events |
| `90-meta` | meta (`meta.x_brand` holds the README display buckets) |

Some entries are recorded but kept off visitor-facing surfaces. Each has a guard
comment above it: read it before touching a display list, a CV or LinkedIn copy.

## Rules the gates do not enforce

- **Facts live in four places.** The shards; `cv/sections/*.typ` (hand-written);
  `70-linkedin.yaml` (titles and narrative are hand-written, dates are
  injected); `cv/chan-meng-cv-ats.typ` (its own copy on purpose). Changing a
  title, date, metric or award in one is not done until the other three agree.
  Use the `career-copy` skill for any copy change.
- **Reach counts show their historical maximum** on every surface
  (recommendations, followers, subscribers, stars; Chan, 2026-09-24). Raise
  when the live number is higher, never lower. Word it so the maximum is true
  ("27 recommendations", never "27 public"); a lower live reading goes in the
  metric's `note:`. Do not apply a `refresh-metrics` value that is lower.
- **`lastUpdated` means "a person re-read this".** Set it only with
  `npm run reviewed -- "<section.id>" --apply` after actually re-reading.
- **No links to private repos** on any surface, and never suggest making one
  public.
- **No pricing or cost framing** in project narratives. No commit counts or
  solo percentages in README-facing copy.
- **README visuals are files in this repo or Chan's own live tools**
  (github-visitor-counter, github-readme-suno-cards). No third-party badges.
  gradient-svg-generator is not embedded: do not bring it back.
- **Both GitHub canvases.** The only real failure is ink on transparency. An
  asset with its own background plate is fine; render before calling anything
  broken (`docs/github-theme-aware-assets.md`).
- **The partner-logo line on a project card comes from the organisation**:
  `organizations[].meta.x_brand.relatedProjectId`, not `projects[].clientOrgId`.
  The org's `logo:` file must exist or the card silently falls back to prose.
  Several orgs may name one project; they render in file order, so the order
  in `60-network.yaml` matters.
- **Taking a project off the README can drop it from llms.txt.** The LLM
  narrative block is derived from the README buckets. To keep the narrative,
  add the id to `meta.x_brand.llmsOnlyOpenSourceIds`.
- **`provenance`** is the project's origin (client, personal, coursework,
  bootcamp, hackathon), judged from evidence. A shut-down project is
  `status: archived` + `recency: deprecated`, not a provenance.
- **`dist/video-data.json`**: each fact is a regex over a metric's prose and the
  build fails when it stops matching. Fix the rule or the claim; never loosen
  the regex. `\b` is ASCII-only, so it never matches after te reo or 中文.
- **`check:cv` is not comment-aware.** Never write `role-line` followed by `(`
  inside a comment in a CV `.typ` file.
- A LinkedIn title that differs from `work[].position` on purpose needs
  `_titleCurated: true`.
- Multi-entry edits that need Chan's per-entry review are staged in
  `data/_intake/{topic}-wave-{N}-{YYYY-MM}.md` first.

## CVs

`pwsh cv/build.ps1` (needs typst) builds the two-page CV, the 22-page extended
CV and the ATS resume. The ATS PDF in `cv/exports/` is the default upload, the
`.docx` the fallback, the `.txt` for paste-in fields; `cv/exports/` is never
web-served. Hard rules and layout pitfalls: `cv/README.md`,
`cv/TYPST_PITFALLS.md`.

**A rebuild is not finished until the site is synced.** Copy
`public/chan-meng-cv.pdf` and `public/chan-meng-cv-extended.pdf` (only those) to
`D:/github_repository/2d-portfolio/public/`, bump `PREVIEW_V` in
`src/app/cv/page.tsx` in the same commit, and push: push is the deploy. Without
the bump Cloudflare serves the old CV for hours and it looks fine.

## README art

- **Project cards** (`public/cards/<id>.svg`, from `scripts/cards/<id>.mjs`):
  read `docs/animated-svg-cards.md` before making or changing one. A card is
  drawn in the product's own design system; nothing on it is drawn by hand
  (compile it, quote it, or cut it from the film or the live site); copy comes
  from an already-cleared source. A card whose outside inputs are missing is
  skipped and its committed SVG stands. That doc is also a published blog post:
  edit the file first, then republish.
- **Banners and pills** (`public/readme/`): listed in
  `data/brand.yaml › signatures.readmeArt`, drawn in this profile's Caldera
  system. A pill's label must be the exact text the README shows.

## Platforms, repos, hosting

- **X, LinkedIn (profile and the ArchCanvas page), Suno, YouTube** are recorded
  as registers in `x/`, `linkedin/`, `suno/`, `youtube/`. Read the register
  before answering anything about a platform; bring one up to date with the
  `x-sync`, `linkedin-sync` or `suno-sync` skill. What is posted there is
  Chan's to change: ask first.
- **Repo lineage**: `docs/ecosystem/lineage.yaml` (sensitive repos only in the
  gitignored `lineage.private.yaml`). When a repo is created, archived,
  renamed, transferred or deleted, update it and run
  `npm run check:ecosystem -- --live`. `positioning`, `stage` and `showcase`
  are Chan's judgement: never fill them in for her.
- **Repo and hosting operations**: `docs/operations/README.md` (specifics in the
  gitignored `hosting.private.md`). Chan decides, through the triage page
  (`node scripts/build-triage-page.mjs`), with nothing preselected. Delete a
  repo only after a second confirmation. Never delete the Coolify deploy SSH
  key; keep the Eatropolis deploy token; take no action on client-org billing.
  npm publishing needs her browser auth: prepare the package, she publishes.
  Never name the venue of the paper under review.
- **chanmeng.org** is the separate repo `D:/github_repository/2d-portfolio`.
  Changing which film a product shows means editing `productFilms` and the site
  in the same piece of work.
