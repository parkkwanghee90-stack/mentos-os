const fs = require('fs');
const path = 'public/math_hints/고차방정식2단계';

const problems = {
  "008": {
    "title": "사차방정식 $x^4 - 2x^2 - 3x - 2 = 0$의 모든 실근의 합을 구합니다.",
    "logic": [
      "f(x) = x^4 - 2x^2 - 3x - 2 \\text{라 하면, } f(-1) = 0, f(2) = 0 \\text{임을 알 수 있습니다.}",
      "\\text{조립제법을 이용하면, } (x+1)(x-2)(x^2+x+1) = 0 \\text{으로 인수분해됩니다.}",
      "x^2+x+1=0 \\text{은 허근을 가지므로, 실근은 } x = -1, 2 \\text{입니다.}",
      "\\text{따라서 모든 실근의 합은 } -1 + 2 = 1 \\text{입니다. 정답은 ④번입니다.}"
    ],
    "choices": ["-2", "-1", "0", "1", "2"],
    "correctIndex": 3
  },
  "009": {
    "title": "사차방정식 $x^4 - x^3 - 3x^2 + 5x - 2 = 0$의 해를 구합니다.",
    "logic": [
      "f(x) = x^4 - x^3 - 3x^2 + 5x - 2 \\text{라 하면, } f(1) = 0, f(-2) = 0 \\text{임을 알 수 있습니다.}",
      "\\text{조립제법을 반복 적용하면, } (x-1)^3(x+2) = 0 \\text{으로 인수분해됩니다.}",
      "\\text{따라서 방정식의 해는 } x = 1 \\text{ (삼중근) 또는 } x = -2 \\text{입니다. }",
      "\\text{정답은 ②번입니다.}"
    ],
    "choices": ["x = \\pm 1, -2", "x = 1, -2", "x = \\pm 1, \\pm 2", "x = -1, 2", "x = 1, \\pm 2"],
    "correctIndex": 1
  },
  "010": {
    "title": "방정식 $(x^2-x)^2 - 5(x^2-x) + 6 = 0$의 모든 정수인 근의 합을 구합니다.",
    "logic": [
      "x^2-x = t \\text{로 치환하면, } t^2 - 5t + 6 = 0 \\text{이 되고, } (t-2)(t-3) = 0 \\text{입니다.}",
      "x^2-x=2 \\text{에서 } (x-2)(x+1)=0 \\text{이므로 } x=2, -1 \\text{ (정수근)입니다.}",
      "x^2-x=3 \\text{에서 } x^2-x-3=0 \\text{이므로 } x = \\frac{1 \\pm \\sqrt{13}}{2} \\text{ (무리수근)입니다.}",
      "\\text{따라서 모든 정수인 근의 합은 } 2 + (-1) = 1 \\text{입니다. 정답은 ④번입니다.}"
    ],
    "choices": ["-2", "-1", "0", "1", "2"],
    "correctIndex": 3
  }
};

for (const [id, info] of Object.entries(problems)) {
  const json = {
    type: "geometry",
    viewBox: { x: [-5, 5], y: [-5, 5] },
    steps: [
      { step: 1, label: "P: 문제에서 구하는 것 확인", latex: `\\text{${info.title.replace(/\$/g, '')}}` }
    ],
    choices: info.choices.map(c => c.includes('$') ? c : `$${c}$`),
    finalAnswer: info.choices[info.correctIndex].includes('$') ? info.choices[info.correctIndex] : `$${info.choices[info.correctIndex]}$`,
    correctAnswer: (info.correctIndex + 1).toString(),
    answerType: "multiple_choice",
    correctChoiceIndex: info.correctIndex,
    explanationFinalLine: `따라서 정답은 ${['①', '②', '③', '④', '⑤'][info.correctIndex]}번입니다.`,
    status: "complete",
    pcbsa_completed: true
  };

  info.logic.forEach((text, i) => {
    json.steps.push({
      step: i + 2,
      label: i === info.logic.length - 1 ? "A: 최종 정답 도출" : "S: 풀이 과정",
      latex: text.replace(/\. /g, '. \\\\\\\\ ').replace(/, /g, ', \\\\\\\\ ')
    });
  });

  fs.writeFileSync(`${path}/${id}.json`, JSON.stringify(json, null, 2), 'utf8');
  console.log(`Fixed ${id}.json`);
}
