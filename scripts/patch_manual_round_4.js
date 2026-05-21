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

// 1. 직선의방정식3단계/024a
applyPatch(
  '직선의방정식3단계/024a',
  '$\\= \\angle ACO + \\angle CAO = 90^\\circ$ 따라서 두 직선 $l_1, l_2$는 서로 수직이고, 직선 $l_1$의 기울기가 $$\\frac{4}{3}$$ 이므로 직선 $l_2$의 기울기는 $-$\\frac{3}{4}$$ 이다. 이때 직선 l_2의 y 절편이 4 이므로 직선 l_2의 방정식은 $$y = -\\frac{3}{4}x + 4$$, 즉 $3x + 4y - 16 = 0$',
  '$= \\angle ACO + \\angle CAO = 90^\\circ$ 따라서 두 직선 $l_1, l_2$는 서로 수직이고, 직선 $l_1$의 기울기가 $\\frac{4}{3}$ 이므로 직선 $l_2$의 기울기는 $-\\frac{3}{4}$ 이다. 이때 직선 $l_2$의 $y$ 절편이 $4$ 이므로 직선 $l_2$의 방정식은 $y = -\\frac{3}{4}x + 4$, 즉 $3x + 4y - 16 = 0$'
);

// 2. 점과좌표4단계/032
applyPatch(
  '점과좌표4단계/032',
  '$AC를 m : n으로 내분하는 점의 좌표는 $\\left( $\\frac{-2m+an}{m+n}$, $\\frac{2m+bn}{m+n}$ \\right)$ 이 점이 y축 위에 있으므로 $$\\frac{-2m+an}{m+n}$=0, -2m+an=0$ ∴ $m=$\\frac{1}{2}$an$ ……$\\n②',
  '$AC$를 $m : n$으로 내분하는 점의 좌표는 $\\left(\\frac{-2m+an}{m+n}, \\frac{2m+bn}{m+n}\\right)$ 이 점이 $y$축 위에 있으므로 $\\frac{-2m+an}{m+n}=0, -2m+an=0$ $\\therefore m=\\frac{1}{2}an$ ……\\n②'
);

// 3. 원의방정식4단계/064
applyPatch(
  '원의방정식4단계/064',
  '① $57\\n$\\n② $63\\n$\\n③ $69\\n$\\n④ $75\\n$\\n⑤ 81',
  '① $57$\\n② $63$\\n③ $69$\\n④ $75$\\n⑤ $81$'
);

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Manual patches applied: ${fixedCount}`);
