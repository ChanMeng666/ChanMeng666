---
id: ai-programming-teaching-project
title: AI Programming Education Platform
role: Creator, developer and instructor
period: "2024-11 – present"
status: live
kind: teaching
repos:
  - ChanMeng666/ai-programming-teaching-project
live: https://programming.chanmeng.org/
stack: [Docusaurus 3.8, React 18, MDX, Cloudflare Pages, Cloudflare Workers, Workers AI (Llama 3.1 8B Instruct fp8), BGE Base EN v1.5, Cloudflare Vectorize, Cloudflare KV, Cache API, Notion API, Algolia DocSearch, Typst, Mermaid, i18n (EN + zh-Hans), Server-Sent Events]
stories: 6
publicEvidence: [suliat-alaga, abiodun-magret-oyedele, kwame-essuman, mahdieh-najmi, swayam-dhir, jixuan-jessie-wan, di-peng, siyu-xing, shiyu-fang, "Outstanding Mentor Award", "Outstanding Mentor Award (2026)"]
privateEvidence: 0
diagrams: true
lastResearched: "2026-10-15"
sources:
  - data/profile/23-projects-oss-more.yaml (projects[ai-programming-teaching-project])
  - data/profile/10-career.yaml (work[technest], work[forward-with-her])
  - data/profile/90-meta.yaml (meta.x_brand.teachingCohorts, teachingImpact)
  - data/profile/50-references.yaml
  - data/profile/30-recognition.yaml, data/profile/80-events.yaml
  - data/profile/45-showcase.yaml, data/profile/46-films.yaml
  - docs/ecosystem/lineage.yaml
  - github.com/ChanMeng666/ai-programming-teaching-project (code, README, CLAUDE.md, worker/CLAUDE.md, git history to 2026-10-13)
---

# AI Programming Education Platform

## In one breath

programming.chanmeng.org is a free, bilingual website where beginners learn to
build real software by talking to AI tools. I built it, wrote the courses on
it and taught them: five cohorts since 2024, from a women-in-STEM mentorship
programme in China to a 12-week AI track for a Canadian nonprofit and a
workshop for Auckland teenagers. Every course stays online, an AI tutor on the
site answers from the student's own course, and the 2026 TechNest cohort
graduated 30 students who shipped six live AI products to a public showcase.

## The problem

I started teaching AI-assisted programming in late 2024, to mentees in the
Forward with Her programme. Most of them had never written code, and the
material I was teaching changed every few months because the tools did. Slides
would have worked for one class. They would not have given a student a place
to go back to at midnight when a configuration step failed, and they would
have been rebuilt from scratch for every new cohort, so nothing I taught would
build on what came before.

By 2026 I was teaching three different audiences at once (TechNest's AI track,
She Sharp's Her Waka programme for women returning to work, and a Peyvand
Academy workshop for 12 to 18-year-olds). Each needed its own syllabus, the
earlier cohorts still needed their materials, and beginners needed help
between classes that a generic chatbot could not give, because it did not know
which course they were on.

## What I built

A Docusaurus site where each cohort is a versioned copy of the docs, with a
small Cloudflare Worker behind it for the parts that need a server. The site
deploys to Cloudflare Pages on every push; the Worker deploys separately.

- **Five course versions side by side**: TechNest 2026 (the default), Peyvand
  Academy 2026, Her Waka 2026, Summer 2025 and Winter 2024. Each has its own
  sidebar and keeps a stable URL. One file, `versions.json`, lists them, and
  both the chat widget and the Worker read it.
- **An AI tutor on every page**: retrieval over the lessons of all five
  courses and the blog, biased toward the course the student is reading,
  answered by Llama 3.1 8B on Workers AI and streamed back with the lessons it
  drew on named at the end.
- **Lessons written for prompting, not typing**: React components that mark
  each step as something to say to the AI, something to check, something only
  a human can do, or what to say when stuck. Each TechNest week also ships as
  a printable PDF handout compiled with Typst.
- **Classroom features**: a message board and a capstone showcase with guest
  voting, both stored in Notion so the programme owners moderate in a tool
  they already use; certificates with public verification pages.
