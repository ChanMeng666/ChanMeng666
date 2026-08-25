# Evidence bank

Pre-written, source-attributed sentences for the cover-letter template. Every
line ends with its source in `data/profile/`, so any claim can be traced back
before it is sent. Pick **two, from two different themes** (see
[`TEMPLATE.md`](./TEMPLATE.md)).

---

## ⛔ Red lines — six things that must never appear in a letter

These are not stylistic preferences. Each one comes from a `CV COMPLIANCE`
comment in the profile shards, and each is a statement a reference check or a
five-minute search would contradict.

1. **Never the word "certified" about the Claude Certified Architect credential.**
   The Foundations *curriculum* was completed and the *practice* exam passed; the
   official certification exam was never sat, so the credential is **not held**.
   Write "curriculum completed" or "practice exam passed", never "certified" and
   never "CCA-F holder". — `10-career.yaml :: work[engram]`
2. **UN CSW 69 was presented remotely, by video link.** The conference was held at
   UN Headquarters in New York; Chan did not travel to it. Describing the
   *conference* as held at UN HQ is accurate; any wording implying attendance,
   travel, or being "in the room" is not. — `30-recognition.yaml :: awards[]`
3. **She Sharp's community figures are unsourced — do not use them.** "3,500+
   members", "50+ partners" and the "85% mentorship success rate" are all marked
   UNSOURCED in the org's own `stats.ts`, and the file states explicitly that no
   such mentorship survey was ever run. The **only** computed, sourced figure is
   **96+ events since 2014**. Use that one. — `10-career.yaml :: work[she-sharp]`
4. **Tam-AI-Ti was commissioned by Riria (Missy) Te Kanawa personally.** ASB Bank,
   her employer, was **not a party** to the commission. Naming her current role is
   fine; implying an ASB engagement is not. — `20-projects-flagship.yaml :: tam-ai-ti`
5. **The She Sharp title is "Senior Full Stack Engineer & Website Team Lead".**
   Not "AI Lead", not "Ambassador" — those are the organisation's own billing on
   its site and at events, not the role. — `10-career.yaml :: work[she-sharp]`
6. **MCP directory standings are third-party claims — attribute them.** "PulseMCP
   Top Pick", "Glama A-rating" and "15+ catalogs" are flagged in the data as
   *external claims needing a registry check*. Write "rated a Top Pick by
   PulseMCP", never "the top-rated MCP server". — `21-projects-oss-primary.yaml`

Two more habits worth keeping, from the same discipline:

- **Never present a team's or company's result as personal.** GAVIGO's accelerator
  selections, Sanicle's funding, FreePeriod's award streak and CopilotKit's
  36.1k stars are context, not achievements. Say what *you* built inside them.
- **Never use a superlative you cannot enumerate the comparison set for.**
  "China's first organisation built specifically around women's health technology"
  survives because it is FemTech Weekend's own published self-description; "the
  leading X" generally does not.

---

## Theme A — production agent systems

- Owns the Intelligence Layer of GAVIGO's app-activation platform end to end: a
  Go orchestrator running a content scorer, a seven-trigger AI rules engine, a
  warm-pool LRU manager and a five-state activation spine in Redis. — `work[gavigo]`
- Designed the dual-model path at Sanicle after measuring IBM watsonx's
  28-second response baseline against a 10-second serverless function timeout,
  and put a Gemini fallback behind it rather than shipping a product that timed
  out. — `work[sanicle]`
- Composed three OpenAI models in one product for Tam-AI-Ti — a realtime voice
  coach with server-side VAD, journal synthesis, and a CopilotKit action layer —
  and then **cut** the CopilotKit surface from 8 routes to 3, because removing AI
  surface area was the improvement. — `projects[tam-ai-ti]`
- Shipped a Model Context Protocol server 35 days after Anthropic launched the
  standard, before a registry existed, and hand-listed it across 15+ catalogs;
  rated a Top Pick by PulseMCP and A by Glama. — `projects[google-news-mcp]`
- Built the AI mentor-matching system at She Sharp as a rule-based pre-filter
  into GPT-4o-mini scoring across five explicitly weighted dimensions, with an
  exponential-backoff retry policy, a deterministic rule-based fallback, and a
  human admin as the final gate. — `work[she-sharp]`

## Theme B — latency, scale, and measured behaviour

Every number here carries its measurement basis; keep the basis in the sentence.

- Sub-millisecond p50 restore and a 84.6% warm-pool hit rate, measured over 20
  iterations per path on live Kubernetes — not a local benchmark. — `projects[gavigo-ire]`
- Zero errors at 100 concurrent WebSocket clients under load test. — `projects[gavigo-ire]`
- A cross-cloud migration from DigitalOcean DOKS to Google Kubernetes Engine in a
  ~30-minute cutover on 2026-03-11, rebuilding registry, ingress, managed
  certificates and WebSocket-aware timeouts across five deployments. — `work[gavigo]`
- Carried 10+ years of legacy content off a drag-and-drop site with zero broken
  inbound links, via a purpose-built migration crawler (1,748 images, 707 MB,
  118 pages). — `work[she-sharp]`
- Typst compiles Vitex's finished PDF locally in under 100 ms across 7
  templates — no hosted Chromium, no third-party document service. — `projects[vitex]`

## Theme C — solo delivery and ownership

Always with the denominator. "Solo" without a denominator is an adjective; with
one it is evidence.

- 426 of 439 commits on GAVIGO's platform; promoted Core Engineer → Founding
  Principal Engineer across three contract iterations, with a contractually
  defined protected technical domain. — `work[gavigo]`
