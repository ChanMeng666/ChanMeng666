---
name: career-copy
description: >-
  Use when a fact about Chan's career changes and the copy has to change with
  it — a new role or project, a shipped feature worth claiming, a metric that
  moved, a title or date correction, a recommendation or award to add, or "make
  this entry sound stronger". Lands the fact in its data/profile/ shard first,
  then propagates it to only the derivative surfaces that earn it, each in its
  own register and budget — the README shopfront, llms.txt and llms-full.txt,
  the designed two-page CV, the ATS resume and its .docx/.txt exports, the
  sixteen-page extended CV, the LinkedIn headline, About, Experience and
  Projects copy, chanmeng.org, and the cover-letter evidence bank. Enforces a
  claim-strength discipline — scope every ownership word, give every number a
  denominator and a window, attribute every superlative, never state a
  company's result as personal — and proves it with `npm run check:copy` plus
  the existing structural gates. Also use to audit copy that already shipped,
  to settle whether a claim is safe to make at all, or to run a LinkedIn
  profile review. Keywords: CV, resume, ATS, bullet points, LinkedIn headline,
  About section, cover letter, personal brand, impact metrics, claim
  verification, overclaiming. Not for the visual layer (brand tokens, cover
  art, OG images) and not for the code that renders these surfaces.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Career copy — one fact, many surfaces

For the remainder of this session, when you touch any career copy in this repo:
**edit the shard first, never a generated file; write each surface in its own
register but never with its own facts; and run the gates before you claim to be
done.** The rules below are not style preferences — each one exists because a
specific claim in this repo was once wrong, or was read by a stranger more
generously than the evidence supported.

Two sentences carry the whole skill.

> **You are not writing eight documents. You are writing one fact eight times,
> and a reader may check any two of them against each other.**

> **The claim you made is the strongest reading a stranger can take from your
> sentence — not the one you meant.**

Everything below follows from those.

## Where the fact goes

Land it in the shard, then decide which surfaces *earn* it. Not every fact earns
every surface; a two-page budget is a budget.

| You have | Land it in | Surfaces that may earn it | Gate that checks you |
|---|---|---|---|
| A new role, or a title/date change | `10-career.yaml` `work[]` | designed CV Experience (5 detailed roles), ATS `PROFESSIONAL EXPERIENCE`, LinkedIn Experience | `check:cv --strict` (dates hard-error), `check:ats`, `check-linkedin-sync` |
| A new project | `20`–`23-projects-*.yaml`, by band | README buckets in `90-meta.yaml`, CV Selected Projects (5 cards), ATS `PROJECTS` (5, gated), extended Ch.3, LinkedIn Projects | `validate`, `check:ats`, `build` |
| A new metric on an existing entry | that entry's `metrics[]` | only where that number already appears | `check:copy` R8 |
| A new award | `30-recognition.yaml` | CV Recognition, ATS `AWARDS AND RECOGNITION` (3 bullets, gated), LinkedIn honors via `_sourceAward` | `check-linkedin-sync` |
| A new recommendation | `50-references.yaml` | LinkedIn recommendations, extended Ch.5 | `validate` |
| A new event/talk | `80-events.yaml` | usually nothing else | `validate` |
| "Make this sound stronger" | **nothing** — this is a rewrite, not a fact | the one surface in question | `check:copy` |

That last row is the one people get wrong. A rewrite that needs a new fact is not
a rewrite; go get the fact and land it in the shard first.

**Never hand-edit a generated file.** `README.md`, `llms.txt`, `llms-full.txt`,
`dist/*`, `linkedin/linkedin-profile.json`, `linkedin/*.md` and
`cv/exports/*.{docx,txt}` are all built. The CV `.typ` files and the
`70-linkedin.yaml` prose are hand-curated *on purpose* — see
[`references/surfaces.md`](references/surfaces.md) for which is which and why.

## Before you write the sentence

Collapse the whole claim question to one:

> **What is the smallest thing I owned end to end?**

Write that, then stop. Scope every ownership word to it. "Owned the Intelligence
Layer" survives a reference check; "owned the platform" does not, and the two
sentences cost the same number of characters.

Then check the sentence against four things a script cannot judge:

1. **The naive-reader test.** Would an ordinary reader take this more favourably
   than the evidence supports? If yes, the favourable reading is the claim you
   made. Narrow it.
