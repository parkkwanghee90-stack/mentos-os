import fs from 'fs';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const needsFix = JSON.parse(fs.readFileSync('scratch/needs_fix.json', 'utf8'));

let fixedCount = 0;
const fixedKeys = new Set();

for (const key of Object.keys(needsFix)) {
  let text = data[key];
  let original = text;

  // Replace \( with $ and \) with $
  text = text.replace(/\\\\\(/g, '$').replace(/\\\\\)/g, '$');
  // Replace \[ with $$ and \] with $$
  text = text.replace(/\\\\\[/g, '$$$').replace(/\\\\\]/g, '$$$');
  // Also for single backslash if unescaped
  text = text.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
  text = text.replace(/\\\[/g, '$$$').replace(/\\\]/g, '$$$');

  // Replace ewline with \\n
  text = text.replace(/ewline/g, '\\\\n');

  // Specific completely broken problems (wrap whole lines)
  if (key.includes('점과좌표3단계/007a')) {
    text = text.replace(/AB = \\\\sqrt\{\(-4-1\)\^2 \+ \(-8-4\)\^2\} = 13/g, '$AB = \\\\sqrt{(-4-1)^2 + (-8-4)^2} = 13$');
    text = text.replace(/AC = \\\\sqrt\{\(5-1\)\^2 \+ \(1-4\)\^2\} = 5/g, '$AC = \\\\sqrt{(5-1)^2 + (1-4)^2} = 5$');
    text = text.replace(/\\\\overline\{AD\} \\\\text\{는 \} \\\\angle A \\\\text\{의 이등분선이므로\}/g, '$\\\\overline{AD}$는 $\\\\angle A$의 이등분선이므로');
    text = text.replace(/\\\\frac\{\\\\overline\{AB\}\}\{\\\\overline\{AC\}\} = \\\\frac\{\\\\overline\{BD\}\}\{\\\\overline\{DC\}\}/g, '$\\\\frac{\\\\overline{AB}}{\\\\overline{AC}} = \\\\frac{\\\\overline{BD}}{\\\\overline{DC}}$');
    text = text.replace(/\\\\frac\{\\\\overline\{BD\}\}\{\\\\overline\{DC\}\} = \\\\frac\{\\\\overline\{AB\}\}\{\\\\overline\{AC\}\} = \\\\frac\{13\}\{5\}/g, '$\\\\frac{\\\\overline{BD}}{\\\\overline{DC}} = \\\\frac{\\\\overline{AB}}{\\\\overline{AC}} = \\\\frac{13}{5}$');
    text = text.replace(/\\\\left\( \\\\frac\{13 \\\\times 5 \+ 5 \\\\times \(-4\)\}\{13\+5\}, \\\\frac\{13 \\\\times 1 \+ 5 \\\\times \(-8\)\}\{13\+5\} \\\\right\) = \\\\left\( \\\\frac\{5\}\{2\}, -\\\\frac\{3\}\{2\} \\\\right\)/g, '$\\\\left( \\\\frac{13 \\\\times 5 + 5 \\\\times (-4)}{13+5}, \\\\frac{13 \\\\times 1 + 5 \\\\times (-8)}{13+5} \\\\right) = \\\\left( \\\\frac{5}{2}, -\\\\frac{3}{2} \\\\right)$');
    text = text.replace(/\\\\therefore a \+ b = \\\\frac\{5\}\{2\} \+ \\\\left\( -\\\\frac\{3\}\{2\} \\\\right\) = 1/g, '$\\\\therefore a + b = \\\\frac{5}{2} + \\\\left( -\\\\frac{3}{2} \\\\right) = 1$');
  }

  // 016 직선의방정식3단계
  if (key.includes('직선의방정식3단계/016')) {
    text = text.replace(/\\\\frac\{\\\\sqrt\{3\}\}\{4\}/g, '$\\\\frac{\\\\sqrt{3}}{4}$');
  }

  // KaTeX specific errors 
  text = text.replace(/이때 점 B가 직선 \$y = 2x \+ 1\$ 위의 점이므로/g, '\\\\text{이때 점 B가 직선 } y = 2x + 1 \\\\text{ 위의 점이므로 }');
  text = text.replace(/또한,\s*직선\s*\$AB\$는\s*직선\s*\$y\s*=\s*2x\s*-\s*1\$에\s*수직이므로/g, '\\\\text{또한, 직선 } AB \\\\text{는 직선 } y = 2x - 1 \\\\text{에 수직이므로 }');
  text = text.replace(/\\\\frac\{\\\\sqrt\{\(x-3\)\^2 \+ y\^2\} : \\\\sqrt\{x\^2 \+ \(y-3\)\^2\} = 1 : 2\}/g, '\\\\sqrt{(x-3)^2 + y^2} : \\\\sqrt{x^2 + (y-3)^2} = 1 : 2');
  text = text.replace(/또한,\s*두\s*원의\s*중심\s*\$\(0, 0\)\$과\s*\$\(1, 1\)\$을\s*지나는\s*직선의\s*방정식은/g, '\\\\text{또한, 두 원의 중심 } (0, 0) \\\\text{과 } (1, 1) \\\\text{을 지나는 직선의 방정식은 }');
  text = text.replace(/\\\\text\{\\\\textwon\}/g, '\\\\text{₩}');
  text = text.replace(/&\s*2\s*\\\\n\\\\hline/g, '& 2 \\\\\\\\\\\\n\\\\hline');
  text = text.replace(/-\s*1\s*\\\\n\\\\hline/g, '-1 \\\\\\\\\\\\n\\\\hline');
  text = text.replace(/-2k\s*\\\\n\\\\hline/g, '-2k \\\\\\\\\\\\n\\\\hline');
  text = text.replace(/\\\\circled\{1\}/g, '\\\\text{①}');
  text = text.replace(/\\\\circled\{2\}/g, '\\\\text{②}');

  if (text !== original) {
    data[key] = text;
    fixedKeys.add(key);
  }
}

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');

console.log(Array.from(fixedKeys).join('\\n'));
console.log(`\nTotal fixed: ${fixedKeys.size}`);
