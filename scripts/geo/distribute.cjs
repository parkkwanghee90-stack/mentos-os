// 도형 있는 문제: base_figure.objects(축 제외)를 type 우선순위로 step별 objects에 분배(무손실).
// 색/채움은 제거 → 렌더러 검정 단색 기본값 사용.
const fs = require('fs');
const SHAPE = new Set(['circle','line','curve','function','function_plot','triangle','perpendicular','drawCircle']);
const SEG = new Set(['segment','drawSegment','polygon','drawPolygon']);
const PT = new Set(['point']);
const LBL = new Set(['latex_label','text','label_text','markLength','markAngle']);
const AX = new Set(['axes','axis']);
function strip(o){ const c={...o}; delete c.color; delete c.fillOpacity; return c; }
function distribute(d) {
  const bf = d.base_figure || (d.base_figure = { preset:'custom', objects:[] });
  const objs = (bf.objects||[]).map(strip);
  const steps = d.steps || d.overlay_steps || [];
  const N = steps.length;
  if (N < 3) return d;
  let axes = objs.filter(o => AX.has(o.type));
  if (!axes.length) axes = [{ type:'axes' }];
  const groups = [
    objs.filter(o => SHAPE.has(o.type)),
    objs.filter(o => SEG.has(o.type)),
    objs.filter(o => PT.has(o.type)),
    objs.filter(o => LBL.has(o.type)),
  ].filter(g => g.length);
  bf.objects = axes;
  const content = []; for (let i=1;i<=N-2;i++) content.push(i); if(!content.length) content.push(1);
  const assign = Array.from({length:N},()=>[]);
  groups.forEach((g,gi)=>{ assign[content[Math.min(gi,content.length-1)]].push(...g); });
  steps.forEach((s,i)=>{ s.objects = assign[i]; });
  if (d.overlay_steps && d.overlay_steps !== steps) d.overlay_steps.forEach((s,i)=>{ s.objects = assign[i]||[]; });
  return d;
}
module.exports = { distribute };
if (require.main === module) {
  const [,, inf, outf] = process.argv;
  fs.writeFileSync(outf, JSON.stringify(distribute(JSON.parse(fs.readFileSync(inf,'utf8'))), null, 1));
  console.log('distributed', inf);
}
