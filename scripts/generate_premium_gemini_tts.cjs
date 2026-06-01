// scripts/generate_premium_gemini_tts.cjs
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { execSync } = require('child_process');

dotenv.config();

const { getSafePath } = require('../src/config/pathMapping.js');

// Support multiple API keys for pool rotation
const GEMINI_API_KEYS = [
  process.env.VITE_GEMINI_API_KEY,
  "AIzaSyATuwWx35ho0HovQ1915tY_tbvpzZAKlgw" // Secondary pool key from math_su1 script
].filter(Boolean);

let currentKeyIndex = 0;

function getCurrentKey() {
  return GEMINI_API_KEYS[currentKeyIndex];
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'mentos-assets'; // Supabase bucket for premium lecture audio (resolved via window.resolveAsset)
const LOCAL_OUTPUT_DIR = path.join('public', 'audio', 'premium_lectures');

if (GEMINI_API_KEYS.length === 0) {
  console.error('❌ Error: VITE_GEMINI_API_KEY is not defined in .env');
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Supabase URL or Service Role Key is not defined in .env');
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
      const currentKey = getCurrentKey();
      if (!currentKey) {
        throw new Error("No Gemini API keys available");
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${currentKey}`, {
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
        const errMsg = errorJson?.error?.message || `Gemini API HTTP ${response.status}`;
        
        // Handle rate limiting / quota exhaustion by rotating API keys
        if (response.status === 429 || errMsg.includes('quota') || errMsg.includes('QUOTA') || errMsg.includes('RESOURCE_EXHAUSTED')) {
          console.warn(`\n⚠️ API Key ${currentKeyIndex + 1}/${GEMINI_API_KEYS.length} exhausted. Rotating...`);
          if (currentKeyIndex < GEMINI_API_KEYS.length - 1) {
            currentKeyIndex++;
            console.log(`🔄 Rotated to Key ${currentKeyIndex + 1}/${GEMINI_API_KEYS.length}...`);
            attempt = 0; // Reset attempt counter for the new key
            continue;
          } else {
            console.error("❌ All Gemini API keys exhausted.");
          }
        }
        throw new Error(errMsg);
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
    if (!res.ok) return false;
    const info = await res.json().catch(() => null);
    if (!info) return false;

    // Verify it is a valid sized file
    return info.size && info.size > 10240;
  } catch (e) {
    return false;
  }
}

async function uploadToSupabase(buffer, remotePath, retries = 3) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
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
        body: buffer
      });
      if (!res.ok) {
        throw new Error(`Supabase upload error: ${res.status} - ${await res.text()}`);
      }
      return;
    } catch (err) {
      console.warn(`⚠️ Supabase upload attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

async function main() {
  console.log('🎙️ === Premium AI Lecture Voice Generation: Gemini 3.1 & ffmpeg ===\n');

  const force = process.argv.includes('--force');
  
  // Custom arguments parsing
  let targetLecture = null;
  const lectureArgIndex = process.argv.indexOf('--lecture');
  if (lectureArgIndex !== -1 && process.argv[lectureArgIndex + 1]) {
    targetLecture = process.argv[lectureArgIndex + 1];
    console.log(`🎯 Targeting specific lecture: "${targetLecture}"`);
  }

  let limit = 0;
  const limitArgIndex = process.argv.indexOf('--limit');
  if (limitArgIndex !== -1 && process.argv[limitArgIndex + 1]) {
    limit = parseInt(process.argv[limitArgIndex + 1], 10) || 0;
    console.log(`⏱️ Limit set to first ${limit} lectures.`);
  }

  const lecturesDir = 'public/premium_lectures';
  if (!fs.existsSync(lecturesDir)) {
    console.error(`❌ Premium lectures directory not found: ${lecturesDir}`);
    process.exit(1);
  }

  let files = fs.readdirSync(lecturesDir).filter(f => f.endsWith('.json'));
  
  if (targetLecture) {
    files = files.filter(f => f.includes(targetLecture));
    if (files.length === 0) {
      console.error(`❌ No lecture files matching "${targetLecture}" found.`);
      process.exit(1);
    }
  }

  console.log(`- Found ${files.length} premium lectures to process.`);
  
  if (limit > 0) {
    files = files.slice(0, limit);
  }

  let processedCount = 0;

  for (const file of files) {
    const lectureId = path.basename(file, '.json');
    const filePath = path.join(lecturesDir, file);
    
    console.log(`\n>>> Processing Lecture [${processedCount + 1}/${files.length}]: [${lectureId}]`);
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
      
      // Calculate correct safe production path using getSafePath
      const rawRemotePath = `audio/premium_lectures/${lectureId}/step_${stepNum}.mp3`;
      const remotePath = getSafePath(rawRemotePath);

      // Check local cache and Supabase status
      const existsLocally = fs.existsSync(localFilePath) && fs.statSync(localFilePath).size > 10240;
      const existsRemotely = await checkSupabaseExists(remotePath);

      if (!force && existsLocally && existsRemotely) {
        console.log(`  - Step ${stepNum}: Already generated & uploaded. Skipped.`);
        continue;
      }

      console.log(`  - Step ${stepNum}: Processing Gemini 3.1 Audio...`);
      console.log(`    Script: "${cleanedText.substring(0, 60)}..."`);

      try {
        let mp3Buffer = null;

        if (!force && existsLocally) {
          mp3Buffer = fs.readFileSync(localFilePath);
          console.log(`    -> Loaded from local cache.`);
        } else {
          // 1. Generate Voice Audio via Gemini 3.1 Voice API (Aoede)
          const rawAudioBuffer = await generateGeminiTTS(cleanedText);
          console.log(`    -> Generated raw Gemini Voice (${(rawAudioBuffer.length / 1024).toFixed(1)} KB)`);

          // 2. Decode raw PCM and encode to genuine MP3 via ffmpeg (perfect browser/mobile compatibility)
          const tempPcmPath = path.resolve(lectureOutputDir, `temp_${stepNum}.pcm`);
          const tempMp3Path = path.resolve(lectureOutputDir, `temp_${stepNum}.mp3`);
          fs.writeFileSync(tempPcmPath, rawAudioBuffer);

          try {
            execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${tempPcmPath}" -codec:a libmp3lame -qscale:a 2 "${tempMp3Path}"`, { stdio: 'pipe' });
            mp3Buffer = fs.readFileSync(tempMp3Path);
          } catch (err) {
            const stderr = err.stderr ? err.stderr.toString() : '';
            throw new Error(`ffmpeg conversion failed: ${err.message}\nStderr: ${stderr}`);
          } finally {
            try {
              if (fs.existsSync(tempPcmPath)) fs.unlinkSync(tempPcmPath);
              if (fs.existsSync(tempMp3Path)) fs.unlinkSync(tempMp3Path);
            } catch (e) {}
          }

          // Save local cache
          fs.writeFileSync(localFilePath, mp3Buffer);
          console.log(`    -> Saved genuine MP3 local cache.`);
        }

        // 3. Upload to Supabase storage if missing or force enabled
        if (force || !existsRemotely) {
          await uploadToSupabase(mp3Buffer, remotePath);
          console.log(`    -> Uploaded to Supabase storage [${BUCKET}/${remotePath}].`);
        }
      } catch (err) {
        console.error(`  ❌ Failed to generate/upload audio for Step ${stepNum}: ${err.message}`);
      }

      // Add a slight delay to respect API rate limits (8.5s delay keeps us safely under 7 RPM)
      await new Promise(resolve => setTimeout(resolve, 8500));
    }
    processedCount++;
  }

  console.log('\n🎉 === Premium Lecture Voice Generation Completed successfully! ===');
}

main().catch(console.error);
