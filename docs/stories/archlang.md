---
id: archlang
title: ArchLang
role: Creator and sole developer
period: "2026-06 – present"
status: production
kind: own-product
repos:
  - ChanMeng666/archlang
  - ChanMeng666/archlang-showcase
live: https://archlang.uk
stack: [TypeScript, "Hand-written lexer and recursive-descent parser", tsup, Biome, Vitest, fast-check, pixelmatch, "LSP + VS Code extension", "Vite + CodeMirror 6", VitePress, "MCP (optional shim)", "GitHub Actions (OIDC trusted publishing)", "Cloudflare Workers (static assets)"]
stories: 7
publicEvidence: [reproducible-is-not-correct, tokenless-npm-publishing-ai-agents]
privateEvidence: 0
diagrams: true
lastResearched: "2026-10-15"
sources:
  - data/profile/23-projects-oss-more.yaml (projects[] archlang)
  - data/profile/10-career.yaml (ArchCanvas role, order of events)
  - data/profile/30-recognition.yaml (publications)
  - github.com/ChanMeng666/archlang (README, AGENTS.md, CHANGELOG.md, docs/adr/0001–0027, docs/agents/architecture.md, src/pipeline.ts, src/diagnostics.ts, src/registry.ts, .github/workflows)
  - git log of the archlang repository
  - public issues and pull requests #61, #104, #105, #106, #109
---

# ArchLang

## In one breath

ArchLang is a small programming language for floor plans. You describe walls, rooms,
doors and windows in plain text, and it produces a precise, dimensioned drawing; change
one number and exactly one thing moves. It also checks whether a plan is livable (can
you reach the bathroom, does the bedroom have a window). I invented it and wrote all of
it, published it free on npm, and it is the engine inside my AI design product,
ArchCanvas. It has reached v1.43.0 over 62 published versions (2026-10-14), with 4,338 passing tests.

## The problem

Floor plans exist either as heavy CAD drawings or as generated images. Neither lets you
make a precise edit cheaply: widening a bedroom means redrawing, or regenerating an image
and hoping the rest survives. An AI agent cannot work with either, because there is no
exact text form it can write, check and tweak. And a picture never knows whether the
plan it shows is habitable.

I hit this from the product side. ArchCanvas started by asking a model to draw the plan
as SVG. The drawings looked plausible and could not be trusted: the model could not tell
whether a door hit a wall, and it redrew the whole plan when asked to move one thing. A
better prompt was not going to fix that. The plan had to become a program.

## What I built

A pure TypeScript compiler with no runtime dependencies that runs the same in Node, in
the browser and in a Cloudflare Worker. `.arch` source goes through a hand-written lexer
and recursive-descent parser, an import linker, a resolver (scripting, grid snapping,
relational placement) and a backend-neutral scene, then out to one of five formats.
`compile()` returns a value and never throws: a broken plan gives an empty drawing plus
diagnostics that each carry a stable code, a byte span and, where possible, a fix a tool
can apply. Analysis sits beside the compiler and reports facts; anything that changes a
plan is a separate, explicit command.

- **Language**: 15 element kinds plus a fixture catalogue; `let`, functions, loops, imports
  and components, all expanded at compile time, so output is byte-for-byte deterministic.
- **Diagnostics**: 139 stable codes (92 errors, 47 warnings), each with a span and a
  machine-applicable fix where one exists.
- **Analysis**: 8 lint-rule modules for architectural soundness, a circulation analysis
  of how a person walks the plan, a repair pass, intent scoring against a written brief.
- **Output**: SVG and DXF built in; PDF and PNG as optional add-ons loaded only when used.
- **Surfaces**: a CLI of about 20 commands, all with `--json` and fixed exit codes; a
  language server and VS Code extension; a client-side playground; a docs site; an
  optional MCP server; a GitHub Action that renders `arch` code fences in Markdown.
- **Engineering record**: 19 architecture decision records, property tests and
  visual-regression tests, releases published from CI with no stored token.

## Stories

### S1. Turning a drawing problem into a language

