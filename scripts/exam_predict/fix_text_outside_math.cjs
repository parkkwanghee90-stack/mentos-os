/**
 * 수식($...$) "밖"에 잘못 쓰인 \text{한글} 을 평문으로 푼다 (\text 는 수식 안에서만 유효).
 *   "$..$ \text{이고} $..$"  →  "$..$ 이고 $..$"
 * 수식 "안"의 \text{} 는 그대로 둔다(정상).
 * 고1(exam_predict) + 고2(exam_predict_go2) 전 학교 predicted+cards 처리.
 * 실행: node scripts/exam_predict/fix_text_outside_math.cjs
 */
const fs = require('fs');
const path = require('path');

function fixField(s) {
  if (typeof s !== 'string' || s.indexOf('\\text') === -1) return s;
  // 수식 토큰($$..$$ / $..$)과 비수식 분리
  const parts = s.split(/(\$\$[\s\S]+?\$\$|\$(?:[^$\\]|\\[\s\S])+?\$)/g);
  return parts.map(seg => {
    if (seg.startsWith('$')) return seg; // 수식 안 — \text 유지
    // 비수식 — \text{X} → X (중첩 1단계까지)
    let out = seg;
    for (let i = 0; i < 3; i++) out = out.replace(/\\text\s*\{([^{}]*)\}/g, '$1');
    return out;
  }).join('');
}
function fixP(p) {
  p.latex = fixField(p.latex);
  if (Array.isArray(p.choices)) p.choices = p.choices.map(fixField);
  if (p.solution) p.solution = fixField(p.solution);
  if (Array.isArray(p.avs)) p.avs.forEach(a => { a.title = fixField(a.title); a.content = fixField(a.content); });
  return p;
}

const bases = [
  path.join(__dirname, '..', '..', 'src', 'data', 'exam_predict'),
  path.join(__dirname, '..', '..', 'src', 'data', 'exam_predict_go2'),
];
let changed = 0;
for (const base of bases) {
  for (const kind of ['predicted', 'cards']) {
    const dir = path.join(base, kind);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json') && x !== '_index.json')) {
      const fp = path.join(dir, f);
      const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
      // predicted.problems + predicted.rounds(있으면) 모두 처리
      const probLists = [];
      if (kind === 'cards') {
        if (d.predicted?.problems) probLists.push(d.predicted.problems);
        if (Array.isArray(d.predicted?.rounds)) d.predicted.rounds.forEach(r => probLists.push(r));
      } else {
        if (d.problems) probLists.push(d.problems);
        if (Array.isArray(d.rounds)) d.rounds.forEach(r => probLists.push(r));
      }
      const before = JSON.stringify(probLists);
      probLists.forEach(list => list.forEach(fixP));
      if (JSON.stringify(probLists) !== before) { fs.writeFileSync(fp, JSON.stringify(d, null, 2)); changed++; }
    }
  }
}
console.log(`수식 밖 \\text 정리 — 수정 파일 ${changed}개`);
