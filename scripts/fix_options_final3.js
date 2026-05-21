import fs from 'fs';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let fixedCount = 0;
const fixedKeys = new Set();

for (const key of Object.keys(data)) {
  let text = data[key];
  if (!text) continue;
  let original = text;

  // Check if options block is wrapped in a single giant $ block
  // i.e., "① $" and ending with "$" (ignoring trailing whitespace)
  if (text.includes('① $') && text.trim().endsWith('$')) {
    // Extract the part up to ① $
    const idx = text.indexOf('① $');
    let before = text.substring(0, idx);
    let optionsPart = text.substring(idx);
    
    // Strip the $ at the beginning of ① using string replace
    optionsPart = optionsPart.replace('① $', '① ');
    // Strip the $ at the end of the string
    optionsPart = optionsPart.replace(/\$\s*$/, '');
    
    // Now wrap each option individually
    optionsPart = optionsPart.replace(/([①②③④⑤])\s*([^\n]+)/g, (match, num, body) => {
      let b = body.trim();
      b = b.replace(/^\$/, '').replace(/\$$/, '');
      return `${num} $${b}$`;
    });
    
    text = before + optionsPart;
  } else {
    // General fix for any option that has \frac, \sqrt etc. but is NOT properly wrapped
    text = text.replace(/([①②③④⑤])\s*([^\n]+)/g, (match, num, body) => {
      let b = body.trim();
      if ((b.includes('\\frac') || b.includes('\\sqrt') || b.includes('\\pm') || b.includes('\\left')) && !b.startsWith('$')) {
        b = b.replace(/\$$/, '');
        return `${num} $${b}$`;
      }
      return match;
    });
  }

  // Double check 고차방정식2단계/045 format
  if (key.includes('고차방정식2단계/045')) {
     console.log('Processed 고차방정식2단계/045');
  }

  if (text !== original) {
    data[key] = text;
    fixedKeys.add(key);
  }
}

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`Total fixed: ${fixedKeys.size}`);
