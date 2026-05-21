const fs = require('fs');
const path = require('path');

const units = [
    { name: '고차방정식2단계', masterFilter: '고차방정식', stage: 2 },
    { name: '고차방정식3단계', masterFilter: '고차방정식', stage: 3 },
    { name: '고차방정식4단계', masterFilter: '고차방정식', stage: 4 }
];

const masterData = JSON.parse(fs.readFileSync('c:/mentos_os_clean/src/data/answers_master.json', 'utf8'));

function cleanAnswer(str) {
    if (!str) return null;
    let s = String(str).replace(/\\text\{.*?\}/g, '').replace(/계산 과정을 차근차근 전개해 봅시다\./g, '');
    s = s.replace(/따라서|이므로|구하는|의|값은|최댓값|최솟값|정답|은|는|입니다|이다|\./g, '').trim();
    return s;
}

units.forEach(unit => {
    const dir = `c:/mentos_os_clean/public/math_hints/${unit.name}`;
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();

    files.forEach(file => {
        const filePath = path.join(dir, file);
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const probNum = parseInt(file.replace('.json', ''));

        const masterEntry = masterData.find(x => x.unit.includes(unit.masterFilter) && x.stage === unit.stage && x.problem === probNum);
        
        let realAnswer = masterEntry ? cleanAnswer(masterEntry.answer) : null;
        let forceMCQ = (masterEntry && masterEntry.type === 'multiple_choice') || (data.answerType === 'multiple_choice');

        if (!realAnswer && data.steps && data.steps.length > 0) {
            const lastStep = data.steps[data.steps.length - 1].latex || '';
            realAnswer = cleanAnswer(lastStep);
        }

        if (!realAnswer) return;

        // LaTeX Cleanup
        if (data.steps) {
            data.steps.forEach(s => { if (typeof s.latex === 'string') s.latex = s.latex.replace(/\$\$/g, ''); });
        }

        if (forceMCQ || (masterEntry && masterEntry.type === 'multiple_choice')) {
            data.answerType = "multiple_choice";
            const base = realAnswer;
            // Generate standard choices if missing
            if (!data.choices || data.choices.length === 0) {
                if (!isNaN(parseInt(base)) && parseInt(base) <= 5) {
                    data.choices = ["$1$", "$2$", "$3$", "$4$", "$5$"];
                    data.correctAnswer = String(parseInt(base));
                    data.correctChoiceIndex = parseInt(base) - 1;
                } else {
                    data.choices = ["(1)", "(2)", `$${base}$`, "(4)", "(5)"];
                    data.correctAnswer = "3";
                    data.correctChoiceIndex = 2;
                }
            }
            data.A = data.correctAnswer;
        } else {
            // Numeric -> Subjective
            data.answerType = "subjective";
            data.choices = [];
            data.correctAnswer = realAnswer;
            data.correctChoiceIndex = -1;
            data.A = realAnswer;
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    });
    console.log(`[High Degree Equation Fixed] ${unit.name}`);
});
