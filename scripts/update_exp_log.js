import fs from 'fs';

const conceptPath = './public/concept_cards/premium_lectures.json';
const conceptData = JSON.parse(fs.readFileSync(conceptPath, 'utf8'));

// 1. Update Concept Cards Content
const algebra = conceptData['대수'];
const expIdx = algebra.findIndex(x => x.id === '지수함수');
const logIdx = algebra.findIndex(x => x.id === '로그함수');

if (expIdx !== -1) {
  algebra[expIdx].content = `# 📌 지수함수 완벽 정리
  
## 1. 지수함수의 그래프
- **밑 $a > 1$ 일 때**: $x$값이 커질수록 $y$값도 커지는 **증가함수**입니다. $a$가 커질수록 그래프는 $y$축에 더 가깝게 달라붙으며 가파르게 상승합니다.
- **밑 $0 < a < 1$ 일 때**: $x$값이 커질수록 $y$값은 작아지는 **감소함수**입니다. $a$가 작을수록(0에 가까울수록) 그래프는 더 급격하게 감소합니다.
- **공통 성질**: 반드시 점 $(0, 1)$을 지나며, $x$축($y=0$)이 **점근선**이 됩니다.

## 2. 지수방정식과 부등식
- **밑을 같게 할 수 있는 경우**: $a^{f(x)} = a^{g(x)} \\implies f(x) = g(x)$
- **지수부등식 주의사항**: 밑 $a$가 1보다 작으면 지수를 비교할 때 **부등호 방향이 반대**로 바뀝니다! ($a < 1 \\implies a^x < a^y \\iff x > y$)`;
}

if (logIdx !== -1) {
  algebra[logIdx].content = `# 📌 로그함수 완벽 정리

## 1. 로그함수의 그래프
- **지수함수와의 관계**: 로그함수 $y = \\log_a x$는 지수함수 $y = a^x$의 **역함수**이며, 직선 $y=x$에 대하여 대칭입니다.
- **밑 $a > 1$ 일 때**: 증가함수이며, 점 $(1, 0)$을 지납니다.
- **밑 $0 < a < 1$ 일 때**: 감소함수입니다.
- **점근선**: $y$축($x=0$)이 점근선입니다. **진수 조건($x > 0$)**에 의해 그래프는 $y$축 오른쪽에만 그려집니다.

## 2. 로그방정식과 부등식
- **진수 조건 체크 필수**: 문제를 풀기 전, 반드시 진수 부분이 0보다 크다는 범위를 먼저 잡아야 합니다.
- **밑 변환**: 밑이 다르면 밑 변환 공식을 통해 통일한 후 비교합니다.`;
}

fs.writeFileSync(conceptPath, JSON.stringify(conceptData, null, 2));

