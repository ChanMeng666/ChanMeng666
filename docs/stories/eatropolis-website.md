---
id: eatropolis-website
title: Eatropolis website
role: Sole freelance developer
period: "2026-05 – present"
status: production
kind: client
repos:
  - private
live: https://eatropolis.co.nz/
stack: [Next.js 16, React 19, TypeScript, Tailwind CSS 4, OpenNext for Cloudflare, Cloudflare Workers, Cloudflare KV, Cloudflare Turnstile, Cloudflare Zero Trust Access, Drizzle ORM, Neon Postgres, MDX, Zod, Resend, React Email, Vercel AI SDK, OpenAI, Playwright, axe-core, k6, GitHub Actions]
stories: 8
publicEvidence: []
privateEvidence: 13
diagrams: true
lastResearched: "2026-10-15"
sources:
  - data/profile/22-projects-oss-webapps.yaml (eatropolis-website)
  - data/profile/60-network.yaml (chow-luck-club, tataki-auckland-unlimited, armand-bentigan, bee-keng-koh)
  - data/profile/70-linkedin.yaml (Eatropolis project entry)
  - data/profile/45-showcase.yaml and 46-films.yaml (Eatropolis film)
  - linkedin/posts.yaml and linkedin/posts/2026.yaml (Eatropolis posts)
  - the client's private repository, read 2026-10-15 (README, agent guide, status and decision log, handoff, accessibility statement, load-test and Lighthouse reports, analytics diagnoses, CI workflows, git history, source)
  - private correspondence with the client, April to October 2026 (counted under privateEvidence, not quoted)
  - public pages read 2026-10-15 (eatropolis.co.nz; Tātaki Auckland Unlimited's aucklandnz.com and Auckland Live listings; Heart of the City; Chow Luck Club and Bee Keng Koh LinkedIn posts; the festival's Instagram and TikTok profiles)
---

# Eatropolis website

## In one breath

Eatropolis is Auckland's one-day culinary festival: 30+ award-winning chefs at
Shed 10 on Queens Wharf on 10 October 2026. Chow Luck Club Ltd commissioned me to
build its official website, with Tātaki Auckland Unlimited (Auckland Council's
development agency) as event partner and co-reviewer. I built it alone under a
signed contract: a teaser page went public on 22 May 2026 and the full site on
5 June 2026. It meets the NZ Government accessibility standard (WCAG 2.2 AA),
passed a 1,000-visitor load test with zero errors, has an AI event guide that
answers by text or voice, and the client edits every word of it without a
developer.

## The problem

A festival website has a hard date, a public-sector reviewer and an owner who
does not write code. The client's brief asked for the NZ Government
accessibility standard and a load test for launch-day traffic; the contract I
drafted set out what the whole job meant: a
custom-designed site released in two visibility phases (a teaser, then the full
site), WCAG 2.2 AA with Tātaki Auckland Unlimited review gates before each
launch, a load test to 1,000 concurrent visitors, strong mobile performance,
SEO plus AI-crawler discoverability, enquiry forms with branded email, an AI
assistant, privacy-compliant analytics, and three months of maintenance.

The obvious answers did not fit. A template site builder would not pass an
accessibility review with a custom brand. A licensed CMS would add a third-party
service the client would have to run after I left. A spreadsheet of copy,
which is what the client first asked for, has no validation and no history. And
the client owned the Cloudflare account, so the whole stack had to live there.

## What I built

One Next.js 16 application, deployed to Cloudflare Workers through OpenNext,
serving 11 marketing pages and 9 API routes from the client's own Cloudflare
account. Content is MDX and JSON in the repository, validated by Zod at build
time and compiled into the bundle, so the client edits it in GitHub's browser
editor and a push redeploys the site. Forms, chat and email events are stored
in Neon Postgres through Drizzle; email goes out through Resend with seven
brand-styled templates.

- **Content layer**: 40 MDX files (dishes, partners, FAQs, sponsors) and 16
  JSON files of page copy at handoff, each with a schema; one file holds every
  event fact (date, hours, venue, tickets, policies) and feeds the pages, the
  structured data, `llms.txt` and the AI guide.