2. **The referrer test.** *It is never the job of the person referring you to
   sell you.* When a hiring manager clicks through after a warm intro, this copy
   has to back up everything the referrer just said. If it does not, you have
   spent their reputation.
3. **The Interview Ready test.** Would you say this sentence, in this tone, with
   a hiring manager sitting opposite you? Not a sanitised corporate robot, not an
   unfiltered stream — you, with intent.
4. **The "who do I send your way" test.** After reading the intro paragraph of
   any surface, does the reader know exactly who to send your way? If not, the
   paragraph is about you when it should be about them.

The full mechanics — the ownership ladder, the `0→1` rule, denominators and
windows, and the six packaging constructions to refuse outright — are in
[`references/claim-discipline.md`](references/claim-discipline.md). Read it
before writing any bullet that contains a number or an ownership word.

## Workflow

1. **Land the fact.** Edit the right shard (`CLAUDE.md` has the data map;
   `grep -rn "id: <slug>" data/profile/`). Add the number to `metrics[]` if it
   is a number — a claim whose number is not in a shard fails `check:copy` R8,
   and that is deliberate: the shard is the only place a number is allowed to
   originate.
2. **Pick the surfaces.** Use the table above, then open
   [`references/surfaces.md`](references/surfaces.md) for that surface's register,
   budget and hard rules. **Decide what comes out before you decide what goes in**
   — the ATS resume has under one line of slack at two pages, and the designed CV
   has none.
3. **Write it, once per surface, in that surface's voice.** Same fact, different
   register. Copying a sentence between surfaces is how the wrong register and
   the wrong budget arrive together.
4. **Run the gates.**
   ```bash
   npm run check:copy -- --strict   # the prose gate (this skill)
   npm run check                    # schema, freshness, CV/ATS structure, build, assets
   ```
   If you touched a CV `.typ`: `pwsh cv/build.ps1`, then
   `python cv/verify-ats-exports.py` (not in CI; 2 pages / 11 bullets / 7 `/H1`
   are hard assertions).
5. **Sync the site if a CV PDF changed.** Copy the two PDFs to
   `D:/github_repository/2d-portfolio/public/`, **bump `PREVIEW_V` in
   `src/app/cv/page.tsx` in the same commit**, push. Push is the deploy. The full
   procedure and the reason the bump is not optional are in `cv/README.md`.
6. **Mark it reviewed.** After actually re-reading an entry and confirming its
   facts: `npm run reviewed -- "projects.echook" --apply`. Never bulk-bump
   `lastUpdated` by hand — that destroys the field's only meaning.

## A worked example

Real, from 2026-09-07. **"echook shipped a few releases since I last looked."**

1. **Get the truth, from the artifact, not from memory.** The repo and the GitHub
   API said: v6.5.1 (not v6.3.4), 86 stars (not 84), 156 commits (not 151), 399
   tests (not 248), and 39 canonical hook events plus a concept the shard did not
   have at all — 44 separately switchable matcher variants. The claimed "37 hook
   events" had been true two generations earlier.
2. **Land it in the shard.** `21-projects-oss-primary.yaml`, the `echook` entry:
   `metrics[]` first, then the numbers embedded in `publicSummary`,
   `businessLogic`, `technicalApproach` and `outcomes` prose. A dead link anchor
   turned up in the same read and was fixed while there.
3. **Find every surface that already carried the old numbers.** This is the step
   people skip, and it is why R8 exists:
   ```bash
   grep -rn "37 hook\|248 test\|v6\.3\.4\|84 star" data/profile/ cv/ linkedin/
   ```
   Four more files had them — `cv/extended.typ`, `cv/build-llms-txt.mjs`,
   `cv/cover-letter/EVIDENCE.md` and `70-linkedin.yaml`. Every existing gate had
   been passing the whole time, because none of them read prose.
4. **Rewrite each in its own register.** The extended CV says *"39 hook events and
   a context-window status bar"*; the LinkedIn Projects entry says *"39 hook
   events plus 44 separately switchable matcher variants"* because it has the
   room and the audience; the evidence bank says *"399 unit tests on a 3-OS ×
   3-Python matrix"* because a cover letter needs the measurement basis in the
   sentence.
