const fs=require('fs'),path=require('path');
const dir='C:/mentos_os_clean/public/math_hints/삼각함수활용 4단계(68)';
const ib='/math_crops/(5)수학1 중간/4단계/삼각함수활용 4단계(68)';
const P=[
{id:'026',a:'192',t:'등변사다리꼴과 외접원',b:"그림과 같이 $\\overline{AB}=\\overline{CD}=3\\sqrt{3}$이고 삼각형 $ABD$의 외접원의 반지름의 길이가 $6$인 사각형 $ABCD$가 있다. 사각형 $ABCD$의 넓이를 $S$라 할 때, $\\dfrac{S^2}{13}$의 값을 구하시오.",ch:null,
vb:{x:[-2,5],y:[-3,4]},ob:[
{type:"circle",center:[1.5,0],radius:3.2,color:"#4ade80",fillOpacity:0,weight:1.5},
{type:"polygon",points:[[0.5,-2.5],[2.5,-2.5],[3.5,2],[0,2.5]],color:"#94a3b8",fillOpacity:0.05},
{type:"segment",points:[[0.5,-2.5],[3.5,2]],color:"#60a5fa",weight:1.5},
{type:"point",x:0,y:2.5,label:"D",color:"#ffffff"},{type:"point",x:3.5,y:2,label:"C",color:"#ffffff"},
{type:"point",x:0.5,y:-2.5,label:"A",color:"#ffffff"},{type:"point",x:2.5,y:-2.5,label:"B",color:"#ffffff"}],
st:[
{step:1,label:"P(구하는 것)",formula_raw:"$\\dfrac{S^2}{13}$의 값을 구합니다."},
{step:2,label:"C(주어진 단서)",formula_raw:"$\\overline{AB}=\\overline{CD}=3\\sqrt{3}$\n삼각형 $ABD$의 외접원 반지름 $= 6$"},
{step:3,label:"B(배경지식)",formula_raw:"$\\overline{AB}=\\overline{CD}$이면 등변사다리꼴\n사인법칙으로 $\\sin\\alpha$ 구하기"},
{step:4,label:"[칠판 판서] Step 1 – sinα",formula_raw:"$\\angle ADB = \\alpha$라 할 때\n사인법칙: $\\dfrac{\\overline{AB}}{\\sin\\alpha} = 12$\n$$\\sin\\alpha = \\frac{3\\sqrt{3}}{12} = \\frac{\\sqrt{3}}{4}$$\n$$\\cos\\alpha = \\frac{\\sqrt{13}}{4}$$"},
{step:5,label:"[칠판 판서] Step 2 – 등변사다리꼴",formula_raw:"$\\overline{AB}=\\overline{CD}$이므로 $\\angle ADB = \\angle CBD$\n$\\overline{AD} \\parallel \\overline{BC}$ → 등변사다리꼴\n수선의 발 $H_1, H_2$를 내리면:\n$\\overline{DH_1} = \\overline{BD}\\cos\\alpha = 8\\sqrt{2} \\cdot \\frac{\\sqrt{13}}{4} = 2\\sqrt{26}$\n$\\overline{BH_1} = \\overline{BD}\\sin\\alpha = 8\\sqrt{2} \\cdot \\frac{\\sqrt{3}}{4} = 2\\sqrt{6}$"},
{step:6,label:"[칠판 판서] Step 3 – 넓이",formula_raw:"$\\overline{AH_1} = \\overline{DH_2}$이므로\n$$S = \\overline{DH_1} \\times \\overline{BH_1} = 2\\sqrt{26} \\times 2\\sqrt{6} = 4\\sqrt{156} = 8\\sqrt{39}$$\n$$\\frac{S^2}{13} = \\frac{64 \\cdot 39}{13} = 192$$"},
{step:7,label:"A(최종 정답)",formula_raw:"$$\\boxed{192}$$"}]},

{id:'027',a:'192',t:'등변사다리꼴(쌍둥이)',b:"(026번과 동일 유형의 쌍둥이 문제) 사각형 $ABCD$에서 $\\overline{AB}=\\overline{CD}=3\\sqrt{3}$이고 삼각형 $ABD$의 외접원의 반지름의 길이가 $6$일 때, $\\dfrac{S^2}{13}$의 값을 구하시오.",ch:null,
vb:{x:[-2,5],y:[-3,4]},ob:[
{type:"circle",center:[1.5,0],radius:3.2,color:"#4ade80",fillOpacity:0,weight:1.5},
{type:"polygon",points:[[0.5,-2.5],[2.5,-2.5],[3.5,2],[0,2.5]],color:"#94a3b8",fillOpacity:0.05},
{type:"segment",points:[[0.5,-2.5],[3.5,2]],color:"#60a5fa",weight:1.5},
{type:"point",x:0,y:2.5,label:"D",color:"#ffffff"},{type:"point",x:3.5,y:2,label:"C",color:"#ffffff"},
{type:"point",x:0.5,y:-2.5,label:"A",color:"#ffffff"},{type:"point",x:2.5,y:-2.5,label:"B",color:"#ffffff"}],
st:[
{step:1,label:"P(구하는 것)",formula_raw:"$\\dfrac{S^2}{13}$의 값을 구합니다."},
{step:2,label:"C(주어진 단서)",formula_raw:"026번과 동일 조건"},
{step:3,label:"B(배경지식)",formula_raw:"등변사다리꼴 + 사인법칙"},
{step:4,label:"[칠판 판서] Step 1",formula_raw:"$\\sin\\alpha = \\frac{\\sqrt{3}}{4},\\; \\cos\\alpha = \\frac{\\sqrt{13}}{4}$"},
{step:5,label:"[칠판 판서] Step 2",formula_raw:"$S = 8\\sqrt{39}$\n$\\frac{S^2}{13} = \\frac{64 \\cdot 39}{13} = 192$"},
{step:6,label:"A(최종 정답)",formula_raw:"$$\\boxed{192}$$"}]},

{id:'028',a:'25',t:'코사인법칙 삼각형',b:"$\\overline{BE}=1$, $\\overline{EC}=5$이고 $\\overline{AE}=\\sqrt{10}$, $\\overline{AC}=3\\sqrt{5}$인 삼각형 $AEC$에서 $\\angle AEC = \\theta$일 때, $50\\sin\\theta\\cos\\theta$의 값을 구하시오.",ch:null,
vb:{x:[-1,6],y:[-1,4]},ob:[
{type:"polygon",points:[[2,3],[0,0],[5,0]],color:"#94a3b8",fillOpacity:0.05},
{type:"point",x:2,y:3,label:"A",color:"#ffffff"},{type:"point",x:0,y:0,label:"B",color:"#ffffff"},
{type:"point",x:5,y:0,label:"C",color:"#ffffff"},{type:"point",x:0.8,y:0,label:"E",color:"#fbbf24"},
{type:"text",tex:"1",at:[0.3,-0.4],color:"#f8fafc"},{type:"text",tex:"5",at:[2.8,-0.4],color:"#f8fafc"},
{type:"text",tex:"\\sqrt{10}",at:[1,1.8],color:"#60a5fa"},{type:"text",tex:"3\\sqrt{5}",at:[4,1.8],color:"#60a5fa"}],
st:[
{step:1,label:"P(구하는 것)",formula_raw:"$50\\sin\\theta\\cos\\theta$의 값을 구합니다."},
{step:2,label:"C(주어진 단서)",formula_raw:"$\\overline{BE}=1,\\; \\overline{EC}=5$\n$\\overline{AE}=\\sqrt{10},\\; \\overline{AC}=3\\sqrt{5}$"},
{step:3,label:"B(배경지식)",formula_raw:"코사인법칙으로 $\\cos\\theta$를 구합니다."},
{step:4,label:"[칠판 판서] Step 1",formula_raw:"삼각형 $AEC$에서 코사인법칙:\n$$\\cos\\theta = \\frac{10+45-25}{2\\times\\sqrt{10}\\times 3\\sqrt{5}} = \\frac{30}{30\\sqrt{2}} = \\frac{\\sqrt{2}}{2}$$"},
{step:5,label:"[칠판 판서] Step 2",formula_raw:"$$\\sin\\theta = \\frac{\\sqrt{2}}{2}$$\n$$50\\sin\\theta\\cos\\theta = 50 \\cdot \\frac{\\sqrt{2}}{2} \\cdot \\frac{\\sqrt{2}}{2} = 50 \\cdot \\frac{1}{2} = 25$$"},
{step:6,label:"A(최종 정답)",formula_raw:"$$\\boxed{25}$$"}]},

{id:'029',a:'②',t:'원에 내접하는 사각형',b:"그림과 같이 원에 내접하는 사각형 $ABCP$에서 $\\overline{AB}=\\overline{BC}=3$이고 $\\angle ABC = \\dfrac{2}{3}\\pi$이다. $\\overline{AP}+\\overline{CP}=8$일 때, 사각형 $ABCP$의 넓이는?",
ch:["① $5\\sqrt{3}$","② $\\dfrac{16\\sqrt{3}}{3}$","③ $6\\sqrt{3}$","④ $\\dfrac{19\\sqrt{3}}{3}$","⑤ $7\\sqrt{3}$"],
vb:{x:[-2,5],y:[-2,4]},ob:[
{type:"circle",center:[1.5,0.5],radius:3,color:"#4ade80",fillOpacity:0,weight:1.5},
{type:"polygon",points:[[-0.5,2],[0.5,-1.5],[3.5,-1.5],[4,2]],color:"#94a3b8",fillOpacity:0.05},
{type:"point",x:-0.5,y:2,label:"A",color:"#ffffff"},{type:"point",x:0.5,y:-1.5,label:"B",color:"#ffffff"},
{type:"point",x:3.5,y:-1.5,label:"C",color:"#ffffff"},{type:"point",x:4,y:2,label:"P",color:"#ffffff"},
{type:"point",x:1.5,y:1,label:"O",color:"#94a3b8"}],
st:[
{step:1,label:"P(구하는 것)",formula_raw:"사각형 $ABCP$의 넓이를 구합니다."},
{step:2,label:"C(주어진 단서)",formula_raw:"원에 내접, $\\overline{AB}=\\overline{BC}=3$\n$\\angle ABC = \\frac{2}{3}\\pi$\n$\\overline{AP}+\\overline{CP}=8$"},
{step:3,label:"B(배경지식)",formula_raw:"내접 사각형: $\\angle APC = \\pi - \\angle ABC = \\frac{\\pi}{3}$\n코사인법칙으로 $\\overline{AC}$ 구하기"},
{step:4,label:"[칠판 판서] Step 1 – AC",formula_raw:"$\\overline{AC}^2 = 9+9-2\\cdot3\\cdot3\\cdot\\cos\\frac{2}{3}\\pi = 27$\n$\\overline{AC} = 3\\sqrt{3}$\n$\\angle APC = \\frac{\\pi}{3}$"},
{step:5,label:"[칠판 판서] Step 2 – xy",formula_raw:"$\\overline{AP}=x,\\; \\overline{CP}=y$라 하면 $x+y=8$\n코사인법칙: $(3\\sqrt{3})^2 = x^2+y^2-2xy\\cos\\frac{\\pi}{3}$\n$27 = (x+y)^2 - 3xy = 64 - 3xy$\n$xy = \\frac{37}{3}$"},
{step:6,label:"[칠판 판서] Step 3 – 넓이",formula_raw:"$\\triangle ABC = \\frac{1}{2}\\cdot3\\cdot3\\cdot\\sin\\frac{2\\pi}{3} = \\frac{9\\sqrt{3}}{4}$\n$\\triangle ACP = \\frac{1}{2}\\cdot\\frac{37}{3}\\cdot\\sin\\frac{\\pi}{3} = \\frac{37\\sqrt{3}}{12}$\n사각형 넓이 $= \\frac{9\\sqrt{3}}{4} + \\frac{37\\sqrt{3}}{12} = \\frac{64\\sqrt{3}}{12} = \\frac{16\\sqrt{3}}{3}$"},
{step:7,label:"A(최종 정답)",formula_raw:"$$\\boxed{\\frac{16\\sqrt{3}}{3}}$$\n정답: ②"}]}
];
P.forEach(p=>{const j={problem_id:p.id,title:`삼각함수 활용 - ${p.t}`,type:"geometry",
problem_render:{body:p.b,choices:p.ch,source_image:`${ib}/${p.id}.webp`},
viewBox:p.vb,base_figure:{preset:"custom",objects:p.ob},overlay_steps:p.st};
fs.writeFileSync(path.join(dir,p.id+'.json'),JSON.stringify(j,null,2),'utf8');
console.log(`✅ ${p.id}.json`);});
console.log('\n🎯 026-029 완료!');
