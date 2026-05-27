# Recommendations Wave 1 — 4 new LinkedIn endorsements (2026-05)

> **Purpose.** Capture the 4 new LinkedIn recommendations Chan received on
> 2026-05-25 (one work-day before this wave), promote the public-visible count
> from `13` → `17`, and bring the `references[]` ordering, copy, and ripple
> counts (5 inline mentions across `data/profile.yaml`) back in sync with the
> live LinkedIn page at
> `linkedin.com/in/chanmeng666/details/recommendations/`.

---

## The 4 new entries (top of `references[]`, newest-first)

All four were posted on **2026-05-25** within ~hours of each other and reflect
two distinct relationships:

1. **Three She Sharp website-team collaborators** (Lesley, Nirmala, Yesha) —
   triggered by Chan's leadership of the no-code-Webflow → Next.js 15 +
   PostgreSQL + Drizzle + Stripe rebuild of `shesharp.org.nz` (`work[id=she-sharp]`).
2. **One GAVIGO founder/CEO endorsement** (Saba Gecgil) — capturing Chan's
   activation/execution-pipeline engineering work at GAVIGO Inc.
   (`work[id=gavigo]`).

| # | Name | tier | featured | LinkedIn relationship | Anchors |
|---|---|---|---|---|---|
| 1 | **Lesley Gao** | secondary | — | Worked with Chan on the same team | She Sharp ambassador / website team |
| 2 | **Saba Gecgil** | primary | **true** | Managed Chan directly | GAVIGO Inc. founder/CEO |
| 3 | **Nirmala Chinnappan** | secondary | — | Worked with Chan on the same team | She Sharp + AUT MIT-PM |
| 4 | **Yesha Kaniyawala** | secondary | — | Worked with Chan on the same team | She Sharp + Possibl.ai |

**Tier rationale.** Saba is the only one of the four who sits in a senior /
managerial relationship to Chan (Founder & CEO who managed Chan directly), so
she lands in `primary` with `featured: true` — matching the existing pattern
where every `primary` reference also carries the `featured` flag (Cecilia Yin,
Paige Afanu, Gabrielle Hurst, Patricia Anthony). The three She Sharp
collaborators are peer-team relationships, so they land in `secondary` like
Chaste Christopher Inegbedion and the Forward-with-Her mentee cohort.

**Featured rationale.** Saba's testimonial is the most narratively dense piece
of independently-attested evidence for Chan's GAVIGO engagement to date,
explicitly grounding the activation/execution pipeline work, the orchestration
behavior work, the telemetry / demo reliability work, the
public/investor/operator surfaces, and the compute-backed proof systems —
making it eligible to surface in the README's compact "More recommendations"
section.

---

## Pronoun note (Saba's testimonial)

Saba's recommendation uses `he/his` pronouns when referring to Chan. The
testimonial body is preserved verbatim — recommendation copy is never edited
in this repo because the value of the artefact is its first-person
authenticity (a tradition continued from the existing 13 entries). No
correction or annotation is added in the YAML; the LinkedIn artefact is the
authoritative public record.

---

## Headshot assets

Four new files copied + renamed under `public/recommendations/` to follow the
existing `Title-Case-Dash.ext` convention:

| Source (Downloads/LinkedIn/) | Destination (public/recommendations/) |
|---|---|
| `lesley-gao.jpg` | `Lesley-Gao.jpg` |
| `saba-gecgil.png` | `Saba-Gecgil.png` |
| `nirmalachinnappan.jpg` | `Nirmala-Chinnappan.jpg` |
| `yeshakaniyawala.jpg` | `Yesha-Kaniyawala.jpg` |

(`Saba-Gecgil` keeps its `.png` extension; the others stay `.jpg` — matching
the per-asset source extension as `Robin-Lee.jpeg` / `Omopeju-Afanu.jpg` /
`Daryll-Hall.jpeg` already do.)

---

