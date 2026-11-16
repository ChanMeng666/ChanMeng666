---
name: linkedin-sync
description: >-
  Use to sync or refresh Chan's LinkedIn posts (her profile or the ArchCanvas
  company page) or before answering how her posts did when the register is older
  than her latest post. The procedure lives in the private repo
  chanmeng-social-ledger; this stub only says where. Not for writing posts or
  the profile copy (that is career-copy).
metadata:
  internal: true
---

# LinkedIn sync (moved)

**Paused until 2026-12-01, then at most weekly** (LinkedIn account warning, 2026-11-17): read `docs/LINKEDIN-LIMITS.md` in `chanmeng-social-ledger` before running anything.

Since 2026-11-16 the LinkedIn captures (profile and ArchCanvas page), the tags and
the publish of the `linkedin/` registers are done in the **private repo
`chanmeng-social-ledger`** (laptop: `D:\github_repository\chanmeng-social-ledger`),
skill `.claude/skills/linkedin-sync/SKILL.md` there. Open that checkout and follow
it.

What stays true here:

- `linkedin/account.yaml`, `linkedin/posts.yaml`, `linkedin/posts/<year>.yaml` and
  the company page's files are **generated**: never edit them in this repo.
  `npm run check:export` fails on a hand edit.
- Impressions never enter this repo, and the registers never carry the opening
  line of someone else's post.
- The gated publish (`node scripts/publish-export.mjs --target <this checkout>`,
  run in the ledger repo) is the only thing that writes them.
- Read the register (`linkedin/README.md` § The account register) before answering
  anything about her LinkedIn posts. The profile copy is `career-copy`'s job.
