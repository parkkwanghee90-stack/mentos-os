const fs = require('fs');
const d = JSON.parse(fs.readFileSync('public/data/math_problem_texts.json', 'utf8'));
let results = [];
for(let i=21; i<=35; i++){
  const k = '삼각함수그래프2단계/' + String(i).padStart(3, '0') + '.webp';
  results.push(`[${i}] ${d[k] || 'MISSING'}`);
}
console.log(results.join('\n'));
