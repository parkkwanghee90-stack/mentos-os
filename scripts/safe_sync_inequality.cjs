const fs = require('fs');
const path = require('path');

const units = [
    '일차부등식2단계', '일차부등식3단계', '일차부등식4단계',
    '이차부등식2단계', '이차부등식3단계', '이차부등식4단계',
    '부등식2단계'
];

const masterData = JSON.parse(fs.readFileSync('c:/mentos_os_clean/src/data/answers_master.json', 'utf8'));

units.forEach(unit => {
    const dir = `c:/mentos_os_clean/public/math_hints/${unit}`;
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

    files.forEach(file => {
        const filePath = path.join(dir, file);
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const probNum = parseInt(file.replace('.json', ''));

        // Target mapping
        let filterUnit = unit.includes('이차') ? '이차부등식' : (unit.includes('일차') ? '일차부등식' : '부등식');
        let stage = parseInt(unit.match(/\d/)[0]);

        const entry = masterData.find(x => x.unit === filterUnit && x.stage === stage && x.problem === probNum);

        if (entry) {
            const ans = String(entry.answer);
            // MCQ conversion logic
            if (entry.type === 'multiple_choice' && /^[1-5]$/.test(ans)) {
                data.answerType = "multiple_choice";
                data.choices = ["$1$", "$2$", "$3$", "$4$", "$5$"];
                data.correctAnswer = ans;
                data.correctChoiceIndex = parseInt(ans) - 1;
            } else if (/[<>=]|x/.test(ans) || ans.length > 3) {
                // Range answer -> Index 3 MCQ
                data.answerType = "multiple_choice";
                data.choices = ["$x < 0$", "$x > 0$", `$${ans}$`, "$x < -1$", "$x > 1$"];
                data.correctAnswer = "3";
                data.correctChoiceIndex = 2;
            } else {
                data.answerType = "subjective";
                data.choices = [];
                data.correctAnswer = ans;
                data.correctChoiceIndex = -1;
            }
            data.A = data.correctAnswer;
            data.finalAnswer = `정답: ${ans}`;
            
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        }
    });
    console.log(`[Safe Synced] ${unit}`);
});
