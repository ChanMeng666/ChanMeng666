---
name: linkedin-sync
description: >-
  Use when Chan asks to sync, refresh, update, capture or re-read her LinkedIn
  posts into this repo: her own profile (linkedin.com/in/chanmeng666), the
  ArchCanvas company page, or both. Reads every post from her signed-in Chrome,
  saves it as structured data under linkedin/ (a summary, a one-line index and
  full text by year, with reactions, comments and reposts; impressions for her
  own posts in a gitignored file), tags new posts with a topic and their
  projects, rebuilds and checks the registers, and reports what changed since
  the last capture. Also use before answering "how did my last posts do?" when
  the register is older than her latest post, after she has posted, edited or
  deleted something on LinkedIn, or to add a new company page to tracking.
  Keywords: LinkedIn, posts, company page, ArchCanvas page, engagement,
  impressions, reactions, followers, register, capture, sync, 领英, 帖子, 同步,
  公司主页, 数据追踪. Not for writing or editing posts, and not for the profile
  copy (headline, About, Experience): that is the career-copy skill.
---

# LinkedIn sync

Bring the LinkedIn registers in this repo up to date with what LinkedIn shows
now. Two pages are tracked, each in its own folder with the same files:

| Page | Folder | Open this address |
|---|---|---|
| Her profile | `linkedin/` | `https://www.linkedin.com/in/chanmeng666/recent-activity/all/` |
| ArchCanvas company page | `linkedin/company/archcanvas/` | `https://www.linkedin.com/company/archcanvas/posts/?feedView=all&viewAsMember=true` |

Sync both unless she names one. What the files are and the rules they follow
are in `linkedin/README.md` § "The account register"; read it if anything below
is unclear. This file is the procedure and the things that went wrong the first
time.

## Rules that do not bend

- **Read only.** The capture changes nothing on LinkedIn. Editing or deleting a
  post, or posting, is never part of a sync. If she asks for that, it is a
  separate task and she sees the exact text first.
- **Impressions stay local.** They are shown to the author only and this repo is
  public. They live in `linkedin/capture/latest.private.json` and
  `linkedin/posts.private.yaml`, both gitignored. Never put an impression count
  in a tracked file, a commit message or a PR. You may quote them to her in the
  conversation.
- **One capture per page per sync.** A profile capture is about seventeen
  requests at reading pace. Do not loop it, schedule it, or re-run it to "make
  sure". If a run fails, find out why before running again.
- **Never type a post into a file by hand.** If the capture breaks, fix
  `linkedin/capture/snippet.js`.

## Steps

Do steps 1 to 3 for one page, then again for the other, **in the same tab**: the
second page reuses the capture code the first one stored.

**1. Open the page.** Load the browser tools in one call:

```
ToolSearch: select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__tabs_close_mcp,mcp__claude-in-chrome__browser_batch
```

Navigate a new tab to the address in the table. The snippet reads which page it
is from the address, so the address must be one of those two shapes.

**2. Run the capture.** On the first page, read `linkedin/capture/snippet.js`
and pass it to `javascript_tool` exactly as written, from the line
`window.__liStart = () => {` to the end (the comment block above it can be left
out). It stores itself in the tab's sessionStorage, so on the second page you
only run:

```js
new Function("return " + sessionStorage.getItem("__liStart"))()
```

Either way it returns `"started"` and works in the background. Then ask for
the status, waiting inside the call so you do not poll in a tight loop:

```js
await new Promise((r) => setTimeout(r, 20000)); window.__liStatus
```

Repeat until it shows `complete: true`: about a minute for the profile, a few
seconds for a company page. `{ error: … }` means stop and read the message.

**3. Save it through the clipboard.** The tool cuts any string it returns at
about 1,000 characters, so the data cannot come back through it. Click an empty
part of the page (the page must have focus or the copy hangs), then:

```js
await Promise.race([window.__liCopy("public"), new Promise((r) => setTimeout(() => r("timeout: click the page first"), 8000))])
```

and save it:

```
pwsh .claude/skills/linkedin-sync/scripts/save-capture.ps1 -Register profile -Half public
```

For the profile, click the page **again** (running the script moved the focus
to the terminal), copy `"private"` the same way, and save with `-Half private`.
A company page has no private half. `-Register` is `profile` or the company's
name (`archcanvas`). The script refuses a clipboard that holds the wrong
capture and clears the clipboard after the last half. Tell Chan at the end that
her clipboard was used.

