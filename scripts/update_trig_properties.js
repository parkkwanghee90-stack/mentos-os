import fs from 'fs';

const conceptPath = './public/concept_cards/premium_lectures.json';
const conceptData = JSON.parse(fs.readFileSync(conceptPath, 'utf8'));

// 1. Update Concept Card (Using proper escaping for Markdown/Math)
const algebra = conceptData['대수'];
const trigIdx = algebra.findIndex(x => x.id === '삼각함수성질');

if (trigIdx !== -1) {
  algebra[trigIdx].content = `# 📌 삼각함수의 성질 완벽 정리

## 1. 일반각과 호도법
- **일반각**: 동경이 나타내는 각은 하나가 아닙니다. $360^\\circ \\times n + \\alpha$ 로 표현합니다.
- **호도법**: 반지름과 호의 길이가 같을 때의 각을 $1$ 라디안이라 하며, $180^\\circ = \\pi$ 라디안입니다.
- **부채꼴**: 호의 길이 $l = r\\theta$, 넓이 $S = \\frac{1}{2}r^2\\theta = \\frac{1}{2}rl$

## 2. 삼각함수의 정의와 부호
- **단위원**: 반지름이 $r$인 원 위의 점 $P(x, y)$에 대해:
  - $\\sin \\theta = y/r, \\cos \\theta = x/r, \\tan \\theta = y/x$
- **사분면별 부호 (올사탄코)**:
  - 1사분면: **All** (+)
  - 2사분면: **Sin** (+)
  - 3사분면: **Tan** (+)
  - 4사분면: **Cos** (+)

## 3. 각변환 공식 ($n\\frac{\\pi}{2} \\pm \\theta$)
1. **함수 결정**: $n$이 홀수면 $\\sin \\leftrightarrow \\cos, \\tan \\leftrightarrow \\cot$ 로 바뀌고, $n$이 짝수면 그대로 유지됩니다.
2. **부호 결정**: 원래 함수가 해당 사분면에서 갖는 부호를 따릅니다.`;
}

fs.writeFileSync(conceptPath, JSON.stringify(conceptData, null, 2));