## Ripple updates (5 inline mentions of the public count)

`references[]` is the source-of-truth roster, but the *count* is referenced in
several narrative blocks. All five mentions of `13` were updated to `17` (and
the parallel word forms `thirteen` → `seventeen`):

| Line (post-insert) | Field / Block | Before | After |
|---|---|---|---|
| 1327 | `work[forward-with-her].narrative.impactHeadline` | "7 of Chan's **13** public LinkedIn recommendations" | "7 of Chan's **17** public LinkedIn recommendations" |
| 1361 | `work[forward-with-her].narrative.impactDelivered` | "seven of the **thirteen** public LinkedIn recommendations" | "seven of the **seventeen** public LinkedIn recommendations" |
| 1438 | `work[forward-with-her].summary` | "Seven of the **13** public LinkedIn recommendations" | "Seven of the **17** public LinkedIn recommendations" |
| 10320 | `certificates[forward-with-her].# comment` | "7 of **13** LinkedIn recommendations" | "7 of **17** LinkedIn recommendations" |
| 13128 | `meta.x_brand.statisticsClaims[].claim` (LinkedIn-recs roster) | "**13** LinkedIn Recommendations Received … Nov 2024 – Nov 2025 …" | "**17** LinkedIn Recommendations Received … Nov 2024 – May 2026 …" + roster expansion to name Saba / Lesley / Nirmala / Yesha + verifiedAt bumped to `2026-05-27` |
| 13134 | `meta.x_brand.statisticsClaims[].claim` (FwH-mentorship) | "seven of the **thirteen** public LinkedIn recommendations" | "seven of the **seventeen** public LinkedIn recommendations" |

The Forward-with-Her cohort numerator stays at **7** — none of the four new
recommenders are FwH mentees, so the denominator is the only thing that
shifted (7-of-13 ⇒ 7-of-17). All FwH-cohort names already in the long-form
roster (Siyu Xing, Amy Li, Di Peng, Mi Su, Shushu Qin, Yijia Robin Lee, Shiyu
Fang) remain unchanged.

---

## Header-comment update on `references:`

```diff
 references:
   # Ordered newest-first to match LinkedIn's "Recommendations Received" display order.
-  # All 13 entries below are the complete public set on Chan's LinkedIn profile
-  # (linkedin.com/in/chanmeng666/details/recommendations/) as of 2026-05-17.
+  # Of the 19 entries below, 17 are the complete public set on Chan's LinkedIn profile
+  # (linkedin.com/in/chanmeng666/details/recommendations/) as of 2026-05-27.
+  # The remaining 2 (Di Peng, Daryll Hall) are historical-archive entries preserved
+  # from earlier README snapshots — see their per-entry givenAtNote / historicalArchive
+  # fields.
```

The "19 total / 17 public" split clarifies the gap that already existed between
the YAML roster (which preserves Di Peng + Daryll Hall as historical archive)
and the live LinkedIn page (which currently only renders the 13 — and now 17 —
publicly visible recommendations).

---

## Verification

- `npm run validate` — JSON-schema check (`references[].name` + `reference`
  are the only required props; everything else is `additionalProperties:
  true`-compatible).
- `npm run build` — regenerates `README.md`, `dist/`, `llms.txt`,
  `llms-full.txt`. Saba's `featured: true` flag means her testimonial will
  appear in README's "More recommendations" detail section alongside Cecilia,
  Paige, Gabrielle, and Patricia.

## Status

- [x] Headshots copied + renamed (4 files, Title-Case-Dash convention)
- [x] 4 new `references[]` entries inserted at top
- [x] Header comment updated (count + date)
- [x] 5 inline count references updated (13 → 17 / thirteen → seventeen)
- [x] Roster claim at line 13128 expanded with 4 new names + date range +
      verifiedAt bumped
- [x] `npm run validate` passes
- [x] `npm run build` regenerates README/dist/llms cleanly
