// bulk_generate_tts.cjs
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'math-tts';
const VOICE = 'nova';

// Load the English map generated earlier
const mapPath = 'scripts/tts_map.json';
const unitMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

// Function to convert LaTeX/formulas to natural Korean reading
function latexToSpeech(text) {
  if (!text) return '';
  if (typeof text !== 'string') {
    if (Array.isArray(text)) text = text.join(' ');
    else text = JSON.stringify(text);
  }
  return text
    .replace(/\\\\/g, ', ')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$2 분의 $1')
    .replace(/\\sqrt\{([^}]*)\}/g, '루트 $1')
    .replace(/\\pm/g, '플러스 마이너스')
    .replace(/\\times/g, ' 곱하기 ')
    .replace(/\\div/g, ' 나누기 ')
    .replace(/\\leq/g, ' 이하')
    .replace(/\\geq/g, ' 이상')
    .replace(/\\neq/g, ' 같지 않음')
    .replace(/\\cdot/g, ' 곱하기 ')
    .replace(/\\alpha/g, '알파')
    .replace(/\\beta/g, '베타')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[{}$]/g, '')
    .replace(/\^(\d)/g, '의 $1승')
    .replace(/\^/g, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract PCBS text and format the narration script
function createNarration(data) {
  let p = '', c = '', b = '', s = '';

  if (data.steps && Array.isArray(data.steps)) {
    for (const step of data.steps) {
      const label = (step.label || '').toUpperCase();
      const content = latexToSpeech(step.latex || step.text || step.content || step.formula_raw || '');
      if (label.includes('P') && (label.includes(':') || label.includes('('))) p = content;
      else if (label.includes('C') && (label.includes(':') || label.includes('('))) c = content;
      else if (label.includes('B') && (label.includes(':') || label.includes('('))) b = content;
      else if (label.includes('S') && (label.includes(':') || label.includes('('))) s = content;
    }
  }
  
  if (!p && data.P) p = latexToSpeech(data.P);
  if (!c && data.C) c = latexToSpeech(data.C);
  if (!b && data.B) b = latexToSpeech(data.B);
  if (!s && data.S) s = latexToSpeech(data.S);

  if (!p && !c && !b) return null;

  let script = '';
  if (p) script += `이 문제에서 구하는 것은, ${p}.\n`;
  if (c) script += `주어진 조건을 정리하면, ${c}.\n`;
  if (b) script += `여기서 필요한 개념은, ${b}.\n`;
  if (s) script += `풀이 구조를 살펴보면, ${s}.\n`;
  script += '계산 과정은 아래에 정리되어 있으니, 직접 풀어보세요.';
  
  return script;
}

async function generateTTS(text) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30 sec timeout
  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        input: text,
        voice: VOICE,
        response_format: 'mp3',
        speed: 0.9,
      }),
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`TTS Error: ${res.status} - ${await res.text()}`);
    return Buffer.from(await res.arrayBuffer());
  } finally {
    clearTimeout(timeout);
  }
}

