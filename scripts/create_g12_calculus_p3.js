import fs from 'fs';

const createUnit = (id, title, steps) => ({ id, title, subject: "미적분", steps });

// 5. 미적분_적분법 (Integration Techniques)
const integralMethods = createUnit("미적분_적분법", "미적분 - 여러 가지 적분법 (치환·부분적분)", [
  { "step": 1, "narration": "지수함수의 부정적분입니다.", "visuals": { "title": "유형 1. 지수함수 적분", "question": "\\int e^{2x} dx \\text{ 를 구하시오.}", "solution": "\\frac{1}{2} e^{2x} + C" } },
  { "step": 2, "narration": "치환적분법 기본입니다.", "visuals": { "title": "유형 2. 치환적분법", "question": "\\int x e^{x^2} dx \\text{ 를 구하시오.}", "solution": "x^2=t \\implies 2x dx = dt \\\\ \\int \\frac{1}{2} e^t dt = \\frac{1}{2} e^{x^2} + C" } },
  { "step": 3, "narration": "부분적분법입니다. '그적미적' 공식(LIATE)을 활용합니다.", "visuals": { "title": "유형 3. 부분적분법", "question": "\\int x e^x dx \\text{ 를 구하시오.}", "solution": "x e^x - \\int 1 \\cdot e^x dx = x e^x - e^x + C" } },
  { "step": 4, "narration": "삼각함수의 적분입니다.", "visuals": { "title": "유형 4. 삼각함수 적분", "question": "\\int \\sin^2 x dx \\text{ 를 구하시오.}", "solution": "\\int \\frac{1-\\cos 2x}{2} dx = \\frac{1}{2}x - \\frac{1}{4}\\sin 2x + C" } },
  { "step": 5, "narration": "유리함수의 적분(부분분수)입니다.", "visuals": { "title": "유형 5. 유리함수 적분", "question": "\\int \\frac{1}{x^2-1} dx \\text{ 를 구하시오.}", "solution": "\\int \\frac{1}{2}(\\frac{1}{x-1}-\\frac{1}{x+1}) dx = \\frac{1}{2}\\ln|\\frac{x-1}{x+1}| + C" } },
  { "step": 6, "narration": "f분네 f프라임 꼴의 적분입니다.", "visuals": { "title": "유형 6. f'/f 꼴", "question": "\\int \\tan x dx \\text{ 를 구하시오.}", "solution": "\\int \\frac{\\sin x}{\\cos x} dx = -\\ln|\\cos x| + C" } },
  { "step": 7, "narration": "지수함수와 삼각함수의 부분적분(순환형)입니다.", "visuals": { "title": "유형 7. 순환형 부분적분", "question": "\\int e^x \\sin x dx \\text{ 를 구하시오.}", "solution": "\\frac{1}{2}e^x(\\sin x - \\cos x) + C" } },
  { "step": 8, "narration": "로그함수의 적분입니다.", "visuals": { "title": "유형 8. 로그함수 적분", "question": "\\int \\ln x dx \\text{ 를 구하시오.}", "solution": "x \\ln x - x + C" } },
  { "step": 9, "narration": "치환적분법 응용(루트 포함)입니다.", "visuals": { "title": "유형 9. 무리함수 치환", "question": "\\int x \\sqrt{x+1} dx \\text{ 를 구하시오.}", "solution": "x+1=t \\implies x=t-1 \\\\ \\int (t-1)\\sqrt{t} dt = \\frac{2}{5}t^{5/2} - \\frac{2}{3}t^{3/2} + C" } },
  { "step": 10, "narration": "삼각치환법 기본입니다.", "visuals": { "title": "유형 10. 삼각치환법", "question": "\\int \\frac{1}{x^2+1} dx \\text{ 를 구하시오.}", "solution": "x=\\tan \\theta \\implies \\int 1 d\\theta = \\theta + C = \\tan^{-1} x + C" } }
]);

