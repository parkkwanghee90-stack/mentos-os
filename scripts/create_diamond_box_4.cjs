const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const backupDir = path.join('c:', 'mentos_os_clean', 'DIAMOND_BOX_4');
const sourceHintsDir = path.join('c:', 'mentos_os_clean', 'public', 'math_hints');
const avsPath = path.join('c:', 'mentos_os_clean', 'src', 'data', 'avs_answers.json');
const textsPath = path.join('c:', 'mentos_os_clean', 'src', 'data', 'math_problem_texts.json');

const units = ['고차방정식2단계', '고차방정식3단계'];

try {
    // 1. Create backup directory
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
        console.log(`Created directory: ${backupDir}`);
    }

    // 2. Backup hint folders
    const hintsBackup = path.join(backupDir, 'math_hints');
    if (!fs.existsSync(hintsBackup)) fs.mkdirSync(hintsBackup);

    units.forEach(unit => {
        const src = path.join(sourceHintsDir, unit);
        const dest = path.join(hintsBackup, unit);
        if (fs.existsSync(src)) {
            // Using xcopy or robocopy for recursive copy on Windows
            console.log(`Backing up hint folder: ${unit}`);
            execSync(`xcopy /E /I /Y "${src}" "${dest}"`);
        }
    });

    // 3. Backup AVS data (relevant slices)
    const avs = JSON.parse(fs.readFileSync(avsPath, 'utf8'));
    const avsBackup = {};
    units.forEach(unit => {
        if (avs[unit]) {
            avsBackup[unit] = avs[unit];
        }
    });
    fs.writeFileSync(path.join(backupDir, 'avs_answers_slice.json'), JSON.stringify(avsBackup, null, 2), 'utf8');
    console.log('Backed up AVS data slice.');

    // 4. Backup Problem Text data (relevant slices)
    const texts = JSON.parse(fs.readFileSync(textsPath, 'utf8'));
    const textsBackup = {};
    Object.keys(texts).forEach(key => {
        if (units.some(unit => key.startsWith(unit))) {
            textsBackup[key] = texts[key];
        }
    });
    fs.writeFileSync(path.join(backupDir, 'math_problem_texts_slice.json'), JSON.stringify(textsBackup, null, 2), 'utf8');
    console.log('Backed up Problem Text data slice.');

    // 5. Create a README to identify the content
    const readmeContent = `DIAMOND_BOX_4 (Back-up)
Created: ${new Date().toLocaleString()}
Content: Higher-Degree Equations (고차방정식) Level 2 & 3
Status: Finalized and Remedated.
Security: READ ONLY.
Do not modify without explicit instruction.`;
    fs.writeFileSync(path.join(backupDir, 'README.txt'), readmeContent, 'utf8');

    // 6. Set entire directory to READ ONLY (Windows command)
    console.log('Setting backup directory to READ-ONLY...');
    execSync(`attrib +R /S /D "${backupDir}\\*"`);
    
    console.log('DIAMOND_BOX_4 backup completed successfully.');

} catch (error) {
    console.error('Backup failed:', error.message);
}
