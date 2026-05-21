const fs = require('fs');
const path = require('path');

const targetUnits = ['고차방정식2단계', '고차방정식3단계', '고차방정식4단계'];
const dbPath = 'c:/mentos_os_clean/DIAMOND_BOX_G1_2026_05_09/math_problem_texts.json';
const avsMasterPath = 'c:/mentos_os_clean/src/data/avs_answers.json';

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const avsMaster = JSON.parse(fs.readFileSync(avsMasterPath, 'utf8'));

function fixMojibake(str) {
  if (!str) return '';
  return str.replace(/\?는/g, '또는')
            .replace(/\?근/g, '실근')
            .replace(/\?\?/g, '합은')
            .replace(/\?/g, '는')
            .replace(/\?/g, '은');
}

function normalizeMath(str) {
  if (!str) return '';
  let s = str.replace(/\s+/g, '')
            .replace(/\\text\{([^}]*)\}/g, '$1')
            .replace(/\\left|\\right/g, '')
            .replace(/\{/g, '').replace(/\}/g, '')
            .replace(/\$/g, '')
            .replace(/,/g, '')
            .replace(/∴/g, '')
            .replace(/또는|혹은|및|or/g, '|')
            .replace(/\\pm/g, '+-')
            .replace(/x=/g, '')
            .replace(/\\;/g, '')
            .replace(/\\n|\\r|\\t|\n|\r|\t/g, '')
            .toLowerCase();
  
  if (s.includes('=') && !s.includes('|')) {
      s = s.split('=').pop();
  }

  s = s.replace(/[^0-9a-z|+-/\\sqrt()i]/g, '');

  if (s.includes('|')) {
    s = s.split('|').filter(x => x.length > 0).sort().join('|');
  }
  return s;
}

function extractChoices(text) {
  if (!text) return [];
  const choices = [];
  const markers = [/①/g, /②/g, /③/g, /④/g, /⑤/g];
  const positions = [];
  markers.forEach((regex, i) => {
    regex.lastIndex = 0;
    const match = regex.exec(text);
    if (match) positions.push({ index: i + 1, pos: match.index });
  });
  positions.sort((a, b) => a.pos - b.pos);
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].pos + 1;
    const end = positions[i + 1] ? positions[i + 1].pos : text.length;
    choices.push(fixMojibake(text.substring(start, end).trim()));
  }
  return choices;
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

function generateDistractors(ans) {
  const distractors = [];
  distractors.push(ans.replace(/\+/g, '_PLUS_').replace(/-/g, '+').replace(/_PLUS_/g, '-')); 
  distractors.push(ans.replace(/([0-9]+)/g, (m) => parseInt(m) + 1));
  distractors.push(ans.replace(/([0-9]+)/g, (m) => Math.max(0, parseInt(m) - 1)));
  distractors.push(ans.replace(/\\frac/g, '').replace(/\{|\}/g, ''));
  return distractors.slice(0, 4);
}

targetUnits.forEach(unit => {
  const hintsDir = `c:/mentos_os_clean/public/math_hints/${unit}`;
  if (!fs.existsSync(hintsDir)) return;
  const files = fs.readdirSync(hintsDir).filter(f => f.endsWith('.json'));
  const unitMaster = avsMaster[unit] || {};

  files.forEach(file => {
    const filePath = path.join(hintsDir, file);
    const pid = file.replace('.json', '');
    const pidNum = parseInt(pid);
    const pText = db[`${unit}/${pid}.webp`];
    const aText = db[`${unit}/${pid}a.webp`];

    let data;
    try { data = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) { return; }

    let avsAnswer = aText ? extractFinalAnswer(aText) : null;
    if (!avsAnswer && unitMaster[pidNum]) avsAnswer = String(unitMaster[pidNum]);
    if (!avsAnswer && data.finalAnswer) avsAnswer = String(data.finalAnswer);
    if (!avsAnswer && data.correctAnswer) avsAnswer = String(data.correctAnswer);
    
    if (!avsAnswer) return;

    const normAvs = normalizeMath(avsAnswer);
    const dbChoices = extractChoices(pText);

    if (dbChoices.length > 0) {
      let foundChoice = null;
      for (let i = 0; i < dbChoices.length; i++) {
        if (normalizeMath(dbChoices[i]) === normAvs) { foundChoice = i + 1; break; }
      }
      if (!foundChoice) {
        for (let i = 0; i < dbChoices.length; i++) {
          const nc = normalizeMath(dbChoices[i]);
          if (nc.includes(normAvs) || normAvs.includes(nc)) {
            if (normAvs.length === 1 && nc.includes('-' + normAvs) && nc !== ('-' + normAvs)) continue;
            if (Math.abs(nc.length - normAvs.length) < 10) { foundChoice = i + 1; break; }
          }
        }
      }
      if (foundChoice) {
        data.A = String(foundChoice);
        data.correctAnswer = String(foundChoice);
        data.answerType = "multiple_choice";
        data.correctChoiceIndex = foundChoice - 1;
        data.choices = dbChoices;
        data.finalAnswer = avsAnswer;
      }
    } else if (avsAnswer.includes('\\sqrt') || avsAnswer.includes('\\frac') || avsAnswer.includes('i')) {
      const distracts = generateDistractors(avsAnswer);
      data.choices = [ distracts[0], distracts[1], avsAnswer, distracts[2], distracts[3] ];
      data.A = "3";
      data.correctAnswer = "3";
      data.answerType = "multiple_choice";
      data.correctChoiceIndex = 2;
      data.finalAnswer = avsAnswer;
      data.P = "주어진 보기 중 알맞은 값을 고르세요.";
    } else {
      data.A = avsAnswer;
      data.correctAnswer = avsAnswer;
      data.answerType = "short_answer";
      data.finalAnswer = avsAnswer;
    }

    if (unit === '고차방정식2단계' && pid === '011') {
        data.A = "1";
        data.correctAnswer = "1";
        data.finalAnswer = "1";
        data.answerType = "short_answer";
    }

    const rawSteps = data.steps || data.overlay_steps || [];
    if (rawSteps.length > 0) {
      data.S = rawSteps.map(s => s.latex || s.content || s.text || "").join("\n\n");
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  });
});

console.log('Final comprehensive repair for Higher-degree Equations complete.');
