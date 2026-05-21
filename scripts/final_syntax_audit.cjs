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

        // Pattern: starts with ' or " but contains ${ ... }
        // Fix: Replace outer quotes with backticks
        content = content.replace(/(['"])([^'"]*\$\{.+?\}[^'"]*)(['"])/g, (match, open, inner, close) => {
            return `\`${inner}\``;
        });

        // Specific pattern fix for triggerAnimationHint leftovers if any
        content = content.replace(/const specificAnimKey = '([^']*\$\{.+?\}[^']*)";/g, 'const specificAnimKey = `$1`;');
        content = content.replace(/const genericAnimKey = "([^"]*\$\{.+?\}[^"]*)';/g, 'const genericAnimKey = `$1`;');

        if (content !== original) {
          fs.writeFileSync(full, content, 'utf-8');
          console.log(`✅ Fixed Interpolation: ${path.relative(ROOT, full)}`);
        }
      }
    } catch (e) {
      // ignore errors
    }
  }
}

walk(ROOT);
console.log('✨ Final syntax audit complete.');
