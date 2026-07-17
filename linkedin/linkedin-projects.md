<!-- GENERATED from linkedin-profile.json by scripts/build-linkedin-md.mjs — DO NOT EDIT BY HAND. -->
<!-- Edit the JSON (the source of truth) and re-run the script. -->

# LinkedIn — Projects

## 1. Eatropolis — Auckland Culinary Festival Platform (Chow Luck Club × Tātaki Auckland Unlimited)

**Dates:** May 2026 – Present
**Other contributors:** yes

```
The official event website for Eatropolis — Auckland's award-winning culinary festival, at Shed 10 on Queens Wharf on 10 October 2026. Visitors buy tickets, browse the chef lineup, read the programme, and can ask a streaming AI host on the page for guidance instead of digging through nav.

Solo-built freelance commission under a signed 4 May 2026 agreement with Chow Luck Club Ltd (Director Bee Keng Koh; PM Armand Bentigan). Event partner: Tātaki Auckland Unlimited (Auckland Council).

• Engineered for 1,000 concurrent visitors under k6 load testing per contract.
• Hardened to NZ Government Web Accessibility Standard 1.2 (WCAG 2.2 AA) with Tātaki Auckland Unlimited review gates before each launch phase.
• Streaming OpenAI chat + Whisper + TTS gated behind Cloudflare Turnstile and per-IP KV rate-limiting.
• GitHub-as-CMS so the non-technical client edits MDX directly in-browser via one-click web-editor links.
• 115 solo commits in 9 days.

Stack: Next.js 16, OpenNext-on-Cloudflare-Workers, Drizzle + Neon Postgres, Resend, OpenAI streaming.
```

**Skills:** Next.js, Cloudflare Pages / Workers, OpenNext, Drizzle ORM, Neon Postgres, OpenAI API

## 2. Seismophone — Trilingual Suno Music-Lineage Explorer (EN / CN / JP)

**Dates:** undefined

```
Seismophone is an independent observatory for AI music that maps how a Suno-generated song's lineage descends from its parent. Suno is the AI music platform; its own product doesn't expose lineage to creators. Seismophone does, because the research behind it discovered that Suno's API serializer leaks the parent→child UUID chain only on the trending feed and persona sub-trees — nowhere else, not even on the remix page.

• Three open public lenses (creator profiles, trending, lineage view) + single-purchase deep-dive reports, each a deterministic analysis of one creator's own catalog.
• Lineage traversal uses WITH RECURSIVE CTEs in Postgres so the graph walk happens at the database, not the application layer.
• Trilingual EN / CN / JP with cookie-driven server-resolved locale.
• oEmbed-discovered compliance posture; no scraping, no headless browsers.
• 46 solo commits across one month — same-day scaffold-to-live, then production hardening: Stripe webhook verification and a credits ledger that auto-switches keys by STRIPE_SECRET_KEY prefix.

Stack: Next.js 16, Drizzle + Neon Postgres, Stripe, Resend, Docker + Traefik VPS.
```

**Skills:** Drizzle ORM, Internationalization (i18n), Next.js, Neon Postgres, Stripe, Docker, PostgreSQL

## 3. Vitex — AI Career Agent SaaS (vitex.org.nz)

**Dates:** Feb 2026 – Present

```
Vitex turns a job description plus a candidate's background into an ATS-optimised resume PDF and matching cover letter in about 30 seconds. The user pastes a job ad, uploads their existing CV, and an 8-step AI pipeline streams the tailored documents back. A natural-language refinement box then lets them iterate — "make the leadership section stronger" — and the AI regenerates just that slice.

• Pipeline: JD parsing → background parsing → match analysis → resume tailoring → ATS scoring → cover letter → template render (Typst source) → PDF compile, streamed via SSE.
• Typst compiles each PDF locally in under 100ms — the user sees the document before finishing the reasoning summary.
• Three production migrations (including a LaTeX → Typst engine swap) shipped with zero outage.
• Stripe credit ledger; public shareable links via per-document tokens for organic distribution.

Stack: Next.js 15, Vercel AI SDK + gpt-5.5 (reasoning) / gpt-5.4-mini (extract), Typst, Stripe, Neon Postgres + Drizzle, Docker + Traefik on DigitalOcean.
```

**Skills:** Vercel AI SDK, Typst, Next.js, Stripe, Neon Postgres, Drizzle ORM, Docker

