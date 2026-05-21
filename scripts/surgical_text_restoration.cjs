const fs = require('fs');
const path = require('path');

const units = [
    '행렬2단계', '행렬3단계', '행렬4단계',
    '고차방정식2단계', '고차방정식3단계', '고차방정식4단계'
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
            // Just copy if target doesn't exist
            fs.copyFileSync(backupPath, targetPath);
            return;
        }

        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        const targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

        // Restore clean text fields from backup
        if (backupData.steps) targetData.steps = backupData.steps;
        if (backupData.P) targetData.P = backupData.P;
        if (backupData.C) targetData.C = backupData.C;
        if (backupData.B) targetData.B = backupData.B;
        if (backupData.S) targetData.S = backupData.S;
        if (backupData.A && !targetData.A.includes('①')) targetData.A = backupData.A; // Keep circle if target has it
        
        // Ensure steps have proper labels if backup has them
        if (targetData.steps) {
            targetData.steps.forEach((step, i) => {
                if (backupData.steps && backupData.steps[i]) {
                    step.label = backupData.steps[i].label || step.label;
                    step.label_text = backupData.steps[i].label_text || step.label_text;
                }
            });
        }

        // Standardize metadata
        targetData.status = 'complete';
        targetData.pcbsa_completed = true;

        fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2), 'utf8');
    });
});
console.log('Surgical text restoration complete.');
