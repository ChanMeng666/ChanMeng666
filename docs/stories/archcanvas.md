---
id: archcanvas
title: ArchCanvas
role: Founder and sole engineer
period: "2026-04 – present"
status: live
kind: own-product
repos:
  - private
  - archcanvas/archcanvas
live: https://archcanvas.uk
stack: [Next.js 15, React 19, TypeScript, Vercel AI SDK, OpenAI, GPT Image, ArchLang, Neon Postgres, Drizzle ORM, Neon Auth, Stripe, Cloudinary, Docker, GitHub Actions, GHCR, Traefik, Cloudflare, DigitalOcean]
stories: 8
publicEvidence: []
privateEvidence: 0
diagrams: true
lastResearched: "2026-10-15"
sources:
  - data/profile/10-career.yaml (work[archcanvas])
  - data/profile/23-projects-oss-more.yaml (projects[archcanvas])
  - data/profile/60-network.yaml (collaborators)
  - the product's private repository at 2026-10-12: CLAUDE.md layer, docs/ARCHITECTURE.md, docs/OPERATIONS.md, dated decision records, benchmark notes, the agent, designer-loop, ship-gate, billing and deploy code, git history
  - archcanvas/archcanvas (public product page)
  - linkedin/company/archcanvas/
---

# ArchCanvas

## In one breath

ArchCanvas is an AI architectural designer: you describe a home in plain English and it
draws one dimensioned floor plan, with a realistic rendering of that same plan, which you
then refine by talking to it on a zoomable canvas. I founded it and I am its sole
engineer, working with AI coding agents. It is live at archcanvas.uk with real payments,
and on my own offline benchmark of 26 briefs every plan passed every check.

## The problem

People planning a home, and the designers who help them, can get a pretty AI image of a
floor plan in seconds, but they cannot build from it or edit it precisely: it has no real
dimensions, nobody has checked that a door does not hit a wall, and asking for "the
kitchen two metres wider" redraws the whole thing. Professional CAD is precise but slow
and expert-only. The obvious fix, asking a stronger model to draw a better picture, was
what I tried first, and it does not work: a picture cannot be compiled, measured or
diffed, so nothing can tell you whether it is right.

## What I built

A single Next.js application, shipped as one Docker image, in which a language model
proposes and a compiler decides. An orchestrator model talks to the user and calls
tools; a separate designer writes the plan as ArchLang (the open-source floor-plan
language I wrote for this, covered in its own story file); a ship gate compiles,
repairs and checks every candidate before anything is saved or charged.

- **Two-act studio**: a briefing conversation that produces one plan, then a canvas
  where every edit morphs the plan in place and is stored as a new version.
- **Agent**: nine tools, five on the live path (ask design questions, generate a plan,
  edit it with a minimal diff, render it, critique it).
- **Designer loop**: write, check, fix, ship the best, bounded by calls, tokens,
  wall-clock time and a per-call timeout.
- **Model-free edits**: parametric sliders and one-click actions rewrite a variable and
  recompile, with no model call.
- **Grounded rendering**: the compiled plan is rasterised and given to the image model,
  so the picture shows the building on the drawing.
- **Billing**: credit packs through Stripe, one credit per new design, free edits,
  idempotent refunds.
- **Delivery**: GitHub Actions to GHCR, then a canary container that must pass health,
  database and image checks before it replaces production.

## Stories

### S1. A floor plan you can check has to be a program

- **Kind**: decision
- **Situation**: I started ArchCanvas on 2026-04-08 with the obvious architecture: the
  model drew the plan as an SVG. The drawings looked plausible and could not be trusted.
  Nothing could say whether a room had a door, and every "move this wall" request
  redrew the whole plan.
- **What I did**: I stopped and built the missing layer: a language for floor plans.
  I stopped literally, too: on 2026-06-21 I took ArchCanvas offline and removed its
  deploy pipeline rather than keep running an engine I could not trust. ArchLang 0.1.0
  went to npm on 2026-06-24, and on 2026-06-25 I redeployed ArchCanvas with ArchLang
  replacing the freehand engine, four days after taking it down. I kept the boundary strict: ArchCanvas consumes the compiler
  as a pinned npm package, runs it server-side, and keeps a folder of tripwire tests that
  go red when an upgrade changes something the product relies on. The rule in the
  product's own docs is that a fix that belongs in the compiler goes upstream, not into
  a workaround in the app.
