const fs = require('fs');
const path = require('path');

const dir = 'C:/mentos_os_clean/public/math_hints/확통수능/3)이항정리/';
const data = [
  {
    id: '026',
    P: '다항식 $(3x+2)(x+\\frac{a}{x})^6$의 전개식에서 $x^3$의 계수와 $x^4$의 계수의 합이 9일 때, 양수 $a$를 구합니다.',
    C: '두 식의 곱에서 각각 $x^3$과 $x^4$가 나오는 항을 찾아 합산합니다.',
    B: '이항정리 일반항 $A_r = {}_6\\mathrm{C}_r a^{6-r} x^{2r-6}$',
    S: '1) $x^3$의 계수: $3x \\times (A_4) = 3 \\cdot ({}_6\\mathrm{C}_4 a^2) = 45a^2$\n2) $x^4$의 계수: $2 \\times (A_5) = 2 \\cdot ({}_6\\mathrm{C}_5 a^1) = 12a$\n\n합: $45a^2 + 12a = 9 \\Rightarrow 15a^2 + 4a - 3 = 0$\n\n$(3a-1)(5a+3) = 0$ 에서 양수 $a = 1/3$ 입니다.',
    A: '1/3'
  },
  {
    id: '027',
    P: '다항식 $(kx + \\frac{1}{x^2})^6$의 전개식에서 $x^3$의 계수와 상수항이 서로 같을 때, 양수 $k$를 구합니다.',
    C: '상수항과 $x^3$의 항에 해당하는 일반항을 각각 구하여 계수를 비교합니다.',
    B: '일반항: ${}_6\\mathrm{C}_r k^r x^{3r-12}$',
    S: '1) 상수항: $3r-12=0 \\Rightarrow r=4$. 계수는 ${}_6\\mathrm{C}_4 k^4 = 15k^4$\n2) $x^3$ 계수: $3r-12=3 \\Rightarrow r=5$. 계수는 ${}_6\\mathrm{C}_5 k^5 = 6k^5$\n\n조건 $15k^4 = 6k^5$ 에서 $k = 15/6 = 2.5$ 입니다.',
    A: '2.5'
  },
  {
    id: '028',
    P: '다항식 $(ax^3-3x)(3x-2)^5$의 전개식에서 $x^4$의 계수가 -2040일 때, $a$를 구합니다.',
    C: '분배법칙을 이용하여 $x^4$가 나오는 두 가지 경우를 계산합니다.',
    B: '1) $ax^3 \\times (x^1 \\text{항})$, 2) $-3x \\times (x^3 \\text{항})$',
    S: '$(3x-2)^5$의 일반항 $A_r = {}_5\\mathrm{C}_r (3x)^r (-2)^{5-r}$ 입니다.\n\n1) $ax^3 \\cdot A_1 = ax^3 \\cdot ({}_5\\mathrm{C}_1 \\cdot 3^1 \\cdot (-2)^4) = 240ax^4$\n2) $-3x \\cdot A_3 = -3x \\cdot ({}_5\\mathrm{C}_3 \\cdot 3^3 \\cdot (-2)^2) = -3240x^4$\n\n$240a - 3240 = -2040 \\Rightarrow 240a = 1200 \\Rightarrow a = 5$ 입니다.',
    A: '5'
  },
  {
    id: '029',
    P: '다항식 $(x-2)^3(2x+1)^5$의 전개식에서 $x^2$의 계수를 구합니다.',
    C: '$(x-2)^3$을 전개한 후, 각 항과 $(2x+1)^5$의 일반항의 곱을 통해 $x^2$이 되는 모든 경우를 더합니다.',
    B: '$(x-2)^3 = x^3 - 6x^2 + 12x - 8$',
    S: '$(2x+1)^5$의 일반항 $B_r = {}_5\\mathrm{C}_r (2x)^r$\n\n1) $-6x^2 \\cdot B_0 = -6 \\cdot 1 = -6$\n2) $12x \\cdot B_1 = 12 \\cdot (5 \\cdot 2) = 120$\n3) $-8 \\cdot B_2 = -8 \\cdot (10 \\cdot 4) = -320$\n\n따라서 계수는 $-6 + 120 - 320 = -206$ 입니다.',
    A: '-206'
  },
  {
    id: '030',
    P: '다항식 $4(x+a)^n$과 $(x-1)(x+a)^n$의 $x^{n-1}$ 계수가 같을 때, $a$의 최댓값을 구합니다.',
    C: '각 식의 $x^{n-1}$ 계수를 $n$과 $a$에 대한 식으로 나타내어 방정식을 풉니다.',
    B: '$(x+a)^n$ 일반항: ${}_n\\mathrm{C}_r x^r a^{n-r}$',
    S: '1) $4(x+a)^n$ 계수: $4 \\cdot ({}_n\\mathrm{C}_{n-1} a^1) = 4na$\n2) $(x-1)(x+a)^n$ 계수: $1 \\cdot ({}_n\\mathrm{C}_{n-2} a^2) - 1 \\cdot ({}_n\\mathrm{C}_{n-1} a^1) = \\frac{n(n-1)}{2} a^2 - na$\n\n$4na = \\frac{n(n-1)}{2} a^2 - na \\Rightarrow 5 = \\frac{n-1}{2} a \\Rightarrow a = \\frac{10}{n-1}$\n\n$n$이 최소인 2일 때 $a$는 최대 10을 가집니다.',
    A: '10'
  }
];

data.forEach(d => {
  const content = { unit: '3)이항정리', id: d.id, type: 'algebra', P: d.P, C: d.C, B: d.B, S: d.S, A: d.A };
  fs.writeFileSync(path.join(dir, d.id + '.json'), JSON.stringify(content, null, 2), 'utf8');
});

console.log('Batch 026-030 done.');
