/**
 * 현암고 2·3회차 = 20문항 전부 숫자 변형(원본 유형·난이도 유지). 정답은 JS 로 계산·검증.
 * 라운드1: #19,#20 서술형에 AVS 추가 → AVS 6개(#7,15,16,17,19,20).
 * 라운드2/3: 20문항 모두 변형. AVS 문항은 변형 AVS, 나머지는 깔끔한 평이 풀이(한글은 수식 밖).
 * card.predicted.rounds = [[r1],[r2],[r3]].
 */
const fs = require('fs');
const path = require('path');
const A = (P, C, B, S, Ans) => [
  { phase: 'P', title: '목표 확인', content: P }, { phase: 'C', title: '조건 정리', content: C },
  { phase: 'B', title: '핵심 개념', content: B }, { phase: 'S', title: '풀이', content: S }, { phase: 'A', title: '정답', content: Ans },
];
const CIRC = ['①', '②', '③', '④', '⑤'];
const fact = n => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
const nPr = (n, r) => { let p = 1; for (let i = 0; i < r; i++) p *= (n - i); return p; };
const nCr = (n, r) => nPr(n, r) / fact(r);
// 숫자 정답 → {choices, answer}. 정답 위치를 회차 내에서 분산(전부 ③ 몰림 방지).
let mcCounter = 0;
const SPREAD = [2, 0, 3, 1, 4, 1, 3, 0, 2, 4]; // 호출 순서대로 정답 인덱스
function mc(val, distractors) {
  let pos = SPREAD[mcCounter++ % SPREAD.length];
  const gaps = (distractors || []).map(d => Math.abs(d - val)).filter(g => g > 0).sort((a, b) => a - b);
  const step = gaps.length ? gaps[0] : 1;
  const mk = (p) => { const a = []; for (let i = p; i >= 1; i--) a.push(val - i * step); a.push(val); for (let i = 1; i <= 4 - p; i++) a.push(val + i * step); return a; };
  let arr = mk(pos);
  // 음수 보기(개수형) 방지: 정답이 0 이상이면 아래쪽 보기가 음수가 안 되게 pos 축소
  if (val >= 0) while (pos > 0 && arr[0] < 0) { pos--; arr = mk(pos); }
  const i = arr.indexOf(val);
  return { choices: arr.map(x => `$${x}$`), answer: i + 1, label: CIRC[i] };
}
// 명시 보기(문자/범위) → {choices, answer}
function mcExpr(valIdx, arr) { return { choices: arr.map(x => `$${x}$`), answer: valIdx + 1, label: CIRC[valIdx] }; }

// ===== 계산 검증 헬퍼 =====
const P7 = (n, b) => (n - (b + 1)) * 2 * fact(n - 2);                       // A,B 사이 b명
const P15 = (d, k) => 2 + k * d;                                            // [[1,d],[0,1]]^k 성분합
const P16 = (a, r, b, c) => { let s = 0; for (let x = -60; x <= 60; x++) if (Math.abs(x - a) < r && x * x + b * x + c >= 0) s += x; return s; };
const P17 = (N, want3) => { let c = 0; for (let i = 1; i <= N; i++) for (let j = i + 1; j <= N; j++) for (let k = j + 1; k <= N; k++) if (((i + j + k) % 3 === 0) === want3) c++; return c; };
const P19 = (p, q, R) => { let s = 0; for (let x = -50; x <= 50; x++) if (Math.abs(x - p) + Math.abs(x - q) <= R) s += x; return s; };  // |x-p|+|x-q|<=R 정수합
// 삼차 x^3+Bx^2+Cx+k 가 서로다른 세 실근 → 정수 k 합 (극값곱<0)
const P20 = (B, Cc) => { const f = (x, k) => x * x * x + B * x * x + Cc * x + k; const der = [];
  // 극점: 3x^2+2Bx+C=0
  const disc = 4 * B * B - 12 * Cc; if (disc <= 0) return null; const x1 = (-2 * B - Math.sqrt(disc)) / 6, x2 = (-2 * B + Math.sqrt(disc)) / 6;
  let s = 0; for (let k = -400; k <= 400; k++) if (f(x1, k) * f(x2, k) < 0) s += k; return s; };
