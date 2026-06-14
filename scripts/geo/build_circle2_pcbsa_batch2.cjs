/**
 * 원의방정식 2단계 — 자동생성 "complete"였지만 도형이 엉망인 나머지 15문제를
 * 011 기준(손 검증 PCBSA + 깔끔한 도형)으로 재작성한다.
 * 대상: 002,003,004,005,006,012,014,015,016,017,018,021,022,025,028
 * (001은 원본 수작업, 007~011/013/019/020/023/024/026/027/029/030은 batch1에서 완료)
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', '..', 'public', 'math_hints', '원의방정식2단계');
fs.mkdirSync(OUT_DIR, { recursive: true });

const MAIN = '#3b82f6', SEC = '#ec4899', LITE = '#60a5fa', PT = '#22c55e', HL = '#ef4444', SEG = '#f59e0b';
const circle = (c, r, color = MAIN, fill = 0.12) => ({ type: 'circle', center: c, radius: r, color, fillOpacity: fill });
const point  = (c, label, color = PT) => ({ type: 'point', coords: c, label, color });
const seg    = (from, to, label, color = SEG) => ({ type: 'segment', from, to, color, style: 'dashed', weight: 1.5, ...(label ? { label } : {}) });
const fplot  = (expr, color = HL) => ({ type: 'function_plot', expr, color });
const poly   = (pts, color = HL) => ({ type: 'polygon', points: pts, color, fillOpacity: 0.06 });

const STEP_LABELS = [
  'P: 문제에서 구하는 것 확인',
  'C: 조건/단서 정리',
  'B: 필요한 배경개념/공식',
  'S: 식 변형/구조 분석',
  'A: 계산 적용 및 최종 정답 도출',
];

const PROBLEMS = {
  '002': {
    answer: '3', answerType: 'multiple_choice', vb: { x: [-3, 9], y: [-5, 7] },
    finalLine: '따라서 양수 a의 값은 3, 정답은 ③입니다.',
    steps: [
      { latex: '점 (a,1)을 중심으로 하고 점 (0,-3)을 지나는 반지름 5인 원에서 양수 a를 구합니다.', objects: [] },
      { latex: '중심은 (a,1), 원은 점 (0,-3)을 지나고 반지름은 5 입니다.',
        objects: [point([3, 1], '(a,1)', HL), point([0, -3], '(0,-3)')] },
      { latex: '반지름^2 = (중심)-(지나는 점) 거리^2 = a^2+(1+3)^2 = a^2+16.',
        objects: [circle([3, 1], 5, MAIN, 0.1), seg([3, 1], [0, -3], 'r=5')] },
      { latex: 'a^2+16 = 25 → a^2 = 9 → a = 3 (양수).', objects: [] },
      { latex: '따라서 a = 3 입니다.', objects: [] },
    ],
  },
  '003': {
    answer: '1', answerType: 'short_answer', vb: { x: [-3, 3], y: [0, 6] },
    finalLine: '넓이가 최대인 원의 반지름은 1입니다.',
    steps: [
      { latex: '방정식이 원을 나타낼 때, 넓이가 최대인 원의 반지름을 구합니다.', objects: [] },
      { latex: 'x^2+y^2-6y+k^2-8k+24=0 → x^2+(y-3)^2 = -k^2+8k-15. 중심 (0,3).', objects: [] },
      { latex: '반지름^2 = -k^2+8k-15 = -(k-4)^2+1 이므로 k=4일 때 최대 1.', objects: [] },
      { latex: '최대 반지름 r=1 (k=4일 때 원 x^2+(y-3)^2=1).',
        objects: [circle([0, 3], 1, MAIN, 0.14), point([0, 3], '(0,3)')] },
      { latex: '따라서 넓이가 최대인 원의 반지름은 1입니다.', objects: [] },
    ],
  },
  '004': {
    answer: '1', answerType: 'short_answer', vb: { x: [-3, 3], y: [-1, 5] },
    finalLine: '넓이가 최대인 원의 반지름은 1입니다.',
    steps: [
      { latex: '방정식이 원을 나타낼 때, 넓이가 최대인 원의 반지름을 구합니다.', objects: [] },
      { latex: 'x^2+y^2-4y+k^2-4k+7=0 → x^2+(y-2)^2 = -k^2+4k-3. 중심 (0,2).', objects: [] },
      { latex: '반지름^2 = -k^2+4k-3 = -(k-2)^2+1 이므로 k=2일 때 최대 1.', objects: [] },
      { latex: '최대 반지름 r=1 (k=2일 때 원 x^2+(y-2)^2=1).',
        objects: [circle([0, 2], 1, MAIN, 0.14), point([0, 2], '(0,2)')] },
      { latex: '따라서 넓이가 최대인 원의 반지름은 1입니다.', objects: [] },
    ],
  },
  '005': {
    answer: '12', answerType: 'multiple_choice', vb: { x: [-3, 13], y: [-1, 20] },
    finalLine: '두 중심 (11,10), (-1,10) 사이의 거리는 12, 정답은 ③입니다.',
    steps: [
      { latex: '두 점 (5,2), (5,18)을 지나고 x축에 접하는 두 원의 중심 사이 거리를 구합니다.', objects: [] },
      { latex: '두 점은 x좌표가 같으므로 중심은 두 점의 수직이등분선 y=10 위에 있습니다.',
        objects: [point([5, 2], '(5,2)'), point([5, 18], '(5,18)')] },
      { latex: 'x축에 접하므로 반지름 = 중심의 y좌표 = 10. 중심 (h,10), (h-5)^2+8^2=10^2.', objects: [] },
      { latex: '(h-5)^2=36 → h=11 또는 h=-1. 중심은 (11,10), (-1,10).',
        objects: [circle([11, 10], 10, MAIN, 0.06), circle([-1, 10], 10, SEC, 0.06),
                  point([11, 10], 'C_1'), point([-1, 10], 'C_2'), seg([11, 10], [-1, 10], '12')] },
      { latex: '중심 사이 거리 = |11-(-1)| = 12 입니다.', objects: [] },
    ],
  },
  '006': {
    answer: '6', answerType: 'multiple_choice', vb: { x: [-3, 5], y: [-7, 1] },
    finalLine: '두 반지름 1과 5의 합은 6, 정답은 ①입니다.',
    steps: [
      { latex: '두 점 (3,-2), (2,-1)을 지나고 x축에 접하는 두 원의 반지름의 합을 구합니다.', objects: [] },
      { latex: '두 점이 x축 아래 → 중심 (h,k), 반지름 r=-k. 원: (x-h)^2+(y-k)^2=k^2.',
        objects: [point([3, -2], '(3,-2)'), point([2, -1], '(2,-1)')] },
      { latex: '두 점을 대입해 정리하면 h=k+4, k^2+6k+5=0.', objects: [] },
      { latex: 'k=-1 또는 k=-5 → 중심 (3,-1) 반지름 1, 중심 (-1,-5) 반지름 5.',
        objects: [circle([3, -1], 1, MAIN, 0.12), point([3, -1], '(3,-1)'),
                  circle([-1, -5], 5, SEC, 0.08), point([-1, -5], '(-1,-5)')] },
      { latex: '반지름의 합 = 1+5 = 6 입니다.', objects: [] },
    ],
  },
  '012': {
    answer: '21', answerType: 'short_answer', vb: { x: [-1, 6], y: [-1, 7] },
    finalLine: 'M=7, m=3 이므로 Mm=21 입니다.',
    steps: [
      { latex: '원 위의 점에서 √(x^2+y^2)(=원점까지 거리)의 최댓값 M, 최솟값 m의 곱을 구합니다.', objects: [] },
      { latex: '(x-3)^2+(y-4)^2=4 → 중심 C(3,4), 반지름 2. O는 원점.',
        objects: [circle([3, 4], 2, MAIN, 0.12), point([3, 4], 'C(3,4)'), point([0, 0], 'O')] },
      { latex: 'OC = √(3^2+4^2) = √25 = 5. 거리는 OC±r 사이에서 변합니다.',
        objects: [seg([0, 0], [3, 4], '5')] },
      { latex: '최댓값 M=OC+r=5+2=7, 최솟값 m=OC-r=5-2=3.',
        objects: [seg([0, 0], [4.2, 5.6], null), point([4.2, 5.6], 'M=7', HL), point([1.8, 2.4], 'm=3')] },
      { latex: 'Mm = 7·3 = 21 입니다.', objects: [] },
    ],
  },
  '014': {
    answer: '10+10\\sqrt{2}', answerType: 'short_answer', vb: { x: [-5, 5], y: [-5, 5] },
    finalLine: '삼각형 ABP의 넓이의 최댓값은 10+10√2 입니다.',
    steps: [
      { latex: '원 위의 점 P에 대하여 삼각형 ABP의 넓이의 최댓값을 구합니다.', objects: [] },
      { latex: '원 x^2+y^2=20 (중심 O, 반지름 2√5), A(-2,-4), B(4,-2).',
        objects: [circle([0, 0], 4.472, MAIN, 0.08), point([-2, -4], 'A'), point([4, -2], 'B')] },
      { latex: 'AB=2√10 (고정). 넓이 최대 ⇔ P가 직선 AB에서 가장 멀 때.',
        objects: [seg([-2, -4], [4, -2], null)] },
      { latex: 'O에서 AB까지 거리 √10, 최대 높이 = √10+2√5. P는 그 지점.',
        objects: [point([-1.414, 4.243], 'P', HL), poly([[-2, -4], [4, -2], [-1.414, 4.243]])] },
      { latex: '최댓값 = 1/2·2√10·(√10+2√5) = 10+10√2 입니다.', objects: [] },
    ],
  },
  '015': {
    answer: '6', answerType: 'multiple_choice', vb: { x: [-1, 8], y: [-4, 4] },
    finalLine: '삼각형 PAB의 최대 넓이는 6, 정답은 ③입니다.',
    steps: [
      { latex: 'AP:BP=1:2를 만족하는 점 P가 그리는 삼각형 PAB의 최대 넓이를 구합니다.', objects: [] },
      { latex: 'A(3,0), B(0,3). AP:BP=1:2 → 점 P는 아폴로니우스 원 위를 움직입니다.',
        objects: [point([3, 0], 'A'), point([0, 3], 'B')] },
      { latex: '4·AP^2=BP^2 정리 → (x-4)^2+(y+1)^2=8. 중심 (4,-1), 반지름 2√2.',
        objects: [circle([4, -1], 2.828, MAIN, 0.1), fplot('3 - x', SEG)] },
      { latex: '직선 AB가 원의 중심을 지나므로 최대 높이 = 반지름 2√2.',
        objects: [point([6, 1], 'P', HL), poly([[3, 0], [0, 3], [6, 1]])] },
      { latex: '최대 넓이 = 1/2·AB·r = 1/2·3√2·2√2 = 6 입니다.', objects: [] },
    ],
  },
  '016': {
    answer: '15', answerType: 'short_answer', vb: { x: [-1, 9], y: [-7, 5] },
    finalLine: '삼각형 ABP의 넓이의 최댓값은 15 입니다.',
    steps: [
      { latex: 'AP:BP=1:2를 만족하는 점 P에 대하여 삼각형 ABP의 넓이의 최댓값을 구합니다.', objects: [] },
      { latex: 'A(3,0), B(0,-6). 점 P는 아폴로니우스 원 위를 움직입니다.',
        objects: [point([3, 0], 'A'), point([0, -6], 'B')] },
      { latex: '4·AP^2=BP^2 정리 → (x-4)^2+(y-2)^2=20. 중심 (4,2), 반지름 2√5.',
        objects: [circle([4, 2], 4.472, MAIN, 0.1), fplot('2*x - 6', SEG)] },
      { latex: '직선 AB가 원의 중심을 지나므로 최대 높이 = 반지름 2√5.',
        objects: [point([8, 0], 'P', HL), poly([[3, 0], [0, -6], [8, 0]])] },
      { latex: '최대 넓이 = 1/2·AB·r = 1/2·3√5·2√5 = 15 입니다.', objects: [] },
    ],
  },
  '017': {
    answer: '3', answerType: 'multiple_choice', vb: { x: [-4, 12], y: [-15, 5] },
    finalLine: '도형 C 위의 점과 원점 사이의 거리의 최솟값은 3, 정답은 ③입니다.',
    steps: [
      { latex: '외분점이 그리는 도형 C 위의 점과 원점 사이의 거리의 최솟값을 구합니다.', objects: [] },
      { latex: 'A(-3,4), P(a,b)는 원 x^2+y^2=9 위의 점.',
        objects: [point([-3, 4], 'A', HL), circle([0, 0], 3, LITE, 0.06), point([0, 0], 'O')] },
      { latex: 'AP를 4:3으로 외분한 점 Q=4P-3A → 자취 C: (X-9)^2+(Y+12)^2=144. 중심 (9,-12), 반지름 12.',
        objects: [circle([9, -12], 12, MAIN, 0.08), point([9, -12], '(9,-12)')] },
      { latex: '원점과 C의 중심 거리 = √(9^2+12^2) = 15. 최소 거리 = 15-12.',
        objects: [seg([0, 0], [9, -12], '15'), point([1.8, -2.4], '최소=3', PT)] },
      { latex: '최솟값 = 15-12 = 3 입니다.', objects: [] },
    ],
  },
  '018': {
    answer: '4', answerType: 'multiple_choice', vb: { x: [-13, 2], y: [-2, 11] },
    finalLine: '도형 C 위의 점과 원점 사이의 거리의 최솟값은 4, 정답은 ④입니다.',
    steps: [
      { latex: '외분점이 그리는 도형 C 위의 점과 원점 사이의 거리의 최솟값을 구합니다.', objects: [] },
      { latex: 'A(3,-4), P(a,b)는 원 x^2+y^2=4 위의 점.',
        objects: [point([3, -4], 'A', HL), circle([0, 0], 2, LITE, 0.06), point([0, 0], 'O')] },
      { latex: 'AP를 3:2로 외분한 점 Q=3P-2A → 자취 C: (X+6)^2+(Y-8)^2=36. 중심 (-6,8), 반지름 6.',
        objects: [circle([-6, 8], 6, MAIN, 0.08), point([-6, 8], '(-6,8)')] },
      { latex: '원점과 C의 중심 거리 = √(6^2+8^2) = 10. 최소 거리 = 10-6.',
        objects: [seg([0, 0], [-6, 8], '10'), point([-2.4, 3.2], '최소=4', PT)] },
      { latex: '최솟값 = 10-6 = 4 입니다.', objects: [] },
    ],
  },
  '021': {
    answer: '-1', answerType: 'short_answer', vb: { x: [-3, 3], y: [-1, 5] },
    finalLine: '공통현의 기울기가 1이고 수직 조건에서 a=-1 입니다.',
    steps: [
      { latex: '두 원의 교점을 지나는 직선이 직선 y=ax-7과 수직일 때 a를 구합니다.', objects: [] },
      { latex: '두 원: x^2+y^2-3y=0, x^2+y^2+2x-5y+7=0.',
        objects: [circle([0, 1.5], 1.5, MAIN, 0.08), circle([-1, 2.5], 0.5, LITE, 0.12)] },
      { latex: '두 식을 빼면 교점을 지나는 직선(공통현): 2x-2y+7=0, 기울기 1.',
        objects: [fplot('x + 3.5', SEG)] },
      { latex: 'y=ax-7 (기울기 a)과 수직 → 기울기의 곱 = -1 → 1·a = -1.', objects: [] },
      { latex: '따라서 a = -1 입니다.', objects: [] },
    ],
  },
  '022': {
    answer: '-3', answerType: 'short_answer', vb: { x: [-1, 5], y: [-1, 6] },
    finalLine: '공통현의 기울기가 1/3이고 수직 조건에서 a=-3 입니다.',
    steps: [
      { latex: '두 원의 교점을 지나는 직선이 직선 y=ax+8과 수직일 때 a를 구합니다.', objects: [] },
      { latex: '두 원: x^2+y^2-4x=0, x^2+y^2-2x-6y+5=0.',
        objects: [circle([2, 0], 2, MAIN, 0.08), circle([1, 3], 2.236, LITE, 0.06)] },
      { latex: '두 식을 빼면 교점을 지나는 직선(공통현): -2x+6y-5=0, 기울기 1/3.',
        objects: [fplot('x/3 + 0.8333', SEG)] },
      { latex: 'y=ax+8 (기울기 a)과 수직 → 기울기의 곱 = -1 → (1/3)·a = -1.', objects: [] },
      { latex: '따라서 a = -3 입니다.', objects: [] },
    ],
  },
  '025': {
    answer: '28', answerType: 'multiple_choice', vb: { x: [-4, 4], y: [-4, 4] },
    finalLine: 'k=6과 k=22의 합은 28, 정답은 ④입니다.',
    steps: [
      { latex: '두 원의 공통인 현의 길이가 2√6이 되도록 하는 모든 실수 k의 합을 구합니다.', objects: [] },
      { latex: '원1 중심 (-1,-1) r1^2=2+k, 원2 중심 (1,1) r2^2=8.',
        objects: [circle([1, 1], 2.828, MAIN, 0.06), point([1, 1], '(1,1)'),
                  circle([-1, -1], 2.828, SEC, 0.06), point([-1, -1], '(-1,-1)')] },
      { latex: '공통현(근축): 4x+4y+(6-k)=0. 원2에서 r2^2-d^2 = (√6)^2 = 6 → d=√2.', objects: [] },
      { latex: '(14-k)^2/32 = 2 → (14-k)^2=64 → k=6 또는 k=22.', objects: [] },
      { latex: '모든 k의 합 = 6+22 = 28 입니다.', objects: [] },
    ],
  },
  '028': {
    answer: '1', answerType: 'multiple_choice', vb: { x: [-4, 2], y: [-3, 4] },
    finalLine: '공통현이 둘째 원의 중심을 지나는 조건에서 a^2=1, 정답은 ①입니다.',
    steps: [
      { latex: '원 C1이 원 C2의 둘레를 이등분할 때 a^2의 값을 구합니다.', objects: [] },
      { latex: 'C1: x^2+y^2+2ax+2y-6=0, C2: x^2+y^2+2x-2ay-2=0 (중심 (-1,a)).',
        objects: [circle([-1, 1], 2, MAIN, 0.08), point([-1, 1], 'C2중심'),
                  circle([-1, -1], 2.828, SEC, 0.06)] },
      { latex: '둘레를 이등분 → 공통현이 C2의 중심을 지난다. 공통현: (a-1)x+(a+1)y-2=0.',
        objects: [fplot('1 + 0*x', SEG)] },
      { latex: 'C2의 중심 (-1,a) 대입 → a^2-1=0.', objects: [] },
      { latex: '따라서 a^2 = 1 입니다.', objects: [] },
    ],
  },
};

let written = 0;
for (const [num, prob] of Object.entries(PROBLEMS)) {
  const doc = {
    type: 'geometry',
    viewBox: prob.vb,
    base_figure: { preset: 'custom', viewBox: prob.vb, objects: [{ type: 'axes' }] },
    figure_avs_fixed: true,
    steps: prob.steps.map((s, i) => ({ step: i + 1, label: STEP_LABELS[i], latex: s.latex, objects: s.objects })),
    finalAnswer: prob.answer,
    correctAnswer: prob.answer,
    answerType: prob.answerType,
    explanationFinalLine: prob.finalLine,
    status: 'complete',
    pcbsa_completed: true,
    manual_review_required: false,
    layer: 'render',
  };
  fs.writeFileSync(path.join(OUT_DIR, `${num}.json`), JSON.stringify(doc, null, 1));
  written++;
  console.log(`✅ ${num}.json  (정답: ${prob.answer})`);
}
console.log(`\n총 ${written}개 파일 작성 → ${OUT_DIR}`);
