# LinkedIn Copy — Follow-ups (2026-09)

> **STATUS: 3 of 6 closed 2026-09-02** — Chan answered the open questions
> directly. Items 2, 3 and 5 are resolved and shipped; items 1, 4 and 7 remain.
>
> **STATUS (original): OPEN.** The main rewrite shipped 2026-09-02: headline, About (8 → 5
> blocks), Services, Featured (3 → 6) and all 15 Experience descriptions were
> rewritten against the *"LinkedIn for Life"* guidance (Stuart Little · Agency8 /
> Janelle, She Sharp, 2026-05). Chan decided all 27 blocks individually.
>
> This file holds what was **deliberately left open** in that pass. Each item is a
> decision, not a bug to fix silently.

---

## 1. Featured — the video slot is a placeholder

`70-linkedin.yaml` `linkedin.featured[3]` currently reads
`⏳ TODO — intro / product demo video (not yet produced)` and points at the
channel, `https://www.youtube.com/@ChanMeng666`.

**Why it is there at all.** The guidance singles video out as the strongest
signal a profile can carry: *"Show up as you, in an age of AI-generated
everything. Authenticity is the differentiator."* Featured is also described as a
personal library you can send in DMs — a film is the one asset that works in both
roles. The slot is held open on purpose rather than dropped.

**To close:** produce the film, then replace `title` + `url` in that entry and
delete the three `# TODO` comment lines above it. Candidate sources: the
`../../chan-meng-promo-video` repo (renders from `dist/video-data.json`), or a
straight-to-camera intro.

---

## 2. ~~Gavigo — one canonical role, two LinkedIn positions~~ — CLOSED 2026-09-02

Three names for the same job:

| Where | Says |
|---|---|
| `70-linkedin.yaml` `experience[Gavigo].positions[0].title` | `Founding Engineer` |
| that position's description body (and canonical) | `Founding Principal Engineer` |
| `10-career.yaml` `work[gavigo].position` | `Founding Principal Engineer, Activation, Execution & AI Systems (prev. Core Engineer)` |

The rewrite made the **body** agree with canonical and left the display title
alone. Deeper issue: canonical holds **one** Gavigo work entry while LinkedIn
splits the tenure across **two** positions, so `Core Engineer (M1 Prototype)`
exists canonically only as the `(prev. Core Engineer)` parenthetical.

`check-linkedin-sync.mjs` does **not** catch this — its title check only runs on
single-position companies, and Gavigo has two.

**Resolved (a):** the LinkedIn display title is now `Founding Principal
Engineer`, matching the body and canonical. The two-positions-vs-one-work-entry
asymmetry is accepted and left as-is — LinkedIn splits the tenure for readability,
canonical keeps it as one role with a `(prev. Core Engineer)` parenthetical.

---

## 3. ~~FreePeriod — "six named awards" is loose~~ — CLOSED 2026-09-02

The LinkedIn copy was fixed: it now says *"Seven recognitions landed in
2024–2025: six named awards plus a grant"*, which agrees with the seven items
listed under it (6 awards + the HKUST Entrepreneurship Bridge Grant).

**Still open in canonical.** `10-career.yaml` says `six named awards`
(~L1617) and `6-award streak` in `impactHeadline` (~L1569) while narrating all
seven. Same looseness, unfixed.

**Resolved — strict tally adopted everywhere.** Two of the six were programme
*selections*, not prizes (Tencent Technology Venture Capital Program, Tsinghua
University SDG Open Innovation Marathon). All three places now say **four prizes,
two programme selections and a grant**: the LinkedIn description, the
`10-career.yaml` `impactHeadline`, and the narrative body. `work.freeperiod`
`lastUpdated` bumped via `npm run reviewed`.

---

## 4. FemTech Weekend — Shanghai Summit tense reads pre-event

The description says the summit *"drew 20 confirmed speakers"* — past tense
around the phrase "confirmed speakers", which reads like the event has not
happened. Dates given as June 22–25, 2026. Kept verbatim in the rewrite.

**To close:** if the summit has run, replace "confirmed speakers" with an actual
attendance/outcome fact. If it has not, move the sentence to future tense.

---

## 5. ~~Sanicle — the two positions repeat each other~~ — CLOSED 2026-09-02

`Chief Technology Officer (CTO)` and `Senior AI/ML Infrastructure Engineer` both
claim the **IBM Silver Partner** anchor and both narrate the **Bubble → Next.js
migration**. The overlap predates the rewrite and was left alone, because
de-duplicating across two entries is a judgement about the pair, not about either
one.

The guidance is explicit that a profile should *curate, not archive* — a visitor
scrolling two consecutive entries at the same company currently reads the same
two facts twice.

**Resolved — split by altitude.** The CTO entry owns **IBM Silver Partner** (a
commercial outcome at CTO level); the Senior AI/ML Infrastructure Engineer entry
owns the **Bubble → Next.js migration** (hands-on delivery). It also matches the
timeline: the migration happened in the earlier engineering tenure, the IBM
partnership came later. Each claim now appears exactly once across the two
entries; the engineer entry keeps the watsonx delivery detail without restating
the partnership.

---

## 6. Not a bug — do not "fix" these

- **`references[]` has 27 entries but LinkedIn shows 26.** Correct. The 27th
  (`daryll-hall`) is a historical-archive entry not on the live page, per the
  header comment in `50-references.yaml`. Any LinkedIn-facing sentence should say
  **twenty-six**.
- **"Seven of the twenty-six recommendations" (Forward with Her).** Verified:
  `work[forward-with-her].narrative.impactDelivered` names exactly seven mentees,
  and `30-recognition.yaml` repeats "7 of 26". One wording was deliberately
  softened — the copy now says the seven *"come from Forward with Her mentees"*
  rather than that they *"specifically credit Forward with Her sessions"*, because
  only three of the seven quotes actually name the programme.

---

## 7. Unrelated, but blocking the PR gate

`npm run check:freshness -- --strict` exits 1 on a clean tree — three
`openSourceContributions` entries are `recency: active` (3-month budget) and
overdue since 2026-05-26:

```
mintlify-docs-4828-mobile-sidebar
awesome-claude-skills-289-typst
awesome-claude-skills-397-typst
```

Pre-existing, untouched by this pass. Fix by re-reading each entry and running
`npm run reviewed -- "openSourceContributions.<id>" --apply` — never by
bulk-bumping `lastUpdated`.
