const fs = require('fs');
const path = require('path');

const dir = 'C:/mentos_os_clean/public/math_hints/확통수능/3)이항정리/';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const data = [
  {
    id: '002',
    P: '다항식 $(2x-1)^5$의 전개식에서 $x^3$의 계수를 구합니다.',
    C: '이항정리의 일반항 공식을 적용합니다.',
    B: '일반항: ${}_n\\mathrm{C}_r a^{n-r} b^r$',
    S: '$(2x-1)^5$의 전개식의 일반항은\n\n$${}_5\\mathrm{C}_r (2x)^r (-1)^{5-r} = {}_5\\mathrm{C}_r \\cdot 2^r \\cdot (-1)^{5-r} \\cdot x^r$$\n\n$x^3$의 항은 $r=3$일 때이므로\n\n$${}_5\\mathrm{C}_3 \\cdot 2^3 \\cdot (-1)^{5-3} = 10 \\cdot 8 \\cdot (-1)^2 = 80$$',
    A: '80'
  },
  {
    id: '003',
    P: '다항식 $(x+y)^8$의 전개식에서 $x^4y^4$의 계수를 구합니다.',
    C: '이항정리의 일반항 공식을 적용합니다.',
    B: '일반항: ${}_n\\mathrm{C}_r x^r y^{n-r}$',
    S: '$(x+y)^8$의 전개식의 일반항은\n\n$${}_8\\mathrm{C}_r x^r y^{8-r}$$\n\n$x^4y^4$의 항은 $r=4$일 때이므로 계수는\n\n$${}_8\\mathrm{C}_4 = \\frac{8 \\cdot 7 \\cdot 6 \\cdot 5}{4 \\cdot 3 \\cdot 2 \\cdot 1} = 70$$',
    A: '70'
  },
  {
    id: '004',
    P: '다항식 $(4x+1)^6$의 전개식에서 $x$의 계수를 구합니다.',
    C: '이항정리의 일반항 공식을 적용합니다.',
    B: '일반항: ${}_n\\mathrm{C}_r a^{n-r} b^r$',
    S: '$(4x+1)^6$의 전개식의 일반항은\n\n$${}_6\\mathrm{C}_r (4x)^r (1)^{6-r} = {}_6\\mathrm{C}_r \\cdot 4^r \\cdot x^r$$\n\n$x$의 항은 $r=1$일 때이므로 계수는\n\n$${}_6\\mathrm{C}_1 \\cdot 4^1 = 6 \\cdot 4 = 24$$',
    A: '24'
  },
  {
    id: '005',
    P: '다항식 $(2x+y)^5$의 전개식에서 $x^2y^3$의 계수를 구합니다.',
    C: '이항정리의 일반항 공식을 적용합니다.',
    B: '일반항: ${}_n\\mathrm{C}_r a^{n-r} b^r$',
    S: '$(2x+y)^5$의 전개식의 일반항은\n\n$${}_5\\mathrm{C}_r (2x)^r y^{5-r} = {}_5\\mathrm{C}_r \\cdot 2^r \\cdot x^r y^{5-r}$$\n\n$x^2y^3$의 항은 $r=3$일 때이므로 (y의 지수가 3)\n\n$${}_5\\mathrm{C}_3 \\cdot 2^2 = 10 \\cdot 4 = 40$$',
    A: '40'
  }
];

data.forEach(d => {
  const content = { unit: '3)이항정리', id: d.id, type: 'algebra', P: d.P, C: d.C, B: d.B, S: d.S, A: d.A };
  fs.writeFileSync(path.join(dir, d.id + '.json'), JSON.stringify(content, null, 2), 'utf8');
});

console.log('Batch 002-005 done.');
