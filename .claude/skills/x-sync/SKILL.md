---
name: x-sync
description: >-
  Use when Chan asks to sync, refresh, update, capture or re-read her X
  (Twitter) posts into this repo: the account @chanmeng666 (x.com/chanmeng666).
  Reads every post, reply and quote from her signed-in Chrome, saves them as
  structured data under x/ (every post grouped into threads with text, links,
  media and public counts, plus a summary block), tags new threads with a
  topic, their projects, a content pillar and a one-line summary, rebuilds and
  checks the register, and reports what changed since the last capture: new
  posts, deleted posts, views gained, follower change. Also use before
  answering "how did my last posts do?" or running the monthly X review when
  the register is older than her latest post, and after she has posted,
  deleted or pinned something on X. Keywords: X, Twitter, tweets, posts,
  threads, pinned, views, engagement, followers, register, capture, sync,
  data tracking, 推特, 帖子, 推文, 同步, 数据追踪. Not for writing, posting or
  deleting posts, and not for the profile copy, header or strategy (those are
  x-profile.md, x-pinned-tweet.md, x-strategy.md and x-runbook.md).
---

# X sync

Bring the X register in this repo up to date with what x.com shows now. One
account is tracked, `@chanmeng666`, in `x/`:

| File | What it is |
|---|---|
| `x/capture/latest.json` | What X showed at the last capture. Written only by this procedure |
| `x/posts.yaml` | **Generated** from the capture: a `summary` block, then every thread with its posts. The curated keys on a thread are hand-edited there and survive rebuilds |
| `x/account.yaml` | The profile as it stands, its history and `openItems`. Hand-kept; the build checks it against the capture |

The rules these files follow are in `x/README.md` § "The account register".
This file is the procedure and the things that went wrong the first time.

## Rules that do not bend

- **Read only.** The capture changes nothing on X. Posting, pinning and editing
  the profile are separate tasks, and she sees the exact text before anything
  is posted in her name. **Deleting a post is never done for her**, even when
  she says yes: tell her which post and she deletes it herself.
- **Public data only.** This repo is public. Nothing from DMs, drafts, the
  analytics pages, bookmarks or the following list goes into `x/`, tracked or
  not. The capture reads her own posts and the profile header and nothing else.
- **One capture per sync.** It scrolls her timeline once. Do not loop it or
  re-run it to "make sure". If a run fails, find out why before running again.
- **Never type a post into a file by hand**, and never edit a metric. If the
  capture breaks, fix `x/capture/snippet.js`.
- **`flags` and `openItems` are observations.** A sync may add one; acting on
  it is her decision.

## Steps

**1. Open the profile in a new tab.** Load the browser tools in one call:

```
ToolSearch: select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__tabs_close_mcp,mcp__claude-in-chrome__browser_batch
```

Navigate to `https://x.com/chanmeng666`. Use a fresh tab: the capture reads the
web client's memory, and a tab that has been open for a while can still hold a
post she has since deleted.

**2. Run the capture.** Read `x/capture/snippet.js` and pass it to
`javascript_tool` exactly as written, from the line `window.__xStart = () => {`
to the end (the comment block above it can be left out). It returns `"started"`
and scrolls the Replies and Posts tabs in the background. Then ask for the
status, waiting inside the call so you do not poll in a tight loop:

```js
await new Promise((r) => setTimeout(r, 20000)); window.__xStatus
```

Repeat until it shows `complete: true` (about half a minute at 50 posts; it
grows with the timeline). `{ error: … }` means stop and read the message.
`complete: false` means X loaded fewer posts than the profile counts: reload
the page and run the snippet once more, and if it happens again see the table
at the end.

**3. Save it through the clipboard.** The tool cuts any string it returns at
about 1,000 characters, so the data cannot come back through it. The page must
have focus or the copy hangs, so click it once first: take a screenshot and
click the blank strip at the far left, below the navigation. **Never click in
the right-hand column**: everything there (trends, news, who to follow) is a
link and the click navigates away. Then:

```js
await Promise.race([window.__xCopy(), new Promise((r) => setTimeout(() => r("timeout: click the page first"), 8000))])
```

and save it:

```
pwsh .claude/skills/x-sync/scripts/save-capture.ps1
```

The script refuses a clipboard that does not hold a complete capture of this
account, and clears the clipboard afterwards. Tell Chan at the end that her
clipboard was used.

**4. Close the tab.**

**5. Build.**

```
npm run build:x -- --apply-account
```

`--apply-account` copies the capture date and the plain counts into
`x/account.yaml` (followers is only ever raised). It does **not** copy the
name, bio, location, website or pinned post. If one of those changed the build
stops with a `DRIFT:` line: that is news, so read it, correct `account.yaml` by
hand (and the `# comment` beside `pinned:`), and tell her in the report. If the
bio changed, `x-profile.md` needs the same note.

