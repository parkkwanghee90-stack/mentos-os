const fs = require('fs');

const filePath = 'c:/mentos_os_clean/src/data/math_problem_texts.json';
let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const keys = Object.keys(data).filter(k => k.includes('삼각함수그래프3단계'));

keys.forEach(key => {
  let text = data[key];

  // 1. 14, 38번 특수 타격
  if (key.includes('014.webp')) {
      text = text.replace("$단, $\\frac{\\pi}{6} < \\theta < \\frac{1}{2}\\pi$$", "(단, $\\frac{\\pi}{6} < \\theta < \\frac{1}{2}\\pi$)");
  }
  if (key.includes('038.webp')) {
      text = text.replace("0 < x < \\frac{\\pi}{2} 에서", "$0 < x < \\frac{\\pi}{2}$ 에서");
  }

  // 2. 가독성 줄바꿈 엔진 (마침표, 쉼표, 슬래시)
  // 단, 수식 내부($...$)나 숫자(3.14)는 건드리지 않도록 분절 처리
  const segments = text.split(/(\$[^\$]+\$)/g); // 수식 구역 보호
  
  for (let i = 0; i < segments.length; i++) {
    if (!segments[i].startsWith('$')) { // 수식이 아닌 텍스트 구역만 처리
      // 마침표 뒤 줄바꿈 (숫자 뒤 마침표 제외)
      segments[i] = segments[i].replace(/(\.)\s+/g, '$1\n');
      // 쉼표 뒤 줄바꿈
      segments[i] = segments[i].replace(/(,)\s+/g, '$1\n');
      // 슬래시 뒤 줄바꿈 (단, \/ 형태의 이스케이프나 수식 기호 제외)
      segments[i] = segments[i].replace(/([^\\])\//g, '$1/\n');
    }
  }
  
  text = segments.join('');
  data[key] = text;
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log("3단계 14, 38번 수리 및 전역 줄바꿈(마침표/쉼표/슬래시) 완료!");
