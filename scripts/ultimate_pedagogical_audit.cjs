const fs = require('fs');
const path = require('path');

const problemTexts = JSON.parse(fs.readFileSync('src/data/math_problem_texts.json', 'utf8'));
const probKeys = Object.keys(problemTexts);

const units = [
    '행렬4단계', '고차방정식4단계', '이차부등식4단계'
];

function extractChoices(text) {
    if (!text) return null;
    const choices = [];
    const regex = /[①-⑤]\s*([^①-⑤\n]+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        choices.push(match[1].trim());
    }
    if (choices.length === 5) return choices;
    return null;
}

units.forEach(unit => {
    const dirPath = path.join('public/math_hints', unit);
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        let data;
        try {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch(e) { return; }

        const probId = file.replace('.json', '');
        const key = probKeys.find(k => k.includes(`${unit}/${probId}.webp`));
        const probText = key ? problemTexts[key] : null;
        const choices = extractChoices(probText);
        if (choices) data.choices = choices;

        if (data.steps && data.steps.length > 0) {
            const lastStep = data.steps[data.steps.length - 1];
            const lastLatex = lastStep.latex || '';

            // Improved regex for result extraction
            const valMatches = [...lastLatex.matchAll(/=\s*(\\begin\{pmatrix\}.*?\\end\{pmatrix\}|\\frac\{-?\d+\}\{-?\d+\}|-?\d+\/\d+|-?\d+|[①-⑤]|k\s*>\s*[^\s\\$]+|x\s*=\s*[^\s\\$]+)/gs)];
            
            if (valMatches.length > 0) {
                const result = valMatches[valMatches.length - 1][1].replace(/\s/g, '');
                let foundIdx = -1;
                const circles = ['①', '②', '③', '④', '⑤'];
                
                if (circles.includes(result)) {
                    foundIdx = circles.indexOf(result);
                } else if (data.choices) {
                    const cleanRes = result.replace(/[\\$ ]/g, '');
                    for (let i = 0; i < 5; i++) {
                        const cleanChoice = data.choices[i].replace(/[\\$ \n]/g, '');
                        if (cleanChoice === cleanRes || cleanChoice.includes(cleanRes) || cleanRes.includes(cleanChoice)) {
                            foundIdx = i;
                            break;
                        }
                    }
                }

                if (foundIdx !== -1) {
                    data.correctChoiceIndex = foundIdx;
                    data.correctAnswer = (foundIdx + 1).toString();
                    data.A = circles[foundIdx];
                    data.answerType = 'multiple_choice';
                    data.explanationFinalLine = `따라서 정답은 ${circles[foundIdx]}입니다.`;
                } else {
                    // Fallback for short answer
                    data.correctAnswer = result;
                    data.A = result;
                    data.answerType = 'short_answer';
                    data.explanationFinalLine = `따라서 정답은 ${result}입니다.`;
                }
            }
        }
        
        // Specific fix for 4-001 (NOT question)
        if (unit === '고차방정식4단계' && probId === '001') {
            data.correctChoiceIndex = 4;
            data.correctAnswer = "5";
            data.A = "⑤";
            data.answerType = "multiple_choice";
            data.explanationFinalLine = "따라서 정답은 ⑤입니다.";
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    });
});
console.log('Ultimate Pedagogical Audit (v2) complete.');