- **AI event guide**: a floating chat widget that streams answers, takes voice
  input and can read replies aloud. Its knowledge is generated at build time
  from the same content the client edits, and it sits behind Turnstile, a
  per-visitor rate limit in Cloudflare KV and a short session cookie.
- **Forms and email**: general enquiry, partnership enquiry and newsletter,
  each running parse, validate, anti-spam check, store, send. Delivery,
  bounce and complaint events come back through a signed webhook. SPF, DKIM
  and DMARC are live; mail-tester scores 10/10.
- **Launch control**: before launch, Cloudflare Zero Trust Access hid the whole
  site from the public while allowlisted reviewers signed in with an email
  passcode; narrow bypass rules exposed only what had to be public (the teaser,
  legal pages, the email webhook). Launch was one switch on the morning of
  5 June.
- **Quality gates**: an axe-core accessibility suite on every push across three
  browser engines (39/39 tests passing), a k6 load profile, cookie consent in
  front of all analytics, and a GitHub Actions pipeline that migrates the
  database before it deploys (about 55–70 seconds end to end).
- **Handoff**: a content-editing guide, a content inventory with a direct edit
  link for every field, a WCAG conformance statement, a ticketing setup guide, a
  non-developer handoff guide and a running decision log.

## Stories

### S1. Making Next.js 16 run on Cloudflare's edge, where "build green" did not mean "works"

- **Kind**: difficulty
- **Situation**: The client's whole stack was in their Cloudflare account, so I
  chose OpenNext on Cloudflare Workers, the current official path, over the
  older Pages adapter. Workers are not Node. Several times in the first days the
  build passed locally and in CI and production still returned errors.
- **What I did**: I worked through each failure from Cloudflare's observability
  logs and fixed the class, not the instance. A content loader that read MDX
  files with `fs` at request time failed because the deployed bundle has no
  project directory; I moved all content parsing into a build step that
  generates typed modules, and later did the same for the social-card fonts.
  Runtime MDX compilation failed because Workers forbid `eval`; I switched to
  compiling MDX at build time with static imports. `dynamicParams = false` on
  pre-rendered detail pages made every slug 404 under OpenNext; I removed it.
  Windows builds emitted backslash paths that crashed the Worker; I moved all
  deploys to Linux in GitHub Actions and banned local deploys in the project's
  agent guide. Each fix went into the decision log with the error that caused it.
- **Result**: The site has run on Workers since the first week. Any new content
  type is an entry in one generator list, and the standing check before a push
  is a local production build plus a request against the built server.
- **Engineer's angle**: Why "no filesystem at request time" pushes you to
  codegen; the trade-off between build-time MDX (`@next/mdx` with a generated
  import map) and compiling MDX to strings; why the generated chat context had
  to be byte-stable across builds for OpenAI prompt caching to hit.
- **Plain version**: The hosting platform is fast but strict, so I changed the
  site to prepare everything in advance instead of working it out on each visit.
- **Follow-ups**:
  - *Why not Vercel?* The client owned a Cloudflare account and wanted hosting,
    DNS, anti-spam, email routing and access control in one place they control.
  - *How did you find the cause when the stack trace was empty?* Cloudflare's
    Worker logs gave the failing path or error message; I reproduced it with a
    local production build, then wrote the rule down so it would not recur.
  - *What would you test earlier next time?* Run the Workers preview locally
    before every push, not only `next build`.

### S2. Letting a non-technical client edit the site: GitHub as the CMS

- **Kind**: decision
- **Situation**: The client asked for a "centralised editable document", which
  in practice meant a spreadsheet of site copy. The contract also asked that
  the client be able to change every word after handoff.
- **What I did**: I proposed the repository itself as the CMS and turned down
  spreadsheets and licensed CMS products (Sanity, Strapi, Payload, Contentful):
  each adds a third-party runtime dependency, and a spreadsheet has no schema
  and no history. Every editable field lives in an MDX or JSON file with a Zod
  schema. I wrote a content inventory where each field has a ✏️ link that opens
  that file in GitHub's web editor, and a step-by-step guide covering the JSON
  mistakes non-developers make. Saving a file commits it, and CI rebuilds and
  redeploys the site in a few minutes.
