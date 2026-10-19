# `distribution/` — where each film is published, and the posting calendar

Chan's films (product films, brand films, the event promo, the music videos) go
out on YouTube, chanmeng.org/films, LinkedIn and X. This folder answers three
questions: where is each film already published, where is it still missing,
and what gets posted on which day. Nothing is published without Chan's
approval of the exact text and her yes for that post; with both, Claude
publishes it through her browser (§ "Running the calendar").

| File | What it is | Edited by |
|---|---|---|
| [`plan.yaml`](./plan.yaml) | Which platforms each kind of film is meant for, the posts already made, the schedule, where staged files come from | hand |
| [`status.yaml`](./status.yaml) | Every film on every platform: published, planned, to do, or not meant for it | generated |
| [`calendar.md`](./calendar.md) | The film schedule week by week, and the whole matrix as one table | generated |
| `master-calendar.md` | Every posting calendar merged by date: the films and the calendars under `otherCalendars` in the plan. What is overdue, due today and next | generated, **local only** |
| `drafts/<film>.yaml` | Draft text per platform, with what to check before posting | hand, **local only** |
| `_staging/<nn>-<film>/` | The video files to upload, downloaded from GitHub (`docs/film-masters.md`) when no film repo is checked out. Delete it any time; stage again before posting | generated, **local only** |

`drafts/`, `_staging/` and `master-calendar.md` are gitignored (the last one quotes a
private repository and depends on the date). This repository is public: text is not
published in Chan's name before she approves it, and a commit is a publication.
Once a post is live, its text is in the X or LinkedIn register.

## What is read from where

Nothing is typed twice. The build joins:

- `data/profile/46-films.yaml`: the films, their YouTube ids, whether the site shows them;
- `youtube/videos.yaml`: upload dates and views;
- `x/posts.yaml`, `linkedin/posts/`, `linkedin/company/archcanvas/posts/`: the social posts, by id;
- `plan.yaml`: the only thing that says *which post carries which film*, and what is scheduled.

So a figure in `status.yaml` is only as fresh as its register (`registersAsOf`).
A post made after a register's date is unknown here until the register is synced
(`x-sync` and `linkedin-sync` skills, `npm run capture:youtube`).

## Commands

```
npm run calendar              # rebuild everything and write the master calendar for today
npm run build:distribution    # write status.yaml and calendar.md
npm run check:distribution    # fail if they are stale or the plan is inconsistent
npm run stage:distribution    # fetch the scheduled video files into _staging/ (needs gh)
```

The build also checks the local drafts when they are present: an X post over
280 characters (a link counts as 23) is an error, and so is a row marked
`approved` whose draft still has a `[YOURS]` placeholder.

## Rules the plan carries

- **Which film goes where** is `policy` in `plan.yaml`, and it follows
  `docs/STATE.md`: music videos on YouTube and chanmeng.org/films only; one film
  on show per product, so earlier versions stay on /films; a film that is
  recorded but not shown is meant for no platform. Change STATE first, then the
  policy.
- **ArchCanvas and ArchLang** posts are scheduled in the private
  `archcanvas-growth` repository, whose calendar file stays the authority on
  its dates, its checkboxes and its copy. Here they are merged into the master
  calendar and run from it; change them there.
- **Two films a week, Tuesday and Thursday** (Chan, 2026-10-12). LinkedIn's
  Monday, Wednesday and Friday belong to the ArchCanvas calendar. X goes out on
  the same day.
- **Copy** comes from a source Chan has already cleared: the film's published
  YouTube description first, then `data/profile/`. The rules of each product
  still hold (GAVIGO's approved figures only; CORDE does not endorse the film;
  no pricing; no result claimed that belongs to a client).

## Running the calendar

**For Claude.** Chan opens this repository and says "run the calendar", "what is
due" or "post today's". Since 2026-10-12 Claude carries out the posting steps
through her signed-in Chrome (the `claude-in-chrome` tools), stopping only where
a person is needed. The steps below apply to every item in the master calendar,
whichever calendar it comes from.