## 4. ArchLang — A Programming Language I Invented That Compiles to Professional Floor Plans

**Dates:** Jun 2026 – Present

```
ArchLang is a programming language I designed for architecture: you write a floor plan as code — walls, rooms, doors, windows, fixtures, dimensions — and it compiles to deterministic, professional SVG (also DXF, PDF, PNG, text). Think Typst or LaTeX, but for building plans instead of documents.

• Hand-written lexer + recursive-descent parser in pure TypeScript with zero runtime dependencies — the same compiler runs in Node and in the browser.
• Exports structured diagnostics instead of throwing, with lint / describe / repair pipelines for architectural-soundness checking and circulation analysis.
• Ships a CLI with JSON output built for AI agents, plus VS Code / LSP tooling and a live browser playground.
• Published to npm as @chanmeng666/archlang with its own documentation site.

Stack: TypeScript, Node.js, Vite, CodeMirror 6, LSP, Vitest.
```

**Skills:** TypeScript, Programming Language Design, Node.js, Compiler Design, Language Server Protocol (LSP), CodeMirror, Vitest

## 5. ArchCanvas — AI Design Agent for Architects That Productizes ArchLang

**Dates:** Jun 2026 – Present

```
ArchCanvas turns my ArchLang language into a product for architects. Describe a brief (or drop in reference images) and it generates real SVG floor plans through the ArchLang compiler plus gpt-5.5 orchestration + GPT Image 2 renderings grounded on the compiled plan, then lets you iterate on an infinite zoomable canvas with an AI review mode that leaves anchored findings you can fix in one click.

• Sister product to my ArchLang language — consumes @chanmeng666/archlang as a package, so it produces editable parametric plans, not just images.
• AI review mode surfaces anchored findings directly on the canvas with one-click "have AI fix".
• Export any project as a real git repo (isomorphic-git + memfs).
• Refinement mutates the plan in place — edits, parametric tweaks and re-renders never regenerate it from scratch.

Stack: Next.js, React 19, Vercel AI SDK + OpenAI (gpt-5.5 + GPT Image 2; GPT-4o for vision), @chanmeng666/archlang, Neon Postgres + Drizzle, Stripe, Cloudinary.
```

**Skills:** Vercel AI SDK, AI Agent Architecture, Next.js, React, OpenAI API, Neon Postgres, Drizzle ORM, Stripe, Cloudinary

## 6. echook — Audio Notification Hooks for Claude Code / Cursor / Codex CLI

**Dates:** Nov 2025 – Present

```
echook adds audio cues to AI coding assistants so you stop staring at the terminal waiting for them to finish. Thirty-seven hook events — task started, permission needed, build failed, agent stopped, rate-limit hit, context nearing 100% — each play a sound and optionally fire Slack / Discord / Teams / ntfy webhooks. Same product on Claude Code, Cursor IDE, and Codex CLI. Install via natural language ("install echook with the Focus Flow theme").

• 42 releases, 248 tests on triple-platform CI (Ubuntu / Windows / macOS × Python 3.9 / 3.12 / 3.13). 37 hook events, 2 themes.
• Context-window status line with live quota bars — see remaining budget without alt-tabbing.
• Explicitly preserved as the author's IP in the Engram Architect Cohort Engagement Letter (9 May 2026); Engram is in Anthropic's Partner Network.
• Sister repo echook-promo-video: 88.7-second product film built in React + Remotion + AI-generated audio — zero Premiere, zero voice actors.

Stack: Python 3.6+, Claude Code Plugin SDK, ElevenLabs TTS, webhooks, GitHub Actions CI.
```

**Skills:** Claude Code Plugins, Cursor IDE Hooks, Codex CLI Integration, Python (Programming Language), ElevenLabs TTS, Webhooks, GitHub Actions

## 7. She Sharp Member Platform — AI Mentor-Matching SaaS for NZ's Largest Women-in-Tech Community

**Dates:** Jul 2025 – Present
**Associated with:** She Sharp
**Other contributors:** yes