// 실계수 삼차 x^3+ax^2+bx-P, 근 p+qi → a+b
const P2 = (p, q, P) => { const r = P / (p * p + q * q); const a = -(2 * p + r); const b = (p * p + q * q) + r * 2 * p; return a + b; };
// 모든 실수 성립 정수 a 개수: a^2 - pa - q (<0 또는 <=0)
const P3 = (p, q, strict) => { let c = 0; for (let a = -60; a <= 60; a++) { const v = a * a - p * a - q; if (strict ? v < 0 : v <= 0) c++; } return c; };
// 두 근 모두 1보다: x^2-2mx+(m+k), 범위 [lo,hi)
const P6 = (k) => { // D/4=m^2-(m+k)>=0, f(1)=1-2m+m+k=1+k-m>0 => m<1+k, 축 m>1
  // m^2-m-k>=0 의 큰 근
  const lo = (1 + Math.sqrt(1 + 4 * k)) / 2; return { lo, hi: 1 + k }; };
// 연립 {x^2+Bx+C<=0, x^2+D>0 or x^2+Ex>0} 정수개수
const cntIneq = (pred) => { let c = 0; for (let x = -30; x <= 30; x++) if (pred(x)) c++; return c; };
// x+y=S, x^2+y^2=Q → x^3+y^3
const P13 = (S, Q) => { const xy = (S * S - Q) / 2; return S * S * S - 3 * xy * S; };
// 4자리 자연수(중복없는 digit set) 중 pred 만족 개수
const P14 = (digits, pred) => { let c = 0; const n = digits.length;
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let cc = 0; cc < n; cc++) for (let d = 0; d < n; d++) {
    if (a === b || a === cc || a === d || b === cc || b === d || cc === d) continue;
    if (digits[a] === 0) continue; const num = digits[a] * 1000 + digits[b] * 100 + digits[cc] * 10 + digits[d];
    if (pred(num)) c++; } return c; };

// 행렬 거듭제곱 성분합 (2x2)
const matpow = (m, k) => { let r = [[1, 0], [0, 1]]; const mul = (A, B) => [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]]; for (let i = 0; i < k; i++) r = mul(r, m); return r[0][0] + r[0][1] + r[1][0] + r[1][1]; };

