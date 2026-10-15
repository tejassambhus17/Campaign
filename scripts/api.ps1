param([ValidateSet('run','test')][string]$Task='run')
$ErrorActionPreference='Stop'
$taskRoot=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$taskApi=Join-Path $taskRoot 'services/api'
$taskPython=Join-Path $taskApi '.venv/Scripts/python.exe'
if (!(Test-Path -LiteralPath $taskPython)) { throw 'Project Python environment missing. See services/api/README.md for installation.' }
Push-Location -LiteralPath $taskApi
try {
  if ($Task -eq 'test') { & $taskPython -m unittest -v test_api }
  else { & $taskPython run.py }
  if ($LASTEXITCODE -ne 0) { throw "API command failed with exit code $LASTEXITCODE" }
} finally { Pop-Location }
