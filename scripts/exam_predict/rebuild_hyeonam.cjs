/**
 * 현암고 — 기본 4문제(#7,15,16,17)만 심화로 교체. 나머지 16문제는 그대로 둔다.
 * 교체분: 같은 단원 유지 + 변별력↑ + PCBSA avs[] 5단계(녹색 칠판) + KaTeX 깨짐 0.
 * cards/현암고.json(번들 소스)과 predicted/현암고.json 둘 다 패치.
 * 실행: node scripts/exam_predict/rebuild_hyeonam.cjs
 */
const fs = require('fs');
const path = require('path');

const A = (P, C, B, S, Ans) => [
  { phase: 'P', title: '목표 확인', content: P },
  { phase: 'C', title: '조건 정리', content: C },
  { phase: 'B', title: '핵심 개념', content: B },
  { phase: 'S', title: '풀이', content: S },
  { phase: 'A', title: '정답', content: Ans },
];

// num → 교체 문제(기존 단원 유지)
const REPLACE = {
  7: {
    num: 7, unit: '순열', level: '심화', type: '객관식',
    latex: '$A, B$ 를 포함한 $6$ 명을 일렬로 세울 때, $A$ 와 $B$ 사이에 다른 $2$ 명이 들어가도록 세우는 경우의 수는?',
    choices: ['$120$', '$144$', '$168$', '$216$', '$288$'],
    answer: 2,
    avs: A(
      '$6$ 명을 일렬로 세우되 $A$ 와 $B$ 사이에 정확히 다른 $2$ 명이 오도록 하는 경우의 수를 구한다.',
      '$6$ 개의 자리 중 $A, B$ 는 사이에 두 자리를 두고 떨어져 있어야 하고, 나머지 $4$ 명은 자유롭게 선다.',
      '먼저 $A, B$ 가 놓일 자리(간격이 $3$ 인 두 자리)를 정하고, $A \\cdot B$ 의 순서, 나머지 $4$ 명의 배열을 차례로 곱한다(곱의 법칙).',
      '$A, B$ 의 자리는 $(1,4), (2,5), (3,6)$ 의 $3$ 가지. 각 경우 $A, B$ 를 서로 바꿀 수 있어 $2$ 가지. 나머지 $4$ 명을 남은 $4$ 자리에 세우는 방법은 $4!=24$.',
      '$3\\times2\\times24=144$ 이므로 보기 ②이다.'
    ),
    wrong_point: '“사이에 $2$ 명”은 두 사람의 자리 간격이 $3$ 임을 뜻한다. 자리쌍 $(1,4),(2,5),(3,6)$ 을 빠짐없이 세고, $A, B$ 의 순서를 바꾸는 $2$ 배를 잊지 않는다.',
  },
  15: {
    num: 15, unit: '행렬', level: '심화', type: '객관식',
    latex: '행렬 $A=\\begin{pmatrix} 1 & 2 \\\\ 0 & 1 \\end{pmatrix}$ 에 대하여 $A^{10}$ 의 모든 성분의 합은?',
    choices: ['$22$', '$24$', '$26$', '$28$', '$30$'],
    answer: 1,
    avs: A(
      '$A=\\begin{pmatrix} 1 & 2 \\\\ 0 & 1 \\end{pmatrix}$ 의 거듭제곱 $A^{10}$ 의 모든 성분의 합을 구한다.',
      '$A$ 를 몇 번 거듭제곱해 규칙(패턴)을 찾은 뒤 $A^{10}$ 으로 일반화한다.',
      '$A^2, A^3$ 을 계산해 $A^n=\\begin{pmatrix} 1 & 2n \\\\ 0 & 1 \\end{pmatrix}$ 임을 확인한다(수학적 귀납).',
      '$A^2=\\begin{pmatrix} 1 & 4 \\\\ 0 & 1 \\end{pmatrix}$, $A^3=\\begin{pmatrix} 1 & 6 \\\\ 0 & 1 \\end{pmatrix}$ 이므로 $A^n=\\begin{pmatrix} 1 & 2n \\\\ 0 & 1 \\end{pmatrix}$. 따라서 $A^{10}=\\begin{pmatrix} 1 & 20 \\\\ 0 & 1 \\end{pmatrix}$.',
      '합은 $1+20+0+1=22$ 이므로 보기 ①이다.'
    ),
    wrong_point: '$A^n$ 의 $(1,2)$ 성분이 $2n$ 으로 커진다는 규칙을 $A^2, A^3$ 으로 반드시 검증한 뒤 일반화한다. 성분별로 따로 거듭제곱하면 안 된다.',
  },
  16: {
    num: 16, unit: '연립부등식', level: '심화', type: '객관식',
    latex: '연립부등식 $\\begin{cases} |x-1|<4 \\\\ x^2-x-6\\ge0 \\end{cases}$ 을 만족시키는 모든 정수 $x$ 의 값의 합은?',
    choices: ['$3$', '$5$', '$6$', '$7$', '$9$'],
    answer: 2,
    avs: A(
      '주어진 연립부등식을 만족시키는 정수 $x$ 들의 값의 합을 구한다.',
      '$|x-1|<4$ 와 $x^2-x-6\\ge0$ 을 각각 풀어 두 해의 공통 부분에서 정수를 찾는다.',
      '$|x-1|<4 \\Leftrightarrow -4<x-1<4 \\Leftrightarrow -3<x<5$. 이차부등식은 인수분해하여 부호를 판정한다.',
      '$-3<x<5$ 이므로 정수는 $-2, -1, 0, 1, 2, 3, 4$. $x^2-x-6=(x-3)(x+2)\\ge0 \\Rightarrow x\\le-2$ 또는 $x\\ge3$. 공통 정수는 $-2, 3, 4$.',
      '합은 $-2+3+4=5$ 이므로 보기 ②이다.'
    ),
    wrong_point: '$|x-1|<4$ 는 등호가 없어 $x=-3, 5$ 를 제외하고, 이차부등식은 등호가 있어 $x=-2, 3$ 을 포함한다. 개수가 아니라 “합”을 묻는 점도 주의한다.',
  },
  17: {
    num: 17, unit: '순열', level: '심화', type: '객관식',
    latex: '$1$ 부터 $9$ 까지의 자연수 중에서 서로 다른 세 수를 뽑을 때, 세 수의 합이 $3$ 의 배수가 되는 경우의 수는?',
    choices: ['$24$', '$27$', '$30$', '$33$', '$36$'],
    answer: 3,
    avs: A(
      '$1$ 부터 $9$ 까지에서 서로 다른 세 수를 뽑아 그 합이 $3$ 의 배수가 되는 경우의 수를 구한다.',
      '세 수의 합이 $3$ 의 배수가 될 조건을 “$3$ 으로 나눈 나머지”로 분류해 따진다.',
      '$1$~$9$ 를 $3$ 으로 나눈 나머지로 묶으면 나머지 $0$ 은 $\\{3, 6, 9\\}$, 나머지 $1$ 은 $\\{1, 4, 7\\}$, 나머지 $2$ 는 $\\{2, 5, 8\\}$ 로 각 $3$ 개씩이다. 세 수의 합이 $3$ 의 배수 $\\Leftrightarrow$ (세 수의 나머지가 모두 같음) 또는 (나머지가 $0, 1, 2$ 하나씩).',
      '같은 나머지에서 셋을 뽑기: 각 묶음 ${}_3\\mathrm{C}_3=1$, 묶음이 $3$ 개이므로 $3$. 서로 다른 세 나머지에서 하나씩: $3\\times3\\times3=27$. 두 경우를 더한다.',
      '$3+27=30$ 이므로 보기 ③이다.'
    ),
    wrong_point: '합이 $3$ 의 배수이려면 나머지들의 합도 $3$ 의 배수여야 한다. $(0,0,0), (1,1,1), (2,2,2), (0,1,2)$ 네 유형을 빠짐없이 세고, “같은 나머지 셋” 경우를 누락하지 않는다.',
  },
};

