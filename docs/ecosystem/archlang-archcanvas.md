# ArchLang × ArchCanvas ecosystem map

Repo topology for the ArchLang / ArchCanvas family. The catalog is
[`archlang-archcanvas.yaml`](./archlang-archcanvas.yaml): every repo and in-repo
workspace with its local path, remote, visibility, role and dependencies (last
scanned 2026-09-21; not loaded by `load-profile`, not schema-validated).
`archlang-demo-video` (private, 2026-10-01, the narrated demo that accompanies the
paper, not shown publicly) was added after that scan and is recorded only in
`lineage.yaml`. Career narrative stays in `data/profile/`; do not put topology
into the shards, it would leak onto generated surfaces.

## Rules

- **Origin order** (the CV once had it backwards). The product came first:
  ArchCanvas first commit 2026-04-08, drawing plans as freehand SVG. ArchLang npm
  `0.1.0` followed on 2026-06-24 and replaced the freehand engine on 2026-06-25.
  Never write "first invented the language, then built the product".
- **Never link** `ChanMeng666/archcanvas`, `ChanMeng666/archcanvas-growth`, or the
  promo, demo and paper remotes in public copy. The only public GitHub links are
  `github.com/ChanMeng666/archlang` and `github.com/archcanvas/archcanvas`.
- **`archlang-paper` stays private until acceptance.**
- **No traction claims** unless the career shards have been re-read and updated.
- **Truth ownership.** Language behaviour lives in `archlang`, product behaviour
  in `archcanvas`, strategy and launch copy in `archcanvas-growth`. Growth holds
  no product truth and must not restate it; never edit a product repo from growth.
  Promo on-screen copy takes positioning from growth and cleared phrases from each
  promo repo: do not invent taglines.
- **The ArchCanvas films do not name ArchLang on screen** (Zoom Out and the studio
  replica film), on purpose.
- **One film on show per product.** ArchCanvas shows `archcanvas-promo-studio`,
  ArchLang shows `archlang-promo`. Film repos coexist; none replaces another. The
  register is `productFilms` in `data/profile/45-showcase.yaml`.
- Do not add this machine's `D:/` paths to a product repo's `AGENTS.md`: those
  files are for every contributor.

## Do not confuse

| Trap | Reality |
|---|---|
| `archcanvas/archcanvas` (local folder `archcanvas-public`) is the app | It is the public home: docs, examples, roadmap. The app source is the private `ChanMeng666/archcanvas` |
| `docs-site/` and `playground/` are sibling repos, or the playground is ArchCanvas | Both are npm workspaces inside `archlang`. Pushing `archlang` `main` deploys both sites |
| `"private": true` in the showcase `package.json` | Means not published to npm. The GitHub repo is public MIT |
| `examples/` in `archlang` is the gallery | Small fixtures. Gallery sources live in `archlang-showcase`; the docs-site `/showcase` PNGs are synced copies |
| The `.arch` keyword `paper` (sheet size) | Unrelated to the academic papers in `archlang-paper` (extracted from `archlang` 2026-08-26) |
| `readme-showcase`, and the career-shard id `app-promo-studio` | Unrelated projects; name collisions only. The ArchCanvas film checkout is `archcanvas-promo-studio` |
| A sibling clone for the HuggingFace dataset | There is none: it is generated from `dataset/` inside `archlang` |
