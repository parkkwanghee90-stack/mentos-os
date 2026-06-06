#!/usr/bin/env node
/**
 * 수학상+수학2 누락 정답 채우기.
 * 각 누락 문항에 대해: 풀이이미지(*a.webp) 있으면 → 추출(thinking off, 신뢰도↑);
 * 없으면 → 문제이미지(*.webp) AI풀이(thinking on); 그래도 실패 → 미해결(제외 대상).
 * 결과: generated_answers/<answerKey>.json 병합 + _unsolved_sm2.json
 */
const fs = require('fs'); const path = require('path');
try { require('dotenv').config(); } catch {}
const KEY = process.env.VITE_GEMINI_API_KEY;
const ans = require('../src/data/avs_answers.json');
const MODEL = 'gemini-2.5-flash';
const ROOT = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets/math_crops/homework';

const UNITS = [
  // [answerKey, base/dir, count]
  ['수학상_01다항식_통합숙제','math_sang/01_polynomial',21],['수학상_02나머지정리_통합숙제','math_sang/02_remainder',33],
  ['수학상_03인수분해_통합숙제','math_sang/03_factorization',14],['수학상_04복소수_통합숙제','math_sang/04_complex_num',20],
  ['수학상_05이차방정식_통합숙제','math_sang/05_quad_eq',22],['수학상_06이차함수1번숙제_통합숙제','math_sang/06_quad_func_1',21],
  ['수학상_07이차함수2번숙제_통합숙제','math_sang/07_quad_func_2',27],['수학상_08이차함수3번숙제_통합숙제','math_sang/08_quad_func_3',31],
  ['수학상_09고차방정식_통합숙제','math_sang/09_higher_order_eq',22],['수학상_10일차부등식_통합숙제','math_sang/10_linear_ineq',15],
  ['수학상_11이차부등식_통합숙제','math_sang/11_quadratic_ineq',32],['수학상_12경우의수_통합숙제','math_sang/12_cases',38],
  ['수학상_13행렬_통합숙제','math_sang/13_matrix',42],
  ['수학2_01함수의극한_통합숙제','math2/01_limit',46],['수학2_02함수의연속_통합숙제','math2/02_continuity',34],
  ['수학2_03미분계수_통합숙제','math2/03_derivative_coeff',37],['수학2_04도함수활용12_통합숙제','math2/04_derivative_util_12',43],
  ['수학2_05도함수활용3_통합숙제','math2/05_derivative_util_3',42],['수학2_06부정적분정적분_통합숙제','math2/06_integral',69],
  ['수학2_07정적분활용_통합숙제','math2/07_def_integral_util',21],
];
const P_EXTRACT = '이 수학 풀이/해설 이미지에서 최종 정답만 출력. 객관식이면 번호(1~5), 주관식이면 숫자/분수(a/b). 설명 없이 정답만.';
const P_SOLVE = '이 수학 문제를 직접 풀어 마지막 줄에 "ANSWER: <정답>" 형식으로 최종정답만. 객관식이면 번호. 못 풀면 "ANSWER: UNKNOWN".';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function img(url){ const r=await fetch(url); if(!r.ok) return null; return Buffer.from(await r.arrayBuffer()).toString('base64'); }
async function gem(b64, prompt, think){
  const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({contents:[{parts:[{text:prompt},{inline_data:{mime_type:'image/webp',data:b64}}]}],
      generationConfig:{temperature:0,maxOutputTokens:think?4096:200,thinkingConfig:{thinkingBudget:think?2048:0}}})});
  if(!res.ok) return '';
  const j=await res.json();
  return j.candidates?.[0]?.content?.parts?.map(p=>p.text).filter(Boolean).join('')||'';
}

(async()=>{
  const out={}; const unsolved=[]; let ext=0, solv=0;
  for(const [key,dir,cnt] of UNITS){
    const have=ans[key]||{}; out[key]=out[key]||{};
    for(let i=1;i<=cnt;i++){
      const pad=String(i).padStart(3,'0');
      if(have[pad]&&have[pad]!=='') continue; // 이미 있음
      // 1) 풀이 이미지 추출
      let b=await img(`${ROOT}/${dir}/${pad}a.webp`);
      if(b){ const t=(await gem(b,P_EXTRACT,false)).trim().replace(/\s+/g,''); if(t){out[key][pad]=t;ext++;console.log(`📖 ${key} ${pad}=${t}`);await sleep(500);continue;} }
      // 2) 문제 이미지 AI풀이
      b=await img(`${ROOT}/${dir}/${pad}.webp`);
      if(b){ const r=await gem(b,P_SOLVE,true); const m=r.match(/ANSWER:\s*(.+?)\s*$/m); const a=m?m[1].trim():''; if(a&&a!=='UNKNOWN'){out[key][pad]=a;solv++;console.log(`🧮 ${key} ${pad}=${a}`);await sleep(800);continue;} }
      unsolved.push(`${key}/${pad}`); console.log(`❌ ${key} ${pad} 미해결`); await sleep(300);
    }
  }
  const d=path.join(__dirname,'..','src','data','generated_answers');
  for(const k in out){ if(Object.keys(out[k]).length) fs.writeFileSync(path.join(d,'_sm2_'+k+'.json'),JSON.stringify(out[k])); }
  fs.writeFileSync(path.join(d,'_unsolved_sm2.json'),JSON.stringify(unsolved,null,2));
  console.log(`\n추출 ${ext} + AI풀이 ${solv} = ${ext+solv} 해결, 미해결 ${unsolved.length}`);
  console.log('미해결:',unsolved.join(', '));
})();
