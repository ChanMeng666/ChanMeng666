---
id: lyzen-website
title: LYZEN company site
role: Sole developer and designer
period: "2026-09 – present"
status: live
kind: client
repos:
  - private
live: https://lyzenglobal.com
stack: [Next.js 16 (static export), React 19, TypeScript, Tailwind CSS 4, GSAP, Lenis, Cloudflare Pages, Cloudflare Pages Functions, Cloudflare D1, Resend, GitHub Actions, Python (offline media pipelines)]
stories: 8
publicEvidence: []
privateEvidence: 4
diagrams: true
lastResearched: "2026-10-15"
sources:
  - data/profile/22-projects-oss-webapps.yaml (lyzen-website, femtech-weekend-website)
  - data/profile/60-network.yaml (organizations lyzen and femtech-weekend, collaborator zhu-yihan)
  - data/profile/10-career.yaml (work femtech-weekend)
  - docs/STATE.md (LYZEN row)
  - docs/stories/femtech-weekend-website.md
  - the client's private repository (code, commit history, developer docs, decision log), read 2026-10-15
  - https://lyzenglobal.com (The Firm page), read 2026-10-15
---

## In one breath

LYZEN is a cross-border advisory firm for women's health innovation between
China and global markets, founded by Zhu Yihan; FemTech Weekend, where I am
CTO, is its community arm. I designed and built LYZEN's official website,
lyzenglobal.com, on my own: a bilingual English and Chinese site whose central
idea, 红线, the red thread of fate, is told through film rather than code. It
has been live since 3 October 2026, the founder approved its visual system, and
it is now in her review, so further revisions are expected.

## The problem

LYZEN needed a front door of its own: who the firm is, what it does, where it
has worked, and the evidence for it, which is the Shanghai Summit 2026 and its
Impact Report. FemTech Weekend already had its site, femtechweekend.com, which I
built and run; that site stays where it is, on its own domain, as the community
arm's home. LYZEN's site had to be a separate thing for a different reader:
innovators, investors and institutions deciding whether to work with an
advisory firm.

The founder's bar was high. She wanted a site at award level that people
remember, built on one image: the red thread that ties together people who are
meant to meet. The obvious way to build that, a line animated in the browser,
was the way that failed. Around it sat the ordinary needs of a firm's site:
two languages that both read as written, a newsletter, reports that are worth
something because you have to ask for them, and hosting that the owner, not
the developer, controls.

## What I built

A statically exported Next.js site served from Cloudflare Pages in the owner's
own Cloudflare account. Every page exists in English and Chinese. The motion is
pre-rendered media played back by time or by scroll, produced by offline
pipelines kept in the repository. The server side is a few Cloudflare Pages
Functions; a Cloudflare D1 database keeps everything the forms collect, and
Resend sends the mail.

