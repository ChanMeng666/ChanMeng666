# Repo lifecycle and hosting operations

What happens to a repo or a deployment after it is built: archive, make private,
delete, retire a hosted site, publish to npm.

Operational specifics (droplet, account scopes, token names, backup locations,
closed payment accounts) live only in the local-only, gitignored
`docs/operations/hosting.private.md`. Read it when present; never copy its
contents into tracked files.

## How decisions are made

**Chan decides; the tooling only prepares the question.** Bulk repo decisions go
through the interactive page built by `scripts/build-triage-page.mjs` (flags in
the script header): default mode decides README prominence per catalog project,
`--mode repos` decides fate (keep / shelve / archive / delete) and visibility per
live repo, `--mode visibility` decides archive state and public / private for
every repo including archived, private, forks and the org allowlist. Every card
starts undecided; the script's opinion is an advisory hint only. Never pre-decide
or bundle recommendations into a plan. Decisions come back as exported JSON;
apply them with `gh`, then follow the checklists.

## Checklists

### Archive a repo

1. Disable user-written workflows, then delete Actions secrets, remove webhooks,
   remove Dependabot config and PRs, clear artifacts and caches. Do this **before**
   archiving: archived repos are read-only.
2. Unpublish GitHub Pages and retire any hosting (see "Retire a deployment").
3. Strip links in all four fact places plus the site (below).
4. `gh repo archive`.
5. Update `docs/ecosystem/lineage.yaml` (or the private overlay) and run
   `npm run check:ecosystem -- --live`.

Settings changes on an already-archived repo need unarchive, change, re-archive.
GitHub can answer 422 right after a state flip: retry after a short wait.

### Make a repo private

1. Check the repo is not a fork of a public repo (those cannot be made private).
2. Unarchive if needed, flip visibility, re-archive.
3. Strip every link to it from the shards, `cv/`, LinkedIn copy and chanmeng.org.
   Evidence is a live site, LinkedIn or a package page. Respect in-shard
   "do not re-add" markers.
4. If an npm package's `repository` field points at it, publish a new version
   without that field.
5. Stars on the repo drop out of the public count (accepted, 2026-10-03).
6. Lineage update and `check:ecosystem -- --live`.

### Delete a repo

Only after a **second explicit confirmation** from Chan. Back up anything local
first, then remove the repo from `lineage.yaml` and every shard.

### Strip links: the four fact places plus the site

`data/profile/*.yaml`, `cv/sections/*.typ`, `70-linkedin.yaml`,
`cv/chan-meng-cv-ats.typ`, then the chanmeng.org repo (`2d-portfolio`). Rebuild;
if a CV changed, rebuild the PDFs and sync the site (`cv/README.md`).

### Retire a deployment

Back up first (database exports, bucket contents, config; location in the private
file), then delete the project, store or zone. Retire the DNS and the repo's
hosting integration in the same pass. A retired URL must also disappear from the
shards and from `scripts/` helpers that hard-code URLs (og-covers, screenshot
scripts).

### Publish an npm package

Publishing needs Chan's **browser authentication**: prepare the package (version
bump, `npm pack --dry-run`), then she runs `npm publish` herself.

- A package whose source repo is private cannot carry npm provenance: publish it
  from a local folder (`npm publish <folder> --access public`) with `homepage` set
  to the live site and no `repository` / `bugs`. Done on 2026-10-03 for
  `chan-meng` 2.0.2, `vitex-cli` 0.2.2 and `@chanmeng666/femtech-radar-mcp` 0.4.2.
- To release from an archived repo: unarchive, commit, push, re-archive.
- Packages: `@chanmeng666/archlang`, `@chanmeng666/archlang-mcp`,
  `@chanmeng666/archlang-font-cjk`, `a11y-loop`, `@chanmeng666/google-news-server`,
  `@chanmeng666/google-jobs-server`, `chan-meng`, `vitex-cli`,
  `@chanmeng666/femtech-radar-mcp`.

## Where things are hosted (public-safe)

