import fs from 'fs';

// 1. 미분계수와도함수.json (Upgraded with various expressions)
const derivative = {
  "id": "미분계수와도함수",
  "title": "미분계수의 다양한 표현과 미분법",
  "subject": "수학2",
  "steps": [
    { "step": 1, "narration": "미분계수의 기본 정의인 h 증분 방식입니다.", "visuals": { "title": "표현 1. h 증분 정의", "math": "f'(a) = \\lim_{h \\to 0} \\frac{f(a+h)-f(a)}{h}" } },
    { "step": 2, "narration": "x가 a로 한없이 가까워질 때의 표현 방식입니다.", "visuals": { "title": "표현 2. x 지향 정의", "math": "f'(a) = \\lim_{x \\to a} \\frac{f(x)-f(a)}{x-a}" } },
    { "step": 3, "narration": "h의 계수가 다를 때의 변형입니다. 분모와 모양을 맞추는 것이 핵심입니다.", "visuals": { "title": "표현 3. h 계수 변형", "math": "\\lim_{h \\to 0} \\frac{f(a+3h)-f(a)}{h} = 3f'(a)" } },
    { "step": 4, "narration": "양방향 증분을 사용하는 대칭 미분계수 표현입니다.", "visuals": { "title": "표현 4. 대칭 미분계수", "math": "\\lim_{h \\to 0} \\frac{f(a+h)-f(a-h)}{2h} = f'(a)" } },
    { "step": 5, "narration": "라이프니츠의 미분 표기법입니다. 증분의 비로 이해합니다.", "visuals": { "title": "표현 5. Leibniz 표기법", "math": "\\frac{dy}{dx} = \\lim_{\\Delta x \\to 0} \\frac{\\Delta y}{\\Delta x}" } },
    { "step": 6, "narration": "도함수의 정의입니다. 임의의 점 x에서의 변화율을 함수로 나타냅니다.", "visuals": { "title": "표현 6. 도함수의 정의", "math": "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}" } },
    { "step": 7, "narration": "미분 연산자 표기입니다. 함수 전체를 미분한다는 의미입니다.", "visuals": { "title": "표현 7. 연산자 D 표기", "math": "\\frac{d}{dx}[f(x)] = f'(x)" } },
    { "step": 8, "narration": "고계 도함수(여러 번 미분) 표현입니다.", "visuals": { "title": "표현 8. n계 도함수", "math": "y'', \\quad f''(x), \\quad \\frac{d^2y}{dx^2}" } }
  ]
};

// 2. 도함수의활용.json (Tangents focus - 8 examples)
const tangent = {
  "id": "도함수의활용",
  "title": "도함수의 활용 - 접선의 방정식 완벽 마스터",
  "subject": "수학2",
  "steps": [
    { "step": 1, "narration": "곡선 위의 점에서의 접선입니다. 미분계수가 곧 기울기임을 이용합니다.", "visuals": { "title": "예제 1. 곡선 위의 점 (1, 2)", "math": "y = x^2+1, \\text{ 점 (1, 2)} \\\\ f'(x)=2x \\implies f'(1)=2 \\\\ y-2 = 2(x-1) \\implies y=2x" } },
    { "step": 2, "narration": "기울기가 주어진 경우의 접선입니다. f'(x)=m 이 되는 x를 먼저 찾습니다.", "visuals": { "title": "예제 2. 기울기가 4인 접선", "math": "y = x^2, \\quad m=4 \\\\ f'(x)=2x=4 \\implies x=2, y=4 \\\\ y-4 = 4(x-2) \\implies y=4x-4" } },
    { "step": 3, "narration": "곡선 밖의 한 점이 주어진 경우입니다. 임의의 접점을 (t, f(t))로 잡는 것이 시작입니다.", "visuals": { "title": "예제 3. 밖의 점 (0, -1)에서 쏜 접선", "math": "y = x^2, \\text{ 점 (0, -1)} \\\\ \\text{접점 (t, t^2), 기울기 2t} \\\\ t^2 - (-1) = 2t(t-0) \\implies t^2+1=2t^2 \\implies t=\\pm 1 \\\\ y=2x-1, \\quad y=-2x-1" } },
    { "step": 4, "narration": "법선(수직인 선)의 방정식입니다. 기울기 곱이 -1인 성질을 이용합니다.", "visuals": { "title": "예제 4. 접선에 수직인 법선", "math": "y = x^2, \\text{ 점 (1, 1), 접선 기울기 2} \\\\ \\text{법선 기울기 } = -0.5 \\\\ y-1 = -0.5(x-1) \\implies y=-0.5x+1.5" } },
    { "step": 5, "narration": "두 곡선이 한 점에서 접할 조건입니다. 함숫값과 미분계수가 모두 같아야 합니다.", "visuals": { "title": "예제 5. 공통접선을 가질 조건", "math": "f(x)=g(x), \\quad f'(x)=g'(x)" } },
    { "step": 6, "narration": "기울기가 x축과 이루는 각도가 주어진 경우입니다. 탄젠트 값이 기울기입니다.", "visuals": { "title": "예제 6. 각도가 45도인 접선", "math": "\\tan 45^\\circ = 1 \\implies f'(x)=1" } },
    { "step": 7, "narration": "두 곡선이 서로 직교(수직으로 만남)할 조건입니다. 기울기의 곱이 -1입니다.", "visuals": { "title": "예제 7. 직교하는 두 곡선", "math": "f'(a) \\cdot g'(a) = -1" } },
    { "step": 8, "narration": "다항함수와 직선이 접할 때의 중근 성질입니다. f(x)-g(x)가 완전제곱식을 가집니다.", "visuals": { "title": "예제 8. 중근을 이용한 접선 판단", "math": "f(x) - (mx+n) = (x-a)^2 Q(x)" } }
  ]
};

fs.writeFileSync('./public/premium_lectures/미분계수와도함수.json', JSON.stringify(derivative, null, 2));
fs.writeFileSync('./public/premium_lectures/도함수의활용.json', JSON.stringify(tangent, null, 2));

console.log('Derivative expressions and Tangent lectures updated!');
