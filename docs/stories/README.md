# Project stories

The engineering story behind each project Chan leads or shows: what the problem
was, what she decided, what was hard, what happened, and who can vouch for it.
Written for two readers at once: Chan before an interview, and a coding agent
asked to prepare her for one or to draft a cover letter.

Facts come from `data/profile/` (the authority on titles, dates and metrics) and
from the project's own repository, read at the date in each file's
`lastResearched`. A story never states a figure the shards do not; when the code
shows something the shards lack or contradict, it is listed under "Open
questions" in that file, not silently corrected.

## Layout

| Path | Tracked | Holds |
|---|---|---|
| `docs/stories/README.md` | yes | This file: schema, rules, index |
| `docs/stories/narrative.md` | yes | The cross-project story: the threads that run through her work |
| `docs/stories/<projectId>.md` | yes | One project's story file (schema below). `<projectId>` is `projects[].id` |
| `docs/stories/_private/<projectId>/diagrams.md` | **no** | Mermaid diagrams: architecture, main flows, data model, deployment |
| `docs/stories/_private/<projectId>/evidence.md` | **no** | Endorsements and proof from private sources (chat, DMs, email), each with its source |
| `docs/stories/_private/<projectId>/notes.md` | **no** | Detail too internal for a public file: private-repo paths and commits, client-internal figures, names not cleared |
| `docs/stories/_private/_inbox/` | **no** | Raw exports Chan hands over (Slack, WhatsApp, WeChat, LinkedIn DMs) before they are sifted |

`docs/stories/_private/` is gitignored. Nothing from it goes into a tracked file,
a commit message or generated output.

## Story file schema

YAML front matter, then fixed headings in this order. Agents may rely on both.

```yaml
---
id: archlang                 # projects[].id
title: ArchLang
role: Creator and sole developer
period: "2026-06 – present"  # from the shard
status: production           # projects[].status
kind: own-product            # own-product | client | commissioned | open-source-tool | teaching
repos:                       # public repos only; a private one is written "private"
  - ChanMeng666/archlang
live: https://archlang.uk
stack: [TypeScript, ...]
stories: 6                   # number of entries under "## Stories"
publicEvidence: [ref-id, award-id]   # ids in 50-references / 30-recognition
privateEvidence: 3           # count of non-public items (publicOk: false) in _private/<id>/evidence.md
diagrams: true               # _private/<id>/diagrams.md exists
lastResearched: "2026-10-15"
sources: [what was read]
---
```

1. `## In one breath`: the 30-second version for a recruiter with no
   technical background. What it is, who it is for, what Chan did, one result.
2. `## The problem`: who had it and why the obvious answer was not enough.
3. `## What I built`: the system in a paragraph and a short list. No diagrams
   here (they live in the private layer); describe in words.
4. `## Stories`: four to eight entries, each `### S<n>. <title>` with:
   - **Kind**: decision, implementation, requirements, difficulty, incident,
     collaboration or delivery
   - **Situation**, **What I did**, **Result**: first person, past tense,
     concrete (a file, a constraint, a number from the shards)
   - **Engineer's angle**: the part a senior engineer would want to dig into
   - **Plain version**: one sentence for a non-technical listener
   - **Follow-ups**: two or three questions an interviewer is likely to ask,
     each with a short true answer
5. `## Numbers I can say`: each figure with its source (shard path or a public
   page). Only figures already cleared on a visitor-facing surface or in the
   shards.
6. `## In hindsight`: what she would do differently, honestly.
7. `## Evidence`: public items only (LinkedIn recommendations in
   `50-references.yaml`, awards, publications, public pages), quoted briefly with
   the id. Private items are counted, never quoted.
8. `## Open questions`: gaps for Chan to fill, and any disagreement found
   between the code and the shards.

## Rules for a tracked story file

This repo is public. On top of the rules in `CLAUDE.md` and `docs/STATE.md`:

- **No links to private repositories**, no private file paths, no commit hashes
  from private repositories. Say "the client's private repository".
- **Client confidentiality.** No internal hostnames, credentials, security
  findings, client revenue or internal operating figures, and no person named
  unless they are in `50-references.yaml`, a `60-network.yaml` collaborator
  with a public listing, or a public speaker already named in the shards'
  visitor copy (for example a summit keynote; Chan, 2026-10-15).
