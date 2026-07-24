# Extended-CV magazine — curated photo set

Compressed selects for `chan-meng-cv-extended.pdf` (16-page image-led magazine).
Each file is resized to max 1400px on the long edge, progressive mozjpeg q80
(q68 auto-retry if over), asserted ≤ 400 KB. Referenced by later layout tasks
via relative path `/cv/assets/extended/<name>.jpg`.

Source repos are external and read-only:
- `2d-portfolio` (chanmeng.org blog assets)
- `ai-programming-teaching-project` (teaching project assets)

The one-off `sharp` compressor lives in scratch
(`D:\.claude-scratch\2026-07-24\cv-extended-magazine\compress.mjs`) and is **not**
committed; only the outputs below land in the repo.

| Output file | Source (absolute) | Serves page |
|---|---|---|
| `min-empty-room.jpg` | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\13.png` | pp5–7 "A Minimalist" |
| `min-foam-mat.jpg` | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\16.png` | pp5–7 "A Minimalist" |
| `min-one-bag.jpg` | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\09.png` | pp5–7 "A Minimalist" |
| `min-suitcase.jpg` | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\08.png` | pp5–7 "A Minimalist" |
| `min-city-livingroom.jpg` | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\03.png` | pp5–7 "A Minimalist" |
| `min-desk.jpg` | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\06.png` | pp5–7 "A Minimalist" |
| `namechange-hero.jpg` | `D:\github_repository\2d-portfolio\public\blog\threw-away-my-old-name\01.png` | pp5–7 "A Minimalist" (chapter hero / title card) |
| `teach-banana-1.jpg` | `D:\github_repository\ai-programming-teaching-project\static\img\peyvand-academy\peyvand-academy-13-june-2026-photo-6.webp` | p12 Teaching |
| `teach-banana-2.jpg` | `D:\github_repository\ai-programming-teaching-project\static\img\peyvand-academy\peyvand-academy-13-june-2026-photo-2.webp` | p12 Teaching |
| `cap-joborg.jpg` | `D:\github_repository\ai-programming-teaching-project\static\img\capstone\joborg-ai.webp` | p12 capstone strip |
| `cap-icare.jpg` | `D:\github_repository\ai-programming-teaching-project\static\img\capstone\icare.webp` | p12 capstone strip |
| `cap-credithero.jpg` | `D:\github_repository\ai-programming-teaching-project\static\img\capstone\credithero.webp` | p12 capstone strip |
| `rec-amy-li.png` | `public\recommendations\Amy-Li.jpg` (repo-local re-copy) | pp13–14 "Voices" avatar wall |

## Selection notes

**Minimalist selects** — each is a distinct room/composition of Chan's extreme-minimalist
period; no watermark, no third-party faces. `min-empty-room` (bare room, city view,
lone suitcase), `min-foam-mat` (foam sleeping mat on the floor), `min-one-bag` (single
backpack in a near-empty room), `min-suitcase` (silver suitcase by the bedroom door),
`min-city-livingroom` (lounge chair at the window over the city), `min-desk` (bare desk
with mirror + open shelves).

**`namechange-hero.jpg`** — the "threw away my old name" essay's clean title-card
illustration (reads "TO THE EXTREME OF MINIMALISM — I THREW AWAY MY OLD NAME"). Chosen
because every *photo* in that source folder carries a "看客 INSIGHT" (NetEase) publisher
watermark, which must not appear in Chan's own magazine.
_Preferred future replacement: un-watermarked original of 16.jpg (stone-alley, red
backpack) — request from Chan via shot list._

**Teaching frames — actual visible content (caption truthfully, do NOT claim a banana
piano is pictured):**
- `teach-banana-1.jpg` = She Sharp / Peyvand Academy "AI & Electronics Workshop" (Youth
  Tech Series 2026), presenter lineup on stage in front of the projected title slide,
  audience shot from behind.
- `teach-banana-2.jpg` = Chan presenting at the front of the same workshop, audience shot
  from behind (backs of heads).
- No frame in this set distinctly shows the Makey Makey banana-piano demo. The
  banana-piano may only be mentioned in body narrative; image captions must describe the
  workshop scene above. The group photo showing ~30 minors' faces head-on was deliberately
  excluded.

**`rec-amy-li.png`** — a repo-local copy of Amy Li's recommender avatar for the
pp13–14 "Voices" wall. The shared asset `public/recommendations/Amy-Li.jpg` is
**PNG bytes behind a `.jpg` name**; Typst picks its decoder from the file
extension and fails to load it. The shared file is left untouched (other
surfaces rely on its path); this correctly-named `.png` copy sits beside the
book so `cv/extended.typ` can reference it. Not a resized magazine select —
it's an avatar-sized image kept as-is.

**Capstone screenshots** — clean product marketing screenshots of three teaching-cohort
capstone apps: Joborg AI (interview coach), iCare (medical-records plain-English summariser),
CreditHero (credit-monitoring dashboard).
