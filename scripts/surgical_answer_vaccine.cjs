const fs = require('fs');
const path = require('path');

const units = [
    { name: '일차부등식2단계', masterFilter: '일차부등식', stage: 2 },
    { name: '일차부등식3단계', masterFilter: '일차부등식', stage: 3 },
    { name: '일차부등식4단계', masterFilter: '일차부등식', stage: 4 }
];

const masterData = JSON.parse(fs.readFileSync('c:/mentos_os_clean/src/data/answers_master.json', 'utf8'));

function extractAnswerFromSteps(steps) {
    if (!steps || steps.length === 0) return null;
    const lastStep = steps[steps.length - 1].latex || '';
    // Look for x < num, x > num, x = num, or just a number
    const match = lastStep.match(/x\s*[<>=]=?\s*-?\d+(\/\d+)?/);
    if (match) return match[0];
    const numMatch = lastStep.match(/-?\d+(\/\d+)?/);
    if (numMatch) return numMatch[0];
    return null;
}

units.forEach(unit => {
    const dir = `c:/mentos_os_clean/public/math_hints/${unit.name}`;
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const probNum = parseInt(file.replace('.json', ''));

        // 1. Get answer from Master DB
        const masterEntry = masterData.find(x => x.unit.includes(unit.masterFilter) && x.stage === unit.stage && x.problem === probNum);
        let realAnswer = masterEntry ? masterEntry.answer : null;

        // 2. If not in Master, extract from steps
        if (!realAnswer) {
            realAnswer = extractAnswerFromSteps(data.steps);
        }

        if (realAnswer) {
            // Standardize choices
            const choices = [];
            // We want the real answer to be at Index 2 (Option 3) for consistency if possible, or just generate 5.
            const baseAnswer = realAnswer;
            
            // Simple distractor generation logic
            if (baseAnswer.includes('x')) {
                // Inequality distractions
                const symbol = baseAnswer.includes('<') ? '<' : '>';
                const num = baseAnswer.split(/[<>]=?/)[1]?.trim() || '0';
                choices.push(`$x ${symbol === '<' ? '>' : '<'} ${num}$`);
                choices.push(`$x ${symbol} ${num}$`); // Answer candidate
                choices.push(`$x \\leq ${num}$`);
                choices.push(`$x \\geq ${num}$`);
                choices.push(`$x ${symbol} -${num}$`);
            } else if (!isNaN(parseFloat(baseAnswer))) {
                // Numeric distractions
                const val = parseFloat(baseAnswer);
                choices.push(`$${val - 2}$`);
                choices.push(`$${val - 1}$`);
                choices.push(`$${val}$`); // Answer candidate
                choices.push(`$${val + 1}$`);
                choices.push(`$${val + 2}$`);
            } else {
                // Fallback for complex strings
                choices.push(`$${baseAnswer} (1)$`);
                choices.push(`$${baseAnswer} (2)$`);
                choices.push(`$${baseAnswer}$`);
                choices.push(`$${baseAnswer} (4)$`);
                choices.push(`$${baseAnswer} (5)$`);
            }

            // Shuffle or ensure correct index
            const correctIdx = choices.indexOf(`$${baseAnswer}$`) === -1 ? 2 : choices.indexOf(`$${baseAnswer}$`);
            if (choices.indexOf(`$${baseAnswer}$`) === -1) {
                 choices[2] = `$${baseAnswer}$`;
            }
            
            data.choices = choices;
            data.correctAnswer = String(correctIdx + 1);
            data.correctChoiceIndex = correctIdx;
            data.answerType = "multiple_choice";
            data.A = String(correctIdx + 1);
            data.finalAnswer = `정답: ${baseAnswer}`;
            
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`[Vaccinated] ${unit.name}/${file} -> Answer: ${baseAnswer}`);
        }
    });
});
