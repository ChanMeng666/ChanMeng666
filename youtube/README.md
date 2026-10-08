# `youtube/` — YouTube channel: register and banner

[@ChanMeng666](https://www.youtube.com/@ChanMeng666). `banner/banner.html` is the source of
the rendered `banner/youtube-banner.png` and the review crops in `banner/crops/`.

## The channel register

[`channel.yaml`](./channel.yaml) records what the channel publicly shows: description, links,
home-tab layout, every public video with its title and playlists, the public playlists, and
the films approved for upload with their titles and descriptions. Read it before answering any
question about the channel.

- **It is hand-maintained.** There is no API sync. After any change on YouTube,
  update the file and its `asOf`.
- **Unlisted and private videos are not in it.** This repo is public, and an
  unlisted video is open to anyone who has its id. Their ids, titles and the
  client playlists are in the gitignored `channel.private.yaml`. Those videos are
  client handover walkthroughs and course recordings whose links other people
  hold: do not change their visibility or delete them without Chan's word.
- **Chan decides visibility, titles and playlists.** For a batch, build a triage
  page and let her choose per row; suggestions are hints only.
- **Private means unlinkable.** When a video goes private, remove its link from
  `data/profile/`, the CVs, LinkedIn copy and chanmeng.org, then `npm run check`.
- **Copy rules.** Titles: `Product — what it does | Product film` (or `| Demo`),
  100 characters at most. Descriptions: what the product is, in plain words; one
  line saying the film is a coded replica where that is true; a one-line
  sign-off. Facts come from `data/profile/`. No commit counts, no pricing, and
  no personal claim for a result that belongs to a client.
- **Links in descriptions** (Chan, 2026-10-09, after YouTube's verification):
  every description ends in a `Links` block, one `Label: URL` per line. In
  order: the product's own links (the `url`, `repoUrl` and `extraLinks` of its
  entry in `data/profile/`), `More films: https://chanmeng.org/films` on a
  film, then `Portfolio and CV: https://chanmeng.org` and
  `GitHub: https://github.com/ChanMeng666`. A Short's block starts with the
  full film. A music video's block has the song on Suno and its album's anchor
  on chanmeng.org/films, and its credits link the style library; it carries no
  lyrics, because the Suno link has the song and its lyrics. Hashtags stay
  on the last line. Never a private repo, a private or unlisted video, or a
  link the profile does not already carry; check that a URL resolves first.
- **Reading the channel without Studio.** `npm run capture:youtube` (needs
  yt-dlp) writes [`videos.yaml`](./videos.yaml): the published title and full
  description of every public video and Short. Run it after any change in
  Studio; it also lists public ids missing from `channel.yaml` and
  descriptions with no link.
- **Reading and editing Studio with browser automation** (worked on 2026-10-07):
  the content table is `ytcp-video-row`; a video's edit page is
  `studio.youtube.com/video/<id>/edit`, where title and description are the two
  `#textbox` elements (select the node contents, then
  `document.execCommand('insertText')`), visibility is the `#select-button`
  inside `ytcp-video-metadata-visibility` followed by the
  `tp-yt-paper-radio-button[name=PRIVATE|UNLISTED|PUBLIC]`, and a playlist is
  ticked through `ytcp-checkbox-lit[test-id="<playlist id>"]`. Save with `#save`
  and confirm it goes back to `aria-disabled="true"`. Keep batches to three or
  four videos, or the call times out. The playlist dialog can take several
  seconds to fill: wait for the checkbox instead of sleeping a fixed time.
  A custom thumbnail goes into the hidden `input#file-loader` inside
  `ytcp-thumbnail-uploader` on the same edit page (JPEG or PNG, 16:9, under
  2 MB), then `#save`. A playlist is reordered on youtube.com, not in Studio:
  each row's menu has "Move to top" and "Move to bottom", and using either
  switches the playlist's sort to Manual.
- **Publishing a draft.** A fresh upload is a draft. Fill it on its normal edit
  page first (title, description, "not made for kids", save and wait for `#save`
  to disable, then the playlist as a separate step), and only then press
  "Edit draft", go to the Visibility step, choose Public and Publish. In that
  order a film never goes public under its file name. The playlist picker
  ignores a click made while a save is still pending.
- **Uploading is manual.** Browser automation cannot attach files over 10 MB and
  uploads through an unverified API project are locked private. YouTube also
  caps uploads per day (the cap hit after 10 files on 2026-10-07). Chan drags the
  files into Studio; titles, descriptions, playlists and visibility are then set
  as above.

## The banner

After any edit to `banner.html`, run in this order (by hand; they need network for the fonts
and an on-disk Chromium, so they are not in `package.json`):

```
node scripts/export-youtube-banner.mjs        # 1280×720 CSS at 2× → 2560×1440 PNG
node scripts/check-youtube-banner-safe.mjs    # six elements inside the safe area, gutter > 60px
node scripts/export-youtube-crops.mjs         # what desktop, tablet and mobile show
```

### YouTube crop zones

YouTube crops one banner four ways. Only the mobile zone is visible everywhere.

| Zone | Device px (in the 2560×1440 PNG) | CSS px (in the 1280×720 surface) |
|---|---|---|
| TV / full frame | `0, 0, 2560×1440` | `0, 0, 1280×720` |
| Desktop band | `0, 508.5, 2560×423` | `0, 254.25, 1280×211.5` |
| Tablet | `352.5, 508.5, 1855×423` | `176.25, 254.25, 927.5×211.5` |
| **Mobile / all-device SAFE** | `507, 508.5, 1546×423` | **`253.5, 254.25, 773×211.5`** |

Safe-area edges in CSS: **L 253.5 · T 254.25 · R 1026.5 · B 465.75**, centre (640, 360).

### Rules

1. **Everything visible stays inside the safe area.** The wings carry ground only (basalt and
   the dot grid): content there vanishes on some device.
2. **Don't copy the X header's type scale.** At Anton 146px (the X header's size) the stack
   needs 306.8px of a 211.5px band, and the name alone measures 666.87px against 773px of safe
   width minus the composition. 92px is the calibrated size here.
3. **Width, not height, is the binding constraint.** Anton `"Chan Meng"` measures
   `4.5675 × font-size`; keeping the 60px text→composition gutter caps the name at about
   105px. The gutter is 78.5px now (`.eyebrow` right edge 751.5 → `.b-orange` left 830).
4. **Copy is identical to the X header** (`x/header/header.html`). Change both or neither.
5. **Mobile carries the name and the mark only.** The mobile crop scales 773 CSS px to about
   390 (×0.505): the name lands near 46px, the eyebrow (~6px) and tagline (~7px) are not
   readable. That is deliberate; they are desktop and TV payload.
6. Never render with `class="show-guides"` on `<body>` (the crop overlay). Upload limit 6 MB;
   the PNG is 75 KB.

Upload in Studio → Customisation → Branding. Studio's own TV / Desktop / Mobile preview is the
ground truth and supersedes every number here. If it clips something, pull the element toward
`x 288→992`; never shrink the safe rect.
