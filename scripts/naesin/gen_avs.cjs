#!/usr/bin/env node
/**
 * 내신 자동화 3단계: PDF 해설지 → 문제별 PCBSA 단계 AVS.
 * 해설을 "재구성"(토씨 베끼기 X, 이해하기 쉽게)하여 P/C/B/S(여러 단계)/A로 정리.
 * 정답은 검증된 값을 주입. responseSchema로 유효 JSON 보장.
 *
 * 사용(단일 문제 데모):
 *   node scripts/naesin/gen_avs.cjs --solImg /tmp/exam_png/s13/p06.png --num 1 --answer 1 \
 *     --problem "삼차방정식 x^3+1=0의 한 허근 ω, ω^4/(1+ω^2)" --out /tmp/avs_demo.json
 */
const fs = require('fs');
try { require('dotenv').config(); } catch {}
const KEY = process.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const arg = k => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : null; };
const solImgs = (arg('--solImg') || '').split(',').filter(Boolean);
const num = arg('--num'), answer = arg('--answer'), problem = arg('--problem') || '', out = arg('--out');
if (!KEY || !solImgs.length || !out) { console.error('필수: VITE_GEMINI_API_KEY + --solImg --out'); process.exit(1); }

const PROMPT = `너는 한국 고등학교 수학 1:1 과외 교사다. 아래 [해설지 이미지]에서 ${num}번 문제의 풀이를 찾아, 학생이 이해하기 쉬운 PCBSA 단계별 AVS 해설로 재구성하라.
- 해설지를 토씨 그대로 베끼지 말 것. 흐름을 이해하기 쉽게 다듬되, 풀이의 핵심 논리/계산은 빠짐없이.
- 단계 구성:
  - P(문제 분석): 이 문제가 무엇을 구하는지(목표)
  - C(핵심 단서): 주어진 조건/실마리
  - B(배경 지식): 필요한 개념·공식
  - S(단계별 풀이): 풀이 과정을 여러 단계로 잘게(필요하면 6~12단계). 각 단계 한 가지 논리.
  - A(최종 정답): 풀이 마무리 + 정답 "${answer}"
- content는 한국어 설명 + KaTeX(인라인 $...$, 블록 $$...$$).
${problem ? '문제: ' + problem : ''}`;

const SCHEMA = {
  type: 'object',
  properties: {
    steps: { type: 'array', items: { type: 'object', properties: {
      phase: { type: 'string', enum: ['P', 'C', 'B', 'S', 'A'] },
      title: { type: 'string' },
      content: { type: 'string' },
    }, required: ['phase', 'title', 'content'] } },
  },
  required: ['steps'],
};

(async () => {
  const parts = [{ text: PROMPT }];
  for (const p of solImgs) parts.push({ inline_data: { mime_type: 'image/png', data: fs.readFileSync(p).toString('base64') } });
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.1, maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 3072 }, responseMimeType: 'application/json', responseSchema: SCHEMA } }),
  });
  if (!res.ok) { console.error('gemini', res.status, (await res.text()).slice(0, 150)); process.exit(1); }
  const j = await res.json();
  const r = JSON.parse(j.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('') || '{}');
  const avs = { problem_id: String(num).padStart(3, '0'), type: 'algebra', steps: r.steps || [], final_answer: answer, correctAnswer: answer, pcbsa_completed: true };
  fs.writeFileSync(out, JSON.stringify(avs, null, 2));
  console.log(`✅ ${num}번 AVS ${(r.steps || []).length}단계 → ${out}`);
})();
