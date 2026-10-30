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
| `_staging/<nn>-<film>/` | The video files to upload, downloaded from GitHub (`docs/film-masters.md`) when no film repo is checked out. Delete it any time; stage again before posting | generated, **local only** |

`_staging/` is gitignored. Draft text lives in the private `chanmeng-marketing` repository: this one is
public, and a commit is a publication. Once a post is live, its text is in the X or LinkedIn register.

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
- **ArchCanvas and ArchLang** copy stays in the private `archcanvas-growth`
  repository; their dates are in the one calendar.
- **Two films a week, Tuesday and Thursday** (Chan, 2026-10-12). LinkedIn's
  Monday, Wednesday and Friday belong to the ArchCanvas calendar. X goes out on
  the same day.
- **Copy** comes from a source Chan has already cleared: the film's published
  YouTube description first, then `data/profile/`. The rules of each product
  still hold (GAVIGO's approved figures only; CORDE does not endorse the film;
  no pricing; no result claimed that belongs to a client).

## Running the calendar

Moved on 2026-10-31. Every date, for films and everything else, is in the private `chanmeng-marketing` repository (`calendar.yaml`), and the daily run is its `/today` skill. The film rows under `schedule:` in `plan.yaml` are exported from there. A new film still starts as a row in `46-films.yaml`; it then appears in `status.yaml` as "to do", and gets a calendar row and a draft in that repository.
