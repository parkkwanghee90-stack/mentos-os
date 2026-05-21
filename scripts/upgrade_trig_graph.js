import fs from 'fs';

const path = './public/premium_lectures/삼각함수그래프.json';
const data = {
  "id": "삼각함수그래프",
  "title": "삼각함수의 그래프와 방정식·부등식",
  "subject": "대수",
  "steps": [
    {
      "step": 1,
      "narration": "삼각함수의 그래프를 그려볼까요? 먼저 사인함수입니다. 단위원 위의 점 $P$가 움직일 때, 점 $P$의 $y$좌표값이 바로 사인값이 됩니다. 이를 펼쳐놓으면 우리가 아는 물결 모양의 사인 곡선이 탄생하죠.",
      "visuals": {
        "title": "1. 사인함수의 그래프",
        "component": "TrigonometricGraph",
        "props": { "mode": "sin" },
        "math": "y = \\sin \\theta \\quad (\\text{치역: } [-1, 1], \\text{주기: } 2\\pi)"
      }
    },
    {
      "step": 2,
      "narration": "사인함수는 원점에 대하여 대칭인 기함수입니다. 따라서 $\\sin(-\\theta) = -\\sin\\theta$ 가 성립하죠. 주기 $2\\pi$ 마다 모양이 반복되는 것도 잊지 마세요!",
      "visuals": {
        "title": "사인함수의 성질",
        "math": "\\sin(-\\theta) = -\\sin\\theta, \\quad \\sin(2n\\pi + \\theta) = \\sin\\theta"
      }
    },
    {
      "step": 3,
      "narration": "코사인함수는 점 $P$의 $x$좌표에 의해 결정됩니다. 사인 그래프를 왼쪽으로 $90^\\circ$ 만큼 평행이동한 모양과 같죠. $y$축에 대하여 대칭인 우함수입니다.",
      "visuals": {
        "title": "2. 코사인함수의 그래프",
        "component": "TrigonometricGraph",
        "props": { "mode": "sin-cos" },
        "math": "y = \\cos \\theta \\implies \\cos(-\\theta) = \\cos\\theta"
      }
    },
    {
      "step": 4,
      "narration": "탄젠트함수는 조금 특별합니다. 점 $(1, 0)$에서의 접선과 동경의 교점의 $y$좌표로 정의되죠. 그래서 점근선이 존재하고 주기는 $\\pi$로 절반입니다.",
      "visuals": {
        "title": "3. 탄젠트함수의 그래프",
        "component": "TrigonometricGraph",
        "props": { "mode": "tan" },
        "math": "y = \\tan \\theta \\quad (\\text{주기: } \\pi, \\text{점근선: } \\theta = n\\pi + \\frac{\\pi}{2})"
      }
    },
    {
      "step": 5,
      "narration": "함수 앞에 $a$가 붙으면 위아래로 늘어납니다. 치역이 $[-a, a]$가 되죠. 엑스 앞의 계수 $b$는 주기를 결정합니다. 원래 주기 $2\\pi$를 $b$로 나눈 것이 새로운 주기가 됩니다.",
      "visuals": {
        "title": "그래프의 확대와 축소",
        "component": "TrigonometricGraph",
        "props": { "mode": "transformed", "props": { "a": 2, "b": 2 } },
        "math": "y = a \\sin bx \\implies \\text{치역: } [-a, a], \\text{주기: } \\frac{2\\pi}{|b|}"
      }
    },
    {
      "step": 6,
      "narration": "이제 삼각방정식을 풀어볼까요? $\\sin x = 1/2$ 을 만족하는 $x$를 찾는 것은, 사인 그래프와 직선 $y=1/2$ 의 교점을 찾는 것과 같습니다. 대칭성을 이용하면 모든 근을 찾기 쉽습니다.",
      "visuals": {
        "title": "4. 삼각방정식의 풀이",
        "component": "TrigonometricGraph",
        "props": { "mode": "equation", "props": { "k": 0.5 } },
        "math": "\\sin x = \\frac{1}{2} \\implies x = \\frac{\\pi}{6}, \\frac{5\\pi}{6}, \\dots"
      }
    },
    {
      "step": 7,
      "narration": "삼각부등식도 마찬가지입니다. $\\sin x > 1/2$ 이라면, 사인 그래프가 직선 $y=1/2$ 보다 위쪽에 있는 범위를 찾으면 됩니다. 그림에서 초록색으로 표시된 구간이 정답입니다.",
      "visuals": {
        "title": "5. 삼각부등식의 풀이",
        "component": "TrigonometricGraph",
        "props": { "mode": "inequality", "props": { "k": 0.5, "op": "gt" } },
        "math": "\\sin x > \\frac{1}{2} \\implies \\frac{\\pi}{6} < x < \\frac{5\\pi}{6}"
      }
    },
    {
      "step": 8,
      "narration": "마지막으로 그래프의 대칭성을 이용한 심화 예제입니다. 여러 개의 근의 합을 구할 때, 직접 근을 구하지 않고 대칭축을 이용해 합을 구하는 테크닉은 수능 단골 소재입니다!",
      "visuals": {
        "title": "심화: 대칭성을 이용한 근의 합",
        "component": "TrigonometricGraph",
        "props": { "mode": "equation", "props": { "k": 0.75 } },
        "math": "\\frac{\\alpha + \\beta}{2} = \\frac{\\pi}{2} \\implies \\alpha + \\beta = \\pi"
      }
    }
  ]
};

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Upgraded 삼각함수그래프.json with high-fidelity content from images!');
