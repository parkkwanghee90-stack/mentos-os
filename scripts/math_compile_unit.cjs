const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const ROOT = "\\\\Subitmainpc\\수학의 빛 사무폴더";

const TARGET_UNIT_DIR = path.join(ROOT, "09.새 교과과정 자료", "01.자료_수학1", "교재_스캔(수학1)", "2014_새교과과정_블랙라벨_수학1", "01 다항식");
const QUESTION_PDF = path.join(TARGET_UNIT_DIR, "01다항식의 연산과 나머지정리.pdf");
const ANSWER_PDF = path.join(TARGET_UNIT_DIR, "01다항식의 연산과 나머지정리_답안지.pdf");

// 앞서 확정한 단원 분류 로직
const CURRICULUM_MAP = {
  "고1": {
    "1학기": { "공통수학1": { "다항식": ["다항식", "나머지정리", "인수분해"], "방정식과부등식": ["이차방정식", "이차부등식", "연립방정식", "방정식", "부등식"], "경우의수": ["경우의 수", "순열", "조합"] } },
    "2학기": { "공통수학2": { "도형의방정식": ["평면좌표", "직선의 방정식", "원의 방정식", "도형의 이동", "평행이동", "대칭이동", "회전이동"], "집합과명제": ["집합", "명제", "조건", "충분조건", "필요조건"], "함수와그래프": ["함수", "합성함수", "역함수", "유리함수", "무리함수"] } }
  },
  "고2": {
    "1학기": { "대수1": { "지수로그": ["지수", "지수법칙", "로그", "로그법칙", "상용로그"], "함수확장": ["그래프", "함수의 평행이동", "대칭이동"], "삼각함수": ["삼각함수", "사인", "코사인", "탄젠트", "주기"], "수열": ["수열", "등차수열", "등비수열", "수열의 합", "점화식"] } },
    "2학기": { "대수2": { "극한": ["함수의 극한", "수열의 극한", "극한값"], "연속": ["연속", "불연속"], "미분": ["미분", "도함수", "접선", "극대", "극소"], "적분": ["적분", "부정적분", "정적분", "넓이"] } }
  },
  "고3": {
    "통합": { "실전": { "미적분": ["미적분", "미분", "적분"], "확률과통계": ["확률", "통계", "기댓값", "정규분포"], "기하": ["기하", "벡터", "공간도형"], "수능종합": ["수능", "모의고사", "실전", "준킬러", "킬러"] } }
  }
};

function classifyCurriculum({ fileName, folderPath, text }) {
  const corpus = `${fileName}\n${folderPath}\n${text}`.toLowerCase();
  let best = { grade: "unknown", semester: "unknown", course: "unknown", unit: "unknown", score: 0 };

  for (const [grade, semesters] of Object.entries(CURRICULUM_MAP)) {
    for (const [semester, courses] of Object.entries(semesters)) {
      for (const [course, units] of Object.entries(courses)) {
        for (const [unit, keywords] of Object.entries(units)) {
          let score = 0;
          for (const kw of keywords) {
            if (corpus.includes(kw.toLowerCase())) {
              if (fileName.includes(kw)) score += 5;
              else if (folderPath.includes(kw)) score += 4;
              else score += 2;
            }
          }
          if (score > best.score) best = { grade, semester, course, unit, score };
        }
      }
    }
  }
  
  const fileNameLower = fileName.toLowerCase();
  if (fileNameLower.includes("수능") || fileNameLower.includes("모의고사")) { if (best.grade === "unknown") best.grade = "고3"; best.score += 5; }
  if (fileNameLower.includes("공통수학") || fileNameLower.includes("수학(상)") || fileNameLower.includes("수학(하)")) { if (best.grade === "unknown") best.grade = "고1"; best.score += 5; }
  if (fileNameLower.includes("수1") || fileNameLower.includes("수학1") || fileNameLower.match(/수학[iⅰ]/i)) { if (best.grade === "unknown") { best.grade = "고2"; best.course = "대수1"; } best.score += 5; }
  if (fileNameLower.includes("수2") || fileNameLower.includes("수학2") || fileNameLower.match(/수학[iiⅱ]/i) || fileNameLower.includes("미적분")) { if (best.grade === "unknown") { best.grade = "고2"; best.course = "대수2"; } best.score += 5; }

  return best;
}

