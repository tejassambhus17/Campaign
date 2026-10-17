$ErrorActionPreference='Stop'
$taskRoot=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
if ($taskRoot -ne 'E:\Campaign') { throw 'The authorized root must be E:\Campaign.' }
Write-Host 'Checking the existing React Native TypeScript application...'
& (Join-Path $PSScriptRoot 'mobile.ps1') typecheck
Write-Host 'Building the existing Android JavaScript/assets bundle...'
& (Join-Path $PSScriptRoot 'mobile.ps1') export:android
Write-Host 'Checking FastAPI Python source compilation...'
& (Join-Path $taskRoot 'services/api/.venv/Scripts/python.exe') -m compileall -q (Join-Path $taskRoot 'services/api') -x '\.venv|__pycache__|[/\\]data[/\\]'
if ($LASTEXITCODE -ne 0) { throw 'FastAPI compilation failed.' }
Write-Host 'Campaign build passed: TypeScript, Android JavaScript/assets export and FastAPI compilation. This is not an APK build.'
