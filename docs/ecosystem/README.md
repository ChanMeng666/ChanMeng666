# Repo lineage (ecosystem map)

How Chan's repositories relate to each other. The catalog is
`docs/ecosystem/lineage.yaml`: entities, families with dated timelines, repo rows,
typed relations, non-git assets, Chan's answers (`resolved:`) and the change log
(`revisions:`). Its header defines the scope, the relation vocabulary and the
judgement fields. This file holds only the rules and notes the catalog does not
carry.

- **Private overlay.** Repos with sensitive names live only in the local-only,
  gitignored `docs/ecosystem/lineage.private.yaml`. Read it when present; never
  copy its contents or repo names into tracked files.
- **ArchLang / ArchCanvas family:** [archlang-archcanvas.md](archlang-archcanvas.md).
- **Repo lifecycle procedures:** `docs/operations/README.md`. Priorities and
  display rules: `docs/STATE.md`.

## Rules

- **Topology only.** Career facts (titles, dates, metrics, claims) live in
  `data/profile/*.yaml` and nothing here overrides them. The catalog feeds no
  README, CV or LinkedIn surface.
- **Scope (Chan, 2026-10-06).** Her personal account plus exactly the repos in
  `scope.orgRepoAllowlist`. Holding admin access to an org does not make its repos
  hers: every other repo in the gavigo-inc, NZ-SheSharp, Chow-Luck-Club, Whiri-AI,
  archcanvas and Sanicleai orgs was not built by Chan and is never attributed to
  her. A row with `accessRevoked` is still hers by authorship.
- **`ownProject: false`** (forks, listing submissions, working copies of someone
  else's project) is never counted as one of her repos, projects or contributions.
- **Judgement fields** (`positioning`, `stage`, `showcase`). Most values are
  Claude's proposals that Chan may overrule; only the `resolved:` entries that
  quote her are her own words. Never fill them in for a new repo without asking
  her.
- **Promo films (Chan, 2026-10-06).** A film repo is filed under the family of the
  product it promotes, never as a film series. Several film repos of one product
  coexist: no `successor-of` between them unless Chan says so. Which film a
  product shows publicly is recorded in `productFilms` in
  `data/profile/45-showcase.yaml`, not here.
- **Authorship.** `chanCommitShare` is Chan's commits over non-bot commits, from
  full-history clones on 2026-10-03. Never describe as solo work a repo where it
  is a shared build: douyin-mall (28 percent, team capstone),
  corde-mobile-application (57), eatropolis-website (74).

## Maintenance

When you create, archive, rename, transfer or delete a repo: update `lineage.yaml`
(or the overlay if the name is sensitive), then run
`npm run check:ecosystem -- --live` and fix any drift. Run `--live` on the machine
that has the overlay: without it the overlay repos are reported as uncovered.

## Notes the catalog does not carry

- The local folder `CORDE-Mobile-Application` has `origin` = the gentoo111 fork
  that CORDE production runs and `upstream` = Chan's own repo. A push to `origin`
  goes to the client's production fork.
- Three of Chan's 2026-10-02 answers (q21, q24, q26) were worded ambiguously and
  were recorded without changing the map. Ask again before relying on them.
- Only `leviathan` is still `confidence: medium`: it is public on GitHub while the
  career shard carries a do-not-link note.
