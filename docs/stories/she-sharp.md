---
id: she-sharp
title: She Sharp
role: Senior Full Stack Engineer & Website Team Lead
period: "2025-07 – 2026-09"
status: production
kind: client
repos:
  - private                              # the charity's platform repository
  - ChanMeng666/her-waka                 # sub-project: Her Waka teaching site
  - ChanMeng666/event-qa-ai-template     # sub-project: hackathon event assistant, open-source template
  - ChanMeng666/makey-makey-iot-slides   # sub-project: Peyvand Academy workshop
  - ChanMeng666/super-mario-makey-makey  # the workshop's bonus showcase
live: https://www.shesharp.org.nz/
stack: [Next.js 15, React 19, TypeScript, Drizzle ORM, Neon Postgres, NextAuth 5, Stripe, Resend, OpenAI gpt-4o-mini, Upstash Redis, Slack API, Vercel, GitHub Actions, Claude Code agent skills, Mintlify, Remotion]
stories: 8
publicEvidence: [nirmala-chinnappan, lesley-gao, yesha-kaniyawala, prasanth-pavithran, "Outstanding Mentor Award (2026)", "Outstanding Mentor Award"]
privateEvidence: 11
diagrams: true
lastResearched: "2026-10-15"
sources:
  - data/profile/10-career.yaml (work she-sharp, volunteer she-sharp-ambassador)
  - data/profile/20-projects-flagship.yaml (projects she-sharp)
  - data/profile/22-projects-oss-webapps.yaml, 23-projects-oss-more.yaml (her-waka, ai-hackathon-assistant, makey-makey-iot-slides, she-sharp-event-black-board)
  - data/profile/45-showcase.yaml (aotearoa-ai-hackathon-deck, she-sharp-monthly, she-sharp-transformation-record)
  - data/profile/30-recognition.yaml, 50-references.yaml, 60-network.yaml, 80-events.yaml
  - the client's private repository (architecture, schema, workflows, incident records, handover documents)
  - Chan's private transformation record and the charity's private reports repository
  - the public sub-project repositories listed above
  - the charity's private Slack archive (website, events and general channels; direct messages)
  - private archived repositories: the platform's April 2026 snapshot, the migration crawler, the event welcome board
---

# She Sharp

## In one breath

She Sharp is a volunteer-run New Zealand charity for women in technology,
with 96+ events since 2014. Its founder, Dr Mahsa Mohaghegh (McCauley),
recruited me as the senior engineer the charity did not have. Over 13.3 months
I replaced its no-code website with a platform it owns (AI mentor matching,
member dashboards, Stripe billing), moved its 1,549-person mailing list off a
marketing vendor with 0 failed sends, and wrote its recurring work down as 11
agent skills a non-engineer can run. When I left in September 2026, I handed
over to two maintainers with a written runbook, and the platform is still the
charity's live site.

## The problem

In July 2025 the charity ran on rented software: the website inside Webflow,
the mailing list and its consent history inside Mailchimp, the artwork in
Canva, and eleven years of decisions in Slack. Each tool was a sensible choice
for a committee of volunteers. Together they meant that the organisation's own
record sat somewhere it could neither read in bulk nor take away. The previous
move, from WordPress to Webflow in 2023, had cost the second half of that year
re-entering every past event by hand.

The obvious answer was a better site builder. It would not have been enough.
The mission needed things no drag-and-drop builder expresses: member roles
(mentor, mentee, admin), AI mentor matching, paid membership, consent records
the charity controls, and Slack-integrated operations for a team of
volunteers. And a second migration had to avoid repeating the first: the data
had to come out cleanly.

## What I built

A Next.js 15 application on Vercel, in a repository the charity holds, backed
by a Neon Postgres schema of 39 tables and 33 enums. The public site is
prerendered from data files; the same app runs the member dashboards, an admin
area, a slide-deck player for events and the charity's email. Around it sit
Slack bots, three scheduled jobs and the agent skills that let volunteers run
the event and newsletter cycle.

