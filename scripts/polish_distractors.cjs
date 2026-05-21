const fs = require('fs');
const path = require('path');

const targetUnits = [
  '일차부등식2단계', '일차부등식3단계', '일차부등식4단계',
  '이차부등식2단계', '이차부등식3단계', '이차부등식4단계'
];

function generateDistractors(ans) {
    const distractors = [];
    const opMatch = ans.match(/[<>\\ge\\le]+/);
    if (opMatch) {
        const currentOp = opMatch[0];
        const ops = ['>', '<', '\\geq', '\\leq'];
        ops.forEach(op => {
            if (op !== currentOp) {
                distractors.push(ans.replace(currentOp, op));
            }
        });
        // Boundary change
        distractors.push(ans.replace(/(-?\d+)/g, (m) => parseInt(m) + 1));
        distractors.push(ans.replace(/(-?\d+)/g, (m) => parseInt(m) - 1));
    } else {
        const num = parseInt(ans);
        if (!isNaN(num)) {
            distractors.push(String(num - 2));
            distractors.push(String(num - 1));
            distractors.push(String(num + 1));
            distractors.push(String(num + 2));
        } else {
            distractors.push(ans + ' + 1');
            distractors.push(ans + ' - 1');
            distractors.push('-' + ans);
            distractors.push('0');
        }
    }
    return [...new Set(distractors)].filter(d => d !== ans).slice(0, 4);
}

targetUnits.forEach(unit => {
  const dir = `c:/mentos_os_clean/public/math_hints/${unit}`;
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

  files.forEach(file => {
    const filePath = path.join(dir, file);
    let data;
    try { data = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) { return; }

    // Start from the latex in steps if choices are broken
    let correctVal = "";
    if (data.steps && data.steps.length > 0) {
        const lastStep = data.steps[data.steps.length - 1].latex || "";
        const m = lastStep.match(/x\s*[<>\\ge\\le=]+\s*-?\d+(\/\d+)?/);
        if (m) correctVal = m[0];
    }
    if (!correctVal && data.choices) correctVal = data.choices[data.correctChoiceIndex || 2].replace(/\$/g, '').trim();

    if (correctVal) {
        const distracts = generateDistractors(correctVal);
        while(distracts.length < 4) distracts.push(correctVal + ' ' + distracts.length);
        
        const finalChoices = [ distracts[0], distracts[1], correctVal, distracts[2], distracts[3] ];
        data.choices = finalChoices.map(c => c.startsWith('$') ? c : `$${c}$`);
        data.A = "3";
        data.correctAnswer = "3";
        data.correctChoiceIndex = 2;
        data.answerType = "multiple_choice";
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  });
});
console.log('Final Distractor Polish (V2) Complete.');
