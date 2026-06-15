/**
 * 삼각함수활용 4단계 — 마지막 검수 9개(010·022·025·030·033·036·042·049·066) 정답확정.
 * 원본 크롭(public/math_crops/수학1 중간/4단계/삼각함수활용 4단계(68)/)을 직접 읽어 전수 풀이.
 * 손풀이 정답: 010=ㄱㄴㄷ(⑤) 022=ㄴㄷ(④) 025=50 030=36+30√3(④) 033=21(①)
 *             036=4√3(②) 042=22 049=45/2(⑤) 066=63
 * 도형은 문제 이해용(좌표는 근사 허용). 기존 검수 placeholder 덮어씀.
 */
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', '..', 'public', 'math_hints', '삼각함수활용4단계');
const MAIN = '#3b82f6', SEC = '#ec4899', LITE = '#60a5fa', PT = '#22c55e', HL = '#ef4444', SEG = '#f59e0b';
const C = (c, r, col = MAIN) => ({ type: 'circle', center: c, radius: r, color: col, fillOpacity: 0.06 });
const G = (pts) => ({ type: 'polygon', points: pts, color: LITE, fillOpacity: 0.06 });
const P = (c, l, col = PT) => ({ type: 'point', coords: c, label: l, color: col });
const S = (a, b) => ({ type: 'segment', from: a, to: b, color: SEG, style: 'dashed', weight: 1.5 });
const L = ['P: 문제에서 구하는 것 확인', 'C: 조건/단서 정리', 'B: 필요한 배경개념/공식', 'S: 식 변형/구조 분석', 'A: 계산 적용 및 최종 정답 도출'];

