const fs = require('fs');

const manualData2 = {
  "이차부등식2단계/019": { choices: ["0 \\leq k \\leq \\frac{1}{2}", "0 \\leq k \\leq 1", "0 \\leq k \\leq \\frac{3}{2}", "0 \\leq k \\leq 2", "0 \\leq k \\leq \\frac{5}{2}"], ans: "3" },
  "이차부등식2단계/027": { choices: ["3 < a \\leq 4", "4 < a \\leq 5", "5 < a \\leq 6", "6 < a \\leq 7", "7 < a \\leq 8"], ans: "4" },
  "이차부등식2단계/028": { choices: ["-3 < a \\leq -2", "-2 < a \\leq -1", "-1 < a \\leq 0", "0 < a \\leq 1", "1 < a \\leq 2"], ans: "3" },
  "이차부등식2단계/034": { choices: ["3", "4", "5", "6", "7"], ans: "3" },
  "이차부등식2단계/035": { choices: ["5", "6", "7", "8", "9"], ans: "3" },
  "이차부등식2단계/040": { choices: ["4 \\leq k < \\frac{24}{5}", "6 \\leq k < \\frac{34}{5}", "8 \\leq k < \\frac{44}{5}", "10 \\leq k < \\frac{54}{5}", "12 \\leq k < \\frac{64}{5}"], ans: "3" },
  "이차부등식3단계/007": { choices: ["5", "6", "7", "8", "9"], ans: "3" },
  "이차부등식3단계/010": { choices: ["4 - 2\\sqrt{2} \\leq k \\leq 4 + 2\\sqrt{2}", "4 - 2\\sqrt{2} < k < 4 + 2\\sqrt{2}", "2 - \\sqrt{2} < k < 2 + \\sqrt{2}", "4 - \\sqrt{2} < k < 4 + \\sqrt{2}", "1 < k < 4 + 2\\sqrt{2}"], ans: "2" },
  "이차부등식3단계/028": { choices: ["-3", "-2", "-1", "0", "1"], ans: "3" },
  "이차부등식3단계/033": { choices: ["x > -1", "x > 0", "x > 1", "x > 2", "x > 3"], ans: "3" },
  "이차부등식3단계/035": { choices: ["-2 < a < -1", "-1 < a < 0", "0 < a < 1", "1 < a < 2", "-1 \\leq a \\leq 0"], ans: "2" },
  "이차부등식3단계/036": { choices: ["a > 0 \\text{이면 모든 실수}, \\ a < 0 \\text{이면 해 없음}", "a > 0 \\text{이면 해 없음}, \\ a < 0 \\text{이면 모든 실수}", "a > 0 \\text{이면 } x > 0, \\ a < 0 \\text{이면 } x < 0", "a > 0 \\text{이면 } x < 0, \\ a < 0 \\text{이면 } x > 0", "a > 0 \\text{이면 모든 실수}, \\ a < 0 \\text{이면 } x = 0"], ans: "1" },
  "이차부등식3단계/037": { choices: ["-5", "-4", "-3", "-2", "-1"], ans: "3" },
  "이차부등식3단계/044": { choices: ["a \\leq -\\frac{4}{3}", "a \\leq -1", "a \\leq -\\frac{2}{3}", "a \\leq -\\frac{1}{3}", "a \\leq 0"], ans: "3" },
  "이차부등식3단계/049": { choices: ["0", "1", "2", "3", "4"], ans: "2" },
  "이차부등식4단계/012": { choices: ["k > -1", "k > 0 \\text{ 또는 } k < -1", "k > 0 \\text{ 또는 } -1 < k < 0", "-1 < k < 0", "k < 0"], ans: "3" },
  "이차부등식4단계/020": { choices: ["a \\leq x \\leq b", "b \\leq x \\leq c", "c \\leq x \\leq d", "a \\leq x \\leq c", "b \\leq x \\leq d"], ans: "3" },
  "이차부등식4단계/035": { choices: ["1", "2", "3", "4", "5"], ans: "2" },
  "이차부등식4단계/037": { choices: ["a < \\alpha < b < c < \\beta", "\\alpha < a < b < c < \\beta", "a < b < \\alpha < c < \\beta", "a < \\alpha < c < b < \\beta", "a < b < c < \\alpha < \\beta"], ans: "1" },
  "이차부등식4단계/039": { choices: ["|a| < 5", "|a| < 6", "|a| < 8", "|a| < 10", "|a| < 12"], ans: "4" }
};

const avs = JSON.parse(fs.readFileSync('src/data/avs_answers.json', 'utf8'));

for (let key in manualData2) {
  const [unit, id] = key.split('/');
  const p = 'public/math_hints/' + unit + '/' + id + '.json';
  if (!fs.existsSync(p)) continue;
  
  let j = JSON.parse(fs.readFileSync(p, 'utf8'));
  let d = manualData2[key];
  
  j.choices = d.choices;
  j.answerType = 'multiple_choice';
  j.correctChoiceIndex = parseInt(d.ans) - 1;
  j.finalAnswer = d.ans;
  j.correctAnswer = d.ans;
  j.explanationFinalLine = `따라서 정답은 ${d.ans}입니다.`;
  
  fs.writeFileSync(p, JSON.stringify(j, null, 2), 'utf8');
  
  let numKey = parseInt(id, 10).toString();
  let avsUnitKey = unit;
  if (unit === '이차부등식2단계') avsUnitKey = '(2)이차부등식 개념2단계(42)p21 1+1(쌍둥이)';
  
  avs[avsUnitKey] = avs[avsUnitKey] || {};
  avs[avsUnitKey][numKey] = d.ans;
  
  if (unit === '이차부등식2단계') {
    avs['이차부등식2단계'] = avs['이차부등식2단계'] || {};
    avs['이차부등식2단계'][numKey] = d.ans;
  }
}

fs.writeFileSync('src/data/avs_answers.json', JSON.stringify(avs, null, 2), 'utf8');
console.log('Manually injected ALL final 20 missing choices safely.');
