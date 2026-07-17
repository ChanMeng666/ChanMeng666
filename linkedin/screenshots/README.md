# LinkedIn project screenshots

Production screenshots of Chan's live projects, captured for manual upload to the
matching **LinkedIn → Projects** sections (one folder per project). Captured
**2026-06-16** with `scripts/capture-linkedin-screenshots.mjs` (headless Chromium,
1440×900 @ 2× retina). **Public pages only** — no logins, no gated dashboards, so
no real member/user data appears.

Re-run any project: `node scripts/capture-linkedin-screenshots.mjs <slug>`.

## File naming

- `01-home.png … 05-home.png` — homepage, scrolled top → bottom (hero first).
- `NN-route-<name>.png` — a key public sub-page (e.g. events, insights, pricing).
- `90-*.png` — an extra related site (e.g. the She Sharp member-app login screen).
- `99-fullpage.png` — full-length homepage reference (tall; for context, not a
  great LinkedIn thumbnail — prefer the `01`/`02` viewport shots for upload).

## Folder → LinkedIn project → source URL

Shot counts below reflect the hand-curated set kept after capture (redundant
shots were pruned).

| Folder | LinkedIn project | Source URL | Shots |
|---|---|---|---|
| `eatropolis/` | Eatropolis — Auckland Culinary Festival | https://eatropolis.co.nz/ | 5 |
| `sunostats/` | Seismophone (repo: sunostats) — independent observatory for AI music | https://seismophone.chanmeng.org/ (+ `/trending`) — legacy `sunostats.chanmeng.org` redirects | 5 |
| `vitex/` | Vitex — AI Career Agent SaaS | https://www.vitex.org.nz/ (+ `/pricing`) | 5 |
| `fanfic-lab/` | FanFic Lab — LangGraph HSR Co-Creation | https://fanfic-lab.tech/ (+ `/about`) | 2 |
| `she-sharp/` | She Sharp Member Platform | member-app login https://she-sharp-zeta.vercel.app/ | 1 |
| `femtech-weekend/` | FemTech Weekend Gen-2 Platform | https://www.femtechweekend.com/ (+ summit, insights, stories) | 8 |
| `programming-chanmeng/` | programming.chanmeng.org teaching platform | https://programming.chanmeng.org/ (+ curriculum, message board) | 4 |
| `tam-ai-ti/` | Tam-AI-Ti — financial-wellness coach | https://tamaiti.whiri-ai.com/ | 5 |
| `free-period/` | FreePeriod — period-poverty platform | https://free-period-website.pages.dev/ (+ products, impact) | 6 |

## Notes / limitations

- **FanFic Lab** is a Chinese-language HSR fan product; the story-discovery feed
  is empty publicly ("已加载 0 篇"), so only the hero + About page were worth
  capturing. The hero (HSR character art) is the strongest visual.
- **programming.chanmeng.org** capstone showcase is empty for now ("No published
  capstone projects yet — check back closer to Demo Day"), so the curriculum and
  message-board pages were captured instead.
- **Bilingual/trilingual sites** (FreePeriod, FemTech Weekend, SunoStats,
  programming) were captured in their English default via `Accept-Language: en`.

## Projects with no live web page (no screenshots)

echook (CLI tool), Google News MCP Server (npm package), Sanicle.AI /
Sanicle.Cloud (domain no longer live), CORDE Mobile (native React Native app).
