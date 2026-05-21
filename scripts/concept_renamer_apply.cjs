const fs = require('fs');
const path = require('path');

const CARDS_DIR = "C:\\mentos_os_clean\\public\\concept_cards";
const META_PATH = path.join(CARDS_DIR, "global_metadata.json");
const RENAME_MAP_PATH = path.join(CARDS_DIR, "rename_map.json");

function runActualRename() {
    if (!fs.existsSync(RENAME_MAP_PATH) || !fs.existsSync(META_PATH)) {
        console.error("필수 파일(rename_map.json 또는 global_metadata.json)이 없습니다.");
        return;
    }

    const renameMap = JSON.parse(fs.readFileSync(RENAME_MAP_PATH, 'utf8'));
    const metadata = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));

    let renameSuccessCount = 0;
    let renameFailedCount = 0;
    let rollbacks = [];

    // Map by ID for quick lookup
    let metaById = {};
    for (let meta of metadata) {
        metaById[meta.id] = meta;
    }

    for (let mapping of renameMap) {
        const oldFileFull = path.join(CARDS_DIR, mapping.old_path);
        const newFileFull = path.join(CARDS_DIR, mapping.new_path);

        try {
            if (fs.existsSync(oldFileFull)) {
                // Perform physical rename
                fs.renameSync(oldFileFull, newFileFull);
                rollbacks.push({ from: newFileFull, to: oldFileFull });
                
                // Update Metadata
                if (metaById[mapping.id]) {
                    metaById[mapping.id].card_title = mapping.new_title;
                    // The old metadata had "file_png", but user asked for "image_path" to be matching. 
                    // I will update file_png and also add image_path.
                    metaById[mapping.id].file_png = path.basename(mapping.new_path);
                    metaById[mapping.id].image_path = mapping.new_path.replace(/\\/g, '/');
                }

                renameSuccessCount++;
            } else {
                console.log(`[경고] 원본 파일이 없습니다: ${oldFileFull}`);
                renameFailedCount++;
            }
        } catch (e) {
            console.log(`[에러] 이름 변경 실패: ${oldFileFull} -> ${newFileFull}\n사유: ${e.message}`);
            renameFailedCount++;
        }
    }

    // Save metadata
    fs.writeFileSync(META_PATH, JSON.stringify(metadata, null, 2), 'utf8');

    console.log("====================================");
    console.log(`✅ 실제 리네임 완료: ${renameSuccessCount} 장 변환됨.`);
    console.log(`❌ 실패/누락: ${renameFailedCount} 장.`);
    console.log("====================================");
}

runActualRename();
