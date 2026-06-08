#!/usr/bin/env node
/**
 * 누락 AVS 보완: 한 학교에서 AVS 없는 문제만, 해설 페이지를 폭넓게 탐색해 생성.
 * 사용: node scripts/naesin/fill_missing_avs.cjs --pages /tmp/exam_png/s01 --problems /tmp/naesin_out/s01.json --out /tmp/naesin_avs/s01
 */
const fs = require('fs'); const path = require('path');
try { require('dotenv').config(); } catch {}
const KEY = process.env.VITE_GEMINI_API_KEY; const M = 'gemini-2.5-flash';
const arg = k => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : null; };
const pagesDir = arg('--pages'), problemsFile = arg('--problems'), outDir = arg('--out');
if (!KEY || !pagesDir || !problemsFile || !outDir) { console.error('필수 인자'); process.exit(1); }
const img = f => ({ inline_data: { mime_type: 'image/png', data: fs.readFileSync(f).toString('base64') } });
async function gem(parts, schema, mt = 8192, th = 2048) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${M}:generateContent?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.1, maxOutputTokens: mt, thinkingConfig: { thinkingBudget: th }, responseMimeType: 'application/json', ...(schema ? { responseSchema: schema } : {}) } }),
  });
  if (!res.ok) throw new Error(res.status + ':' + (await res.text()).slice(0, 70));
  const j = await res.json();
  return JSON.parse(j.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('') || '{}');
}
const AVS_SCHEMA = { type: 'object', properties: { found: { type: 'boolean' }, steps: { type: 'array', items: { type: 'object', properties: { phase: { type: 'string' }, title: { type: 'string' }, content: { type: 'string' } }, required: ['phase', 'title', 'content'] } } }, required: ['found'] };

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const probs = JSON.parse(fs.readFileSync(problemsFile, 'utf8')).problems;
  const pages = fs.readdirSync(pagesDir).filter(f => /\.png$/.test(f)).sort();
  const missing = probs.filter(p => !fs.existsSync(path.join(outDir, String(p.num).padStart(3, '0') + '.json')));
  if (!missing.length) { console.log('  누락 없음'); return; }
  console.log('  누락 ' + missing.length + '개: ' + missing.map(p => p.num).join(','));
  // 해설 후보 페이지: 전 페이지 탐색(누락분이 적으니 철저히)
  const solPages = pages;
  let filled = 0;
  for (const p of missing) {
    const pad = String(p.num).padStart(3, '0');
    for (const pg of solPages) {
      try {
        const prompt = `이 해설 이미지에 ${p.num}번 문제의 풀이가 있으면 found=true와 함께 PCBSA(P목표/C조건/B개념/S단계풀이 여러단계/A정답"${p.answer}") 단계로 재구성(이해쉽게, KaTeX). 없으면 found=false. 문제:${p.latex}`;
        const r = await gem([{ text: prompt }, img(path.join(pagesDir, pg))], AVS_SCHEMA);
        if (r.found && (r.steps || []).length >= 3) {
          fs.writeFileSync(path.join(outDir, pad + '.json'), JSON.stringify({ problem_id: p.id || pad, unit: p.unit, level: p.level, type: 'algebra', steps: r.steps, final_answer: p.answer, correctAnswer: p.answer, pcbsa_completed: true }, null, 2));
          filled++; process.stdout.write(p.num + ' '); break;
        }
        await new Promise(s => setTimeout(s, 400));
      } catch {}
    }
  }
  console.log('\n  채움 ' + filled + '/' + missing.length);
})();
