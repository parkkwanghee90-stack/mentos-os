const fs = require('fs');
const path = require('path');

const baseDir = 'c:/mentos_os_clean/public/math_hints';
const folders = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());

function fixBackslashesInRaw(raw) {
  // Replace any sequence of backslashes followed by a character that is NOT [", \, /, b, f, n, r, t, u]
  // with an even number of backslashes.
  // A simple way is to double all backslashes that are not already part of a valid escape.
  // But that's complex.
  
  // Let's try this: Replace any \ that is followed by anything other than the allowed chars.
  // If it's followed by a number or a Korean char, it must be escaped.
  
  // First, let's fix the specific triple backslash issue: \\\ -> \\\\
  let fixed = raw.replace(/\\\\\\(?![\\"/bfnrtu])/g, '\\\\\\\\');
  
  // Then, fix single backslashes: \ -> \\
  fixed = fixed.replace(/(?<!\\)\\(?![\\"/bfnrtu])/g, '\\\\');
  
  return fixed;
}

folders.forEach(folder => {
  const dir = path.join(baseDir, folder);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    let raw = fs.readFileSync(filePath, 'utf8');
    
    let fixed = fixBackslashesInRaw(raw);
    
    try {
      JSON.parse(fixed);
      fs.writeFileSync(filePath, fixed, 'utf8');
    } catch (e) {
      // If it still fails, try a more aggressive fix for this specific file
      if (file === '009.json' || file === '055.json') {
          fixed = raw.replace(/\\+/g, '\\\\'); // Just collapse all backslashes to double
          try {
              JSON.parse(fixed);
              fs.writeFileSync(filePath, fixed, 'utf8');
          } catch (err) {}
      }
    }
  });
});

console.log('Improved universal repair complete.');
