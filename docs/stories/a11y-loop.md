---
id: a11y-loop
title: a11y-loop
role: Creator and sole developer
period: "2026-07 – present"
status: active
kind: open-source-tool
repos:
  - ChanMeng666/a11y-loop
  - ChanMeng666/a11y-loop-promo-video
live: https://www.npmjs.com/package/a11y-loop
stack: ["Claude Code Skill (Agent Skills open standard)", "Node.js >= 20", Playwright, "axe-core 4.12", "WCAG 2.2 AA", JavaScript, "GitHub Actions CI"]
stories: 7
publicEvidence: []
privateEvidence: 8
diagrams: true
lastResearched: "2026-10-15"
sources:
  - data/profile/23-projects-oss-more.yaml (a11y-loop, a11y-loop-promo-video)
  - data/profile/60-network.yaml (my-life-my-voice)
  - data/profile/80-events.yaml (aotearoa-ai-hackathon-festival-2026)
  - data/profile/70-linkedin.yaml (a11y-loop project copy)
  - docs/STATE.md
  - ChanMeng666/a11y-loop at 2f10252 (README.md, docs/overview.md, AGENTS.md, CHANGELOG.md, skill/a11y-loop/SKILL.md, src/lib/{finding,fingerprint,diff,axe-runner}.js, hooks/plan-gate.mjs, .github/workflows/, evals/benchmark-results.md, git log, merged PRs 1–8)
  - linkedin/posts.yaml and linkedin/posts/2026.yaml (launch post of 2026-08-11)
  - GitHub API and the npm registry and downloads API, read 2026-10-15
  - Chan's email correspondence with My Life My Voice, 2026-08-11 – 2026-10-05 (private; counted under Evidence)
---

## In one breath

AI coding assistants now write a lot of website code, and by default much of it
shuts out people who use a keyboard, a screen reader or high-contrast settings.
I built a11y-loop, a free open-source tool that teaches the assistant the
accessibility rules before it writes, then checks the result in a real browser,
has the assistant fix what failed, and checks again. It also says plainly what a
machine cannot check. I built it in a week and published it to npm before the
Aotearoa AI Hackathon Festival 2026, where a disability-led New Zealand
organisation, My Life My Voice, had set exactly this problem; after a live
walkthrough its CTO said they will adopt it and promote it within their
development team.

## The problem

AI coding agents produce interfaces fast, and inaccessible ones by default:
missing focus indicators, unlabelled controls, contrast that fails at a ratio
nobody measured. The obvious fix, telling the model to "be accessible", does not
work: the research the project cites (W4A'25) measured a slightly *higher*
violation rate with accessibility-oriented prompts than without.

The usual remedy is a late audit against one static page load. That misses every
state a user actually reaches (an open dialog, an expanded menu, a form showing
its errors), arrives after nobody wants to touch the UI, and often reports a
"pass" the tool has no standing to claim. My Life My Voice's challenge brief at
the hackathon named the same bottleneck: accessibility sits outside the tools
developers use, as a manual check at the end.

## What I built

Two halves sharing one rule set, plus an optional third. An Agent Skill on the
open Agent Skills standard tells the agent what to decide while planning, what to
write by default, how to run the audit loop and how it is allowed to describe the
result; the same `SKILL.md` works in Claude Code, Cursor, Copilot and other
clients. A Node CLI does the verification: it drives Playwright and Chromium over
the built page and its interaction states, runs axe-core against WCAG 2.2 AA plus
checks of its own, and partitions the result into failed, needs review, and not
checkable by automation. An optional Claude Code plugin enforces the planning step.

- `a11y-loop audit`: five rendering passes per run (default, dark mode, forced
  colors, reduced motion, a 320 px reflow viewport), plus states the agent
  scripts with `--interact`. JSON report with the WCAG success criterion and ACT
  rule per finding, a generated manual-review checklist, SARIF as a secondary
  format, and exit codes 0/1/2 as a stable contract.
- Own checks axe-core cannot run: tab order, focus visibility, dialog focus trap,
  Escape and focus return, target size, reduced-motion effectiveness, ambiguous
  link text, clickable `div`s.
- `a11y-loop diff`: matches findings across two runs by a stable fingerprint and
  marks each FIXED, NEW or REMAINING; a NEW violation fails the run.
- `a11y-loop contrast --fix`: checks a colour pair and proposes passing colours
  in OKLCh that keep the hue.
- A `PreToolUse` hook on plan approval that declines, once, a UI plan with no
  accessibility section.
- Released from GitHub Actions to npm by OIDC trusted publishing with
  provenance; a promo film made under the same "nothing mocked up" rule.

## Stories

### S1. A loop, not a better prompt and not a one-shot linter

- **Kind**: decision
- **Situation**: I wanted coding agents to produce accessible UI. The cheapest
  option was a paragraph of instructions; the conventional one was a linter or an
  audit at the end. The published evidence said instructions alone barely move
  the result, and a single page-load audit misses the states where interfaces
  actually break.
- **What I did**: I split the job by what each half can be trusted with. The
  model gets rules up front (the skill), because prevention is cheaper than
  repair. Judgement of the result goes to a deterministic engine: a real browser,
  axe-core, and my own checks, across five rendering passes and the states the
  agent says it built. The skill makes the loop mandatory: audit, fix in the
  source, re-audit to a new file, diff, and repeat until there are no violations
  and no NEW findings. Exit codes are the contract, so the agent branches on
  `0/1/2` rather than parsing prose.
- **Result**: on the seeded demo page the loop takes 163 detectable failures to
  0, reproducibly. In a small self-audited benchmark (6 components, one run per
  condition) the baseline produced 35 violations, the skilled agent 1 on first
  generation and 0 after the loop. I state those caveats wherever the number
  appears.
- **Engineer's angle**: the agent is never the judge of its own output. The
  loop's termination condition is computed by code (`diffReports()` returns
  `converged` and `regression`), and the skill forbids substituting a reading of
  the code for the audit when no browser is available: it must say the change is
  unverified.
