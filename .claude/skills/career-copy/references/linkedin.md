# LinkedIn

Distilled from **"LinkedIn for Life"** — Stuart Little (Creative Strategist,
Agency8) with recruiter Janelle, a She Sharp event, May 2026 — and reconciled
against how this repo actually builds the profile.

The headline in `00-basics.yaml` was already rewritten against this guidance on
2026-09-02, with the rejected alternates kept in a comment above it. That is the
pattern to follow: when you change a headline or an About section, leave the
alternates you rejected in the shard comment. The next person to look needs to
know what was already tried.

---

## How this repo drives LinkedIn

The pipeline is **inverted** from what people assume. Read this before editing
anything.

| File | Role |
|---|---|
| `data/profile/70-linkedin.yaml` | **Source.** The `linkedin:` block holds the display copy. Edit here. |
| `linkedin/linkedin-profile.json` | **Generated** by `scripts/build-linkedin-json.mjs`. Never hand-edit. |
| `linkedin/*.md` | **Generated** from that JSON by `build-linkedin-md.mjs`. Never hand-edit. |
| `00-basics.yaml` `basics.headline` | The headline. Injected into the LinkedIn banner by the generator. |

Drift-prone facts — dates, titles, award metadata, language list, credential IDs
— are **injected by the generator from the canonical sections** and must not be
duplicated in the `linkedin:` block. `scripts/check-linkedin-sync.mjs` (part of
`npm run validate`) fails on a broken mapping.

A LinkedIn display title that deliberately differs from `work[].position` needs
`_titleCurated: true` on that position, or the sync check fails. Use that rather
than quietly making the two disagree.

---

## The six pieces

The deck's model, in the order a visitor consumes them.

### 1. Banner

The largest piece of real estate on the page and the one most people waste. A
blank banner reads *"I haven't bothered."* A relevant one reads *"I'm here on
purpose."* No scenic photos, no default grey. It should communicate professional
identity before a word is read.

Chan's banner assets are built by `scripts/export-linkedin-cards.mjs` — see the
brand system, not this file, for the visual rules.

### 2. Photo

> **If I walked into a room you were in tomorrow, would I find you from this
> photo?** Yes → fine. No → it is out of date.

Current, well-lit (natural light is enough), recognisably you. **No
AI-generated portraits** — they read as inauthentic, which is the precise
opposite of a profile photo's job.

### 3. Headline — 220 characters, and it is searchable

Not your job title. That is what the job-title field is for.

> **Don't:** `Marketing Manager at Rise Agency`

It tells the reader nothing about value, nothing about who you help, and gives
them no reason to read on.

A headline is an elevator pitch with three parts: **who you help · what you do ·
the value you bring**. Lead with the value clause; put the searchable keywords
behind it. Every character counts — the cap is 220.

The current one, for calibration:

> `I help founders and teams ship AI agents that survive production | Founder, ArchCanvas + ArchLang | AI Agent Architect & Full-Stack Engineer | Anthropic Partner Network | Auckland, NZ`

Value clause first, then the identity keywords a recruiter search actually
matches on, then geography.

### 4. About — two rules, and they do most of the work

**Rule 1: first person, always.** A third-person About reads like LinkedIn
ghosted you. Write as yourself, to one real person.

**Rule 2: lead with how you help others.** Why what you do is worth something to
a client, a colleague, an employer — *before* you list what you have achieved. An
About is not a cover letter of greatest hits; it is a service-led introduction.

> **The test:** if a reader finishes your About knowing exactly who they should
> send your way, you have nailed it.

Chan's About ends with a section headed *"Work With Me — and Who to Send My
Way"*, which answers the test literally. Keep that structure. If a rewrite makes
that section redundant, the rewrite is wrong.

### 5. Featured — the shop window, and a private second use

Best posts, articles, projects, videos. The obvious use is the shop window.

The non-obvious one: **Featured links are sendable in DMs.** It turns every post
you have written into a personal library you can pull from in any conversation,
long after the feed has buried it.

### 6. Experience — written for impact, not duties

> Nobody hired you to *"be responsible for"* things.

Same rule as the CV, stricter enforcement: talk about what changed, who it
changed for, and how you drove it — collaboration, decisions, outcomes. See
[`claim-discipline.md`](claim-discipline.md) § 7.

**Budgets, and the split that matters.** The caps are LinkedIn's and are hard —
it truncates silently, with no warning and no visible marker. The typical values
are what this profile actually runs at, measured 2026-09-07; treat them as
calibration, not as targets.

