/**
 * AVS 통합숙제 JSON 자동 생성 스크립트
 * 
 * PCBSA 구조:
 *   P - Problem: 문제 핵심 요약
 *   C - Concept: 해설 접근법/조건 분석
 *   B - Background: 단원별 핵심 공식 (KaTeX)
 *   S - Solution: 풀이 흐름 + 해설 이미지
 *   A - Answer: 최종 정답
 * 
 * 입력: homeworkSSOT.js + avs_answers.json + 해설 이미지
 * 출력: public/math_hints/{hintKey}/001.json ~ {N}.json
 */

const fs = require('fs');
const path = require('path');

// ── avs_answers.json 로드 ──
const avsAnswers = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/avs_answers.json'), 'utf8'));

// ── 단원별 PCBSA 템플릿 ──
const UNIT_TEMPLATES = {

  // ═══════════════════════════════════════
  //  수학1 (10개 단원)
  // ═══════════════════════════════════════
  '수학1_01지수_통합숙제': {
    type: 'algebra',
    P: '지수 법칙과 거듭제곱근의 성질을 활용하여 주어진 식을 간단히 정리하고, 미지수의 값을 구합니다.',
    C: '밑과 지수를 통일하고, 지수 법칙을 적용하여 식을 변환합니다.',
    B: '지수 법칙과 거듭제곱근의 성질:\n\n1) $$a^m \\cdot a^n = a^{m+n}$$, $$\\frac{a^m}{a^n} = a^{m-n}$$, $$(a^m)^n = a^{mn}$$\n2) $$a^{\\frac{m}{n}} = \\sqrt[n]{a^m}$$, $$\\sqrt[n]{a} \\cdot \\sqrt[n]{b} = \\sqrt[n]{ab}$$\n3) $$a^0 = 1$$, $$a^{-n} = \\frac{1}{a^n}$$',
  },
  '수학1_02로그_통합숙제': {
    type: 'algebra',
    P: '로그의 정의와 성질을 활용하여 주어진 식의 값을 구합니다.',
    C: '로그의 밑 변환 공식과 성질을 적용하여 식을 정리합니다.',
    B: '로그의 성질:\n\n1) $$\\log_a b = c \\iff a^c = b$$\n2) $$\\log_a MN = \\log_a M + \\log_a N$$\n3) $$\\log_a \\frac{M}{N} = \\log_a M - \\log_a N$$\n4) $$\\log_a M^k = k\\log_a M$$\n5) 밑 변환: $$\\log_a b = \\frac{\\log_c b}{\\log_c a}$$\n6) $$\\log_a b \\cdot \\log_b c = \\log_a c$$',
  },
  '수학1_03지수로그함수_통합숙제': {
    type: 'algebra',
    P: '지수함수와 로그함수의 그래프 성질을 이용하여 함수값, 교점, 대칭 관계를 분석합니다.',
    C: '지수함수와 로그함수는 역함수 관계이며, 그래프의 점근선과 정의역에 주의합니다.',
    B: '지수함수·로그함수의 성질:\n\n1) $$y = a^x$$ ($$a>0, a\\neq1$$): 정의역 실수 전체, 치역 $$y>0$$\n2) $$y = \\log_a x$$: 정의역 $$x>0$$, 치역 실수 전체\n3) $$y = a^x$$와 $$y = \\log_a x$$는 $$y = x$$에 대해 대칭\n4) $$a > 1$$이면 증가, $$0 < a < 1$$이면 감소',
  },
  '수학1_04지수로그함수활용_통합숙제': {
    type: 'algebra',
    P: '지수·로그 방정식과 부등식을 풀고, 실생활 문제에 적용합니다.',
    C: '양변에 로그 또는 지수를 취하여 미지수를 분리하고, 진수 조건을 확인합니다.',
    B: '지수·로그 방정식/부등식:\n\n1) $$a^{f(x)} = a^{g(x)} \\iff f(x) = g(x)$$\n2) $$\\log_a f(x) = \\log_a g(x) \\iff f(x) = g(x)$$ (단, $$f(x) > 0, g(x) > 0$$)\n3) $$a > 1$$일 때 $$\\log_a f(x) > \\log_a g(x) \\iff f(x) > g(x) > 0$$\n4) $$0 < a < 1$$일 때 부등호 방향 반대',
  },
  '수학1_05삼각함수정의_통합숙제': {
    type: 'trigonometry',
    P: '호도법과 삼각함수의 정의를 이용하여 삼각함수값을 구합니다.',
    C: '단위원 위의 점 좌표와 삼각함수의 관계를 활용합니다.',
    B: '삼각함수의 정의:\n\n1) 호도법: $$180° = \\pi$$ (rad), 부채꼴 호의 길이 $$l = r\\theta$$, 넓이 $$S = \\frac{1}{2}r^2\\theta$$\n2) 단위원: $$P(\\cos\\theta, \\sin\\theta)$$\n3) $$\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$$\n4) $$\\sin^2\\theta + \\cos^2\\theta = 1$$',
  },
  '수학1_06삼각함수그래프_통합숙제': {
    type: 'trigonometry',
    P: '삼각함수의 그래프 변환(주기, 진폭, 위상)을 분석합니다.',
    C: '기본 그래프에서 평행이동, 대칭, 주기 변환을 단계적으로 적용합니다.',
    B: '삼각함수 그래프:\n\n1) $$y = a\\sin(bx + c) + d$$: 진폭 $$|a|$$, 주기 $$\\frac{2\\pi}{|b|}$$, 위상 $$-\\frac{c}{b}$$, 수직이동 $$d$$\n2) $$\\sin$$의 주기: $$2\\pi$$, $$\\tan$$의 주기: $$\\pi$$\n3) $$\\sin(-\\theta) = -\\sin\\theta$$ (기함수), $$\\cos(-\\theta) = \\cos\\theta$$ (우함수)',
  },
  '수학1_07삼각함수활용_통합숙제': {
    type: 'trigonometry',
    P: '삼각함수의 덧셈정리, 배각·반각 공식을 활용하여 값을 구합니다.',
    C: '사인·코사인 법칙과 삼각형의 넓이 공식을 적용합니다.',
    B: '삼각함수 활용:\n\n1) 사인법칙: $$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R$$\n2) 코사인법칙: $$a^2 = b^2 + c^2 - 2bc\\cos A$$\n3) 삼각형 넓이: $$S = \\frac{1}{2}ab\\sin C$$\n4) 덧셈정리: $$\\sin(\\alpha \\pm \\beta) = \\sin\\alpha\\cos\\beta \\pm \\cos\\alpha\\sin\\beta$$',
  },
  '수학1_08등차등비수열_통합숙제': {
    type: 'algebra',
    P: '등차수열·등비수열의 일반항과 합 공식을 활용하여 미지수를 구합니다.',
    C: '공차(공비)를 구하고, 일반항 및 급수 공식을 적용합니다.',
    B: '등차·등비수열:\n\n1) 등차: $$a_n = a_1 + (n-1)d$$, $$S_n = \\frac{n(a_1 + a_n)}{2}$$\n2) 등비: $$a_n = a_1 \\cdot r^{n-1}$$, $$S_n = \\frac{a_1(r^n - 1)}{r - 1}$$ ($$r \\neq 1$$)\n3) 등차중항: $$2b = a + c$$, 등비중항: $$b^2 = ac$$',
  },
  '수학1_09수열의합_통합숙제': {
    type: 'algebra',
    P: '시그마($$\\Sigma$$) 기호의 성질과 여러 가지 수열의 합 공식을 활용합니다.',
    C: '부분분수 분해, 군수열, 계차수열 등의 기법을 적용합니다.',
    B: '수열의 합:\n\n1) $$\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}$$\n2) $$\\sum_{k=1}^{n} k^2 = \\frac{n(n+1)(2n+1)}{6}$$\n3) $$\\sum_{k=1}^{n} k^3 = \\left\\{\\frac{n(n+1)}{2}\\right\\}^2$$\n4) $$a_n = S_n - S_{n-1}$$ ($$n \\geq 2$$)',
  },
  '수학1_10수학적귀납법_통합숙제': {
    type: 'algebra',
    P: '수학적 귀납법의 원리를 이용하여 명제를 증명하고, 귀납적으로 정의된 수열을 분석합니다.',
    C: '$$n = 1$$일 때 성립 확인 후, $$n = k$$ 가정 → $$n = k+1$$ 증명 과정을 전개합니다.',
    B: '수학적 귀납법:\n\n1) [기초] $$n = 1$$일 때 명제 성립 확인\n2) [귀납] $$n = k$$일 때 성립 가정 → $$n = k+1$$일 때 성립 증명\n3) 점화식: $$a_{n+1} = f(a_n)$$ 형태의 귀납적 정의\n4) 여러 가지 점화식: $$a_{n+1} = pa_n + q$$, $$a_{n+1} = pa_n + f(n)$$',
  },

  // ═══════════════════════════════════════
  //  수학2 (7개 단원)
  // ═══════════════════════════════════════
  '수학2_01함수의극한_통합숙제': {
    type: 'calculus',
    P: '함수의 극한값을 구하고, 극한의 성질을 활용하여 미지수를 결정합니다.',
    C: '$$0/0$$ 꼴 부정형을 인수분해·유리화로 해소하고, 좌극한·우극한을 비교합니다.',
    B: '함수의 극한:\n\n1) $$\\lim_{x \\to a} f(x) = L$$ ⟺ $$\\lim_{x \\to a^-} f(x) = \\lim_{x \\to a^+} f(x) = L$$\n2) $$\\lim_{x \\to a} \\frac{f(x)}{g(x)}$$: $$0/0$$ 꼴 → 인수분해 또는 유리화\n3) $$\\lim_{x \\to \\infty} \\frac{a_n x^n + \\cdots}{b_m x^m + \\cdots}$$: 최고차항 비교',
  },
  '수학2_02함수의연속_통합숙제': {
    type: 'calculus',
    P: '함수의 연속 조건을 확인하고, 연속이 되기 위한 미지수를 결정합니다.',
    C: '연속의 3조건을 확인: ①함수값 존재 ②극한값 존재 ③함수값=극한값.',
    B: '함수의 연속:\n\n1) $$x = a$$에서 연속: $$\\lim_{x \\to a} f(x) = f(a)$$\n2) 중간값 정리: $$f(a) \\cdot f(b) < 0$$이면 $$(a, b)$$에서 근이 존재\n3) 최대·최소 정리: 닫힌 구간에서 연속 → 최댓값·최솟값 존재',
  },
  '수학2_03미분계수_통합숙제': {
    type: 'calculus',
    P: '미분계수의 정의와 도함수를 이용하여 접선의 방정식, 미분가능성을 분석합니다.',
    C: '극한을 이용한 미분계수 정의와 미분 공식을 적용합니다.',
    B: '미분계수와 도함수:\n\n1) $$f\'(a) = \\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h} = \\lim_{x \\to a} \\frac{f(x) - f(a)}{x - a}$$\n2) $$(x^n)\' = nx^{n-1}$$\n3) 접선: $$y - f(a) = f\'(a)(x - a)$$\n4) 미분가능 → 연속 (역은 성립하지 않음)',
  },
  '수학2_04도함수활용12_통합숙제': {
    type: 'calculus',
    P: '도함수를 이용하여 함수의 증가·감소, 극값을 구하고 그래프를 분석합니다.',
    C: '$$f\'(x) = 0$$의 근을 구하고, 부호 변화를 통해 극대·극소를 판별합니다.',
    B: '도함수의 활용 (증감·극값):\n\n1) $$f\'(x) > 0$$: 증가, $$f\'(x) < 0$$: 감소\n2) $$f\'(a) = 0$$이고 부호가 $$+ \\to -$$: 극대, $$- \\to +$$: 극소\n3) 삼차함수: $$f(x) = ax^3 + bx^2 + cx + d$$의 그래프 분석\n4) 최댓값·최솟값: 닫힌 구간 양 끝점과 극값 비교',
  },
  '수학2_05도함수활용3_통합숙제': {
    type: 'calculus',
    P: '방정식·부등식에 도함수를 활용하여 근의 개수, 부등식의 증명을 수행합니다.',
    C: '함수의 그래프와 직선의 교점 개수로 방정식의 실근 개수를 판별합니다.',
    B: '도함수의 활용 (방정식·부등식):\n\n1) $$f(x) = k$$의 실근 개수 = $$y = f(x)$$와 $$y = k$$의 교점 수\n2) 부등식 증명: $$g(x) = f(x) - h(x)$$로 놓고 최솟값 ≥ 0 확인\n3) 속도·가속도: $$v(t) = s\'(t)$$, $$a(t) = v\'(t) = s\'\'(t)$$',
  },
  '수학2_06부정적분정적분_통합숙제': {
    type: 'calculus',
    P: '부정적분과 정적분의 계산법을 활용하여 넓이, 적분값을 구합니다.',
    C: '역미분(부정적분) 공식과 정적분의 기본 정리를 적용합니다.',
    B: '부정적분과 정적분:\n\n1) $$\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$$ ($$n \\neq -1$$)\n2) $$\\int_a^b f(x) dx = F(b) - F(a)$$\n3) $$\\frac{d}{dx} \\int_a^x f(t) dt = f(x)$$\n4) 우함수: $$\\int_{-a}^{a} f(x)dx = 2\\int_0^a f(x)dx$$, 기함수: $$= 0$$',
  },
  '수학2_07정적분활용_통합숙제': {
    type: 'calculus',
    P: '정적분을 이용하여 곡선 사이의 넓이, 입체의 부피를 구합니다.',
    C: '두 곡선의 교점을 구하고, 위 함수-아래 함수의 차를 적분합니다.',
    B: '정적분의 활용:\n\n1) 넓이: $$S = \\int_a^b |f(x) - g(x)| dx$$\n2) $$f(x) \\geq g(x)$$일 때: $$S = \\int_a^b \\{f(x) - g(x)\\} dx$$\n3) 속도와 거리: $$\\text{거리} = \\int_{t_1}^{t_2} |v(t)| dt$$',
  },

  // ═══════════════════════════════════════
  //  미적분 (9개 단원)
  // ═══════════════════════════════════════
  '미적분_01수열의극한_통합숙제': {
    type: 'calculus',
    P: '수열의 극한값과 급수의 수렴·발산을 판별합니다.',
    C: '최고차항으로 나누기, 샌드위치 정리, 등비수열 극한 조건을 활용합니다.',
    B: '수열의 극한:\n\n1) $$\\lim_{n \\to \\infty} \\frac{a_n x^n + \\cdots}{b_m x^m + \\cdots}$$: 최고차항 비교\n2) $$|r| < 1 \\Rightarrow \\lim_{n \\to \\infty} r^n = 0$$\n3) 수렴 조건: 단조 수렴 정리, 샌드위치 정리\n4) $$\\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right)^n = e$$',
  },
  '미적분_02급수_통합숙제': {
    type: 'calculus',
    P: '무한급수의 수렴·발산을 판별하고, 등비급수 공식을 활용합니다.',
    C: '부분합 $$S_n$$을 구하고 극한을 취하거나, 수렴 조건을 확인합니다.',
    B: '무한급수:\n\n1) $$\\sum_{n=1}^{\\infty} a_n = \\lim_{n \\to \\infty} S_n$$\n2) 등비급수: $$\\sum_{n=1}^{\\infty} ar^{n-1} = \\frac{a}{1-r}$$ ($$|r| < 1$$)\n3) 수렴 필요조건: $$\\lim_{n \\to \\infty} a_n = 0$$\n4) 순환소수와 급수: $$0.\\dot{a}\\dot{b} = \\frac{ab}{99}$$',
  },
  '미적분_03지수로그함수미분_통합숙제': {
    type: 'calculus',
    P: '지수함수·로그함수의 도함수를 구하고 응용합니다.',
    C: '자연로그의 밑 $$e$$와 로그 미분법을 활용합니다.',
    B: '지수·로그함수의 미분:\n\n1) $$(e^x)\' = e^x$$, $$(a^x)\' = a^x \\ln a$$\n2) $$(\\ln x)\' = \\frac{1}{x}$$, $$(\\log_a x)\' = \\frac{1}{x \\ln a}$$\n3) $$(e^{f(x)})\' = f\'(x) e^{f(x)}$$\n4) $$\\lim_{x \\to 0} \\frac{e^x - 1}{x} = 1$$, $$\\lim_{x \\to 0} \\frac{\\ln(1+x)}{x} = 1$$',
  },
  '미적분_04삼각함수미분_통합숙제': {
    type: 'calculus',
    P: '삼각함수의 극한과 도함수를 구합니다.',
    C: '$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$ 등 기본 극한을 활용합니다.',
    B: '삼각함수의 미분:\n\n1) $$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$, $$\\lim_{x \\to 0} \\frac{\\tan x}{x} = 1$$\n2) $$(\\sin x)\' = \\cos x$$, $$(\\cos x)\' = -\\sin x$$\n3) $$(\\tan x)\' = \\sec^2 x$$\n4) $$(\\sin f(x))\' = f\'(x) \\cos f(x)$$',
  },
  '미적분_05여러가지미분법_통합숙제': {
    type: 'calculus',
    P: '합성함수, 매개변수, 음함수의 미분법을 활용합니다.',
    C: '연쇄 법칙, 몫의 미분법, 매개변수 미분을 적용합니다.',
    B: '여러 가지 미분법:\n\n1) 합성함수: $$\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}$$\n2) 매개변수: $$\\frac{dy}{dx} = \\frac{\\frac{dy}{dt}}{\\frac{dx}{dt}}$$\n3) 음함수: 양변을 $$x$$로 미분, $$y\' = \\frac{dy}{dx}$$로 놓고 정리\n4) 역함수 미분: $$\\frac{dx}{dy} = \\frac{1}{\\frac{dy}{dx}}$$',
  },
  '미적분_06도함수활용1_통합숙제': {
    type: 'calculus',
    P: '이계도함수를 이용하여 곡선의 볼록성, 변곡점을 분석합니다.',
    C: '$$f\'\'(x)$$의 부호로 아래/위로 볼록을 판별하고, 변곡점을 구합니다.',
    B: '도함수의 활용 1:\n\n1) $$f\'\'(x) > 0$$: 아래로 볼록, $$f\'\'(x) < 0$$: 위로 볼록\n2) 변곡점: $$f\'\'(x) = 0$$이고 볼록성이 바뀌는 점\n3) 접선·법선의 방정식\n4) 속도·가속도 문제',
  },
  '미적분_07도함수활용2_통합숙제': {
    type: 'calculus',
    P: '도함수를 활용한 방정식·부등식의 풀이와 최적화 문제를 해결합니다.',
    C: '함수의 그래프를 분석하여 근의 개수를 판별하고, 최댓값·최솟값을 구합니다.',
    B: '도함수의 활용 2:\n\n1) $$f(x) = g(x)$$의 실근 개수: 두 그래프의 교점\n2) 부등식 증명: 차함수의 최솟값 ≥ 0\n3) 평균값 정리: $$f\'(c) = \\frac{f(b) - f(a)}{b - a}$$',
  },
  '미적분_08여러가지적분법_통합숙제': {
    type: 'calculus',
    P: '치환적분, 부분적분을 활용하여 복잡한 함수의 적분을 수행합니다.',
    C: '적절한 치환 또는 부분적분 공식을 선택하여 적용합니다.',
    B: '여러 가지 적분법:\n\n1) 치환적분: $$\\int f(g(x)) g\'(x) dx = \\int f(t) dt$$ ($$t = g(x)$$)\n2) 부분적분: $$\\int f(x)g\'(x)dx = f(x)g(x) - \\int f\'(x)g(x)dx$$\n3) $$\\int \\frac{f\'(x)}{f(x)} dx = \\ln|f(x)| + C$$',
  },
  '미적분_09정적분_통합숙제': {
    type: 'calculus',
    P: '정적분의 다양한 성질과 활용(넓이, 부피, 속도)을 다룹니다.',
    C: '구분구적법, 정적분과 급수의 관계, 회전체의 부피를 적용합니다.',
    B: '정적분의 활용:\n\n1) 넓이: $$S = \\int_a^b |f(x) - g(x)| dx$$\n2) 회전체 부피: $$V = \\pi \\int_a^b \\{f(x)\\}^2 dx$$\n3) 구분구적법: $$\\lim_{n \\to \\infty} \\sum_{k=1}^{n} f\\left(\\frac{k}{n}\\right) \\cdot \\frac{1}{n} = \\int_0^1 f(x)dx$$\n4) 속도와 거리: $$\\int_{t_1}^{t_2} |v(t)| dt$$',
  },
};

