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

**Bio** (≤160 chars) — chosen primary (v2):

> AI agent architect & full-stack engineer. ArchCanvas (archcanvas.uk): describe a building → buildable floor plan. Vitex (vitex.org.nz): job ad → resume.

(152 chars.) Contains (a) compressed identity opener — AI agent architect + full-stack engineer; (b) two flagship products each with its live link as a bare domain and a value hint a stranger can parse — **ArchCanvas** (`archcanvas.uk`, the AI architect: describe a building and get a dimensioned, buildable floor plan) and **Vitex** (`vitex.org.nz`, the AI career agent: a job ad becomes a tailored resume). X bios count plain characters and are NOT t.co-wrapped, and X auto-links bare domains, so `archcanvas.uk` / `vitex.org.nz` render as clickable links at their literal character cost. No `chanmeng.org` — the Website field already carries it, so repeating it here would be redundant.

_Previous bio (v1, applied live 2026-07-19, superseded same day) — kept for history:_

> AI agent architect & full-stack engineer. I ship AI-native products end to end — creator of Tam-AI-Ti, a Te Whare Tapa Whā AI coach. chanmeng.org

_v2 applied live 2026-07-19 (@chanmeng666): the primary bio above was set live (renders with clean bare-domain links `archcanvas.uk` / `vitex.org.nz`); the header was replaced with the redesigned minimal `x/header/x-header.png`; the v1 pinned intro thread (root status `2078709504532000825`, 3 tweets) was deleted and a fresh 3-tweet thread from `x/x-pinned-tweet.md` was posted, with `x/media/pinned-products.png` attached to tweet 1 and pinned (new root status `2078727381859389815`). Auto-generated link cards were removed from tweets 2 and 3 so the thread's only media is tweet 1's product lineup. Display name, location, and website were left unchanged. The v0 rollback table above is preserved as the original pre-July baseline._

**Location** — `Auckland, New Zealand`

**Website** — `https://chanmeng.org/`

**Professional category** — recommend `Science & Technology`.

Reasoning: X's Professional Account category taxonomy has no "software engineer" entry; "Science & Technology" is the closest fit for an AI-agent architect and matches the account's actual content. It requires switching to a (free) Professional account — if Chan prefers to stay on a standard account, this field is n/a and can be skipped with no impact on the bio/name copy above.

## Alternate bios

**Alternate 1** (160 chars) — recruiter-leaning, "ships products solo":

> AI agent architect & full-stack engineer. I ship AI-native products solo: ArchCanvas (archcanvas.uk), an AI architect, and Vitex (vitex.org.nz), a career agent.

_When to use:_ during an active job search or recruiter-heavy period, where the "ships AI-native products solo" framing plus two live, linked, self-describing products (ArchCanvas = AI architect, Vitex = AI career agent) does more work than a bare credential list. Both products link out as bare domains; no `chanmeng.org` (Website field covers it).

**Alternate 2** (157 chars) — builder / open-source-leaning:

> I architect AI agents & ship full-stack solo. ArchCanvas (archcanvas.uk): brief → buildable floor plan. Vitex (vitex.org.nz): job ad → resume. Plus ArchLang.

_When to use:_ when the audience skews developer/open-source (e.g. after agent-tooling or DSL posts). Keeps the two linked flagship products but name-drops **ArchLang** (Chan's own floor-plan DSL that ArchCanvas compiles) as the extra credibility hook for technical readers. No `chanmeng.org`.

## Character-count verification

```
$ node -e '
const items = {
  "display":  "Chan Meng — AI Agent Architect",
  "primary":  "AI agent architect & full-stack engineer. ArchCanvas (archcanvas.uk): describe a building → buildable floor plan. Vitex (vitex.org.nz): job ad → resume.",
  "alt1":     "AI agent architect & full-stack engineer. I ship AI-native products solo: ArchCanvas (archcanvas.uk), an AI architect, and Vitex (vitex.org.nz), a career agent.",
  "alt2":     "I architect AI agents & ship full-stack solo. ArchCanvas (archcanvas.uk): brief → buildable floor plan. Vitex (vitex.org.nz): job ad → resume. Plus ArchLang."
};
for (const [k,v] of Object.entries(items)) console.log(k.padEnd(9), String(v.length).padStart(3), (v.length<=(k==="display"?50:160)?"OK ":"OVER"), JSON.stringify(v));
'
display    30 OK  "Chan Meng — AI Agent Architect"
primary   152 OK  "AI agent architect & full-stack engineer. ArchCanvas (archcanvas.uk): describe a building → buildable floor plan. Vitex (vitex.org.nz): job ad → resume."
alt1      160 OK  "AI agent architect & full-stack engineer. I ship AI-native products solo: ArchCanvas (archcanvas.uk), an AI architect, and Vitex (vitex.org.nz), a career agent."
alt2      157 OK  "I architect AI agents & ship full-stack solo. ArchCanvas (archcanvas.uk): brief → buildable floor plan. Vitex (vitex.org.nz): job ad → resume. Plus ArchLang."
```

Display name 30/50, primary bio 152/160, alt1 160/160, alt2 157/160 — all within limits. No bio contains `chanmeng.org`; each names ArchCanvas + Vitex with its bare-domain link and a value hint.
