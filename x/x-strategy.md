# X (Twitter) Build-in-Public Strategy — @chanmeng666

A hand-curated operating playbook for Chan Meng's build-in-public presence on X.
This is a document you *run from*, not a manifesto you read once. Every section is
meant to be filled in, edited, and appended to as you go.

- **Handle:** [@chanmeng666](https://x.com/chanmeng666)
- **Home base:** Auckland, NZ (Pacific/Auckland, UTC+12 NZST / UTC+13 NZDT)
- **Audience centre of gravity:** the US + EU AI-developer community (MCP, Claude
  Code, agentic systems), plus recruiters and founders scouting AI-native builders.
- **Owner:** Chan. **Cadence:** review monthly (see §8), append results below the line.
- **Source of truth for facts:** `data/profile/*.yaml`. Never post a number this
  doc or the shards can't back. When a metric changes, fix the shard first.

> **One-line positioning:** *I build AI agents in public — the floor-plan compiler,
> the career agent, the MCP servers — and show the engineering, not just the demo.*

---

## 1. Positioning

### The X-specific positioning statement

On X, Chan Meng is **the engineer who ships AI agents end-to-end and narrates the
real build** — the architecture decisions, the migrations that didn't go down, the
day a spec dropped and she shipped against it. Not a thread-guru reselling other
people's launches, and not a demo account that posts a GIF and disappears. The
feed is proof-of-work: live products (vitex.org.nz, archcanvas.uk, archlang.uk),
early-ecosystem credibility (an MCP server shipped 35 days after the protocol
launched; two merged PRs into CopilotKit at 36.1k stars; Anthropic Partner Network),
and the teaching instinct that turns each of those into something another engineer
can actually use. The through-line is a doctrine she already operates by:
**natural language is the source code** — so the same person who writes the compiler
also explains it in plain words.

Who she is *for* on X: AI engineers deciding what to build and which tools to trust;
founders looking for a first or founding engineer who can own the whole stack;
and the MCP / Claude Code community she's been part of since week one.

### The four archetypes

Everything else in this playbook maps back to these four. Each is a real hat Chan
already wears (they mirror `meta.x_brand.engagementRoles` and the README archetype
panel), restated for who-follows-you-on-X terms.

| # | Archetype | Who follows for this | What they want from the feed | Proof asset (link/pin) |
|---|-----------|----------------------|------------------------------|------------------------|
| A1 | **AI Agent Architect** | AI engineers, agent builders, MCP/Claude Code devs | How to actually architect agents that ship — retrieval, tool use, eval, idempotency, faithfulness gates | Vitex (8-step pipeline, agent-ready over HTTP/CLI/MCP) · Google News MCP · Tam-AI-Ti (88+ CopilotKit actions) |
| A2 | **Founding / principal engineer** | Founders, early-stage hiring managers, VCs scouting talent | Evidence one person can own a product from schema to production migration | GAVIGO IRE (sub-1ms restore, DOKS→GKE 30-min cutover) · She Sharp (95 API routes, solo platform) |
| A3 | **CTO-class operator** | Startup operators, technical co-founder seekers | Someone who sets engineering direction and ships at startup velocity across a whole org | Cross-cloud migration story · Slack/agent-skill automation · shipping cadence across 5 live products |
| A4 | **AI educator** | Learners, junior devs, the Chinese-speaking + women-in-tech communities | Clear, jargon-glossed explanations they can act on; the "how" behind the build | ArchLang playground · AI Programming Teaching Platform · 5 teaching cohorts, 100+ learners |

**Weighting.** On X specifically, lead with **A1 (Agent Architect)** — it's the
tightest fit for the platform's most engaged AI-dev audience and where Chan's
early-MCP story is a genuine differentiator. A2/A3 convert the followers A1 earns
into recruiter/founder inbound. A4 is the multiplier: teaching-style posts travel
furthest and are the most repostable. Rough target mix once running: **40% A1,
25% A2, 15% A3, 20% A4.**

---

## 2. Content pillars

Four pillars, one per archetype. Each angle below is drawn from a real project in
the shards — no invented material. Treat these as a starting backlog: when you ship
or fix something, it becomes the next post.

### Pillar 1 — Agent Architecture (→ A1) *[lead pillar]*
The craft of building agents that survive contact with real users.

- "What shipping an MCP server **35 days** after Anthropic launched the protocol
  taught me about being early to a standard." (Google News MCP)
- "Vitex is **agent-ready**: the same career agent runs from a browser, a CLI, and
  an MCP server. Here's why I built one core with N thin adapters instead of three
  products." (Vitex)
- "A generation is committed **exactly once, and only after a PDF actually
  compiles.** How a partial-unique DB index makes an AI pipeline idempotent under
  SSE reconnects and concurrent retries." (Vitex)
- "I put a **deterministic faithfulness gate** right after the tailoring step — no
  model in the check itself — so the agent can't invent a job you never had."
  (Vitex anti-hallucination)
- "I optimised a CopilotKit build **down** from 8 AI-enabled routes to 3. Removing
  agent surface area was the feature." (Tam-AI-Ti)

### Pillar 2 — Founding-engineer proof (→ A2)
The receipts that one person took a product from empty repo to production.

- "We moved GAVIGO's whole platform from DigitalOcean Kubernetes (Singapore) to
  Google Cloud GKE (Belgium) in a **~30-minute cutover**. Here's the runbook I
  wrote first." (GAVIGO IRE)
- "**Sub-1ms p50 restore, 84.6% warm-pool hit rate.** How container pre-warming
  makes a 'tap and it's instantly playing' feed possible." (GAVIGO IRE)
- "I built New Zealand's leading women-in-STEM charity a real member platform —
  **95 API routes, a 1,411-line schema** — to replace the spreadsheets they'd
  outgrown. Thread on the AI matching engine." (She Sharp)
- "Zero-downtime production migration from my personal Vercel to the client's team
  account, documented as a reusable 12-step playbook. The boring parts are the
  whole job." (Tam-AI-Ti)

### Pillar 3 — CTO-class / operator (→ A3)
Direction-setting, automation, and velocity across a whole product.

- "I gave a 2,200-member nonprofit a **Claude agent skill** that turns a Slack
  channel into a published event page — dry-run by default, Zod-validated before
  any git write. Hours of manual work → one command." (She Sharp)
- "A weekly cron crawls **6 NZ government funding sources**, dedupes, scores, and
  posts a digest to Slack. Operators shouldn't have to remember to check." (She Sharp)
- "Five live products, one person. Here's how I decide what gets an AI surface and
  what deliberately doesn't." (portfolio-level, anti-bloat doctrine)

### Pillar 4 — AI education / teach-the-build (→ A4) *[highest-reach pillar]*
Plain-language explanations of hard things. The most repostable pillar.

- "**Typst for floor plans.** I built a small language where you describe walls and
  rooms in text and get a precise dimensioned drawing back — change one number, one
  thing moves. Play with it in the browser." (ArchLang, playground.archlang.uk)
- "Describe a building in plain words → a floor plan you can **actually build
  from**, plus a realistic render, then refine it by talking. Here's the two-act
  studio idea behind ArchCanvas." (ArchCanvas, link archcanvas.uk only)
- "**echook**: install and configure a Claude Code / Cursor / Codex plugin using
  nothing but plain English — the AI runs the commands for you. The human is
  upstream; the agent learns the tool." (echook)
- "Natural language is the source code. What that doctrine actually means when
  you're teaching someone to ship their first AI SaaS in 12 weeks." (teaching cohorts)

**Pillar-to-archetype check (acceptance criterion):** P1→A1, P2→A2, P3→A3, P4→A4.
One-to-one, no orphans.

---

## 3. Cadence & weekly rhythm

### Realistic starting rhythm
- **3–5 original posts / week.** Not daily-original — sustainable beats heroic.
  Missing a day is fine; going silent for two weeks resets the algorithm's trust.
- **One daily 20-minute reply window.** Replying is where accounts actually grow;
  originals are the reason people find you, replies are why they follow. Non-negotiable
  even on no-post days.
- **One thread / week** (the anchor piece — usually P1 or P2).
- **One demo clip or screenshot / week** (P4 travels best in visual form).
- **Ship-note reflex:** whenever you ship or fix something real, that's a post.
  The backlog fills itself if you post from the commit log.

### Sample week

| Day | Original post | Reply window | Notes |
|-----|---------------|--------------|-------|
| Mon | P1 insight (agent architecture) | 20 min | Start the week on the lead pillar |
| Tue | P2 thread (founding-engineer proof) | 20 min | Threads best Tue–Thu |
| Wed | P4 demo clip / GIF | 20 min | Highest-reach day for visual |
| Thu | P1 or P3 insight | 20 min | Quote-repost an ecosystem post |
| Fri | P4 teach-the-build | 20 min | Lighter, shareable, community-facing |
| Sat | — (reply-only) | 20 min | Engage, don't broadcast |
| Sun | Optional: repurpose the week's LinkedIn post | 20 min | Low-effort, see §7 |

### NZT → US/EU posting windows

Computed for **NZST (UTC+12)**. During **NZDT (UTC+13, roughly late-Sep → early-Apr),
subtract one hour** from the NZ column. The useful discovery: **NZ midday reaches the
US live, NZ evening reaches Europe live**, and only the US *morning* prime falls in
Chan's small hours (schedule those).

| Target audience & their prime | NZST time to hit it | Live or schedule? |
|-------------------------------|---------------------|-------------------|
| US East-coast evening scroll (~8pm ET) | **~1:00 PM NZT** | Live — best US window of the day |
| US West-coast afternoon (~6pm PT) | **~2:00 PM NZT** | Live |
| UK / EU morning (~9am BST / CEST) | **~7:00–8:00 PM NZT** | Live — best EU window |
| EU lunch (~1pm CEST) | **~11:00 PM NZT** | Live-ish (late) |
| US West-coast morning (~9am PT) | **~5:00 AM NZT (next day)** | **Schedule** |
| US East-coast morning (~9am ET) | **~2:00 AM NZT (next day)** | **Schedule** |

**Practical rule of thumb:**
- **Threads and launch posts → ~1:00 PM NZT** (catches US evening + is still
  scheduleable-forward to US morning).
- **Teaching / EU-friendly posts → ~7:00–8:00 PM NZT.**
- **Anything aimed at US morning → write the night before, schedule for 2–5 AM NZT.**
- Best *days* remain **Tuesday–Thursday** for reach; Friday for community/teaching.

---

## 4. Formats

Five formats. Every visual is framed in the **Caldera brand**: basalt background
`#E2E2DF`, ink `#070607`, accent orange `#FC5000`. Consistency of frame is what
makes a scrolling stranger recognise a Chan post before they read the handle.
**Visuals come only from Chan's own tools / brand assets** — never shields.io,
trophies, or third-party chrome (see §9).

| Format | When to use | Brand notes |
|--------|-------------|-------------|
| **Insight post** (1 tweet, no thread) | A single sharp lesson or opinion; the daily-driver format | Text-only is fine; one orange-accented stat card if a number carries it |
| **Thread** (5–12 tweets) | Launches, architecture deep-dives, migration stories | Tweet 1 is the whole hook; each tweet stands alone; last tweet = one link + one CTA |
| **Demo clip / GIF** | Show, don't tell — a live product doing the thing in <15s | Terminal or product UI; basalt frame; captions burned in (most people watch muted) |
| **Terminal / product screenshot** | A crisp before/after, a status line, a compile time | Consistent `#E2E2DF` bg, `#070607` ink, `#FC5000` for the one thing you want the eye on |
| **Quote-repost commentary** | Add signal to an ecosystem post (MCP, Claude Code, a launch); the fastest way into a bigger conversation | Lead with *your* take in the quote; don't just amplify — extend |

**Format doctrine:**
- The **first line is the entire bet.** If tweet 1 doesn't earn the tap, nothing
  downstream matters. Human-stakes lead, outcome before stack (§9).
- **One link per post, and put it in the last tweet of a thread**, not the first
  (link-in-first-tweet suppresses reach).
- **One CTA, not three.** "Try it: playground.archlang.uk" beats a menu.
- Muted-autoplay world: **caption every clip.**

---

## 5. Launch playbooks (per flagship)

Five flagships, each with (a) a pre-launch tease, (b) a launch-day thread skeleton
written tweet-by-tweet, and (c) a follow-up cadence. Skeletons are *skeletons* —
fill the specifics from the shard the day you post. Every product uses its **real
hook**.

> **Standing rules for all launches:** honest metrics only; no pricing/cost framing;
> don't lead with commit counts or solo-%. **ArchCanvas: link `archcanvas.uk` only —
> the repo is private, never link or imply a public source.**

---

### 5.1 echook — *talk-to-configure hooks*
**Hook:** install, configure, and operate a Claude Code / Cursor / Codex plugin
using plain English only — the AI agent runs the commands for you.

- **Pre-launch tease (3–4 days before):** a 10-second clip of typing
  *"install audio-hooks and send alerts to my Slack"* and the agent just… doing it.
  Caption: "The human is upstream. The agent learns the tool. Soon."
- **Launch-day thread skeleton:**
  1. Hook — "You should never have to read the docs for a notification plugin. Watch
     me install, theme, and Slack-wire echook by *talking* to Claude Code." + clip.
  2. The problem — power users rotate across 3 editors, each with its own config
     language; the mismatch isn't audio, it's the human sitting downstream of the CLI.
  3. The idea — one JSON-only CLI, ~40 subcommands, every error carries a
     `suggested_command` so the agent self-recovers.
  4. What it does — 37 hook events, TTS that reads the agent's *actual* reply, usage-
     limit warnings before the 5-hour/7-day walls, a 29-segment context status bar.
  5. The engineering — one canonical source → three editor targets, CI-enforced
     no-drift, 248 tests on Ubuntu/Windows/macOS × Python 3.9–3.13.
  6. Why it matters — echook is the reference implementation of an AI-first plugin
     contract. MIT, stdlib-only, no telemetry.
  7. CTA — "Install in 60 seconds: github.com/ChanMeng666/echook" (single link).
- **Follow-up cadence:** Day+2 a single-tweet tip ("snooze for 8 hours — just say
  it"); Day+7 the context-status-bar screenshot as its own post; ongoing, post each
  release note (v6.3.x) as a one-liner. Feed the 88-second Remotion promo film once
  as a standalone.

### 5.2 ArchLang — *Typst for floor plans*
**Hook:** a declarative language that compiles `.arch` text into precise, dimensioned
floor plans — change one number, exactly one thing moves.

- **Pre-launch tease:** a side-by-side GIF — edit `4000x3000` → `5000x3000`, the
  bedroom widens and nothing else shifts. Caption: "Floor plans should be programs."
- **Launch-day thread skeleton:**
  1. Hook — "Floor plans live in two bad states: heavy CAD or raster images. I made
     a third: a *language.* Typst for architecture." + compile GIF.
  2. Problem — a precise parametric edit is expensive in both worlds; neither is
     authorable by an AI agent because there's no deterministic text to write & verify.
  3. What it is — write walls/rooms/doors/windows in text; compile to SVG/DXF/PDF/PNG;
     same source → identical drawing.
  4. The twist — it checks whether a plan is *livable*: can you reach the bathroom?
     does a bedroom have a window? does a door swing into another door?
  5. Agent-native — returns a plan "as facts" over `describe --json`, whole language
     in a ~2k-token spec, 83 diagnostic codes each with a machine-applicable fix.
  6. Proof — published to npm, and it's the engine behind ArchCanvas (a real product
     depends on it, not a toy).
  7. CTA — "Try it in the browser, nothing leaves your machine:
     playground.archlang.uk" (single link).
- **Follow-up cadence:** a "livability lint" clip (windowless-bedroom warning) as
  its own post Day+3; the ```arch-fence GitHub Action (renders plans in Markdown) as
  a dev-tooling tip Day+7; post notable release notes.

### 5.3 Vitex — *job ad → tailored resume in ~30s*
**Hook:** paste a job ad + describe your background in plain text → a tailored,
ATS-ready resume PDF + cover letter in about 30 seconds, from browser, CLI, or an
AI assistant.

- **Pre-launch tease:** screen-recording of the 8-step pipeline streaming its
  stages live (reading the job ad → matching → tailoring → ATS → PDF). Caption:
  "No spinner. You watch each stage finish."
- **Launch-day thread skeleton:**
  1. Hook — "Paste a job ad, describe yourself in plain text, get a tailored resume
     *and* cover letter as a real PDF in ~30 seconds. Live at vitex.org.nz." + clip.
  2. Problem — AI resume tools are either a chatbot that hands you a paragraph, or a
     form site rendering the same generic template everyone gets.
  3. The pipeline — 8 Zod-validated stages on the Vercel AI SDK; two-tier model
     routing (cheap extract tier + reasoning tier).
  4. ATS + honesty — a *deterministic, no-LLM* ATS score, and a faithfulness gate
     that catches fabricated skills before they ship.
  5. The PDF is the deliverable — local Typst compile <100ms, no outside document
     service; 7 templates auto-selected by industry.
  6. Agent-ready — the whole product is reachable over a public API, a `vitex` CLI,
     and an MCP server; Claude/Cursor/ChatGPT can drive it without a browser.
  7. CTA — "Try it: vitex.org.nz" (single link).
- **Follow-up cadence:** Day+2 the "refine in plain English — 'make the leadership
  section stronger' re-does just that slice" clip; Day+5 the MCP-driven demo for the
  agent crowd; ongoing, quietly share (with permission) a public share-link resume as
  a live artifact.

### 5.4 Google News MCP — *the early-MCP-ecosystem story*
**Hook:** shipped one of the first useful MCP servers 35 days after Anthropic
launched the protocol — now a PulseMCP Top Pick listed across 15+ catalogs.

- **Pre-launch tease:** *(this one is already live; "launch" = a retrospective /
  re-introduction post.)* Tease: "MCP is everywhere now. I want to tell you what it
  was like to build for it in week five."
- **Launch-day (retrospective) thread skeleton:**
  1. Hook — "35 days after Anthropic published the Model Context Protocol, I shipped
     a Google News server for it. Here's the early-ecosystem story." 
  2. The moment — Nov 2024, a handful of reference servers, none let an assistant
     search live news; people were already asking their AI 'what's happening today.'
  3. The other gap — Windows + NVM users couldn't launch *any* npm MCP server; I
     filed issue #76 with the PATH fix that became early reference guidance.
  4. What it does — one tool, `google_news_search`, topic-sorted, 10 languages, one-
     command Smithery install + a one-click Claude Desktop bundle.
  5. Distribution *is* the strategy — listed on 15+ registries because that's how AI
     devs actually find servers; PulseMCP Top Pick, Glama A rating.
  6. The lesson — being early to a standard compounds; the same instinct now runs
     through Vitex and ArchLang shipping MCP surfaces.
  7. CTA — "github.com/ChanMeng666/server-google-news" (single link).
- **Follow-up cadence:** use this as evergreen credibility — re-share the issue-#76
  screenshot whenever MCP trends; quote-repost Anthropic/MCP ecosystem news with "I
  was in the first month of this" as earned context (not bragging — proof).

### 5.5 ArchCanvas — *describe a building → a buildable plan*
**Hook:** describe a building in plain language → one strong, dimensioned floor plan
you can actually build from, plus a grounded AI rendering — then refine it by talking,
on an infinite zoomable canvas.

> **Repo is private. Link `archcanvas.uk` only.** Never post a GitHub link, never say
> "source coming" — the product page is the single destination.

- **Pre-launch tease:** a clip of an edit *morphing in place* — the old plan fades to
  a dashed ghost, a diff chip shows what changed. Caption: "It refines the plan. It
  never regenerates it."
- **Launch-day thread skeleton:**
  1. Hook — "Describe a house in plain words. Get a dimensioned floor plan you can
     *build from*, plus a real rendering. Then refine it by talking. archcanvas.uk."
     + clip.
  2. Problem — AI floor-plan tools make pretty pictures you can't build from and
     can't precisely edit; CAD is powerful but slow and expert-only.
  3. Act I — describe your build, the agent asks 2–5 questions, then generates ONE
     plan (not a grid of options) as parametric ArchLang, compiled to dimensioned SVG.
  4. Act II — a canvas studio where nothing regenerates: click a room and get verb
     chips (Enlarge / Widen / Move); parametric sliders recompile with no AI call.
  5. Review mode — a walking-circulation overlay finds pinch points; each critique
     has a one-click "have AI fix" (shown, never auto-applied).
  6. The moat — because plans are a deterministic *program* (ArchLang underneath),
     editing/diffing/change-history-export exist where an image tool structurally can't.
  7. History as a git repo — export the whole design as a real commit log; the log
     *is* the design conversation. CTA — "archcanvas.uk" (single link).
- **Follow-up cadence:** Day+3 the "design history → git repo" clip (uniquely
  X-native, devs love it); Day+7 a "grounded rendering vs hallucinated layout"
  before/after; tie back to ArchLang launches so the two reinforce each other.

---

## 6. Community engagement

Chan's edge here is **membership, not observation**: Anthropic Partner Network
member, two merged PRs into CopilotKit (36.1k stars), a merged PR into wshobson/agents,
issue #76 in the official MCP servers repo, and an MCP server that's been listed since
the protocol's first month. Engagement should sound like a peer, because she is one.

### Tactics
- **Be useful in public before you're promotional.** Answer MCP setup questions,
  share the Windows/NVM PATH fix when someone hits it, post a working config. Helpful
  replies from a credible account are the single best follower source.
- **Quote-repost to extend, not to amplify.** When Anthropic ships a Claude Code
  feature or the MCP spec updates, add your take + a concrete example from your own
  work. "Here's how this changes the idempotency story in Vitex" > "🔥 huge."
- **Ship-in-the-open reactions.** When you fix a real bug against a new SDK version
  (e.g. an OpenAI strict-JSON-schema regression), post the fix. The ecosystem
  rewards people who debug in daylight.
- **Show up in the reply guy's good sense:** consistent, on-topic, additive replies
  under the accounts your audience already reads compound faster than originals.
- **Credit real people by name** (with their consent/when public) — maintainers who
  merged your PRs, collaborators — it's honest and it widens reach through their
  networks.

### Starter list of account *types* to engage
(Categories, not specific handles — pick the real accounts that fit as you go, and
keep a private list.)

- **Anthropic / Claude Code:** official product accounts, DevRel/DX engineers, docs
  maintainers, Claude Code power-user builders.
- **MCP ecosystem:** the registry/catalog accounts (PulseMCP, Glama, Smithery,
  mcp.so), MCP server authors, spec contributors.
- **Agent-framework maintainers:** CopilotKit (you have merged PRs — warm), LangChain/
  LangGraph, Vercel AI SDK team.
- **AI-native founders & early-stage operators** hiring or building in public — the
  A2/A3 audience.
- **Dev-tool builders** in adjacent lanes (Typst community for ArchLang, resume/ATS
  and careers tools for Vitex).
- **Women-in-tech & AI-education communities** (She Sharp, TechRosie-adjacent, AI
  educators) — the A4 audience and Chan's genuine community.
- **The "build in public" indie-hacker cohort** — high-reciprocity, teaches you the
  platform's rhythms fast.

### The 20-minute daily window, concretely
5 min: reply to anyone who engaged your last post. 10 min: 3–5 additive replies
under target-type accounts on today's live conversation. 5 min: one quote-repost that
extends an ecosystem post with your own example. Done. Consistency beats volume.

---

## 7. Cross-promotion loop

X is the fast, public, dev-facing top of the funnel. It should both feed and be fed
by everything else. Current reach to route through the loop:

- **LinkedIn — 5,856 followers** (recruiter / founder / professional audience)
- **Newsletter — 1,103 subscribers** (chanmeng.org/#newsletter; depth audience)
- **GitHub — 218 followers / 480+ stars** (proof-of-work; where devs verify you)
- **chanmeng.org** (the hub every link should ultimately serve)

### Concrete repurposing rules
- **LinkedIn post → condensed X thread the next day.** LinkedIn tolerates length and
  a professional register; X wants the same story compressed, sharper hook, more
  opinion. Never cross-post verbatim — re-cut for the platform.
- **X thread that performed → LinkedIn article or newsletter section that week.**
  Reverse the flow when a thread lands: expand it back out for the depth audiences.
- **Every shipped feature → GitHub commit → X ship-note → monthly newsletter
  round-up.** The commit log is the content pipeline; X is the real-time layer, the
  newsletter is the digest layer.
- **X → newsletter capture.** Roughly once a week, a post's CTA should be
  "I go deeper on this in the newsletter: chanmeng.org/#newsletter" — convert
  fast-followers into owned audience you don't rent from an algorithm.
- **X → GitHub.** Product/tooling posts (ArchLang, echook, Google News MCP) drive to
  the repo; a star is a durable proof signal the next recruiter sees.
- **Pinned post = current best proof.** Keep one flagship launch thread pinned;
  rotate it when a stronger one ships (see §8 review).
- **Profile → hub.** Bio links to chanmeng.org; the feed's job is to make a stranger
  curious enough to click through to the whole story.

### Direction of each edge (quick reference)
```
LinkedIn  ──(next-day condense)──▶  X
X         ──(expand on a winner)──▶  LinkedIn / Newsletter
GitHub    ──(ship-note)──────────▶  X  ──(round-up)──▶  Newsletter
X         ──(weekly capture CTA)─▶  Newsletter
X         ──(repo CTA)───────────▶  GitHub (stars = proof)
everything ─────────────────────▶  chanmeng.org (hub)
```

---

## 8. Metrics & monthly review

Vanity metrics lie; track the ones that map to the goal (founding-engineer / AI-
architecture inbound + ecosystem credibility).

### What to track
- **Followers** — trend, not absolute; are you compounding month-over-month?
- **Profile visits** — the real leading indicator; a post's job is to earn the click
  to your profile.
- **Pinned-post engagement** — is your current best proof still pulling?
- **Link taps** — to vitex.org.nz / archcanvas.uk / playground.archlang.uk / repos /
  chanmeng.org. This is intent.
- **Which pillar performs** — tag each post P1–P4; review which archetype your
  audience actually rewards, and reweight §1's mix accordingly.
- **Inbound quality** — DMs/replies from founders, recruiters, ecosystem accounts.
  One good founding-engineer conversation outranks 500 impressions.
- **Reply → follow conversion** — did the daily reply window produce follows?

### Monthly review checklist
- [ ] Pull follower / profile-visit / link-tap trend vs last month.
- [ ] Identify the month's **top 3 posts** and the **bottom 3** — what's the pattern?
- [ ] Which **pillar** over/under-performed? Adjust the §1 target mix if needed.
- [ ] Is the **pinned post** still the strongest proof, or did something better ship?
- [ ] Did the **20-min daily window** actually happen? If not, why — and fix it.
- [ ] Any **metric in this doc or the shards** gone stale? Fix the shard first (§9).
- [ ] Log **inbound** worth remembering (who reached out, re: what).
- [ ] **Append this month's review below the line** in this file (see template).

### Reviews get appended to this doc
Keep the record in-place so the strategy learns from itself. Append using the
template at the very bottom of this file.

> **Future upgrade (documented, not built):** promote the operating data — pillar
> tags, per-post performance, monthly-review rows, the account-types watchlist — into
> a proper profile shard at `data/profile/75-x.yaml`, merged by the loader like every
> other shard and surfaced on the profile/LLM surfaces the same way. Until then, this
> markdown file *is* the shard: hand-curated, version-controlled, reviewed monthly.
> When 75-x.yaml is built, this doc becomes its prose companion (the way
> `70-linkedin.yaml` pairs with the LinkedIn playbook).

---

## 9. Guardrails

Non-negotiable. A recruiter *and* an AI engineer should both be able to read any
post and find it honest, clear, and credible.

- **No pricing / cost framing.** Never lead with or lean on dollars, subscription
  tiers, or "saves you $X." Talk value, capability, and outcomes. (Applies to posts,
  threads, replies, and launch copy alike.)
- **Never lead with commit counts or solo-%.** Stars, users, ecosystem listings,
  performance numbers, and adoption signals are fair game as *support*; "426 of 439
  commits solo" is a detail you *can* mention deep in a thread, never a hook.
- **Human-stakes lead, outcome before stack.** Tweet 1 says what changed for a
  person; the tech stack is the *why-it's-credible*, not the opener. (Dual-audience
  principle — serves recruiter and engineer in the same words.)
- **Gloss jargon only when it's load-bearing.** Keep the real terms (MCP, RAG,
  pgVector, idempotency, faithfulness gate) — don't dumb down — but add a half-line
  of plain-English stakes when the term is doing work for a non-expert reader.
  Don't over-explain to experts either.
- **English.** This document and the X presence operate in English. (Chinese-audience
  content lives on its own surfaces.)
- **Never link private repos.** **ArchCanvas → `archcanvas.uk` only.** Tam-AI-Ti,
  GAVIGO IRE are also private — link the live product, never the repo. Never say
  "source coming" for a private product.
- **Visuals only from Chan's own tools / brand.** Caldera frame (`#E2E2DF` /
  `#070607` / `#FC5000`), her own product UIs, her own generators (gradient-svg-
  generator, github-visitor-counter, github-readme-suno-cards). No shields.io badges,
  trophy graphics, wakatime, or third-party chrome.
