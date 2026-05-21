import fs from 'fs';

const conceptPath = './public/concept_cards/premium_lectures.json';
const conceptData = JSON.parse(fs.readFileSync(conceptPath, 'utf8'));
const statsList = conceptData['확률과통계'];

const detailedContent = JSON.parse(fs.readFileSync('./scripts/data_ind.json', 'utf8')).content;

const idx = statsList.findIndex(x => x.id === "독립시행의 확률");
if (idx !== -1) {
  statsList[idx].content = detailedContent;
  statsList[idx].title = "독립사건과 독립시행의 확률";
}

fs.writeFileSync(conceptPath, JSON.stringify(conceptData, null, 2));

const lectureData = {
  id: "독립시행의 확률",
  title: "독립사건과 독립시행 완벽 마스터",
  subject: "수학1 / 확통",
  steps: [
    {
      step: 1,
      narration: "안녕! 이번 시간에는 확통에서 제일 매력적인 파트, <blue>사건의 독립</blue>과 <green>독립시행의 확률</green>을 완벽하게 파헤쳐 볼 거야. 선생님이 아주 꼼꼼하게 증명부터 예제까지 다 준비했으니 잘 따라와!",
      visuals: { title: "사건의 독립과 독립시행", math: "\\text{Independent Events \\& Independent Trials}" }
    },
    {
      step: 2,
      narration: "먼저 '독립'이 뭘까? 사건 A가 일어나든 말든, 사건 B가 일어날 확률에 <red>단 1%의 영향도 주지 않을 때</red> 우리는 두 사건을 독립이라고 해. 서로 완전히 남남인 거지!",
      visuals: { title: "독립(Independent)의 정의", math: "P(B|A) = P(B) \\,, \\quad P(B|A^c) = P(B)" }
    },
    {
      step: 3,
      narration: "그럼 왜 독립사건은 두 확률을 그냥 곱하면 교집합의 확률이 되는 걸까? 아주 멋진 증명을 보여줄게. 조금 전 배웠던 <blue>조건부확률의 공식</blue>에서 출발해 보자.",
      visuals: { title: "독립사건 곱셈공식 증명 (1/2)", math: "P(B|A) = \\frac{P(A \\cap B)}{P(A)}" }
    },
    {
      step: 4,
      narration: "두 사건이 서로 독립이니까, A가 일어났다는 조건이 B에게 아무 의미가 없어! 즉, 좌변의 P(B 바 A)가 그냥 P(B)로 변신하는 거야. 이제 양변에 분모인 P(A)를 스윽 곱해주면?",
      visuals: { title: "독립사건 곱셈공식 증명 (2/2)", math: "\\color{blue}{P(B)} = \\frac{P(A \\cap B)}{P(A)} \\implies \\color{red}{P(A \\cap B) = P(A) \\times P(B)}" }
    },
    {
      step: 5,
      narration: "짜잔! 교집합의 확률은 두 확률을 그냥 곱한 것과 같다는 완벽한 공식이 증명됐어! 이제 이 원리를 활용해서 <green>독립사건 실전 예제 5개</green>를 연속으로 풀어보자!",
      visuals: { title: "증명 완료!", math: "P(A \\cap B) = P(A) \\times P(B)" }
    },
    {
      step: 6,
      narration: "예제 1번! 동전 한 개와 주사위 한 개를 던질 때, 동전은 앞면, 주사위는 짝수가 나올 확률이야. 동전과 주사위는 서로 아무 영향을 안 주니까 완벽한 독립이지! 2분의 1과 2분의 1을 곱해서 4분의 1이 정답!",
      visuals: { title: "독립사건 예제 1 (동전과 주사위)", math: "\\frac{1}{2} \\times \\frac{1}{2} = \\frac{1}{4}" }
    },
    {
      step: 7,
      narration: "예제 2번, 주머니에서 구슬을 뽑고 <blue>다시 넣은 뒤</blue> 또 뽑기! 다시 넣었으니까 매번 상황이 초기화되어서 독립이야. 빨간 구슬을 뽑을 확률이 10분의 3이라면 두 번 연속 뽑을 확률은 100분의 9가 되지.",
      visuals: { title: "독립사건 예제 2 (복원 추출)", math: "\\frac{3}{10} \\times \\frac{3}{10} = \\frac{9}{100}" }
    },
    {
      step: 8,
      narration: "예제 3번, 독립인지 종속인지 판별하기! 주사위에서 홀수가 나오는 사건 A의 확률 1/2, 소수가 나오는 사건 B의 확률 1/2이야. 교집합인 {3,5}의 확률은 2/6, 즉 1/3이지? 1/2 곱하기 1/2은 1/3과 다르니까 이건 <red>종속</red>이야!",
      visuals: { title: "독립사건 예제 3 (판별)", math: "P(A)P(B) = \\frac{1}{4} \\neq P(A \\cap B) = \\frac{1}{3} \\implies \\text{종속(Dependent)}" }
    },
    {
      step: 9,
      narration: "예제 4번! 철수가 합격할 확률 0.6, 영희가 0.8이야. 둘이 컨닝을 안 한다면 합격 여부는 서로 독립! 둘 다 합격할 확률은 깔끔하게 0.6 곱하기 0.8을 해서 0.48이 된단다.",
      visuals: { title: "독립사건 예제 4 (합격 확률)", math: "0.6 \\times 0.8 = 0.48" }
    },
    {
      step: 10,
      narration: "독립사건 마지막 예제 5번! A사냥꾼의 명중률은 1/2, B는 2/3이야. 동시에 쐈을 때 새가 맞을 확률은? 이건 '적어도 한 명이 맞히는 사건'의 여사건으로 푸는 게 핵심이야. 1에서 둘 다 빗나갈 확률을 빼면 6분의 5!",
      visuals: { title: "독립사건 예제 5 (여사건 활용)", math: "1 - P(A\\text{실패} \\cap B\\text{실패}) = 1 - \\left(\\frac{1}{2} \\times \\frac{1}{3}\\right) = \\frac{5}{6}" }
    },
    {
      step: 11,
      narration: "휴~ 잘 따라왔어! 이제 본격적으로 <blue>독립시행의 확률</blue>로 넘어가 볼까? 독립시행이란 주사위를 여러 번 던지는 것처럼, 같은 짓을 여러 번 반복할 때 매번 결과가 서로 독립인 경우를 말해.",
      visuals: { title: "독립시행(Independent Trials)", math: "\\text{동일한 조건에서 여러 번 반복되는 독립 사건}" }
    },
    {
      step: 12,
      narration: "n번 중에 내가 원하는 사건이 딱 r번 일어날 확률을 구하는 공식이야. 확률 p를 r번 곱하고, 실패 확률 1-p를 n-r번 곱하는 것까지는 이해가 되지? 그런데 왜 앞에 <green>조합 nCr</green>이 곱해져 있을까?",
      visuals: { title: "독립시행의 확률 공식", math: "P(X=r) = {}_{n}\\mathrm{C}_{r} \\, p^r (1-p)^{n-r}" }
    },
    {
      step: 13,
      narration: "바로 <blue>언제 성공했는지 순서를 고려해 주어야 하기 때문</blue>이야! 5번 중에 3번 성공했다면, O O O X X 인지 O X O X O 인지 그 순서를 골라주는 경우의 수가 바로 5C3이거든! 정말 놀랍도록 딱 맞아떨어지지?",
      visuals: { title: "왜 조합(C)을 곱할까?", math: "\\text{5번 중 3번 성공하는 순서의 가짓수} = {}_{5}\\mathrm{C}_{3}" }
    },
    {
      step: 14,
      narration: "이제 이 공식을 무기로 <green>독립시행 실전 예제 5개</green>를 박살내 보자! 예제 1번! 주사위를 4번 던져서 3의 배수가 딱 1번 나올 확률은? 4C1 곱하기 3분의 1의 1제곱, 3분의 2의 3제곱을 하면 81분의 32가 정답!",
      visuals: { title: "독립시행 예제 1 (주사위)", math: "{}_{4}\\mathrm{C}_{1} \\left(\\frac{1}{3}\\right)^1 \\left(\\frac{2}{3}\\right)^3 = \\frac{32}{81}" }
    },
    {
      step: 15,
      narration: "예제 2번! 동전을 5번 던져서 앞면이 딱 3번 나올 확률. 5C3 곱하기 2분의 1의 3제곱, 다시 2분의 1의 2제곱을 하면 돼. 계산하면 32분의 10, 약분해서 16분의 5가 나오지.",
      visuals: { title: "독립시행 예제 2 (동전)", math: "{}_{5}\\mathrm{C}_{3} \\left(\\frac{1}{2}\\right)^3 \\left(\\frac{1}{2}\\right)^2 = \\frac{10}{32} = \\frac{5}{16}" }
    },
    {
      step: 16,
      narration: "예제 3번은 윷놀이야! 윷가락 한 개가 평평한 면이 나올 확률을 0.6이라고 할게. 4개를 동시에 던져서 전부 다 평평한 '윷'이 나올 확률은? 4C4 곱하기 0.6의 4제곱, 0.4의 0제곱이라서 0.1296이야.",
      visuals: { title: "독립시행 예제 3 (윷놀이)", math: "{}_{4}\\mathrm{C}_{4} (0.6)^4 (0.4)^0 = 0.1296" }
    },
    {
      step: 17,
      narration: "예제 4번! 명중률이 4분의 3인 다트를 3번 던져서 적어도 1번 명중할 확률. '적어도'가 나왔으니 여사건이지! 전체 1에서 3번 모두 실패할 확률인 3C0 곱하기 실패 확률 1/4의 3제곱을 빼주면 64분의 63이 된단다.",
      visuals: { title: "독립시행 예제 4 (여사건 활용)", math: "1 - {}_{3}\\mathrm{C}_{0} \\left(\\frac{1}{4}\\right)^3 = 1 - \\frac{1}{64} = \\frac{63}{64}" }
    },
    {
      step: 18,
      narration: "대망의 예제 5번! 실력이 똑같은 두 팀이 7전 4선승제 경기를 해. A팀이 <blue>딱 4번째 경기에서 우승을 확정 지을 확률</blue>은? 이 문제는 함정이 있어. 앞의 3경기에서 3승을 미리 다 채우고 마지막 4번째를 이겨야 해!",
      visuals: { title: "독립시행 예제 5 (7전 4선승제)", math: "\\text{딱 4번째 경기에서 우승을 확정 지을 확률은?}" }
    },
    {
      step: 19,
      narration: "그러니까 3번째 경기까지 3전 전승을 할 확률 3C3 곱하기 1/2의 3제곱에다가, 마지막 4번째 경기에서 이길 확률 1/2을 그냥 곱해주는 거야! 그러면 16분의 1이 되지. 어때? 원리만 깨달으면 확통은 정말 재미있는 마법 같단다!",
      visuals: { title: "예제 5 풀이결과", math: "\\left[ {}_{3}\\mathrm{C}_{3} \\left(\\frac{1}{2}\\right)^3 \\right] \\times \\frac{1}{2} = \\frac{1}{16}" }
    }
  ]
};

fs.writeFileSync('./public/premium_lectures/독립시행의 확률.json', JSON.stringify(lectureData, null, 2));
console.log('Done deeply expanding Independent Events and Trials!');
