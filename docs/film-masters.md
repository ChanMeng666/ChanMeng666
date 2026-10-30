# Film masters: where each one lives

Every finished film master from Chan's film repos is stored on GitHub, in the repo that
made it. Checked on 2026-10-20: each of the 130 files was compared by SHA-256 with the
copy on GitHub before the local `film-archive/` folder was deleted to free disk space.
Most masters are in a release tagged `masters-2026-10` (not marked latest); the rest
were already tracked in the repo or attached to an earlier release. A private repo's release is private like the repo: it is not linked
from any surface (`docs/STATE.md`, "Film repos"). Smaller web versions are on YouTube
and chanmeng.org/films; film ids are in `data/profile/46-films.yaml`.

To fetch one: `gh release download <tag> -R <owner>/<repo> -p <file>`.
`npm run stage:distribution` reads this file to download the films a post needs.

## ChanMeng666/a-little-of-today-mv (public)

| Rendered to | MB | On GitHub |
|---|---|---|
| `films/today/out/video.mp4` | 500 | release `masters-2026-10` › `save-me-a-little-of-today-master-1080p.mp4` |

## ChanMeng666/a11y-loop-promo-film (public)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/2026-10-promo-film-v6.mp4` | 21 | release `v1.0.0` › `a11y-loop-launch-film-2026-10.mp4` (also the README video; SHA-256 checked 2026-10-20) |

## ChanMeng666/a11y-loop-promo-video (public)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/a11y-loop-promo.mp4` | 12 | tracked in the repo |

## ChanMeng666/ai-programming-teaching-promo (public)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/masters/Film-30-landscape.mp4` | 6 | release `masters-2026-10` › `Film-30-landscape.mp4` |
| `out/masters/Film-30-portrait.mp4` | 8 | release `masters-2026-10` › `Film-30-portrait.mp4` |
| `out/masters/Film-60-landscape.mp4` | 13 | release `masters-2026-10` › `Film-60-landscape.mp4` (also the README video) |
| `out/masters/Film-60-portrait.mp4` | 16 | release `masters-2026-10` › `Film-60-portrait.mp4` |

## ChanMeng666/anti-marriage-universe-mv (public)

| Rendered to | MB | On GitHub |
|---|---|---|
| `afa/afa.mp4` | 288 | release `v1.0.0` › `afa.mp4` |
| `ahua/ahua.mp4` | 187 | release `v1.0.0` › `ahua.mp4` |
| `passerby/passerby.mp4` | 386 | release `v1.0.0` › `passerby.mp4` |

## ChanMeng666/archcanvas-promo-remotion (public)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/archcanvas-zoom-out-2026-09_landscape_1920x1080.mp4` | 28 | release `zoom-out-v1` › `archcanvas-zoom-out-2026-09_landscape_1920x1080.mp4` |
| `out/archcanvas-zoom-out-2026-09_portrait_1080x1350.mp4` | 22 | release `zoom-out-v1` › `archcanvas-zoom-out-2026-09_portrait_1080x1350.mp4` |
| `out/archcanvas-zoom-out-2026-09_square_1080x1080.mp4` | 20 | release `zoom-out-v1` › `archcanvas-zoom-out-2026-09_square_1080x1080.mp4` |
| `out/archcanvas-zoom-out-2026-09_vertical_1080x1920.mp4` | 24 | release `zoom-out-v1` › `archcanvas-zoom-out-2026-09_vertical_1080x1920.mp4` |

