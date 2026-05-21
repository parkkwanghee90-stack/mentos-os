const fs = require('fs');
const path = require('path');

const BASE_CROP_DIR = "c:\\mentos_os_clean\\public\\math_crops\\매쓰플랫_ultimate";
const REPORT_PATH = "c:\\mentos_os_clean\\artifacts\\math_audit_report.md";

function runAudit() {
    console.log("Auditing Extracted Math Problems...");
    
    if (!fs.existsSync(BASE_CROP_DIR)) return console.log("NO BASE DIRECTORY");
    
    const folders = fs.readdirSync(BASE_CROP_DIR, {withFileTypes: true}).filter(d => d.isDirectory());
    
    let totalPDFs = 0;
    let perfectMatches = 0;
    let mismatches = 0;
    let failedPDFs = [];
    
    let reportMd = `# 📊 Mentos OS Math Pipeline Audit Report\n\n`;
    reportMd += `> 이 리포트는 Phase 1 엔진의 매칭 무결성을 검증하고, 누락된 문항에 대한 상세한 추적 로그를 제공합니다.\n\n`;

    reportMd += `## ⚠️ Mismatch Logs (Failed or Incomplete Matches)\n\n`;

    for (const d of folders) {
        const metaPath = path.join(BASE_CROP_DIR, d.name, 'metadata.json');
        if (!fs.existsSync(metaPath)) continue;
        
        totalPDFs++;
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        const baseName = meta.baseName;
        const items = meta.items || [];
        
        // Extract expected count from "(XX)" pattern at the end of the unit title
        const expectedMatch = baseName.match(/\((\d+)\)(?:\s*p\d+)?\s*1\+1/);
        let expectedCount = -1;
        if (expectedMatch) expectedCount = parseInt(expectedMatch[1], 10);
        else continue; // Cannot verify strict count for mock tests or irregulars
        
        const extractedCount = items.length;
        
        if (extractedCount === expectedCount) {
            perfectMatches++;
        } else {
            mismatches++;
            const extractedNums = items.map(it => it.num);
            const missingNums = [];
            for (let i = 1; i <= expectedCount; i++) {
                if (!extractedNums.includes(i)) missingNums.push(i);
            }
            
            failedPDFs.push({
                unit: baseName,
                expected: expectedCount,
                extracted: extractedCount,
                missing: missingNums
            });
            
            reportMd += `### ❌ Unit: **${baseName}**\n`;
            reportMd += `- **목표 문항 수**: ${expectedCount}개\n`;
            reportMd += `- **실제 추출 수**: ${extractedCount}개\n`;
            reportMd += `- **누락/실패 문항 번호**: ${missingNums.map(n => `Q${String(n).padStart(3, '0')}`).join(', ')}\n\n`;
        }
    }
    
    reportMd = reportMd.replace('## ⚠️ Mismatch Logs (Failed or Incomplete Matches)\n\n', 
        `## 📈 요약 통계\n- **총 검수 대상 단원(PDF)**: ${totalPDFs}\n- **완벽 추출 성공(100%)**: ${perfectMatches}\n- **누락 발생 단원**: ${mismatches}\n\n## ⚠️ Mismatch Logs (Failed or Incomplete Matches)\n\n`);

    if (mismatches === 0) {
        reportMd += `**모든 단원이 100% 완벽하게 매칭 및 추출되었습니다! 누락된 데이터가 없습니다.**\n`;
    }
    
    // Ensure artifacts directory exists
    const artifactsDir = path.dirname(REPORT_PATH);
    if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, {recursive: true});

    fs.writeFileSync(REPORT_PATH, reportMd);
    console.log(`Audit Complete. Found ${mismatches} mismatches out of ${totalPDFs} testable PDFs. Result written to ${REPORT_PATH}`);
}

runAudit();
