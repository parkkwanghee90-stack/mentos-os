import fs from 'fs';

const steps = [
  {
    "step": 1,
    "narration": "지수함수의 적분입니다. e^x는 자기 자신으로 적분되고, a^x는 ln a로 나누어줍니다.",
    "visuals": {
      "title": "개념 1. 지수함수의 적분",
      "question": "\\int e^x dx \\text{ 와 } \\int a^x dx \\text{ 를 구하시오.}",
      "solution": "\\int e^x dx = e^x + C \\\\ \\int a^x dx = \\frac{a^x}{\\ln a} + C"
    }
  },
  {
    "step": 2,
    "narration": "로그함수의 적분입니다. ln x의 적분은 x ln x - x 로 암기하는 것이 좋습니다.",
    "visuals": {
      "title": "개념 2. 로그함수의 적분",
      "question": "\\int \\ln x dx \\text{ 를 구하시오.}",
      "solution": "\\text{부분적분법을 이용: } \\int 1 \\cdot \\ln x dx \\\\ u = \\ln x, v' = 1 \\implies u' = 1/x, v = x \\\\ \\int \\ln x dx = x \\ln x - \\int x \\cdot \\frac{1}{x} dx = x \\ln x - x + C"
    }
  },
  {
    "step": 3,
    "narration": "삼각함수의 기본적인 적분입니다. 미분의 역과정임을 기억하세요.",
    "visuals": {
      "title": "개념 3. 삼각함수의 적분",
      "question": "\\int \\sin x dx, \\int \\cos x dx, \\int \\sec^2 x dx \\text{ 를 구하시오.}",
      "solution": "\\int \\sin x dx = -\\cos x + C \\\\ \\int \\cos x dx = \\sin x + C \\\\ \\int \\sec^2 x dx = \\tan x + C"
    }
  },
  {
    "step": 4,
    "narration": "치환적분법의 기본 원리입니다. 복잡한 식의 일부를 t로 치환하여 dt를 만들어냅니다.",
    "visuals": {
      "title": "개념 4. 치환적분법 (Substitution)",
      "question": "\\int f(g(x))g'(x) dx \\text{ 의 풀이법을 설명하시오.}",
      "solution": "g(x) = t \\text{ 라 하면 } g'(x)dx = dt \\\\ \\int f(t) dt \\text{ 를 계산한 후 다시 x를 대입한다.}"
    }
  },
  {
    "step": 5,
    "narration": "부분적분법의 공식입니다. 두 함수의 곱의 적분에 사용됩니다.",
    "visuals": {
      "title": "개념 5. 부분적분법 (Integration by Parts)",
      "question": "\\int u v' dx \\text{ 의 공식을 기술하시오.}",
      "solution": "\\int u v' dx = uv - \\int u' v dx \\\\ \\text{(로다삼지: 로그, 다항, 삼각, 지수함수 순으로 u를 잡음)}"
    }
  },
  {
    "step": 6,
    "narration": "역함수의 적분법입니다. 기하학적 의미를 파악하는 것이 중요합니다.",
    "visuals": {
      "title": "개념 6. 역함수의 적분",
      "question": "f(x) \\text{ 의 역함수를 } g(x) \\text{ 라 할 때, } \\int_{a}^{b} f(x)dx + \\int_{f(a)}^{f(b)} g(x)dx \\text{ 의 값은?}",
      "solution": "b f(b) - a f(a) \\\\ \\text{(그래프를 그렸을 때 큰 직사각형에서 작은 직사각형을 뺀 넓이)}"
    }
  },
  {
    "step": 7,
    "narration": "예제 1. 간단한 지수함수 치환적분입니다.",
    "visuals": {
      "title": "예제 1. 지수함수 치환적분",
      "question": "\\int x e^{x^2} dx \\text{ 를 구하시오.}",
      "solution": "x^2 = t \\implies 2x dx = dt \\implies x dx = \\frac{1}{2}dt \\\\ \\int \\frac{1}{2}e^t dt = \\frac{1}{2}e^{x^2} + C"
    }
  },
  {
    "step": 8,
    "narration": "예제 2. 분수 함수의 치환적분입니다. 분모의 미분이 분자에 있을 때입니다.",
    "visuals": {
      "title": "예제 2. f'/f 꼴의 적분",
      "question": "\\int \\frac{2x+3}{x^2+3x+1} dx \\text{ 를 구하시오.}",
      "solution": "x^2+3x+1 = t \\implies (2x+3)dx = dt \\\\ \\int \\frac{1}{t} dt = \\ln |x^2+3x+1| + C"
    }
  },
  {
    "step": 9,
    "narration": "예제 3. 부분분수를 이용한 유리함수의 적분입니다.",
    "visuals": {
      "title": "예제 3. 부분분수 적분",
      "question": "\\int \\frac{1}{x^2-1} dx \\text{ 를 구하시오.}",
      "solution": "\\int \\frac{1}{2}(\\frac{1}{x-1} - \\frac{1}{x+1}) dx = \\frac{1}{2}(\\ln|x-1| - \\ln|x+1|) + C"
    }
  },
  {
    "step": 10,
    "narration": "예제 4. 다항함수와 지수함수의 부분적분입니다.",
    "visuals": {
      "title": "예제 4. 부분적분 기초",
      "question": "\\int x e^x dx \\text{ 를 구하시오.}",
      "solution": "u=x, v'=e^x \\implies u'=1, v=e^x \\\\ x e^x - \\int e^x dx = x e^x - e^x + C"
    }
  },
  {
    "step": 11,
    "narration": "예제 5. 삼각함수의 제곱 적분입니다. 반각공식을 활용합니다.",
    "visuals": {
      "title": "예제 5. 삼각함수 반각 활용",
      "question": "\\int \\sin^2 x dx \\text{ 를 구하시오.}",
      "solution": "\\int \\frac{1-\\cos 2x}{2} dx = \\frac{1}{2}x - \\frac{1}{4}\\sin 2x + C"
    }
  },
  {
    "step": 12,
    "narration": "예제 6. 탄젠트 함수의 적분입니다. 치환적분을 이용합니다.",
    "visuals": {
      "title": "예제 6. tan x 의 적분",
      "question": "\\int \\tan x dx \\text{ 를 구하시오.}",
      "solution": "\\int \\frac{\\sin x}{\\cos x} dx \\quad (\\cos x = t \\implies -\\sin x dx = dt) \\\\ = -\\int \\frac{1}{t} dt = -\\ln |\\cos x| + C = \\ln |\\sec x| + C"
    }
  },
  {
    "step": 13,
    "narration": "예제 7. 복합 치환적분 문제입니다. ln x를 t로 치환합니다.",
    "visuals": {
      "title": "예제 7. 로그함수 치환적분",
      "question": "\\int \\frac{(\\ln x)^2}{x} dx \\text{ 를 구하시오.}",
      "solution": "\\ln x = t \\implies \\frac{1}{x}dx = dt \\\\ \\int t^2 dt = \\frac{1}{3}t^3 = \\frac{1}{3}(\\ln x)^3 + C"
    }
  },
  {
    "step": 14,
    "narration": "예제 8. 역함수 정적분 실전 문제입니다.",
    "visuals": {
      "title": "예제 8. 역함수 정적분 응용",
      "question": "f(x) = x^3+x+1 \\text{ 일 때, } \\int_0^1 f(x)dx + \\int_1^3 f^{-1}(x)dx \\text{ 를 구하시오.}",
      "solution": "f(0)=1, f(1)=3 \\text{ 이므로 } \\\\ 1 \\cdot f(1) - 0 \\cdot f(0) = 1 \\cdot 3 - 0 = 3"
    }
  },
  {
    "step": 15,
    "narration": "예제 9. 순환형 부분적분입니다. e^x와 삼각함수의 곱 형태입니다.",
    "visuals": {
      "title": "예제 9. 순환 부분적분 (Advanced)",
      "question": "\\int e^x \\sin x dx \\text{ 를 구하시오.}",
      "solution": "I = e^x \\sin x - \\int e^x \\cos x dx \\\\ I = e^x \\sin x - (e^x \\cos x + \\int e^x \\sin x dx) \\\\ I = e^x \\sin x - e^x \\cos x - I \\\\ 2I = e^x(\\sin x - \\cos x) \\implies I = \\frac{e^x(\\sin x - \\cos x)}{2} + C"
    }
  }
];

const unit = {
  "id": "미적분_적분법",
  "title": "미적분 - 여러 가지 적분법 (심화)",
  "subject": "미적분",
  "steps": steps
};

fs.writeFileSync('./public/premium_lectures/미적분_적분법.json', JSON.stringify(unit, null, 2));

console.log('Advanced Calculus Integration unit created with 15 examples!');
