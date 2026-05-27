# Business-Impact Wave 2 — Visible README Project impactHeadlines (2026-05)

> **Purpose.** Close the second-visible-tier gap: every project rendered in the
> README's Commissioned work / AI agents & tooling / Craft & open-source tables
> should also carry a non-technical `impactHeadline`. Wave-1 covered Selected
> work (4 flagships) + 12 work entries. Wave-2 covers the remaining 8 visible
> project cards.
>
> **What changed.**
>
> 1. **Template** — `templates/partials/open-source.hbs` now renders
>    `<em>{{narrative.impactHeadline}}</em>` after the tagline in both the AI
>    agents & tooling and Craft & open-source product tables (conditional —
>    `{{#if narrative.impactHeadline}}`).
>
> 2. **Data** — Eight `impactHeadline` strings added to `data/profile.yaml`:
>    - **Commissioned** (3): `eatropolis-website`, `her-waka`, `free-period-website`
>    - **AI agents & tooling** (4): `fanfic-lab`, `vitex`, `femtracker-agent`, `echook`
>    - **Craft & open-source** (1): `github-readme-suno-cards`
>
> 3. **Schema** — No change. `narrative.impactHeadline` already in schema (added
>    in wave-1).
>
> **Audit correction.** Wave-1's initial estimate of "~19 primary projects need
> backfilling" was inaccurate — that audit conflated `projects[]` ids with
> `organizations[]`, `collaborators[]`, and `volunteer[]` ids. The true picture:
>
> | Tier | Total | Complete | None |
> |---|---|---|---|
> | flagship | 4 | 4 | 0 |
> | primary | 23 | **23** | 0 |
> | secondary | 12 | 0 | 12 |
> | archive | 33 | 0 | 32 |
>
> **All flagship + primary projects already have complete 7-field narrative.**
> The remaining gap (secondary + archive, 44 projects) lives in the
> low-visibility `<details>` "More projects" section, so backfilling those is
> wave-3 candidate work, not wave-2 priority.
>
> Wave-2 specifically targets the **8 projects that are visible in the README
> main flow but were missing impactHeadline** — by far the highest ROI work
> after wave-1.

---

## 已合并的 8 条 impactHeadline

### Commissioned work（3 条）

| ID | impactHeadline |
|---|---|
| `eatropolis-website` | Production culinary-festival event site for Auckland's Eatropolis — engineered for 1,000 concurrent visitors, WCAG 2.2 AA-compliant with council review gates, delivered solo in 9 days under a signed NZD $3,000 fixed-fee contract. |
| `her-waka` | Employment-readiness teaching platform built for the She Sharp × NZ Ministry of Social Development HER WAKA programme at academyEX Auckland — 4 workshops authored solo + 8+ self-paced tutorials across three difficulty tiers. |
| `free-period-website` | Bilingual period-poverty advocacy site for a Guangzhou HKUST(GZ)-incubated startup — integrated Google Maps dispenser directory helping end-users locate menstrual-access resources in underserved markets. |

### AI agents & tooling（4 条）

| ID | impactHeadline |
|---|---|
| `fanfic-lab` | Adaptive LangGraph agent for Chinese fanfiction creators — 7-node quality-loop graph over a hand-curated Honkai: Star Rail canon + pgvector RAG, plus a follower/comment/recommendation community shipped as a $12/month two-service Docker stack. |
| `vitex` | AI career agent that generates a tailored ATS-optimised resume + cover letter in ~30 seconds from a job description and free-text background — 7-step Vercel AI SDK pipeline, Typst local PDF compile under 100 ms, on its third production architecture. |
| `femtracker-agent` | 8-agent women's-health companion merged into CopilotKit's official demos_2025 — intelligent routing across specialists, WHO-standard scoring, 90%+ Redis cache hit rates, publicly thanked by CopilotKit maintainers as a reference implementation. |
| `echook` | Audio-feedback hook system for Claude Code / Cursor / Codex — 26 hook events, 2 themes, context-window status line with quota bars, 42 releases, 139 tests on triple-platform CI, plus a Remotion-built promo video shipped entirely in code. |

### Craft & open-source products（1 条）

| ID | impactHeadline |
|---|---|
| `github-readme-suno-cards` | GitHub Marketplace Action for Suno music cards — CJK-safe animated SVG with 12 design combinations, parses three ID formats, shares a Valibot kernel with SunoStats analytics, extracted from monorepo as a clean MIT-licensed release. |

---

## Verification

- `npm run validate` ✅ (all 8 within 280-char maxLength)
- `npm run build` ✅
- README.md regenerated; all 8 entries now show `<em>` impact line under tagline

## Status

Auto-applied per user's "按推荐方式进行" directive. If any headline needs
revision, mark and reply — Claude will swap in profile.yaml.

## Wave-3 candidates

- Secondary tier (12 projects, all 0 narrative) — for completeness, lower visibility
- Archive tier (32 projects, all 0 narrative) — lowest priority, mostly historical
- **A4 Crimson/Aotearoa Infinite Academy** broader narrative refresh — user
  flagged in wave-1 with reference to `C:\Users\0\Downloads\Crimson Academies`.
  Current entry is `tier: secondary` but actual work (multi-tenant LMS for
  EMI+AIA on Firebase DataConnect + Cloud SQL, ChurConf 2025 talk) merits
  `tier: primary`. Plus a separate `projects[]` entry for `infinite-lms` repo
  may be warranted.
