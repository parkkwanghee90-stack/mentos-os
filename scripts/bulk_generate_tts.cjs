// bulk_generate_tts.cjs
const fs = require('fs');
const path = require('path');
require('dotenv').config({ override: true });

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
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
    .replace(/=/g, ' 은 ')
    .replace(/\+/g, ' 플러스 ')
    .replace(/-(?!\d)/g, ' 마이너스 ')
    .replace(/a/gi, ' 에이 ')
    .replace(/b/gi, ' 비 ')
    .replace(/x/gi, ' 엑스 ')
    .replace(/y/gi, ' 와이 ')
    .replace(/z/gi, ' 제트 ')
    .replace(/k/gi, ' 케이 ')
    .replace(/n/gi, ' 엔 ')
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract PCBS text and format the narration script
function createNarration(data) {
  let p = '', c = '', b = '', s = '';

  if (data.steps && Array.isArray(data.steps)) {
    for (const step of data.steps) {
      const label = (step.label || step.label_text || '').toUpperCase();
      const content = latexToSpeech(step.latex || step.text || step.content || step.formula_raw || '');
      if (!content) continue;

      if (label.includes('P') || label.includes('문제에서 구하는 것') || label.includes('문제 분석') || label.includes('과정 1') || label.includes('과정1')) {
        if (!p) p = content;
      } else if (label.includes('C') || label.includes('조건/단서') || label.includes('개념 확인') || label.includes('조건 정리') || label.includes('과정 2') || label.includes('과정2')) {
        if (!c) c = content;
      } else if (label.includes('B') || label.includes('배경개념') || label.includes('배경 개념') || label.includes('과정 3') || label.includes('과정3')) {
        if (!b) b = content;
      } else if (label.includes('S') || label.includes('식 변형') || label.includes('구조 분석') || label.includes('풀이 전개') || label.includes('과정 4') || label.includes('과정4')) {
        if (!s) s = content;
      }
    }
  }
  
  if (!p && data.P) p = latexToSpeech(data.P);
  if (!c && data.C) c = latexToSpeech(data.C);
  if (!b && data.B) b = latexToSpeech(data.B);
  if (!s && data.S) s = latexToSpeech(data.S);

  // If we still don't have p, c, b, let's use the first 4 steps as P, C, B, S
  if (!p && !c && !b && data.steps && Array.isArray(data.steps) && data.steps.length >= 2) {
    const validSteps = data.steps.filter(st => st.latex || st.text || st.content || st.formula_raw);
    if (validSteps[0]) p = latexToSpeech(validSteps[0].latex || validSteps[0].text || validSteps[0].content || validSteps[0].formula_raw || '');
    if (validSteps[1]) c = latexToSpeech(validSteps[1].latex || validSteps[1].text || validSteps[1].content || validSteps[1].formula_raw || '');
    if (validSteps[2]) b = latexToSpeech(validSteps[2].latex || validSteps[2].text || validSteps[2].content || validSteps[2].formula_raw || '');
    if (validSteps[3]) s = latexToSpeech(validSteps[3].latex || validSteps[3].text || validSteps[3].content || validSteps[3].formula_raw || '');
  }

  if (!p && !c && !b) return null;

  let script = '';
  if (p) script += `이 문제에서 구하는 것은, ${p}.\n`;
  if (c) script += `주어진 조건을 정리하면, ${c}.\n`;
  if (b) script += `여기서 필요한 개념은, ${b}.\n`;
  script += '계산 과정은 아래에 정리되어 있으니, 직접 풀어보세요.';
  
  // 전체 대본이 600자를 넘을 경우, 음성 모델의 안정성을 위해 뒤를 안전하게 끊어줍니다.
  if (script.length > 600) {
    script = script.substring(0, 580) + '... 이하 계산 과정은 아래를 참고하여 직접 풀어보세요.';
  }
  
  return script;
}


