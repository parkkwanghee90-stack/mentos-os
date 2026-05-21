import fs from 'fs';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let fixedCount = 0;

function applyPatch(keyIncludes, replaceFrom, replaceTo) {
  const key = Object.keys(data).find(k => k.includes(keyIncludes));
  if (key && data[key].includes(replaceFrom)) {
    data[key] = data[key].replace(replaceFrom, replaceTo);
    fixedCount++;
    console.log(`[PATCHED] ${keyIncludes}`);
  } else {
    console.log(`[FAILED] ${keyIncludes}`);
  }
}

// 1. 점과좌표3단계/007a
applyPatch('점과좌표3단계/007a',
  'AB = $\\sqrt{(-4-1)^2 + (-8-4)^2}$ = 13 \\newline AC = $\\sqrt{(5-1)^2 + (1-4)^2}$ = 5 \\newline \\overline{AD} \\text{는 } \\angle A \\text{의 이등분선이므로} \\newline \\frac{\\overline{AB}}{\\overline{AC}} = \\frac{\\overline{BD}}{\\overline{DC}} \\newline \\frac{\\overline{BD}}{\\overline{DC}} = \\frac{\\overline{AB}}{\\overline{AC}} = $\\frac{13}{5}$ \\newline \\text{따라서 점 D는 } \\overline{BC} \\text{를 } 13:5 \\text{로 내분하는 점이므로} \\newline \\text{점 D의 좌표는} \\newline \\left( $\\frac{13 \\times 5 + 5 \\times (-4)}{13+5}$, $\\frac{13 \\times 1 + 5 \\times (-8)}{13+5}$ \\right) = \\left( $\\frac{5}{2}$, -$\\frac{3}{2}$ \\right) \\newline $\\therefore$ a + b = $\\frac{5}{2}$ + \\left( -$\\frac{3}{2}$ \\right) = 1',
  '$\\overline{AB} = \\sqrt{(-4-1)^2 + (-8-4)^2} = 13$ \\n$\\overline{AC} = \\sqrt{(5-1)^2 + (1-4)^2} = 5$ \\n$\\overline{AD}$는 $\\angle A$의 이등분선이므로 \\n$\\frac{\\overline{AB}}{\\overline{AC}} = \\frac{\\overline{BD}}{\\overline{DC}}$ \\n$\\frac{\\overline{BD}}{\\overline{DC}} = \\frac{\\overline{AB}}{\\overline{AC}} = \\frac{13}{5}$ \\n따라서 점 $D$는 $\\overline{BC}$를 $13:5$로 내분하는 점이므로 \\n점 $D$의 좌표는 \\n$\\left( \\frac{13 \\times 5 + 5 \\times (-4)}{13+5}, \\frac{13 \\times 1 + 5 \\times (-8)}{13+5} \\right) = \\left( \\frac{5}{2}, -\\frac{3}{2} \\right)$ \\n$\\therefore a + b = \\frac{5}{2} + \\left( -\\frac{3}{2} \\right) = 1$'
);

// 2. 점과좌표3단계/021
applyPatch('점과좌표3단계/021',
  'AP가 \\angle A의 이등분선이므로 $\\frac{AB}{AC}$ = $\\frac{BP}{CP}$ $\\cdots$ \\text{①} 두 변 AB, AC의 길이를 각각 구하면 \\overline{AB} = $\\sqrt{(-2-1)^2 + (1-5)^2}$ = 5 \\overline{AC} = $\\sqrt{(7-1)^2 + (-3-5)^2}$ = 10 \\text{\\n①에 의해} $\\frac{BP}{CP}$ = $\\frac{5}{10}$ = 1:2 $\\frac{BP}{CP}$ = 1:2 \\text{이므로 점 P는 변 BC를 1:2로 내분하는 점이다.} \\text{따라서 구하는 점 P의 좌표는} P \\left( $\\frac{1 \\times 7 + 2 \\times (-2)}{1+2}$, $\\frac{1 \\times (-3) + 2 \\times 1}{1+2}$ \\right) = \\left( 1, -$\\frac{1}{3}$ \\right) $\\therefore$ ab = -$\\frac{1}{3}$',
  '$AP$가 $\\angle A$의 이등분선이므로 $\\frac{\\overline{AB}}{\\overline{AC}} = \\frac{\\overline{BP}}{\\overline{CP}} \\cdots ①$ \\n두 변 $AB, AC$의 길이를 각각 구하면 $\\overline{AB} = \\sqrt{(-2-1)^2 + (1-5)^2} = 5$, $\\overline{AC} = \\sqrt{(7-1)^2 + (-3-5)^2} = 10$ \\n①에 의해 $\\frac{\\overline{BP}}{\\overline{CP}} = \\frac{5}{10} = 1:2$ \\n$\\frac{\\overline{BP}}{\\overline{CP}} = 1:2$이므로 점 $P$는 변 $BC$를 $1:2$로 내분하는 점이다. \\n따라서 구하는 점 $P$의 좌표는 $P \\left( \\frac{1 \\times 7 + 2 \\times (-2)}{1+2}, \\frac{1 \\times (-3) + 2 \\times 1}{1+2} \\right) = \\left( 1, -\\frac{1}{3} \\right)$ \\n$\\therefore ab = -\\frac{1}{3}$'
);

