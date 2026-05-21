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

// 1. 지수함수3단계/041
applyPatch('지수함수3단계/041',
  '$a^{2x} = t$에서 $2x = \\log_a t$, $x = \\frac{1}{2} \\log_a t$이므로\\\\ A\\left($\\frac{1}{2}$ \\log_a t, t\\right)이다.\\\\ $\\frac{x}{3}$ = t$에서 $$\\frac{x}{3}$ = \\log_a t$, $x = 3 \\log_a t$이므로\\\\ C(3 \\log_a t, t)이다.\\\\ 따라서\\ AC = 3 \\log_a t - \\frac{1}{2} \\log_a t = \\frac{5}{2} \\log_a t$이므로\\\\ $\\frac{5}{2}$ \\log_a t = 5, \\log_a t = 2\\\\ $\\therefore$ t = a^2\\\\ $\\therefore$ A(1, a^2), C(6, a^2)\\\\ 한편 점 B는 $y = a^x$의 그래프와 직선 $y = a^2$의 교점이므로 $B(2, a^2)$\\\\ 이때 $D(1, a)$이고, 삼각형 $ADB$의 넓이가 1이므로\\\\ $\\frac{1}{2}$ \\cdot (2-1) \\cdot (a^2 - a) = 1\\\\ $\\therefore$ a = 2\\ (\\because a > 1)\\\\ E(6, a^6)$이므로 삼각형 $BCE$의 넓이는\\\\ $\\frac{1}{2}$ \\cdot (6-2) \\cdot (a^6 - a^2) = 120',
  '$a^{2x} = t$에서 $2x = \\log_a t, x = \\frac{1}{2} \\log_a t$이므로 $A\\left(\\frac{1}{2} \\log_a t, t\\right)$이다. \\n$a^{\\frac{x}{3}} = t$에서 $\\frac{x}{3} = \\log_a t, x = 3 \\log_a t$이므로 $C(3 \\log_a t, t)$이다. \\n따라서 $\\overline{AC} = 3 \\log_a t - \\frac{1}{2} \\log_a t = \\frac{5}{2} \\log_a t$이므로 \\n$\\frac{5}{2} \\log_a t = 5, \\log_a t = 2 \\therefore t = a^2$ \\n$\\therefore A(1, a^2), C(6, a^2)$ \\n한편 점 $B$는 $y = a^x$의 그래프와 직선 $y = a^2$의 교점이므로 $B(2, a^2)$ \\n이때 $D(1, a)$이고, 삼각형 $ADB$의 넓이가 $1$이므로 \\n$\\frac{1}{2} \\cdot (2-1) \\cdot (a^2 - a) = 1 \\therefore a = 2 (\\because a > 1)$ \\n$E(6, a^6)$이므로 삼각형 $BCE$의 넓이는 \\n$\\frac{1}{2} \\cdot (6-2) \\cdot (a^6 - a^2) = 120$'
);

// 2. 로그함수3단계/019
applyPatch('로그함수3단계/019',
  '부등식 $\\log_a (6-x) < \\log_a (x+5) + 1$의 해가 $-4 < x < 6$일 때, 양수 $a$의 값을 구하시오. (단, a \\neq 1)',
  '부등식 $\\log_a (6-x) < \\log_a (x+5) + 1$의 해가 $-4 < x < 6$일 때, 양수 $a$의 값을 구하시오. (단, $a \\neq 1$)'
);

