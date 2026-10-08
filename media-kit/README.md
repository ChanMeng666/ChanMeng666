# Speaker & Media Kit

A landscape PDF for event organisers and journalists: `public/chan-meng-media-kit.pdf`
(A4 landscape), built by `pwsh media-kit/build.ps1` (needs typst; fonts are vendored in
`cv/fonts` and `media-kit/fonts`, so no system font is needed).

- **Every fact comes from `data/profile/*.yaml`**, and the look is locked to the CV through
  `../cv/theme.typ` (generated from `data/brand.yaml`).
- **It is a point-in-time snapshot** (footer datestamp), not a generated view. Reach metrics
  mirror `data/profile/00-basics.yaml › basics.reach` as of 2026-06. When the profile data
  changes, rebuild and re-check the numbers and quotes on the bio, stage and proof pages
  against the shards.
- **Photos** are set in the "Shared asset paths" block at the top of
  `chan-meng-media-kit.typ`; swap a path and rebuild.
- The stage photos were orientation-baked (EXIF transpose) so they never render sideways. Do
  the same to any replacement.
- `public/photos/chan-celebrate.jpg` is a kit-only crop of `chan-by-the-sea.jpg` with the
  "OPEN TO WORK" banner cropped out (the top ~560px). Regenerate it if the source changes.
