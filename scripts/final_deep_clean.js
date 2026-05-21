import fs from 'fs';
import path from 'path';

const targetDir = 'DIAMOND_BOX_3/math_hints/고차방정식2단계';
const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.json'));

function cleanLatex(text) {
  if (typeof text !== 'string') return text;
  
  // 1. $ 기호와 기존의 모든 \text{...} 태그를 완전히 제거하여 순수 텍스트로 초기화
  let t = text.replace(/\$/g, '');
  while (t.includes('\\text{')) {
    t = t.replace(/\\text\{([^{}]*)\}/g, '$1');
  }
  // 불필요하게 남은 중괄호 정리
  t = t.replace(/\}+$/g, '').replace(/\{+/g, '{').replace(/\}+/g, '}');

  // 2. 한글(공백 포함) 구간을 찾아 \text{}로 감쌈
  // 수식 기호가 아닌 한글/문장부호 구간만 정확히 타겟팅
  t = t.replace(/([가-힣][가-힣\s,.]*)/g, (m) => `\\text{${m}}`);

  return t;
}

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const process = (obj) => {
    if (obj.latex) obj.latex = cleanLatex(obj.latex);
  };

  if (data.steps) data.steps.forEach(process);
  if (data.overlay_steps) data.overlay_steps.forEach(process);
  if (data.choices) data.choices = data.choices.map(cleanLatex);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
});
console.log("Deep cleaned and restored all files.");
