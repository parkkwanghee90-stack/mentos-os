const fs = require('fs');
const avs = JSON.parse(fs.readFileSync('src/data/avs_answers.json','utf8'));
const texts = JSON.parse(fs.readFileSync('src/data/math_problem_texts.json','utf8'));

const units = [
  { dir: '이차부등식2단계', avsKey: '(2)이차부등식 개념2단계(42)p21 1+1(쌍둥이)', textPrefix: '(2)이차부등식 개념2단계(42)p21 1+1(쌍둥이)' },
  { dir: '이차부등식3단계', avsKey: '이차부등식3단계', textPrefix: '이차부등식3단계' },
  { dir: '이차부등식4단계', avsKey: '이차부등식4단계', textPrefix: '이차부등식4단계' }
];

let issues = [];
let total = 0;

units.forEach(u => {
  const files = fs.readdirSync('public/math_hints/' + u.dir).filter(f => f.endsWith('.json'));
  const avsUnit = avs[u.avsKey] || {};

  files.forEach(f => {
    total++;
    const id = parseInt(f.replace('.json', '')).toString();
    const idStr = id.padStart(3, '0');
    const j = JSON.parse(fs.readFileSync('public/math_hints/' + u.dir + '/' + f, 'utf8'));

    const avsVal = avsUnit[id];
    const correctAnswer = j.correctAnswer;
    const finalAnswer = j.finalAnswer;
    const correctChoiceIndex = j.correctChoiceIndex;
    const answerType = j.answerType;
    const textKey = u.textPrefix + '/' + idStr + '.webp';
    const pText = texts[textKey] || '';
    const hasTextChoices = pText.includes('①');

    // === KI Rule Check ===
    // For multiple_choice:
    //   AVS = correctAnswer = finalAnswer = String(correctChoiceIndex + 1)
    //   Student clicks button -> sends String(num) -> must match AVS

    if (answerType === 'multiple_choice') {
      const expectedFromIndex = correctChoiceIndex !== undefined ? String(correctChoiceIndex + 1) : 'UNDEFINED';
      
      // Check 1: AVS == correctAnswer
      if (avsVal !== correctAnswer) {
        issues.push(u.dir + '/' + id + ': AVS(' + avsVal + ') != correctAnswer(' + correctAnswer + ')');
      }
      
      // Check 2: AVS == (correctChoiceIndex + 1)
      if (avsVal !== expectedFromIndex) {
        issues.push(u.dir + '/' + id + ': AVS(' + avsVal + ') != choiceIndex+1(' + expectedFromIndex + ')');
      }
      
      // Check 3: finalAnswer == correctAnswer
      if (finalAnswer !== correctAnswer) {
        issues.push(u.dir + '/' + id + ': finalAnswer(' + finalAnswer + ') != correctAnswer(' + correctAnswer + ')');
      }

      // Check 4: If text has ① choices, verify the correct choice content matches hint step 5
      if (hasTextChoices && j.choices && j.choices.length === 5) {
        // The choices in JSON should match what student sees
        // correctChoiceIndex should point to the right answer
      }

      // Check 5: AVS value should be 1-5 for objective
      if (avsVal && !['1','2','3','4','5'].includes(avsVal)) {
        issues.push(u.dir + '/' + id + ': AVS value "' + avsVal + '" is NOT a valid choice number (1-5)! BUG-005 pattern!');
      }

    } else {
      // subjective / short_answer
      // AVS = correctAnswer = actual math answer
      if (avsVal !== correctAnswer) {
        issues.push(u.dir + '/' + id + ' (subjective): AVS(' + avsVal + ') != correctAnswer(' + correctAnswer + ')');
      }
    }
  });
});

console.log('====== KI 규칙 기반 정답 정합성 전수조사 ======');
console.log('총 검사 문제: ' + total);
console.log('');
if (issues.length === 0) {
  console.log('>>> 모든 문제 PASS: AVS = correctAnswer = correctChoiceIndex+1 <<<');
} else {
  console.log('발견된 불일치: ' + issues.length + '건');
  issues.forEach(i => console.log('  ❌ ' + i));
}
