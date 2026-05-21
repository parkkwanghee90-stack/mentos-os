import fs from 'fs';

// 1. 함수의극한.json
const limits = {
  "id": "함수의극한",
  "title": "함수의 극한 - 기초부터 심화 예제까지",
  "subject": "수학2",
  "steps": [
    { "step": 1, "narration": "함수의 극한의 기본 정의입니다. x가 a에 한없이 가까워질 때 f(x)가 일정한 값 L에 가까워지는지 확인합니다.", "visuals": { "title": "1. 함수의 극한 정의", "math": "\\lim_{x \\to 1} (2x+3) = 2(1)+3 = 5" } },
    { "step": 2, "narration": "0/0 꼴의 극한입니다. 분모와 분자를 인수분해하여 약분하는 것이 핵심입니다.", "visuals": { "title": "2. 0/0 꼴 (인수분해)", "math": "\\lim_{x \\to 2} \\frac{x^2-4}{x-2} = \\lim_{x \\to 2} \\frac{(x-2)(x+2)}{x-2} \\\\ = \\lim_{x \\to 2} (x+2) = 4" } },
    { "step": 3, "narration": "무리식이 포함된 0/0 꼴입니다. 분자를 유리화하여 약분 가능한 형태를 만듭니다.", "visuals": { "title": "3. 0/0 꼴 (유리화)", "math": "\\lim_{x \\to 0} \\frac{\\sqrt{x+1}-1}{x} = \\lim_{x \\to 0} \\frac{(\\sqrt{x+1}-1)(\\sqrt{x+1}+1)}{x(\\sqrt{x+1}+1)} \\\\ = \\lim_{x \\to 0} \\frac{x}{x(\\sqrt{x+1}+1)} = \\frac{1}{1+1} = 0.5" } },
    { "step": 4, "narration": "무한대/무한대 꼴입니다. 분모의 최고차항으로 나누어 차수를 비교합니다.", "visuals": { "title": "4. 무한대/무한대 꼴", "math": "\\lim_{x \\to \\infty} \\frac{2x^2+3x}{x^2+1} = \\lim_{x \\to \\infty} \\frac{2 + \\frac{3}{x}}{1 + \\frac{1}{x^2}} = \\frac{2+0}{1+0} = 2" } },
    { "step": 5, "narration": "무한대 - 무한대 꼴입니다. 유리화를 통해 무한대/무한대 꼴로 변환합니다.", "visuals": { "title": "5. 무한대 - 무한대 꼴", "math": "\\lim_{x \\to \\infty} (\\sqrt{x^2+x}-x) = \\lim_{x \\to \\infty} \\frac{x}{\\sqrt{x^2+x}+x} \\\\ = \\lim_{x \\to \\infty} \\frac{1}{\\sqrt{1+\\frac{1}{x}}+1} = \\frac{1}{1+1} = 0.5" } },
    { "step": 6, "narration": "좌극한과 우극한이 다를 때의 극한입니다. 절댓값이 포함된 식을 살펴봅시다.", "visuals": { "title": "6. 좌극한과 우극한", "math": "\\lim_{x \\to 0+} \\frac{|x|}{x} = 1, \\quad \\lim_{x \\to 0-} \\frac{|x|}{x} = -1 \\\\ \\implies \\text{극한값 없음}" } },
    { "step": 7, "narration": "미정계수의 결정 문제입니다. 분모가 0으로 갈 때 극한값이 존재하면 분자도 0으로 가야 합니다.", "visuals": { "title": "7. 미정계수 구하기", "math": "\\lim_{x \\to 1} \\frac{x-1}{x^2+ax+b} = 2 \\implies 1+a+b=0 \\\\ \\text{대입 후 약분하여 a, b 도출}" } },
    { "step": 8, "narration": "샌드위치 정리입니다. 양쪽 함수의 극한값이 같으면 가운데 낀 함수도 그 값으로 갑니다.", "visuals": { "title": "8. 함수의 극한 대소 관계", "math": "1 - \\frac{1}{x^2} < f(x) < 1 + \\frac{1}{x^2} \\\\ \\implies \\lim_{x \\to \\infty} f(x) = 1" } }
  ]
};

