import fs from 'fs';

const steps = [
  // --- Category 1 & 2 remain similar but refined ---
  {
    "step": 1,
    "narration": "급수의 정의입니다. 부분합의 극한값이 존재해야 수렴합니다.",
    "visuals": {
      "title": "개념 1. 급수의 정의",
      "question": "\\text{급수 } \\sum a_n \\text{ 이 수렴한다는 말의 정의는?}",
      "solution": "\\text{부분합 } S_n = \\sum_{k=1}^n a_k \\text{ 에 대해 } \\lim_{n \\to \\infty} S_n = S"
    }
  },
  {
    "step": 2,
    "narration": "무한등비급수의 수렴 조건입니다. 공비 r의 범위가 매우 중요합니다.",
    "visuals": {
      "title": "개념 2. 등비급수 수렴 조건",
      "question": "\\sum_{n=1}^{\\infty} ar^{n-1} \\text{ 이 수렴하기 위한 } r \\text{ 의 범위는?}",
      "solution": "-1 < r < 1 \\\\ \\text{*주의: } a=0 \\text{ 일 때도 수렴함}"
    }
  },
  {
    "step": 3,
    "narration": "합 공식입니다. 1-r분의 a를 꼭 기억하세요.",
    "visuals": {
      "title": "개념 3. 합 공식",
      "question": "\\text{무한등비급수의 합 } S \\text{ 를 구하는 식은?}",
      "solution": "S = \\frac{a}{1-r}"
    }
  },

  // --- Category 3: Geometry Problems (7, 8, 9) ---
  {
    "step": 4,
    "narration": "유형 7. 좌표평면 위에서의 점의 이동입니다. x좌표와 y좌표가 각각 어떻게 변하는지 관찰하세요.",
    "visuals": {
      "title": "유형 7. 좌표의 극한 (시각화)",
      "component": "GeometricSeriesAnimation",
      "props": { "type": "coordinate_path" },
      "question": "\\text{그림과 같이 } P_0 \\text{ 에서 출발하여 길이가 1, 1/2, 1/4... 로 줄어들며 90도씩 회전할 때 } P_n \\text{ 의 극한 위치는?}",
      "solution": "x = 1 - (1/2)^2 + (1/2)^4 - \\dots = \\frac{1}{1+1/4} = 4/5 \\\\ y = 1/2 - (1/2)^3 + \\dots = \\frac{1/2}{1+1/4} = 2/5 \\\\ \\therefore (0.8, 0.4)"
    }
  },
  {
    "step": 5,
    "narration": "유형 8. 삼각형 내부에 무한히 채워지는 원의 넓이 합입니다. 닮음비를 이용해 공비를 구합니다.",
    "visuals": {
      "title": "유형 8. 프랙탈 도형의 넓이",
      "component": "GeometricSeriesAnimation",
      "props": { "type": "circles_in_triangle" },
      "question": "\\text{정삼각형 내부에 내접하는 원을 계속 그려나갈 때, 모든 원의 넓이의 총합을 구하시오.}",
      "solution": "\\text{닮음비 } k = 1/3 \\implies r = k^2 = 1/9 \\\\ S = \\frac{a_1}{1-1/9} = \\frac{9}{8} a_1"
    }
  },
  {
    "step": 6,
    "narration": "유형 9. 부채꼴과 활꼴이 반복되는 수능형 문제입니다. 공비를 찾을 때 닮음비의 제곱을 잊지 마세요.",
    "visuals": {
      "title": "유형 9. 수능 실전 도형 (활꼴)",
      "component": "GeometricSeriesAnimation",
      "props": { "type": "arc_fractal" },
      "question": "\\text{부채꼴의 호를 따라 계속해서 줄어드는 활꼴들의 넓이 합을 구하시오.}",
      "solution": "\\text{1. 첫항 } a_1 \\text{ 을 구함} \\\\ \\text{2. 닮음비 } k \\text{ 도출 } \\implies r = k^2 \\\\ S = \\frac{a_1}{1-r}"
    }
  },
  {
    "step": 7,
    "narration": "나머지 유형들도 10문제 이상 채워보겠습니다.",
    "visuals": {
      "title": "유형 10. 무한 급수 종합",
      "question": "\\sum a_n \\text{ 이 수렴할 때 } \\lim a_n \\text{ 은 무엇인가?} ",
      "solution": "0"
    }
  }
];

const unit = {
  "id": "미적분_급수",
  "title": "미적분 - 급수와 도형 완벽 시각화",
  "subject": "미적분",
  "steps": steps
};

fs.writeFileSync('./public/premium_lectures/미적분_급수.json', JSON.stringify(unit, null, 2));

console.log('Advanced Calculus Series unit updated with specific scene animations!');
