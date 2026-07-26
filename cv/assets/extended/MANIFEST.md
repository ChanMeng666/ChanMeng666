# Extended-CV magazine — curated photo set

Compressed selects for `chan-meng-cv-extended.pdf` (16-page image-led magazine).
Each file is resized to max 1400px on the long edge, progressive mozjpeg q80
(q68 auto-retry if over), asserted ≤ 400 KB. Referenced by later layout tasks
via relative path `/cv/assets/extended/<name>.jpg`.

Source repos and folders are external and read-only:
- `2d-portfolio` (chanmeng.org blog assets)
- `ai-programming-teaching-project` (teaching project assets)
- `C:\Users\0\Downloads\photo\` (Chan's own photo library, supplied 2026-07-26)

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
| `teach-banana-2.jpg` | `D:\github_repository\ai-programming-teaching-project\static\img\peyvand-academy\peyvand-academy-13-june-2026-photo-2.webp` | p12 Teaching (re-cropped square 2026-07-26) |
| `teach-kids-laptop.jpg` | `C:\Users\0\Downloads\photo\Teaching.HEIC` | p12 Teaching |
| `story-lincoln.jpg` | `C:\Users\0\Downloads\photo\lincoln university.jpg` | p4 "My Story" |
| `story-nanning.jpg` | `C:\Users\0\Downloads\photo\china-nanning.jpg` | p4 "My Story" |
| `story-corde.jpg` | `C:\Users\0\Downloads\photo\CORDE-1.jpg` | p4 "My Story" |
| `douban-logo.svg` | Wikimedia Commons `File:Douban logo.svg` — https://commons.wikimedia.org/wiki/File:Douban_logo.svg (**public domain**, trademarked; credited to Douban, transferred from zh.wikipedia). Downloaded from `https://upload.wikimedia.org/wikipedia/commons/a/aa/Douban_logo.svg`, byte-identical, not re-encoded. | p6 "A Minimalist" — 2nd article-card cover |
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

## Revision wave 3 (2026-07-26) — Chan's own photo library

**NO-DUPLICATES RULE (book-wide invariant).** A distinct photo appears in the
16-page magazine **at most once**, and near-identical frames of the same moment
count as the same photo. Two violations were found and fixed in this wave:

1. `public/articles/p658073376.webp` (p6 article-card cover) was the **same
   frame** as `min-desk.jpg` on p7 — the quilt-on-tile-floor room, both 1080×807.
   Fixed by D1: the p6 card now carries `douban-logo.png`, and the room photo
   keeps its single appearance on p7.
2. `public/photos/chanmeng-portrait-2026.jpg` (p4) was a tight crop of the
   **same boat frame** as `public/photos/chan-celebrate.jpg` (p2 band) — Chan
   in a life vest, arms up, at sea, matching the source-library file `cebu.JPG`.
   Its caption also claimed "Auckland, 2026" over a tropical-sea photo. Fixed by
   rebuilding p4 on the Lincoln/Nanning/CORDE trio; p2's caption was corrected to
   describe what the frame actually shows. Note the p1 cover
   (`chan-by-the-tree.jpg`) is the source library's `Cebu-Language School.jpg`
   — a *different* frame from the same trip, so it stays.

**`douban-logo.svg`** — the publisher mark of Douban, where *A Glimpse of My
Minimalist Home* ran. Makes all three p6 cards outlet-branded (最人物 / Douban /
NetEase 看客).

This is the **wordmark** (豆瓣 douban), not the square green app icon Chan first
supplied. That icon is Wikimedia's `File:Logo of Douban (Small).png` and its name
is literal: **100×100 px is the only raster that exists**. Checked the Commons
`Category:Douban`, a namespace-6 search for "Douban", and the file list of the
en-wiki *Douban* article — Wikimedia holds exactly two Douban brand assets, that
100 px icon and this vector wordmark. At 100 px against a ~153×150 pt card the
icon printed at roughly 48 dpi and its diagonals stair-stepped visibly at 300 ppi.

