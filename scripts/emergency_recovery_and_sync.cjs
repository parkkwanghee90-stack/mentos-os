const fs = require('fs');
const path = require('path');

const units = [
    '일차부등식2단계', '일차부등식3단계', '일차부등식4단계',
    '이차부등식2단계', '이차부등식3단계', '이차부등식4단계'
];

const masterData = JSON.parse(fs.readFileSync('c:/mentos_os_clean/src/data/answers_master.json', 'utf8'));

units.forEach(unit => {
    const srcDir = `c:/mentos_os_clean/DIAMOND_BOX_G1_2026_05_09/math_hints/${unit}`;
    const destDir = `c:/mentos_os_clean/public/math_hints/${unit}`;

    if (!fs.existsSync(srcDir)) return;
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));

    files.forEach(file => {
        const srcPath = path.join(srcDir, file);
        const destPath = path.join(destDir, file);
        
        let data = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
        const probNum = parseInt(file.replace('.json', ''));

        // 1. Clean LaTeX ONLY by removing $$ (if any)
        // DO NOT use the healer scripts that caused the red text.
        function simpleClean(latex) {
            if (!latex) return "";
            return latex.replace(/\$\$/g, '').trim();
        }

        if (data.steps) {
            data.steps.forEach(s => { s.latex = simpleClean(s.latex); });
        }
        if (data.overlay_steps) {
            data.overlay_steps.forEach(s => { s.latex = simpleClean(s.latex); });
        }

        // 2. Re-inject Answer System from Master
        const masterFilter = unit.includes('일차') ? '일차부등식' : '이차부등식';
        const stage = parseInt(unit.match(/\d/)[0]);
        const masterEntry = masterData.find(x => x.unit.includes(masterFilter) && x.stage === stage && x.problem === probNum);

        if (masterEntry) {
            const base = String(masterEntry.answer);
            if (masterEntry.type === 'multiple_choice' && !isNaN(parseInt(base)) && parseInt(base) <= 5) {
                data.answerType = "multiple_choice";
                data.choices = ["$1$", "$2$", "$3$", "$4$", "$5$"];
                data.correctAnswer = base;
                data.correctChoiceIndex = parseInt(base) - 1;
            } else if (/[<>=]|x/.test(base) || base.length > 5) {
                 // Inequality result
                 data.answerType = "multiple_choice";
                 data.choices = ["$x < 0$", "$x > 0$", `$${base}$`, "$x < -1$", "$x > 1$"];
                 data.correctAnswer = "3";
                 data.correctChoiceIndex = 2;
            } else {
                data.answerType = "subjective";
                data.choices = [];
                data.correctAnswer = base;
                data.correctChoiceIndex = -1;
            }
            data.A = data.correctAnswer;
            data.finalAnswer = `정답: ${base}`;
        }

        fs.writeFileSync(destPath, JSON.stringify(data, null, 2), 'utf8');
    });
    console.log(`[Emergency Restored & Synced] ${unit}`);
});
