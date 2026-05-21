const fs = require('fs');
const path = require('path');
const dir = 'C:/mentos_os_clean/public/math_hints/삼각함수활용 4단계(68)';

const problems = [
  {
    id: '002',
    json: {
      "problem_id": "002",
      "title": "삼각함수 활용 - 평행사변형과 외접원",
      "type": "geometry",
      "viewBox": { "x": [-1, 9], "y": [-1, 5] },
      "base_figure": {
        "preset": "custom",
        "objects": [
          { "type": "polygon", "points": [[1,3.5],[0,0],[6,0],[7,3.5]], "color": "#94a3b8", "fillOpacity": 0.05 },
          { "type": "circle", "center": [3,1], "radius": 3.26, "color": "#4ade80", "fillOpacity": 0, "weight": 1.5 },
          { "type": "segment", "points": [[1,3.5],[6,0]], "color": "#60a5fa", "weight": 1.5 },
          { "type": "segment", "points": [[0,0],[7,3.5]], "color": "#60a5fa", "weight": 1.5 },
          { "type": "point", "x": 1, "y": 3.5, "label": "A", "color": "#ffffff" },
          { "type": "point", "x": 0, "y": 0, "label": "B", "color": "#ffffff" },
          { "type": "point", "x": 6, "y": 0, "label": "C", "color": "#ffffff" },
          { "type": "point", "x": 7, "y": 3.5, "label": "D", "color": "#ffffff" }
        ]
      },
      "overlay_steps": [
        { "step": 1, "label": "P(구하는 것)", "formula_raw": "$p+q$의 값을 구합니다.\n삼각형 $ABD$의 외접원의 넓이가 $\\dfrac{q}{p}\\pi$" },
        { "step": 2, "label": "C(주어진 단서)", "formula_raw": "둘레의 길이 $= 20$이므로 $AB + BC = 10$\n$\\cos(\\angle ABC) = \\dfrac{1}{4}$\n삼각형 $ABC$의 외접원의 넓이 $= \\dfrac{32}{3}\\pi$",
          "objects": [{ "type": "segment", "points": [[0,0],[6,0]], "color": "#f59e0b", "weight": 3 }]
        },
        { "step": 3, "label": "B(배경지식)", "formula_raw": "사인법칙: $\\dfrac{AC}{\\sin B} = 2R$\n코사인법칙: $AC^2 = AB^2 + BC^2 - 2 \\cdot AB \\cdot BC \\cdot \\cos B$\n평행사변형에서 $\\angle BAD = \\pi - \\theta$" },
        { "step": 4, "label": "[칠판 판서] Step 1 – 기본 설정", "formula_raw": "$\\angle ABC = \\theta$라 하면 $\\cos\\theta = \\dfrac{1}{4}$이므로\n$$\\sin\\theta = \\dfrac{\\sqrt{15}}{4}$$\n외접원 넓이가 $\\dfrac{32}{3}\\pi$이므로 $R_1 = \\dfrac{4\\sqrt{6}}{3}$" },
        { "step": 5, "label": "[칠판 판서] Step 2 – AC 구하기", "formula_raw": "삼각형 $ABC$에서 사인법칙에 의하여\n$$\\frac{\\overline{AC}}{\\sin\\theta} = 2R_1$$\n$$\\overline{AC} = 2\\sqrt{10}$$" },
        { "step": 6, "label": "[칠판 판서] Step 3 – 변의 길이", "formula_raw": "$AB = a,\\; BC = 10-a$라 하면 코사인법칙으로\n$$40 = a^2 + (10-a)^2 - 2a(10-a) \\cdot \\frac{1}{4}$$\n$$a^2 - 10a + 24 = 0,\\quad (a-4)(a-6) = 0$$\n$0 < a < 5$이므로 $a = 4$\n$\\therefore \\overline{AB} = 4,\\; \\overline{AD} = 6$" },
        { "step": 7, "label": "[칠판 판서] Step 4 – BD와 R₂", "formula_raw": "$\\angle BAD = \\pi - \\theta$이므로 $\\cos(\\pi-\\theta) = -\\dfrac{1}{4}$\n삼각형 $ABD$에서 코사인법칙:\n$$\\overline{BD}^2 = 6^2 + 4^2 - 2 \\cdot 6 \\cdot 4 \\cdot (-\\frac{1}{4}) = 64$$\n$$\\overline{BD} = 8$$\n사인법칙: $\\dfrac{BD}{\\sin(\\pi-\\theta)} = 2R_2$\n$$R_2 = \\frac{16\\sqrt{15}}{15}$$" },
        { "step": 8, "label": "A(최종 정답)", "formula_raw": "삼각형 $ABD$의 외접원의 넓이\n$$\\pi R_2^2 = \\frac{256}{15}\\pi$$\n$p = 15,\\; q = 256$이므로\n$$\\boxed{p + q = 271}$$" }
      ]
    }
  },
  {
    id: '003',
    json: {
      "problem_id": "003",
      "title": "삼각함수 활용 - 원에 내접하는 사각형",
      "type": "geometry",
      "viewBox": { "x": [-2, 8], "y": [-3, 5] },
      "base_figure": {
        "preset": "custom",
        "objects": [
          { "type": "circle", "center": [3,1], "radius": 3.5, "color": "#4ade80", "fillOpacity": 0, "weight": 1.5 },
          { "type": "polygon", "points": [[2.5,4.3],[0,-1.5],[6,-1.5],[5.5,3.8]], "color": "#94a3b8", "fillOpacity": 0.05 },
          { "type": "segment", "points": [[2.5,4.3],[6,-1.5]], "color": "#60a5fa", "weight": 1.5 },
          { "type": "segment", "points": [[0,-1.5],[5.5,3.8]], "color": "#60a5fa", "weight": 1.5 },
          { "type": "point", "x": 2.5, "y": 4.3, "label": "A", "color": "#ffffff" },
          { "type": "point", "x": 0, "y": -1.5, "label": "B", "color": "#ffffff" },
          { "type": "point", "x": 6, "y": -1.5, "label": "C", "color": "#ffffff" },
          { "type": "point", "x": 5.5, "y": 3.8, "label": "D", "color": "#ffffff" },
          { "type": "text", "tex": "4", "at": [0.9,1.8], "color": "#f8fafc" },
          { "type": "text", "tex": "5", "at": [4.3,1.8], "color": "#f8fafc" },
          { "type": "text", "tex": "\\sqrt{33}", "at": [3,-1.9], "color": "#60a5fa" }
        ]
      },
      "overlay_steps": [
        { "step": 1, "label": "P(구하는 것)", "formula_raw": "$\\overline{BC} \\cdot \\overline{CD}$의 값을 구합니다." },
        { "step": 2, "label": "C(주어진 단서)", "formula_raw": "사각형 $ABCD$가 한 원에 내접\n$\\overline{AB} = 4,\\; \\overline{AD} = 5,\\; \\overline{BD} = \\sqrt{33}$\n삼각형 $BCD$의 넓이 $= 2\\sqrt{6}$" },
        { "step": 3, "label": "B(배경지식)", "formula_raw": "원에 내접하는 사각형에서\n$$\\angle BCD = \\pi - \\angle BAD$$\n$$\\sin(\\angle BCD) = \\sin(\\angle BAD)$$" },
        { "step": 4, "label": "[칠판 판서] Step 1 – cosθ 구하기", "formula_raw": "$\\angle DAB = \\theta$라 하면 삼각형 $ABD$에서 코사인법칙:\n$$\\cos\\theta = \\frac{4^2 + 5^2 - (\\sqrt{33})^2}{2 \\cdot 4 \\cdot 5} = \\frac{8}{40} = \\frac{1}{5}$$" },
        { "step": 5, "label": "[칠판 판서] Step 2 – sinθ 구하기", "formula_raw": "사각형 $ABCD$가 한 원에 내접하므로\n$$\\angle BCD = \\pi - \\theta$$\n$$\\sin(\\angle BCD) = \\sin(\\pi - \\theta) = \\sin\\theta = \\frac{2\\sqrt{6}}{5}$$" },
        { "step": 6, "label": "[칠판 판서] Step 3 – 넓이로 곱 구하기", "formula_raw": "삼각형 $BCD$의 넓이가 $2\\sqrt{6}$이므로\n$$\\frac{1}{2} \\cdot \\overline{BC} \\cdot \\overline{CD} \\cdot \\frac{2\\sqrt{6}}{5} = 2\\sqrt{6}$$\n$$\\therefore \\overline{BC} \\cdot \\overline{CD} = 10$$" },
        { "step": 7, "label": "A(최종 정답)", "formula_raw": "$$\\boxed{\\overline{BC} \\cdot \\overline{CD} = 10}$$\n\n정답: ①" }
      ]
    }
  },
  {
    id: '004',
    json: {
      "problem_id": "004",
      "title": "삼각함수 활용 - 반원과 코사인",
      "type": "geometry",
      "viewBox": { "x": [-1.5, 2], "y": [-0.5, 1.5] },
      "base_figure": {
        "preset": "custom",
        "objects": [
          { "type": "segment", "points": [[-1,0],[1,0]], "color": "#cbd5e1", "weight": 2 },
          { "type": "circle", "center": [0,0], "radius": 1, "color": "#4ade80", "fillOpacity": 0, "weight": 1.5 },
          { "type": "segment", "points": [[-1,0],[-0.2,0.95]], "color": "#94a3b8", "weight": 1.5 },
          { "type": "segment", "points": [[-1,0],[0.3,0.95]], "color": "#94a3b8", "weight": 1.5 },
          { "type": "segment", "points": [[-1,0],[0.7,0.71]], "color": "#94a3b8", "weight": 1.5 },
          { "type": "segment", "points": [[1,0],[-0.2,0.95]], "color": "#94a3b8", "weight": 1.5 },
          { "type": "segment", "points": [[1,0],[0.3,0.95]], "color": "#94a3b8", "weight": 1.5 },
          { "type": "segment", "points": [[1,0],[0.7,0.71]], "color": "#94a3b8", "weight": 1.5 },
          { "type": "point", "x": -1, "y": 0, "label": "A", "color": "#ffffff" },
          { "type": "point", "x": 1, "y": 0, "label": "B", "color": "#ffffff" },
          { "type": "point", "x": 0, "y": 0, "label": "O", "color": "#94a3b8" },
          { "type": "point", "x": -0.2, "y": 0.95, "label": "C", "color": "#fbbf24" },
          { "type": "point", "x": 0.3, "y": 0.95, "label": "D", "color": "#fbbf24" },
          { "type": "point", "x": 0.7, "y": 0.71, "label": "E", "color": "#fbbf24" }
        ]
      },
      "overlay_steps": [
        { "step": 1, "label": "P(구하는 것)", "formula_raw": "$\\cos(\\angle OBE)$의 값을 구합니다." },
        { "step": 2, "label": "C(주어진 단서)", "formula_raw": "중심 $O$, 반지름 $1$인 반원 (지름 $AB = 2$)\n$\\overline{DE} = \\overline{EB}$\n$\\overline{CD} : \\overline{DE} = 1 : \\sqrt{2}$\n$\\angle COE = \\dfrac{\\pi}{2}$" },
        { "step": 3, "label": "B(배경지식)", "formula_raw": "반원 위의 점에서 지름에 대한 원주각은 $\\dfrac{\\pi}{2}$\n이등변삼각형의 성질, 사각형 내각의 합" },
        { "step": 4, "label": "[칠판 판서] Step 1 – 각도 관계", "formula_raw": "$\\overline{OC} = \\overline{OD} = \\overline{OE} = 1,\\; \\angle COE = \\dfrac{\\pi}{2}$이므로\n$\\overline{CE} = \\sqrt{2}$\n$\\angle OCD = \\angle ODC,\\; \\angle ODE = \\angle OED$\n사각형 $COED$에서\n$$\\angle OCD + \\angle CDE + \\angle OED = \\frac{3}{2}\\pi$$\n$$2\\angle CDE = \\frac{3}{2}\\pi \\Rightarrow \\angle CDE = \\frac{3}{4}\\pi$$" },
        { "step": 5, "label": "[칠판 판서] Step 2 – CD, DE 구하기", "formula_raw": "$\\overline{CD} = a$라 하면 $\\overline{DE} = \\sqrt{2}\\,a$\n삼각형 $DCE$에서 코사인법칙:\n$$\\overline{CE}^2 = a^2 + 2a^2 - 2 \\cdot a \\cdot \\sqrt{2}a \\cdot \\cos\\frac{3}{4}\\pi = 5a^2$$\n$$\\overline{CE} = \\sqrt{5}\\,a = \\sqrt{2}$$\n$$a = \\frac{\\sqrt{10}}{5}$$" },
        { "step": 6, "label": "[칠판 판서] Step 3 – cos(∠OBE) 계산", "formula_raw": "$\\overline{EB} = \\overline{DE} = \\sqrt{2}\\,a = \\frac{2\\sqrt{5}}{5}$\n$\\angle OBE = \\theta$라 하고 점 $O$에서 $EB$에 수선의 발 $H$를 내리면\n$$\\cos\\theta = \\frac{\\frac{1}{2}\\overline{EB}}{\\overline{OB}} = \\frac{\\frac{\\sqrt{5}}{5}}{1} = \\frac{\\sqrt{5}}{5}$$" },
        { "step": 7, "label": "A(최종 정답)", "formula_raw": "$$\\boxed{\\cos(\\angle OBE) = \\frac{\\sqrt{5}}{5}}$$\n\n정답: ④" }
      ]
    }
  }
];

problems.forEach(p => {
  const filePath = path.join(dir, p.id + '.json');
  fs.writeFileSync(filePath, JSON.stringify(p.json, null, 2), 'utf8');
  console.log(`✅ ${p.id}.json 생성 완료`);
});
console.log('\\n🎯 002-004 배치 완료!');
