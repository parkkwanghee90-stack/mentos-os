const fs = require('fs');
const path = require('path');

const unitName = '고차방정식4단계';
const dir = `c:/mentos_os_clean/public/math_hints/${unitName}`;
const masterData = JSON.parse(fs.readFileSync('c:/mentos_os_clean/src/data/answers_master.json', 'utf8'));

function cleanAnswer(str) {
    if (!str) return null;
    let s = String(str).replace(/\\text\{.*?\}/g, '').replace(/계산 과정을 차근차근 전개해 봅시다\./g, '');
    s = s.replace(/따라서|이므로|구하는|의|값은|최댓값|최솟값|정답|은|는|입니다|이다|\./g, '').trim();
    // Extract the very last part after = or at the end
    const parts = s.split('=');
    let candidate = parts[parts.length - 1].trim();
    // Remove trailing dots or commas
    candidate = candidate.replace(/[.,]$/, '');
    return candidate;
}

if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();

    files.forEach(file => {
        const filePath = path.join(dir, file);
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const probNum = parseInt(file.replace('.json', ''));

        const masterEntry = masterData.find(x => x.unit.includes('고차방정식') && x.stage === 4 && x.problem === probNum);
        
        let realAnswer = masterEntry ? masterEntry.answer : null;
        
        // Validation of master data
        if (!realAnswer || realAnswer === '0' || realAnswer === '13') {
            const lastStep = data.steps[data.steps.length - 1].latex || '';
            realAnswer = cleanAnswer(lastStep);
        }

        if (realAnswer) {
            const base = realAnswer;
            // Detect if it's an option index or a value
            if (masterEntry && masterEntry.type === 'multiple_choice' && !isNaN(parseInt(base)) && parseInt(base) <= 5) {
                data.answerType = "multiple_choice";
                data.choices = ["$1$", "$2$", "$3$", "$4$", "$5$"];
                data.correctAnswer = String(parseInt(base));
                data.correctChoiceIndex = parseInt(base) - 1;
            } else {
                // If answer is complex or from steps, determine type
                if (/[<>=]|\\pm|\\sqrt/.test(base)) {
                    // Complex -> MCQ
                    data.answerType = "multiple_choice";
                    data.choices = ["(가)", "(나)", `$${base}$`, "(다)", "(라)"];
                    data.correctAnswer = "3";
                    data.correctChoiceIndex = 2;
                } else {
                    // Simple value -> SUB
                    data.answerType = "subjective";
                    data.choices = [];
                    data.correctAnswer = base;
                    data.correctChoiceIndex = -1;
                }
            }
            data.A = data.correctAnswer;
            data.finalAnswer = `정답: ${base}`;
            
            // Clean steps LaTeX as well
            if (data.steps) {
                data.steps.forEach(s => { if (typeof s.latex === 'string') s.latex = s.latex.replace(/\$\$/g, ''); });
            }
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`[Fixed] ${file} -> Ans: ${realAnswer} (${data.answerType})`);
    });
}
