import fs from 'fs';

// Helper to generate a standardized unit structure
const createUnit = (id, title, steps) => {
  return { id, title, subject: "미적분", steps };
};

// 1. 미적분_수열의극한 (Limits of Sequences)
const seqLimits = createUnit("미적분_수열의극한", "미적분 - 수열의 극한 (10문제 정복)", [
  { "step": 1, "narration": "수열의 극한 기본 성질입니다.", "visuals": { "title": "유형 1. 기본 성질", "question": "\\text{수열 } a_n \\text{ 이 } \\lim_{n \\to \\infty} a_n = 3 \\text{ 일 때, } \\lim_{n \\to \\infty} \\frac{2a_n+1}{a_n-2} \\text{ 의 값을 구하시오.}", "solution": "\\frac{2(3)+1}{3-2} = \\frac{7}{1} = 7" } },
  { "step": 2, "narration": "무한대/무한대 꼴의 극한입니다. 최고차항의 계수비로 결정됩니다.", "visuals": { "title": "유형 2. 무한대/무한대", "question": "\\lim_{n \\to \\infty} \\frac{3n^2-5n+1}{2n^2+n} \\text{ 의 값을 구하시오.}", "solution": "\\text{최고차항 } n^2 \\text{ 의 계수비 } = \\frac{3}{2}" } },
  { "step": 3, "narration": "무한대-무한대 꼴의 극한입니다. 유리화를 이용합니다.", "visuals": { "title": "유형 3. 무한대-무한대", "question": "\\lim_{n \\to \\infty} (\\sqrt{n^2+4n}-n) \\text{ 의 값을 구하시오.}", "solution": "\\lim \\frac{(n^2+4n)-n^2}{\\sqrt{n^2+4n}+n} = \\lim \\frac{4n}{\\sqrt{n^2+4n}+n} = \\frac{4}{1+1} = 2" } },
  { "step": 4, "narration": "수열의 극한과 부등식 (샌드위치 정리) 입니다.", "visuals": { "title": "유형 4. 샌드위치 정리", "question": "n^2+1 < a_n < n^2+2n \\text{ 일 때, } \\lim_{n \\to \\infty} \\frac{a_n}{2n^2} \\text{ 을 구하시오.}", "solution": "\\lim \\frac{n^2+1}{2n^2} \\le \\lim \\frac{a_n}{2n^2} \\le \\lim \\frac{n^2+2n}{2n^2} \\implies \\frac{1}{2} \\le L \\le \\frac{1}{2} \\implies L = 1/2" } },
  { "step": 5, "narration": "등비수열의 극한입니다. 공비의 범위에 따라 수렴 여부가 결정됩니다.", "visuals": { "title": "유형 5. 등비수열의 극한", "question": "r^n \\text{ 이 수렴하기 위한 } r \\text{ 의 범위를 구하시오.}", "solution": "-1 < r \\le 1" } },
  { "step": 6, "narration": "등비수열을 포함한 수열의 극한입니다.", "visuals": { "title": "유형 6. 등비수열 응용", "question": "\\lim_{n \\to \\infty} \\frac{3^{n+1}-2^n}{3^n+2^{n+1}} \\text{ 의 값을 구하시오.}", "solution": "\\text{분모의 가장 큰 밑인 } 3^n \\text{ 으로 나누면} \\\\ \\lim \\frac{3 - (2/3)^n}{1 + 2(2/3)^n} = \\frac{3-0}{1+0} = 3" } },
  { "step": 7, "narration": "부분합과 극한의 관계입니다.", "visuals": { "title": "유형 7. 부분합과 극한", "question": "S_n = 2n^2+3n \\text{ 일 때, } \\lim_{n \\to \\infty} \\frac{a_n}{n} \\text{ 을 구하시오.}", "solution": "a_n = S_n - S_{n-1} = (2n^2+3n) - (2(n-1)^2+3(n-1)) = 4n+1 \\\\ \\lim \\frac{4n+1}{n} = 4" } },
  { "step": 8, "narration": "급수의 수렴과 일반항의 극한 사이의 관계입니다.", "visuals": { "title": "유형 8. 급수와 극한", "question": "\\sum_{n=1}^{\\infty} (a_n-2) \\text{ 가 수렴할 때, } \\lim_{n \\to \\infty} a_n \\text{ 을 구하시오.}", "solution": "\\text{급수가 수렴하면 일반항의 극한은 0} \\\\ \\lim (a_n-2) = 0 \\implies \\lim a_n = 2" } },
  { "step": 9, "narration": "무한등비급수의 합입니다. 1-r분의 a 공식을 사용합니다.", "visuals": { "title": "유형 9. 무한등비급수", "question": "\\sum_{n=1}^{\\infty} (\\frac{1}{2})^n \\text{ 의 합을 구하시오.}", "solution": "a = 1/2, \\quad r = 1/2 \\implies \\frac{1/2}{1-1/2} = 1" } },
  { "step": 10, "narration": "수열의 극한 실전 모의고사 유형입니다.", "visuals": { "title": "유형 10. 실전 응용", "question": "\\text{자연수 } n \\text{ 에 대하여 } x^2-(2n+1)x+n(n+1)=0 \\text{ 의 두 근을 } \\alpha_n, \\beta_n \\text{ 이라 할 때, } \\lim_{n \\to \\infty} \\sum_{k=1}^{n} \\frac{1}{\\alpha_k \\beta_k} \\text{ 를 구하시오.}", "solution": "\\alpha_k \\beta_k = k(k+1) \\\\ \\sum_{k=1}^n \\frac{1}{k(k+1)} = 1 - \\frac{1}{n+1} \\\\ \\lim_{n \\to \\infty} (1 - \\frac{1}{n+1}) = 1" } }
]);

