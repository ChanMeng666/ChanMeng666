# X profile copy — @chanmeng666

Copy for the X (Twitter) profile fields — display name, bio, location, website, category. All outward copy is English. Facts trace to `data/profile/*.yaml` (identity/reach from `00-basics.yaml`, positioning from `90-meta.yaml` `meta.x_brand.valueProposition`, proof points from `20-projects-flagship.yaml`).

## Previous live state (rollback record)

| Field | Value before 2026-07 update |
|---|---|
| Display name | `Chan Meng` |
| Bio | _(empty — no bio text on profile)_ |
| Location | _(empty — none shown)_ |
| Website | _(empty — none shown; profile showed only "Joined December 2024")_ |
| Header photo | Photographic alpine landscape (not branded): snow-capped Dolomites-style peak, golden autumn larch forest, a wooden alpine hut at right, overcast sky. Captured only in `screenshots/00-before-profile.png` — X keeps no image history, so the original file cannot be recovered at full resolution. |
| Pinned tweet | None. Top post was a 15h-old, non-pinned post ("Suno's public /api/trending has served the same 49 songs since Sept 2024…", linking chanmeng666.medium.com "The Explore Feed That Froze"). No "Pinned" label present. |

## Fields to set

**Display name** (≤50 chars) — chosen: `Chan Meng — AI Agent Architect` (30 chars)

Pattern `Chan Meng — <short role descriptor>`. "AI Agent Architect" is the lead descriptor from `basics.label` and `meta.x_brand.valueProposition.identity`; it is the single most search-relevant role for both recruiters and technical readers, so it earns the display-name slot over the longer "& Full-Stack Engineer" (which lives in the bio instead).

**Bio** (≤160 chars) — chosen primary:

> AI agent architect & full-stack engineer. I ship AI-native products end to end — creator of Tam-AI-Ti, a Te Whare Tapa Whā AI coach. chanmeng.org

(145 chars.) Contains (a) compressed identity — AI agent architect + full-stack engineer; (b) one flagship proof point — Tam-AI-Ti, the Te Whare Tapa Whā AI coach (`20-projects-flagship.yaml`, flagship, live at tamaiti.whiri-ai.com); (c) pointer to chanmeng.org. The human-stakes lead ("I ship AI-native products end to end") reads for a recruiter; the named product and the cultural-tech specificity read for an engineer. X bios count plain characters and do not t.co-shorten URLs, so `chanmeng.org` is counted verbatim.

**Location** — `Auckland, New Zealand`

**Website** — `https://chanmeng.org/`

**Professional category** — recommend `Science & Technology`.

Reasoning: X's Professional Account category taxonomy has no "software engineer" entry; "Science & Technology" is the closest fit for an AI-agent architect and matches the account's actual content. It requires switching to a (free) Professional account — if Chan prefers to stay on a standard account, this field is n/a and can be skipped with no impact on the bio/name copy above.

## Alternate bios

**Alternate 1** (148 chars) — credential-forward, recruiter-leaning:

> AI Agent Architect · Founding engineer · AI educator. 480+ GitHub stars, Master’s with Distinction. AI, cultural tech & women’s health. chanmeng.org

_When to use:_ during an active job search or recruiter-heavy period, when the adoption signal (480+ stars — given by other people, per the `proofLine` note in `90-meta.yaml`) and the credential do more work than a single named product.

**Alternate 2** (153 chars) — builder/open-source-leaning:

> I architect AI agents & ship full-stack platforms solo. Creator of Tam-AI-Ti and an early Model Context Protocol server (PulseMCP Top Pick). chanmeng.org

_When to use:_ when the audience skews developer/open-source (e.g. after MCP or agent-tooling posts), where "early Model Context Protocol server (PulseMCP Top Pick)" is the strongest credibility hook for technical readers.

## Character-count verification

```
$ node -e '
const items = {
  "display":  "Chan Meng — AI Agent Architect",
  "primary":  "AI agent architect & full-stack engineer. I ship AI-native products end to end — creator of Tam-AI-Ti, a Te Whare Tapa Whā AI coach. chanmeng.org",
  "alt1":     "AI Agent Architect · Founding engineer · AI educator. 480+ GitHub stars, Master’s with Distinction. AI, cultural tech & women’s health. chanmeng.org",
  "alt2":     "I architect AI agents & ship full-stack platforms solo. Creator of Tam-AI-Ti and an early Model Context Protocol server (PulseMCP Top Pick). chanmeng.org"
};
for (const [k,v] of Object.entries(items)) console.log(k.padEnd(9), String(v.length).padStart(3), (v.length<=(k==="display"?50:160)?"OK ":"OVER"), JSON.stringify(v));
'
display    30 OK  "Chan Meng — AI Agent Architect"
primary   145 OK  "AI agent architect & full-stack engineer. I ship AI-native products end to end — creator of Tam-AI-Ti, a Te Whare Tapa Whā AI coach. chanmeng.org"
alt1      148 OK  "AI Agent Architect · Founding engineer · AI educator. 480+ GitHub stars, Master’s with Distinction. AI, cultural tech & women’s health. chanmeng.org"
alt2      153 OK  "I architect AI agents & ship full-stack platforms solo. Creator of Tam-AI-Ti and an early Model Context Protocol server (PulseMCP Top Pick). chanmeng.org"
```

Display name 30/50, primary bio 145/160, alt1 148/160, alt2 153/160 — all within limits.
