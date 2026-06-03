/* 전 단원 숙제 무결성 점검: stages/answerKey/정답 존재 여부 */
const fs = require('fs');
const path = require('path');

const ssotPath = path.join(__dirname, '../src/data/homeworkSSOT.js');
const ansPath = path.join(__dirname, '../src/data/avs_answers.json');

const ssotSrc = fs.readFileSync(ssotPath, 'utf8');
const answers = JSON.parse(fs.readFileSync(ansPath, 'utf8'));

// HOMEWORK_UNITS 객체들에서 핵심 필드 추출 (정규식 기반 경량 파서)
const unitBlocks = ssotSrc.split(/\{\s*id:\s*'/).slice(1);
let issues = 0;

unitBlocks.forEach(block => {
  const id = (block.match(/^([^']+)'/) || [])[1];
  if (!id || !id.startsWith('hw')) return;
  const answerKey = (block.match(/answerKey:\s*'([^']+)'/) || [])[1];
  const hasStages = /stages:\s*\{/.test(block);

  if (!answerKey) { console.error(`❌ [${id}] answerKey 없음`); issues++; return; }
  if (!hasStages) { console.error(`❌ [${id}] stages 없음`); issues++; }
  if (!answers[answerKey]) {
    console.error(`❌ [${id}] avs_answers.json에 '${answerKey}' 정답 세트 없음`);
    issues++;
  } else if (Object.keys(answers[answerKey]).length === 0) {
    console.error(`⚠️  [${id}] '${answerKey}' 정답 세트가 비어 있음`);
    issues++;
  }
});

if (issues === 0) {
  console.log('✅ 전 단원 무결성 점검 통과');
  process.exit(0);
} else {
  console.error(`\n총 ${issues}건의 문제가 발견되었습니다.`);
  process.exit(1);
}
