#!/usr/bin/env node
/**
 * 삼각함수3단계(trig_step3) 모지바케 힌트 복원기
 *
 * 프로덕션 math_hints/trig_step3/{NNN}.json의 한국어가 인코딩 손상(??)된 9개 파일을
 * 문제 이미지(math_crops/trig_step3/{NNN}.webp) 비전 분석으로 복원한다.
 *  - JSON 구조·키·수식은 보존, 깨진 한국어 텍스트만 재작성
 *  - 업로드 전 원본을 scripts/.trig3_backup/ 에 보존
 *
 * 사용: node scripts/restore_trig3_mojibake.cjs [--dry-run] [--pids 021,022]
 */
const fs = require('fs');
const path = require('path');
try { require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); } catch {}

const SUPABASE_URL = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const BUCKET = 'mentos-assets';
const PUBLIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;
const MODEL = 'gemini-2.5-flash';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_KEYS = [
  process.env.VITE_GEMINI_API_KEY,
  process.env.VITE_GEMINI_API_KEY_2,
  process.env.VITE_GEMINI_API_KEY_3,
].filter(Boolean);

const DEFAULT_TARGETS = ['021', '022', '024', '025', '026', '027', '028', '030', '031'];
const BACKUP_DIR = path.join(__dirname, '.trig3_backup');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const pidsIdx = args.indexOf('--pids');
const TARGETS = pidsIdx !== -1 ? args[pidsIdx + 1].split(',') : DEFAULT_TARGETS;
const sleep = ms => new Promise(r => setTimeout(r, ms));

if (API_KEYS.length === 0) { console.error('VITE_GEMINI_API_KEY 미설정'); process.exit(1); }
if (!DRY_RUN && !SERVICE_KEY) { console.error('SUPABASE_SERVICE_ROLE_KEY 미설정'); process.exit(1); }

// 실제 문제 이미지 위치: trig_funcstep3 (metadata.json baseName=삼각함수3단계 확인).
// 주의: math_crops/trig_step3/는 1x1 플레이스홀더, trig_func_step3는 다른 단원(삼각함수정의/성질).
const IMG_BASE = `${PUBLIC_BASE}/math_crops/math1_mid/step3/trig_funcstep3`;

const buildPrompt = corrupted => `너는 한국 고등학교 수학I(삼각함수) 전문 강사다. 첫 번째 이미지는 [문제]다(두 번째 이미지가 있으면 [해설]이다).
아래 JSON은 이 문제의 단계별 AVS 힌트인데, 인코딩 손상으로 한국어 일부가 "??"로 깨졌다.

임무: JSON 구조를 그대로 보존하면서 깨진 한국어만 복원한 완전한 JSON을 출력하라.

규칙:
- 키 이름, 배열 길이, step 번호, 필드 구성을 절대 바꾸지 않는다.
- 수식(latex)도 손상되었을 수 있다. 특히 그리스 문자가 깨진 경우가 있다(예: $\\theta$가 "0"으로 깨져 "\\sin 20"처럼 보임 — 실제는 "\\sin 2\\theta"). 문제 이미지의 실제 수식을 기준으로 latex를 교정하라.
- 복원 텍스트·수식은 문제 이미지의 실제 내용과 일치해야 한다. 문맥상 모호하면 이미지를 기준으로 한다.
- 출력에 "??"가 한 글자도 남으면 안 된다.
- 다른 설명 없이 복원된 JSON만 출력한다.

[손상 JSON]
${corrupted}`;

let keyIdx = 0;
async function callVision(prompt, images) {
  for (let attempt = 0; attempt < API_KEYS.length * 2 + 2; attempt++) {
    const key = API_KEYS[keyIdx % API_KEYS.length];
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, ...images.map(b64 => ({ inline_data: { mime_type: 'image/webp', data: b64 } }))] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 1024 }, responseMimeType: 'application/json' },
      }),
    });
    if (res.status === 429 || res.status === 503) { keyIdx++; await sleep(5000); continue; }
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const j = await res.json();
    const text = j.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('') || '';
    try { return JSON.parse(text); }
    catch { return JSON.parse(text.replace(/\\(?!["\\\/bfnrtu])/g, '\\\\')); }
  }
  throw new Error('quota 소진');
}

// 구조 보존 검증: 키 집합·steps/hints 길이 동일, ?? 부재
function validateRestored(orig, restored) {
  const issues = [];
  const s = JSON.stringify(restored);
  if (s.includes('??')) issues.push('?? 잔존');
  const ok = (a, b) => JSON.stringify(Object.keys(a || {}).sort()) === JSON.stringify(Object.keys(b || {}).sort());
  if (!ok(orig, restored)) issues.push('최상위 키 변경');
  for (const k of ['steps', 'hints']) {
    if (Array.isArray(orig[k]) && (!Array.isArray(restored[k]) || restored[k].length !== orig[k].length)) {
      issues.push(`${k} 길이 변경`);
    }
  }
  return issues;
}

async function uploadHint(pid, json) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/math_hints/trig_step3/${pid}.json`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', 'x-upsert': 'true' },
    body: JSON.stringify(json),
  });
  if (!res.ok) throw new Error(`upload ${res.status}`);
}

(async () => {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  let ok = 0, fail = 0;
  for (const pid of TARGETS) {
    try {
      // 복원 입력은 항상 원본 손상본: 백업이 있으면 그것을 쓰고, 없을 때만 프로덕션에서 받아 백업
      const backupPath = path.join(BACKUP_DIR, `${pid}.json`);
      let orig;
      if (fs.existsSync(backupPath)) {
        orig = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      } else {
        const hr = await fetch(`${PUBLIC_BASE}/math_hints/trig_step3/${pid}.json`);
        if (!hr.ok) { console.log(`❌ ${pid}: 힌트 다운로드 ${hr.status}`); fail++; continue; }
        orig = await hr.json();
        fs.writeFileSync(backupPath, JSON.stringify(orig, null, 2));
      }

      const fetchB64 = async url => {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`이미지 ${r.status}: ${url}`);
        return Buffer.from(await r.arrayBuffer()).toString('base64');
      };
      const images = [await fetchB64(`${IMG_BASE}/${pid}.webp`)];
      try { images.push(await fetchB64(`${IMG_BASE}/${pid}a.webp`)); } catch {} // 해설 이미지는 있으면 첨부

      const restored = await callVision(buildPrompt(JSON.stringify(orig, null, 1)), images);
      const issues = validateRestored(orig, restored);
      if (issues.length) { console.log(`🚩 ${pid}: ${issues.join(', ')}`); fail++; continue; }

      if (DRY_RUN) { console.log(`💡 ${pid} (dry-run) 복원 가능`); ok++; continue; }
      await uploadHint(pid, restored);
      console.log(`✅ ${pid}: 복원·업로드 (?? ${JSON.stringify(orig).split('??').length - 1}곳 → 0)`);
      ok++;
    } catch (e) {
      console.log(`❌ ${pid}: ${e.message.slice(0, 200)}`);
      fail++;
    }
    await sleep(3000);
  }
  console.log(`\n복원 결과: 성공 ${ok} / 실패 ${fail}`);
  if (fail === 0) console.log('TRIG3_RESTORE_COMPLETE');
})();
