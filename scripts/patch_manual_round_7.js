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
applyPatch('도형의이동3단계/022',
  '$① $\\pm 1$\\n② $\\pm 3$\\n③ $\\pm 4$\\n④ $\\pm 5$\\n⑤ $\\pm 6$',
  '① $\\pm 1$\\n② $\\pm 3$\\n③ $\\pm 4$\\n④ $\\pm 5$\\n⑤ $\\pm 6$'
);

// 2. 이차부등식3단계/052
applyPatch('이차부등식3단계/052',
  '\\newline $$\\frac{D}{4} = 4 - k \\geq 0$$\\newline \\therefore\\; k \\leq 4\\newline i\\; ),\\; ii\\;)에 의하여 $k$의 값의 범위는 $0 < k \\leq 4$',
  '\\n$\\frac{D}{4} = 4 - k \\geq 0$ \\n$\\therefore k \\leq 4$ \\n$i), ii)$에 의하여 $k$의 값의 범위는 $0 < k \\leq 4$'
);

// 3. 일차부등식3단계/013
applyPatch('일차부등식3단계/013',
  '$US \\$1 = \\text{₩}1200$',
  'US 1\\text{달러} = 1200\\text{원}'
);

// 4. 삼각함수활용2단계/041
applyPatch('삼각함수활용2단계/041',
  '① $\\frac{\\sqrt{2}}{3}$ ② $\\frac{1}{2}$ \\ ③ \\frac{$\\sqrt{10}$}{6} \\ ④ \\frac{$\\sqrt{11}$}{6} \\ ⑤ \\frac{$\\sqrt{3}$}{3}',
  '① $\\frac{\\sqrt{2}}{3}$ ② $\\frac{1}{2}$ ③ $\\frac{\\sqrt{10}}{6}$ ④ $\\frac{\\sqrt{11}}{6}$ ⑤ $\\frac{\\sqrt{3}}{3}$'
);

// 5. 고차방정식4단계/019a
applyPatch('고차방정식4단계/019a',
  'x^3 - 1 = 0에서 w^3 = 1이므로 w^{10} = (w^3)^3w = w \\; (참) \\n\\nw^2 + w + 1 = 0, \\; \\frac{w^{-2}}{w + $\\frac{1}{w}$ + 1} = 0이므로 \\n\\n\\frac{$\\frac{w^2}{1 + w}$ + \\frac{\\overline{w}}{1 + \\overline{w}}}{-2} = -2 \\; (참) \\n\\nw^{4n} + (w + 1)^{4n} + 1 = (w^3w)^n + (-w^2)^{4n} + 1 \\n= (w^3w)^n + (w^4)^{2n} + 1 \\n= (w^3w) + (w^3)^{2n}w^{2n} + 1 \\n= w^n + w^{2n} + 1 = w^{2n} + w^n + 1 \\n\\ni \\; n = 3k \\; (k = 1, 2, 3, $\\cdots$) 이면, \\n\\; w^{2n} = 1, \\; w^n = 1이므로 \\; w^{2n} + w^n + 1 = 3 \\n\\nii \\; n = 3k + 1 \\; (k = 0, 1, 2, $\\cdots$) 이면, \\n\\; w^{6k + 2} + w^{3k + 1} + 1 = w^2 + w + 1 = 0 \\n\\niii \\; n = 3k + 2 \\; (k = 0, 1, 2, $\\cdots$) 이면 \\n\\; w^{6k + 4} + w^{3k + 2} + 1 = w^4 + w^2 + 1 = w + w^2 + 1 = 0 \\n\\n그러므로 \\; w^{4n} + (w + 1)^{4n} + 1 = 0을 만족시키는 30 이하의 양의 정수 n의 개수는 \\n30 - (30 이하의 3의 배수의 개수) = 30 - 10 = 20이다. \\n(참) \\n\\n따라서 옳은 것은 \\; ㄱ, \\; ㄴ, \\; ㄷ이다.',
  '$x^3 - 1 = 0$에서 $w^3 = 1$이므로 $w^{10} = (w^3)^3w = w$ (참) \\n\\n$w^2 + w + 1 = 0, \\frac{w^{-2}}{w + \\frac{1}{w} + 1} = 0$이므로 \\n\\n$\\frac{\\frac{w^2}{1 + w} + \\frac{\\overline{w}}{1 + \\overline{w}}}{-2} = -2$ (참) \\n\\n$\\begin{aligned} &w^{4n} + (w + 1)^{4n} + 1 = (w^3w)^n + (-w^2)^{4n} + 1 \\\\ &= (w^3w)^n + (w^4)^{2n} + 1 \\\\ &= (w^3w) + (w^3)^{2n}w^{2n} + 1 \\\\ &= w^n + w^{2n} + 1 = w^{2n} + w^n + 1 \\end{aligned}$ \\n\\ni) $n = 3k \\; (k = 1, 2, 3, \\cdots)$ 이면, $w^{2n} = 1, w^n = 1$이므로 $w^{2n} + w^n + 1 = 3$ \\n\\nii) $n = 3k + 1 \\; (k = 0, 1, 2, \\cdots)$ 이면, $w^{6k + 2} + w^{3k + 1} + 1 = w^2 + w + 1 = 0$ \\n\\niii) $n = 3k + 2 \\; (k = 0, 1, 2, \\cdots)$ 이면, $w^{6k + 4} + w^{3k + 2} + 1 = w^4 + w^2 + 1 = w + w^2 + 1 = 0$ \\n\\n그러므로 $w^{4n} + (w + 1)^{4n} + 1 = 0$을 만족시키는 $30$ 이하의 양의 정수 $n$의 개수는 $30 - (30 이하의 3의 배수의 개수) = 30 - 10 = 20$이다. (참) \\n\\n따라서 옳은 것은 ㄱ, ㄴ, ㄷ이다.'
);

