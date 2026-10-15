---
id: tam-ai-ti
title: Tam-AI-Ti
role: Sole developer (full-stack, AI, deployment and maintenance)
period: "2025-10 – 2026-03"
status: production
kind: commissioned
repos:
  - private
live: https://tamaiti.whiri-ai.com/
stack: [Next.js 15, React 19, TypeScript, Drizzle ORM, Neon Postgres, pgvector, NextAuth v5, CopilotKit, OpenAI (gpt-4o-mini, gpt-4o, text-embedding-3-small, Realtime API), "@openai/agents", Vercel, Vercel Blob, Redis, Resend, Tailwind CSS v4]
stories: 7
publicEvidence: []
privateEvidence: 15
diagrams: true
lastResearched: "2026-10-15"
sources:
  - data/profile/20-projects-flagship.yaml (tam-ai-ti)
  - data/profile/60-network.yaml (whiri-ai, missy-te-kanawa, mahsa-mccauley)
  - data/profile/46-films.yaml (tam-ai-ti-film)
  - docs/ecosystem/lineage.yaml (tam-ai-ti family)
  - the client's private repository: README, developer guide, feature and implementation docs, migration playbook, schema and migrations, AI hooks and API routes, commit history
  - correspondence with the commissioner, email and WhatsApp, Sep 2025 – Jun 2026 (private layer)
---

# Tam-AI-Ti

## In one breath

Tam-AI-Ti is a financial-wellbeing coach for Māori adults, in te reo Māori and
English, built on the Māori health model Te Whare Tapa Whā so that money is
talked about alongside family, spirit, body and mind. Riria (Missy) Te Kanawa
commissioned it, and I built the whole thing alone: the app, the AI coach that
users can talk to by voice, the database and the hosting. A research cohort of
19 people used it for four months and wrote 181 journal entries in both
languages.

## The problem

Mainstream money apps treat money as numbers: budgets, balances, projections.
For many Māori users that framing does not fit, because money is tied to
whānau, to spiritual purpose and to health. A generic budgeting tool with Māori
words painted on top would test nothing. The commission asked a sharper
question: will Māori users engage with an AI coach whose cultural framework is
part of how the product works, not decoration on it?

That made three things hard at once. The cultural model had to shape the data,
not only the labels. The AI had to be useful without being everywhere, and had
to sound like a respectful guide rather than a chatbot. And the person
directing the product is an executive, not an engineer, so every decision had
to be shown, not explained in jargon.

## What I built

A Next.js app on Vercel over one Neon Postgres database that also holds the
vectors. Users take a 26-question assessment across nine psychological
factors, set goals through seven action plans (A to G), check in daily on
wellbeing measures grouped by the walls of Te Whare Tapa Whā, write morning and
evening journals, and talk to a voice coach. Whānau can be invited to support
them, seeing only what the user allows.

- **Culture in the schema.** 48 tables. Each daily check-in measure is a typed
  column named for its wall (wairua, tinana, hinengaro, whānau) on a bounded
  scale; each action plan has its own tracking fields; 74 whakataukī across
  37+ categories are a searchable library; the maramataka (Māori lunar
  calendar) has its own tables.
- **Three AI paths, one model each.** CopilotKit tool calls on gpt-4o-mini at
  temperature 0.3; journal enhancement, translation and insight extraction on
  gpt-4o; a voice coach on OpenAI's Realtime API.
- **Memory.** Journal entries, goal progress notes, goals and coach messages
  are embedded (1536 dimensions) when saved, so the coach can find what the
  user wrote before.
- **Te reo Māori first.** The interface opens in te reo Māori, with an
  English toggle on every page.
- **Hosting handed over.** Production moved in March 2026 from my accounts to
  the client's, with no downtime and no one signed out.

## Stories

### S1. The culture went into the column names

- **Kind**: decision
- **Situation**: The brief was a tool built on Te Whare Tapa Whā. The easy
  version keeps a culturally neutral schema (minutes of exercise, minutes of
  calm) and puts Māori labels on the screen. Then the model is only a skin:
  the data cannot be analysed by wall, and the AI never sees the framework.
- **What I did**: I made each check-in measure a column that belongs to one
  wall: sleep, water, food and exercise under tinana; time in karakia or
  ceremony, connection with people and connection with the environment under
  wairua; mauri tau (calm, mindfulness) and ako (learning) under hinengaro;
  check-ins and quality time under whānau. When the first version mixed free
  numbers and minutes, I restructured it in a migration to consistent integer
  scales, with the meaning of each step written beside the column. I gave the
  seven action plans their own typed tracking fields instead of a generic JSON
  note, and later added period tracking so Budget Review (F) and
  Accountability Partner (G) recur instead of ending once. I also made te reo
  Māori the default language of the interface.
