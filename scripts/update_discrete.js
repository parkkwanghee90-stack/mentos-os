import fs from 'fs';

const conceptPath = './public/concept_cards/premium_lectures.json';
const conceptData = JSON.parse(fs.readFileSync(conceptPath, 'utf8'));
const statsList = conceptData['확률과통계'];

const detailedContent = JSON.parse(fs.readFileSync('./scripts/data_discrete.json', 'utf8')).content;

const idx = statsList.findIndex(x => x.id === "이산확률변수");
if (idx !== -1) {
  statsList[idx].content = detailedContent;
  statsList[idx].title = "이산확률변수와 기댓값 완벽 마스터";
}

fs.writeFileSync(conceptPath, JSON.stringify(conceptData, null, 2));

const lectureData = {
  id: "이산확률변수",
  title: "이산확률변수와 변환 마스터",
  subject: "수학1 / 확통",
  steps: [
    {
      step: 1,
      narration: "안녕! 이번에는 통계의 꽃, <blue>이산확률변수</blue> 파트를 배울 거야. 평균과 분산이 어떻게 만들어졌는지 그 뿌리부터 아주 명쾌하게 증명해 줄 테니 두 눈 크게 뜨고 따라와!",
      visuals: { title: "이산확률변수와 분포", math: "\\text{Discrete Random Variables}" }
    },
    {
      step: 2,
      narration: "가장 먼저 꼭 기억해야 할 사실! 확률분포표에 있는 <red>모든 확률을 다 더하면 무조건 1</red>이 나와야 해. 세상의 모든 가능성을 다 합친 거니까 당연하지?",
      visuals: { title: "확률의 총합은 1", math: "\\sum p_i = p_1 + p_2 + \\cdots + p_n = 1" }
    },
    {
      step: 3,
      narration: "바로 예제 1번! 확률변수 X가 1일 확률이 a, 2일 확률이 3a야. 두 개밖에 없네? 그럼 두 확률을 더한 4a가 1이 되어야 하니까, a는 4분의 1이 되는 거야!",
      visuals: { title: "예제 1: 미지수 a 구하기", math: "\\begin{array}{l} \\text{\\textbf{Q.} } P(X=1)=a, \\; P(X=2)=3a \\text{ 일 때, } a\\text{는?} \\\\ \\\\ \\implies a + 3a = 1 \\implies a = \\frac{1}{4} \\end{array}" }
    },
    {
      step: 4,
      narration: "이제 <blue>평균(기댓값)</blue>을 구하는 원리를 증명해 볼까? 중학교 때 도수분포표에서 평균 구하던 공식 기억나지? '변량 곱하기 도수'를 다 더한 뒤 전체 도수 N으로 나눴었어.",
      visuals: { title: "평균(기댓값)의 증명 (1/2)", math: "\\text{중학교 평균} = \\frac{\\sum x_i f_i}{N}" }
    },
    {
      step: 5,
      narration: "여기서 분모 N을 시그마 안으로 쏙 넣으면 N분의 f_i 가 되잖아? 이게 바로 '전체 중에 일어난 비율', 즉 <green>확률 p_i</green> 란다! 그래서 고등학교에선 변수 x와 확률 p를 곱해서 더하면 바로 평균이 나오는 거야!",
      visuals: { title: "평균(기댓값)의 증명 (2/2)", math: "\\sum x_i \\left(\\frac{f_i}{N}\\right) = \\sum x_i p_i = E(X)" }
    },
    {
      step: 6,
      narration: "원리를 알았으니 예제 2번! 동전 2개를 던져 앞면이 나오는 개수를 X라고 하자. 앞면이 0개, 1개, 2개일 확률은 각각 1/4, 2/4, 1/4이지. 위아래로 곱해서 더하면 평균은 깔끔하게 1이 나와!",
      visuals: { title: "예제 2: 기본 기댓값", math: "\\begin{array}{l} \\text{\\textbf{Q.} 앞면 개수의 기댓값은?} \\\\ \\\\ E(X) = 0\\left(\\frac{1}{4}\\right) + 1\\left(\\frac{2}{4}\\right) + 2\\left(\\frac{1}{4}\\right) = 1 \\end{array}" }
    },
    {
      step: 7,
      narration: "예제 3번, 상금 기댓값 구하기! 10% 확률로 1000원, 20% 확률로 500원을 받아. 1000 곱하기 0.1 더하기 500 곱하기 0.2를 하면 총 200원! 이 게임은 평균적으로 200원을 기대할 수 있는 거야.",
      visuals: { title: "예제 3: 상금의 기댓값", math: "\\begin{array}{l} \\text{\\textbf{Q.} 상금의 기댓값은?} \\\\ \\\\ E(X) = 1000(0.1) + 500(0.2) + 0(0.7) = 200 \\end{array}" }
    },
    {
      step: 8,
      narration: "다음은 <red>분산</red>이야. 분산의 원래 뜻은 '편차 제곱의 평균'이야. 식으로 쓰면 E((X-m)제곱)인데, 이 식을 전개해 보면 엄청난 공식이 탄생한단다!",
      visuals: { title: "분산의 정의", math: "V(X) = E((X-m)^2)" }
    },
    {
      step: 9,
      narration: "전개하면 X제곱 빼기 2mX 더하기 m제곱이 나오지? 여기서 X의 평균이 m이니까 식을 정리하면 결국 <blue>X제곱의 평균 빼기 평균의 제곱</blue>이 나와. 선생님은 이걸 <green>제평평제</green>라고 불러!",
      visuals: { title: "분산의 증명 (제평평제)", math: "\\begin{aligned} V(X) &= E(X^2 - 2mX + m^2) \\\\ &= E(X^2) - 2mE(X) + m^2 \\\\ &= E(X^2) - m^2 \\end{aligned}" }
    },
    {
      step: 10,
      narration: "예제 4번으로 연습해 볼까? 어떤 변수의 평균이 3.5고 제곱의 평균이 6분의 91이라고 해보자. 제평평제 공식에 넣으면 6분의 91 빼기 3.5의 제곱, 계산하면 12분의 35가 바로 튀어나와!",
      visuals: { title: "예제 4: 제평평제 분산 구하기", math: "\\begin{array}{l} \\text{\\textbf{Q.} } E(X)=\\frac{7}{2}, \\; E(X^2)=\\frac{91}{6} \\text{ 일 때 분산은?} \\\\ \\\\ V(X) = \\frac{91}{6} - \\left(\\frac{7}{2}\\right)^2 = \\frac{35}{12} \\end{array}" }
    },
    {
      step: 11,
      narration: "이번엔 <green>확률변수의 변환</green> 파트야! 원래 변수 X에 a를 곱하고 b를 더했을 때, 즉 aX+b가 되었을 때 평균과 분산이 어떻게 변하는지 볼까?",
      visuals: { title: "확률변수의 변환", math: "Y = aX + b" }
    },
    {
      step: 12,
      narration: "평균 증명! aX+b를 기대값 공식에 넣으면, 시그마의 성질에 의해 a가 앞으로 튀어나오고 상수 b는 그대로 더해져. 즉, <blue>원래 평균에 똑같이 a를 곱하고 b를 더하면 끝이야!</blue>",
      visuals: { title: "평균 변환 공식 증명", math: "E(aX+b) = \\sum (ax_i+b)p_i = a\\sum x_i p_i + b\\sum p_i = aE(X)+b" }
    },
    {
      step: 13,
      narration: "분산 증명! 분산은 흩어진 정도를 뜻해. 모든 점수에 똑같이 b점을 더해봤자 간격은 변하지 않아서 b는 버려져! 대신 a를 곱한 건 분산 공식이 '제곱'의 평균이라서 <red>a의 제곱</red>으로 튀어나온단다!",
      visuals: { title: "분산 변환 공식 증명", math: "V(aX+b) = E((aX+b - (am+b))^2) = a^2 E((X-m)^2) = a^2 V(X)" }
    },
    {
      step: 14,
      narration: "마지막으로 <green>표준편차</green>! 분산에 루트를 씌운 거니까, a제곱은 그냥 절댓값 a로 풀려나와. 그래서 절댓값 a에 원래 표준편차를 곱해주기만 하면 돼!",
      visuals: { title: "표준편차 변환 공식", math: "\\sigma(aX+b) = \\sqrt{a^2 V(X)} = |a|\\sigma(X)" }
    },
    {
      step: 15,
      narration: "이제 변환 예제 3연타! 예제 5번! 원래 평균이 10일 때, 2X-5의 평균은? 방금 배운 공식대로 10에 2를 곱하고 5를 빼면 되니까, 정답은 15!",
      visuals: { title: "예제 5: 기댓값의 변환", math: "\\begin{array}{l} \\text{\\textbf{Q.} } E(X)=10 \\text{ 일 때, } E(2X-5)\\text{는?} \\\\ \\\\ \\implies 2E(X) - 5 = 2(10) - 5 = 15 \\end{array}" }
    },
    {
      step: 16,
      narration: "예제 6번! 원래 분산이 4일 때, -3X+2의 분산은? 더하기 2는 간격에 영향을 안 주니 무시하고! -3의 제곱인 9를 원래 분산 4에 곱해주면, 9 곱하기 4는 36이 정답!",
      visuals: { title: "예제 6: 분산의 변환", math: "\\begin{array}{l} \\text{\\textbf{Q.} } V(X)=4 \\text{ 일 때, } V(-3X+2)\\text{는?} \\\\ \\\\ \\implies (-3)^2 V(X) = 9 \\times 4 = 36 \\end{array}" }
    },
    {
      step: 17,
      narration: "예제 7번! 분산이 9일 때, 4X-1의 표준편차는? 먼저 원래 분산 9에 루트를 씌워 표준편차가 3인 걸 구해. 그 다음 4의 절댓값인 4를 곱해주면, 정답은 12가 된단다!",
      visuals: { title: "예제 7: 표준편차의 변환", math: "\\begin{array}{l} \\text{\\textbf{Q.} } V(X)=9 \\text{ 일 때, } \\sigma(4X-1)\\text{는?} \\\\ \\\\ \\implies \\sigma(X)=3 \\implies |4| \\times 3 = 12 \\end{array}" }
    },
    {
      step: 18,
      narration: "마지막 예제 8번! 10개의 제품 중 불량품이 2개 섞여 있어. 여기서 3개를 꺼낼 때 나오는 불량품 개수 X의 분포를 표로 그려보는 문제야. 이런 게 시험에 아주 잘 나오지!",
      visuals: { title: "예제 8: 확률분포표 작성하기", math: "\\begin{array}{l} \\text{\\textbf{Q.} 불량품 2개 포함 10개 중 3개를 뽑을 때,} \\\\ \\text{불량품 개수 X의 확률분포는?} \\end{array}" }
    },
    {
      step: 19,
      narration: "먼저 전체 경우의 수는 10개 중 3개를 뽑는 10C3이야. 불량품이 0개 나올 확률은 정상 8개 중에서 3개를 뽑는 8C3을 분자에 올리면 돼!",
      visuals: { title: "예제 8 풀이 (1/3)", math: "P(X=0) = \\frac{{}_8\\mathrm{C}_3}{{}_{10}\\mathrm{C}_3} = \\frac{56}{120} = \\frac{7}{15}" }
    },
    {
      step: 20,
      narration: "불량품이 1개 나올 확률은, 불량품 2개 중 1개를 뽑고 정상 8개 중 2개를 뽑아야 하니까 2C1 곱하기 8C2가 분자가 되지!",
      visuals: { title: "예제 8 풀이 (2/3)", math: "P(X=1) = \\frac{{}_2\\mathrm{C}_1 \\times {}_8\\mathrm{C}_2}{{}_{10}\\mathrm{C}_3} = \\frac{2 \\times 28}{120} = \\frac{7}{15}" }
    },
    {
      step: 21,
      narration: "불량품 2개 나올 확률도 구해서 세 확률을 더해보면 완벽하게 1이 나오는 걸 볼 수 있어! 이렇게 표를 그리고 나면 평균과 분산은 앞서 배운 공식으로 쉽게 구할 수 있단다. 참 잘했어요!",
      visuals: { title: "예제 8 풀이 (3/3)", math: "P(X=2) = \\frac{{}_2\\mathrm{C}_2 \\times {}_8\\mathrm{C}_1}{{}_{10}\\mathrm{C}_3} = \\frac{8}{120} = \\frac{1}{15}" }
    }
  ]
};

fs.writeFileSync('./public/premium_lectures/이산확률변수.json', JSON.stringify(lectureData, null, 2));
console.log('Update completed for discrete random variables!');
