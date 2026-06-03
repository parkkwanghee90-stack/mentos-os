// auto-wrap 적용 러너 (T12 적용) — un-wrapped LaTeX를 $…$로 감싼다.
// A: public/data/math_problem_texts.json (대수 문자열 항목)
// B: public/data/avs_answers.json (대수 단원의 문자열 값 — 해설 등)
// 안전: 모듈(latexWrap)이 새 $$/$$$/한글-글루/이슈악화를 만들지 않음을 보장하지만,
//       러너에서도 방어적으로 재검사해 anomaly가 있으면 그 항목은 건너뛴다.
import fs from 'fs';
import path from 'path';
import { wrapPlainLatex } from '../src/lib/algebraFix/latexWrap.js';
import { detectIssues } from '../src/lib/algebraFix/latexDetect.js';
import { isAlgebraKey } from '../src/lib/algebraFix/algebraUnits.js';

const ROOT = process.cwd();
const p = (r) => path.join(ROOT, r);
const readJson = (r) => JSON.parse(fs.readFileSync(p(r), 'utf8'));
const dd = (s) => (s.match(/\$\$/g) || []).length;
const trip = (s) => /\$\$\$/.test(s);
const glue = (s) => (s.match(/[가-힣]\$|\$[가-힣]/g) || []).length;

// anomaly 가드: 변환 결과가 원본 대비 새 $$ / $$$ / 한글글루 / 이슈악화를 만들면 거부
function safeOrNull(before, after) {
  if (after === before) return null;
  if (dd(after) > dd(before)) return null;
  if (trip(after) && !trip(before)) return null;
  if (glue(after) > glue(before)) return null;
  if (detectIssues(after).length > detectIssues(before).length) return null;
  return after;
}

const A_FILE = 'public/data/math_problem_texts.json';
const B_FILE = 'public/data/avs_answers.json';
fs.copyFileSync(p(A_FILE), p(A_FILE) + '.wrap.bak');
fs.copyFileSync(p(B_FILE), p(B_FILE) + '.wrap.bak');

const diff = [];
let anomalies = 0;

// ---- A ----
const mathTexts = readJson(A_FILE);
const nextA = { ...mathTexts };
let aApplied = 0;
for (const [k, v] of Object.entries(mathTexts)) {
  if (!isAlgebraKey(k.split('/')[0]) || typeof v !== 'string') continue;
  const r = wrapPlainLatex(v);
  const safe = safeOrNull(v, r.output);
  if (r.output !== v && safe === null) { anomalies++; continue; }
  if (safe) { nextA[k] = safe; aApplied++; diff.push({ f: 'A', k, before: v, after: safe, wrapped: r.wrapped }); }
}
fs.writeFileSync(p(A_FILE), JSON.stringify(nextA, null, 2));

// ---- B ----
const avs = readJson(B_FILE);
const nextB = { ...avs };
let bApplied = 0;
for (const [unit, obj] of Object.entries(avs)) {
  if (!isAlgebraKey(unit) || !obj || typeof obj !== 'object') continue;
  const nObj = { ...obj };
  let touched = false;
  for (const [num, val] of Object.entries(obj)) {
    if (typeof val !== 'string') continue;
    const r = wrapPlainLatex(val);
    const safe = safeOrNull(val, r.output);
    if (r.output !== val && safe === null) { anomalies++; continue; }
    if (safe) { nObj[num] = safe; touched = true; bApplied++; diff.push({ f: 'B', k: `${unit}/${num}`, before: val, after: safe, wrapped: r.wrapped }); }
  }
  if (touched) nextB[unit] = nObj;
}
fs.writeFileSync(p(B_FILE), JSON.stringify(nextB, null, 2));

// ---- report ----
const md = ['# auto-wrap 적용 diff (2026-06-02)', '', `A(문제본문) ${aApplied}건, B(AVS해설) ${bApplied}건 적용 / anomaly skip ${anomalies}건`, '']
  .concat(diff.slice(0, 200).map((d) => `- [${d.f}] \`${d.k}\` (wrapped ${d.wrapped})\n  - B: \`${d.before.slice(0, 110)}\`\n  - A: \`${d.after.slice(0, 110)}\``))
  .join('\n');
fs.mkdirSync(p('docs/superpowers/specs'), { recursive: true });
fs.writeFileSync(p('docs/superpowers/specs/2026-06-02-latex-wrap-diff.md'), md);
console.log(`[wrap] A=${aApplied}, B=${bApplied}, anomalies=${anomalies} (backups: *.wrap.bak)`);
