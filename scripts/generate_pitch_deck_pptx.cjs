const PptxGenJS = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

const pres = new PptxGenJS();
pres.layout = "LAYOUT_WIDE";

const assetDir = "C:\\Users\\user\\.gemini\\antigravity\\brain\\86e64522-36cc-424c-88be-8aab32906c96\\artifacts\\pitch_assets";
const outputDir = "C:\\Users\\user\\.gemini\\antigravity\\brain\\86e64522-36cc-424c-88be-8aab32906c96\\artifacts";
const outputFilePath = path.join(outputDir, "Mentos_OS_Pitch_Deck.pptx");

// --- Define Colors ---
const COLOR_BLUE = "1D4ED8";
const COLOR_GREEN = "059669";
const COLOR_RED = "DC2626";
const COLOR_DARK = "1E293B";

// --- Slide 1: Title ---
let slide1 = pres.addSlide();
slide1.background = { color: COLOR_DARK };
slide1.addText("멘토스 OS", { x: 0.5, y: 1.5, w: "90%", fontSize: 60, color: "FFFFFF", bold: true, align: "center" });
slide1.addText("AI 기반 수학적 사고력 성장 엔진", { x: 0.5, y: 2.8, w: "90%", fontSize: 32, color: "3B82F6", align: "center" });
slide1.addText("기술보증기금 투자 유치 사업계획서", { x: 0.5, y: 4.0, w: "90%", fontSize: 24, color: "94A3B8", align: "center" });

// --- Slide 2: Market Analysis ---
let slide2 = pres.addSlide();
slide2.addText("1. 시장 기회: 연 26조 사교육 시장의 패러다임 변화", { x: 0.5, y: 0.3, w: "90%", fontSize: 24, color: COLOR_BLUE, bold: true });
slide2.addTable(
    [
        [{ text: "시장 구분", options: { fill: COLOR_DARK, color: "FFFFFF", bold: true } }, { text: "규모 / 성장률", options: { fill: COLOR_DARK, color: "FFFFFF", bold: true } }],
        ["사교육 시장 (2025)", "연 26조 원 돌파"],
        ["AI 에듀테크 성장률", "연평균 30% 이상"],
        ["비대면 교육 시장", "구조적 정착 (대세)"]
    ],
    { x: 0.5, y: 1.0, w: 9, border: { pt: 1, color: "E2E8F0" }, fontSize: 18 }
);
slide2.addText("현재 AI 교육의 실체: 단순 채점과 문제 추천에 머물러 있는 한계", { x: 0.5, y: 4.5, w: "90%", fontSize: 20, color: COLOR_RED, bold: true });

// --- Slide 3: Comparison ---
let slide3 = pres.addSlide();
slide3.addText("2. 기존 AI 교육 vs. 멘토스 OS", { x: 0.5, y: 0.3, w: "90%", fontSize: 24, color: COLOR_BLUE, bold: true });
slide3.addTable(
    [
        [{ text: "비교 항목", options: { fill: COLOR_DARK, color: "FFFFFF" } }, { text: "기존 AI 교육", options: { fill: COLOR_DARK, color: "FFFFFF" } }, { text: "멘토스 OS", options: { fill: COLOR_BLUE, color: "FFFFFF", bold: true } }],
        ["핵심 목표", "정답 맞추기, 암기", "수학적 사고 과정 성장"],
        ["해설 방식", "텍스트/영상 (단방향)", "AVS - 시각화 애니메이션"],
        ["학습 분석", "점수/정답률 통계", "PCBS 단계별 막힌 지점 분석"],
        ["숙제 생성", "일괄 제공", "정답: 심화1 / 오답: 숫자변형2"]
    ],
    { x: 0.5, y: 1.0, w: 9, border: { pt: 1, color: "E2E8F0" }, fontSize: 16 }
);

// --- Slide 4: Unit Selection ---
let slide4 = pres.addSlide();
slide4.addText("3. 실제 화면 ① 단원 선택 & 문제은행 구조", { x: 0.5, y: 0.3, w: "90%", fontSize: 24, color: COLOR_BLUE, bold: true });
const unitImg = path.join(assetDir, "unit_selection.png");
if (fs.existsSync(unitImg)) slide4.addImage({ path: unitImg, x: 0.5, y: 1.0, w: 8, h: 4.5 });
slide4.addText("등급별 단계 자동 배정: 1-2등급(3,4단계) / 3등급(3단계) / 4-5등급(2단계)", { x: 0.5, y: 5.7, w: "90%", fontSize: 16, color: COLOR_DARK });