// 3. 직선의방정식3단계/016
applyPatch('직선의방정식3단계/016',
  '다음 그림에서 점 B는 선분 AO의 중점이고 점 P는 두 선분\\nAC와 BD의 교점이다. 사각형 PBOC의 넓이가 삼각형 PAB\\n과 삼각형 PCD의 넓이의 합과 같고, 직선 AC의 기울기가\\n\\frac{$\\sqrt{3}$}{4}일 때, 직선 BD가 x축의 양의 부분과 이루는\\n각의 크기는 몇 도인지 구하시오.',
  '다음 그림에서 점 $B$는 선분 $AO$의 중점이고 점 $P$는 두 선분\\n$AC$와 $BD$의 교점이다. 사각형 $PBOC$의 넓이가 삼각형 $PAB$\\n과 삼각형 $PCD$의 넓이의 합과 같고, 직선 $AC$의 기울기가\\n$\\frac{\\sqrt{3}}{4}$일 때, 직선 $BD$가 $x$축의 양의 부분과 이루는\\n각의 크기는 몇 도인지 구하시오.'
);

// 4. 직선의방정식3단계/024a
applyPatch('직선의방정식3단계/024a',
  '$\\angle BAC = \\angle BAO + \\angle CAO$$\\= \\angle ACO + \\angle CAO = 90^\\circ$',
  '$\\angle BAC = \\angle BAO + \\angle CAO = \\angle ACO + \\angle CAO = 90^\\circ$'
);

// 5. 직선의방정식4단계/029a
applyPatch('직선의방정식4단계/029a',
  '1 < a < 3, \\ b > 0\\text{이므로 주어진 조건을 좌표평면 위에 나타내면 다음 그림과 같다.} \\ 이때, \\ y = x \\text{와} \\ ax + y - 2b = 0 \\text{을 연립하여 풀면} \\ x = $\\frac{2b}{a+1}$, \\ y = $\\frac{2b}{a+1}$ \\ $\\therefore$ \\ A \\left( $\\frac{2b}{a+1}$, $\\frac{2b}{a+1}$ \\right) \\ \\text{또한} \\ y = ax \\text{와} \\ ax + y - 2b = 0 \\text{을 연립하여 풀면} \\ x = $\\frac{b}{a}$, \\ y = b \\ $\\therefore$ \\ B \\left( $\\frac{b}{a}$, b \\right) \\ \\text{한편, 직선} \\ ax + y - 2b = 0 \\text{과} \\ x \\text{축의 교점을} \\ C \\text{라고 하면} \\ ax - 2b = 0 \\text{에서} \\ x = $\\frac{2b}{a}$ \\text{이므로} \\ C \\left( $\\frac{2b}{a}$, 0 \\right) \\ $\\therefore$ \\ \\triangle OAB = \\triangle BOC - \\triangle AOC \\ = $\\frac{1}{2}$ \\times $\\frac{2b}{a}$ \\times b - $\\frac{1}{2}$ \\times $\\frac{2b}{a}$ \\times $\\frac{2b}{a+1}$ \\ = $\\frac{b^2}{a}$ - $\\frac{2b^2}{a(a+1)}$ \\ = $\\frac{(a-1)b^2}{a(a+1)}$ \\ \\text{삼각형} \\ OAB\\text{의 넓이가} \\ $\\frac{5b^2}{42}$ \\text{이므로} \\ $\\frac{(a-1)b^2}{a(a+1)}$ = $\\frac{5b^2}{42}$, \\ 42(a-1) = 5a(a+1) \\ ($\\therefore$ \\ b > 0) \\ 5a^2 - 37a + 42 = 0, \\ (5a-7)(a-6) = 0 \\ $\\therefore$ \\ a = $\\frac{7}{5}$ \\ ($\\therefore$ \\ 1 < a < 3)',
  '$1 < a < 3, b > 0$이므로 주어진 조건을 좌표평면 위에 나타내면 다음 그림과 같다. \\n이때, $y = x$와 $ax + y - 2b = 0$을 연립하여 풀면 $x = \\frac{2b}{a+1}, y = \\frac{2b}{a+1}$ \\n$\\therefore A \\left( \\frac{2b}{a+1}, \\frac{2b}{a+1} \\right)$ \\n또한 $y = ax$와 $ax + y - 2b = 0$을 연립하여 풀면 $x = \\frac{b}{a}, y = b$ \\n$\\therefore B \\left( \\frac{b}{a}, b \\right)$ \\n한편, 직선 $ax + y - 2b = 0$과 $x$축의 교점을 $C$라고 하면 $ax - 2b = 0$에서 $x = \\frac{2b}{a}$이므로 $C \\left( \\frac{2b}{a}, 0 \\right)$ \\n$\\therefore \\triangle OAB = \\triangle BOC - \\triangle AOC = \\frac{1}{2} \\times \\frac{2b}{a} \\times b - \\frac{1}{2} \\times \\frac{2b}{a} \\times \\frac{2b}{a+1} = \\frac{b^2}{a} - \\frac{2b^2}{a(a+1)} = \\frac{(a-1)b^2}{a(a+1)}$ \\n삼각형 $OAB$의 넓이가 $\\frac{5b^2}{42}$이므로 $\\frac{(a-1)b^2}{a(a+1)} = \\frac{5b^2}{42}, 42(a-1) = 5a(a+1) (\\because b > 0)$ \\n$5a^2 - 37a + 42 = 0, (5a-7)(a-6) = 0$ \\n$\\therefore a = \\frac{7}{5} (\\because 1 < a < 3)$'
);

