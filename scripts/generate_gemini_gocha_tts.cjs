// scripts/generate_gemini_gocha_tts.cjs
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { execSync } = require('child_process');

dotenv.config();

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'math-tts';
const UNIT_KR = '고차방정식2단계';
const UNIT_EN = 'higher_eq_s2';
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

// LaTeX to plain speech-friendly Korean
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

function createNarration(data) {
  let p = '', c = '', b = '', s = '', a = '';
  
  if (data.steps && Array.isArray(data.steps)) {
    for (const step of data.steps) {
      const label = (step.label || '').toUpperCase();
      const content = latexToSpeech(step.latex || step.text || step.content || '');
      if (label.includes('P') && label.includes(':')) p = content;
      else if (label.includes('C') && label.includes(':')) c = content;
      else if (label.includes('B') && label.includes(':')) b = content;
      else if (label.includes('S') && label.includes(':')) s = content;
      else if (label.includes('A') && label.includes(':')) a = content;
    }
  }

  // Fallback to basic fields
  if (!p && data.P) p = latexToSpeech(data.P);
  if (!c && data.C) c = latexToSpeech(data.C);
  if (!b && data.B) b = latexToSpeech(data.B);
  if (!s && data.S) s = latexToSpeech(data.S);
  if (!a && data.A) a = latexToSpeech(data.A);

  let script = '';
  if (p) script += `이 문제에서 구하는 것은, ${p}.\n`;
  if (c) script += `주어진 조건을 분석하면, ${c}.\n`;
  if (b) script += `여기서 꼭 알아야 하는 핵심 개념은, ${b}.\n`;
  if (s) script += `풀이 과정을 핵심 구조와 연관지어 분석해보면, ${s}.\n`;
  if (a) script += `계산을 적용하여 최종 정답을 도출하면, ${a}.\n`;
  script += '나머지 세부 식 전개는 화면의 칠판 내용을 보면서 차근차근 직접 마무리해보세요.';
  
  return script.trim();
}

async function generateGeminiTTS(text) {
  const promptText = `너는 고등학생들의 수학 학습을 돕는 친절하고 활기찬 대학생 여자 선생님이야. 입력받은 한국어 수학 텍스트(수식 포함)를 친절하고 자연스러운 구어체로 상냥하게 읽어줘. 절대로 추가적인 인사말, 해설, 격려 등 잡담을 전혀 덧붙이지 말고, 오직 아래에 주어진 대본 텍스트 자체만 있는 그대로 읽어줘:

${text}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: promptText
        }]
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Aoede"
            }
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
}

async function uploadToSupabase(buffer, remotePath) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${remotePath}`;
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
    throw new Error(`Supabase Upload Error: ${res.status} - ${await res.text()}`);
  }
}

async function main() {
  console.log(`🚀 Starting Gemini 2.5 Voice Generation for ${UNIT_KR} (001~020)`);
  
  for (let i = 1; i <= 20; i++) {
    const pid = String(i).padStart(3, '0');
    const jsonPath = path.join('public', 'math_hints', UNIT_KR, `${pid}.json`);
    
    if (!fs.existsSync(jsonPath)) {
      console.warn(`⚠️ JSON file missing: ${jsonPath}`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const narrationText = createNarration(data);

    if (!narrationText) {
      console.warn(`⚠️ No narration text could be generated for ${pid}`);
      continue;
    }

    console.log(`\n───────────────────────────────────────`);
    console.log(`[${i}/20] Processing ${pid}.json...`);
    console.log(`Script: "${narrationText.substring(0, 120)}..."`);

    try {
      // 1. Generate Voice Audio via Gemini 2.5 Voice API (Aoede)
      const rawAudioBuffer = await generateGeminiTTS(narrationText);
      console.log(`✅ Generated raw Gemini 2.5 Voice (${(rawAudioBuffer.length / 1024).toFixed(1)} KB)`);

      // 1.5. Convert Raw PCM 16-bit 24kHz Mono to Genuine MP3 via ffmpeg for perfect compatibility across web, mobile, iOS, and Safari
      const tempPcmPath = path.resolve(LOCAL_OUTPUT_DIR, `temp_${pid}.pcm`);
      const tempMp3Path = path.resolve(LOCAL_OUTPUT_DIR, `temp_${pid}.mp3`);
      fs.writeFileSync(tempPcmPath, rawAudioBuffer);
      
      try {
        execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${tempPcmPath}" -codec:a libmp3lame -qscale:a 2 "${tempMp3Path}"`, { stdio: 'pipe' });
      } catch (err) {
        const stderr = err.stderr ? err.stderr.toString() : '';
        throw new Error(`ffmpeg conversion failed: ${err.message}\nStderr: ${stderr}`);
      }
      
      const mp3Buffer = fs.readFileSync(tempMp3Path);
      
      // Cleanup temp files
      try {
        fs.unlinkSync(tempPcmPath);
        fs.unlinkSync(tempMp3Path);
      } catch (e) {}

      console.log(`✅ Converted to genuine MP3 via ffmpeg (${(mp3Buffer.length / 1024).toFixed(1)} KB)`);

      // 2. Save locally for fallback playing
      const localFileName = `hint_gocha_2_${String(i).padStart(2, '0')}.mp3`;
      const localFilePath = path.join(LOCAL_OUTPUT_DIR, localFileName);
      fs.writeFileSync(localFilePath, mp3Buffer);
      console.log(`💾 Saved locally to: ${localFilePath}`);

      // 3. Upload to Supabase Storage math-tts bucket
      const remotePath = `${UNIT_EN}/${pid}.mp3`;
      await uploadToSupabase(mp3Buffer, remotePath);
      console.log(`☁️ Uploaded to Supabase: ${BUCKET}/${remotePath}`);

      // Small delay to prevent API rate limits (6.5s delay fits under 10 RPM)
      await new Promise(resolve => setTimeout(resolve, 6500));

    } catch (err) {
      console.error(`❌ Failed to process ${pid}:`, err.message);
    }
  }

  console.log(`\n✨ Gemini 2.5 Voice Generation & Upload successfully completed!`);
}

main().catch(err => console.error('Fatal execution error:', err));