// --- Slide 5: Classroom Main ---
let slide5 = pres.addSlide();
slide5.addText("4. 실제 화면 ② AI 수업 메인 화면", { x: 0.5, y: 0.3, w: "90%", fontSize: 24, color: COLOR_BLUE, bold: true });
const classImg = path.join(assetDir, "classroom_main.png");
if (fs.existsSync(classImg)) slide5.addImage({ path: classImg, x: 0.5, y: 1.0, w: 8, h: 4.5 });
slide5.addText("60분 몰입 학습: 타이머 + PCBS 사고단계 + AVS/프리미엄 강의 즉시 연동", { x: 0.5, y: 5.7, w: "90%", fontSize: 16, color: COLOR_DARK });

// --- Slide 6: Grading ---
let slide6 = pres.addSlide();
slide6.addText("5. 실제 화면 ③ 스마트 채점 & 자동 학습 루프", { x: 0.5, y: 0.3, w: "90%", fontSize: 24, color: COLOR_BLUE, bold: true });
const gradeImg = path.join(assetDir, "answer_selected.png");
if (fs.existsSync(gradeImg)) slide6.addImage({ path: gradeImg, x: 1.0, y: 1.0, w: 7, h: 4 });
slide6.addText("오답 시 동일 유형 + 숫자 변경 문제 2개 즉시 생성", { x: 0.5, y: 5.5, w: "90%", fontSize: 18, color: COLOR_RED, bold: true, align: "center" });

// --- Slide 7: Mock Exam ---
let slide7 = pres.addSlide();
slide7.addText("6. 실제 화면 ④ 모의고사 OMR 자동 채점", { x: 0.5, y: 0.3, w: "90%", fontSize: 24, color: COLOR_BLUE, bold: true });
const omrImg = path.join(assetDir, "mock_omr_filled.png");
if (fs.existsSync(omrImg)) slide7.addImage({ path: omrImg, x: 0.5, y: 1.0, w: 8, h: 4.5 });
slide7.addText("2주마다 자동 생성 모의고사 + 취약 분석 리포트 + 학부모 푸시 알림", { x: 0.5, y: 5.7, w: "90%", fontSize: 16, color: COLOR_DARK });

// --- Slide 8: AVS ---
let slide8 = pres.addSlide();
slide8.addText("7. 핵심 기술: AVS (AI Vision Solution)", { x: 0.5, y: 0.3, w: "90%", fontSize: 24, color: COLOR_BLUE, bold: true });
const avsImg = path.join(assetDir, "avs_screen.png");
if (fs.existsSync(avsImg)) slide8.addImage({ path: avsImg, x: 1.0, y: 1.0, w: 7, h: 4 });
slide8.addText("텍스트 해설이 아닌 시각적 애니메이션을 통한 사고력 강화", { x: 0.5, y: 5.5, w: "90%", fontSize: 18, align: "center" });

// --- Slide 9: Premium Lecture ---
let slide9 = pres.addSlide();
slide9.addText("8. 프리미엄 AI 강의노트", { x: 0.5, y: 0.3, w: "90%", fontSize: 24, color: COLOR_BLUE, bold: true });
const lectureImg = path.join(assetDir, "premium_lecture.png");
if (fs.existsSync(lectureImg)) slide9.addImage({ path: lectureImg, x: 1.0, y: 1.0, w: 7, h: 4 });
slide9.addText("수업 중 막히는 개념을 즉시 꺼내보는 인터랙티브 강의 시스템", { x: 0.5, y: 5.5, w: "90%", fontSize: 18, align: "center" });

// --- Slide 10: Pricing ---
let slide10 = pres.addSlide();
slide10.addText("9. 수익 모델 & 매출 시뮬레이션", { x: 0.5, y: 0.3, w: "90%", fontSize: 24, color: COLOR_BLUE, bold: true });
slide10.addTable(
    [
        ["시기", "유료 회원", "단가", "월 매출", "연 매출"],
        ["2026 (런칭)", "1,000명", "45,000원", "4,500만 원", "5.4억 원"],
        ["2027 (성장)", "5,000명", "45,000원", "2.25억 원", "27억 원"],
        ["2028 (도약)", "50,000명", "99,000원", "49.5억 원", "594억 원"]
    ],
    { x: 0.5, y: 1.5, w: 9, border: { pt: 1, color: "E2E8F0" }, fontSize: 18 }
);

// --- Slide 11: Vision ---
let slide11 = pres.addSlide();
slide11.background = { color: COLOR_DARK };
slide11.addText("Mentos OS", { x: 0.5, y: 2.0, w: "90%", fontSize: 44, color: "FFFFFF", bold: true, align: "center" });
slide11.addText("전 세계 모든 학생들에게 평등하고 압도적인 프리미엄 교육 경험을 제공합니다.", { x: 0.5, y: 3.5, w: "90%", fontSize: 20, color: "94A3B8", align: "center" });

// --- Save File ---
pres.writeFile({ fileName: outputFilePath }).then(fileName => {
    console.log(`PPTX created: ${fileName}`);
}).catch(err => {
    console.error("Error creating PPTX:", err);
});