- **Plain version**: the assistant writes, a real browser checks, the assistant
  fixes, and it keeps going until the checker, not the assistant, says it is done.
- **Follow-ups**:
  - *Why not just run axe in CI?* You can (the CLI has a CI mode), but CI finds
    problems after the pull request. The loop puts the check inside the agent's
    own edit cycle, where a fix costs one more iteration.
  - *What stops the loop running forever?* The diff detects oscillation (the same
    finding alternating FIXED and NEW), and the skill tells the agent to stop and
    change approach rather than nudge the value again.
  - *Isn't the benchmark circular?* Yes, partly: the tool grades the loop it
    drives. Every finding is grounded in axe-core, a third-party engine, and the
    benchmark file says an independent audit would be needed to close the gap.

### S2. Fingerprints that tell "fixed" from "moved"

- **Kind**: implementation
- **Situation**: a loop needs to know whether the last edit fixed a finding,
  merely moved it, or broke something else. Raw counts hide that: a run that
  fixes six things and breaks one shows a lower total and looks like progress.
- **What I did**: I gave every finding a stable fingerprint, a hash of the rule
  id, the normalised selector ancestry, and the *shape* of the element's HTML:
  tag name, sorted attribute names, and the values of only `role` and `type`.
  Rewording a label or renaming a CSS class keeps the fingerprint; turning a
  `<div>` into a `<button>` changes it. `diff` matches two reports on those
  fingerprints and classifies each finding. Any NEW violation is a regression and
  fails the command even when the total went down. Findings that several passes
  report are merged by fingerprint and state, keeping the list of passes each
  appeared in.
- **Result**: the demo's convergence is a checkable verdict
  (`Converged: all 163 violations fixed, none introduced`) rather than an
  assertion, and the same diff is what an agent reads between iterations.
- **Engineer's angle**: choosing what goes into the hash is the whole design. Too
  much (attribute values, text) and every cosmetic edit invents a new finding;
  too little and a real semantic change looks like the same bug.
- **Plain version**: each problem gets a name that survives small edits, so the
  tool can tell "fixed" from "moved somewhere else".
- **Follow-ups**:
  - *What if the DOM is restructured?* The selector changes, so the finding shows
    as fixed plus new. That is the safe direction: it fails the run and a person
    or the agent looks.
  - *Why include `type` and `role`?* They change what an element is to assistive
    technology; `<input type=checkbox>` and `type=text` are different controls.

### S3. Saying what it could not check

- **Kind**: decision
- **Situation**: accessibility tooling has a credibility problem: overlay
  products that promised compliance have been fined, and hundreds of
  practitioners have signed a public fact sheet against them. Automated rules
  reach only part of WCAG at all.
