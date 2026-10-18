$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'android-release-signing.ps1')
$paths = Get-CampaignReleaseSigningPaths
if ((Test-Path -LiteralPath $paths.credentials) -or (Test-Path -LiteralPath $paths.keystore)) {
  # Existing material is never overwritten, even when incomplete or unreadable.
  $existing = Read-CampaignReleaseSigning
  Write-Host 'Existing dedicated Campaign release key verified and retained. No key was replaced.'
} else {
if (!(Test-Path -LiteralPath $paths.keytool -PathType Leaf)) { throw 'The existing project JDK keytool is required.' }
Protect-CampaignSigningDirectory $paths.directory
$random = [Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
try { $random.GetBytes($bytes); $password = [Convert]::ToBase64String($bytes) }
finally { $random.Dispose(); [Array]::Clear($bytes, 0, $bytes.Length) }
$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$previous = [Environment]::GetEnvironmentVariable('CAMPAIGN_KEYTOOL_STORE_PASSWORD', 'Process')
try {
  [Environment]::SetEnvironmentVariable('CAMPAIGN_KEYTOOL_STORE_PASSWORD', $password, 'Process')
  $priorPreference = $ErrorActionPreference
  try {
    $ErrorActionPreference = 'Continue'
    $null = & $paths.keytool -genkeypair -keystore $paths.keystore -storetype JKS -alias campaign-release -keyalg RSA -keysize 3072 -sigalg SHA256withRSA -validity 10000 -dname 'CN=Campaign' -storepass:env CAMPAIGN_KEYTOOL_STORE_PASSWORD -keypass:env CAMPAIGN_KEYTOOL_STORE_PASSWORD 2>&1
    $keytoolExit = $LASTEXITCODE
  } finally { $ErrorActionPreference = $priorPreference }
  if ($keytoolExit -ne 0 -or !(Test-Path -LiteralPath $paths.keystore)) { throw 'Dedicated release key creation failed. Preserve any partial material for inspection.' }
  $settings = [PSCustomObject]@{ version = 1; keystore = $paths.keystore; alias = 'campaign-release'; storePassword = $securePassword; keyPassword = $securePassword }
  $settings | Export-Clixml -LiteralPath $paths.credentials -Encoding UTF8 -NoClobber
} finally {
  [Environment]::SetEnvironmentVariable('CAMPAIGN_KEYTOOL_STORE_PASSWORD', $previous, 'Process')
  $password = $null
}
}
$verified = Read-CampaignReleaseSigning
$verified.public | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $paths.receipt -Encoding UTF8
$backupRoot = Join-Path $paths.directory 'backups'
if (Test-Path -LiteralPath $backupRoot) {
  foreach ($candidate in @(Get-ChildItem -LiteralPath $backupRoot -Directory)) {
    $complete = $true
    foreach ($source in @($paths.keystore, $paths.credentials, $paths.receipt)) {
      $copy = Join-Path $candidate.FullName ([IO.Path]::GetFileName($source))
      if (!(Test-Path -LiteralPath $copy) -or (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath $copy -Algorithm SHA256).Hash) { $complete = $false; break }
    }
    if ($complete) { Write-Host 'Existing protected local signing backup verified. No duplicate backup created.'; exit 0 }
  }
}
$backup = Join-Path $paths.directory ('backups/' + [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N').Substring(0,8))
Protect-CampaignSigningDirectory $backup
foreach ($source in @($paths.keystore, $paths.credentials, $paths.receipt)) {
  $target = Join-Path $backup ([IO.Path]::GetFileName($source))
  Copy-Item -LiteralPath $source -Destination $target
  if ((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash) { throw 'Local signing backup verification failed.' }
}
Write-Host 'Dedicated Campaign release key verified and backed up inside protected ignored Campaign storage.'
Write-Host 'No password or private key value was printed. This same-machine backup still needs a human-controlled encrypted off-device recovery copy.'
