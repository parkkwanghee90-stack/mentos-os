import fs from 'fs';

const steps = [
  {
    "step": 1,
    "narration": "삼각함수 덧셈정리의 증명입니다. 코사인 제2법칙이나 단위원을 이용해 증명할 수 있습니다.",
    "visuals": {
      "title": "공식 1. 삼각함수의 덧셈정리 (증명)",
      "question": "\\cos(\\alpha-\\beta) = \\cos\\alpha\\cos\\beta + \\sin\\alpha\\sin\\beta \\text{ 임을 증명하시오.}",
      "solution": "\\text{단위원을 그리고 두 점 } P(\\cos\\alpha, \\sin\\alpha), Q(\\cos\\beta, \\sin\\beta) \\text{ 를 잡으면} \\\\ \\text{두 점 사이의 거리 } d^2 = (\\cos\\alpha-\\cos\\beta)^2 + (\\sin\\alpha-\\sin\\beta)^2 \\\\ d^2 = 2 - 2(\\cos\\alpha\\cos\\beta + \\sin\\alpha\\sin\\beta) \\\\ \\text{또한 코사인 법칙에 의해 } d^2 = 1^2 + 1^2 - 2(1)(1)\\cos(\\alpha-\\beta) \\\\ \\therefore \\cos(\\alpha-\\beta) = \\cos\\alpha\\cos\\beta + \\sin\\alpha\\sin\\beta"
    }
  },
  {
    "step": 2,
    "narration": "사인과 탄젠트의 덧셈정리입니다. 코사인 덧셈정리에서 유도됩니다.",
    "visuals": {
      "title": "공식 2. 사인·탄젠트 덧셈정리",
      "question": "\\sin(\\alpha+\\beta) \\text{ 와 } \\tan(\\alpha+\\beta) \\text{ 의 공식을 기술하시오.}",
      "solution": "\\sin(\\alpha+\\beta) = \\sin\\alpha\\cos\\beta + \\cos\\alpha\\sin\\beta \\\\ \\tan(\\alpha+\\beta) = \\frac{\\tan\\alpha+\\tan\\beta}{1-\\tan\\alpha\\tan\\beta}"
    }
  },
  {
    "step": 3,
    "narration": "배각공식입니다. 덧셈정리에서 알파와 베타가 같을 때 유도됩니다.",
    "visuals": {
      "title": "공식 3. 배각공식 (2배각)",
      "question": "\\sin 2\\alpha, \\cos 2\\alpha \\text{ 를 } \\sin\\alpha, \\cos\\alpha \\text{ 로 나타내고 증명하시오.}",
      "solution": "\\sin(a+a) = \\sin a \\cos a + \\cos a \\sin a = 2\\sin a \\cos a \\\\ \\cos(a+a) = \\cos a \\cos a - \\sin a \\sin a = \\cos^2 a - \\sin^2 a \\\\ = 2\\cos^2 a - 1 = 1 - 2\\sin^2 a"
    }
  },
  {
    "step": 4,
    "narration": "반각공식입니다. 코사인 배각공식에서 유도됩니다. 적분에서 매우 중요하게 쓰입니다.",
    "visuals": {
      "title": "공식 4. 반각공식",
      "question": "\\sin^2 \\frac{\\alpha}{2} \\text{ 와 } \\cos^2 \\frac{\\alpha}{2} \\text{ 를 } \\cos\\alpha \\text{ 로 나타내시오.}",
      "solution": "\\cos 2\\theta = 1-2\\sin^2\\theta \\implies \\sin^2\\theta = \\frac{1-\\cos 2\\theta}{2} \\\\ \\text{따라서, } \\sin^2 \\frac{\\alpha}{2} = \\frac{1-\\cos\\alpha}{2}, \\quad \\cos^2 \\frac{\\alpha}{2} = \\frac{1+\\cos\\alpha}{2}"
    }
  },
  {
    "step": 5,
    "narration": "삼배각공식입니다. 덧셈정리와 배각공식을 결합하여 증명합니다.",
    "visuals": {
      "title": "공식 5. 삼배각공식",
      "question": "\\sin 3\\alpha \\text{ 를 } \\sin\\alpha \\text{ 로만 나타내고 증명하시오.}",
      "solution": "\\sin 3a = \\sin(2a+a) = \\sin 2a \\cos a + \\cos 2a \\sin a \\\\ = (2\\sin a \\cos a)\\cos a + (1-2\\sin^2 a)\\sin a \\\\ = 2\\sin a (1-\\sin^2 a) + \\sin a - 2\\sin^3 a \\\\ = 3\\sin a - 4\\sin^3 a"
    }
  },
  {
    "step": 6,
    "narration": "코사인 삼배각공식입니다. 같은 방식으로 증명합니다.",
    "visuals": {
      "title": "공식 6. 코사인 삼배각",
      "question": "\\cos 3\\alpha \\text{ 를 } \\cos\\alpha \\text{ 로만 나타내고 증명하시오.}",
      "solution": "\\cos 3a = \\cos(2a+a) = \\cos 2a \\cos a - \\sin 2a \\sin a \\\\ = (2\\cos^2 a - 1)\\cos a - (2\\sin a \\cos a)\\sin a \\\\ = 2\\cos^3 a - \\cos a - 2\\cos a(1-\\cos^2 a) \\\\ = 4\\cos^3 a - 3\\cos a"
    }
  },
  {
    "step": 7,
    "narration": "삼각함수의 합성입니다. 서로 다른 사인과 코사인을 하나의 사인함수로 합칩니다.",
    "visuals": {
      "title": "공식 7. 삼각함수의 합성 (증명)",
      "question": "a\\sin x + b\\cos x = \\sqrt{a^2+b^2}\\sin(x+\\alpha) \\text{ 임을 증명하시오.}",
      "solution": "\\sqrt{a^2+b^2} \\left( \\frac{a}{\\sqrt{a^2+b^2}}\\sin x + \\frac{b}{\\sqrt{a^2+b^2}}\\cos x \\right) \\\\ \\frac{a}{\\sqrt{a^2+b^2}} = \\cos\\alpha, \\quad \\frac{b}{\\sqrt{a^2+b^2}} = \\sin\\alpha \\text{ 라 하면} \\\\ = \\sqrt{a^2+b^2}(\\sin x \\cos\\alpha + \\cos x \\sin\\alpha) \\\\ = \\sqrt{a^2+b^2}\\sin(x+\\alpha)"
    }
  },
  {
    "step": 8,
    "narration": "예제 1. 덧셈정리를 이용해 특수각이 아닌 삼각함수의 값을 구합니다.",
    "visuals": {
      "title": "예제 1. 75도의 삼각함수",
      "question": "\\sin 75^\\circ \\text{ 의 값을 구하시오.}",
      "solution": "\\sin(45+30) = \\sin 45 \\cos 30 + \\cos 45 \\sin 30 \\\\ = \\frac{\\sqrt{2}}{2} \\cdot \\frac{\\sqrt{3}}{2} + \\frac{\\sqrt{2}}{2} \\cdot \\frac{1}{2} = \\frac{\\sqrt{6}+\\sqrt{2}}{4}"
    }
  },
  {
    "step": 9,
    "narration": "예제 2. 배각공식을 활용한 방정식 풀이입니다.",
    "visuals": {
      "title": "예제 2. 배각공식 활용",
      "question": "\\sin 2x = \\cos x (0 \\le x < 2\\pi) \\text{ 의 해를 구하시오.}",
      "solution": "2\\sin x \\cos x = \\cos x \\implies \\cos x(2\\sin x - 1) = 0 \\\\ \\cos x = 0 \\implies x = \\pi/2, 3\\pi/2 \\\\ \\sin x = 1/2 \\implies x = \\pi/6, 5\\pi/6"
    }
  },
  {
    "step": 10,
    "narration": "예제 3. 합성을 이용한 최대·최소 문제입니다.",
    "visuals": {
      "title": "예제 3. 합성의 활용",
      "question": "f(x) = \\sin x + \\sqrt{3}\\cos x \\text{ 의 최댓값을 구하시오.}",
      "solution": "f(x) = 2(\\frac{1}{2}\\sin x + \\frac{\\sqrt{3}}{2}\\cos x) = 2\\sin(x+\\pi/3) \\\\ \\therefore \\text{최댓값 } = 2"
    }
  }
];

const unit = {
  "id": "미적분_삼각함수공식",
  "title": "미적분 - 삼각함수의 여러 가지 공식 (증명 포함)",
  "subject": "미적분",
  "steps": steps
};

fs.writeFileSync('./public/premium_lectures/미적분_삼각함수공식.json', JSON.stringify(unit, null, 2));

console.log('Advanced Calculus Trig Formulas unit created with proofs!');