- **What I did**: I made honesty part of the contract, not the copy. The engine
  keeps three severities: violations block; axe's `incomplete` results and my own
  checks that find something they cannot judge go to `needsReview`, never
  silently into passes; best-practice rules never count as violations. Every run
  emits a manual-review checklist scoped to what was built. The skill's §3 lists
  phrases the agent may never use ("accessible", "WCAG compliant", "guarantees")
  and requires the coverage limit with its denominator: 17 of the 55 WCAG 2.2
  A/AA success criteria have any automated rule at all. Alt text the agent writes
  is marked as a draft for a person to confirm.
- **Result**: the same rule bound my own outreach. When I handed the project to
  My Life My Voice, the email, the contact form and the LinkedIn post made no
  compliance claim, cited coverage with its denominator, and left out the
  flattering 35 → 1 → 0 benchmark, because N=6, single-run and self-audited
  cannot be caveated properly in a social post; I used the reproducible 163 → 0
  demo instead.
- **Engineer's angle**: an LLM reads whatever the tool emits and repeats it. If
  the report says "pass", the agent tells the user "accessible". Giving the
  agent the exact sentence to say instead is how the honesty survives the hop
  from tool to model to human.
- **Plain version**: a clean result means "no problems a machine can find", and
  the tool always lists what a person still needs to test.
- **Follow-ups**:
  - *Doesn't this make the tool look weaker?* It makes it usable by people who
    have to defend an accessibility position. A badge they cannot defend is a
    liability.
  - *What does the agent do with `needsReview`?* Resolve it by reasoning about
    the source and report what it did, never treat it as a pass.

### S4. Running it on my own live site found the tool's blind spot

- **Kind**: difficulty
- **Situation**: I ran a11y-loop over the live ArchCanvas site (archcanvas.uk)
  across a full audit-fix cycle. In the state where the mobile menu was open, it
  reported keyboard-unreachable elements and a dialog that failed to trap focus.
  The menu was a Base UI sheet whose focus trap worked.
- **What I did**: I traced it to one line. The keyboard survey's root was
  `document.querySelector(':modal') || document.body`, and `:modal` only matches
  a native `<dialog>` opened with `showModal()`. Every React popup library ships a
  portalled `<div role="dialog">` instead, often without `aria-modal`. So the
  survey started outside the open dialog and spent its Tab budget fighting the
  trap: the better the trap, the worse the report. I wrote `modalDialogRoot()` to
  recognise the portalled shape, taught the trap probe to recognise focus guards
  and multi-step wraps, and made it start inside the dialog, because three
  earlier surveys had left focus outside and the library had begun dismantling
  the modal. Each change was measured on the live sheet before and after. A
  fifth, defensive change looked obviously right, moved no measured outcome, and
  was removed instead of shipped. I added a fixture of a correctly trapped
  portalled dialog on which no rule may fire, and the no-trap fixture still
  reports all of its failures.
- **Result**: released as 0.2.5 on 2026-09-13. On the live menu, 0.2.4 had
  reported 2 keyboard-unreachable and 1 focus-order row in each of three runs
  (and a failed trap in two of them); 0.2.5 reported none in all five runs.
  The ArchCanvas pass also produced accessibility fixes in the product itself.
- **Engineer's angle**: a keyboard survey that drives the page faster than the
  page's own `requestAnimationFrame` focus hand-back measures its own interference.
  Re-establish the precondition before measuring, and let the page settle.
- **Plain version**: using my own tool on a real product showed it was blaming
  well-built menus, so I found the cause, fixed it, and proved the fix.
- **Follow-ups**:
  - *How did you know the trap worked and the tool was wrong?* By reading the
    library's focus handling and stepping through it by hand; the fixture now
    encodes that correct shape.
  - *Why not loosen the check?* Loosening would have hidden real failures. The
    fix made the survey look in the right place; the broken-dialog fixture proves
    it still fails what it should.
  - *What about the change you removed?* Mutating the code turned no test red on
    the fixtures or the live page, which is an answer: the symptom it targeted came
    from the wrong root and disappeared with it.

### S5. False positives are documented, never suppressed

- **Kind**: difficulty
- **Situation**: on a real page with dark surfaces, most of the reported
  violations were `color-contrast` rows from the forced-colors pass, and the
  suggested fix colour would have failed in the normal pass. An agent that obeys
  the report would break working UI.