5. **Gate, rebuild, sync.** `npm run check:copy -- --strict` · `npm run check` ·
   `pwsh cv/build.ps1` (the extended CV's PDF changed, so the site sync was owed)
   · `npm run reviewed -- "projects.echook" --apply`.

The lesson worth keeping: **the shard edit was the easy part.** The work was
step 3.

## What this skill does not carry

It carries **method, not facts**. Three things live elsewhere and must not be
copied here, because a fact in two places drifts:

| Thing | Lives in | Why not here |
|---|---|---|
| The six red lines (what may never be claimed) | `cv/cover-letter/EVIDENCE.md` | They are claims about Chan, and they are already sourced to the shards line by line |
| The banned-word blacklist | `cv/README.md` § "Word blacklist" | `scripts/check-copy.mjs` parses it from there at runtime, so there is exactly one list |
| Every ATS hard rule (fonts, hyphens, margins, tags) | `cv/README.md` § "ATS variant — hard rules" | Each was chosen against measured extractor behaviour; the reasoning has to travel with the rule |

Read the red lines before writing anything client-facing or public. They are six
statements a reference check or a five-minute search would contradict.

## Scripts

| Command | What it answers |
|---|---|
| `npm run check:copy` | Does any surface contain a banned word, an unattributed superlative, an unscoped ownership word, a number with no denominator or window, a company result stated as personal, a duty-verb opener, a run-on, or **a number that appears in no shard**? |
| `npm run check:copy -- --strict` | Same, but error-class findings exit 1. This is PR-gate mode. |
| `npm run check:copy -- --rule R8 --surface linkedin` | One rule, one surface — use while iterating on a single entry. |
| `npm run check:cv -- --strict` | Do the CV role-lines still agree with `10-career.yaml`? Dates hard-error. |
| `npm run check:ats` | Does the ATS resume still parse to its exact expected shape and character band? |
| `npm run check:freshness` | Which entries are overdue for a re-read under their tier's SLA? |

R8 is the one worth understanding: it takes every claim-shaped number on a CV,
LinkedIn or cover-letter surface and requires the same number to exist somewhere
in `data/profile/`. It catches invented numbers *and* numbers left stale on a
surface after a shard update — the failure this repo is most prone to, because
the surfaces are hand-written and the shards are not. Suppress a genuine
exception inline with a `copy-lint-ok:R8` comment on the preceding line; the
script reports the suppression count so they cannot accumulate unseen.

## References

Read on demand; none of it costs context until you open it.

| File | Use it when |
|---|---|
| [`references/claim-discipline.md`](references/claim-discipline.md) | Writing any bullet with a number or an ownership word; deciding whether a claim is safe; auditing copy that already shipped |
| [`references/surfaces.md`](references/surfaces.md) | Choosing which surfaces a fact earns, and what that surface's register, budget and gate are |
| [`references/linkedin.md`](references/linkedin.md) | Touching the headline, About, Experience, Projects, Featured or Services copy; running a full profile review |

## Provenance

Written from auditing this repo's own CV in September 2026, not from a
copywriting textbook. Every rule in `claim-discipline.md` fired on real copy here
at least once.

Three external inputs, used unevenly and deliberately:

- **"LinkedIn for Life"** (Stuart Little, Agency8, with recruiter Janelle — a
  She Sharp event, May 2026). The source of the six-section profile model, the
  service-led About rule, the Interview Ready test and the referrer line.
  Distilled in `references/linkedin.md`. The headline in `00-basics.yaml` was
  already rewritten against this guidance on 2026-09-02; this skill exists partly
  to make that a repeatable review rather than a one-off.
- **`ASu-resume-skills`**, specifically its *audit* half. The ownership ladder,
  the `0→1` rule, the metric-arithmetic discipline and the inflation taxonomy in
  `claim-discipline.md` come from there. Its *generator* half is a Chinese
  long-image résumé format with no ATS model and is deliberately not used.
- **`lofisu-identity-engine`**, used **inverted**. That skill is a persona
  reconstruction built from an exposé of one person's self-packaging; its
  signature techniques — never stating contribution scale, bundling
  zero-evidence items under a strong parent brand, promoting Contributor to
  Maintainer — are exactly what `claim-discipline.md` § "Six constructions to
  refuse" tells you to detect and reject. Its own author writes that the approach
  "cannot survive deep verification". The genuinely useful residue is small: lead
  with identity, use high-certainty verbs, delete *aspiring* and *passionate*,
  keep one retrievable artifact behind every claim, and never ship a run-on.
