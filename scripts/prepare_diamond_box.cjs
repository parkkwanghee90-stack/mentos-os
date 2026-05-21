const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydnFncXZ3aHF2bGdxemxzeGJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY1NzA1MywiZXhwIjoyMDk0MjMzMDUzfQ.a76V1LYSItB48fXQN2in-rXfy8oD4o7KJteAMCyX9so';
const BUCKET = 'mentos-assets';

const unitToEnglish = {
  '고차방정식2단계': 'higher_order_eqstep2', '고차방정식3단계': 'higher_order_eqstep3', '고차방정식4단계': 'higher_order_eqstep4',
  '일차부등식2단계': 'linear_ineq_step2', '일차부등식3단계': 'linear_ineq_step3', '일차부등식4단계': 'linear_ineq_step4',
  '이차부등식2단계': 'quadratic_ineq_step2', '이차부등식3단계': 'quadratic_ineq_step3', '이차부등식4단계': 'quadratic_ineq_step4',
  '경우의수2단계': 'cases_step2', '경우의수3단계': 'cases_step3', '경우의수4단계': 'cases_step4',
  '점과좌표2단계': 'point_coord_step2', '점과좌표3단계': 'point_coord_step3', '점과좌표4단계': 'point_coord_step4',
  '직선의방정식2단계': 'line_eq_step2', '직선의방정식3단계': 'line_eq_step3', '직선의방정식4단계': 'line_eq_step4',
  '원의방정식2단계': 'circle_eq_step2', '원의방정식3단계': 'circle_eq_step3', '원의방정식4단계': 'circle_eq_step4',
  '도형의이동2단계': 'shape_move_step2', '도형의이동3단계': 'shape_move_step3', '도형의이동4단계': 'shape_move_step4',
  '행렬2단계': 'matrix_step2', '행렬3단계': 'matrix_step3', '행렬4단계': 'matrix_step4',
  '지수2단계': 'exp_step2', '지수3단계': 'exp_step3', '지수4단계': 'exp_step4', '지수로그4단계': 'explog_step4',
  '지수함수2단계': 'exp_func_step2', '지수함수3단계': 'exp_func_step3', '지수함수4단계': 'exp_func_step4', '지수로그함수4단계': 'explog_func_step4',
  '로그2단계': 'log_step2', '로그3단계': 'log_step3', '로그4단계': 'log_step4',
  '로그함수2단계': 'log_func_step2', '로그함수3단계': 'log_func_step3', '로그함수4단계': 'log_func_step4',
  '삼각함수3단계': 'trig_step3', '삼각함수그래프': 'trig_graph', '삼각함수그래프2단계': 'trig_graph_step2', '삼각함수그래프3단계': 'trig_graph_step3', '삼각함수그래프4단계': 'trig_graph_step4',
  '삼각함수성질2단계': 'trig_prop_step2', '삼각함수활용2단계': 'trig_util_step2', '삼각함수활용3단계': 'trig_util_step3', '삼각함수활용 4단계(68)': 'trig_util_step4',
  '등차등비2단계': 'seq_apgp_step2', '등차등비3단계': 'seq_apgp_step3', '등차등비수열4단계': 'seq_apgp_step4',
  '시그마용법2단계': 'sigma_step2', '여러가지수열3단계': 'seq_misc_step3', '수열의합4단계': 'seq_sum_step4',
  '귀납적정의2단계': 'induction_def_step2', '수학적귀납법3단계': 'induction_step3', '수학적귀납법4단계': 'induction_step4',
};

function getEnglishName(key) {
  if (!key) return null;
  const clean = key.replace(/\s+/g, '');
  const stepMatch = clean.match(/(2|3|4)단계/);
  const stepStr = stepMatch ? stepMatch[0] : '2단계';
  
  if (clean.includes('삼각함수') && clean.includes('활용')) return stepStr === '4단계' ? 'trig_util_step4' : `trig_util_step${stepStr[0]}`;
  if (clean.includes('삼각함수') && clean.includes('그래프')) return stepStr === '4단계' ? 'trig_graph' : `trig_graph_step${stepStr[0]}`;
  if (clean.includes('삼각함수') && (clean.includes('정의') || clean.includes('성질'))) return stepStr !== '2단계' ? `trig_step${stepStr[0]}` : `trig_prop_step2`;
  if (clean.includes('등차') || clean.includes('등비')) return stepStr === '4단계' ? 'seq_apgp_step4' : `seq_apgp_step${stepStr[0]}`;
  if (clean.includes('시그마')) { if (stepStr === '3단계') return 'seq_misc_step3'; if (stepStr === '4단계') return 'seq_sum_step4'; return `sigma_step${stepStr[0]}`; }
  if (clean.includes('귀납적')) return stepStr === '2단계' ? 'induction_def_step2' : `induction_step${stepStr[0]}`;
  if (clean.includes('지수함수')) return `exp_func_step${stepStr[0]}`;
  if (clean.includes('로그함수')) return `log_func_step${stepStr[0]}`;
  if (clean.includes('행렬')) return `matrix_step${stepStr[0]}`;
  if (clean.includes('고차방정식')) return `higher_order_eqstep${stepStr[0]}`;
  if (clean.includes('일차부등식')) return `linear_ineq_step${stepStr[0]}`;
  if (clean.includes('이차부등식')) return `quadratic_ineq_step${stepStr[0]}`;
  if (clean.includes('경우의수')) return `cases_step${stepStr[0]}`;
  if (clean.includes('점과좌표')) return `point_coord_step${stepStr[0]}`;
  if (clean.includes('직선의방정식')) return `line_eq_step${stepStr[0]}`;
  if (clean.includes('원의방정식')) return `circle_eq_step${stepStr[0]}`;
  if (clean.includes('도형의이동')) return `shape_move_step${stepStr[0]}`;
  if (clean.includes('지수2단계')) return 'exp_step2';
  if (clean.includes('지수3단계')) return 'exp_step3';
  if (clean.includes('지수로그4단계')) return 'explog_step4';
  if (clean.includes('지수로그함수4단계')) return 'explog_func_step4';
  if (clean.includes('로그2단계')) return 'log_step2';
  if (clean.includes('로그3단계')) return 'log_step3';
  if (clean.includes('삼각함수3단계')) return 'trig_step3';

  return null;
}

