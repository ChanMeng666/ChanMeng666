// ─────────────────────────────────────────────────────────────────────────────
// Chan Meng — ATS / machine-parseable resume.
//
// SINGLE COLUMN. No images, no grids, no tables, no columns, no colour, no
// italics, no icons, no header/footer. Black text on white, exactly one linear
// reading order. Full-width hairline rules under section headings and
// underlined links ARE allowed: a full-width horizontal rule cannot be read as
// a column boundary, and every link's visible text is still the bare URL or
// the company/project name, so the extracted text stream is unchanged.
//
// ORDER: roles Chan is STILL DOING come first, ranked by importance, then the
// ended ones. ArchCanvas (her own company) leads; GAVIGO ended Sep 2026.
//
// TWO PAGES IS THE BUDGET. Everything here is sized to it:
//   • Seven roles carry bullets — one each, except She Sharp, which carries
//     two (its second result will not compress into one sentence without losing
//     a metric, and splitting beats trimming here).
//     The three CURRENT ones (ArchCanvas, She Sharp, FemTech Weekend) lead;
//     GAVIGO, TechNest, Engram and Sanicle follow, ended but each carrying a
//     result worth a bullet. The three oldest roles are single-line entries
//     under "Earlier experience" — title, org, location and dates are all still
//     present and delimited, so a parser extracts them as employment exactly
//     the same way; only the prose is gone.
//     TechNest carried a SECOND bullet for the teaching platform until Sep 2026.
//     That platform is now a PROJECTS entry instead — it is Chan's own product,
//     taught from by TWO separate organisations, not something built for that
//     employer — so do not re-add the bullet here.
//   • Job title and dates share two lines, not three (dates ride the org line
//     behind a "|"). Contact items share two delimited lines, not seven.
//   • Every bullet is ONE sentence. A bullet that grows to two sentences gets
//     split into two bullets or trimmed — the metric is never what goes.
//     cv/verify-ats-exports.py::EXPECTED_BULLETS counts bullets, so a split is
//     a deliberate change, not a silent one.
// Before adding anything, decide what comes out. Check the page count.
//
// NOT a published surface. Output → cv/exports/chan-meng-cv-ats.pdf (tracked in
// git, deliberately OUTSIDE /public so it is never web-served). Manual upload
// to job portals only. The designed two-column CV stays canonical:
// public/chan-meng-cv.pdf.
//
// HARD CONSTRAINTS (see cv/README.md "ATS variant — hard rules"):
//   • Dates MUST use 3-letter months: "Mar 2025 - Feb 2026", never "March".
//     scripts/check-cv-sync.mjs derives the expected range via fmtMonth().
//   • Each role entry: one argument per line, the four quoted fields
//     (title / org / org-url / dates) BEFORE the bullets array, closing ")" on
//     its own line. The drift guard's regex depends on that shape. Never write
//     the literal call name followed by "(" in a COMMENT — the guard's regex
//     is not comment-aware and would parse it as a phantom entry.
//   • Every `org:` string must have a CV_ORG_TO_WORK entry in
//     scripts/check-cv-sync.mjs. Roles with no work[] id use extra-role(...).
//   • In markup, "@" starts a label reference and "~" is a non-breaking space —
//     write them as \@ and \~ (cv/TYPST_PITFALLS.md §9, §10).
//
// Build: pwsh cv/build.ps1
// ─────────────────────────────────────────────────────────────────────────────

#import "ats-components.typ": *

#set document(
  title: "Chan Meng — Resume",
  author: "Chan Meng",
  // PINNED, not `auto` and not `none`. A date must be PRESENT: a PDF carrying
  // no /CreationDate and no /ModDate is a known trip-hazard for legacy resume
  // parsers, and it was the clearest structural difference between this file
  // and the designed CV when Lever returned "Couldn't auto-read resume" on an
  // upload of THIS pdf (2026-08-03). Pinning still keeps what `date: none` was
  // protecting: this PDF is COMMITTED, so identical input must produce
  // identical bytes or every rebuild is a diff.
  //
  // Bump this BY HAND when the resume's CONTENT changes — it is the document's
  // revision date, not the build's wall clock. Do NOT switch to `auto`, and do
  // NOT move it to a `typst compile --creation-timestamp` flag in build.ps1:
  // that would split one fact across two files and make a bare `typst compile`
  // produce a different PDF. cv/build-ats-exports.mjs PARSES this line and
  // reuses it for the .docx core properties, so it stays one fact in one file.
  date: datetime(year: 2026, month: 9, day: 4),
  // NO keywords: on purpose. The 70-term list in chan-meng-cv.typ is plainly
  // legible in `pdfinfo` and reads as keyword stuffing to an AI screener —
  // the same class of anti-pattern cv/README.md already bans. Everything that
  // should be matched here is visible text.
)

