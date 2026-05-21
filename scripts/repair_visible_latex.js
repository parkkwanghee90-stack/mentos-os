import fs from 'fs';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let fixedCount = 0;
const fixedKeys = new Set();

// Helper to replace and track
function applyFix(key, regex, replacement) {
  if (data[key] && regex.test(data[key])) {
    data[key] = data[key].replace(regex, replacement);
    fixedKeys.add(key);
    fixedCount++;
  }
}

for (const key of Object.keys(data)) {
  const text = data[key];
  if (!text) continue;
  
  if (text.includes('ewline')) {
    applyFix(key, /ewline/g, '\\\\n');
  }

  if (text.includes('\\\\therefore P\\\\left(\\\\frac{3}{2}, 0\\\\right)')) {
    applyFix(key, /\\\\therefore P\\\\left\(\\\\frac\{3\}\{2\}, 0\\\\right\), Q\\\\left\(0, \\\\frac\{15\}\{4\}\\\\right\)/g, '$\\\\therefore P\\\\left(\\\\frac{3}{2}, 0\\\\right), Q\\\\left(0, \\\\frac{15}{4}\\\\right)$');
  }

  // 018a 점과좌표
  if (text.includes('$4a = 4b \\\\; \\\\therefore \\\\; a = b \\\\; \\\\cdots (1)')) {
    applyFix(key, /\$4a = 4b \\\\; \\\\therefore \\\\; a = b \\\\; \\\\cdots \(1\)/g, '$4a = 4b \\\\; \\\\therefore \\\\; a = b \\\\; \\\\cdots (1)$');
  }

  // D(0, -2) 또한
  if (text.includes('\\\\therefore D(0,\\\\ -2) 또한')) {
    applyFix(key, /\\\\therefore D\(0,\\\\ -2\)/g, '$\\\\therefore D(0,\\\\ -2)$');
  }
  
  // D\\\\left(\\\\frac{-2+2}{2}, \\\\frac{-1-3}{2}\\\\right)
  if (text.includes('D\\\\left(\\\\frac{-2+2}{2}, \\\\frac{-1-3}{2}\\\\right)')) {
    applyFix(key, /D\\\\left\(\\\\frac\{-2\+2\}\{2\}, \\\\frac\{-1-3\}\{2\}\\\\right\)/g, '$D\\\\left(\\\\frac{-2+2}{2}, \\\\frac{-1-3}{2}\\\\right)$');
  }
  
  // \therefore a^2 - 8a + b^2 + 4b - 60 = 0 \quad \cdots
  if (text.includes('\\\\therefore a^2 - 8a + b^2 + 4b - 60 = 0 \\\\quad \\\\cdots \\\\text{㉠} \\\\]')) {
    applyFix(key, /\\\\therefore a\^2 - 8a \+ b\^2 \+ 4b - 60 = 0 \\\\quad \\\\cdots \\\\text\{㉠\} \\\]/g, '$\\\\therefore a^2 - 8a + b^2 + 4b - 60 = 0 \\\\quad \\\\cdots \\\\text{㉠}$ \\\\]');
  }

  // \therefore a^2 + 8a + b^2 - 4b - 60 = 0 \quad \cdots
  if (text.includes('\\\\therefore a^2 + 8a + b^2 - 4b - 60 = 0 \\\\quad \\\\cdots \\\\text{㉡} \\\\]')) {
    applyFix(key, /\\\\therefore a\^2 \+ 8a \+ b\^2 - 4b - 60 = 0 \\\\quad \\\\cdots \\\\text\{㉡\} \\\]/g, '$\\\\therefore a^2 + 8a + b^2 - 4b - 60 = 0 \\\\quad \\\\cdots \\\\text{㉡}$ \\\\]');
  }

  // \frac{\overline{AB}}{\overline{AC}}
  if (text.includes('\\\\frac{\\\\overline{AB}}{\\\\overline{AC}}')) {
    applyFix(key, /\\\\frac\{\\\\overline\{AB\}\}\{\\\\overline\{AC\}\}/g, '$\\\\frac{\\\\overline{AB}}{\\\\overline{AC}}$');
  }

  // \therefore a + b = \frac{5}{2}
  if (text.includes('\\\\therefore a + b = \\\\frac{5}{2}')) {
    applyFix(key, /\\\\therefore a \+ b = \\\\frac\{5\}\{2\}/g, '$\\\\therefore a + b = \\\\frac{5}{2}$');
  }

  // \overline{AD} \text{는 } \angle A \text{의 이등분
  if (text.includes('\\\\overline{AD} \\\\text{는 } \\\\angle A \\\\text{의}')) {
    applyFix(key, /\\\\overline\{AD\} \\\\text\{는 \} \\\\angle A \\\\text\{의\}/g, '$\\\\overline{AD}$는 $\\\\angle A$의');
  }

  // \left( \frac{13 \times 5 + 5 \times (-4)}{13+5}, \frac{13 \times (-8) + 5 \times 1}{13+5} \right)
  if (text.includes('\\\\left( \\\\frac{13 \\\\times 5 + 5 \\\\times (-4)}{13+5}')) {
    applyFix(key, /\\\\left\( \\\\frac\{13 \\\\times 5 \+ 5 \\\\times \(-4\)\}\{13\+5\}, \\\\frac\{13 \\\\times \(-8\) \+ 5 \\\\times 1\}\{13\+5\} \\\\right\)/g, '$\\\\left( \\\\frac{13 \\\\times 5 + 5 \\\\times (-4)}{13+5}, \\\\frac{13 \\\\times (-8) + 5 \\\\times 1}{13+5} \\\\right)$');
  }

  // \therefore D \left( \frac{5}{2}, -\frac{11}{2} \right)
  if (text.includes('\\\\therefore D \\\\left( \\\\frac{5}{2}, -\\\\frac{11}{2} \\\\right)')) {
    applyFix(key, /\\\\therefore D \\\\left\( \\\\frac\{5\}\{2\}, -\\\\frac\{11\}\{2\} \\\\right\)/g, '$\\\\therefore D \\\\left( \\\\frac{5}{2}, -\\\\frac{11}{2} \\\\right)$');
  }

  // \therefore \triangle ABD : \triangle ACD = \overline{BD} : \overline{CD} = 13 : 5
  if (text.includes('\\\\therefore \\\\triangle ABD : \\\\triangle ACD')) {
    applyFix(key, /\\\\therefore \\\\triangle ABD : \\\\triangle ACD = \\\\overline\{BD\} : \\\\overline\{CD\} = 13 : 5/g, '$\\\\therefore \\\\triangle ABD : \\\\triangle ACD = \\\\overline{BD} : \\\\overline{CD} = 13 : 5$');
  }

  // 018a choices
  if (text.includes('이때 점 B가 직선 $y = 2x + 1$ 위의 점이므로')) {
    applyFix(key, /이때 점 B가 직선 \$y = 2x \+ 1\$ 위의 점이므로/g, '이때 점 B가 직선 $y = 2x + 1$ 위의 점이므로');
  }
}

// Save
fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(Array.from(fixedKeys).join('\\n'));
