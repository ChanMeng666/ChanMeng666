---
name: x-sync
description: >-
  Use to sync or refresh Chan's X (Twitter) posts (@chanmeng666) into the x/
  register from her signed-in Chrome, or before answering how her X posts did
  when the register is older than her latest post. Not for writing, posting or
  deleting posts, nor for the profile copy or strategy.
---

# X sync

`x/capture/latest.json` (written only by this procedure) → `npm run build:x` →
`x/posts.yaml` (generated; the curated keys on a thread are hand-edited there
and survive rebuilds). `x/account.yaml` is hand-kept and checked against the
capture. Rules for the files: `x/README.md` § "The account register".

## Rules

- **Read only.** Posting, pinning and profile edits are separate tasks, and she
  sees the exact text first. **Never delete a post for her**, even on a yes:
  name the post and she deletes it.
- **Public data only.** Nothing from DMs, drafts, analytics, bookmarks or the
  following list enters `x/`.
- **One capture per sync.** If a run fails, find out why before running again.
- Never type a post or a metric into a file. If the capture breaks, fix
  `x/capture/snippet.js`.
- `flags` and `openItems` are observations; acting on one is her decision.

## Steps

1. Open `https://x.com/chanmeng666` in a **fresh** tab (an old tab can still
   hold a post she has deleted).
2. Pass `x/capture/snippet.js` to `javascript_tool`, from the line
   `window.__xStart = () => {` to the end. It returns `"started"` and scrolls
   both tabs in the background. Poll with
   `await new Promise((r) => setTimeout(r, 20000)); window.__xStatus` until
   `complete: true`. `{ error }`: stop and read it. `complete: false`: reload
   and run once more.
3. The tool cuts returned strings at about 1,000 characters, so the data comes
   back through the clipboard. The page needs focus: click the blank strip at
   the far left below the navigation (**never the right-hand column**, where
   everything is a link). Then
   `await Promise.race([window.__xCopy(), new Promise((r) => setTimeout(() => r("timeout: click the page first"), 8000))])`
   and `pwsh .claude/skills/x-sync/scripts/save-capture.ps1`. Tell Chan her
   clipboard was used.
4. Close the tab. `npm run build:x -- --apply-account` (copies date and counts;
   followers only ever rises). A `DRIFT:` line means the name, bio, location,
   website or pinned post changed: correct `account.yaml` by hand, tell her,
   and note a bio change in `x-profile.md` too.
5. Tag each thread the build lists as `untagged`, under its `posted:` line:
   `topic` (one of the ten in `x/README.md`), `projectIds` / `showcaseId` only
   when the thread is about that project, `pillar` (`P1`–`P4` from
   `x-strategy.md` §2, or `none`), `summary` (one plain sentence: what it is,
   not how good), `flags` only when a live post disagrees with a rule or fact
   decided since. Tagging is delegated to you (2026-10-07) and hers to
   overrule. Then `npm run build:x -- --changes` and `npm run check:x`.
6. Report, with numbers: new threads and how each did; deleted or changed
   posts; older posts that gained views; pinned post and follower change; any
   `no alt text:` line; new `flags`. Views here are in the tens, so a
   difference of a few is not a finding; say when a post is too new to judge.
7. Commit `x/capture/latest.json`, `x/posts.yaml` and `x/account.yaml`
   together. Push only if she asks.

The account is not Premium: no profile visits, link clicks or per-post
analytics. `replies` includes her own thread continuations;
`summary.engagement.repliesFromOthers` is the rest.

## What went wrong before

| Symptom | Cause and action |
|---|---|
| Fewer posts than the profile counts | Long threads are folded on the Replies tab and the newest posts can be missing from it: the snippet must scroll both tabs |
| `complete: false` twice | X stopped loading (rate limit, or a hidden post still counted). Wait ten minutes, try once; then compare ids with `x/posts.yaml` and say which is missing instead of saving |
| A value shows as `[BLOCKED: …]` | The browser tool's display hides token-like strings; the clipboard copy is unaffected |
| `__xCopy` never returns | The page lost focus: click it, call again |
| `X client store not found` | X changed its client state: find the store again from the React root in `snippet.js`. Do not fall back to the rendered page (truncated text, no counts) |
| `signed in as X, not @chanmeng666` | Ask her to switch accounts; never sign in yourself |
| "Leave site?" dialog | Something sits in a composer; a sync types nothing. Tell her; do not force navigation |
| `posts.yaml is stale` right after a build | Curated keys were in a different order: build once more |
| Fewer posts, capture `complete` | She deleted posts: they stay in the register as `deletedSeen` |
| A thread's later post appears as a separate `reply` | She deleted the thread's first post. The build keeps known conversations together; reread that thread's `summary` and `flags` |
| A Bash heredoc turned `\\` into `\` | Write scripts with the Write tool |
