param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path.TrimEnd('\')
if ($taskRoot -ne 'E:\Campaign' -or (Resolve-Path -LiteralPath '.').Path -ne $taskRoot) { throw 'Run only from E:\Campaign.' }
$taskPrefix = $taskRoot + '\'
$taskAudit = Join-Path $taskRoot 'artifacts\emulator-cleanup-20261019'
$taskPlanFile = Join-Path $taskAudit 'PLAN.json'
$taskResultFile = Join-Path $taskAudit 'RESULT.json'
$taskAvdRoots = @(
    'tmp/android-build/avd',
    'tmp/trust-release-20261017/avd',
    'tmp/trust-release-20261017/fresh-release/avd',
    'tmp/four-area-polish-20261017/avd',
    'tmp/walkthrough-20261017/avd',
    'tmp/final-completion-20261017/fresh-release/avd',
    'tmp/final-completion-20261017/activity-lifecycle-fix/fresh-release/avd',
    'tmp/final-completion-20261017/fontscale-fix/fresh-release/avd'
)

function Assert-TaskDirectory([string]$Relative) {
    if ($Relative -notin $taskAvdRoots -and $Relative -notmatch '^tmp/android-build/metro-[a-z0-9-]+$') { throw "Target is not an approved Campaign AVD/build cache: $Relative" }
    $taskPath = [IO.Path]::GetFullPath((Join-Path $taskRoot $Relative))
    if (!$taskPath.StartsWith($taskPrefix,[StringComparison]::OrdinalIgnoreCase)) { throw 'Target escaped workspace.' }
    $taskCursor = Get-Item -LiteralPath $taskPath -Force
    if (!$taskCursor.PSIsContainer) { throw 'Directory target required.' }
    while ($null -ne $taskCursor -and $taskCursor.FullName -ne $taskRoot) {
        if ($taskCursor.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Reparse-point target/ancestor blocked.' }
        $taskCursor = $taskCursor.Parent
    }
    $taskChildren = @(Get-ChildItem -LiteralPath $taskPath -Recurse -Force)
    if (@($taskChildren | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count) { throw 'Linked child blocked.' }
    return $taskPath
}

function Test-TaskGuards($Guards) {
    foreach ($taskGuard in $Guards) {
        $taskHash = (Get-FileHash -LiteralPath (Join-Path $taskRoot $taskGuard.path) -Algorithm SHA256).Hash
        if ($taskHash -ne $taskGuard.sha256) { throw "Preserved build/source/signing file changed: $($taskGuard.path)" }
    }
}

if (!(Test-Path -LiteralPath $taskAudit)) { New-Item -ItemType Directory -Path $taskAudit | Out-Null }
if (!$Apply) {
    if (Test-Path -LiteralPath $taskPlanFile) { throw 'Do not overwrite this cleanup plan.' }
    $taskRelativeTargets = [Collections.Generic.List[string]]::new()
    foreach ($taskRelative in $taskAvdRoots) {
        if (Test-Path -LiteralPath (Join-Path $taskRoot $taskRelative)) { $taskRelativeTargets.Add($taskRelative) }
    }
    foreach ($taskCache in @(Get-ChildItem -LiteralPath (Join-Path $taskRoot 'tmp\android-build') -Directory -Filter 'metro-*')) {
        $taskRelativeTargets.Add($taskCache.FullName.Substring($taskPrefix.Length).Replace('\','/'))
    }
    $taskTargets = [Collections.Generic.List[object]]::new()
    foreach ($taskRelative in $taskRelativeTargets) {
        $taskPath = Assert-TaskDirectory $taskRelative
        $taskFiles = @(Get-ChildItem -LiteralPath $taskPath -Recurse -File -Force)
        if ($taskRelative -in $taskAvdRoots) {
            foreach ($taskEntry in @(Get-ChildItem -LiteralPath $taskPath -Force)) {
                if ($taskEntry.Name -notmatch '^Campaign_[A-Za-z0-9_]+\.(avd|ini)$') { throw "Unexpected non-Campaign AVD entry: $($taskEntry.Name)" }
            }
            # Tiny configuration copies let a future test setup recover device options.
            # Virtual disks, snapshots, emulator sessions and ADB keys are not copied.
            $taskConfigDir = Join-Path $taskAudit 'device-configurations'
            if (!(Test-Path -LiteralPath $taskConfigDir)) { New-Item -ItemType Directory -Path $taskConfigDir | Out-Null }
            foreach ($taskConfig in @($taskFiles | Where-Object { $_.Name -eq 'config.ini' -or ($_.DirectoryName -eq $taskPath -and $_.Extension -eq '.ini') })) {
                $taskCopyName = $taskConfig.FullName.Substring($taskPrefix.Length).Replace('\','__')
                Copy-Item -LiteralPath $taskConfig.FullName -Destination (Join-Path $taskConfigDir $taskCopyName)
            }
        }
        $taskTargets.Add([pscustomobject]@{path=$taskRelative;files=$taskFiles.Count;bytes=[long](($taskFiles | Measure-Object Length -Sum).Sum);kind=if($taskRelative -in $taskAvdRoots){'Campaign virtual-device environment'}else{'Reproducible isolated Metro build cache'}})
    }
    $taskPrevious = Get-Content -LiteralPath (Join-Path $taskRoot 'artifacts\cleanup-20261019\PLAN.json') -Raw | ConvertFrom-Json
    $taskGuards = [Collections.Generic.List[object]]::new()
    foreach ($taskGuard in $taskPrevious.preserveHashes) { $taskGuards.Add($taskGuard) }
    foreach ($taskRelative in @(
        'tools/android-sdk/jdk17/bin/java.exe','tools/android-sdk/jdk17/bin/javac.exe',
        'tools/android-sdk/platforms/android-36/android.jar',
        'tools/android-sdk/build-tools/36.0.0/aapt2.exe','tools/android-sdk/build-tools/36.0.0/lib/apksigner.jar',
        'tools/android-sdk/ndk/27.1.12297006/source.properties','tools/android-sdk/cmake/3.22.1/source.properties',
        'tmp/android-build/gradle-dist/gradle-9.0.0/bin/gradle.bat',
        'apps/mobile/android/gradlew.bat','apps/mobile/android/gradle/wrapper/gradle-wrapper.jar',
        'apps/mobile/package-lock.json','package-lock.json','scripts/android-local.ps1','scripts/android-release-signing.ps1'
    )) {
        $taskFile = Join-Path $taskRoot $taskRelative
        if (!(Test-Path -LiteralPath $taskFile)) { throw "Required future-build input missing: $taskRelative" }
        $taskGuards.Add([pscustomobject]@{path=$taskRelative;sha256=(Get-FileHash -LiteralPath $taskFile -Algorithm SHA256).Hash})
    }
    foreach ($taskKeyFile in @(Get-ChildItem -LiteralPath (Join-Path $taskRoot 'tmp\android-signing') -Recurse -File -Force)) {
        $taskRelative = $taskKeyFile.FullName.Substring($taskPrefix.Length).Replace('\','/')
        $taskGuards.Add([pscustomobject]@{path=$taskRelative;sha256=(Get-FileHash -LiteralPath $taskKeyFile.FullName -Algorithm SHA256).Hash})
    }
    Test-TaskGuards $taskGuards
    $taskPlan = [pscustomobject]@{root=$taskRoot;preparedOn='2026-10-19';authorization='User requested remaining emulator cleanup after explanation of saved emulator-state removal; preserve ability to compile another build.';targets=@($taskTargets);preserveHashes=@($taskGuards);files=($taskTargets|Measure-Object files -Sum).Sum;bytes=($taskTargets|Measure-Object bytes -Sum).Sum;shutdown='Only verified Campaign_Release_36 / emulator-5574 gracefully shut down on existing dedicated ADB5039; phone/default ADB/other devices untouched.'}
    $taskPlan | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $taskPlanFile -Encoding UTF8
    [pscustomobject]@{mode='DRY RUN';environments=@($taskTargets|Where-Object kind -eq 'Campaign virtual-device environment').Count;cacheDirectories=@($taskTargets|Where-Object kind -eq 'Reproducible isolated Metro build cache').Count;files=$taskPlan.files;logicalGiB=[math]::Round($taskPlan.bytes/1GB,3);preservedHashes=$taskGuards.Count} | ConvertTo-Json -Compress
    exit
}
if (!(Test-Path -LiteralPath $taskPlanFile) -or (Test-Path -LiteralPath $taskResultFile)) { throw 'Missing plan or cleanup already completed.' }
$taskPlan = Get-Content -LiteralPath $taskPlanFile -Raw | ConvertFrom-Json
if ($taskPlan.root -ne $taskRoot) { throw 'Plan root mismatch.' }
Test-TaskGuards $taskPlan.preserveHashes
$taskOwnedProcesses = @(Get-CimInstance Win32_Process -Filter "Name = 'emulator.exe' OR Name = 'qemu-system-x86_64.exe' OR Name = 'qemu-system-aarch64.exe'" | Where-Object {$_.ExecutablePath -like 'E:\Campaign\*' -or $_.CommandLine -like '*E:\Campaign*'})
if ($taskOwnedProcesses.Count) { throw 'A Campaign emulator is still running; no deletion performed.' }
$taskRemoved = [Collections.Generic.List[object]]::new()
$taskFailed = [Collections.Generic.List[object]]::new()
$taskFreeBefore = [IO.DriveInfo]::new('E:\').AvailableFreeSpace
foreach ($taskTarget in $taskPlan.targets) {
    try {
        $taskPath = Assert-TaskDirectory $taskTarget.path
        Remove-Item -LiteralPath $taskPath -Recurse -Force
        if (Test-Path -LiteralPath $taskPath) { throw 'Target still exists.' }
        $taskRemoved.Add($taskTarget)
    } catch { $taskFailed.Add([pscustomobject]@{path=$taskTarget.path;error=$_.Exception.Message}) }
}
Test-TaskGuards $taskPlan.preserveHashes
$taskResult = [pscustomobject]@{completedOn='2026-10-19';root=$taskRoot;removed=@($taskRemoved);failed=@($taskFailed);removedFiles=($taskRemoved|Measure-Object files -Sum).Sum;removedLogicalBytes=($taskRemoved|Measure-Object bytes -Sum).Sum;observedDriveFreeIncrease=[IO.DriveInfo]::new('E:\').AvailableFreeSpace-$taskFreeBefore;preservedHashes=$taskPlan.preserveHashes.Count;guardsPassed=$true;actualRebuildPerformed=$false;phoneCloudGitAndBackupsUntouched=$true}
$taskResult | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $taskResultFile -Encoding UTF8
[pscustomobject]@{removedDirectories=$taskRemoved.Count;removedFiles=$taskResult.removedFiles;logicalGiB=[math]::Round($taskResult.removedLogicalBytes/1GB,3);observedFreeGiB=[math]::Round($taskResult.observedDriveFreeIncrease/1GB,3);failed=$taskFailed.Count;preservationChecksPassed=$true;actualRebuildPerformed=$false} | ConvertTo-Json -Compress
