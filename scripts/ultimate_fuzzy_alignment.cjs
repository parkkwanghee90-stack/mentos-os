const fs = require('fs');
const path = require('path');

const units = [
    '행렬2단계', '행렬3단계', '행렬4단계',
    '고차방정식2단계', '고차방정식3단계', '고차방정식4단계',
    '일차부등식2단계', '일차부등식3단계', '일차부등식4단계',
    '이차부등식2단계', '이차부등식3단계', '이차부등식4단계'
];

function clean(str) {
    if (!str) return '';
    return str.replace(/[\\$ \n\t\r{}()_]/g, '').toLowerCase();
}

units.forEach(unit => {
    const dirPath = path.join('public/math_hints', unit);
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const probId = file.replace('.json', '');

        if (data.steps && data.steps.length > 0) {
            const lastStep = data.steps[data.steps.length - 1];
            const lastLatex = lastStep.latex || '';
            
            const circles = ['①', '②', '③', '④', '⑤'];
            let foundIdx = -1;

            // 1. Circle match
            const circleMatch = lastLatex.match(/[①-⑤]/);
            if (circleMatch) {
                foundIdx = circles.indexOf(circleMatch[0]);
            } else if (data.choices && data.choices.length === 5) {
                // 2. Fuzzy content match
                // Extract everything after "=" or the last mathematical expression
                const resMatch = lastLatex.match(/=\s*([^=]+)$/);
                if (resMatch) {
                    const res = clean(resMatch[1]);
                    for (let i = 0; i < 5; i++) {
                        const choice = clean(data.choices[i]);
                        if (choice === res || choice.includes(res) || res.includes(choice)) {
                            foundIdx = i;
                            break;
                        }
                    }
                }
                
                // 3. Last-ditch: find any choice value in the last latex
                if (foundIdx === -1) {
                   for (let i = 0; i < 5; i++) {
                        const choice = clean(data.choices[i]);
                        if (choice.length > 0 && clean(lastLatex).includes(choice)) {
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

        // Hardcoded fixes for "NOT" questions or ambiguous ones
        if (unit === '고차방정식4단계' && probId === '001') {
            data.correctChoiceIndex = 4; data.correctAnswer = "5"; data.A = "⑤"; data.answerType = "multiple_choice";
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    });
});
console.log('Ultimate Fuzzy Alignment complete.');
