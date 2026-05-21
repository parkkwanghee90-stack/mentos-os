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

// 1. 삼각함수성질2단계/047
applyPatch('삼각함수성질2단계/047',
  '$\\frac{1}{1+\\cos\\theta} + \\frac{1}{1-\\cos\\theta} = \\frac{12}{5}$ 일 때, $\\tan^2\\theta + \\frac{1}{\\cos^2\\theta}$ 의 값을 구하시오. (단, $\\frac{\\pi}{2}$ < \\theta < \\pi)$',
  '$\\frac{1}{1+\\cos\\theta} + \\frac{1}{1-\\cos\\theta} = \\frac{12}{5}$ 일 때, $\\tan^2\\theta + \\frac{1}{\\cos^2\\theta}$ 의 값을 구하시오. (단, $\\frac{\\pi}{2} < \\theta < \\pi$)'
);

// 2. 삼각함수성질2단계/049
applyPatch('삼각함수성질2단계/049',
  '0 < \\theta < $\\frac{\\pi}{2}$ 인 \\theta 에 대하여 $$\\frac{\\cos\\theta}{1-\\cos\\theta} - \\frac{\\cos\\theta}{1+\\cos\\theta} = 8$$일 때, \\sin\\theta 의 값은? ① 0 ② $\\frac{1}{5}$ ③ \\frac{$\\sqrt{2}$}{5} ④ $\\frac{2}{5}$ ⑤ \\frac{$\\sqrt{5}$}{5}',
  '$0 < \\theta < \\frac{\\pi}{2}$ 인 $\\theta$ 에 대하여 $\\frac{\\cos\\theta}{1-\\cos\\theta} - \\frac{\\cos\\theta}{1+\\cos\\theta} = 8$일 때, $\\sin\\theta$ 의 값은? ① $0$ ② $\\frac{1}{5}$ ③ $\\frac{\\sqrt{2}}{5}$ ④ $\\frac{2}{5}$ ⑤ $\\frac{\\sqrt{5}}{5}$'
);

// 3. 삼각함수성질2단계/047a
applyPatch('삼각함수성질2단계/047a',
  '해설 $\\frac{1}{1+\\cos\\theta} + \\frac{1}{1-\\cos\\theta} = \\frac{1-\\cos\\theta + 1+\\cos\\theta}{(1+\\cos\\theta)(1-\\cos\\theta)} = \\frac{2}{1-\\cos^2\\theta} = \\frac{2}{\\sin^2\\theta}$ \\즉, $\\frac{2}{\\sin^2\\theta}$ = $\\frac{12}{5}$ \\text{이므로} \\sin^2\\theta = $\\frac{5}{6}$$ \\sin^2\\theta + \\cos^2\\theta = 1 \\text{에서} \\cos^2\\theta = 1 - \\sin^2\\theta = 1 - \\frac{5}{6} = \\frac{1}{6}$ \\이때 $\\frac{\\pi}{2}$ < \\theta < \\pi \\text{이므로} \\sin\\theta > 0, \\cos\\theta < 0$ \\therefore \\sin\\theta = \\frac{\\sqrt{30}}{6}, \\cos\\theta = -\\frac{\\sqrt{6}}{6}$ \\tan\\theta = $\\frac{\\sin\\theta}{\\cos\\theta}$ = \\frac{\\frac{$\\sqrt{30}$}{6}}{-\\frac{$\\sqrt{6}$}{6}} = -$\\sqrt{5}$$ $$\\therefore$$ \\tan^2\\theta + $$\\frac{1}{\\cos^2\\theta}$$ = (-$\\sqrt{5}$)^2 + 6 = 11',
  '해설 $\\frac{1}{1+\\cos\\theta} + \\frac{1}{1-\\cos\\theta} = \\frac{1-\\cos\\theta + 1+\\cos\\theta}{(1+\\cos\\theta)(1-\\cos\\theta)} = \\frac{2}{1-\\cos^2\\theta} = \\frac{2}{\\sin^2\\theta}$ \\n즉, $\\frac{2}{\\sin^2\\theta} = \\frac{12}{5}$ 이므로 $\\sin^2\\theta = \\frac{5}{6}$ \\n$\\sin^2\\theta + \\cos^2\\theta = 1$ 에서 $\\cos^2\\theta = 1 - \\sin^2\\theta = 1 - \\frac{5}{6} = \\frac{1}{6}$ \\n이때 $\\frac{\\pi}{2} < \\theta < \\pi$ 이므로 $\\sin\\theta > 0, \\cos\\theta < 0 \\therefore \\sin\\theta = \\frac{\\sqrt{30}}{6}, \\cos\\theta = -\\frac{\\sqrt{6}}{6}$ \\n$\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta} = \\frac{\\frac{\\sqrt{30}}{6}}{-\\frac{\\sqrt{6}}{6}} = -\\sqrt{5}$ \\n$\\therefore \\tan^2\\theta + \\frac{1}{\\cos^2\\theta} = (-\\sqrt{5})^2 + 6 = 11$'
);