// 3. 로그함수3단계/046
applyPatch('로그함수3단계/046',
  '직선 $y = -x$ 위의 점 P를 $P(a, -a)$라 하자. 직선 $y = -a$와 곡선 $y = -\\log_2 \\left( -x + \\frac{1}{4} \\right)$의 교점 R의 $x$좌표는 $$-\\log_2 \\left( -x + \\frac{1}{4} \\right) = -a$$에서 $-x + \\frac{1}{4} = 2^a$$\\therefore x = -2^a + \\frac{1}{4}$$\\therefore R \\left( -2^a + \\frac{1}{4}, -a \\right)$$ 직선 x = a와 곡선 y = 4^x의 교점 Q의 좌표는 (a, 4^a)이고 삼각형 PQR이 PQ = PR인 직각이등변삼각형이므로 $$-a - 4^a = -2^a + \\frac{1}{4} - a$$\\therefore 4^a - 2^a + \\frac{1}{4} = 0$$ $2^a = t (t > 0)$로 놓으면 $t^2 - t + $\\frac{1}{4}$ = 0$$\\left( t - \\frac{1}{2} \\right)^2 = 0이므로 \\therefore t = \\frac{1}{2} 즉 2^a = \\frac{1}{2} = 2^{-1}이므로 a = -1 따라서 P(-1, 1), Q(-1, \\frac{1}{4}), R \\left( \\frac{1}{4}, 1 \\right)이므로 삼각형 PQR의 넓이는 $$$\\frac{1}{2}$ \\cdot $\\frac{3}{4}$ \\cdot $\\frac{3}{4}$ = \\frac{9}{32}$$',
  '직선 $y = -x$ 위의 점 $P$를 $P(a, -a)$라 하자. 직선 $y = -a$와 곡선 $y = -\\log_2 \\left( -x + \\frac{1}{4} \\right)$의 교점 $R$의 $x$좌표는 $-\\log_2 \\left( -x + \\frac{1}{4} \\right) = -a$에서 $-x + \\frac{1}{4} = 2^a \\therefore x = -2^a + \\frac{1}{4}$ \\n$\\therefore R \\left( -2^a + \\frac{1}{4}, -a \\right)$ \\n직선 $x = a$와 곡선 $y = 4^x$의 교점 $Q$의 좌표는 $(a, 4^a)$이고 삼각형 $PQR$이 $\\overline{PQ} = \\overline{PR}$인 직각이등변삼각형이므로 \\n$-a - 4^a = -2^a + \\frac{1}{4} - a \\therefore 4^a - 2^a + \\frac{1}{4} = 0$ \\n$2^a = t (t > 0)$로 놓으면 $t^2 - t + \\frac{1}{4} = 0, \\left( t - \\frac{1}{2} \\right)^2 = 0$이므로 $t = \\frac{1}{2}$ \\n즉 $2^a = \\frac{1}{2} = 2^{-1}$이므로 $a = -1$ \\n따라서 $P(-1, 1), Q(-1, \\frac{1}{4}), R \\left( \\frac{1}{4}, 1 \\right)$이므로 삼각형 $PQR$의 넓이는 $\\frac{1}{2} \\cdot \\frac{3}{4} \\cdot \\frac{3}{4} = \\frac{9}{32}$'
);

