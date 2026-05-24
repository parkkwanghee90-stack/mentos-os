// scripts/generate_gemini_math_sang_tts.cjs
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { execSync } = require('child_process');

dotenv.config();

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'math-tts';
const LOCAL_OUTPUT_DIR = path.join('public', 'audio', 'math_hints');

if (!GEMINI_API_KEY) {
  console.error('❌ Error: VITE_GEMINI_API_KEY is not defined in .env');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Supabase credentials are not defined in .env');
  process.exit(1);
}

if (!fs.existsSync(LOCAL_OUTPUT_DIR)) {
  fs.mkdirSync(LOCAL_OUTPUT_DIR, { recursive: true });
}

// Chapter specifications mapping for 수학 상
const CHAPTER_MAP = {
  gocha: {
    name: '고차방정식',
    stages: [
      { num: 2, localDir: '고차방정식2단계', remoteDir: 'higher_eq_s2', localAudioPrefix: 'hint_gocha_2_' },
      { num: 3, localDir: '고차방정식3단계', remoteDir: 'higher_eq_s3', localAudioPrefix: 'hint_gocha_3_' },
      { num: 4, localDir: '고차방정식4단계', remoteDir: 'higher_eq_s4', localAudioPrefix: 'hint_gocha_4_' }
    ]
  },
  linear_ineq: {
    name: '일차부등식',
    stages: [
      { num: 2, localDir: '일차부등식2단계', remoteDir: 'linear_ineq_s2', localAudioPrefix: 'hint_linear_2_' },
      { num: 3, localDir: '일차부등식3단계', remoteDir: 'linear_ineq_s3', localAudioPrefix: 'hint_linear_3_' },
      { num: 4, localDir: '일차부등식4단계', remoteDir: 'linear_ineq_s4', localAudioPrefix: 'hint_linear_4_' }
    ]
  },
  quad_ineq: {
    name: '이차부등식',
    stages: [
      { num: 2, localDir: '이차부등식2단계', remoteDir: 'quad_ineq_s2', localAudioPrefix: 'hint_quad_2_' },
      { num: 3, localDir: '이차부등식3단계', remoteDir: 'quad_ineq_s3', localAudioPrefix: 'hint_quad_3_' },
      { num: 4, localDir: '이차부등식4단계', remoteDir: 'quad_ineq_s4', localAudioPrefix: 'hint_quad_4_' }
    ]
  },
  cases: {
    name: '경우의수',
    stages: [
      { num: 2, localDir: '경우의수2단계', remoteDir: 'cases_s2', localAudioPrefix: 'hint_cases_2_' },
      { num: 3, localDir: '경우의수3단계', remoteDir: 'cases_s3', localAudioPrefix: 'hint_cases_3_' },
      { num: 4, localDir: '경우의수4단계', remoteDir: 'cases_s4', localAudioPrefix: 'hint_cases_4_' }
    ]
  },
  matrix: {
    name: '행렬',
    stages: [
      { num: 2, localDir: '행렬2단계', remoteDir: 'matrix_s2', localAudioPrefix: 'hint_matrix_2_' },
      { num: 3, localDir: '행렬3단계', remoteDir: 'matrix_s3', localAudioPrefix: 'hint_matrix_3_' },
      { num: 4, localDir: '행렬4단계', remoteDir: 'matrix_s4', localAudioPrefix: 'hint_matrix_4_' }
    ]
  },
  point: {
    name: '점과좌표',
    stages: [
      { num: 2, localDir: '점과좌표2단계', remoteDir: 'point_s2', localAudioPrefix: 'hint_point_2_' },
      { num: 3, localDir: '점과좌표3단계', remoteDir: 'point_s3', localAudioPrefix: 'hint_point_3_' },
      { num: 4, localDir: '점과좌표4단계', remoteDir: 'point_s4', localAudioPrefix: 'hint_point_4_' }
    ]
  },
  line: {
    name: '직선의방정식',
    stages: [
      { num: 2, localDir: '직선의방정식2단계', remoteDir: 'line_s2', localAudioPrefix: 'hint_line_2_' },
      { num: 3, localDir: '직선의방정식3단계', remoteDir: 'line_s3', localAudioPrefix: 'hint_line_3_' },
      { num: 4, localDir: '직선의방정식4단계', remoteDir: 'line_s4', localAudioPrefix: 'hint_line_4_' }
    ]
  },
  circle: {
    name: '원의방정식',
    stages: [
      { num: 2, localDir: '원의방정식2단계', remoteDir: 'circle_s2', localAudioPrefix: 'hint_circle_2_' },
      { num: 3, localDir: '원의방정식3단계', remoteDir: 'circle_s3', localAudioPrefix: 'hint_circle_3_' },
      { num: 4, localDir: '원의방정식4단계', remoteDir: 'circle_s4', localAudioPrefix: 'hint_circle_4_' }
    ]
  },
  shape_move: {
    name: '도형의이동',
    stages: [
      { num: 2, localDir: '도형의이동2단계', remoteDir: 'shape_move_s2', localAudioPrefix: 'hint_shape_move_2_' },
      { num: 3, localDir: '도형의이동3단계', remoteDir: 'shape_move_s3', localAudioPrefix: 'hint_shape_move_3_' },
      { num: 4, localDir: '도형의이동4단계', remoteDir: 'shape_move_s4', localAudioPrefix: 'hint_shape_move_4_' }
    ]
  }
};

