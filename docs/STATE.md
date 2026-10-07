# Current state and standing decisions

**As of 2026-10-08.** Read this first. It is the short, dated answer to "what is
true right now and what has Chan already decided", so that nobody re-asks her or
re-argues a settled point. It carries decisions and pointers, not the data:
facts live in `data/profile/`, repo topology in `docs/ecosystem/lineage.yaml`,
procedures in `docs/operations/README.md`. When this file and one of those
disagree, the data file is right and this file is stale: fix it.

Update it whenever Chan changes a priority, a project's fate, or a display rule.

**This repo is public.** The reasons behind some of these decisions, Chan's
priorities in her own words and what her private market research concluded are in
the local-only, gitignored `docs/STATE.private.md`. Read it when it is present;
never copy its contents into a tracked file, a commit message or generated output.
Keep the wording in tracked files neutral: decisions and rules, not motives.

## What Chan is doing now

| Priority | What | Notes |
|---|---|---|
| **Main focus** | See the private state file | Weigh every "where should effort go" question against it |
| Own product | **ArchCanvas + ArchLang** keep being developed | ArchCanvas is the commercial AI agent product she values most; its stack (ArchLang) is hers alone. Her decision, 2026-10-07: keep developing. **Do not re-argue it; help validate** (user interviews, launch) |
| Client work | **GenLAB Career Academy** for NZiFOCUS (paid commission) | Lead developer, but not the sole decision-maker: the pace follows the client and the other collaborators. It cannot be "sped up" by her alone |
| Role | **FemTech Weekend** CTO; the Red Thread site is in founder review | Small revisions expected; pace set by the founder |
| Maintenance only | echook, gradient-svg-generator (Chromaflow; not shown, see the display rules), a11y-loop, the Google News and Google Jobs MCP servers, the agent skills | Free open-source tools, kept as community projects and demonstrations of her engineering. Do not propose paid tiers for them. Keep them healthy (issues, accurate READMEs), add no features |
| Ended | GAVIGO (left 2026-09, repo access withdrawn), She Sharp (handed over 2026-09), CORDE (handed over 2024) | Still her lead-developer work and still shown as case studies |

## Display rules decided in October 2026

These are easy to break by accident, because each one is "the thing exists but
must not be shown". The guard comment above the entry in its shard repeats the
rule; read it before touching a display list, a CV or LinkedIn copy.

