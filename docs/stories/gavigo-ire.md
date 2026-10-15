---
id: gavigo-ire
title: GAVIGO IRE
role: Founding Principal Engineer, Activation, Execution & AI Systems (prev. Core Engineer)
period: "2025-10 – 2026-10"
status: production
kind: client
repos:
  - private
live: https://ire.gavigo.com/
stack: [Go, gorilla/websocket, client-go, Kubernetes (GKE), DigitalOcean DOKS, React 18, Vite, React Native, Expo, Redis 7, PostgreSQL, Supabase, Python, FastAPI, nginx, GitHub Actions]
stories: 8
publicEvidence: [saba-gecgil]
privateEvidence: 16
diagrams: true
lastResearched: "2026-10-15"
sources:
  - data/profile/20-projects-flagship.yaml (gavigo-ire)
  - data/profile/10-career.yaml (work id gavigo)
  - data/profile/50-references.yaml (saba-gecgil)
  - the client's private repository (code, phase records, decision records, commit history to 2026-09-26)
  - GAVIGO's own claim-discipline rules for public copy
  - Chan's local archive of the GAVIGO team chat (2026-07 to 2026-10)
---

# GAVIGO IRE

## In one breath

GAVIGO is a US startup working on a way past the app-install step: you scroll a
phone feed and a game plays right in the scroll, with no app-store install. I was
its founding engineer. I built the platform behind that feed: an AI orchestrator
that watches what people scroll towards, keeps the next game on standby on a
Kubernetes cluster and activates it as the viewer arrives, plus the investor
dashboard that shows those decisions live. I took it from prototype to production
on DigitalOcean, then moved it to Google Cloud in a cutover of about 30 minutes.
In GAVIGO's proof stage the work measured a 78% application-level reduction in
startup work: a controlled, application-level measurement, not a production SLA.

## The problem

Every interactive experience on a phone sits behind the same funnel: discover it,
open an app-store page, install, onboard, and only then interact. By the time the
user arrives, the moment that made them want it has often passed. GAVIGO's founder,
Saba Gecgil, wanted to show that the experience could be prepared before the viewer
asked for it, and to show it to investors and partners with evidence, not a mock-up.

The obvious answer, "start a container when the user taps", was not enough for two
reasons. A cold container start is slow, and most of that time is infrastructure
work (scheduling, container creation, networking, readiness) that application code
cannot touch. And a startup selling "activation" cannot claim more than it can
measure: every number shown to an investor had to survive a technical reader. So
the job was two jobs at once: make activation cheaper, and build the instruments that
say honestly how much cheaper and where the limit is.

## What I built

A single Go service, the orchestrator, sits behind a WebSocket hub. Phones and the
dashboard stream scroll and focus events to it; it scores each piece of content on
weighted personal, global and trend signals, and a rules engine decides which
workload to warm, using the Kubernetes API to scale it towards ready before the tap.
Every decision and every phase of an activation is timestamped and broadcast, so
the dashboard shows the chain from decision to Kubernetes change to observed result
rather than asserting it.

- **Orchestrator** (Go): WebSocket hub, scorer, rules engine with seven named
  triggers, a warm-pool manager with protected slots, an activation-phase timeline,
  and a proof layer that classifies each activation by the path it took (cold
  rebuild, prepared, warm reuse, live session return, checkpoint restore).
- **Clients**: a React + Vite dashboard for investors and operators, and a React
  Native / Expo app whose web build is the public feed. Audience presets (public,
  investor, operator) are applied when each WebSocket message goes out, so one
  catalogue serves three audiences.
- **Workloads**: one always-warm game server holding the whole self-hosted catalogue
  (23 games across four in-house studios), plus two ML/compute workloads used to
  prove state preservation, and an AI chat service.
- **State**: Redis for warm-pool state, sessions and measurement history; Supabase for
  sign-in and social data.
- **Delivery**: GitHub Actions with three required checks, images pinned by digest,
  production on Google Kubernetes Engine after the move from DigitalOcean.
- **Partner layer**: per-partner telemetry and an operator-gated proof report, an
  intake checklist for outside games, and a separate, switched-off lane for games
  hosted by third-party providers, walled off from the proof measurements.