// Latex plain translation
function latexToSpeech(text) {
  if (!text) return '';
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

// Narration text builder: EXCLUDES Calculation (A), only does pCBS
function createNarration(data) {
  let p = '', c = '', b = '', s = '';
  
  if (data.steps && Array.isArray(data.steps)) {
    for (const step of data.steps) {
      const label = (step.label || '').toUpperCase();
      const content = latexToSpeech(step.latex || step.text || step.content || '');
      if (label.includes('P') && label.includes(':')) p = content;
      else if (label.includes('C') && label.includes(':')) c = content;
      else if (label.includes('B') && label.includes(':')) b = content;
      else if (label.includes('S') && label.includes(':')) s = content;
    }
  }

  // Fallback to basic fields
  if (!p && data.P) p = latexToSpeech(data.P);
  if (!c && data.C) c = latexToSpeech(data.C);
  if (!b && data.B) b = latexToSpeech(data.B);
  if (!s && data.S) s = latexToSpeech(data.S);

  let script = '';
  if (p) script += `이 문제에서 구하는 것은, ${p}.\n`;
  if (c) script += `주어진 조건을 분석하면, ${c}.\n`;
  if (b) script += `여기서 꼭 알아야 하는 핵심 개념은, ${b}.\n`;
  if (s) script += `풀이 과정을 핵심 구조와 연관지어 분석해보면, ${s}.\n`;
  script += '나머지 세부 식 전개는 화면의 칠판 내용을 보면서 차근차근 직접 마무리해보세요.';
  
  return script.trim();
}

async function generateGeminiTTS(text, retries = 3) {
  const promptText = `너는 고등학생들의 수학 학습을 돕는 친절하고 활기찬 대학생 여자 선생님이야. 입력받은 한국어 수학 텍스트(수식 포함)를 친절하고 자연스러운 구어체로 상냥하게 읽어줘. 절대로 추가적인 인사말, 해설, 격려 등 잡담을 전혀 덧붙이지 말고, 오직 아래에 주어진 대본 텍스트 자체만 있는 그대로 읽어줘:

${text}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${GEMINI_API_KEY}`, {
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
        })
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

      return Buffer.from(audioPart.inlineData.data, 'base64');
    } catch (err) {
      console.warn(`⚠️ Gemini API attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

async function uploadToSupabase(buffer, remotePath, retries = 3) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${remotePath}`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'audio/mpeg',
          'x-upsert': 'true',
        },
        body: buffer,
      });

      if (!res.ok) {
        throw new Error(`Supabase upload failed: ${res.status} - ${await res.text()}`);
      }
      return;
    } catch (err) {
      console.warn(`⚠️ Supabase upload attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

async function processStage(stageSpec, force = false) {
  const { num, localDir, remoteDir, localAudioPrefix } = stageSpec;
  console.log(`\n======================================================`);
  console.log(`🔷 [Stage ${num}] Directory: "${localDir}" -> Supabase: "${remoteDir}"`);
  console.log(`======================================================`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 1; i <= 20; i++) {
    const pid = String(i).padStart(3, '0');
    const jsonPath = path.join('public', 'math_hints', localDir, `${pid}.json`);

    if (!fs.existsSync(jsonPath)) {
      console.warn(`⚠️ File missing: ${jsonPath} (skipping)`);
      continue;
    }

    const localFileName = `${localAudioPrefix}${String(i).padStart(2, '0')}.mp3`;
    const localFilePath = path.join(LOCAL_OUTPUT_DIR, localFileName);

    if (!force && fs.existsSync(localFilePath) && fs.statSync(localFilePath).size > 10240) {
      console.log(`⏭️ Skipping ${localDir}/${pid} (already exists, size: ${(fs.statSync(localFilePath).size / 1024).toFixed(1)} KB)`);
      successCount++;
      continue;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const narrationText = createNarration(data);

    if (!narrationText) {
      console.warn(`⚠️ No narration text generated for ${pid}`);
      continue;
    }

    console.log(`\n--- [${i}/20] Processing ${localDir}/${pid}.json ---`);
    console.log(`Script: "${narrationText.substring(0, 100)}..."`);

    try {
      // 1. Generate Voice Audio via Gemini 2.5 Voice API (Aoede)
      const rawAudioBuffer = await generateGeminiTTS(narrationText);
      console.log(`✅ Generated raw Gemini 2.5 PCM (${(rawAudioBuffer.length / 1024).toFixed(1)} KB)`);

      // 2. Decode raw PCM and encode to genuine MP3 via ffmpeg (iOS/Safari highly compatible)
      const tempPcmPath = path.resolve(LOCAL_OUTPUT_DIR, `temp_${localAudioPrefix}${pid}.pcm`);
      const tempMp3Path = path.resolve(LOCAL_OUTPUT_DIR, `temp_${localAudioPrefix}${pid}.mp3`);
      fs.writeFileSync(tempPcmPath, rawAudioBuffer);

      try {
        execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${tempPcmPath}" -codec:a libmp3lame -qscale:a 2 "${tempMp3Path}"`, { stdio: 'pipe' });
      } catch (err) {
        const stderr = err.stderr ? err.stderr.toString() : '';
        throw new Error(`ffmpeg conversion failed: ${err.message}\nStderr: ${stderr}`);
      }

      const mp3Buffer = fs.readFileSync(tempMp3Path);

      // Clean temp files
      try {
        fs.unlinkSync(tempPcmPath);
        fs.unlinkSync(tempMp3Path);
      } catch (e) {}

      // Size verification check (>10KB)
      if (mp3Buffer.length < 10240) {
        throw new Error(`Generated MP3 file is suspiciously small: ${mp3Buffer.length} bytes`);
      }

      console.log(`✅ Converted to genuine MP3 via ffmpeg (${(mp3Buffer.length / 1024).toFixed(1)} KB)`);

      // 3. Save locally
      fs.writeFileSync(localFilePath, mp3Buffer);
      console.log(`💾 Saved locally to: ${localFilePath}`);

      // 4. Upload to Supabase Storage math-tts bucket
      const remotePath = `${remoteDir}/${pid}.mp3`;
      await uploadToSupabase(mp3Buffer, remotePath);
      console.log(`☁️ Uploaded to Supabase: ${BUCKET}/${remotePath}`);

      successCount++;

      // Quota delay: 6.5 seconds delay keeps us safely under 10 RPM (RPM=9.2)
      await new Promise(resolve => setTimeout(resolve, 6500));

    } catch (err) {
      console.error(`❌ Failed to process ${pid}:`, err.message);
      failCount++;
    }
  }

  console.log(`\n🎉 Completed ${localDir}: Success: ${successCount}, Failures: ${failCount}`);
  return { successCount, failCount };
}

