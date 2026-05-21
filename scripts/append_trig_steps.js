import fs from 'fs';

const path = './public/premium_lectures/삼각함수그래프.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const newSteps = [
  {
    "step": 9,
    "narration": "조금 더 복잡한 형태를 볼까요? $y = a \\sin(bx+c) + d$ 와 같은 꼴은 평행이동이 포함된 형태입니다. $x$축으로 $-c/b$, $y$축으로 $d$만큼 이동한 것이죠. 최댓값은 $|a|+d$, 최솟값은 $-|a|+d$ 가 됩니다.",
    "visuals": {
      "title": "일반적인 삼각함수의 그래프와 평행이동",
      "component": "TrigonometricGraph",
      "props": { "mode": "transformed", "props": { "a": 1.5, "b": 1, "c": 0.5 } },
      "math": "y = a \\sin b(x + \\frac{c}{b}) + d"
    }
  },
  {
    "step": 10,
    "narration": "이번에는 이차식 형태의 삼각함수입니다. $y = \\sin^2 x + 2 \\sin x + 3$ 과 같은 식은 어떻게 풀까요? $\\sin x$ 를 $X$로 치환하면 간단한 이차함수 문제가 됩니다.",
    "visuals": {
      "title": "6. 이차식 꼴의 삼각함수 (치환)",
      "component": "TrigSubstitutionVisual",
      "props": { "equation": "X^2 + 2X + 3" },
      "math": "\\sin x = X \\implies y = X^2 + 2X + 3 \\quad (-1 \\le X \\le 1)"
    }
  },
  {
    "step": 11,
    "narration": "치환할 때 가장 중요한 것은 범위입니다! 사인과 코사인은 항상 $-1$ 에서 $1$ 사이의 값만 가지므로, 치환된 변수 $X$의 범위도 $[-1, 1]$ 로 제한됩니다. 이 범위 안에서만 이차함수의 최대/최소를 구해야 합니다.",
    "visuals": {
      "title": "치환 시 주의사항: 제한된 범위",
      "math": "-1 \\le \\sin x \\le 1 \\implies -1 \\le X \\le 1"
    }
  },
  {
    "step": 12,
    "narration": "서로 다른 종류의 삼각함수가 섞여 있다면, $\\sin^2 x + \\cos^2 x = 1$ 공식을 사용하여 한 종류로 통일한 뒤 치환합니다. 예를 들어 $\\cos^2 x$ 를 $1-\\sin^2 x$ 로 바꾸는 식이죠.",
    "visuals": {
      "title": "함수의 통일",
      "component": "TrigSubstitutionVisual",
      "props": { "equation": "-X^2 - 2X + 2" },
      "math": "y = \\cos^2 x - 2 \\sin x + 1 = (1-\\sin^2 x) - 2 \\sin x + 1 = -\\sin^2 x - 2 \\sin x + 2"
    }
  },
  {
    "step": 13,
    "narration": "자, 이제 삼각함수의 그래프부터 방정식, 부등식, 그리고 복잡한 이차식 형태까지 모두 섭렵했습니다! 수능과 내신의 고득점 포인트들을 잊지 말고 복습해 보세요.",
    "visuals": {
      "title": "삼각함수 그래프 단원 총정리",
      "math": "\\text{그래프 개형} \\to \\text{평행이동/주기} \\to \\text{방부등식} \\to \\text{이차식 치환}"
    }
  }
];

data.steps = [...data.steps, ...newSteps];
fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Added Quadratic Trig and General Form steps to 삼각함수그래프.json!');
