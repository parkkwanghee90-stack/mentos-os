#!/usr/bin/env node
// 수동 저작 워크플로우 결과 → 힌트 조립·KaTeX검증·업로드·매니페스트 등록
// 사용: node /tmp/assemble_manual_hints.cjs <output.json> <jobs.json>
require('dotenv').config({ path: '/Users/mac/mathmentos/.env' });
const { getSafePath } = require('/Users/mac/mathmentos/src/config/pathMapping');
const katex = require('katex');
const fs = require('fs');
const path = require('path');

const ROOT = '/Users/mac/mathmentos';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';

const outPath = process.argv[2];
const jobsPath = process.argv[3];
const raw = JSON.parse(fs.readFileSync(outPath, 'utf8'));
const results = Array.isArray(raw) ? raw : (raw.result || raw);
const jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));

function norm(v){ // 저장답 동치 비교용 단순 정규화
  if(v==null) return '';
  return String(v).replace(/[①②③④⑤]/g,m=>({'①':'1','②':'2','③':'3','④':'4','⑤':'5'}[m]))
    .replace(/번$/,'').replace(/\s+/g,'').replace(/[{}$]/g,'').replace(/\\left|\\right/g,'')
    .replace(/√/g,'sqrt').replace(/π/g,'pi').replace(/\*/g,'').toLowerCase();
}

// pid→jobs 매핑 (충돌 시 stored로 디스앰비규에이션)
function findJob(r){
  const cands = jobs.filter(j => j.pid === r.pid);
  if(cands.length===1) return cands[0];
  // 충돌: correctAnswer(또는 저작 정답)와 stored가 맞는 job
  const ca = norm(r.correctAnswer);
  let m = cands.find(j => norm(j.stored) === ca);
  if(m) return m;
  return cands[0]; // 최후 폴백
}

function validate(d){
  const text = ['P','C','B','S','A'].map(k=>d[k]||'').join('\n');
  const segs=[];
  let rest=text.replace(/\$\$([\s\S]+?)\$\$/g,(_,m)=>{segs.push(m);return ' ';});
  rest.replace(/\$([^$\n]+?)\$/g,(_,m)=>{segs.push(m);return ' ';});
  let bad=0, errs=[];
  for(const s of segs){ try{katex.renderToString(s,{throwOnError:true,strict:'ignore'});}catch(e){bad++;errs.push(s.slice(0,40));} }
  return {n:segs.length,bad,errs};
}

(async () => {
  const manifest = JSON.parse(fs.readFileSync(`${ROOT}/scripts/homework_avs_manifest.json`,'utf8'));
  const uploaded=[], failed=[], flagged=[];
  for(const r of results){
    if(!r || !r.pid) continue;
    const job = findJob(r);
    if(!job){ flagged.push({pid:r.pid, why:'job 미발견'}); continue; }
    const unit = job.hk;
    if(r.status !== 'authored'){
      flagged.push({pid:`${unit.split('_')[1]}/${r.pid}`, status:r.status, correctAnswer:r.correctAnswer, stored:job.stored, notes:(r.notes||'').slice(0,200)});
      continue;
    }
    const f = `${ROOT}/src/data/homework_avs/${unit}/${r.pid}.json`;
    const cur = JSON.parse(fs.readFileSync(f,'utf8'));
    const aLatex = r.answerLatex || job.stored;
    const out = {
      title: cur.title || `[통합숙제] ${r.pid}번 명품 해설`,
      type: cur.type || 'algebra',
      P: r.P, C: r.C, B: r.B,
      S: (r.S_steps||[]).join('\n'),
      S_objects: cur.S_objects || [],
      A: `따라서 최종 정답은 $$\\mathbf{\\boxed{${aLatex}}}$$ 입니다.`,
      finalAnswer: job.stored, correctAnswer: job.stored,
      pcbsa_completed: true, vision_generated: true, vision_model: 'manual-claude-fable-5',
    };
    const v = validate(out);
    if(v.bad>0){ failed.push({pid:`${unit.split('_')[1]}/${r.pid}`, bad:v.bad, errs:v.errs}); continue; }
    fs.writeFileSync(f, JSON.stringify(out,null,2));
    const objPath = `math_hints/${getSafePath(unit)}/${r.pid}.json`;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/mentos-assets/${objPath}`,{
      method:'POST', headers:{Authorization:`Bearer ${KEY}`,'Content-Type':'application/json','x-upsert':'true','cache-control':'max-age=300'}, body:JSON.stringify(out),
    });
    if(res.ok){ manifest[`${unit}/${r.pid}`]={at:'2026-06-14T02:00:00.000Z',model:'manual-claude-fable-5'}; uploaded.push(`${unit.split('_')[1]}/${r.pid}`); }
    else failed.push({pid:`${unit.split('_')[1]}/${r.pid}`, http:res.status});
  }
  fs.writeFileSync(`${ROOT}/scripts/homework_avs_manifest.json`, JSON.stringify(manifest,null,2));
  console.log(`✅ 업로드·등록 ${uploaded.length}:`, uploaded.join(', '));
  if(failed.length) console.log(`❌ 실패 ${failed.length}:`, JSON.stringify(failed,null,1));
  if(flagged.length) console.log(`🚩 mismatch/unclear ${flagged.length}:`, JSON.stringify(flagged,null,1));
})();
