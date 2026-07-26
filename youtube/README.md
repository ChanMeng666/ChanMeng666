# `youtube/` — YouTube channel banner package

Everything for Chan Meng's YouTube channel (**[@ChanMeng666](https://www.youtube.com/@ChanMeng666)**)
in one place: the **Caldera-branded banner asset** and its render pipeline. All outward copy is
English. Facts trace back to [`../data/profile/`](../data/profile/) — the repository-wide source
of truth. The channel URL itself is registered in
[`00-basics.yaml`](../data/profile/00-basics.yaml) `basics.profiles` (`network: YouTube`).

## What's here

| File / folder | Kind | Purpose |
|---|---|---|
| [`banner/banner.html`](./banner/banner.html) | hand-curated | Caldera-branded banner source of truth, 1280×720 CSS surface (`data-out="youtube-banner.png"`). |
| `banner/youtube-banner.png` | **RENDERED** | The 2560×1440 (2×) banner image uploaded to YouTube Studio — **0.075 MB**, well under YouTube's 6 MB cap. **Never hand-edit.** Edit `banner.html`, then re-render (below). |
| [`../scripts/check-youtube-banner-safe.mjs`](../scripts/check-youtube-banner-safe.mjs) | tooling | Asserts all six banner elements stay inside the all-device safe area and the text→composition gutter stays above 60px; exits non-zero on failure. |
| [`../scripts/export-youtube-crops.mjs`](../scripts/export-youtube-crops.mjs) | tooling | Renders the three device crops of `youtube-banner.png` for review. |
| `banner/crops/` | **RENDERED** | Review-only crops (`crop-desktop.png`, `crop-tablet.png`, `crop-mobile.png`) showing what each surface actually displays. **Never hand-edit.** Regenerate after any re-render of `youtube-banner.png` (below). |

## Rendering

```
node scripts/export-youtube-banner.mjs
node scripts/check-youtube-banner-safe.mjs
node scripts/export-youtube-crops.mjs
```

Run all three in order after any edit to `banner.html`: export the PNG, verify the safe area still
holds, then regenerate the review crops. `banner.html` is 1280×720 CSS; `deviceScaleFactor: 2` in
the export script is what produces the 2560×1440 PNG YouTube recommends for upload. The render
needs:

- **Network access** — Anton and DM Sans load from Google Fonts at render time.
- **An on-disk Chromium** — the script resolves `PLAYWRIGHT_BROWSERS_PATH` (this machine:
  `D:\playwright-browsers`) and picks the newest installed `chromium-*` build, borrowing
  `playwright-core` from the globally-installed `@playwright/cli`.

## YouTube crop zones

YouTube crops one uploaded banner four different ways depending on the viewing surface — TV,
desktop, tablet, mobile — and shows different amounts of the same image on each. All four crops
share the same vertical band; only the region every crop has in common (the mobile/all-device
safe area) is guaranteed visible everywhere.

| Zone | Device px (in the 2560×1440 PNG) | CSS px (in the 1280×720 surface) |
|---|---|---|
| TV / full frame | `0, 0, 2560×1440` | `0, 0, 1280×720` |
| Desktop band | `0, 508.5, 2560×423` | `0, 254.25, 1280×211.5` |
| Tablet | `352.5, 508.5, 1855×423` | `176.25, 254.25, 927.5×211.5` |
| **Mobile / all-device SAFE** | `507, 508.5, 1546×423` | **`253.5, 254.25, 773×211.5`** |

Safe-area edges in CSS: **L 253.5 · T 254.25 · R 1026.5 · B 465.75**, centre (640, 360).

### Debug overlay

Add `class="show-guides"` to `<body>` in `banner.html` to reveal dashed rects for the desktop band
(ink), tablet (violet), and safe area (orange), plus violet washes over the TV-only top/bottom
bars. **Remove the class before re-rendering the shipped PNG** — it must never appear in
`youtube-banner.png`.

## Editing rules

1. **Stay inside the safe area.** Everything visible must stay inside `x 253.5→1026.5,
   y 254.25→465.75` (CSS). The wings carry ground only — basalt + dot grid, nothing else. This is
   a deliberate decision, not an omission: a wing is cropped away on some device and any content
   placed there would silently vanish for part of the audience.
