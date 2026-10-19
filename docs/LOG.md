# Log

The chronology of this knowledge base: decisions, facts, display rules, entries added or removed. Append-only, newest at the bottom; never edit or delete a past entry, add a correcting one.
Format: `## [YYYY-MM-DD] <verb> | <subject>`, verb one of decide, add, change, remove, archive, ingest, fix, build; then one line naming the file(s) touched.
Append the entry in the same commit as the change. Wording states decisions, not motives; nothing from a private file.
Latest entries: `grep "^## \[" docs/LOG.md | tail -5`.

## [2026-10-07] decide | ArchCanvas and ArchLang stay in development as her own product
docs/STATE.md (from STATE.md)

## [2026-10-07] remove | Seismophone (`sunostats`) off every visitor-facing surface and cv-llms.txt; pending archive, site stays online
docs/STATE.md, data/profile/90-meta.yaml (from STATE.md)

## [2026-10-07] remove | Chromaflow (`gradient-svg-generator`) off every visitor-facing surface; keeps its llms narrative
docs/STATE.md, data/profile/90-meta.yaml (from STATE.md)

## [2026-10-07] archive | Te Pā Tiaki (`css-tower-defense`) archived and its deployment retired
docs/STATE.md, data/profile/23-projects-oss-more.yaml (from STATE.md)

## [2026-10-07] decide | GAVIGO copy limited to its three approved figures with the boundary note; programmes are participation, not validation
docs/STATE.md (from STATE.md)

## [2026-10-07] decide | YouTube video visibility set by Chan per video
youtube/channel.yaml (from STATE.md)

## [2026-10-07] decide | Tagging of posts and threads delegated to Claude (also 2026-10-08); Chan may overrule any tag
x/posts.yaml, linkedin/curation.yaml (from STATE.md)

## [2026-10-08] add | CORDE on the README
data/profile/90-meta.yaml (from STATE.md)

## [2026-10-08] remove | Google Jobs MCP Server and GitHub README Suno Cards off the README; both keep their llms narrative
data/profile/90-meta.yaml (from STATE.md)

## [2026-10-09] decide | Suno lyrics tracked as a record; quoting one elsewhere is a separate decision
suno/words.yaml (from STATE.md)

## [2026-10-09] change | YouTube descriptions carry a links block
youtube/README.md, youtube/videos.yaml (from STATE.md)

## [2026-10-10] change | Films no longer embedded on the README; the film wall stands under "What I make beyond code", music videos included
public/readme/films.svg, templates/ (from STATE.md)

## [2026-10-12] decide | GenLAB Career Academy in development; on no visitor-facing surface
docs/STATE.md, data/profile/23-projects-oss-more.yaml (from STATE.md)

## [2026-10-12] decide | LYZEN company site not shown; never described as a redesign of the FemTech Weekend site; LYZEN has no logo
docs/STATE.md, data/profile/22-projects-oss-webapps.yaml, data/profile/60-network.yaml (from STATE.md)

## [2026-10-12] decide | Chromaflow no longer maintained; the repo stays public
docs/STATE.md (from STATE.md)

## [2026-10-12] decide | Posting through Chan's Chrome only with exact-text approval and a yes per post and platform
docs/STATE.md, distribution/README.md (from STATE.md)

## [2026-10-12] decide | Two films a week on LinkedIn and X, Tuesday and Thursday; music videos not posted to X or LinkedIn
distribution/plan.yaml (from STATE.md)

## [2026-10-12] decide | Third-party assessment repos and local clones of other people's repos are not recorded
docs/STATE.md (from STATE.md)

## [2026-10-12] decide | Product READMEs are one screen; cut material moves to docs/overview.md in that repo
docs/STATE.md (from STATE.md)

## [2026-10-13] change | A project shown with an animated card has no description beside it on the README
templates/partials/project-cards.hbs (from STATE.md)

## [2026-10-13] remove | README lines that restate another part of the README
templates/ (from STATE.md)

## [2026-10-13] add | DataCamp in the hero "Featured in" line
data/profile/30-recognition.yaml (from STATE.md)

## [2026-10-14] add | "Watch on YouTube" pill on a project whose product has a public film
templates/partials/project-cards.hbs (from STATE.md)

