const fs = require('fs');

const units = ['이차부등식2단계','이차부등식3단계','이차부등식4단계'];
let updated = 0;

function cleanLatex(latex) {
  if (!latex) return latex;
  let str = latex.replace(/\$/g, '');
  
  // Wrap raw Korean text in \text{}
  // This regex finds Korean substrings not inside \text{...}
  // Simplified logic: just wrap any Korean character sequences
  str = str.replace(/([가-힣]+(?:[ \t]*[가-힣]+)*)(?![^\{]*\})/g, (match) => {
    // Check if it's already in \text{...}
    // We assume if it's not preceded by \text{ then we wrap
    return `\\text{${match.trim()}}`;
  });
  
  // Clean up double \text{\text{...}}
  while(str.includes('\\text{\\text{')) {
    str = str.replace(/\\text{\\text{/g, '\\text{').replace(/}}/g, '}');
  }
  
  return str.trim();
}

units.forEach(unit => {
  const dir = 'public/math_hints/' + unit;
  if(!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  files.forEach(f => {
    const p = dir + '/' + f;
    let j = JSON.parse(fs.readFileSync(p, 'utf8'));
    
    // Only process 5-step files that are not already completed? 
    // Actually we can process all of them to remove $ and fix latex.
    // But for those with != 5 steps, we'll mark them incomplete so LLM can pick them up later.
    
    if (j.steps) {
      j.steps.forEach(s => {
        if (s.latex) s.latex = cleanLatex(s.latex);
        if (s.label) {
          if (s.label.includes('P:') || s.label.includes('C:') || s.label.includes('B:') || s.label.includes('S:') || s.label.includes('A:')) {
            // Label is fine
          }
        }
      });
    }
    
    if (j.overlay_steps) {
      delete j.overlay_steps;
    }
    
    if (j.finalAnswer) {
      j.finalAnswer = j.finalAnswer.replace(/\$/g, '');
    }
    
    if (j.choices) {
      j.choices = j.choices.map(c => c.replace(/\$/g, ''));
    }
    
    if (j.steps && j.steps.length === 5) {
      j.pcbsa_completed = true;
      j.status = 'complete';
      delete j.manual_review_required;
    } else {
      j.pcbsa_completed = false;
      j.status = 'incomplete';
    }
    
    fs.writeFileSync(p, JSON.stringify(j, null, 2), 'utf8');
    updated++;
  });
});

console.log('Processed ' + updated + ' files. Formatting applied.');
