import fs from 'fs';

const path = './public/premium_lectures/삼각함수그래프.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const finalSteps = [
  {
    "step": 14,
    "narration": "그래프를 이용하는 방법 외에도 '단위원'을 활용해 방정식을 풀 수 있습니다. $\\sin x = 1/2$ 의 해는 단위원 위에서 $y$좌표가 $1/2$ 인 지점을 찾는 것과 같죠. 동경의 각도를 읽어주면 바로 해가 나옵니다.",
    "visuals": {
      "title": "7. 단위원(Unit Circle)을 이용한 풀이",
      "component": "GeometryVisuals",
      "props": { "type": "unit_circle_trig", "props": { "lineVal": 0.5, "lineType": "y" } },
      "math": "\\sin x = \\frac{1}{2} \\implies y = \\frac{1}{2}"
    }
  },
  {
    "step": 15,
    "narration": "마지막으로 최고난도 유형입니다! 각이 $\\pi/2 \\pm x$ 와 같이 복잡하게 주어지고 이차식 형태인 경우입니다. 먼저 각변환을 통해 각을 통일하고, 함수를 하나로 통일한 뒤, 치환하여 분석합니다. 이 세 단계를 거치면 아무리 복잡한 문제도 해결할 수 있습니다.",
    "visuals": {
      "title": "최종 보스: 복합 변형 문제",
      "math": "y = \\sin(x+\\frac{\\pi}{2}) - \\cos^2(x+\\pi) \\\\ \\downarrow \\text{각변환} \\\\ y = \\cos x - (-\\cos x)^2 = \\cos x - \\cos^2 x"
    }
  },
  {
    "step": 16,
    "narration": "이후 $\\cos x = X$ 로 치환하여 이차함수의 최대/최소를 구하면 끝! 지금까지 삼각함수의 그래프와 그 활용을 완벽하게 학습했습니다. 고생 많으셨습니다!",
    "visuals": {
      "title": "치환 후 마무리",
      "component": "TrigSubstitutionVisual",
      "props": { "equation": "-X^2 + X", "range": [-1, 1] },
      "math": "y = -X^2 + X \\quad (-1 \\le X \\le 1)"
    }
  }
];

data.steps = [...data.steps, ...finalSteps];
fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Finalized 삼각함수그래프.json with Unit Circle and Complex cases!');
