---
name: x-sync
description: >-
  Use to sync or refresh Chan's X (Twitter) posts (@chanmeng666) or before
  answering how her X posts did when the register is older than her latest post.
  The procedure lives in the private repo chanmeng-social-ledger; this stub only
  says where. Not for writing, posting or deleting posts.
metadata:
  internal: true
---

# X sync (moved)

Since 2026-11-16 the X capture, the tags and the publish of `x/posts.yaml` and
`x/account.yaml` are done in the **private repo `chanmeng-social-ledger`**
(laptop: `D:\github_repository\chanmeng-social-ledger`), skill
`.claude/skills/x-sync/SKILL.md` there. Open that checkout and follow it.

What stays true here:

- `x/posts.yaml` and `x/account.yaml` are **generated**: never edit them in this
  repo. `npm run check:export` fails on a hand edit.
- The gated publish (`node scripts/publish-export.mjs --target <this checkout>`,
  run in the ledger repo) is the only thing that writes them, and it pushes here
  only after the canary test, the allowlist, the real-data privacy scan and the
  checker all pass.
- Read the register (`x/README.md` § The account register) before answering
  anything about her X posts.
