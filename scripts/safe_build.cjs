const fs = require('fs');
const { execSync } = require('child_process');

console.log('--- Preparing safe build (bypassing heavy public directories copy) ---');
let hintsMoved = false;
let cropsMoved = false;

try {
  if (fs.existsSync('public/math_hints')) {
    fs.renameSync('public/math_hints', 'public/_temp_math_hints');
    hintsMoved = true;
    console.log('  Moved math_hints to _temp_math_hints');
  }
  if (fs.existsSync('public/math_crops')) {
    fs.renameSync('public/math_crops', 'public/_temp_math_crops');
    cropsMoved = true;
    console.log('  Moved math_crops to _temp_math_crops');
  }

  console.log('--- Running vite build ---');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('--- Build Succeeded ---');
} catch (e) {
  console.error('  ❌ Build Failed:', e.message);
} finally {
  console.log('--- Restoring directories ---');
  if (hintsMoved && fs.existsSync('public/_temp_math_hints')) {
    fs.renameSync('public/_temp_math_hints', 'public/math_hints');
    console.log('  Restored math_hints');
  }
  if (cropsMoved && fs.existsSync('public/_temp_math_crops')) {
    fs.renameSync('public/_temp_math_crops', 'public/math_crops');
    console.log('  Restored math_crops');
  }
}
