# Dot-source only. Signing values remain process-local and are never printed.
$ErrorActionPreference = 'Stop'

function Get-CampaignReleaseSigningPaths {
  $root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
  if ($root -ne 'E:\Campaign') { throw 'Release signing must remain inside E:\Campaign.' }
  $directory = Join-Path $root 'tmp/android-signing'
  foreach ($path in @($root, (Join-Path $root 'tmp'), $directory)) {
    if ((Test-Path -LiteralPath $path) -and ((Get-Item -LiteralPath $path -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)) {
      throw 'Release signing storage must not follow a link.'
    }
  }
  return @{
    root = $root; directory = $directory
    credentials = Join-Path $directory 'release-signing.clixml'
    keystore = Join-Path $directory 'campaign-release.jks'
    keytool = Join-Path $root 'tools/android-sdk/jdk17/bin/keytool.exe'
    receipt = Join-Path $directory 'public-certificate.json'
  }
}

function Protect-CampaignSigningDirectory([string]$Path) {
  $paths = Get-CampaignReleaseSigningPaths
  $fullPath = [IO.Path]::GetFullPath($Path)
  if ($fullPath -ne $paths.directory -and !$fullPath.StartsWith($paths.directory + '\', [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Signing storage protection is restricted to Campaign tmp/android-signing.'
  }
  if (!(Test-Path -LiteralPath $fullPath)) { New-Item -ItemType Directory -Path $fullPath | Out-Null }
  if ((Get-Item -LiteralPath $fullPath -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Signing storage must not follow a link.' }
  $owner = [Security.Principal.WindowsIdentity]::GetCurrent().User
  $system = [Security.Principal.SecurityIdentifier]::new('S-1-5-18')
  # icacls changes only the DACL; Set-Acl on this Windows host unnecessarily
  # attempts to persist audit sections and requests SeSecurityPrivilege.
  $null = & icacls.exe $fullPath '/inheritance:r' '/grant:r' ('*' + $owner.Value + ':(OI)(CI)F') '*S-1-5-18:(OI)(CI)F' 2>&1
  if ($LASTEXITCODE -ne 0) { throw 'Could not protect Campaign signing directory access.' }
  $acl = Get-Acl -LiteralPath $fullPath
  foreach ($existing in @($acl.Access)) {
    $sid = $existing.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value
    if ($sid -notin @($owner.Value, $system.Value)) {
      $null = & icacls.exe $fullPath '/remove' ('*' + $sid) 2>&1
      if ($LASTEXITCODE -ne 0) { throw 'Could not remove unrelated signing-directory access.' }
    }
  }
  $acl = Get-Acl -LiteralPath $fullPath
  if (!$acl.AreAccessRulesProtected -or @($acl.Access | Where-Object {
      $_.AccessControlType -ne 'Allow' -or $_.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value -notin @($owner.Value, $system.Value)
    }).Count) { throw 'Signing directory access verification failed.' }
}

function ConvertFrom-CampaignSigningSecureString([Security.SecureString]$Value) {
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}

function Read-CampaignReleaseSigning {
  $paths = Get-CampaignReleaseSigningPaths
  if (!(Test-Path -LiteralPath $paths.credentials -PathType Leaf) -or !(Test-Path -LiteralPath $paths.keystore -PathType Leaf)) {
    throw 'Dedicated release signing is unavailable. Run scripts/configure-android-release-signing.ps1. No debug fallback is permitted.'
  }
  if (!(Test-Path -LiteralPath $paths.keytool -PathType Leaf)) { throw 'The existing project JDK keytool is required.' }
  if ((Get-Item -LiteralPath $paths.credentials).Attributes -band [IO.FileAttributes]::ReparsePoint -or
      (Get-Item -LiteralPath $paths.keystore).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Signing files must not follow a link.' }
  Protect-CampaignSigningDirectory $paths.directory
  try { $saved = Import-Clixml -LiteralPath $paths.credentials }
  catch { throw 'Cannot unlock the Windows-protected Campaign release credentials. Use the original Windows user/machine or the controlled recovery procedure; do not generate a replacement key.' }
  if ($saved.version -ne 1 -or $saved.keystore -ne $paths.keystore -or $saved.alias -cne 'campaign-release' -or
      $saved.storePassword -isnot [Security.SecureString] -or $saved.keyPassword -isnot [Security.SecureString]) {
    throw 'Release signing credentials are invalid. Preserve the existing key and recover its original settings.'
  }
  $storePassword = ConvertFrom-CampaignSigningSecureString $saved.storePassword
  $keyPassword = ConvertFrom-CampaignSigningSecureString $saved.keyPassword
  $previous = [Environment]::GetEnvironmentVariable('CAMPAIGN_KEYTOOL_STORE_PASSWORD', 'Process')
  try {
    [Environment]::SetEnvironmentVariable('CAMPAIGN_KEYTOOL_STORE_PASSWORD', $storePassword, 'Process')
    $priorPreference = $ErrorActionPreference
    try {
      $ErrorActionPreference = 'Continue'
      $certificateText = & $paths.keytool -exportcert -rfc -keystore $paths.keystore -alias $saved.alias -storepass:env CAMPAIGN_KEYTOOL_STORE_PASSWORD 2>$null
      $keytoolExit = $LASTEXITCODE
    } finally { $ErrorActionPreference = $priorPreference }
    if ($keytoolExit -ne 0) { throw 'The dedicated release keystore could not be opened. No debug fallback is permitted.' }
    $pem = ($certificateText -join "`n")
    if ($pem -notmatch '(?s)-----BEGIN CERTIFICATE-----\s*(.*?)\s*-----END CERTIFICATE-----') { throw 'Release certificate export failed.' }
    $certificate = [Security.Cryptography.X509Certificates.X509Certificate2]::new([Convert]::FromBase64String(($Matches[1] -replace '\s', '')))
    try {
      if ($certificate.Subject -match 'Android Debug' -or $certificate.NotAfter -lt [DateTime]::UtcNow.AddDays(1) -or
          ($certificate.NotAfter - $certificate.NotBefore).TotalDays -lt (25 * 365)) {
        throw 'Release certificate is a debug key, is expired/expiring or was not issued with at least 25 years of validity.'
      }
      $hasher = [Security.Cryptography.SHA256]::Create()
      try { $fingerprint = [BitConverter]::ToString($hasher.ComputeHash($certificate.RawData)).Replace('-', '').ToLowerInvariant() }
      finally { $hasher.Dispose() }
      $public = [ordered]@{
        subject = $certificate.Subject; certificateSha256 = $fingerprint
        notBeforeUtc = $certificate.NotBefore.ToUniversalTime().ToString('o')
        notAfterUtc = $certificate.NotAfter.ToUniversalTime().ToString('o')
        keyAlgorithm = $certificate.PublicKey.Oid.FriendlyName; keyBits = $certificate.PublicKey.Key.KeySize
        keystore = $paths.keystore; credentials = $paths.credentials
        credentialProtection = 'Windows DPAPI CurrentUser CLIXML; owner and SYSTEM directory ACL'
      }
    } finally { $certificate.Dispose() }
  } finally { [Environment]::SetEnvironmentVariable('CAMPAIGN_KEYTOOL_STORE_PASSWORD', $previous, 'Process') }
  return @{
    environment = @{
      CAMPAIGN_RELEASE_STORE_FILE = $paths.keystore
      CAMPAIGN_RELEASE_STORE_PASSWORD = $storePassword
      CAMPAIGN_RELEASE_KEY_ALIAS = $saved.alias
      CAMPAIGN_RELEASE_KEY_PASSWORD = $keyPassword
    }
    certificateSha256 = $fingerprint; public = $public
  }
}
