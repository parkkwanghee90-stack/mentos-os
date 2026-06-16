'use strict';

// 매일 1회 실행되는 TTS 음색 통일 재생성 배치(무인).
// 동작: worklist(scripts/tts_regen_worklist.json)에서 "소스 가용" suspect만 골라
//       su1(Supabase 소스) → sang 로컬소스 존재분 순으로 재생성하고, 끝나면 audit로 worklist를 갱신한다.
// 할당량 소진 시 생성기가 REGEN_QUOTA_EXHAUSTED로 스스로 종료(다른 모델 대체 없음).
// 미매핑(GAP)·sang 로컬부재 클립은 건드리지 않는다(소스/매핑 후속 작업 대상).
//
// launchd 등록 예: ~/Library/LaunchAgents/com.mathmentos.ttsregen.plist 에서
//   ProgramArguments: [node, /Users/mac/mathmentos/scripts/cron_regen_tts_daily.cjs], StartCalendarInterval 09:05.
// ⚠️ 기존 자동수확(SU1_GAPS) launchd와 동일한 3.1 일일 할당량을 공유하므로 실행 시각/우선순위 조정 필요.

require('dotenv').config();
const fs = require('fs');
const cp = require('child_process');

const ROOT = '/Users/mac/mathmentos';
process.chdir(ROOT);

const SU1 = 'scripts/generate_su1_tts.cjs';
const SANG = 'scripts/generate_gemini_math_sang_tts.cjs';

function listStages(gen) {
  const out = cp.execFileSync('node', [gen, '--list-stages'], { encoding: 'utf8' });
  const line = out.split('\n').find(l => l.startsWith('STAGES_JSON '));
  return new Set(JSON.parse(line.slice('STAGES_JSON '.length)));
}

function run(gen, keys) {
  if (!keys.length) { console.log(`[cron] ${gen}: 대상 0 — 건너뜀`); return; }
  console.log(`[cron] ${gen}: ${keys.length}개 재생성 시작`);
  try {
    cp.execFileSync('node', [gen, '--regen-keys', keys.join(',')], { stdio: 'inherit' });
  } catch (e) {
    console.log(`[cron] ${gen} 종료(할당량 소진 또는 오류): ${e.message}`);
  }
}

(function main() {
  const w = JSON.parse(fs.readFileSync('scripts/tts_regen_worklist.json', 'utf8'));
  const su1Set = listStages(SU1);
  const sangSet = listStages(SANG);

  // sang remoteDir → localDir (로컬 소스 존재 판별용)
  const sangSrc = fs.readFileSync(SANG, 'utf8');
  const r2l = {};
  for (const m of sangSrc.matchAll(/localDir: ?'([^']+)', ?remoteDir: ?'([^']+)'/g)) r2l[m[2]] = m[1];

  const su1Keys = [], sangKeys = [];
  for (const s of w.suspect) {
    if (su1Set.has(s.ttsDir)) su1Keys.push(s.key);
    else if (sangSet.has(s.ttsDir)) {
      const ld = r2l[s.ttsDir];
      if (ld && fs.existsSync(`public/math_hints/${ld}/${s.pid}.json`)) sangKeys.push(s.key);
    }
  }
  console.log(`[cron] 소스가용 대상 — su1 ${su1Keys.length}, sang로컬 ${sangKeys.length} (worklist suspect ${w.suspect.length})`);

  run(SU1, su1Keys);
  run(SANG, sangKeys);

  // worklist 갱신(이번에 생성된 클립을 confirmed로 반영)
  try { cp.execFileSync('node', ['scripts/audit_tts_voice.cjs'], { stdio: 'inherit' }); }
  catch (e) { console.log(`[cron] audit 갱신 실패: ${e.message}`); }

  console.log('[cron] 완료');
})();
