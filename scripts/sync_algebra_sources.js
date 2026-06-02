// 3-출처 동기화 (T11) — public/data(정본) → src/data, 대수 키 네임스페이스만 일치.
// 비대수 키(src 고유)는 보존. 대수 키는 public과 정확히 일치하도록:
//   - public에 있는 대수 키 → src에 덮어쓰기(편집 반영)
//   - public에 없는데 src에 있는 대수 키 → src에서 삭제(삭제 반영)
// Supabase Storage는 코드로 건드리지 않음(배포 체크리스트로 분리).
import fs from 'fs';
import path from 'path';
import { isAlgebraKey } from '../src/lib/algebraFix/algebraUnits.js';

const ROOT = process.cwd();
const p = (r) => path.join(ROOT, r);
const readJson = (r) => JSON.parse(fs.readFileSync(p(r), 'utf8'));

// math_problem_texts: 키가 `단원/NNN.webp` → 단원부 추출해 대수 판정
const unitOf = (k) => (k.includes('/') ? k.split('/')[0] : k);

function syncAlgebraNamespace(pubRel, srcRel) {
  if (!fs.existsSync(p(srcRel))) return { added: 0, removed: 0, note: 'src 없음 — 스킵' };
  const pub = readJson(pubRel);
  const src = readJson(srcRel);
  fs.copyFileSync(p(srcRel), p(srcRel) + '.sync.bak');
  const next = { ...src };
  let added = 0;
  let removed = 0;
  // 삭제 반영: src의 대수 키 중 public에 없는 것 제거
  for (const k of Object.keys(next)) {
    if (isAlgebraKey(unitOf(k)) && !(k in pub)) { delete next[k]; removed++; }
  }
  // 편집/추가 반영: public의 대수 키를 src에 반영
  for (const [k, v] of Object.entries(pub)) {
    if (isAlgebraKey(unitOf(k))) { next[k] = v; added++; }
  }
  fs.writeFileSync(p(srcRel), JSON.stringify(next, null, 2));
  return { added, removed };
}

const avs = syncAlgebraNamespace('public/data/avs_answers.json', 'src/data/avs_answers.json');
const txt = syncAlgebraNamespace('public/data/math_problem_texts.json', 'src/data/math_problem_texts.json');
console.log(`[sync] avs_answers: +${avs.added}/-${avs.removed} | math_problem_texts: +${txt.added}/-${txt.removed}`);
