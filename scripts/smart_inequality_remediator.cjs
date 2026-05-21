const fs = require('fs');
const path = require('path');

const units = [
    { name: '일차부등식2단계', masterFilter: '일차부등식', stage: 2 },
    { name: '일차부등식3단계', masterFilter: '일차부등식', stage: 3 },
    { name: '일차부등식4단계', masterFilter: '일차부등식', stage: 4 },
    { name: '이차부등식2단계', masterFilter: '이차부등식', stage: 2 },
    { name: '이차부등식3단계', masterFilter: '이차부등식', stage: 3 },
    { name: '이차부등식4단계', masterFilter: '이차부등식', stage: 4 }
];

const masterData = JSON.parse(fs.readFileSync('c:/mentos_os_clean/src/data/answers_master.json', 'utf8'));

function isInequality(str) {
    if (!str) return false;
    return /[<>=]/.test(str) || str.includes('\\le') || str.includes('\\ge') || str.includes('해는없다') || str.includes('모든실수');
}

function extractAnswer(data, unit, probNum) {
    // 1. Try master data
    const masterEntry = masterData.find(x => x.unit.includes(unit.masterFilter) && x.stage === unit.stage && x.problem === probNum);
    if (masterEntry && masterEntry.answer) return masterEntry.answer;

    // 2. Try steps
    if (data.steps && data.steps.length > 0) {
        const lastStep = (data.steps[data.steps.length - 1].latex || '').replace(/\\text\{.*?\}/g, '');
        const ineqMatch = lastStep.match(/(-?\d+(\/\d+)?\s*[<>=]=?\s*)?x\s*[<>=]=?\s*-?\d+(\/\d+)?/);
        if (ineqMatch) return ineqMatch[0];
        const numMatch = lastStep.match(/-?\d+(\/\d+)?/);
        if (numMatch) return numMatch[0];
    }
    return null;
}

units.forEach(unit => {
    const dir = `c:/mentos_os_clean/public/math_hints/${unit.name}`;
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();

    files.forEach(file => {
        const filePath = path.join(dir, file);
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const probNum = parseInt(file.replace('.json', ''));

        let realAnswer = extractAnswer(data, unit, probNum);
        if (!realAnswer) return;

        // Surgical cleaning of LaTeX errors
        if (data.steps) {
            data.steps.forEach(s => { if (typeof s.latex === 'string') s.latex = s.latex.replace(/\$\$/g, ''); });
        }
        if (data.overlay_steps) {
            data.overlay_steps.forEach(s => { if (typeof s.latex === 'string') s.latex = s.latex.replace(/\$\$/g, ''); });
        }

        if (isInequality(realAnswer)) {
            // Logic: Inequality -> Multiple Choice
            const base = realAnswer.trim();
            data.answerType = "multiple_choice";
            // Create standard distractors
            if (base.includes('x')) {
                const symbol = base.includes('<') ? '<' : '>';
                const num = base.split(/[<>]=?/)[base.split(/[<>]=?/).length - 1].trim();
                data.choices = [
                    `$x ${symbol === '<' ? '>' : '<'} ${num}$`,
                    `$x ${symbol} ${num}$`,
                    `$${base}$`,
                    `$x \\geq ${num}$`,
                    `$x \\leq ${num}$`
                ];
            } else {
                data.choices = ["해는 없다", "모든 실수", `$${base}$`, "0", "1"];
            }
            // Find or force correct index (Targeting index 2/Option 3 for stability)
            let idx = data.choices.indexOf(`$${base}$`);
            if (idx === -1) idx = data.choices.indexOf(base);
            if (idx === -1) { data.choices[2] = `$${base}$`; idx = 2; }
            
            data.correctAnswer = String(idx + 1);
            data.correctChoiceIndex = idx;
            data.A = String(idx + 1);
            data.finalAnswer = `정답: ${base}`;
            console.log(`[MCQ] ${unit.name}/${file} -> ${base}`);
        } else {
            // Logic: Numeric -> Subjective
            data.answerType = "subjective";
            data.choices = [];
            data.correctAnswer = realAnswer;
            data.correctChoiceIndex = -1;
            data.A = realAnswer;
            data.finalAnswer = `정답: ${realAnswer}`;
            console.log(`[SUB] ${unit.name}/${file} -> ${realAnswer}`);
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    });
});