#set page(paper: "a4", margin: 1.6cm, header: none, footer: none, numbering: none)

// 1.6cm ≈ 0.63in still clears the "within 0.5in of the page edge =
// header/footer, discard" heuristic several legacy parsers apply. Do not go
// below 1.5cm — past that the margin itself starts reading as a header band.

#set text(
  font: "DM Sans",   // vendored via --font-path cv/fonts → deterministic on CI
  size: 10pt,        // the floor: below ~9.5pt, OCR-fallback parsers degrade
  fill: black,       // pure #000000, not the brand ink #070607
  lang: "en",
  // Only disables AUTOMATIC hyphenation — see the box() show rule below for the
  // explicit-hyphen half of the problem.
  hyphenate: false,
  features: (liga: 0),
)
// Straight ASCII quotes and apostrophes instead of typographic ones.
#set smartquote(enabled: false)

// Within-bullet leading 0.68em → 6.8pt at 10pt; between-bullet spacing 8.5pt.
// See the spacing ladder at the top of ats-components.typ.
#set par(leading: 0.68em, spacing: 0.90em, justify: false, first-line-indent: 0pt)

// Typst 0.15 emits a PDF structure tree by default (verified: `pdfinfo` reports
// Tagged: yes), so a native `= HEADING` becomes a real /H1 element — the
// strongest section signal available to a modern parser.
#set heading(numbering: none)
#show heading.where(level: 1): set text(size: 11.5pt, weight: "bold")
// The heading's OWN margins must be near-zero: the wrapper block below owns the
// section gap. Leaving them non-zero would push the rule away from its heading
// (block margins are max-not-sum against par.spacing).
#show heading.where(level: 1): set block(above: 0pt, below: 3pt)
// Attach the hairline by RE-EMITTING `it` inside a wrapper rather than
// rebuilding the heading from its .body — the original element stays in the
// frame, so its /H1 tag survives. breakable: false keeps a heading and its rule
// on the same page. Verified with pypdf (7 headings → 7 /H1 elements) after
// every change to this rule.
#show heading.where(level: 1): it => block(
  above: gap-section, below: gap-rule, breakable: false,
  { it; hrule() },
)

// ASCII hyphen-minus markers, one level only. Nested lists are where
// indentation-based parsers lose hierarchy or merge lines.
#set list(marker: [-], indent: 0pt, body-indent: 7pt, spacing: 8pt)

// Links are real and clickable. Underlined in the same black as the body text
// so the affordance is visible without introducing colour — a reader should
// never have to guess what is clickable, and should never have to retype a URL.
#show link: it => underline(stroke: 0.4pt + black, offset: 2.5pt, evade: false, it)

// `hyphenate: false` only disables AUTOMATIC hyphenation. Typst still treats an
// EXPLICIT hyphen as a line-break opportunity, and pdftotext then reads a
// hyphen sitting at a line end as a soft hyphen and DELETES it. Measured on the
// first build of this very file: "web-vitals" extracted as "webvitals",
// "multi-user" as "multiuser", "gpt-5.4-mini" as "gpt-5.4mini" — three silent
// keyword losses. Boxing every hyphenated compound removes the break
// opportunity inside it, so a hyphen can never land at a line end. Every token
// this matches is far shorter than the measure, so nothing overflows.
// Re-verify by grepping the extraction, never by eye.
#show regex("[\w.]+(-[\w.]+)+"): it => box(it)

