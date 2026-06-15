'use strict';
require('dotenv').config();
const fs = require('fs');
const { execFileSync } = require('child_process');
const q = require('./lib/regenQuota.cjs');

const WORKLIST = 'scripts/tts_regen_worklist.json';
const PROGRESS = 'scripts/tts_regen_progress.json';
const UNMAPPED = 'scripts/tts_regen_unmapped.json';
const DAILY_LIMIT = Number(process.env.TTS_DAILY_LIMIT || 100);
const GENERATORS = ['scripts/generate_su1_tts.cjs', 'scripts/generate_gemini_math_sang_tts.cjs'];

function listStages(gen) {
  const out = execFileSync('node', [gen, '--list-stages'], { encoding: 'utf8' });
  const line = out.split('\n').find(l => l.startsWith('STAGES_JSON '));
  if (!line) throw new Error(`${gen}: no STAGES_JSON output`);
  return new Set(JSON.parse(line.slice('STAGES_JSON '.length)));
}
function loadJson(p, dflt) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return dflt; } }
function saveJson(p, v) { fs.writeFileSync(p, JSON.stringify(v, null, 2)); }

(async () => {
  const isPlan = process.argv.includes('--plan');
  const worklist = JSON.parse(fs.readFileSync(WORKLIST, 'utf8'));

  // 1) 각 생성기 담당 ttsDir 집합
  const genStages = GENERATORS.map(g => ({ gen: g, dirs: listStages(g) }));
  const generatorFor = (ttsDir) => (genStages.find(gs => gs.dirs.has(ttsDir)) || {}).gen || null;

  // 2) mapped / unmapped 분리
  const mapped = [], unmapped = [];
  for (const item of worklist.suspect) (generatorFor(item.ttsDir) ? mapped : unmapped).push(item);
  saveJson(UNMAPPED, { note: 'ttsDir이 기존 생성기 STAGES에 없음 — 후속 hintDir 매핑 필요', count: unmapped.length, items: unmapped });
  console.log(`mapped: ${mapped.length} | unmapped(분리됨→${UNMAPPED}): ${unmapped.length}`);

  // 3) 진행상태 반영 → 남은 작업 → 배치
  const progress = loadJson(PROGRESS, { done: [] });
  const remaining = q.remainingWork(mapped, progress);
  const batch = q.takeBatch(remaining, DAILY_LIMIT);
  console.log(`남은(mapped): ${remaining.length} | 이번 배치: ${batch.length} (한도 ${DAILY_LIMIT})`);
  if (isPlan) { console.log('--plan: 실제 생성 없이 종료'); return; }
  if (batch.length === 0) { console.log('처리할 항목 없음.'); return; }

  // 4) 생성기별 그룹 → --regen-keys 실행
  const byGen = {};
  for (const item of batch) (byGen[generatorFor(item.ttsDir)] ||= []).push(item.key);
  for (const [gen, keys] of Object.entries(byGen)) {
    let out = '';
    try {
      out = execFileSync('node', [gen, '--regen-keys', keys.join(',')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
    } catch (err) {
      // 부분 출력이 있으면 파싱 시도
      out = (err.stdout || '').toString();
      for (const line of out.split('\n')) { const m = line.match(/^REGEN_DONE (.+)$/); if (m) progress.done.push(m[1].trim()); }
      saveJson(PROGRESS, progress);
      if (q.isQuotaExhausted(err)) { console.log('할당량 소진(예외) — 진행 저장 후 종료. 다음 창(09:00 KST) 재실행.'); process.exit(0); }
      throw err;
    }
    let quota = false;
    for (const line of out.split('\n')) {
      const m = line.match(/^REGEN_DONE (.+)$/);
      if (m) progress.done.push(m[1].trim());
      if (/REGEN_QUOTA_EXHAUSTED/.test(line)) quota = true;
    }
    saveJson(PROGRESS, progress);
    if (quota) { console.log('할당량 소진 — 진행 저장 후 종료. 다음 창(09:00 KST) 재실행.'); process.exit(0); }
  }
  saveJson(PROGRESS, progress);
  console.log(`배치 완료. 누적 done ${progress.done.length}.`);
})().catch(e => { console.error('ERROR', e.message); process.exit(1); });
