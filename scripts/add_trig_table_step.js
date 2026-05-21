import fs from 'fs';

const path = './public/premium_lectures/삼각함수성질.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const tableStep = {
  "step": 0,
  "narration": "각변환 공식을 총정리한 표야! 사인, 코사인, 탄젠트뿐만 아니라 시컨트, 코시컨트, 코탄젠트까지 한눈에 확인해봐. 복부호 동순($\\pm$ 가 위아래 순서대로 대응됨)에 주의해!",
  "visuals": {
    "title": "삼각함수 각변환 총정리 표",
    "math": "\\begin{array}{|c|c|c|c|c|c|} \\hline x & 2n\\pi+\\theta & -\\theta & \\pi\\pm\\theta & \\frac{\\pi}{2}\\pm\\theta & \\frac{3}{2}\\pi\\pm\\theta \\\\ \\hline \\sin x & \\sin\\theta & -\\sin\\theta & \\mp\\sin\\theta & \\cos\\theta & -\\cos\\theta \\\\ \\hline \\cos x & \\cos\\theta & \\cos\\theta & -\\cos\\theta & \\mp\\sin\\theta & \\pm\\sin\\theta \\\\ \\hline \\tan x & \\tan\\theta & -\\tan\\theta & \\pm\\tan\\theta & \\mp\\cot\\theta & \\mp\\cot\\theta \\\\ \\hline \\end{array}"
  }
};

// Insert after the 각변환 원리 step (which is now step 17)
data.steps.splice(17, 0, tableStep);

// Update all step numbers
data.steps.forEach((s, idx) => {
  s.step = idx + 1;
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Added Full Conversion Table step!');
