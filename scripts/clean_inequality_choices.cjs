const fs = require('fs');
const path = require('path');

const targetUnits = [
  '일차부등식2단계', '일차부등식3단계', '일차부등식4단계',
  '이차부등식2단계', '이차부등식3단계', '이차부등식4단계'
];

function cleanChoice(text) {
    if (!text) return "";
    let s = text.replace(/^\$/, '').replace(/\$$/, '').trim();
    s = s.replace(/^정답\s*/, '').replace(/^답[:\s]*/, '').replace(/해설.*$/, '').trim();
    s = s.replace(/이다\.?$/, '').replace(/입니다\.?$/, '').trim();
    if (s.includes('x >') || s.includes('x <') || s.includes('x \\ge') || s.includes('x \\le')) {
        const m = s.match(/x\s*[<>\\ge\\le]+\s*-?\d+(\/\d+)?/);
        if (m) s = m[0];
    }
    return `$${s}$`;
}

targetUnits.forEach(unit => {
  const dir = `c:/mentos_os_clean/public/math_hints/${unit}`;
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

  files.forEach(file => {
    const filePath = path.join(dir, file);
    let data;
    try { data = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) { return; }

    if (data.choices && data.choices.length > 0) {
        const oldCorrect = data.choices[data.correctChoiceIndex || 2];
        data.choices = data.choices.map(c => cleanChoice(c));
        
        // Ensure no duplicates
        data.choices = data.choices.map((c, i) => {
            if (data.choices.indexOf(c) !== i) return cleanChoice(c + ' (' + i + ')');
            return c;
        });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  });
});
console.log('Surgical Choice Cleaning Complete.');
