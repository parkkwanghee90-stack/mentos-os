import fs from 'fs';

// 1. 도함수의활용1.json (Tangents - 10 Examples)
const app1 = {
  "id": "도함수의활용1",
  "title": "도함수의 활용 (1) - 접선의 방정식 완벽 마스터",
  "subject": "수학2",
  "steps": [
    { "step": 1, "narration": "접선의 방정식 기초입니다. 곡선 위의 점 (x1, y1)에서의 기울기는 f'(x1)입니다.", "visuals": { "title": "정의. 접선의 방정식", "math": "y - f(a) = f'(a)(x-a)" } },
    { "step": 2, "narration": "예제 1. 위의 점 (1, 2)에서의 접선입니다.", "visuals": { "title": "예제 1. y=x^2+1, (1, 2)", "math": "y'=2x \\implies m=2 \\\\ y-2=2(x-1) \\implies y=2x" } },
    { "step": 3, "narration": "예제 2. 기울기가 4인 접선입니다.", "visuals": { "title": "예제 2. y=x^2, m=4", "math": "2x=4 \\implies x=2, y=4 \\\\ y-4=4(x-2) \\implies y=4x-4" } },
    { "step": 4, "narration": "예제 3. 밖의 점 (0, -1)에서 그은 접선입니다.", "visuals": { "title": "예제 3. 밖의 점 (0, -1)", "math": "t^2+1=2t^2 \\implies t=1 \\\\ y=2x-1" } },
    { "step": 5, "narration": "예제 4. 접선에 수직인 법선입니다.", "visuals": { "title": "예제 4. 법선의 방정식", "math": "m_{tan}=2 \\implies m_{normal}=-0.5 \\\\ y-1 = -0.5(x-1)" } },
    { "step": 6, "narration": "예제 5. 두 곡선이 접할 조건입니다.", "visuals": { "title": "예제 5. 공통접선", "math": "f(a)=g(a), \\quad f'(a)=g'(a)" } },
    { "step": 6, "narration": "예제 6. 각도가 60도인 접선입니다.", "visuals": { "title": "예제 6. tan 60 = sqrt(3)", "math": "f'(x) = \\sqrt{3}" } },
    { "step": 7, "narration": "예제 7. 다항식의 접함과 중근입니다.", "visuals": { "title": "예제 7. (x-a)^2 인수", "math": "f(x)-(mx+n) = (x-a)^2 Q(x)" } },
    { "step": 8, "narration": "예제 8. 곡선 밖의 점 예제 2입니다.", "visuals": { "title": "예제 8. y=x^3, (0, 2)", "math": "t^3-2=3t^2(t-0) \\implies -2t^3=2 \\implies t=-1" } },
    { "step": 9, "narration": "예제 9. 수직인 두 접선입니다.", "visuals": { "title": "예제 9. 직교 접선", "math": "m_1 \\cdot m_2 = -1" } },
    { "step": 10, "narration": "예제 10. 평균값 정리의 기하학적 의미입니다.", "visuals": { "title": "예제 10. MVT와 접선", "math": "f'(c) = \\frac{f(b)-f(a)}{b-a}" } }
  ]
};

// 2. 도함수의활용2.json (Graphs & Extremes - 10 Examples)
const app2 = {
  "id": "도함수의활용2",
  "title": "도함수의 활용 (2) - 그래프와 극대·극소",
  "subject": "수학2",
  "steps": [
    { "step": 1, "narration": "함수의 증가와 감소의 정의입니다. 도함수의 부호를 봅니다.", "visuals": { "title": "1. 증가와 감소", "math": "f'(x)>0 \\to \\text{증가}, \\quad f'(x)<0 \\to \\text{감소}" } },
    { "step": 2, "narration": "극대와 극소의 판정입니다. 도함수의 부호가 변하는 지점입니다.", "visuals": { "title": "2. 극대와 극소", "math": "+ \\to - : \\text{극대}, \\quad - \\to + : \\text{극소}" } },
    { "step": 3, "narration": "삼차함수의 그래프 개형 3가지입니다.", "visuals": { "title": "3. 삼차함수 개형", "math": "f'(x)=0 \\text{ 의 근: 2개, 1개, 0개}" } },
    { "step": 4, "narration": "사차함수의 그래프 개형입니다. 대칭형과 W형 등을 공부합니다.", "visuals": { "title": "4. 사차함수 개형", "math": "f'(x)=0 \\text{ 의 근의 개수 중심}" } },
    { "step": 5, "narration": "중요한 비례관계입니다. 삼차함수 극값과 변곡점 사이의 1:2 관계입니다.", "visuals": { "title": "5. 삼차함수 비례관계 (1:2)", "math": "\\text{극점과 교점 사이 비율 } 1:2 \\text{ 또는 } 1:\\sqrt{3}" } },
    { "step": 6, "narration": "예제 6. 극값을 갖지 않을 조건입니다.", "visuals": { "title": "예제 6. f'(x) 판별식 D <= 0", "math": "3x^2+2ax+b=0 \\implies D/4 \\le 0" } },
    { "step": 7, "narration": "예제 7. 방정식의 실근 개수입니다.", "visuals": { "title": "예제 7. f(x)=k 의 근", "math": "\\text{극대값} \\cdot \\text{극소값} \\text{ 의 부호 판정}" } },
    { "step": 8, "narration": "예제 8. 모든 실수에서 부등식이 성립할 조건입니다.", "visuals": { "title": "예제 8. f(x) >= 0", "math": "\\text{최소값} \\ge 0" } },
    { "step": 9, "narration": "예제 9. 삼차함수 대칭성 활용입니다.", "visuals": { "title": "예제 9. 변곡점 대칭", "math": "f(x) = (x-a)^3 + b" } },
    { "step": 10, "narration": "예제 10. 사차함수 극대값 존재 조건입니다.", "visuals": { "title": "예제 10. f'(x)=0 이 서로 다른 세 실근", "math": "D > 0" } }
  ]
};