async function uploadFile(remotePath, dataObj) {
  const fileBuffer = JSON.stringify(dataObj);
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${remotePath}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', 'x-upsert': 'true' },
    body: fileBuffer,
  });
  if (res.ok) console.log(`✅ Uploaded ${remotePath}`);
  else console.log(`❌ Failed to upload ${remotePath}: ${res.statusText}`);
}

async function main() {
  console.log('Loading DIAMOND_BOX_4 data...');
  const texts = JSON.parse(fs.readFileSync('C:\\mentos_os_clean\\DIAMOND_BOX_4\\math_problem_texts.json', 'utf8'));
  const master = JSON.parse(fs.readFileSync('C:\\mentos_os_clean\\DIAMOND_BOX_4\\answers_master.json', 'utf8'));
  const avs = JSON.parse(fs.readFileSync('C:\\mentos_os_clean\\DIAMOND_BOX_4\\avs_answers.json', 'utf8'));

  const newTexts = { ...texts }; // Keep originals just in case
  const newMaster = [];
  const newAvs = { ...avs }; // Keep originals just in case

  // Map texts
  for (const key of Object.keys(texts)) {
    const parts = key.split('/');
    if (parts.length > 1) {
      const eng = getEnglishName(parts[0]);
      if (eng) {
        newTexts[`${eng}/${parts[1]}`] = texts[key];
        newTexts[`${eng}/${parts[1].replace('.webp', '.png')}`] = texts[key];
      }
    }
  }

  // Map master
  if (Array.isArray(master)) {
    for (const item of master) {
      newMaster.push(item);
      const eng = getEnglishName(item.unit);
      if (eng && eng !== item.unit) {
        newMaster.push({ ...item, unit: eng });
      }
    }
  }

  // Map AVS
  for (const key of Object.keys(avs)) {
    const eng = getEnglishName(key);
    if (eng && eng !== key) {
      newAvs[eng] = avs[key];
    }
  }

  console.log('Merging missing Sequences (수열) from assets_backup...');
  const backupDir = 'C:\\mentos_os_clean\\assets_backup\\math_hints_backup_su1';
  if (fs.existsSync(backupDir)) {
    const seqUnits = ['등차등비2단계', '등차등비3단계', '등차등비수열4단계', '시그마용법2단계', '여러가지수열3단계', '수열의합4단계', '귀납적정의2단계', '수학적귀납법3단계', '수학적귀납법4단계'];
    for (const unit of seqUnits) {
      const eng = unitToEnglish[unit];
      if (!eng) continue;
      if (!newAvs[eng]) newAvs[eng] = {};
      
      const fullPath = path.join(backupDir, unit);
      if (!fs.existsSync(fullPath)) continue;
      const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.json'));
      for (const f of files) {
        try {
          const content = JSON.parse(fs.readFileSync(path.join(fullPath, f), 'utf8'));
          const pNum = parseInt(f.replace('.json', ''), 10);
          const baseName = f.replace('.json', '');
          
          // Add Text
          if (content.problem_render && content.problem_render.body) {
            let body = content.problem_render.body;
            if (content.problem_render.choices && Array.isArray(content.problem_render.choices)) {
              body += '\n\n' + content.problem_render.choices.join('\n');
            }
            newTexts[`${eng}/${baseName}.png`] = body;
            newTexts[`${eng}/${baseName}.webp`] = body;
          }

          // Add Answer to Master & AVS
          const rawAnswer = content.A || content.answer || content.correctAnswer || content.finalAnswer || (content.problem_render && content.problem_render.answer);
          if (rawAnswer) {
            newMaster.push({ unit: eng, stage: content.stage || 2, problem: pNum, answer: rawAnswer, type: 'subjective' });
            newAvs[eng][pNum.toString()] = {
              correctAnswer: rawAnswer,
              final_answer: rawAnswer,
              hasHint: true
            };
          }
        } catch(e) {}
      }
    }
  }

  console.log('Uploading final unified English-mapped data to Supabase...');
  await uploadFile('data/math_problem_texts.json', newTexts);
  await uploadFile('data/answers_master.json', newMaster);
  await uploadFile('data/avs_answers.json', newAvs);
}

main().catch(console.error);
