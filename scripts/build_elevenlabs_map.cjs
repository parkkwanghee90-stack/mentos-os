'use strict';
require('dotenv').config();
const fs = require('fs');

const U = process.env.VITE_SUPABASE_URL;
const K = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!U || !K) { console.error('Supabase 키 미설정'); process.exit(1); }

async function list(bucket, prefix) {
  const r = await fetch(`${U}/storage/v1/object/list/${bucket}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit: 1000, sortBy: { column: 'name', order: 'asc' } }),
  });
  if (!r.ok) throw new Error(`list ${bucket}/${prefix}: ${r.status}`);
  return (await r.json()) || [];
}

(async () => {
  const hints = (await list('mentos-assets', 'math_hints/')).filter(x => x.id === null).map(x => x.name);
  // 미적분/확통/수2 텍스트 폴더(스펙 기준 패턴)
  const re = /^(calculus_|math2_)|deriv|integ|prob|normal_dist|random_var|^1_limit|func_limit/i;
  const textFolders = hints.filter(f => re.test(f));
  // math-tts 기존 폴더(이미 음성 있는 것)
  const ttsRoot = (await list('math-tts', '')).filter(x => x.id === null).map(x => x.name);
  const ttsSet = new Set(ttsRoot);

  const map = {};
  const skipped = [];
  for (const f of textFolders) {
    const items = await list('mentos-assets', `math_hints/${f}/`);
    const pids = items.filter(x => x.id !== null && /^\d{3}\.json$/.test(x.name || '')).map(x => x.name.replace('.json', ''));
    if (pids.length === 0) { skipped.push({ folder: f, reason: 'no-json' }); continue; }
    if (ttsSet.has(f)) { skipped.push({ folder: f, reason: 'tts-exists' }); continue; }
    map[f] = { ttsDir: f, pids };
  }
  fs.writeFileSync('scripts/tts_elevenlabs_map.json', JSON.stringify({
    note: 'hintDir→ttsDir(동일명) 매핑. 텍스트 보유∧TTS미보유만. pids=대상 클립.',
    counts: { mapped: Object.keys(map).length, skipped: skipped.length,
      totalClips: Object.values(map).reduce((a, m) => a + m.pids.length, 0) },
    map, skipped,
  }, null, 2));
  console.log('mapped folders:', Object.keys(map).length, '| skipped:', skipped.length,
    '| total clips:', Object.values(map).reduce((a, m) => a + m.pids.length, 0));
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
