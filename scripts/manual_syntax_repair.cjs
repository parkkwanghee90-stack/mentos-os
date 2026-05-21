const fs = require('fs');
const path = require('path');

const folders = [
    '고차방정식2단계', '고차방정식3단계', '고차방정식4단계',
    '일차부등식2단계', '일차부등식3단계', '일차부등식4단계',
    '이차부등식2단계', '이차부등식3단계', '이차부등식4단계',
    '경우의수2단계', '경우의수3단계', '경우의수4단계',
    '행렬2단계', '행렬3단계', '행렬4단계',
    '점과좌표2단계', '점과좌표3단계', '점과좌표4단계',
    '직선의방정식2단계', '직선의방정식3단계', '직선의방정식4단계',
    '원의방정식2단계', '원의방정식3단계', '원의방정식4단계',
    '도형의이동2단계', '도형의이동3단계', '도형의이동4단계',
    '삼각함수활용2단계'
];

let totalFixed = 0;

function fixContent(content) {
    let fixed = content;
    // Fix triple or more backslashes
    fixed = fixed.replace(/\\\\\\\\\\+/g, '\\\\');
    // Fix empty text
    fixed = fixed.replace(/\\text\{\s*\}/g, '');
    // Fix spacing text
    fixed = fixed.replace(/\\text\{\s{2,}\}/g, ' \\quad ');
    return fixed;
}

for (const f of folders) {
    const dirPath = path.join(__dirname, 'public/math_hints', f);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const fixed = fixContent(content);
        if (content !== fixed) {
            fs.writeFileSync(filePath, fixed, 'utf8');
            totalFixed++;
            console.log(`Fixed syntax in: ${f}/${file}`);
        }
    }
}

console.log(`Manual syntax repair complete. Total files fixed: ${totalFixed}`);