| Field | Hard cap | This profile runs at |
|---|---|---|
| Headline | **220** | 183 |
| About (lead + all sections) | **2,600** | 2,441 — only 159 spare |
| Experience description, **per position** | **2,000** | median 1,374, max 2,297 |
| Projects description | **2,000** | median 1,045, max 1,784 |

> `[verified]` Two entries are over the cap today and are therefore truncated on
> the live profile: She Sharp at 2,297 (297 over) and Gavigo's Founding Principal
> Engineer at 2,019 (19 over). `check:copy` R9 now catches this class, and warns
> at 90% of any cap so a near-miss is visible before an edit pushes it over.

Only the first **~300 characters** of About render before "See more" on desktop
(~200 on mobile). The hook and the value clause must both land above that fold.

| Section | Leads with |
|---|---|
| Experience entry | The career narrative — who hired you, the mandate, what changed |
| Projects entry | **The artefact** — what it is and what it does |

Do not let these blur. A Projects entry that opens with who commissioned it has
become an Experience entry; an Experience entry that opens with a product
feature has become a Projects entry. Career-narrative facts live only in
Experience; product-artefact facts live only in Projects.

Both must serve **two readers in the same words**: a recruiter who needs human
stakes and outcomes, and a technical reviewer who needs the stack and the
decisions. Gloss jargon only where it is load-bearing; name real people as proof;
put outcomes before stack.

**Curate, don't archive.** Five to ten years is plenty. Every empty section is a
missed chance to be found, but a complete list of everything you have ever done
is not completeness — it is noise.

---

## What to stop doing

Each of these quietly undermines an otherwise strong profile:

- **The "Open to Work" ring alone.** Pointless without a working profile behind
  it. A strong, relevant profile does the job better.
- **A CV-style profile.** Duties instead of outcomes.
- **Empty sections.** Opportunity left on the table.
- **Listing every job.** Curate.
- **The dormant-then-frantic profile.** Recruiters spot panic activity instantly.
  Consistent presence beats desperate bursts.

---

## Activity — adapted to Chan's actual strategy

The deck recommends posting three times a week, commenting daily, and shipping
small projects and video. The commenting and projects advice applies unchanged.
The **publishing** advice does not, and applying it literally would reverse a
deliberate decision:

> Since 2026-07-20, **chanmeng.org/blog is the only publishing surface.**
> LinkedIn Articles and the LinkedIn Newsletter were retired, along with Medium
> and the Quartz knowledge base; 48 articles were migrated.

So: **post on LinkedIn, link to the blog. Do not restart Articles or the
Newsletter.** A LinkedIn post that carries its own argument and links out for the
long version is consistent with both the deck and the consolidation.

The commenting playbook is the highest-leverage part and survives intact: follow
the businesses you want to work with and the people doing the role you want, and
comment with something real — a question, a counterpoint, a related experience.
*"Great post!"* adds nothing. Fewer than 5% of members post regularly, so even
modest consistency puts you in a small, visible group.

---

## Three tests, and the line behind them

1. **Interview Ready.** *Would I speak this way if a hiring manager were sitting
   opposite me right now?* This settles the "should I be funny / personal /
   political" question without a rulebook. Not a sanitised corporate robot, not
   an unfiltered stream — you, with intention.
2. **Send-my-way.** After the About, does the reader know who to send your way?
3. **The referrer test**, which is the one that matters most:

> **"It is never the job of the person referring you to sell you."**

Their job is to make the introduction and put their reputation on the line. Your
profile's job is everything after the click. If it does not back up what they
just said about you, you have spent their credibility and got nothing for it.

---

## The market you are writing into

From the recruiter half of the session, as context for why the ATS resume exists
alongside the LinkedIn profile:

- Many roles receive **100–300+ applications**.
- AI and ATS systems filter candidates **before human review** — which is why
  `cv/exports/chan-meng-cv-ats.pdf` is a separate single-column artifact with its
  own hard rules, and why the two-column designed CV is never the upload.
- Recruiters search LinkedIn **before** posting a role. Many roles are filled
  before they are advertised.
- Warm introductions consistently outperform cold applications.

> *"Being good at your job is no longer enough if nobody can find you."*

---

## A note on AI, since it is the subject matter

The deck's position, which is worth holding to in copy about Chan's own AI work:
AI is a thinking partner for planning, structuring and refining — but the reader
wants *you*, and the most compelling material is unmistakably human. Amplification,
not replacement.

The corollary is the useful part for this profile: **AI fluency is now a signal
in itself**, and *showing* how you use AI to get results beats claiming fluency.
That is what the open-source portfolio is for. Every claim about directing coding
agents should have a repo behind it.