## ChanMeng666/archcanvas-promo-studio (public)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/masters/A-confident-arrival/archcanvas-studio-2026-09_120s_landscape_1920x1080.mp4` | 30 | release `masters-2026-10` › `A-confident-arrival__archcanvas-studio-2026-09_120s_landscape_1920x1080.mp4` |
| `out/masters/A-confident-arrival/archcanvas-studio-2026-09_120s_vertical_1080x1920.mp4` | 30 | release `masters-2026-10` › `A-confident-arrival__archcanvas-studio-2026-09_120s_vertical_1080x1920.mp4` |
| `out/masters/A-confident-arrival/archcanvas-studio-2026-09_15s_landscape_1920x1080.mp4` | 4 | release `masters-2026-10` › `A-confident-arrival__archcanvas-studio-2026-09_15s_landscape_1920x1080.mp4` |
| `out/masters/A-confident-arrival/archcanvas-studio-2026-09_15s_vertical_1080x1920.mp4` | 3 | release `masters-2026-10` › `A-confident-arrival__archcanvas-studio-2026-09_15s_vertical_1080x1920.mp4` |
| `out/masters/A-confident-arrival/archcanvas-studio-2026-09_30s_landscape_1920x1080.mp4` | 8 | release `masters-2026-10` › `A-confident-arrival__archcanvas-studio-2026-09_30s_landscape_1920x1080.mp4` |
| `out/masters/A-confident-arrival/archcanvas-studio-2026-09_30s_vertical_1080x1920.mp4` | 8 | release `masters-2026-10` › `A-confident-arrival__archcanvas-studio-2026-09_30s_vertical_1080x1920.mp4` |
| `out/masters/A-confident-arrival/archcanvas-studio-2026-09_60s_landscape_1920x1080.mp4` | 16 | release `masters-2026-10` › `A-confident-arrival__archcanvas-studio-2026-09_60s_landscape_1920x1080.mp4` |
| `out/masters/A-confident-arrival/archcanvas-studio-2026-09_60s_vertical_1080x1920.mp4` | 16 | release `masters-2026-10` › `A-confident-arrival__archcanvas-studio-2026-09_60s_vertical_1080x1920.mp4` |
| `out/masters/B-daylight-forward/archcanvas-studio-2026-09_120s_landscape_1920x1080.mp4` | 28 | release `masters-2026-10` › `B-daylight-forward__archcanvas-studio-2026-09_120s_landscape_1920x1080.mp4` (also the README video) |
| `out/masters/B-daylight-forward/archcanvas-studio-2026-09_120s_vertical_1080x1920.mp4` | 29 | release `masters-2026-10` › `B-daylight-forward__archcanvas-studio-2026-09_120s_vertical_1080x1920.mp4` |
| `out/masters/B-daylight-forward/archcanvas-studio-2026-09_15s_landscape_1920x1080.mp4` | 3 | release `masters-2026-10` › `B-daylight-forward__archcanvas-studio-2026-09_15s_landscape_1920x1080.mp4` |
| `out/masters/B-daylight-forward/archcanvas-studio-2026-09_15s_vertical_1080x1920.mp4` | 3 | release `masters-2026-10` › `B-daylight-forward__archcanvas-studio-2026-09_15s_vertical_1080x1920.mp4` |
| `out/masters/B-daylight-forward/archcanvas-studio-2026-09_30s_landscape_1920x1080.mp4` | 7 | release `masters-2026-10` › `B-daylight-forward__archcanvas-studio-2026-09_30s_landscape_1920x1080.mp4` |
| `out/masters/B-daylight-forward/archcanvas-studio-2026-09_30s_vertical_1080x1920.mp4` | 7 | release `masters-2026-10` › `B-daylight-forward__archcanvas-studio-2026-09_30s_vertical_1080x1920.mp4` |
| `out/masters/B-daylight-forward/archcanvas-studio-2026-09_60s_landscape_1920x1080.mp4` | 16 | release `masters-2026-10` › `B-daylight-forward__archcanvas-studio-2026-09_60s_landscape_1920x1080.mp4` |
| `out/masters/B-daylight-forward/archcanvas-studio-2026-09_60s_vertical_1080x1920.mp4` | 16 | release `masters-2026-10` › `B-daylight-forward__archcanvas-studio-2026-09_60s_vertical_1080x1920.mp4` |

## ChanMeng666/archcanvas-promo-video (private)