const Q = {
  '010': { a: 'ㄱ, ㄴ, ㄷ', t: 'multiple_choice', vb: { x: [-2, 2], y: [-2, 2] }, fl: 'R=√3, BD=√3 → ∠BAC=60°, BC=3. ㄱ sin∠DBE=1/2, ㄴ AB²+AC²=AB·AC+9, ㄷ ΣBE=9/4 — 모두 참, 정답 ⑤.', s: [
    ['<보기> ㄱ,ㄴ,ㄷ 중 옳은 것을 모두 고릅니다.', []],
    ['반지름 √3 원에 내접한 △ABC. ∠BAC 이등분선과 원의 교점 D, BC∩AD=E, BD=√3.', [C([0, 0], 1.73), P([0.3, 1.7], 'C'), P([1.6, 0.5], 'D', HL), P([-1.5, -0.85], 'A'), P([1.3, -1.1], 'B'), P([0.1, -0.25], 'E', SEC)]],
    ['BD=2R sin∠BAD → √3=2√3 sin∠BAD → ∠BAD=30°, ∠BAC=60°. BC=2R sin60°=3.', []],
    ['ㄱ: ∠DBE=∠DAC=30° → sin∠DBE=1/2 (참). ㄴ: BC²=9=AB²+AC²−AB·AC (참).', []],
    ['ㄷ: ∠ABC=4·넓이 조건 → h²−(3√3/2)h+1=0, ΣBE=(√3/2)·(3√3/2)=9/4 (참) → ⑤.', []],
  ] },
  '022': { a: 'ㄴ, ㄷ', t: 'multiple_choice', vb: { x: [-1, 5], y: [-1, 5] }, fl: 'q=1−2p, CR=p. ㄴ QR=√3·AP(참), ㄷ 외접원2배→3p²+3p−1=0→AP=(√21−3)/6(참), ㄱ 3AP+2BQ=2−p≠2(거짓) → 정답 ④.', s: [
    ['<보기> 중 옳은 것을 모두 고릅니다.', []],
    ['한 변 1인 정삼각형 ABC. P∈AB, Q∈BC, R∈CA, AP+BQ+CR=1, PQ=PR.', [G([[0, 0], [4, 0], [2, 3.46]]), P([0, 0], 'A'), P([4, 0], 'B'), P([2, 3.46], 'C'), P([1.2, 0], 'P', HL), P([3, 1.73], 'Q', HL), P([1.4, 2.42], 'R', HL)]],
    ['AP=p, BQ=q, CR=r, p+q+r=1. PQ²=PR² 정리 → q=1−2p, r=p → CR=AP.', []],
    ['ㄴ: QC=2p, CR=p, ∠C=60° → QR²=4p²+p²−2p²=3p² → QR=√3·AP (참).', []],
    ['ㄷ: 외접원 R₁²/R₂²=(3p²−3p+1)/(3p²)=2 → 3p²+3p−1=0 → AP=(√21−3)/6 (참). ㄱ 거짓 → ④.', []],
  ] },
  '025': { a: '50', t: 'short_answer', vb: { x: [-2, 4], y: [-1, 4] }, fl: 'y=x 대칭 → A(α,β),B(β,α). β=α(1+√2), α²+β²=α+β → α=1/2. t=1+√2/2, a=(3+2√2)/4 → t−a=1/4, 200(t−a)=50.', s: [
    ['200(t−a)의 값을 구합니다.', []],
    ['y=−x+t가 y=aˣ, y=log_a x와 만나는 점 A, B. A의 x축 수선의 발 H.', [P([0, 0], 'O'), P([0.7, 1.8], 'A', HL), P([1.8, 0.7], 'B', HL), P([0.7, 0], 'H', SEC), S([0.7, 1.8], [0.7, 0]), S([-0.5, 3], [3, -0.5])]],
    ['두 곡선은 y=x 대칭 → A(α,β)이면 B(β,α), α+β=t.', []],
    ['(가) OH:AB=1:2 → β=α(1+√2). (나) 외접원 R=√2/2 → α²+β²=α+β.', []],
    ['연립 → α=1/2, β=(1+√2)/2. t=1+√2/2, a=√a=β → a=(3+2√2)/4. t−a=1/4 → 200(t−a)=50.', []],
  ] },
  '030': { a: '36+30\\sqrt{3}', t: 'multiple_choice', vb: { x: [-5, 6], y: [-5, 5] }, fl: 'AB=5√3,BC=8√3,AC=7√3, 원O 반지름 3√3, A→BC 거리 7.5 → 최대넓이 ½·8√3·(7.5+3√3)=36+30√3, 정답 ④.', s: [
    ['삼각형 PBC 넓이의 최댓값을 구합니다.', []],
    ['△ABC, AD:DB=3:2, 중심 A·반지름 AD인 원 O가 AC와 만나는 점 E. sinA:sinC=8:5, △ADE:△ABC=9:35, 외접원 R=7.', [C([-1, 0.5], 3, SEC), G([[-1, 0.5], [-2.5, -3.5], [4.5, -2.5]]), P([-1, 0.5], 'A'), P([-2.5, -3.5], 'B'), P([4.5, -2.5], 'C'), P([1.5, -1], 'E', HL), P([-1.6, -1.1], 'D', HL)]],
    ['AB=(5/3)AD, △ADE/△ABC=AD²/(AB·AC)=9/35 → r_O=(3/7)AC, AB=(5/7)AC.', []],
    ['sinA:sinC=8:5 → BC:AB=8:5. AB=5k,BC=8k,AC=7k, cosA=1/7, sinA=4√3/7. R=7k/√3=7 → k=√3.', []],
    ['AB=5√3,BC=8√3,AC=7√3. A→BC 거리=2·30√3/8√3=7.5. 최대=½·8√3·(7.5+3√3)=36+30√3 → ④.', []],
  ] },
  '033': { a: '21', t: 'multiple_choice', vb: { x: [-5, 5], y: [-5, 5] }, fl: 'R=9(=AO). O,O′ 모두 AC 수직이등분선 위 → AC=45√7/7, OM=9√21/14, O′M=5√21/14, 반대편 → OO′=√21, OO′²=21, 정답 ①.', s: [
    ['OO′²의 값을 구합니다.', []],
    ['BC=36√7/7, sin∠BAC=2√7/7, ∠ACB=π/3. 외심 O, 직선 AO∩BC=D. △ADC 외심 O′, AO′=5√3.', [C([0, 0.3], 3.2), C([2, 0.6], 2), P([-0.5, 3.4], 'A'), P([-2.8, -1.5], 'B'), P([2.9, -1.4], 'C'), P([0, 0.3], 'O', HL), P([2, 0.6], "O'", SEC), P([0.6, -1.5], 'D', HL)]],
    ['R=BC/(2sin∠BAC)=9=AO. O, O′ 모두 공통현 AC의 수직이등분선 위에 있다.', []],
    ['AC=2R sin∠ABC=45√7/7. OM=√(R²−(AC/2)²)=9√21/14, O′M=√(75−(AC/2)²)=5√21/14.', []],
    ['O,O′가 AC 반대편 → OO′=OM+O′M=√21 → OO′²=21 → ①.', []],
  ] },
  '036': { a: '4\\sqrt{3}', t: 'multiple_choice', vb: { x: [-4, 4], y: [-4, 4] }, fl: '2AB=BC, cos∠ABC=−5/8, QA=6√10 → AB=6,BC=12. △CDB에서 BC=12 대변, ∠CDB=2π/3 → R=12/(2sin120°)=4√3, 정답 ②.', s: [
    ['삼각형 CDB 외접원의 반지름을 구합니다.', []],
    ['2AB=BC, cos∠ABC=−5/8. 외접원 O, △PAC 넓이 최대점 Q에서 QA=6√10. D∈AC, ∠CDB=2π/3.', [C([0, 0], 3), G([[0.5, 2.95], [-2.9, -0.7], [2.6, 1.5]]), P([0.5, 2.95], 'A'), P([-2.9, -0.7], 'B'), P([2.6, 1.5], 'C'), P([-2.6, 1.4], 'P', SEC), P([1.5, 2.2], 'D', HL)]],
    ['AC²=AB²+BC²−2·AB·BC·cos∠ABC=(15/2)AB². QA²=10·AB²=360 → AB=6, BC=12.', []],
    ['△CDB: BC=12은 ∠CDB의 대변. 외접원 R=BC/(2 sin∠CDB).', []],
    ['R=12/(2 sin(2π/3))=12/√3=4√3 → ②.', []],
  ] },
  '042': { a: '22', t: 'short_answer', vb: { x: [-3, 3.5], y: [-1, 9] }, fl: 'OP=8,OQ=7. P(2,2√15),Q(−7/4,7√15/4). 신발끈 넓이=(11/2)√15 → q/p=11/2, pq=22.', s: [
    ['사각형 OAPQ 넓이=q/p·√15일 때 pq를 구합니다.', []],
    ['O(0,0), A(2,0). y좌표 양수인 P,Q: AP=AQ=2√15, OP>OQ, cos∠OPA=cos∠OQA=√15/4.', [G([[0, 0], [2, 0], [2, 7.75], [-1.75, 6.77]]), P([0, 0], 'O'), P([2, 0], 'A'), P([2, 7.75], 'P'), P([-1.75, 6.77], 'Q')]],
    ['△OPA 코사인법칙: 4=OP²+60−15·OP → OP²−15OP+56=0 → OP=8, OQ=7.', []],
    ['AP=2√15, OP=8 → P=(2, 2√15). OQ=7 → Q=(−7/4, 7√15/4).', []],
    ['신발끈 공식 → 넓이=(11/2)√15 → q=11, p=2, pq=22.', []],
  ] },
  '049': { a: '\\frac{45}{2}', t: 'multiple_choice', vb: { x: [-4, 4], y: [-4, 4] }, fl: '(가)f(k)=100−k², BC·CD=100−k² → 넓이=50sin∠BAD=40 → sin∠BAD=4/5(p), BD:R=8/5(q). f(10p)=f(8)=36 → 36/(8/5)=45/2, 정답 ⑤.', s: [
    ['f(10p)/q의 값을 구합니다.', []],
    ['반지름 R(5<R<5√5) 원에 내접한 ABCD. AB=AD, AC=10, 넓이=40.', [C([0, 0], 3), G([[-1.5, 2.6], [-2.5, -1.65], [2.9, 0.8], [1.2, 2.75]]), P([-1.5, 2.6], 'A'), P([-2.5, -1.65], 'B'), P([2.9, 0.8], 'C'), P([1.2, 2.75], 'D')]],
    ['코사인법칙: cos∠ACB=(1/20)(BC+(100−k²)/BC) → (가) f(k)=100−k². ∠ACB=∠DCA → BC·CD=100−k².', []],
    ['넓이=½sin∠BAD(k²+BC·CD)=½·100·sin∠BAD=40 → sin∠BAD=4/5 (나=p).', []],
    ['BD=2R sin∠BAD → BD:R=8/5 (다=q). f(10p)=f(8)=36 → 36÷(8/5)=45/2 → ⑤.', []],
  ] },
  '066': { a: '63', t: 'short_answer', vb: { x: [-4, 4], y: [-4, 4] }, fl: '∠ADC=∠ABC=α. 넓이비+Ptolemy → AD=6, BC=5. S=½·AD·DC·sinα=½·6·4·(√7/4)=3√7 → S²=63.', s: [
    ['삼각형 ADC 넓이 S에 대해 S²을 구합니다.', []],
    ['예각 △ABC 원에 내접. AB=6, cos∠ABC=3/4. 호 BC 위의 D에 CD=4. △ABD:△CBD=9:5.', [C([0, 0], 3), G([[1.5, 2.6], [-2.8, 0.8], [-1, -2.8], [2.4, -1.8]]), P([1.5, 2.6], 'A'), P([-2.8, 0.8], 'B'), P([-1, -2.8], 'D', HL), P([2.4, -1.8], 'C')]],
    ['∠BAD=∠BCD(호 BD) → △ABD/△CBD=(AB·AD)/(CB·CD)=9/5 → AD/CB=6/5.', []],
    ['Ptolemy(AD·BC=AB·DC+BD·CA)와 연립 → AD=6, BC=5.', []],
    ['∠ADC=∠ABC=α(호 AC), sinα=√7/4. S=½·AD·DC·sinα=½·6·4·√7/4=3√7 → S²=63.', []],
  ] },
};

let n = 0;
for (const [num, q] of Object.entries(Q)) {
  const doc = {
    type: 'geometry', viewBox: q.vb,
    base_figure: { preset: 'custom', viewBox: q.vb, objects: [{ type: 'axes' }] },
    figure_avs_fixed: true,
    steps: q.s.map(([latex, objects], i) => ({ step: i + 1, label: L[i], latex, objects })),
    finalAnswer: q.a, correctAnswer: q.a, answerType: q.t,
    explanationFinalLine: q.fl,
    status: 'complete', pcbsa_completed: true, manual_review_required: false,
    recovered_from: 'original_crop', layer: 'render',
  };
  fs.writeFileSync(path.join(OUT, `${num}.json`), JSON.stringify(doc, null, 1));
  console.log(`✅ ${num}  정답: ${q.a}`); n++;
}
console.log(`\n마지막 ${n}개 정답확정 → ${OUT}`);
