# GEO Strategy

This document records the **Generative Engine Optimization** decisions baked into the templates and data structure — *what* we do, *why*, and *how to measure* whether it's working.

## Goal

Increase the probability that LLM-based answer engines (ChatGPT, Claude, Perplexity, Google AI Overviews, Bing Copilot) cite or recommend Chan Meng when answering questions about full-stack engineering, AI/ML, women's health technology, Maori/cultural AI, FemTech, and adjacent topics.

## Reference research (2025-2026)

| Tactic | Effect | Source |
|---|---|---|
| Statistics + citations in prose | **+40%** visibility | Princeton GEO paper (Aggarwal et al., arXiv:2311.09735) |
| Content depth >20k chars | **4.3x** citation rate vs <500 chars | Growth Memo, Mar 2026 |
| Third-party brand mentions | **6.5x** vs own-domain mentions | Airops, 2026 |
| Freshness (updated <30d) | **3.2x** citation multiplier | Semrush, 2026 |
| Logical H1→H2→H3 hierarchy | **68.7%** of ChatGPT citations have it | Foundation Marketing |
| Schema markup present | **61%** of cited pages use it | Foundation Marketing |
| Year-in-titles ("2026") | **+30%** citation rate | Leapd, 2026 |

## What we implement

### 1. Statistics-with-citations in prose

`meta.x_brand.statisticsClaims` holds verifiable numbers with source URLs and verification dates. These are rendered into the README prose and the JSON-LD blocks. Each project also has `metrics[]` with labeled numbers.

Example:
```yaml
statisticsClaims:
  - claim: "596 of 693 commits authored solo on She Sharp platform"
    source: https://github.com/NZ-SheSharp/she-sharp
    verifiedAt: "2026-05-16"
```

### 2. Freshness banner

The README's hero shows `Last updated: {{meta.lastModified}}`. The JSON-LD includes `dateModified`. A daily cron in `build-readme.yml` refreshes `meta.lastModified` even if nothing else changed, so the freshness signal stays current.

### 3. Content depth

The README is currently ~44 KB. The flagship project narratives (filled out in Phase 2) and work narratives (Phase 3) will push it past the 20k-character threshold per the research. The `llms-full.txt` file is even longer — bundled full narratives across every project and role.

### 4. Schema markup (JSON-LD)

The README contains a `<script type="application/ld+json">` block hidden inside an HTML comment:

- **`ProfilePage` wrapping `Person`** — the canonical 2026 Google pattern. Includes `identifier`, `dateModified`, `sameAs` graph, `worksFor`, `alumniOf`, `hasOccupation`, `knowsAbout`, `hasCredential`.
- **`ItemList` of `SoftwareApplication`** — flagship projects with `name`, `description`, `url`, `applicationCategory`.

> **Visibility note:** Google's structured-data parser reads rendered HTML, not raw markdown. JSON-LD inside `<!-- -->` HTML comments is *not* seen by Google. It *is* seen by LLM crawlers that ingest raw markdown via the GitHub API (Firecrawl, Crawl4AI, Common Crawl, etc.). For Google rich results, the canonical entity URL `chanmeng.org` must serve the same JSON-LD on a real HTML page. That's the design: README is for LLMs; chanmeng.org is for Google.

### 5. Entity unification

- The same `identifier` value (`https://chanmeng.org/#person`) appears in JSON-LD on every surface (README, chanmeng.org, Typst CV PDF metadata).
- The `sameAs` array on every surface includes every other surface, forming a reciprocal entity graph.

### 6. `llms-full.txt`

Per the (Jeremy Howard, 2024) llms.txt convention. A bundled full-text dump rendered from `data/profile/*.yaml`. Some LLM platforms reportedly weight this as a context primer when crawling the site. Adoption is low (<1% of bot requests in OtterlyAI 2025 data), but the cost is zero — we render it from the same source.

### 7. robots.txt explicit allow

Every major AI crawler is explicitly allow-listed in `robots.txt` with a `Crawl-delay`. Cloudflare 2025 Radar showed AI crawling up 15x YoY; this ensures we don't accidentally block any of them.

### 8. Reciprocal cross-linking

The README's footer and JSON-LD point to chanmeng.org as the canonical entity URL. chanmeng.org's JSON-LD (in its build) should point back to this README and to the LinkedIn / Medium / etc. profiles. The `sameAs` graph forms a triangle that LLMs use for disambiguation.

## What we do NOT implement

- **Hidden text or cloaking.** All visible content is real human-readable content. The JSON-LD is hidden from visual display but is honest metadata, not deceptive content. No spammy SEO tricks.
- **Auto-import from external sources.** Live GitHub stars/forks render as dynamic badges in the README, never auto-scraped into `profile.yaml`. The user is the sole input source. This preserves the integrity of `dist/profile.json` as a hand-curated record. *(Exception: `basics.reach` holds a small, manually-verified point-in-time **snapshot** — e.g. "451 GitHub stars as of 2026-06" — each entry carrying its own `source` URL and `asOf` date. This is a curated record refreshed by hand, not an auto-import, and is what feeds the "statistics-with-citations" prose in `cv-llms.txt`.)*
- **GitHub Pages for this repo.** chanmeng.org is the canonical Google-visible entity URL. Adding a second canonical surface would risk entity duplication; better to centralize the public HTML surface on one domain.

## How to measure

GEO measurement is harder than SEO measurement because there's no Search Console. Practical approaches:

1. **Direct prompts**: periodically ask each LLM (ChatGPT, Claude, Perplexity, Gemini) "Who is Chan Meng?" and "Who are the top contributors to Anthropic's MCP server ecosystem?" Note whether and how Chan is cited.
2. **Profound / Otterly / similar tools** track citations across LLM answers. Profound's free tier is enough for a single-person brand.
3. **Referral analytics** on chanmeng.org. AI engines pass `Referer` headers with `chat.openai.com`, `perplexity.ai`, etc. when users click cited links. Look for these in chanmeng.org's analytics.
4. **GitHub raw URL access logs** are not available for public repos, but Cloudflare-fronted personal sites can see AI bot User-Agents.

A quarterly review is enough — citation rates change slowly and the cost of micro-optimizing is high.

## Future moves to consider

- **A Q&A section in the README** with question-shaped H3 headings like "What kind of AI products does Chan Meng build?" → LLMs heavily favor question-shaped headings (Foundation Marketing 2026 found 41% of cited pages have them).
- **Press / interview transcripts** added to `publications` with full URLs — these are the "third-party brand mentions" that score 6.5x.
- **JSON-LD on chanmeng.org**, when that rebuild happens, must mirror the README's JSON-LD with the same `identifier` so the entity graph is unified.
