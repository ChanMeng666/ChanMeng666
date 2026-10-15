---
title: The threads through Chan Meng's engineering work
lastResearched: "2026-10-15"
sources: [archcanvas, archlang, gavigo-ire, she-sharp, eatropolis-website, femtech-weekend-website, lyzen-website, tam-ai-ti, corde-mobile-application, ai-programming-teaching-project, echook, a11y-loop, google-news-mcp]
---

# The threads through my engineering work

The cross-project version of the story files in this folder. Every claim here
comes from one of them; follow the link for the detail, the figures and their
sources.

## Who I am as an engineer

I build products in which an AI does part of the work and something
deterministic decides whether that work is right: a compiler, a real browser,
a checker, a person with an approve button. Across my own products, client
platforms and open-source tools the same habits recur: I make the output
checkable, I do not trust a green check until I have seen it fail, and I write
down what a number does not measure. Many of the people I build for are not
engineers (a charity founder, a festival organiser, the commissioner of a
research cohort), so a large part of the job is handing the system to them:
content they can edit, review screens, runbooks. I am often the only engineer
on a project, working from Auckland with AI coding agents, which is why my
tools treat agents as first-class callers. When something breaks I trace it to
one cause, then change the process (a rule, a test, a checklist) so that the
whole class of failure cannot come back. My records say plainly what failed and
what I would do differently.

## The threads

### 1. Making AI output checkable

The model proposes; something that cannot be talked round decides.

