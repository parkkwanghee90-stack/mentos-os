const fs = require('fs');
const path = require('path');

const units = [
    '일차부등식2단계', '일차부등식3단계', '일차부등식4단계',
    '이차부등식2단계', '이차부등식3단계', '이차부등식4단계'
];

const backupBase = 'DIAMOND_BOX_G1_2026_05_09/math_hints';
const targetBase = 'public/math_hints';

units.forEach(unit => {
    const backupDir = path.join(backupBase, unit);
    const targetDir = path.join(targetBase, unit);
    if (!fs.existsSync(backupDir)) return;
    
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
    console.log(`Surgically restoring ${unit}...`);

    files.forEach(file => {
        const backupPath = path.join(backupDir, file);
        const targetPath = path.join(targetDir, file);
        
        if (!fs.existsSync(targetPath)) {
            fs.copyFileSync(backupPath, targetPath);
            return;
        }

        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        const targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

        // Restore clean text fields
        if (backupData.steps) targetData.steps = backupData.steps;
        if (backupData.P) targetData.P = backupData.P;
        if (backupData.C) targetData.C = backupData.C;
        if (backupData.B) targetData.B = backupData.B;
        if (backupData.S) targetData.S = backupData.S;
        
        // Ensure overlay_steps are also restored if they exist in backup
        if (backupData.overlay_steps) targetData.overlay_steps = backupData.overlay_steps;

        // Metadata standardization
        targetData.status = 'complete';
        targetData.pcbsa_completed = true;

        fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2), 'utf8');
    });
});
console.log('Inequality surgical text restoration complete.');
