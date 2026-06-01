const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const BASE_DIR = path.join(__dirname, '..');
const JSON_DIR = path.join(BASE_DIR, 'public/math_hints/항등식과나머지정리2단계');
const OUTPUT_DIR = path.join(BASE_DIR, 'public/audio/math_hints');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateGeminiTTS(filename, text) {
  const outputPath = path.join(OUTPUT_DIR, filename);
  
  // Gemini 2.0-flash API endpoint with Aoede Voice Configuration
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
  
  const payload = {
    contents: [
      {
        parts: [
          { text: text }
        ]
      }
    ],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Aoede" // 밝고 상냥한 여성 목소리 Aoede 적용
          }
        }
      }
    }
  };

  console.log(`🎙️ Gemini 2.5 (Aoede Voice) TTS 생성 중: ${filename}...`);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${err}`);
  }

  const result = await response.json();
  
  if (
    result.candidates &&
    result.candidates[0].content &&
    result.candidates[0].content.parts &&
    result.candidates[0].content.parts[0].inlineData
  ) {
    const b64Data = result.candidates[0].content.parts[0].inlineData.data;
    const buffer = Buffer.from(b64Data, 'base64');
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ 저장 완료: ${filename}`);
    return true;
  } else {
    throw new Error("Invalid API Response: Audio data missing in response candidates.");
  }
}

async function main() {
  if (!API_KEY) {
    console.error('❌ 에러: .env 파일에 VITE_GEMINI_API_KEY가 설정되어 있지 않습니다.');
    process.exit(1);
  }

  if (!fs.existsSync(JSON_DIR)) {
    console.error(`❌ 에러: JSON 폴더가 존재하지 않습니다: ${JSON_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(JSON_DIR).filter(f => f.endsWith('.json')).sort();
  console.log(`========================================================`);
  console.log(`🚀 Gemini 2.5 [Aoede] 나머지정리 2단계 TTS 생성 스케줄 시작 (총 ${files.length}개 파일)`);
  console.log(`========================================================\n`);

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const jsonPath = path.join(JSON_DIR, file);
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    const qNum = file.replace('.json', '');
    const filename = `hint_remain_2_${qNum}.mp3`;

    // Construct script based on P, C, B
    const script = `구하고자 하는 것은 ${data.P}입니다. 주어진 조건은 ${data.C}입니다. ${data.B}를 연결하는 것이 핵심입니다. 이 세 가지를 연결해서 직접 풀어보세요.`;

    try {
      await generateGeminiTTS(filename, script);
      successCount++;
      await sleep(1500); // 제미나이 레이트 리밋 방지를 위한 1.5초 대기
    } catch (e) {
      console.error(`❌ 실패: ${filename} - ${e.message}`);
      failCount++;
      await sleep(3000); // 실패 시 대기 시간 증가
    }
  }

  console.log(`\n========================================================`);
  console.log(`🎉 Gemini 2.5 [Aoede] 나머지정리 TTS 일괄 생성 완료!`);
  console.log(`   - 성공: ${successCount}건`);
  console.log(`   - 실패: ${failCount}건`);
  console.log(`========================================================\n`);
}

main().catch(console.error);
