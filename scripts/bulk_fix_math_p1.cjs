const fs = require('fs');
const path = 'public/math_hints/고차방정식2단계';
const registryPath = 'src/data/math_problem_texts.json';

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

const problems = {
  "007": {
    "title": "사차방정식 $x^4 - 2x^3 + x - 2 = 0$의 해를 구합니다.",
    "logic": [
      "x^3(x-2) + (x-2) = 0 \\\\\\\\ (x-2)(x^3+1) = 0 \\\\\\\\ (x-2)(x+1)(x^2-x+1) = 0 \\text{입니다.}",
      "x = 2 \\text{ 또는 } x = -1 \\text{ 또는 } x = \\frac{1 \\pm \\sqrt{3}i}{2} \\text{입니다.}",
      "정답은 ⑤번입니다."
    ],
    "choices": ["x = \\pm 1, \\frac{1 \\pm \\sqrt{3}i}{2}", "x = \\pm 1, \\pm 2", "x = \\pm 2, \\frac{1 \\pm \\sqrt{3}i}{2}", "x = 1, -2, \\frac{1 \\pm \\sqrt{3}i}{2}", "x = -1, 2, \\frac{1 \\pm \\sqrt{3}i}{2}"],
    "correctIndex": 4
  },
  "008": {
    "title": "사차방정식 $x^4 - 2x^2 - 3x - 2 = 0$의 모든 실근의 합을 구합니다.",
    "logic": [
      "f(x) = x^4 - 2x^2 - 3x - 2 \\text{라 하면, } f(-1) = 1-2+3-2 = 0, f(2) = 16-8-6-2 = 0 \\text{입니다.}",
      "(x+1)(x-2)(x^2+x+1) = 0 \\text{으로 인수분해됩니다.}",
      "실근은 x = -1, 2 \\text{이며, } x^2+x+1=0 \\text{은 허근을 갖습니다.}",
      "모든 실근의 합은 -1 + 2 = 1 \\text{입니다. 정답은 ④번입니다.}"
    ],
    "choices": ["-2", "-1", "0", "1", "2"],
    "correctIndex": 3
  },
  "009": {
    "title": "사차방정식 $x^4 - x^3 - 3x^2 + 5x - 2 = 0$의 해를 구합니다.",
    "logic": [
      "f(x) = x^4 - x^3 - 3x^2 + 5x - 2 \\text{라 하면, } f(1) = 0, f(-2) = 16+8-12-10-2 = 0 \\text{입니다.}",
      "(x-1)^2(x+2)(x-1) = 0 \\text{ (중근 발생) } \\\\\\\\ (x-1)^3(x+2) = 0 \\text{입니다.}",
      "따라서 해는 x = 1 (삼중근) 또는 x = -2 \\text{입니다. 정답은 ②번입니다.}"
    ],
    "choices": ["x = \\pm 1, -2", "x = 1, -2", "x = \\pm 1, \\pm 2", "x = -1, 2", "x = 1, \\pm 2"],
    "correctIndex": 1
  },
  "010": {
    "title": "방정식 $(x^2-x)^2 - 5(x^2-x) + 6 = 0$의 모든 정수인 근의 합을 구합니다.",
    "logic": [
      "x^2-x = t \\text{로 치환하면, } t^2-5t+6=0 \\\\\\\\ (t-2)(t-3)=0 \\text{이므로 } t=2, 3 \\text{입니다.}",
      "(i) x^2-x=2 \\Rightarrow (x-2)(x+1)=0 \\Rightarrow x=2, -1 (\\text{정수})",
      "(ii) x^2-x=3 \\Rightarrow x^2-x-3=0 \\Rightarrow x = \\frac{1 \\pm \\sqrt{13}}{2} (\\text{무리수})",
      "따라서 정수인 근의 합은 2 + (-1) = 1 \\text{입니다. 정답은 ④번입니다.}"
    ],
    "choices": ["-2", "-1", "0", "1", "2"],
    "correctIndex": 3
  },
  "011": {
    "title": "방정식 $(x^2-x)^2 - 8(x^2-x-1) + 4 = 0$의 실근 중 가장 큰 근과 가장 작은 근의 합을 구합니다.",
    "logic": [
      "x^2-x = t \\text{로 치환하면, } t^2-8(t-1)+4 = t^2-8t+12 = 0 \\text{입니다.}",
      "(t-2)(t-6)=0 \\text{이므로 } t=2, 6 \\text{입니다.}",
      "(i) x^2-x=2 \\Rightarrow x=2, -1",
      "(ii) x^2-x=6 \\Rightarrow x=3, -2",
      "모든 근은 실근이며, 가장 큰 근은 3, 가장 작은 근은 -2입니다. 합은 1입니다.",
      "정답은 ①번입니다."
    ],
    "choices": ["1", "2", "3", "4", "5"],
    "correctIndex": 0
  },
  "012": {
    "title": "방정식 $(x^2 + x + 1)^2 - 4(x^2 + x) - 9 = 0$의 실근의 곱 a, 허근의 합 b에 대하여 b-a를 구합니다.",
    "logic": [
      "x^2+x = t \\text{로 치환하면, } (t+1)^2 - 4t - 9 = t^2 - 2t - 8 = 0 \\text{입니다.}",
      "(t-4)(t+2)=0 \\text{이므로 } t=4, -2 \\text{입니다.}",
      "(i) x^2+x-4=0 (\\text{실근}) \\Rightarrow \\text{곱 } a = -4",
      "(ii) x^2+x+2=0 (\\text{허근}) \\Rightarrow \\text{합 } b = -1",
      "b - a = -1 - (-4) = 3 \\text{입니다. 정답은 ④번입니다.}"
    ],
    "choices": ["-5", "-3", "1", "3", "5"],
    "correctIndex": 3
  },
  "013": {
    "title": "삼차방정식 $x^3 + 4x^2 + x - 6 = 0$의 세 근의 합, 곱의 합, 곱을 차례로 구합니다.",
    "logic": [
      "근과 계수의 관계에 의해, } \\\\\\\\ \\text{세 근의 합: } -4, \\\\\\\\ \\text{두 근의 곱의 합: } 1, \\\\\\\\ \\text{세 근의 곱: } 6 \\text{입니다.}",
      "정답은 ①번입니다."
    ],
    "choices": ["-4, 1, 6", "4, 1, -6", "-4, -1, 6", "4, -1, 6", "-4, 1, -6"],
    "correctIndex": 0
  },
  "014": {
    "title": "삼차방정식 $5x^3 + 10x^2 + 4x + 20 = 0$의 세 근의 합, 곱의 합, 곱을 차례로 구합니다.",
    "logic": [
      "근과 계수의 관계에 의해, } \\\\\\\\ \\text{합: } -10/5 = -2, \\\\\\\\ \\text{곱의 합: } 4/5, \\\\\\\\ \\text{곱: } -20/5 = -4 \\text{입니다.}",
      "정답은 ③번입니다."
    ],
    "choices": ["-2, 4/5, 4", "-2, -4/5, -4", "-2, 4/5, -4", "2, 4/5, -4", "2, -4/5, -4"],
    "correctIndex": 2
  },
  "015": {
    "title": "삼차방정식 $x^3 - x^2 + 2x - 1 = 0$의 세 근의 합, 곱의 합, 곱을 차례로 구합니다.",
    "logic": [
      "근과 계수의 관계에 의해, } \\\\\\\\ \\text{합: } 1, \\\\\\\\ \\text{곱의 합: } 2, \\\\\\\\ \\text{곱: } 1 \\text{입니다.}",
      "정답은 ②번입니다."
    ],
    "choices": ["-1, 2, -1", "1, 2, 1", "-1, -2, -1", "1, -2, 1", "-1, 2, 1"],
    "correctIndex": 1
  }
};

for (const [id, info] of Object.entries(problems)) {
  const fileName = `${id}.json`;
  const filePath = `${path}/${fileName}`;
  
  const steps = [
    { step: 1, label: "P: 문제에서 구하는 것 확인", latex: `\\text{${info.title}}` }
  ];
  
  info.logic.forEach((text, i) => {
    steps.push({ step: i + 2, label: i === info.logic.length - 1 ? "A: 최종 정답 도출" : "S: 풀이 과정", latex: text });
  });

  const json = {
    type: "geometry",
    viewBox: { x: [-5, 5], y: [-5, 5] },
    steps: steps,
    choices: info.choices,
    finalAnswer: info.choices[info.correctIndex],
    correctAnswer: (info.correctIndex + 1).toString(),
    answerType: "multiple_choice",
    correctChoiceIndex: info.correctIndex,
    explanationFinalLine: `따라서 정답은 ${['①', '②', '③', '④', '⑤'][info.correctIndex]}번입니다.`,
    status: "complete",
    pcbsa_completed: true
  };

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
  console.log(`Restored ${fileName}`);
}
