---
name: suno-sync
description: >-
  Use when Chan asks to sync, refresh, update, capture or re-read her Suno
  songs into this repo: her two accounts, @chanmeng666 (suno.com/@chanmeng666)
  and @chanmeng (suno.com/@chanmeng). Reads every public song and playlist from
  Suno's public API without signing in, saves them as structured data under
  suno/ (a summary, the playlists with their track lists, and every song with
  its style prompt, model, length, language and public counts; lyrics and
  captions in a file of their own), links songs to their music videos and
  projects, rebuilds and checks the register, and reports what changed since
  the last capture: new songs, removed songs, plays and likes gained, follower
  change. Also use before answering "how are my songs doing?", "what have I
  made on Suno?" or anything about her albums when the register is older than
  her latest song, and after she has published, unpublished or re-ordered
  songs or playlists. Keywords: Suno, songs, music, albums, playlists, plays,
  likes, followers, lyrics, style prompt, register, capture, sync, 歌曲, 音乐,
  专辑, 歌单, 播放量, 同步, 数据追踪. Not for making, publishing or deleting
  songs, not for the README "Sound I make" cards (data/brand.yaml ›
  signatures.sunoCards) and not for the Suno probe itself
  (github-readme-suno-cards).
---

# Suno sync

Bring the Suno register in this repo up to date with what suno.com shows now.
Two accounts are tracked, `@chanmeng666` and `@chanmeng`, in `suno/`:

| File | What it is |
|---|---|
| `suno/capture/latest.json` | What Suno showed at the last capture. Written only by `npm run capture:suno` |
| `suno/songs.yaml` | **Generated** from the capture: `accounts`, `summary`, `playlists`, then every song |
| `suno/curation.yaml` | Hand-edited tags by Suno id: `projectIds`, `language`, `note` |
| `suno/accounts.yaml` | The two accounts, observations and `openItems`. Hand-kept; the build checks it against the capture |
| `suno/words.yaml` | **Generated** from `suno/capture/words.json`: captions, lyrics, playlist descriptions |

The rules these files follow are in `suno/README.md`.

## Rules that do not bend

- **Read only, signed out.** The capture is anonymous `GET` requests to Suno's
  public API. Never add a cookie, a token or a sign-in to it, and never use it
  on an account that is not hers.
- **One capture per sync.** About 15 requests with a pause between them. Do not
  loop it or re-run it to "make sure". If it fails, read the status code and
  the Suno probe's `docs/agents/current-state.md`
  (`D:\github_repository\github-readme-suno-cards`) before running it again.
- **The words are a record, not copy.** Lyrics are tracked in
  `suno/words.yaml` (Chan, 2026-10-09). Quoting one on another surface is a
  separate decision of hers.
- **Never type a song or a count into a file by hand.** If the capture breaks,
  fix `scripts/capture-suno.mjs`.
- **Nothing here puts a song on a surface.** The music videos' display rule
  (`docs/STATE.md`) is unchanged by a sync.

## Steps

1. `npm run capture:suno`. It prints one line per account. A `note:` line that
   a profile counts more songs than it lists is information, not a failure.
2. `npm run build:suno`. It prints `new:`, `removed:` and the plays, likes and
   followers gained since the committed register. A `DRIFT:` line means a
   display name, bio or user id changed on Suno: correct `suno/accounts.yaml`
   by hand and rebuild.
3. For each new song, decide whether it needs a line in `suno/curation.yaml`:
   a project link the data proves (a soundtrack, a film's song), or a
   `language` the detection got wrong (it cannot tell Mandarin from Cantonese
   except by "Cantopop" in the style prompt). A new music video in
   `data/profile/46-films.yaml` links itself by `titleZh`; a `note:` line names
   any music video that matches no public song.
4. `npm run check:suno`, then report to Chan: new and removed songs, the
   counts that moved, anything added to `openItems`.
5. Commit `suno/capture/`, `suno/songs.yaml` and `suno/words.yaml` together, with
   `accounts.yaml` and `curation.yaml` if they changed, when she asks for a
   commit. Update the Suno line in `docs/STATE.md` § Platform registers.
