import fs from 'fs';

const steps = [
  {
    "step": 1,
    "narration": "삼각함수 극한의 가장 기본적인 공식입니다. x가 0으로 갈 때 sin x / x 는 1로 수렴합니다.",
    "visuals": {
      "title": "개념 1. sin x / x 의 극한",
      "question": "\\lim_{x \\to 0} \\frac{\\sin x}{x} \\text{ 의 값을 구하시오.}",
      "solution": "1 \\\\ \\text{*주의: x는 라디안(radian) 단위여야 함}"
    }
  },
  {
    "step": 2,
    "narration": "탄젠트 함수의 극한입니다. 사인과 마찬가지로 1로 수렴합니다.",
    "visuals": {
      "title": "개념 2. tan x / x 의 극한",
      "question": "\\lim_{x \\to 0} \\frac{\\tan x}{x} \\text{ 의 값을 구하시오.}",
      "solution": "\\lim \\frac{\\sin x}{x \\cos x} = 1 \\cdot \\frac{1}{1} = 1"
    }
  },
  {
    "step": 3,
    "narration": "코사인 함수가 포함된 극한입니다. 분자 분모에 1+cos x를 곱하여 유리화하듯 계산합니다.",
    "visuals": {
      "title": "개념 3. 1 - cos x 의 극한",
      "question": "\\lim_{x \\to 0} \\frac{1-\\cos x}{x^2} \\text{ 의 값을 구하시오.}",
      "solution": "\\lim \\frac{(1-\\cos x)(1+\\cos x)}{x^2(1+\\cos x)} = \\lim \\frac{\\sin^2 x}{x^2(1+\\cos x)} = 1 \\cdot \\frac{1}{2} = 1/2"
    }
  },
  {
    "step": 4,
    "narration": "계수 맞추기 유형입니다. 분모와 각도를 일치시켜야 합니다.",
    "visuals": {
      "title": "유형 1. 계수 비교 (sin)",
      "question": "\\lim_{x \\to 0} \\frac{\\sin 3x}{2x} \\text{ 의 값을 구하시오.}",
      "solution": "\\lim \\frac{\\sin 3x}{3x} \\cdot \\frac{3}{2} = 1 \\cdot 3/2 = 3/2"
    }
  },
  {
    "step": 5,
    "narration": "탄젠트와 사인이 복합된 극한 문제입니다.",
    "visuals": {
      "title": "유형 2. 복합 극한 (tan/sin)",
      "question": "\\lim_{x \\to 0} \\frac{\\tan 2x}{\\sin 5x} \\text{ 의 값을 구하시오.}",
      "solution": "\\lim \\frac{(\\tan 2x)/2x \\cdot 2x}{(\\sin 5x)/5x \\cdot 5x} = \\frac{1 \\cdot 2}{1 \\cdot 5} = 2/5"
    }
  },
  {
    "step": 6,
    "narration": "치환을 이용한 삼각함수 극한입니다. x가 a로 갈 때 x-a를 t로 치환합니다.",
    "visuals": {
      "title": "유형 3. 치환 극한",
      "question": "\\lim_{x \\to \\pi} \\frac{\\sin x}{x-\\pi} \\text{ 의 값을 구하시오.}",
      "solution": "x-\\pi = t \\implies x = \\pi+t \\\\ \\lim_{t \\to 0} \\frac{\\sin(\\pi+t)}{t} = \\lim_{t \\to 0} \\frac{-\\sin t}{t} = -1"
    }
  },
  {
    "step": 7,
    "narration": "미분계수의 정의와 결합된 극한 문제입니다.",
    "visuals": {
      "title": "유형 4. 미분계수 응용",
      "question": "f(x) = \\sin x \\text{ 일 때, } \\lim_{h \\to 0} \\frac{f(\\pi/2+h)-f(\\pi/2)}{h} \\text{ 를 구하시오.}",
      "solution": "f'(\\pi/2) = \\cos(\\pi/2) = 0"
    }
  },
  {
    "step": 8,
    "narration": "삼각함수 극한의 도형 응용 기초입니다.",
    "visuals": {
      "title": "유형 5. 도형 응용 (현의 길이)",
      "question": "\\text{반지름이 1인 원에서 중심각이 } \\theta \\text{ 인 현의 길이를 } l(\\theta) \\text{ 라 할 때, } \\lim_{\\theta \\to 0} \\frac{l(\\theta)}{\\theta} \\text{ 는?}",
      "solution": "l(\\theta) = 2 \\sin(\\theta/2) \\\\ \\lim \\frac{2 \\sin(\\theta/2)}{\\theta} = \\lim \\frac{\\sin(\\theta/2)}{\\theta/2} = 1"
    }
  },
  {
    "step": 9,
    "narration": "복잡한 코사인 극한 문제입니다. 1-cos(f(x)) 꼴을 주의하세요.",
    "visuals": {
      "title": "유형 6. 심화 코사인 극한",
      "question": "\\lim_{x \\to 0} \\frac{1-\\cos 2x}{x \\sin x} \\text{ 의 값을 구하시오.}",
      "solution": "\\lim \\frac{2\\sin^2 x}{x \\sin x} = \\lim \\frac{2\\sin x}{x} = 2"
    }
  },
  {
    "step": 10,
    "narration": "삼각함수의 극한 종합 문제입니다.",
    "visuals": {
      "title": "유형 7. 극한 종합",
      "question": "\\lim_{x \\to 0} \\frac{\\cos x - \\cos 3x}{x^2} \\text{ 의 값을 구하시오.}",
      "solution": "\\lim \\frac{(1-\\cos 3x) - (1-\\cos x)}{x^2} = \\frac{9}{2} - \\frac{1}{2} = 4"
    }
  }
];

const unit = {
  "id": "미적분_삼각함수극한",
  "title": "미적분 - 삼각함수의 극한",
  "subject": "미적분",
  "steps": steps
};

fs.writeFileSync('./public/premium_lectures/미적분_삼각함수극한.json', JSON.stringify(unit, null, 2));

console.log('Advanced Calculus Trig Limits unit created!');
