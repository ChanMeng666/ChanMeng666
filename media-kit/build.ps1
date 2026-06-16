#!/usr/bin/env pwsh
# Rebuild Chan Meng's Speaker & Media Kit PDF.
#
# Usage (from anywhere):
#   pwsh media-kit/build.ps1
#
# Inputs:
#   - media-kit/chan-meng-media-kit.typ  (Typst source — all 5 landscape pages)
#   - media-kit/theme.typ, components.typ (brand-locked to ../cv via brand.yaml)
#   - data/profile/*.yaml (source of truth for every fact on the page)
#   - public/photos/*, public/brands/*, public/brand/* (imagery)
#
# Output (written to public/ so it ships with the repo and resolves from a
# stable URL):
#   - public/chan-meng-media-kit.pdf

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot

try {
    Write-Host "→ Compiling media-kit/chan-meng-media-kit.typ → public/chan-meng-media-kit.pdf"
    # --root . lets the doc reference /public/... absolute asset paths.
    # --font-path (cv/fonts) vendors the OFL brand fonts (Anton, DM Sans,
    # JetBrains Mono); (media-kit/fonts) vendors Font Awesome 6 Free Solid for
    # the icons — so the PDF renders deterministically on any machine / CI with
    # no system font install required.
    typst compile --root . --font-path cv/fonts --font-path media-kit/fonts `
        media-kit/chan-meng-media-kit.typ public/chan-meng-media-kit.pdf

    $pdfBytes = (Get-Item public/chan-meng-media-kit.pdf).Length
    Write-Host ""
    Write-Host "✓ Build complete"
    Write-Host "   public/chan-meng-media-kit.pdf   $($pdfBytes.ToString('N0')) bytes"
}
finally {
    Pop-Location
}
