import fs from 'fs';

const path = './public/concept_cards/premium_lectures.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const arithmeticContent = `
# 📌 등차수열 (Arithmetic Sequence)

## 1. 일반항과 성질
- **일반항:** $a_n = a + (n-1)d$
- **특징:** $n$에 대한 1차식이며, $n$의 계수가 곧 공차($d$)입니다.

## 2. 등차수열의 합 ($S_n$)
- **공식:** $S_n = \\frac{n(a+l)}{2} = \\frac{n\\{2a+(n-1)d\\}}{2}$
- **$S_n$의 형태 분석 (매우 중요!):**
  - $S_n = An^2 + Bn + C$ 꼴의 $n$에 대한 2차식입니다.
  - **상수항 $C = 0$ 일 때:** 제1항부터 등차수열을 이룹니다. (공차 $d = 2A$)
  - **상수항 $C \\neq 0$ 일 때:** 제2항부터 등차수열을 이룹니다. 제1항은 규칙에서 벗어납니다. ($a_1 = S_1$)

## 3. 실전 예제 (5선)
1. $a_1=3, d=2$ 일 때 $a_{10}$ 구하기 $\\implies 3 + 9(2) = 21$
2. $a_3=10, a_7=22$ 일 때 $d$ 구하기 $\\implies 4d=12 \\implies d=3$
3. $S_n = n^2 + 2n$ 일 때 $a_n$ 구하기 $\\implies a_n = 2n + 1$ (상수항 0이므로 제1항부터 적용)
4. $S_n = n^2 + 2n + 1$ 일 때 $a_1, a_2$ 구하기 $\\implies a_1=S_1=4, a_2=S_2-S_1=8-4=4$
5. 세 수 $x, 10, 16$ 이 등차수열일 때 $x$ 구하기 $\\implies 2(10) = x+16 \\implies x=4$
`;

const geometricContent = `
# 📌 등비수열 (Geometric Sequence)

## 1. 일반항
- **공식:** $a_n = a \\cdot r^{n-1}$ ($a$: 첫째항, $r$: 공비)

## 2. 등비수열의 합 ($S_n$)
- **공식:** $S_n = \\frac{a(r^n - 1)}{r - 1} = \\frac{a(1 - r^n)}{1 - r} \\quad (r \\neq 1)$
- **$r=1$ 인 경우:** $S_n = na$

## 3. 실전 예제 (5선)
1. $a_1=2, r=3$ 일 때 $a_4$ 구하기 $\\implies 2 \\cdot 3^3 = 54$
2. $a_2=6, a_5=48$ 일 때 $r$ 구하기 $\\implies r^3=8 \\implies r=2$
3. $a_1=1, r=2, S_n=127$ 일 때 $n$ 구하기 $\\implies 2^n - 1 = 127 \\implies n=7$
4. 세 수 $4, x, 9$ 가 등비수열일 때 양수 $x$ 구하기 $\\implies x^2=36 \\implies x=6$
5. 첫째항이 5, 공비가 1인 수열의 $S_{10}$ 구하기 $\\implies 5 \\cdot 10 = 50$
`;

const sigmaContent = `
# 📌 수열의 합과 시그마(Σ)

## 1. 시그마의 정의와 성질
- **정의:** $\\sum_{k=1}^{n} a_k = a_1 + a_2 + \\dots + a_n$
- **성질:** $\\sum (a_k \\pm b_k) = \\sum a_k \\pm \\sum b_k$, $\\sum c a_k = c \\sum a_k$, $\\sum_{k=1}^n c = nc$

## 2. 자연수 거듭제곱 합 공식
- $\\sum_{k=1}^n k = \\frac{n(n+1)}{2}$
- $\\sum_{k=1}^n k^2 = \\frac{n(n+1)(2n+1)}{6}$
- $\\sum_{k=1}^n k^3 = \\left\\{ \\frac{n(n+1)}{2} \\right\\}^2$

## 3. 시그마 실전 예제
1. $\\sum_{k=1}^{10} (2k-1)$ 계산 $\\implies 2\\frac{10 \\cdot 11}{2} - 10 = 100$
2. $\\sum_{k=1}^5 k^2$ 계산 $\\implies \\frac{5 \\cdot 6 \\cdot 11}{6} = 55$
3. $\\sum_{k=1}^n \\frac{1}{k(k+1)}$ 계산 $\\implies 1 - \\frac{1}{n+1}$
4. $\\sum_{k=1}^{10} 3$ 계산 $\\implies 3 \\cdot 10 = 30$
5. $\\sum_{k=1}^5 (k^2 + k)$ 계산 $\\implies 55 + 15 = 70$
`;

const sequenceCategory = data['수열'];
const cards = {
  "등차수열": arithmeticContent,
  "등비수열": geometricContent,
  "수열의 합": sigmaContent
};

Object.keys(cards).forEach(id => {
  const idx = sequenceCategory.findIndex(c => c.id === id);
  if (idx !== -1) {
    sequenceCategory[idx].content = cards[id];
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Finalized Sequence Formula Cards with specific examples and analysis!');
