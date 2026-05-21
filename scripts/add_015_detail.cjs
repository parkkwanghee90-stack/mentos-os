const fs = require('fs');
const path = require('path');

const file15 = 'public/math_hints/CSAT_2024_6월_미적분/015.json';

const detail15 = {
  "problem_id": "015",
  "unit": "CSAT_2024_6월_미적분",
  "title": "2024학년도 6월 모의평가 15번",
  "type": "algebra",
  "P": "함수 $g(x)$의 정적분 조건 (나)를 심층 분석하여 상수 $k$의 값을 확정하고, $g(x)$의 증가 및 미분가능성 (가) 조건을 이용해 $f(x)$를 추론하는 문제입니다.",
  "C": "$g(x) = \\begin{cases} 2x-k & (x \\le k) \\\\ f(x) & (x > k) \\end{cases}$ 입니다. $P(t) = |t(t-1)|+t(t-1)$ 와 $Q(t) = |(t-1)(t+2)|-(t-1)(t+2)$ 의 부호 변화를 관찰해야 합니다.",
  "B": "적분 $\\int_a^x h(t)dt \\ge 0$ 이 모든 $x$에 대해 성립하려면, $x=a$ 에서 최솟값 $0$을 가지거나 특정 구간에서 피적분함수의 부호가 강제됩니다. \n\n1. $P(t) = 0 \\; (0<t<1)$, $P(t) > 0 \\; (t<0, t>1)$\n2. $Q(t) = 0 \\; (t<-2, t>1)$, $Q(t) > 0 \\; (-2<t<1)$",
  "S1": "**[Step 1] 첫 번째 적분 조건 분석**\n$\\int_0^x g(t)P(t)dt \\ge 0$ 에서 $x>1$ 일 때, $P(t)>0$ 이므로 $g(t) \\ge 0$ 이어야 적분값이 감소하지 않고 양수를 유지합니다. 따라서 $g(1) \\ge 0$ 입니다.\n또한 $x<0$ 일 때, $\\int_0^x = -\\int_x^0 \\ge 0 \\implies \\int_x^0 g(t)P(t)dt \\le 0$ 입니다. $P(t)>0$ 이므로 $g(t) \\le 0$ 이어야 합니다.",
  "S2": "**[Step 2] 두 번째 적분 조건 분석 및 $k$값 확정**\n$\\int_3^x g(t)Q(t)dt \\ge 0$ 에서 $x<1$ 일 때, $\\int_3^1 = 0$ 이므로 $\\int_1^x = -\\int_x^1 \\ge 0 \\implies \\int_x^1 g(t)Q(t)dt \\le 0$ 입니다.\n구간 $(-2, 1)$에서 $Q(t)>0$ 이므로, 이 구간에서 $g(t) \\le 0$ 이어야 합니다. 따라서 $g(1) \\le 0$ 입니다.\nStep 1과 종합하면 **$g(1) = 0$** 이 강제됩니다. \n만약 $k<1$ 이라면 $g(1)=f(1)=0$, $g(k)=k$ 인데 $g$는 증가함수이므로 $g(k) \\le g(1) \\implies k \\le 0$. 하지만 문제에서 $k \\ge 0$ 이라 했고, $k=0$ 이면 $f(x)=0 (0 \\le x \\le 1)$ 이 되어 삼차함수 모순이 생깁니다. 따라서 $k \\ge 1$ 이고, $g(1) = 2(1)-k = 0 \\implies \\mathbf{k=2}$ 입니다.",
  "S3": "**[Step 3] $f(x)$ 식 세우기 및 조건 적용**\n$k=2$ 이므로 $x=2$ 에서 $g(x)$가 미분가능하려면 $f(2) = g(2) = 2$, $f'(2) = g'(2) = 2$ 이어야 합니다.\n최고차항 계수가 1인 삼차함수이므로, $f(x) = (x-2)^3 + p(x-2)^2 + 2(x-2) + 2$ 로 둘 수 있습니다.\n$g(x)$가 증가함수이므로 $x>2$ 에서 $f'(x) = 3(x-2)^2 + 2p(x-2) + 2 \\ge 0$ 이어야 합니다.",
  "S4": "**[Step 4] 판별식과 최솟값 계산**\n$X = x-2 > 0$ 이라 하면 $3X^2 + 2pX + 2 \\ge 0$ 이 $X>0$ 에서 항상 성립해야 합니다.\n$p < 0$ 일 때 대칭축이 양수이므로 판별식 $D/4 = p^2 - 6 \\le 0$ 이어야 합니다. 즉, $-\\sqrt{6} \\le p \\le \\sqrt{6}$ 이며 최솟값은 $p = -\\sqrt{6}$ 입니다.\n구하고자 하는 값은 $g(k+1) = g(3) = f(3)$ 이고, $f(3) = (1)^3 + p(1)^2 + 2(1) + 2 = p + 5$ 입니다.\n따라서 $f(3)$ 의 최솟값은 $\\mathbf{5 - \\sqrt{6}}$ 입니다.",
  "A": "상세한 논증을 통해 도출된 $g(3)$의 최솟값은 $5 - \\sqrt{6}$ 이며, 정답은 2번입니다."
};

fs.writeFileSync(file15, JSON.stringify(detail15, null, 2));

// 확통 15번(공통 15번)도 혹시 모르니 똑같이 덮어씀. 공통과목이므로 동일.
const file15_stats = 'public/math_hints/CSAT_2024_6월_확통/015.json';
if (fs.existsSync(file15_stats)) {
    fs.writeFileSync(file15_stats, JSON.stringify(detail15, null, 2));
}

console.log("Updated 015.json with detailed logic");
