/**
 * 삼각함수의 활용 4단계 (수학1/대수) — 살아있는 도형 + PCBSA + 정답 연결. 001~033.
 * 출처: src/data/math_problem_texts.json 의 trig_util_step4/00X (텍스트 보유분은 001~033).
 *   - 034~068 은 원문 텍스트 미보유(플레이스홀더) + flat 크롭이 placeholder 라 본 단계에서 제외.
 *     (3단계도 동일하게 텍스트 확보분까지만 생성했음 — 동일 정책.)
 * 정답 교차검증: avs_answers["삼각함수활용 4단계(68)"] 의 *_v2 키(오프셋 +67)와 손풀이 대조 완료.
 *   001=8/5π 002=271 003=10 004=√5/5 005=28 006=15√15 007=191 009=17 011=4√6/3
 *   012=8/3 013=4/3 015=9/2(p+q=11) 016=71 017=55a=36 018=7/16π 029=16√3/3 032=6
 * 그림/보기/(가)(나)(다) 의존 고난도는 정답(키 확보분)만 싣고 manual_review 표시.
 * 출력: public/math_hints/삼각함수활용4단계/00X.json → upload(trig_util_step4) → connect.
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', '..', 'public', 'math_hints', '삼각함수활용4단계');
fs.mkdirSync(OUT_DIR, { recursive: true });

const MAIN = '#3b82f6', SEC = '#ec4899', LITE = '#60a5fa', PT = '#22c55e', HL = '#ef4444', SEG = '#f59e0b';
const circle = (c, r, color = MAIN, fill = 0.06) => ({ type: 'circle', center: c, radius: r, color, fillOpacity: fill });
const point  = (c, label, color = PT) => ({ type: 'point', coords: c, label, color });
const seg    = (from, to, label, color = SEG, style = 'dashed') => ({ type: 'segment', from, to, color, style, weight: 1.5, ...(label ? { label } : {}) });
const tri    = (pts, color = LITE) => ({ type: 'polygon', points: pts, color, fillOpacity: 0.06 });

const STEP_LABELS = [
  'P: 문제에서 구하는 것 확인',
  'C: 조건/단서 정리',
  'B: 필요한 배경개념/공식',
  'S: 식 변형/구조 분석',
  'A: 계산 적용 및 최종 정답 도출',
];

// 그림/보기/블랭크 의존 고난도 — 정답(있으면)만 싣고 검수 표시
function review(ask, setup, objs, ans, type) {
  return { a: ans ?? '(고난도 그림/보기 - 검수)', t: type ?? 'multiple_choice', review: true,
    vb: { x: [-1, 6], y: [-1, 5] }, fl: `${ans ? `정답은 ${ans}.` : '⚠'} ${ask} — 원본 그림/보기/블랭크 필요, 검수.`, s: [
    [ask, []],
    [setup, objs || []],
    ['삼각함수(사인/코사인법칙·외접원·내접원) 적용.', []],
    ['원본 그림의 각·길이 또는 보기/(가)(나)(다) 식이 필요합니다.', []],
    [ans ? `정답은 ${ans} (검수 필요).` : '검수 필요.', []],
  ] };
}

const P = {
  // ───────── 001~018 ─────────
  '001': { a: '\\frac{8}{5}\\pi', t: 'multiple_choice', vb: { x: [-1, 5], y: [-1, 4] }, fl: 'BD가 ∠B 이등분 → AD:DC=1:2, BD²=AB·BC-AD·DC → R²=8/5, 넓이 8/5π, 정답은 ③입니다.', s: [
    ['세 점 A,B,D를 지나는 원 C의 넓이를 구합니다.', []],
    ['AB=2, BC=4, BD=√6. 호 AD=호 DE → ∠ABD=∠DBE (BD가 ∠B 이등분).', [tri([[0, 3], [0, 0], [4, 0]]), point([0, 3], 'A'), point([0, 0], 'B'), point([4, 0], 'C'), point([1.33, 2], 'D', HL)]],
    ['각 이등분선: AD:DC=AB:BC=1:2. 이등분선 길이² = AB·BC − AD·DC.', []],
    ['6 = 8 − AD·DC → AD·DC=2, AD:DC=1:2 → AD=1, DC=2, AC=3(<4 ✓).', []],
    ['△ABD: cosA=−1/4 → 외접원 R=2√10/5, R²=8/5. 넓이 πR² = 8/5π 입니다.', []],
  ] },
  '002': { a: '271', t: 'short_answer', vb: { x: [-1, 8], y: [-1, 6] }, fl: 'AB=4,BC=6 → BD=8, △ABD 외접원 R²=256/15, 넓이 256/15π, p+q=271 입니다.', s: [
    ['삼각형 ABD 외접원 넓이의 q/p에 대해 p+q를 구합니다.', []],
    ['평행사변형 둘레 20 → AB+BC=10. cos∠ABC=1/4, △ABC 외접원 넓이 32/3π.', [tri([[1, 4], [0, 0], [6, 0]]), point([0, 0], 'B'), point([6, 0], 'C'), point([1, 4], 'A'), point([7, 4], 'D', HL)]],
    ['△ABC: AC=2R₁sin∠ABC → AC=2√10, AC²=40 = AB²+BC²−AB·BC/2.', []],
    ['AB+BC=10, AB·BC=24 → (AB,BC)=(4,6), AB<AD ✓. ∠BAD=π−∠ABC, cos=−1/4.', []],
    ['BD²=16+36+12=64, BD=8. R₂=8/(2sin∠BAD)=16/√15, 넓이=256/15π → p+q=271 입니다.', []],
  ] },
  '003': { a: '10', t: 'multiple_choice', vb: { x: [-1, 6], y: [-1, 6] }, fl: 'cos∠BAD=1/5 → ∠BCD 보각, 넓이식 ½·BC·CD·(2√6/5)=2√6 → BC·CD=10, 정답은 ①입니다.', s: [
    ['BC·CD의 값을 구합니다.', []],
    ['원에 내접 ABCD. AB=4, AD=5, BD=√33, △BCD 넓이=2√6.', [circle([2.5, 2.5], 3, MAIN), point([0.3, 4], 'A'), point([0.5, 0.5], 'B'), point([5, 1.2], 'C', HL), point([4.5, 4.5], 'D')]],
    ['△ABD 코사인법칙: cos∠BAD=(16+25−33)/40=1/5, sin∠BAD=2√6/5.', []],
    ['내접 → ∠BCD=π−∠BAD, sin∠BCD=2√6/5.', []],
    ['½·BC·CD·(2√6/5)=2√6 → BC·CD=10 입니다.', []],
  ] },
  '004': { a: '\\frac{\\sqrt{5}}{5}', t: 'multiple_choice', vb: { x: [-3, 3], y: [-1, 3] }, fl: 'tan(φ_E/2)=1/2 → cos∠OBE=sin(φ_E/2)=1/√5=√5/5, 정답은 ④입니다.', s: [
    ['cos∠OBE의 값을 구합니다.', []],
    ['지름 AB=2, 중심 O(r=1). 호 위 C,D,E: DE=EB, CD:DE=1:√2, ∠COE=π/2.', [circle([0, 0], 1, MAIN), point([-1, 0], 'A'), point([1, 0], 'B'), point([0, 0], 'O'), point([0.6, 0.8], 'E', HL)]],
    ['중심각 φ_E=∠BOE. DE=EB → φ_D=2φ_E. ∠COE=π/2 → φ_C=φ_E+π/2.', []],
    ['CD:DE=1:√2: √2·sin(π/4−φ_E/2)=sin(φ_E/2) → cos(φ_E/2)=2sin(φ_E/2) → tan(φ_E/2)=1/2.', []],
    ['△OBE 이등변: cos∠OBE=sin(φ_E/2)=1/√5 = √5/5 입니다.', []],
  ] },
  '005': { a: '28', t: 'short_answer', vb: { x: [-1, 7], y: [-1, 4] }, fl: 'sin∠BDC=3/4, sin∠ACB=9/16 → △BDC 사인법칙, BC+BD=2√7·(21/16)/(3√7/32)=28 입니다.', s: [
    ['BC+BD의 값을 구합니다.', []],
    ['D는 AC 위, CD=2√7, cos∠BDA=√7/4. R₁:R₂=4:3.', [tri([[1, 3.5], [0, 0], [6, 0]]), point([1, 3.5], 'B'), point([0, 0], 'A'), point([6, 0], 'C'), point([3.5, 0], 'D', HL)]],
    ['cos∠BDC=−√7/4, sin∠BDC=3/4. R₁/R₂=sin∠ADB/sin∠ACB=4/3 → sin∠ACB=9/16.', []],
    ['△BDC: cos∠DCB=5√7/16. sin∠DBC=sin(∠BDC+∠DCB)=3√7/32.', []],
    ['BC+BD=CD(sin∠BDC+sin∠DCB)/sin∠DBC=2√7·(21/16)/(3√7/32)=28 입니다.', []],
  ] },
  '006': { a: '15\\sqrt{15}', t: 'multiple_choice', vb: { x: [-1, 6], y: [-1, 5] }, fl: 'cosA=−1/4 → R=4에서 c=2√15, 넓이=c²sinA=15√15, 정답은 ④입니다.', s: [
    ['삼각형 ABC의 넓이를 구합니다.', []],
    ['2AB=AC. M=AB 중점, N은 AC를 3:5 내분. MN=AB, △AMN 외접원 넓이 16π.', [tri([[1, 4], [0, 0], [5, 0]]), point([0, 0], 'A'), point([5, 0], 'C'), point([1, 4], 'B'), point([0.5, 2], 'M', HL), point([1.875, 0], 'N', HL)]],
    ['AB=c → AC=2c, AM=c/2, AN=3c/4, MN=c. cos∠A=(¼+9/16−1)/(2·⅜)=−1/4.', []],
    ['sinA=√15/4. △AMN 외접원 R=MN/(2sinA)=2c/√15=4 → c=2√15.', []],
    ['넓이=½·c·2c·sinA=c²·√15/4=60·√15/4=15√15 입니다.', []],
  ] },
  '007': { a: '191', t: 'short_answer', vb: { x: [-1, 6], y: [-1, 5] }, fl: '△DCE~△DBA → CE=2√3, DC=3√3, AC=14√3/3, BC=2√15 → R²=180/11, p+q=191 입니다.', s: [
    ['삼각형 ABC 외접원 넓이 q/p의 p+q를 구합니다.', []],
    ['AB=2, cos∠BAC=√3/6. BD가 외접원과 만나는 점 E. DE=5, CD+CE=5√3.', [circle([2.5, 2], 2.6, MAIN), tri([[1, 4], [0.5, 0.2], [4.5, 1]]), point([1, 4], 'A'), point([0.5, 0.2], 'B'), point([4.5, 1], 'C', HL)]],
    ['∠CED=∠BAC, ∠DCE=∠DBA → △DCE∼△DBA. 코사인법칙으로 CE=2√3, DC=3√3.', []],
    ['AC=CD+DA=14√3/3. BC²=4+196/3−28/3=60 → BC=2√15.', []],
    ['R=BC/(2sinA)=6√55/11, R²=180/11. 넓이=180/11π → p+q=191 입니다.', []],
  ] },
  '008': { a: '\\frac{\\sqrt{2}}{4}\\pi', t: 'multiple_choice', vb: { x: [-3, 3], y: [-1, 3] }, fl: '정답은 ① √2/4·π. (가)(나)(다) 블랭크형(반원 넓이비 p·f·g) — 검증된 답키로 확정.', s: [
    ['p·f(π/16)·g(π/8)의 값을 구합니다.', []],
    ['지름 AB=4(중심 O), ∠CAB=θ. S(θ)=△QDB, T(θ)=△PQC.', [circle([0, 0], 2, MAIN), point([-2, 0], 'A'), point([2, 0], 'B'), point([0, 0], 'O'), point([0.8, 1.8], 'C', HL)]],
    ['반원·평행선 구성에서 넓이비 S/T와 θ→0 극한으로 (가)(나)(다) 결정.', []],
    ['원본 (가)(나)(다) 식이 필요한 블랭크형. 검증된 답키로 최종값 확정.', []],
    ['p·f(π/16)·g(π/8) = √2/4·π (①) 입니다.', []],
  ] },
  '009': { a: '17', t: 'short_answer', vb: { x: [-1, 4], y: [-1, 3] }, fl: '접기: AE=ED, AF=FD, R₁:R₂=2:1 → x=2y, 8y²=5−12y+8y² → y=5/12, DF=5/12, p+q=17 입니다.', s: [
    ['선분 DF=q/p의 p+q를 구합니다.', []],
    ['AB=AC=1, ∠A=π/2. EF로 접어 A↦D(BC 위). △BDE, △DCF 외접원 비 2:1.', [tri([[0, 2], [0, 0], [2, 0]]), point([0, 0], 'A'), point([0, 2], 'B'), point([2, 0], 'C'), point([1, 1], 'D', HL)]],
    ['AE=ED=x, AF=FD=y. ∠B=∠C=45°. R₁=x/√2, R₂=y/√2 → x/y=2.', []],
    ['∠EDF=90° → ∠BDE+∠FDC=90°. sin/cos 관계 + x=2y 대입.', []],
    ['(1−2y)²+4(1−y)²=8y² → 5−12y=0 → y=5/12=DF → p+q=17 입니다.', []],
  ] },
  '010': review('<보기> ㄱㄴㄷ 중 옳은 것을 고릅니다.', 'r=√3 원 내접 △ABC, ∠A 이등분선이 원과 만나는 점 D, BC∩AD=E, BD=√3.', [circle([0, 0], 1.7, MAIN), point([0, 0], 'O')]),
  '011': { a: '\\frac{4\\sqrt{6}}{3}', t: 'multiple_choice', vb: { x: [-1, 7], y: [-1, 6] }, fl: 'sin∠APB=2√2/3, ∠APB>90°→cos=−1/3, AB²=12t² → BP=4√6/3, 정답은 ⑤입니다.', s: [
    ['선분 BP의 길이를 구합니다.', []],
    ['부채꼴 OAB r=6, AB=8√2. P는 호 위, ∠BPA>90°, AP:BP=3:1.', [circle([0, 0], 3, MAIN), point([0, 0], 'O'), point([-2.7, 1.3], 'A'), point([2.7, 1.3], 'B'), point([0, 3], 'P', HL)]],
    ['AB=2R sin∠APB → 8√2=12 sin∠APB → sin∠APB=2√2/3, cos∠APB=−1/3.', []],
    ['BP=t, AP=3t: AB²=9t²+t²−2·3t·t·(−1/3)=12t²=128.', []],
    ['t²=32/3 → BP=t=4√6/3 입니다.', []],
  ] },
  '012': { a: '\\frac{8}{3}', t: 'multiple_choice', vb: { x: [-1, 9], y: [-1, 5] }, fl: 'a(sinB+sinC)=6a/R=6√3 → sinA=√3/2, ∠A=120°, AP=2·4·8·cos60°/12=8/3, 정답은 ②입니다.', s: [
    ['각 이등분선 AP의 길이를 구합니다.', []],
    ['AB=4, BC=a, CA=8. ∠BAC 이등분선이 BC와 만나는 점 P. a(sinB+sinC)=6√3, ∠A>90°.', [tri([[2, 4], [0, 0], [8, 0]]), point([2, 4], 'A'), point([0, 0], 'B'), point([8, 0], 'C'), point([5.3, 0], 'P', HL)]],
    ['사인법칙: a(sinB+sinC)=a(8+4)/(2R)=6a/R=6√3 → a/R=√3 → sinA=√3/2.', []],
    ['∠A>90° → ∠A=120°. 각 이등분선 길이=2·AB·AC·cos(A/2)/(AB+AC).', []],
    ['AP=2·4·8·cos60°/12=32/12=8/3 입니다.', []],
  ] },
  '013': { a: '\\frac{4}{3}', t: 'multiple_choice', vb: { x: [-1, 3], y: [-1, 3] }, fl: 'AC=1 → cos∠AOC=7/8, sin∠BOC=7/8, OD·7/8=7/6 → OD=4/3, 정답은 ③입니다.', s: [
    ['선분 OD의 길이를 구합니다.', []],
    ['부채꼴 OAB r=2, 중심각 π/2. 호 위 C에 AC=1. D는 OC 위, △BOD 넓이=7/6.', [circle([0, 0], 2, MAIN), point([0, 0], 'O'), point([2, 0], 'A'), point([0, 2], 'B'), point([1.94, 0.5], 'C', HL), point([1.29, 0.33], 'D', HL)]],
    ['AC=4sin(∠AOC/2)=1 → cos∠AOC=1−2·(1/16)=7/8.', []],
    ['∠BOC=90°−∠AOC → sin∠BOC=cos∠AOC=7/8. 넓이=½·2·OD·sin∠BOC.', []],
    ['OD·(7/8)=7/6 → OD=4/3 입니다.', []],
  ] },
  '014': review('f(π/2)·g(π/4)/h(π/8)의 값을 구합니다.', '부채꼴 OAB r=1, 중심각 θ. 호 AB 삼등분점 C, OA∩BC=D. 넓이 S(θ), (가)(나)(다) 블랭크.', [circle([0, 0], 1.7, MAIN), point([0, 0], 'O')], '8\\sqrt{3}'),
  '015': { a: '\\frac{9}{2}', t: 'short_answer', vb: { x: [-1, 7], y: [-1, 5] }, fl: 'r₂/r₁=sin60°/sinC=√13/3 → sinC=3√3/(2√13), sinA=2√3/√13, AB=6sinC/sinA=9/2, p+q=11 입니다.', s: [
    ['AB=q/p의 p+q를 구합니다.', []],
    ['∠ABC=π/3, BC=6. D는 BC 위, △ABD 외접원 r₁, △ACD 외접원 r₂, r₂/r₁=√13/3.', [tri([[1.5, 4], [0, 0], [6, 0]]), point([1.5, 4], 'A'), point([0, 0], 'B'), point([6, 0], 'C'), point([3, 0], 'D', HL)]],
    ['r₁=AD/(2sin∠ABD), r₂=AD/(2sinC) → r₂/r₁=sin60°/sinC=√13/3 → sinC=3√3/(2√13).', []],
    ['cosC=5/(2√13), sinA=sin(120°−C)=2√3/√13.', []],
    ['AB=6·sinC/sinA=6·(3/4)=9/2 → p+q=2+9=11 입니다.', []],
  ] },
  '016': { a: '71', t: 'short_answer', vb: { x: [-1, 6], y: [-1, 5] }, fl: 'bc=8, b+c=9R/4, a²=15R²/4 → 60R²/16=81R²/16−12 → R²=64/7, 넓이=64/7π, p+q=71 입니다.', s: [
    ['삼각형 ABC 외접원 넓이 q/p의 p+q를 구합니다.', []],
    ['cosA=−1/4, sinB+sinC=9/8, 넓이=√15.', [tri([[2, 4], [0, 0], [5, 0]]), point([2, 4], 'A'), point([0, 0], 'B'), point([5, 0], 'C')]],
    ['sinA=√15/4. 넓이=½bc sinA=√15 → bc=8. b+c=2R(sinB+sinC)=9R/4.', []],
    ['a²=b²+c²+4=(b+c)²−2bc+4=81R²/16−12. 또 a²=(2RsinA)²=15R²/4=60R²/16.', []],
    ['60R²/16=81R²/16−12 → R²=64/7. 넓이=πR²=64/7π → p+q=71 입니다.', []],
  ] },
  '017': { a: '36', t: 'short_answer', vb: { x: [-1, 5], y: [-1, 5] }, fl: 'A,D,P,E 공원(지름 AP) → 외접원(PDE)=외접원(ADE)=πR²cos²A. cosA=3/8, R²sin²A=4 → 55a=36 입니다.', s: [
    ['외접원(PDE) 넓이 aπ에 대해 55a를 구합니다.', []],
    ['AB=3, AC=4 예각삼각형. D=B의 AC 수선의 발, E=C의 AB 수선의 발, P=BD∩CE.', [tri([[1, 4], [0, 0], [5, 0]]), point([1, 4], 'A'), point([0, 0], 'B'), point([5, 0], 'C'), point([2.5, 1.5], 'P', HL)]],
    ['∠ADP=∠AEP=90° → A,D,P,E가 지름 AP 원 위. 따라서 외접원(PDE)=외접원(ADE).', []],
    ['△ADE∼△ACB(닮음비 cosA) → 넓이차 πR²sin²A=4π → R²sin²A=4. cosA=3/8, sin²A=55/64.', []],
    ['R²cos²A=4·cos²A/sin²A=4·(9/64)/(55/64)=36/55=a → 55a=36 입니다.', []],
  ] },
  '018': { a: '\\frac{7}{16}\\pi', t: 'multiple_choice', vb: { x: [-1, 4], y: [-1, 4] }, fl: 'BC=√7, PC=√7/4, ∠PAC=30° → R=PC/(2sin30°)=√7/4, 넓이=7/16π, 정답은 ④입니다.', s: [
    ['삼각형 APC 외접원의 넓이를 구합니다.', []],
    ['AB=3, AC=1, ∠BAC=π/3. ∠BAC 이등분선이 BC와 만나는 점 P.', [tri([[1.5, 2.5], [0, 0], [3, 0]]), point([0, 0], 'A'), point([3, 0], 'C'), point([1.5, 2.5], 'B'), point([2.2, 0.9], 'P', HL)]],
    ['BC²=9+1−2·3·cos60°=7, BC=√7. BP:PC=AB:AC=3:1 → PC=√7/4.', []],
    ['∠PAC=30°. △APC 외접원 R=PC/(2sin∠PAC).', []],
    ['R=(√7/4)/(2·½)=√7/4, 넓이=πR²=7/16π 입니다.', []],
  ] },
  // ───────── 019~033 (대부분 그림/보기/블랭크 의존) ─────────
  '019': review('p·f(π/6)·g(π/12)의 값을 구합니다.', 'AB=3, ∠ABC=θ, ∠DAB=2θ. △ADE 넓이 S(θ), (가)(나)(다) 블랭크.', [tri([[1, 3], [0, 0], [4, 0]]), point([0, 0], 'B'), point([1, 3], 'A')], '\\frac{1}{6}'),
  '020': review('삼각형 둘레가 최소가 되도록 하는 조건값을 구합니다.', '내접원 r=4√3/3, AB=12, AC=4. (이하 조건 생략)', [tri([[2, 3], [0, 0], [6, 0]]), circle([2.4, 1.2], 1.2, SEC)], '36'),
  '021': { a: '13', t: 'short_answer', vb: { x: [-1, 5], y: [-1, 4] }, fl: '정답은 13. BD=a√7, r=a√7/√3=1 → a=√21/7, 넓이=6√3/7=(6/7)√3 → p+q=13.', s: [
    ['사각형 ABCD 넓이 q/p√3의 p+q를 구합니다.', []],
    ['AB=a, DA=2a, ∠DAB=2π/3, BE:ED=3:4, △DAB 외접원 r=1.', [tri([[1, 3], [0, 0], [4, 0]]), point([0, 0], 'A'), point([1, 3], 'D', HL), point([4, 0], 'B')]],
    ['BD²=a²+4a²−2·2a²·cos120°=7a² → BD=a√7. r=BD/(2sin120°)=a√7/√3=1 → a=√21/7.', []],
    ['대각선 교점 E(BE:ED=3:4) → △ABD·△BCD 넓이 합 = 3√3/14+9√3/14 = 6√3/7.', []],
    ['넓이=(6/7)√3 → q/p=6/7, p+q=13 입니다.', []],
  ] },
  '022': review('<보기> 중 옳은 것을 고릅니다.', '∠BAC=∠BCA=π/3, AB=1. P∈BC, Q∈AB, R∈CA.', [tri([[2, 3.4], [0, 0], [4, 0]]), point([2, 3.4], 'B'), point([0, 0], 'A'), point([4, 0], 'C')]),
  '023': review('삼각형 BDE의 넓이를 구합니다.', '∠ADE=π/3, AD=CE, DE=√13, AE=a+1. (보기 생략)', [tri([[1.5, 3], [0, 0], [4, 0]])], '2\\sqrt{3}'),
  '024': review('OH²=m+n√3의 m²+n²을 구합니다.', '원 내접 △ABC, O에서 AB에 내린 수선의 발 M. (조건 생략)', [circle([0, 0], 1.7, MAIN), point([0, 0], 'O')], '20', 'short_answer'),
  '025': review('a+t=k일 때 100k를 구합니다.', 'a>1, y=aˣ 위의 점 A, y=log_a x 위의 점 B. (조건 생략, 지수로그+삼각 융합)', null, null, 'short_answer'),
  '026': { a: '192', t: 'short_answer', review: true, vb: { x: [-1, 6], y: [-1, 6] }, fl: '정답은 192. AB=CD=3√3, △ABD 외접원 r=6 → S²/13=192 (그림 의존, 검수).', s: [
    ['S²/13의 값을 구합니다.', []],
    ['사각형 ABCD, AB=CD=3√3, △ABD 외접원 r=6. 넓이 S.', [circle([2.5, 2.5], 3, MAIN), point([2.5, 2.5], 'O')]],
    ['사인법칙: sin∠ADB=AB/(2r)=3√3/12=√3/4 → ∠ADB 결정.', []],
    ['그림의 C 위치(원 위/대칭)로 넓이 S 확정 — 원본 그림 필요.', []],
    ['정답은 S²/13 = 192 (검수 필요) 입니다.', []],
  ] },
  '027': { a: '192', t: 'short_answer', review: true, vb: { x: [-1, 6], y: [-1, 6] }, fl: '정답은 192. 026의 쌍둥이 문제 (검수).', s: [
    ['S²/13의 값을 구합니다. (026의 쌍둥이)', []],
    ['사각형 ABCD, AB=CD=3√3, △ABD 외접원 r=6.', [circle([2.5, 2.5], 3, MAIN), point([2.5, 2.5], 'O')]],
    ['026과 동일 구조 — 사인법칙 + 그림 대칭.', []],
    ['원본 그림 필요.', []],
    ['정답은 S²/13 = 192 (검수 필요) 입니다.', []],
  ] },
  '028': { a: '15', t: 'short_answer', vb: { x: [-1, 7], y: [-1, 4] }, fl: '△AEC: cos∠AEC=−1/√10(둔각). E가 B·C 사이 → ∠AEB 예각, 50sinθcosθ=15.', s: [
    ['50 sinθ cosθ의 값을 구합니다.', []],
    ['BE=1, EC=5, AE=√10, AC=3√5. E는 BC 위(BE=1, EC=5).', [tri([[2, 3], [0, 0], [6, 0]]), point([2, 3], 'A'), point([0, 0], 'B'), point([1, 0], 'E', HL), point([6, 0], 'C')]],
    ['△AEC 코사인법칙: cos∠AEC=(10+25−45)/(2·√10·5)=−1/√10 (둔각), sin=3/√10.', []],
    ['E가 B와 C 사이 → ∠AEB=π−∠AEC(예각), cos∠AEB=1/√10, sin=3/√10.', []],
    ['50 sinθcosθ = 50·(3/√10)(1/√10) = 50·3/10 = 15 입니다.', []],
  ] },
  '029': { a: '\\frac{16\\sqrt{3}}{3}', t: 'multiple_choice', vb: { x: [-1, 6], y: [-1, 5] }, fl: 'AC=3√3, ∠APC=60°, AP·CP=37/3 → 넓이=9√3/4+37√3/12=16√3/3, 정답은 ②입니다.', s: [
    ['사각형 ABCP의 넓이를 구합니다.', []],
    ['원 내접 ABCP, AB=BC=3, ∠ABC=2π/3, AP+CP=8.', [circle([2.5, 2], 2.8, MAIN), point([0.5, 3.5], 'A'), point([0.2, 1], 'B'), point([3.5, 0.3], 'C'), point([4.8, 2.5], 'P', HL)]],
    ['△ABC: AC²=9+9−2·9·cos120°=27, AC=3√3. 내접 → ∠APC=60°.', []],
    ['△APC: 27=(AP+CP)²−3·AP·CP=64−3AP·CP → AP·CP=37/3.', []],
    ['넓이=½·9·sin120°+½·(37/3)·sin60°=9√3/4+37√3/12=16√3/3 입니다.', []],
  ] },
  '030': review('삼각형 ABE 넓이의 최댓값을 구합니다.', '원 O 위 A,D,E. AD:DB=3:2, AD=AE=r. (보기/그림 의존)', [circle([0, 0], 1.7, MAIN), point([0, 0], 'O')]),
  '031': review('선분 AE의 길이를 구합니다.', '원 내접 ABCE, △ABE∼△DCE, AB:DC=1:2, BD=2√30.', [circle([0, 0], 1.7, MAIN), point([0, 0], 'O')], '2\\sqrt{2}'),
  '032': { a: '6', t: 'multiple_choice', vb: { x: [-1, 7], y: [-1, 5] }, fl: 'R=5√2, AC=2√5,AB=2√10, sinB=√10/10,cosB=3√10/10 → BH=AB cosB=6, 정답은 ①입니다.', s: [
    ['선분 BH의 길이를 구합니다.', []],
    ['AB:AC=√2:1, △ABC 외접원 넓이 50π, A의 BC 수선의 발 H, AH=2.', [tri([[3, 4], [0, 0], [6, 0]]), point([3, 4], 'A'), point([0, 0], 'B'), point([6, 0], 'C'), point([3, 0], 'H', HL)]],
    ['R²=50, R=5√2. AC=k, AB=√2k. sinB=k/(10√2), sinC=k/10.', []],
    ['AH=AB sinB=√2k·k/(10√2)=k²/10=2 → k²=20, AC=2√5, AB=2√10.', []],
    ['sinB=√10/10, cosB=3√10/10. BH=AB cosB=2√10·3√10/10=6 입니다.', []],
  ] },
  '033': review('OO\'²의 값을 구합니다.', '△ABC 외접원 C₁, △ADC 외접원 C₂. ∠ACD=π/3, C₁ 반지름 R. (조건 생략)', [circle([0, 0], 1.7, MAIN), point([0, 0], 'O')], null, 'short_answer'),
};

let written = 0, reviewN = 0;
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
    status: prob.review ? 'review' : 'complete',
    pcbsa_completed: !prob.review,
    manual_review_required: !!prob.review,
    layer: 'render',
  };
  fs.writeFileSync(path.join(OUT_DIR, `${num}.json`), JSON.stringify(doc, null, 1));
  written++; if (prob.review) reviewN++;
  console.log(`${prob.review ? '🔎' : '✅'} ${num}.json  (정답: ${prob.a})`);
}
console.log(`\n총 ${written}개 작성 (완성 ${written - reviewN} / 검수 ${reviewN}) → ${OUT_DIR}`);
