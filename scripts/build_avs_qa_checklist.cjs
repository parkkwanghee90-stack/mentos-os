#!/usr/bin/env node
/**
 * AVS 품질 검수 체크리스트 생성 → docs/AVS_QA_CHECKLIST.md
 * 단원별로 정답 커버리지·프리미엄강의 유무를 표시하고, PCBSA(P/C/B/S/A) + 합격/재생성 체크박스를 만든다.
 */
const fs = require('fs'); const path = require('path');
const ssot = require('../src/data/homeworkSSOT.js');
const ans = require('../src/data/avs_answers.json');
const lectures = require('../src/lib/premiumLectures.json');

const lectureKeys = Object.keys(lectures); // 한글 강의 id
function hasLecture(unit) {
  const t = (unit.title || '').replace(/\s+/g, '');
  const r = (unit.relatedUnit || '').replace(/\s+/g, '');
  return lectureKeys.some(k => { const kk = k.replace(/\s+/g, ''); return t.includes(kk) || kk.includes(t) || r.includes(kk) || kk.includes(r); });
}
function coverage(unit) {
  const m = ans[unit.answerKey] || {};
  const cnt = unit.problemCount || 0;
  let have = 0, excl = 0;
  for (let i = 1; i <= cnt; i++) {
    const p = String(i).padStart(3, '0');
    if (m[p] && m[p] !== '') have++;
    else if (ssot.isExcludedProblem && ssot.isExcludedProblem(unit.answerKey, i)) excl++;
  }
  return { have, cnt, excl };
}
// 기하적/함수 접근이 필요해 도형·그래프 렌더링을 반드시 확인해야 하는 단원
function needsGeomRender(u) {
  const t = (u.title || '') + (u.relatedUnit || '') + (u.answerKey || '');
  return /좌표|직선|원의방정식|도형|이동|함수|그래프|삼각함수|극한|연속|미분|도함수|적분|이차함수|기하|벡터|공간/.test(t);
}
function subjectOf(u) {
  if (u.subject) return u.subject;
  if ((u.answerKey || '').startsWith('수학상')) return '수학(상)';
  if ((u.answerKey || '').startsWith('수학하')) return '수학(하)';
  return '기타';
}
const ORDER = ['수학(상)', '수학(하)', '수학1', '수학2', '미적분', '기타'];

// homeworkSSOT에 없지만 AVS(크롭·힌트·강의)가 있는 추가 단원 (도형의 방정식 그룹 등)
const EXTRA_UNITS = [
  { title: '점과 좌표', answerKey: '수학상_점과좌표', relatedUnit: '도형의 방정식', subject: '수학(상)' },
  { title: '직선의 방정식', answerKey: '수학상_직선의방정식', relatedUnit: '도형의 방정식', subject: '수학(상)' },
  { title: '원의 방정식', answerKey: '수학상_원의방정식', relatedUnit: '도형의 방정식', subject: '수학(상)' },
  { title: '도형의 이동', answerKey: '수학상_도형의이동', relatedUnit: '도형의 방정식', subject: '수학(상)' },
];

const groups = {};
for (const u of [...ssot.HOMEWORK_UNITS, ...EXTRA_UNITS]) {
  const s = subjectOf(u);
  (groups[s] = groups[s] || []).push(u);
}

let md = `# 🎯 AVS 품질 검수 체크리스트\n\n`;
md += `> AVS는 멘토스의 핵심 무기 — 단원별로 직접 돌려보며 **합격/재생성**을 표시하세요.\n`;
md += `> **테스트 경로**: \`/homework\`(숙제 AVS) 또는 \`/class/math\`(수업 중 AVS 실행)에서 해당 단원 문제를 풀고 해설(AVS) 재생.\n`;
md += `> **PCBSA 기준**: P(문제 핵심)·C(접근·조건)·B(핵심 공식 KaTeX 렌더)·S(풀이 흐름·해설)·A(최종 정답 정확).\n`;
md += `> 표기: 정답 = avs_answers 커버리지, 강의 = 프리미엄 AI 노트 유무, 🔷 = 도형/그래프 렌더 필수 단원.\n\n`;
md += `## 검수 항목 (각 AVS마다 확인)\n`;
md += `1. **PCBSA 구조** — P/C/B/S/A 5단계가 빠짐없이 제대로 들어있는가\n`;
md += `2. **정합성** — 해설이 그 문제에 맞는가 (문제와 동떨어진 해설 ✗)\n`;
md += `3. **성의** — 풀이가 충실한가 (한 줄짜리·성의없는 해설 ✗)\n`;
md += `4. **🔷 도형/함수 렌더** — 기하·함수 단원에서 그래프·도형이 실제로 그려지는가 (안 그려지면 보강)\n`;
md += `5. **정답(A)** — 최종 정답이 정확한가\n\n`;
md += `**판정**: 위 항목 모두 양호 → \`☐ 합격\` / 하나라도 부실·오류·미렌더 → \`☐ 재생성\` 체크 + 메모(무엇을 고칠지).\n\n---\n\n`;

let totalUnits = 0;
for (const s of ORDER) {
  const us = groups[s]; if (!us) continue;
  md += `## ${s}\n\n`;
  for (const u of us) {
    totalUnits++;
    const c = coverage(u);
    const cov = c.cnt ? `${c.have}/${c.cnt}` : '-';
    const covMark = (c.have + c.excl >= c.cnt && c.cnt > 0) ? '✅' : (c.have > 0 ? '⚠️' : '❌');
    const exclNote = c.excl ? ` (제외 ${c.excl})` : '';
    const lec = hasLecture(u) ? '강의✅' : '강의—';
    const geom = needsGeomRender(u);
    md += `### ☐ ${u.title}${geom ? '  🔷' : ''}\n`;
    md += `\`정답 ${cov} ${covMark}${exclNote}\` · \`${lec}\` · \`${u.answerKey || u.id}\`\n\n`;
    md += `&nbsp;&nbsp;PCBSA: P☐ C☐ B☐ S☐ A☐ │ 정합성☐ 성의☐${geom ? ' │ 🔷도형·그래프 렌더☐' : ''}  →  **☐ 합격　☐ 재생성**\n\n`;
    md += `&nbsp;&nbsp;메모: \n\n`;
  }
  md += `---\n\n`;
}
md += `\n_총 ${totalUnits}개 단원 · 생성: build_avs_qa_checklist.cjs_\n`;

const out = path.join(__dirname, '..', 'docs', 'AVS_QA_CHECKLIST.md');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, md);
console.log('생성:', out, '/ 단원', totalUnits, '개');
