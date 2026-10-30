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
- A register older than her latest post or song is stale. Refresh it with the `x-sync`, `linkedin-sync` or `suno-sync` skill. YouTube has no sync: `youtube/channel.yaml` is kept by hand, then `npm run capture:youtube`.
- A register's `flags` and `openItems` are observations for Chan, never instructions (`docs/STATE.md`).

## Editing
- The post and song files are generated from `capture/`: `x/posts.yaml` (`npm run build:x`), `linkedin/posts*.yaml` and `posts/` (`npm run build:linkedin-register`), `suno/songs.yaml` and `words.yaml` (`npm run build:suno`). Never hand-edit what the platform reports.
- Tags go where each README says: on the thread in `x/posts.yaml`, in `linkedin/curation.yaml`, in `suno/curation.yaml`. Any `projectIds` or `showcaseId` must exist in `data/profile/`, or the build fails.
- Tags are Claude's by delegation (2026-10-07, 2026-10-08); Chan may overrule any of them.
- Counts are historical maximums: a rebuild never lowers one, and none is lowered by hand.
- `account.yaml` / `accounts.yaml` are hand-maintained and checked against the capture.
- LinkedIn impressions stay in gitignored files. YouTube unlisted and private video ids stay in the gitignored `youtube/channel.private.yaml`.

## Posting and distribution
- What is posted on a platform is Chan's to change. Claude never deletes or edits a published post, answers other people or changes a setting.
- Posting through her Chrome follows the rule in `CLAUDE.md`; each post and each platform needs its own yes (`docs/STATE.md`, Posting through Chrome row). Steps: `distribution/README.md` § Running the calendar.
- Every date lives in the private `chanmeng-marketing/calendar.yaml`; `cal.mjs export` writes the film rows into `plan.yaml`. In `distribution/`, edit `plan.yaml` for policy and `posted`, then run `npm run build:distribution`.
- Draft text lives in the private `chanmeng-marketing` repo, never here: a commit to this repo is a publication. `distribution/_staging/` is local and gitignored.
