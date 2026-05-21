import fs from 'fs';
import path from 'path';

const targetDir = 'DIAMOND_BOX_3/math_hints/고차방정식2단계';
const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.json'));

function absoluteClean(text) {
  if (typeof text !== 'string') return text;

  // 1. 모든 $, \text{, {, } 를 무차별적으로 일단 제거하여 '순수 데이터'만 남김
  // 단, 분수(\frac)나 루트(\sqrt) 같은 핵심 구조는 임시 마커로 보호
  let t = text.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "##FRAC##$1##$2##");
  t = t.replace(/\\sqrt\{([^{}]*)\}/g, "##SQRT##$1##");
  t = t.replace(/\\text\{/g, "").replace(/\$/g, "").replace(/\{/g, "").replace(/\}/g, "");

  // 2. 보호했던 마커를 다시 표준 LaTeX로 복구
  t = t.replace(/##FRAC##(.*?)##(.*?)##/g, "\\frac{$1}{$2}");
  t = t.replace(/##SQRT##(.*?)##/g, "\\sqrt{$1}");

  // 3. 이제 순수하게 남은 한글/공백 구간만 찾아 \text{}로 감쌈
  // 수식 기호(알파벳, 숫자, ^, _, +, -, =, \, <, >)는 제외
  let final = t.replace(/([가-힣][가-힣\s,.]*)/g, (m) => `\\text{${m}}`);

  // 4. 불필요한 \text{} 공백 정리
  final = final.replace(/\}\s*\\text\{/g, "");
  
  return final;
}

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const process = (obj) => {
    if (obj.latex) obj.latex = absoluteClean(obj.latex);
  };

  if (data.steps) data.steps.forEach(process);
  if (data.overlay_steps) data.overlay_steps.forEach(process);
  if (data.choices) data.choices = data.choices.map(absoluteClean);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
});
console.log("Absolute Clean and Restoration completed.");
