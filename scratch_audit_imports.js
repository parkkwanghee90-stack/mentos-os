import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, './src');

// Helper to check if path exists case-sensitively
function existsSyncCaseSensitive(filepath) {
  let dir = path.dirname(filepath);
  let base = path.basename(filepath);
  
  // Recursively check directory casing
  if (dir !== path.dirname(dir)) {
    if (!existsSyncCaseSensitive(dir)) return false;
  }
  
  try {
    const files = fs.readdirSync(dir);
    return files.includes(base);
  } catch (e) {
    return false;
  }
}

function resolveImportPath(importStr, currentFile) {
  let resolvedPath = '';
  if (importStr.startsWith('@/')) {
    resolvedPath = path.join(srcDir, importStr.substring(2));
  } else if (importStr.startsWith('./') || importStr.startsWith('../')) {
    resolvedPath = path.resolve(path.dirname(currentFile), importStr);
  } else {
    return null; // node_modules or third party
  }

  // Handle extension resolution like Vite
  const extensions = ['.jsx', '.js', '.json', '.css'];
  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
    // If it's a directory, check for index files
    for (const ext of extensions) {
      const indexPath = path.join(resolvedPath, 'index' + ext);
      if (fs.existsSync(indexPath)) return indexPath;
    }
  }

  for (const ext of ['', ...extensions]) {
    const testPath = resolvedPath + ext;
    if (fs.existsSync(testPath)) {
      return testPath;
    }
  }
  return resolvedPath; // Return resolved path even if not found to report it
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
  let match;
  const errors = [];

  while ((match = importRegex.exec(content)) !== null) {
    const importStr = match[1];
    const resolved = resolveImportPath(importStr, filePath);
    if (!resolved) continue;

    if (!fs.existsSync(resolved)) {
      errors.push({ importStr, resolved, error: 'File does not exist' });
    } else if (!existsSyncCaseSensitive(resolved)) {
      errors.push({ importStr, resolved, error: 'Case sensitivity mismatch' });
    }
  }
  return errors;
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') {
        walkDir(dirPath, callback);
      }
    } else {
      if (f.endsWith('.js') || f.endsWith('.jsx')) {
        callback(dirPath);
      }
    }
  });
}

const allErrors = [];
walkDir(srcDir, (filePath) => {
  const errors = scanFile(filePath);
  if (errors.length > 0) {
    allErrors.push({ file: path.relative(__dirname, filePath), errors });
  }
});

if (allErrors.length > 0) {
  console.log('🚨 IMPORT AUDIT FAILED:');
  allErrors.forEach(ae => {
    console.log(`\nFile: ${ae.file}`);
    ae.errors.forEach(e => {
      console.log(`  - Import: "${e.importStr}"`);
      console.log(`    Resolved: ${e.resolved}`);
      console.log(`    Error: ${e.error}`);
    });
  });
} else {
  console.log('✅ ALL IMPORTS ARE VALID AND CASE-SENSITIVE!');
}
