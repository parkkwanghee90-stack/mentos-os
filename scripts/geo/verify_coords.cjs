// 누적 객체의 point가 circle/line 위에 있는지(오차<0.06) 검산.
const fs = require('fs');
function onCircle(p,c){const dx=p[0]-c.center[0],dy=p[1]-c.center[1];return Math.abs(Math.hypot(dx,dy)-(c.radius||0))<0.06;}
function onLine(p,l){const[x1,y1]=l.from,[x2,y2]=l.to;const A=y2-y1,B=x1-x2,C=-(A*x1+B*y1);const n=Math.hypot(A,B)||1;return Math.abs(A*p[0]+B*p[1]+C)/n<0.06;}
function verify(file){
  const d=JSON.parse(fs.readFileSync(file,'utf8'));
  const acc=[...(d.base_figure?.objects||[])];(d.steps||d.overlay_steps||[]).forEach(s=>acc.push(...(s.objects||[])));
  const circles=acc.filter(o=>o.type==='circle'&&Array.isArray(o.center));
  const lines=acc.filter(o=>['line','segment'].includes(o.type)&&o.from&&o.to);
  const pts=acc.filter(o=>o.type==='point').map(o=>o.coords||o.coordinates).filter(Array.isArray);
  const w=[];
  for(const p of pts){const ok=circles.some(c=>onCircle(p,c))||lines.some(l=>onLine(p,l))||(!circles.length&&!lines.length);if(!ok)w.push('point '+JSON.stringify(p)+' off-curve');}
  return w;
}
module.exports={verify};
if(require.main===module){let bad=0;for(const f of process.argv.slice(2)){const w=verify(f);if(w.length){bad++;console.log('⚠️',f.split('/').pop());w.forEach(x=>console.log('   ',x));}}console.log(bad?('경고 '+bad):'검산 통과');}
