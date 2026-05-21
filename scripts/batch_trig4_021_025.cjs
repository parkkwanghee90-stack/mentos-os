const fs=require('fs'),path=require('path');
const dir='C:/mentos_os_clean/public/math_hints/삼각함수활용 4단계(68)';
const ib='/math_crops/(5)수학1 중간/4단계/삼각함수활용 4단계(68)';
const P=[
{id:'021',a:'13',t:'사각형과 외접원',b:"그림과 같이 $\\overline{AB}=a$, $\\overline{DA}=2a$인 사각형 $ABCD$에서 $\\angle DAB = \\dfrac{2}{3}\\pi$이고 $\\overline{BE}:\\overline{ED}=3:4$이다. 삼각형 $DAB$의 외접원의 반지름의 길이가 $1$일 때, 사각형 $ABCD$의 넓이는 $\\dfrac{q}{p}\\sqrt{3}$이다. $p+q$의 값을 구하시오.",ch:null,
vb:{x:[-1,5],y:[-2,4]},ob:[
{type:"polygon",points:[[0,1.5],[1.5,-1.5],[4,-1],[3,2.5]],color:"#94a3b8",fillOpacity:0.05},
{type:"segment",points:[[0,1.5],[4,-1]],color:"#60a5fa",weight:1.5},
{type:"point",x:0,y:1.5,label:"A",color:"#ffffff"},{type:"point",x:1.5,y:-1.5,label:"B",color:"#ffffff"},
{type:"point",x:4,y:-1,label:"C",color:"#ffffff"},{type:"point",x:3,y:2.5,label:"D",color:"#ffffff"},
{type:"point",x:2.4,y:0.6,label:"E",color:"#fbbf24"}],
st:[
{step:1,label:"P(구하는 것)",formula_raw:"사각형 $ABCD$의 넓이를 구합니다."},
{step:2,label:"C(주어진 단서)",formula_raw:"$\\overline{AB}=a,\\; \\overline{DA}=2a,\\; \\angle DAB=\\frac{2}{3}\\pi$\n$\\overline{BE}:\\overline{ED}=3:4$, $R=1$"},
{step:3,label:"B(배경지식)",formula_raw:"코사인법칙으로 $\\overline{BD}$를 구하고\n사인법칙으로 $a$를 구합니다."},
{step:4,label:"[칠판 판서] Step 1",formula_raw:"삼각형 $DAB$에서 코사인법칙:\n$$\\overline{BD}^2 = a^2 + 4a^2 - 2\\cdot a\\cdot 2a\\cdot\\cos\\frac{2}{3}\\pi = 7a^2$$\n$$\\overline{BD} = \\sqrt{7}a$$"},
{step:5,label:"[칠판 판서] Step 2",formula_raw:"사인법칙: $\\dfrac{\\sqrt{7}a}{\\sin\\frac{2}{3}\\pi} = 2$\n$$a = \\frac{\\sqrt{21}}{7}$$\n$\\overline{BC}=3a,\\; \\overline{DC}=2a$, $\\angle BCD = \\frac{\\pi}{3}$"},
{step:6,label:"[칠판 판서] Step 3",formula_raw:"넓이 $= \\triangle ABD + \\triangle BCD$\n$= \\frac{1}{2}\\cdot\\frac{\\sqrt{21}}{7}\\cdot\\frac{2\\sqrt{21}}{7}\\cdot\\sin\\frac{2}{3}\\pi + \\frac{1}{2}\\cdot\\frac{3\\sqrt{21}}{7}\\cdot\\frac{2\\sqrt{21}}{7}\\cdot\\sin\\frac{\\pi}{3}$\n$= \\frac{3\\sqrt{3}}{14} + \\frac{9\\sqrt{3}}{14} = \\frac{6\\sqrt{3}}{7}$"},
{step:7,label:"A(최종 정답)",formula_raw:"$p=7,\\; q=6$\n$$\\boxed{p+q=13}$$"}]},

{id:'022',a:'④',t:'코사인법칙 보기',b:"$\\angle BAC = \\angle BCA = \\dfrac{\\pi}{3}$인 삼각형 $ABC$에서 $\\overline{AB}=1$이다. 선분 $BC$ 위의 점 $P$, 선분 $AB$ 위의 점 $Q$, 선분 $CA$ 위의 점 $R$에 대하여 (보기) 중 옳은 것을 고르시오.",ch:["① ㄱ","② ㄴ","③ ㄱ, ㄷ","④ ㄴ, ㄷ","⑤ ㄱ, ㄴ, ㄷ"],
vb:{x:[-1,4],y:[-1,3]},ob:[
{type:"polygon",points:[[0.5,2],[0,0],[3,0]],color:"#94a3b8",fillOpacity:0.05},
{type:"point",x:0.5,y:2,label:"A",color:"#ffffff"},{type:"point",x:0,y:0,label:"B",color:"#ffffff"},
{type:"point",x:3,y:0,label:"C",color:"#ffffff"},{type:"point",x:1.5,y:0,label:"P",color:"#fbbf24"},
{type:"point",x:0.2,y:0.8,label:"Q",color:"#fbbf24"},{type:"point",x:1.5,y:1.2,label:"R",color:"#fbbf24"}],
st:[
{step:1,label:"P(구하는 것)",formula_raw:"<보기>에서 옳은 것만을 있는 대로 고릅니다."},
{step:2,label:"C(주어진 단서)",formula_raw:"$\\angle BAC = \\angle BCA = \\frac{\\pi}{3},\\; \\overline{AB}=1$\n$\\overline{AP}=a,\\; \\overline{BQ}=b$라 하면 $\\overline{CR}=1-a-b$"},
{step:3,label:"B(배경지식)",formula_raw:"코사인법칙, 삼각형의 넓이 공식\n외접원의 넓이 비교"},
{step:4,label:"[칠판 판서] Step 1 – ㄱ검증",formula_raw:"삼각형 $APR$, $PBQ$에서 코사인법칙 연립\n$\\overline{PR}^2 = \\overline{PQ}^2$이므로\n$2a+b = 1$ ... ②\nㄱ: $2\\overline{AP}+\\overline{BQ}=1$ → $3\\overline{AP}+2\\overline{BQ} < 2$ 검증 → **(ㄱ 거짓)**"},
{step:5,label:"[칠판 판서] Step 2 – ㄴ,ㄷ 검증",formula_raw:"②에서 $b=1-2a$이므로\n$\\overline{CQ}=2a,\\; \\overline{CR}=a$\n삼각형 $CRQ$에서 $\\angle RCQ = \\frac{\\pi}{3}$, CQ:CR=2:1\n$\\angle QRC = \\frac{\\pi}{2}$ → **(ㄴ 참)**\n삼각형 $PBQ$와 $CRQ$의 외접원 넓이 비교 → **(ㄷ 참)**"},
{step:6,label:"A(최종 정답)",formula_raw:"ㄴ, ㄷ만 참\n$$\\boxed{④ \\;\\text{ㄴ, ㄷ}}$$"}]},

{id:'023',a:'④',answerVal:'2√3',t:'코사인법칙 넓이',b:"$\\angle ADE = \\dfrac{\\pi}{3}$이고 $\\overline{AD} = \\overline{CE}$, $\\overline{DE} = \\sqrt{13}$, $\\overline{AE}=a+1$일 때, 삼각형 $BDE$의 넓이를 구하시오. (보기 생략)",ch:["① $\\sqrt{3}$","② $\\dfrac{3\\sqrt{3}}{2}$","③ $\\dfrac{5\\sqrt{3}}{3}$","④ $2\\sqrt{3}$","⑤ $\\dfrac{7\\sqrt{3}}{3}$"],
vb:{x:[-1,6],y:[-1,4]},ob:[
{type:"polygon",points:[[2,3.5],[0,0],[5,0]],color:"#94a3b8",fillOpacity:0.05},
{type:"segment",points:[[2,3.5],[3.5,1]],color:"#60a5fa",weight:1.5},
{type:"point",x:2,y:3.5,label:"A",color:"#ffffff"},{type:"point",x:0,y:0,label:"B",color:"#ffffff"},
{type:"point",x:5,y:0,label:"C",color:"#ffffff"},{type:"point",x:3.5,y:1,label:"D",color:"#fbbf24"},
{type:"point",x:4,y:0.3,label:"E",color:"#fbbf24"},
{type:"text",tex:"\\sqrt{13}",at:[2.5,0.3],color:"#60a5fa"}],
st:[
{step:1,label:"P(구하는 것)",formula_raw:"삼각형 $BDE$의 넓이를 구합니다."},
{step:2,label:"C(주어진 단서)",formula_raw:"$\\angle ADE = \\frac{\\pi}{3}$\n$\\overline{AD}=\\overline{CE}=a$\n$\\overline{DE}=\\sqrt{13}$, $\\overline{AE}=a+1$"},
{step:3,label:"B(배경지식)",formula_raw:"코사인법칙으로 $a$를 구합니다."},
{step:4,label:"[칠판 판서] Step 1",formula_raw:"삼각형 $ADE$에서 코사인법칙:\n$$(\\sqrt{13})^2 = a^2 + (a+1)^2 - 2a(a+1)\\cos\\frac{\\pi}{3}$$\n$$13 = a^2 + a^2 + 2a + 1 - a(a+1)$$\n$$a^2 + a - 12 = 0$$\n$$(a+4)(a-3) = 0 \\Rightarrow a = 3$$"},
{step:5,label:"[칠판 판서] Step 2",formula_raw:"$\\triangle ADE = \\frac{1}{2}\\cdot 4\\cdot 3\\cdot\\sin\\frac{\\pi}{3} = 3\\sqrt{3}$\n$\\triangle ABE = \\frac{1}{2}\\cdot 4\\cdot 1\\cdot\\sin\\frac{\\pi}{3} = \\sqrt{3}$\n$$\\triangle BDE = \\triangle ADE - \\triangle ABE = 2\\sqrt{3}$$"},
{step:6,label:"A(최종 정답)",formula_raw:"$$\\boxed{2\\sqrt{3}}$$\n정답: ④"}]},

{id:'024',a:'20',t:'원과 수선의 발',b:"원에 내접하는 삼각형 $ABC$에서 점 $O$에서 선분 $AB$에 내린 수선의 발을 $M$이라 하자. (조건 생략) $\\overline{OH}^2 = m + n\\sqrt{3}$일 때, $m^2 + n^2$의 값을 구하시오.",ch:null,
vb:{x:[-2,4],y:[-2,3]},ob:[
{type:"circle",center:[1,0.5],radius:2.5,color:"#4ade80",fillOpacity:0,weight:1.5},
{type:"polygon",points:[[-0.5,2.5],[0,-1.5],[3.5,-0.5]],color:"#94a3b8",fillOpacity:0.05},
{type:"segment",points:[[1,0.5],[1.2,-1]],color:"#60a5fa",weight:1.5,"style":"dashed"},
{type:"point",x:1,y:0.5,label:"O",color:"#94a3b8"},
{type:"point",x:-0.5,y:2.5,label:"A",color:"#ffffff"},{type:"point",x:0,y:-1.5,label:"B",color:"#ffffff"},{type:"point",x:3.5,y:-0.5,label:"P",color:"#ffffff"},
{type:"point",x:1.2,y:-1,label:"M",color:"#fbbf24"},{type:"point",x:1.5,y:0,label:"H",color:"#fbbf24"}],
st:[
{step:1,label:"P(구하는 것)",formula_raw:"$m^2 + n^2$의 값을 구합니다."},
{step:2,label:"C(주어진 단서)",formula_raw:"$\\overline{OA}=2$, 직각이등변삼각형 $OAB$\n$\\angle OAM = \\frac{\\pi}{4}$이므로 $\\overline{AM}=\\overline{BM}=\\sqrt{2}$\n$\\angle BAH = \\frac{\\pi}{6}$이므로 $\\overline{BH}=\\sqrt{2}$"},
{step:3,label:"B(배경지식)",formula_raw:"삼각형 $BHM$은 정삼각형\n코사인법칙으로 $\\overline{OH}^2$ 계산"},
{step:4,label:"[칠판 판서] Step 1",formula_raw:"$\\overline{OM}=\\sqrt{2},\\; \\overline{HM}=\\sqrt{2}$\n$\\angle OMH = \\frac{\\pi}{6}$\n코사인법칙:\n$$\\overline{OH}^2 = 2+2-2\\cdot\\sqrt{2}\\cdot\\sqrt{2}\\cdot\\cos\\frac{\\pi}{6} = 4-2\\sqrt{3}$$"},
{step:5,label:"A(최종 정답)",formula_raw:"$m=4,\\; n=-2$\n$$m^2+n^2 = 16+4 = 20$$\n$$\\boxed{20}$$"}]},

{id:'025',a:'50',t:'지수함수와 사인법칙',b:"$a > 1$인 실수 $a$에 대하여 함수 $y=a^x$의 그래프 위의 점 $A$와 $y=\\log_a x$의 그래프 위의 점 $B$가 있다. (조건 생략) $a+t$의 값이 $k$일 때, $100k$의 값을 구하시오.",ch:null,
vb:{x:[-1,4],y:[-1,4]},ob:[
{type:"segment",points:[[0,0],[3,0]],color:"#cbd5e1",weight:1},
{type:"segment",points:[[0,0],[0,3]],color:"#cbd5e1",weight:1},
{type:"segment",points:[[0,0],[2.5,2.5]],color:"#94a3b8",weight:1,"style":"dashed"},
{type:"point",x:1,y:2,label:"A",color:"#fbbf24"},{type:"point",x:2,y:1,label:"B",color:"#fbbf24"},
{type:"point",x:0,y:0,label:"O",color:"#ffffff"},{type:"point",x:1,y:0,label:"H",color:"#94a3b8"}],
st:[
{step:1,label:"P(구하는 것)",formula_raw:"$100k$의 값을 구합니다. ($a+t = k$)"},
{step:2,label:"C(주어진 단서)",formula_raw:"$y=a^x$와 $y=\\log_a x$는 $y=x$에 대해 대칭\n점 $A$의 좌표 $(p,q)$, 점 $B$의 좌표 $(q,p)$\n$q = a^p,\\; p+q = t$\n(가) $2\\overline{OH} = \\overline{AB}$"},
{step:3,label:"B(배경지식)",formula_raw:"$\\overline{AB} = \\sqrt{2}(q-p)$, $\\overline{OH} = p$\n$\\angle AOB = \\theta$라 하면 사인법칙 활용"},
{step:4,label:"[칠판 판서] Step 1",formula_raw:"(가)에서 $2p = \\sqrt{2}(q-p)$이므로\n$q = (1+\\sqrt{2})p$ ... ②\n$\\angle AOH = \\frac{\\pi}{4} + \\frac{\\theta}{2}$\n$\\angle BOH = \\frac{\\pi}{2} - \\frac{\\theta}{2}$\n$$\\theta = \\frac{\\pi}{4}$$"},
{step:5,label:"[칠판 판서] Step 2",formula_raw:"사인법칙에 의하여\n$\\overline{AB} = 2 \\cdot \\frac{\\sqrt{2}}{2} \\cdot \\sin\\frac{\\pi}{4} = 1 = 2p$\n$p = \\frac{1}{2}$\n②에 의하여 $q = \\frac{1}{2} + \\frac{\\sqrt{2}}{2}$\n$a = (\\frac{1}{2}+\\frac{\\sqrt{2}}{2})^2 = \\frac{3+\\sqrt{2}}{4}$... (생략)\n$t = 1 + \\frac{\\sqrt{2}}{2}$"},
{step:6,label:"A(최종 정답)",formula_raw:"$100k = 50$\n$$\\boxed{50}$$"}]}
];
P.forEach(p=>{const j={problem_id:p.id,title:`삼각함수 활용 - ${p.t}`,type:"geometry",
problem_render:{body:p.b,choices:p.ch,source_image:`${ib}/${p.id}.webp`},
viewBox:p.vb,base_figure:{preset:"custom",objects:p.ob},overlay_steps:p.st};
fs.writeFileSync(path.join(dir,p.id+'.json'),JSON.stringify(j,null,2),'utf8');
console.log(`✅ ${p.id}.json`);});
console.log('\n🎯 021-025 완료!');