- **Honest metrics only.** Every number must be backed by `data/profile/*.yaml` or a
  cited source. Round *down* when hand-typing (480+ stars, not a precise figure that
  rots). If a claim would need a "*needs verification*" asterisk, don't post it as
  fact. When a number changes, **fix the shard first, then post.**
- **Don't present training-camp / coursework as flagship evidence** on X — the feed
  leads with the products Chan owns and the ecosystem work, matching the README's
  product-first curation.

---

<!-- ============================================================ -->
<!-- MONTHLY REVIEW LOG — append newest at the top of this block. -->
<!-- Template:                                                     -->
<!--                                                               -->
<!-- ### Review — YYYY-MM                                          -->
<!-- - Followers: ____ (Δ ____ vs last month)                     -->
<!-- - Profile visits: ____   Link taps: ____                     -->
<!-- - Top 3 posts: 1) ____  2) ____  3) ____                     -->
<!-- - Bottom 3 / what flopped: ____                              -->
<!-- - Pillar performance (P1/P2/P3/P4): ____ ; mix change? ____  -->
<!-- - Pinned post: kept / swapped to ____                        -->
<!-- - Daily reply window happened? ____                          -->
<!-- - Notable inbound: ____                                      -->
<!-- - Decisions for next month: ____                             -->
<!-- ============================================================ -->