- **Bilingual throughout**: English and Simplified Chinese, with search
  filtered by language and course version.

## Stories

### S1. A versioned site instead of a slide deck

- **Kind**: decision
- **Situation**: In November 2024 I was teaching AI-assisted web development
  to Forward with Her mentees, most of them beginners. I needed somewhere to
  keep tutorials, recordings and exercises that students could return to, and
  I already knew there would be another cohort.
- **What I did**: I built the course as a Docusaurus site, and in July 2025,
  when the second cohort started, I turned on versioned docs so the Winter 2024
  course was frozen as its own version and the Summer 2025 course sat beside
  it. When the 2026 programmes arrived I added each as a new version and made
  TechNest the default, with redirects so old links kept working. Adding a
  cohort is now four small edits: the version list, a label, one row in the
  tutor's indexing script, and a re-index.
- **Result**: Five courses run side by side, three of them in 2026, and a
  student from the first cohort still reaches that course at the same address. The
  2024 course itself taught students to build a site with Docusaurus, so the
  platform was also the worked example.
- **Engineer's angle**: Docusaurus versioning copies the whole doc tree per
  version, so there is no unversioned "current" content at all
  (`includeCurrentVersion: false`). That trades disk duplication for the
  guarantee that editing the live course can never change an old one.
- **Plain version**: Every class gets its own permanent copy of the course, so
  a new class never breaks an old student's materials.
- **Follow-ups**:
  - *Why Docusaurus and not a learning platform like Moodle?* I wanted MDX, so
    lessons could hold interactive components, plus versioning and i18n built
    in, and a static site with no server to run. A hosted LMS would have
    given me enrolment I did not need and taken away the custom components.
  - *How do you stop five versions drifting apart?* I don't try to. Each is a
    snapshot of what that cohort was taught. Shared things, such as the
    components and the tutor, live outside the versions.

### S2. "Natural language is the source code": designing a course for people who have never coded

- **Kind**: requirements
- **Situation**: TechNest's 2026 AI track was the organisation's first
  AI-specialised cohort, for youth and newcomers in Atlantic Canada who arrived
  having used only ChatGPT in a browser. In 12 weeks they had to ship a
  multi-user AI product.
- **What I did**: I wrote the curriculum around one rule, published on the
  site as a table: the AI drives every operation that has a CLI, an MCP server
  or a skill (provisioning a database, deploying, committing, generating a
  PDF), the student verifies, and the student only acts by hand at OAuth
  consent screens, provider API keys and DNS. The lessons use four
  components that make that rule visible: *Say to Cursor*, *Verify*, a manual
  step, and *If stuck, say to AI*. The eight teaching weeks grow one personal
  site, adding a full-stack feature each week (an AI clone of the student,
  Neon Postgres with sign-in, file uploads, a blog, Slack notifications, a
  Typst CV). Weekly assignments, half the grade, are the live URL plus a
  screenshot of the AI conversation that produced the change.
- **Result**: The programme ran 25 April to 17 July 2026 and graduated 30
  students. Six capstone projects were shipped and published to the public
  showcase. Five of my LinkedIn recommendations come from the TechNest
  cohort, from learners and from TechNest's own leadership.
