const fs = require('fs');
const path = require('path');

const baseDir = 'c:/mentos_os_clean/public/math_hints';
const avsSource = JSON.parse(fs.readFileSync('c:/mentos_os_clean/src/data/math1_avs_answers.json', 'utf8'));

const targetFolders = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());

let stats = {
  total: 0,
  patchedWithFinal: 0,
  patchedWithAVS: 0,
  patchedWithSelf: 0,
  noAnswer: 0
};

function normalizeAnswer(ans) {
  if (!ans) return null;
  ans = String(ans).trim();
  const circleMap = {'①':'1','②':'2','③':'3','④':'4','⑤':'5'};
  if (circleMap[ans]) return circleMap[ans];
  
  const numMatch = ans.match(/(?:정답은|답은|결과는|따라서|정답)\s*[:=]?\s*([0-9./\\]+)/i);
  if (numMatch) return numMatch[1];
  
  return ans;
}

targetFolders.forEach(folder => {
  const dir = path.join(baseDir, folder);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  
  const avsUnit = avsSource[folder] || avsSource[folder.replace(/\s+/g, '')];

  files.forEach(file => {
    stats.total++;
    const filePath = path.join(dir, file);
    const pidKey = file.replace('.json', '');
    
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let answer = null;
      let source = '';

      // 1. Highest Priority: final_answer in the file (most reliable for restored su1 hints)
      if (data.final_answer) {
        answer = normalizeAnswer(data.final_answer);
        if (answer) source = 'Final';
      }

      // 2. Second Priority: Authoritative AVS source from DIAMOND_BOX
      if (!answer && avsUnit && avsUnit[pidKey]) {
        answer = avsUnit[pidKey];
        source = 'AVS';
      }

      // 3. Fallback: Self extraction from A field or steps
      if (!answer) {
        if (data.A) answer = normalizeAnswer(data.A);
        if (!answer && data.steps) {
            const lastStep = data.steps[data.steps.length - 1];
            answer = normalizeAnswer(lastStep.content || lastStep.latex || '');
        }
        if (!answer && data.overlay_steps) {
            const lastStep = data.overlay_steps[data.overlay_steps.length - 1];
            answer = normalizeAnswer(lastStep.latex || lastStep.label_text || '');
        }
        if (answer) source = 'Self';
      }

      if (answer) {
        // Standardize format
        if (data.steps && !data.S) {
            data.P = data.steps.find(s => s.phase === 'P')?.content || data.P || '주어진 문제의 정답을 구하세요.';
            data.C = data.steps.find(s => s.phase === 'C')?.content || '';
            data.B = data.steps.find(s => s.phase === 'B')?.content || '';
            data.S = data.steps.find(s => s.phase === 'S')?.content || '';
        }
        
        data.A = answer;
        if (!data.P) data.P = '주어진 문제의 정답을 구하세요.';

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        if (source === 'Final') stats.patchedWithFinal++;
        else if (source === 'AVS') stats.patchedWithAVS++;
        else stats.patchedWithSelf++;
      } else {
        stats.noAnswer++;
      }
    } catch (e) {}
  });
});

console.log('\n=== Final Patch Summary (Prioritized Final) ===');
console.log(`Total Files: ${stats.total}`);
console.log(`Patched with Final: ${stats.patchedWithFinal}`);
console.log(`Patched with AVS: ${stats.patchedWithAVS}`);
console.log(`Patched with Self: ${stats.patchedWithSelf}`);
console.log(`Still No Answer: ${stats.noAnswer}`);
