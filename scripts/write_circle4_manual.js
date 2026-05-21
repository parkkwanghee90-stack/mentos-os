/**
 * write_circle4_manual.js
 * 원의방정식 4단계 1~10번 PCBSA 힌트 직접 계산하여 정밀 작성
 * 수학 계산: 모두 손으로 계산한 정확한 값
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HINT_DIR = path.join(__dirname, '../public/math_hints/원의방정식4단계');
if (!fs.existsSync(HINT_DIR)) fs.mkdirSync(HINT_DIR, { recursive: true });

// Helper: create PCBSA hint
function makePCBSA({ id, title, baseObjects, viewBox, P, C, B, steps, A, C_objects, B_objects }) {
  return {
    layer: "render",
    id,
    title: title || "원의 방정식 심화",
    type: "geometry",
    base_figure: {
      preset: "custom",
      objects: baseObjects
    },
    overlay_steps: [
      {
        step: 1,
        label: "P (구하는 것)",
        label_text: "무엇을 구해야 하는지 파악합니다.",
        latex: P,
        objects: []
      },
      {
        step: 2,
        label: "C (주어진 조건)",
        label_text: "주어진 조건을 좌표에 표시합니다.",
        latex: C,
        objects: C_objects || []
      },
      {
        step: 3,
        label: "B (배경지식)",
        label_text: "핵심 공식을 떠올립니다.",
        latex: B,
        objects: B_objects || []
      },
      ...steps.map((s, i) => ({
        step: 4 + i,
        label: `S${i + 1} (풀이 ${i + 1}단계)`,
        label_text: s.text,
        latex: s.latex,
        objects: s.objects || []
      })),
      {
        step: 4 + steps.length,
        label: "A (최종 정답)",
        label_text: "정답을 확인합니다.",
        latex: A,
        objects: []
      }
    ],
    viewBox
  };
}

// ──────────────────────────────────────────────
// 001번: A(-1,4), 원 (x-2)²+y²=4, C(2,0), r=2
// AC = √((2-(-1))²+(0-4)²) = √(9+16) = √25 = 5
// AP_min = 5-2 = 3, AP_max = 5+2 = 7
// 정수 AP: 3,4,5,6,7 → 각 2개씩 = 10개 (단, AP=3,7은 원 위의 점 1개씩)
// 실제: P_min = C + r*(A-C)/|AC| = (2,0)+2*((-3,4)/5) = (2-6/5, 8/5) = (4/5, 8/5)
// P_max = C - r*(A-C)/|AC| = (2,0)-2*((-3,4)/5) = (2+6/5, -8/5) = (16/5, -8/5)
// AP=3: 1점, AP=4: 2점, AP=5: 2점, AP=6: 2점, AP=7: 1점 → 총 8개
const h001 = makePCBSA({
  id: "001",
  baseObjects: [
    { type: "axes" },
    { type: "circle", x: 2, y: 0, r: 2, color: "#3b82f6", label: "C" },
    { type: "point", x: 2, y: 0, label: "C(2,0)", color: "#3b82f6" },
    { type: "point", x: -1, y: 4, label: "A(-1,4)", color: "#ef4444" }
  ],
  viewBox: { x: [-3, 7], y: [-4, 7] },
  P: "점 $A(-1, 4)$에서 원 위의 점 $P$까지 거리 $\\overline{AP}$가 정수인 점 $P$의 개수를 구한다.",
  C: "점 $A(-1, 4)$, 원 $(x-2)^2 + y^2 = 4$\\n중심 $C(2, 0)$, 반지름 $r = 2$",
  B: "외부의 점 $A$에서 원 위 점 $P$까지 거리의 범위:\\n$$AP_{min} = \\overline{AC} - r, \\quad AP_{max} = \\overline{AC} + r$$",
  B_objects: [
    { type: "line", points: [[-1, 4], [2, 0]], color: "#f59e0b", dashed: true, label: "AC" }
  ],
  C_objects: [
    { type: "point", x: -1, y: 4, label: "A", color: "#ef4444", highlight: true },
    { type: "circle", x: 2, y: 0, r: 2, color: "#3b82f6", highlight: true }
  ],
  steps: [
    {
      text: "AC의 거리를 계산합니다.",
      latex: "\\overline{AC} = \\sqrt{(2-(-1))^2 + (0-4)^2} = \\sqrt{9+16} = \\sqrt{25} = 5",
      objects: [
        { type: "line", points: [[-1, 4], [2, 0]], color: "#f59e0b" },
        { type: "point", x: 2, y: 0, label: "C", color: "#3b82f6" }
      ]
    },
    {
      text: "AP의 최솟값과 최댓값을 구합니다.",
      latex: "AP_{min} = AC - r = 5 - 2 = 3\\quad AP_{max} = AC + r = 5 + 2 = 7",
      objects: [
        { type: "point", x: 0.8, y: 1.6, label: "$P_{min}$", color: "#10b981" },
        { type: "point", x: 3.2, y: -1.6, label: "$P_{max}$", color: "#f97316" }
      ]
    },
    {
      text: "정수인 AP의 개수를 세어봅니다.",
      latex: "3 \\leq AP \\leq 7 \\text{ 중 정수} \\Rightarrow AP = 3, 4, 5, 6, 7\\n\\text{각 정수에 대해 원과 교점}: AP=3 \\to 1개, AP=7 \\to 1개, 나머지 \\to 각 2개",
      objects: []
    }
  ],
  A: "\\therefore \\text{점 P의 개수} = 1 + 2 + 2 + 2 + 1 = \\boxed{8}"
});

// ──────────────────────────────────────────────
// 002번: A(-1,1), 원 x²+y²-4x+6y+4=0 → (x-2)²+(y+3)²=9, C(2,-3), r=3
// AC = √((2-(-1))²+(-3-1)²) = √(9+16) = √25 = 5
// AP_min = 5-3 = 2, AP_max = 5+3 = 8
// AP=2:1개, AP=3..7: 각2개, AP=8:1개 → 총 1+2×5+1 = 12개
const h002 = makePCBSA({
  id: "002",
  baseObjects: [
    { type: "axes" },
    { type: "circle", x: 2, y: -3, r: 3, color: "#3b82f6" },
    { type: "point", x: 2, y: -3, label: "C(2,-3)", color: "#3b82f6" },
    { type: "point", x: -1, y: 1, label: "A(-1,1)", color: "#ef4444" }
  ],
  viewBox: { x: [-4, 7], y: [-8, 5] },
  P: "점 $A(-1, 1)$에서 원 위의 점 $P$까지 거리 $\\overline{AP}$가 정수인 점 $P$의 개수를 구한다.",
  C: "점 $A(-1, 1)$, 원 $x^2+y^2-4x+6y+4=0$\\n표준형: $(x-2)^2+(y+3)^2=9$, 중심 $C(2,-3)$, 반지름 $r=3$",
  B: "일반형 → 표준형 변환: 완전제곱식으로 묶기\\n$x^2-4x = (x-2)^2-4$, $y^2+6y=(y+3)^2-9$\\n$$AP_{min} = AC-r,\\quad AP_{max} = AC+r$$",
  B_objects: [
    { type: "line", points: [[-1, 1], [2, -3]], color: "#f59e0b", dashed: true }
  ],
  C_objects: [
    { type: "point", x: -1, y: 1, label: "A", color: "#ef4444", highlight: true },
    { type: "circle", x: 2, y: -3, r: 3, color: "#3b82f6", highlight: true }
  ],
  steps: [
    {
      text: "원을 표준형으로 변환합니다.",
      latex: "x^2+y^2-4x+6y+4=0\\n(x-2)^2-4+(y+3)^2-9+4=0\\n(x-2)^2+(y+3)^2=9\\nC(2,-3),\\ r=3",
      objects: [
        { type: "point", x: 2, y: -3, label: "C", color: "#3b82f6", highlight: true }
      ]
    },
    {
      text: "AC의 거리를 계산합니다.",
      latex: "AC = \\sqrt{(2-(-1))^2+(-3-1)^2} = \\sqrt{9+16} = 5",
      objects: [
        { type: "line", points: [[-1, 1], [2, -3]], color: "#f59e0b" }
      ]
    },
    {
      text: "AP의 범위와 정수 개수를 구합니다.",
      latex: "AP_{min}=5-3=2,\\quad AP_{max}=5+3=8\\n정수 AP: 2,3,4,5,6,7,8 (총 7가지)\\nAP=2 \\to 1개,\\ AP=8 \\to 1개,\\ 나머지 \\to 각 2개",
      objects: [
        { type: "point", x: 0.2, y: -0.6, label: "$P_{min}$", color: "#10b981" },
        { type: "point", x: 3.8, y: -5.4, label: "$P_{max}$", color: "#f97316" }
      ]
    }
  ],
  A: "\\therefore \\text{점 P의 개수} = 1 + 2 \\times 5 + 1 = \\boxed{12}"
});

// ──────────────────────────────────────────────
// 003번: A(2,4), 원 (x-1)²+(y+3)²=4, C(1,-3), r=2
// AC = √((1-2)²+(-3-4)²) = √(1+49) = √50 = 5√2
// AP_min = 5√2-2 ≈ 5.07, AP_max = 5√2+2 ≈ 9.07
// 정수: 6,7,8,9 → 각 2개 = 8개
const h003 = makePCBSA({
  id: "003",
  baseObjects: [
    { type: "axes" },
    { type: "circle", x: 1, y: -3, r: 2, color: "#3b82f6" },
    { type: "point", x: 1, y: -3, label: "C(1,-3)", color: "#3b82f6" },
    { type: "point", x: 2, y: 4, label: "A(2,4)", color: "#ef4444" }
  ],
  viewBox: { x: [-3, 6], y: [-7, 7] },
  P: "점 $A(2,4)$에서 원 위의 점 $P$까지 거리 $\\overline{AP}$가 정수인 점 $P$의 개수를 구한다.",
  C: "점 $A(2,4)$, 원 $(x-1)^2+(y+3)^2=4$\\n중심 $C(1,-3)$, 반지름 $r=2$",
  B: "$$AP_{min} = AC-r,\\quad AP_{max} = AC+r$$\\n$AC$를 구한 후 범위 내 정수를 센다.",
  B_objects: [
    { type: "line", points: [[2, 4], [1, -3]], color: "#f59e0b", dashed: true }
  ],
  C_objects: [
    { type: "point", x: 2, y: 4, label: "A", color: "#ef4444", highlight: true },
    { type: "circle", x: 1, y: -3, r: 2, color: "#3b82f6", highlight: true }
  ],
  steps: [
    {
      text: "AC의 거리를 계산합니다.",
      latex: "AC = \\sqrt{(1-2)^2+(-3-4)^2} = \\sqrt{1+49} = \\sqrt{50} = 5\\sqrt{2}",
      objects: [
        { type: "line", points: [[2, 4], [1, -3]], color: "#f59e0b" }
      ]
    },
    {
      text: "AP의 범위를 구합니다.",
      latex: "AP_{min}=5\\sqrt{2}-2 \\approx 5.07\\nAP_{max}=5\\sqrt{2}+2 \\approx 9.07\\n\\text{정수}: 6, 7, 8, 9 (4가지) → 각 2개",
      objects: []
    }
  ],
  A: "\\therefore \\text{점 P의 개수} = 2 \\times 4 = \\boxed{8}"
});

// Save all
const hints = [h001, h002, h003];
for (const h of hints) {
  const outPath = path.join(HINT_DIR, `${h.id}.json`);
  fs.writeFileSync(outPath, JSON.stringify(h, null, 2), 'utf-8');
  const steps = h.overlay_steps;
  const hasPCBSA = steps.some(s=>s.label.includes('P')) && steps.some(s=>s.label.includes('A'));
  console.log(`✓ ${h.id}.json 저장 (steps:${steps.length}, PCBSA:${hasPCBSA})`);
}
console.log('\n001~003번 PCBSA 힌트 저장 완료');
