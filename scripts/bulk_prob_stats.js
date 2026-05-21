import fs from 'fs';

const conceptPath = './public/concept_cards/premium_lectures.json';
const conceptData = JSON.parse(fs.readFileSync(conceptPath, 'utf8'));
const statsList = conceptData['확률과통계'];

const newTopics = [
  {
    id: "확률의 덧셈정리",
    title: "확률의 덧셈정리와 여사건",
    content: "# 📌 확률의 덧셈정리와 여사건\n\n두 사건이 일어날 확률을 더하거나 뺄 때 쓰는 공식이에요. 교집합이 없는 배반사건의 개념과, '적어도'라는 말이 나올 때 쓰는 여사건의 확률을 배워요.\n\n## 1. 확률의 덧셈정리\n$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$\n\n## 2. 배반사건\n두 사건이 동시에 일어날 수 없을 때 ($P(A \\cap B) = 0$), $P(A \\cup B) = P(A) + P(B)$가 됩니다.\n\n## 3. 여사건의 확률\n사건 $A$가 일어나지 않을 확률은 $P(A^c) = 1 - P(A)$ 입니다. 주로 '적어도 ~일 확률'을 구할 때 아주 유용해요!"
  },
  {
    id: "조건부확률",
    title: "조건부확률과 곱셈정리",
    content: "# 📌 조건부확률\n\n사건 $A$가 일어났다는 전제 하에 사건 $B$가 일어날 확률을 말해요. 분모가 전체 표본공간에서 사건 $A$로 축소되는 것이 핵심이에요!\n\n## 1. 조건부확률의 정의\n$P(B|A) = \\frac{P(A \\cap B)}{P(A)}$ (단, $P(A) > 0$)\n\n## 2. 확률의 곱셈정리\n$P(A \\cap B) = P(A) \\times P(B|A)$\n연달아 일어나는 사건의 확률을 구할 때 사용합니다."
  },
  {
    id: "독립시행의 확률",
    title: "사건의 독립과 독립시행",
    content: "# 📌 사건의 독립과 독립시행의 확률\n\n앞의 결과가 뒤의 결과에 전혀 영향을 주지 않을 때 '독립'이라고 해요. 주사위나 동전을 여러 번 던지는 것이 대표적인 독립시행이에요.\n\n## 1. 독립과 종속\n두 사건 $A, B$가 독립이면 $P(A \\cap B) = P(A) \\times P(B)$가 성립합니다.\n\n## 2. 독립시행의 확률\n어떤 시행을 $n$번 반복할 때, 사건 $A$가 일어날 확률이 $p$라면, 사건 $A$가 $r$번 일어날 확률은:\n${}_n\\mathrm{C}_r p^r (1-p)^{n-r}$"
  },
  {
    id: "이산확률변수",
    title: "이산확률변수와 기댓값",
    content: "# 📌 이산확률변수\n\n확률변수가 가지는 값을 셀 수 있을 때 이산확률변수라고 해요. 확률분포표를 그리고 평균(기댓값), 분산, 표준편차를 구하는 방법을 배웁니다.\n\n## 1. 기댓값(평균) $E(X)$\n$E(X) = x_1p_1 + x_2p_2 + \\cdots + x_np_n$\n\n## 2. 분산 $V(X)$과 표준편차 $\\sigma(X)$\n- $V(X) = E(X^2) - \\{E(X)\\}^2$ (제곱의 평균 - 평균의 제곱)\n- $\\sigma(X) = \\sqrt{V(X)}$"
  },
  {
    id: "이항분포",
    title: "이항분포 B(n,p)",
    content: "# 📌 이항분포\n\n독립시행의 확률을 따르는 확률변수 $X$의 분포를 이항분포라고 해요. 평균과 분산을 구하는 아주 간단한 마법의 공식이 존재한답니다!\n\n## 이항분포 $B(n, p)$\n- $n$: 총 시행 횟수\n- $p$: 한 번 시행에서 사건이 일어날 확률\n\n## 평균과 분산\n- 평균 $E(X) = np$\n- 분산 $V(X) = npq$ (단, $q = 1-p$)\n- 표준편차 $\\sigma(X) = \\sqrt{npq}$"
  },
  {
    id: "정규분포",
    title: "연속확률변수와 정규분포",
    content: "# 📌 정규분포\n\n키, 몸무게처럼 연속적인 값을 가지는 변수의 분포예요. 종 모양의 부드러운 곡선을 가지며, 모든 정규분포는 '표준화'를 통해 쉽게 확률을 구할 수 있어요.\n\n## 1. 정규분포 $N(m, \\sigma^2)$\n평균 $m$에 대해 대칭인 종 모양 곡선이에요.\n\n## 2. 표준정규분포와 표준화\n평균이 0, 표준편차가 1인 정규분포 $N(0, 1)$을 표준정규분포라고 해요.\n어떤 정규분포든 $Z = \\frac{X - m}{\\sigma}$ 공식을 쓰면 표준화할 수 있어요!"
  },
  {
    id: "통계적 추정",
    title: "통계적 추정과 신뢰구간",
    content: "# 📌 통계적 추정\n\n전체 집단(모집단)을 다 조사하기 힘들 때, 일부(표본)만 뽑아서 전체의 평균을 추측하는 마법 같은 통계 기법이에요.\n\n## 1. 표본평균 $\\bar{X}$\n표본들의 평균이에요. 표본의 크기가 $n$일 때, $V(\\bar{X}) = \\frac{\\sigma^2}{n}$ 이 됩니다.\n\n## 2. 모평균 $m$의 신뢰구간\n표본평균 $\\bar{X}$를 이용해 진짜 평균 $m$이 있을 구간을 95% 확률로 추정해요.\n$\\bar{X} - 1.96 \\frac{\\sigma}{\\sqrt{n}} \\le m \\le \\bar{X} + 1.96 \\frac{\\sigma}{\\sqrt{n}}$"
  }
];