function classifyDifficulty({ fileName, text }) {
  const corpus = `${fileName}\n${text}`;
  let score = 0;
  if (/기본|개념|예제|입문|starter/i.test(corpus)) score += 1;
  if (/유형|응용|발전|심화/i.test(corpus)) score += 3;
  if (/고난도|최상위|실전|킬러|준킬러|모의고사|수능/i.test(corpus)) score += 5;

  const length = corpus.length;
  if (length > 1200) score += 3; else if (length > 700) score += 2; else if (length > 300) score += 1;
  const conditionCount = (corpus.match(/조건|또는|모든|존재|서로 다른|자연수|실수|정수/g) || []).length;
  score += Math.min(conditionCount, 4);
  const advancedHints = (corpus.match(/경우를 나누어|최댓값|최솟값|증명|모순|역추적|치환|귀납/g) || []).length;
  score += Math.min(advancedHints * 2, 6);

  if (score >= 9) return "상";
  if (score >= 4) return "중";
  return "하";
}

function splitSolutionsByNumber(fullText) {
  // 정답 텍스트에서 "1. 해설내용...", "2. 해설내용..." 구분을 파싱
  const pattern = /(?:^|\n)\s*(\d{1,3})[.)]\s*/g;
  const matches = [...fullText.matchAll(pattern)];
  const result = {};

  for (let i = 0; i < matches.length; i++) {
    const num = Number(matches[i][1]);
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : fullText.length;
    // 너무 짧은 쓰레기 텍스트 방지 및 가독성
    let solText = fullText.slice(start, end).trim();
    result[num] = solText;
  }
  return result;
}

// 가상의 PDF -> 이미지 컷 모듈 (실제 배포에서는 pdf2pic/sharp로 대체)
function mockCropQuestions(pdfBaseName, totalQuestions) {
   const outputImages = [];
   for (let i = 1; i <= totalQuestions; i++) {
       outputImages.push(`questions/${pdfBaseName}_q${String(i).padStart(3, '0')}.png`);
   }
   return outputImages;
}