// ====== 변형 정의 ======
// 각 항목: (round) => problem. answer 는 위 헬퍼로 계산.
function build(round) {
  const R = round; // 2 or 3
  const P = {};
  mcCounter = round; // 회차마다 정답 위치 패턴을 다르게(시작 오프셋)

  // #1 복소수 (식 변형, 보기 고정)
  {
    const arr = ['-\\omega^2', '-\\omega', '\\omega', '\\omega^2', '1'];
    const expr = R === 2 ? '\\dfrac{\\omega^2}{1+\\omega^2}' : '\\dfrac{1+\\omega}{1+\\omega^2}';
    const idx = R === 2 ? 1 : 2; // r2:-ω(②), r3:ω(③)
    const sol = R === 2
      ? '$1+\\omega^2=-\\omega$ 이므로 $\\dfrac{\\omega^2}{1+\\omega^2}=\\dfrac{\\omega^2}{-\\omega}=-\\omega$.'
      : '$1+\\omega=-\\omega^2,\\ 1+\\omega^2=-\\omega$ 이므로 $\\dfrac{1+\\omega}{1+\\omega^2}=\\dfrac{-\\omega^2}{-\\omega}=\\omega$.';
    P[1] = { num: 1, unit: '복소수', level: '심화', type: '객관식', latex: `$x^2+x+1=0$ 의 한 허근을 $\\omega$ 라 할 때, $${expr}$ 의 값은?`, ...mcExpr(idx, arr), solution: sol, wrong_point: '$1+\\omega=-\\omega^2$, $1+\\omega^2=-\\omega$ 두 변형을 정확히 쓰는 것이 핵심이다.' };
  }
  // #2 실계수 삼차 한 근 복소수
  {
    const [p, q, Pc] = R === 2 ? [2, 1, 5] : [1, 3, 20];
    const v = P2(p, q, Pc);
    const m = mc(v, [v - 2, v + 2, v - 4, v + 4]);
    P[2] = { num: 2, unit: '고차방정식', level: '심화', type: '객관식', latex: `실계수 삼차방정식 $x^3+ax^2+bx-${Pc}=0$ 의 한 근이 $${p}+${q}i$ 일 때, 두 실수 $a, b$ 에 대하여 $a+b$ 의 값은? (단, $i=\\sqrt{-1}$)`, ...m, solution: `켤레근 $${p}-${q}i$ 와 실근 $r$ 를 갖는다. 세 근의 곱은 $${Pc}$ 이므로 $${p * p + q * q}\\,r=${Pc}$, $r=${Pc / (p * p + q * q)}$. 근과 계수의 관계로 $a=${-(2 * p + Pc / (p * p + q * q))}$, $b=${(p * p + q * q) + Pc / (p * p + q * q) * 2 * p}$. 따라서 $a+b=${v}$.`, wrong_point: '실계수 방정식의 허근은 켤레근과 쌍으로 나타난다. 세 근의 곱·합을 부호까지 정확히 쓴다.' };
  }
  // #3 모든 실수 성립 정수 a 개수
  {
    const [p, q, strict, sign] = R === 2 ? [3, 4, true, '>'] : [1, 6, false, '\\ge'];
    const v = P3(p, q, strict);
    const m = mc(v, [v - 2, v - 1, v + 1, v + 2]);
    const qq = q >= 0 ? '+' + q : q;
    P[3] = { num: 3, unit: '이차부등식', level: '심화', type: '객관식', latex: `$x$ 에 대한 이차부등식 $x^2-2ax+(${p}a${qq})${sign}0$ 이 모든 실수 $x$ 에 대하여 성립하도록 하는 정수 $a$ 의 개수는?`, ...m, solution: `이차항 계수가 양수이므로 판별식 조건만 보면 된다. $\\dfrac{D}{4}=a^2-(${p}a${qq})${strict ? '<' : '\\le'}0$, 즉 $a^2-${p}a-${q}${strict ? '<' : '\\le'}0$ 을 만족하는 정수 $a$ 는 ${v}개.`, wrong_point: '아래로 볼록이므로 “항상 양수/음 아님”은 판별식만으로 결정된다. 등호 유무로 경계 정수 포함 여부가 갈린다.' };
  }
  // #4 행렬 성분합 (보기형 → 계산형 변형)
  {
    const rule = R === 2 ? (i, j) => 2 * i + j : (i, j) => i * j + 1;
    const ruleStr = R === 2 ? '2i+j' : 'ij+1';
    const v = rule(1, 1) + rule(1, 2) + rule(2, 1) + rule(2, 2);
    const m = mc(v, [v - 2, v - 1, v + 1, v + 2]);
    P[4] = { num: 4, unit: '행렬', level: '심화', type: '객관식', latex: `이차정사각행렬 $A=(a_{ij})$ 의 각 성분을 $a_{ij}=${ruleStr}$ $(i=1,2,\\ j=1,2)$ 로 정할 때, 행렬 $A$ 의 모든 성분의 합은?`, ...m, solution: `$a_{11}=${rule(1, 1)},\\ a_{12}=${rule(1, 2)},\\ a_{21}=${rule(2, 1)},\\ a_{22}=${rule(2, 2)}$ 이므로 합은 ${v}.`, wrong_point: '$a_{ij}$ 에서 앞 첨자가 행, 뒤 첨자가 열이다. $a_{12}$ 와 $a_{21}$ 을 바꾸지 않는다.' };
  }
  // #5 순열: A,B,(C,...) 순서 고정
  {
    const [total, fixed] = R === 2 ? [7, 4] : [6, 2];
    const v = fact(total) / fact(fixed);
    const m = mc(v, [Math.round(v / 2), v * 2, v - 60, v + 120].filter(x => x !== v));
    const names = R === 2 ? 'A, B, C, D' : 'A, B';
    P[5] = { num: 5, unit: '순열', level: '심화', type: '객관식', latex: `학생 ${names} 를 포함한 $${total}$ 명을 일렬로 세울 때, ${names} 가 이 순서대로 서는 경우의 수는?`, ...m, solution: `$${total}$ 명을 일렬로 세우는 $${total}!$ 가지 중 정해진 ${fixed}명의 순서는 $${fixed}!$ 가지마다 $1$ 가지만 허용되므로 $\\dfrac{${total}!}{${fixed}!}=${v}$.`, wrong_point: '순서가 고정된 사람들은 자리만 고르면 되므로 그들의 순열 $r!$ 로 나눈다.' };
  }
  // #6 두 근 모두 1보다 (범위형)
  {
    const k = R === 2 ? 12 : 2; const { lo, hi } = P6(k);
    // lo 는 정수: k=12 → (1+7)/2=4, k=2 → (1+3)/2=2
    const loI = Math.round(lo);
    const right = `${loI}\\le m<${hi}`;
    const arr = [right, `m\\ge ${loI}`, `${loI}\\le m<${loI + 3}`, `1<m<${hi}`, `${loI - 1}\\le m<${hi}`];
    P[6] = { num: 6, unit: '이차방정식', level: '심화', type: '객관식', latex: `이차방정식 $x^2-2mx+m+${k}=0$ 의 두 근이 모두 $1$ 보다 클 때, 실수 $m$ 의 값의 범위는?`, ...mcExpr(0, arr), solution: `$f(x)=x^2-2mx+m+${k}$ 로 두면 ① $\\dfrac{D}{4}=m^2-m-${k}\\ge0\\Rightarrow m\\ge${loI}$ ② $f(1)=1+${k}-m>0\\Rightarrow m<${hi}$ ③ 축 $m>1$. 공통범위 $${right}$.`, wrong_point: '판별식·$f(1)>0$·축 위치 세 조건을 모두 걸어야 “두 근이 모두 1보다 크다”가 보장된다.' };
  }
  // #7 AVS — A,B 사이 b명
  {
    const [n, b] = R === 2 ? [6, 1] : [7, 2]; const v = P7(n, b);
    const m = mc(v, [Math.round(v * 0.8), Math.round(v * 1.2), v - 24, v + 24].filter(x => x !== v));
    P[7] = { num: 7, unit: '순열', level: '심화', type: '객관식', latex: `$A, B$ 를 포함한 $${n}$ 명을 일렬로 세울 때, $A$ 와 $B$ 사이에 다른 $${b}$ 명이 들어가도록 세우는 경우의 수는?`, ...m,
      avs: A(`$${n}$ 명을 일렬로 세우되 $A,B$ 사이에 정확히 $${b}$ 명이 오도록 하는 경우의 수를 구한다.`, `$${n}$ 자리 중 $A,B$ 는 간격 $${b + 1}$ 로 떨어지고 나머지 $${n - 2}$ 명은 자유.`, `자리쌍을 정하고 $A\\cdot B$ 순서와 나머지 배열을 곱한다.`, `자리쌍 $${n - (b + 1)}$ 가지 $\\times$ 순서 $2$ $\\times$ $${n - 2}!=${fact(n - 2)}$ $=${v}$.`, `$${v}$ 이므로 보기 ${m.label}.`), wrong_point: `“사이 $${b}$ 명”은 간격 $${b + 1}$. 자리쌍을 빠짐없이 세고 $A,B$ 순서 $2$ 배를 잊지 않는다.` };
  }
  // #8 행렬 2A+E,2A-E → A 성분합
  {
    const M1 = R === 2 ? [[3, 2], [0, 5]] : [[5, 6], [2, 7]];
    const M2 = R === 2 ? [[1, 2], [0, 3]] : [[3, 6], [2, 5]];
    const A4 = [[M1[0][0] + M2[0][0], M1[0][1] + M2[0][1]], [M1[1][0] + M2[1][0], M1[1][1] + M2[1][1]]]; // 4A
    const Am = A4.map(r => r.map(x => x / 4)); const v = Am[0][0] + Am[0][1] + Am[1][0] + Am[1][1];
    const m = mc(v, [v - 2, v - 1, v + 1, v + 2]);
    const ms = (M) => `\\begin{pmatrix} ${M[0][0]} & ${M[0][1]} \\\\ ${M[1][0]} & ${M[1][1]} \\end{pmatrix}`;
    P[8] = { num: 8, unit: '행렬', level: '심화', type: '객관식', latex: `두 이차정사각행렬 $A, E$ 에 대하여 $2A+E=${ms(M1)}$, $2A-E=${ms(M2)}$ 일 때, 행렬 $A$ 의 모든 성분의 합은? (단, $E$ 는 단위행렬)`, ...m, solution: `두 식을 더하면 $4A=${ms(A4)}$ 이므로 $A=${ms(Am)}$. 성분 합은 ${v}.`, wrong_point: '$2A+E$ 와 $2A-E$ 를 더하면 $E$ 가 소거되어 $4A$ 가 된다. $4$ 로 나누는 것을 잊지 않는다.' };
  }
  // #9 원탁 두 사람 이웃
  {
    const n = R === 2 ? 7 : 5; const v = fact(n - 2) * 2;
    const m = mc(v, [Math.round(v / 2), v * 2, v - 12, v + 12].filter(x => x !== v));
    P[9] = { num: 9, unit: '순열', level: '심화', type: '객관식', latex: `$${n}$ 명이 원탁에 둘러앉을 때, 특정한 두 사람이 서로 이웃하여 앉는 경우의 수는?`, ...m, solution: `두 사람을 한 묶음으로 보면 $${n - 1}$ 개의 원순열 $(${n - 1}-1)!=${fact(n - 2)}$, 묶음 내부 $2!=2$ 이므로 $${fact(n - 2)}\\times2=${v}$.`, wrong_point: '원순열은 $(n-1)!$. 직선 배열 $n!$ 과 혼동하지 않고 묶음 내부 $2!$ 를 곱한다.' };
  }
  // #10 사차 서로다른 실근 개수
  {
    // r2: x^4-5x^2+4 (±1,±2 → 4) , r3: x^4-x^3-2x^2 (0중근,2,-1 → 3)
    const v = R === 2 ? 4 : 3;
    const latex = R === 2 ? 'x^4-5x^2+4=0' : 'x^4-x^3-2x^2=0';
    const sol = R === 2 ? '$(x^2-1)(x^2-4)=0$ 이므로 $x=\\pm1,\\pm2$. 서로 다른 실근 $4$ 개.' : '$x^2(x^2-x-2)=x^2(x-2)(x+1)=0$ 이므로 $x=0,2,-1$. 서로 다른 실근 $3$ 개.';
    const m = mc(v, [1, 2, 3, 4, 5].filter(x => x !== v));
    P[10] = { num: 10, unit: '고차방정식', level: '심화', type: '객관식', latex: `사차방정식 $${latex}$ 의 서로 다른 실근의 개수는?`, ...m, solution: sol, wrong_point: '인수분해 후 중근(같은 근)은 “서로 다른” 개수에서 한 번만 센다.' };
  }
  // #11 연립부등식 정수개수
  {
    const pred = R === 2 ? (x => (x * x - x - 12 <= 0) && (x * x - 4 > 0)) : (x => (x * x - 9 <= 0) && (x * x - 2 * x > 0));
    const v = cntIneq(pred);
    const m = mc(v, [v - 1, v + 1, v + 2, v + 3]);
    const sys = R === 2 ? '\\begin{cases} x^2-x-12\\le0 \\\\ x^2-4>0 \\end{cases}' : '\\begin{cases} x^2-9\\le0 \\\\ x^2-2x>0 \\end{cases}';
    P[11] = { num: 11, unit: '연립부등식', level: '심화', type: '객관식', latex: `연립부등식 $${sys}$ 을 만족시키는 정수 $x$ 의 개수는?`, ...m, solution: `각 부등식을 인수분해해 부호를 판정한 뒤 공통 정수를 세면 ${v}개.`, wrong_point: '이차부등식의 등호 유무로 경계 정수 포함이 갈린다. 두 해의 교집합만 센다.' };
  }
  // #12 행렬 거듭제곱 성분합 (조건형 → 계산형 변형)
  {
    const M = R === 2 ? [[2, 0], [0, 3]] : [[1, 0], [1, 1]];
    const k = R === 2 ? 3 : 5; const v = matpow(M, k);
    const m = mc(v, [v - 2, v - 1, v + 1, v + 2]);
    const ms = `\\begin{pmatrix} ${M[0][0]} & ${M[0][1]} \\\\ ${M[1][0]} & ${M[1][1]} \\end{pmatrix}`;
    P[12] = { num: 12, unit: '행렬', level: '심화', type: '객관식', latex: `행렬 $A=${ms}$ 에 대하여 $A^{${k}}$ 의 모든 성분의 합은?`, ...m, solution: `$A$ 를 거듭제곱하면 규칙이 보인다. $A^{${k}}$ 의 모든 성분을 더하면 ${v}.`, wrong_point: '성분별로 따로 거듭제곱하면 안 된다. $A^2, A^3$ 으로 규칙을 확인한 뒤 일반화한다.' };
  }
  // #13 연립 x^3+y^3
  {
    const [S, Q] = R === 2 ? [5, 13] : [6, 20]; const v = P13(S, Q);
    const m = mc(v, [v - 7, v - 3, v + 5, v + 12]);
    P[13] = { num: 13, unit: '연립방정식', level: '심화', type: '객관식', latex: `$x, y$ 에 대한 연립방정식 $\\begin{cases} x^2+y^2=${Q} \\\\ x+y=${S} \\end{cases}$ 을 만족시키는 두 수 $x, y$ 에 대하여 $x^3+y^3$ 의 값은?`, ...m, solution: `$xy=\\dfrac{(x+y)^2-(x^2+y^2)}{2}=${(S * S - Q) / 2}$. $x^3+y^3=(x+y)^3-3xy(x+y)=${S * S * S}-3\\cdot${(S * S - Q) / 2}\\cdot${S}=${v}$.`, wrong_point: '$x^3+y^3=(x+y)^3-3xy(x+y)$ 곱셈공식을 정확히 쓴다.' };
  }
  // #14 네자리 수 개수
  {
    const digits = R === 2 ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4, 5];
    const pred = R === 2 ? (n => n % 5 === 0) : (n => n % 2 === 0);
    const v = P14(digits, pred);
    const m = mc(v, [v - 24, v - 12, v + 12, v + 24]);
    const cond = R === 2 ? '$5$ 의 배수' : '짝수';
    const dlist = digits.join(', ');
    P[14] = { num: 14, unit: '경우의수', level: '심화', type: '객관식', latex: `$${dlist}$ 의 $${digits.length}$ 개의 숫자 중에서 서로 다른 $4$ 개를 택하여 만든 네 자리 자연수 중 ${cond} 의 개수는?`, ...m, solution: `맨 앞자리는 $0$ 이 올 수 없음에 주의해, 끝자리 조건(${cond})으로 경우를 나눠 세면 ${v}개.`, wrong_point: '맨 앞자리에 $0$ 이 오면 네 자리 수가 아니다. 끝자리가 $0$ 인 경우와 아닌 경우를 나눠 센다.' };
  }
  // #15 AVS — [[1,d],[0,1]]^k
  {
    const [d, k] = R === 2 ? [3, 10] : [4, 6]; const v = P15(d, k);
    const m = mc(v, [v - 2, v + 2, v - 4, v + 4]);
    P[15] = { num: 15, unit: '행렬', level: '심화', type: '객관식', latex: `행렬 $A=\\begin{pmatrix} 1 & ${d} \\\\ 0 & 1 \\end{pmatrix}$ 에 대하여 $A^{${k}}$ 의 모든 성분의 합은?`, ...m,
      avs: A(`$A=\\begin{pmatrix} 1 & ${d} \\\\ 0 & 1 \\end{pmatrix}$ 의 $A^{${k}}$ 성분 합을 구한다.`, `$A$ 를 거듭제곱해 규칙을 찾는다.`, `$A^n=\\begin{pmatrix} 1 & ${d}n \\\\ 0 & 1 \\end{pmatrix}$ 임을 $A^2,A^3$ 으로 확인한다.`, `$A^{${k}}=\\begin{pmatrix} 1 & ${d * k} \\\\ 0 & 1 \\end{pmatrix}$ 이므로 합은 $1+${d * k}+0+1=${v}$.`, `$${v}$ 이므로 보기 ${m.label}.`), wrong_point: `$(1,2)$ 성분이 $${d}n$ 으로 커지는 규칙을 검증 후 일반화한다.` };
  }
  // #16 AVS — |x-a|<r, x^2+bx+c
  {
    const [a, r, b, c] = R === 2 ? [2, 4, -1, -6] : [0, 4, -1, -2]; const v = P16(a, r, b, c);
    const m = mc(v, [v - 3, v + 1, v + 2, v + 4]);
    const abs = a === 0 ? '|x|' : `|x-${a}|`;
    const bx = b === -1 ? '-x' : (b > 0 ? `+${b}x` : `${b}x`); const cc = c > 0 ? `+${c}` : `${c}`;
    P[16] = { num: 16, unit: '연립부등식', level: '심화', type: '객관식', latex: `연립부등식 $\\begin{cases} ${abs}<${r} \\\\ x^2${bx}${cc}\\ge0 \\end{cases}$ 을 만족시키는 모든 정수 $x$ 의 값의 합은?`, ...m,
      avs: A(`주어진 연립부등식을 만족하는 정수 $x$ 들의 합을 구한다.`, `$${abs}<${r}$ 와 $x^2${bx}${cc}\\ge0$ 의 공통 정수를 찾는다.`, `$${abs}<${r}\\Leftrightarrow ${a - r}<x<${a + r}$. 이차부등식은 인수분해로 부호 판정.`, `두 해의 공통 정수를 모두 더하면 $${v}$.`, `합 $${v}$ 이므로 보기 ${m.label}.`), wrong_point: '절댓값 부등식은 등호가 없어 경계 정수를 제외한다. “개수”가 아니라 “합”을 묻는다.' };
  }
  // #17 AVS — 1..N 세 수 합 3배수 여부
  {
    const [N, want3] = R === 2 ? [9, false] : [12, true]; const v = P17(N, want3);
    const m = mc(v, [v - 6, v - 3, v + 3, v + 6]);
    const cond = want3 ? '$3$ 의 배수가 되는' : '$3$ 의 배수가 아닌';
    P[17] = { num: 17, unit: '순열', level: '심화', type: '객관식', latex: `$1$ 부터 $${N}$ 까지의 자연수 중에서 서로 다른 세 수를 뽑을 때, 세 수의 합이 ${cond} 경우의 수는?`, ...m,
      avs: A(`$1$~$${N}$ 에서 세 수를 뽑아 합이 ${cond} 경우의 수를 구한다.`, `세 수의 합을 $3$ 으로 나눈 나머지로 분류한다.`, `나머지 $0,1,2$ 묶음으로 나눠, 합이 $3$ 의 배수 $\\Leftrightarrow$ (모두 같은 나머지) 또는 ($0,1,2$ 하나씩).`, want3 ? `두 경우를 더하면 $${v}$.` : `전체 ${'$'}{}_{${N}}\\mathrm{C}_3=${nCr(N, 3)}$ 에서 $3$ 의 배수인 경우를 빼면 $${v}$.`, `$${v}$ 이므로 보기 ${m.label}.`), wrong_point: '나머지들의 합이 $3$ 의 배수여야 한다. 네 유형을 빠짐없이 센다.' };
  }
  // #18 사차 실근 곱 p+q
  {
    // r2: x^4-10x^2+9 (±1,±3, 곱9) + x^4+3x^2-4 (±1, 곱-1) => 8
    // r3: x^4-13x^2+36 (±2,±3 곱36) + x^4+x^2-2 (±1 곱-1) => 35
    const [poly1, p1, poly2, q1] = R === 2 ? ['x^4-10x^2+9', 9, 'x^4+3x^2-4', -1] : ['x^4-13x^2+36', 36, 'x^4+x^2-2', -1];
    const v = p1 + q1; const m = mc(v, [v - 11, v - 5, v + 5, v + 11]);
    P[18] = { num: 18, unit: '고차방정식', level: '심화', type: '객관식', latex: `사차방정식 $${poly1}=0$ 의 모든 실근의 곱을 $p$, 사차방정식 $${poly2}=0$ 의 모든 실근의 곱을 $q$ 라 할 때, $p+q$ 의 값은?`, ...m, solution: `각 식을 $x^2$ 에 대해 인수분해한다. 첫 식의 실근 곱 $p=${p1}$, 둘째 식은 실근이 $\\pm1$ 뿐이라 $q=${q1}$. 따라서 $p+q=${v}$.`, wrong_point: '$x^2+(\\text{양수})$ 꼴은 실근이 없으므로 곱에 넣지 않는다.' };
  }
  // #19 AVS 서술형 — |x-p|+|x-q|<=R 정수합
  {
    const [p, q, RR] = R === 2 ? [1, 3, 6] : [2, 5, 7]; const v = P19(p, q, RR);
    P[19] = { num: 19, unit: '절댓값부등식', level: '심화', type: '서술형', latex: `부등식 $|x-${p}|+|x-${q}|\\le${RR}$ 를 만족시키는 모든 정수 $x$ 의 값의 합을 구하는 과정을 논술하시오.`, answer: String(v),
      avs: A(`$|x-${p}|+|x-${q}|\\le${RR}$ 의 정수해의 합을 구한다.`, `절댓값 안이 $0$ 이 되는 $x=${p}, x=${q}$ 를 경계로 구간을 나눈다.`, `각 구간에서 절댓값을 부호에 맞게 풀어 일차부등식으로 바꾼다.`, `세 구간의 해를 합치면 정수해가 정해지고, 그 합은 $${v}$.`, `정수해의 합은 $${v}$ 이다.`), wrong_point: '가운데 구간(두 경계 사이)에서 항상 성립하는 부분을 빠뜨리면 해가 끊긴다.' };
  }
  // #20 AVS 서술형 — 삼차 세 실근 정수 k 합
  {
    const [B, Cc, polyStr] = R === 2 ? [0, -3, 'x^3-3x+k'] : [-6, 9, 'x^3-6x^2+9x+k']; const v = P20(B, Cc);
    P[20] = { num: 20, unit: '고차방정식', level: '심화', type: '서술형', latex: `삼차방정식 $${polyStr}=0$ 이 서로 다른 세 실근을 갖도록 하는 정수 $k$ 의 값의 합을 구하는 과정을 논술하시오.`, answer: String(v),
      avs: A(`$f(x)=${polyStr}$ 의 그래프가 $x$ 축과 서로 다른 세 점에서 만날 조건을 구한다.`, `삼차함수가 서로 다른 세 실근을 가질 조건을 극값으로 따진다.`, `(극댓값)$\\times$(극솟값)$<0$ 이어야 한다.`, `$f'(x)=0$ 의 두 해에서의 극값을 구해 곱이 음수가 되는 정수 $k$ 를 찾으면, 그 합은 $${v}$.`, `정수 $k$ 의 값의 합은 $${v}$ 이다.`), wrong_point: '극값을 주는 $x$ 를 도함수가 아니라 원함수 $f(x)$ 에 대입해 극값을 구한다.' };
  }

  return [P[1], P[2], P[3], P[4], P[5], P[6], P[7], P[8], P[9], P[10], P[11], P[12], P[13], P[14], P[15], P[16], P[17], P[18], P[19], P[20]];
}

