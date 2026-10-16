---
paths:
  - "data/profile/20-projects-flagship.yaml"
  - "data/profile/21-projects-oss-primary.yaml"
  - "data/profile/22-projects-oss-webapps.yaml"
  - "data/profile/23-projects-oss-more.yaml"
  - "data/profile/60-network.yaml"
  - "data/profile/90-meta.yaml"
---

# Rules for projects and the README buckets

Sources are `file:line` as of 2026-10-16. If a line has drifted, grep the quoted phrase.

## Which shard a project goes in
Derived from current membership 2026-10-16; Chan may overrule.
- The shard does not change any output. The loader concatenates 20 → 23 into one `projects` list and `scripts/build.mjs:146-148` sorts it by `priority`. What is shown comes from the `90-meta.yaml` buckets and `tier`, never from the file.
- The header titles ("flagship band", "primary band", "web applications", "AI / creative / …") are 2026-07 README bands and no longer describe the contents. Example: `archlang` and `archcanvas`, the two flagship cards, live in `23`.
- Add a new project at the end of `23-projects-oss-more.yaml`. Every project added since 2026-08 is there (archlang, a11y-loop, the skills, the music videos, genlab-career-academy).
- Do not move an existing entry between shards: the diff is noise and nothing changes.

## README buckets (`meta.x_brand`)
- The `*ProjectIds` lists are the single source of truth for the README and for the "Notable Open Source" block of llms.txt and llms-full.txt (`90-meta.yaml:341-343`). Order in a list is display order (`:427`).
- Buckets today: `flagshipProjectIds` (`:253`), `spotlightProjectIds` (`:262`, focus set for summaries, not a README band), `clientCardProjectIds` (`:403`), `commissionedProjectIds` (`:417`), `aiAgentProjectIds` (`:431`), `openSourceCraftProjectIds` (`:466`), and the `more*` lists (`:468-471`), which stay empty on purpose (`:371-373`).
- `clientCardProjectIds` holds `provenance: client` work only (`:386-387`).
- A sub-project gets no bucket. It rides as a "Sub-projects I built solo" link on its parent card through the parent's `relatedProjectIds` (`:408-413`).
- `commissionedProjectIds` counts as displayed: `engagementRoles[].proofProjectId` must point into a displayed bucket or the build fails (`:414-416`).
- Leaving every bucket keeps a project in llms-full.txt and `dist/profile.json` as a long-tail line, but not in llms.txt (`:378-381`).
- **Keeping the llms narrative.** Taking a project off the README can drop its narrative, because `_openSourcePrimary` in `build.mjs` is derived from the buckets. To keep it, add the id to `llmsOnlyOpenSourceIds` (`:432-441`, value at `:443`).
- `tier: flagship` is auto-selected into `public/cv-llms.txt` (`docs/STATE.md`, GenLAB row). A hidden project never gets that tier.

## Ids that must not return to a display bucket
- `server-google-jobs` (`:428-430`), `gradient-svg-generator` (`:451-455`, and `21-projects-oss-primary.yaml` guard above its entry), `sunostats` (`:456-459`), `css-tower-defense` (`:460-461`).
- `github-readme-suno-cards` left on 2026-10-08 (`:462-465`); it stays off the README (`docs/STATE.md`).
- `genlab-career-academy`: no bucket, never flagship (guard above its entry in `23`). `lyzen-website`: not shown (guard above its entry in `22`).
- The four `*-mv` music-video projects: no card, no bucket (`docs/STATE.md`, Music videos row).

## Cards and partner logos
- The partner-logo line on a card comes from `organizations[].meta.x_brand.relatedProjectId`, not `projects[].clientOrgId` (`90-meta.yaml:396-401`). The org's `logo:` file must exist, or the card silently falls back to prose. Several orgs may name one project; they render in `60-network.yaml` file order.
- A project with an animated card prints no description beside it; one without a card keeps its text (`docs/STATE.md`; `templates/partials/project-cards.hbs:30-34`).
- A project shown on chanmeng.org shows its film or its animated card, never a still alone; if it has neither, a card gets made (`docs/STATE.md`). Card rules: `.claude/rules/readme-art.md`.
- "Featured by" / "Listed on" lines come from `meta.x_brand.proofStrips`, each backed by a row in that project's `reach` register (`docs/STATE.md`).

## Narrative copy
- Copy limits (no pricing, no dev stats, no private-repo links) are in `CLAUDE.md`. The CORDE commit share is a decided exception, with its basis stated (`docs/STATE.md`, CORDE row).
- A private repo is recorded without `repoUrl`, with a guard that says why (example `20-projects-flagship.yaml:35`).
