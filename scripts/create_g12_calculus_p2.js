import fs from 'fs';

const createUnit = (id, title, steps) => ({ id, title, subject: "미적분", steps });

// 3. 미적분_미분법 (Differentiation Techniques)
const diffMethods = createUnit("미적분_미분법", "미적분 - 여러 가지 미분법 (10문제)", [
  { "step": 1, "narration": "몫의 미분법입니다. 분수 형태의 함수를 미분합니다.", "visuals": { "title": "유형 1. 몫의 미분법", "question": "(\\frac{1}{x^2+1})' \\text{ 을 구하시오.}", "solution": "-\\frac{(x^2+1)'}{(x^2+1)^2} = -\\frac{2x}{(x^2+1)^2}" } },
  { "step": 2, "narration": "합성함수의 미분법(연쇄 법칙)입니다.", "visuals": { "title": "유형 2. 합성함수 미분", "question": "(\\sin^3 x)' \\text{ 을 구하시오.}", "solution": "3\\sin^2 x \\cdot (\\sin x)' = 3\\sin^2 x \\cos x" } },
  { "step": 3, "narration": "매개변수로 나타내어진 함수의 미분입니다.", "visuals": { "title": "유형 3. 매개변수 미분", "question": "x=t^2, y=2t \\text{ 일 때 } dy/dx \\text{ 를 구하시오.}", "solution": "\\frac{dy/dt}{dx/dt} = \\frac{2}{2t} = \\frac{1}{t}" } },
  { "step": 4, "narration": "음함수의 미분법입니다.", "visuals": { "title": "유형 4. 음함수 미분", "question": "x^2+y^2=1 \\text{ 에서 } dy/dx \\text{ 를 구하시오.}", "solution": "2x + 2y \\frac{dy}{dx} = 0 \\implies \\frac{dy}{dx} = -\\frac{x}{y}" } },
  { "step": 5, "narration": "역함수의 미분법입니다.", "visuals": { "title": "유형 5. 역함수 미분", "question": "f(x)=x^3+x \\text{ 의 역함수를 } g(x) \\text{ 라 할 때, } g'(2) \\text{ 를 구하시오.}", "solution": "f(1)=2 \\implies g'(2) = \\frac{1}{f'(1)} \\\\ f'(x)=3x^2+1 \\implies f'(1)=4 \\implies g'(2) = 1/4" } },
  { "step": 6, "narration": "이계도함수입니다. 두 번 미분하여 얻습니다.", "visuals": { "title": "유형 6. 이계도함수", "question": "f(x)=e^x \\sin x \\text{ 의 } f''(x) \\text{ 를 구하시오.}", "solution": "f'(x)=e^x(\\sin x + \\cos x) \\\\ f''(x)=e^x(\\sin x + \\cos x) + e^x(\\cos x - \\sin x) = 2e^x \\cos x" } },
  { "step": 7, "narration": "로그미분법입니다. 지수가 복잡할 때 로그를 취해 미분합니다.", "visuals": { "title": "유형 7. 로그미분법", "question": "y=x^x (x>0) \\text{ 의 } y' \\text{ 을 구하시오.}", "solution": "\\ln y = x \\ln x \\implies \\frac{y'}{y} = \\ln x + 1 \\implies y' = x^x(\\ln x + 1)" } },
  { "step": 8, "narration": "삼각함수의 도함수 응용입니다.", "visuals": { "title": "유형 8. 삼각함수 응용", "question": "(\\cos 2x)' \\text{ 을 구하시오.}", "solution": "-\\sin 2x \\cdot 2 = -2\\sin 2x" } },
  { "step": 9, "narration": "합성함수 미분 심화입니다.", "visuals": { "title": "유형 9. 연쇄법칙 심화", "question": "f(g(x^2)) \\text{ 를 미분하시오.}", "solution": "f'(g(x^2)) \\cdot g'(x^2) \\cdot 2x" } },
  { "step": 10, "narration": "실전 미분법 종합 문제입니다.", "visuals": { "title": "유형 10. 실전 종합", "question": "\\text{곡선 } x^2+xy+y^2=3 \\text{ 위의 점 (1, 1)에서의 접선의 기울기를 구하시오.}", "solution": "2x + (y + x y') + 2y y' = 0 \\\\ x=1, y=1 \\text{ 대입: } 2 + 1 + y' + 2y' = 0 \\implies 3y' = -3 \\implies y' = -1" } }
]);