// 4. 삼각함수성질2단계/051
applyPatch('삼각함수성질2단계/051',
  '0 < \\theta < $\\frac{\\pi}{2}$ \\text{이고 } \\sin\\theta - \\cos\\theta = \\frac{$\\sqrt{7}$}{4} \\text{일 때,} \\sin\\theta + \\cos\\theta \\text{의 값은?} ① -$\\frac{5}{4}$ ② -$\\frac{5}{8}$ ③ \\frac{$\\sqrt{7}$}{6} ④ $\\frac{5}{8}$ ⑤ $\\frac{5}{4}$',
  '$0 < \\theta < \\frac{\\pi}{2}$ 이고 $\\sin\\theta - \\cos\\theta = \\frac{\\sqrt{7}}{4}$ 일 때, $\\sin\\theta + \\cos\\theta$ 의 값은? ① $-\\frac{5}{4}$ ② $-\\frac{5}{8}$ ③ $\\frac{\\sqrt{7}}{6}$ ④ $\\frac{5}{8}$ ⑤ $\\frac{5}{4}$'
);

// 5. 삼각함수성질2단계/053
applyPatch('삼각함수성질2단계/053',
  'sin \\theta \\cos \\theta = -$\\frac{1}{4}$ 일 때, \\sin \\theta - \\cos \\theta 의 값은? \\left( \\text{단, } $\\frac{3}{2}$\\pi < \\theta < 2\\pi \\right) ① -\\frac{$\\sqrt{7}$}{2} ② -\\frac{$\\sqrt{6}$}{2} ③ \\frac{$\\sqrt{2}$}{2} ④ \\frac{$\\sqrt{3}$}{3} ⑤ \\frac{$\\sqrt{3}$}{2}',
  '$\\sin \\theta \\cos \\theta = -\\frac{1}{4}$ 일 때, $\\sin \\theta - \\cos \\theta$ 의 값은? (단, $\\frac{3}{2}\\pi < \\theta < 2\\pi$) ① $-\\frac{\\sqrt{7}}{2}$ ② $-\\frac{\\sqrt{6}}{2}$ ③ $\\frac{\\sqrt{2}}{2}$ ④ $\\frac{\\sqrt{3}}{3}$ ⑤ $\\frac{\\sqrt{3}}{2}$'
);

