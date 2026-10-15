---
id: femtech-weekend-website
title: FemTech Weekend website
role: Chief Technology Officer and sole engineer
period: "2025-05 – present"
status: production
kind: client
repos:
  - private
live: https://www.femtechweekend.com/
stack: [Docusaurus 3.9, React 18, TypeScript, Tailwind CSS, Cloudflare Pages, Cloudflare Pages Functions, Neon Postgres, Drizzle (schema and migrations), Resend, Cloudinary, Notion API, Gemini API, Wrangler]
stories: 7
publicEvidence: []
privateEvidence: 2
diagrams: true
lastResearched: "2026-10-15"
sources:
  - data/profile/22-projects-oss-webapps.yaml (femtech-weekend-website)
  - data/profile/10-career.yaml (work femtech-weekend)
  - data/profile/23-projects-oss-more.yaml (femtech-weekend, femtech-radar)
  - data/profile/30-recognition.yaml, 50-references.yaml, 60-network.yaml
  - docs/ecosystem/lineage.yaml (femtech-weekend-site)
  - linkedin/posts/2025.yaml, linkedin/posts/2026.yaml
  - the client's private repository (code, commit history, developer docs), read 2026-10-15
---

## In one breath

FemTech Weekend describes itself as China's first organisation built around
women's health technology. I am its CTO, and I built and run its website on my
own from Auckland: a bilingual English and Simplified Chinese site with research
reports, founder stories and opinion pieces, plus everything its Shanghai Summit
2026 needed online: the event pages, application forms for founders and
companies, a newsletter, and an admin page where the founder approves applicants
in batches. The summit ran June 22–25, 2026, with 20 speakers headlined by Ida
Tin, the Clue co-founder who coined the term "FemTech", and hundreds of
attendees.

## The problem

FemTech Weekend is a small team led by its founder, Zhu Yihan, connecting
women's-health founders, investors and researchers in China with the rest of
the world. Its readers sit on both sides of that border, so every page has to
exist in two languages and load well in both places. Its value is in what it
publishes (market research, founder stories, commentary), not in a brochure.

Then the summit arrived. A four-day event needed speaker and partner pages, an
agenda, and a way for founders to apply to pitch and for international
companies to apply to the programme, with uploaded decks, confirmation emails
and a review process. The founder had to be able to run all of that, and keep
the site's content current, without waiting for me: I work remotely, in a
different time zone, and there is no other engineer.

Tickets went through an external ticketing platform. What that could not
carry was the organisation's own application questions, its bilingual
editorial site, and a review flow that sends the founder's own branded
decisions.

## What I built

One Cloudflare Pages project. The site is a static Docusaurus build with three
content collections (research, stories, opinions) in English and Simplified
Chinese. Every server-side concern is a Cloudflare Pages Function deployed with
it, so there is no backend server to run. Summit applications land in Neon
Postgres; files go to Cloudinary; every email goes through Resend.

- **Editorial site**: research reports, founder stories and opinion pieces as
  MDX, bilingual on every page.
- **Shanghai Summit 2026**: the summit page (hero, a 3D globe of 40 countries,
  partners, speakers, programme, audience, venue, global network, sponsors),
  programme and pitch pages, and a gated agenda download.
- **Application system**: multi-step forms with draft auto-save, field
  validation, PDF and headshot uploads, duplicate detection and reference
  numbers, each writing to its own Postgres table.
- **Founder's admin page**: filter, search, annotate and approve or reject
  applicants in batches; each decision sends a branded email.
- **Newsletter**: subscription into a Resend audience segment with a branded
  welcome email.
- **Assistant**: a Gemini-backed chat endpoint for questions about the
  organisation.

## Stories

### S1. Picking an editorial engine, bilingual from the first day

- **Kind**: decision
- **Situation**: The organisation already had a first-generation site I had
  built in Next.js with Notion behind it. The site's real job was publishing
  (research reports, interviews, commentary), for readers split between English
  and Chinese.
- **What I did**: The founder valued two things above the rest: how an article
  reads, and how easily a reader can find one. So I started a second generation
  on Docusaurus rather than growing the Next.js one. I added the Simplified Chinese locale on the first
  day, so every page, component string and blog collection was built with two
  languages from the start rather than translated later. Later I split the
  content into three blog collections (research, stories, opinions), each with
  its own layout, and moved all component text onto the translation layer so
  the two languages carry the same set of keys.
- **Result**: A content site the organisation can grow by adding MDX files,
  with Chinese and English kept in step. It later carried the summit as well,
  as React pages inside the same build.
