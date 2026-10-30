# CLAUDE.md

Chan Meng's **career database**. The source is `data/profile/*.yaml` (shards,
merged in filename order by `scripts/lib/load-profile.mjs`) plus
`data/brand.yaml` (design tokens). README.md, llms.txt, llms-full.txt, `dist/`,
`linkedin/linkedin-*.md`, `linkedin/linkedin-profile.json`, `public/cv-llms.txt`,
`public/cv.jsonld`, `cv/tokens.typ`, `cv/exports/*.{docx,txt}` and the platform
registers (`*/posts.yaml`, `suno/songs.yaml`, `suno/words.yaml`) are
**generated**: edit the source, then build.

**Read `docs/STATE.md` first**: what Chan has decided and which projects must
not be shown where. Its candid half is the gitignored `docs/STATE.private.md`.
This repo is public: nothing from a `*.private.*` file or a `_private/`
directory goes into a tracked file, a commit message or generated output, and
tracked wording states decisions, not motives.

## Always read

1. `CLAUDE.md` (this file): hard rules and pointers.
2. `docs/STATE.md`: decisions and display rules.
3. `docs/INDEX.md`: the generated map of every source, doc, register and script,
   with when to read each. Scripts in detail: `scripts/README.md`.

`docs/LOG.md` is the chronology: what changed, when. Everything else is read on
demand through the index. Area rules load by themselves from `.claude/rules/`
when you touch matching files.

## Knowledge base layout

- **Raw sources**, immutable: `evidence/`, `*/capture/latest.json`, screenshots,
  and the local-only `docs/stories/_private/`. Never edit or move them.
- **Knowledge**, edited by hand or by an agent: the shards, `data/brand.yaml`,
  `docs/stories/*.md`, `docs/ecosystem/lineage.yaml`, the hand-kept register
  files (`account.yaml`, `curation.yaml`, `youtube/channel.yaml`,
  `distribution/plan.yaml`), the hand-written CV `.typ` files.
- **Derived**, generated: everything in the first paragraph above. Never edit it.
- `npm run build:wiki` writes `wiki/`, a local, gitignored Obsidian view of
  every entity.
- Filed answers live in `docs/answers/`; candid versions go in its `_private/`.

## Data map + cross-reference rules

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
| `47-agent-skills` | agentSkills (every skill she has made; read it for any skill question) |
| `50-references` | references |
| `60-network` | organizations, collaborators |
| `70-linkedin` | linkedin (curated profile copy) |
| `80-events` | events |
| `90-meta` | meta (`meta.x_brand` holds the README display buckets) |

- `docs/INDEX.md` is the generated map of what each shard and doc holds.
- Ids are kebab-case slugs, unique within their list. One slug names one real
  thing in every list it appears in, so a reference means that id in the list
  its field names. Every cross-reference field, and what it points to, is listed
  in `.claude/rules/data-profile.md`.
- Find an entry with `grep -rn "id: <slug>" data/profile/`.
- Some entries are recorded but kept off visitor-facing surfaces. Each has a
  guard comment above it: read it before touching a display list, a CV or
  LinkedIn copy, and never act against it.
- `show:` is the per-surface visibility declaration (readme, site, cv,
  linkedin, llms). A guard comment is the reminder, `show:` the fact,
  `npm run lint:kb` the gate.

Area rules, loaded by path:

| File | Covers |
|---|---|
| `.claude/rules/data-profile.md` | all shards: ids, references, guards, provenance |
| `.claude/rules/projects.md` | shards 20–23, 60, 90: shard choice, README buckets, cards, partner logos |
| `.claude/rules/recognition-linkedin.md` | shards 30, 70, 80: awards by id, LinkedIn injected facts |
| `.claude/rules/readme-art.md` | cards, banners, pills, templates |
| `.claude/rules/cv.md` | `cv/`: fact copies, Typst traps, site sync steps |
| `.claude/rules/registers.md` | `x/`, `linkedin/`, `suno/`, `youtube/`, `distribution/` |

