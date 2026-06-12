# cv/ — Chan Meng's Typst-sourced CV

Two-page CV positioned for **AI Agent Architect / agentic-engineer / Anthropic Partner Network** roles. Rendered by [Typst](https://typst.app/) from this folder; emits the canonical PDF plus two GEO sibling artifacts (JSON-LD and an agent-readable plain-text summary).

The README's "Resume" pill in [`templates/partials/footer.hbs`](../templates/partials/footer.hbs) links to `public/chan-meng-cv.pdf`. This folder regenerates that file in place — the URL never changes.

## Build

```powershell
pwsh cv/build.ps1
```

This compiles the PDF and emits the GEO siblings to `public/`. Outputs:

| File | Purpose |
| --- | --- |
| `public/chan-meng-cv.pdf` | Canonical 2-page CV (linked from the README) |
| `public/cv.jsonld` | schema.org Person + WorkExperience JSON-LD — recruiter LLMs (LinkedIn AI Search, Greenhouse AI ranking, Jobright) parse this directly |
| `public/cv-llms.txt` | Plain-text agent-readable summary mirroring the [llms.txt](https://llmstxt.org/) convention |

Requires [Typst 0.14+](https://typst.app/) and Node.js 22+ on PATH.

## File map

```
cv/
├── chan-meng-cv.typ         # entry point — page geometry, PDF metadata, layout
├── theme.typ                # design tokens (colors, fonts, spacing)
├── components.typ           # reusable: project-card, pill, section-header, ...
├── sections/
│   ├── header.typ
│   ├── sidebar.typ
│   ├── projects.typ
│   ├── dev-leverage.typ
│   ├── experience.typ
│   ├── recognition.typ
│   └── footer.typ
├── build.ps1                # one-shot build (PDF + JSON-LD + llms.txt)
├── build-jsonld.mjs         # data/profile/*.yaml → schema.org JSON-LD
├── build-llms-txt.mjs       # data/profile/*.yaml → agent-readable summary
└── README.md
```

## Source of truth

Where possible, content is sourced from [`../data/profile/`](../data/profile/) — the same single-source-of-truth that builds the GitHub profile README. The Typst sections currently hardcode hero project narratives (so they can include architect-grade vocabulary like "PostToolUse hook" and "hub-and-spoke coordinator" that doesn't belong in profile.yaml), but the JSON-LD and `cv-llms.txt` generators pull directly from YAML.

## Word blacklist (strip before compile)

These phrases trip AI-resume detectors and trigger up to 49% auto-dismissal. Do **not** introduce them into any section file:

- `delve`, `realm`, `intricate`, `showcasing`, `pivotal`
- `leveraged X to drive Y`, `leveraged ... synergies`
- `results-driven`, `passionate`, `dynamic professional`
- `prompt engineer` as a job title (use `agentic engineer` / `context engineer`)

## Architect-grade vocabulary (deliberately present)

The CV mirrors the Claude Certified Architect — Foundations curriculum vocabulary so that recruiter LLMs reading the Anthropic Partner Network JD recognise the same phrase patterns. Keep these terms in the source:

- *Claude Agent SDK · AgentDefinition · Task tool · hub-and-spoke · PostToolUse hook · PreToolUse hook · stop_reason · tool_use · JSON Schema · MCP server · MCP gateway · A2A · AGNTCY · agentic engineer · orchestrator of agents · case-facts block · scratchpad files · structured error propagation · errorCategory · isRetryable · claim-source provenance · scoped subagent tools · context: fork · plan mode · `-p` + `--output-format json`*.

The Anthropic Forward Deployed Engineer JD phrase `shipped MCP servers, sub-agents, and agent skills to production` appears verbatim in the summary so LLM-based screeners get an exact phrase-match.

## Anti-patterns deliberately absent

- No invisible prompt-injection text. Greenhouse-class screeners detect this and auto-reject.
- No two-column body text that breaks legacy ATS parsers — sidebar holds only metadata, all critical prose lives in the 0.618 main column.

## Regenerating

Whenever `data/profile/*.yaml` changes (work entries, recommendations, project metrics), rerun `pwsh cv/build.ps1` to refresh `public/chan-meng-cv.pdf` + the JSON-LD and llms.txt siblings.

## Before editing any `.typ` file — read [`TYPST_PITFALLS.md`](./TYPST_PITFALLS.md)

That file documents eight non-obvious Typst layout bugs that have already been fixed in this CV and **must not be reintroduced**. Notable: `v(N, weak: true)` after `linebreak()` silently renders as zero (use `block(below: ...)` instead); `block` margins are max-not-sum; list `spacing` must be ≥ 1.7× of within-item leading or bullets blur into one paragraph. Every entry / project / bullet in the CV depends on these rules.