| Rendered to | MB | On GitHub |
|---|---|---|
| `renders/hero-16x9.mp4` | 12 | release `v1.0` › `hero-16x9.mp4` |
| `renders/hero-9x16.mp4` | 10 | release `v1.0` › `hero-9x16.mp4` |
| `renders/s1-talk-to-your-plan-16x9.mp4` | 2 | release `v1.0` › `s1-talk-to-your-plan-16x9.mp4` |
| `renders/s1-talk-to-your-plan-9x16.mp4` | 2 | release `v1.0` › `s1-talk-to-your-plan-9x16.mp4` |
| `renders/s2-the-check-16x9.mp4` | 1 | release `v1.0` › `s2-the-check-16x9.mp4` |
| `renders/s2-the-check-9x16.mp4` | 1 | release `v1.0` › `s2-the-check-9x16.mp4` |
| `renders/s3-it-opens-in-real-cad-16x9.mp4` | 3 | release `v1.0` › `s3-it-opens-in-real-cad-16x9.mp4` |
| `renders/s3-it-opens-in-real-cad-9x16.mp4` | 2 | release `v1.0` › `s3-it-opens-in-real-cad-9x16.mp4` |
| `renders/s4-tweaks-16x9.mp4` | 2 | release `v1.0` › `s4-tweaks-16x9.mp4` |
| `renders/s4-tweaks-9x16.mp4` | 2 | release `v1.0` › `s4-tweaks-9x16.mp4` |
| `renders/s5-grounded-rendering-16x9.mp4` | 2 | release `v1.0` › `s5-grounded-rendering-16x9.mp4` |
| `renders/s5-grounded-rendering-9x16.mp4` | 2 | release `v1.0` › `s5-grounded-rendering-9x16.mp4` |
| `renders/s6-pay-per-result-16x9.mp4` | 1 | release `v1.0` › `s6-pay-per-result-16x9.mp4` |
| `renders/s6-pay-per-result-9x16.mp4` | 1 | release `v1.0` › `s6-pay-per-result-9x16.mp4` |

## ChanMeng666/archlang-demo-video (private)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/archlang-demo-1.36.0.mp4` | 39 | release `masters-2026-10` › `archlang-demo-1.36.0.mp4` |

## ChanMeng666/archlang-promo (public)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/archlang-promo.mp4` | 46 | release `masters-2026-10` › `archlang-promo.mp4` (also the README video) |

## ChanMeng666/archlang-promo-threejs (public)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/archlang-promo.mp4` | 13 | release `v1.0.0` › `archlang-promo.mp4` (also `.html`, `soundtrack.wav`, `soundtrack.m4a`, `SHA256SUMS.txt`) |

## ChanMeng666/chan-meng-promo-video (private)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/intro/master-1080p.mp4` | 53 | release `masters-2026-10` › `intro__master-1080p.mp4` |
| `out/intro/web-720p.mp4` | 6 | release `masters-2026-10` › `intro__web-720p.mp4` |
| `out/intro/web-720p.webm` | 5 | release `masters-2026-10` › `intro__web-720p.webm` |
| `out/showreel-short/master-1080p.mp4` | 55 | release `masters-2026-10` › `showreel-short__master-1080p.mp4` |
| `out/showreel-short/web-720p.mp4` | 6 | release `masters-2026-10` › `showreel-short__web-720p.mp4` |
| `out/showreel-short/web-720p.webm` | 5 | release `masters-2026-10` › `showreel-short__web-720p.webm` |
| `out/showreel/master-1080p.mp4` | 114 | release `masters-2026-10` › `showreel__master-1080p.mp4` |
| `out/showreel/web-720p.mp4` | 13 | release `masters-2026-10` › `showreel__web-720p.mp4` |
| `out/showreel/web-720p.webm` | 10 | release `masters-2026-10` › `showreel__web-720p.webm` |
| `out/sting/master-1080p.mp4` | 9 | release `masters-2026-10` › `sting__master-1080p.mp4` |
| `out/sting/web-720p.mp4` | 1 | release `masters-2026-10` › `sting__web-720p.mp4` |
| `out/sting/web-720p.webm` | 1 | release `masters-2026-10` › `sting__web-720p.webm` |