```
The member-lifecycle platform that now runs She Sharp — NZ's largest women-in-tech community (charitable trust CC57025; 2,200+ members, 1,000+ active, 50+ corporate partners, 84+ events since 2014). Members get matched to mentors by an AI scoring engine with admin approval, browse events, pay through Stripe; the volunteer team gets automated Slack digests instead of doing it by hand.

• AI mentor–mentee matcher: GPT-4o-mini scoring pairs across five weighted dimensions (Skill 35%, Goal 30%, MBTI 15%, Industry 10%, Logistics 10%) with explainable reasons and a rule-based fallback; admin as final gate.
• 793 of 936 commits solo (85%) across ~12 months. Frontend designer Lesley Gao authored 140 (15%).
• Slack ecosystem: weekly stats digest, NZ funding-opportunities crawler over six government sources, Claude Code skill that publishes new events with one dry-run-default command.

Stack: Next.js 15, Drizzle + Neon Postgres, NextAuth 5, Stripe, Slack, Vercel.
```

**Skills:** AI Matching Systems, Drizzle ORM, Next.js, Neon Postgres, NextAuth, Stripe, Slack API, Vercel

## 8. FemTech Weekend Gen-2 Platform — Docusaurus + Drizzle on Cloudflare Pages

**Dates:** Mar 2025 – Present
**Other contributors:** yes

```
The official site and submissions hub for FemTech Weekend — China's first women's-health-technology organisation — which delivered Shanghai Summit 2026 (June 22–25). 20 confirmed speakers were headlined by Ida Tin, the Clue co-founder who coined the term "FemTech" in 2016.

Gen-2 was a deliberate rewrite from Next.js to Docusaurus when the site's centre of gravity shifted from "marketing site" to "research publication and multi-event hub". Visitors today read original research reports (FemTech Market Map for Greater China; FemmeHealth Ventures Alliance), browse the speaker programme, and submit pitches / programme entries / speaker applications / ecosystem partnerships through four review pipelines.

• 534 of 564 commits solo (94.7%) over ~13.5 months.
• Bilingual EN / CN from day one — the non-technical founder Zhu Yihan edits the live site directly.
• 15 Cloudflare Pages Functions (~3,839 LOC) replace a separate backend; submissions + email + admin review run on edge serverless.

Stack: Docusaurus 3.9, React 18, Drizzle + Neon Postgres, Cloudflare Pages, Resend, Notion-as-CMS.
```

**Skills:** Bilingual Web Development, Cloudflare Pages / Workers, Docusaurus, React, Drizzle ORM, Neon Postgres, Notion API

## 9. programming.chanmeng.org — 5-Cohort Bilingual AI Programming Teaching Platform with RAG Assistant

**Dates:** Oct 2024 – Present
**Associated with:** TechNest Community

```
The bilingual teaching site behind every AI programming cohort I've run since late 2024 — Forward with Her (2024-winter, 2025-summer), Her Waka 2026 (NZ Ministry of Social Development funded, at academyEX Auckland), Peyvand Academy 2026, and TechNest 2026 (Canada). All five cohorts coexist on one platform; each student gets their own version-aware course.

• In-course AI assistant: ~4,800 bilingual document chunks indexed with RAG (retrieval-augmented generation — the AI looks up the cohort's actual materials before answering, so students don't get hallucinations from the wrong version).
• 211 of 220 non-merge commits solo (~96%); the remainder are bot commits (Claude code-review automation + Dependabot).
• Notion-as-CMS classroom: course-wide message board, capstone-showcase page with live audience voting, Typst PDF handouts auto-built from MDX.
• Bilingual EN / CN with Algolia contextual search.

Stack: Docusaurus 3.8, Cloudflare Pages, Llama 3.1 8B via Cloudflare Workers AI + Vectorize, Notion API, Algolia, Typst.
```

**Skills:** Docusaurus, Retrieval-Augmented Generation (RAG), Cloudflare Pages / Workers, Cloudflare Workers AI, Notion API, Algolia, Typst

## 10. Tam-AI-Ti — Voice-First AI Financial-Wellness Coach (Te Whare Tapa Whā)

**Dates:** Sep 2025 – Apr 2026
**Other contributors:** yes

```
Tam-AI-Ti is a voice-first AI financial-wellness coach grounded in Te Whare Tapa Whā — the Māori model of holistic health where physical, mental, spiritual, and family wellbeing are inseparable from financial decisions. Users talk to the coach in te reo Māori or English; the coach reflects back in the same cultural frame, not as a Western budgeting app with a cultural wrapper.

Commissioned by Riria (Missy) Te Kanawa — former KPMG NZ Māori Sector Partner, now ASB Bank Māori Executive Lead — introduced by Dr Mahsa Mohaghegh.

• 351 solo commits over six months. 48-table / 494-column schema across 10 modules where every Hauora dimension is a typed column, not UI decoration: culture is in the schema.
• 19-user research cohort (Oct 2025 – Mar 2026): 181 bilingual journal entries, 35 voice sessions, 146 AI coach messages — sustained engagement on a pre-commercial product with zero marketing.
• Voice via GPT-4o-realtime with server-side VAD.

Stack: Next.js 15.5, React 19.1, Drizzle + Neon Postgres + pgVector (1536-dim), OpenAI (gpt-4o-mini / gpt-4o / gpt-4o-realtime), CopilotKit.
```

