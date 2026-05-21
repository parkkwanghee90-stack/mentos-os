const fs = require('fs');

const filePath = 'c:/mentos_os_clean/src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const targets = [3, 10, 11, 14];

console.log("=== 3단계 수식($) 적용 결과 최종 보고 ===");

targets.forEach(n => {
  const key = '삼각함수그래프3단계/' + n.toString().padStart(3, '0') + '.webp';
  const text = data[key];
  console.log(`\n[문항 ${n}]`);
  if (text) {
      console.log(text);
  } else {
      console.log("키 미발견!");
  }
});