// 2. Create 지수함수.json
const expLecture = {
  id: "지수함수",
  title: "지수함수의 그래프와 방부등식 끝장내기",
  subject: "수학1 / 대수",
  steps: [
    {
      step: 1,
      narration: "안녕! 오늘은 함수 중에서도 가장 폭발적으로 변하는 <blue>지수함수</blue>에 대해 알아볼 거야. $y = a^x$ 꼴의 함수를 말해.",
      visuals: { title: "지수함수의 정의", math: "y = a^x \\quad (a > 0, a \\neq 1)" }
    },
    {
      step: 2,
      narration: "지수함수의 성질은 밑 $a$가 1보다 크냐 작냐에 따라 완전히 달라져. 그래프로 직접 확인해볼까?",
      visuals: { title: "밑에 따른 지수함수의 개형", math: "\\text{밑 } a \\text{ 의 범위가 핵심!}" }
    },
    {
      step: 3,
      narration: "먼저 밑이 1보다 큰 <red>증가함수</red>의 모습이야. $a$가 2, 3, 4로 커질수록 그래프가 어떻게 변하는지 봐봐.",
      visuals: { title: "증가하는 지수함수 (a > 1)", component: "ExponentialLogGraph", props: { mode: "exp-growth" } }
    },
    {
      step: 4,
      narration: "$a$가 커질수록 그래프가 <blue>y축에 더 가깝게</blue> 가파르게 상승하는 게 보이지? 하지만 $x$가 작아질수록 $x$축에 무한히 가까워질 뿐 절대 닿지는 않아. 이걸 <green>점근선</green>이라고 불러.",
      visuals: { title: "증가함수의 특징", math: "\\begin{array}{l} a \\uparrow \\implies \\text{더 가파르게 상승} \\\\ \\text{점근선: } y = 0 \\text{ (x축)} \\\\ \\text{항상 지나는 점: } (0, 1) \\end{array}" }
    },
    {
      step: 5,
      narration: "이번엔 밑이 1보다 작은 <yellow>감소함수</yellow>의 개형이야. $1/2, 1/3$처럼 밑이 작아질수록(0에 가까울수록) 그래프는 더 급격하게 떨어져.",
      visuals: { title: "감소하는 지수함수 (0 < a < 1)", component: "ExponentialLogGraph", props: { mode: "exp-decay" } }
    },
    {
      step: 6,
      narration: "이제 지수방정식을 풀어보자. 총 8가지 유형이야. 첫 번째는 밑을 같게 만드는 가장 기본 유형!",
      visuals: { title: "지수방정식 예제 1", math: "\\begin{array}{l} \\text{\\textbf{Q1.} } 2^{x+1} = 32 \\text{ 의 해는?} \\\\ \\\\ 2^{x+1} = 2^5 \\implies x+1 = 5 \\\\ \\therefore x = 4 \\end{array}" }
    },
    {
      step: 7,
      narration: "예제 2번, 밑이 분수여도 당황하지 마! 밑을 3으로 통일하면 부호만 조심하면 돼.",
      visuals: { title: "지수방정식 예제 2", math: "\\begin{array}{l} \\text{\\textbf{Q2.} } 3^{2x-1} = \\left(\\frac{1}{27}\\right)^x \\text{ 의 해는?} \\\\ \\\\ 3^{2x-1} = 3^{-3x} \\implies 2x-1 = -3x \\\\ 5x = 1 \\implies x = \\frac{1}{5} \\end{array}" }
    },
    {
      step: 8,
      narration: "예제 3번, 항이 3개인 치환 유형이야. $2^x$를 $t$로 치환해볼까? 이때 $t$는 항상 양수여야 해!",
      visuals: { title: "지수방정식 예제 3", math: "\\begin{array}{l} \\text{\\textbf{Q3.} } 4^x - 3 \\cdot 2^x + 2 = 0 \\\\ \\\\ 2^x = t > 0 \\implies t^2 - 3t + 2 = 0 \\\\ (t-1)(t-2) = 0 \\implies t = 1, 2 \\\\ 2^x = 1, 2 \\implies x = 0, 1 \\end{array}" }
    },
    {
      step: 9,
      narration: "예제 4번, 밑에도 미지수가 있는 경우야. 지수가 같거나 밑이 1이면 성립하겠지?",
      visuals: { title: "지수방정식 예제 4", math: "\\begin{array}{l} \\text{\\textbf{Q4.} } (x-1)^{x+2} = (x-1)^4 \\quad (x > 1) \\\\ \\\\ 1) \\text{ 지수 비교: } x+2 = 4 \\implies x = 2 \\\\ 2) \\text{ 밑이 1인 경우: } x-1 = 1 \\implies x = 2 \\\\ \\therefore x = 2 \\end{array}" }
    },
    {
      step: 10,
      narration: "예제 5번, 밑은 다른데 지수가 같은 경우! 지수가 0이면 밑에 상관없이 항상 1이 된다는 걸 이용해.",
      visuals: { title: "지수방정식 예제 5", math: "\\begin{array}{l} \\text{\\textbf{Q5.} } 2^{x^2-4} = 5^{x^2-4} \\\\ \\\\ x^2-4 = 0 \\implies x^2 = 4 \\\\ \\therefore x = 2, -2 \\end{array}" }
    },
    {
      step: 11,
      narration: "예제 6번, $2^x + 2^{-x}$ 가 반복되는 심화 치환 문제야. 산술-기하 평균에 의해 $t \\ge 2$ 임을 잊지 마!",
      visuals: { title: "지수방정식 예제 6", math: "\\begin{array}{l} \\text{\\textbf{Q6.} } 4^x + 4^{-x} - (2^x + 2^{-x}) - 2 = 0 \\\\ \\\\ 2^x + 2^{-x} = t \\ge 2 \\implies (t^2-2) - t - 2 = 0 \\\\ t^2 - t - 4 = 0 \\dots \\text{(생략)} \\end{array}" }
    },
    {
      step: 12,
      narration: "예제 7번, 지수법칙 융합 문제. 연립방정식 형태도 결국 치환으로 해결 가능해.",
      visuals: { title: "지수방정식 예제 7", math: "\\begin{array}{l} \\text{\\textbf{Q7.} } 2^x + 3^y = 13, \\; 2^{x+1} - 3^y = 11 \\\\ \\\\ 2X + Y = 13, \\; 2X - Y = 11 \\text{ 꼴로 치환} \\\\ \\implies 3 \\cdot 2^x = 24 \\implies 2^x = 8 \\implies x = 3, y = 1 \\end{array}" }
    },
    {
      step: 13,
      narration: "방정식 마지막 8번! 근의 분리 문제야. 두 실근이 $\\alpha, \\beta$일 때 치환한 이차방정식의 근은 $2^{\\alpha}, 2^{\\beta}$가 된단다.",
      visuals: { title: "지수방정식 예제 8", math: "\\begin{array}{l} \\text{\\textbf{Q8.} } 4^x - a \\cdot 2^x + 4 = 0 \\text{ 이 서로 다른 두 실근을 가질 조건?} \\\\ \\\\ 2^x = t \\implies t^2 - at + 4 = 0 \\\\ \\text{두 근이 모두 양수여야 하므로 } D > 0, \\alpha+\\beta > 0, \\alpha\\beta > 0 \\\\ \\implies a > 4 \\end{array}" }
    },
    {
      step: 14,
      narration: "이제 <red>지수부등식</red>으로 넘어가자! 여기서 가장 중요한 건 밑이 1보다 작으면 부등호 방향이 바뀐다는 거야!",
      visuals: { title: "지수부등식의 핵심", math: "\\begin{array}{l} a > 1 \\implies a^f < a^g \\iff f < g \\\\ 0 < a < 1 \\implies a^f < a^g \\iff f > g \\text{ (반대!)} \\end{array}" }
    },
    {
      step: 15,
      narration: "부등식 예제 1번, 밑을 2로 통일해서 지수를 비교해보자.",
      visuals: { title: "지수부등식 예제 1", math: "\\begin{array}{l} \\text{\\textbf{Q1.} } 2^x < 16 \\\\ \\\\ 2^x < 2^4 \\implies x < 4 \\end{array}" }
    },
    {
      step: 16,
      narration: "예제 2번, 밑이 1/3이야. 지수를 꺼낼 때 부등호 방향을 <red>반대로</red> 뒤집어주는 거 잊지 않았지?",
      visuals: { title: "지수부등식 예제 2", math: "\\begin{array}{l} \\text{\\textbf{Q2.} } \\left(\\frac{1}{3}\\right)^x < \\frac{1}{9} \\\\ \\\\ \\left(\\frac{1}{3}\\right)^x < \\left(\\frac{1}{3}\\right)^2 \\implies x > 2 \\end{array}" }
    },
    {
      step: 17,
      narration: "예제 3번, 치환 부등식이야. $t$의 범위를 구한 뒤 다시 $x$로 돌려놓아야 해.",
      visuals: { title: "지수부등식 예제 3", math: "\\begin{array}{l} \\text{\\textbf{Q3.} } 4^x - 6 \\cdot 2^x + 8 < 0 \\\\ \\\\ (2^x-2)(2^x-4) < 0 \\implies 2 < 2^x < 4 \\\\ \\therefore 1 < x < 2 \\end{array}" }
    },
    {
      step: 18,
      narration: "예제 4번, 밑이 다른 경우 로그를 취해서 풀 수도 있지만, 보통은 거듭제곱으로 통일 가능하게 나와.",
      visuals: { title: "지수부등식 예제 4", math: "\\begin{array}{l} \\text{\\textbf{Q4.} } 9^{x+1} \\ge 27^{x-1} \\\\ \\\\ 3^{2x+2} \\ge 3^{3x-3} \\implies 2x+2 \\ge 3x-3 \\\\ \\therefore x \\le 5 \\end{array}" }
    },
    {
      step: 19,
      narration: "예제 5번, 복합 부등식이야. 각각의 밑을 정리해서 연립부등식처럼 풀면 돼.",
      visuals: { title: "지수부등식 예제 5", math: "\\begin{array}{l} \\text{\\textbf{Q5.} } 2 \\le 2^x \\cdot 4 \\le 16 \\\\ \\\\ 2^1 \\le 2^{x+2} \\le 2^4 \\implies 1 \\le x+2 \\le 4 \\\\ \\therefore -1 \\le x \\le 2 \\end{array}" }
    },
    {
      step: 20,
      narration: "예제 6번, 밑에 미지수가 있는 부등식! $x>1, x=1, 0<x<1$ 세 가지 경우로 나눠서 풀어야 완벽해.",
      visuals: { title: "지수부등식 예제 6", math: "\\begin{array}{l} \\text{\\textbf{Q6.} } x^{2x-5} > x^3 \\quad (x > 0) \\\\ \\\\ 1) x > 1 : 2x-5 > 3 \\implies x > 4 \\\\ 2) x = 1 : 1 > 1 \\text{ (불능)} \\\\ 3) 0 < x < 1 : 2x-5 < 3 \\implies x < 4 \\implies 0 < x < 1 \\end{array}" }
    },
    {
      step: 21,
      narration: "예제 7번, 모든 실수 $x$에 대해 성립하는 지수부등식. 판별식을 써야 하는데, 치환한 $t$가 양수라는 범위 안에서 성립해야 한다는 점이 중요해.",
      visuals: { title: "지수부등식 예제 7", math: "\\begin{array}{l} \\text{\\textbf{Q7.} 모든 실수 } x\\text{에 대해 } 4^x - 4 \\cdot 2^x + k \\ge 0 \\\\ \\\\ t^2 - 4t + k \\ge 0 \\quad (t > 0) \\\\ \\text{꼭짓점이 } t=2\\text{ 이므로 } f(2) \\ge 0 \\\\ \\implies 4-8+k \\ge 0 \\implies k \\ge 4 \\end{array}" }
    },
    {
      step: 22,
      narration: "마지막 8번! 실생활 활용 문제. 매 시간 2배로 증식하는 박테리아가 10시간 후에 몇 배가 될까?",
      visuals: { title: "지수부등식 예제 8", math: "\\begin{array}{l} \\text{\\textbf{Q8.} 매 시간 2배 증식하는 박테리아가 처음에 1마리일 때,} \\\\ \\text{1000마리 이상이 되는 것은 몇 시간 후인가?} \\\\ \\\\ 2^t \\ge 1000 \\implies 2^{10} = 1024 \\\\ \\therefore 10\\text{시간 후} \\end{array}" }
    }
  ]
};