// 6. 삼각함수그래프2단계/007a
applyPatch('삼각함수그래프2단계/007a',
  '해설 $f(x) = \\sin \\bigg( x - \\frac{3}{2} \\bigg) \\times \\frac{\\text{π}}{1} + 1 = \\text{cos} x + 1$ \\n\\n∴ $f(\\text{π} + x) - f(\\text{π} - x)$ \\n\\n$= \\text{cos}(\\text{π} + x) + 1 - \\big\\\\{ \\text{cos}(\\text{π} - x) + 1 \\big\\\\}$ \\n\\n$= -\\text{cos} x + 1 - (-\\text{cos} x + 1) = 0$',
  '해설 $f(x) = \\sin \\left( x - \\frac{3}{2}\\pi \\right) + 1 = \\cos x + 1$ \\n$\\therefore f(\\pi + x) - f(\\pi - x) = \\cos(\\pi + x) + 1 - \\{ \\cos(\\pi - x) + 1 \\} = -\\cos x + 1 - (-\\cos x + 1) = 0$'
);

// 7. 삼각함수그래프2단계/018a
applyPatch('삼각함수그래프2단계/018a',
  '해설 $f(0)=a=-3$ 함수 $f(x)$의 주기가 $ \\text{π}$이므로 $$\\frac{2\\pi}{b} = \\pi, \\ b = 2$$ ∴ $g(x) = 2\\sin x - 3$ $-1 \\leq \\sin x \\leq 1$이므로 $-5 \\leq 2\\sin x - 3 \\leq -1$ 따라서 함수 $g(x)$의 최댓값은 $-1$',
  '해설 $f(0)=a=-3$ \\n함수 $f(x)$의 주기가 $\\pi$이므로 $\\frac{2\\pi}{b} = \\pi, b = 2 \\therefore g(x) = 2\\sin x - 3$ \\n$-1 \\leq \\sin x \\leq 1$이므로 $-5 \\leq 2\\sin x - 3 \\leq -1$ \\n따라서 함수 $g(x)$의 최댓값은 $-1$'
);

// 8. 삼각함수그래프2단계/036
applyPatch('삼각함수그래프2단계/036',
  'sin\\left(-$\\frac{10}{3}$\\pi\\right)+cos\\left(-$\\frac{17}{6}$\\pi\\right)+tan\\left($\\frac{3}{4}$\\pi\\right)\\의 값을 구하시오.',
  '$\\sin\\left(-\\frac{10}{3}\\pi\\right) + \\cos\\left(-\\frac{17}{6}\\pi\\right) + \\tan\\left(\\frac{3}{4}\\pi\\right)$ 의 값을 구하시오.'
);

// 9. 삼각함수그래프2단계/040
applyPatch('삼각함수그래프2단계/040',
  'cos $\\frac{13}{6}$ \\pi \\cos $\\frac{11}{6}$ \\pi + \\sin \\left( -$\\frac{\\pi}{4}$ \\right) \\sin $\\frac{11}{4}$ \\pi + \\tan $\\frac{13}{6}$ \\pi \\tan $\\frac{10}{3}$ \\pi 의 값은? ① $\\frac{1}{4}$ ② $\\frac{1}{2}$ ③ $\\frac{3}{4}$ ④ 1 ⑤ $\\frac{5}{4}$',
  '$\\cos \\frac{13}{6} \\pi \\cos \\frac{11}{6} \\pi + \\sin \\left( -\\frac{\\pi}{4} \\right) \\sin \\frac{11}{4} \\pi + \\tan \\frac{13}{6} \\pi \\tan \\frac{10}{3} \\pi$ 의 값은? ① $\\frac{1}{4}$ ② $\\frac{1}{2}$ ③ $\\frac{3}{4}$ ④ $1$ ⑤ $\\frac{5}{4}$'
);

