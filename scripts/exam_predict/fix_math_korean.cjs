/**
 * 수식($...$, $$...$$) 안의 토푸(빈 박스) 원인 문자를 정리한다.
 *  - 한글 run  → \text{...} 로 감싼다(수식 안에서 정상 렌더).
 *  - 원숫자(①~⑩) run → 수식 밖으로 빼낸다(KaTeX 글리프 없음 → \text 도 소용없음).
 *  - 수식 밖 평문은 건드리지 않는다. 이미 \text/\mathrm 안의 한글은 보존.
 * 사용: node scripts/exam_predict/fix_math_korean.cjs [학교...]   (인자 없으면 predicted 전체)
 */
const fs = require('fs');
const path = require('path');

const HANGUL = /[가-힣ㄱ-ㅎㅏ-ㅣ]+/g;
const CIRCLED = /[①-⑩]/g;
const base = path.join(__dirname, '..', '..', 'src', 'data', 'exam_predict');

// 수식 내부 inner 를 정리. 원숫자는 밖으로 빼야 하므로 [{math:bool, s}] 조각 배열로 반환.
function cleanInner(inner) {
  // \text{...} 등 보호구간을 토큰화
  const guard = /(\\(?:text|mathrm|operatorname|mbox|textrm|textbf|textsf)\s*\{[^{}]*\})/g;
  const segs = inner.split(guard);
  // 우선 한글 래핑(보호구간 제외)
  const wrapped = segs.map(seg =>
    /^\\(?:text|mathrm|operatorname|mbox|textrm|textbf|textsf)\s*\{/.test(seg)
      ? seg
      : seg.replace(HANGUL, m => `\\text{${m}}`)
  ).join('');
  // 원숫자를 경계로 math / 비math 조각 분리
  if (!CIRCLED.test(wrapped)) return [{ math: true, s: wrapped }];
  const out = [];
  let last = 0; CIRCLED.lastIndex = 0; let m;
  while ((m = CIRCLED.exec(wrapped)) !== null) {
    if (m.index > last) out.push({ math: true, s: wrapped.slice(last, m.index) });
    out.push({ math: false, s: m[0] });
    last = m.index + m[0].length;
  }
  if (last < wrapped.length) out.push({ math: true, s: wrapped.slice(last) });
  return out;
}

// 조각들을 다시 문자열로. 연속 math 조각은 합쳐 $...$ 로, 비math 는 그대로.
function reassemble(pieces, block) {
  const d = block ? '$$' : '$';
  let res = '', buf = '';
  const flush = () => { if (buf.trim()) res += d + buf + d; buf = ''; };
  for (const p of pieces) {
    if (p.math) buf += p.s;
    else { flush(); res += p.s; }
  }
  flush();
  return res;
}

function fixText(s) {
  if (typeof s !== 'string' || s.indexOf('$') === -1) return s;
  let out = s.replace(/\$\$([\s\S]+?)\$\$/g, (mm, inner) => reassemble(cleanInner(inner), true));
  out = out.replace(/\$((?:[^$\\]|\\[\s\S])+?)\$/g, (mm, inner) => reassemble(cleanInner(inner), false));
  return out;
}

function fixProblem(p) {
  p.latex = fixText(p.latex);
  if (Array.isArray(p.choices)) p.choices = p.choices.map(fixText);
  if (Array.isArray(p.avs)) p.avs = p.avs.map(a => ({ ...a, title: fixText(a.title), content: fixText(a.content) }));
  if (p.solution) p.solution = fixText(p.solution);
  if (p.wrong_point) p.wrong_point = fixText(p.wrong_point);
  return p;
}

const pdir = path.join(base, 'predicted');
const schools = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(pdir).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));

let changed = 0;
for (const s of schools) {
  for (const kind of ['predicted', 'cards']) {
    const fp = path.join(base, kind, s + '.json');
    if (!fs.existsSync(fp)) continue;
    const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const probs = kind === 'cards' ? (d.predicted && d.predicted.problems) : d.problems;
    if (!probs) continue;
    const before = JSON.stringify(probs);
    probs.forEach(fixProblem);
    if (JSON.stringify(probs) !== before) { fs.writeFileSync(fp, JSON.stringify(d, null, 2)); changed++; }
  }
}
console.log(`처리 학교 ${schools.length}개 / 수정 파일 ${changed}개`);