- **Kind**: requirements
- **Situation**: ArchCanvas, which I started on 2026-04-08, asked a model to draw floor
  plans as SVG. Users got pictures that could not be measured, checked or edited in
  place: asking to widen one room changed everything.
- **What I did**: I stopped adding product features and treated the failure as a missing
  layer. I designed a declarative language whose output is a pure function of its text,
  published 0.1.0 to npm on 2026-06-24, and the next day replaced the freehand drawing
  engine inside ArchCanvas with it. I also wrote down the boundary that has held since,
  as an architecture decision record: the compiler computes facts and gives advice; it
  never designs. Arranging rooms belongs to the agent above it.
- **Result**: ArchCanvas now writes ArchLang, the compiler turns it into a dimensioned
  drawing, and edits are exact and replayable. Select-to-edit, parametric sliders and
  semantic diffs in the product all depend on the plan being a program. ArchLang went on
  to 62 published versions by v1.43.0 (2026-10-14).
- **Engineer's angle**: why a language rather than a JSON schema the model fills in.
  Text is what models write best; a language gives loops and components so a terrace of
  identical houses is one definition, and it gives byte spans so every error can point
  at the exact characters an agent must change.
- **Plain version**: I realised the AI was drawing pictures of plans, so I built a way
  for it to write plans instead, which can be checked and edited precisely.
- **Follow-ups**:
  - *Why not use an existing CAD format?* DXF and IFC describe geometry, not intent; they
    have no "right of the kitchen with a 100 mm gap", and an agent cannot easily write or
    repair them. ArchLang exports DXF for people who need it.
  - *What does "never designs" cost you?* ArchLang will describe a bad plan precisely but
    will not fix its layout. That is deliberate: once the compiler chooses between valid
    options, its output depends on a policy rather than the source.
  - *Was the product built before the language?* Yes, by about eleven weeks. The language
    came out of what the product taught me.

### S2. Errors as data: a hand-written parser and fixes a tool can apply

- **Kind**: decision
- **Situation**: The main reader of ArchLang errors is often an AI agent, not a person.
  It needs every problem at once, with an exact location and, ideally, the corrected
  text. A parser generator such as Lezer or tree-sitter was the obvious choice.
- **What I did**: I kept a hand-written lexer and recursive-descent parser (recorded as
  ADR 0001) because I needed zero dependencies, byte-accurate spans and full control of
  error recovery: the parser emits an error node and resynchronises at the next
  statement, so one typo does not hide the rest of the file. Editor grammars are
  generated from one token table, with a test that fails if they drift. Later I added
  structured fixes on the rustc model (ADR 0011): each fix is a set of span edits tagged
  with a confidence tier, and `arch fix` applies only the provably safe tier by default,
  in a bounded loop that rolls back any pass that raises the error count. Text fixes and
  geometric repair stay two separate commands.
- **Result**: 139 stable diagnostic codes, each with a span and a fix where one exists.
  The same suggestions appear as quick-fixes in the language server. An agent can go
  from a failed compile to a corrected file without translating prose into edits.
- **Engineer's angle**: the fix applier is a piece table ported from rustfix. A
  suggestion is atomic; if any of its edits overlaps one already applied, the whole
  suggestion is skipped, so the result does not depend on the order of suggestions. A
  fix is promoted to "machine-applicable" only when it can prove there is one answer
  (for example, a single nearest wall) and a golden test pins its output.
- **Plain version**: when a plan has a mistake, ArchLang says exactly where it is and,
  when it is sure, how to fix it, so an AI can correct itself.
- **Follow-ups**:
  - *Doesn't a hand-written parser cost more to maintain?* For a language with a handful
    of element kinds and a small expression grammar, little. New elements arrive as one
    registry module each, with no grammar to regenerate.
  - *What stops `arch fix` making things worse?* It counts errors after each pass and
    rolls back a pass that increases them; it previews the diff and keeps a backup only
    when asked.
  - *How do you test recovery?* Recovery quality is a metric over a frozen corpus of
    mutated files, with floors that may only rise.

### S3. The agent reference was wrong while every check was green