// 10. 삼각함수그래프2단계/047a
applyPatch('삼각함수그래프2단계/047a',
  '\\overline{OA} = \\overline{OP} \\text{이므로} \\angle OAP = \\angle OPA = \\theta \\n\\n\\angle APB = $\\frac{\\pi}{2}$ \\text{이므로} \\angle CPD = $\\frac{\\pi}{2}$ - \\theta \\n\\n12\\sin\\theta = 5\\cos\\theta, \\sin^2\\theta + \\cos^2\\theta = 1 \\text{이므로} \\n\\n\\sin^2\\theta + $\\frac{144}{25}$ \\sin^2\\theta = 1, \\sin^2\\theta = $\\frac{25}{169}$ \\n\\n0 < \\theta < $\\frac{\\pi}{2}$ \\text{이므로} \\sin\\theta = $\\frac{5}{13}$, \\cos\\theta = $\\frac{12}{13}$ \\n\\n\\text{이때} \\overline{AB} = 13, \\angle APB = $\\frac{\\pi}{2}$ \\text{이므로} \\n\\nPA = 13\\cos\\theta = 12, PA = PC = PD = 12 \\n\\n$\\therefore$ \\text{(삼각형 ADC의 넓이)} \\n\\n= (\\text{삼각형 PAD의 넓이}) + (\\text{삼각형 PDC의 넓이}) \\n\\n\\quad - (\\text{삼각형 PAC의 넓이}) \\n\\n= $\\frac{1}{2}$ \\cdot 12 \\cdot 12 \\cdot \\sin\\theta + $\\frac{1}{2}$ \\cdot 12 \\cdot 12 \\cdot \\sin\\left($\\frac{\\pi}{2}$ - \\theta\\right) \\n\\n\\quad - $\\frac{1}{2}$ \\cdot 12 \\cdot 12 \\n\\n= 72\\sin\\theta + 72\\cos\\theta - 72 \\n\\n= 72 \\cdot $\\frac{5}{13}$ + 72 \\cdot $\\frac{12}{13}$ - 72 \\n\\n= $\\frac{288}{13}$',
  '$\\overline{OA} = \\overline{OP}$ 이므로 $\\angle OAP = \\angle OPA = \\theta$ \\n$\\angle APB = \\frac{\\pi}{2}$ 이므로 $\\angle CPD = \\frac{\\pi}{2} - \\theta$ \\n$12\\sin\\theta = 5\\cos\\theta, \\sin^2\\theta + \\cos^2\\theta = 1$ 이므로 \\n$\\sin^2\\theta + \\frac{144}{25} \\sin^2\\theta = 1, \\sin^2\\theta = \\frac{25}{169}$ \\n$0 < \\theta < \\frac{\\pi}{2}$ 이므로 $\\sin\\theta = \\frac{5}{13}, \\cos\\theta = \\frac{12}{13}$ \\n이때 $\\overline{AB} = 13, \\angle APB = \\frac{\\pi}{2}$ 이므로 \\n$\\overline{PA} = 13\\cos\\theta = 12, \\overline{PA} = \\overline{PC} = \\overline{PD} = 12$ \\n$\\therefore$ (삼각형 ADC의 넓이) \\n= (삼각형 PAD의 넓이) + (삼각형 PDC의 넓이) - (삼각형 PAC의 넓이) \\n= $\\frac{1}{2} \\cdot 12 \\cdot 12 \\cdot \\sin\\theta + \\frac{1}{2} \\cdot 12 \\cdot 12 \\cdot \\sin\\left(\\frac{\\pi}{2} - \\theta\\right) - \\frac{1}{2} \\cdot 12 \\cdot 12$ \\n= $72\\sin\\theta + 72\\cos\\theta - 72$ \\n= $72 \\cdot \\frac{5}{13} + 72 \\cdot \\frac{12}{13} - 72$ \\n= $\\frac{288}{13}$'
);