## Stories

### S1. Choosing the checkpoint approach that could be measured on our own cluster

- **Kind**: decision
- **Situation**: In April 2026 the next proof question was whether an AI workload's
  state could survive its container being destroyed, and whether bringing it back was
  cheaper than starting cold. The cluster was a single small node, and the evidence had
  to be real within one phase of work.
- **What I did**: I evaluated four approaches and wrote the decision record. GKE Pod
  Snapshots would preserve full process memory but did not run on our machine type or
  cluster version and was still in limited preview. CRIU needed privileged containers
  and kernel features the node image might lack. DMTCP had no validation for an async
  Python web stack. I chose application-level checkpointing: the workload saves the
  state that matters in a light format and reloads it without its heaviest imports. I
  then built a three-tier ladder on a Python inference service (full ML library, then
  numeric arrays, then plain Python) so each step's saving could be measured
  separately, and a second test on a language-model workload that saved its
  conversation cache when the pod died and reloaded it in a fresh process.
- **Result**: The measurements GAVIGO now uses in public: a 78% application-level
  reduction, a controlled startup path cut from 4.45 s to 1.00 s, and about 140 ms to
  restore preserved AI state into a fresh process. I wrote down beside them where they
  stop. These are controlled application-level measurements, not a production SLA or a
  complete end-to-end activation time: infrastructure work still dominates the full
  path, and the record says so.
- **Engineer's angle**: The interesting part is the boundary. The ladder measured the
  application savings inside the container's start window, and the same runs showed
  that the rest of the end-to-end path is infrastructure work the application cannot
  remove. That turned "make it faster" into a precise next question for
  infrastructure-level restore, instead of a vague promise.
- **Plain version**: I picked the approach we could actually prove on the hardware we
  had, measured it, and wrote down honestly what the numbers did and did not mean.
- **Follow-ups**:
  - *Why not CRIU, given published speed-ups?* It needed privileged containers and
    kernel support we could not guarantee on a managed node; too much infrastructure
    risk for one phase of work. I recorded it as the next candidate.
  - *What exactly is the 140 ms?* The application-level cost of fetching and loading
    the preserved state into a new process. Pod scheduling and readiness are outside it.
  - *Did the 78% make the product 78% faster?* No, and that is the point of the
    boundary note: it is application-level work removed, not end-to-end activation time.

### S2. Moving production from DigitalOcean to Google Cloud in one evening

- **Kind**: delivery
- **Situation**: The platform first shipped on DigitalOcean Kubernetes in Singapore.
  When GAVIGO joined the Google for Startups Cloud Program (programme participation),
  production needed to move to Google Cloud without losing the live demo the company
  was showing.
- **What I did**: I rebuilt each layer for GKE: container registry to Artifact
  Registry; the DigitalOcean load balancer to a GCE Ingress with a global load
  balancer and Google-managed certificates (ending manual certificate renewal);
  load-balancer annotations to FrontendConfig and BackendConfig, including a long
  backend timeout so WebSocket sessions are not cut; services reshaped from one public
  load balancer each to cluster-internal services behind the Ingress. Deployments used
  the `Recreate` strategy so a single-node cluster could not deadlock on CPU during
  a rollout. When the first-choice region ran out of capacity, I created the cluster in
  another European zone. I kept a rollback plan and archived a full migration record in
  the repository.
- **Result**: Production moved on 2026-03-11 with about 30 minutes of downtime,
  mostly DNS propagation and certificate provisioning.
- **Engineer's angle**: The traps were platform-specific: WebSocket timeouts at the
  load balancer, health checks the Ingress requires, and rolling updates that cannot
  fit two copies of a pod on one small node.
- **Plain version**: I moved the whole live product to a different cloud provider in
  one evening, and it was down for about half an hour.
- **Follow-ups**:
  - *What took the 30 minutes?* DNS propagation and the managed certificate being
    issued, not the workloads.
  - *What would you do differently?* Lower the DNS TTL well in advance and
    provision the certificate before the switch.

### S3. The nightly benchmark that took every game offline

- **Kind**: incident
- **Situation**: In May 2026 the public feed started serving a fallback page instead
  of games, minutes after the daily benchmark job finished. All the self-hosted games
  share one always-warm game-server deployment.