- **Kind**: incident
- **Situation**: `spec.llm.md` is the page agents read to learn ArchLang. It ships in the
  npm package, is baked into the MCP server, is served on archlang.uk, and ArchCanvas
  injects it into its system prompt. It is generated, and CI fails if the file differs
  from the generator's output. While adopting a new version in ArchCanvas, I found that
  generated plans kept failing to compile on forms copied straight from the page.
- **What I did**: I traced it to the generator itself: its grammar lines were typed by
  hand, so regenerating reproduced the same wrong text every run and the drift check
  stayed green. I filed it publicly (issue #61), then checked every grammar line against
  the real parser and corrected the wrong ones, including the position of `id=` on furniture and
  a "common mistakes" row that used a helper which is not a built-in. I extended the
  drift test to assert the forms against the compiler, and re-released the MCP server,
  because it bakes the page in at pack time and would otherwise keep serving the old
  text.
- **Result**: shipped as v1.26.0 (2026-08-12). The lesson became a written rule in the
  repository ("drift-green proves reproducibility, not correctness") and the subject of
  my preprint, *Reproducible Is Not Correct*, published on Zenodo on 2026-09-25.
- **Engineer's angle**: a regeneration check only proves a file matches its generator.
  If the generator restates a fact instead of deriving it from the source of truth, the
  check certifies the error. The fix is to derive or to test against the real
  implementation, never to retype.
- **Plain version**: the instructions I gave AI models had mistakes my checks could not
  see, because the checks only confirmed the instructions were consistent with
  themselves.
- **Follow-ups**:
  - *How did you find it?* Downstream, in my own product: generated plans failed on
    syntax the reference had taught.
  - *Why a minor release, not a patch?* The same branch added two error codes and a
    behaviour change; I read the version class from the actual change log, not from
    the plan.
  - *What would catch this class of bug in other projects?* Treat any self-description
    shipped to a model (schema, grammar, context file) as a claim, and test it against
    the thing it describes.

### S4. Zero dependencies that survive other people's bundlers

- **Kind**: difficulty
- **Situation**: The core has to run in browsers and in other people's Next.js and Vite
  builds, but PNG and PDF output need native or heavy packages. A user's bundler follows
  every `import()` it sees.
- **What I did**: I made those packages optional and lazily imported, with
  `webpackIgnore` and `@vite-ignore` comments so a downstream bundler never tries to
  resolve them. The first release missed this and failed in webpack consumers; v1.0.1
  fixed it. A second instance, a font lookup in the PNG backend, was found by
  ArchCanvas's first client-side use of the core and fixed the same way. Later I
  removed an optional geometry package from wall drawing altogether (ADR 0018): angled
  walls rendered differently depending on whether that package had installed, so I
  replaced three wall-drawing paths with one zero-dependency pass.
- **Result**: the core still has zero runtime dependencies; the browser playground runs
  the compiler entirely on the client; and a plan's drawing no longer depends on what
  `npm install` managed to fetch.
- **Engineer's angle**: "optional dependency" is a correctness risk, not just a size
  question. If output changes when it is present, determinism is broken. The new wall
  pass builds each wall as exact edge loops, cuts openings, and keeps an edge only where
  exactly one side is solid.
- **Plain version**: I made sure the tool works the same everywhere, in a browser or on
  a server, without forcing anyone to install heavy extras.
- **Follow-ups**:
  - *How do you stop this regressing?* The rule is written into the contributor guide
    and every new optional import follows the same pattern; my own product is the first
    downstream bundler test.
  - *Why not ship two packages?* One isomorphic package keeps one API; the add-ons load
    only when their export is called.

### S5. Making "never throws" true under hostile input

- **Kind**: difficulty
- **Situation**: `compile()` promised to return diagnostics, never throw. An audit of the
  code, followed by a review that reproduced each finding through the built CLI, showed
  it could still throw, hang or run out of memory: a numeric literal hundreds of digits
  long, deeply nested parentheses, a wall long enough to exhaust memory. Some yes/no
  checks also rested on approximations, such as a door-swing collision test that
  sampled points along the arc and could miss an overlap.
- **What I did**: I recorded the work as ADR 0022. Every resource bound became a
  catalogued diagnostic rather than a crash: a modelling range for coordinates, a
  nesting limit, an element limit, an evaluation-step budget and a drawing budget,
  both counted in units of work rather than time so the result stays deterministic.
  Where a verdict turns on an exact tie I decided it with exact arithmetic (`BigInt`,
  squared lengths), and I replaced the sampled swing test with an exact separating-axis
  test. I also built a script that runs the compiled core in Chromium, Firefox and
  WebKit and compares output digests with Node's, run nightly as an advisory check.
- **Result**: the "never throws" contract is now tested against the inputs that broke
  it, and each behaviour change is listed in the change log with its own test.
- **Engineer's angle**: the budgets are counts, never wall-clock time, because a
  time-based limit would make the same input pass on a fast machine and fail on a slow
  one. ECMAScript specifies `+ − × ÷` and `sqrt` exactly but not `hypot` or `atan2`,
  which is why exact decisions use only the former.
- **Plain version**: I made sure no input, however strange, can crash the compiler; it
  always explains what is wrong instead.
- **Follow-ups**:
  - *Why not just catch exceptions at the top?* A caught `RangeError` gives no location
    and no fix; a catalogued diagnostic gives both, and the rest of the plan still
    reports.
  - *Did you consider exact geometric predicates everywhere?* Considered and rejected:
    on integer millimetre inputs plain doubles are already exact within the modelling
    range, and no defect motivated more.

### S6. Handling outside bug reports and a contributed fix

- **Kind**: collaboration
- **Situation**: In September 2026 outside users began filing detailed issues: the PDF
  backend garbled non-Latin labels such as Polish (#105); two intent concepts mapping to
  the same room type starved each other depending on order (#104); and on a stepped
  facade, automatic dimensioning silently dropped every opening (#109). The reporter of
  #105 also sent a fix (#106).
- **What I did**: I reviewed and merged the contributed PDF fix after checking CI,
  byte-identical repeat output and text extraction with an independent tool, and filed
  the remaining gap (CJK glyphs) as a new issue. For #104 I replaced a greedy assignment
  with a bipartite matching, built so that every case the old pass already satisfied
  produced exactly the same result, because the same checker is used by my evaluation
  judge. For #109 I found the cause (one probe line that missed both legs of a stepped
  wall), chained openings from the facade outline instead, and added the warning the
  reporter asked for, `W_OPENING_NOT_DIMENSIONED`, so a missing dimension can fail a
  strict build. I confirmed no other example's output moved by hashing the whole
  example corpus before and after.
- **Result**: all three issues closed within days; the user's suggestion shipped as a
  warning; two shipped examples that had been reporting wrong overall dimensions were
  corrected by the same fix.
- **Engineer's angle**: the user's point in #109 was that a warning you can gate on is
  worth more than the feature, because silent omission is the failure you cannot detect
  yourself. That matches the project's rule of reporting facts rather than hiding them.
- **Plain version**: when people outside the project found bugs, I fixed them properly,
  credited a contributor's fix, and added the safety check one of them asked for.
- **Follow-ups**:
  - *How do you know a fix didn't break something else?* Every example's SVG,
    `describe()` and `lint()` output is hashed; a change that moves any of them must be
    explained in the change log.
  - *Why keep the judge's results byte-identical?* So past evaluation scores remain
    comparable; only the previously failing cases change.

### S7. CLI first for agents, MCP only as a doorway

- **Kind**: decision
- **Situation**: Agents were going to be ArchLang's main authors. The fashionable answer
  was an MCP server. But an MCP tool schema sits in an agent's context window all the
  time, while a CLI costs nothing until it is called.
- **What I did**: I made the CLI the primary agent interface and later wrote its contract
  down (ADR 0015): one manifest file generates the help text, the flag parser and the
  reference docs, with a test that fails if a flag exists in only one of them; filters
  narrow what is shown but never the exit code, so an agent cannot filter its way to a
  green build; a mistyped flag is a usage error with a "did you mean" rather than being
  silently ignored. When the MCP registry became a real place hosts look for tools, I
  added an MCP server as a separate package (ADR 0012) that wraps library functions
  directly, keeping the MCP SDK out of the core.
- **Result**: about 20 commands, all with `--json` and fixed exit codes; an optional MCP
  server listed on the official registry; the core still has zero runtime dependencies.
  In October 2026 I also hosted the MCP server at mcp.archlang.uk (ADR 0026) for hosts
  that take a URL and cannot start a local process. It is the only Worker in the
  repository with a script; the docs site and the playground stay static, so the free
  plan's request cap applies to the MCP endpoint alone.
- **Engineer's angle**: making unknown flags fail was a deliberate breaking change,
  released as a minor version: a flag that is silently ignored is a wrong answer with a
  green exit code.
- **Plain version**: I gave AI tools a cheap, predictable command-line way in, and a
  second door for tools that only speak the newer protocol.
- **Follow-ups**:
  - *Why not route MCP through the CLI so they can't diverge?* Both already call the same
    library; shelling out would add process spawning and argument escaping for no gain.
  - *How does an agent learn the CLI?* `arch --help`, then `arch <command> --help` with
    worked examples, then `arch manifest --json` for the whole surface.

## Numbers I can say

| Figure | Source |
|---|---|
| v1.43.0, 62 published npm versions through 2026-10-14 | `23-projects-oss-more.yaml` › archlang › metrics |
| 4,338 passing tests across 216 test files (measured 2026-09-04) | same |
| 139 diagnostic codes: 92 errors, 47 warnings | same |
| 27 architecture decision records | same |
| 15 element kinds (read from the registry 2026-10-15), 5 export formats, 8 lint-rule modules | same |
| About 20 CLI subcommands, all with `--json` and exit codes 0/1/2/3 | same |
| 1,600-row open dataset of example plans | `10-career.yaml` › ArchCanvas › impactDelivered |
| npm 0.1.0 on 2026-06-24; replaced ArchCanvas's freehand engine 2026-06-25 | `10-career.yaml` (comment on order of events) |
| Preprint published on Zenodo 2026-09-25 | `30-recognition.yaml` › publications |

## In hindsight

- I would have derived the agent reference from the parser from day one. The drift
  check gave a false sense of safety for weeks (S3).
- Several hard rules (budgets, exact predicates, one shared printer) arrived as
  clean-up after defects shipped. Writing the invariants as tests earlier would have
  cost less than the later audits.
- I built a wide surface (playground, LSP, MCP, Action, dataset) before many outside
  people were using it. The issues that arrived in September were more useful than any
  feature I could have added in the same time; I would put it in front of users sooner.
- Some features did not earn their place. The axonometric view was deprecated (ADR 0021)
  because nothing in it could be checked and no one used it.

## Evidence

- **Publication** `reproducible-is-not-correct`: *Reproducible Is Not Correct: Reflexive Gates and the
  Self-Descriptions We Ship to Language Models*, sole-authored preprint, Zenodo,
  2026-09-25, which includes a depth study of ArchLang (`30-recognition.yaml`). Backs S3.
- **Publication** `tokenless-npm-publishing-ai-agents`: *Tokenless npm Publishing for AI Agents*, chanmeng.org, 2026-07-12,
  the release setup that shipped 1.14.0 (`30-recognition.yaml`). Backs S4 and the
  release pipeline.
- **Public issues and pull request** on github.com/ChanMeng666/archlang: #104, #105,
  #109 from outside users and #106, a merged fix from an outside contributor. From
  #109: "A warning we can gate on is worth more than the chain itself". Backs S6.
- No LinkedIn recommendation in `50-references.yaml` mentions ArchLang.
- Private items: none. The private layer's six items are all already on public
  pages (the publications, issues, pull request and listing above), so they are
  not counted as private.

## Open questions

None open. Settled on 2026-10-15: the shard now records the first merged outside pull
request (#106), the current version, release and ADR counts, the 15 registered element
kinds and the hosted MCP endpoint; publications carry `id:` fields, cited above; the
reporter of #109 stays anonymous; the start date is 2026-06.
