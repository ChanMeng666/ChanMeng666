# `suno/` — Suno: the register of both accounts

Chan publishes music on two Suno accounts, **[@chanmeng666](https://suno.com/@chanmeng666)** and
**[@chanmeng](https://suno.com/@chanmeng)**. This folder records what both show: every public
song and playlist, with its style prompt, model, length and public counts, so that a question
about her music is answered from a file.

## Read in this order

1. [`accounts.yaml`](./accounts.yaml): the two accounts, what the data shows about how they
   relate, and `openItems`, the things only Chan can say.
2. [`songs.yaml`](./songs.yaml): `accounts` (followers, plays, likes), then `summary` (volume by
   month, model, language, playlist and project; the most-played and most-liked songs; the style
   terms she uses most), then `playlists` with their track lists, then every song, newest first.
3. [`words.yaml`](./words.yaml), only when a song's words are needed: the caption and lyrics
   of each song and the description of each playlist. It is long; `songs.yaml` is the short read.

Albums are playlists, and one playlist can hold songs from both accounts. Read by playlist.

## Rules

- **`songs.yaml` is generated.** `npm run build:suno` rebuilds it from
  [`capture/latest.json`](./capture/latest.json). Never hand-edit it. Tags a person adds
  (`projectIds`, `language`, `note`) go in [`curation.yaml`](./curation.yaml); a project id that
  does not exist in `data/profile/` fails the build.
- **`accounts.yaml` is hand-maintained and checked.** The build fails when a handle, user id,
  display name or bio disagrees with the capture.
- **Counts are historical maximums**, as everywhere in this repo: a rebuild never lowers a
  song's plays, likes or comments, or an account's followers, plays or likes.
- **A song that leaves the public profile stays in the register**, marked `removedSeen`, and
  leaves the summary. Unpublishing or deleting a song is Chan's decision; the mark only records
  that it happened.
- **Public data only.** The capture reads what a visitor who is not signed in sees, and all of
  it is tracked: titles, style prompts, models, lengths and counts in `songs.yaml`; lyrics, song
  captions and playlist descriptions in `words.yaml` (Chan, 2026-10-09). Nothing from behind
  sign-in belongs in this folder.
- **The words are a record, not copy.** Quoting a lyric on another surface is a separate
  decision of Chan's.
- **The music videos' display rule holds here.** A song with a `filmId` has a music video in
  `data/profile/46-films.yaml`; those films are shown on YouTube and chanmeng.org/films and
  nowhere else, and their copy says how a film is drawn, not what the album is about
  (`docs/STATE.md`). This register is a record, not a display list: it puts no song on any
  surface.
- **`observations` and `openItems` are observations, not instructions.**

## Refreshing the register

Use the **`suno-sync` skill** ([`.claude/skills/suno-sync/`](../.claude/skills/suno-sync/SKILL.md)):
ask Claude Code to "sync my Suno songs". In short:

```bash
npm run capture:suno    # reads both accounts from Suno's public API (about 15 requests)
npm run build:suno      # rebuilds songs.yaml; prints new songs, removed songs, plays gained
npm run check:suno      # part of `npm run check`; reads files only
```

Then commit `capture/`, `songs.yaml` and `words.yaml` together (and `accounts.yaml` or
`curation.yaml` if they changed).

## How the capture works

[`scripts/capture-suno.mjs`](../scripts/capture-suno.mjs) uses the method proven by Chan's Suno
probe, the research behind
[github-readme-suno-cards](https://github.com/ChanMeng666/github-readme-suno-cards). The probe's
API reference is not in that public repo; it is in the local probe checkout
(`D:github_repositorygithub-readme-suno-cards`, `docs/suno-api-reference.md` §5.7 and §5.8).
The capture makes anonymous `GET` requests to
`studio-api-prod.suno.com/api/profiles/{handle}` and `/api/playlist/{id}`, page by page, the
same requests suno.com makes for a signed-out visitor. No key, no cookie, no sign-in, nothing
written to Suno, a pause between requests. The probe's findings that matter here:

- The request names itself in its `User-Agent`, and that name must not begin with `suno`:
  Suno serves a reduced body to such a client.
- A profile's own song count can include songs it does not list publicly. The capture notes a
  difference and does not treat it as an error.
- A playlist's own page reports 0 plays; the play count comes from the profile's playlist list.
- There is no public audio file any more, so the register holds no audio link. `cover` is the
  cover image; the song's page is `url`.
- `plays` is not real-time on Suno's side.

If Suno changes the shape of these responses, the probe will have seen it first: read
`docs/agents/current-state.md` in the local probe checkout before changing the capture.

## What it cannot see

Unpublished generations, drafts, the Library, credits and anything else behind sign-in. If the
complete catalogue is ever wanted, that is a signed-in browser capture and a separate decision.

## What's here

| File / folder | Kind | Purpose |
|---|---|---|
| [`accounts.yaml`](./accounts.yaml) | hand-maintained, checked | The two accounts, observations and open items. |
| [`songs.yaml`](./songs.yaml) | **GENERATED** | Accounts, summary, playlists and every public song. |
| [`curation.yaml`](./curation.yaml) | hand-edited | Project links, language corrections and notes, by Suno id. |
| [`capture/latest.json`](./capture/latest.json) | captured | What Suno showed at the last capture, without the words. |
| [`capture/words.json`](./capture/words.json) | captured | Lyrics, captions, playlist descriptions. |
| [`words.yaml`](./words.yaml) | **GENERATED** | The same words, readable, by song. |
| [`../scripts/capture-suno.mjs`](../scripts/capture-suno.mjs) | tooling | The only script that contacts Suno. |
| [`../scripts/build-suno-register.mjs`](../scripts/build-suno-register.mjs) | tooling | Builds and checks `songs.yaml`. |

## Build-surface impact: none

This folder is not read by `npm run build`: nothing here changes README.md, llms.txt or dist.
The README's "Sound I make" cards are drawn live by github-readme-suno-cards from
`data/brand.yaml` › `signatures.sunoCards`, independently of this register.