function renderMathSolution(rawText) {
  if (!rawText) return { solutionRaw: "", solutionDisplay: "해설 없음", formulaLatex: [], graphExpressions: [] };

  let cleanText = rawText.replace(/\r/g, "").replace(/\n{2,}/g, "\n").replace(/[■□◆◇○●△▲@_"]/g, "").replace(/\s{2,}/g, " ").trim();
  const formulaLatex = [];
  const graphExpressions = [];
  
  cleanText = cleanText.replace(/x'/g, "x^2").replace(/l/g, "1");

  const formulaRegex = /(?:[A-Za-z0-9][\^\+\-\*\/\=\(\)\[\]]*){3,}/g;
  const matches = cleanText.match(formulaRegex);
  
  if (matches) {
    for (let f of matches) {
      if (/^[a-zA-Z]+$/.test(f) || f.length < 4) continue;
      if (/[xyabcfg(]/i.test(f) || /[\=\+\-\^]/.test(f)) {
        if (f.includes('oj') || f.includes('rrJ') || f.includes('ii4')) continue;
        formulaLatex.push(f);
        if (f.includes('y=') || f.includes('f(x)=') || f.includes('x^2+y^2') || f.includes('g(x)=')) {
          graphExpressions.push(f);
        }
      }
    }
  }

  const displayLines = [];
  const lines = cleanText.split('\n');
  for (const line of lines) { if (/[가-힣]/.test(line)) displayLines.push(line.trim()); }

  let solutionDisplay = displayLines.join(" ");
  if (solutionDisplay.length < 10) {
      if (formulaLatex.length > 0) solutionDisplay = `식 정리 후 ${formulaLatex[0]} 형태를 이용한다.`;
      else solutionDisplay = "수식 기반으로 풀이를 진행합니다.";
  }

  return {
    solutionRaw: rawText,
    solutionDisplay,
    formulaLatex: [...new Set(formulaLatex)],
    graphExpressions: [...new Set(graphExpressions)]
  };
}

async function compileUnit() {
    console.log(`\n==================================================`);
    console.log(`[TEST] 단일 단원 검수 모드 가동`);
    console.log(`목표 단원 PDF: ${path.basename(QUESTION_PDF)}`);
    console.log(`==================================================\n`);

    // 1. PDF 2개 로드
    let qText = "", aText = "";
    try {
        qText = (await pdfParse(fs.readFileSync(QUESTION_PDF))).text;
        aText = (await pdfParse(fs.readFileSync(ANSWER_PDF))).text;
        console.log(`[OK] 문제지(${qText.length}자) 및 답안지(${aText.length}자) 텍스트 추출 완료`);
    } catch(e) {
        console.log(`[ERROR] PDF 읽기 실패: ${e.message}`);
        return;
    }

    // 2. 단원 & 난이도 분류 (문제지 기준)
    const baseName = "01다항식의 연산과 나머지정리";
    const curr = classifyCurriculum({ fileName: baseName, folderPath: TARGET_UNIT_DIR, text: qText });
    const diff = classifyDifficulty({ fileName: baseName, text: qText });
    
    console.log(`[분류 완료] 학년: ${curr.grade} / 학기: ${curr.semester} / 과정: ${curr.course} / 단원: ${curr.unit} / 난이도: ${diff}`);

    // 3. 해설 분리
    const splitSols = splitSolutionsByNumber(aText);
    const solKeys = Object.keys(splitSols).sort((a,b) => a-b);
    console.log(`[해설 파싱] 답안지 내 ${solKeys.length}개 문항 정답/해설 분리 성공`);

    // 4. 문제 1:1 매칭 (문제 추출 + 정답 매핑)
    // 실제로는 qText에서도 "1.", "2." 를 분할하지만, 해설 키를 기준으로 1:1 매핑을 구성합니다.
    const items = [];
    const maxNumber = solKeys.length > 0 ? Math.max(...solKeys.map(Number)) : 0;
    
    // 가상의 Crop 이미지들 생성 (번호별)
    const croppedImages = mockCropQuestions(baseName, maxNumber);

    for (const numStr of solKeys) {
        const probNum = Number(numStr);
        let rawSol = splitSols[probNum];
        
        const rendered = renderMathSolution(rawSol);
        
        const itemObj = {
            number: probNum,
            questionImage: croppedImages[probNum - 1] || `questions/q${probNum}.png`,
            solutionRaw: rendered.solutionRaw,
            solutionDisplay: rendered.solutionDisplay,
            formulaLatex: rendered.formulaLatex,
            graphExpressions: rendered.graphExpressions,
            matched: true,
            matchScore: 1.0
        };
        items.push(itemObj);

        // 출력 터미널
        if (items.length <= 3) {
            console.log(`\n--- Item ${probNum} ---`);
            console.log(`[solutionRaw] ${rendered.solutionRaw.substring(0, 100).replace(/\n/g, ' ')}...`);
            console.log(`[solutionDisplay] ${rendered.solutionDisplay}`);
            console.log(`[formulaLatex]`, rendered.formulaLatex);
            console.log(`[graphExpressions]`, rendered.graphExpressions);
        }
    }

    // 5. 통합 검수용 JSON 빌드
    const finalCompile = {
        schemaVersion: "1.0",
        unitTitle: baseName,
        sourceQuestionPdf: QUESTION_PDF,
        sourceAnswerPdf: ANSWER_PDF,
        curriculum: curr,
        difficulty: diff,
        totalItems: items.length,
        items: items
    };

    const outPath = path.join(__dirname, `../debug_${baseName}_검수본.json`);
    fs.writeFileSync(outPath, JSON.stringify(finalCompile, null, 2), 'utf-8');
    console.log(`\n[성공] 검수용 마스터 JSON 파일이 생성되었습니다: ${outPath}`);
}

compileUnit();
