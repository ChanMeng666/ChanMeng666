---
id: corde-mobile-application
title: CORDE Field-Operations Mobile App
role: Full Stack Developer and Lead Documenter (Lincoln University COMP693 industry placement)
period: "2024-06 – 2024-11"
status: production
kind: client
repos:
  - private
live: null            # an internal app on CORDE's devices; the shard's url is a presentation page
stack: [React Native, TypeScript, Native Base, SQLite, React Navigation, react-native-maps, Keychain, Android]
stories: 8
publicEvidence: [patricia-anthony]
privateEvidence: 9
diagrams: true
lastResearched: "2026-10-15"
sources:
  - data/profile/10-career.yaml (work id corde)
  - data/profile/23-projects-oss-more.yaml (projects id corde-mobile-application)
  - data/profile/60-network.yaml (organizations id corde; collaborators barry-clark, kullum-ladley)
  - data/profile/70-linkedin.yaml (CORDE position and project)
  - data/profile/46-films.yaml (corde-mobile-film)
  - docs/ecosystem/lineage.yaml (family corde-field-app)
  - the client's private repository, as it stood at handover, and its history
  - the team's private documentation repository, archived (work log June to October 2024, the client's project brief and API documents, sprint question sets and answers, schema versions, progress decks, user guide)
---

## In one breath

CORDE is a Canterbury infrastructure and civil-construction company whose crews
log maintenance work in places where the phone signal drops out. During my
Master's industry placement I was a full-stack developer and the documentation
lead on a three-person team that built them an Android app in React Native: a
crew member records the job, photos and GPS position with no signal, and the app
sends it to CORDE's back-office system when coverage returns. I built most of
the screens a crew member touches, ran the weekly question sets and demo builds
for the client, and left the documentation the next developer used. A teammate
took the app over after the placement and has carried it on for CORDE since.

## The problem

CORDE's back-office platform, Workbench, is a web system that assumes a
connection. Its crews work on reserves, roads and water assets across rural
Canterbury where it is often missing. Paper notes or a web form meant re-typing
and lost detail. A mobile web page was not enough either: the work has to be
captured at the moment it happens, with photos and coordinates, on a device that
may stay offline for hours, then reconciled against a server the team did not
own, through an API built around generic table rows rather than one designed for
a mobile client.

## What I built

A React Native (bare workflow, TypeScript) Android app whose local SQLite
database is the record of the moment of work. Every screen reads and writes
locally; background services push new and completed logs to Workbench when the
device is online and pull the crew's scheduled jobs and reference data down.
The team reported to Barry Clark, CORDE's Digital Development Manager, and
built against the Workbench API documents written by Kullum Ladley, its
Business System Analyst.

- **The field screens** (mine): sign-in with remember-me, the large-card
  dashboard, the log list with search, saved filter sets and sorting, the log
  header form with one-tap date, time and GPS capture, new-log entry with photo
  attachments, the Sync Log screen with date-range sync, and the group screens
  that let a crew close many scheduled jobs with one form.
- **Theme and design system** (mine): CORDE's brand palette mapped onto Native
  Base's colour scales, with light and dark modes.
- **Data design** (mine, with the team): the local schema, worked out across
  many versions against CORDE's database extracts and API, and its ERDs.
