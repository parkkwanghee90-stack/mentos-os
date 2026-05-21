import fs from 'fs';

// Helper to format math for both Question and Solution to ensure full LaTeX rendering
// Using String.raw to preserve backslashes
const app1 = {
  "id": "도함수의활용1",
  "title": "도함수의 활용 (1) - 접선의 방정식",
  "subject": "수학2",
  "steps": [
    {
      "step": 1,
      "narration": "곡선 위의 점에서의 접선 구하기입니다.",
      "visuals": {
        "title": "유형 1. 곡선 위의 점",
        "question": "\\text{[문제] 곡선 } y=x^2-3x+4 \\text{ 위의 점 (1, 2)에서의 접선의 방정식을 구하시오.}",
        "solution": "y'=2x-3 \\\\ x=1 \\implies m=2(1)-3=-1 \\\\ y-2 = -1(x-1) \\implies y=-x+3"
      }
    },
    {
      "step": 2,
      "narration": "기울기가 주어진 접선입니다.",
      "visuals": {
        "title": "유형 2. 기울기가 주어질 때",
        "question": "\\text{[문제] 곡선 } y=x^2-x \\text{ 에 접하고 기울기가 3인 직선의 방정식을 구하시오.}",
        "solution": "y'=2x-1 = 3 \\implies 2x=4 \\implies x=2 \\\\ y=2^2-2=2 \\implies \\text{접점 (2, 2)} \\\\ y-2=3(x-2) \\implies y=3x-4"
      }
    },
    {
      "step": 3,
      "narration": "곡선 밖의 한 점에서 그은 접선입니다.",
      "visuals": {
        "title": "유형 3. 곡선 밖의 점",
        "question": "\\text{[문제] 점 (0, -4)에서 곡선 } y=x^2 \\text{ 에 그은 접선의 방정식을 구하시오.}",
        "solution": "\\text{접점 } (t, t^2), \\text{ 기울기 } 2t \\\\ t^2 - (-4) = 2t(t-0) \\\\ t^2+4=2t^2 \\implies t^2=4 \\\\ t=2 \\implies y=4x-4 \\\\ t=-2 \\implies y=-4x-4"
      }
    },
    {
      "step": 4,
      "narration": "접선에 수직인 직선(법선) 문제입니다.",
      "visuals": {
        "title": "유형 4. 법선의 방정식",
        "question": "\\text{[문제] 곡선 } y=x^3 \\text{ 위의 점 (1, 1)을 지나고 이 점에서의 접선에 수직인 직선의 방정식을 구하시오.}",
        "solution": "y'=3x^2 \\implies m_{접선}=3 \\\\ \\text{수직인 직선의 기울기 } m = -1/3 \\\\ y-1 = -1/3(x-1) \\implies y = -1/3x + 4/3"
      }
    },
    {
      "step": 5,
      "narration": "두 곡선이 접할 조건입니다.",
      "visuals": {
        "title": "유형 5. 공통접선",
        "question": "\\text{[문제] 두 곡선 } y=x^2+ax+b \\text{ 와 } y=-x^2+4 \\text{ 가 } x=1 \\text{ 에서 접할 때, } a, b \\text{를 구하시오.}",
        "solution": "1+a+b = -1+4=3 \\implies a+b=2 \\\\ 2(1)+a = -2(1) \\implies a=-4, b=6"
      }
    }
  ]
};

fs.writeFileSync('./public/premium_lectures/도함수의활용1.json', JSON.stringify(app1, null, 2));
console.log('Math II Derivative App 1 updated with FULL KaTeX question/solution fields!');
