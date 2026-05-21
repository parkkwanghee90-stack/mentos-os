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
    // Handle LaTeX and common Korean phrases for inequality answers
    return /[<>]/.test(str) || str.includes('\\le') || str.includes('\\ge') || str.includes('해는없다') || str.includes('모든실수') || str.includes('해는 없다') || str.includes('모든 실수');
}

function extractAnswer(data, unit, probNum) {
    const masterEntry = masterData.find(x => x.unit.includes(unit.masterFilter) && x.stage === unit.stage && x.problem === probNum);
    if (masterEntry && masterEntry.answer) return String(masterEntry.answer);

    if (data.steps && data.steps.length > 0) {
        const lastStep = (data.steps[data.steps.length - 1].latex || '').replace(/\\text\{.*?\}/g, '').trim();
        if (lastStep) return lastStep;
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

        // Skip manual fixes 001-005 in 일차부등식2단계
        if (unit.name === '일차부등식2단계' && probNum <= 5) return;

        let realAnswer = extractAnswer(data, unit, probNum);
        if (!realAnswer) return;

        // Clean LaTeX
        if (data.steps) {
            data.steps.forEach(s => { if (typeof s.latex === 'string') s.latex = s.latex.replace(/\$\$/g, ''); });
        }
        if (data.overlay_steps) {
            data.overlay_steps.forEach(s => { if (typeof s.latex === 'string') s.latex = s.latex.replace(/\$\$/g, ''); });
        }

        if (isInequality(realAnswer)) {
            const base = realAnswer.trim();
            data.answerType = "multiple_choice";
            
            // Smarter distractor generation
            let choices = [];
            if (base.includes('x')) {
                 choices = [
                    `$x < 0$`,
                    `$x > 0$`,
                    `$${base}$`,
                    `$x < -1$`,
                    `$x > 1$`
                 ];
            } else {
                 choices = ["해는 없다", "모든 실수", `$${base}$`, "0", "1"];
            }
            
            // Ensure correct mapping
            let idx = 2; // Target middle
            data.choices = choices;
            data.choices[idx] = base.startsWith('$') ? base : `$${base}$`;
            
            data.correctAnswer = String(idx + 1);
            data.correctChoiceIndex = idx;
            data.A = String(idx + 1);
            data.finalAnswer = `정답: ${base}`;
        } else {
            // Numeric -> Subjective
            data.answerType = "subjective";
            data.choices = [];
            data.correctAnswer = realAnswer;
            data.correctChoiceIndex = -1;
            data.A = realAnswer;
            data.finalAnswer = `정답: ${realAnswer}`;
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    });
    console.log(`[Vaccinated] ${unit.name}`);
});
