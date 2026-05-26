const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('[ERROR] Gemini API Key missing in .env');
  process.exit(1);
}

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
    if (fs.existsSync(path.dirname(p))) {
      fs.writeFileSync(p, JSON.stringify(db, null, 2), 'utf8');
    }
  });
}

async function transcribeImage(imgPath) {
  const b64 = Buffer.from(fs.readFileSync(imgPath)).toString('base64');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  
  const prompt = `You are an elite expert Math Teacher in South Korea.
Analyze the math problem statement in this image and transcribe it into a clean Korean LaTeX markdown string.
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

async function processStage(baseDir, stageName, keyPrefix) {
  const stageDir = path.join(baseDir, stageName);
  if (!fs.existsSync(stageDir)) return;

  const files = fs.readdirSync(stageDir)
    .filter(f => f.match(/^\d{3}\.webp$/));
  
  // Sort files numerically
  files.sort((a, b) => {
    const numA = parseInt(a.replace('.webp', ''), 10) || 0;
    const numB = parseInt(b.replace('.webp', ''), 10) || 0;
    return numA - numB;
  });

  console.log(`\n--- Transcribing ${keyPrefix} ${stageName} (All Problems, Count: ${files.length}) ---`);
  
  const db = loadTextDb();
  let successCount = 0;
  let skipCount = 0;

  for (const file of files) {
    const id = file.replace('.webp', '');
    const dbKey = `${keyPrefix}/${file}`;
    
    // Check if already processed
    if (db[dbKey]) {
      skipCount++;
      continue;
    }

    const imgPath = path.join(stageDir, file);
    let attempts = 3;
    let transcribed = null;
    
    while (attempts > 0 && !transcribed) {
      try {
        console.log(`  -> OCR Transcribing ${keyPrefix} ${stageName} ${file}...`);
        transcribed = await transcribeImage(imgPath);
      } catch (err) {
        attempts--;
        console.warn(`[WARNING] Failed to transcribe ${file} in ${stageName} (attempts left: ${attempts}). Error: ${err.message}`);
        if (attempts > 0) await sleep(3000);
      }
    }

    if (transcribed) {
      db[dbKey] = transcribed;
      saveTextDb(db); // Save incrementally
      successCount++;
      console.log(`    [SUCCESS] Transcribed ${file} (${successCount}/${files.length})`);
      await sleep(1500); // 1.5s delay to keep API safe
    } else {
      console.error(`    [ERROR] Completely failed to transcribe ${file} in ${stageName}`);
    }
  }

  console.log(`Finished ${stageName}: Transcribed: ${successCount}, Skipped: ${skipCount}`);
}

async function run() {
  const eqBase = path.join(__dirname, '../public/math_crops/(005)이차방정식');
  const funcBase = path.join(__dirname, '../public/math_crops/(006)이차방정식과이차함수');

  const jobs = [
    // 1. 이차방정식
    { baseDir: eqBase, name: '2단계', keyPrefix: '(005)이차방정식2단계' },
    { baseDir: eqBase, name: '3단계', keyPrefix: '(005)이차방정식3단계' },
    { baseDir: eqBase, name: '4단계', keyPrefix: '(005)이차방정식4단계' },
    // 2. 이차방정식과이차함수
    { baseDir: funcBase, name: '2단계', keyPrefix: '(006)이차방정식과이차함수2단계' },
    { baseDir: funcBase, name: '3단계', keyPrefix: '(006)이차방정식과이차함수3단계' },
    { baseDir: funcBase, name: '4단계', keyPrefix: '(006)이차방정식과이차함수4단계' }
  ];

  for (const job of jobs) {
    await processStage(job.baseDir, job.name, job.keyPrefix);
  }
  console.log('\n=== Quadratic Equations & Functions LaTeX Transcription Completed (All Problems) ===');
}

run().catch(console.error);
