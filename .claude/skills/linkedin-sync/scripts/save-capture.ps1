# Write the LinkedIn capture that is on the clipboard to its file in the repo.
#
#   pwsh .claude/skills/linkedin-sync/scripts/save-capture.ps1 -Register profile -Half public
#   pwsh .claude/skills/linkedin-sync/scripts/save-capture.ps1 -Register profile -Half private
#   pwsh .claude/skills/linkedin-sync/scripts/save-capture.ps1 -Register archcanvas -Half public
#
# -Register  profile, or the name of a company page (its folder under linkedin/company/)
# -Half      public  → capture/latest.json          (tracked)
#            private → capture/latest.private.json  (gitignored; the profile only)
#
# It refuses a clipboard that does not hold the capture it was asked for, so a
# stale clipboard can never overwrite a good file. The last half of a capture
# clears the clipboard afterwards. Files are UTF-8 without BOM, LF line ends.

param(
  [Parameter(Mandatory = $true)][string]$Register,
  [Parameter(Mandatory = $true)][ValidateSet("public", "private")][string]$Half
)

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")).Path
$isProfile = $Register -eq "profile"
$dir = if ($isProfile) { Join-Path $repo "linkedin" } else { Join-Path $repo "linkedin\company\$Register" }
$handle = if ($isProfile) { "chanmeng666" } else { $Register }

if (-not $isProfile -and -not (Test-Path (Join-Path $dir "account.yaml"))) {
  throw "No register at linkedin/company/$Register. Add it to REGISTERS in scripts/build-linkedin-register.mjs and write its account.yaml first."
}
if ($Half -eq "private" -and -not $isProfile) {
  throw "A company page has no private half: LinkedIn's feed carries impressions for a member's own posts only."
}

$text = Get-Clipboard -Raw
if (-not $text) { throw "The clipboard is empty. Click the page, then run window.__liCopy(...) again." }
try { $data = $text | ConvertFrom-Json } catch { throw "The clipboard does not hold JSON. Run window.__liCopy(...) again." }

if ($Half -eq "public") {
  if ($data.user.handle -ne $handle) { throw "The clipboard holds the capture of '$($data.user.handle)', not '$handle'." }
  if (-not $data.complete) { throw "The capture did not reach the end of the feed. Run the snippet again." }
  $summary = "$($data.posts.Count) updates, captured $($data.capturedAt), followers $($data.user.followers)"
  $name = "latest.json"
} else {
  if ($null -eq $data.impressions) { throw "The clipboard does not hold the private half. Run window.__liCopy('private')." }
  $summary = "$(@($data.impressions.PSObject.Properties).Count) impression counts, captured $($data.capturedAt)"
  $name = "latest.private.json"
}

$target = Join-Path $dir "capture\$name"
New-Item -ItemType Directory -Force (Split-Path $target) | Out-Null
$text = ($text -replace "`r`n", "`n").TrimEnd("`n") + "`n"
[IO.File]::WriteAllText($target, $text, [Text.UTF8Encoding]::new($false))
if ($Half -eq "private" -or -not $isProfile) { Set-Clipboard -Value " " }

"saved $($target.Substring($repo.Length + 1).Replace('\', '/')): $summary"