- 793 of 936 commits on the She Sharp platform over about a year of active
  build. — `projects[she-sharp]`
- 534 of 564 commits on FemTech Weekend's second-generation platform, and 100%
  of the 58 commits on the first. — `work[femtech-weekend]`
- 211 of 220 non-merge commits on the bilingual teaching platform that serves
  five cohort versions side by side. — `work[technest]`
- Invented ArchLang — a hand-written compiler with a lexer, recursive-descent
  parser and zero runtime dependencies, 83 diagnostic codes each carrying a byte
  span and a machine-applicable fix — then built the commercial product on top
  of it. — `projects[archlang]`, `projects[archcanvas]`

## Theme D — privacy, compliance, and reversibility

- Tam-AI-Ti stores text transcripts only; voice audio is deliberately never
  persisted. — `projects[tam-ai-ti]`
- Multi-tenant isolation with role-based access across three role types at
  Sanicle, built for a product employers buy for their staff's menstrual and
  menopause health — private health data under workplace policy. — `work[sanicle]`
- Guardrails enforced in code rather than by prompt instruction, with
  comprehensive audit logging and a database version-control system on the She
  Sharp platform. — `work[she-sharp]`

## Theme E — teaching and levelling others up

Use this when a role is a first AI hire, or when the team will need to absorb
agentic practice rather than just receive it.

- Five teaching cohorts since 2024, most recently as sole instructor of
  TechNest's first AI-specialised track: 30 graduated, 6 multi-user AI products
  shipped and published. Students arrive using only browser ChatGPT. — `work[technest]`
- Outstanding Mentor Award at the AI Hackathon Festival 2025, as 1 of 14 expert
  mentors guiding 11 teams and 80+ participants. — `awards[]`
- Seven of 26 public LinkedIn recommendations come from a single mentorship
  cohort (Forward with Her) — the largest independently attested source of
  mentoring impact in the record. — `work[forward-with-her]`
- Ran the AI-tools training session for a full engineering squad (Claude Code,
  Skills, spec-driven development) as the squad's knowledge lead. — `work[aotearoa-infinite-academy]`

## Theme F — cross-cultural and bilingual engineering

- Built culture into the data model rather than the translation layer: every one
  of the eleven Hauora dimensions in Tam-AI-Ti is a typed column with a
  te reo Māori identifier, so it cannot decay into an English-only label. — `projects[tam-ai-ti]`
- Bilingual (English / 简体中文) as a first-class architectural constraint across
  the FemTech Weekend platforms and the teaching platform, including
  locale-filtered search and translated tag taxonomies. — `work[femtech-weekend]`, `work[technest]`
- Works across NZ, China, the United States and Canada simultaneously — five
  concurrent engineering and CTO-level roles across four countries. — `10-career.yaml`

## Theme G — open source and early-protocol work

- Two PRs merged into CopilotKit (36.1k stars): an eight-agent demo contributed
  into the official `demos_2025` folder, and Claude Code setup instructions added
  to the MCP server guide. — `work[copilotkit]`
- Recruited onto Anthropic's Partner Network architect track after Engram's
  founder asked his own Claude agent to surface architects and this open-source
  portfolio was the match — publicly confirmed by the founder. — `work[engram]`
- echook: one canonical hook-event source shipped to three harnesses (Claude
  Code, Cursor, Codex) with CI-enforced no-drift, 248 unit tests on a 3-OS ×
  3-Python matrix, and zero third-party runtime dependencies. — `projects[echook]`

---

## Third-party quotes

Verbatim from `50-references.yaml`. Use **at most one** per letter, and only
when the quote says something the letter cannot say about itself. Always
attribute with name and the relationship.

- **Saba Gecgil, Founder & CEO, GAVIGO (managed Chan directly):** "What stands
  out about Chan is not only her technical ability, but the way she turns
  ambiguous founder-level direction into working systems, measurable proof, and
  reliable product surfaces." — also: "She ships quickly, but she also documents,
  tests, and pushes for technical honesty. If something is unsafe to expose, she
  says it clearly."
- **Chaste Christopher Inegbedion, Chief Period Officer, Sanicle (managed Chan):**
  "She played a pivotal role in securing our IBM MVP and its successful
  deployment." *(Quote it verbatim if used — but note that `pivotal` is on the
  banned-words list for Chan's own prose, so never paraphrase it into your own
  sentence.)*
- **Paige Afanu, CEO, Sanicle (managed Chan):** "As a solo developer, she took on
  the monumental task of coding the entire website and parts of the platform from
  scratch."
- **Gabrielle J. Hurst, CXO, Sanicle:** "She embeds data privacy into the core
  architecture, ensuring that client agency, trust, and resilience are never
  afterthoughts." — pairs with Theme D.
- **Nirmala Chinnappan, She Sharp:** names the stack independently — "She
  architected and developed the new She Sharp website using technologies such as
  Next.js 15, Tailwind CSS, PostgreSQL, and Drizzle ORM." Useful when a reader
  needs the tech claims corroborated by someone other than Chan.
- **Lesley Gao, She Sharp website team (the other committer):** "She is also
  proactive in proposing automation tools that improve efficiency for the team",
  and "confident enough to push back on ideas that may not make sense, always
  with thoughtful explanations or better alternatives."
- **Suliat Alaga, TechNest co-founder:** "The feedback from our mentees was
  overwhelmingly positive, with many highlighting how much confidence and clarity
  they gained through her sessions." — the teaching outcome attested by the
  organisation rather than by a learner.
