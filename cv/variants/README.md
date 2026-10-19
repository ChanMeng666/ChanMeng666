# ATS resume variants (tier-matched)

Five two-page ATS resumes cut from `cv/chan-meng-cv-ats.typ` for the job-search tiers in the private
`nz-job-immigration-strategy` repo (tk-032, dec-034). Same hard rules as the base ATS resume
(`cv/README.md` "ATS variant — hard rules"); same helpers (`cv/ats-components.typ`).

Positioning (2026-10-18, dec-035 in the strategy repo): **product & full-stack AI engineer with founder
experience** — aimed at intermediate-to-senior individual-contributor roles in New Zealand and at
early-stage founding / product engineer roles for overseas remote teams. Headlines carry no seniority
word, so one file serves both intermediate and senior postings.

| Variant | Headline | Use for |
|---|---|---|
| `product-engineer` | Product & Full-stack AI Engineer, founder experience | NZ intermediate–senior product / full-stack roles; overseas early-stage product and founding engineer roles |
| `applied-ai` | Applied AI & Full-stack Engineer: LLM applications, agents, MCP | NZ and remote applied AI / agent roles with real software delivery |
| `frontend-platform` | Frontend & Full-stack Engineer, accessibility (WCAG 2.2) | Frontend and design-system roles |
| `platform` | Platform Engineer: Go, Kubernetes (GKE), Google Cloud | Platform / DevOps / SRE roles with engineering duties |
| `solutions-fde` | Forward-Deployed & Founding Product Engineer | Solutions / FDE roles; overseas early-stage founding roles that are customer-facing |

## Rules

- **No new facts.** Every title, date, metric, employer and project comes from the base ATS resume or
  `data/profile/*.yaml`. Variants only re-order, re-weight and re-word.
- **Credibility fixes vs the base:** the overlapping 2025-2026 remote roles sit in one grouped block
  (real title and dates per org); verifiable artefacts lead; no "five concurrent roles" line.
- **No engagement-type labels** (no "full-time", "contract", "volunteer", "internship" tags on roles).
- **Scope first.** The first bullet of every full role opens with `Scope:` — solo or team size, who she
  reported to, and users where the SSOT records them (e.g. "one of two developers", "sole engineer",
  "wrote 471 of 488 commits"). Readers calibrate the title from the scope; never add a number the SSOT
  does not hold.
- **Truthful titles, with the programme named.** Titles stay as in `10-career.yaml`. ByteDance is shown as
  "Backend Developer — Youth Training Camp" (a training programme, matching `work[bytedance].position`);
  CopilotKit appears only as an open-source contribution (2 merged, maintainer-approved pull requests),
  never as employment.
- Not covered by `scripts/check-cv-sync.mjs` or the `.docx`/`.txt` exporter: when a title or date
  changes in `10-career.yaml`, grep `cv/variants/` as well.
- Outputs go to `cv/variants/exports/` (never `public/`, never web-served). Nothing here touches the
  site sync.

## Build

```sh
typst compile --root . --font-path cv/fonts cv/variants/<variant>.typ cv/variants/exports/chan-meng-cv-<variant>.pdf
pdfinfo cv/variants/exports/chan-meng-cv-<variant>.pdf | grep Pages   # must be 2
```
