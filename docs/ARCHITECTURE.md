# Architecture

This repository is the **first-hand, central, single source of truth** for Chan Meng's personal career data. Every output surface — the GitHub profile `README.md`, `llms.txt`, `llms-full.txt`, the canonical JSON Resume at `dist/profile.json`, and any downstream consumer like `chanmeng.org`, a Typst CV repo, or a LinkedIn rebuild — is a derived view of one YAML file.

Data flows outward only. Nothing imports into this repo from external sources.

## File map

```
.
├── data/
│   └── profile.yaml            # THE source of truth — the only file you edit
├── schema/
│   └── profile.schema.json     # JSON Schema (extended JSON Resume v1.0.0)
├── templates/
│   ├── README.md.hbs           # main README template (Handlebars)
│   ├── llms.txt.hbs            # short LLM index
│   ├── llms-full.txt.hbs       # bundled full-text dump
│   └── partials/
│       ├── jsonld-block.hbs    # hidden GEO/JSON-LD block
│       ├── hero.hbs            # section 1
│       ├── featured-work.hbs   # section 2 — flagship project cards
│       ├── project-card.hbs    # one project card
│       ├── open-source.hbs     # section 3 — primary table + categories
│       ├── experience.hbs      # section 4
│       ├── recognition.hbs     # section 5 — credentials, testimonials, more
│       ├── skills.hbs          # section 6 — pill rows
│       ├── certifications.hbs  # section 7 — 50+ certs in 3 issuer groups
│       └── footer.hbs          # section 8
├── scripts/
│   ├── build.mjs               # YAML → README, llms.txt, llms-full.txt, dist/
│   ├── validate.mjs            # ajv validates YAML against schema
│   └── audit-assets.mjs        # warns on orphans / missing /public files
├── dist/
│   └── profile.json            # canonical JSON Resume v1.0.0 artifact
├── public/                     # asset files (logos, photos, certificates, ...)
├── .github/workflows/
│   ├── build-readme.yml        # rebuild outputs on data change + daily cron
│   ├── validate-data.yml       # schema-validate PRs
│   ├── metrics.yml             # (existing) daily metrics image
│   ├── techrosie-auto-invite.yml
│   └── wakatime.yml
├── README.md                   # GENERATED — do not edit by hand
├── llms.txt                    # GENERATED
├── llms-full.txt               # GENERATED
└── robots.txt                  # crawler / AI bot policy
```

## Build pipeline

```
data/profile.yaml ──► validate.mjs ──► build.mjs ──► README.md
                                             │       llms.txt
                                             │       llms-full.txt
                                             └─────► dist/profile.json
```

1. **Load:** `js-yaml` parses `data/profile.yaml` into a plain object.
2. **Validate:** `ajv` (draft 2020-12) checks the object against `schema/profile.schema.json`. Fail-fast.
3. **Augment:** `build.mjs` adds derived state (`meta.lastModified`, `_currentRoles`, `_flagshipProjects`, `_openSourceByCategory`, `_certsByCategory`, `_jsonldProfilePagePretty`, etc.).
4. **Render:** Handlebars compiles each template with the augmented data.
5. **Emit:**
   - `README.md` — the GitHub profile page.
   - `llms.txt` — short LLM index (Howard's spec).
   - `llms-full.txt` — bundled full-text dump for LLM context-window ingestion.
   - `dist/profile.json` — clean JSON Resume v1.0.0 (strips `meta.x_brand` and the `_*` derived caches). External consumers read this from the raw URL.

## Rendering strategy — full record in, audience-tailored views out

| Surface | What it renders | Length |
|---|---|---|
| `README.md` (this repo) | Flagship cards: `tagline` + `publicSummary`. Open-source list: name + tagline + traction. | Compact |
| `chanmeng.org` project pages | Full `narrative.*` rendered as sections — problem, audience, product logic, business logic, technical approach, outcomes, role. | Long |
| Typst CV (separate repo, consumes `dist/profile.json`) | One-line bullets from `narrative.outcomes` per project; tech keywords from `techStack`. | Terse |
| `llms-full.txt` | Full `narrative.*` for every project and role. | Maximal |
| LinkedIn rebuild (manual) | About section from `basics.summary`; experience from `work[].narrative.*`. | Per-platform limits |

Templates can shorten or omit. They never add substance.

## Why YAML, not JSON

- **Multi-line prose.** Project narratives are 200-500 words each. YAML's `|` literal block keeps them readable. JSON requires `\n`-escaping.
- **Comments.** `# TODO: confirm date with Daryll` is useful editorial scaffolding.
- **Maps to JSON Resume.** The build pipeline serializes the YAML to canonical JSON Resume v1.0.0 at `dist/profile.json` for external consumers. The source-of-truth format is YAML; the public-machine-readable format is JSON.

## The single source of truth principle

- **Inbound:** nothing. No Medium API import, no LinkedIn import, no auto-sync of GitHub stars into the YAML. The user is the sole input.
- **Outbound:** everything. README, `llms.txt`, `llms-full.txt`, `dist/profile.json`, plus future Typst CV, LinkedIn rebuilds, and chanmeng.org all consume from this one file.
- **Live metrics** like GitHub stars/forks render via dynamic shields.io badges at *view time*. They never write back into `profile.yaml`.

## Adding new content

See `docs/CONTRIBUTING-DATA.md` for the per-section how-to. The short version: edit `data/profile.yaml`, commit, push. The `build-readme.yml` workflow rebuilds and force-pushes the regenerated outputs back to `main`.
