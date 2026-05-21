import fs from 'fs';
import path from 'path';

const targetDir = 'DIAMOND_BOX_3/math_hints/고차방정식2단계';
const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.json'));

function finalPolish(text) {
  if (typeof text !== 'string') return text;
  
  // 1. 모든 \text{}를 일단 해제하여 순수 텍스트로 만듦
  let t = text.replace(/\\text\{([^{}]+)\}/g, '$1');
  
  // 2. 다시 한글 구간을 찾아 \text{}로 감쌈
  t = t.replace(/([가-힣][가-힣\s,.]*[가-힣]|[가-힣])/g, (m) => `\\text{${m}}`);
  
  // 3. 연속된 \text{} 사이의 불필요한 중괄호 정리
  t = t.replace(/\}\s*\}/g, '}');
  
  return t;
}

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (data.steps) data.steps.forEach(s => { if (s.latex) s.latex = finalPolish(s.latex); });
  if (data.overlay_steps) data.overlay_steps.forEach(s => { if (s.latex) s.latex = finalPolish(s.latex); });
  if (data.choices) data.choices = data.choices.map(c => finalPolish(c));

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
});
console.log("Final polish completed.");
