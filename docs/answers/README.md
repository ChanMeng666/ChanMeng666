# Filed answers

A filed answer is a question Chan or an agent asked that needed synthesis across the
knowledge base (several shards, `docs/STATE.md`, the stories, a register), written down once
so the next session reads it instead of re-deriving it. Answers compound: a later answer
links to an earlier one, and an answer that goes stale is marked superseded, never rewritten
in place or deleted.

An answer is not a source. Facts stay in `data/profile/`, decisions in `docs/STATE.md`. An
answer cites them and says what follows. When it disagrees with them, the answer is stale.

## Layout

| Path | Tracked | Holds |
|---|---|---|
| `docs/answers/README.md` | yes | This file |
| `docs/answers/TEMPLATE.md` | yes | The skeleton to copy |
| `docs/answers/<YYYY-MM-DD>-<slug>.md` | yes | One answer, neutral wording only; the date is the day it was asked |
| `docs/answers/_private/<YYYY-MM-DD>-<slug>.md` | **no** | The candid version of an answer, or an answer that needs a private source |

`docs/answers/_private/` is gitignored by the repo-wide `**/_private/` rule. It cannot hold
a tracked placeholder, so it is created on first use. Nothing from it goes into a tracked
file, a commit message or generated output.

## Format

YAML front matter, then the answer.

```yaml
---
question: "The question as it was asked, in one sentence"
asked: "2026-10-16"          # the day it was asked
answered: "2026-10-16"       # the day this text was written or last re-checked
asker: chan | agent
sources:                     # what the answer rests on
  - "[[projects/echook]]"    # a shard entry, as [[<list>/<id>]]
  - docs/STATE.md            # a doc path
status: current              # current | superseded
supersededBy: null           # the file name of the answer that replaces this one
---
```

The body opens with the answer in two or three sentences, then the detail. Each claim
carries its source: a `[[<list>/<id>]]` wikilink for a shard entry, a doc path with its
section for a decision. Link to an earlier answer as `[[answers/<file stem>]]`.

## Rules

- **Neutral wording.** The repo is public. A tracked answer states decisions, not motives,
  and quotes nothing from a `*.private.*` file or a `_private/` directory. If the honest
  answer needs either, write the tracked answer from tracked sources and put the candid one
  in `_private/`.
- **Never delete.** When the answer changes, write a new file, then set `status: superseded`
  and `supersededBy:` on the old one. Leave its body as it was.
- **Re-check before reuse.** An answer older than the sources it cites may be stale. Re-read
  the sources, then either bump `answered:` or supersede it.
- **Links are checked.** `npm run check:wikilinks` fails on a wikilink that resolves to
  nothing.

## Index

| Answer | Asked | Status |
|---|---|---|
| [Entries kept off visitor-facing surfaces](2026-10-16-entries-kept-off-visitor-surfaces.md) | 2026-10-16 | current |
