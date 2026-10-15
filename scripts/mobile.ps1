param([ValidateSet('start','web','android','typecheck','test','lint','export:web','export:android','doctor','build:apk','whoami')][string]$Task='web')
$ErrorActionPreference='Stop'
$taskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$taskMobile = Join-Path $taskRoot 'apps/mobile'
$taskNode = if ($env:CAMPAIGN_NODE) { $env:CAMPAIGN_NODE } else { (Get-Command node).Source }
$taskVersion = & $taskNode -p "process.versions.node"
if ([version]$taskVersion -lt [version]'20.19.4') {
  $taskRuntime = Join-Path $env:LOCALAPPDATA 'OpenAI/Codex/runtimes/cua_node'
  $taskCandidates = @(Get-ChildItem -LiteralPath $taskRuntime -Filter node.exe -Recurse -ErrorAction SilentlyContinue)
  foreach ($taskCandidate in $taskCandidates) {
    $taskCandidateVersion = & $taskCandidate.FullName -p "process.versions.node"
    if ([version]$taskCandidateVersion -ge [version]'20.19.4') { $taskNode=$taskCandidate.FullName; break }
  }
}
if ([version](& $taskNode -p "process.versions.node") -lt [version]'20.19.4') { throw 'Expo SDK 55 requires Node 20.19.4+. Install a supported Node LTS or set CAMPAIGN_NODE to its executable.' }
$taskNpm = Join-Path (Split-Path (Get-Command npm).Source) 'node_modules/npm/bin/npm-cli.js'
$env:PATH=(Split-Path $taskNode) + ';' + $env:PATH
$env:EXPO_NO_TELEMETRY='1'
Push-Location -LiteralPath $taskMobile
try {
  switch ($Task) {
    'typecheck' { & $taskNode node_modules/typescript/bin/tsc --noEmit }
    'test' { & $taskNode --test tests/*.test.mjs }
    'lint' { & $taskNode node_modules/eslint/bin/eslint.js src }
    'export:web' { & $taskNode node_modules/expo/bin/cli export --platform web }
    'export:android' { & $taskNode node_modules/expo/bin/cli export --platform android --output-dir dist-android }
    'doctor' { & $taskNode $taskNpm exec --yes --package expo-doctor -- expo-doctor }
    'build:apk' { if (!$env:EXPO_PUBLIC_API_URL -or $env:EXPO_PUBLIC_API_URL -notmatch '^https://') { throw 'Set EXPO_PUBLIC_API_URL to the deployed HTTPS backend first. A release APK must not depend on localhost.' }; & $taskNode $taskNpm exec --yes --package eas-cli -- eas build --platform android --profile preview }
    'whoami' { & $taskNode $taskNpm exec --yes --package eas-cli -- eas whoami }
    'web' { & $taskNode node_modules/expo/bin/cli start --web }
    'android' { & $taskNode node_modules/expo/bin/cli start --android }
    default { & $taskNode node_modules/expo/bin/cli start }
  }
  if ($LASTEXITCODE -ne 0) { throw "Mobile command failed with exit code $LASTEXITCODE" }
} finally { Pop-Location }
