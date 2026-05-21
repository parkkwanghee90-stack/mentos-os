const fs = require('fs');
const path = require('path');

const META_PATH = "C:\\mentos_os_clean\\public\\concept_cards\\global_metadata.json";
const CARDS_DIR = "C:\\mentos_os_clean\\public\\concept_cards";

// File invalid chars
function sanitizeTitle(title) {
    // 1. Remove unicode invalid private use chars like 
    let s = title.replace(/[\uE000-\uF8FF]/g, '');
    // 2. Remove Windows invalid file chars
    s = s.replace(/[\\/:*?"<>|]/g, '');
    // 3. Remove leading numbers if accidentally left (01, 10 등) and dot / spaces
    s = s.replace(/^[0-9]+[-\s.]*/, '');
    // 4. Clean extra spaces
    s = s.replace(/\s+/g, ' ').trim();
    // 5. Truncate to 40 chars
    if (s.length > 40) {
        s = s.substring(0, 40) + "...";
    }
    return s || "Untitled_Concept";
}

function runDryRun() {
    if (!fs.existsSync(META_PATH)) {
        console.error("global_metadata.json 없어서 작업을 중지합니다.");
        return;
    }

    const data = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
    let renameMap = [];
    let failedList = [];
    let nameCounts = {};
    let summary = { total: data.length, success: 0, failed: 0, low_confidence_ocr: [] };

    for (let item of data) {
        let originalTitle = item.card_title || "";
        
        let cleaned = sanitizeTitle(originalTitle);

        if (!cleaned || cleaned === "Untitled_Concept") {
            failedList.push({
                id: item.id,
                reason: "제목 파싱 실패 또는 제목이 비어있음",
                raw_title: originalTitle
            });
            summary.failed++;
            continue;
        }

        // Check suffix
        let finalName = cleaned;
        if (nameCounts[cleaned]) {
            nameCounts[cleaned]++;
            finalName = `${cleaned}_${nameCounts[cleaned]}`;
        } else {
            nameCounts[cleaned] = 1;
        }

        const newFileName = finalName + ".png";
        
        // Find old relative path based on the folder logic
        // Original files are in C:\mentos_os_clean\public\concept_cards\{source_file}\{file_png}
        const oldFileRel = path.join(item.source_file, item.file_png).replace(/\\/g, '/');
        const newFileRel = path.join(item.source_file, newFileName).replace(/\\/g, '/');

        renameMap.push({
            id: item.id,
            old_path: oldFileRel,
            new_path: newFileRel,
            new_title: finalName,
            old_title: originalTitle
        });
        
        // Fake OCR confidence check based on unknown chars length
        let suspicious = originalTitle.match(/[\uE000-\uF8FF]/g);
        if (suspicious && suspicious.length > 2) {
            summary.low_confidence_ocr.push({
                id: item.id,
                raw_title: originalTitle,
                reason: "의심스러운 한글/수식 특수문자 다수 발견"
            });
        }
        
        summary.success++;
    }

    fs.writeFileSync(path.join(CARDS_DIR, 'rename_map.json'), JSON.stringify(renameMap, null, 2));
    fs.writeFileSync(path.join(CARDS_DIR, 'failed_list.json'), JSON.stringify(failedList, null, 2));
    fs.writeFileSync(path.join(CARDS_DIR, 'rename_summary.json'), JSON.stringify(summary, null, 2));

    console.log("Dry-run 통계 정보:");
    console.log(`- 전체 진행: ${summary.total}개`);
    console.log(`- 변환 가능: ${summary.success}개`);
    console.log(`- 제목 실패: ${summary.failed}개`);
    console.log(`- 품질 의심(Manual 확인 권장): ${summary.low_confidence_ocr.length}개`);
    console.log("\n[미리보기: 처리된 새 파일명 샘플 Top 5]");
    for (let i=0; i<Math.min(5, renameMap.length); i++) {
        console.log(`  OLD: ${renameMap[i].old_path}`);
        console.log(`  NEW: ${renameMap[i].new_path}\n`);
    }
}

runDryRun();
