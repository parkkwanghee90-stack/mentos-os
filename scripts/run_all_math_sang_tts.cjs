// scripts/run_all_math_sang_tts.cjs
// 수학상 전 단원 TTS 일괄 생성 (단계별 001~020, 20개씩)
const { execSync } = require('child_process');
const path = require('path');

const ALL_CHAPTERS = [
  'poly',        // 다항식
  'remain',      // 항등식과나머지정리
  'factor',      // 인수분해
  'complex',     // 복소수
  'quad_eq',     // 이차방정식
  'quad_func',   // 이차방정식과이차함수
  'gocha',       // 고차방정식
  'linear_ineq', // 일차부등식
  'quad_ineq',   // 이차부등식
  'cases',       // 경우의수
  'matrix',      // 행렬
  'point',       // 점과좌표
  'line',        // 직선의방정식
  'circle',      // 원의방정식
  'shape_move',  // 도형의이동
];

const scriptPath = path.join(__dirname, 'generate_gemini_math_sang_tts.cjs');

async function main() {
  console.log(`\n🚀 수학상 전 단원 TTS 일괄 생성 시작 (${ALL_CHAPTERS.length}개 단원)`);
  console.log(`   각 단원 × 3단계(2/3/4) × 20문제 = 최대 ${ALL_CHAPTERS.length * 3 * 20}개 TTS\n`);

  let completed = 0;
  let failed = 0;

  for (const chapter of ALL_CHAPTERS) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📘 [${completed + 1}/${ALL_CHAPTERS.length}] Starting chapter: ${chapter}`);
    console.log(`${'='.repeat(60)}`);

    try {
      execSync(`node "${scriptPath}" ${chapter}`, {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit',
        timeout: 30 * 60 * 1000 // 30 min timeout per chapter
      });
      completed++;
      console.log(`✅ Chapter ${chapter} done! (${completed}/${ALL_CHAPTERS.length})`);
    } catch (err) {
      console.error(`❌ Chapter ${chapter} had errors: ${err.message}`);
      failed++;
      // Continue to next chapter even on failure
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🏆 전체 완료! 성공: ${completed}, 실패: ${failed}`);
  console.log(`${'='.repeat(60)}`);
}

main();
