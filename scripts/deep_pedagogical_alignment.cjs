const fs = require('fs');
const path = require('path');

const units = [
    '행렬2단계', '행렬3단계', '행렬4단계',
    '고차방정식2단계', '고차방정식3단계', '고차방정식4단계',
    '일차부등식2단계', '일차부등식3단계', '일차부등식4단계',
    '이차부등식2단계', '이차부등식3단계', '이차부등식4단계'
];

const problemTexts = JSON.parse(fs.readFileSync('src/data/math_problem_texts.json', 'utf8'));

units.forEach(unit => {
    const dirPath = path.join('public/math_hints', unit);
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const probId = file.replace('.json', '');

        // 1. Get ground truth from AVS steps (the calculation is usually correct)
        if (data.steps && data.steps.length > 0) {
            const lastStep = data.steps[data.steps.length - 1];
            const lastLatex = lastStep.latex || '';
            
            const circles = ['①', '②', '③', '④', '⑤'];
            let foundIdx = -1;

            // Check for explicit circle in last step
            const circleMatch = lastLatex.match(/[①-⑤]/);
            if (circleMatch) {
                foundIdx = circles.indexOf(circleMatch[0]);
            } else if (data.choices && data.choices.length === 5) {
                // Try to find which choice matches the mathematical result
                const valMatch = lastLatex.match(/=\s*([^\s\\$]+)$/);
                if (valMatch) {
                    const res = valMatch[1].replace(/[\\$ ]/g, '');
                    for (let i = 0; i < 5; i++) {
                        const choice = data.choices[i].replace(/[\\$ \n]/g, '').replace(/\\n$/, '');
                        if (choice === res || choice.includes(res) || res.includes(choice)) {
                            foundIdx = i;
                            break;
                        }
                    }
                }
            }

            if (foundIdx !== -1) {
                data.correctChoiceIndex = foundIdx;
                data.correctAnswer = (foundIdx + 1).toString();
                data.A = circles[foundIdx];
                data.answerType = 'multiple_choice';
                data.explanationFinalLine = `따라서 정답은 ${circles[foundIdx]}입니다.`;
            }
        }

        // 2. Special Hardcoded Fixes (Top priority for user complaints)
        if (unit === '고차방정식4단계' && probId === '001') {
            data.correctChoiceIndex = 4;
            data.correctAnswer = "5";
            data.A = "⑤";
            data.answerType = "multiple_choice";
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    });
});
console.log('Deep Pedagogical Alignment complete.');
