const fs = require('fs');
const path = require('path');

const META_PATH = "C:\\mentos_os_clean\\public\\concept_cards\\global_metadata.json";

// Order matters: match longer specific terms before generic ones (e.g. 유리함수 before 함수)
const UNIT_KEYWORDS = [
    "직선의방정식", "원의방정식", "일차부등식", "이차부등식", 
    "도형의이동", "순열과조합", "유리함수", "무리함수", 
    "점과좌표", "집합", "명제", "함수"
];

function main() {
    if (!fs.existsSync(META_PATH)) {
        console.log("global_metadata.json 아직 생성되지 않음.");
        return;
    }

    const data = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));

    let count = 0;
    for (let item of data) {
        let fullStr = (item.section_title || "") + " " + (item.card_title || "") + " " + (item.source_file || "");
        
        let linkedFolder = null;
        for (let kw of UNIT_KEYWORDS) {
            if (fullStr.includes(kw)) {
                linkedFolder = kw;
                break;
            }
        }
        
        if (linkedFolder) {
            item.linked_problem_folders = [
                `${linkedFolder}/2`,
                `${linkedFolder}/3`,
                `${linkedFolder}/4`
            ];
            count++;
        } else {
            item.linked_problem_folders = [];
        }
    }

    fs.writeFileSync(META_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log(`[완료] 총 ${data.length}개 개념 중 ${count}개의 카드에 문제 폴더 (최대 3개) 연결 구조(SSOT)가 매핑 및 덮어쓰기 완료되었습니다.`);
}

main();
