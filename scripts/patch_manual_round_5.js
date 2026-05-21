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

// 1. 도형의이동3단계/022
applyPatch(
  '도형의이동3단계/022',
  '① \\pm$$ 1\\n② \\pm$$ 3\\n$$③ \\pm$$$$ 4\\n④ \\pm$$ 5\\n$⑤ \\pm$$ 6',
  '① $\\pm 1$\\n② $\\pm 3$\\n③ $\\pm 4$\\n④ $\\pm 5$\\n⑤ $\\pm 6$'
);

// 2. 이차부등식3단계/052
applyPatch(
  '이차부등식3단계/052',
  '$f(x) = x^2 - 4x + k = (x-2)^2 + k - 4$\\newline 이므로 대칭축의 방정식이 $x = 2$이고, $x = 1$과 $x = 4$ 사이에 있다.\\newline i\\; )\\; f(4) = k > 0\\newline $\\therefore$\\; k > 0\\newline ii\\; )\\; f(x) = 0$의 판별식을 $D$라 하면 $D',
  '$f(x) = x^2 - 4x + k = (x-2)^2 + k - 4$\\n이므로 대칭축의 방정식이 $x = 2$이고, $x = 1$과 $x = 4$ 사이에 있다.\\ni) $f(4) = k > 0 \\therefore k > 0$\\nii) $f(x) = 0$의 판별식을 $D$라 하면 $D'
);

// 3. 일차부등식3단계/013
applyPatch(
  '일차부등식3단계/013',
  '$US\\ \\$1 = \\text{\\textwon}1200$',
  '$US \\$1 = \\text{₩}1200$'
);

// 4. 삼각함수활용2단계/041
applyPatch(
  '삼각함수활용2단계/041',
  'AB=6, \\ BC=8\\text{인 삼각형 } ABC\\text{가 있다.} \\ 삼각형 \\ ABC\\text{의 넓이가 } 20\\text{일 때, } \\cos(\\angle ABC)\\text{의 값은?} \\left( \\text{단, } 0 < \\angle ABC < $\\frac{\\pi}{2}$ \\right) ① \\frac{$\\sqrt{2}$}{3} \\ ② $\\f',
  '$\\overline{AB}=6, \\overline{BC}=8$인 삼각형 $ABC$가 있다. 삼각형 $ABC$의 넓이가 $20$일 때, $\\cos(\\angle ABC)$의 값은? (단, $0 < \\angle ABC < \\frac{\\pi}{2}$) ① $\\frac{\\sqrt{2}}{3}$ ② $\\f'
);

// 5. 고차방정식2단계/008a
applyPatch(
  '고차방정식2단계/008a',
  '$$\\begin{array}{cccccc}\\n2 & 1 & 0 & -2 & -3 & -2 \\\\n & 2 & 4 & 4 & 2 \\\\n\\hline\\n-1 & 1 & 2 & 2 & 1 & 0 \\\\n & -1 & -1 & -1 \\\\n\\hline\\n1 & 1 & 1 & 0 \\\\n\\end{array}$$',
  '$$\\begin{array}{cccccc} 2 & 1 & 0 & -2 & -3 & -2 \\\\ & 2 & 4 & 4 & 2 \\\\ \\hline -1 & 1 & 2 & 2 & 1 & 0 \\\\ & -1 & -1 & -1 \\\\ \\hline 1 & 1 & 1 & 0 \\end{array}$$'
);

// 6. 고차방정식3단계/004a
applyPatch(
  '고차방정식3단계/004a',
  '$x^4 - 7x^2 + 9 = 0$\\\\ x^4 - 6x^2 + 9 - x^2 = 0\\\\ (x^2 - 3)^2 - x^2 = 0\\\\ (x^2 + x - 3)(x^2 - x - 3) = 0$에서 $x^2 + x - 3 = 0$의 두 근을 $$\\alpha, \\beta$$라 하고, $x^2 - x - 3 = 0$의 두 근을 $$\\gamma, \\delta라 할 때, 근과 계수와의 관계에 의하여 $$\\alpha$ + $\\beta$ = -1, $\\alpha$ $\\beta$ = -3, $\\gamma$ + \\delta = 1, $\\gamma$ \\delta = -3$\\\\ $$\\therefore$ $\\alpha$^2 + $\\beta$^2 + $\\gamma$^2 + \\delta^2 = ($\\alpha$ + $\\beta$)^2 - 2$\\alpha$ $\\beta$ + ($\\gamma$ + \\delta)^2 - 2$\\gamma$ \\delta = (-1)^2 - 2 \\times (-3) + 1^2 - 2 \\times (-3) = 1 + 6 + 1 + 6 = 14$',
  '$\\begin{aligned} &x^4 - 7x^2 + 9 = 0 \\\\ &x^4 - 6x^2 + 9 - x^2 = 0 \\\\ &(x^2 - 3)^2 - x^2 = 0 \\\\ &(x^2 + x - 3)(x^2 - x - 3) = 0 \\end{aligned}$에서 $x^2 + x - 3 = 0$의 두 근을 $\\alpha, \\beta$라 하고, $x^2 - x - 3 = 0$의 두 근을 $\\gamma, \\delta$라 할 때, 근과 계수와의 관계에 의하여 $\\alpha + \\beta = -1, \\alpha \\beta = -3, \\gamma + \\delta = 1, \\gamma \\delta = -3$ $\\therefore \\alpha^2 + \\beta^2 + \\gamma^2 + \\delta^2 = (\\alpha + \\beta)^2 - 2\\alpha \\beta + (\\gamma + \\delta)^2 - 2\\gamma \\delta = (-1)^2 - 2 \\times (-3) + 1^2 - 2 \\times (-3) = 1 + 6 + 1 + 6 = 14$'
);

// 7. 고차방정식4단계/007a
applyPatch(
  '고차방정식4단계/007a',
  '$$\\begin{array}{c|ccc}\\n1 & 1 & 0 & -(1+2k) & 2k \\\\n  & 1 & 1 & -2k \\\\n\\hline\\n1 & 1 & 1 & -2k & 0 \\\\n\\end{array}$$',
  '$$\\begin{array}{c|ccc} 1 & 1 & 0 & -(1+2k) & 2k \\\\ & 1 & 1 & -2k \\\\ \\hline 1 & 1 & 1 & -2k & 0 \\end{array}$$'
);

// 8. 일차부등식2단계/001
applyPatch(
  '일차부등식2단계/001',
  '\\text{ㄷ. } $\\frac{a^2}{b}$ > \\frac{b^2}{a}$',
  '\\text{ㄷ. } $\\frac{a^2}{b} > \\frac{b^2}{a}$'
);

// 9. 일차부등식2단계/015a
applyPatch(
  '일차부등식2단계/015a',
  '$$\\begin{cases} \\frac{-x+a}{2} \\leq x-1 & \\cdots \\circled{1} \\\\ x-1 < \\frac{-2x+7}{4} + 1 & \\cdots \\circled{2} \\end{cases}$$',
  '$$\\begin{cases} \\frac{-x+a}{2} \\leq x-1 & \\cdots ① \\\\ x-1 < \\frac{-2x+7}{4} + 1 & \\cdots ② \\end{cases}$$'
);

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Manual patches applied: ${fixedCount}`);
