const fs = require('fs');
const path = require('path');

const SRC_DIR = "c:\\mentos_os_clean\\public\\math_crops\\매쓰플랫_ultimate";
const DEST_DIR = "c:\\mentos_os_clean\\public\\math_indexed";

if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

const folders = fs.readdirSync(SRC_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

console.log("=========================================");
console.log("1. 폴더명 파싱 규칙 요약");
console.log("=========================================");
console.log("- 단원(Unit) 추출:");
console.log("  1우선순위: `(숫자)텍스트` 패턴 (예: `(1)집합` -> `집합`, `(4)유리함수` -> `유리함수`)");
console.log("  2우선순위: `1+1` 이나 `단계` 키워드를 제외한 순수 제목 (예: `고등수학(상)기말`)");
console.log("- 난이도(Level) 추출:");
console.log("  `1단계` -> 1");
console.log("  `개념2단계` -> concept");
console.log("  `2단계` -> 2");
console.log("  `3단계` -> 3");
console.log("  `4단계` -> 4");
console.log("  (위 키워드가 없으면 파싱 실패(failed)로 분류)");
console.log("- 쌍둥이 여부(Twin): 폴더명에 `쌍둥이` 포함 여부 (boolean)");
console.log("\n");

function parseFolder(name) {
    let level = 'failed';
    if (name.includes('1단계')) level = '1';
    else if (name.includes('개념2단계')) level = 'concept';
    else if (name.includes('2단계')) level = '2';
    else if (name.includes('3단계')) level = '3';
    else if (name.includes('4단계')) level = '4';

    let twin = name.includes('쌍둥이');
    
    let unit = 'unknown';
    let unitMatch = name.match(/\(\d+\)([가-힣]+(?:의[가-힣]+)?|[가-힣]+)/);
    if (unitMatch) {
        unit = unitMatch[1];
    } else {
        let fallback = name.replace(/1\+1.*$/, '').replace(/p\d+.*$/, '').replace(/\(\d+\)$/, '').trim();
        fallback = fallback.replace(/\d단계\s*/, '').trim();
        if (fallback) unit = fallback;
    }
    
    // Fallback refine spaces
    unit = unit.replace(/\s+/g, '_');

    let pageMatch = name.match(/p(\d+)/);
    let page_info = pageMatch ? pageMatch[1] : 'unknown';

    return { level, twin, unit, page_info };
}

console.log("=========================================");
console.log("2. 샘플 5개 Dry-run 예측 결과");
console.log("=========================================");
const sample = folders.slice(0, 5);
sample.forEach(f => {
    console.log(`원본: ${f}`);
    console.log(`파싱:`, parseFolder(f));
    console.log("---");
});
console.log("\n");

let report = {
    total_folders: 0,
    total_pngs: 0,
    level_2_count: 0,
    level_3_count: 0,
    level_4_count: 0,
    twin_count: 0,
    excluded_level_1: [],
    failed_parsing: []
};

// Start the actual copy engine
console.log("=========================================");
console.log("3. 전체 복사 정리 시작...");
console.log("=========================================");

const statsTable = {};

for (const folder of folders) {
    report.total_folders++;
    const parsed = parseFolder(folder);
    
    if (parsed.level === '1') {
        report.excluded_level_1.push(folder);
        continue;
    }
    if (parsed.level === 'failed') {
        report.failed_parsing.push(folder);
        continue;
    }

    const { unit, level, twin, page_info } = parsed;
    
    // Record stats
    if (!statsTable[unit]) statsTable[unit] = {};
    if (!statsTable[unit][level]) statsTable[unit][level] = 0;
    statsTable[unit][level]++;

    const targetDir = path.join(DEST_DIR, unit, level);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // copy files and create meta
    const srcFolderPath = path.join(SRC_DIR, folder);
    const files = fs.readdirSync(srcFolderPath);
    
    // Find metadata.json in source to get items
    let originalMeta = null;
    const metaPath = path.join(srcFolderPath, 'metadata.json');
    if (fs.existsSync(metaPath)) {
        try { originalMeta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch(e){}
    }

    let problem_count_in_folder = originalMeta && originalMeta.items ? originalMeta.items.length : 0;
    
    const existingMetaDestPath = path.join(targetDir, 'metadata.json');
    let destItems = [];
    if (fs.existsSync(existingMetaDestPath)) {
        try { destItems = JSON.parse(fs.readFileSync(existingMetaDestPath, 'utf8')).items || []; } catch(e){}
    }

    if (originalMeta && originalMeta.items) {
        for (let item of originalMeta.items) {
            // copy Q and S PNGs & TXTs
            const numStr = String(item.num).padStart(3, '0');
            const qPng = `q${numStr}.png`;
            const qTxt = `q${numStr}_ocr.txt`;
            const sPng = `s${numStr}.png`;
            const sTxt = `s${numStr}_ocr.txt`;

            const uniquePrefix = `f_${report.total_folders}_`;

            const copyIfExist = (fname) => {
                const sp = path.join(srcFolderPath, fname);
                const dp = path.join(targetDir, uniquePrefix + fname);
                if (fs.existsSync(sp)) {
                    fs.copyFileSync(sp, dp);
                    if (fname.endsWith('.png')) report.total_pngs++;
                    return uniquePrefix + fname;
                }
                return null;
            };

            const copiedQPng = copyIfExist(qPng);
            const copiedQTxt = copyIfExist(qTxt);
            const copiedSPng = copyIfExist(sPng);
            const copiedSTxt = copyIfExist(sTxt);

            if (copiedQPng && copiedSPng) {
                 destItems.push({
                     id: `${unit}_${level}_${Math.random().toString(36).substring(2,9)}`,
                     source_folder: folder,
                     source_q_png: copiedQPng,
                     source_q_ocr_txt: copiedQTxt,
                     source_s_png: copiedSPng,
                     source_s_ocr_txt: copiedSTxt,
                     unit: unit,
                     level: level,
                     twin: twin,
                     page_info: page_info,
                     problem_count_in_folder: problem_count_in_folder,
                     display_name: `${unit} - ${level === 'concept' ? '개념' : level + '단계'} - Q${numStr}`
                 });
                 
                 if (level === '2') report.level_2_count++;
                 if (level === '3') report.level_3_count++;
                 if (level === '4') report.level_4_count++;
                 if (twin) report.twin_count += 2; // q and s
            }
        }
    }
    
    // Save destructured metadata to target level dir
    fs.writeFileSync(existingMetaDestPath, JSON.stringify({ unit, level, last_updated: new Date().toISOString(), items: destItems }, null, 2));
}

console.log("복사 및 구조화 완료!\n");

console.log("=========================================");
console.log("4. 단원별/난이도별 폴더 개수 표 출력");
console.log("=========================================");
for (let u in statsTable) {
    let out = `[${u}] `;
    for (let l in statsTable[u]) {
        out += `${l}(${statsTable[u][l]}개) `;
    }
    console.log(out);
}
console.log("\n");

console.log("=========================================");
console.log("최종 보고 (Final Report)");
console.log("=========================================");
console.log(`1. 총 폴더 수: ${report.total_folders}`);
console.log(`2. 총 PNG 복사본 수: ${report.total_pngs}`);
console.log(`3. 2단계(개념포함) 문제 수: ${report.level_2_count} 쌍`);
console.log(`4. 3단계 문제 수: ${report.level_3_count} 쌍`);
console.log(`5. 4단계 문제 수: ${report.level_4_count} 쌍`);
console.log(`6. 쌍둥이 태그 포함된 파일 수: ${report.twin_count} PNGs`);
console.log(`\n[7. 1단계 제외 목록]`);
report.excluded_level_1.forEach(x => console.log(" - " + x));
console.log(`\n[8. 분류 실패 목록 (미지의 구조)]`);
report.failed_parsing.forEach(x => console.log(" - " + x));

fs.writeFileSync('c:\\mentos_os_clean\\scratch\\indexer_report.json', JSON.stringify(report, null, 2));
