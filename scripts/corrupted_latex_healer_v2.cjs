const fs = require('fs');
const path = require('path');

const dir = 'c:/mentos_os_clean/public/math_hints/고차방정식4단계';
const masterData = JSON.parse(fs.readFileSync('c:/mentos_os_clean/src/data/answers_master.json', 'utf8'));

if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();

    files.forEach(file => {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Surgical cleanup of the corrupted string segments
        content = content.replace(/\\",\s*"explanation":\s*"/g, ' ');
        content = content.replace(/\\+"/g, '"');
        content = content.replace(/\\+/g, '\\\\'); // Escape backslashes for JSON

        try {
            let data = JSON.parse(content);
            const probNum = parseInt(file.replace('.json', ''));

            function extractLastAnswer(steps) {
                if (!steps || steps.length === 0) return null;
                let lastStep = steps[steps.length - 1].latex || '';
                lastStep = lastStep.replace(/\\\\/g, '').trim();
                const parts = lastStep.split('=');
                let ans = parts[parts.length - 1].trim();
                ans = ans.replace(/정답|입니다|이다|최종|은|는|\./g, '').trim();
                return ans;
            }

            const masterEntry = masterData.find(x => x.unit.includes('고차방정식') && x.stage === 4 && x.problem === probNum);
            let realAnswer = masterEntry ? String(masterEntry.answer) : null;

            if (!realAnswer || realAnswer === '0' || realAnswer === '13' || realAnswer.length > 15) {
                realAnswer = extractLastAnswer(data.steps) || extractLastAnswer(data.overlay_steps);
            }

            if (realAnswer) {
                const base = realAnswer;
                if (masterEntry && masterEntry.type === 'multiple_choice' && !isNaN(parseInt(base)) && parseInt(base) <= 5) {
                    data.answerType = "multiple_choice";
                    data.choices = ["$1$", "$2$", "$3$", "$4$", "$5$"];
                    data.correctAnswer = base;
                    data.correctChoiceIndex = parseInt(base) - 1;
                } else if (/[<>=]|pm|sqrt|alpha|beta|x/.test(base) && base.length > 5) {
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
            console.log(`[Healed v2] ${file} -> Ans: ${realAnswer}`);
        } catch (e) {
            console.log(`[Error] ${file}: ${e.message}`);
        }
    });
}