- **Member platform**: sign-up by password or Google/GitHub, one account that
  can hold several roles at once, and three role-permissioned dashboards.
- **AI mentor matching**: a rule-based pre-filter, then gpt-4o-mini scoring
  against an explicit five-part rubric, a rule-based fallback, and an admin
  who approves every match.
- **Membership and donations**: Stripe checkout that issues an invitation code
  tied to the payment, so email, payment and account stay linked.
- **Email the charity owns**: double opt-in, four sender streams, one call site
  for the email provider, and the consent record in its own database.
- **Slack**: a `/event` command that turns a plain-English request into a
  validated pull request, weekly mentorship and funding digests, and a
  weekday triage reader that never marks anything read.
- **11 agent skills**: event setup, newsletter, posters, decks, promo video,
  mailing list and contact replies, with an orchestrator that checks an event
  and names the skill that closes each gap.
- **Five builds around it**: the Her Waka teaching site, the Aotearoa AI
  Hackathon event assistant, the hackathon's 91-slide event deck, the
  Makey Makey workshop for teenagers, and the Monthly She# newsletter.

## Stories

### S1. Choosing the new stack by how the data comes back out

- **Kind**: decision
- **Situation**: The charity's 2023 move from WordPress to Webflow had no plan
  for the data, so a volunteer team spent half a year retyping events. Webflow
  in turn had no bulk media export and kept code export behind a plan the
  charity had already left.
- **What I did**: I made "how does the data come back out?" the first test for
  every choice, before features. That ruled out another hosted site builder and
  led to a Next.js app in the charity's own GitHub organisation with Postgres it
  can dump. Because Webflow could not export, I wrote a Python crawler that
  pulled the old site's content into structured JSON (1,748 images, 707 MB, 11
  files): events, podcasts, galleries, news and pages from the site, plus
  event details from the ticketing platform's structured data, with banner
  images re-requested at 1,600 px instead of the 500 px the pages served, URL
  de-duplication across scrapers, and a Wayback Machine lookup for images
  that had already gone dead. I rebuilt the legacy images from the old pages' own markup, and added a
  CI check that fails if any event page loses an image. In the middleware I
  kept a rule that 308-redirects Webflow's old pagination URLs to clean ones.
- **Result**: The new site launched without retyping, the old links still
  resolve, and the platform now does what Webflow could not (memberships,
  matching, billing, dashboards). Its content lives in files and tables the
  charity holds.
- **Engineer's angle**: A migration is finished when the old world's links
  still work, not when the new site goes live. The 308 (not 301) keeps the
  request method; the image check turns "nothing was lost" into a gate rather
  than a hope.
- **Plain version**: I picked the tools by asking how easily the charity could
  leave them, so this move would be the last painful one.
- **Follow-ups**:
  - *Why not a better no-code tool?* The requirements (roles, matching,
    billing, consent records) were beyond what builders express, and the
    lock-in was the original problem.
  - *What could not be exported?* The images and the historic event register;
    both were recovered from the published pages while they were still being
    served.
  - *Isn't Vercel also rented?* Yes, but it hosts code the charity owns; moving
    it means redeploying a repository, not rebuilding a site.

### S2. AI mentor matching that never pairs anyone on its own

- **Kind**: implementation
- **Situation**: My mandate included AI mentor-mentee matching. A volunteer
  programme can afford neither wrong pairings nor a feature that stops when
  an API is down.
- **What I did**: I built a two-stage pipeline. A cheap rule-based filter
  scores every pair on basics (skills, industry, meeting format) and only
  promising pairs reach gpt-4o-mini, which scores them at temperature 0.3
  against an explicit rubric: skills 35%, goals 30%, MBTI 15%, industry 10%,
  logistics 10%. Each answer is schema-validated, cached per pair in Redis and
  retried with exponential backoff. If the model is unavailable, the same
  weights are applied by rules and the result is marked low-confidence for
  manual review. An admin approves every match before anyone is paired. In the
  schema, a person is one user with one row per role, so someone can mentor and
  be mentored at once with no special case.