| Subject | Rule | Where it is enforced or recorded |
|---|---|---|
| **GenLAB Career Academy** (`genlab-career-academy`) | Recorded in the database, and that is fine. It must **not** appear where a visitor reads with their own eyes: `README.md`, chanmeng.org pages, any CV, LinkedIn copy. It may appear in `llms-full.txt` and `dist/profile.json` | In no `90-meta.yaml` bucket; tier must not become `flagship` (flagship projects are auto-selected into `public/cv-llms.txt`); no `organizations[]` entry for NZiFOCUS; collaborator `nga-blanchard` has `publicListing: false` |
| **Seismophone** (`sunostats`) | **Pending archive.** The site stays online for now at Chan's request, but it is treated as already archived on every visitor-facing surface, and was removed from all of them on 2026-10-07 | Out of every bucket, all three CVs, `cv-llms.txt`, the LinkedIn copy and chanmeng.org. The real archive waits for Chan's word: steps in `docs/operations/README.md` § Pending. The Suno probe and the README cards are independent and keep running |
| **Te Pā Tiaki** (`css-tower-defense`) | **Archived 2026-10-07.** Repo archived (still public), deployment retired, Worker deleted, hostname gone | Shard entry is `status: archived`, `recency: deprecated`, `tier: archive`, no live `url`. Its Neon database was left alone on purpose (free tier) |
| **Promo films** | **One film on show per product.** A product may have several film repos; they coexist and none replaces another. Film repos are filed under the product's family, never as a film series | Register `productFilms` in `data/profile/45-showcase.yaml` (13 rows), checked by `npm run check:ecosystem`. Changing which film a product shows means editing that row **and** chanmeng.org |
| **Org repos** | Administering a GitHub org does not make its repos hers. Only repos she led are recorded (`scope.orgRepoAllowlist`); for example `Chow-Luck-Club/eatropolis-capacity` is not her work | `docs/ecosystem/lineage.yaml` header |
| **Lost access** | Losing access is not losing authorship: both GAVIGO repos carry `accessRevoked: "2026-09"` and stay hers | The live check skips rows with `accessRevoked` |
| **Two MCP servers** | `server-google-news` (project id `google-news-mcp`) and `server-google-jobs` are two independent products that share a stack. Never describe one as a part of the other | `resolved` q38 in `lineage.yaml` |
| **GAVIGO figures and wording** | Stated the way GAVIGO states them, on every surface. The only performance figures are its three approved proof metrics (78%, 4.45s → 1.00s, ~140ms), under its labels and with the boundary note ("controlled", "not a production SLA"). The orchestrator's internal timings and hit rate are not public figures. No "instant" or "no wait" promises. Google for Startups and NVIDIA Inception are programme participation, never validation or endorsement | Chan's instruction, 2026-10-07. Guard comment above `metrics` in the `gavigo-ire` entry; `cv/cover-letter/EVIDENCE.md` Theme B; the comment above `GAVIGO` in the site's `src/data/showcase.ts` |
| **README project cards** | Twelve projects carry a generated animated SVG: the seven big cards open with one, and since 2026-10-08 five rows of the "More I've built" tables (echook, Google News MCP Server, AI Programming Education Platform, a11y-loop, Tam-AI-Ti) have a full-width card row above them. The cards (`public/cards/<id>.svg`, `npm run build:cards`). Each is drawn in the product's own design system, shows the product at work from real evidence, and ends on a frame about the work with every figure's basis beside it. Method, rules and past mistakes: `docs/animated-svg-cards.md` (also published on the blog; the docs file is the source). The reusable toolkit lives in `svg-animation-studio` | Chan's review, 2026-10-07. `CLAUDE.md` § Animated project cards |
| **Chromaflow** (`gradient-svg-generator`) | Off every surface a visitor reads: `README.md`, all three CVs, LinkedIn copy, chanmeng.org. It stays in the database and keeps its narrative in `llms.txt` / `llms-full.txt`. The repo is public and maintained, not archived. Do not re-add it to a display list | Chan's decision, 2026-10-07. Out of `openSourceCraftProjectIds` and `spotlightProjectIds`, in `llmsOnlyOpenSourceIds`; `showcase: listed` in `lineage.yaml`; guard comment above the shard entry |
| **Music videos** (`october-rain-february-line-mv`, `anti-marriage-universe-mv`) | Chan's own music videos, recorded in the database at her request on 2026-10-07. Database-only: in no display bucket, no CV, no LinkedIn copy, not on chanmeng.org. Both repos are private, so no repo links. On 2026-10-08 she published the two films of `october-rain-february-line-mv` on her YouTube channel herself, so those two are public there, in the Music videos playlist, and the shard links the YouTube copies. Her rule the same day: YouTube only, nowhere else. They appear as one line each in `llms-full.txt` and in `dist/profile.json`. Do not show them anywhere else | Guard comment above the two entries in `23-projects-oss-more.yaml`; family `music-videos` in `lineage.yaml` (`showcase: hidden`, Claude's proposal) |
| **README banners and pills** | The README no longer embeds gradient-svg-generator. The hero, the two section strips, the footer band and the eight link pills are committed SVGs in `public/readme/`, drawn in the Caldera system (`npm run build:art`); the credit captions that pointed at the tool are gone, and no surface may say it powers this profile. Her other repos' READMEs still embed it and were not touched | Chan's decision, 2026-10-07. `data/brand.yaml` › `signatures.readmeArt`; `CLAUDE.md` § The README's own banners and pills; guard comment above the `gradient-svg-generator` entry |
| chanmeng.org | Never presented as a project; it is the venue | Decided 2026-10-02 |
| **YouTube channel** | The channel is a portfolio surface: product films, public demos and brand films. Chan chose each video's visibility and title on 2026-10-07; demos of archived projects (Panda, FemTracker, Wellness Agent, Sanicle) were made private and must not be linked. Descriptions carry no links. Unlisted client and course recordings are left alone | Register `youtube/channel.yaml`; unlisted and private inventory only in the gitignored `youtube/channel.private.yaml` |