async function generateTTS(text, retries = 3) {
  const promptText = `너는 고등학생들의 수학 학습을 돕는 친절하고 활기찬 대학생 여자 선생님이야. 입력받은 한국어 수학 텍스트(수식 포함)를 친절하고 자연스러운 구어체로 상냥하게 읽어줘. 절대로 추가적인 인사말, 해설, 격려 등 잡담을 전혀 덧붙이지 말고, 오직 아래에 주어진 대본 텍스트 자체만 있는 그대로 읽어줘:

${text}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "Aoede" }
              }
            }
          }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson?.error?.message || `Gemini API HTTP ${response.status}`);
      }

      const data = await response.json();
      const audioPart = data.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

      if (!audioPart || !audioPart.inlineData || !audioPart.inlineData.data) {
        throw new Error("No audio data returned in Gemini response JSON");
      }

      const rawPcm = Buffer.from(audioPart.inlineData.data, 'base64');
      
      // Convert PCM to MP3 using ffmpeg
      const { execSync } = require('child_process');
      const tempPcm = path.join('scratch', `temp_${Date.now()}_${Math.random().toString(36).substring(7)}.pcm`);
      const tempMp3 = tempPcm.replace('.pcm', '.mp3');
      
      fs.writeFileSync(tempPcm, rawPcm);
      try {
        execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${tempPcm}" -codec:a libmp3lame -qscale:a 2 "${tempMp3}"`, { stdio: 'pipe' });
        const mp3Buffer = fs.readFileSync(tempMp3);
        return mp3Buffer;
      } finally {
        try {
          if (fs.existsSync(tempPcm)) fs.unlinkSync(tempPcm);
          if (fs.existsSync(tempMp3)) fs.unlinkSync(tempMp3);
        } catch (e) {}
      }
    } catch (err) {
      console.warn(`⚠️ Gemini API attempt ${attempt} failed inside bulk generator: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(resolve => setTimeout(resolve, 3000));
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

async function checkSupabaseExists(remotePath) {
  const url = `${SUPABASE_URL}/storage/v1/object/info/public/${BUCKET}/${remotePath}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return false;
    const info = await res.json().catch(() => null);
    if (!info) return false;

    // Check if the file was created or updated today (2026-05-24 or later), which guarantees it is Gemini 3.1
    const dateStr = info.created_at || info.updated_at || '';
    const isGemini31 = dateStr && new Date(dateStr) >= new Date('2026-05-24T00:00:00Z');
    return isGemini31;
  } catch (e) {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function uploadToSupabase(buffer, remotePath) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${remotePath}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
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
  
  // Filter for '수학상', '수학1', '확통', '미적분'
  const targetKeywords = [
    // 수학상
    '다항식', '나머지정리', '인수분해', '복소수', '이차방정식', '이차함수', '여러가지방정식', '고차방정식', '일차부등식', '이차부등식', '점과좌표', '직선의방정식', '원의방정식', '도형의이동',
    // 수학1
    '지수', '로그', '지수함수', '로그함수', '삼각함수', '등차', '등비', '시그마', '여러가지수열', '귀납', '수열의합',
    // 확통
    '경우의수', '순열', '조합', '이항정리', '확률', '덧셈정리', '조건부', '독립시행', '이산확률', '연속확률', '정규분포', '통계',
    // 미적분 (신규 보강)
    '극한', '급수', '미분법', '적분', '미적분'
  ];
  
  allUnits = allUnits.filter(k => {
    const clean = k.replace(/\s+/g, '');
    if (clean.includes('다항식')) return false; // 다항식 단원은 이미 완벽 완료되었으므로 스캔 대상에서 전면 제외
    return targetKeywords.some(w => clean.includes(w));
  });

  // --- [사용자 지시: 과목별 완벽 우선순위 정렬 시스템 탑재] ---
  // 순서: 고차방정식 -> 일차부등식 -> 이차부등식 -> 행렬 -> 경우의수 -> 점과좌표 -> 직선의방정식 -> 원의방정식 -> 도형의이동
  function getSubjectWeight(unitKey) {
    const clean = unitKey.replace(/\s+/g, '');
    
    // 1. 수학상 단원별 정밀 마이크로 우선순위 매핑
    if (clean.includes('고차방정식')) return 1.01;
    if (clean.includes('일차부등식')) return 1.02;
    if (clean.includes('이차부등식')) return 1.03;
    if (clean.includes('행렬')) return 1.04;
    if (clean.includes('경우의수') || clean.includes('순열') || clean.includes('조합')) {
      // '경우의수' 단원은 유저가 점과좌표 앞에 놓기를 희망하므로 1.05를 배정
      return 1.05;
    }
    if (clean.includes('점과좌표')) return 1.06;
    if (clean.includes('직선의방정식')) return 1.07;
    if (clean.includes('원의방정식')) return 1.08;
    if (clean.includes('도형의이동')) return 1.09;

    // 수학상 기타 앞단 단원들 (다항식, 나머지정리, 인수분해, 복소수 등)
    const mathSangFront = ['다항식', '나머지정리', '인수분해', '복소수', '이차방정식', '이차함수', '여러가지방정식'];
    if (mathSangFront.some(w => clean.includes(w))) return 1.00;

    // 2. 수학1 (2순위)
    const math1 = ['지수', '로그', '지수함수', '로그함수', '삼각함수', '등차', '등비', '시그마', '여러가지수열', '귀납', '수열의합'];
    if (math1.some(w => clean.includes(w))) return 2.0;

    // 3. 수학2 (3순위)
    if (clean.includes('미적분')) return 5.0; // 미적분의 도함수활용/정적분은 5순위로 양보
    const math2 = ['함수의극한', '함수의연속', '미분계수', '도함수', '미분의활용', '부정적분', '정적분', '정적분의활용'];
    if (math2.some(w => clean.includes(w))) return 3.0;

    // 4. 확률과 통계 (4순위)
    const stats = ['경우의수', '순열', '조합', '이항정리', '확률', '덧셈정리', '조건부', '독립시행', '이산확률', '연속확률', '정규분포', '표본평균', '통계'];
    if (stats.some(w => clean.includes(w))) return 4.0;

    // 5. 미적분 (5순위)
    const calculus = ['극한', '급수', '미분법', '적분', '미적분'];
    if (calculus.some(w => clean.includes(w))) return 5.0;

    return 9.0; // 기타
  }

  // 정밀 가중치 오름차순 정렬
  allUnits.sort((a, b) => getSubjectWeight(a) - getSubjectWeight(b));

  console.log(`\n=== Filtering & Subject Sorting Applied: Target Units = ${allUnits.length} ===\n`);
  allUnits.forEach((u, idx) => {
    console.log(`  [Order ${idx+1}] Weight: ${getSubjectWeight(u)} -> ${u}`);
  });
  
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
    if (!fs.existsSync(matchedFolder)) {
      console.warn(`  - [Warning] Directory ${matchedFolder} does not exist.`);
      continue;
    }
    const files = fs.readdirSync(matchedFolder)
      .filter(f => f.endsWith('.json'))
      .filter(f => {
        const num = parseInt(f.replace('.json', ''), 10) || 0;
        return num >= 1 && num <= 20;
      });
    // Sort files numerically by filename (e.g. "001.json", "002.json")
    files.sort((a, b) => {
      const numA = parseInt(a.replace('.json', ''), 10) || 0;
      const numB = parseInt(b.replace('.json', ''), 10) || 0;
      return numA - numB;
    });

    for (const file of files) {
      const pid = file.replace('.json', '');
      const hintFile = path.join(matchedFolder, file);
      
      let data;
      try {
        const rawText = fs.readFileSync(hintFile, 'utf8');
        try {
          data = JSON.parse(rawText);
        } catch (e) {
          // Attempt self-healing for common backslash/unescaped character bugs
          const fixed = rawText
            .replace(/(?<!\\)\\\\(?=[tbfn])/g, '\\\\\\\\')
            .replace(/(?<!\\)\\\/(?!["\\\/bfnrtu\\])/g, '\\\\'); // fix slash/backslash
          data = JSON.parse(fixed);
        }
      } catch (err) {
        console.warn(`  - [Warning] Skipped invalid JSON for ${hintFile}: ${err.message}`);
        continue;
      }
      
      const narration = createNarration(data);
      if (!narration) {
        console.warn(`  - [Warning] Failed to construct narration for ${hintFile}. Skipped.`);
        continue;
      }
      
      const remotePath = `${engUnitName}/${pid}.mp3`;
      const forceUpdate = process.argv.includes('--force');
      tasks.push(async () => {
        if (!forceUpdate) {
          const exists = await checkSupabaseExists(remotePath);
          if (exists) {
            console.log(`  - [SKIP] ${remotePath} already exists. (Use --force to overwrite)`);
            return;
          }
        } else {
          console.log(`  - [FORCE] Overwriting old file: ${remotePath}`);
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

    // Run tasks sequentially to avoid API rate limits and free tier expiration blocks
    for (let i = 0; i < tasks.length; i++) {
      await tasks[i]();
      await new Promise(r => setTimeout(r, 3500)); // Safer 3.5s delay between requests
    }
    console.log(`<<< Completed Unit: ${unitKey} (Processed: ${processedCount}/20)`);
  }
  console.log('\n=== Bulk Generation Completed ===');
}

main().catch(console.error);
