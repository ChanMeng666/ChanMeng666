---
name: linkedin-sync
description: >-
  Use to sync or refresh Chan's LinkedIn posts (her profile, the ArchCanvas
  company page, or both) into the linkedin/ registers from her signed-in
  Chrome, or before answering how her posts did when the register is older
  than her latest post. Not for writing posts or the profile copy (that is
  career-copy).
---

# LinkedIn sync

| Page | Folder | Open |
|---|---|---|
| Her profile | `linkedin/` | `https://www.linkedin.com/in/chanmeng666/recent-activity/all/` |
| ArchCanvas page | `linkedin/company/archcanvas/` | `https://www.linkedin.com/company/archcanvas/posts/?feedView=all&viewAsMember=true` |

Sync both unless she names one. Rules for the files: `linkedin/README.md`
§ "The account register".

## Rules

- **Read only.** Editing, deleting or posting is a separate task and she sees
  the exact text first.
- **Impressions stay local**: `linkedin/capture/latest.private.json` and
  `linkedin/posts.private.yaml`, both gitignored. Never in a tracked file, a
  commit message or a PR. Quoting them to her in conversation is fine.
- **One capture per page per sync** (the profile is about seventeen requests).
  If a run fails, find out why before running again.
- Never type a post into a file. If the capture breaks, fix
  `linkedin/capture/snippet.js`.

## Steps

Steps 1 to 3 for one page, then the other, **in the same tab**.

1. Open the address above in a new tab (the snippet reads the page type from
   the address).
2. First page: pass `linkedin/capture/snippet.js` to `javascript_tool`, from
   `window.__liStart = () => {` to the end. It stores itself in sessionStorage,
   so on the second page run only
   `new Function("return " + sessionStorage.getItem("__liStart"))()`. Poll with
   `await new Promise((r) => setTimeout(r, 20000)); window.__liStatus` until
   `complete: true`.
3. The tool cuts returned strings at about 1,000 characters, so save through
   the clipboard. Click an empty part of the page (it needs focus), then
   `await Promise.race([window.__liCopy("public"), new Promise((r) => setTimeout(() => r("timeout: click the page first"), 8000))])`
   and
   `pwsh .claude/skills/linkedin-sync/scripts/save-capture.ps1 -Register profile -Half public`.
   For the profile, click the page **again**, copy `"private"`, save with
   `-Half private`. A company page has no private half; its `-Register` is the
   page name (`archcanvas`). Tell Chan her clipboard was used.
4. Close the tab. In each `account.yaml` set `asOf`, raise `counts.followers`
   if higher (never lower), correct `headline` if it changed.
5. `npm run build:linkedin-register`. For each post it lists as `untagged`,
   read it in `posts/<year>.yaml` and add a line at the top of that page's
   `curation.yaml`:
   `"7512477056845316096": { topic: launch, projectIds: [echook] }`.
   `topic` is one of the ten in `linkedin/README.md`; `projectIds` only when
   the post is about that project. Tagging is delegated to you (2026-10-08) and
   hers to overrule. Then `npm run check:linkedin-register`.
6. Report, with numbers: new posts and how each did; edited or deleted posts
   (`edited: true`, `deletedSeen`); follower change per page; the build's
   `note:` lines. Say when a post is too new to judge.
7. Commit the tracked files of both registers together; confirm no
   `*.private.*` file is staged. Push only if she asks.

Build notes: a follower count above `00-basics.yaml` is also on the CV and the
site, so tell her and use `career-copy` if she wants it raised. A live headline
that differs from `basics.headline`: ask which is right before changing either.

A new company page: add its folder to `REGISTERS` in
`scripts/build-linkedin-register.mjs`, write its `account.yaml` after the
ArchCanvas one, capture with `-Register <name>`. She must be an admin of the
page.

## What went wrong before

| Symptom | Cause and action |
|---|---|
| `__liCopy` never returns | The page lost focus: click it, call again |
| A value shows as `[BLOCKED: …]` | The tool's display, not the data; the clipboard copy is unaffected |
| `this is the page's admin address` | Without `viewAsMember=true` LinkedIn redirects an admin: use the address above |
| The loader on the second page returns `undefined` | A new tab was opened, so sessionStorage is empty: pass the snippet file again |
| `LinkedIn answered 4xx` for the feed | An endpoint was renamed. Watch the network for the request the page itself makes and update `snippet.js`; do not guess endpoints |
| `signed in as X, not chanmeng666` | Ask her to switch accounts; never sign in yourself |
| Mentions shifted by a letter | Offsets are code points and an emoji is two UTF-16 units: keep `[...text].slice` in the snippet |
| Fewer posts, capture `complete` | She deleted posts: they stay as `deletedSeen` |
| Page-post impressions missing | Expected: the feed does not carry them for a page |
