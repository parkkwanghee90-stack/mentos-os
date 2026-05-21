import fs from 'fs';

const fixFile = (path) => {
  const d = JSON.parse(fs.readFileSync(path, 'utf8'));
  d.steps.forEach(step => {
    if (step.visuals && step.visuals.math) {
      // Replace single backslash with double backslash (for JSON string value to have one backslash)
      // Actually, if we use JSON.stringify on a string that has \, it becomes \\.
      // The issue is that my JS script literal had \, which JS treats as escape.
      // So I need to fix the JSON files that were already written with broken characters.
    }
  });
};

// Instead of generic fix, I'll explicitly set the math fields for exp/log too.
const expPath = './public/premium_lectures/지수함수.json';
const exp = JSON.parse(fs.readFileSync(expPath, 'utf8'));

exp.steps[0].visuals.math = "y = a^x \\\\quad (a > 0, a \\\\neq 1)";
exp.steps[3].visuals.math = "\\\\begin{array}{l} a \\\\uparrow \\\\implies \\\\text{더 가파르게 상승} \\\\\\\\ \\\\text{점근선: } y = 0 \\\\text{ (x축)} \\\\\\\\ \\\\text{항상 지나는 점: } (0, 1) \\\\end{array}";
exp.steps[5].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q1.} } 2^{x+1} = 32 \\\\text{ 의 해는?} \\\\\\\\ 2^{x+1} = 2^5 \\\\implies x+1 = 5 \\\\\\\\ \\\\therefore x = 4 \\\\end{array}";
exp.steps[6].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q2.} } 3^{2x-1} = \\\\left(\\\\frac{1}{27}\\\\right)^x \\\\text{ 의 해는?} \\\\\\\\ 3^{2x-1} = 3^{-3x} \\\\implies 2x-1 = -3x \\\\\\\\ 5x = 1 \\\\implies x = \\\\frac{1}{5} \\\\end{array}";
exp.steps[7].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q3.} } 4^x - 3 \\\\cdot 2^x + 2 = 0 \\\\\\\\ 2^x = t > 0 \\\\implies t^2 - 3t + 2 = 0 \\\\\\\\ (t-1)(t-2) = 0 \\\\implies t = 1, 2 \\\\\\\\ 2^x = 1, 2 \\\\implies x = 0, 1 \\\\end{array}";
exp.steps[8].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q4.} } (x-1)^{x+2} = (x-1)^4 \\\\quad (x > 1) \\\\\\\\ 1) \\\\text{ 지수 비교: } x+2 = 4 \\\\implies x = 2 \\\\\\\\ 2) \\\\text{ 밑이 1인 경우: } x-1 = 1 \\\\implies x = 2 \\\\\\\\ \\\\therefore x = 2 \\\\end{array}";
exp.steps[9].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q5.} } 2^{x^2-4} = 5^{x^2-4} \\\\\\\\ x^2-4 = 0 \\\\implies x^2 = 4 \\\\\\\\ \\\\therefore x = 2, -2 \\\\end{array}";
exp.steps[10].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q6.} } 4^x + 4^{-x} - (2^x + 2^{-x}) - 2 = 0 \\\\\\\\ 2^x + 2^{-x} = t \\\\ge 2 \\\\implies (t^2-2) - t - 2 = 0 \\\\\\\\ t^2 - t - 4 = 0 \\\\dots \\\\text{(생략)} \\\\end{array}";
exp.steps[11].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q7.} } 2^x + 3^y = 13, \\\\; 2^{x+1} - 3^y = 11 \\\\\\\\ 2X + Y = 13, \\\\; 2X - Y = 11 \\\\text{ 꼴로 치환} \\\\\\\\ \\\\implies 3 \\\\cdot 2^x = 24 \\\\implies 2^x = 8 \\\\implies x = 3, y = 1 \\\\end{array}";
exp.steps[12].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q8.} } 4^x - a \\\\cdot 2^x + 4 = 0 \\\\text{ 이 서로 다른 두 실근을 가질 조건?} \\\\\\\\ 2^x = t \\\\implies t^2 - at + 4 = 0 \\\\\\\\ \\\\text{두 근이 모두 양수여야 하므로 } D > 0, \\\\alpha+\\\\beta > 0, \\\\alpha\\\\beta > 0 \\\\\\\\ \\\\implies a > 4 \\\\end{array}";
exp.steps[13].visuals.math = "\\\\begin{array}{l} a > 1 \\\\implies a^f < a^g \\\\iff f < g \\\\\\\\ 0 < a < 1 \\\\implies a^f < a^g \\\\iff f > g \\\\text{ (반대!)} \\\\end{array}";
exp.steps[14].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q1.} } 2^x < 16 \\\\\\\\ 2^x < 2^4 \\\\implies x < 4 \\end{array}";
exp.steps[15].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q2.} } \\\\left(\\\\frac{1}{3}\\\\right)^x < \\\\frac{1}{9} \\\\\\\\ \\\\left(\\\\frac{1}{3}\\\\right)^x < \\\\left(\\\\frac{1}{3}\\\\right)^2 \\\\implies x > 2 \\end{array}";
exp.steps[16].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q3.} } 4^x - 6 \\\\cdot 2^x + 8 < 0 \\\\\\\\ (2^x-2)(2^x-4) < 0 \\\\implies 2 < 2^x < 4 \\\\\\\\ \\\\therefore 1 < x < 2 \\end{array}";
exp.steps[17].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q4.} } 9^{x+1} \\\\ge 27^{x-1} \\\\\\\\ 3^{2x+2} \\\\ge 3^{3x-3} \\\\implies 2x+2 \\\\ge 3x-3 \\\\\\\\ \\\\therefore x \\\\le 5 \\end{array}";
exp.steps[18].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q5.} } 2 \\\\le 2^x \\\\cdot 4 \\\\le 16 \\\\\\\\ 2^1 \\\\le 2^{x+2} \\\\le 2^4 \\\\implies 1 \\\\le x+2 \\\\le 4 \\\\\\\\ \\\\therefore -1 \\\\le x \\\\le 2 \\end{array}";
exp.steps[19].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q6.} } x^{2x-5} > x^3 \\\\quad (x > 0) \\\\\\\\ 1) x > 1 : 2x-5 > 3 \\\\implies x > 4 \\\\\\\\ 2) x = 1 : 1 > 1 \\\\text{ (불능)} \\\\\\\\ 3) 0 < x < 1 : 2x-5 < 3 \\\\implies x < 4 \\\\implies 0 < x < 1 \\end{array}";
exp.steps[20].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q7.} 모든 실수 } x\\\\text{에 대해 } 4^x - 4 \\\\cdot 2^x + k \\\\ge 0 \\\\\\\\ t^2 - 4t + k \\\\ge 0 \\\\quad (t > 0) \\\\\\\\ \\\\text{꼭짓점이 } t=2\\\\text{ 이므로 } f(2) \\\\ge 0 \\\\\\\\ \\\\implies 4-8+k \\\\ge 0 \\\\implies k \\\\ge 4 \\end{array}";
exp.steps[21].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q8.} 매 시간 2배 증식하는 박테리아가 처음에 1마리일 때,} \\\\\\\\ \\\\text{1000마리 이상이 되는 것은 몇 시간 후인가?} \\\\\\\\ 2^t \\\\ge 1000 \\\\implies 2^{10} = 1024 \\\\\\\\ \\\\therefore 10\\\\text{시간 후} \\end{array}";

