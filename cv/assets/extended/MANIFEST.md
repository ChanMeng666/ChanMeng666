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
| ~~`min-suitcase.jpg`~~ | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\08.png` | **retired 2026-07-26** — see "Retired" below |
| `min-city-livingroom.jpg` | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\22.png` | pp5–7 "A Minimalist" |
| `min-desk.jpg` | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\24.png` | pp5–7 "A Minimalist" |
| `namechange-hero.jpg` | `D:\github_repository\2d-portfolio\public\blog\threw-away-my-old-name\01.png` | pp5–7 "A Minimalist" (chapter hero / title card) |
| `teach-banana-1.jpg` | `D:\github_repository\ai-programming-teaching-project\static\img\peyvand-academy\peyvand-academy-13-june-2026-photo-6.webp` | p12 Teaching |
| ~~`teach-banana-2.jpg`~~ | `…peyvand-academy-13-june-2026-photo-2.webp` | **retired 2026-07-26** — see "Retired" below |
| `teach-kids-laptop.jpg` | `C:\Users\0\Downloads\photo\Teaching.HEIC` | p12 Teaching |
| `story-lincoln.jpg` | `C:\Users\0\Downloads\photo\lincoln university.jpg` | p4 "My Story" |
| `story-nanning.jpg` | `C:\Users\0\Downloads\photo\china-nanning.jpg` | p4 "My Story" |
| `story-corde.jpg` | `C:\Users\0\Downloads\photo\CORDE-1.jpg` | p4 "My Story" |
| `douban-logo.svg` | Wikimedia Commons `File:Douban logo.svg` — https://commons.wikimedia.org/wiki/File:Douban_logo.svg (**public domain**, trademarked; credited to Douban, transferred from zh.wikipedia). Downloaded from `https://upload.wikimedia.org/wikipedia/commons/a/aa/Douban_logo.svg`, byte-identical, not re-encoded. | p6 "A Minimalist" — 2nd article-row cover |
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
the minimalism→engineering bridge). `min-suitcase` (08) was placed on p6 in wave 2 and
**retired 2026-07-26** — it was the one frame in the set that never met the standard the
rest of the sentence describes. See "Retired" below.

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
  audience shot from behind. **Chan is second from the right** — buzzcut, dark
  fur-collar coat. She is standing in the lineup, not speaking.
- ~~`teach-banana-2.jpg` = Chan presenting at the front of the same workshop~~ —
  **this description was WRONG and is retracted (2026-07-26).** Zooming the stage in the
  original `…photo-2.webp` shows the person holding the microphone is the event's host,
  a woman in a bright pink blazer with glasses; **Chan does not appear in that frame at
  all.** The error propagated into the p12 caption "Presenting from the front of the
  room", which attributed another person's presenting to Chan. The frame is retired —
  see "Retired" below.
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

1. `public/articles/p658073376.webp` (the cover of p6's 2nd media feature) was the **same
   frame** as `min-desk.jpg` on p7 — the quilt-on-tile-floor room, both 1080×807.
   Fixed by D1: the p6 card now carries `douban-logo.svg`, and the room photo
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

The trade is shape, not quality. A 4.7∶1 wordmark sits short inside its cover box
rather than filling it like its two square neighbours — which is precisely what
`article-row`'s fixed-size cover box handles: the mark is drawn `fit:"contain"`
and the slack around it falls through to the row's own cream ground (`pill-bg`),
so a wide mark and a square one occupy identical boxes. The three still give the
stack tonal variety (a black square, the colour wordmark, a white square). It
also puts a Latin-readable "douban" in front of recruiters who cannot read 豆瓣 or
看客. _(Written when p6 ran on `article-card` in a 3-across grid; the same
reasoning carried over verbatim when it was restacked as `article-row`s.)_

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

## Retired: `min-suitcase.jpg` (2026-07-26, Chan's ruling)

Deleted from the repo and unplaced from p6. It showed a room with a **full double bed,
a bedside table and curtains** under the caption *"A room pared back to the essentials —
one suitcase by the door."* That is a **transitional-state room: it fails Chan's
final-state standard** — the same standard that, in wave 2, drove every other `min-*`
frame to be reselected from the late, most-minimal end of the blog set. It survived that
pass only because it was added separately, later in the same wave, as page furniture.

The lesson worth keeping: a frame added to *fill space* skips the selection bar the rest
of the set had to clear. p6's foot is no longer filled with a photograph at all — the
three media features were restacked full-width to carry the page on their own, which
also fixed their cramped typography (see `extended.typ`).

`SHOT-LIST.md` keeps "an un-watermarked, fully-realised empty-room photo" as an
outstanding request, since no frame in Chan's supplied library can serve as a
replacement — every candidate carries the NetEase 看客 watermark.

## Retired: `teach-banana-2.jpg` (2026-07-26)

Deleted from the repo and unplaced from p12, in review. Three reasons, any one of
which would be enough:

1. **Its caption was false.** "Presenting from the front of the room" credited Chan
   with presenting; the person with the microphone is the event's host. The false
   premise came from this manifest's own frame description, now retracted above.
2. **Chan is not in the frame.** In a personal magazine, a picture the subject is
   absent from earns its place only by showing something she did — and this one
   shows someone else doing it.
3. **Its only identifiable subject is a private individual**, front and centre, not
   billed as a speaker in the shot. That is exactly the standard that keeps
   `she sharp-1.jpeg` out (see the exclusions table), so keeping this frame would have
   been inconsistent.

The file is regenerable from the source webp if it is ever wanted again. p12 went back
to a 2-up, which also lets the two surviving frames — both of which do show Chan, and
which share a 3∶4 aspect — run at 300 pt and nearly fill their boxes.

**Student-capstone screenshots (removed 2026-07-24)** — the p12 strip showing three
teaching-cohort capstone apps (Joborg AI, iCare, CreditHero) was cut: student projects
read as less professional and could be mistaken for Chan's own work. The `cap-*.jpg`
files were deleted; the two workshop photos were enlarged to rebalance the page.