- **Result**: 48 tables, 494 columns, 22 schema migrations shipped alongside
  the feature work. The cohort logged 74 daily check-ins, each one readable
  wall by wall straight from its columns.
- **Engineer's angle**: The trade-off is schema churn. Bounded integer scales
  instead of raw minutes lose precision but make the answers comparable across
  people and quick to give on a phone; the history page needed a scale-to-range
  mapping so charts still read in real units.
- **Plain version**: I built the Māori health model into how the data is
  stored, so it is part of the product and not just its look.
- **Follow-ups**:
  - *Why not a JSON column for flexibility?* Seven plans with different
    tracking (a debt payment is not a savings rate) needed validation and
    queries per type; typed fields gave both.
  - *How did you check the cultural content?* The commissioner directed the
    framework and its content; I implemented it, kept the terms exact (macrons
    included) and revised the te reo Māori wording of all 26 assessment
    questions as the content was refined.
  - *What would you change?* Settle the scales before the first users, not
    after; one restructure meant migrating live rows.

### S2. I took the AI off five of the eight pages

- **Kind**: decision
- **Situation**: The assistant first ran on eight routes, with dozens of
  CopilotKit actions, including the goal wizard and goal detail pages. On the
  dashboard, replies began to time out: the conversation grew, and every
  request carried the whole page state and long instructions.
- **What I did**: I made the assistant opt-in per route, with "off" as the
  default for any route not listed. I kept it where it helps: the dashboard
  (update today's wellbeing by typing), the journal (fill an entry from what
  the user says) and journal history (search and analyse). I removed it from
  goals, the maramataka, resources, sign-in, onboarding, whānau invitations
  and the manual journal: for focus on goal-setting, speed on the cultural
  pages, and because sign-in and invitations should not have an agent on them.
  On the pages that kept it, I shrank what the model receives: one small
  summary instead of the full dashboard, short tool results, one-line
  instructions, and no automatic suggestion calls.
- **Result**: CopilotKit went from eight routes to three, and the dashboard's
  requests became small enough to stop the timeouts.
- **Engineer's angle**: Context is a budget. The failure looked like a network
  error (aborted streams), but the cause was input size growing with each
  turn. Removing tool surface also lowers the chance the model picks the wrong
  tool.
- **Plain version**: I made the AI helper smaller and put it only where it
  actually helps, and it became faster and more reliable.
- **Follow-ups**:
  - *Was removing features hard to justify?* The core goal features stayed;
    only the AI layer on top went. Goal-setting is a guided form, and a chat
    beside it competed with it.
  - *How did you find the cause?* By watching the message count and request
    size climb before each abort, then cutting the readable context first and
    the instructions second.
  - *Would you do it differently?* Start from one page with the agent and add
    pages on evidence, instead of starting broad.

### S3. Retrieval that finds the journal, not the echo

- **Kind**: difficulty
- **Situation**: The first coach answered from fixed content and remembered
  nothing a user had written. After the proof of concept, in October 2025, the
  commissioner asked for coaching that learns from each person's reflections
  and progress, because the research depends on it. I added retrieval over
  embeddings in Postgres. In testing it often found nothing, or found the
  wrong thing.
- **What I did**: I traced three causes. A question about the journal as a
  whole ("show me my recent entries") is about the container, not the content,
  so it scores low against any entry; I detect those questions and relax the
  match for them, while specific questions ("times I felt stressed") keep a
  stricter one. My first threshold was too strict for short entries, so I
  lowered it. And the user's own earlier question to the coach ("did I mention
  …?") matched more closely than the journal entry it was about, so I changed
  the default to search journals and goal notes and to include past
  conversations only when asked. Words like "today" and "this week" become a
  date filter. Embeddings are written when an entry is saved; if that call
  fails the entry still saves and a backfill script fills the vector later.
- **Result**: Four tables carry 1536-dimension embeddings with cosine indexes,
  and the coach answers "what did I write about …" from the user's own
  entries.
- **Engineer's angle**: A memory store that contains the conversation about
  the memory will retrieve itself. Separating source records from chat
  history, and choosing the threshold by query type, mattered more than the
  embedding model.
- **Plain version**: I taught the coach to look in the user's diary first and
  not get distracted by its own earlier chat.
- **Follow-ups**:
  - *Why pgvector and not a vector database?* The data was already in
    Postgres, scoped per user, and small; one database meant one backup and
    joins with the rows themselves.
  - *How did you tune it?* With test queries in more than one language and the
    similarity score of each candidate printed, then fixing the patterns that
    failed.
  - *What is missing?* An automated set of test queries with expected
    results, so a change to thresholds is measured rather than eyeballed.

### S4. A voice coach without the server touching audio

