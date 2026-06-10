#!/usr/bin/env node
/**
 * 내신 자동화 2단계: 페이지 PNG들 → 문제별 [단원·필수/심화·LaTeX·정답] JSON.
 * 학교명/출처는 저장하지 않음(저작권). 단원 + 필수/심화로만 분류.
 *
 * 사용: node scripts/naesin/extract_exam.cjs --dir <png_dir> --grade 고1 --out <out.json>
 */
const fs = require('fs'); const path = require('path');
try { require('dotenv').config(); } catch {}
const KEY = process.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const arg = k => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : null; };
const dir = arg('--dir'), grade = arg('--grade') || '고1', out = arg('--out');
if (!KEY || !dir || !out) { console.error('필수: VITE_GEMINI_API_KEY + --dir --out'); process.exit(1); }

const PROMPT = `너는 한국 고등학교 수학 내신 기출 분석가다. 이 페이지 이미지를 분석해 JSON으로만 답하라.
페이지 종류 판별:
- 문제 페이지: 각 문제를 추출
- "빠른정답"/정답표 페이지: 번호→정답 맵 추출
- 그 외(표지/해설 본문): page_type="other"

각 문제 추출 항목:
- num: 문제 번호(정수)
- type: "객관식" | "주관식" | "서술형"
- unit: 단원명(한국어, 예: 다항식/나머지정리/인수분해/복소수/이차방정식/이차함수/고차방정식/이차부등식/연립부등식/연립방정식/절댓값부등식/경우의수/순열조합/행렬/지수/로그/지수로그함수/삼각함수/수열 등 ${grade} 과정)
- level: "필수" | "심화"  (필수=단일개념 표준유형 / 심화=복합·다단계·함정·고난도)
- latex: 문제 본문을 KaTeX로 (인라인 $...$, 블록 $$...$$, JSON이므로 백슬래시 이중 \\\\). 도형/그래프가 있으면 끝에 " [그림]" 표기.

빠른정답표면: answers 배열에 {num, answer}. 객관식 answer는 보기번호(1~5), 주관식/서술형은 값 그대로(문자열).
빠른정답표는 한 칸도 빠짐없이 정확히 읽어라(가장 중요).`;

const SCHEMA = {
  type: 'object',
  properties: {
    page_type: { type: 'string', enum: ['problems', 'answers', 'other'] },
    problems: { type: 'array', items: { type: 'object', properties: {
      num: { type: 'integer' }, type: { type: 'string' }, unit: { type: 'string' },
      level: { type: 'string' }, latex: { type: 'string' },
    }, required: ['num', 'unit', 'level', 'latex'] } },
    answers: { type: 'array', items: { type: 'object', properties: {
      num: { type: 'integer' }, answer: { type: 'string' },
    }, required: ['num', 'answer'] } },
  },
  required: ['page_type'],
};

async function callGemini(b64) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: 'image/png', data: b64 } }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 2048 }, responseMimeType: 'application/json', responseSchema: SCHEMA },
    }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 120)}`);
  const j = await res.json();
  return JSON.parse(j.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('') || '{}');
}

(async () => {
  const pngs = fs.readdirSync(dir).filter(f => /\.png$/i.test(f)).sort();
  const problems = {}; const answers = {};
  for (const f of pngs) {
    try {
      const b64 = fs.readFileSync(path.join(dir, f)).toString('base64');
      const r = await callGemini(b64);
      (r.problems || []).forEach(p => { if (p && p.num != null) problems[p.num] = p; });
      // 빠른정답표(먼저 등장)를 권위로: 이미 있는 정답은 해설 페이지가 덮어쓰지 않음(first-wins)
      (r.answers || []).forEach(a => { if (a && a.num != null && answers[a.num] === undefined) answers[a.num] = a.answer; });
      process.stdout.write(`${f}:${r.page_type || '?'}(${(r.problems || []).length}p,${(r.answers || []).length}a) `);
      await new Promise(s => setTimeout(s, 800));
    } catch (e) { console.log(`\n  ${f} ERR ${e.message}`); }
  }
  // 정답 병합
  const list = Object.values(problems).sort((a, b) => a.num - b.num).map(p => ({
    num: p.num, type: p.type || '객관식', unit: p.unit || '미분류', level: p.level || '필수',
    latex: p.latex || '', answer: answers[p.num] ?? null,
  }));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ grade, problemCount: list.length, problems: list }, null, 2));
  const noAns = list.filter(p => p.answer == null).length;
  console.log(`\n✅ ${list.length}문제 → ${out} (정답없음 ${noAns}, 필수 ${list.filter(p=>p.level==='필수').length}/심화 ${list.filter(p=>p.level==='심화').length})`);
})();
