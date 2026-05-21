const fs = require('fs');
const path = require('path');

const dir = 'public/math_hints/고차방정식4단계';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

let changedFiles = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  const data = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(data);
  let changed = false;

  if (json.steps) {
    for (const step of json.steps) {
      if (step.latex) {
        const original = step.latex;
        let newLatex = original.replace(/\\text{([^}]+)}/g, (m, p1) => {
          let replaced = p1.replace(/(다\.|입니다\.|이다\.|한다\.|합니다\.|이므로,|면,|고,)\s+(?!\\\\)/g, '$1} \\\\\\\\ \\text{');
          return '\\text{' + replaced + '}';
        });
        newLatex = newLatex.replace(/\\\\ \\text{}/g, '\\\\'); // clean up empty \text{}
        
        if (newLatex !== original) {
          step.latex = newLatex;
          changed = true;
        }
      }
    }
  }
  
  if (json.overlay_steps) {
    for (const step of json.overlay_steps) {
      if (step.latex) {
        const original = step.latex;
        let newLatex = original.replace(/\\text{([^}]+)}/g, (m, p1) => {
          let replaced = p1.replace(/(다\.|입니다\.|이다\.|한다\.|합니다\.|이므로,|면,|고,)\s+(?!\\\\)/g, '$1} \\\\\\\\ \\text{');
          return '\\text{' + replaced + '}';
        });
        newLatex = newLatex.replace(/\\\\ \\text{}/g, '\\\\'); // clean up empty \text{}
        
        if (newLatex !== original) {
          step.latex = newLatex;
          changed = true;
        }
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Total updated files: ${changedFiles}`);
