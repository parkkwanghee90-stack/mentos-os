#!/usr/bin/env node
/**
 * 숙제 AVS(PCBSA) 해설 생성: 풀이이미지(*a.webp)를 Gemini 비전으로 읽어 PCBSA 단계 JSON 생성.
 * 정답(A)은 검증된 avs_answers.json 값을 사용(신뢰). 결과: src/data/homework_avs/<unitKey>/<NNN>.json
 *
 * 사용:
 *   node scripts/generate_homework_avs.cjs --sub math_sang --dir 09_higher_order_eq --answerKey 수학상_09고차방정식_통합숙제 --limit 3
 */
const fs = require('fs'); const path = require('path');
try { require('dotenv').config(); } catch {}
const KEY = process.env.VITE_GEMINI_API_KEY;
const ans = require('../src/data/avs_answers.json');
const BASE = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets/math_crops/homework';
const MODEL = 'gemini-2.5-flash';

const arg = k => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : null; };
const sub = arg('--sub'), dir = arg('--dir'), answerKey = arg('--answerKey');
const limit = arg('--limit') ? parseInt(arg('--limit'), 10) : 0;
const count = arg('--count') ? parseInt(arg('--count'), 10) : 999;
if (!KEY || !sub || !dir || !answerKey) { console.error('필수: VITE_GEMINI_API_KEY, --sub --dir --answerKey'); process.exit(1); }

const PROMPT = `이 이미지는 한국 고등학교 수학 문제의 풀이(해설)입니다. 이것을 학생용 PCBSA 단계 해설로 변환하세요.
- P(Problem): 이 문제에서 구해야 하는 목표 한 줄
- C(Concept): 풀이 접근/주어진 조건 분석
- B(Background): 사용하는 핵심 공식 (KaTeX)
- S(Solution): 풀이 흐름을 2~4개 핵심 단계로 (KaTeX 포함)
반드시 아래 JSON만 출력 (설명/백틱 금지):
{"steps":[{"step":1,"label":"[P] 목표","latex":"..."},{"step":2,"label":"[C] 접근","latex":"..."},{"step":3,"label":"[B] 핵심 공식","latex":"..."},{"step":4,"label":"[S] 풀이","latex":"..."},{"step":5,"label":"[S] 풀이","latex":"..."}]}
수식은 KaTeX raw(달러 기호 없이). 설명 텍스트는 한국어. 풀이가 짧으면 S 단계 1개만.`;

async function gen(url) {
  const ir = await fetch(url); if (!ir.ok) return { err: `img ${ir.status}` };
  const b64 = Buffer.from(await ir.arrayBuffer()).toString('base64');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: 'image/webp', data: b64 } }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096, thinkingConfig: { thinkingBudget: 1024 }, responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) return { err: `gemini ${res.status}: ${(await res.text()).slice(0, 140)}` };
  const j = await res.json();
  const txt = j.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('') || '';
  try { return { obj: JSON.parse(txt) }; } catch { return { err: 'JSON parse', raw: txt.slice(0, 200) }; }
}

(async () => {
  const outDir = path.join(__dirname, '..', 'src', 'data', 'homework_avs', answerKey);
  fs.mkdirSync(outDir, { recursive: true });
  const amap = ans[answerKey] || {};
  const n = limit || count;
  let ok = 0, fail = 0;
  // 미적분(calculus) 통합숙제는 해설 이미지가 +1 밀려 저장됨(문제 N 해설=(N+1)a.webp) → 매칭 보정
  const SHIFT = (sub === 'calculus' || sub === 'calculus_advanced') ? 1 : 0;
  for (let i = 1; i <= n; i++) {
    const pad = String(i).padStart(3, '0');
    const solPad = String(i + SHIFT).padStart(3, '0');
    const r = await gen(`${BASE}/${sub}/${dir}/${solPad}a.webp`);
    if (r.err) { console.log(`❌ ${pad}: ${r.err}`); fail++; if (r.err.startsWith('img')) { if (i > count) break; } continue; }
    const finalAnswer = amap[pad] != null ? String(amap[pad]) : '';
    const hint = {
      type: 'algebra', problem_id: pad, unit_name: answerKey,
      steps: r.obj.steps || [],
      finalAnswer, correctAnswer: finalAnswer, pcbsa_completed: true,
    };
    fs.writeFileSync(path.join(outDir, `${pad}.json`), JSON.stringify(hint, null, 2));
    console.log(`✅ ${pad}: ${(r.obj.steps || []).length}단계, 정답 ${finalAnswer}`);
    ok++;
    await new Promise(s => setTimeout(s, 700));
  }
  console.log(`\n생성 ${ok} / 실패 ${fail} → ${outDir}`);
})();