- **Result**: since then the model writes ArchLang, the compiler turns it into a
  dimensioned drawing, and edits are exact and replayable. The stored source is the
  truth and the SVG is a cached compile of it, which is what made diffs, version
  history, sliders and DXF/PDF export possible.
- **Engineer's angle**: the split of responsibilities. The compiler computes facts and
  gives advice; it never designs. The agent arranges rooms. That keeps every claim the
  product makes about a plan traceable to a deterministic check, and it means a
  compiler upgrade is a reviewed event (tripwires, an eval corpus, a re-probe of the
  prompt's grammar rules) rather than a dependency bump.
- **Plain version**: I stopped asking the AI to draw pictures of houses and gave it a
  language whose drawings a computer can check.
- **Follow-ups**:
  - *Why not a stronger image model?* A better picture is still a picture: no
    dimensions to measure, no structure to diff, no way to change one wall.
  - *Why your own language rather than an existing CAD format?* I needed something a
    model can write as text, that never throws on a bad plan, and that returns
    diagnostics pointing at the exact span so the model can fix its own mistake.
  - *How do you keep the two in step?* Upstream tripwire tests in the product, each
    opening with a note naming the decision a failure is asking for.
  - *Was the product down while you built the language?* For four days, 2026-06-21 to
    2026-06-25: I took it offline, published the language, and redeployed on it.

### S2. One plan, not a menu of three

- **Kind**: requirements
- **Situation**: the early agent produced three variations per brief, each rendered and
  critiqued. That spent three full generations before the user had said anything about
  direction, made a credit feel like it bought a batch, and the rendering beside each
  plan did not show that plan at all: the image model never saw the drawing.
- **What I did**: I re-read the requirement as a design conversation about one plan. A
  brief now produces exactly one plan; every follow-up is treated as feedback on it and
  applied as a minimal-diff edit, which is free; variations happen only on request. I
  grounded the rendering by rasterising the compiled plan and passing it to the image
  model as the reference. Live testing also surfaced a billing bug: when the model issued
  several generate calls in one step, each read a "charged" boolean as false before the
  first charge finished, so one turn charged several credits. I replaced the flag with a
  single memoized charge promise per turn, and added a hard cap on frames per turn so a
  model chasing advisory warnings could not flood the canvas.
- **Result**: one credit per new design, charged once however many tool calls run in
  parallel; edits, renders, sliders and review are free; the rendering and the drawing
  show the same building.
- **Engineer's angle**: a concurrency bug inside an LLM tool loop. Tool `execute`
  functions run concurrently, so idempotency has to be a shared promise, not a flag; and
  runaway is stopped by a deterministic frame cap, not by trusting the prompt or the
  step limit.
- **Plain version**: I stopped giving people three half-finished options and gave them
  one good plan they can keep improving for free.
- **Follow-ups**:
  - *How did you find the double charge?* In live end-to-end testing of a three-variation
    turn: the ledger showed one charge per parallel call.
  - *Why not just lower the step limit?* A turn that hit the step limit made the client
    re-request, which created a fresh context and could charge again. The cap had to
    count frames, and the step limit had to sit above the tool budget.

### S3. The gate that was computed and then ignored

- **Kind**: implementation
- **Situation**: the ship gate already computed whether a plan was sound, and no save
  path read the result. Plans with furniture through walls or rooms you could not walk
  into were charged for and saved. Separately, the brief's own checklist was validated
  after the charge and never shown to the user.
- **What I did**: I rebuilt generation as a designer loop in which the gate is the
  stopping predicate. A separate tool-free model call writes the plan with reasoning on;
  every candidate goes through compile, machine fixes, a topology pass that adds missing
  doors, repair and lint; the brief's expectations are checked; the checker's findings,
  never another model's opinion, go back as the next round's input. The loop is bounded
  on four independent axes (calls, tokens, wall-clock deadline, per-call timeout) and
  streams a heartbeat, because the proxy cuts an idle stream. The credit is charged only
  after the best candidate is picked; if nothing compiles, the user is not charged and
  no frame is saved. If the best plan still has defects, it ships with them listed on
  the plan instead of hidden.
- **Result**: on the founder-run offline benchmark of 26 briefs (2026-09-07), all 26
  plans passed every check, at a median of one design round taking 33 seconds.
- **Engineer's angle**: separating advisory from blocking diagnostics. Advisory lint
  codes never drive the repair loop, never the "ok" flag and never the model's feedback,
  because spending a repair round on a heuristic the repairer cannot fix makes plans
  worse. Each new compiler warning code has to be classified one way or the other
  before an upgrade lands; a test forces the choice.
- **Plain version**: the product now checks its own work before charging for it, and
  tells you plainly about anything it could not fix.
- **Follow-ups**:
  - *Why ship a plan with defects at all?* Refusing trades an editable, nearly right
    plan for nothing; the loop only gets there on hard briefs where a retry rarely does
    better. It is one constant, so the decision stays reversible.
  - *How do you stop a model from "fixing" the checklist instead of the plan?* The brief
    contract is seeded from the brief; the model may add expectations, never weaken them.

### S4. Taking geometry away from the model, then giving it back

- **Kind**: decision
- **Situation**: after the loop shipped, every failure I measured was geometry (a door
  swing blocked, furniture against a wall), never comprehension of the brief. The model
  was being asked to hold a rectangle packing and clearance rules in its head while
  writing text.
- **What I did**: I split the job: the model wrote a Program (rooms, areas, adjacency,
  daylight), a deterministic packer laid it out, an emitter wrote the ArchLang, and the
  gate stayed exactly where it was. It went in behind a flag with a fallback to the
  model in the same loop, and became the default only after it met its criteria on a
  fixed corpus of 26 briefs. Two weeks later live plans read as zoning diagrams: correct
  and characterless. Comparing the live pipeline with the same compiler driven by hand,
  I found they were not the same system: production read the brief behind a tiny prompt
  with no examples, a single footprint shape and no step that looked at its own drawing.
  I built an "architect" arm that gives the model a playbook, a retrieved worked example
  and the packer's layout as a proposal rather than an answer, measured it with a
  deterministic scorecard, an arm-blind model judge and a blind A/B review, and made it
  the default in September 2026. The solver stays as the first rung of an env-var revert
  ladder.
- **Result**: the production designer is model-led with the solver demoted to a tool,
  the gate still has the last word, and the decision record names the two quality bars
  that were not met and carries them forward instead of dropping them.
- **Engineer's angle**: deciding by measurement rather than by the plan's argument for
  itself, including recording "not met" honestly; and the boundary of each instrument
  (the scorecard is a ruler, not a judge; the judge lives in the eval, never in the
  loop).
- **Plain version**: I tried letting a calculator lay out the rooms, found the houses
  came out correct but dull, and changed it to let the AI design with the calculator's
  layout as a suggestion.
- **Follow-ups**:
  - *What was wrong with the solver?* Nothing in its own terms: it cannot draw a
    doorless room. But "zero blocking diagnostics" is not the same claim as "a building
    someone would want", and I had been reading it as one.
  - *How do you roll back a designer change?* One environment variable on the server,
    no rebuild.
  - *Did the eval itself have bugs?* Yes: a timeout sized for one provider aborted
    successful calls from another, and a shape detector that looked for keywords missed
    an L-shaped plan written as a polygon. Both were fixed before the decision.

### S5. Benchmark green, production red

- **Kind**: incident
- **Situation**: in July 2026 I shipped a reasoning-effort setting for the orchestrator
  to cut latency, set to "low". My benchmark had swept low, medium and high without an
  error. In production, every generation failed.
- **What I did**: the API rejects any reasoning effort except "none" when function tools
  are attached, and every agent turn carries tools. My benchmark called the model without
  tools, so it never exercised the failing combination; the canary's health check is a
  liveness probe, not an agent turn, so it passed too. My first response reverted a
  neighbouring change from the same round, which did not help; unsetting the variable
  restored service at once. I wrote the incident up, adopted "none" as the one legal
  value behind the same switch, and made a standing rule: any change to model
  parameters, model id, tool schema or transport is verified by a real agent turn with
  tools before merge.
- **Result**: generation restored the same day; the rule is in the agent's docs, and the
  later move to a reasoning-capable endpoint for the designer was probed cell by cell
  before it shipped.
- **Engineer's angle**: why the instrument was blind: bench measures plan validity, not
  request legality. And the second lesson: revert the one variable that changed between
  the healthy and broken deploys, not the plausible-looking neighbour.
- **Plain version**: a test that skipped one real-world detail said everything was fine,
  and I now test changes the way users actually hit them.
- **Follow-ups**:
  - *How long were users affected?* For the window the bad setting was live, the same
    day; there was no data loss and no credit charged, because nothing was generated.
  - *What about the reverted change?* I recorded it as probably innocent, to be
    re-landed with its own QA rather than assumed broken.

### S6. Our own health check kept the database awake

- **Kind**: incident
- **Situation**: the serverless Postgres provider reported the monthly compute allowance
  used up, while real traffic was tiny. The question was whether users or our code had
  done it.
- **What I did**: the usage curve was flat and continuous, which is a machine, not
  people. The container's health check hit `/api/health` every 30 seconds, that route
  ran `select 1`, and the database only sleeps after five idle minutes, so it never
  slept. A 20-second cache sat below the 30-second probe interval and deduplicated
  nothing, while its comment said the problem was handled. I split liveness from
  readiness: the default health route can no longer touch the database, and a database
  check is an explicit opt-in. I slowed the container probe, cached only successful
  database checks, and turned public newsletter pages that wrote on every anonymous read
  into cached, read-only pages.
- **Result**: the database went back to sleeping when idle. Two rules went into the
  code's docs, one enforced by a test: nothing queries the database on a timer, and a
  cache shorter than the interval it absorbs is not a cache.
- **Engineer's angle**: on a scale-to-zero database, query frequency matters more than
  query weight; budget periodic work as a duty cycle. I also rejected the quick fix of
  raising the cache TTL: each probe re-arms the five-minute idle timer, so the duty
  cycle stays high unless the cache is long enough to make the value meaningless.
- **Plain version**: an "are you alive?" check running every 30 seconds kept a database
  that is meant to sleep when idle awake all month, so I separated "is the app up" from
  "is the database up".
- **Follow-ups**:
  - *How did you know it was not user traffic?* Awake time divided out to continuous
    use for the whole period; real demand has a day and night shape.
  - *Why cache only success?* Caching a failure would pin a transient blip for the whole
    TTL and doom the deploy's retry window.

### S7. A check that can never fail is not a check

- **Kind**: delivery
- **Situation**: pushing to main deploys to production, so the deploy has to catch what
  CI cannot. In the database round above I had made the deploy's database probe a
  warning, so that a database outage could not block the hotfix for it. Days later a
  dependency update showed why that was wrong.
- **What I did**: a major version of the database driver accepted only tagged-template
  calls, while the ORM version I pinned calls it the conventional way. Types, tests
  (which mock the database) and the build all passed; every real query would have
  thrown. The canary's database probe was the one place in the pipeline that could see
  it. I made the probe block the swap, with a single documented repository variable to
  override it, named in the failure message so whoever hits it at 3am does not need to
  find the docs. Later I added an image-optimiser probe for the same reason: a missing
  native binding passes the build and breaks images in production.
- **Result**: the pipeline is build, push to GHCR, boot a canary that Traefik does not
  route, poll health, check the database, check image optimisation, and only then swap;
  any failure removes the canary and leaves production untouched. Rollback is a redeploy
  of an earlier tag, drilled in October 2026.
- **Engineer's angle**: when every verification layer mocks a dependency, the one probe
  that touches the real thing has to be allowed to say no. I also wrote down that I had
  corrected my own earlier decision rather than rewriting the old record.
- **Plain version**: before each release the new version is started next to the old one
  and has to prove it can reach the database before it takes over.
- **Follow-ups**:
  - *What if the database is down and you need a hotfix?* Set the override variable and
    re-run; the abort message says exactly that.
  - *Why not blue-green with two live containers?* A single 2 GB server; the canary
    exists only for its checks, then the old container is replaced.

### S8. An expired session is a state, not an error

- **Kind**: requirements
- **Situation**: Knight Hou, Co-Founder of Relab and one of the early testers, typed a
  two-storey brief, pressed the button and saw the
  auth middleware's raw "Invalid or expired token" in red. The same screen showed no
  credit balance and an empty gallery, although the database held their finished design.
- **What I did**: I diagnosed it read-only against production before writing code and
  ruled out key rotation, an auth outage and a ban, each with evidence. The cause was a
  refresh-and-retry rule written as "client-wide" but applied to only part of the
  client: sixteen call sites still built their own auth header, and a tab that stays
  focused never re-checked its session. I moved every call site onto the shared fetch.
  Reviewing that fix, I re-read the requirement: a session ending is a normal event, so
  showing an error at all was the mistake. I gave the client the same three-way split
  the server already had: expired keeps the page and asks the user to sign in over the
  top of their work; unreachable changes nothing; only a signed-out visitor is
  redirected. A network blip no longer signs anyone out.
- **Result**: no surface renders 401 wording; an expiry never discards a loaded studio or
  a half-written brief; the sign-in overlay offers the method that browser last used.
- **Engineer's angle**: two sources of truth that could disagree (the user object that
  decides what renders, the token that decides what works); the fix was to make our
  own API's second 401 the one authoritative signal, because the auth SDK's error shapes
  are not reliable enough to lead with.
