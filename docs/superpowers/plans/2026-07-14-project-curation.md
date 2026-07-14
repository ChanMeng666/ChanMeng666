# Project Curation Re-Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the project data tell the truth about what is archived vs. alive, then let Chan re-pick the README highlight set from an interactive triage page, and propagate her choices to every generated surface.

**Architecture:** Three phases. (1) Mechanical data fixes — provable factual errors, no taste involved, verified by `npm run check`. (2) An interactive HTML triage page (Artifact) listing the 54 "still alive" candidates with their evidence; Chan sets each one herself and exports JSON. (3) Write her JSON back into the shards + `90-meta.yaml` bucket lists, reconcile the references that point *at* the highlight set, rebuild, commit.

**Tech Stack:** YAML shards under `data/profile/`, Node ESM build scripts (`scripts/build.mjs`, `scripts/lib/load-profile.mjs`), AJV schema validation, Handlebars templates, a standalone HTML/JS Artifact for the triage UI.

**Spec:** `docs/superpowers/specs/2026-07-14-project-curation-design.md`

## Global Constraints

- **Never hand-edit generated files.** README.md, llms.txt, llms-full.txt, dist/profile.json, linkedin/*.json + linkedin/*.md are build outputs. Edit the shard, then `npm run build`.
- **Never bulk-bump `lastUpdated`.** Only bump it for an entry you actually re-read and confirmed. For the mechanical fixes in Phase 1 the entry *is* being re-verified against GitHub, so bumping to `2026-07-14` is correct there.
- **Archived projects are demoted, not deleted.** The only entry removed in this plan is the `claude-code-audio-hooks` duplicate. Everything else keeps its full entry in llms.txt / dist / LinkedIn.
- **No pre-selection in the triage page.** Every project starts *undecided*. Claude's opinion appears only as an advisory ★ hint.
- **Field vocabularies (schema-enforced):** `tier`: flagship | primary | secondary | archive. `recency`: active | recent | historical | deprecated. `status` values in use: production | live | active | maintained | archived | draft.
- **Validation gate:** `npm run check` (schema + linkedin-sync + build + asset audit) must pass before every commit.
- **Commit the shard AND the regenerated outputs together.**

---

### Task 1: Remove the `claude-code-audio-hooks` duplicate entry

`gh api repos/ChanMeng666/claude-code-audio-hooks` redirects to `ChanMeng666/echook` — one 75★ repo, two data entries. `echook` (flagship, spotlight, in `aiAgentProjectIds`) is the live one and stays.

**Files:**
- Modify: `data/profile/23-projects-oss-more.yaml` (entry starts at line 1615, `- id: claude-code-audio-hooks`)
- Check for references: `data/profile/90-meta.yaml`, `data/profile/70-linkedin.yaml`, `scripts/build.mjs`

- [ ] **Step 1: Confirm the redirect is real (do not trust the plan, verify)**

```bash
gh api repos/ChanMeng666/claude-code-audio-hooks --jq '.full_name'
```

Expected output: `ChanMeng666/echook`

- [ ] **Step 2: Find every reference to the id before deleting**

```bash
grep -rn "claude-code-audio-hooks" data/ scripts/ cv/ --include=*.yaml --include=*.mjs --include=*.typ --include=*.json
```

Expected: hits in `data/profile/23-projects-oss-more.yaml` only. If any bucket list in `90-meta.yaml`, any `relatedProjectId`, or `README_HIDDEN_PROJECT_IDS` in `scripts/build.mjs` also names it, remove those references in this same task — a dangling id fails the build.

- [ ] **Step 3: Read the full entry and salvage anything unique**

Read `data/profile/23-projects-oss-more.yaml` from line 1615 to the next `  - id:` line. Compare its `narrative` / `metrics` / `extraLinks` against the `echook` entry (`grep -n "id: echook" data/profile/`). If the stale entry holds a fact the `echook` entry lacks (e.g. an older award, a write-up link), move that fact into the `echook` entry rather than losing it.

- [ ] **Step 4: Delete the entry**

Delete the whole `- id: claude-code-audio-hooks` block (from its `  - id:` line through the line before the next `  - id:` at the same indent).

- [ ] **Step 5: Validate**

```bash
npm run validate
```

Expected: PASS. Project count drops from 104 → 103.

- [ ] **Step 6: Commit**

```bash
git add data/profile/23-projects-oss-more.yaml
git commit -m "fix(data): drop claude-code-audio-hooks — duplicate of echook (repo renamed)"
```

---

### Task 2: Align the 15 GitHub-archived entries with reality

These say `status: live` while the repo is archived on GitHub. Set `status: archived`, `recency: deprecated`, and bump `lastUpdated` (each entry is genuinely being re-verified against GitHub here).

**Files:**
- Modify: `data/profile/22-projects-oss-webapps.yaml` — `library-os` (line 36)
- Modify: `data/profile/23-projects-oss-more.yaml` — the other 14

**Interfaces:**
- Consumes: nothing from Task 1 beyond a clean tree.
- Produces: a data set where `status: archived` ⟺ the GitHub repo is archived. Task 4's triage page relies on this to render the "GH-archived" flag consistently.

The 15 ids, with their GitHub star counts (all are already `tier: archive`, so no tier change is needed):

| id | shard | stars |
|---|---|---|
| library-os | 22-projects-oss-webapps.yaml | 14 |
| juejin-algorithm-practice | 23-projects-oss-more.yaml | 6 |
| otherworld-god-farmer | 23-projects-oss-more.yaml | 5 |
| html-brick-game | 23-projects-oss-more.yaml | 2 |
| podcast-app-prototype | 23-projects-oss-more.yaml | 1 |
| minimalist-good-post | 23-projects-oss-more.yaml | 1 |
| douban-review-scraper | 23-projects-oss-more.yaml | 1 |
| lottie-edit | 23-projects-oss-more.yaml | 0 |
| ai-human-game | 23-projects-oss-more.yaml | 0 |
| journey-of-reincarnation | 23-projects-oss-more.yaml | 0 |
| kaboom-rpg-adventure | 23-projects-oss-more.yaml | 0 |
| slime-split | 23-projects-oss-more.yaml | 0 |
| sanicle-ai-mobile | 23-projects-oss-more.yaml | 0 |
| english-redefine | 23-projects-oss-more.yaml | 0 |
| douban-elite-scraper | 23-projects-oss-more.yaml | 0 |

- [ ] **Step 1: Re-verify the archived flag against GitHub (do not trust the table)**

```bash
for id in library-os juejin-algorithm-practice otherworld-god-farmer html-brick-game podcast-app-prototype minimalist-good-post douban-review-scraper lottie-edit ai-human-game journey-of-reincarnation kaboom-rpg-adventure slime-split sanicle-ai-mobile english-redefine douban-elite-scraper; do
  printf '%-28s ' "$id"
  gh api "repos/ChanMeng666/$id" --jq '.archived'
done
```

Expected: `true` for all 15. If any prints `false`, drop it from this task and report it — the data may be right and the assumption wrong.

Note: the data `id` and the GitHub repo name coincide for these 15, but that is not guaranteed in general — the authoritative repo name is the one in each entry's `repoUrl`.

- [ ] **Step 2: Edit each entry**

For each of the 15, in its shard, within that entry's block only:
- `status: live` → `status: archived`
- `recency: historical` (or `deprecated`) → `recency: deprecated`
- `lastUpdated: "…"` → `lastUpdated: "2026-07-14"`

Use per-entry `Edit` calls anchored on the surrounding lines. Do **not** `sed` globally — `status: live` appears in dozens of other entries that are genuinely live.

- [ ] **Step 3: Verify the invariant holds**

```bash
node --input-type=module -e '
import { loadProfile } from "./scripts/lib/load-profile.mjs";
const ids = ["library-os","juejin-algorithm-practice","otherworld-god-farmer","html-brick-game","podcast-app-prototype","minimalist-good-post","douban-review-scraper","lottie-edit","ai-human-game","journey-of-reincarnation","kaboom-rpg-adventure","slime-split","sanicle-ai-mobile","english-redefine","douban-elite-scraper"];
const p = loadProfile();
const bad = p.projects.filter(x => ids.includes(x.id) && (x.status !== "archived" || x.recency !== "deprecated"));
console.log(bad.length === 0 ? "OK: all 15 archived+deprecated" : "STILL WRONG: " + bad.map(b => b.id + "(" + b.status + "/" + b.recency + ")").join(", "));
'
```

Expected: `OK: all 15 archived+deprecated`

- [ ] **Step 4: Validate**

```bash
npm run validate
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/profile/22-projects-oss-webapps.yaml data/profile/23-projects-oss-more.yaml
git commit -m "fix(data): mark 15 GitHub-archived projects as archived/deprecated"
```

---

### Task 3: Repo-health sweep — dead links and stale metrics

`popup-image-app`'s `repoUrl` (`https://github.com/ChanMeng666/popup-image-app`) returns 404 — the repo no longer exists. There may be more. `npm run refresh-metrics` reports repo health (404s, renames, archived-but-active, activity gaps) for every GitHub-linked project.

**Files:**
- Modify: whichever shards the report implicates (expect `23-projects-oss-more.yaml` at minimum, `popup-image-app` at line ~3121)

- [ ] **Step 1: Run the health report (dry-run, writes nothing)**

```bash
npm run refresh-metrics
```

Read the whole report. It covers three separate things — treat them separately:
1. **404s / renames** — a `repoUrl` pointing at a repo that no longer exists or has moved.
2. **Star/fork/commit-date drift** — the `- { label: "Stars", value: ... }` metric lines.
3. **Archived-but-active / activity gaps** — informational.

- [ ] **Step 2: Fix dead `repoUrl`s by hand**

For each 404: if the repo was **renamed**, update `repoUrl` to the new URL. If it was **deleted or made private**, delete the `repoUrl` line entirely and leave an in-place comment in the shard, matching the existing convention in this repo:

```yaml
    # repoUrl omitted — repository no longer public; do not re-add.
```

(This follows the same convention already used on `tam-ai-ti`. Never link a private repo, and never suggest making one public.)

For a project whose repo is gone *and* which has no live `url` either, set `status: archived` + `recency: deprecated` — there is nothing left to show.

- [ ] **Step 3: Apply the metric refresh**

```bash
npm run refresh-metrics -- --apply
git diff --stat data/profile/
```

Expected: only `- { label: "Stars"/"Forks"/... , value: ... }` lines change. If the diff touches anything else, revert and investigate — this script is only supposed to rewrite metric lines.

- [ ] **Step 4: Validate**

```bash
npm run validate
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/profile/
git commit -m "fix(data): repair dead repo links, refresh GitHub metrics"
```

---

### Task 4: Build the interactive triage page

54 candidates = every non-archive-tier project + archive-tier ones with ≥5 stars or `recency: active`. **Recompute this set from the live data after Tasks 1–3** — the numbers will have shifted.

**Files:**
- Create: `scripts/build-triage-page.mjs` (generates the page from live profile data + a cached `gh repo list` dump — so it is re-runnable, not a one-off hand-written HTML blob)
- Create: `D:\Temp\claude\D--github-repository-ChanMeng666\3f4780f6-4d9e-4aac-8e06-980ab59555b6\scratchpad\triage.html` (the generated page — scratch, not committed)

**Interfaces:**
- Consumes: `loadProfile()` from `scripts/lib/load-profile.mjs`; `gh repo list ChanMeng666 --limit 300 --json name,isArchived,isPrivate,stargazerCount,pushedAt`.
- Produces: an exported JSON array Task 5 reads, of exactly this shape:

```json
[
  { "id": "gavigo-ire", "level": "hero",     "spotlight": false, "bucket": null },
  { "id": "echook",     "level": "listed",   "spotlight": true,  "bucket": "aiAgent" },
  { "id": "friendscope","level": "kept",     "spotlight": false, "bucket": null },
  { "id": "library-os", "level": "archived", "spotlight": false, "bucket": null }
]
```

`level` ∈ `hero` | `listed` | `kept` | `archived` | `undecided`. `bucket` ∈ `aiAgent` | `craft` | `null`, and is only meaningful when `level` is `listed`. `spotlight` is an independent boolean, valid at any level.

- [ ] **Step 1: Write the generator script**

`scripts/build-triage-page.mjs` must:
- Load the profile, shell out to `gh repo list`, join on the repo name parsed out of each project's `repoUrl`.
- Select the candidate set: `tier !== "archive" || ghStars >= 5 || recency === "active"`.
- Emit a single self-contained HTML file (all CSS + JS inline, no external requests — a strict CSP applies to Artifacts).

Each card renders, as read-only evidence: name, id, tagline, `provenance`, current `tier` / `status` / `recency`, GitHub stars, last push date, a GH-archived flag, and current bucket membership.

Each card's controls: a 4-way exclusive **level** selector (Hero card / Listed / Kept, not shown / Demote to archive), a **bucket** dropdown that only enables when level is `listed`, and an independent **⭐ Spotlight** checkbox.

**Every card starts at `undecided`.** Claude's opinion is a non-interactive advisory ★ hint on the card — it must never pre-select a control.

The page needs: a filter/sort bar (by stars, by tier, by provenance, by category, by decided/undecided), a live counter of how many are still undecided, drag-to-reorder within the Hero group (list order = README card order), and an **Export JSON** button that copies the array above to the clipboard and also renders it in a `<textarea>` for manual copy.

- [ ] **Step 2: Generate and eyeball the page**

```bash
node scripts/build-triage-page.mjs > "D:/Temp/claude/D--github-repository-ChanMeng666/3f4780f6-4d9e-4aac-8e06-980ab59555b6/scratchpad/triage.html"
```

Verify by reading the generated HTML: the candidate count matches the recomputed set, no control has a `checked`/`selected` attribute on any card, and every card shows its star count and push date.

- [ ] **Step 3: Publish as an Artifact and hand it to Chan**

Load the `artifact-design` skill first, then publish the file with the Artifact tool.

- [ ] **Step 4: Commit the generator (not the output)**

```bash
git add scripts/build-triage-page.mjs
git commit -m "chore(scripts): add project triage page generator"
```

- [ ] **Step 5: STOP — wait for Chan's exported JSON**

Do not guess her choices. Do not proceed to Task 5 without the export.

---

### Task 5: Write Chan's decisions back into the data

Chan completed the triage. Her export is at
`D:\Temp\claude\D--github-repository-ChanMeng666\3f4780f6-4d9e-4aac-8e06-980ab59555b6\scratchpad\decisions.json`
— 53 items, 0 undecided: **6 hero, 15 listed, 21 kept, 11 archived**, 7 spotlight.

**Her decision is a deliberate strategic pivot: product-first.** The hero cards are now her own
products (google-news-mcp ★125, echook ★75, archlang, archcanvas, vitex) plus she-sharp. Her client
flagships — GAVIGO IRE, Tam-AI-Ti, Eatropolis, FemTech Weekend — drop to table rows. She confirmed
this is intentional, and asked for a dedicated **Client work table** to hold them. This means the
README's section structure changes, not just its ID lists.

**Files:**
- Modify: `data/profile/90-meta.yaml` — bucket lists (~L173–238) and the curation comment above them
- Modify: `data/profile/2*-projects-*.yaml` — `tier`/`status`/`recency`/`lastUpdated` on entries whose level changed
- Modify: `templates/partials/featured-work.hbs` — the section heading (L8) and its `<sub>` intro (L10)
- Modify: `templates/README.md.hbs` — include the client-work partial
- Modify: `scripts/build.mjs` — re-enable the commissioned wiring; check `README_HIDDEN_PROJECT_IDS` (~L230)
- Reuse: `templates/partials/commissioned.hbs` — the retired partial becomes the Client work table

**Interfaces:**
- Consumes: `decisions.json` (shape: `{id, level, spotlight, bucket}`; `bucket` is `null` on every
  row — Chan left the optional dropdown untouched, so routing is by the table below, not by that field).
- Produces: bucket lists the build resolves via `resolveIds()` in `scripts/build.mjs` (L169–171).

#### Level → data mapping

| level | shard fields | bucket list |
|---|---|---|
| `hero` (6) | `tier: flagship` if not already | `flagshipProjectIds`, **in the export's order** |
| `listed` (15) | `tier: primary` if currently `archive` | routed per the table below |
| `kept` (21) | unchanged | removed from every bucket list |
| `archived` (11) | `tier: archive`, `status: archived`, `recency: deprecated` | removed from every bucket list |
| `spotlight: true` (7) | — | `spotlightProjectIds` |

Bump `lastUpdated: "2026-07-14"` on every entry whose fields change. Chan reviewed each one on the
triage page, so the field's meaning holds.

#### Routing the 15 `listed` projects

Chan chose "add a Client work table". Route by `provenance`, then `category`:

**`commissionedProjectIds`** — Client work table (all `provenance: client`), 7:
`gavigo-ire`, `tam-ai-ti`, `femtech-weekend-website`, `eatropolis-website`, `femtech-radar`,
`gavigo-website`, `her-waka`

**`aiAgentProjectIds`** — AI agents & tooling table, 3:
`server-google-jobs`, `ai-programming-teaching-project`, `ai-hackathon-assistant`

**`openSourceCraftProjectIds`** — Craft & open-source products table, 5:
`gradient-svg-generator`, `github-readme-suno-cards`, `sunostats`, `cloud-canals`, `css-tower-defense`

7 + 3 + 5 = 15. Every `listed` id lands in exactly one table; no id appears in two lists.

#### `spotlightProjectIds` (7)

`echook`, `archlang`, `archcanvas`, `vitex`, `gradient-svg-generator`,
`ai-programming-teaching-project`, `portfolio-v2`

Note `portfolio-v2` is `spotlight: true` but `level: kept` — that is coherent and intended: spotlight
is an orthogonal "still investing" axis, not a display level. It goes in `spotlightProjectIds` and in
no display bucket.

- [ ] **Step 1: Rewrite the bucket lists in `90-meta.yaml`**

Set `flagshipProjectIds` to the 6 hero ids **in export order**: `google-news-mcp`, `echook`,
`archlang`, `archcanvas`, `she-sharp`, `vitex`. Set `commissionedProjectIds`,
`aiAgentProjectIds`, `openSourceCraftProjectIds`, and `spotlightProjectIds` per the lists above.
Leave the `more*` lists as `[]`.

Replace the inline curation comment (currently describing the 2026-07 hiring-first pass) with one
describing THIS pass: product-first hero, client work demoted to its own table, and why. That comment
is how the next reader understands the shopfront — a stale comment is worse than none.

- [ ] **Step 2: Apply the shard field changes**

Per-entry `Edit` calls, never sed. The 11 `archived` ids get `tier: archive` + `status: archived` +
`recency: deprecated`: `douyin-mall-go-template`, `automotive-repair-management-system`,
`douyin-mall-java-template`, `library-os`, `douyin-mall`, `juejin-algorithm-practice`,
`ai-image-generator`, `douyin-mall-frontend`, `femtracker-agent`, `otherworld-god-farmer`,
`esol-learning-platform`.

Note several of these were already archived by Task 2 — verify before editing and skip the no-ops.
`douyin-mall-go-template` (★53), `douyin-mall-java-template` (★24), `douyin-mall` (★13),
`douyin-mall-frontend` (★5) and `automotive-repair-management-system` (★29) are the notable
demotions: Chan is retiring the ByteDance-bootcamp and coursework band despite the stars.

The 6 `hero` ids must be `tier: flagship`. The 15 `listed` ids must not be `tier: archive`.

- [ ] **Step 3: Re-enable the Client work table**

`templates/partials/commissioned.hbs` exists but is no longer included by `templates/README.md.hbs`,
and `scripts/build.mjs` still wires `data._commissionedProjects` (L169) and strips hidden ids from it
(L240). Re-include the partial in `README.md.hbs` — place it AFTER `{{> featured-work}}` and before
`{{> open-source}}`, with a `{{> monogram-divider}}` between sections to match the existing rhythm.

Read the partial and confirm its heading and `<sub>` intro say what this table now is: client and
organisation work, delivered end-to-end. Update the copy if it does not.

Check `build.mjs` L247–255: there is a hard-coded `COMMISSIONED_PROMOTE_IDS` that promotes ids from
the commissioned overflow into the visible table. With `moreCommissionedProjectIds` empty it should be
inert — verify that, and remove the dead promotion code if it is no longer reachable.

- [ ] **Step 4: Retitle the hero section**

`templates/partials/featured-work.hbs` L8 reads `## Client & organisation work` and L10 reads
`<sub>Production systems I led end-to-end for companies and nonprofits.</sub>`. That heading is now
false — 5 of the 6 hero cards are Chan's own products.

Retitle it to describe what the section actually holds. The heading and its one-line intro must be
honest about the mix (her own products, plus She Sharp). Do not invent a marketing slogan; state what
the reader is looking at. Keep the blank line between the `<img>` and the `###` heading (a bare `<img>`
directly above a `###` breaks heading rendering via CommonMark's type-7 HTML block rule).

- [ ] **Step 5: Verify every bucket id resolves and no id is double-listed**

```bash
npm run validate
```

```bash
node --input-type=module -e '
import { loadProfile } from "./scripts/lib/load-profile.mjs";
const p = loadProfile();
const ids = new Set(p.projects.map(x => x.id));
const b = p.meta.x_brand;
const KEYS = ["flagshipProjectIds","commissionedProjectIds","aiAgentProjectIds","openSourceCraftProjectIds","spotlightProjectIds","moreAiAgentProjectIds","moreOpenSourceProjectIds","moreCommissionedProjectIds","moreCreativeProjectIds"];
for (const k of KEYS) {
  const bad = (b[k] || []).filter(i => !ids.has(i));
  console.log(k.padEnd(30), bad.length ? "BROKEN -> " + bad.join(", ") : "ok (" + (b[k]||[]).length + ")");
}
const DISPLAY = ["flagshipProjectIds","commissionedProjectIds","aiAgentProjectIds","openSourceCraftProjectIds"];
const seen = new Map();
for (const k of DISPLAY) for (const i of (b[k] || [])) seen.set(i, [...(seen.get(i) || []), k]);
const dup = [...seen].filter(([, ks]) => ks.length > 1);
console.log(dup.length ? "DOUBLE-LISTED: " + JSON.stringify(dup) : "ok: no id in two display buckets");
const byId = new Map(p.projects.map(x => [x.id, x]));
const shown = DISPLAY.flatMap(k => b[k] || []);
const bad = shown.map(i => byId.get(i)).filter(x => x && (x.tier === "archive" || x.status === "archived"));
console.log(bad.length ? "ARCHIVED BUT SHOWN: " + bad.map(x => x.id).join(", ") : "ok: nothing archived is in a display bucket");
'
```

Expected: every list `ok`, no double-listing, nothing archived in a display bucket.

- [ ] **Step 6: Commit**

```bash
git add data/profile/ templates/ scripts/build.mjs
git commit -m "feat(data): product-first project curation — new hero set + client work table"
```

---

### Task 6: Reconcile the references that point *at* the highlight set

Changing which projects are highlighted breaks the copy that names them. These are hand-written and
not auto-derived, so nothing will fail loudly — they will just quietly lie.

**Files:**
- Modify: `data/profile/90-meta.yaml` — `valueProposition.proofLine` (~L29), `engagementRoles[]` (~L38–68), `faq` (~L91–101)
- Check: `cv/sections/*.typ`, `cv/build-llms-txt.mjs` — CV prose is hand-curated Typst and hardcodes copy
- Check: `data/profile/70-linkedin.yaml` — LinkedIn copy is curated and mirrors by name

- [ ] **Step 1: Recount the projects and fix `proofLine`**

`proofLine` reads `"12 companies · 4 teaching cohorts · 72 shipped projects · Master's with Distinction"`.
The count is stale — the data holds 103 entries.

```bash
node --input-type=module -e '
import { loadProfile } from "./scripts/lib/load-profile.mjs";
const p = loadProfile();
console.log("total          ", p.projects.length);
console.log("non-archive    ", p.projects.filter(x => x.tier !== "archive").length);
console.log("not deprecated ", p.projects.filter(x => x.recency !== "deprecated").length);
console.log("work entries   ", p.work.length);
'
```

"Shipped projects" most defensibly means every entry that actually shipped — archived ones did ship.
Update the number to the honest total. If the honest number differs materially from 72 in a way that
changes the line's meaning, report it rather than silently picking a framing.

- [ ] **Step 2: Re-point `engagementRoles[].proofProjectId`**

The four roles cite `gavigo-ire`, `tam-ai-ti`, `sanicle-ai-mobile`, `ai-programming-teaching-project`.

- `sanicle-ai-mobile` is **archived** (Task 2) — a role's proof link pointing at a demoted,
  GitHub-archived project is broken evidence. Re-point the CTO-class-operator role. Look at what
  Sanicle evidence survives: `grep -n "sanicle" data/profile/2*-projects-*.yaml` and the
  `work[].id: sanicle` entry. If no Sanicle project survives in a display bucket, use `proofUrl`
  (https://sanicle.com) and drop `proofProjectId` rather than linking a demoted entry.
- `gavigo-ire` and `tam-ai-ti` are still shown (Client work table), so those two roles still resolve
  to something a reader can click. Confirm, don't assume.

A `proofProjectId` may point at any project the README still shows — hero or table row. It may NOT
point at a `kept` or `archived` project.

- [ ] **Step 3: Check the FAQ answers for demoted projects**

`meta.x_brand.faq` names GAVIGO IRE and She Sharp in "What is Chan's biggest shipped result?". Both
survive on the README, so that answer stands. Read the other four answers and confirm none of them
leans on a project Chan just demoted.

- [ ] **Step 4: Verify no proof reference dangles or points at a hidden project**

```bash
node --input-type=module -e '
import { loadProfile } from "./scripts/lib/load-profile.mjs";
const p = loadProfile();
const byId = new Map(p.projects.map(x => [x.id, x]));
const b = p.meta.x_brand;
const shown = new Set([...(b.flagshipProjectIds||[]), ...(b.commissionedProjectIds||[]), ...(b.aiAgentProjectIds||[]), ...(b.openSourceCraftProjectIds||[])]);
for (const r of b.engagementRoles) {
  if (!r.proofProjectId) { console.log(r.id.padEnd(30), "(no proofProjectId — proofUrl only)"); continue; }
  const proj = byId.get(r.proofProjectId);
  const state = !proj ? "!! MISSING" : !shown.has(r.proofProjectId) ? "!! NOT ON README (" + proj.tier + "/" + proj.status + ")" : "ok (" + proj.tier + ")";
  console.log(r.id.padEnd(30), r.proofProjectId.padEnd(34), state);
}
'
```

Expected: every role either `ok` or explicitly `proofUrl`-only. No `MISSING`, no `NOT ON README`.

- [ ] **Step 5: Validate and commit**

```bash
npm run validate
git add data/profile/90-meta.yaml
git commit -m "fix(data): re-point brand proof references at the new highlight set"
```

---

### Task 7: Rebuild every surface and verify the README

**Files:**
- Regenerated: `README.md`, `llms.txt`, `llms-full.txt`, `dist/profile.json`, `linkedin/linkedin-profile.json`, `linkedin/*.md`

- [ ] **Step 1: Full check + build**

```bash
npm run check
```

Expected: schema PASS, linkedin-sync PASS, build succeeds, asset audit clean.

- [ ] **Step 2: Confirm the README matches Chan's decisions exactly**

```bash
node --input-type=module -e '
import fs from "node:fs";
import { loadProfile } from "./scripts/lib/load-profile.mjs";
const readme = fs.readFileSync("README.md", "utf8");
const p = loadProfile();
const D = JSON.parse(fs.readFileSync("D:/Temp/claude/D--github-repository-ChanMeng666/3f4780f6-4d9e-4aac-8e06-980ab59555b6/scratchpad/decisions.json", "utf8"));
const byId = new Map(p.projects.map(x => [x.id, x]));
const hit = (id) => { const x = byId.get(id); if (!x) return false; const u = x.url || x.repoUrl; return (u && readme.includes(u)) || readme.includes(x.name); };
let fail = 0;
for (const d of D) {
  const on = hit(d.id);
  const want = d.level === "hero" || d.level === "listed";
  if (on !== want) { console.log("MISMATCH", d.id.padEnd(34), "level=" + d.level.padEnd(9), "onReadme=" + on); fail++; }
}
console.log(fail ? fail + " MISMATCHES" : "OK: README shows exactly the hero+listed set, nothing else");
'
```

Expected: `OK`. A `kept` or `archived` project appearing on the README is a failure; a `hero` or
`listed` project missing from it is a failure.

- [ ] **Step 3: Confirm hero card order matches her drag order**

```bash
grep -n "^### \[" README.md | head -10
```

Expected: the first six `###` cards, in this order: google-news-mcp, echook, archlang, archcanvas,
she-sharp, vitex (rendered under their display names).

- [ ] **Step 4: Confirm archived projects are still present downstream**

```bash
node -e '
const d = require("./dist/profile.json");
console.log("archive-tier entries still in dist/profile.json:", d.projects.filter(x => x.tier === "archive").length);
'
grep -c "library-os" llms-full.txt
```

Expected: a non-zero archive count, and `library-os` still in `llms-full.txt` — demoted, not deleted.

- [ ] **Step 5: Freshness gate**

```bash
npm run check:freshness -- --strict
npm run check:cv -- --strict
```

Expected: PASS. If an entry is overdue, re-read it and run `npm run reviewed -- "<key>" --apply` —
never hand-edit `lastUpdated` in bulk.

- [ ] **Step 6: Commit shards and generated outputs together**

```bash
git add -A
git commit -m "chore(readme): rebuild from data/ after product-first re-curation"
```

- [ ] **Step 7: Report**

State plainly: how many projects the README now shows (was 14), the new hero order, what moved into
the Client work table, what was demoted to archive (especially the starred ByteDance-bootcamp band),
the new honest project count in `proofLine`, and anything that needs Chan's decision.

---

## Scratch files

Working files live in `D:\Temp\claude\D--github-repository-ChanMeng666\3f4780f6-4d9e-4aac-8e06-980ab59555b6\scratchpad\` (`gh.json`, `joined.json`, `projects.json`, `dump.mjs`, `cand.cjs`, `rep.cjs`, `triage.html`). At the end of the task, list them and ask Chan whether to delete, archive, or keep. `scripts/build-triage-page.mjs` is the one artifact that belongs in the repo — it makes this whole pass repeatable next year.
