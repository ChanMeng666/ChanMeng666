# Claim discipline

How to write a sentence about your own work that survives someone checking it.

Every rule here fired on this repo's own copy at least once. The before/after
pairs are real — they are the September 2026 audit, not illustrations. Claims
about *method* are unmarked; claims about *measured behaviour* are tagged
`[verified]`.

The governing question, before any rule:

> **What is the smallest thing I owned end to end?**

Write that. Scope every ownership word to it. Then stop.

---

## 1. The ownership ladder

Map what the source says to what the copy may say. One step, never two.

| The record says | You may write | You may not write |
|---|---|---|
| Built it alone, start to finish | `sole engineer of <module>`, `built solo`, `owned <module> end to end` | `owned the platform` when you owned one layer of it |
| Led or drove it, with others | `led <named workstream>`, `architected <named system>` | `sole`, `every`, `100%` |
| Contributed to it | `contributed <the specific thing>`, `merged N PRs into X` | `maintainer`, `core author`, `built X` |
| Advised, reviewed, or was consulted | `advised on <thing>`, `reviewed <thing>` | any verb that implies you shipped it |
| Planned, scoped, or intend to | `currently building`, `planned` | any past-tense shipped claim |

**The qualifier is the load-bearing word.** If you can delete the scoping phrase
and the sentence still reads fine, the scope has quietly expanded to fill the
sentence. `Owned the Intelligence Layer of an app-activation platform` breaks if
you delete *of an app-activation platform*; `Owned the platform` does not, which
is exactly why it is the weaker claim.

A title is not a scope. Being CTO of a four-person company does not license
`led engineering` if you *were* engineering — say `sole engineer`, which is both
truer and more impressive.

---

## 2. `0 → 1` is a claim about a system, not about your effort

`Built X from 0 to 1` may only be used when the thing did not exist. If the
system existed and you changed it, use an arrow instead:

- `Fixed workflow → ReAct`
- `no-code prototype → multi-tenant B2B SaaS`
- `Next.js marketing site → Docusaurus editorial platform`

The arrow form is usually *more* impressive, because it names both endpoints and
therefore the size of the move. `0 → 1` with no stated "0" is unfalsifiable, and
a reader who checks the commit history will find the "0" was a working product.

---

## 3. Every number carries its basis in the same sentence

A number without a basis is a decoration. Three things qualify as a basis, and
a number needs whichever ones apply:

- **Denominator** — `471 of 488 commits`, not `96.5% solo`. `19-user cohort`,
  not `strong engagement`.
- **Window** — `over 4 months`, `since 2014`, `through 2026`, `measured
  2026-09-07`. A count with no window silently claims to be current.
- **Measurement basis** — `p50 over 20 iterations per path on live Kubernetes`,
  not `sub-millisecond`. `84.6% warm-pool hit rate` needs to say it was measured
  in production, because the same number from a local benchmark is a different
  claim.

Percentage points and relative percent are different quantities. 60% → 70% is
**10 percentage points**, not "a 10% improvement" (that would be ~16.7%). Never
mix them, and never add two metrics with different denominators.

**A number that is not in a shard does not exist.** `scripts/check-copy.mjs` R8
enforces this: every claim-shaped number on a CV, LinkedIn or cover-letter
surface must appear somewhere in `data/profile/`. This is not bureaucracy — it
is the only mechanism that catches a number going stale on four surfaces at once.

> `[verified]` On 2026-09-07 the echook shard entry said `37 hook events`,
> `248 tests` and `v6.3.4`. The truth was 39 (plus 44 matcher variants), 399 and
> v6.5.1. By then the stale `37` had been copied into `cv/extended.typ`,
> `cv/build-llms-txt.mjs` and `70-linkedin.yaml`, and the stale `248` into all of
> those plus `cv/cover-letter/EVIDENCE.md`. One un-refreshed shard entry became
> five wrong surfaces, and every existing gate passed the whole time. R8 exists
> because of this.

---

## 4. A superlative needs a comparison set you can enumerate

`first`, `only`, `earliest`, `largest`, `best`, `leading`, `every`, `#1`. Each is
allowed **only** if you can list what it was compared against, or if you attribute
it to whoever made the claim.

Two legitimate escapes:

- **Enumerate it.** `four Claude Code extension surfaces: hooks, skills, status
  line and plugin packaging` — now the reader can check all four.
- **Attribute it.** `an organisation self-described as China's first in women's
  health technology` — the superlative is the organisation's published claim, and
  the sentence says so.

> **Before** `the production work behind shipping *every* Claude Code extension surface: CLAUDE.md, hooks, status line, plugins`
> **After** `the production work behind shipping *four* Claude Code extension surfaces: hooks, skills, status line and plugin packaging`
>
> Two failures in one clause. `every` named a set nobody can enumerate — Claude
> Code also has slash commands, MCP servers and output styles. And the
> enumeration was factually wrong: the plugin ships a `skills/` directory, not a
> CLAUDE.md. The repo-root CLAUDE.md is a contributor file. `[verified]` against
> the plugin tree, 2026-09-07.

