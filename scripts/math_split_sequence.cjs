const fs = require('fs');
const path = require('path');

const BASE = 'C:/mentos_os_clean/public/math_db';

// ─── 이동 맵 ───────────────────────────────────────
// [현재경로, 목적지경로]
const moves = [
  // ── 등차등비수열 ─────────────────────────────────
  ['고2/수열/기본/등차등비2단계',       '고2/등차등비수열/기본/등차등비2단계'],
  ['고2/수열/기본/등차등비3단계',       '고2/등차등비수열/실력/등차등비3단계'],
  ['미분류/등차등비수열4단계',          '고2/등차등비수열/심화/등차등비수열4단계'],

  // ── 수열의 합 ───────────────────────────────────
  ['고2/수열/기본/시그마용법2단계',     '고2/수열의 합/기본/시그마용법2단계'],
  ['미분류/여러가지수열3단계',          '고2/수열의 합/실력/여러가지수열3단계'],

  // ── 수학적 귀납법 ────────────────────────────────
  ['고2/수열/실력/귀납적정의',          '고2/수학적 귀납법/실력/귀납적정의'],
  ['미분류/수학적귀납법3단계',          '고2/수학적 귀납법/실력/수학적귀납법3단계'],
];

let ok = 0, fail = 0;
for (const [from, to] of moves) {
  const src  = path.join(BASE, from);
  const dest = path.join(BASE, to);
  if (!fs.existsSync(src)) { console.log(`[SKIP-없음] ${from}`); fail++; continue; }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(src, dest);
  console.log(`[OK] ${from}\n      → ${to}`);
  ok++;
}

// 비어있는 구 수열 폴더 정리
const oldSeq = path.join(BASE, '고2/수열');
if (fs.existsSync(oldSeq)) {
  const remaining = fs.readdirSync(oldSeq, { recursive: true });
  if (remaining.length === 0 || (remaining.length === 1 && remaining[0] === '기본')) {
    fs.rmSync(oldSeq, { recursive: true, force: true });
    console.log('\n[정리] 구 "고2/수열" 폴더 삭제 완료');
  } else {
    console.log(`\n[경고] "고2/수열" 폴더에 남은 항목 있음:`, remaining);
  }
}

// 미분류 폴더 정리 (비어있으면 삭제)
const unDir = path.join(BASE, '미분류');
if (fs.existsSync(unDir)) {
  const rem = fs.readdirSync(unDir);
  if (rem.length === 0) {
    fs.rmdirSync(unDir);
    console.log('[정리] 미분류 폴더 삭제 (비어있음)');
  } else {
    console.log(`[알림] 미분류 남은 항목:`, rem);
  }
}

// ─── 최종 수열 구조 출력 ───────────────────────────
console.log('\n════════════════════════════════════════');
console.log('   수열 단원 최종 구조');
console.log('════════════════════════════════════════');
const seqUnits = ['등차등비수열', '수열의 합', '수학적 귀납법'];
for (const u of seqUnits) {
  const uDir = path.join(BASE, '고2', u);
  if (!fs.existsSync(uDir)) { console.log(`  ${u}: (없음)`); continue; }
  console.log(`\n  고2 > ${u}`);
  for (const level of ['기본', '실력', '심화']) {
    const lDir = path.join(uDir, level);
    if (!fs.existsSync(lDir)) continue;
    const items = fs.readdirSync(lDir);
    console.log(`    ${level}: ${items.length}개`);
    items.forEach(it => console.log(`      - ${it}`));
  }
}
console.log('\n════════════════════════════════════════');
console.log(`이동 성공: ${ok}  실패: ${fail}`);