## ChanMeng666/corde-promo-studio (private)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/masters/corde-mobile_30s_landscape_1920x1080.mp4` | 40 | release `masters-2026-10` › `corde-mobile_30s_landscape_1920x1080.mp4` |
| `out/masters/corde-mobile_30s_vertical_1080x1920.mp4` | 37 | release `masters-2026-10` › `corde-mobile_30s_vertical_1080x1920.mp4` |
| `out/masters/corde-mobile_60s_landscape_1920x1080.mp4` | 62 | release `masters-2026-10` › `corde-mobile_60s_landscape_1920x1080.mp4` |
| `out/masters/corde-mobile_60s_vertical_1080x1920.mp4` | 57 | release `masters-2026-10` › `corde-mobile_60s_vertical_1080x1920.mp4` |

## ChanMeng666/eatropolis-promo-film (private)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/masters/A-synth-market-day/Eatropolis-15-Landscape-16x9.mp4` | 7 | release `masters-2026-10` › `A-synth-market-day__Eatropolis-15-Landscape-16x9.mp4` |
| `out/masters/A-synth-market-day/Eatropolis-15-Portrait-9x16.mp4` | 4 | release `masters-2026-10` › `A-synth-market-day__Eatropolis-15-Portrait-9x16.mp4` |
| `out/masters/A-synth-market-day/Eatropolis-30-Landscape-16x9.mp4` | 11 | release `masters-2026-10` › `A-synth-market-day__Eatropolis-30-Landscape-16x9.mp4` |
| `out/masters/A-synth-market-day/Eatropolis-30-Portrait-9x16.mp4` | 6 | release `masters-2026-10` › `A-synth-market-day__Eatropolis-30-Portrait-9x16.mp4` |
| `out/masters/A-synth-market-day/Eatropolis-60-Landscape-16x9.mp4` | 20 | release `masters-2026-10` › `A-synth-market-day__Eatropolis-60-Landscape-16x9.mp4` |
| `out/masters/A-synth-market-day/Eatropolis-60-Portrait-9x16.mp4` | 11 | release `masters-2026-10` › `A-synth-market-day__Eatropolis-60-Portrait-9x16.mp4` |

## ChanMeng666/echook-promo-studio (public)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/masters/echook_15s_landscape_1920x1080.mp4` | 10 | release `masters-2026-10` › `echook_15s_landscape_1920x1080.mp4` |
| `out/masters/echook_15s_vertical_1080x1920.mp4` | 10 | release `masters-2026-10` › `echook_15s_vertical_1080x1920.mp4` |
| `out/masters/echook_30s_landscape_1920x1080.mp4` | 16 | release `masters-2026-10` › `echook_30s_landscape_1920x1080.mp4` |
| `out/masters/echook_30s_vertical_1080x1920.mp4` | 16 | release `masters-2026-10` › `echook_30s_vertical_1080x1920.mp4` |
| `out/masters/echook_60s_landscape_1920x1080.mp4` | 25 | release `masters-2026-10` › `echook_60s_landscape_1920x1080.mp4` (also the README video) |
| `out/masters/echook_60s_vertical_1080x1920.mp4` | 25 | release `masters-2026-10` › `echook_60s_vertical_1080x1920.mp4` |

## ChanMeng666/echook-promo-video (public)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/promo-video.mp4` | 13 | tracked in the repo |

## ChanMeng666/gavigo-promo-film (private)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/masters/gavigo-ire-30s-landscape.mp4` | 10 | release `masters-2026-10` › `gavigo-ire-30s-landscape.mp4` |
| `out/masters/gavigo-ire-30s-portrait.mp4` | 8 | release `masters-2026-10` › `gavigo-ire-30s-portrait.mp4` |
| `out/masters/gavigo-ire-60s-landscape.mp4` | 21 | release `masters-2026-10` › `gavigo-ire-60s-landscape.mp4` |
| `out/masters/gavigo-ire-60s-portrait.mp4` | 19 | release `masters-2026-10` › `gavigo-ire-60s-portrait.mp4` |

