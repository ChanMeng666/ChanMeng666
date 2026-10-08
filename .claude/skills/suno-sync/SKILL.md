---
name: suno-sync
description: >-
  Use to sync or refresh Chan's Suno songs and playlists (@chanmeng666 and
  @chanmeng) into the suno/ register, or before answering anything about her
  songs or albums when the register is older than her latest song. Not for
  making or publishing songs, nor for the README Suno cards.
---

# Suno sync

Rules for the files: `suno/README.md`.

- **Read only, signed out.** Anonymous `GET` requests to Suno's public API.
  Never add a cookie, token or sign-in, and never point it at an account that
  is not hers.
- **One capture per sync** (about 15 requests). If it fails, read the status
  code and `D:\github_repository\github-readme-suno-cards\docs\agents\current-state.md`
  before running again.
- Never type a song or a count into a file. If the capture breaks, fix
  `scripts/capture-suno.mjs`.
- Lyrics are a record (Chan, 2026-10-09); a sync puts no song on any surface.

## Steps

1. `npm run capture:suno`. A `note:` that a profile counts more songs than it
   lists is information, not a failure.
2. `npm run build:suno`. A `DRIFT:` line means a display name, bio or user id
   changed: correct `suno/accounts.yaml` by hand and rebuild.
3. For each new song, add a line to `suno/curation.yaml` only for a project
   link the data proves, or a `language` the detection got wrong (it tells
   Mandarin from Cantonese only by "Cantopop" in the style prompt). A new music
   video in `46-films.yaml` links itself by `titleZh`.
4. `npm run check:suno`, then report: new and removed songs, counts that moved,
   anything added to `openItems`.
5. Commit `suno/capture/`, `suno/songs.yaml`, `suno/words.yaml` (and
   `accounts.yaml`, `curation.yaml` if changed) when she asks.
