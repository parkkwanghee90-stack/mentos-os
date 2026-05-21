import fs from 'fs';

// Helper to format Problem and Solution
const formatPS = (q, s) => `\\text{[문제] } ${q} \\\\ \\\\ \\text{[풀이]} \\\\ ${s}`;

// 1. 도함수의활용1.json (Tangents)
const app1 = {
  "id": "도함수의활용1",
  "title": "도함수의 활용 (1) - 접선의 방정식",
  "subject": "수학2",
  "steps": [
    { "step": 1, "narration": "곡선 위의 점에서의 접선 구하기입니다.", "visuals": { "title": "유형 1. 곡선 위의 점", "math": formatPS("곡선 y=x^2-3x+4 위의 점 (1, 2)에서의 접선의 방정식을 구하시오.", "y'=2x-3 \\implies x=1 \\text{ 일 때 } m=2(1)-3=-1 \\\\ y-2 = -1(x-1) \\implies y=-x+3") } },
    { "step": 2, "narration": "기울기가 주어진 접선입니다.", "visuals": { "title": "유형 2. 기울기가 주어질 때", "math": formatPS("곡선 y=x^2-x 에 접하고 기울기가 3인 직선의 방정식을 구하시오.", "y'=2x-1 = 3 \\implies 2x=4 \\implies x=2 \\\\ y=2^2-2=2 \\implies \\text{접점 (2, 2)} \\\\ y-2=3(x-2) \\implies y=3x-4") } },
    { "step": 3, "narration": "곡선 밖의 한 점에서 그은 접선입니다.", "visuals": { "title": "유형 3. 곡선 밖의 점", "math": formatPS("점 (0, -4)에서 곡선 y=x^2 에 그은 접선의 방정식을 구하시오.", "\\text{접점 (t, t^2), 기울기 2t} \\\\ t^2 - (-4) = 2t(t-0) \\implies t^2+4=2t^2 \\implies t^2=4 \\\\ t=2 \\to y=4x-4, \\quad t=-2 \\to y=-4x-4") } },
    { "step": 4, "narration": "접선에 수직인 직선(법선) 문제입니다.", "visuals": { "title": "유형 4. 법선의 방정식", "math": formatPS("곡선 y=x^3 위의 점 (1, 1)을 지나고 이 점에서의 접선에 수직인 직선을 구하시오.", "y'=3x^2 \\implies m_{tan}=3 \\implies m_{normal}=-1/3 \\\\ y-1 = -1/3(x-1) \\implies y=-1/3x + 4/3") } },
    { "step": 5, "narration": "두 곡선이 접할 조건입니다.", "visuals": { "title": "유형 5. 공통접선", "math": formatPS("두 곡선 y=x^2+ax+b 와 y=-x^2+4 가 x=1 에서 접할 때, a, b를 구하시오.", "1+a+b = -1+4=3 \\implies a+b=2 \\\\ 2(1)+a = -2(1) \\implies a=-4, \\quad b=6") } },
    { "step": 6, "narration": "평행한 두 접선 사이의 거리 응용입니다.", "visuals": { "title": "유형 6. 접선 응용", "math": formatPS("y=x^2 위의 점 P와 직선 y=2x-3 사이의 최단 거리를 구하시오.", "y'=2x=2 \\implies x=1, y=1 \\\\ \\text{점 (1, 1)과 직선 2x-y-3=0 사이의 거리} \\\\ d = \\frac{|2-1-3|}{\\sqrt{4+1}} = \\frac{2}{\\sqrt{5}}") } },
    { "step": 7, "narration": "x축과 이루는 각도가 주어진 경우입니다.", "visuals": { "title": "유형 7. 각도 조건", "math": formatPS("y=x^3-x+1 의 접선 중 x축의 양의 방향과 45도를 이루는 접선을 구하시오.", "\\tan 45^\\circ = 1 \\implies 3x^2-1=1 \\implies 3x^2=2 \\\\ x = \\pm \\sqrt{2/3}") } },
    { "step": 8, "narration": "삼차함수와 접선의 교점 개수입니다.", "visuals": { "title": "유형 8. 실근의 개수", "math": formatPS("y=x^3-3x 와 y=k 가 서로 다른 세 점에서 만날 k의 범위를 구하시오.", "y'=3x^2-3=0 \\implies x=\\pm 1 \\\\ f(1)=-2, f(-1)=2 \\implies -2 < k < 2") } },
    { "step": 9, "narration": "롤의 정리 실전 문제입니다.", "visuals": { "title": "유형 9. 롤의 정리", "math": formatPS("f(x)=x^2-4x+3, [1, 3] 에서 롤의 정리를 만족하는 c를 구하시오.", "f(1)=0, f(3)=0 \\implies f'(c)=2c-4=0 \\implies c=2") } },
    { "step": 10, "narration": "평균값 정리 실전 문제입니다.", "visuals": { "title": "유형 10. 평균값 정리", "math": formatPS("f(x)=x^3, [0, 3] 에서 평균값 정리를 만족하는 c를 구하시오.", "\\frac{27-0}{3-0} = 9 \\implies 3c^2=9 \\implies c=\\sqrt{3}") } }
  ]
};