// ═══ IDENTITY + CONTACT ══════════════════════════════════════════════════════
// Unlabelled by convention — parsers expect the name block first, with no
// heading above it. Contact items were one-per-line in the 4-page draft; at two
// pages they share two lines. That is safe because the separator is an explicit
// " | ": the failure mode measured in the designed CV was items running
// together with nothing but whitespace between them
// ("chanmeng.career@gmail.com +64 028 8510 9245 Auckland, New Zealand ...").
#block(above: 0pt, below: 5pt, breakable: false, {
  text(size: 17pt, weight: "bold")[Chan Meng]
  linebreak()
  v(1.5pt)
  [AI Agent Architect | Full-stack Engineer | AI Tooling Engineer]
})
#block(above: 0pt, below: 7pt, breakable: false, {
  link("mailto:chanmeng.career@gmail.com")[chanmeng.career\@gmail.com]
  [ | ]
  link("tel:+642885109245")[+64 28 8510 9245]
  [ | Auckland, New Zealand]
  linebreak()
  link("https://chanmeng.org/")[chanmeng.org]
  [ | ]
  link("https://www.linkedin.com/in/chanmeng666/")[linkedin.com/in/chanmeng666]
  [ | ]
  link("https://github.com/ChanMeng666")[github.com/ChanMeng666]
})
#hrule()

// ═══ SUMMARY ═════════════════════════════════════════════════════════════════
// "Introduction" is not in any parser's section lexicon; "Professional Summary"
// is. Same rule drives every heading in this file.
= PROFESSIONAL SUMMARY

AI and full-stack engineer who has shipped MCP servers, sub-agents, and agent
skills to production, behind paying customers, private health data, and
regulated work, not demos. Has run five concurrent engineering and CTO-level
roles across four countries. Works AI-native by default, directing coding agents and
building on the Claude Agent SDK.

// ═══ SKILLS ══════════════════════════════════════════════════════════════════
// The designed CV splits this across three custom-named sidebar sections
// ("What I Bring to a Team", "AI Engineering & Tooling", "Stack"), none of
// which a parser recognises. Merged here into the one name every parser knows,
// and placed before Experience to front-load the keyword block. Five rows, not
// nine — each row is a keyword payload, so rows were merged rather than cut.
= TECHNICAL SKILLS

#skills-line("AI and agent engineering", (
  "Claude Agent SDK", "OpenAI Agents SDK", "Model Context Protocol (MCP)",
  "LangGraph", "LangChain", "CopilotKit", "Vercel AI SDK",
  "RAG pipelines", "multi-agent orchestration",
  "JSON Schema outputs", "prompt caching",
  "model-tier routing with fallback", "evaluation harnesses",
  "mcp-evals",
))
#skills-line("Languages and frameworks", (
  "TypeScript", "Python", "Go", "Java", "SQL", "Next.js 16", "React",
  "React Native", "Vue 3", "Spring Boot 3", "FastAPI", "TailwindCSS",
  "Drizzle ORM", "Zod",
))
#skills-line("Claude Code and Codex CLI", (
  "CLAUDE.md", "Agent Skills", "Subagents", "Hooks", "Status line", "Plugins",
  "AGENTS.md", "sandbox and approval policies", "headless mode",
))
// Name the GENERATION, not just the family: "Claude Opus" alone reads as a
// model Chan last used in 2025. Mirrors the designed CV's Stack > Models row.
#skills-line("Models", (
  "Anthropic Claude Opus 5, Sonnet 5, Haiku 4.5",
  "OpenAI gpt-5.5, GPT-4o, realtime", "Gemini", "Llama",
))
#skills-line("Infrastructure, data, and quality", (
  "Neon Postgres", "Supabase", "Redis", "Cloudflare Workers", "Docker", "Stripe",
  "NextAuth 5", "Vitest",
  "Cypress", "web-vitals", "OpenTelemetry", "multi-tenant isolation",
  "CI/CD pipelines",
))

