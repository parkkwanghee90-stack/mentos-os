/**
 * 원의방정식 2·3·4단계 정답을 채점 시스템(avs_answers.json, answers_master.json)에 연결한다.
 * 정답 출처 = 손 검증된 힌트 JSON(public/math_hints/원의방정식*단계/*.json)의 finalAnswer.
 *
 * 채점 우선순위: avs_answers(최우선) → 힌트 correctAnswer → answers_master.
 * - avs_answers["원의방정식N단계"] = { "001": answer, ... }  (값 기준, 채점기가 \pi·\sqrt·\frac 정규화)
 * - answers_master: { unit:"원의방정식N단계", stage:N, problem:번호, answer, type } 항목 갱신/추가
 *
 * "보기(ㄱㄴㄷ)" 형 객관식은 답이 선택지 번호이므로 동그라미 숫자(①~⑤)를 번호로 저장.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const HINT_BASE = path.join(ROOT, 'public', 'math_hints');
const AVS_PATH = path.join(ROOT, 'public', 'data', 'avs_answers.json');
const MASTER_PATH = path.join(ROOT, 'public', 'data', 'answers_master.json');

const UNITS = [
  { key: '원의방정식2단계', stage: 2 },
  { key: '원의방정식3단계', stage: 3 },
  { key: '원의방정식4단계', stage: 4 },
  { key: '도형의이동2단계', stage: 2 },
  { key: '도형의이동3단계', stage: 3 },
  { key: '도형의이동4단계', stage: 4 },
  // 주의: aliasMap(도형의이동→점과좌표) 때문에 점과좌표 키는 도형의이동 키보다 뒤에 와야
  // 도형의이동 조회가 점과좌표 정답을 잘못 매칭하지 않는다(avs find는 삽입순서 우선).
  { key: '점과좌표2단계', stage: 2 },
  { key: '점과좌표3단계', stage: 3 },
  { key: '점과좌표4단계', stage: 4 },
  { key: '삼각함수활용2단계', stage: 2 },
  { key: '삼각함수활용3단계', stage: 3 },
  { key: '삼각함수활용4단계', stage: 4 },
];

const CIRCLED = { '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5' };

// 저장용 정답 문자열 결정
function answerForGrading(doc) {
  const fa = String(doc.finalAnswer ?? doc.correctAnswer ?? '').trim();
  const circ = fa.match(/[①②③④⑤]/);
  const stripped = fa.replace(/\s*\([①②③④⑤]\)\s*$/, '').trim();
  const isMC = doc.answerType === 'multiple_choice';
  // 보기(ㄱㄴㄷ)형 또는 값에 한글 설명이 섞인 선택형 객관식 → 선택지 번호로 저장
  // (값이 깨끗한 수식인 객관식은 값 그대로 저장: 채점기가 정규화하여 비교)
  const isChoiceText = /[ㄱㄴㄷ가-힣]/.test(stripped);
  if (isMC && circ && isChoiceText) return CIRCLED[circ[0]];
  return stripped;
}

const avs = JSON.parse(fs.readFileSync(AVS_PATH, 'utf8'));
const master = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));

let avsCount = 0, masterCount = 0;
const summary = {};

for (const { key, stage } of UNITS) {
  const dir = path.join(HINT_BASE, key);
  if (!fs.existsSync(dir)) { console.log(`⚠️  ${dir} 없음`); continue; }
  const files = fs.readdirSync(dir).filter(f => /^\d+\.json$/.test(f)).sort();

  // 이 단원 avs 항목을 초기화(존재하지 않는 stale 번호 제거 후 정확히 재작성)
  avs[key] = {};

  // 이 단원의 기존 master 항목 제거(unit이 정확히 key이고 stage 일치) 후 재작성
  for (let i = master.length - 1; i >= 0; i--) {
    if (master[i].unit === key && master[i].stage === stage) master.splice(i, 1);
  }

  summary[key] = [];
  for (const f of files) {
    const num = f.replace('.json', '');           // "001"
    const doc = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const ans = answerForGrading(doc);
    const type = doc.answerType === 'multiple_choice' ? 'objective' : 'subjective';

    // 검수 플레이스홀더(정답 미확정)는 채점 정답으로 연결하지 않는다.
    if (/검수|그림\/보기|원문 없음|\?/.test(ans)) { summary[key].push(`${num}:(검수-skip)`); continue; }

    avs[key][num] = ans;
    avsCount++;

    master.push({ unit: key, stage, problem: Number(num), answer: ans, type });
    masterCount++;

    summary[key].push(`${num}:${ans}`);
  }
}

fs.writeFileSync(AVS_PATH, JSON.stringify(avs, null, 2));
fs.writeFileSync(MASTER_PATH, JSON.stringify(master, null, 2));

console.log(`✅ avs_answers 갱신: ${avsCount}개, answers_master 갱신: ${masterCount}개\n`);
for (const k of Object.keys(summary)) {
  console.log(`── ${k} (${summary[k].length}) ──`);
  console.log('  ' + summary[k].join('  '));
  console.log();
}