- **Kind**: implementation
- **Situation**: The commissioner had asked for a financial coach; voice was
  not in the brief. In November 2025, reading the cohort's feedback, I saw
  testers asking to speak rather than type, so I proposed a coach they could
  talk to and built it. Voice means low latency, and audio is personal;
  relaying it through the server adds delay and puts the API key at risk if
  done in the browser.
- **What I did**: The server mints a short-lived key from OpenAI for each
  session; the browser connects to the Realtime API over WebRTC with that key,
  so the long-lived key never leaves the server and audio never passes through
  it. I set server-side voice activity detection with 500 ms of silence to end
  a turn, so users can interrupt. The coach's instructions carry the cultural
  framing and its limits: education, not investment, tax or legal advice, and
  humility about cultural authority. Each session is a database row created by
  an authenticated server action; transcripts arrive in pieces, so each
  message is saved once, keyed on its position, role and text, and audio is
  never stored.
- **Result**: 35 voice coaching sessions in the cohort, with text transcripts
  kept and no audio stored.
- **Engineer's angle**: Ephemeral keys plus WebRTC is the pattern that keeps
  latency low and secrets server-side. The hard part was the transcript
  stream: history updates repeat and grow, so saving naively writes duplicates.
- **Plain version**: People can talk to the coach out loud, and only the words
  are kept, never the recording.
- **Follow-ups**:
  - *Whose idea was voice?* Mine. The brief was a financial coach; the
    testers' feedback asked for speech input, and I proposed and built it.
  - *Why not store audio?* Text is searchable and far smaller; a voice
    recording of someone's money worries is more sensitive than it is useful.
  - *How do you stop it giving financial advice?* The instructions forbid
    specific investment, tax and legal advice and tell it to point to
    professionals; it is positioned as education.
  - *Why the Agents SDK in the browser?* Its realtime session handles WebRTC,
    turn detection and history events, which left me only the persistence and
    the UI.

### S5. Handing production to the client without signing anyone out

- **Kind**: delivery
- **Situation**: The app ran on my personal Vercel account. The maintenance
  period in our agreement ended in February 2026, and I asked the commissioner
  to choose between closing the app down and keeping it running. She chose to
  keep it. In March 2026 it needed to belong to the client: the repository in
  their GitHub organisation, hosting on their team, their domain, their email
  sender, with registered users still signing in.
- **What I did**: I chose a manual move over Vercel's project transfer,
  because storage, its credentials, the domain, OAuth and email all have to be
  redone either way. The database stayed where it was and was re-pointed. I
  kept the session secret identical, so existing sign-ins stayed valid. I
  recreated blob storage and Redis, copied the avatars with a script that can
  be re-run safely, added the new callback URLs to Google sign-in, moved the
  domain (first the apex, then the subdomain the commissioner chose),
  re-verified the email sender, emailed every registered user the new address,
  and kept the old address running for a week after the cutover.
- **Result**: A zero-downtime cutover, written up as a 12-step playbook I can
  reuse for the next client handover.
- **Engineer's angle**: The one variable that decides whether users notice is
  the session secret; the one step that destroys data is deleting the old
  project before the blob copy. The playbook orders steps around both.
- **Plain version**: I moved the live app into the client's own accounts
  without anyone being logged out or losing their photos.
- **Follow-ups**:
  - *What went wrong?* No downtime. The avatar copy needed to be made
    re-runnable during the move, which is why the script overwrites safely.
  - *Why not the platform's transfer feature?* It moves the project but not
    its storage or their credentials; the hard steps remain.
  - *Who owns it now?* The client: the repository, the hosting and the
    domain. The handover is complete; since June 2026 I no longer deploy it.

### S6. In-app browsers broke sign-in and the AI

- **Kind**: incident
- **Situation**: People open links from messaging apps, which load pages in an
  embedded browser. There, Google refuses sign-in, and the CopilotKit bundle
  crashed the page because the embedded browser did not support a modern
  regular-expression feature.
- **What I did**: I added detection for embedded browsers (Messenger,
  Instagram, WeChat and others). On sign-in, registration and whānau
  invitation pages the Google button is disabled there and a bilingual
  message explains how to open the page in the real browser, with a copy-link
  button. The AI provider checks for embedded browsers and for the regex
  feature, and does not mount the assistant where it would crash; the error
  boundary recognises that failure if it slips through.
- **Result**: The rest of the app works inside embedded browsers, and users
  are told in te reo Māori or English how to continue.
- **Engineer's angle**: Feature-detect, not only user-agent sniff: the regex
  check catches browsers no list knows about. Disabling one feature is better
  than a white screen.
- **Plain version**: When people opened the app from a chat link it broke, so
  I made it explain what to do and keep working.
