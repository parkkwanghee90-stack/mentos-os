#!/usr/bin/env node
/**
 * 생성된 숙제 AVS(src/data/homework_avs/<answerKey>/*.json)를 Supabase에 업로드.
 * 저장 경로 = getSafePath('math_hints/<answerKey>/<pid>.json') (앱 resolveAsset과 동일).
 * 사용: node scripts/upload_homework_avs.cjs <answerKey>
 */
const fs = require('fs'); const path = require('path');
try { require('dotenv').config(); } catch {}
const { getSafePath } = require('../src/config/pathMapping.js');
const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPA = (process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const BUCKET = 'mentos-assets';
const answerKey = process.argv[2];
if (!SRK || !SUPA || !answerKey) { console.error('필수: SUPABASE env + <answerKey>'); process.exit(1); }

(async () => {
  const dir = path.join(__dirname, '..', 'src', 'data', 'homework_avs', answerKey);
  const files = fs.readdirSync(dir).filter(f => /^\d{3}\.json$/.test(f));
  let ok = 0, fail = 0;
  for (const f of files) {
    const pid = f.replace('.json', '');
    const storagePath = getSafePath(`math_hints/${answerKey}/${pid}.json`).replace(/^\//, '');
    const body = fs.readFileSync(path.join(dir, f));
    const enc = storagePath.split('/').map(encodeURIComponent).join('/');
    const res = await fetch(`${SUPA}/storage/v1/object/${BUCKET}/${enc}`, {
      method: 'POST',
      headers: { apikey: SRK, Authorization: `Bearer ${SRK}`, 'x-upsert': 'true', 'Content-Type': 'application/json' },
      body,
    });
    if (res.ok) { ok++; } else { fail++; console.error(`  ❌ ${pid}: ${res.status} ${(await res.text()).slice(0,80)}`); }
  }
  console.log(`업로드 ${ok}/${files.length} (실패 ${fail}) → math_hints/${getSafePath(answerKey)}/`);
})();
