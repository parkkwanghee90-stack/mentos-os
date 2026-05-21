const fs = require('fs');
const path = require('path');
const dir = 'C:/mentos_os_clean/public/math_hints/삼각함수활용 4단계(68)';

const problems = [
  {
    id: '005',
    json: {
      "problem_id": "005", "title": "삼각함수 활용 - 외접원 반지름 비", "type": "geometry",
      "viewBox": { "x": [-2, 7], "y": [-4, 4] },
      "base_figure": { "preset": "custom", "objects": [
        { "type": "circle", "center": [2.5,0], "radius": 3.5, "color": "#4ade80", "fillOpacity": 0, "weight": 1.5 },
        { "type": "circle", "center": [3.5,-0.8], "radius": 2.2, "color": "#60a5fa", "fillOpacity": 0, "weight": 1, "strokeStyle": "dashed" },
        { "type": "polygon", "points": [[3,3],[1,-3],[5.5,-1]], "color": "#94a3b8", "fillOpacity": 0.05 },
        { "type": "segment", "points": [[3,3],[4.2,-0.5]], "color": "#f59e0b", "weight": 1.5 },
        { "type": "segment", "points": [[1,-3],[4.2,-0.5]], "color": "#f59e0b", "weight": 1.5 },
        { "type": "point", "x": 3, "y": 3, "label": "C", "color": "#ffffff" },
        { "type": "point", "x": 1, "y": -3, "label": "A", "color": "#ffffff" },
        { "type": "point", "x": 5.5, "y": -1, "label": "B", "color": "#ffffff" },
        { "type": "point", "x": 4.2, "y": -0.5, "label": "D", "color": "#fbbf24" },
        { "type": "text", "tex": "2\\sqrt{7}", "at": [3.9,1.5], "color": "#f8fafc" }
      ]},
      "overlay_steps": [
        { "step": 1, "label": "P(구하는 것)", "formula_raw": "$\\overline{BC} + \\overline{BD}$의 값을 구합니다." },
        { "step": 2, "label": "C(주어진 단서)", "formula_raw": "$\\overline{AC} > 2\\sqrt{7}$인 삼각형 $ABC$\n점 $D$는 선분 $AC$ 위의 점\n$\\overline{CD} = 2\\sqrt{7},\\; \\cos(\\angle BDA) = \\dfrac{\\sqrt{7}}{4}$\n$R_1 : R_2 = 4 : 3$" },
        { "step": 3, "label": "B(배경지식)", "formula_raw": "사인법칙에서 $\\dfrac{BC}{\\sin A} = 2R_1,\\; \\dfrac{BD}{\\sin A} = 2R_2$\n같은 각 $A$에 대한 사인값이 같으므로\n$\\overline{BC} : \\overline{BD} = R_1 : R_2 = 4 : 3$" },
        { "step": 4, "label": "[칠판 판서] Step 1 – 비례 설정", "formula_raw": "$\\overline{BC} = 4k,\\; \\overline{BD} = 3k$ ($k > 0$)라 하자.\n삼각형 $BCD$에서 코사인법칙:\n$$\\cos(\\angle CDB) = \\cos(\\pi - \\angle BDA) = -\\frac{\\sqrt{7}}{4}$$" },
        { "step": 5, "label": "[칠판 판서] Step 2 – k 구하기", "formula_raw": "삼각형 $BCD$에서 코사인법칙:\n$$\\cos(\\angle CDB) = \\frac{(2\\sqrt{7})^2 + (3k)^2 - (4k)^2}{2 \\cdot 2\\sqrt{7} \\cdot 3k} = -\\frac{\\sqrt{7}}{4}$$\n$$\\frac{-7k^2 + 28}{12\\sqrt{7}k} = -\\frac{\\sqrt{7}}{4}$$\n$$7k^2 - 21k - 28 = 0 \\Rightarrow 7(k+1)(k-4) = 0$$\n$k > 0$이므로 $k = 4$" },
        { "step": 6, "label": "A(최종 정답)", "formula_raw": "$\\overline{BC} + \\overline{BD} = 4(4) + 3(4) = 16 + 12$\n$$\\boxed{28}$$" }
      ]
    }
  },
  {
    id: '006',
    json: {
      "problem_id": "006", "title": "삼각함수 활용 - 중점과 내분점", "type": "geometry",
      "viewBox": { "x": [-1, 9], "y": [-1, 5] },
      "base_figure": { "preset": "custom", "objects": [
        { "type": "polygon", "points": [[3,4],[0,0],[8,0]], "color": "#94a3b8", "fillOpacity": 0.05 },
        { "type": "segment", "points": [[1.5,2],[4.9,1.5]], "color": "#60a5fa", "weight": 2 },
        { "type": "point", "x": 3, "y": 4, "label": "A", "color": "#ffffff" },
        { "type": "point", "x": 0, "y": 0, "label": "B", "color": "#ffffff" },
        { "type": "point", "x": 8, "y": 0, "label": "C", "color": "#ffffff" },
        { "type": "point", "x": 1.5, "y": 2, "label": "M", "color": "#fbbf24" },
        { "type": "point", "x": 4.9, "y": 1.5, "label": "N", "color": "#fbbf24" }
      ]},
      "overlay_steps": [
        { "step": 1, "label": "P(구하는 것)", "formula_raw": "삼각형 $ABC$의 넓이를 구합니다." },
        { "step": 2, "label": "C(주어진 단서)", "formula_raw": "$2\\overline{AB} = \\overline{AC}$\nM: $AB$의 중점, N: $AC$를 $3:5$로 내분\n$\\overline{MN} = \\overline{AB}$\n삼각형 $AMN$의 외접원의 넓이 $= 16\\pi$" },
        { "step": 3, "label": "B(배경지식)", "formula_raw": "코사인법칙으로 $\\cos A$를 구하고\n사인법칙으로 $R$을 구합니다." },
        { "step": 4, "label": "[칠판 판서] Step 1 – 변수 설정", "formula_raw": "$\\overline{AB} = k$라 하면 $\\overline{AC} = 2k$\nM은 중점이므로 $\\overline{AM} = \\dfrac{k}{2}$\nN은 $3:5$ 내분점이므로 $\\overline{AN} = 2k \\cdot \\dfrac{3}{8} = \\dfrac{3k}{4}$\n$\\overline{MN} = \\overline{AB} = k$" },
        { "step": 5, "label": "[칠판 판서] Step 2 – cosA 구하기", "formula_raw": "삼각형 $AMN$에서 코사인법칙:\n$$\\cos A = \\frac{(\\frac{k}{2})^2 + (\\frac{3k}{4})^2 - k^2}{2 \\cdot \\frac{k}{2} \\cdot \\frac{3k}{4}} = -\\frac{1}{4}$$\n$$\\sin A = \\frac{\\sqrt{15}}{4}$$" },
        { "step": 6, "label": "[칠판 판서] Step 3 – R과 k 구하기", "formula_raw": "외접원의 넓이 $= 16\\pi \\Rightarrow R = 4$\n사인법칙: $\\dfrac{MN}{\\sin A} = 2R$\n$$\\frac{k}{\\frac{\\sqrt{15}}{4}} = 8 \\Rightarrow k = 2\\sqrt{15}$$" },
        { "step": 7, "label": "A(최종 정답)", "formula_raw": "삼각형 $ABC$의 넓이\n$$= \\frac{1}{2} \\cdot \\overline{AB} \\cdot \\overline{AC} \\cdot \\sin A = \\frac{1}{2} \\cdot 2\\sqrt{15} \\cdot 4\\sqrt{15} \\cdot \\frac{\\sqrt{15}}{4}$$\n$$= 15\\sqrt{15}$$\n$$\\boxed{15\\sqrt{15}}$$\n정답: ④" }
      ]
    }
  },
  {
    id: '007',
    json: {
      "problem_id": "007", "title": "삼각함수 활용 - 외접원과 닮음", "type": "geometry",
      "viewBox": { "x": [-1, 8], "y": [-3, 5] },
      "base_figure": { "preset": "custom", "objects": [
        { "type": "circle", "center": [3,0.5], "radius": 3.5, "color": "#4ade80", "fillOpacity": 0, "weight": 1.5 },
        { "type": "polygon", "points": [[1.5,3.5],[0,-2],[6.5,-1]], "color": "#94a3b8", "fillOpacity": 0.05 },
        { "type": "segment", "points": [[0,-2],[5.5,2.5]], "color": "#60a5fa", "weight": 1.5 },
        { "type": "segment", "points": [[0,-2],[3.5,1]], "color": "#60a5fa", "weight": 1.5 },
        { "type": "point", "x": 1.5, "y": 3.5, "label": "A", "color": "#ffffff" },
        { "type": "point", "x": 0, "y": -2, "label": "B", "color": "#ffffff" },
        { "type": "point", "x": 6.5, "y": -1, "label": "C", "color": "#ffffff" },
        { "type": "point", "x": 3.5, "y": 1, "label": "D", "color": "#fbbf24" },
        { "type": "point", "x": 5.5, "y": 2.5, "label": "E", "color": "#fbbf24" },
        { "type": "text", "tex": "2", "at": [0.4,1], "color": "#f8fafc" }
      ]},
      "overlay_steps": [
        { "step": 1, "label": "P(구하는 것)", "formula_raw": "$p + q$의 값을 구합니다.\n외접원의 넓이 $= \\dfrac{q}{p}\\pi$" },
        { "step": 2, "label": "C(주어진 단서)", "formula_raw": "$\\overline{AB} = 2,\\; \\cos(\\angle BAC) = \\dfrac{\\sqrt{3}}{6}$\n$D$: 선분 $AC$ 위의 점, $E$: 직선 $BD$와 외접원의 교점\n$\\overline{DE} = 5,\\; \\overline{CD} + \\overline{CE} = 5\\sqrt{3}$" },
        { "step": 3, "label": "B(배경지식)", "formula_raw": "$\\angle BAC$와 $\\angle BEC$는 호 $BC$에 대한 원주각이므로\n$\\angle BAC = \\angle BEC$\n닮음을 이용하여 변의 길이를 구합니다." },
        { "step": 4, "label": "[칠판 판서] Step 1 – 변수 설정", "formula_raw": "$\\overline{CD} = a$라 하면 $\\overline{CE} = 5\\sqrt{3} - a$\n$\\angle BAC = \\angle BEC$이고 $\\cos(\\angle BAC) = \\dfrac{\\sqrt{3}}{6}$\n삼각형 $ECD$에서 코사인법칙으로 $a$를 구합니다." },
        { "step": 5, "label": "[칠판 판서] Step 2 – a 구하기", "formula_raw": "$$a^2 = 5^2 + (5\\sqrt{3}-a)^2 - 2 \\cdot 5 \\cdot (5\\sqrt{3}-a) \\cdot \\frac{\\sqrt{3}}{6}$$\n정리하면 $a = 3\\sqrt{3}$\n$\\overline{CD} = 3\\sqrt{3},\\; \\overline{CE} = 2\\sqrt{3}$" },
        { "step": 6, "label": "[칠판 판서] Step 3 – 닮음과 BD", "formula_raw": "두 삼각형 $ABD$와 $ECD$는 서로 닮음:\n$\\overline{AB} : \\overline{EC} = \\overline{BD} : \\overline{CD}$\n$2 : 2\\sqrt{3} = \\overline{BD} : 3\\sqrt{3}$\n$\\overline{BD} = 3,\\; \\overline{BE} = 8$" },
        { "step": 7, "label": "[칠판 판서] Step 4 – R 구하기", "formula_raw": "삼각형 $EBC$에서 코사인법칙으로 $\\overline{BC} = 2\\sqrt{15}$\n$\\sin(\\angle BAC) = \\dfrac{\\sqrt{33}}{6}$\n사인법칙: $2R = \\dfrac{\\overline{BC}}{\\sin(\\angle BAC)} = \\dfrac{2\\sqrt{15} \\cdot 6}{\\sqrt{33}} = \\dfrac{6\\sqrt{55}}{11}$\n$$R = \\frac{6\\sqrt{55}}{11},\\; \\pi R^2 = \\frac{180}{11}\\pi$$" },
        { "step": 8, "label": "A(최종 정답)", "formula_raw": "$p = 11,\\; q = 180$\n$$\\boxed{p + q = 191}$$" }
      ]
    }
  },
  {
    id: '008',
    json: {
      "problem_id": "008", "title": "삼각함수 활용 - 반원과 넓이", "type": "geometry",
      "viewBox": { "x": [-2.5, 2.5], "y": [-0.5, 2.5] },
      "base_figure": { "preset": "custom", "objects": [
        { "type": "segment", "points": [[-2,0],[2,0]], "color": "#cbd5e1", "weight": 2 },
        { "type": "circle", "center": [0,0], "radius": 2, "color": "#4ade80", "fillOpacity": 0, "weight": 1.5 },
        { "type": "segment", "points": [[0,0],[1.2,1.6]], "color": "#94a3b8", "weight": 1.5 },
        { "type": "segment", "points": [[-2,0],[-0.5,1.2]], "color": "#94a3b8", "weight": 1, "style": "dashed" },
        { "type": "segment", "points": [[-2,0],[1.2,1.6]], "color": "#60a5fa", "weight": 1.5 },
        { "type": "segment", "points": [[2,0],[1.2,1.6]], "color": "#60a5fa", "weight": 1.5 },
        { "type": "segment", "points": [[-0.5,1.2],[2,0]], "color": "#94a3b8", "weight": 1.5 },
        { "type": "segment", "points": [[0,0],[-0.5,1.2]], "color": "#94a3b8", "weight": 1.5 },
        { "type": "point", "x": -2, "y": 0, "label": "A", "color": "#ffffff" },
        { "type": "point", "x": 2, "y": 0, "label": "B", "color": "#ffffff" },
        { "type": "point", "x": 0, "y": 0, "label": "O", "color": "#94a3b8" },
        { "type": "point", "x": 1.2, "y": 1.6, "label": "C", "color": "#fbbf24" },
        { "type": "point", "x": -0.5, "y": 1.2, "label": "P", "color": "#fbbf24" },
        { "type": "point", "x": 0.5, "y": 0.9, "label": "Q", "color": "#fbbf24" },
        { "type": "point", "x": 1, "y": 0, "label": "D", "color": "#fbbf24" },
        { "type": "text", "tex": "\\theta", "at": [-1.6,0.25], "color": "#f59e0b" },
        { "type": "text", "tex": "4", "at": [0,-0.4], "color": "#f8fafc" }
      ]},
      "overlay_steps": [
        { "step": 1, "label": "P(구하는 것)", "formula_raw": "$p \\cdot f\\left(\\dfrac{\\pi}{16}\\right) \\cdot g\\left(\\dfrac{\\pi}{8}\\right)$의 값을 구합니다." },
        { "step": 2, "label": "C(주어진 단서)", "formula_raw": "지름 $AB = 4$인 반원, 중점 $O$\n$\\angle CAB = \\theta \\Rightarrow \\angle COB = 2\\theta$\n삼각형 $POB$는 이등변삼각형\n선분 $PO \\parallel$ 선분 $QD$" },
        { "step": 3, "label": "B(배경지식)", "formula_raw": "원주각과 중심각의 관계: 중심각 $= 2 \\times$ 원주각\n닮음삼각형의 성질" },
        { "step": 4, "label": "[칠판 판서] Step 1 – (가) 구하기", "formula_raw": "$\\angle COB = 2\\theta$이고 삼각형 $POB$가 이등변삼각형\n$\\angle OQB = \\dfrac{\\pi}{2}$이므로 $Q$는 선분 $PB$의 중점\n$\\angle POQ = 2\\theta$\n선분 $PO \\parallel QD$이므로 삼각형 $POB \\sim QDB$\n$$\\therefore \\overline{QD} = 1 \\quad \\text{(가)}$$" },
        { "step": 5, "label": "[칠판 판서] Step 2 – (나) 구하기", "formula_raw": "$\\angle QDB = 4\\theta$ (나)\n$$S(\\theta) = \\frac{1}{2} \\cdot 1 \\cdot 1 \\cdot \\sin(4\\theta)$$" },
        { "step": 6, "label": "[칠판 판서] Step 3 – T(θ) 구하기", "formula_raw": "$\\overline{CQ} = \\overline{CO} - \\overline{QO}$이므로\n$$T(\\theta) = \\frac{1}{2} \\cdot \\overline{PQ} \\cdot \\overline{CQ} = \\sin 2\\theta \\cdot (2 - 2\\cos 2\\theta)$$\n$\\therefore$ (다) $= 2\\cos 2\\theta$" },
        { "step": 7, "label": "A(최종 정답)", "formula_raw": "$p = 1,\\; f(\\theta) = 4\\theta,\\; g(\\theta) = 2\\cos 2\\theta$\n$$p \\cdot f\\!\\left(\\frac{\\pi}{16}\\right) \\cdot g\\!\\left(\\frac{\\pi}{8}\\right) = 1 \\cdot \\frac{\\pi}{4} \\cdot \\sqrt{2}$$\n$$= \\frac{\\sqrt{2}}{4}\\pi$$\n$$\\boxed{\\frac{\\sqrt{2}}{4}\\pi}$$\n정답: ①" }
      ]
    }
  }
];

problems.forEach(p => {
  fs.writeFileSync(path.join(dir, p.id + '.json'), JSON.stringify(p.json, null, 2), 'utf8');
  console.log(`✅ ${p.id}.json 생성 완료`);
});
console.log('\\n🎯 005-008 배치 완료!');
