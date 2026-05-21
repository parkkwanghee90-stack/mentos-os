const fs = require('fs');
const path = require('path');

const dir = 'C:/mentos_os_clean/public/math_hints/확통수능/3)이항정리/';
const data = [
  {
    id: '031',
    P: '다항식 $(x-y+1)^{n+2}$의 전개식에서 $x^ny^2$의 계수를 $f(n)$이라 할 때, 주어진 급수의 합을 구합니다.',
    C: '다항정리를 이용하여 $f(n)$을 $n$에 관한 식으로 나타낸 후 부분분수로 변형하여 합을 구합니다.',
    B: '일반항: $\\frac{(n+2)!}{a!b!c!}x^a(-y)^b 1^c$ (단, $a+b+c=n+2$)',
    S: '$x^ny^2$ 항은 $a=n, b=2, c=0$일 때이므로 $f(n) = \\frac{(n+2)!}{n!2!0!}(-1)^2 = \\frac{(n+2)(n+1)}{2}$ 입니다.\n\n$$\\frac{1}{f(n)} = \\frac{2}{(n+1)(n+2)} = 2(\\frac{1}{n+1} - \\frac{1}{n+2})$$\n\n급수의 합은 $2(\\frac{1}{2} - \\frac{1}{2022}) = \\frac{1010}{1011}$ 이므로 $a=1010, b=1011$ 입니다. 따라서 $a+b = 2021$ 입니다.',
    A: '2021'
  },
  {
    id: '032',
    P: '자연수 $n$에 대하여 $f(n) = \\sum_{k=1}^n {}_{2n+1}\\mathrm{C}_{2k} = 1023$을 만족하는 $n$을 구합니다.',
    C: '이항계수의 성질인 $\\sum {}_{m}\\mathrm{C}_{2k} = 2^{m-1}$을 이용합니다.',
    B: '${}_{2n+1}\\mathrm{C}_0 + {}_{2n+1}\\mathrm{C}_2 + \\dots + {}_{2n+1}\\mathrm{C}_{2n} = 2^{(2n+1)-1} = 2^{2n}$',
    S: '$f(n)$은 위 공식에서 ${}_{2n+1}\\mathrm{C}_0=1$이 제외된 값이므로 $f(n) = 2^{2n} - 1 = 1023$ 입니다.\n\n$$2^{2n} = 1024 = 2^{10} \\Rightarrow n = 5$$ 입니다.',
    A: '5'
  },
  {
    id: '033',
    P: '${}_3\\mathrm{C}_3 + {}_4\\mathrm{C}_3 + {}_5\\mathrm{C}_3 + \\dots + {}_{10}\\mathrm{C}_3$의 값과 같은 것을 찾습니다.',
    C: '파스칼의 삼각형 성질인 하키스틱 패턴을 이용합니다.',
    B: '하키스틱 공식: $\\sum_{i=k}^n {}_i\\mathrm{C}_k = {}_{n+1}\\mathrm{C}_{k+1}$',
    S: '주어진 식에 공식을 적용하면 $k=3, n=10$ 이므로\n\n$${}_3\\mathrm{C}_3 + {}_4\\mathrm{C}_3 + \\dots + {}_{10}\\mathrm{C}_3 = {}_{10+1}\\mathrm{C}_{3+1} = {}_{11}\\mathrm{C}_4$$ 입니다.',
    A: '11C4'
  },
  {
    id: '034',
    P: '주어진 등식 $({}_n\\mathrm{C}_0)^2 + ({}_n\\mathrm{C}_1)^2 + \\dots + ({}_n\\mathrm{C}_n)^2 = {}_{200}\\mathrm{C}_{100}$을 만족하는 $n$을 구합니다.',
    C: '이항계수의 제곱의 합 공식(방데르몽드 항등식의 특수형태)을 이용합니다.',
    B: '$\\sum_{k=0}^n ({}_n\\mathrm{C}_k)^2 = {}_{2n}\\mathrm{C}_n$',
    S: '주어진 좌변은 공식에 의해 ${}_{2n}\\mathrm{C}_n$ 입니다. 우변이 ${}_{200}\\mathrm{C}_{100}$ 이므로\n\n$$2n = 200 \\Rightarrow n = 100$$ 입니다.',
    A: '100'
  },
  {
    id: '035',
    P: '$10$ 이하의 자연수 $n$ 중에서 ${}_n\\mathrm{C}_1 + {}_n\\mathrm{C}_2 + \\dots + {}_n\\mathrm{C}_n$이 7의 배수가 되는 모든 $n$의 합을 구합니다.',
    C: '이항계수의 총합 성질을 이용하여 $n$의 조건을 찾습니다.',
    B: '$\\sum_{k=0}^n {}_n\\mathrm{C}_k = 2^n \\Rightarrow \\sum_{k=1}^n {}_n\\mathrm{C}_k = 2^n - 1$',
    S: '$2^n - 1$이 7의 배수가 되려면 $2^n \\equiv 1 \\pmod 7$ 이어야 합니다.\n\n$2^1=2, 2^2=4, 2^3=8 \\equiv 1$ 이므로 $n$은 3의 배수입니다.\n\n$1 \\le n \\le 10$ 중 3의 배수는 $3, 6, 9$ 이며 그 합은 $3+6+9=18$ 입니다.',
    A: '18'
  },
  {
    id: '036',
    P: '이항계수 부등식 증명 과정의 빈칸을 채우고 함숫값을 계산합니다.',
    C: '이항계수의 총합 성질과 조합의 정의를 이용하여 (가), (나)를 찾습니다.',
    B: '(가)는 전개식의 전체 합, (나)는 조합의 첫 번째 항 비율',
    S: '1) ${}_{2n}\\mathrm{C}_n < \\sum_{k=0}^{2n} {}_{2n}\\mathrm{C}_k = 2^{2n} = 4^n$ 이므로 $f(n) = 4^n$ 입니다.\n2) ${}_{2n}\\mathrm{C}_n = \\frac{2n}{n} \\cdot \\frac{2n-1}{n-1} \\dots \\frac{n+1}{1}$ 이므로 $a = \\frac{2n}{n} = 2$ 입니다.\n\n따라서 $f(a) = f(2) = 4^2 = 16$ 입니다.',
    A: '16'
  }
];

data.forEach(d => {
  const content = { unit: '3)이항정리', id: d.id, type: 'algebra', P: d.P, C: d.C, B: d.B, S: d.S, A: d.A };
  fs.writeFileSync(path.join(dir, d.id + '.json'), JSON.stringify(content, null, 2), 'utf8');
});

console.log('Batch 031-036 done. Unit 3)이항정리 Finished.');
