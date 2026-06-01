const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, '..', 'public', 'math_crops', '숙제', '미적분심화');
const DST = path.join(__dirname, '..', 'public', 'math_crops', '숙제', '미적분', '08여러가지적분법');
const CIRCLE_MAP = {'①':'1','②':'2','③':'3','④':'4','⑤':'5'};

function convertCircle(s) { let r=s; for (const [c,n] of Object.entries(CIRCLE_MAP)) r=r.split(c).join(n); return r.trim(); }
function extractAnswers(p) {
  if (!fs.existsSync(p)) return [];
  const html = fs.readFileSync(p,'utf-8');
  const re = /정답<\/span>(.*?)<\/div>/gs;
  const ans = []; let m;
  while ((m=re.exec(html))!==null) { let c=m[1].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); if(c) ans.push(convertCircle(c)); }
  if (ans.length>0 && ans.length%2===0 && ans.slice(0,ans.length/2).every((v,i)=>v===ans[ans.length/2+i])) return ans.slice(0,ans.length/2);
  return ans;
}
function extractImages(p) {
  if (!fs.existsSync(p)) return [];
  const html=fs.readFileSync(p,'utf-8');
  const re=/src="\.\/[^"]*_files\/([a-f0-9]{20,}\.webp)"/g;
  const imgs=[]; const seen=new Set(); let m;
  while((m=re.exec(html))!==null) { if(!seen.has(m[1])){seen.add(m[1]);imgs.push(m[1]);} }
  return imgs;
}

fs.mkdirSync(DST,{recursive:true});
const stages = ['08여러가지적분법/2단계','08여러가지적분법/3.4단계'];
let gNum=1;
for (const sp of stages) {
  const fullDir=path.join(BASE,sp);
  const pImgs=extractImages(path.join(fullDir,'문제.html'));
  const sImgs=extractImages(path.join(fullDir,'정답및해설.html'));
  const answers=extractAnswers(path.join(fullDir,'정답및해설.html'));
  let startIdx = pImgs.length===answers.length+1?1:0;
  const stageStart = gNum;
  for(let i=0;i<answers.length;i++){
    const pad=String(gNum).padStart(3,'0');
    const si=startIdx+i;
    if(si<pImgs.length){const s=path.join(fullDir,'문제_files',pImgs[si]);if(fs.existsSync(s))fs.copyFileSync(s,path.join(DST,pad+'.webp'));}
    const solIdx=sImgs.length===answers.length+1?i+1:i;
    if(solIdx<sImgs.length){const s=path.join(fullDir,'정답및해설_files',sImgs[solIdx]);if(fs.existsSync(s))fs.copyFileSync(s,path.join(DST,pad+'a.webp'));}
    gNum++;
  }
  console.log(`  ${sp}: ${answers.length}문제 (${String(stageStart).padStart(3,'0')}~${String(gNum-1).padStart(3,'0')})`);
}
console.log(`✅ 08여러가지적분법: 총 ${gNum-1}문제 크롭 완료`);
