/**
 * 예상문제 5선 포스터용 데이터 생성(결정적, LLM 불필요).
 * 미게시 학교 카드에서 대표 5문항 선별 → data_problems/<grade>__<slug>.json (정답·풀이 제외).
 * 사용: node 03_problems_data.cjs
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { queue } = require('./01_pick.cjs');
const OUT = path.join(__dirname, 'data_problems');
fs.mkdirSync(OUT, { recursive: true });

const CARD = { go1: 'src/data/exam_predict/cards', go2: 'src/data/exam_predict_go2/cards' };
const META = { go1: { g: '고1', s: '공통수학1' }, go2: { g: '고2', s: '수학Ⅰ' } };

function pick5(probs) {
  const basic = probs.filter(p => p.level === '기본');
  const adv = probs.filter(p => p.level === '심화');
  // 서술형(심화) 우선 → 변별 문항 노출
  const advSorted = [...adv].sort((a, b) => (a.type === '서술형' ? -1 : 1) - (b.type === '서술형' ? -1 : 1));
  const pick = [];
  for (const p of basic.slice(0, 2)) pick.push(p);
  for (const p of advSorted) { if (pick.length >= 5) break; pick.push(p); }
  for (const p of probs) { if (pick.length >= 5) break; if (!pick.includes(p)) pick.push(p); }
  return pick.slice(0, 5).sort((a, b) => (a.num || 0) - (b.num || 0));
}

let ok = 0;
for (const { grade, slug, region } of queue) {
  try {
    const card = JSON.parse(fs.readFileSync(path.join(ROOT, CARD[grade], `${slug}.json`), 'utf8'));
    const probs = card.predicted.problems || (card.predicted.rounds && card.predicted.rounds[0]) || [];
    if (!probs.length) { console.log(`⚠️ ${slug}: 문항 없음`); continue; }
    const m = META[grade];
    const data = {
      school: slug, region: card.region || region || '', grade: m.g, subject: m.s,
      qr: `https://www.mathmentos.com/class/exam-predict/${grade}/${encodeURIComponent(slug)}?ref=blog`,
      probs: pick5(probs).map(p => ({
        n: p.num, u: p.unit, lv: p.level, type: p.type, latex: p.latex,
        ...(p.type === '객관식' && Array.isArray(p.choices) && p.choices.length ? { choices: p.choices } : {}),
      })),
    };
    fs.writeFileSync(path.join(OUT, `${grade}__${slug}.json`), JSON.stringify(data, null, 1));
    ok++;
  } catch (e) { console.log(`❌ ${slug}: ${e.message}`); }
}
console.log(`예상문제 데이터 ${ok}/${queue.length}개 → data_problems/`);
