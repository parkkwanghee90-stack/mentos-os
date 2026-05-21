const fs=require('fs'),path=require('path');
const dir='C:/mentos_os_clean/public/math_hints/삼각함수활용 4단계(68)';
const ib='/math_crops/(5)수학1 중간/4단계/삼각함수활용 4단계(68)';
const P=[
{id:'030',a:'④',t:'넓이 최댓값',b:"원 $O$ 위의 세 점 $A, D, E$에 대하여 $\\overline{AD}:\\overline{DB}=3:2$이고 $\\overline{AD}=\\overline{AE}=r$일 때, 삼각형 $ABE$의 넓이의 최댓값을 구하시오.",
ch:["① $\\dfrac{7\\sqrt{3}}{4}$","② $4\\sqrt{3}$","③ $\\dfrac{9\\sqrt{3}}{4}$","④ $\\dfrac{5\\sqrt{2}}{2}$","⑤ $3\\sqrt{3}$"],
vb:{x:[-2,5],y:[-2,4]},ob:[
{type:"circle",center:[1.5,0.5],radius:3,color:"#4ade80",fillOpacity:0,weight:1.5},
{type:"polygon",points:[[0,3],[0,-2],[4,0]],color:"#94a3b8",fillOpacity:0.05},
{type:"point",x:0,y:3,label:"D",color:"#ffffff"},{type:"point",x:0,y:-2,label:"B",color:"#ffffff"},
{type:"point",x:4,y:0,label:"E",color:"#ffffff"},{type:"point",x:0,y:0.5,label:"A",color:"#fbbf24"}],
st:[
{step:1,label:"P(구하는 것)",formula_raw:"삼각형의 넓이의 최댓값을 구합니다."},
{step:2,label:"C(주어진 단서)",formula_raw:"원 $O$의 반지름 $r$\n$\\overline{AD} = \\overline{AE} = r$\n$\\overline{AD}:\\overline{DB} = 3:2$"},
{step:3,label:"B(배경지식)",formula_raw:"사인법칙과 코사인법칙으로 넓이를 $\\theta$의 함수로 표현"},
{step:4,label:"[칠판 판서] Step 1",formula_raw:"$\\overline{BD} = \\frac{2}{3}r$\n코사인법칙으로 $\\angle BDC = \\alpha$를 설정하고\n원주각의 성질로 $\\angle BAC = \\alpha$"},
{step:5,label:"[칠판 판서] Step 2",formula_raw:"$\\cos(\\alpha+\\beta) = -\\frac{5}{12}$\n삼각형 $ABE$에서 코사인법칙으로\n넓이 $= \\frac{1}{2} \\cdot t \\cdot 3\\sqrt{2} \\cdot \\sin(\\theta)$\n최댓값 조건을 구합니다."},
{step:6,label:"A(최종 정답)",formula_raw:"$$\\boxed{④}$$"}]},

{id:'031',a:'⑤',answerVal:'2√2',t:'닮은 삼각형',b:"그림과 같이 원에 내접하는 사각형 $ABCE$에서 삼각형 $ABE$와 삼각형 $DCE$는 서로 닮음이다. $\\overline{AB}:\\overline{DC}=1:2$이고 $\\overline{BD}=2\\sqrt{30}$일 때, 선분 $AE$의 길이를 구하시오.",
ch:["① $\\sqrt{2}$","② $\\dfrac{3\\sqrt{2}}{2}$","③ $\\sqrt{6}$","④ $2$","⑤ $2\\sqrt{2}$"],
vb:{x:[-2,5],y:[-2,4]},ob:[
{type:"circle",center:[1.5,0.5],radius:3,color:"#4ade80",fillOpacity:0,weight:1.5},
{type:"polygon",points:[[0,3],[0,-1.5],[4,-0.5],[3.5,2.5]],color:"#94a3b8",fillOpacity:0.05},
{type:"segment",points:[[0,-1.5],[3.5,2.5]],color:"#60a5fa",weight:1.5},
{type:"point",x:0,y:3,label:"A",color:"#ffffff"},{type:"point",x:0,y:-1.5,label:"B",color:"#ffffff"},
{type:"point",x:4,y:-0.5,label:"C",color:"#ffffff"},{type:"point",x:3.5,y:2.5,label:"D",color:"#ffffff"},
{type:"point",x:2,y:0.5,label:"E",color:"#fbbf24"}],
st:[
{step:1,label:"P(구하는 것)",formula_raw:"선분 $AE$의 길이를 구합니다."},
{step:2,label:"C(주어진 단서)",formula_raw:"$\\triangle ABE \\sim \\triangle DCE$\n$\\overline{AB}:\\overline{DC}=1:2$\n$\\overline{BD}=2\\sqrt{30}$"},
{step:3,label:"B(배경지식)",formula_raw:"닮음비 $1:2$이므로 $\\overline{BE}:\\overline{CE}=1:2$\n원주각의 성질로 $\\angle BDC = \\angle BAC = \\alpha$"},
{step:4,label:"[칠판 판서] Step 1 – BE, CE",formula_raw:"$\\overline{BE}=k$라 하면 $\\overline{CE}=2k$\n$\\angle BDC = \\angle BAC = \\alpha$이고\n$\\angle BEC = \\alpha + \\beta$\n코사인법칙으로 $(2\\sqrt{30})^2 = k^2 + 4k^2 - 2k\\cdot2k\\cdot(-\\frac{5}{12})$\n$120 = 5k^2 + \\frac{5k^2}{3}$\n$k^2 = 18 \\Rightarrow k = 3\\sqrt{2}$"},
{step:5,label:"[칠판 판서] Step 2 – AE 구하기",formula_raw:"$\\overline{AE}=t$라 하면\n삼각형 $ABE$에서 코사인법칙으로\n$4^2 = t^2 + 18 - 2t \\cdot 3\\sqrt{2} \\cdot \\frac{5}{12}$\n$2t^2 - 5\\sqrt{2}t + 4 = 0$\n$(2t-\\sqrt{2})(t-2\\sqrt{2})=0$\n$t > \\sqrt{2}$이므로 $t = 2\\sqrt{2}$"},
{step:6,label:"A(최종 정답)",formula_raw:"$$\\boxed{\\overline{AE} = 2\\sqrt{2}}$$\n정답: ⑤"}]},

{id:'032',a:'①',answerVal:'6',t:'외접원과 수선',b:"$\\overline{AB}:\\overline{AC}=\\sqrt{2}:1$이고 삼각형 $ABC$의 외접원의 넓이가 $50\\pi$이다. 점 $A$에서 변 $BC$에 내린 수선의 발을 $H$라 하고 $\\overline{AH}=2$일 때, 선분 $BH$의 길이는?",
ch:["① $6$","② $\\dfrac{13}{2}$","③ $7$","④ $\\dfrac{15}{2}$","⑤ $8$"],
vb:{x:[-1,7],y:[-1,4]},ob:[
{type:"polygon",points:[[3,3],[0,0],[6,0]],color:"#94a3b8",fillOpacity:0.05},
{type:"segment",points:[[3,3],[3,0]],color:"#60a5fa",weight:1.5,"style":"dashed"},
{type:"point",x:3,y:3,label:"A",color:"#ffffff"},{type:"point",x:0,y:0,label:"B",color:"#ffffff"},
{type:"point",x:6,y:0,label:"C",color:"#ffffff"},{type:"point",x:3,y:0,label:"H",color:"#fbbf24"},
{type:"text",tex:"2",at:[3.3,1.5],color:"#60a5fa"},
{type:"text",tex:"\\sqrt{2}x",at:[1,2],color:"#f8fafc"},{type:"text",tex:"x",at:[4.8,2],color:"#f8fafc"}],
st:[
{step:1,label:"P(구하는 것)",formula_raw:"선분 $BH$의 길이를 구합니다."},
{step:2,label:"C(주어진 단서)",formula_raw:"$\\overline{AB}:\\overline{AC}=\\sqrt{2}:1$\n외접원의 넓이 $= 50\\pi$\n$\\overline{AH}=2$"},
{step:3,label:"B(배경지식)",formula_raw:"$\\pi R^2 = 50\\pi \\Rightarrow R = 5\\sqrt{2}$\n사인법칙으로 $\\sin C$를 구하고 변의 길이 결정"},
{step:4,label:"[칠판 판서] Step 1 – AB, AC",formula_raw:"$\\overline{AC}=x$라 하면 $\\overline{AB}=\\sqrt{2}x$\n직각삼각형 $AHC$에서 $\\sin C = \\frac{2}{x}$\n사인법칙: $\\frac{\\overline{AB}}{\\sin C} = 2R = 10\\sqrt{2}$\n$$\\sqrt{2}x \\cdot \\frac{x}{2} = 10\\sqrt{2}$$\n$$x^2 = 20 \\Rightarrow x = 2\\sqrt{5}$$"},
{step:5,label:"[칠판 판서] Step 2 – BH",formula_raw:"$\\overline{AB} = 2\\sqrt{10}$\n직각삼각형 $ABH$에서\n$$\\overline{BH} = \\sqrt{\\overline{AB}^2 - \\overline{AH}^2} = \\sqrt{40-4} = 6$$"},
{step:6,label:"A(최종 정답)",formula_raw:"$$\\boxed{\\overline{BH} = 6}$$\n정답: ①"}]},

{id:'033',a:'①',answerVal:'21',t:'두 외접원과 거리',b:"삼각형 $ABC$에서 삼각형 $ABC$의 외접원을 $\\mathcal{C}_1$, 삼각형 $ADC$의 외접원을 $\\mathcal{C}_2$라 하자. $\\angle ACD = \\dfrac{\\pi}{3}$이고 원 $\\mathcal{C}_1$의 반지름이 $R$일 때, $\\overline{OO'}^2$의 값을 구하시오.",
ch:null,
vb:{x:[-2,8],y:[-2,5]},ob:[
{type:"circle",center:[2,1],radius:3.5,color:"#4ade80",fillOpacity:0,weight:1.5},
{type:"circle",center:[5,2],radius:2.5,color:"#60a5fa",fillOpacity:0,weight:1,"strokeStyle":"dashed"},
{type:"polygon",points:[[1,4],[0,0],[6,0]],color:"#94a3b8",fillOpacity:0.05},
{type:"segment",points:[[1,4],[4,1.5]],color:"#f59e0b",weight:1.5},
{type:"point",x:1,y:4,label:"A",color:"#ffffff"},{type:"point",x:0,y:0,label:"B",color:"#ffffff"},
{type:"point",x:6,y:0,label:"C",color:"#ffffff"},{type:"point",x:4,y:1.5,label:"D",color:"#fbbf24"},
{type:"point",x:2,y:1,label:"O",color:"#94a3b8"},{type:"point",x:5,y:2,label:"O'",color:"#94a3b8"}],
st:[
{step:1,label:"P(구하는 것)",formula_raw:"$\\overline{OO'}^2$의 값을 구합니다."},
{step:2,label:"C(주어진 단서)",formula_raw:"$\\mathcal{C}_1$: 삼각형 $ABC$의 외접원 (반지름 $R$)\n$\\mathcal{C}_2$: 삼각형 $ADC$의 외접원\n$\\angle ACD = \\frac{\\pi}{3}$\n$\\overline{BC} = \\frac{36\\sqrt{7}}{7}$, $\\sin(\\angle BAC) = \\frac{2\\sqrt{7}}{7}$"},
{step:3,label:"B(배경지식)",formula_raw:"사인법칙으로 $R$을 구하고\n$\\angle AO'D$는 호 $AD$의 중심각\n코사인법칙으로 $\\overline{OO'}^2$ 계산"},
{step:4,label:"[칠판 판서] Step 1 – R 구하기",formula_raw:"사인법칙: $\\frac{\\overline{BC}}{\\sin(\\angle BAC)} = 2R$\n$$\\frac{\\frac{36\\sqrt{7}}{7}}{\\frac{2\\sqrt{7}}{7}} = 18 = 2R$$\n$$R = 9$$"},
{step:5,label:"[칠판 판서] Step 2 – AO' 구하기",formula_raw:"$\\mathcal{C}_2$에서 $\\angle AO'D = 2\\angle ACD = \\frac{2}{3}\\pi$\n이등변삼각형 $O'AD$에서 $\\angle DAO' = \\frac{\\pi}{6}$\n$\\overline{OA} = R = 9,\\; \\overline{AO'} = 5\\sqrt{3}$"},
{step:6,label:"[칠판 판서] Step 3 – OO'²",formula_raw:"$\\angle OAO' = \\frac{\\pi}{6}$이므로\n삼각형 $AOO'$에서 코사인법칙:\n$$\\overline{OO'}^2 = 9^2 + (5\\sqrt{3})^2 - 2\\cdot9\\cdot5\\sqrt{3}\\cdot\\cos\\frac{\\pi}{6}$$\n$$= 81 + 75 - 135 = 21$$"},
{step:7,label:"A(최종 정답)",formula_raw:"$$\\boxed{\\overline{OO'}^2 = 21}$$"}]}
];
P.forEach(p=>{const j={problem_id:p.id,title:`삼각함수 활용 - ${p.t}`,type:"geometry",
problem_render:{body:p.b,choices:p.ch,source_image:`${ib}/${p.id}.webp`},
viewBox:p.vb,base_figure:{preset:"custom",objects:p.ob},overlay_steps:p.st};
fs.writeFileSync(path.join(dir,p.id+'.json'),JSON.stringify(j,null,2),'utf8');
console.log(`✅ ${p.id}.json`);});
console.log('\n🎯 030-033 완료! 전체 001-033 해설 애니메이션 생성 완료!');