// 6. 일차부등식3단계/010a
applyPatch('일차부등식3단계/010a',
  '$\\frac{1}{2}x + 1 < 3x - a$ 에서 $x > \\frac{2a + 2}{5}$ \\[\\cdots\\] \\; \\text{①} \\; 0.2(5 - 2x) \\geq 0.3x - 0.4$ 에서 $2(5 - 2x) \\geq 3x - 4 \\; $\\therefore$ \\; x \\leq 2$ \\[\\cdots\\] \\; \\text{②} \\; \\bigcirc_1, \\bigcirc_2 \\; \\text{의 공통부분이 없도록 하려면 위의 그림에서} \\frac{2a + 2}{5} \\geq 2, \\; 2a + 2 \\geq 10 \\; \\therefore \\; a \\geq 4$ 따라서 이를 만족하는 $10$ 이하의 정수 $a$는 $4, 5, 6, \\ldots, 10$의 $7$개다.',
  '$\\frac{1}{2}x + 1 < 3x - a$ 에서 $x > \\frac{2a + 2}{5} \\cdots ①$ \\n$0.2(5 - 2x) \\geq 0.3x - 0.4$ 에서 $2(5 - 2x) \\geq 3x - 4 \\therefore x \\leq 2 \\cdots ②$ \\n①, ② 의 공통부분이 없도록 하려면 위의 그림에서 $\\frac{2a + 2}{5} \\geq 2, 2a + 2 \\geq 10 \\therefore a \\geq 4$ \\n따라서 이를 만족하는 $10$ 이하의 정수 $a$는 $4, 5, 6, \\ldots, 10$의 $7$개다.'
);