// 2. 도함수의활용2.json (Graphs & Proportionality)
const app2 = {
  "id": "도함수의활용2",
  "title": "도함수의 활용 (2) - 그래프와 비례관계",
  "subject": "수학2",
  "steps": [
    { "step": 1, "narration": "극대와 극소의 기본 계산입니다.", "visuals": { "title": "예제 1. 극값 구하기", "math": formatPS("f(x)=x^3-3x^2+1 의 극값을 구하시오.", "f'(x)=3x^2-6x=3x(x-2)=0 \\implies x=0, 2 \\\\ f(0)=1 (\\text{극대}), f(2)=-3 (\\text{극소})") } },
    { "step": 2, "narration": "삼차함수의 1:2 비례관계 활용입니다.", "visuals": { "title": "예제 2. 1:2 비례관계", "math": formatPS("f(x)=x^3-3x 가 x=1 에서 극소일 때, x축과의 교점 중 양수인 곳은?", "\\text{변곡점 0, 극점 1 이므로 교점은 } 1 \\cdot \\frac{3}{2} \\text{ 가 아닌 } \\sqrt{3} \\\\ 1:\\sqrt{3} \\text{ 관계 이용} \\implies x=\\sqrt{3}") } },
    { "step": 3, "narration": "사차함수의 대칭성과 극값입니다.", "visuals": { "title": "예제 3. 사차함수 개형", "math": formatPS("f(x)=x^4-2x^2+3 의 극값을 구하시오.", "f'(x)=4x^3-4x=4x(x^2-1)=0 \\implies x=0, \\pm 1 \\\\ f(0)=3 (\\text{극대}), f(\\pm 1)=2 (\\text{극소})") } },
    { "step": 4, "narration": "방정식 f(x)=k 의 실근의 개수 판별입니다.", "visuals": { "title": "예제 4. 실근의 개수", "math": formatPS("x^3-12x+k=0 이 서로 다른 세 실근을 가질 k의 범위는?", "f(x)=x^3-12x \\implies f'(\\pm 2)=0 \\\\ f(2)=-16, f(-2)=16 \\implies -16 < k < 16") } },
    { "step": 5, "narration": "모든 실수에 대해 부등식이 성립할 조건입니다.", "visuals": { "title": "예제 5. 절대부등식", "math": formatPS("x^4-4x+a \\ge 0 이 항상 성립할 a의 최소값은?", "f'(x)=4x^3-4=0 \\implies x=1 \\\\ f(1)=1-4+a \\ge 0 \\implies a \\ge 3") } },
    { "step": 6, "narration": "삼차함수의 변곡점 대칭성 예제입니다.", "visuals": { "title": "예제 6. 대칭성 활용", "math": formatPS("삼차함수 f(x)가 (1, 2)에 대해 대칭이고 f(0)=0 일 때 f(2)는?", "\\text{대칭점에 의해 } \\frac{f(0)+f(2)}{2} = 2 \\implies f(2)=4") } },
    { "step": 7, "narration": "함수의 증가 구간 구하기입니다.", "visuals": { "title": "예제 7. 증가 구간", "math": formatPS("f(x)=x^3-6x^2+9x 가 증가하는 구간을 구하시오.", "3x^2-12x+9 = 3(x-1)(x-3) \\ge 0 \\implies x \\le 1 \\text{ 또는 } x \\ge 3") } },
    { "step": 8, "narration": "극값이 하나만 존재할 조건입니다.", "visuals": { "title": "예제 8. 사차함수 극값 조건", "math": formatPS("f(x)=x^4+ax^2+x 가 극소값만 가질 조건은?", "f'(x)=4x^3+2ax+1=0 \\text{ 이 한 실근만 가짐}") } },
    { "step": 9, "narration": "그래프를 이용한 부등식 증명입니다.", "visuals": { "title": "예제 9. 부등식 증명", "math": formatPS("x>0 일 때 x^3+3 > 3x 가 성립함을 보이시오.", "h(x)=x^3-3x+3 \\implies h'(1)=0, h(1)=1 > 0 \\implies \\text{참}") } },
    { "step": 10, "narration": "비례관계 3:1 (사차함수) 예제입니다.", "visuals": { "title": "예제 10. 사차함수 3:1", "math": formatPS("삼중근을 갖는 사차함수의 극점과 교점의 비율은?", "\\text{비율 } 3:1 \\text{ 이 성립함}") } }
  ]
};

