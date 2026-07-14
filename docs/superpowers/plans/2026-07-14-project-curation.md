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

### Task 5: Write her decisions back into the data

**Files:**
- Modify: `data/profile/20-projects-flagship.yaml`, `21-projects-oss-primary.yaml`, `22-projects-oss-webapps.yaml`, `23-projects-oss-more.yaml` (the `tier` / `status` / `recency` / `lastUpdated` of any project whose level changed)
- Modify: `data/profile/90-meta.yaml` (bucket lists at lines ~173–238)
- Modify: `scripts/build.mjs` (`README_HIDDEN_PROJECT_IDS`, a `Set` around line 193)

**Interfaces:**
- Consumes: the JSON array produced by Task 4.

Mapping from her export to the data:

| export `level` | shard fields | `90-meta.yaml` bucket |
|---|---|---|
| `hero` | leave `tier` as-is unless it is `archive` (then → `flagship`) | append to `flagshipProjectIds`, **in her drag order** |
| `listed` | `tier: primary` if currently `archive` | append to `aiAgentProjectIds` or `openSourceCraftProjectIds` per the `bucket` field |
| `kept` | unchanged | remove from every bucket list |
| `archived` | `tier: archive`, `status: archived`, `recency: deprecated` | remove from every bucket list |
| `spotlight: true` (any level) | — | append to `spotlightProjectIds` |

Bump `lastUpdated` to `2026-07-14` on every entry whose fields changed — Chan reviewed it on the triage page, so the field's meaning is preserved.

- [ ] **Step 1: Apply the shard field changes**

Per-entry `Edit` calls. Do not `sed`.

- [ ] **Step 2: Rewrite the bucket lists in `90-meta.yaml`**

Replace `flagshipProjectIds`, `aiAgentProjectIds`, `openSourceCraftProjectIds`, and `spotlightProjectIds` with the exported sets. Update the inline curation comment above them (currently dated 2026-07 and describing the previous pass) to describe *this* pass and its rationale — that comment is how the next reader understands the shopfront.

Leave `commissionedProjectIds` and the `more*` lists as `[]` unless her export requires otherwise.

- [ ] **Step 3: Sync `README_HIDDEN_PROJECT_IDS` in `scripts/build.mjs`**

Any id she marked `kept` or `archived` that is still named in that Set can stay (belt-and-braces). Any id she marked `hero` or `listed` **must not** be in it, or it will be silently suppressed from the README despite bucket membership.

- [ ] **Step 4: Verify every bucket id resolves**

```bash
npm run validate
```

Expected: PASS. The build fails on a typo'd id in `spotlightProjectIds` and on a broken `collaborators[].currentOrgId`; a typo in the other bucket lists silently renders nothing, so also run:

```bash
node --input-type=module -e '
import { loadProfile } from "./scripts/lib/load-profile.mjs";
const p = loadProfile();
const ids = new Set(p.projects.map(x => x.id));
const b = p.meta.x_brand;
for (const key of ["flagshipProjectIds","aiAgentProjectIds","openSourceCraftProjectIds","spotlightProjectIds","commissionedProjectIds","moreAiAgentProjectIds","moreOpenSourceProjectIds","moreCommissionedProjectIds","moreCreativeProjectIds"]) {
  const bad = (b[key] || []).filter(i => !ids.has(i));
  console.log(key.padEnd(30), bad.length ? "BROKEN -> " + bad.join(", ") : "ok");
}
'
```

Expected: `ok` on every line.

- [ ] **Step 5: Commit the shards**

```bash
git add data/profile/ scripts/build.mjs
git commit -m "feat(data): re-curate public project set per 2026-07 triage"
```

---

### Task 6: Reconcile the references that point *at* the highlight set

Changing which projects are highlighted breaks the copy that names them. These live in `90-meta.yaml` and are not auto-derived.

**Files:**
- Modify: `data/profile/90-meta.yaml` — `valueProposition.proofLine` (line ~29), `engagementRoles[].proofProjectId` / `proofProjectName` / `proofUrl` (lines ~38–68)
- Check: `cv/sections/*.typ`, `cv/build-llms-txt.mjs` (CV prose is hand-curated Typst and hardcodes some copy — facts live in three places)
- Check: `data/profile/70-linkedin.yaml` (LinkedIn Projects copy is curated, mirrors by name)