// 7. 일차부등식4단계/019a
applyPatch('일차부등식4단계/019a',
  '$|x-4| + |x-3| \\leq a$에서 \\n i) \\; x < 3$일 때, \\n $-(x-4)-(x-3) \\leq a, -2x \\leq a-7 \\n $\\therefore$ \\; x \\geq $\\frac{7-a}{2}$$ \\n 이때, 이 부등식의 해가 존재하려면 $$\\frac{7-a}{2}$ < 3$에서 $a > 1$ \\n ii) \\; 3 \\leq x < 4$일 때, \\n $-(x-4)+(x-3) \\leq a \\quad \\therefore \\; 0 \\times x \\leq a-1 \\n 이때, 이 부등식의 해가 존재하려면 $a-1 \\geq 0$에서 $a \\geq 1$ \\n iii) \\; x \\geq 4$일 때, \\n $(x-4)+(x-3) \\leq a, \\; 2x \\leq a+7 \\n \\therefore \\; x \\leq \\frac{a+7}{2}$ \\n 이때, 이 부등식의 해가 존재하려면 $\\frac{a+7}{2} \\geq 4$에서 \\n $a \\geq 1$ \\n i), ii), iii)에 의하여 $a \\geq 1$ \\n 따라서 $a$의 최소값은 1이다.',
  '$|x-4| + |x-3| \\leq a$에서 \\ni) $x < 3$일 때, $-(x-4)-(x-3) \\leq a, -2x \\leq a-7 \\therefore x \\geq \\frac{7-a}{2}$ \\n이때, 이 부등식의 해가 존재하려면 $\\frac{7-a}{2} < 3$에서 $a > 1$ \\nii) $3 \\leq x < 4$일 때, $-(x-4)+(x-3) \\leq a \\therefore 0 \\times x \\leq a-1$ \\n이때, 이 부등식의 해가 존재하려면 $a-1 \\geq 0$에서 $a \\geq 1$ \\niii) $x \\geq 4$일 때, $(x-4)+(x-3) \\leq a, 2x \\leq a+7 \\therefore x \\leq \\frac{a+7}{2}$ \\n이때, 이 부등식의 해가 존재하려면 $\\frac{a+7}{2} \\geq 4$에서 $a \\geq 1$ \\ni), ii), iii)에 의하여 $a \\geq 1$ \\n따라서 $a$의 최솟값은 $1$이다.'
);

// 8. 삼각함수활용2단계/002a
applyPatch('삼각함수활용2단계/002a',
  '△ABC에서 ∠A + ∠B + ∠C = 180°\\n\\nA : B : C = 2 : 3 : 1 이므로\\n\\n$$∠A = 180° \\cdot \\frac{2}{6} = 60°$$\\n\\n$$∠B = 180° \\cdot \\frac{3}{6} = 90°$$\\n\\n$$∠C = 180° \\cdot \\frac{1}{6} = 30°$$\\n\\n사인법칙에 의하여\\n\\na : b : c = \\sin A : \\sin B : \\sin C\\n\\n= \\sin 60° : \\sin 90° : \\sin 30°\\n\\n= \\frac{$\\sqrt{3}$}{2} : 1 : $\\frac{1}{2}$ = $\\sqrt{3}$ : 2 : 1',
  '$\\triangle ABC$에서 $\\angle A + \\angle B + \\angle C = 180^\\circ$ \\n\\n$\\angle A : \\angle B : \\angle C = 2 : 3 : 1$ 이므로 \\n\\n$\\angle A = 180^\\circ \\cdot \\frac{2}{6} = 60^\\circ$ \\n\\n$\\angle B = 180^\\circ \\cdot \\frac{3}{6} = 90^\\circ$ \\n\\n$\\angle C = 180^\\circ \\cdot \\frac{1}{6} = 30^\\circ$ \\n\\n사인법칙에 의하여 \\n\\n$a : b : c = \\sin A : \\sin B : \\sin C = \\sin 60^\\circ : \\sin 90^\\circ : \\sin 30^\\circ = \\frac{\\sqrt{3}}{2} : 1 : \\frac{1}{2} = \\sqrt{3} : 2 : 1$'
);

