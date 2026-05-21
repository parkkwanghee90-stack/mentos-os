const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_FILE = 'C:\\mentos_os_clean\\night_shift_run.log';
function log(msg) {
    const timestamp = new Date().toISOString();
    const l = `[${timestamp}] ${msg}`;
    console.log(l);
    fs.appendFileSync(LOG_FILE, l + '\n');
}

fs.writeFileSync(LOG_FILE, '=== 밤샘 자동화 파이프라인 시작 ===\n');
log('퇴근 후 자동화 파이프라인 가동 (1단계 제외 전체 폴더)');

try {
    log('====================================');
    log('[PHASE 1] PNG 크롭 엔진 시작');
    log('====================================');
    execSync('node scripts/math_phase1_master_engine.cjs', { stdio: 'inherit', encoding: 'utf8' });
    log('[PHASE 1] 완료');

    log('====================================');
    log('[PHASE 2] GPT 비전 분석 시작 (15문제 청킹, low-token 모드)');
    log('====================================');
    execSync('node scripts/math_phase2_ultimate_gpt.cjs', { stdio: 'inherit', encoding: 'utf8' });
    log('[PHASE 2] 완료');

    log('====================================');
    log('[PHASE 3] 정합성 벤치마크 및 오딧 리포트 생성');
    log('====================================');
    execSync('node scripts/math_validator_audit.cjs', { stdio: 'inherit', encoding: 'utf8' });
    log('[PHASE 3] 오딧 리포트 생성 완료');

    log('모든 파이프라인이 정상적으로 완료되었습니다! 안녕히 주무십시오!');
} catch (e) {
    log('!!! 파이프라인 실행 중 오류 발생 !!!');
    if (e.stdout) log(e.stdout.toString());
    if (e.stderr) log(e.stderr.toString());
    log(e.toString());
}
