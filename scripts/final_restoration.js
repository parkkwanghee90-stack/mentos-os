import fs from 'fs';
import path from 'path';

const targetDir = 'DIAMOND_BOX_3/math_hints/고차방정식2단계';
const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.json'));

function cleanAndFix(rawContent) {
  // 모든 단일 백슬래시를 찾아 JSON 표준에 맞게 교정 (이미 올바른 것은 보존)
  let chars = rawContent.split('');
  let fixedChars = [];
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === '\\') {
      const next = chars[i+1];
      // JSON 표준 이스케이프 문자가 아닌 모든 경우에 백슬래시 추가
      if (!['\\', '"', '/', 'b', 'f', 'n', 'r', 't', 'u'].includes(next)) {
        fixedChars.push('\\');
      }
    }
    fixedChars.push(chars[i]);
  }
  let fixed = fixedChars.join('');

  let data;
  try {
    data = JSON.parse(fixed);
  } catch (e) {
    // 만약 여전히 에러나면 (중복 백슬래시 문제 등), 아예 모든 \를 \\로 바꾼 뒤 정리
    fixed = rawContent.replace(/\\/g, '\\\\').replace(/\\\\\\\\/g, '\\\\');
    data = JSON.parse(fixed);
  }

  const fixField = (text) => {
    if (typeof text !== 'string') return text;
    // 1. $ 제거
    let t = text.replace(/\$/g, '');
    // 2. 한글/공백/마침표 뭉치를 \text{}로 감싸기
    t = t.replace(/([가-힣][가-힣\s,.]*[가-힣]|[가-힣])/g, (m) => `\\text{${m}}`);
    // 3. 중복 감싸기 정리
    t = t.replace(/\\text\{\\text\{/g, '\\text{').replace(/\}\}/g, '}');
    return t;
  };

  if (data.steps) data.steps.forEach(s => { if (s.latex) s.latex = fixField(s.latex); });
  if (data.overlay_steps) data.overlay_steps.forEach(s => { if (s.latex) s.latex = fixField(s.latex); });
  if (data.choices) data.choices = data.choices.map(c => fixField(c));

  return JSON.stringify(data, null, 2);
}

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const result = cleanAndFix(raw);
    fs.writeFileSync(filePath, result, 'utf8');
  } catch (e) {
    console.error(`Error in ${file}: ${e.message}`);
  }
});
console.log("Restoration success.");
