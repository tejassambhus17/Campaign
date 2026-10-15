param(
  [ValidateSet('Start','Status','Install','Stop')]
  [string]$Action = 'Start'
)
$ErrorActionPreference = 'Stop'
$campaignRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
if ($campaignRoot -ne 'E:\Campaign') { throw 'The authorized project root must resolve to E:\Campaign.' }
$sdkRoot = Join-Path $campaignRoot 'tools/android-sdk'
$buildRoot = Join-Path $campaignRoot 'tmp/android-build'
$adb = Join-Path $sdkRoot 'platform-tools/adb.exe'
$emulator = Join-Path $sdkRoot 'emulator/emulator.exe'
$serial = 'emulator-5560'
$avdName = 'Campaign_API_36'
foreach ($required in @($adb,$emulator,(Join-Path $buildRoot "avd/$avdName.ini"))) {
  if (!(Test-Path -LiteralPath $required)) { throw "Missing local emulator component: $required. See docs/ANDROID_LOCAL.md." }
}
$preferenceRoot = Join-Path $buildRoot '.android'
$temporaryRoot = Join-Path $buildRoot 'emulator-temp'
New-Item -ItemType Directory -Path $preferenceRoot,$temporaryRoot -Force | Out-Null
$temporaryEnvironment = @{
  ANDROID_HOME = $sdkRoot
  ANDROID_SDK_ROOT = $sdkRoot
  ANDROID_SDK_HOME = $buildRoot
  ANDROID_USER_HOME = $preferenceRoot
  ANDROID_EMULATOR_HOME = $preferenceRoot
  ANDROID_AVD_HOME = (Join-Path $buildRoot 'avd')
  ANDROID_ADB_SERVER_PORT = '5039'
  ADB_SERVER_SOCKET = 'tcp:localhost:5039'
  ADB_VENDOR_KEYS = (Join-Path $preferenceRoot 'adbkey')
  ANDROID_ADB_LOG_PATH = (Join-Path $buildRoot 'adb-server.log')
  PATH = ((Join-Path $sdkRoot 'platform-tools') + ';' + $env:PATH)
  TEMP = $temporaryRoot
  TMP = $temporaryRoot
}
$priorEnvironment = @{}
foreach ($name in $temporaryEnvironment.Keys) {
  $priorEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
  [Environment]::SetEnvironmentVariable($name, $temporaryEnvironment[$name], 'Process')
}
function Invoke-CampaignAdb([string[]]$AdbArguments) {
  $ErrorActionPreference = 'Continue'
  $result = & $adb -P 5039 @AdbArguments 2>&1
  $exitCode = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  if ($exitCode -ne 0) { throw "Campaign ADB command failed: $result" }
  return $result
}
function Assert-CampaignAvd {
  $avd = Invoke-CampaignAdb @('-s',$serial,'emu','avd','name')
  if (($avd | Select-Object -First 1).ToString().Trim() -ne $avdName) {
    throw "The device on $serial is not $avdName. No emulator was changed."
  }
}
function Get-CampaignPortOwner([ValidateSet(5039,5560,5561)][int]$Port) {
  try {
    return @(Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction Stop | Select-Object -ExpandProperty OwningProcess -Unique)
  } catch {
    if ($_.FullyQualifiedErrorId -match 'CmdletizationQuery_NotFound') { return @() }
    # Some managed Windows shells deny the network CIM provider. Inspect only
    # the requested local port in netstat's result rather than hiding that error.
    $portLines = & (Join-Path $env:SystemRoot 'System32/netstat.exe') -ano -p tcp
    if ($LASTEXITCODE -ne 0) { throw "Cannot verify local port $Port; no emulator operation was performed." }
    $owners = foreach ($line in $portLines) {
      if ($line -match "^\s*TCP\s+\S+:$Port\s+\S+\s+LISTENING\s+(\d+)\s*$") { [int]$Matches[1] }
    }
    return @($owners | Select-Object -Unique)
  }
}
try {
  foreach ($serverPid in @(Get-CampaignPortOwner -Port 5039)) {
    $serverPath = (Get-Process -Id $serverPid -ErrorAction Stop).Path
    if (!$serverPath -or (Resolve-Path -LiteralPath $serverPath).Path -ne $adb) {
      throw 'Port 5039 belongs to an unverified ADB process. No existing server was changed.'
    }
  }
  if ($Action -eq 'Stop') {
    $devices = Invoke-CampaignAdb @('devices')
    if ($devices -match "(?m)^$serial\s+") {
      Assert-CampaignAvd
      Invoke-CampaignAdb @('-s',$serial,'emu','kill') | Write-Output
    }
    if ($devices | Where-Object { $_ -match '^\S+\s+(device|offline|unauthorized)' -and $_ -notmatch "^$serial\s+" }) {
      Write-Host 'Stopped Campaign emulator. Other devices use port 5039, so its ADB server was left running.'
    } else {
      Invoke-CampaignAdb @('kill-server') | Write-Output
      Write-Host 'Stopped Campaign emulator-5560 and its dedicated ADB server on 5039. Metro and the API were left running.'
    }
    return
  }
  Invoke-CampaignAdb @('start-server') | Write-Output
  $devices = Invoke-CampaignAdb @('devices','-l')
  $isRunning = [bool]($devices -match "(?m)^$serial\s+")
  if ($isRunning) { Assert-CampaignAvd }
  if ($Action -eq 'Start') {
    if ($isRunning) { Write-Host 'Campaign emulator is already running; use -Action Status to check boot.'; return }
    foreach ($port in @(5560,5561)) {
      if (@(Get-CampaignPortOwner -Port $port).Count) {
        throw "Required Campaign emulator port $port is occupied. No existing process was stopped."
      }
    }
    $emulatorArguments = @('-avd',$avdName,'-port','5560','-memory','2048','-cores','2','-gpu','swiftshader','-adb-path',$adb,'-no-window','-no-audio','-no-snapshot','-no-boot-anim')
    $process = Start-Process -FilePath $emulator -ArgumentList $emulatorArguments -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $buildRoot 'emulator-stdout.log') -RedirectStandardError (Join-Path $buildRoot 'emulator-stderr.log')
    $process.Id | Set-Content -LiteralPath (Join-Path $buildRoot 'emulator-launcher.pid')
    Write-Host "Started isolated Campaign emulator (launcher $($process.Id)); first boot may take several minutes. Use -Action Status, then -Action Install."
    return
  }
  if (!$isRunning) { throw 'Campaign emulator is not running. Use -Action Start first.' }
  $boot = (Invoke-CampaignAdb @('-s',$serial,'shell','getprop','sys.boot_completed') | Out-String).Trim()
  if ($Action -eq 'Status') {
    $devices | Write-Output
    Write-Host "Campaign boot completed: $($boot -eq '1')"
    return
  }
  if ($boot -ne '1') { throw 'Campaign emulator is still booting. Retry -Action Status before installing.' }
  try {
    $metroStatus = Invoke-WebRequest -Uri 'http://127.0.0.1:8081/status' -UseBasicParsing -TimeoutSec 5
    $metroPage = Invoke-WebRequest -Uri 'http://127.0.0.1:8081/' -UseBasicParsing -TimeoutSec 5
    $statusText = if ($metroStatus.Content -is [byte[]]) { [Text.Encoding]::UTF8.GetString($metroStatus.Content) } else { [string]$metroStatus.Content }
    $pageText = if ($metroPage.Content -is [byte[]]) { [Text.Encoding]::UTF8.GetString($metroPage.Content) } else { [string]$metroPage.Content }
    if ($metroStatus.StatusCode -ne 200 -or $statusText.Trim() -ne 'packager-status:running' -or $pageText -notmatch 'Campaign Amplification') {
      throw 'The listener is not the expected Campaign Metro preview.'
    }
  } catch {
    throw 'Campaign Metro is not ready on port 8081. Run start-local.cmd, then retry Install. No APK was installed or launched.'
  }
  $version = (Get-Content -LiteralPath (Join-Path $campaignRoot 'apps/mobile/app.json') -Raw | ConvertFrom-Json).expo.version
  $apk = Join-Path $campaignRoot "artifacts/android/campaign-$version-debug-x86_64.apk"
  if (!(Test-Path -LiteralPath $apk)) { throw 'Build the x86_64 debug APK with scripts/android-local.ps1 first.' }
  Invoke-CampaignAdb @('-s',$serial,'install','-r',$apk) | Write-Output
  Invoke-CampaignAdb @('-s',$serial,'reverse','tcp:8081','tcp:8081') | Write-Output
  Invoke-CampaignAdb @('-s',$serial,'shell','am','start','-n','com.campaignamplification.mobile/.MainActivity') | Write-Output
  Write-Host 'Campaign launched. The debug APK requires the project Metro server on 8081 and API on 8787.'
} finally {
  foreach ($name in $temporaryEnvironment.Keys) {
    [Environment]::SetEnvironmentVariable($name, $priorEnvironment[$name], 'Process')
  }
}
