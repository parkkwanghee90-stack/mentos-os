// scripts/su1_tts_completion_check.cjs
// 수1 TTS 완료 판정 (quota 미소비): 각 스테이지의 프로덕션 힌트(NNN.json) 대비
// math-tts 오디오(NNN.mp3) 갭을 센다. 갭 0 이면 SU1_TTS_COMPLETE 출력.
// 인코딩 손상(mojibake) 등으로 생성기가 스킵하는 소스는 갭으로 계속 잡히므로,
// 손상 소스가 복구될 때까지 COMPLETE 가 되지 않는 것이 의도된 동작이다.
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const { STAGES } = require('./generate_su1_tts.cjs');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function listAll(bucket, prefix) {
  const out = [];
  let offset = 0;
  for (;;) {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${bucket}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
    });
    if (!res.ok) throw new Error(`list failed: ${bucket}/${prefix} ${res.status}`);
    const files = await res.json().catch(() => []);
    out.push(...files);
    if (files.length < 1000) break;
    offset += 1000;
  }
  return out;
}

(async () => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('MISSING_ENV');
    process.exit(1);
  }
  let totalGaps = 0;
  const lines = [];
  for (const [key, { ko, hintDir, ttsDir }] of Object.entries(STAGES)) {
    const hints = await listAll('mentos-assets', `math_hints/${hintDir}/`);
    const hintIds = hints
      .map(f => (f.name || '').match(/^(\d{3})\.json$/))
      .filter(Boolean)
      .map(m => m[1]);
    const audio = await listAll('math-tts', `${ttsDir}/`);
    const audioIds = new Set(
      audio.map(f => (f.name || '').match(/^(\d{3})\.mp3$/)).filter(Boolean).map(m => m[1])
    );
    const missing = hintIds.filter(id => !audioIds.has(id));
    totalGaps += missing.length;
    if (missing.length) lines.push(`  ${key}(${ko}): ${missing.length} missing [${missing.join(',')}]`);
  }
  console.log(`SU1_GAPS=${totalGaps}`);
  for (const l of lines) console.log(l);
  if (totalGaps === 0) console.log('SU1_TTS_COMPLETE');
})().catch(err => {
  console.error('ERR:', err.message);
  process.exit(1);
});
