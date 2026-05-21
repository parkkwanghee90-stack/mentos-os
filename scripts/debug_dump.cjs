const fs = require('fs');
const path = require('path');

const unit = '일차부등식2단계';
const dir = `c:/mentos_os_clean/public/math_hints/${unit}`;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();

files.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    console.log(`--- ${file} ---`);
    console.log(`Steps: ${data.steps ? data.steps[data.steps.length-1].latex : 'N/A'}`);
    console.log(`Choices: ${JSON.stringify(data.choices)}`);
    console.log(`Correct: ${data.correctAnswer} (Index ${data.correctChoiceIndex})`);
    console.log(`Final: ${data.finalAnswer}`);
});