> **Before** `An earliest-ecosystem Model Context Protocol server`
> **After** `One of the earliest Model Context Protocol servers`
>
> Also fixes a grammatical error nobody had noticed — *an earliest* is not
> English. Ungrammatical copy in a résumé is read as carelessness, and it is the
> cheapest possible thing to lose points on.

---

## 5. A company's result is not your result

`earned`, `won`, `secured`, `raised`, `landed`, `closed` — when the subject is an
organisation, you are claiming causation over an outcome with many inputs.
Reference checks are where this breaks.

> **Before** `integrated IBM watsonx behind a Gemini fallback, the work that earned Sanicle its IBM Silver Partner certification`
> **After** `integrated IBM watsonx behind a Gemini fallback, the integration behind Sanicle's IBM Silver Partner certification`
>
> *behind* states the same adjacency without asserting the causal chain. The
> strongest available third-party wording was a manager's "played a pivotal role
> in securing our IBM MVP" — which is support for contribution, not for sole
> causation.

The same applies to a project's popularity sitting next to your contribution:

> **Before** `CopilotKit contributor · 2 merged PRs · 36.1k stars`
> **After** `2 merged PRs into CopilotKit (36.1k-star project)`
>
> The stars belong to CopilotKit. In a row of Chan's own numbers — followers,
> subscribers, own-repo stars — the halo does the work whether or not you intend
> it. The parenthetical marks the number as a property of the project. This
> repo's own `cv/cover-letter/EVIDENCE.md` already said so: *"CopilotKit's 36.1k
> stars are context, not achievements."* The copy had simply drifted from the
> rule.

---

## 6. Six constructions to refuse

These are not clumsy writing. They are techniques that work — which is why they
need a name and a standing refusal. Detect them in your own drafts.

1. **Scope omission.** Stating a role but never its size or layer, so the reader
   fills the gap generously. Presented by its practitioners as "not deleting,
   just not adding". It is a claim by omission and it fails the naive-reader
   test by design.
2. **Parallel packaging.** Bundling a strong item with weak ones under a promoted
   parent brand — `Alibaba Open Source Contributor — Higress · OpenYurt · Spring
   AI Alibaba`, where two of the three have zero public evidence. The halo
   back-fills the weak items to the strength of the strong one.
3. **Title inflation.** `Contributor` → `Maintainer` → `core author`. Checkable
   against the project's own contributor list in about thirty seconds.
4. **Brand adjacency as achievement.** A star count, an accelerator, a funding
   round or a famous logo placed next to your name with no stated contribution.
5. **Terminology adjacency.** Calling frontend, docs or glue work `AI Infra`
   because it happened near an AI team.
6. **Visibility as substance.** A fork list, a README edit count, or an issue
   opened before any code, presented as participation.

The published rationale for these techniques concedes that they "cannot survive
deep verification" and only work "as long as nobody looks closely". This repo is
built on the opposite bet: every claim traces to a shard, and the shards trace to
artifacts. That bet only pays if it holds everywhere, so a single packaged claim
costs more than it earns.

---

## 7. Outcomes, not duties

Nobody was hired to *be responsible for* things.

| Refuse | Prefer |
|---|---|
| `Responsible for the AI platform` | `Tap a game in a feed and it plays instantly — built the Intelligence Layer that holds that promise under load` |
| `Worked on mentor matching` | `mentor matching scored by GPT-4o-mini across five weighted dimensions with a rule-based fallback` |
| `Helped with the migration` | `a cross-cloud migration in a 30-minute cutover, rebuilding registry, ingress and certificates across five deployments` |

Open with what changed and for whom; the stack that made it happen comes second.
A summary that opens with a duty verb has spent its most valuable position on the
least interesting fact.

---

## 8. Sentences a reader has to read twice

- **One idea per sentence.** If a bullet grows to two sentences, split it or cut
  the second — never cut the metric.
- **Each punctuation mark does one job.** A sentence with two colons has none.
  `[verified]` The GAVIGO bullet ran 68 words through two colons and two
  semicolons, with the second colon doing a job the first had already claimed.
  Re-punctuating it — colon introduces the system, em dash introduces the
  measurements, semicolons separate achievements — cost nothing and lost no
  metric.
- **No calques, no run-ons, no misspelled identifiers.** `navigatior` for
  `navigator` in a public issue is a small thing that is read as a large one.
- **Delete the self-diminishers** — *just*, *only*, *merely*, *a bit of*. Deleting
  a hedge is not the same as deleting a scope word: `I just did the frontend` →
  `I built the frontend` is honest; → `I built the product` is not.

---

## 9. The four tests, in order

Run these in your head before the script runs its rules.

1. **Naive reader.** Would an ordinary reader take this more favourably than the
   evidence supports? The favourable reading is the claim you made.
2. **Referrer.** *It is never the job of the person referring you to sell you.*
   Does this copy back up what a referrer just said about you?
3. **Interview Ready.** Would you say this, in this tone, with a hiring manager
   opposite you?
4. **Send-my-way.** After the intro, does the reader know exactly who to send
   your way?

A claim that passes all four and still feels weak is usually not a writing
problem — it is a missing artifact. Go build or find the artifact.
