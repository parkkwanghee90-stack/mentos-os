import fs from 'fs';

const p = './public/premium_lectures/조건부확률.json';
const d = JSON.parse(fs.readFileSync(p, 'utf8'));

// Update Step 3 (index 2) - Show Table
d.steps[2].visuals.math = "\\begin{array}{|c|c|c|c|} \\hline & \\text{안경 } O & \\text{안경 } X & \\text{합계} \\\\ \\hline \\text{남학생} & 4 & 12 & 16 \\\\ \\hline \\text{여학생} & 5 & 9 & 14 \\\\ \\hline \\text{합계} & 9 & 21 & 30 \\\\ \\hline \\end{array}";
d.steps[2].visuals.title = "예제 1: 표가 주어진 조건부확률";

// Update Step 4 (index 3) - Highlight the row and cell
d.steps[3].visuals.math = "\\begin{array}{|c|c|c|c|} \\hline & \\text{안경 } O & \\text{안경 } X & \\text{합계} \\\\ \\hline \\color{blue}{\\text{남학생}} & \\color{red}{4} & \\color{blue}{12} & \\color{blue}{16} \\\\ \\hline \\text{여학생} & 5 & 9 & 14 \\\\ \\hline \\text{합계} & 9 & 21 & 30 \\\\ \\hline \\end{array} \\implies \\frac{\\color{red}{4}}{\\color{blue}{16}} = \\frac{1}{4}";
d.steps[3].visuals.title = "조건(남학생)으로 표본공간 축소";

fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log('Fixed conditional probability table!');
