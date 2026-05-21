import fs from 'fs';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let fixedCount = 0;

function applyPatch(keyIncludes, replaceFrom, replaceTo) {
  const key = Object.keys(data).find(k => k.includes(keyIncludes));
  if (key && data[key].includes(replaceFrom)) {
    data[key] = data[key].replace(replaceFrom, replaceTo);
    fixedCount++;
    console.log(`[PATCHED] ${keyIncludes}`);
  } else {
    console.log(`[FAILED] ${keyIncludes}`);
  }
}

// 1. broken \frac
applyPatch(
  '고차방정식2단계/045',
  '④ \\frac{-1+$\\sqrt{3}$i}{2}\\n⑤ \\frac{1-$\\sqrt{3}$i}{2}',
  '④ $\\frac{-1+\\sqrt{3}i}{2}$\\n⑤ $\\frac{1-\\sqrt{3}i}{2}$'
);

// 2. orphan $
applyPatch(
  '점과좌표4단계/026',
  '① $3\\n$\\n② $4\\n$\\n③ $5\\n$\\n④ $6\\n$\\n⑤ 7',
  '① $3$\\n② $4$\\n③ $5$\\n④ $6$\\n⑤ 7'
);

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Manual patches applied: ${fixedCount}`);