- **Engineer's angle**: Docusaurus is not the usual pick for a brand site. It
  gives MDX, blog collections, i18n routing, sitemaps and search integration
  out of the box, and it builds to static files, which suits edge hosting. The
  cost is that anything app-like (forms, admin) has to live outside its model,
  which is why the server side became Pages Functions.
- **Plain version**: I chose a publishing tool built for articles in two
  languages, because publishing is what this organisation does.
- **Follow-ups**:
  - *Why not stay on Next.js?* The client cared most about article
    presentation and search. Docusaurus gave both without building them (MDX
    layouts, blog collections, DocSearch); the app parts fit beside it as
    functions.
  - *How do you stop the two languages drifting?* Every string goes through the
    translation layer, and I ran a pass that removed dead keys and filled the
    missing ones until both languages had the same keys.

### S2. Moving the server side to Cloudflare and ending with one copy of it

- **Kind**: decision
- **Situation**: The site first ran on Vercel, with its API as Node handlers
  using the official SDKs for Notion, Resend and Cloudinary, plus an Express
  server for local development. In January 2026 I moved hosting to Cloudflare
  Pages so the static site and its functions would deploy together at the edge.
  The SDKs failed in the Workers runtime.
- **What I did**: I rewrote each function in the Workers style and replaced
  every SDK call with plain `fetch` against the service's REST API. Because the
  move went endpoint by endpoint, for about a month the same behaviour existed
  in three places: the Vercel forwarders, the Express copy and the Cloudflare
  functions. In February I deleted the first two, ported the last two endpoints
  that existed only there, and made local development run `wrangler pages dev`
  so it uses the same runtime as production.
- **Result**: One implementation of every endpoint, one deploy, and local
  development that behaves like production. Every function since, including
  the whole summit system, was written once.
- **Engineer's angle**: The Workers runtime is not Node. SDKs that rely on Node
  internals break, so REST over `fetch` is the portable choice, at the cost of
  writing your own request and error handling. The bigger lesson was the three
  copies: a migration that runs in parallel needs an end date, or fixes land in
  one copy and not the others.
- **Plain version**: I moved the site to faster hosting, then deleted the old
  versions of the code so only one remained.
- **Follow-ups**:
  - *Why Cloudflare?* The site and its functions deploy as one project at the
    edge, which suits an audience split between China and the rest of the
    world, and local development can run the same runtime.
  - *What broke in the move?* The SDKs, and the site's own URLs: the crawler
    and the canonical domain needed fixing afterwards (S7).
  - *What would you check next time?* Behaviour, not files: that each endpoint
    does the same thing after the move, not just that it exists.

### S3. A production form that could not see its database

- **Kind**: incident
- **Situation**: On the day I shipped the rebuilt pitch application,
  submissions in production failed with a server configuration error. The function said the
  database connection string was missing, although I had set it as a secret.
- **What I did**: I added a temporary diagnostic to the error response and
  found the variable existed but was empty. Deleting and re-setting the secret
  with the CLI, and redeploying, did not fix it. Setting the value through
  Cloudflare's REST API on the project's production configuration, then
  redeploying, did. I removed the diagnostic the same day and wrote the episode
  into the project's developer guide, with the other pitfalls from that week.
- **Result**: Fixed the same day. The guide records that a secret listed as present can still be empty, so
  a deploy is only verified by a real request.
- **Engineer's angle**: `secret list` proves a key exists, not that it has a
  value. Diagnostics that reveal configuration belong in a response only for
  minutes, and should show type and length, never the value.
- **Plain version**: The form could not reach its database because a setting
  had been saved blank; I found it, fixed it and wrote down how to avoid it.
- **Follow-ups**:
  - *How did you find it?* By checking the type and length of the variable at
    runtime instead of trusting the dashboard.
  - *What else went in the guide?* Saved drafts from an older form shape
    crashing the new form, a React state update overwriting another, PDF
    uploads needing Cloudinary's raw endpoint, and scroll position after
    submit.
  - *Would you do it differently?* A post-deploy smoke test that submits a test
    application would have caught it at deploy time.

### S4. Letting the founder run selection without an engineer

- **Kind**: implementation
- **Situation**: Pitch and programme applications were arriving in Postgres.
  The founder needed to review them, decide, and tell each applicant, and she
  could not wait for me to run queries in another time zone.