- **Pages**: home, The Firm (the firm's structure, its founder, the team), What
  We Do, Global Engagement, Impact, Insights and Opinion article sections, and
  a privacy notice, in both languages.
- **The red thread as film**: summit footage graded so that only the red
  lanyards keep their colour, photographed red silk on rice paper, and a silk
  thread rendered offline across a world map.
- **Newsletter and gated reports**: a newsletter signup, and research reports
  delivered by email as signed links that expire.
- **One system of record**: a D1 database with one row per accepted
  submission, and a command-line tool for summaries, exports, opt-outs and
  deletion requests.
- **Push-to-deploy**: GitHub Actions checks, builds, migrates the database,
  deploys and smoke-tests on every push to the main branch.
- **The LYZEN mark**: the meander (回纹) the site uses, chosen by the founder
  from the proposals I drew.

## Stories

### S1. The thread that would not sit still: three directions, one approved

- **Kind**: decision
- **Situation**: The concept was agreed with the founder on the first day: a
  cinnabar red thread running through the page. My first version was a
  physics-simulated rope drawn live with WebGL, pulled toward anchor points in
  each section and pluckable with a sound. The founder turned it down: it was
  over-sensitive, trembled while scrolling, appeared and disappeared, and its
  route had no clear logic.
- **What I did**: I diagnosed the causes rather than tuning constants: a
  screen-space simulation chasing targets that move with the scroll lags and
  overshoots, and pluck detection ran against the moving rope, so scrolling
  under a still cursor counted as a pluck. The second version was a single SVG
  path drawn by scroll position, which is deterministic and does not jitter.
  It was turned down too: on the route map the line could not align with each
  city pin, and it still read as mechanical. The lesson I took was that any
  line drawn live in the browser reads as interface. For the third version I
  made a rule, "never draw the thread at runtime": every thread on the site is
  film, plates or graded media made offline and only played back.
- **Result**: The founder approved the third direction, and it is the visual
  system of the live site. The rule now governs everything else: even the
  docking navigation bar is plain CSS `position: sticky`, with no
  scroll-driven positioning, so nothing on the page can tremble.
- **Engineer's angle**: The two rejected versions failed for different
  reasons, and the fix was not better code in either. Physics plus smooth
  scrolling plus moving targets is a control problem with no good tuning; a
  deterministic path solved the jitter but not the alignment, because a runtime
  path and a painted map live in different coordinate spaces. Moving the work
  offline removed both classes of failure at once.
- **Plain version**: My first two animated threads looked like software, so I
  turned the thread into film, and that is the version the founder approved.
- **Follow-ups**:
  - *Was building two versions that were rejected a waste?* They found the
    real requirement: the founder wanted the thread to feel like an object,
    not an effect. I would show a motion study before building an engine next
    time (see In hindsight).
  - *What does "never draw at runtime" cost?* Regenerating media when content
    changes, which is why every pipeline lives in the repository.
  - *How do you know nothing trembles now?* Playback is a function of time or
    scroll position only; there is no simulation state to drift.

### S2. Making the film reproducible: three sources, one grade

- **Kind**: implementation
- **Situation**: The third direction needed real material. Looking through the
  founder's summit footage I noticed that nearly every attendee of the June
  2026 Shanghai Summit wore a red lanyard: the red thread was already in the
  room.
- **What I did**: I built three offline pipelines. A colour grade in Python
  turns footage and photos into a warm ink-to-paper duotone in which only real
  reds keep their colour, with a rule that keeps skin and lips monochrome; it
  graded the hero loop, the summit photographs and the portraits. AI-generated
  plates supplied red silk on handmade rice paper (a needle, a knot, a bow, a
  silk weave). A film renderer drew the silk thread over real paper: across a
  world map, through a needle's eye, into a bow. I found that the image model's
  edits do not respect masks, so AI provides still plates only and every
  "only this part moves" effect is composited locally. In the route film the
  pins and the thread are rendered in the same coordinate space, so they align
  exactly, which a script checks.
- **Result**: The site's thread appears in the hero's graded summit loop (re-cut
  to 36 seconds), on What We Do, on Global Engagement and on Impact, all from
  pipelines that can regenerate any asset from its source. The irreplaceable
  inputs (client originals, approved AI masters) live in a separate private
  asset archive.
- **Engineer's angle**: Playback is engineered too: frame sequences decode in a
  sliding window of bitmaps, the hero video loads only after the page has
  loaded and the visitor has shown a sign of life, every film reserves its
  aspect ratio so nothing shifts, and reduced-motion visitors get stills and
  final frames. AI output is not reproducible, so approved masters are treated
  as source material and kept, not regenerated.
- **Plain version**: The red thread on the site is real: it is the red
  lanyards from the summit footage, with everything else turned to ink and
  paper.
- **Follow-ups**:
  - *Why not generate the video with AI?* The video model I had planned on was
    withdrawn by its provider, and thin threads are hard for generative models.
    Rendering the motion myself gave exact, repeatable results.
  - *How heavy is it?* The heavy parts load after the page is usable and only
    when engaged; measuring performance on a quiet machine is still on the list.
  - *What happens with reduced motion?* No smooth scrolling, no scrubbing, no
    autoplay: the poster or the final frame, and the page reads the same.

### S3. The brief changed: from an event brand to a company

- **Kind**: requirements
- **Situation**: I started the site at the end of September 2026 under the
  FemTech Weekend event brand, as a new site separate from femtechweekend.com,
  which was never modified. On 1 October the founder repositioned it: it would
  be the site of LYZEN, the company above FemTech Weekend, with FemTech Weekend
  as its community arm. On 3 October she confirmed it is the LYZEN company
  site, and on 4 October she asked for a different architecture.
- **What I did**: I kept the approved visual system and rebuilt what sat on it:
  LYZEN's copy and brand, inner pages for the firm, its services and its global
  engagement, then a quieter homepage that leads with the film, with the set
  pieces moved into the pages they belong to. I took the naming decisions to
  the founder and recorded them: LYZEN has no Chinese name and shows as LYZEN
  in both languages; 她域 is a separate entity on the firm chart, not a
  translation. I drew the structure on The Firm page as one photographed cord
  with three knots, one per part of the firm. I also adopted a rule for
  content: anything FemTech Weekend's site had hidden or deleted counts as
  out of date and is not carried over, which removed a company directory whose
  figures were stale.
- **Result**: The site went to production as the LYZEN company site on
  3 October 2026, with the restructured site live from 4 October. When the
  founder later made the Shanghai 2026 Impact Report the source of record for
  the summit, I moved the figures, partners, photographs and testimonials onto
  it and left out what the report did not support.
- **Engineer's angle**: Separating the visual system from the information
  architecture is what made a same-week repositioning possible: tokens, type,
  film slots and the playback library did not change while pages, navigation
  and copy did. The copy rule ("only verifiable facts; never invent stats,
  clients or testimonials") is written into the repository's guide so it binds
  every later change.
- **Plain version**: Halfway through, the founder decided the site was for her
  company rather than her event, so I kept the look she had approved and
  rebuilt the content around the company.
- **Follow-ups**:
  - *Is this a new version of the FemTech Weekend site?* No. It is LYZEN's
    own site; FemTech Weekend's site stays live on its own domain (S8).
  - *How did you handle figures that disagreed?* I did not choose: I listed the
    disagreement and the founder decided that the Impact Report is the
    authority.
  - *Who wrote the copy?* The positioning and the copy brief are the
    founder's; I wrote and edited copy to her brief in both languages.

### S4. Two languages on a static export

- **Kind**: implementation
- **Situation**: Every page had to exist in English and Chinese, and the
  Chinese had to read as written Chinese, not as a translation. The site is a
  static export with no server to detect language, and the Chinese display
  face is a large font file.
- **What I did**: I gave the site two root layouts: a bare page at the domain
  root that redirects by the browser's language, with plain links for visitors
  without JavaScript, and the real site under `/en/` and `/zh/`. Section and
  page copy lives in one file per section that exports `{ en, zh }` with the
  same structure, so a missing string shows as a type error. Canonical URLs,
  hreflang alternates and the sitemap are generated per page for both
  languages. The Chinese serif is subset at build time to the characters the
  copy actually uses.
- **Result**: The sitemap lists 26 URLs across the two languages, and the two
  locales stay structurally identical. The bare domain carries the full social
  card, so a shared link previews properly.
- **Engineer's angle**: The subset font is a build artifact whose 24 MB source
  is not in the repository, so CI cannot regenerate it. I made the build record
  which characters the committed font covers and fail when the copy has
  outgrown it, which turns "someone forgot to commit the font" from missing
  glyphs in production into a red build.
- **Plain version**: Every page is written in both languages, and the build
  refuses to ship Chinese text the font cannot display.
- **Follow-ups**:
  - *Why not a translation service?* The founder writes in Chinese and the
    audience reads both; machine-literal Chinese would undercut a firm whose
    job is bridging the two markets.
  - *Why two root layouts?* A static export has no server to choose a
    language, and each root layout must render its own `<html>` with the
    right `lang`.

### S5. Hosting in the owner's account, with a deliberately narrow role

- **Kind**: collaboration
- **Situation**: The site had been previewed in my own Cloudflare account. For
  production it belonged in the owner's account, on her domain, and Cloudflare
  Pages projects cannot be transferred between accounts. My role in her
  account was intentionally limited: no email routing, no redirect rules, DNS
  only through the dashboard.
- **What I did**: I created a new project in her account, moved the domain and
  every canonical, social and sitemap URL to lyzenglobal.com, and made `www`
  redirect to the bare domain with a Page Rule because redirect rules were
  outside my role. I verified the sending domain for email and gave LYZEN its
  own newsletter list, separate from FemTech Weekend's subscribers. Where a step
  was outside my role (the inbound mailbox, enabling object storage for the
  reports), I wrote the owner a step-by-step guide in Chinese rather than ask
  for more permissions. I recorded the role's limits in the repository so
  nobody looks for ways around them.
- **Result**: Production has run in the owner's account since 3 October 2026,
  and the preview project in my account was deleted at her request. During the
  move I found that the deploy tool remembers the last account in a local cache
  and ignores the account variable when that cache exists: a delete aimed at my
  personal account went to hers, and failed harmlessly only because the name
  did not exist there. I wrote it into the operations guide.
- **Engineer's angle**: Least privilege works when the developer designs
  around it instead of collecting exceptions: a Page Rule instead of a redirect
  rule, a guide instead of a permission. After the cache episode the rule is
  to check the cached account before any destructive command, or to call the
  API with the account in the URL.
- **Plain version**: The site lives in the founder's own account, and where I
  was not allowed to do something, I wrote her a guide instead of asking for
  more access.
- **Follow-ups**:
  - *Why not ask for admin rights?* The founder preferred a guide she can
    follow over wider permissions, and the narrow role protects her account.
  - *What would have happened if the delete had matched?* It would have
    removed a project in the wrong account. Destructive commands now start by
    checking which account the tool will act on.

### S6. Gated reports, and a database instead of a mailing list

- **Kind**: decision
- **Situation**: The firm's research reports are worth something because a
  reader has to ask for them, and each request is a lead. The first version
  stored leads only in the email service. The founder then asked whether what
  the site collects should live in a proper database.
- **What I did**: A short form posts to a Pages Function that emails the
  reader a download link. The link is signed and expires, and it goes through
  a second function that checks the signature before serving the file; the
  PDF's real storage location is named in one server-side module only, and CI
  fails the build if that path appears anywhere in the built site. Report
  leads go to their own list, so asking for a report is never a silent
  newsletter signup. For the system of record I chose Cloudflare D1: one
  `submissions` table with a row per accepted submission, an `opt_outs` table,
  and two views that give the current newsletter audience and the leads per
  person. A small tool summarises, exports, records opt-outs and deletes a
  person from both the database and the email service.
- **Result**: Newsletter signup and report download were verified end to end on
  production. The privacy notice says what the forms collect and where it is
  kept, and the deletion it promises is a command.
- **Engineer's angle**: An email service keeps the latest state of a contact,
  not its history, and its free plan's contact cap is shared with FemTech
  Weekend's site, so it is a delivery service, not a record. D1 was relational,
  in the same account as the site, needed no new vendor and was within my role.
  The database write runs after the response and never changes what the
  visitor sees; a deployment without the binding (previews) simply skips it.
- **Plain version**: Readers ask for a report and get a link by email that
  stops working after a while, and everything the site collects is kept in one
  database the firm owns.
- **Follow-ups**:
  - *Why not hide the PDF behind an unguessable URL and stop there?* An
    unguessable URL can be forwarded forever; a signed link expires, and the
    reader can always ask for a fresh one on the report's page.
  - *Why not Postgres, as on the FemTech Weekend site?* D1 lives in the owner's
    account with the site, so the firm holds its own data with no extra vendor.
  - *Where will the PDFs live?* The code already reads from object storage
    when it is bound and from a static file otherwise, so the move is a
    configuration step once the owner enables storage.

### S7. Push-to-deploy that checks what the last site taught me

- **Kind**: delivery
- **Situation**: On the FemTech Weekend site I had shipped without CI, and a
  secret that was listed as present turned out to be empty in production
  ([femtech-weekend-website S3](femtech-weekend-website.md#s3-a-production-form-that-could-not-see-its-database)).
  I did not want to repeat either on LYZEN's site.
- **What I did**: I wrote a secrets tool that checks every credential for
  presence, makes a live read-only call with it, compares local and production,
  and confirms nothing secret is in a tracked file; it also writes the local
  configuration so the Functions run locally against real email when needed.
  Then I set up GitHub Actions: every push to the main branch typechecks,
  lints, builds, applies database migrations, deploys and runs a smoke test
  that fetches pages in both languages and the social card, and posts an
  invalid signup to make sure the function refuses it rather than crashing.
  Pull requests only check and build.
- **Result**: A push to the main branch is the deploy, and a deploy is not
  green until real requests have succeeded against production.
- **Engineer's angle**: The smoke test's invalid POST is the cheapest proof
  that a function is deployed and wired: a missing secret or a broken bundle
  shows up as a 500 rather than the expected 400. Migrations run before the
  deploy because new code may need the new tables, and deploys are serialised
  so a newer push waits instead of cancelling one half-way.
- **Plain version**: Every change goes live automatically, and the pipeline
  checks the live site answers correctly before calling it done.
- **Follow-ups**:
  - *What does the pipeline not test?* Visual behaviour and the films; those
    are reviewed with screenshots at desktop and phone width in both
    languages.
  - *Why check that a secret works, not just that it exists?* Because I have
    seen an existing secret with no value take a production form down.

### S8. Two organisations, two sites, kept separate on purpose

- **Kind**: decision
- **Situation**: LYZEN and FemTech Weekend have the same founder and are
  linked: FemTech Weekend is LYZEN's community arm. I built both sites. The
  easy path would have been to merge them or let one become the other.
- **What I did**: I kept them apart where the organisations are apart: their
  own domains, their own Cloudflare accounts, their own newsletter lists and
  contact addresses, and different stacks chosen for different jobs (FemTech
  Weekend's site is an editorial platform with an application system; LYZEN's
  is a firm's showcase). I treated FemTech Weekend's site as a read-only
  content source: LYZEN's article pages carry FemTech Weekend's articles in
  both languages, but nothing on femtechweekend.com was changed for LYZEN. What
  they share is what the organisations share: the summit as their common
  evidence, and the social accounts the firm chart lists for both.
- **Result**: Two live sites, each with one job. LYZEN's The Firm page shows
  the three-part structure, including FemTech Weekend as the community arm, and
  lists me as Chief Technology Officer on the team.
- **Engineer's angle**: Shared infrastructure between related organisations
  creates shared limits (the email service's contact cap is one) and shared
  failure; separate accounts and lists make ownership and data boundaries
  match the organisations'. The patterns I carried across were practices, not
  code: Pages Functions as the only server side, a guide in the owner's
  language, and a real request as the test of a deploy.
- **Plain version**: The company and its community each have their own site,
  and I kept them separate so each can change without breaking the other.
- **Follow-ups**:
  - *Why not one site with two sections?* Different readers and different
    jobs: a community publishing research and running a summit, and an
    advisory firm presenting itself to clients and partners.
  - *How do you keep the shared facts consistent?* The summit figures follow
    one source of record, the Impact Report, which the founder named.

## Numbers I can say

| Figure | Source |
|---|---|
| 2 languages, English and Chinese; the Chinese is written, not machine-translated | `data/profile/22-projects-oss-webapps.yaml` (lyzen-website) metrics |
| 26 URLs in the sitemap (production check of 2026-10-04) | `22-projects-oss-webapps.yaml` metrics |
| 36-second hero film loop of graded summit footage, re-cut on 2026-10-04 | `22-projects-oss-webapps.yaml` metrics |
| 3 design directions before approval: two runtime-drawn threads turned down, the thread as film approved | `22-projects-oss-webapps.yaml` metrics |
| Live at lyzenglobal.com since 3 October 2026; restructured site since 4 October 2026 | `22-projects-oss-webapps.yaml` outcomes; https://lyzenglobal.com |

## In hindsight

- **Show motion before building an engine.** Two directions were built in full
  before being turned down. A short motion study of each idea would have
  surfaced "it must feel like an object, not an effect" sooner.
- **Performance is not yet measured properly.** Measurements on a busy
  development machine were too noisy to trust; a measurement on a quiet
  machine and real-device testing on iOS Safari and Android are still open.
- **The films were judged mostly from stills.** Their pacing in motion, on a
  trackpad versus a wheel and at tablet widths, still needs a proper pass.
- **Tests stop at the smoke test.** Typecheck, lint, build and production
  smoke requests run on every push; there are no behaviour tests for the
  Functions yet.
- **Some housekeeping is open**: unreferenced media in the repository and a
  broken image-manifest script are on the backlog.
- **The inbound mailbox was not ready at launch.** Outbound mail worked from
  day one; receiving mail at the public address depends on an owner step.

## Evidence

- **No written recommendation yet.** No one at LYZEN appears in
  `50-references.yaml`.
- **The live site** is public: https://lyzenglobal.com. Its The Firm page
  lists Chan Meng as Chief Technology Officer on the team (read 2026-10-15).
- **The founder's approval of the visual system** is recorded in the shard
  (`22-projects-oss-webapps.yaml`, lyzen-website outcomes: "The visual system
  was approved by the client").
- Private items: 4, counted and not quoted.

## Open questions

- **Shard wording.** The `lyzen-website` publicSummary says the site "began in
  September 2026 as a redesign for FemTech Weekend". `docs/STATE.md` says
  never to describe it as a redesign of the FemTech Weekend site. This story
  says it started under the FemTech Weekend event brand as a separate new
  site; Chan to decide whether the shard sentence should change.
- **Summit figures.** The shards say the summit had 20 speakers. The LYZEN
  site now follows the Shanghai 2026 Impact Report, which the founder made
  the source of record and which gives different figures; those are LYZEN's to
  state. Chan to decide whether the shards should change.
- **A recommendation.** A LinkedIn recommendation from the founder that names
  this site would be the first public endorsement of it.
- **Founder review.** The site is in the founder's review; this file should be
  re-read when that round lands.