- [archcanvas S1](archcanvas.md#s1-a-floor-plan-you-can-check-has-to-be-a-program): I stopped asking a model to draw floor plans and gave it a language whose output a compiler can measure, diff and edit.
- [archlang S2](archlang.md#s2-errors-as-data-a-hand-written-parser-and-fixes-a-tool-can-apply): every error carries a stable code, a byte span and, where provable, a fix an agent can apply without reading prose.
- [a11y-loop S1](a11y-loop.md#s1-a-loop-not-a-better-prompt-and-not-a-one-shot-linter): the agent writes, a real browser and axe-core judge, and the loop ends when the checker says so, not the agent.
- [she-sharp S2](she-sharp.md#s2-ai-mentor-matching-that-never-pairs-anyone-on-its-own): the model scores mentor pairs against an explicit rubric, and an admin approves every match.

### 2. Green is not the same as working

The failures I learn most from are the ones that looked like success.

- [archlang S3](archlang.md#s3-the-agent-reference-was-wrong-while-every-check-was-green): a drift check stayed green because it certified a generator that restated the grammar by hand.
- [archcanvas S7](archcanvas.md#s7-a-check-that-can-never-fail-is-not-a-check): when every layer mocks the database, the one probe that touches it must be allowed to block the release.
- [gavigo-ire S7](gavigo-ire.md#s7-redis-had-gone-and-the-health-check-said-healthy): production ran without Redis while the health endpoint said healthy; I made the client self-heal and the status honest.
- [she-sharp S4](she-sharp.md#s4-incidents-that-taught-me-to-break-my-own-guards): a guard is not verified until it has been handed the input it should refuse.
- [lyzen-website S7](lyzen-website.md#s7-push-to-deploy-that-checks-what-the-last-site-taught-me): after a secret listed as present proved empty on the FemTech Weekend site, the next site's pipeline makes a live call with every credential and posts invalid input to production before a deploy counts.

### 3. Designing for handover from the first week

A system is finished when someone else can run it without asking me.

- [corde-mobile-application S8](corde-mobile-application.md#s8-leaving-it-ready-for-the-next-developer): a build guide, translated comments and a work log let a teammate carry the app on after the placement.
- [she-sharp S6](she-sharp.md#s6-designing-the-handover-so-the-answer-is-a-file-not-a-person): every recurring obligation got exactly one named owner, and the handover answers "what stops working when I stop answering?".
- [tam-ai-ti S5](tam-ai-ti.md#s5-handing-production-to-the-client-without-signing-anyone-out): production moved into the client's accounts mid-cohort with no downtime and no one signed out.
- [lyzen-website S5](lyzen-website.md#s5-hosting-in-the-owners-account-with-a-deliberately-narrow-role): the site runs in the owner's own account under a narrow role, and steps outside it became guides in her language rather than requests for more access.

### 4. Building for owners who do not write code

The owner should be able to change the product the day they decide something.

- [eatropolis-website S2](eatropolis-website.md#s2-letting-a-non-technical-client-edit-the-site-github-as-the-cms): the repository became the CMS, with a schema that stops a bad edit before visitors see it.
- [femtech-weekend-website S4](femtech-weekend-website.md#s4-letting-the-founder-run-selection-without-an-engineer): the founder approves or rejects summit applicants in batches, and each decision sends its own email.
- [tam-ai-ti S7](tam-ai-ti.md#s7-building-for-a-client-who-directs-the-product-not-the-code): a demo video at every milestone, then teaching videos so the commissioner could read her own data.
- [she-sharp S5](she-sharp.md#s5-writing-a-charitys-recurring-work-down-as-11-agent-skills): a charity's recurring work written down as agent skills a volunteer can run and check.

### 5. Agents as the user

More and more of my tools are operated by an AI agent on someone's behalf, so I design the interface for that caller.

- [echook S1](echook.md#s1-designing-the-cli-for-an-agent-not-for-a-person): JSON in and out, stable error codes with a suggested recovery command, and a manifest that describes the whole surface.
- [echook S8](echook.md#s8-an-agent-ran-install---help-and-the-cli-installed): after an agent's `--help` triggered an install, help became side-effect-free and unknown input changes nothing.
- [archlang S7](archlang.md#s7-cli-first-for-agents-mcp-only-as-a-doorway): CLI first because it costs an agent nothing until called; MCP as a separate doorway.
- [google-news-mcp S3](google-news-mcp.md#s3-designing-a-tool-whose-caller-is-a-language-model): one tool, a validated schema, and two error channels so the model can recover from an upstream failure.

### 6. Saying what a number does not measure

A figure goes out with its boundary, or it does not go out.

- [gavigo-ire S1](gavigo-ire.md#s1-choosing-the-checkpoint-approach-that-could-be-measured-on-our-own-cluster): three controlled, application-level measurements, published with a note that they are not a production SLA.
- [gavigo-ire S6](gavigo-ire.md#s6-renaming-a-metric-instead-of-overclaiming): when an ad could satisfy "reached first play", I renamed and redesigned the metric rather than report a flattering number.
- [a11y-loop S3](a11y-loop.md#s3-saying-what-it-could-not-check): the tool lists what a machine cannot check and is not allowed to call a page "accessible".
- [eatropolis-website S6](eatropolis-website.md#s6-proving-the-site-would-hold-up-on-launch-day): the load test passed, and the report explains why its latency figure is limited by the load generator.

## Which story for which question

| Interview prompt | Best stories |
|---|---|
| Tell me about a hard bug | [gavigo-ire S4](gavigo-ire.md#s4-compression-had-never-worked-in-production) (compression off only behind the real load balancer); [eatropolis-website S7](eatropolis-website.md#s7-after-launch-the-analytics-showed-nothing) (a one-line `gtag` shim that silenced analytics) |
| A technical decision you would defend | [archcanvas S1](archcanvas.md#s1-a-floor-plan-you-can-check-has-to-be-a-program) with [archlang S1](archlang.md#s1-turning-a-drawing-problem-into-a-language) (a language instead of a better prompt); [gavigo-ire S1](gavigo-ire.md#s1-choosing-the-checkpoint-approach-that-could-be-measured-on-our-own-cluster) (four checkpoint options, one measurable) |
| A conflict or disagreement | [she-sharp S7](she-sharp.md#s7-launching-against-the-founders-bar-not-mine) (pushing back on closing sign-in); [corde-mobile-application S7](corde-mobile-application.md#s7-one-codebase-three-students-new-to-react-native) (refactor now or after features, settled by sequencing) |
| Working with non-technical stakeholders | [tam-ai-ti S7](tam-ai-ti.md#s7-building-for-a-client-who-directs-the-product-not-the-code); [femtech-weekend-website S5](femtech-weekend-website.md#s5-handing-publishing-to-a-non-technical-founder) |
| Leading a team | [corde-mobile-application S7](corde-mobile-application.md#s7-one-codebase-three-students-new-to-react-native) (structuring code and coaching two teammates); [she-sharp S6](she-sharp.md#s6-designing-the-handover-so-the-answer-is-a-file-not-a-person) (one owner per obligation) |
| A failure | [archcanvas S5](archcanvas.md#s5-benchmark-green-production-red) (a benchmark that skipped tools); [ai-programming-teaching-project S4](ai-programming-teaching-project.md#s4-the-tutor-went-down-mid-cohort-and-what-i-hardened-when-i-brought-it-back) (no alert on the tutor) |
| Reviewing someone else's code | [gavigo-ire S8](gavigo-ire.md#s8-reviewing-a-colleagues-measurement-code-against-the-real-cluster) (testing my own hunch on the real cluster first) |
| AI in production | [archcanvas S3](archcanvas.md#s3-the-gate-that-was-computed-and-then-ignored) (the gate as the loop's stopping rule); [tam-ai-ti S2](tam-ai-ti.md#s2-i-took-the-ai-off-five-of-the-eight-pages) (context as a budget) |
| Accessibility | [a11y-loop S4](a11y-loop.md#s4-running-it-on-my-own-live-site-found-the-tools-blind-spot) (the tool's blind spot, found on my own site); [eatropolis-website S5](eatropolis-website.md#s5-wcag-22-aa-with-a-brand-red-that-failed-contrast) (WCAG 2.2 AA with a brand red that failed contrast) |
| Ownership end to end | [eatropolis-website S6](eatropolis-website.md#s6-proving-the-site-would-hold-up-on-launch-day) (contract to launch-day load test); [archcanvas S7](archcanvas.md#s7-a-check-that-can-never-fail-is-not-a-check) (the release pipeline of my own product) |
| Learning something fast | [google-news-mcp S1](google-news-mcp.md#s1-shipping-into-a-protocol-that-was-five-weeks-old) (shipping on a five-week-old protocol); [eatropolis-website S1](eatropolis-website.md#s1-making-nextjs-16-run-on-cloudflares-edge-where-build-green-did-not-mean-works) (Next.js on a runtime that is not Node) |
| An incident under pressure | [gavigo-ire S3](gavigo-ire.md#s3-the-nightly-benchmark-that-took-every-game-offline); [she-sharp S4](she-sharp.md#s4-incidents-that-taught-me-to-break-my-own-guards) |
| Design feedback that rejected your work | [lyzen-website S1](lyzen-website.md#s1-the-thread-that-would-not-sit-still-three-directions-one-approved) (two runtime threads turned down, then a rule that removed both failures); [lyzen-website S3](lyzen-website.md#s3-the-brief-changed-from-an-event-brand-to-a-company) (the brief changed mid-build, the approved design kept) |
| Data migration | [she-sharp S3](she-sharp.md#s3-moving-1549-people-off-mailchimp-without-losing-consent); [gavigo-ire S2](gavigo-ire.md#s2-moving-production-from-digitalocean-to-google-cloud-in-one-evening) |

## Recruiter version

I am a full-stack engineer in Auckland, New Zealand, who builds AI products and
the checks that keep them honest. I founded ArchCanvas, an AI tool that turns a
plain-English brief into a dimensioned floor plan, and wrote ArchLang, the
open-source language behind it. As founding engineer at GAVIGO, a US startup, I
built the platform behind its game feed and moved it to Google Cloud with about
30 minutes of downtime. For She Sharp, a charity for women in tech, I replaced
a no-code website with a platform it owns and moved its 1,549-person mailing
list with zero failed sends. I built Auckland's Eatropolis festival website,
which passed a 1,000-visitor load test without an error, and an AI coach in te
reo Māori and English used by a 19-person research cohort. My free tools for AI
coding assistants include a Google News server named in DataCamp's Top 10.

## Engineer version

Most of my work is LLM systems with a deterministic referee. In ArchCanvas
(Next.js, Vercel AI SDK, Neon, Drizzle) an orchestrator calls tools, a separate
designer model writes ArchLang, and a ship gate compiles, repairs and lints
every candidate before anything is saved or charged; the loop is bounded on
calls, tokens, wall-clock time and per-call timeout, and a founder-run offline
benchmark passed 26 of 26 briefs. ArchLang is a zero-dependency TypeScript
compiler: hand-written recursive-descent parser with error recovery, 139 stable
diagnostic codes with span-level fixes, count-based resource budgets, and exact
arithmetic where a verdict turns on a tie. At GAVIGO I wrote the Go
orchestrator (WebSocket hub, scorer, rules engine, warm-pool manager driving
the Kubernetes API), moved production from DigitalOcean to GKE, and chose
application-level checkpointing over Pod Snapshots, CRIU and DMTCP. Results: 78%
Application-Level Reduction, 4.45 s → 1.00 s Controlled Startup Path
Comparison, ~140 ms Preserved AI State Restore; controlled application-level
measurements, not a production SLA. The failure class I meet most is the check
that is green and blind: a drift check certifying a hand-typed grammar, a
tool-free benchmark missing an API rejection, a health endpoint reporting
healthy without Redis, a non-blocking accessibility job. My fixes are
structural: liveness split from readiness, a canary that must reach the real
database, guards tested against the input they should refuse. I design CLIs
for agents as callers (JSON only, stable error codes, side-effect-free
`--help`), and hand systems to non-engineers through schema-validated content
in Git, review screens and runbooks.
