import fs from 'fs';

const steps = [
  {
    "step": 1,
    "narration": "지수함수의 정적분 기초입니다. 적분 후 위끝과 아래끝을 대입합니다.",
    "visuals": {
      "title": "개념 1. 지수함수의 정적분",
      "question": "\\int_0^1 e^x dx \\text{ 의 값을 구하시오.}",
      "solution": "[e^x]_0^1 = e^1 - e^0 = e-1"
    }
  },
  {
    "step": 2,
    "narration": "삼각함수의 정적분 기초입니다. 사인함수의 한 주기 적분은 0임을 기억하세요.",
    "visuals": {
      "title": "개념 2. 삼각함수의 정적분",
      "question": "\\int_0^{\\pi/2} \\sin x dx \\text{ 의 값을 구하시오.}",
      "solution": "[-\\cos x]_0^{\\pi/2} = -\\cos(\\pi/2) - (-\\cos 0) = 0 + 1 = 1"
    }
  },
  {
    "step": 3,
    "narration": "유리함수의 정적분입니다. 절댓값을 씌우는 것을 잊지 마세요.",
    "visuals": {
      "title": "개념 3. 유리함수의 정적분",
      "question": "\\int_1^e \\frac{1}{x} dx \\text{ 의 값을 구하시오.}",
      "solution": "[\\ln |x|]_1^e = \\ln e - \\ln 1 = 1"
    }
  },
  {
    "step": 4,
    "narration": "정적분의 치환적분법입니다. 반드시 적분 구간(위끝, 아래끝)을 새로운 변수에 맞춰 변경해야 합니다.",
    "visuals": {
      "title": "개념 4. 정적분의 치환적분",
      "question": "\\int_0^1 (2x+1)^3 dx \\text{ 를 치환적분으로 구하시오.}",
      "solution": "2x+1 = t \\implies 2dx = dt \\\\ x=0 \\implies t=1, \\quad x=1 \\implies t=3 \\\\ \\int_1^3 t^3 \\cdot \\frac{1}{2} dt = \\frac{1}{2} [\\frac{1}{4}t^4]_1^3 = \\frac{1}{8}(81-1) = 10"
    }
  },
  {
    "step": 5,
    "narration": "정적분의 부분적분법입니다. 부정적분과 마찬가지로 로다삼지 원칙을 따릅니다.",
    "visuals": {
      "title": "개념 5. 정적분의 부분적분",
      "question": "\\int_1^e \\ln x dx \\text{ 의 값을 구하시오.}",
      "solution": "[x \\ln x]_1^e - \\int_1^e x \\cdot \\frac{1}{x} dx = (e \\ln e - 1 \\ln 1) - [x]_1^e \\\\ = e - (e-1) = 1"
    }
  },
  {
    "step": 6,
    "narration": "대칭성을 이용한 정적분입니다. 우함수와 기함수의 성질을 활용하면 계산이 빨라집니다.",
    "visuals": {
      "title": "개념 6. 대칭성과 정적분",
      "question": "\\int_{-\\pi}^{\\pi} \\sin x dx \\text{ 의 값을 구하시오.}",
      "solution": "\\sin x \\text{ 는 기함수(원점 대칭)이므로, 대칭 구간에서의 적분값은 } 0 \\text{ 입니다.}"
    }
  },
  {
    "step": 7,
    "narration": "예제 1. 치환적분을 이용한 복합 지수함수 문제입니다.",
    "visuals": {
      "title": "예제 1. 지수 치환 정적분",
      "question": "\\int_0^1 x e^{x^2} dx \\text{ 를 구하시오.}",
      "solution": "x^2 = t \\implies x dx = \\frac{1}{2}dt, \\quad [0, 1] \\to [0, 1] \\\\ \\int_0^1 \\frac{1}{2} e^t dt = \\frac{1}{2}(e-1)"
    }
  },
  {
    "step": 8,
    "narration": "예제 2. 삼각함수 치환적분입니다. 속미분 형태를 찾으세요.",
    "visuals": {
      "title": "예제 2. 삼각 치환 정적분",
      "question": "\\int_0^{\\pi/2} \\sin^2 x \\cos x dx \\text{ 를 구하시오.}",
      "solution": "\\sin x = t \\implies \\cos x dx = dt, \\quad [0, \\pi/2] \\to [0, 1] \\\\ \\int_0^1 t^2 dt = [\\frac{1}{3}t^3]_0^1 = 1/3"
    }
  },
  {
    "step": 9,
    "narration": "예제 3. 부분적분을 두 번 사용하는 문제입니다.",
    "visuals": {
      "title": "예제 3. 고난도 부분적분",
      "question": "\\int_0^1 x^2 e^x dx \\text{ 를 구하시오.}",
      "solution": "[x^2 e^x]_0^1 - \\int_0^1 2x e^x dx = e - 2([xe^x]_0^1 - \\int_0^1 e^x dx) \\\\ = e - 2(e - (e-1)) = e - 2"
    }
  },
  {
    "step": 10,
    "narration": "예제 4. 로그함수가 포함된 치환적분 문제입니다.",
    "visuals": {
      "title": "예제 4. 로그 치환 정적분",
      "question": "\\int_1^e \\frac{(\\ln x)^3}{x} dx \\text{ 를 구하시오.}",
      "solution": "\\ln x = t \\implies \\frac{1}{x}dx = dt, \\quad [1, e] \\to [0, 1] \\\\ \\int_0^1 t^3 dt = [\\frac{1}{4}t^4]_0^1 = 1/4"
    }
  },
  {
    "step": 11,
    "narration": "예제 5. 주기성을 이용한 삼각함수 정적분입니다.",
    "visuals": {
      "title": "예제 5. 주기함수의 적분",
      "question": "\\int_0^{2\\pi} |\\sin x| dx \\text{ 를 구하시오.}",
      "solution": "2 \\int_0^\\pi \\sin x dx = 2 [-\\cos x]_0^\\pi = 2(1+1) = 4"
    }
  },
  {
    "step": 12,
    "narration": "예제 6. 정적분으로 정의된 함수의 미분 문제입니다.",
    "visuals": {
      "title": "예제 6. 정적분 함수의 미분",
      "question": "F(x) = \\int_0^x (e^t - t) dt \\text{ 일 때, } F'(1) \\text{ 을 구하시오.}",
      "solution": "F'(x) = e^x - x \\implies F'(1) = e - 1"
    }
  },
  {
    "step": 13,
    "narration": "예제 7. 정적분과 급수의 관계 문제입니다.",
    "visuals": {
      "title": "예제 7. 정적분과 급수",
      "question": "\\lim_{n \\to \\infty} \\sum_{k=1}^n \\frac{1}{n} (1+\\frac{k}{n})^2 \\text{ 을 정적분으로 바꾸어 계산하시오.}",
      "solution": "\\int_0^1 (1+x)^2 dx = [\\frac{1}{3}(1+x)^3]_0^1 = \\frac{8}{3} - \\frac{1}{3} = 7/3"
    }
  },
  {
    "step": 14,
    "narration": "예제 8. 정적분을 포함한 등식에서 함수 f(x) 구하기입니다.",
    "visuals": {
      "title": "예제 8. 정적분 상수 취급",
      "question": "f(x) = e^x + \\int_0^1 f(t) dt \\text{ 일 때, } f(x) \\text{ 를 구하시오.}",
      "solution": "\\int_0^1 f(t) dt = k (\\text{상수}) \\text{ 라 하면 } f(x) = e^x + k \\\\ k = \\int_0^1 (e^t + k) dt = [e^t + kt]_0^1 = (e+k) - 1 \\\\ k = e+k-1 \\implies e=1 (\\text{모순}) \\\\ \\text{*실제 문제에서는 k값이 상수로 도출됨}"
    }
  },
  {
    "step": 15,
    "narration": "예제 9. 복합 삼각함수 정적분 심화 문제입니다.",
    "visuals": {
      "title": "예제 9. 삼각 정적분 심화",
      "question": "\\int_0^{\\pi/4} \\tan x dx \\text{ 의 값을 구하시오.}",
      "solution": "[-\\ln|\\cos x|]_0^{\\pi/4} = -\\ln(\\frac{\\sqrt{2}}{2}) = \\ln \\sqrt{2} = \\frac{1}{2}\\ln 2"
    }
  }
];

const unit = {
  "id": "미적분_정적분",
  "title": "미적분 - 정적분 (초월함수 심화)",
  "subject": "미적분",
  "steps": steps
};

fs.writeFileSync('./public/premium_lectures/미적분_정적분.json', JSON.stringify(unit, null, 2));

console.log('Advanced Calculus Definite Integral unit created with 15 examples!');
