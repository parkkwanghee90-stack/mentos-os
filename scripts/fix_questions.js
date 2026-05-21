import fs from 'fs';

const p = './public/premium_lectures/독립시행의 확률.json';
const d = JSON.parse(fs.readFileSync(p, 'utf8'));

// Update Math blocks for all examples to include Question text
d.steps[5].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q.} 동전 1개와 주사위 1개를 던질 때,} \\\\ \\text{동전은 앞면, 주사위는 짝수가 나올 확률은?} \\\\ \\\\ \\implies \\frac{1}{2} \\times \\frac{1}{2} = \\frac{1}{4} \\end{array}";
d.steps[6].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q.} 빨간 구슬 3개, 파란 구슬 7개가 있다.} \\\\ \\text{1개를 뽑고 다시 넣은 뒤 또 1개를 뽑을 때, 두 번 모두 빨간 구슬일 확률은?} \\\\ \\\\ \\implies \\frac{3}{10} \\times \\frac{3}{10} = \\frac{9}{100} \\end{array}";
d.steps[7].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q.} 주사위 1개를 던질 때, 홀수 사건 A, 소수 사건 B는 독립인가 종속인가?} \\\\ \\\\ P(A)=\\frac{1}{2}, \\; P(B)=\\frac{1}{2}, \\; P(A \\cap B) = P(\\{3,5\\}) = \\frac{1}{3} \\\\ \\implies P(A)P(B) \\neq P(A \\cap B) \\; \\text{이므로 \\textbf{종속!}} \\end{array}";
d.steps[8].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q.} 철수와 영희가 시험에 합격할 확률이 각각 0.6, 0.8일 때,} \\\\ \\text{두 사람 모두 합격할 확률은?} \\\\ \\\\ \\implies 0.6 \\times 0.8 = 0.48 \\end{array}";
d.steps[9].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q.} 명중률이 } \\frac{1}{2}, \\frac{2}{3} \\text{ 인 두 사냥꾼이 동시에 새를 향해 쏠 때,} \\\\ \\text{새가 총에 맞을 확률은?} \\\\ \\\\ \\implies 1 - P(\\text{모두 빗나감}) = 1 - \\left(\\frac{1}{2} \\times \\frac{1}{3}\\right) = \\frac{5}{6} \\end{array}";

d.steps[13].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q.} 주사위를 4번 던질 때, 3의 배수가 딱 1번 나올 확률은?} \\\\ \\\\ \\implies {}_{4}\\mathrm{C}_{1} \\left(\\frac{1}{3}\\right)^1 \\left(\\frac{2}{3}\\right)^3 = \\frac{32}{81} \\end{array}";
d.steps[14].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q.} 동전을 5번 던질 때, 앞면이 딱 3번 나올 확률은?} \\\\ \\\\ \\implies {}_{5}\\mathrm{C}_{3} \\left(\\frac{1}{2}\\right)^3 \\left(\\frac{1}{2}\\right)^2 = \\frac{10}{32} = \\frac{5}{16} \\end{array}";
d.steps[15].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q.} 윷가락 1개가 평면이 나올 확률이 0.6일 때,} \\\\ \\text{4개를 던져 '윷'(4개 모두 평면)이 나올 확률은?} \\\\ \\\\ \\implies {}_{4}\\mathrm{C}_{4} (0.6)^4 (0.4)^0 = 0.1296 \\end{array}";
d.steps[16].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q.} 명중률이 } \\frac{3}{4} \\text{ 인 다트를 3번 던져 적어도 1번 명중할 확률은?} \\\\ \\\\ \\implies 1 - P(\\text{3번 모두 실패}) = 1 - {}_{3}\\mathrm{C}_{0} \\left(\\frac{1}{4}\\right)^3 = 1 - \\frac{1}{64} = \\frac{63}{64} \\end{array}";
d.steps[17].visuals.math = "\\begin{array}{l} \\text{\\textbf{Q.} 두 팀이 7전 4선승제 경기를 할 때, A팀이 딱 4번째 경기에서 우승할 확률은?} \\\\ \\text{(단, 매 경기 승리할 확률은 } \\frac{1}{2} \\text{ 이다)} \\end{array}";
d.steps[18].visuals.math = "\\begin{array}{l} \\text{조건: 3번째 경기까지 3전 전승 후, 4번째 경기 승리} \\\\ \\\\ \\implies \\left[ {}_{3}\\mathrm{C}_{3} \\left(\\frac{1}{2}\\right)^3 \\right] \\times \\frac{1}{2} = \\frac{1}{16} \\end{array}";

fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log('Fixed math visuals to include question texts!');
