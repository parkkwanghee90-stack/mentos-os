import fs from 'fs';
import path from 'path';

const targetDir = 'DIAMOND_BOX_3/math_hints/고차방정식2단계';

function fixLatex(text) {
  if (typeof text !== 'string') return text;
  
  // 1. $ 기호 제거
  let fixed = text.replace(/\$/g, '');
  
  // 2. 한글과 특수문자(괄호, 마침표 등)가 섞인 구간을 찾아 \text{}로 감싸기
  // 수식 기호(+, -, =, ^, _, \, {, }, 분수 등)가 아닌 구간을 최대한 찾아냄
  // 주의: 이미 \text{}가 있는 경우는 건드리지 않음
  
  // 단순화된 로직: 한글이 포함된 연속된 문자열(공백 포함)을 찾아서 처리
  // 예: "방정식 x^4 = 1의" -> "\text{방정식 } x^4 = 1 \text{의}"
  
  const koreanRegex = /([가-힣\s,.]+)/g;
  fixed = fixed.replace(koreanRegex, (match) => {
    if (match.trim() === '') return match;
    return `\\text{${match}}`;
  });
  
  // 3. 중복된 \text{\text{...}} 처리 방지 및 정리
  fixed = fixed.replace(/\\text\{\\text\{/g, '\\text{').replace(/\}\}/g, '}');
  
  return fixed;
}

const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // steps 수정
  if (data.steps) {
    data.steps.forEach(s => {
      if (s.latex) s.latex = fixLatex(s.latex);
    });
  }
  
  // overlay_steps 수정
  if (data.overlay_steps) {
    data.overlay_steps.forEach(s => {
      if (s.latex) s.latex = fixLatex(s.latex);
    });
  }
  
  // choices 수정
  if (data.choices) {
    data.choices = data.choices.map(c => fixLatex(c));
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
});

console.log(`Fixed ${files.length} files in ${targetDir}`);
