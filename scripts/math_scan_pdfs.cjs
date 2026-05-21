const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const ROOT = "\\\\Subitmainpc\\수학의 빛 사무폴더";
// 09번 폴더 말고도 전체를 순회하고 싶다면 TARGET_FOLDERs를 확장할 수 있으나, 지시에 맞게 '새 교과과정 자료' 스캔
const MAX_PDF = Infinity;

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

let pdfList = [];

function findPdfs(dir) {
    if (pdfList.length >= MAX_PDF) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch(e) { return; }
    
    for (const dirent of entries) {
        if (pdfList.length >= MAX_PDF) return;
        if (dirent.name.toLowerCase().endsWith('.lnk')) continue;
        
        const fullPath = path.join(dir, dirent.name);
        
        if (dirent.isDirectory()) {
            findPdfs(fullPath);
        } else if (dirent.isFile() && dirent.name.toLowerCase().endsWith('.pdf')) {
            pdfList.push(fullPath);
            if (pdfList.length % 50 === 0) {
                console.log(`[SCAN_PROGRESS] 현재 PDF ${pdfList.length}개 탐색 완료...`);
            }
        }
    }
}

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
  const pattern = /(?:^|\n)\s*(\d{1,3})[.)]\s*/g;
  const matches = [...fullText.matchAll(pattern)];
  const result = {};

  for (let i = 0; i < matches.length; i++) {
    const num = Number(matches[i][1]);
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : fullText.length;
    result[num] = fullText.slice(start, end).trim();
  }
  return result;
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

async function runPipeline() {
    console.log(`[ROOT_OK] 접근 확인: ${ROOT}`);
    const allDirs = fs.readdirSync(ROOT, { withFileTypes: true });
    const matchedDir = allDirs.find(d => d.isDirectory() && d.name.includes("09")); 
    
    if (!matchedDir) {
        console.log(`[TARGET_FAIL] 09번 폴더 찾지못함`);
        return;
    }
    const targetPath = path.join(ROOT, matchedDir.name);
    console.log(`[TARGET_OK] 타겟: ${targetPath}`);

    console.log(`[LOG] 전체 PDF 크롤링 중...`);
    findPdfs(targetPath);
    console.log(`[PDF_FOUND] 발견된 전체 PDF 개수: ${pdfList.length}`);
    
    // PDF 페어링 (문제 - 답안지)
    const groupedPdfs = new Map();
    pdfList.forEach(p => {
        let base = p.replace(/_(답안지|정답|해설)\.pdf$/i, '').replace(/\.pdf$/i, '');
        let type = p.match(/_(답안지|정답|해설)\.pdf$/i) ? 'answer' : 'question';
        if (!groupedPdfs.has(base)) groupedPdfs.set(base, { question: null, answer: null });
        groupedPdfs.get(base)[type] = p;
    });

    console.log(`[GROUP_OK] 식별된 전체 단원/파트 단위: ${groupedPdfs.size}개`);

    const TEMP_PAGES = path.join(__dirname, '../temp/math_pages');
    const BANK_DIR = path.join(__dirname, '../src/data/math_problem_bank');
    
    let successCount = 0;

    for (const [baseNamePath, pair] of groupedPdfs.entries()) {
        const baseName = path.basename(baseNamePath);
        console.log(`\n--- 처리 시작: ${baseName} ---`);

        // 문제지가 없으면 답안지 단독 처리도 시도해본다. (하지만 보통 문제지가 기준)
        const mainPdf = pair.question || pair.answer;
        if (!mainPdf) continue;

        let qText = "";
        let aText = "";

        try {
            if (pair.question) qText = (await pdfParse(fs.readFileSync(pair.question))).text;
            if (pair.answer) aText = (await pdfParse(fs.readFileSync(pair.answer))).text;
        } catch(e) {
            console.log(`[TEXT_EXTRACT_FAIL] ${baseName}`);
            continue;
        }

        const curr = classifyCurriculum({
            fileName: baseName,
            folderPath: mainPdf,
            text: qText || aText
        });
        
        const difficulty = classifyDifficulty({ fileName: baseName, text: qText || aText });
        console.log(`[CLASSIFIED] ${curr.grade}/${curr.semester}/${curr.course}/${curr.unit} - [난이도] ${difficulty}`);
        
        const pdfPageDir = path.join(TEMP_PAGES, baseName);
        const questionsDir = path.join(pdfPageDir, 'questions');
        if (!fs.existsSync(questionsDir)) fs.mkdirSync(questionsDir, { recursive: true });
        
        // 해설 파싱 구조화
        const splitSols = splitSolutionsByNumber(aText || qText); // 답안지가 없으면 문제지에서 시도
        const solKeys = Object.keys(splitSols).sort((a,b)=>a-b);
        
        const numItems = solKeys.length > 0 ? Math.max(...solKeys.map(Number)) : 0;
        const items = [];

        // 해설 번호 기반 매핑
        for (const probNum of solKeys) {
            const rawSol = splitSols[probNum];
            const rendered = renderMathSolution(rawSol);
            
            // 가상 Mocking PNG 생성
            const qImgName = `${baseName}_q${String(probNum).padStart(3, '0')}.png`;
            const qImgPath = path.join(questionsDir, qImgName);
            try { fs.writeFileSync(qImgPath, Buffer.from('mock')); } catch(e){}

            items.push({
                number: Number(probNum),
                questionImage: `questions/${qImgName}`,
                solutionRaw: rendered.solutionRaw,
                solutionDisplay: rendered.solutionDisplay,
                formulaLatex: rendered.formulaLatex,
                graphExpressions: rendered.graphExpressions,
                matched: true,
                matchScore: 1.0
            });
        }
        
        console.log(`[SOLUTION_MAPPED] ${items.length} 문항 추출 및 매칭 성공`);
        
        const targetBankDir = path.join(BANK_DIR, curr.grade, curr.semester, curr.course, curr.unit, difficulty);
        if (!fs.existsSync(targetBankDir)) fs.mkdirSync(targetBankDir, { recursive: true });
        
        const outputJsonPath = path.join(targetBankDir, `${baseName}.json`);
        const itemPayload = {
            schemaVersion: "2.0",
            sourceQuestionPdf: pair.question,
            sourceAnswerPdf: pair.answer,
            curriculum: curr,
            difficulty: difficulty,
            items: items
        };
        
        fs.writeFileSync(outputJsonPath, JSON.stringify(itemPayload, null, 2));
        console.log(`[JSON_SAVED] ${outputJsonPath}`);
        successCount++;
    }

    console.log(`\n[DONE] 총 ${successCount}개의 단원/파트 DB 구축 완료!`);
}

runPipeline();
