import fs from 'fs';

const path = './public/concept_cards/premium_lectures.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const sequenceCards = [
  {
    "id": "등차수열",
    "title": "등차수열 (Arithmetic Sequence)",
    "content": "# 📌 등차수열 완벽 정리\n\n## 1. 일반항 (General Term)\n첫째항이 $a$, 공차가 $d$인 등차수열 $a_n$은:\n$$a_n = a + (n-1)d$$\n\n## 2. 등차중항 (Arithmetic Mean)\n세 수 $x, y, z$가 이 순서대로 등차수열을 이루면:\n$$2y = x + z \\implies y = \\frac{x+z}{2}$$\n\n## 3. 등차수열의 합 ($S_n$)\n- **첫항($a$)과 끝항($l$)을 알 때:** $S_n = \\frac{n(a+l)}{2}$\n- **첫항($a$)과 공차($d$)를 알 때:** $S_n = \\frac{n\\{2a+(n-1)d\\}}{2}$\n\n### 💡 유도 아이디어 (가우스)\n$S_n = a + (a+d) + \\dots + l$\n$S_n = l + (l-d) + \\dots + a$\n두 식을 더하면 $2S_n = n(a+l)$"
  },
  {
    "id": "등비수열",
    "title": "등비수열 (Geometric Sequence)",
    "content": "# 📌 등비수열 완벽 정리\n\n## 1. 일반항 (General Term)\n첫째항이 $a$, 공비가 $r$인 등비수열 $a_n$은:\n$$a_n = a \\cdot r^{n-1}$$\n\n## 2. 등비중항 (Geometric Mean)\n세 수 $x, y, z$가 이 순서대로 등비수열을 이루면:\n$$y^2 = xz \\implies y = \\pm \\sqrt{xz}$$\n\n## 3. 등비수열의 합 ($S_n$)\n$$S_n = \\frac{a(r^n - 1)}{r - 1} = \\frac{a(1 - r^n)}{1 - r} \\quad (r \\neq 1)$$\n- $r=1$ 이면 $S_n = na$\n\n### 💡 유도 아이디어\n$S_n - rS_n$을 계산하면 중간 항들이 모두 소거되고 $a - ar^n$만 남습니다."
  },
  {
    "id": "수열의 합",
    "title": "수열의 합과 시그마(Σ)",
    "content": "# 📌 시그마(Σ)와 수열의 합\n\n## 1. 시그마의 정의\n$$\\sum_{k=1}^{n} a_k = a_1 + a_2 + \\dots + a_n$$\n\n## 2. 자연수의 거듭제곱 합\n- $\\sum k = \\frac{n(n+1)}{2}$\n- $\\sum k^2 = \\frac{n(n+1)(2n+1)}{6}$\n- $\\sum k^3 = \\left\\{ \\frac{n(n+1)}{2} \\right\\}^2$\n\n## 3. $S_n$과 $a_n$의 관계\n$$a_n = S_n - S_{n-1} \\quad (n \\geq 2)$$\n$a_1 = S_1$ 임을 반드시 확인!"
  }
];

// Replace the old ones in "수열" category
const sequenceCategory = data['수열'];
sequenceCards.forEach(newCard => {
  const idx = sequenceCategory.findIndex(c => c.id === newCard.id);
  if (idx !== -1) {
    sequenceCategory[idx] = newCard;
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Upgraded Sequence Formula Cards!');
