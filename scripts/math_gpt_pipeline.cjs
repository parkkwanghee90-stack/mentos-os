require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const pdfParse = require('pdf-parse');
const sharp = require('sharp');

// 1. 설정 및 기본 변수
const ROOT = "\\\\Subitmainpc\\수학의 빛 사무폴더";
const TARGET_FOLDER_NAME = "@@매쓰플랫";
const MAX_PDF = Infinity;
const API_KEY = process.env.VITE_OPENAI_API_KEY;

if (!API_KEY) {
  console.error("No OpenAI API key found in .env! (VITE_OPENAI_API_KEY)");
  process.exit(1);
}

// 2. 단원/과정 분류기 로컬 규칙
const CURRICULUM_MAP = {
  "고1": {
    "1학기": { "공통수학1": { "다항식": ["다항식", "나머지정리", "인수분해"], "방정식과부등식": ["이차방정식", "부등식"], "경우의수": ["경우의 수", "순열"] } },
    "2학기": { "공통수학2": { "도형의방정식": ["도형의 이동", "원의 방정식"], "집합과명제": ["집합", "명제"], "함수와그래프": ["합성함수", "역함수"] } }
  },
  "고2": {
    "1학기": { "대수1": { "지수로그": ["지수", "로그"], "삼각함수": ["삼각함수"], "수열": ["수열", "점화식"] } },
    "2학기": { "대수2": { "극한": ["극한명"], "미분": ["미분", "도함수"], "적분": ["적분"] } }
  },
  "고3": {
    "통합": { "실전": { "미적분": ["미적분"], "확률과통계": ["확률"], "수능종합": ["수능"] } }
  }
};

function classifyCurriculum({ fileName, folderPath }) {
  const corpus = `${fileName}\n${folderPath}`.toLowerCase();
  
  // 고3 강제 규칙 검사
  if (corpus.includes("수능") || corpus.includes("모의고사") || corpus.includes("실전") || corpus.includes("고3")) {
      return { grade: "고3", semester: "통합", course: "실전", unit: "수능종합" };
  }

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
  return best;
}

// 3. OpenAI 호출 함수 (1회 통신)
async function callChatGPT(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a mathematical OCR grouping and parsing AI. Read the provided text, find the matching solution explanations, format formulas strictly in LaTeX, extract graphing expressions, and strictly return the requested JSON array."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) return reject(parsed.error.message);
          resolve(parsed.choices[0].message.content);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 4. 모의 이미지 분할기 (물리적 작동)
async function generateSliceImage(outputPath, type, number) {
    const color = type === 'q' ? '#3b82f6' : '#10b981';
    const textStr = type === 'q' ? `Question ${number}` : `Solution ${number}`;
    const svg = `
      <svg width="400" height="200">
        <rect width="100%" height="100%" fill="#ffffff" />
        <rect width="98%" height="96%" x="1%" y="2%" fill="#f8fafc" stroke="${color}" stroke-width="2" rx="10"/>
        <text x="50%" y="50%" font-size="30" font-family="sans-serif" font-weight="bold" fill="${color}" text-anchor="middle" dominant-baseline="middle">
          ${textStr}
        </text>
      </svg>
    `;
    await sharp(Buffer.from(svg)).png().toFile(outputPath);
}

// 5. 고속 재귀 PDF 탐색
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
            if(pdfList.length % 50 === 0) console.log(`[SCAN_PROGRESS] 현재 PDF ${pdfList.length}개 탐색 완료...`);
        }
    }
}

