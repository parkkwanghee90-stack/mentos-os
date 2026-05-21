const fs = require('fs');
const path = require('path');

const targetUnits = [
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
  let s = str.replace(/\s+/g, '').replace(/\\left|\\right/g, '').replace(/\{/g, '').replace(/\}/g, '').replace(/\$/g, '').replace(/,/g, '').replace(/또는|or/g, '|').replace(/\\pm/g, '+-').replace(/x=/g, '').replace(/\\;/g, '').replace(/\\n/g, '').toLowerCase();
  if (s.includes('=')) s = s.split('=').pop();
  s = s.replace(/[^0-9a-z|+-/\\sqrt()i<>=\le\ge]/g, '');
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

function extractChoiceIndexFromText(text) {
    if (!text) return null;
    const markers = ['①', '②', '③', '④', '⑤'];
    for (let i = 0; i < markers.length; i++) {
        if (text.includes(markers[i])) return i + 1;
    }
    const match = text.match(/정답\s*([1-5])번?/);
    if (match) return parseInt(match[1]);
    return null;
}

function extractFinalAnswer(text) {
  if (!text) return '';
  const fixed = fixMojibake(text);
  const lastThereforeIdx = fixed.lastIndexOf('∴');
  if (lastThereforeIdx !== -1) {
      let res = fixed.substring(lastThereforeIdx + 1).split('\n')[0].trim();
      if (res.length > 0) return res.replace(/이다\.?$/, '').trim();
  }
  const lines = fixed.split('\n').filter(l => l.trim().length > 0);
  const lastLine = lines[lines.length - 1];
  const patterns = [/정답은\s*(.*)\s*$/, /합은\s*(.*)\s*$/, /값은\s*(.*)\s*$/, /=\s*([^=]*)$/];
  for (const p of patterns) {
    const m = lastLine.match(p) || fixed.match(p);
    if (m) {
      let res = m[1].replace(/이다\.?$/, '').trim();
      if (res.length > 0) return res;
    }
  }
  return lastLine.replace(/이다\.?$/, '').trim();
}

function extractValueOnly(text) {
    if (!text) return '';
    const clean = text.replace(/\$/g, '').replace(/개다\.?$/, '').replace(/이다\.?$/, '').trim();
    const lastNumMatch = clean.match(/-?\d+(\/\d+)?$/);
    if (lastNumMatch) return lastNumMatch[0];
    const inequalityMatches = clean.match(/x\s*[<>\\ge\\le=]+\s*-?\d+(\/\d+)?/g);
    if (inequalityMatches) return inequalityMatches[inequalityMatches.length - 1];
    return clean.split(' ').pop();
}

function generateInequalityDistractors(ans) {
    const distractors = [];
    if (ans.includes('>') || ans.includes('<') || ans.includes('\\ge') || ans.includes('\\le')) {
        const ops = ['>', '<', '\\geq', '\\leq'];
        ops.forEach(op => {
            if (!ans.includes(op)) distractors.push(ans.replace(/[<>\\ge\\le]+/g, op));
        });
        distractors.push(ans.replace(/(-?\d+)/g, (m) => parseInt(m) + 1));
    } else {
        const num = parseInt(ans);
        if (!isNaN(num)) {
            distractors.push(String(num - 2));
            distractors.push(String(num - 1));
            distractors.push(String(num + 1));
            distractors.push(String(num + 2));
        } else {
            distractors.push(ans + ' + 1');
            distractors.push(ans + ' - 1');
            distractors.push('-' + ans);
            distractors.push('0');
        }
    }
    while(distractors.length < 4) distractors.push(ans + ' ' + distractors.length);
    return distractors.slice(0, 4);
}

const dbKeys = Object.keys(db);

targetUnits.forEach(unit => {
  const dir = `c:/mentos_os_clean/public/math_hints/${unit}`;
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const pid = file.replace('.json', '');
    
    let unitKey = unit;
    if (!dbKeys.some(k => k.startsWith(unit + '/'))) {
        const fuzzy = dbKeys.find(k => k.includes(unit) && k.includes('/'));
        if (fuzzy) unitKey = fuzzy.split('/')[0];
    }

    const pText = db[`${unitKey}/${pid}.webp`];
    const aText = db[`${unitKey}/${pid}a.webp`];
    
    let data;
    try { data = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) { return; }

    let rawAns = aText ? extractFinalAnswer(aText) : "";
    if (!rawAns && data.steps && data.steps.length > 0) {
        const lastStep = data.steps[data.steps.length - 1].latex || data.steps[data.steps.length - 1].content || "";
        if (lastStep.includes('따라서') || lastStep.includes('정답') || lastStep.length < 50) {
            rawAns = lastStep;
        }
    }
    if (!rawAns) rawAns = data.finalAnswer || data.correctAnswer || "";
    rawAns = fixMojibake(rawAns);
    const valueAns = extractValueOnly(rawAns);

    const dbChoices = extractChoices(pText);
    const choiceIdxFromText = extractChoiceIndexFromText(aText || rawAns);

    if (dbChoices.length > 0) {
        data.choices = dbChoices;
        data.answerType = "multiple_choice";
        let found = choiceIdxFromText;
        if (!found) {
            let nSol = normalizeMath(valueAns || rawAns);
            for (let i = 0; i < dbChoices.length; i++) {
                if (normalizeMath(dbChoices[i]) === nSol) { found = i + 1; break; }
            }
        }
        if (found) {
            data.A = String(found);
            data.correctAnswer = String(found);
            data.correctChoiceIndex = found - 1;
        } else if (data.A && !isNaN(parseInt(data.A))) {
            data.correctAnswer = data.A;
            data.correctChoiceIndex = parseInt(data.A) - 1;
        }
    } else if (valueAns && valueAns !== "." && valueAns !== "1") {
        const distracts = generateInequalityDistractors(valueAns);
        const finalChoices = [ distracts[0], distracts[1], valueAns, distracts[2], distracts[3] ];
        data.choices = finalChoices.map(c => c.startsWith('$') ? c : `$${c}$`);
        data.A = "3";
        data.correctAnswer = "3";
        data.answerType = "multiple_choice";
        data.correctChoiceIndex = 2;
    }

    data.finalAnswer = rawAns;

    if (data.steps) {
        const labels = ["P: 문제 이해", "C: 조건 분석", "B: 핵심 개념", "S: 풀이 전략", "A: 최종 정답"];
        data.steps.forEach((s, idx) => {
            if (idx < labels.length) s.label = labels[idx];
            else if (!s.label || !s.label.includes('A:')) s.label = "A: 계산 전개";
        });
        
        data.P = data.steps[0].latex || data.steps[0].content || "";
        data.C = data.steps[1] ? (data.steps[1].latex || data.steps[1].content || "") : "";
        data.B = data.steps[2] ? (data.steps[2].latex || data.steps[2].content || "") : "";
        data.S = data.steps.map(s => `[${s.label}] ` + (s.latex || s.content || "")).join("\n\n");
    }
    
    data.status = "complete";
    data.pcbsa_completed = true;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  });
});
console.log('Inequalities Repair (V6) Complete.');