// 9. 삼각함수활용2단계/008a
applyPatch('삼각함수활용2단계/008a',
  '삼각형 $ABC$에서 $\\triangle A + \\triangle B + \\triangle C = 180^\\text{o}$ 이므로 $\\sin(B+C) = \\sin(180^\\text{o} - A) = \\sinA \\ \\therefore ① \\ 9\\sin(B+C)\\sinA = 4$에 대입하면 $$9\\sin^2A = 4, \\sin^2A = \\frac{4}{9}$$ \\ $\\therefore \\sinA = \\frac{2}{3} \\text{ (}\\therefore 0^\\text{o} < \\triangle A < 180^\\text{o}\\text{)}$ \\ 이때 삼각형 $ABC$의 외접원의 반지름의 길이를 $R$이라 하면 사인법칙에서 $$\\frac{BC}{\\sinA} = 2R \\text{이므로 } 2R\\sinA = BC$$ $$2R \\times \\frac{2}{3} = 8$$ $\\therefore R = 8 \\times \\frac{3}{4} = 6$',
  '삼각형 $ABC$에서 $A + B + C = 180^\\circ$ 이므로 $\\sin(B+C) = \\sin(180^\\circ - A) = \\sin A \\cdots ①$ \\n$9\\sin(B+C)\\sin A = 4$에 대입하면 $9\\sin^2 A = 4, \\sin^2 A = \\frac{4}{9}$ \\n$\\therefore \\sin A = \\frac{2}{3} \\quad (\\because 0^\\circ < A < 180^\\circ)$ \\n이때 삼각형 $ABC$의 외접원의 반지름의 길이를 $R$이라 하면 사인법칙에서 $\\frac{\\overline{BC}}{\\sin A} = 2R$ 이므로 $2R\\sin A = \\overline{BC}$ \\n$2R \\times \\frac{2}{3} = 8$ \\n$\\therefore R = 8 \\times \\frac{3}{4} = 6$'
);

// 10. 지수함수2단계/001a
applyPatch('지수함수2단계/001a',
  'ㄷ. $f(x^3) = a^{x^3} \\neq a^{3x} = \\{f(x)\\}^3$ (거짓)',
  'ㄷ. $f(x^3) = a^{x^3} \\neq a^{3x} = \\{ f(x) \\}^3$ (거짓)'
);

// 11. 지수함수2단계/016a
applyPatch('지수함수2단계/016a',
  '$a^{3x} = t$에서 $3x = \\log_a t$, $x = \\frac{1}{3} \\log_a t$이므로\\\\ A\\left($\\frac{1}{3}$ \\log_a t,\\ t\\right)이다.\\\\ a^{$\\frac{x}{2}$} = t$에서 $$\\frac{x}{2}$ = \\log_a t$, $x = 2 \\log_a t$이므로\\\\ C(2 \\log_a t,\\ t)이다.\\\\ 따라서\\ \\overline{AC} = 2 \\log_a t - \\frac{1}{3} \\log_a t = \\frac{5}{3} \\log_a t$이므로\\\\ $\\frac{5}{3} \\log_a t = 20$, $\\log_a t = 12$\\\\ $\\therefore\\ t = a^{12}$\\\\ $\\therefore\\ A(4,\\ a^{12}),\\ C(24,\\ a^{12})$\\\\ 한편, 점 B는 $y = a^x$의 그래프와 직선 $y = a^{12}$의 교점이므로\\\\ B(12,\\ a^{12})\\\\ 이때 D(4,\\ a^4)이고, 삼각형 ADB의 넓이가 24이므로\\\\ $\\frac{1}{2} \\cdot (12 - 4) \\cdot (a^{12} - a^4) = 24$\\\\ $a^{12} - a^4 - 6 = 0$\\\\ $(a^4 - 2)(a^8 + 2a^4 + 3) = 0$\\\\ $\\therefore\\ a^4 = 2\\ (\\therefore\\ a^8 + 2a^4 + 3 > 0)$\\\\ E(24,\\ a^{24})이므로 삼각형 BCE의 넓이는\\\\ $\\frac{1}{2} \\cdot (24 - 12) \\cdot (a^{24} - a^{12}) = 336$',
  '$a^{3x} = t$에서 $3x = \\log_a t, x = \\frac{1}{3} \\log_a t$이므로 $A\\left(\\frac{1}{3} \\log_a t, t\\right)$이다. \\n$a^{\\frac{x}{2}} = t$에서 $\\frac{x}{2} = \\log_a t, x = 2 \\log_a t$이므로 $C(2 \\log_a t, t)$이다. \\n따라서 $\\overline{AC} = 2 \\log_a t - \\frac{1}{3} \\log_a t = \\frac{5}{3} \\log_a t$이므로 \\n$\\frac{5}{3} \\log_a t = 20, \\log_a t = 12 \\therefore t = a^{12}$ \\n$\\therefore A(4, a^{12}), C(24, a^{12})$ \\n한편, 점 $B$는 $y = a^x$의 그래프와 직선 $y = a^{12}$의 교점이므로 $B(12, a^{12})$ \\n이때 $D(4, a^4)$이고, 삼각형 $ADB$의 넓이가 $24$이므로 \\n$\\frac{1}{2} \\cdot (12 - 4) \\cdot (a^{12} - a^4) = 24$ \\n$a^{12} - a^4 - 6 = 0, (a^4 - 2)(a^8 + 2a^4 + 3) = 0$ \\n$\\therefore a^4 = 2 (\\because a^8 + 2a^4 + 3 > 0)$ \\n$E(24, a^{24})$이므로 삼각형 $BCE$의 넓이는 \\n$\\frac{1}{2} \\cdot (24 - 12) \\cdot (a^{24} - a^{12}) = 336$'
);