- **What I did**: I reproduced the cause from a checkout: axe-core reads the
  foreground from `-webkit-text-fill-color` before `color`, and Chromium's
  forced-colors emulation forces `color` and the background but not that
  property, so light-on-dark text is compared against a forced white
  background. I had already guarded the narrower gradient case in code (a lone
  forced-colors violation cannot override four passes' "undeterminable"
  verdict). For the general case I chose documentation over a silent rule
  change: a "Field notes" section, mirrored in the skill, lists each known
  non-defect row with its tell, and says what to check before dismissing it.
  Routing those rows to needs-review in code is written down as a
  recommendation, not done, because it changes the exit code and needs its own
  measurement and release note.
- **Result**: 0.2.6 shipped the field notes with no behaviour change. The skill
  now tells the agent that checking a row against its explanation is part of the
  loop, while disabling a rule never is.
- **Engineer's angle**: when your oracle has a known bug, the options are patch
  the oracle, patch your interpretation, or teach the reader. The last one keeps
  the exit-code contract stable for everyone already relying on it.
- **Plain version**: when the checker is wrong in a known way, the tool says so
  and explains how to tell, instead of quietly hiding results.
- **Follow-ups**:
  - *Why not just turn off contrast in forced colors?* Some of those rows could
    be real; suppressing a rule removes the chance to see them.
  - *How would you decide to move it into code?* Measure the downgrade against
    the fixture matrix and real pages, then release it as a behaviour change with
    a note, since CI users would see different exit codes.

### S6. A plugin that validated and would not load

- **Kind**: incident
- **Situation**: I added an optional Claude Code plugin layer (a plan-approval
  hook and a command) in 0.2.0. The manifest passed
  `claude plugin validate --strict`, but anyone installing it got
  "failed to load".
- **What I did**: I found that a manifest component key *replaces* the
  conventional folder rather than adding to it, so declaring `hooks/hooks.json`
  registered it twice and the whole plugin was rejected. I removed the redundant
  keys, added a `marketplace.json` so the plugin could actually be installed, and
  rewrote every install, upgrade and teardown instruction as a non-interactive
  command I ran verbatim from a clean machine, so an agent can install the tool
  end to end. I also removed a `paths:` block from the skill: it reads like a
  filter but holds the skill out of the model's view until a matching file is
  touched, which made planning and URL-only audits unreachable. Each lesson went
  into `AGENTS.md`, where an agent working on the repo will read it, not only the
  changelog.
- **Result**: the fixes shipped as 0.2.1 to 0.2.4 the same day as 0.2.0. Release
  is a tag push: GitHub Actions publishes to npm by OIDC trusted publishing with
  provenance, with no npm token on any machine or in any secret, and skips a
  version already on the registry so a re-run is safe.
- **Engineer's angle**: the validator checks shape, not loadability, so the only
  real test is installing and reading `claude plugin list`. Equally, the hook's
  full deny-and-revise round trip cannot run headlessly, so the docs say it is
  not verified that way rather than implying it.
- **Plain version**: the official checker said the add-on was fine when it was
  not, so I learned to test by actually installing it, and wrote that down for
  the next person.
- **Follow-ups**:
  - *How does the hook avoid annoying users?* It never blocks on its own failure,
    denies a given plan at most once (by hash), returns "defer" rather than
    "allow" so the user's own approval prompt survives, and has a kill switch.
  - *Why OIDC publishing?* A long-lived npm token is the thing that leaks;
    trusted publishing removes it and adds a signed provenance record.

### S7. Handing it to the organisation that set the problem

- **Kind**: collaboration
- **Situation**: at the Aotearoa AI Hackathon Festival 2026, where I mentored,
  My Life My Voice, a disability-led New Zealand organisation, set
  *Accessible UI Generation for Developers* as a problem statement. a11y-loop
  was already built and on npm before the festival.
- **What I did**: after the competition closed, with nothing scored and no prize
  at stake, I sent the finished MIT-licensed project to the organisation on
  2026-08-11, offering a free walkthrough and a roadmap open to feedback from
  disabled testers, and published a LinkedIn post crediting them. The
  organisation replied within three days and passed it to their CTO, who was on
  leave; once back, the CTO asked to go through it. On 2026-09-04 I gave them,
  as the person who wrote the challenge brief, an hour-long online screen-share:
  pull the public repo, have the coding agent read the docs and install the skill
  and CLI, then run it against my own production sites, such as ArchLang's
  (archlang.uk) and ArchCanvas's (archcanvas.uk). In the same call I helped
  them set up a local development environment from scratch (Git, Node.js, the
  GitHub and Vercel CLIs).
