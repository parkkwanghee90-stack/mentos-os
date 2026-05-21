param (
    [string]$InputDir = "\\Subitmainpc\수학의 빛 사무폴더\11.집중학습",
    [string]$OutputDir = "c:\mentos_os_clean\public\output_pdf",
    [switch]$DryRun,
    [switch]$SkipExisting
)

$reportPath = "c:\mentos_os_clean\scratch\summary_report.json"

Write-Host "Scanning directory: $InputDir"

# Search for hwp and hwpx
$files = Get-ChildItem -Path $InputDir -Include "*.hwp", "*.hwpx" -Recurse -File -ErrorAction SilentlyContinue

$excludePattern = "수학상|수학\(상\)|수학_상|상"

$targets = @()
$excluded = @()
$skipped_existing = 0

foreach ($f in $files) {
    if ($f.FullName -match $excludePattern) {
        $excluded += $f.FullName
        continue
    }
    
    $relPath = $f.FullName.Substring($InputDir.Length).TrimStart("\")
    $targetPdfPath = Join-Path $OutputDir ([System.IO.Path]::ChangeExtension($relPath, ".pdf"))
    
    if ($SkipExisting -and (Test-Path $targetPdfPath)) {
        $skipped_existing++
        continue
    }

    $targets += @{
        Source = $f.FullName
        Target = $targetPdfPath
    }
}

Write-Host "======================================"
Write-Host " DRY-RUN SCAN RESULTS"
Write-Host "======================================"
Write-Host "총 HWP/HWPX 파일 수: $($files.Count)"
Write-Host "제외된 '상' 관련 파일 수: $($excluded.Count)"
Write-Host "이미 존재하는 PDF 스킵 수: $skipped_existing"
Write-Host "변환 대기 중인 실제 타겟 수: $($targets.Count)"

Write-Host "`n[최초 5개 타겟 샘플]"
for ($i=0; $i -lt [math]::Min(5, $targets.Count); $i++) {
    Write-Host " - $($targets[$i].Source) -> $($targets[$i].Target)"
}

Write-Host "`n[최초 5개 제외 샘플]"
for ($i=0; $i -lt [math]::Min(5, $excluded.Count); $i++) {
    Write-Host " - $($excluded[$i])"
}

$summary = @{
    total_files = $files.Count
    converted_count = 0
    skipped_existing = $skipped_existing
    skipped_math_high = $excluded.Count
    failed_files = @()
    target_files_count = $targets.Count
}

$summary | ConvertTo-Json | Out-File $reportPath -Encoding utf8

if (-not $DryRun) {
    Write-Host "`n[실행 모드] - COM 객체 연결 불필요 (현재는 dryrun만 수행하도록 스크립트 작성됨)"
}
