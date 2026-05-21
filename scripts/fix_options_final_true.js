import fs from 'fs';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let fixedCount = 0;
const fixedKeys = new Set();

for (const key of Object.keys(data)) {
  let text = data[key];
  if (!text) continue;
  let original = text;

  // Ensure trailing whitespace doesn't break matching
  if (text.includes('① $') && text.trim().endsWith('$')) {
    const idx = text.indexOf('① $');
    let before = text.substring(0, idx);
    let optionsPart = text.substring(idx);
    
    optionsPart = optionsPart.replace('① $', '① ');
    optionsPart = optionsPart.replace(/\$\s*$/, '');
    
    // Split by literal \n to process options line by line
    const lines = optionsPart.split('\\n');
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let m = line.match(/^([①②③④⑤])\s*(.*)$/);
      if (m) {
        let num = m[1];
        let body = m[2].trim();
        body = body.replace(/^\$/, '').replace(/\$$/, '');
        lines[i] = `${num} $${body}$`;
      }
    }
    optionsPart = lines.join('\\n');
    text = before + optionsPart;
  } else {
    // If not wrapped in a giant $ block, just make sure each option has $ if it has math
    const lines = text.split('\\n');
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let m = line.match(/^([①②③④⑤])\s*(.*)$/);
      if (m) {
        let num = m[1];
        let body = m[2].trim();
        if ((body.includes('\\frac') || body.includes('\\sqrt') || body.includes('\\pm') || body.includes('\\left')) && !body.startsWith('$')) {
          body = body.replace(/\$$/, '');
          lines[i] = `${num} $${body}$`;
        }
      }
    }
    text = lines.join('\\n');
  }

  if (text !== original) {
    data[key] = text;
    fixedKeys.add(key);
  }
}

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`Total fixed: ${fixedKeys.size}`);