// 4. 삼각함수3단계/011a
applyPatch('삼각함수3단계/011a',
  '조건 (가)에서 $\\cos \\theta > 0$이므로 $\\theta$는 제1사분면 또는 제4사분면의 각이다. 조건 (나)에서 동경 $OP\'$이 나타내는 각의 크기가 $3\\theta$이고, 점 $P$와 $P\'$이 $y = x$에 대하여 대칭이므로 $$\\frac{30 + \\theta}{2} = 2m\\pi + \\frac{\\pi}{4} \\quad (단, \\ m \\은 \\ 정수)$$ 또는 $$\\frac{30 + \\theta}{2} = 2m\\pi + \\frac{5}{4}\\pi \\quad (단, \\ m \\은 \\ 정수)$$ ∴ $\\theta = m\\pi + \\frac{\\pi}{8}$ 또는 $\\theta = m\\pi + \\frac{5}{8}\\pi$ ⑦에 의하여 $$\\theta = \\frac{\\pi}{8}, \\frac{13}{8}\\pi, \\frac{17}{8}\\pi, \\frac{29}{8}\\pi, \\frac{33}{8}\\pi \\quad (\\because 0 < \\theta < 5\\pi)$$ ∴ $\\frac{\\theta}{3} = \\frac{\\pi}{24}, \\frac{13}{24}\\pi, \\frac{17}{24}\\pi, \\frac{29}{24}\\pi, \\frac{11}{8}\\pi$ 이때 $\\frac{\\pi}{24}$는 제1사분면을, $\\frac{13}{24}\\pi$와 $\\frac{17}{24}\\pi$는 제2사분면을, $\\frac{29}{24}\\pi$와 $\\frac{11}{8}\\pi$는 제3사분면을 지나므로 $\\frac{\\theta}{3}$를 나타내는 동경은 제4사분면을 지나지 않는다.',
  '조건 (가)에서 $\\cos \\theta > 0$이므로 $\\theta$는 제1사분면 또는 제4사분면의 각이다. 조건 (나)에서 동경 $OP\'$이 나타내는 각의 크기가 $3\\theta$이고, 점 $P$와 $P\'$이 $y = x$에 대하여 대칭이므로 $\\frac{3\\theta + \\theta}{2} = 2m\\pi + \\frac{\\pi}{4} \\quad (단, m은 정수)$ 또는 $\\frac{3\\theta + \\theta}{2} = 2m\\pi + \\frac{5}{4}\\pi \\quad (단, m은 정수)$ \\n$\\therefore \\theta = m\\pi + \\frac{\\pi}{8}$ 또는 $\\theta = m\\pi + \\frac{5}{8}\\pi$ \\n⑦에 의하여 $\\theta = \\frac{\\pi}{8}, \\frac{13}{8}\\pi, \\frac{17}{8}\\pi, \\frac{29}{8}\\pi, \\frac{33}{8}\\pi \\quad (\\because 0 < \\theta < 5\\pi)$ \\n$\\therefore \\frac{\\theta}{3} = \\frac{\\pi}{24}, \\frac{13}{24}\\pi, \\frac{17}{24}\\pi, \\frac{29}{24}\\pi, \\frac{11}{8}\\pi$ \\n이때 $\\frac{\\pi}{24}$는 제1사분면을, $\\frac{13}{24}\\pi$와 $\\frac{17}{24}\\pi$는 제2사분면을, $\\frac{29}{24}\\pi$와 $\\frac{11}{8}\\pi$는 제3사분면을 지나므로 $\\frac{\\theta}{3}$를 나타내는 동경은 제4사분면을 지나지 않는다.'
);

// 5. 삼각함수3단계/023
applyPatch('삼각함수3단계/023',
  '$\\sqrt{\\sin\\theta} \\sqrt{\\cos\\theta} = -\\sqrt{\\sin\\theta \\cos\\theta}$ 이고 \\sin\\theta = -$\\frac{5}{13}$$ 일 때, \\cos\\theta, \\tan\\theta 의 값은? ① -$$\\frac{12}{13}$$, -$$\\frac{5}{12}$$ ② -$$\\frac{12}{13}$$, $$\\frac{5}{12}$$ ③ $$\\frac{12}{13}$$, $$\\frac{5}{12}$$ ④ $$\\frac{12}{13}$$, -$$\\frac{5}{12}$$ ⑤ $$\\frac{5}{12}$$, -$\\frac{12}{13}$',
  '$\\sqrt{\\sin\\theta} \\sqrt{\\cos\\theta} = -\\sqrt{\\sin\\theta \\cos\\theta}$ 이고 $\\sin\\theta = -\\frac{5}{13}$ 일 때, $\\cos\\theta, \\tan\\theta$ 의 값은? ① $-\\frac{12}{13}, -\\frac{5}{12}$ ② $-\\frac{12}{13}, \\frac{5}{12}$ ③ $\\frac{12}{13}, \\frac{5}{12}$ ④ $\\frac{12}{13}, -\\frac{5}{12}$ ⑤ $\\frac{5}{12}, -\\frac{12}{13}$'
);

