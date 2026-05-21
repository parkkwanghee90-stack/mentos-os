const fs = require('fs');
const path = require('path');
const dir = 'C:/mentos_os_clean/public/math_hints/삼각함수활용 4단계(68)';
const imgBase = '/math_crops/(5)수학1 중간/4단계/삼각함수활용 4단계(68)';

const problems = [
  { id:'017', answer:'36', title:'수선의 발과 외접원 차',
    body:"그림과 같이 $\\overline{AB}=3$, $\\overline{AC}=4$인 예각삼각형 $ABC$가 있다. 점 $B$에서 변 $AC$에 내린 수선의 발을 $D$, 점 $C$에서 변 $AB$에 내린 수선의 발을 $E$라 하고, 두 선분 $BD$, $CE$의 교점을 $P$라 하자. 삼각형 $ABC$의 외접원의 넓이와 삼각형 $ADE$의 외접원의 넓이의 차가 $4\\pi$일 때, 삼각형 $PDE$의 외접원의 넓이는 $a\\pi$이다. $55a$의 값을 구하시오. (단, $a$는 상수이다.)",
    choices:null,
    fig:{vb:{x:[-1,7],y:[-1,5]},objs:[
      {type:"polygon",points:[[2,4],[0,0],[6,0]],color:"#94a3b8",fillOpacity:0.05},
      {type:"segment",points:[[0,0],[3.2,2.4]],color:"#60a5fa",weight:1.5},
      {type:"segment",points:[[6,0],[1,1.5]],color:"#60a5fa",weight:1.5},
      {type:"point",x:2,y:4,label:"A",color:"#ffffff"},{type:"point",x:0,y:0,label:"B",color:"#ffffff"},
      {type:"point",x:6,y:0,label:"C",color:"#ffffff"},{type:"point",x:3.2,y:2.4,label:"D",color:"#fbbf24"},
      {type:"point",x:1,y:1.5,label:"E",color:"#fbbf24"},{type:"point",x:1.8,y:1.8,label:"P",color:"#fbbf24"},
      {type:"text",tex:"3",at:[0.7,2.3],color:"#f8fafc"},{type:"text",tex:"4",at:[4.3,2.3],color:"#f8fafc"}
    ]},
    steps:[
      {step:1,label:"P(구하는 것)",formula_raw:"$55a$의 값을 구합니다. (삼각형 $PDE$의 외접원 넓이 $= a\\pi$)"},
      {step:2,label:"C(주어진 단서)",formula_raw:"$\\overline{AB}=3,\\; \\overline{AC}=4$, 예각삼각형\n$D$: $B$에서 $AC$에 내린 수선의 발\n$E$: $C$에서 $AB$에 내린 수선의 발\n$P$: $BD \\cap CE$\n외접원 넓이 차 $= 4\\pi$"},
      {step:3,label:"B(배경지식)",formula_raw:"$\\angle BAC = \\theta$로 놓으면\n$\\overline{AD} = 3\\cos\\theta,\\; \\overline{AE} = 4\\cos\\theta$\n사인법칙, 코사인법칙 활용"},
      {step:4,label:"[칠판 판서] Step 1 – R₁, R₂",formula_raw:"$\\overline{BC} = \\sqrt{25-24\\cos\\theta}$\n$R_1 = \\dfrac{\\sqrt{25-24\\cos\\theta}}{2\\sin\\theta}$\n$\\overline{DE} = \\cos\\theta\\sqrt{25-24\\cos\\theta}$\n$R_2 = \\dfrac{\\cos\\theta\\sqrt{25-24\\cos\\theta}}{2\\sin\\theta}$"},
      {step:5,label:"[칠판 판서] Step 2 – θ 구하기",formula_raw:"$\\pi R_1^2 - \\pi R_2^2 = 4\\pi$\n$$\\frac{(1-\\cos^2\\theta)(25-24\\cos\\theta)}{4\\sin^2\\theta} = 4$$\n$$\\frac{25-24\\cos\\theta}{4} = 4$$\n$$\\cos\\theta = \\frac{3}{8},\\; \\sin\\theta = \\frac{\\sqrt{55}}{8}$$"},
      {step:6,label:"[칠판 판서] Step 3 – PDE 외접원",formula_raw:"사각형 $AEPD$에서 $\\angle AEP = \\angle ADP = \\frac{\\pi}{2}$이므로\n네 점 $A,E,P,D$는 선분 $AP$를 지름으로 하는 한 원 위\n삼각형 $PDE$의 외접원 = 삼각형 $ADE$의 외접원\n$$R_2 = \\frac{6}{\\sqrt{55}},\\; \\pi R_2^2 = \\frac{36}{55}\\pi$$\n$a = \\frac{36}{55}$"},
      {step:7,label:"A(최종 정답)",formula_raw:"$$55a = 55 \\cdot \\frac{36}{55} = 36$$\n$$\\boxed{36}$$"}
    ]
  },
  { id:'018', answer:'④', answerVal:'7/16 π', title:'이등분선과 외접원',
    body:"그림과 같이 $\\overline{AB}=3$, $\\overline{AC}=1$이고 $\\angle BAC = \\dfrac{\\pi}{3}$인 삼각형 $ABC$가 있다. $\\angle BAC$의 이등분선이 선분 $BC$와 만나는 점을 $P$라 할 때, 삼각형 $APC$의 외접원의 넓이는?",
    choices:["① $\\dfrac{\\pi}{4}$","② $\\dfrac{5}{16}\\pi$","③ $\\dfrac{3}{8}\\pi$","④ $\\dfrac{7}{16}\\pi$","⑤ $\\dfrac{\\pi}{2}$"],
    fig:{vb:{x:[-1,6],y:[-1,3]},objs:[
      {type:"polygon",points:[[4.5,2],[0,0],[5,0]],color:"#94a3b8",fillOpacity:0.05},
      {type:"segment",points:[[4.5,2],[3.5,0]],color:"#60a5fa",weight:2},
      {type:"point",x:4.5,y:2,label:"A",color:"#ffffff"},{type:"point",x:0,y:0,label:"B",color:"#ffffff"},
      {type:"point",x:5,y:0,label:"C",color:"#ffffff"},{type:"point",x:3.5,y:0,label:"P",color:"#fbbf24"},
      {type:"text",tex:"3",at:[2,1.3],color:"#f8fafc"},{type:"text",tex:"1",at:[5,1.2],color:"#f8fafc"}
    ]},
    steps:[
      {step:1,label:"P(구하는 것)",formula_raw:"삼각형 $APC$의 외접원의 넓이를 구합니다."},
      {step:2,label:"C(주어진 단서)",formula_raw:"$\\overline{AB}=3,\\; \\overline{AC}=1,\\; \\angle BAC = \\frac{\\pi}{3}$\n$AP$는 $\\angle BAC$의 이등분선"},
      {step:3,label:"B(배경지식)",formula_raw:"이등분선의 성질: $\\overline{BP}:\\overline{PC} = \\overline{AB}:\\overline{AC} = 3:1$\n사인법칙으로 외접원 반지름 구하기"},
      {step:4,label:"[칠판 판서] Step 1 – BP 구하기",formula_raw:"$\\overline{BP}:\\overline{PC} = 3:1$\n$\\overline{PC} = k$라 하면 $\\overline{BP} = 3k$\n삼각형 $BAC$에서 코사인법칙으로 $\\overline{BC} = 4k$:\n$$\\cos\\frac{\\pi}{3} = \\frac{3^2+1^2-(4k)^2}{2\\cdot3\\cdot1}$$\n$$k = \\frac{\\sqrt{7}}{4}$$"},
      {step:5,label:"[칠판 판서] Step 2 – R 구하기",formula_raw:"삼각형 $APC$에서 $\\angle PAC = \\frac{\\pi}{6}$이고\n사인법칙: $\\dfrac{\\overline{PC}}{\\sin\\frac{\\pi}{6}} = 2R$\n$$2R = \\frac{\\frac{\\sqrt{7}}{4}}{\\frac{1}{2}} = \\frac{\\sqrt{7}}{2}$$\n$$R = \\frac{\\sqrt{7}}{4}$$"},
      {step:6,label:"A(최종 정답)",formula_raw:"$$\\pi R^2 = \\pi \\cdot \\frac{7}{16} = \\frac{7}{16}\\pi$$\n$$\\boxed{\\frac{7}{16}\\pi}$$\n정답: ④"}
    ]
  },
  { id:'019', answer:'②', title:'사인법칙과 넓이 추론',
    body:"그림과 같이 $\\overline{AB}=3$인 삼각형 $ABC$에서 $\\angle ABC = \\theta$, $\\angle DAB = 2\\theta$이다. 선분 $AC$ 위의 점 $D$와 선분 $AC$ 위의 점 $E$에 대하여 삼각형 $ADE$의 넓이를 $S(\\theta)$라 하자. (생략된 과정)\n\n위의 (가)에 알맞은 수를 $p$, (나), (다)에 알맞은 식을 각각 $f(\\theta)$, $g(\\theta)$라 할 때,\n$p \\cdot f\\left(\\dfrac{\\pi}{6}\\right) \\cdot g\\left(\\dfrac{\\pi}{12}\\right)$의 값은?",
    choices:["① $\\dfrac{1}{4}$","② $\\dfrac{1}{6}$","③ $\\dfrac{1}{8}$","④ $\\dfrac{1}{10}$","⑤ $\\dfrac{1}{12}$"],
    fig:{vb:{x:[-1,6],y:[-1,4]},objs:[
      {type:"polygon",points:[[2,3.5],[0,0],[5,0]],color:"#94a3b8",fillOpacity:0.05},
      {type:"segment",points:[[2,3.5],[3,1.2]],color:"#60a5fa",weight:1.5},
      {type:"segment",points:[[0,0],[3,1.2]],color:"#60a5fa",weight:1.5},
      {type:"point",x:2,y:3.5,label:"A",color:"#ffffff"},{type:"point",x:0,y:0,label:"B",color:"#ffffff"},
      {type:"point",x:5,y:0,label:"C",color:"#ffffff"},{type:"point",x:3,y:1.2,label:"D",color:"#fbbf24"},
      {type:"point",x:4,y:0.5,label:"E",color:"#fbbf24"},
      {type:"text",tex:"3",at:[0.7,2],color:"#f8fafc"},{type:"text",tex:"\\theta",at:[0.5,0.3],color:"#f59e0b"}
    ]},
    steps:[
      {step:1,label:"P(구하는 것)",formula_raw:"$p \\cdot f\\left(\\frac{\\pi}{6}\\right) \\cdot g\\left(\\frac{\\pi}{12}\\right)$의 값을 구합니다."},
      {step:2,label:"C(주어진 단서)",formula_raw:"$\\overline{AB}=3,\\; \\angle ABC = \\theta,\\; \\angle DAB = 2\\theta$\n$\\angle BDA = \\pi - 3\\theta$"},
      {step:3,label:"B(배경지식)",formula_raw:"사인법칙으로 $\\overline{AD}$를 $\\theta$에 관한 식으로 표현"},
      {step:4,label:"[칠판 판서] Step 1 – AD 구하기",formula_raw:"삼각형 $ABD$에서 사인법칙:\n$$\\frac{\\overline{AD}}{\\sin\\theta} = \\frac{3}{\\sin(\\pi-3\\theta)}$$\n$$\\overline{AD} = \\frac{3\\sin\\theta}{\\sin(\\pi-3\\theta)} = \\frac{3\\sin\\theta}{\\sin 3\\theta}$$\n(가) $p = \\dfrac{1}{3}$"},
      {step:5,label:"[칠판 판서] Step 2 – S(θ)",formula_raw:"$\\angle EAD = \\theta,\\; \\angle ADE = 2\\theta$이므로\n$\\overline{DE} = \\frac{1}{3}\\overline{AD}^2$\n$$S(\\theta) = \\frac{9}{2}\\left(\\frac{\\sin\\theta}{\\sin 3\\theta}\\right)^3 \\cdot \\sin 2\\theta$$\n$f(\\theta) = \\sin(\\pi-3\\theta) = \\sin 3\\theta$\n$g(\\theta) = \\sin 2\\theta$"},
      {step:6,label:"[칠판 판서] Step 3 – 대입",formula_raw:"$$p \\cdot f\\left(\\frac{\\pi}{6}\\right) \\cdot g\\left(\\frac{\\pi}{12}\\right) = \\frac{1}{3} \\cdot \\sin\\frac{\\pi}{2} \\cdot \\sin\\frac{\\pi}{6} = \\frac{1}{3} \\cdot 1 \\cdot \\frac{1}{2} = \\frac{1}{6}$$"},
      {step:7,label:"A(최종 정답)",formula_raw:"$$\\boxed{\\frac{1}{6}}$$\n정답: ②"}
    ]
  },
  { id:'020', answer:'②', answerVal:'36', title:'내접원과 삼각함수',
    body:"그림과 같이 삼각형 $ABC$의 내접원의 반지름의 길이가 $\\dfrac{4\\sqrt{3}}{3}$이고 $\\overline{AB} = 12$, $\\overline{AC} = 4$이다. 삼각형 $ABC$의 둘레의 길이가 최소가 되도록 하는 $\\angle BAC$의 값을 구하시오. (이하 조건 생략)",
    choices:["① $34$","② $36$","③ $38$","④ $40$","⑤ $42$"],
    fig:{vb:{x:[-2,8],y:[-1,5]},objs:[
      {type:"polygon",points:[[3.5,4],[0,0],[7,0]],color:"#94a3b8",fillOpacity:0.05},
      {type:"circle",center:[3,1.2],radius:1.2,color:"#f59e0b",fillOpacity:0,weight:1.5},
      {type:"point",x:3.5,y:4,label:"A",color:"#ffffff"},{type:"point",x:0,y:0,label:"B",color:"#ffffff"},
      {type:"point",x:7,y:0,label:"C",color:"#ffffff"},
      {type:"text",tex:"12",at:[1.2,2.3],color:"#f8fafc"},{type:"text",tex:"4",at:[5.5,2.3],color:"#f8fafc"}
    ]},
    steps:[
      {step:1,label:"P(구하는 것)",formula_raw:"삼각형 $ABC$의 둘레의 길이를 구합니다."},
      {step:2,label:"C(주어진 단서)",formula_raw:"내접원 반지름 $= \\dfrac{4\\sqrt{3}}{3}$\n$\\overline{AB}=12,\\; \\overline{AC}=4$"},
      {step:3,label:"B(배경지식)",formula_raw:"내접원 반지름과 넓이의 관계:\n$r = \\dfrac{\\text{넓이}}{s}$ ($s$: 반둘레)\n$\\tan(\\angle OCD) = \\dfrac{\\sqrt{3}}{3} \\Rightarrow \\angle OCD = \\dfrac{\\pi}{6}$"},
      {step:4,label:"[칠판 판서] Step 1 – 각도",formula_raw:"원의 중심을 $O$라 하고 두 선분 $AB$, $AC$가 원과 만나는 점을 $E$, $F$라 하자.\n$\\tan(\\angle OCD) = \\frac{\\sqrt{3}}{3}$이므로\n$\\angle OCD = \\frac{\\pi}{6},\\; \\angle ACB = \\frac{\\pi}{3}$"},
      {step:5,label:"[칠판 판서] Step 2 – 넓이와 변",formula_raw:"$\\overline{AE} = a$라 하면 $\\overline{AF} = a$이고\n넓이 $= \\frac{1}{2} \\cdot 16 \\cdot (a+4) \\cdot \\sin\\frac{\\pi}{3} = 4\\sqrt{3}(a+4)$\n넓이 합으로부터 $a = 2$\n둘레 $= 2(12+4+2) = 36$"},
      {step:6,label:"A(최종 정답)",formula_raw:"$$\\boxed{36}$$\n정답: ②"}
    ]
  }
];

problems.forEach(p => {
  const json = {
    problem_id:p.id, title:`삼각함수 활용 - ${p.title}`, type:"geometry",
    problem_render:{body:p.body,choices:p.choices,source_image:`${imgBase}/${p.id}.webp`},
    viewBox:p.fig.vb, base_figure:{preset:"custom",objects:p.fig.objs},
    overlay_steps:p.steps
  };
  fs.writeFileSync(path.join(dir,p.id+'.json'),JSON.stringify(json,null,2),'utf8');
  console.log(`✅ ${p.id}.json 완료`);
});
console.log('\n🎯 017-020 완료!');
