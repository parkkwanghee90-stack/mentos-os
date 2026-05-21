import fs from 'fs';

const path = './public/premium_lectures/삼각함수그래프.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Insert new examples after the general concepts
const examples = [
  {
    "step": 17,
    "narration": "실전 예제 1: 기본적인 삼각방정식입니다. $\\sin x = \\sqrt{3}/2$ 를 풀어볼까요? 사인값이 $\\sqrt{3}/2$ 가 되는 첫 번째 각도는 $60^\\circ(\\pi/3)$ 입니다. 대칭성에 의해 두 번째 각도는 $180^\\circ - 60^\\circ = 120^\\circ(2\\pi/3)$ 가 됩니다.",
    "visuals": {
      "title": "예제 1: $\\sin x = \\frac{\\sqrt{3}}{2}$",
      "component": "TrigonometricGraph",
      "props": { "mode": "equation", "props": { "k": 0.866 } },
      "math": "x = \\frac{\\pi}{3}, \\frac{2\\pi}{3}"
    }
  },
  {
    "step": 18,
    "narration": "예제 2: 평행이동이 포함된 경우입니다. $\\cos(2x - \\pi/3) = 1/2$ 는 어떻게 할까요? 괄호 안을 $t$로 치환하여 $\\cos t = 1/2$ 를 먼저 풉니다. $t$의 범위를 구하는 것이 핵심입니다!",
    "visuals": {
      "title": "예제 2: 변형된 방정식",
      "math": "2x - \\frac{\\pi}{3} = t \\implies \\cos t = \\frac{1}{2} \\implies t = \\frac{\\pi}{3}, \\frac{5\\pi}{3}"
    }
  },
  {
    "step": 19,
    "narration": "예제 3: 인수분해형입니다. $\\sin^2 x - \\sin x = 0$ 은 $\\sin x (\\sin x - 1) = 0$ 으로 바뀝니다. 즉, $\\sin x = 0$ 이거나 $\\sin x = 1$ 인 지점을 찾으면 됩니다.",
    "visuals": {
      "title": "예제 3: 인수분해 활용",
      "component": "TrigonometricGraph",
      "props": { "mode": "equation", "props": { "k": 0 } },
      "math": "\\sin x = 0 \\text{ or } \\sin x = 1 \\implies x = 0, \\pi, 2\\pi, \\frac{\\pi}{2}"
    }
  },
  {
    "step": 20,
    "narration": "예제 4: 서로 다른 함수가 섞인 이차식입니다. $2\\cos^2 x + \\sin x - 1 = 0$ 은 $\\cos^2 x$ 를 $1-\\sin^2 x$ 로 바꿔서 사인에 대한 이차방정식으로 통일합니다.",
    "visuals": {
      "title": "예제 4: 함수 통일형",
      "math": "2(1-\\sin^2 x) + \\sin x - 1 = 0 \\implies 2\\sin^2 x - \\sin x - 1 = 0"
    }
  },
  {
    "step": 21,
    "narration": "이제 부등식 예제입니다. $\\sin x < 1/2$ 의 해는 그래프가 직선 $y=1/2$ 보다 아래에 있는 구간입니다. $0$부터 $\\pi/6$ 까지, 그리고 $5\\pi/6$ 부터 $2\\pi$ 까지가 정답입니다.",
    "visuals": {
      "title": "예제 5: $\\sin x < \\frac{1}{2}$",
      "component": "TrigonometricGraph",
      "props": { "mode": "inequality", "props": { "k": 0.5, "op": "lt" } },
      "math": "0 \\le x < \\frac{\\pi}{6} \\text{ 또는 } \\frac{5\\pi}{6} < x < 2\\pi"
    }
  },
  {
    "step": 22,
    "narration": "예제 6: 코사인 부등식 $\\cos x \\ge -\\sqrt{2}/2$ 를 풀어보죠. 코사인 그래프를 그리고 $y=-\\sqrt{2}/2$ 이상의 구간을 찾습니다. 양 끝점을 포함하는 것에 주의하세요.",
    "visuals": {
      "title": "예제 6: $\\cos x \\ge -\\frac{\\sqrt{2}}{2}$",
      "component": "TrigonometricGraph",
      "props": { "mode": "equation", "props": { "k": -0.707 } },
      "math": "0 \\le x \\le \\frac{3\\pi}{4} \\text{ 또는 } \\frac{5\\pi}{4} \\le x < 2\\pi"
    }
  },
  {
    "step": 23,
    "narration": "예제 7: 탄젠트 부등식 $\\tan x > \\sqrt{3}$ 입니다. 탄젠트는 주기가 $\\pi$ 이고 점근선이 있음을 기억하세요. $\\pi/3$ 부터 점근선인 $\\pi/2$ 전까지가 해가 됩니다.",
    "visuals": {
      "title": "예제 7: $\\tan x > \\sqrt{3}$",
      "component": "TrigonometricGraph",
      "props": { "mode": "tan" },
      "math": "\\frac{\\pi}{3} < x < \\frac{\\pi}{2}"
    }
  },
  {
    "step": 24,
    "narration": "마지막 부등식 예제입니다. $2\\cos^2 x - 3\\cos x + 1 < 0$ 을 풀어봅시다. 치환 후 $(2X-1)(X-1) < 0$ 이 되므로 $1/2 < \\cos x < 1$ 구간을 찾으면 됩니다.",
    "visuals": {
      "title": "예제 8: 이차식 부등식",
      "component": "TrigSubstitutionVisual",
      "props": { "equation": "2X^2 - 3X + 1", "range": [0.5, 1] },
      "math": "\\frac{1}{2} < \\cos x < 1 \\implies 0 < x < \\frac{\\pi}{3}"
    }
  }
];

data.steps = [...data.steps, ...examples];
fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Updated 삼각함수그래프.json with 8 examples!');
