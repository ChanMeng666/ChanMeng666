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
// TWO PAGES IS THE BUDGET. Everything here is sized to it:
//   • The five CURRENT roles carry bullets. Sanicle (ended Feb 2026, but CTO +
//     the IBM Silver Partner result) carries one. The three older roles are
//     single-line entries under "Earlier experience" — title, org, location and
//     dates are all still present and delimited, so a parser extracts them as
//     employment exactly the same way; only the prose is gone.
//   • Job title and dates share two lines, not three (dates ride the org line
//     behind a "|"). Contact items share two delimited lines, not seven.
//   • Every bullet is one sentence. If a role needs two, the second is cut, not
//     the metric.
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
  date: datetime(year: 2026, month: 8, day: 3),
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
#set par(leading: 0.68em, spacing: 0.95em, justify: false, first-line-indent: 0pt)

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
#set list(marker: [-], indent: 0pt, body-indent: 7pt, spacing: 8.5pt)

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

Full-stack and AI engineer building production software with paying customers,
private data, and regulated work behind it, not demos. Five concurrent
engineering and CTO-level roles across four countries, in women's health
technology, cultural technology, and startup infrastructure. Works AI-native by
default: directs coding agents and builds on the Claude Agent SDK, Model Context
Protocol (MCP), and agent skills.

// ═══ SKILLS ══════════════════════════════════════════════════════════════════
// The designed CV splits this across three custom-named sidebar sections
// ("What I Bring to a Team", "AI Engineering & Tooling", "Stack"), none of
// which a parser recognises. Merged here into the one name every parser knows,
// and placed before Experience to front-load the keyword block. Five rows, not
// nine — each row is a keyword payload, so rows were merged rather than cut.
= TECHNICAL SKILLS

#skills-line("Languages and frameworks", (
  "TypeScript", "Python", "Go", "Java", "SQL", "Typst", "Next.js 16", "React",
  "React Native", "Vue 3", "Spring Boot 3", "FastAPI", "TailwindCSS",
  "Drizzle ORM", "Zod",
))
#skills-line("AI and agent engineering", (
  "Claude Agent SDK", "OpenAI Agents SDK", "Model Context Protocol (MCP)",
  "LangGraph", "LangChain", "CopilotKit", "Vercel AI SDK", "RAG pipelines",
  "prompt caching", "model-tier routing", "evaluation harnesses", "mcp-evals",
))
#skills-line("Claude Code and Codex CLI (every extension surface shipped)", (
  "CLAUDE.md", "Agent Skills", "Subagents", "Hooks", "Status line", "Plugins",
  "AGENTS.md", "sandbox and approval policies", "headless mode",
))
#skills-line("Models", (
  "Anthropic Claude Opus, Sonnet, Haiku", "OpenAI gpt-5.5, GPT-4o and realtime",
  "Google Gemini 2.x", "Meta Llama 3.x",
))
#skills-line("Infrastructure, data, and quality", (
  "Kubernetes (GKE)", "Cloudflare Workers and Vectorize", "Neon Postgres",
  "pgvector", "Supabase", "Redis", "Docker", "Stripe", "NextAuth 5", "Vitest",
  "Cypress", "Lighthouse", "web-vitals", "OpenTelemetry",
  "multi-tenant isolation", "zero-downtime cloud migration", "CI/CD pipelines",
))

// ═══ EXPERIENCE ══════════════════════════════════════════════════════════════
// Nine employers, all machine-extractable. Six mirror the designed CV;
// ByteDance, CORDE, and Forward with Her are PROMOTED here from the italic
// "Previously:" run-on sentence in cv/sections/experience.typ — a parser cannot
// extract employment from prose, so those three are invisible to every machine
// reader of the designed CV. Here they are real dated entries, just compact.
//
// Every title below is a token-subset of the matching work[].position in
// data/profile/10-career.yaml so scripts/check-cv-sync.mjs stays quiet. The
// Sanicle warning ("Chief Technology Officer" vs "CTO (prev. ...)") is
// pre-existing and shared with the designed CV.
= PROFESSIONAL EXPERIENCE