async function checkSupabaseExists(remotePath) {
  const url = `${SUPABASE_URL}/storage/v1/object/info/public/${BUCKET}/${remotePath}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res.ok;
  } catch (e) {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function uploadToSupabase(buffer, remotePath) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${remotePath}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'audio/mpeg',
        'x-upsert': 'true',
      },
      body: buffer,
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`Upload Error: ${res.status} - ${await res.text()}`);
  } finally {
    clearTimeout(timeout);
  }
}

// Main generation loop
async function main() {
  console.log('=== TTS Bulk Generation: All Units (001~020) ===\n');

  // Load all avs answer keys as the reference for units
  const avsData = JSON.parse(fs.readFileSync('public/data/avs_answers.json', 'utf8'));
  let allUnits = Object.keys(avsData);
  
  // Filter for '수학상', '수학1', '확통' only
  const targetKeywords = [
    // 수학상
    '다항식', '나머지정리', '인수분해', '복소수', '이차방정식', '이차함수', '여러가지방정식', '고차방정식', '일차부등식', '이차부등식', '점과좌표', '직선의방정식', '원의방정식', '도형의이동',
    // 수학1
    '지수', '로그', '지수함수', '로그함수', '삼각함수', '등차', '등비', '시그마', '여러가지수열', '귀납', '수열의합',
    // 확통
    '경우의수', '순열', '조합', '이항정리', '확률', '덧셈정리', '조건부', '독립시행', '이산확률', '연속확률', '정규분포', '통계'
  ];
  allUnits = allUnits.filter(k => {
    const clean = k.replace(/\s+/g, '');
    return targetKeywords.some(w => clean.includes(w));
  });
  console.log(`\n=== Filtering Applied: Target Units = ${allUnits.length} ===\n`);
  
  // We need to map AVS keys to actual hint folder paths if they differ
  // For Math 2, folders are under `(7)수학2/`
  // For Calculus, folders are directly under `미적분` or have special names.
  // We can just scan `public/math_hints` recursively to find folder paths matching our unit names.
  
  const hintsDir = 'public/math_hints';
  const folderPaths = [];
  
  function scanForFolders(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        folderPaths.push(fullPath);
        scanForFolders(fullPath);
      }
    }
  }
  scanForFolders(hintsDir);
  
  for (let unitKey of allUnits) {
    const cleanUnitKey = unitKey.replace(/\s+/g, '');
    const engUnitName = unitMap[cleanUnitKey];
    if (!engUnitName) {
      console.log(`[Skip] No English mapping found for: ${unitKey}`);
      continue;
    }
    
    // Find matching folder path
    let matchedFolder = folderPaths.find(f => {
      const folderName = path.basename(f).replace(/\s+/g, '');
      return folderName === cleanUnitKey || folderName.includes(cleanUnitKey) || cleanUnitKey.includes(folderName);
    });
    
    if (!matchedFolder) {
      // Direct exact check
      const direct = path.join(hintsDir, unitKey);
      if (fs.existsSync(direct)) matchedFolder = direct;
    }

    if (!matchedFolder) {
      console.log(`[Skip] Folder not found for unit: ${unitKey}`);
      continue;
    }
    
    console.log(`\n>>> Processing Unit: ${unitKey} (Folder: ${matchedFolder})`);
    
    let processedCount = 0;
    
    const tasks = [];
    for (let i = 1; i <= 20; i++) {
      const pid = String(i).padStart(3, '0');
      const hintFile = path.join(matchedFolder, `${pid}.json`);
      if (!fs.existsSync(hintFile)) continue;
      
      let data;
      try {
        const rawText = fs.readFileSync(hintFile, 'utf8');
        try {
          data = JSON.parse(rawText);
        } catch (e) {
          // Attempt self-healing for common backslash/unescaped character bugs
          const fixed = rawText
            .replace(/(?<!\\)\\\\(?=[tbfn])/g, '\\\\\\\\')
            .replace(/(?<!\\)\\(?!["\\\/bfnrtu\\])/g, '\\\\');
          data = JSON.parse(fixed);
        }
      } catch (err) {
        console.warn(`  - [Warning] Skipped invalid JSON for ${hintFile}: ${err.message}`);
        continue;
      }
      
      const narration = createNarration(data);
      if (!narration) continue;
      
      const remotePath = `${engUnitName}/${pid}.mp3`;
      tasks.push(async () => {
        const exists = await checkSupabaseExists(remotePath);
        if (exists) {
          console.log(`  - [SKIP] ${remotePath} already exists.`);
          return;
        }
        try {
          console.log(`  - Generating TTS for ${pid}...`);
          const buffer = await generateTTS(narration);
          await uploadToSupabase(buffer, remotePath);
          console.log(`    -> Uploaded to ${remotePath}`);
          processedCount++;
        } catch (err) {
          console.error(`    -> Error processing ${pid}:`, err.message);
        }
      });
    }

    // Run 5 tasks concurrently
    for (let i = 0; i < tasks.length; i += 5) {
      await Promise.all(tasks.slice(i, i + 5).map(t => t()));
      await new Promise(r => setTimeout(r, 1000)); // Delay between batches to respect rate limits
    }
    console.log(`<<< Completed Unit: ${unitKey} (Processed: ${processedCount}/20)`);
  }
  console.log('\n=== Bulk Generation Completed ===');
}

main().catch(console.error);
