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

function applyStrFix(key, str, replacement) {
  if (data[key] && data[key].includes(str)) {
    data[key] = data[key].replace(str, replacement);
    fixedKeys.add(key);
    fixedCount++;
  }
}

// 1. 점과좌표4단계/018a
applyStrFix('점과좌표4단계/018a.webp', '이때 점 B가 직선 $y = 2x + 1$ 위의 점이므로', '\\\\text{이때 점 B가 직선 } y = 2x + 1 \\\\text{ 위의 점이므로 }');
// 2. 직선의방정식2단계/021a
applyStrFix('직선의방정식2단계/021a.webp', '또한, 직선 $AB$는 직선 $y = 2x - 1$에 수직이므로', '\\\\text{또한, 직선 } AB \\\\text{는 직선 } y = 2x - 1 \\\\text{에 수직이므로 }');
// 3. 원의방정식2단계/015a
applyStrFix('원의방정식2단계/015a.webp', '\\\\frac{\\\\sqrt{(x-3)^2 + y^2} : \\\\sqrt{x^2 + (y-3)^2} = 1 : 2}', '\\\\sqrt{(x-3)^2 + y^2} : \\\\sqrt{x^2 + (y-3)^2} = 1 : 2');
// 4. 원의방정식2단계/023a
applyStrFix('원의방정식2단계/023a.webp', '또한, 두 원의 중심 $(0, 0)$과 $(1, 1)$을 지나는 직선의 방정식은', '\\\\text{또한, 두 원의 중심 } (0, 0) \\\\text{과 } (1, 1) \\\\text{을 지나는 직선의 방정식은 }');
// 5. 일차부등식3단계/013
applyStrFix('일차부등식3단계/013.webp', '\\\\text{\\\\textwon}1200', '\\\\text{₩}1200');
// 6. 고차방정식2단계/008a
applyFix('고차방정식2단계/008a.webp', /& 2 \\\\n\\\\hline/g, '& 2 \\\\\\\\\\\\n\\\\hline');
applyFix('고차방정식2단계/008a.webp', /-1 \\\\n\\\\hline/g, '-1 \\\\\\\\\\\\n\\\\hline');
// 7. 고차방정식4단계/007a
applyFix('고차방정식4단계/007a.webp', /-2k \\\\n\\\\hline/g, '-2k \\\\\\\\\\\\n\\\\hline');
// 8. 일차부등식2단계/015a
applyStrFix('일차부등식2단계/015a.webp', '\\\\circled{1}', '\\\\text{①}');
applyStrFix('일차부등식2단계/015a.webp', '\\\\circled{2}', '\\\\text{②}');
// 9. 일차부등식2단계/024a
applyStrFix('일차부등식2단계/024a.webp', '그림에서 $a \\\\geq \\\\frac{7}{3}$', '\\\\text{그림에서 } a \\\\geq \\\\frac{7}{3}');
applyStrFix('일차부등식2단계/024a.webp', '그런데 $a > 4$ 이므로 $a > 4$', '\\\\text{그런데 } a > 4 \\\\text{ 이므로 } a > 4');
applyStrFix('일차부등식2단계/024a.webp', '(iv) $a < 4$ 일 때', '\\\\text{(iv) } a < 4 \\\\text{ 일 때 }');

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(Array.from(fixedKeys).join('\\n'));