// 2. 함수의연속.json
const continuity = {
  "id": "함수의연속",
  "title": "함수의 연속 - 끊기지 않는 함수의 조건",
  "subject": "수학2",
  "steps": [
    { "step": 1, "narration": "연속의 3가지 조건입니다. 함숫값 정의, 극한값 존재, 그리고 두 값이 일치해야 합니다.", "visuals": { "title": "1. 연속의 정의", "math": "f(a) \\text{ 존재}, \\lim_{x \\to a} f(x) \\text{ 존재}, \\lim_{x \\to a} f(x) = f(a)" } },
    { "step": 2, "narration": "구간에 따라 다르게 정의된 함수의 연속성 예제입니다.", "visuals": { "title": "2. 구간별 함수의 연속", "math": "f(x) = \\begin{cases} x+a & (x \\ge 1) \\\\ x^2 & (x < 1) \\end{cases} \\implies 1+a = 1^2 \\implies a=0" } },
    { "step": 3, "narration": "연속함수의 성질입니다. 연속인 두 함수를 더하거나 곱해도 연속입니다.", "visuals": { "title": "3. 연속함수의 연산", "math": "f(x), g(x) \\text{ 연속} \\implies f(x) \\pm g(x), f(x)g(x) \\text{ 연속}" } },
    { "step": 4, "narration": "최대 최소 정리입니다. 닫힌 구간에서 연속인 함수는 반드시 최대값과 최소값을 가집니다.", "visuals": { "title": "4. 최대·최소 정리", "math": "f(x) \\in C[a, b] \\implies \\exists \\max, \\min" } },
    { "step": 5, "narration": "사잇값 정리입니다. 실근의 존재 유무를 파악할 때 유용합니다.", "visuals": { "title": "5. 사잇값 정리", "math": "f(1)=-2, f(2)=3 \\implies f(c)=0 \\text{ 인 c가 (1, 2)에 적어도 하나 존재}" } }
  ]
};

// 3. 미분계수와도함수.json
const derivative = {
  "id": "미분계수와도함수",
  "title": "미분계수와 도함수 - 변화율의 이해",
  "subject": "수학2",
  "steps": [
    { "step": 1, "narration": "평균변화율입니다. 두 점 사이의 기울기를 의미합니다.", "visuals": { "title": "1. 평균변화율", "math": "\\frac{f(b)-f(a)}{b-a} = \\text{기울기}" } },
    { "step": 2, "narration": "미분계수(순간변화율)의 정의입니다. 평균변화율의 극한값입니다.", "visuals": { "title": "2. 미분계수의 정의", "math": "f'(a) = \\lim_{h \\to 0} \\frac{f(a+h)-f(a)}{h}" } },
    { "step": 3, "narration": "x^n의 미분법 공식입니다. 지수를 앞으로 빼고 차수를 1 낮춥니다.", "visuals": { "title": "3. 기본 미분법", "math": "(x^n)' = nx^{n-1} \\\\ (x^3)' = 3x^2, \\quad (5x^2)' = 10x" } },
    { "step": 4, "narration": "상수함수의 미분입니다. 상수는 변화율이 0이므로 미분하면 0이 됩니다.", "visuals": { "title": "4. 상수의 미분", "math": "(c)' = 0 \\\\ (100)' = 0" } },
    { "step": 5, "narration": "곱의 미분법입니다. '앞 미분 뒤 그대로' 더하기 '앞 그대로 뒤 미분'입니다.", "visuals": { "title": "5. 곱의 미분법", "math": "\\{f(x)g(x)\\}' = f'(x)g(x) + f(x)g'(x)" } },
    { "step": 6, "narration": "미분가능성과 연속성의 관계입니다. 미분가능하면 반드시 연속입니다.", "visuals": { "title": "6. 미분가능 vs 연속", "math": "\\text{미분가능} \\implies \\text{연속} \\\\ \\text{역은 성립하지 않음 (예: } y=|x|)" } },
    { "step": 7, "narration": "다항함수의 도함수 예제입니다. 각 항을 따로 미분합니다.", "visuals": { "title": "7. 다항함수 미분 실전", "math": "f(x) = x^3 - 2x + 5 \\implies f'(x) = 3x^2 - 2" } },
    { "step": 8, "narration": "접선의 기울기 구하기 예제입니다. 특정 점에서의 미분계수가 곧 기울기입니다.", "visuals": { "title": "8. 접선의 기울기", "math": "y = x^2, \\text{ 점 (1, 1)} \\implies f'(1) = 2(1) = 2" } }
  ]
};

