const fs = require('fs');
const path = require('path');

const targetUnits = [
  '고차방정식2단계', '고차방정식3단계', '고차방정식4단계',
  '일차부등식2단계', '일차부등식3단계', '일차부등식4단계',
  '이차부등식2단계', '이차부등식3단계', '이차부등식4단계'
];

const dbPath = 'c:/mentos_os_clean/DIAMOND_BOX_G1_2026_05_09/math_problem_texts.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

function fixMojibake(str) {
  if (!str) return '';
  return str.replace(/\?는/g, '또는').replace(/\?근/g, '실근').replace(/\?\?/g, '합은').replace(/\?/g, '는');
}

function normalizeMath(str) {
  if (!str) return '';
  let s = str.replace(/\s+/g, '').replace(/\\left|\\right/g, '').replace(/\{/g, '').replace(/\}/g, '').replace(/\$/g, '').replace(/,/g, '').replace(/또는|or/g, '|').replace(/\\pm/g, '+-').replace(/x=/g, '').replace(/\\;/g, '').replace(/\\n/g, '').toLowerCase().replace(/[^0-9a-z|+-/\\sqrt()i<>=\le\ge]/g, '');
  if (s.includes('|')) s = s.split('|').sort().join('|');
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

function getChoiceIndex(texts) {
    const markers = ['①', '②', '③', '④', '⑤'];
    for (const text of texts) {
        if (!text) continue;
        
        // Priority 1: "정답 [①-⑤]"
        const matchAns = text.match(/정답\s*[:\s]*([①-⑤1-5])/);
        if (matchAns) {
            const val = matchAns[1];
            const idx = markers.indexOf(val);
            if (idx !== -1) return idx + 1;
            return parseInt(val);
        }

        // Priority 2: First marker found in the string
        let earliestPos = Infinity;
        let earliestIdx = null;
        for (let i = 0; i < markers.length; i++) {
            const p = text.indexOf(markers[i]);
            if (p !== -1 && p < earliestPos) {
                earliestPos = p;
                earliestIdx = i + 1;
            }
        }
        if (earliestIdx) return earliestIdx;
    }
    return null;
}

targetUnits.forEach(unit => {
  const dir = `c:/mentos_os_clean/public/math_hints/${unit}`;
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const pid = file.replace('.json', '');
    
    const dbUnitKey = Object.keys(db).find(k => k.includes(unit) && k.includes('/'))?.split('/')[0] || unit;
    const pText = db[`${dbUnitKey}/${pid}.webp`];
    const aText = db[`${dbUnitKey}/${pid}a.webp`];
    
    let data;
    try { data = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) { return; }

    const choices = extractChoices(pText);
    const correctIdx = getChoiceIndex([aText, data.explanationFinalLine, data.finalAnswer, data.S]);

    if (choices.length > 0) {
        data.choices = choices;
        data.answerType = "multiple_choice";
        let found = correctIdx;
        if (!found) {
            const sol = normalizeMath(fixMojibake(aText || data.finalAnswer || ""));
            for (let i = 0; i < choices.length; i++) {
                if (normalizeMath(choices[i]) === sol) { found = i + 1; break; }
            }
        }
        if (found) {
            data.A = String(found);
            data.correctAnswer = String(found);
            data.correctChoiceIndex = found - 1;
        }
    } else {
        data.answerType = "multiple_choice";
        let val = fixMojibake(aText || data.finalAnswer || "").split('∴').pop().trim();
        if (val && val !== ".") {
            const distracts = [val + '+1', val + '-1', val, val + '*2', '0'];
            data.choices = distracts.map(d => `$${d}$`);
            data.A = "3";
            data.correctAnswer = "3";
            data.correctChoiceIndex = 2;
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  });
});
console.log('Universal Math Repair Vaccine (V3) Applied.');
