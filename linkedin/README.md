# `linkedin/` — LinkedIn profile copy & visuals

Everything for Chan Meng's LinkedIn profile in one place: a structured **source-of-truth JSON**, the
**human-readable markdown** generated from it, and the **profile visuals**.

## Source of truth

[`linkedin-profile.json`](./linkedin-profile.json) is the single structured store for all LinkedIn
section copy. It is a faithful snapshot of the **live LinkedIn page** (text finalised and confirmed
by Chan), with one object per section: `banner`, `about`, `services`, `featured`, `experience`,
`education`, `licensesAndCertifications`, `projects`, `volunteering`, `honorsAndAwards`,
`publications`. Facts trace back to [`../data/profile/`](../data/profile/); live-only details
(engagement stats, credential IDs, media captions) are captured in the JSON.

## Generated markdown — kept in sync

The per-section `.md` files are **generated from the JSON** by
[`../scripts/build-linkedin-md.mjs`](../scripts/build-linkedin-md.mjs) and carry a "DO NOT EDIT BY
HAND" banner. Edit the JSON, then regenerate:

```
node scripts/build-linkedin-md.mjs
```

| File | LinkedIn section | Entries |
|------|------------------|---------|
| [`linkedin-banner.md`](./linkedin-banner.md) | Banner / Intro (name, headline, location) | — |
| [`linkedin-about.md`](./linkedin-about.md) | About | 7 blocks + top skills |
| [`linkedin-services.md`](./linkedin-services.md) | Services | overview + 4 services |
| [`linkedin-featured.md`](./linkedin-featured.md) | Featured | 3 links |
| [`linkedin-experience.md`](./linkedin-experience.md) | Experience | 14 positions / 12 companies |
| [`linkedin-education.md`](./linkedin-education.md) | Education | 3 |
| [`linkedin-licenses-and-certifications.md`](./linkedin-licenses-and-certifications.md) | Licenses & certifications | 51 |
| [`linkedin-skills.md`](./linkedin-skills.md) | Skills | 97 |
| [`linkedin-projects.md`](./linkedin-projects.md) | Projects | 15 |
| [`linkedin-volunteering.md`](./linkedin-volunteering.md) | Volunteering | 3 |
| [`linkedin-honors-and-awards.md`](./linkedin-honors-and-awards.md) | Honors & awards | 6 |
| [`linkedin-recommendations.md`](./linkedin-recommendations.md) | Recommendations (received) | 18 |
| [`linkedin-publications.md`](./linkedin-publications.md) | Publications | 12 (mirrors live page) |
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