// 11. 삼각함수그래프2단계/060a
applyPatch('삼각함수그래프2단계/060a',
  '해설 $y = \\text{cos}^2\\left(\\frac{\\pi}{2} + x\\right) - 2\\sin\\left(\\frac{3}{2}\\pi - x\\right) + a + 1$ \\[ = (-\\sinx)^2 - 2(-\\text{cos}x) + a + 1 \\] \\[ = (1 - \\text{cos}^2x) + 2\\text{cos}x + a + 1 \\] \\[ = -\\text{cos}^2x + 2\\text{cos}x + a + 2 \\] $\\text{cos}x = t$로 놓으면 $-1 \\leq t \\leq 1$이고 \\[ y = -t^2 + 2t + a + 2 = -(t - 1)^2 + a + 3 \\] $-1 \\leq t \\leq 1$에서 그래프는 다음 그림과 같으므로 $t = 1$일 때 최댓값은 $a + 3$, $t = -1$일 때 최솟값은 $a - 1$ 이때 최댓값이 10이므로 \\[ a + 3 = 10 \\] \\[ \\therefore a = 7 \\] 따라서 최솟값은 $a - 1 = 7 - 1 = 6$',
  '해설 $y = \\cos^2\\left(\\frac{\\pi}{2} + x\\right) - 2\\sin\\left(\\frac{3}{2}\\pi - x\\right) + a + 1 = (-\\sin x)^2 - 2(-\\cos x) + a + 1 = (1 - \\cos^2x) + 2\\cos x + a + 1 = -\\cos^2x + 2\\cos x + a + 2$ \\n$\\cos x = t$로 놓으면 $-1 \\leq t \\leq 1$이고 $y = -t^2 + 2t + a + 2 = -(t - 1)^2 + a + 3$ \\n$-1 \\leq t \\leq 1$에서 그래프는 다음 그림과 같으므로 $t = 1$일 때 최댓값은 $a + 3$, $t = -1$일 때 최솟값은 $a - 1$ \\n이때 최댓값이 $10$이므로 $a + 3 = 10 \\therefore a = 7$ \\n따라서 최솟값은 $a - 1 = 7 - 1 = 6$'
);

// 12. 삼각함수그래프2단계/068a
applyPatch('삼각함수그래프2단계/068a',
  '해설 $3\\sin^2x - 7\\sinx + 2 = 0$에서 $(3\\sinx - 1)(\\sinx - 2) = 0$ 이때 $0 \\leq x < 3\\pi$에서 $\\sinx - 2 < 0$이므로 $3\\sinx - 1 = 0$ ∴ $\\sinx = \\frac{1}{3}$ 따라서 $\\alpha, \\beta, \\gamma, \\delta$는 $0 \\leq x < 3\\pi$에서 함수 $y = \\sinx$의 그래프와 직선 $y = \\frac{1}{3}$의 교점의 $x$좌표를 작은 것부터 차례대로 나타낸 것이다. 즉, 다음 그림에서 $$\\frac{\\alpha + \\beta}{2} = \\frac{\\pi}{2}, \\frac{\\gamma + \\delta}{2} = \\frac{5}{2}\\pi$$ 따라서 $\\alpha + \\beta = \\pi, \\gamma + \\delta = 5\\pi$이므로 $\\alpha + \\beta + \\gamma + \\delta = \\pi + 5\\pi = 6\\pi$',
  '해설 $3\\sin^2x - 7\\sin x + 2 = 0$에서 $(3\\sin x - 1)(\\sin x - 2) = 0$ \\n이때 $0 \\leq x < 3\\pi$에서 $\\sin x - 2 < 0$이므로 $3\\sin x - 1 = 0 \\therefore \\sin x = \\frac{1}{3}$ \\n따라서 $\\alpha, \\beta, \\gamma, \\delta$는 $0 \\leq x < 3\\pi$에서 함수 $y = \\sin x$의 그래프와 직선 $y = \\frac{1}{3}$의 교점의 $x$좌표를 작은 것부터 차례대로 나타낸 것이다. 즉, 다음 그림에서 \\n$\\frac{\\alpha + \\beta}{2} = \\frac{\\pi}{2}, \\frac{\\gamma + \\delta}{2} = \\frac{5}{2}\\pi$ \\n따라서 $\\alpha + \\beta = \\pi, \\gamma + \\delta = 5\\pi$이므로 $\\alpha + \\beta + \\gamma + \\delta = \\pi + 5\\pi = 6\\pi$'
);

