/**
 * gen_avs_tts.cjs — AVS 해설 음성을 Gemini 2.5 TTS로 사전 생성 → mp3 → Supabase 업로드.
 * 정책: Gemini 2.5 전용. 하루 quota(429) 도달 시 중단(다음날 이어서 재실행 — 진행상황 저장).
 *
 * 사용: node scripts/gen_avs_tts.cjs <course: go2|naesin> [maxCount]
 * 저장: Supabase mentos-assets/avs_tts/<course>/<id>.mp3 (공개)
 * 진행: scripts/tts_progress_<course>.json (완료 id 목록)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const env = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const GKEY = (env.match(/VITE_GEMINI_API_KEY=(.*)/) || [])[1]?.trim().replace(/["']/g, '');
const SUPA_URL = (env.match(/VITE_SUPABASE_URL=(.*)/) || [])[1]?.trim().replace(/["']/g, '');
const SKEY = (env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/) || [])[1]?.trim().replace(/["']/g, '');

const course = process.argv[2] || 'go2';
const MAX = parseInt(process.argv[3] || '100000', 10);
const dataFile = course === 'naesin' ? 'naesin_full.json' : 'go2_full.json';
const PROG = path.join(__dirname, `tts_progress_${course}.json`);
// TTS 모델: gemini-2.5-flash-preview-tts 사용 중지 → gemini-3.1-flash-tts-preview (200+오디오 정상 확인됨)
const TTS_MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';

// ── 내레이션 정리 (앱 cleanForSpeech 이식) ──
function cleanForSpeech(text) {
  if (!text) return '';
  return String(text)
    .replace(/\$\$([^$]*)\$\$/g, ' $1 ').replace(/\$([^$]*)\$/g, ' $1 ')
    .replace(/\\d?frac\{([^}]*)\}\{([^}]*)\}/g, '$2 분의 $1')
    .replace(/\\sqrt\{([^}]*)\}/g, '루트 $1').replace(/\\sqrt/g, '루트 ')
    .replace(/\\pm/g, '플러스 마이너스').replace(/\\times/g, ' 곱하기 ').replace(/\\div/g, ' 나누기 ')
    .replace(/\\leq|\\le/g, ' 이하 ').replace(/\\geq|\\ge/g, ' 이상 ').replace(/\\neq/g, ' 같지 않음 ')
    .replace(/\\cdot/g, ' 곱하기 ').replace(/\\sin/g, '사인 ').replace(/\\cos/g, '코사인 ').replace(/\\tan/g, '탄젠트 ')
    .replace(/\\sum/g, '시그마 ').replace(/\\log/g, '로그 ').replace(/\\ln/g, '자연로그 ').replace(/\\pi/g, '파이 ')
    .replace(/\\alpha/g, '알파').replace(/\\beta/g, '베타').replace(/\\gamma/g, '감마').replace(/\\theta/g, '세타')
    .replace(/\\omega/g, '오메가').replace(/\\implies|\\Rightarrow/g, ' 따라서 ')
    .replace(/\^\{?2\}?/g, ' 제곱 ').replace(/\^\{?3\}?/g, ' 세제곱 ').replace(/\^/g, ' 의 ')
    .replace(/[{}\\]/g, ' ').replace(/\s+/g, ' ').trim();
}

function narration(p) {
  return (p.avs || []).map(s => {
    if (typeof s === 'string') return s;
    return `${s.title || ''}. ${s.content || ''}`;
  }).join('. ');
}

function pcmToWav(pcm, rate = 24000) {
  const buf = Buffer.alloc(44 + pcm.length);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + pcm.length, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(pcm.length, 40); pcm.copy(buf, 44);
  return buf;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// 타임아웃 있는 fetch (hang 방지)
async function fetchT(url, opts, ms = 60000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try { return await fetch(url, { ...opts, signal: ac.signal }); }
  finally { clearTimeout(t); }
}

async function geminiTtsOnce(text) {
  const r = await fetchT(`https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${GKEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // gemini-3.1-flash-tts-preview는 systemInstruction(Developer instruction) 미지원 → 제거
      contents: [{ parts: [{ text }] }],
      generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } } },
    }),
  });
  return r;
}

async function geminiTts(text) {
  let n429 = 0;
  for (let attempt = 1; attempt <= 8; attempt++) {
    const r = await geminiTtsOnce(text);
    if (r.ok) {
      const d = await r.json();
      const part = d.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (!part) throw new Error('No audio');
      return Buffer.from(part.inlineData.data, 'base64');
    }
    if (r.status === 429) {
      const body = await r.text();
      // 일일 요청 한도(RPD, 예: 100건/일) 소진 = 오늘은 재시도 무의미(내일 리셋) → 즉시 중단
      if (/per_?day|requests_per_model_per_day|exceeded your current quota/i.test(body)) {
        const m = body.match(/retry in ([0-9hms.]+)/i);
        const e = new Error('일일 요청 한도 소진'); e.daily = true; e.retry = m ? m[1] : null; throw e;
      }
      // 결제 크레딧 소진(prepayment) = 충전 전엔 재시도해도 무의미 → 즉시 중단
      if (/credits are depleted|prepay/i.test(body)) {
        const e = new Error('Gemini 결제 크레딧 소진(prepayment credits depleted) — 충전 필요'); e.billing = true; throw e;
      }
      // 그 외 429 = 분당 RPM 제한이 대부분. 길게 기다리며 여러 번 재시도.
      n429++;
      if (n429 >= 6) { const e = new Error('RATE'); e.rate = true; throw e; }
      await sleep(30000);
      continue;
    }
    if (attempt === 8) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 160)}`);
    await sleep(4000 * attempt);
  }
}

async function upload(buf, dest) {
  const r = await fetchT(`${SUPA_URL}/storage/v1/object/mentos-assets/${dest}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SKEY}`, 'Content-Type': 'audio/mpeg', 'x-upsert': 'true' },
    body: buf,
  });
  if (!r.ok) throw new Error(`upload HTTP ${r.status}: ${(await r.text()).slice(0, 150)}`);
}

(async () => {
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/', dataFile), 'utf8'));
  const probs = [];
  for (const lv of Object.keys(d.levels)) for (const u of Object.keys(d.levels[lv])) for (const p of d.levels[lv][u]) probs.push(p);

  let done = {};
  try { done = JSON.parse(fs.readFileSync(PROG, 'utf8')); } catch {}

  const todo = probs.filter(p => !done[p.id]);
  console.log(`[${course}] 총 ${probs.length} / 완료 ${Object.keys(done).length} / 남음 ${todo.length} (이번 실행 최대 ${MAX})`);

  let made = 0, consecRate = 0;
  const tmp = '/tmp/avs_tts'; fs.mkdirSync(tmp, { recursive: true });
  for (const p of todo) {
    if (made >= MAX) break;
    const text = cleanForSpeech(narration(p)).slice(0, 4500);
    if (!text) { done[p.id] = 'empty'; continue; }
    try {
      const pcm = await geminiTts(text);
      consecRate = 0;
      const wav = path.join(tmp, `${p.id}.wav`), mp3 = path.join(tmp, `${p.id}.mp3`);
      fs.writeFileSync(wav, pcmToWav(pcm));
      execSync(`ffmpeg -y -i "${wav}" -b:a 64k "${mp3}"`, { stdio: 'ignore' });
      await upload(fs.readFileSync(mp3), `avs_tts/${course}/${p.id}.mp3`);
      fs.unlinkSync(wav); fs.unlinkSync(mp3);
      done[p.id] = true; made++;
      fs.writeFileSync(PROG, JSON.stringify(done));
      if (made % 5 === 0) console.log(`  ...${made} 생성, 누적완료 ${Object.values(done).filter(v=>v===true).length}`);
      await sleep(20000); // ≈3 RPM (프리뷰 한도 보수적 준수)
    } catch (e) {
      if (e.daily) {
        console.log(`\n📅 오늘 일일 요청 한도(모델 RPD, 예: 100건/일) 소진 — 중단. ${e.retry ? `약 ${e.retry} 후` : '내일'} 리셋되면 재실행 시 이어서 진행됩니다.`);
        console.log(`   (이번 실행 ${made}개 생성, 누적 성공 ${Object.values(done).filter(v=>v===true).length}/${probs.length})`);
        break;
      }
      if (e.billing) {
        console.log(`\n💳 Gemini 결제 크레딧 소진 — TTS 생성 불가. 충전 후 재실행하면 이어서 진행됩니다.`);
        console.log(`   👉 https://ai.studio/projects (Billing) 에서 prepayment 크레딧 충전`);
        console.log(`   (이번 실행 ${made}개 생성, 누적 성공 ${Object.values(done).filter(v=>v===true).length}/${probs.length})`);
        break;
      }
      if (e.rate) {
        consecRate++;
        console.log(`  ⏳ RPM/quota 429 (연속 ${consecRate}) — ${p.id} 보류, 60초 대기`);
        await sleep(60000);
        if (consecRate >= 4) { console.log(`\n⛔ 지속적 429 — 오늘 한도 소진으로 판단, 중단. 내일 재실행하면 이어서. (이번 실행 ${made}개)`); break; }
        continue; // 같은 문제 재시도 안 하고 다음으로(보류), done 표시 안 함 → 다음 실행때 재시도
      }
      console.warn(`  ⚠️ ${p.id} 실패: ${e.message}`); done[p.id] = false;
      await sleep(3000);
    }
  }
  fs.writeFileSync(PROG, JSON.stringify(done));
  const ok = Object.values(done).filter(v => v === true).length;
  console.log(`\n[${course}] 이번 실행 ${made}개 생성. 누적 성공 ${ok}/${probs.length}.`);
})();
