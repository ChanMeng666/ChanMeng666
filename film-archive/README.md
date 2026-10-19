# Film archive (local only)

Every finished film from Chan's film repos, moved here on 2026-10-19 before the local
folders were deleted. Video files are gitignored and never pushed: only this index is
tracked. Paths keep each repo's own layout: `<repo>/<path in the repo>`. Footage,
auditions, previews, review proxies and superseded versions were not kept. To re-render,
clone the repo again. Which repos are public: `docs/STATE.md`, "Film repos".

130 files, 16.8 GB.

| Repo | Films (ids in `46-films.yaml`) | Files |
|---|---|---|
| a-little-of-today-mv | save-me-a-little-of-today | 1 (477 MB) |
| a11y-loop-promo-video | a11y-loop-film | 1 (11 MB) |
| ai-programming-teaching-promo | ai-programming-school-film | 4 (41 MB) |
| anti-marriage-universe-mv | warrior-ah-hua, drifter-ah-fa, the-best-strangers | 3 (821 MB) |
| archcanvas-promo-remotion | archcanvas-zoom-out | 4 (90 MB) |
| archcanvas-promo-studio | archcanvas-studio-film | 16 (214 MB) |
| archcanvas-promo-video | archcanvas-hero-film, archcanvas-short-talk-to-your-plan, archcanvas-short-the-check, archcanvas-short-it-opens-in-real-cad, archcanvas-short-tweaks, archcanvas-short-grounded-rendering, archcanvas-short-pay-per-result | 14 (41 MB) |
| archlang-demo-video | archlang-demo | 1 (37 MB) |
| archlang-promo | archlang-film | 1 (44 MB) |
| chan-meng-promo-video | chan-meng-intro, chan-meng-monkey-sting, chan-meng-showreel | 12 (266 MB) |
| corde-promo-studio | corde-mobile-film | 4 (186 MB) |
| eatropolis-promo-film | eatropolis-film | 6 (56 MB) |
| echook-promo-studio | echook-film | 6 (97 MB) |
| echook-promo-video | echook-first-film | 1 (12 MB) |
| gavigo-promo-film | gavigo-ire-film | 4 (55 MB) |
| genlab-promo-studio | genlab-how-it-works | 1 (27 MB) |
| lzj-history-maps | liu-zhongjing-dawn-of-the-xia-states, liu-zhongjing-the-qin-system, liu-zhongjing-order-imported-from-inner-asia, liu-zhongjing-the-xia-states-speak, liu-zhongjing-the-branch, liu-zhongjing-gift-box-and-bottomless-pit, liu-zhongjing-the-missing-middle, liu-zhongjing-where-the-fire-started, liu-zhongjing-the-inner-asian-ocean, liu-zhongjing-the-seed-bank, liu-zhongjing-two-bulls-and-a-frog | 11 (2210 MB) |
| lzj-watercolor-films | liu-zhongjing-roots, liu-zhongjing-four-seasons, liu-zhongjing-keeping-the-seed, liu-zhongjing-the-basin, liu-zhongjing-scattered-sand, liu-zhongjing-invention, liu-zhongjing-the-footpath, liu-zhongjing-blood-reward, liu-zhongjing-the-black-box, liu-zhongjing-the-carrot, liu-zhongjing-mould, liu-zhongjing-the-ladder, liu-zhongjing-the-clan, liu-zhongjing-the-station | 14 (4491 MB) |
| memory-amber-2022-mv | sleepwalker-in-the-clouds, dust-in-the-lock, echoes-of-april, empty-lullaby, the-wordless-book, yellow-flowers-in-the-fog, sheet-metal, off-season | 8 (5273 MB) |
| october-rain-february-line-mv | a-drizzle-in-october, february-on-an-extended-line | 3 (1933 MB) |
| she-sharp-promo-studio | she-sharp-film | 4 (48 MB) |
| she-sharp-promo-video-event-lesmills-03-september-2026 | she-sharp-lesmills-promo | 4 (44 MB) |
| solo-coffee-mv | a-coffee-for-one | 1 (648 MB) |
| tamaiti-promo-studio | tam-ai-ti-film | 6 (99 MB) |

## Upload versions (`<repo>/upload/<film-id>.mp4`)

GitHub takes a video of at most 100 MB in a README, so every finished film of a public
repo that is larger has an upload version next to it, named by the film id in the
README's `<!-- FILM: <id> -->` placeholder (2026-10-19). Two-pass H.264 High and
160 kb/s AAC, `+faststart`, about 95 MB each (92 MiB target):

- 1080p: the 25 Liu Zhongjing films, Warrior Ah Hua, Save Me a Little of Today.
- 720p: A Drizzle in October, February on an Extended Line, Drifter Ah Fa,
  The Best Strangers, A Coffee for One (longer films; 1080p left too little bitrate).

32 files, 3.06 GB. Films under 100 MB are uploaded as they are, from the paths above.
To re-make one when a master changes, with `V` = 92 MiB × 8 ÷ seconds − 200 kb/s:

    ffmpeg -i <master> -vf scale=1920:-2 -c:v libx264 -preset slow -b:v <V>k -pass 1 -an -f null -
    ffmpeg -i <master> -vf scale=1920:-2 -c:v libx264 -preset slow -b:v <V>k -maxrate <2V>k \
      -bufsize <4V>k -pass 2 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart <id>.mp4

(`scale=1280:-2:flags=lanczos` when `V` is under 3000.)
