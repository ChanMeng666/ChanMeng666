# `x/` — X (Twitter): account register and brand package

[@chanmeng666](https://x.com/chanmeng666). Besides the register: `x-profile.md` (profile-field
copy and the previous-live-state rollback table), `x-pinned-tweet.md` (the pinned thread and
tweet templates), `x-strategy.md` (the operating playbook; monthly reviews append to its log),
`header/header.html` (source of the rendered `header/x-header.png`) and `screenshots/`
(confirmation screenshots of the live profile).

## The account register

Read `account.yaml` first (what the profile shows, how the account has been run, and
`openItems`: where something live on X disagrees with a decision made since), then
`posts.yaml` (the `summary` block, then every thread in full, newest first).

To bring it up to date, use the **`x-sync` skill**
([`.claude/skills/x-sync/`](../.claude/skills/x-sync/SKILL.md)): it is the whole procedure.
Sync after a posting session and before each monthly review (`x-strategy.md` §8).

Rules:

- **`posts.yaml` is generated** by `npm run build:x` from `capture/latest.json`. Never
  hand-edit what X reports. The curated keys on a thread (`topic`, `projectIds`, `showcaseId`,
  `pillar`, `summary`, `flags`, `note`) are edited in `posts.yaml` itself and survive a
  rebuild. `projectIds` and `showcaseId` must exist in `data/profile/`, or the build fails.
- **`account.yaml` is hand-maintained and checked.** The build fails when its name, bio,
  location, website, pinned post or counts disagree with the capture.
- **Counts are historical maximums**: a rebuild never lowers a post's views or likes, and
  `followers` is never lowered by hand.
- **`pillar` is P1–P4 (`x-strategy.md` §2) or `none`.** Chan delegated the tagging on
  2026-10-07, so the tags are Claude's and she may overrule any of them. Tag new threads the
  same way; the build lists a thread that has none.
- **`flags` and `openItems` are observations, not instructions.** Editing or deleting a post,
  re-pinning and changing the profile are Chan's decisions. Ask before doing any of them.
- **Public data only.** This repo is public. No DMs, drafts, analytics exports or the following
  list in this folder, tracked or not.
- A post that has gone from X stays in the register, marked `deletedSeen`, and leaves the
  summary and the thread's totals. A thread stays one thread after its first post is deleted.
  A capture with fewer posts than the profile's own count is refused instead of being read as
  deletions.
- **What it cannot see:** X shows profile visits and link taps only to Premium accounts, so
  the register holds the public counts: views, likes, replies, reposts, quotes, bookmarks.

### Topics

`topic` says why a thread exists, one per thread; the build rejects any other value.

| Topic | Use it for |
|---|---|
| `intro` | Who Chan is and what the feed is for (the pinned thread) |
| `launch` | The first announcement of a product or a major release |
| `product` | What a product does, shown with an example or a status update |
| `product-film` | A post whose point is a promo film or a cut of one |
| `technical-deep-dive` | How something works, step by step |
| `investigation` | A finding from measuring someone else's system |
| `brand` | Chan's own brand pieces: the logo sting, the intro film |
| `community` | Replies and quotes in other people's conversations |
| `bug-report` | Telling a product's team that something is broken |
| `personal` | A note that serves no product or pillar |

## Editing rules

1. **Facts first.** Every fact traces to `data/profile/*.yaml`; the X URL itself is in
   `00-basics.yaml` `basics.profiles` (`network: X`). Fix the shard, then reflect it here.
2. **Copy rules** (every surface: profile, thread, templates, launch copy):
   - English only.
   - No pricing / cost framings.
   - Never lead with commit counts or solo-% (they're deep-thread support at most).
   - Human-stakes lead, outcome before stack; gloss jargon only when load-bearing.
   - **ArchCanvas → link `archcanvas.uk` only**: the repo is private; never link or imply a
     public source. Tam-AI-Ti and GAVIGO IRE are also private: link the live product, never
     the repo.
   - Every image and video is posted with alt text. X cannot add it afterwards;
     `npm run build:x` lists any post from 2026-10-08 on that has media without it.
   - Visuals only from Chan's own tools / the Caldera brand.
3. **Character limits are verified by command**, not by eye. `x-profile.md` (display name ≤50,
   bio ≤160) and `x-pinned-tweet.md` (≤280/tweet, every URL = 23 chars) each carry a
   `node -e` verification block; re-run it after any copy edit and confirm every row reads
   `OK`.
4. **The header PNG is rendered.** Edit `header/header.html`, then
   `node scripts/export-x-header.mjs` (run by hand; needs network for the fonts).