## Workflow

- Edit the shard, run `npm run check`, commit the shard and the regenerated
  outputs together. `npm run validate` is the quick schema and id pass;
  `npm run lint:kb` checks references, `show:` leaks and metric provenance.
- Not part of `npm run build`, run by hand when their inputs change:
  `npm run build:cards`, `npm run build:art`, `npm run build:distribution`,
  `pwsh cv/build.ps1`, the platform syncs.
- Multi-entry edits that need Chan's per-entry review are staged in
  `data/_intake/{topic}-wave-{N}-{YYYY-MM}.md` first.
- **Hooks.** Project hooks in `.claude/settings.json` block edits to generated
  files and run `npm run validate` after a shard edit (`.claude/hooks/README.md`).
- **Log.** Every change that alters a decision, a fact or a display rule, or
  adds or removes an entry, appends one line to `docs/LOG.md` in the same
  commit, in the format its header gives.

## Rules the gates do not enforce

- **Facts live in four places.** The shards; `cv/sections/*.typ` (hand-written);
  `70-linkedin.yaml` (titles and narrative hand-written, dates injected);
  `cv/chan-meng-cv-ats.typ` (its own copy on purpose). Changing a title, date,
  metric or award in one is not done until the other three agree. More
  unchecked copies: `.claude/rules/cv.md`. Use the `career-copy` skill for any
  copy change.
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
- **Never name the venue of the paper under review.**

## CVs

`pwsh cv/build.ps1` (needs typst) builds the two-page CV, the 22-page extended
CV and the ATS resume. Rules: `cv/README.md`, `cv/TYPST_PITFALLS.md`,
`.claude/rules/cv.md`.

**A rebuild is not finished until the site is synced.** Copy
`public/chan-meng-cv.pdf` and `public/chan-meng-cv-extended.pdf` (only those) to
`D:/github_repository/2d-portfolio/public/`, bump `PREVIEW_V` in
`src/app/cv/page.tsx` in the same commit, and push: push is the deploy. Without
the bump Cloudflare serves the old CV for hours and it looks fine.

## README art

Read `docs/animated-svg-cards.md` before making or changing a project card.
Cards, banners, pills and templates: `.claude/rules/readme-art.md`. README
visuals are this repo's own files or Chan's own live tools: no third-party
badges.

## Platforms, repos, hosting

- **Registers** for X, LinkedIn (profile and the ArchCanvas page), Suno and
  YouTube are in `x/`, `linkedin/`, `suno/`, `youtube/`; film distribution is in
  `distribution/`. Read the register before answering anything about a
  platform. What is posted there is Chan's to change: ask first.
- **Marketing** runs from the private repo `chanmeng-marketing`: `calendar.yaml`
  is the only calendar, `resources.yaml` the map, `/today` the daily run.
- **Posting through Chrome** happens only after Chan has seen the exact text
  and said yes in the chat that day.
- **Repo lineage**: `docs/ecosystem/lineage.yaml` (sensitive repos only in the
  gitignored `lineage.private.yaml`). When a repo is created, archived,
  renamed, transferred or deleted, update it and run
  `npm run check:ecosystem -- --live`. `positioning`, `stage` and `showcase`
  are Chan's judgement: never fill them in for her.
- **Repo and hosting operations**: `docs/operations/README.md` (specifics in the
  gitignored `hosting.private.md`). Chan decides, through the triage page
  (`node scripts/build-triage-page.mjs`), with nothing preselected.
  - Delete a repo only after a second confirmation.
  - Never delete the Coolify deploy SSH key. Keep the Eatropolis deploy token.
  - Take no action on client-org billing.
  - npm publishing needs her browser auth: prepare the package, she publishes.
- **chanmeng.org** is the separate repo `D:/github_repository/2d-portfolio`.
  Changing which film a product shows means editing `productFilms` and the site
  in the same piece of work.
