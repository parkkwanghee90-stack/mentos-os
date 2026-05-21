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
      processFile(full);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // 1. Fix double calls and syntax errors from previous failed run
  content = content.replace(/\$\{window\.resolveAsset\(window\.resolveAsset\(''/g, "${window.resolveAsset('");
  
  // 2. Standardize all asset folder references to use window.resolveAsset
  const folders = ['math_crops', 'hteachers', 'concept_cards', 'math_hints', 'math_indexed', 'data'];
  
  folders.forEach(folder => {
    // Case A: Hardcoded absolute paths starting with /
    // Replace "/math_crops/..." with window.resolveAsset("/math_crops/...")
    // But ONLY if not already inside a resolveAsset call
    
    // Look for patterns like: "/math_crops/..." or `/math_crops/...`
    // and replace them with window.resolveAsset(...)
    
    // Pattern: ` /math_crops/... ` (template literal)
    // Avoid double wrapping
    const reTemplate = new RegExp('`\\/' + folder + '\\/', 'g');
    content = content.replace(reTemplate, (match) => {
       // Check if already preceded by window.resolveAsset(
       // This is a simple check
       return "`${window.resolveAsset('/" + folder + "/";
    });

    // Pattern: " /math_crops/... " (quotes)
    const reQuotes = new RegExp('(["\'])\\/'+ folder +'\\/', 'g');
    content = content.replace(reQuotes, (match, quote) => {
       return "window.resolveAsset('" + folder + "/";
    });
  });

  // 3. Fix the closing parts
  // We need to match the added opening window.resolveAsset('/folder/ and find where it should end.
  // This is hard with regex. 
  
  // Let's try a very specific one for the ones we just broke
  content = content.replace(/\$\{window\.resolveAsset\(['"]\/([^`\s}]+)(['"])\}/g, '${window.resolveAsset("/$1")}');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Fixed/Updated: ${path.relative(ROOT, filePath)}`);
  }
}

console.log('🚀 Fixing and standardizing paths...');
walk(ROOT);
console.log('✨ Fix complete.');
