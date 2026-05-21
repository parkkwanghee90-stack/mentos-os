// TTS 재생성 - PCBS + 마무리 멘트, 느린 속도, 자연스러운 나레이션
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'math-tts';
const VOICE = 'nova';
const UNIT_KR = '고차방정식2단계';
const UNIT_EN = 'higher_order_eq_step2';

// LaTeX → 읽기 좋은 한국어
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

// PCBS 나레이션 생성 (자연스러운 문장 + 마무리)
function createNarration(data) {
  let p = '', c = '', b = '', s = '';

  if (data.steps && Array.isArray(data.steps)) {
    for (const step of data.steps) {
      const label = (step.label || '').toUpperCase();
      const content = latexToSpeech(step.latex || step.text || step.content || step.formula_raw || '');
      if (label.includes('P') && label.includes(':')) p = content;
      else if (label.includes('C') && label.includes(':')) c = content;
      else if (label.includes('B') && label.includes(':')) b = content;
      else if (label.includes('S') && label.includes(':')) s = content;
    }
  }
  
  // 직접 키가 있는 경우
  if (!p && data.P) p = latexToSpeech(data.P);
  if (!c && data.C) c = latexToSpeech(data.C);
  if (!b && data.B) b = latexToSpeech(data.B);
  if (!s && data.S) s = latexToSpeech(data.S);

  if (!p && !c && !b) return null;

  // 자연스러운 강의체 나레이션
  let script = '';
  if (p) script += `이 문제에서 구하는 것은, ${p}.\n`;
  if (c) script += `주어진 조건을 정리하면, ${c}.\n`;
  if (b) script += `여기서 필요한 개념은, ${b}.\n`;
  if (s) script += `풀이 구조를 살펴보면, ${s}.\n`;
  script += '계산 과정은 아래에 정리되어 있으니, 직접 풀어보세요.';
  
  return script;
}

async function generateTTS(text, outputPath) {
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
  });
  if (!res.ok) throw new Error(`TTS Error: ${res.status} - ${await res.text()}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  return buffer;
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
  if (!res.ok) throw new Error(`Upload Error: ${res.status} - ${await res.text()}`);
}

async function main() {
  const tmpDir = 'scripts/tts_temp';
  fs.mkdirSync(tmpDir, { recursive: true });

  console.log('=== TTS 재생성: ' + UNIT_KR + ' (001~010) ===');
  console.log('모델: tts-1-hd, 음성: nova, 속도: 0.9');
  console.log('내용: PCBS + "계산은 아래에 있으니 직접 풀어보세요"\n');

  for (let i = 1; i <= 10; i++) {
    const pid = String(i).padStart(3, '0');
    const hintFile = `public/math_hints/${UNIT_KR}/${pid}.json`;
    if (!fs.existsSync(hintFile)) { console.log(`${pid}: 파일 없음`); continue; }

    const data = JSON.parse(fs.readFileSync(hintFile, 'utf8'));
    const narration = createNarration(data);
    if (!narration) { console.log(`${pid}: PCBS 없음`); continue; }

    console.log(`${pid}:`);
    console.log(`  스크립트: "${narration.substring(0, 100)}..."`);

    // TTS 생성 (기존 캐시 무시, 새로 생성)
    const tmpFile = path.join(tmpDir, `${pid}.mp3`);
    const buffer = await generateTTS(narration, tmpFile);
    console.log(`  → MP3: ${(buffer.length/1024).toFixed(1)}KB`);

    // Supabase 업로드 (덮어쓰기)
    const remotePath = `${UNIT_EN}/${pid}.mp3`;
    await uploadToSupabase(buffer, remotePath);
    console.log(`  → 업로드 완료`);

    await new Promise(r => setTimeout(r, 800));
  }

  console.log('\n=== 완료 ===');
  console.log('테스트 URL:', SUPABASE_URL + '/storage/v1/object/public/' + BUCKET + '/' + UNIT_EN + '/001.mp3');
}

main().catch(e => console.error('Error:', e));
