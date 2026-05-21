import fs from 'fs';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let fixedCount = 0;
const fixedKeys = new Set();

for (const key of Object.keys(data)) {
  let text = data[key];
  if (!text) continue;
  let original = text;

  // Find cases where options are wrapped in a single $ ... $ block
  // i.e., "① $..." and ending with "...$"
  if (text.includes('① $') && text.endsWith('$')) {
    // Strip the $ at the beginning of ①
    text = text.replace(/① \$/g, '① ');
    // Strip the $ at the end of the string
    text = text.replace(/\$$/, '');
    
    // Now wrap each option individually
    text = text.replace(/([①②③④⑤])\s*([^\n]+)/g, (match, num, body) => {
      let b = body.trim();
      // Clean any trailing/leading $ just in case
      b = b.replace(/^\$/, '').replace(/\$$/, '');
      
      // If it contains math commands, wrap it
      if (b.includes('\\frac') || b.includes('\\sqrt') || b.includes('\\pm') || b.includes('i') || /[a-zA-Z]/.test(b) || b.includes('-')) {
         return `${num} $${b}$`;
      }
      return `${num} ${b}`;
    });
  } else {
    // General fix for any option that has \frac, \sqrt etc. but is NOT properly wrapped
    text = text.replace(/([①②③④⑤])\s*([^\n]+)/g, (match, num, body) => {
      let b = body.trim();
      if ((b.includes('\\frac') || b.includes('\\sqrt') || b.includes('\\pm') || b.includes('\\left')) && !b.startsWith('$')) {
        // Strip trailing $ if it's strangely placed
        b = b.replace(/\$$/, '');
        return `${num} $${b}$`;
      }
      return match;
    });
  }

  if (text !== original) {
    data[key] = text;
    fixedKeys.add(key);
  }
}

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');

console.log(Array.from(fixedKeys).join('\\n'));
console.log(`\nTotal fixed: ${fixedKeys.size}`);