- [ ] **Step 1: Recount the projects and fix `proofLine`**

`proofLine` currently reads `"12 companies · 4 teaching cohorts · 72 shipped projects · Master's with Distinction"`. The count is stale — the data holds 103 entries after Task 1.

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

Pick the number the line should honestly claim — "shipped projects" most defensibly means every entry that actually shipped, including archived ones (they did ship). Ask Chan which framing she wants if the honest number differs materially from 72. Update the line.

- [ ] **Step 2: Verify each `engagementRoles[].proofProjectId` still points at a highlighted project**

The four roles cite `gavigo-ire`, `tam-ai-ti`, `sanicle-ai-mobile`, and `ai-programming-teaching-project`. Note `sanicle-ai-mobile` is one of the 15 entries archived in Task 2 — a role's proof link would then point at a demoted, GitHub-archived project. Re-point it at a project Chan marked `hero` or `listed` for that role's archetype (the CTO-class-operator role has other Sanicle evidence available; check `work[].id: sanicle` and the Sanicle projects).

- [ ] **Step 3: Verify no dangling proof ids**

```bash
node --input-type=module -e '
import { loadProfile } from "./scripts/lib/load-profile.mjs";
const p = loadProfile();
const byId = new Map(p.projects.map(x => [x.id, x]));
for (const r of p.meta.x_brand.engagementRoles) {
  const proj = byId.get(r.proofProjectId);
  console.log(r.id.padEnd(30), r.proofProjectId.padEnd(34), proj ? proj.tier + "/" + proj.status : "!! MISSING");
}
'
```

Expected: every role resolves, and none resolves to a project that is `archive`/`archived`.

- [ ] **Step 4: Validate and commit**

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

- [ ] **Step 2: Read the generated README and confirm it matches her decisions**

```bash
grep -nE '^#{2,3} |^\| \[' README.md | head -60
```

Confirm: every project she marked `hero` appears as a card **in her order**; every `listed` one appears in the right table with its star count; **nothing** she marked `kept` or `archived` appears anywhere in README.md.

```bash
node --input-type=module -e '
import fs from "node:fs";
import { loadProfile } from "./scripts/lib/load-profile.mjs";
const readme = fs.readFileSync("README.md", "utf8");
const p = loadProfile();
const leaked = p.projects.filter(x => (x.tier === "archive" || x.status === "archived") && new RegExp("\\\\b" + x.id + "\\\\b").test(readme));
console.log(leaked.length ? "LEAKED into README: " + leaked.map(x => x.id).join(", ") : "OK: no archived project in README");
'
```

Expected: `OK: no archived project in README`.

- [ ] **Step 3: Confirm the archived projects are still present downstream**

```bash
node -e '
const d = require("./dist/profile.json");
const arc = d.projects.filter(x => x.tier === "archive");
console.log("archive-tier entries still in dist/profile.json:", arc.length);
'
grep -c "library-os" llms-full.txt
```

Expected: a non-zero archive count, and `library-os` still present in `llms-full.txt` — demoted, not deleted, exactly as the spec requires.

- [ ] **Step 4: Freshness gate**

```bash
npm run check:freshness -- --strict
```

Expected: PASS. If an entry is overdue, re-read it and run `npm run reviewed -- "<key>" --apply` — never hand-edit `lastUpdated` in bulk.

- [ ] **Step 5: Commit shards and generated outputs together**

```bash
git add -A
git commit -m "chore(readme): rebuild from data/ after project re-curation"
```

- [ ] **Step 6: Report to Chan**

State plainly: how many projects the README now shows (was 14), which were promoted, which were demoted, the new honest project count in `proofLine`, and anything the plan hit that she needs to decide.

---

## Scratch files

Working files live in `D:\Temp\claude\D--github-repository-ChanMeng666\3f4780f6-4d9e-4aac-8e06-980ab59555b6\scratchpad\` (`gh.json`, `joined.json`, `projects.json`, `dump.mjs`, `cand.cjs`, `rep.cjs`, `triage.html`). At the end of the task, list them and ask Chan whether to delete, archive, or keep. `scripts/build-triage-page.mjs` is the one artifact that belongs in the repo — it makes this whole pass repeatable next year.
