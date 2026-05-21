const fs = require('fs');
const path = require('path');
const dir = 'C:/mentos_os_clean/public/math_hints/삼각함수활용 4단계(68)';

const problems = [
  { id: '009', json: { "problem_id":"009","title":"삼각함수 활용 - 종이접기와 외접원","type":"geometry",
    "viewBox":{"x":[-1,6],"y":[-1,5]},
    "base_figure":{"preset":"custom","objects":[
      {"type":"polygon","points":[[2,4],[0,0],[4,0]],"color":"#94a3b8","fillOpacity":0.05},
      {"type":"segment","points":[[0.8,1.6],[3.2,1.6]],"color":"#60a5fa","weight":1.5,"style":"dashed"},
      {"type":"polygon","points":[[0,0],[0.8,1.6],[2,0]],"color":"#22d3ee","fillOpacity":0.08},
      {"type":"polygon","points":[[2,0],[3.2,1.6],[4,0]],"color":"#f59e0b","fillOpacity":0.08},
      {"type":"point","x":2,"y":4,"label":"A","color":"#ffffff"},
      {"type":"point","x":0,"y":0,"label":"B","color":"#ffffff"},
      {"type":"point","x":4,"y":0,"label":"C","color":"#ffffff"},
      {"type":"point","x":2,"y":0,"label":"D","color":"#fbbf24"},
      {"type":"point","x":0.8,"y":1.6,"label":"E","color":"#fbbf24"},
      {"type":"point","x":3.2,"y":1.6,"label":"F","color":"#fbbf24"},
      {"type":"text","tex":"1","at":[0.6,2.2],"color":"#f8fafc"},
      {"type":"text","tex":"1","at":[3.3,2.2],"color":"#f8fafc"}
    ]},
    "overlay_steps":[
      {"step":1,"label":"P(구하는 것)","formula_raw":"$p+q$의 값을 구합니다.\n선분 $DF$의 길이 $= \\dfrac{q}{p}$"},
      {"step":2,"label":"C(주어진 단서)","formula_raw":"$\\overline{AB} = \\overline{AC} = 1,\\; \\angle BAC = \\dfrac{\\pi}{2}$\nD: BC 위의 점, E: AB 위의 점, F: AC 위의 점\nEF를 접는 선으로 하여 점 A가 점 D와 겹침\n삼각형 BDE와 삼각형 DCF의 외접원 반지름 비 $= 2:1$"},
      {"step":3,"label":"B(배경지식)","formula_raw":"종이접기 → $\\overline{AE} = \\overline{DE},\\; \\overline{AF} = \\overline{DF}$\n사인법칙으로 외접원 반지름 구하기"},
      {"step":4,"label":"[칠판 판서] Step 1 – 변수 설정","formula_raw":"$\\overline{DF} = x,\\; \\angle CDF = \\theta$라 하면\n$\\angle BDE = \\dfrac{\\pi}{2} - \\theta$\n$\\overline{AE} = \\overline{DE}$이므로 $\\overline{BE} = 1 - \\overline{DE}$\n같은 방법으로 $\\overline{AF} = \\overline{DF}$이므로 $\\overline{CF} = 1 - x$"},
      {"step":5,"label":"[칠판 판서] Step 2 – 사인법칙","formula_raw":"삼각형 BDE에서 사인법칙:\n$$\\frac{1-\\overline{DE}}{\\sin(\\frac{\\pi}{2}-\\theta)} = \\frac{\\overline{DE}}{\\sin\\frac{\\pi}{4}} = 2r_1$$\n삼각형 DCF에서 사인법칙:\n$$\\frac{1-x}{\\sin\\theta} = \\frac{x}{\\sin\\frac{\\pi}{4}} = 2r_2$$"},
      {"step":6,"label":"[칠판 판서] Step 3 – 연립","formula_raw":"$r_1 = 2r_2$이므로 $\\overline{DE} = 2x$이고\n①에서 $\\dfrac{\\sqrt{2}}{2}(1-2x) = 2x\\cos\\theta$\n②에서 $\\dfrac{\\sqrt{2}}{2}(1-x) = x\\sin\\theta$\n두 식의 양변을 제곱하여 연립하면\n$$(1-2x)^2 + 4(1-x)^2 = 8x^2$$\n$$\\therefore x = \\frac{5}{12}$$"},
      {"step":7,"label":"A(최종 정답)","formula_raw":"$p = 12,\\; q = 5$이므로\n$$\\boxed{p + q = 17}$$"}
    ]
  }},
  { id: '010', json: { "problem_id":"010","title":"삼각함수 활용 - 내접 삼각형과 이등분선","type":"geometry",
    "viewBox":{"x":[-2,5],"y":[-3,4]},
    "base_figure":{"preset":"custom","objects":[
      {"type":"circle","center":[1.5,0.5],"radius":3,"color":"#4ade80","fillOpacity":0,"weight":1.5},
      {"type":"polygon","points":[[0,-2.3],[4,-1.5],[2,3.3]],"color":"#94a3b8","fillOpacity":0.05},
      {"type":"segment","points":[[0,-2.3],[3.5,2.5]],"color":"#60a5fa","weight":1.5},
      {"type":"segment","points":[[3.5,2.5],[4,-1.5]],"color":"#60a5fa","weight":1.5,"style":"dashed"},
      {"type":"point","x":0,"y":-2.3,"label":"A","color":"#ffffff"},
      {"type":"point","x":4,"y":-1.5,"label":"B","color":"#ffffff"},
      {"type":"point","x":2,"y":3.3,"label":"C","color":"#ffffff"},
      {"type":"point","x":3.5,"y":2.5,"label":"D","color":"#fbbf24"},
      {"type":"point","x":2.8,"y":0.3,"label":"E","color":"#fbbf24"},
      {"type":"text","tex":"\\sqrt{3}","at":[0.4,0],"color":"#f8fafc"},
      {"type":"text","tex":"\\sqrt{3}","at":[1.5,-2.2],"color":"#60a5fa"}
    ]},
    "overlay_steps":[
      {"step":1,"label":"P(구하는 것)","formula_raw":"<보기>에서 옳은 것만을 있는 대로 고릅니다."},
      {"step":2,"label":"C(주어진 단서)","formula_raw":"반지름 $\\sqrt{3}$인 원 $\\mathcal{C}$에 내접하는 삼각형 $ABC$\n$\\angle BAC$의 이등분선이 원과 만나는 점(A가 아닌) $= D$\n두 선분 BC, AD의 교점 $= E$\n$\\overline{BD} = \\sqrt{3}$"},
      {"step":3,"label":"B(배경지식)","formula_raw":"$\\angle DAC = \\angle BAD = \\theta$라 하면\n$\\angle DAC$와 $\\angle DBC$는 호 CD에 대한 원주각\n$\\therefore \\angle DBC = \\theta$"},
      {"step":4,"label":"[칠판 판서] Step 1 – ㄱ 검증","formula_raw":"삼각형 ABD에서 사인법칙:\n$$\\frac{\\overline{BD}}{\\sin(\\angle BAD)} = 2\\sqrt{3}$$\n$$\\sin\\theta = \\frac{\\sqrt{3}}{2\\sqrt{3}} = \\frac{1}{2}$$\n$\\therefore \\sin(\\angle DBE) = \\sin(\\angle DBC) = \\dfrac{1}{2}$ **(ㄱ 참)**"},
      {"step":5,"label":"[칠판 판서] Step 2 – ㄴ 검증","formula_raw":"$\\sin\\theta = \\dfrac{1}{2}$이므로 $\\theta = \\dfrac{\\pi}{6}$\n$\\angle BAC = 2\\theta = \\dfrac{\\pi}{3}$\n코사인법칙: $\\overline{AB}^2 + \\overline{AC}^2 = \\overline{AB} \\cdot \\overline{AC} + 9$\n삼각형 CRQ에서 $\\angle RCQ = \\dfrac{\\pi}{3}$, CQ:CR = 2:1\n$\\angle QRC = \\dfrac{\\pi}{2}$ **(ㄴ 참)**"},
      {"step":6,"label":"[칠판 판서] Step 3 – ㄷ 검증","formula_raw":"삼각형 ABC의 넓이가 삼각형 BDE의 넓이의 4배가 되도록 하는\n$\\overline{BE}$의 값의 합은 $\\dfrac{9}{4}$\n**(ㄷ 참)**"},
      {"step":7,"label":"A(최종 정답)","formula_raw":"ㄱ, ㄴ, ㄷ 모두 참\n$$\\boxed{⑤ \\;\\text{ㄱ, ㄴ, ㄷ}}$$"}
    ]
  }},
  { id: '011', json: { "problem_id":"011","title":"삼각함수 활용 - 부채꼴과 코사인법칙","type":"geometry",
    "viewBox":{"x":[-1,7],"y":[-1,5]},
    "base_figure":{"preset":"custom","objects":[
      {"type":"circle","center":[0,0],"radius":4.5,"color":"#4ade80","fillOpacity":0,"weight":1},
      {"type":"segment","points":[[0,0],[4.5,0]],"color":"#cbd5e1","weight":2},
      {"type":"segment","points":[[0,0],[2.5,3.7]],"color":"#cbd5e1","weight":2},
      {"type":"segment","points":[[2.5,3.7],[4.5,0]],"color":"#60a5fa","weight":2},
      {"type":"segment","points":[[2.5,3.7],[3.8,2.2]],"color":"#f59e0b","weight":1.5},
      {"type":"segment","points":[[3.8,2.2],[4.5,0]],"color":"#f59e0b","weight":1.5},
      {"type":"point","x":0,"y":0,"label":"A","color":"#ffffff"},
      {"type":"point","x":4.5,"y":0,"label":"O","color":"#94a3b8"},
      {"type":"point","x":2.5,"y":3.7,"label":"P","color":"#fbbf24"},
      {"type":"point","x":3.8,"y":2.2,"label":"B","color":"#ffffff"},
      {"type":"text","tex":"6","at":[2,0.5],"color":"#f8fafc"},
      {"type":"text","tex":"8\\sqrt{2}","at":[3.8,1],"color":"#60a5fa"}
    ]},
    "overlay_steps":[
      {"step":1,"label":"P(구하는 것)","formula_raw":"선분 $BP$의 길이를 구합니다."},
      {"step":2,"label":"C(주어진 단서)","formula_raw":"중심 $O$, 반지름 $6$인 부채꼴 $OAB$\n$\\overline{AB} = 8\\sqrt{2}$\n호 $AB$ 위의 점 $P$에 대해 $\\angle BPA > 90°$\n$\\overline{AP} : \\overline{BP} = 3 : 1$"},
      {"step":3,"label":"B(배경지식)","formula_raw":"삼각형 $APB$의 외접원의 반지름 $R$\n= 부채꼴 $OAB$의 반지름 = 6\n사인법칙과 코사인법칙 활용"},
      {"step":4,"label":"[칠판 판서] Step 1 – sinθ 구하기","formula_raw":"$\\angle BPA = \\theta$ ($\\theta > \\dfrac{\\pi}{2}$)라 하면\n삼각형 $APB$에서 사인법칙:\n$$\\sin\\theta = \\frac{8\\sqrt{2}}{2 \\cdot 6} = \\frac{2\\sqrt{2}}{3}$$"},
      {"step":5,"label":"[칠판 판서] Step 2 – cosθ 구하기","formula_raw":"$$\\cos^2\\theta = 1 - \\frac{8}{9} = \\frac{1}{9}$$\n$\\theta > \\dfrac{\\pi}{2}$이므로 $\\cos\\theta < 0$\n$$\\cos\\theta = -\\frac{1}{3}$$"},
      {"step":6,"label":"[칠판 판서] Step 3 – BP 구하기","formula_raw":"$\\overline{BP} = k$라 하면 $\\overline{AP} = 3k$\n삼각형 $APB$에서 코사인법칙:\n$$(3k)^2 + k^2 - 2 \\cdot 3k \\cdot k \\cdot (-\\frac{1}{3}) = (8\\sqrt{2})^2$$\n$$9k^2 + k^2 + 2k^2 = 128$$\n$$12k^2 = 128,\\quad k^2 = \\frac{32}{3}$$"},
      {"step":7,"label":"A(최종 정답)","formula_raw":"$$\\overline{BP} = k = \\sqrt{\\frac{32}{3}} = \\frac{4\\sqrt{6}}{3}$$\n$$\\boxed{\\frac{4\\sqrt{6}}{3}}$$\n정답: ⑤"}
    ]
  }},
  { id: '012', json: { "problem_id":"012","title":"삼각함수 활용 - 이등분선과 넓이비","type":"geometry",
    "viewBox":{"x":[-1,7],"y":[-1,4]},
    "base_figure":{"preset":"custom","objects":[
      {"type":"polygon","points":[[3,3],[0,0],[6,0]],"color":"#94a3b8","fillOpacity":0.05},
      {"type":"segment","points":[[3,3],[2.5,0]],"color":"#60a5fa","weight":2},
      {"type":"circle","center":[3,0.8],"radius":2.8,"color":"#4ade80","fillOpacity":0,"weight":1,"strokeStyle":"dashed"},
      {"type":"point","x":3,"y":3,"label":"A","color":"#ffffff"},
      {"type":"point","x":0,"y":0,"label":"B","color":"#ffffff"},
      {"type":"point","x":6,"y":0,"label":"C","color":"#ffffff"},
      {"type":"point","x":2.5,"y":0,"label":"P","color":"#fbbf24"},
      {"type":"text","tex":"4","at":[1.2,1.8],"color":"#f8fafc"},
      {"type":"text","tex":"a","at":[3,-0.5],"color":"#f8fafc"},
      {"type":"text","tex":"8","at":[4.8,1.8],"color":"#f8fafc"}
    ]},
    "overlay_steps":[
      {"step":1,"label":"P(구하는 것)","formula_raw":"선분 $AP$의 길이를 구합니다."},
      {"step":2,"label":"C(주어진 단서)","formula_raw":"양수 $a$에 대하여 $\\overline{AB} = 4,\\; \\overline{BC} = a,\\; \\overline{CA} = 8$\n$\\angle BAC$의 이등분선이 선분 $BC$와 만나는 점 $= P$\n$a(\\sin B + \\sin C) = 6\\sqrt{3}$\n$\\angle BAC > 90°$"},
      {"step":3,"label":"B(배경지식)","formula_raw":"사인법칙: $\\dfrac{a}{2R} = \\sin A$\n이등분선의 성질: $\\overline{BP} : \\overline{PC} = \\overline{AB} : \\overline{AC} = 4 : 8 = 1 : 2$"},
      {"step":4,"label":"[칠판 판서] Step 1 – sinA 구하기","formula_raw":"삼각형 ABC의 외접원 반지름 $R$에서\n$$\\sin B = \\frac{8}{2R},\\; \\sin C = \\frac{4}{2R}$$\n$$a(\\sin B + \\sin C) = a \\cdot \\frac{12}{2R} = \\frac{6a}{R} = 6\\sqrt{3}$$\n$$\\frac{a}{R} = \\sqrt{3},\\; \\sin A = \\frac{a}{2R} = \\frac{\\sqrt{3}}{2}$$"},
      {"step":5,"label":"[칠판 판서] Step 2 – 각도와 넓이비","formula_raw":"$\\angle BAC > 90°$이므로 $\\angle BAC = \\dfrac{2}{3}\\pi$\n이등분선이므로 $\\angle PAB = \\angle PAC = \\dfrac{\\pi}{3}$\n$\\overline{BP} : \\overline{PC} = 4 : 8 = 1 : 2$\n삼각형 $ABP$의 넓이 = 삼각형 $ABC$의 $\\dfrac{1}{3}$"},
      {"step":6,"label":"[칠판 판서] Step 3 – AP 구하기","formula_raw":"$$\\frac{1}{2} \\cdot 4 \\cdot \\overline{AP} \\cdot \\sin\\frac{\\pi}{3} = \\frac{1}{3} \\cdot \\frac{1}{2} \\cdot 4 \\cdot 8 \\cdot \\sin\\frac{2\\pi}{3}$$\n$$\\overline{AP} \\cdot \\frac{\\sqrt{3}}{2} = \\frac{1}{3} \\cdot 8 \\cdot \\frac{\\sqrt{3}}{2}$$\n$$\\overline{AP} = \\frac{8}{3}$$"},
      {"step":7,"label":"A(최종 정답)","formula_raw":"$$\\boxed{\\overline{AP} = \\frac{8}{3}}$$\n정답: ②"}
    ]
  }}
];

problems.forEach(p => {
  fs.writeFileSync(path.join(dir, p.id + '.json'), JSON.stringify(p.json, null, 2), 'utf8');
  console.log(`✅ ${p.id}.json 생성 완료`);
});
console.log('\\n🎯 009-012 배치 완료!');
