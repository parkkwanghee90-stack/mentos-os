import fs from 'fs';

const steps = [
  {
    "step": 1,
    "narration": "자연상수 e의 정의입니다. 무리수 e는 약 2.718... 의 값을 가집니다.",
    "visuals": {
      "title": "개념 1. 자연상수 e의 정의",
      "question": "\\text{자연상수 } e \\text{ 를 극한으로 정의하시오.}",
      "solution": "e = \\lim_{x \\to \\infty} (1+\\frac{1}{x})^x = \\lim_{x \\to 0} (1+x)^{1/x}"
    }
  },
  {
    "step": 2,
    "narration": "자연로그 ln x 의 정의입니다. 밑이 e인 로그를 자연로그라고 합니다.",
    "visuals": {
      "title": "개념 2. 자연로그",
      "question": "\\text{자연로그 } \\ln x \\text{ 의 정의는?}",
      "solution": "\\ln x = \\log_e x"
    }
  },
  {
    "step": 3,
    "narration": "로그함수의 극한 기본 공식 1입니다. ln(1+x)/x의 극한은 1입니다.",
    "visuals": {
      "title": "개념 3. 로그함수 극한 (ln)",
      "question": "\\lim_{x \\to 0} \\frac{\\ln(1+x)}{x} \\text{ 의 값을 구하시오.}",
      "solution": "\\lim \\ln(1+x)^{1/x} = \\ln e = 1"
    }
  },
  {
    "step": 4,
    "narration": "지수함수의 극한 기본 공식 1입니다. (e^x-1)/x의 극한은 1입니다.",
    "visuals": {
      "title": "개념 4. 지수함수 극한 (e)",
      "question": "\\lim_{x \\to 0} \\frac{e^x-1}{x} \\text{ 의 값을 구하시오.}",
      "solution": "e^x-1 = t \\text{ 로 치환하면 } x = \\ln(1+t) \\\\ \\lim_{t \\to 0} \\frac{t}{\\ln(1+t)} = 1"
    }
  },
  {
    "step": 5,
    "narration": "밑이 a인 로그함수의 극한입니다. 분모에 ln a가 생깁니다.",
    "visuals": {
      "title": "개념 5. 일반 로그 극한",
      "question": "\\lim_{x \\to 0} \\frac{\\log_a(1+x)}{x} \\text{ 의 값을 구하시오.}",
      "solution": "\\lim \\frac{\\ln(1+x)}{x \\ln a} = \\frac{1}{\\ln a}"
    }
  },
  {
    "step": 6,
    "narration": "밑이 a인 지수함수의 극한입니다. ln a가 곱해집니다.",
    "visuals": {
      "title": "개념 6. 일반 지수 극한",
      "question": "\\lim_{x \\to 0} \\frac{a^x-1}{x} \\text{ 의 값을 구하시오.}",
      "solution": "\\ln a"
    }
  },
  {
    "step": 7,
    "narration": "예제 1. 치환을 이용한 e의 정의 응용 문제입니다.",
    "visuals": {
      "title": "유형 1. e 정의 응용",
      "question": "\\lim_{x \\to 0} (1+3x)^{1/x} \\text{ 의 값을 구하시오.}",
      "solution": "\\lim \\{ (1+3x)^{1/3x} \\}^3 = e^3"
    }
  },
  {
    "step": 8,
    "narration": "예제 2. 로그 극한 공식의 계수 맞추기 문제입니다.",
    "visuals": {
      "title": "유형 2. 로그 극한 계산",
      "question": "\\lim_{x \\to 0} \\frac{\\ln(1+2x)}{3x} \\text{ 의 값을 구하시오.}",
      "solution": "\\lim \\frac{\\ln(1+2x)}{2x} \\cdot \\frac{2}{3} = 1 \\cdot \\frac{2}{3} = 2/3"
    }
  },
  {
    "step": 9,
    "narration": "예제 3. 지수 극한 공식의 계수 맞추기 문제입니다.",
    "visuals": {
      "title": "유형 3. 지수 극한 계산",
      "question": "\\lim_{x \\to 0} \\frac{e^{4x}-1}{x} \\text{ 의 값을 구하시오.}",
      "solution": "\\lim \\frac{e^{4x}-1}{4x} \\cdot 4 = 1 \\cdot 4 = 4"
    }
  },
  {
    "step": 10,
    "narration": "예제 4. 복합 극한 문제입니다. 분자 분모를 적절히 나눕니다.",
    "visuals": {
      "title": "유형 4. 복합 극한",
      "question": "\\lim_{x \\to 0} \\frac{e^{2x}-1}{\\ln(1+x)} \\text{ 의 값을 구하시오.}",
      "solution": "\\lim \\frac{(e^{2x}-1)/x}{\\ln(1+x)/x} = \\frac{2}{1} = 2"
    }
  }
];

const unit = {
  "id": "미적분_지수로그극한",
  "title": "미적분 - 지수함수와 로그함수의 극한",
  "subject": "미적분",
  "steps": steps
};

fs.writeFileSync('./public/premium_lectures/미적분_지수로그극한.json', JSON.stringify(unit, null, 2));

console.log('Advanced Calculus Expo/Log Limits unit created!');
