const fs = require('fs');
const path = require('path');

const dir = 'C:/mentos_os_clean/public/math_hints/확통수능/3)이항정리/';
const data = [
  {
    id: '011',
    P: '다항식 $(2x + \\frac{1}{4x})^8$의 전개식에서 $x^4$의 계수를 구합니다.',
    C: '이항정리의 일반항 공식에 대입하여 $x^4$이 되는 항을 찾습니다.',
    B: '일반항: ${}_n\\mathrm{C}_r a^r b^{n-r}$',
    S: '$(2x + \\frac{1}{4x})^8$의 전개식의 일반항은\n\n$${}_8\\mathrm{C}_r (2x)^r (\\frac{1}{4x})^{8-r} = {}_8\\mathrm{C}_r \\cdot 2^r \\cdot 4^{-(8-r)} \\cdot x^r \\cdot x^{-(8-r)}$$\n\n$${}_8\\mathrm{C}_r \\cdot 2^r \\cdot 2^{-2(8-r)} \\cdot x^{2r-8} = {}_8\\mathrm{C}_r \\cdot 2^{3r-16} \\cdot x^{2r-8}$$\n\n$x^4$의 항은 $2r-8=4$, 즉 $r=6$일 때이므로 계수는\n\n$${}_8\\mathrm{C}_6 \\cdot 2^{3(6)-16} = 28 \\cdot 2^2 = 28 \\cdot 4 = 112$$',
    A: '112'
  },
  {
    id: '012',
    P: '다항식 $(x + \\frac{1}{x})^6$의 전개식에서 상수항을 구합니다.',
    C: '일반항의 지수가 0이 되는 경우를 찾습니다.',
    B: '상수항은 $x^0$의 계수와 같습니다.',
    S: '$(x + \\frac{1}{x})^6$의 전개식의 일반항은\n\n$${}_6\\mathrm{C}_r x^r (\\frac{1}{x})^{6-r} = {}_6\\mathrm{C}_r x^r \\cdot x^{-(6-r)} = {}_6\\mathrm{C}_r x^{2r-6}$$\n\n상수항은 $2r-6=0$, 즉 $r=3$일 때이므로 계수는\n\n$${}_6\\mathrm{C}_3 = \\frac{6 \\cdot 5 \\cdot 4}{3 \\cdot 2 \\cdot 1} = 20$$',
    A: '20'
  },
  {
    id: '013',
    P: '다항식 $(1+x)(1-3x)^5$의 전개식에서 $x^3$의 계수를 구합니다.',
    C: '두 식의 곱에서 $x^3$이 나올 수 있는 모든 조합을 생각합니다.',
    B: '분배법칙: $1 \\times (x^3 \\text{항}) + x \\times (x^2 \\text{항})$',
    S: '$(1-3x)^5$의 전개식의 일반항을 $A_r$이라 하면 $A_r = {}_5\\mathrm{C}_r (-3x)^r$ 입니다.\n\n1) $1 \\times ({}_5\\mathrm{C}_3 (-3x)^3) = 1 \\cdot 10 \\cdot (-27)x^3 = -270x^3$\n2) $x \\times ({}_5\\mathrm{C}_2 (-3x)^2) = x \\cdot 10 \\cdot 9x^2 = 90x^3$\n\n따라서 $x^3$의 계수는\n\n$$-270 + 90 = -180$$',
    A: '-180'
  },
  {
    id: '014',
    P: '다항식 $(1+x^2)^4(1+x^3)^3$의 전개식에서 $x^8$의 계수를 구합니다.',
    C: '$(1+x^2)^4$와 $(1+x^3)^3$의 각각의 일반항의 지수 합이 8이 되는 순서쌍을 찾습니다.',
    B: '일반항 지수 합: $2a + 3b = 8$ (단, $0 \\le a \\le 4, 0 \\le b \\le 3$)',
    S: '1) $b=0 \\Rightarrow 2a=8 \\Rightarrow a=4$ 인 경우: ${}_4\\mathrm{C}_4 \\cdot {}_3\\mathrm{C}_0 = 1 \\cdot 1 = 1$\n2) $b=2 \\Rightarrow 2a=2 \\Rightarrow a=1$ 인 경우: ${}_4\\mathrm{C}_1 \\cdot {}_3\\mathrm{C}_2 = 4 \\cdot 3 = 12$\n\n따라서 $x^8$의 계수는 $1 + 12 = 13$ 입니다.',
    A: '13'
  },
  {
    id: '015',
    P: '다항식 $(x + \\frac{1}{x^3})^4$의 전개식에서 $\\frac{1}{x^4}$의 계수를 구합니다.',
    C: '$\\frac{1}{x^4} = x^{-4}$ 이므로 일반항의 지수가 -4가 되는 $r$을 찾습니다.',
    B: '일반항: ${}_n\\mathrm{C}_r a^r b^{n-r}$',
    S: '$(x + \\frac{1}{x^3})^4$의 전개식의 일반항은\n\n$${}_4\\mathrm{C}_r x^r (x^{-3})^{4-r} = {}_4\\mathrm{C}_r x^{4r-12}$$\n\n지수 $4r-12 = -4$ 에서 $4r=8$, 즉 $r=2$일 때입니다.\n\n따라서 $\\frac{1}{x^4}$의 계수는\n\n$${}_4\\mathrm{C}_2 = 6$$',
    A: '6'
  }
];

data.forEach(d => {
  const content = { unit: '3)이항정리', id: d.id, type: 'algebra', P: d.P, C: d.C, B: d.B, S: d.S, A: d.A };
  fs.writeFileSync(path.join(dir, d.id + '.json'), JSON.stringify(content, null, 2), 'utf8');
});

console.log('Batch 011-015 done.');