- **What I did**: I built an admin page and three admin endpoints protected by
  an admin key. The page lists applications with filters, search and inline
  notes; the founder ticks rows and approves or rejects them in one action. The
  endpoint fetches the selected rows, keeps only those still "submitted", sends
  one batch of branded emails (approvals from the team address with a reply-to
  and the applicant's next steps; rejections from a no-reply address), and
  only then updates their status.
- **Result**: The team ran summit selection themselves, with every decision
  reaching the applicant as a branded email.
- **Engineer's angle**: Two safety properties. Filtering to "submitted" makes a
  repeated click harmless for rows already done. Sending before updating means
  an email failure leaves every row retryable. The remaining gap is the reverse
  case (emails sent, update failed), which would need an outbox or a per-row
  sent flag.
- **Plain version**: I gave the founder a screen where she can accept or turn
  down applicants in bulk, and the right email goes out automatically.
- **Follow-ups**:
  - *How is it protected?* An admin key checked on every request; the static
    page holds nothing without it.
  - *Why batches?* Applications arrive in waves before deadlines, and one
    decision often covers many applicants.
  - *What would you add?* Per-user sign-in instead of a shared key, and an audit
    of who decided what.

### S5. Handing publishing to a non-technical founder

- **Kind**: collaboration
- **Situation**: Speakers, partners, venue details and stories changed weekly
  before the summit. If every change went through me, the site would always be
  a day behind the founder's decisions.
- **What I did**: I kept all speaker, partner and agenda data in one typed data
  module, so a change is one edit in one place, and a wrong field shows as an
  error in the editor. I wrote a step-by-step guide in
  Chinese for adding a story in one or both languages, with templates for the
  front matter and cover images. Because a push to the main branch is the
  deploy, the founder can publish herself.
- **Result**: The founder has published stories, an opinion piece, new
  speakers, venue changes, partner logos and team bios herself, without me.
- **Engineer's angle**: The cheapest CMS for a small team can be the repository
  plus good structure: typed data, one file per concern, and a guide in the
  editor's own language.
- **Plain version**: I set the site up so the founder can update it herself, in
  her own language, the same day she decides something.
- **Follow-ups**:
  - *Why not a CMS?* The content is versioned with the code, previews come from
    the same build, and there is nothing extra to host.
  - *What happens when she makes a mistake?* It shows on the live page within
    minutes of the push, and the change is one revert away in the history.

### S6. The form was for the wrong applicant

- **Kind**: requirements
- **Situation**: The first version of the summit's programme application asked
  about individuals. Working through it with the founder, it became clear the
  programme was for international companies, investors and ecosystem leaders
  entering the Chinese market.
- **What I did**: I rebuilt it as a three-step company application (basic
  information, company snapshot, China objectives and readiness) with a company
  overview upload, and replaced the table behind it four days after the
  summit pages launched. The programme and speaker tables I replaced that day
  already held real applications.
  The same pattern repeated: a day-by-day timeline implied one ticket covered
  every day, so I replaced it with a selector showing which package fits the
  days a visitor picks; the speaker application page came down on 2026-03-30
  because the line-up had enough speakers, with no new applications accepted
  and its table and API kept; the full agenda became a download behind a short form
  with a separate newsletter opt-in.
- **Result**: Each page asked for what the organisation needed to decide on, in
  both languages, and each agenda download is recorded as a lead with its own
  newsletter consent.
- **Engineer's angle**: Rebuilding a table is cheap only before it holds data,
  and these already held real applications when I dropped and recreated them.
  That was the mistake in this story: the right move was an additive migration
  that kept the old rows. After those first days the schema only grew
  additively.
  Each form kept the same lifecycle columns (status, timestamps, notes,
  reference number), so the admin page did not change when the questions did.
- **Plain version**: When we realised the form was asking the wrong people the
  wrong questions, I rebuilt it for the companies the summit was actually for.
- **Follow-ups**:
  - *Did the admin page have to change with the forms?* No. Every form keeps
    the same lifecycle columns, so the review flow stayed as it was.
  - *What did the agenda gate protect?* Nothing secret; it collects interest
    and consent. A public agenda does not need signed links.
  - *Did anyone lose an application when you replaced the tables?* The tables
    held real applications when I replaced them. I would not do it that way
    again: with rows in a table, the change has to be additive.

### S7. Making a migrated site findable and light

- **Kind**: implementation
- **Situation**: After the move to Cloudflare the site search crawler failed:
  the bare domain redirected to `www`, tag pages had doubled paths, and Chinese
  tags produced encoded URLs that returned 404. Separately, summit content had
  made the site heavy with large speaker, venue and report images.
- **What I did**: I made `www.femtechweekend.com` the canonical URL across
  config, sitemap, structured data and emails; fixed the tag permalinks; gave
  Chinese posts proper slugs. Then, in two passes weeks apart, I cut the image
  weight: in April 2026 I compressed 14 large images and shrank the social card
  from 6 MB to 240 KB; in May 2026 I re-encoded the heaviest assets.
- **Result**: The crawler errors these caused were fixed, and the May pass cut
  the site's image weight by about 67%.
- **Engineer's angle**: Every URL the site emits (canonical, sitemap, JSON-LD,
  email links) has to agree with the domain that serves it, or crawlers treat
  the redirect as a different site. Non-ASCII tags need explicit slugs.
