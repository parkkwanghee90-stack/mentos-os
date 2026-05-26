// scripts/generate_premium_gemini_tts.cjs
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'premium-tts'; // Supabase bucket for premium lecture audio
const LOCAL_OUTPUT_DIR = path.join('public', 'audio', 'premium_lectures');

if (!GEMINI_API_KEY) {
  console.error('❌ Error: VITE_GEMINI_API_KEY is not defined in .env');
  process.exit(1);
}

if (!fs.existsSync(LOCAL_OUTPUT_DIR)) {
  fs.mkdirSync(LOCAL_OUTPUT_DIR, { recursive: true });
}

// Clean up narration text from markdown/HTML/KaTeX tags for smooth pronunciation
function cleanNarration(text) {
  if (!text) return '';
  return text
    .replace(/<\/?(blue|green|yellow|red)>/g, '') // Remove color tags
    .replace(/\$([^$]*)\$/g, '$1') // Strip dollar signs from inline math
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$2 분의 $1') // Fractions
    .replace(/\\sqrt\{([^}]*)\}/g, '루트 $1') // Square root
    .replace(/\\pm/g, '플러스 마이너스')
    .replace(/\\times/g, ' 곱하기 ')
    .replace(/\\div/g, ' 나누기 ')
    .replace(/\\leq/g, ' 이하')
    .replace(/\\geq/g, ' 이상')
    .replace(/\\neq/g, ' 같지 않음')
    .replace(/\\cdot/g, ' 곱하기 ')
    .replace(/\\alpha/g, '알파')
    .replace(/\\beta/g, '베타')
    .replace(/_n\\mathrm\{P\}_r/g, 'n 피 알')
    .replace(/_n\\mathrm\{C\}_r/g, 'n 시 알')
    .replace(/\^/g, '') // Remove exponent symbol
    .replace(/\\quad/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
                prebuiltVoiceConfig: { voiceName: "Aoede" } // Beautiful, natural female narrator
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

async function checkSupabaseExists(remotePath) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return false;
  const url = `${SUPABASE_URL}/storage/v1/object/info/public/${BUCKET}/${remotePath}`;
  try {
    const res = await fetch(url);
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function uploadToSupabase(buffer, remotePath) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${remotePath}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'audio/mpeg',
      'x-upsert': 'true',
    },
    body: buffer
  });
  if (!res.ok) {
    throw new Error(`Upload to Supabase failed: ${res.status} - ${await res.text()}`);
  }
}

async function main() {
  console.log('🎙️ === Premium AI Lecture Voice Generation: Gemini 3.1 ===\n');

  const lecturesDir = 'public/premium_lectures';
  if (!fs.existsSync(lecturesDir)) {
    console.error(`❌ Premium lectures directory not found: ${lecturesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(lecturesDir).filter(f => f.endsWith('.json'));
  console.log(`- Found ${files.length} premium lectures to process.`);

  for (const file of files) {
    const lectureId = path.basename(file, '.json');
    const filePath = path.join(lecturesDir, file);
    
    console.log(`\n>>> Processing Lecture: [${lectureId}]`);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`  - Failed to parse JSON file: ${file} -> ${e.message}`);
      continue;
    }

    if (!data.steps || !Array.isArray(data.steps)) {
      console.log(`  - Skipping: No steps array in ${file}`);
      continue;
    }

    const lectureOutputDir = path.join(LOCAL_OUTPUT_DIR, lectureId);
    if (!fs.existsSync(lectureOutputDir)) {
      fs.mkdirSync(lectureOutputDir, { recursive: true });
    }

    for (const step of data.steps) {
      const stepNum = step.step;
      const narrationText = step.narration;

      if (!narrationText) {
        console.log(`  - Step ${stepNum}: No narration text. Skipped.`);
        continue;
      }

      const cleanedText = cleanNarration(narrationText);
      const localFileName = `step_${stepNum}.mp3`;
      const localFilePath = path.join(lectureOutputDir, localFileName);
      const remotePath = `${lectureId}/step_${stepNum}.mp3`;

      // 1. Check local cache and Supabase status
      const existsLocally = fs.existsSync(localFilePath);
      const existsRemotely = await checkSupabaseExists(remotePath);

      if (existsLocally && existsRemotely) {
        console.log(`  - Step ${stepNum}: Already generated & uploaded. Skipped.`);
        continue;
      }

      console.log(`  - Step ${stepNum}: Generating Gemini 3.1 Audio...`);
      console.log(`    Script: "${cleanedText.substring(0, 60)}..."`);

      try {
        let audioBuffer;
        if (existsLocally) {
          audioBuffer = fs.readFileSync(localFilePath);
          console.log(`    -> Loaded from local cache.`);
        } else {
          audioBuffer = await generateGeminiTTS(cleanedText);
          fs.writeFileSync(localFilePath, audioBuffer);
          console.log(`    -> Saved local cache.`);
        }

        if (!existsRemotely) {
          await uploadToSupabase(audioBuffer, remotePath);
          console.log(`    -> Uploaded to Supabase storage [${BUCKET}/${remotePath}].`);
        }
      } catch (err) {
        console.error(`  ❌ Failed to generate/upload audio for Step ${stepNum}: ${err.message}`);
      }

      // Add a slight delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n🎉 === Premium Lecture Voice Generation Completed successfully! ===');
}

main().catch(console.error);
