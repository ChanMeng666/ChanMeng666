# `x/` — X (Twitter): account register and brand package

Everything for Chan Meng's X presence (**[@chanmeng666](https://x.com/chanmeng666)**) in one place:
the **register of the live account and every post**, the **profile copy**, a **pinned-tweet kit**,
the **build-in-public strategy**, an **execution runbook**, and the **header asset**. All outward copy is English. Facts trace back to
[`../data/profile/`](../data/profile/) — the repository-wide source of truth.

## The account register

To understand the account, read two files, in this order:

1. [`account.yaml`](./account.yaml): what the profile shows (name, bio, links, pinned post,
   counts), how the account has been run so far, and `openItems`, the places where something
   live on X disagrees with a decision made since.
2. [`posts.yaml`](./posts.yaml): every post, newest thread first. Its `summary` block is the
   short read (volume by month and by project, engagement, the most-viewed posts, flagged
   threads). Below it each thread carries its posts in full: text, links, media, public counts.

Rules:

- **`posts.yaml` is generated.** `npm run build:x` rebuilds it from
  [`capture/latest.json`](./capture/latest.json). Never hand-edit what X reports. The curated
  keys on a thread (`topic`, `projectIds`, `showcaseId`, `pillar`, `summary`, `flags`, `note`)
  are edited in `posts.yaml` itself and survive a rebuild. `projectIds` and `showcaseId` must
  exist in `data/profile/`, or the build fails.
- **`account.yaml` is hand-maintained and checked.** The build fails when its name, bio,
  location, website, pinned post or counts disagree with the capture.
- **Counts are historical maximums**, as everywhere in this repo: a rebuild never lowers a
  post's views or likes, and `followers` is never lowered by hand.
- **`pillar` is P1–P4 (`x-strategy.md` §2) or `none`.** Chan delegated the tagging on
  2026-10-07, so the tags are Claude's and she may overrule any of them. Tag new threads the
  same way; the build lists a thread that has none.
- **`flags` and `openItems` are observations, not instructions.** Editing or deleting a post,
  re-pinning and changing the profile are Chan's decisions. Ask before doing any of them.
- **Public data only.** This repo is public. No DMs, drafts, analytics exports or the following
  list in this folder, tracked or not.
- **`npm run check:x`** (part of `npm run check`) fails when `posts.yaml` is stale against the
  capture or `account.yaml` disagrees with it. It reads files only and never contacts X.

### Refreshing the register

Use the **`x-sync` skill** ([`.claude/skills/x-sync/`](../.claude/skills/x-sync/SKILL.md)): ask
Claude Code to "sync my X posts". It is the whole procedure, with what went wrong before. In
short:

1. Open `https://x.com/chanmeng666` in a new tab of Chan's signed-in Chrome and run
   [`capture/snippet.js`](./capture/snippet.js). It scrolls the Replies and Posts tabs, reads the
   posts from the web client's own memory, and reports `complete: true` when it holds as many
   posts as the profile counts. It changes nothing on X and sends nothing anywhere. There is no
   API key in this repo and none is needed.
2. `await window.__xCopy()` puts the capture on the clipboard, and
   `pwsh .claude/skills/x-sync/scripts/save-capture.ps1` writes it to `capture/latest.json`
   (it refuses anything that is not a complete capture of this account).
3. `npm run build:x -- --apply-account` rebuilds `posts.yaml` and copies the capture date and
   the plain counts into `account.yaml`. A changed name, bio, website or pinned post stops the
   build with a `DRIFT:` line, to be read and corrected by hand.
4. Tag the threads the build lists as `untagged`, then `npm run build:x -- --changes` prints
   what differs from the committed register: new posts, deleted posts, views gained.
5. Commit `capture/latest.json`, `posts.yaml` and `account.yaml` together.

A post that has gone from X stays in the register, marked `deletedSeen`, and leaves the summary
and the thread's totals. A thread stays one thread after its first post is deleted. A capture
with fewer posts than the profile's own count is refused instead of being read as deletions.

Sync after a posting session and before each monthly review (`x-strategy.md` §8). X shows
profile visits and link taps only to Premium accounts, so the register holds the public counts:
views, likes, replies, reposts, quotes, bookmarks.

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

## What's here