// 6. 삼각함수그래프3단계/053
applyPatch('삼각함수그래프3단계/053',
  '해설 $f\\left(\\frac{7\\pi}{2}\\right)=0$에서 $2\\cos\\left(\\frac{7a\\pi}{2}\\right)+b=0$ \\[ \\therefore \\ b=-2\\cos\\left(\\frac{7a\\pi}{2}\\right) \\quad \\cdots \\; \\text{\\n\\n①} \\] $f\\left(-\\frac{\\pi}{2}\\right)=0$에서 $2\\cos\\left(-\\frac{a\\pi}{2}\\right)+b=0$ \\[ 2\\cos\\left(\\frac{a\\pi}{2}\\right)+b=0 \\] \\[ \\therefore \\ b=-2\\cos\\left(\\frac{a\\pi}{2}\\right) \\quad \\cdots \\; \\text{②} \\] ①,\\n②에서 \\[ \\cos\\left(\\frac{7a\\pi}{2}\\right)=\\cos\\left(\\frac{a\\pi}{2}\\right) \\quad \\cdots \\; \\text{③} \\] 이때 $0<a<\\frac{4}{7}$에서 \\[ 0<\\frac{a\\pi}{2}<\\frac{2}{7}\\pi,\\n\\; 0<\\frac{7a\\pi}{2}<2\\pi \\] 또,\\n③에서 $\\cos\\left(\\frac{7a\\pi}{2}\\right)=\\cos\\left(\\frac{a\\pi}{2}\\right)$이므로 함수 $y=\\cos x$의 그래프를 나타내면 다음 그림과 같다.\\n\\[ \\therefore \\ \\frac{7a\\pi}{2}=\\frac{a\\pi}{2}+2\\pi \\] 또는 \\[ \\frac{7a\\pi}{2}=2\\pi-\\frac{a\\pi}{2} \\] \\[ (\\text{i}) \\; \\frac{7a\\pi}{2}=\\frac{a\\pi}{2} \\; \\text{일 때,\\n} \\; 4a\\pi=0 \\; \\text{이므로} \\; a=0 \\] \\[ (\\text{ii}) \\; \\frac{7a\\pi}{2}=\\pi \\; \\text{일 때,\\n} \\; 3a\\pi=0 \\; \\text{이므로} \\; a=0 \\] \\[ (\\text{iii}) \\; \\frac{7a\\pi}{2}=2\\pi-\\frac{a\\pi}{2} \\; \\text{일 때,\\n} \\; 4a\\pi=2\\pi \\; \\text{이므로} \\; a=\\frac{1}{2} \\] $(\\text{i}), (\\text{ii}), (\\text{iii})$에 의하여 \\[ a=\\frac{1}{2} \\; (\\because \\; a>0) \\; \\text{이고} \\; a\\text{의 값을 ②에 대입하면} \\] \\[ b=-2\\cos\\left(\\frac{a\\pi}{2}\\right)=-2\\cdot\\frac{\\sqrt{2}}{2}=-\\sqrt{2} \\; \\text{이다.} \\]',
  '해설 $f\\left(\\frac{7\\pi}{2}\\right)=0$에서 $2\\cos\\left(\\frac{7a\\pi}{2}\\right)+b=0 \\therefore b=-2\\cos\\left(\\frac{7a\\pi}{2}\\right) \\cdots ①$ \\n$f\\left(-\\frac{\\pi}{2}\\right)=0$에서 $2\\cos\\left(-\\frac{a\\pi}{2}\\right)+b=0, 2\\cos\\left(\\frac{a\\pi}{2}\\right)+b=0 \\therefore b=-2\\cos\\left(\\frac{a\\pi}{2}\\right) \\cdots ②$ \\n①, ②에서 $\\cos\\left(\\frac{7a\\pi}{2}\\right)=\\cos\\left(\\frac{a\\pi}{2}\\right) \\cdots ③$ \\n이때 $0<a<\\frac{4}{7}$에서 $0<\\frac{a\\pi}{2}<\\frac{2}{7}\\pi, 0<\\frac{7a\\pi}{2}<2\\pi$ \\n또, ③에서 $\\cos\\left(\\frac{7a\\pi}{2}\\right)=\\cos\\left(\\frac{a\\pi}{2}\\right)$이므로 함수 $y=\\cos x$의 그래프를 나타내면 다음 그림과 같다. \\n$\\therefore \\frac{7a\\pi}{2}=\\frac{a\\pi}{2}+2\\pi$ 또는 $\\frac{7a\\pi}{2}=2\\pi-\\frac{a\\pi}{2}$ \\ni) $\\frac{7a\\pi}{2}=\\frac{a\\pi}{2}$ 일 때, $4a\\pi=0$ 이므로 $a=0$ \\nii) $\\frac{7a\\pi}{2}=\\pi$ 일 때, $3a\\pi=0$ 이므로 $a=0$ \\niii) $\\frac{7a\\pi}{2}=2\\pi-\\frac{a\\pi}{2}$ 일 때, $4a\\pi=2\\pi$ 이므로 $a=\\frac{1}{2}$ \\n(i), (ii), (iii)에 의하여 $a=\\frac{1}{2} (\\because a>0)$ 이고 $a$의 값을 ②에 대입하면 $b=-2\\cos\\left(\\frac{a\\pi}{2}\\right)=-2\\cdot\\frac{\\sqrt{2}}{2}=-\\sqrt{2}$ 이다.'
);

