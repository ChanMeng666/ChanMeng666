# `x/` — X (Twitter) personal-brand package

Everything for Chan Meng's X presence (**[@chanmeng666](https://x.com/chanmeng666)**) in one place:
the **profile copy**, a **pinned-tweet kit**, the **build-in-public strategy**, an **execution
runbook**, and the **header asset**. All outward copy is English. Facts trace back to
[`../data/profile/`](../data/profile/) — the repository-wide source of truth.

## What's here

| File / folder | Kind | Purpose |
|---|---|---|
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
   - Visuals only from Chan's own tools / Caldera brand (`#E2E2DF` / `#070607` / `#FC5000`) —
     no shields.io, trophies, or third-party chrome.
3. **Character limits are verified by command**, not by eye. `x-profile.md` (display name ≤50,
   bio ≤160) and `x-pinned-tweet.md` (≤280/tweet, every URL = 23 chars) each carry a Node
   `node -e` verification block; re-run it after any copy edit and confirm every row reads `OK`.

## Build-surface impact: none

This folder is **not wired into `npm run build`, `npm run validate`, or the asset audit** — editing
anything here has zero effect on README.md / llms.txt / dist. The only automation is
`scripts/export-x-header.mjs`, which is **run manually**. Nothing here regenerates on `npm run check`.

## Future upgrade path (documented, not built)

When X operations stabilize, promote the curated copy into the LinkedIn-style pipeline: a
`data/profile/75-x.yaml` shard (merged by the loader like every other shard), `build-x-*.mjs`
generators that emit these `.md` files, and a `check-x-sync.mjs` gate wired into `npm run validate`
— mirroring how [`70-linkedin.yaml`](../data/profile/70-linkedin.yaml) pairs with
[`../linkedin/`](../linkedin/). Until then these hand-curated files **are** the shard: version-
controlled and reviewed monthly (see `x-strategy.md` §8).
