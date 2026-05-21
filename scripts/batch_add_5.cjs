const fs = require('fs');
const path = require('path');

const dir = 'C:/mentos_os_clean/public/math_hints/확통수능/5)덧셈정리_조건부화률_독립시행/';
const data = [
  {
    id: '041',
    P: '$P(A|B)=1/4, P(B)=4/9$일 때, $P(A \\cap B)$의 값을 구합니다.',
    C: '조건부 확률의 정의 $P(A|B) = P(A \\cap B) / P(B)$를 이용합니다.',
    B: '$P(A \\cap B) = P(A|B) \\times P(B)$',
    S: '$P(A \\cap B) = 1/4 \\times 4/9 = 1/9$ 입니다.',
    A: '1/9'
  },
  {
    id: '042',
    P: '$P(A \\cup B)=4/5, P(B)=2/5, P(A|B)=1/2$일 때, $P(B|A)$를 구합니다.',
    C: '$P(A \\cap B)$를 먼저 구한 뒤 $P(A)$를 찾아 조건부 확률을 계산합니다.',
    B: '$P(B|A) = P(A \\cap B) / P(A)$',
    S: '$P(A \\cap B) = P(A|B) \\times P(B) = 1/2 \\times 2/5 = 1/5$ 입니다.\n$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ 에서 $4/5 = P(A) + 2/5 - 1/5$ 이므로 $P(A) = 3/5$ 입니다.\n따라서 $P(B|A) = (1/5) / (3/5) = 1/3$ 입니다.',
    A: '1/3'
  },
  {
    id: '043',
    P: '$P(A \\cup B)=4/9, P(A|B)=1/4, P(B|A)=1/6$일 때, $P(A \\cap B)$를 구합니다.',
    C: '$P(A \\cap B)$를 매개로 $P(A), P(B)$ 사이의 관계를 파악합니다.',
    B: '$P(A \\cap B) = P(A|B)P(B) = P(B|A)P(A)$',
    S: '$1/4 P(B) = 1/6 P(A)$ 에서 $P(A) = \\frac{3}{2}P(B)$ 입니다.\n$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ 에서\n$4/9 = \\frac{3}{2}P(B) + P(B) - \\frac{1}{4}P(B) = \\frac{9}{4}P(B)$ 입니다.\n$P(B) = 16/81$ 이므로 $P(A \\cap B) = 1/4 \\times 16/81 = 4/81$ 입니다.',
    A: '4/81'
  },
  {
    id: '044',
    P: '$P(A|B)=1/5, P(B|A)=1/4, P(A \\cup B)=8/9$일 때, $P(A \\cap B)$를 구합니다.',
    C: '$P(A \\cap B) = k$라 두고 모든 확률을 $k$에 대한 식으로 표현합니다.',
    B: '$P(A)=4k, P(B)=5k$',
    S: '$P(A \\cap B) = k$라 하면 $P(A) = 4k, P(B) = 5k$ 입니다.\n$P(A \\cup B) = 4k + 5k - k = 8k$ 입니다.\n$8k = 8/9$ 이므로 $k = 1/9$ 입니다.\n따라서 $P(A \\cap B) = 1/9$ 입니다.',
    A: '1/9'
  },
  {
    id: '045',
    P: '$P(A)=0.4, P(B)=0.3, P(B|A)=0.5$일 때, $P(A|B)$를 구합니다.',
    C: '조건부 확률의 정의를 순차적으로 적용합니다.',
    B: '$P(A \\cap B) = P(B|A)P(A)$',
    S: '$P(A \\cap B) = 0.5 \\times 0.4 = 0.2$ 입니다.\n$P(A|B) = P(A \\cap B) / P(B) = 0.2 / 0.3 = 2/3$ 입니다.',
    A: '2/3'
  },
  {
    id: '046',
    P: '$P(A \\cup B)=5/8, P(B)=1/4$일 때, $P(A|B^c)$를 구합니다.',
    C: '여사건의 확률과 차집합의 확률 관계를 이용합니다.',
    B: '$P(A|B^c) = P(A \\cap B^c) / P(B^c)$',
    S: '$P(B^c) = 1 - 1/4 = 3/4$ 입니다.\n$P(A \\cap B^c) = P(A \\setminus B) = P(A \\cup B) - P(B) = 5/8 - 2/8 = 3/8$ 입니다.\n따라서 $P(A|B^c) = (3/8) / (3/4) = 1/2$ 입니다.',
    A: '1/2'
  },
  {
    id: '047',
    P: '$P(A)=2/3, P(B|A)=2/5$일 때, $P(A \\cap B^c)$를 구합니다.',
    C: '교집합의 확률을 먼저 구한 뒤 차집합의 확률을 계산합니다.',
    B: '$P(A \\cap B^c) = P(A) - P(A \\cap B)$',
    S: '$P(A \\cap B) = P(B|A) \\times P(A) = 2/5 \\times 2/3 = 4/15$ 입니다.\n따라서 $P(A \\cap B^c) = 2/3 - 4/15 = 10/15 - 4/15 = 6/15 = 2/5$ 입니다.',
    A: '2/5'
  },
  {
    id: '048',
    P: '$P(A)=1/4, P(B^c)=2/3, P(A^c|B)=3/4$일 때, $P(A \\cup B)$를 구합니다.',
    C: '$P(A|B)$를 통해 $P(A \\cap B)$를 찾습니다.',
    B: '$P(A|B) = 1 - P(A^c|B)$',
    S: '$P(B) = 1 - 2/3 = 1/3$ 입니다.\n$P(A|B) = 1 - 3/4 = 1/4$ 이므로 $P(A \\cap B) = 1/4 \\times 1/3 = 1/12$ 입니다.\n$P(A \\cup B) = 1/4 + 1/3 - 1/12 = 6/12 = 1/2$ 입니다.',
    A: '1/2'
  },
  {
    id: '049',
    P: '$P(A)=1/2, P(B|A)=1/4$이고 대칭차의 확률이 $5/8$일 때, $P(A|B)$를 구합니다.',
    C: '대칭차의 확률로부터 $P(A \\cup B)$를 찾고 $P(B)$를 도출합니다.',
    B: '$P((A \\cap B^c) \\cup (B \\cap A^c)) = P(A \\cup B) - P(A \\cap B)$',
    S: '$P(A \\cap B) = 1/4 \\times 1/2 = 1/8$ 입니다.\n$P(A \\cup B) = 5/8 + 1/8 = 3/4$ 입니다.\n$3/4 = 1/2 + P(B) - 1/8$ 에서 $P(B) = 3/8$ 입니다.\n따라서 $P(A|B) = (1/8) / (3/8) = 1/3$ 입니다.',
    A: '1/3'
  },
  {
    id: '050',
    P: '$P(A \\cup B)=8/15, P(B^c|A^c)=7/9$일 때, $P(A)$의 값을 구합니다.',
    C: '조건부 확률과 드 모르간의 법칙을 결합합니다.',
    B: '$P(B^c|A^c) = P(A^c \\cap B^c) / P(A^c)$',
    S: '$P(A^c \\cap B^c) = 1 - P(A \\cup B) = 7/15$ 입니다.\n$7/9 = (7/15) / P(A^c)$ 에서 $P(A^c) = 9/15 = 3/5$ 입니다.\n따라서 $P(A) = 1 - 3/5 = 2/5$ 입니다.',
    A: '2/5'
  }
];

data.forEach(d => {
  const content = { unit: '5)덧셈정리_조건부화률_독립시행', id: d.id, type: 'algebra', P: d.P, C: d.C, B: d.B, S: d.S, A: d.A };
  fs.writeFileSync(path.join(dir, d.id + '.json'), JSON.stringify(content, null, 2), 'utf8');
});

console.log('Batch 041-050 of 5)덧셈정리_조건부화률_독립시행 done.');