- **Result**: The client made a dozen content edits this way on their own
  during the teaser phase, before the full launch. The first ones also tested the safety net: one browser-editor save dropped a JSON
  key, the build refused the invalid file, and the live site stayed on the last
  good version while I repaired it. My first repair passed JSON parsing but
  failed the schema for that field; the second matched the schema, and I
  recorded the gotcha in the guide. For changes beyond copy I trained the
  client's creative producer, Armand Bentigan, in a recorded session on the eve
  of launch: pull the latest code, have an AI coding agent make and check the
  change locally, then push. He has maintained the site himself since the
  handover, including the partner lineup, the sponsor carousel and a new
  home-page hero.
- **Engineer's angle**: Validation at build time means a bad edit fails the
  deploy instead of reaching visitors, at the cost of the editor not seeing why
  the change has not appeared. Content is bundled into the Worker, so there is
  no runtime read and no CMS outage to worry about.
- **Plain version**: The client changes the website by editing a document in
  the browser, and the site checks the change before publishing it.
- **Follow-ups**:
  - *Isn't JSON hostile to non-developers?* It is, which is why the inventory
    links straight to the line and the build rejects anything malformed.
    A form-based editor is the next step if edits become frequent.
  - *Why not a headless CMS?* For one event site with a three-month maintenance
    window, another service with its own account was more for the client to own
    than the problem needed.
  - *What did you learn from the broken edit?* Run the schema check before
    committing a fix too; my first repair fixed the syntax and missed the schema.

### S3. "Hide the whole site until launch, but keep review working"

- **Kind**: requirements
- **Situation**: The contract said one build, two visibility phases. I had
  planned the gate in Next.js middleware, but OpenNext could not run Next 16's
  Node-runtime middleware, so I prepared a Cloudflare redirect rule instead.
  Two days into the build the client widened the requirement: hide the entire
  site from the public until launch, while their team and the Tātaki Auckland
  Unlimited reviewers could still see the real production site. A redirect rule
  has no way to let reviewers through.
- **What I did**: I put the site behind Cloudflare Zero Trust Access:
  allowlisted reviewers sign in with an email one-time passcode and see
  production exactly as visitors will, cookies, forms and anti-spam included.
  Narrow bypass applications, which Access matches before the site-wide one,
  exposed what had to stay public: the teaser and its newsletter path, the
  legal pages, the hero video, and the email webhook. The webhook case surfaced
  when Resend's delivery events started bouncing off the login screen. Testing
  that path end to end, I found a second bug: the webhook returned success
  while no rows were saved, because Postgres rejects an `ON CONFLICT` target
  that matches only a partial unique index. I replaced the partial indexes with
  plain unique ones in a migration and confirmed a real delivery event landing
  in the database.
- **Result**: One gate and a handful of path-scoped bypass applications ran
  the pre-launch window; the newsletter bypass used all five destination slots
  an Access application allows. Launch on
  5 June was a single switch, followed by one announcement email to everyone who
  had signed up during the teaser phase.
- **Engineer's angle**: Edge-level access control versus application code; why
  the redirect rule was kept as a disabled draft for a future event; how an
  upsert that "succeeds" can silently drop data when the conflict target and
  the index disagree.
- **Plain version**: Until launch day only the client's reviewers could see the
  site, and opening it to everyone took one click.
- **Follow-ups**:
  - *Why not password-protect it in the app?* Reviewers needed to see the same
    deployment the public would get, and a gate at the edge needs no code change
    between phases.
  - *How did you catch the database bug?* By following one real email from send
    to delivery event to database row, instead of trusting the 204 response.

### S4. An AI event guide that cannot make up the facts

- **Kind**: implementation
- **Situation**: The contract asked for an AI assistant. A festival guide that
  invents a price or a date does damage, and an open AI endpoint on a public
  site is an invitation to abuse.
- **What I did**: I built the guide on the Vercel AI SDK behind a one-file
  provider abstraction, streaming answers from an OpenAI model, with voice in
  (speech-to-text) and voice out (text-to-speech). Its knowledge is compiled at
  build time from the site's own content, so it knows every dish, partner and
  FAQ without a database read. When the ticket structure changed, the guide
  kept giving the old answer: the visible pages had been updated but the
  generator never read the tickets file and the system prompt still described
  the old model. I fixed it, then removed the cause: every atomic event fact
  now lives in one schema-validated file that feeds the guide's "verified
  facts", the pages, the structured data and `llms.txt`, and the persona prompt
  holds no facts at all. In front of the model I added a Turnstile check on the
  first message, a per-visitor rate limit in Cloudflare KV and a short session
  cookie, and later a router that answers the most common atomic questions
  directly from the facts file.
