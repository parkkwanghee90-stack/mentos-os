const fs = require('fs');
const path = require('path');

const publicHintsDir = 'C:\\mentos_os_clean\\public\\math_hints';
const publicCropsDir = 'C:\\mentos_os_clean\\public\\math_crops';

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

// 1x1 transparent PNG base64
const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
const dummyWebp = Buffer.from('UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==', 'base64');

function finalizeData() {
  if (!fs.existsSync(publicCropsDir)) {
    fs.mkdirSync(publicCropsDir, { recursive: true });
  }

  const items = fs.readdirSync(publicHintsDir);
  for (const folder of items) {
    const fullPath = path.join(publicHintsDir, folder);
    if (!fs.statSync(fullPath).isDirectory()) continue;

    // Is it a Korean folder that needs mapping?
    const englishName = unitToEnglish[folder];
    let finalHintDir = fullPath;
    let finalFolderName = folder;

    if (englishName) {
      finalHintDir = path.join(publicHintsDir, englishName);
      finalFolderName = englishName;
      if (!fs.existsSync(finalHintDir)) {
        // rename folder to english
        fs.renameSync(fullPath, finalHintDir);
        console.log(`Renamed hint folder: ${folder} -> ${englishName}`);
      } else if (fullPath !== finalHintDir) {
        // copy contents if it already exists
        const files = fs.readdirSync(fullPath);
        for(const f of files) fs.copyFileSync(path.join(fullPath, f), path.join(finalHintDir, f));
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`Merged hint folder: ${folder} -> ${englishName}`);
      }
    }

    // Now populate math_crops
    const cropDir = path.join(publicCropsDir, finalFolderName);
    if (!fs.existsSync(cropDir)) {
      fs.mkdirSync(cropDir, { recursive: true });
    }

    const files = fs.readdirSync(finalHintDir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const baseName = f.replace('.json', '');
      const pngPath = path.join(cropDir, `${baseName}.png`);
      const webpPath = path.join(cropDir, `${baseName}.webp`);

      if (!fs.existsSync(pngPath)) {
        fs.writeFileSync(pngPath, dummyPng);
      }
      if (!fs.existsSync(webpPath)) {
        fs.writeFileSync(webpPath, dummyWebp);
      }
    }
    console.log(`Populated missing crops for ${finalFolderName} (${files.length} items)`);
  }
}

finalizeData();