- **Result**: Matches arrive with five sub-scores and a written reason, and an
  admin makes the call. The queue keeps working when the AI does not.
- **Engineer's angle**: Cost control, explainability and availability come
  from three separate choices: the pre-filter, the explicit weights, and the
  fallback using the same formula. Mentor and mentee data is split between the
  imported form and the profile, and a single resolver walks both; reading one
  table alone is what once made avatars disappear across many endpoints.
- **Plain version**: The AI suggests mentor pairs and explains why, and a
  person always makes the final decision.
- **Follow-ups**:
  - *Why MBTI?* The application forms ask for it. It carries 15%, against
    65% for skills and goals together.
  - *What if OpenAI is down?* Rule-based scoring with the same weights, flagged
    "manual review".
  - *Why not auto-pair above a threshold?* Mentoring relationships are personal;
    the cost of a bad automatic pair is borne by a volunteer.

### S3. Moving 1,549 people off Mailchimp without losing consent

- **Kind**: delivery
- **Situation**: The newsletter list and the record of who had agreed to it
  lived in Mailchimp. Its dashboard showed one "subscribed" number that hid how
  each person had got there.
- **What I did**: Before moving anyone, I traced every contact to the act that
  put them on the list and classified them into five tiers. I reported the
  unflattering result: 75.4% had arrived by an act that was not a subscription.
  I built double opt-in where confirming needs a button press, never a link
  visit, because corporate mail scanners follow every link. I put four sender
  streams behind a single call site for the email provider, kept the consent
  record in the charity's own Postgres, deleted the provider's own audience
  objects so the vendor would not become a second source of truth, and held
  2,129 non-consenting contacts as one-way hashes so a later import cannot add
  them back. I moved the sending domain into an organisation-owned account,
  matching region and Return-Path so the DNS change came down to one record (29
  before, 29 after, one value different).
- **Result**: The first send went out on 2026-08-31 in 16 idempotent batches
  with 0 failures and a 0.45% bounce rate. 179 past newsletters were recovered
  and are served from the charity's own site. The founder still approves every
  broadcast; the skill records the test send, the review round and her
  approval. The same rule, proven rather than inferred, went into a mailbox
  audit: I sent one real message to each of the 11 addresses printed on the
  site and read delivery back. 7 did not exist, including the headline
  contact address; all were fixed.
- **Engineer's angle**: Each batch carried its own idempotency key and strict
  validation, so a retry could not double-send and one bad address could not
  silently drop. The DKIM-only swap was safe because the Return-Path did not
  move and DMARC was at `p=none`; I wrote that caveat down rather than treat it
  as a general recipe. A CI gate fails the build if an email address or a
  ticketing access code reaches a committed file.
- **Plain version**: I moved the charity's mailing list into its own system
  and, on the way, found out honestly who had actually agreed to receive it.
- **Follow-ups**:
  - *Why not just export the CSV and import it?* That carries the five tiers
    over as one "subscribed" flag, which is the problem.
  - *Is Mailchimp gone?* No. The newsletter left it; event campaigns are still
    written there, and closing the account is the founder's decision.
  - *Why does confirming need a button?* A GET that confirms will be confirmed
    by link scanners for people who never agreed.

### S4. Incidents that taught me to break my own guards

- **Kind**: incident
- **Situation**: Three small failures in a row had the same shape. In March
  2026, duplicated URL fallback logic put `localhost:3000` links into a batch
  of real mentor invitation emails. During the move from my personal Vercel
  account to the charity's, an environment variable copied with a trailing
  newline would have broken Stripe webhook verification in live mode; I caught
  it and wrote a rule. In June that rule itself turned out to write empty
  values with the newer CLI, caught in the same session by reading the values
  back. In September, a local test with a production key sent a few
  confirmation emails with localhost links, through the one send path the
  earlier guard did not cover.
