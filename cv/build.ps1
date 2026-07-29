#!/usr/bin/env pwsh
# Rebuild Chan Meng's CV PDF + GEO sibling artifacts.
#
# Usage (from anywhere):
#   pwsh cv/build.ps1
#
# Inputs:
#   - cv/chan-meng-cv.typ (Typst sources)
#   - data/profile/*.yaml (source of truth for JSON-LD + llms.txt)
#
# Outputs. Most land in public/ so they ship with the GitHub repo and the
# README "Resume" pill keeps resolving to the same URL:
#   - public/chan-meng-cv.pdf          (canonical 2-page CV — README/site link here)
#   - public/chan-meng-cv-extended.pdf (multi-page, single-column, AI-native companion)
#   - public/cv.jsonld                 (schema.org Person + WorkExperience JSON-LD)
#   - public/cv-llms.txt               (agent-readable plain-text summary)
#
# One output deliberately does NOT go to public/ — it is tracked for archival
# but must never be web-served or crawled as a competing "current CV":
#   - cv/exports/chan-meng-cv-ats.pdf  (plain single-column ATS resume; manual
#                                       upload to job portals only)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot

# A failing `node ... | Out-File ...` still CREATES its destination — empty — and
# a native command's non-zero exit does not trip $ErrorActionPreference, so the
# script would sail on and print "✓ Build complete" over a 0-byte artifact.
# Seen 2026-07-26: a fresh worktree with no node_modules made both generators
# die with ERR_MODULE_NOT_FOUND, and the build still reported success while
# public/cv.jsonld and public/cv-llms.txt were truncated to nothing.
function Assert-Generated($path, $step) {
    if ($LASTEXITCODE -ne 0) {
        throw "$step failed: node exited $LASTEXITCODE, so $path was not regenerated."
    }
    if (-not (Test-Path $path) -or (Get-Item $path).Length -eq 0) {
        throw "$step wrote an empty $path. If dependencies are missing, run 'npm ci' in this worktree first."
    }
}

# Same hazard as above, for typst: a failed `typst compile` leaves the PREVIOUS
# PDF sitting in place, and because a native command's non-zero exit does not
# trip $ErrorActionPreference, the script would print "✓ Build complete" over a
# stale artifact. Guard every compile.
function Assert-Compiled($path, $src) {
    if ($LASTEXITCODE -ne 0) {
        throw "typst compile failed for $src (exit $LASTEXITCODE), so $path was NOT regenerated."
    }
    if (-not (Test-Path $path) -or (Get-Item $path).Length -eq 0) {
        throw "typst wrote an empty $path from $src."
    }
}

try {
    Write-Host "→ Compiling cv/chan-meng-cv.typ → public/chan-meng-cv.pdf"
    # --font-path vendors the OFL brand fonts (Bebas Neue, DM Sans, JetBrains
    # Mono) from cv/fonts so the PDF renders deterministically on any machine /
    # CI, independent of what's installed in the OS font book.
    typst compile --root . --font-path cv/fonts cv/chan-meng-cv.typ public/chan-meng-cv.pdf
    Assert-Compiled public/chan-meng-cv.pdf cv/chan-meng-cv.typ

    Write-Host "→ Compiling cv/chan-meng-cv-extended.typ → public/chan-meng-cv-extended.pdf"
    typst compile --root . --font-path cv/fonts cv/chan-meng-cv-extended.typ public/chan-meng-cv-extended.pdf
    Assert-Compiled public/chan-meng-cv-extended.pdf cv/chan-meng-cv-extended.typ

    Write-Host "→ Compiling cv/chan-meng-cv-ats.typ → cv/exports/chan-meng-cv-ats.pdf"
    # Plain single-column, photo-free, machine-parseable resume. Tracked in git
    # but deliberately OUTSIDE public/ so it is never web-served — manual upload
    # to job portals only. See cv/exports/README.md.
    typst compile --root . --font-path cv/fonts cv/chan-meng-cv-ats.typ cv/exports/chan-meng-cv-ats.pdf
    Assert-Compiled cv/exports/chan-meng-cv-ats.pdf cv/chan-meng-cv-ats.typ

    Write-Host "→ Emitting public/cv.jsonld (schema.org JSON-LD for recruiter LLMs)"
    node cv/build-jsonld.mjs data/profile | Out-File -Encoding utf8 public/cv.jsonld
    Assert-Generated public/cv.jsonld "cv/build-jsonld.mjs"

    Write-Host "→ Emitting public/cv-llms.txt (agent-readable plain-text summary)"
    node cv/build-llms-txt.mjs data/profile | Out-File -Encoding utf8 public/cv-llms.txt
    Assert-Generated public/cv-llms.txt "cv/build-llms-txt.mjs"

    $pdfBytes  = (Get-Item public/chan-meng-cv.pdf).Length
    $extBytes  = (Get-Item public/chan-meng-cv-extended.pdf).Length
    $atsBytes  = (Get-Item cv/exports/chan-meng-cv-ats.pdf).Length
    $jsonBytes = (Get-Item public/cv.jsonld).Length
    $txtBytes  = (Get-Item public/cv-llms.txt).Length
    Write-Host ""
    Write-Host "✓ Build complete"
    Write-Host "   public/chan-meng-cv.pdf            $($pdfBytes.ToString('N0')) bytes"
    Write-Host "   public/chan-meng-cv-extended.pdf   $($extBytes.ToString('N0')) bytes"
    Write-Host "   cv/exports/chan-meng-cv-ats.pdf    $($atsBytes.ToString('N0')) bytes"
    Write-Host "   public/cv.jsonld                   $($jsonBytes.ToString('N0')) bytes"
    Write-Host "   public/cv-llms.txt                 $($txtBytes.ToString('N0')) bytes"
}
finally {
    Pop-Location
}