- **Sync and storage services** (shared; the sync engine was mostly my
  teammates' code): a per-log sync record, a background queue on timers, a
  prefilled reference database shipped inside the app, and a keychain-backed
  sign-in that also works offline.
- **Delivery**: weekly release builds for the client, progress decks and screen
  recordings, a release-packaging guide, and the team's documentation
  repository, which I wrote almost entirely.

## Stories

### S1. Bare React Native and a design system the client could see

- **Kind**: decision
- **Situation**: In June 2024 the team had to choose a stack before the user
  stories were settled. The app needed on-device storage, the camera, files,
  GPS and a secure keychain, and CORDE wanted to follow the design in Figma.
- **What I did**: We ruled out Expo's managed workflow for this project and
  used bare React Native, so native modules could be added as the offline
  pipeline needed them. For the UI library we tried Native Base, switched to
  React Native Elements when Native Base's restructuring made us doubt its
  future, then switched back within days because Native Base shipped a Figma
  component kit: design and code would use the same components. I then built
  the UI layer on it: a theme that maps CORDE's orange and greys onto Native
  Base's colour scales, light and dark modes, and a team rule (July 2024) to
  compose library components instead of writing long custom style blocks.
- **Result**: The client reviewed the design in the same Figma workspace the
  code followed, and in August 2024 CORDE asked its brand consultant to review
  the new UI there and test a build. The UI was redesigned more than once without changing library,
  and dark mode was in the first demo build of the new design.
- **Engineer's angle**: The real trade-off was control over native modules
  against Expo's build tooling. With Expo's development builds and config
  plugins as they are now, I would re-test that decision rather than repeat it.
  The UI-library choice was a bet on maintenance; its maintainers have since
  moved on to a successor library, which is the risk we had spotted.
- **Plain version**: We picked tools that let the app use the phone's camera,
  storage and GPS fully and kept the design and the code in step.
- **Follow-ups**:
  - *Why not Expo?* In mid-2024 we judged that the offline pipeline needed
    native modules outside the managed workflow; it was a team call, and I
    would check it again today.
  - *How did you keep the UI consistent?* One theme object for colours and
    modes, and library components first, custom styles last.

### S2. Designing for gloves and sunlight

- **Kind**: requirements
- **Situation**: In July 2024 I redesigned the app: the dashboard cards became
  a bottom tab bar and sign-in went straight to the log list. It looked
  cleaner. At the next on-site sprint review CORDE pointed out that crews work
  outdoors wearing gloves.
- **What I did**: I put the large-card dashboard back the same day and raised
  font and icon sizes across every screen. Dark mode stayed for low light and
  glare. In September, after testing on the client's own large-screen device, I
  started a further layout pass aimed at older users and gloved hands. I also
  wrote the user-characteristics notes in the documentation repository so the
  next designer would not have to learn this a second time.
- **Result**: The large-card dashboard is what shipped; it is what the app's
  promo film and README card show.
- **Engineer's angle**: A requirement that was in none of the user stories but
  decided the layout. The client's brief asked for a simple interface for staff
  who are not confident with technology; it said nothing about gloves. Touch-target size and contrast are functional
  requirements for field software, and the cheapest time to find them is in
  front of a real user on the real device.
- **Plain version**: The people using it wear work gloves, so I made every
  button big enough to hit with one.
- **Follow-ups**:
  - *Did you push back?* No. Their reason was about the user, not taste; I
    changed it and recorded why.
  - *What would you do differently?* Test the first layout on the client's
    device, with gloves on, before polishing it.

### S3. Pinning down the log lifecycle before the sync was written

- **Kind**: requirements
- **Situation**: An offline app keeps its own copy of each job's status, and
  Workbench changes some statuses by itself. We had been told several statuses
  could be ignored, which is dangerous advice for a client that must not drift
  from the server.
- **What I did**: I ran the team's weekly question sets for the sprint
  meetings. In September 2024 I put the status question in writing: which of
  the server's statuses are still used, which change automatically on the
  server, what Save Draft and Submit should do, what status a log created
  offline should start with, and whether my reading (a new log goes from open,
  to logged, to allocated once the server has it) was right. The same set asked
  how the group screens should filter and complete jobs.
- **Result**: The answers went straight into the code: a log created offline is
  queued as open, becomes allocated once Workbench returns its id, and is marked
  completed only when arrival and completion times are filled. The log-type
  filter offers only the two types CORDE confirmed it uses.
- **Engineer's angle**: This is a small distributed state machine where one
  side (the server) owns some transitions. Writing the transitions down and
  getting the owner to confirm them was cheaper than discovering them from bug
  reports.
- **Plain version**: Before building how the app keeps in step with the office
  system, I got CORDE to confirm, in writing, every state a job can be in.
- **Follow-ups**:
  - *How did you run client communication?* Questions collected during the
    week, agreed inside the team, sent before the on-site meeting, and the
    answers recorded in the documentation repository.
  - *What if the server changes a status while the device is offline?* On the
    next pull the server's version replaces the local copy; see "In hindsight".

### S4. Closing many jobs with one form

- **Kind**: implementation
- **Situation**: Maintenance crews often do the same scheduled task on many
  assets in one place, then had to complete each job separately. Kullum Ladley
  sent CORDE's Group Completion Workflow specification at the end of August
  2024.
- **What I did**: I built both screens and the batch logic within two weeks. The
  Create Group screen lists the scheduled jobs for a chosen service agreement,
  with search and filters; the crew ticks the jobs. The Complete Group screen
  takes one set of arrival and completion times, location and the agreement's
  extra fields, then submits every selected job through the same path a single
  completion uses, so validation, local storage and upload are identical.
- **Result**: Group completion was on CORDE's priority list for the first week
  of September and was in the builds the client tested from mid-September.
- **Engineer's angle**: Reusing the single-log submit path kept one code path
  for validation and sync. The weak point is error reporting: the batch runs in
  parallel and reports one failure for the whole group. Settling each job
  separately and showing which ones failed would be the next change.
- **Plain version**: A crew can now finish twenty identical jobs with one form
  instead of twenty.
- **Follow-ups**:
  - *Why not a bulk endpoint?* The client's API completes one log at a time;
    the app could not add one.
  - *What happens offline?* In the version I handed over, new logs could be
    created offline but completion, single or grouped, needed a connection.
    Queuing completions the way new logs are queued was the obvious next step.

### S5. A local schema for a server we did not own

- **Kind**: decision
- **Situation**: Workbench exposes most data through generic table endpoints
  that return numbered columns. The team had two draft schemas of its own and
  extracts of CORDE's database, and the three did not agree.
- **What I did**: With the team I merged the two drafts and CORDE's extracts
  into one schema in June 2024, then kept every version, with its ERD, in the
  documentation repository. We checked each column against the API it is filled
  from, and in July wrote the side-by-side comparison of two versions that
  settled the open points: drop fields the API never returns, add ones it does,
  and drop foreign-key constraints in favour of joins enforced in code.
- **Result**: Each column in the app's schema is annotated with the API field it
  comes from. Reference data can be loaded in any order, which mattered because
  it arrives page by page. A teammate's proposal to ship a prefilled reference
  database inside the app removed the long first sync.
- **Engineer's angle**: Foreign keys protect integrity, but on a device that
  mirrors a remote system page by page they turn every out-of-order page into a
  failed insert. Integrity moved into the sync code, and that is the cost: it
  must now be tested there. The local id and the server id are separate
  columns, so a job created offline never collides with one the server issues.
- **Plain version**: I designed how the app stores CORDE's data so it matches
  their system field for field and still works when the data arrives in pieces.
- **Follow-ups**:
  - *Did you write the database code?* The initialisation and most of the data
    access were teammates' code; I owned the design, the documents and the
    queries behind my screens, such as saved filters.
  - *How did you handle schema changes on installed devices?* A version table
    and migrations on start-up.

### S6. Making sync visible to the people testing it

- **Kind**: difficulty
- **Situation**: When sync goes wrong on a tablet, nobody sees why. During the
  build the team met first requests failing until a screen was reopened, test
  phones without Google services where the map would not load, and a log
  saved on the device that did not appear in Workbench.
- **What I did**: I built the Sync Log screen: a calendar to pull only the date
  range a crew will work in, the last sync time in New Zealand format, and a
  coloured result banner instead of a notifications panel that took up room. I
  restyled the Debug screen (stored logs, files, sync records, extension fields)
  and added copy-to-clipboard for a single record, so a tester could paste the
  exact stored row into a bug report. At CORDE's request I moved Debug from the
  dashboard into Settings.
- **Result**: Testers could attach the exact stored record to a bug report, and
  for the missing-upload case the team arranged an extra on-site session with
  the client to go through the runtime logs together.
- **Engineer's angle**: Observability on a device with no log shipping is a UI
  problem. A date-range pull also bounds the work a sync has to do, which
  matters when every page needs a detail request per job.
- **Plain version**: I gave testers a way to see and copy exactly what the app
  had stored, so problems could be fixed instead of guessed at.
- **Follow-ups**:
  - *What was the hardest bug?* A log saved locally that never reached
    Workbench. We arranged a dedicated session with the client to go through
    the runtime logs. The team's records end before the fix; reading the code
    since, the likely root is how a failed upload left the queue (see "In
    hindsight").
  - *Why a date range?* Pulling everything was slow; crews only need the days
    they are about to work.

### S7. One codebase, three students, new to React Native

- **Kind**: collaboration
- **Situation**: The team had five months, weekly client reviews and two
  teammates who were also new to React Native. Early on, one could not get the
  project running at all.
- **What I did**: In early July 2024 I split the code into separate function,
  style, view and hook files so several people could work without editing the
  same file, then walked a teammate through running the project, the folder
  structure and how to read the docs, and reviewed the code they wrote. I gave
  small, well-bounded UI tasks with live help. In mid-July the repository moved
  to a main branch plus a develop branch with pull requests, and I merged most
  of them into main. In late August I raised that two of us were layering
  changes over each other's code without deleting any; my teammate preferred
  to finish features first, so what I could do without blocking features was a
  comment-and-format pass in September.
- **Result**: Teammates delivered screens and services in the same codebase;
  one of them went on to own the project after the placement.
- **Engineer's angle**: File structure is a coordination tool. The
  disagreement about refactoring before or after features is a real one; we
  settled it by sequencing, not by vote.
- **Plain version**: I organised the code and coached teammates so three
  beginners could build one app together without stepping on each other.
- **Follow-ups**:
  - *How did you handle the disagreement?* I stated the cost (dead and duplicate
    code), accepted the feature deadline, and scheduled the clean-up after it.
  - *Did you review code?* Yes, in pairing sessions and through pull requests
    into main.

### S8. Leaving it ready for the next developer

- **Kind**: delivery
- **Situation**: A placement ends; CORDE's app does not. Whoever came next would
  inherit a codebase with comments in two languages and no written build steps.
  In mid-September 2024 one teammate stepped back, leaving the remaining work to
  me for the last month: the client's test rounds, the fixes and the builds.
- **What I did**: In September 2024 I went through the code adding comments,
  translating the Chinese ones into English and checking unclear ones with
  their authors. I wrote the project-structure guide and the release-packaging
  guide, built the weekly release builds the client tested against its own
  testing notes (and moved the team from debug builds to release builds), checked the history after a UI
  update to make sure no feature had been overwritten, and kept the decks,
  screen recordings and the work log of every client meeting in the
  documentation repository.
- **Result**: In October 2024 a teammate took the project over in their own copy
  of the repository and has carried it on for CORDE since, with releases into
  2026. The platform upgrades since then are their work, not mine.
- **Engineer's angle**: A handover is an artefact you write while the work
  happens, not a meeting at the end. The repeatable build guide mattered more
  than any one feature, because the app had no CI.
- **Plain version**: I wrote down how everything worked and how to build it,
  so the app could keep going after I left.
- **Follow-ups**:
  - *Is the app still in use?* It is still maintained and released for CORDE
    by the teammate who took it over; how widely crews use it today is CORDE's
    to say.
  - *Have you worked on it since?* Only on the documentation in my copy of the
    repository; the code since 2024 is theirs.

## Numbers I can say

| Figure | Source |
|---|---|
| Five months, June to November 2024 | `data/profile/10-career.yaml` › `work[corde]` |
| CORDE: 30+ years of operations, about 164 staff | `data/profile/10-career.yaml` › `work[corde].narrative.companyContext` |
| 14 API documents on eight topics (revisions included) and one priority list from CORDE's Business System Analyst | `data/profile/23-projects-oss-more.yaml` › `projects[corde-mobile-application].metrics` |
| Commit share on the code: say it only together with its basis ("counted on the original repository"), exactly as worded in the shard metric, or not at all | `data/profile/23-projects-oss-more.yaml` › `projects[corde-mobile-application].metrics` |
| Promo film: 30 s and 60 s cuts, 16:9 and 9:16 | `data/profile/46-films.yaml` › `corde-mobile-film`; https://youtu.be/RiL7m159I7w |

## In hindsight

- **Retries, not reconciliation.** The upload queue retries on timers, but a log
  whose upload failed fell out of the queue, and a pull overwrote the local copy
  with the server's. I would design the sync as an explicit state machine with a
  dead-letter state the crew can see, and test it before the screens on top of
  it.
- **Report per item.** Group completion should show which jobs failed, not one
  error for the batch.
- **Tests.** The repository had only the default render test. A handful of tests
  around the sync statuses would have caught more than the manual demo cycle did.
- **Name and configure early.** The app kept its template name and package id
  through the placement, and environment settings lived in code. Per-environment
  build configuration from the first week would have saved the rename the team
  kept postponing.
- **Real device, real gloves, first.** Two of the three layout passes would not
  have been needed.

## Evidence

- `patricia-anthony` (LinkedIn recommendation, Associate Professor in Applied
  Computing, Lincoln University): "excellent technical skills, a strong work
  ethic, and an inquisitive nature". About the Master's programme as a whole,
  which included this placement; it does not name CORDE.
- Context, not CORDE-specific: Master of Applied Computing with Distinction,
  and Dean's List (top 5%) for Semester 2, 2024, the semester of the placement
  (`data/profile/30-recognition.yaml`).
- Private items: 9 (not quoted). They are records of client decisions that
  followed the work (requirements given and acted on, priority lists delivered,
  a brand review of the UI, client test rounds, the takeover), not written
  praise.
- No one from CORDE has left a public recommendation.

## Open questions

- **Period end.** The team's records end in mid-October 2024: the last client
  build, the teammate's takeover and an extra debugging session with the
  client. Nothing is dated November. If `2024-11` is the course's end, the
  client work should be described as delivered in October.
- **Written praise.** The team's records hold no email, chat, supervisor
  feedback or grade. A reference from CORDE would have to be asked for
  (Chan will ask).
- **Commit figures.** Left out of this file on purpose; the cleared wording is
  in the shard metric.
