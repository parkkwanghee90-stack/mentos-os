const fs = require('fs');
const path = require('path');

const backupDir = 'C:\\mentos_os_clean\\backups\\20260505_full_math_curriculum\\public\\math_crops\\(5)수학1 중간\\2단계';
const targetDir = 'C:\\mentos_os_clean\\public\\math_crops';

const mapping = {
  '귀납적정의2단계': 'induction_def_step2',
  '등차등비2단계': 'seq_apgp_step2',
  '로그2단계': 'log_step2',
  '로그함수2단계': 'log_func_step2',
  '삼각함수그래프2단계': 'trig_graph_step2',
  '삼각함수성질2단계': 'trig_prop_step2',
  '삼각함수활용2단계': 'trig_apply_step2',
  '시그마용법2단계': 'sigma_step2',
  '지수2단계': 'exp_step2',
  '지수함수2단계': 'exponent_step2'
};

let count = 0;

for (const korName of Object.keys(mapping)) {
    const engName = mapping[korName];
    const sourceFolder = path.join(backupDir, korName);
    const destFolder = path.join(targetDir, engName);
    
    if (fs.existsSync(sourceFolder)) {
        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
        }
        
        const files = fs.readdirSync(sourceFolder);
        for (const file of files) {
            if (file.endsWith('.webp')) {
                const srcPath = path.join(sourceFolder, file);
                const destPath = path.join(destFolder, file);
                fs.copyFileSync(srcPath, destPath);
                count++;
            }
        }
        console.log(`Copied images for ${korName} -> ${engName}`);
    } else {
        console.log(`Source not found: ${sourceFolder}`);
    }
}

console.log(`Total ${count} images copied from backup to public/math_crops`);
