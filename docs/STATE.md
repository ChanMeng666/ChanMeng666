# Current state and standing decisions

**As of 2026-10-15.** What Chan has decided, so nobody re-asks her or re-argues a
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
| Client work | **GenLAB Career Academy** for NZiFOCUS, in development | Lead developer, not the sole decision-maker: the pace follows the client |
| Role | **FemTech Weekend** CTO; the **LYZEN** company site (repo `femtech-weekend-redthread`) is in founder review | Pace set by the founder |
| Maintenance only | echook, a11y-loop, the Google News and Google Jobs MCP servers, the agent skills | Free open-source tools. Never propose paid tiers. Keep them healthy, add no features |
| Ended | GAVIGO (left 2026-10, last working day 2026-10-05; access withdrawn), She Sharp (handed over 2026-09), CORDE (handed over 2024) | Still shown as case studies. CORDE is stated in its placement title, Full Stack Developer and Lead Documenter, in copy and in interviews (Chan, 2026-10-15) |

## Display rules

Each is "the thing exists but must not be shown", so each is easy to break by
accident. "Visitor-facing" means `README.md`, chanmeng.org, all three CVs and
LinkedIn copy.

| Subject | Rule |
|---|---|
| **GenLAB Career Academy** (`genlab-career-academy`) | In development (Chan, 2026-10-12). In the database, `llms-full.txt` and `dist/profile.json` only; on no visitor-facing surface; it may be named openly in the data files. Its how-it-works film (`genlab-how-it-works`, repo `genlab-promo-studio`) follows the same rule and its content is not published: no media, not on /films, no `productFilms` row, no tile on the film wall. Kept so by: no `90-meta.yaml` bucket, tier never `flagship` (flagship is auto-selected into `public/cv-llms.txt`), no `organizations[]` entry for NZiFOCUS, collaborator `nga-blanchard` has `publicListing: false`. In interviews (Chan, 2026-10-15): she may discuss the project without naming the client; the live site is not shown until she clears it. When Chan clears it: add the org, choose a tier, then the `career-copy` skill |
| **LYZEN company site** (`lyzen-website`, repo `femtech-weekend-redthread`) | The official site of the LYZEN brand, live at lyzenglobal.com. It is not a redesign or a new generation of the FemTech Weekend site, which stays on its own domain: never describe it that way (Chan, 2026-10-12). LYZEN is the company above FemTech Weekend, its community arm; the chart is `organizations[]` id `lyzen`. Not shown for now (Chan, 2026-10-12): recorded in the database, but in no README bucket, no CV, no LinkedIn copy and not on chanmeng.org, and her CV and LinkedIn titles do not name LYZEN. The LYZEN org has no logo on purpose (a logo file would put it in the README organisation band). Do not raise any of this again until she does. Told in docs/stories/ since 2026-10-15 (Chan); still on no other visitor-facing surface. |
| **Seismophone** (`sunostats`) | Pending archive. The site stays online at her request, but it is off every visitor-facing surface and `cv-llms.txt` since 2026-10-07. The Suno probe and the README Suno cards are independent and keep running |
| **Chromaflow** (`gradient-svg-generator`) | Off every visitor-facing surface since 2026-10-07; keeps its narrative in the llms files (`llmsOnlyOpenSourceIds`). No longer maintained (Chan, 2026-10-12); the repo stays public. No surface may say it powers this profile. Its banners may be taken out of her other repos' READMEs, and are taken out wherever a README is rewritten |
| **Te Pā Tiaki** (`css-tower-defense`) | Archived 2026-10-07, deployment retired. Its Neon database was left alone on purpose |
| **Music videos** (four `*-mv` projects, fourteen films) | Shown on YouTube, on chanmeng.org/films, and as poster tiles on the README's film wall (the wall added 2026-10-10, her call); nowhere else: no project card, no CV, no LinkedIn copy, no other page of the site. The repos are private: no repo links. Copy says how a film is drawn, never what the album is about |
| **Posting through Chrome** | Claude may publish a post from Chan's signed-in browser once she has approved the exact text and said yes for that post; each post and each platform needs its own yes. She attaches videos by hand when the tool cannot. Claude never deletes or edits a published post, answers other people or changes a setting (Chan, 2026-10-12; steps: `distribution/README.md`). All calendars are run from the merged `npm run calendar` view |
| **Posting films** | Two films a week on LinkedIn and X, Tuesday and Thursday (2026-10-12). Music videos are not posted to X or LinkedIn (confirmed the same day). Draft text stays in the gitignored `distribution/drafts/` until she has approved and posted it |
| **Promo films** | One film on show per product (`productFilms` in `45-showcase.yaml`, checked by `check:ecosystem`). A product's film repos coexist; none replaces another. Exception: chanmeng.org/films shows every version |
| **Project copy on the README** | A project shown with an animated card has no description beside it: no impact headline, no mark and name row (Chan, 2026-10-13). What stays is the heading on the large cards and every line that names a partner with its logo ("For", "Works with", "Cohorts taught for", "Being adopted by") plus the sub-project links. The narrative stays in the shards and the llms files. A project without a card keeps its text |
| **One statement, once, on the README** | Nothing on the README restates what another part of it already says (Chan, 2026-10-13). Removed on that date and not to be written back: the intro lines under "What I build", "Client & organisation work", "More I've built" and "What I make beyond code"; the impact line under each current role in Experience; the value-proposition sentence in the hero. The data keeps all of it |
| **Hero "Featured in"** | Five names, in the file order of `publications[]`: DataCamp was added on 2026-10-13 and none of the other four was dropped (Chan) |
| **Third-party proof on a project** | "Featured by" and "Listed on" lines under a card come from `projects[].meta.x_brand.proofStrips`; each name must have a row in that project's `reach` register, read from the page itself. Logos are in `public/platform-logos/`. Only the Google News MCP Server has them today |
| **Film links on the README** | A project whose product has a film on YouTube ends with the "Watch on YouTube" pill, linking to that one film (Chan, 2026-10-14): the `primary` row of `films[]` with a `youtubeId`. A link, not an embed |
| **"More I've built" spacing** | Each project is its own block with an empty line before the next, not a row of one table (Chan, 2026-10-14: the table packed the cards edge to edge) |
| **A project on chanmeng.org** | Shows its film where the site plays it, otherwise its animated card, never a still alone (Chan, 2026-10-14). A project shown on the site with neither gets a card made. `github-readme-suno-cards` has a card for this reason and stays off the README |
| **Films on the README** | Not embedded since 2026-10-10. The film wall (`public/readme/films.svg`) stands open under "What I make beyond code", with one line and two links: chanmeng.org/films and YouTube. One tile per film: each product's primary film, the brand and event films, the music videos |
| **chanmeng.org/films** | Every finished film. Not shown: the ArchLang narrated demo. Screen-recorded demos are not films and stay on YouTube. Source `46-films.yaml` → `dist/films.json` → the site's `scripts/sync-films.mjs` |
| **GAVIGO** | Only its three approved figures (78%, 4.45s → 1.00s, ~140ms), under its labels, with the boundary note ("controlled", "not a production SLA"). No internal timings, no "instant" or "no wait". Google for Startups and NVIDIA Inception are programme participation, never validation (Chan, 2026-10-07) |
| **CORDE** | On the README since 2026-10-08. Its commit share is counted on the original repository (236 of 413), with that basis beside the figure on every surface |
| **Google Jobs MCP Server**, **GitHub README Suno Cards** | Taken off the README on 2026-10-08 (a second MCP server repeats Google News; the "Sound I make" block already shows the cards). Both keep their llms narrative. The two MCP servers are independent products: never describe one as part of the other |
| **Extended CV, Chapter 3** | Ten tiles. The eleventh slot is closed: Seismophone, Chromaflow and a second MCP server were each turned down for it |
| **Not recorded** | Repositories of third-party technical assessments and local clones of other people's repositories: not her projects, in no data file (Chan, 2026-10-12) |
| **Org repos** | Administering a GitHub org does not make its repos hers: only those in `scope.orgRepoAllowlist` (`lineage.yaml`) are recorded |
| **Lost access** | Not lost authorship: the GAVIGO repos carry `accessRevoked` and stay hers |
| **chanmeng.org** | Never presented as a project; it is the venue |
| **YouTube** | A portfolio surface. Chan set each video's visibility on 2026-10-07; demos of archived projects (Panda, FemTracker, Wellness Agent, Sanicle) are private and must not be linked. Descriptions carry links since 2026-10-09 (the account is verified; what goes in the block: `youtube/README.md`). Unlisted client and course recordings are left alone |
| **Podcasts** | Discontinued 2026-07: shown on no surface; the data entries stay |
| **Blog posts on chanmeng.org** | A dated record. A post that names a project is not edited when that project leaves the shopfront (Chan, 2026-10-16, delegated). `show.site: false` therefore covers the site's pages and data, not `content/*.mdx` |
| **Product READMEs** | One screen (Chan, 2026-10-12): wordmark, one sentence, link pills, the animated card, the film, the shortest way in, at most one mermaid diagram, then a pointer for the reader's own coding agent. What was cut moves to `docs/overview.md` in that repo, not deleted. No third-party badges; buttons are pills from `scripts/build-product-pills.mjs`, committed in the product repo. Chan uploads each film by hand on github.com, at the placeholder comment. Scope: ArchLang, the two ArchCanvas front pages, echook, a11y-loop, both MCP servers, github-visitor-counter, github-readme-suno-cards, the AI Programming platform |