## ChanMeng666/genlab-promo-studio (private)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/masters/genlab-how-it-works_1920x1080.mp4` | 28 | release `masters-2026-10` › `genlab-how-it-works_1920x1080.mp4` |

## ChanMeng666/lzj-history-maps (public)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/china1.mp4` | 182 | release `masters-2026-10` › `china1-dawn-of-the-xia-states.mp4` |
| `out/china2.mp4` | 182 | release `masters-2026-10` › `china2-the-qin-system.mp4` |
| `out/china3.mp4` | 223 | release `masters-2026-10` › `china3-order-imported-from-inner-asia.mp4` |
| `out/china4.mp4` | 217 | release `masters-2026-10` › `china4-the-xia-states-speak.mp4` |
| `out/prc1.mp4` | 220 | release `masters-2026-10` › `prc1-the-branch.mp4` |
| `out/prc2.mp4` | 236 | release `masters-2026-10` › `prc2-gift-box-and-bottomless-pit.mp4` |
| `out/prc3.mp4` | 192 | release `masters-2026-10` › `prc3-the-missing-middle.mp4` |
| `out/world1.mp4` | 214 | release `masters-2026-10` › `world1-where-the-fire-started.mp4` |
| `out/world2.mp4` | 227 | release `masters-2026-10` › `world2-the-inner-asian-ocean.mp4` |
| `out/world3.mp4` | 174 | release `masters-2026-10` › `world3-the-seed-bank.mp4` |
| `out/world4.mp4` | 252 | release `masters-2026-10` › `world4-two-bulls-and-a-frog.mp4` |

## ChanMeng666/lzj-watercolor-films (public)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/film1.mp4` | 253 | release `masters-2026-10` › `film1-roots.mp4` |
| `out/film10.mp4` | 356 | release `masters-2026-10` › `film10-the-carrot.mp4` |
| `out/film11.mp4` | 378 | release `masters-2026-10` › `film11-mould.mp4` |
| `out/film12.mp4` | 373 | release `masters-2026-10` › `film12-the-ladder.mp4` |
| `out/film13.mp4` | 361 | release `masters-2026-10` › `film13-the-clan.mp4` |
| `out/film14.mp4` | 368 | release `masters-2026-10` › `film14-the-station.mp4` |
| `out/film2.mp4` | 280 | release `masters-2026-10` › `film2-four-seasons.mp4` |
| `out/film3.mp4` | 226 | release `masters-2026-10` › `film3-keeping-the-seed.mp4` |
| `out/film4.mp4` | 351 | release `masters-2026-10` › `film4-the-basin.mp4` |
| `out/film5.mp4` | 329 | release `masters-2026-10` › `film5-scattered-sand.mp4` |
| `out/film6.mp4` | 381 | release `masters-2026-10` › `film6-invention.mp4` |
| `out/film7.mp4` | 349 | release `masters-2026-10` › `film7-the-footpath.mp4` |
| `out/film8.mp4` | 331 | release `masters-2026-10` › `film8-blood-reward.mp4` |
| `out/film9.mp4` | 374 | release `masters-2026-10` › `film9-the-black-box.mp4` |

## ChanMeng666/memory-amber-2022-mv (private)