- **GAVIGO**: only the three approved figures, with their labels and the
  boundary note. **CORDE**: its commit share only with its basis beside it.
- **No pricing or cost framing**, no commit counts or solo percentages.
- **Projects held off visitor surfaces** (GenLAB, Seismophone, Chromaflow,
  the music videos) get no tracked story; GenLAB's is in the private layer
  until Chan clears it. LYZEN is told here since 2026-10-15 (Chan) and stays
  off every other visitor-facing surface.
- Decisions, not motives: say what was chosen and the technical reason, not
  private reasons.

## Evidence intake

When Chan hands over a source (a Slack export, WhatsApp or WeChat chat, LinkedIn
DMs), it goes into `_private/_inbox/<yyyy-mm-dd>-<source>/` untouched. A pass then
copies what counts into the right `_private/<projectId>/evidence.md` as:

```yaml
- id: e-<projectId>-<n>
  who: Name, role, relation to the project   # as they were at the time
  said: "the exact words, trimmed with [...] only"
  date: "2026-03-14"
  source: slack | whatsapp | wechat | linkedin-dm | linkedin-rec | email | meeting | repo | award
  where: "file in _inbox and line, or the public URL"
  supports: [S2, S5]        # which stories it backs
  publicOk: false           # true only when Chan says it may be quoted publicly
```

What counts: words from the project's owner, founder, client lead or a senior
engineer about her technical work or its result; a formal award or thanks; a
decision that followed her work (a contract extended, a feature adopted). Not
counted: generic pleasantries, praise for someone else, anything she was not
party to.

## Wikilinks

Link to a shard entry as `[[<list>/<id>]]`, for example `[[projects/echook]]`,
`[[work/she-sharp]]` or `[[organizations/lyzen]]`. Always name the list: ids are
unique within a list, not across lists. Link to another doc by its path under
`docs/`, without `.md`: `[[stories/narrative]]`, `[[STATE]]`. A label goes after a
bar: `[[projects/echook|echook]]`. Never link into `_private/`.

`node scripts/check-wikilinks.mjs` (`npm run check:wikilinks`) resolves every link
in `docs/` against the shards and fails on a broken one. It also warns about a
story file whose name is no project, work or organisation id.

`wiki/` is a local, gitignored view of the shards built by
`npm run build:wiki`: one page per entry, with links, backlinks, guards and the
shard line. It opens as an Obsidian vault. Edit the shard, never the page.

## Index

| Project | Kind | Story file | Diagrams | Private evidence |
|---|---|---|---|---|
| ArchCanvas | own-product | [archcanvas.md](archcanvas.md) | yes | 0 |
| ArchLang | own-product | [archlang.md](archlang.md) | yes | 0 |
| GAVIGO IRE | client | [gavigo-ire.md](gavigo-ire.md) | yes | 16 |
| She Sharp | client | [she-sharp.md](she-sharp.md) | yes | 11 |
| Eatropolis website | client | [eatropolis-website.md](eatropolis-website.md) | yes | 13 |
| FemTech Weekend website | client | [femtech-weekend-website.md](femtech-weekend-website.md) | yes | 2 |
| LYZEN company site | client | [lyzen-website.md](lyzen-website.md) | yes | 4 |
| CORDE field-operations app | client | [corde-mobile-application.md](corde-mobile-application.md) | yes | 9 |
| Tam-AI-Ti | commissioned | [tam-ai-ti.md](tam-ai-ti.md) | yes | 15 |
| AI Programming Education Platform | teaching | [ai-programming-teaching-project.md](ai-programming-teaching-project.md) | yes | 0 |
| echook | open-source-tool | [echook.md](echook.md) | yes | 1 |
| a11y-loop | open-source-tool | [a11y-loop.md](a11y-loop.md) | yes | 8 |
| Google News MCP Server | open-source-tool | [google-news-mcp.md](google-news-mcp.md) | yes | 0 |
| genlab-career-academy | client | private layer only | yes | 3 |

The cross-project story is [narrative.md](narrative.md).