// 13. 삼각함수그래프2단계/070
applyPatch('삼각함수그래프2단계/070',
  '0 < x < 2\\pi에서 방정식 \\tan x - \\frac{$\\sqrt{3}$}{\\tan x} = -1 + $\\sqrt{3}$의 서로 다른 네 실근을 작은 것부터 차례대로 x_1, x_2, x_3, x_4라 할 때, x_2 + x_4 - (x_1 + x_3)의 값은? ① $\\frac{\\pi}{3}$ ② $\\frac{\\pi}{2}$ ③ $\\frac{2}{3}$\\pi ④ $\\frac{5}{6}$\\pi ⑤ \\pi',
  '$0 < x < 2\\pi$에서 방정식 $\\tan x - \\frac{\\sqrt{3}}{\\tan x} = -1 + \\sqrt{3}$의 서로 다른 네 실근을 작은 것부터 차례대로 $x_1, x_2, x_3, x_4$라 할 때, $x_2 + x_4 - (x_1 + x_3)$의 값은? ① $\\frac{\\pi}{3}$ ② $\\frac{\\pi}{2}$ ③ $\\frac{2}{3}\\pi$ ④ $\\frac{5}{6}\\pi$ ⑤ $\\pi$'
);

// 14. 삼각함수그래프2단계/075
applyPatch('삼각함수그래프2단계/075',
  '0 \\leq x \\leq 2\\pi에서 방정식 \\cos x = -\\frac{$\\sqrt{5}$}{4}의 두 근을 $\\alpha$, $\\beta$라 할 때, \\sin($\\alpha$ + $\\beta$)의 값은? ① -\\frac{$\\sqrt{3}$}{2} ② -$\\frac{1}{2}$ ③ 0 ④ $\\frac{1}{2}$ ⑤ \\frac{$\\sqrt{3}$}{2}',
  '$0 \\leq x \\leq 2\\pi$에서 방정식 $\\cos x = -\\frac{\\sqrt{5}}{4}$의 두 근을 $\\alpha, \\beta$라 할 때, $\\sin(\\alpha + \\beta)$의 값은? ① $-\\frac{\\sqrt{3}}{2}$ ② $-\\frac{1}{2}$ ③ $0$ ④ $\\frac{1}{2}$ ⑤ $\\frac{\\sqrt{3}}{2}$'
);

