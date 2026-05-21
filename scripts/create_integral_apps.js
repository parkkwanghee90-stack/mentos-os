import fs from 'fs';

const app = {
  "id": "정적분의활용",
  "title": "정적분의 활용 - 넓이와 적분 공식 완벽 정리",
  "subject": "수학2",
  "steps": [
    {
      "step": 1,
      "narration": "정적분과 넓이의 기본적인 관계입니다. 곡선 아래의 면적은 정적분값의 절대값과 같습니다.",
      "visuals": {
        "title": "개념 1. 정적분과 넓이",
        "question": "\\text{곡선 } y=f(x) \\text{ 와 } x \\text{축 및 두 직선 } x=a, x=b \\text{ 로 둘러싸인 넓이 } S \\text{ 를 정적분으로 나타내시오.}",
        "solution": "S = \\int_{a}^{b} |f(x)| dx \\\\ \\text{f(x)가 0보다 작으면 -를 붙여 양수로 만듦}"
      }
    },
    {
      "step": 2,
      "narration": "이차함수와 x축으로 둘러싸인 부분의 넓이 공식입니다. 계산 시간을 획기적으로 줄여주는 필수 공식입니다.",
      "visuals": {
        "title": "개념 2. 이차함수 넓이 공식 (1/6)",
        "component": "IntegralAreaAnimation",
        "props": { "type": "quadratic" },
        "question": "\\text{이차함수 } f(x)=ax^2+bx+c \\text{ 가 } x \\text{축과 두 점 } \\alpha, \\beta \\text{ 에서 만날 때의 넓이 공식을 기술하시오.}",
        "solution": "S = \\frac{|a|}{6}(\\beta-\\alpha)^3 \\\\ \\text{* 매우 중요: 이차함수와 직선, 두 이차함수 사이에도 적용 가능}"
      }
    },
    {
      "step": 3,
      "narration": "이차함수와 직선 사이의 넓이도 1/6 공식을 그대로 사용합니다. 단, 교점의 x좌표를 먼저 구해야 합니다.",
      "visuals": {
        "title": "개념 3. 이차함수와 직선의 넓이",
        "question": "\\text{곡선 } y=x^2 \\text{ 과 직선 } y=x+2 \\text{ 로 둘러싸인 부분의 넓이를 공식으로 구하시오.}",
        "solution": "x^2-x-2=0 \\implies (x-2)(x+1)=0 \\implies \\alpha=-1, \\beta=2 \\\\ S = \\frac{1}{6}(2-(-1))^3 = \\frac{1}{6}(3^3) = \\frac{27}{6} = \\frac{9}{2}"
      }
    },
    {
      "step": 4,
      "narration": "삼차함수와 접선으로 둘러싸인 부분의 넓이 공식입니다. 분모가 12임에 주의하세요.",
      "visuals": {
        "title": "개념 4. 삼차함수 접선 공식 (1/12)",
        "component": "IntegralAreaAnimation",
        "props": { "type": "cubic" },
        "question": "\\text{삼차함수 } f(x)=ax^3+\\dots \\text{ 가 한 점 } \\alpha \\text{ 에서 접하고 } \\beta \\text{ 에서 만날 때의 넓이 공식은?}",
        "solution": "S = \\frac{|a|}{12}(\\beta-\\alpha)^4 \\\\ \\text{* 접할 때만 사용 가능한 특수 공식}"
      }
    },
    {
      "step": 5,
      "narration": "두 곡선 사이의 넓이 구하기입니다. 위 식에서 아래 식을 뺀 후 적분합니다.",
      "visuals": {
        "title": "개념 5. 두 곡선 사이의 넓이",
        "question": "\\text{두 곡선 } y=f(x), y=g(x) \\text{ 와 두 직선 } x=a, x=b \\text{ 로 둘러싸인 넓이는?}",
        "solution": "S = \\int_{a}^{b} |f(x)-g(x)| dx \\\\ \\text{위쪽 함수 - 아래쪽 함수}"
      }
    },
    {
      "step": 6,
      "narration": "예제 1. 이차함수 공식을 활용한 실전 문제입니다.",
      "visuals": {
        "title": "예제 1. 이차함수 넓이",
        "question": "\\text{곡선 } y=-x^2+4x \\text{ 와 } x \\text{축으로 둘러싸인 부분의 넓이를 구하시오.}",
        "solution": "-x^2+4x = -x(x-4)=0 \\implies \\alpha=0, \\beta=4, a=-1 \\\\ S = \\frac{1}{6}(4-0)^3 = \\frac{64}{6} = \\frac{32}{3}"
      }
    },
    {
      "step": 7,
      "narration": "예제 2. 삼차함수 접선 공식을 활용한 문제입니다.",
      "visuals": {
        "title": "예제 2. 삼차함수 접선 넓이",
        "question": "\\text{곡선 } y=x^3 \\text{ 위의 점 (1, 1)에서의 접선과 곡선으로 둘러싸인 넓이를 구하시오.}",
        "solution": "y'=3x^2 \\implies m=3, \\text{ 접선: } y=3x-2 \\\\ x^3-3x+2=0 \\implies (x-1)^2(x+2)=0 \\\\ \\alpha=-2, \\beta=1 (\\text{접점}) \\\\ S = \\frac{1}{12}(1-(-2))^4 = \\frac{81}{12} = \\frac{27}{4}"
      }
    },
    {
      "step": 8,
      "narration": "역함수와 넓이 관계입니다. y=x 대칭성을 이용합니다.",
      "visuals": {
        "title": "개념 6. 역함수와 넓이",
        "question": "\\text{함수 } f(x) \\text{ 와 그 역함수 } g(x) \\text{ 의 그래프로 둘러싸인 넓이는?}",
        "solution": "y=f(x) \\text{ 와 } y=x \\text{ 로 둘러싸인 넓이의 2배를 계산}"
      }
    },
    {
      "step": 9,
      "narration": "속도와 거리에 대한 정적분 활용입니다. 위치의 변화량과 실제 이동 거리를 구분해야 합니다.",
      "visuals": {
        "title": "개념 7. 속도와 거리",
        "question": "\\text{속도 } v(t) \\text{ 가 주어졌을 때, 시각 } a \\text{ 에서 } b \\text{ 까지 움직인 거리를 구하시오.}",
        "solution": "\\text{이동 거리 } S = \\int_{a}^{b} |v(t)| dt \\\\ \\text{위치의 변화량은 절대값 없이 그냥 적분}"
      }
    },
    {
      "step": 10,
      "narration": "마지막으로 넓이 이등분 문제입니다. 전체 넓이의 절반이 되는 지점을 찾습니다.",
      "visuals": {
        "title": "예제 3. 넓이의 이등분",
        "question": "\\text{곡선 } y=-x^2+2x \\text{ 와 } x \\text{축으로 둘러싸인 넓이를 } y=ax \\text{ 가 이등분할 때 } a \\text{ 는?}",
        "solution": "\\text{전체 넓이 } S = \\frac{1}{6}(2)^3 = 4/3 \\\\ \\text{이등분 넓이 } = 2/3 \\implies \\frac{1}{6}(2-a)^3 = 2/3 \\\\ (2-a)^3 = 4 \\implies a = 2 - \\sqrt[3]{4}"
      }
    }
  ]
};

fs.writeFileSync('./public/premium_lectures/정적분의활용.json', JSON.stringify(app, null, 2));

console.log('Math II Definite Integral Applications unit created with area formulas!');
