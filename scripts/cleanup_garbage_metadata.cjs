const fs = require('fs');
const path = require('path');

const units = [
    '행렬2단계', '행렬3단계', '행렬4단계',
    '고차방정식2단계', '고차방정식3단계', '고차방정식4단계'
];

units.forEach(unit => {
    const dirPath = path.join('public/math_hints', unit);
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
    console.log(`Auditing ${unit}...`);

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Fix encoding artifacts if they were double-encoded or corrupted
        // Note: In Node.js, readFileSync with 'utf8' handles UTF-8.
        
        let data;
        try {
            data = JSON.parse(content);
        } catch (e) {
            console.error(`Error parsing ${filePath}: ${e.message}`);
            return;
        }

        let changed = false;

        // 1. Fix Garbage Answers
        if (data.correctAnswer === '\\end{pmatrix}' || data.correctAnswer === '\\endd{pmatrix}') {
            if (data.correctChoiceIndex !== undefined && data.correctChoiceIndex >= 0 && data.correctChoiceIndex < 5) {
                data.correctAnswer = (data.correctChoiceIndex + 1).toString();
                data.A = data.choices ? data.choices[data.correctChoiceIndex] : data.correctAnswer;
                changed = true;
            } else {
                // Try to find circle number in steps
                const lastStep = data.steps ? data.steps[data.steps.length - 1] : null;
                const lastLatex = lastStep ? lastStep.latex : '';
                const circleMatch = lastLatex.match(/[①-⑤]/);
                if (circleMatch) {
                    const circleMap = { '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5' };
                    data.correctAnswer = circleMap[circleMatch[0]];
                    data.correctChoiceIndex = parseInt(data.correctAnswer) - 1;
                    data.A = circleMatch[0];
                    changed = true;
                }
            }
        }

        // 2. Fix explanationFinalLine
        if (data.explanationFinalLine && data.explanationFinalLine.includes('\\end{pmatrix}')) {
            if (data.A && data.A !== '\\end{pmatrix}') {
                data.explanationFinalLine = `따라서 정답은 ${data.A}입니다.`;
                changed = true;
            }
        }

        // 3. Fix Broken LaTeX artifacts in steps
        if (data.steps) {
            data.steps.forEach(step => {
                if (step.latex && step.latex.includes('\\endd')) {
                    step.latex = step.latex.replace(/\\endd/g, '\\end');
                    changed = true;
                }
            });
        }
        if (data.overlay_steps) {
            data.overlay_steps.forEach(step => {
                if (step.latex && step.latex.includes('\\endd')) {
                    step.latex = step.latex.replace(/\\endd/g, '\\end');
                    changed = true;
                }
            });
        }

        // 4. Ensure answerType is consistent
        if (data.correctChoiceIndex !== undefined && data.correctChoiceIndex !== -1) {
            if (data.answerType !== 'multiple_choice') {
                data.answerType = 'multiple_choice';
                changed = true;
            }
        }

        if (changed) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        }
    });
});
console.log('Automated cleanup of garbage fields and LaTeX artifacts complete.');