// 4. 미적분_도함수활용 (Advanced Derivative Applications)
const advancedDerivApp = createUnit("미적분_도함수활용", "미적분 - 도함수의 활용 (극대·극소·변곡점)", [
  { "step": 1, "narration": "접선의 방정식 심화입니다.", "visuals": { "title": "유형 1. 접선의 방정식", "question": "\\text{곡선 } y=\\ln x \\text{ 위의 점 (e, 1)에서의 접선을 구하시오.}", "solution": "y'=1/x \\implies m=1/e \\\\ y-1 = 1/e(x-e) \\implies y=1/ex" } },
  { "step": 2, "narration": "함수의 증가와 감소입니다. 도함수의 부호를 판정합니다.", "visuals": { "title": "유형 2. 증가와 감소", "question": "f(x)=x e^x \\text{ 의 증가 구간을 구하시오.}", "solution": "f'(x)=e^x + x e^x = e^x(1+x) \\\\ 1+x > 0 \\implies x > -1" } },
  { "step": 3, "narration": "극대와 극소입니다. 도함수의 부호 변화를 살핍니다.", "visuals": { "title": "유형 3. 극대와 극소", "question": "f(x)=x-2\\sin x (0<x<2\\pi) \\text{ 의 극점의 x좌표를 구하시오.}", "solution": "f'(x)=1-2\\cos x = 0 \\implies \\cos x = 1/2 \\\\ x = \\pi/3, 5\\pi/3" } },
  { "step": 4, "narration": "곡선의 오목과 볼록, 변곡점입니다. 이계도함수를 사용합니다.", "visuals": { "title": "유형 4. 변곡점", "question": "f(x)=x e^{-x} \\text{ 의 변곡점을 구하시오.}", "solution": "f'(x)=e^{-x}(1-x), \\quad f''(x)=-e^{-x}(1-x) - e^{-x} = e^{-x}(x-2) \\\\ x=2 \\implies \\text{변곡점 (2, 2/e^2)}" } },
  { "step": 5, "narration": "함수의 그래프 개형 그리기입니다. 점근선을 확인해야 합니다.", "visuals": { "title": "유형 5. 그래프 개형", "question": "f(x)=\\frac{x^2}{x-1} \\text{ 의 점근선을 구하시오.}", "solution": "x=1, \\quad y=x+1 (\\text{사점근선})" } },
  { "step": 6, "narration": "최대와 최소 실전 문제입니다.", "visuals": { "title": "유형 6. 최대 최소", "question": "\\text{반지름이 R인 구에 내접하는 원기둥의 최대 부피를 구하시오.}", "solution": "V = 2\\pi r^2 \\sqrt{R^2-r^2} \\\\ \\text{미분하여 최대값 도출 } \\implies h = 2R/\\sqrt{3}" } },
  { "step": 7, "narration": "방정식에의 활용입니다. 근의 개수를 판단합니다.", "visuals": { "title": "유형 7. 방정식 응용", "question": "e^x=ax \\text{ 가 오직 하나의 실근을 가질 때의 a값을 구하시오.}", "solution": "\\text{접할 때: } e^x=a, \\quad e^x=ax \\implies ax=a \\implies x=1 \\implies a=e" } },
  { "step": 8, "narration": "부등식에의 활용입니다.", "visuals": { "title": "유형 8. 부등식 응용", "question": "\\ln x \\le x-1 \\text{ 이 성립함을 보이시오.}", "solution": "f(x)=x-1-\\ln x \\implies f'(x)=1-1/x = 0 \\implies x=1 \\\\ f(1)=0 (\\text{최소값}) \\implies f(x) \\ge 0" } },
  { "step": 9, "narration": "속도와 가속도 (평면 운동)입니다.", "visuals": { "title": "유형 9. 평면 운동", "question": "x=t-\\sin t, y=1-\\cos t \\text{ 일 때 t=pi에서의 속력을 구하시오.}", "solution": "v_x=1-\\cos t, v_y=\\sin t \\implies \\text{t=pi: } v_x=2, v_y=0 \\\\ \\text{속력 } = \\sqrt{2^2+0^2} = 2" } },
  { "step": 10, "narration": "변곡점에서의 접선 응용 문제입니다.", "visuals": { "title": "유형 10. 변곡선 응용", "question": "\\text{곡선 } y=x^3-3x \\text{ 의 변곡점에서의 접선의 방정식을 구하시오.}", "solution": "y'=3x^2-3, y''=6x \\implies x=0 \\\\ \\text{변곡점 (0, 0), 기울기 -3 } \\implies y=-3x" } }
]);

fs.writeFileSync('./public/premium_lectures/미적분_미분법.json', JSON.stringify(diffMethods, null, 2));
fs.writeFileSync('./public/premium_lectures/미적분_도함수활용.json', JSON.stringify(advancedDerivApp, null, 2));

console.log('Advanced Calculus units 3 and 4 created!');
