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

// 1. 고차방정식4단계/015
applyPatch(
  '고차방정식4단계/015',
  '$\\frac{1}{$$\\alpha$$ + $$\\beta$$}$, $\\frac{1}{$$\\beta$$ + $$\\gamma$$}$, $\\frac{1}{$$\\gamma$$ + $$\\alpha$$}$',
  '$\\frac{1}{\\alpha + \\beta}, \\frac{1}{\\beta + \\gamma}, \\frac{1}{\\gamma + \\alpha}$'
);

// 2. 점과좌표 개념2단계(44)p17 1+1(쌍둥이)/006a
applyPatch(
  '점과좌표 개념2단계(44)p17 1+1(쌍둥이)/006a',
  '$\\therefore$ P\\left($\\frac{3}{2}$, 0\\right), Q\\left(0, $\\frac{15}{4}$\\right)$',
  '$\\therefore P\\left(\\frac{3}{2}, 0\\right), Q\\left(0, \\frac{15}{4}\\right)$'
);

// 3. 직선의방정식3단계/024a
applyPatch(
  '직선의방정식3단계/024a',
  'l_1, l_2 l_1$의 기울기가   이므로 직선  의 기울기는  \\frac{3}{4} y = -\\frac{3}{4}x + 4$ 3x + 4y - 16 = 0$',
  '$l_1, l_2$ $l_1$의 기울기가 이므로 직선 의 기울기는 $\\frac{3}{4}$ $y = -\\frac{3}{4}x + 4$, $3x + 4y - 16 = 0$'
);

// 4. 도형의이동4단계/005
applyPatch(
  '도형의이동4단계/005',
  '①   ② \\frac{ }{5} ③ \\frac{ }{5} ④   ⑤ \\frac{ }{5}',
  '①  ② $\\frac{ }{5}$ ③ $\\frac{ }{5}$ ④  ⑤ $\\frac{ }{5}$'
);

// 5. 삼각함수활용2단계/032
applyPatch(
  '삼각함수활용2단계/032',
  '① \\frac{3 }{2} ② 2  ③ \\frac{5 }{2} ④ 3  ⑤ \\frac{7 }{2}',
  '① $\\frac{3 }{2}$ ② 2 ③ $\\frac{5 }{2}$ ④ 3 ⑤ $\\frac{7 }{2}$'
);

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Manual patches applied: ${fixedCount}`);
