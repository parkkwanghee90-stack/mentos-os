const fs = require('fs');
const path = require('path');

const action = process.argv[2];
const hintsDir = path.join(__dirname, '../public/math_hints');
const backupDir = 'C:\\math_hints_temp_backup';
const oldPublicBackup = path.join(__dirname, '../public/math_hints_temp_backup');
const oldRootBackup = path.join(__dirname, '../math_hints_temp_backup');

const cropsDir = path.join(__dirname, '../public/math_crops');
const cropsBackupDir = 'C:\\math_crops_temp_backup';
const oldCropsBackup = path.join(__dirname, '../math_crops_temp_backup');

// Move existing backup in public to C:\ if present
if (fs.existsSync(oldPublicBackup)) {
  console.log('Detecting backup in public. Moving it to C:\\...');
  if (fs.existsSync(backupDir)) {
    fs.rmSync(backupDir, { recursive: true, force: true });
  }
  fs.renameSync(oldPublicBackup, backupDir);
  console.log('Successfully moved public backup to C:\\!');
}

// Move existing backup in root to C:\ if present
if (fs.existsSync(oldRootBackup)) {
  console.log('Detecting backup in root. Moving it to C:\\...');
  if (fs.existsSync(backupDir)) {
    fs.rmSync(backupDir, { recursive: true, force: true });
  }
  fs.renameSync(oldRootBackup, backupDir);
  console.log('Successfully moved root backup to C:\\!');
}

const keepPrefixes = ['poly_s', 'remain_s', 'factor_s', 'complex_s', 'quad_eq_s', 'quad_func_s'];

if (action === 'move') {
  console.log('--- [Move Action] Temproarily moving non-High1 Math Sang chapters to backup folder ---');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // 1. Move math_hints
  if (fs.existsSync(hintsDir)) {
    const items = fs.readdirSync(hintsDir);
    let moveCount = 0;
    for (const item of items) {
      const itemPath = path.join(hintsDir, item);
      if (fs.statSync(itemPath).isDirectory()) {
        const shouldKeep = keepPrefixes.some(p => item.startsWith(p));
        if (!shouldKeep) {
          const destPath = path.join(backupDir, item);
          fs.renameSync(itemPath, destPath);
          moveCount++;
        }
      }
    }
    console.log(`Successfully evacuated ${moveCount} directories from math_hints to backup.`);
  }

  // 2. Move math_crops entirely to C:\
  if (fs.existsSync(cropsDir)) {
    console.log('Evacuating math_crops folder to C:\\...');
    if (fs.existsSync(cropsBackupDir)) {
      fs.rmSync(cropsBackupDir, { recursive: true, force: true });
    }
    fs.renameSync(cropsDir, cropsBackupDir);
    console.log('Successfully evacuated math_crops entirely to C:\\!');
  }
} else if (action === 'restore') {
  console.log('--- [Restore Action] Moving directories back to original location ---');
  
  // 1. Restore math_hints
  if (fs.existsSync(backupDir)) {
    const items = fs.readdirSync(backupDir);
    let restoreCount = 0;
    for (const item of items) {
      const itemPath = path.join(backupDir, item);
      if (fs.statSync(itemPath).isDirectory()) {
        const destPath = path.join(hintsDir, item);
        fs.renameSync(itemPath, destPath);
        restoreCount++;
      }
    }
    console.log(`Successfully restored ${restoreCount} directories to math_hints.`);
    try {
      fs.rmSync(backupDir, { recursive: true, force: true });
    } catch (e) {}
  }

  // 2. Restore math_crops from C:\
  if (fs.existsSync(cropsBackupDir)) {
    console.log('Restoring math_crops folder from C:\\...');
    if (fs.existsSync(cropsDir)) {
      fs.rmSync(cropsDir, { recursive: true, force: true });
    }
    fs.renameSync(cropsBackupDir, cropsDir);
    console.log('Successfully restored math_crops entirely!');
  }
} else {
  console.log('Invalid action. Use "move" or "restore".');
}
