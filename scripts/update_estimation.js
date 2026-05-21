import fs from 'fs';

const conceptPath = './public/concept_cards/premium_lectures.json';
const conceptData = JSON.parse(fs.readFileSync(conceptPath, 'utf8'));
const statsList = conceptData['확률과통계'];

const detailedContent = JSON.parse(fs.readFileSync('./scripts/data_estimation.json', 'utf8')).content;

const idx = statsList.findIndex(x => x.id === "통계적 추정");
if (idx !== -1) {
  statsList[idx].content = detailedContent;
  statsList[idx].title = "모평균의 추정과 표본 마스터 특강";
}

fs.writeFileSync(conceptPath, JSON.stringify(conceptData, null, 2));

const lectureData = {
  id: "통계적 추정",
  title: "표본평균과 모평균의 추정 완벽 분석",
  subject: "수학1 / 확통",
  steps: [
    {
      step: 1,
      narration: "안녕! 드디어 확률과 통계의 마지막, 대망의 <blue>통계적 추정</blue>이야. 현실에서는 대한민국의 모든 고등학생 키를 잴 수 없잖아? 그래서 100명만 뽑아서 전체를 '추측'해보는 마법을 배울 거야!",
      visuals: { title: "통계적 추정 (Statistical Estimation)", math: "\\text{일부(표본)를 통해 전체(모집단)를 알아내기}" }
    },
    {
      step: 2,
      narration: "이때 뽑은 100명을 <green>표본</green>이라고 하고, 이 100명의 숫자인 크기 n을 표본의 크기라고 해. 그리고 이 100명 키의 평균을 구한 것을 바로 <blue>표본평균(X 바)</blue>라고 부른단다!",
      visuals: { title: "표본평균 (Sample Mean)", math: "\\bar{X} = \\frac{X_1 + X_2 + \\cdots + X_n}{n} \\quad \\text{(크기가 } n\\text{인 표본)}" }
    },
    {
      step: 3,
      narration: "그런데 100명을 뽑을 때마다 평균은 170도 나왔다가 169도 나왔다가 계속 바뀌겠지? 그래서 표본평균 X바 역시 확률변수처럼 고유한 종 모양의 분포를 갖게 돼. 자, 그럼 이 X바들의 평균과 분산은 어떻게 될까?",
      visuals: { title: "표본평균도 확률변수다!", math: "\\bar{X} \\text{ 들도 흩어짐을 가진 분포를 이룬다.}" }
    },
    {
      step: 4,
      narration: "X바들을 무한히 많이 구해서 싹 다 평균을 내면! 놀랍게도 진짜 전체 평균인 <red>모평균 m</red>과 완벽하게 똑같아져! 부분들의 평균을 다시 평균 내면 결국 전체가 된다는 직관적인 원리지.",
      visuals: { title: "표본평균의 평균", math: "E(\\bar{X}) = m \\quad \\text{(모평균과 일치)}" }
    },
    {
      step: 5,
      narration: "하지만 분산은 달라! 100명을 뽑아서 평균을 내면, 키가 2미터인 학생과 1미터인 학생이 서로 상쇄돼서 극단적인 값이 확 줄어들어. 그래서 분산은 원래 분산을 <blue>표본의 크기 n으로 나눈 값</blue>으로 확 쪼그라든단다!",
      visuals: { title: "표본평균의 분산", math: "V(\\bar{X}) = \\frac{\\sigma^2}{n} \\implies \\text{데이터가 똘똘 뭉침!}" }
    },
    {
      step: 6,
      narration: "분산에 루트를 씌우면 표준편차가 되니까, X바의 표준편차는 <green>원래 시그마를 루트 n으로 나눈 값</green>이 되겠지? 이제 원래 정규분포가 표본평균의 정규분포로 어떻게 변신하는지 보여줄게!",
      visuals: { title: "모집단과 표본평균의 정규분포", math: "X \\sim N(m, \\sigma^2) \\implies \\bar{X} \\sim N\\left(m, \\left(\\frac{\\sigma}{\\sqrt{n}}\\right)^2\\right)" }
    },
    {
      step: 7,
      narration: "개념을 잡았으니 표본평균 관련 실전 예제 5가지를 풀어보자! 예제 1번, 평균이 50, 시그마가 10인데 여기서 크기 25인 표본을 뽑았어. X바의 평균과 분산은?",
      visuals: { title: "예제 1: 기본 공식 적용", math: "\\begin{array}{l} \\text{\\textbf{Q1.} } m=50, \\sigma=10 \\text{인 모집단에서 크기 } n=25 \\\\ \\text{표본을 추출할 때, } E(\\bar{X})\\text{와 } V(\\bar{X})\\text{는?} \\end{array}" }
    },
    {
      step: 8,
      narration: "평균은 원래 평균이랑 똑같으니까 50! 분산은 원래 분산인 100을 표본 크기 25로 나눠주면 되니까 4가 되지. 너무 쉽지?",
      visuals: { title: "예제 1 풀이", math: "\\begin{array}{l} E(\\bar{X}) = m = 50 \\\\ V(\\bar{X}) = \\frac{10^2}{25} = \\frac{100}{25} = 4 \\end{array}" }
    },
    {
      step: 9,
      narration: "예제 2번! 평균 50, 시그마 10인 집단에서 25명을 뽑았을 때, 그 25명의 평균 점수가 54점 이상일 확률은? 방금 구한 분산 4(표준편차 2)를 써서 Z값으로 바꾸면 돼!",
      visuals: { title: "예제 2: 표본평균의 확률 계산", math: "\\begin{array}{l} \\text{\\textbf{Q2.} } X \\sim N(50, 10^2)\\text{에서 } n=25\\text{일 때, } P(\\bar{X} \\ge 54)\\text{?} \\\\ \\\\ \\implies \\bar{X} \\sim N(50, 2^2) \\text{ 로 변신!} \\\\ P(Z \\ge \\frac{54-50}{2}) = P(Z \\ge 2) = 0.0228 \\end{array}" }
    },
    {
      step: 10,
      narration: "예제 3번! 확률이 주어졌을 때 n을 역으로 추적하기. X바가 48 이하일 확률이 0.1587이래. 이건 Z가 -1일 때니까, (48-50)을 루트n분의 시그마로 나눈 게 -1이 되어야 해!",
      visuals: { title: "예제 3: 표본 크기 n 추론", math: "\\begin{array}{l} \\text{\\textbf{Q3.} } X \\sim N(50, 10^2)\\text{에서 } P(\\bar{X} \\le 48) = 0.1587 \\text{일 때 } n\\text{?} \\\\ \\\\ \\implies P(Z \\le -1) = 0.1587 \\implies \\frac{48-50}{10/\\sqrt{n}} = -1 \\\\ \\implies \\frac{\\sqrt{n}}{5} = 1 \\implies \\sqrt{n} = 5 \\implies n = 25 \\end{array}" }
    },
    {
      step: 11,
      narration: "예제 4번! 1, 2, 3이 적힌 공을 2번 뽑을 때 표본평균이 2가 될 확률. 표본평균이 2라는 건 두 공의 합이 4라는 뜻이야! (1,3), (2,2), (3,1) 세 가지 경우가 있지.",
      visuals: { title: "예제 4: 이산분포의 표본추출", math: "\\begin{array}{l} \\text{\\textbf{Q4.} 공 1, 2, 3에서 크기 } n=2 \\text{를 복원추출할 때 } P(\\bar{X}=2)\\text{?} \\\\ \\\\ \\implies \\bar{X}=2 \\implies X_1+X_2=4 \\\\ \\text{경우의 수: } (1,3), (2,2), (3,1) \\implies \\frac{3}{9} = \\frac{1}{3} \\end{array}" }
    },
    {
      step: 12,
      narration: "예제 5번! 모집단 그래프와 표본평균 그래프 모양 비교야. X바는 분산이 n분의 1로 줄어들기 때문에, 평균 근처에 데이터가 빽빽하게 뭉치면서 산봉우리가 훨씬 뾰족하고 높게 솟아오른단다!",
      visuals: { title: "예제 5: 모집단과 표본의 형태 비교", math: "\\begin{array}{l} \\text{\\textbf{Q5.} } X\\text{와 } \\bar{X}\\text{의 그래프 중 가운데가 더 높은 것은?} \\\\ \\\\ \\implies V(\\bar{X}) = \\frac{V(X)}{n} < V(X) \\\\ \\implies \\text{분산이 더 작은 } \\bar{X}\\text{의 그래프가 더 높이 솟아오른다!} \\end{array}" }
    },
    {
      step: 13,
      narration: "이제 이 단원의 하이라이트, <red>모평균의 추정</red>이야! 현실에서는 전체 평균 m을 절대 모르기 때문에, 우리가 뽑은 100명의 표본평균 X바를 딱 하나 구해서 진짜 평균이 있을 위치를 어림짐작하는 거지.",
      visuals: { title: "모평균의 추정 (Estimation)", math: "\\text{구해진 } \\bar{X}\\text{ 값 하나로 진짜 } m \\text{ 의 범위를 그물망 치기!}" }
    },
    {
      step: 14,
      narration: "그물을 치는 공식은 아주 아름다워. 내가 구한 X바에서 일정 값어치를 빼고 더한 범위 안에 진짜 평균 m이 들어있을 거라고 선언하는 거야! 이때 양옆으로 더하고 빼는 길이는 신뢰도에 따라 달라져.",
      visuals: { title: "신뢰구간 공식", math: "\\bar{X} - k \\frac{\\sigma}{\\sqrt{n}} \\le m \\le \\bar{X} + k \\frac{\\sigma}{\\sqrt{n}}" }
    },
    {
      step: 15,
      narration: "여기서 k는 신뢰도 상수야! 그물을 넓게 칠수록(99%) 빗나갈 확률은 줄어들지만 구간이 너무 넓어져서 쓸모가 없어지고, 좁게 칠수록(95%) 빗나갈 위험은 있지만 정밀해지지. 이것이 신뢰도와 정밀도의 딜레마야!",
      visuals: { title: "신뢰도 상수 k의 비밀", math: "\\begin{array}{l} \\text{95\\% 신뢰도 } \\implies k = 1.96 \\\\ \\text{99\\% 신뢰도 } \\implies k = 2.58 \\\\ \\\\ k\\uparrow \\implies \\text{안전하지만 그물이 무식하게 넓어짐!} \\end{array}" }
    },
    {
      step: 16,
      narration: "자, 이제 수능에서 쏟아지는 추정 예제 8가지를 모두 박살내 볼게! 예제 6번, 100명을 뽑았더니 평균이 60이었어. 95% 신뢰구간을 구해볼까?",
      visuals: { title: "예제 6: 95% 신뢰구간 구하기", math: "\\begin{array}{l} \\text{\\textbf{Q6.} } n=100, \\bar{x}=60, \\sigma=10\\text{일 때 95\\% 신뢰구간은?} \\\\ \\text{(단, } k=1.96 \\text{)} \\end{array}" }
    },
    {
      step: 17,
      narration: "공식에 그대로 넣으면 돼! 루트 100분의 10은 1이니까, 60에서 1.96을 빼고 더해주면 끝! 진짜 평균은 58.04에서 61.96 사이에 95%의 확률로 존재할 거야!",
      visuals: { title: "예제 6 풀이", math: "\\begin{array}{l} 60 - 1.96\\left(\\frac{10}{\\sqrt{100}}\\right) \\le m \\le 60 + 1.96\\left(\\frac{10}{\\sqrt{100}}\\right) \\\\ \\implies 58.04 \\le m \\le 61.96 \\end{array}" }
    },
    {
      step: 18,
      narration: "예제 7번! 이번엔 같은 조건에서 99% 신뢰구간! k값만 2.58로 바꾸면 되겠지? 60에서 2.58을 빼고 더하니까 구간이 아까보다 더 넓어진 걸 확인할 수 있어!",
      visuals: { title: "예제 7: 99% 신뢰구간 구하기", math: "\\begin{array}{l} \\text{\\textbf{Q7.} 위 조건에서 99\\% 신뢰구간은? (} k=2.58 \\text{)} \\\\ \\\\ 60 - 2.58(1) \\le m \\le 60 + 2.58(1) \\\\ \\implies 57.42 \\le m \\le 62.58 \\text{ (더 넓어짐!)} \\end{array}" }
    },
    {
      step: 19,
      narration: "예제 8번! 신뢰구간의 길이를 구하래! 구간의 길이는 최대값에서 최소값을 뺀 거니까, 뒤에 더해줬던 꼬리 부분의 정확히 2배가 돼! 공식은 2 곱하기 k 곱하기 루트n분의 시그마!",
      visuals: { title: "예제 8: 신뢰구간의 길이", math: "\\begin{array}{l} \\text{\\textbf{Q8.} } n=16, \\sigma=4 \\text{일 때 95\\% 신뢰구간의 길이는?} \\\\ \\\\ l = 2 \\times 1.96 \\times \\frac{4}{\\sqrt{16}} = 2 \\times 1.96 \\times 1 = 3.92 \\end{array}" }
    },
    {
      step: 20,
      narration: "예제 9번! 신뢰구간의 길이가 2 이하가 되려면 표본을 몇 명 이상 뽑아야 할까? 공식을 부등식으로 세우고 풀어보면 돼. 표본을 많이 뽑을수록 구간은 좁아지고 정밀해지거든!",
      visuals: { title: "예제 9: 원하는 구간 길이를 위한 표본 크기", math: "\\begin{array}{l} \\text{\\textbf{Q9.} } \\sigma=5, k=2 \\text{일 때, 길이가 2 이하가 되기 위한 최소 } n\\text{?} \\\\ \\\\ 2 \\times 2 \\times \\frac{5}{\\sqrt{n}} \\le 2 \\implies \\frac{20}{\\sqrt{n}} \\le 2 \\\\ \\implies \\sqrt{n} \\ge 10 \\implies n \\ge 100\\text{명} \\end{array}" }
    },
    {
      step: 21,
      narration: "예제 10번! 진짜 엄청 잘 나오는 꿀팁 문제야. 어떤 신뢰구간이 [120.5, 129.5]로 주어졌어. 이때 내가 구했던 표본평균 X바는? 무조건 구간의 정중앙에 위치하니까 둘을 더해서 반으로 나누면 끝!",
      visuals: { title: "예제 10: 구간을 보고 표본평균 역추적", math: "\\begin{array}{l} \\text{\\textbf{Q10.} 95\\% 신뢰구간이 } [120.5, 129.5] \\text{ 일 때 } \\bar{X}\\text{는?} \\\\ \\\\ \\bar{X} = \\frac{120.5 + 129.5}{2} = 125 \\end{array}" }
    },
    {
      step: 22,
      narration: "예제 11번! 표본의 크기 n을 무려 4배로 늘렸어. 그럼 구간의 길이는 어떻게 될까? 공식 분모에 루트 n이 있으니까, 4배가 들어가면 루트 밖으로 2로 나오지! 즉 구간 길이는 절반(1/2)으로 줄어들어!",
      visuals: { title: "예제 11: 표본 크기 변화에 따른 길이", math: "\\begin{array}{l} \\text{\\textbf{Q11.} 표본의 크기를 4배로 늘리면 신뢰구간 길이는?} \\\\ \\\\ l_{new} = 2k \\frac{\\sigma}{\\sqrt{4n}} = \\frac{1}{2} \\left(2k \\frac{\\sigma}{\\sqrt{n}}\\right) = \\frac{1}{2} l \\end{array}" }
    },
    {
      step: 23,
      narration: "예제 12번! 신뢰도를 95%에서 99%로 올리면서도(k 증가) 구간 길이를 똑같이 유지하고 싶대. 분자가 커졌으니 분모인 루트 n도 그만큼 키워줘야겠지? n을 더 많이 뽑아야 한다는 뜻이야!",
      visuals: { title: "예제 12: 신뢰도와 표본 크기의 줄다리기", math: "\\begin{array}{l} \\text{\\textbf{Q12.} 신뢰도를 높이면서 구간 길이를 유지하려면?} \\\\ \\\\ l = 2k \\frac{\\sigma}{\\sqrt{n}} \\text{ 에서 } k\\text{가 커졌으므로} \\\\ \\text{비율을 맞추기 위해 } n\\text{도 크게 늘려야 한다!} \\end{array}" }
    },
    {
      step: 24,
      narration: "마지막 예제 13번! 공장에서 만든 전구 100개를 뽑았더니 평균 수명이 500시간, 표준편차가 40시간이었대. 이때 공장 전체 전구의 평균 수명에 대한 95% 신뢰구간은? 방금 배운 거 총출동!",
      visuals: { title: "예제 13: 실생활 서술형 총정리", math: "\\begin{array}{l} \\text{\\textbf{Q13.} } n=100, \\bar{X}=500, \\text{표본표준편차}=40 \\text{일 때 95\\% 구간?} \\end{array}" }
    },
    {
      step: 25,
      narration: "표본의 크기가 충분히 크면 표본표준편차를 모표준편차 시그마 대신 쓸 수 있어! 500에서 1.96 곱하기 100분의 40을 빼고 더하면 완벽한 실생활 추정이 완성된단다!",
      visuals: { title: "예제 13 풀이", math: "\\begin{array}{l} m \\text{ 은 다음 구간에 속한다.} \\\\ 500 - 1.96\\left(\\frac{40}{10}\\right) \\le m \\le 500 + 1.96\\left(\\frac{40}{10}\\right) \\\\ \\implies 492.16 \\le m \\le 507.84 \\end{array}" }
    },
    {
      step: 26,
      narration: "자, 여기까지가 확률과 통계의 진짜 마지막이었어! 통계적 추정은 공식 두 개만 제대로 외우면 수능에서 10초 만에 푸는 꿀단원이야. 선생님이랑 함께 해줘서 정말 고마워! 확통 마스터를 축하해!",
      visuals: { title: "확률과 통계 완강!", math: "\\text{Thank you for watching!}" }
    }
  ]
};

fs.writeFileSync('./public/premium_lectures/통계적 추정.json', JSON.stringify(lectureData, null, 2));
console.log('Deeply expanded Statistical Estimation lecture created!');