// 2. Create 삼각함수성질.json with properly escaped KaTeX strings
const trigLecture = {
  id: "삼각함수성질",
  title: "삼각함수의 정의와 성질 마스터 특강",
  subject: "수학1 / 대수",
  steps: [
    {
      step: 1,
      narration: "안녕! 오늘은 삼각함수의 기초이자 핵심인 <blue>일반각</blue>과 <blue>호도법</blue>을 배워볼 거야. 각도를 숫자로 다루는 마법을 시작하자!",
      visuals: { title: "일반각의 표현", math: "360^\\circ \\times n + \\alpha \\quad (n \\text{은 정수})" }
    },
    {
      step: 2,
      narration: "일반각 예제 1번! $750^\\circ$를 일반각으로 표현하면? 360도가 두 번 돌고 30도가 남았으니까 $360 \\times n + 30$ 이 되겠지?",
      visuals: { title: "일반각 예제 1", math: "750^\\circ = 360^\\circ \\times 2 + 30^\\circ \\implies 360^\\circ \\times n + 30^\\circ" }
    },
    {
      step: 3,
      narration: "일반각 예제 2번! $-100^\\circ$는? 양의 각으로 바꾸면 260도니까 $360 \\times n + 260$ 으로 쓸 수 있어.",
      visuals: { title: "일반각 예제 2", math: "-100^\\circ = 360^\\circ \\times (-1) + 260^\\circ \\implies 360^\\circ \\times n + 260^\\circ" }
    },
    {
      step: 4,
      narration: "이제 부채꼴이야! 호의 길이 $l$은 반지름과 각도의 곱이고, 넓이 $S$는 부채꼴의 모양을 결정해.",
      visuals: { title: "부채꼴의 호의 길이와 넓이", component: "GeometryVisuals", props: { type: "sector" } }
    },
    {
      step: 5,
      narration: "부채꼴 예제 1번! 반지름이 4, 중심각이 $60^\\circ(\\pi/3)$ 일 때 호의 길이는?",
      visuals: { title: "부채꼴 예제 1", math: "l = r\\theta = 4 \\times \\frac{\\pi}{3} = \\frac{4\\pi}{3}" }
    },
    {
      step: 6,
      narration: "부채꼴 예제 2번! 반지름이 6, 호의 길이가 $2\\pi$ 일 때 넓이는? $1/2 rl$ 공식을 쓰면 아주 간단해!",
      visuals: { title: "부채꼴 예제 2", math: "S = \\frac{1}{2} rl = \\frac{1}{2} \\times 6 \\times 2\\pi = 6\\pi" }
    },
    {
      step: 7,
      narration: "이번엔 <red>두 동경의 위치 관계</red>야. 두 각 $\\alpha, \\beta$ 가 겹치거나 대칭일 때 어떤 특징이 있는지 3가지 예제로 알아볼게.",
      visuals: { title: "두 동경의 위치 관계", component: "GeometryVisuals", props: { type: "terminal_sides", rel: "일치/대칭" } }
    },
    {
      step: 8,
      narration: "예제 1번! 두 동경이 일치하면? 한 바퀴 차이일 테니 뺐을 때 $360n$ 이 되어야 해.",
      visuals: { title: "동경 예제 1: 일치", math: "\\alpha - \\beta = 360^\\circ \\times n \\quad (\\text{또는 } 2n\\pi)" }
    },
    {
      step: 9,
      narration: "예제 2번! 두 동경이 일직선상에 있고 방향이 반대라면? 뺐을 때 180도 차이가 나겠지?",
      visuals: { title: "동경 예제 2: 방향 반대", math: "\\alpha - \\beta = 360^\\circ \\times n + 180^\\circ" }
    },
    {
      step: 10,
      narration: "예제 3번! 두 동경이 $y$축에 대하여 대칭이라면? 두 각을 더했을 때 180도가 된단다.",
      visuals: { title: "동경 예제 3: y축 대칭", math: "\\alpha + \\beta = 360^\\circ \\times n + 180^\\circ" }
    },
    {
      step: 11,
      narration: "드디어 단위원 등장! 반지름이 $r$인 원 위에서 사인은 $y$, 코사인은 $x$, 탄젠트는 기울기를 뜻해.",
      visuals: { title: "단위원에서의 삼각함수 정의", component: "GeometryVisuals", props: { type: "unit_circle" } }
    },
    {
      step: 12,
      narration: "사분면마다 부호가 달라! 1사분면은 모두(+), 2사분면은 사인만(+), 3사분면은 탄젠트만(+), 4사분면은 코사인만(+)인 <blue>올-사-탄-코</blue>를 기억해!",
      visuals: { title: "사분면별 부호 (All-S-T-C)", math: "\\begin{array}{|c|c|c|} \\hline \\text{2사분면(Sin)} & \\text{1사분면(All)} \\\\ \\hline \\text{3사분면(Tan)} & \\text{4사분면(Cos)} \\\\ \\hline \\end{array}" }
    },
    {
      step: 13,
      narration: "자, 이제 무조건 외워야 할 특수각의 삼각비 표야. 30도, 45도, 60도는 눈 감고도 튀어나와야 해!",
      visuals: { title: "특수각의 삼각비 표", math: "\\begin{array}{|c|c|c|c|c|c|} \\hline \\theta & 0^\\circ & 30^\\circ & 45^\\circ & 60^\\circ & 90^\\circ \\\\ \\hline \\sin \\theta & 0 & 1/2 & \\sqrt{2}/2 & \\sqrt{3}/2 & 1 \\\\ \\hline \\cos \\theta & 1 & \\sqrt{3}/2 & \\sqrt{2}/2 & 1/2 & 0 \\\\ \\hline \\tan \\theta & 0 & \\sqrt{3}/3 & 1 & \\sqrt{3} & \\text{X} \\\\ \\hline \\end{array}" }
    },
    {
      step: 14,
      narration: "마지막으로 가장 중요한 <red>각변환 공식</red>이야. $n$이 홀수면 함수가 바뀌고, 짝수면 그대로! 부호는 사분면으로 결정해. 예제 8개로 마스터하자!",
      visuals: { title: "각변환의 원리", math: "f(n \\cdot \\frac{\\pi}{2} \\pm \\theta) \\implies \\text{함수 변경 여부 } \\rightarrow \\text{부호 결정}" }
    },
    {
      step: 15,
      narration: "각변환 예제 1번! $\\sin(90^\\circ + \\theta)$ 는? 90도는 1배(홀수)니까 코사인으로 바뀌고, 2사분면에서 사인은 (+)니까 그냥 $\\cos \\theta$ 야.",
      visuals: { title: "각변환 예제 1", math: "\\sin(90^\\circ + \\theta) = \\cos \\theta" }
    },
    {
      step: 16,
      narration: "예제 2번! $\\cos(180^\\circ - \\theta)$ 는? 180도는 2배(짝수)니까 코사인 그대로! 하지만 2사분면에서 코사인은 (-)이므로 $-\\cos \\theta$ 가 돼.",
      visuals: { title: "각변환 예제 2", math: "\\cos(180^\\circ - \\theta) = -\\cos \\theta" }
    },
    {
      step: 17,
      narration: "예제 3번! $\\tan(270^\\circ + \\theta)$ 는? 270도는 3배(홀수)니까 탄젠트의 역수인 $\\cot$ 로 바뀌고, 4사분면에서 탄젠트는 (-)니까 $-\\cot \\theta$ !",
      visuals: { title: "각변환 예제 3", math: "\\tan(270^\\circ + \\theta) = -\\frac{1}{\\tan \\theta}" }
    },
    {
      step: 18,
      narration: "예제 4번! 실제 각도를 계산해보자. $\\sin(120^\\circ)$ 는? $\\sin(180-60)$ 이니까 $\\sin 60$ 인 $\\sqrt{3}/2$ 가 되겠지?",
      visuals: { title: "각변환 예제 4", math: "\\sin 120^\\circ = \\sin(180^\\circ-60^\\circ) = \\sin 60^\\circ = \\frac{\\sqrt{3}}{2}" }
    },
    {
      step: 19,
      narration: "예제 5번! $\\cos(225^\\circ)$ 는? $\\cos(180+45)$ 이니까 $-\\cos 45$ 인 $-\\sqrt{2}/2$ 야.",
      visuals: { title: "각변환 예제 5", math: "\\cos 225^\\circ = \\cos(180^\\circ+45^\\circ) = -\\cos 45^\\circ = -\\frac{\\sqrt{2}}{2}" }
    },
    {
      step: 20,
      narration: "예제 6번! $\\tan(-30^\\circ)$ 는? 탄젠트는 마이너스를 뱉어내는 기함수니까 $-\\tan 30$ 인 $-\\sqrt{3}/3$ 이란다.",
      visuals: { title: "각변환 예제 6", math: "\\tan(-30^\\circ) = -\\tan 30^\\circ = -\\frac{\\sqrt{3}}{3}" }
    },
    {
      step: 21,
      narration: "예제 7번! $\\sin(3\\pi/2 - \\theta)$ 는? $3\\pi/2$는 270도(홀수)니까 코사인으로 변하고, 3사분면에서 사인은 (-)이므로 $-\\cos \\theta$ !",
      visuals: { title: "각변환 예제 7", math: "\\sin(\\frac{3\\pi}{2} - \\theta) = -\\cos \\theta" }
    },
    {
      step: 22,
      narration: "마지막 8번! $\\cos^2(10^\\circ) + \\cos^2(80^\\circ)$ 는? $80$도를 $90-10$으로 바꾸면 $\\sin^2(10)$이 되니까 합은 마법처럼 1이 돼!",
      visuals: { title: "각변환 예제 8", math: "\\cos^2 10^\\circ + \\cos^2 80^\\circ = \\cos^2 10^\\circ + \\sin^2 10^\\circ = 1" }
    },
    {
      step: 23,
      narration: "자, 여기까지 삼각함수의 성질을 모두 정복했어! 오늘 배운 부채꼴, 단위원 부호, 각변환 3가지는 수능 끝날 때까지 괴롭히는 녀석들이니 꼭 복습해!",
      visuals: { title: "삼각함수 성질 마스터!", math: "\\text{고생했어! 다음은 삼각함수 그래프야!}" }
    }
  ]
};

fs.writeFileSync('./public/premium_lectures/삼각함수성질.json', JSON.stringify(trigLecture, null, 2));

console.log('Fixed trig properties math escaping!');