| Platform | What |
|---|---|
| Cloudflare Pages | `2d-portfolio` (chanmeng.org; push to `main` deploys), `ai-programming-teaching-project` (programming.chanmeng.org), `femtech-weekend-website`, `femtech-weekend-redthread` |
| Cloudflare Workers | `sunostats` (seismophone.chanmeng.org, with crons; pending archive), `archlang-docs` (archlang.uk), `archlang-playground`, `ai-chat-worker` (programming-api.chanmeng.org) |
| Vercel (personal scope) | `gradient-svg-generator`, `github-readme-suno-cards`, `github-visitor-counter` |
| One DigitalOcean droplet | ArchCanvas and Vitex, run through Coolify behind Traefik. www.vitex.org.nz stays live although the Vitex repo is archived and private |
| GitHub Pages | none on any archived repo |

There is no Railway. libraryos.live, fanfic-lab.tech and
towerdefense.chanmeng.org are retired on purpose. Local backups of the retired
items exist (location in the private file).

## Standing policies

- **Client orgs.** Eatropolis (`Chow-Luck-Club/eatropolis-website`) and She Sharp
  (`NZ-SheSharp/she-sharp`) are fully handed over and bill to their own orgs; Chan
  stays org admin. Take no action on them. The Eatropolis deploy token is a live
  dependency of the client site: keep it. CORDE production runs the fork
  gentoo111 maintains. The GenLAB repo lives in the client's personal account:
  Chan has write access only, and its secrets and settings are the client's.
  Org-repo scope is the allowlist in `lineage.yaml`; other org repos are not
  Chan's.
- **No links to private repos** anywhere public, and never suggest making one
  public.
- **Listing forks.** `awesome-aec-mcp`, `Awesome-AECO`, `awesome-generative-ai`,
  `awesome-mcp-servers`, `awesome-typescript` exist only to submit ArchLang
  listings (PRs opened 2026-09-14). Delete each fork once its PR is merged or
  closed, or all of them on **2026-11-14**, in one confirmation. `reveal.js` is a
  real customised fork: keep.
- **Never delete the Coolify deploy SSH key.** Its comment says it was formerly a
  fanfic-lab key; it is what deploys ArchCanvas and Vitex. Details in the private
  file.
- **Keys.** Revoke unused provider tokens; keep tokens that live CI or a live site
  needs. Names and status are in the private file only.
- **Paper under review.** Never name the venue in any tracked file.
- **Shelved products.** Vitex and FreePeriod are not mentioned as projects on the
  CVs or in LinkedIn copy (the FreePeriod CTO role stays). chanmeng.org is never
  presented as a project.
- **Newsletter.** Generated by hand every Monday with the 2d-portfolio project
  skill (`npm run newsletter:metrics` for numbers on demand). There is no cron
  reminder any more (deleted 2026-10-03).
- **Te Pā Tiaki's database** was left alone on purpose when its deployment was
  retired (Chan, 2026-10-07).

## Folders deliberately without a GitHub repo

- `D:\github_repository\femtech-weekend-assets`: non-git asset vault feeding
  `femtech-weekend-redthread`. It contains a file over 100 MB, so it cannot go to
  GitHub.
- `D:\github_repository\obsidian`: personal notes, not a project.

## Pending

As of 2026-10-07.

| Item | Due |
|---|---|
| Delete the five listing forks once their PRs close (or all at once, one confirmation) | by 2026-11-14 |
| Back up `femtech-weekend-assets` off this machine | open |
| **Archive Seismophone** (`sunostats`, seismophone.chanmeng.org). Left online for now at Chan's request; already off every visitor-facing surface (2026-10-07). When Chan says go: (1) export the data that cannot be collected again from its database (the lineage edges and the trending snapshots) and archive it; (2) move the published and unpublished observatory reports to chanmeng.org/blog; (3) stop sign-in, sync, the scheduled jobs, the MCP endpoint and the database; (4) leave a static page on the domain that says the project is archived and keeps `/legal/data-sources` alive, because the Suno probe's User-Agent contact URL points there; (5) repoint the README-cards links that lead to Seismophone; (6) set the shard to `status: archived` + `recency: deprecated`, archive the repo and its growth repo, update lineage. The probe and the README cards keep running | when Chan gives the word |