- **Result**: The guide is live on every page with voice enabled, and
  everything it says traces back to content the client edits. When the client
  sent a master event knowledge base as the single source of truth, it went
  into the same facts layer the pages read.
- **Engineer's angle**: Grounding by build-time context instead of retrieval or
  tool calls, because the corpus is small and fixed; streaming canned answers
  over the same protocol as model answers; keeping the generated prefix stable
  for prompt caching.
- **Plain version**: The site has a chat helper that only knows what is on the
  site, so it cannot tell visitors something wrong.
- **Follow-ups**:
  - *Why not RAG?* The whole knowledge base fits in the prompt; retrieval would
    add a moving part with no accuracy gain at this size.
  - *How do you stop abuse?* An anti-bot check before the first message, then a
    session cookie, and an hourly per-visitor limit stored at the edge.
  - *Was it worth building?* It was in the contract, and it answers from the
    same facts as the pages. I would collect traffic data before adding more
    optimisation (see In hindsight).

### S5. WCAG 2.2 AA with a brand red that failed contrast

- **Kind**: implementation
- **Situation**: Tātaki Auckland Unlimited reviewed the site against the NZ
  Government Web Accessibility Standard (WCAG 2.2 AA). The brand's signature
  red did not reach 4.5:1 on the light backgrounds or on black, and the
  accessibility job in CI had been allowed to fail without blocking, which hid
  a wave of regressions when a site-wide banner went in.
- **What I did**: I split the colour into roles: the bright red only for
  decoration and large display type, a deeper red for all body text, links and
  buttons, and a lighter variant for red on black. When the client asked for a
  blue accent, the brand blue measured 4.13:1, so I added a darker blue for
  text and kept the bright one for non-text roles. I rebuilt the ticket selector
  from nested interactive `div`s into real radio inputs with labels, completed
  the standard keyboard pattern for the navigation dropdown, added a
  target-size check, and made the axe job blocking.
- **Result**: 39/39 axe-core tests passing on every push across Chromium,
  WebKit and Firefox; Lighthouse accessibility, SEO and best-practices scores
  at or above 90 on the measured routes; a written conformance statement
  delivered with the handoff.
- **Engineer's angle**: Design tokens as the enforcement point for contrast;
  why a non-blocking CI check is worse than none; what axe cannot check
  (keyboard flow, focus order, screen-reader sense), which I covered by hand.
- **Plain version**: I kept the brand's look but adjusted where each colour is
  used, so people with low vision can read every line.
- **Follow-ups**:
  - *What did automation miss?* Keyboard-only navigation, focus visibility,
    heading order and screen-reader checks, done manually.
  - *How do you keep it from regressing?* The axe suite gates every push, and
    the colour rules are written into the project guide.

### S6. Proving the site would hold up on launch day

- **Kind**: delivery
- **Situation**: The contract required a 1,000-concurrent-visitor load test and
  a strong mobile Lighthouse score. The Worker's starting plan was too tight:
  CPU time under load, and bundle size once the database and email code
  shipped; the client moved the Worker to Cloudflare's Standard plan.
- **What I did**: I ran a k6 profile against production on launch morning:
  ramp to 1,000 virtual users, hold, ramp down, across the busiest public
  routes, checking that each response was a real page and not an error page.
  For mobile performance I found that OpenNext on Workers did not run Next's
  image optimiser, so phones were downloading full-size photos; I built an
  offline AVIF/WebP pipeline with a `<picture>` component, trimmed font
  weights, lazy-mounted the AI widget and deferred the hero video.
- **Result**: 0.00% error rate over 113,320 requests in five minutes. The
  latency percentile ran above target, and the report explains why: a single
  home connection was generating all 1,000 users, while the same machine at
  100 users stayed well inside the target. On the dishes page, mobile
  Performance went from 71 to 84. The home page, with a full-screen autoplay
  video the client chose, stayed below the target after I made the poster image
  load first; dropping the video on phones was the client's design call, so I
  documented the option rather than make it alone. In September the client
  replaced the hero video with a rotating dish-photo slideshow, a change he
  made himself.
