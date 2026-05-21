require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.VITE_OPENAI_API_KEY;
if (!API_KEY) {
  console.error("No OpenAI API key found in .env! (VITE_OPENAI_API_KEY)");
  process.exit(1);
}

const BASE_CROP_DIR = path.join(__dirname, '../public/math_crops/매쓰플랫');
const BANK_DIR = path.join(__dirname, '../src/data/math_problem_bank');

// [교과과정 매핑 룰 (업데이트 됨)]
const CURRICULUM_MAP = {
  "고1": { "1학기": { "공통수학1": { "다항식": ["다항식", "나머지정리", "인수분해"], "방정식과부등식": ["방정식", "부등식", "상"] } } },
};

function classifyCurriculum({ fileName, folder }) {
    if (fileName.includes("수능") || fileName.includes("모의")) {
        return { grade: "고3", semester: "통합", course: "실전", unit: "수능종합", diff: "상" };
    }
    
    // 매쓰플랫 전용 매핑 규칙 (고등수학(상) -> 고1 공통수학1)
    if (fileName.includes("고등수학(상)")) {
        return { grade: "고1", semester: "1학기", course: "공통수학1", unit: "방정식과부등식", diff: "중" };
    }

    return { grade: "unknown", semester: "unknown", course: "unknown", unit: "unknown", diff: "중" };
}

async function callChatGPT(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a mathematical grouping AI. Return ONLY the strict JSON array requested based on the input text and image file lists." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const options = {
      hostname: 'api.openai.com', path: '/v1/chat/completions', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}`, 'Content-Length': Buffer.byteLength(data) }
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

async function runPhase2() {
    console.log(`\n==================================================`);
    console.log(`[PHASE 2] 이미 완료된 PNG 추출본 기반 GPT 1회 배치 처리`);
    console.log(`==================================================`);
    
    if(!fs.existsSync(BASE_CROP_DIR)) return console.log("[ERROR] Phase 1이 아직 실행되지 않았습니다.");

    const folders = fs.readdirSync(BASE_CROP_DIR, {withFileTypes: true}).filter(d => d.isDirectory());
    console.log(`=> 탐색된 PNG 변환 대기열: ${folders.length} 세트\n`);

    let processed = 0;
    for (const d of folders) {
        const metaPath = path.join(BASE_CROP_DIR, d.name, 'metadata.json');
        if (!fs.existsSync(metaPath)) continue;

        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        
        // 커리큘럼 배정
        const curr = classifyCurriculum({ fileName: meta.baseName, folder: meta.originalFolderPath });
        const targetBankDir = path.join(BANK_DIR, curr.grade, curr.semester, curr.course, curr.unit, curr.diff);
        const finalJsonPath = path.join(targetBankDir, `${meta.baseName}.json`);

        // 이미 GPT 완성본이 있다면 스킵
        if (fs.existsSync(finalJsonPath)) {
            console.log(`[SKIP] 이미 GPT 처리가 완료됨: ${meta.baseName}`);
            continue;
        }

        console.log(`================================`);
        console.log(`[GPT 호출 준비] ${meta.baseName}`);

        const prompt = `
이 PDF의 모든 문제와 해설을 분석하여 JSON 양식으로 반환하라.
문제 이미지 배열: ${JSON.stringify(meta.qImages)}
해설 이미지 배열: ${JSON.stringify(meta.sImages)}

분석할 RAW 텍스트:
${meta.aText ? meta.aText : meta.qText}

반드시 다음 구조 준수:
{
  "items": [
    {
      "number": 1,
      "solutionText": "...원본 문자열 그대로...",
      "formulaLatex": ["x^2...", "..."],
      "graphExpressions": ["y=x..."]
    }
  ]
}`;
        
        console.log(`=> GPT API 1회 통신 시작...`);
        try {
            const raw = await callChatGPT(prompt);
            const parsed = JSON.parse(raw);
            
            if(!fs.existsSync(targetBankDir)) fs.mkdirSync(targetBankDir, { recursive: true });

            const finalObj = {
                schemaVersion: "3.5_2-PHASE",
                sourceQuestionPdf: meta.questionPdf,
                sourceAnswerPdf: meta.answerPdf,
                curriculum: { grade: curr.grade, semester: curr.semester, course: curr.course, unit: curr.unit },
                difficulty: curr.diff,
                items: (parsed.items || []).map((it, idx) => ({
                    number: it.number,
                    questionImage: meta.qImages[idx] || meta.qImages[0],
                    solutionImage: meta.sImages[idx] || meta.sImages[0],
                    solutionText: it.solutionText,
                    formulaLatex: it.formulaLatex,
                    graphExpressions: it.graphExpressions,
                    matched: true,
                    matchScore: 1.0
                }))
            };

            fs.writeFileSync(finalJsonPath, JSON.stringify(finalObj, null, 2));
            console.log(`[SUCCESS] DB 물리 저장 완료: ${finalJsonPath}`);
            processed++;
        } catch(e) {
            console.log(`[ERROR] GPT 실패: ${e}`);
        }
    }
    
    console.log(`\n[PHASE 2 완료] 총 ${processed}건의 GPT 변환 및 DB 적재 성공!`);
}

runPhase2();
