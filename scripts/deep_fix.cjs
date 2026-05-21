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

      // Fix: ${window.resolveAsset(`//path... -> window.resolveAsset(`/path...`)
      content = content.replace(/\$\{window\.resolveAsset\(`\/\/([^`]+)`\s*;?/g, (match, p1) => {
         return "window.resolveAsset(`/" + p1 + "`)";
      });
      
      // Also catch the ones without the closing brace if they exist
      content = content.replace(/\$\{window\.resolveAsset\(`\/\/([^`\n]+)/g, (match, p1) => {
         return "window.resolveAsset(`/" + p1 + "`)";
      });

      if (content !== original) {
        fs.writeFileSync(full, content, 'utf-8');
        console.log(`✅ Deep Fixed: ${path.relative(ROOT, full)}`);
      }
    }
  }
}

walk(ROOT);
