import fs from 'fs';
import path from 'path';

const baseDir = './public/math_hints';
const problemTexts = JSON.parse(fs.readFileSync('./src/data/math_problem_texts.json', 'utf8'));

const targetFolders = [
  '고차방정식2단계', '고차방정식3단계', '고차방정식4단계',
  '이차부등식2단계', '이차부등식3단계', '이차부등식4단계',
  '원의방정식2단계', '원의방정식3단계', '원의방정식4단계',
  '도형의이동2단계', '도형의이동3단계', '도형의이동4단계'
];

function normalizeMath(s) {
    if (!s) return "";
    let clean = s.replace(/\\n/g, "")
                 .replace(/ 또는 /g, "")
                 .replace(/\\text\{.*?\}|\\/g, "")
                 .replace(/text\{/g, "")
                 .replace(/\s+/g, "")
                 .replace(/\{|\}/g, "")
                 .replace(/[\(\)]/g, "")
                 .replace(/\$+/g, "")
                 .replace(/=/g, "")
                 .replace(/pm/g, "±")
                 .replace(/\\pm/g, "±")
                 .replace(/[\.;,]+$/, "")
                 .replace(/\\+$/, "")
                 .trim();
    return clean;
}

function extractChoices(text) {
    if (!text) return null;
    const parts = text.split(/[①②③④⑤]/);
    if (parts.length < 6) return null;
    return parts.slice(1).map(p => p.trim());
}

function compareAnswers(val, choice) {
    const nVal = normalizeMath(val);
    const nChoice = normalizeMath(choice);
    
    if (nChoice === nVal && nVal.length > 0) return true;
    if (nVal.length > 2 && nChoice.includes(nVal)) return true;
    if (nChoice.length > 2 && nVal.includes(nChoice)) return true;
    
    try {
        const evalVal = evalFraction(val);
        const evalChoice = evalFraction(choice);
        if (evalVal !== null && evalChoice !== null) {
            return Math.abs(evalVal - evalChoice) < 0.001;
        }
    } catch(e) {}
    
    return false;
}

function evalFraction(s) {
    if (!s) return null;
    let clean = s.replace(/\\frac\{(-?\d+)\}\{(-?\d+)\}/g, "$1/$2")
                 .replace(/\\/g, "")
                 .replace(/\{|\}/g, "")
                 .replace(/\s+/g, "");
    if (/^-?\d+\/-?\d+$/.test(clean)) {
        const [n, d] = clean.split('/').map(Number);
        return n / d;
    }
    if (/^-?\d+(\.\d+)?$/.test(clean)) {
        return Number(clean);
    }
    return null;
}

let stats = { fixed: 0, alreadyCorrect: 0, failed: 0 };

targetFolders.forEach(folder => {
    const folderPath = path.join(baseDir, folder);
    if (!fs.existsSync(folderPath)) return;

    fs.readdirSync(folderPath).forEach(file => {
        if (!file.endsWith('.json')) return;
        const filePath = path.join(folderPath, file);
        let data;
        try {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch(e) { return; }

        if (data.answerType !== 'multiple_choice') return;

        let actualValue = data.finalAnswer;
        const steps = data.steps || data.overlay_steps || [];
        if (steps.length > 0) {
            const lastStep = steps[steps.length - 1].latex || "";
            const parts = lastStep.split(/정답은|따라서/);
            const valPart = parts[0].trim();
            if (valPart && valPart.length > 1) {
                const rhsParts = valPart.split('=');
                let candidate = rhsParts[rhsParts.length - 1].trim();
                if (candidate.length > 0) actualValue = candidate;
            }
        }

        const probKey = `${folder}/${file.replace('.json', '.webp')}`;
        const probText = problemTexts[probKey];
        const choices = extractChoices(probText);

        let matchFound = false;
        if (choices) {
            let matchIndex = -1;
            for (let i = 0; i < choices.length; i++) {
                if (compareAnswers(actualValue, choices[i])) {
                    matchIndex = i;
                    break;
                }
            }

            if (matchIndex !== -1) {
                data.finalAnswer = actualValue;
                data.correctChoiceIndex = matchIndex;
                data.correctAnswer = String(matchIndex + 1);
                data.status = "complete";
                data.pcbsa_completed = true;
                if (data.reason) delete data.reason;
                matchFound = true;
                stats.fixed++;
            }
        }

        if (!matchFound) {
            // Check if it already has a valid digit
            const digit = parseInt(data.correctAnswer || data.finalAnswer);
            if (digit >= 1 && digit <= 5) {
                data.correctChoiceIndex = digit - 1;
                data.correctAnswer = String(digit);
                data.status = "complete";
                data.pcbsa_completed = true;
                if (data.reason) delete data.reason;
                stats.alreadyCorrect++;
            } else {
                data.reason = "choice_mapping_failed";
                data.pcbsa_completed = false;
                stats.failed++;
            }
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    });
});

console.log(`Final Choice Mapping Result: Fixed: ${stats.fixed}, Already Correct: ${stats.alreadyCorrect}, Failed: ${stats.failed}`);