// ── SSOT 단원 데이터 (수동 매핑) ──
const UNITS = [
  // 수학1
  { subject: '수학1', answerKey: '수학1_01지수_통합숙제', title: '지수', imagePath: '/math_crops/숙제/수학1/01지수/' },
  { subject: '수학1', answerKey: '수학1_02로그_통합숙제', title: '로그', imagePath: '/math_crops/숙제/수학1/02로그/' },
  { subject: '수학1', answerKey: '수학1_03지수로그함수_통합숙제', title: '지수·로그함수', imagePath: '/math_crops/숙제/수학1/03지수로그함수/' },
  { subject: '수학1', answerKey: '수학1_04지수로그함수활용_통합숙제', title: '지수로그함수 활용', imagePath: '/math_crops/숙제/수학1/04지수로그함수활용/' },
  { subject: '수학1', answerKey: '수학1_05삼각함수정의_통합숙제', title: '삼각함수 정의', imagePath: '/math_crops/숙제/수학1/05삼각함수정의/' },
  { subject: '수학1', answerKey: '수학1_06삼각함수그래프_통합숙제', title: '삼각함수 그래프', imagePath: '/math_crops/숙제/수학1/06삼각함수그래프/' },
  { subject: '수학1', answerKey: '수학1_07삼각함수활용_통합숙제', title: '삼각함수 활용', imagePath: '/math_crops/숙제/수학1/07삼각함수활용/' },
  { subject: '수학1', answerKey: '수학1_08등차등비수열_통합숙제', title: '등차·등비수열', imagePath: '/math_crops/숙제/수학1/08등차등비수열/' },
  { subject: '수학1', answerKey: '수학1_09수열의합_통합숙제', title: '수열의 합', imagePath: '/math_crops/숙제/수학1/09수열의합/' },
  { subject: '수학1', answerKey: '수학1_10수학적귀납법_통합숙제', title: '수학적 귀납법', imagePath: '/math_crops/숙제/수학1/10수학적귀납법/' },
  // 수학2
  { subject: '수학2', answerKey: '수학2_01함수의극한_통합숙제', title: '함수의 극한', imagePath: '/math_crops/숙제/수학2/01함수의극한/' },
  { subject: '수학2', answerKey: '수학2_02함수의연속_통합숙제', title: '함수의 연속', imagePath: '/math_crops/숙제/수학2/02함수의연속/' },
  { subject: '수학2', answerKey: '수학2_03미분계수_통합숙제', title: '미분계수', imagePath: '/math_crops/숙제/수학2/03미분계수/' },
  { subject: '수학2', answerKey: '수학2_04도함수활용12_통합숙제', title: '도함수의 활용 1·2', imagePath: '/math_crops/숙제/수학2/04도함수활용12/' },
  { subject: '수학2', answerKey: '수학2_05도함수활용3_통합숙제', title: '도함수의 활용 3', imagePath: '/math_crops/숙제/수학2/05도함수활용3/' },
  { subject: '수학2', answerKey: '수학2_06부정적분정적분_통합숙제', title: '부정적분과 정적분', imagePath: '/math_crops/숙제/수학2/06부정적분정적분/' },
  { subject: '수학2', answerKey: '수학2_07정적분활용_통합숙제', title: '정적분의 활용', imagePath: '/math_crops/숙제/수학2/07정적분활용/' },
  // 미적분
  { subject: '미적분', answerKey: '미적분_01수열의극한_통합숙제', title: '수열의 극한', imagePath: '/math_crops/숙제/미적분/01수열의극한/' },
  { subject: '미적분', answerKey: '미적분_02급수_통합숙제', title: '급수', imagePath: '/math_crops/숙제/미적분/02급수/' },
  { subject: '미적분', answerKey: '미적분_03지수로그함수미분_통합숙제', title: '지수로그함수의 미분', imagePath: '/math_crops/숙제/미적분/03지수로그함수미분/' },
  { subject: '미적분', answerKey: '미적분_04삼각함수미분_통합숙제', title: '삼각함수의 미분', imagePath: '/math_crops/숙제/미적분/04삼각함수미분/' },
  { subject: '미적분', answerKey: '미적분_05여러가지미분법_통합숙제', title: '여러 가지 미분법', imagePath: '/math_crops/숙제/미적분/05여러가지미분법/' },
  { subject: '미적분', answerKey: '미적분_06도함수활용1_통합숙제', title: '도함수의 활용 1', imagePath: '/math_crops/숙제/미적분/06도함수활용1/' },
  { subject: '미적분', answerKey: '미적분_07도함수활용2_통합숙제', title: '도함수의 활용 2', imagePath: '/math_crops/숙제/미적분/07도함수활용2/' },
  { subject: '미적분', answerKey: '미적분_08여러가지적분법_통합숙제', title: '여러 가지 적분법', imagePath: '/math_crops/숙제/미적분/08여러가지적분법/' },
  { subject: '미적분', answerKey: '미적분_09정적분_통합숙제', title: '정적분', imagePath: '/math_crops/숙제/미적분/09정적분/' },
];

