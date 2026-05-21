import fs from 'fs';

const path = './public/concept_cards/dynamic_concepts.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const math2Concepts = [
  {
    "id": "m2_limit_01",
    "unit": "함수의 극한",
    "title": "함수의 극한 핵심 3유형",
    "content": "### 1. 0/0 꼴 (부정형)\n- 인수분해 또는 유리화 후 약분!\n- 예: $\\lim_{x \\to 2} \\frac{x^2-4}{x-2} = 4$\n\n### 2. $\\infty/\\infty$ 꼴\n- 분모의 최고차항으로 나누기\n- 차수 비교: 분자=분모 $\\to$ 계수비, 분자>분모 $\\to \\infty$, 분자<분모 $\\to 0$\n\n### 3. $\\infty - \\infty$ 꼴\n- 무리식이면 유리화하여 분수 꼴로 변환"
  },
  {
    "id": "m2_cont_01",
    "unit": "함수의 연속",
    "title": "함수가 연속일 조건",
    "content": "점 $x=a$에서 함수 $f(x)$가 연속이려면:\n1. **$f(a)$가 정의**되어야 함 (함숫값)\n2. **$\\lim_{x \\to a} f(x)$가 존재**해야 함 (극한값)\n3. **$\\lim_{x \\to a} f(x) = f(a)$** 이어야 함\n\n**꿀팁:** 좌극한 = 우극한 = 함숫값 세 개가 모두 같으면 무조건 연속!"
  },
  {
    "id": "m2_diff_01",
    "unit": "미분",
    "title": "미분계수의 기하학적 의미",
    "content": "함수 $y=f(x)$의 $x=a$에서의 미분계수 $f'(a)$는:\n- 곡선 위의 점 $(a, f(a))$에서의 **접선의 기울기**를 의미합니다.\n\n### 미분법 공식 기초\n- $(x^n)' = nx^{n-1}$\n- $(c)' = 0$\n- $\\{f(x)+g(x)\\}' = f'(x)+g'(x)$"
  },
  {
    "id": "m2_integ_01",
    "unit": "적분",
    "title": "정적분의 기본 정리",
    "content": "부정적분을 $F(x)$라 할 때, $[a, b]$에서의 정적분은:\n$$\\int_a^b f(x) dx = F(b) - F(a)$$\n\n### 정적분과 넓이\n- $f(x) \\ge 0$ 일 때, 정적분 값은 곡선과 $x$축 사이의 **넓이**와 같습니다.\n- 축 아래에 그래프가 있다면 부호를 바꿔야 넓이가 됩니다."
  }
];

math2Concepts.forEach(newCard => {
  const idx = data.findIndex(c => c.id === newCard.id);
  if (idx !== -1) data[idx] = newCard; else data.push(newCard);
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Math II concept cards added!');
