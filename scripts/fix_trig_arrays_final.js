import fs from 'fs';

const path = './public/premium_lectures/삼각함수성질.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Fix the array in the "사분면별 부호" step (Step 12 originally)
const signStep = data.steps.find(s => s.visuals && s.visuals.title === "사분면별 부호 (All-S-T-C)");
if (signStep) {
  // We need DOUBLE backslashes in the app memory for the row break.
  // To get that in the JSON file, we need two backslashes.
  // To get that in the JS string literal, we need four.
  signStep.visuals.math = "\\begin{array}{|c|c|} \\hline \\text{2사분면(Sin)} & \\text{1사분면(All)} \\\\\\\\ \\hline \\text{3사분면(Tan)} & \\text{4사분면(Cos)} \\\\\\\\ \\hline \\end{array}";
}

// Fix the special angles table (Step 13 originally)
const specialStep = data.steps.find(s => s.visuals && s.visuals.title === "특수각의 삼각비 표");
if (specialStep) {
  specialStep.visuals.math = "\\begin{array}{|c|c|c|c|c|c|} \\hline \\theta & 0^\\circ & 30^\\circ & 45^\\circ & 60^\\circ & 90^\\circ \\\\\\\\ \\hline \\sin \\theta & 0 & 1/2 & \\sqrt{2}/2 & \\sqrt{3}/2 & 1 \\\\\\\\ \\hline \\cos \\theta & 1 & \\sqrt{3}/2 & \\sqrt{2}/2 & 1/2 & 0 \\\\\\\\ \\hline \\tan \\theta & 0 & \\sqrt{3}/3 & 1 & \\sqrt{3} & \\text{X} \\\\\\\\ \\hline \\end{array}";
}

// Fix the full conversion table (Added later)
const tableStep = data.steps.find(s => s.visuals && s.visuals.title === "삼각함수 각변환 총정리 표");
if (tableStep) {
  tableStep.visuals.math = "\\begin{array}{|c|c|c|c|c|c|} \\hline x & 2n\\pi+\\theta & -\\theta & \\pi\\pm\\theta & \\frac{\\pi}{2}\\pm\\theta & \\frac{3}{2}\\pi\\pm\\theta \\\\\\\\ \\hline \\sin x & \\sin\\theta & -\\sin\\theta & \\mp\\sin\\theta & \\cos\\theta & -\\cos\\theta \\\\\\\\ \\hline \\cos x & \\cos\\theta & \\cos\\theta & -\\cos\\theta & \\mp\\sin\\theta & \\pm\\sin\\theta \\\\\\\\ \\hline \\tan x & \\tan\\theta & -\\tan\\theta & \\pm\\tan\\theta & \\mp\\cot\\theta & \\mp\\cot\\theta \\\\\\\\ \\hline \\end{array}";
}

// Fix the quadrant division derivation (Step 23 originally)
const divStep = data.steps.find(s => s.visuals && s.visuals.title === "동경의 n등분 심화 예제");
if (divStep) {
  divStep.visuals.math = "\\begin{array}{l} 360^\\circ n + 270^\\circ < \\alpha < 360^\\circ n + 360^\\circ \\\\\\\\ \\implies 120^\\circ n + 90^\\circ < \\frac{\\alpha}{3} < 120^\\circ n + 120^\\circ \\\\\\\\ n=0 \\implies 2\\text{사분면, } n=1 \\implies 3\\text{사분면, } n=2 \\implies 4\\text{사분면} \\end{array}";
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Fixed all arrays in 삼각함수성질.json with quadruple backslashes for row breaks!');