## Platform registers

| Platform | Read | Kept current by |
|---|---|---|
| YouTube | `youtube/channel.yaml` (+ gitignored `channel.private.yaml`); published titles and descriptions in `youtube/videos.yaml` | Hand, after each change in Studio; then `npm run capture:youtube` |
| X | `x/account.yaml`, then `x/posts.yaml` (`summary` first) | `x-sync` skill |
| LinkedIn profile | `linkedin/account.yaml`, `linkedin/posts.yaml`; full text in `posts/<year>.yaml` | `linkedin-sync` skill |
| LinkedIn, ArchCanvas page | `linkedin/company/archcanvas/` | `linkedin-sync` skill |
| Suno (two accounts) | `suno/accounts.yaml`, `suno/songs.yaml`; lyrics in `suno/words.yaml` | `suno-sync` skill |

| Film distribution (all platforms) | `distribution/status.yaml`, `distribution/calendar.md`; the plan is `distribution/plan.yaml` | Hand (the plan), then `npm run build:distribution`; how to run the calendar: `distribution/README.md` |

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
| LinkedIn, by hand | Chan: delete the two podcast entries under Publications (Decoding the Future, Future Turing) |
| LinkedIn, by hand | Chan: update the FemTech China award description (`70-linkedin.yaml:1667` and `:1673`): the challenge name in the first sentence and the last sentence |
| Which organisation ran the inaugural Challenge where FreePeriod won Best Social Media Award | Chan: three places say "FemTech Weekend Challenge" (`10-career.yaml` FreePeriod narrative, `70-linkedin.yaml:486`, `90-meta.yaml:616`), the award entry says "FemTech China Women's Health Technology Challenge". Align once she confirms |
| LinkedIn Featured video slot | The intro film does not exist yet; the slot in `70-linkedin.yaml` is a held-open placeholder |
| Delete the five listing forks | Their PRs closing, or 2026-11-14 |
| Google OAuth client and Resend key used by Te Pā Tiaki | Chan: revoke if they were dedicated to the game |
