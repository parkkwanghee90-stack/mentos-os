import fs from 'fs';

// Perfect KaTeX formatting: All Korean must be INSIDE \text{}
// Math variables should be OUTSIDE for proper italics
const q1 = "\\text{[문제] 곡선 } y=x^2-3x+4 \\text{ 위의 점 (1, 2)에서의 접선의 방정식을 구하시오.}";
const s1 = "y'=2x-3 \\implies x=1 \\text{ 일 때 } m=2(1)-3=-1 \\\\ y-2 = -1(x-1) \\implies y=-x+3";

const q2 = "\\text{[문제] 곡선 } y=x^2-x \\text{ 에 접하고 기울기가 3인 직선의 방정식을 구하시오.}";
const s2 = "y'=2x-1 = 3 \\implies 2x=4 \\implies x=2 \\\\ y=2^2-2=2 \\implies \\text{접점 (2, 2)} \\\\ y-2=3(x-2) \\implies y=3x-4";

const q3 = "\\text{[문제] 점 (0, -4)에서 곡선 } y=x^2 \\text{ 에 그은 접선의 방정식을 구하시오.}";
const s3 = "\\text{접점 (t, t^2), 기울기 2t} \\\\ t^2 - (-4) = 2t(t-0) \\implies t^2+4=2t^2 \\implies t^2=4 \\\\ t=2 \\to y=4x-4, \\quad t=-2 \\to y=-4x-4";

const q4 = "\\text{[문제] 곡선 } y=x^3 \\text{ 위의 점 (1, 1)을 지나고 이 점에서의 접선에 수직인 직선을 구하시오.}";
const s4 = "y'=3x^2 \\implies m_{tan}=3 \\implies m_{normal}=-1/3 \\\\ y-1 = -1/3(x-1) \\implies y=-1/3x + 4/3";

const q5 = "\\text{[문제] 두 곡선 } y=x^2+ax+b \\text{ 와 } y=-x^2+4 \\text{ 가 } x=1 \\text{ 에서 접할 때, } a, b \\text{ 를 구하시오.}";
const s5 = "1+a+b = -1+4=3 \\implies a+b=2 \\\\ 2(1)+a = -2(1) \\implies a=-4, \\quad b=6";

const q6 = "\\text{[문제] } y=x^2 \\text{ 위의 점 P와 직선 } y=2x-3 \\text{ 사이의 최단 거리를 구하시오.}";
const s6 = "y'=2x=2 \\implies x=1, y=1 \\\\ \\text{점 (1, 1)과 직선 } 2x-y-3=0 \\text{ 사이의 거리} \\\\ d = \\frac{|2-1-3|}{\\sqrt{4+1}} = \\frac{2}{\\sqrt{5}}";

const q7 = "\\text{[문제] } y=x^3-x+1 \\text{ 의 접선 중 } x \\text{축의 양의 방향과 } 45 \\text{도를 이루는 접선을 구하시오.}";
const s7 = "\\tan 45^\\circ = 1 \\implies 3x^2-1=1 \\implies 3x^2=2 \\\\ x = \\pm \\sqrt{2/3}";

const q8 = "\\text{[문제] } y=x^3-3x \\text{ 와 } y=k \\text{ 가 서로 다른 세 점에서 만날 } k \\text{의 범위를 구하시오.}";
const s8 = "y'=3x^2-3=0 \\implies x=\\pm 1 \\\\ f(1)=-2, f(-1)=2 \\implies -2 < k < 2";

const q9 = "\\text{[문제] } f(x)=x^2-4x+3, [1, 3] \\text{ 에서 롤의 정리를 만족하는 } c \\text{를 구하시오.}";
const s9 = "f(1)=0, f(3)=0 \\implies f'(c)=2c-4=0 \\implies c=2";

const q10 = "\\text{[문제] } f(x)=x^3, [0, 3] \\text{ 에서 평균값 정리를 만족하는 } c \\text{를 구하시오.}";
const s10 = "\\frac{27-0}{3-0} = 9 \\implies 3c^2=9 \\implies c=\\sqrt{3}";

const app1 = {
  "id": "도함수의활용1",
  "title": "도함수의 활용 (1) - 접선의 방정식",
  "subject": "수학2",
  "steps": [
    { "step": 1, "narration": "유형 1. 곡선 위의 점에서의 접선입니다.", "visuals": { "title": "유형 1. 곡선 위의 점", "math": q1 + " \\\\ \\\\ \\text{[풀이]} \\\\ " + s1 } },
    { "step": 2, "narration": "유형 2. 기울기가 주어진 경우입니다.", "visuals": { "title": "유형 2. 기울기가 주어질 때", "math": q2 + " \\\\ \\\\ \\text{[풀이]} \\\\ " + s2 } },
    { "step": 3, "narration": "유형 3. 곡선 밖의 한 점에서 그은 접선입니다.", "visuals": { "title": "유형 3. 곡선 밖의 점", "math": q3 + " \\\\ \\\\ \\text{[풀이]} \\\\ " + s3 } },
    { "step": 4, "narration": "유형 4. 접선에 수직인 직선입니다.", "visuals": { "title": "유형 4. 법선의 방정식", "math": q4 + " \\\\ \\\\ \\text{[풀이]} \\\\ " + s4 } },
    { "step": 5, "narration": "유형 5. 두 곡선이 접할 조건입니다.", "visuals": { "title": "유형 5. 공통접선", "math": q5 + " \\\\ \\\\ \\text{[풀이]} \\\\ " + s5 } },
    { "step": 6, "narration": "유형 6. 최단 거리 응용 문제입니다.", "visuals": { "title": "유형 6. 접선 응용", "math": q6 + " \\\\ \\\\ \\text{[풀이]} \\\\ " + s6 } },
    { "step": 7, "narration": "유형 7. 각도 조건이 있는 경우입니다.", "visuals": { "title": "유형 7. 각도 조건", "math": q7 + " \\\\ \\\\ \\text{[풀이]} \\\\ " + s7 } },
    { "step": 8, "narration": "유형 8. 삼차함수 그래프와의 교점 문제입니다.", "visuals": { "title": "유형 8. 실근의 개수", "math": q8 + " \\\\ \\\\ \\text{[풀이]} \\\\ " + s8 } },
    { "step": 9, "narration": "유형 9. 롤의 정리 실전 문제입니다.", "visuals": { "title": "유형 9. 롤의 정리", "math": q9 + " \\\\ \\\\ \\text{[풀이]} \\\\ " + s9 } },
    { "step": 10, "narration": "유형 10. 평균값 정리 실전 문제입니다.", "visuals": { "title": "유형 10. 평균값 정리", "math": q10 + " \\\\ \\\\ \\text{[풀이]} \\\\ " + s10 } }
  ]
};

fs.writeFileSync('./public/premium_lectures/도함수의활용1.json', JSON.stringify(app1, null, 2));

console.log('Fixed 도함수의활용1.json with PERFECT KaTeX syntax!');
