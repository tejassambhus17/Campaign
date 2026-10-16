$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
if ($taskRoot -ne 'E:\Campaign') { throw 'The authorized Campaign root must be E:\Campaign.' }
$taskFile = Join-Path $taskRoot 'services/api/data/cloudinary-runtime.env'
if (Test-Path -LiteralPath $taskFile) {
  throw 'Campaign already has local Cloudinary settings. Preserve the existing file; do not overwrite it.'
}

Write-Host 'In Cloudinary Console, use the Free Image and Video API product environment.'
Write-Host 'Enter its cloud name, API key, and API secret here. Input is hidden and is never sent to chat or Git.'
$taskCloud = Read-Host 'Cloud name'
$taskKeySecure = Read-Host 'API key (hidden)' -AsSecureString
$taskSecretSecure = Read-Host 'API secret (hidden)' -AsSecureString

function ConvertFrom-CampaignSecureString([System.Security.SecureString]$Value) {
  $taskPointer = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try { return [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($taskPointer) }
  finally { [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskPointer) }
}

$taskKey = ConvertFrom-CampaignSecureString $taskKeySecure
$taskSecret = ConvertFrom-CampaignSecureString $taskSecretSecure
if ($taskCloud -cnotmatch '^[A-Za-z0-9_-]{1,100}$' -or
    $taskKey -notmatch '^[0-9]{1,100}$' -or
    [string]::IsNullOrWhiteSpace($taskSecret) -or $taskSecret.Length -gt 512 -or
    $taskSecret.Contains("`n") -or $taskSecret.Contains("`r")) {
  throw 'Cloudinary values did not match the expected format. No file was written.'
}

$taskDirectory = Split-Path -Parent $taskFile
New-Item -ItemType Directory -Path $taskDirectory -Force | Out-Null
$taskContent = "CLOUDINARY_CLOUD_NAME=$taskCloud`nCLOUDINARY_API_KEY=$taskKey`nCLOUDINARY_API_SECRET=$taskSecret`n"
$taskBytes = [System.Text.UTF8Encoding]::new($false).GetBytes($taskContent)
$taskStream = [System.IO.File]::Open($taskFile, [System.IO.FileMode]::CreateNew,
  [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
try { $taskStream.Write($taskBytes, 0, $taskBytes.Length) }
finally { $taskStream.Dispose() }
Write-Host 'Saved ignored Campaign-local Cloudinary settings. No values were printed.'
