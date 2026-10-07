# Write the X capture that is on the clipboard to x/capture/latest.json.
#
#   pwsh .claude/skills/x-sync/scripts/save-capture.ps1
#
# It refuses a clipboard that does not hold a complete capture of @chanmeng666,
# so a stale clipboard can never overwrite a good file, and it clears the
# clipboard afterwards. The file is UTF-8 without BOM, LF line ends.

$ErrorActionPreference = "Stop"
$handle = "chanmeng666"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")).Path
$target = Join-Path $repo "x\capture\latest.json"

$text = Get-Clipboard -Raw
if (-not $text) { throw "The clipboard is empty. Click the page, then run window.__xCopy() again." }
try { $data = $text | ConvertFrom-Json } catch { throw "The clipboard does not hold JSON. Run window.__xCopy() again." }

if ($data.user.handle -ne $handle) { throw "The clipboard holds the capture of '$($data.user.handle)', not '$handle'." }
if ($data.source -notlike "x.com*") { throw "The clipboard holds a capture from somewhere else: $($data.source)" }
if (-not $data.complete) { throw "The capture is incomplete ($($data.posts.Count) posts loaded, the profile counts $($data.user.posts)). Reload the page and run the snippet again." }
if ($data.posts.Count -ne $data.user.posts) { throw "The capture holds $($data.posts.Count) posts but the profile counts $($data.user.posts)." }

$before = if (Test-Path $target) { (Get-Content $target -Raw | ConvertFrom-Json).posts.Count } else { 0 }
$text = ($text -replace "`r`n", "`n").TrimEnd("`n") + "`n"
[IO.File]::WriteAllText($target, $text, [Text.UTF8Encoding]::new($false))
Set-Clipboard -Value " "

"saved x/capture/latest.json: $($data.posts.Count) posts (was $before), captured $($data.capturedAt), followers $($data.user.followers)"
