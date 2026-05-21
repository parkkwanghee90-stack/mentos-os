const fs = require('fs');
const path = require('path');

const targetUnits = [
  '일차부등식2단계', '일차부등식3단계', '일차부등식4단계',
  '이차부등식2단계', '이차부등식3단계', '이차부등식4단계'
];

function normalize(s) {
    if (!s) return "";
    return s.replace(/\s+/g, '').replace(/\$/g, '').replace(/\\/g, '').replace(/\{/g, '').replace(/\}/g, '').toLowerCase();
}

targetUnits.forEach(unit => {
  const dir = `c:/mentos_os_clean/public/math_hints/${unit}`;
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

  files.forEach(file => {
    const filePath = path.join(dir, file);
    let data;
    try { data = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) { return; }

    // 1. Find the "Ground Truth" answer from AVS or last step
    let groundTruth = "";
    if (data.finalAnswer && data.finalAnswer.includes('x')) {
        groundTruth = data.finalAnswer;
    } else if (data.steps && data.steps.length > 0) {
        groundTruth = data.steps[data.steps.length - 1].latex || "";
    }

    // Clean groundTruth to find the core inequality
    const m = groundTruth.match(/x\s*[<>\\ge\\le=]+\s*-?\d+(\/\d+)?/);
    if (m) {
        const target = normalize(m[0]);
        
        // 2. Find matching choice
        if (data.choices && data.choices.length === 5) {
            let foundIdx = -1;
            for (let i = 0; i < 5; i++) {
                if (normalize(data.choices[i]) === target) {
                    foundIdx = i;
                    break;
                }
            }

            if (foundIdx !== -1) {
                const choiceNum = foundIdx + 1;
                data.A = String(choiceNum);
                data.correctAnswer = String(choiceNum);
                data.correctChoiceIndex = foundIdx;
                data.explanationFinalLine = `따라서 구하는 해는 ${m[0]}이며 정답은 ${choiceNum}번입니다.`;
                console.log(`[Fixed] ${unit}/${file} -> Option ${choiceNum}`);
            } else {
                // If not found, force the target into Option 3
                data.choices[2] = `$${m[0]}$`;
                data.A = "3";
                data.correctAnswer = "3";
                data.correctChoiceIndex = 2;
                data.explanationFinalLine = `따라서 구하는 해는 ${m[0]}이며 정답은 3번입니다.`;
                console.log(`[Forced] ${unit}/${file} -> Option 3`);
            }
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  });
});
console.log('Global Reconciliation Complete.');
