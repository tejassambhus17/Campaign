# Human-operated portable recovery export. No password is written or printed.
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'android-release-signing.ps1')
$paths = Get-CampaignReleaseSigningPaths
$current = Read-CampaignReleaseSigning
Write-Host 'Use a new strong generated recovery password from your password manager (at least 20 characters).'
Write-Host 'Keep it in your password manager; do not paste it into chat. The export stays inside Campaign until you copy it manually to encrypted offline storage.'
$first = Read-Host 'Recovery password (hidden)' -AsSecureString
$second = Read-Host 'Repeat recovery password (hidden)' -AsSecureString
$recoveryPassword = ConvertFrom-CampaignSigningSecureString $first
$confirmation = ConvertFrom-CampaignSigningSecureString $second
if ($recoveryPassword.Length -lt 20 -or $recoveryPassword -cne $confirmation) { throw 'Recovery passwords did not match or were shorter than 20 characters. No export was created.' }
$directory = Join-Path $paths.directory ('portable-backup/' + [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N').Substring(0,8))
Protect-CampaignSigningDirectory $directory
$destination = Join-Path $directory 'campaign-release-recovery.p12'
$variables = @{
  CAMPAIGN_KEYTOOL_SOURCE_PASSWORD = $current.environment.CAMPAIGN_RELEASE_STORE_PASSWORD
  CAMPAIGN_KEYTOOL_SOURCE_KEY_PASSWORD = $current.environment.CAMPAIGN_RELEASE_KEY_PASSWORD
  CAMPAIGN_KEYTOOL_RECOVERY_PASSWORD = $recoveryPassword
}
$previous = @{}
try {
  foreach ($name in $variables.Keys) {
    $previous[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
    [Environment]::SetEnvironmentVariable($name, $variables[$name], 'Process')
  }
  $priorPreference = $ErrorActionPreference
  try {
    $ErrorActionPreference = 'Continue'
    $null = & $paths.keytool -importkeystore -srckeystore $paths.keystore -srcstoretype JKS -srcalias campaign-release -srcstorepass:env CAMPAIGN_KEYTOOL_SOURCE_PASSWORD -srckeypass:env CAMPAIGN_KEYTOOL_SOURCE_KEY_PASSWORD -destkeystore $destination -deststoretype PKCS12 -destalias campaign-release -deststorepass:env CAMPAIGN_KEYTOOL_RECOVERY_PASSWORD -destkeypass:env CAMPAIGN_KEYTOOL_RECOVERY_PASSWORD -noprompt 2>&1
    $importExit = $LASTEXITCODE
    $publicCertificate = & $paths.keytool -exportcert -rfc -keystore $destination -storetype PKCS12 -alias campaign-release -storepass:env CAMPAIGN_KEYTOOL_RECOVERY_PASSWORD 2>$null
    $exportExit = $LASTEXITCODE
  } finally { $ErrorActionPreference = $priorPreference }
  if ($importExit -ne 0 -or $exportExit -ne 0 -or ($publicCertificate -join "`n") -notmatch '(?s)-----BEGIN CERTIFICATE-----\s*(.*?)\s*-----END CERTIFICATE-----') { throw 'Portable recovery export failed. Preserve the original signing files.' }
  $der = [Convert]::FromBase64String(($Matches[1] -replace '\s', ''))
  $hasher = [Security.Cryptography.SHA256]::Create()
  try { $fingerprint = [BitConverter]::ToString($hasher.ComputeHash($der)).Replace('-', '').ToLowerInvariant() }
  finally { $hasher.Dispose() }
  if ($fingerprint -ne $current.certificateSha256) { throw 'Recovery certificate does not match the established release key.' }
  @{
    format = 'PKCS12'; alias = 'campaign-release'; certificateSha256 = $fingerprint
    bytes = (Get-Item -LiteralPath $destination).Length
    fileSha256 = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash
    createdUtc = [DateTime]::UtcNow.ToString('o')
    passwordStorage = 'Human password manager; no password saved in this receipt'
    offDeviceBackupCompleted = $false
  } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $directory 'recovery-receipt.json') -Encoding UTF8
  Write-Host "Portable password-protected same-key recovery export verified: $destination"
  Write-Host 'Copy this file and its public receipt manually to encrypted offline storage, then verify its SHA256. Off-device backup is not yet confirmed.'
} finally {
  foreach ($name in $previous.Keys) { [Environment]::SetEnvironmentVariable($name, $previous[$name], 'Process') }
  $recoveryPassword = $null; $confirmation = $null; $variables = $null
}