- **What I did**: I fixed each one, recorded it with its date in the
  repository's runbooks, and changed how guards are written: a guard is not
  verified until you hand it the input it should refuse. I added a localhost
  link guard to the single send function and built its test from the real
  message, not a paraphrase. Writing that test caught a bug in the guard
  itself: its first pattern would have refused ordinary hosts such as
  `localhost.example`.
- **Result**: The site's gates carry self-tests, and the rules sit in the
  repository beside the incident that produced them. On 2026-08-30 the same
  method found two other checks that read as correct and gated nothing.
- **Engineer's angle**: Green is the state a broken check and a working check
  share. A check keyed on an annotation inherits the blind spot of the pass
  that wrote it. And a prevention rule needs the same verification as the fix:
  the 2026-06 failure was the 2026-03 rule.
- **Plain version**: I learned to test my safety checks by trying to get past
  them, because a check that never fails might not be checking anything.
- **Follow-ups**:
  - *How did you find the September one?* A person opened their inbox; that is
    why the test is built from the real message.
  - *What changed in your process?* Every guard gets a refusal test, and every
    rule gets the dated incident that justifies it.

### S5. Writing a charity's recurring work down as 11 agent skills

- **Kind**: implementation
- **Situation**: Publishing an event meant someone reading a Slack channel,
  downloading and renaming posters, headshots and bios, and editing the site
  by hand. Newsletters, posters, decks and video each lived in a different
  console or in one person's memory, so the work depended on whoever was free.
- **What I did**: I wrote each loop as an agent skill kept in the repository
  like code: instructions, scripts and reference rules, changed by pull
  request and type-checked in CI (which needed a second tsconfig, since the
  root one skips the skills folder). Skills are dry-run by default. The poster
  skill generates a textless image and sets every word in code, so a changed
  speaker title is a one-line fix. The video skill renders one composition into
  four aspect ratios. `run-event-playbook` builds nothing: it runs 10 checks on
  an event and names the skill that closes each gap. A Slack `/event` command
  turns a sentence into a schema-validated draft, shows a diff and opens a pull
  request on confirm. The agent's own rules are split across nine `CLAUDE.md`
  files by when a rule must load, not by topic.
- **Result**: 11 skills and a guide for teammates who do not code. Work that
  needed a vendor console now runs from a command and can be reviewed and
  re-run. I trained the volunteer team in six sessions, including a two-hour
  workshop in Auckland where I produced promo videos live. I am honest about
  adoption: the committee still makes most artwork the old way.
- **Engineer's angle**: An AI-native team is one whose work is written down
  precisely enough for an agent to execute and a person to audit. The
  structured output is validated before any git write, the default is dry-run,
  and a human approves. No timing study was run, so I claim no hours saved.
- **Plain version**: I wrote down how the charity's routine jobs are done, so
  that an AI assistant can do them and a volunteer can check the result.
- **Follow-ups**:
  - *How do you stop the model writing nonsense to the site?* Schema
    validation, a draft branch, a preview, a human confirm and CI.
  - *Did people use it?* The newsletter and the event deck replaced the old way
    at least once; posters mostly did not. Shipping a capability and shipping
    its adoption are two projects.
  - *Why skills, not a SaaS tool?* A procedure in a repository can be reviewed,
    diffed and tested; one in a console cannot.

### S6. Designing the handover so the answer is a file, not a person

- **Kind**: delivery
- **Situation**: I had built most of the system, so too much of it lived in my
  head and, at first, in my own accounts: the repository and deployment began
  under my personal accounts, and the database and an image store were later
  found to sit there too.