- **What I did**: I traced it to an assumption from an earlier phase: one warm-pool
  slot per deployment. The benchmark re-acquired slots for every game without
  protecting them; when the slots expired, each eviction asked Kubernetes to scale
  "its" deployment to zero, and for the games that deployment was the shared one.
  Fixing that exposed the same symptom by a second route: the pool's budget was smaller
  than the number of protected games, so the benchmark itself overflowed it. I fixed
  all three causes: protected slots in the benchmark path, an eviction callback that
  never scales a shared deployment down, and a budget that fits the catalogue. Then I
  wrote the five-step checklist for adding a workload, because each step fails
  silently when skipped.
- **Result**: A full benchmark run afterwards finished with zero evictions and no
  scale-to-zero. The checklist sits at the top of the repository's agent instructions.
- **Engineer's angle**: An abstraction that is correct for one-to-one
  content-to-deployment mapping is wrong for a shared deployment; the fix belongs at
  the eviction callback, not in more protection flags.
- **Plain version**: A routine test was quietly switching the games off overnight; I
  found why, fixed it at the root, and wrote down how to avoid it next time.
- **Follow-ups**:
  - *Why didn't monitoring catch it?* The fallback page returned a normal response.
    Later I changed the telemetry so the fallback page no longer counts as a
    successful load.
  - *Why a checklist and not code?* Some steps are configuration and catalogue data
    that live outside the code; the checklist names each one.

### S4. Compression had never worked in production

- **Kind**: difficulty
- **Situation**: In July 2026 a partner studio pushed back on our size limit for
  outside games. Checking whether their build could fit, I measured what our server
  actually sent.
- **What I did**: The nginx config had compression switched on, yet production sent
  everything uncompressed: dashboard, mobile app, games and investor deck. The cause was
  one default. nginx treats a request as "proxied" if it carries a `Via` header, and by
  default does not compress those; Google's load balancer adds `Via` to every request.
  Laptops and docker-compose send no such header, so it worked everywhere except
  production, and survived the cloud migration and every review. I proved it with the
  same file and one header toggled, fixed it with one directive, tuned the related
  settings, and told the founder that a telemetry series would now drop, so that a
  before/after chart would not be misread.
- **Result**: Every asset on the site now goes out compressed. I also told the founder
  plainly that the partner had been right to push back on our number.
- **Engineer's angle**: A setting that reads correctly and fails only behind the real
  load balancer; the only place to see it is the live response headers.
- **Plain version**: The site had been sending files much bigger than
  needed to every visitor, because of one hidden setting; I found it and fixed it.
- **Follow-ups**:
  - *How did you prove the cause, not just the fix?* Same nginx, same file: no `Via`
    header gave compressed output, adding `Via` gave none.
  - *What else did it affect?* The bytes-per-activation telemetry; I flagged the step
    change rather than letting it look like a product change.

### S5. Making production hard to hit by accident

- **Kind**: decision
- **Situation**: In July 2026 a second engineer wanted to test changes against the
  cloud cluster, and the founder offered to grant whatever access was needed.
- **What I did**: Before saying yes I checked what the orchestrator would do on a
  laptop. Outside a cluster it fell back to whatever `kubectl` pointed at and defaulted
  to the production namespace, and a permission refusal was only logged as a warning.
  A local test pointed at the wrong context could have reached the production namespace.
  I changed the orchestrator to refuse to start outside a cluster unless a
  namespace is named, showed how to run the same Kubernetes code against a local `kind`
  cluster, and asked for the existing CI to become a required check on `main`. I then
  found the rule was configured but not enforced on our GitHub plan, and that the mobile
  typecheck job was missing from the required list, and raised both.
- **Result**: The founder upgraded the organisation's GitHub plan; `main` now needs a
  pull request, an approval and three green checks, with no admin bypass. Local-first
  testing became the agreed rule.
- **Engineer's angle**: A coordination ritual (taking turns on the cluster) cannot
  prevent a failure that needs only one person. The safety came from explicit namespace
  selection and enforced CI, and I checked enforcement through the API rather than
  trusting the settings page.
