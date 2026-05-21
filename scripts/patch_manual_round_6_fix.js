import fs from 'fs';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let fixedCount = 0;

function applyPatch(keyIncludes, replaceFrom, replaceTo) {
  const key = Object.keys(data).find(k => k.includes(keyIncludes));
  if (key && data[key].includes(replaceFrom)) {
    data[key] = data[key].replace(replaceFrom, replaceTo);
    fixedCount++;
    console.log(`[PATCHED] ${keyIncludes}`);
  } else {
    console.log(`[FAILED] ${keyIncludes}`);
  }
}

applyPatch('원의방정식 개념2단계(54)p24 1+1(쌍둥이)/015a',
  '$$\\frac{\\sqrt{(x-3)^2 + y^2} : \\sqrt{x^2 + (y-3)^2} = 1 : 2}$$',
  '$$\\sqrt{(x-3)^2 + y^2} : \\sqrt{x^2 + (y-3)^2} = 1 : 2$$'
);

applyPatch('행렬2단계/006',
  '2 \\left( $$\\begin{array}{cc} 4 & 3 \\\\ 1 & 2 \\end{array}$$ \\right) 를 계산하면?\\n① \\left( $$\\begin{array}{cc} 4 & 3 \\\\ 1 & 2 \\end{array}$$ \\right)\\n② \\left( $$\\begin{array}{cc} 6 & 5 \\\\ 3 & 4 \\end{array}$$ \\right)\\n③ \\left( $$\\begin{array}{cc} 8 & 3 \\\\ 2 & 2 \\end{array}$$ \\right)\\n④ \\left( $$\\begin{array}{cc} 8 & 6 \\\\ 1 & 4 \\end{array}$$ \\right)\\n⑤ \\left( $$\\begin{array}{cc} 8 & 6 \\\\ 2 & 4 \\end{array}$$ \\right)',
  '$2 \\left( \\begin{array}{cc} 4 & 3 \\\\ 1 & 2 \\end{array} \\right)$ 를 계산하면?\\n① $\\left( \\begin{array}{cc} 4 & 3 \\\\ 1 & 2 \\end{array} \\right)$\\n② $\\left( \\begin{array}{cc} 6 & 5 \\\\ 3 & 4 \\end{array} \\right)$\\n③ $\\left( \\begin{array}{cc} 8 & 3 \\\\ 2 & 2 \\end{array} \\right)$\\n④ $\\left( \\begin{array}{cc} 8 & 6 \\\\ 1 & 4 \\end{array} \\right)$\\n⑤ $\\left( \\begin{array}{cc} 8 & 6 \\\\ 2 & 4 \\end{array} \\right)$'
);

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Manual patches applied: ${fixedCount}`);