fs.writeFileSync(expPath, JSON.stringify(exp, null, 2));

const logPath = './public/premium_lectures/로그함수.json';
const log = JSON.parse(fs.readFileSync(logPath, 'utf8'));

log.steps[0].visuals.math = "y = \\\\log_a x \\\\quad (x > 0, a > 0, a \\\\neq 1)";
log.steps[3].visuals.math = "\\\\begin{array}{l} a \\\\uparrow \\\\implies x\\\\text{축에 더 가깝게 완만해짐} \\\\\\\\ \\\\text{점근선: } x = 0 \\\\text{ (y축)} \\\\\\\\ \\\\text{항상 지나는 점: } (1, 0) \\\\end{array}";
log.steps[5].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q1.} } \\\\log_2 (x-1) = 3 \\\\text{ 의 해는?} \\\\\\\\ \\\\text{진수 조건: } x-1 > 0 \\\\implies x > 1 \\\\\\\\ x-1 = 2^3 = 8 \\\\implies x = 9 \\end{array}";
log.steps[6].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q2.} } \\\\log_2 x + \\\\log_4 x = 3 \\\\\\\\ \\\\log_2 x + \\\\frac{1}{2} \\\\log_2 x = 3 \\\\implies \\\\frac{3}{2} \\\\log_2 x = 3 \\\\\\\\ \\\\log_2 x = 2 \\\\implies x = 4 \\end{array}";
log.steps[7].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q3.} } (\\\\log_3 x)^2 - \\\\log_3 x^2 - 3 = 0 \\\\\\\\ \\\\log_3 x = t \\\\implies t^2 - 2t - 3 = 0 \\\\\\\\ (t-3)(t+1) = 0 \\\\implies t = 3, -1 \\\\\\\\ \\\\log_3 x = 3, -1 \\\\implies x = 27, \\\\frac{1}{3} \\end{array}";
log.steps[8].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q4.} } x^{\\\\log_2 x} = 8x^2 \\\\\\\\ \\\\log_2 (x^{\\\\log_2 x}) = \\\\log_2 (8x^2) \\\\\\\\ (\\\\log_2 x)^2 = 3 + 2\\\\log_2 x \\\\implies t^2 - 2t - 3 = 0 \\\\\\\\ t=3, -1 \\\\implies x=8, \\\\frac{1}{2} \\end{array}";
log.steps[9].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q5.} } \\\\log_x (x+2) = \\\\log_3 (x+2) \\\\\\\\ 1) \\\\text{ 밑 비교: } x = 3 \\\\\\\\ 2) \\\\text{ 진수=1: } x+2 = 1 \\\\implies x = -1 \\\\text{ (조건 위배)} \\\\\\\\ \\\\therefore x = 3 \\end{array}";
log.steps[10].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q6.} } \\\\log_2 x + \\\\log_3 y = 5, \\\\; \\\\log_2 x - \\\\log_3 y = 1 \\\\\\\\ 2\\\\log_2 x = 6 \\\\implies \\\\log_2 x = 3 \\\\implies x = 8 \\\\\\\\ \\\\log_3 y = 2 \\\\implies y = 9 \\end{array}";
log.steps[11].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q7.} } \\\\log_2 x = \\\\log_x 4 \\\\\\\\ \\\\log_2 x = \\\\frac{2}{\\\\log_2 x} \\\\implies (\\\\log_2 x)^2 = 2 \\\\\\\\ \\\\log_2 x = \\\\pm \\\\sqrt{2} \\\\implies x = 2^{\\\\sqrt{2}}, 2^{-\\\\sqrt{2}} \\end{array}";
log.steps[12].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q8.} } (\\\\log x)^2 - 5\\\\log x + 2 = 0 \\\\text{ 의 두 근 } \\\\alpha, \\\\beta \\\\text{ 에 대해 } \\\\alpha\\\\beta \\\\text{ 는?} \\\\\\\\ \\\\log x = t \\\\implies t^2 - 5t + 2 = 0 \\\\\\\\ t_1 + t_2 = \\\\log \\\\alpha + \\\\log \\\\beta = \\\\log(\\\\alpha\\\\beta) = 5 \\\\\\\\ \\\\therefore \\\\alpha\\\\beta = 10^5 \\end{array}";
log.steps[13].visuals.math = "\\\\begin{array}{l} a > 1 : \\\\log_a f < \\\\log_a g \\\\iff f < g \\\\\\\\ 0 < a < 1 : \\\\log_a f < \\\\log_a g \\\\iff f > g \\\\\\\\ \\\\text{필수: } f > 0, g > 0 \\\\text{ (진수 조건)} \\\\end{array}";
log.steps[14].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q1.} } \\\\log_2 (x-3) < 2 \\\\\\\\ 1) \\\\text{ 진수: } x > 3 \\\\\\\\ 2) x-3 < 2^2 = 4 \\\\implies x < 7 \\\\\\\\ \\\\therefore 3 < x < 7 \\end{array}";
log.steps[15].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q2.} } \\\\log_{1/2} x > -3 \\\\\\\\ 1) \\\\text{ 진수: } x > 0 \\\\\\\\ 2) x < (1/2)^{-3} = 8 \\\\\\\\ \\\\therefore 0 < x < 8 \\end{array}";
log.steps[16].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q3.} } \\\\log_2 x + \\\\log_2 (x-2) \\\\le 3 \\\\\\\\ 1) \\\\text{ 진수: } x > 0, x > 2 \\\\implies x > 2 \\\\\\\\ 2) \\\\log_2 x(x-2) \\\\le 3 \\\\implies x^2-2x-8 \\\\le 0 \\\\\\\\ (x-4)(x+2) \\\\le 0 \\\\implies -2 \\\\le x \\\\le 4 \\\\\\\\ \\\\therefore 2 < x \\\\le 4 \\end{array}";
log.steps[17].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q4.} } (\\\\log_2 x)^2 - 3\\\\log_2 x + 2 < 0 \\\\\\\\ (t-1)(t-2) < 0 \\\\implies 1 < \\\\log_2 x < 2 \\\\\\\\ \\\\therefore 2 < x < 4 \\end{array}";
log.steps[18].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q5.} } 0 < \\\\log_3 x < 2 \\\\\\\\ 1) \\\\text{ 진수: } x > 0 \\\\\\\\ 2) 3^0 < x < 3^2 \\\\implies 1 < x < 9 \\\\\\\\ \\\\therefore 1 < x < 9 \\end{array}";
log.steps[19].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q6.} } -1 < \\\\log_{1/3} (x-1) < 0 \\\\\\\\ 1) \\\\text{ 진수: } x > 1 \\\\\\\\ 2) (1/3)^0 < x-1 < (1/3)^{-1} \\\\implies 1 < x-1 < 3 \\\\\\\\ \\\\therefore 2 < x < 4 \\end{array}";
log.steps[20].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q7.} } x^{\\\\log_2 x} < 16 \\\\\\\\ (\\\\log_2 x)^2 < 4 \\\\implies -2 < \\\\log_2 x < 2 \\\\\\\\ \\\\therefore \\\\frac{1}{4} < x < 4 \\end{array}";
log.steps[21].visuals.math = "\\\\begin{array}{l} \\\\text{\\\\textbf{Q8.} 모든 양수 } x \\\\text{ 에 대해 } (\\\\log_2 x)^2 - 4\\\\log_2 x + k > 0 \\\\\\\\ t^2 - 4t + k > 0 \\\\implies D/4 = 4 - k < 0 \\\\\\\\ \\\\therefore k > 4 \\end{array}";

fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
console.log('Fixed Exp and Log math with double escaping!');