- **Plain version**: before granting new access I checked where a local test could
  reach, made the safe default explicit, and made the safety rules enforced rather than
  just written down.
- **Follow-ups**:
  - *Why not a separate test cluster?* The cluster was one small node; a second one
    was another environment to run, and a local `kind` cluster covered the code under test.
  - *Why is the mobile typecheck job load-bearing?* The Expo export transpiles without
    typechecking, so type errors would otherwise reach production.

### S6. Renaming a metric instead of overclaiming

- **Kind**: requirements
- **Situation**: In August 2026 the founder wanted a public beta with games supplied
  by a hosted-game provider, gated on whether users reached a first playable moment.
  The first real run showed a long run of video ads before the first game of a
  session.
- **What I did**: I asked the founder to request pre-roll off from the provider before
  the account went live, and explained why: our "reached first play" signal was a
  short dwell, which an ad satisfies without the user seeing the game. I tried to take
  a start signal from the provider's player and could not receive it without their
  cooperation. So I redesigned the gate: count only the second and later games in a
  session, where no ad plays; require a no-error state, which catches titles that play
  an ad and then fail; rename it "engaged rate" because we cannot observe play inside
  someone else's game; and keep the excluded first games as our own read on ad
  exposure. Later I found the counter could not yet be computed, said so plainly, and
  recommended waiting for a provider call that could change the definition.
- **Result**: The founder accepted the definition and the rule that its four numbers
  ship together. The acceptance criteria I wrote for providers (no pre-roll before
  first play, lifecycle events to the parent page, wrapper telemetry, licence
  verification) became the company's provider questionnaire. The sweep concluded that
  free ad-funded inventory with a clean first play was not available to us, and the
  hosted lane stayed off.
- **Engineer's angle**: Designing a measurement that does not move when an outside
  setting changes, and versioning the definition instead of silently changing it.
- **Plain version**: When a number would have flattered us, I changed what we measured
  and what we called it, so the company would decide on real data.
- **Follow-ups**:
  - *What did the redesign cost?* Smaller samples: one-game sessions contribute
    nothing, so the gate carries a minimum sample and always reports it.
  - *Why not suppress the provider's ads?* Using their catalogue without their
    monetisation was not acceptable; we asked whether it was offered, not whether we
    could force it.

### S7. Redis had gone, and the health check said healthy

- **Kind**: incident
- **Situation**: In August 2026 I found production had been running without Redis for
  days. Nothing was persisted, and `/api/v1/health` reported healthy throughout.
- **What I did**: Root cause: the client pinged once at boot and returned nil on
  failure with no retry, and with both pods starting together on one node, losing
  that race was the normal outcome. Every write was then dropped quietly behind nil
  guards. Two things hid it: Go's typed-nil trap (a nil pointer in a non-nil interface)
  and a status field that was hardcoded. I rebuilt the client to exist even when
  unreachable, re-probe in the background and self-heal, and made health report
  "degraded". I kept HTTP 200 on purpose, because the liveness probe judges on status
  code alone and a 503 would have turned a degraded dependency into a crash loop. Tests
  run against a fake Redis server and were mutation-checked in both directions.
- **Result**: Redis reconnects on its own after a boot race or restart, and the health
  endpoint now tells the truth.
- **Engineer's angle**: The typed-nil interface, the probe-design trade-off, and a race
  the race detector caught in my own first draft.
- **Plain version**: The database cache had silently stopped working while the system
  said all was well; I made it recover by itself and made the status honest.
- **Follow-ups**:
  - *Why not return 503 when Redis is down?* Both probes use that endpoint; 503 would
    have the pod killed over and over for a dependency it can work without.
  - *How do you know the tests test the bug?* Putting the old `return nil` back fails
    three tests, one named after the outage.

### S8. Reviewing a colleague's measurement code against the real cluster

- **Kind**: collaboration
- **Situation**: In July 2026 the second engineer opened a pull request to measure
  whether image pre-pulling helped real activations, by watching Kubernetes `Pulled`
  events. I suspected the watch would replay old events on reconnect but was not sure.
