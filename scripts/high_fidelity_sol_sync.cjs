const fs = require('fs');
const path = require('path');

const problemTexts = JSON.parse(fs.readFileSync('src/data/math_problem_texts.json', 'utf8'));
const keys = Object.keys(problemTexts);

const units = [
    '일차부등식2단계', '일차부등식3단계', '일차부등식4단계',
    '이차부등식2단계', '이차부등식3단계', '이차부등식4단계'
];

units.forEach(unit => {
    const dirPath = path.join('public/math_hints', unit);
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const probId = file.replace('.json', '');

        const solKey = keys.find(k => k.includes(`${unit}/${probId}a.webp`));
        const solText = solKey ? problemTexts[solKey] : "";

        const qKey = keys.find(k => k.includes(`${unit}/${probId}.webp`));
        const qText = qKey ? problemTexts[qKey] : "";

        // 1. Extract Choices
        const circles = ['①', '②', '③', '④', '⑤'];
        let choices = [];
        const choiceRegex = /[①-⑤]\s*([^①-⑤\n]+)/g;
        let m;
        while ((m = choiceRegex.exec(qText)) !== null) {
            choices.push(m[1].trim());
        }
        if (choices.length === 5) data.choices = choices;

        // 2. Determine Answer from Solution Text
        let foundIdx = -1;
        
        // A. Handle ㄱ, ㄴ, ㄷ
        if (solText.includes('ㄱ') && solText.includes('ㄴ')) {
            const k = solText.includes('ㄱ. (참)') || solText.includes('ㄱ (참)') || solText.includes('ㄱ: 참') || solText.includes('ㄱ은 참');
            const n = solText.includes('ㄴ. (참)') || solText.includes('ㄴ (참)') || solText.includes('ㄴ: 참') || solText.includes('ㄴ은 참');
            const d = solText.includes('ㄷ. (참)') || solText.includes('ㄷ (참)') || solText.includes('ㄷ: 참') || solText.includes('ㄷ은 참');
            
            if (k && n && d) foundIdx = 4;
            else if (k && d) foundIdx = 3;
            else if (k && n) foundIdx = 2;
            else if (n) foundIdx = 1;
            else if (k) foundIdx = 0;
        }

        // B. Handle explicit answer in solution text
        if (foundIdx === -1) {
            const ansMatch = solText.match(/정답은\s*([①-⑤])/);
            if (ansMatch) foundIdx = circles.indexOf(ansMatch[1]);
        }

        // C. Fallback to choice matching in solution text
        if (foundIdx === -1 && data.choices) {
            for (let i = 0; i < 5; i++) {
                const choice = data.choices[i].replace(/[\\$ \n]/g, '');
                if (choice.length > 2 && solText.includes(choice)) {
                    foundIdx = i;
                    // Keep searching to find the LAST mention which is often the answer
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

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    });
});
console.log('High-Fidelity Solution Sync complete.');
