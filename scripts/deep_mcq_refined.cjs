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

        let filterUnit = unit.includes('이차') ? '이차부등식' : (unit.includes('일차') ? '일차부등식' : '부등식');
        let stage = parseInt(unit.match(/\d/)[0]);

        const entry = masterData.find(x => x.unit === filterUnit && x.stage === stage && x.problem === probNum);
        
        let shouldBeMCQ = false;
        let ansValue = "";

        if (entry) {
            ansValue = String(entry.answer);
            if (entry.type === 'multiple_choice') shouldBeMCQ = true;
            if (/[<>=]|x/.test(ansValue) || ansValue.length > 5) shouldBeMCQ = true;
        } else {
            const lastStep = (data.steps && data.steps.length > 0) ? data.steps[data.steps.length - 1].latex : "";
            if (/[\\leq|\\geq|<|>|x]/.test(lastStep)) {
                shouldBeMCQ = true;
                // Surgical clean of LaTeX to get JUST the math
                ansValue = lastStep.replace(/\\\\/g, '\n').split('\n').pop().trim();
                ansValue = ansValue.replace(/계산 과정을 차근차근 전개해 봅시다\.|정답:|따라서|입니다|이다|\./g, '').trim();
            }
        }

        if (shouldBeMCQ) {
            data.answerType = "multiple_choice";
            if (/^[1-5]$/.test(ansValue)) {
                data.choices = ["$1$", "$2$", "$3$", "$4$", "$5$"];
                data.correctAnswer = ansValue;
                data.correctChoiceIndex = parseInt(ansValue) - 1;
            } else {
                // If it's empty or too long, just put a generic placeholder or keep it clean
                const displayAns = ansValue || "조건을 만족하는 범위";
                data.choices = ["$x < 0$", "$x > 0$", `$${displayAns}$`, "$x < -1$", "$x > 1$"];
                data.correctAnswer = "3";
                data.correctChoiceIndex = 2;
            }
            data.A = data.correctAnswer;
            data.finalAnswer = `정답: ${ansValue}`;
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        }
    });
    console.log(`[Deep MCQ Refined] ${unit}`);
});
