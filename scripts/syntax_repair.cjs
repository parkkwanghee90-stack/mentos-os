const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'src');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    try {
      if (fs.statSync(full).isDirectory()) {
        walk(full);
      } else if (/\.(jsx|js|tsx|ts)$/.test(file)) {
        let content = fs.readFileSync(full, 'utf-8');
        let original = content;

        // 1. Remove quotes around window.resolveAsset if they exist
        // image: `window.resolveAsset('/path')` -> image: window.resolveAsset('/path')
        content = content.replace(/['"`](window\.resolveAsset\([^)]+\))['"`]/g, '$1');

        // 2. Fix internal strings of window.resolveAsset
        // Pattern: window.resolveAsset('...`) or window.resolveAsset(`...") etc.
        // We look specifically inside the parenthesis
        content = content.replace(/window\.resolveAsset\((['"`])(.*?)(\$\{.*?\})?(.*?)(['"`])\)/g, (match, open, p1, p2, p3, close) => {
           const fullText = p1 + (p2 || '') + (p3 || '');
           if (fullText.includes('${')) {
              return `window.resolveAsset(\`${fullText}\`)`;
           }
           return `window.resolveAsset('${fullText}')`;
        });
        
        // Manual fix for the messy ones I saw in ClassRoom_Mobile
        // currentProblemImage = window.resolveAsset('/path/${var}.webp")
        // The regex above might be too complex. Let's do simpler ones.
        
        // Fix strings that start with ' but contain ${ and end with ` or "
        content = content.replace(/window\.resolveAsset\('([^']*)(\$\{[^}]+\})([^']*)(['"`])\)/g, 'window.resolveAsset(`$1$2$3`)');
        content = content.replace(/window\.resolveAsset\("([^"]*)(\$\{[^}]+\})([^"]*)(['"`])\)/g, 'window.resolveAsset(`$1$2$3`)');
        content = content.replace(/window\.resolveAsset\(`([^`]*)(\$\{[^}]+\})([^`]*)(['"`])\)/g, 'window.resolveAsset(`$1$2$3`)');

        // 3. Fix mixed quotes in includes() or other simple strings
        // includes(`시그마') -> includes('시그마')
        content = content.replace(/\.includes\((['"`])([^'"`]*)(['"`])\)/g, (match, open, text, close) => {
           return `.includes('${text}')`;
        });

        if (content !== original) {
          fs.writeFileSync(full, content, 'utf-8');
          console.log(`✅ Fixed Syntax: ${path.relative(ROOT, full)}`);
        }
      }
    } catch (e) {
       console.log(`⚠️ Error in ${file}: ${e.message}`);
    }
  }
}

walk(ROOT);
console.log('✨ Syntax-only repair complete.');
