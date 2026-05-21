const fs = require('fs');

const filePath = 'c:/mentos_os_clean/src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

[14, 38].forEach(n => {
  const key = '삼각함수그래프3단계/' + n.toString().padStart(3, '0') + '.webp';
  console.log(`--- ${key} ---`);
  console.log(data[key]);
});
