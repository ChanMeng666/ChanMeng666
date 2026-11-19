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

_v4, written 2026-11-19 for the rulings of that day (positioning "I build AI products and the checks that keep them honest.", ArchCanvas as an "AI architectural designer"; never "buildable", "permit-ready", "code-compliant" or "in seconds"), not yet applied on X. What is live is [`account.yaml`](./account.yaml)._

**Display name** (≤50 chars) — unchanged: `Chan Meng — AI Agent Architect` (30 chars)

Pattern `Chan Meng — <short role descriptor>`. "AI Agent Architect" is the lead descriptor from `basics.label` and `meta.x_brand.valueProposition.identity`, and the LinkedIn headline keeps it after the 2026-11-19 positioning change, so it stays.

**Bio** (≤160 chars) — chosen primary (v4):

> I build AI products and the checks that keep them honest. ArchLang (archlang.uk): floor plans as code. ArchCanvas (archcanvas.uk): AI architectural designer.

(157 chars.) Opens on the positioning sentence verbatim (`meta.x_brand.valueProposition.tagline`), then the two own products, each with its live link as a bare domain: **ArchLang** (`archlang.uk`, the floor-plan language; "floor plans as code" is the live bio's own phrase) and **ArchCanvas** (`archcanvas.uk`, the AI architectural designer built on it). X bios count plain characters and are NOT t.co-wrapped, and X auto-links bare domains. No `chanmeng.org`: the Website field carries it.

_Live since about 2026-11-13 (`account.yaml`, read 2026-11-13), replaced by v4 when Chan applies it:_

> Floor plans as code. ArchLang (archlang.uk): .arch → dimensioned plan + 3D. ArchCanvas is the AI agent on top.

_Earlier bios, kept for history: v1 (applied 2026-07-19, superseded the same day) read "AI agent architect & full-stack engineer. I ship AI-native products end to end — creator of Tam-AI-Ti, a Te Whare Tapa Whā AI coach. chanmeng.org". v2 (2026-07-19, together with the redesigned header and the pinned thread) and its 2026-10-07 trim named ArchCanvas with "buildable", which the copy law has ruled out since; their text is in this file's git history before 2026-11-19. Do not reapply any of them._

**Location** — `Auckland, New Zealand` (unchanged)

**Website** — `https://chanmeng.org/?ref=x` (was `https://chanmeng.org/`). The `?ref=x` lets the site tell a visit came from X (`docs/STATE.md`, Visit attribution). X shows the website field as `chanmeng.org/?ref=x`.

**Professional category** — recommend `Science & Technology`.

Reasoning: X's Professional Account category taxonomy has no "software engineer" entry; "Science & Technology" is the closest fit for an AI-agent architect and matches the account's actual content. It requires switching to a (free) Professional account — if Chan prefers to stay on a standard account, this field is n/a and can be skipped with no impact on the bio/name copy above.

## Alternate bios

**Alternate 1** (152 chars) — availability-leaning:

> I build AI products and the checks that keep them honest. Open to founding-team and senior AI engineering roles, client projects, and AI-tooling advice.

_When to use:_ during an active job search or recruiter-heavy period. Both sentences are the 2026-11-19 rulings verbatim; the products are left to the pinned thread and the Website field.

**Alternate 2** (137 chars) — builder / open-source-leaning, closest to the live bio:

> I build AI products and the checks that keep them honest. Floor plans as code: ArchLang (archlang.uk). ArchCanvas is the AI agent on top.

_When to use:_ when the audience skews developer/open-source (e.g. after agent-tooling or DSL posts). Keeps the live bio's ArchLang-first framing after the positioning sentence. No `chanmeng.org`.

## Character-count verification

```
$ node -e '
const items = {
  "display":  "Chan Meng — AI Agent Architect",
  "primary":  "I build AI products and the checks that keep them honest. ArchLang (archlang.uk): floor plans as code. ArchCanvas (archcanvas.uk): AI architectural designer.",
  "alt1":     "I build AI products and the checks that keep them honest. Open to founding-team and senior AI engineering roles, client projects, and AI-tooling advice.",
  "alt2":     "I build AI products and the checks that keep them honest. Floor plans as code: ArchLang (archlang.uk). ArchCanvas is the AI agent on top."
};
for (const [k,v] of Object.entries(items)) console.log(k.padEnd(9), String(v.length).padStart(3), (v.length<=(k==="display"?50:160)?"OK ":"OVER"), JSON.stringify(v));
'
display    30 OK  "Chan Meng — AI Agent Architect"
primary   157 OK  "I build AI products and the checks that keep them honest. ArchLang (archlang.uk): floor plans as code. ArchCanvas (archcanvas.uk): AI architectural designer."
alt1      152 OK  "I build AI products and the checks that keep them honest. Open to founding-team and senior AI engineering roles, client projects, and AI-tooling advice."
alt2      137 OK  "I build AI products and the checks that keep them honest. Floor plans as code: ArchLang (archlang.uk). ArchCanvas is the AI agent on top."
```

Display name 30/50, primary bio 157/160, alt1 152/160, alt2 137/160 — all within limits. No bio contains `chanmeng.org`, and none uses "buildable" or "AI architect" for ArchCanvas.