// 12. 지수함수2단계/035a
applyPatch('지수함수2단계/035a',
  '해설 $y = 4^x - 2 \\cdot 2^x + k = (2^x)^2 - 2 \\cdot 2^x + k$ \\[ 2^x = t \\ (t > 0) \\] 으로 놓으면 주어진 함수는 \\[ y = t^2 - 2t + k = (t-1)^2 + k - 1 \\quad \\cdots \\circled{1} \\] 따라서 $t > 0$일 때, 함수 \\( \\circled{1} \\)은 $t = 1$에서 최소값 $k-1$을 갖고, 최소값이 8이므로 \\[ k - 1 = 8 \\] \\[ \\therefore k = 9 \\]',
  '해설 $y = 4^x - 2 \\cdot 2^x + k = (2^x)^2 - 2 \\cdot 2^x + k$ \\n$2^x = t \\ (t > 0)$으로 놓으면 주어진 함수는 \\n$y = t^2 - 2t + k = (t-1)^2 + k - 1 \\cdots ①$ \\n따라서 $t > 0$일 때, 함수 ①은 $t = 1$에서 최소값 $k-1$을 갖고, 최소값이 8이므로 \\n$k - 1 = 8 \\therefore k = 9$'
);

// 13. 지수함수2단계/057a
applyPatch('지수함수2단계/057a',
  '해설 $3^{2x+1} - 10 \\cdot 3^x + k = 0$에서 \\[ 3 \\cdot \\left(3^x\\right)^2 - 10 \\cdot 3^x + k = 0 \\] $3^x = t \\ (t > 0)$로 놓으면 \\[ 3t^2 - 10t + k = 0 \\quad \\cdots \\circled{1} \\] 방정식 $3^{2x+1} - 10 \\cdot 3^x + k = 0$의 두 근을 $\\alpha, \\beta$라 하면 방정식 $\\circled{1}$의 두 근은 $3^\\alpha, 3^\\beta$이다. 따라서 이차방정식의 근과 계수의 관계에 의하여 \\[ 3^\\alpha \\cdot 3^\\beta = \\frac{k}{3}, \\quad 3^\\alpha + 3^\\beta = \\frac{k}{3} \\] $\\alpha + \\beta = 0$이므로 $1 = \\frac{k}{3}$ \\[ \\therefore \\ k = 3 \\]',
  '해설 $3^{2x+1} - 10 \\cdot 3^x + k = 0$에서 \\n$3 \\cdot \\left(3^x\\right)^2 - 10 \\cdot 3^x + k = 0$ \\n$3^x = t \\ (t > 0)$로 놓으면 \\n$3t^2 - 10t + k = 0 \\cdots ①$ \\n방정식 $3^{2x+1} - 10 \\cdot 3^x + k = 0$의 두 근을 $\\alpha, \\beta$라 하면 방정식 ①의 두 근은 $3^\\alpha, 3^\\beta$이다. 따라서 이차방정식의 근과 계수의 관계에 의하여 \\n$3^\\alpha \\cdot 3^\\beta = \\frac{k}{3}, \\quad 3^\\alpha + 3^\\beta = \\frac{k}{3}$ \\n$\\alpha + \\beta = 0$이므로 $1 = \\frac{k}{3} \\therefore k = 3$'
);