// 2. 미적분_여러가지함수미분 (Transcendental Function Derivatives)
const transDeriv = createUnit("미적분_여러가지함수미분", "미적분 - 지수·로그·삼각함수의 미분", [
  { "step": 1, "narration": "지수함수의 미분법입니다.", "visuals": { "title": "유형 1. 지수함수 미분", "question": "(e^{2x+1})' \\text{ 을 구하시오.}", "solution": "e^{2x+1} \\cdot (2x+1)' = 2e^{2x+1}" } },
  { "step": 2, "narration": "로그함수의 미분법입니다.", "visuals": { "title": "유형 2. 로그함수 미분", "question": "(\\ln(x^2+1))' \\text{ 을 구하시오.}", "solution": "\\frac{1}{x^2+1} \\cdot (x^2+1)' = \\frac{2x}{x^2+1}" } },
  { "step": 3, "narration": "삼각함수의 덧셈정리입니다.", "visuals": { "title": "유형 3. 덧셈정리", "question": "\\sin(x+y) \\text{ 를 전개하시오.}", "solution": "\\sin x \\cos y + \\cos x \\sin y" } },
  { "step": 4, "narration": "삼각함수의 극한 기본 공식입니다.", "visuals": { "title": "유형 4. 삼각함수 극한", "question": "\\lim_{x \\to 0} \\frac{\\sin 3x}{x} \\text{ 의 값을 구하시오.}", "solution": "\\lim_{x \\to 0} \\frac{\\sin 3x}{3x} \\cdot 3 = 1 \\cdot 3 = 3" } },
  { "step": 5, "narration": "탄젠트 함수의 미분입니다.", "visuals": { "title": "유형 5. 탄젠트 미분", "question": "(\\tan x)' \\text{ 을 구하시오.}", "solution": "\\sec^2 x" } },
  { "step": 6, "narration": "시컨트, 코시컨트, 코탄젠트의 미분입니다.", "visuals": { "title": "유형 6. 역삼각함수 미분", "question": "(\\sec x)' \\text{ 을 구하시오.}", "solution": "\\sec x \\tan x" } },
  { "step": 7, "narration": "지수함수의 극한 공식입니다.", "visuals": { "title": "유형 7. 지수함수 극한", "question": "\\lim_{x \\to 0} \\frac{e^x-1}{x} \\text{ 의 값을 구하시오.}", "solution": "1" } },
  { "step": 8, "narration": "로그함수의 극한 공식입니다.", "visuals": { "title": "유형 8. 로그함수 극한", "question": "\\lim_{x \\to 0} \\frac{\\ln(1+x)}{x} \\text{ 의 값을 구하시오.}", "solution": "1" } },
  { "step": 9, "narration": "삼각함수의 합성입니다.", "visuals": { "title": "유형 9. 삼각함수 합성", "question": "\\sin x + \\sqrt{3} \\cos x \\text{ 를 합성하시오.}", "solution": "2(\\sin x \\cdot \\frac{1}{2} + \\cos x \\cdot \\frac{\\sqrt{3}}{2}) = 2\\sin(x+\\frac{\\pi}{3})" } },
  { "step": 10, "narration": "실전 미분 문제입니다.", "visuals": { "title": "유형 10. 실전 미분", "question": "f(x) = e^x \\sin x \\text{ 일 때, } f'(\\pi) \\text{ 를 구하시오.}", "solution": "f'(x) = e^x \\sin x + e^x \\cos x = e^x(\\sin x + \\cos x) \\\\ f'(\\pi) = e^\\pi(0-1) = -e^\\pi" } }
]);

// Write files
fs.writeFileSync('./public/premium_lectures/미적분_수열의극한.json', JSON.stringify(seqLimits, null, 2));
fs.writeFileSync('./public/premium_lectures/미적분_여러가지함수미분.json', JSON.stringify(transDeriv, null, 2));

console.log('Advanced Calculus (Grade 12) units 1 and 2 created with 10 problems each!');
