#!/usr/bin/env node
/**
 * AVS auto-QA: 적대적 2차 검증. 문제 이미지 + 생성된 해설(JSON)을 함께 판정.
 *   match    : 해설이 이 문제를 푸는가
 *   answerOk : 해설 결론이 검증된 정답과 일치
 *   depthOk  : 사고력 해설로 충분한가 (단순 답나열/성의없음이면 false) — 앱 핵심 모토
 *   mathOk   : 수식/논리 오류 없음
 * 결과: PASS / FLAGGED. flagged만 사람이 보면 됨. → src/data/homework_avs/_qa_<answerKey>.json
 *
 * 사용: node scripts/verify_homework_avs.cjs --sub math_sang --dir 09_higher_order_eq --answerKey 수학상_09고차방정식_통합숙제 [--limit N]
 */
const fs = require('fs'); const path = require('path');
try { require('dotenv').config(); } catch {}
const KEYS = [process.env.VITE_GEMINI_API_KEY, process.env.VITE_GEMINI_API_KEY_2, process.env.VITE_GEMINI_API_KEY_3].filter(Boolean);
let keyIdx = 0;
const KEY = KEYS[0];
const BASE = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets/math_crops/homework';
const MODEL = 'gemini-2.5-flash';
const arg = k => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : null; };
const sub = arg('--sub'), dir = arg('--dir'), answerKey = arg('--answerKey');
const limit = arg('--limit') ? parseInt(arg('--limit'), 10) : 0;
const pids = arg('--pids') ? new Set(arg('--pids').split(',')) : null; // 특정 문제만 재검증
if (!KEY || !sub || !dir || !answerKey) { console.error('필수: VITE_GEMINI_API_KEY + --sub --dir --answerKey'); process.exit(1); }

const PROMPT = (avsText, answer) => `너는 매우 엄격한 한국 수학 교육 검수자다. 아래는 [문제 이미지]와 그에 대한 [학생용 해설(JSON steps)]이다.
검증된 정답: "${answer}"
다음을 냉정하게 평가하라:
1. match: 이 해설이 바로 이 문제를 푸는가? (다른 문제를 풀거나 무관하면 false)
2. answerOk: 해설의 최종 결론이 검증된 정답과 일치하는가? (객관식이면 번호/값 둘 다 고려)
3. depthOk: "사고력 해설"로 충분한가? — 왜 그렇게 접근하는지(핵심 아이디어/전략)가 드러나야 한다. 단순히 계산만 나열하거나, 한두 줄로 성의없거나, 개념 설명이 빈약하면 false.
4. mathOk: 수식 전개·논리에 오류가 없는가?
issues: 문제점을 한국어로 간단히(없으면 빈 배열).
반드시 JSON만 출력: {"match":bool,"answerOk":bool,"depthOk":bool,"mathOk":bool,"issues":[...]}

[해설 JSON]:
${avsText}`;

async function verify(imgUrl, avsText, answer) {
  const ir = await fetch(imgUrl); if (!ir.ok) return { err: `img ${ir.status}` };
  const b64 = Buffer.from(await ir.arrayBuffer()).toString('base64');
  let res;
  for (let attempt = 0; attempt < KEYS.length * 2; attempt++) {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEYS[keyIdx % KEYS.length]}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT(avsText, answer) }, { inline_data: { mime_type: 'image/webp', data: b64 } }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 4096, thinkingConfig: { thinkingBudget: 1024 }, responseMimeType: 'application/json' },
      }),
    });
    if (res.status !== 429 && res.status !== 503) break;
    keyIdx++; // 쿼터 제한 시 다음 키로 로테이션
    await new Promise(s => setTimeout(s, 2000));
  }
  if (!res.ok) return { err: `gemini ${res.status}` };
  const j = await res.json();
  const raw = j.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('') || '{}';
  try { return { v: JSON.parse(raw) }; }
  catch {
    // 평가문 속 LaTeX 백슬래시(\beta 등)로 JSON이 깨지는 경우 복원
    try { return { v: JSON.parse(raw.replace(/\\(?!["\\\/bfnrtu])/g, '\\\\')) }; }
    catch { return { err: 'parse' }; }
  }
}

(async () => {
  const SHIFT = (sub === 'calculus' || sub === 'calculus_advanced') ? 1 : 0;
  const avsDir = path.join(__dirname, '..', 'src', 'data', 'homework_avs', answerKey);
  let files = fs.readdirSync(avsDir).filter(f => /^\d{3}\.json$/.test(f)).sort();
  if (pids) files = files.filter(f => pids.has(f.replace('.json', '')));
  const flagged = []; let pass = 0;
  const n = limit || files.length;
  for (const f of files.slice(0, n)) {
    const pid = f.replace('.json', '');
    const avs = JSON.parse(fs.readFileSync(path.join(avsDir, f), 'utf8'));
    const probImg = `${BASE}/${sub}/${dir}/${pid}.webp`;
    // steps 배열이 없는 최상위 PCBSA 구조(통합숙제 비전 생성본)도 검증 가능하게 직렬화
    const avsBody = avs.steps || { P: avs.P, C: avs.C, B: avs.B, S: avs.S, A: avs.A };
    const r = await verify(probImg, JSON.stringify(avsBody), avs.finalAnswer);
    if (r.err) { console.log(`?  ${pid}: ${r.err}`); continue; }
    const v = r.v;
    const ok = v.match && v.answerOk && v.depthOk && v.mathOk;
    if (ok) { pass++; process.stdout.write(`✅${pid} `); }
    else { flagged.push({ pid, ...v }); process.stdout.write(`🚩${pid} `); }
    await new Promise(s => setTimeout(s, 700));
  }
  // --pids 부분 재검증 시: 기존 플래그에서 재검증한 pid를 빼고 새 결과를 병합
  let outFlagged = flagged;
  const qaPath = path.join(avsDir, `_qa_${answerKey}.json`);
  if (pids) {
    let prev = [];
    try { prev = JSON.parse(fs.readFileSync(qaPath, 'utf8')); } catch {}
    outFlagged = prev.filter(x => !pids.has(x.pid)).concat(flagged).sort((a, b) => a.pid.localeCompare(b.pid));
  }
  fs.writeFileSync(qaPath, JSON.stringify(outFlagged, null, 2));
  console.log(`\n\n통과 ${pass} / 플래그 ${flagged.length}`);
  flagged.forEach(x => console.log(`  🚩 ${x.pid}: ${[!x.match&&'매칭X',!x.answerOk&&'정답X',!x.depthOk&&'깊이부족',!x.mathOk&&'수식오류'].filter(Boolean).join(',')} — ${(x.issues||[]).join('; ')}`));
})();
