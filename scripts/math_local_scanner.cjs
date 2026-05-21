const fs = require('fs');
const path = require('path');

const ROOT = "\\\\Subitmainpc\\수학의 빛 사무폴더";

const TARGET_FOLDERS = [
  "09.새 교과과정 자료"
];

let totalPdfCount = 0;
let totalHwpCount = 0;

function scanDirRecurse(currentPath) {
    let pdfCount = 0;
    let hwpCount = 0;

    const files = fs.readdirSync(currentPath);
    for (const file of files) {
        if (file.toLowerCase().endsWith('.lnk')) continue; // 바로가기 무시

        const fullPath = path.join(currentPath, file);
        let stat;
        try {
            stat = fs.statSync(fullPath);
        } catch(e) {
            continue; // 접근불가 폴더/파일 패스
        }

        if (stat.isDirectory()) {
            const counts = scanDirRecurse(fullPath);
            pdfCount += counts.pdf;
            hwpCount += counts.hwp;
        } else if (stat.isFile()) {
            const lowerFile = file.toLowerCase();
            if (lowerFile.endsWith('.pdf')) {
                // 너무 로그가 많으면 부담일 수 있으나 일단 출력
                console.log(`[FILE_FOUND] ${path.join(path.basename(currentPath), file)}`);
                pdfCount++;
            } else if (lowerFile.endsWith('.hwp')) {
                console.log(`[FILE_FOUND] ${path.join(path.basename(currentPath), file)}`);
                hwpCount++;
            }
        }
    }
    return { pdf: pdfCount, hwp: hwpCount };
}

function run() {
    console.log(`[LOG] 로컬 DB 타겟 스캔을 시작합니다.`);
    console.log(`[LOG] 루트 경로: ${ROOT}`);
    
    if (!fs.existsSync(ROOT)) {
         console.log(`[ROOT_ACCESS_FAIL] 네트워크 경로 접근 실패: ${ROOT}`);
         return;
    }

    let overallPdf = 0;
    let overallHwp = 0;
    
    for (const folder of TARGET_FOLDERS) {
        let actualFolderName = folder;

        const allDirs = fs.readdirSync(ROOT, { withFileTypes: true });
        const matchedDir = allDirs.find(d => d.isDirectory() && d.name.includes(folder.substring(0, 2))); 
        
        if (matchedDir) {
             actualFolderName = matchedDir.name;
        }

        const fullPath = path.join(ROOT, actualFolderName);

        if (!fs.existsSync(fullPath)) {
            console.log(`[FOLDER_MISSING] ${fullPath}`);
            continue;
        }

        console.log(`\n[ENTER_FOLDER] (Recursion 활성화) ${fullPath}`);

        const counts = scanDirRecurse(fullPath);
        
        if (counts.pdf === 0 && counts.hwp === 0) {
            console.log(`[EMPTY_FOLDER] 깊은 탐색 후에도 발견 안됨`);
        } else {
            console.log(`[PDF_COUNT] ${counts.pdf}`);
            console.log(`[HWP_COUNT] ${counts.hwp}`);
        }
        
        overallPdf += counts.pdf;
        overallHwp += counts.hwp;
    }

    console.log(`\n================================`);
    console.log(`[TOTAL_COUNT] 깊은 탐색 결과 -> PDF: ${overallPdf}, HWP: ${overallHwp}, 합계: ${overallPdf + overallHwp}`);
}

run();
