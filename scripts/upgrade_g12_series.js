import fs from 'fs';

const steps = [
  // --- Category 1: Definition & Basic Test (4 problems) ---
  {
    "step": 1,
    "narration": "급수의 정의와 수렴의 의미입니다. 부분합의 극한이 존재할 때 급수가 수렴한다고 합니다.",
    "visuals": {
      "title": "개념 1. 급수의 정의",
      "question": "\\text{급수 } \\sum_{n=1}^{\\infty} a_n \\text{ 의 수렴 여부를 판단하는 정의를 기술하시오.}",
      "solution": "S_n = \\sum_{k=1}^n a_k \\text{ (부분합)} \\\\ \\lim_{n \\to \\infty} S_n = S \\text{ (수렴)} \\\\ \\text{극한값이 없으면 발산}"
    }
  },
  {
    "step": 2,
    "narration": "급수의 수렴 판정법 기본입니다. 일반항의 극한이 0이 아니면 무조건 발산합니다.",
    "visuals": {
      "title": "개념 2. 일반항의 극한과 수렴",
      "question": "\\lim_{n \\to \\infty} a_n \\neq 0 \\text{ 일 때 급수 } \\sum a_n \\text{ 의 수렴 여부는?}",
      "solution": "\\text{반드시 발산한다.} \\\\ \\text{*주의: 역은 성립하지 않음 (조화급수 등)}"
    }
  },
  {
    "step": 3,
    "narration": "부분분수를 이용한 급수의 합 계산입니다.",
    "visuals": {
      "title": "유형 1. 부분분수 급수",
      "question": "\\sum_{n=1}^{\\infty} \\frac{1}{n(n+1)} \\text{ 의 합을 구하시오.}",
      "solution": "\\sum (\\frac{1}{n}-\\frac{1}{n+1}) = (1-1/2)+(1/2-1/3)+\\dots \\\\ S_n = 1 - \\frac{1}{n+1} \\implies \\lim S_n = 1"
    }
  },
  {
    "step": 4,
    "narration": "로그를 포함한 급수의 수렴 판정입니다.",
    "visuals": {
      "title": "유형 2. 로그 급수",
      "question": "\\sum_{n=2}^{\\infty} \\ln(1-\\frac{1}{n^2}) \\text{ 의 합을 구하시오.}",
      "solution": "\\ln(\\frac{(n-1)(n+1)}{n^2}) = \\ln(\\frac{n-1}{n}) - \\ln(\\frac{n}{n+1}) \\\\ \\text{나열 후 소거하면 } \\ln(1/2) = -\\ln 2"
    }
  },

  // --- Category 2: Geometric Series (4 problems) ---
  {
    "step": 5,
    "narration": "무한등비급수의 수렴 조건입니다. 공비의 절댓값이 1보다 작아야 합니다.",
    "visuals": {
      "title": "개념 3. 무한등비급수 수렴 조건",
      "question": "\\sum ar^{n-1} (a \\neq 0) \\text{ 이 수렴하기 위한 } r \\text{ 의 범위는?}",
      "solution": "-1 < r < 1 \\\\ \\text{*참고: 수열의 수렴 조건은 } -1 < r \\le 1"
    }
  },
  {
    "step": 6,
    "narration": "무한등비급수의 합 공식입니다. 첫항과 공비만 알면 구할 수 있습니다.",
    "visuals": {
      "title": "개념 4. 무한등비급수 합 공식",
      "question": "\\text{수렴하는 무한등비급수의 합 } S \\text{ 를 구하는 공식을 쓰시오.}",
      "solution": "S = \\frac{a}{1-r}"
    }
  },
  {
    "step": 7,
    "narration": "등비급수 응용 문제입니다. 순환소수를 분수로 바꾸는 원리와 같습니다.",
    "visuals": {
      "title": "유형 3. 등비급수 계산",
      "question": "0.121212\\dots \\text{ 를 무한등비급수를 이용하여 분수로 나타내시오.}",
      "solution": "a=0.12, \\quad r=0.01 \\implies \\frac{0.12}{1-0.01} = \\frac{12}{99} = \\frac{4}{33}"
    }
  },
  {
    "step": 8,
    "narration": "복합 등비급수 문제입니다. 각 항을 분리하여 계산합니다.",
    "visuals": {
      "title": "유형 4. 복합 등비급수",
      "question": "\\sum_{n=1}^{\\infty} \\frac{2^n+3^n}{5^n} \\text{ 의 합을 구하시오.}",
      "solution": "\\sum (2/5)^n + \\sum (3/5)^n = \\frac{2/5}{1-2/5} + \\frac{3/5}{1-3/5} = 2/3 + 3/2 = 13/6"
    }
  },

  // --- Category 3: Geometry & Fractals (7 problems) ---
  {
    "step": 9,
    "narration": "무한등비급수와 도형의 관계입니다. 닮음비를 알면 공비를 바로 구할 수 있습니다.",
    "visuals": {
      "title": "개념 5. 도형과 닮음비",
      "component": "GeometricSeriesAnimation",
      "question": "\\text{도형의 넓이가 무한히 반복될 때, 닮음비가 } k \\text{ 이면 넓이의 공비 } r \\text{ 은?}",
      "solution": "r = k^2 \\\\ \\text{부피의 경우 } r = k^3"
    }
  },
  {
    "step": 10,
    "narration": "정사각형 속에 그려지는 무한 도형 문제입니다. 첫 넓이 a와 닮음비 r을 찾는 것이 핵심입니다.",
    "visuals": {
      "title": "유형 5. 정사각형과 등비급수",
      "question": "\\text{한 변이 2인 정사각형에 내접하는 원을 그리고 다시 그 원에 내접하는 정사각형을 그릴 때, 모든 원의 넓이 합은?}",
      "solution": "a_1 = \\pi(1)^2 = \\pi \\\\ \\text{닮음비 } k = 1/\\sqrt{2} \\implies r = k^2 = 1/2 \\\\ S = \\frac{\\pi}{1-1/2} = 2\\pi"
    }
  },
  {
    "step": 11,
    "narration": "삼각형의 무한 반복 문제입니다. 피타고라스 정리를 활용하여 닮음비를 찾습니다.",
    "visuals": {
      "title": "유형 6. 직각삼각형 프랙탈",
      "question": "\\text{직각삼각형 안에 계속해서 정사각형을 채워나갈 때, 모든 정사각형의 넓이 합을 구하시오.}",
      "solution": "\\text{첫 정사각형 한 변 } x \\implies \\text{ 비례식 활용 } \\\\ S = \\frac{a_1}{1-r}"
    }
  },
  {
    "step": 12,
    "narration": "좌표평면 위의 점의 극한 위치 문제입니다. x좌표와 y좌표를 각각 등비급수로 계산합니다.",
    "visuals": {
      "title": "유형 7. 좌표의 극한",
      "question": "\\text{길이가 절반씩 줄어들며 90도씩 회전하는 선분의 끝점 } P_n \\text{ 의 극한 좌표는?}",
      "solution": "x = 1 - 1/4 + 1/16 - \\dots = \\frac{1}{1+1/4} = 4/5 \\\\ y = 1/2 - 1/8 + \\dots = \\frac{1/2}{1+1/4} = 2/5 \\\\ \\therefore (4/5, 2/5)"
    }
  },
  {
    "step": 13,
    "narration": "선분의 길이의 합 문제입니다. 이 경우 공비 r은 닮음비 k와 같습니다.",
    "visuals": {
      "title": "유형 8. 선분의 길이 합",
      "question": "\\text{꺾은선 그래프가 무한히 반복될 때 선분의 총 길이를 구하시오.}",
      "solution": "S = \\frac{L_1}{1-k} \\\\ \\text{*넓이가 아니므로 제곱하지 않음에 주의}"
    }
  },
  {
    "step": 14,
    "narration": "실전 수능 유형입니다. 복잡한 도형에서도 첫항과 공비만 찾으면 끝납니다.",
    "visuals": {
      "title": "유형 9. 수능 실전 (도형)",
      "question": "\\text{부채꼴과 활꼴이 반복되는 복잡한 도형의 총 넓이를 구하시오.}",
      "solution": "\\text{1. 첫 넓이 a를 정밀하게 계산} \\\\ \\text{2. 두 번째 도형과의 길이비 k 도출} \\\\ \\text{3. } S = a / (1-k^2)"
    }
  },
  {
    "step": 15,
    "narration": "마지막으로 급수와 수열의 관계를 정리하며 마칩니다.",
    "visuals": {
      "title": "유형 10. 급수 종합",
      "question": "\\sum a_n \\text{ 이 수렴하면 } \\lim a_n = 0 \\text{ 이지만, 역은 성립하지 않는 대표적 예시는?}",
      "solution": "\\text{조화급수: } \\sum \\frac{1}{n} = 1 + 1/2 + 1/3 + \\dots = \\infty \\\\ \\lim 1/n = 0 \\text{ 이지만 급수는 발산함}"
    }
  }
];

const unit = {
  "id": "미적분_급수",
  "title": "미적분 - 무한급수의 정의와 도형 활용",
  "subject": "미적분",
  "steps": steps
};

fs.writeFileSync('./public/premium_lectures/미적분_급수.json', JSON.stringify(unit, null, 2));

console.log('Advanced Calculus Series unit created with 15 problems and geometry animations!');
