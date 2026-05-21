const fs = require('fs');
const path = require('path');

const folders = ['점과좌표2단계', '점과좌표3단계', '점과좌표4단계', '(3)점과좌표 개념2단계(44)p17 1+1(쌍둥이)', '(5)점과좌표 개념2단계(44)p17 1+1(쌍둥이)'];

folders.forEach(folder => {
    const dir = path.join('public', 'math_hints', folder);
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    files.forEach(file => {
        const filePath = path.join(dir, file);
        try {
            JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            console.error(`INVALID JSON: ${filePath} - ${e.message}`);
        }
    });
});
console.log('Validation complete.');