// 15. 삼각함수그래프2단계/070a
applyPatch('삼각함수그래프2단계/070a',
  'tanx \\neq 0 이므로 \\tan x - \\frac{$\\sqrt{3}$}{\\tan x} = -1 + $\\sqrt{3}$ 의 양변에 \\tan x 를 곱하여 정리하면 $$\\tan^2 x - (\\sqrt{3} - 1) \\tan x - \\sqrt{3} = 0$$ \\tan x = t 로 놓으면 $$t^2 - (\\sqrt{3} - 1)t - \\sqrt{3} = 0, \\,(t + 1)(t - \\sqrt{3}) = 0$$ $\\therefore$ t = -1 \\text{ 또는 } t = $\\sqrt{3}$$ (i) \\; t = -1, \\; 즉 \\; \\tan x = -1 일 때 $$0 < x < 2\\pi 이므로 x = $$\\frac{3}{4}$$\\pi \\text{ 또는 } x = $$\\frac{7}{4}$$\\pi$$ (ii) \\; t = \\sqrt{3}, \\; 즉 \\; \\tan x = \\sqrt{3} 일 때 $$0 < x < 2\\pi 이므로 x = $$\\frac{\\pi}{3}$$ \\text{ 또는 } x = $$\\frac{4}{3}$$\\pi$$ (i), (ii)에 의하여 $$x_1 = $$\\frac{\\pi}{3}$$, \\; x_2 = $$\\frac{3}{4}$$\\pi, \\; x_3 = $$\\frac{4}{3}$$\\pi, \\; x_4 = $$\\frac{7}{4}$$\\pi \\text{이므로}$$ $$x_2 + x_4 - (x_1 + x_3) = $$\\frac{3}{4}$$\\pi + $$\\frac{7}{4}$$\\pi - \\left($$\\frac{\\pi}{3}$$ + $$\\frac{4}{3}$$\\pi\\right)$$ $$= $$\\frac{5}{6}$$\\pi$$',
  '$\\tan x \\neq 0$ 이므로 $\\tan x - \\frac{\\sqrt{3}}{\\tan x} = -1 + \\sqrt{3}$ 의 양변에 $\\tan x$ 를 곱하여 정리하면 $\\tan^2 x - (\\sqrt{3} - 1) \\tan x - \\sqrt{3} = 0$ \\n$\\tan x = t$ 로 놓으면 $t^2 - (\\sqrt{3} - 1)t - \\sqrt{3} = 0, (t + 1)(t - \\sqrt{3}) = 0 \\therefore t = -1$ 또는 $t = \\sqrt{3}$ \\ni) $t = -1$, 즉 $\\tan x = -1$ 일 때 $0 < x < 2\\pi$이므로 $x = \\frac{3}{4}\\pi$ 또는 $x = \\frac{7}{4}\\pi$ \\nii) $t = \\sqrt{3}$, 즉 $\\tan x = \\sqrt{3}$ 일 때 $0 < x < 2\\pi$이므로 $x = \\frac{\\pi}{3}$ 또는 $x = \\frac{4}{3}\\pi$ \\ni), ii)에 의하여 $x_1 = \\frac{\\pi}{3}, x_2 = \\frac{3}{4}\\pi, x_3 = \\frac{4}{3}\\pi, x_4 = \\frac{7}{4}\\pi$이므로 \\n$x_2 + x_4 - (x_1 + x_3) = \\frac{3}{4}\\pi + \\frac{7}{4}\\pi - \\left(\\frac{\\pi}{3} + \\frac{4}{3}\\pi\\right) = \\frac{5}{6}\\pi$'
);

// 16. 삼각함수그래프2단계/086a
applyPatch('삼각함수그래프2단계/086a',
  '해설 $2\\text{cos}^2x + \\sinx \\\\geq 1$ 에서 $2\\text{cos}^2x + \\sinx - 1 \\\\geq 0$ \\n$2(1 - \\sin^2x) + \\sinx - 1 \\\\geq 0$ \\n$2\\sin^2x - \\sinx - 1 \\\\leq 0$ \\n$(2\\sinx + 1)(\\sinx - 1) \\\\leq 0$ \\n$\\therefore -\\frac{1}{2} \\\\leq \\sinx \\\\leq 1$ \\n위의 그림에서 부등식 $-\\frac{1}{2} \\\\leq \\sinx \\\\leq 1$ 의 해는 \\n$0 \\\\leq x \\\\leq \\frac{7}{6}\\pi$ 또는 $\\frac{11}{6}\\pi \\\\leq x < 2\\pi$',
  '해설 $2\\cos^2x + \\sin x \\geq 1$ 에서 $2\\cos^2x + \\sin x - 1 \\geq 0$ \\n$2(1 - \\sin^2x) + \\sin x - 1 \\geq 0$ \\n$2\\sin^2x - \\sin x - 1 \\leq 0$ \\n$(2\\sin x + 1)(\\sin x - 1) \\leq 0 \\therefore -\\frac{1}{2} \\leq \\sin x \\leq 1$ \\n위의 그림에서 부등식 $-\\frac{1}{2} \\leq \\sin x \\leq 1$ 의 해는 $0 \\leq x \\leq \\frac{7}{6}\\pi$ 또는 $\\frac{11}{6}\\pi \\leq x < 2\\pi$'
);

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Manual patches applied: ${fixedCount}`);