#role-line(
  title: "AI Agent Architect",
  org: "Engram",
  org-url: "https://engram.media/",
  dates: "May 2026 - Jul 2026",
  location: "Albuquerque, New Mexico, United States",
  arrangement: "Remote",
  bullets: (
    [Recruited onto Anthropic's Partner Network architect track after the founder's Claude agent surfaced this open-source portfolio; completed the 45-day Architect Cohort, working through the Partner Network curriculum and contributing to the cohort's agent, skill and Model Context Protocol integration conventions.],
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
    [Sole instructor of TechNest's first AI-specialised mentorship track, the fifth teaching cohort delivered since 2024; over 12 weeks students went from browser ChatGPT to shipping a live multi-user AI product by directing coding agents. Graduated 30 students who shipped 6 deployed multi-user AI products. Also built the bilingual platform that hosts it, with an in-course RAG assistant on Cloudflare Workers.],
  ),
)

#role-line(
  title: "Founding Principal Engineer, Activation, Execution & AI Systems",
  org: "GAVIGO Inc.",
  org-url: "https://gavigo.com/",
  dates: "Oct 2025 - Present",
  location: "Wilmington, Delaware, United States",
  arrangement: "Remote",
  bullets: (
    [Own the intelligence layer of an app-activation platform: built the AI scheduler that pre-warms content on Kubernetes (GKE) so a tapped game resumes in under a millisecond, and moved the platform across clouds (DigitalOcean to GCP) with zero downtime. Promoted from Core Engineer to Founding Principal Engineer across three renewals, building nearly the whole system solo.],
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
    [Rebuilt the member platform for New Zealand's leading women-in-STEM charity (2,200+ registered members, 8,000+ women supported lifetime) — one system for sign-ups, events, and AI-scored mentor matching, carrying 10+ years of content across with zero broken inbound links, \~85% solo over a year.],
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
    [Sole engineer behind China's first women's-health-technology organisation; rebuilt its web platform twice as the mission grew, and ran the digital infrastructure for the 2026 Shanghai Summit, a four-day event with 20 speakers headlined by Ida Tin, who coined the term FemTech.],
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
    [Joined as Senior AI/ML Infrastructure Engineer and was promoted to CTO; took the company from a no-code prototype to production B2B FemTech SaaS, and personally integrated IBM watsonx — the work that earned Sanicle its IBM Silver Partner certification.],
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
// Independent work Chan owns end to end. No project here duplicates a product
// built at an employer — those live in Experience. One sentence each.
= PROJECTS

#project-entry(
  name: "ArchCanvas and ArchLang",
  url: "archcanvas.uk",
  target: "https://archcanvas.uk/",
)[
  An AI design agent for architects and self-builders: invented ArchLang, the
  open-source language that turns a floor plan into a precise program (34 npm
  releases, full editor tooling), then built the commercial product on top — so
  edits are exact, diffable, and replayable rather than regenerated.
]

#project-entry(
  name: "Tam-AI-Ti",
  url: "tamaiti.whiri-ai.com",
  target: "https://tamaiti.whiri-ai.com/",
)[
  A bilingual (te reo Māori and English) AI financial-wellness app built solo on
  commission from Riria (Missy) Te Kanawa, Māori Executive Lead at ASB Bank;
  culture is typed data in the schema (Maramataka phases, Te Whare Tapa Whā
  domains); a 19-user cohort produced 181 journal entries over 4 months.
]

#project-entry(
  name: "Vitex - AI Career Agent",
  url: "vitex.org.nz",
  target: "https://www.vitex.org.nz/",
)[
  Paste a job description, get a tailored resume and cover letter scored against
  its keywords in under 30 seconds; sole-authored over \~18 months, with Typst
  compiling the finished PDF locally in under 100 ms across 7 templates — no
  hosted Chromium, no third-party document service.
]

#project-entry(
  name: "Google News MCP Server",
  url: "github.com/ChanMeng666/server-google-news",
  target: "https://github.com/ChanMeng666/server-google-news",
)[
  An earliest-ecosystem Model Context Protocol server, shipped 35 days after
  Anthropic launched MCP and before a registry existed: a PulseMCP Top Pick, a
  Glama A-rating, and \~125 GitHub stars.
]

#block(above: 0pt, below: 0pt, {
  strong("Also built: ")
  [#link("https://github.com/ChanMeng666/echook")[echook] (notifications for
  Claude Code, Cursor, and Codex),
  #link("https://eatropolis.co.nz/")[eatropolis.co.nz] (Auckland food-festival
  platform, solo in 9 days),
  #link("https://gradient-svg-generator.vercel.app/")[gradient-svg-generator]
  (355 animated-SVG templates),
  #link("https://github.com/ChanMeng666/typst-claude-skill")[typst-claude-skill]
  (typesets this resume), and #link("https://seismophone.chanmeng.org/")[Seismophone].]
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

#skills-line("Anthropic (6, 2025-2026)", (
  "Building with the Claude API", "Introduction to MCP",
  "Introduction to Agent Skills", "Claude Code in Action",
  "AI Fluency: Framework and Foundations",
  "Claude Certified Architect: Foundations curriculum (Partner Network track)",
))
#skills-line("Other (50+ total)", (
  "Google AI Essentials", "Microsoft Azure AI Essentials",
  "GitHub Professional", "Docker Professional",
  "HackerRank Software Engineer plus 22 skill certifications including SQL (Advanced)",
))

// ═══ AWARDS ══════════════════════════════════════════════════════════════════
// "Recognition" alone is weakly recognised; spell out "AND". The four stat
// pills from the designed CV's header land in the last line — as pills they
// extract as one unreadable run.
//
// FemTech China and FemTech Weekend are TWO DISTINCT organisations with two
// distinct awards. They may share a line, but never merge into one award.
= AWARDS AND RECOGNITION

- UN CSW 69 Speaker, UN Headquarters, New York City, March 2025 — attracted IBM pilot interest and an endorsement from Sierra Leone's Minister of Gender and Children's Affairs.
- Outstanding Mentor Award, AI Hackathon Festival 2025 (1 of 14 expert mentors); Excellence Award, FemTech China Women's Health Technology Challenge, December 2024; Outstanding Performer, UN Women FemTech Hackathon, FemTech Weekend Beijing, March 2025.
- Community reach: 5,856 LinkedIn followers, 26 recommendations, 1,103 newsletter subscribers, 480+ GitHub stars, CopilotKit contributor (2 merged PRs).
