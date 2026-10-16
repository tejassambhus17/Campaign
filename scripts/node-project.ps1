param([ValidateSet('neon-tests','neon-api','neon-preview')][string]$Task)
$ErrorActionPreference='Stop'
$taskRoot=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
if ($taskRoot -ne 'E:\Campaign') { throw 'The authorized root must be E:\Campaign.' }
$taskNode=if ($env:CAMPAIGN_NODE) { $env:CAMPAIGN_NODE } else { (Get-Command node).Source }
if ([version](& $taskNode -p 'process.versions.node') -lt [version]'22.20.0') {
  $taskRuntime=Join-Path $env:LOCALAPPDATA 'OpenAI/Codex/runtimes/cua_node'
  foreach ($taskCandidate in @(Get-ChildItem -LiteralPath $taskRuntime -Filter node.exe -Recurse -ErrorAction SilentlyContinue)) {
    if ([version](& $taskCandidate.FullName -p 'process.versions.node') -ge [version]'22.20.0') { $taskNode=$taskCandidate.FullName; break }
  }
}
if ([version](& $taskNode -p 'process.versions.node') -lt [version]'22.20.0') { throw 'Neon tooling needs Node22.20+; set CAMPAIGN_NODE to a supported runtime.' }
if ($Task -eq 'neon-preview') {
  Push-Location -LiteralPath (Join-Path $taskRoot 'apps/mobile')
  try { & $taskNode (Join-Path $taskRoot 'apps/mobile/node_modules/expo/bin/cli') start --web --localhost --port 19006 }
  finally { Pop-Location }
}
elseif ($Task -eq 'neon-tests') { & $taskNode --test (Join-Path $taskRoot 'tests/neon-runtime.test.mjs') }
else { & $taskNode (Join-Path $PSScriptRoot 'run-neon-api.mjs') }
if ($LASTEXITCODE -ne 0) { throw "Campaign $Task exited unsuccessfully." }
