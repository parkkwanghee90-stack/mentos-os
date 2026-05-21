$srcBase = "c:\mentos_os_clean\DIAMOND_BOX_G1_2026_05_09\math_hints"
$destBase = "c:\mentos_os_clean\public\math_hints"

if (-not (Test-Path $srcBase)) {
    Write-Error "Source May 9th backup not found: $srcBase"
    exit
}

$keywords = @(
    "고차방정식",
    "부등식",
    "점과좌표",
    "직선의방정식",
    "직선의 방정식",
    "원의방정식",
    "원의 방정식",
    "도형의이동",
    "도형의 이동",
    "행렬",
    "경우의수",
    "경우의 수",
    "고등수학(상)"
)

$excludeKeywords = @(
    "순열",
    "조합"
)

$folders = Get-ChildItem -Path $srcBase -Directory

foreach ($folder in $folders) {
    $matched = $false
    foreach ($kw in $keywords) {
        if ($folder.Name -like "*$kw*") {
            $matched = $true
            break
        }
    }
    
    # Check exclusion
    if ($matched) {
        foreach ($ex in $excludeKeywords) {
            if ($folder.Name -like "*$ex*") {
                $matched = $false
                Write-Host "Excluding: $($folder.Name)"
                break
            }
        }
    }

    if ($matched) {
        $srcPath = Join-Path $srcBase $folder.Name
        $destPath = Join-Path $destBase $folder.Name
        Write-Host "Restoring from May 9th: $($folder.Name)"
        
        if (-not (Test-Path $destPath)) {
            New-Item -ItemType Directory -Path $destPath -Force | Out-Null
        }
        
        try {
            Copy-Item -Path "$srcPath\*" -Destination $destPath -Recurse -Force -ErrorAction Stop
        } catch {
            Write-Warning "Failed to copy $($folder.Name): $($_.Exception.Message)"
        }
    }
}

Write-Host "Restoration from May 9th backup completed (Permutation/Combination excluded)."