// 6. (7)원의방정식 개념2단계(54)p24 1+1(쌍둥이)/015a
applyPatch('015a',
  '$$\\frac{\\sqrt{(x-3)^2 + y^2} : \\sqrt{x^2 + (y-3)^2} = 1 : 2}$$',
  '$$\\sqrt{(x-3)^2 + y^2} : \\sqrt{x^2 + (y-3)^2} = 1 : 2$$'
);

// 7. 원의방정식4단계/074
applyPatch('원의방정식4단계/074',
  '① $\\frac{1}{3}$\\n\\n② $\\frac{1}{2}$\\n\\n③ $1\\n$\\n④ $2\\n$\\n⑤ 3',
  '① $\\frac{1}{3}$\\n② $\\frac{1}{2}$\\n③ $1$\\n④ $2$\\n⑤ $3$'
);

// 8. 원의방정식4단계/085
applyPatch('원의방정식4단계/085',
  '① $ㄱ \\n$\\n② $ㄴ \\n$\\n③ $ㄷ \\n$\\n④ $ㄱ, ㄷ \\n$\\n⑤ ㄴ, ㄷ',
  '① ㄱ\\n② ㄴ\\n③ ㄷ\\n④ ㄱ, ㄷ\\n⑤ ㄴ, ㄷ'
);

// 9. (4)행렬2단계/006
applyPatch('006',
  '2 \\left( $$\\begin{array}{cc} 4 & 3 \\\\ 1 & 2 \\end{array}$$ \\right) 를 계산하면?\\n① \\left( $$\\begin{array}{cc} 4 & 3 \\\\ 1 & 2 \\end{array}$$ \\right)\\n② \\left( $$\\begin{array}{cc} 6 & 5 \\\\ 3 & 4 \\end{array}$$ \\right)\\n③ \\left( $$\\begin{array}{cc} 8 & 3 \\\\ 2 & 2 \\end{array}$$ \\right)\\n④ \\left( $$\\begin{array}{cc} 8 & 6 \\\\ 1 & 4 \\end{array}$$ \\right)\\n⑤ \\left( $$\\begin{array}{cc} 8 & 6 \\\\ 2 & 4 \\end{array}$$ \\right)',
  '$2 \\left( \\begin{array}{cc} 4 & 3 \\\\ 1 & 2 \\end{array} \\right)$ 를 계산하면?\\n① $\\left( \\begin{array}{cc} 4 & 3 \\\\ 1 & 2 \\end{array} \\right)$\\n② $\\left( \\begin{array}{cc} 6 & 5 \\\\ 3 & 4 \\end{array} \\right)$\\n③ $\\left( \\begin{array}{cc} 8 & 3 \\\\ 2 & 2 \\end{array} \\right)$\\n④ $\\left( \\begin{array}{cc} 8 & 6 \\\\ 1 & 4 \\end{array} \\right)$\\n⑤ $\\left( \\begin{array}{cc} 8 & 6 \\\\ 2 & 4 \\end{array} \\right)$'
);

// 10. 고차방정식3단계/078
applyPatch('고차방정식3단계/078',
  '$\\alpha + \\beta = \\frac{m}{2}$ \\qquad $\\cdots$ \\;  \\bigcirc_1$\\n\\n$$\\alpha$ $\\beta$ = m + 3$ \\qquad \\cdots \\; \\bigcirc_2$\\n\\n$\\bigcirc_2 - \\bigcirc_1 \\times 2$를 하면',
  '$\\alpha + \\beta = \\frac{m}{2} \\qquad \\cdots \\;  ①$\\n\\n$\\alpha \\beta = m + 3 \\qquad \\cdots \\; ②$\\n\\n$② - ① \\times 2$를 하면'
);

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Manual patches applied: ${fixedCount}`);
