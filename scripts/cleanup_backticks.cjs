const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'src');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (/\.(jsx|js|tsx|ts)$/.test(file)) {
      let content = fs.readFileSync(full, 'utf-8');
      let original = content;

      // Pattern: `window.resolveAsset
      // We want to replace it with window.resolveAsset
      // Also handles case where it's inside ${} but someone messed up the backticks
      
      // Fix leading backtick
      content = content.replace(/`window\.resolveAsset/g, 'window.resolveAsset');
      
      // Fix cases like: image: window.resolveAsset(`/path/to/img`),
      // If there was a trailing backtick before the comma or newline that shouldn't be there
      // e.g. window.resolveAsset(...)`
      content = content.replace(/(window\.resolveAsset\([^)]+\))`([,;\n\s])/g, '$1$2');

      if (content !== original) {
        fs.writeFileSync(full, content, 'utf-8');
        console.log(`✅ Fixed: ${path.relative(ROOT, full)}`);
      }
    }
  }
}

walk(ROOT);
console.log('✨ Cleanup complete.');
