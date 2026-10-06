# Current state and standing decisions

**As of 2026-10-07.** Read this first. It is the short, dated answer to "what is
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
| Maintenance only | echook, gradient-svg-generator (Chromaflow), a11y-loop, the Google News and Google Jobs MCP servers, the agent skills | Free open-source tools, kept as community projects and demonstrations of her engineering. Do not propose paid tiers for them. Keep them healthy (issues, accurate READMEs), add no features |
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
| chanmeng.org | Never presented as a project; it is the venue | Decided 2026-10-02 |

## What the README shows today

Rebuilt from `data/profile/90-meta.yaml`. Verify with `npm run build` rather than
trusting this list after edits.

- Flagship cards: ArchLang, ArchCanvas.
- Client and organisation cards: FemTech Weekend Website, Eatropolis Website,
  GAVIGO IRE (with the GAVIGO website as a sub-project), She Sharp.
- AI agents and tooling: echook, Google News MCP Server, Google Jobs MCP Server,
  AI Programming Education Platform, a11y-loop.
- Craft and products: Chromaflow, GitHub README Suno Cards.
- Commissioned: Tam-AI-Ti.

Counts on 2026-10-07: 109 projects in `data/profile` (7 flagship, 8 primary, 27
secondary, 67 archive); 11 showcase items; 13 product-film rows.

## What the CVs show today

- Designed two-page CV: the "Also built" aside lists eatropolis.co.nz, Tam-AI-Ti
  and gradient-svg-generator (three links).
- ATS resume: 10 roles, 4 projects, 3 "Also built" links
  (`scripts/lib/parse-ats-resume.mjs` `EXPECT`).
- Extended CV, Chapter 3: eleven tiles. ArchCanvas, ArchLang; GAVIGO IRE, She
  Sharp, FemTech Weekend, Eatropolis; echook, Google News MCP; **Chromaflow**
  (took the Seismophone slot on 2026-10-07), a11y-loop; the teaching platform.
- All three were rebuilt and the site synced on 2026-10-07 (`PREVIEW_V` 16).

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

On 2026-10-07, of 81 active rows: 8 building, 24 maintained, 2 paused, 42 done,
5 handed-over; 7 flagship, 9 featured, 39 listed, 26 hidden.

## Open items

| Item | Waiting on |
|---|---|
| Archive Seismophone for real | Chan's word. Steps: `docs/operations/README.md` § Pending |
| LinkedIn, by hand | Chan: delete the Seismophone entry under Projects and its project association on three skills (PostgreSQL Recursive CTEs, Reverse Engineering, Internationalization). The repo's copy is already updated; LinkedIn itself is not |
| Delete the five listing forks | Their PRs closing, or 2026-11-14 |
| Back up `femtech-weekend-assets` off this machine | open |
| Google OAuth client and Resend key used by Te Pā Tiaki | Chan: revoke if they were dedicated to the game (not reviewed) |
| GenLAB career copy | When Chan clears GenLAB for display: add the org entry, choose a tier, then follow the `career-copy` skill for each surface |

## How these decisions were made

Session of 2026-10-06 to 2026-10-07: an inventory of every repo against
`lineage.yaml` and GitHub, then a question-and-answer pass with Chan. Her answers
are kept verbatim-in-substance under `resolved:` in `lineage.yaml` (q31 to q44).
Her private market research was read for the effort question; nothing from it is
repeated in tracked files.