// base 검증
console.assert(P7(6, 2) === 144 && P15(2, 10) === 22 && P16(1, 4, -1, -6) === 5 && P17(9, true) === 30, 'base');
console.assert(P2(1, 2, 10) === 5, 'P2 base'); console.assert(P13(4, 10) === 28, 'P13 base');
console.assert(P19(1, 4, 5) === 15, 'P19 base'); console.assert(P20(-3, 0) === 6, 'P20 base');

// 라운드1 서술형 AVS
const avs19 = A('$|x-1|+|x-4|\\le5$ 의 정수해의 합을 구한다.', '절댓값 안이 $0$ 이 되는 $x=1, x=4$ 를 경계로 구간을 나눈다.', '각 구간에서 절댓값을 부호에 맞게 풀어 일차부등식으로 바꾼다.', '$x<1$: $5-2x\\le5\\Rightarrow x\\ge0$. $1\\le x\\le4$: $3\\le5$ 항상 성립. $x>4$: $2x-5\\le5\\Rightarrow x\\le5$. 합치면 $0\\le x\\le5$.', '정수 $0,1,2,3,4,5$ 의 합은 $15$ 이다.');
const avs20 = A('$f(x)=x^3-3x^2+k$ 의 그래프가 $x$ 축과 서로 다른 세 점에서 만날 조건을 구한다.', '삼차함수가 서로 다른 세 실근을 가질 조건을 극값으로 따진다.', '(극댓값)$\\times$(극솟값)$<0$ 이어야 한다.', "$f'(x)=3x^2-6x=0\\Rightarrow x=0,2$. 극댓값 $f(0)=k$, 극솟값 $f(2)=k-4$. $k(k-4)<0\\Rightarrow 0<k<4$.", '정수 $k$ 는 $1,2,3$ 이고 그 합은 $6$ 이다.');

