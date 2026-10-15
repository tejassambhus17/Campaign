$ErrorActionPreference='Stop'
$taskRoot=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
function Test-CampaignPortBusy([int]$Port) {
  # Get-NetTCPConnection is denied in some managed Windows environments. Do not
  # mistake that denied lookup for an unused port or launch a competing service.
  $taskConnections = & netstat.exe -ano -p tcp
  if ($LASTEXITCODE -ne 0) { throw "Cannot verify listener on port $Port. No competing service was started." }
  return [bool]($taskConnections | Select-String "^\s*TCP\s+\S+:$Port\s+\S+\s+LISTENING\s+\d+\s*$")
}
$taskLogDir=Join-Path $taskRoot 'tmp/run'
New-Item -ItemType Directory -Path $taskLogDir -Force | Out-Null
$taskPython=Join-Path $taskRoot 'services/api/.venv/Scripts/python.exe'
if (!(Test-Path -LiteralPath $taskPython)) { throw 'Install the project API dependencies first; see services/api/README.md.' }
if (!(Test-Path -LiteralPath (Join-Path $taskRoot 'apps/mobile/node_modules/expo/package.json'))) { throw 'Install the mobile dependencies first; see README.md.' }
try { $taskHealth=Invoke-RestMethod -Uri 'http://127.0.0.1:8787/health' -TimeoutSec 3 } catch { $taskHealth=$null }
if ($taskHealth -and $taskHealth.service -eq 'campaign-amplification') { Write-Output 'Campaign API is already running on port 8787.' }
else {
  if (Test-CampaignPortBusy 8787) { throw 'Port 8787 belongs to another listener. It was not stopped.' }
  $taskProcess=Start-Process -FilePath $taskPython -ArgumentList 'run.py' -WorkingDirectory (Join-Path $taskRoot 'services/api') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskLogDir 'api.out.log') -RedirectStandardError (Join-Path $taskLogDir 'api.err.log') -PassThru
  $taskProcess.Id | Set-Content -LiteralPath (Join-Path $taskLogDir 'api.pid')
  Write-Output 'Started the project API. Startup logs are in tmp/run.'
}
try { $taskPage=Invoke-WebRequest -Uri 'http://localhost:8081' -UseBasicParsing -TimeoutSec 3 } catch { $taskPage=$null }
if ($taskPage -and $taskPage.Content -match 'Campaign Amplification') { Write-Output 'Campaign Expo preview is already running on port 8081.' }
else {
  if (Test-CampaignPortBusy 8081) { throw 'Port 8081 is in use and could not be verified as this app. It was not stopped.' }
  $taskMobileScript=Join-Path $taskRoot 'scripts/mobile.ps1'
  $taskArgs=@('-NoProfile','-ExecutionPolicy','Bypass','-File',('"'+$taskMobileScript+'"'),'web')
  $taskProcess=Start-Process -FilePath 'powershell.exe' -ArgumentList $taskArgs -WorkingDirectory $taskRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskLogDir 'mobile.out.log') -RedirectStandardError (Join-Path $taskLogDir 'mobile.err.log') -PassThru
  $taskProcess.Id | Set-Content -LiteralPath (Join-Path $taskLogDir 'mobile.pid')
  Write-Output 'Started the project Expo preview. Startup logs are in tmp/run.'
}
Write-Output 'Open http://localhost:8081 after startup. For a phone, use the Expo terminal and configure a reachable LAN API address.'
