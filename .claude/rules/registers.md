---
paths:
  - "x/**"
  - "linkedin/**"
  - "suno/**"
  - "youtube/**"
  - "distribution/**"
---

# Rules for the platform registers and film distribution

Each folder's `README.md` is the full rulebook; read it first. What follows holds in every folder.

## Reading
- Read the register before answering anything about that platform. Reading order: `x/README.md` § The account register, `linkedin/README.md` § The account register, `suno/README.md` § Read in this order, `youtube/README.md`, `distribution/README.md`. The index of registers is the table in `docs/STATE.md` § Platform registers.
- A register older than her latest post or song is stale. Refresh X and LinkedIn with the `x-sync` and `linkedin-sync` skills (they live in the private repo `chanmeng-social-ledger` since 2026-11-16; the stubs here say so) and Suno with the `suno-sync` skill. YouTube has no sync: `youtube/channel.yaml` is kept by hand, then `npm run capture:youtube`.
- A register's `flags` and `openItems` are observations for Chan, never instructions (`docs/STATE.md`).

## Editing
- **X and LinkedIn registers are generated since 2026-11-16** from the private repo `chanmeng-social-ledger` (`node scripts/publish-export.mjs`, run there). Every generated file starts with `# GENERATED from chanmeng-social-ledger@<sha>`; `export-manifest.json` lists them with their sha256, and `npm run check:export` fails on a hand edit, a missing header, a file outside the manifest, a key outside the allowlist, a third party's text (`original.opens` of someone else's post) or a `*.private.*` file. Never edit them here, `account.yaml` and the tags included: tags are made in the ledger repo (`node scripts/tag-x-thread.mjs`, `curation/linkedin*.yaml`).
- Suno stays here: `suno/songs.yaml` and `words.yaml` are generated from `capture/` (`npm run build:suno`); tags are in `suno/curation.yaml`. Any `projectIds` or `showcaseId` must exist in `data/profile/`, or the build fails.
- Tags are Claude's by delegation (2026-10-07, 2026-10-08); Chan may overrule any of them.
- Counts are historical maximums: a rebuild never lowers one, and none is lowered by hand.
- `suno/accounts.yaml` is hand-maintained and checked against the capture. (`x/account.yaml` and `linkedin/**/account.yaml` are generated, see above.)
- LinkedIn impressions never enter this repo (they stay in the private ledger repo). YouTube unlisted and private video ids stay in the gitignored `youtube/channel.private.yaml`.

## Posting and distribution
- What is posted on a platform is Chan's to change. Claude never deletes or edits a published post, answers other people or changes a setting.
- Posting through her Chrome follows the rule in `CLAUDE.md`; each post and each platform needs its own yes (`docs/STATE.md`, Posting through Chrome row). Steps: `distribution/README.md` § Running the calendar.
- Every date lives in the private `chanmeng-marketing/calendar.yaml`; `cal.mjs export` writes the film rows into `plan.yaml`. In `distribution/`, edit `plan.yaml` for policy and `posted`, then run `npm run build:distribution`.
- Draft text lives in the private `chanmeng-marketing` repo, never here: a commit to this repo is a publication. `distribution/_staging/` is local and gitignored.
