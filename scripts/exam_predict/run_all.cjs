#!/usr/bin/env node
/**
 * 전체 배치 오케스트레이션: 01 → 05 를 소스 폴더의 모든(또는 필터된) 학교에 대해 순차 실행.
 * 각 단계가 멱등(이미 된 건 skip)이라, 하루에 PDF 가 추가되면 다시 돌리면 새 학교만 처리된다.
 * 실패는 src/data/exam_predict/failed.json 에 누적 기록.
 *
 * 사용:
 *   set -a; source .env; set +a
 *   node scripts/exam_predict/run_all.cjs            # 소스 폴더 전체
 *   node scripts/exam_predict/run_all.cjs "풍산"      # 파일명에 '풍산' 포함만
 *   STAGES=01,02 node scripts/exam_predict/run_all.cjs  # 일부 단계만
 */
const { execFileSync } = require('child_process');
const path = require('path');
const C = require('./lib/config.cjs');

const filter = process.argv[2] || '';
// 기본은 02~05 (02가 PDF를 Gemini에 직접 입력하므로 01 래스터화 불필요).
// 01(poppler PNG)은 필요 시 STAGES=01,02,... 로 명시.
const only = (process.env.STAGES || '02,03,04,05').split(',').map(s => s.trim());
const STAGE_FILES = {
  '01': '01_pdf_to_png.cjs', '02': '02_extract.cjs', '03': '03_analyze.cjs',
  '04': '04_generate.cjs', '05': '05_assemble.cjs',
};

function run() {
  C.ensureDirs();
  console.log(`[run_all] 소스: ${C.SRC_DIR}`);
  console.log(`[run_all] 단계: ${only.join(' → ')}${filter ? ` / 필터="${filter}"` : ''}`);
  for (const s of only) {
    const file = STAGE_FILES[s];
    if (!file) { console.log(`  (알 수 없는 단계 ${s} 건너뜀)`); continue; }
    console.log(`\n=== STAGE ${s} (${file}) ===`);
    try {
      execFileSync('node', [path.join(__dirname, file), filter].filter(Boolean), { stdio: 'inherit', env: process.env });
    } catch (e) {
      console.log(`  STAGE ${s} 중 일부 실패(계속 진행) — failed.json 확인`);
    }
  }
  console.log(`\n[run_all] 완료. 결과: src/data/exam_predict/cards/  (실패: failed.json)`);
}

run();