- **Engineer's angle**: Marking the "human moments" explicitly is the part
  that mattered. Beginners stall at the one step the AI cannot do (an OAuth
  callback URL, a secret in a provider's console), so the Week 4 class
  rehearses that step twice and the lesson says exactly where it comes.
- **Plain version**: I taught beginners to build real apps by describing what
  they want to an AI and checking its work, and showed them the few moments
  where they have to do it themselves.
- **Follow-ups**:
  - *Doesn't this produce people who can't code?* It produces people who can
    ship and verify. The Verify steps and the screenshot rule make them read
    what the AI did; the capstone made them extend a codebase that was theirs
    from Week 1.
  - *How did the curriculum change from the first cohort?* Winter 2024 was a
    tour of tools (Cursor, v0, Coze, Vercel). By 2026 it was a stated
    division of labour between student and AI, built on CLIs, MCP servers and
    skills, because the tools had become able to do the whole job.

### S3. A tutor that knows which course you are in

- **Kind**: implementation
- **Situation**: Students got stuck between classes. A general chatbot gave
  answers that did not match the tools or the steps in their lesson, and the
  first version of my tutor indexed only part of the course.
- **What I did**: I rewrote the indexing script in May 2026 to cover all the
  course versions and the blog, tag every chunk with its course, and give
  each chunk an ID that is a hash of its content, so re-indexing only embeds
  what changed and removes what disappeared. The chat widget reads the course
  from the page URL and sends it with each question. The Worker checks it
  against the course list, over-fetches matches, keeps the ones from that
  course and the blog, and falls back to all courses when fewer than three
  survive, so an off-topic question still gets an answer. The model is told
  to answer from the lessons and append the titles it used.
- **Result**: A student on the 2024 course gets 2024 answers; a TechNest
  student gets TechNest answers by default. Along the way I fixed a chunking
  bug that turned small files into long runs of near-duplicate chunks, and
  put a token on the indexing endpoint, which had been open to anyone.
- **Engineer's angle**: Filtering happens after the vector query, not in it:
  the Worker asks for three times the results (capped at Vectorize's limit of
  50 when metadata is returned) and filters by course in code. That keeps one
  index and one query, at the cost of over-fetching.
- **Plain version**: The site's AI helper answers from the exact course the
  student is taking and shows which lesson the answer came from.
- **Follow-ups**:
  - *Why not one index per course?* One index keeps the fallback cheap:
    when a course is thin on a topic, the other courses' answers are already
    in the result set.
  - *How do you know retrieval works?* Two scripts in the repo hit production:
    one asks six questions and checks for reference lines, the other asks the
    same question from different courses and checks that the citations
    differ.
  - *How do Chinese-speaking students use it?* The model replies in the
    language of the question; the index is built from the English lessons
    with an English embedding model. That is a known limit (see In hindsight).

### S4. The tutor went down mid-cohort, and what I hardened when I brought it back

- **Kind**: incident
- **Situation**: At the end of May 2026 Cloudflare retired the Llama model
  build my tutor called, and the chat endpoint started returning errors while
  the TechNest cohort was in session. The endpoint also had no rate limit at
  all, accepted requests from any origin, and was reachable on a
  `workers.dev` address where Cloudflare's firewall rules never apply.
- **What I did**: I moved to the fp8 build of the same 8B model, and in the
  same change put the Worker on its own domain, retired the `workers.dev`
  address so every request passes the zone's rate-limiting rule, added a
  per-IP limit inside the Worker that is charged before the model is called
  (a request that times out has still cost inference), and replaced the
  wildcard CORS setting with an allow-list that matches preview deployments
  by suffix.
- **Result**: The tutor was restored on 10 July 2026, with two independent
  rate limits in front of it. The repo's operating notes now say to suspect a
  model deprecation first when chat returns a 5xx error.
- **Engineer's angle**: Order of operations. The counter is charged before
  the model call, and the domain move had to come before the firewall rule,
  because a rule on the zone protects nothing while the free subdomain is
  still open.
- **Plain version**: When the AI model my tutor used was switched off, I
  replaced it and used the moment to put proper limits in front of it.
- **Follow-ups**:
  - *Why did it take until July?* Honestly, I had no alert on the chat
    endpoint, so I found it later than I should have. There is still no
    automated check; the smoke test runs by hand after a deploy.
  - *Why is CORS not enough?* CORS is a browser rule; `curl` ignores it. The
    rate limits are what stop abuse.

### S5. A background tab was spending the day's database writes

- **Kind**: difficulty
- **Situation**: During capstone voting in late July 2026, Cloudflare warned
  me twice that the Worker was near its daily limit on KV writes.
  Almost none of those writes were votes: a single browser tab,
  left open in the background, was polling the showcase, and every poll that missed the cache
  wrote the project list from Notion back into KV.
- **What I did**: I moved every cache and every rate counter out of KV into
  the Cache API, which has no per-operation quota, keyed on synthetic
  same-origin URLs; cached the whole showcase response for 20 seconds; charged
  the vote rate limit only when a vote actually changes something, so a
  replayed request cannot drain the quota; and made the page poll only while
  it is visible, every 60 seconds instead of 30, and stop after ten minutes
  idle.
- **Result**: Repeated showcase requests now cost no KV operations, while a
  real vote still writes and refreshes the cached result. KV holds only what
  must persist: chat sessions, vote counts and voter de-duplication.
- **Engineer's angle**: The Cache API is per data centre, so the counters are
  per colo rather than global. That is the usual trade-off for edge rate
  limiting: one abuser's traffic lands in one colo, and the cap holds there.
  The counter write is awaited, not deferred, because a counter still in
  flight when the next request reads it throttles nothing.
- **Plain version**: A page refreshing itself in the background was using up
  the site's daily storage allowance, so I moved the temporary data somewhere
  that has no allowance.
- **Follow-ups**:
  - *Why was the cache in KV in the first place?* It was the obvious store
    when the feature was small. The quota only showed up under a real cohort.
  - *What if the quota were higher?* I would make the same change. A bigger
    quota would hide the waste, not remove it.

### S6. Freezing the results, and taking out claims I could not prove

- **Kind**: delivery
- **Situation**: When capstone voting closed on 6 August 2026, students
  wanted something to put on LinkedIn. The showcase ranked projects by live
  vote count, so any certificate built on it could quietly change after it
  was issued. Separately, the capstone brief still carried example copy
  drafted before the first capstone cohort, including outcome claims no
  reader could check.
- **What I did**: I froze the results into one JSON file read by both the
  site and the Node script that renders certificates, so a certificate can
  never disagree with its verification page. Each award has a permanent
  public verification page and an "Add to profile" link. An image model draws
  only the decorative border; every name, ID and QR code is real page content
  laid over it, because no image model should be trusted to spell a
  student's name. In September, with the cohort finished, I replaced the
  example copy in both languages and pointed the brief at what students can
  actually link: their live app, the showcase and their certificate.
- **Result**: Six projects hold frozen ranks; likes on the showcase stay open
  but no longer change any award. The repo's rules forbid editing a rank or
  certificate ID after issue.
- **Engineer's angle**: Plain JSON rather than a JS module, because a `.mjs`
  script cannot import an ES module from this CommonJS package, and one
  source of truth matters more than convenience here.
- **Plain version**: Once voting ended I locked the results so students'
  certificates can never change, and I replaced example text in the brief
  with links students can show.
- **Follow-ups**:
  - *Why not compute rank on the fly?* A "First Place" page that could demote
    itself weeks later is worse than no certificate.
  - *Why were those claims there at all?* The brief was drafted ahead of the
    first capstone with example copy, and I had not gone back to it. Once the
    cohort finished I checked every outcome claim against something a reader
    could verify.

## Numbers I can say

| Figure | Source |
|---|---|
| Five course versions online side by side, three of them 2026 programmes | `projects[ai-programming-teaching-project]`; `meta.x_brand.teachingImpact.cohortCount` |
| 100+ direct learners across 5 cohorts since 2024 | `90-meta.yaml` `teachingImpact.learnerReachClaim` |
| TechNest AI track: 12 weeks (8 teaching + 4 capstone), 25 April – 17 July 2026 | `work[technest]` |
| 30 students graduated | `work[technest]` |
| 6 capstone projects shipped to the public showcase, 138 public votes, the top project (LinguaPath) 66, as of 2026-08-04 (point-in-time) | `work[technest]` |
| Weekly assignments are 50% of the grade (live URL + AI-conversation screenshot) | `work[technest]`; the published curriculum outline |
| Forward with Her: two cohorts, four one-to-one mentees plus a group of 20 each time | `work[forward-with-her]` |
| 27 LinkedIn recommendations; 7 from Forward with Her mentees, 5 from the TechNest cohort | `basics` metrics; `work[forward-with-her]`; `work[technest]` |
| Peyvand Academy workshop: 24 attendees, ages 12–18 | `events[peyvand-academy-makey-makey-2026]` |
| Tutor restored on 2026-07-10 after the model deprecation; it had been down since 2026-05-30 | `projects[ai-programming-teaching-project].narrative.outcomes`; the public repository's commit of 2026-07-10 |
| The tutor's index: about 1,200 chunks across the five courses and the blog (measured 2026-10-15) | `projects[ai-programming-teaching-project].narrative.technicalApproach` |
| Her Waka: 12 self-paced tutorials in five difficulty tiers | `90-meta.yaml` `teachingCohorts` (her-waka-2026) |
| Outstanding Mentor Award, two years running (hackathon mentoring, not this platform) | `30-recognition.yaml`; `teachingImpact.flagshipAwardClaim` |

## In hindsight

- **Monitor the tutor.** It was down for weeks of a live cohort before I
  caught it. A scheduled smoke test against the chat endpoint would have found
  it on day one.
- **Index Chinese too.** The site is bilingual but the tutor's index is built
  from the English lessons with an English embedding model. A multilingual
  embedding model, or indexing the Chinese pages as well, would serve the
  students who read in Chinese.
- **Keep the tutor's course list in one place.** The model's system prompt
  names the courses by hand and does not list the Peyvand Academy workshop,
  while the rest of the system reads `versions.json`.
- **Write outcome claims after the outcome.** I would not put example
  outcome copy in a brief ahead of the evidence again.
- **Put the Worker under CI.** The site deploys on push; the Worker deploys
  by hand, and there is no test suite. That was fine for one instructor and
  would not be for a team.

## Evidence

- **Suliat Alaga** (`suliat-alaga`), TechNest co-founder and mentor: "Her
  teaching is structured, engaging, and practical [...] The feedback from our
  mentees was overwhelmingly positive" — and recommends her as "an
  outstanding AI educator, mentor, or technical trainer" (Aug 2026).
- **Abiodun (Magret) Oyedele** (`abiodun-magret-oyedele`), TechNest
  leadership, who also took the course: "very intentional in how she teaches
  [...] guide us on how to improve our projects beyond simply completing the
  course" (Aug 2026).
- **Kwame Essuman** (`kwame-essuman`), TechNest learner: "she consistently
  made time for everyone to ensure no one was left behind" (Aug 2026).
- **Mahdieh Najmi** (`mahdieh-najmi`), TechNest mentee: "I learned [...] the
  practical way of building application with cursor, deploy it on Vercel,
  connect it to DB using Neon" (Jun 2026).
- **Swayam Dhir** (`swayam-dhir`): "I came away with skills I'm already
  putting to use" (Jun 2026).
- **Jixuan (Jessie) Wan** (`jixuan-jessie-wan`): "with Chan's step-by-step
  guidance, I not only overcame these challenges but also successfully
  created a website" (Dec 2024).
- **Di Peng** (`di-peng`), Forward with Her: "I created my first personal
  website using the Cursor editor" (Nov 2024, the first cohort).
- Also from Forward with Her: **Siyu Xing** (`siyu-xing`), **Shiyu Fang**
  (`shiyu-fang`), and mentees Amy Li, Mi Su, Shushu Qin and Yijia (Robin) Lee,
  whose recommendations speak to mentoring generally.
- **Outstanding Mentor Award**, AI Hackathon Festival 2025 and Aotearoa AI
  Hackathon Festival 2026 (`30-recognition.yaml`): hackathon mentoring, cited
  only as corroboration of teaching ability.
- Public pages: the course at programming.chanmeng.org, the capstone
  showcase at programming.chanmeng.org/capstone-showcase/, the product film on
  chanmeng.org/teaching.
- Private items: none. The private layer's 11 items are the public items above;
  no private sources (chat, DM, email) were found for this project.

## Open questions

None open. Settled on 2026-10-15: S4 tells the outage (2026-05-30 to
2026-07-10); the shards now give about 1,200 indexed chunks, five course
versions everywhere, 27 recommendations, the capstone at 40% with the demo
included, the move to Cloudflare Pages in February 2026, 12 Her Waka
tutorials, a Peyvand Academy partner id and a `startDate` of 2024-11; the
README footer now names Apache-2.0; the solo-commit share is out of the
project summary and the TechNest headline; the Typst handout project is
recorded in `lineage.yaml` as a non-repository asset (not public). S6 was
softened.