// 14. 지수함수2단계/067a
applyPatch('지수함수2단계/067a',
  '$9^x - 3^{x+2} + 18 < 0$에서 $3^x = t$라 하면 $t > 0$이고 주어진 부등식은 $$t^2 - 9t + 18 < 0$$ $$(t-3)(t-6) < 0$$ $\\therefore \\; 3 < 3^x < 6, \\; 3 < t < 6$$ 이 때 주어진 부등식의 해가 $$\\alpha$ < x < $\\beta$$이므로 3^\\alpha < 3^x < 3^\\beta$$ 따라서 $3^$\\alpha$ = 3, \\; 3^$\\beta$ = 6$ $$\\therefore$ \\; 3^$\\alpha$ \\cdot 3^$\\beta$ = 3 \\times 6 = 18$',
  '$9^x - 3^{x+2} + 18 < 0$에서 $3^x = t$라 하면 $t > 0$이고 주어진 부등식은 \\n$t^2 - 9t + 18 < 0$ \\n$(t-3)(t-6) < 0$ \\n$\\therefore 3 < t < 6, 3 < 3^x < 6$ \\n이 때 주어진 부등식의 해가 $\\alpha < x < \\beta$이므로 $3^\\alpha < 3^x < 3^\\beta$ \\n따라서 $3^\\alpha = 3, 3^\\beta = 6$ \\n$\\therefore 3^\\alpha \\cdot 3^\\beta = 3 \\times 6 = 18$'
);

// 15. 로그함수2단계/021a
applyPatch('로그함수2단계/021a',
  '해설 \\(A(k, 6), B(k, 5), C(k, -4), D(k, -(n+4))\\)이므로 \\(\\log_a k = 6\\)에서 \\(a^6 = k\\) \\[\\therefore a = k^{\\frac{1}{6}}\\] \\(\\log_b k = 5\\)에서 \\(b^5 = k\\) \\[\\therefore b = k^{\\frac{1}{5}}\\] \\(\\log_c k = -4\\)에서 \\(c^{-4} = k\\) \\[\\therefore c = k^{-\\frac{1}{4}}\\] \\(\\log_d k = -(n+4)\\)에서 \\(d^{(n+4)} = k\\) \\[\\therefore d = k^{-\\frac{1}{n+4}}\\] \\[\\sqrt{bc} = k^{\\frac{1}{10}} \\cdot k^{-\\frac{1}{4}} = k^{-\\frac{3}{20}},\\] \\(ad^3 = k^{\\frac{1}{6}} \\cdot k^{-\\frac{3}{n+4}} = k^{\\frac{6}{n+4}}\\) 이므로 \\[\\sqrt{bc} > ad^3\\]에서 \\(k^{-\\frac{3}{20}} > k^{\\frac{6}{n+4}}\\) \\[k > 1\\)이므로 \\(-\\frac{3}{20} > \\frac{6}{n+4}, \\frac{3}{n+4} > \\frac{19}{60}\\] \\[n+4 < \\frac{180}{19}\\] \\[\\therefore n < \\frac{104}{19}\\] 따라서 자연수 \\(n\\)의 최댓값은 5이다.',
  '해설 $A(k, 6), B(k, 5), C(k, -4), D(k, -(n+4))$이므로 \\n$\\log_a k = 6$에서 $a^6 = k \\therefore a = k^{\\frac{1}{6}}$ \\n$\\log_b k = 5$에서 $b^5 = k \\therefore b = k^{\\frac{1}{5}}$ \\n$\\log_c k = -4$에서 $c^{-4} = k \\therefore c = k^{-\\frac{1}{4}}$ \\n$\\log_d k = -(n+4)$에서 $d^{(n+4)} = k \\therefore d = k^{-\\frac{1}{n+4}}$ \\n$\\sqrt{bc} = k^{\\frac{1}{10}} \\cdot k^{-\\frac{1}{4}} = k^{-\\frac{3}{20}}, ad^3 = k^{\\frac{1}{6}} \\cdot k^{-\\frac{3}{n+4}} = k^{\\frac{6}{n+4}}$ 이므로 \\n$\\sqrt{bc} > ad^3$에서 $k^{-\\frac{3}{20}} > k^{\\frac{6}{n+4}}$ \\n$k > 1$이므로 $-\\frac{3}{20} > \\frac{6}{n+4}, \\frac{3}{n+4} > \\frac{19}{60}$ \\n$n+4 < \\frac{180}{19} \\therefore n < \\frac{104}{19}$ \\n따라서 자연수 $n$의 최댓값은 $5$이다.'
);

