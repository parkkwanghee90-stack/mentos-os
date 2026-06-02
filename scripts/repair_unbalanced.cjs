// Repair UNBALANCED-$ entries with safe transforms + per-entry verification.
// Accept a change only if the entry becomes $-balanced AND still renders with 0 KaTeX throws.
// Dry by default; --write to persist. Targets only currently-unbalanced entries (others untouched).
const fs = require('fs');
const katex = require('../node_modules/katex');
console.warn = () => {}; console.error = () => {};
const TARGET = 'public/data/math_problem_texts.json';
const WRITE = process.argv.includes('--write');
const data = JSON.parse(fs.readFileSync(TARGET, 'utf8'));

function normalizeMathText(raw) {
  let txt = String(raw);
  txt = txt.replace(/\n(?=eq|abla|u|otin|subseteq|supset|Rightarrow|Leftrightarrow|i|olimits|ormalfont|ewline|exists)/g, '\\n').replace(/\\\\n/g, '\n').replace(/\\n(?!eq|abla|u|otin|subseteq|supset|Rightarrow|Leftrightarrow|i|olimits|ormalfont|ewline|exists)/g, '\n');
  txt = txt.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$1$$$$').replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
  return txt;
}
function withAligned(t){ return t.replace(/\$\$([\s\S]+?)\$\$/g,(m,i)=>(i.includes('\\begin{aligned}')||i.includes('\\begin{cases}')||i.includes('\\begin{array}'))?m:(i.includes('\\\\')?`$$ \\begin{aligned} ${i} \\end{aligned} $$`:m)); }
function thr(b,d){try{katex.renderToString(b,{throwOnError:true,displayMode:d,strict:false});return false;}catch{return true;}}
function isBalanced(raw){ const n=normalizeMathText(raw); const noB=n.replace(/\$\$[\s\S]*?\$\$/g,''); return ((noB.match(/(?<!\\)\$/g)||[]).length)%2===0; }
function throwCount(raw){ const t=withAligned(normalizeMathText(raw)); let f=0; const br=/\$\$([\s\S]+?)\$\$/g;let b,last=0;const ch=[]; while((b=br.exec(t))){if(b.index>last)ch.push(t.slice(last,b.index)); if(thr(b[1],true))f++; last=b.index+b[0].length;} if(last<t.length)ch.push(t.slice(last)); const il=/\$((?:[^$\\]|\\[\s\S])+?)\$/g; for(const c of ch){let m;while((m=il.exec(c)))if(thr(m[1],false))f++;} return f; }

function repair(s){
  let t=s;
  // remove a stray $ inside \text{ ... } (e.g. \text{① $} -> \text{①})
  t=t.replace(/(\\text\{[^{}]*?)\s*\$\s*(\})/g,'$1$2');
  // stray $ hugging latex delimiters
  t=t.replace(/\$\s*(\\[([])/g,'$1').replace(/(\\[)\]])\s*\$/g,'$1');
  return t;
}

const unbalanced = Object.keys(data).filter(k=>typeof data[k]==='string' && !isBalanced(data[k]));
const out={...data}; const fixed=[], residual=[];
for(const key of unbalanced){
  const cand=repair(data[key]);
  if(cand!==data[key] && isBalanced(cand) && throwCount(cand)===0){ out[key]=cand; fixed.push(key); }
  else residual.push(key);
}
console.log('=== UNBALANCED-$ REPAIR', WRITE?'(WRITE)':'(DRY)','===');
console.log('unbalanced entries:',unbalanced.length,'| auto-fixed:',fixed.length,'| residual:',residual.length);
console.log('\n--- residual (need image-based fix) ---');
const byUnit={}; for(const k of residual){const u=k.includes('/')?k.split('/')[0]:k; byUnit[u]=(byUnit[u]||0)+1;}
for(const [u,c] of Object.entries(byUnit).sort((a,b)=>b[1]-a[1])) console.log('  ',c,u);
fs.writeFileSync('scratch/unbal_residual.json',JSON.stringify(residual,null,2));
if(WRITE){ fs.writeFileSync(TARGET,JSON.stringify(out,null,2),'utf8'); console.log('\nWROTE',TARGET,'(',fixed.length,'entries)'); }
else console.log('\n(dry-run; --write to persist)');
