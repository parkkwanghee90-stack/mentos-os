const fs = require('fs');
const path = require('path');

const dir = 'c:/mentos_os_clean/public/math_hints/고차방정식4단계';
const masterData = JSON.parse(fs.readFileSync('c:/mentos_os_clean/src/data/answers_master.json', 'utf8'));

if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();

    files.forEach(file => {
        const filePath = path.join(dir, file);
        let rawContent = fs.readFileSync(filePath, 'utf8');
        
        // 1. Surgical healing of the corrupted structure
        // This pattern handles the specifically leaked explanation field
        let healed = rawContent.replace(/\\",\s*"explanation":\s*"/g, ' ');
        healed = healed.replace(/\\"/g, '"');
        
        let data = JSON.parse(healed);
        const probNum = parseInt(file.replace('.json', ''));

        // 2. Extract answer from healed steps
        function extractLastAnswer(steps) {
            if (!steps || steps.length === 0) return null;
            let lastStep = steps[steps.length - 1].latex || '';
            lastStep = lastStep.replace(/\\/g, '').trim();
            const parts = lastStep.split('=');
            let ans = parts[parts.length - 1].trim();
            ans = ans.replace(/정답|입니다|이다|최종|은|는|\./g, '').trim();
            return ans;
        }

        const masterEntry = masterData.find(x => x.unit.includes('고차방정식') && x.stage === 4 && x.problem === probNum);
        let realAnswer = masterEntry ? String(masterEntry.answer) : null;

        if (!realAnswer || realAnswer === '0' || realAnswer === '13' || realAnswer.length > 10) {
            realAnswer = extractLastAnswer(data.steps) || extractLastAnswer(data.overlay_steps);
        }

        if (realAnswer) {
            const base = realAnswer;
            // Classify
            if (masterEntry && masterEntry.type === 'multiple_choice' && !isNaN(parseInt(base)) && parseInt(base) <= 5) {
                data.answerType = "multiple_choice";
                data.choices = ["$1$", "$2$", "$3$", "$4$", "$5$"];
                data.correctAnswer = base;
                data.correctChoiceIndex = parseInt(base) - 1;
            } else if (/[<>=]|\\pm|\\sqrt|\\alpha|\\beta|x/.test(base) && base.length > 5) {
                data.answerType = "multiple_choice";
                data.choices = ["(가)", "(나)", `$${base}$`, "(다)", "(라)"];
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

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`[Healed & Fixed] ${file} -> Ans: ${realAnswer}`);
    });
}