// ═══ EXPERIENCE ══════════════════════════════════════════════════════════════
// Ten employers, all machine-extractable. SIX mirror the designed CV's detailed
// entries; the other four are PROMOTED here out of the italic "Previously:"
// run-on sentence in cv/sections/experience.typ — Sanicle as a full entry with a
// bullet, ByteDance, CORDE and Forward with Her as compact one-liners. A parser
// cannot extract employment from prose, so all four are invisible to every
// machine reader of the designed CV.
//
// THE SANICLE ASYMMETRY IS DELIBERATE — DO NOT "RECONCILE" IT. The designed CV
// moved Sanicle (CTO, ended Feb 2026) down into that prose line in Sep 2026 to
// free a slot for a fourth project card. Making this file match would delete a
// real CTO job from every machine reader — the exact failure this variant exists
// to prevent. cv/sections/experience.typ carries the same note on its side.
//
// Every title below is a token-subset of the matching work[].position in
// data/profile/10-career.yaml so scripts/check-cv-sync.mjs stays quiet. The
// Sanicle warning ("Chief Technology Officer" vs "CTO (prev. ...)") is
// pre-existing and shared with the designed CV.
= PROFESSIONAL EXPERIENCE

#role-line(
  title: "Founder & Sole Engineer",
  org: "ArchCanvas",
  org-url: "https://archcanvas.uk/",
  dates: "Apr 2026 - Present",
  location: "Auckland, New Zealand",
  arrangement: "Remote",
  bullets: (
    [Build an AI design agent for architects and self-builders: invented ArchLang, the open-source language that compiles a floor plan into a dimensioned drawing (34 npm releases, 83 diagnostic codes), then built the commercial product on top so an edit is exact and replayable rather than regenerated.],
  ),
)

#role-line(
  title: "Senior Full-Stack Engineer & Website Team Lead",
  org: "She Sharp",
  org-url: "https://www.shesharp.org.nz/",
  dates: "Jul 2025 - Present",
  location: "Auckland, New Zealand",
  arrangement: "Hybrid",
  bullets: (
    [Recruited by founder Dr Mahsa Mohaghegh to move a volunteer-run New Zealand women-in-STEM charity (96+ events since 2014) off rented software onto infrastructure it owns: sign-ups, memberships, events, and mentor matching scored by GPT-4o-mini across five weighted dimensions with a rule-based fallback: 1,381 commits, 251 merged pull requests and 94.5% of all lines added across 13.3 months.],
    [Rewrote its recurring work as 11 agent skills, 25,643 lines of written-down procedure, version-controlled and type-checked in CI, so non-engineers now run work that once needed an engineer.],
  ),
)

#role-line(
  title: "Chief Technology Officer",
  org: "FemTech Weekend",
  org-url: "https://www.femtechweekend.com/",
  dates: "Mar 2025 - Present",
  location: "Chengdu, Sichuan, China",
  arrangement: "Remote",
  bullets: (
    [Sole engineer behind China's first organisation built around women's health technology, across two platform generations (Next.js, then Docusaurus), and ran the digital infrastructure for the 2026 Shanghai Summit: four days, 20 speakers, headlined by Ida Tin, who coined the term FemTech.],
  ),
)

#role-line(
  title: "Founding Principal Engineer, Activation, Execution & AI Systems",
  org: "GAVIGO Inc.",
  org-url: "https://gavigo.com/",
  dates: "Oct 2025 - Sep 2026",
  location: "Wilmington, Delaware, United States",
  arrangement: "Remote",
  bullets: (
    [Owned the Intelligence Layer of an app-activation platform: a Go orchestrator running a seven-trigger AI rules engine, a warm-pool manager and a five-state activation spine in Redis, on live Kubernetes (GKE): sub-millisecond p50 restore, an 84.6% warm-pool hit rate and zero errors at 100 concurrent WebSocket clients; migrated DigitalOcean to Google Cloud in a 30-minute cutover; promoted from Core Engineer across three contracts, 471 of 488 commits solo.],
  ),
)

#role-line(
  title: "AI Instructor & Mentor",
  org: "TechNest Community",
  org-url: "https://www.technestcommunity.com/",
  dates: "Apr 2026 - Aug 2026",
  location: "St John's, Newfoundland, Canada",
  arrangement: "Remote",
  bullets: (
    [Sole instructor of TechNest's first AI track, its fifth cohort since 2024: in 12 weeks students went from browser ChatGPT to directing coding agents, and 30 graduated having shipped 6 multi-user AI products.],
  ),
)

