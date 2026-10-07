# `linkedin/` — LinkedIn: account register, profile copy and visuals

Everything for Chan Meng's LinkedIn presence
(**[linkedin.com/in/chanmeng666](https://www.linkedin.com/in/chanmeng666/)**) in one place: the
**register of the account and every post**, the **profile copy** and the **profile visuals**.
Only three kinds of file here are edited by hand: `account.yaml`, `curation.yaml` and
`capture/snippet.js`. Everything else is generated or captured.

Two pages are registered, each in its own folder with the same files:

| Page | Folder |
|---|---|
| Her profile, [linkedin.com/in/chanmeng666](https://www.linkedin.com/in/chanmeng666/) | `linkedin/` |
| The ArchCanvas company page, [linkedin.com/company/archcanvas](https://www.linkedin.com/company/archcanvas/) | [`linkedin/company/archcanvas/`](./company/archcanvas/) |

A new company page is one line in `REGISTERS` at the top of
`scripts/build-linkedin-register.mjs`, a capture, and an `account.yaml`.

## The account register

To understand how a page is run, read in its folder, in this order:

1. [`account.yaml`](./account.yaml): reach, how the account has been run so far, and
   `openItems`, what was noticed at the last capture.
2. [`posts.yaml`](./posts.yaml): the `summary` block (volume by month and year, formats,
   engagement, hashtags, who is mentioned and reshared, the posts with the most reactions),
   then one line per post, newest first, and the plain reposts.
3. [`posts/<year>.yaml`](./posts/): every post in full (text, link card, media, mentions,
   hashtags, counts). Open the year you need; `grep` the `id` from the index.
4. `posts.private.yaml`, when present: impressions per post and their summary. Local only.

Rules:

- **The post files are generated.** `npm run build:linkedin-register` rebuilds them from
  [`capture/latest.json`](./capture/latest.json). Never edit them.
- **Tags go in `curation.yaml`**, keyed by post id: `"<id>": { topic, projectIds, flags, note }`.
  Every post was read and tagged on 2026-10-08. Chan delegated the tagging, so the tags are
  Claude's and she may overrule any of them. Tag new posts the same way after a capture.
  `projectIds` must exist in `data/profile/` and `topic` must be one of the ten below, or the
  build fails. A post with no line gets no topic, and its projects are found by rule (a
  project's name, site or repo appearing in the post).
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
- **Counts are historical maximums**, as everywhere in this repo: a rebuild never lowers a
  post's reactions, comments, reposts or impressions, and `followers` is never lowered by hand.
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
- **`npm run check:linkedin-register`** (part of `npm run check`) fails when a post file is
  stale against the capture or `account.yaml` disagrees with it. It reads files only and never
  contacts LinkedIn.

### Refreshing the register

**Use the `linkedin-sync` skill** (`.claude/skills/linkedin-sync/`): ask Claude Code to "sync my
LinkedIn posts". It carries these steps, a script that saves the capture, and the things that
went wrong before. The steps, for reference:

There is no API key in this repo and none is needed: the read happens in Chan's own signed-in
browser, and everything after that is a pure function of files.

1. Open the page signed in as her (Claude in Chrome, a new tab):
   `https://www.linkedin.com/in/chanmeng666/recent-activity/all/` for the profile,
   `https://www.linkedin.com/company/archcanvas/posts/?feedView=all&viewAsMember=true` for the company page. The
   snippet reads which one it is from the address.
2. Run [`capture/snippet.js`](./capture/snippet.js) in the page. It asks LinkedIn's web API for
   the activity feed twenty updates at a time, pausing between pages (about a minute for 320
   updates), and returns `"started"`. It changes nothing on LinkedIn and sends nothing anywhere.
   Ask for `window.__liStatus` until it shows `complete: true`.
3. Save the two results. Through Claude in Chrome the tool cuts strings at about 1,000
   characters, so use the clipboard: click once on the page to focus it, run
   `await window.__liCopy("public")`, then write the clipboard to that page's `capture/latest.json`
   (PowerShell: `Get-Clipboard -Raw`, UTF-8 without BOM, LF line ends). Click the page again
   (the terminal took the focus), run `await window.__liCopy("private")` and write
   `capture/latest.private.json` (the profile only; a page capture has no private half).
   Clear the clipboard afterwards.
4. Update `account.yaml` (`asOf`, `followers` if higher, the headline if it changed).
5. Add a line to `curation.yaml` for each new post, then `npm run build:linkedin-register`
   (it builds every page). Read the notes it prints.
6. Commit `capture/latest.json`, `curation.yaml`, `posts.yaml`, `posts/` and `account.yaml` together.

A post that has gone from LinkedIn stays in the register, marked `deletedSeen`. A capture that
did not reach the end of the feed fails the build instead of being read as deletions.

One capture of the profile is seventeen requests at reading pace; the company page is three. Do not loop it or run it on a schedule:
refresh after a posting session or before a review, and no more often than that.

## Profile copy

**Every `linkedin-*.md` file and `linkedin-profile.json` is generated.** They are not a source
of truth: edit the data shards, then build.

## Source of truth — NOT this directory

The copy lives in [`../data/profile/70-linkedin.yaml`](../data/profile/70-linkedin.yaml) (the
`linkedin:` block), with three facts injected from elsewhere at build time:

| Copy | Lives in |
|------|----------|
| Headline, name, pronouns | `../data/profile/00-basics.yaml` (`basics.headline`) |
| Recommendation body text | `../data/profile/50-references.yaml` (`references[].reference`) |
| Role titles + date ranges | `../data/profile/10-career.yaml` (`work[].position`, dates) |
| Everything else | `../data/profile/70-linkedin.yaml` |

The pipeline was **inverted on 2026-06-04** (see
[`../data/_intake/linkedin-reconcile-wave-1-2026-06.md`](../data/_intake/linkedin-reconcile-wave-1-2026-06.md)):
`linkedin-profile.json` used to be the hand-maintained record and is now a build artifact.

## Build

```
npm run build:linkedin   # yaml → linkedin-profile.json → the .md files
npm run validate         # includes scripts/check-linkedin-sync.mjs
```

`scripts/build-linkedin-json.mjs` emits `linkedin-profile.json`; `scripts/build-linkedin-md.mjs`
reads that JSON and emits the per-section `.md` files, which carry a "DO NOT EDIT BY HAND" banner
and wrap each block in a fenced code block for copy-pasting into LinkedIn. CI runs the build and
then `git diff --quiet`, so the regenerated outputs must be committed alongside any shard edit.

| File | LinkedIn section | Entries |
|------|------------------|---------|
| [`linkedin-banner.md`](./linkedin-banner.md) | Banner / Intro (name, headline, location) | — |
| [`linkedin-about.md`](./linkedin-about.md) | About | 5 blocks + 5 top skills |
| [`linkedin-services.md`](./linkedin-services.md) | Services | overview + 4 services |
| [`linkedin-featured.md`](./linkedin-featured.md) | Featured | 6 links |
| [`linkedin-experience.md`](./linkedin-experience.md) | Experience | 15 positions / 13 companies |
| [`linkedin-education.md`](./linkedin-education.md) | Education | 3 |
| [`linkedin-licenses-and-certifications.md`](./linkedin-licenses-and-certifications.md) | Licenses & certifications | 51 |
| [`linkedin-skills.md`](./linkedin-skills.md) | Skills | 95 |
| [`linkedin-projects.md`](./linkedin-projects.md) | Projects | 15 |
| [`linkedin-volunteering.md`](./linkedin-volunteering.md) | Volunteering | 3 |
| [`linkedin-honors-and-awards.md`](./linkedin-honors-and-awards.md) | Honors & awards | 6 |
| [`linkedin-recommendations.md`](./linkedin-recommendations.md) | Recommendations (received) | 26 |
| [`linkedin-publications.md`](./linkedin-publications.md) | Publications | 11 (mirrors live page) |
| [`linkedin-languages.md`](./linkedin-languages.md) | Languages | 4 |

## `linkedin-services/` — rendered profile visuals

The image assets you upload to LinkedIn — the profile **cover**, the six **testimonial cards**, and
the three **Featured CTA cards** — live in [`linkedin-services/`](./linkedin-services/) as HTML
sources plus their exported PNGs. Re-render with `node scripts/export-linkedin-cards.mjs` (Playwright
screenshots at 2×). The HTML pulls headshots and the logo from `../../public/recommendations/` and
`../../public/brands/`, so those sibling `public/` folders must stay where they are.

## Notes

- **Experience/projects skills** — LinkedIn truncates the displayed skill list on each entry
  (`X, Y and +N skills`). Those entries record the visible skills plus `moreSkillsCount`.
- **Skills section** — the standalone `skills` block mirrors the live "All" view (97 skills in
  display order), each with its associated experiences/projects/certificates and endorsement signals.
  Per-skill category is not recorded (the "All" view doesn't expose it); the tab names are in
  `skills.categories`.
- **Recommendations** — received recommendations only (18), captured verbatim including bilingual
  (Chinese + English) text; each carries the recommender's `profileUrl`.
- **Links** — live profile links are captured throughout: `banner.websiteUrl`, `featured[].url`,
  per-company `experience[].links`, `education[].url`, `licensesAndCertifications[].credentialUrl`
  (50 of 51 — the Southern Cross finisher has no "Show credential"), `volunteering[].url`,
  `honorsAndAwards[].links`, `publications[].url`, and `recommendations.received[].profileUrl`.
  Certificate "Show credential" links are the real targets, decoded out of LinkedIn's
  `/safety/go/?url=…` redirect wrappers.
- **Publications** mirrors the live Publications section (12, newest first). The 3 flagship LinkedIn
  Pulse technical articles from the earlier curated draft are not on the live page and are omitted.
- **Honors** are in live display order; all six (incl. UN CSW 69 Speaker) are on the live profile,
  captured verbatim. Note **FemTech Weekend and FemTech China are distinct organisations** — the
  Excellence Award (Dec 2024) is issued by FemTech China, the Outstanding Performer award (Mar 2025)
  by FemTech Weekend; all `issuer`/`associatedWith` values are taken exactly as the live page shows.

## Editing rules

1. **Section copy** → edit [`linkedin-profile.json`](./linkedin-profile.json), then run
   `node scripts/build-linkedin-md.mjs`. Never hand-edit the generated `.md` files.
2. **Underlying facts** → fix [`../data/profile/`](../data/profile/) first (it is the
   repository-wide source of truth), then reflect the change in the JSON here.
3. **Visuals** → edit the HTML in `linkedin-services/`, then run `node scripts/export-linkedin-cards.mjs`.
