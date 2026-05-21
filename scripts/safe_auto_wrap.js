import fs from 'fs';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let fixedCount = 0;

function fixSafe(txt) {
  if (!txt) return txt;
  let o = txt;
  
  // Fix broken escapes
  o = o.replace(/\beq O\b/g, '$\\neq O$');
  o = o.replace(/\beq B\b/g, '$\\neq B$');
  o = o.replace(/\bsqrT\b/g, '\\sqrt{T}');
  o = o.replace(/\bsqlT\b/g, '\\sqrt{T}');
  
  // Safe wrap standalone commands
  o = o.replace(/(?<![\$\\])\\(therefore|cdots|bigcirc|pm|alpha|beta|gamma)\b(?![a-zA-Z])/g, '$\\$1$');
  
  // Fix orphan options: ① $ 2 \n -> $① 2$\n
  o = o.replace(/([①②③④⑤])\s*\$\s*([^\n\$]+)/g, '$$$1 $2$$');
  
  // Fix naked \frac{...}{...} only if simple
  o = o.replace(/(?<![\$\\])\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}(?!\$)/g, '$$\\frac{$1}{$2}$$');

  // Fix naked \sqrt{...} only if simple
  o = o.replace(/(?<![\$\\])\\sqrt\s*\{([^{}]+)\}(?!\$)/g, '$$\\sqrt{$1}$$');

  // Merge adjacent math blocks: $a$ $b$ -> $a b$
  o = o.replace(/\$\s+\$/g, ' ');

  return o;
}

for (const key of Object.keys(data)) {
  const original = data[key];
  if (!original) continue;
  
  const fixed = fixSafe(original);
  if (fixed !== original) {
    data[key] = fixed;
    fixedCount++;
  }
}

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Fixed ${fixedCount} entries safely.`);
