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
    if(!key) {
      console.log(`[KEY NOT FOUND] ${keyIncludes}`);
    } else {
      console.log(`[STRING NOT FOUND] ${keyIncludes}`);
    }
  }
}

// ============================================
// [1] orphan $ 
// ============================================
applyPatch('점과좌표4단계/026', '① $3\n$\n② $4\n$\n③ $5\n$\n④ $6\n$\n⑤ 7', '① $3$\n② $4$\n③ $5$\n④ $6$\n⑤ $7$');
applyPatch('(5)점과좌표 개념2단계(44)p17 1+1(쌍둥이)/006a', '\\therefore P\\left(\\frac{3}{2}, 0\\right), Q\\left(0, \\frac{15}{4}\\right)$', '$\\therefore P\\left(\\frac{3}{2}, 0\\right), Q\\left(0, \\frac{15}{4}\\right)$');
applyPatch('(5)점과좌표 개념2단계(44)p17 1+1(쌍둥이)/017a', '이어야 한다.    $', '이어야 한다.');

// ============================================
// [2] left/right mismatch
// ============================================
applyPatch('(5)점과좌표 개념2단계(44)p17 1+1(쌍둥이)/021a', 'D\\left(\\frac{-2+2}{2}, \\frac{-1-3}{2}\\right) \\therefore D(0,\\ -2)', '$D\\left(\\frac{-2+2}{2}, \\frac{-1-3}{2}\\right)$ $\\therefore D(0,\\ -2)$');
applyPatch('도형의이동3단계/019a', 'B\\left(\\frac{-2+8}{2}, \\frac{1+7}{2} = (3, 4)', '$B\\left(\\frac{-2+8}{2}, \\frac{1+7}{2}\\right) = (3, 4)$');

// ============================================
// [3] broken \frac
// ============================================
applyPatch('점과좌표3단계/017a', '\\frac{b-7}{a-2} \\cdot (-3) = -1 a - 3b + 23 = 0', '$\\frac{b-7}{a-2} \\cdot (-3) = -1$ $$a - 3b + 23 = 0$$');

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Manual patches applied: ${fixedCount}`);
