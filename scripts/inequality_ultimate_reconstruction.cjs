const fs = require('fs');
const path = require('path');

const problemTexts = JSON.parse(fs.readFileSync('src/data/math_problem_texts.json', 'utf8'));
const probKeys = Object.keys(problemTexts);

const units = [
    '일차부등식2단계', '일차부등식3단계', '일차부등식4단계',
    '이차부등식2단계', '이차부등식3단계', '이차부등식4단계'
];

function extractChoices(text) {
    if (!text) return null;
    const choices = [];
    // Match ① to ⑤
    const regex = /[①-⑤]\s*([^①-⑤\n]+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        choices.push(match[1].trim());
    }
    if (choices.length === 5) return choices;
    
    // Alternative: ㄱ, ㄴ, ㄷ style
    if (text.includes('ㄱ') && text.includes('ㄴ')) {
        return ["ㄱ", "ㄴ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄱ, ㄴ, ㄷ"];
    }
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
        
        // 1. Restore Choices from SSOT
        const ssotChoices = extractChoices(probText);
        if (ssotChoices) {
            data.choices = ssotChoices;
        }

        // 2. Align Answer
        if (data.steps && data.steps.length > 0) {
            const stepsText = data.steps.map(s => s.latex).join(' ');
            const lastStepLatex = data.steps[data.steps.length - 1].latex || '';
            
            let foundIdx = -1;
            const circles = ['①', '②', '③', '④', '⑤'];

            // Logic A: ㄱ, ㄴ, ㄷ combination
            if (data.choices && data.choices[0] === "ㄱ") {
                const k = stepsText.includes('ㄱ. (참)') || stepsText.includes('ㄱ (참)') || stepsText.includes('ㄱ: 참');
                const n = stepsText.includes('ㄴ. (참)') || stepsText.includes('ㄴ (참)') || stepsText.includes('ㄴ: 참');
                const d = stepsText.includes('ㄷ. (참)') || stepsText.includes('ㄷ (참)') || stepsText.includes('ㄷ: 참');
                
                if (k && n && d) foundIdx = 4;
                else if (k && d) foundIdx = 3;
                else if (k && n) foundIdx = 2;
                else if (n) foundIdx = 1;
                else if (k) foundIdx = 0;
            }
            
            // Logic B: Exact value match
            if (foundIdx === -1 && data.choices) {
                const clean = (s) => s.replace(/[\\$ \n\t\r{}()_]/g, '').toLowerCase();
                const resMatch = lastStepLatex.match(/=\s*([^=]+)$/) || [null, lastStepLatex];
                const res = clean(resMatch[1]);
                for (let i = 0; i < 5; i++) {
                    const choice = clean(data.choices[i]);
                    if (choice && (choice === res || choice.includes(res) || res.includes(choice))) {
                        foundIdx = i;
                        break;
                    }
                }
            }
            
            // Logic C: Circle in last step
            if (foundIdx === -1) {
                const circleMatch = lastStepLatex.match(/[①-⑤]/);
                if (circleMatch) foundIdx = circles.indexOf(circleMatch[0]);
            }

            if (foundIdx !== -1) {
                data.correctChoiceIndex = foundIdx;
                data.correctAnswer = (foundIdx + 1).toString();
                data.A = circles[foundIdx];
                data.answerType = 'multiple_choice';
                data.explanationFinalLine = `따라서 정답은 ${circles[foundIdx]}입니다.`;
            }
        }

        data.status = 'complete';
        data.pcbsa_completed = true;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    });
});
console.log('Inequality Ultimate Reconstruction complete.');