2. **Re-verify after every edit.** After ANY copy or size change, run
   `node scripts/check-youtube-banner-safe.mjs` and confirm all six elements report `true`, and
   that the text→composition gutter stays above 60px (currently **78.5px** — widest text right edge
   `.eyebrow` 751.5 → `.b-orange` left 830).
3. **Don't copy the X header's type scale — it doesn't fit here.** At Anton 146px (the X header's
   size) the stack needs 306.8px of a 211.5px band — still overflows by 1.3px even with zero gaps
   between elements — and the name alone measures 666.87px wide against 773px of safe area minus
   the composition. 92px is the calibrated size for this surface.
4. **Width, not height, is the binding constraint.** Anton `"Chan Meng"` measures exactly
   `4.5675 × font-size`. Keeping a 60px gutter caps the name at ~105px, so any future size change
   is width-bound, not band-height-bound.
5. **Copy is deliberately identical to the X header** (`x/header/header.html`); facts trace to
   `data/profile/*.yaml`. Change both together or neither.
6. **Dot grid uses a 20px tile**, not `brand.yaml`'s 22px — so `1280/20=64` and `720/20=36` divide
   exactly and no dot clips at an edge. Matches `public/brand-system.html`. Do not "correct" it
   back to 22.
7. **The monkey logo needs no blend trick.** It uses
   `public/brands/chan-meng-monkey-white-transparent.svg` with no `filter:invert()` /
   `mix-blend-mode` — unlike the X header and LinkedIn cover, which need the blend trick only
   because they load the black-on-white asset. Same visual result, no stacking-context fragility.
8. **Caldera palette only:** `#E2E2DF` basalt / `#070607` ink / `#FC5000` orange. No shields.io,
   trophies, or third-party chrome.
9. **Stay under 6 MB.** Currently 75 KB — enormous headroom.

### Safe-area assertion logic

This is what `scripts/check-youtube-banner-safe.mjs` runs — shown here for reference, not for
pasting by hand:

```js
const SAFE = { l:253.5, t:254.25, r:1026.5, b:465.75 };
const report = await page.evaluate((S) =>
  [".eyebrow",".name",".tagline",".b-ink",".b-orange",".logo"].map(sel => {
    const b = document.querySelector(sel).getBoundingClientRect();
    return { sel, l:+b.left.toFixed(2), t:+b.top.toFixed(2), r:+b.right.toFixed(2), b:+b.bottom.toFixed(2),
             ok: b.left>=S.l && b.top>=S.t && b.right<=S.r && b.bottom<=S.b };
  }), SAFE);
console.table(report);
```

## Known trade-off

The mobile crop scales 773 CSS px down to roughly 390 device-independent px on a phone screen
(×0.505). The name lands around 46px — still strong — but the eyebrow (~6px) and tagline (~7px)
are not readable at that size. That is true of every YouTube banner; the hierarchy here is
deliberate: the name and the mark carry mobile, while the eyebrow and tagline are desktop/TV
payload.

## Build-surface impact: none

This folder is **not wired into `npm run build`, `npm run validate`, or the asset audit** —
editing anything here has zero effect on README.md / llms.txt / dist.
`scripts/export-youtube-banner.mjs` is intentionally not in `package.json`, matching `export-x-header.mjs` /
`export-x-media.mjs` / `export-linkedin-cards.mjs`: these renders need network access and a
machine-specific Chromium path, which would make `npm run check` flaky. Also,
`scripts/audit-assets.mjs` only scans `/public`, so `youtube/` is invisible to it.

## Uploading

Before uploading, eyeball `banner/crops/crop-desktop.png`, `crop-tablet.png`, and `crop-mobile.png`
(regenerate via `node scripts/export-youtube-crops.mjs`) to preview what each surface actually
shows. YouTube Studio → Customisation → Branding → Banner image. Studio shows its own TV / Desktop /
Mobile preview before committing changes — that preview is the ground truth and supersedes every
number in this file. If it clips something, pull the element toward `x 288→992`, never shrink the
safe rect.
