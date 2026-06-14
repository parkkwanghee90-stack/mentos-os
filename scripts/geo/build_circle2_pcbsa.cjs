/**
 * 원의방정식 2단계 — 자동 생성기가 미완성(manual_review_required)·오답으로 남긴
 * 문제들을 손으로 검증한 PCBSA + 살아있는 도형 데이터로 교체한다.
 *
 * 대상(자동생성 미완성/오답): 007,008,009,010,011,013,019,020,023,024,026,027,029,030
 * 출력: public/math_hints/원의방정식2단계/00X.json  (그 후 upload_circle_hints_only.cjs 로 업로드)
 *
 * 형식은 001.json(완성본)과 동일:
 *   { type, viewBox, base_figure{preset,viewBox,objects[axes]}, figure_avs_fixed,
 *     steps[{step,label,latex,objects[]}], finalAnswer, correctAnswer, answerType,
 *     explanationFinalLine, status:'complete' }
 * 좌표는 정밀할 필요 없음 — 렌더러(MathCanvas)가 도형 범위에 맞춰 보기창을 자동 조정한다.
 * 도형만 보이고 단계 설명 + 숫자만 맞으면 된다.
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', '..', 'public', 'math_hints', '원의방정식2단계');
fs.mkdirSync(OUT_DIR, { recursive: true });

// ── 색/스타일 상수 ────────────────────────────────────
const MAIN = '#3b82f6';   // 주어진 원
const SEC  = '#ec4899';   // 새/결과 원
const LITE = '#60a5fa';   // 보조 원(옅게)
const PT   = '#22c55e';   // 점
const HL    = '#ef4444';  // 강조 점/그래프
const SEG  = '#f59e0b';   // 보조선(점선)

const circle  = (c, r, color = MAIN, fill = 0.12) => ({ type: 'circle', center: c, radius: r, color, fillOpacity: fill });
const point   = (c, label, color = PT) => ({ type: 'point', coords: c, label, color });
const seg     = (from, to, label, color = SEG) => ({ type: 'segment', from, to, color, style: 'dashed', weight: 1.5, ...(label ? { label } : {}) });
const fplot   = (expr, color = HL) => ({ type: 'function_plot', expr, color });

const L = {
  P: 'P: 문제에서 구하는 것 확인',
  C: 'C: 조건/단서 정리',
  B: 'B: 필요한 배경개념/공식',
  S: 'S: 식 변형/구조 분석',
  A: 'A: 계산 적용 및 최종 정답 도출',
};

// 문제별 PCBSA. steps: [P,C,B,S,A] 각각 {latex, objects}
const PROBLEMS = {
  '007': {
    answer: '6\\pi',
    answerType: 'multiple_choice',
    finalLine: '따라서 둘레의 길이는 6π, 정답은 ③입니다.',
    vb: { x: [-1, 9], y: [-10, 1] },
    steps: [
      { latex: '주어진 원과 중심이 같고 y축에 접하는 원의 둘레의 길이를 구합니다.', objects: [] },
      { latex: '원 x^2+y^2-6x+8y=0 은 (x-3)^2+(y+4)^2=25, 중심이 C(3,-4)입니다.',
        objects: [circle([3, -4], 5, MAIN, 0.1), point([3, -4], 'C(3,-4)')] },
      { latex: '중심이 같고 y축에 접하는 원의 반지름은 중심에서 y축까지의 거리, 즉 |3|=3 입니다.',
        objects: [circle([3, -4], 3, SEC, 0.12), seg([3, -4], [0, -4], '3')] },
      { latex: '접점은 (0,-4)이고 새 원의 반지름은 r=3 입니다.',
        objects: [point([0, -4], '(0,-4)')] },
      { latex: '둘레 = 2πr = 2π·3 = 6π 입니다.', objects: [] },
    ],
  },
  '008': {
    answer: '4\\pi',
    answerType: 'short_answer',
    finalLine: '따라서 둘레의 길이는 4π입니다.',
    vb: { x: [-1, 8], y: [-10, 1] },
    steps: [
      { latex: '주어진 원과 중심이 같고 y축에 접하는 원의 둘레의 길이를 구합니다.', objects: [] },
      { latex: '원 x^2+y^2-4x+8y=0 은 (x-2)^2+(y+4)^2=20, 중심이 C(2,-4)입니다.',
        objects: [circle([2, -4], 4.472, MAIN, 0.1), point([2, -4], 'C(2,-4)')] },
      { latex: '중심이 같고 y축에 접하는 원의 반지름은 |2|=2 입니다.',
        objects: [circle([2, -4], 2, SEC, 0.12), seg([2, -4], [0, -4], '2')] },
      { latex: '접점은 (0,-4)이고 새 원의 반지름은 r=2 입니다.',
        objects: [point([0, -4], '(0,-4)')] },
      { latex: '둘레 = 2πr = 2π·2 = 4π 입니다.', objects: [] },
    ],
  },
  '009': {
    answer: '26\\pi',
    answerType: 'multiple_choice',
    finalLine: '따라서 두 원의 넓이의 합은 26π, 정답은 ②입니다.',
    vb: { x: [-1, 9], y: [-9, 1] },
    steps: [
      { latex: 'x축, y축에 동시에 접하고 점 (1,-2)를 지나는 두 원의 넓이의 합을 구합니다.', objects: [] },
      { latex: '점 (1,-2)는 제4사분면 → 중심을 (a,-a), 반지름을 a 로 둘 수 있습니다.',
        objects: [point([1, -2], '(1,-2)', HL)] },
      { latex: '(1-a)^2+(-2+a)^2=a^2 → a^2-6a+5=0 → a=1 또는 a=5.', objects: [] },
      { latex: '두 원은 중심 (1,-1) 반지름 1, 중심 (5,-5) 반지름 5 입니다.',
        objects: [circle([1, -1], 1, MAIN, 0.12), point([1, -1], '(1,-1)'),
                  circle([5, -5], 5, SEC, 0.08), point([5, -5], '(5,-5)')] },
      { latex: '넓이의 합 = π·1^2 + π·5^2 = π + 25π = 26π 입니다.', objects: [] },
    ],
  },
  '010': {
    answer: '104\\pi',
    answerType: 'multiple_choice',
    finalLine: '따라서 두 원의 넓이의 합은 104π, 정답은 ③입니다.',
    vb: { x: [-12, 1], y: [-1, 12] },
    steps: [
      { latex: 'x축, y축에 동시에 접하고 점 (-2,4)를 지나는 두 원의 넓이의 합을 구합니다.', objects: [] },
      { latex: '점 (-2,4)는 제2사분면 → 중심을 (-a,a), 반지름을 a 로 둘 수 있습니다.',
        objects: [point([-2, 4], '(-2,4)', HL)] },
      { latex: '(-2+a)^2+(4-a)^2=a^2 → a^2-12a+20=0 → a=2 또는 a=10.', objects: [] },
      { latex: '두 원은 중심 (-2,2) 반지름 2, 중심 (-10,10) 반지름 10 입니다.',
        objects: [circle([-2, 2], 2, MAIN, 0.12), point([-2, 2], '(-2,2)'),
                  circle([-10, 10], 10, SEC, 0.06), point([-10, 10], '(-10,10)')] },
      { latex: '넓이의 합 = π·2^2 + π·10^2 = 4π + 100π = 104π 입니다.', objects: [] },
    ],
  },
  '011': {
    answer: '160',
    answerType: 'short_answer',
    finalLine: '따라서 M=16, m=10 이므로 Mm=160 입니다.',
    vb: { x: [-1, 16], y: [-1, 8] },
    steps: [
      { latex: '원 위의 점 (x,y)에 대하여 √(x^2+y^2)(=원점까지의 거리)의 최댓값 M, 최솟값 m의 곱을 구합니다.', objects: [] },
      { latex: '(x-12)^2+(y-5)^2=9 → 중심 C(12,5), 반지름 3. √(x^2+y^2)은 원점 O와 원 위 점 사이의 거리.',
        objects: [circle([12, 5], 3, MAIN, 0.12), point([12, 5], 'C(12,5)'), point([0, 0], 'O')] },
      { latex: '원점에서 원 위 점까지의 거리는 OC±r. OC=√(12^2+5^2)=√169=13 입니다.',
        objects: [seg([0, 0], [12, 5], '13')] },
      { latex: '최댓값 M=OC+r=13+3=16, 최솟값 m=OC-r=13-3=10 (OC 직선이 원과 만나는 두 점).',
        objects: [seg([0, 0], [14.77, 6.15], null), point([14.77, 6.15], 'M=16', HL), point([9.23, 3.85], 'm=10')] },
      { latex: 'Mm = 16·10 = 160 입니다.', objects: [] },
    ],
  },
  '013': {
    answer: '34',
    answerType: 'short_answer',
    finalLine: '넓이 1~8은 각 4개, 넓이 9는 2개이므로 8·4+2=34개입니다.',
    vb: { x: [-7, 4], y: [-4, 4] },
    steps: [
      { latex: '삼각형 ACP의 넓이가 자연수가 되도록 하는 원 위의 점 P의 개수를 구합니다.', objects: [] },
      { latex: '원 x^2+y^2+6x=0 은 (x+3)^2+y^2=9, 중심 C(-3,0), 반지름 3. 점 A(3,0).',
        objects: [circle([-3, 0], 3, MAIN, 0.1), point([-3, 0], 'C(-3,0)'), point([3, 0], 'A(3,0)', HL)] },
      { latex: '밑변 AC는 x축 위에 있고 길이 AC=6. 넓이 = 1/2·6·|y_P| = 3|y_P| 입니다.',
        objects: [seg([3, 0], [-3, 0], 'AC=6')] },
      { latex: 'P의 y좌표는 -3~3 이므로 넓이 3|y_P|의 값은 1,2,…,9 (자연수 9개).',
        objects: [point([-3, 3], 'P', PT), seg([-3, 3], [-3, 0], '|y|')] },
      { latex: '넓이 1~8은 각 4개 점, 넓이 9는 (-3,3),(-3,-3) 2개 → 8·4+2 = 34개입니다.', objects: [] },
    ],
  },
  '019': {
    answer: '\\sqrt{7}',
    answerType: 'short_answer',
    finalLine: '따라서 구하는 반지름의 길이는 √7 입니다.',
    vb: { x: [-5, 7], y: [-6, 4] },
    steps: [
      { latex: '두 원의 교점을 지나고 중심이 y축 위에 있는 원의 반지름을 구합니다.', objects: [] },
      { latex: '두 원: x^2+y^2-6x+y=0, x^2+y^2+2x+5y-4=0.',
        objects: [circle([3, -0.5], 3.041, MAIN, 0.06), circle([-1, -2.5], 3.354, LITE, 0.06)] },
      { latex: '교점을 지나는 원: (x^2+y^2-6x+y) + k(x^2+y^2+2x+5y-4)=0. 중심의 x좌표=0 조건에서 k=3.', objects: [] },
      { latex: 'k=3 대입 → 4(x^2+y^2)+16y-12=0 → x^2+(y+2)^2=7. 중심 (0,-2), 반지름 √7.',
        objects: [circle([0, -2], 2.646, SEC, 0.14), point([0, -2], '(0,-2)')] },
      { latex: '따라서 반지름의 길이는 √7 입니다.', objects: [] },
    ],
  },
  '020': {
    answer: '\\sqrt{10}',
    answerType: 'short_answer',
    finalLine: '따라서 구하는 반지름의 길이는 √10 입니다.',
    vb: { x: [-4, 6], y: [-5, 4] },
    steps: [
      { latex: '두 원의 교점을 지나고 중심이 x축 위에 있는 원의 반지름을 구합니다.', objects: [] },
      { latex: '두 원: x^2+y^2+2x+4y=0, x^2+y^2-x+2y-3=0.',
        objects: [circle([-1, -2], 2.236, MAIN, 0.06), circle([0.5, -1], 2.062, LITE, 0.06)] },
      { latex: '교점을 지나는 원: (원1) + k(원2)=0. 중심의 y좌표=0 조건에서 k=-2.', objects: [] },
      { latex: 'k=-2 대입 → x^2+y^2-4x-6=0 → (x-2)^2+y^2=10. 중심 (2,0), 반지름 √10.',
        objects: [circle([2, 0], 3.162, SEC, 0.14), point([2, 0], '(2,0)')] },
      { latex: '따라서 반지름의 길이는 √10 입니다.', objects: [] },
    ],
  },
  '023': {
    answer: '1/2',
    answerType: 'short_answer',
    finalLine: '두 원의 중심을 잇는 직선 y=x 와 공통현 x+y=1 의 교점이 중점이므로 x좌표는 1/2 입니다.',
    vb: { x: [-3, 4], y: [-3, 4] },
    steps: [
      { latex: '두 원의 두 교점 A, B에 대하여 선분 AB의 중점의 x좌표를 구합니다.', objects: [] },
      { latex: '두 원: x^2+y^2=4 (중심 O), (x-1)^2+(y-1)^2=4 (중심 (1,1)).',
        objects: [circle([0, 0], 2, MAIN, 0.08), point([0, 0], 'O'),
                  circle([1, 1], 2, LITE, 0.08), point([1, 1], '(1,1)')] },
      { latex: '두 식을 빼면 공통현(직선 AB): x+y=1.',
        objects: [fplot('1 - x', SEG)] },
      { latex: 'AB의 중점은 두 중심을 잇는 직선 y=x 와 공통현 x+y=1 의 교점 (1/2, 1/2).',
        objects: [point([1.823, -0.823], 'A'), point([-0.823, 1.823], 'B'),
                  point([0.5, 0.5], 'M(1/2,1/2)', HL)] },
      { latex: '따라서 중점의 x좌표는 1/2 입니다.', objects: [] },
    ],
  },
  '024': {
    answer: '(-7/17, -6/17)',
    answerType: 'short_answer',
    finalLine: '넓이가 최소인 원은 공통현 AB를 지름으로 하는 원이고, 그 중심은 (-7/17, -6/17)입니다.',
    vb: { x: [-7, 4], y: [-5, 3] },
    steps: [
      { latex: '두 원의 교점을 모두 지나는 원 중 넓이가 최소인 원의 중심을 구합니다.', objects: [] },
      { latex: '두 원: 중심 C1(-3,-1) 반지름 3, 중심 C2(1,0) 반지름 2.',
        objects: [circle([-3, -1], 3, MAIN, 0.06), point([-3, -1], 'C1'),
                  circle([1, 0], 2, LITE, 0.06), point([1, 0], 'C2')] },
      { latex: '두 식을 빼면 공통현(근축): 4x+y+2=0. 넓이 최소 원은 AB를 지름으로 하는 원.',
        objects: [fplot('-4*x - 2', SEG)] },
      { latex: '그 중심은 공통현과 두 중심을 잇는 직선의 교점 = (-7/17, -6/17).',
        objects: [point([-0.412, -0.353], '(-7/17,-6/17)', HL)] },
      { latex: '따라서 넓이가 최소인 원의 중심은 (-7/17, -6/17) 입니다.', objects: [] },
    ],
  },
  '026': {
    answer: '176',
    answerType: 'short_answer',
    finalLine: 'k에 대한 이차방정식 k^2+32k+176=0 의 두 근의 곱은 176 입니다.',
    vb: { x: [-5, 4], y: [-5, 3] },
    steps: [
      { latex: '두 원의 공통인 현의 길이가 4√2가 되도록 하는 모든 실수 k의 값의 곱을 구합니다.', objects: [] },
      { latex: '원1 x^2+y^2-2x+k=0 (중심 (1,0), r1^2=1-k), 원2 x^2+y^2+2x+2y-10=0 (중심 (-1,-1), r2^2=12).',
        objects: [circle([-1, -1], 3.464, MAIN, 0.06), point([-1, -1], '(-1,-1)'),
                  circle([1, 0], 2.839, SEC, 0.06), point([1, 0], '(1,0)')] },
      { latex: '공통현(근축): 4x+2y-k-10=0. 현의 길이 = 2√(r1^2 - d^2), d는 (1,0)에서 근축까지 거리.', objects: [] },
      { latex: '(1-k) - (k+6)^2/20 = (2√2)^2 = 8 → k^2+32k+176=0.', objects: [] },
      { latex: '두 근의 곱 = 176 (근과 계수의 관계) 입니다.', objects: [] },
    ],
  },
  '027': {
    answer: '-2',
    answerType: 'multiple_choice',
    finalLine: 'a=0 또는 a=-2 이므로 합은 -2, 정답은 ②입니다.',
    vb: { x: [-4, 3], y: [-3, 4] },
    steps: [
      { latex: '원 C1이 원 C2의 둘레를 이등분하며 지날 때 a의 값의 합을 구합니다.', objects: [] },
      { latex: 'C1: x^2+y^2-2ax-2y-4=0, C2: x^2+y^2+2x+2ay-2=0 (중심 (-1,-a)).',
        objects: [circle([-1, 0], 1.732, MAIN, 0.08), point([-1, 0], 'C2중심'),
                  circle([0, 1], 2.236, SEC, 0.06)] },
      { latex: '둘레를 이등분 → 공통현이 C2의 중심을 지난다. 공통현: (a+1)x+(a+1)y+1=0.',
        objects: [fplot('-x - 1', SEG)] },
      { latex: 'C2의 중심 (-1,-a) 대입 → (a+1)^2=1 → a=0 또는 a=-2.', objects: [] },
      { latex: 'a의 값의 합 = 0+(-2) = -2 입니다.', objects: [] },
    ],
  },
  '029': {
    answer: '-1 \\le a < 2',
    answerType: 'multiple_choice',
    finalLine: 'x축과 만나려면 a≥-1, y축과 만나지 않으려면 a<2 이므로 -1≤a<2, 정답은 ③입니다.',
    vb: { x: [-1, 5], y: [-2, 4] },
    steps: [
      { latex: '원이 x축과는 만나고 y축과는 만나지 않도록 하는 a의 값의 범위를 구합니다.', objects: [] },
      { latex: '원 x^2+y^2-4x-2y=a-3 은 중심 (2,1), 반지름 r에서 r^2=a+2 입니다.',
        objects: [point([2, 1], '중심(2,1)', HL)] },
      { latex: 'x축과 만남 → r ≥ (중심의 y좌표) =1 → a+2≥1 → a≥-1.  y축과 안 만남 → r < 2 → a+2<4 → a<2.',
        objects: [circle([2, 1], 1.414, MAIN, 0.1), seg([2, 1], [2, 0], '1'), seg([2, 1], [0, 1], '2')] },
      { latex: '두 조건을 모두 만족하는 범위는 -1 ≤ a < 2 입니다.', objects: [] },
      { latex: '따라서 정답은 -1 ≤ a < 2 입니다.', objects: [] },
    ],
  },
  '030': {
    answer: '4 < k \\le 9',
    answerType: 'short_answer',
    finalLine: 'x축과 안 만나려면 k>4, y축과 만나려면 k≤9 이므로 4<k≤9 입니다.',
    vb: { x: [-1, 5], y: [-6, 1] },
    steps: [
      { latex: '원이 x축과는 만나지 않고 y축과는 만나도록 하는 k의 값의 범위를 구합니다.', objects: [] },
      { latex: '원 x^2+y^2-4x+6y+k=0 은 중심 (2,-3), 반지름 r에서 r^2=13-k 입니다.',
        objects: [point([2, -3], '중심(2,-3)', HL)] },
      { latex: 'x축과 안 만남 → r < (중심의 y좌표 거리)=3 → 13-k<9 → k>4.  y축과 만남 → r ≥ 2 → 13-k≥4 → k≤9.',
        objects: [circle([2, -3], 2.646, MAIN, 0.1), seg([2, -3], [2, 0], '3'), seg([2, -3], [0, -3], '2')] },
      { latex: '두 조건을 모두 만족하는 범위는 4 < k ≤ 9 입니다.', objects: [] },
      { latex: '따라서 k의 범위는 4 < k ≤ 9 입니다.', objects: [] },
    ],
  },
};

const STEP_LABELS = [L.P, L.C, L.B, L.S, L.A];

let written = 0;
for (const [num, prob] of Object.entries(PROBLEMS)) {
  const doc = {
    type: 'geometry',
    viewBox: prob.vb,
    base_figure: { preset: 'custom', viewBox: prob.vb, objects: [{ type: 'axes' }] },
    figure_avs_fixed: true,
    steps: prob.steps.map((s, i) => ({
      step: i + 1,
      label: STEP_LABELS[i],
      latex: s.latex,
      objects: s.objects,
    })),
    finalAnswer: prob.answer,
    correctAnswer: prob.answer,
    answerType: prob.answerType,
    explanationFinalLine: prob.finalLine,
    status: 'complete',
    pcbsa_completed: true,
    manual_review_required: false,
    layer: 'render',
  };
  const outPath = path.join(OUT_DIR, `${num}.json`);
  fs.writeFileSync(outPath, JSON.stringify(doc, null, 1));
  written++;
  console.log(`✅ ${num}.json  (정답: ${prob.answer})`);
}
console.log(`\n총 ${written}개 파일 작성 → ${OUT_DIR}`);
