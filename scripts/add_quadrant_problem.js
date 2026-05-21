import fs from 'fs';

const path = './public/premium_lectures/삼각함수성질.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Insert new step at index 22 (before the last step)
const newStep = {
  "step": 23,
  "narration": "심화 예제! $\\alpha$가 제4사분면의 각일 때, $\\frac{\\alpha}{3}$를 나타내는 동경이 존재할 수 없는 사분면은 어디일까? $360n + 270 < \\alpha < 360n + 360$ 공식을 3으로 나눠보면 2, 3, 4사분면만 가능하고 1사분면은 불가능하다는 걸 알 수 있어!",
  "visuals": {
    "title": "동경의 n등분 심화 예제",
    "component": "GeometryVisuals",
    "props": {
      "type": "quadrant_division",
      "n": 3,
      "target_quad": 4
    },
    "math": "\\begin{array}{l} 360^\\circ n + 270^\\circ < \\alpha < 360^\\circ n + 360^\\circ \\\\ \\implies 120^\\circ n + 90^\\circ < \\frac{\\alpha}{3} < 120^\\circ n + 120^\\circ \\\\ n=0 \\implies 2\\text{사분면, } n=1 \\implies 3\\text{사분면, } n=2 \\implies 4\\text{사분면} \\end{array}"
  }
};

// Update step numbers
data.steps.splice(22, 0, newStep);
data.steps.forEach((s, idx) => {
  s.step = idx + 1;
});

// Ensure all math fields are correctly escaped (single backslash in memory)
data.steps.forEach(s => {
  if (s.visuals && s.visuals.math) {
    // If it was already escaped correctly in the JSON, it will stay correct after stringify.
    // My previous fix used replace(/\\\\/g, '\\') which I should be careful about if the file is already clean.
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Added Quadrant Division problem to Trig Properties lecture!');