- **Engineer's angle**: Separating server capacity from load-generator limits;
  the preload scanner ignoring `<video poster>`; why a field measurement
  (PageSpeed Insights) beats a local Lighthouse run on a congested connection.
- **Plain version**: I simulated a thousand people visiting at once and the
  site did not drop a single one.
- **Follow-ups**:
  - *Did you hit the performance target?* Accessibility, SEO and best practices,
    yes. Mobile performance improved but the home page did not reach it while
    it carried the autoplay video; I said so in the report, and the client
    later replaced the video with a photo slideshow.
  - *How would you get a trustworthy latency number?* A distributed load
    generator, so the test is not limited by one uplink.

### S7. After launch: the analytics showed nothing

- **Kind**: incident
- **Situation**: After launch the Google Analytics dashboard stayed empty, and
  Cloudflare Web Analytics showed zero visits. The client needed numbers to
  show sponsors.
- **What I did**: First I moved Google Analytics to Consent Mode v2 so
  measurement would not depend on the cookie banner. The dashboard was still
  empty, so I checked the output instead of the setup: no page-view request
  and no analytics cookie on a live visit. The cause was one line. My `gtag`
  shim pushed an array onto the data layer; gtag.js only treats an `arguments`
  object as a command, so every consent and config command had been silently
  ignored. I fixed the shim and confirmed real hits arriving. For Cloudflare's
  analytics I proved with network probes that its collection host was being
  blocked on the connections I tested from, not misconfigured, and wrote the
  rule that its numbers are a floor and never shown alone. During the same
  review a "near-empty database" turned out to be my local environment pointing
  at the development database branch; I re-queried production and corrected
  the record.
- **Result**: Google Analytics became the authoritative source with conversion
  events for tickets and forms, and the project docs now carry a "verify the
  output, not the plumbing" checklist.
- **Engineer's angle**: Why `function(){ dataLayer.push(arguments) }` is not
  equivalent to a rest-parameter array; how to distinguish a code defect from
  client-side blocking; checking which database a query actually hit.
- **Plain version**: The visitor counter was broken by a one-line mistake;
  I found it by checking what the page really sent, not what the settings said.
- **Follow-ups**:
  - *How long was it broken?* From launch until I caught it within the first
    week of maintenance.
  - *What would have caught it earlier?* A launch checklist step that looks for
    a real visit in the analytics real-time view.

### S8. The ticketing partner changed twice

- **Kind**: requirements
- **Situation**: The contract named "a third-party ticketing partner" without
  naming one. I built a Ticketmaster integration with tracked outbound links;
  then the festival chose Universe, Ticketmaster's self-serve platform.
- **What I did**: I replaced the integration with Universe's in-page checkout
  widget. In production the checkout showed "This content is blocked": the
  link's `target="_blank"` beat the widget script, the script loaded too late
  for early clicks, and the page's Permissions-Policy blocked payments inside
  the iframe. I fixed all three, then found Universe's embed endpoint itself
  failed for this listing. I switched to Universe's direct-link pattern, so no
  iframe of theirs could break the site, and kept the button disabled until the
  on-sale time. On launch day I removed the on-site tickets page: every "Get
  Tickets" button links straight to Universe with tracking parameters, the old
  URL redirects, and the ticket link lives in the event-facts file the AI
  guide reads.
- **Result**: Tickets sold through Universe from the on-sale date with no
  checkout running on the festival site, and traffic to the checkout measurable
  through tracked links.
- **Engineer's angle**: Debugging a third-party embed across CSP,
  Permissions-Policy and script-loading order; choosing the dependency with the
  smallest failure surface over the nicer UX.
- **Plain version**: When the ticket seller's widget kept failing, I sent buyers
  straight to the seller's own page so the website could not be the thing that
  broke.
- **Follow-ups**:
  - *Was the first integration wasted?* Partly. I would now wait for the
    partner decision before building against an API.
  - *Why not keep fixing the embed?* The failing part was on Universe's side;
    a link out was reliable and kept attribution.

## Numbers I can say

