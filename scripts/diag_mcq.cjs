const fs = require('fs');
const path = require('path');

const hintsDir = 'c:/mentos_os_clean/public/math_hints/고차방정식2단계';
const dbPath = 'c:/mentos_os_clean/DIAMOND_BOX_G1_2026_05_09/math_problem_texts.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const files = fs.readdirSync(hintsDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const pid = file.replace('.json', '');
  const problemKey = `고차방정식2단계/${pid}.webp`;
  const answerKey = `고차방정식2단계/${pid}a.webp`;

  const pText = db[problemKey];
  const aText = db[answerKey];

  if (!pText) console.log(`${file}: Missing Problem Text (${problemKey})`);
  if (!aText) console.log(`${file}: Missing Answer Text (${answerKey})`);
  if (pText && aText) {
      // console.log(`${file}: Found both`);
  }
});
