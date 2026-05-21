const fs = require('fs');

const filePath = 'c:/mentos_os_clean/src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const brokenTargets = [3, 10, 11, 13, 14, 22, 23, 25, 32, 35, 42];

console.log("=== 3단계 지목 문항 정밀 진단 보고서 ===");

brokenTargets.forEach(n => {
  const key = '삼각함수그래프3단계/' + n.toString().padStart(3, '0') + '.webp';
  const text = data[key];
  console.log(`\n[문항 ${n}] (${key})`);
  if (text) {
      console.log("원본:");
      console.log(text);
  } else {
      console.log("키 미발견!");
  }
});
