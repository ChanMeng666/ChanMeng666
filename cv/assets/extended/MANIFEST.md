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
| `min-one-bag.jpg` | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\26.png` | pp5–7 "A Minimalist" |
| `min-suitcase.jpg` | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\08.png` | pp5–7 "A Minimalist" (unused spare) |
| `min-city-livingroom.jpg` | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\22.png` | pp5–7 "A Minimalist" |
| `min-desk.jpg` | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\24.png` | pp5–7 "A Minimalist" |
| `namechange-hero.jpg` | `D:\github_repository\2d-portfolio\public\blog\threw-away-my-old-name\01.png` | pp5–7 "A Minimalist" (chapter hero / title card) |
| `teach-banana-1.jpg` | `D:\github_repository\ai-programming-teaching-project\static\img\peyvand-academy\peyvand-academy-13-june-2026-photo-6.webp` | p12 Teaching |
| `teach-banana-2.jpg` | `D:\github_repository\ai-programming-teaching-project\static\img\peyvand-academy\peyvand-academy-13-june-2026-photo-2.webp` | p12 Teaching |
| `rec-amy-li.png` | `public\recommendations\Amy-Li.jpg` (repo-local re-copy) | pp13–14 "Voices" avatar wall |

## Selection notes

**Minimalist selects** — each is a distinct room/composition from Chan's extreme-minimalist
period; no watermark, no third-party faces. Reselected 2026-07-24 to show ONLY the
fully-realized minimalist state (near-empty rooms drawn from the LATE, most-minimal end
of the chronological blog set — earlier "transitional" frames with furniture, desks, and
lounge setups were dropped): `min-empty-room` (13 — bare room, big windows, lone
suitcase), `min-foam-mat` (16 — foam sleeping mat on a bare tile floor), `min-one-bag`
(26 — a red backpack and one wrapped bundle against a bare wall), `min-city-livingroom`
(22 — a thin mattress on the floor as a bed, city out the window), `min-desk` (24 — a
totally bare room, one folded quilt on the floor in a pool of sun; repurposed on p7 as
the minimalism→engineering bridge). `min-suitcase` (08) is now placed on p6 (revision
wave 2, 2026-07-24) as the large frame anchoring the media-features page foot.

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

**Student-capstone screenshots (removed 2026-07-24)** — the p12 strip showing three
teaching-cohort capstone apps (Joborg AI, iCare, CreditHero) was cut: student projects
read as less professional and could be mistaken for Chan's own work. The `cap-*.jpg`
files were deleted; the two workshop photos were enlarged to rebalance the page.
