# Current state and standing decisions

**As of 2026-10-09.** What Chan has decided, so nobody re-asks her or re-argues a
settled point. Decisions and pointers only: facts live in `data/profile/`, repo
topology in `docs/ecosystem/lineage.yaml`, procedures in
`docs/operations/README.md`. When this file disagrees with one of those, this
file is stale: fix it. Update it when she changes a priority, a project's fate
or a display rule.

The reasons behind some decisions and her priorities in her own words are in the
gitignored `docs/STATE.private.md`. Read it when present; never copy from it.

## What Chan is doing now

| Priority | What | Notes |
|---|---|---|
| **Main focus** | See the private state file | Weigh every "where should effort go" question against it |
| Own product | **ArchCanvas + ArchLang** | Her decision, 2026-10-07: keep developing. Do not re-argue it; help validate (user interviews, launch) |
| Client work | **GenLAB Career Academy** for NZiFOCUS | Lead developer, not the sole decision-maker: the pace follows the client |
| Role | **FemTech Weekend** CTO; the Red Thread site is in founder review | Pace set by the founder |
| Maintenance only | echook, gradient-svg-generator, a11y-loop, the Google News and Google Jobs MCP servers, the agent skills | Free open-source tools. Never propose paid tiers. Keep them healthy, add no features |
| Ended | GAVIGO (left 2026-09, access withdrawn), She Sharp (handed over 2026-09), CORDE (handed over 2024) | Still her lead-developer work, still shown as case studies |

## Display rules

Each is "the thing exists but must not be shown", so each is easy to break by
accident. "Visitor-facing" means `README.md`, chanmeng.org, all three CVs and
LinkedIn copy.

| Subject | Rule |
|---|---|
| **GenLAB Career Academy** (`genlab-career-academy`) | In the database, `llms-full.txt` and `dist/profile.json` only; on no visitor-facing surface. Kept so by: no `90-meta.yaml` bucket, tier never `flagship` (flagship is auto-selected into `public/cv-llms.txt`), no `organizations[]` entry for NZiFOCUS, collaborator `nga-blanchard` has `publicListing: false`. When Chan clears it: add the org, choose a tier, then the `career-copy` skill |
| **Seismophone** (`sunostats`) | Pending archive. The site stays online at her request, but it is off every visitor-facing surface and `cv-llms.txt` since 2026-10-07. The Suno probe and the README Suno cards are independent and keep running |
| **Chromaflow** (`gradient-svg-generator`) | Off every visitor-facing surface since 2026-10-07; keeps its narrative in the llms files (`llmsOnlyOpenSourceIds`). Repo stays public and maintained. No surface may say it powers this profile. Her other repos' READMEs still embed it and are not to be touched |
| **Te Pā Tiaki** (`css-tower-defense`) | Archived 2026-10-07, deployment retired. Its Neon database was left alone on purpose |
| **Music videos** (three `*-mv` projects, thirteen films) | Shown on YouTube and chanmeng.org/films, nowhere else (her rule, 2026-10-09). The repos are private: no repo links. Copy says how a film is drawn, never what the album is about |
| **Promo films** | One film on show per product (`productFilms` in `45-showcase.yaml`, checked by `check:ecosystem`). A product's film repos coexist; none replaces another. Exception: chanmeng.org/films shows every version |
| **chanmeng.org/films** | Every finished film. Not shown: the ArchLang narrated demo. Screen-recorded demos are not films and stay on YouTube. Source `46-films.yaml` → `dist/films.json` → the site's `scripts/sync-films.mjs` |
| **GAVIGO** | Only its three approved figures (78%, 4.45s → 1.00s, ~140ms), under its labels, with the boundary note ("controlled", "not a production SLA"). No internal timings, no "instant" or "no wait". Google for Startups and NVIDIA Inception are programme participation, never validation (Chan, 2026-10-07) |
| **CORDE** | On the README since 2026-10-08. Its commit share is counted on the original repository (236 of 413), with that basis beside the figure on every surface |
| **Google Jobs MCP Server**, **GitHub README Suno Cards** | Taken off the README on 2026-10-08 (a second MCP server repeats Google News; the "Sound I make" block already shows the cards). Both keep their llms narrative. The two MCP servers are independent products: never describe one as part of the other |
| **Extended CV, Chapter 3** | Ten tiles. The eleventh slot is closed: Seismophone, Chromaflow and a second MCP server were each turned down for it |
| **Org repos** | Administering a GitHub org does not make its repos hers: only those in `scope.orgRepoAllowlist` (`lineage.yaml`) are recorded |
| **Lost access** | Not lost authorship: the GAVIGO repos carry `accessRevoked` and stay hers |
| **chanmeng.org** | Never presented as a project; it is the venue |
| **YouTube** | A portfolio surface. Chan set each video's visibility on 2026-10-07; demos of archived projects (Panda, FemTracker, Wellness Agent, Sanicle) are private and must not be linked. Descriptions carry no links. Unlisted client and course recordings are left alone |
| **Podcasts** | Discontinued 2026-07: shown on no surface; the data entries stay |

## Platform registers

| Platform | Read | Kept current by |
|---|---|---|
| YouTube | `youtube/channel.yaml` (+ gitignored `channel.private.yaml`) | Hand, after each change in Studio |
| X | `x/account.yaml`, then `x/posts.yaml` (`summary` first) | `x-sync` skill |
| LinkedIn profile | `linkedin/account.yaml`, `linkedin/posts.yaml`; full text in `posts/<year>.yaml` | `linkedin-sync` skill |
| LinkedIn, ArchCanvas page | `linkedin/company/archcanvas/` | `linkedin-sync` skill |
| Suno (two accounts) | `suno/accounts.yaml`, `suno/songs.yaml`; lyrics in `suno/words.yaml` | `suno-sync` skill |

Current figures are in each register's `summary`, not here.

- Posts are Chan's to write, edit, delete or pin. A register's `flags` and
  `openItems` are observations for her, never instructions.
- She delegated the tagging of posts and threads to Claude (2026-10-07 and
  2026-10-08); she may overrule any tag.
- LinkedIn impressions stay in gitignored files.
- Suno: lyrics are tracked as a record (2026-10-09); quoting one elsewhere is a
  separate decision. The two accounts are one catalogue. The register puts no
  song on any surface.
- The LinkedIn profile copy is a separate matter: `data/profile/70-linkedin.yaml`.

## Lineage judgement fields

`positioning`, `stage` and `showcase` on each repo row are Claude's proposals
from a delegated pass (2026-10-06), which Chan may overrule, **except** where an
entry under `resolved:` in `lineage.yaml` quotes her. Read `resolved:` to tell
her words from a proposal. Do not fill these fields for a new repo without
asking, unless she delegates again. `showcase: flagship` requires
`tier: flagship` in the shard; the shard is the authority on tier.

## Open items

| Item | Waiting on |
|---|---|
| Archive Seismophone for real | Chan's word. Steps: `docs/operations/README.md` § Pending |
| LinkedIn, by hand | Chan: delete the Seismophone entry under Projects and its association on three skills (PostgreSQL Recursive CTEs, Reverse Engineering, Internationalization) |
| LinkedIn Featured video slot | The intro film does not exist yet; the slot in `70-linkedin.yaml` is a held-open placeholder |
| Delete the five listing forks | Their PRs closing, or 2026-11-14 |
| Back up `femtech-weekend-assets` off this machine | open |
| Google OAuth client and Resend key used by Te Pā Tiaki | Chan: revoke if they were dedicated to the game |
| YouTube home tab order | Chan: drag the rows in Studio into the order in `youtube/channel.yaml` › homeTab |