// Add to premium_lectures.json
newTopics.forEach(topic => {
  const idx = statsList.findIndex(x => x.id === topic.id);
  if (idx !== -1) {
    statsList[idx] = { ...statsList[idx], ...topic };
  } else {
    statsList.push(topic);
  }
});
fs.writeFileSync(conceptPath, JSON.stringify(conceptData, null, 2));

// Create lecture players
const lecturePlayers = {
  "확률의 덧셈정리": {
    id: "확률의 덧셈정리",
    title: "확률의 덧셈정리와 여사건",
    subject: "수학1 / 확통",
    steps: [
      {
        step: 1,
        narration: "안녕! 오늘은 <blue>확률의 덧셈정리</blue>를 배울 거야. 두 사건이 일어날 확률을 더할 때, 겹치는 교집합 부분을 한 번 빼주는 게 핵심이란다. 1학년 때 집합에서 배운 원소의 개수 구하는 공식이랑 완전 똑같지?",
        visuals: { title: "확률의 덧셈정리", math: "P(A \\cup B) = P(A) + P(B) - P(A \\cap B)" }
      },
      {
        step: 2,
        narration: "만약 두 사건이 절대로 동시에 일어날 수 없다면 어떨까? 교집합이 공집합인 이런 관계를 <green>배반사건</green>이라고 불러. 이때는 교집합 확률이 0이니까 고민할 필요 없이 그냥 두 확률을 덧셈만 하면 돼!",
        visuals: { title: "배반사건", math: "P(A \\cap B) = 0 \\implies P(A \\cup B) = P(A) + P(B)" }
      },
      {
        step: 3,
        narration: "문제에 '적어도 하나는~' 이라는 말이 나오면 반사적으로 <blue>여사건의 확률</blue>을 떠올려야 해! 전체 확률 1에서 그 사건이 일어나지 않을 확률을 빼주면 훨씬 빠르고 정확하게 정답을 구할 수 있단다.",
        visuals: { title: "여사건의 확률", math: "P(A^c) = 1 - P(A)" }
      }
    ]
  },
  "조건부확률": {
    id: "조건부확률",
    title: "조건부확률 마스터하기",
    subject: "수학1 / 확통",
    steps: [
      {
        step: 1,
        narration: "이번엔 엄청 중요하고 재밌는 <blue>조건부확률</blue>이야! 어떤 사건 A가 이미 일어났다는 전제 하에 사건 B가 일어날 확률을 말해. 전체 표본공간 분모가 S에서 A로 확 쪼그라드는 마법 같은 일이 벌어지지!",
        visuals: { title: "조건부확률", math: "P(B|A) = \\frac{P(A \\cap B)}{P(A)}" }
      },
      {
        step: 2,
        narration: "조건부확률 식의 양변에 분모 P(A)를 스윽 곱해주면 <green>확률의 곱셈정리</green>가 탄생해. 비가 온 다음 날 또 비가 올 확률처럼, 연달아 일어나는 사건의 확률을 곱해서 구할 때 아주 유용하단다.",
        visuals: { title: "확률의 곱셈정리", math: "P(A \\cap B) = P(A) \\times P(B|A)" }
      }
    ]
  },
  "독립시행의 확률": {
    id: "독립시행의 확률",
    title: "독립과 종속, 그리고 독립시행",
    subject: "수학1 / 확통",
    steps: [
      {
        step: 1,
        narration: "동전을 두 번 던질 때 첫 번째에 앞면이 나왔다고 두 번째 결과가 달라질까? 전혀 아니지! 이렇게 서로 아무 영향을 안 주는 걸 <blue>사건의 독립</blue>이라고 해. 독립일 때는 교집합 확률이 그냥 두 확률의 곱이랑 완벽히 똑같아져.",
        visuals: { title: "사건의 독립", math: "P(A \\cap B) = P(A) \\times P(B)" }
      },
      {
        step: 2,
        narration: "주사위를 10번 던져서 3의 배수가 4번 나올 확률은 어떻게 구할까? 바로 <green>독립시행의 확률</green> 공식이야! 10번 중 4번을 고르는 조합 10C4에 일어날 확률 4제곱, 안 일어날 확률 6제곱을 예쁘게 곱해주면 완성이란다.",
        visuals: { title: "독립시행의 확률", math: "{}_n\\mathrm{C}_r p^r (1-p)^{n-r}" }
      }
    ]
  },
  "이산확률변수": {
    id: "이산확률변수",
    title: "이산확률분포와 기댓값",
    subject: "수학1 / 확통",
    steps: [
      {
        step: 1,
        narration: "이제부터는 본격적인 통계의 세계야! 주사위 눈의 수처럼 딱딱 끊어져서 셀 수 있는 변수를 <blue>이산확률변수</blue>라고 해. 이 변수들의 확률을 표로 예쁘게 정리한 게 바로 확률분포표란다.",
        visuals: { title: "이산확률변수", math: "\\sum p_i = 1" }
      },
      {
        step: 2,
        narration: "가장 중요한 평균, 즉 <green>기댓값</green>은 표에서 변수와 확률을 위아래로 짝지어 곱해서 싹 다 더하면 돼. <blue>분산</blue>은 변수를 제곱해서 평균을 낸 다음, 원래 평균의 제곱을 빼주면 돼. 선생님은 이걸 '제평평제'라고 부르지!",
        visuals: { title: "평균과 분산", math: "E(X) = \\sum x_i p_i \\,, \\quad V(X) = E(X^2) - \\{E(X)\\}^2" }
      }
    ]
  },
  "이항분포": {
    id: "이항분포",
    title: "마법의 이항분포",
    subject: "수학1 / 확통",
    steps: [
      {
        step: 1,
        narration: "독립시행을 따르는 확률변수는 정말 특별해서 <blue>이항분포</blue>라는 멋진 이름을 붙여줬어. 전체 횟수 n과 한 번의 확률 p만 있으면 알파벳 B 뒤에 B(n,p)라고 간단히 쓸 수 있지.",
        visuals: { title: "이항분포", math: "X \\sim B(n, p)" }
      },
      {
        step: 2,
        narration: "이항분포가 진짜 대박인 이유는 평균과 분산을 구하기가 눈물 나게 쉽기 때문이야! 복잡한 표를 그릴 필요 없이 평균은 그냥 두 숫자 <green>np</green>를 곱하면 끝이고, 분산은 거기에 실패할 확률 q까지 곱해서 <green>npq</green>만 계산하면 끝이란다!",
        visuals: { title: "이항분포의 평균과 분산", math: "E(X) = np \\,, \\quad V(X) = npq" }
      }
    ]
  },
  "정규분포": {
    id: "정규분포",
    title: "정규분포와 표준화",
    subject: "수학1 / 확통",
    steps: [
      {
        step: 1,
        narration: "키나 몸무게처럼 소수점까지 빈틈없이 이어지는 연속확률변수는 종 모양의 예쁜 곡선을 그려. 이걸 <blue>정규분포</blue>라고 부른단다. 가운데 평균을 기준으로 완벽하게 좌우 대칭인 아주 듬직하고 예쁜 산 모양이지.",
        visuals: { title: "정규분포", math: "X \\sim N(m, \\sigma^2)" }
      },
      {
        step: 2,
        narration: "정규분포의 확률을 구하려면 딱 하나만 외우면 돼! 바로 <green>표준화 공식 Z</green>야. 내 점수 X에서 평균을 빼고 표준편차로 나눠주면, 세상의 모든 서로 다른 정규분포를 똑같은 하나의 기준표로 한눈에 쉽게 비교할 수 있단다.",
        visuals: { title: "표준화", math: "Z = \\frac{X - m}{\\sigma}" }
      }
    ]
  },
  "통계적 추정": {
    id: "통계적 추정",
    title: "통계적 추정과 신뢰구간",
    subject: "수학1 / 확통",
    steps: [
      {
        step: 1,
        narration: "드디어 통계의 마지막 꽃, <blue>추정</blue> 파트야! 전국의 모든 학생 성적을 다 조사하기 힘들 때, 100명만 딱 뽑아서 진짜 평균을 추리해보는 명탐정 코난 같은 기법이지. 여기서 뽑힌 100명의 평균을 우리는 <green>표본평균</green>이라고 불러.",
        visuals: { title: "모집단과 표본", math: "V(\\bar{X}) = \\frac{\\sigma^2}{n}" }
      },
      {
        step: 2,
        narration: "그럼 진짜 평균이 어디쯤 숨어있을지 95% 확률로 맞혀볼까? 표본평균에서 1.96 곱하기 루트 n분의 시그마를 양쪽으로 빼고 더해주면 돼. 이게 바로 그 유명한 <green>신뢰구간</green> 공식이야. 조금 길고 복잡해 보여도 선생님이랑 몇 번 연습하다 보면 금방 술술 외워질 거야!",
        visuals: { title: "모평균의 신뢰구간 (95%)", math: "m \\in \\left[ \\bar{X} - 1.96 \\frac{\\sigma}{\\sqrt{n}} \\,, \\; \\bar{X} + 1.96 \\frac{\\sigma}{\\sqrt{n}} \\right]" }
      }
    ]
  }
};

Object.entries(lecturePlayers).forEach(([key, data]) => {
  fs.writeFileSync(`./public/premium_lectures/${key}.json`, JSON.stringify(data, null, 2));
});

console.log('Bulk generation completed!');
