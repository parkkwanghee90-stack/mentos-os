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

applyPatch(
  '삼각함수활용2단계/032',
  '① \\frac{3$\\sqrt{3}$}{2} ② 2$\\sqrt{3}$ ③ \\frac{5$\\sqrt{3}$}{2} ④ 3$\\sqrt{3}$ ⑤ \\frac{7$\\sqrt{3}$}{2}',
  '① $\\frac{3\\sqrt{3}}{2}$ ② $2\\sqrt{3}$ ③ $\\frac{5\\sqrt{3}}{2}$ ④ $3\\sqrt{3}$ ⑤ $\\frac{7\\sqrt{3}}{2}$'
);

applyPatch(
  '도형의이동4단계/005',
  '① $\\frac{1}{5}$ ② \\frac{$\\sqrt{2}$}{5} ③ \\frac{$\\sqrt{3}$}{5} ④ $\\frac{2}{5}$ ⑤ \\frac{$\\sqrt{5}$}{5}',
  '① $\\frac{1}{5}$ ② $\\frac{\\sqrt{2}}{5}$ ③ $\\frac{\\sqrt{3}}{5}$ ④ $\\frac{2}{5}$ ⑤ $\\frac{\\sqrt{5}}{5}$'
);

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Manual patches applied: ${fixedCount}`);