#role-line(
  title: "AI Agent Architect",
  org: "Engram",
  org-url: "https://engram.media/",
  dates: "May 2026 - Jul 2026",
  location: "Albuquerque, New Mexico, United States",
  arrangement: "Remote",
  bullets: (
    [Recruited onto Anthropic's Partner Network architect track when the founder's Claude agent surfaced this portfolio; completed the 45-day Architect Cohort, contributing to its agent, skill and MCP conventions.],
  ),
)

#role-line(
  title: "Chief Technology Officer",
  org: "Sanicle",
  org-url: "https://www.linkedin.com/company/sanicleofficial/",
  dates: "Mar 2025 - Feb 2026",
  location: "Tulsa, Oklahoma, United States",
  arrangement: "Remote",
  bullets: (
    [Joined as Senior AI/ML Infrastructure Engineer and was promoted to CTO; took the product from a no-code prototype to a multi-tenant B2B FemTech SaaS and integrated IBM watsonx behind a Gemini fallback, the work that earned Sanicle its IBM Silver Partner certification.],
  ),
)

// Earlier roles: one line each. Title, org, location and dates are all still
// present and delimited, so they parse as employment identically — only the
// prose is gone. This is where the 4-page draft lost two pages.
#block(above: gap-entry, below: 3pt, { strong("Earlier experience") })

#role-line(
  title: "Technology & Professional Development Mentor",
  org: "Forward with Her",
  org-url: "https://www.linkedin.com/company/taxing-mentorship/",
  dates: "Oct 2024 - Sep 2025",
  location: "China",
  compact: true,
)

#role-line(
  title: "Backend Developer",
  org: "ByteDance",
  org-url: "https://youthcamp.bytedance.com/",
  dates: "Nov 2024 - Mar 2025",
  location: "China",
  compact: true,
)

#role-line(
  title: "Full Stack Developer & Lead Documenter",
  org: "CORDE",
  org-url: "https://corde.nz/",
  dates: "Jun 2024 - Nov 2024",
  location: "Canterbury, New Zealand",
  compact: true,
)

// ═══ PROJECTS ════════════════════════════════════════════════════════════════
// Five independent projects Chan owns end to end, mirroring the designed CV's
// five cards. No project here duplicates a product built at an employer or at
// Chan's own company — those live in Experience. ArchCanvas used to lead this
// section; it moved up to Experience when ArchCanvas became a role rather than
// a side build. echook was promoted from the "Also built" line in Sep 2026 and
// must therefore no longer appear there. The AI Programming Education Platform
// arrived in Sep 2026 and is Chan's own product, not TechNest's — two separate
// organisations teach from it — so the TechNest entry above gave up its second
// bullet when this entry was added. One sentence each.
= PROJECTS

#project-entry(
  name: "Tam-AI-Ti",
  url: "tamaiti.whiri-ai.com",
  target: "https://tamaiti.whiri-ai.com/",
)[
  A te reo Māori and English AI financial-wellness app built solo on commission
  from Riria (Missy) Te Kanawa herself, not her employer ASB Bank: three composed
  OpenAI models, one a realtime voice coach, culture as typed schema (Maramataka,
  Te Whare Tapa Whā); a 19-user cohort produced 181 journal entries in 4 months.
]

#project-entry(
  name: "Vitex - AI Career Agent",
  url: "vitex.org.nz",
  target: "https://www.vitex.org.nz/",
)[
  Paste a job description, get a tailored resume and cover letter scored against
  its keywords in under 30 seconds, with Typst compiling the finished PDF
  locally in under 100 ms across 7 templates.
]

#project-entry(
  name: "Google News MCP Server",
  url: "github.com/ChanMeng666/server-google-news",
  target: "https://github.com/ChanMeng666/server-google-news",
)[
  An earliest-ecosystem Model Context Protocol server, shipped 35 days after
  Anthropic launched MCP and before a registry existed: a PulseMCP Top Pick, a
  Glama A-rating, and 126 GitHub stars.
]

#project-entry(
  name: "echook",
  url: "github.com/ChanMeng666/echook",
  target: "https://github.com/ChanMeng666/echook",
)[
  An AI-operated hooks plugin for Claude Code, Cursor IDE and Codex CLI,
  installed and driven entirely in natural language, grown from audio
  notifications into a context-window status line and session telemetry: the
  production work behind shipping every Claude Code extension surface.
]

