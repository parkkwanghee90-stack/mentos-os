import fs from 'fs';

const p = './public/premium_lectures/이산확률변수.json';
const d = JSON.parse(fs.readFileSync(p, 'utf8'));

// We are completely replacing the steps to ensure the new table-based proofs are perfectly integrated.
d.steps = [
  {
    step: 1,
    narration: "안녕! 이번에는 통계의 꽃, <blue>이산확률변수</blue> 파트를 배울 거야. 평균과 분산이 대체 어떻게 만들어졌는지 뜬구름 잡는 기호가 아니라, 진짜 눈에 보이는 표를 통해서 완벽하게 증명해 줄게!",
    visuals: { title: "이산확률변수와 기댓값", math: "\\text{Discrete Random Variables}" }
  },
  {
    step: 2,
    narration: "가장 먼저 꼭 기억해야 할 기본! 확률분포표 아래칸에 있는 <red>모든 확률을 다 더하면 무조건 1</red>이 나와야 해. 세상의 모든 일어날 경우를 다 합친 거니까 100%, 즉 1이 되는 거지!",
    visuals: { title: "확률의 총합은 1", math: "\\begin{array}{|c|c|c|c|c|} \\hline X & x_1 & x_2 & \\cdots & \\text{합계} \\\\ \\hline P & p_1 & p_2 & \\cdots & 1 \\\\ \\hline \\end{array}" }
  },
  {
    step: 3,
    narration: "바로 예제 1번! 확률변수 X가 1일 확률이 a, 2일 확률이 3a야. 표의 아래칸 확률을 다 더한 4a가 1이 되어야 하니까, a는 4분의 1이 되는 거야!",
    visuals: { title: "예제 1: 미지수 a 구하기", math: "\\begin{array}{l} \\text{\\textbf{Q.} } P(X=1)=a, \\; P(X=2)=3a \\text{ 일 때, } a\\text{는?} \\\\ \\\\ \\implies a + 3a = 1 \\implies a = \\frac{1}{4} \\end{array}" }
  },
  {
    step: 4,
    narration: "이제 <blue>평균(기댓값)</blue>을 구하는 원리를 표로 증명해 볼까? 중학교 때 배운 도수분포표 기억나지? 평균은 변량(x)과 사람 수(도수 f)를 위아래로 쫙 곱해서 다 더한 뒤, 전체 사람 수 N으로 나눴었어.",
    visuals: { title: "중학교 때 배운 평균", math: "\\begin{array}{|c|c|c|c|c|} \\hline \\text{점수}(x) & x_1 & x_2 & \\cdots & x_n \\\\ \\hline \\text{명수}(f) & f_1 & f_2 & \\cdots & f_n \\\\ \\hline \\end{array} \\\\ \\\\ \\text{평균 } m = \\frac{x_1 f_1 + x_2 f_2 + \\cdots + x_n f_n}{N}" }
  },
  {
    step: 5,
    narration: "여기서 분모 N을 각 항목 밑으로 쏙쏙 넣어보자. 전체 N명 중에 f명이 차지하는 비율! 이게 바로 우리가 고등학교에서 부르는 <green>확률 p</green>가 되는 거야!",
    visuals: { title: "도수(명수)가 확률로 변신!", math: "m = x_1 \\left(\\frac{f_1}{N}\\right) + x_2 \\left(\\frac{f_2}{N}\\right) + \\cdots + x_n \\left(\\frac{f_n}{N}\\right)" }
  },
  {
    step: 6,
    narration: "그래서 고등학교의 확률분포표에서는 변수 x와 확률 p를 위아래로 곱해서 싹 다 더해주기만 하면! 그게 바로 기댓값, 즉 평균 E(X)가 되는 거란다. 엄청 직관적이지?",
    visuals: { title: "고등학교의 기댓값 공식", math: "\\begin{array}{|c|c|c|c|} \\hline X & x_1 & x_2 & \\cdots \\\\ \\hline P & p_1 & p_2 & \\cdots \\\\ \\hline \\end{array} \\\\ \\\\ E(X) = x_1 p_1 + x_2 p_2 + \\cdots + x_n p_n" }
  },
  {
    step: 7,
    narration: "예제 2번! 동전 2개를 던져 앞면이 나오는 개수 X의 평균을 구해보자. 앞면이 0개, 1개, 2개일 확률은 1/4, 2/4, 1/4이야. 표에서 위아래로 곱해서 더하면 평균은 깔끔하게 1이 나와!",
    visuals: { title: "예제 2: 기본 기댓값 계산", math: "\\begin{array}{|c|c|c|c|c|} \\hline X & 0 & 1 & 2 & \\text{합계} \\\\ \\hline P & \\frac{1}{4} & \\frac{2}{4} & \\frac{1}{4} & 1 \\\\ \\hline \\end{array} \\\\ \\\\ E(X) = 0\\left(\\frac{1}{4}\\right) + 1\\left(\\frac{2}{4}\\right) + 2\\left(\\frac{1}{4}\\right) = 1" }
  },
  {
    step: 8,
    narration: "예제 3번, 상금의 기댓값! 10% 확률로 1000원, 20% 확률로 500원을 받는 게임이야. 표를 머릿속에 그리고 위아래로 곱해! 1000원 곱하기 0.1, 500원 곱하기 0.2! 합치면 평균 200원을 기대할 수 있네.",
    visuals: { title: "예제 3: 상금의 기댓값", math: "\\begin{array}{l} \\text{\\textbf{Q.} 상금의 기댓값은?} \\\\ \\\\ E(X) = 1000(0.1) + 500(0.2) + 0(0.7) = 200\\text{원} \\end{array}" }
  },
  {
    step: 9,
    narration: "이제 대망의 <red>분산</red> 증명이야. 분산은 흩어진 정도, 즉 '편차 제곱의 평균'이야. 표의 맨 아래 칸에 각 점수에서 평균을 뺀 '편차의 제곱'을 적어두고, 그걸 확률이랑 위아래로 곱해서 더하는 거지!",
    visuals: { title: "분산의 원래 정의 (편차 제곱의 평균)", math: "\\begin{array}{|c|c|c|c|} \\hline X & x_1 & x_2 & \\cdots \\\\ \\hline P & p_1 & p_2 & \\cdots \\\\ \\hline \\text{편차}^2 & (x_1 - m)^2 & (x_2 - m)^2 & \\cdots \\\\ \\hline \\end{array} \\\\ \\\\ V(X) = (x_1 - m)^2 p_1 + (x_2 - m)^2 p_2 + \\cdots" }
  },
  {
    step: 10,
    narration: "자, 이제 (x-m)의 제곱을 완전제곱식으로 전개해서 식을 세 줄로 예쁘게 나눠 써볼게! 첫 번째 줄엔 x제곱들이 묶이고, 두 번째 줄엔 x들이 묶이고, 세 번째 줄엔 m제곱들이 묶이게 돼!",
    visuals: { title: "분산 식의 전개", math: "\\begin{aligned} V(X) =& \\color{blue}{(x_1^2 p_1 + x_2^2 p_2 + \\cdots)} \\\\ &- \\color{green}{2m(x_1 p_1 + x_2 p_2 + \\cdots)} \\\\ &+ \\color{red}{m^2(p_1 + p_2 + \\cdots)} \\end{aligned}" }
  },
  {
    step: 11,
    narration: "여기서 진짜 마법이 일어나! 첫 번째 파란 줄은 변수 제곱에 확률을 곱했으니 <blue>제곱의 평균</blue>이야. 두 번째 초록 줄 괄호 안은 그냥 <green>평균 m</green>이고, 세 번째 빨간 줄 확률의 합은 무조건 <red>1</red>이지!",
    visuals: { title: "제평평제의 탄생", math: "\\begin{aligned} V(X) =& \\color{blue}{E(X^2)} \\\\ &- \\color{green}{2m(m)} \\\\ &+ \\color{red}{m^2(1)} \\end{aligned}" }
  },
  {
    step: 12,
    narration: "이걸 깔끔하게 정리하면, 파란색 '제곱의 평균'에서 뒤에 남은 m제곱을 하나 빼는 모양이 돼. 이게 바로 전국의 모든 고등학생들이 외우는 <blue>제평평제 (제곱의 평균 빼기 평균의 제곱)</blue> 공식의 정체란다!",
    visuals: { title: "완벽히 증명된 분산 공식", math: "V(X) = E(X^2) - m^2 \\\\ \\text{ (제곱의 평균 - 평균의 제곱) }" }
  },
  {
    step: 13,
    narration: "예제 4번으로 연습하자! 어떤 변수의 평균이 3.5고 제곱의 평균이 6분의 91이야. 제평평제 공식에 넣으면 6분의 91 빼기 3.5의 제곱! 계산하면 12분의 35가 아주 쉽게 분산으로 튀어나와!",
    visuals: { title: "예제 4: 제평평제 분산 구하기", math: "\\begin{array}{l} \\text{\\textbf{Q.} } E(X)=\\frac{7}{2}, \\; E(X^2)=\\frac{91}{6} \\text{ 일 때 분산은?} \\\\ \\\\ V(X) = \\frac{91}{6} - \\left(\\frac{7}{2}\\right)^2 = \\frac{35}{12} \\end{array}" }
  },
  {
    step: 14,
    narration: "이번엔 <green>확률변수의 변환</green>이야! 원래 점수 X에 모두 a를 곱하고 b를 더하면 평균과 분산은 어떻게 변할까?",
    visuals: { title: "확률변수의 변환", math: "Y = aX + b" }
  },
  {
    step: 15,
    narration: "평균은 엄청 정직해! 모든 학생의 점수를 2배 하고 5점을 더 주면, 반 평균도 똑같이 2배가 되고 5점이 올라가겠지? 그래서 원래 평균 E(X)에 a를 곱하고 b를 더하면 그대로 새 평균이 돼!",
    visuals: { title: "평균의 변환 공식", math: "E(aX+b) = aE(X) + b" }
  },
  {
    step: 16,
    narration: "분산은 '간격(흩어짐)'을 뜻해. 모든 점수에 똑같이 b점을 더해봤자 간격은 절대 변하지 않아서 b는 버려져! 대신 a를 곱한 건 분산 공식이 '제곱'의 평균이라서 <red>a의 제곱</red>으로 뻥튀기 되어 나온단다!",
    visuals: { title: "분산의 변환 공식", math: "V(aX+b) = a^2 V(X)" }
  },
  {
    step: 17,
    narration: "그럼 <green>표준편차</green>는? 분산에 루트를 씌운 거니까, a제곱은 절댓값 a로 풀려나와서 원래 표준편차에 곱해지기만 해! 이제 공식을 알았으니 변환 예제를 연속으로 박살내보자!",
    visuals: { title: "표준편차의 변환 공식", math: "\\sigma(aX+b) = |a|\\sigma(X)" }
  },
  {
    step: 18,
    narration: "예제 5번! 원래 평균이 10일 때, 2X-5의 평균은? 정직하게 10에 2를 곱하고 5를 빼면 되니까, 정답은 15!",
    visuals: { title: "예제 5: 기댓값의 변환", math: "\\begin{array}{l} \\text{\\textbf{Q.} } E(X)=10 \\text{ 일 때, } E(2X-5)\\text{는?} \\\\ \\\\ \\implies 2E(X) - 5 = 2(10) - 5 = 15 \\end{array}" }
  },
  {
    step: 19,
    narration: "예제 6번! 원래 분산이 4일 때, -3X+2의 분산은? 더하기 2는 간격에 영향을 안 주니 무시! 곱해진 -3은 제곱해서 9로 나오고, 원래 분산 4에 곱하면 9 곱하기 4는 36!",
    visuals: { title: "예제 6: 분산의 변환", math: "\\begin{array}{l} \\text{\\textbf{Q.} } V(X)=4 \\text{ 일 때, } V(-3X+2)\\text{는?} \\\\ \\\\ \\implies (-3)^2 V(X) = 9 \\times 4 = 36 \\end{array}" }
  },
  {
    step: 20,
    narration: "예제 7번! 분산이 9일 때, 4X-1의 표준편차는? 분산에 루트를 씌워 원래 표준편차가 3인 걸 구해. 그 다음 4의 절댓값인 4를 곱해주면, 12가 정답!",
    visuals: { title: "예제 7: 표준편차의 변환", math: "\\begin{array}{l} \\text{\\textbf{Q.} } V(X)=9 \\text{ 일 때, } \\sigma(4X-1)\\text{는?} \\\\ \\\\ \\implies \\sigma(X)=3 \\implies |4| \\times 3 = 12 \\end{array}" }
  },
  {
    step: 21,
    narration: "마지막 예제 8번! 10개의 제품 중 불량품이 2개 섞여 있어. 3개를 꺼낼 때 불량품 개수 X의 분포를 표로 그려보자. 10개 중 3개를 뽑는 10C3을 분모로 깔고, 분자에는 정상과 불량품 조합을 곱해주면 예쁜 표가 완성돼!",
    visuals: { title: "예제 8: 확률분포표 직접 만들기", math: "\\begin{array}{|c|c|c|c|c|} \\hline X & 0 & 1 & 2 & \\text{합} \\\\ \\hline P & \\frac{{}_8\\mathrm{C}_3}{{}_{10}\\mathrm{C}_3} & \\frac{{}_2\\mathrm{C}_1 \\times {}_8\\mathrm{C}_2}{{}_{10}\\mathrm{C}_3} & \\frac{{}_2\\mathrm{C}_2 \\times {}_8\\mathrm{C}_1}{{}_{10}\\mathrm{C}_3} & 1 \\\\ \\hline \\end{array}" }
  }
];

fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log('Fixed discrete lectures with rich tables for proofs!');
