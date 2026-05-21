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

// ==========================================
// 1. left/right mismatch
// ==========================================
applyPatch(
  '(5)점과좌표 개념2단계(44)p17 1+1(쌍둥이)/006a',
  'P\\left( , 0\\right), Q\\left(0,  \\right)$',
  '$P\\left( \\frac{3}{2}, 0 \\right), Q\\left( 0, \\frac{15}{4} \\right)$' // the fraction was lost? 
);

applyPatch(
  '(5)점과좌표 개념2단계(44)p17 1+1(쌍둥이)/021a',
  'D\\left($\\frac{-2+2}{2}$, $\\frac{-1-3}{2}$\\right) $\\therefore$ D(0,\\ -2)',
  '$D\\left(\\frac{-2+2}{2}, \\frac{-1-3}{2}\\right) \\therefore D(0, -2)$'
);

// ==========================================
// 2. nested fraction (actually array mismatch or similar)
// ==========================================
applyPatch(
  '고차방정식4단계/015',
  '$\\frac{1}{  +  } \\frac{1}{  +  } \\frac{1}{  +  }$',
  '$\\frac{1}{\\alpha+\\beta}, \\frac{1}{\\beta+\\gamma}, \\frac{1}{\\gamma+\\alpha}$'
);

// ==========================================
// 3. broken \frac
// ==========================================
// (already fixed one in 고차방정식2단계/045 earlier)
applyPatch(
  '고차방정식2단계/045', // if there's another choice
  '④ \\frac{-1+$\\sqrt{3}$i}{2}\\n⑤ \\frac{1-$\\sqrt{3}$i}{2}',
  '④ $\\frac{-1+\\sqrt{3}i}{2}$\\n⑤ $\\frac{1-\\sqrt{3}i}{2}$'
);

// ==========================================
// 4. orphan $
// ==========================================
applyPatch(
  '점과좌표4단계/026',
  '① $3\\n$\\n② $4\\n$\\n③ $5\\n$\\n④ $6\\n$\\n⑤ 7',
  '① $3$\\n② $4$\\n③ $5$\\n④ $6$\\n⑤ 7'
);

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Manual patches applied: ${fixedCount}`);
