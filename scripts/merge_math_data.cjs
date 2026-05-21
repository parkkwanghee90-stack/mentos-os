const fs = require('fs');
const path = require('path');

const publicHintsDir = 'C:\\mentos_os_clean\\public\\math_hints';
const backupHintsDir = 'C:\\mentos_os_clean\\assets_backup\\math_hints_backup_su1';
const dataDir = 'C:\\mentos_os_clean\\assets_backup\\data'; // where answers_master.json is, wait, we need to update public/data as well if it exists.
const answersMasterPath = path.join(dataDir, 'answers_master.json');
const avsAnswersPath = path.join(dataDir, 'avs_answers.json');

function getHintFolder(unitName) {
  if (!unitName) return null;
  const clean = unitName.replace(/\s+/g, '');
  const stepMatch = clean.match(/(2|3|4)단계/);
  const stepStr = stepMatch ? stepMatch[0] : '2단계';
  
  if (clean.includes('삼각함수') && clean.includes('활용')) return stepStr === '4단계' ? '삼각함수활용 4단계(68)' : `삼각함수활용${stepStr}`;
  if (clean.includes('삼각함수') && clean.includes('그래프')) return stepStr === '4단계' ? '삼각함수그래프' : `삼각함수그래프${stepStr}`;
  if (clean.includes('삼각함수') && (clean.includes('정의') || clean.includes('성질'))) return stepStr !== '2단계' ? `삼각함수${stepStr}` : `삼각함수성질${stepStr}`;
  if (clean.includes('등차') || clean.includes('등비')) return stepStr === '4단계' ? '등차등비수열4단계' : `등차등비${stepStr}`;
  if (clean.includes('시그마')) { if (stepStr === '3단계') return '여러가지수열3단계'; if (stepStr === '4단계') return '수열의합4단계'; return `시그마용법${stepStr}`; }
  if (clean.includes('귀납적')) return stepStr === '2단계' ? '귀납적정의2단계' : `수학적귀납법${stepStr}`;
  if (clean.includes('지수함수')) return `지수함수${stepStr}`;
  if (clean.includes('로그함수')) return `로그함수${stepStr}`;
  if (clean.includes('행렬')) return `행렬${stepStr}`;
  if (clean.includes('고차방정식')) return `고차방정식${stepStr}`;
  if (clean.includes('일차부등식')) return `일차부등식${stepStr}`;
  if (clean.includes('이차부등식')) return `이차부등식${stepStr}`;
  if (clean.includes('경우의수')) return `경우의수${stepStr}`;
  if (clean.includes('점과좌표')) return `점과좌표${stepStr}`;
  if (clean.includes('직선의방정식')) return `직선의방정식${stepStr}`;
  if (clean.includes('원의방정식')) return `원의방정식${stepStr}`;
  if (clean.includes('도형의이동')) return `도형의이동${stepStr}`;
  if (clean.includes('지수2단계')) return '지수2단계';
  if (clean.includes('지수3단계')) return '지수3단계';
  if (clean.includes('지수로그4단계')) return '지수로그4단계';
  if (clean.includes('지수로그함수4단계')) return '지수로그함수4단계';
  if (clean.includes('로그2단계')) return '로그2단계';
  if (clean.includes('로그3단계')) return '로그3단계';
  if (clean.includes('삼각함수3단계')) return '삼각함수3단계';
  return unitName;
}

function processDirectory(baseDir, answersMap, avsMap) {
  if (!fs.existsSync(baseDir)) return;
  const items = fs.readdirSync(baseDir);
  for (const item of items) {
    const fullPath = path.join(baseDir, item);
    if (!fs.statSync(fullPath).isDirectory()) continue;
    
    const mapped = getHintFolder(item);
    if (!mapped || mapped === item && !mapped.includes('단계')) continue; // Skip unmapped or weird names unless already clean
    
    const targetDir = path.join(publicHintsDir, mapped);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`Created directory: ${targetDir}`);
    }

    const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.json'));
    for (const f of files) {
      if (!/^\d{3}[a-z]?\.json$/.test(f)) continue;
      
      const localFile = path.join(fullPath, f);
      const targetFile = path.join(targetDir, f);
      
      // Copy file
      fs.copyFileSync(localFile, targetFile);
      
      // Read content for answers
      try {
        const content = JSON.parse(fs.readFileSync(localFile, 'utf-8'));
        const ans = content.correctAnswer || content.answer || content.finalAnswer || content.final_answer;
        const problemNum = parseInt(f.replace('.json', ''), 10);
        
        if (ans) {
          // Add to answers_master
          // answers_master format: { unit: string, stage: number, problem: number, answer: string, type: string }
          let unitName = mapped.replace(/2단계|3단계|4단계/, '');
          let stage = 2;
          if (mapped.includes('3단계')) stage = 3;
          if (mapped.includes('4단계')) stage = 4;
          
          const existing = answersMap.find(a => a.unit === unitName && a.stage === stage && a.problem === problemNum);
          if (!existing) {
            answersMap.push({
              unit: unitName,
              stage: stage,
              problem: problemNum,
              answer: String(ans),
              type: "multiple_choice" // default
            });
          }
          
          // Add to avs_answers
          if (!avsMap[mapped]) avsMap[mapped] = {};
          avsMap[mapped][problemNum] = {
            ans: String(ans),
            avs_id: mapped + '_' + problemNum
          };
        }
      } catch (e) {}
    }
  }
}

async function main() {
  let answersMaster = [];
  if (fs.existsSync(answersMasterPath)) {
    answersMaster = JSON.parse(fs.readFileSync(answersMasterPath, 'utf-8'));
  }
  let avsAnswers = {};
  if (fs.existsSync(avsAnswersPath)) {
    avsAnswers = JSON.parse(fs.readFileSync(avsAnswersPath, 'utf-8'));
  }

  processDirectory('C:\\mentos_os_clean\\public\\math_hints', answersMaster, avsAnswers);
  processDirectory('C:\\mentos_os_clean\\assets_backup\\math_hints_backup_su1', answersMaster, avsAnswers);

  fs.writeFileSync(answersMasterPath, JSON.stringify(answersMaster, null, 2));
  fs.writeFileSync(avsAnswersPath, JSON.stringify(avsAnswers, null, 2));
  
  // Also copy to DIAMOND_BOX_4 just in case
  const db4Master = 'C:\\mentos_os_clean\\DIAMOND_BOX_4\\answers_master.json';
  const db4Avs = 'C:\\mentos_os_clean\\DIAMOND_BOX_4\\avs_answers.json';
  fs.writeFileSync(db4Master, JSON.stringify(answersMaster, null, 2));
  fs.writeFileSync(db4Avs, JSON.stringify(avsAnswers, null, 2));

  console.log('Finished copying hints and extracting answers.');
}

main().catch(console.error);