| File / folder | Kind | Purpose |
|---|---|---|
| [`account.yaml`](./account.yaml) | hand-maintained, checked | The live profile, its history and the open items. |
| [`posts.yaml`](./posts.yaml) | **GENERATED** + curated keys | Every post, grouped into threads, with a summary block. |
| [`capture/latest.json`](./capture/latest.json) | captured | What X showed at the last capture; the input to `npm run build:x`. |
| [`capture/snippet.js`](./capture/snippet.js) | tooling | The read-only in-page capture. |
| [`../scripts/build-x-register.mjs`](../scripts/build-x-register.mjs) | tooling | Builds and checks `posts.yaml`. |
| [`x-profile.md`](./x-profile.md) | hand-curated | Profile-field copy: display name, bio (+ alternates), location, website, category. Holds the **Previous-live-state** rollback table filled during execution. |
| [`x-pinned-tweet.md`](./x-pinned-tweet.md) | hand-curated | Copy-paste-ready 3-tweet pinned intro thread + reusable tweet templates. |
| [`x-strategy.md`](./x-strategy.md) | hand-curated | Build-in-public operating playbook: positioning, four archetypes, content pillars, cadence, launch playbooks, metrics. A doc you *run from*; monthly reviews append to its log. |
| [`x-runbook.md`](./x-runbook.md) | hand-curated | Step-by-step operator script for the live profile update via `claude-in-chrome` (single-Save atomicity, gate screenshots). |
| [`header/header.html`](./header/header.html) | hand-curated | Caldera-branded header source (1500×500 / 3:1). |
| `header/x-header.png` | **RENDERED** | The 3000×1000 (2×) header image uploaded to X. **Never hand-edit.** Edit `header.html`, then re-render (below). |
| [`screenshots/`](./screenshots/) | captures | Live-profile confirmation / gate screenshots produced during a runbook execution. |

## Rendering the header

`header/x-header.png` is generated — edit the HTML, never the PNG:

```
node scripts/export-x-header.mjs
```

The script screenshots the `[data-out]` element in `header.html` at 2× (Playwright, on-disk
Chromium) and writes `x/header/x-header.png`. Fonts (Anton + DM Sans) load from Google Fonts at
render time.

## Editing rules

1. **Facts first.** Every fact traces to `../data/profile/*.yaml`. The X URL itself lives in
   [`00-basics.yaml`](../data/profile/00-basics.yaml) `basics.profiles` (`network: X`). If a
   number or role changes, fix the shard, then reflect it here.
2. **Copy rules** (apply to every surface — profile, thread, templates, launch copy):
   - English only.
   - No pricing / cost framings.
   - Never lead with commit counts or solo-% (they're deep-thread support at most).
   - Human-stakes lead, outcome before stack; gloss jargon only when load-bearing.
   - **ArchCanvas → link `archcanvas.uk` only** — the repo is private; never link or imply a
     public source. Tam-AI-Ti and GAVIGO IRE are also private: link the live product, never the repo.
   - Every image and video is posted with alt text. X cannot add it afterwards;
     `npm run build:x` lists any post from 2026-10-08 on that has media without it.
   - Visuals only from Chan's own tools / Caldera brand (`#E2E2DF` / `#070607` / `#FC5000`) —
     no shields.io, trophies, or third-party chrome.
3. **Character limits are verified by command**, not by eye. `x-profile.md` (display name ≤50,
   bio ≤160) and `x-pinned-tweet.md` (≤280/tweet, every URL = 23 chars) each carry a Node
   `node -e` verification block; re-run it after any copy edit and confirm every row reads `OK`.

## Build-surface impact: none

This folder is **not wired into `npm run build`, `npm run validate`, or the asset audit** — editing
anything here has zero effect on README.md / llms.txt / dist. `npm run check` runs `check:x`, which
only compares the register with its capture. `scripts/export-x-header.mjs` and `npm run build:x`
are **run manually**.

## Future upgrade path (documented, not built)

When X operations stabilize, promote the curated copy into the LinkedIn-style pipeline: a
`data/profile/75-x.yaml` shard (merged by the loader like every other shard), `build-x-*.mjs`
generators that emit these `.md` files, and a `check-x-sync.mjs` gate wired into `npm run validate`
— mirroring how [`70-linkedin.yaml`](../data/profile/70-linkedin.yaml) pairs with
[`../linkedin/`](../linkedin/). Until then these hand-curated files **are** the shard: version-
controlled and reviewed monthly (see `x-strategy.md` §8).
