#!/usr/bin/env node
/**
 * 내신 AVS 배치: 한 학교 폴더(페이지 PNG) + 추출 문제 JSON → 문제별 PCBSA 단계 AVS.
 * 1) 각 해설 페이지가 어떤 문제 번호의 풀이를 담는지 매핑
 * 2) 문제별로 해당 해설 페이지 → gen AVS (해설 재구성, 이해 쉽게)
 * 사용: node scripts/naesin/gen_avs_batch.cjs --pages /tmp/exam_png/s13 --problems /tmp/naesin_out/s13.json --out /tmp/naesin_avs/s13
 */
const fs = require('fs'); const path = require('path');
try { require('dotenv').config(); } catch {}
const KEY = process.env.VITE_GEMINI_API_KEY;
const M = 'gemini-2.5-flash';
const arg = k => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : null; };
const pagesDir = arg('--pages'), problemsFile = arg('--problems'), outDir = arg('--out');
if (!KEY || !pagesDir || !problemsFile || !outDir) { console.error('필수: --pages --problems --out'); process.exit(1); }

async function gem(parts, schema, maxTok = 8192, think = 2048) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${M}:generateContent?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.1, maxOutputTokens: maxTok, thinkingConfig: { thinkingBudget: think }, responseMimeType: 'application/json', ...(schema ? { responseSchema: schema } : {}) } }),
  });
  if (!res.ok) throw new Error(`${res.status}:${(await res.text()).slice(0, 80)}`);
  const j = await res.json();
  return JSON.parse(j.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('') || '{}');
}
const img = f => ({ inline_data: { mime_type: 'image/png', data: fs.readFileSync(f).toString('base64') } });

const AVS_SCHEMA = { type: 'object', properties: { steps: { type: 'array', items: { type: 'object', properties: {
  phase: { type: 'string', enum: ['P', 'C', 'B', 'S', 'A'] }, title: { type: 'string' }, content: { type: 'string' },
}, required: ['phase', 'title', 'content'] } } }, required: ['steps'] };

(async () => {
  const probs = JSON.parse(fs.readFileSync(problemsFile, 'utf8')).problems;
  const pages = fs.readdirSync(pagesDir).filter(f => /\.png$/.test(f)).sort();
  fs.mkdirSync(outDir, { recursive: true });

  // 1) 해설 페이지 → 문제번호 매핑
  const pageNums = {}; // file -> [nums]
  for (const pg of pages) {
    try {
      const r = await gem([{ text: '이 페이지가 문제 풀이/해설 페이지면 해당 문제 번호들을 nums에, 아니면 빈 배열. JSON {"nums":[1,2]}' }, img(path.join(pagesDir, pg))],
        { type: 'object', properties: { nums: { type: 'array', items: { type: 'integer' } } }, required: ['nums'] }, 200, 0);
      pageNums[pg] = r.nums || [];
      await new Promise(s => setTimeout(s, 400));
    } catch { pageNums[pg] = []; }
  }
  const pageForNum = {};
  for (const [pg, nums] of Object.entries(pageNums)) for (const n of nums) if (!pageForNum[n]) pageForNum[n] = pg;

  // 2) 문제별 AVS 생성
  let ok = 0, miss = 0;
  for (const p of probs) {
    const pg = pageForNum[p.num];
    if (!pg) { miss++; continue; }
    try {
      const prompt = `너는 한국 고교 수학 1:1 과외교사다. [해설지]에서 ${p.num}번 풀이를 찾아 학생이 이해하기 쉬운 PCBSA 단계 AVS로 재구성하라(토씨 베끼기 금지, 핵심 논리/계산은 빠짐없이).
P(목표) C(주어진 조건·단서) B(필요 개념·공식) S(단계별 풀이, 필요시 6~12단계, 한 단계 한 논리) A(정답 "${p.answer}").
content는 한국어+KaTeX(인라인 $...$, 블록 $$...$$). 문제: ${p.latex}`;
      const r = await gem([{ text: prompt }, img(path.join(pagesDir, pg))], AVS_SCHEMA);
      const avs = { problem_id: p.id || String(p.num), unit: p.unit, level: p.level, type: 'algebra', steps: r.steps || [], final_answer: p.answer, correctAnswer: p.answer, pcbsa_completed: true };
      fs.writeFileSync(path.join(outDir, `${String(p.num).padStart(3, '0')}.json`), JSON.stringify(avs, null, 2));
      ok++; process.stdout.write(`${p.num}(${(r.steps || []).length}) `);
      await new Promise(s => setTimeout(s, 700));
    } catch (e) { miss++; process.stdout.write(`${p.num}✗ `); }
  }
  console.log(`\n✅ AVS ${ok}개 생성 / 해설없음 ${miss} → ${outDir}`);
})();
