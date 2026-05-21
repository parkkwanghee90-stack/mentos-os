const fs = require('fs');
const path = require('path');

const problemTexts = JSON.parse(fs.readFileSync('src/data/math_problem_texts.json', 'utf8'));
const keys = Object.keys(problemTexts);

const units = [
    { name: '일차부등식2단계', search: '2단계' },
    { name: '일차부등식3단계', search: '3단계' },
    { name: '일차부등식4단계', search: '4단계' },
    { name: '이차부등식2단계', search: '2단계' },
    { name: '이차부등식3단계', search: '3단계' },
    { name: '이차부등식4단계', search: '4단계' },
    { name: '행렬2단계', search: '2단계' },
    { name: '행렬3단계', search: '3단계' },
    { name: '행렬4단계', search: '4단계' },
    { name: '고차방정식2단계', search: '2단계' },
    { name: '고차방정식3단계', search: '3단계' },
    { name: '고차방정식4단계', search: '4단계' }
];

units.forEach(u => {
    const dirPath = path.join('public/math_hints', u.name);
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const probId = file.replace('.json', '');

        // Fuzzy search for keys
        // Find keys that contain the stage number and the probId
        const qKey = keys.find(k => k.includes(u.search) && k.includes(`/${probId}.webp`));
        const solKey = keys.find(k => k.includes(u.search) && k.includes(`/${probId}a.webp`));

        const qText = qKey ? problemTexts[qKey] : "";
        const solText = solKey ? problemTexts[solKey] : "";

        // 1. Extract Choices from Question Text
        const circles = ['①', '②', '③', '④', '⑤'];
        let choices = [];
        const choiceRegex = /[①-⑤]\s*([^①-⑤\n]+)/g;
        let m;
        while ((m = choiceRegex.exec(qText)) !== null) {
            choices.push(m[1].trim());
        }
        
        // Alternative choice extraction if circles are missing (e.g. ㄱ, ㄴ, ㄷ)
        if (choices.length < 5 && qText.includes('ㄱ')) {
            choices = ["ㄱ", "ㄴ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄱ, ㄴ, ㄷ"];
        }

        if (choices.length === 5) {
            data.choices = choices;
        }

        // 2. Extract Answer from Solution Text
        let foundIdx = -1;
        if (solText.includes('ㄱ') && solText.includes('ㄴ')) {
            const k = solText.includes('ㄱ은 참') || solText.includes('ㄱ (참)') || solText.includes('ㄱ: 참') || solText.includes('ㄱ. (참)');
            const n = solText.includes('ㄴ은 참') || solText.includes('ㄴ (참)') || solText.includes('ㄴ: 참') || solText.includes('ㄴ. (참)');
            const d = solText.includes('ㄷ은 참') || solText.includes('ㄷ (참)') || solText.includes('ㄷ: 참') || solText.includes('ㄷ. (참)');
            
            if (k && n && d) foundIdx = 4;
            else if (k && d) foundIdx = 3;
            else if (k && n) foundIdx = 2;
            else if (n) foundIdx = 1;
            else if (k) foundIdx = 0;
        }

        if (foundIdx === -1) {
            const ansMatch = solText.match(/정답은\s*([①-⑤])/) || solText.match(/정답\s*:\s*([①-⑤])/);
            if (ansMatch) foundIdx = circles.indexOf(ansMatch[1]);
        }

        // Final attempt: Choice string matching
        if (foundIdx === -1 && data.choices) {
            for (let i = 0; i < 5; i++) {
                const choice = data.choices[i].replace(/[\\$ \n]/g, '');
                if (choice.length > 2 && solText.includes(choice)) {
                    foundIdx = i;
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
console.log('Ultimate SSOT Reconstruction complete.');
