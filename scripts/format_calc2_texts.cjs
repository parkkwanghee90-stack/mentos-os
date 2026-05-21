const fs = require('fs');

const path = 'public/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const t18 = `$A_1B_1=2$, $C_1A_1=1$이고 $\\angle A_1=\\frac{\\pi}{3}$인 삼각형 $A_1B_1C_1$에 내접하는 원 $O_1$을 그린다.<br>원 $O_1$에 내접하고 각 변이 삼각형 $A_1B_1C_1$의 세 변에 평행한 삼각형 $A_2B_2C_2$를 그리고,<br>이 삼각형 $A_2B_2C_2$에 내접하는 원 $O_2$를 그린다.<br><br>이와 같은 과정을 계속하여 $n$번째 얻은 원을 $O_n$이라 하자.<br>원 $O_n$의 둘레의 길이를 $l_n$이라 할 때, $\\sum_{n=1}^{\\infty} l_n = \\frac{q}{p} \\sqrt{3} \\pi$이다.<br><br>$p+3q$의 값을 구하여라. (단, $p$, $q$는 서로소인 자연수이다.)`;

const t19 = `다음 그림과 같이 한 변의 길이가 4인 정사각형 $ABCD$의<br>각 변의 중점을 연결하여 만든 정사각형 $A_1B_1C_1D_1$의 둘레의 길이를 $l_1$,<br><br>정사각형 $A_1B_1C_1D_1$의 각 변의 중점을 연결하여 만든<br>정사각형 $A_2B_2C_2D_2$의 둘레의 길이를 $l_2$라 하자.<br><br>이와 같은 과정을 한없이 반복할 때,<br>정사각형 $A_nB_nC_nD_n$의 둘레의 길이 $l_n$에 대하여 $\\sum_{n=1}^{\\infty} l_n$의 값은?\n\n① $8(\\sqrt{2}+1)$\n② $10(\\sqrt{2}+1)$\n③ $12(\\sqrt{2}+1)$\n④ $14(\\sqrt{2}+1)$\n⑤ $16(\\sqrt{2}+1)$`;

const t24 = `그림과 같이 지름의 길이가 2인 원 [그림 1]을 그리다.<br>이 원의 지름을 1:2로 내분하여 만든 두 개의 선분을 각각 지름으로 하는 두 개의 원 [그림 2]를 그리다.<br><br>[그림 2]에서 그린 두 개의 원의 지름을 각각 1:2로 내분하여 만든 4개의 선분을<br>각각 지름으로 하는 4개의 원 [그림 3]을 그리다.<br><br>이와 같은 방법으로 한없이 원을 그릴 때,<br>첫 번째 그린 1개 원의 넓이를 $S_1$,<br>두 번째 그린 2개의 원의 넓이의 합을 $S_2$, 세 번째 그린 4개의 원의 넓이의 합을 $S_3$,<br>$n$번째 그린 $2^{n-1}$개의 원의 넓이의 합을 $S_n$이라 하자. 이때, $\\sum_{n=1}^{\\infty} S_n$의 값은?\n\n① $\\frac{5}{4}\\pi$\n② $\\frac{3}{2}\\pi$\n③ $\\frac{7}{4}\\pi$\n④ $2\\pi$\n⑤ $\\frac{9}{4}\\pi$`;

const t27 = `처음 생산된 유리병의 양을 $A$, $n$ 번째 수거하여 생산된 유리병의 양을 $a_n$ 이라 하면<br><br>$a_1 = A \\times \\frac{62.5}{100} \\times \\frac{80}{100} = \\frac{1}{2} A$<br>$a_{n+1} = \\frac{1}{2} a_n$<br><br>즉, 수열 $\\{a_n\\}$은 첫째항이 $\\frac{1}{2} A$, 공비가 $\\frac{1}{2}$ 인 등비수열이므로<br>$a_n = \\frac{1}{2} A \\times \\left( \\frac{1}{2} \\right)^{n-1}$<br><br>$\\therefore \\sum_{n=1}^{\\infty} a_n = \\frac{\\frac{1}{2} A}{1 - \\frac{1}{2}} = A$<br>$\\therefore (\\text{재활용률}) = \\frac{A}{A} \\times 100 = 100 (\\%)$`;

// 영문 키와 한글 유닛 키 두 곳에 동시에 쓰기
data['calc2/018.webp'] = t18; data['2)급수2/018.webp'] = t18;
data['calc2/019.webp'] = t19; data['2)급수2/019.webp'] = t19;
data['calc2/024.webp'] = t24; data['2)급수2/024.webp'] = t24;
data['calc2/027.webp'] = t27; data['2)급수2/027.webp'] = t27;

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Successfully updated math_problem_texts.json for both calc2/ and 2)급수2/ keys');