function patch(file) {
  const full = path.join(__dirname, '..', '..', 'src', 'data', 'exam_predict', file);
  const data = JSON.parse(fs.readFileSync(full, 'utf8'));
  const probs = file.startsWith('cards') ? data.predicted.problems : data.problems;
  let n = 0;
  for (let i = 0; i < probs.length; i++) {
    const rep = REPLACE[probs[i].num];
    if (rep) { probs[i] = rep; n++; }
  }
  if (file.startsWith('cards')) { data.predicted.count = probs.length; data.built_at = '2026-06-13'; }
  else { data.count = probs.length; data.generated_at = '2026-06-13'; }
  fs.writeFileSync(full, JSON.stringify(data, null, 2));
  console.log(`  ${file}: ${n}문제 교체`);
}

patch('cards/현암고.json');
patch('predicted/현암고.json');

// 검증: 교체 4문제 단원/난이도
const c = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'data', 'exam_predict', 'cards', '현암고.json'), 'utf8'));
const lv = {}; c.predicted.problems.forEach(p => lv[p.level] = (lv[p.level] || 0) + 1);
console.log('교체 후 난이도:', JSON.stringify(lv));
console.log('교체 4문제 avs[5] 확인:', [7, 15, 16, 17].every(num => {
  const p = c.predicted.problems.find(x => x.num === num);
  return p.avs && p.avs.length === 5 && !p.solution;
}));