const fp = path.join(__dirname, '..', '..', 'src', 'data', 'exam_predict', 'cards', '현암고.json');
const card = JSON.parse(fs.readFileSync(fp, 'utf8'));
// round1 = 기존 problems(없으면 rounds[0])
const base = card.predicted.problems || (card.predicted.rounds && card.predicted.rounds[0]);
const r1 = base.map(p => ({ ...p }));
for (const p of r1) { if (p.num === 19) { p.avs = avs19; delete p.solution; } if (p.num === 20) { p.avs = avs20; delete p.solution; } }
const r2 = build(2), r3 = build(3);
card.predicted.problems = r1;
card.predicted.rounds = [r1, r2, r3];
card.predicted.count = r1.length;
fs.writeFileSync(fp, JSON.stringify(card, null, 2));

// 검증 리포트
console.log('AVS(라운드1):', r1.filter(p => p.avs).length, '| 회차문항:', [r1, r2, r3].map(r => r.length).join('/'));
let diff = 0; for (let i = 0; i < 20; i++) if (r1[i].latex !== r2[i].latex && r2[i].latex !== r3[i].latex) diff++;
console.log('1·2·3회차 모두 다른 문항수:', diff, '/20');
console.log('샘플 변형 #13:', r2[12].latex.replace(/\$/g, ''), '|', r3[12].latex.replace(/\$/g, ''));