- **Plain version**: I fixed the links so search could find the site again, and
  cut the image weight by about two thirds so it loads faster.
- **Follow-ups**:
  - *Why does the social card matter?* It is fetched every time someone shares
    a link; 6 MB is slow or rejected by some platforms.
  - *How did you choose what to compress?* Largest files first, by measuring
    what the build shipped.

## Numbers I can say

| Figure | Source |
|---|---|
| Summit June 22–25, 2026, 20 speakers headlined by Ida Tin, the Clue co-founder who coined "FemTech" | `data/profile/22-projects-oss-webapps.yaml` (femtech-weekend-website); https://www.femtechweekend.com/shanghai-summit |
| "Hundreds of attendees" (verbatim, no exact figure), PwC building at Qiantan Center, Pudong | `data/profile/10-career.yaml` (femtech-weekend) |
| 2 languages, English and Simplified Chinese, on every page | `22-projects-oss-webapps.yaml` metrics |
| 16 Cloudflare Pages Functions | `22-projects-oss-webapps.yaml` metrics |
| 4 Postgres tables, 4 migrations | `22-projects-oss-webapps.yaml` metrics |
| 4 file-upload endpoints, 3 admin endpoints | `22-projects-oss-webapps.yaml` metrics |
| 3D globe of 40 countries | `10-career.yaml` impactDelivered |
| April 2026: 14 images compressed, social card 6 MB → 240 KB. May 2026: site image weight about 67% lower | `22-projects-oss-webapps.yaml` metrics |
| 2 original research reports published through the site | `22-projects-oss-webapps.yaml`; https://www.femtechweekend.com/insights |

## In hindsight

- **No automated tests and no CI.** The build was the only check. A smoke test
  that submits each form after deploy would have caught S3 before an applicant
  did, and behaviour tests would have made the S2 consolidation safer.
- **Send, then update, without an outbox.** Fine at this scale; a per-row
  "email sent" flag would close the remaining gap in S4.
- **Schema changes by hand.** Two early migrations replaced tables outright,
  in the first days after launch, and those tables already held real
  applications. Today I would use additive migrations run from the deploy, not
  from my laptop.
- **Three copies for a month.** I would set an end date for the parallel run
  before starting a migration.
- **Two homes for form data.** Older ecosystem and report-request forms still
  write to Notion while summit forms use Postgres; one home would make
  reporting simpler.
- **Shared admin key.** Good enough for one founder; per-user sign-in would
  give an audit trail.

## Evidence

- **No written recommendation yet.** No one at FemTech Weekend appears in
  `50-references.yaml`.
- **The client's public post** (FemTech Weekend's LinkedIn page, 2025-07-12),
  opening line: "Proud to have our talent Chan Meng drive change from the
  first FemTech innovation competition". General praise, not about the website.
- **Award, as background**: "UN Women FemTech Hackathon Outstanding Performer",
  awarded by FemTech Weekend (Beijing), 2025-03 (`30-recognition.yaml`), shortly
  before the CTO role began.
- **The live site** is public: https://www.femtechweekend.com/
- Private items: 2, counted and not quoted.

## Open questions

- **A recommendation.** Chan will ask Zhu Yihan for a LinkedIn recommendation
  that names the summit application system and the admin review; it would be
  the first public endorsement of this work.
- **Newsletter sign-up.** The shard's description of the sign-up flow and the
  production code differ; the detail is in the private notes. Chan is fixing
  the site, after which the shard is right.

Settled on 2026-10-15: the shards now say that Generation 2's content is MDX
the founder edits herself, with Notion receiving two form types; that three
summit forms write to Postgres and ecosystem applications go to Notion; that
the agenda is a gated PDF since 2026-05-26; that there is no CI workflow and
broken links only warn; that Drizzle defines the schema and migrations while
the functions use tagged-template SQL, with Gemini and Cloudinary over REST;
that the site ran on Vercel from 2025-05 and on Cloudflare from 2026-01; a
single commit total (570, 538 hers); and the two image passes as separate pieces of
work. The tables replaced on 2026-03-10 held real applications (told in S6);
the speaker page came down on 2026-03-30 because the line-up had enough
speakers. Generation 2 was chosen because the client valued article
presentation and searchability (told in S1). S3 stays as told. Public speakers
already named in visitor copy, such as Ida Tin, may be named.
