# How to update the profile data (`data/profile/*.yaml`)

The profile data lives as **shards** in `data/profile/` — one file per theme, merged in filename order by `scripts/lib/load-profile.mjs`. The shards are the only files you edit. Everything else (README, llms.txt, llms-full.txt, dist/profile.json, linkedin/*) is generated.

| Shard | Contains |
|---|---|
| `00-basics.yaml` | basics, builderTools |
| `10-career.yaml` | work, volunteer, education |
| `20`–`23-projects-*.yaml` | the `projects[]` list, concatenated across four files (flagship → OSS primary → web apps → the rest) |
| `25-contributions.yaml` | openSourceContributions |
| `30-recognition.yaml` | awards, certificates, publications |
| `40-skills.yaml` | skills, domains, languages, interests |
| `50-references.yaml` | references (testimonials) |
| `60-network.yaml` | organizations, collaborators |
| `70-linkedin.yaml` | the curated LinkedIn snapshot block |
| `80-events.yaml` | events — offline talks / hackathons / workshops / appearances |
| `90-meta.yaml` | meta, incl. `meta.x_brand` display config |

To locate an entry: `grep -rn "id: <slug>" data/profile/`. See the repo-root `CLAUDE.md` for the full data map and cross-reference rules.

## Quick start

```bash
npm ci           # once, to install Handlebars + js-yaml + ajv
npm run validate # schema check
npm run build    # regenerate README.md, llms.txt, llms-full.txt, dist/profile.json
npm run audit    # warn on orphaned /public/ files
npm run check    # validate + build + audit, in that order
```

After pushing your YAML edit to `main`, the `build-readme.yml` workflow rebuilds and commits the regenerated outputs automatically. So in practice you can just edit YAML and push.

## Section-by-section

### Adding a new work experience

Add a new entry to `work[]` in `10-career.yaml`. Required: `id` (lowercase, hyphenated), `name`, `position`. Use `endDate: null` for current roles.

```yaml
work:
  - id: new-company
    name: New Company
    position: Senior Engineer
    startDate: "2026-04"
    endDate: null
    location: Remote
    url: https://example.com/
    logo: /public/organizations/new-company-logo.svg
    keywords: [TypeScript, Kubernetes]
    narrative:
      companyContext: |
        What the company does and where it sits in its market.
      mission: |
        The problem the company solves and the population it serves.
      myMandate: |
        What I was hired to do. Ownership scope.
      impactDelivered: |
        Outcomes — products shipped, growth metrics, social impact.
        Include verifiable numbers with sources where possible.
      technicalHighlights: |
        Hard problems solved, framed around the impact they enabled.
```

The five narrative dimensions are mandatory in spirit but can stay empty (`""`) until you fill them in.

### Adding a new project

Add to `projects[]` in the matching `2x-projects-*.yaml` shard (flagship → `20`, OSS primary band → `21`, web apps → `22`, everything else → `23`). Flagships have `priority: 1-4`. Open source has `priority: 5+`.

```yaml
projects:
  - id: my-new-project
    name: My New Project
    priority: 5
    category: ai-apps     # web-apps | ai-apps | creative | ml-research | branding | games
    provenance: personal  # client | personal | coursework | bootcamp | hackathon — the project's KIND
    tagline: One-line description for cards
    url: https://example.com/
    repoUrl: https://github.com/ChanMeng666/my-new-project
    logo: /public/brands/my-new-project-logo.svg
    techStack: [Next.js, TypeScript]
    metrics:
      - { label: "Active users", value: "1,200+" }
    status: production
    startDate: "2026"
    publicSummary: |
      2-3 sentence summary for the README's compact card view.
    narrative:
      problem: |
        Why this exists. The user pain or market gap.
      audience: |
        Who it serves — persona, segment, scale, geography.
      productLogic: |
        How the product works at a USER level (not code).
      businessLogic: |
        Revenue model or theory of change. Why viable.
      technicalApproach: |
        Architecture and hard problems, framed around impact.
      outcomes: |
        Real-world impact with verifiable numbers and sources.
      myRole: |
        Specific scope: founder / lead engineer / etc., with evidence.
```

To promote a project to flagship status, change its `priority` to 1-4, move the entry to `20-projects-flagship.yaml`, *and* add its `id` to `meta.x_brand.flagshipProjectIds` (in `90-meta.yaml`) in the order you want it displayed.

`provenance` records the project's *kind/origin* and is independent of tier/recency/category: `client` = built for a real employer / paid commission / affiliated org; `personal` = self-initiated; `coursework` = university assignment or group-project origin; `bootcamp` = training-camp capstone (青训营 etc.); `hackathon` = built at/for a hackathon. Classify by evidence in the entry (`entity`, `relatedWorkId`, narrative), not by which `meta.x_brand.*ProjectIds` bucket it sits in. To mark a project as shuttered / 关停, set `status: archived` + `recency: deprecated` — do **not** use a provenance value for lifecycle.

To flag a project as one Chan is *actively deep-developing* (distinct from flagship = most-impressive), add its `id` to `meta.x_brand.spotlightProjectIds` in `90-meta.yaml`. The build fails if any id there does not resolve to a project.

### Adding an event (offline talk / hackathon / workshop / appearance)

Add to `events[]` in `80-events.yaml`. Events are a running log of braggable in-person activities for year-end summaries and brand copy; they **cross-reference** awards/work/projects rather than duplicating their prose. They surface in `llms-full.txt` and `dist/profile.json` (not the README) and are held to the freshness SLA like any other tiered entry.

```yaml
events:
  - id: some-conference-2026
    name: "Some Conference 2026 — Keynote"
    role: Speaker          # Speaker | Panelist | Mentor | Judge | Instructor | Organizer | Attendee
    type: talk             # talk | panel | hackathon | workshop | conference | community | award | media
    date: "2026-09-20"
    endDate: "2026-09-21"  # optional, for multi-day
    location: "Auckland, New Zealand"
    organizer: "Host Org"
    url: https://example.com/event
    tier: primary
    recency: recent
    lastUpdated: "2026-09-22"
    keywords: [AI, speaking]
    relatedAwardTitle: "..."   # optional → an awards[].title
    relatedWorkId: some-work   # optional → work[].id / volunteer[].id
    relatedProjectId: some-id  # optional → projects[].id
    summary: |
      One paragraph on what Chan did there. Cross-reference the award/role,
      don't restate it.
```

### Adding a new certificate

```yaml
certificates:
  - name: "Some Cert Name"
    date: "2026-05"
    issuer: "Issuer Name"
    url: https://example.com/verify/abc123
    credentialId: "ABC123"
    image: /public/certificates/some-cert-image.png
    category: other   # hackerrank | microsoft | other
    issuerLogo: /public/certificates/issuers/some-issuer-logo.jpg  # first cert per category only
```

### Adding a testimonial

```yaml
references:
  - name: Person Name
    reference: |
      The quoted testimonial text.
    meta:
      x_brand:
        relationship: Their title at Their company
        linkedinUrl: https://www.linkedin.com/in/their-handle/
        image: /public/recommendations/Their-Name.jpg
        featured: true  # true = shown in the visible-by-default block; false/omit = in the collapsible
```

### Adding a publication / podcast episode / press feature

```yaml
publications:
  - name: "Episode or article title"
    publisher: "Spotify"  # or Medium, WeChat, etc.
    releaseDate: "2026-04"
    url: https://example.com/...
    summary: |
      Optional summary.
    meta:
      x_brand:
        type: podcastEpisode  # article | podcast | podcastEpisode | interview | press | blog
```

### Adding a verified statistic with citation

This is the highest-leverage GEO move per Princeton's research (+40% citation rate). Add to `meta.x_brand.statisticsClaims`:

```yaml
meta:
  x_brand:
    statisticsClaims:
      - claim: "Tam-AI-Ti served 1,200 verified users in Q1 2026"
        source: https://example.com/press-release
        verifiedAt: "2026-04-30"
```

The template renders these into the README's prose when applicable.

## Schema validation

Every push triggers `validate-data.yml` on the PR. If your YAML is malformed, the PR cannot merge. Run `npm run validate` locally for fast feedback.

Common validation errors:
- **Missing `id`**: every `work[]` and `projects[]` entry needs a kebab-case `id`.
- **Bad date format**: dates are `YYYY` or `YYYY-MM` or `YYYY-MM-DD` (or `null` for current/present).
- **Bad URL**: `format: uri` requires a full `https://...` URL.

## What NOT to edit

- `README.md`, `llms.txt`, `llms-full.txt`, `dist/profile.json` — these are generated outputs. Any manual edits are lost on the next build.
- `meta.lastModified` — auto-set by CI.

## Local development

```bash
git checkout -b update-tam-ai-ti-narrative
# edit the relevant data/profile/*.yaml shard ...
npm run check
git add data/profile/ README.md llms.txt llms-full.txt dist/profile.json
git commit -m "feat(data): expand Tam-AI-Ti narrative with Q1 outcomes"
git push -u origin update-tam-ai-ti-narrative
# open PR — validate-data.yml gates merge
```

After merge to main, `build-readme.yml` runs again as a safety net to ensure outputs are in sync.