- **What I did**: Rather than ask them to prove my hunch, I tested it myself against
  our cluster: a watch with no resource version replayed every existing object as
  "added". On every reconnect, old pulls would be counted again, unevenly, skewing the
  hit rate while still looking plausible. I proposed the standard List-then-Watch
  pattern with resume on `410 Gone`, and also pointed out the RBAC permission the watch
  needed. I set the review order across their two PRs so the smaller, safer one landed
  first. In the write-up I also described my own two false negatives on the way.
- **Result**: The fix was merged in their PR; the measurement counts each pull once.
- **Engineer's angle**: Kubernetes watch semantics (synthetic ADDED events, resource
  versions, compaction), and a recurring pattern I named: silent failures that look
  exactly like a clean negative.
- **Plain version**: I checked a teammate's measurement code against the real system,
  found it would quietly count things twice, and helped them fix it.
- **Follow-ups**:
  - *What were your two false negatives?* One test watched a namespace with no
    events, so "no replay" was an empty question; the other swallowed a file-not-found
    in a try/catch and reported "no events".
  - *How did you keep the review constructive?* I said their filter was right for the
    case they were solving and that this was a second case only visible on reconnect.

## Numbers I can say

| Figure | Label | Source |
|---|---|---|
| 78% | Application-Level Reduction (controlled proof-stage measurement: same workload and output, less application-level work) | `data/profile/20-projects-flagship.yaml` › `gavigo-ire.metrics` |
| 4.45 s → 1.00 s | Controlled Startup Path Comparison | same |
| ~140 ms | Preserved AI State Restore (preserved AI state restored into a fresh process) | same |
| Boundary | "Real, controlled application-level measurements, not a production SLA or a complete end-to-end activation time" | same; say it every time one of the three is said |
| ~30 min | Cross-cloud cutover downtime, 2026-03-11 | same |
| 23 games across 4 studios (+2 ML/compute workloads) | Catalogue | same |
| DigitalOcean DOKS → Google Cloud GKE | Cloud platforms | same |

Google for Startups Cloud Program and NVIDIA Inception: programme participation, never
validation.

## In hindsight

- I would have built the "does this fail silently?" check into the platform from the
  start. The benchmark outage, the missing compression, the Redis outage and the
  replayed watch events all looked like success from the outside. A health signal that
  says "degraded" and a test for each negative should have come first, not after.
- The single-node cluster shaped too much: rollout strategy, test isolation and
  benchmark noise all followed from it. I would have argued earlier for a separate
  small test environment, or written down why we did not need one.
- I documented decisions in the repository as I went, which made the handover
  straightforward. I would also have recorded chat decisions in the repository from
  day one: the team chat kept only 90 days, and at least one settled assessment had
  to be redone because its record was gone.
- I sometimes reported a problem as worse than it was before checking (the metric
  counter that "could never have run" was a line in a spec, not running code). I now
  check first, then report.

## Evidence

- **saba-gecgil** (LinkedIn recommendation, Founder & CEO, managed Chan directly): "She
  consistently brings clarity to hard systems questions: what needs to run at
  activation time, what can be prepared, what can be reused, where state can be
  preserved, and where the boundary needs to be measured rather than assumed." Also:
  "She combines speed with discipline [...] If something is unsafe to expose, she says
  it clearly." Backs S1, S5, S6.
- Private: 16 items, all from the founder in the team chat, counted here and not
  quoted. (The private evidence file also lists the recommendation above.)

## Open questions

None open. Settled on 2026-10-15:

- **Dates.** The engagement runs 2025-10 (first contract, 2025-10-17) to 2026-10: the
  last working day was 2026-10-05, after notice on 2026-09-01 and a September handover.
  The build itself can be read in full from the client repository's commit and push
  history, which starts on 2026-01-21.
- **Shard wording** now matches the code: a five-state container lifecycle (COLD,
  PREPARING, READY, ACTIVE, REUSABLE) recorded as a nine-phase activation timeline, and
  the seven trigger types as the code names them.
- **Internal figures** (compression byte sizes, cloud cost, the budget alert) are gone
  from the shard and the LinkedIn copy; only the three approved figures stay.
- **Reason for leaving**: not in any copy, and removed from the shard.
- **S1 and S5** were softened (no claim about the end-to-end total; the namespace risk
  stated as a possibility); S3, S4, S7 and the hindsight stay as told.