- **Result**: their verdict, hedge included: it "won't do the entire job, but it
  looks like it will be a big help", and "what we really needed was a tool for
  programmers", which is the tool's own premise. Afterwards they told me My Life
  My Voice will adopt a11y-loop and promote it within its development team. It is
  not a paid engagement, not a signed partnership, and not yet a production
  deployment. Later the CTO introduced me to an outside founder who wanted to
  collaborate on a related accessibility product; I chose to keep developing
  a11y-loop instead.
- **Engineer's angle**: the walkthrough was the install path itself: an agent
  following the repo's non-interactive instructions. That is what the 0.2.2
  rewrite was for.
- **Plain version**: I gave the tool to the charity that described the problem,
  showed their CTO how it works, and they plan to use it.
- **Follow-ups**:
  - *Is it in production there?* Not that I can show yet; it is a stated
    commitment, and I describe it as "being adopted".
  - *What did the feedback change?* It confirmed the target user (developers,
    not end users) and the honesty stance; I am keeping the tool in maintenance,
    answering issues rather than adding features.

## Numbers I can say

| Figure | Source |
|---|---|
| Built 26 Jul – 1 Aug 2026, published to npm before the festival (7–8 Aug) | `23-projects-oss-more.yaml` › a11y-loop › narrative.outcomes |
| npm version v0.2.6, 10 published versions (npm registry, 2026-10-15) | `23-projects-oss-more.yaml` › a11y-loop › metrics |
| Live ArchCanvas mobile menu: false keyboard and focus-trap rows from 2 + 1 (+ 1) per run over three runs on 0.2.4 to 0 in all five runs on 0.2.5 | `narrative.outcomes`; `CHANGELOG.md` 0.2.5 |
| Demo page: 163 detectable failures → 0 after the loop | `narrative.outcomes`; README card; `demo/` in the repo |
| Benchmark: 35 → 1 → 0 violations, N=6 components, single run, self-audited (always with these caveats) | `narrative.outcomes`; `evals/benchmark-results.md` |
| 17 of the 55 WCAG 2.2 A/AA success criteria have any automated rule | `narrative.outcomes` |
| Five rendering passes per audit | `publicSummary` / README |
| Handover 2026-08-11; walkthrough 2026-09-04; adoption stated (Chan's account) 2026-09-17 | `narrative.outcomes`; `60-network.yaml` › my-life-my-voice |
| Promo film: 2:59, 5,370 frames at 1920×1080, 30 fps; 3 masters | `23-projects-oss-more.yaml` › a11y-loop-promo-video › metrics |

## In hindsight

- I would have tested the plugin by installing it before tagging 0.2.0, instead
  of trusting the validator; a run of same-day patch releases was the cost.
- The portalled-dialog blind spot would have surfaced sooner had the fixture
  matrix included a *correct* portalled dialog from the start, not only broken
  ones. Fixtures of correct behaviour are regression guards too.
- The benchmark is small and self-audited. An independent audit, by a different
  tool or a person, would make it a claim rather than an illustration.
- The tool has had little outside use on GitHub so far; a first external issue
  would test the docs harder than I can.

## Evidence

- **My Life My Voice** (`60-network.yaml` › `my-life-my-voice`, category
  `adopter`): live walkthrough on 2026-09-04; the CTO's words, quoted above, are
  recorded in `projects[a11y-loop].narrative.outcomes`. The meeting is
  self-attested: the transcript is held privately and is not published.
- **Launch post**, LinkedIn, 2026-08-11 (`linkedin/posts.yaml`, post
  7492769690893635584), crediting My Life My Voice.
- **Context**: Outstanding Mentor Award (2026) at the Aotearoa AI Hackathon
  Festival 2026 (`30-recognition.yaml`), the event where the problem statement
  was set; the award is for mentoring, not for this tool.
- **Public record of the dogfooding**: a11y-loop's own `CHANGELOG.md` 0.2.5
  entry, measured against the live ArchCanvas mobile menu.
- 8 private items in `_private/a11y-loop/evidence.md` (counted, not quoted):
  written reactions from the organisation's CTO and its partnership lead, the
  walkthrough's booking and record, and the outside approach that followed.

## Open questions

Settled on 2026-10-15: the production sites in the S7 walkthrough were Chan's
own live products, such as ArchLang's (archlang.uk) and ArchCanvas's
(archcanvas.uk).

- **No GitHub stars, forks or outside issues** as of 2026-10-15; npm downloads
  are the only public usage signal and are not in the shard.
