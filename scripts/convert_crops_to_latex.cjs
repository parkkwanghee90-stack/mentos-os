const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('[ERROR] Gemini API Key missing in .env');
  process.exit(1);
}

const BASE_DIR = path.join(__dirname, '../public/math_crops/(001)다항식');
const TEXT_DB_PATHS = [
  path.join(__dirname, '../public/data/math_problem_texts.json'),
  path.join(__dirname, '../src/data/math_problem_texts.json')
];

// Helper to delay between requests
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load mathematical texts database
function loadTextDb() {
  const p = TEXT_DB_PATHS[0];
  if (fs.existsSync(p)) {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  }
  return {};
}

// Save mathematical texts database to both targets
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

async function processStage(stageName, keyPrefix) {
  const stageDir = path.join(BASE_DIR, stageName);
  if (!fs.existsSync(stageDir)) return;

  const files = fs.readdirSync(stageDir).filter(f => f.match(/^\d{3}\.webp$/));
  console.log(`\n--- Transcribing ${stageName} (${files.length} problems) ---`);
  
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
        transcribed = await transcribeImage(imgPath);
      } catch (err) {
        attempts--;
        console.warn(`[WARNING] Failed to transcribe ${file} in ${stageName} (attempts left: ${attempts}). Error: ${err.message}`);
        if (attempts > 0) await sleep(2000);
      }
    }

    if (transcribed) {
      db[dbKey] = transcribed;
      saveTextDb(db); // Save incrementally
      successCount++;
      console.log(`[SUCCESS] Transcribed ${file} (${successCount}/${files.length})`);
      // Throttling to stay within rate limits
      await sleep(1000);
    } else {
      console.error(`[ERROR] Completely failed to transcribe ${file} in ${stageName}`);
    }
  }

  console.log(`Finished ${stageName}: Transcribed: ${successCount}, Skipped: ${skipCount}`);
}

async function run() {
  const stages = [
    { name: '2단계', dbKey: '(001)다항식2단계' },
    { name: '3단계', dbKey: '(001)다항식3단계' },
    { name: '4단계', dbKey: '(001)다항식4단계' }
  ];

  for (const stage of stages) {
    await processStage(stage.name, stage.dbKey);
  }
  console.log('\n=== Batch LaTeX Transcription Completed Successfully ===');
}

run().catch(console.error);
