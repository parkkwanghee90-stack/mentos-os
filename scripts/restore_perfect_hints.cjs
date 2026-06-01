const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'assets_backup', 'math_hints_backup_su1');
const destDir = path.join(__dirname, '..', 'public', 'math_hints');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(srcDir)) {
  console.error(`Source directory does not exist: ${srcDir}`);
  process.exit(1);
}

console.log('Starting full restore of perfected math hints with pristine Korean encoding...');

const folders = fs.readdirSync(srcDir);
let successCount = 0;

for (const folder of folders) {
  const srcPath = path.join(srcDir, folder);
  const destPath = path.join(destDir, folder);
  
  if (fs.statSync(srcPath).isDirectory()) {
    console.log(`Restoring perfected folder: ${folder} ...`);
    if (fs.existsSync(destPath)) {
      fs.rmSync(destPath, { recursive: true, force: true });
    }
    copyRecursiveSync(srcPath, destPath);
    successCount++;
  }
}

console.log(`Successfully restored ${successCount} perfected folders!`);
