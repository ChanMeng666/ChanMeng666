# LinkedIn Copy — Follow-ups (2026-09)

> **STATUS: 5 of 6 closed 2026-09-02; item 8 also closed** — Chan answered the open questions
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

## 4. ~~FemTech Weekend — Shanghai Summit tense reads pre-event~~ — CLOSED 2026-09-02

The description says the summit *"drew 20 confirmed speakers"* — past tense
around the phrase "confirmed speakers", which reads like the event has not
happened. Dates given as June 22–25, 2026. Kept verbatim in the rewrite.

**Resolved — the summit ran, and the copy is now post-event.** Chan supplied
the source material (FemTech Weekend's LinkedIn feed and attendee write-ups).
Facts used, all attributable: it was **China's first global women's health
summit**, in the same five-month window that produced Japan's and Korea's firsts
(per Alice Zheng, Doximity); delegates came from Australia, Canada, China,
Denmark, England, the Netherlands, Singapore, South Korea, the US and Central
Asia (per Alexandra Belyanina's write-up); Bayer ran the pitch competition;
HerAnova Lifesciences was a gold sponsor; the investor panel seated AVPN's
Patient Lu and Gobi Partners' Leo Chen alongside Maryann Umoren Selfe and Alice
Zheng; delivered with Femtech Across Borders as its 2026 Summer Programme.

"20 confirmed speakers" was pre-event language in **five** places. Corrected to
"20 speakers" across `70-linkedin.yaml`, `10-career.yaml` (×3, including
"headlines" → "headlined") and `22-projects-oss-webapps.yaml` (×2). No
attendance figure was invented — none was stated in the source.

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

## 7. ~~Unrelated, but blocking the PR gate~~ — CLOSED 2026-09-02

`npm run check:freshness -- --strict` exits 1 on a clean tree — three
`openSourceContributions` entries are `recency: active` (3-month budget) and
overdue since 2026-05-26:

```
mintlify-docs-4828-mobile-sidebar
awesome-claude-skills-289-typst
awesome-claude-skills-397-typst
```

**Resolved — all 8 overdue entries verified against their live sources, then
bumped.** `check:freshness --strict` now exits 0. The list was longer than the
three visible in the tail: 4 Anthropic certificates and 2 MCP contributions were
also gated.

The review found real drift rather than just stale dates:

- Both `awesome-claude-skills` PRs (#289, #397) were recorded as `state: open`
  awaiting triage. They were **closed by Chan herself on 2026-06-06**, 21
  seconds apart, after ~3 months with no maintainer review; neither skill is in
  either list today. Corrected to `state: closed` + `closedAt` +
  `recency: historical`, with honest `impact` text.
- `mintlify/docs#4828` genuinely is still open and untriaged — no comments, no
  activity since it was filed 2026-03-24.
- All 4 Anthropic certificate URLs still resolve (HTTP 200, name and course
  title both present on the verify page).
- **`mcp-servers#75` had borrowed `#76`'s social proof.** The four quoted
  thanks (@El-Invierno, @rockywangxiaolei, @ZubeidHendricks, @angrysky56) and
  the @jspahrsummers pointer to issue #40 are all on **#76**, not #75. Moved to
  the entry they belong to; #75 now quotes its own two real thanks (@TristanLib,
  @AutomatedMarketer). Its 32 reactions (30 hearts + 2 thumbs-up) re-verified
  and correct.
- **"Three weeks after MCP's public launch" was wrong in 4 places** — the
  comment and issue are dated 2024-11-27 and MCP launched 2024-11-25, so it is
  **two days**. Corrected in both contribution entries, the shard header
  comment, and `90-meta.yaml` `statisticsClaims`. The true number is the
  stronger claim.


---

## 8. ~~OPEN — the repo disagrees with itself on the MCP launch date~~ — CLOSED 2026-09-02

Found while fixing item 7. Two mutually exclusive claims:

| Where | Implies MCP launched |
|---|---|
| `25-contributions.yaml` (both MCP entries), `70-linkedin.yaml:1474` ("35 days after Anthropic's Nov 25, 2024 MCP launch", and Dec 30 − Nov 25 = 35 ✓) | **2024-11-25** |
| `21-projects-oss-primary.yaml:689` + `:826` — first commit `2024-11-25`, described as *"predates MCP public launch by 5 days"* | **2024-11-30** |

Anthropic announced MCP on **2024-11-25**, and two of the three places already
say so — which makes the "predates by 5 days" line the outlier. On that reading
the first commit lands on **launch day itself**, not five days before.

**Resolved — launch date is 2024-11-25, so the first commit landed the same
day.** Corrected in three places in `21-projects-oss-primary.yaml` (a metrics
line and two prose blocks; the third was missed by the first sweep). The repo
now agrees with itself everywhere.

Checked while there and found **correct**, not drift: Google News MCP "35 days"
(shipped Dec 30) and Google Jobs "36 days" (shipped Dec 31) are different
projects with different dates, and both compute correctly from 2024-11-25.
