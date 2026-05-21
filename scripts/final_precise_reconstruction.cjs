const fs = require('fs');
const path = require('path');

const problemTexts = JSON.parse(fs.readFileSync('src/data/math_problem_texts.json', 'utf8'));
const keys = Object.keys(problemTexts);

const unitMappings = {
    '일차부등식2단계': '일차부등식',
    '일차부등식3단계': '일차부등식3단계',
    '일차부등식4단계': '일차부등식4단계',
    '이차부등식2단계': '이차부등식',
    '이차부등식3단계': '이차부등식3단계',
    '이차부등식4단계': '이차부등식4단계',
    '행렬2단계': '행렬2단계',
    '행렬3단계': '행렬3단계',
    '행렬4단계': '행렬4단계',
    '고차방정식2단계': '고차방정식2단계',
    '고차방정식3단계': '고차방정식3단계',
    '고차방정식4단계': '고차방정식4단계'
};

Object.keys(unitMappings).forEach(unitName => {
    const dirPath = path.join('public/math_hints', unitName);
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const probId = file.replace('.json', '');

        // Precise Key Search
        const searchPattern = unitMappings[unitName];
        const qKey = keys.find(k => k.includes(searchPattern) && k.includes(`/${probId}.webp`));
        const solKey = keys.find(k => k.includes(searchPattern) && k.includes(`/${probId}a.webp`));

        const qText = qKey ? problemTexts[qKey] : "";
        const solText = solKey ? problemTexts[solKey] : "";

        // 1. Extract Choices
        const circles = ['①', '②', '③', '④', '⑤'];
        let choices = [];
        const choiceRegex = /[①-⑤]\s*([^①-⑤\n]+)/g;
        let m;
        while ((m = choiceRegex.exec(qText)) !== null) {
            choices.push(m[1].trim());
        }
        
        if (choices.length < 5 && qText.includes('ㄱ')) {
            choices = ["ㄱ", "ㄴ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄱ, ㄴ, ㄷ"];
        }

        if (choices.length === 5) data.choices = choices;

        // 2. Determine Answer
        let foundIdx = -1;
        if (solText.includes('ㄱ') && solText.includes('ㄴ')) {
            const k = solText.includes('ㄱ') && (solText.includes('참') || solText.includes('옳다')) && solText.indexOf('ㄱ') < solText.indexOf('ㄴ');
            const n = solText.includes('ㄴ') && (solText.includes('참') || solText.includes('옳다'));
            const d = solText.includes('ㄷ') && (solText.includes('참') || solText.includes('옳다'));
            
            // Re-refine ㄱㄴㄷ logic from solText snippets
            const k_res = solText.match(/ㄱ[^\n(]*\((참|옳다)\)/) || solText.match(/ㄱ은\s*참/);
            const n_res = solText.match(/ㄴ[^\n(]*\((참|옳다)\)/) || solText.match(/ㄴ은\s*참/);
            const d_res = solText.match(/ㄷ[^\n(]*\((참|옳다)\)/) || solText.match(/ㄷ은\s*참/);

            if (k_res && n_res && d_res) foundIdx = 4;
            else if (k_res && d_res) foundIdx = 3;
            else if (k_res && n_res) foundIdx = 2;
            else if (n_res) foundIdx = 1;
            else if (k_res) foundIdx = 0;
        }

        if (foundIdx === -1) {
            const ansMatch = solText.match(/정답은\s*([①-⑤])/) || solText.match(/정답\s*:\s*([①-⑤])/);
            if (ansMatch) foundIdx = circles.indexOf(ansMatch[1]);
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
console.log('Final Precise Reconstruction complete.');
