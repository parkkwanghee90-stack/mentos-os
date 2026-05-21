const fs = require('fs');
const path = require('path');

const problemTexts = JSON.parse(fs.readFileSync('src/data/math_problem_texts.json', 'utf8'));
const probKeys = Object.keys(problemTexts);

const unit = { folder: '행렬2단계', search: '행렬2단계' };

function extractChoices(text) {
    if (!text) return null;
    const choices = [];
    const regex = /[①-⑤]\s*([^①-⑤\n]+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        choices.push(match[1].trim());
    }
    if (choices.length === 5) return choices;
    
    // Fallback for circle numbers only
    const circleRegex = /[①-⑤]/g;
    const circles = text.match(circleRegex);
    if (circles && circles.length === 5) {
        return ['①', '②', '③', '④', '⑤'];
    }
    return null;
}

const dirPath = path.join('public/math_hints', unit.folder);
const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const probId = file.replace('.json', '');
    
    const key = probKeys.find(k => k.includes(`${unit.search}/${probId}.webp`));
    const probText = key ? problemTexts[key] : null;
    const choices = extractChoices(probText);

    // Fix Metadata even if steps are okay
    if (choices) {
        data.choices = choices;
        data.answerType = 'multiple_choice';
    }

    // Try to find the correct answer from the last step or A field
    // If it's garbage like \end{pmatrix}, we must find the circle number in the latex
    let circleAns = null;
    if (data.steps) {
        const lastStep = data.steps[data.steps.length - 1];
        const circleMatch = lastStep.latex.match(/[①-⑤]/);
        if (circleMatch) {
            circleAns = circleMatch[0];
        }
    }

    const circleMap = { '①': 0, '②': 1, '③': 3, '④': 3, '⑤': 4 }; // Wait, typo in my map? 
    const correctMap = { '①': 0, '②': 1, '③': 2, '④': 3, '⑤': 4 };
    
    if (circleAns) {
        data.correctChoiceIndex = correctMap[circleAns];
        data.correctAnswer = (data.correctChoiceIndex + 1).toString();
        data.A = circleAns;
        data.explanationFinalLine = `따라서 정답은 ${circleAns}입니다.`;
    } else if (data.correctChoiceIndex !== undefined && data.correctChoiceIndex !== -1) {
        const idx = data.correctChoiceIndex;
        const circles = ['①', '②', '③', '④', '⑤'];
        data.correctAnswer = (idx + 1).toString();
        data.A = circles[idx];
        data.explanationFinalLine = `따라서 정답은 ${circles[idx]}입니다.`;
    }

    // Fix LaTeX \endd artifacts
    let str = JSON.stringify(data, null, 2);
    str = str.replace(/\\\\endd/g, '\\\\end');
    
    // Fix broken encoding markers if they exist as literal question marks
    // This is hard to automate without knowing the original text, 
    // but for Matrix, the steps are usually okay.
    
    fs.writeFileSync(filePath, str, 'utf8');
});
console.log('Matrix Level 2 deep metadata repair complete.');