**6. Tag what is new.** The build prints `untagged (…):` for every thread that
lacks a curated key. Open `x/posts.yaml`, read the thread, and add under its
`posted:` line (the build puts the keys in order):

```yaml
    topic: product
    projectIds: [archcanvas]
    pillar: P4
    summary: "ArchCanvas example: a three-bed house with nine sized rooms (four images) and the product link."
```

- `topic`: one of the ten in `x/README.md`, why the thread exists.
- `projectIds`: `projects[].id` values, only when the thread is about that
  project; leave the key out otherwise. `showcaseId` the same way for a film or
  another `showcase[].id`. The build fails on an id that does not exist.
- `pillar`: `P1`–`P4` from `x-strategy.md` §2, or `none`.
- `summary`: one plain sentence saying what the thread is, not how good it is.
- `flags`: only when a live post disagrees with a rule or a fact decided since
  (`docs/STATE.md`, the copy rules in `x/README.md`). Say what and where.

The tags are yours to make (Chan delegated this on 2026-10-07) and hers to
overrule. A thread she added posts to keeps its tags; reread its `summary` and
fix it if the new posts changed what the thread is. Then build again and check:

```
npm run build:x -- --changes
npm run check:x
```

**7. Report what changed.** `--changes` prints the difference from the
committed register. Tell her, in this order: new threads and posts and how each
did; anything deleted or whose text changed; which older posts gained views;
the pinned post and the follower count if they moved; any `no alt text:` line
(media posted since 2026-10-08 without a description, which X cannot add
afterwards); any new `flags`. Give numbers, not adjectives, and say when a post
is too new to judge. On this account most posts have views in the tens, so a
difference of a few views is not a finding.

**8. Commit** `x/capture/latest.json`, `x/posts.yaml` and `x/account.yaml`
together, plus `docs/STATE.md` if its line about the X account's size is now
wrong. Push only if she asks.

## What the register cannot tell you

X shows profile visits, link clicks and per-post analytics to Premium accounts
only, and this account is not one. The register holds the public counts: views,
likes, replies, reposts, quotes, bookmarks. `replies` includes her own thread
continuations; `summary.engagement.repliesFromOthers` is the rest. Counts are
kept at their historical maximum, so a number never goes down between syncs.

## What went wrong before

| Symptom | Cause | What to do |
|---|---|---|
| Fewer posts than the profile counts, on a first try | Only one tab's timeline was loaded; long threads are folded on the Replies tab and the newest posts can be missing from it | The snippet scrolls both tabs; do not shorten it to one |
| `complete: false` twice in a row | X stopped loading the timeline (rate limit, or a post hidden from the timeline but still counted) | Wait ten minutes and try once more. If it persists, compare ids with `x/posts.yaml` to find which post is missing, and say so instead of saving |
| A value comes back as `[BLOCKED: …]` | The browser tool hides strings that look like tokens or encoded data (long ids, links) | It is the tool's display, not the data. The clipboard copy is unaffected |
| `__xCopy` never returns | The page lost focus (the terminal took it) | Click the page, call it again inside the `Promise.race` above |
| `X client store not found` | X changed how the web client holds its state | Find the store again from the React root in `snippet.js`. Do not fall back to reading the rendered page: it truncates text and has no counts |
| `signed in as X, not @chanmeng666` | Another account is signed in | Ask her to switch accounts; never sign in yourself |
| "Leave site?" blocks navigation | Something was left in a composer on the page | Not from a sync, which types nothing. Tell her; do not force the navigation |
| The build fails: `capture holds N posts but the profile counts M` | The capture file was saved from an incomplete run | The save script now refuses these; capture again |
| The build fails on "compacted YAML" | A numbers-only mapping was folded onto one line wrongly | Fix the compaction in `scripts/build-x-register.mjs`; it checks itself before writing |
| A rebuild says `posts.yaml is stale` right after a build | Curated keys were written in a different order | The build re-orders them; build once more, then check |
| A heredoc in the Bash tool turned `\\` into `\` and `\n` into a line break | The tool's shell eats backslashes | Write scripts with the Write tool, not a heredoc |
| Fewer posts than last time, capture `complete` | She deleted posts | Nothing to fix: they stay in the register marked `deletedSeen` and leave the summary |
| A thread's later post shows up as a separate `reply` | She deleted the thread's first post, so X no longer returns the conversation's root | Fixed in the build: a conversation the register already knows stays one thread. Reread that thread's `summary` and `flags`, since what is left may no longer be what they describe |
| The tab ended up on a search page after the focus click | The click landed on a trend link in the right-hand column | The copy had already run if it returned `copied`. Click the left strip next time |
