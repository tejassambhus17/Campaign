param(
  [ValidateSet('arm64-v8a','x86_64','arm64-v8a,x86_64')]
  [string]$Architecture = 'arm64-v8a',
  [ValidateRange(1,4)][int]$Workers = 2,
  [ValidateSet('Debug','InternalTest')]
  [string]$Mode = 'Debug',
  [string]$ApiUrl = 'http://10.0.2.2:8787',
  [ValidatePattern('^$|^[a-z0-9][a-z0-9-]{0,63}$')]
  [string]$ArtifactTag = ''
)
$ErrorActionPreference = 'Stop'
$campaignRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
if ($campaignRoot -ne 'E:\Campaign') { throw 'The authorized project root must resolve to E:\Campaign.' }
$mobileRoot = Join-Path $campaignRoot 'apps/mobile'
$buildRoot = Join-Path $campaignRoot 'tmp/android-build'
$javaTemp = Join-Path $campaignRoot 'tmp/java'
$sdkRoot = Join-Path $campaignRoot 'tools/android-sdk'
$jdkRoot = Join-Path $sdkRoot 'jdk17'
$nativeRoot = Join-Path $mobileRoot 'android'
$artifactRoot = Join-Path $campaignRoot 'artifacts/android'
if ($ArtifactTag) { $artifactRoot = Join-Path $artifactRoot $ArtifactTag }
$internalTest = $Mode -eq 'InternalTest'
$variant = if ($internalTest) { 'release' } else { 'debug' }
$artifactLabel = if ($internalTest) { 'INTERNAL-TEST' } else { 'debug' }
$nativeConfigStamp = Join-Path $buildRoot 'native-config.json'
if ($internalTest) {
  $parsedApi = $null
  if (![Uri]::TryCreate($ApiUrl.Trim(), [UriKind]::Absolute, [ref]$parsedApi) -or
      $parsedApi.Scheme -notin @('http','https') -or
      $parsedApi.UserInfo -or $parsedApi.Query -or $parsedApi.Fragment) {
    throw 'InternalTest requires a complete HTTP/HTTPS API URL without credentials, a query, or a fragment.'
  }
  $ApiUrl = $parsedApi.AbsoluteUri.TrimEnd('/')
}
$mobilePackage = Get-Content -LiteralPath (Join-Path $mobileRoot 'package.json') -Raw | ConvertFrom-Json
if ($mobilePackage.dependencies.expo -notmatch '55\.') { throw 'Review the SDK/toolchain configuration before building an Expo SDK other than 55.' }
foreach ($requiredPath in @('jdk17/bin/java.exe','platforms/android-36/android.jar','build-tools/36.0.0/aapt2.exe','ndk/27.1.12297006/source.properties','cmake/3.22.1/source.properties')) {
  if (!(Test-Path -LiteralPath (Join-Path $sdkRoot $requiredPath))) { throw "Missing project-local toolchain component: $requiredPath. See docs/ANDROID_LOCAL.md." }
}
$campaignNode = if ($env:CAMPAIGN_NODE) { $env:CAMPAIGN_NODE } else { (Get-Command node).Source }
if ([version](& $campaignNode -p 'process.versions.node') -lt [version]'20.19.4') {
  $runtimeRoot = Join-Path $env:LOCALAPPDATA 'OpenAI/Codex/runtimes/cua_node'
  foreach ($candidate in @(Get-ChildItem -LiteralPath $runtimeRoot -Filter node.exe -Recurse -ErrorAction SilentlyContinue)) {
    if ([version](& $candidate.FullName -p 'process.versions.node') -ge [version]'20.19.4') { $campaignNode = $candidate.FullName; break }
  }
}
$nodeVersion = & $campaignNode -p 'process.versions.node'
if ([version]$nodeVersion -lt [version]'20.19.4') { throw 'Use Node 20.19.4+ or set CAMPAIGN_NODE to a compatible executable.' }
New-Item -ItemType Directory -Path $buildRoot,$artifactRoot,$javaTemp -Force | Out-Null
$temporaryEnvironment = @{
  JAVA_HOME = $jdkRoot
  ANDROID_HOME = $sdkRoot
  ANDROID_SDK_ROOT = $sdkRoot
  ANDROID_SDK_HOME = $buildRoot
  ANDROID_USER_HOME = (Join-Path $buildRoot '.android')
  GRADLE_USER_HOME = (Join-Path $buildRoot 'gradle')
  # Windows AF_UNIX selector wakeups fail through this host's aliased user TEMP.
  # Use a tested, project-local canonical path for client and daemon JVMs.
  # The existing value is restored in finally, like the other process variables.
  JAVA_TOOL_OPTIONS = "-Djava.io.tmpdir=$($javaTemp.Replace('\','/')) -Djdk.net.unixdomain.tmpdir=$($javaTemp.Replace('\','/'))"
  PATH = ((Split-Path $campaignNode) + ';' + (Join-Path $jdkRoot 'bin') + ';' + $env:PATH)
  EXPO_NO_TELEMETRY = '1'
  CI = '1'
  CAMPAIGN_INTERNAL_TEST = if ($internalTest) { '1' } else { '0' }
  EXPO_PUBLIC_INTERNAL_TEST = if ($internalTest) { '1' } else { '0' }
}
if ($internalTest) { $temporaryEnvironment.EXPO_PUBLIC_API_URL = $ApiUrl }
$priorEnvironment = @{}
foreach ($name in $temporaryEnvironment.Keys) {
  $priorEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
  [Environment]::SetEnvironmentVariable($name, $temporaryEnvironment[$name], 'Process')
}
$started = [DateTime]::UtcNow.ToString('o')
$architectureLabel = $Architecture.Replace('arm64-v8a','arm64').Replace(',','-')
$logTag = if ($ArtifactTag) { "-$ArtifactTag" } else { '' }
$buildLog = Join-Path $buildRoot "assemble-$artifactLabel-$architectureLabel$logTag.log"
$buildExitCode = 1
Push-Location -LiteralPath $mobileRoot
try {
  # Regenerate through CNG when native configuration changes or switches modes.
  # In particular, a later Debug build must remove InternalTest's main-manifest
  # HTTP allowance instead of silently retaining the previous generated value.
  $nativeInputs = @('app.json','app.config.ts','assets/fonts/Manrope-OFL.txt','assets/fonts/Newsreader-OFL.txt') + @(
    Get-ChildItem -LiteralPath (Join-Path $mobileRoot 'plugins') -File |
      Sort-Object Name | ForEach-Object { 'plugins/' + $_.Name }
  )
  $nativeFingerprint = "$Mode`n" + (($nativeInputs | ForEach-Object {
    "$_`:$((Get-FileHash -LiteralPath (Join-Path $mobileRoot $_) -Algorithm SHA256).Hash)"
  }) -join "`n")
  $fingerprintBytes = [Text.Encoding]::UTF8.GetBytes($nativeFingerprint)
  $hasher = [Security.Cryptography.SHA256]::Create()
  try { $configHash = [BitConverter]::ToString($hasher.ComputeHash($fingerprintBytes)).Replace('-','') }
  finally { $hasher.Dispose() }
  $savedHash = ''
  if (Test-Path -LiteralPath $nativeConfigStamp) {
    try { $savedHash = (Get-Content -LiteralPath $nativeConfigStamp -Raw | ConvertFrom-Json).sha256 }
    catch { Write-Host 'The native configuration stamp is unreadable; regenerating through Expo.' }
  }
  $didGenerate = $false
  if (!(Test-Path -LiteralPath $nativeRoot) -or $savedHash -ne $configHash) {
    Write-Host "Generating $Mode Android configuration through Expo prebuild (no dependency installation)."
    $ErrorActionPreference = 'Continue'
    & $campaignNode 'node_modules/expo/bin/cli' prebuild --platform android --no-install --skip-dependency-update 'react-native,react' *> (Join-Path $buildRoot 'prebuild.log')
    $prebuildExitCode = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    if ($prebuildExitCode -ne 0) { throw 'Expo prebuild failed. Inspect tmp/android-build/prebuild.log.' }
    $didGenerate = $true
  }
  $nativeWrapper = Join-Path $nativeRoot 'gradlew.bat'
  if (!(Test-Path -LiteralPath $nativeWrapper)) { throw 'The generated Android Gradle wrapper is missing. Regenerate with Expo prebuild.' }
  [xml]$generatedManifest = Get-Content -LiteralPath (Join-Path $nativeRoot 'app/src/main/AndroidManifest.xml') -Raw
  $cleartextSetting = $generatedManifest.manifest.application.GetAttribute('usesCleartextTraffic','http://schemas.android.com/apk/res/android')
  if (($internalTest -and $cleartextSetting -ne 'true') -or (!$internalTest -and $cleartextSetting -eq 'true')) {
    throw 'The generated Android HTTP policy does not match the selected build mode. Regenerate through Expo before building.'
  }
  if ($didGenerate) {
    @{ mode = $Mode; sha256 = $configHash; generatedUtc = [DateTime]::UtcNow.ToString('o') } |
      ConvertTo-Json | Set-Content -LiteralPath $nativeConfigStamp -Encoding UTF8
  }
  Write-Host "Building a local $Architecture $artifactLabel APK with project-isolated SDK/JDK/Gradle. Log: $buildLog"
  # Gradle's bundle inputs do not include EXPO_PUBLIC_API_URL. Rerun only the
  # bundle task so a changed demo address cannot reuse a previous embedded URL.
  $assembleTasks = if ($internalTest) { @(':app:createBundleReleaseJsAndAssets','--rerun',':app:assembleRelease') } else { @('assembleDebug') }
  $arguments = @('-p', $nativeRoot) + $assembleTasks + @('--no-daemon', "--max-workers=$Workers", "-PreactNativeArchitectures=$Architecture", '--console=plain', '--stacktrace')
  $ErrorActionPreference = 'Continue'
  & $nativeWrapper @arguments *> $buildLog
  $buildExitCode = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  Get-Content -LiteralPath $buildLog -Tail 30
  if ($buildExitCode -ne 0) { throw "Android build failed with exit code $buildExitCode. Inspect $buildLog." }
  $apk = Join-Path $nativeRoot "app/build/outputs/apk/$variant/app-$variant.apk"
  if (!(Test-Path -LiteralPath $apk)) { throw "Gradle reported success but the $variant APK was not found." }
  $bundleBytes = $null
  $certificateHash = $null
  $verifiedFonts = @()
  $verifiedFontLicenses = @()
  if ($internalTest) {
    $aapt = Join-Path $sdkRoot 'build-tools/36.0.0/aapt2.exe'
    $signerJar = Join-Path $sdkRoot 'build-tools/36.0.0/lib/apksigner.jar'
    $ErrorActionPreference = 'Continue'
    $badging = & $aapt dump badging $apk 2>&1
    $badgingExitCode = $LASTEXITCODE
    $certificate = & (Join-Path $jdkRoot 'bin/java.exe') -jar $signerJar verify --print-certs $apk 2>&1
    $certificateExitCode = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    if ($badgingExitCode -ne 0 -or $badging -match '^application-debuggable') {
      throw 'InternalTest must be a valid, non-debuggable release-variant APK.'
    }
    if ($certificateExitCode -ne 0 -or !($certificate -match 'certificate DN: CN=Android Debug,')) {
      throw 'InternalTest signing verification failed: the expected Android Debug certificate was not found.'
    }
    $digestLine = $certificate | Where-Object { $_ -match 'certificate SHA-256 digest: ([a-fA-F0-9]{64})' } | Select-Object -First 1
    if (!$digestLine -or $digestLine -notmatch 'certificate SHA-256 digest: ([a-fA-F0-9]{64})') {
      throw 'Could not read the InternalTest signing certificate fingerprint.'
    }
    $certificateHash = $Matches[1].ToLowerInvariant()
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [IO.Compression.ZipFile]::OpenRead($apk)
    try {
      $bundle = $archive.GetEntry('assets/index.android.bundle')
      if (!$bundle -or $bundle.Length -le 0) { throw 'InternalTest has no embedded JavaScript bundle.' }
      $bundleBytes = $bundle.Length
      $fontNames = @(
        'Manrope-Regular.ttf','Manrope-Medium.ttf','Manrope-SemiBold.ttf',
        'Manrope-Bold.ttf','Newsreader-Medium.ttf','Newsreader-SemiBold.ttf'
      )
      $sourceFonts = @($fontNames | ForEach-Object {
        $fontPath = Join-Path $mobileRoot "assets/fonts/$_"
        if (!(Test-Path -LiteralPath $fontPath)) { throw "Missing required local font: $_" }
        @{ source = $_; bytes = (Get-Item -LiteralPath $fontPath).Length; sha256 = (Get-FileHash -LiteralPath $fontPath -Algorithm SHA256).Hash }
      })
      $fontSizes = @($sourceFonts | ForEach-Object { $_.bytes } | Sort-Object -Unique)
      $packagedFonts = @{}
      # Metro may rename or relocate font assets. Match exact source bytes,
      # without depending on either the APK entry name or its extension.
      foreach ($entry in $archive.Entries) {
        if ($entry.Length -notin $fontSizes) { continue }
        $fontStream = $entry.Open()
        $fontHasher = [Security.Cryptography.SHA256]::Create()
        try { $fontHash = [BitConverter]::ToString($fontHasher.ComputeHash($fontStream)).Replace('-','') }
        finally { $fontStream.Dispose(); $fontHasher.Dispose() }
        $packagedFonts[$fontHash] = $entry.FullName
      }
      foreach ($font in $sourceFonts) {
        if (!$packagedFonts.ContainsKey($font.sha256)) {
          throw "InternalTest APK is missing exact bytes for required font $($font.source)."
        }
        $verifiedFonts += @{
          source = $font.source; apkEntry = $packagedFonts[$font.sha256]
          bytes = $font.bytes; sha256 = $font.sha256.ToLowerInvariant()
        }
      }
      foreach ($licenseName in @('Manrope-OFL.txt','Newsreader-OFL.txt')) {
        $licensePath = Join-Path $mobileRoot "assets/fonts/$licenseName"
        $licenseHash = (Get-FileHash -LiteralPath $licensePath -Algorithm SHA256).Hash
        $licenseEntry = $archive.GetEntry("assets/licenses/$licenseName")
        if (!$licenseEntry) { throw "InternalTest APK is missing the full font license $licenseName." }
        $licenseStream = $licenseEntry.Open()
        $licenseHasher = [Security.Cryptography.SHA256]::Create()
        try { $packagedLicenseHash = [BitConverter]::ToString($licenseHasher.ComputeHash($licenseStream)).Replace('-','') }
        finally { $licenseStream.Dispose(); $licenseHasher.Dispose() }
        if ($packagedLicenseHash -ne $licenseHash) { throw "Packaged font license bytes do not match $licenseName." }
        $verifiedFontLicenses += @{
          source = $licenseName; apkEntry = $licenseEntry.FullName
          bytes = $licenseEntry.Length; sha256 = $licenseHash.ToLowerInvariant()
        }
      }
    } finally { $archive.Dispose() }
  }
  $version = (Get-Content -LiteralPath (Join-Path $mobileRoot 'app.json') -Raw | ConvertFrom-Json).expo.version
  $artifact = Join-Path $artifactRoot "campaign-$version-$artifactLabel-$architectureLabel.apk"
  Copy-Item -LiteralPath $apk -Destination $artifact -Force
  $checksum = (Get-FileHash -LiteralPath $artifact -Algorithm SHA256).Hash
  $metadata = @{
    architecture = $Architecture; apk = $artifact; bytes = (Get-Item -LiteralPath $artifact).Length
    artifactTag = $ArtifactTag
    jvmTemporaryDirectory = $javaTemp
    sha256 = $checksum; startedUtc = $started; finishedUtc = [DateTime]::UtcNow.ToString('o')
    node = $nodeVersion; sdk = 36; buildTools = '36.0.0'; ndk = '27.1.12297006'
    jdk = '17.0.20.1'; gradle = '9.0.0'; developmentOnly = $true; requiresMetro = $true
  }
  if ($internalTest) {
    $metadata.buildVariant = 'release'
    $metadata.distribution = 'INTERNAL-TEST'
    $metadata.internalTestConnectionControls = $true
    $metadata.signingCertificate = 'Android Debug'
    $metadata.signingCertificateSha256 = $certificateHash
    $metadata.apiUrl = $ApiUrl
    $metadata.localHttpAllowed = $true
    $metadata.embeddedJavaScriptBytes = $bundleBytes
    $metadata.verifiedLocalFonts = $verifiedFonts
    $metadata.verifiedFontLicenses = $verifiedFontLicenses
    # Structural checks prove bundling, not successful native execution. Keep
    # Metro independence unknown until the installed cold-launch check is done.
    $metadata.requiresMetro = $null
    $metadata.expectedToRequireMetro = $false
    $metadata.metroIndependentLaunchVerified = $false
    $metadata.productionReady = $false
  }
  $metadata | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath "$artifact.json" -Encoding UTF8
  Write-Host "$artifactLabel APK: $artifact"
  Write-Host "SHA-256: $checksum"
  if ($internalTest) {
    Write-Host 'INTERNAL-TEST: release variant with embedded JavaScript, signed by the Android Debug certificate.'
    Write-Host 'Installed launch without Metro and a reachable demo API still need verification. This is not a production-signed delivery.'
  } else {
    Write-Host 'Development build only: requires the local Metro server. This is not a standalone release APK.'
  }
} finally {
  Pop-Location
  foreach ($name in $priorEnvironment.Keys) { [Environment]::SetEnvironmentVariable($name, $priorEnvironment[$name], 'Process') }
}
exit $buildExitCode