- **What I did**: In March 2026 I moved the repository, deployment and OAuth
  apps into the charity's accounts. Before leaving, I copied
  the production database into the charity's own database account, moved user
  uploads into a store the charity already pays for, and removed the last
  dependency on my credentials. In August 2026 I ran a refactoring pass aimed
  at the next maintainer: the schema split by domain behind one import, one
  auth wrapper for every protected route, zod validation on request bodies
  that had none, and large media moved out of the repository (with an offline
  mirror kept before its history was purged). A snapshot of the repository
  from April 2026 shows the distance: one agent guidance file, no test files,
  a deploy workflow but no pull-request gate, no agent skills, and most API
  routes without request validation. By September there were nine guidance
  files, 33 test files, five CI jobs on every pull request and 11 skills. I
  wrote the documentation as the work went:
  35,062 lines of Markdown across 105 files, a maintainer handover whose first
  question is "what stops working, silently, when the person who built this
  stops answering?", two internal playbooks served as live pages and
  hash-checked in CI against their source, and 52 recorded decisions, including
  the ones marked won't-do. I named the decisions that only the founder
  could take and left them with her.
- **Result**: A volunteer I had mentored made their first independent page
  update in late August 2026. Two maintainers were named in September 2026
  with organisation owner rights, each recurring obligation has one name
  against it, and the remaining team kept shipping changes after my access was
  removed. The
  platform and the agent skills are still in use.
- **Engineer's angle**: Access was shared and obligations were not: every
  recurring job got exactly one owner, because "the maintainers" owns nothing.
  The handover writes every count with the command that produced it and
  the date, because a hand-typed number in prose is a claim nobody
  re-checks.
- **Plain version**: I made sure the charity could keep running everything
  after I left, without needing to ask me.
- **Follow-ups**:
  - *What did you leave unfinished?* A safeguarding reporting route was
    proposed and not built; I named it as mine.
  - *Why so much documentation?* The Markdown is the interface. It is what
    turns a one-person system into one an organisation owns.

### S7. Launching against the founder's bar, not mine

- **Kind**: requirements
- **Situation**: By March 2026 the platform worked on desktop and real mentors
  already had accounts on it. The founder tested it on her phone and did not
  want to launch: the mobile layout broke, fonts and colours did not follow the
  brand kit, nobody but me had tested it, and I was the only person who could
  change it. The site was also still running on my personal hosting account,
  which was not a safe home for an organisation's live service.
- **What I did**: I treated her objections as the launch criteria instead of
  arguing for the platform. I agreed the mobile fixes with Lesley Gao, who led
  the front end, and moved the repository, hosting and sign-in apps into the
  charity's own accounts (2026-03-24). A volunteer tester worked through the
  site, including the event pages from 2014 to 2022, with the results tracked
  in a shared results sheet, and I fixed what the pass found. On 2026-06-18, with
  the old site's renewal due and registrations open for that weekend, the
  founder asked for the cutover within a day and for mentorship, membership
  and sign-in to be closed. I moved the domain and closed the application
  forms, but pushed back on closing sign-in: existing mentors and mentees would
  have been locked out, and new sign-ups already need an invitation code.
- **Result**: The domain moved to the new platform on 2026-06-19 with existing
  accounts still working. The application forms were paused by redirect, not
  deleted, with a written runbook for reopening them.
- **Engineer's angle**: Read the request against its purpose. "Close sign-in"
  meant "stop strangers joining", which the invitation-code gate already did;
  closing it would have broken the people already using the platform. A
  reversible pause (a redirect plus hidden buttons, code intact) is cheaper
  than a removal and a rebuild.
- **Plain version**: The founder's standard for "ready" included her phone and
  her brand, so I made those the checklist and launched when they were met.
- **Follow-ups**:
  - *Why wasn't it ready in March?* Desktop was. Mobile and brand polish were
    not, and no one outside the build had tested it. I should have asked for a
    non-developer's test pass much earlier.
  - *Did you ever disagree with the founder?* Yes, on closing sign-in, and I
    explained who it would lock out. She agreed and the cutover went ahead.

### S8. Five builds around the platform

- **Kind**: delivery
- **Situation**: The charity's programmes kept needing small, fast tools that
  did not belong inside the main platform.