// 6. 미적분_정적분활용 (Advanced Integral Applications)
const advancedIntegralApp = createUnit("미적분_정적분활용", "미적분 - 정적분의 활용 (급수·부피·길이)", [
  { "step": 1, "narration": "정적분과 급수의 관계입니다.", "visuals": { "title": "유형 1. 급수와 정적분", "question": "\\lim_{n \\to \\infty} \\sum_{k=1}^n \\frac{1}{n} f(\\frac{k}{n}) \\text{ 을 정적분으로 나타내시오.}", "solution": "\\int_{0}^{1} f(x) dx" } },
  { "step": 2, "narration": "무한급수의 합을 정적분으로 계산하는 예제입니다.", "visuals": { "title": "유형 2. 급수 계산", "question": "\\lim_{n \\to \\infty} \\sum_{k=1}^n \\frac{k^2}{n^3} \\text{ 을 구하시오.}", "solution": "\\int_{0}^{1} x^2 dx = 1/3" } },
  { "step": 3, "narration": "입체도형의 부피입니다. 단면적을 적분합니다.", "visuals": { "title": "유형 3. 입체 부피", "question": "\\text{단면의 넓이가 } S(x)=x^2 \\text{ 인 입체의 x=0에서 1까지의 부피는?}", "solution": "\\int_{0}^{1} x^2 dx = 1/3" } },
  { "step": 4, "narration": "회전체의 부피입니다. (교육과정 외인 경우가 많으나 심화로 다룸)", "visuals": { "title": "유형 4. 회전체 부피", "question": "y=\\sqrt{x} \\text{ 를 x축으로 회전시킨 부피는? (x: 0 to 1)}", "solution": "\\int_{0}^{1} \\pi (\\sqrt{x})^2 dx = \\pi [x^2/2]_0^1 = \\pi/2" } },
  { "step": 5, "narration": "곡선의 길이 (평면 곡선)입니다.", "visuals": { "title": "유형 5. 곡선 길이", "question": "y=x^{3/2} \\text{ 의 x=0에서 4까지의 길이를 구하시오.}", "solution": "\\int_0^4 \\sqrt{1+(3/2 x^{1/2})^2} dx = \\int_0^4 \\sqrt{1+9/4 x} dx = 8/27(10^{3/2}-1)" } },
  { "step": 6, "narration": "매개변수 곡선의 길이입니다.", "visuals": { "title": "유형 6. 매개변수 길이", "question": "x=t^2, y=t^3 \\text{ 의 t=0에서 1까지의 길이를 구하시오.}", "solution": "\\int_0^1 \\sqrt{(2t)^2+(3t^2)^2} dt = \\int_0^1 t\\sqrt{4+9t^2} dt = \\frac{1}{27}(13^{3/2}-8)" } },
  { "step": 7, "narration": "평면 운동에서의 이동 거리입니다.", "visuals": { "title": "유형 7. 평면 이동 거리", "question": "v_x=t, v_y=t^2 \\text{ 일 때 t=0에서 1까지의 이동 거리는?}", "solution": "\\int_0^1 \\sqrt{t^2+t^4} dt" } },
  { "step": 8, "narration": "정적분으로 정의된 함수의 미분입니다.", "visuals": { "title": "유형 8. 정적분 함수 미분", "question": "\\frac{d}{dx} \\int_{0}^{x} e^{t^2} dt \\text{ 를 구하시오.}", "solution": "e^{x^2}" } },
  { "step": 9, "narration": "정적분으로 정의된 함수의 극한입니다.", "visuals": { "title": "유형 9. 정적분 극한", "question": "\\lim_{x \\to 0} \\frac{1}{x} \\int_{0}^{x} \\sin t dt \\text{ 를 구하시오.}", "solution": "\\sin 0 = 0" } },
  { "step": 10, "narration": "실전 정적분 활용 종합 문제입니다.", "visuals": { "title": "유형 10. 실전 종합", "question": "\\int_0^1 \\frac{x}{x^2+1} dx \\text{ 를 구하시오.}", "solution": "\\frac{1}{2} [\\ln(x^2+1)]_0^1 = \\frac{1}{2} \\ln 2" } }
]);

fs.writeFileSync('./public/premium_lectures/미적분_적분법.json', JSON.stringify(integralMethods, null, 2));
fs.writeFileSync('./public/premium_lectures/미적분_정적분활용.json', JSON.stringify(advancedIntegralApp, null, 2));

console.log('Advanced Calculus units 5 and 6 created!');
