import fs from 'fs';

const path = './public/premium_lectures/삼각함수성질.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Insert new steps after Step 13 (before Step 14 which was the start of 각변환)
// Actually, it's better to add them as part of the 각변환 section or just before it.
// Step 13 is index 12.

const symmetrySteps = [
  {
    "step": 0,
    "narration": "동경의 대칭성! $\\pi + \\theta$ 는 원점에 대하여 대칭이고, $\\pi - \\theta$ 는 $y$축에 대하여 대칭이야. 그림으로 확인해볼까?",
    "visuals": {
      "title": "pi +- theta 의 대칭성",
      "component": "GeometryVisuals",
      "props": {
        "type": "terminal_sides",
        "rel": "원점 대칭",
        "theta": 30
      },
      "math": "\\begin{array}{l} \\sin(\\pi+\\theta) = -\\sin\\theta \\\\ \\cos(\\pi+\\theta) = -\\cos\\theta \\\\ \\tan(\\pi+\\theta) = \\tan\\theta \\end{array}"
    }
  },
  {
    "step": 0,
    "narration": "이제 직선 $y=x$ 에 대한 대칭이야. $\\pi/2 - \\theta$ 가 바로 $y=x$ 대칭이지. 이때 $x$좌표와 $y$좌표가 바뀌면서 사인과 코사인이 서로 바뀌게 된단다.",
    "visuals": {
      "title": "pi/2 - theta (y=x 대칭)",
      "component": "GeometryVisuals",
      "props": {
        "type": "terminal_sides",
        "rel": "y=x 대칭",
        "theta": 30
      },
      "math": "\\sin(\\pi/2 - \\theta) = \\cos\\theta, \\quad \\cos(\\pi/2 - \\theta) = \\sin\\theta"
    }
  },
  {
    "step": 0,
    "narration": "실전 예제! 점 $P(-4, 3)$을 지나는 동경의 삼각함수를 구해볼까? 반지름 $r$은 피타고라스로 5가 되고, 정의에 따라 사인, 코사인, 탄젠트를 바로 구할 수 있어.",
    "visuals": {
      "title": "점 P(-4, 3)을 지나는 동경",
      "component": "GeometryVisuals",
      "props": {
        "type": "point_terminal",
        "x": -4,
        "y": 3
      },
      "math": "\\sin\\theta = 3/5, \\cos\\theta = -4/5, \\tan\\theta = -3/4"
    }
  }
];

// Insert at index 13 (after step 13)
data.steps.splice(13, 0, ...symmetrySteps);

// Update all step numbers
data.steps.forEach((s, idx) => {
  s.step = idx + 1;
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Added Symmetry and Point-terminal steps to Trig Properties lecture!');