- **What I did**: I built each alone. **Her Waka**: a Mintlify teaching site
  for a Ministry of Social Development-funded employment programme for women at
  academyEX Auckland (March to June 2026), with the four workshops I authored
  and 12 self-paced tutorials. **Aotearoa AI Hackathon event assistant**: in
  2025, a chat assistant with a 3D mascot and a community FAQ, later
  generalised into an open-source template; for 2026, rebuilt as a voice-first
  agent over the OpenAI Realtime API, where the server mints a short-lived
  secret so the real key never reaches the browser. Minting is guarded by
  per-visitor limits over three windows, a much larger per-network ceiling so
  one address cannot farm tokens by forging visitor ids, and per-visitor and
  event-wide daily budgets; the agent's instructions load from the database
  in parallel with those checks. **The hackathon's event
  deck**: 91 slides rendered in the browser from the event's own data, with
  timers, team slides and the winners reveal, that ran two days at AUT City
  Campus. **Makey Makey workshop**: a 20-minute slideshow for 12 to 18 year
  olds, resting on the fact that the board emulates a keyboard: students
  vibe-code a banana piano, a Simon Says and a catch-and-dodge game in
  claude.ai in the browser (nothing to install on locked-down school laptops),
  then play them with fruit. A bonus Super Mario level, every sprite and sound
  drawn in code on a canvas, showed what the paid tools can do. **The Monthly She#**: the newsletter rebuilt on the charity's own
  infrastructure (S3).
- **Result**: Her Waka launched in March 2026 on the site I built. I was named
  Outstanding Mentor at the hackathon festival in both 2025 and 2026.
- **Engineer's angle**: Each picks the smallest stack that fits: docs-as-site
  for a teaching hub, a zero-build static deck for a classroom, data-driven
  slides so a changed time is one edit. The voice agent keeps credentials
  server-side and rate-limits token minting. On the deck I also replaced a
  sign-up QR code: it pointed at a form with a file-upload field, which forces
  a Google sign-in, so people scanning it in a hall got stuck. It now opens a
  public page on the site, and the feedback form became a native form that
  writes to the database and posts to a Slack channel.
- **Plain version**: Alongside the main website I built the teaching site,
  the hackathon assistant and slides, and a kids' workshop the charity's
  programmes needed.
- **Follow-ups**:
  - *What happened to the 2025 assistant?* I generalised it into an
    open-source template other events can configure, and built the 2026
    voice agent from scratch.
  - *How does the deck stay correct?* It reads the same event entry as the web
    page, and CI checks every registered deck.

## Numbers I can say

| Figure | Source |
|---|---|
| 96+ events since 2014; 2,919 distinct people registered on record; 39 sponsors on the logo wall | `data/profile/10-career.yaml` work `she-sharp` |
| 13.3 months, July 2025 to September 2026 | `10-career.yaml` work `she-sharp` |
| 63 pages, 84 API routes, 198 components | `20-projects-flagship.yaml` `she-sharp` metrics |
| 39 tables, 33 enums, 32 SQL migrations | `20-projects-flagship.yaml` `she-sharp` metrics |
| Matching weights: skills 35%, goals 30%, MBTI 15%, industry 10%, logistics 10% | `20-projects-flagship.yaml` `she-sharp` metrics |
| 1,549-person list; 16 idempotent batches; 0 failures; 0.45% bounce rate | `10-career.yaml` work `she-sharp`; `45-showcase.yaml` `she-sharp-monthly` |
| 75.4% of the list arrived by an act that was not a subscription | `10-career.yaml` work `she-sharp` |
| 2,129 non-consenting contacts held as one-way hashes | `10-career.yaml` work `she-sharp` |
| 179 past newsletters recovered | `45-showcase.yaml` `she-sharp-monthly` |
| DNS: 29 records before and after, one value different | `10-career.yaml` work `she-sharp` |
| 11 agent skills | `10-career.yaml` work `she-sharp` |
| 35,062 lines of Markdown across 105 files; 52 recorded decisions | `10-career.yaml` work `she-sharp` |
| 7 of 11 published email addresses did not exist | `10-career.yaml` work `she-sharp` |
| 1.15 GB of the organisation's own record recovered from four platforms | `10-career.yaml` work `she-sharp` |
| Migration crawler: 1,748 images, 707 MB, 11 JSON files | `20-projects-flagship.yaml` `she-sharp` metrics |
| Six enablement sessions for the volunteer team | `10-career.yaml` work `she-sharp` |
| Her Waka: 4 workshops, 12 tutorials | `23-projects-oss-more.yaml` `her-waka` |
| Her Waka sessions: 128 registrations and 96 check-ins across the four sessions, March to June 2026 (per session, not distinct people) | `23-projects-oss-more.yaml` `her-waka` metrics |
| Hackathon deck: 91 slides, 2 days, 12 teams | `45-showcase.yaml` `aotearoa-ai-hackathon-deck` |
| Outstanding Mentor, 2025 and 2026 | `30-recognition.yaml` |

