const fs = require('fs');
const path = require('path');
const dir = 'C:/mentos_os_clean/public/math_hints/삼각함수활용 4단계(68)';
const imgBase = '/math_crops/(5)수학1 중간/4단계/삼각함수활용 4단계(68)';

const problems = [
  { id:'013', answer:'③', answerVal:'4/3', title:'부채꼴과 코사인법칙',
    body:"그림과 같이 반지름의 길이가 $2$이고 중심각의 크기가 $\\dfrac{\\pi}{2}$인 부채꼴 $OAB$가 있다. 호 $AB$ 위에 점 $C$를 $\\overline{AC}=1$이 되도록 잡는다. 선분 $OC$ 위의 점 $O$가 아닌 점 $D$에 대하여 삼각형 $BOD$의 넓이가 $\\dfrac{7}{6}$일 때, 선분 $OD$의 길이는?",
    choices:["① $\\dfrac{5}{4}$","② $\\dfrac{31}{24}$","③ $\\dfrac{4}{3}$","④ $\\dfrac{11}{8}$","⑤ $\\dfrac{17}{12}$"],
    fig:{vb:{x:[-1,5],y:[-1,4]},objs:[
      {type:"segment",points:[[0,0],[4,0]],color:"#cbd5e1",weight:2},
      {type:"segment",points:[[0,0],[0,3.5]],color:"#cbd5e1",weight:2},
      {type:"circle",center:[0,0],radius:3.5,color:"#4ade80",fillOpacity:0,weight:1},
      {type:"segment",points:[[0,0],[2.8,2.1]],color:"#60a5fa",weight:1.5},
      {type:"segment",points:[[0,0],[1.8,1.35]],color:"#f59e0b",weight:2},
      {type:"segment",points:[[4,0],[0,3.5]],color:"#94a3b8",weight:1},
      {type:"point",x:0,y:0,label:"O",color:"#ffffff"},
      {type:"point",x:4,y:0,label:"A",color:"#ffffff"},
      {type:"point",x:0,y:3.5,label:"B",color:"#ffffff"},
      {type:"point",x:2.8,y:2.1,label:"C",color:"#fbbf24"},
      {type:"point",x:1.8,y:1.35,label:"D",color:"#fbbf24"},
      {type:"text",tex:"2",at:[-0.5,1.5],color:"#f8fafc"},
      {type:"text",tex:"1",at:[3.6,1.2],color:"#f8fafc"}
    ]},
    steps:[
      {step:1,label:"P(구하는 것)",formula_raw:"선분 $OD$의 길이를 구합니다."},
      {step:2,label:"C(주어진 단서)",formula_raw:"반지름 $2$, 중심각 $\\dfrac{\\pi}{2}$인 부채꼴 $OAB$\n$\\overline{AC} = 1$, 삼각형 $BOD$의 넓이 $= \\dfrac{7}{6}$"},
      {step:3,label:"B(배경지식)",formula_raw:"코사인법칙으로 $\\cos\\theta$를 구하고\n삼각형의 넓이 공식으로 $\\overline{OD}$를 구합니다."},
      {step:4,label:"[칠판 판서] Step 1 – cosθ",formula_raw:"$\\angle COA = \\theta$라 하면 삼각형 $COA$에서 코사인법칙:\n$$\\cos\\theta = \\frac{2^2 + 2^2 - 1^2}{2 \\cdot 2 \\cdot 2} = \\frac{7}{8}$$"},
      {step:5,label:"[칠판 판서] Step 2 – ∠BOD",formula_raw:"$\\angle BOD = \\dfrac{\\pi}{2} - \\theta$이고\n삼각형 $BOD$의 넓이가 $\\dfrac{7}{6}$이므로 $\\overline{OD} = x$라 놓으면\n$$\\frac{1}{2} \\cdot 2 \\cdot x \\cdot \\sin\\left(\\frac{\\pi}{2}-\\theta\\right) = \\frac{7}{6}$$"},
      {step:6,label:"[칠판 판서] Step 3 – x 계산",formula_raw:"$\\sin(\\frac{\\pi}{2}-\\theta) = \\cos\\theta = \\frac{7}{8}$이므로\n$$\\frac{7}{8}x = \\frac{7}{6}$$\n$$x = \\frac{4}{3}$$"},
      {step:7,label:"A(최종 정답)",formula_raw:"$$\\boxed{\\overline{OD} = \\frac{4}{3}}$$\n정답: ③"}
    ]
  },
  { id:'014', answer:'①', answerVal:'8√3', title:'부채꼴 삼등분점',
    body:"다음 그림과 같이 중심이 $O$, 반지름의 길이가 $1$이고 중심각의 크기가 $\\theta$인 부채꼴 $OAB$가 있다. 호 $AB$의 삼등분점 중 점 $A$에 가까운 점을 $C$라 하고, 직선 $OA$와 직선 $BC$가 만나는 점을 $D$라 하자. 다음은 두 선분 $AD$, $CD$와 호 $AC$로 둘러싸인 부분의 넓이 $S(\\theta)$를 구하는 과정이다. $\\left(\\text{단, } 0 < \\theta < \\dfrac{3}{4}\\pi\\right)$\n\n위의 (가), (나), (다)에 알맞은 식을 각각 $f(\\theta), g(\\theta), h(\\theta)$라 할 때, $\\dfrac{f(\\frac{\\pi}{2}) \\cdot g(\\frac{\\pi}{4})}{h(\\frac{\\pi}{8})}$의 값은?",
    choices:["① $8\\sqrt{3}$","② $\\dfrac{17\\sqrt{3}}{2}$","③ $9\\sqrt{3}$","④ $\\dfrac{19\\sqrt{3}}{2}$","⑤ $10\\sqrt{3}$"],
    fig:{vb:{x:[-0.5,3],y:[-0.5,3]},objs:[
      {type:"segment",points:[[0,0],[2.5,0]],color:"#cbd5e1",weight:2},
      {type:"segment",points:[[0,0],[1,2.2]],color:"#cbd5e1",weight:2},
      {type:"circle",center:[0,0],radius:2.5,color:"#4ade80",fillOpacity:0,weight:1},
      {type:"segment",points:[[1,2.2],[2.5,0]],color:"#94a3b8",weight:1.5},
      {type:"segment",points:[[1.8,1.5],[2.5,0]],color:"#60a5fa",weight:1.5},
      {type:"point",x:0,y:0,label:"O",color:"#ffffff"},
      {type:"point",x:2.5,y:0,label:"A",color:"#ffffff"},
      {type:"point",x:1,y:2.2,label:"B",color:"#ffffff"},
      {type:"point",x:1.8,y:1.5,label:"C",color:"#fbbf24"},
      {type:"point",x:2.5,y:0.5,label:"D",color:"#fbbf24"},
      {type:"text",tex:"\\theta",at:[0.4,0.25],color:"#f59e0b"}
    ]},
    steps:[
      {step:1,label:"P(구하는 것)",formula_raw:"$\\dfrac{f(\\frac{\\pi}{2}) \\cdot g(\\frac{\\pi}{4})}{h(\\frac{\\pi}{8})}$의 값을 구합니다."},
      {step:2,label:"C(주어진 단서)",formula_raw:"반지름 $1$, 중심각 $\\theta$인 부채꼴\n$C$: 호 $AB$의 삼등분점 중 $A$에 가까운 점\n$D$: 직선 $OA$와 직선 $BC$의 교점"},
      {step:3,label:"B(배경지식)",formula_raw:"삼등분점이므로 $\\angle BOC = \\dfrac{2}{3}\\theta$\n사인법칙으로 $\\overline{OD}$ 구하기"},
      {step:4,label:"[칠판 판서] Step 1 – (가)(나) 도출",formula_raw:"$C$가 점 $A$에 가까운 삼등분점이므로\n$$\\angle BOC = \\frac{2}{3}\\theta \\quad \\text{(가)}$$\n삼각형 $BOD$에서 사인법칙으로\n$$\\overline{OD} = \\frac{\\cos\\frac{\\theta}{3}}{\\cos\\frac{2}{3}\\theta} \\quad \\text{(나)}$$"},
      {step:5,label:"[칠판 판서] Step 2 – S(θ)",formula_raw:"부채꼴 $OAC$의 넓이: $\\dfrac{\\theta}{6}$ → (다) $= \\dfrac{\\theta}{6}$\n$$S(\\theta) = \\frac{1}{2} \\cdot \\frac{\\cos\\frac{\\theta}{3}}{\\cos\\frac{2\\theta}{3}} \\cdot \\sin\\frac{\\theta}{3} - \\frac{\\theta}{6}$$\n$f(\\theta) = \\dfrac{2}{3}\\theta,\\; g(\\theta) = \\cos\\dfrac{2}{3}\\theta,\\; h(\\theta) = \\dfrac{\\theta}{6}$"},
      {step:6,label:"[칠판 판서] Step 3 – 대입",formula_raw:"$$f\\left(\\frac{\\pi}{2}\\right) = \\frac{\\pi}{3},\\quad g\\left(\\frac{\\pi}{4}\\right) = \\frac{\\sqrt{3}}{2},\\quad h\\left(\\frac{\\pi}{8}\\right) = \\frac{\\pi}{48}$$\n$$\\frac{\\frac{\\pi}{3} \\cdot \\frac{\\sqrt{3}}{2}}{\\frac{\\pi}{48}} = 8\\sqrt{3}$$"},
      {step:7,label:"A(최종 정답)",formula_raw:"$$\\boxed{8\\sqrt{3}}$$\n정답: ①"}
    ]
  },
  { id:'015', answer:'11', title:'외접원 반지름 비',
    body:"$\\angle ABC = \\dfrac{\\pi}{3}$, $\\overline{BC} = 6$인 삼각형 $ABC$가 있다. 선분 $BC$ 위에 점 $B$와 점 $C$가 아닌 점 $D$를 잡고, 삼각형 $ABD$의 외접원의 반지름의 길이를 $r_1$, 삼각형 $ACD$의 외접원의 반지름의 길이를 $r_2$라 하자. $\\dfrac{r_2}{r_1} = \\dfrac{\\sqrt{13}}{3}$일 때, 선분 $AB$의 길이는 $\\dfrac{q}{p}$이다. $p+q$의 값을 구하시오. (단, $p$와 $q$는 서로소인 자연수이다.)",
    choices:null,
    fig:{vb:{x:[-1,7],y:[-1,5]},objs:[
      {type:"polygon",points:[[2.5,4],[0,0],[6,0]],color:"#94a3b8",fillOpacity:0.05},
      {type:"segment",points:[[2.5,4],[2.5,0]],color:"#60a5fa",weight:2},
      {type:"point",x:2.5,y:4,label:"A",color:"#ffffff"},
      {type:"point",x:0,y:0,label:"B",color:"#ffffff"},
      {type:"point",x:6,y:0,label:"C",color:"#ffffff"},
      {type:"point",x:2.5,y:0,label:"D",color:"#fbbf24"},
      {type:"text",tex:"\\frac{\\pi}{3}",at:[0.6,0.5],color:"#f59e0b"},
      {type:"text",tex:"6",at:[3,-0.5],color:"#f8fafc"}
    ]},
    steps:[
      {step:1,label:"P(구하는 것)",formula_raw:"$p+q$의 값을 구합니다. ($\\overline{AB} = \\dfrac{q}{p}$)"},
      {step:2,label:"C(주어진 단서)",formula_raw:"$\\angle ABC = \\dfrac{\\pi}{3},\\; \\overline{BC} = 6$\n$D$: 선분 $BC$ 위의 점\n$\\dfrac{r_2}{r_1} = \\dfrac{\\sqrt{13}}{3}$"},
      {step:3,label:"B(배경지식)",formula_raw:"삼각형 $ABD$에서 사인법칙:\n$\\dfrac{\\overline{AB}}{\\sin\\theta} = 2r_1$\n삼각형 $ADC$에서 사인법칙:\n$\\dfrac{\\overline{AC}}{\\sin(\\pi-\\theta)} = 2r_2$"},
      {step:4,label:"[칠판 판서] Step 1 – 비례식",formula_raw:"$\\angle ADB = \\theta$라 하면\n$$\\frac{r_2}{r_1} = \\frac{\\overline{AC}}{\\overline{AB}} = \\frac{\\sqrt{13}}{3}$$\n$t > 0$인 실수에 대하여 $\\overline{AB} = 3t,\\; \\overline{AC} = \\sqrt{13}\\,t$"},
      {step:5,label:"[칠판 판서] Step 2 – 코사인법칙",formula_raw:"삼각형 $ABC$에서 코사인법칙:\n$$13t^2 = 9t^2 + 36 - 2 \\cdot 3t \\cdot 6 \\cdot \\cos\\frac{\\pi}{3}$$\n$$13t^2 = 9t^2 + 36 - 18t$$\n$$2t^2 + 9t - 18 = 0$$\n$$(2t-3)(t+6) = 0 \\Rightarrow t = \\frac{3}{2}$$"},
      {step:6,label:"A(최종 정답)",formula_raw:"$\\overline{AB} = 3t = \\dfrac{9}{2}$\n$p = 2,\\; q = 9$\n$$\\boxed{p+q = 11}$$"}
    ]
  },
  { id:'016', answer:'71', title:'삼각형 조건과 외접원',
    body:"삼각형 $ABC$가 다음 조건을 만족시킨다.\n\n(가) $\\cos A = -\\dfrac{1}{4}$\n\n(나) $\\sin B + \\sin C = \\dfrac{9}{8}$\n\n삼각형 $ABC$의 넓이가 $\\sqrt{15}$일 때, 삼각형 $ABC$의 외접원의 넓이는 $\\dfrac{q}{p}\\pi$이다. $p+q$의 값을 구하시오. (단, $p$와 $q$는 서로소인 자연수이다.)",
    choices:null,
    fig:{vb:{x:[-1,6],y:[-1,4]},objs:[
      {type:"polygon",points:[[1.5,3],[0,0],[5,0]],color:"#94a3b8",fillOpacity:0.05},
      {type:"point",x:1.5,y:3,label:"A",color:"#ffffff"},
      {type:"point",x:0,y:0,label:"B",color:"#ffffff"},
      {type:"point",x:5,y:0,label:"C",color:"#ffffff"}
    ]},
    steps:[
      {step:1,label:"P(구하는 것)",formula_raw:"$p+q$의 값을 구합니다.\n외접원의 넓이 $= \\dfrac{q}{p}\\pi$"},
      {step:2,label:"C(주어진 단서)",formula_raw:"(가) $\\cos A = -\\dfrac{1}{4}$\n(나) $\\sin B + \\sin C = \\dfrac{9}{8}$\n넓이 $= \\sqrt{15}$"},
      {step:3,label:"B(배경지식)",formula_raw:"사인법칙: $a = 2R\\sin A,\\; b = 2R\\sin B,\\; c = 2R\\sin C$\n넓이 $= \\dfrac{1}{2}bc\\sin A$\n코사인법칙: $a^2 = b^2 + c^2 - 2bc\\cos A$"},
      {step:4,label:"[칠판 판서] Step 1 – sinA, a 표현",formula_raw:"$\\sin A = \\sqrt{1-(\\frac{-1}{4})^2} = \\frac{\\sqrt{15}}{4}$\n$a = \\frac{\\sqrt{15}}{2}R$ ... ①"},
      {step:5,label:"[칠판 판서] Step 2 – b+c, bc",formula_raw:"(나)에서 $b + c = 2R \\cdot \\frac{9}{8} = \\frac{9}{4}R$ ... ②\n넓이: $\\frac{1}{2}bc \\cdot \\frac{\\sqrt{15}}{4} = \\sqrt{15}$\n$bc = 8$ ... ③"},
      {step:6,label:"[칠판 판서] Step 3 – R² 구하기",formula_raw:"코사인법칙: $a^2 = (b+c)^2 - 2bc - 2bc\\cos A$\n$= (b+c)^2 - \\frac{3}{2}bc$\n①,②,③ 대입:\n$$\\frac{15}{4}R^2 = \\frac{81}{16}R^2 - 12$$\n$$R^2 = \\frac{64}{7}$$"},
      {step:7,label:"A(최종 정답)",formula_raw:"외접원의 넓이 $= \\pi R^2 = \\dfrac{64}{7}\\pi$\n$p=7,\\; q=64$\n$$\\boxed{p+q=71}$$"}
    ]
  }
];

problems.forEach(p => {
  const json = {
    problem_id: p.id, title: `삼각함수 활용 - ${p.title}`, type: "geometry",
    problem_render: { body: p.body, choices: p.choices, source_image: `${imgBase}/${p.id}.webp` },
    viewBox: p.fig.vb, base_figure: { preset: "custom", objects: p.fig.objs },
    overlay_steps: p.steps
  };
  fs.writeFileSync(path.join(dir, p.id+'.json'), JSON.stringify(json,null,2), 'utf8');
  console.log(`✅ ${p.id}.json 완료`);
});
console.log('\n🎯 013-016 완료!');
