#!/usr/bin/env node
/**
 * 풀이 이미지가 누락된 20문항을, 문제 이미지를 Gemini가 직접 풀어 정답 산출.
 * 추론(thinking) ON. 결과: src/data/generated_answers/_solved_missing.json
 *   { "<answerKey>": { "<NNN>": "정답" }, ... }  + 풀이못함은 _unsolved 에 기록.
 */
const fs = require('fs'); const path = require('path');
try { require('dotenv').config(); } catch {}
const KEY = process.env.VITE_GEMINI_API_KEY;
if (!KEY) { console.error('VITE_GEMINI_API_KEY 필요'); process.exit(1); }
const MODEL = 'gemini-2.5-flash';
const BASE = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets/math_crops/homework/math1';

// answerKey, dir, [누락 문제번호]
const TARGETS = [
  ['수학1_01지수_통합숙제', '01_exponent', [36, 46]],
  ['수학1_02로그_통합숙제', '02_logarithm', [24, 43]],
  ['수학1_03지수로그함수_통합숙제', '03_explog_func', [36, 72]],
  ['수학1_04지수로그함수활용_통합숙제', '04_explog_func_util', [17, 32]],
  ['수학1_05삼각함수정의_통합숙제', '05_trig_def', [19, 33]],
  ['수학1_06삼각함수그래프_통합숙제', '06_trig_graph', [38, 74]],
  ['수학1_07삼각함수활용_통합숙제', '07_trig_util', [16, 44]],
  ['수학1_08등차등비수열_통합숙제', '08_seq_apgp', [18, 31]],
  ['수학1_09수열의합_통합숙제', '09_seq_sum', [42, 69]],
  ['수학1_10수학적귀납법_통합숙제', '10_induction', [25, 45]],
];
const PROMPT = '너는 한국 고등학교 수학 교사다. 이 문제를 직접 풀어라. ' +
  '풀이를 간단히 한 뒤, 반드시 마지막 줄에 "ANSWER: <정답>" 형식으로 최종 정답만 적어라. ' +
  '객관식이면 보기 번호(1~5), 주관식이면 숫자/분수(a/b)/식. 풀 수 없으면 "ANSWER: UNKNOWN".';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function solve(url) {
  const r = await fetch(url); if (!r.ok) return { err: `img ${r.status}` };
  const b64 = Buffer.from(await r.arrayBuffer()).toString('base64');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: 'image/webp', data: b64 } }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 4096, thinkingConfig: { thinkingBudget: 2048 } },
    }),
  });
  if (!res.ok) return { err: `gemini ${res.status}: ${(await res.text()).slice(0,100)}` };
  const j = await res.json();
  const txt = j.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('') || '';
  const m = txt.match(/ANSWER:\s*(.+?)\s*$/m);
  return { answer: m ? m[1].trim() : '', raw: txt.slice(-80) };
}

(async () => {
  const solved = {}; const unsolved = [];
  for (const [key, dir, nums] of TARGETS) {
    solved[key] = solved[key] || {};
    for (const n of nums) {
      const pad = String(n).padStart(3, '0');
      const url = `${BASE}/${dir}/${pad}.webp`;
      let r; try { r = await solve(url); } catch (e) { r = { err: e.message }; }
      const a = r.answer;
      if (a && a !== 'UNKNOWN' && !r.err) { solved[key][pad] = a; console.log(`✅ ${key} ${pad} = ${a}`); }
      else { unsolved.push(`${key}/${pad}`); console.log(`❌ ${key} ${pad} 풀이실패 (${r.err || a || 'empty'})`); }
      await sleep(800);
    }
  }
  const d = path.join(__dirname, '..', 'src', 'data', 'generated_answers');
  fs.writeFileSync(path.join(d, '_solved_missing.json'), JSON.stringify(solved, null, 2));
  fs.writeFileSync(path.join(d, '_unsolved.json'), JSON.stringify(unsolved, null, 2));
  const cnt = Object.values(solved).reduce((s, o) => s + Object.keys(o).length, 0);
  console.log(`\n해결: ${cnt}/20, 미해결: ${unsolved.length} → ${unsolved.join(', ')}`);
})();
