const fs = require('fs');
const path = require('path');
require('dotenv').config({ override: true });

const API_KEY = process.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('[ERROR] Gemini API Key missing in .env');
  process.exit(1);
}

const TEXT_DB_PATH = path.join(__dirname, '../public/data/math_problem_texts.json');
const HINTS_BASE_DIR = path.join(__dirname, '../public/math_hints');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generatePCBSAForProblem(problemText, correctAnswer, id, isMultipleChoice) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  
  const systemPrompt = `You are an elite expert Math Teacher in South Korea.
Your task is to analyze the high school math problem and its correct answer, and generate a step-by-step PCBSA hint JSON structure.
PCBSA stands for:
- P: 문제에서 구하는 것 확인 (What we need to find)
- C: 조건/단서 정리 (Given conditions/clues)
- B: 필요한 배경개념/공식 (Relevant concepts/formulas like Quadratic formula, relationship between roots and coefficients, discriminant, properties of quadratic functions, vertex form, range of quadratic functions)
- S: 식 변형/구조 분석 (Algebraic transformation, Discriminant analysis, Completing the square, Substitution)
- A: 계산 적용 및 최종 정답 도출 (Final calculation and quadratic equations/functions deduction)

You MUST generate EXACTLY this JSON structure, with no markdown code blocks or wrapper text:
{
  "type": "algebra",
  "viewBox": { "x": [-10, 10], "y": [-10, 10] },
  "steps": [
    {
      "step": 1,
      "label": "P: 문제에서 구하는 것 확인",
      "latex": "..."
    },
    {
      "step": 2,
      "label": "C: 조건/단서 정리",
      "latex": "..."
    },
    {
      "step": 3,
      "label": "B: 필요한 배경개념/공식",
      "latex": "..."
    },
    {
      "step": 4,
      "label": "S: 식 변형/구조 분석",
      "latex": "..."
    },
    {
      "step": 5,
      "label": "A: 계산 적용 및 최종 정답 도출",
      "latex": "..."
    }
  ],
  "finalAnswer": "...",
  "correctAnswer": "${correctAnswer}",
  "answerType": "${isMultipleChoice ? 'multiple_choice' : 'subjective'}",
  "explanationFinalLine": "따라서 정답은 ${isMultipleChoice ? '①~⑤' : '...'}입니다.",
  "status": "complete",
  "pcbsa_completed": true
}

Rules:
1. "latex" field must contain helpful pedagogical Korean instructions and LaTeX formulas. Use standard LaTeX (e.g. $...$ for inline or double backslashes \\\\ for newlines).
2. Keep the descriptions concise, clean, and helpful for the student to solve on their own. Never just give the final formula away directly in Step 1 or 2!
3. For multiple choice, ensure the explanationFinalLine includes the correct choice circle (e.g. "따라서 정답은 ②입니다." where 2 maps to ②, 1 to ①, 3 to ③, 4 to ④, 5 to ⑤).
4. Do not include markdown code fence wrappers (\`\`\`json) in the response. Only output raw JSON.`;

  const userContent = `Problem:
${problemText}

Correct Answer:
${correctAnswer}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: userContent }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    const text = result.candidates[0].content.parts[0].text;
    return JSON.parse(text.trim());
  } finally {
    clearTimeout(timeoutId);
  }
}

async function processStage(manifestPath, stageName, dbKey, textDbPrefix) {
  if (!fs.existsSync(manifestPath)) {
    console.error(`[ERROR] Answers manifest missing at: ${manifestPath}`);
    return;
  }
  
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const stageData = manifest[dbKey];
  if (!stageData) {
    console.warn(`[WARNING] No manifest data found for: ${dbKey}`);
    return;
  }

  const qCount = Object.keys(stageData).length;

  const targetDir = path.join(HINTS_BASE_DIR, dbKey);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log(`\n--- Generating AVS for ${dbKey} (All Problems, Count: ${qCount} problems) ---`);
  
  const textDb = JSON.parse(fs.readFileSync(TEXT_DB_PATH, 'utf8'));
  
  let successCount = 0;
  let skipCount = 0;
  let missingTextCount = 0;

  for (let i = 1; i <= qCount; i++) {
    const id = String(i).padStart(3, '0');
    const destPath = path.join(targetDir, `${id}.json`);
    
    // Skip if already generated
    if (fs.existsSync(destPath)) {
      skipCount++;
      continue;
    }

    const textKey = `${textDbPrefix}/${id}.webp`;
    const problemText = textDb[textKey];
    if (!problemText) {
      console.warn(`  - [Warning] Missing OCR text for: ${textKey}`);
      missingTextCount++;
      continue;
    }

    const qObj = stageData[String(i)] || stageData[i];
    const correctAnswer = qObj ? qObj.correctAnswer : null;
    if (!correctAnswer) {
      console.warn(`  - [WARNING] No answer found for ${id} in ${stageName}, skipping.`);
      continue;
    }

    const isMultipleChoice = qObj ? (qObj.answerType === 'choice') : false;

    let attempts = 3;
    let avsObj = null;

    while (attempts > 0 && !avsObj) {
      try {
        console.log(`  -> Generating PCBSA JSON for ${dbKey} ${id}...`);
        avsObj = await generatePCBSAForProblem(problemText, correctAnswer, id, isMultipleChoice);
      } catch (err) {
        attempts--;
        console.warn(`  [WARNING] Failed to generate AVS for ${id} in ${dbKey} (attempts left: ${attempts}). Error: ${err.message}`);
        if (attempts > 0) await sleep(3000);
      }
    }

    if (avsObj) {
      avsObj.problem_id = id;
      avsObj.unit_name = dbKey;
      
      fs.writeFileSync(destPath, JSON.stringify(avsObj, null, 2), 'utf8');
      successCount++;
      console.log(`    [SUCCESS] Generated AVS for ${id} (${successCount}/${qCount})`);
      await sleep(1500); // 1.5s delay to keep API safe
    } else {
      console.error(`    [ERROR] Completely failed to generate AVS for ${id} in ${dbKey}`);
    }
  }

  console.log(`Finished AVS for ${dbKey}: Generated: ${successCount}, Skipped: ${skipCount}, Missing Problem Text: ${missingTextCount}`);
}

async function run() {
  const eqManifest = path.join(__dirname, '../public/math_crops/(005)이차방정식/extracted_answers.json');
  const funcManifest = path.join(__dirname, '../public/math_crops/(006)이차방정식과이차함수/extracted_answers.json');

  const stages = [
    // 1. 이차방정식
    { manifestPath: eqManifest, stageName: '2단계', dbKey: '이차방정식2단계', textDbPrefix: '(005)이차방정식2단계' },
    { manifestPath: eqManifest, stageName: '3단계', dbKey: '이차방정식3단계', textDbPrefix: '(005)이차방정식3단계' },
    { manifestPath: eqManifest, stageName: '4단계', dbKey: '이차방정식4단계', textDbPrefix: '(005)이차방정식4단계' },
    // 2. 이차방정식과이차함수
    { manifestPath: funcManifest, stageName: '2단계', dbKey: '이차방정식과이차함수2단계', textDbPrefix: '(006)이차방정식과이차함수2단계' },
    { manifestPath: funcManifest, stageName: '3단계', dbKey: '이차방정식과이차함수3단계', textDbPrefix: '(006)이차방정식과이차함수3단계' },
    { manifestPath: funcManifest, stageName: '4단계', dbKey: '이차방정식과이차함수4단계', textDbPrefix: '(006)이차방정식과이차함수4단계' }
  ];

  for (const s of stages) {
    await processStage(s.manifestPath, s.stageName, s.dbKey, s.textDbPrefix);
  }
  console.log('\n=== Quadratic Equations & Functions AVS Hint JSON Generation Completed (All Problems) ===');
}

if (require.main === module) {
  run().catch(console.error);
}
