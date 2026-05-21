const fs = require('fs');
const path = require('path');

const dir = 'C:/mentos_os_clean/public/math_hints/확통수능/3)이항정리/';
const data = [
  {
    id: '006',
    P: '다항식 $(1+x)^{10}$의 전개식에서 $x^4$의 계수를 구합니다.',
    C: '이항정리의 일반항 공식을 적용합니다.',
    B: '일반항: ${}_n\\mathrm{C}_r a^{n-r} b^r$',
    S: '$(1+x)^{10}$의 전개식의 일반항은\n\n$${}_{10}\\mathrm{C}_r (1)^{10-r} x^r = {}_{10}\\mathrm{C}_r x^r$$\n\n$x^4$의 항은 $r=4$일 때이므로 계수는\n\n$${}_{10}\\mathrm{C}_4 = \\frac{10 \\cdot 9 \\cdot 8 \\cdot 7}{4 \\cdot 3 \\cdot 2 \\cdot 1} = 210$$',
    A: '210'
  },
  {
    id: '007',
    P: '다항식 $(2x^3+x^2)^5$의 전개식에서 $x^{12}$의 계수를 구합니다.',
    C: '각 항의 지수 법칙을 이용하여 $x^{12}$가 되는 일반항의 $r$을 찾습니다.',
    B: '일반항: ${}_n\\mathrm{C}_r a^r b^{n-r}$',
    S: '$(2x^3+x^2)^5$의 전개식의 일반항은\n\n$${}_5\\mathrm{C}_r (2x^3)^r (x^2)^{5-r} = {}_5\\mathrm{C}_r \\cdot 2^r \\cdot x^{3r} \\cdot x^{10-2r} = {}_5\\mathrm{C}_r \\cdot 2^r \\cdot x^{r+10}$$\n\n$x^{12}$의 항은 $r+10=12$, 즉 $r=2$일 때이므로 계수는\n\n$${}_5\\mathrm{C}_2 \\cdot 2^2 = 10 \\cdot 4 = 40$$',
    A: '40'
  },
  {
    id: '008',
    P: '다항식 $(x^2+2)^6$의 전개식에서 $x^8$의 계수를 구합니다.',
    C: '이항정리의 일반항 공식을 적용합니다.',
    B: '일반항: ${}_n\\mathrm{C}_r (x^2)^r (2)^{6-r}$',
    S: '$(x^2+2)^6$의 전개식의 일반항은\n\n$${}_6\\mathrm{C}_r (x^2)^r (2)^{6-r} = {}_6\\mathrm{C}_r \\cdot 2^{6-r} \\cdot x^{2r}$$\n\n$x^8$의 항은 $2r=8$, 즉 $r=4$일 때이므로 계수는\n\n$${}_6\\mathrm{C}_4 \\cdot 2^{6-4} = 15 \\cdot 2^2 = 15 \\cdot 4 = 60$$',
    A: '60'
  },
  {
    id: '009',
    P: '다항식 $(3x^2+1)^4$의 전개식에서 $x^4$의 계수를 구합니다.',
    C: '이항정리의 일반항 공식을 적용합니다.',
    B: '일반항: ${}_n\\mathrm{C}_r (3x^2)^r (1)^{4-r}$',
    S: '$(3x^2+1)^4$의 전개식의 일반항은\n\n$${}_4\\mathrm{C}_r (3x^2)^r (1)^{4-r} = {}_4\\mathrm{C}_r \\cdot 3^r \\cdot x^{2r}$$\n\n$x^4$의 항은 $2r=4$, 즉 $r=2$일 때이므로 계수는\n\n$${}_4\\mathrm{C}_2 \\cdot 3^2 = 6 \\cdot 9 = 54$$',
    A: '54'
  },
  {
    id: '010',
    P: '다항식 $(x^2-2)^5$의 전개식에서 $x^6$의 계수를 구합니다.',
    C: '이항정리의 일반항 공식을 적용합니다.',
    B: '일반항: ${}_n\\mathrm{C}_r (x^2)^r (-2)^{5-r}$',
    S: '$(x^2-2)^5$의 전개식의 일반항은\n\n$${}_5\\mathrm{C}_r (x^2)^r (-2)^{5-r} = {}_5\\mathrm{C}_r \\cdot (-2)^{5-r} \\cdot x^{2r}$$\n\n$x^6$의 항은 $2r=6$, 즉 $r=3$일 때이므로 계수는\n\n$${}_5\\mathrm{C}_3 \\cdot (-2)^{5-3} = 10 \\cdot (-2)^2 = 10 \\cdot 4 = 40$$',
    A: '40'
  }
];

data.forEach(d => {
  const content = { unit: '3)이항정리', id: d.id, type: 'algebra', P: d.P, C: d.C, B: d.B, S: d.S, A: d.A };
  fs.writeFileSync(path.join(dir, d.id + '.json'), JSON.stringify(content, null, 2), 'utf8');
});

console.log('Batch 006-010 done.');