// 7. 삼각함수그래프3단계/059
applyPatch('삼각함수그래프3단계/059',
  'cos\\left(\\theta + $\\frac{3}{2}$\\pi\\right) = \\sin\\theta,\\n\\sin\\left(\\theta + $\\frac{3}{2}$\\pi\\right) = -\\cos\\theta\\text{이므로} \\newline Q(\\sin\\theta,\\n-\\cos\\theta) \\newline \\overline{PS} = \\overline{QR} = \\cos\\theta\\text{이므로} \\newline R(\\sin\\theta - \\cos\\theta,\\n-\\cos\\theta) \\newline $\\therefore$ f(\\theta) = \\sin\\theta - \\cos\\theta,\\n\\ g(\\theta) = -\\cos\\theta \\newline S(\\theta) = \\cos\\theta(\\sin\\theta + \\cos\\theta)\\text{이므로} \\newline f(\\theta)g(\\theta) + S(\\theta) = 1\\text{에서} \\newline (\\sin\\theta - \\cos\\theta)(-\\cos\\theta) + \\cos\\theta(\\sin\\theta + \\cos\\theta) \\newline = 2\\cos^2\\theta = 1 \\newline \\cos\\theta = \\frac{$\\sqrt{2}$}{2},\\n\\ \\theta = $\\frac{\\pi}{4}$ \\left(\\because 0 < \\theta < $\\frac{\\pi}{2}$\\right) \\newline $\\therefore$ \\tan\\theta = \\tan$\\frac{\\pi}{4}$ = 1',
  '$\\cos\\left(\\theta + \\frac{3}{2}\\pi\\right) = \\sin\\theta, \\sin\\left(\\theta + \\frac{3}{2}\\pi\\right) = -\\cos\\theta$이므로 $Q(\\sin\\theta, -\\cos\\theta)$ \\n$\\overline{PS} = \\overline{QR} = \\cos\\theta$이므로 $R(\\sin\\theta - \\cos\\theta, -\\cos\\theta)$ \\n$\\therefore f(\\theta) = \\sin\\theta - \\cos\\theta, g(\\theta) = -\\cos\\theta$ \\n$S(\\theta) = \\cos\\theta(\\sin\\theta + \\cos\\theta)$이므로 $f(\\theta)g(\\theta) + S(\\theta) = 1$에서 \\n$(\\sin\\theta - \\cos\\theta)(-\\cos\\theta) + \\cos\\theta(\\sin\\theta + \\cos\\theta) = 2\\cos^2\\theta = 1$ \\n$\\cos\\theta = \\frac{\\sqrt{2}}{2}, \\theta = \\frac{\\pi}{4} (\\because 0 < \\theta < \\frac{\\pi}{2})$ \\n$\\therefore \\tan\\theta = \\tan\\frac{\\pi}{4} = 1$'
);

