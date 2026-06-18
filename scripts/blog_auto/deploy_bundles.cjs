/** 배포 전 권위 재빌드: go1+go2 번들 + 대문 캐러셀. (개별 에이전트가 번들 건드린 것 클린 복구) */
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const ROOT = path.join(__dirname, '..', '..');

function run(args, env) {
  execFileSync('node', args, { cwd: ROOT, stdio: 'inherit', env: { ...process.env, ...env } });
}

run(['scripts/exam_predict/06_bundle.cjs']);
run(['scripts/exam_predict/06_bundle.cjs'], { EXAM_OUT_BASE: 'src/data/exam_predict_go2' });
run(['scripts/build_hero_showcase.cjs']);
console.log('bundles+showcase rebuilt');
