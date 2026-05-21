import fs from 'fs';
import path from 'path';

const targetDir = 'DIAMOND_BOX_3/math_hints/고차방정식2단계';
const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.json'));

function removeTextTags(text) {
  let res = "";
  let i = 0;
  while (i < text.length) {
    if (text.startsWith("\\text{", i)) {
      i += 6;
      let count = 1;
      let inner = "";
      while (i < text.length && count > 0) {
        if (text[i] === '{') count++;
        else if (text[i] === '}') count--;
        if (count > 0) {
          inner += text[i];
          i++;
        }
      }
      if (i < text.length && text[i] === '}') i++; // matching } 건너뜀
      res += inner;
    } else {
      res += text[i];
      i++;
    }
  }
  return res;
}

function superClean(text) {
  if (typeof text !== 'string') return text;
  
  // 1. $ 제거
  let t = text.replace(/\$/g, '');
  
  // 2. \text{} 태그와 그 짝궁 } 를 정확히 제거
  let cleaned = removeTextTags(t);
  // 여러 번 감싸진 경우를 위해 반복
  while (cleaned.includes("\\text{")) {
    cleaned = removeTextTags(cleaned);
  }
  
  // 3. 한글 구간을 찾아 \text{}로 다시 감쌈
  let final = cleaned.replace(/([가-힣][가-힣\s,.]*)/g, (m) => `\\text{${m}}`);
  
  // 4. 연속된 \text{} 합치기 및 잉여 중괄호 최후 정리
  final = final.replace(/\}\s*\\text\{/g, '');
  
  return final;
}

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const process = (obj) => {
    if (obj.latex) obj.latex = superClean(obj.latex);
  };

  if (data.steps) data.steps.forEach(process);
  if (data.overlay_steps) data.overlay_steps.forEach(process);
  if (data.choices) data.choices = data.choices.map(superClean);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
});
console.log("Super Clean V2 completed.");
