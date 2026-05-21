import fs from 'fs';

const path = './public/concept_cards/dynamic_concepts.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const sequenceConcepts = [
  {
    "id": "seq_arith_01_final",
    "unit": "수열",
    "title": "1. 등차수열의 일반항",
    "content": "### 등차수열의 일반항\n첫째항이 $a$, 공차가 $d$인 등차수열 $a_n$은:\n$$a_n = a + (n-1)d$$\n\n**핵심 분석:**\n- $n$에 대한 **일차식**입니다.\n- $n$의 계수가 바로 **공차 $d$**입니다.\n- 예: $a_n = 3n + 2 \\implies$ 공차는 3, 첫항은 5"
  },
  {
    "id": "seq_arith_02_final",
    "unit": "수열",
    "title": "2. 등차중항",
    "content": "### 등차중항의 정의\n세 수 $a, b, c$가 이 순서대로 등차수열을 이룰 때, $b$를 $a$와 $c$의 등차중항이라 합니다.\n\n**성질:**\n$$2b = a + c \\implies b = \\frac{a+c}{2}$$\n\n**활용:** 등차수열을 이루는 세 수를 $a-d, a, a+d$로 놓으면 합이 $3a$로 간단해집니다."
  },
  {
    "id": "seq_arith_03_final",
    "unit": "수열",
    "title": "3. 등차수열의 합 (Sn)",
    "content": "### 등차수열의 합 공식\n첫째항 $a$, 공차 $d$, 제 $n$항(끝항) $l$인 등차수열의 합 $S_n$은:\n\n1. **첫항과 끝항을 알 때:**\n   $$S_n = \\frac{n(a+l)}{2}$$\n2. **첫항과 공차를 알 때:**\n   $$S_n = \\frac{n\\{2a+(n-1)d\\}}{2}$$\n\n### $S_n$의 이차식 분석 (중요!)\n$S_n = An^2 + Bn + C$ 꼴에서:\n- **$C=0$ 이면:** 제1항부터 등차수열 (일반항 $a_n = S_n - S_{n-1}$ 가 $n=1$부터 성립)\n- **$C \\neq 0$ 이면:** 제2항부터 등차수열 (첫항은 $a_1 = S_1$ 로 별도 계산)"
  },
  {
    "id": "seq_geo_01_final",
    "unit": "수열",
    "title": "4. 등비수열의 일반항과 중항",
    "content": "### 등비수열의 일반항\n첫째항이 $a$, 공비가 $r$인 등비수열 $a_n$은:\n$$a_n = a \\cdot r^{n-1}$$\n\n### 등비중항\n세 수 $a, b, c$가 이 순서대로 등비수열을 이룰 때:\n$$b^2 = ac \\implies b = \\pm \\sqrt{ac}$$"
  },
  {
    "id": "seq_geo_02_final",
    "unit": "수열",
    "title": "5. 등비수열의 합 (Sn)",
    "content": "### 등비수열의 합 공식\n첫째항 $a$, 공비 $r$인 등비수열의 제 $n$항까지의 합 $S_n$은:\n\n- **$r \\neq 1$ 일 때:**\n  $$S_n = \\frac{a(r^n - 1)}{r - 1} = \\frac{a(1 - r^n)}{1 - r}$$\n- **$r = 1$ 일 때:**\n  $$S_n = na$$"
  }
];

// Add these to dynamic concepts, ensuring no duplicates by title/unit
sequenceConcepts.forEach(newCard => {
  const existingIdx = data.findIndex(c => c.title === newCard.title && c.unit === newCard.unit);
  if (existingIdx !== -1) {
    data[existingIdx] = newCard;
  } else {
    data.push(newCard);
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Fixed "3. 등차수열의 합 (Sn)" and other sequence cards in dynamic_concepts.json!');