#project-entry(
  name: "AI Programming Education Platform",
  url: "programming.chanmeng.org",
  target: "https://programming.chanmeng.org/",
)[
  A bilingual Docusaurus platform (211 of 220 commits) carrying five cohort
  versions of AI-programming teaching side by side, three concurrent in 2026, for
  TechNest's 2026 AI Track and academyEX's Her Waka, with a Cloudflare Workers RAG
  assistant doing version-aware retrieval over 4,800 chunks.
]

// Everything else Chan built, one descriptor each. A bare link tells a reader
// nothing and a keyword matcher almost nothing, so each carries the same
// explanation as the designed CV's italic closer line — in this file's register,
// and with the same limits on what may be claimed (the disability-led NZ
// organisation that set a11y-loop's problem validated it and is working it into
// its own development, with Chan advising: NOT a paid contract, not a formal
// partnership, not an endorsement, not a production deployment).
// Nothing here may also appear above as a project entry — each project appears
// exactly once across the document.
#block(above: 0pt, below: 0pt, {
  strong("Also built: ")
  [#link("https://eatropolis.co.nz/")[eatropolis.co.nz] (Auckland's official culinary festival, commissioned by Chow Luck Club Ltd with Auckland Council's agency Tātaki Auckland Unlimited),
  #link("https://gradient-svg-generator.vercel.app/")[gradient-svg-generator] (355 SVG templates),
  #link("https://github.com/ChanMeng666/a11y-loop")[a11y-loop] (an accessibility CLI and Claude Code skill, validated by the disability-led New Zealand organisation that set the problem), and #link("https://seismophone.chanmeng.org/")[Seismophone] (the first public Suno remix-lineage explorer).]
})

// ═══ EDUCATION ═══════════════════════════════════════════════════════════════
= EDUCATION

#education-entry(
  degree: "Master of Applied Computing",
  school: "Lincoln University, New Zealand",
  school-url: "https://www.lincoln.ac.nz/",
  dates: "Nov 2023 - Dec 2024",
  note: "Distinction, Dean's List (Top 5%)",
)

#education-entry(
  degree: "Bachelor of Geography Science",
  school: "Jiangsu Normal University, China",
  school-url: "http://www.jsnu.edu.cn/",
  dates: "Sep 2012 - Jun 2016",
  note: "Distinction",
)

// ═══ CERTIFICATIONS ══════════════════════════════════════════════════════════
// "Certifications & Training" occasionally splits a section classifier on the
// ampersand; "Certifications" is the lexicon entry.
= CERTIFICATIONS

#skills-line("Anthropic (6)", (
  "Building with the Claude API", "Intro to MCP",
  "Intro to Agent Skills", "Claude Code in Action",
  "AI Fluency: Framework and Foundations",
  "Claude Certified Architect (Foundations): practice exam passed",
))
#skills-line("Other (50+ total)", (
  "Google AI Essentials", "Microsoft Azure AI Essentials",
  "HackerRank Software Engineer plus 22 skill certifications",
))

// ═══ AWARDS ══════════════════════════════════════════════════════════════════
// "Recognition" alone is weakly recognised; spell out "AND". The four stat
// pills from the designed CV's header land in the last line — as pills they
// extract as one unreadable run.
//
// FemTech China and FemTech Weekend are TWO DISTINCT organisations with two
// distinct awards. They may share a line, but never merge into one award.
= AWARDS AND RECOGNITION

- UN CSW 69 Speaker (by video link), UN Headquarters, New York, Mar 2025 — drew IBM pilot interest and an endorsement from Sierra Leone's Minister of Gender and Children's Affairs.
- Outstanding Mentor Award, Aotearoa AI Hackathon Festival, won in 2025 (1 of 14 mentors) and again in 2026, a second consecutive year; Excellence Award, FemTech China Women's Health Technology Challenge (Dec 2024); Outstanding Performer, UN Women FemTech Hackathon, Beijing (Mar 2025).
- Community: 480+ GitHub stars on own repos, 26 LinkedIn recommendations, 2 merged CopilotKit PRs.
