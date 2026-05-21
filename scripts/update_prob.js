import fs from 'fs';

// 1. Update concept_cards/premium_lectures.json
const conceptPath = './public/concept_cards/premium_lectures.json';
const conceptData = JSON.parse(fs.readFileSync(conceptPath, 'utf8'));

const detailedContent = JSON.parse(fs.readFileSync('./scripts/data_prob.json', 'utf8')).content;

const statsList = conceptData['확률과통계'];
const index = statsList.findIndex(x => x.id === '확률의 뜻');
if (index !== -1) {
  statsList[index].content = detailedContent;
} else {
  statsList.push({
    id: "확률의 뜻",
    title: "확률의 뜻과 성질",
    content: detailedContent
  });
}

fs.writeFileSync(conceptPath, JSON.stringify(conceptData, null, 2));

// 2. Update premium_lectures/확률의뜻.json
// Note: baseId becomes "확률의뜻" without space in PremiumLecturePlayer mapping if we added it, but let's name the file "확률의 뜻.json" as we will fallback to encodeURIComponent(baseId) where baseId = '확률의 뜻'
const lectureData = {
  id: "확률의 뜻",
  title: "확률의 뜻 마스터 특강",
  subject: "수학1 / 확통",
  steps: [
    {
      step: 1,
      narration: "안녕! 오늘은 일상생활에서도 정말 많이 쓰이는 <blue>확률의 뜻</blue>에 대해 선생님과 함께 알아볼 거야. 수학에서의 확률은 '전체 경우의 수 중에서 특정 사건이 일어날 경우의 수'의 비율을 뜻해. 하나씩 차근차근 배워보자!",
      visuals: {
        title: "확률의 기본 개념",
        math: "\\text{확률 } P(A) = \\frac{\\text{사건 } A\\text{가 일어날 경우의 수}}{\\text{전체 일어날 수 있는 경우의 수}}"
      }
    },
    {
      step: 2,
      narration: "본격적인 공부에 앞서 3가지 중요한 단어를 기억해야 해. 첫 번째는 <green>시행</green>이야. 주사위나 동전을 던지는 것처럼 같은 조건에서 반복할 수 있는 실험을 말해. 두 번째는 <green>표본공간 S</green>인데, 시행에서 일어날 수 있는 '모든 결과들의 집합'이지. 마지막으로 <green>사건 A</green>는 우리가 관심을 가지는 '특정 결과들의 모임'을 뜻한단다.",
      visuals: {
        title: "확률의 3가지 필수 용어",
        math: "\\begin{array}{l} 1. \\text{시행 (Trial)} \\\\ 2. \\text{표본공간 } (S) \\\\ 3. \\text{사건 } (A) \\end{array}"
      }
    },
    {
      step: 3,
      narration: "그렇다면 <blue>수학적 확률</blue>은 어떻게 계산할까? 각각의 결과가 일어날 가능성이 모두 같다고 할 때, 전체 표본공간의 개수 분의 특정 사건의 개수로 구해. 기호로는 전체 개수 n(S) 분의 사건 개수 n(A) 라고 쓰면 된단다.",
      visuals: {
        title: "수학적 확률의 정의",
        math: "P(A) = \\frac{n(A)}{n(S)}"
      }
    },
    {
      step: 4,
      narration: "자, 이제 실전 예제 3개를 빠르게 풀어보며 감을 잡아볼까? 첫 번째 예제! 서로 다른 주사위 2개를 동시에 던질 때, <blue>두 눈의 수의 합이 8일 확률</blue>을 구해보자.",
      visuals: {
        title: "예제 1: 주사위 2개 던지기",
        math: "\\text{주사위 2개, 합이 8일 확률은?}"
      }
    },
    {
      step: 5,
      narration: "먼저 전체 경우의 수 n(S)는 주사위 2개니까 6 곱하기 6, 즉 36가지야. 합이 8이 되는 사건 A는 (2,6)부터 (6,2)까지 손으로 꼽아보면 총 5가지지. 따라서 확률은 <green>36분의 5</green>가 정답이야!",
      visuals: {
        title: "예제 1 풀이",
        math: "n(S) = 36 \\,, \\quad n(A) = 5 \\implies P(A) = \\frac{5}{36}"
      }
    },
    {
      step: 6,
      narration: "두 번째 예제는 <blue>구슬 뽑기</blue>야! 주머니에 빨간 구슬 3개, 파란 구슬 4개가 있어. 여기서 2개를 꺼낼 때, <blue>2개 모두 파란 구슬일 확률</blue>을 구해볼까?",
      visuals: {
        title: "예제 2: 구슬 뽑기",
        math: "\\text{총 7개 중 2개를 뽑을 때, 모두 파란 구슬일 확률은?}"
      }
    },
    {
      step: 7,
      narration: "전체 경우의 수는 7개 중 2개를 뽑는 조합 7C2로 21가지야. 그중 파란 구슬만 2개 뽑히는 사건은 4C2로 6가지지. 확률은 21분의 6이고, 3으로 약분해주면 정답은 <green>7분의 2</green>가 된단다.",
      visuals: {
        title: "예제 2 풀이",
        math: "P(A) = \\frac{{}_{4}\\mathrm{C}_{2}}{{}_{7}\\mathrm{C}_{2}} = \\frac{6}{21} = \\frac{2}{7}"
      }
    },
    {
      step: 8,
      narration: "마지막 세 번째 예제! 남학생 3명, 여학생 2명이 일렬로 설 때, <blue>여학생 2명이 서로 이웃해서 설 확률</blue>을 구해보자. 순열을 이용하는 문제야.",
      visuals: {
        title: "예제 3: 일렬로 줄 세우기",
        math: "\\text{총 5명이 줄을 설 때, 여학생 2명이 이웃할 확률은?}"
      }
    },
    {
      step: 9,
      narration: "전체 경우의 수는 5명을 나열하는 5팩토리얼로 120가지야. 여학생 2명을 한 묶음으로 생각하면 전체 4명 나열 4팩토리얼에 여학생끼리 자리 바꾸는 2팩토리얼을 곱해서 48가지가 돼. 120분의 48을 약분하면 최종 정답은 <green>5분의 2</green>란다. 어때, 확률도 순서대로 푸니까 아주 쉽지?",
      visuals: {
        title: "예제 3 풀이",
        math: "P(A) = \\frac{4! \\times 2!}{5!} = \\frac{48}{120} = \\frac{2}{5}"
      }
    }
  ]
};

// Fallback to "확률의 뜻" mapping logic
fs.writeFileSync('./public/premium_lectures/확률의 뜻.json', JSON.stringify(lectureData, null, 2));
console.log('Done writing Probability files!');
