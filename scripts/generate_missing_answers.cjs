#!/usr/bin/env node
/**
 * 누락된 수학1/미적분 숙제 정답을, 풀이 이미지(*a.webp)를 Gemini 비전으로 읽어 추출·생성.
 * 결과: src/data/generated_answers/<answerKey>.json  ({ "001":"4", ... })
 *
 * 사용법:
 *   node scripts/generate_missing_answers.cjs --unit 수학1_01지수 [--limit 5]
 *   node scripts/generate_missing_answers.cjs --all
 */
const fs = require('fs');
const path = require('path');
try { require('dotenv').config(); } catch {}

const KEY = process.env.VITE_GEMINI_API_KEY;
if (!KEY) { console.error('❌ VITE_GEMINI_API_KEY 필요'); process.exit(1); }
const MODEL = 'gemini-2.5-flash';
const BASE = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets/math_crops/homework';

// answerKey → { folder(서브경로), count }
const UNITS = {
  '수학1_01지수_통합숙제':         { dir: 'math1/01_exponent',        count: 46 },
  '수학1_02로그_통합숙제':         { dir: 'math1/02_logarithm',       count: 43 },
  '수학1_03지수로그함수_통합숙제':  { dir: 'math1/03_explog_func',     count: 72 },
  '수학1_04지수로그함수활용_통합숙제': { dir: 'math1/04_explog_func_util', count: 32 },
  '수학1_05삼각함수정의_통합숙제':  { dir: 'math1/05_trig_def',        count: 33 },
  '수학1_06삼각함수그래프_통합숙제': { dir: 'math1/06_trig_graph',      count: 74 },
  '수학1_07삼각함수활용_통합숙제':  { dir: 'math1/07_trig_util',       count: 44 },
  '수학1_08등차등비수열_통합숙제':  { dir: 'math1/08_seq_apgp',        count: 31 },
  '수학1_09수열의합_통합숙제':      { dir: 'math1/09_seq_sum',         count: 69 },
  '수학1_10수학적귀납법_통합숙제':  { dir: 'math1/10_induction',       count: 45 },
  '미적분_01수열의극한_통합숙제':   { dir: 'calculus/01_seq_limit',    count: 98 },
  '미적분_03지수로그함수미분_통합숙제': { dir: 'calculus/03_explog_derivative', count: 38 },
  '미적분_04삼각함수미분_통합숙제':  { dir: 'calculus/04_trig_derivative', count: 156 },
};

const PROMPT = '이 이미지는 한국 고등학교 수학 문제의 풀이/해설입니다. 이 문제의 "최종 정답"만 추출하세요. ' +
  '객관식이면 보기 번호 하나(1,2,3,4,5 중 하나)만, 주관식이면 최종 숫자 답만 출력하세요. ' +
  '분수는 a/b, 그 외 설명·단위·기호 없이 정답 값만 한 줄로 출력. 정답을 못 찾으면 빈 줄.';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function extractAnswer(imgUrl) {
  const imgRes = await fetch(imgUrl);
  if (!imgRes.ok) return { ok: false, reason: `img ${imgRes.status}` };
  const buf = Buffer.from(await imgRes.arrayBuffer());
  const b64 = buf.toString('base64');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: 'image/webp', data: b64 } }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 200, thinkingConfig: { thinkingBudget: 0 } },
    }),
  });
  if (!res.ok) return { ok: false, reason: `gemini ${res.status}: ${(await res.text()).slice(0,120)}` };
  const j = await res.json();
  const txt = (j.candidates?.[0]?.content?.parts?.[0]?.text || '').trim().replace(/\s+/g, '');
  return { ok: true, answer: txt };
}

async function runUnit(answerKey, limit) {
  const u = UNITS[answerKey];
  if (!u) { console.error('알 수 없는 unit:', answerKey); return; }
  const n = limit || u.count;
  console.log(`\n=== ${answerKey} (${u.dir}) — ${n}/${u.count}문항 ===`);
  const out = {};
  for (let i = 1; i <= n; i++) {
    const pad = String(i).padStart(3, '0');
    const url = `${BASE}/${u.dir}/${pad}a.webp`;
    let r;
    try { r = await extractAnswer(url); } catch (e) { r = { ok: false, reason: e.message }; }
    if (r.ok && r.answer) { out[pad] = r.answer; process.stdout.write(`${pad}=${r.answer} `); }
    else { process.stdout.write(`${pad}=? `); }
    await sleep(600); // rate limit
  }
  const dir = path.join(__dirname, '..', 'src', 'data', 'generated_answers');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, answerKey + '.json'), JSON.stringify(out, null, 0) + '\n');
  console.log(`\n→ 저장: ${Object.keys(out).length}/${n} 추출`);
  return out;
}

(async () => {
  const argv = process.argv.slice(2);
  const arg = (k) => { const i = argv.indexOf(k); return i !== -1 ? argv[i + 1] : null; };
  const limit = arg('--limit') ? parseInt(arg('--limit'), 10) : 0;
  if (argv.includes('--all')) {
    for (const k of Object.keys(UNITS)) await runUnit(k, limit);
  } else if (arg('--unit')) {
    await runUnit(arg('--unit'), limit);
  } else {
    console.log('사용: --unit <answerKey> [--limit N]  또는  --all');
  }
})();
