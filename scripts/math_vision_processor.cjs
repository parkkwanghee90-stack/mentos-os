const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// ==============================================================
// [멘토스 OS수학] PDF 교재 4분할 (Quadrant Slicer) Vision 프로세서 
// ==============================================================

const INPUT_DIR = path.join(__dirname, '../src/data/math_vision_raw');
const OUTPUT_DIR = path.join(__dirname, '../src/data/math_vision_db');

// 대상 학년 및 단원 메타데이터 (추후 카페 크롤링 파라미터와 동기화)
const TARGET_GRADE = "고1";
const TARGET_UNIT = "지수함수";

async function makeDirectories() {
    [INPUT_DIR, OUTPUT_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    
    const targetPath = path.join(OUTPUT_DIR, TARGET_GRADE, TARGET_UNIT);
    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
    }
    return targetPath;
}

async function processPageToQuadrants(imagePath, targetFolder, pageNum) {
    if(!fs.existsSync(imagePath)) return;
    
    console.log(`[LOG] 교재 페이지 스캔 시작: ${path.basename(imagePath)}`);
    
    // 원본 이미지(교재 1페이지) 메타데이터 로드
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    const width = metadata.width;
    const height = metadata.height;
    
    const halfWidth = Math.floor(width / 2);
    const halfHeight = Math.floor(height / 2);

    // 4분할 (Top-Left, Top-Right, Bottom-Left, Bottom-Right) 좌표 설정
    const quadrants = [
        { id: 1, left: 0, top: 0, width: halfWidth, height: halfHeight, label: 'Q1' },               // 좌상단
        { id: 2, left: halfWidth, top: 0, width: halfWidth, height: halfHeight, label: 'Q2' },       // 우상단
        { id: 3, left: 0, top: halfHeight, width: halfWidth, height: halfHeight, label: 'Q3' },      // 좌하단
        { id: 4, left: halfWidth, top: halfHeight, width: halfWidth, height: halfHeight, label: 'Q4'} // 우하단
    ];

    let qBaseNum = (pageNum - 1) * 4 + 1; // 1페이지면 1~4번, 2페이지면 5~8번 문제 매핑
    
    for (const q of quadrants) {
        const questionNumber = String(qBaseNum).padStart(3, '0'); // 001, 002...
        const outputFileName = `문제_${questionNumber}.png`;
        const outputPath = path.join(targetFolder, outputFileName);
        
        await image.clone()
            .extract({ left: q.left, top: q.top, width: q.width, height: q.height })
            // 여백(Padding)을 살짝 주어 모바일에서 봤을때 꽉차지 않도록 UI 렌더링 최적화
            .extend({ top: 20, bottom: 20, left: 20, right: 20, background: {r:255, g:255, b:255, alpha:1} })
            .toFile(outputPath);
            
        console.log(`   └ [자르기 완료] ${q.label} 영역 -> ${outputFileName} 생성 완료.`);
        
        // 메타데이터 빈 껍데기(JSON) 자동 생성 (크롤러가 덮어씌울 자리)
        const metaPath = path.join(targetFolder, `문제_${questionNumber}_meta.json`);
        const initialMeta = {
            questionId: questionNumber,
            grade: TARGET_GRADE,
            unit: TARGET_UNIT,
            solutionVideoLink: "", // 카페 크롤러가 와서 채울 자리
            transcript: "",        // Whisper AI가 채울 자리
            tacticBase: ""         // GPT가 원장님 로직을 복제해 적을 자리
        };
        fs.writeFileSync(metaPath, JSON.stringify(initialMeta, null, 2), 'utf8');
        
        qBaseNum++;
    }
}

async function runVisionSplitter() {
    console.log("==================================================");
    console.log("✂️ [Mentos Math DB] 원본 교재 4분할 스플리터 가동");
    console.log("==================================================");

    const targetFolder = await makeDirectories();
    
    // INPUT 디렉토리에 있는 임시 렌더링된 PNG 파일들을 검색
    const files = fs.readdirSync(INPUT_DIR).filter(file => file.endsWith('.png') || file.endsWith('.jpg'));
    
    if (files.length === 0) {
        console.log(`[INFO] '${INPUT_DIR}' 내부에 교재를 변환한 이미지 파일이 없습니다.`);
        console.log(`테스트를 원하시면 해당 폴더에 테스트용 교재 이미지(예: page1.png)를 넣어두고 다시 실행하세요.`);
        
        // ============================================
        // 테스트를 위해 샘플 캔버스 파일 하나를 억지로 생성합니다.
        // ============================================
        console.log("\n[TEST] 기능 시연을 위해 가짜 교재 페이지 1장을 실시간으로 그려서 파싱 테스트를 시작합니다...");
        const dummyPath = path.join(INPUT_DIR, 'dummy_page1.png');
        await sharp({
            create: { width: 1200, height: 1600, channels: 4, background: { r: 245, g: 245, b: 245, alpha: 1 } }
        }).toFile(dummyPath);
        files.push('dummy_page1.png');
    }
    
    // 파일 이름 순 정렬 (페이지 순서대로 처리하기 위함)
    files.sort();
    
    let pageNum = 1;
    for (const file of files) {
        const imagePath = path.join(INPUT_DIR, file);
        await processPageToQuadrants(imagePath, targetFolder, pageNum);
        pageNum++;
    }
    
    console.log("\n[SUCCESS] 모든 교재의 시각화 파티셔닝(자르기) 및 메타데이터 연결 소켓 생성이 100% 완료되었습니다.");
}

runVisionSplitter().catch(console.error);
