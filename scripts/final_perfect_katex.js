import fs from 'fs';

// Super Clean Formatting - Avoid nested \text and minimize command usage
const q1 = "\\text{[문제] 곡선 } y=x^2-3x+4 \\text{ 위의 점 (1,2)에서의 접선 구하기}";
const s1 = "y'=2x-3 \\implies m=2(1)-3=-1 \\\\ y-2 = -1(x-1) \\implies y=-x+3";

const q3 = "\\text{[문제] 점 (0,-4)에서 곡선 } y=x^2 \\text{ 에 그은 접선 구하기}";
const s3 = "\\text{접점 (t, t^2), 기울기 2t} \\\\ t^2 - (-4) = 2t(t-0) \\\\ t^2+4=2t^2 \\implies t^2=4 \\\\ t=2 \\implies y=4x-4 \\\\ t=-2 \\implies y=-4x-4";

const q4 = "\\text{[문제] 곡선 } y=x^3 \\text{ 위의 점 (1,1)에서의 법선 구하기}";
const s4 = "y'=3x^2 \\implies m_{tan}=3 \\implies m_{normal}=-1/3 \\\\ y-1 = -1/3(x-1) \\implies y=-1/3x + 4/3";

const app1 = {
  "id": "도함수의활용1",
  "title": "도함수의 활용 (1) - 접선 완벽 가이드",
  "subject": "수학2",
  "steps": [
    { "step": 1, "narration": "곡선 위의 점에서의 접선입니다.", "visuals": { "title": "유형 1. 곡선 위의 점", "math": q1 + " \\\\ \\\\ " + s1 } },
    { "step": 2, "narration": "곡선 밖의 점에서의 접선입니다.", "visuals": { "title": "유형 3. 곡선 밖의 점", "math": q3 + " \\\\ \\\\ " + s3 } },
    { "step": 3, "narration": "접선에 수직인 법선입니다.", "visuals": { "title": "유형 4. 법선의 방정식", "math": q4 + " \\\\ \\\\ " + s4 } }
  ]
};

fs.writeFileSync('./public/premium_lectures/도함수의활용1.json', JSON.stringify(app1, null, 2));

console.log('Final Perfect Math II Derivative App 1 updated!');