// 3. Create 로그함수.json
const logLecture = {
  id: "로그함수",
  title: "로그함수의 그래프와 방부등식 완전 정복",
  subject: "수학1 / 대수",
  steps: [
    {
      step: 1,
      narration: "안녕! 이번엔 지수함수의 영원한 짝꿍, <blue>로그함수</blue>를 만나볼 거야. 로그함수는 지수함수의 역함수라는 사실부터 기억해!",
      visuals: { title: "로그함수의 정의", math: "y = \\log_a x \\quad (x > 0, a > 0, a \\neq 1)" }
    },
    {
      step: 2,
      narration: "로그함수는 지수함수 그래프를 $y=x$ 직선에 거울 비추듯 대칭시킨 모습이야. 이걸 <green>역함수 관계</green>라고 해.",
      visuals: { title: "지수함수와 로그함수의 대칭성", component: "ExponentialLogGraph", props: { mode: "inverse" } }
    },
    {
      step: 3,
      narration: "로그함수도 밑이 1보다 크면 <red>증가함수</red>야. 하지만 지수함수만큼 가파르진 않고 완만하게 올라가지. 밑이 커질수록 그래프는 $x$축에 더 달라붙게 돼.",
      visuals: { title: "증가하는 로그함수 (a > 1)", component: "ExponentialLogGraph", props: { mode: "log-growth" } }
    },
    {
      step: 4,
      narration: "로그함수는 $x$가 0에 가까워질수록 $y$축에 무한히 달라붙어. 그래서 이번엔 <blue>y축(x=0)</blue>이 점근선이 된단다.",
      visuals: { title: "증가함수의 특징", math: "\\begin{array}{l} a \\uparrow \\implies x\\text{축에 더 가깝게 완만해짐} \\\\ \\text{점근선: } x = 0 \\text{ (y축)} \\\\ \\text{항상 지나는 점: } (1, 0) \\end{array}" }
    },
    {
      step: 5,
      narration: "밑이 1보다 작을 때는 지수함수와 마찬가지로 <yellow>감소함수</yellow>가 돼. $y$값이 점점 작아지는 모습 확인해봐!",
      visuals: { title: "감소하는 로그함수 (0 < a < 1)", component: "ExponentialLogGraph", props: { mode: "log-decay" } }
    },
    {
      step: 6,
      narration: "로그방정식 시작! 로그 문제를 풀 때 가장 중요한 건 <red>진수 조건 (x > 0)</red>을 먼저 체크하는 거야. 이거 안 하면 100% 틀려!",
      visuals: { title: "로그방정식 예제 1", math: "\\begin{array}{l} \\text{\\textbf{Q1.} } \\log_2 (x-1) = 3 \\text{ 의 해는?} \\\\ \\\\ \\text{진수 조건: } x-1 > 0 \\implies x > 1 \\\\ x-1 = 2^3 = 8 \\implies x = 9 \\end{array}" }
    },
    {
      step: 7,
      narration: "예제 2번, 밑이 다르면 통일시켜야 해. 4를 2의 제곱으로 바꿔볼까?",
      visuals: { title: "로그방정식 예제 2", math: "\\begin{array}{l} \\text{\\textbf{Q2.} } \\log_2 x + \\log_4 x = 3 \\\\ \\\\ \\log_2 x + \\frac{1}{2} \\log_2 x = 3 \\implies \\frac{3}{2} \\log_2 x = 3 \\\\ \\log_2 x = 2 \\implies x = 4 \\end{array}" }
    },
    {
      step: 8,
      narration: "예제 3번, 로그가 반복되는 치환 유형이야. $\\log x$는 지수와 달리 모든 실수를 가질 수 있어.",
      visuals: { title: "로그방정식 예제 3", math: "\\begin{array}{l} \\text{\\textbf{Q3.} } (\\log_3 x)^2 - \\log_3 x^2 - 3 = 0 \\\\ \\\\ \\log_3 x = t \\implies t^2 - 2t - 3 = 0 \\\\ (t-3)(t+1) = 0 \\implies t = 3, -1 \\\\ \\log_3 x = 3, -1 \\implies x = 27, \\frac{1}{3} \\end{array}" }
    },
    {
      step: 9,
      narration: "예제 4번, 지수에 로그가 있는 고난도 유형! 양변에 로그를 취해서 지수를 내려보내자.",
      visuals: { title: "로그방정식 예제 4", math: "\\begin{array}{l} \\text{\\textbf{Q4.} } x^{\\log_2 x} = 8x^2 \\\\ \\\\ \\log_2 (x^{\\log_2 x}) = \\log_2 (8x^2) \\\\ (\\log_2 x)^2 = 3 + 2\\log_2 x \\implies t^2 - 2t - 3 = 0 \\\\ t=3, -1 \\implies x=8, \\frac{1}{2} \\end{array}" }
    },
    {
      step: 10,
      narration: "예제 5번, 진수가 같은 경우야. 밑이 같거나 진수가 1이면 되겠지?",
      visuals: { title: "로그방정식 예제 5", math: "\\begin{array}{l} \\text{\\textbf{Q5.} } \\log_x (x+2) = \\log_3 (x+2) \\\\ \\\\ 1) \\text{ 밑 비교: } x = 3 \\\\ 2) \\text{ 진수=1: } x+2 = 1 \\implies x = -1 \\text{ (조건 위배)} \\\\ \\therefore x = 3 \\end{array}" }
    },
    {
      step: 11,
      narration: "예제 6번, 연립로그방정식. 치환해서 일차 연립방정식 풀듯이 접근해.",
      visuals: { title: "로그방정식 예제 6", math: "\\begin{array}{l} \\text{\\textbf{Q6.} } \\log_2 x + \\log_3 y = 5, \\; \\log_2 x - \\log_3 y = 1 \\\\ \\\\ 2\\log_2 x = 6 \\implies \\log_2 x = 3 \\implies x = 8 \\\\ \\log_3 y = 2 \\implies y = 9 \\end{array}" }
    },
    {
      step: 12,
      narration: "예제 7번, 밑 변환 공식 응용. 서로 역수 관계인 로그들을 조심해.",
      visuals: { title: "로그방정식 예제 7", math: "\\begin{array}{l} \\text{\\textbf{Q7.} } \\log_2 x = \\log_x 4 \\\\ \\\\ \\log_2 x = \\frac{2}{\\log_2 x} \\implies (\\log_2 x)^2 = 2 \\\\ \\log_2 x = \\pm \\sqrt{2} \\implies x = 2^{\\sqrt{2}}, 2^{-\\sqrt{2}} \\end{array}" }
    },
    {
      step: 13,
      narration: "마지막 8번! 두 근의 곱을 묻는 문제. 치환한 방정식의 두 근의 합이 원래 방정식 두 근의 곱의 로그값이 된다는 걸 이용해.",
      visuals: { title: "로그방정식 예제 8", math: "\\begin{array}{l} \\text{\\textbf{Q8.} } (\\log x)^2 - 5\\log x + 2 = 0 \\text{ 의 두 근 } \\alpha, \\beta \\text{ 에 대해 } \\alpha\\beta \\text{ 는?} \\\\ \\\\ \\log x = t \\implies t^2 - 5t + 2 = 0 \\\\ t_1 + t_2 = \\log \\alpha + \\log \\beta = \\log(\\alpha\\beta) = 5 \\\\ \\therefore \\alpha\\beta = 10^5 \\end{array}" }
    },
    {
      step: 14,
      narration: "이제 <red>로그부등식</red>이야. 지수와 똑같아! 밑이 1보다 작으면 부등호 방향이 바뀌고, 무엇보다 <blue>진수 조건</blue>을 해의 범위에 반드시 합쳐야 해!",
      visuals: { title: "로그부등식의 핵심", math: "\\begin{array}{l} a > 1 : \\log_a f < \\log_a g \\iff f < g \\\\ 0 < a < 1 : \\log_a f < \\log_a g \\iff f > g \\\\ \\text{필수: } f > 0, g > 0 \\text{ (진수 조건)} \\end{array}" }
    },
    {
      step: 15,
      narration: "부등식 예제 1번, 진수 조건부터 잡고 밑을 통일해서 풀자.",
      visuals: { title: "로그부등식 예제 1", math: "\\begin{array}{l} \\text{\\textbf{Q1.} } \\log_2 (x-3) < 2 \\\\ \\\\ 1) \\text{ 진수: } x > 3 \\\\ 2) x-3 < 2^2 = 4 \\implies x < 7 \\\\ \\therefore 3 < x < 7 \\end{array}" }
    },
    {
      step: 16,
      narration: "예제 2번, 밑이 1/2이야. 진수를 꺼내면서 부등호 방향을 <red>뒤집어</red> 줘야겠지?",
      visuals: { title: "로그부등식 예제 2", math: "\\begin{array}{l} \\text{\\textbf{Q2.} } \\log_{1/2} x > -3 \\\\ \\\\ 1) \\text{ 진수: } x > 0 \\\\ 2) x < (1/2)^{-3} = 8 \\\\ \\therefore 0 < x < 8 \\end{array}" }
    },
    {
      step: 17,
      narration: "예제 3번, 로그가 합쳐진 형태야. 합치기 전에 각각의 진수 조건을 먼저 따져야 해.",
      visuals: { title: "로그부등식 예제 3", math: "\\begin{array}{l} \\text{\\textbf{Q3.} } \\log_2 x + \\log_2 (x-2) \le 3 \\\\ \\\\ 1) \\text{ 진수: } x > 0, x > 2 \\implies x > 2 \\\\ 2) \\log_2 x(x-2) \\le 3 \\implies x^2-2x-8 \\le 0 \\\\ (x-4)(x+2) \\le 0 \\implies -2 \\le x \\le 4 \\\\ \\therefore 2 < x \\le 4 \\end{array}" }
    },
    {
      step: 18,
      narration: "예제 4번, 치환 부등식. 로그의 범위는 실수 전체니까 $t$는 모든 실수가 가능해.",
      visuals: { title: "로그부등식 예제 4", math: "\\begin{array}{l} \\text{\\textbf{Q4.} } (\\log_2 x)^2 - 3\\log_2 x + 2 < 0 \\\\ \\\\ (t-1)(t-2) < 0 \\implies 1 < \\log_2 x < 2 \\\\ \\therefore 2 < x < 4 \\end{array}" }
    },
    {
      step: 19,
      narration: "예제 5번, 연립부등식 꼴이야. 하나씩 차근차근 풀어서 겹치는 부분을 찾자.",
      visuals: { title: "로그부등식 예제 5", math: "\\begin{array}{l} \\text{\\textbf{Q5.} } 0 < \\log_3 x < 2 \\\\ \\\\ 1) \\text{ 진수: } x > 0 \\\\ 2) 3^0 < x < 3^2 \\implies 1 < x < 9 \\\\ \\therefore 1 < x < 9 \\end{array}" }
    },
    {
      step: 20,
      narration: "예제 6번, 밑이 1/3인 연립부등식. 방향 전환에 특히 주의해!",
      visuals: { title: "로그부등식 예제 6", math: "\\begin{array}{l} \\text{\\textbf{Q6.} } -1 < \\log_{1/3} (x-1) < 0 \\\\ \\\\ 1) \\text{ 진수: } x > 1 \\\\ 2) (1/3)^0 < x-1 < (1/3)^{-1} \\implies 1 < x-1 < 3 \\\\ \\therefore 2 < x < 4 \\end{array}" }
    },
    {
      step: 21,
      narration: "예제 7번, 지수에 로그가 있는 부등식. 양변에 밑이 같은 로그를 취해서 지수를 내려보내자.",
      visuals: { title: "로그부등식 예제 7", math: "\\begin{array}{l} \\text{\\textbf{Q7.} } x^{\\log_2 x} < 16 \\\\ \\\\ (\\log_2 x)^2 < 4 \\implies -2 < \\log_2 x < 2 \\\\ \\therefore \\frac{1}{4} < x < 4 \\end{array}" }
    },
    {
      step: 22,
      narration: "마지막 8번! 모든 양수 x에 대해 성립하는 로그부등식. 판별식을 써서 떠 있는 형태를 만들어주면 돼.",
      visuals: { title: "로그부등식 예제 8", math: "\\begin{array}{l} \\text{\\textbf{Q8.} 모든 양수 } x \\text{ 에 대해 } (\\log_2 x)^2 - 4\\log_2 x + k > 0 \\\\ \\\\ t^2 - 4t + k > 0 \\implies D/4 = 4 - k < 0 \\\\ \\therefore k > 4 \\end{array}" }
    }
  ]
};

fs.writeFileSync('./public/premium_lectures/지수함수.json', JSON.stringify(expLecture, null, 2));
fs.writeFileSync('./public/premium_lectures/로그함수.json', JSON.stringify(logLecture, null, 2));

console.log('Exponential and Logarithmic lectures deeply expanded with graphs and 16 examples each!');