| Figure | Source |
|---|---|
| 30+ award-winning chefs; 10 October 2026 at Shed 10, Queens Wharf | `data/profile/22-projects-oss-webapps.yaml` › eatropolis-website |
| Signed agreement 4 May 2026; a nine-day contracted build, 2026-05-07 → 2026-05-15 | same, `metrics` (Build span) |
| Teaser public 2026-05-22; full site public 2026-06-05 | same, `metrics` |
| Maintenance window 5 June → 5 September 2026 | same, `metrics` |
| 1,000 concurrent virtual users, 0.00% error rate, 113,320 requests in five minutes | same, `metrics` (Load testing) |
| 39/39 axe-core Playwright tests passing | same, `metrics` (Accessibility verification) |
| Lighthouse accessibility, SEO and best practices ≥ 90 on measured routes | same, `narrative.outcomes` |
| Mobile Performance 71 → 84 (dishes page) | same, `metrics` (Lighthouse Mobile target) |
| Brand blue 4.13:1 against the 4.5:1 minimum | same, `narrative.technicalApproach` |
| mail-tester 10/10; newsletter round trip 5.96 s end to end | same, `metrics` (Email deliverability) |
| 11 pages, 9 API routes, 7 email templates | same, `metrics` |
| 40 MDX + 16 JSON content files (at handoff) | same, `metrics` (Content files) |
| Five Access applications (the gate and four bypasses); the newsletter bypass used 5 of 5 destination slots | same, `metrics` (Cloudflare Zero Trust apps) |
| Deploy about 55–70 seconds from push | same, `metrics` (Deploy pipeline) |
| A dozen content edits made by the client in the browser editor during the teaser phase (19 May – 2 June 2026) | same, `narrative.audience` and `outcomes` |

## In hindsight

- **Preview on the real runtime from day one.** Most early failures were
  "works in Node, fails on Workers". Running the Workers preview before every
  push would have caught them before production did.
- **Raise the hero video trade-off before building it.** A full-screen autoplay
  video and a mobile performance target pull against each other. I measured
  the conflict after launch; I should have put the choice to the client at
  design time.
- **Check analytics output at launch.** The `gtag` bug sat unnoticed for days
  because I verified the setup, not a real hit. A launch checklist now does that.
- **Wait for data before optimising the AI guide.** I built a canned-answer
  router before there was traffic to show which questions visitors actually
  ask.
- **Build integrations after the partner is chosen.** The first ticketing
  integration was replaced within weeks.
- **Give the content editor feedback.** A rejected edit fails the build
  silently from the editor's point of view; a notice back to the editor would
  close that loop.
- **Use a distributed load generator.** It would have given a clean latency
  figure instead of one that needs an explanation.

## Evidence

No recommendation or award for this project is recorded yet: there is no entry
in `50-references.yaml` or `30-recognition.yaml`. Public items, read 2026-10-15:

- **The live site credits the build**: the footer of eatropolis.co.nz reads
  "Site by Chan Meng".
- **The event partner points to it**: Tātaki Auckland Unlimited's event
  listings on aucklandnz.com and Auckland Live, and Heart of the City's
  listing, link eatropolis.co.nz as the festival's website; the festival's own
  Instagram and TikTok profiles carry the same link.
- **The teaser page did its job on day one**: on 22 May 2026, the day the teaser
  went public, Bee Keng Koh (Director, Events and Marketing, Chow Luck Club)
  posted on LinkedIn "Eatropolis is coming. Sign up for priority access here",
  linking the site's coming-soon page.
- **Launch day**: Chow Luck Club's LinkedIn post "We're excited to officially
  launch Eatropolis" went out on 5 June 2026, the morning the full site opened.
- **A public comment** on my 26 September repost about the site: "Really love
  your work Chan!"
- **The festival itself**: the public listings (aucklandnz.com, Heart of the
  City) confirm the event on 10 October 2026 at Shed 10. No public post about
  how the site did on the day was found (searched 2026-10-15), so nothing about
  festival-day traffic is claimed here.

Thirteen private items (client messages and repository history) are held in the
private layer: working approvals through the feedback rounds, the client's
thanks after the festival, and the record of the client maintaining the site
himself after the handover training.

## Open questions

- **A recommendation from the client.** Armand Bentigan, who worked with me
  through every stage and now maintains the site, is the best-placed referee;
  Bee Keng Koh can speak to delivery. Neither has written one yet.
