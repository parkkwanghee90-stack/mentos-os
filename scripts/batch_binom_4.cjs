const fs = require('fs');
const path = require('path');

const dir = 'C:/mentos_os_clean/public/math_hints/확통수능/3)이항정리/';
const data = [
  {
    id: '016',
    P: '다항식 $(x^3 + \\frac{2}{x^2})^5$의 전개식에서 상수항을 구합니다.',
    C: '일반항의 지수가 0이 되는 $r$을 찾습니다.',
    B: '일반항: ${}_n\\mathrm{C}_r a^r b^{n-r}$',
    S: '$(x^3 + \\frac{2}{x^2})^5$의 전개식의 일반항은\n\n$${}_5\\mathrm{C}_r (x^3)^r (2x^{-2})^{5-r} = {}_5\\mathrm{C}_r \\cdot 2^{5-r} \\cdot x^{5r-10}$$\n\n상수항은 $5r-10=0$, 즉 $r=2$일 때이므로 계수는\n\n$${}_5\\mathrm{C}_2 \\cdot 2^{5-2} = 10 \\cdot 2^3 = 80$$',
    A: '80'
  },
  {
    id: '017',
    P: '다항식 $(x^3 - \\frac{4}{x})^6$의 전개식에서 $x^6$의 계수를 구합니다.',
    C: '일반항의 지수가 6이 되는 $r$을 찾습니다.',
    B: '일반항: ${}_n\\mathrm{C}_r a^r b^{n-r}$',
    S: '$(x^3 - \\frac{4}{x})^6$의 전개식의 일반항은\n\n$${}_6\\mathrm{C}_r (x^3)^r (-4x^{-1})^{6-r} = {}_6\\mathrm{C}_r \\cdot (-4)^{6-r} \\cdot x^{4r-6}$$\n\n$x^6$의 항은 $4r-6=6$, 즉 $r=3$일 때이므로 계수는\n\n$${}_6\\mathrm{C}_3 \\cdot (-4)^{6-3} = 20 \\cdot (-64) = -1280$$',
    A: '-1280'
  },
  {
    id: '018',
    P: '다항식 $(x^2 - \\frac{1}{x})^5$의 전개식에서 $x^4$의 계수를 구합니다.',
    C: '일반항의 지수가 4가 되는 $r$을 찾습니다.',
    B: '일반항: ${}_n\\mathrm{C}_r a^r b^{n-r}$',
    S: '$(x^2 - \\frac{1}{x})^5$의 전개식의 일반항은\n\n$${}_5\\mathrm{C}_r (x^2)^r (-x^{-1})^{5-r} = {}_5\\mathrm{C}_r \\cdot (-1)^{5-r} \\cdot x^{3r-5}$$\n\n$x^4$의 항은 $3r-5=4$, 즉 $r=3$일 때이므로 계수는\n\n$${}_5\\mathrm{C}_3 \\cdot (-1)^{5-3} = 10 \\cdot (-1)^2 = 10$$',
    A: '10'
  },
  {
    id: '019',
    P: '다항식 $(1-2x)^4(x+3)$의 전개식에서 $x^2$의 계수를 구합니다.',
    C: '두 식의 곱에서 $x^2$이 나올 수 있는 모든 조합을 생각합니다.',
    B: '분배법칙: $x \\times (x^1 \\text{항}) + 3 \\times (x^2 \\text{항})$',
    S: '$(1-2x)^4$의 일반항 $A_r = {}_4\\mathrm{C}_r (-2x)^r$ 입니다.\n\n1) $x \\times (A_1) = x \\cdot ({}_4\\mathrm{C}_1 (-2x)^1) = -8x^2$\n2) $3 \\times (A_2) = 3 \\cdot ({}_4\\mathrm{C}_2 (-2x)^2) = 3 \\cdot 6 \\cdot 4x^2 = 72x^2$\n\n따라서 $x^2$의 계수는\n\n$$-8 + 72 = 64$$',
    A: '64'
  },
  {
    id: '020',
    P: '다항식 $(x+3)^n$의 전개식에서 상수항이 81일 때, $x$의 계수를 구합니다.',
    C: '상수항을 이용하여 $n$의 값을 먼저 구합니다.',
    B: '상수항은 $x=0$을 대입한 값과 같습니다.',
    S: '$(x+3)^n$에서 상수항은 $3^n = 81$ 이므로 $n=4$ 입니다.\n\n이제 $(x+3)^4$에서 $x$의 계수는 일반항 ${}_4\\mathrm{C}_r x^r 3^{4-r}$에서 $r=1$일 때이므로\n\n$${}_4\\mathrm{C}_1 \\cdot 3^{4-1} = 4 \\cdot 27 = 108$$',
    A: '108'
  }
];

data.forEach(d => {
  const content = { unit: '3)이항정리', id: d.id, type: 'algebra', P: d.P, C: d.C, B: d.B, S: d.S, A: d.A };
  fs.writeFileSync(path.join(dir, d.id + '.json'), JSON.stringify(content, null, 2), 'utf8');
});

console.log('Batch 016-020 done.');