- **Plain version**: when your login times out, the app now just asks you to sign in
  again without losing your work, instead of showing an error.
- **Follow-ups**:
  - *Why did the gallery say they had no designs?* It parsed the 401 body as data without
    checking the status, so an error became an empty list.
  - *How did you prevent a repeat?* The rule now lives next to the client fetch code
    and every client fetch goes through one helper.

## Numbers I can say

| Figure | Source |
|---|---|
| Started 2026-04-08; ArchLang 0.1.0 on npm 2026-06-24, replaced the freehand engine 2026-06-25 | `data/profile/10-career.yaml` › `work[archcanvas]` |
| 9 agent tools, 5 on the live path | `data/profile/10-career.yaml` › `impactDelivered` |
| 26 of 26 briefs passed every check, median one design round at 33 s (founder-run, offline, 2026-09-07) | `data/profile/10-career.yaml` › `impactDelivered` |
| Live at archcanvas.uk with real payments, pre-launch | `data/profile/10-career.yaml` › `impactDelivered` |

Do not cite user, revenue or download numbers for this product: the shard bans traction
claims.

## In hindsight

- I would have put the product in front of outside users sooner. Most of what I know
  about plan quality comes from my own benchmark and my own blind review, and the one
  live bug report I describe above taught me more about the client than a week of
  offline runs.
- I would have tested model-parameter changes with a real tool-carrying turn from the
  start; the incident in S5 was cheap to prevent.
- I wrote "client-wide" rules before applying them client-wide. Today a rule ships with
  the sweep that enforces it, or with a test.
- The solver round taught me to state what a metric does not measure before trusting
  it. "Zero blocking diagnostics" was never "a good house".

## Evidence

No public endorsement of this project is recorded yet: no recommendation in
`50-references.yaml` refers to ArchCanvas, and no award is for it. The public record of
the work is the live product at archcanvas.uk and its public product page
(archcanvas/archcanvas). An early tester's interest (Knight Hou, Co-Founder of Relab, the
tester in S8) is recorded in `60-network.yaml` and is not an endorsement. Private items:
none.

## Open questions

None open. Settled on 2026-10-15: the product is called an "AI architectural
designer" on every surface, never an "AI architect"; the June 2026 pause is told in S1;
the tester in S8 is named; the shard now matches the code on the orchestrator and
designer models, the single rendering model, the 13 tables, the ArchLang range and the
route count.
