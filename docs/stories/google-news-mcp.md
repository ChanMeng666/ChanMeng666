---
id: google-news-mcp
title: Google News MCP Server
role: Creator and maintainer
period: "2024-12 – present"
status: production
kind: open-source-tool
repos:
  - ChanMeng666/server-google-news
live: https://www.npmjs.com/package/@chanmeng666/google-news-server
stack: [TypeScript, Node.js, "@modelcontextprotocol/sdk", stdio transport, SerpAPI, axios, npm, Docker]
stories: 6
publicEvidence: [datacamp-top-mcp-servers, pulsemcp-weekly-pulse]
privateEvidence: 0
diagrams: true
lastResearched: "2026-10-15"
sources:
  - data/profile/20-projects-flagship.yaml (google-news-mcp, incl. meta.x_brand.proofStrips and reach)
  - data/profile/25-contributions.yaml (mcp-get #62, awesome-mcp-servers #163, modelcontextprotocol/servers #445)
  - data/profile/30-recognition.yaml (publications: DataCamp, PulseMCP Weekly Pulse)
  - docs/STATE.md
  - ChanMeng666/server-google-news at a3e5cdd (src/, package.json, Dockerfile, smithery.yaml, manifest.json, llms.txt, docs/overview.md, CHANGELOG.md, git log)
  - the published npm tarball @chanmeng666/google-news-server@1.0.0; the v1.0.1 GitHub release (2026-10-15)
  - GitHub issues and pull requests on the repo; modelcontextprotocol/servers issue #76 and PR #445
  - GitHub API and npm downloads API, read 2026-10-15
  - third-party pages saved in the private media layer, 2026-10-15 (press, directories, scans, GitHub threads, forks, stargazers)
---

## In one breath

AI assistants such as Claude cannot answer "what happened today?" from what they
learned in training. I built a small open-source plug-in, a Model Context
Protocol server, that lets them search live Google News and get the articles
back sorted by topic. Its first commit landed 35 days after Anthropic launched
the protocol, it was on npm two days later, and it has since been listed across
15+ MCP directories and named no. 10 in DataCamp's "Top 10 MCP Servers &
Clients for AI Workflow Automation in 2026".

## The problem

Anthropic published the Model Context Protocol (MCP) on 25 November 2024: one
standard way for an AI client to call outside tools. In the first weeks the
catalogue was a handful of reference servers (filesystem, GitHub, Postgres,
search), and none of them answered questions about current events. A model
cannot know this morning's news, and asking it to browse a search engine gives
it pages of markup to read through.

What was needed was not a scraper but a tool shaped for a model as the caller:
a small, typed interface the client can describe to the model, results that
arrive already cleaned and grouped, and failures the model can read and act on.
It also had to install the way early MCP users installed things, through one
line of `claude_desktop_config.json`.

## What I built

A TypeScript server on the official MCP SDK, run by the AI client as a
subprocess over stdio. It exposes one tool, `google_news_search`, forwards the
call to SerpAPI's Google News engine, and returns the articles as plain text
grouped into five topics, newest first, with source, date, summary and link on
each. It is MIT licensed and published on npm as
`@chanmeng666/google-news-server`.

- **One tool, seven optional string parameters**: `q`, `gl` (country), `hl`
  (language), and four tokens (topic, publication, story, section) that let a
  model drill into a topic, a publisher or the full coverage of one story.
- **Validation before the network**: a TypeScript type guard rejects malformed
  arguments as a protocol error; upstream failures come back as a readable tool
  result.
- **Post-processing for the model**: results flattened from SerpAPI's nested
  shape, grouped (AI & Technology, Business, Science & Research, Healthcare,
  General) and sorted by date.
- **Ways in**: `npx -y @chanmeng666/google-news-server` from npm with
  `SERP_API_KEY` set, a Docker image built from the repository's Dockerfile,
  and a `.mcpb` bundle (not yet tested as a one-click install). Smithery also
  built it from `smithery.yaml` until the listing was withdrawn (gone by
  2026-10-15).
- **Readable by machines**: `llms.txt`, a `manifest.json`, schema.org
  `structured-data.json`, and since 2026-10 a one-screen README with the full
  text in `docs/overview.md` for the reader's own coding agent.

## Stories

### S1. Shipping into a protocol that was five weeks old

- **Kind**: delivery
- **Situation**: MCP launched on 25 November 2024. Its SDK was at 0.6, the
  directories that now index thousands of servers did not exist yet, and the
  official servers repository was where people looked.
- **What I did**: I made the first commit on 30 December 2024 against
  `@modelcontextprotocol/sdk` 0.6.1 and published version 1.0.0 to npm on
  1 January 2025, after moving the build output from `build/` to `dist/` and
  making the package installable with `npx`. The same days I opened listing
  pull requests: to `punkpeye/awesome-mcp-servers` (#163, where I also brought
  the Chinese and Japanese READMEs back in line with the English one), to the
  `mcp-get` registry (#62) and to the official `modelcontextprotocol/servers`
  README (#445). I turned on Renovate on 2 January, which moved the SDK to 0.7
  and then 1.x that same day.
- **Result**: The awesome-mcp-servers and mcp-get pull requests were merged on
  1 January 2025, the mcp-get one within an hour. PulseMCP featured the server
  in its Weekly Pulse newsletter as "a newly-released, well-documented approach
  to pulling news data into MCP clients like Claude". I closed the
  official-repository pull request myself on 9 January 2025, unmerged.
- **Engineer's angle**: Building on a 0.x SDK in its first month means the API
  can move under you. Keeping the surface tiny (one `Server`, two request
  handlers, stdio) is what let a major SDK bump land as a dependency update
  rather than a rewrite.
- **Plain version**: I built one of the first news tools for a brand-new AI
  standard and got it into the places people were looking within days.
- **Follow-ups**:
  - *Why stdio and not HTTP?* Desktop clients at the time launched servers as
    child processes and spoke JSON-RPC over stdin/stdout. That needs no port,
    no auth and no hosting, which is what a first-week user wants.
  - *Why SerpAPI instead of scraping Google News?* It returns structured JSON
    for the Google News engine, so the server's work is shaping results for a
    model, not parsing HTML that changes without notice.
  - *What happened to the official listing?* I closed that pull request
    unmerged on 9 January 2025; the server reached users through the
    community directories instead.

### S2. Unblocking Windows users two days after launch

- **Kind**: difficulty
- **Situation**: On 27 November 2024, two days after MCP launched, npm-based
  servers would not connect to Claude Desktop on Windows machines that used
  Node Version Manager, while Python servers launched through `uvx` worked.
  Mine was one of those machines.
- **What I did**: I opened issue #76 in `modelcontextprotocol/servers` with my
  environment and configuration, and half an hour later posted a step-by-step
  workaround: install the servers globally, then point the client's `command`
  at the absolute path of `node.exe` and the `args` at the installed server's
  entry file, instead of relying on PATH resolution through NVM's shims.
- **Result**: Several Windows users replied in the thread that the steps fixed
  their setup. A maintainer closed the issue the same day as a duplicate of an
  upstream bug the team was already fixing, so my steps were a workaround until
  that fix shipped. The same section is in the server's own documentation
  (`docs/overview.md`, "Solution for MCP Servers Connection Issues with
  NVM/NPM").
- **Engineer's angle**: The failure was in process launch, not in MCP: the
  desktop client spawned `node`/`npx` without the shell environment NVM relies
  on. Absolute paths remove the dependency on PATH entirely.
- **Plain version**: When the new standard would not start on many Windows
  computers, I worked out why and wrote the fix that people used until the
  official one arrived.
- **Follow-ups**:
  - *How did you find the cause?* Python servers through `uvx` connected and
    every `npx` server failed, which pointed at how Node was being located
    rather than at any one server.
  - *Was it the right fix?* It was a workaround. The real fix belonged in the
    client, and the maintainers were already on it.

### S3. Designing a tool whose caller is a language model

- **Kind**: decision
- **Situation**: The "user" of `google_news_search` is a model reading a JSON
  Schema and a description, deciding what to send, then reading what comes
  back. Every parameter it misunderstands and every byte of noise in the result
  costs the person a worse answer.
- **What I did**: I exposed one tool with seven optional strings rather than a
  family of tools, because SerpAPI accepts either a query or one of four tokens
  and the model should only have to choose once. `gl` and `hl` default to `us`
  and `en`. In `src/types.ts` a type guard checks every field before any
  network call; a bad call is rejected with the SDK's `InvalidParams` error. An
  upstream failure is not thrown: it comes back as a normal tool result with
  `isError: true` and SerpAPI's own message, so the model can see what went
  wrong. Results are flattened and grouped into five topics before they reach
  the model, newest first, as plain text with source, date and link on every
  article. `zh`, which SerpAPI's Google News engine rejected as an interface
  language, is mapped to `en` before the request.
- **Result**: The tool needs no instructions beyond its schema. Glama grades
  the server A for licence and A for quality.
- **Engineer's angle**: The two error channels. A protocol error tells the
  client it called the tool wrongly; an `isError` result is data the model
  reads and can recover from (retry with other terms, or tell the user the
  service is down). Mixing them up either hides failures from the model or
  breaks the client.
- **Plain version**: I designed the tool so an AI can use it correctly on the
  first try and understand what went wrong when it does not.
- **Follow-ups**:
  - *Why plain text and not JSON?* The consumer is a model writing an answer
    for a person. Grouped, labelled text is what it would have to produce from
    JSON anyway, and it carries the links through.
  - *Why are all parameters optional?* A query and a story token are
    alternatives; making `q` required would block the drill-down calls.
  - *How do the tokens get to the model?* SerpAPI returns them in its
    results (the topic menu links carry a `topic_token`), so a model can follow
    up on a topic it has just seen.

### S4. Getting found: lists, directories and the people who run them

- **Kind**: collaboration
- **Situation**: MCP users find servers by browsing catalogues, not by
  searching GitHub. In 2025 a wave of directories appeared, each wanting
  metadata, a badge or a deployment config.
- **What I did**: I submitted the server to the curated lists myself and
  reviewed and merged what the directory teams proposed: Smithery's team
  contributed a Dockerfile and `smithery.yaml` (PR #13) so Smithery could build
  and run the server from source with the user's key passed in as
  configuration; the Glama listing badge (PR #1); PulseMCP's Top Pick badge
  (PR #16); a security-scan badge (PR #19); Archestra's trust-score badge
  (PR #27); a hosted-deployment link (PR #34); and an end-to-end test with
  model-graded evaluations from the author of the `mcp-evals` package (PR #18).
- **Result**: By 2026-10-13 the server was on 10 directory sites and in 12
  curated lists and registries on GitHub, led by punkpeye/awesome-mcp-servers.
  Smithery's listing was withdrawn by 2026-10-15, which leaves 9 directory
  sites. It carries PulseMCP's Top Pick badge, was named no. 10 in DataCamp's Top 10
  (2025-07-10), and has a dedicated Skywork AI article. A third party
  republished it on npm as `@iflow-mcp/google-news-server`. DataCamp was still
  the top referrer in the repository's GitHub traffic in the 14 days to
  2026-10-13.
- **Engineer's angle**: Each channel builds a different artefact. Docker (and
  Smithery, while it was listed) builds from the repository, so it tracks
  `main`; the npm package is
  the snapshot that was published. Knowing which install path runs which code
  matters when a user reports a bug.
- **Plain version**: I put the tool where AI developers look for tools, and
  the people who run those catalogues came to feature it.
- **Follow-ups**:
  - *Which channel mattered most?* By the record, DataCamp: it was still the
    top referrer in the repository's GitHub traffic in October 2026, more than
    a year after the article.
  - *Did you write the Dockerfile?* No. Smithery's team proposed it with the
    Smithery config; I reviewed and merged it, and it has been kept current by
    dependency updates since (now `node:24-alpine`).

### S5. Supporting users of a free tool

- **Kind**: collaboration
- **Situation**: Once the server was listed, people I had never met started
  installing it from source and asking for things.
- **What I did**: When a user could not find `dist/index.js` (issue #17), I
  saw that the Quick Start skipped the build step and rewrote it in order:
  install, build, point the config at the built file, start. When two users
  asked for news by category and date range (issue #15), I explained that the
  server did not expose it, that SerpAPI supports it through its `tbs`
  parameter, and where in `src/index.ts` the change would go. Renovate keeps
  the dependencies moving; I review and merge its pull requests.
- **Result**: Issue #17 was closed after the README change. The repository has
  129 stars and 21 forks, and npm counts 10,354 downloads between 2025-04-13
  and 2026-10-13.
- **Engineer's angle**: For an open-source tool, the README is the interface
  for humans the way the schema is the interface for models. Issue #17 was a
  documentation bug, and treating it as one fixed it for everyone after.
- **Plain version**: When people got stuck, I fixed the instructions so the
  next person would not.
- **Follow-ups**:
  - *How do you decide what to add?* The server is in maintenance: it is kept
    healthy and current, and no features are planned.
  - *How much time does it take?* Little: dependency pull requests, the
    occasional issue, and directory requests.

### S6. Writing for the machine reader

- **Kind**: implementation
- **Situation**: By 2025 people also found tools by asking an AI assistant,
  and MCP clients started to accept packaged bundles. Marketing prose in a
  README is the hardest thing for either to use.
- **What I did**: In September 2025 I added `llms.txt` (a usage guide written
  for agents), schema.org `structured-data.json`, a `manifest.json` describing
  the tool, its parameters and the required `SERP_API_KEY`, and a packaged
  `google-news-server.mcpb` meant for one-click setup in Claude Desktop. In October 2026 I cut the
  README to one screen (the card, the film, the one config block, one diagram)
  and moved the full text to `docs/overview.md`, with a pointer telling the
  reader to hand that file and `llms.txt` to their own coding agent.
- **Result**: The repository reads in seconds for a person and in full for an
  agent; the same pattern is now used across the product READMEs in this
  profile.
- **Engineer's angle**: Separate the audiences rather than compromise: a
  human needs the shortest path to "it works", an agent needs every parameter
  and failure mode spelled out, and one document serves both badly.
- **Plain version**: I wrote one short page for people and one complete page
  for AI assistants.
- **Follow-ups**:
  - *Does `llms.txt` do anything?* It is a convention, not a standard: a plain
    text file an agent can read without parsing a styled page.
  - *Why move text instead of deleting it?* Agents and contributors still need
    the troubleshooting and parameter detail; it moved to `docs/overview.md`.

## Numbers I can say

| Figure | Source |
|---|---|
| First commit 2024-12-30, 35 days after MCP's 2024-11-25 launch | `20-projects-flagship.yaml` › google-news-mcp › metrics |
| 129 GitHub stars, 21 forks | same entry › `meta.x_brand.reach.usage` (2026-10-13) |
| 10,354 npm downloads, 2025-04-13 to 2026-10-13 (the 18 months npm reports) | same › `reach.usage` |
| 83 public GitHub repositories reference the repo or the npm package (incl. 3 of mine) | same › `reach.usage`, basis: GitHub code search |
| Listed on 15+ MCP catalogues: 9 directory sites and 12 curated lists and registries on GitHub | same › metrics, "Registry listings" |
| DataCamp "Top 10 MCP Servers & Clients for AI Workflow Automation in 2026": no. 10 | same › `reach.press`; `30-recognition.yaml` › publications |
| PulseMCP Top Pick badge, about 38k estimated visitors, rank #1,060 (PulseMCP's own estimates) | same › `reach.usage`, `reach.directories` |
| Glama: A for licence, A for quality | same › `reach.directories` |
| mcp-get listing merged within an hour of opening (2025-01-01) | `25-contributions.yaml` › mcp-get-62-google-news |

## In hindsight

- **Release from a pipeline, not by hand.** For almost two years the npm
  package was the 1.0.0 published on 1 January 2025, built from an early
  commit, while the repository moved on (SDK 1.x, later fixes). Smithery (while listed) and Docker built from `main`, so the
  install paths ran different code. In October 2026 I cut 1.0.1 from the
  current source (tagged and released on GitHub, notes in the changelog). A
  tag-triggered publish workflow would have kept them in step from the
  start.
- **The topic grouping is cruder than it looks.** It is a keyword regex over
  title and snippet with no word boundaries, so `ai` also matches inside words
  such as "said" and "again", and a lot of general news lands in AI &
  Technology. Word-boundary matching, or letting the model group the results,
  would have been more honest.
- **Document only what the code does.** The docs and manifest state a rate
  limit, a concurrency cap and a one-hour cache that the server does not
  implement; those are not mine to promise. Some error strings are in Chinese,
  which an English-speaking model or user cannot act on.
- **Test the bundle before offering it.** The `.mcpb` bundle was never
  installed in a client, so it should not be described as a one-click
  install until it has been.
- **Tests before badges.** The only automated test came from an outside
  contributor's evaluation package. A small contract test of the tool schema
  and the result formatting would have caught the points above.

## Evidence

Public, third-party. Read 2026-10-15; every page below was saved as raw bytes
with a screenshot and, where the Wayback Machine accepted it, an archive link.

Press and features:

- **DataCamp**, [Top 10 MCP Servers & Clients for AI Workflow Automation in
  2026](https://www.datacamp.com/blog/top-mcp-servers-and-clients) (Abid Ali
  Awan, 2025-07-10): no. 10, "Google News", linking to the repository. The
  Spanish, German, French and Portuguese editions keep the same entry. The
  author later starred the repository. (`30-recognition.yaml` › publications ›
  `datacamp-top-mcp-servers`.)
- **PulseMCP**, [Weekly Pulse](https://www.pulsemcp.com/posts/newsletter-remote-mcp-images-screen-recording)
  (2025-01-04), under "Featured Servers We Like": "A newly-released,
  well-documented approach to pulling news data into MCP clients like Claude."
  (`30-recognition.yaml` › publications › `pulsemcp-weekly-pulse`.)
- **PulseMCP**, proposing the Top Pick badge in
  [PR #16](https://github.com/ChanMeng666/server-google-news/pull/16): "We
  thought yours was a great, early server and a great idea to bring LLMs
  up-to-speed on current events."
- **Skywork AI**, [Chan Meng's Google News MCP Server: The AI Engineer's Guide
  to Real-Time News Integration](https://skywork.ai/skypage/en/google-news-ai-integration/1978665953022038016):
  a dedicated article. Cite the title only.
- **tom-doerr/repo_posts**, [a post on the repository](https://tom-doerr.github.io/repo_posts/2026/01/27/ChanMeng666-server-google-news.html)
  (2026-01-27).

From people who use it or build around it:

- **Windows users** in [modelcontextprotocol/servers #76](https://github.com/modelcontextprotocol/servers/issues/76),
  replying to her workaround: "Thanks a ton! Solved my issue." / "thanks a lot,
  it works under windows 11." (S2)
- **Bong-Min Kim**, NLP researcher, in [issue #15](https://github.com/ChanMeng666/server-google-news/issues/15):
  "thank you for implementing such an awesome MCP server." (S5)
- **Frank Fiegel** (awesome-mcp-servers, Glama), [PR #1](https://github.com/ChanMeng666/server-google-news/pull/1):
  offered her the MCP Discord flair "that's only for MCP server authors". (S1)
- **Smithery** ([PR #13](https://github.com/ChanMeng666/server-google-news/pull/13)),
  **mcp-evals** ([PR #18](https://github.com/ChanMeng666/server-google-news/pull/18)),
  **MseeP** ([PR #19](https://github.com/ChanMeng666/server-google-news/pull/19)),
  **Archestra** ([PR #27](https://github.com/ChanMeng666/server-google-news/pull/27))
  and **Fronteir AI** ([PR #34](https://github.com/ChanMeng666/server-google-news/pull/34):
  "Love the project!") contributed deployment, tests and badges. (S4)
- **SerpApi**: an engineer at the API vendor sent
  [PR #24](https://github.com/ChanMeng666/server-google-news/pull/24) to correct
  the SerpApi setup details in the README. (S4)
- **Republished and reused**: NetMind.AI published a fork on npm as
  [`@netmind/google-news-server`](https://www.npmjs.com/package/@netmind/google-news-server),
  alongside `@iflow-mcp/google-news-server`. [30Days30Agents](https://github.com/rakeshgangwar/30Days30Agents/tree/main/agents/Day-12-News-Curator)
  builds its Day 12 News Curator agent on the server, and the
  [MCP-Flow](https://github.com/wwh0411/MCP-Flow) research repository includes
  it in its tool set. (S4)
- **Security scans**: [AgentSeal](https://agentseal.org/mcp/chanmeng666-google-news-server)
  rates it Safe; [ToolTrust](https://github.com/AgentSafe-AI/tooltrust-directory/blob/97d54c0950c4b511df7ab19a5d3a50acbe46d202/docs/tools/server-google-news.md)
  and [MseeP](https://mseep.ai/app/chanmeng666-server-google-news) also list
  scans. Only the AgentSeal figure is in the shards.
- Listings and their links: `projects[google-news-mcp].meta.x_brand.reach`.
  More directories and lists than the register holds were found on
  2026-10-15; they are recorded in the private layer.

Private evidence: none. Every item in the private layer comes from a public
page and is marked public; the private layer holds the saved copies.

## Open questions

- **The Smithery listing returns 404** (resolved 2026-10-15). Both
  `smithery.ai/server/@chanmeng666/google-news-server` and Smithery's registry
  API answer "not found". Chan took Smithery off: it moved to `reach.gone`,
  and the "Listed on" strip, the listings metric (9 directory sites) and the
  install sentence no longer name it. PR #13 and `smithery.yaml` stay as
  history.
