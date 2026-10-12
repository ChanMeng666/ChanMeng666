# `distribution/` — where each film is published, and the posting calendar

Chan's films (product films, brand films, the event promo, the music videos) go
out on YouTube, chanmeng.org/films, LinkedIn and X. This folder answers three
questions: where is each film already published, where is it still missing,
and what gets posted on which day. Chan posts by hand. Nothing here posts for
her.

| File | What it is | Edited by |
|---|---|---|
| [`plan.yaml`](./plan.yaml) | Which platforms each kind of film is meant for, the posts already made, the schedule, where staged files come from | hand |
| [`status.yaml`](./status.yaml) | Every film on every platform: published, planned, to do, or not meant for it | generated |
| [`calendar.md`](./calendar.md) | The schedule week by week, and the whole matrix as one table | generated |
| `drafts/<film>.yaml` | Draft text per platform, with what to check before posting | hand, **local only** |
| `_staging/<nn>-<film>/` | The video files to upload, copied from the film repos | generated, **local only** |

`drafts/` and `_staging/` are gitignored. This repository is public: text is not
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
npm run build:distribution    # write status.yaml and calendar.md
npm run check:distribution    # fail if they are stale or the plan is inconsistent
npm run stage:distribution    # copy the scheduled video files into _staging/
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
  `archcanvas-growth` repository. Here they are tracked, not scheduled.
- **Two films a week, Tuesday and Thursday** (Chan, 2026-10-12). LinkedIn's
  Monday, Wednesday and Friday belong to the ArchCanvas calendar. X goes out on
  the same day.
- **Copy** comes from a source Chan has already cleared: the film's published
  YouTube description first, then `data/profile/`. The rules of each product
  still hold (GAVIGO's approved figures only; CORDE does not endorse the film;
  no pricing; no result claimed that belongs to a client).

## Running the calendar with Claude Code

**For Claude.** When Chan asks what is next, what is due, or to run the calendar:

1. **Find the place.** Take today's date (Pacific/Auckland). Read `schedule` in
   `plan.yaml` top to bottom. Report briefly: what is overdue, what is due
   today, and what must be ready before the next posting day (an unapproved
   draft, a `[YOURS]` line, a missing staged file).
2. **Show the exact text before a post goes out**: the draft with every
   `[YOURS]` line replaced by her words or removed, and every fact re-checked
   against `data/profile/` on the day. She approves that text; then set the
   row's `status: approved` (and the draft's).
3. **Never fill a gap.** Do not write her anecdote, feeling, quote or figure. A
   `[YOURS]` line she has not answered is deleted, or the post waits.
4. **She posts.** Give her the file path under `_staging/`, the text, and the
   first comment or reply. On LinkedIn the video is uploaded natively and the
   links go in the first comment; on X the links go in a reply.
5. **After she says it is posted**, ask for the post's address. Set the row to
   `status: posted` and add `url:`. When the register next has the post, move
   the row from `schedule` to `posted` with its id, and rebuild. If she changed
   the text while posting, the register has the truth; the draft can go.
6. **If a day is missed**, do not post two films in one day. Move the film to
   the next free Tuesday or Thursday, keep the order, shift what follows, and
   rebuild.
7. **A new film** gets a row in `46-films.yaml` first. Then it shows up in
   `status.yaml` as "to do" on each platform its kind is meant for: schedule
   it, add its files to `assets`, stage, write the draft.
8. **Review once a month**: sync the registers, rebuild, and read the counts in
   `status.yaml` (views, reactions) per film and per platform before planning
   the next round.