**Skills:** Voice AI (OpenAI Realtime), pgVector, Next.js, React, Drizzle ORM, Neon Postgres, OpenAI API, CopilotKit

## 11. Sanicle.AI — Multi-Tenant FemTech SaaS with IBM watsonx

**Dates:** Feb 2025 – Feb 2026
**Associated with:** Sanicle
**Other contributors:** yes

```
Sanicle.AI is the multi-tenant FemTech platform that lets US employers offer menstrual and menopause workplace-wellness support without forcing employees to expose anything personal to HR. Employees get a private dashboard for cycle tracking, AI consultations, and leave requests; HR Managers see only de-identified, aggregate analytics so they can plan around real health patterns instead of guesses.

• Integrated IBM watsonx (running Llama 3.1 405B) inside the employee dashboard — the engineering work that anchored Sanicle's IBM Silver Partner certification and PartnerPlus directory listing.
• Dual-AI resilience: watsonx primary, Google Gemini fallback when watsonx exceeds Vercel's function-timeout ceiling — no user sees a stalled assistant.
• ~98% solo across ~350 commits over 12 months. A NextAuth 5 auth-redirect production fix I published was acknowledged by Vercel Staff Amy Egan on the Vercel community forum.

Stack: Next.js 15, React 19, NextAuth 5, Drizzle + Neon Postgres, Upstash Redis, Vercel AI SDK, IBM watsonx + Google Gemini fallback.
```

**Skills:** Multi-Tenant Architecture, IBM watsonx, Next.js, NextAuth, Drizzle ORM, Neon Postgres, Upstash Redis, Vercel AI SDK, Google Gemini
**Media:** `Sanicle-AI: Women's Health Platform for Workplace Wellness` · `screencapture-sanicle-ai-vercel-app-chat-36a2b38e-be71-4c62-a459-ff43cb6d5c7c-2025-03-10-21_31_22.png` · `screencapture-sanicle-ai-vercel-app-employee-dashboard-f13eaf10-0a5b-49cf-b943-c35de5f631b4-events-2025-03-10-21_29_11.png`  _(Show all 10 media)_

## 12. Sanicle.Cloud — Corporate Site with IBM watsonx Conversational Assistant

**Dates:** Apr 2025 – Feb 2026
**Associated with:** Sanicle
**Other contributors:** yes

```
Sanicle.Cloud is the public-facing website that introduces Sanicle's workplace-wellness products to employers, HR brokers, and journalists covering FemTech. Visitors can click through the standard sections (platform, solutions, team, ROI calculator, demo request) or just ask an embedded IBM watsonx-powered assistant in natural language and skip the navigation entirely.

• Recommended and executed the migration off Sanicle's legacy Bubble no-code site — the case was that no-code couldn't support enterprise authentication, multi-tenant data, watsonx integration, or Vercel-native CI/CD. The team accepted; the migration shipped solo.
• Built on Next.js 15 with watsonx (Llama 3.1 405B) as the conversational layer. The watsonx integration carried Sanicle into IBM's Business Partner Network and the PartnerPlus directory listing.

Stack: Next.js 15, React 19, TypeScript, Tailwind, IBM watsonx, Vercel.
```

**Skills:** Next.js, IBM watsonx, React, TypeScript, Tailwind CSS, Conversational AI, Vercel
**Media:** `screencapture-sanicle-cloud-2025-04-18-16_24_26.png` · `screencapture-sanicle-cloud-team-chan-meng-2025-04-18-16_28_20.png` · `screencapture-sanicle-cloud-demo-2025-04-18-16_27_59.png`  _(Show all 13 media)_

## 13. Google News MCP Server — Early-Ecosystem AI Tool-Use Server

**Dates:** Dec 2024 – Dec 2024

