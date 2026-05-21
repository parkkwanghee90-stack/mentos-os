import fs from 'fs';

// 1. 미분계수와도함수.json (Ultra Detailed - 15 Steps)
const derivative = {
  "id": "미분계수와도함수",
  "title": "미분계수와 도함수 - 미분의 기초와 본질",
  "subject": "수학2",
  "steps": [
    { "step": 1, "narration": "미분의 출발점인 평균변화율입니다. 두 점 (1, 1)과 (3, 9)를 잇는 직선의 기울기를 구해봅시다.", "visuals": { "title": "1. 평균변화율 (기울기)", "math": "f(x)=x^2 \\implies \\frac{f(3)-f(1)}{3-1} = \\frac{9-1}{2} = 4" } },
    { "step": 2, "narration": "미분계수의 정의입니다. 증분 h가 0으로 갈 때의 극한값을 구합니다.", "visuals": { "title": "2. 미분계수의 정의 (h -> 0)", "math": "f'(a) = \\lim_{h \\to 0} \\frac{f(a+h)-f(a)}{h}" } },
    { "step": 3, "narration": "다른 형태의 정의입니다. x가 a로 한없이 다가갈 때의 변화율입니다.", "visuals": { "title": "3. 미분계수의 정의 (x -> a)", "math": "f'(a) = \\lim_{x \\to a} \\frac{f(x)-f(a)}{x-a}" } },
    { "step": 4, "narration": "미분계수의 기하학적 의미는 접선의 기울기입니다. 점 (2, 4)에서의 기울기를 구해봅시다.", "visuals": { "title": "4. 접선의 기울기", "math": "f(x)=x^2 \\implies f'(2) = \\lim_{x \\to 2} \\frac{x^2-4}{x-2} = 4" } },
    { "step": 5, "narration": "미분가능성과 연속성입니다. 미분가능하려면 일단 연속이어야 하고, 뾰족하지 않아야 합니다.", "visuals": { "title": "5. 미분가능 vs 연속", "math": "y=|x| \\text{ 는 } x=0 \\text{ 에서 연속이나 미분불능 (첨점)}" } },
    { "step": 6, "narration": "도함수의 공식화입니다. x^n을 미분하면 nx^(n-1)이 되는 마법 같은 공식을 배웁니다.", "visuals": { "title": "6. 도함수 공식 (Power Rule)", "math": "(x^n)' = nx^{n-1} \\\\ (x^4)' = 4x^3, \\quad (2x^3)' = 6x^2" } },
    { "step": 7, "narration": "상수함수와 일차함수의 미분입니다. 상수는 변화가 없으니 0, x는 기울기 1이 남습니다.", "visuals": { "title": "7. 기초 미분 공식", "math": "(c)' = 0, \\quad (x)' = 1" } },
    { "step": 8, "narration": "실수배와 합, 차의 미분법입니다. 각 항을 따로 미분하여 더하거나 빼면 됩니다.", "visuals": { "title": "8. 선형성 법칙", "math": "(3x^2 + 5x - 7)' = 6x + 5" } },
    { "step": 9, "narration": "곱의 미분법입니다. '미그그미' 법칙을 기억하세요. 앞 미분 뒤 그대로, 앞 그대로 뒤 미분입니다.", "visuals": { "title": "9. 곱의 미분법", "math": "\\{f(x)g(x)\\}' = f'(x)g(x) + f(x)g'(x)" } },
    { "step": 10, "narration": "합성함수의 미분 기초(겉미분 속미분)입니다. (ax+b)^n 형태를 미분해 봅시다.", "visuals": { "title": "10. 합성함수 미분 기초", "math": "\\{(2x+1)^3\\}' = 3(2x+1)^2 \\cdot 2 = 6(2x+1)^2" } },
    { "step": 11, "narration": "미분계수의 변형 예제 1입니다. h의 계수를 맞추는 것이 핵심입니다.", "visuals": { "title": "11. 변형 예제 (h 계수)", "math": "\\lim_{h \\to 0} \\frac{f(a+2h)-f(a)}{h} = 2f'(a)" } },
    { "step": 12, "narration": "미분계수의 변형 예제 2입니다. 뺏다 더했다 스킬을 사용합니다.", "visuals": { "title": "12. 변형 예제 (f(a) 가감)", "math": "\\lim_{h \\to 0} \\frac{f(a+h)-f(a-h)}{h} = 2f'(a)" } },
    { "step": 13, "narration": "미정계수 결정 예제입니다. 극한값이 존재하면 분자도 0으로 가야 합니다.", "visuals": { "title": "13. 미정계수 결정", "math": "\\lim_{x \\to 1} \\frac{f(x)-2}{x-1} = 3 \\implies f(1)=2, f'(1)=3" } },
    { "step": 14, "narration": "다항함수 결정 문제입니다. 무한대 극한으로 차수를, 상수 극한으로 계수를 찾습니다.", "visuals": { "title": "14. f(x) 추론", "math": "\\lim_{x \\to \\infty} \\frac{f(x)}{x^2} = 1, \\quad f'(0)=2 \\implies f(x)=x^2+2x+c" } },
    { "step": 15, "narration": "마지막으로 미분법 종합 예제입니다. 복잡한 식을 미분해 봅시다.", "visuals": { "title": "15. 미분 종합 연습", "math": "y = (x+1)(x^2-x+1) \\implies y = x^3+1 \\implies y' = 3x^2" } }
  ]
};