// ── 정답 포맷팅 ──
function formatAnswer(rawAnswer) {
  const num = parseInt(rawAnswer, 10);
  // 1~5 → 객관식 ①~⑤
  if (num >= 1 && num <= 5 && String(num) === String(rawAnswer).trim()) {
    const circled = ['①', '②', '③', '④', '⑤'];
    return `따라서 문제의 논리 구조에 따른 최종 정답은 $$\\mathbf{\\boxed{${circled[num - 1]}번}}$$ 입니다.`;
  }
  // 주관식
  return `따라서 최종 정답은 $$\\mathbf{\\boxed{${rawAnswer}}}$$ 입니다.`;
}

// ── 메인 생성 ──
let totalCreated = 0;
let totalSkipped = 0;

UNITS.forEach(unit => {
  const template = UNIT_TEMPLATES[unit.answerKey];
  if (!template) {
    console.warn(`⚠️  템플릿 없음: ${unit.answerKey}`);
    return;
  }

  const answers = avsAnswers[unit.answerKey];
  if (!answers) {
    console.warn(`⚠️  정답 없음: ${unit.answerKey}`);
    return;
  }

  // hintKey = answerKey (동일)
  const hintKey = unit.answerKey;
  const outDir = path.join(__dirname, `../public/math_hints/${hintKey}`);

  // 디렉토리 생성
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const answerKeys = Object.keys(answers).sort((a, b) => parseInt(a) - parseInt(b));
  let unitCreated = 0;

  answerKeys.forEach(problemId => {
    const paddedId = problemId.padStart(3, '0');
    const outFile = path.join(outDir, `${paddedId}.json`);

    // 해설 이미지 경로
    const solutionImgSrc = `${unit.imagePath}${paddedId}a.webp`;

    // 해설 이미지 존재 여부 확인
    const localImgPath = path.join(__dirname, '../public', solutionImgSrc);
    const hasImage = fs.existsSync(localImgPath);

    const json = {
      title: `[통합숙제] ${unit.subject} - ${unit.title} ${parseInt(problemId)}번 명품 해설`,
      type: template.type,
      P: template.P,
      C: template.C,
      B: template.B,
      S: hasImage
        ? '[단계별 풀이 흐름]\n아래 선생님의 정밀 판서 및 해설 이미지를 정독하여 논리 전개 과정을 완벽히 마스터하세요.'
        : '[풀이 흐름]\n위의 핵심 개념과 공식을 활용하여 단계적으로 풀어보세요.',
      S_objects: hasImage ? [{ type: 'image', src: solutionImgSrc }] : [],
      A: formatAnswer(answers[problemId]),
    };

    fs.writeFileSync(outFile, JSON.stringify(json, null, 2), 'utf8');
    unitCreated++;
  });

  totalCreated += unitCreated;
  console.log(`✅ ${hintKey}: ${unitCreated}개 JSON 생성`);
});

console.log(`\n🎉 총 ${totalCreated}개 AVS JSON 파일 생성 완료!`);
if (totalSkipped > 0) console.log(`⚠️  ${totalSkipped}개 스킵됨`);
