param([ValidateRange(1024,65535)][int]$Port = 8879)
$ErrorActionPreference='Stop'
$taskRoot=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
if ($taskRoot -ne 'E:\Campaign') { throw 'The authorized root must be E:\Campaign.' }
$env:CAMPAIGN_PORT=[string]$Port
& (Join-Path $PSScriptRoot 'node-project.ps1') -Task neon-api
if ($LASTEXITCODE -ne 0) { throw 'Campaign Neon API exited unsuccessfully. Credentials are not printed.' }
