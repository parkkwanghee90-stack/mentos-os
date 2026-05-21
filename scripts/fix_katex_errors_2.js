import fs from 'fs';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let fixedCount = 0;
const fixedKeys = new Set();

function applyFix(key, regex, replacement) {
  if (data[key] && regex.test(data[key])) {
    data[key] = data[key].replace(regex, replacement);
    fixedKeys.add(key);
    fixedCount++;
  }
}

// 2. 직선의방정식2단계/021a
applyFix('직선의방정식2단계/021a.webp', /또한,\s*직선\s*\$AB\$는\s*직선\s*\$y\s*=\s*2x\s*-\s*1\$에\s*수직이므로/g, '\\\\text{또한, 직선 } AB \\\\text{는 직선 } y = 2x - 1 \\\\text{에 수직이므로 }');
// 3. 원의방정식2단계/015a
applyFix('원의방정식2단계/015a.webp', /\\\\frac\{\\\\sqrt\{\(x-3\)\^2 \+ y\^2\} : \\\\sqrt\{x\^2 \+ \(y-3\)\^2\} = 1 : 2\}/g, '\\\\sqrt{(x-3)^2 + y^2} : \\\\sqrt{x^2 + (y-3)^2} = 1 : 2');
// 4. 원의방정식2단계/023a
applyFix('원의방정식2단계/023a.webp', /또한,\s*두\s*원의\s*중심\s*\$\(0, 0\)\$과\s*\$\(1, 1\)\$을\s*지나는\s*직선의\s*방정식은/g, '\\\\text{또한, 두 원의 중심 } (0, 0) \\\\text{과 } (1, 1) \\\\text{을 지나는 직선의 방정식은 }');
// 5. 일차부등식3단계/013
applyFix('일차부등식3단계/013.webp', /\\\\text\{\\\\textwon\}/g, '\\\\text{₩}');
// 6. 고차방정식2단계/008a
applyFix('고차방정식2단계/008a.webp', /&\s*2\s*\\\\n\\\\hline/g, '& 2 \\\\\\\\\\\\n\\\\hline');
applyFix('고차방정식2단계/008a.webp', /-\s*1\s*\\\\n\\\\hline/g, '-1 \\\\\\\\\\\\n\\\\hline');
// 7. 고차방정식4단계/007a
applyFix('고차방정식4단계/007a.webp', /-2k\s*\\\\n\\\\hline/g, '-2k \\\\\\\\\\\\n\\\\hline');
// 8. 일차부등식2단계/015a
applyFix('일차부등식2단계/015a.webp', /\\\\circled\{1\}/g, '\\\\text{①}');
applyFix('일차부등식2단계/015a.webp', /\\\\circled\{2\}/g, '\\\\text{②}');

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(Array.from(fixedKeys).join('\\n'));