| Rendered to | MB | On GitHub |
|---|---|---|
| `films/01-cloud-sleepwalker/out/video.mp4` | 289 | release `masters-2026-10` › `01-sleepwalker-in-the-clouds.mp4` |
| `films/02-lock-dust/out/video.mp4` | 689 | release `masters-2026-10` › `02-dust-in-the-lock.mp4` |
| `films/03-april-echo/out/video.mp4` | 940 | release `masters-2026-10` › `03-echoes-of-april.mp4` |
| `films/04-empty-lullaby/out/video.mp4` | 594 | release `masters-2026-10` › `04-empty-lullaby.mp4` |
| `films/05-wordless-book/out/video.mp4` | 600 | release `masters-2026-10` › `05-the-wordless-book.mp4` |
| `films/06-yellow-flowers/out/video.mp4` | 810 | release `masters-2026-10` › `06-yellow-flowers-in-the-fog.mp4` |
| `films/07-sheet-metal/out/video.mp4` | 1169 | release `masters-2026-10` › `07-sheet-metal.mp4` |
| `films/08-off-season/out/video.mp4` | 439 | release `masters-2026-10` › `08-off-season.mp4` |

## ChanMeng666/october-rain-february-line-mv (public)

| Rendered to | MB | On GitHub |
|---|---|---|
| `films/01-october-rain/out/video.mp4` | 1298 | release `masters-2026-10` › `a-drizzle-in-october-master-1080p.mp4` |
| `output/二月的延长线.mp4` | 191 | release `v1.0.0` › `february-line.mp4` |
| `output/十月的微雨.mp4` | 537 | release `v1.0.0` › `october-rain.mp4` |

## ChanMeng666/she-sharp-promo-studio (private)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/masters/chan-meng_she-sharp_30s_landscape_1920x1080.mp4` | 8 | tracked in the repo |
| `out/masters/chan-meng_she-sharp_30s_vertical_1080x1920.mp4` | 8 | tracked in the repo |
| `out/masters/chan-meng_she-sharp_60s_landscape_1920x1080.mp4` | 17 | tracked in the repo |
| `out/masters/chan-meng_she-sharp_60s_vertical_1080x1920.mp4` | 16 | tracked in the repo |

## NZ-SheSharp/she-sharp-promo-video-event-lesmills-03-september-2026 (private)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/she-sharp-lesmills-2026-09-03_landscape_1920x1080.mp4` | 13 | tracked in the repo |
| `out/she-sharp-lesmills-2026-09-03_portrait_1080x1350.mp4` | 11 | tracked in the repo |
| `out/she-sharp-lesmills-2026-09-03_square_1080x1080.mp4` | 10 | tracked in the repo |
| `out/she-sharp-lesmills-2026-09-03_vertical_1080x1920.mp4` | 12 | tracked in the repo |

## ChanMeng666/solo-coffee-mv (public)

| Rendered to | MB | On GitHub |
|---|---|---|
| `films/solo-coffee/out/video.mp4` | 679 | release `masters-2026-10` › `a-coffee-for-one-master-1080p.mp4` |

## ChanMeng666/tamaiti-promo-studio (public)

| Rendered to | MB | On GitHub |
|---|---|---|
| `out/masters/tam-ai-ti_15s_landscape_1920x1080.mp4` | 9 | release `masters-2026-10` › `tam-ai-ti_15s_landscape_1920x1080.mp4` |
| `out/masters/tam-ai-ti_15s_vertical_1080x1920.mp4` | 9 | release `masters-2026-10` › `tam-ai-ti_15s_vertical_1080x1920.mp4` |
| `out/masters/tam-ai-ti_30s_landscape_1920x1080.mp4` | 16 | release `masters-2026-10` › `tam-ai-ti_30s_landscape_1920x1080.mp4` |
| `out/masters/tam-ai-ti_30s_vertical_1080x1920.mp4` | 17 | release `masters-2026-10` › `tam-ai-ti_30s_vertical_1080x1920.mp4` |
| `out/masters/tam-ai-ti_60s_landscape_1920x1080.mp4` | 26 | release `masters-2026-10` › `tam-ai-ti_60s_landscape_1920x1080.mp4` (also the README video) |
| `out/masters/tam-ai-ti_60s_vertical_1080x1920.mp4` | 27 | release `masters-2026-10` › `tam-ai-ti_60s_vertical_1080x1920.mp4` |