Not to be said: any hours-saved figure (none was measured), any figure for
community reach other than the three above, that any subscription was
cancelled, or any money figure. Two judgement stories about the charity's
software and ticketing arrangements may be told in an interview without figures;
the wording is prepared in the private layer.

## In hindsight

- **I scheduled the capability and not its adoption.** I shipped skills,
  announced them and expected use to follow. The better move was to sit with
  the person who owns each loop for its first real use: one accompanied run is
  worth more than a guide.
- **A non-developer's acceptance test earlier.** The founder's first phone
  test found what my desktop testing had not. A volunteer test pass in
  January would have moved the launch forward.
- **A second maintainer earlier.** For most of the build one person held most
  of the knowledge. The documentation was written as the work went, but naming
  a co-maintainer months before I left would have tested it sooner.
- **Accounts from day one.** Starting the repository and deployment under my
  own accounts made the first months quick and cost a migration later, plus
  two stores I only found during the handover.
- **The safeguarding route.** A reporting form that writes into the
  platform's own database was proposed and not built. Every part it needs
  exists; the work was mine and I did not do it.

## Evidence

- **Nirmala Chinnappan** (`nirmala-chinnappan`), She Sharp website team:
  "spearheading the transition from a no-code Webflow platform to a modern
  full-stack development environment [...] clear documentation practices, and
  a strong sense of ownership".
- **Lesley Gao** (`lesley-gao`), the other developer on the platform: "She
  naturally becomes the technical backbone of the team [...] confident enough
  to push back on ideas that may not make sense, always with thoughtful
  explanations or better alternatives." She also names the Her Waka site.
- **Yesha Kaniyawala** (`yesha-kaniyawala`): "the driving force behind website
  management at SheSharp".
- **Prasanth Pavithran** (`prasanth-pavithran`): "knows when to lead, when to
  contribute, and when to support others."
- **Outstanding Mentor Award (2026)** and **Outstanding Mentor Award** (2025),
  Aotearoa AI Hackathon Festival, co-hosted by She Sharp.
- Public event page: billed "AI Lead and Website Team Lead, She Sharp" as MC of
  the She Sharp × Les Mills evening, 2026-09-03 (`80-events.yaml`).
- Private evidence: 11 items (words from the founder and teammates in the
  team's chat, and two decisions that followed the work), counted, not
  quoted.

## Open questions

1. **Matching outcome.** No measured outcome exists for the matching engine
   (matches approved, relationships that ran). Chan will look it up or ask the
   current maintainers; an interviewer is likely to ask.

Settled on 2026-10-15: the shards now list the three crons that production
schedules, Vercel Blob in place of Cloudinary, the reversible pause of mentorship
applications since 2026-06-19, four newsletter issues composed in the new system
with one (August 2026) broadcast through it, and the back-end/front-end split
with Lesley Gao in `myRole`. The LinkedIn project title no longer makes a reach
claim and leads with the matching engine, stating the human approval. The
repository is treated as private. S6's before/after stays qualitative. S4, S5
and the hindsight stay as told.
