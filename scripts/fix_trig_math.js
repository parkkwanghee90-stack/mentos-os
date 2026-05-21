import fs from 'fs';

const p = './public/premium_lectures/삼각함수성질.json';
const d = JSON.parse(fs.readFileSync(p, 'utf8'));

// Apply correct double-escaping for all math fields
d.steps[0].visuals.math = "360^\\\\circ \\\\times n + \\\\alpha \\\\quad (n \\\\text{은 정수})";
d.steps[1].visuals.math = "750^\\\\circ = 360^\\\\circ \\\\times 2 + 30^\\\\circ \\\\implies 360^\\\\circ \\\\times n + 30^\\\\circ";
d.steps[2].visuals.math = "-100^\\\\circ = 360^\\\\circ \\\\times (-1) + 260^\\\\circ \\\\implies 360^\\\\circ \\\\times n + 260^\\\\circ";

d.steps[4].visuals.math = "l = r\\\\theta = 4 \\\\times \\\\frac{\\\\pi}{3} = \\\\frac{4\\\\pi}{3}";
d.steps[5].visuals.math = "S = \\\\frac{1}{2} rl = \\\\frac{1}{2} \\\\times 6 \\\\times 2\\\\pi = 6\\\\pi";

d.steps[7].visuals.math = "\\\\alpha - \\\\beta = 360^\\\\circ \\\\times n \\\\quad (\\\\text{또는 } 2n\\\\pi)";
d.steps[8].visuals.math = "\\\\alpha - \\\\beta = 360^\\\\circ \\\\times n + 180^\\\\circ";
d.steps[9].visuals.math = "\\\\alpha + \\\\beta = 360^\\\\circ \\\\times n + 180^\\\\circ";

d.steps[11].visuals.math = "\\\\begin{array}{|c|c|c|} \\\\hline \\\\text{2사분면(Sin)} & \\\\text{1사분면(All)} \\\\\\\\ \\\\hline \\\\text{3사분면(Tan)} & \\\\text{4사분면(Cos)} \\\\\\\\ \\\\hline \\\\end{array}";

d.steps[12].visuals.math = "\\\\begin{array}{|c|c|c|c|c|c|} \\\\hline \\\\theta & 0^\\\\circ & 30^\\\\circ & 45^\\\\circ & 60^\\\\circ & 90^\\\\circ \\\\\\\\ \\\\hline \\\\sin \\\\theta & 0 & 1/2 & \\\\sqrt{2}/2 & \\\\sqrt{3}/2 & 1 \\\\\\\\ \\\\hline \\\\cos \\\\theta & 1 & \\\\sqrt{3}/2 & \\\\sqrt{2}/2 & 1/2 & 0 \\\\\\\\ \\\\hline \\\\tan \\\\theta & 0 & \\\\sqrt{3}/3 & 1 & \\\\sqrt{3} & \\\\text{X} \\\\\\\\ \\\\hline \\\\end{array}";

d.steps[13].visuals.math = "f(n \\\\cdot \\\\frac{\\\\pi}{2} \\\\pm \\\\theta) \\\\implies \\\\text{함수 변경 여부 } \\\\rightarrow \\\\text{부호 결정}";

d.steps[14].visuals.math = "\\\\sin(90^\\\\circ + \\\\theta) = \\\\cos \\\\theta";
d.steps[15].visuals.math = "\\\\cos(180^\\\\circ - \\\\theta) = -\\\\cos \\\\theta";
d.steps[16].visuals.math = "\\\\tan(270^\\\\circ + \\\\theta) = -\\\\frac{1}{\\\\tan \\\\theta}";
d.steps[17].visuals.math = "\\\\sin 120^\\\\circ = \\\\sin(180^\\\\circ-60^\\\\circ) = \\\\sin 60^\\\\circ = \\\\frac{\\\\sqrt{3}}{2}";
d.steps[18].visuals.math = "\\\\cos 225^\\\\circ = \\\\cos(180^\\\\circ+45^\\\\circ) = -\\\\cos 45^\\\\circ = -\\\\frac{\\\\sqrt{2}}{2}";
d.steps[19].visuals.math = "\\\\tan(-30^\\\\circ) = -\\\\tan 30^\\\\circ = -\\\\frac{\\\\sqrt{3}}{3}";
d.steps[20].visuals.math = "\\\\sin(\\\\frac{3\\\\pi}{2} - \\\\theta) = -\\\\cos \\\\theta";
d.steps[21].visuals.math = "\\\\cos^2 10^\\\\circ + \\\\cos^2 80^\\\\circ = \\\\cos^2 10^\\\\circ + \\\\sin^2 10^\\\\circ = 1";

fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log('Fixed Trigonometric Properties math with double escaping!');
