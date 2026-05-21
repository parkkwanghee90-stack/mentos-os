const fs = require('fs');
const path = require('path');

const targetUnits = ['고차방정식2단계', '고차방정식3단계', '고차방정식4단계'];
const dbPath = 'c:/mentos_os_clean/DIAMOND_BOX_G1_2026_05_09/math_problem_texts.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

function fixMojibake(str) {
  if (!str) return '';
  return str.replace(/\?는/g, '또는').replace(/\?근/g, '실근').replace(/\?\?/g, '합은').replace(/\?/g, '는');
}

function normalizeMath(str) {
  if (!str) return '';
  let s = str.replace(/\s+/g, '').replace(/\\left|\\right/g, '').replace(/\{/g, '').replace(/\}/g, '').replace(/\$/g, '').replace(/,/g, '').replace(/또는|or/g, '|').replace(/\\pm/g, '+-').replace(/x=/g, '').replace(/\\;/g, '').toLowerCase();
  if (s.includes('=')) s = s.split('=').pop();
  s = s.replace(/[^0-9a-z|+-/\\sqrt()i]/g, '');
  if (s.includes('|')) s = s.split('|').filter(x => x.length > 0).sort().join('|');
  return s;
}

function extractChoices(text) {
  if (!text) return [];
  const choices = [];
  const markers = [/①/g, /②/g, /③/g, /④/g, /⑤/g];
  const pos = [];
  markers.forEach((r, i) => { r.lastIndex = 0; const m = r.exec(text); if (m) pos.push({ i: i + 1, p: m.index }); });
  pos.sort((a, b) => a.p - b.p);
  for (let i = 0; i < pos.length; i++) {
    const start = pos[i].p + 1;
    const end = pos[i + 1] ? pos[i + 1].p : text.length;
    choices.push(fixMojibake(text.substring(start, end).trim()));
  }
  return choices;
}

targetUnits.forEach(unit => {
  const dir = `c:/mentos_os_clean/public/math_hints/${unit}`;
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const pid = file.replace('.json', '');
    const pText = db[`${unit}/${pid}.webp`];
    const aText = db[`${unit}/${pid}a.webp`];
    
    let data;
    try { data = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) { return; }

    const choices = extractChoices(pText);
    if (choices.length > 0) {
      data.choices = choices;
      data.answerType = "multiple_choice";
      
      // Manual fixes
      if (unit === '고차방정식3단계' && pid === '028') { data.A = "3"; }
      else if (unit === '고차방정식4단계' && pid === '001') { data.A = "5"; }
      else {
          // Automatic mapping for others
          let sol = fixMojibake(aText || data.finalAnswer || "");
          let nSol = normalizeMath(sol);
          let found = null;
          for (let i = 0; i < choices.length; i++) {
            if (normalizeMath(choices[i]) === nSol) { found = i + 1; break; }
          }
          if (found) data.A = String(found);
      }
      
      if (data.A) {
          data.correctAnswer = data.A;
          data.correctChoiceIndex = parseInt(data.A) - 1;
      }
    }
    
    if (unit === '고차방정식2단계' && pid === '011') {
        data.A = "1";
        data.correctAnswer = "1";
        data.answerType = "short_answer";
        data.choices = undefined;
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  });
});
console.log('Final Fix for Higher-degree Equations Done.');
