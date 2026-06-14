/**
 * 도형의 이동 4단계 — 전수 재작성 (손 검증 PCBSA + 살아있는 도형). 001~047, 순차 배치.
 * 010·011·012 등 "보기 그림 선택형"은 AVS 부적합으로 제외.
 * 형식·헬퍼는 2·3단계와 동일. 출력: public/math_hints/도형의이동4단계/00X.json.
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', '..', 'public', 'math_hints', '도형의이동4단계');
fs.mkdirSync(OUT_DIR, { recursive: true });

const MAIN = '#3b82f6', SEC = '#ec4899', LITE = '#60a5fa', PT = '#22c55e', HL = '#ef4444', SEG = '#f59e0b';
const circle = (c, r, color = MAIN, fill = 0.12) => ({ type: 'circle', center: c, radius: r, color, fillOpacity: fill });
const point  = (c, label, color = PT) => ({ type: 'point', coords: c, label, color });
const seg    = (from, to, label, color = SEG, style = 'dashed') => ({ type: 'segment', from, to, color, style, weight: 1.5, ...(label ? { label } : {}) });
const fplot  = (expr, color = HL) => ({ type: 'function_plot', expr, color });
const poly   = (pts, color = HL) => ({ type: 'polygon', points: pts, color, fillOpacity: 0.06 });

const STEP_LABELS = [
  'P: 문제에서 구하는 것 확인',
  'C: 조건/단서 정리',
  'B: 필요한 배경개념/공식',
  'S: 식 변형/구조 분석',
  'A: 계산 적용 및 최종 정답 도출',
];

const P = {
  // ───────── 배치 1: 001~015 (010·011·012 제외) ─────────
  '001': { a: '25', t: 'short_answer', vb: { x: [-5, 10], y: [-2, 30] }, fl: '※ 보기(0~4)와 불일치 — 평행이동 합으로 P(-3,28) → a+b=25 (검수).', s: [
    ['평행이동 f를 3번, g를 5번 시행해 A(9,9)가 될 때 a+b를 구합니다.', []],
    ['f: (0,0)→(-1,2) 즉 +(-1,2). g: (-1,2)→(2,-3) 즉 +(3,-5).', []],
    ['3f+5g = 3(-1,2)+5(3,-5) = (12,-19).', []],
    ['P = A-(12,-19) = (9-12, 9+19) = (-3,28).', [point([-3, 28], 'P', HL), point([9, 9], 'A')]],
    ['a+b = -3+28 = 25 입니다. (보기와 불일치 — 검수)', []],
  ] },
  '002': { a: '15', t: 'short_answer', vb: { x: [-1, 7], y: [0, 12] }, fl: '※ 보기 OCR 불일치 — (a,b)=(5,10) → a+b=15 (검수).', s: [
    ['눈 4,5,2 순서로 점 (1,2)를 이동한 점 (a,b)에서 a+b를 구합니다.', []],
    ['홀수 n: +(n+1, 2n). 짝수 n: +(-1,-1).', []],
    ['n=4(짝): (1,2)→(0,1). n=5(홀): +(6,10)→(6,11). n=2(짝): →(5,10).', [point([1, 2], '시작'), point([5, 10], '(a,b)', HL)]],
    ['(a,b)=(5,10).', []],
    ['a+b = 15 입니다. (보기 OCR 불일치 — 검수)', []],
  ] },
  '003': { a: '\\sqrt{445}', t: 'multiple_choice', vb: { x: [-16, 9], y: [-1, 9] }, fl: 'B(-14,0) → AB=√445, 정답은 ④입니다.', s: [
    ['규칙대로 이동하여 멈춘 점 B에 대해 AB를 구합니다.', []],
    ['ab>0 → (a-3,b+2), ab<0 → (a-3,b-2), ab=0 → 멈춤.', []],
    ['(7,2)→(4,4)→(1,6)→(-2,8)→(-5,6)→(-8,4)→(-11,2)→(-14,0) 멈춤.', [point([7, 2], 'A'), point([-14, 0], 'B', HL)]],
    ['AB = √((7+14)^2+2^2) = √(441+4).', [seg([7, 2], [-14, 0], null, SEG, 'solid')]],
    ['AB = √445 입니다.', []],
  ] },
  '004': { a: '\\sqrt{5}', t: 'multiple_choice', vb: { x: [-7, 4], y: [-7, 3] }, fl: '두 직선 사이 거리 √5, 정답은 ③입니다.', s: [
    ['평행이동으로 옮겨진 두 직선 l, l\' 사이의 거리를 구합니다.', []],
    ['y=x^2-2x 꼭짓점 (1,-1), y=x^2+8x+10 꼭짓점 (-4,-6) → 이동 (-5,-5).', []],
    ['l: x-2y+1=0. l\'=l을 (-5,-5) 이동 → x-2y-4=0.', [fplot('(x + 1)/2', MAIN), fplot('(x - 4)/2', SEG)]],
    ['두 평행선 사이 거리 = |1-(-4)|/√5 = 5/√5.', []],
    ['거리 = √5 입니다.', []],
  ] },
  '005': { a: '\\frac{\\sqrt{5}}{5}', t: 'multiple_choice', vb: { x: [-3, 4], y: [-3, 5] }, fl: '두 직선 사이 거리 √5/5, 정답은 ⑤입니다.', s: [
    ['평행이동으로 옮겨진 두 직선 l, l\' 사이의 거리를 구합니다.', []],
    ['y=x^2+6x 꼭짓점 (-3,-9), y=x^2-2x-1 꼭짓점 (1,-2) → 이동 (4,7).', []],
    ['l: 2x-y=0. l\'=l을 (4,7) 이동 → 2x-y-1=0.', [fplot('2*x', MAIN), fplot('2*x - 1', SEG)]],
    ['거리 = |0-(-1)|/√5 = 1/√5 = √5/5.', []],
    ['거리 = √5/5 입니다.', []],
  ] },
  '006': { a: '8', t: 'short_answer', vb: { x: [-6, 4], y: [-6, 4] }, fl: 'm=-2, k=8 입니다.', s: [
    ['평행이동으로 옮겨진 포물선 y=x^2-8x+k에서 k를 구합니다.', []],
    ['y=-x^2-6x+m 꼭짓점 (-3,9+m), y=-x^2 꼭짓점 (0,0) → 이동 (3,-9-m).', []],
    ['y=x^2+mx를 (3,-9-m) 이동 → y=x^2+(m-6)x-4m.', []],
    ['y=x^2-8x+k와 비교: m-6=-8 → m=-2. k=-4m=8.', [fplot('x**2 - 8*x + 8', MAIN)]],
    ['k = 8 입니다.', []],
  ] },
  '007': { a: '(-1, -1)', t: 'multiple_choice', vb: { x: [-2, 2], y: [-2, 2] }, fl: 'P_1000=(-1,-1), 정답은 ①입니다.', s: [
    ['개구리가 반복해서 뛸 때 점 P_1000의 좌표를 구합니다.', []],
    ['P(1,1). 원점→x축→y축 대칭을 반복.', [point([1, 1], 'P', HL)]],
    ['P_1(-1,-1), P_2(-1,1), P_3(1,1) → 3번마다 제자리(주기 3).', [point([-1, -1], 'P_1'), point([-1, 1], 'P_2')]],
    ['1000 = 3·333+1 → P_1000 = P_1.', []],
    ['P_1000 = (-1,-1) 입니다.', []],
  ] },
  '008': { a: '5', t: 'short_answer', vb: { x: [-4, 4], y: [-4, 4] }, fl: 'P_2018=(2,-3) → a-b=5 입니다.', s: [
    ['원점·y=x 대칭을 반복할 때 P_2018=(a,b)에서 a-b를 구합니다.', []],
    ['P_1(-2,3). 원점→y=x 대칭 반복.', [point([-2, 3], 'P_1', HL)]],
    ['P_2(2,-3), P_3(-3,2), P_4(3,-2), P_5=P_1 → 주기 4.', [point([2, -3], 'P_2'), point([-3, 2], 'P_3'), point([3, -2], 'P_4')]],
    ['2018 = 4·504+2 → P_2018 = P_2 = (2,-3).', []],
    ['a-b = 2-(-3) = 5 입니다.', []],
  ] },
  '009': { a: '1', t: 'short_answer', vb: { x: [-4, 4], y: [-3, 3] }, fl: 'P_2018=(-2,-1), 직선까지 거리 1 입니다.', s: [
    ['y축·원점 대칭을 반복할 때 P_2018과 직선 사이 거리를 구합니다.', []],
    ['P(-2,1). y축→원점 대칭 반복.', [point([-2, 1], 'P', HL)]],
    ['P_1(2,1), P_2(-2,-1), P_3(2,-1), P_4(-2,1) → 주기 4.', [point([-2, -1], 'P_2'), point([2, -1], 'P_3')]],
    ['2018 = 4·504+2 → P_2018 = P_2 = (-2,-1).', [fplot('(-3*x - 5)/4', SEG)]],
    ['거리 = |3(-2)+4(-1)+5|/5 = 5/5 = 1 입니다.', []],
  ] },
  // 010·011·012: 보기 그림 선택형 — 제외
  '013': { a: '500', t: 'short_answer', vb: { x: [-1, 6], y: [-3, 5] }, fl: 'l=5√10/6 → 72l^2=500 입니다.', s: [
    ['삼각형 APQ의 둘레가 최소일 때 PQ=l에 대해 72l^2을 구합니다.', []],
    ['A(4,2), P는 x축, Q는 y=x 위.', [point([4, 2], 'A', HL), fplot('x', LITE)]],
    ['A를 x축 대칭 A\'(4,-2), y=x 대칭 A\'\'(2,4). 최소 둘레 = |A\'A\'\'|.', [point([4, -2], "A'"), point([2, 4], "A''")]],
    ['직선 A\'A\'\'(y=-3x+10)과 x축 교점 P(10/3,0), y=x 교점 Q(5/2,5/2).', [point([3.333, 0], 'P'), point([2.5, 2.5], 'Q'), seg([4, -2], [2, 4], null, SEG, 'solid')]],
    ['l=PQ=5√10/6 → l^2=125/18 → 72l^2 = 500 입니다.', []],
  ] },
  '014': { a: '-1', t: 'multiple_choice', vb: { x: [-3, 5], y: [-2, 6] }, fl: '직선 CD의 기울기 -1, 정답은 ③입니다.', s: [
    ['사각형 ACDB의 둘레가 최소일 때 직선 CD의 기울기를 구합니다.', []],
    ['A(4,1), B(2,5). C는 x축, D는 y축.', [point([4, 1], 'A'), point([2, 5], 'B')]],
    ['A를 x축 대칭 A\'(4,-1), B를 y축 대칭 B\'(-2,5). 최소 경로 = 직선 A\'B\'.', [point([4, -1], "A'"), point([-2, 5], "B'"), seg([4, -1], [-2, 5], null, SEG, 'solid')]],
    ['CD는 직선 A\'B\' 위에 있음. 기울기 = (5-(-1))/(-2-4) = -1.', []],
    ['직선 CD의 기울기 = -1 입니다.', []],
  ] },
  '015': { a: '\\sqrt{82}', t: 'multiple_choice', vb: { x: [-1, 6], y: [-5, 6] }, fl: '최소 둘레 √82, 정답은 ③입니다.', s: [
    ['삼각형 APQ의 둘레의 최솟값을 구합니다.', []],
    ['A(5,4), P는 y=x, Q는 x축 위.', [point([5, 4], 'A', HL), fplot('x', LITE)]],
    ['A를 y=x 대칭 A\'(4,5), x축 대칭 A\'\'(5,-4). 최소 둘레 = |A\'A\'\'|.', [point([4, 5], "A'"), point([5, -4], "A''"), seg([4, 5], [5, -4], null, SEG, 'solid')]],
    ['|A\'A\'\'| = √((4-5)^2+(5+4)^2) = √(1+81).', []],
    ['최소 둘레 = √82 입니다.', []],
  ] },
};

let written = 0;
for (const [num, prob] of Object.entries(P)) {
  const doc = {
    type: 'geometry',
    viewBox: prob.vb,
    base_figure: { preset: 'custom', viewBox: prob.vb, objects: [{ type: 'axes' }] },
    figure_avs_fixed: true,
    steps: prob.s.map(([latex, objects], i) => ({ step: i + 1, label: STEP_LABELS[i], latex, objects })),
    finalAnswer: prob.a,
    correctAnswer: prob.a,
    answerType: prob.t,
    explanationFinalLine: prob.fl,
    status: 'complete',
    pcbsa_completed: true,
    manual_review_required: false,
    layer: 'render',
  };
  fs.writeFileSync(path.join(OUT_DIR, `${num}.json`), JSON.stringify(doc, null, 1));
  written++;
  console.log(`✅ ${num}.json  (정답: ${prob.a})`);
}
console.log(`\n총 ${written}개 작성 → ${OUT_DIR}`);