**4. Close the tab** once both pages are saved.

**5. Update the account records.** In each page's `account.yaml` set `asOf` to
the capture date, raise `counts.followers` if the capture shows more (never
lower it), and correct `headline` if it changed. Add a line to `history` only
when a new period has something to say.

**6. Build, then tag what is new.**

```
npm run build:linkedin-register
```

It prints `untagged:` for every post that has no line in that page's
`curation.yaml`. Read each of those posts in `posts/<year>.yaml` and add its
line at the top of `curation.yaml`:

```yaml
"7512477056845316096": { topic: launch, projectIds: [echook] }
```

`topic` is one of the ten in `linkedin/README.md` (why the post exists, one per
post). `projectIds` are `projects[].id` values, only when the post is about
that project; leave the key out otherwise. The tags are yours to make (Chan
delegated this on 2026-10-08) and hers to overrule. Build again until nothing
is untagged, then:

```
npm run check:linkedin-register
```

**7. Report what changed.** Compare with the previous commit
(`git diff --stat -- linkedin/`, and the `summary` blocks) and tell her, in this
order: new posts since the last capture and how each did; posts she edited or
deleted (`edited: true`, `deletedSeen`); follower change on each page; anything
in the `note:` lines the build printed. For her own posts you may give
impressions from `posts.private.yaml`. Give numbers, not adjectives, and say
when a post is too new to judge.

**8. Commit** the tracked files of both registers together (`capture/latest.json`,
`posts.yaml`, `posts/`, `curation.yaml`, `account.yaml`). Confirm
`git status` shows no `*.private.*` file staged. Push only if she asks.

## When the build prints a note

- **"LinkedIn shows N followers; 00-basics.yaml records M"**: the standing rule
  is to raise a reach count when the live one is higher, but that number is
  also on the CV and the site. Tell her, and if she wants it raised, use the
  `career-copy` skill: it ends with a CV rebuild and a site sync.
- **"the live headline differs from basics.headline"**: one of the two is
  stale. Ask which is right before changing either.

## Adding another company page

1. Add its folder to `REGISTERS` at the top of
   `scripts/build-linkedin-register.mjs` (`linkedin/company/<name>`, where
   `<name>` is the page's address name).
2. Write `linkedin/company/<name>/account.yaml`, modelled on the ArchCanvas one.
3. Capture it as above with `-Register <name>`, tag its posts, build.
4. Add its row to the tables in this file, `linkedin/README.md` and
   `docs/STATE.md`.

She must be an admin of the page, or LinkedIn serves only what a visitor sees.

## What went wrong before

| Symptom | Cause | What to do |
|---|---|---|
| The snippet call times out after 45 s | An earlier version awaited the whole run inside the call | It runs in the background now. If a call still times out, the page is busy: wait, then ask for `window.__liStatus` |
| `__liCopy` never returns | The page lost focus (the terminal took it) | Click the page, call it again inside the `Promise.race` above |
| A value comes back as `[BLOCKED: …]` | The browser tool hides strings that look like tokens or encoded data | It is the tool's display, not the data. The clipboard copy is unaffected |
| `this is the page's admin address` | Without `viewAsMember=true` LinkedIn redirects an admin to `/company/<number>/admin/…` | Open the address in the table above, with `viewAsMember=true` |
| The loader on the second page returns `undefined` or throws | A new tab was opened, so sessionStorage is empty | Pass the snippet file again in this tab |
| `LinkedIn answered 4xx` for the feed | LinkedIn renamed or retired an endpoint | Open the page with network tracking on, find the request the page itself makes for the feed, update `snippet.js`. Do not guess endpoints one after another |
| `signed in as X, not chanmeng666` | Another account is signed in | Ask her to switch accounts; never sign in yourself |
| Mentions come out shifted by a letter | Offsets are code points, and an emoji is two UTF-16 units | Fixed in the snippet (`[...text].slice`); keep it that way |
| The build fails on "compacted YAML" | A key holding a comma or brace was put in flow style | The compaction checks each block; if it recurs, fix `compact()` in the build script |
| Fewer posts than last time, capture `complete` | She deleted posts | Nothing to fix: they stay in the register marked `deletedSeen` |
| Page-post impressions are missing | The feed does not carry them for a page | Expected. Reading the page's admin analytics would be a separate capture |
