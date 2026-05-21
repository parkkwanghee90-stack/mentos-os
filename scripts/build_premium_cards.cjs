const fs = require('fs');

const cards = [
  // ── 1. 일차부등식 / 이차부등식 ──
  {
    id: "lin_ineq_01", unit: "일차부등식", title: "부등식의 기본 성질",
    content: "### 부등식의 성질\n$a < b$ 일 때,\n\n1. 양면에 같은 수를 더하거나 빼도 부등호 방향은 **그대로**:\n   $$a+c < b+c, \\quad a-c < b-c$$\n2. 양수를 곱하거나 나누면 부등호 방향은 **그대로** ($c>0$):\n   $$ac < bc, \\quad \\frac{a}{c} < \\frac{b}{c}$$\n3. **음수**를 곱하거나 나누면 부등호 방향이 **바뀜** ($c<0$):\n   $$ac > bc, \\quad \\frac{a}{c} > \\frac{b}{c}$$"
  },
  {
    id: "lin_ineq_02", unit: "일차부등식", title: "절댓값을 포함한 일차부등식",
    content: "### 절댓값 기호가 있는 부등식\n$a > 0$ 일 때,\n\n1. $|x| < a \\iff -a < x < a$\n2. $|x| > a \\iff x < -a \\text{ 또는 } x > a$\n\n**원리:** 절댓값 $|x-a|$는 수직선에서 $x$와 $a$ 사이의 거리를 의미합니다. 따라서 구하고자 하는 기준 거리를 기점으로 영역을 쪼갭니다."
  },
  {
    id: "quad_ineq_01", unit: "이차부등식", title: "이차함수와 이차부등식의 관계",
    content: "### 그래프를 이용한 해석 ($a > 0$ 기준)\n이차방정식 $ax^2 + bx + c = 0$ 의 두 근이 $\\alpha, \\beta$ $(\\alpha < \\beta)$ 일 때:\n\n1. $ax^2 + bx + c > 0$ \n   $\\implies$ 그래프가 $x$축 위쪽인 범위: $x < \\alpha$ 또는 $x > \\beta$\n2. $ax^2 + bx + c < 0$ \n   $\\implies$ 그래프가 $x$축 아래쪽인 범위: $\\alpha < x < \\beta$\n\n최고차항 계수를 무조건 양수로 맞춘 후 가장자리와 샛값으로 해석하면 편리합니다."
  },
  {
    id: "quad_ineq_02", unit: "이차부등식", title: "절대부등식 (항상 성립할 조건)",
    content: "모든 실수 $x$에 대하여 이차부등식이 항상 성립하려면 판별식 $D$를 사용합니다.\n\n### $ax^2 + bx + c > 0$ 이 항상 참일 조건\n항상 $x$축보다 완전히 위로 붕 떠 있어야 하므로:\n1. 위로 열린 형태(아래로 볼록): $a > 0$\n2. $x$축과 교점이 없음 (허근): $D = b^2 - 4ac < 0$"
  },

  // ── 2. 점과 좌표 / 직선의 방정식 / 원의 방정식 / 도형의 이동 ──
  {
    id: "geom_pt_01", unit: "점과좌표", title: "두 점 사이의 거리와 내분·외분",
    content: "### 1. 두 점 사이의 거리\n두 점 $A(x_1, y_1), B(x_2, y_2)$ 에 대하여:\n$$AB = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$\n\n### 2. 내분점과 외분점\n선분 $AB$를 $m:n$ 으로 내분(+), 외분(-) 하는 점:\n$$P\\left( \\frac{mx_2 \\pm nx_1}{m \\pm n}, \\frac{my_2 \\pm ny_1}{m \\pm n} \\right)$$\n(단, 외분점 분모는 $m-n \\neq 0$)"
  },
  {
    id: "geom_line_01", unit: "직선의방정식", title: "다양한 직선의 방정식 형태",
    content: "### 기울기 $m$과 한 점 $(x_1, y_1)$\n$$y - y_1 = m(x - x_1)$$\n\n### 두 점을 지나는 직선\n$$y - y_1 = \\frac{y_2 - y_1}{x_2 - x_1}(x - x_1)$$\n\n### $x$절편 $a$, $y$절편 $b$\n$$\\frac{x}{a} + \\frac{y}{b} = 1$$"
  },
  {
    id: "geom_line_02", unit: "직선의방정식", title: "점과 직선 사이의 거리",
    content: "### 점과 직선 사이의 거리 극비 공식\n점 $(x_1, y_1)$과 직선 $ax + by + c = 0$ 사이의 거리 $d$는:\n$$d = \\frac{|a x_1 + b y_1 + c|}{\\sqrt{a^2 + b^2}}$$\n\n**활용 포인트:** 원의 접선을 구하거나, 삼각형의 높이를 찾을 때 가장 강력하게 쓰입니다."
  },
  {
    id: "geom_circle_01", unit: "원의방정식", title: "원의 방정식의 기본형과 표준형",
    content: "### 중심이 $(a, b)$이고 반지름이 $r$인 원\n$$(x-a)^2 + (y-b)^2 = r^2$$\n이 표준형을 전개하면 일반형이 됩니다:\n$$x^2 + y^2 + Ax + By + C = 0$$\n\n상수항과 일차항 계수를 통해 일반형을 다시 완전제곱식으로 묶으면 원의 중심과 반지름을 찾을 수 있습니다."
  },
  {
    id: "geom_circle_02", unit: "원의방정식", title: "원과 직선의 위치 관계",
    content: "원의 중심과 직선 사이의 거리를 $d$, 반지름을 $r$ 이라 할 때:\n\n1. $d < r$ : **두 점**에서 만난다. (원점 돌파)\n2. $d = r$ : **한 점**에서 만난다. (접한다)\n3. $d > r$ : **만나지 않는다.**\n\n판별식 $D$를 쓰는 것보다 점과 직선 사이의 거리 $d$ 공식을 쓰는 것이 압도적으로 계산이 짧습니다."
  },
  {
    id: "geom_move_01", unit: "도형의이동", title: "평행이동과 대칭이동",
    content: "### 평행이동\n$x$축으로 $p$, $y$축으로 $q$만큼 이동:\n- **점**: $(x, y) \\to (x+p, y+q)$\n- **도형**: $f(x, y)=0 \\to f(x-p, y-q)=0$\n\n### 대칭이동\n- $x$축 대칭 $\\implies (x, -y)$\n- $y$축 대칭 $\\implies (-x, y)$\n- 원점 대칭 $\\implies (-x, -y)$\n- $y=x$ 대칭 $\\implies (y, x)$ (역함수의 원리)"
  },

  // ── 3. 대수 - 삼각함수의 활용 ──
  {
    id: "trig_app_01", unit: "삼각함수의 활용", title: "사인법칙 (Sine Rule)",
    content: "### 사인법칙 공식\n삼각형 $ABC$의 세 변의 길이 $a, b, c$와 외접원의 반지름 $R$에 대하여:\n$$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R$$\n\n**사용 조건 파악이 생명!**\n1. 외접원의 반지름 $R$이 주어지거나 구할 때\n2. 마주보는 한 변과 한 각의 세트를 알 때\n3. 변의 길이의 비는 곧 사인값의 비: $a : b : c = \\sin A : \\sin B : \\sin C$"
  },
  {
    id: "trig_app_01_proof", unit: "삼각함수의 활용", title: "[증명] 사인법칙 유도",
    content: "### 사인법칙의 원리 유도\n외접원이 주어졌을 때 원주각의 성질을 이용합니다.\n\n1. 삼각형 $ABC$의 외접원 중심을 $O$라 하고, 점 $B$에서 지름을 긋고 만나는 점을 $A'$라 합시다.\n2. 지름에 대한 원주각은 $90^\\circ$ 이므로 $\\angle BCA' = 90^\\circ$ 가 됩니다.\n3. 또한 같은 호 $BC$에 대한 원주각은 같으므로 $\\angle A = \\angle A'$ 입니다.\n4. 직각삼각형 $A'BC$에서, 빗변 $A'B$는 지름이므로 길이 $2R$을 가집니다.\n5. 따라서 직각삼각형의 삼각비에 의해 $\\sin A' = \\frac{a}{2R}$ 입니다.\n6. $\\angle A = \\angle A'$ 를 대입하면 $\\sin A = \\frac{a}{2R}$ 이 성립합니다. 이를 정리하면 $2R = \\frac{a}{\\sin A}$ 가 됩니다."
  },
  {
    id: "trig_app_02", unit: "삼각함수의 활용", title: "코사인법칙 (Cosine Rule)",
    content: "### 코사인법칙 공식\n두 변과 그 끼인각을 알 때, 반대쪽 변의 길이를 구하는 공식:\n$$a^2 = b^2 + c^2 - 2bc \\cos A$$\n\n이를 각에 대해 정리하면 (각 변형 공식):\n$$\\cos A = \\frac{b^2 + c^2 - a^2}{2bc}$$\n\n**언제 쓰나요?**\n세 변의 길이를 모두 알 때 (SSS) 각도를 구하거나, 두 변과 유일한 끼인각을 알 때 (SAS) 유용합니다."
  },
  {
    id: "trig_app_02_proof", unit: "삼각함수의 활용", title: "[증명] 코사인법칙 유도",
    content: "### 코사인법칙의 원리 유도\n점 $A$에서 선분 $BC$에 내린 수선의 발을 $H$라 합시다. (각 $B$가 예각인 경우)\n\n1. 직각삼각형 $ABH$에서:\n   선분 $AH = c \\sin B$, 선분 $BH = c \\cos B$\n2. 선분 $HC$의 길이는 $a - c \\cos B$ 가 됩니다.\n3. 직각삼각형 $AHC$에서 피타고라스의 정리를 적용합니다:\n   $$b^2 = AH^2 + HC^2$$\n4. 변의 길이를 대입하면:\n   $$b^2 = (c \\sin B)^2 + (a - c \\cos B)^2$$\n5. 전개합니다:\n   $$b^2 = c^2 \\sin^2 B + a^2 - 2ac \\cos B + c^2 \\cos^2 B$$\n6. $c^2 (\\sin^2 B + \\cos^2 B)$ 부분은 1이 되므로 $c^2$ 만 남습니다.\n7. 결과적으로 $b^2 = a^2 + c^2 - 2ac \\cos B$ 가 성립합니다."
  },
  {
    id: "trig_app_03", unit: "삼각함수의 활용", title: "삼각형의 넓이 공식",
    content: "### 삼각형의 넓이 ($S$)\n\n두 변의 길이 $a, b$와 그 끼인각 $C$를 알 때:\n$$S = \\frac{1}{2}ab \\sin C$$\n\n**다양한 삼각형 넓이 확장 공식:**\n1. 외접원의 반지름 $R$을 알 때: $S = \\frac{abc}{4R}$\n2. 내접원의 반지름 $r$을 알 때: $S = \\frac{1}{2}r(a+b+c)$\n3. 헤론의 공식 (세 변의 길이 $a, b, c$를 모두 알 때):\n   $s = \\frac{a+b+c}{2}$ 이라 하면, $$S = \\sqrt{s(s-a)(s-b)(s-c)}$$"
  },
  {
    id: "trig_app_03_proof", unit: "삼각함수의 활용", title: "[증명] 삼각형 넓이 공식 유도",
    content: "### 넓이 공식 $S = \\frac{1}{2}ab \\sin C$ 의 유도\n\n1. 일반적인 삼각형의 넓이는 밑변 $\\times$ 높이 $\\div 2$ 입니다.\n   $$S = \\frac{1}{2} a \\times h$$\n2. 꼭짓점 $A$에서 밑변 $BC$(길이 $a$)에 내린 수선의 발을 $H$라 하면, 높이는 $h = AH$ 가 됩니다.\n3. 직각삼각형 $AHC$를 살펴보면, 각 $C$를 기준으로 높이 $h$는 다음과 같이 표현됩니다.\n   $$\\sin C = \\frac{h}{b} \\implies h = b \\sin C$$\n4. 이를 1번의 기본 넓이 공식에 대입하면 최종 공식이 유도됩니다.\n   $$S = \\frac{1}{2} a (b \\sin C) = \\frac{1}{2}ab \\sin C$$"
  },

  // ── 4. 등차, 등비 수열 / 시그마 / 점화식 / 수학적 귀납법 ──
  {
    id: "seq_arith_01", unit: "수열", title: "등차수열 (Arithmetic Sequence)",
    content: "일정한 차이($d$, 공차)가 유지되는 수열.\n\n### 1. 일반항\n$$a_n = a_1 + (n-1)d$$\n등차수열의 일반항은 $n$에 대한 **일차식**이며, 공차가 일차항의 기울기가 됩니다.\n\n### 2. 등차중항\n연속된 세 항 $a, b, c$ 가 등차수열을 이룰 때:\n$$b = \\frac{a+c}{2}$$\n\n### 3. 합 공식\n$$S_n = \\frac{n(2a + (n-1)d)}{2} = \\frac{n(a+l)}{2}$$"
  },
  {
    id: "seq_geo_01", unit: "수열", title: "등비수열 (Geometric Sequence)",
    content: "일정한 비율($r$, 공비)이 유지되는 수열.\n\n### 1. 일반항\n$$a_n = a_1 \\cdot r^{n-1}$$\n등비수열의 일반항은 지수함수 형태로 나타납니다.\n\n### 2. 등비중항 ($a, b, c$ 가 등비수열일 때)\n$$b^2 = ac \\quad (b = \\pm \\sqrt{ac})$$\n\n### 3. 합 공식 ($r \\neq 1$)\n$$S_n = \\frac{a_1(r^n - 1)}{r - 1} = \\frac{a_1(1 - r^n)}{1 - r}$$"
  },
  {
    id: "seq_sigma_01", unit: "수열", title: "시그마(합의 기호 $\\Sigma$) 주요 공식",
    content: "### 합의 성질\n상수나 기본 덧셈은 시그마 기호 밖으로 분리가 가능합니다.\n$$\\sum_{k=1}^n (p a_k + q b_k) = p \\sum a_k + q \\sum b_k$$\n단, 곱셈이나 나눗셈은 시그마를 분배할 수 없습니다!\n\n### 거듭제곱의 합 공식\n1. $\\sum_{k=1}^n k = \\frac{n(n+1)}{2}$\n2. $\\sum_{k=1}^n k^2 = \\frac{n(n+1)(2n+1)}{6}$\n3. $\\sum_{k=1}^n k^3 = \\left\\{ \\frac{n(n+1)}{2} \\right\\}^2$"
  },
  {
    id: "seq_frac_01", unit: "수열", title: "부분분수를 활용한 소거법",
    content: "수열의 합 $\\Sigma$ 계산 시, 분모가 두 식의 곱으로 주어지면 **부분분수 분해**를 통해 연쇄 소거를 만듭니다.\n\n### 부분분수 공식\n$$\\frac{1}{A B} = \\frac{1}{B - A} \\left( \\frac{1}{A} - \\frac{1}{B} \\right)$$\n(단, $B > A$ 로 두어 분모 차이가 양수가 되게 하는 것이 좋습니다.)\n\n연쇄적으로 이웃한 항들이 사라지며 보통 맨 앞과 맨 뒤의 항들만 살아남게 됩니다."
  },
  {
    id: "seq_recur_01", unit: "수열", title: "수열의 귀납적 정의 (점화식)",
    content: "수열을 일반항 $a_n$ 이 아니라, 첫째항과 **이웃하는 항들 사이의 관계식(점화식)** 으로 정의하는 방법입니다.\n\n### 매우 자주 나오는 기본 꼴\n1. $a_{n+1} - a_n = d$ $\\implies$ 공차가 $d$인 등차수열\n2. $a_{n+1} \\div a_n = r$ $\\implies$ 공비가 $r$인 등비수열\n3. $2a_{n+1} = a_n + a_{n+2}$ $\\implies$ 등차중항 (등차수열)\n4. $a_{n+1}^2 = a_n \\cdot a_{n+2}$ $\\implies$ 등비중항 (등비수열)\n\n어려운 점화식은 $n=1, 2, 3\\dots$ 을 차례로 직접 대입하여 규칙을 발견(나열)하는 것이 수능 핵심 스킬입니다."
  },
  {
    id: "induct_01", unit: "수학적귀납법", title: "수학적 귀납법 (Mathematical Induction)",
    content: "모든 자연수 $n$ 에 대하여 어떤 명제 $P(n)$ 이 성립함을 증명하는 가장 완벽한 연쇄 논리입니다.\n\n### 증명 2단계 구조\n1. **초기 조건 (Base Case):**\n   $n = 1$ 일 때, 명제 $P(1)$ 이 성립함을 직접 보여준다.\n2. **연쇄 작용 (Inductive Step):**\n   $n = k$ 일 때 명제 $P(k)$ 가 성립한다고 **가정**하고,\n   이를 바탕으로 $n = k+1$ 일 때도 명제 $P(k+1)$ 이 성립함을 수학적 수식으로 유도하여 증명한다.\n\nDOMINO 이론: 1번 도미노가 쓰러지면 $k$번째가 $k+1$번째를 계속 쓰러뜨리는 원리입니다."
  }
];

fs.writeFileSync('C:\\\\mentos_os_clean\\\\public\\\\concept_cards\\\\dynamic_concepts.json', JSON.stringify(cards, null, 2), 'utf8');
console.log('Successfully wrote strict, top-tier math concept cards with PROOFS.');
