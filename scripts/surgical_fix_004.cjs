const fs = require('fs');
const path = require('path');

const targetPath = 'c:/mentos_os_clean/public/math_hints/일차부등식2단계/004.json';

const newData = {
  "type": "geometry",
  "viewBox": {
    "x": [-5, 5],
    "y": [-5, 5]
  },
  "steps": [
    {
      "step": 1,
      "label": "P: 문제 이해",
      "latex": "$$\\text{조건 } a > b \\text{ 일 때, 일차부등식 } bx - 4a > ax - 4b \\text{ 의 해를 구합니다}.$$"
    },
    {
      "step": 2,
      "label": "C: 핵심 개념",
      "latex": "$$\\text{부등식의 기본 성질을 이용하여 } x \\text{ 에 대해 정리하며, 음수로 나눌 때 부등호 방향이 바뀜에 유의합니다}.$$"
    },
    {
      "step": 3,
      "label": "B: 조건 분석",
      "latex": "$$bx - ax > 4a - 4b \\Rightarrow (b-a)x > 4(a-b)$$"
    },
    {
      "step": 4,
      "label": "S: 풀이 전략",
      "latex": "$$a > b \\text{ 이므로 } b-a < 0 \\text{ 입니다. 양변을 } b-a \\text{ 로 나누면 부등호 방향이 바뀝니다}.$$"
    },
    {
      "step": 5,
      "label": "A: 최종 정답",
      "latex": "$$x < \\frac{4(a-b)}{b-a} = \\frac{4(a-b)}{-(a-b)} = -4 \\Rightarrow x < -4$$"
    }
  ],
  "overlay_steps": [
    {
      "step": 1,
      "label": "P",
      "latex": "$$a > b$$"
    },
    {
      "step": 2,
      "label": "C",
      "latex": "$$(b-a)x > 4(a-b)$$"
    },
    {
      "step": 3,
      "label": "B",
      "latex": "$$b-a < 0$$"
    },
    {
      "step": 4,
      "label": "S",
      "latex": "$$x < -4$$"
    },
    {
      "step": 5,
      "label": "A",
      "latex": "$$\\text{정답: } x < -4$$"
    }
  ],
  "answerType": "multiple_choice",
  "choices": [
    "$x < -4$",
    "$x > -4$",
    "$x \\le -4$",
    "$x \\ge -4$",
    "$x = -4$"
  ],
  "correctAnswer": "1",
  "correctChoiceIndex": 0,
  "A": "1",
  "finalAnswer": "정답: x < -4"
};

fs.writeFileSync(targetPath, JSON.stringify(newData, null, 2), 'utf8');
console.log("Surgically fixed 004.json");
