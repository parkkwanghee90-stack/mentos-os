import fs from 'fs';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let fixedCount = 0;
const fixedKeys = new Set();

for (const key of Object.keys(data)) {
  let original = data[key];
  if (!original) continue;
  let text = original;

  // 1. ewline
  text = text.replace(/ewline/g, '\\\\n');

  // 2. \therefore P\left( ... \right), Q\left( ... \right)
  text = text.replace(/\\\\therefore P\\\\left\(\\\\frac\{3\}\{2\}, 0\\\\right\), Q\\\\left\(0, \\\\frac\{15\}\{4\}\\\\right\)/g, '$\\\\therefore P\\\\left(\\\\frac{3}{2}, 0\\\\right), Q\\\\left(0, \\\\frac{15}{4}\\\\right)$');

  // 3. \therefore a^2 ... = 0 \quad \cdots \text{㉠} \]
  text = text.replace(/\\\\therefore a\^2 - 8a \+ b\^2 \+ 4b - 60 = 0 \\\\quad \\\\cdots \\\\text\{㉠\} \\\]/g, '$\\\\therefore a^2 - 8a + b^2 + 4b - 60 = 0 \\\\quad \\\\cdots \\\\text{㉠}$ \\\\]');
  text = text.replace(/\\\\therefore a\^2 \+ 8a \+ b\^2 - 4b - 60 = 0 \\\\quad \\\\cdots \\\\text\{㉡\} \\\]/g, '$\\\\therefore a^2 + 8a + b^2 - 4b - 60 = 0 \\\\quad \\\\cdots \\\\text{㉡}$ \\\\]');

  // 4. \frac{\overline{AB}}{\overline{AC}}
  text = text.replace(/\\\\frac\{\\\\overline\{AB\}\}\{\\\\overline\{AC\}\}/g, '$\\\\frac{\\\\overline{AB}}{\\\\overline{AC}}$');

  // 5. \therefore a + b = \frac{5}{2}
  text = text.replace(/\\\\therefore a \+ b = \\\\frac\{5\}\{2\}/g, '$\\\\therefore a + b = \\\\frac{5}{2}$');

  // 6. \overline{AD} \text{는 } \angle A \text{의}
  text = text.replace(/\\\\overline\{AD\} \\\\text\{는 \} \\\\angle A \\\\text\{의\}/g, '$\\\\overline{AD}$는 $\\\\angle A$의');

  // 7. \left( \frac{13 \times 5 + 5 \times (-4)}{13+5}, \frac{13 \times (-8) + 5 \times 1}{13+5} \right)
  text = text.replace(/\\\\left\( \\\\frac\{13 \\\\times 5 \+ 5 \\\\times \(-4\)\}\{13\+5\}, \\\\frac\{13 \\\\times \(-8\) \+ 5 \\\\times 1\}\{13\+5\} \\\\right\)/g, '$\\\\left( \\\\frac{13 \\\\times 5 + 5 \\\\times (-4)}{13+5}, \\\\frac{13 \\\\times (-8) + 5 \\\\times 1}{13+5} \\\\right)$');

  // 8. \therefore D \left( \frac{5}{2}, -\frac{11}{2} \right)
  text = text.replace(/\\\\therefore D \\\\left\( \\\\frac\{5\}\{2\}, -\\\\frac\{11\}\{2\} \\\\right\)/g, '$\\\\therefore D \\\\left( \\\\frac{5}{2}, -\\\\frac{11}{2} \\\\right)$');

  // 9. \therefore \triangle ABD : \triangle ACD = \overline{BD} : \overline{CD} = 13 : 5
  text = text.replace(/\\\\therefore \\\\triangle ABD : \\\\triangle ACD = \\\\overline\{BD\} : \\\\overline\{CD\} = 13 : 5/g, '$\\\\therefore \\\\triangle ABD : \\\\triangle ACD = \\\\overline{BD} : \\\\overline{CD} = 13 : 5$');

  // 10. 이때 점 B가 직선 $y = 2x + 1$ 위의 점이므로
  text = text.replace(/이때 점 B가 직선 \$y = 2x \+ 1\$ 위의 점이므로/g, '\\\\text{이때 점 B가 직선 } y = 2x + 1 \\\\text{ 위의 점이므로 }');

  // 11. 또한, 직선 $AB$는 직선 $y = 2x - 1$에 수직이므로
  text = text.replace(/또한,\s*직선\s*\$AB\$는\s*직선\s*\$y\s*=\s*2x\s*-\s*1\$에\s*수직이므로/g, '\\\\text{또한, 직선 } AB \\\\text{는 직선 } y = 2x - 1 \\\\text{에 수직이므로 }');

  // 12. \frac{\sqrt{(x-3)^2 + y^2} : \sqrt{x^2 + (y-3)^2} = 1 : 2}
  text = text.replace(/\\\\frac\{\\\\sqrt\{\(x-3\)\^2 \+ y\^2\} : \\\\sqrt\{x\^2 \+ \(y-3\)\^2\} = 1 : 2\}/g, '\\\\sqrt{(x-3)^2 + y^2} : \\\\sqrt{x^2 + (y-3)^2} = 1 : 2');

  // 13. 또한, 두 원의 중심 $(0, 0)$과 $(1, 1)$을 지나는 직선의 방정식은
  text = text.replace(/또한,\s*두\s*원의\s*중심\s*\$\(0, 0\)\$과\s*\$\(1, 1\)\$을\s*지나는\s*직선의\s*방정식은/g, '\\\\text{또한, 두 원의 중심 } (0, 0) \\\\text{과 } (1, 1) \\\\text{을 지나는 직선의 방정식은 }');

  // 14. \text{\textwon}
  text = text.replace(/\\\\text\{\\\\textwon\}/g, '\\\\text{₩}');

  // 15. array hline fix
  text = text.replace(/&\s*2\s*\\\\n\\\\hline/g, '& 2 \\\\\\\\\\\\n\\\\hline');
  text = text.replace(/-\s*1\s*\\\\n\\\\hline/g, '-1 \\\\\\\\\\\\n\\\\hline');
  text = text.replace(/-2k\s*\\\\n\\\\hline/g, '-2k \\\\\\\\\\\\n\\\\hline');

  // 16. \circled{1}
  text = text.replace(/\\\\circled\{1\}/g, '\\\\text{①}');
  text = text.replace(/\\\\circled\{2\}/g, '\\\\text{②}');

  // 17. \therefore a = b
  text = text.replace(/\$4a = 4b \\\\; \\\\therefore \\\\; a = b \\\\; \\\\cdots \(1\)(?!\$)/g, '$4a = 4b \\\\; \\\\therefore \\\\; a = b \\\\; \\\\cdots (1)$');
  
  // 18. D(0, -2) 또한
  text = text.replace(/\\\\therefore D\(0,\\\\ -2\)/g, '$\\\\therefore D(0,\\\\ -2)$');
  text = text.replace(/D\\\\left\(\\\\frac\{-2\+2\}\{2\}, \\\\frac\{-1-3\}\{2\}\\\\right\)/g, '$D\\\\left(\\\\frac{-2+2}{2}, \\\\frac{-1-3}{2}\\\\right)$');

  // Other naked \therefore ... 
  text = text.replace(/\\\\therefore\s*[a-zA-Z0-9_\-+=(){}\[\],.\\\/\s]*(?=[\n])/g, match => {
    if (match.includes('$')) return match; // Already has $
    return `$${match.trim()}$`;
  });

  if (text !== original) {
    data[key] = text;
    fixedKeys.add(key);
  }
}

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');

const unitsAndIds = Array.from(fixedKeys).map(k => {
  const m = k.match(/\/([^\/]+)\/([^\/]+)\.webp/);
  return m ? `${m[1]} - ${m[2]}` : k;
});

console.log(unitsAndIds.join('\\n'));
console.log(`\nTotal fixed: ${fixedKeys.size}`);