// 3. 도함수의활용3.json (Speed & Optimization - 10 Examples)
const app3 = {
  "id": "도함수의활용3",
  "title": "도함수의 활용 (3) - 속도·가속도와 최대·최소",
  "subject": "수학2",
  "steps": [
    { "step": 1, "narration": "위치, 속도, 가속도의 관계입니다. 미분을 통해 얻어냅니다.", "visuals": { "title": "1. 운동의 분석", "math": "x(t) \\xrightarrow{dt} v(t) \\xrightarrow{dt} a(t)" } },
    { "step": 2, "narration": "운동 방향을 바꾸는 지점은 속도 v(t)=0 일 때입니다.", "visuals": { "title": "2. 운동 방향 전환", "math": "v(t)=0, \\text{ 부호 변화 존재}" } },
    { "step": 3, "narration": "예제 3. 5초 후의 위치와 속도 구하기입니다.", "visuals": { "title": "예제 3. x(t)=t^2-4t", "math": "v(t)=2t-4 \\implies v(5)=6" } },
    { "step": 4, "narration": "도형의 최대 최소 - 넓이 예제입니다.", "visuals": { "title": "예제 4. 사각형 넓이 최대", "math": "S(x) = x(10-x) \\implies S'(x)=0" } },
    { "step": 5, "narration": "도형의 최대 최소 - 부피 예제입니다.", "visuals": { "title": "예제 5. 상자 부피 최대", "math": "V(x) = x(a-2x)(b-2x)" } },
    { "step": 6, "narration": "길이의 변화율 문제입니다. 시간에 대해 미분합니다.", "visuals": { "title": "예제 6. 그림자 길이 변화율", "math": "\\frac{dl}{dt} \\text{ 계산}" } },
    { "step": 7, "narration": "부피의 변화율 문제입니다.", "visuals": { "title": "예제 7. 구의 부피 변화율", "math": "V = \\frac{4}{3}\\pi r^3 \\implies \\frac{dV}{dt} = 4\\pi r^2 \\frac{dr}{dt}" } },
    { "step": 8, "narration": "가속도가 0이 되는 순간의 위치입니다.", "visuals": { "title": "예제 8. a(t)=0 지점", "math": "v'(t)=0 \\implies t \\text{ 도출}" } },
    { "step": 9, "narration": "정지할 때까지 걸린 거리입니다.", "visuals": { "title": "예제 9. v(t)=0 까지의 x(t)", "math": "v(t)=20-2t=0 \\implies t=10" } },
    { "step": 10, "narration": "도형 최적화 종합 문제입니다.", "visuals": { "title": "예제 10. 원뿔에 내접하는 원기둥", "math": "\\text{비례식 세워 미분}" } }
  ]
};

fs.writeFileSync('./public/premium_lectures/도함수의활용1.json', JSON.stringify(app1, null, 2));
fs.writeFileSync('./public/premium_lectures/도함수의활용2.json', JSON.stringify(app2, null, 2));
fs.writeFileSync('./public/premium_lectures/도함수의활용3.json', JSON.stringify(app3, null, 2));

console.log('Math II Derivative Applications 1, 2, 3 Split and Populated!');
