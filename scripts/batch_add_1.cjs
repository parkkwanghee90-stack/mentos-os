const fs = require('fs');
const path = require('path');

const dir = 'C:/mentos_os_clean/public/math_hints/확통수능/5)덧셈정리_조건부화률_독립시행/';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const data = [
  {
    id: '001',
    P: '두 사건 $A, B$에 대하여 $P(A^c)=1/4, P(A \\cap B)=1/6$일 때, $P(A^c \\cup B)$의 값을 구합니다.',
    C: '집합의 성질 $A^c \\cup B = A^c \\cup (A \\cap B)$를 이용합니다.',
    B: '$P(A^c \\cup B) = P(A^c) + P(B) - P(A^c \\cap B)$',
    S: '$P(A^c \\cup B) = P(A^c \\cup (A \\cap B))$ 이고 $A^c$와 $A \\cap B$는 서로 배반사건입니다.\n따라서 $P(A^c \\cup B) = P(A^c) + P(A \\cap B) = 1/4 + 1/6 = 3/12 + 2/12 = 5/12$ 입니다.',
    A: '5/12'
  },
  {
    id: '002',
    P: '두 사건 $A, B$에 대하여 $P(A)=7/12, P(A \\cap B^c)=1/6$일 때, $P(A \\cap B)$의 값을 구합니다.',
    C: '사건 $A$를 $B$와의 관계에 따라 분할합니다.',
    B: '$P(A) = P(A \\cap B) + P(A \\cap B^c)$',
    S: '$P(A \\cap B) = P(A) - P(A \\cap B^c) = 7/12 - 1/6 = 7/12 - 2/12 = 5/12$ 입니다.',
    A: '5/12'
  },
  {
    id: '003',
    P: '서로 배반인 두 사건 $A, B$에 대하여 $P(A)=1/6, P(B)=2/3$일 때, $P(A^c \\cap B)$의 값을 구합니다.',
    C: '배반사건의 정의($A \\cap B = \\emptyset$)를 이용합니다.',
    B: '$A \\cap B = \\emptyset \\Rightarrow B \\subset A^c \\Rightarrow A^c \\cap B = B$',
    S: '$A, B$가 서로 배반사건이므로 $A \\cap B = \\emptyset$ 입니다.\n따라서 $P(A^c \\cap B) = P(B \\setminus A) = P(B) = 2/3$ 입니다.',
    A: '2/3'
  },
  {
    id: '004',
    P: '두 사건 $A, B$에 대하여 $P(A)=1/4, P(B)=1/3, P(A \\cap B)=1/6$일 때, $P(A^c \\cap B^c)$의 값을 구합니다.',
    C: '드 모르간의 법칙을 이용하여 여사건의 확률로 변환합니다.',
    B: '$P(A^c \\cap B^c) = P((A \\cup B)^c) = 1 - P(A \\cup B)$',
    S: '$P(A \\cup B) = P(A) + P(B) - P(A \\cap B) = 1/4 + 1/3 - 1/6 = 5/12$ 입니다.\n따라서 $P(A^c \\cap B^c) = 1 - 5/12 = 7/12$ 입니다.',
    A: '7/12'
  },
  {
    id: '005',
    P: '두 사건 $A, B$에 대하여 $P(A^c)=1/4, P(A \\cap B^c)=2/5$일 때, $P(A \\cap B)$의 값을 구합니다.',
    C: '$P(A)$를 먼저 구한 뒤 차집합의 확률 관계를 이용합니다.',
    B: '$P(A) = 1 - P(A^c)$ 이고 $P(A) = P(A \\cap B) + P(A \\cap B^c)$ 입니다.',
    S: '$P(A) = 1 - 1/4 = 3/4$ 입니다.\n$P(A \\cap B) = P(A) - P(A \\cap B^c) = 3/4 - 2/5 = 15/20 - 8/20 = 7/20$ 입니다.',
    A: '7/20'
  },
  {
    id: '006',
    P: '두 사건 $A, B$에 대하여 $A^c$와 $B$가 서로 배반사건이고 $P(A)=2/3, P(A \\cap B^c)=3/8$일 때, $P(B)$의 값을 구합니다.',
    C: '$A^c \\cap B = \\emptyset$ 이면 $B \\subset A$ 임을 이용합니다.',
    B: '$B \\subset A \\Rightarrow P(B) = P(A \\cap B)$',
    S: '$A^c$와 $B$가 배반사건이므로 $B \\subset A$ 입니다.\n$P(A) = P(A \\cap B) + P(A \\cap B^c)$ 에서\n$P(A \\cap B) = 2/3 - 3/8 = 16/24 - 9/24 = 7/24$ 입니다.\n따라서 $P(B) = P(A \\cap B) = 7/24$ 입니다.',
    A: '7/24'
  },
  {
    id: '007',
    P: '두 사건 $A, B$에 대하여 $P(A)=2/3, P(B^c)=3/4, P(A \\cap B)=1/6$일 때, $P(A^c \\cap B^c)$의 값을 구합니다.',
    C: '드 모르간의 법칙과 합집합의 확률을 이용합니다.',
    B: '$P(A^c \\cap B^c) = 1 - P(A \\cup B)$',
    S: '$P(B) = 1 - 3/4 = 1/4$ 입니다.\n$P(A \\cup B) = P(A) + P(B) - P(A \\cap B) = 2/3 + 1/4 - 1/6 = 9/12 = 3/4$ 입니다.\n따라서 $P(A^c \\cap B^c) = 1 - 3/4 = 1/4$ 입니다.',
    A: '1/4'
  },
  {
    id: '008',
    P: '두 사건 $A, B$에 대하여 $P(A)=P(B^c), P(A \\cap B)=1/6$일 때, $P(A \\cup B)$의 값을 구합니다.',
    C: '$P(A)=P(B^c)$ 로부터 $P(A)+P(B)=1$ 임을 도출합니다.',
    B: '$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$',
    S: '$P(A) = 1 - P(B)$ 이므로 $P(A) + P(B) = 1$ 입니다.\n따라서 $P(A \\cup B) = 1 - 1/6 = 5/6$ 입니다.',
    A: '5/6'
  },
  {
    id: '009',
    P: '$P(A \\cap B) = \\frac{3}{4}P(A) = \\frac{1}{7}P(B)$ 일 때, $\\frac{P(A \\cap B)}{P(A \\cup B)}$의 값을 구합니다.',
    C: '모든 확률을 $P(A \\cap B)$에 대한 식으로 나타냅니다.',
    B: '$P(A) = \\frac{4}{3}P(A \\cap B), P(B) = 7P(A \\cap B)$',
    S: '$P(A \\cap B) = k$라 하면 $P(A) = \\frac{4}{3}k, P(B) = 7k$ 입니다.\n$P(A \\cup B) = \\frac{4}{3}k + 7k - k = \\frac{22}{3}k$ 입니다.\n따라서 구하는 값은 $k / (\\frac{22}{3}k) = 3/22$ 입니다.',
    A: '3/22'
  },
  {
    id: '010',
    P: '$A^c, B$가 서로 배반사건이고 $P(A)=3P(B)=2/5$일 때, $P(A \\cap B^c)$의 값을 구합니다.',
    C: '$B \\subset A$ 인 관계를 파악합니다.',
    B: '$P(A \\cap B^c) = P(A) - P(A \\cap B)$',
    S: '$A^c \\cap B = \\emptyset$ 이므로 $B \\subset A$ 입니다. 따라서 $P(A \\cap B) = P(B)$ 입니다.\n$P(B) = 2/15$ 이므로 $P(A \\cap B^c) = 2/5 - 2/15 = 4/15$ 입니다.',
    A: '4/15'
  }
];

data.forEach(d => {
  const content = { unit: '5)덧셈정리_조건부화률_독립시행', id: d.id, type: 'algebra', P: d.P, C: d.C, B: d.B, S: d.S, A: d.A };
  fs.writeFileSync(path.join(dir, d.id + '.json'), JSON.stringify(content, null, 2), 'utf8');
});

console.log('Batch 001-010 of 5)덧셈정리_조건부화률_독립시행 done.');
