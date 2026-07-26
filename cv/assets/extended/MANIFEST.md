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
| `open-cebu-boat.jpg` | `C:\Users\0\Downloads\photo\cebu.JPG` (6000×4000 original) | p2 opening note |
| `min-empty-room.jpg` | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\13.png` | pp5–7 "A Minimalist" |
| ~~`min-foam-mat.jpg`~~ | `…\minimalist-lifestyle-journey\16.png` | **retired 2026-07-26 (wave 4)** — see "Retired" below |
| `min-room-panorama.jpg` | `C:\Users\0\Downloads\photo\China - Minimalism-2.png` (supplied by Chan 2026-07-26) | p5 "A Minimalist" — establishing frame |
| `min-one-bag.jpg` | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\26.png` | pp5–7 "A Minimalist" |
| ~~`min-suitcase.jpg`~~ | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\08.png` | **retired 2026-07-26** — see "Retired" below |
| `min-city-livingroom.jpg` | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\22.png` | pp5–7 "A Minimalist" |
| `min-desk.jpg` | `D:\github_repository\2d-portfolio\public\blog\minimalist-lifestyle-journey\24.png` | pp5–7 "A Minimalist" |
| `namechange-hero.jpg` | `D:\github_repository\2d-portfolio\public\blog\threw-away-my-old-name\01.png` | pp5–7 "A Minimalist" (chapter hero / title card) |
| ~~`teach-banana-1.jpg`~~ | `…peyvand-academy-13-june-2026-photo-6.webp` | **retired 2026-07-26 (wave 4)** — see "Retired" below |
| ~~`teach-banana-2.jpg`~~ | `…peyvand-academy-13-june-2026-photo-2.webp` | **retired 2026-07-26** — see "Retired" below |
| `teach-westlake-hackathon.jpg` | `C:\Users\0\Downloads\photo\Teaching.png` (supplied by Chan 2026-07-26) | p12 Teaching |
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
suitcase), ~~`min-foam-mat`~~ (16 — foam sleeping mat on a bare tile floor; **retired in
wave 4** as a near-twin of `min-empty-room`), `min-one-bag`
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
- ~~`teach-banana-1.jpg`~~ = She Sharp / Peyvand Academy "AI & Electronics Workshop" (Youth
  Tech Series 2026), presenter lineup on stage in front of the projected title slide,
  audience shot from behind. **Chan is second from the right** — buzzcut, dark
  fur-collar coat. She is standing in the lineup, not speaking. **Retired in wave 4** —
  see "Retired" below.
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
(the AI & Electronics Workshop). Its caption used to read "the same workshop",
which pointed at `teach-banana-1` beside it; with that frame retired in wave 4
the caption now names the workshop directly ("A She Sharp workshop for teens"),
bounded by `80-events.yaml`'s `peyvand-academy-makey-makey-2026` (12–18-year-olds,
She Sharp × Peyvand Academy).

**Excluded from the supplied library, with reasons:**

