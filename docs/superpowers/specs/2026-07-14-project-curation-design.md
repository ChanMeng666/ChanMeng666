# Project curation re-pass — design

**Date:** 2026-07-14
**Goal:** Re-align the publicly-displayed and highlighted project set with reality. Many repos are now GitHub-archived or no longer developed; the data source still calls them `live`. Focus the shopfront on what actually matters.

## Context

- `data/profile/2*-projects-*.yaml` hold **104 project entries** (flagship 9 / primary 11 / secondary 24 / archive 60).
- The README shopfront shows **14** (driven by `meta.x_brand.*ProjectIds` bucket lists in `90-meta.yaml` + `README_HIDDEN_PROJECT_IDS` in `scripts/build.mjs`).
- Reconciliation against the live GitHub account (116 repos, 41 archived) found real drift — see below.

## Decisions taken

| Question | Decision |
|---|---|
| Scope | **Data layer + all downstream.** Fix `tier`/`status`/`recency` to match GitHub reality, then re-pick the README buckets. README, llms.txt, dist/profile.json, LinkedIn, CV all follow. |
| Audience for "highlight" | **All four**: technical hiring managers, open-source visitors, clients/partners, and Chan's own focus set. |
| Decision set | Chan personally decides the **54 "still alive"** candidates; the other 50 are mechanically archived. |
| Archived projects | **Keep but demote + label honestly.** They stay in llms.txt / dist / full CV history; they never appear in the README. No deletion from the data. |
| Shopfront structure | **One form, zoned.** Keep the existing zones (client editorial cards / AI-agents table / craft table). High-star OSS work goes in the tables with its star count shown, and does not compete with client cards for the hero slot. |

## Part 1 — mechanical fixes (no per-item review)

These are factual errors, not taste calls:

1. **Delete the `claude-code-audio-hooks` entry.** `gh api repos/ChanMeng666/claude-code-audio-hooks` redirects to `ChanMeng666/echook` — same 75★ repo, renamed. The data carries both; `echook` is the live one and stays. (Same class of bug as the `femtech-weekend-platform` duplicate removed in 760a141.)
2. **15 entries are GitHub-archived but say `status: live`** → set `status: archived` + `recency: deprecated`: library-os (★14), juejin-algorithm-practice (★6), otherworld-god-farmer (★5), html-brick-game, ai-human-game, journey-of-reincarnation, kaboom-rpg-adventure, slime-split, lottie-edit, minimalist-good-post, sanicle-ai-mobile, podcast-app-prototype, english-redefine, douban-elite-scraper, douban-review-scraper.
3. **`popup-image-app`** — data says archived, GitHub disagrees. Reconcile against the repo.
4. **The 50 low-star archive-tier entries** — ensure `status`/`recency` match GitHub. They stay in the data, off the README.

## Part 2 — interactive triage (54 candidates, Chan decides)

Candidate set = every non-archive-tier project, plus archive-tier ones with ≥5 stars or `recency: active`.

Each card gets one **exclusive display level**, starting **undecided**:

| Level | Meaning | Lands in |
|---|---|---|
| 🔥 Hero card | Strongest proof; README top editorial card | `flagshipProjectIds` (list order = card order) |
| ✅ Listed | Worth showing, not a hero | `aiAgentProjectIds` / `openSourceCraftProjectIds` (routed by `category`, overridable) |
| 📁 Kept, not shown | Full entry in the data; absent from README | no bucket |
| 🗄 Demote to archive | Explicitly no longer developed | `tier: archive` + `status: archived` |

Plus one **orthogonal toggle — ⭐ Spotlight**: "still investing in this." Distinct from "most impressive"; feeds `spotlightProjectIds`, year-end summaries, and brand copy.

Each card shows the evidence Chan needs without recall: GitHub stars, last push date, GitHub-archived flag, `provenance`, current `tier`/`status`, current bucket membership, and the tagline.

**No pre-selection.** Everything starts undecided; my opinion appears only as an advisory ★ hint.

## Part 3 — write-back

1. Apply Part 1, run `npm run check`.
2. Ship the triage page; Chan decides; export JSON.
3. Write back:
   - shards: `tier` / `status` / `recency` / `lastUpdated`
   - `90-meta.yaml`: `flagshipProjectIds` (order matters), `aiAgentProjectIds`, `openSourceCraftProjectIds`, `spotlightProjectIds`
   - `scripts/build.mjs`: `README_HIDDEN_PROJECT_IDS` if needed
4. Reconcile the references that point *at* the highlight set, or the README will link to a demoted project:
   - `meta.x_brand.valueProposition.proofLine` — "72 shipped projects" is already wrong against 104 entries
   - `meta.x_brand.engagementRoles[].proofProjectId` (4 roles)
5. `npm run check` → commit shards + regenerated outputs together.

## Non-goals

- No changes to the GitHub repos themselves (no new archiving, no renames).
- No deletion of project entries from the data, except the one duplicate in Part 1.
- No restructuring of the README template — only which IDs fill the existing buckets.