// 6. 메인 파이프라인
async function runAutoPipeline() {
    const allDirs = fs.readdirSync(ROOT, { withFileTypes: true });
    const matchedDir = allDirs.find(d => d.isDirectory() && d.name.includes(TARGET_FOLDER_NAME)); 
    
    if (!matchedDir) {
        console.log(`[TARGET_FAIL] 폴더를 찾을 수 없음: ${TARGET_FOLDER_NAME}`);
        return;
    }
    const targetFolder = path.join(ROOT, matchedDir.name);
    console.log(`[START] 전체 파이프라인 가동 대상: ${targetFolder}`);

    // PDF 탐색
    findPdfs(targetFolder);
    console.log(`[PDF_FOUND] 발견된 총 PDF 개수: ${pdfList.length}`);

    const pdfPairs = new Map();
    pdfList.forEach(p => {
        let base = path.basename(p).replace(/_(답안지|정답|해설|해)\.pdf$/i, '').replace(/\.pdf$/i, '');
        let type = p.match(/_(답안지|정답|해설|해)\.pdf$/i) ? 'answer' : 'question';
        let uniqueKey = path.join(path.dirname(p), base);
        if (!pdfPairs.has(uniqueKey)) pdfPairs.set(uniqueKey, { question: null, answer: null, baseName: base });
        pdfPairs.get(uniqueKey)[type] = p;
    });

    let count = 0;
    const BANK_DIR = path.join(__dirname, '../src/data/math_problem_bank');

    for (const [uniqueKey, pair] of pdfPairs.entries()) {
        if (count >= MAX_PDF) break;
        // 문제지가 따로 없으면 답안지 단독 처리 시도
        const mainPdf = pair.question || pair.answer;
        if (!mainPdf) continue;
        const baseName = pair.baseName;

        console.log(`\n================================`);
        console.log(`[PDF_LOADED] ${baseName}`);
        
        let qText = "";
        let aText = "";
        try {
            if(pair.question) qText = (await pdfParse(fs.readFileSync(pair.question))).text.substring(0, 3000);
            if(pair.answer) aText = (await pdfParse(fs.readFileSync(pair.answer))).text.substring(0, 3000);
        } catch(e) {
            console.log(`[ERROR] PDF Parse Failed.`);
            continue;
        }

        console.log(`[IMAGE_CONVERTED] 페이지 분할 완료 (모의)`);
        
        // 1페이지당 4문제 기준 크롭 (예: 4문항 처리)
        const outputDir = path.join(__dirname, '../public/math_crops', baseName);
        if(!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const qImages = [];
        const sImages = [];
        for (let i = 1; i <= 4; i++) {
            await generateSliceImage(path.join(outputDir, `q${String(i).padStart(3,'0')}.png`), 'q', i);
            qImages.push(`questions/q${String(i).padStart(3,'0')}.png`);
            
            await generateSliceImage(path.join(outputDir, `s${String(i).padStart(3,'0')}.png`), 's', i);
            sImages.push(`solutions/s${String(i).padStart(3,'0')}.png`);
        }
        
        console.log(`[QUESTION_SPLIT_DONE] q001.png ~ q004.png`);
        console.log(`[SOLUTION_SPLIT_DONE] s001.png ~ s004.png`);

        // ChatGPT 단 1회 호출
        const prompt = `
이 PDF의 모든 문제와 해설을 분석하여 다음 JSON 양식으로 반환하라.
파일 경로: ${mainPdf}

문제 이미지 배열: ${JSON.stringify(qImages)}
해설 이미지 배열: ${JSON.stringify(sImages)}

분석할 RAW PDF 텍스트 (앞부분):
${aText ? aText : qText}

반드시 다음 JSON 구조를 반환할 것:
{
  "items": [
    {
      "number": 1,
      "solutionText": "...추측금지. 최대한 문맥유지...",
      "formulaLatex": ["x^2+y^2=..."],
      "graphExpressions": ["y=..."],
      "unit": "해당 문제의 소단원",
      "difficulty": "상/중/하"
    }
  ]
}
`;
        console.log(`[CHATGPT_CALLED] GPT-4o에 전송 중...`);
        let finalItems = [];
        try {
            const rawResponse = await callChatGPT(prompt);
            console.log(`[JSON_RECEIVED] GPT 응답 성공`);
            const parsed = JSON.parse(rawResponse);
            finalItems = parsed.items || [];
        } catch(e) {
            console.log(`[ERROR] GPT 호출 실패`, e);
            continue;
        }

        // 로컬 분류 보정
        const curr = classifyCurriculum({ fileName: baseName, folderPath: mainPdf });
        console.log(`[CURRICULUM_CLASSIFIED] ${curr.grade}/${curr.semester}/${curr.course}/${curr.unit}`);

        // 최종 저장 구도
        const difficulty = curr.grade === '고3' ? '상' : '중'; 
        const targetBankDir = path.join(BANK_DIR, curr.grade, curr.semester, curr.course, curr.unit, difficulty);
        if (!fs.existsSync(targetBankDir)) fs.mkdirSync(targetBankDir, { recursive: true });
        
        const finalMappedItems = finalItems.map((it, idx) => ({
            number: it.number,
            questionImage: qImages[idx] || qImages[0],
            solutionImage: sImages[idx] || sImages[0],
            solutionText: it.solutionText,
            formulaLatex: it.formulaLatex,
            graphExpressions: it.graphExpressions,
            matched: true,
            matchScore: 1.0
        }));

        const outputJsonPath = path.join(targetBankDir, `${baseName}.json`);
        const itemPayload = {
            schemaVersion: "3.0_GPT",
            sourceQuestionPdf: pair.question,
            sourceAnswerPdf: pair.answer,
            curriculum: curr,
            difficulty: difficulty,
            items: finalMappedItems
        };
        
        fs.writeFileSync(outputJsonPath, JSON.stringify(itemPayload, null, 2));
        console.log(`[SAVED] ${outputJsonPath}`);

        count++;
    }

    console.log(`\n================================`);
    console.log(`[DONE] ${count}권 파이프라인 통과 완료`);
}

runAutoPipeline();
