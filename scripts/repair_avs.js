import fs from 'fs';
import path from 'path';

const reportFile = 'logs/math1_avs_full_integrity_report.json';
if (!fs.existsSync(reportFile)) {
  console.log("Report not found.");
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
const filesToRepair = report.filter(r => r.repairNeeded).map(r => r.file);

console.log(`Starting repair for ${filesToRepair.length} files...`);

let successCount = 0;
let failCount = 0;

for (const file of filesToRepair) {
  if (!fs.existsSync(file)) continue;
  let raw = fs.readFileSync(file, 'utf8');

  // 1. Fix common encoding corruption causing missing quotes
  // e.g. "label_text": "구하??, => "label_text": "구하??",
  // We look for lines that have a string key, then a value starting with ", but ending with just a comma and newline.
  raw = raw.replace(/"(label_text|latex|label|description)"\s*:\s*"([^"\r\n]*?)(,\s*[\r\n]+)/g, '"$1": "$2"$3');
  // Also if it's the last item in object (no comma)
  raw = raw.replace(/"(label_text|latex|label|description)"\s*:\s*"([^"\r\n]*?)([\r\n]+})/g, '"$1": "$2"$3');

  // 2. Fix typos
  raw = raw.replace(/sqrT/g, '\\\\sqrt');
  raw = raw.replace(/sqlT/g, '\\\\sqrt');
  raw = raw.replace(/(?<!\\\\)sqrt/g, '\\\\sqrt'); // bare sqrt to \\sqrt

  // 3. Fix over-escaped macros
  raw = raw.replace(/\\\\\\\\sqrt/g, '\\\\sqrt');
  raw = raw.replace(/\\\\\\\\frac/g, '\\\\frac');
  raw = raw.replace(/\\\\\\\\pm/g, '\\\\pm');

  // 4. Fix newlines in LaTeX
  // literal \n in latex causes issues sometimes, but replacing it globally is tricky.
  // We'll replace \\n with \\\\ if it's inside latex.
  // Actually, replacing \\n with \\\\ globally in math strings is safer.
  raw = raw.replace(/\\\\n/g, '\\\\\\\\'); 
  
  // 5. Unwrapped \begin{pmatrix} -> wrapped in $$ $$
  // Since it's raw JSON string, \begin is \\begin
  // We'll parse it first to do deeper fixes if possible.
  
  try {
    const data = JSON.parse(raw);
    
    // Deep traverse to wrap \begin{...} and fix $...$
    function traverse(obj) {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          let str = obj[key];
          if (str.includes('\\begin{pmatrix}') || str.includes('\\begin{align*}')) {
             if (!str.includes('$$') && !str.includes('$') && !str.includes('\\[')) {
                 str = '$$' + str + '$$';
             }
          }
          // Remove replacement chars
          str = str.replace(/\uFFFD/g, '?');
          obj[key] = str;
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key]);
        }
      }
    }
    traverse(data);
    
    try {
      fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
      successCount++;
    } catch (e) {
      failCount++;
    }
  } catch(e) {
    // If it still fails to parse, write the raw fixes at least and count as fail
    try {
      fs.writeFileSync(file, raw, 'utf8');
    } catch (err) {}
    failCount++;
  }
}

console.log(`Repair finished. Success: ${successCount}, Failed to parse after fix: ${failCount}`);
