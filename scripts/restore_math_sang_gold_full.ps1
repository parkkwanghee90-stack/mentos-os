$srcBase = "c:\mentos_os_clean\GOLD_BOX_G1_2026_05_08_1844\public\math_hints"
$destBase = "c:\mentos_os_clean\public\math_hints"

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
    "순열",
    "조합",
    "고등수학(상)"
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

    if ($matched) {
        $srcPath = Join-Path $srcBase $folder.Name
        $destPath = Join-Path $destBase $folder.Name
        Write-Host "Restoring: $($folder.Name)"
        
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

Write-Host "Full Math Sang restoration completed using PowerShell."
