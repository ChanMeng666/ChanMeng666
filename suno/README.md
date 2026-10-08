# `suno/` — Suno: the register of both accounts

Chan publishes music on two Suno accounts, [@chanmeng666](https://suno.com/@chanmeng666) and
[@chanmeng](https://suno.com/@chanmeng). This folder records what both show publicly.

To bring it up to date, use the **`suno-sync` skill**
([`.claude/skills/suno-sync/`](../.claude/skills/suno-sync/SKILL.md)).

## Read in this order

1. `accounts.yaml` (hand-maintained): the two accounts, what the data shows about how they
   relate, and `openItems`, the things only Chan can say.
2. `songs.yaml` (generated): `accounts`, `summary`, `playlists` with their track lists, then
   every song, newest first.
3. `words.yaml` (generated from `capture/words.json`), only when a song's words are needed:
   captions, lyrics, playlist descriptions. It is long.

Albums are playlists, and one playlist can hold songs from both accounts. Read by playlist.

## Rules

- **`songs.yaml` and `words.yaml` are generated** by `npm run build:suno` from `capture/`.
  Never hand-edit them. Tags a person adds (`projectIds`, `language`, `note`) go in
  `curation.yaml`, keyed by Suno id; a project id that does not exist in `data/profile/` fails
  the build.
- **`accounts.yaml` is checked.** The build fails when a handle, user id, display name or bio
  disagrees with the capture.
- **Counts are historical maximums**: a rebuild never lowers a song's plays, likes or
  comments, or an account's followers, plays or likes.
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

## What it cannot see

Unpublished generations, drafts, the Library, credits and anything else behind sign-in. If the
complete catalogue is ever wanted, that is a signed-in browser capture and a separate decision.

Also:

- A profile's own song count can include songs it does not list publicly. The capture notes
  the difference and does not treat it as an error.
- There is no public audio file any more, so the register holds no audio link. `cover` is the
  cover image; the song's page is `url`.
- `plays` is not real-time on Suno's side.
- The README's "Sound I make" cards are drawn live by github-readme-suno-cards from
  `data/brand.yaml` › `signatures.sunoCards`, independently of this register.

The capture method comes from Chan's Suno probe (the local checkout of
github-readme-suno-cards; its API reference is not in the public repo). If Suno changes the
shape of its responses, the probe will have seen it first: read `docs/agents/current-state.md`
there before changing `scripts/capture-suno.mjs`.