// 16. 로그함수2단계/048a
applyPatch('로그함수2단계/048a',
  '로그의 성질을 이용하여 로그가 포함된 방정식의 해를 구할 수 있는가? 로그의 진수의 조건에 의하여 $x+1 > 0, \\; x-3 > 0$ 즉, $x > 3$ \\; $\\cdots$ \\; \\text{①} \\log_{$\\frac{1}{2}$}(x-3) = -\\log_2(x-3)$이므로 $\\log_2(x+1) - 5 = \\log_{$\\frac{1}{2}$}(x-3)$에서 $\\log_2(x+1) + \\log_2(x-3) = 5$ $\\log_2(x+1)(x-3) = 5$ $(x+1)(x-3) = 2^5 = 32$ $x^2 - 2x - 35 = 0, \\; (x+5)(x-7) = 0$ $$\\therefore$ \\; x = -5 \\; \\text{또는} \\; x = 7$ 이때 ①에 의하여 $x = 7$',
  '로그의 성질을 이용하여 로그가 포함된 방정식의 해를 구할 수 있는가? \\n로그의 진수의 조건에 의하여 $x+1 > 0, x-3 > 0$ 즉, $x > 3 \\cdots ①$ \\n$\\log_{\\frac{1}{2}}(x-3) = -\\log_2(x-3)$이므로 $\\log_2(x+1) - 5 = \\log_{\\frac{1}{2}}(x-3)$에서 $\\log_2(x+1) + \\log_2(x-3) = 5$ \\n$\\log_2(x+1)(x-3) = 5, (x+1)(x-3) = 2^5 = 32$ \\n$x^2 - 2x - 35 = 0, (x+5)(x-7) = 0$ \\n$\\therefore x = -5 \\text{ 또는 } x = 7$ \\n이때 ①에 의하여 $x = 7$'
);

// 17. 삼각함수성질2단계/008
applyPatch('삼각함수성질2단계/008',
  '0 < \\theta < $\\frac{\\pi}{2}$이고 각 2\\theta를 나타내는 동경과 각 8\\theta를 나타내는 동경이 일치할 때, \\sin\\left(\\theta + $\\frac{\\pi}{6}$\\right)의 값은? ① 0 ② $\\frac{1}{2}$ ③ \\frac{$\\sqrt{2}$}{2} ④ \\frac{$\\sqrt{3}$}{2} ⑤ 1',
  '$0 < \\theta < \\frac{\\pi}{2}$이고 각 $2\\theta$를 나타내는 동경과 각 $8\\theta$를 나타내는 동경이 일치할 때, $\\sin\\left(\\theta + \\frac{\\pi}{6}\\right)$의 값은? ① $0$ ② $\\frac{1}{2}$ ③ $\\frac{\\sqrt{2}}{2}$ ④ $\\frac{\\sqrt{3}}{2}$ ⑤ $1$'
);

