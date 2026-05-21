const fs = require('fs');

const JSON_PATH = 'public/data/math_problem_texts.json';
const d = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

let count3 = 0;
let count4 = 0;

Object.keys(d).forEach(k => {
  if (k.startsWith('trig_util_step3/')) {
    const newKey = k.replace('trig_util_step3/', '삼각함수활용3단계/');
    d[newKey] = d[k];
    count3++;
  }
  if (k.startsWith('trig_util_step4/')) {
    const newKey = k.replace('trig_util_step4/', '삼각함수활용 4단계(68)/');
    d[newKey] = d[k];
    count4++;
  }
});

fs.writeFileSync(JSON_PATH, JSON.stringify(d, null, 2));
console.log(`Restored ${count3} texts for Step 3 and ${count4} texts for Step 4.`);
