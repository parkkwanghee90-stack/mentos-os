const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('[ERROR] Gemini API Key missing in .env');
  process.exit(1);
}

const BASE_DIR = path.join(__dirname, '../public/math_crops/(7)수학2');
const TEXT_DB_PATHS = [
  path.join(__dirname, '../public/data/math_problem_texts.json'),
  path.join(__dirname, '../src/data/math_problem_texts.json')
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function loadTextDb() {
  const p = TEXT_DB_PATHS[0];
  if (fs.existsSync(p)) {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  }
  return {};
}

function saveTextDb(db) {
  TEXT_DB_PATHS.forEach(p => {
    try {
      const parentDir = path.dirname(p);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(p, JSON.stringify(db, null, 2), 'utf8');
    } catch (e) {
      console.error(`[ERROR] Failed to save DB to ${p}: ${e.message}`);
    }
  });
}

async function transcribeImage(imgPath) {
  const b64 = Buffer.from(fs.readFileSync(imgPath)).toString('base64');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  
  const prompt = `You are an elite expert Math Teacher in South Korea.
Transcribe the mathematical problem statement from this image into a clean Korean LaTeX markdown string.
Ensure all math formulas are enclosed in $...$ for inline math and $$...$$ for block math.
If the problem is multiple choice, output the question text first, followed by the choice options in this format:
① ...
② ...
③ ...
④ ...
⑤ ...
Do not include any introductory comments, only output the clean LaTeX markdown.`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/webp', data: b64 } }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${await response.text()}`);
  }

  const result = await response.json();
  if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts) {
    return result.candidates[0].content.parts[0].text.trim();
  }
  throw new Error('API response format invalid');
}

async function processFolder(folderName) {
  const folderDir = path.join(BASE_DIR, folderName);
  if (!fs.existsSync(folderDir)) {
    console.log(`⚠️ Folder not found: ${folderDir}`);
    return;
  }

  const files = fs.readdirSync(folderDir).filter(f => f.endsWith('.webp')).sort();
  console.log(`\n========================================================`);
  console.log(`🔍 Scanning ${folderName} (${files.length} webp crops)`);
  console.log(`========================================================`);

  const db = loadTextDb();
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const file of files) {
    const dbKey = `${folderName}/${file}`;
    
    // Check if already present in our database
    if (db[dbKey] && db[dbKey].trim().length > 0) {
      skipCount++;
      continue;
    }

    const imgPath = path.join(folderDir, file);
    console.log(`👉 Transcribing missing: ${dbKey}...`);
    
    let attempts = 3;
    let transcribed = null;
    
    while (attempts > 0 && !transcribed) {
      try {
        transcribed = await transcribeImage(imgPath);
      } catch (err) {
        attempts--;
        console.warn(`  ⚠️ Attempt failed for ${file} (Attempts left: ${attempts}): ${err.message}`);
        if (attempts > 0) await sleep(2000);
      }
    }

    if (transcribed) {
      // Clean up triple backticks if model returned them
      transcribed = transcribed.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
      db[dbKey] = transcribed;
      saveTextDb(db); // Save incrementally after each success to prevent data loss
      successCount++;
      console.log(`  ✅ [SUCCESS] ${file} transcribed! (${successCount} done)`);
      await sleep(1500); // Throttling rate limits
    } else {
      failCount++;
      console.error(`  ❌ [FAILED] Completely failed to transcribe ${file}`);
    }
  }

  console.log(`\n➔ Completed ${folderName}:`);
  console.log(`   - Already Present (Skipped): ${skipCount}`);
  console.log(`   - Transcribed: ${successCount}`);
  console.log(`   - Failed: ${failCount}`);
}

async function main() {
  console.log('========================================================');
  console.log('📚 Mentos OS — Math 2 KaTeX Batch Transcriber 📚');
  console.log('========================================================\n');

  // 교과서 진도 순서대로 수학2 모든 폴더를 나열합니다.
  // 이미 100% 완료된 폴더는 자동으로 매우 빠르게 스킵(Skip)됩니다.
  const TARGET_FOLDERS = [
    '함수의 극한 2단계',
    '함수의극한3단계',
    '함수의극한4단계',
    '함수의 연속 2단계',
    '함수의연속3단계',
    '함수의연속4단계',
    '미분계수 2단계',
    '미분계수3단계',
    '미분계수4단계',
    '도함수의 활용1 2단계',
    '도함수의활용2 2단계',
    '도함수의활용3단계',
    '도함수의 활용 4단계',
    '미분의활용 2단계',
    '부정적분과 정적분 2단계',
    '부정적분과 정적분 3단계',
    '부정적분과 정적분 4단계',
    '정적분 2단계',
    '정적분의 활용 2단계',
    '정적분의 활용 3단계',
    '정적분의 활용 4단계'
  ];

  for (const folder of TARGET_FOLDERS) {
    await processFolder(folder);
  }

  console.log('\n========================================================');
  console.log('🎉 BATCH TRANSCRIPTION COMPLETED');
  console.log('========================================================\n');
}

main().catch(console.error);
