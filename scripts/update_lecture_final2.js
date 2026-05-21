import fs from 'fs';

// 1. Update concept_cards/premium_lectures.json
const conceptPath = './public/concept_cards/premium_lectures.json';
const conceptData = JSON.parse(fs.readFileSync(conceptPath, 'utf8'));

const detailedContent = JSON.parse(fs.readFileSync('./scripts/data.json', 'utf8')).content;

const statsList = conceptData['확률과통계'];
const index = statsList.findIndex(x => x.id === '이항정리');
if (index !== -1) {
  statsList[index].content = detailedContent;
}

fs.writeFileSync(conceptPath, JSON.stringify(conceptData, null, 2));

// 2. Update premium_lectures/이항정리.json
const lectureData = {
  id: "이항정리",
  title: "이항정리와 다항정리 마스터 특강",
  subject: "수학1 / 확통",
  steps: [
    {
      step: 1,
      narration: "안녕! 오늘은 다항식 전개의 꽃, <blue>이항정리</blue>를 선생님이 아주 꼼꼼하게 알려줄게. 이항정리는 a 더하기 b의 n제곱을 전개하는 공식이야. 아무리 복잡한 차수라도 <green>조합 C</green>를 이용하면 정말 마법처럼 쉽게 전개할 수 있단다!",
      visuals: {
        title: "이항정리의 기본 개념",
        math: "(a+b)^n = \\sum_{r=0}^{n} {}_{n}\\mathrm{C}_{r} a^{n-r} b^r"
      }
    },
    {
      step: 2,
      narration: "자, 전개식의 각 항은 <blue>nCr 곱하기 a의 n 마이너스 r제곱 곱하기 b의 r제곱</blue> 형태가 돼. 여기서 앞에 붙는 nCr을 바로 <green>이항계수</green>라고 부르는 거야. 특정 항의 계수를 구하라는 문제가 나오면 무조건 이 일반항부터 떠올려야 해!",
      visuals: {
        title: "이항정리 일반항",
        math: "\\text{일반항: } {}_{n}\\mathrm{C}_{r} a^{n-r} b^r"
      }
    },
    {
      step: 3,
      narration: "시험에 제일 자주 나오는 <blue>1 더하기 x의 n제곱</blue> 전개식을 볼까? 이 식의 x 자리에 1이나 마이너스 1을 대입해 보면 아주 신기한 규칙들이 쏟아져 나와. 모든 이항계수의 합은 2의 n제곱이 되고, 짝수번째와 홀수번째의 합은 그 절반인 2의 n-1제곱이 된단다.",
      visuals: {
        title: "(1+x)^n 전개식과 성질",
        math: "\\sum_{r=0}^n {}_{n}\\mathrm{C}_{r} = 2^n \\,, \\quad \\sum \\text{(짝/홀수항)} = 2^{n-1}"
      }
    },
    {
      step: 4,
      narration: "이제부터 정말 중요한 <blue>파스칼의 삼각형</blue>을 그려볼 거야. 피라미드 모양으로 숫자를 나열한 건데, 위층 이웃한 두 수를 더하면 바로 아래 숫자가 되는 예쁜 성질이 있어. 대각선으로 쭉 내려가다 마지막에 탁 꺾이는 모양이 하키스틱 같지? 그래서 <green>하키스틱 법칙</green>이라고 불러! 화면의 빨간 숫자 1, 3, 6을 쓱 더하면 파란 숫자 10으로 딱 떨어지는 게 보일 거야.",
      visuals: {
        title: "하키스틱 1: 우측 테두리 시작",
        math: "\\begin{array}{ccccccc} n=2 &&&& 1 && 2 && \\color{red}{1} \\\\ n=3 &&& 1 && 3 && \\color{red}{3} & \\\\ n=4 && 1 && 4 && \\color{red}{6} && 4 \\\\ n=5 & 1 && 5 && 10 && \\color{blue}{10} & \\end{array}"
      }
    },
    {
      step: 5,
      narration: "방금 본 그림을 수식으로 정리해 줄게. 뒤쪽 r은 그대로인데 앞쪽 n만 계속 커지는 꼴이지? 그럴 땐 계산할 필요 없이 무조건 <green>n과 r이 모두 1씩 커진 값</green>이 정답이야. 그림에서 확인한 것처럼 답은 옷씨삼(5C3)이 되는 거지!",
      visuals: {
        title: "하키스틱 1 공식정리",
        math: "{}_{2}\\mathrm{C}_{2} + {}_{3}\\mathrm{C}_{2} + {}_{4}\\mathrm{C}_{2} = {}_{5}\\mathrm{C}_{3}"
      }
    },
    {
      step: 6,
      narration: "두 번째 패턴은 왼쪽 테두리에서 시작해서 오른쪽으로 꺾는 거야. 이번엔 앞쪽 n과 뒤쪽 r이 나란히 손잡고 1씩 커지면서 내려오고 있지? 이럴 땐 <green>앞쪽 n만 1이 쏙 커지고 r은 그대로</green>인 값이 답이 된단다.",
      visuals: {
        title: "하키스틱 2: 좌측 테두리 시작",
        math: "\\begin{array}{ccccccc} n=1 &&&& \\color{red}{1} && 1 \\\\ n=2 &&& \\color{red}{1} && 2 && 1 \\\\ n=3 && \\color{red}{1} && 3 && 3 && 1 \\\\ n=4 & 1 && \\color{blue}{4} && 6 && 4 && 1 \\end{array}"
      }
    },
    {
      step: 7,
      narration: "하키스틱 법칙을 쓸 때 선생님이 가장 조심하라고 당부하고 싶은 <red>함정</red>이 있어! 하키스틱은 무조건 끝 테두리, 즉 값이 1인 곳에서부터 스르륵 출발해야 해. 만약 중간부터 더하라고 한다면? 공식대로 끝까지 더한 값을 구한 뒤, 원래 없었던 앞부분 값을 빼서 보정해 주면 돼. 알겠지?",
      visuals: {
        title: "하키스틱 3: 중간 출발 보정",
        math: "{}_{3}\\mathrm{C}_{2} + {}_{4}\\mathrm{C}_{2} = {}_{5}\\mathrm{C}_{3} - {}_{2}\\mathrm{C}_{2}"
      }
    },
    {
      step: 8,
      narration: "이제 이항정리를 넘어서 항이 3개 이상인 <blue>다항정리</blue>로 넘어가 볼게. 원리는 같아! a의 p제곱, b의 q제곱, c의 r제곱의 계수는 <green>전체 n 팩토리얼을 각 지수의 팩토리얼로 나눈 값</green>이 돼. 같은 것이 있는 순열의 원리를 그대로 쓰는 거지.",
      visuals: {
        title: "다항정리 (항이 3개 이상)",
        math: "\\frac{n!}{p!q!r!} a^p b^q c^r \\quad (단, p+q+r=n)"
      }
    },
    {
      step: 9,
      narration: "다항정리 첫 번째 예제야! x 더하기 y 더하기 z의 5제곱에서 x제곱 y z제곱의 계수를 찾아볼까? 지수들의 합이 5가 맞는지 확인하고, 전체 5팩토리얼을 2, 1, 2 팩토리얼로 나눠주면 계수는 <green>30</green>이 튀어나와. 너무 쉽지?",
      visuals: {
        title: "다항정리 예제 1",
        math: "(x+y+z)^5 \\rightarrow x^2 y z^2 \\text{의 계수} = \\frac{5!}{2!1!2!} = 30"
      }
    },
    {
      step: 10,
      narration: "두 번째 예제는 살짝 응용이야. x 더하기 2y 빼기 z의 4제곱에서 x y제곱 z의 계수를 구해야 해. 여긴 계수랑 부호가 섞여 있지? 당황하지 말고 문자와 계수, 부호를 하나의 덩어리로 꽉 묶어서 승수를 올려주면 돼. 차분히 계산하면 <green>마이너스 48</green>이 나온단다.",
      visuals: {
        title: "다항정리 예제 2 (계수와 부호 포함)",
        math: "\\frac{4!}{1!2!1!} (x)^1 (2y)^2 (-z)^1 = -48 x y^2 z"
      }
    },
    {
      step: 11,
      narration: "드디어 마지막 심화 예제야! x제곱 더하기 x 빼기 1의 4제곱에서 x세제곱의 계수를 구해볼 거야. 미지수가 x 하나라서 지수끼리 뭉쳐지기 때문에, 차수가 3이 되는 p, q, r의 순서쌍을 네가 직접 다 찾아내야 해. 한 번 찾아볼까?",
      visuals: {
        title: "다항정리 예제 3 (단일 문자 다항식)",
        math: "\\frac{4!}{p!q!r!} (x^2)^p (x)^q (-1)^r \\implies 2p+q=3"
      }
    },
    {
      step: 12,
      narration: "잘 찾았어! 2p 더하기 q는 3이고, 셋 다 더해서 4가 되는 쌍은 (1,1,2)와 (0,3,1) 딱 두 가지가 나와. 이 두 경우의 계수를 각각 꼼꼼하게 구해서 더해주면 <green>최종 정답은 8</green>이 돼. 선생님 설명 들으니까 하나도 안 어렵지? 수고 많았어!",
      visuals: {
        title: "예제 3 풀이 결과",
        math: "(p,q,r) = (1,1,2) \\rightarrow 12 \\, , \\quad (0,3,1) \\rightarrow -4 \\implies \\text{총 계수: } 8"
      }
    }
  ]
};

fs.writeFileSync('./public/premium_lectures/이항정리.json', JSON.stringify(lectureData, null, 2));
console.log('Done updating both files successfully!');
