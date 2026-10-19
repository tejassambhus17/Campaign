param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path.TrimEnd('\')
if ($taskRoot -ne 'E:\Campaign' -or (Resolve-Path -LiteralPath '.').Path -ne $taskRoot) { throw 'Run only from E:\Campaign.' }
$taskAuditDir = Join-Path $taskRoot 'artifacts\cleanup-20261019'
$taskPlanPath = Join-Path $taskAuditDir 'PLAN.json'
$taskResultPath = Join-Path $taskAuditDir 'RESULT.json'
$taskLatestRelative = 'artifacts/dropdown-hierarchy-20261018/Campaign.apk'
$taskLatestHash = 'cb08edf303ba6eb7b9720f21be4e2879c8179cdb7d19eccfac91024908953397'
$taskPrefix = $taskRoot + '\'

function Assert-TaskPath([string]$Path) {
    $taskFull = [IO.Path]::GetFullPath($Path)
    if (!$taskFull.StartsWith($taskPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw "Outside Campaign: $taskFull" }
    $taskRelative = $taskFull.Substring($taskPrefix.Length).Replace('\','/')
    if ($taskRelative -match '(^|/)(\.git|android-signing|private-backup|github-backup|avd|\.android)(/|$)' -or
        $taskRelative -match '^(services/|tools/|node_modules/|docs/|\.agents/)' -or
        $taskRelative -match '\.(jks|keystore|clixml|db|sqlite|sqlite3|qcow2|img)$') { throw "Protected path: $taskRelative" }
    $taskCursor = Get-Item -LiteralPath $taskFull -Force
    while ($null -ne $taskCursor -and $taskCursor.FullName -ne $taskRoot) {
        if ($taskCursor.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Reparse point: $($taskCursor.FullName)" }
        $taskCursor = if ($taskCursor.PSIsContainer) { $taskCursor.Parent } else { $taskCursor.Directory }
    }
    return $taskFull
}

function Get-TaskHash([string]$Relative) {
    return (Get-FileHash -LiteralPath (Join-Path $taskRoot $Relative) -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Test-TaskGuards($Guards) {
    foreach ($taskGuard in $Guards) {
        if ((Get-TaskHash $taskGuard.path) -ne $taskGuard.sha256.ToLowerInvariant()) { throw "Preserved file mismatch: $($taskGuard.path)" }
    }
}

if (!(Test-Path -LiteralPath $taskAuditDir)) { New-Item -ItemType Directory -Path $taskAuditDir | Out-Null }
if ((Get-TaskHash $taskLatestRelative) -ne $taskLatestHash) { throw 'Latest signed APK hash mismatch.' }

if (!$Apply) {
    if (Test-Path -LiteralPath $taskPlanPath) { throw 'A cleanup plan already exists. Do not overwrite its audit history.' }
    $taskKeep = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    $taskScreenshotManifest = Get-Content -LiteralPath (Join-Path $taskRoot 'docs\screenshots\manifest.json') -Raw | ConvertFrom-Json
    foreach ($taskImage in $taskScreenshotManifest.screenshots) { [void]$taskKeep.Add($taskImage.source.Replace('\','/')) }
    foreach ($taskPath in @($taskLatestRelative,
        'artifacts/delivery/Campaign-1.2.3/Campaign-demo.mp4',
        'artifacts/delivery/Campaign-1.2.3/Campaign-report.pdf',
        'artifacts/delivery/Campaign-1.2.3/Campaign-report-INR.pdf')) { [void]$taskKeep.Add($taskPath) }
    $taskTracked = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    & git -c core.quotepath=false ls-files | ForEach-Object { [void]$taskTracked.Add($_.Replace('\','/')) }
    if ($LASTEXITCODE -ne 0) { throw 'Cannot read tracked-file protection list.' }
    $taskCandidates = [Collections.Generic.List[object]]::new()
    $taskDirectoryTargets = @(
        'tmp/android-build/gradle/caches',
        'apps/mobile/android/app/build', 'apps/mobile/android/app/.cxx',
        'apps/mobile/android/build', 'apps/mobile/android/.gradle', 'apps/mobile/android/.kotlin',
        'apps/mobile/dist', 'apps/mobile/dist-android', 'apps/mobile/web-build',
        'tmp/export-reference', 'artifacts/activity-currency-polish-20261017/web-compat'
    )
    $taskDirectoryFullPaths = [Collections.Generic.List[string]]::new()
    foreach ($taskRelative in $taskDirectoryTargets) {
        $taskPath = Join-Path $taskRoot $taskRelative
        if (!(Test-Path -LiteralPath $taskPath)) { continue }
        $taskPath = Assert-TaskPath $taskPath
        $taskChildren = @(Get-ChildItem -LiteralPath $taskPath -Recurse -Force)
        if (@($taskChildren | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count) { throw "Linked child in deletion target: $taskRelative" }
        foreach ($taskChild in $taskChildren) {
            $taskChildRelative = $taskChild.FullName.Substring($taskPrefix.Length).Replace('\','/')
            if ($taskTracked.Contains($taskChildRelative)) { throw "Tracked file in generated target: $taskChildRelative" }
        }
        $taskFiles = @($taskChildren | Where-Object { !$_.PSIsContainer })
        $taskBytes = ($taskFiles | Measure-Object -Property Length -Sum).Sum
        $taskCandidates.Add([pscustomobject]@{ path=$taskRelative; kind='directory'; files=$taskFiles.Count; bytes=[long]$taskBytes; reason='Reproducible Android build/cache/export output' })
        $taskDirectoryFullPaths.Add($taskPath + '\')
    }

    $taskMediaExtensions = @('.png','.jpg','.jpeg','.webp','.gif','.mp4','.mov','.webm','.wav','.aac','.m4a','.mp3','.pdf')
    $taskReferenceNames = @('reference.png','reference.jpg','reference-trust-score.jpg','creation-progress-reference.jpg')
    $taskArtifactFiles = @(Get-ChildItem -LiteralPath (Join-Path $taskRoot 'artifacts') -Recurse -File -Force)
    $taskTmpApks = @(Get-ChildItem -LiteralPath (Join-Path $taskRoot 'tmp') -Recurse -File -Force -Filter '*.apk')
    $taskRootApks = @(Get-ChildItem -LiteralPath $taskRoot -File -Filter '*.apk')
    $taskArchives = @('tmp/android-build/commandlinetools-win-15859902_latest.zip',
        'tmp/android-build/gradle-9.0.0-bin.zip','tmp/android-build/temurin-jdk17.zip',
        'tmp/cloud-deploy/postgresql-windows-official.zip') | ForEach-Object {
            $taskPath = Join-Path $taskRoot $_
            if (Test-Path -LiteralPath $taskPath) { Get-Item -LiteralPath $taskPath }
        }
    foreach ($taskFile in @($taskArtifactFiles) + @($taskTmpApks) + @($taskRootApks) + @($taskArchives)) {
        $taskRelative = $taskFile.FullName.Substring($taskPrefix.Length).Replace('\','/')
        if ($taskTracked.Contains($taskRelative) -or $taskKeep.Contains($taskRelative) -or
            $taskRelative -match '(^|/)(private-backup|private-qa|android-signing|github-backup|avd|\.android|checkpoints)(/|$)' -or
            $taskRelative.StartsWith('artifacts/cleanup-20261019/')) { continue }
        if (@($taskDirectoryFullPaths | Where-Object { $taskFile.FullName.StartsWith($_,[StringComparison]::OrdinalIgnoreCase) }).Count) { continue }
        $taskReason = $null
        if ($taskFile.Extension -in @('.apk','.aab','.apks','.idsig')) { $taskReason = 'Superseded or duplicate build; canonical signed1.4.0 retained' }
        elseif ($taskRelative -like 'artifacts/*' -and $taskFile.Extension.ToLowerInvariant() -in $taskMediaExtensions) {
            if ($taskFile.Name -in $taskReferenceNames -or
                $taskRelative.StartsWith('artifacts/dropdown-hierarchy-20261018/native-confirmed/') -or
                $taskRelative.StartsWith('artifacts/dropdown-hierarchy-20261018/native-candidate/') -or
                ($taskRelative -match '^artifacts/dropdown-hierarchy-20261018/COMPARE\.[^/]+\.png$')) { continue }
            $taskReason = 'Superseded capture/render/raw media; latest captures and final media retained'
        }
        elseif ($taskFile.FullName -in @($taskArchives.FullName)) { $taskReason = 'Redundant installer archive; extracted installed tool retained' }
        if ($null -eq $taskReason) { continue }
        [void](Assert-TaskPath $taskFile.FullName)
        $taskCandidates.Add([pscustomobject]@{path=$taskRelative; kind='file'; files=1; bytes=$taskFile.Length; modifiedUtc=$taskFile.LastWriteTimeUtc.ToString('o'); reason=$taskReason})
    }
    $taskFrozen = Get-Content -LiteralPath (Join-Path $taskRoot 'artifacts\dropdown-hierarchy-20261018\SOURCE_INPUTS.confirmed.json') -Raw | ConvertFrom-Json
    $taskGuards = [Collections.Generic.List[object]]::new()
    foreach ($taskInput in $taskFrozen.files) { $taskGuards.Add([pscustomobject]@{path=$taskInput.path;sha256=$taskInput.sha256}) }
    foreach ($taskPath in @($taskKeep) + @('README.md','docs/README_MEDIA.md','docs/screenshots/README.md',
        'docs/screenshots/manifest.json','docs/screenshots/prepare_assets.py','docs/screenshots/validate_readme.py',
        'docs/screenshots/verification.json','docs/screenshots/review/index.html','docs/screenshots/campaign-logo.png',
        'Hackathon_Requirements.pdf')) {
        if (Test-Path -LiteralPath (Join-Path $taskRoot $taskPath)) { $taskGuards.Add([pscustomobject]@{path=$taskPath;sha256=(Get-TaskHash $taskPath)}) }
    }
    foreach ($taskImage in $taskScreenshotManifest.screenshots) { $taskGuards.Add([pscustomobject]@{path=$taskImage.file;sha256=$taskImage.sha256}) }
    Test-TaskGuards $taskGuards
    $taskPlan = [pscustomobject]@{
        root=$taskRoot; preparedOn='2026-10-19'; authorization='Explicit user request to remove unnecessary builds/screenshots/generated clutter; preserve required source, current build and screenshots.'
        latestApk=$taskLatestRelative; latestApkSha256=$taskLatestHash; preserveHashes=@($taskGuards)
        protectedScopes=@('Source/config/docs/Git','Signing keys/credentials','User/server data and production backups','All emulator/AVD state','Installed SDK/JDK/CLI/runtime/dependencies','Final demo and report PDFs')
        targets=@($taskCandidates); targetCount=$taskCandidates.Count
        files=($taskCandidates | Measure-Object -Property files -Sum).Sum
        bytes=($taskCandidates | Measure-Object -Property bytes -Sum).Sum
    }
    $taskPlan | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $taskPlanPath -Encoding UTF8
    [pscustomobject]@{mode='DRY RUN';targets=$taskPlan.targetCount;files=$taskPlan.files;GiB=[math]::Round($taskPlan.bytes/1GB,3);guards=$taskGuards.Count;plan=$taskPlanPath} | ConvertTo-Json -Compress
    exit
}

if (!(Test-Path -LiteralPath $taskPlanPath)) { throw 'Create and inspect the dry-run plan first.' }
if (Test-Path -LiteralPath $taskResultPath) { throw 'Cleanup already has a result receipt. Do not repeat it silently.' }
$taskPlan = Get-Content -LiteralPath $taskPlanPath -Raw | ConvertFrom-Json
if ($taskPlan.root -ne $taskRoot) { throw 'Plan root mismatch.' }
Test-TaskGuards $taskPlan.preserveHashes
$taskRemoved = [Collections.Generic.List[object]]::new()
$taskFailed = [Collections.Generic.List[object]]::new()
$taskFreeBefore = [IO.DriveInfo]::new('E:\').AvailableFreeSpace
foreach ($taskTarget in $taskPlan.targets) {
    try {
        $taskPath = Assert-TaskPath (Join-Path $taskRoot $taskTarget.path)
        if ($taskTarget.kind -eq 'directory') {
            $taskLinks = @(Get-ChildItem -LiteralPath $taskPath -Recurse -Force | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint })
            if ($taskLinks.Count) { throw 'Linked child found; target preserved.' }
            Remove-Item -LiteralPath $taskPath -Recurse -Force
        } else {
            $taskItem = Get-Item -LiteralPath $taskPath -Force
            if ($taskItem.Length -ne $taskTarget.bytes -or ($taskTarget.modifiedUtc -and $taskItem.LastWriteTimeUtc.ToString('o') -ne $taskTarget.modifiedUtc)) { throw 'File changed after planning; preserved.' }
            Remove-Item -LiteralPath $taskPath -Force
        }
        if (Test-Path -LiteralPath $taskPath) { throw 'Target still exists.' }
        $taskRemoved.Add($taskTarget)
    } catch {
        $taskFailed.Add([pscustomobject]@{path=$taskTarget.path;error=$_.Exception.Message})
    }
}
Test-TaskGuards $taskPlan.preserveHashes
$taskResult = [pscustomobject]@{
    completedOn='2026-10-19'; root=$taskRoot; guardsPassed=$true; guards=$taskPlan.preserveHashes.Count
    latestApkSha256=(Get-TaskHash $taskLatestRelative); removed=@($taskRemoved); failed=@($taskFailed)
    removedFiles=($taskRemoved | Measure-Object -Property files -Sum).Sum
    removedLogicalBytes=($taskRemoved | Measure-Object -Property bytes -Sum).Sum
    observedDriveFreeIncrease=[IO.DriveInfo]::new('E:\').AvailableFreeSpace-$taskFreeBefore
    noPhoneCloudGitHistoryOrDataActions=$true
}
$taskResult | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $taskResultPath -Encoding UTF8
[pscustomobject]@{removedTargets=$taskRemoved.Count;removedFiles=$taskResult.removedFiles;GiB=[math]::Round($taskResult.removedLogicalBytes/1GB,3);failedTargets=$taskFailed.Count;guardsPassed=$true;result=$taskResultPath} | ConvertTo-Json -Compress
