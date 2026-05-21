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

function cleanAnswer(str) {
    if (!str) return null;
    let s = String(str).replace(/\\text\{.*?\}/g, '').replace(/계산 과정을 차근차근 전개해 봅시다\./g, '');
    s = s.replace(/따라서|이므로|구하는|의|값은|최댓값|최솟값|정답|은|는|입니다|이다|\./g, '').trim();
    return s;
}

function isInequality(str) {
    if (!str) return false;
    return /[<>]/.test(str) || str.includes('\\le') || str.includes('\\ge') || str.includes('해는없다') || str.includes('모든실수');
}

units.forEach(unit => {
    const dir = `c:/mentos_os_clean/public/math_hints/${unit.name}`;
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();

    files.forEach(file => {
        const filePath = path.join(dir, file);
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const probNum = parseInt(file.replace('.json', ''));

        if (unit.name === '일차부등식2단계' && probNum <= 11) return;

        const masterEntry = masterData.find(x => x.unit.includes(unit.masterFilter) && x.stage === unit.stage && x.problem === probNum);
        
        let realAnswer = masterEntry ? cleanAnswer(masterEntry.answer) : null;
        let forceMCQ = masterEntry && masterEntry.type === 'multiple_choice';

        if (!realAnswer && data.steps && data.steps.length > 0) {
            const lastStep = data.steps[data.steps.length - 1].latex || '';
            const ineqMatch = lastStep.match(/(-?\d+(\/\d+)?\s*[<>=]=?\s*)?x\s*[<>=]=?\s*-?\d+(\/\d+)?/);
            realAnswer = ineqMatch ? ineqMatch[0] : cleanAnswer(lastStep);
        }

        if (!realAnswer) return;

        if (isInequality(realAnswer) || forceMCQ) {
            data.answerType = "multiple_choice";
            const base = realAnswer;
            // Generate generic options if numeric option code, or specific if range
            if (forceMCQ && !isNaN(parseInt(base)) && parseInt(base) <= 5) {
                 data.choices = ["$1$", "$2$", "$3$", "$4$", "$5$"];
                 data.correctAnswer = base;
                 data.correctChoiceIndex = parseInt(base) - 1;
            } else {
                 data.choices = [`$x < 0$`, `$x > 0$`, `$${base}$`, `$x < -1$`, `$x > 1$`];
                 data.correctAnswer = "3";
                 data.correctChoiceIndex = 2;
                 data.choices[2] = base.startsWith('$') ? base : `$${base}$`;
            }
            data.A = data.correctAnswer;
            data.finalAnswer = `정답: ${base}`;
        } else {
            data.answerType = "subjective";
            data.choices = [];
            data.correctAnswer = realAnswer;
            data.correctChoiceIndex = -1;
            data.A = realAnswer;
            data.finalAnswer = `정답: ${realAnswer}`;
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    });
    console.log(`[Vaccinated v4] ${unit.name}`);
});
