'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');

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

// homeworkSSOT.js를 텍스트로 읽어 수학2/미적분 hintKey를 동적 파싱(하드코딩 금지).
// 정규식: (수학2|미적분)_(\d+)(주제)_통합숙제 → 접두어+2자리 번호로 텍스트폴더와 매칭.
function loadHintKeyIndex() {
  const ssotPath = path.join(__dirname, '..', 'src', 'data', 'homeworkSSOT.js');
  const src = fs.readFileSync(ssotPath, 'utf8');
  const re = /(수학2|미적분)_(\d+)([^_]+)_통합숙제/g;
  const prefixMap = { '수학2': 'math2', '미적분': 'calculus' };
  const index = new Map(); // `${folderPrefix}_${NN}` → hintKey
  let m;
  while ((m = re.exec(src)) !== null) {
    const [, subject, num, topic] = m;
    const folderPrefix = prefixMap[subject];
    const nn = String(parseInt(num, 10)).padStart(2, '0');
    const key = `${folderPrefix}_${nn}`;
    const hintKey = `${subject}_${num}${topic}_통합숙제`;
    if (!index.has(key)) index.set(key, hintKey);
  }
  return index;
}

(async () => {
  const hintKeyIndex = loadHintKeyIndex();

  const hints = (await list('mentos-assets', 'math_hints/')).filter(x => x.id === null).map(x => x.name);
  // 미적분/확통/수2 텍스트 폴더(스펙 기준 패턴)
  const re = /^(calculus_|math2_)|deriv|integ|prob|normal_dist|random_var|^1_limit|func_limit/i;
  const textFolders = hints.filter(f => re.test(f));

  // (math2|calculus)_(NN)_..._homework 폴더 → 번호로 hintKey 매칭
  const folderRe = /^(math2|calculus)_(\d+)_.*_homework$/;

  const map = {};
  const unmatchedFolders = [];
  for (const f of textFolders) {
    const fm = folderRe.exec(f);
    if (!fm) { unmatchedFolders.push(f); continue; }
    const [, folderPrefix, num] = fm;
    const nn = String(parseInt(num, 10)).padStart(2, '0');
    const hintKey = hintKeyIndex.get(`${folderPrefix}_${nn}`);
    if (!hintKey) { unmatchedFolders.push(f); continue; }

    const items = await list('mentos-assets', `math_hints/${f}/`);
    const pids = items.filter(x => x.id !== null && /^\d{3}\.json$/.test(x.name || '')).map(x => x.name.replace('.json', ''));
    if (pids.length === 0) { unmatchedFolders.push(f); continue; }
    map[f] = { ttsDir: f, hintKey, pids };
  }

  const totalClips = Object.values(map).reduce((a, m) => a + m.pids.length, 0);
  fs.writeFileSync('scripts/tts_elevenlabs_map.json', JSON.stringify({
    note: 'hintKey↔hintDir(텍스트폴더)↔ttsDir 3자 매핑. ttsDir=텍스트폴더명. 앱 tts_map에 hintKey→ttsDir 등록 필요.',
    counts: { mapped: Object.keys(map).length, totalClips, unmatchedFolders: unmatchedFolders.length },
    map,
    unmatchedFolders,
  }, null, 2));
  console.log('mapped folders:', Object.keys(map).length, '| total clips:', totalClips,
    '| unmatched folders:', unmatchedFolders.length);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
