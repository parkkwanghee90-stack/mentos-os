/**
 * 멘토스 AI 비전 엔진: 페이지 단위 PNG -> 문제 단위 Crop 보조 스크립트 뼈대
 */

const fs = require('fs');
const path = require('path');

const PNG_DIR = path.join(__dirname, '../src/data/math_local_db/pngs');
const CROP_DIR = path.join(__dirname, '../src/data/math_local_db/cropped');

[PNG_DIR, CROP_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function runCropQuestions() {
    console.log(`[LOG] 문제 단위 자동 Crop 파이프라인 시작`);
    
    // TODO: OpenCV(opencv4nodejs) 또는 Sharp 라이브러리 연동
    // - 렌더링된 전체 PNG 페이지를 로드
    // - 문항 번호(예: "1.", "2번" 등) 객체 인식 혹은 여백 기반 레이아웃 분할
    // - 각 문제 블록 좌표 추출 후 별도 이미지 저장
    // - videoPosts의 parsedNumber 와 문제 이미지를 최종 매핑
    
    console.log(`[LOG] (준비중) 페이지 이미지를 분석하여 문항별로 개별 분할 이미지를 생성할 예정입니다.`);
    console.log(`[LOG] 입출력 경로 구성 완료: ${PNG_DIR} -> ${CROP_DIR}`);
}

if (require.main === module) {
    runCropQuestions().catch(console.error);
}

module.exports = { runCropQuestions };
