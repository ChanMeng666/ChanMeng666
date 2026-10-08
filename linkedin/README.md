# `linkedin/` — LinkedIn: account register, profile copy and visuals

Hand-edited here: `account.yaml`, `curation.yaml`, `capture/snippet.js` and the HTML in
`linkedin-services/`. Everything else is generated or captured.

| Page | Folder |
|---|---|
| Her profile, [linkedin.com/in/chanmeng666](https://www.linkedin.com/in/chanmeng666/) | `linkedin/` |
| The ArchCanvas company page, [linkedin.com/company/archcanvas](https://www.linkedin.com/company/archcanvas/) | [`linkedin/company/archcanvas/`](./company/archcanvas/) (same files) |

## The account register

Read a page's folder in this order: `account.yaml` (reach, how the account has been run,
`openItems`), `posts.yaml` (the `summary` block, then one line per post), `posts/<year>.yaml`
(full text; `grep` the `id`), and `posts.private.yaml` when present (impressions, local only).

To bring it up to date, use the **`linkedin-sync` skill** (`.claude/skills/linkedin-sync/`): it
is the whole procedure, including adding a company page. Refresh after a posting session or
before a review, no more often; never loop or schedule the capture.

Rules:

- **The post files are generated** by `npm run build:linkedin-register` from
  `capture/latest.json`. Never edit them.
- **Tags go in `curation.yaml`**, keyed by post id: `"<id>": { topic, projectIds, flags, note }`.
  Every post was read and tagged on 2026-10-08. Chan delegated the tagging, so the tags are
  Claude's and she may overrule any of them. `projectIds` must exist in `data/profile/` and
  `topic` must be one of the ten below, or the build fails. A post with no line gets no topic,
  and its projects are found by rule (a project's name, site or repo appearing in the post).
- **`topic` is why the post exists**, one per post:

  | Topic | The post is |
  |---|---|
  | `launch` | announcing or releasing her own project, product, feature or version |
  | `build-log` | how something was built, a technical lesson, an investigation |
  | `client-work` | work delivered for a client, employer or organisation |
  | `event` | an event, hackathon, workshop or talk she attended, spoke at, volunteered at or hosted |
  | `career` | a new position, certificate, award, recognition or milestone |
  | `community` | mentoring, teaching, cohorts, advocacy, thanking people |
  | `writing` | her own article, newsletter issue, podcast episode or recorded talk |
  | `boost` | someone else's post, job, event or product passed on with her comment |
  | `reflection` | a personal reflection, an opinion, a way of living |
  | `other` | none of these |
- **`account.yaml` is hand-maintained and checked.** The build fails when its name, headline,
  `asOf` or follower count disagree with the capture.
- **Counts are historical maximums**: a rebuild never lowers a post's reactions, comments,
  reposts or impressions, and `followers` is never lowered by hand.
- **Public and private are kept apart.** Reactions, comments and reposts are on the public
  page and are tracked. Impressions are shown to the author only: they live in
  `capture/latest.private.json` and `posts.private.yaml`, both gitignored. Never copy a figure
  from them into a tracked file, a commit message or generated output. No messages, drafts,
  analytics exports or connection lists in this folder, tracked or not.
- **`flags` and `openItems` are observations, not instructions.** Editing or deleting a post
  and changing the profile are Chan's decisions. Ask before doing any of them.
- **Not in the register:** her comments on other people's posts and her reactions. A company
  page's register has no impressions: LinkedIn's feed carries them for a member's own posts
  only.
- A post that has gone from LinkedIn stays in the register, marked `deletedSeen`. A capture
  that did not reach the end of the feed fails the build instead of being read as deletions.

## Profile copy

**Every `linkedin-*.md` file and `linkedin-profile.json` is generated** by
`npm run build:linkedin` (the pipeline was inverted on 2026-06-04; the JSON used to be the
hand-kept record). Edit the shards, then build:

| Copy | Lives in |
|------|----------|
| Headline, name, pronouns | `data/profile/00-basics.yaml` (`basics.headline`) |
| Recommendation body text | `data/profile/50-references.yaml` (`references[].reference`) |
| Role titles + date ranges | `data/profile/10-career.yaml` (`work[].position`, dates) |
| Everything else | `data/profile/70-linkedin.yaml` |

What the snapshot in `70-linkedin.yaml` cannot show:

- LinkedIn truncates the skill list on each experience and project entry
  (`X, Y and +N skills`). Those entries record the visible skills plus `moreSkillsCount`.
- The Skills "All" view does not expose a skill's category, so none is recorded per skill; the
  tab names are in `skills.categories`.
- Certificate links are the real targets, decoded out of LinkedIn's `/safety/go/?url=…`
  wrappers. The Southern Cross finisher has no "Show credential" link.
- FemTech Weekend and FemTech China are distinct organisations: the Excellence Award
  (Dec 2024) is FemTech China's, the Outstanding Performer award (Mar 2025) is FemTech
  Weekend's. `issuer` and `associatedWith` are taken exactly as the live page shows.

## Visuals

`linkedin-services/` holds the HTML sources and exported PNGs of the profile cover, the six
testimonial cards and the three Featured CTA cards. Edit the HTML, then
`node scripts/export-linkedin-cards.mjs`. The HTML reads headshots and the logo from
`public/recommendations/` and `public/brands/` by relative path, so those folders must stay
where they are. `screenshots/` has its own README.