- **Follow-ups**:
  - *How did you find it?* The errors were Google's "disallowed user agent"
    and an "invalid regular expression" crash, both only in embedded browsers.
  - *Why not polyfill?* The syntax error happens when the bundle is parsed,
    before any polyfill can run; the fix has to be not loading it.

### S7. Building for a client who directs the product, not the code

- **Kind**: collaboration
- **Situation**: Riria (Missy) Te Kanawa directed the product: the framework,
  the features ("include the maramataka", "add a financial coach"), the
  surveys. She is an executive, not an engineer. Dr Mahsa McCauley, founder of
  She Sharp, had referred me.
- **What I did**: Before quoting, I turned our first meeting into a
  requirements checklist of open questions, then a development plan with
  acceptance criteria for each feature. I sent a feature demo video at every
  milestone, so she could review progress without a technical background. When
  the proof of concept was ready at the end of September 2025, she had 13
  people test it; I worked through every row of her testing summary and
  feedback deck, marking each change or the reason it waited, before the
  cohort started in November. I ran the data analysis on the cohort's use.
  After launch I made teaching videos and ran a live walk-through of the
  database so she could use Cursor to read it and do basic analysis herself.
- **Result**: The product was built, deployed and used by a 19-person cohort
  for four months. After that I handed it over in full, and the client runs it
  herself.
- **Engineer's angle**: Demo video as the review format: it is asynchronous,
  shows the real product, and leaves a record of what was agreed.
- **Plain version**: I showed my client each step on video, and later taught
  her to look at her own data.
- **Follow-ups**:
  - *How did you handle changing requirements?* In migrations: the schema
    changed with each request and was never rolled back.
  - *What did the client get beyond the app?* A way to read her own data and a
    written handover playbook.

## Numbers I can say

| Figure | Source |
|---|---|
| 19-person research cohort, Oct 2025 – Mar 2026 (about four months); no test or staff accounts among the 19 | `20-projects-flagship.yaml` tam-ai-ti metrics, publicSummary |
| 181 bilingual journal entries (te reo Māori and English) | same |
| 35 voice coaching sessions; transcripts only, no audio stored | same |
| 146 AI coach messages; 74 daily Hauora check-ins; 18 active financial goals | same |
| 48 tables, 494 columns, 22 schema migrations | same, techStack and metrics |
| Embeddings on 4 tables, 1536 dimensions (text-embedding-3-small) | same, techStack |
| CopilotKit cut from 8 AI-enabled routes to 3; 45 actions in the shipped code (counted 2026-10-15) | same, techStack and metrics |
| Tool calls on gpt-4o-mini at temperature 0.3 | same, technicalApproach |
| Voice turn ends after 500 ms of silence (server-side VAD) | same, techStack |
| 26-question assessment over 9 factors; 7 action plans (A to G); 5 whānau permission settings | same, metrics |
| 74 whakataukī across 37+ categories | same, metrics |
| Zero-downtime handover to the client's hosting, March 2026; every registered user emailed the new address; 12-step playbook | same, outcomes and metrics |
| Sessions last 30 days, stored in the database (not JWT) | same, techStack |

## In hindsight

- I would write automated tests from the start. The repository has written
  testing guides but no test suite; retrieval thresholds and the goal
  calculations were checked by hand, and several fixes (progress counts,
  income and debt calculations, time-zone day boundaries) are the kind a test
  would have caught.
- I would start the AI narrow and grow it on evidence, rather than putting it
  on eight pages and cutting back to three.
- I would fix the wellbeing scales with the commissioner before the first
  user, so no live data had to be reshaped.
- I would keep the documentation's figures generated from the code. Some
  counts in the docs drifted from the tree after the AI cut-back.

## Evidence

No LinkedIn recommendation, award or publication in the database is tied to
this project yet. Public proof is the product itself
([tamaiti.whiri-ai.com](https://tamaiti.whiri-ai.com/)), the product film on
chanmeng.org/films and YouTube (`46-films.yaml` › `tam-ai-ti-film`), and the
commissioner named on the README's "For" line (`60-network.yaml` ›
`missy-te-kanawa`). Private items: 15, from email and WhatsApp with the
commissioner (her report on the pre-launch user test, her remarks on the data
analysis, testers' comments from her testing summary, and her decisions to
keep the app running and take it over); none quoted. Three earlier items (the
referral, the handover, the cohort's use) are already public facts in the
shards.

## Open questions

Settled on 2026-10-15: the voice coach was Chan's own initiative, added in
November 2025 after testers asked for speech input; the financial coach itself
was the commissioner's request. S4 and the shard's `myRole` now say so.

- **A line from the commissioner.** Her written remarks exist privately
  (counted above). A LinkedIn recommendation was requested in March 2026 and
  none is recorded. Ask her before quoting her or naming her as a referee.
