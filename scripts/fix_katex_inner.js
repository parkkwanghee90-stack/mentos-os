import fs from 'fs';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let fixedCount = 0;
const fixedKeys = new Set();

for (const key of Object.keys(data)) {
  let text = data[key];
  if (!text) continue;
  let original = text;

  // 1. Remove inner $ from \[ ... \]
  text = text.replace(/\\\\\[([\s\S]*?)\\\\\]/g, (match, body) => {
    return '\\\\[' + body.replace(/\$/g, '') + '\\\\]';
  });

  // 2. Remove inner $ from $$ ... $$
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, body) => {
    return '$$' + body.replace(/\$/g, '') + '$$';
  });

  // 3. Fix \text{① $} -> \text{①} 
  text = text.replace(/\\\\text\{([①②③④⑤])\s*\$\}/g, '\\\\text{$1}');

  // 4. Fix orphan $ inside \text{...}
  // This is tricky, but often it's like \text{ $ }
  text = text.replace(/\\\\text\{([^}]*)\}/g, (match, body) => {
    const dollarCount = (body.match(/\$/g) || []).length;
    if (dollarCount % 2 !== 0) {
      return '\\\\text{' + body.replace(/\$/g, '') + '}';
    }
    return match;
  });

  if (text !== original) {
    data[key] = text;
    fixedKeys.add(key);
  }
}

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Fixed KaTeX inside issues: ${fixedKeys.size}`);
