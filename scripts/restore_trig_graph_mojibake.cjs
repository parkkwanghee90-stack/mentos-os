/*
 * 삼각함수그래프(trig_graph) 계열 모지바케 힌트 복원기 — 수동 저작판(크레딧 불필요)
 *
 * 배경: math_hints/trig_graph/{NNN}.json 의 최상위 P/C/B/S/A 스키마 중 S(풀이) 한국어가
 *   인코딩 손상(?? 다발)되어 generate_su1_tts.cjs 가 영구 스킵 → TTS 미생성.
 *   (P/C/B/A 는 클린 플레이스홀더라 보존, S 만 손상)
 * 방식: 원본 문제 이미지(math_crops/math1_mid/step4/trig_graph/{NNN}.webp)를 Claude 비전으로
 *   직접 판독·풀이하고 numpy/sympy 로 정답 검산한 P/C/B/S/A 를 아래 AUTHORED 에 수록.
 *   (구버전 Gemini 풀이는 인코딩뿐 아니라 풀이 자체가 틀린 경우 다수 → 정답으로 교정)
 * 안전: 기존 프로덕션 힌트를 받아 P/C/B/S/A 만 오버레이(problem_render 등 보존) 후 x-upsert.
 *
 * 사용: node scripts/restore_trig_graph_mojibake.cjs [--dry-run] [pid ...]
 *   --dry-run: 업로드 없이 머지 결과·나레이션 ?? 검증만. pid 미지정 시 AUTHORED 전체.
 */
require('dotenv').config();
const { buildNarration } = require('./generate_su1_tts.cjs');

const SUPABASE_URL = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const BUCKET = 'mentos-assets';
const PUBLIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;
const HINT_DIR = 'trig_graph';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const AUTHORED = require('./trig_graph_hints.data.cjs');

async function fetchProdHint(pid) {
  const r = await fetch(`${PUBLIC_BASE}/math_hints/${HINT_DIR}/${pid}.json`, { cache: 'no-store' });
  if (!r.ok) return null;
  return r.json();
}

async function uploadHint(pid, obj) {
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/math_hints/${HINT_DIR}/${pid}.json`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', 'x-upsert': 'true' },
    body: JSON.stringify(obj),
  });
  if (!r.ok) throw new Error(`upload ${pid}: ${r.status} ${(await r.text()).slice(0, 120)}`);
}

function countMojibake(str) {
  return (String(str).match(/\?\?/g) || []).length;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const pids = args.filter(a => /^\d{3}$/.test(a));
  const targets = pids.length ? pids : Object.keys(AUTHORED);

  if (!SERVICE_KEY && !dryRun) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY 없음 (.env 확인). --dry-run 으로는 검증 가능.');
    process.exit(1);
  }

  let ok = 0, fail = 0;
  for (const pid of targets) {
    const authored = AUTHORED[pid];
    if (!authored) { console.warn(`⚠️ ${pid}: AUTHORED 데이터 없음 — 건너뜀`); continue; }

    // 저작 필드 자체 ?? 검증 (작성 실수 방지)
    const selfBad = ['P', 'C', 'B', 'S', 'A'].reduce((n, k) => n + countMojibake(authored[k]), 0);
    if (selfBad > 0) { console.error(`❌ ${pid}: 저작 데이터에 ?? ${selfBad}개 — 업로드 중단`); fail++; continue; }

    // 기존 프로덕션 힌트 받아 P/C/B/S/A 오버레이(나머지 필드 보존)
    const base = (await fetchProdHint(pid)) || {};
    const merged = { ...base, P: authored.P, C: authored.C, B: authored.B, S: authored.S, A: authored.A };

    // 나레이션 ?? 검증 (실제 생성기가 보는 기준)
    const narration = buildNarration(merged);
    const narBad = countMojibake(narration);
    const beforeBad = countMojibake(JSON.stringify(base));
    console.log(`\n--- ${pid} --- (기존 힌트 ?? ${beforeBad} → 머지 후 나레이션 ?? ${narBad})`);
    console.log(`  나레이션 미리보기: ${narration.slice(0, 180).replace(/\n/g, ' ')}...`);
    if (narBad > 0) { console.error(`  ❌ 나레이션에 ?? 잔존 — 업로드 중단`); fail++; continue; }

    if (dryRun) { console.log('  [dry-run] 업로드 생략'); ok++; continue; }

    // 업로드 실패는 해당 pid 만 건너뛰고 배치는 계속 (1건 오류로 전체 중단 방지)
    try {
      await uploadHint(pid, merged);
      const verify = await fetchProdHint(pid); // 업로드 검증: 재조회 후 ?? 0 확인
      const vBad = countMojibake(JSON.stringify(verify));
      if (vBad > 0) { console.error(`  ❌ 업로드 후 재조회 ?? ${vBad}개`); fail++; continue; }
      console.log(`  ☁️ 업로드·검증 완료 (재조회 ?? 0)`);
      ok++;
    } catch (e) {
      console.error(`  ❌ ${pid} 업로드 실패: ${e.message} — 건너뜀`);
      fail++;
    }
  }
  console.log(`\n========== trig_graph 복원 합계: 성공 ${ok}, 실패 ${fail} (총 ${targets.length}) ==========`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