// 2. 도함수의활용.json (Ultra Detailed - 15 Steps)
const tangent = {
  "id": "도함수의활용",
  "title": "도함수의 활용 - 접선과 평균값 정리",
  "subject": "수학2",
  "steps": [
    { "step": 1, "narration": "접선의 방정식의 기본 원리입니다. 한 점과 기울기만 알면 됩니다.", "visuals": { "title": "1. 접선의 기본형", "math": "y - f(a) = f'(a)(x-a)" } },
    { "step": 2, "narration": "곡선 위의 점 (1, 1)에서의 접선입니다. 미분하여 x=1을 대입합니다.", "visuals": { "title": "2. 위의 점 (1, 1)", "math": "y=x^3 \\implies y'=3x^2 \\implies m=3 \\\\ y-1 = 3(x-1) \\implies y=3x-2" } },
    { "step": 3, "narration": "기울기가 주어진 접선입니다. 도함수가 기울기와 같아지는 점 x를 찾습니다.", "visuals": { "title": "3. 기울기 m=4 인 접선", "math": "y=x^2 \\implies 2x=4 \\implies x=2, y=4 \\\\ y-4 = 4(x-2) \\implies y=4x-4" } },
    { "step": 4, "narration": "밖의 점 (0, -1)에서 그은 접선입니다. 접점을 t로 두는 것이 가장 중요합니다.", "visuals": { "title": "4. 밖의 점 (0, -1)", "math": "\\text{접점 (t, t^2), 기울기 2t} \\\\ t^2 - (-1) = 2t(t-0) \\implies t^2=1 \\\\ t=1 \\to y=2x-1, \\quad t=-1 \\to y=-2x-1" } },
    { "step": 5, "narration": "법선(수직인 선)의 방정식입니다. 기울기를 -1/m 로 바꿉니다.", "visuals": { "title": "5. 법선의 방정식", "math": "m_{tan}=2 \\implies m_{normal}=-0.5 \\\\ y-y_1 = -0.5(x-x_1)" } },
    { "step": 6, "narration": "두 곡선의 공통접선입니다. 접점 x=a에서 함숫값과 기울기가 일치해야 합니다.", "visuals": { "title": "6. 공통접선 (접할 때)", "math": "f(a)=g(a), \\quad f'(a)=g'(a)" } },
    { "step": 7, "narration": "두 곡선이 한 점을 공유하고 접선이 수직일 때(직교)의 조건입니다.", "visuals": { "title": "7. 직교하는 두 곡선", "math": "f(a)=g(a), \\quad f'(a) \\cdot g'(a) = -1" } },
    { "step": 8, "narration": "롤의 정리입니다. 함숫값이 같으면 기울기가 0인 점이 반드시 존재합니다.", "visuals": { "title": "8. 롤의 정리 (Rolle's)", "math": "f(a)=f(b) \\implies \\exists c \\in (a, b) \\text{ s.t. } f'(c)=0" } },
    { "step": 9, "narration": "평균값 정리입니다. 평균 변화율과 같은 순간 변화율이 반드시 존재합니다.", "visuals": { "title": "9. 평균값 정리 (MVT)", "math": "\\frac{f(b)-f(a)}{b-a} = f'(c)" } },
    { "step": 10, "narration": "평균값 정리의 실전 예제입니다. 이차함수에서 c는 항상 중점입니다.", "visuals": { "title": "10. MVT 실전 (이차함수)", "math": "y=x^2, [1, 3] \\implies f'(c) = \\frac{9-1}{3-1}=4 \\\\ 2c=4 \\implies c=2" } },
    { "step": 11, "narration": "다항함수와 직선의 교점 개수와 접선입니다. 접할 때가 기준점입니다.", "visuals": { "title": "11. 교점의 개수와 접선", "math": "x^3-3x = k \\implies y=x^3-3x \\text{ 와 } y=k \\text{ 의 교점}" } },
    { "step": 12, "narration": "함수의 증가와 감소입니다. 도함수의 부호가 양수면 증가, 음수면 감소입니다.", "visuals": { "title": "12. 증가와 감소", "math": "f'(x) > 0 \\implies \\text{증가} \\\\ f'(x) < 0 \\implies \\text{감소}" } },
    { "step": 13, "narration": "극대와 극소의 정의입니다. 증가에서 감소로 바뀌면 극대입니다.", "visuals": { "title": "13. 극대와 극소", "math": "f'(x) \\text{ 의 부호 변화가 } + \\to - \\implies \\text{극대}" } },
    { "step": 14, "narration": "삼차함수의 그래프 개형입니다. 극값이 2개, 1개, 0개인 경우를 구분합니다.", "visuals": { "title": "14. 삼차함수 그래프", "math": "D/4 = b^2 - 3ac \\text{ (도함수 판별식)}" } },
    { "step": 15, "narration": "마지막으로 최대·최소 문제입니다. 구간의 양 끝값과 극값을 비교합니다.", "visuals": { "title": "15. 최대와 최소", "math": "\\text{candidates: } f(a), f(b), f(\\text{extreme points})" } }
  ]
};

// Also save as "도함수의활용1.json" just in case for mapping
fs.writeFileSync('./public/premium_lectures/미분계수와도함수.json', JSON.stringify(derivative, null, 2));
fs.writeFileSync('./public/premium_lectures/도함수의활용.json', JSON.stringify(tangent, null, 2));
fs.writeFileSync('./public/premium_lectures/도함수의활용1.json', JSON.stringify(tangent, null, 2));

console.log('Ultra Premium Math II lectures updated (15 steps each)!');