The SVG has no such ceiling: it is true vector, so it is exactly sharp at any
size. It is also **Typst-safe** — pure `<path>` elements with concrete
`fill:rgb(...)` values, no `currentColor` (which Typst would not inherit, see
TYPST_PITFALLS §6), no nested `<svg>`, no `<use>`, no `<text>` or font
dependencies. Verified by rendering p6 at 300 ppi: zero aliasing.

The trade is shape, not quality. A 4.7∶1 wordmark letterboxes onto the cream card
rather than filling it like its two square neighbours — which is precisely the
case `article-card`'s `fit:"contain"` + cream gutter was built for, and it gives
the row useful tonal variety (black card, cream card, white card). It also puts a
Latin-readable "douban" in front of recruiters who cannot read 豆瓣 or 看客.

**Story photos (p4)** — all three are Chan's own, from her library. Anchor facts
verified against `data/profile/10-career.yaml`: the Lincoln Master of Applied
Computing starts `2023-11` and the Lincoln frame carries its own burned-in camera
date stamp reading `2023/11/16` (the stamp is cropped off in the compressed
select — the band's cover-crop sliced it in half, and the caption carries the
date anyway); CORDE is the Lincoln **COMP693 industry placement**, Canterbury,
`2024-06`→`2024-11`; Nanning is where Chan went to school (`education: nanning-no2`,
Nanning No.2 High School, Guangxi). Captions state only those verified facts.

**`teach-kids-laptop.jpg`** (p12) — converted from `Teaching.HEIC` (4284×5712;
`heic-convert` in scratch, since ImageMagick is not on PATH). It is **not** a
duplicate of `Teaching.jpg`/`Teaching.png` despite the shared stem — it is a
different moment: Chan leaning over a laptop running a browser game, explaining
it to a huddle of students, She Sharp banners behind. **Every child in it is shot
from behind or above; no identifiable faces**, which is precisely why it clears
the bar the other frames from that day do not. Same venue as `teach-banana-*`
(the AI & Electronics Workshop), so the caption says "the same workshop".

**Excluded from the supplied library, with reasons:**

| Source file | Why it is not in the book |
|---|---|
| `China - Minimalism-1..4.png` | All four carry the **看客 INSIGHT (NetEase) watermark** top-left — the exact thing this manifest already bars. Each is also a near-duplicate of a `min-*` frame on p5/p7 (‑3 is another angle on the p7 quilt room; ‑4 is the p5 city-livingroom mattress). ‑1 and ‑2 additionally show transitional, still-cluttered rooms (mops, bins), which Chan rejected in wave 2. |
| `离开中国时我的所有行李.png` | Same NetEase watermark, **and** it is a close-up of the identical red backpack + wrapped bundle already on p5 as `min-one-bag.jpg`. |
| `speaker.jpg` | Near-identical frame to p3's existing `chan-panel-shesharp-gesturing.jpg` — same She Sharp panel, same three speakers, same clothes, same projected slide. p3 keeps the more animated frame. |
| `Teaching.jpg` | The ~30-minors-head-on group photo this manifest already documents excluding. |
| `Teaching.png` | A boardroom of uniformed schoolgirls with faces visible — same minors concern. |
| `she sharp-2.jpg` | ~50-person group photo including many minors, faces head-on. |
| `Maori Dance Troupe - Translation Volunteer.jpg` | The co-subject is an identifiable private individual wearing a moko kauae, and a child is visible in the background. |
| `she sharp-1.jpeg` | An unrelated adult co-subject sits front-and-centre beside Chan and is not a billed public speaker (unlike the p3 panel, where the others are named on the event's own slide). Held as a spare pending Chan's explicit OK. |
| `cebu.JPG`, `Cebu-Language School.jpg` | Already in the book as `chan-celebrate.jpg` (p2) and `chan-by-the-tree.jpg` (p1). |
| `CORDE-2.jpg`, `CORDE-3.jpg` | Good frames (Chan beside CORDE fleet vehicles) but near-duplicates of each other, and one CORDE frame is enough. **Available spares.** |

**Student-capstone screenshots (removed 2026-07-24)** — the p12 strip showing three
teaching-cohort capstone apps (Joborg AI, iCare, CreditHero) was cut: student projects
read as less professional and could be mistaken for Chan's own work. The `cap-*.jpg`
files were deleted; the two workshop photos were enlarged to rebalance the page.
