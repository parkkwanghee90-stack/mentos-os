const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../dist');
const destDir = path.join(__dirname, '../.vercel/output/static');

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach(element => {
    const srcPath = path.join(from, element);
    const destPath = path.join(to, element);
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (err) {
        console.warn(`[Warn] Overwrite retry for ${element}:`, err.message);
        try {
          fs.unlinkSync(destPath);
          fs.copyFileSync(srcPath, destPath);
        } catch (retryErr) {
          console.error(`[Error] Copy failed for ${element}:`, retryErr.message);
        }
      }
    }
  });
}

console.log('⚡ Starting Node.js Deploy Copy Helper...');
try {
  copyFolderSync(srcDir, destDir);
  console.log('✅ Successfully copied all dist assets to .vercel/output/static!');
} catch (err) {
  console.error('❌ Error during copy:', err.message);
}
