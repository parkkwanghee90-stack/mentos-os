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

// TODO: Review inline latex failures from reports/audit_inline_latex_failures.json
// Example:
// applyPatch('(5)점과좌표 개념(44)p17 1+1(쌍둥이)/021a', '점 D가 \\overline{BC}의 중점일 때', '점 $D$가 $\\overline{BC}$의 중점일 때');

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Manual patches applied: ${fixedCount}`);