// 8. 삼각함수그래프3단계/060
applyPatch('삼각함수그래프3단계/060',
  'cos\\left(\\theta + $\\frac{\\pi}{2}$\\right) = -\\sin\\theta,\\n\\sin\\left(\\theta + $\\frac{\\pi}{2}$\\right) = \\cos\\theta\\text{이므로} \\newline Q(-\\sin\\theta,\\n\\cos\\theta) \\newline \\overline{PS} = \\overline{QR} = \\sin\\theta\\text{이므로 } R(-\\sin\\theta,\\n\\cos\\theta - \\sin\\theta) \\newline $\\therefore$ f(\\theta) = -\\sin\\theta,\\n\\ g(\\theta) = \\cos\\theta - \\sin\\theta \\newline S(\\theta) = \\sin\\theta(\\sin\\theta + \\cos\\theta)\\text{이므로} \\newline $\\frac{S(\\theta)}{f(\\theta)g(\\theta)}$ = -4\\text{에서} \\newline $\\frac{\\sin\\theta(\\sin\\theta + \\cos\\theta)}{-\\sin\\theta(\\cos\\theta - \\sin\\theta)}$ = $\\frac{-\\sin\\theta + \\cos\\theta}{\\cos\\theta - \\sin\\theta}$ = -4 \\newline 4\\cos\\theta - 4\\sin\\theta = \\sin\\theta + \\cos\\theta,\\n\\ 3\\cos\\theta = 5\\sin\\theta \\newline $\\therefore$ \\tan\\theta = $\\frac{3}{5}$ \\newline \\text{정답 ②}',
  '$\\cos\\left(\\theta + \\frac{\\pi}{2}\\right) = -\\sin\\theta, \\sin\\left(\\theta + \\frac{\\pi}{2}\\right) = \\cos\\theta$이므로 $Q(-\\sin\\theta, \\cos\\theta)$ \\n$\\overline{PS} = \\overline{QR} = \\sin\\theta$이므로 $R(-\\sin\\theta, \\cos\\theta - \\sin\\theta)$ \\n$\\therefore f(\\theta) = -\\sin\\theta, g(\\theta) = \\cos\\theta - \\sin\\theta$ \\n$S(\\theta) = \\sin\\theta(\\sin\\theta + \\cos\\theta)$이므로 $\\frac{S(\\theta)}{f(\\theta)g(\\theta)} = -4$에서 \\n$\\frac{\\sin\\theta(\\sin\\theta + \\cos\\theta)}{-\\sin\\theta(\\cos\\theta - \\sin\\theta)} = \\frac{-\\sin\\theta + \\cos\\theta}{\\cos\\theta - \\sin\\theta} = -4$ \\n$4\\cos\\theta - 4\\sin\\theta = \\sin\\theta + \\cos\\theta, 3\\cos\\theta = 5\\sin\\theta$ \\n$\\therefore \\tan\\theta = \\frac{3}{5}$ \\n정답 ②'
);

// 9. 지수로그함수4단계/045
applyPatch('지수로그함수4단계/045',
  '함수 $y = \\log_2 x$의 그래프 위에 서로 다른 두 점 $A$, $B$가 있다. 선분 $AB$의 중점이 $x$축 위에 있고, 선분 $AB$를 $1 : 2$로 외분하는 점이 $y$축 위에 있을 때, 선분 $AB$의 길이는? ① 1 ② \\frac{$\\sqrt{6}$}{2} ③ $\\sqrt{2}$ ④ \\frac{$\\sqrt{10}$}{2} ⑤ $\\sqrt{3}$',
  '함수 $y = \\log_2 x$의 그래프 위에 서로 다른 두 점 $A, B$가 있다. 선분 $AB$의 중점이 $x$축 위에 있고, 선분 $AB$를 $1 : 2$로 외분하는 점이 $y$축 위에 있을 때, 선분 $AB$의 길이는? ① $1$ ② $\\frac{\\sqrt{6}}{2}$ ③ $\\sqrt{2}$ ④ $\\frac{\\sqrt{10}}{2}$ ⑤ $\\sqrt{3}$'
);

// 10. 삼각함수그래프/021
applyPatch('삼각함수그래프/021',
  '3\\sin^2\\left(\\theta + $\\frac{2}{3}$\\pi\\right) = 8\\sin\\left(\\theta + $\\frac{\\pi}{6}$\\right)일 때, \\cos\\left(\\theta - $\\frac{\\pi}{3}$\\right)의 값은? ① $\\frac{1}{6}$ ② $\\frac{1}{5}$ ③ $\\frac{1}{4}$ ④ $\\frac{1}{3}$ ⑤ $\\frac{1}{2}$',
  '$3\\sin^2\\left(\\theta + \\frac{2}{3}\\pi\\right) = 8\\sin\\left(\\theta + \\frac{\\pi}{6}\\right)$일 때, $\\cos\\left(\\theta - \\frac{\\pi}{3}\\right)$의 값은? ① $\\frac{1}{6}$ ② $\\frac{1}{5}$ ③ $\\frac{1}{4}$ ④ $\\frac{1}{3}$ ⑤ $\\frac{1}{2}$'
);

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Manual patches applied: ${fixedCount}`);
