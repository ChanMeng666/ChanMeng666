// Emit dist/films.json — the films chanmeng.org/films shows.
//
// data/profile/46-films.yaml is the complete filmography. This writes the
// slice the site renders: the rows marked `onFilmsPage: true`, grouped the way
// the page reads (product films, earlier and alternative versions, event and
// brand films, then the music videos by album), with only the fields a visitor
// sees. 2d-portfolio copies the file in with `node scripts/sync-films.mjs` and
// fails its own check when the copy is stale, the same way README.md is a
// generated view of the shards.
//
// The output carries no timestamp, so it changes only when a film does.
//
//   node scripts/build-films-data.mjs [--check]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadProfile } from "./lib/load-profile.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(repoRoot, "dist", "films.json");

const profile = loadProfile();
const films = (profile.films ?? []).filter((f) => f.onFilmsPage);
const collections = new Map((profile.filmCollections ?? []).map((c) => [c.id, c]));

const clock = (s) => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, "0")}`;

const view = (f) => ({
  id: f.id,
  title: f.title,
  ...(f.titleZh && { titleZh: f.titleZh }),
  ...(f.for && { for: f.for }),
  date: f.date,
  seconds: f.seconds,
  duration: clock(f.seconds),
  ...(f.cuts && { cuts: f.cuts }),
  ...(f.madeWith && { madeWith: f.madeWith }),
  ...(f.drawnAs && { drawnAs: f.drawnAs }),
  ...(f.summary && { summary: f.summary }),
  ...(f.note && { note: f.note }),
  ...(f.youtubeId && { youtube: `https://youtu.be/${f.youtubeId}` }),
  media: f.media,
});

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);
const group = (id) => {
  const c = collections.get(id);
  const items = films.filter((f) => f.collection === id).sort(byOrder);
  return {
    id: c.id,
    title: c.title,
    ...(c.titleZh && { titleZh: c.titleZh }),
    summary: c.summary,
    ...(c.credits && { credits: c.credits }),
    seconds: items.reduce((n, f) => n + f.seconds, 0),
    films: items.map(view),
  };
};

// A collection whose films are all off the page is left out, not shown empty.
const shown = (g) => g.films.length > 0;

const product = films.filter((f) => f.kind === "product-film");
const out = {
  source: "data/profile/46-films.yaml",
  counts: {
    films: films.length,
    productFilms: product.length,
    musicVideos: films.filter((f) => f.kind === "music-video").length,
    minutes: Math.round(films.reduce((n, f) => n + f.seconds, 0) / 60),
  },
  productFilms: product.filter((f) => f.primary).map(view),
  otherVersions: {
    films: product.filter((f) => !f.primary && !f.collection).map(view),
    series: [...collections.values()].filter((c) => c.kind === "series").map((c) => group(c.id)).filter(shown),
  },
  brandAndEvent: films.filter((f) => f.kind === "brand-film" || f.kind === "event-promo").map(view),
  musicVideos: [...collections.values()].filter((c) => c.kind !== "series").map((c) => group(c.id)).filter(shown),
};

const json = JSON.stringify(out, null, 2) + "\n";
if (process.argv.includes("--check")) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8").replace(/\r\n/g, "\n") : "";
  if (current !== json) {
    console.error("dist/films.json is stale: run `npm run build:films-data`");
    process.exit(1);
  }
  console.log("dist/films.json is current");
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, json);
  console.log(`dist/films.json: ${out.counts.films} films (${out.counts.productFilms} product, ${out.counts.musicVideos} music videos), ${out.counts.minutes} min`);
}
