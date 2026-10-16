$ErrorActionPreference='Stop'
$taskRoot=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
if ($taskRoot -ne 'E:\Campaign') { throw 'The authorized root must be E:\Campaign.' }
$taskHealth=Invoke-RestMethod -Uri 'http://127.0.0.1:8879/health' -TimeoutSec 10
if ($taskHealth.service -ne 'campaign-amplification' -or $taskHealth.status -ne 'ok') { throw 'Start the Campaign Neon API with npm start first.' }
if (Get-NetTCPConnection -LocalPort 19006 -State Listen -ErrorAction SilentlyContinue) { throw 'Preview port19006 is occupied; no existing listener will be changed.' }
# A separate origin avoids the old preview's saved SQLite sessions/drafts.
# localhost:19006 is already in the existing API's local CORS allowlist.
$env:EXPO_PUBLIC_API_URL='http://127.0.0.1:8879'
$env:EXPO_PUBLIC_CLOUD_BUILD='0'
$env:EXPO_PUBLIC_INTERNAL_TEST='1'
$env:EXPO_NO_TELEMETRY='1'
$env:BROWSER='none'
& (Join-Path $PSScriptRoot 'node-project.ps1') -Task neon-preview
