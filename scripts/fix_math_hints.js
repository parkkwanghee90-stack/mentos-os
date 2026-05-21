import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFolders = [
  'public/math_hints/삼각함수그래프3단계',
  'public/math_hints/삼각함수그래프'
];

// Robust un-escaping backslash normalizer
function normalizeBackslashes(rawText) {
  let fixed = rawText;
  const commands = [
    'times', 'text', 'therefore', 'triangle', 'theta', 'to', 'tan', 'sin', 'cos',
    'frac', 'forall', 'sqrt', 'pi', 'alpha', 'beta', 'gamma', 'delta', 'sigma',
    'begin', 'bigg', 'bf', 'bar', 'deg',
    'right', 'rho', 'rightarrow', 'rangle', 'left',
    'neq', 'nabla', 'nu', 'notin', 'nRightarrow',
    'cdots', 'vdots', 'ddots', 'v', 'quad', 'qquad', 'vec'
  ];

  for (const cmd of commands) {
    // Replace \macro with \\macro (if it's not already \\macro)
    // In JS string, \macro is often interpreted if it's \n, \t etc.
    // But \s, \c, \p are not.
    const reg = new RegExp(`\\\\${cmd}`, 'g');
    // If it's already \\cmd, don't change it? No, normalize to exactly \\cmd.
    // Actually, when reading a file as text, \sin is two characters: \ and s.
    // We want to make sure it's not just one character if it was a valid escape.
  }
  
  // Simple replacement: replace any single \ that is followed by a command with \\
  // Wait, if I read the file as UTF-8, and it has \sin, then it's fine as long as it's not a special escape.
  // The problem is when I WRITE the file.
  
  return rawText;
}

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Fix common su-shik issues
    content = content.replace(/\{ \$\$ \}/g, '$$$$');
    content = content.replace(/\{ \$\$\$ \}/g, '$$$$');
    
    // Ensure all macros have double backslashes in the JSON string
    // This is hard to do with regex without parsing.
    // Let's try to parse it. If it fails, it means there are single backslashes.
    try {
        JSON.parse(content);
        return false; // Already valid
    } catch (e) {
        // It's invalid. Likely due to single backslashes like \sin.
        // We need to escape them.
        let fixed = content.replace(/\\([a-zA-Z]+)/g, (match, p1) => {
            // If it's a known escape like \n, \t, keep it.
            if (['n', 'r', 't', 'b', 'f', 'v', 'u'].includes(p1[0])) return match;
            return '\\\\' + p1;
        });
        
        try {
            JSON.parse(fixed);
            fs.writeFileSync(filePath, fixed, 'utf-8');
            return true;
        } catch (e2) {
            console.error(`  Failed to fix ${path.basename(filePath)}: ${e2.message}`);
            return false;
        }
    }
}

async function main() {
    for (const folder of targetFolders) {
        const fullPath = path.join(__dirname, '..', folder);
        if (!fs.existsSync(fullPath)) continue;
        
        console.log(`Fixing folder: ${folder}`);
        const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.json'));
        
        let fixedCount = 0;
        for (const file of files) {
            if (fixFile(path.join(fullPath, file))) {
                fixedCount++;
            }
        }
        console.log(`  Fixed ${fixedCount} files in ${folder}`);
    }
}

main();
