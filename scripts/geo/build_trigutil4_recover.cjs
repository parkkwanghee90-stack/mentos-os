/**
 * 삼각함수의 활용 4단계 034~068 복원 — Supabase 원본 힌트(구 스키마)에서 재생성.
 * 소스: mentos-assets/math_hints/trig_util_step4/0XX.json (problem_render.body는 placeholder지만
 *       steps[].caption 에 실제 풀이·정답, base_figure.objects 에 정확한 좌표가 들어있음).
 *  → 새 살아있는 도형 스키마(preset:custom + steps[].latex/objects, 컬러 팔레트)로 변환.
 * 원본 회색 도형(#64748b) → 컬러 팔레트로 recolor, 5단계 PCBSA로 condense, 정답 확정.
 * 미완성(원본도 풀이 중단): 036·042·049·051·066 → 검수.
 * 실행 전: 원본 JSON을 /private/tmp/tu4orig/0XX.json 로 받아둔다(없으면 Supabase fetch).
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT_DIR = path.join(__dirname, '..', '..', 'public', 'math_hints', '삼각함수활용4단계');
const SRC_DIR = '/private/tmp/tu4orig';
const SUPA = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/mentos-assets/math_hints/trig_util_step4';
fs.mkdirSync(OUT_DIR, { recursive: true });

const MAIN = '#3b82f6', SEC = '#ec4899', LITE = '#60a5fa', PT = '#22c55e', HL = '#ef4444', SEG = '#f59e0b';
const STEP_LABELS = [
  'P: 문제에서 구하는 것 확인',
  'C: 조건/단서 정리',
  'B: 필요한 배경개념/공식',
  'S: 식 변형/구조 분석',
  'A: 계산 적용 및 최종 정답 도출',
];

// 034~068 정답(원본 마지막 step 캡션에서 확정). review:true = 원본도 미완성 → 검수.
const ANS = {
  '034': { a: '\\frac{64\\sqrt{2}}{9}' }, '035': { a: '64' }, '036': { review: 1 },
  '037': { a: '\\frac{54}{25}' }, '038': { a: '6' }, '039': { a: '98' }, '040': { a: '\\frac{20}{3}' },
  '041': { a: '11' }, '042': { review: 1 }, '043': { a: '\\frac{3+\\sqrt{3}}{2}' }, '044': { a: '\\frac{5\\sqrt{2}}{2}' },
  '045': { a: '\\frac{6\\sqrt{13}}{13}' }, '046': { a: '20' }, '047': { a: '20\\sqrt{10}' }, '048': { a: '\\frac{4\\sqrt{10}}{5}' },
  '049': { review: 1 }, '050': { a: '\\frac{5\\sqrt{3}}{7}' }, '051': { a: '\\frac{56}{9}' }, '052': { a: '84' },
  '053': { a: '10' }, '054': { a: '27' }, '055': { a: '\\frac{8}{3}' }, '056': { a: '7' },
  '057': { a: 'ㄱ, ㄴ', t: 'multiple_choice' }, '058': { a: '15' }, '059': { a: '21' }, '060': { a: '\\frac{6-\\sqrt{6}}{5}' },
  '061': { a: '\\frac{125}{2}\\pi' }, '062': { a: '15' }, '063': { a: '6\\pi+9\\sqrt{3}' }, '064': { a: '\\frac{32\\sqrt{3}}{3}' },
  '065': { a: '150' }, '066': { review: 1 }, '067': { a: '4\\sqrt{2}' }, '068': { a: '\\frac{8}{5}\\pi' },
};

// 원본에 도형이 없거나 빈약한 문제 — 풀이에서 실제 좌표를 계산해 직접 구성한 도형.
const _c = (c, r) => ({ type: 'circle', center: c, radius: r, color: MAIN, fillOpacity: 0.06 });
const _g = (pts) => ({ type: 'polygon', points: pts, color: LITE, fillOpacity: 0.06 });
const _p = (c, l, col = PT) => ({ type: 'point', coords: c, label: l, color: col });
const _s = (a, b) => ({ type: 'segment', from: a, to: b, color: SEG, style: 'dashed', weight: 1.5 });
const OVERRIDES = {
  '040': { vb: { x: [-1, 7], y: [-1, 5] }, objs: [_g([[2, 4], [0, 0], [6, 0]]), _p([2, 4], 'A'), _p([0, 0], 'B'), _p([6, 0], 'C'), _p([1, 2], 'F', HL), _p([3.5, 1.4], 'E', HL), _p([3, 0], 'D', HL)] },
  '046': { vb: { x: [-1, 5], y: [-1, 4] }, objs: [_g([[4, 0], [0, 0], [3, 3]]), _p([4, 0], 'C'), _p([0, 0], 'E'), _p([3, 3], 'D'), _s([4, 0], [3, 3])] }, // ∠CED=45°, CE=4, ED=3√2, CD=√10
  '047': { vb: { x: [-1, 7], y: [-1, 7] }, objs: [_g([[0, 0], [3, 0], [0, 6.32]]), _p([0, 0], 'C'), _p([3, 0], 'B'), _p([0, 6.32], 'A'), _p([5, 3], 'D', HL), _s([0, 6.32], [5, 3]), _s([0, 0], [5, 3])] }, // ∠C=90°, BC=3,CA=2√10,AB=7
  '048': { vb: { x: [-1, 5], y: [-1, 3] }, objs: [_g([[0, 0], [4, 0], [2.63, 1.45]]), _p([0, 0], 'A'), _p([4, 0], 'C'), _p([2.63, 1.45], 'B'), _p([2, 0], 'M', HL), _s([2.63, 1.45], [2, 0])] }, // cos∠A=7/8,AB=3,AC=4,BC=2,M중점
  '052': { vb: { x: [-6, 6], y: [-6, 6] }, objs: [_c([0, 0], 5), _g([[-4, 3], [-3, -4], [4, -3], [3, 4]]), _p([-4, 3], 'A'), _p([-3, -4], 'B'), _p([4, -3], 'C'), _p([3, 4], 'D'), _p([0, 0], 'O', HL)] },
  '053': { vb: { x: [-1, 10], y: [-1, 7] }, objs: [_g([[0, 0], [9.17, 0], [4, 5.5]]), _p([0, 0], 'B'), _p([9.17, 0], 'C'), _p([4, 5.5], 'A'), _p([8, 0], 'D', HL), _s([4, 5.5], [8, 0])] }, // BC=2√21, D on BC, BD=8
  '054': { vb: { x: [-10, 10], y: [-2, 10] }, objs: [_c([0, 0], 9), _g([[-9, 0], [9, 0], [-7, 5.66]]), _p([-9, 0], 'A'), _p([9, 0], 'B'), _p([-7, 5.66], 'C'), _p([0, 0], 'O', HL), _p([1, 0], 'D', HL), _s([-7, 5.66], [1, 0])] }, // AB지름=18,∠C=90°,AC=6
  '058': { vb: { x: [-1, 9], y: [-4, 5] }, objs: [_g([[0, 0], [8, 0], [4, 4]]), _p([0, 0], 'A'), _p([8, 0], 'B'), _p([4, 4], 'C'), _p([4, -3], 'D', HL), _p([2, 0], 'H', HL), _s([4, 4], [4, -3])] },
  '060': { vb: { x: [-3, 3], y: [-3, 3] }, objs: [_c([0, 0], 2.5), _g([[-2, 1.5], [2, 1.5], [0, -2.5]]), _p([-2, 1.5], 'B'), _p([2, 1.5], 'C'), _p([0, -2.5], 'D'), _p([0, 0], 'O', HL)] },
  '062': { vb: { x: [-1, 7], y: [-1, 4] }, objs: [_g([[0, 0], [4, 0], [5.5, 2.6], [1.5, 2.6]]), _p([0, 0], 'A'), _p([4, 0], 'B'), _p([5.5, 2.6], 'C'), _p([1.5, 2.6], 'D'), _s([0, 0], [5.5, 2.6]), _s([4, 0], [1.5, 2.6])] }, // 변 3,4
  '063': { vb: { x: [-7, 7], y: [-1, 7] }, objs: [_c([0, 0], 6), _g([[3, 5.2], [-6, 0], [0, 0]]), _p([0, 0], 'O'), _p([-6, 0], 'A'), _p([6, 0], 'B'), _p([3, 5.2], 'C'), _s([0, 0], [3, 5.2])] }, // 반원r=6, 호CB=2π→∠π/3
  '064': { vb: { x: [-3, 9], y: [-3, 7] }, objs: [_c([3.5, 2.02], 4.04), _g([[0, 0], [7, 0], [-0.43, 2.97]]), _p([0, 0], 'C'), _p([7, 0], 'B'), _p([-0.43, 2.97], 'A')] }, // AC=3,BC=7,AB=8,R=7√3/3
  '065': { vb: { x: [-7, 7], y: [-2, 12] }, objs: [_c([0, 4.47], 6.7), _g([[-5, 0], [5, 0], [0, 11.2]]), _p([-5, 0], 'A'), _p([5, 0], 'B'), _p([0, 11.2], 'C')] }, // AB=10, a=b 이등변
  '067': { vb: { x: [-4, 4], y: [-4, 4] }, objs: [_c([0, 0], 3.16), _g([[3.16, 0], [0, 3.16], [-2.7, -1.6]]), _p([3.16, 0], 'B'), _p([0, 3.16], 'C'), _p([-2.7, -1.6], 'A'), _p([0, 0], 'O', HL)] }, // OB=OC=√10,∠BOC=90°
};

function fetchJSON(url) {
  return new Promise((res, rej) => {
    https.get(url, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); }).on('error', rej);
  });
}

// 구 스키마 객체 → 신 컬러 객체
function convObjects(objs) {
  const labels = {};       // 'A' -> tex (label_text)
  const labelPos = {};
  for (const o of objs) {
    if (o.type === 'label_text') { const k = (o.id || '').replace(/^label_/, ''); labels[k] = o.tex; labelPos[k] = o.at; }
  }
  const shapes = [], pts = [], segs = [];
  const usedLabel = new Set();
  for (const o of objs) {
    if (o.type === 'drawCircle') shapes.push({ type: 'circle', center: o.center, radius: o.radius, color: MAIN, fillOpacity: 0.06 });
    else if (o.type === 'polygon') shapes.push({ type: 'polygon', points: o.points, color: LITE, fillOpacity: 0.06 });
    else if (o.type === 'point') {
      const k = (o.id || '').replace(/^point_/, '');
      const lab = labels[k] || '';
      if (lab) usedLabel.add(k);
      pts.push({ type: 'point', coords: [o.x, o.y], label: lab, color: PT });
    } else if (o.type === 'drawSegment') segs.push({ type: 'segment', from: o.p1, to: o.p2, color: SEG, style: o.style === 'dashed' ? 'dashed' : 'solid', weight: 1.5 });
  }
  // point에 못 붙은 label_text는 라벨 점으로(좌표 있을 때만)
  for (const k in labels) if (!usedLabel.has(k) && Array.isArray(labelPos[k])) pts.push({ type: 'point', coords: labelPos[k], label: labels[k], color: LITE });
  return { shapes, pts, segs };
}

// n개 캡션을 5버킷으로 균등 분배(마지막 버킷에 최종스텝 포함)
function bucketCaps(caps) {
  const out = [[], [], [], [], []];
  if (caps.length <= 5) { caps.forEach((c, i) => out[i].push(c)); return out; }
  for (let i = 0; i < caps.length; i++) out[Math.min(4, Math.floor(i * 5 / caps.length))].push(caps[i]);
  return out;
}

async function build(num) {
  let src;
  const p = path.join(SRC_DIR, `${num}.json`);
  if (fs.existsSync(p)) src = JSON.parse(fs.readFileSync(p, 'utf8'));
  else src = await fetchJSON(`${SUPA}/${num}.json`);

  const info = ANS[num] || { review: 1 };
  const ov = OVERRIDES[num];
  const vb = ov ? ov.vb : (src.viewBox && src.viewBox.x ? src.viewBox : { x: [-6, 6], y: [-6, 6] });
  let shapes, pts, segs;
  if (ov) {
    shapes = ov.objs.filter(o => o.type === 'circle' || o.type === 'polygon');
    pts = ov.objs.filter(o => o.type === 'point');
    segs = ov.objs.filter(o => o.type === 'segment');
  } else {
    ({ shapes, pts, segs } = convObjects((src.base_figure && src.base_figure.objects) || []));
  }
  const caps = (src.steps || []).map(s => (s.caption || s.title || '').trim()).filter(Boolean);

  const isReview = !!info.review;
  const ans = isReview ? '(원본 풀이 미완성 - 검수)' : info.a;
  const lastCap = caps.length ? caps[caps.length - 1] : '';

  const buckets = bucketCaps(caps);
  // 목표 문장(P) 보강
  const goal = isReview ? '원본 풀이가 중단된 문제입니다(검수 필요).' : `삼각함수 활용으로 최종값을 구합니다.`;
  buckets[0].unshift(goal);

  // 도형 분배: 모양→step0, 점→step1, 선분→step2 (점점 그려지는 살아있는 도형)
  const stepObjs = [shapes, pts, segs, [], []];
  const steps = buckets.map((b, i) => ({
    step: i + 1,
    label: STEP_LABELS[i],
    latex: (b.length ? b.join('\n') : (i === 4 && lastCap ? lastCap : '계속.')),
    objects: stepObjs[i] || [],
  }));

  const doc = {
    type: 'geometry',
    viewBox: vb,
    base_figure: { preset: 'custom', viewBox: vb, objects: [{ type: 'axes' }] },
    figure_avs_fixed: true,
    steps,
    finalAnswer: ans,
    correctAnswer: ans,
    answerType: info.t || 'short_answer',
    explanationFinalLine: isReview ? `⚠ ${num}: 원본 풀이 미완성 — 검수 필요.` : `정답은 ${ans} 입니다. (원본 해설 복원)`,
    status: isReview ? 'review' : 'complete',
    pcbsa_completed: !isReview,
    manual_review_required: isReview,
    recovered_from: 'supabase_original',
    layer: 'render',
  };
  fs.writeFileSync(path.join(OUT_DIR, `${num}.json`), JSON.stringify(doc, null, 1));
  return { num, ans, isReview, nobj: shapes.length + pts.length + segs.length, nst: caps.length };
}

(async () => {
  let done = 0, rev = 0;
  for (let i = 34; i <= 68; i++) {
    const num = String(i).padStart(3, '0');
    try {
      const r = await build(num);
      if (r.isReview) rev++; else done++;
      console.log(`${r.isReview ? '🔎' : '✅'} ${num}  정답:${r.ans}  도형객체:${r.nobj}  원본스텝:${r.nst}`);
    } catch (e) { console.log(`❌ ${num}: ${e.message}`); }
  }
  console.log(`\n복원 ${done} / 검수 ${rev} → ${OUT_DIR}`);
})();
