# How to update `data/profile.yaml`

`data/profile.yaml` is the only file you edit. Everything else (README, llms.txt, llms-full.txt, dist/profile.json) is generated.

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

Add a new entry to `work[]`. Required: `id` (lowercase, hyphenated), `name`, `position`. Use `endDate: null` for current roles.

```yaml
work:
  - id: new-company
    name: New Company
    position: Senior Engineer
    startDate: "2026-04"
    endDate: null
    location: Remote
    url: https://example.com/
    logo: /public/experience/new-company-logo.svg
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

Add to `projects[]`. Flagships have `priority: 1-4`. Open source has `priority: 5+`.

```yaml
projects:
  - id: my-new-project
    name: My New Project
    priority: 5
    category: ai-apps     # web-apps | ai-apps | creative | ml-research | branding | games
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

To promote a project to flagship status, change its `priority` to 1-4 *and* add its `id` to `meta.x_brand.flagshipProjectIds` in the order you want it displayed.

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
# edit data/profile.yaml ...
npm run check
git add data/profile.yaml README.md llms.txt llms-full.txt dist/profile.json
git commit -m "feat(data): expand Tam-AI-Ti narrative with Q1 outcomes"
git push -u origin update-tam-ai-ti-narrative
# open PR — validate-data.yml gates merge
```

After merge to main, `build-readme.yml` runs again as a safety net to ensure outputs are in sync.
