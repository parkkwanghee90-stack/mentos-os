/**
 * verify_math_sang_hints.mjs
 *
 * 본수업 수학교실(수학상) AVS 해설의 Supabase 연결 상태를 점검하는 헬스체크.
 *
 * 앱과 "동일한" 해석 체인을 재사용한다:
 *   사이드바 단원문자열(예: '복소수2단계')
 *     -> getHintFolder() 가 그대로 반환 (수학상 6단원은 `${단원}${단계}` 형태)
 *     -> getSafePath() 로 한글 -> 영문/숫자 경로 변환
 *     -> URL_PREFIX + 경로 로 실제 Supabase 공개 URL 구성
 *     -> GET 200 여부 확인
 *
 * 비밀키 불필요(공개 버킷 GET). 학생이 실제 고를 수 있는 문제번호 1~15만 점검.
 *
 * 사용법:  node scripts/verify_math_sang_hints.mjs
 */

import { getSafePath } from '../src/config/pathMapping.js';

// SSOT: src/config/assets.js 의 URL_PREFIX 와 동일(공개 버킷 루트).
const URL_PREFIX =
  'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets';

// MathClassroom.jsx getSidebarData() 의 수학상 6단원(다항식~2차함수)과 동일한 문자열 규칙.
const UNITS = [
  { name: '다항식', base: '다항식' },
  { name: '항등식과 나머지정리', base: '항등식과나머지정리' },
  { name: '인수분해', base: '인수분해' },
  { name: '복소수', base: '복소수' },
  { name: '이차방정식', base: '이차방정식' },
  { name: '이차방정식과 이차함수', base: '이차방정식과이차함수' },
];
const STEPS = ['2단계', '3단계', '4단계'];
const PROBLEM_RANGE = Array.from({ length: 15 }, (_, i) => i + 1); // 1~15 (사이드바 고정 범위)

const pad3 = (n) => String(n).padStart(3, '0');

// 앱의 resolveAsset 와 동일하게 경로를 실제 URL 로 변환.
function resolvedUrl(folder, id) {
  const safe = getSafePath(`math_hints/${folder}/${pad3(id)}.json`);
  return `${URL_PREFIX}/${safe}`;
}

async function exists(url) {
  try {
    const r = await fetch(url, { method: 'GET' });
    const ct = r.headers.get('content-type') || '';
    // Supabase 는 없는 객체에 대해 JSON 에러바디(200 아님)를 준다. text/html 도 미스로 간주.
    if (!r.ok || ct.includes('text/html')) return false;
    return true;
  } catch {
    return false;
  }
}

// 동시성 제한 매핑.
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let idx = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const cur = idx++;
      out[cur] = await fn(items[cur], cur);
    }
  });
  await Promise.all(workers);
  return out;
}

async function checkFolder(folder) {
  const results = await mapLimit(PROBLEM_RANGE, 12, async (id) => ({
    id,
    ok: await exists(resolvedUrl(folder, id)),
  }));
  const missing = results.filter((r) => !r.ok).map((r) => pad3(r.id));
  return { folder, total: results.length, okCount: results.length - missing.length, missing };
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(' 수학상 본수업 AVS 해설 — Supabase 연결 상태 리포트 (문제 1~15)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let totalMissing = 0;
  const missingList = [];

  for (const unit of UNITS) {
    let line = unit.name.padEnd(18);
    for (const step of STEPS) {
      const folder = `${unit.base}${step}`; // getHintFolder() 가 수학상 6단원에 대해 반환하는 값
      const safeFolder = getSafePath(`math_hints/${folder}`);
      const { okCount, total, missing } = await checkFolder(folder);
      const mark = missing.length === 0 ? '✅' : '❌';
      line += ` | ${step} ${mark}${okCount}/${total}`;
      if (missing.length) {
        totalMissing += missing.length;
        missingList.push(`  - ${unit.name} ${step}  (${safeFolder})  누락: ${missing.join(', ')}`);
      }
    }
    console.log(line);
  }

  // 2차함수 전용 네임스페이스(06_quad_eq_func*) 후보 타깃 점검 — Phase 1 매핑 안전성 확인용.
  console.log('\n── [Phase 1 타깃 후보] 이차방정식과이차함수 → 전용/현행 폴더 커버리지 ──');
  const quadCandidates = [
    ['06_quad_eq_funcstep2', '06_quad_eq_funcstep3', '06_quad_eq_funcstep4'],
    ['05_quad_eq_step2', '05_quad_eq_step3', '05_quad_eq_step4'],
  ];
  for (const group of quadCandidates) {
    for (const folder of group) {
      // 이 후보들은 이미 영문 폴더명이므로 getSafePath 를 우회하고 직접 점검.
      const results = await mapLimit(PROBLEM_RANGE, 12, async (id) => ({
        id,
        ok: await exists(`${URL_PREFIX}/math_hints/${folder}/${pad3(id)}.json`),
      }));
      const missing = results.filter((r) => !r.ok).map((r) => pad3(r.id));
      const mark = missing.length === 0 ? '✅' : '❌';
      console.log(`  ${mark} ${folder.padEnd(22)} ${results.length - missing.length}/${results.length}${missing.length ? '  누락: ' + missing.join(', ') : ''}`);
    }
  }

  console.log('\n───────────────────────────────────────────────────────────────');
  if (totalMissing === 0) {
    console.log('결과: 6단원 × 2/3/4단계 × 1~15 — 전부 연결됨 ✅ (누락 0건)');
  } else {
    console.log(`결과: 실제 누락 ${totalMissing}건`);
    console.log(missingList.join('\n'));
  }
  console.log('───────────────────────────────────────────────────────────────');

  process.exitCode = totalMissing === 0 ? 0 : 1;
}

main().catch((e) => {
  console.error('verify 실패:', e);
  process.exitCode = 2;
});
