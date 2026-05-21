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

        // Pattern 1: '... ${ ... } ... ' -> `... ${ ... } ... `
        content = content.replace(/'([^'\n]*\$\{[^}]+\}[^'\n]*)'/g, '`$1`');
        
        // Pattern 2: "... ${ ... } ... " -> `... ${ ... } ... `
        content = content.replace(/"([^"\n]*\$\{[^}]+\}[^"\n]*)"/g, '`$1`');
        
        // Special case: Multi-line strings that were broken
        // If a line starts with ' or " and ends with one but contains ${ and spans multiple lines
        // This is hard with regex, so we look for common ones
        
        // Fix the specific one in LlmPromptProvider
        content = content.replace(/const sysPrompt = '([^']*\$\{[^}]+\}[^']*)';/g, 'const sysPrompt = `$1`;');
        content = content.replace(/const userPrompt = "([^"]*\$\{[^}]+\}[^"]*)";/g, 'const userPrompt = `$1`;');

        if (content !== original) {
          fs.writeFileSync(full, content, 'utf-8');
          console.log(`✅ Fixed Template: ${path.relative(ROOT, full)}`);
        }
      }
    } catch (e) {
      // console.log(`⚠️ Failed: ${file}`);
    }
  }
}

walk(ROOT);
console.log('✨ Template literal restoration complete.');