// 4. 부정적분과정적분.json
const integral = {
  "id": "부정적분과정적분",
  "title": "부정적분과 정적분 - 미분의 역연산",
  "subject": "수학2",
  "steps": [
    { "step": 1, "narration": "부정적분입니다. 미분해서 f(x)가 되는 함수를 찾고 적분상수 C를 붙입니다.", "visuals": { "title": "1. 부정적분의 정의", "math": "\\int x^n dx = \\frac{1}{n+1}x^{n+1} + C" } },
    { "step": 2, "narration": "부정적분 예제입니다. 다항식을 적분해봅시다.", "visuals": { "title": "2. 부정적분 계산", "math": "\\int (3x^2 + 2x) dx = x^3 + x^2 + C" } },
    { "step": 3, "narration": "정적분입니다. 위끝과 아래끝이 정해진 합의 영역입니다.", "visuals": { "title": "3. 정적분의 정의", "math": "\\int_a^b f(x) dx = [F(x)]_a^b = F(b) - F(a)" } },
    { "step": 4, "narration": "정적분의 기본 성질입니다. 위끝과 아래끝을 바꾸면 부호가 바뀝니다.", "visuals": { "title": "4. 정적분 성질", "math": "\\int_a^b f(x) dx = -\\int_b^a f(x) dx" } },
    { "step": 5, "narration": "구간을 나누어 적분하기입니다. 끊어진 구간을 합칠 수 있습니다.", "visuals": { "title": "5. 정적분의 구간 분할", "math": "\\int_1^3 f(x) dx = \\int_1^2 f(x) dx + \\int_2^3 f(x) dx" } },
    { "step": 6, "narration": "정적분 계산 실전 예제입니다.", "visuals": { "title": "6. 정적분 수치 계산", "math": "\\int_1^2 3x^2 dx = [x^3]_1^2 = 2^3 - 1^3 = 7" } },
    { "step": 7, "narration": "정적분으로 정의된 함수입니다. 미분하면 피적분 함수가 튀어나옵니다.", "visuals": { "title": "7. 정적분과 미분의 관계", "math": "\\frac{d}{dx} \\int_a^x f(t) dt = f(x)" } },
    { "step": 8, "narration": "우함수와 기함수의 정적분입니다. 대칭성을 이용하면 계산이 빨라집니다.", "visuals": { "title": "8. 대칭 함수의 정적분", "math": "\\int_{-a}^a x^3 dx = 0 \\quad (\\text{기함수}) \\\\ \\int_{-a}^a x^2 dx = 2 \\int_0^a x^2 dx \\quad (\\text{우함수})" } }
  ]
};

fs.writeFileSync('./public/premium_lectures/함수의극한.json', JSON.stringify(limits, null, 2));
fs.writeFileSync('./public/premium_lectures/함수의연속.json', JSON.stringify(continuity, null, 2));
fs.writeFileSync('./public/premium_lectures/미분계수와도함수.json', JSON.stringify(derivative, null, 2));
fs.writeFileSync('./public/premium_lectures/부정적분과정적분.json', JSON.stringify(integral, null, 2));

console.log('Math II lectures generated!');