| Source file | Why it is not in the book |
|---|---|
| `China - Minimalism-1, -3, -4.png` | All carry the **看客 INSIGHT (NetEase) watermark** top-left. ‑3 and ‑4 are near-duplicates of `min-*` frames (‑3 is another angle on the p7 quilt room; ‑4 is the p5 city-livingroom mattress). ‑1 shows a transitional, still-cluttered room, which Chan rejected in wave 2. **‑2 is no longer excluded** — Chan called it in herself in wave 4; it ships as `min-room-panorama.jpg`, see below. |
| `离开中国时我的所有行李.png` | Same NetEase watermark, **and** it is a close-up of the identical red backpack + wrapped bundle already on p5 as `min-one-bag.jpg`. |
| `speaker.jpg` | Near-identical frame to p3's existing `chan-panel-shesharp-gesturing.jpg` — same She Sharp panel, same three speakers, same clothes, same projected slide. p3 keeps the more animated frame. |
| `Teaching.jpg` | The ~30-minors-head-on group photo this manifest already documents excluding. |
| ~~`Teaching.png`~~ | Was excluded for minors' faces. **No longer excluded** — Chan called it in herself in wave 4; it ships as `teach-westlake-hackathon.jpg`, see below. |
| `she sharp-2.jpg` | ~50-person group photo including many minors, faces head-on. |
| `Maori Dance Troupe - Translation Volunteer.jpg` | The co-subject is an identifiable private individual wearing a moko kauae, and a child is visible in the background. |
| `she sharp-1.jpeg` | An unrelated adult co-subject sits front-and-centre beside Chan and is not a billed public speaker (unlike the p3 panel, where the others are named on the event's own slide). Held as a spare pending Chan's explicit OK. |
| ~~`cebu.JPG`~~ | Was listed as "already in the book as `chan-celebrate.jpg`". That was only half true — `chan-celebrate.jpg` is a 1920×560 letterbox of it. **Now in the book in full** as `open-cebu-boat.jpg` (p2), see below. |
| `Cebu-Language School.jpg` | Already in the book as `chan-by-the-tree.jpg` (p1). |
| `CORDE-2.jpg`, `CORDE-3.jpg` | Good frames (Chan beside CORDE fleet vehicles) but near-duplicates of each other, and one CORDE frame is enough. **Available spares.** |

## Revision wave 4 (2026-07-26) — three frames Chan called in herself

Wave 3 excluded two of these three on this manifest's own standing rules.
**Chan has since directed all three in.** Where her direction overrides a rule,
that is recorded plainly below rather than quietly reworded — the rules still
hold for every frame she has not personally ruled on.

**`open-cebu-boat.jpg`** (p2) — the whole boat frame, uncropped. The page used to
run `public/photos/chan-celebrate.jpg` through a 322pt cover-crop band and Chan
asked to see the photo complete. The band was not the problem: **that shared file
is itself a 1920×560 letterbox** — `media-kit/README.md` calls it "a kit-only
crop" — so no change to the Typst `fit:` could have recovered the rest of the
frame. Rebuilt from the 6000×4000 original at 1400px. The full 3∶2 frame shows
Chan sitting cross-legged on the boat's outrigger, sea and island behind; the
letterbox had cut her off at the chest. Drawn at natural aspect by `photo()` —
no crop, no letterbox — it stands 325pt tall against the 322pt band it replaces,
so p2's balance carries over unchanged. **The media kit's own crop is untouched**;
other surfaces still resolve `chan-celebrate.jpg`. Caption unchanged: the fuller
frame makes "arms up, out on the water" more accurate, not less.

**`min-room-panorama.jpg`** (p5, top-right) — supplied by Chan 2026-07-26,
included **at her explicit direction**, which **consciously overrides this
manifest's standing watermark exclusion**. It is a **NetEase 看客 (INSIGHT) press
photo** and wave 3 barred it on exactly that ground. Chan chose it deliberately,
in her words, to show the room "完整地展示我整个房间的四个方位，无死角" — all four
directions of the room, no dead angles.

_Watermark disposition: **removed by cropping, not retouching.**_ The mark sits in
source pixels x∈[21,83], y∈[24,115] of the 940×634 original. Two crops clear it:

| Candidate | Crop | Result | Cost |
|---|---|---|---|
| (a) shipped nothing | none | 940×634, ratio 1.483 | watermark reads plainly against the white wall at p5 cell size |
| **(b) SHIPPED** | **left 92px** | **848×634, ratio 1.3375** | outer sliver of an already part-cropped door; 9.8% of width |
| (alt) rejected | top 118px | 940×516, ratio 1.822 | 18.3% of height, and the ragged aspect breaks the p5 row |

(b) ships. Rendered at the true p5 cell size (236.78pt → 493px at 150ppi) and
compared against (a), every one of the four directions survives: the front door
still reads as a door with its lock plate, and the bathroom doorway, intercom,
mop, bucket, bare right wall, and tiled floor are all untouched. No inpainting or
retouching of any kind was done. The 1.3375 result also lands within 0.0008 of
its row-mate `min-empty-room`'s 1.3383, so the p5 top row aligns exactly.
Both candidate renders are kept for Chan in
`D:\.claude-scratch\2026-07-26\cv-w4\`.

**`teach-westlake-hackathon.jpg`** (p12, left) — supplied by Chan 2026-07-26,
**included at Chan's explicit direction, 2026-07-26; her event, her call on
consent.** This frame was excluded in wave 3 for minors' faces (four Westlake
Girls High School students are identifiable at mid-distance). It shows a
boardroom at AUT: students in red blazers around the table, Gemini CLI on the
wall screen, and Chan at the laptop beside it. It replaces `teach-banana-1.jpg`,
in which Chan merely stood in a lineup of presenters — this one shows her doing
the thing the chapter is about. Caption facts cross-checked against
`data/profile/30-recognition.yaml` (Outstanding Mentor Award — AI Hackathon
Festival 2025, AI Forum NZ × She Sharp × AUT, 1 of 14 mentors, 11 teams, 80+
participants, cohort explicitly including "students from Westlake Girls High
School") and `80-events.yaml` (`ai-hackathon-festival-2025-mentor`, venue AUT).
The caption does **not** claim she is presenting to the room; she is at the
laptop, which is what the frame shows.

_Bound for the mentee-range sentence on p12:_ the data supports **12–18-year-olds**,
**high-school students** (Westlake Girls, above), and **adults** (TechNest's
12-week AI track, Her Waka's women returning to work).

It does **not** support "primary schoolers". The Peyvand cohort is
`audience: "Youth aged 12–18; zero coding experience"` at **`90-meta.yaml:181`**,
and `80-events.yaml`'s `peyvand-academy-makey-makey-2026` says 12–18 as well.
**Watch this one:** the *same* `90-meta.yaml` line records the workshop as held
"in person at **Fruitvale Primary School**, Auckland" — that is the **venue, not
the age group**, and the school's name is exactly the trap that would produce a
false "primary schoolers" claim.

It does **not** support "university students" either — AUT co-organised the
hackathon, but the award text describes the non-school participants only as
coming "from various professional backgrounds." Both claims were checked and
dropped.

### Zero-duplicate audit — wave 4

Every frame the three new files could collide with, checked by eye at page size:

| New file | Compared against | Verdict |
|---|---|---|
| `open-cebu-boat.jpg` (p2) | `chan-by-the-tree.jpg` (p1 cover) | Different frame from the same Cebu trip — p1 is a portrait by a tree. Clear. |
| `open-cebu-boat.jpg` | the retired `chanmeng-portrait-2026.jpg` | That was the tight crop of this frame wave 3 removed. Nothing left to collide with. |
| `min-room-panorama.jpg` (p5) | `min-empty-room` (p5), `min-city-livingroom` (p5) | Different wall, different corner. Clear. |
| `min-room-panorama.jpg` | `min-one-bag` (p5) | ⚠ **Overlap, accepted.** Both show the entrance door and the mop, from roughly opposite oblique angles. Different composition, different moment, different subject (packed bag vs. empty room). Placed diagonally in the 2×2 — the furthest apart the grid allows. |
| `min-room-panorama.jpg` | `min-desk` (p7) | ⚠ **Overlap, accepted.** Both show the bathroom doorway, purple bucket, hanging toiletries and mop. Different camera position, different moment (quilt / no quilt), different subject; two pages apart. |
| `teach-westlake-hackathon.jpg` (p12) | `teach-kids-laptop` (p12) | Different event, venue, age group and year. Clear. |
| `teach-westlake-hackathon.jpg` | `chan-keynote-ai-hackathon-2025.jpg` (p15) | Same festival, but a lectern-and-auditorium keynote vs. a small boardroom. No shared framing. Clear. |

The two ⚠ rows are an **establishing-frame / detail-frame relationship**, not the
duplication this manifest bars. The rule is that a distinct photo appears once and
that *near-identical frames of the same moment* count as the same photo — wave 3's
two real violations were a byte-identical file used twice and a tight crop of an
already-used frame. A wide shot of a room whose corners also appear in detail
frames is ordinary photo editing, and it is the whole reason Chan picked this
frame. Recorded here rather than silently accepted: if Chan reads the p5/p7
bucket-and-doorway repeat as a duplicate, the frame to retire is `min-desk`.

Retiring `min-foam-mat` in this wave **reduced** the book's duplication rather
than adding to it — see below.

## Retired: `min-foam-mat.jpg` (2026-07-26, wave 4)

Deleted from the repo and unplaced from p5, where `min-room-panorama.jpg` now sits.
It was **the tightest near-twin left in the book**: the same room as
`min-empty-room.jpg` directly beside it on p5 — same window wall, same transom,
same balcony door, same air-conditioner, camera rotated only slightly. The two
differed mainly in what was on the floor (a suitcase in one, a foam mat in the
other). Wave 3's duplicate sweep did not catch the pair because it was hunting
identical files and crops, not two exposures of one wall.

So the frame Chan asked to place happened to displace the one frame most worth
displacing. No two frames in the book now show the same wall from the same
angle. (Not the stronger claim that no wall recurs at all — the audit above
records the panorama sharing the bathroom-doorway corner with `min-desk` on p7
and the entrance door with `min-one-bag` on p5, from different positions.)

## Retired: `teach-banana-1.jpg` (2026-07-26, wave 4)

Deleted from the repo and unplaced from p12, replaced by
`teach-westlake-hackathon.jpg`. It showed the She Sharp / Peyvand Academy "AI &
Electronics Workshop" presenter lineup on stage, audience from behind, with Chan
second from the right in the lineup — standing, not speaking. Nothing about it was
false. It went because it was the weakest claim on the page: a chapter about how
Chan teaches was spending half its picture budget on Chan standing in a row. Its
replacement shows her teaching. With `teach-banana-2` gone in wave 3, no frame
from that workshop's stage remains; `teach-kids-laptop` still carries the workshop
on p12's right, and the banana piano stays prose-only as before.

The file is regenerable from
`ai-programming-teaching-project\static\img\peyvand-academy\peyvand-academy-13-june-2026-photo-6.webp`.

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
