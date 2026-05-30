#!/usr/bin/env pwsh
# Rebuild Chan Meng's CV PDF + GEO sibling artifacts.
#
# Usage (from anywhere):
#   pwsh cv/build.ps1
#
# Inputs:
#   - cv/chan-meng-cv.typ (Typst sources)
#   - data/profile.yaml   (source of truth for JSON-LD + llms.txt)
#
# Outputs (written to public/ so they ship with the GitHub repo and the
# README "Resume" pill keeps resolving to the same URL):
#   - public/chan-meng-cv.pdf  (canonical CV — replaces the old static file)
#   - public/cv.jsonld         (schema.org Person + WorkExperience JSON-LD)
#   - public/cv-llms.txt       (agent-readable plain-text summary)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot

try {
    Write-Host "→ Compiling cv/chan-meng-cv.typ → public/chan-meng-cv.pdf"
    typst compile --root . cv/chan-meng-cv.typ public/chan-meng-cv.pdf

    Write-Host "→ Emitting public/cv.jsonld (schema.org JSON-LD for recruiter LLMs)"
    node cv/build-jsonld.mjs data/profile.yaml | Out-File -Encoding utf8 public/cv.jsonld

    Write-Host "→ Emitting public/cv-llms.txt (agent-readable plain-text summary)"
    node cv/build-llms-txt.mjs data/profile.yaml | Out-File -Encoding utf8 public/cv-llms.txt

    $pdfBytes  = (Get-Item public/chan-meng-cv.pdf).Length
    $jsonBytes = (Get-Item public/cv.jsonld).Length
    $txtBytes  = (Get-Item public/cv-llms.txt).Length
    Write-Host ""
    Write-Host "✓ Build complete"
    Write-Host "   public/chan-meng-cv.pdf   $($pdfBytes.ToString('N0')) bytes"
    Write-Host "   public/cv.jsonld          $($jsonBytes.ToString('N0')) bytes"
    Write-Host "   public/cv-llms.txt        $($txtBytes.ToString('N0')) bytes"
}
finally {
    Pop-Location
}
