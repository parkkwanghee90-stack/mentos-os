import fs from 'fs';

// 1. 수열의극한.json
const seqLimits = {
  "id": "수열의극한",
  "title": "수열의 극한 - 무한대로 가는 수열의 운명",
  "subject": "미적분",
  "steps": [
    { "step": 1, "narration": "수열의 극한 기본입니다. n이 무한히 커질 때 일반항 an이 어디로 가는지 확인합니다.", "visuals": { "title": "1. 수열의 극한 정의", "math": "\\lim_{n \\to \\infty} \\frac{1}{n} = 0" } },
    { "step": 2, "narration": "무한대/무한대 꼴의 수열입니다. 차수가 같으면 최고차항 계수비가 답입니다.", "visuals": { "title": "2. 최고차항 계수 비교", "math": "\\lim_{n \\to \\infty} \\frac{3n^2+5n}{2n^2+1} = \\frac{3}{2} = 1.5" } },
    { "step": 3, "narration": "무한대 - 무한대 꼴입니다. 유리화를 통해 분수 형태로 바꾸어 계산합니다.", "visuals": { "title": "3. 무리식 수열의 극한", "math": "\\lim_{n \\to \\infty} (\\sqrt{n^2+2n}-n) = \\lim_{n \\to \\infty} \\frac{2n}{\\sqrt{n^2+2n}+n} = 1" } },
    { "step": 4, "narration": "등비수열의 극한입니다. 공비 r의 범위에 따라 수렴과 발산이 결정됩니다.", "visuals": { "title": "4. 등비수열의 수렴 조건", "math": "\\lim_{n \\to \\infty} r^n \\implies \\begin{cases} |r|<1 & \\to 0 \\\\ r=1 & \\to 1 \\\\ |r|>1, r=-1 & \\to \\text{발산} \\end{cases}" } },
    { "step": 5, "narration": "등비수열의 극한 계산 예제입니다. 절대값이 가장 큰 항으로 나눕니다.", "visuals": { "title": "5. 등비수열 극한 실전", "math": "\\lim_{n \\to \\infty} \\frac{3^n+2^n}{3^{n+1}-2^n} = \\lim_{n \\to \\infty} \\frac{1+(\\frac{2}{3})^n}{3-(\\frac{2}{3})^n} = \\frac{1}{3}" } },
    { "step": 6, "narration": "수열의 샌드위치 정리입니다. 양쪽 수열이 같은 값으로 가면 가운데도 그 값입니다.", "visuals": { "title": "6. 수열의 대소 관계", "math": "\\frac{2n-1}{n} < a_n < \\frac{2n+5}{n} \\\\ \\implies \\lim_{n \\to \\infty} a_n = 2" } },
    { "step": 7, "narration": "급수와 극한의 관계입니다. 급수가 수렴하면 일반항은 무조건 0으로 가야 합니다.", "visuals": { "title": "7. 급수와 일반항의 관계", "math": "\\sum a_n \\text{ 수렴} \\implies \\lim_{n \\to \\infty} a_n = 0" } },
    { "step": 8, "narration": "미정계수 결정 예제입니다. 극한값이 존재하도록 n의 계수를 맞춥니다.", "visuals": { "title": "8. 미정계수 구하기", "math": "\\lim_{n \\to \\infty} (\\sqrt{n^2+an}-n) = 3 \\implies \\frac{a}{2} = 3 \\implies a=6" } }
  ]
};

// 2. 함수의연속.json (Upgraded with 5+ IVT examples)
const continuity = {
  "id": "함수의연속",
  "title": "함수의 연속과 사잇값 정리 심화",
  "subject": "수학2",
  "steps": [
    { "step": 1, "narration": "연속의 기초를 복습하고 사잇값 정리의 실전 예제들을 파헤쳐 봅시다.", "visuals": { "title": "함수의 연속 복습", "math": "\\text{좌극한 = 우극한 = 함숫값}" } },
    { "step": 2, "narration": "사잇값 정리 예제 1: 구간 (0, 1)에서 실근의 존재를 증명합니다.", "visuals": { "title": "예제 1. 실근의 존재 증명", "math": "f(x) = x^3+x-1 \\\\ f(0)=-1, \\quad f(1)=1 \\\\ f(0)f(1) < 0 \\implies (0, 1) \\text{에 적어도 하나의 실근 존재}" } },
    { "step": 3, "narration": "사잇값 정리 예제 2: 두 함수의 교점이 특정 구간에 있는지 확인합니다.", "visuals": { "title": "예제 2. 두 함수의 교점", "math": "f(x)=x^2, g(x)=\\cos x \\\\ h(x)=x^2-\\cos x \\text{ 라 하면} \\\\ h(0)=-1, h(\\pi)=\\pi^2+1 \\\\ \\implies (0, \\pi) \\text{에서 적어도 하나의 교점 발생}" } },
    { "step": 4, "narration": "사잇값 정리 예제 3: 적어도 몇 개의 실근을 갖는지 판단하는 문제입니다.", "visuals": { "title": "예제 3. 최소 실근 개수", "math": "f(-1)=2, f(0)=-1, f(1)=-3, f(2)=1 \\\\ \\text{부호 변화: } (-1,0), (1,2) \\implies \\text{적어도 2개의 실근}" } },
    { "step": 5, "narration": "사잇값 정리 예제 4: 실생활 응용 문제입니다. 기온이나 속도의 연속성을 이용합니다.", "visuals": { "title": "예제 4. 실생활 응용 (속도)", "math": "v(0)=0, v(10)=100 \\text{ (km/h)} \\\\ \\text{속도가 연속이므로 0과 100 사이의 모든 속도를 거쳐감}" } },
    { "step": 6, "narration": "사잇값 정리 예제 5: 복잡한 방정식의 근을 추론합니다.", "visuals": { "title": "예제 5. 다항방정식의 근", "math": "f(x) = (x-1)(x-2) + (x-2)(x-3) + (x-3)(x-1) \\\\ f(1)=2, f(2)=-1, f(3)=2 \\\\ \\implies (1,2), (2,3) \\text{에서 각각 실근 존재 (총 2개)}" } }
  ]
};

fs.writeFileSync('./public/premium_lectures/수열의극한.json', JSON.stringify(seqLimits, null, 2));
fs.writeFileSync('./public/premium_lectures/함수의연속.json', JSON.stringify(continuity, null, 2));

console.log('Added Sequence Limits and Upgraded Continuity with 5 IVT examples!');
