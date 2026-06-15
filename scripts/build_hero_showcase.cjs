/**
 * 대문 "라이브 예상문제" 캐러셀용 경량 데이터 추출 (고1·고2 둘 다).
 * 각 번들에서 학교당 1문항씩 전 학교 추출 → heroExamShowcase.js / heroExamShowcaseGo2.js
 * 실행: node scripts/build_hero_showcase.cjs
 */
const fs = require('fs');
const path = require('path');

function clean(t) {
  if (typeof t !== 'string') return false;
  const nb = t.replace(/\$\$[\s\S]+?\$\$/g, '');
  if ((nb.match(/(?<!\\)\$/g) || []).length % 2 !== 0) return false;
  if (/\$\{[A-Za-z_]/.test(t)) return false;
  const spans = [];
  t.replace(/\$([^$]+)\$/g, (m, i) => { spans.push(i); return ''; });
  for (const sp of spans) {
    const s = sp.replace(/\\(?:text|mathrm|operatorname)\s*\{[^{}]*\}/g, '');
    if (/[가-힣ㄱ-ㅎ①-⑩]/.test(s)) return false;
  }
  return true;
}
const CIRC = ['①', '②', '③', '④', '⑤'];

function pickFromSchool(probs, maxLatex) {
  for (const p of probs) {
    if (!p.latex || p.latex.length > maxLatex || !clean(p.latex)) continue;
    if (Array.isArray(p.choices) && (p.choices.length !== 5 || !p.choices.every(clean))) continue;
    const avs = Array.isArray(p.avs) ? p.avs : [];
    const B = avs.find(a => a.phase === 'B'), A = avs.find(a => a.phase === 'A'), S = avs.find(a => a.phase === 'S');
    const keyStep = (B && clean(B.content) && B.content.length <= 180) ? B : (S && clean(S.content) && S.content.length <= 180 ? S : null);
    const ansStep = (A && clean(A.content)) ? A : null;
    if (!keyStep || !ansStep) continue;
    return { p, key: keyStep.content, solve: ansStep.content };
  }
  return null;
}

function build(bundlePath, outFile, exportName) {
  if (!fs.existsSync(bundlePath)) { console.log(`(스킵: ${bundlePath} 없음)`); return; }
  const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
  const picked = [];
  for (const s of bundle.schools) {
    const probs = (s.rounds && s.rounds[0] && s.rounds[0].problems) || [];
    const got = pickFromSchool(probs, 200) || pickFromSchool(probs, 280);
    if (!got) continue;
    const p = got.p;
    const ansLabel = (typeof p.answer === 'number' && p.answer >= 1 && p.answer <= 5) ? CIRC[p.answer - 1] : null;
    picked.push({
      school: s.school, region: s.region || '', unit: p.unit || '', level: p.level || '',
      type: p.type || '객관식', latex: p.latex, choices: p.choices || null,
      answer: ansLabel ? `${ansLabel} ${typeof p.answer === 'number' ? '' : p.answer}`.trim() : String(p.answer ?? ''),
      key: got.key, solve: got.solve,
    });
  }
  const out = `/* 자동생성(scripts/build_hero_showcase.cjs) — 대문 라이브 예상문제 캐러셀용 전 학교 엄선 데이터. 직접 수정 금지. */
export const ${exportName} = ${JSON.stringify(picked, null, 0)};
`;
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', outFile), out);
  console.log(`${exportName}: ${bundle.schools.length}교 중 ${picked.length}교 → ${outFile} (${Math.round(out.length / 1024)}KB)`);
}

build(path.join(__dirname, '..', 'src', 'data', 'exam_predict', 'exam_predict_bundle.json'), 'heroExamShowcase.js', 'HERO_EXAM_SHOWCASE');
build(path.join(__dirname, '..', 'src', 'data', 'exam_predict_go2', 'exam_predict_bundle.json'), 'heroExamShowcaseGo2.js', 'HERO_EXAM_SHOWCASE_GO2');