// 18. 삼각함수성질2단계/013a
applyPatch('삼각함수성질2단계/013a',
  '해설 $\\frac{1}{2} \\theta$와 $3 \\theta$의 동경을 각각 반직선 $OP$, $OQ$라 하자. (i) 두 점 $P$, $Q$가 같은 방향일 때, $$3 \\theta - \\frac{1}{2} \\theta = 2n \\pi \\ (단, \\ n \\은 \\ 정수)$$ $$\\frac{5}{2} \\theta = 2n \\pi, \\ \\theta = \\frac{4}{5} n \\pi$$ 이때 $0 < \\theta < \\pi$이므로 $n=1$일 때 $\\theta = \\frac{4}{5} \\pi$ (ii) 두 점 $P$, $Q$가 반대 방향일 때, $$3 \\theta - \\frac{1}{2} \\theta = 2n \\pi + \\pi \\ (단, \\ n \\은 \\ 정수)$$ $$\\frac{5}{2} \\theta = 2n \\pi + \\pi, \\ \\theta = \\frac{4}{5} n \\pi + \\frac{2}{5} \\pi$$ 이때 $0 < \\theta < \\pi$이므로 $n=0$일 때 $\\theta = \\frac{2}{5} \\pi$ 따라서 (i), (ii)로부터 모든 $\\theta$의 값의 합은 $$\\frac{4}{5} \\pi + \\frac{2}{5} \\pi = \\frac{6}{5} \\pi$$',
  '해설 $\\frac{1}{2} \\theta$와 $3 \\theta$의 동경을 각각 반직선 $OP, OQ$라 하자. \\ni) 두 점 $P, Q$가 같은 방향일 때, $3 \\theta - \\frac{1}{2} \\theta = 2n \\pi \\ (단, n은 정수)$ \\n$\\frac{5}{2} \\theta = 2n \\pi, \\theta = \\frac{4}{5} n \\pi$ \\n이때 $0 < \\theta < \\pi$이므로 $n=1$일 때 $\\theta = \\frac{4}{5} \\pi$ \\nii) 두 점 $P, Q$가 반대 방향일 때, $3 \\theta - \\frac{1}{2} \\theta = 2n \\pi + \\pi \\ (단, n은 정수)$ \\n$\\frac{5}{2} \\theta = 2n \\pi + \\pi, \\theta = \\frac{4}{5} n \\pi + \\frac{2}{5} \\pi$ \\n이때 $0 < \\theta < \\pi$이므로 $n=0$일 때 $\\theta = \\frac{2}{5} \\pi$ \\n따라서 i), ii)로부터 모든 $\\theta$의 값의 합은 $\\frac{4}{5} \\pi + \\frac{2}{5} \\pi = \\frac{6}{5} \\pi$'
);

// 19. 삼각함수성질2단계/019a
applyPatch('삼각함수성질2단계/019a',
  '원뿔의 전개도는 다음 그림과 같고, 부채꼴의 호의 길이는 원의 둘레의 길이와 같으므로 $$2\\pi \\cdot 3 = 6\\pi$$ 따라서 옆면인 부채꼴의 넓이는 $$\\frac{1}{2} \\cdot 8 \\cdot 6\\pi = 24\\pi$$ ∴ (원뿔의 겉넓이) = 24\\pi + \\pi \\cdot 3^2 = 33\\pi$$',
  '원뿔의 전개도는 다음 그림과 같고, 부채꼴의 호의 길이는 원의 둘레의 길이와 같으므로 $2\\pi \\cdot 3 = 6\\pi$ \\n따라서 옆면인 부채꼴의 넓이는 $\\frac{1}{2} \\cdot 8 \\cdot 6\\pi = 24\\pi$ \\n$\\therefore \\text{(원뿔의 겉넓이)} = 24\\pi + \\pi \\cdot 3^2 = 33\\pi$'
);

// 20. 삼각함수성질2단계/038
applyPatch('삼각함수성질2단계/038',
  'cos\\theta < 0, \\tan\\theta < 0일 때, 다음 중 옳은 것은? (단, 0 < \\theta < 2\\pi) ① \\sin\\theta\\cos\\theta > 0 ② \\sin\\theta\\tan\\theta > 0 ③ \\cos$\\frac{\\theta}{2}$ < 0 ④ \\sin2\\theta > 0 ⑤ \\tan\\left(\\theta + $\\frac{\\pi}{2}$\\right) > 0',
  '$\\cos\\theta < 0, \\tan\\theta < 0$일 때, 다음 중 옳은 것은? (단, $0 < \\theta < 2\\pi$) ① $\\sin\\theta\\cos\\theta > 0$ ② $\\sin\\theta\\tan\\theta > 0$ ③ $\\cos\\frac{\\theta}{2} < 0$ ④ $\\sin2\\theta > 0$ ⑤ $\\tan\\left(\\theta + \\frac{\\pi}{2}\\right) > 0$'
);

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Manual patches applied: ${fixedCount}`);
