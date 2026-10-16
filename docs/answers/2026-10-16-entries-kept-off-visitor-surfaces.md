---
question: "Which projects are recorded but kept off visitor-facing surfaces, and why?"
asked: "2026-10-16"
answered: "2026-10-16"
asker: agent
sources:
  - docs/STATE.md
  - "[[projects/genlab-career-academy]]"
  - "[[films/genlab-how-it-works]]"
  - "[[collaborators/nga-blanchard]]"
  - "[[projects/lyzen-website]]"
  - "[[organizations/lyzen]]"
  - "[[projects/sunostats]]"
  - "[[projects/gradient-svg-generator]]"
  - "[[projects/css-tower-defense]]"
  - "[[projects/october-rain-february-line-mv]]"
  - "[[projects/anti-marriage-universe-mv]]"
  - "[[projects/memory-amber-2022-mv]]"
  - "[[projects/solo-coffee-mv]]"
  - "[[projects/server-google-jobs]]"
  - "[[projects/github-readme-suno-cards]]"
  - "[[films/archlang-demo]]"
  - "[[publications/decoding-the-future-podcast]]"
  - "[[publications/future-turing-podcast]]"
  - "[[publications/praxis-and-pages-podcast]]"
status: current
supersededBy: null
---

# Entries kept off visitor-facing surfaces

Five projects are recorded in the shards but shown on no visitor-facing surface:
GenLAB Career Academy, the LYZEN company site, Seismophone, Chromaflow and Te Pā Tiaki.
The four music-video projects are shown in three named places only. A few more entries are
off one surface but not all. Each reason below is the decision as docs/STATE.md
§ Display rules records it. "Visitor-facing" means README.md, chanmeng.org, all three CVs
and LinkedIn copy.

## Off every visitor-facing surface

| Entry | Decision and date | How it is kept off |
|---|---|---|
| GenLAB Career Academy: [[projects/genlab-career-academy]], its film [[films/genlab-how-it-works]] | In development (Chan, 2026-10-12). Shown when Chan clears it | No `90-meta.yaml` bucket; tier never `flagship`; no `organizations[]` entry for the client; [[collaborators/nga-blanchard]] has `publicListing: false`; the film has `onFilmsPage: false` and no `productFilms` row. Named openly in the data files, `llms-full.txt` and `dist/profile.json` |
| LYZEN company site: [[projects/lyzen-website]], organisation [[organizations/lyzen]] | Not shown for now (Chan, 2026-10-12) | In no README bucket, CV, LinkedIn copy or chanmeng.org page; the organisation has no logo on purpose, so the README organisation band skips it. Since 2026-10-15 it is told in [[stories/lyzen-website]], and nowhere else |
| Seismophone: [[projects/sunostats]] | Pending archive; off every visitor-facing surface and `cv-llms.txt` since 2026-10-07 | The site stays online at Chan's request. The Suno probe and the README Suno cards are independent of it |
| Chromaflow: [[projects/gradient-svg-generator]] | Off every visitor-facing surface since 2026-10-07; no longer maintained (Chan, 2026-10-12) | Keeps its narrative in the llms files through `llmsOnlyOpenSourceIds`. No surface may say it powers this profile |
| Te Pā Tiaki: [[projects/css-tower-defense]] | Archived 2026-10-07, deployment retired | Off every display bucket (the guard comment in its shard); the public repo link stays |

## Shown in named places only

| Entry | Where it is shown | Where it is not |
|---|---|---|
| Music videos: [[projects/october-rain-february-line-mv]], [[projects/anti-marriage-universe-mv]], [[projects/memory-amber-2022-mv]], [[projects/solo-coffee-mv]] and their fourteen films (collections [[filmCollections/october-rain-february-line]], [[filmCollections/anti-marriage-universe]], [[filmCollections/memory-amber-2022]], [[filmCollections/a-coffee-for-one]]) | YouTube, chanmeng.org/films, and poster tiles on the README film wall (added 2026-10-10, Chan's call) | No project card, CV, LinkedIn copy or other page of the site. The repos are private, so there are no repo links |

## Off one surface, still recorded elsewhere

| Entry | Off | Decision |
|---|---|---|
| [[projects/server-google-jobs]] | README, since 2026-10-08 | A second MCP server repeats Google News. Keeps its llms narrative |
| [[projects/github-readme-suno-cards]] | README, since 2026-10-08 | The "Sound I make" block already shows the cards. Keeps its llms narrative and has a card on chanmeng.org |
| [[films/archlang-demo]] | chanmeng.org/films | Its shard records it as made to accompany the paper, not a promo |
| Podcasts: [[publications/decoding-the-future-podcast]], [[publications/future-turing-podcast]], [[publications/praxis-and-pages-podcast]] | Every surface, since 2026-07 | Discontinued; the data entries stay |

## Limits

- This lists what the shards record. Things kept out of the data altogether (third-party
  assessment repos, clones of other people's repos, org repos outside the allowlist) are
  covered by docs/STATE.md § Display rules and have no entries to link.
- YouTube visibility is per video and is recorded in the `youtube/` register, not here.
- Every entry with a guard comment or a hiding flag, not only projects, is listed in the
  local generated view `wiki/guards.md` (`npm run build:wiki`).
- When Chan changes one of these rules, docs/STATE.md changes first; then mark this answer
  superseded and file a new one.
