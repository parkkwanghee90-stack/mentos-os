import fs from 'fs';

const path = './public/concept_cards/dynamic_concepts.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const sigmaExamples = [
  {
    "id": "sigma_ex_01",
    "unit": "수열",
    "title": "[시그마 예제1] 성질과 기본 계산",
    "content": "### 문제: $\\sum_{k=1}^{10} (3k + 2)$ 의 값을 구하시오.\n\n**풀이:**\n시그마의 선형성(분배법칙)을 이용합니다.\n1. $3 \\sum_{k=1}^{10} k + \\sum_{k=1}^{10} 2$\n2. $3 \\cdot \\frac{10 \\cdot 11}{2} + 2 \\cdot 10$\n3. $3 \\cdot 55 + 20 = 165 + 20 = 185$\n\n**핵심:** 상수는 항의 개수(10)를 곱해줘야 함에 주의!"
  },
  {
    "id": "sigma_ex_02",
    "unit": "수열",
    "title": "[시그마 예제2] 자연수의 합",
    "content": "### 문제: $1$부터 $100$까지의 합을 구하시오.\n\n**풀이:**\n$\\sum_{k=1}^{100} k$ 공식을 적용합니다.\n1. 공식: $\\frac{n(n+1)}{2}$\n2. 대입: $\\frac{100 \\cdot 101}{2}$\n3. 결과: $50 \\cdot 101 = 5050$"
  },
  {
    "id": "sigma_ex_03",
    "unit": "수열",
    "title": "[시그마 예제3] 제곱의 합",
    "content": "### 문제: $1^2 + 2^2 + \\dots + 10^2$ 의 값을 구하시오.\n\n**풀이:**\n$\\sum_{k=1}^{10} k^2$ 공식을 적용합니다.\n1. 공식: $\\frac{n(n+1)(2n+1)}{6}$\n2. 대입: $\\frac{10 \\cdot 11 \\cdot 21}{6}$\n3. 약분: $5 \\cdot 11 \\cdot 7 = 385$"
  },
  {
    "id": "sigma_ex_04",
    "unit": "수열",
    "title": "[시그마 예제4] 세제곱의 합",
    "content": "### 문제: $1^3 + 2^3 + \\dots + 10^3$ 의 값을 구하시오.\n\n**풀이:**\n$\\sum_{k=1}^{10} k^3$ 공식을 적용합니다.\n1. 공식: $\\left\\{ \\frac{n(n+1)}{2} \\right\\}^2$\n2. 대입: $\\left\\{ \\frac{10 \\cdot 11}{2} \\right\\}^2$\n3. 계산: $55^2 = 3025$"
  },
  {
    "id": "sigma_ex_05",
    "unit": "수열",
    "title": "[시그마 예제5] 중간 항부터의 합",
    "content": "### 문제: $\\sum_{k=5}^{10} k$ 의 값을 구하시오.\n\n**풀이:**\n전체 합에서 1~4항의 합을 빼줍니다.\n1. $\\sum_{k=1}^{10} k - \\sum_{k=1}^{4} k$\n2. $\\frac{10 \\cdot 11}{2} - \\frac{4 \\cdot 5}{2}$\n3. $55 - 10 = 45$"
  },
  {
    "id": "sigma_ex_06",
    "unit": "수열",
    "title": "[시그마 예제6] 부분분수 소거",
    "content": "### 문제: $\\sum_{k=1}^{n} \\frac{1}{k(k+1)}$ 의 값을 구하시오.\n\n**풀이:**\n분수식을 쪼개서 연쇄 소거를 만듭니다.\n1. $\\frac{1}{k(k+1)} = \\frac{1}{k} - \\frac{1}{k+1}$\n2. 대입: $(1-\\frac{1}{2}) + (\\frac{1}{2}-\\frac{1}{3}) + \\dots + (\\frac{1}{n}-\\frac{1}{n+1})$\n3. 결과: $1 - \\frac{1}{n+1}$"
  },
  {
    "id": "sigma_ex_07",
    "unit": "수열",
    "title": "[시그마 예제7] 등비수열의 시그마",
    "content": "### 문제: $\\sum_{k=1}^{5} 2^k$ 의 값을 구하시오.\n\n**풀이:**\n등비수열의 합 공식을 적용합니다. ($a=2, r=2, n=5$)\n1. 공식: $\\frac{a(r^n-1)}{r-1}$\n2. 대입: $\\frac{2(2^5-1)}{2-1}$\n3. 계산: $2(31) = 62$"
  },
  {
    "id": "sigma_ex_08",
    "unit": "수열",
    "title": "[시그마 예제8] 문자와 상수",
    "content": "### 문제: $\\sum_{i=1}^{n} (i + c)$ 의 값을 구하시오.\n\n**풀이:**\n변수가 $i$임에 주의하여 각각 계산합니다.\n1. $\\sum_{i=1}^{n} i + \\sum_{i=1}^{n} c$\n2. $\\frac{n(n+1)}{2} + nc$\n3. 통분: $\\frac{n^2 + n + 2nc}{2}$"
  }
];

// Add example cards
sigmaExamples.forEach(newCard => {
  const idx = data.findIndex(c => c.id === newCard.id);
  if (idx !== -1) {
    data[idx] = newCard;
  } else {
    data.push(newCard);
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('8 Sigma example cards added!');