async function main() {
  const args = process.argv.slice(2);
  const chapterArg = args[0];
  const force = args.includes('--force');

  if (!chapterArg || !CHAPTER_MAP[chapterArg]) {
    console.error(`❌ Error: Please specify a valid chapter key.`);
    console.error(`Valid keys: ${Object.keys(CHAPTER_MAP).join(', ')}`);
    console.error(`Example: node scripts/generate_gemini_math_sang_tts.cjs gocha`);
    process.exit(1);
  }

  const spec = CHAPTER_MAP[chapterArg];
  console.log(`🚀 Starting batch voice generation for Chapter: "${spec.name}" (${chapterArg})`);

  let totalSuccess = 0;
  let totalFail = 0;

  for (const stageSpec of spec.stages) {
    // Check if the source folder exists
    const srcPath = path.join('public', 'math_hints', stageSpec.localDir);
    if (!fs.existsSync(srcPath)) {
      console.warn(`⚠️ Skipping stage ${stageSpec.num} because folder does not exist: ${srcPath}`);
      continue;
    }

    const result = await processStage(stageSpec, force);
    totalSuccess += result.successCount;
    totalFail += result.failCount;
  }


  console.log(`\n✨======================================================`);
  console.log(`🏆 Chapter "${spec.name}" batch process successfully finished!`);
  console.log(`   - Total Success: ${totalSuccess}`);
  console.log(`   - Total Failures: ${totalFail}`);
  console.log(`======================================================`);
}

main().catch(err => console.error('Fatal execution error:', err));
