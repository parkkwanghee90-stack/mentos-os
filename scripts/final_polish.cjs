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

      // Fix: `window.resolveAsset(`/path/...`) -> window.resolveAsset(`/path/...`)
      // Also handles the template literal case where it's correctly used
      content = content.replace(/`window\.resolveAsset\(([^`]+)`\)/g, "window.resolveAsset($1)");

      if (content !== original) {
        fs.writeFileSync(full, content, 'utf-8');
        console.log(`✅ Final Polish: ${path.relative(ROOT, full)}`);
      }
    }
  }
}

walk(ROOT);