### 1. Find the place

Run `npm run calendar` and read `master-calendar.md`. Report in a few lines:
what is overdue, what is due today, what is next, and for each what must be
settled first. Then take the items one at a time, oldest first.

### 2. Settle what only she can supply

A line marked `(you)`, a `[YOURS]` placeholder, a screenshot she must take, a
person whose consent is needed: ask, and wait. Never write her anecdote,
feeling, quote or figure, and never post around a gap. A `[YOURS]` line she
does not want to fill is deleted. If something cannot be had today, say so and
move the item (step 7).

### 3. Check, then get the exact text approved

Run the checks the item lists (for an ArchCanvas showcase, the lint check in
its own calendar; for a film, re-read the facts against `data/profile/` and
confirm the staged file exists). Then show her, in the chat, exactly what will
be published: the post, the first comment or reply, the files in order, the
account and the platform. She approves that text. Set the film row to
`status: approved`, or tick "Final text approved" in the other calendar.

### 4. Publish through Chrome

Each post needs her yes in the chat **for that post**, given after she has seen
the text in step 3. One yes covers one post on one platform with its first
comment or reply; it does not carry to the next post, the next platform or the
next day. Then:

1. Open a new tab on the platform, confirm the signed-in account is hers
   (`chanmeng666`), and open the composer.
2. Type the approved text. Attach the files with the browser file-upload tool,
   in the listed order.
3. **Video, or any file the tool cannot attach: stop.** Leave the composer open
   with the text in place, give her the file's full path, and wait until she
   says it is attached and has finished processing.
4. Take a screenshot of the composed post and compare it with the approved
   text. If anything differs (a line break, a mention the platform resolved, a
   link preview that replaced the video), stop and show her.
5. Press Post. Then add the first comment (LinkedIn) or the reply (X) from the
   approved text.
6. Open the published post, copy its address, close the tab.

Never, in this flow: delete or edit a published post, answer other people's
replies, send a message, follow or unfollow, change a setting, accept a
dialog or a cookie banner beyond declining, or post anything she has not seen.
Replies to other people are hers to write; Claude may draft one for her to
approve like any other post. If the platform shows a "Leave site?" dialog,
something is already in a composer: stop and tell her. If a browser step fails
twice, stop and say what happened; do not retry around it.

LinkedIn: the video or image is uploaded natively and links go in the first
comment. X: 280 characters, a link counts as 23, links go in a reply, a post
cannot be edited afterwards, and a video over 140 s goes up as a YouTube link.
The company page gets nothing written for it (the ArchCanvas calendar says
what is reposted there).

### 5. Bookkeeping, in the same turn

- **Film:** set the row in `plan.yaml` to `status: posted` with `url:`, and the
  draft file to the same. Rebuild (`npm run calendar`).
- **ArchCanvas item:** tick its boxes in the ArchCanvas calendar, and follow
  that file's own bookkeeping (copy-file frontmatter, tracker row).
- Remind her of the first hour of replies.

### 6. Three days later

Sync the registers (`x-sync`, `linkedin-sync`). For a film, move the row from
`schedule` to `posted` with the post's id; for an ArchCanvas item, add the
engagement snapshot its calendar asks for. Rebuild.

### 7. When a day is missed

Never two posts on one platform in one day. A film moves to the next free
Tuesday or Thursday, keeping the order and shifting what follows (`plan.yaml`).
An ArchCanvas item moves by that calendar's own rule (the next free Monday,
Wednesday or Friday), in its own file. Rebuild and tell her the new dates.

### 8. A new film, and the monthly review

A new film gets a row in `46-films.yaml` first; it then appears in
`status.yaml` as "to do" on each platform its kind is meant for: schedule it,
add its files to `assets`, stage, write the draft. Once a month, sync the
registers, rebuild, and read the counts per film and per platform in
`status.yaml` before planning the next round.