## Platform registers

Three of Chan's platforms (four pages) are recorded in this repo as they stand, so that a
question about them is answered from a file and not from memory:

| Platform | Read | Kept current by |
|---|---|---|
| YouTube (@ChanMeng666) | `youtube/channel.yaml` (+ the gitignored `channel.private.yaml`) | Hand, after each change in Studio |
| X (@chanmeng666) | `x/account.yaml`, then `x/posts.yaml` (every post; its `summary` block first) | The `x-sync` skill: a browser capture, then `npm run build:x`; `npm run check:x` fails when they disagree |
| LinkedIn (chanmeng666) | `linkedin/account.yaml`, then `linkedin/posts.yaml` (`summary`, then one line per post); full text in `linkedin/posts/<year>.yaml`; impressions in the gitignored `linkedin/posts.private.yaml` | A browser capture, then `npm run build:linkedin-register`; `npm run check:linkedin-register` fails when they disagree. Procedure: `linkedin/README.md` |
| LinkedIn, the ArchCanvas company page | `linkedin/company/archcanvas/account.yaml`, then `posts.yaml` beside it | The same capture and build as her profile; no impressions (LinkedIn's feed does not carry them for a page) |

On 2026-10-08 the X account stood at 47 posts in 17 live threads, 4 followers; a new intro thread was posted and pinned on 2026-10-07, and the old one and one other post are gone. The six observations made that day are settled: `x/account.yaml` › `openItems`. Posts
are Chan's to edit, delete or pin: the register's `flags` and `openItems` are
observations for her, never instructions.

On 2026-10-07 the LinkedIn account stood at 285 posts and 33 plain reposts since
2023-12, and 6,452 followers. Chan delegated the decisions on what was noticed
that day to Claude on 2026-10-08: impressions stay in gitignored files, the
follower figure was raised to 6,452 on every surface that quotes it, and every
post was read and tagged with a topic and its projects
(`linkedin/curation.yaml`). One observation stays open, because what she posts
is hers: `linkedin/account.yaml` › `openItems`. The profile copy is a separate
matter and stays in `data/profile/70-linkedin.yaml`.

On 2026-10-08 the ArchCanvas company page stood at eight posts since 2026-07-23
and 11 followers.

## What the README shows today

Rebuilt from `data/profile/90-meta.yaml`. Verify with `npm run build` rather than
trusting this list after edits.

- Flagship cards: ArchLang, ArchCanvas.
- Client and organisation cards: FemTech Weekend Website, Eatropolis Website,
  GAVIGO IRE (with the GAVIGO website as a sub-project), She Sharp, and since
  2026-10-08 the CORDE field-operations mobile app (Chan's decision). Its commit
  share is counted on the original repository (236 of 413, 57%), with that
  basis beside the figure on every surface.
- AI agents and tooling: echook, Google News MCP Server, AI Programming Education
  Platform, a11y-loop. Google Jobs MCP Server was taken off on 2026-10-08 (Chan:
  a second MCP server repeats Google News); it keeps its narrative in the llms files.
- Craft and products: empty since 2026-10-08, so the table does not render. GitHub
  README Suno Cards was taken off (Chan: the "Sound I make" block already shows the
  cards and credits the project); it keeps its narrative in the llms files.
- Commissioned: Tam-AI-Ti.

Counts on 2026-10-07: 111 projects in `data/profile` (7 flagship, 8 primary, 29
secondary, 67 archive); 11 showcase items; 13 product-film rows.

## What the CVs show today

- Designed two-page CV: the "Also built" aside lists eatropolis.co.nz and
  Tam-AI-Ti (two links).
- ATS resume: 10 roles, 4 projects, 2 "Also built" links
  (`scripts/lib/parse-ats-resume.mjs` `EXPECT`).
- Extended CV, Chapter 3: **ten** tiles. ArchCanvas, ArchLang; GAVIGO IRE, She
  Sharp, FemTech Weekend, Eatropolis; echook, Google News MCP; a11y-loop, the
  teaching platform. The eleventh slot (Seismophone's, then Chromaflow's) is
  closed: Chan turned down the Google Jobs MCP Server as a substitute on
  2026-10-07, because a second MCP tile beside Google News is redundant. The
  chapter's closing quote now has page 13 to itself; still 22 pages.
- All three were rebuilt and the site synced on 2026-10-08 (`PREVIEW_V` 20), for the LinkedIn follower figure in the designed CV's header.

## Every active repo has been judged

Each non-archived repo row in `lineage.yaml` (and the local overlay) carries
three fields that Chan agreed to on 2026-10-06:

| Field | Meaning | Values |
|---|---|---|
| `positioning` | One line: what the repo is for | free text |
| `stage` | Where development stands | `building`, `maintained`, `paused`, `done`, `handed-over` |
| `showcase` | How prominently it is shown publicly | `flagship`, `featured`, `listed`, `hidden` |

**Whose judgement it is.** Chan delegated the filling-in to Claude in three
batches (own products, client and organisation work plus film repos, then skills,
personal brand, workspaces and forks). So the values are Claude's proposals,
which she may overrule, **except** where an entry under `resolved:` quotes her:
q31 to q38 (2026-10-06) and q40, q42, q44 (2026-10-07). Read `resolved:` to tell
her words from a proposal. Do not fill these fields for a new repo without
asking her, unless she delegates again.

The career shard stays the authority on `tier`: `showcase: flagship` requires
`tier: flagship` there, and the validator enforces it. No tier was changed by the
judgement pass itself. Two tiers changed by her instruction: `sunostats` to
`secondary`, `css-tower-defense` to `archive`.

On 2026-10-07, of 83 active rows: 8 building, 24 maintained, 2 paused, 44 done,
5 handed-over; 7 flagship, 8 featured, 40 listed, 28 hidden. (Later that day
gradient-svg-generator went from featured to listed, and the two music-video
repos were added as done and hidden.)

## Open items

| Item | Waiting on |
|---|---|
| Archive Seismophone for real | Chan's word. Steps: `docs/operations/README.md` § Pending |
| LinkedIn, by hand | Chan: delete the Seismophone entry under Projects and its project association on three skills (PostgreSQL Recursive CTEs, Reverse Engineering, Internationalization). The repo's copy is already updated; LinkedIn itself is not |
| Delete the five listing forks | Their PRs closing, or 2026-11-14 |
| Back up `femtech-weekend-assets` off this machine | open |
| Google OAuth client and Resend key used by Te Pā Tiaki | Chan: revoke if they were dedicated to the game (not reviewed) |
| YouTube home tab order | Chan: drag the rows in Studio into the order noted in `youtube/channel.yaml` › homeTab |
| GenLAB career copy | When Chan clears GenLAB for display: add the org entry, choose a tier, then follow the `career-copy` skill for each surface |

## How these decisions were made

Session of 2026-10-06 to 2026-10-07: an inventory of every repo against
`lineage.yaml` and GitHub, then a question-and-answer pass with Chan. Her answers
are kept verbatim-in-substance under `resolved:` in `lineage.yaml` (q31 to q44).
Her private market research was read for the effort question; nothing from it is
repeated in tracked files.