// 3. 도함수의활용3.json (Speed & Optimization)
const app3 = {
  "id": "도함수의활용3",
  "title": "도함수의 활용 (3) - 속도와 가속도",
  "subject": "수학2",
  "steps": [
    { "step": 1, "narration": "위치 함수를 미분하여 속도를 구하는 예제입니다.", "visuals": { "title": "예제 1. 속도 계산", "math": formatPS("x(t)=t^3-6t^2+9t 일 때, 2초에서의 속도를 구하시오.", "v(t)=3t^2-12t+9 \\implies v(2)=12-24+9 = -3") } },
    { "step": 2, "narration": "운동 방향을 바꾸는 시각 찾기입니다.", "visuals": { "title": "예제 2. 방향 전환", "math": formatPS("x(t)=t^2-4t 에서 운동 방향이 바뀌는 시각은?", "v(t)=2t-4=0 \\implies t=2") } },
    { "step": 3, "narration": "가속도가 0이 되는 지점입니다.", "visuals": { "title": "예제 3. 가속도 0", "math": formatPS("v(t)=t^2-6t+5 일 때 가속도가 0인 시각은?", "a(t)=v'(t)=2t-6=0 \\implies t=3") } },
    { "step": 4, "narration": "도형의 넓이 최대화 문제입니다.", "visuals": { "title": "예제 4. 사각형 넓이 최적화", "math": formatPS("둘레가 20인 직사각형의 넓이의 최대값은?", "S(x)=x(10-x) \\implies S'(x)=10-2x=0 \\implies x=5, S=25") } },
    { "step": 5, "narration": "상자의 부피 최대화 문제입니다.", "visuals": { "title": "예제 5. 부피 최적화", "math": formatPS("한 변이 12인 정삼각형에서 모퉁이를 잘라 만든 상자의 최대 부피는?", "V(x)=x(12-2x)^2 \\dots \\implies V'(x)=0 \\text{ 지점 계산}") } },
    { "step": 6, "narration": "그림자 길이의 변화율 문제입니다.", "visuals": { "title": "예제 6. 그림자 변화율", "math": formatPS("키 1.6m인 사람이 4m 높이 가로등에서 2m/s로 멀어질 때 그림자 끝의 속도는?", "\\frac{4}{1.6} = \\frac{x}{x-y} \\implies x = \\frac{4}{2.4}y \\implies v = \\frac{5}{3} \\cdot 2 = 3.33") } },
    { "step": 7, "narration": "원의 넓이 변화율 문제입니다.", "visuals": { "title": "예제 7. 넓이 변화율", "math": formatPS("반지름이 매초 1cm씩 늘어나는 원의 반지름이 5cm일 때 넓이 변화율은?", "S=\\pi r^2 \\implies \\frac{dS}{dt} = 2\\pi r \\frac{dr}{dt} = 2\\pi(5)(1) = 10\\pi") } },
    { "step": 8, "narration": "구의 부피 변화율 문제입니다.", "visuals": { "title": "예제 8. 부피 변화율", "math": formatPS("반지름이 3cm인 구의 반지름이 0.1cm/s로 커질 때 부피 변화율은?", "\\frac{dV}{dt} = 4\\pi r^2 \\frac{dr}{dt} = 4\\pi(9)(0.1) = 3.6\\pi") } },
    { "step": 9, "narration": "두 점 사이의 거리의 최소값입니다.", "visuals": { "title": "예제 9. 거리 최적화", "math": formatPS("y=x^2 위의 점과 (0, 3) 사이의 거리의 최소값은?", "d^2 = x^2 + (x^2-3)^2 = t + (t-3)^2 \\implies t=2.5 \\implies d=\\sqrt{2.75}") } },
    { "step": 10, "narration": "최대 최소 종합 예제입니다.", "visuals": { "title": "예제 10. 원뿔 내접 원기둥", "math": formatPS("반지름 3, 높이 6인 원뿔에 내접하는 원기둥의 최대 부피는?", "r/h = 3/6 = 0.5 \\implies V = \\pi r^2 (6-2r) \\implies V' = 12\\pi r - 6\\pi r^2 = 0 \\implies r=2, V=8\\pi") } }
  ]
};

fs.writeFileSync('./public/premium_lectures/도함수의활용1.json', JSON.stringify(app1, null, 2));
fs.writeFileSync('./public/premium_lectures/도함수의활용2.json', JSON.stringify(app2, null, 2));
fs.writeFileSync('./public/premium_lectures/도함수의활용3.json', JSON.stringify(app3, null, 2));

console.log('Math II Lectures updated with explicit [Problem] and [Solution] fields!');
