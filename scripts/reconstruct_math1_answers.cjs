const fs = require('fs');
const path = require('path');

const baseDir = 'c:/mentos_os_clean/public/math_hints';
const targetFolders = [
  '지수2단계', '지수3단계', '지수4단계',
  '로그2단계', '로그3단계', '로그4단계',
  '지수함수2단계', '지수함수3단계', '지수함수4단계',
  '로그함수2단계', '로그함수3단계', '로그함수4단계',
  '지수로그4단계',
  '삼각함수활용2단계', '삼각함수활용3단계', '삼각함수활용 4단계(68)',
  '삼각함수성질2단계', '삼각함수3단계',
  '삼각함수그래프2단계', '삼각함수그래프3단계', '삼각함수그래프4단계',
  '등차등비2단계', '등차등비3단계', '등차등비수열4단계',
  '시그마용법2단계', '여러가지수열3단계', '수열의합4단계',
  '귀납적정의2단계', '수학적귀납법3단계', '수학적귀납법4단계'
];

let stats = {
  total: 0,
  patched: 0,
  errors: 0
};

function normalizeAnswer(ans) {
  if (!ans) return null;
  ans = String(ans).trim();
  // Extract number or choice
  const circleMap = {'①':'1','②':'2','③':'3','④':'4','⑤':'5'};
  const circleMatch = ans.match(/[①②③④⑤]/);
  if (circleMatch) return circleMap[circleMatch[0]];
  
  const numMatch = ans.match(/(?:정답은|답은|따라서|결과는|정답|답)\s*[:=]?\s*([0-9./-]+)/i);
  if (numMatch) return numMatch[1];
  
  const lastNumMatch = ans.match(/([0-9./-]+)\s*(?:입니다|이다|임|됨)?\.?\s*$/);
  if (lastNumMatch) return lastNumMatch[1];

  return ans;
}

function processFolder(folder) {
  const dir = path.join(baseDir, folder);
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  console.log(`Processing ${folder} (${files.length} files)...`);

  files.forEach(file => {
    stats.total++;
    const filePath = path.join(dir, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let answer = null;

      // 1. Check root A
      if (data.A) {
        answer = normalizeAnswer(data.A);
      }
      
      // 2. Check final_answer
      if (!answer && data.final_answer) {
        answer = normalizeAnswer(data.final_answer);
      }

      // 3. Extract from steps (old format)
      if (!answer && data.steps) {
        const aStep = data.steps.find(s => s.phase === 'A' || s.title?.includes('정답'));
        if (aStep) {
          answer = normalizeAnswer(aStep.content || aStep.latex || '');
        } else {
          const lastStep = data.steps[data.steps.length - 1];
          answer = normalizeAnswer(lastStep.content || lastStep.latex || '');
        }
      }

      // 4. Extract from overlay_steps (new format)
      if (!answer && data.overlay_steps) {
        const lastStep = data.overlay_steps[data.overlay_steps.length - 1];
        answer = normalizeAnswer(lastStep.latex || lastStep.label_text || '');
      }

      // If we found an answer, patch it
      if (answer) {
        // Convert old format to new root-level format if needed
        if (data.steps && !data.S) {
          data.P = data.steps.find(s => s.phase === 'P')?.content || '';
          data.C = data.steps.find(s => s.phase === 'C')?.content || '';
          data.B = data.steps.find(s => s.phase === 'B')?.content || '';
          data.S = data.steps.find(s => s.phase === 'S')?.content || '';
          // Clean up P, C, B, S if they have "단계" etc.
          if (data.S && data.steps.find(s => s.phase === 'S')?.title) {
            // keep it as is
          }
        }

        data.A = answer; // Store clean answer in root A
        
        // Ensure P exists
        if (!data.P) {
          data.P = "주어진 문제의 정답을 구하세요.";
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        stats.patched++;
      }
    } catch (e) {
      console.error(`Error in ${folder}/${file}: ${e.message}`);
      stats.errors++;
    }
  });
}

targetFolders.forEach(processFolder);

console.log(`\n=== Reconstruct Summary ===`);
console.log(`Total: ${stats.total}`);
console.log(`Patched: ${stats.patched}`);
console.log(`Errors: ${stats.errors}`);
