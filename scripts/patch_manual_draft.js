import fs from "fs";
const dbPath = "src/data/math_problem_texts.json";
const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
let fixedCount = 0;
function applyPatch(keyIncludes, replaceFrom, replaceTo) {
  const key = Object.keys(data).find(k => k.includes(keyIncludes));
  if (key && data[key].includes(replaceFrom)) {
    data[key] = data[key].replace(replaceFrom, replaceTo);
    fixedCount++;
  }
}

// == left/right mismatch ==
applyPatch('(5)점과좌표 개념2단계(44)p17 1+1(쌍둥이)/006a', "양변을 정리하면   P의 좌표를  라 하면   Q의 좌표를  라 하면   두 식을 제곱하여 정리하면     P\\left( , 0\\right), Q\\left(0,  \\right)$", '...');
applyPatch('(5)점과좌표 개념2단계(44)p17 1+1(쌍둥이)/021a', "점 D가 \\overline{BC}의 중점일 때 \\triangle ABD = \\triangle ACD가 되어 넓이를 이등분한다. 이 때, 점 D의 좌표는 D\\left( ,  \\right)   D(0,\\ -2) 또한, \\overline{BD} =   =  이고 점 D가 \\...", '...');
applyPatch('점과좌표3단계/021', "에 의해}   =   = 1:2   = 1:2 \\text{이므로 점 P는 변 BC를 1:2로 내분하는 점이다.} \\text{따라서 구하는 점 P의 좌표는} P \\left(  ,   \\right) = \\left( 1, -  \\right)   ab = -", '...');
applyPatch('직선의방정식4단계/029a', "1 < a < 3, \\ b > 0\\text{이므로 주어진 조건을 좌표평면 위에 나타내면 다음 그림과 같다.} \\ 이때, \\ y = x \\text{와} \\ ax + y - 2b = 0 \\text{을 연립하여 풀면} \\ x =  , \\ y =   \\   \\ A \\left(...", '...');
applyPatch('점과좌표4단계/032', "AB를 m : n으로 내분하는 점의 좌표는   이 점이 x축 위에 있으므로   ∴   …… ①  \\left(  ,   \\right) =0, -2m+an=0 m= an", '...');
// == nested fraction ==
applyPatch('점과좌표3단계/007a', "AB =   = 13 \newline AC =   = 5 \newline \\overline{AD} \\text{는 } \\angle A \\text{의 이등분선이므로} \newline \\frac{\\overline{AB}}{\\overline{AC}} = \\frac{\\overline...", '...');
applyPatch('직선의방정식3단계/024a', "\\\\= \\angle ACO + \\angle CAO = 90^\\circ l_1, l_2 l_1$의 기울기가   이므로 직선  의 기울기는  \\frac{3}{4} y = -\\frac{3}{4}x + 4$ 3x + 4y - 16 = 0$", '...');
applyPatch('고차방정식4단계/015', "x^3 - 6x - 9 = 0의 세 근을  ,  ,  라고 할 때, $\\frac{1}{  +  } \\frac{1}{  +  } \\frac{1}{  +  }$을 세 근으로 하고 x^3의 계수가 9인 삼차방정식은?", '...');
applyPatch('도형의이동4단계/005', "좌표평면에서 포물선  를 포물선  로 옮기는 평행이동에 의하여 직선  이 직선  으로 옮겨진다. 두 직선   사이의 거리는? ①   ② \\frac{ }{5} ③ \\frac{ }{5} ④   ⑤ \\frac{ }{5}", '...');
applyPatch('삼각함수활용2단계/032', "삼각형  에서  ,  ,  일 때,   의 값은? ① \\frac{3 }{2} ② 2  ③ \\frac{5 }{2} ④ 3  ⑤ \\frac{7 }{2}", '...');
// == broken \frac ==
applyPatch('직선의방정식3단계/016', "다음 그림에서 점 B는 선분 AO의 중점이고 점 P는 두 선분\nAC와 BD의 교점이다. 사각형 PBOC의 넓이가 삼각형 PAB\n과 삼각형 PCD의 넓이의 합과 같고, 직선 AC의 기울기가\n\\frac{ }{4}일 때, 직선 BD가 x축의 양의 부분과 이루는\n각의 크기는 ...", '...');
applyPatch('고차방정식2단계/045', "\\frac{-1+ i}{2}", '...');
applyPatch('고차방정식2단계/045', "\\frac{1- i}{2}", '...');
applyPatch('일차부등식2단계/001', "일 때, 다음 보기 중 옳은 것만을 있는 대로 고른 것은? \n \n \\text{<보기>} \n \\text{ㄱ. }   <   \n \\text{ㄴ. } -  < -  \n \\text{ㄷ. }   > \\frac{b^2}{a}$ \n \n ① ㄱ \n ② ㄴ \n ③ ㄱ, ㄴ \n ④ ㄱ,...", '...');
applyPatch('일차부등식3단계/010a', " 에서     \\; \\text{①} \\; 0.2(5 - 2x) \\geq 0.3x - 0.4 2(5 - 2x) \\geq 3x - 4 \\;   \\; x \\leq 2$   \\; \\text{②} \\; \\bigcirc_1, \\bigcirc_2 \\; \\text{의 공통부분이 없도...", '...');
// == orphan $ ==
applyPatch('(7)원의방정식 개념2단계(54)p24 1+1(쌍둥이)/006a', "x축에 접하는 원의 중심의 좌표를  라 하면 원의 방정식은   ① 이 점  를 지나므로   $a^2 - 6a + 4b + 13 = 0 (2-a)^2 + (-1-b)^2 = b^2  ①-②×2를 하면   ∴   또는   ①에서  일 때  ,  일 때   따라서 구하는 두...", '...');
applyPatch('점과좌표4단계/026', "$3", '...');
applyPatch('점과좌표4단계/026', "$4", '...');
applyPatch('점과좌표4단계/026', "$5", '...');
applyPatch('점과좌표4단계/026', "$6", '...');
// == other ==
applyPatch('(7)원의방정식 개념2단계(54)p24 1+1(쌍둥이)/015a', "두 점  ,  에 대하여  를 만족하는 점  의 좌표를  라 하면     위의 식의 양변을 제곱하면       즉, 위 그림과 같이 점  의 자취는 중심의 좌표가  , 반지름의 길이가  인 원이다.  이고, 점  가 직선  로부터 원의 반지름의 길이만큼 떨어져 있을 때...", '...');
applyPatch('고차방정식2단계/008a', "로 놓으면 \n \n조립제법을 이용하여  를 인수분해하면\n \n \n이때, 방정식  은 허근을 가지므로\n방정식  의 실근은   또는  이다.\n따라서 모든 실근의 합은  이다.", '...');
applyPatch('고차방정식4단계/007a', "로 놓으면 \n \n조립제법을 이용하여  를 인수분해하면\n \n \n이때, 방정식  이 중근을 가지려면\ni)  이  을 근으로 가지는 경우\n \n∴  \nii)  이 중근을 가지는 경우\n \n∴  \n(i), (ii)에서 방정식  이 중근을 가지도록 하는  의 값은 1,  이므로 그...", '...');
applyPatch('일차부등식2단계/015a', "해설   ①의 양변에 2를 곱하면     ②의 양변에 4를 곱하면     연립부등식을 만족시키는 정수  가 4개이려면 다음 그림에서     따라서 실수  의 최댓값은  이다.", '...');
applyPatch('삼각함수활용2단계/008a', "삼각형  에서   이므로  에 대입하면   \\   \\ 이때 삼각형  의 외접원의 반지름의 길이를  이라 하면 사인법칙에서     ", '...');

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
console.log(`Manual patches applied: ${fixedCount}`);