```
A Model Context Protocol (MCP — Anthropic's open standard that lets AI agents safely use real tools and data) server that gives AI assistants live access to Google News with topical categorisation, region/language targeting, and full-coverage drill-down. Used by people whose AI assistant needs to know what happened today, not what was true at the training cutoff.

• Shipped Dec 30, 2024 — 35 days after Anthropic's Nov 25, 2024 MCP launch. One of the earliest community MCP servers in existence.
• Carries the PulseMCP "Top Pick" badge with 26.1k visitors and a #1,105 global popularity rank; Glama gives it an A license rating.
• Listed across 15+ MCP catalogs (Smithery, mcp.so, Glama, PulseMCP, Awesome MCP Servers, MCP Server Finder, mcpservers.org, AgentSkillsHub, and more) and featured in three independent deep-dives, including Skywork AI's "AI Engineer's Guide".

Stack: TypeScript + Node.js + @modelcontextprotocol/sdk + SerpAPI; published as @chanmeng666/google-news-server on npm.
```

**Skills:** Model Context Protocol (MCP), TypeScript, Node.js, SerpAPI, npm Publishing
**Media:** `GitHub - ChanMeng666/server-google-news` · `2024-12-30 021446.png` · `2024-12-30 021524.png`  _(Show all 5 media)_

## 14. CORDE Mobile — Offline-First Field-Operations App (React Native)

**Dates:** Jun 2024 – Nov 2024
**Associated with:** CORDE
**Other contributors:** yes

```
A React Native field-operations app for CORDE — a 30+-year-old, 164-staff Canterbury civil-construction contractor whose crews work in rural areas where mobile coverage drops out. The tablet becomes the system of record at the moment of work: text + photos + GPS + timestamps captured locally, integrity-checked, and reconciled to CORDE's central Workbench platform on reconnection — including the awkward cases: duplicate IDs, partial sync, mid-batch drops.

• #1-most-prolific contributor on the codebase: 227 of 539 commits (42%), ahead of teammates Luke Shi (28.6%) and Xue Zheng (25.8%).
• Sole author of the team documentation repository (140 of 143 commits, 97.9%), built against 15 Workbench API specifications authored by Kullum Ladley.
• Still in active use today by CORDE's field crews; kept current through React Native upgrades and Android 16 KB page-size compliance.

Stack: React Native 0.83, TypeScript, Native Base, SQLite, native geolocation / camera / image-picker / file-system / secure keychain.
```

**Skills:** React Native, Offline-First Architecture, TypeScript, Native Base, SQLite, Mobile Application Development
**Media:** `CORDE Mobile Application: Revolutionizing Field Operations` · `1-1-LoginScreen.png` · `1-2-3-LoginScreen.png`  _(Show all 9 media)_

## 15. FreePeriod — Bilingual Period-Poverty Platform (Software + Hardware)

**Dates:** Nov 2024 – Nov 2024
**Other contributors:** yes

```
The public site for FreePeriod — a Guangzhou-incubated startup tackling period poverty through solar-powered emergency sanitary-pad dispensers, reproductive-health education, and policy advocacy. Visitors land on a bilingual page, locate the nearest free-pad dispenser on an interactive Google Maps directory, and read FreePeriod's policy briefs and partnership decks.

The site was the public artefact every judging panel clicked through during FreePeriod's six-award streak in 2024–25:

• Best Award, Japan 12th Int'l Conference on Social Sciences & Humanities
• Third Prize, HKUST Sustainable Smart Living Competition
• Best Social Media, China's inaugural FemTech Weekend Challenge
• First Prize, Shenzhen Nanshan Philanthropic Creative Star Contest
• Selected, Tencent Technology Venture Capital Program
• Selected, Tsinghua University SDG Open Innovation Marathon

53 commits, 100% solo. Stayed on after CTO tenure as long-term custodian and executed the Vercel → Cloudflare Pages migration in April 2026.

Stack: Next.js 15, TypeScript, Tailwind, Google Maps API, Cloudflare Pages.
```

**Skills:** Next.js, Internationalization (i18n), TypeScript, Tailwind CSS, Google Maps API, Cloudflare Pages / Workers
**Media:** `screencapture-free-period-website-vercel-app-2024-12-01-20_11_54.png` · `screencapture-free-period-website-vercel-app-products-2024-12-01-19_38_55.png` · `screencapture-free-period-website-vercel-app-impact-2024-12-01-19_39_15.png`  _(Show all 5 media)_
