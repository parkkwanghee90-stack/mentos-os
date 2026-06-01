const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydnFncXZ3aHF2bGdxemxzeGJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY1NzA1MywiZXhwIjoyMDk0MjMzMDUzfQ.a76V1LYSItB48fXQN2in-rXfy8oD4o7KJteAMCyX9so';
const BUCKET = 'mentos-assets';

const unitToEnglish = {
  // Math Sang
  '고차방정식2단계': 'higher_order_eqstep2',
  '고차방정식3단계': 'higher_order_eqstep3',
  '고차방정식4단계': 'higher_order_eqstep4',
  '일차부등식2단계': 'linear_ineq_step2',
  '일차부등식3단계': 'linear_ineq_step3',
  '일차부등식4단계': 'linear_ineq_step4',
  '이차부등식2단계': 'quadratic_ineq_step2',
  '이차부등식3단계': 'quadratic_ineq_step3',
  '이차부등식4단계': 'quadratic_ineq_step4',
  '경우의수2단계': 'cases_step2',
  '경우의수3단계': 'cases_step3',
  '경우의수4단계': 'cases_step4',
  'cases_step2': 'cases_step2',
  'cases_step3': 'cases_step3',
  'cases_step4': 'cases_step4',
  '점과좌표2단계': 'point_coord_step2',
  '점과좌표3단계': 'point_coord_step3',
  '점과좌표4단계': 'point_coord_step4',
  '직선의방정식2단계': 'line_eq_step2',
  '직선의방정식3단계': 'line_eq_step3',
  '직선의방정식4단계': 'line_eq_step4',
  '원의방정식2단계': 'circle_eq_step2',
  '원의방정식3단계': 'circle_eq_step3',
  '원의방정식4단계': 'circle_eq_step4',
  '도형의이동2단계': 'shape_move_step2',
  '도형의이동3단계': 'shape_move_step3',
  '도형의이동4단계': 'shape_move_step4',
  '행렬2단계': 'matrix_step2',
  '행렬3단계': 'matrix_step3',
  '행렬4단계': 'matrix_step4',
  
  // Math 1
  '지수2단계': 'exp_step2',
  '지수3단계': 'exp_step3',
  '지수4단계': 'exp_step4',
  '지수로그4단계': 'explog_step4',
  '지수함수2단계': 'exp_func_step2',
  '지수함수3단계': 'exp_func_step3',
  '지수함수4단계': 'exp_func_step4',
  '지수로그함수4단계': 'explog_func_step4',
  '로그2단계': 'log_step2',
  '로그3단계': 'log_step3',
  '로그4단계': 'log_step4',
  '로그함수2단계': 'log_func_step2',
  '로그함수3단계': 'log_func_step3',
  '로그함수4단계': 'log_func_step4',
  '삼각함수3단계': 'trig_step3',
  '삼각함수그래프': 'trig_graph',
  '삼각함수그래프2단계': 'trig_graph_step2',
  '삼각함수그래프3단계': 'trig_graph_step3',
  '삼각함수그래프4단계': 'trig_graph_step4',
  '삼각함수성질2단계': 'trig_prop_step2',
  '삼각함수활용2단계': 'trig_util_step2',
  '삼각함수활용3단계': 'trig_util_step3',
  '삼각함수활용 4단계(68)': 'trig_util_step4',
  '등차등비2단계': 'seq_apgp_step2',
  '등차등비3단계': 'seq_apgp_step3',
  '등차등비수열4단계': 'seq_apgp_step4',
  '시그마용법2단계': 'sigma_step2',
  '여러가지수열3단계': 'seq_misc_step3',
  '수열의합4단계': 'seq_sum_step4',
  '귀납적정의2단계': 'induction_def_step2',
  '수학적귀납법3단계': 'induction_step3',
  '수학적귀납법4단계': 'induction_step4',
};

function getHintFolder(unitName) {
  if (!unitName) return null;
  const clean = unitName.replace(/\s+/g, '');
  const stepMatch = clean.match(/(2|3|4)단계/);
  const stepStr = stepMatch ? stepMatch[0] : '2단계';
  const stepNum = stepMatch ? stepMatch[1] : '2';

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
  if (clean.includes('지수4단계')) return '지수4단계';
  if (clean.includes('지수로그4단계')) return '지수로그4단계';
  if (clean.includes('지수로그함수4단계')) return '지수로그함수4단계';
  if (clean.includes('로그2단계')) return '로그2단계';
  if (clean.includes('로그3단계')) return '로그3단계';
  if (clean.includes('로그4단계')) return '로그4단계';
  if (clean.includes('삼각함수3단계')) return '삼각함수3단계';
  return unitName; // default fallback
}

async function uploadFile(localAbsPath, remotePath) {
  const fileBuffer = fs.readFileSync(localAbsPath);
  
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${remotePath}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'x-upsert': 'true',
    },
    body: fileBuffer,
  });

  if (res.ok) {
    console.log(`  ✅ ${remotePath}`);
    return true;
  } else {
    const errText = await res.text();
    console.log(`  ❌ ${remotePath} → ${res.status}: ${errText.substring(0, 150)}`);
    return false;
  }
}

async function scanAndUpload(baseDir) {
  if (!fs.existsSync(baseDir)) return;
  const items = fs.readdirSync(baseDir);
  let totalUploaded = 0;

  for (const item of items) {
    const fullPath = path.join(baseDir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      const mappedFolder = getHintFolder(item);
      const englishFolder = unitToEnglish[mappedFolder];
      if (!englishFolder) continue; // Only process mapped

      console.log(`\n📂 Processing local: ${item} -> remote: math_hints/${englishFolder}`);
      const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.json'));
      for (const f of files) {
        if (!/^\d{3}[a-z]?\.json$/.test(f)) continue;

        const localPath = path.join(fullPath, f);
        const remotePath = `math_hints/${englishFolder}/${f}`;
        const res = await uploadFile(localPath, remotePath);
        if (res) totalUploaded++;
      }
    }
  }
  return totalUploaded;
}

async function main() {
  console.log('--- Uploading Math (Sang) and Math 1 Hints ---');
  let count = 0;
  count += await scanAndUpload('C:\\mentos_os_clean\\public\\math_hints');
  count += await scanAndUpload('C:\\mentos_os_clean\\assets_backup\\math_hints_backup_su1');
  console.log(`\nTotal uploaded: ${count}`);
}

main().catch(console.error);