## [2026-10-14] change | "More I've built" renders each project as its own block, not a table row
templates/partials/open-source.hbs (from STATE.md)

## [2026-10-14] decide | A project on chanmeng.org shows its film or its animated card, never a still alone
docs/STATE.md (from STATE.md)

## [2026-10-15] decide | CORDE stated in its placement title, Full Stack Developer and Lead Documenter, in copy and interviews
docs/STATE.md (from STATE.md)

## [2026-10-15] decide | GenLAB may be discussed in interviews without naming the client; live site not shown until cleared
docs/STATE.md (from STATE.md)

## [2026-10-15] add | LYZEN site told in docs/stories; still on no other visitor-facing surface
docs/stories/lyzen-website.md (from STATE.md)

## [2026-10-16] add | Knowledge-base navigation layer
docs/INDEX.md, docs/LOG.md, .claude/rules/, scripts/README.md, scripts/build-kb-index.mjs, CLAUDE.md rewrite, .gitignore global private patterns

## [2026-10-16] add | show: per-surface visibility field
schema/profile.schema.json, data/profile/*.yaml, .claude/rules/data-profile.md

## [2026-10-16] add | ids for awards, certificates, productFilms; typed reference fields
data/profile/30-recognition.yaml, 45-showcase.yaml, 60-network.yaml, 70-linkedin.yaml, 80-events.yaml, scripts/validate.mjs

## [2026-10-16] add | lint-kb: leak, reference, context and provenance checks
scripts/lint-kb.mjs, package.json

## [2026-10-16] change | org context strings generated from work[] dates
data/profile/60-network.yaml, scripts/lib/org-context.mjs, scripts/build.mjs

## [2026-10-16] fix | GAVIGO org context end date Oct 2026; CORDE org context end date Oct 2024
data/profile/60-network.yaml, README.md, llms.txt, llms-full.txt

## [2026-10-16] add | metric source/asOf in the schema; backfill queued in data/_intake
schema/profile.schema.json, .claude/rules/data-profile.md

## [2026-10-16] add | wiki view (build:wiki, gitignored), wikilink check, docs/answers
scripts/build-wiki.mjs, scripts/check-wikilinks.mjs, docs/answers/, docs/stories/README.md, .gitignore, package.json

## [2026-10-16] add | project hooks: guard generated files, validate after shard edits; CI runs lint-kb and wikilink check
.claude/settings.json, .claude/hooks/, .github/workflows/validate-data.yml, CLAUDE.md

## [2026-10-16] fix | wikilink check no longer trips on the `[[wikilink]]` example the index copies from its header
scripts/check-wikilinks.mjs, docs/INDEX.md

## [2026-10-16] remove | .github/profile/README.md, a byte-identical mirror of the TechRosie org profile that rendered nowhere from this repo
.github/profile/README.md

## [2026-10-16] add | source and asOf on 92 visitor-facing and llms metrics (delegated review of data/_intake/metrics-provenance-wave-1-2026-10.md); 6 rows left for Chan
data/profile/20-projects-flagship.yaml, data/profile/21-projects-oss-primary.yaml, data/profile/22-projects-oss-webapps.yaml, data/profile/23-projects-oss-more.yaml

## [2026-10-16] remove | podcasts out of LinkedIn publications copy and the llms claim
data/profile/70-linkedin.yaml, data/profile/90-meta.yaml, data/profile/30-recognition.yaml, docs/STATE.md

## [2026-10-16] decide | blog posts on chanmeng.org are a dated record, exempt from show.site
docs/STATE.md, .claude/rules/data-profile.md, scripts/lint-kb.mjs

## [2026-10-16] fix | FemTech China award copy no longer calls the two organisations the same
data/profile/70-linkedin.yaml, docs/STATE.md

## [2026-10-16] remove | Spotify podcast rows out of basics.profiles
data/profile/00-basics.yaml

## [2026-10-16] fix | FreePeriod narrative no longer conflates FemTech China with FemTech Weekend
data/profile/10-career.yaml

## [2026-10-16] fix | FreePeriod Best Social Media Award attributed to FemTech China everywhere; the two organisations are unrelated (Chan)

## [2026-10-16] add | source and asOf on the last six visitor-facing metrics, verified in the she-sharp, gavigo and femtech-weekend-redthread repositories; lint-kb --strict-provenance is now the gate in check and CI
data/profile/20-projects-flagship.yaml, data/profile/22-projects-oss-webapps.yaml, package.json, .github/workflows/validate-data.yml, .claude/rules/data-profile.md, docs/STATE.md

## [2026-10-17] decide | The chanmeng.org digital twin is a visitor-facing surface: it reads dist/llms-twin.txt and dist/voice.json only, follows show.site and show.llms, carries no commit counts or solo shares and no contact address but hello@chanmeng.org (Chan, delegated)
docs/STATE.md, .claude/rules/twin.md

## [2026-10-17] add | data/voice.yaml, the twin's voice pack in Chan's approved public wording, validated into dist/voice.json by scripts/build-voice.mjs
data/voice.yaml, scripts/build-voice.mjs, scripts/lib/twin-guards.mjs, dist/voice.json, package.json, .claude/hooks/guard-generated.mjs, scripts/build-kb-index.mjs

## [2026-10-17] add | dist/llms-twin.txt, the twin's knowledge text built from the profile and docs/stories, with scripts/check-llms-twin.mjs as its gate (npm run build:twin, npm run check:twin)
scripts/build-llms-twin.mjs, scripts/check-llms-twin.mjs, dist/llms-twin.txt, package.json

## [2026-10-17] add | Save Me a Little of Today (把今天留一小块给我): music video, repo a-little-of-today-mv, on YouTube (fgIGrYIczxc), chanmeng.org/films and the README film wall
data/profile/23-projects-oss-more.yaml, data/profile/46-films.yaml, docs/ecosystem/lineage.yaml, youtube/channel.yaml, scripts/readme-art/assets/films/save-me-a-little-of-today.jpg

## [2026-10-17] decide | Music videos may also be published on bilibili, starting with Save Me a Little of Today (Chan)
docs/STATE.md

## [2026-10-17] add | Liu Zhongjing in Watercolour: ten explainer films, repo lzj-watercolor-films, on chanmeng.org/films only (new film kind explainer, collection kind explainer-series)
data/profile/23-projects-oss-more.yaml, data/profile/46-films.yaml, docs/ecosystem/lineage.yaml, docs/STATE.md, distribution/plan.yaml, schema/profile.schema.json, scripts/check-ecosystem.mjs, scripts/build-films-data.mjs

## [2026-10-17] add | Liu Zhongjing explainer films: four more watercolour films (fourteen) and a new repo lzj-history-maps (eleven map documentaries), on chanmeng.org/films and YouTube (all 25 uploaded by Chan)
data/profile/23-projects-oss-more.yaml, data/profile/46-films.yaml, docs/ecosystem/lineage.yaml, docs/STATE.md, distribution/plan.yaml

## [2026-10-17] update | YouTube ids for the 25 Liu Zhongjing explainer films, now public on the channel
data/profile/46-films.yaml, youtube/channel.yaml, youtube/videos.yaml

## [2026-10-17] update | YouTube playlists: three new public playlists (Liu Zhongjing films, Product shorts, Community & events), so every public video is in exactly one
youtube/channel.yaml

## [2026-10-19] add | AI Product Manager Skill (`ai-product-manager-skill`), public repo created 2026-10-16: project entry (tier secondary, no README bucket) and lineage row
data/profile/23-projects-oss-more.yaml, docs/ecosystem/lineage.yaml

## [2026-10-19] decide | AI Product Manager Skill (`ai-product-manager-skill`) off the README and chanmeng.org, no animated card; lineage positioning, stage (maintained) and showcase (listed) set by Claude on her delegation (q52)
docs/STATE.md, data/profile/23-projects-oss-more.yaml, docs/ecosystem/lineage.yaml

## [2026-10-19] fix | Paige Afanu's LinkedIn URL is now /in/paige-afanu-7b9367110/ (the old peju-afanu vanity redirects there)
data/profile/50-references.yaml, data/profile/60-network.yaml, data/profile/70-linkedin.yaml
